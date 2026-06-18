import React, { useState } from 'react';
import {
  IonPage,
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonIcon,
  IonMenuButton,
} from '@ionic/react';
import {
  searchOutline,
  cashOutline,
  trendingUpOutline,
  walletOutline,
  alertCircleOutline,
  calendarOutline,
  filterOutline,
  downloadOutline,
  businessOutline,
  cardOutline,
} from 'ionicons/icons';
import { useQuery } from '@tanstack/react-query';
import { getSuperAdminRevenueFinance } from '../../api/finance.api';
import './super-admin.css';

const RevenuePage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRange, setSelectedRange] = useState('This Month');
  
  const { data: revenueData } = useQuery({
    queryKey: ['sa-revenue-overview'],
    queryFn: async () => {
      const res = await getSuperAdminRevenueFinance();
      return res?.success && res?.data ? res.data : null;
    },
    refetchInterval: 3000,
  });

  const transactions = revenueData?.transactions || [];
  const expenses = revenueData?.expenses || [];

  const totalIncome = transactions
    .filter((t: any) => t.status === 'completed')
    .reduce((sum: number, t: any) => sum + t.amount, 0) + 
    transactions
      .filter((t: any) => t.status === 'pending')
      .reduce((sum: number, t: any) => sum + (t.paid || 0), 0);

  const totalPending = transactions
    .reduce((sum: number, t: any) => sum + (t.outstanding || 0), 0);

  const totalExpenses = expenses
    .filter((e: any) => e.status === 'paid')
    .reduce((sum: number, e: any) => sum + e.amount, 0);

  const netProfit = totalIncome - totalExpenses;

  const filteredTransactions = transactions.filter((t: any) => 
    t.patient.toLowerCase().includes(searchQuery.toLowerCase()) || 
    t.branch.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <IonPage className="sa-page">
      <IonHeader className="ion-no-border">
        <IonToolbar className="sa-page__toolbar">
          <IonButtons slot="start">
            <IonMenuButton />
          </IonButtons>
          <IonTitle className="sa-page__toolbar-title">Financial Overview</IonTitle>
          <IonButtons slot="end">
            <button className="sa-page__toolbar-avatar">SA</button>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent className="sa-page__content">
        <div className="sa-page__body">
          <div className="sa-page__header">
            <div className="sa-page__header-row">
              <div>
                <h1 className="sa-page__title">Revenue & Expenses</h1>
                <p className="sa-page__subtitle">Balanced financial performance tracking and records</p>
              </div>
              {/* <div className="sa-page__header-actions">
                <div className="sa-date-picker">
                  <IonIcon icon={calendarOutline} />
                  <select 
                    value={selectedRange} 
                    onChange={(e) => setSelectedRange(e.target.value)}
                    style={{ border: 'none', background: 'transparent', outline: 'none', cursor: 'pointer', padding: '0 8px' }}
                  >
                    <option>Today</option>
                    <option>This Week</option>
                    <option>This Month</option>
                    <option>This Year</option>
                  </select>
                </div>
                <button className="sa-btn sa-btn--primary">
                  <IonIcon icon={downloadOutline} /> Export
                </button>
              </div> */}
            </div>
          </div>

          <div className="sa-stats sa-stats--4">
            <div className="sa-stat-card">
              <div className="sa-stat-card__icon sa-stat-card__icon--primary">
                <IonIcon icon={cashOutline} />
              </div>
              <div>
                <div className="sa-stat-card__label">Total Income</div>
                <div className="sa-stat-card__value">₹{totalIncome.toLocaleString()}</div>
              </div>
            </div>
            <div className="sa-stat-card">
              <div className="sa-stat-card__icon sa-stat-card__icon--danger">
                <IonIcon icon={walletOutline} />
              </div>
              <div>
                <div className="sa-stat-card__label">Total Expenses</div>
                <div className="sa-stat-card__value">₹{totalExpenses.toLocaleString()}</div>
              </div>
            </div>
            <div className="sa-stat-card">
              <div className="sa-stat-card__icon sa-stat-card__icon--success">
                <IonIcon icon={trendingUpOutline} />
              </div>
              <div>
                <div className="sa-stat-card__label">Net Profit</div>
                <div className="sa-stat-card__value">₹{netProfit.toLocaleString()}</div>
              </div>
            </div>
            <div className="sa-stat-card">
              <div className="sa-stat-card__icon sa-stat-card__icon--warning">
                <IonIcon icon={alertCircleOutline} />
              </div>
              <div>
                <div className="sa-stat-card__label">Pending Dues</div>
                <div className="sa-stat-card__value">₹{totalPending.toLocaleString()}</div>
              </div>
            </div>
          </div>

          {/* <div className="sa-grid-2">
            <div className="sa-section">
              <div className="sa-section__header">
                <div>
                  <h2 className="sa-section__title">Monthly Income Flow</h2>
                  <p className="sa-section__subtitle">Income vs Expenses over the last 30 days</p>
                </div>
              </div>
              <div className="sa-chart-placeholder" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                  <div className="sa-chart-bar" style={{ height: '120px', width: '30px' }}></div>
                  <span style={{ fontSize: '10px' }}>Income</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                  <div className="sa-chart-bar sa-chart-bar--secondary" style={{ height: '160px', width: '30px' }}></div>
                  <span style={{ fontSize: '10px' }}>Expense</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                  <div className="sa-chart-bar" style={{ height: '90px', width: '30px' }}></div>
                  <span style={{ fontSize: '10px' }}>Profit</span>
                </div>
              </div>
            </div>

            <div className="sa-quick-actions">
              <h2 className="sa-quick-actions__title">Expense Categories</h2>
              <div className="sa-quick-action">
                <div className="sa-quick-action__label">Staff Salaries</div>
                <div className="sa-quick-action__icon">₹15k</div>
              </div>
              <div className="sa-quick-action">
                <div className="sa-quick-action__label">Branch Rent</div>
                <div className="sa-quick-action__icon">₹5k</div>
              </div>
              <div className="sa-quick-action">
                <div className="sa-quick-action__label">Medical Supplies</div>
                <div className="sa-quick-action__icon">₹3.2k</div>
              </div>
              <div className="sa-quick-action">
                <div className="sa-quick-action__label">Others</div>
                <div className="sa-quick-action__icon">₹1.2k</div>
              </div>
            </div>
          </div> */}

          <div className="sa-section-header" style={{ display: 'flex', gap: '16px', alignItems: 'center', marginTop: '24px' }}>
            <div className="sa-search">
              <IonIcon icon={searchOutline} />
              <input 
                placeholder="Search by patient or branch..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button className="sa-btn sa-btn--outline" style={{ marginBottom: '20px' }}>
              <IonIcon icon={filterOutline} /> Filter Records
            </button>
          </div>

          <div className="sa-section" style={{ padding: 0, overflow: 'hidden' }}>
            <table className="sa-table">
              <thead>
                <tr>
                  <th>Patient Name</th>
                  <th>Branch</th>
                  <th>Amount</th>
                  <th>Method</th>
                  <th>Date & Time</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((t: any) => (
                  <tr key={t.id}>
                    <td>
                      <div className="sa-table__user">
                        <div className="sa-table__avatar sa-table__avatar--primary">
                          {t.patient.split(' ').map((n: string) => n[0]).join('')}
                        </div>
                        <span className="sa-table__user-name">{t.patient}</span>
                      </div>
                    </td>
                    <td>
                      <div className="sa-table__branch-info">
                        <IonIcon icon={businessOutline} /> {t.branch}
                      </div>
                    </td>
                    <td>
                      <span style={{ fontWeight: 700, color: 'var(--color-primary-dark)' }}>
                        ₹{t.amount.toLocaleString()}
                      </span>
                    </td>
                    <td>
                      <div className="sa-table__method">
                        <IonIcon icon={cardOutline} /> {t.method}
                      </div>
                    </td>
                    <td>
                      <div className="sa-table__date">
                        <IonIcon icon={calendarOutline} />
                        <div>
                          <div>{t.date}</div>
                          <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{t.time}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`sa-badge sa-badge--${t.status === 'completed' ? 'active' : t.status === 'pending' ? 'inactive' : 'absent'}`}>
                        {t.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default RevenuePage;
