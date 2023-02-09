const joi = require("joi");
const { errorHandler } = require("../../helpers/errorHandler");

const validation = joi.object({
     name: joi.string().min(3).max(25).trim(true).required(),
     email: joi.string().email().trim(true).required(),
     password: joi.string().min(8).trim(true).required()
});

const registerValidator = async (req, res, next) => {
	const { name, email, password } = req.body;
	const payload ={ name, email, password }

	const { error } = validation.validate(payload);
	if (error) {
		res.status(406);
		return res.json(
			errorHandler(true, `Error in User Data : ${error.message}`)
		);
	} else {
		req.folderName = 'User_Profile'
		next();
	}
};

module.exports = registerValidator;