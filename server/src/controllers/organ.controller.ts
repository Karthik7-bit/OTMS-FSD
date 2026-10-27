import { Request, Response } from 'express';
import { PrismaClient, OrganStatus } from '@prisma/client';

const prisma = new PrismaClient();

export const getAllOrgans = async (req: Request, res: Response) => {
  try {
    const organs = await prisma.organ.findMany({
      include: {
        donor: { include: { user: { select: { fullName: true } } } },
        hospital: { select: { name: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    return res.json({ success: true, data: organs });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const createOrgan = async (req: any, res: Response) => {
  try {
    const { donorId, hospitalId, organType, bloodGroup, location, expiryDate } = req.body;
    
    // In a real app, we verify the user is a doctor at this hospital
    if (req.user.role !== 'DOCTOR' && req.user.role !== 'ADMIN' && req.user.role !== 'DONOR') {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    let actualDonorId = donorId;
    if (req.user.role === 'DONOR') {
      let donorProfile = await prisma.donor.findUnique({ where: { userId: req.user.userId } });
      if (!donorProfile) {
        donorProfile = await prisma.donor.create({
          data: {
            userId: req.user.userId,
            bloodGroup: bloodGroup || 'O_POS',
            dateOfBirth: new Date('1990-01-01'),
            gender: 'Unknown',
            city: 'Unknown',
            address: 'Unknown',
            medicalStatus: 'Healthy',
            consentStatus: true
          }
        });
      }
      actualDonorId = donorProfile.id;
    }

    if (!actualDonorId) {
      const defaultDonor = await prisma.donor.findFirst();
      if (defaultDonor) {
        actualDonorId = defaultDonor.id;
      }
    }

    const organ = await prisma.organ.create({
      data: {
        donorId: actualDonorId,
        hospitalId: hospitalId,
        organType,
        bloodGroup,
        location,
        expiryDate: new Date(expiryDate),
        retrievalDate: new Date(),
        availabilityStatus: OrganStatus.AVAILABLE
      }
    });

    return res.status(201).json({ success: true, data: organ });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const updateOrganStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const organ = await prisma.organ.update({
      where: { id: id },
      data: { availabilityStatus: status }
    });

    return res.json({ success: true, data: organ });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getHospitals = async (req: Request, res: Response) => {
  try {
    const hospitals = await prisma.hospital.findMany();
    return res.json({ success: true, data: hospitals });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};
