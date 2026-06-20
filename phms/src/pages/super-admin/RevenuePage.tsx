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
  filterOutline,
  businessOutline,
  addOutline,
  removeOutline,
} from 'ionicons/icons';
import { useQuery } from '@tanstack/react-query';
import { getSuperAdminRevenueFinance } from '../../api/finance.api';
import './super-admin.css';

const RevenuePage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  
  const { data: revenueData } = useQuery({
    queryKey: ['sa-revenue-overview'],
    queryFn: async () => {
      const res = await getSuperAdminRevenueFinance();
      return res?.success && res?.data ? res.data : null;
    },
    refetchInterval: 3000,
  });

  const records = revenueData?.records || [];
  const stats = revenueData?.stats || { totalIncome: 0, totalExpenses: 0, netProfit: 0, totalPending: 0 };

  const totalIncome = stats.totalIncome;
  const totalExpenses = stats.totalExpenses;
  const totalPending = stats.totalPending;
  const netProfit = stats.netProfit;

  const filteredRecords = records.filter((r: any) => {
    const q = searchQuery.toLowerCase();
    return (r.title || '').toLowerCase().includes(q) || 
           (r.branch || '').toLowerCase().includes(q) ||
           (r.category || '').toLowerCase().includes(q);
  });

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

          <div className="sa-section-header" style={{ display: 'flex', gap: '16px', alignItems: 'center', marginTop: '24px' }}>
            <div className="sa-search">
              <IonIcon icon={searchOutline} />
              <input 
                placeholder="Search records by description, branch or category..." 
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
                  <th>Description</th>
                  <th>Branch</th>
                  <th>Category</th>
                  <th>Amount</th>
                  <th>Date</th>
                  <th>Type</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.length > 0 ? filteredRecords.map((record: any) => {
                  const rType = record.type.toLowerCase();
                  const isPositive = rType === 'income' || rType === 'paid' || rType === 'partial';
                  const isNegative = rType === 'expense';
                  
                  let amtPrefix = '';
                  if (isPositive) amtPrefix = '+ ';
                  if (isNegative) amtPrefix = '- ';

                  let amtColor = 'var(--color-success)';
                  if (rType === 'expense' || rType === 'pending') amtColor = 'var(--color-danger)';
                  if (rType === 'partial') amtColor = '#f59e0b';

                  let badgeClass = 'sa-badge--inactive';
                  if (rType === 'income' || rType === 'paid') badgeClass = 'sa-badge--active';
                  if (rType === 'expense' || rType === 'pending') badgeClass = 'sa-badge--absent';

                  return (
                    <tr key={record.id}>
                      <td>
                        <div className="sa-table__user">
                          <div className={`sa-table__avatar ${isPositive ? 'sa-table__avatar--success' : 'sa-table__avatar--danger'}`}>
                            <IonIcon icon={isPositive ? addOutline : removeOutline} />
                          </div>
                          <span className="sa-table__user-name">{record.title}</span>
                        </div>
                      </td>
                      <td>
                        <div className="sa-table__branch-info">
                          <IonIcon icon={businessOutline} /> {record.branch}
                        </div>
                      </td>
                      <td>
                        <span className="sa-badge sa-badge--inactive">
                          {record.category}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontWeight: 700, color: amtColor }}>
                          {amtPrefix}₹{record.amount.toLocaleString()}
                        </span>
                      </td>
                      <td>{record.date}</td>
                      <td>
                        <span className={`sa-badge ${badgeClass}`}>
                          {record.type.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  );
                }) : (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-muted)' }}>
                      No records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default RevenuePage;
