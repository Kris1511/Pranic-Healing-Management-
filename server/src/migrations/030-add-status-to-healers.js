'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // The status column supports healer state updates (active/inactive status toggles)
    // and is modified dynamically by the healer update API and controller.
    const tableInfo = await queryInterface.describeTable('healers');
    if (!tableInfo.status) {
      await queryInterface.addColumn('healers', 'status', {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'active',
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    const tableInfo = await queryInterface.describeTable('healers');
    if (tableInfo.status) {
      await queryInterface.removeColumn('healers', 'status');
    }
  }
};
