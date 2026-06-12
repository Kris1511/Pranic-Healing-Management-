const { sequelize } = require('./src/config/db.config');

const run = async () => {
  try {
    await sequelize.authenticate();
    
    // Add branch_id to attendance
    await sequelize.query('ALTER TABLE attendance ADD COLUMN branch_id CHAR(36) NULL REFERENCES branches(id) ON UPDATE CASCADE ON DELETE SET NULL;');
    console.log('Successfully added branch_id column to attendance table');
  } catch (error) {
    if (error.original && error.original.code === 'ER_DUP_FIELDNAME') {
      console.log('branch_id column already exists.');
    } else {
      console.error('Migration error:', error);
    }
  } finally {
    process.exit();
  }
};

run();
