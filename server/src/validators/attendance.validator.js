const Joi = require('joi');

const markPresence = {
  body: Joi.object().keys({
    userId: Joi.string().guid({ version: ['uuidv4'] }),
    status: Joi.string().valid('present', 'absent', 'late', 'on_leave'),
  }),
};

const history = {
  params: Joi.object().keys({
    userId: Joi.string().guid({ version: ['uuidv4'] }),
  }),
  query: Joi.object().keys({
    startDate: Joi.date().iso(),
    endDate: Joi.date().iso(),
  }),
};

module.exports = {
  markPresence,
  history,
};
