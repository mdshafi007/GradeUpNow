import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import connectDB from './config/database.js';
import { initializeFirebaseAdmin } from './config/firebase.js';

// Import routes
import adminRoutes from './routes/admin.js';
import collegeRoutes from './routes/college.js';
import lmsQuizRoutes from './routes/lmsQuiz.js';
import studentQuizRoutes from './routes/studentQuiz.js';
import studentCodingTestRoutes from './routes/studentCodingAPI.js';
import codingTestRoutes from './routes/codingTest_lms.js';

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
    
    // Normalize URLs by removing trailing slashes
    const normalizeUrl = (url) => url ? url.replace(/\/$/, '') : url;
    
    const allowedOrigins = [
      normalizeUrl(process.env.FRONTEND_URL) || 'https://gradeupnow.netlify.app',
      normalizeUrl(process.env.CORS_ORIGIN) || 'http://localhost:5173',
      'http://localhost:3000',
      'http://localhost:5174',
      'https://gradeupnow.app',
      'https://gradeupnow.netlify.app',
      'https://gradeupnow.onrender.com'
    ];
    
    const normalizedOrigin = normalizeUrl(origin);
    
    console.log('CORS Check - Origin:', origin);
    console.log('CORS Check - Normalized Origin:', normalizedOrigin);
    console.log('CORS Check - Allowed Origins:', allowedOrigins);
    console.log('CORS Check - FRONTEND_URL env:', process.env.FRONTEND_URL);
    
    if (allowedOrigins.indexOf(normalizedOrigin) !== -1) {
      console.log('CORS - Origin allowed');
      callback(null, true);
    } else {
      console.error('CORS - Origin NOT allowed:', normalizedOrigin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin', 'rollnumber', 'collegecode']
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

// Debug endpoint for analytics troubleshooting  
app.get('/api/debug/analytics/:quizId', (req, res) => {
  res.json({
    success: true,
    message: 'Analytics debug endpoint working',
    quizId: req.params.quizId,
    headers: req.headers,
    timestamp: new Date().toISOString(),
    note: 'If this works, check /api/admin/quiz/:quizId/analytics endpoint',
    expectedEndpoint: `/api/admin/quiz/${req.params.quizId}/analytics`
  });
});

// API routes
app.use('/api/admin', adminRoutes);
app.use('/api/college', collegeRoutes);
app.use('/api/admin/quiz', lmsQuizRoutes);
app.use('/api/admin/coding-test', codingTestRoutes);
app.use('/api/student', studentQuizRoutes);
app.use('/api/student', studentCodingTestRoutes);

// API documentation endpoint
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'GradeUpNow API',
    version: '1.0.0',
    endpoints: {
      admin: {
        'POST /api/admin/login': 'Admin login',
        'GET /api/admin/dashboard': 'Admin dashboard data',
        'GET /api/admin/students': 'Get students list',
        'POST /api/admin/students': 'Create student',
        'POST /api/admin/students/bulk': 'Create students in bulk'
      },
      college: {
        'POST /api/college/login': 'College portal login',
        'GET /api/college/assessments': 'Get college assessments'
      },
      quiz: {
        'GET /api/quiz/:type': 'Get quiz questions',
        'POST /api/quiz/submit': 'Submit quiz answers'
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
