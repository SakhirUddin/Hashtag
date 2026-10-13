const express = require('express');
const prisma = require('../db');
const { authenticateToken } = require('./auth');
const { createNotification } = require('./notifications');

const router = express.Router();

// Helper to safely extract user from auth header if present
const extractUser = (req) => {
  const jwt = require('jsonwebtoken');
  const JWT_SECRET = process.env.JWT_SECRET || 'hashtag-secret-key';
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

// POST /api/inquiries - Submit a photoshoot / project booking request to a creator
router.post('/', async (req, res) => {
  try {
    const {
      creatorId,
      senderName,
      senderEmail,
      projectType,
      shootDate,
      location,
      budget,
      message,
    } = req.body;

    if (!creatorId || !senderName || !senderEmail || !message) {
      return res.status(400).json({ error: 'Missing required inquiry details' });
    }

    const creator = await prisma.user.findFirst({
      where: {
        OR: [{ id: creatorId }, { username: creatorId.toLowerCase() }],
      },
    });

    if (!creator) {
      return res.status(404).json({ error: 'Creator not found' });
    }

    const currentUser = extractUser(req);
    const senderId = currentUser ? (currentUser.id || currentUser.userId) : null;

    const inquiry = await prisma.bookingInquiry.create({
      data: {
        creatorId: creator.id,
        senderId,
        senderName: senderName.trim(),
        senderEmail: senderEmail.trim(),
        projectType: projectType || 'Portrait Session',
        shootDate: shootDate || null,
        location: location || null,
        budget: budget || null,
        message: message.trim(),
      },
    });

    // Notify the creator about the new booking inquiry
    await createNotification({
      userId: creator.id,
      actorId: senderId,
      type: 'inquiry',
      content: `${senderName.trim()} sent a booking inquiry for ${projectType || 'a photo shoot'}`,
    });

    res.status(201).json({
      success: true,
      message: 'Booking request sent successfully to creator',
      inquiry,
    });
  } catch (error) {
    console.error('Create inquiry error:', error);
    res.status(500).json({ error: 'Failed to send booking inquiry' });
  }
});

// GET /api/inquiries - Retrieve inquiries received by current user (as creator)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id || req.user.userId;

    const inquiries = await prisma.bookingInquiry.findMany({
      where: { creatorId: userId },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ inquiries });
  } catch (error) {
    console.error('Fetch inquiries error:', error);
    res.status(500).json({ error: 'Failed to retrieve inquiries' });
  }
});

// PUT /api/inquiries/:id/status - Update inquiry status (accept / decline)
router.put('/:id/status', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id || req.user.userId;
    const { status } = req.body;

    const inquiry = await prisma.bookingInquiry.findUnique({
      where: { id: req.params.id },
    });

    if (!inquiry || inquiry.creatorId !== userId) {
      return res.status(404).json({ error: 'Inquiry not found' });
    }

    const updated = await prisma.bookingInquiry.update({
      where: { id: req.params.id },
      data: { status },
    });

    res.json({ success: true, inquiry: updated });
  } catch (error) {
    console.error('Update inquiry status error:', error);
    res.status(500).json({ error: 'Failed to update status' });
  }
});

module.exports = router;
