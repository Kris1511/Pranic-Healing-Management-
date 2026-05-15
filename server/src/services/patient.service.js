const patientRepository = require('../repositories/patient.repository');
const ApiError = require('../helpers/error.helper');

class PatientService {
  async registerPatient(data) {
    // Generate patient unique ID if not provided
    if (!data.patientId) {
      const count = await patientRepository.findAll();
      data.patientId = `PAT-${Date.now()}-${count.length + 1}`;
    }

    const existing = await patientRepository.findByPatientId(data.patientId);
    if (existing) {
      throw new ApiError(400, 'Patient ID already exists.');
    }

    return await patientRepository.create(data);
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
