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
  IonModal,
} from '@ionic/react';
import {
  searchOutline,
  cashOutline,
  walletOutline,
  trendingUpOutline,
  calendarOutline,
  filterOutline,
  downloadOutline,
  businessOutline,
  addOutline,
  removeOutline,
  arrowUpOutline,
  arrowDownOutline,
} from 'ionicons/icons';
import './super-admin.css';

const DailyFinancePage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showAddModal, setShowAddModal] = useState(false);
  
  const today = new Date().toISOString().split('T')[0];
  
  // Combined Income and Expense records
  const [records, setRecords] = useState([
    { id: 1, title: 'Patient Treatment (Elena)', type: 'income', category: 'Healing', branch: 'Uptown Sanctuary', amount: 1500, method: 'Card', date: today },
    { id: 2, title: 'Medical Supplies', type: 'expense', category: 'Equipment', branch: 'Uptown Sanctuary', amount: 3200, method: 'UPI', date: today },
    { id: 3, title: 'Patient Consultation (Stefan)', type: 'income', category: 'Consultation', branch: 'Coastal Healing Center', amount: 2000, method: 'UPI', date: today },
    { id: 4, title: 'Staff Lunch Reimbursement', type: 'expense', category: 'Misc', branch: 'Green Valley Branch', amount: 450, method: 'Cash', date: today },
    { id: 5, title: 'Patient Session (Caroline)', type: 'income', category: 'Healing', branch: 'Uptown Sanctuary', amount: 1800, method: 'Cash', date: today },
    { id: 6, title: 'Office Stationery', type: 'expense', category: 'Supplies', branch: 'Downtown Sanctuary', amount: 850, method: 'UPI', date: today },
    { id: 7, title: 'New Healer Onboarding', type: 'expense', category: 'Salaries', branch: 'All Branches', amount: 12000, method: 'Bank Transfer', date: today },
    { id: 8, title: 'Patient Recovery Fee (Alaric)', type: 'income', category: 'Recovery', branch: 'Green Valley Branch', amount: 2500, method: 'UPI', date: today },
    { id: 9, title: 'Utility Bill (Water)', type: 'expense', category: 'Utilities', branch: 'Coastal Healing Center', amount: 1100, method: 'Cash', date: today },
    { id: 10, title: 'Patient Session (Bonnie)', type: 'income', category: 'Healing', branch: 'Green Valley Branch', amount: 1200, method: 'UPI', date: today },
    { id: 11, title: 'Electricity Bill', type: 'expense', category: 'Utilities', branch: 'Downtown Sanctuary', amount: 2500, method: 'Bank Transfer', date: today },
    { id: 12, title: 'Facility Rent', type: 'expense', category: 'Misc', branch: 'Uptown Sanctuary', amount: 45000, method: 'Bank Transfer', date: today },
  ]);

  const [newEntry, setNewEntry] = useState({
    title: '',
    type: 'income',
    category: 'Healing',
    branch: 'Uptown Sanctuary',
    amount: 0,
    method: 'Cash'
  });

  const handleAddEntry = () => {
    if (!newEntry.title || newEntry.amount <= 0) return;
    
    const entry = {
      id: records.length + 1,
      ...newEntry,
      date: selectedDate
    };

    setRecords([entry, ...records]);
    setNewEntry({ title: '', type: 'income', category: 'Healing', branch: 'Uptown Sanctuary', amount: 0, method: 'Cash' });
    setShowAddModal(false);
  };

  const filteredRecords = records.filter(r => {
    const matchesSearch = r.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         r.branch.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         r.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDate = r.date === selectedDate;
    return matchesSearch && matchesDate;
  });

  const totalIncome = filteredRecords
    .filter(r => r.type === 'income')
    .reduce((sum, r) => sum + r.amount, 0);

  const totalExpense = filteredRecords
    .filter(r => r.type === 'expense')
    .reduce((sum, r) => sum + r.amount, 0);

  const netBalance = totalIncome - totalExpense;

  return (
    <IonPage className="sa-page">
      <IonHeader className="ion-no-border">
        <IonToolbar className="sa-page__toolbar">
          <IonButtons slot="start">
            <IonMenuButton />
          </IonButtons>
          <IonTitle className="sa-page__toolbar-title">Daily Finance Log</IonTitle>
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
                <h1 className="sa-page__title">Daily Income & Expense</h1>
                <p className="sa-page__subtitle">Track all daily cash flows and financial transactions</p>
              </div>
              {/* <div className="sa-page__header-actions">
                <div className="sa-date-picker">
                  <IonIcon icon={calendarOutline} />
                  <input 
                    type="date" 
                    value={selectedDate} 
                    onChange={(e) => setSelectedDate(e.target.value)} 
                  />
                </div>
                <button className="sa-btn sa-btn--primary">
                  <IonIcon icon={downloadOutline} /> Daily Report
                </button>
              </div> */}
            </div>
          </div>

          <div className="sa-stats sa-stats--3">
            <div className="sa-stat-card">
              <div className="sa-stat-card__icon sa-stat-card__icon--success">
                <IonIcon icon={arrowUpOutline} />
              </div>
              <div>
                <div className="sa-stat-card__label">Total Daily Income</div>
                <div className="sa-stat-card__value">₹{totalIncome.toLocaleString()}</div>
              </div>
            </div>
            <div className="sa-stat-card">
              <div className="sa-stat-card__icon sa-stat-card__icon--danger">
                <IonIcon icon={arrowDownOutline} />
              </div>
              <div>
                <div className="sa-stat-card__label">Total Daily Expense</div>
                <div className="sa-stat-card__value">₹{totalExpense.toLocaleString()}</div>
              </div>
            </div>
            <div className="sa-stat-card">
              <div className="sa-stat-card__icon sa-stat-card__icon--primary">
                <IonIcon icon={walletOutline} />
              </div>
              <div>
                <div className="sa-stat-card__label">Closing Balance</div>
                <div className="sa-stat-card__value">₹{netBalance.toLocaleString()}</div>
              </div>
            </div>
          </div>

          <div className="sa-section-header" style={{ display: 'flex', gap: '16px', alignItems: 'center', marginTop: '24px' }}>
            <div className="sa-search">
              <IonIcon icon={searchOutline} />
              <input 
                placeholder="Search records by title, branch or category..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="sa-btn sa-btn--outline" style={{ marginBottom: '20px' }}>
                <IonIcon icon={filterOutline} /> Filter
              </button>
              <button className="sa-btn sa-btn--primary" style={{ marginBottom: '20px' }} onClick={() => setShowAddModal(true)}>
                <IonIcon icon={addOutline} /> Add Entry
              </button>
            </div>
          </div>

          <div className="sa-section" style={{ padding: 0, overflow: 'hidden' }}>
            <table className="sa-table">
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Branch</th>
                  <th>Category</th>
                  <th>Amount</th>
                  {/* <th>Method</th> */}
                  <th>Date</th>
                  <th>Type</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.length > 0 ? filteredRecords.map((record) => (
                  <tr key={record.id}>
                    <td>
                      <div className="sa-table__user">
                        <div className={`sa-table__avatar ${record.type === 'income' ? 'sa-table__avatar--success' : 'sa-table__avatar--danger'}`}>
                          <IonIcon icon={record.type === 'income' ? addOutline : removeOutline} />
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
                      <span style={{ 
                        fontWeight: 700, 
                        color: record.type === 'income' ? 'var(--color-success)' : 'var(--color-danger)' 
                      }}>
                        {record.type === 'income' ? '+' : '-'} ₹{record.amount.toLocaleString()}
                      </span>
                    </td>
                    {/* <td>{record.method}</td> */}
                    <td>{record.date}</td>
                    <td>
                      <span className={`sa-badge sa-badge--${record.type === 'income' ? 'active' : 'absent'}`}>
                        {record.type.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-muted)' }}>
                      No records found for the selected date.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </IonContent>

      {/* Add Entry Modal */}
      <IonModal isOpen={showAddModal} onDidDismiss={() => setShowAddModal(false)} className="sa-modal sa-modal--sm">
        <div className="sa-modal__content">
          <div className="sa-modal__header">
            <h2>Add Financial Entry</h2>
            <button className="sa-modal__close-btn" onClick={() => setShowAddModal(false)}>×</button>
          </div>
          <div className="sa-modal__body">
            <div className="sa-settings__form-group">
              <label className="sa-settings__label">Entry Type</label>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button 
                  className={`sa-btn ${newEntry.type === 'income' ? 'sa-btn--primary' : 'sa-btn--outline'}`} 
                  style={{ flex: 1 }}
                  onClick={() => setNewEntry({ ...newEntry, type: 'income' })}
                >
                  Income
                </button>
                <button 
                  className={`sa-btn ${newEntry.type === 'expense' ? 'sa-btn--danger' : 'sa-btn--outline'}`} 
                  style={{ flex: 1 }}
                  onClick={() => setNewEntry({ ...newEntry, type: 'expense' })}
                >
                  Expense
                </button>
              </div>
            </div>
            <div className="sa-settings__form-group">
              <label className="sa-settings__label">Description</label>
              <input 
                className="sa-settings__input" 
                placeholder="What was this for?"
                value={newEntry.title}
                onChange={(e) => setNewEntry({ ...newEntry, title: e.target.value })}
              />
            </div>
            <div className="sa-settings__form-row">
              <div className="sa-settings__form-group">
                <label className="sa-settings__label">Amount (₹)</label>
                <input 
                  type="number"
                  className="sa-settings__input" 
                  placeholder="0.00"
                  value={newEntry.amount}
                  onChange={(e) => setNewEntry({ ...newEntry, amount: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="sa-settings__form-group">
                <label className="sa-settings__label">Category</label>
                <select 
                  className="sa-settings__input"
                  value={newEntry.category}
                  onChange={(e) => setNewEntry({ ...newEntry, category: e.target.value })}
                >
                  <option>Healing</option>
                  <option>Consultation</option>
                  <option>Supplies</option>
                  <option>Utilities</option>
                  <option>Salaries</option>
                  <option>Misc</option>
                </select>
              </div>
            </div>
            <div className="sa-settings__form-group">
              <label className="sa-settings__label">Branch</label>
              <select 
                className="sa-settings__input"
                value={newEntry.branch}
                onChange={(e) => setNewEntry({ ...newEntry, branch: e.target.value })}
              >
                <option>Uptown Sanctuary</option>
                <option>Coastal Healing Center</option>
                <option>Green Valley Branch</option>
                <option>Downtown Sanctuary</option>
              </select>
            </div>
          </div>
          <div className="sa-modal__footer">
            <button className="sa-btn sa-btn--outline" onClick={() => setShowAddModal(false)}>Cancel</button>
            <button className="sa-btn sa-btn--primary" onClick={handleAddEntry}>Save Entry</button>
          </div>
        </div>
      </IonModal>
    </IonPage>
  );
};


export default DailyFinancePage;
