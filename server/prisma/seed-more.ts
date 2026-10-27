import { PrismaClient, OrganType, BloodGroup, OrganStatus, RequestStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function seedMore() {
  const doctor = await prisma.user.findFirst({ where: { role: 'DOCTOR' }, include: { doctor: true } });
  const donor = await prisma.user.findFirst({ where: { role: 'DONOR' }, include: { donor: true } });
  const recipient = await prisma.user.findFirst({ where: { role: 'RECIPIENT' }, include: { recipient: true } });
  const hospital = await prisma.hospital.findFirst();

  if (donor?.donor && hospital) {
    await prisma.organ.create({
      data: {
        donorId: donor.donor.id,
        hospitalId: hospital.id,
        organType: OrganType.KIDNEY,
        bloodGroup: BloodGroup.O_POS,
        location: 'Storage Unit A',
        availabilityStatus: OrganStatus.AVAILABLE,
        retrievalDate: new Date(),
        expiryDate: new Date(Date.now() + 48 * 60 * 60 * 1000)
      }
    });
  }

  if (recipient?.recipient && hospital) {
    const existingReq = await prisma.transplantRequest.findFirst({
      where: { recipientId: recipient.recipient.id, organType: OrganType.KIDNEY, status: RequestStatus.PENDING }
    });
    if (!existingReq) {
      await prisma.transplantRequest.create({
        data: {
          recipientId: recipient.recipient.id,
          hospitalId: hospital.id,
          organType: OrganType.KIDNEY,
          urgencyLevel: 8,
          medicalPriority: 9,
          medicalInformation: 'End stage renal failure. Immediate transplant required.',
          status: RequestStatus.PENDING
        }
      });
    }
  }
  console.log('Seeded organs and requests!');
}

seedMore().then(() => prisma.$disconnect()).catch((e) => { console.error(e); });
