const express = require('express');
const prisma = require('../db');

const router = express.Router();

// GET /api/tags
router.get('/', async (req, res) => {
  try {
    const tags = await prisma.tag.findMany({
      orderBy: { photoCount: 'desc' },
      take: 25,
    });
    res.json({ tags });
  } catch (error) {
    console.error('Fetch tags error:', error);
    res.status(500).json({ error: 'Failed to retrieve tags' });
  }
});

module.exports = router;
