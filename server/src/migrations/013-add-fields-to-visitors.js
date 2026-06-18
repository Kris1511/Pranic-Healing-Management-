'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableInfo = await queryInterface.describeTable('visitors');
    if (!tableInfo.email) {
      await queryInterface.addColumn('visitors', 'email', {
        type: Sequelize.STRING,
        allowNull: true,
      });
    }
    if (!tableInfo.gender) {
      await queryInterface.addColumn('visitors', 'gender', {
        type: Sequelize.STRING,
        allowNull: true,
      });
    }
    if (!tableInfo.id_proof) {
      await queryInterface.addColumn('visitors', 'id_proof', {
        type: Sequelize.STRING,
        allowNull: true,
      });
    }
    if (!tableInfo.address) {
      await queryInterface.addColumn('visitors', 'address', {
        type: Sequelize.STRING,
        allowNull: true,
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    const tableInfo = await queryInterface.describeTable('visitors');
    if (tableInfo.email) await queryInterface.removeColumn('visitors', 'email');
    if (tableInfo.gender) await queryInterface.removeColumn('visitors', 'gender');
    if (tableInfo.id_proof) await queryInterface.removeColumn('visitors', 'id_proof');
    if (tableInfo.address) await queryInterface.removeColumn('visitors', 'address');
  },
};
