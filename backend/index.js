
require('dotenv').config({ path: '../.env' });
const express = require("express");
const connectDB = require('./config/database');
const corsMiddleware = require('./middleware/cors');
const passport = require('./config/passport');
const { securityHeaders, requestLogger } = require('./middleware/auth');

// Import routes
const authRoutes = require('./routes/auth');
const movieRoutes = require('./routes/movies');
const reviewRoutes = require('./routes/reviews');

const app = express();

// Connect to MongoDB
connectDB();

// Security middleware
app.use(securityHeaders);
app.use(requestLogger);

// CORS and basic middleware
app.use(corsMiddleware);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Passport middleware
app.use(passport.initialize());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/auth', require('./routes/passportAuth'));
app.use('/api/movies', movieRoutes);
app.use('/api/movies', reviewRoutes);

// For backward compatibility - keep the old routes
app.use('/', authRoutes);
app.use('/movies', movieRoutes);
app.use('/movies', reviewRoutes);

// Global error handler
app.use((error, req, res, next) => {
    console.error('Global error handler:', error);
    
    // Don't leak error details in production
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    res.status(error.status || 500).json({
        error: 'Internal server error',
        message: isDevelopment ? error.message : 'Something went wrong',
        ...(isDevelopment && { stack: error.stack })
    });
});

// Handle 404 routes
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Route not found',
        message: `Cannot ${req.method} ${req.originalUrl}`
    });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔒 Security headers enabled`);
    console.log(`📊 Request logging enabled`);
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
