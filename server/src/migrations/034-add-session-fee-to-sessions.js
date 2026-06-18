'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableInfo = await queryInterface.describeTable('sessions');
    if (!tableInfo.session_fee) {
      await queryInterface.addColumn('sessions', 'session_fee', {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    const tableInfo = await queryInterface.describeTable('sessions');
    if (tableInfo.session_fee) {
      await queryInterface.removeColumn('sessions', 'session_fee');
    }
  }
};
