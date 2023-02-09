const errorHandler = (errorBit, msg) => {
  if (errorBit) return { is_error: errorBit, message: msg };
  // else return { is_error: errorBit, message: msg, data };
};

module.exports = {
  errorHandler
};