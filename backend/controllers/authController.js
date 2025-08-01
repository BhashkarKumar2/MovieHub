const User = require('../models/User');
const authService = require('../services/authService');
const emailService = require('../services/emailService');
const SECURITY_CONFIG = require('../config/security');

class AuthController {
    // User registration
    async register(req, res) {
        try {
            const { username, email, password } = req.body;
            const clientInfo = authService.extractClientInfo(req);

            // Check if user already exists
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

            // Validate password strength
            const passwordValidation = authService.validatePassword(password);
            if (!passwordValidation.isValid) {
                return res.status(400).json({
                    success: false,
                    error: 'Weak password',
                    message: 'Password does not meet security requirements',
                    details: passwordValidation.errors
                });
            }

            // Create new user
            const user = new User({
                username,
                email,
                password,
                emailVerificationToken: authService.generateEmailVerificationToken(),
                ipAddress: clientInfo.ipAddress,
                userAgent: clientInfo.userAgent
            });

            await user.save();

            // Generate tokens
            const { accessToken, refreshToken } = authService.generateTokens(user);
            
            // Add refresh token to user
            await user.addRefreshToken(refreshToken);

            // Update last login
            await authService.updateLastLogin(user._id, clientInfo);

            res.status(201).json({
                success: true,
                message: 'User registered successfully',
                data: {
                    user: authService.sanitizeUser(user),
                    accessToken,
                    refreshToken,
                    expiresIn: SECURITY_CONFIG.JWT.ACCESS_TOKEN_EXPIRY
                }
            });

        } catch (error) {
            console.error('Registration error:', error);
            res.status(500).json({
                success: false,
                error: 'Registration failed',
                message: 'An error occurred during registration'
            });
        }
    }

    // User login
    async login(req, res) {
        try {
            const { username, password } = req.body;
            const clientInfo = authService.extractClientInfo(req);

            // Find user
            const user = await User.findOne({ username });

            if (!user) {
                return res.status(401).json({
                    success: false,
                    error: 'Invalid credentials',
                    message: 'Username or password is incorrect'
                });
            }

            // Check if account is locked
            if (authService.isAccountLocked(user)) {
                const lockTimeRemaining = Math.ceil((user.lockUntil - Date.now()) / (1000 * 60));
                return res.status(423).json({
                    success: false,
                    error: 'Account locked',
                    message: `Account is locked for ${lockTimeRemaining} more minutes due to multiple failed login attempts`
                });
            }

            // Verify password
            const isPasswordValid = await user.comparePassword(password);

            if (!isPasswordValid) {
                await user.incLoginAttempts();
                
                const remainingAttempts = SECURITY_CONFIG.ACCOUNT_LOCKOUT.MAX_LOGIN_ATTEMPTS - (user.loginAttempts + 1);
                
                return res.status(401).json({
                    success: false,
                    error: 'Invalid credentials',
                    message: 'Username or password is incorrect',
                    remainingAttempts: Math.max(0, remainingAttempts)
                });
            }

            // Reset login attempts on successful login
            if (user.loginAttempts > 0) {
                await user.resetLoginAttempts();
            }

            // Generate tokens
            const { accessToken, refreshToken } = authService.generateTokens(user);
            
            // Add refresh token to user
            await user.addRefreshToken(refreshToken);

            // Update last login
            await authService.updateLastLogin(user._id, clientInfo);

            res.json({
                success: true,
                message: 'Login successful',
                data: {
                    user: authService.sanitizeUser(user),
                    accessToken,
                    refreshToken,
                    expiresIn: SECURITY_CONFIG.JWT.ACCESS_TOKEN_EXPIRY
                }
            });

        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({
                success: false,
                error: 'Login failed',
                message: 'An error occurred during login'
            });
        }
    }

    // Refresh token
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
                    expiresIn: SECURITY_CONFIG.JWT.ACCESS_TOKEN_EXPIRY
                }
            });

        } catch (error) {
            console.error('Token refresh error:', error);
            res.status(401).json({
                success: false,
                error: 'Invalid refresh token',
                message: 'Please login again'
            });
        }
    }

    // Logout
    async logout(req, res) {
        try {
            const { refreshToken } = req.body;
            await authService.logout(req.user._id, refreshToken);

            res.json({
                success: true,
                message: 'Logged out successfully'
            });

        } catch (error) {
            console.error('Logout error:', error);
            res.status(500).json({
                success: false,
                error: 'Logout failed',
                message: 'An error occurred during logout'
            });
        }
    }

    // Logout from all devices
    async logoutAll(req, res) {
        try {
            await authService.logoutAll(req.user._id);

            res.json({
                success: true,
                message: 'Logged out from all devices successfully'
            });

        } catch (error) {
            console.error('Logout all error:', error);
            res.status(500).json({
                success: false,
                error: 'Logout failed',
                message: 'An error occurred during logout'
            });
        }
    }

    // Get user profile
    async getProfile(req, res) {
        try {
            res.json({
                success: true,
                data: {
                    user: authService.sanitizeUser(req.user)
                }
            });
        } catch (error) {
            console.error('Profile fetch error:', error);
            res.status(500).json({
                success: false,
                error: 'Profile fetch failed',
                message: 'An error occurred while fetching profile'
            });
        }
    }

    // Update profile
    async updateProfile(req, res) {
        try {
            const { username, email } = req.body;
            const updates = {};

            if (username && username !== req.user.username) {
                const existingUser = await User.findOne({ username });
                if (existingUser) {
                    return res.status(409).json({
                        success: false,
                        error: 'Username taken',
                        message: 'Username is already taken'
                    });
                }
                updates.username = username;
            }

            if (email && email !== req.user.email) {
                const existingUser = await User.findOne({ email });
                if (existingUser) {
                    return res.status(409).json({
                        success: false,
                        error: 'Email taken',
                        message: 'Email is already taken'
                    });
                }
                updates.email = email;
                updates.isEmailVerified = false;
                updates.emailVerificationToken = authService.generateEmailVerificationToken();
            }

            if (Object.keys(updates).length === 0) {
                return res.status(400).json({
                    success: false,
                    error: 'No updates provided',
                    message: 'Please provide fields to update'
                });
            }

            const updatedUser = await User.findByIdAndUpdate(
                req.user._id,
                updates,
                { new: true, runValidators: true }
            );

            res.json({
                success: true,
                message: 'Profile updated successfully',
                data: {
                    user: authService.sanitizeUser(updatedUser)
                }
            });

        } catch (error) {
            console.error('Profile update error:', error);
            res.status(500).json({
                success: false,
                error: 'Profile update failed',
                message: 'An error occurred while updating profile'
            });
        }
    }

    // Change password
    async changePassword(req, res) {
        try {
            const { currentPassword, newPassword } = req.body;

            // Verify current password
            const isCurrentPasswordValid = await req.user.comparePassword(currentPassword);
            if (!isCurrentPasswordValid) {
                return res.status(401).json({
                    success: false,
                    error: 'Invalid current password',
                    message: 'Current password is incorrect'
                });
            }

            // Validate new password
            const passwordValidation = authService.validatePassword(newPassword);
            if (!passwordValidation.isValid) {
                return res.status(400).json({
                    success: false,
                    error: 'Weak password',
                    message: 'New password does not meet security requirements',
                    details: passwordValidation.errors
                });
            }

            // Update password
            req.user.password = newPassword;
            await req.user.save();

            // Logout from all devices for security
            await authService.logoutAll(req.user._id);

            res.json({
                success: true,
                message: 'Password changed successfully. Please login again.'
            });

        } catch (error) {
            console.error('Password change error:', error);
            res.status(500).json({
                success: false,
                error: 'Password change failed',
                message: 'An error occurred while changing password'
            });
        }
    }

    // Request password reset
    async requestPasswordReset(req, res) {
        try {
            const { email } = req.body;

            const user = await User.findOne({ email });
            if (!user) {
                // Don't reveal if email exists for security
                return res.json({
                    success: true,
                    message: 'If the email exists, a password reset link has been sent'
                });
            }

            const { token, expires } = authService.generatePasswordResetToken();
            
            user.passwordResetToken = token;
            user.passwordResetExpires = expires;
            await user.save();

            // Send password reset email
            const emailResult = await emailService.sendPasswordResetEmail(
                email, 
                token, 
                user.username
            );

            console.log('Password reset email result:', emailResult);

            res.json({
                success: true,
                message: 'If the email exists, a password reset link has been sent',
                // Remove this in production
                ...(process.env.NODE_ENV === 'development' && { 
                    resetToken: token,
                    emailResult: emailResult
                })
            });

        } catch (error) {
            console.error('Password reset request error:', error);
            res.status(500).json({
                success: false,
                error: 'Password reset failed',
                message: 'An error occurred while processing password reset'
            });
        }
    }

    // Reset password
    async resetPassword(req, res) {
        try {
            const { token, newPassword } = req.body;

            // Validate new password
            const passwordValidation = authService.validatePassword(newPassword);
            if (!passwordValidation.isValid) {
                return res.status(400).json({
                    success: false,
                    error: 'Weak password',
                    message: 'New password does not meet security requirements',
                    details: passwordValidation.errors
                });
            }

            const user = await User.findOne({
                passwordResetToken: token,
                passwordResetExpires: { $gt: Date.now() }
            });

            if (!user) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid or expired token',
                    message: 'Password reset token is invalid or has expired'
                });
            }

            // Update password and clear reset token
            user.password = newPassword;
            user.passwordResetToken = undefined;
            user.passwordResetExpires = undefined;
            
            // Reset login attempts in case account was locked
            user.loginAttempts = 0;
            user.lockUntil = undefined;
            
            await user.save();

            // Logout from all devices for security
            await authService.logoutAll(user._id);

            res.json({
                success: true,
                message: 'Password reset successfully. Please login with your new password.'
            });

        } catch (error) {
            console.error('Password reset error:', error);
            res.status(500).json({
                success: false,
                error: 'Password reset failed',
                message: 'An error occurred while resetting password'
            });
        }
    }

    // Get account security info
    async getSecurityInfo(req, res) {
        try {
            const user = req.user;
            
            res.json({
                success: true,
                data: {
                    lastLogin: user.lastLogin,
                    loginAttempts: user.loginAttempts,
                    isLocked: authService.isAccountLocked(user),
                    lockUntil: user.lockUntil,
                    isEmailVerified: user.isEmailVerified,
                    isTwoFactorEnabled: user.isTwoFactorEnabled,
                    activeTokens: user.refreshTokens.length,
                    registeredAt: user.createdAt,
                    lastUpdate: user.updatedAt
                }
            });
        } catch (error) {
            console.error('Security info error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch security info',
                message: 'An error occurred while fetching security information'
            });
        }
    }
}

module.exports = new AuthController();
