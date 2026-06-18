'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableInfo = await queryInterface.describeTable('finance');
    
    if (!tableInfo.remarks) {
      await queryInterface.addColumn('finance', 'remarks', {
        type: Sequelize.TEXT,
        allowNull: true,
      });
    }
    
    if (!tableInfo.payment_mode) {
      await queryInterface.addColumn('finance', 'payment_mode', {
        type: Sequelize.STRING,
        allowNull: true,
      });
    }
    
    if (!tableInfo.created_by) {
      await queryInterface.addColumn('finance', 'created_by', {
        type: Sequelize.STRING,
        allowNull: true,
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    const tableInfo = await queryInterface.describeTable('finance');
    
    if (tableInfo.remarks) {
      await queryInterface.removeColumn('finance', 'remarks');
    }
    if (tableInfo.payment_mode) {
      await queryInterface.removeColumn('finance', 'payment_mode');
    }
    if (tableInfo.created_by) {
      await queryInterface.removeColumn('finance', 'created_by');
    }
  }
};
