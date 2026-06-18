const financeRepository = require('../repositories/finance.repository');
const ApiError = require('../helpers/error.helper');

class FinanceService {
  async recordTransaction(data) {
    const normalizedData = {
      branchId: data.branch_id || data.branchId,
      type: data.type,
      category: data.category,
      amount: data.amount,
      description: data.description,
      remarks: data.remarks,
      paymentMode: data.payment_mode || data.paymentMode || data.mode,
      createdBy: data.created_by || data.createdBy,
      date: data.date ? new Date(data.date) : new Date(),
    };
    return await financeRepository.create(normalizedData);
  }

  async getFinanceRecords(filter = {}) {
    const { Op } = require('sequelize');
    const normalizedFilter = {};
    
    const branchId = filter.branchId || filter.branch_id;
    if (branchId) {
      normalizedFilter.branchId = branchId;
    }
    
    if (filter.type && filter.type !== 'All') {
      normalizedFilter.type = filter.type;
    }
    
    if (filter.category && filter.category !== 'All') {
      normalizedFilter.category = filter.category;
    }

    const search = filter.search || filter.q;
    if (search) {
      normalizedFilter[Op.or] = [
        { category: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
        { remarks: { [Op.like]: `%${search}%` } },
        { createdBy: { [Op.like]: `%${search}%` } }
      ];
    }

    const paymentMode = filter.payment_mode || filter.paymentMode || filter.mode;
    if (paymentMode && paymentMode !== 'All') {
      normalizedFilter.paymentMode = {
        [Op.like]: `%${paymentMode}%`
      };
    }

    const startDate = filter.startDate || filter.from_date || filter.from;
    const endDate = filter.endDate || filter.to_date || filter.to;
    if (startDate && endDate) {
      // Add one day to end date to make it inclusive, or search between dates
      normalizedFilter.date = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    } else if (startDate) {
      normalizedFilter.date = {
        [Op.gte]: new Date(startDate)
      };
    } else if (endDate) {
      normalizedFilter.date = {
        [Op.lte]: new Date(endDate)
      };
    }

    return await financeRepository.findAll(normalizedFilter);
  }

  async updateTransaction(id, data) {
    const normalizedData = {};
    if (data.branch_id !== undefined || data.branchId !== undefined) normalizedData.branchId = data.branch_id || data.branchId;
    if (data.type !== undefined) normalizedData.type = data.type;
    if (data.category !== undefined) normalizedData.category = data.category;
    if (data.amount !== undefined) normalizedData.amount = data.amount;
    if (data.description !== undefined) normalizedData.description = data.description;
    if (data.remarks !== undefined) normalizedData.remarks = data.remarks;
    if (data.payment_mode !== undefined || data.paymentMode !== undefined || data.mode !== undefined) {
      normalizedData.paymentMode = data.payment_mode || data.paymentMode || data.mode;
    }
    if (data.created_by !== undefined || data.createdBy !== undefined) normalizedData.createdBy = data.created_by || data.createdBy;
    if (data.date !== undefined) normalizedData.date = data.date ? new Date(data.date) : undefined;

    return await financeRepository.update(id, normalizedData);
  }

  async deleteTransaction(id) {
    return await financeRepository.delete(id);
  }

  async getSummary(branchId, startDate, endDate) {
    const records = await financeRepository.findAll({ branchId });
    const income = records
      .filter(r => r.type && r.type.toLowerCase() === 'income')
      .reduce((sum, r) => sum + parseFloat(r.amount), 0);
    const expense = records
      .filter(r => r.type && r.type.toLowerCase() === 'expense')
      .reduce((sum, r) => sum + parseFloat(r.amount), 0);
    
    return {
      totalIncome: income,
      totalExpense: expense,
      netProfit: income - expense
    };
  }

  async getSuperAdminDaily(date) {
    const { Finance, Branch, Payment, Session, Patient, sequelize } = require('../models');
    const { Op } = require('sequelize');

    // 1. Fetch daily manual finance records
    const financeRecords = await Finance.findAll({
      where: sequelize.where(
        sequelize.fn('DATE', sequelize.col('date')),
        date
      ),
      include: [{ model: Branch, as: 'branch' }]
    });

    // 2. Fetch sessions conducted on the selected date (to calculate paid, pending, partial patient payments)
    const sessionsOnDate = await Session.findAll({
      where: {
        sessionDate: date
      },
      include: [
        { model: Patient, as: 'patient', attributes: ['name'] },
        { model: Branch, as: 'branch', attributes: ['name'] },
        { model: Payment, as: 'payment' }
      ]
    });

    // 3. Map manual finance records (Income/Expense)
    const mappedFinance = financeRecords.map(r => {
      const isIncome = r.type && r.type.toLowerCase() === 'income';
      return {
        id: `finance-${r.id}`,
        title: r.remarks || r.description || 'Manual Entry',
        type: isIncome ? 'Income' : 'Expense',
        category: r.category,
        branch: r.branch ? r.branch.name : 'Unknown Branch',
        amount: parseFloat(r.amount),
        date: r.date ? new Date(r.date).toISOString().split('T')[0] : date
      };
    });

    // 4. Map session-based patient payments on this date
    const mappedSessions = sessionsOnDate.map(s => {
      const patientName = s.patient ? s.patient.name : 'Unknown Patient';
      const branchName = s.branch ? s.branch.name : 'Unknown Branch';
      const totalBilled = s.sessionFee !== null && s.sessionFee !== undefined
        ? parseFloat(s.sessionFee)
        : (parseFloat(s.totalAmount) || 0);
      const paidAmount = s.payment ? parseFloat(s.payment.amount) || 0 : 0;

      let type = 'Pending';
      if (paidAmount === 0) {
        type = 'Pending';
      } else if (paidAmount > 0 && paidAmount < totalBilled) {
        type = 'Partial';
      } else if (paidAmount >= totalBilled) {
        type = 'Paid';
      }

      return {
        id: `session-${s.id}`,
        title: `Session Fee - ${patientName}`,
        type: type,
        category: 'Session Fee',
        branch: branchName,
        amount: totalBilled,
        date: s.sessionDate,
        paid: paidAmount,
        outstanding: Math.max(0, totalBilled - paidAmount)
      };
    });

    const combinedRecords = [...mappedFinance, ...mappedSessions];

    // 5. Calculate daily stats based on actual cash flow
    const dailyManualIncome = mappedFinance
      .filter(r => r.type === 'Income')
      .reduce((sum, r) => sum + r.amount, 0);

    const dailyManualExpense = mappedFinance
      .filter(r => r.type === 'Expense')
      .reduce((sum, r) => sum + r.amount, 0);

    // Fetch payments actually collected on this selected date
    const paymentsOnDate = await Payment.findAll({
      where: sequelize.where(
        sequelize.fn('DATE', sequelize.col('payment_date')),
        date
      )
    });
    const dailyPaymentCollections = paymentsOnDate.reduce((sum, p) => sum + parseFloat(p.amount), 0);

    const totalDailyIncome = dailyManualIncome + dailyPaymentCollections;
    const totalDailyExpense = dailyManualExpense;
    const closingBalance = totalDailyIncome - totalDailyExpense;

    // 6. System-wide calculations (all branches, all time) for Dashboard Summary Cards
    const allManualFinance = await Finance.findAll();
    const totalManualIncome = allManualFinance
      .filter(f => f.type && f.type.toLowerCase() === 'income')
      .reduce((sum, f) => sum + parseFloat(f.amount), 0);

    const totalManualExpense = allManualFinance
      .filter(f => f.type && f.type.toLowerCase() === 'expense')
      .reduce((sum, f) => sum + parseFloat(f.amount), 0);

    const allSessions = await Session.findAll({
      include: [{ model: Payment, as: 'payment' }]
    });

    let pendingCount = 0;
    let partialCount = 0;
    let paidCount = 0;
    let outstandingBalance = 0;
    let totalRevenue = 0;

    allSessions.forEach(s => {
      const fee = s.sessionFee !== null && s.sessionFee !== undefined
        ? parseFloat(s.sessionFee)
        : (parseFloat(s.totalAmount) || 0);

      totalRevenue += fee;

      const paid = s.payment ? parseFloat(s.payment.amount) || 0 : 0;
      const outstanding = Math.max(0, fee - paid);

      if (paid === 0) {
        pendingCount++;
      } else if (paid > 0 && paid < fee) {
        partialCount++;
      } else if (paid >= fee) {
        paidCount++;
      }

      outstandingBalance += outstanding;
    });

    const allPayments = await Payment.findAll();
    const totalPaymentsPaid = allPayments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
    const totalCollections = totalPaymentsPaid + totalManualIncome;

    // 7. Monthly Revenue breakdown (Consolidated Collections)
    const monthlyRevenueMap = {};
    allPayments.forEach(p => {
      const month = p.paymentDate.toISOString().substring(0, 7); // YYYY-MM
      monthlyRevenueMap[month] = (monthlyRevenueMap[month] || 0) + parseFloat(p.amount);
    });
    allManualFinance.filter(f => f.type && f.type.toLowerCase() === 'income').forEach(f => {
      const month = f.date.toISOString().substring(0, 7);
      monthlyRevenueMap[month] = (monthlyRevenueMap[month] || 0) + parseFloat(f.amount);
    });

    const monthlyRevenue = Object.entries(monthlyRevenueMap).map(([month, amount]) => ({
      month,
      amount
    })).sort((a, b) => b.month.localeCompare(a.month));

    // 8. Branch-wise Revenue breakdown
    const branchesList = await Branch.findAll();
    const branchMap = {};
    branchesList.forEach(b => {
      branchMap[b.id] = b.name;
    });

    const branchRevenueMap = {};
    branchesList.forEach(b => {
      branchRevenueMap[b.name] = 0;
    });

    allPayments.forEach(p => {
      const branchName = branchMap[p.branchId] || 'Unknown Branch';
      branchRevenueMap[branchName] = (branchRevenueMap[branchName] || 0) + parseFloat(p.amount);
    });
    allManualFinance.filter(f => f.type && f.type.toLowerCase() === 'income').forEach(f => {
      const branchName = branchMap[f.branchId] || 'Unknown Branch';
      branchRevenueMap[branchName] = (branchRevenueMap[branchName] || 0) + parseFloat(f.amount);
    });

    const branchWiseRevenue = Object.entries(branchRevenueMap).map(([branchName, amount]) => ({
      branchName,
      amount
    }));

    return {
      records: combinedRecords,
      dailyStats: {
        totalIncome: totalDailyIncome,
        totalExpense: totalDailyExpense,
        closingBalance
      },
      systemStats: {
        totalRevenue,
        totalCollections,
        outstandingBalance,
        dailyTransactionsCount: combinedRecords.length,
        monthlyRevenue,
        branchWiseRevenue,
        patientPaymentStats: {
          paidCount,
          partialCount,
          pendingCount
        },
        totalIncome: totalManualIncome,
        totalExpense: totalManualExpense
      }
    };
  }

  async getSuperAdminRevenue() {
    const { Finance, Branch, Payment, Session, Patient } = require('../models');
    const { Op } = require('sequelize');

    // 1. Fetch all manual expense records (type === 'expense')
    const expenseRecords = await Finance.findAll({
      where: {
        type: {
          [Op.in]: ['expense', 'EXPENSE']
        }
      },
      include: [{ model: Branch, as: 'branch' }]
    });

    // 2. Fetch all manual income records (type === 'income')
    const incomeRecords = await Finance.findAll({
      where: {
        type: {
          [Op.in]: ['income', 'INCOME']
        }
      },
      include: [{ model: Branch, as: 'branch' }]
    });

    // 3. Fetch all sessions with payments and patient details
    const allSessions = await Session.findAll({
      include: [
        { model: Patient, as: 'patient', attributes: ['name', 'id'] },
        { model: Branch, as: 'branch', attributes: ['name'] },
        { model: Payment, as: 'payment' }
      ]
    });

    const mappedTransactions = allSessions.map(s => {
      const fee = s.sessionFee !== null && s.sessionFee !== undefined
        ? parseFloat(s.sessionFee)
        : (parseFloat(s.totalAmount) || 0);

      const rawStatus = (s.paymentStatus || 'pending').toLowerCase();
      let paid = 0;
      let status = 'pending';

      if (rawStatus === 'paid') {
        paid = fee;
        status = 'completed';
      } else if (rawStatus === 'partial') {
        paid = s.payment ? parseFloat(s.payment.amount) || 0 : 0;
        status = 'pending';
      } else {
        paid = 0;
        status = 'pending';
      }

      const paymentDate = s.payment ? s.payment.paymentDate : s.createdAt;
      const dateStr = paymentDate ? new Date(paymentDate).toISOString().split('T')[0] : '—';
      const timeStr = paymentDate ? new Date(paymentDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—';

      return {
        id: s.id,
        patient: s.patient ? s.patient.name : 'Unknown Patient',
        branch: s.branch ? s.branch.name : 'Unknown Branch',
        amount: fee,
        paid: paid,
        outstanding: Math.max(0, fee - paid),
        method: s.payment ? (s.payment.paymentMethod || 'UPI') : (s.paymentMethod || '—'),
        status,
        date: dateStr,
        time: timeStr
      };
    });

    const mappedManualIncome = incomeRecords.map(e => {
      const dateStr = e.date ? new Date(e.date).toISOString().split('T')[0] : '—';
      const timeStr = e.date ? new Date(e.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—';
      const rawTitle = e.remarks || e.description || e.category || 'Manual Income';
      
      return {
        id: `finance-${e.id}`,
        patient: rawTitle.trim().replace(/\s+/g, ' '),
        branch: e.branch ? e.branch.name : 'Unknown Branch',
        amount: parseFloat(e.amount),
        paid: parseFloat(e.amount),
        outstanding: 0,
        method: e.paymentMode || 'Cash',
        status: 'completed',
        date: dateStr,
        time: timeStr
      };
    });

    const mappedExpenses = expenseRecords.map(e => ({
      id: e.id,
      category: e.category,
      branch: e.branch ? e.branch.name : 'Unknown Branch',
      amount: parseFloat(e.amount),
      date: e.date ? new Date(e.date).toISOString().split('T')[0] : '—',
      status: 'paid'
    }));

    return {
      transactions: [...mappedTransactions, ...mappedManualIncome],
      expenses: mappedExpenses
    };
  }
}

module.exports = new FinanceService();
