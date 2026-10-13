const express = require('express');
const prisma = require('../db');
const { authenticateToken } = require('./auth');

const router = express.Router();

// Helper to create a notification safely
async function createNotification({ userId, actorId, type, photoId, content }) {
  try {
    // Prevent notifying oneself
    if (!userId || actorId === userId) return null;

    return await prisma.notification.create({
      data: {
        userId,
        actorId,
        type,
        photoId: photoId || null,
        content: content || null,
      },
    });
  } catch (err) {
    console.warn('Failed to create notification:', err.message);
    return null;
  }
}

// GET /api/notifications - Get current user notifications
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id || req.user.userId;

    const notifications = await prisma.notification.findMany({
      where: { userId },
      include: {
        actor: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
          },
        },
        photo: {
          select: {
            id: true,
            title: true,
            thumbnailUrl: true,
            imageUrl: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 40,
    });

    const unreadCount = await prisma.notification.count({
      where: { userId, isRead: false },
    });

    res.json({ notifications, unreadCount });
  } catch (error) {
    console.error('Fetch notifications error:', error);
    res.status(500).json({ error: 'Failed to retrieve notifications' });
  }
});

// PUT /api/notifications/read-all - Mark all user notifications as read
router.put('/read-all', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id || req.user.userId;

    await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });

    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Mark all read error:', error);
    res.status(500).json({ error: 'Failed to mark all as read' });
  }
});

// PUT /api/notifications/:id/read - Mark single notification as read
router.put('/:id/read', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id || req.user.userId;
    const notification = await prisma.notification.findUnique({
      where: { id: req.params.id },
    });

    if (!notification || notification.userId !== userId) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    const updated = await prisma.notification.update({
      where: { id: req.params.id },
      data: { isRead: true },
    });

    res.json({ success: true, notification: updated });
  } catch (error) {
    console.error('Mark read error:', error);
    res.status(500).json({ error: 'Failed to update notification' });
  }
});

module.exports = {
  router,
  createNotification,
};
