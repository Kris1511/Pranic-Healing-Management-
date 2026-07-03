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
import { getBranches } from '../../api/branch.api';
import './super-admin.css';
import ProfileDropdown from '../../components/common/ProfileDropdown';


const RevenuePage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  
  const [period, setPeriod] = useState('All Time');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [status, setStatus] = useState('All Status');
  const [financeType, setFinanceType] = useState('All Types');
  const [category, setCategory] = useState('All Categories');
  const [branchId, setBranchId] = useState('All Branches');

  const { data: branchesData } = useQuery({
    queryKey: ['sa-branches-list'],
    queryFn: async () => {
      const res = await getBranches();
      return res?.success && Array.isArray(res?.data) ? res.data : [];
    }
  });

  const { data: revenueData } = useQuery({
    queryKey: ['sa-revenue-overview', period, fromDate, toDate, status, financeType, category, branchId],
    queryFn: async () => {
      const params: any = {};
      if (period !== 'All Time') params.period = period;
      if (fromDate) params.fromDate = fromDate;
      if (toDate) params.toDate = toDate;
      if (status !== 'All Status') params.status = status;
      if (financeType !== 'All Types') params.type = financeType;
      if (category !== 'All Categories') params.category = category;
      if (branchId !== 'All Branches') params.branchId = branchId;
      
      const res = await getSuperAdminRevenueFinance(params);
      return res?.success && res?.data ? res.data : null;
    },
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
            <ProfileDropdown />
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

          <div className="sa-section" style={{ padding: '20px', marginBottom: '24px' }}>
            <h2 className="sa-section__title" style={{ marginBottom: '16px', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px', color: 'var(--color-primary)' }}>
              <IonIcon icon={filterOutline} /> Filters & Search
            </h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              {/* Search */}
              <div className="sa-settings__form-group" style={{ margin: 0 }}>
                <label className="sa-settings__label" style={{ fontSize: '11px' }}>Search Description / Branch</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <input 
                    className="sa-settings__input" 
                    placeholder="Search title..." 
                    value={searchQuery}
                    style={{ paddingLeft: '36px', height: '40px', margin: 0 }}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <IonIcon icon={searchOutline} style={{ position: 'absolute', left: '12px', color: '#94a3b8' }} />
                </div>
              </div>

              {/* Period Dropdown */}
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

              {/* From Date */}
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

              {/* To Date */}
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

              {/* Payment Status Dropdown */}
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

              {/* Finance Type Dropdown */}
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

              {/* Category Dropdown */}
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

              {/* Branch Dropdown */}
              <div className="sa-settings__form-group" style={{ margin: 0 }}>
                <label className="sa-settings__label" style={{ fontSize: '11px' }}>Branch</label>
                <select 
                  className="sa-settings__input" 
                  value={branchId}
                  style={{ height: '40px', padding: '0 12px', margin: 0 }}
                  onChange={(e) => setBranchId(e.target.value)}
                >
                  <option value="All Branches">All Branches</option>
                  {branchesData?.map((b: any) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
              <button 
                className="sa-btn sa-btn--outline" 
                style={{ height: '36px', minWidth: 'auto', padding: '0 16px' }}
                onClick={() => {
                  setPeriod('All Time');
                  setFromDate('');
                  setToDate('');
                  setStatus('All Status');
                  setFinanceType('All Types');
                  setCategory('All Categories');
                  setBranchId('All Branches');
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
