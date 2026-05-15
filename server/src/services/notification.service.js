const { admin } = require('../config/firebase.config');
const logger = require('../config/logger.config');

class NotificationService {
  /**
   * @desc    Send Push Notification via FCM
   */
  async sendPushNotification(token, title, body, data = {}) {
    try {
      const message = {
        notification: {
          title,
          body,
        },
        data,
        token,
      };

      const response = await admin.messaging().send(message);
      logger.info(`Successfully sent FCM message: ${response}`);
      return response;
    } catch (error) {
      logger.error('Error sending FCM message:', error);
      return null;
    }
  }

  /**
   * @desc    Send Multicast Push Notification
   */
  async sendMulticastNotification(tokens, title, body, data = {}) {
    if (!tokens || tokens.length === 0) return;

    try {
      const message = {
        notification: {
          title,
          body,
        },
        data,
        tokens,
      };

      const response = await admin.messaging().sendEachForMulticast(message);
      logger.info(`${response.successCount} FCM messages were sent successfully`);
      return response;
    } catch (error) {
      logger.error('Error sending multicast FCM message:', error);
      return null;
    }
  }
}

module.exports = new NotificationService();
