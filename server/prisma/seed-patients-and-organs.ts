import { PrismaClient, OrganType, BloodGroup, OrganStatus, RequestStatus, Role } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding additional patients, transplant requests, and available organs...');

  const hospital = await prisma.hospital.findFirst();
  if (!hospital) {
    throw new Error('Hospital record not found');
  }

  // Ensure a default donor exists for procuring organs
  let donorUser = await prisma.user.findFirst({ where: { role: Role.DONOR }, include: { donor: true } });
  if (!donorUser || !donorUser.donor) {
    const passwordHash = await bcrypt.hash('password123', 10);
    donorUser = await prisma.user.create({
      data: {
        fullName: 'Central Organ Procurement Registry',
        email: 'organ.registry@otms.com',
        phone: '+1-555-0199',
        passwordHash,
        role: Role.DONOR,
        donor: {
          create: {
            dateOfBirth: new Date('1985-06-15'),
            gender: 'Non-Binary',
            bloodGroup: BloodGroup.O_NEG,
            city: hospital.city,
            address: 'Transplant Procurement Unit',
            medicalStatus: 'Certified Cadaveric Donor Registry',
            consentStatus: true
          }
        }
      },
      include: { donor: true }
    });
  }

  const donorId = donorUser.donor!.id;

  // 1. Fresh Patients Data
  const patientData = [
    {
      fullName: 'Arthur Pendelton',
      email: 'arthur.p@otms.com',
      phone: '+1-555-2101',
      bloodGroup: BloodGroup.A_POS,
      city: hospital.city,
      medicalCondition: 'End-stage renal disease stage 5 (ESRD) on hemodialysis',
      urgencyLevel: 9,
      medicalPriority: 9,
      organType: OrganType.KIDNEY,
      requestNote: 'Patient sensitized; awaiting compatible deceased donor kidney.'
    },
    {
      fullName: 'Elena Rostova',
      email: 'elena.r@otms.com',
      phone: '+1-555-2102',
      bloodGroup: BloodGroup.O_POS,
      city: hospital.city,
      medicalCondition: 'Acute dilated cardiomyopathy with cardiogenic shock (Status 1A)',
      urgencyLevel: 10,
      medicalPriority: 10,
      organType: OrganType.HEART,
      requestNote: 'ECMO and intra-aortic balloon pump bridge-to-transplant; priority 1A.'
    },
    {
      fullName: 'Marcus Vance',
      email: 'marcus.v@otms.com',
      phone: '+1-555-2103',
      bloodGroup: BloodGroup.B_POS,
      city: hospital.city,
      medicalCondition: 'Decompensated hepatic cirrhosis secondary to NASH, MELD-Na 34',
      urgencyLevel: 8,
      medicalPriority: 9,
      organType: OrganType.LIVER,
      requestNote: 'High MELD score with recurrent refractory ascites.'
    },
    {
      fullName: 'Priya Sharma',
      email: 'priya.s@otms.com',
      phone: '+1-555-2104',
      bloodGroup: BloodGroup.AB_POS,
      city: hospital.city,
      medicalCondition: 'Idiopathic pulmonary fibrosis with severe hypoxic respiratory failure',
      urgencyLevel: 8,
      medicalPriority: 8,
      organType: OrganType.LUNG,
      requestNote: 'Continuous high-flow oxygen requirement with rapid functional decline.'
    },
    {
      fullName: 'David Kim',
      email: 'david.k@otms.com',
      phone: '+1-555-2105',
      bloodGroup: BloodGroup.O_NEG,
      city: hospital.city,
      medicalCondition: 'Autosomal dominant polycystic kidney disease with vascular access failure',
      urgencyLevel: 9,
      medicalPriority: 9,
      organType: OrganType.KIDNEY,
      requestNote: 'Exhausted AV fistula sites; urgent priority match needed.'
    },
    {
      fullName: 'James O Connor',
      email: 'james.oc@otms.com',
      phone: '+1-555-2106',
      bloodGroup: BloodGroup.B_POS,
      city: hospital.city,
      medicalCondition: 'Brittle Type 1 Diabetes with severe hypoglycemia unawareness',
      urgencyLevel: 9,
      medicalPriority: 9,
      organType: OrganType.PANCREAS,
      requestNote: 'Recurrent severe neuroglycopenic episodes requiring assisted rescue.'
    }
  ];

  const defaultPasswordHash = await bcrypt.hash('password123', 10);

  for (const p of patientData) {
    let existingUser = await prisma.user.findUnique({
      where: { email: p.email },
      include: { recipient: true }
    });

    let recipientId: string;

    if (!existingUser) {
      const newUser = await prisma.user.create({
        data: {
          fullName: p.fullName,
          email: p.email,
          phone: p.phone,
          passwordHash: defaultPasswordHash,
          role: Role.RECIPIENT,
          recipient: {
            create: {
              dateOfBirth: new Date('1982-04-12'),
              gender: 'Specified',
              bloodGroup: p.bloodGroup,
              city: p.city,
              address: 'Central Medical District',
              medicalCondition: p.medicalCondition,
              urgencyLevel: p.urgencyLevel,
              medicalPriority: p.medicalPriority,
              status: 'ACTIVE'
            }
          }
        },
        include: { recipient: true }
      });
      recipientId = newUser.recipient!.id;
      console.log(`Created new patient recipient: ${p.fullName} (${p.email})`);
    } else {
      if (!existingUser.recipient) {
        const rec = await prisma.recipient.create({
          data: {
            userId: existingUser.id,
            dateOfBirth: new Date('1982-04-12'),
            gender: 'Specified',
            bloodGroup: p.bloodGroup,
            city: p.city,
            address: 'Central Medical District',
            medicalCondition: p.medicalCondition,
            urgencyLevel: p.urgencyLevel,
            medicalPriority: p.medicalPriority,
            status: 'ACTIVE'
          }
        });
        recipientId = rec.id;
      } else {
        recipientId = existingUser.recipient.id;
        // Make sure recipient is ACTIVE so they appear in matching algorithm
        await prisma.recipient.update({
          where: { id: recipientId },
          data: { status: 'ACTIVE', bloodGroup: p.bloodGroup, urgencyLevel: p.urgencyLevel }
        });
      }
    }

    // Ensure pending transplant request exists
    const existingReq = await prisma.transplantRequest.findFirst({
      where: {
        recipientId,
        organType: p.organType,
        status: RequestStatus.PENDING
      }
    });

    if (!existingReq) {
      await prisma.transplantRequest.create({
        data: {
          recipientId,
          hospitalId: hospital.id,
          organType: p.organType,
          urgencyLevel: p.urgencyLevel,
          medicalPriority: p.medicalPriority,
          medicalInformation: p.requestNote,
          status: RequestStatus.PENDING,
          requestDate: new Date()
        }
      });
      console.log(`Created PENDING transplant request for ${p.fullName} (${p.organType})`);
    }
  }

  // 2. Fresh Available Organs with valid future expiry dates
  const newOrgans = [
    {
      organType: OrganType.KIDNEY,
      bloodGroup: BloodGroup.A_POS,
      location: 'City General Hospital - Cryo Unit 1',
      hoursValid: 48
    },
    {
      organType: OrganType.KIDNEY,
      bloodGroup: BloodGroup.O_POS,
      location: 'Metropolis Trauma Center - Unit 2',
      hoursValid: 42
    },
    {
      organType: OrganType.HEART,
      bloodGroup: BloodGroup.O_POS,
      location: 'Cardiac Perfusion Suite 4',
      hoursValid: 12
    },
    {
      organType: OrganType.LIVER,
      bloodGroup: BloodGroup.B_POS,
      location: 'Organ Preservation Lab 3',
      hoursValid: 24
    },
    {
      organType: OrganType.LUNG,
      bloodGroup: BloodGroup.AB_POS,
      location: 'Normothermic Lung Perfusion Rig',
      hoursValid: 18
    },
    {
      organType: OrganType.PANCREAS,
      bloodGroup: BloodGroup.B_POS,
      location: 'Islet Preservation Facility B',
      hoursValid: 30
    }
  ];

  const now = Date.now();

  for (const org of newOrgans) {
    await prisma.organ.create({
      data: {
        donorId,
        hospitalId: hospital.id,
        organType: org.organType,
        bloodGroup: org.bloodGroup,
        location: org.location,
        availabilityStatus: OrganStatus.AVAILABLE,
        retrievalDate: new Date(),
        expiryDate: new Date(now + org.hoursValid * 3600 * 1000)
      }
    });
    console.log(`Procured AVAILABLE organ: ${org.organType} (${org.bloodGroup}) - ${org.location}`);
  }

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
  })
  .then(async () => {
    await prisma.$disconnect();
  });
