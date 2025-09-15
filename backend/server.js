import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import connectDB from './config/database.js';
import { initializeFirebaseAdmin } from './config/firebase.js';

// Import routes
import userRoutes from './routes/users.js';
import noteRoutes from './routes/notes.js';
import progressRoutes from './routes/progress.js';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Initialize Firebase Admin
initializeFirebaseAdmin();

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

app.use(limiter);

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      process.env.FRONTEND_URL || process.env.CORS_ORIGIN || 'http://localhost:5173',
      'http://localhost:3000',
      'http://localhost:5174',
      'https://gradeupnow.netlify.app' // Production frontend URL
    ];
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware (development only)
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API routes
app.use('/api/users', userRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/progress', progressRoutes);

// API documentation endpoint
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'GradeUpNow API',
    version: '1.0.0',
    endpoints: {
      users: {
        'GET /api/users/profile': 'Get user profile',
        'POST /api/users/profile': 'Create/update user profile',
        'PATCH /api/users/profile': 'Update profile fields',
        'PATCH /api/users/profile/setup-step': 'Update profile setup step',
        'DELETE /api/users/profile': 'Delete user profile',
        'GET /api/users/profile/stats': 'Get profile statistics'
      },
      notes: {
        'GET /api/notes': 'Get user notes with filters',
        'GET /api/notes/search': 'Search notes',
        'GET /api/notes/:id': 'Get specific note',
        'POST /api/notes': 'Create new note',
        'PUT /api/notes/:id': 'Update note',
        'PATCH /api/notes/:id': 'Partially update note',
        'DELETE /api/notes/:id': 'Delete note',
        'GET /api/notes/stats/overview': 'Get note statistics'
      },
      progress: {
        'GET /api/progress': 'Get user progress',
        'POST /api/progress/course/:courseId': 'Update course progress',
        'POST /api/progress/course/:courseId/chapter': 'Add completed chapter',
        'POST /api/progress/course/:courseId/quiz': 'Add quiz score',
        'POST /api/progress/daily-activity': 'Update daily activity',
        'POST /api/progress/achievements': 'Add achievement',
        'GET /api/progress/analytics': 'Get progress analytics',
        'GET /api/progress/course/:courseId': 'Get course-specific progress'
      }
    },
    authentication: 'Bearer token required (Firebase ID token)',
    documentation: 'For detailed API documentation, visit the project README'
  });
});

// 404 handler for undefined routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Global error handler:', error);

  // CORS error
  if (error.message === 'Not allowed by CORS') {
    return res.status(403).json({
      success: false,
      message: 'CORS policy violation: Origin not allowed'
    });
  }

  // Mongoose validation error
  if (error.name === 'ValidationError') {
    const errors = Object.values(error.errors).map(err => ({
      field: err.path,
      message: err.message
    }));
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors
    });
  }

  // Mongoose duplicate key error
  if (error.code === 11000) {
    return res.status(409).json({
      success: false,
      message: 'Duplicate entry found',
      field: Object.keys(error.keyPattern)[0]
    });
  }

  // MongoDB connection error
  if (error.name === 'MongoServerError') {
    return res.status(503).json({
      success: false,
      message: 'Database connection error'
    });
  }

  // Default error response
  res.status(error.status || 500).json({
    success: false,
    message: error.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`
🚀 GradeUpNow API Server is running!
📍 Environment: ${process.env.NODE_ENV || 'development'}
🌐 Port: ${PORT}
🗄️  Database: MongoDB Atlas
🔐 Authentication: Firebase
📝 API Docs: http://localhost:${PORT}/api
🏥 Health Check: http://localhost:${PORT}/health
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  process.exit(0);
});

export default app;
