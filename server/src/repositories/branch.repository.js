const { Branch, BranchAdmin } = require('../models');

class BranchRepository {
  async create(data) {
    return await Branch.create(data);
  }

  async findById(id) {
    return await Branch.findByPk(id, {
      include: [{
        model: BranchAdmin,
        as: 'branchAdmin'
      }]
    });
  }

  async findAll(filter = {}, options = {}) {
    return await Branch.findAll({
      where: filter,
      include: [{
        model: BranchAdmin,
        as: 'branchAdmin'
      }],
      ...options
    });
  }

  async update(id, data) {
    const branch = await Branch.findByPk(id);
    if (!branch) return null;
    return await branch.update(data);
  }

  async delete(id) {
    const branch = await Branch.findByPk(id);
    if (!branch) return null;
    return await branch.destroy();
  }
}

module.exports = new BranchRepository();
