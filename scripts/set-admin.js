// scripts/set-admin.js
// Promote a user to PLATFORM_ADMIN or demote to USER
// Usage: node -r dotenv/config scripts/set-admin.js <email> [PLATFORM_ADMIN|USER]

const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');

const email = process.argv[2];
const targetRole = process.argv[3] || 'PLATFORM_ADMIN';

if (!email) {
  console.log('Usage: node -r dotenv/config scripts/set-admin.js <email> [PLATFORM_ADMIN|USER]');
  process.exit(1);
}

const connectionString = process.env.DATABASE_URL;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (!user) {
    console.error(`❌ User with email "${email}" not found.`);
    process.exit(1);
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { role: targetRole },
    select: { id: true, email: true, name: true, role: true },
  });

  console.log(`✅ Success! User ${updated.email} (${updated.name || 'No name'}) role updated to: ${updated.role}`);
}

main()
  .catch((err) => {
    console.error('Error:', err.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

