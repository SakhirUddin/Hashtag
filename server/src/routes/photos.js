const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const prisma = require('../db');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'hashtag-secret-key';

// Helper to safely extract user from Authorization header
const extractUser = (req) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return null;
  const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader;
  if (!token) return null;
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
};

// Ensure uploads folder exists
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `photo-${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 120 * 1024 * 1024 }, // 120MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|webp|avif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only high-resolution image files (JPG, PNG, WebP) are allowed'));
  },
});

// Helper: Format photo output with nested relations and real user like status
const formatPhoto = (photo, currentUserId) => {
  const isLikedByMe = photo.likes && currentUserId
    ? photo.likes.some((l) => l.userId === currentUserId)
    : false;

  return {
    id: photo.id,
    title: photo.title,
    description: photo.description,
    url: photo.imageUrl,
    thumbnail: photo.thumbnailUrl,
    width: photo.width,
    height: photo.height,
    aspectRatio: photo.aspectRatio,
    photographer: {
      name: photo.user.displayName,
      username: photo.user.username,
      avatarUrl: photo.user.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
      bio: photo.user.bio,
    },
    likes: Math.max(0, photo.likesCount),
    downloads: Math.max(0, photo.downloadsCount),
    views: Math.max(0, photo.viewsCount),
    isLiked: isLikedByMe,
    hashtags: photo.tags ? photo.tags.map((pt) => pt.tag.name) : [],
    exif: {
      camera: photo.camera || 'Standard Camera',
      lens: photo.lens || 'Prime Lens',
      focalLength: photo.focalLength || '35mm',
      aperture: photo.aperture || 'f/2.8',
      shutterSpeed: photo.shutterSpeed || '1/250s',
      iso: photo.iso || '100',
    },
    location: photo.location || 'Global',
    createdAt: photo.createdAt,
  };
};

// GET /api/photos (supports ?tag=Nature and ?q=search_term)
router.get('/', async (req, res) => {
  try {
    const currentUser = extractUser(req);
    const { tag, q } = req.query;

    const where = {};

    if (tag && tag.toLowerCase() !== 'all') {
      where.tags = {
        some: {
          tag: {
            name: {
              equals: tag,
            },
          },
        },
      };
    }

    if (q && q.trim()) {
      const search = q.trim().replace(/^#/, '');
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
        { user: { displayName: { contains: search } } },
        { tags: { some: { tag: { name: { contains: search } } } } },
      ];
    }

    const photos = await prisma.photo.findMany({
      where,
      include: {
        user: true,
        tags: { include: { tag: true } },
        likes: currentUser ? { where: { userId: currentUser.id } } : false,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ photos: photos.map((p) => formatPhoto(p, currentUser?.id)) });
  } catch (error) {
    console.error('Fetch photos error:', error);
    res.status(500).json({ error: 'Failed to retrieve photos' });
  }
});

// GET /api/photos/:id
router.get('/:id', async (req, res) => {
  try {
    const currentUser = extractUser(req);
    const photo = await prisma.photo.findUnique({
      where: { id: req.params.id },
      include: {
        user: true,
        tags: { include: { tag: true } },
        likes: currentUser ? { where: { userId: currentUser.id } } : false,
      },
    });

    if (!photo) return res.status(404).json({ error: 'Photo not found' });
    res.json({ photo: formatPhoto(photo, currentUser?.id) });
  } catch (error) {
    console.error('Fetch photo error:', error);
    res.status(500).json({ error: 'Failed to retrieve photo' });
  }
});

// POST /api/photos/upload
router.post('/upload', upload.single('image'), async (req, res) => {
  try {
    const { title, description, hashtags, camera, lens, location } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: 'No image file uploaded' });
    }

    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Photo title is required' });
    }

    // Extract authenticated user or fallback to first author
    let author = null;
    const userPayload = extractUser(req);
    if (userPayload && userPayload.userId) {
      author = await prisma.user.findUnique({ where: { id: userPayload.userId } });
    }
    if (!author) {
      author = await prisma.user.findFirst();
    }
    if (!author) {
      author = await prisma.user.create({
        data: {
          email: 'community@hashtag.dev',
          username: 'community_creator',
          displayName: 'Community Creator',
          passwordHash: 'dummy',
          role: 'creator',
        },
      });
    }

    // Host URL for uploaded image
    const host = req.get('host');
    const protocol = req.headers['x-forwarded-proto'] || req.protocol;
    const fileUrl = `${protocol}://${host}/uploads/${req.file.filename}`;

    const newPhoto = await prisma.photo.create({
      data: {
        userId: author.id,
        title: title.trim(),
        description: description ? description.trim() : null,
        imageUrl: fileUrl,
        thumbnailUrl: fileUrl,
        width: 1920,
        height: 1080,
        aspectRatio: '16/9',
        camera: camera || 'Custom Camera',
        lens: lens || 'Prime Lens',
        location: location || 'Global',
      },
      include: {
        user: true,
      },
    });

    // Parse and associate tags safely without unique constraint collisions
    if (hashtags) {
      try {
        const rawTags = hashtags
          .split(/[,\s]+/)
          .map((t) => t.replace(/^#/, '').trim())
          .filter(Boolean);

        // Deduplicate tags by slug
        const uniqueTagsMap = new Map();
        for (const raw of rawTags) {
          const slug = raw.toLowerCase().replace(/[^a-z0-9_-]/g, '');
          if (!slug) continue;
          if (!uniqueTagsMap.has(slug)) {
            const displayName = raw.charAt(0).toUpperCase() + raw.slice(1);
            uniqueTagsMap.set(slug, { name: displayName, slug });
          }
        }

        for (const [slug, tagInfo] of uniqueTagsMap.entries()) {
          try {
            // Find existing tag by unique slug first, then by name
            let tag = await prisma.tag.findUnique({ where: { slug } });
            if (!tag) {
              tag = await prisma.tag.findUnique({ where: { name: tagInfo.name } });
            }

            if (!tag) {
              try {
                tag = await prisma.tag.create({
                  data: {
                    name: tagInfo.name,
                    slug: slug,
                    photoCount: 1,
                  },
                });
              } catch (createErr) {
                // In case of a race condition or casing collision, query again
                tag = await prisma.tag.findFirst({
                  where: {
                    OR: [{ slug }, { name: tagInfo.name }],
                  },
                });
              }
            } else {
              await prisma.tag.update({
                where: { id: tag.id },
                data: { photoCount: { increment: 1 } },
              });
            }

            if (tag) {
              await prisma.photoTag.upsert({
                where: {
                  photoId_tagId: {
                    photoId: newPhoto.id,
                    tagId: tag.id,
                  },
                },
                create: {
                  photoId: newPhoto.id,
                  tagId: tag.id,
                },
                update: {},
              });
            }
          } catch (tagErr) {
            console.warn(`Could not link tag ${slug}:`, tagErr.message);
          }
        }
      } catch (parseErr) {
        console.warn('Error parsing tags:', parseErr.message);
      }
    }

    const completePhoto = await prisma.photo.findUnique({
      where: { id: newPhoto.id },
      include: {
        user: true,
        tags: { include: { tag: true } },
      },
    });

    res.status(201).json({ photo: formatPhoto(completePhoto) });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: error.message || 'Failed to upload photo' });
  }
});

// POST /api/photos/:id/view - Record real view impression
router.post('/:id/view', async (req, res) => {
  try {
    const photo = await prisma.photo.update({
      where: { id: req.params.id },
      data: { viewsCount: { increment: 1 } },
      select: { id: true, viewsCount: true },
    });
    res.json({ success: true, views: photo.viewsCount });
  } catch (error) {
    console.error('View tracking error:', error);
    res.status(500).json({ error: 'Failed to record view' });
  }
});

// POST /api/photos/:id/like - Real user like/unlike toggle with database persistence
router.post('/:id/like', async (req, res) => {
  try {
    const currentUser = extractUser(req);
    if (!currentUser) {
      return res.status(401).json({ error: 'Please sign in to like photos', requireAuth: true });
    }

    const photoId = req.params.id;
    const userId = currentUser.id;

    // Check if user already liked this photo
    const existingLike = await prisma.like.findUnique({
      where: {
        userId_photoId: { userId, photoId },
      },
    });

    let liked = false;
    let updatedLikes = 0;

    if (existingLike) {
      // Unlike photo
      await prisma.like.delete({
        where: { id: existingLike.id },
      });
      const photo = await prisma.photo.update({
        where: { id: photoId },
        data: { likesCount: { decrement: 1 } },
        select: { likesCount: true },
      });
      liked = false;
      updatedLikes = Math.max(0, photo.likesCount);
    } else {
      // Like photo
      await prisma.like.create({
        data: { userId, photoId },
      });
      const photo = await prisma.photo.update({
        where: { id: photoId },
        data: { likesCount: { increment: 1 } },
        select: { likesCount: true },
      });
      liked = true;
      updatedLikes = photo.likesCount;
    }

    res.json({ success: true, liked, likes: updatedLikes });
  } catch (error) {
    console.error('Like toggle error:', error);
    res.status(500).json({ error: 'Failed to update like status' });
  }
});

// GET /api/photos/:id/download - Real download tracker & database record
router.get('/:id/download', async (req, res) => {
  try {
    const currentUser = extractUser(req);
    const photo = await prisma.photo.update({
      where: { id: req.params.id },
      data: { downloadsCount: { increment: 1 } },
    });

    await prisma.download.create({
      data: {
        photoId: photo.id,
        userId: currentUser?.id || null,
        resolution: req.query.size || 'original',
      },
    });

    res.json({ success: true, downloads: photo.downloadsCount, url: photo.imageUrl });
  } catch (error) {
    console.error('Download tracking error:', error);
    res.status(500).json({ error: 'Failed to process download' });
  }
});

module.exports = router;
