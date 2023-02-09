const mongoose = require('mongoose')

const groupSchema = new mongoose.Schema({
    users: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Users',
        }
    ],
    posts: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Posts',
        }
    ],
    groupName: {
        type: String,
        required: true
    }
}, {
    timestamps: true
})

module.exports = mongoose.model('Groups', groupSchema)