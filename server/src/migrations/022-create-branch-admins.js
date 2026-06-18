'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Check if table already exists
    const tables = await queryInterface.showAllTables();
    if (!tables.includes('branch_admins')) {
      await queryInterface.createTable('branch_admins', {
        id: {
          allowNull: false,
          primaryKey: true,
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
        },
        user_id: {
          type: Sequelize.UUID,
          allowNull: false,
          unique: true,
          references: {
            model: 'users',
            key: 'id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
        },
        branch_id: {
          type: Sequelize.UUID,
          allowNull: true,
          references: {
            model: 'branches',
            key: 'id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL',
        },
        name: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        email: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        password: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        phone_number: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        dob: {
          type: Sequelize.DATEONLY,
          allowNull: true,
        },
        gender: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        address_line1: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        address_line2: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        city: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        district: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        state: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        pincode: {
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
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('branch_admins');
  },
};
