'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableInfo = await queryInterface.describeTable('documents');
    
    if (!tableInfo.original_name) {
      await queryInterface.addColumn('documents', 'original_name', {
        type: Sequelize.STRING,
        allowNull: true,
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    const tableInfo = await queryInterface.describeTable('documents');
    
    if (tableInfo.original_name) {
      await queryInterface.removeColumn('documents', 'original_name');
    }
  }
};
