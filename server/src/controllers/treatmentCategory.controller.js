const treatmentCategoryService = require('../services/treatmentCategory.service');
const { sendResponse } = require('../helpers/response.helper');

class TreatmentCategoryController {
  create = async (req, res) => {
    const category = await treatmentCategoryService.createTreatmentCategory(req.body);
    return sendResponse(res, 201, 'Treatment Category created successfully', category);
  };

  getAll = async (req, res) => {
    const categories = await treatmentCategoryService.getAllTreatmentCategories(req.query);
    return sendResponse(res, 200, 'Treatment Categories retrieved successfully', categories);
  };

  getById = async (req, res) => {
    const category = await treatmentCategoryService.getTreatmentCategoryById(req.params.id);
    return sendResponse(res, 200, 'Treatment Category retrieved successfully', category);
  };

  update = async (req, res) => {
    const category = await treatmentCategoryService.updateTreatmentCategory(req.params.id, req.body);
    return sendResponse(res, 200, 'Treatment Category updated successfully', category);
  };

  delete = async (req, res) => {
    await treatmentCategoryService.deleteTreatmentCategory(req.params.id);
    return sendResponse(res, 200, 'Treatment Category deleted successfully');
  };
}

module.exports = new TreatmentCategoryController();
