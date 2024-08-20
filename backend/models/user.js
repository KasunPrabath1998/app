const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    mobileNumber: { type: String, required: true },
    password: { type: String, required: true },
    verified: { type: Boolean, default: false }, // Tracks email verification status
    verificationToken: { type: String, unique: true }, // Token for email verification
    createdAt: { type: Date, default: Date.now }, // Automatically tracks the creation date
    updatedAt: { type: Date, default: Date.now } // Automatically tracks the update date
});

// Middleware to update the `updatedAt` field on save
userSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('User', userSchema, 'users');
