const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please enter your name!"],
        trim: true,
        unique: true
    },
    email: {
        type: String,
        required: [true, "Please enter your email!"],
        trim: true,
        unique: true
    },
    password: {
        type: String,
        required: [true, "Please enter your password!"]
    },

    profilePictureUrl: {
        type: String,
        required: true,
    },
    profilePicturePublicId: {
        type: String,
        required: true,
    },
    
    followers: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Users',
        }
    ],
    followings: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Users',
        }
    ],
    friends: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Users',
        }
    ],    
    
    isTwoFactor: {
        type: Boolean,
        default: false
    },
    phoneNumber: {
        type: String,
        default: ''
    },

    isAdmin: {
        type: Boolean,
        default: false
    }

}, {
    timestamps: true
})

module.exports = mongoose.model('Users', userSchema)