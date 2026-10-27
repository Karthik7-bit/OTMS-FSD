import { Request, Response } from 'express';
import { PrismaClient, RequestStatus } from '@prisma/client';

const prisma = new PrismaClient();

export const getAllRequests = async (req: Request, res: Response) => {
  try {
    const requests = await prisma.transplantRequest.findMany({
      include: {
        recipient: { include: { user: { select: { fullName: true } } } },
        hospital: { select: { name: true } }
      },
      orderBy: { urgencyLevel: 'desc' }
    });
    return res.json({ success: true, data: requests });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const createRequest = async (req: any, res: Response) => {
  try {
    const { recipientId, hospitalId, organType, urgencyLevel, medicalPriority, medicalInformation } = req.body;
    
    if (req.user.role !== 'DOCTOR' && req.user.role !== 'ADMIN' && req.user.role !== 'RECIPIENT') {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    let actualRecipientId = recipientId;
    if (req.user.role === 'RECIPIENT') {
      let recipientProfile = await prisma.recipient.findUnique({ where: { userId: req.user.userId } });
      if (!recipientProfile) {
        recipientProfile = await prisma.recipient.create({
          data: {
            userId: req.user.userId,
            bloodGroup: 'O_POS', 
            dateOfBirth: new Date('1990-01-01'),
            gender: 'Unknown',
            city: 'Unknown',
            address: 'Unknown',
            medicalCondition: medicalInformation || 'Unknown',
            urgencyLevel: Number(urgencyLevel) || 5,
            medicalPriority: Number(medicalPriority) || 5,
          }
        });
      }
      actualRecipientId = recipientProfile.id;
    }

    if (!actualRecipientId) {
      const defaultRecipient = await prisma.recipient.findFirst();
      if (defaultRecipient) {
        actualRecipientId = defaultRecipient.id;
      }
    }

    const transplantReq = await prisma.transplantRequest.create({
      data: {
        recipientId: actualRecipientId,
        hospitalId: hospitalId,
        organType,
        urgencyLevel: Number(urgencyLevel),
        medicalPriority: Number(medicalPriority),
        medicalInformation,
        status: RequestStatus.PENDING
      }
    });

    return res.status(201).json({ success: true, data: transplantReq });
  } catch (error) {
    console.error("CREATE REQUEST ERROR:", error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const updateRequestStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const transplantReq = await prisma.transplantRequest.update({
      where: { id: id },
      data: { status }
    });

    return res.json({ success: true, data: transplantReq });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};
