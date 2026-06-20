const Joi = require('joi');

const register = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    patientId: Joi.string().allow('', null),
    age: Joi.number().integer().min(0).max(120).allow(null),
    gender: Joi.string().valid('male', 'female', 'other', 'Male', 'Female', 'Other').allow('', null),
    phone: Joi.string().pattern(/^[0-9+\s]{10,20}$/).allow('', null),
    address: Joi.string().allow('', null),
    branchId: Joi.string().guid({ version: ['uuidv4'] }).allow('', null),
    dob: Joi.date().iso().allow('', null),
    bloodGroup: Joi.string().allow('', null),
    occupation: Joi.string().allow('', null),
    email: Joi.string().email().allow('', null),
    emergencyContact: Joi.string().allow('', null),
    medicalHistory: Joi.string().allow('', null),
    treatmentType: Joi.string().allow('', null),
    healerId: Joi.string().guid({ version: ['uuidv4'] }).allow('', null),
    password: Joi.string().allow('', null),
    status: Joi.string().valid('active', 'inactive', 'Active', 'Inactive').allow('', null),
    medicalReport: Joi.string().allow('', null),
    labReport: Joi.string().allow('', null),
    prescription: Joi.string().allow('', null),
    idProof: Joi.string().allow('', null),
  }),
};

const update = {
  params: Joi.object().keys({
    id: Joi.string().guid({ version: ['uuidv4'] }).required(),
  }),
  body: Joi.object().keys({
    name: Joi.string(),
    age: Joi.number().integer().min(0).max(120).allow(null),
    gender: Joi.string().valid('male', 'female', 'other', 'Male', 'Female', 'Other').allow('', null),
    phone: Joi.string().pattern(/^[0-9+\s]{10,20}$/).allow('', null),
    address: Joi.string().allow('', null),
    status: Joi.string().valid('active', 'inactive', 'Active', 'Inactive'),
    dob: Joi.date().iso().allow('', null),
    bloodGroup: Joi.string().allow('', null),
    occupation: Joi.string().allow('', null),
    email: Joi.string().email().allow('', null),
    emergencyContact: Joi.string().allow('', null),
    medicalHistory: Joi.string().allow('', null),
    treatmentType: Joi.string().allow('', null),
    healerId: Joi.string().guid({ version: ['uuidv4'] }).allow('', null),
    branchId: Joi.string().guid({ version: ['uuidv4'] }).allow('', null),
    password: Joi.string().allow('', null),
    medicalReport: Joi.string().allow('', null),
    labReport: Joi.string().allow('', null),
    prescription: Joi.string().allow('', null),
    idProof: Joi.string().allow('', null),
  }).min(1),
};

module.exports = {
  register,
  update,
};
