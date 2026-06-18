const { TreatmentCategory } = require('../models');

class TreatmentCategoryRepository {
  async create(data) {
    return await TreatmentCategory.create(data);
  }

  async findById(id) {
    return await TreatmentCategory.findByPk(id);
  }

  async findAll(filter = {}, options = {}) {
    return await TreatmentCategory.findAll({
      where: filter,
      ...options
    });
  }

  async update(id, data) {
    const category = await TreatmentCategory.findByPk(id);
    if (!category) return null;
    return await category.update(data);
  }

  async delete(id) {
    const category = await TreatmentCategory.findByPk(id);
    if (!category) return null;
    return await category.destroy();
  }
}

module.exports = new TreatmentCategoryRepository();
