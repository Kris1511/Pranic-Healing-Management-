'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableInfo = await queryInterface.describeTable('users');
    if (!tableInfo.password) {
      await queryInterface.addColumn('users', 'password', {
        type: Sequelize.STRING,
        allowNull: true,
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    const tableInfo = await queryInterface.describeTable('users');
    if (tableInfo.password) {
      await queryInterface.removeColumn('users', 'password');
    }
  }
};
