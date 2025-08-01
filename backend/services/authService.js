const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');

class AuthService {
    // Generate JWT tokens
    generateTokens(user) {
        const payload = {
            id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            isGoogleUser: user.isGoogleUser
        };

        const accessToken = jwt.sign(payload, process.env.JWT_SECRET, { 
            expiresIn: '15m' 
        });

        const refreshToken = jwt.sign(
            { id: user._id }, 
            process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET, 
            { expiresIn: '7d' }
        );

        return { accessToken, refreshToken };
    }

    // Verify JWT token
    verifyToken(token, isRefreshToken = false) {
        try {
            const secret = isRefreshToken 
                ? (process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET)
                : process.env.JWT_SECRET;
            
            return jwt.verify(token, secret);
        } catch (error) {
            throw new Error('Invalid token');
        }
    }

    // Generate secure random token
    generateSecureToken() {
        return crypto.randomBytes(32).toString('hex');
    }

    // Hash password
    async hashPassword(password) {
        const bcrypt = require('bcrypt');
        const salt = await bcrypt.genSalt(12);
        return await bcrypt.hash(password, salt);
    }

    // Validate password strength
    validatePassword(password) {
        const minLength = 8;
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumbers = /\d/.test(password);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

        const errors = [];
        
        if (password.length < minLength) {
            errors.push('Password must be at least 8 characters long');
        }
        if (!hasUpperCase) {
            errors.push('Password must contain at least one uppercase letter');
        }
        if (!hasLowerCase) {
            errors.push('Password must contain at least one lowercase letter');
        }
        if (!hasNumbers) {
            errors.push('Password must contain at least one number');
        }
        if (!hasSpecialChar) {
            errors.push('Password must contain at least one special character');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    // Check if user account is locked
    isAccountLocked(user) {
        return !!(user.lockUntil && user.lockUntil > Date.now());
    }

    // Rate limiting check
    checkRateLimit(attempts, windowMs = 15 * 60 * 1000) { // 15 minutes
        const maxAttempts = 5;
        return attempts < maxAttempts;
    }

    // Generate password reset token
    generatePasswordResetToken() {
        const token = this.generateSecureToken();
        const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
        return { token, expires };
    }

    // Generate email verification token
    generateEmailVerificationToken() {
        return this.generateSecureToken();
    }

    // Sanitize user data for response
    sanitizeUser(user) {
        const userObj = user.toObject ? user.toObject() : user;
        delete userObj.password;
        delete userObj.refreshTokens;
        delete userObj.passwordResetToken;
        delete userObj.passwordResetExpires;
        delete userObj.emailVerificationToken;
        delete userObj.twoFactorSecret;
        delete userObj.loginAttempts;
        delete userObj.lockUntil;
        return userObj;
    }

    // Extract client info from request
    extractClientInfo(req) {
        return {
            ipAddress: req.ip || req.connection.remoteAddress,
            userAgent: req.get('User-Agent') || 'Unknown'
        };
    }

    // Update last login info
    async updateLastLogin(userId, clientInfo) {
        await User.findByIdAndUpdate(userId, {
            lastLogin: new Date(),
            ipAddress: clientInfo.ipAddress,
            userAgent: clientInfo.userAgent
        });
    }

    // Refresh access token
    async refreshAccessToken(refreshToken) {
        try {
            const decoded = this.verifyToken(refreshToken, true);
            const user = await User.findById(decoded.id);
            
            if (!user) {
                throw new Error('User not found');
            }

            // Check if refresh token exists in user's tokens
            const tokenExists = user.refreshTokens.some(rt => rt.token === refreshToken);
            if (!tokenExists) {
                throw new Error('Invalid refresh token');
            }

            // Clean expired tokens
            await user.cleanExpiredTokens();

            // Generate new access token
            const { accessToken } = this.generateTokens(user);
            
            return {
                accessToken,
                user: this.sanitizeUser(user)
            };
        } catch (error) {
            throw new Error('Invalid refresh token');
        }
    }

    // Logout user (remove refresh token)
    async logout(userId, refreshToken) {
        const user = await User.findById(userId);
        if (user && refreshToken) {
            await user.removeRefreshToken(refreshToken);
        }
    }

    // Logout from all devices
    async logoutAll(userId) {
        const user = await User.findById(userId);
        if (user) {
            user.refreshTokens = [];
            await user.save();
        }
    }
}

module.exports = new AuthService();
