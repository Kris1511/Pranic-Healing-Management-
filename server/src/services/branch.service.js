const branchRepository = require('../repositories/branch.repository');
const ApiError = require('../helpers/error.helper');

class BranchService {
  async createBranch(data) {
    // Check if branch name already exists
    const existing = await branchRepository.findAll({ name: data.name });
    if (existing.length > 0) {
      throw new ApiError(400, 'Branch name already exists.');
    }
    return await branchRepository.create(data);
  }

  async getAllBranches(filter = {}) {
    return await branchRepository.findAll(filter);
  }

  async getBranchById(id) {
    const branch = await branchRepository.findById(id);
    if (!branch) {
      throw new ApiError(404, 'Branch not found.');
    }
    return branch;
  }

  async updateBranch(id, data) {
    const branch = await branchRepository.update(id, data);
    if (!branch) {
      throw new ApiError(404, 'Branch not found.');
    }
    return branch;
  }

  async deleteBranch(id) {
    const branch = await branchRepository.delete(id);
    if (!branch) {
      throw new ApiError(404, 'Branch not found.');
    }
    return branch;
  }
}

module.exports = new BranchService();
