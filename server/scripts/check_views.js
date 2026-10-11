const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const photos = await prisma.photo.findMany({
    select: { id: true, title: true, viewsCount: true, likesCount: true, downloadsCount: true },
  });
  console.log(JSON.stringify(photos, null, 2));
}

run()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
