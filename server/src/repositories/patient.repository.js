const { Patient } = require('../models');

class PatientRepository {
  async create(data) {
    return await Patient.create(data);
  }

  async findById(id) {
    return await Patient.findByPk(id, {
      include: ['branch', 'sessions']
    });
  }

  async findByPatientId(patientId) {
    return await Patient.findOne({
      where: { patientId },
      include: ['branch']
    });
  }

  async findAll(filter = {}, options = {}) {
    return await Patient.findAll({
      where: filter,
      ...options,
      include: ['branch']
    });
  }

  async update(id, data) {
    const patient = await Patient.findByPk(id);
    if (!patient) return null;
    return await patient.update(data);
  }

  async delete(id) {
    const patient = await Patient.findByPk(id);
    if (!patient) return null;
    return await patient.destroy();
  }
}

module.exports = new PatientRepository();
