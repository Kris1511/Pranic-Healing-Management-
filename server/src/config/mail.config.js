const nodemailer = require('nodemailer');
const hbs = require('nodemailer-express-handlebars').default;
const path = require('path');
const config = require('./env.config');
const logger = require('./logger.config');

const transporter = nodemailer.createTransport({
  host: config.email.smtp.host,
  port: config.email.smtp.port,
  secure: config.email.smtp.port == 465,
  auth: {
    user: config.email.smtp.auth.user,
    pass: config.email.smtp.auth.pass,
  },
});

const handlebarOptions = {
  viewEngine: {
    extName: '.hbs',
    partialsDir: path.resolve(__dirname, '../templates/email/partials'),
    defaultLayout: false,
  },
  viewPath: path.resolve(__dirname, '../templates/email'),
  extName: '.hbs',
};

transporter.use('compile', hbs(handlebarOptions));

const verifyMailer = async () => {
  try {
    if (config.email.smtp.host) {
      await transporter.verify();
      logger.info('SMTP Mailer verified successfully.');
    }
  } catch (error) {
    logger.warn('SMTP Mailer verification failed. Email sending may not work.');
  }
};

module.exports = { transporter, verifyMailer };
