const Joi = require('joi');

const create = {
  body: Joi.object().keys({
    patientId: Joi.string().guid({ version: ['uuidv4'] }).required(),
    healerId: Joi.string().guid({ version: ['uuidv4'] }).required(),
    branchId: Joi.string().guid({ version: ['uuidv4'] }).required(),
    sessionDate: Joi.date().iso().required(),
    notes: Joi.string().allow(''),
    totalAmount: Joi.number().precision(2),
  }),
};

const update = {
  params: Joi.object().keys({
    id: Joi.string().guid({ version: ['uuidv4'] }).required(),
  }),
  body: Joi.object().keys({
    sessionDate: Joi.date().iso(),
    notes: Joi.string().allow(''),
    status: Joi.string().valid('scheduled', 'completed', 'cancelled'),
    totalAmount: Joi.number().precision(2),
  }).min(1),
};

module.exports = {
  create,
  update,
};
