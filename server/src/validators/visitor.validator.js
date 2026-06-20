const Joi = require('joi');

const checkIn = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    phone: Joi.string().pattern(/^[0-9+]{10,15}$/),
    purpose: Joi.string().allow('', null),
    visitorType: Joi.string().required(),
    branchId: Joi.string().guid({ version: ['uuidv4'] }).required(),
    referenceSource: Joi.array().items(Joi.string()).required(),
    gender: Joi.string().allow('', null),
    idProof: Joi.string().allow('', null),
    address: Joi.string().allow('', null),
    entryDate: Joi.string().allow('', null),
    referralName: Joi.string().allow('', null)
  }),
};

const checkOut = {
  params: Joi.object().keys({
    id: Joi.string().guid({ version: ['uuidv4'] }).required(),
  }),
};

module.exports = {
  checkIn,
  checkOut,
};
