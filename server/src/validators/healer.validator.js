const Joi = require('joi');

const register = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    specialization: Joi.string(),
    phone: Joi.string().pattern(/^[0-9+]{10,15}$/),
    email: Joi.string().email(),
    branchId: Joi.string().guid({ version: ['uuidv4'] }).required(),
  }),
};

const update = {
  params: Joi.object().keys({
    id: Joi.string().guid({ version: ['uuidv4'] }).required(),
  }),
  body: Joi.object().keys({
    name: Joi.string(),
    specialization: Joi.string(),
    phone: Joi.string().pattern(/^[0-9+]{10,15}$/),
    email: Joi.string().email(),
    status: Joi.string().valid('active', 'inactive'),
  }).min(1),
};

module.exports = {
  register,
  update,
};
