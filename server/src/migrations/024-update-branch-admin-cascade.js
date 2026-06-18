'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Drop constraint if it exists (try different common names)
    const constraintsToDrop = ['fk_branch_admin_user', 'branch_admins_user_id_fkey', 'branch_admins_user_id_foreign_idx'];
    for (const constraint of constraintsToDrop) {
      try {
        await queryInterface.removeConstraint('branch_admins', constraint);
        console.log(`Successfully removed constraint: ${constraint}`);
      } catch (err) {
        // Ignored if it doesn't exist
      }
    }

    // 2. Add the constraint back with CASCADE
    await queryInterface.addConstraint('branch_admins', {
      fields: ['user_id'],
      type: 'foreign key',
      name: 'fk_branch_admin_user',
      references: {
        table: 'users',
        field: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Keep constraint on rollback
  }
};
