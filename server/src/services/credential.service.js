const { transporter } = require('../config/mail.config');
const logger = require('../config/logger.config');
const config = require('../config/env.config');

class CredentialService {
  /**
   * @desc    Send login credentials to user email
   */
  async sendCredentials(user, password) {
    try {
      const mailOptions = {
        from: config.email.from,
        to: user.email,
        subject: 'Your PHMS Account Credentials',
        template: 'credentials',
        context: {
          name: user.name,
          email: user.email,
          password: password,
          loginUrl: 'https://phms-app.com/login', // Update with actual URL
        },
      };

      await transporter.sendMail(mailOptions);
      logger.info(`Credentials sent successfully to ${user.email}`);
      return true;
    } catch (error) {
      logger.error(`Failed to send credentials to ${user.email}:`, error);
      return false;
    }
  }
}

module.exports = new CredentialService();
