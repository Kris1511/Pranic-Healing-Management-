'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableInfo = await queryInterface.describeTable('branches');
    if (!tableInfo.status) {
      await queryInterface.addColumn('branches', 'status', {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'active',
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    const tableInfo = await queryInterface.describeTable('branches');
    if (tableInfo.status) {
      await queryInterface.removeColumn('branches', 'status');
    }
  }
};
