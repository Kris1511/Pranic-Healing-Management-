'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const healersTable = await queryInterface.describeTable('healers');
    if (healersTable.username) {
      await queryInterface.removeColumn('healers', 'username');
    }

    const patientsTable = await queryInterface.describeTable('patients');
    if (patientsTable.username) {
      await queryInterface.removeColumn('patients', 'username');
    }
  },

  down: async (queryInterface, Sequelize) => {
    // No-op: username column is completely deprecated and removed
  },
};
