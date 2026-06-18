const admin = require('firebase-admin');
const config = require('./env.config');
const logger = require('./logger.config');

const firebaseConfig = {
  projectId: config.firebase.projectId,
  clientEmail: config.firebase.clientEmail,
  privateKey: config.firebase.privateKey ? config.firebase.privateKey.replace(/\\n/g, '\n') : undefined,
};

const initializeFirebase = () => {
  try {
    if (firebaseConfig.projectId && firebaseConfig.clientEmail && firebaseConfig.privateKey) {
      admin.initializeApp({
        credential: admin.credential.cert(firebaseConfig),
      });
      logger.info('Firebase Admin SDK initialized successfully.');
    } else {
      logger.warn('Firebase configuration missing. Firebase features will be disabled.');
    }
  } catch (error) {
    logger.error('Firebase initialization failed:', error);
  }
};

module.exports = { admin, initializeFirebase };
