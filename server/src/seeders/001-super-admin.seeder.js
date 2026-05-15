'use strict';
const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('users', [{
      id: uuidv4(),
      firebase_uid: 'SUPER_ADMIN_FIREBASE_UID', // Replace with actual UID
      email: 'superadmin@phms.com',
      name: 'Super Admin',
      role: 'super_admin',
      status: 'active',
      created_at: new Date(),
      updated_at: new Date(),
    }]);
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('users', { email: 'superadmin@phms.com' }, {});
  }
};
