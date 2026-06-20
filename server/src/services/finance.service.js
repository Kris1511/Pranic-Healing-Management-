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
      const defaultTitle = isIncome ? 'Manual Income' : 'Manual Expense';
      return {
        id: `finance-${r.id}`,
        title: (r.remarks || r.description || r.category || defaultTitle).trim().replace(/\s+/g, ' '),
        type: isIncome ? 'Income' : 'Expense',
        category: r.category || (isIncome ? 'Income' : 'Expense'),
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
      const rawStatus = (s.paymentStatus || 'pending').toLowerCase();

      let type = 'Pending';
      let paid = 0;

      if (rawStatus === 'paid') {
        type = 'Paid';
        paid = totalBilled;
      } else if (rawStatus === 'partial' || (paidAmount > 0 && paidAmount < totalBilled)) {
        type = 'Partial';
        paid = paidAmount;
      } else if (paidAmount >= totalBilled && totalBilled > 0) {
        type = 'Paid';
        paid = paidAmount;
      } else {
        type = 'Pending';
        paid = 0;
      }

      return {
        id: `session-${s.id}`,
        title: `Session Fee - ${patientName}`,
        type,
        category: 'Session Fee',
        branch: branchName,
        amount: type === 'Partial' ? paid : totalBilled,
        date: s.sessionDate,
        paid,
        outstanding: Math.max(0, totalBilled - paid)
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

    const dailySessionIncome = mappedSessions
      .reduce((sum, s) => sum + s.paid, 0);

    const totalDailyIncome = dailyManualIncome + dailySessionIncome;
    const totalDailyExpense = dailyManualExpense;
    const closingBalance = totalDailyIncome - totalDailyExpense;

    // 6. Daily calculations (all branches, filtered by selected date) for Dashboard Summary Cards
    const allManualFinance = await Finance.findAll({
      where: sequelize.where(
        sequelize.fn('DATE', sequelize.col('date')),
        date
      )
    });
    const totalManualIncome = allManualFinance
      .filter(f => f.type && f.type.toLowerCase() === 'income')
      .reduce((sum, f) => sum + parseFloat(f.amount), 0);

    const totalManualExpense = allManualFinance
      .filter(f => f.type && f.type.toLowerCase() === 'expense')
      .reduce((sum, f) => sum + parseFloat(f.amount), 0);

    const allSessions = await Session.findAll({
      where: {
        sessionDate: date
      },
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

      const rawStatus = (s.paymentStatus || 'pending').toLowerCase();
      let type = 'Pending';
      if (rawStatus === 'paid') {
        type = 'Paid';
      } else if (rawStatus === 'partial' || (paid > 0 && paid < fee)) {
        type = 'Partial';
      } else if (paid >= fee && fee > 0) {
        type = 'Paid';
      }

      if (type === 'Pending') {
        pendingCount++;
      } else if (type === 'Partial') {
        partialCount++;
      } else if (type === 'Paid') {
        paidCount++;
      }

      outstandingBalance += outstanding;
    });

    const allPayments = await Payment.findAll({
      where: sequelize.where(
        sequelize.fn('DATE', sequelize.col('payment_date')),
        date
      )
    });
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

    const mappedSessions = allSessions.map(s => {
      const patientName = s.patient ? s.patient.name : 'Unknown Patient';
      const fee = s.sessionFee !== null && s.sessionFee !== undefined
        ? parseFloat(s.sessionFee)
        : (parseFloat(s.totalAmount) || 0);

      const paidAmount = s.payment ? parseFloat(s.payment.amount) || 0 : 0;
      const rawStatus = (s.paymentStatus || 'pending').toLowerCase();

      let type = 'Pending';
      let paid = 0;

      if (rawStatus === 'paid') {
        type = 'Paid';
        paid = fee;
      } else if (rawStatus === 'partial' || (paidAmount > 0 && paidAmount < fee)) {
        type = 'Partial';
        paid = paidAmount;
      } else if (paidAmount >= fee && fee > 0) {
        type = 'Paid';
        paid = paidAmount;
      } else {
        type = 'Pending';
        paid = 0;
      }

      const dateStr = s.sessionDate ? new Date(s.sessionDate).toISOString().split('T')[0] : '—';

      return {
        id: `session-${s.id}`,
        title: `Session Fee - ${patientName}`,
        branch: s.branch ? s.branch.name : 'Unknown Branch',
        category: 'Session Fee',
        amount: type === 'Partial' ? paid : fee,
        date: dateStr,
        type,
        paid,
        outstanding: Math.max(0, fee - paid)
      };
    });

    const mappedManualIncome = incomeRecords.map(e => {
      const dateStr = e.date ? new Date(e.date).toISOString().split('T')[0] : '—';
      const rawTitle = e.remarks || e.description || e.category || 'Manual Income';
      return {
        id: `finance-${e.id}`,
        title: rawTitle.trim().replace(/\s+/g, ' '),
        branch: e.branch ? e.branch.name : 'Unknown Branch',
        category: e.category || 'Income',
        amount: parseFloat(e.amount),
        date: dateStr,
        type: 'Income',
        paid: parseFloat(e.amount),
        outstanding: 0
      };
    });

    const mappedExpenses = expenseRecords.map(e => {
      const dateStr = e.date ? new Date(e.date).toISOString().split('T')[0] : '—';
      const rawTitle = e.remarks || e.description || e.category || 'Manual Expense';
      return {
        id: `finance-${e.id}`,
        title: rawTitle.trim().replace(/\s+/g, ' '),
        branch: e.branch ? e.branch.name : 'Unknown Branch',
        category: e.category || 'Expense',
        amount: parseFloat(e.amount),
        date: dateStr,
        type: 'Expense',
        paid: parseFloat(e.amount),
        outstanding: 0
      };
    });

    const combinedRecords = [...mappedSessions, ...mappedManualIncome, ...mappedExpenses];

    const totalIncome = mappedManualIncome.reduce((sum, item) => sum + item.amount, 0) +
                        mappedSessions.reduce((sum, item) => sum + item.paid, 0);

    const totalExpenses = mappedExpenses.reduce((sum, item) => sum + item.amount, 0);

    const totalPending = mappedSessions.reduce((sum, item) => sum + item.outstanding, 0);

    const netProfit = totalIncome - totalExpenses;

    return {
      records: combinedRecords,
      stats: {
        totalIncome,
        totalExpenses,
        netProfit,
        totalPending
      }
    };
  }

  async getDashboardStats(branchId) {
    const { Finance, Payment, Visitor, Patient, Healer, Session, sequelize } = require('../models');
    const { Op } = require('sequelize');

    const todayStr = new Date().toISOString().split('T')[0];

    // 1. Daily Income
    const manualIncomeToday = parseFloat(await Finance.sum('amount', {
      where: {
        type: 'Income',
        branchId,
        [Op.and]: [
          sequelize.where(sequelize.fn('DATE', sequelize.col('date')), todayStr)
        ]
      }
    })) || 0;

    const paymentsToday = parseFloat(await Payment.sum('amount', {
      where: {
        branchId,
        [Op.and]: [
          sequelize.where(sequelize.fn('DATE', sequelize.col('payment_date')), todayStr)
        ]
      }
    })) || 0;

    const dailyIncome = manualIncomeToday + paymentsToday;

    // 2. Daily Expense
    const dailyExpense = parseFloat(await Finance.sum('amount', {
      where: {
        type: 'Expense',
        branchId,
        [Op.and]: [
          sequelize.where(sequelize.fn('DATE', sequelize.col('created_at')), todayStr)
        ]
      }
    })) || 0;

    // 3. Net Balance
    const netBalance = dailyIncome - dailyExpense;

    // 4. Today Visitors
    const visitorsTodayCount = await Visitor.count({
      where: {
        branchId,
        [Op.and]: [
          sequelize.where(sequelize.fn('DATE', sequelize.col('created_at')), todayStr)
        ]
      }
    });

    const visitorsInsideCount = await Visitor.count({
      where: {
        branchId,
        checkOut: null,
        [Op.and]: [
          sequelize.where(sequelize.fn('DATE', sequelize.col('created_at')), todayStr)
        ]
      }
    });

    // 5. Active Patients
    const activePatientsCount = await Patient.count({
      where: {
        branchId,
        status: {
          [Op.in]: ['active', 'Active']
        }
      }
    });

    const newPatientsTodayCount = await Patient.count({
      where: {
        branchId,
        [Op.and]: [
          sequelize.where(sequelize.fn('DATE', sequelize.col('created_at')), todayStr)
        ]
      }
    });

    // 6. Pending Payments
    const sessions = await Session.findAll({
      where: { branchId },
      include: [{ model: Payment, as: 'payment' }]
    });

    let pendingPaymentsCount = 0;
    let partialPaymentsCount = 0;

    sessions.forEach(s => {
      const fee = parseFloat(s.sessionFee !== null && s.sessionFee !== undefined ? s.sessionFee : (s.totalAmount || 0));
      const paid = s.payment ? parseFloat(s.payment.amount) || 0 : 0;

      if (paid === 0 && fee > 0) {
        pendingPaymentsCount++;
      } else if (paid > 0 && paid < fee) {
        partialPaymentsCount++;
      }
    });

    // 7. Active Healers
    const activeHealersCount = await Healer.count({
      where: {
        branchId,
        status: {
          [Op.in]: ['active', 'Active']
        }
      }
    });

    // 8. Weekly Comparison Calculations
    const today = new Date();
    const currentDay = today.getDay();
    const distanceToMonday = currentDay === 0 ? -6 : 1 - currentDay;

    const startOfThisWeek = new Date(today);
    startOfThisWeek.setDate(today.getDate() + distanceToMonday);
    startOfThisWeek.setHours(0, 0, 0, 0);

    const endOfThisWeek = new Date(startOfThisWeek);
    endOfThisWeek.setDate(startOfThisWeek.getDate() + 6);
    endOfThisWeek.setHours(23, 59, 59, 999);

    const startOfPrevWeek = new Date(startOfThisWeek);
    startOfPrevWeek.setDate(startOfThisWeek.getDate() - 7);
    startOfPrevWeek.setHours(0, 0, 0, 0);

    const endOfPrevWeek = new Date(startOfPrevWeek);
    endOfPrevWeek.setDate(startOfPrevWeek.getDate() + 6);
    endOfPrevWeek.setHours(23, 59, 59, 999);

    // Fetch all finance records for the current and previous week range
    const financeRecords = await Finance.findAll({
      where: {
        branchId,
        date: {
          [Op.between]: [startOfPrevWeek, endOfThisWeek]
        }
      }
    });

    // Fetch all payment records for the current and previous week range
    const paymentRecords = await Payment.findAll({
      where: {
        branchId,
        paymentDate: {
          [Op.between]: [startOfPrevWeek, endOfThisWeek]
        }
      }
    });

    // Initialize the weekly data structure
    const weeklyFinanceData = [
      { day: 'Mon', current: { income: 0, expense: 0 }, previous: { income: 0, expense: 0 } },
      { day: 'Tue', current: { income: 0, expense: 0 }, previous: { income: 0, expense: 0 } },
      { day: 'Wed', current: { income: 0, expense: 0 }, previous: { income: 0, expense: 0 } },
      { day: 'Thu', current: { income: 0, expense: 0 }, previous: { income: 0, expense: 0 } },
      { day: 'Fri', current: { income: 0, expense: 0 }, previous: { income: 0, expense: 0 } },
      { day: 'Sat', current: { income: 0, expense: 0 }, previous: { income: 0, expense: 0 } },
      { day: 'Sun', current: { income: 0, expense: 0 }, previous: { income: 0, expense: 0 } },
    ];

    const getDayIndex = (d) => {
      const day = d.getDay();
      return day === 0 ? 6 : day - 1;
    };

    financeRecords.forEach(r => {
      const amt = parseFloat(r.amount) || 0;
      const type = (r.type || '').toLowerCase();
      const recordDate = new Date(r.date);
      const recordTime = recordDate.getTime();
      const dayIdx = getDayIndex(recordDate);

      if (dayIdx >= 0 && dayIdx < 7) {
        if (recordTime >= startOfThisWeek.getTime() && recordTime <= endOfThisWeek.getTime()) {
          if (type === 'income') {
            weeklyFinanceData[dayIdx].current.income += amt;
          } else if (type === 'expense') {
            weeklyFinanceData[dayIdx].current.expense += amt;
          }
        } else if (recordTime >= startOfPrevWeek.getTime() && recordTime <= endOfPrevWeek.getTime()) {
          if (type === 'income') {
            weeklyFinanceData[dayIdx].previous.income += amt;
          } else if (type === 'expense') {
            weeklyFinanceData[dayIdx].previous.expense += amt;
          }
        }
      }
    });

    paymentRecords.forEach(p => {
      const amt = parseFloat(p.amount) || 0;
      const recordDate = new Date(p.paymentDate);
      const recordTime = recordDate.getTime();
      const dayIdx = getDayIndex(recordDate);

      if (dayIdx >= 0 && dayIdx < 7) {
        if (recordTime >= startOfThisWeek.getTime() && recordTime <= endOfThisWeek.getTime()) {
          weeklyFinanceData[dayIdx].current.income += amt;
        } else if (recordTime >= startOfPrevWeek.getTime() && recordTime <= endOfPrevWeek.getTime()) {
          weeklyFinanceData[dayIdx].previous.income += amt;
        }
      }
    });

    let totalThisWeekIncome = 0;
    let totalThisWeekExpense = 0;
    weeklyFinanceData.forEach(day => {
      totalThisWeekIncome += day.current.income;
      totalThisWeekExpense += day.current.expense;
    });

    return {
      dailyIncome,
      dailyExpense,
      netBalance,
      visitorsTodayCount,
      visitorsInsideCount,
      activePatientsCount,
      newPatientsTodayCount,
      pendingPaymentsCount,
      partialPaymentsCount,
      activeHealersCount,
      weeklyFinanceData,
      totalThisWeekIncome,
      totalThisWeekExpense
    };
  }
}

module.exports = new FinanceService();
