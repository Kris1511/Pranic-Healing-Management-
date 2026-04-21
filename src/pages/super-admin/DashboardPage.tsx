import React from 'react';
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
import './super-admin.css';

const DashboardPage: React.FC = () => {
  const [showBranchModal, setShowBranchModal] = React.useState(false);
  const [showAdminModal, setShowAdminModal] = React.useState(false);
  const [showReportModal, setShowReportModal] = React.useState(false);

  const stats = [
    { label: 'Total Branches', value: '4', detail: 'Across all regions', icon: businessOutline },
    // { label: 'Total Patients', value: '2,840', detail: 'Organization-wide', icon: peopleOutline },
    // { label: 'Active Sessions', value: '142', detail: 'Live now', icon: flashOutline },
    // { label: 'Healer Count', value: '1', detail: 'Certified practitioners', icon: medkitOutline },
    // { label: 'Total Visitors', value: '450', detail: "Today's footfall", icon: eyeOutline },
  ];

  const chartBars = [
    { h: 80, h2: 30 }, { h: 120, h2: 50 }, { h: 100, h2: 45 },
    { h: 60, h2: 70 }, { h: 140, h2: 35 }, { h: 90, h2: 60 },
    { h: 40, h2: 80 },
  ];

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
            Monitoring 4 sanctuaries across the organization.
          </p>

          {/* Stat Cards */}
          <div className="sa-stats">
            {stats.map((stat, i) => (
              <div className="sa-stat-card" key={i}>
                <div>
                  <div className="sa-stat-card__label">{stat.label}</div>
                  <div className="sa-stat-card__value">{stat.value}</div>
                  <div className="sa-stat-card__detail">
                    <IonIcon icon={trendingUpOutline} /> {stat.detail}
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
                  <div className="sa-finance-card__value">₹3,700</div>
                </div>
              </div>

              {/* Chart Placeholder */}
              <div className="sa-chart-placeholder">
                {chartBars.map((bar, i) => (
                  <React.Fragment key={i}>
                    <div className="sa-chart-bar" style={{ height: bar.h }} />
                    <div className="sa-chart-bar sa-chart-bar--secondary" style={{ height: bar.h2 }} />
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="sa-quick-actions">
              <h3 className="sa-quick-actions__title">Super Admin Portal</h3>
              <div className="sa-quick-action" onClick={() => setShowBranchModal(true)}>
                <span className="sa-quick-action__label">Create New Branch</span>
                <IonIcon icon={addCircleOutline} className="sa-quick-action__icon" />
              </div>
              <div className="sa-quick-action" onClick={() => setShowAdminModal(true)}>
                <span className="sa-quick-action__label">Manage Branch Admins</span>
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
      
      {/* 1. Create New Branch Modal */}
      <IonModal isOpen={showBranchModal} onDidDismiss={() => setShowBranchModal(false)} className="sa-modal">
        <div className="sa-modal__content">
          <div className="sa-modal__header">
            <h2>Create New Branch</h2>
            <button className="sa-modal__close-btn" onClick={() => setShowBranchModal(false)}>×</button>
          </div>
          <div className="sa-modal__body">
            <div className="sa-settings__form-group">
              <label className="sa-settings__label">Branch Name</label>
              <input className="sa-settings__input" placeholder="e.g. Uptown Sanctuary" />
            </div>
            <div className="sa-settings__form-group">
              <label className="sa-settings__label">Region</label>
              <select className="sa-settings__input">
                <option>North Region</option>
                <option>South Region</option>
                <option>East Region</option>
                <option>West Region</option>
                <option>Central Region</option>
              </select>
            </div>
            <div className="sa-settings__form-group">
              <label className="sa-settings__label">Contact Phone</label>
              <input className="sa-settings__input" placeholder="+91 xxxxx xxxxx" />
            </div>
          </div>
          <div className="sa-modal__footer">
            <button className="sa-btn sa-btn--outline" onClick={() => setShowBranchModal(false)}>Cancel</button>
            <button className="sa-btn sa-btn--primary">Create Branch</button>
          </div>
        </div>
      </IonModal>

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
