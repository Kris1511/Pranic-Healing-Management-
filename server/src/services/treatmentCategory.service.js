const treatmentCategoryRepository = require('../repositories/treatmentCategory.repository');
const ApiError = require('../helpers/error.helper');

class TreatmentCategoryService {
  async createTreatmentCategory(data) {
    // Check if category code already exists
    const existing = await treatmentCategoryRepository.findAll({ code: data.code });
    if (existing.length > 0) {
      throw new ApiError(400, 'Treatment Category code already exists.');
    }

    const category = await treatmentCategoryRepository.create({
      name: data.name,
      code: data.code,
      description: data.description || null,
      status: data.status || 'Active',
      treatmentCount: 0
    });

    return category;
  }

  async getAllTreatmentCategories(filter = {}) {
    return await treatmentCategoryRepository.findAll(filter);
  }

  async getTreatmentCategoryById(id) {
    const category = await treatmentCategoryRepository.findById(id);
    if (!category) {
      throw new ApiError(404, 'Treatment Category not found.');
    }
    return category;
  }

  async updateTreatmentCategory(id, data) {
    const category = await treatmentCategoryRepository.update(id, data);
    if (!category) {
      throw new ApiError(404, 'Treatment Category not found.');
    }
    return category;
  }

  async deleteTreatmentCategory(id) {
    const category = await treatmentCategoryRepository.delete(id);
    if (!category) {
      throw new ApiError(404, 'Treatment Category not found.');
    }
    return category;
  }
}

module.exports = new TreatmentCategoryService();
