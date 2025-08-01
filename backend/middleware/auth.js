const jwt = require('jsonwebtoken');
const User = require('../models/User');
const authService = require('../services/authService');

// Rate limiting storage (in production, use Redis)
const rateLimitStore = new Map();

// Rate limiting middleware
const rateLimit = (windowMs = 15 * 60 * 1000, maxAttempts = 5) => {
    return (req, res, next) => {
        const key = req.ip;
        const now = Date.now();
        
        if (!rateLimitStore.has(key)) {
            rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
            return next();
        }
        
        const record = rateLimitStore.get(key);
        
        if (now > record.resetTime) {
            record.count = 1;
            record.resetTime = now + windowMs;
            return next();
        }
        
        if (record.count >= maxAttempts) {
            return res.status(429).json({
                error: 'Too many requests',
                message: 'Please try again later',
                retryAfter: Math.ceil((record.resetTime - now) / 1000)
            });
        }
        
        record.count++;
        next();
    };
};

// Authentication middleware
const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.header('Authorization');
        const token = authHeader && authHeader.startsWith('Bearer ') 
            ? authHeader.substring(7) 
            : null;

        if (!token) {
            return res.status(401).json({ 
                error: 'Access denied', 
                message: 'No token provided' 
            });
        }

        const decoded = authService.verifyToken(token);
        const user = await User.findById(decoded.id).select('-password -refreshTokens');
        
        if (!user) {
            return res.status(401).json({ 
                error: 'Access denied', 
                message: 'Invalid token' 
            });
        }

        // Check if account is locked
        if (authService.isAccountLocked(user)) {
            return res.status(423).json({ 
                error: 'Account locked', 
                message: 'Account is temporarily locked due to too many failed login attempts' 
            });
        }

        req.user = user;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ 
                error: 'Token expired', 
                message: 'Please refresh your token' 
            });
        }
        
        return res.status(401).json({ 
            error: 'Access denied', 
            message: 'Invalid token' 
        });
    }
};

// Authorization middleware
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ 
                error: 'Access denied', 
                message: 'Authentication required' 
            });
        }

        if (roles.length && !roles.includes(req.user.role)) {
            return res.status(403).json({ 
                error: 'Forbidden', 
                message: 'Insufficient permissions' 
            });
        }

        next();
    };
};

// Optional authentication (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.header('Authorization');
        const token = authHeader && authHeader.startsWith('Bearer ') 
            ? authHeader.substring(7) 
            : null;

        if (token) {
            const decoded = authService.verifyToken(token);
            const user = await User.findById(decoded.id).select('-password -refreshTokens');
            
            if (user && !authService.isAccountLocked(user)) {
                req.user = user;
            }
        }
        
        next();
    } catch (error) {
        // Continue without user if token is invalid
        next();
    }
};

// Validate request body middleware
const validateRequest = (validationRules) => {
    return (req, res, next) => {
        const errors = [];
        
        for (const field in validationRules) {
            const rules = validationRules[field];
            const value = req.body[field];
            
            // Required check
            if (rules.required && (!value || value.toString().trim() === '')) {
                errors.push(`${field} is required`);
                continue;
            }
            
            // Skip other validations if field is not required and empty
            if (!rules.required && (!value || value.toString().trim() === '')) {
                continue;
            }
            
            // Type check
            if (rules.type && typeof value !== rules.type) {
                errors.push(`${field} must be of type ${rules.type}`);
            }
            
            // String length check
            if (rules.minLength && value.length < rules.minLength) {
                errors.push(`${field} must be at least ${rules.minLength} characters long`);
            }
            
            if (rules.maxLength && value.length > rules.maxLength) {
                errors.push(`${field} must be no more than ${rules.maxLength} characters long`);
            }
            
            // Email validation
            if (rules.isEmail) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(value)) {
                    errors.push(`${field} must be a valid email address`);
                }
            }
            
            // Pattern validation
            if (rules.pattern && !rules.pattern.test(value)) {
                errors.push(`${field} format is invalid`);
            }
            
            // Custom validation
            if (rules.custom && !rules.custom(value)) {
                errors.push(`${field} ${rules.customMessage || 'is invalid'}`);
            }
        }
        
        if (errors.length > 0) {
            return res.status(400).json({
                error: 'Validation failed',
                message: 'Please check your input',
                details: errors
            });
        }
        
        next();
    };
};

// Security headers middleware
const securityHeaders = (req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Content-Security-Policy', "default-src 'self'");
    next();
};

// Request logging middleware
const requestLogger = (req, res, next) => {
    const start = Date.now();
    
    res.on('finish', () => {
        const duration = Date.now() - start;
        const clientInfo = authService.extractClientInfo(req);
        
        console.log({
            method: req.method,
            url: req.url,
            statusCode: res.statusCode,
            duration: `${duration}ms`,
            ip: clientInfo.ipAddress,
            userAgent: clientInfo.userAgent,
            user: req.user ? req.user.username : 'anonymous',
            timestamp: new Date().toISOString()
        });
    });
    
    next();
};

module.exports = {
    rateLimit,
    authenticate,
    authorize,
    optionalAuth,
    validateRequest,
    securityHeaders,
    requestLogger
};
