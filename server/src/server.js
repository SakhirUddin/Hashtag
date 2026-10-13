const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { router: authRouter } = require('./routes/auth');
const photosRouter = require('./routes/photos');
const tagsRouter = require('./routes/tags');
const adminRouter = require('./routes/admin');
const usersRouter = require('./routes/users');
const collectionsRouter = require('./routes/collections');

const app = express();
app.enable('trust proxy');
const PORT = process.env.PORT || 5000;

// Enable CORS for frontend
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded media files statically
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Mount API routes
app.use('/api/auth', authRouter);
app.use('/api/photos', photosRouter);
app.use('/api/tags', tagsRouter);
app.use('/api/admin', adminRouter);
app.use('/api/users', usersRouter);
app.use('/api/collections', collectionsRouter);

// Root & Health check endpoints
app.get('/', (req, res) => {
  res.json({
    name: '#Hashtag Cloud API',
    status: 'online',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      photos: '/api/photos',
      tags: '/api/tags',
      auth: '/api/auth',
      users: '/api/users',
      collections: '/api/collections',
      admin: '/api/admin',
    },
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: '#Hashtag API is running cleanly',
    timestamp: new Date().toISOString(),
  });
});

// Start listener
app.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(`🚀 #Hashtag API Server running on port ${PORT}`);
  console.log(`👉 Health check: http://localhost:${PORT}/api/health`);
  console.log(`👉 Photos API:   http://localhost:${PORT}/api/photos`);
  console.log(`=========================================`);
});
