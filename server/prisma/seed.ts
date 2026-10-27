import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Initializing production database...');
  
  // Create default hospitals (Required for system to function)
  let hospital1 = await prisma.hospital.findFirst({ where: { email: 'contact@citygeneral.com' } });
  if (!hospital1) {
    hospital1 = await prisma.hospital.create({
      data: {
        name: 'City General Hospital',
        address: '123 Medical Way',
        city: 'Metropolis',
        phone: '555-0101',
        email: 'contact@citygeneral.com',
      }
    });
  }

  // Create Root Admin Account
  const passwordHash = await bcrypt.hash('admin123', 10); // Please change this in a real production environment!

  await prisma.user.upsert({
    where: { email: 'admin@otms.com' },
    update: {},
    create: {
      fullName: 'System Administrator',
      email: 'admin@otms.com',
      phone: '000-000-0000',
      passwordHash,
      role: Role.ADMIN,
    }
  });

  console.log('System initialized successfully. Root Admin created.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .then(async () => {
    await prisma.$disconnect();
  });
