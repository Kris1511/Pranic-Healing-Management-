const branchAdminService = require('../services/branchAdmin.service');
const { sendResponse } = require('../helpers/response.helper');

class BranchAdminController {
  create = async (req, res) => {
    console.log("Request Body:", req.body);
    try {
      const idProof = req.file ? `storage/temp/${req.file.filename}` : null;
      const branchAdmin = await branchAdminService.createBranchAdmin({
        ...req.body,
        idProof,
      });
      return sendResponse(res, 201, 'Branch Administrator created successfully', branchAdmin);
    } catch (error) {
      console.error("Validation Error:", error);
      console.error("Error Message:", error.message);
      console.error("Error Stack:", error.stack);
      throw error;
    }
  };

  getAll = async (req, res) => {
    const list = await branchAdminService.getAllBranchAdmins(req.query);
    return sendResponse(res, 200, 'Branch Administrators retrieved successfully', list);
  };

  getById = async (req, res) => {
    const profile = await branchAdminService.getBranchAdminById(req.params.id);
    return sendResponse(res, 200, 'Branch Administrator retrieved successfully', profile);
  };

  update = async (req, res) => {
    const idProof = req.file ? `storage/temp/${req.file.filename}` : undefined;
    const updateData = { ...req.body };
    if (idProof) updateData.idProof = idProof;
    
    const profile = await branchAdminService.updateBranchAdmin(req.params.id, updateData);
    return sendResponse(res, 200, 'Branch Administrator updated successfully', profile);
  };

  deleteBranchAdmin = async (req, res) => {
    console.log("DELETE URL:", req.originalUrl || `/api/branch-admins/${req.params.id}`);
    console.log("Branch Admin ID:", req.params.id);
    console.log("Backend route path:", (req.baseUrl || '/api/branch-admins') + (req.route ? req.route.path : '/:id'));
    
    await branchAdminService.deleteBranchAdminById(req.params.id);
    return sendResponse(res, 200, 'Branch Administrator deleted successfully');
  };

  delete = this.deleteBranchAdmin;
}

module.exports = new BranchAdminController();
