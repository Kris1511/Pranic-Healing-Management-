const branchService = require('../services/branch.service');
const { sendResponse } = require('../helpers/response.helper');

class BranchController {
  create = async (req, res) => {
    const branch = await branchService.createBranch(req.body);
    return sendResponse(res, 201, 'Branch created successfully', branch);
  };

  getAll = async (req, res) => {
    const branches = await branchService.getAllBranches(req.query);
    return sendResponse(res, 200, 'Branches retrieved successfully', branches);
  };

  getById = async (req, res) => {
    const branch = await branchService.getBranchById(req.params.id);
    return sendResponse(res, 200, 'Branch retrieved successfully', branch);
  };

  update = async (req, res) => {
    const branch = await branchService.updateBranch(req.params.id, req.body);
    return sendResponse(res, 200, 'Branch updated successfully', branch);
  };

  delete = async (req, res) => {
    await branchService.deleteBranch(req.params.id);
    return sendResponse(res, 200, 'Branch deleted successfully');
  };
}

module.exports = new BranchController();
