const express = require('express');
const authController = require('../controllers/authController');
const { rateLimit, authenticate, validateRequest } = require('../middleware/auth');
const SECURITY_CONFIG = require('../config/security');

const router = express.Router();

// Validation rules
const registerValidation = {
    username: { 
        required: true, 
        type: 'string', 
        minLength: 3, 
        maxLength: 30,
        pattern: SECURITY_CONFIG.PATTERNS.USERNAME,
        customMessage: 'can only contain letters, numbers, and underscores'
    },
    email: { 
        required: true, 
        type: 'string', 
        maxLength: 100,
        isEmail: true 
    },
    password: { 
        required: true, 
        type: 'string',
        minLength: SECURITY_CONFIG.PASSWORD.MIN_LENGTH
    }
};

const loginValidation = {
    username: { required: true, type: 'string' },
    password: { required: true, type: 'string' }
};

const profileUpdateValidation = {
    username: { 
        type: 'string', 
        minLength: 3, 
        maxLength: 30,
        pattern: SECURITY_CONFIG.PATTERNS.USERNAME
    },
    email: { 
        type: 'string', 
        maxLength: 100,
        isEmail: true 
    }
};

const passwordChangeValidation = {
    currentPassword: { required: true, type: 'string' },
    newPassword: { 
        required: true, 
        type: 'string',
        minLength: SECURITY_CONFIG.PASSWORD.MIN_LENGTH
    }
};

const passwordResetRequestValidation = {
    email: { required: true, type: 'string', isEmail: true }
};

const passwordResetValidation = {
    token: { required: true, type: 'string' },
    newPassword: { 
        required: true, 
        type: 'string',
        minLength: SECURITY_CONFIG.PASSWORD.MIN_LENGTH
    }
};

// Auth routes
router.post('/register', 
    rateLimit(SECURITY_CONFIG.RATE_LIMITS.REGISTER.WINDOW_MS, SECURITY_CONFIG.RATE_LIMITS.REGISTER.MAX_ATTEMPTS),
    validateRequest(registerValidation),
    authController.register
);

router.post('/login',
    rateLimit(SECURITY_CONFIG.RATE_LIMITS.LOGIN.WINDOW_MS, SECURITY_CONFIG.RATE_LIMITS.LOGIN.MAX_ATTEMPTS),
    validateRequest(loginValidation),
    authController.login
);

router.post('/refresh',
    rateLimit(5 * 60 * 1000, 10), // 10 attempts per 5 minutes
    authController.refreshToken
);

router.post('/logout',
    authenticate,
    authController.logout
);

router.post('/logout-all',
    authenticate,
    authController.logoutAll
);

router.get('/profile',
    authenticate,
    authController.getProfile
);

router.put('/profile',
    authenticate,
    validateRequest(profileUpdateValidation),
    authController.updateProfile
);

router.put('/change-password',
    authenticate,
    validateRequest(passwordChangeValidation),
    authController.changePassword
);

router.post('/forgot-password',
    rateLimit(SECURITY_CONFIG.RATE_LIMITS.PASSWORD_RESET.WINDOW_MS, SECURITY_CONFIG.RATE_LIMITS.PASSWORD_RESET.MAX_ATTEMPTS),
    validateRequest(passwordResetRequestValidation),
    authController.requestPasswordReset
);

router.post('/reset-password',
    rateLimit(SECURITY_CONFIG.RATE_LIMITS.PASSWORD_RESET.WINDOW_MS, 5),
    validateRequest(passwordResetValidation),
    authController.resetPassword
);

router.get('/security-info',
    authenticate,
    authController.getSecurityInfo
);

module.exports = router;
