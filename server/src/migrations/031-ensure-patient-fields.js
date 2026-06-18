'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // This migration guarantees and documents that both the 'patients' and 'users' tables 
    // are correctly structured for the patient-user registration dual-write.
    
    const patientsTable = await queryInterface.describeTable('patients');
    
    // Ensure email exists on patients table
    if (!patientsTable.email) {
      await queryInterface.addColumn('patients', 'email', {
        type: Sequelize.STRING,
        allowNull: true,
      });
    }

    // Ensure password exists on patients table
    if (!patientsTable.password) {
      await queryInterface.addColumn('patients', 'password', {
        type: Sequelize.STRING,
        allowNull: true,
      });
    }

    const usersTable = await queryInterface.describeTable('users');

    // Ensure status exists on users table
    if (!usersTable.status) {
      await queryInterface.addColumn('users', 'status', {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'active',
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Down migration is a safe no-op since these columns are critical for dual-write
  }
};
