// controllers
const { register, activateEmail, login, forgotPassword, resetPassword, logout, storeOtp } = require('../controllers/authCtrl');

// middlewares
const resetAuth = require('../middlewares/resetAuth')
const { uploadImage } = require('../middlewares/uploadImage');
const { authUser } = require('../middlewares/authUser');

// validation middlewares
const loginValidator = require('../validators/user/loginValidator');
const registerValidator = require('../validators/user/registerValidator');
const resetPwValidator = require('../validators/user/resetPwValidator');
const forgetPwValidator = require('../validators/user/forgetPwValidator');
const { sendSms } = require('../middlewares/sendSms');
const { checkOtp } = require('../middlewares/checkOtp');

const router = require('express').Router()

// routes
router.post('/register', registerValidator, uploadImage, register)
router.post('/activation', activateEmail)

router.post('/login', loginValidator, login)

router.post('/twoFactor-login', loginValidator, login, sendSms, storeOtp)

router.post('/forgot', forgetPwValidator, forgotPassword)
router.post('/reset', resetAuth, resetPwValidator, resetPassword)

// 1st 2factor implementation
router.post('/sendOtp', sendSms, storeOtp)
router.post('/checkOtp', checkOtp)

router.get('/logout', authUser, logout)

module.exports = router