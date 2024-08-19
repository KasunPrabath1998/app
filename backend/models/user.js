const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    mobileNumber: { type: String, required: true },
    password: { type: String, required: true },
    verified: { type: Boolean, default: false }, // To track email verification status
    verificationToken: { type: String, unique: true } // Token for email verification
});

module.exports = mongoose.model('User', userSchema, 'users');
