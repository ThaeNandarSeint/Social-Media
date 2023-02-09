const joi = require("joi");
const { errorHandler } = require("../../helpers/errorHandler");

const validation = joi.object({
     email: joi.string().email().trim(true).required(),
     password: joi.string().min(8).trim(true).required()
});

const loginValidator = async (req, res, next) => {
	const { email, password } = req.body;
	const payload = { email, password }

	const { error } = validation.validate(payload);
	if (error) {
		res.status(406);
		return res.json(
			errorHandler(true, `Error in User Data : ${error.message}`)
		);
	} else {		
		next();
	}
};

module.exports = loginValidator;