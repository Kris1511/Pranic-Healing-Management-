const userService = require('../services/user.service');
const { sendResponse } = require('../helpers/response.helper');

class UserController {
  create = async (req, res) => {
    if (req.branchId) req.body.branchId = req.branchId;
    const user = await userService.createUser(req.body);
    return sendResponse(res, 201, 'User created successfully', user);
  };

  getAll = async (req, res) => {
    const filter = { ...req.query };
    if (req.branchId) filter.branchId = req.branchId;
    const users = await userService.getAllUsers(filter);
    return sendResponse(res, 200, 'Users retrieved successfully', users);
  };

  getById = async (req, res) => {
    const user = await userService.getUserById(req.params.id, req.branchId);
    return sendResponse(res, 200, 'User retrieved successfully', user);
  };

  update = async (req, res) => {
    const user = await userService.updateUser(req.params.id, req.body, req.branchId);
    return sendResponse(res, 200, 'User updated successfully', user);
  };

  delete = async (req, res) => {
    await userService.deleteUser(req.params.id, req.branchId);
    return sendResponse(res, 200, 'User deleted successfully');
  };
}

module.exports = new UserController();
