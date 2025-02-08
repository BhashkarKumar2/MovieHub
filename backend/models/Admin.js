const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: 'admin' },
    permissions: { type: [String], default: ['manage_users', 'view_reports'] }, // Example of additional fields for admin
});

const Admin = mongoose.model('Admin', adminSchema);
module.exports = Admin;
