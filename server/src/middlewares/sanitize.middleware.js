const xss = require('xss-clean');
const mongoSanitize = require('express-mongo-sanitize');

/**
 * @desc    Combine XSS and NoSQL injection sanitization
 */
const sanitize = () => {
  return [
    xss(),
    mongoSanitize()
  ];
};

module.exports = sanitize;
