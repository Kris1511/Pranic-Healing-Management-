const { Visitor } = require('../models');

class VisitorRepository {
  async create(data) {
    return await Visitor.create(data);
  }

  async findById(id) {
    return await Visitor.findByPk(id);
  }

  async findAll(filter = {}, options = {}) {
    return await Visitor.findAll({
      where: filter,
      ...options,
      include: ['branch']
    });
  }

  async update(id, data) {
    const visitor = await Visitor.findByPk(id);
    if (!visitor) return null;
    return await visitor.update(data);
  }

  async delete(id) {
    const visitor = await Visitor.findByPk(id);
    if (!visitor) return null;
    return await visitor.destroy();
  }
}

module.exports = new VisitorRepository();
