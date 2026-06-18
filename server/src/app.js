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

// Enable CORS first — must be before all other middleware so CORS headers
// are present on every response, including rate-limit (429) and error responses.
// Without this ordering, the browser sees a response with no CORS headers and
// reports a generic "Network Error" instead of the real HTTP status code.
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

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
