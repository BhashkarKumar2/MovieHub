const User = require('../models/User');
const authService = require('../services/authService');
const messageQueue = require('../services/messageQueue');
const winston = require('winston');

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'logs/auth-controller.log' })
    ]
});

class AuthController {
    async register(req, res) {
        try {
            const { username, email, password } = req.body;
            const clientInfo = authService.extractClientInfo(req);

            const existingUser = await User.findOne({
                $or: [{ username }, { email }]
            });

            if (existingUser) {
                return res.status(409).json({
                    success: false,
                    error: 'User already exists',
                    message: existingUser.username === username 
                        ? 'Username is already taken' 
                        : 'Email is already registered'
                });
            }

            const passwordValidation = authService.validatePassword(password);
            if (!passwordValidation.isValid) {
                return res.status(400).json({
                    success: false,
                    error: 'Weak password',
                    message: 'Password does not meet security requirements',
                    details: passwordValidation.errors
                });
            }

            const user = new User({
                username,
                email,
                password,
                emailVerificationToken: authService.generateEmailVerificationToken(),
                ipAddress: clientInfo.ipAddress,
                userAgent: clientInfo.userAgent
            });

            await user.save();

            // Publish user registration event
            await messageQueue.publishUserRegistered(user);

            const { accessToken, refreshToken } = authService.generateTokens(user);
            await user.addRefreshToken(refreshToken);
            await authService.updateLastLogin(user._id, clientInfo);

            logger.info('User registered successfully', { 
                userId: user._id, 
                username: user.username,
                service: 'auth-service'
            });

            res.status(201).json({
                success: true,
                message: 'User registered successfully',
                data: {
                    user: authService.sanitizeUser(user),
                    accessToken,
                    refreshToken,
                    expiresIn: '15m'
                }
            });

        } catch (error) {
            logger.error('Registration error:', error);
            res.status(500).json({
                success: false,
                error: 'Registration failed',
                message: 'An error occurred during registration'
            });
        }
    }

    async login(req, res) {
        try {
            const { username, password } = req.body;
            const clientInfo = authService.extractClientInfo(req);

            const user = await User.findOne({ username });

            if (!user) {
                return res.status(401).json({
                    success: false,
                    error: 'Invalid credentials',
                    message: 'Username or password is incorrect'
                });
            }

            if (authService.isAccountLocked(user)) {
                const lockTimeRemaining = Math.ceil((user.lockUntil - Date.now()) / (1000 * 60));
                return res.status(423).json({
                    success: false,
                    error: 'Account locked',
                    message: `Account is locked for ${lockTimeRemaining} more minutes`
                });
            }

            const isPasswordValid = await user.comparePassword(password);

            if (!isPasswordValid) {
                await user.incLoginAttempts();
                const remainingAttempts = 5 - (user.loginAttempts + 1);
                
                return res.status(401).json({
                    success: false,
                    error: 'Invalid credentials',
                    message: 'Username or password is incorrect',
                    remainingAttempts: Math.max(0, remainingAttempts)
                });
            }

            if (user.loginAttempts > 0) {
                await user.resetLoginAttempts();
            }

            const { accessToken, refreshToken } = authService.generateTokens(user);
            await user.addRefreshToken(refreshToken);
            await authService.updateLastLogin(user._id, clientInfo);

            // Publish login event
            await messageQueue.publishUserLoggedIn(user, {
                loginTime: new Date(),
                ipAddress: clientInfo.ipAddress,
                userAgent: clientInfo.userAgent
            });

            logger.info('User logged in successfully', { 
                userId: user._id, 
                username: user.username,
                service: 'auth-service'
            });

            res.json({
                success: true,
                message: 'Login successful',
                data: {
                    user: authService.sanitizeUser(user),
                    accessToken,
                    refreshToken,
                    expiresIn: '15m'
                }
            });

        } catch (error) {
            logger.error('Login error:', error);
            res.status(500).json({
                success: false,
                error: 'Login failed',
                message: 'An error occurred during login'
            });
        }
    }

    async refreshToken(req, res) {
        try {
            const { refreshToken } = req.body;

            if (!refreshToken) {
                return res.status(401).json({
                    success: false,
                    error: 'Refresh token required',
                    message: 'Please provide a refresh token'
                });
            }

            const result = await authService.refreshAccessToken(refreshToken);

            res.json({
                success: true,
                message: 'Token refreshed successfully',
                data: {
                    accessToken: result.accessToken,
                    user: result.user,
                    expiresIn: '15m'
                }
            });

        } catch (error) {
            logger.error('Token refresh error:', error);
            res.status(401).json({
                success: false,
                error: 'Invalid refresh token',
                message: 'Please login again'
            });
        }
    }

    async logout(req, res) {
        try {
            const { refreshToken } = req.body;
            await authService.logout(req.user._id, refreshToken);

            logger.info('User logged out successfully', { 
                userId: req.user._id,
                service: 'auth-service'
            });

            res.json({
                success: true,
                message: 'Logged out successfully'
            });

        } catch (error) {
            logger.error('Logout error:', error);
            res.status(500).json({
                success: false,
                error: 'Logout failed',
                message: 'An error occurred during logout'
            });
        }
    }

    async validateToken(req, res) {
        try {
            const { token } = req.body;
            
            if (!token) {
                return res.status(400).json({
                    success: false,
                    error: 'Token required',
                    message: 'Please provide a token to validate'
                });
            }

            const result = await authService.validateTokenForService(token);

            if (result.valid) {
                res.json({
                    success: true,
                    message: 'Token is valid',
                    data: {
                        user: result.user
                    }
                });
            } else {
                res.status(401).json({
                    success: false,
                    error: 'Invalid token',
                    message: result.error
                });
            }

        } catch (error) {
            logger.error('Token validation error:', error);
            res.status(500).json({
                success: false,
                error: 'Token validation failed',
                message: 'An error occurred during token validation'
            });
        }
    }

    async getUserById(req, res) {
        try {
            const { userId } = req.params;
            const user = await authService.getUserById(userId);

            if (!user) {
                return res.status(404).json({
                    success: false,
                    error: 'User not found',
                    message: 'User does not exist'
                });
            }

            res.json({
                success: true,
                data: {
                    user
                }
            });

        } catch (error) {
            logger.error('Get user error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to get user',
                message: 'An error occurred while fetching user'
            });
        }
    }

    // Additional methods from original controller...
    async requestPasswordReset(req, res) {
        try {
            const { email } = req.body;

            const user = await User.findOne({ email });
            if (!user) {
                return res.json({
                    success: true,
                    message: 'If the email exists, a password reset link has been sent'
                });
            }

            const { token, expires } = authService.generatePasswordResetToken();
            
            user.passwordResetToken = token;
            user.passwordResetExpires = expires;
            await user.save();

            // Publish password reset event
            await messageQueue.publishPasswordResetRequested(user, token);

            logger.info('Password reset requested', { 
                userId: user._id, 
                email: user.email,
                service: 'auth-service'
            });

            res.json({
                success: true,
                message: 'If the email exists, a password reset link has been sent',
                ...(process.env.NODE_ENV === 'development' && { resetToken: token })
            });

        } catch (error) {
            logger.error('Password reset request error:', error);
            res.status(500).json({
                success: false,
                error: 'Password reset failed',
                message: 'An error occurred while processing password reset'
            });
        }
    }
}

module.exports = new AuthController();
