const mongoose = require('mongoose')

const commentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',
        required: true,
    },
    postId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Posts',
        required: true,
    },
    pictureUrls: [
        {
            type: String,
            default: ''
        }
    ],
    picPublicIds: [
        {
            type: String,
            default: ''
        }
    ],
    content: {
        type: String,
        required: true
    },
    likes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Users',
        }
    ],
    loves: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Users',
        }
    ],
    hahas: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Users',
        }
    ],
    sads: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Users',
        }
    ],
    angrys: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Users',
        }
    ]
}, {
    timestamps: true
})

module.exports = mongoose.model('Comments', commentSchema)