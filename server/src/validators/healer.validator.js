const Joi = require('joi');

const register = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    specialization: Joi.string().allow('', null),
    phone: Joi.string().pattern(/^[0-9+]{10,15}$/).allow('', null),
    mobile: Joi.string().pattern(/^[0-9+]{10,15}$/).allow('', null),
    email: Joi.string().email().allow('', null),
    branchId: Joi.string().guid({ version: ['uuidv4'] }).required(),
    healerId: Joi.string().allow('', null),
    gender: Joi.string().allow('', null),
    dob: Joi.date().iso().allow('', null),
    address: Joi.string().allow('', null),
    password: Joi.string().allow('', null),
    status: Joi.string().valid('active', 'inactive', 'Active', 'Inactive'),
    certLevel: Joi.string().allow('', null),
    experience: Joi.number().integer().min(0).allow('', null),
    languages: Joi.string().allow('', null),
    verificationStatus: Joi.string().allow('', null),
    profilePhoto: Joi.string().allow('', null),
    idProof: Joi.string().allow('', null),
    certification: Joi.string().allow('', null),
    bio: Joi.string().allow('', null),
  }),
};

const update = {
  params: Joi.object().keys({
    id: Joi.string().required(),
  }),
  body: Joi.object().keys({
    name: Joi.string(),
    specialization: Joi.string().allow('', null),
    phone: Joi.string().pattern(/^[0-9+]{10,15}$/).allow('', null),
    mobile: Joi.string().pattern(/^[0-9+]{10,15}$/).allow('', null),
    email: Joi.string().email().allow('', null),
    status: Joi.string().valid('active', 'inactive', 'Active', 'Inactive'),
    healerId: Joi.string().allow('', null),
    gender: Joi.string().allow('', null),
    dob: Joi.date().iso().allow('', null),
    address: Joi.string().allow('', null),
    password: Joi.string().allow('', null),
    certLevel: Joi.string().allow('', null),
    experience: Joi.number().integer().min(0).allow('', null),
    languages: Joi.string().allow('', null),
    verificationStatus: Joi.string().allow('', null),
    profilePhoto: Joi.string().allow('', null),
    idProof: Joi.string().allow('', null),
    certification: Joi.string().allow('', null),
    bio: Joi.string().allow('', null),
  }).min(1),
};

module.exports = {
  register,
  update,
};
