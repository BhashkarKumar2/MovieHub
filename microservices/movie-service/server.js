const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const winston = require('winston');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();

// Configure Winston Logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/movie-error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/movie-combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

// Database connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MOVIE_DB_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/movielist-movies');
    logger.info('Movie Service: MongoDB connected');
  } catch (error) {
    logger.error('Movie Service: MongoDB connection failed:', error);
    process.exit(1);
  }
};

connectDB();

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// Rate limiting
const movieLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: 'Too many requests',
    message: 'Please try again later'
  }
});

app.use(movieLimiter);

// Import services and routes
const movieRoutes = require('./routes/movieRoutes');
const cacheService = require('./services/cacheService');
const messageQueue = require('./services/messageQueue');

// Initialize services
cacheService.init();
messageQueue.init();

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    service: 'movie-service',
    status: 'OK',
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    cache: cacheService.isConnected() ? 'connected' : 'disconnected',
    version: '1.0.0'
  });
});

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info({
      service: 'movie-service',
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });
  });
  
  next();
});

// Routes
app.use('/api/movies', movieRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
});

// Global error handler
app.use((error, req, res, next) => {
  logger.error('Movie service error:', error);
  
  res.status(error.status || 500).json({
    success: false,
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

const PORT = process.env.MOVIE_SERVICE_PORT || 3002;

app.listen(PORT, () => {
  logger.info(`🎬 Movie Service running on port ${PORT}`);
  logger.info(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Movie Service running on http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received. Shutting down Movie Service gracefully...');
  await mongoose.connection.close();
  await cacheService.close();
  await messageQueue.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received. Shutting down Movie Service gracefully...');
  await mongoose.connection.close();
  await cacheService.close();
  await messageQueue.close();
  process.exit(0);
});
