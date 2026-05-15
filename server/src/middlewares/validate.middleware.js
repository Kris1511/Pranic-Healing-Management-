const Joi = require('joi');
const ApiError = require('../helpers/error.helper');

/**
 * @desc    Validate request body/query/params against Joi schema
 */
const validate = (schema) => (req, res, next) => {
  const validSchema = {};
  const object = {};

  // Extract keys from schema to validate against req properties
  ['params', 'query', 'body'].forEach((key) => {
    if (schema[key]) {
      validSchema[key] = schema[key];
      object[key] = req[key];
    }
  });

  const { value, error } = Joi.compile(validSchema)
    .prefs({ errors: { label: 'key' }, abortEarly: false })
    .validate(object);

  if (error) {
    const errorMessage = error.details.map((details) => details.message).join(', ');
    return next(new ApiError(400, errorMessage));
  }

  Object.assign(req, value);
  return next();
};

module.exports = validate;
