const bcrypt = require('bcrypt')
const { createAccessToken } = require('../helpers/createTokens')
const Otps = require('../models/otpModel')
const Users = require('../models/userModel')

const checkOtp = async (req, res, next) => {
    try{
        const { userId, otp } = req.body
        if(!userId || !otp){
            return res.status(400).json({ status: false, msg: "Important information are required!" })
        }

        const otpCode = await Otps.findOne({ userId })
        
        if(!otpCode.otp){
            return res.status(400).json({ status: false, msg: "OTP is not found!" })
        }
        const { expiresAt } = await Otps.findOne({ userId })
        if(expiresAt < Date.now()){
            await Otps.deleteMany({ expiresAt })
            return res.status(400).json({ status: false, msg: "Code has expired. Please request again!" })
        }

        const isValid = await bcrypt.compare(otp, otpCode.otp)
        if(!isValid){
            return res.status(400).json({ status: false, msg: "Wrong code. Please check your message again!" })
        }

        const { isTwoFactor } = await Users.findById(userId)

        if(!isTwoFactor){
            await Users.findByIdAndUpdate(userId, {
                isTwoFactor: true,
                phoneNumber: otpCode.phoneNumber
            })
        }       

        const access_token = createAccessToken({ id: userId })        
        res.cookie('access_token', access_token, cookieOptions)

        await Otps.deleteMany({ otp: otpCode.otp })

        return res.json({ status: true, msg: "Success!" })

    }catch(err){
        next(err);
        return res.status(500).json({ status: false, msg: err.message })
    }
}

module.exports = {
    checkOtp
}