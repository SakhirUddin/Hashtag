export const POPULAR_HASHTAGS = [
  'All',
  'Nature',
  'Architecture',
  'Travel',
  'Food',
  'Animals',
  'Street',
  'Minimalism',
  'Portraits',
  'Technology',
  'NightLife',
  'Ocean'
];

export const MOCK_PHOTOS = [
  {
    id: 'photo-1',
    title: 'Emerald Alpine Lake at Sunrise',
    description: 'Serene glacial waters surrounded by alpine peaks in Banff National Park.',
    url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=2400&q=85',
    thumbnail: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
    width: 2400,
    height: 1600,
    aspectRatio: '3/2',
    photographer: {
      name: 'Elena Rostova',
      username: 'elena_nature',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      bio: 'Landscape & adventure photographer exploring the Canadian Rockies.'
    },
    likes: 1420,
    downloads: 3890,
    views: 18450,
    hashtags: ['Nature', 'Travel', 'Ocean', 'Minimalism'],
    exif: {
      camera: 'Sony Alpha A7R V',
      lens: 'FE 16-35mm F2.8 GM',
      focalLength: '24mm',
      aperture: 'f/8.0',
      shutterSpeed: '1/125s',
      iso: '100'
    },
    location: 'Banff, Canada'
  },
  {
    id: 'photo-2',
    title: 'Tokyo Neon Cyberpunk Alley',
    description: 'Rain-slicked streets reflecting vibrant neon signs in Shinjuku after midnight.',
    url: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=2000&q=85',
    thumbnail: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80',
    width: 1600,
    height: 2400,
    aspectRatio: '2/3',
    photographer: {
      name: 'Kenji Sato',
      username: 'kenji_lens',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
      bio: 'Street & night photographer capturing Tokyo nocturnal aesthetic.'
    },
    likes: 2840,
    downloads: 6510,
    views: 32100,
    hashtags: ['Street', 'NightLife', 'Architecture', 'Travel'],
    exif: {
      camera: 'Fujifilm X-T5',
      lens: 'XF 33mm F1.4 R LM WR',
      focalLength: '33mm',
      aperture: 'f/1.4',
      shutterSpeed: '1/60s',
      iso: '800'
    },
    location: 'Shinjuku, Tokyo'
  },
  {
    id: 'photo-3',
    title: 'Artisan Sourdough with Wild Berries',
    description: 'Freshly baked rustic country loaf dusted with flour and wild mountain blackberries.',
    url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=2400&q=85',
    thumbnail: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80',
    width: 2400,
    height: 1800,
    aspectRatio: '4/3',
    photographer: {
      name: 'Chloe Dupont',
      username: 'chloe_bakery',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
      bio: 'Food stylist and culinary storyteller.'
    },
    likes: 980,
    downloads: 2140,
    views: 11200,
    hashtags: ['Food', 'Minimalism'],
    exif: {
      camera: 'Canon EOS R5',
      lens: 'RF 50mm F1.2 L USM',
      focalLength: '50mm',
      aperture: 'f/2.8',
      shutterSpeed: '1/200s',
      iso: '200'
    },
    location: 'Lyon, France'
  },
  {
    id: 'photo-4',
    title: 'Minimalist Spiral Concrete Staircase',
    description: 'Monochromatic architectural curves leading upwards into natural daylight.',
    url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=2000&q=85',
    thumbnail: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
    width: 1800,
    height: 2400,
    aspectRatio: '3/4',
    photographer: {
      name: 'Marcus Lindqvist',
      username: 'marcus_arch',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
      bio: 'Architectural minimalist documenting Scandinavian design.'
    },
    likes: 1870,
    downloads: 4120,
    views: 24000,
    hashtags: ['Architecture', 'Minimalism'],
    exif: {
      camera: 'Leica Q2',
      lens: 'Summilux 28mm f/1.7 ASPH',
      focalLength: '28mm',
      aperture: 'f/4.0',
      shutterSpeed: '1/160s',
      iso: '100'
    },
    location: 'Copenhagen, Denmark'
  },
  {
    id: 'photo-5',
    title: 'Curious Red Fox in Winter Snow',
    description: 'Wild red fox staring directly into the lens amidst pristine white snowfall.',
    url: 'https://images.unsplash.com/photo-1474511320723-9a56873867b5?auto=format&fit=crop&w=2400&q=85',
    thumbnail: 'https://images.unsplash.com/photo-1474511320723-9a56873867b5?auto=format&fit=crop&w=800&q=80',
    width: 2400,
    height: 1600,
    aspectRatio: '3/2',
    photographer: {
      name: 'Astrid Berg',
      username: 'astrid_wild',
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
      bio: 'Wildlife conservationist & National Geographic contributor.'
    },
    likes: 3410,
    downloads: 8900,
    views: 45200,
    hashtags: ['Animals', 'Nature'],
    exif: {
      camera: 'Nikon Z9',
      lens: 'NIKKOR Z 400mm f/2.8 TC VR S',
      focalLength: '400mm',
      aperture: 'f/2.8',
      shutterSpeed: '1/1000s',
      iso: '400'
    },
    location: 'Lapland, Finland'
  },
  {
    id: 'photo-6',
    title: 'Majestic Cascading Coastal Waves',
    description: 'Deep turquoise Pacific swell crashing against basalt coastal cliffs at golden hour.',
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=2400&q=85',
    thumbnail: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
    width: 2400,
    height: 1600,
    aspectRatio: '3/2',
    photographer: {
      name: 'Kai Morrison',
      username: 'kai_surfs',
      avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=200&q=80',
      bio: 'Ocean & aerial drone photographer.'
    },
    likes: 2190,
    downloads: 5310,
    views: 29800,
    hashtags: ['Ocean', 'Nature', 'Travel'],
    exif: {
      camera: 'DJI Mavic 3 Pro',
      lens: 'Hasselblad 24mm',
      focalLength: '24mm',
      aperture: 'f/5.6',
      shutterSpeed: '1/500s',
      iso: '100'
    },
    location: 'Big Sur, California'
  },
  {
    id: 'photo-7',
    title: 'Vintage Film Camera with Golden Warmth',
    description: 'Classic rangefinder mechanical camera resting on aged walnut timber desk.',
    url: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=2000&q=85',
    thumbnail: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80',
    width: 1800,
    height: 2400,
    aspectRatio: '3/4',
    photographer: {
      name: 'Liam Hayes',
      username: 'liam_vintage',
      avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=200&q=80',
      bio: 'Analog film fanatic and retro tech collector.'
    },
    likes: 1620,
    downloads: 3200,
    views: 18700,
    hashtags: ['Technology', 'Minimalism'],
    exif: {
      camera: 'Fujifilm GFX 100S',
      lens: 'GF 110mm F2 R LM WR',
      focalLength: '110mm',
      aperture: 'f/2.8',
      shutterSpeed: '1/125s',
      iso: '160'
    },
    location: 'London, UK'
  },
  {
    id: 'photo-8',
    title: 'Moody Autumn Forest in Morning Fog',
    description: 'Golden birch trees fading into dense misty atmospheric mountain woodland.',
    url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=2400&q=85',
    thumbnail: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80',
    width: 2400,
    height: 1600,
    aspectRatio: '3/2',
    photographer: {
      name: 'Elena Rostova',
      username: 'elena_nature',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      bio: 'Landscape & adventure photographer exploring the Canadian Rockies.'
    },
    likes: 3100,
    downloads: 7200,
    views: 38900,
    hashtags: ['Nature', 'Minimalism', 'Travel'],
    exif: {
      camera: 'Sony Alpha A7R V',
      lens: 'FE 70-200mm F2.8 GM OSS II',
      focalLength: '85mm',
      aperture: 'f/5.6',
      shutterSpeed: '1/200s',
      iso: '200'
    },
    location: 'Black Forest, Germany'
  }
];
