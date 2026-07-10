const reportService = require('../services/report.service');
const { sendResponse } = require('../helpers/response.helper');

class ReportController {
  getSummary = async (req, res) => {
    try {
      const { branchId, timeRange } = req.query;
      const summary = await reportService.getBranchSummary(branchId, timeRange);
      return sendResponse(res, 200, 'Branch summary report retrieved successfully', summary);
    } catch (error) {
      console.error('getSummary error:', error);
      return res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
  };

  getGrowth = async (req, res) => {
    try {
      const { branchId } = req.query;
      const growth = await reportService.getPatientGrowth(branchId);
      return sendResponse(res, 200, 'Patient growth report retrieved successfully', growth);
    } catch (error) {
      console.error('getGrowth error:', error);
      return res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
  };
}

module.exports = new ReportController();
