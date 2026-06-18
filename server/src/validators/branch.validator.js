const Joi = require('joi');

const create = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    address: Joi.string().allow('', null),
    phone: Joi.string().allow('', null),
    email: Joi.string().email().allow('', null),
    status: Joi.string().valid('active', 'inactive').default('active'),
    addressLine1: Joi.string().allow('', null),
    addressLine2: Joi.string().allow('', null),
    city: Joi.string().allow('', null),
    district: Joi.string().allow('', null),
    state: Joi.string().allow('', null),
    pincode: Joi.string().allow('', null),
    details: Joi.string().allow('', null),
  }),
};

const update = {
  body: Joi.object().keys({
    name: Joi.string().allow('', null),
    address: Joi.string().allow('', null),
    phone: Joi.string().allow('', null),
    email: Joi.string().email().allow('', null),
    status: Joi.string().valid('active', 'inactive'),
    addressLine1: Joi.string().allow('', null),
    addressLine2: Joi.string().allow('', null),
    city: Joi.string().allow('', null),
    district: Joi.string().allow('', null),
    state: Joi.string().allow('', null),
    pincode: Joi.string().allow('', null),
    details: Joi.string().allow('', null),
  }).min(1),
};

module.exports = {
  create,
  update,
};
