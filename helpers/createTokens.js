const jwt = require('jsonwebtoken')

const ACTIVATION_TOKEN_SECRET = process.env.ACTIVATION_TOKEN_SECRET
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET

const createActivationToken = (payload) => {
    return jwt.sign(payload, ACTIVATION_TOKEN_SECRET, {
        expiresIn: '5m'
    })
}

const createAccessToken = (payload) => {
    return jwt.sign(payload, ACCESS_TOKEN_SECRET, {
        expiresIn: '1h'
    })
}

module.exports = {
    createActivationToken,
    createAccessToken,
}