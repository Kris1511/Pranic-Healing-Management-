const { Feedback } = require('../models');

class FeedbackRepository {
  async create(data) {
    return await Feedback.create(data);
  }

  async findById(id) {
    return await Feedback.findByPk(id, {
      include: ['patient', 'branch']
    });
  }

  async findAll(filter = {}, options = {}) {
    return await Feedback.findAll({
      where: filter,
      ...options,
      include: ['patient', 'branch']
    });
  }

  async update(id, data) {
    const feedback = await Feedback.findByPk(id);
    if (!feedback) return null;
    return await feedback.update(data);
  }

  async delete(id) {
    const feedback = await Feedback.findByPk(id);
    if (!feedback) return null;
    return await feedback.destroy();
  }
}

module.exports = new FeedbackRepository();
