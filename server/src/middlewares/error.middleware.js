const logger = require('../config/logger.config');
const { sendError } = require('../helpers/response.helper');

const errorMiddleware = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let errors = null;

  // Log for developer
  logger.error(err);

  // Sequelize unique constraint error
  if (err.name === 'SequelizeUniqueConstraintError') {
    statusCode = 400;
    message = 'Duplicate field value entered';
    errors = err.errors.map(e => ({ field: e.path, message: e.message }));
  }

  // Sequelize validation error
  if (err.name === 'SequelizeValidationError') {
    statusCode = 400;
    message = 'Validation Error';
    errors = err.errors.map(e => ({ field: e.path, message: e.message }));
  }

  // Joi Validation error
  if (err.isJoi) {
    statusCode = 400;
    message = 'Input Validation Error';
    errors = err.details.map(d => ({ field: d.path[0], message: d.message }));
  }

  sendError(res, statusCode, message, errors);
};

module.exports = errorMiddleware;
