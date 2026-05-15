const Joi = require('joi');

const addTransaction = {
  body: Joi.object().keys({
    type: Joi.string().valid('income', 'expense').required(),
    category: Joi.string().required(),
    amount: Joi.number().precision(2).required(),
    description: Joi.string().allow(''),
    date: Joi.date().iso().default(Date.now),
    branchId: Joi.string().guid({ version: ['uuidv4'] }).required(),
  }),
};

const getSummary = {
  query: Joi.object().keys({
    branchId: Joi.string().guid({ version: ['uuidv4'] }).required(),
    startDate: Joi.date().iso(),
    endDate: Joi.date().iso(),
  }),
};

module.exports = {
  addTransaction,
  getSummary,
};
