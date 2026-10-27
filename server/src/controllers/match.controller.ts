import { Request, Response } from 'express';
import { PrismaClient, MatchStatus } from '@prisma/client';

const prisma = new PrismaClient();

const isBloodCompatible = (donor: string, recipient: string) => {
  if (donor === recipient) return { compatible: true, exact: true };
  if (recipient === 'AB_POS') return { compatible: true, exact: false };
  if (donor === 'O_NEG') return { compatible: true, exact: false };
  if (donor === 'O_POS' && recipient.endsWith('_POS')) return { compatible: true, exact: false };
  if (donor === 'A_NEG' && (recipient.startsWith('A_') || recipient.startsWith('AB_'))) return { compatible: true, exact: false };
  if (donor === 'A_POS' && (recipient === 'A_POS' || recipient === 'AB_POS')) return { compatible: true, exact: false };
  if (donor === 'B_NEG' && (recipient.startsWith('B_') || recipient.startsWith('AB_'))) return { compatible: true, exact: false };
  if (donor === 'B_POS' && (recipient === 'B_POS' || recipient === 'AB_POS')) return { compatible: true, exact: false };
  if (donor === 'AB_NEG' && recipient === 'AB_POS') return { compatible: true, exact: false };
  return { compatible: false, exact: false };
};

export const runMatching = async (req: any, res: Response) => {
  try {
    if (req.user.role !== 'DOCTOR' && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const { organId } = req.body;
    
    const organ = await prisma.organ.findUnique({ where: { id: organId } });
    if (!organ || organ.availabilityStatus !== 'AVAILABLE') {
      return res.status(400).json({ success: false, message: 'Organ not available' });
    }

    // Clear out ANY previous matches for this specific organ to avoid stale or duplicate entries
    await prisma.match.deleteMany({
      where: { organId: organ.id }
    });

    const requests = await prisma.transplantRequest.findMany({
      where: { 
        organType: organ.organType, 
        status: 'PENDING',
        recipient: { status: 'ACTIVE' }
      },
      include: { recipient: true }
    });

    // Deduplicate requests by recipientId - each patient should only appear ONCE in the match results
    const recipientMap = new Map<string, typeof requests[0]>();
    for (const r of requests) {
      const existing = recipientMap.get(r.recipientId);
      if (!existing || (r.urgencyLevel + r.medicalPriority > existing.urgencyLevel + existing.medicalPriority)) {
        recipientMap.set(r.recipientId, r);
      }
    }
    const uniqueRequests = Array.from(recipientMap.values());

    const matches = [];

    for (const reqItem of uniqueRequests) {
      let score = 0;
      
      const { compatible, exact } = isBloodCompatible(organ.bloodGroup, reqItem.recipient.bloodGroup);
      const bloodGroupScore = exact ? 50 : (compatible ? 35 : 20);
      score += bloodGroupScore;

      // Urgency scaling (1 to 10 scaled)
      const urgencyScore = reqItem.urgencyLevel * 3;
      score += urgencyScore;
      
      // Medical priority (1 to 10 scaled)
      const medicalPriorityScore = reqItem.medicalPriority * 2;
      score += medicalPriorityScore;

      matches.push({
        organId: organ.id,
        recipientId: reqItem.recipient.id,
        compatibilityScore: score,
        bloodGroupScore: bloodGroupScore,
        organTypeScore: 0,
        urgencyScore: urgencyScore,
        medicalPriorityScore: medicalPriorityScore,
        waitingTimeScore: 0,
        locationScore: 0,
        status: MatchStatus.PENDING
      });
    }

    if (matches.length === 0) {
      return res.json({ success: true, data: [], message: 'Found 0 potential matches' });
    }

    // Save matches
    const createdMatches = await prisma.$transaction(
      matches.map(match => prisma.match.create({ data: match }))
    );

    return res.json({ success: true, data: createdMatches, message: `Found ${createdMatches.length} potential matches` });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getMatches = async (req: Request, res: Response) => {
  try {
    const matches = await prisma.match.findMany({
      include: {
        organ: { include: { hospital: true } },
        recipient: { include: { user: { select: { fullName: true } } } }
      },
      orderBy: [
        { status: 'asc' }, // PENDING first
        { compatibilityScore: 'desc' }
      ]
    });
    return res.json({ success: true, data: matches });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const allocateMatch = async (req: any, res: Response) => {
  try {
    if (req.user.role !== 'DOCTOR' && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const { id } = req.params;

    const match = await prisma.match.findUnique({ where: { id: id } });
    if (!match) return res.status(404).json({ success: false, message: 'Match record not found' });

    if (match.status === 'ACCEPTED') {
      return res.status(400).json({ success: false, message: 'This match has already been authorized and allocated.' });
    }

    const doctorUserId = req.user.id || req.user.userId;

    // Perform the allocation inside a transaction to ensure data integrity
    await prisma.$transaction(async (tx) => {
      // 1. Accept this match
      await tx.match.update({
        where: { id: match.id },
        data: { status: 'ACCEPTED' }
      });

      // 2. Reject all other candidate matches for this specific organ
      await tx.match.updateMany({
        where: { organId: match.organId, id: { not: match.id } },
        data: { status: 'REJECTED' }
      });

      // 3. Mark the organ as ALLOCATED
      await tx.organ.update({
        where: { id: match.organId },
        data: { availabilityStatus: 'ALLOCATED' }
      });

      // 4. Mark all pending transplant requests for this recipient of this organType as MATCHED
      const organ = await tx.organ.findUnique({ where: { id: match.organId } });
      if (organ) {
        await tx.transplantRequest.updateMany({
          where: { 
            recipientId: match.recipientId, 
            organType: organ.organType,
            status: 'PENDING' 
          },
          data: { status: 'MATCHED' }
        });
      }

      // 5. Update recipient status to MATCHED
      await tx.recipient.update({
        where: { id: match.recipientId },
        data: { status: 'MATCHED' }
      });

      // 6. Create formal Allocation audit record
      await tx.allocation.create({
        data: {
          organId: match.organId,
          recipientId: match.recipientId,
          approvedBy: doctorUserId,
          approvalStatus: 'APPROVED',
          allocationDate: new Date(),
          notes: `Clinically authorized allocation via OTMS Matching Engine (Score: ${match.compatibilityScore}).`
        }
      });
    });

    return res.json({ success: true, message: 'Organ successfully authorized and allocated to recipient.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error during allocation processing' });
  }
};
