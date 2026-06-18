const { transporter } = require('../config/mail.config');
const config = require('../config/env.config');
const logger = require('../config/logger.config');

/**
 * @desc    Send email using templates
 */
const sendEmail = async (options) => {
  try {
    const mailOptions = {
      from: options.from || config.email.from,
      to: options.to,
      subject: options.subject,
      template: options.template,
      context: options.context,
    };

    const info = await transporter.sendMail(mailOptions);
    logger.info(`Email sent: ${info.messageId}`);
    return info;
  } catch (error) {
    logger.error('Email send error:', error);
    throw error;
  }
};

module.exports = {
  sendEmail,
};
