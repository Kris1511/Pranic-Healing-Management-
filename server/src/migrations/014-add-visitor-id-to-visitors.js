'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableInfo = await queryInterface.describeTable('visitors');
    if (!tableInfo.visitor_id) {
      await queryInterface.addColumn('visitors', 'visitor_id', {
        type: Sequelize.STRING,
        allowNull: true,
        unique: true
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    const tableInfo = await queryInterface.describeTable('visitors');
    if (tableInfo.visitor_id) {
      await queryInterface.removeColumn('visitors', 'visitor_id');
    }
  }
};
