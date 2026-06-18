const { BranchAdmin } = require('../models');

class BranchAdminRepository {
  async create(data) {
    return await BranchAdmin.create(data);
  }

  async findById(id) {
    return await BranchAdmin.findByPk(id, {
      include: ['user', 'branch']
    });
  }

  async findByUserId(userId) {
    return await BranchAdmin.findOne({
      where: { userId },
      include: ['user', 'branch']
    });
  }

  async findByBranchId(branchId) {
    return await BranchAdmin.findAll({
      where: { branchId },
      include: ['user', 'branch']
    });
  }

  async findAll(filter = {}, options = {}) {
    return await BranchAdmin.findAll({
      where: filter,
      ...options,
      include: ['user', 'branch']
    });
  }

  async update(id, data) {
    const adminProfile = await BranchAdmin.findByPk(id);
    if (!adminProfile) return null;
    return await adminProfile.update(data);
  }

  async delete(id, options = {}) {
    const adminProfile = await BranchAdmin.findByPk(id, options);
    if (!adminProfile) return null;
    return await adminProfile.destroy(options);
  }
}

module.exports = new BranchAdminRepository();
