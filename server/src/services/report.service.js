const sessionRepository = require('../repositories/session.repository');
const patientRepository = require('../repositories/patient.repository');
const financeRepository = require('../repositories/finance.repository');
const { sequelize } = require('../models');

class ReportService {
  /**
   * @desc    Generate General Summary Report for a Branch
   */
  async getBranchSummary(branchId) {
    const totalPatients = await patientRepository.findAll({ branchId });
    const totalSessions = await sessionRepository.findAll({ branchId });
    const financialRecords = await financeRepository.findAll({ branchId });

    const revenue = financialRecords
      .filter(r => r.type === 'income')
      .reduce((sum, r) => sum + parseFloat(r.amount), 0);

    const expenses = financialRecords
      .filter(r => r.type === 'expense')
      .reduce((sum, r) => sum + parseFloat(r.amount), 0);

    return {
      patientCount: totalPatients.length,
      sessionCount: totalSessions.length,
      totalRevenue: revenue,
      totalExpenses: expenses,
      netProfit: revenue - expenses
    };
  }

  /**
   * @desc    Generate Patient Growth Report (Monthly)
   */
  async getPatientGrowth(branchId) {
    // Example using raw query via sequelize for complex grouping
    const results = await sequelize.query(`
      SELECT DATE_FORMAT(created_at, '%Y-%m') as month, COUNT(*) as count 
      FROM patients 
      WHERE branch_id = :branchId 
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
