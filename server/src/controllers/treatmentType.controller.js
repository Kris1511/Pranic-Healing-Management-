const treatmentTypeService = require('../services/treatmentType.service');
const { sendResponse } = require('../helpers/response.helper');

class TreatmentTypeController {
  create = async (req, res) => {
    const treatmentType = await treatmentTypeService.createTreatmentType(req.body);
    return sendResponse(res, 201, 'Treatment Type created successfully', treatmentType);
  };

  getAll = async (req, res) => {
    const treatmentTypes = await treatmentTypeService.getAllTreatmentTypes(req.query);
    return sendResponse(res, 200, 'Treatment Types retrieved successfully', treatmentTypes);
  };

  getById = async (req, res) => {
    const treatmentType = await treatmentTypeService.getTreatmentTypeById(req.params.id);
    return sendResponse(res, 200, 'Treatment Type retrieved successfully', treatmentType);
  };

  update = async (req, res) => {
    const treatmentType = await treatmentTypeService.updateTreatmentType(req.params.id, req.body);
    return sendResponse(res, 200, 'Treatment Type updated successfully', treatmentType);
  };

  delete = async (req, res) => {
    await treatmentTypeService.deleteTreatmentType(req.params.id);
    return sendResponse(res, 200, 'Treatment Type deleted successfully');
  };
}

module.exports = new TreatmentTypeController();
