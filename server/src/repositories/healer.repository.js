const { Healer } = require('../models');

class HealerRepository {
  async create(data) {
    return await Healer.create(data);
  }

  async findById(id) {
    return await Healer.findByPk(id, {
      include: ['branch']
    });
  }

  async findAll(filter = {}, options = {}) {
    return await Healer.findAll({
      where: filter,
      ...options,
      include: ['branch']
    });
  }

  async update(id, data) {
    const healer = await Healer.findByPk(id);
    if (!healer) return null;
    return await healer.update(data);
  }

  async delete(id) {
    const healer = await Healer.findByPk(id);
    if (!healer) return null;
    return await healer.destroy();
  }
}

module.exports = new HealerRepository();
