const app = require('./app');
const config = require('./config/env.config');
const logger = require('./config/logger.config');
const { connectDB } = require('./config/db.config');
const { initializeFirebase } = require('./config/firebase.config');
const { verifyMailer } = require('./config/mail.config');

const PORT = config.port || 5000;

// Connect to Database
connectDB();

// Initialize Firebase
initializeFirebase();

// Verify Mailer
verifyMailer();

const server = app.listen(PORT, () => {
  logger.info(`Server running in ${config.env} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  logger.error(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});
