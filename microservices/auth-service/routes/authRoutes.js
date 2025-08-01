const express = require('express');
const { body, validationResult } = require('express-validator');
const authController = require('../controllers/authController');

const router = express.Router();

// Validation middleware
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            error: 'Validation failed',
            message: 'Please check your input',
            details: errors.array().map(err => err.msg)
        });
    }
    next();
};

// Authentication middleware for protected routes
const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.header('Authorization');
        const token = authHeader && authHeader.startsWith('Bearer ') 
            ? authHeader.substring(7) 
            : null;

        if (!token) {
            return res.status(401).json({ 
                success: false,
                error: 'Access denied', 
                message: 'No token provided' 
            });
        }

        const authService = require('../services/authService');
        const decoded = authService.verifyToken(token);
        const User = require('../models/User');
        const user = await User.findById(decoded.id).select('-password -refreshTokens');
        
        if (!user) {
            return res.status(401).json({ 
                success: false,
                error: 'Access denied', 
                message: 'Invalid token' 
            });
        }

        if (authService.isAccountLocked(user)) {
            return res.status(423).json({ 
                success: false,
                error: 'Account locked', 
                message: 'Account is temporarily locked' 
            });
        }

        req.user = user;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ 
                success: false,
                error: 'Token expired', 
                message: 'Please refresh your token' 
            });
        }
        
        return res.status(401).json({ 
            success: false,
            error: 'Access denied', 
            message: 'Invalid token' 
        });
    }
};

// Validation rules
const registerValidation = [
    body('username')
        .isLength({ min: 3, max: 30 })
        .withMessage('Username must be between 3 and 30 characters')
        .matches(/^[a-zA-Z0-9_]+$/)
        .withMessage('Username can only contain letters, numbers, and underscores'),
    body('email')
        .isEmail()
        .withMessage('Please provide a valid email address')
        .isLength({ max: 100 })
        .withMessage('Email must not exceed 100 characters'),
    body('password')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .withMessage('Password must contain uppercase, lowercase, number, and special character')
];

const loginValidation = [
    body('username')
        .notEmpty()
        .withMessage('Username is required'),
    body('password')
        .notEmpty()
        .withMessage('Password is required')
];

const passwordResetValidation = [
    body('email')
        .isEmail()
        .withMessage('Please provide a valid email address')
];

// Public routes
router.post('/register', registerValidation, handleValidationErrors, authController.register);
router.post('/login', loginValidation, handleValidationErrors, authController.login);
router.post('/refresh', authController.refreshToken);
router.post('/forgot-password', passwordResetValidation, handleValidationErrors, authController.requestPasswordReset);

// Microservice communication routes
router.post('/validate-token', authController.validateToken);
router.get('/user/:userId', authController.getUserById);

// Protected routes
router.post('/logout', authenticate, authController.logout);

module.exports = router;
