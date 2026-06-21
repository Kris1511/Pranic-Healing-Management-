'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableInfo = await queryInterface.describeTable('visitors');
    
    if (!tableInfo.reference_source) {
      await queryInterface.addColumn('visitors', 'reference_source', {
        type: Sequelize.TEXT,
        allowNull: true,
      });
    }
    
    if (tableInfo.email) {
      await queryInterface.removeColumn('visitors', 'email');
    }
  },

  down: async (queryInterface, Sequelize) => {
    const tableInfo = await queryInterface.describeTable('visitors');
    
    if (tableInfo.reference_source) {
      await queryInterface.removeColumn('visitors', 'reference_source');
    }
    
    if (!tableInfo.email) {
      await queryInterface.addColumn('visitors', 'email', {
        type: Sequelize.STRING,
        allowNull: true,
      });
    }
  }
};
