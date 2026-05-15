const healerService = require('../services/healer.service');
const { sendResponse } = require('../helpers/response.helper');

class HealerController {
  register = async (req, res) => {
    const healer = await healerService.registerHealer(req.body);
    return sendResponse(res, 201, 'Healer registered successfully', healer);
  };

  getAll = async (req, res) => {
    const healers = await healerService.getAllHealers(req.query);
    return sendResponse(res, 200, 'Healers retrieved successfully', healers);
  };

  getById = async (req, res) => {
    const healer = await healerService.getHealerById(req.params.id);
    return sendResponse(res, 200, 'Healer retrieved successfully', healer);
  };

  update = async (req, res) => {
    const healer = await healerService.updateHealer(req.params.id, req.body);
    return sendResponse(res, 200, 'Healer updated successfully', healer);
  };

  delete = async (req, res) => {
    await healerService.deleteHealer(req.params.id);
    return sendResponse(res, 200, 'Healer deleted successfully');
  };
}

module.exports = new HealerController();
