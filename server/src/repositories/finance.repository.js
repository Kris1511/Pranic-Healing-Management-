const { Finance } = require('../models');

class FinanceRepository {
  async create(data) {
    return await Finance.create(data);
  }

  async findById(id) {
    return await Finance.findByPk(id);
  }

  async findAll(filter = {}, options = {}) {
    return await Finance.findAll({
      where: filter,
      ...options,
      include: ['branch']
    });
  }

  async update(id, data) {
    const finance = await Finance.findByPk(id);
    if (!finance) return null;
    return await finance.update(data);
  }

  async delete(id) {
    const finance = await Finance.findByPk(id);
    if (!finance) return null;
    return await finance.destroy();
  }
}

module.exports = new FinanceRepository();
