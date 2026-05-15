const Joi = require('joi');

const register = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    patientId: Joi.string().allow(''),
    age: Joi.number().integer().min(0).max(120),
    gender: Joi.string().valid('male', 'female', 'other'),
    phone: Joi.string().pattern(/^[0-9+]{10,15}$/),
    address: Joi.string(),
    branchId: Joi.string().guid({ version: ['uuidv4'] }),
  }),
};

const update = {
  params: Joi.object().keys({
    id: Joi.string().guid({ version: ['uuidv4'] }).required(),
  }),
  body: Joi.object().keys({
    name: Joi.string(),
    age: Joi.number().integer().min(0).max(120),
    gender: Joi.string().valid('male', 'female', 'other'),
    phone: Joi.string().pattern(/^[0-9+]{10,15}$/),
    address: Joi.string(),
    status: Joi.string().valid('active', 'inactive'),
  }).min(1),
};

module.exports = {
  register,
  update,
};
