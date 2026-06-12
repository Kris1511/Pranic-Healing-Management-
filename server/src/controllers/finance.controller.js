const financeService = require('../services/finance.service');
const { sendResponse } = require('../helpers/response.helper');

class FinanceController {
  addTransaction = async (req, res) => {
    if (req.branchId) req.body.branchId = req.branchId;
    const transaction = await financeService.recordTransaction(req.body);
    return sendResponse(res, 201, 'Transaction recorded successfully', transaction);
  };

  getAll = async (req, res) => {
    const filter = { ...req.query };
    if (req.branchId) filter.branchId = req.branchId;
    const records = await financeService.getFinanceRecords(filter);
    return sendResponse(res, 200, 'Finance records retrieved successfully', records);
  };

  getSummary = async (req, res) => {
    let { branchId, startDate, endDate } = req.query;
    if (req.branchId) branchId = req.branchId;
    const summary = await financeService.getSummary(branchId, startDate, endDate);
    return sendResponse(res, 200, 'Finance summary retrieved successfully', summary);
  };
}

module.exports = new FinanceController();
