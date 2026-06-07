const patientRepository = require('../repositories/patient.repository');
const ApiError = require('../helpers/error.helper');
const crypto = require('crypto');
const userService = require('./user.service');
const logger = require('../config/logger.config');

class PatientService {
  async registerPatient(data) {
    if (!data.password) {
      data.password = crypto.randomBytes(4).toString('hex');
    }
    
    if (!data.username) {
      data.username = data.email || data.phone || `patient_${crypto.randomBytes(2).toString('hex')}`;
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

  async getPatientById(id) {
    const patient = await patientRepository.findById(id);
    if (!patient) {
      throw new ApiError(404, 'Patient not found.');
    }
    return patient;
  }

  async updatePatient(id, data) {
    const patient = await patientRepository.update(id, data);
    if (!patient) {
      throw new ApiError(404, 'Patient not found.');
    }
    return patient;
  }

  async deletePatient(id) {
    const patient = await patientRepository.delete(id);
    if (!patient) {
      throw new ApiError(404, 'Patient not found.');
    }
    return patient;
  }
}

module.exports = new PatientService();
