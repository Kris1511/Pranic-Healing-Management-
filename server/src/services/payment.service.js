const paymentRepository = require('../repositories/payment.repository');
const ApiError = require('../helpers/error.helper');

class PaymentService {
  async processPayment(data) {
    const { sessionId, amount, paymentMethod, branchId } = data;

    // Find if a payment already exists for this session
    let payment = await paymentRepository.findOne({ sessionId });

    if (payment) {
      // Update existing payment
      const newAmount = parseFloat(payment.amount) + parseFloat(amount);
      payment = await paymentRepository.update(payment.id, {
        amount: newAmount,
        paymentMethod,
        paymentDate: new Date(),
      });
    } else {
      // Create new payment
      payment = await paymentRepository.create({
        sessionId,
        amount,
        paymentMethod,
        branchId,
        paymentDate: new Date(),
        status: 'paid',
      });
    }

    const financeService = require('./finance.service');
    const todayStr = new Date().toISOString().split('T')[0];
    const summaryBefore = await financeService.getSuperAdminDaily(todayStr);
    const financeSummary = {
      totalIncome: summaryBefore.dailyStats.totalIncome,
      totalExpense: summaryBefore.dailyStats.totalExpense,
      closingBalance: summaryBefore.dailyStats.closingBalance,
      totalRevenue: summaryBefore.systemStats.totalRevenue,
      totalCollections: summaryBefore.systemStats.totalCollections,
      outstandingBalance: summaryBefore.systemStats.outstandingBalance,
      pendingCount: summaryBefore.systemStats.patientPaymentStats.pendingCount
    };

    // Update corresponding Session paymentStatus and paymentMethod
    const { Session } = require('../models');
    const session = await Session.findByPk(sessionId);
    if (session) {
      const fee = parseFloat(session.sessionFee || session.totalAmount || 0);
      const totalPaid = parseFloat(payment.amount);

      let newStatus = 'pending';
      if (totalPaid >= fee) {
        newStatus = 'paid';
      } else if (totalPaid > 0) {
        newStatus = 'partial';
      }

      await session.update({
        paymentStatus: newStatus,
        paymentMethod: paymentMethod || session.paymentMethod
      });
      await session.reload();
    }

    const summaryAfter = await financeService.getSuperAdminDaily(todayStr);
    const updatedFinanceSummary = {
      totalIncome: summaryAfter.dailyStats.totalIncome,
      totalExpense: summaryAfter.dailyStats.totalExpense,
      closingBalance: summaryAfter.dailyStats.closingBalance,
      totalRevenue: summaryAfter.systemStats.totalRevenue,
      totalCollections: summaryAfter.systemStats.totalCollections,
      outstandingBalance: summaryAfter.systemStats.outstandingBalance,
      pendingCount: summaryAfter.systemStats.patientPaymentStats.pendingCount
    };

    const payment_status = session ? session.paymentStatus : 'pending';
    console.log("Session Payment Data:", session);
    console.log("Finance Totals Before:", financeSummary);
    console.log("Finance Totals After:", updatedFinanceSummary);
    console.log("Payment Status:", payment_status);

    return payment;
  }

  async getPayments(filter = {}) {
    return await paymentRepository.findAll(filter);
  }

  async getSessionsWithPayments(filter = {}) {
    return await paymentRepository.findSessionsWithPayments(filter);
  }

  /**
   * Fetch all sessions (with payment info) for a specific patient ID.
   * Returns sessions that have no payment row too, so the patient sees
   * every session in their billing ledger regardless of payment status.
   */
  async getSessionsWithPaymentsByPatientId(patientId) {
    return await paymentRepository.findSessionsWithPaymentsByPatientId(patientId);
  }

  async getPaymentById(id, branchId) {
    const payment = await paymentRepository.findById(id);
    if (!payment) {
      throw new ApiError(404, 'Payment record not found.');
    }
    if (branchId && payment.branchId !== branchId) {
      throw new ApiError(403, 'Unauthorized access to branch data.');
    }
    return payment;
  }

  async updatePayment(id, data, branchId) {
    let payment = await this.getPaymentById(id, branchId);
    
    payment = await paymentRepository.update(id, data);
    
    // Update corresponding Session status
    const { Session } = require('../models');
    const session = await Session.findByPk(payment.sessionId);
    if (session) {
      const fee = parseFloat(session.sessionFee || session.totalAmount || 0);
      const totalPaid = parseFloat(payment.amount || 0);
      
      let newStatus = 'pending';
      if (totalPaid >= fee) {
        newStatus = 'paid';
      } else if (totalPaid > 0) {
        newStatus = 'partial';
      }
      
      await session.update({
        paymentStatus: newStatus,
        paymentMethod: payment.paymentMethod || session.paymentMethod
      });
    }
    return payment;
  }

  async deletePayment(id, branchId) {
    const payment = await this.getPaymentById(id, branchId);
    const sessionId = payment.sessionId;
    
    await paymentRepository.delete(id);
    
    // Update corresponding Session status
    const { Session } = require('../models');
    const session = await Session.findByPk(sessionId);
    if (session) {
      await session.update({
        paymentStatus: 'pending',
        paymentMethod: null
      });
    }
    return true;
  }
}

module.exports = new PaymentService();
