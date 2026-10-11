const express = require('express');
const prisma = require('../db');
const { authenticateToken } = require('./auth');

const router = express.Router();

// Helper to format a photo object cleanly
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
      id: photo.user.id,
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

// GET /api/users/:username - Full Profile with uploaded & liked photos
router.get('/:username', async (req, res) => {
  try {
    const username = req.params.username.toLowerCase().trim();

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { username },
          { id: username },
        ],
      },
      select: {
        id: true,
        username: true,
        email: true,
        displayName: true,
        avatarUrl: true,
        bio: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User profile not found' });
    }

    // 1. Fetch uploaded photos
    const uploadedPhotos = await prisma.photo.findMany({
      where: { userId: user.id },
      include: {
        user: true,
        tags: { include: { tag: true } },
        likes: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // 2. Fetch liked photos by this user
    const likes = await prisma.like.findMany({
      where: { userId: user.id },
      include: {
        photo: {
          include: {
            user: true,
            tags: { include: { tag: true } },
            likes: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const likedPhotos = likes.map((l) => formatPhoto(l.photo, user.id));
    const formattedUploads = uploadedPhotos.map((p) => formatPhoto(p, user.id));

    // 3. Compute telemetry metrics
    const totalViews = uploadedPhotos.reduce((acc, p) => acc + (p.viewsCount || 0), 0);
    const totalDownloads = uploadedPhotos.reduce((acc, p) => acc + (p.downloadsCount || 0), 0);
    const totalLikes = uploadedPhotos.reduce((acc, p) => acc + (p.likesCount || 0), 0);

    res.json({
      profile: {
        ...user,
        stats: {
          photosCount: uploadedPhotos.length,
          likedCount: likedPhotos.length,
          totalViews,
          totalDownloads,
          totalLikes,
        },
      },
      photos: formattedUploads,
      likedPhotos,
    });
  } catch (error) {
    console.error('Fetch profile error:', error);
    res.status(500).json({ error: 'Failed to retrieve profile' });
  }
});

// PUT /api/users/profile - Update personal profile details
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { displayName, bio, avatarUrl } = req.body;
    const userId = req.user.id;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(displayName && { displayName: displayName.trim() }),
        ...(bio !== undefined && { bio: bio.trim() }),
        ...(avatarUrl && { avatarUrl: avatarUrl.trim() }),
      },
      select: {
        id: true,
        username: true,
        email: true,
        displayName: true,
        avatarUrl: true,
        bio: true,
        role: true,
        createdAt: true,
      },
    });

    res.json({
      message: 'Profile updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// DELETE /api/users/photos/:id - Delete own photo
router.delete('/photos/:id', authenticateToken, async (req, res) => {
  try {
    const photoId = req.params.id;
    const photo = await prisma.photo.findUnique({
      where: { id: photoId },
    });

    if (!photo) {
      return res.status(404).json({ error: 'Photo not found' });
    }

    // Only owner or admin can delete
    if (photo.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized to delete this photo' });
    }

    await prisma.photo.delete({
      where: { id: photoId },
    });

    res.json({ success: true, message: 'Photo deleted successfully' });
  } catch (error) {
    console.error('Delete user photo error:', error);
    res.status(500).json({ error: 'Failed to delete photo' });
  }
});

module.exports = router;
