const cloudinary = require('cloudinary')

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET
})

const Posts = require('../models/postModel')
const Comments = require('../models/commentModel')

// test payment

// test video
const createVideo = async (req, res, next) => {
    try {
        const { pictures } = req.files

        cloudinary.v2.uploader
            .upload(pictures.tempFilePath,
                {
                    resource_type: "video",
                    public_id: "videos",
                    chunk_size: 6000000,
                    eager: [
                        { width: 300, height: 300, crop: "pad", audio_codec: "none" },
                        { width: 160, height: 100, crop: "crop", gravity: "south", audio_codec: "none" }],
                    eager_async: true,
                    eager_notification_url: "http://localhost:3000"
                })
            .then(result => console.log(result));
    } catch (err) {
        next(err)
        return res.status(500).json({ msg: err.message })
    }
}

// create
const createPost = async (req, res, next) => {
    try {
        const { userId, caption, pictures } = req.body

        if (!userId || !caption) {
            return res.status(400).json({ status: false, msg: "Some required information are missing!" })
        }

        const pictureUrls = []
        const picPublicIds = []

        for (let i = 0; i < pictures.length; i++) {
            const postPicture = pictures[i];
            pictureUrls.push(postPicture.secure_url)
            picPublicIds.push(postPicture.public_id)
        }

        // store new post in mongodb
        const newPost = new Posts({
            userId, pictureUrls, picPublicIds, caption
        })
        const savedPost = await newPost.save()
        return res.json({ status: true, postId: savedPost._id, msg: "New post has been successfully uploaded!" })

    } catch (err) {
        next(err);
        return res.status(500).json({ msg: err.message })
    }
}

// update post
const updatePost = async (req, res, next) => {
    try {
        const { userId, caption, pictures } = req.body

        if (!userId || !caption) {
            return res.status(400).json({ status: false, msg: "Some required information are missing!" })
        }

        const post = await Posts.findById(req.params.id)

        const deletePromises = [];

        // contain 
        if (post.picPublicIds[0] !== '' && post.pictureUrls[0] !== '') {
            // delete old picture from cloudinary
            for (let i = 0; i < post.picPublicIds.length; i++) {
                const oldPicPublicId = post.picPublicIds[i];
                deletePromises.push(cloudinary.v2.uploader.destroy(oldPicPublicId));
            }
            post.picPublicIds = ['']
            post.pictureUrls = ['']
        }

        // not include photo in request body
        if (pictures[0].public_id === '' && pictures[0].secure_url === '') {
            // not exist old 
            const picPublicIds = ['']
            const pictureUrls = ['']

            // update new picture in mongodb  
            await Posts.findByIdAndUpdate(req.params.id, {
                userId, caption, picPublicIds, pictureUrls
            })
            return res.json({ status: true, msg: "Your post has been successfully updated!" })
        }

        // update new picture in cloudinary
        const pictureUrls = []
        const picPublicIds = []

        Promise.all(deletePromises)
            .then(() => {
                for (let i = 0; i < pictures.length; i++) {
                    const postPicture = pictures[i];
                    pictureUrls.push(postPicture.secure_url)
                    picPublicIds.push(postPicture.public_id)
                }
            }).then(async () => {
                // update new picture in mongodb
                await Posts.findByIdAndUpdate(req.params.id, {
                    userId, pictureUrls, picPublicIds, caption
                })

                return res.json({ status: true, msg: "Your post has been successfully updated!" })
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
const deletePost = async (req, res, next) => {
    try {
        const { picPublicIds } = await Posts.findById(req.params.id)

        const commentPicPublicIds = await Comments.find({ postId: req.params.id }).picPublicIds

        // await Comments.deleteMany({ postId: req.params.id })

        // console.log('success');

        // // not include photo
        // if (picPublicIds[0] === '') {
        //     await Posts.findByIdAndDelete(req.params.id)
        //     return res.json({ status: true, msg: "Your post has been successfully deleted!" })
        // }

        // // include photo
        // const deletePromises = [];

        // for (let i = 0; i < picPublicIds.length; i++) {
        //     const picPublicId = picPublicIds[i];
        //     deletePromises.push(cloudinary.v2.uploader.destroy(picPublicId));
        // }

        // Promise.all(deletePromises)
        //     .then(async () => {
        //         await Posts.findByIdAndDelete(req.params.id)
        //         return res.json({ status: true, msg: "Your post has been successfully deleted!" })
        //     })
        //     .catch((err) => {
        //         console.log(err);
        //     });

    } catch (err) {
        next(err);
        return res.status(500).json({ msg: err.message })
    }
}

// search posts
const searchPosts = async (req, res, next) => {
    try {
        const posts = await Posts.find({
            "$or": [
                { caption: { $regex: req.params.key } }
            ]
        })
        return res.json({ status: true, posts })
    } catch (err) {
        next(err);
        return res.status(500).json({ msg: err.message })
    }
}

// get post by user id
const getPostByUserId = async (req, res, next) => {
    try {
        const posts = await Posts.find({ userid: req.params.id }).sort({ createdAt: -1 })

        return res.json({ status: true, posts })

    } catch (err) {
        next(err);
        return res.status(500).json({ msg: err.message })
    }
}

// get post by post id
const getByPostId = async (req, res, next) => {
    try {
        const post = await Posts.findById(req.params.id)
        return res.json({ status: true, post })

    } catch (err) {
        next(err);
        return res.status(500).json({ msg: err.message })
    }
}

// get all posts for every users
const getAllPosts = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query
        const posts = await Posts.find().limit(limit * 1).skip((page - 1) * limit).sort({ createdAt: -1 })
        return res.json({ status: true, posts })

    } catch (err) {
        next(err);
        return res.status(500).json({ msg: err.message })
    }
}

// like / dislike
const clickLikeBtn = async (req, res, next) => {
    try {
        const post = await Posts.findById(req.params.id);
        const { userId } = req.body

        if (!userId) {
            return res.status(400).json({ status: false, msg: "Some required information are missing!" })
        }

        const isLike = post.likes.includes(userId)
        const isLove = post.loves.includes(userId)
        const isHaha = post.hahas.includes(userId)
        const isSad = post.sads.includes(userId)
        const isAngry = post.angrys.includes(userId)

        if (!isLike) {
            if (isLove) {
                await Posts.updateOne({ _id: req.params.id }, { $pull: { loves: userId } });
            }
            if (isHaha) {
                await Posts.updateOne({ _id: req.params.id }, { $pull: { hahas: userId } });
            }
            if (isSad) {
                await Posts.updateOne({ _id: req.params.id }, { $pull: { sads: userId } });
            }
            if (isAngry) {
                await Posts.updateOne({ _id: req.params.id }, { $pull: { angrys: userId } });
            }

            await Posts.updateOne({ _id: req.params.id }, { $push: { likes: userId } });

            return res.json({ status: true, msg: "The post has been liked!" })

        } else {

            await Posts.updateOne({ _id: req.params.id }, { $pull: { likes: userId } });

            return res.json({ status: true, msg: "The post has been disliked!" })
        }
    } catch (err) {
        next(err);
        return res.status(500).json({ msg: err.message })
    }
}

// love / unlove
const clickLoveBtn = async (req, res, next) => {
    try {
        const post = await Posts.findById(req.params.id);
        const { userId } = req.body

        if (!userId) {
            return res.status(400).json({ status: false, msg: "Some required information are missing!" })
        }

        const isLike = post.likes.includes(userId)
        const isLove = post.loves.includes(userId)
        const isHaha = post.hahas.includes(userId)
        const isSad = post.sads.includes(userId)
        const isAngry = post.angrys.includes(userId)

        if (!isLove) {
            if (isLike) {
                await Posts.updateOne({ _id: req.params.id }, { $pull: { likes: userId } });
            }
            if (isHaha) {
                await Posts.updateOne({ _id: req.params.id }, { $pull: { hahas: userId } });
            }
            if (isSad) {
                await Posts.updateOne({ _id: req.params.id }, { $pull: { sads: userId } });
            }
            if (isAngry) {
                await Posts.updateOne({ _id: req.params.id }, { $pull: { angrys: userId } });
            }

            await Posts.updateOne({ _id: req.params.id }, { $push: { loves: userId } });

            return res.json({ status: true, msg: "The post has been loved!" })

        } else {

            await Posts.updateOne({ _id: req.params.id }, { $pull: { loves: userId } });

            return res.json({ status: true, msg: "The post has been disloved!" })
        }
    } catch (err) {
        next(err);
        return res.status(500).json({ msg: err.message })
    }
}

// haha / unhaha
const clickHahaBtn = async (req, res, next) => {
    try {
        const post = await Posts.findById(req.params.id);
        const { userId } = req.body

        if (!userId) {
            return res.status(400).json({ status: false, msg: "Some required information are missing!" })
        }

        const isLike = post.likes.includes(userId)
        const isLove = post.loves.includes(userId)
        const isHaha = post.hahas.includes(userId)
        const isSad = post.sads.includes(userId)
        const isAngry = post.angrys.includes(userId)

        if (!isHaha) {
            if (isLike) {
                await Posts.updateOne({ _id: req.params.id }, { $pull: { likes: userId } });
            }
            if (isLove) {
                await Posts.updateOne({ _id: req.params.id }, { $pull: { loves: userId } });
            }
            if (isSad) {
                await Posts.updateOne({ _id: req.params.id }, { $pull: { sads: userId } });
            }
            if (isAngry) {
                await Posts.updateOne({ _id: req.params.id }, { $pull: { angrys: userId } });
            }

            await Posts.updateOne({ _id: req.params.id }, { $push: { hahas: userId } });

            return res.json({ status: true, msg: "The post has been haha!" })

        } else {

            await Posts.updateOne({ _id: req.params.id }, { $pull: { hahas: userId } });

            return res.json({ status: true, msg: "The post has been dishaha!" })
        }
    } catch (err) {
        next(err);
        return res.status(500).json({ msg: err.message })
    }
}

// sad / unsad
const clickSadBtn = async (req, res, next) => {
    try {
        const post = await Posts.findById(req.params.id);
        const { userId } = req.body

        if (!userId) {
            return res.status(400).json({ status: false, msg: "Some required information are missing!" })
        }

        const isLike = post.likes.includes(userId)
        const isLove = post.loves.includes(userId)
        const isHaha = post.hahas.includes(userId)
        const isSad = post.sads.includes(userId)
        const isAngry = post.angrys.includes(userId)

        if (!isSad) {
            if (isLike) {
                await Posts.updateOne({ _id: req.params.id }, { $pull: { likes: userId } });
            }
            if (isLove) {
                await Posts.updateOne({ _id: req.params.id }, { $pull: { loves: userId } });
            }
            if (isHaha) {
                await Posts.updateOne({ _id: req.params.id }, { $pull: { hahas: userId } });
            }
            if (isAngry) {
                await Posts.updateOne({ _id: req.params.id }, { $pull: { angrys: userId } });
            }

            await Posts.updateOne({ _id: req.params.id }, { $push: { sads: userId } });

            return res.json({ status: true, msg: "The post has been sad!" })

        } else {

            await Posts.updateOne({ _id: req.params.id }, { $pull: { sads: userId } });

            return res.json({ status: true, msg: "The post has been disSad!" })
        }
    } catch (err) {
        next(err);
        return res.status(500).json({ msg: err.message })
    }
}

// angry / unangry
const clickAngryBtn = async (req, res, next) => {
    try {
        const post = await Posts.findById(req.params.id);
        const { userId } = req.body

        if (!userId) {
            return res.status(400).json({ status: false, msg: "Some required information are missing!" })
        }

        const isLike = post.likes.includes(userId)
        const isLove = post.loves.includes(userId)
        const isHaha = post.hahas.includes(userId)
        const isSad = post.sads.includes(userId)
        const isAngry = post.angrys.includes(userId)

        if (!isAngry) {
            if (isLike) {
                await Posts.updateOne({ _id: req.params.id }, { $pull: { likes: userId } });
            }
            if (isLove) {
                await Posts.updateOne({ _id: req.params.id }, { $pull: { loves: userId } });
            }
            if (isHaha) {
                await Posts.updateOne({ _id: req.params.id }, { $pull: { hahas: userId } });
            }
            if (isSad) {
                await Posts.updateOne({ _id: req.params.id }, { $pull: { sads: userId } });
            }

            await Posts.updateOne({ _id: req.params.id }, { $push: { angrys: userId } });

            return res.json({ status: true, msg: "The post has been angry!" })

        } else {

            await Posts.updateOne({ _id: req.params.id }, { $pull: { angrys: userId } });

            return res.json({ status: true, msg: "The post has been disangry!" })
        }
    } catch (err) {
        next(err);
        return res.status(500).json({ msg: err.message })
    }
}

module.exports = {
    createPost,
    updatePost,
    deletePost,
    getPostByUserId,
    getByPostId,
    getAllPosts,
    searchPosts,
    clickLikeBtn,
    clickLoveBtn,
    clickHahaBtn,
    clickSadBtn,
    clickAngryBtn,
    createVideo
}