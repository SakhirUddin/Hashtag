const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function reset() {
  console.log('Resetting all metric counters...');
  await prisma.download.deleteMany({});
  await prisma.like.deleteMany({});
  const res = await prisma.photo.updateMany({
    data: {
      viewsCount: 0,
      downloadsCount: 0,
      likesCount: 0,
    },
  });
  console.log(`Successfully reset metrics for ${res.count} photos to 0!`);
}

reset()
  .catch((err) => {
    console.error('Reset error:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
