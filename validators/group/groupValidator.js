const joi = require("joi");
const { errorHandler } = require("../../helpers/errorHandler");

const validation = joi.object({     
    groupName: joi.string().trim(true).required()
});

const groupValidator = async (req, res, next) => {
	const payload = {
		groupName: req.body.groupName
	};

	const { error } = validation.validate(payload);
	if (error) {
		res.status(406);
		return res.json(
			errorHandler(true, `Error in User Data : ${error.message}`)
		);
	} else {
		// req.folderName = `Group_Pictures/${groupName}`
		next();
	}
};

module.exports = groupValidator;