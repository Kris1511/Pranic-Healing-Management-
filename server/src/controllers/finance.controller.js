const financeService = require('../services/finance.service');
const { sendResponse } = require('../helpers/response.helper');

class FinanceController {
  addTransaction = async (req, res) => {
    const transaction = await financeService.recordTransaction(req.body);
    return sendResponse(res, 201, 'Transaction recorded successfully', transaction);
  };

  getAll = async (req, res) => {
    const records = await financeService.getFinanceRecords(req.query);
    return sendResponse(res, 200, 'Finance records retrieved successfully', records);
  };

  getSummary = async (req, res) => {
    const { branchId, startDate, endDate } = req.query;
    const summary = await financeService.getSummary(branchId, startDate, endDate);
    return sendResponse(res, 200, 'Finance summary retrieved successfully', summary);
  };
}

module.exports = new FinanceController();
