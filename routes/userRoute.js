const router = require('express').Router()

// controllers
const { clickFollowBtn, updatePassword, searchUsers } = require('../controllers/userCtrl');
const { authUser } = require('../middlewares/authUser')
// routes
router.put('/:id/follow', clickFollowBtn)
// // 
router.put('/:id', authUser, updatePassword)
router.get('/search/:key', searchUsers)

module.exports = router;