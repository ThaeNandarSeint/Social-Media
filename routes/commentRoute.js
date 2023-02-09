const router = require('express').Router()

// controllers
const { createComment, deleteComment, updateComment, getAllComments, getByCommentId, getCommentByUserId, clickLikeBtn, getCommentByPostId, clickLoveBtn, clickHahaBtn, clickSadBtn, clickAngryBtn } = require('../controllers/commentCtrl');

// middlewares
const { uploadImage } = require('../middlewares/uploadImage');

// validators
const commentValidator = require('../validators/comment/commentValidator');

// routes
router.post('/', commentValidator, uploadImage, createComment)
router.delete('/:id', deleteComment)
router.put('/:id', commentValidator, uploadImage, updateComment)
// read data
router.get('/', getAllComments) // <- will not be used in real world situation
router.get('/:id', getByCommentId)
router.get('/userid/:id', getCommentByUserId)
router.get('/postid/:id', getCommentByPostId)
// 
router.put('/:id/like', clickLikeBtn)
router.put('/:id/love', clickLoveBtn)
router.put('/:id/haha', clickHahaBtn)
router.put('/:id/sad', clickSadBtn)
router.put('/:id/angry', clickAngryBtn)

module.exports = router