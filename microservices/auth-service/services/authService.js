const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');

class AuthService {
    generateTokens(user) {
        const payload = {
            id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            isGoogleUser: user.isGoogleUser
        };

        const accessToken = jwt.sign(payload, process.env.JWT_SECRET, { 
            expiresIn: '15m',
            issuer: 'auth-service',
            audience: 'movie-list-app'
        });

        const refreshToken = jwt.sign(
            { id: user._id }, 
            process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET, 
            { 
                expiresIn: '7d',
                issuer: 'auth-service',
                audience: 'movie-list-app'
            }
        );

        return { accessToken, refreshToken };
    }

    verifyToken(token, isRefreshToken = false) {
        try {
            const secret = isRefreshToken 
                ? (process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET)
                : process.env.JWT_SECRET;
            
            return jwt.verify(token, secret, {
                issuer: 'auth-service',
                audience: 'movie-list-app'
            });
        } catch (error) {
            throw new Error('Invalid token');
        }
    }

    generateSecureToken() {
        return crypto.randomBytes(32).toString('hex');
    }

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

    isAccountLocked(user) {
        return !!(user.lockUntil && user.lockUntil > Date.now());
    }

    generatePasswordResetToken() {
        const token = this.generateSecureToken();
        const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
        return { token, expires };
    }

    generateEmailVerificationToken() {
        return this.generateSecureToken();
    }

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

    extractClientInfo(req) {
        return {
            ipAddress: req.ip || req.connection.remoteAddress,
            userAgent: req.get('User-Agent') || 'Unknown'
        };
    }

    async updateLastLogin(userId, clientInfo) {
        await User.findByIdAndUpdate(userId, {
            lastLogin: new Date(),
            ipAddress: clientInfo.ipAddress,
            userAgent: clientInfo.userAgent
        });
    }

    async refreshAccessToken(refreshToken) {
        try {
            const decoded = this.verifyToken(refreshToken, true);
            const user = await User.findById(decoded.id);
            
            if (!user) {
                throw new Error('User not found');
            }

            const tokenExists = user.refreshTokens.some(rt => rt.token === refreshToken);
            if (!tokenExists) {
                throw new Error('Invalid refresh token');
            }

            await user.cleanExpiredTokens();

            const { accessToken } = this.generateTokens(user);
            
            return {
                accessToken,
                user: this.sanitizeUser(user)
            };
        } catch (error) {
            throw new Error('Invalid refresh token');
        }
    }

    async logout(userId, refreshToken) {
        const user = await User.findById(userId);
        if (user && refreshToken) {
            await user.removeRefreshToken(refreshToken);
        }
    }

    async logoutAll(userId) {
        const user = await User.findById(userId);
        if (user) {
            user.refreshTokens = [];
            await user.save();
        }
    }

    // Microservice-specific methods
    async validateTokenForService(token) {
        try {
            const decoded = this.verifyToken(token);
            const user = await User.findById(decoded.id).select('-password -refreshTokens');
            
            if (!user) {
                throw new Error('User not found');
            }

            if (this.isAccountLocked(user)) {
                throw new Error('Account locked');
            }

            return {
                valid: true,
                user: this.sanitizeUser(user)
            };
        } catch (error) {
            return {
                valid: false,
                error: error.message
            };
        }
    }

    async getUserById(userId) {
        try {
            const user = await User.findById(userId).select('-password -refreshTokens');
            return user ? this.sanitizeUser(user) : null;
        } catch (error) {
            return null;
        }
    }
}

module.exports = new AuthService();
