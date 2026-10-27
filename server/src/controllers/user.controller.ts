import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getAllUsers = async (req: any, res: Response) => {
  try {
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Unauthorized. Admin access required.' });
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getDonors = async (req: Request, res: Response) => {
  try {
    const donors = await prisma.donor.findMany({
      include: {
        user: {
          select: { fullName: true, email: true, phone: true }
        }
      }
    });
    res.json({ success: true, data: donors });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getRecipients = async (req: Request, res: Response) => {
  try {
    const recipients = await prisma.recipient.findMany({
      include: {
        user: {
          select: { fullName: true, email: true, phone: true }
        }
      }
    });
    res.json({ success: true, data: recipients });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
