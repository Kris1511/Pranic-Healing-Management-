'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Clean up duplicate branch assignments if they exist
    const [results] = await queryInterface.sequelize.query(
      `SELECT branch_id, COUNT(*) as count 
       FROM branch_admins 
       WHERE branch_id IS NOT NULL 
       GROUP BY branch_id 
       HAVING count > 1`
    );

    for (const row of results) {
      const branchId = row.branch_id;
      // Get all admins for this branch ordered by updated_at desc
      const [admins] = await queryInterface.sequelize.query(
        `SELECT id FROM branch_admins WHERE branch_id = '${branchId}' ORDER BY updated_at DESC`
      );
      
      // Keep the first (most recent) and set others to NULL
      if (admins.length > 1) {
        const idsToNullify = admins.slice(1).map(a => `'${a.id}'`).join(',');
        await queryInterface.sequelize.query(
          `UPDATE branch_admins SET branch_id = NULL WHERE id IN (${idsToNullify})`
        );
      }
    }

    // 2. Add unique constraint to branch_id in branch_admins table
    await queryInterface.addConstraint('branch_admins', {
      fields: ['branch_id'],
      type: 'unique',
      name: 'unique_branch_admin_branch'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeConstraint('branch_admins', 'unique_branch_admin_branch');
  }
};
