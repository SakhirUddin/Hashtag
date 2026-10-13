const express = require('express');
const jwt = require('jsonwebtoken');
const prisma = require('../db');
const { authenticateToken } = require('./auth');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'hashtag-secret-key';

// Helper to safely extract user if token present, without blocking unauthenticated requests
const getOptionalUser = (req) => {
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

// GET /api/collections - Browse public collections with preview cards
router.get('/', async (req, res) => {
  try {
    const collections = await prisma.collection.findMany({
      where: { isPrivate: false },
      orderBy: { updatedAt: 'desc' },
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
        photos: {
          take: 4,
          orderBy: { addedAt: 'desc' },
          include: {
            photo: {
              select: {
                id: true,
                title: true,
                imageUrl: true,
                thumbnailUrl: true,
                aspectRatio: true,
              },
            },
          },
        },
        _count: {
          select: { photos: true },
        },
      },
    });

    const formatted = collections.map((col) => ({
      id: col.id,
      title: col.title,
      description: col.description,
      isPrivate: col.isPrivate,
      createdAt: col.createdAt,
      updatedAt: col.updatedAt,
      curator: col.user,
      photoCount: col._count.photos,
      previewPhotos: col.photos.map((cp) => cp.photo),
    }));

    res.json({ collections: formatted });
  } catch (error) {
    console.error('Fetch collections error:', error);
    res.status(500).json({ error: 'Failed to fetch collections' });
  }
});

// GET /api/collections/my/status - Get logged-in user collections and check if a photo is in them
router.get('/my/status', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { photoId } = req.query;

    const collections = await prisma.collection.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      include: {
        photos: {
          where: photoId ? { photoId } : undefined,
          select: { photoId: true },
        },
        _count: {
          select: { photos: true },
        },
      },
    });

    const result = collections.map((col) => ({
      id: col.id,
      title: col.title,
      description: col.description,
      isPrivate: col.isPrivate,
      photoCount: col._count.photos,
      hasPhoto: photoId ? col.photos.length > 0 : false,
      updatedAt: col.updatedAt,
    }));

    res.json({ collections: result });
  } catch (error) {
    console.error('Fetch my collections status error:', error);
    res.status(500).json({ error: 'Failed to load user collections' });
  }
});

// GET /api/collections/user/:username - Get collections for a specific user profile
router.get('/user/:username', async (req, res) => {
  try {
    const targetUser = await prisma.user.findUnique({
      where: { username: req.params.username.toLowerCase() },
      select: { id: true, username: true, displayName: true, avatarUrl: true },
    });

    if (!targetUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    const currentUser = getOptionalUser(req);
    const isOwner = currentUser && currentUser.userId === targetUser.id;

    const collections = await prisma.collection.findMany({
      where: {
        userId: targetUser.id,
        ...(isOwner ? {} : { isPrivate: false }),
      },
      orderBy: { updatedAt: 'desc' },
      include: {
        photos: {
          take: 4,
          orderBy: { addedAt: 'desc' },
          include: {
            photo: {
              select: {
                id: true,
                title: true,
                imageUrl: true,
                thumbnailUrl: true,
              },
            },
          },
        },
        _count: {
          select: { photos: true },
        },
      },
    });

    const formatted = collections.map((col) => ({
      id: col.id,
      title: col.title,
      description: col.description,
      isPrivate: col.isPrivate,
      curator: targetUser,
      photoCount: col._count.photos,
      previewPhotos: col.photos.map((cp) => cp.photo),
      updatedAt: col.updatedAt,
    }));

    res.json({ collections: formatted, isOwner });
  } catch (error) {
    console.error('Fetch user collections error:', error);
    res.status(500).json({ error: 'Failed to fetch user collections' });
  }
});

// GET /api/collections/:id - Get single collection details with all photos
router.get('/:id', async (req, res) => {
  try {
    const collection = await prisma.collection.findUnique({
      where: { id: req.params.id },
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
        photos: {
          orderBy: { addedAt: 'desc' },
          include: {
            photo: {
              include: {
                user: {
                  select: {
                    id: true,
                    username: true,
                    displayName: true,
                    avatarUrl: true,
                  },
                },
                tags: {
                  include: { tag: true },
                },
                likes: true,
              },
            },
          },
        },
      },
    });

    if (!collection) {
      return res.status(404).json({ error: 'Collection not found' });
    }

    const currentUser = getOptionalUser(req);
    const isOwner = currentUser && currentUser.userId === collection.userId;

    if (collection.isPrivate && !isOwner) {
      return res.status(403).json({ error: 'This collection is private' });
    }

    const currentUserId = currentUser ? currentUser.userId : null;
    const formattedPhotos = collection.photos.map((cp) => {
      const p = cp.photo;
      return {
        id: p.id,
        title: p.title,
        description: p.description,
        imageUrl: p.imageUrl,
        thumbnailUrl: p.thumbnailUrl,
        width: p.width,
        height: p.height,
        aspectRatio: p.aspectRatio,
        camera: p.camera,
        lens: p.lens,
        location: p.location,
        viewsCount: p.viewsCount,
        downloadsCount: p.downloadsCount,
        likesCount: p.likesCount,
        createdAt: p.createdAt,
        user: p.user,
        tags: p.tags.map((t) => t.tag.name),
        isLiked: currentUserId ? p.likes.some((l) => l.userId === currentUserId) : false,
      };
    });

    res.json({
      collection: {
        id: collection.id,
        title: collection.title,
        description: collection.description,
        isPrivate: collection.isPrivate,
        createdAt: collection.createdAt,
        updatedAt: collection.updatedAt,
        curator: collection.user,
        photos: formattedPhotos,
        photoCount: formattedPhotos.length,
        isOwner,
      },
    });
  } catch (error) {
    console.error('Fetch collection detail error:', error);
    res.status(500).json({ error: 'Failed to fetch collection details' });
  }
});

// POST /api/collections - Create a new collection
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { title, description, isPrivate } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Collection title is required' });
    }

    const collection = await prisma.collection.create({
      data: {
        userId: req.user.userId,
        title: title.trim(),
        description: description ? description.trim() : null,
        isPrivate: Boolean(isPrivate),
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
          },
        },
      },
    });

    res.status(201).json({
      collection: {
        ...collection,
        curator: collection.user,
        photoCount: 0,
        previewPhotos: [],
      },
    });
  } catch (error) {
    console.error('Create collection error:', error);
    res.status(500).json({ error: 'Failed to create collection' });
  }
});

// PUT /api/collections/:id - Update collection details
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const collection = await prisma.collection.findUnique({
      where: { id: req.params.id },
    });

    if (!collection) {
      return res.status(404).json({ error: 'Collection not found' });
    }

    if (collection.userId !== req.user.userId) {
      return res.status(403).json({ error: 'Unauthorized to edit this collection' });
    }

    const { title, description, isPrivate } = req.body;
    const updated = await prisma.collection.update({
      where: { id: req.params.id },
      data: {
        title: title !== undefined ? title.trim() : collection.title,
        description: description !== undefined ? description.trim() : collection.description,
        isPrivate: isPrivate !== undefined ? Boolean(isPrivate) : collection.isPrivate,
      },
    });

    res.json({ collection: updated });
  } catch (error) {
    console.error('Update collection error:', error);
    res.status(500).json({ error: 'Failed to update collection' });
  }
});

// DELETE /api/collections/:id - Delete an entire collection
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const collection = await prisma.collection.findUnique({
      where: { id: req.params.id },
    });

    if (!collection) {
      return res.status(404).json({ error: 'Collection not found' });
    }

    if (collection.userId !== req.user.userId) {
      return res.status(403).json({ error: 'Unauthorized to delete this collection' });
    }

    await prisma.collection.delete({
      where: { id: req.params.id },
    });

    res.json({ success: true, message: 'Collection deleted successfully' });
  } catch (error) {
    console.error('Delete collection error:', error);
    res.status(500).json({ error: 'Failed to delete collection' });
  }
});

// POST /api/collections/:id/photos - Add photo to collection
router.post('/:id/photos', authenticateToken, async (req, res) => {
  try {
    const { photoId } = req.body;
    if (!photoId) {
      return res.status(400).json({ error: 'photoId is required' });
    }

    const collection = await prisma.collection.findUnique({
      where: { id: req.params.id },
    });

    if (!collection) {
      return res.status(404).json({ error: 'Collection not found' });
    }

    if (collection.userId !== req.user.userId) {
      return res.status(403).json({ error: 'Unauthorized to modify this collection' });
    }

    // Add photo to collection using upsert
    await prisma.collectionPhoto.upsert({
      where: {
        collectionId_photoId: {
          collectionId: collection.id,
          photoId,
        },
      },
      create: {
        collectionId: collection.id,
        photoId,
      },
      update: {},
    });

    // Touch collection updatedAt timestamp
    await prisma.collection.update({
      where: { id: collection.id },
      data: { updatedAt: new Date() },
    });

    res.status(201).json({ success: true, message: 'Photo saved to collection' });
  } catch (error) {
    console.error('Add photo to collection error:', error);
    res.status(500).json({ error: 'Failed to add photo to collection' });
  }
});

// DELETE /api/collections/:id/photos/:photoId - Remove photo from collection
router.delete('/:id/photos/:photoId', authenticateToken, async (req, res) => {
  try {
    const { id: collectionId, photoId } = req.params;

    const collection = await prisma.collection.findUnique({
      where: { id: collectionId },
    });

    if (!collection) {
      return res.status(404).json({ error: 'Collection not found' });
    }

    if (collection.userId !== req.user.userId) {
      return res.status(403).json({ error: 'Unauthorized to modify this collection' });
    }

    await prisma.collectionPhoto.deleteMany({
      where: {
        collectionId,
        photoId,
      },
    });

    res.json({ success: true, message: 'Photo removed from collection' });
  } catch (error) {
    console.error('Remove photo from collection error:', error);
    res.status(500).json({ error: 'Failed to remove photo from collection' });
  }
});

module.exports = router;
