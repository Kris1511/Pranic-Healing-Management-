const financeService = require('../services/finance.service');
const financeRepository = require('../repositories/finance.repository');
const { sendResponse } = require('../helpers/response.helper');

class FinanceController {
  addTransaction = async (req, res) => {
    if (req.branchId) {
      req.body.branchId = req.branchId;
      req.body.branch_id = req.branchId;
    }
    const { type, category, amount } = req.body;
    if (!type || !category || amount === undefined) {
      return sendResponse(res, 400, 'Type, category and amount are required', null);
    }
    const transaction = await financeService.recordTransaction(req.body);
    return sendResponse(res, 201, 'Transaction recorded successfully', transaction);
  };

  getAll = async (req, res) => {
    const filter = { ...req.query };
    if (req.branchId) {
      filter.branchId = req.branchId;
      filter.branch_id = req.branchId;
    }
    const records = await financeService.getFinanceRecords(filter);
    return sendResponse(res, 200, 'Finance records retrieved successfully', records);
  };

  getSummary = async (req, res) => {
    let { branchId, startDate, endDate } = req.query;
    if (req.branchId) branchId = req.branchId;
    const summary = await financeService.getSummary(branchId, startDate, endDate);
    return sendResponse(res, 200, 'Finance summary retrieved successfully', summary);
  };

  getSuperAdminDaily = async (req, res) => {
    let { date } = req.query;
    if (!date) {
      date = new Date().toISOString().split('T')[0];
    }
    const data = await financeService.getSuperAdminDaily(date);
    return sendResponse(res, 200, 'Super Admin Daily Finance retrieved successfully', data);
  };

  updateTransaction = async (req, res) => {
    const { id } = req.params;
    if (req.branchId) {
      const transaction = await financeRepository.findById(id);
      if (!transaction || transaction.branchId !== req.branchId) {
        return sendResponse(res, 403, 'Unauthorized to update this transaction', null);
      }
    }
    const updated = await financeService.updateTransaction(id, req.body);
    if (!updated) return sendResponse(res, 404, 'Transaction not found', null);
    return sendResponse(res, 200, 'Transaction updated successfully', updated);
  };

  deleteTransaction = async (req, res) => {
    const { id } = req.params;
    if (req.branchId) {
      const transaction = await financeRepository.findById(id);
      if (!transaction || transaction.branchId !== req.branchId) {
        return sendResponse(res, 403, 'Unauthorized to delete this transaction', null);
      }
    }
    const deleted = await financeService.deleteTransaction(id);
    if (!deleted) return sendResponse(res, 404, 'Transaction not found', null);
    return sendResponse(res, 200, 'Transaction deleted successfully', null);
  };

  getSuperAdminRevenue = async (req, res) => {
    const data = await financeService.getSuperAdminRevenue();
    return sendResponse(res, 200, 'Super Admin Revenue Details retrieved successfully', data);
  };
}

module.exports = new FinanceController();
