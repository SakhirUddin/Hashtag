const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding #Hashtag database...');

  // Clean existing records
  await prisma.collectionPhoto.deleteMany({});
  await prisma.collection.deleteMany({});
  await prisma.download.deleteMany({});
  await prisma.like.deleteMany({});
  await prisma.photoTag.deleteMany({});
  await prisma.photo.deleteMany({});
  await prisma.tag.deleteMany({});
  await prisma.user.deleteMany({});

  const passwordHash = await bcrypt.hash('password123', 10);

  // 1. Create Photographers
  const elena = await prisma.user.create({
    data: {
      email: 'elena@hashtag.dev',
      username: 'elena_nature',
      passwordHash,
      displayName: 'Elena Rostova',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      bio: 'Landscape & adventure photographer exploring the Canadian Rockies.',
      role: 'creator',
    },
  });

  const kenji = await prisma.user.create({
    data: {
      email: 'kenji@hashtag.dev',
      username: 'kenji_lens',
      passwordHash,
      displayName: 'Kenji Sato',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
      bio: 'Street & night photographer capturing Tokyo nocturnal aesthetic.',
      role: 'creator',
    },
  });

  const chloe = await prisma.user.create({
    data: {
      email: 'chloe@hashtag.dev',
      username: 'chloe_bakery',
      passwordHash,
      displayName: 'Chloe Dupont',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
      bio: 'Food stylist and culinary storyteller.',
      role: 'creator',
    },
  });

  const marcus = await prisma.user.create({
    data: {
      email: 'marcus@hashtag.dev',
      username: 'marcus_arch',
      passwordHash,
      displayName: 'Marcus Lindqvist',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
      bio: 'Architectural minimalist documenting Scandinavian design.',
      role: 'creator',
    },
  });

  const astrid = await prisma.user.create({
    data: {
      email: 'astrid@hashtag.dev',
      username: 'astrid_wild',
      passwordHash,
      displayName: 'Astrid Berg',
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
      bio: 'Wildlife conservationist & National Geographic contributor.',
      role: 'creator',
    },
  });

  const kai = await prisma.user.create({
    data: {
      email: 'kai@hashtag.dev',
      username: 'kai_surfs',
      passwordHash,
      displayName: 'Kai Morrison',
      avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=200&q=80',
      bio: 'Ocean & aerial drone photographer.',
      role: 'creator',
    },
  });

  // 2. Create Tags
  const tagNames = [
    'Nature', 'Architecture', 'Travel', 'Food', 'Animals', 
    'Street', 'Minimalism', 'NightLife', 'Ocean', 'Technology'
  ];

  const tagMap = {};
  for (const name of tagNames) {
    const tag = await prisma.tag.create({
      data: {
        name,
        slug: name.toLowerCase(),
      },
    });
    tagMap[name] = tag.id;
  }

  // 3. Create Photos
  const photosData = [
    {
      userId: elena.id,
      title: 'Emerald Alpine Lake at Sunrise',
      description: 'Serene glacial waters surrounded by alpine peaks in Banff National Park.',
      imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=2400&q=85',
      thumbnailUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
      width: 2400,
      height: 1600,
      aspectRatio: '3/2',
      camera: 'Sony Alpha A7R V',
      lens: 'FE 16-35mm F2.8 GM',
      focalLength: '24mm',
      aperture: 'f/8.0',
      shutterSpeed: '1/125s',
      iso: '100',
      location: 'Banff, Canada',
      likesCount: 0,
      downloadsCount: 0,
      viewsCount: 0,
      tags: ['Nature', 'Travel', 'Ocean', 'Minimalism'],
    },
    {
      userId: kenji.id,
      title: 'Tokyo Neon Cyberpunk Alley',
      description: 'Rain-slicked streets reflecting vibrant neon signs in Shinjuku after midnight.',
      imageUrl: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=2000&q=85',
      thumbnailUrl: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80',
      width: 1600,
      height: 2400,
      aspectRatio: '2/3',
      camera: 'Fujifilm X-T5',
      lens: 'XF 33mm F1.4 R LM WR',
      focalLength: '33mm',
      aperture: 'f/1.4',
      shutterSpeed: '1/60s',
      iso: '800',
      location: 'Shinjuku, Tokyo',
      likesCount: 0,
      downloadsCount: 0,
      viewsCount: 0,
      tags: ['Street', 'NightLife', 'Architecture', 'Travel'],
    },
    {
      userId: chloe.id,
      title: 'Artisan Sourdough with Wild Berries',
      description: 'Freshly baked rustic country loaf dusted with flour and wild mountain blackberries.',
      imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=2400&q=85',
      thumbnailUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80',
      width: 2400,
      height: 1800,
      aspectRatio: '4/3',
      camera: 'Canon EOS R5',
      lens: 'RF 50mm F1.2 L USM',
      focalLength: '50mm',
      aperture: 'f/2.8',
      shutterSpeed: '1/200s',
      iso: '200',
      location: 'Lyon, France',
      likesCount: 0,
      downloadsCount: 0,
      viewsCount: 0,
      tags: ['Food', 'Minimalism'],
    },
    {
      userId: marcus.id,
      title: 'Minimalist Spiral Concrete Staircase',
      description: 'Monochromatic architectural curves leading upwards into natural daylight.',
      imageUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=2000&q=85',
      thumbnailUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
      width: 1800,
      height: 2400,
      aspectRatio: '3/4',
      camera: 'Leica Q2',
      lens: 'Summilux 28mm f/1.7 ASPH',
      focalLength: '28mm',
      aperture: 'f/4.0',
      shutterSpeed: '1/160s',
      iso: '100',
      location: 'Copenhagen, Denmark',
      likesCount: 0,
      downloadsCount: 0,
      viewsCount: 0,
      tags: ['Architecture', 'Minimalism'],
    },
    {
      userId: astrid.id,
      title: 'Curious Red Fox in Winter Snow',
      description: 'Wild red fox staring directly into the lens amidst pristine white snowfall.',
      imageUrl: 'https://images.unsplash.com/photo-1474511320723-9a56873867b5?auto=format&fit=crop&w=2400&q=85',
      thumbnailUrl: 'https://images.unsplash.com/photo-1474511320723-9a56873867b5?auto=format&fit=crop&w=800&q=80',
      width: 2400,
      height: 1600,
      aspectRatio: '3/2',
      camera: 'Nikon Z9',
      lens: 'NIKKOR Z 400mm f/2.8 TC VR S',
      focalLength: '400mm',
      aperture: 'f/2.8',
      shutterSpeed: '1/1000s',
      iso: '400',
      location: 'Lapland, Finland',
      likesCount: 0,
      downloadsCount: 0,
      viewsCount: 0,
      tags: ['Animals', 'Nature'],
    },
    {
      userId: kai.id,
      title: 'Majestic Cascading Coastal Waves',
      description: 'Deep turquoise Pacific swell crashing against basalt coastal cliffs at golden hour.',
      imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=2400&q=85',
      thumbnailUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
      width: 2400,
      height: 1600,
      aspectRatio: '3/2',
      camera: 'DJI Mavic 3 Pro',
      lens: 'Hasselblad 24mm',
      focalLength: '24mm',
      aperture: 'f/5.6',
      shutterSpeed: '1/500s',
      iso: '100',
      location: 'Big Sur, California',
      likesCount: 0,
      downloadsCount: 0,
      viewsCount: 0,
      tags: ['Ocean', 'Nature', 'Travel'],
    },
    {
      userId: elena.id,
      title: 'Moody Autumn Forest in Morning Fog',
      description: 'Golden birch trees fading into dense misty atmospheric mountain woodland.',
      imageUrl: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=2400&q=85',
      thumbnailUrl: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80',
      width: 2400,
      height: 1600,
      aspectRatio: '3/2',
      camera: 'Sony Alpha A7R V',
      lens: 'FE 70-200mm F2.8 GM OSS II',
      focalLength: '85mm',
      aperture: 'f/5.6',
      shutterSpeed: '1/200s',
      iso: '200',
      location: 'Black Forest, Germany',
      likesCount: 3100,
      downloadsCount: 7200,
      viewsCount: 38900,
      tags: ['Nature', 'Minimalism', 'Travel'],
    },
  ];

  for (const p of photosData) {
    const photo = await prisma.photo.create({
      data: {
        userId: p.userId,
        title: p.title,
        description: p.description,
        imageUrl: p.imageUrl,
        thumbnailUrl: p.thumbnailUrl,
        width: p.width,
        height: p.height,
        aspectRatio: p.aspectRatio,
        camera: p.camera,
        lens: p.lens,
        focalLength: p.focalLength,
        aperture: p.aperture,
        shutterSpeed: p.shutterSpeed,
        iso: p.iso,
        location: p.location,
        likesCount: p.likesCount,
        downloadsCount: p.downloadsCount,
        viewsCount: p.viewsCount,
      },
    });

    // Connect Tags
    for (const tagName of p.tags) {
      if (tagMap[tagName]) {
        await prisma.photoTag.create({
          data: {
            photoId: photo.id,
            tagId: tagMap[tagName],
          },
        });
        await prisma.tag.update({
          where: { id: tagMap[tagName] },
          data: { photoCount: { increment: 1 } },
        });
      }
    }
  }

  // 3. Create Sample Curated Collections
  const allPhotos = await prisma.photo.findMany({ take: 6 });
  if (allPhotos.length >= 2) {
    const col1 = await prisma.collection.create({
      data: {
        userId: elena.id,
        title: 'Atmospheric Earth & Wilds',
        description: 'Breathtaking landscapes, misty mornings, and untouched wilderness vistas.',
        isPrivate: false,
      },
    });

    for (let i = 0; i < Math.min(allPhotos.length, 4); i++) {
      await prisma.collectionPhoto.create({
        data: {
          collectionId: col1.id,
          photoId: allPhotos[i].id,
        },
      });
    }

    if (allPhotos.length >= 4) {
      const col2 = await prisma.collection.create({
        data: {
          userId: kenji.id,
          title: 'Neon Nights & Metropolis',
          description: 'Rain-slicked asphalt, vibrant neon signage, and late-night urban energy.',
          isPrivate: false,
        },
      });

      for (let i = 2; i < allPhotos.length; i++) {
        await prisma.collectionPhoto.create({
          data: {
            collectionId: col2.id,
            photoId: allPhotos[i].id,
          },
        });
      }
    }
  }

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
