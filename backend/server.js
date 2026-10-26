const http = require('http');
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const { Server } = require('socket.io');

// Load environment variables
dotenv.config();

const connectDB = require('./config/db');
const { initSocket } = require('./socket/socketHandler');

// Route imports
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const bookRoutes = require('./routes/bookRoutes');
const postRoutes = require('./routes/postRoutes');
const clubRoutes = require('./routes/clubRoutes');
const aiRoutes = require('./routes/aiRoutes');

const Book = require('./models/Book');
const { seedDatabase } = require('./seed');

// Initialize MongoDB and auto-seed if catalog is empty
connectDB().then(async () => {
  try {
    const count = await Book.countDocuments();
    if (count === 0) {
      console.log('[The Grand Archive] Catalog is empty. Auto-seeding initial books and authors...');
      await seedDatabase(false);
      console.log('[The Grand Archive] Auto-seed complete!');
    }
  } catch (err) {
    console.warn('[The Grand Archive] Auto-seed notice:', err.message);
  }
});

const app = express();
const server = http.createServer(app);

// Configure CORS
const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173'
];

app.use(cors({
  origin: (origin, callback) => {
    // allow requests with no origin (like mobile apps, curl, or Postman)
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(null, true); // Permissive in development
    }
  },
  credentials: true
}));

// Setup Socket.io
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

initSocket(io);

// Core Middlewares
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// API Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    archive: 'The Grand Archive API',
    timestamp: new Date().toISOString()
  });
});

// One-click Seed Endpoint
app.get('/api/seed', async (req, res) => {
  try {
    await seedDatabase(false);
    res.json({
      success: true,
      message: 'The Grand Archive database successfully inscribed with books, authors, and salons.'
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/clubs', clubRoutes);
app.use('/api/ai', aiRoutes);

// 404 Route Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `The archival corridor "${req.originalUrl}" does not exist in this library.`
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Archival Server Error]:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'An unforeseen error disrupted the library mechanisms.'
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, '0.0.0.0', () => {
  console.log(`[The Grand Archive] Server active on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});
