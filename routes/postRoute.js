// // controllers
const { createPost, getByPostId, getPostByUserId, deletePost, updatePost, getAllPosts, clickLikeBtn, searchPosts, clickLoveBtn, clickHahaBtn, clickSadBtn, clickAngryBtn, createVideo } = require('../controllers/postCtrl');

// // middlewares
const { uploadImage } = require('../middlewares/uploadImage');

// validators
const { postValidator } = require('../validators/post/postValidator');

const router = require('express').Router()

// // routes
// test
router.post('/', createVideo)

router.post('/', postValidator, uploadImage, createPost)
router.delete('/:id', deletePost)
router.put('/:id', postValidator, uploadImage, updatePost)
// read data
router.get('/', getAllPosts)
router.get('/:id', getByPostId)
router.get('/userid/:id', getPostByUserId)
// search
router.get('/search/:key', searchPosts)
// 
router.put('/:id/like', clickLikeBtn)
router.put('/:id/love', clickLoveBtn)
router.put('/:id/haha', clickHahaBtn)
router.put('/:id/sad', clickSadBtn)
router.put('/:id/angry', clickAngryBtn)

module.exports = router;