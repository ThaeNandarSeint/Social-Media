const joi = require("joi");
const { errorHandler } = require("../../helpers/errorHandler");

const validation = joi.object({
     password: joi.string().min(8).trim(true).required()
});

const resetPwValidator = async (req, res, next) => {
	const payload = {
		password: req.body.password
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

module.exports = resetPwValidator;