const { TreatmentType } = require('../models');

class TreatmentTypeRepository {
  async create(data) {
    return await TreatmentType.create(data);
  }

  async findById(id) {
    return await TreatmentType.findByPk(id);
  }

  async findAll(filter = {}, options = {}) {
    return await TreatmentType.findAll({
      where: filter,
      ...options
    });
  }

  async update(id, data) {
    const treatmentType = await TreatmentType.findByPk(id);
    if (!treatmentType) return null;
    return await treatmentType.update(data);
  }

  async delete(id) {
    const treatmentType = await TreatmentType.findByPk(id);
    if (!treatmentType) return null;
    return await treatmentType.destroy();
  }
}

module.exports = new TreatmentTypeRepository();
