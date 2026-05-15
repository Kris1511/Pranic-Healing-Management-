const Joi = require('joi');

const login = {
  body: Joi.object().keys({
    token: Joi.string().required(),
  }),
};

module.exports = {
  login,
};
