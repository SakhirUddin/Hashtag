const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fix() {
  const res = await prisma.photo.updateMany({
    where: {
      viewsCount: { gt: 100 },
    },
    data: {
      viewsCount: 1,
    },
  });
  console.log(`Reset ${res.count} runaway photo views count back to 1!`);
}

fix()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
