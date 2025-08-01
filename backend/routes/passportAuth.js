// backend/routes/passportAuth.js
const express = require('express');
const passport = require('../config/passport');
const authService = require('../services/authService');
const router = express.Router();

// Start Google OAuth
router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email'],
  session: false,
}));

// Google OAuth callback
router.get('/google/callback', passport.authenticate('google', {
  failureRedirect: '/login',
  session: false,
}), async (req, res) => {
  try {
    const user = req.user;
    const clientInfo = authService.extractClientInfo(req);

    // Generate tokens using the new auth service
    const { accessToken, refreshToken } = authService.generateTokens(user);
    
    // Add refresh token to user
    await user.addRefreshToken(refreshToken);

    // Update last login info
    await authService.updateLastLogin(user._id, clientInfo);

    // Redirect to frontend with tokens (using 'token' for accessToken for compatibility)
    const redirectUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/google-auth-success?token=${accessToken}&refreshToken=${refreshToken}`;
    res.redirect(redirectUrl);
    
  } catch (error) {
    console.error('Google OAuth callback error:', error);
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=oauth_failed`);
  }
});

module.exports = router;
