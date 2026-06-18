'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Sync 'healers' table
    const healersTable = await queryInterface.describeTable('healers');
    
    if (!healersTable.healer_id) {
      await queryInterface.addColumn('healers', 'healer_id', {
        type: Sequelize.STRING,
        allowNull: true, // allowNull true is safer during migrations with potential existing data
        unique: true,
      });
    }
    if (!healersTable.gender) {
      await queryInterface.addColumn('healers', 'gender', {
        type: Sequelize.STRING,
        allowNull: true,
      });
    }
    if (!healersTable.dob) {
      await queryInterface.addColumn('healers', 'dob', {
        type: Sequelize.DATEONLY,
        allowNull: true,
      });
    }
    if (!healersTable.mobile) {
      await queryInterface.addColumn('healers', 'mobile', {
        type: Sequelize.STRING,
        allowNull: true,
      });
    }
    if (!healersTable.address) {
      await queryInterface.addColumn('healers', 'address', {
        type: Sequelize.TEXT,
        allowNull: true,
      });
    }

    if (!healersTable.password) {
      await queryInterface.addColumn('healers', 'password', {
        type: Sequelize.STRING,
        allowNull: true,
      });
    }
    if (!healersTable.cert_level) {
      await queryInterface.addColumn('healers', 'cert_level', {
        type: Sequelize.STRING,
        allowNull: true,
      });
    }
    if (!healersTable.experience) {
      // Experience is optional and allows null values for empty states
      await queryInterface.addColumn('healers', 'experience', {
        type: Sequelize.INTEGER,
        allowNull: true,
      });
    }
    if (!healersTable.languages) {
      await queryInterface.addColumn('healers', 'languages', {
        type: Sequelize.STRING,
        allowNull: true,
      });
    }
    if (!healersTable.verification_status) {
      await queryInterface.addColumn('healers', 'verification_status', {
        type: Sequelize.STRING,
        allowNull: true,
      });
    }
    // Profile photo, ID proof, and Certification columns are designed to be nullable (allowNull: true)
    // so they are only populated when a file is actually uploaded, otherwise saving as NULL.
    // They store relative paths under the storage directory (e.g. 'storage/temp/filename.ext').
    if (!healersTable.profile_photo) {
      await queryInterface.addColumn('healers', 'profile_photo', {
        type: Sequelize.STRING,
        allowNull: true,
      });
    }
    if (!healersTable.id_proof) {
      await queryInterface.addColumn('healers', 'id_proof', {
        type: Sequelize.STRING,
        allowNull: true,
      });
    }
    if (!healersTable.certification) {
      await queryInterface.addColumn('healers', 'certification', {
        type: Sequelize.STRING,
        allowNull: true,
      });
    }

    // 2. Sync 'patients' table
    const patientsTable = await queryInterface.describeTable('patients');
    
    if (!patientsTable.dob) {
      await queryInterface.addColumn('patients', 'dob', {
        type: Sequelize.DATEONLY,
        allowNull: true,
      });
    }
    if (!patientsTable.blood_group) {
      await queryInterface.addColumn('patients', 'blood_group', {
        type: Sequelize.STRING,
        allowNull: true,
      });
    }
    if (!patientsTable.occupation) {
      await queryInterface.addColumn('patients', 'occupation', {
        type: Sequelize.STRING,
        allowNull: true,
      });
    }
    if (!patientsTable.email) {
      await queryInterface.addColumn('patients', 'email', {
        type: Sequelize.STRING,
        allowNull: true,
      });
    }
    if (!patientsTable.emergency_contact) {
      await queryInterface.addColumn('patients', 'emergency_contact', {
        type: Sequelize.STRING,
        allowNull: true,
      });
    }
    if (!patientsTable.medical_history) {
      await queryInterface.addColumn('patients', 'medical_history', {
        type: Sequelize.TEXT,
        allowNull: true,
      });
    }
    if (!patientsTable.treatment_type) {
      await queryInterface.addColumn('patients', 'treatment_type', {
        type: Sequelize.STRING,
        allowNull: true,
      });
    }
    if (!patientsTable.healer_id) {
      await queryInterface.addColumn('patients', 'healer_id', {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'healers',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      });
    }

    if (!patientsTable.password) {
      await queryInterface.addColumn('patients', 'password', {
        type: Sequelize.STRING,
        allowNull: true,
      });
    }
    if (!patientsTable.medical_report) {
      await queryInterface.addColumn('patients', 'medical_report', {
        type: Sequelize.STRING,
        allowNull: true,
      });
    }
    if (!patientsTable.lab_report) {
      await queryInterface.addColumn('patients', 'lab_report', {
        type: Sequelize.STRING,
        allowNull: true,
      });
    }
    if (!patientsTable.prescription) {
      await queryInterface.addColumn('patients', 'prescription', {
        type: Sequelize.STRING,
        allowNull: true,
      });
    }
    if (!patientsTable.id_proof) {
      await queryInterface.addColumn('patients', 'id_proof', {
        type: Sequelize.STRING,
        allowNull: true,
      });
    }

    // 3. Sync 'sessions' table
    const sessionsTable = await queryInterface.describeTable('sessions');
    
    if (!sessionsTable.payment_status) {
      await queryInterface.addColumn('sessions', 'payment_status', {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: 'pending',
      });
    }
    if (!sessionsTable.payment_method) {
      await queryInterface.addColumn('sessions', 'payment_method', {
        type: Sequelize.STRING,
        allowNull: true,
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Revert added columns
    const healersTable = await queryInterface.describeTable('healers');
    if (healersTable.healer_id) await queryInterface.removeColumn('healers', 'healer_id');
    if (healersTable.gender) await queryInterface.removeColumn('healers', 'gender');
    if (healersTable.dob) await queryInterface.removeColumn('healers', 'dob');
    if (healersTable.mobile) await queryInterface.removeColumn('healers', 'mobile');
    if (healersTable.address) await queryInterface.removeColumn('healers', 'address');
    if (healersTable.password) await queryInterface.removeColumn('healers', 'password');
    if (healersTable.cert_level) await queryInterface.removeColumn('healers', 'cert_level');
    if (healersTable.experience) await queryInterface.removeColumn('healers', 'experience');
    if (healersTable.languages) await queryInterface.removeColumn('healers', 'languages');
    if (healersTable.verification_status) await queryInterface.removeColumn('healers', 'verification_status');
    if (healersTable.profile_photo) await queryInterface.removeColumn('healers', 'profile_photo');
    if (healersTable.id_proof) await queryInterface.removeColumn('healers', 'id_proof');
    if (healersTable.certification) await queryInterface.removeColumn('healers', 'certification');

    const patientsTable = await queryInterface.describeTable('patients');
    if (patientsTable.dob) await queryInterface.removeColumn('patients', 'dob');
    if (patientsTable.blood_group) await queryInterface.removeColumn('patients', 'blood_group');
    if (patientsTable.occupation) await queryInterface.removeColumn('patients', 'occupation');
    if (patientsTable.email) await queryInterface.removeColumn('patients', 'email');
    if (patientsTable.emergency_contact) await queryInterface.removeColumn('patients', 'emergency_contact');
    if (patientsTable.medical_history) await queryInterface.removeColumn('patients', 'medical_history');
    if (patientsTable.treatment_type) await queryInterface.removeColumn('patients', 'treatment_type');
    if (patientsTable.healer_id) await queryInterface.removeColumn('patients', 'healer_id');
    if (patientsTable.password) await queryInterface.removeColumn('patients', 'password');
    if (patientsTable.medical_report) await queryInterface.removeColumn('patients', 'medical_report');
    if (patientsTable.lab_report) await queryInterface.removeColumn('patients', 'lab_report');
    if (patientsTable.prescription) await queryInterface.removeColumn('patients', 'prescription');
    if (patientsTable.id_proof) await queryInterface.removeColumn('patients', 'id_proof');

    const sessionsTable = await queryInterface.describeTable('sessions');
    if (sessionsTable.payment_status) await queryInterface.removeColumn('sessions', 'payment_status');
    if (sessionsTable.payment_method) await queryInterface.removeColumn('sessions', 'payment_method');
  },
};
