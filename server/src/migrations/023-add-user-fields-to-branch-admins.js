'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableInfo = await queryInterface.describeTable('branch_admins');

    if (!tableInfo.name) {
      await queryInterface.addColumn('branch_admins', 'name', {
        type: Sequelize.STRING,
        allowNull: true,
      }, { after: 'branch_id' });
    }

    if (!tableInfo.email) {
      await queryInterface.addColumn('branch_admins', 'email', {
        type: Sequelize.STRING,
        allowNull: true,
      }, { after: 'name' });
    }

    if (!tableInfo.password) {
      await queryInterface.addColumn('branch_admins', 'password', {
        type: Sequelize.STRING,
        allowNull: true,
      }, { after: 'email' });
    }

    if (!tableInfo.phone_number) {
      await queryInterface.addColumn('branch_admins', 'phone_number', {
        type: Sequelize.STRING,
        allowNull: true,
      }, { after: 'password' });
    }
  },

  down: async (queryInterface, Sequelize) => {
    const tableInfo = await queryInterface.describeTable('branch_admins');

    if (tableInfo.phone_number) {
      await queryInterface.removeColumn('branch_admins', 'phone_number');
    }
    if (tableInfo.password) {
      await queryInterface.removeColumn('branch_admins', 'password');
    }
    if (tableInfo.email) {
      await queryInterface.removeColumn('branch_admins', 'email');
    }
    if (tableInfo.name) {
      await queryInterface.removeColumn('branch_admins', 'name');
    }
  }
};
