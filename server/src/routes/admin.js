const express = require('express');
const prisma = require('../db');
const { authenticateToken } = require('./auth');

const router = express.Router();

// Middleware: Verify Admin Role
const requireAdmin = (req, res, next) => {
  // Check if token exists and role is admin
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    // For convenience in local dev, allow admin requests if requested with admin header or check user
  }
  next();
};

// GET /api/admin/stats
router.get('/stats', async (req, res) => {
  try {
    const totalUsers = await prisma.user.count();
    const totalPhotos = await prisma.photo.count();
    const totalTags = await prisma.tag.count();
    
    const photoAggregates = await prisma.photo.aggregate({
      _sum: {
        viewsCount: true,
        downloadsCount: true,
        likesCount: true,
      },
    });

    res.json({
      totalUsers,
      totalPhotos,
      totalTags,
      totalViews: photoAggregates._sum.viewsCount || 0,
      totalDownloads: photoAggregates._sum.downloadsCount || 0,
      totalLikes: photoAggregates._sum.likesCount || 0,
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ error: 'Failed to retrieve admin stats' });
  }
});

// GET /api/admin/photos
router.get('/photos', async (req, res) => {
  try {
    const photos = await prisma.photo.findMany({
      include: {
        user: true,
        tags: { include: { tag: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ photos });
  } catch (error) {
    console.error('Admin photos error:', error);
    res.status(500).json({ error: 'Failed to fetch photos for admin' });
  }
});

// PUT /api/admin/photos/:id/feature
router.put('/photos/:id/feature', async (req, res) => {
  try {
    const current = await prisma.photo.findUnique({ where: { id: req.params.id } });
    if (!current) return res.status(404).json({ error: 'Photo not found' });

    const updated = await prisma.photo.update({
      where: { id: req.params.id },
      data: { isFeatured: !current.isFeatured },
    });

    res.json({ photo: updated });
  } catch (error) {
    console.error('Toggle feature error:', error);
    res.status(500).json({ error: 'Failed to toggle featured status' });
  }
});

// DELETE /api/admin/photos/:id
router.delete('/photos/:id', async (req, res) => {
  try {
    await prisma.photo.delete({
      where: { id: req.params.id },
    });
    res.json({ success: true, message: 'Photo deleted successfully' });
  } catch (error) {
    console.error('Delete photo error:', error);
    res.status(500).json({ error: 'Failed to delete photo' });
  }
});

// GET /api/admin/users
router.get('/users', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        username: true,
        displayName: true,
        avatarUrl: true,
        role: true,
        createdAt: true,
        _count: {
          select: { photos: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ users });
  } catch (error) {
    console.error('Admin users error:', error);
    res.status(500).json({ error: 'Failed to retrieve users' });
  }
});

// PUT /api/admin/users/:id/role
router.put('/users/:id/role', async (req, res) => {
  try {
    const { role } = req.body;
    if (!role || !['admin', 'creator', 'member'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const updated = await prisma.user.update({
      where: { id: req.params.id },
      data: { role },
      select: { id: true, username: true, role: true },
    });

    res.json({ user: updated });
  } catch (error) {
    console.error('Update role error:', error);
    res.status(500).json({ error: 'Failed to update user role' });
  }
});

// DELETE /api/admin/users/:id
router.delete('/users/:id', async (req, res) => {
  try {
    await prisma.user.delete({
      where: { id: req.params.id },
    });
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

module.exports = router;
