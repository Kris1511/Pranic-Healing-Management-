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
      include: ['patient', 'healer', 'branch', 'treatments', 'payment'],
      order: [['sessionDate', 'DESC'], ['createdAt', 'DESC']]
    });
  }

  async getDashboardSummary(filter = {}) {
    const sessions = await Session.findAll({
      where: filter,
      attributes: ['status']
    });

    let totalSessions = sessions.length;
    let scheduled = 0;
    let completed = 0;
    let cancelled = 0;

    sessions.forEach(s => {
      const status = String(s.status).toLowerCase();
      if (status === 'scheduled') scheduled++;
      else if (status === 'completed') completed++;
      else if (status === 'cancelled') cancelled++;
    });

    return {
      totalSessions,
      scheduled,
      completed,
      cancelled
    };
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
