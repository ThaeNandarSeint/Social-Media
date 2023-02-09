const cloudinary = require('cloudinary')
const fs = require('fs')

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET
})

const Comments = require('../models/commentModel')

// create
const createComment = async (req, res, next) => {
    try {
        const { userId, content, pictures, postId } = req.body

        if (!userId || !content || !postId) {
            return res.status(400).json({ status: false, msg: "Some required information are missing!" })
        }

        const pictureUrls = []
        const picPublicIds = []

        for (let i = 0; i < pictures.length; i++) {
            const commentPicture = pictures[i];
            pictureUrls.push(commentPicture.secure_url)
            picPublicIds.push(commentPicture.public_id)
        }

        // store new comment in mongodb
        const newComment = new Comments({
            userId, pictureUrls, picPublicIds, content, postId
        })
        const savedComment = await newComment.save()
        return res.json({ status: true, commentId: savedComment._id, msg: "New comment has been successfully uploaded!" })

    } catch (err) {
        next(err);
        return res.status(500).json({ msg: err.message })
    }
}

// update
const updateComment = async (req, res, next) => {
    try {
        const { userId, content, pictures } = req.body

        if (!userId || !content) {
            return res.status(400).json({ status: false, msg: "Some required information are missing!" })
        }

        const comment = await Comments.findById(req.params.id)
        
        const deletePromises = [];

        // contain 
        if(comment.picPublicIds[0] !== '' && comment.pictureUrls[0] !== ''){
            // delete old picture from cloudinary
            for (let i = 0; i < comment.picPublicIds.length; i++) {
                const oldPicPublicId = comment.picPublicIds[i];
                deletePromises.push(cloudinary.v2.uploader.destroy(oldPicPublicId));
            } 
            comment.picPublicIds = [ '' ]
            comment.pictureUrls = [ '' ]
        }

        // not include photo in request body
        if (pictures[0].public_id === '' && pictures[0].secure_url === '') {
            // not exist old 
            const picPublicIds = [ '' ]
            const pictureUrls = [ '' ]

            // update new picture in mongodb  
            await Comments.findByIdAndUpdate(req.params.id, {
                userId, content, picPublicIds, pictureUrls
            })
            return res.json({ status: true, msg: "Your comment has been successfully updated!" })
        }        

        // update new picture in cloudinary
        const pictureUrls = []
        const picPublicIds = []

        Promise.all(deletePromises)
            .then(() => {
                for (let i = 0; i < pictures.length; i++) {
                    const commentPicture = pictures[i];
                    pictureUrls.push(commentPicture.secure_url)
                    picPublicIds.push(commentPicture.public_id)
                }
            }).then(async () => {
                // update new picture in mongodb
                await Comments.findByIdAndUpdate(req.params.id, {
                    userId, pictureUrls, picPublicIds, content
                })

                return res.json({ status: true, msg: "Your comment has been successfully updated!" })
            })
            .catch((err) => {
                console.log(err);
            }); 

    } catch (err) {
        next(err);
        return res.status(500).json({ msg: err.message })
    }
}

// delete
const deleteComment = async (req, res, next) => {
    try {
        const { picPublicIds } = await Comments.findById(req.params.id)

        const deletePromises = [];

        for (let i = 0; i < picPublicIds.length; i++) {
            const picPublicId = picPublicIds[i];
            deletePromises.push(cloudinary.v2.uploader.destroy(picPublicId));
        }     
        
        Promise.all(deletePromises)
            .then(async () => {
                await Comments.findByIdAndDelete(req.params.id)
                return res.json({ status: true, msg: "Your comment has been successfully deleted!" })
            })
            .catch((err) => {
                console.log(err);
            });

    } catch (err) {
        next(err);
        return res.status(500).json({ msg: err.message })
    }
}

// get comment by user id
const getCommentByUserId = async (req, res, next) => {
    try {
        const comments = await Comments.find({ userid: req.params.id }).sort({ createdAt: -1 })

        return res.json({ status: true, comments })

    } catch (err) {
        next(err);
        return res.status(500).json({ msg: err.message })
    }
}

// get comment by post id
const getCommentByPostId = async (req, res, next) => {
    try {
        const comments = await Comments.find({ postid: req.params.id }).sort({ createdAt: -1 })

        return res.json({ status: true, comments })

    } catch (err) {
        next(err);
        return res.status(500).json({ msg: err.message })
    }
}

// get comment by comment id
const getByCommentId = async (req, res, next) => {
    try {
        const comment = await Comments.findById(req.params.id)
        return res.json({ status: true, comment })

    } catch (err) {
        next(err);
        return res.status(500).json({ msg: err.message })
    }
}

// get all Comments for every users
const getAllComments = async (req, res, next) => {
    try {
        const comments = await Comments.find().sort({ createdAt: -1 })
        return res.json({ status: true, comments })

    } catch (err) {
        next(err);
        return res.status(500).json({ msg: err.message })
    }
}


// like / dislike
// like / dislike
const clickLikeBtn = async (req, res, next) => {
    try {
        const comment = await Comments.findById(req.params.id);
        const { userId } = req.body

        if (!userId) {
            return res.status(400).json({ status: false, msg: "Some required information are missing!" })
        }

        const isLike = comment.likes.includes(userId)
        const isLove = comment.loves.includes(userId)
        const isHaha = comment.hahas.includes(userId)
        const isSad = comment.sads.includes(userId)
        const isAngry = comment.angrys.includes(userId)

        if (!isLike) {
            if (isLove) {
                await Comments.updateOne({ _id: req.params.id }, { $pull: { loves: userId } });
            }
            if (isHaha) {
                await Comments.updateOne({ _id: req.params.id }, { $pull: { hahas: userId } });
            }
            if (isSad) {
                await Comments.updateOne({ _id: req.params.id }, { $pull: { sads: userId } });
            }
            if (isAngry) {
                await Comments.updateOne({ _id: req.params.id }, { $pull: { angrys: userId } });
            }

            await Comments.updateOne({ _id: req.params.id }, { $push: { likes: userId } });

            return res.json({ status: true, msg: "The comment has been liked!" })

        } else {

            await Comments.updateOne({ _id: req.params.id }, { $pull: { likes: userId } });

            return res.json({ status: true, msg: "The comment has been disliked!" })
        }
    } catch (err) {
        next(err);
        return res.status(500).json({ msg: err.message })
    }
}

// love / unlove
const clickLoveBtn = async (req, res, next) => {
    try {
        const comment = await Comments.findById(req.params.id);
        const { userId } = req.body

        if (!userId) {
            return res.status(400).json({ status: false, msg: "Some required information are missing!" })
        }

        const isLike = comment.likes.includes(userId)
        const isLove = comment.loves.includes(userId)
        const isHaha = comment.hahas.includes(userId)
        const isSad = comment.sads.includes(userId)
        const isAngry = comment.angrys.includes(userId)

        if (!isLove) {
            if (isLike) {
                await Comments.updateOne({ _id: req.params.id }, { $pull: { likes: userId } });
            }
            if (isHaha) {
                await Comments.updateOne({ _id: req.params.id }, { $pull: { hahas: userId } });
            }
            if (isSad) {
                await Comments.updateOne({ _id: req.params.id }, { $pull: { sads: userId } });
            }
            if (isAngry) {
                await Comments.updateOne({ _id: req.params.id }, { $pull: { angrys: userId } });
            }

            await Comments.updateOne({ _id: req.params.id }, { $push: { loves: userId } });

            return res.json({ status: true, msg: "The comment has been loved!" })

        } else {

            await Comments.updateOne({ _id: req.params.id }, { $pull: { loves: userId } });

            return res.json({ status: true, msg: "The comment has been disloved!" })
        }
    } catch (err) {
        next(err);
        return res.status(500).json({ msg: err.message })
    }
}

// haha / unhaha
const clickHahaBtn = async (req, res, next) => {
    try {
        const comment = await Comments.findById(req.params.id);
        const { userId } = req.body

        if (!userId) {
            return res.status(400).json({ status: false, msg: "Some required information are missing!" })
        }

        const isLike = comment.likes.includes(userId)
        const isLove = comment.loves.includes(userId)
        const isHaha = comment.hahas.includes(userId)
        const isSad = comment.sads.includes(userId)
        const isAngry = comment.angrys.includes(userId)

        if (!isHaha) {
            if (isLike) {
                await Comments.updateOne({ _id: req.params.id }, { $pull: { likes: userId } });
            }
            if (isLove) {
                await Comments.updateOne({ _id: req.params.id }, { $pull: { loves: userId } });
            }
            if (isSad) {
                await Comments.updateOne({ _id: req.params.id }, { $pull: { sads: userId } });
            }
            if (isAngry) {
                await Comments.updateOne({ _id: req.params.id }, { $pull: { angrys: userId } });
            }

            await Comments.updateOne({ _id: req.params.id }, { $push: { hahas: userId } });

            return res.json({ status: true, msg: "The comment has been haha!" })

        } else {

            await Comments.updateOne({ _id: req.params.id }, { $pull: { hahas: userId } });

            return res.json({ status: true, msg: "The comment has been dishaha!" })
        }
    } catch (err) {
        next(err);
        return res.status(500).json({ msg: err.message })
    }
}

// sad / unsad
const clickSadBtn = async (req, res, next) => {
    try {
        const comment = await Comments.findById(req.params.id);
        const { userId } = req.body

        if (!userId) {
            return res.status(400).json({ status: false, msg: "Some required information are missing!" })
        }

        const isLike = comment.likes.includes(userId)
        const isLove = comment.loves.includes(userId)
        const isHaha = comment.hahas.includes(userId)
        const isSad = comment.sads.includes(userId)
        const isAngry = comment.angrys.includes(userId)

        if (!isSad) {
            if (isLike) {
                await Comments.updateOne({ _id: req.params.id }, { $pull: { likes: userId } });
            }
            if (isLove) {
                await Comments.updateOne({ _id: req.params.id }, { $pull: { loves: userId } });
            }
            if (isHaha) {
                await Comments.updateOne({ _id: req.params.id }, { $pull: { hahas: userId } });
            }
            if (isAngry) {
                await Comments.updateOne({ _id: req.params.id }, { $pull: { angrys: userId } });
            }

            await Comments.updateOne({ _id: req.params.id }, { $push: { sads: userId } });

            return res.json({ status: true, msg: "The comment has been sad!" })

        } else {

            await Comments.updateOne({ _id: req.params.id }, { $pull: { sads: userId } });

            return res.json({ status: true, msg: "The comment has been disSad!" })
        }
    } catch (err) {
        next(err);
        return res.status(500).json({ msg: err.message })
    }
}

// angry / unangry
const clickAngryBtn = async (req, res, next) => {
    try {
        const comment = await Comments.findById(req.params.id);
        const { userId } = req.body

        if (!userId) {
            return res.status(400).json({ status: false, msg: "Some required information are missing!" })
        }

        const isLike = comment.likes.includes(userId)
        const isLove = comment.loves.includes(userId)
        const isHaha = comment.hahas.includes(userId)
        const isSad = comment.sads.includes(userId)
        const isAngry = comment.angrys.includes(userId)

        if (!isAngry) {
            if (isLike) {
                await Comments.updateOne({ _id: req.params.id }, { $pull: { likes: userId } });
            }
            if (isLove) {
                await Comments.updateOne({ _id: req.params.id }, { $pull: { loves: userId } });
            }
            if (isHaha) {
                await Comments.updateOne({ _id: req.params.id }, { $pull: { hahas: userId } });
            }
            if (isSad) {
                await Comments.updateOne({ _id: req.params.id }, { $pull: { sads: userId } });
            }

            await Comments.updateOne({ _id: req.params.id }, { $push: { angrys: userId } });

            return res.json({ status: true, msg: "The comment has been angry!" })

        } else {

            await Comments.updateOne({ _id: req.params.id }, { $pull: { angrys: userId } });

            return res.json({ status: true, msg: "The comment has been disangry!" })
        }
    } catch (err) {
        next(err);
        return res.status(500).json({ msg: err.message })
    }
}

module.exports = {
    createComment,
    updateComment,
    deleteComment,
    getCommentByUserId,
    getCommentByPostId,
    getByCommentId,
    getAllComments,
    clickLikeBtn,
    clickLoveBtn,
    clickHahaBtn,
    clickSadBtn,
    clickAngryBtn
}