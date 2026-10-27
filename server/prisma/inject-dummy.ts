// @ts-nocheck
import { PrismaClient, Role, OrganType, BloodGroup, OrganStatus, RequestStatus } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Injecting MORE dummy data for testing...');

  const passwordHash = await bcrypt.hash('password123', 10);
  let hospital = await prisma.hospital.findFirst();
  
  if (!hospital) {
    hospital = await prisma.hospital.create({
      data: { name: 'City General Hospital', address: '123 Medical Way', city: 'Metropolis', phone: '555-0101', email: 'contact@citygeneral.com' }
    });
  }

  // A Doctor
  const doctor = await prisma.user.upsert({
    where: { email: 'doctor2@demo.com' },
    update: {},
    create: {
      fullName: 'Dr. Meredith Grey', email: 'doctor2@demo.com', phone: '111-444-5555', passwordHash, role: Role.DOCTOR,
      doctor: { create: { specialization: 'Cardiothoracic', licenseNumber: 'MD-999', hospitalId: hospital.id } }
    }
  });

  const donorsData = [
    { name: 'Charlie Davis', email: 'charlie@demo.com', bg: BloodGroup.A_POS, organ: OrganType.HEART },
    { name: 'Diana Prince', email: 'diana@demo.com', bg: BloodGroup.AB_POS, organ: OrganType.LIVER },
    { name: 'Evan Wright', email: 'evan@demo.com', bg: BloodGroup.O_NEG, organ: OrganType.LUNG },
    { name: 'Fiona Gallagher', email: 'fiona@demo.com', bg: BloodGroup.B_POS, organ: OrganType.KIDNEY }
  ];

  for (const d of donorsData) {
    const user = await prisma.user.upsert({
      where: { email: d.email },
      update: {},
      create: {
        fullName: d.name, email: d.email, phone: '555-000-0000', passwordHash, role: Role.DONOR,
        donor: {
          create: { bloodGroup: d.bg, gender: 'Unknown', city: 'Metropolis', address: 'Unknown', dateOfBirth: new Date('1990-01-01'), medicalStatus: 'Healthy', consentStatus: true }
        }
      },
      include: { donor: true }
    });

    if (user.donor) {
      await prisma.organ.create({
        data: {
          donorId: user.donor.id, hospitalId: hospital.id, organType: d.organ, bloodGroup: d.bg,
          location: hospital.name, availabilityStatus: OrganStatus.AVAILABLE,
          retrievalDate: new Date(), expiryDate: new Date(Date.now() + 48 * 60 * 60 * 1000)
        }
      });
    }
  }

  const recipientsData = [
    { name: 'George Miller', email: 'george@demo.com', bg: BloodGroup.A_POS, organ: OrganType.HEART, urgency: 10, prio: 9 },
    { name: 'Hannah Abbott', email: 'hannah@demo.com', bg: BloodGroup.AB_POS, organ: OrganType.LIVER, urgency: 7, prio: 6 },
    { name: 'Ian Malcolm', email: 'ian@demo.com', bg: BloodGroup.O_NEG, organ: OrganType.LUNG, urgency: 8, prio: 8 },
    { name: 'Julia Roberts', email: 'julia@demo.com', bg: BloodGroup.B_POS, organ: OrganType.KIDNEY, urgency: 5, prio: 5 },
    { name: 'Kevin Hart', email: 'kevin@demo.com', bg: BloodGroup.O_NEG, organ: OrganType.LUNG, urgency: 9, prio: 9 } // Competing for the lung!
  ];

  for (const r of recipientsData) {
    const user = await prisma.user.upsert({
      where: { email: r.email },
      update: {},
      create: {
        fullName: r.name, email: r.email, phone: '555-111-1111', passwordHash, role: Role.RECIPIENT,
        recipient: {
          create: { bloodGroup: r.bg, gender: 'Unknown', city: 'Metropolis', address: 'Unknown', dateOfBirth: new Date('1980-01-01'), medicalCondition: 'Critical condition', urgencyLevel: r.urgency, medicalPriority: r.prio }
        }
      },
      include: { recipient: true }
    });

    if (user.recipient) {
      const existingReq = await prisma.transplantRequest.findFirst({
        where: { recipientId: user.recipient.id, organType: r.organ }
      });
      if (!existingReq) {
        await prisma.transplantRequest.create({
          data: {
            recipientId: user.recipient.id, hospitalId: hospital.id, organType: r.organ,
            urgencyLevel: r.urgency, medicalPriority: r.prio, medicalInformation: 'Requires transplant immediately.', status: RequestStatus.PENDING
          }
        });
      }
    }
  }

  console.log('Successfully injected massive dummy data load!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .then(async () => {
    await prisma.$disconnect();
  });
