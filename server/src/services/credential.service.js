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
          loginUrl: 'http://localhost:5173/auth/signin', // Update with actual URL
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

  /**
   * @desc    Send login credentials to user via SMS
   */
  async sendSMS(user, password) {
    try {
      if (!user.phoneNumber && !user.phone && !user.mobile) {
        logger.warn(`No phone number provided for ${user.email || user.name}. Skipping SMS.`);
        return false;
      }
      
      const phone = user.phoneNumber || user.phone || user.mobile;
      const message = `Hello ${user.name},\nWelcome to PHMS! Your account has been created.\nEmail: ${user.email}\nPassword: ${password}\nLogin at: http://localhost:5173/auth/signin`;
      
      // TODO: Integrate actual SMS gateway like Twilio, MSG91, or AWS SNS here
      logger.info(`[MOCK SMS] Sent to ${phone}: ${message}`);
      
      return true;
    } catch (error) {
      logger.error(`Failed to send SMS to ${user.name}:`, error);
      return false;
    }
  }
}

module.exports = new CredentialService();
