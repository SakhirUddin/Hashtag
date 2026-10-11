const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const likes = await prisma.like.findMany({
    include: {
      user: { select: { username: true, displayName: true } },
      photo: { select: { title: true } },
    },
  });
  const downloads = await prisma.download.findMany({
    include: {
      user: { select: { username: true, displayName: true } },
      photo: { select: { title: true } },
    },
  });

  console.log('--- REAL LIKES IN DATABASE ---');
  console.log(JSON.stringify(likes, null, 2));
  console.log('--- REAL DOWNLOADS IN DATABASE ---');
  console.log(JSON.stringify(downloads, null, 2));
}

check()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
