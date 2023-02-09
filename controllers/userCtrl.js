const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const Users = require("../models/userModel");

// update
const updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await Users.findById(req.params.id);
    if (!user) {
      return res
        .status(400)
        .json({ status: false, msg: "Something went wrong!" });
    }
    // check password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ status: false, msg: "Current password is incorrect!" });
    }
    // change password
    const passwordHash = await bcrypt.hash(newPassword, 12);

    await Users.findByIdAndUpdate(req.params.id, {
      password: passwordHash,
    })

    return res.json({ status: true, msg: "Your password has been successfully changed!" })

  } catch (err) {
    next(err);
    return res.status(500).json({ msg: err.message });
  }
}

// delete



// follow / unfollow user -> friend / unfriend
const clickFollowBtn = async (req, res, next) => {
  const currentUser = await Users.findById(req.body.userId); //subject
  const anotherUser = await Users.findById(req.params.id); //object

  // const result = await Users.find( { followers: { $all: [ "6399523fe2bd4309b07067b6" ] } } )
  // console.log(result);

  if (currentUser._id !== anotherUser._id) {
    try {
      if (!anotherUser.followers.includes(currentUser._id)) {
        await Users.updateOne(
          { _id: anotherUser._id },
          { $push: { followers: currentUser._id } }
        );

        await Users.updateOne(
          { _id: currentUser._id },
          { $push: { followings: anotherUser._id } }
        );

        // friends
        if (currentUser.followers.includes(anotherUser._id)) {

          await Users.updateOne(
            { _id: anotherUser._id },
            { $push: { friends: currentUser._id } }
          );

          await Users.updateOne(
            { _id: currentUser._id },
            { $push: { friends: anotherUser._id } }
          );
          return res.json({ status: true, msg: "Now, we are friends!" });

        }

        return res.json({ status: true, msg: "Followed!" });
      } else {
        await Users.updateOne(
          { _id: anotherUser._id },
          { $pull: { followers: currentUser._id } }
        );

        await Users.updateOne(
          { _id: currentUser._id },
          { $pull: { followings: anotherUser._id } }
        );

        // unfriend
        if (currentUser.followers.includes(anotherUser._id)) {
          await Users.updateOne(
            { _id: anotherUser._id },
            { $pull: { friends: currentUser._id } }
          );

          await Users.updateOne(
            { _id: currentUser._id },
            { $pull: { friends: anotherUser._id } }
          );
          return res.json({ status: true, msg: "Unfriend!" });

        }

        return res.json({ status: true, msg: "Unfollowed!" });
      }

    } catch (err) {
      next(err);
      return res.status(500).json({ status: false, msg: err.message });
    }
  } else {
    return res
      .status(403)
      .json({ status: false, msg: "You can't follow yourself" });
  }
};

// search user
const searchUsers = async (req, res, next) => {
  try {
    const users = await Users.find({
      "$or": [
        { name: { $regex: req.params.key } }
      ]
    }).select('-password')
    return res.json({ status: true, users })
  } catch (err) {
    next(err);
    return res.status(500).json({ msg: err.message })
  }
}

module.exports = {
  clickFollowBtn,
  updatePassword,
  searchUsers
};
