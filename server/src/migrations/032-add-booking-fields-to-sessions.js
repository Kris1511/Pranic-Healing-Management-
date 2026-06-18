'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableInfo = await queryInterface.describeTable('sessions');
    
    if (!tableInfo.treatment_type) {
      await queryInterface.addColumn('sessions', 'treatment_type', {
        type: Sequelize.STRING,
        allowNull: true,
      });
    }
    if (!tableInfo.start_time) {
      await queryInterface.addColumn('sessions', 'start_time', {
        type: Sequelize.STRING,
        allowNull: true,
      });
    }
    if (!tableInfo.end_time) {
      await queryInterface.addColumn('sessions', 'end_time', {
        type: Sequelize.STRING,
        allowNull: true,
      });
    }
    if (!tableInfo.followup_required) {
      await queryInterface.addColumn('sessions', 'followup_required', {
        type: Sequelize.BOOLEAN,
        allowNull: true,
        defaultValue: false,
      });
    }
    if (!tableInfo.followup_priority) {
      await queryInterface.addColumn('sessions', 'followup_priority', {
        type: Sequelize.ENUM('NONE', 'PENDING', 'URGENT'),
        allowNull: true,
        defaultValue: 'NONE',
      });
    }
    if (!tableInfo.followup_date) {
      await queryInterface.addColumn('sessions', 'followup_date', {
        type: Sequelize.DATEONLY,
        allowNull: true,
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    const tableInfo = await queryInterface.describeTable('sessions');
    
    if (tableInfo.treatment_type) await queryInterface.removeColumn('sessions', 'treatment_type');
    if (tableInfo.start_time) await queryInterface.removeColumn('sessions', 'start_time');
    if (tableInfo.end_time) await queryInterface.removeColumn('sessions', 'end_time');
    if (tableInfo.followup_required) await queryInterface.removeColumn('sessions', 'followup_required');
    if (tableInfo.followup_priority) await queryInterface.removeColumn('sessions', 'followup_priority');
    if (tableInfo.followup_date) await queryInterface.removeColumn('sessions', 'followup_date');
  }
};
