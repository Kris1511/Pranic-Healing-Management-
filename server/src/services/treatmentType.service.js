const treatmentTypeRepository = require('../repositories/treatmentType.repository');
const patientRepository = require('../repositories/patient.repository');
const ApiError = require('../helpers/error.helper');

class TreatmentTypeService {
  async createTreatmentType(data) {
    // Check if name already exists
    const existing = await treatmentTypeRepository.findAll({ name: data.name });
    if (existing.length > 0) {
      throw new ApiError(400, 'Treatment Type name already exists.');
    }

    const treatmentType = await treatmentTypeRepository.create({
      name: data.name,
      category: data.category,
      code: data.code || null,
      sessionDuration: data.sessionDuration || '30 min',
      status: data.status || 'Active',
      description: data.description || null,
      totalSessions: 0
    });

    return treatmentType;
  }

  async getAllTreatmentTypes(filter = {}) {
    return await treatmentTypeRepository.findAll(filter);
  }

  async getTreatmentTypeById(id) {
    const treatmentType = await treatmentTypeRepository.findById(id);
    if (!treatmentType) {
      throw new ApiError(404, 'Treatment Type not found.');
    }
    const patients = await patientRepository.findAll({ treatmentType: treatmentType.name });
    const result = treatmentType.toJSON ? treatmentType.toJSON() : treatmentType;
    return { ...result, patientCount: patients.length };
  }

  async updateTreatmentType(id, data) {
    const treatmentType = await treatmentTypeRepository.update(id, data);
    if (!treatmentType) {
      throw new ApiError(404, 'Treatment Type not found.');
    }
    return treatmentType;
  }

  async deleteTreatmentType(id) {
    const treatmentType = await treatmentTypeRepository.delete(id);
    if (!treatmentType) {
      throw new ApiError(404, 'Treatment Type not found.');
    }
    return treatmentType;
  }
}

module.exports = new TreatmentTypeService();
