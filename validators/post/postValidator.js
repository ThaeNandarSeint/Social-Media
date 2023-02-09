const joi = require("joi");
const { errorHandler } = require("../../helpers/errorHandler");

const validation = joi.object({     
     caption: joi.string().trim(true).required()
});

const postValidator = async (req, res, next) => {
	const payload = {
		caption: req.body.caption
	};

	const { error } = validation.validate(payload);
	if (error) {
		res.status(406);
		return res.json(
			errorHandler(true, `Error in User Data : ${error.message}`)
		);
	} else {
		req.folderName = `Post_Pictures/${req.body.caption}`
		next();
	}
};

module.exports = {
	postValidator
};