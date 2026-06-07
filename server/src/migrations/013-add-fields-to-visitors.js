'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('visitors', 'email', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('visitors', 'gender', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('visitors', 'id_proof', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('visitors', 'address', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('visitors', 'email');
    await queryInterface.removeColumn('visitors', 'gender');
    await queryInterface.removeColumn('visitors', 'id_proof');
    await queryInterface.removeColumn('visitors', 'address');
  },
};
