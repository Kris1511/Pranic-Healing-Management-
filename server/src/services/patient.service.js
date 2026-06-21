const patientRepository = require('../repositories/patient.repository');
const userRepository = require('../repositories/user.repository');
const { admin } = require('../config/firebase.config');
const ApiError = require('../helpers/error.helper');
const crypto = require('crypto');
const userService = require('./user.service');
const logger = require('../config/logger.config');

class PatientService {
  async registerPatient(data) {
    if (!data.password) {
      data.password = crypto.randomBytes(4).toString('hex');
    }

    if (data.healerId === '') {
      data.healerId = null;
    }

    // Automatically recalculate age from DOB if provided
    if (data.dob) {
      const birthDate = new Date(data.dob);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      data.age = age >= 0 ? age : 0;
    }
    


    // Generate patient unique ID if not provided
    if (!data.patientId) {
      const count = await patientRepository.findAll();
      data.patientId = `PAT-${Date.now()}-${count.length + 1}`;
    }

    const existing = await patientRepository.findByPatientId(data.patientId);
    if (existing) {
      throw new ApiError(400, 'Patient ID already exists.');
    }

    const newPatient = await patientRepository.create(data);

    try {
      await userService.createUser({
        name: data.name,
        email: data.email,
        password: data.password,
        role: 'PATIENT',
        phoneNumber: data.phone,
        branchId: data.branchId
      });
    } catch (err) {
      logger.error('Failed to create user account for patient, rolling back...', err);
      if (newPatient && newPatient.id) {
        await patientRepository.delete(newPatient.id);
      }
      throw err;
    }

    return await patientRepository.findById(newPatient.id);
  }

  async getAllPatients(filter = {}) {
    return await patientRepository.findAll(filter);
  }

  async getPatientById(id, branchId) {
    const patient = await patientRepository.findById(id);
    if (!patient) {
      throw new ApiError(404, 'Patient not found.');
    }
    if (branchId && patient.branchId !== branchId) {
      throw new ApiError(403, 'Unauthorized access to branch data.');
    }
    return patient;
  }

  async updatePatient(id, data, branchId) {
    const existing = await this.getPatientById(id, branchId); // reusing getPatientById for validation
    
    // Automatically recalculate age from DOB if provided
    if (data.dob) {
      const birthDate = new Date(data.dob);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      data.age = age >= 0 ? age : 0;
    }

    // Check if email is being changed and if new email already exists (for other patient or user)
    if (data.email && data.email !== existing.email) {
      // Check if new email exists in patients table
      const patientsWithEmail = await patientRepository.findAll({ email: data.email });
      const otherPatient = patientsWithEmail.find(p => p.id !== existing.id);
      if (otherPatient) {
        throw new ApiError(400, 'A patient with this email address already exists.');
      }
      
      // Check if new email exists in users table
      const userWithEmail = await userRepository.findByEmail(data.email);
      if (userWithEmail) {
        throw new ApiError(400, 'A user with this email address already exists.');
      }
    }

    if (data.healerId === '') {
      data.healerId = null;
    }

    // 1. Update Firebase Auth user details (best-effort)
    if (existing.email) {
      try {
        if (admin && admin.apps && admin.apps.length > 0) {
          const fbUser = await admin.auth().getUserByEmail(existing.email);
          const fbUpdateData = {};
          if (data.email) fbUpdateData.email = data.email;
          if (data.name) fbUpdateData.displayName = data.name;
          if (data.password) fbUpdateData.password = data.password;
          if (data.status) {
            fbUpdateData.disabled = (data.status.toLowerCase() === 'inactive');
          }
          
          if (Object.keys(fbUpdateData).length > 0) {
            await admin.auth().updateUser(fbUser.uid, fbUpdateData);
            logger.info(`Firebase user updated for email: ${existing.email}`);
          }
        }
      } catch (fbErr) {
        logger.warn(`Could not update Firebase account for ${existing.email}: ${fbErr.message}`);
      }
    }

    // 2. Update linked user in users table
    if (existing.email) {
      try {
        const user = await userRepository.findByEmail(existing.email);
        if (user) {
          const userUpdateData = {};
           if (data.name !== undefined) userUpdateData.name = data.name;
          if (data.email !== undefined) userUpdateData.email = data.email;
          if (data.phone !== undefined) userUpdateData.phoneNumber = data.phone;
          if (data.password !== undefined) userUpdateData.password = data.password;
          
          if (data.status !== undefined) {
            userUpdateData.status = data.status.toLowerCase();
          }
          if (data.branchId !== undefined) {
            userUpdateData.branchId = data.branchId;
          } else if (existing.branchId) {
            userUpdateData.branchId = existing.branchId;
          }
          
          await userRepository.update(user.id, userUpdateData);
          logger.info(`User record updated for email: ${existing.email}`);
        } else {
          logger.warn(`No user record found for patient email: ${existing.email}`);
        }
      } catch (userErr) {
        logger.error(`Error updating user record for patient email ${existing.email}: ${userErr.message}`);
        throw new ApiError(500, `Failed to update linked user record: ${userErr.message}`);
      }
    }

    // 3. Update patient in patients table
    const patient = await patientRepository.update(id, data);
    return patient;
  }

  async deletePatient(id, branchId) {
    // 1. Resolve the patient record
    const existing = await this.getPatientById(id, branchId);

    // 2. Delete the linked Firebase Auth account (best-effort)
    if (existing.email) {
      try {
        if (admin && admin.apps && admin.apps.length > 0) {
          const fbUser = await admin.auth().getUserByEmail(existing.email);
          await admin.auth().deleteUser(fbUser.uid);
          logger.info(`Firebase account deleted for patient email: ${existing.email}`);
        }
      } catch (fbErr) {
        logger.warn(`Could not delete Firebase account for ${existing.email}: ${fbErr.message}`);
      }
    }

    // 3. Delete the linked user record from the users table
    if (existing.email) {
      try {
        const deleted = await userRepository.deleteByEmail(existing.email);
        if (deleted) {
          logger.info(`User record deleted for patient email: ${existing.email}`);
        } else {
          logger.warn(`No user record found for patient email: ${existing.email}`);
        }
      } catch (userErr) {
        logger.error(`Error deleting user record for patient email ${existing.email}: ${userErr.message}`);
      }
    }

    // 4. Delete the patient record
    const patient = await patientRepository.delete(existing.id);
    return patient;
  }
}

module.exports = new PatientService();
