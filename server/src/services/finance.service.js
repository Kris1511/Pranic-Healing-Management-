const financeRepository = require('../repositories/finance.repository');
const ApiError = require('../helpers/error.helper');

class FinanceService {
  async recordTransaction(data) {
    return await financeRepository.create(data);
  }

  async getFinanceRecords(filter = {}) {
    return await financeRepository.findAll(filter);
  }

  async getSummary(branchId, startDate, endDate) {
    // Business logic to calculate totals
    const records = await financeRepository.findAll({ branchId });
    // Filter by date and calculate totals here
    const income = records.filter(r => r.type === 'income').reduce((sum, r) => sum + parseFloat(r.amount), 0);
    const expense = records.filter(r => r.type === 'expense').reduce((sum, r) => sum + parseFloat(r.amount), 0);
    
    return {
      totalIncome: income,
      totalExpense: expense,
      netProfit: income - expense
    };
  }
}

module.exports = new FinanceService();
