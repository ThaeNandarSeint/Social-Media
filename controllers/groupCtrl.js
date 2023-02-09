const Groups = require('../models/groupModel')

// create
const createGroup = async (req, res, next) => {
    try {
        const { userId, groupName } = req.body
        if (!userId || !groupName) {
            return res.status(400).json({ status: false, msg: "Some required information are missing!" })
        }

        const users = [userId]

        const newGroup = new Groups({
            groupName,
            users
        })
        const savedGroup = await newGroup.save()

        return res.json({ status: true, groupId: savedGroup._id, msg: "New group has been successfully created!" })

    } catch (err) {
        next(err);
        return res.status(500).json({ msg: err.message })
    }
}

// update
const updateGroup = () => {

}

// delete
const deleteGroup = () => {

}

// add users
const addUsers = async (req, res, next) => {
    try {
        const { users } = req.body

        const group = await Groups.findById(req.params.id)

        const addUsersPromises = []

        for (let i = 0; i < users.length; i++) {
            const userId = users[i];
            await Groups.updateOne({ _id: req.params.id }, { $push: { users: userId } });                   
        }

        Promise.all(addUsersPromises)
            .then(() => {
                return res.json({ status: true, msg: "New users has been successfully added!" })
            })
    } catch (err) {
        next(err);
        return res.status(500).json({ msg: err.message })
    }
}

module.exports = {
    createGroup,
    addUsers
}