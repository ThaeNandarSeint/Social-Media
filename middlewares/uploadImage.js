const Users = require('../models/userModel')

const cloudinary = require('cloudinary')
const fs = require('fs')

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET
})

const uploadImage = async (req, res, next) => {
    // isEmpty validation
    if (!req.files || Object.keys(req.files).length === 0) {
        req.body.files = [
            {
                secure_url: '',
                public_id: ''
            }
        ]
        next()
        return;
    }

    try {
        const user = await Users.findById(req.body.userId)

        const { files } = req.files
        console.log(files);

        // const uploadPromises = [];

        // if(!pictures.length){
        //     validatePicture(pictures)
        //     uploadPromises.push(cloudinary.v2.uploader.upload(pictures.tempFilePath, {
        //         folder: `${user.name}/${req.folderName}/`,
        //         width: 600,
        //         height: 600,
        //         crop: 'fill'
        //     }));
        // }        

        // for (let i = 0; i < pictures.length; i++) {
        //     const picture = pictures[i];

        //     validatePicture(picture)

        //     uploadPromises.push(cloudinary.v2.uploader.upload(picture.tempFilePath, {
        //         folder: `${user.name}/${req.folderName}/`,
        //         width: 600,
        //         height: 600,
        //         crop: 'fill'
        //     }));
        // }

        // Promise.all(uploadPromises)
        //     .then((pics) => {
        //         req.body.pictures = pics
        //         if(!pictures.length) {
        //             removeTmp(pictures.tempFilePath)
        //         }
        //         for (let i = 0; i < pictures.length; i++) {
        //             const picture = pictures[i];
        //             removeTmp(picture.tempFilePath)
        //         }
        //         next()
        //     })
        //     .catch((err) => {
        //         console.log(err);
        //     });

    } catch (err) {
        console.log(err);
    }
}

const validatePicture = (picture) => {
    // file size validation
    if (picture.size > 1024 * 1024) {
        removeTmp(picture.tempFilePath)
        return res.status(400).json({ msg: "File size is too large!" })
    }//1mb

    // file type validation
    if (picture.mimetype !== 'image/jpeg' && picture.mimetype !== 'image/png') {
        removeTmp(picture.tempFilePath)
        return res.status(400).json({ msg: "File format is incorrect" })
    }
}


// remove temp file
const removeTmp = (path) => {
    fs.unlink(path, (err) => {
        if (err) throw err
    })
}

module.exports = {
    uploadImage
}