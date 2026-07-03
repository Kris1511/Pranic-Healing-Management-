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
import { getReportsSummary, getReportsGrowth } from '../../api/report.api';
import ProfileDropdown from '../../components/common/ProfileDropdown';


const ReportsPage: React.FC = () => {
  const [activeToggle, setActiveToggle] = useState('All');
  const [timeRange, setTimeRange] = useState('Last 7 Days');

  const [summaryData, setSummaryData] = useState<any>(null);
  const [growthData, setGrowthData] = useState<any>([]);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const summaryRes = await getReportsSummary({ timeRange });
        if (summaryRes?.data) {
          setSummaryData(summaryRes.data);
        }
        
        const growthRes = await getReportsGrowth({ timeRange });
        if (growthRes?.data) {
          setGrowthData(growthRes.data);
        }
      } catch (error) {
        console.error('Error fetching reports:', error);
      }
    };
    fetchReports();
  }, [timeRange]);

  const downloadPDF = () => {
    // We use the browser's native print functionality to allow saving as PDF
    window.print();
  };

  const downloadExcel = () => {
    if (!summaryData) return;
    
    const headers = ['Metric', 'Value'];
    const rows = [
      ['Total Sessions', summaryData.sessionCount || 0],
      ['Total Patients', summaryData.patientCount || 0],
      ['Total Revenue', summaryData.totalRevenue || 0],
      ['Total Expenses', summaryData.totalExpenses || 0],
      ['Net Profit', summaryData.netProfit || 0],
    ];

    let csvContent = 'data:text/csv;charset=utf-8,' 
      + headers.join(',') + '\n' 
      + rows.map(e => e.join(',')).join('\n');

    csvContent += '\n\nDay,Income,Expense\n';
    const chartBars: any[] = summaryData.chartBars || [];
    csvContent += chartBars.map(b => `${b.d},${b.h1},${b.h2}`).join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `PHMS_Report_${timeRange.replace(/ /g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const stats = [
    { label: 'Total Sessions', value: summaryData?.sessionCount || '0', change: '', icon: flashOutline },
    { label: 'Total Patients', value: summaryData?.patientCount || '0', change: '', icon: peopleOutline },
    { label: 'Total Revenue', value: `₹${summaryData?.totalRevenue || 0}`, change: '', icon: cashOutline },
  ];

  const defaultChartBars = [
    { d: 'Mon', h1: 0, h2: 0 },
    { d: 'Tue', h1: 0, h2: 0 },
    { d: 'Wed', h1: 0, h2: 0 },
    { d: 'Thu', h1: 0, h2: 0 },
    { d: 'Fri', h1: 0, h2: 0 },
    { d: 'Sat', h1: 0, h2: 0 },
    { d: 'Sun', h1: 0, h2: 0 },
  ];

  const chartBars = summaryData?.chartBars || defaultChartBars;

  const maxVal = Math.max(...chartBars.map((b: any) => Math.max(b.h1, b.h2)), 1000);
  const hasChartData = chartBars.some((b: any) => b.h1 > 0 || b.h2 > 0);

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
              <ProfileDropdown />
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
              <div className="sa-page__header-actions">
                <div className="sa-date-picker">
                  <IonIcon icon={calendarOutline} style={{ color: 'var(--color-text-secondary)' }} />
                  <select 
                    value={timeRange} 
                    onChange={(e) => setTimeRange(e.target.value)}
                    style={{ border: 'none', background: 'transparent', outline: 'none', padding: '6px 0', fontSize: '14px', color: 'var(--color-text-primary)', flex: 1, width: '100%', cursor: 'pointer' }}
                  >
                    <option value="Today">Today</option>
                    <option value="Yesterday">Yesterday</option>
                    <option value="Last 7 Days">Last 7 Days</option>
                    <option value="This Month">This Month</option>
                    <option value="All Time">All Time</option>
                  </select>
                </div>
                <button className="sa-btn sa-btn--primary sa-btn--sm" onClick={downloadPDF} style={{ margin: 0, height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                  <IonIcon icon={downloadOutline} /> Export PDF
                </button>
                <button className="sa-btn sa-btn--outline sa-btn--sm" onClick={downloadExcel} style={{ margin: 0, height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  Excel
                </button>
              </div>
            </div>
          </div>

          {/* Stat Cards */}
          <div className="sa-stats sa-stats--3">
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

          {/* Financial Performance Chart */}
            <div className="sa-section">
              <div className="sa-section__header">
                <div>
                  <h2 className="sa-section__title">Financial Performance</h2>
                  <p className="sa-section__subtitle">Consolidated Income vs Expenses</p>
                </div>
                <div className="sa-toggle-tabs">
                  {['All', 'Income', 'Expenses'].map(tab => (
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
              <div className="sa-chart-container">
                {!hasChartData ? (
                  <div style={{ height: 240, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontStyle: 'italic' }}>
                    No financial data available for the selected period
                  </div>
                ) : (
                  <>
                    <div className="sa-chart-plot-area" style={{ height: 240, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                      {chartBars.map((bar: any, i: number) => (
                        <div className="sa-chart-day-group sa-chart-group" key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', position: 'relative' }}>
                          <div className="sa-chart-bars-row" style={{ display: 'flex', gap: 6, alignItems: 'flex-end', height: '100%', width: '100%', justifyItems: 'center', justifyContent: 'center' }}>
                            {(activeToggle === 'Income' || activeToggle === 'All') && (
                              <div
                                className="sa-chart-bar sa-chart-bar--income-current"
                                style={{ height: `${(bar.h1 / (maxVal || 1)) * 100}%`, width: 16 }}
                              />
                            )}
                            {(activeToggle === 'Expenses' || activeToggle === 'All') && (
                              <div
                                className="sa-chart-bar sa-chart-bar--expense-current"
                                style={{ height: `${(bar.h2 / (maxVal || 1)) * 100}%`, width: 16 }}
                              />
                            )}
                          </div>
                          <div className="sa-chart-tooltip" style={{ bottom: '100%', marginBottom: 8 }}>
                            <div className="sa-chart-tooltip-grid">
                              <div className="sa-chart-tooltip-section">
                                <span style={{color: '#94a3b8', fontSize: 10, textTransform: 'uppercase'}}>Income</span>
                                <strong style={{ fontSize: 14 }}>₹{bar.h1}</strong>
                              </div>
                              <div className="sa-chart-tooltip-section">
                                <span style={{color: '#94a3b8', fontSize: 10, textTransform: 'uppercase'}}>Expense</span>
                                <strong style={{ fontSize: 14 }}>₹{bar.h2}</strong>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="sa-chart-x-axis" style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12 }}>
                      {chartBars.map((bar: any, i: number) => (
                        <span className="sa-chart-label" key={i} style={{ flex: 1, textAlign: 'center', fontSize: 12, color: '#64748b' }}>{bar.d}</span>
                      ))}
                    </div>
                  </>
                )}
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
