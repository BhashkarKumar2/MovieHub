const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');
const winston = require('winston');
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
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// Rate limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs
  message: {
    error: 'Too many requests',
    message: 'Please try again later'
  }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 auth requests per windowMs
  message: {
    error: 'Too many authentication attempts',
    message: 'Please try again later'
  }
});

app.use(generalLimiter);

// Service URLs
const SERVICES = {
  AUTH: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
  MOVIE: process.env.MOVIE_SERVICE_URL || 'http://localhost:3002',
  REVIEW: process.env.REVIEW_SERVICE_URL || 'http://localhost:3003',
  NOTIFICATION: process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3004'
};

// Authentication middleware for protected routes
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    logger.error('Token verification failed:', error);
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info({
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      user: req.user ? req.user.username : 'anonymous'
    });
  });
  
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    services: Object.keys(SERVICES),
    version: '1.0.0'
  });
});

// Service status endpoint
app.get('/status', async (req, res) => {
  const axios = require('axios');
  const serviceStatus = {};
  
  for (const [serviceName, serviceUrl] of Object.entries(SERVICES)) {
    try {
      const response = await axios.get(`${serviceUrl}/health`, { timeout: 5000 });
      serviceStatus[serviceName] = {
        status: 'UP',
        url: serviceUrl,
        responseTime: response.headers['x-response-time'] || 'N/A'
      };
    } catch (error) {
      serviceStatus[serviceName] = {
        status: 'DOWN',
        url: serviceUrl,
        error: error.message
      };
    }
  }
  
  res.json({
    gateway: 'UP',
    services: serviceStatus,
    timestamp: new Date().toISOString()
  });
});

// Auth Service Proxy (Public routes)
app.use('/api/auth', authLimiter, createProxyMiddleware({
  target: SERVICES.AUTH,
  changeOrigin: true,
  pathRewrite: {
    '^/api/auth': '/api/auth'
  },
  onError: (err, req, res) => {
    logger.error('Auth service proxy error:', err);
    res.status(503).json({
      error: 'Auth service unavailable',
      message: 'Please try again later'
    });
  }
}));

// Movie Service Proxy (Some routes need authentication)
app.use('/api/movies', (req, res, next) => {
  // Check if this is a protected route
  const protectedMethods = ['POST', 'PUT', 'DELETE'];
  const isProtected = protectedMethods.includes(req.method) || req.path.includes('/admin');
  
  if (isProtected) {
    return authenticateToken(req, res, next);
  }
  next();
}, createProxyMiddleware({
  target: SERVICES.MOVIE,
  changeOrigin: true,
  pathRewrite: {
    '^/api/movies': '/api/movies'
  },
  onError: (err, req, res) => {
    logger.error('Movie service proxy error:', err);
    res.status(503).json({
      error: 'Movie service unavailable',
      message: 'Please try again later'
    });
  }
}));

// Review Service Proxy (Protected routes)
app.use('/api/reviews', authenticateToken, createProxyMiddleware({
  target: SERVICES.REVIEW,
  changeOrigin: true,
  pathRewrite: {
    '^/api/reviews': '/api/reviews'
  },
  onError: (err, req, res) => {
    logger.error('Review service proxy error:', err);
    res.status(503).json({
      error: 'Review service unavailable',
      message: 'Please try again later'
    });
  }
}));

// Notification Service Proxy (Protected routes)
app.use('/api/notifications', authenticateToken, createProxyMiddleware({
  target: SERVICES.NOTIFICATION,
  changeOrigin: true,
  pathRewrite: {
    '^/api/notifications': '/api/notifications'
  },
  onError: (err, req, res) => {
    logger.error('Notification service proxy error:', err);
    res.status(503).json({
      error: 'Notification service unavailable',
      message: 'Please try again later'
    });
  }
}));

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
});

// Global error handler
app.use((error, req, res, next) => {
  logger.error('Global error handler:', error);
  
  res.status(error.status || 500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});

const PORT = process.env.GATEWAY_PORT || 3000;

app.listen(PORT, () => {
  logger.info(`🚀 API Gateway running on port ${PORT}`);
  logger.info(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info('🔗 Service URLs:', SERVICES);
  console.log(`API Gateway running on http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received. Shutting down gracefully...');
  process.exit(0);
});
