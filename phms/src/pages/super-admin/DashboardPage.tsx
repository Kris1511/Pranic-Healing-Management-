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
import { getBranches } from '../../api/branch.api';
import { getPatients } from '../../api/patient.api';
import { getHealers } from '../../api/healer.api';
import { getVisitorLog } from '../../api/visitor.api';
import './super-admin.css';

const DashboardPage: React.FC = () => {
  const history = useHistory();
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [branchesCount, setBranchesCount] = useState(0);
  const [patientsCount, setPatientsCount] = useState(0);
  const [healersCount, setHealersCount] = useState(0);
  const [visitorsCount, setVisitorsCount] = useState(0);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [branches, patients, healers, visitors] = await Promise.all([
          getBranches(),
          getPatients(),
          getHealers(),
          getVisitorLog()
        ]);

        if (branches && branches.data) setBranchesCount(branches.data.length || 0);
        else if (Array.isArray(branches)) setBranchesCount(branches.length);

        if (patients && patients.data) setPatientsCount(patients.data.length || 0);
        else if (Array.isArray(patients)) setPatientsCount(patients.length);

        if (healers && healers.data) setHealersCount(healers.data.length || 0);
        else if (Array.isArray(healers)) setHealersCount(healers.length);

        if (visitors && visitors.data) setVisitorsCount(visitors.data.length || 0);
        else if (Array.isArray(visitors)) setVisitorsCount(visitors.length);

      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      }
    };
    fetchDashboardData();
  }, []);

  const stats = [
    { label: 'Total Branches', value: branchesCount.toString(), detail: 'Across all regions', icon: businessOutline, route: ROUTES.SUPER_ADMIN.BRANCHES },
    { label: 'Total Patients', value: patientsCount.toString(), detail: 'Organization-wide', icon: peopleOutline, route: ROUTES.SUPER_ADMIN.PATIENTS },
    { label: 'Healer Count', value: healersCount.toString(), detail: 'Certified practitioners', icon: medkitOutline, route: ROUTES.SUPER_ADMIN.HEALERS },
    { label: 'Daily Visitors', value: visitorsCount.toString(), detail: "Today's footfall", icon: eyeOutline, route: ROUTES.SUPER_ADMIN.VISITOR_LOG },
    { label: 'Active Sessions', value: '142', detail: 'Live now', icon: flashOutline, route: '#', accentColor: '#ff9f00', trendColor: '#ff9f00' },
  ];

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
            Monitoring {branchesCount} sanctuaries across the organization.
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
                <button className="sa-btn sa-btn--outline sa-btn--sm">View Detailed Report</button>
              </div>

              <div className="sa-finance-grid">
                <div className="sa-finance-card">
                  <div className="sa-finance-card__label">Total Daily Income</div>
                  <div className="sa-finance-card__value">₹8,000</div>
                </div>
                <div className="sa-finance-card">
                  <div className="sa-finance-card__label">Total Daily Expenses</div>
                  <div className="sa-finance-card__value" style={{ color: '#dc2626' }}>₹3,700</div>
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
              <div className="sa-quick-action" onClick={() => setShowReportModal(true)}>
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

      {/* 3. Organization Reports Modal */}
      <IonModal isOpen={showReportModal} onDidDismiss={() => setShowReportModal(false)} className="sa-modal sa-modal--sm">
        <div className="sa-modal__content">
          <div className="sa-modal__header">
            <h2>Generate Quick Report</h2>
            <button className="sa-modal__close-btn" onClick={() => setShowReportModal(false)}>×</button>
          </div>
          <div className="sa-modal__body">
            <div className="sa-settings__form-group">
              <label className="sa-settings__label">Report Type</label>
              <select className="sa-settings__input">
                <option>Financial Summary</option>
                <option>Patient Sessions Volume</option>
                <option>Visitor Logs</option>
                <option>Branch Performance Comparison</option>
              </select>
            </div>
            <div className="sa-settings__form-group">
              <label className="sa-settings__label">Time Range</label>
              <select className="sa-settings__input">
                <option>Today</option>
                <option>Last 7 Days</option>
                <option>Last 30 Days</option>
                <option>Year to Date</option>
              </select>
            </div>
          </div>
          <div className="sa-modal__footer">
            <button className="sa-btn sa-btn--outline" onClick={() => setShowReportModal(false)}>Cancel</button>
            <button className="sa-btn sa-btn--primary">Generate & Download</button>
          </div>
        </div>
      </IonModal>

    </IonPage>
  );
};

export default DashboardPage;
