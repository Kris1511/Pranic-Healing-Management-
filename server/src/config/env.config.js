const Joi = require('joi');
require('dotenv').config();

const envVarsSchema = Joi.object()
  .keys({
    NODE_ENV: Joi.string().valid('production', 'development', 'test').required(),
    PORT: Joi.number().default(5000),
    DB_HOST: Joi.string().required().description('Database host'),
    DB_USER: Joi.string().required().description('Database user'),
    DB_PASSWORD: Joi.string().allow('').required().description('Database password'),
    DB_NAME: Joi.string().required().description('Database name'),
    DB_DIALECT: Joi.string().default('mysql'),
    FIREBASE_PROJECT_ID: Joi.string().allow(''),
    FIREBASE_CLIENT_EMAIL: Joi.string().allow(''),
    FIREBASE_PRIVATE_KEY: Joi.string().allow(''),
    SMTP_HOST: Joi.string().description('server that will send the emails'),
    SMTP_PORT: Joi.number().description('port to connect to the email server'),
    SMTP_USER: Joi.string().description('username for email server'),
    SMTP_PASS: Joi.string().description('password for email server'),
    FROM_EMAIL: Joi.string().description('the from field in the emails sent by the app'),
    JWT_SECRET: Joi.string().required().description('JWT secret key'),
    JWT_EXPIRE: Joi.string().default('30d'),
  })
  .unknown();

const { value: envVars, error } = envVarsSchema.prefs({ errors: { label: 'key' } }).validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

module.exports = {
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  db: {
    host: envVars.DB_HOST,
    user: envVars.DB_USER,
    password: envVars.DB_PASSWORD,
    name: envVars.DB_NAME,
    dialect: envVars.DB_DIALECT,
  },
  firebase: {
    projectId: envVars.FIREBASE_PROJECT_ID,
    clientEmail: envVars.FIREBASE_CLIENT_EMAIL,
    privateKey: envVars.FIREBASE_PRIVATE_KEY,
  },
  email: {
    smtp: {
      host: envVars.SMTP_HOST,
      port: envVars.SMTP_PORT,
      auth: {
        user: envVars.SMTP_USER,
        pass: envVars.SMTP_PASS,
      },
    },
    from: envVars.FROM_EMAIL,
  },
  jwt: {
    secret: envVars.JWT_SECRET,
    expire: envVars.JWT_EXPIRE,
  },
};
