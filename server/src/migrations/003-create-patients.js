'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('patients', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      patient_id: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      age: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      gender: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      phone: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      address: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      status: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'active',
      },
      branch_id: {
        type: Sequelize.UUID,
        allowNull: true,
      },
      dob: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
      blood_group: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      occupation: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      emergency_contact: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      medical_history: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      treatment_type: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      healer_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'healers',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      password: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      medical_report: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      lab_report: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      prescription: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      id_proof: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('patients');
  },
};
