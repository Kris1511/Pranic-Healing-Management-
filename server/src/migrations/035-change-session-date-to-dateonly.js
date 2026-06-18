'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('sessions', 'session_date', {
      type: Sequelize.DATEONLY,
      allowNull: false,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('sessions', 'session_date', {
      type: Sequelize.DATE,
      allowNull: false,
    });
  }
};
