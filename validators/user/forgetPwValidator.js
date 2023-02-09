const joi = require("joi");
const { errorHandler } = require("../../helpers/errorHandler");

const validation = joi.object({
     email: joi.string().email().trim(true).required()
});

const forgetPwValidator = async (req, res, next) => {
	const payload = {
		email: req.body.email
	};

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

module.exports = forgetPwValidator;