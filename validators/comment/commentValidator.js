const joi = require("joi");
const { errorHandler } = require("../../helpers/errorHandler");

const Posts = require('../../models/postModel')

const validation = joi.object({     
    content: joi.string().trim(true).required()
});

const commentValidator = async (req, res, next) => {
	const { caption } = await Posts.findById(req.body.postId)
	const payload = {
		content: req.body.content
	};

	const { error } = validation.validate(payload);
	if (error) {
		res.status(406);
		return res.json(
			errorHandler(true, `Error in User Data : ${error.message}`)
		);
	} else {
		req.folderName = `Comment_Pictures/${caption}`
		next();
	}
};

module.exports = commentValidator;