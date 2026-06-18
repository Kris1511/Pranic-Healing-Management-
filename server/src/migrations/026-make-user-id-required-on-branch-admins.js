'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('branch_admins', 'user_id', {
      type: Sequelize.UUID,
      allowNull: false,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('branch_admins', 'user_id', {
      type: Sequelize.UUID,
      allowNull: true,
    });
  }
};
