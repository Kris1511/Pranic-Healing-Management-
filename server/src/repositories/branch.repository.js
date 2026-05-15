const { Branch } = require('../models');

class BranchRepository {
  async create(data) {
    return await Branch.create(data);
  }

  async findById(id) {
    return await Branch.findByPk(id);
  }

  async findAll(filter = {}, options = {}) {
    return await Branch.findAll({
      where: filter,
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
