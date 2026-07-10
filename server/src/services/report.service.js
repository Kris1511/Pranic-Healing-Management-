const sessionRepository = require('../repositories/session.repository');
const patientRepository = require('../repositories/patient.repository');
const financeRepository = require('../repositories/finance.repository');
const { sequelize } = require('../models');

const { Op } = require('sequelize');

class ReportService {
  /**
   * @desc    Generate General Summary Report for a Branch
   */
  async getBranchSummary(branchId, timeRange) {
    const filter = branchId ? { branchId } : {};

    const patientFilter = { ...filter };
    const sessionFilter = { ...filter };
    const financeFilter = { ...filter };

    if (timeRange && timeRange !== 'All Time') {
      let startDate = new Date();
      let endDate = new Date();

      switch (timeRange.toLowerCase()) {
        case 'today':
          startDate.setHours(0, 0, 0, 0);
          endDate.setHours(23, 59, 59, 999);
          break;
        case 'yesterday':
          startDate.setDate(startDate.getDate() - 1);
          startDate.setHours(0, 0, 0, 0);
          endDate.setDate(endDate.getDate() - 1);
          endDate.setHours(23, 59, 59, 999);
          break;
        case 'last week':
        case 'last 7 days':
          startDate.setDate(startDate.getDate() - 7);
          startDate.setHours(0, 0, 0, 0);
          endDate.setHours(23, 59, 59, 999);
          break;
        case 'this month':
          startDate.setDate(1);
          startDate.setHours(0, 0, 0, 0);
          endDate.setHours(23, 59, 59, 999);
          break;
        default:
          startDate = null;
      }

      if (startDate) {
        patientFilter.createdAt = {
          [Op.between]: [startDate, endDate]
        };
        sessionFilter.sessionDate = {
          [Op.between]: [startDate, endDate]
        };
        financeFilter.date = {
          [Op.between]: [startDate, endDate]
        };
      }
    }

    const totalPatients = await patientRepository.findAll(patientFilter);
    const totalSessions = await sessionRepository.findAll(sessionFilter);
    const financialRecords = await financeRepository.findAll(financeFilter);

    const revenue = financialRecords
      .filter(r => r.type === 'income' || r.type === 'Income')
      .reduce((sum, r) => sum + parseFloat(r.amount), 0);

    const expenses = financialRecords
      .filter(r => r.type === 'expense' || r.type === 'Expense')
      .reduce((sum, r) => sum + parseFloat(r.amount), 0);

    const daysMap = { 'Mon': {h1:0, h2:0}, 'Tue': {h1:0, h2:0}, 'Wed': {h1:0, h2:0}, 'Thu': {h1:0, h2:0}, 'Fri': {h1:0, h2:0}, 'Sat': {h1:0, h2:0}, 'Sun': {h1:0, h2:0} };
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    financialRecords.forEach(r => {
      let rType = r.type ? r.type.toLowerCase() : '';
      const date = new Date(r.date || r.createdAt);
      if (isNaN(date.getTime())) return; // skip invalid dates
      const dayName = dayNames[date.getDay()];
      if (rType === 'income') {
        daysMap[dayName].h1 += parseFloat(r.amount);
      } else if (rType === 'expense') {
        daysMap[dayName].h2 += parseFloat(r.amount);
      }
    });

    const chartBars = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => ({
      d,
      h1: daysMap[d].h1,
      h2: daysMap[d].h2
    }));

    return {
      patientCount: totalPatients.length,
      sessionCount: totalSessions.length,
      totalRevenue: revenue,
      totalExpenses: expenses,
      netProfit: revenue - expenses,
      chartBars
    };
  }

  /**
   * @desc    Generate Patient Growth Report (Monthly)
   */
  async getPatientGrowth(branchId) {
    const whereClause = branchId ? 'WHERE branch_id = :branchId' : '';
    // Example using raw query via sequelize for complex grouping
    const results = await sequelize.query(`
      SELECT DATE_FORMAT(created_at, '%Y-%m') as month, COUNT(*) as count 
      FROM patients 
      ${whereClause} 
      GROUP BY month 
      ORDER BY month DESC
    `, {
      replacements: { branchId },
      type: sequelize.QueryTypes.SELECT
    });

    return results;
  }
}

module.exports = new ReportService();
