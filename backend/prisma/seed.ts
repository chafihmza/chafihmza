import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL ?? 'admin@example.com';
  const adminName = process.env.ADMIN_NAME ?? 'Admin';
  const adminPassword = process.env.ADMIN_PASSWORD ?? 'ChangeMe123!';

  const existing = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!existing) {
    const hash = await bcrypt.hash(adminPassword, 12);
    await prisma.user.create({
      data: {
        name: adminName,
        email: adminEmail,
        passwordHash: hash,
        role: 'ADMIN'
      }
    });
    console.log('Admin user created');
  } else {
    console.log('Admin user already exists');
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
