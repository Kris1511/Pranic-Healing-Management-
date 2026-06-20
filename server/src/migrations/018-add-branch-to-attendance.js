'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const tableInfo = await queryInterface.describeTable('attendance');
    if (!tableInfo.branch_id) {
      await queryInterface.addColumn('attendance', 'branch_id', {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'branches',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      });
    }
  },

  async down(queryInterface, Sequelize) {
    const tableInfo = await queryInterface.describeTable('attendance');
    if (tableInfo.branch_id) {
      await queryInterface.removeColumn('attendance', 'branch_id');
    }
  }
};
