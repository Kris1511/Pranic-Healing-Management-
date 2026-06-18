const reportService = require('../services/report.service');
const { sendResponse } = require('../helpers/response.helper');

class ReportController {
  getSummary = async (req, res) => {
    const { branchId } = req.query;
    const summary = await reportService.getBranchSummary(branchId);
    return sendResponse(res, 200, 'Branch summary report retrieved successfully', summary);
  };

  getGrowth = async (req, res) => {
    const { branchId } = req.query;
    const growth = await reportService.getPatientGrowth(branchId);
    return sendResponse(res, 200, 'Patient growth report retrieved successfully', growth);
  };
}

module.exports = new ReportController();
