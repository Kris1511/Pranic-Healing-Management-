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

    // 1. Default to Today if no date is provided
    const localToday = new Date();
    const offset = localToday.getTimezoneOffset();
    const todayStr = new Date(localToday.getTime() - (offset * 60 * 1000)).toISOString().split('T')[0];
    const targetDate = date || todayStr;

    const financeWhere = {};
    const sessionWhere = {};
    const paymentWhere = {};

    financeWhere[Op.and] = [
      sequelize.where(
        sequelize.fn('DATE', sequelize.col('date')),
        targetDate
      )
    ];
    sessionWhere[Op.and] = [
      sequelize.where(
        sequelize.fn('DATE', sequelize.col('session_date')),
        targetDate
      )
    ];
    paymentWhere[Op.and] = [
      sequelize.where(
        sequelize.fn('DATE', sequelize.col('payment_date')),
        targetDate
      )
    ];

    // 2. Fetch manual finance records for target date
    const financeRecords = await Finance.findAll({
      where: financeWhere,
      include: [{ model: Branch, as: 'branch' }]
    });

    // 3. Fetch sessions conducted on the target date
    const sessionsOnDate = await Session.findAll({
      where: sessionWhere,
      include: [
        { model: Patient, as: 'patient', attributes: ['name'] },
        { model: Branch, as: 'branch', attributes: ['name'] },
        { model: Payment, as: 'payment' }
      ]
    });

    // 4. Map manual finance records
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
        date: r.date ? new Date(r.date).toISOString().split('T')[0] : targetDate
      };
    });

    // 5. Map sessions
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
        date: targetDate,
        paid,
        outstanding: Math.max(0, totalBilled - paid)
      };
    });

    const combinedRecords = [...mappedFinance, ...mappedSessions];

    // 6. Calculate stats
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

    // Calculate payments status counts for the selected date only
    let pendingCount = 0;
    let partialCount = 0;
    let paidCount = 0;

    mappedSessions.forEach(s => {
      if (s.type === 'Pending') {
        pendingCount++;
      } else if (s.type === 'Partial') {
        partialCount++;
      } else if (s.type === 'Paid') {
        paidCount++;
      }
    });

    return {
      records: combinedRecords,
      dailyStats: {
        totalIncome: totalDailyIncome,
        totalExpense: totalDailyExpense,
        closingBalance
      },
      systemStats: {
        patientPaymentStats: {
          paidCount,
          partialCount,
          pendingCount
        }
      }
    };
  }

  async getSuperAdminRevenue(query = {}) {
    const { Finance, Branch, Payment, Session, Patient, sequelize } = require('../models');
    const { Op } = require('sequelize');

    // 1. Build date conditions
    let dateCondition = {};
    if (query.period && query.period !== 'all' && query.period !== 'All' && query.period !== 'All Time') {
      const now = new Date();
      let startDate;
      if (query.period === '1week' || query.period === 'Last 1 Week') {
        startDate = new Date(now.setDate(now.getDate() - 7));
      } else if (query.period === '2weeks' || query.period === 'Last 2 Weeks') {
        startDate = new Date(now.setDate(now.getDate() - 14));
      } else if (query.period === '1month' || query.period === 'Last 1 Month') {
        startDate = new Date(now.setMonth(now.getMonth() - 1));
      } else if (query.period === '2months' || query.period === 'Last 2 Months') {
        startDate = new Date(now.setMonth(now.getMonth() - 2));
      }
      if (startDate) {
        dateCondition = { [Op.gte]: startDate };
      }
    } else if (query.fromDate || query.toDate) {
      dateCondition = {};
      if (query.fromDate && query.toDate) {
        const start = new Date(query.fromDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(query.toDate);
        end.setHours(23, 59, 59, 999);
        dateCondition[Op.between] = [start, end];
      } else if (query.fromDate) {
        const start = new Date(query.fromDate);
        start.setHours(0, 0, 0, 0);
        dateCondition[Op.gte] = start;
      } else if (query.toDate) {
        const end = new Date(query.toDate);
        end.setHours(23, 59, 59, 999);
        dateCondition[Op.lte] = end;
      }
    }

    const financeWhere = {};
    const sessionWhere = {};

    if (Object.keys(dateCondition).length > 0) {
      financeWhere.date = dateCondition;
      sessionWhere.sessionDate = dateCondition;
    }

    // 2. Build branch conditions
    if (query.branchId && query.branchId !== 'all' && query.branchId !== 'All' && query.branchId !== 'All Branches') {
      financeWhere.branchId = query.branchId;
      sessionWhere.branchId = query.branchId;
    }

    // 3. Conditional fetching flags based on category and type
    let fetchExpenses = true;
    let fetchIncomes = true;
    let fetchSessions = true;

    if (query.type === 'Income') {
      fetchExpenses = false;
    } else if (query.type === 'Expense') {
      fetchIncomes = false;
      fetchSessions = false;
    }

    if (query.category && query.category !== 'all' && query.category !== 'All' && query.category !== 'All Categories') {
      if (query.category === 'Session Fee') {
        fetchIncomes = false;
        fetchExpenses = false;
      } else {
        fetchSessions = false;
        financeWhere.category = query.category;
      }
    }

    // 4. Fetch expense records
    let expenseRecords = [];
    if (fetchExpenses) {
      const expenseWhere = { ...financeWhere, type: { [Op.in]: ['expense', 'EXPENSE'] } };
      expenseRecords = await Finance.findAll({
        where: expenseWhere,
        include: [{ model: Branch, as: 'branch' }]
      });
    }

    // 5. Fetch income records
    let incomeRecords = [];
    if (fetchIncomes) {
      const incomeWhere = { ...financeWhere, type: { [Op.in]: ['income', 'INCOME'] } };
      incomeRecords = await Finance.findAll({
        where: incomeWhere,
        include: [{ model: Branch, as: 'branch' }]
      });
    }

    // 6. Fetch sessions
    let allSessions = [];
    if (fetchSessions) {
      allSessions = await Session.findAll({
        where: sessionWhere,
        include: [
          { model: Patient, as: 'patient', attributes: ['name', 'id'] },
          { model: Branch, as: 'branch', attributes: ['name'] },
          { model: Payment, as: 'payment' }
        ]
      });
    }

    // 7. Map sessions
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

    // 8. Map manual income
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

    // 9. Map manual expenses
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

    // 10. Filter results by status if requested
    let finalSessions = mappedSessions;
    let finalManualIncome = mappedManualIncome;
    let finalExpenses = mappedExpenses;

    if (query.status && query.status !== 'all' && query.status !== 'All' && query.status !== 'All Status') {
      finalSessions = mappedSessions.filter(s => s.type === query.status);
      if (query.status !== 'Paid') {
        finalManualIncome = [];
        finalExpenses = [];
      }
    }

    const combinedRecords = [...finalSessions, ...finalManualIncome, ...finalExpenses];

    const totalIncome = finalManualIncome.reduce((sum, item) => sum + item.amount, 0) +
                        finalSessions.reduce((sum, item) => sum + item.paid, 0);

    const totalExpenses = finalExpenses.reduce((sum, item) => sum + item.amount, 0);

    const totalPending = finalSessions.reduce((sum, item) => sum + item.outstanding, 0);

    const netProfit = totalIncome - totalExpenses;

    // 11. Fetch distinct categories dynamically
    const distinctCategories = await Finance.findAll({
      attributes: [
        [sequelize.fn('DISTINCT', sequelize.col('category')), 'category']
      ],
      raw: true
    });
    
    const dbCategories = distinctCategories
      .map(c => c.category)
      .filter(c => c && c.toLowerCase() !== 'session fee');

    const categories = ['Session Fee', ...dbCategories];

    return {
      records: combinedRecords,
      stats: {
        totalIncome,
        totalExpenses,
        netProfit,
        totalPending
      },
      categories
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

  async getSuperAdminDashboardStats() {
    const { Branch, Patient, Healer, Visitor, Session, Finance, Payment, sequelize } = require('../models');
    const { Op } = require('sequelize');
    const todayStr = new Date().toISOString().split('T')[0];

    // 1. Total Branches
    const totalBranches = await Branch.count();

    // 2. Total Patients
    const totalPatients = await Patient.count();

    // 3. Healer Count
    const healerCount = await Healer.count();

    // 4. Daily Visitors
    const dailyVisitors = await Visitor.count({
      where: sequelize.where(
        sequelize.fn('DATE', sequelize.col('created_at')),
        todayStr
      )
    });

    // 5. Active Sessions
    const activeSessions = await Session.count({
      where: {
        status: {
          [Op.in]: ['Scheduled', 'In Progress', 'scheduled', 'in progress', 'in_progress', 'IN PROGRESS', 'SCHEDULED']
        }
      }
    });

    // 6. Today's Consolidated Income and Expense
    // Daily manual income
    const manualIncomeToday = parseFloat(await Finance.sum('amount', {
      where: {
        type: {
          [Op.in]: ['income', 'Income', 'INCOME']
        },
        [Op.and]: [
          sequelize.where(sequelize.fn('DATE', sequelize.col('date')), todayStr)
        ]
      }
    })) || 0;

    // Daily payment income
    const paymentsToday = parseFloat(await Payment.sum('amount', {
      where: sequelize.where(
        sequelize.fn('DATE', sequelize.col('payment_date')),
        todayStr
      )
    })) || 0;

    const totalDailyIncome = manualIncomeToday + paymentsToday;

    // Daily expense
    const totalDailyExpense = parseFloat(await Finance.sum('amount', {
      where: {
        type: {
          [Op.in]: ['expense', 'Expense', 'EXPENSE']
        },
        [Op.and]: [
          sequelize.where(sequelize.fn('DATE', sequelize.col('date')), todayStr)
        ]
      }
    })) || 0;

    // 7. Weekly Consolidated Comparison data (for the chart)
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

    const financeRecords = await Finance.findAll({
      where: {
        date: {
          [Op.between]: [startOfPrevWeek, endOfThisWeek]
        }
      }
    });

    const paymentRecords = await Payment.findAll({
      where: {
        paymentDate: {
          [Op.between]: [startOfPrevWeek, endOfThisWeek]
        }
      }
    });

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

    return {
      totalBranches,
      totalPatients,
      healerCount,
      dailyVisitors,
      activeSessions,
      totalDailyIncome,
      totalDailyExpense,
      weeklyFinanceData
    };
  }

  async getWeeklyFinance(weekOffset) {
    const { Finance, Branch, Payment, Session, Patient, sequelize } = require('../models');
    const { Op } = require('sequelize');

    const today = new Date();
    const currentDay = today.getDay();
    const distanceToMonday = currentDay === 0 ? -6 : 1 - currentDay;

    const startOfThisWeek = new Date(today);
    startOfThisWeek.setDate(today.getDate() + distanceToMonday + (weekOffset * 7));
    startOfThisWeek.setHours(0, 0, 0, 0);

    const endOfThisWeek = new Date(startOfThisWeek);
    endOfThisWeek.setDate(startOfThisWeek.getDate() + 6);
    endOfThisWeek.setHours(23, 59, 59, 999);

    const formatDate = (date) => {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const day = String(date.getDate()).padStart(2, '0');
      const month = months[date.getMonth()];
      const year = date.getFullYear();
      return `${day}-${month}-${year}`;
    };

    const weekRange = `${formatDate(startOfThisWeek)} to ${formatDate(endOfThisWeek)}`;

    // Query manual Finance (income/expense)
    const financeRecords = await Finance.findAll({
      where: {
        date: {
          [Op.between]: [startOfThisWeek, endOfThisWeek]
        }
      }
    });

    // Query patient Payments
    const paymentRecords = await Payment.findAll({
      where: {
        paymentDate: {
          [Op.between]: [startOfThisWeek, endOfThisWeek]
        }
      }
    });

    // Query Sessions (for matching patients/branches if needed, and satisfying data source requirement)
    const sessions = await Session.findAll({
      where: {
        sessionDate: {
          [Op.between]: [
            startOfThisWeek.toISOString().split('T')[0],
            endOfThisWeek.toISOString().split('T')[0]
          ]
        }
      },
      include: [
        { model: Patient, as: 'patient' },
        { model: Branch, as: 'branch' }
      ]
    });

    const weeklyFinanceData = [
      { day: 'Mon', income: 0, expense: 0 },
      { day: 'Tue', income: 0, expense: 0 },
      { day: 'Wed', income: 0, expense: 0 },
      { day: 'Thu', income: 0, expense: 0 },
      { day: 'Fri', income: 0, expense: 0 },
      { day: 'Sat', income: 0, expense: 0 },
      { day: 'Sun', income: 0, expense: 0 },
    ];

    const getDayIndex = (d) => {
      const day = d.getDay();
      return day === 0 ? 6 : day - 1;
    };

    financeRecords.forEach(r => {
      const amt = parseFloat(r.amount) || 0;
      const type = (r.type || '').toLowerCase();
      const recordDate = new Date(r.date);
      const dayIdx = getDayIndex(recordDate);

      if (dayIdx >= 0 && dayIdx < 7) {
        if (type === 'income') {
          weeklyFinanceData[dayIdx].income += amt;
        } else if (type === 'expense') {
          weeklyFinanceData[dayIdx].expense += amt;
        }
      }
    });

    paymentRecords.forEach(p => {
      const amt = parseFloat(p.amount) || 0;
      const recordDate = new Date(p.paymentDate);
      const dayIdx = getDayIndex(recordDate);

      if (dayIdx >= 0 && dayIdx < 7) {
        weeklyFinanceData[dayIdx].income += amt;
      }
    });

    // Calculate totals for summary cards based on the selected week
    const totalWeeklyIncome = weeklyFinanceData.reduce((sum, d) => sum + d.income, 0);
    const totalWeeklyExpense = weeklyFinanceData.reduce((sum, d) => sum + d.expense, 0);

    return {
      weekRange,
      totalIncome: totalWeeklyIncome,
      totalExpense: totalWeeklyExpense,
      weeklyFinanceData
    };
  }
}

module.exports = new FinanceService();
