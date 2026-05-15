const { Session } = require('../models');

class SessionRepository {
  async create(data) {
    return await Session.create(data);
  }

  async findById(id) {
    return await Session.findByPk(id, {
      include: ['patient', 'healer', 'branch', 'treatments', 'payment']
    });
  }

  async findAll(filter = {}, options = {}) {
    return await Session.findAll({
      where: filter,
      ...options,
      include: ['patient', 'healer']
    });
  }

  async update(id, data) {
    const session = await Session.findByPk(id);
    if (!session) return null;
    return await session.update(data);
  }

  async delete(id) {
    const session = await Session.findByPk(id);
    if (!session) return null;
    return await session.destroy();
  }
}

module.exports = new SessionRepository();
