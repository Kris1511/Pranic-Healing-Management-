const Joi = require('joi');

const checkIn = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    phone: Joi.string().pattern(/^[0-9+]{10,15}$/),
    purpose: Joi.string(),
    visitorType: Joi.string().required(),
    branchId: Joi.string().guid({ version: ['uuidv4'] }).required(),
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
