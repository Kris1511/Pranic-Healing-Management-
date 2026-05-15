const paymentRepository = require('../repositories/payment.repository');
const ApiError = require('../helpers/error.helper');

class PaymentService {
  async processPayment(data) {
    // Orchestrate with Finance if needed
    const payment = await paymentRepository.create(data);
    return payment;
  }

  async getPayments(filter = {}) {
    return await paymentRepository.findAll(filter);
  }

  async getPaymentById(id) {
    const payment = await paymentRepository.findById(id);
    if (!payment) {
      throw new ApiError(404, 'Payment record not found.');
    }
    return payment;
  }
}

module.exports = new PaymentService();
