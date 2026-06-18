const { Payment, Session, Patient, Healer } = require('../models');

class PaymentRepository {
  async create(data) {
    return await Payment.create(data);
  }

  async findById(id) {
    return await Payment.findByPk(id, {
      include: [
        {
          model: Session,
          as: 'session',
          include: [
            { model: Patient, as: 'patient', attributes: ['id', 'name', 'email', 'phone'] },
            { model: Healer, as: 'healer', attributes: ['id', 'name', 'email'] },
          ],
        },
        'branch',
      ],
    });
  }

  async findAll(filter = {}, options = {}) {
    return await Payment.findAll({
      where: filter,
      ...options,
      include: [
        {
          model: Session,
          as: 'session',
          include: [
            { model: Patient, as: 'patient', attributes: ['id', 'name', 'email', 'phone'] },
            { model: Healer, as: 'healer', attributes: ['id', 'name', 'email'] },
          ],
        },
        'branch',
      ],
      order: [['paymentDate', 'DESC'], ['createdAt', 'DESC']],
    });
  }

  /**
   * Find all sessions (with payment info) for a specific patient ID.
   * Used by the patient-scoped payment history endpoint so that sessions
   * with no corresponding payments row also appear (with Pending status).
   */
  async findSessionsWithPaymentsByPatientId(patientId) {
    return await Session.findAll({
      where: { patientId },
      include: [
        { model: Healer, as: 'healer', attributes: ['id', 'name', 'email'] },
        { model: Payment, as: 'payment' },
      ],
      order: [['sessionDate', 'DESC'], ['createdAt', 'DESC']],
    });
  }

  async findOne(filter = {}) {
    return await Payment.findOne({ where: filter });
  }

  async findSessionsWithPayments(filter = {}) {
    return await Session.findAll({
      where: filter,
      include: [
        { model: Patient, as: 'patient', attributes: ['id', 'name', 'email', 'phone'] },
        { model: Healer, as: 'healer', attributes: ['id', 'name', 'email'] },
        { model: Payment, as: 'payment' },
      ],
      order: [['sessionDate', 'DESC'], ['createdAt', 'DESC']],
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
