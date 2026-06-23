const { sequelize } = require('./src/config/db.config');
const { DataTypes } = require('sequelize');

async function alterTable() {
  await sequelize.authenticate();
  const queryInterface = sequelize.getQueryInterface();
  try {
    await queryInterface.addColumn('feedbacks', 'session_id', {
      type: DataTypes.UUID,
      allowNull: true,
    });
    console.log("Added session_id to feedbacks table");
  } catch (err) {
    console.log("Column might already exist or error: ", err.message);
  }
}

alterTable().catch(console.error).finally(() => process.exit(0));
