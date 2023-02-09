const mongoose = require('mongoose')

const postSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',
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
    // test
    videoUrls: [
        {
            type: String,
            default: ''
        }
    ],
    videoPublicIds: [
        {
            type: String,
            default: ''
        }
    ],
    // 
    caption: {
        type: String,
        required: true,
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

module.exports = mongoose.model('Posts', postSchema)