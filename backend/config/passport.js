// backend/config/passport.js
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');
require('dotenv').config();

// Validate required environment variables
if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  console.warn('Warning: Google OAuth environment variables not configured. Google authentication will not work.');
}

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID || '',
  clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
  callbackURL: `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/auth/google/callback`,
}, async (accessToken, refreshToken, profile, done) => {
  try {
    console.log('Google OAuth profile:', {
      id: profile.id,
      displayName: profile.displayName,
      email: profile.emails?.[0]?.value,
      picture: profile.photos?.[0]?.value
    });

    let user = await User.findOne({ googleId: profile.id });
    if (!user) {
      // Create new user
      user = await User.create({
        googleId: profile.id,
        username: profile.displayName || `GoogleUser_${profile.id}`,
        email: profile.emails?.[0]?.value || '',
        picture: profile.photos?.[0]?.value || '',
        role: 'customer',
        isGoogleUser: true,
        isVerified: true, // Google users are pre-verified
      });
      console.log('Created new Google user:', user.id);
    } else {
      // Update existing user info
      user.picture = profile.photos?.[0]?.value || user.picture;
      user.username = profile.displayName || user.username;
      await user.save();
      console.log('Updated existing Google user:', user.id);
    }
    
    return done(null, user);
  } catch (err) {
    console.error('Google OAuth error:', err);
    return done(err, null);
  }
}));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

module.exports = passport;
