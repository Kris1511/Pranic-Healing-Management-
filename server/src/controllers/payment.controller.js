const paymentService = require('../services/payment.service');
const { sendResponse } = require('../helpers/response.helper');

class PaymentController {
  process = async (req, res) => {
    if (req.branchId) req.body.branchId = req.branchId;
    const payment = await paymentService.processPayment(req.body);
    return sendResponse(res, 201, 'Payment processed successfully', payment);
  };

  getAll = async (req, res) => {
    const filter = { ...req.query };
    if (req.branchId) filter.branchId = req.branchId;
    const payments = await paymentService.getPayments(filter);
    return sendResponse(res, 200, 'Payments retrieved successfully', payments);
  };

  getById = async (req, res) => {
    const payment = await paymentService.getPaymentById(req.params.id, req.branchId);
    return sendResponse(res, 200, 'Payment retrieved successfully', payment);
  };
}

module.exports = new PaymentController();
