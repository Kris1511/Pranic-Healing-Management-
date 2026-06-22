const Joi = require('joi');

const create = {
  body: Joi.object().keys({
    patient_id: Joi.string().guid({ version: ['uuidv4'] }).required(),
    healer_id: Joi.string().guid({ version: ['uuidv4'] }),
    branch_id: Joi.string().guid({ version: ['uuidv4'] }).required(),
    treatment_type: Joi.string().required(),
    session_date: Joi.date().iso().required(),
    start_time: Joi.string().required(),
    end_time: Joi.string().required(),
    notes: Joi.string().allow('', null),
    total_amount: Joi.number().precision(2).required(),
    session_fee: Joi.number().precision(2).allow(null),
    payment_status: Joi.string().valid('Paid', 'Pending', 'paid', 'pending').allow('', null),
    payment_method: Joi.string().valid('UPI', 'Cash', 'upi', 'cash').allow('', null),
    status: Joi.string().valid('scheduled', 'completed', 'cancelled', 'Scheduled', 'Completed', 'Cancelled').allow('', null),
    followup_required: Joi.boolean().allow(null),
    followup_priority: Joi.string().allow('', null),
    followup_date: Joi.date().iso().allow('', null),
  }),
};

const update = {
  params: Joi.object().keys({
    id: Joi.string().guid({ version: ['uuidv4'] }).required(),
  }),
  body: Joi.object().keys({
    patient_id: Joi.string().guid({ version: ['uuidv4'] }),
    healer_id: Joi.string().guid({ version: ['uuidv4'] }),
    branch_id: Joi.string().guid({ version: ['uuidv4'] }),
    treatment_type: Joi.string(),
    session_date: Joi.date().iso(),
    start_time: Joi.string(),
    end_time: Joi.string(),
    notes: Joi.string().allow('', null),
    status: Joi.string().valid('scheduled', 'completed', 'cancelled', 'Scheduled', 'Completed', 'Cancelled'),
    total_amount: Joi.number().precision(2),
    session_fee: Joi.number().precision(2).allow(null),
    payment_status: Joi.string().valid('Paid', 'Pending', 'paid', 'pending').allow('', null),
    payment_method: Joi.string().valid('UPI', 'Cash', 'upi', 'cash').allow('', null),
    followup_required: Joi.boolean().allow(null),
    followup_priority: Joi.string().allow('', null),
    followup_date: Joi.date().iso().allow('', null),
  }).min(1),
};

module.exports = {
  create,
  update,
};
