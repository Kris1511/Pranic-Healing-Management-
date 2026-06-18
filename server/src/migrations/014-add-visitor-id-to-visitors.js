'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('visitors', 'visitor_id', {
      type: Sequelize.STRING,
      allowNull: true,
      unique: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('visitors', 'visitor_id');
  }
};
