const { sequelize } = require('./src/config/db.config');

const run = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.query('ALTER TABLE visitors ADD COLUMN visitor_id VARCHAR(255) UNIQUE;');
    console.log('Successfully added visitor_id column to visitors table');
  } catch (error) {
    console.error('Migration error:', error);
  } finally {
    process.exit();
  }
};

run();
