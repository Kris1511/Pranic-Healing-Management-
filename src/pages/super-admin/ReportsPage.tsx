import React, { useState } from 'react';
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
} from '@ionic/react';
import {
  notificationsOutline,
  flashOutline,
  peopleOutline,
  cashOutline,
  starOutline,
  documentTextOutline,
  footstepsOutline,
  pulseOutline,
  briefcaseOutline,
  calendarOutline,
  chevronForwardOutline,
  downloadOutline,
} from 'ionicons/icons';
import './super-admin.css';

const ReportsPage: React.FC = () => {
  const [activeToggle, setActiveToggle] = useState('Income');
  const [timeRange, setTimeRange] = useState('Last 7 Days');

  const stats = [
    { label: 'Total Sessions', value: '2,450', change: '+8%', icon: flashOutline },
    { label: 'New Patients', value: '184', change: '+4%', icon: peopleOutline },
    { label: 'Total Revenue', value: '₹12.5L', change: '+6%', icon: cashOutline },
    { label: 'Avg. Rating', value: '4.9', change: '', icon: starOutline },
  ];

  const chartBars = [
    { d: 'Mon', h1: 30000, h2: 15000 },
    { d: 'Tue', h1: 45000, h2: 25000 },
    { d: 'Wed', h1: 35000, h2: 20000 },
    { d: 'Thu', h1: 55000, h2: 18000 },
    { d: 'Fri', h1: 40000, h2: 30000 },
    { d: 'Sat', h1: 60000, h2: 22000 },
    { d: 'Sun', h1: 25000, h2: 12000 },
  ];

  const maxVal = 70000;

  const specializedReports = [
    {
      icon: documentTextOutline,
      title: 'Daily Finance Report',
      desc: 'Consolidated income and expense audit across all branches',
    },
    {
      icon: footstepsOutline,
      title: 'Visitor Logs',
      desc: 'Daily footfall and visitor purpose analysis',
    },
    {
      icon: pulseOutline,
      title: 'Patient Sessions',
      desc: 'Healing session volume and type distribution',
    },
    {
      icon: briefcaseOutline,
      title: 'Branch Performance',
      desc: 'Comparative analysis across all sanctuary branches',
    },
    {
      icon: calendarOutline,
      title: 'Attendance Report',
      desc: 'Healer and staff attendance records',
    },
  ];

  const healingTypes = [
    { name: 'Energy Healing', pct: 25, color: 'var(--color-primary)' },
    { name: 'Pranic Healing', pct: 25, color: '#2a9d8f' },
    { name: 'Meditation', pct: 20, color: '#e9c46a' },
    { name: 'Chakra Healing', pct: 15, color: '#f4a261' },
    { name: 'Others', pct: 15, color: '#e76f51' },  
  ];

  return (
    <IonPage className="sa-page">
      <IonHeader className="ion-no-border">
        <IonToolbar className="sa-page__toolbar">
          <IonButtons slot="start">
            <IonMenuButton />
          </IonButtons>
          <IonTitle className="sa-page__toolbar-title">PHMS Analytics</IonTitle>
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
          {/* Page Header */}
          <div className="sa-page__header">
            <div className="sa-page__header-row">
              <div>
                <h1 className="sa-page__title">Organization Analytics</h1>
                <p className="sa-page__subtitle">Consolidated performance data across all sanctuaries</p>
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button className="sa-btn sa-btn--outline sa-btn--sm">
                  <IonIcon icon={calendarOutline} /> {timeRange}
                </button>
                <button className="sa-btn sa-btn--primary sa-btn--sm">
                  <IonIcon icon={downloadOutline} /> Export PDF
                </button>
                <button className="sa-btn sa-btn--outline sa-btn--sm">Excel</button>
              </div>
            </div>
          </div>

          {/* Stat Cards */}
          <div className="sa-stats sa-stats--4">
            {stats.map((stat, i) => (
              <div className="sa-stat-card" key={i}>
                <div>
                  <div className="sa-stat-card__icon" style={{ marginBottom: 8, display: 'inline-flex' }}>
                    <IonIcon icon={stat.icon} />
                  </div>
                  <div className="sa-stat-card__value">{stat.value}</div>
                  <div className="sa-stat-card__label" style={{ marginBottom: 0 }}>{stat.label}</div>
                </div>
                {stat.change && (
                  <span style={{ fontSize: 12, color: '#1a8a5a', fontWeight: 600 }}>{stat.change}</span>
                )}
              </div>
            ))}
          </div>

          {/* Charts Grid */}
          <div className="sa-grid-2">
            {/* Financial Performance */}
            <div className="sa-section">
              <div className="sa-section__header">
                <div>
                  <h2 className="sa-section__title">Financial Performance</h2>
                  <p className="sa-section__subtitle">Consolidated Income vs Expenses</p>
                </div>
                <div className="sa-toggle-tabs">
                  {['Income', 'Expenses'].map(tab => (
                    <button
                      key={tab}
                      className={`sa-toggle-tab ${activeToggle === tab ? 'sa-toggle-tab--active' : ''}`}
                      onClick={() => setActiveToggle(tab)}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>
              <div className="sa-chart-placeholder" style={{ height: 240 }}>
                {chartBars.map((bar, i) => (
                  <React.Fragment key={i}>
                    <div className="sa-chart-bar" style={{ height: (bar.h1 / maxVal) * 200 }} />
                    <div className="sa-chart-bar sa-chart-bar--secondary" style={{ height: (bar.h2 / maxVal) * 200 }} />
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Case Distribution */}
            <div className="sa-section">
              <div>
                <h2 className="sa-section__title">Case Distribution</h2>
                <p className="sa-section__subtitle">Healing Specializations</p>
              </div>
              <div style={{ padding: '20px 0' }}>
                <div className="sa-donut-placeholder" />
                <div className="sa-donut-legend">
                  {healingTypes.map((type, i) => (
                    <div className="sa-donut-legend__item" key={i}>
                      <span className="sa-donut-legend__dot" style={{ background: type.color }} />
                      <span>{type.name}</span>
                      <span style={{ marginLeft: 'auto', fontWeight: 600 }}>{type.pct}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Specialized Reports */}
          {/* <div style={{ marginTop: 8 }}>
            <h2 className="sa-section__title" style={{ color: 'var(--color-primary-dark)', marginBottom: 16 }}>
              Generate Specialized Reports
            </h2>
            <div className="sa-report-cards">
              {specializedReports.map((report, i) => (
                <div className="sa-report-card" key={i}>
                  <div className="sa-report-card__icon">
                    <IonIcon icon={report.icon} />
                  </div>
                  <h3 className="sa-report-card__title">{report.title}</h3>
                  <p className="sa-report-card__desc">{report.desc}</p>
                  <div className="sa-report-card__action">
                    Generate Report <IonIcon icon={chevronForwardOutline} />
                  </div>
                </div>
              ))}
            </div>
          </div> */}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default ReportsPage;
