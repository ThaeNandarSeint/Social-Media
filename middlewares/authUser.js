const jwt = require('jsonwebtoken')
const { createAccessToken } = require('../controllers/userCtrl')
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET

const authUser = async (req, res, next) => {
    try{
        // check access token -> 15min
        const old_access_token = req.cookies.access_token

        if (!old_access_token) {
            return res.status(400).json({ status: false, msg: "Token expires or Token was not found! Please Login now" })
        }

        jwt.verify(old_access_token, ACCESS_TOKEN_SECRET, (err, user) => {
            if (err) {
                return res.status(400).json({ status: false, msg: "error" })
            }
            req.user = user;
            next();
        })
    }catch(err){
        next(err);
        return res.status(500).json({msg: err.message})
    }
}

module.exports = {
    authUser
}