const Users = require('../models/userModel')

const authAdmin = async (req, res, next) => {
    try{
        
        const userId = req.user.id
        const { isAdmin } = await Users.findById(userId)
        if(!isAdmin){
            return res.status(403).json({ status: false, msg: "You are not authenticated!" })
        }
        next()

    }catch(err){
        next(err);
        return res.status(500).json({msg: err.message})
    }
}

module.exports = {
    authAdmin
}