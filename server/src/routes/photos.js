const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const prisma = require('../db');
const { authenticateToken } = require('./auth');

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

// GET /api/photos (supports ?tag=Nature, ?q=search_term, ?sort=popular|views|downloads|oldest|latest, ?orientation=landscape|portrait|square, ?feed=following)
router.get('/', async (req, res) => {
  try {
    const currentUser = extractUser(req);
    const currentUserId = currentUser ? (currentUser.id || currentUser.userId) : null;
    const { tag, q, sort, orientation, feed } = req.query;

    const conditions = [];

    // Following network feed
    if (feed === 'following') {
      if (!currentUserId) {
        return res.json({ photos: [] });
      }
      const followingList = await prisma.follow.findMany({
        where: { followerId: currentUserId },
        select: { followingId: true },
      });
      const followingIds = followingList.map((f) => f.followingId);
      conditions.push({
        userId: { in: followingIds },
      });
    }

    if (tag && tag.toLowerCase() !== 'all') {
      conditions.push({
        tags: {
          some: {
            tag: {
              name: {
                equals: tag,
              },
            },
          },
        },
      });
    }

    if (q && q.trim()) {
      const search = q.trim().replace(/^#/, '');
      conditions.push({
        OR: [
          { title: { contains: search } },
          { description: { contains: search } },
          { user: { displayName: { contains: search } } },
          { tags: { some: { tag: { name: { contains: search } } } } },
        ],
      });
    }

    if (orientation) {
      const orientLower = orientation.toLowerCase();
      if (orientLower === 'landscape') {
        conditions.push({
          aspectRatio: { in: ['16/9', 'landscape', '16:9', '3/2', '4/3'] },
        });
      } else if (orientLower === 'portrait') {
        conditions.push({
          aspectRatio: { in: ['9/16', 'portrait', '9:16', '2/3', '4/5', '3/4'] },
        });
      } else if (orientLower === 'square') {
        conditions.push({
          aspectRatio: { in: ['1/1', 'square', '1:1'] },
        });
      }
    }

    const where = conditions.length > 0 ? { AND: conditions } : {};

    // Determine sort order
    let orderBy = { createdAt: 'desc' };
    if (sort === 'likes' || sort === 'popular') {
      orderBy = { likesCount: 'desc' };
    } else if (sort === 'views') {
      orderBy = { viewsCount: 'desc' };
    } else if (sort === 'downloads') {
      orderBy = { downloadsCount: 'desc' };
    } else if (sort === 'oldest') {
      orderBy = { createdAt: 'asc' };
    }

    const photos = await prisma.photo.findMany({
      where,
      include: {
        user: true,
        tags: { include: { tag: true } },
        likes: currentUserId ? { where: { userId: currentUserId } } : false,
      },
      orderBy,
    });

    res.json({ photos: photos.map((p) => formatPhoto(p, currentUserId)) });
  } catch (error) {
    console.error('Fetch photos error:', error);
    res.status(500).json({ error: 'Failed to retrieve photos' });
  }
});

// GET /api/photos/:id
router.get('/:id', async (req, res) => {
  try {
    const currentUser = extractUser(req);
    const currentUserId = currentUser ? (currentUser.id || currentUser.userId) : null;
    const photo = await prisma.photo.findUnique({
      where: { id: req.params.id },
      include: {
        user: true,
        tags: { include: { tag: true } },
        likes: currentUserId ? { where: { userId: currentUserId } } : false,
      },
    });

    if (!photo) return res.status(404).json({ error: 'Photo not found' });
    res.json({ photo: formatPhoto(photo, currentUserId) });
  } catch (error) {
    console.error('Fetch photo error:', error);
    res.status(500).json({ error: 'Failed to retrieve photo' });
  }
});

// GET /api/photos/:id/related - "More Like This" recommendation engine
router.get('/:id/related', async (req, res) => {
  try {
    const currentUser = extractUser(req);
    const currentUserId = currentUser ? (currentUser.id || currentUser.userId) : null;
    const photo = await prisma.photo.findUnique({
      where: { id: req.params.id },
      include: {
        tags: { include: { tag: true } },
      },
    });

    if (!photo) return res.status(404).json({ error: 'Photo not found' });

    const tagIds = photo.tags.map((pt) => pt.tagId);

    // Find other photos that share tags or same author
    const orConditions = [];
    if (tagIds.length > 0) {
      orConditions.push({ tags: { some: { tagId: { in: tagIds } } } });
    }
    orConditions.push({ userId: photo.userId });

    let relatedPhotos = await prisma.photo.findMany({
      where: {
        id: { not: photo.id },
        OR: orConditions,
      },
      take: 6,
      include: {
        user: true,
        tags: { include: { tag: true } },
        likes: currentUserId ? { where: { userId: currentUserId } } : false,
      },
      orderBy: { likesCount: 'desc' },
    });

    // Fallback if not enough matching tag/author photos: fill with top viewed community photos
    if (relatedPhotos.length < 4) {
      const existingIds = [photo.id, ...relatedPhotos.map((p) => p.id)];
      const additional = await prisma.photo.findMany({
        where: {
          id: { notIn: existingIds },
        },
        take: 6 - relatedPhotos.length,
        include: {
          user: true,
          tags: { include: { tag: true } },
          likes: currentUserId ? { where: { userId: currentUserId } } : false,
        },
        orderBy: { viewsCount: 'desc' },
      });
      relatedPhotos = [...relatedPhotos, ...additional];
    }

    res.json({ photos: relatedPhotos.map((p) => formatPhoto(p, currentUserId)) });
  } catch (error) {
    console.error('Fetch related photos error:', error);
    res.status(500).json({ error: 'Failed to retrieve related photos' });
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
    const userId = currentUser.id || currentUser.userId;

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
        userId: (currentUser?.id || currentUser?.userId) || null,
        resolution: req.query.size || 'original',
      },
    });

    res.json({ success: true, downloads: photo.downloadsCount, url: photo.imageUrl });
  } catch (error) {
    console.error('Download tracking error:', error);
    res.status(500).json({ error: 'Failed to process download' });
  }
});

// GET /api/photos/:id/comments - Retrieve comments for a photo
router.get('/:id/comments', async (req, res) => {
  try {
    const comments = await prisma.comment.findMany({
      where: { photoId: req.params.id },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
            role: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
    res.json({ comments });
  } catch (error) {
    console.error('Fetch comments error:', error);
    res.status(500).json({ error: 'Failed to retrieve comments' });
  }
});

// POST /api/photos/:id/comments - Post a new comment
router.post('/:id/comments', authenticateToken, async (req, res) => {
  try {
    const { content } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Comment content cannot be empty' });
    }

    const photoId = req.params.id;
    const photo = await prisma.photo.findUnique({ where: { id: photoId } });
    if (!photo) {
      return res.status(404).json({ error: 'Photo not found' });
    }

    const userId = req.user.id || req.user.userId;
    const comment = await prisma.comment.create({
      data: {
        photoId,
        userId,
        content: content.trim(),
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
            role: true,
          },
        },
      },
    });

    res.status(201).json({ comment });
  } catch (error) {
    console.error('Create comment error:', error);
    res.status(500).json({ error: 'Failed to post comment' });
  }
});

// DELETE /api/photos/:id/comments/:commentId - Delete comment (author, photo owner, or admin)
router.delete('/:id/comments/:commentId', authenticateToken, async (req, res) => {
  try {
    const { id: photoId, commentId } = req.params;
    const userId = req.user.id || req.user.userId;

    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment || comment.photoId !== photoId) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    const photo = await prisma.photo.findUnique({
      where: { id: photoId },
      select: { userId: true },
    });

    const isCommentAuthor = comment.userId === userId;
    const isPhotoOwner = photo && photo.userId === userId;
    const isAdmin = req.user.role === 'admin';

    if (!isCommentAuthor && !isPhotoOwner && !isAdmin) {
      return res.status(403).json({ error: 'Unauthorized to delete this comment' });
    }

    await prisma.comment.delete({
      where: { id: commentId },
    });

    res.json({ success: true, message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ error: 'Failed to delete comment' });
  }
});

module.exports = router;
