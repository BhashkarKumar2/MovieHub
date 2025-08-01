const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: function() { return !this.isGoogleUser; } },
    email: { type: String, sparse: true },
    googleId: { type: String, sparse: true },
    picture: { type: String },
    role: { type: String, default: 'customer' },
    isGoogleUser: { type: Boolean, default: false },
    
    // Enhanced security fields
    refreshTokens: [{ 
        token: String, 
        createdAt: { type: Date, default: Date.now },
        expiresAt: { type: Date, default: () => new Date(+new Date() + 7*24*60*60*1000) }
    }],
    passwordResetToken: { type: String },
    passwordResetExpires: { type: Date },
    isEmailVerified: { type: Boolean, default: false },
    emailVerificationToken: { type: String },
    loginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date },
    twoFactorSecret: { type: String },
    isTwoFactorEnabled: { type: Boolean, default: false },
    lastLogin: { type: Date },
    ipAddress: { type: String },
    userAgent: { type: String },
    
    // Microservice specific fields
    preferences: {
        notifications: { type: Boolean, default: true },
        emailUpdates: { type: Boolean, default: true },
        theme: { type: String, default: 'light' }
    }
}, {
    timestamps: true
});

// Indexes
userSchema.index({ email: 1 }, { sparse: true });
userSchema.index({ googleId: 1 }, { sparse: true });
userSchema.index({ username: 1 });

// Virtual for account lock status
userSchema.virtual('isLocked').get(function() {
    return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    
    try {
        const salt = await bcrypt.genSalt(12);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
    if (!this.password) return false;
    return await bcrypt.compare(candidatePassword, this.password);
};

// Method to handle failed login attempts
userSchema.methods.incLoginAttempts = function() {
    if (this.lockUntil && this.lockUntil < Date.now()) {
        return this.updateOne({
            $unset: { lockUntil: 1 },
            $set: { loginAttempts: 1 }
        });
    }
    
    const updates = { $inc: { loginAttempts: 1 } };
    
    if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
        updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 };
    }
    
    return this.updateOne(updates);
};

// Method to reset login attempts
userSchema.methods.resetLoginAttempts = function() {
    return this.updateOne({
        $unset: { loginAttempts: 1, lockUntil: 1 }
    });
};

// Method to add refresh token
userSchema.methods.addRefreshToken = function(token) {
    this.refreshTokens.push({
        token,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });
    
    if (this.refreshTokens.length > 5) {
        this.refreshTokens = this.refreshTokens.slice(-5);
    }
    
    return this.save();
};

// Method to remove refresh token
userSchema.methods.removeRefreshToken = function(token) {
    this.refreshTokens = this.refreshTokens.filter(rt => rt.token !== token);
    return this.save();
};

// Method to clean expired refresh tokens
userSchema.methods.cleanExpiredTokens = function() {
    this.refreshTokens = this.refreshTokens.filter(rt => rt.expiresAt > new Date());
    return this.save();
};

const User = mongoose.model('User', userSchema);
module.exports = User;
