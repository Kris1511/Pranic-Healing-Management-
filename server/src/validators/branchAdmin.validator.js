const Joi = require('joi');

const create = {
  body: Joi.object().keys({
    userId: Joi.string().guid({ version: ['uuidv4'] }),
    branchId: Joi.string().guid({ version: ['uuidv4'] }).required(),
    
    // User fields (required if userId is not provided)
    name: Joi.string().when('userId', { is: Joi.exist(), then: Joi.optional(), otherwise: Joi.required() }),
    email: Joi.string().email().when('userId', { is: Joi.exist(), then: Joi.optional(), otherwise: Joi.required() }),
    password: Joi.string().min(6).when('userId', { is: Joi.exist(), then: Joi.optional(), otherwise: Joi.required() }),
    phone: Joi.string().pattern(/^[0-9+]{10,15}$/).when('userId', { is: Joi.exist(), then: Joi.optional(), otherwise: Joi.required() }),
    
    // Optional demographic and address fields
    dob: Joi.date().iso().allow('', null),
    gender: Joi.string().valid('Male', 'Female', 'Other', 'male', 'female', 'other').allow('', null),
    addressLine1: Joi.string().allow('', null),
    addressLine2: Joi.string().allow('', null),
    city: Joi.string().allow('', null),
    district: Joi.string().allow('', null),
    state: Joi.string().allow('', null),
    pincode: Joi.string().allow('', null),
    idProof: Joi.any(),
  }),
};

const update = {
  params: Joi.object().keys({
    id: Joi.string().guid({ version: ['uuidv4'] }).required(),
  }),
  body: Joi.object().keys({
    branchId: Joi.string().guid({ version: ['uuidv4'] }),
    name: Joi.string().allow('', null),
    email: Joi.string().email().allow('', null),
    password: Joi.string().min(6).allow('', null),
    phone: Joi.string().pattern(/^[0-9+]{10,15}$/).allow('', null),
    dob: Joi.date().iso().allow('', null),
    gender: Joi.string().valid('Male', 'Female', 'Other', 'male', 'female', 'other').allow('', null),
    addressLine1: Joi.string().allow('', null),
    addressLine2: Joi.string().allow('', null),
    city: Joi.string().allow('', null),
    district: Joi.string().allow('', null),
    state: Joi.string().allow('', null),
    pincode: Joi.string().allow('', null),
    status: Joi.string().valid('active', 'inactive', 'Active', 'Inactive'),
  }).min(1),
};

module.exports = {
  create,
  update,
};
