import React, { useState } from 'react';
import {
  IonPage,
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonBackButton,
  IonIcon,
  IonSpinner,
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
  personOutline,
} from 'ionicons/icons';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { getSuperAdminRevenueFinance } from '../../api/finance.api';
import { getBranchById } from '../../api/branch.api';
import './super-admin.css';

const BranchRevenueDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [period, setPeriod] = useState('Last 1 Month');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [status, setStatus] = useState('All Status');
  const [financeType, setFinanceType] = useState('All Types');
  const [category, setCategory] = useState('All Categories');

  const { data: branchData } = useQuery({
    queryKey: ['sa-branch-details', id],
    queryFn: async () => {
      const res = await getBranchById(id);
      return res?.data || res;
    },
    enabled: !!id,
  });

  const { data: revenueData, isLoading } = useQuery({
    queryKey: ['sa-branch-revenue', id, period, fromDate, toDate, status, financeType, category],
    queryFn: async () => {
      const params: any = { branchId: id };
      if (period !== 'All Time') params.period = period;
      if (fromDate) params.fromDate = fromDate;
      if (toDate) params.toDate = toDate;
      if (status !== 'All Status') params.status = status;
      if (financeType !== 'All Types') params.type = financeType;
      if (category !== 'All Categories') params.category = category;
      
      const res = await getSuperAdminRevenueFinance(params);
      console.log('Failed to fetch revenue data:', res);
      return res?.success && res?.data ? res.data : null;
    },
    enabled: !!id,
    refetchInterval: 3000,
  });

  const records = revenueData?.records || [];
  const stats = revenueData?.stats || { totalIncome: 0, totalExpenses: 0, netProfit: 0, totalPending: 0 };
  const categories = revenueData?.categories || [
    'Session Fee',
    'Camp Fee',
    'Consultation',
    'Utilities',
    'Supplies',
    'Rent',
    'Salaries',
    'Misc'
  ];

  const totalIncome = stats.totalIncome;
  const totalExpenses = stats.totalExpenses;
  const totalPending = stats.totalPending;
  const netProfit = stats.netProfit;

  const filteredRecords = records.filter((r: any) => {
    const q = searchQuery.toLowerCase();
    const paidBy = (r.patientName || r.healerName || r.userName || '').toLowerCase();
    return (r.title || '').toLowerCase().includes(q) || 
           (r.category || '').toLowerCase().includes(q) ||
           paidBy.includes(q);
  });

  if (isLoading && !revenueData) {
    return (
      <IonPage className="sa-page">
        <IonHeader className="ion-no-border">
          <IonToolbar className="sa-page__toolbar">
            <IonButtons slot="start"><IonBackButton defaultHref={`/super-admin/branches/details/${id}`} /></IonButtons>
            <IonTitle className="sa-page__toolbar-title">Branch Revenue</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent className="sa-page__content">
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '50px' }}>
            <IonSpinner name="crescent" />
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
            <IonBackButton defaultHref={`/super-admin/branches/details/${id}`} />
          </IonButtons>
          <IonTitle className="sa-page__toolbar-title">{branchData?.name || 'Branch'} Revenue</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="sa-page__content">
        <div className="sa-page__body">
          <div className="sa-page__header">
            <div className="sa-page__header-row">
              <div>
                <h1 className="sa-page__title">Branch Financials</h1>
                <p className="sa-page__subtitle">Detailed revenue and expense records for {branchData?.name}</p>
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

          <div className="sa-section" style={{ padding: '20px', marginBottom: '24px' }}>
            <h2 className="sa-section__title" style={{ marginBottom: '16px', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px', color: 'var(--color-primary)' }}>
              <IonIcon icon={filterOutline} /> Filters & Search
            </h2>
            
            <div className="sa-filters-grid">
              <div className="sa-settings__form-group" style={{ margin: 0 }}>
                <label className="sa-settings__label" style={{ fontSize: '11px' }}>Search Description / Payer</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <input 
                    className="sa-settings__input" 
                    placeholder="Search..." 
                    value={searchQuery}
                    style={{ paddingLeft: '70px', height: '40px', margin: 0 }}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <IonIcon icon={searchOutline} style={{ position: 'absolute', left: '12px', color: '#94a3b8' }} />
                </div>
              </div>

              <div className="sa-settings__form-group" style={{ margin: 0 }}>
                <label className="sa-settings__label" style={{ fontSize: '11px' }}>Quick Date Filter</label>
                <select 
                  className="sa-settings__input" 
                  value={period}
                  style={{ height: '40px', padding: '0 12px', margin: 0 }}
                  onChange={(e) => {
                    setPeriod(e.target.value);
                    if (e.target.value !== 'All Time') {
                      setFromDate('');
                      setToDate('');
                    }
                  }}
                >
                  <option value="All Time">All Time</option>
                  <option value="Last 1 Week">Last 1 Week</option>
                  <option value="Last 2 Weeks">Last 2 Weeks</option>
                  <option value="Last 1 Month">Last 1 Month</option>
                  <option value="Last 2 Months">Last 2 Months</option>
                </select>
              </div>

              <div className="sa-settings__form-group" style={{ margin: 0 }}>
                <label className="sa-settings__label" style={{ fontSize: '11px' }}>From Date</label>
                <input 
                  type="date"
                  className="sa-settings__input" 
                  value={fromDate}
                  style={{ height: '40px', margin: 0 }}
                  onChange={(e) => {
                    setFromDate(e.target.value);
                    setPeriod('All Time');
                  }}
                />
              </div>

              <div className="sa-settings__form-group" style={{ margin: 0 }}>
                <label className="sa-settings__label" style={{ fontSize: '11px' }}>To Date</label>
                <input 
                  type="date"
                  className="sa-settings__input" 
                  value={toDate}
                  style={{ height: '40px', margin: 0 }}
                  onChange={(e) => {
                    setToDate(e.target.value);
                    setPeriod('All Time');
                  }}
                />
              </div>

              <div className="sa-settings__form-group" style={{ margin: 0 }}>
                <label className="sa-settings__label" style={{ fontSize: '11px' }}>Payment Status</label>
                <select 
                  className="sa-settings__input" 
                  value={status}
                  style={{ height: '40px', padding: '0 12px', margin: 0 }}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="All Status">All Status</option>
                  <option value="Paid">Paid</option>
                  <option value="Pending">Pending</option>
                  <option value="Partial">Partial</option>
                </select>
              </div>

              <div className="sa-settings__form-group" style={{ margin: 0 }}>
                <label className="sa-settings__label" style={{ fontSize: '11px' }}>Finance Type</label>
                <select 
                  className="sa-settings__input" 
                  value={financeType}
                  style={{ height: '40px', padding: '0 12px', margin: 0 }}
                  onChange={(e) => setFinanceType(e.target.value)}
                >
                  <option value="All Types">All Types</option>
                  <option value="Income">Income</option>
                  <option value="Expense">Expense</option>
                </select>
              </div>

              <div className="sa-settings__form-group" style={{ margin: 0 }}>
                <label className="sa-settings__label" style={{ fontSize: '11px' }}>Category</label>
                <select 
                  className="sa-settings__input" 
                  value={category}
                  style={{ height: '40px', padding: '0 12px', margin: 0 }}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="All Categories">All Categories</option>
                  {categories.map((cat: string) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
              <button 
                className="sa-btn sa-btn--outline" 
                style={{ height: '36px', minWidth: 'auto', padding: '0 16px' }}
                onClick={() => {
                  setPeriod('Last 1 Month');
                  setFromDate('');
                  setToDate('');
                  setStatus('All Status');
                  setFinanceType('All Types');
                  setCategory('All Categories');
                  setSearchQuery('');
                }}
              >
                Reset Filters
              </button>
            </div>
          </div>

          <div className="sa-section" style={{ padding: 0, overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <table className="sa-table">
              <thead>
                <tr>
                  <th>Description</th>
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

                  const paidBy = record.patientName || record.healerName || record.userName || record.paidBy || record.paidTo || '-';

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
                      {/* <td>
                        <div className="sa-table__branch-info">
                          <IonIcon icon={personOutline} /> {paidBy}
                        </div>
                      </td> */}
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

export default BranchRevenueDetailsPage;
