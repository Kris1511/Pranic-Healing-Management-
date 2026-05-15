const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const xss = require('xss-clean');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const path = require('path');
require('express-async-errors');

const errorMiddleware = require('./middlewares/error.middleware');
const config = require('./config/env.config');
const routes = require('./routes/index');

const app = express();

// Body parser
app.use(express.json());

// Set security headers
app.use(helmet());

// Prevent XSS attacks
app.use(xss());

// Prevent NoSQL injection
app.use(mongoSanitize());

// Rate limiting
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 mins
  max: 100
});
app.use(limiter);

// Prevent http param pollution
app.use(hpp());

// Enable CORS
app.use(cors());

// Logging
if (config.env === 'development') {
  app.use(morgan('dev'));
}

// Set static folder
app.use('/storage', express.static(path.join(__dirname, 'storage')));

// API Routes
app.use('/api', routes);

// Basic route
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to PHMS API'
  });
});

// Error handler
app.use(errorMiddleware);

module.exports = app;
