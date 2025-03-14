import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function hashPassword(
  password: string,
): Promise<{ hash: string; salt: string }> {
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);
  return { hash, salt };
}

async function main() {
  // Clear existing data
  await prisma.user.deleteMany({});

  // Create admin user
  const adminPassword = await hashPassword('admin123');
 const user1 = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      name: 'Admin User',
      passwordHash: adminPassword.hash,
      passwordSalt: adminPassword.salt,
    },
  });

  // Create regular users
  const user1Password = await hashPassword('password123');
  await prisma.user.create({
    data: {
      email: 'user1@example.com',
      name: 'Regular User 3',
      passwordHash: user1Password.hash,
      passwordSalt: user1Password.salt,
    },
  });

  const user2Password = await hashPassword('password123');
  await prisma.user.create({
    data: {
      email: 'user2@example.com',
      name: 'Regular User 2',
      passwordHash: user2Password.hash,
      passwordSalt: user2Password.salt,
    },
  });

  const board = await prisma.board.create({
    data: {
      name: 'Board 1',
      ownerId: user1.id,
    },
  });
  console.log('Seeding completed successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
