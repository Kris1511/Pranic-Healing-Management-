const branchRepository = require('../repositories/branch.repository');
const ApiError = require('../helpers/error.helper');

class BranchService {
  async createBranch(data) {
    // 1. Check if branch name already exists
    const existing = await branchRepository.findAll({ name: data.name });
    if (existing.length > 0) {
      throw new ApiError(400, 'Branch name already exists.');
    }

    // 2. Create the Branch in local DB
    const address = [
      data.addressLine1,
      data.addressLine2,
      data.city,
      data.district,
      data.state,
      data.pincode
    ].filter(Boolean).join(', ');

    const branch = await branchRepository.create({
      name: data.name,
      address: address || data.address || null,
      phone: data.phone,
      email: data.email,
      status: 'active',
      addressLine1: data.addressLine1 || null,
      addressLine2: data.addressLine2 || null,
      city: data.city || null,
      district: data.district || null,
      state: data.state || null,
      pincode: data.pincode || null,
      details: data.details || null
    });

    return branch;
  }

  async getAllBranches(filter = {}) {
    const branches = await branchRepository.findAll(filter);
    return branches.map(branch => {
      const branchJson = branch.toJSON ? branch.toJSON() : { ...branch };
      branchJson.admin = branchJson.branchAdmin ? branchJson.branchAdmin.name : 'Unassigned';
      return branchJson;
    });
  }

  async getBranchById(id) {
    const branch = await branchRepository.findById(id);
    if (!branch) {
      throw new ApiError(404, 'Branch not found.');
    }
    const branchJson = branch.toJSON ? branch.toJSON() : { ...branch };
    branchJson.admin = branchJson.branchAdmin ? branchJson.branchAdmin.name : 'Unassigned';
    return branchJson;
  }

  async updateBranch(id, data) {
    const branch = await branchRepository.update(id, data);
    if (!branch) {
      throw new ApiError(404, 'Branch not found.');
    }
    const refreshed = await branchRepository.findById(id);
    const branchJson = refreshed.toJSON ? refreshed.toJSON() : { ...refreshed };
    branchJson.admin = branchJson.branchAdmin ? branchJson.branchAdmin.name : 'Unassigned';
    return branchJson;
  }

  async deleteBranch(id) {
    const { Patient, Healer, User } = require('../models');
    
    await Patient.update({ branchId: null }, { where: { branchId: id } });
    await Healer.update({ branchId: null }, { where: { branchId: id } });
    await User.update({ branchId: null }, { where: { branchId: id } });

    const branch = await branchRepository.delete(id);
    if (!branch) {
      throw new ApiError(404, 'Branch not found.');
    }
    return branch;
  }
}

module.exports = new BranchService();
