const { Payment } = require('../models');

class PaymentRepository {
  async create(data) {
    return await Payment.create(data);
  }

  async findById(id) {
    return await Payment.findByPk(id, {
      include: ['session', 'branch']
    });
  }

  async findAll(filter = {}, options = {}) {
    return await Payment.findAll({
      where: filter,
      ...options,
      include: ['session', 'branch']
    });
  }

  async update(id, data) {
    const payment = await Payment.findByPk(id);
    if (!payment) return null;
    return await payment.update(data);
  }

  async delete(id) {
    const payment = await Payment.findByPk(id);
    if (!payment) return null;
    return await payment.destroy();
  }
}

module.exports = new PaymentRepository();
