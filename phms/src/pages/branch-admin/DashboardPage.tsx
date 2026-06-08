import React, { useState, useEffect } from 'react';
import {
  IonPage,
  IonContent,
  IonHeader,
  IonToolbar,
  IonButtons,
  IonMenuButton,
  IonIcon,
  IonModal,
  IonTitle,
  IonButton,
} from '@ionic/react';
import {
  notificationsOutline,
  helpCircleOutline,
  cashOutline,
  peopleOutline,
  personOutline,
  medkitOutline,
  alertCircleOutline,
  shieldCheckmarkOutline,
  trendingUpOutline,
  arrowForwardOutline,
} from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { ROUTES } from '../../constants/routes.constant';
import { useAuthStore } from '../../store/auth.store';
import { getVisitorLog } from '../../api/visitor.api';
import { getPatients } from '../../api/patient.api';
import { getHealers } from '../../api/healer.api';
import '../super-admin/super-admin.css';
import './branch-admin.css';

interface Transaction {
  id: string;
  type: 'Income' | 'Expense';
  amount: number;
  category: string;
  date: string;
  method: 'UPI' | 'Cash' | 'Card' | 'Bank Transfer';
}

interface Visitor {
  id: string;
  name: string;
  type: 'Walk-in' | 'Meditation' | 'Session' | 'Camp' | 'Healer';
  checkIn: string;
  checkOut?: string;
  status: 'Inside' | 'Completed';
}

interface PatientLog {
  id: string;
  name: string;
  healer: string;
  treatment: string;
  regDate: string;
  status: 'Active' | 'Inactive' | 'On Hold' | 'Completed';
}

interface Payment {
  invoiceId: string;
  patientName: string;
  sessionRef: string;
  totalAmount: number;
  paidAmount: number;
  outstandingBalance: number;
  status: 'Paid' | 'Pending' | 'Partial';
  date: string;
  method?: 'UPI' | 'Cash' | 'Card' | 'Bank Transfer';
}

interface Healer {
  name: string;
  certificationLevel: string;
  specialization: string;
  activePatientsCount: number;
  cumulativeHealingCount: number;
  sessionsPendingNotes: number;
}

interface WorkerAttendance {
  id: string;
  name: string;
  role: string;
  checkIn: string;
  checkOut: string;
  status: 'Present' | 'Absent' | 'Half Day';
}

const DashboardPage: React.FC = () => {
  const history = useHistory();
  const { user } = useAuthStore();

  const isBranchAdmin = user?.role === 'BRANCH_ADMIN';

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [showAddTransactionModal, setShowAddTransactionModal] = useState<boolean>(false);
  const [showMarkAttendanceModal, setShowMarkAttendanceModal] = useState<boolean>(false);

  // States with Mock Data
  const [transactions, setTransactions] = useState<Transaction[]>([
    { id: '#TXN-7721', type: 'Income', amount: 1500, category: 'Healing Session Fee', date: '2026-05-26', method: 'UPI' },
    { id: '#TXN-7722', type: 'Expense', amount: 800, category: 'Incense Oils & Supplies', date: '2026-05-26', method: 'Cash' },
    { id: '#TXN-7723', type: 'Income', amount: 2500, category: 'Meditation Course Registry', date: '2026-05-26', method: 'Card' },
    { id: '#TXN-7724', type: 'Income', amount: 1200, category: 'Chakra Balancing Fee', date: '2026-05-25', method: 'UPI' },
    { id: '#TXN-7725', type: 'Expense', amount: 1500, category: 'Facility Utility Maintenance', date: '2026-05-25', method: 'Bank Transfer' },
  ]);

  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [patients, setPatients] = useState<PatientLog[]>([]);
  const [payments, setPayments] = useState<Payment[]>([
    { invoiceId: '#INV-9021', patientName: 'Sarah Mitchell', sessionRef: '#SES-301', totalAmount: 1500, paidAmount: 1500, outstandingBalance: 0, status: 'Paid', date: '2026-05-26', method: 'UPI' },
    { invoiceId: '#INV-9022', patientName: 'John Walker', sessionRef: '#SES-202', totalAmount: 2500, paidAmount: 1000, outstandingBalance: 1500, status: 'Partial', date: '2026-05-25', method: 'Cash' },
    { invoiceId: '#INV-9023', patientName: 'Elena Rostova', sessionRef: '#SES-302', totalAmount: 1200, paidAmount: 0, outstandingBalance: 1200, status: 'Pending', date: '2026-05-24' },
    { invoiceId: '#INV-9024', patientName: 'Karan Malhotra', sessionRef: '#SES-303', totalAmount: 1800, paidAmount: 1800, outstandingBalance: 0, status: 'Paid', date: '2026-05-26', method: 'Card' },
  ]);
  const [healersList, setHealersList] = useState<Healer[]>([]);

  const [workerAttendanceList, setWorkerAttendanceList] = useState<WorkerAttendance[]>([
    { id: '#WRK-001', name: 'Sanjay M.', role: 'Senior Healer', checkIn: '08:50 AM', checkOut: '05:30 PM', status: 'Present' },
    { id: '#WRK-002', name: 'Rekha D.', role: 'Associate Healer', checkIn: '09:10 AM', checkOut: '01:00 PM', status: 'Half Day' },
    { id: '#WRK-003', name: 'Amit Verma', role: 'Center Coordinator', checkIn: '08:45 AM', checkOut: '06:00 PM', status: 'Present' },
    { id: '#WRK-004', name: 'Priya Nair', role: 'Front Desk Receptionist', checkIn: '--', checkOut: '--', status: 'Absent' },
  ]);

  // Form states
  const [newTxn, setNewTxn] = useState({ type: 'Income' as 'Income' | 'Expense', amount: 1000, category: 'General fee', method: 'UPI' as any });
  const [attendanceWorker, setAttendanceWorker] = useState({ name: 'Sanjay M.', status: 'Present' as any });

  const weeklyFinanceData = [
    { day: 'Mon', current: { income: 12000, expense: 4500 }, previous: { income: 10500, expense: 5000 } },
    { day: 'Tue', current: { income: 15500, expense: 6200 }, previous: { income: 14000, expense: 5500 } },
    { day: 'Wed', current: { income: 10800, expense: 7100 }, previous: { income: 12000, expense: 6800 } },
    { day: 'Thu', current: { income: 14200, expense: 5800 }, previous: { income: 13500, expense: 6000 } },
    { day: 'Fri', current: { income: 18000, expense: 4900 }, previous: { income: 16000, expense: 5200 } },
    { day: 'Sat', current: { income: 16500, expense: 3200 }, previous: { income: 15000, expense: 3500 } },
    { day: 'Sun', current: { income: 9500, expense: 2100 }, previous: { income: 8000, expense: 2500 } },
  ];

  const maxVal = 20000;
  const scale = 180 / maxVal;

  const userInitials = user
    ? `${user.name?.[0] || user.firstName?.[0] || 'B'}${user.name?.split(' ')?.[1]?.[0] || user.lastName?.[0] || 'A'}`.toUpperCase()
    : 'BA';

  // Format today's date
  const today = new Date();
  const options: Intl.DateTimeFormatOptions = { month: 'long', day: 'numeric', year: 'numeric' };
  const formattedDate = today.toLocaleDateString('en-US', options);

  // Fetch dynamic data for Dashboard
  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        const [visRes, patRes, healRes] = await Promise.all([
          getVisitorLog(),
          getPatients(),
          getHealers()
        ]);
        
        // Ensure today's visitors are calculated properly or just pass them raw
        // The stat logic uses .length so the exact schema map isn't fully required for counts,
        // but it expects checkout as boolean logic in some places:
        const mappedVis = (visRes.data || []).map((v: any) => ({ ...v, status: v.checkOut ? 'Completed' : 'Inside' }));

        setVisitors(mappedVis);
        setPatients(patRes.data || []);
        setHealersList(healRes.data || []);
      } catch (e) {
        console.error('Failed to fetch dashboard data:', e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  // Calculated Core Analytics Metrics
  const totalIncomeToday = transactions.filter(t => t.type === 'Income' && t.date === '2026-05-26').reduce((sum, t) => sum + t.amount, 0);
  const totalExpenseToday = transactions.filter(t => t.type === 'Expense' && t.date === '2026-05-26').reduce((sum, t) => sum + t.amount, 0);
  const netBalanceToday = totalIncomeToday - totalExpenseToday;
  
  const todayStr = new Date().toLocaleDateString('en-CA');
  // For patients, assuming 'createdAt' from the real DB gives the registration date
  const newPatientsCount = patients.filter(p => p.createdAt && new Date(p.createdAt as any).toLocaleDateString('en-CA') === todayStr).length;
  // If 'status' is different from the mock ('Active' vs 'active'), we handle it safely:
  const activeCasesCount = patients.filter(p => p.status === 'Active' || p.status === 'active').length;

  const pendingPaymentsCount = payments.filter(p => p.status === 'Pending' || p.status === 'Partial').length;
  const activeHealersCount = healersList.length;

  const presentWorkersCount = workerAttendanceList.filter(w => w.status === 'Present').length;
  const absentWorkersCount = workerAttendanceList.filter(w => w.status === 'Absent').length;
  const halfDayWorkersCount = workerAttendanceList.filter(w => w.status === 'Half Day').length;

  const handleAddTxnSubmit = () => {
    const txn: Transaction = {
      id: `#TXN-${Math.floor(7000 + Math.random() * 999)}`,
      type: newTxn.type,
      amount: Number(newTxn.amount),
      category: newTxn.category,
      date: '2026-05-26',
      method: newTxn.method,
    };
    setTransactions([txn, ...transactions]);

    if (newTxn.type === 'Income') {
      const pay: Payment = {
        invoiceId: `#INV-${Math.floor(9000 + Math.random() * 999)}`,
        patientName: 'Walk-in Patient',
        sessionRef: 'Walk-in Session',
        totalAmount: Number(newTxn.amount),
        paidAmount: Number(newTxn.amount),
        outstandingBalance: 0,
        status: 'Paid',
        date: '2026-05-26',
        method: newTxn.method,
      };
      setPayments([pay, ...payments]);
    }

    setShowAddTransactionModal(false);
    alert('Transaction committed to branch financial ledger successfully!');
  };

  const handleMarkAttendanceSubmit = () => {
    const updated = workerAttendanceList.map(w => 
      w.name === attendanceWorker.name ? { ...w, status: attendanceWorker.status, checkIn: attendanceWorker.status === 'Absent' ? '--' : '09:00 AM' } : w
    );
    setWorkerAttendanceList(updated);

    setShowMarkAttendanceModal(false);
    alert(`Attendance marked successfully: ${attendanceWorker.name} set to [${attendanceWorker.status}]`);
  };

  if (!isBranchAdmin) {
    return (
      <IonPage className="sa-page">
        <IonContent className="sa-page__content" fullscreen>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '20px' }}>
            <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '32px', maxWidth: '480px', textAlign: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
              <div style={{ color: '#ef4444', fontSize: '48px', marginBottom: '16px' }}>
                <IonIcon icon={alertCircleOutline} />
              </div>
              <h2 style={{ fontSize: '20px', fontWeight: 'bold', margin: '0 0 10px 0', color: '#1e293b' }}>Unauthorized Access</h2>
              <p style={{ color: '#64748b', fontSize: '14px', lineHeight: 1.5, margin: 0 }}>
                Access Denied. The Branch Admin Dashboard is restricted exclusively to authorized Branch Admin users. You do not possess the required credentials to access this branch operational node.
              </p>
            </div>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage className="sa-page">
      <IonHeader className="ion-no-border">
        <IonToolbar className="sa-page__toolbar">
          <IonButtons slot="start">
            <IonMenuButton />
          </IonButtons>
          <IonTitle className="sa-page__toolbar-title">Branch Admin Dashboard</IonTitle>
          <IonButtons slot="end">
            <div className="sa-page__toolbar-actions">
              <IonButton fill="clear">
                <IonIcon icon={notificationsOutline} />
              </IonButton>
              <div className="sa-page__toolbar-avatar">{userInitials}</div>
            </div>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent className="sa-page__content">
        <div className="sa-page__body">
          {/* Subtitle */}
          <p className="sa-page__subtitle" style={{ marginBottom: 20 }}>
            Real-time daily operations node • {formattedDate}
          </p>

          {isLoading ? (
            <div className="sa-section">
              <div className="sa-chart-placeholder" style={{ height: '100px' }}>Loading...</div>
            </div>
          ) : (
            <>
              {/* Stat Cards - Row 1: 4 cards */}
              <div className="sa-stats sa-stats--4">
                {/* Daily Income */}
                <div className="sa-stat-card">
                  <div>
                    <div className="sa-stat-card__label">Daily Income</div>
                    <div className="sa-stat-card__value">₹{totalIncomeToday}</div>
                    <div className="sa-stat-card__detail">
                      <IonIcon icon={trendingUpOutline} /> +12.4%
                    </div>
                  </div>
                  <div className="sa-stat-card__icon">
                    <IonIcon icon={cashOutline} style={{ color: '#10b981' }} />
                  </div>
                </div>

                {/* Daily Expense */}
                <div className="sa-stat-card">
                  <div>
                    <div className="sa-stat-card__label">Daily Expense</div>
                    <div className="sa-stat-card__value">₹{totalExpenseToday}</div>
                    <div className="sa-stat-card__detail" style={{ color: '#ef4444' }}>
                      Outflow
                    </div>
                  </div>
                  <div className="sa-stat-card__icon">
                    <IonIcon icon={cashOutline} style={{ color: '#ef4444' }} />
                  </div>
                </div>

                {/* Net Balance */}
                <div className="sa-stat-card">
                  <div>
                    <div className="sa-stat-card__label">Net Balance</div>
                    <div className="sa-stat-card__value" style={{ color: netBalanceToday >= 0 ? '#10b981' : '#ef4444' }}>
                      ₹{netBalanceToday}
                    </div>
                    <div className="sa-stat-card__detail">
                      Optimal
                    </div>
                  </div>
                  <div className="sa-stat-card__icon">
                    <IonIcon icon={shieldCheckmarkOutline} style={{ color: '#0d5c46' }} />
                  </div>
                </div>

                {/* Today's Visitor Count */}
                <div className="sa-stat-card">
                  <div>
                    <div className="sa-stat-card__label">Today Visitors</div>
                    <div className="sa-stat-card__value">{visitors.length}</div>
                    <div className="sa-stat-card__detail">
                      {visitors.filter(v => v.status === 'Inside').length} Inside
                    </div>
                  </div>
                  <div className="sa-stat-card__icon">
                    <IonIcon icon={peopleOutline} style={{ color: '#3b82f6' }} />
                  </div>
                </div>
              </div>

              {/* Stat Cards - Row 2: 3 cards */}
              <div className="sa-stats sa-stats--4">
                {/* Active Patients Count */}
                <div className="sa-stat-card">
                  <div>
                    <div className="sa-stat-card__label">Active Patients</div>
                    <div className="sa-stat-card__value">{activeCasesCount}</div>
                    <div className="sa-stat-card__detail">
                      {newPatientsCount} New today
                    </div>
                  </div>
                  <div className="sa-stat-card__icon">
                    <IonIcon icon={medkitOutline} style={{ color: '#8b5cf6' }} />
                  </div>
                </div>

                {/* Pending Payments */}
                <div className="sa-stat-card">
                  <div>
                    <div className="sa-stat-card__label">Pending Payments</div>
                    <div className="sa-stat-card__value" style={{ color: '#f59e0b' }}>{pendingPaymentsCount}</div>
                    <div className="sa-stat-card__detail">
                      Unpaid/Partials
                    </div>
                  </div>
                  <div className="sa-stat-card__icon">
                    <IonIcon icon={cashOutline} style={{ color: '#f59e0b' }} />
                  </div>
                </div>

                {/* Active Healers */}
                <div className="sa-stat-card">
                  <div>
                    <div className="sa-stat-card__label">Active Healers</div>
                    <div className="sa-stat-card__value">{activeHealersCount}</div>
                    <div className="sa-stat-card__detail">
                      On Duty
                    </div>
                  </div>
                  <div className="sa-stat-card__icon">
                    <IonIcon icon={personOutline} style={{ color: '#06b6d4' }} />
                  </div>
                </div>
              </div>

              {/* Grid 2 Column Layout */}
              <div className="sa-grid-2" style={{ alignItems: 'stretch' }}>
                {/* Left Column */}
                <div>
                  {/* Weekly Comparison Section */}
                  <div className="sa-section">
                    <div className="sa-section__header">
                      <div>
                        <h2 className="sa-section__title">Weekly Comparison</h2>
                        <p className="sa-section__subtitle">This Week vs Previous Week (Income &amp; Expenses)</p>
                      </div>
                    </div>

                    <div className="sa-finance-grid">
                      <div className="sa-finance-card">
                        <div className="sa-finance-card__label">Total This Week Income</div>
                        <div className="sa-finance-card__value" style={{ color: '#0D5C46', fontSize: '28px' }}>₹85,500</div>
                      </div>
                      <div className="sa-finance-card">
                        <div className="sa-finance-card__label">Total This Week Expenses</div>
                        <div className="sa-finance-card__value" style={{ color: '#dc2626', fontSize: '28px' }}>₹33,800</div>
                      </div>
                    </div>

                    {/* Weekly Comparison Chart */}
                    <div className="sa-chart-container">
                      <div className="sa-chart-plot-area">
                        {weeklyFinanceData.map((data, i) => (
                          <div className="sa-chart-day-group sa-chart-group" key={i}>
                            <div className="sa-chart-bars-row">
                              {/* Income Pair */}
                              <div className="sa-chart-bar-pair">
                                <div 
                                  className="sa-chart-bar sa-chart-bar--income-prev" 
                                  style={{ height: `${data.previous.income * scale}px` }} 
                                  title="Prev Week Income"
                                />
                                <div 
                                  className="sa-chart-bar sa-chart-bar--income-current" 
                                  style={{ height: `${data.current.income * scale}px` }} 
                                  title="This Week Income"
                                />
                              </div>
                              {/* Expense Pair */}
                              <div className="sa-chart-bar-pair">
                                <div 
                                  className="sa-chart-bar sa-chart-bar--expense-prev" 
                                  style={{ height: `${data.previous.expense * scale}px` }} 
                                  title="Prev Week Expense"
                                />
                                <div 
                                  className="sa-chart-bar sa-chart-bar--expense-current" 
                                  style={{ height: `${data.current.expense * scale}px` }} 
                                  title="This Week Expense"
                                />
                              </div>
                            </div>
                            
                            {/* Comparison Tooltip */}
                            <div className="sa-chart-tooltip">
                              <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.2)', paddingBottom: '4px' }}>
                                {data.day} Comparison
                              </div>
                              <div className="sa-chart-tooltip-grid">
                                <div className="sa-chart-tooltip-section">
                                  <div className="sa-chart-tooltip-title">This Week</div>
                                  <div className="sa-chart-tooltip-item">
                                    <div className="sa-chart-tooltip-dot" style={{ background: '#10b981' }} />
                                    <span>₹{data.current.income.toLocaleString()}</span>
                                  </div>
                                  <div className="sa-chart-tooltip-item">
                                    <div className="sa-chart-tooltip-dot" style={{ background: '#ef4444' }} />
                                    <span>₹{data.current.expense.toLocaleString()}</span>
                                  </div>
                                </div>
                                <div className="sa-chart-tooltip-section">
                                  <div className="sa-chart-tooltip-title">Prev Week</div>
                                  <div className="sa-chart-tooltip-item">
                                    <div className="sa-chart-tooltip-dot" style={{ background: '#a7f3d0' }} />
                                    <span>₹{data.previous.income.toLocaleString()}</span>
                                  </div>
                                  <div className="sa-chart-tooltip-item">
                                    <div className="sa-chart-tooltip-dot" style={{ background: '#fecaca' }} />
                                    <span>₹{data.previous.expense.toLocaleString()}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="sa-chart-x-axis">
                        {weeklyFinanceData.map((data, i) => (
                          <div key={i} className="sa-chart-day-group">
                            <span className="sa-chart-label">{data.day}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Today's Visitors Table */}
                  {/* <div className="sa-section" style={{ padding: 0, overflow: 'hidden' }}>
                    <div className="sa-section__header" style={{ padding: '24px 24px 12px 24px' }}>
                      <div>
                        <h2 className="sa-section__title">Today's Visitors</h2>
                        <p className="sa-section__subtitle">Live footfall logs at branch</p>
                      </div>
                      <button className="sa-btn sa-btn--outline sa-btn--sm" onClick={() => history.push(ROUTES.BRANCH_ADMIN.VISITOR_LOG)}>
                        View All Visitor Logs
                      </button>
                    </div>
                    <table className="sa-table">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Name</th>
                          <th>Purpose</th>
                          <th>Check-In</th>
                          <th>Check-Out</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {visitors.map((visitor) => (
                          <tr key={visitor.id}>
                            <td>{visitor.id}</td>
                            <td style={{ fontWeight: 600 }}>{visitor.name}</td>
                            <td>{visitor.type}</td>
                            <td>{visitor.checkIn}</td>
                            <td>{visitor.checkOut || '--'}</td>
                            <td>
                              <span className={`sa-badge sa-badge--${visitor.status === 'Inside' ? 'active' : 'inactive'}`}>
                                {visitor.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div> */}
                </div>

                {/* Right Column */}
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {/* Portal Sidebar */}
                  <div className="sa-quick-actions" style={{ background: '#0D5C46', borderRadius: '12px', padding: '24px', color: 'white', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <h3 className="sa-quick-actions__title">Branch Admin Portal</h3>
                    
                    <div className="sa-quick-action" onClick={() => history.push(ROUTES.BRANCH_ADMIN.CREATE_HEALER)}>
                      <span className="sa-quick-action__label">Create Healers</span>
                      <IonIcon icon={arrowForwardOutline} className="sa-quick-action__icon" />
                    </div>

                    <div className="sa-quick-action" onClick={() => history.push(ROUTES.BRANCH_ADMIN.REGISTER_PATIENT)}>
                      <span className="sa-quick-action__label">Register Patient</span>
                      <IonIcon icon={arrowForwardOutline} className="sa-quick-action__icon" />
                    </div>

                    <div className="sa-quick-action" onClick={() => history.push(ROUTES.BRANCH_ADMIN.VISITOR_LOG)}>
                      <span className="sa-quick-action__label">Log Check-In</span>
                      <IonIcon icon={arrowForwardOutline} className="sa-quick-action__icon" />
                    </div>
                    
                    <div className="sa-quick-action" onClick={() => history.push(ROUTES.BRANCH_ADMIN.ATTENDANCE)}>
                      <span className="sa-quick-action__label">Mark Attendance</span>
                      <IonIcon icon={arrowForwardOutline} className="sa-quick-action__icon" />
                    </div>
                  </div>

                  {/* System Restrictions */}
                  {/* <div className="sa-section" style={{ background: '#f8fafc' }}>
                    <h4 style={{ margin: '0 0 8px 0', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--color-text-secondary)', fontWeight: 800 }}>
                      SYSTEM RESTRICTIONS
                    </h4>
                    <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', lineHeight: 1.5, margin: 0 }}>
                      Access scoped strictly to assignments. Unauthorized cross-tenant modifications are blocked and audited automatically under HIPAA compliance.
                    </p>
                  </div> */}
                </div>
              </div>
            </>
          )}
        </div>
      </IonContent>

      {/* Floating Action FAB triggers */}
      {/* <div className="db-hc-fab-container">
        <button className="db-hc-fab-btn" title="Add Transaction" onClick={() => setShowAddTransactionModal(true)}>
          <IonIcon icon={cashOutline} />
        </button>
        <button className="db-hc-fab-btn" title="Check-In Visitor" onClick={() => history.push(ROUTES.BRANCH_ADMIN.VISITOR_CHECKIN)}>
          <IonIcon icon={peopleOutline} />
        </button>
      </div> */}

      {/* =========================================================================
          MODALS INTEGRATIONS
          ========================================================================= */}
      {/* 1. Add Transaction */}
      <IonModal isOpen={showAddTransactionModal} onDidDismiss={() => setShowAddTransactionModal(false)} className="sa-modal sa-modal--sm">
        <div className="sa-modal__content">
          <div className="sa-modal__header">
            <h2>Record Transaction Inflow</h2>
            <button className="sa-modal__close-btn" onClick={() => setShowAddTransactionModal(false)}>×</button>
          </div>
          <div className="sa-modal__body">
            <div className="sa-settings__form-group">
              <label className="sa-settings__label">TRANSACTION TYPE</label>
              <select className="sa-settings__input" value={newTxn.type} onChange={(e) => setNewTxn({ ...newTxn, type: e.target.value as any })}>
                <option value="Income">Income Inflow</option>
                <option value="Expense">Expense Outflow</option>
              </select>
            </div>

            <div className="sa-settings__form-group">
              <label className="sa-settings__label">TRANSACTION AMOUNT (INR) *</label>
              <input type="number" className="sa-settings__input" value={newTxn.amount} onChange={(e) => setNewTxn({ ...newTxn, amount: Number(e.target.value) })} />
            </div>

            <div className="sa-settings__form-group">
              <label className="sa-settings__label">CATEGORY / PURPOSE</label>
              <input type="text" className="sa-settings__input" placeholder="e.g. Session Fee" value={newTxn.category} onChange={(e) => setNewTxn({ ...newTxn, category: e.target.value })} />
            </div>

            <div className="sa-settings__form-group">
              <label className="sa-settings__label">PAYMENT METHOD</label>
              <select className="sa-settings__input" value={newTxn.method} onChange={(e) => setNewTxn({ ...newTxn, method: e.target.value as any })}>
                <option value="UPI">UPI Online</option>
                <option value="Cash">Cash</option>
                <option value="Card">Card</option>
                <option value="Bank Transfer">Bank Transfer</option>
              </select>
            </div>
          </div>
          <div className="sa-modal__footer">
            <button className="sa-btn sa-btn--outline" onClick={() => setShowAddTransactionModal(false)}>Cancel</button>
            <button className="sa-btn sa-btn--primary" onClick={handleAddTxnSubmit}>Commit transaction</button>
          </div>
        </div>
      </IonModal>

      {/* 2. Mark Attendance */}
      <IonModal isOpen={showMarkAttendanceModal} onDidDismiss={() => setShowMarkAttendanceModal(false)} className="sa-modal sa-modal--sm">
        <div className="sa-modal__content">
          <div className="sa-modal__header">
            <h2>Mark Roster Attendance</h2>
            <button className="sa-modal__close-btn" onClick={() => setShowMarkAttendanceModal(false)}>×</button>
          </div>
          <div className="sa-modal__body">
            <div className="sa-settings__form-group">
              <label className="sa-settings__label">WORKER NAME</label>
              <select className="sa-settings__input" value={attendanceWorker.name} onChange={(e) => setAttendanceWorker({ ...attendanceWorker, name: e.target.value })}>
                <option value="Sanjay M.">Sanjay M.</option>
                <option value="Rekha D.">Rekha D.</option>
              </select>
            </div>

            <div className="sa-settings__form-group">
              <label className="sa-settings__label">ATTENDANCE STATUS</label>
              <select className="sa-settings__input" value={attendanceWorker.status} onChange={(e) => setAttendanceWorker({ ...attendanceWorker, status: e.target.value as any })}>
                <option value="Present">Present</option>
                <option value="Half Day">Half Day</option>
                <option value="Absent">Absent</option>
              </select>
            </div>
          </div>
          <div className="sa-modal__footer">
            <button className="sa-btn sa-btn--outline" onClick={() => setShowMarkAttendanceModal(false)}>Cancel</button>
            <button className="sa-btn sa-btn--primary" onClick={handleMarkAttendanceSubmit}>Commit Attendance</button>
          </div>
        </div>
      </IonModal>
    </IonPage>
  );
};

export default DashboardPage;
