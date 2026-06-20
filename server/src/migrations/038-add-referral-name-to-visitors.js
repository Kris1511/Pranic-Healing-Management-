'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableInfo = await queryInterface.describeTable('visitors');
    
    if (!tableInfo.referral_name) {
      await queryInterface.addColumn('visitors', 'referral_name', {
        type: Sequelize.STRING,
        allowNull: true,
      });
    }
    if (!tableInfo.reference_name) {
      await queryInterface.addColumn('visitors', 'reference_name', {
        type: Sequelize.STRING,
        allowNull: true,
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    const tableInfo = await queryInterface.describeTable('visitors');
    
    if (tableInfo.referral_name) {
      await queryInterface.removeColumn('visitors', 'referral_name');
    }
    if (tableInfo.reference_name) {
      await queryInterface.removeColumn('visitors', 'reference_name');
    }
  }
};
