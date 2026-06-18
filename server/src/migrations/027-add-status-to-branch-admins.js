'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableInfo = await queryInterface.describeTable('branch_admins');
    if (!tableInfo.status) {
      await queryInterface.addColumn('branch_admins', 'status', {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: 'active',
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    const tableInfo = await queryInterface.describeTable('branch_admins');
    if (tableInfo.status) {
      await queryInterface.removeColumn('branch_admins', 'status');
    }
  }
};
