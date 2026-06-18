const { Sequelize } = require('sequelize');
const config = require('./env.config');
const logger = require('./logger.config');

const sequelize = new Sequelize(
  config.db.name,
  config.db.user,
  config.db.password,
  {
    host: config.db.host,
    dialect: config.db.dialect,
    logging: (msg) => logger.debug(msg),
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    logger.info('MySQL Database connected successfully.');
  } catch (error) {
    logger.error('Unable to connect to the database:', error);
    process.exit(1);
  }
};

const cliConfig = {
  username: config.db.user,
  password: config.db.password,
  database: config.db.name,
  host: config.db.host,
  dialect: config.db.dialect,
  logging: (msg) => logger.debug(msg)
};

module.exports = { 
  sequelize, 
  connectDB,
  development: cliConfig,
  test: cliConfig,
  production: cliConfig
};
