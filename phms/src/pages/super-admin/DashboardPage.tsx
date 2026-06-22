import React, { useState, useEffect } from 'react';
import {
  IonPage,
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonIcon,
  IonMenuButton,
  IonModal,
} from '@ionic/react';
import {
  notificationsOutline,
  businessOutline,
  peopleOutline,
  flashOutline,
  medkitOutline,
  eyeOutline,
  trendingUpOutline,
  addCircleOutline,
  peopleCircleOutline,
  gridOutline,
  chevronForwardOutline,
} from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { ROUTES } from '../../constants/routes.constant';
import { getSuperAdminDashboardStats, getSuperAdminWeeklyFinance } from '../../api/finance.api';
import './super-admin.css';

const DashboardPage: React.FC = () => {
  const history = useHistory();
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [weekOffset, setWeekOffset] = useState(0);
  const [weeklyFinance, setWeeklyFinance] = useState<any>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await getSuperAdminDashboardStats();
        if (res?.success && res?.data) {
          setDashboardStats(res.data);
        }
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      }
    };
    fetchDashboardData();

    // Polling interval for live real-time updates
    const interval = setInterval(fetchDashboardData, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchWeeklyData = async () => {
      try {
        const res = await getSuperAdminWeeklyFinance(weekOffset);
        if (res?.success && res?.data) {
          setWeeklyFinance(res.data);
        }
      } catch (error) {
        console.error('Error fetching weekly finance data:', error);
      }
    };
    fetchWeeklyData();

    // Polling interval for live real-time updates of the selected week
    const interval = setInterval(fetchWeeklyData, 3000);
    return () => clearInterval(interval);
  }, [weekOffset]);

  const stats = [
    { label: 'Total Branches', value: (dashboardStats?.totalBranches ?? 0).toString(), detail: 'Across all regions', icon: businessOutline, route: ROUTES.SUPER_ADMIN.BRANCHES },
    { label: 'Total Patients', value: (dashboardStats?.totalPatients ?? 0).toString(), detail: 'Organization-wide', icon: peopleOutline, route: ROUTES.SUPER_ADMIN.PATIENTS },
    { label: 'Healer Count', value: (dashboardStats?.healerCount ?? 0).toString(), detail: 'Certified practitioners', icon: medkitOutline, route: ROUTES.SUPER_ADMIN.HEALERS },
    { label: 'Daily Visitors', value: (dashboardStats?.dailyVisitors ?? 0).toString(), detail: "Today's footfall", icon: eyeOutline, route: ROUTES.SUPER_ADMIN.VISITOR_LOG },
    { label: 'Active Sessions', value: (dashboardStats?.activeSessions ?? 0).toString(), detail: 'Live now', icon: flashOutline, route: '#', accentColor: '#ff9f00', trendColor: '#ff9f00' },
  ];

  const weeklyFinanceData = weeklyFinance?.weeklyFinanceData || [
    { day: 'Mon', income: 0, expense: 0 },
    { day: 'Tue', income: 0, expense: 0 },
    { day: 'Wed', income: 0, expense: 0 },
    { day: 'Thu', income: 0, expense: 0 },
    { day: 'Fri', income: 0, expense: 0 },
    { day: 'Sat', income: 0, expense: 0 },
    { day: 'Sun', income: 0, expense: 0 },
  ];

  const maxVal = Math.max(
    ...weeklyFinanceData.map((d: any) => Math.max(d.income, d.expense)),
    20000
  );
  const scale = 180 / maxVal;

  return (
    <IonPage className="sa-page">
      <IonHeader className="ion-no-border">
        <IonToolbar className="sa-page__toolbar">
          <IonButtons slot="start">
            <IonMenuButton />
          </IonButtons>
          <IonTitle className="sa-page__toolbar-title">Dashboard</IonTitle>
          <IonButtons slot="end">
            <div className="sa-page__toolbar-actions">
              <IonButton fill="clear">
                <IonIcon icon={notificationsOutline} />
              </IonButton>
              <div className="sa-page__toolbar-avatar">AS</div>
            </div>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent className="sa-page__content">
        <div className="sa-page__body">
          {/* Subtitle */}
          <p className="sa-page__subtitle" style={{ marginBottom: 20 }}>
            Monitoring {dashboardStats?.totalBranches ?? 0} sanctuaries across the organization.
          </p>

          {/* Stat Cards */}
          <div className="sa-stats sa-stats--4">
            {stats.map((stat, i) => (
              <div 
                className="sa-stat-card" 
                key={i}
                onClick={() => stat.route !== '#' && history.push(stat.route)}
                style={{ 
                  cursor: stat.route !== '#' ? 'pointer' : 'default',
                  '--stat-card-accent': (stat as any).accentColor || 'var(--color-primary)'
                } as React.CSSProperties}
              >
                <div>
                  <div className="sa-stat-card__label">{stat.label}</div>
                  <div className="sa-stat-card__value">{stat.value}</div>
                  <div className="sa-stat-card__detail">
                    <IonIcon 
                      icon={trendingUpOutline} 
                      style={{ color: (stat as any).trendColor || 'var(--color-primary)' }} 
                    /> {stat.detail}
                  </div>
                </div>
                <div className="sa-stat-card__icon">
                  <IonIcon icon={stat.icon} />
                </div>
              </div>
            ))}
          </div>

          {/* Finance + Quick Actions Grid */}
          <div className="sa-grid-2">
            {/* Finance Section */}
            <div className="sa-section">
              <div className="sa-section__header">
                <div>
                  <h2 className="sa-section__title">Consolidated Daily Finance</h2>
                  <p className="sa-section__subtitle">Income vs Expenses across all branches</p>
                </div>
                <button className="sa-btn sa-btn--outline sa-btn--sm" onClick={() => history.push(ROUTES.SUPER_ADMIN.DAILY_FINANCE)}>View Detailed Report</button>
              </div>

              {/* Weekly Navigation Controls */}
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px', margin: '16px 0', background: 'rgba(var(--color-primary-rgb), 0.05)', padding: '10px', borderRadius: '8px' }}>
                <button 
                  className="sa-btn sa-btn--outline" 
                  style={{ margin: 0, padding: '4px 12px', minHeight: '36px' }}
                  onClick={() => setWeekOffset(prev => prev - 1)}
                >
                  &lt; Previous Week
                </button>
                <span style={{ fontWeight: 600, fontSize: '15px', color: '#374151' }}>
                  Week: {weeklyFinance?.weekRange || 'Loading...'}
                </span>
                <button 
                  className="sa-btn sa-btn--outline" 
                  style={{ margin: 0, padding: '4px 12px', minHeight: '36px' }}
                  onClick={() => setWeekOffset(prev => prev + 1)}
                >
                  Next Week &gt;
                </button>
              </div>

              <div className="sa-finance-grid">
                <div className="sa-finance-card">
                  <div className="sa-finance-card__label">Total Daily Income</div>
                  <div className="sa-finance-card__value">₹{(weeklyFinance?.totalIncome ?? 0).toLocaleString()}</div>
                </div>
                <div className="sa-finance-card">
                  <div className="sa-finance-card__label">Total Daily Expenses</div>
                  <div className="sa-finance-card__value" style={{ color: '#dc2626' }}>₹{(weeklyFinance?.totalExpense ?? 0).toLocaleString()}</div>
                </div>
              </div>

              {/* Weekly Comparison Chart */}
              <div className="sa-chart-container">
                <div className="sa-chart-plot-area">
                  {weeklyFinanceData.map((data: any, i: number) => (
                    <div className="sa-chart-day-group sa-chart-group" key={i}>
                      <div className="sa-chart-bars-row">
                        {/* Income Bar */}
                        <div className="sa-chart-bar-pair">
                          <div 
                            className="sa-chart-bar sa-chart-bar--income-current" 
                            style={{ height: `${data.income * scale}px` }} 
                            title="Daily Income"
                          />
                        </div>
                        {/* Expense Bar */}
                        <div className="sa-chart-bar-pair">
                          <div 
                            className="sa-chart-bar sa-chart-bar--expense-current" 
                            style={{ height: `${data.expense * scale}px`, backgroundColor: '#dc2626' }} 
                            title="Daily Expense"
                          />
                        </div>
                      </div>
                      
                      {/* Details Tooltip */}
                      <div className="sa-chart-tooltip">
                        <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.2)', paddingBottom: '4px' }}>
                          {data.day} Details
                        </div>
                        <div className="sa-chart-tooltip-grid">
                          <div className="sa-chart-tooltip-section">
                            <div className="sa-chart-tooltip-item">
                              <div className="sa-chart-tooltip-dot" style={{ background: '#10b981' }} />
                              <span>Income: ₹{data.income.toLocaleString()}</span>
                            </div>
                            <div className="sa-chart-tooltip-item" style={{ marginTop: '4px' }}>
                              <div className="sa-chart-tooltip-dot" style={{ background: '#ef4444' }} />
                              <span>Expense: ₹{data.expense.toLocaleString()}</span>
                            </div>
                            <div className="sa-chart-tooltip-item" style={{ marginTop: '8px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '4px', fontWeight: 600 }}>
                              <span>Net: ₹{(data.income - data.expense).toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="sa-chart-x-axis">
                  {weeklyFinanceData.map((data: any, i: number) => (
                    <div key={i} className="sa-chart-day-group">
                      <span className="sa-chart-label">{data.day}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="sa-quick-actions">
              <h3 className="sa-quick-actions__title">Super Admin Portal</h3>
              <div className="sa-quick-action" onClick={() => history.push(ROUTES.SUPER_ADMIN.CREATE_BRANCH)}>
                <span className="sa-quick-action__label">Create New Branch</span>
                <IonIcon icon={addCircleOutline} className="sa-quick-action__icon" />
              </div>
              <div className="sa-quick-action" onClick={() => history.push(ROUTES.SUPER_ADMIN.CREATE_BRANCH_ADMIN)}>
                <span className="sa-quick-action__label">Create Branch Admins</span>
                <IonIcon icon={peopleCircleOutline} className="sa-quick-action__icon" />
              </div>
              <div className="sa-quick-action" onClick={() => history.push(ROUTES.SUPER_ADMIN.REPORTS)}>
                <span className="sa-quick-action__label">Organization Reports</span>
                <IonIcon icon={gridOutline} className="sa-quick-action__icon" />
              </div>
            </div>
          </div>
        </div>
      </IonContent>

      {/* MODALS */}
      


      {/* 2. Manage Branch Admins Modal */}
      <IonModal isOpen={showAdminModal} onDidDismiss={() => setShowAdminModal(false)} className="sa-modal">
        <div className="sa-modal__content">
          <div className="sa-modal__header">
            <h2>Assign Branch Admin</h2>
            <button className="sa-modal__close-btn" onClick={() => setShowAdminModal(false)}>×</button>
          </div>
          <div className="sa-modal__body">
            <p className="sa-modal__desc">Assign an existing staff member to manage a sanctuary branch.</p>
            <div className="sa-settings__form-group">
              <label className="sa-settings__label">Select Branch</label>
              <select className="sa-settings__input">
                <option>Uptown Sanctuary</option>
                <option>Coastal Healing Center</option>
                <option>Green Valley Branch</option>
              </select>
            </div>
            <div className="sa-settings__form-group">
              <label className="sa-settings__label">Select Admin User</label>
              <select className="sa-settings__input">
                <option>John Admin</option>
                <option>Sarah Admin</option>
                <option>Elena Thorne</option>
              </select>
            </div>
          </div>
          <div className="sa-modal__footer">
            <button className="sa-btn sa-btn--outline" onClick={() => setShowAdminModal(false)}>Cancel</button>
            <button className="sa-btn sa-btn--primary">Assign Admin</button>
          </div>
        </div>
      </IonModal>



    </IonPage>
  );
};

export default DashboardPage;
