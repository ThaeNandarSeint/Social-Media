const mongoose = require('mongoose')

const otpSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',
        required: true,
    },
    phoneNumber: {
        type: String,
        required: [true, "Please enter your phone number!"],
        trim: true,
        unique: true
    },
    otp: {
        type: String,
        required: [true, "OTP is required!"],
        trim: true,
        unique: true
    },
    createdAt: {
        type: Date
    },
    expiresAt: {
        type: Date
    },
})

module.exports = mongoose.model('Otps', otpSchema)