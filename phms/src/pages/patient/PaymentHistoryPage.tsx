import React from 'react';
import {
  IonPage,
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonMenuButton,
  IonIcon,
} from '@ionic/react';
import {
  cashOutline,
  arrowBackOutline,
  walletOutline,
  receiptOutline,
  trendingUpOutline,
  checkmarkCircleOutline,
  timeOutline,
} from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';
import AppCard from '../../components/common/AppCard';
import '../branch-admin/branch-admin.css';
import '../healer/Healers.css';

interface PaymentHistoryEntry {
  id: string;
  patientName: string;
  sessionNo: string;
  totalBilled: number;
  paid: number;
  outstanding: number;
  status: 'Paid' | 'Pending' | 'Partial';
  assignedHealer: string;
  caseId: string;
  history?: {
    date: string;
    amount: number;
    mode: 'UPI' | 'Cash' | 'Bank Transfer';
    status: 'Paid';
  }[];
}

const PaymentHistoryPage: React.FC = () => {
  const history = useHistory();
  const { user } = useAuthStore();

  const userName = user?.name || 'Valued Patient';
  const userEmail = user?.email || 'patient@phms.com';

  const [ledgerEntries, setLedgerEntries] = React.useState<PaymentHistoryEntry[]>([]);

  // Load ledger details from localStorage
  React.useEffect(() => {
    // Resolve patient name and healer
    let patientName = userName;
    let currentHealer = 'Dr. Shailesh';
    const savedPatients = localStorage.getItem('phms_patients');
    if (savedPatients) {
      try {
        const parsed = JSON.parse(savedPatients);
        const found = parsed.find((p: any) => p.email?.toLowerCase() === userEmail.toLowerCase());
        if (found) {
          patientName = found.name;
          currentHealer = found.assignedHealer || 'Dr. Shailesh';
        }
      } catch (e) {
        console.error(e);
      }
    }

    // Load payments matching patientName
    const savedPayments = localStorage.getItem('phms_patient_payments');
    let filtered: PaymentHistoryEntry[] = [];
    if (savedPayments) {
      try {
        const parsed: PaymentHistoryEntry[] = JSON.parse(savedPayments);
        filtered = parsed.filter(
          (p) => p.patientName?.toLowerCase().trim() === patientName.toLowerCase().trim()
        );
      } catch (e) {
        console.error(e);
      }
    }

    // Fallback/Sample data for payments if empty
    if (filtered.length === 0) {
      filtered = [
        {
          id: 'INV-10024',
          patientName: patientName,
          sessionNo: 'SESS-2035',
          totalBilled: 1200,
          paid: 1200,
          outstanding: 0,
          status: 'Paid',
          assignedHealer: currentHealer,
          caseId: 'CASE-084',
          history: [
            {
              date: new Date(Date.now() - 86400000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
              amount: 1200,
              mode: 'Bank Transfer',
              status: 'Paid'
            }
          ]
        },
        {
          id: 'INV-10031',
          patientName: patientName,
          sessionNo: 'SESS-2041',
          totalBilled: 2000,
          paid: 800,
          outstanding: 1200,
          status: 'Partial',
          assignedHealer: currentHealer,
          caseId: 'CASE-084',
          history: [
            {
              date: new Date(Date.now() - 3600000 * 2).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
              amount: 800,
              mode: 'Cash',
              status: 'Paid'
            }
          ]
        },
        {
          id: 'INV-10045',
          patientName: patientName,
          sessionNo: 'SESS-2048',
          totalBilled: 2500,
          paid: 0,
          outstanding: 2500,
          status: 'Pending',
          assignedHealer: currentHealer,
          caseId: 'CASE-084',
          history: []
        }
      ];
      // Save it back to local storage
      const savedList = savedPayments ? JSON.parse(savedPayments) : [];
      localStorage.setItem('phms_patient_payments', JSON.stringify([...filtered, ...savedList]));
    }
    setLedgerEntries(filtered);
  }, [userEmail, userName]);

  // Aggregate totals
  const totalBilled = ledgerEntries.reduce((sum, item) => sum + item.totalBilled, 0);
  const totalPaid = ledgerEntries.reduce((sum, item) => sum + item.paid, 0);
  const outstandingBalance = ledgerEntries.reduce((sum, item) => sum + item.outstanding, 0);

  return (
    <IonPage className="sa-page">
      <IonHeader className="ion-no-border">
        <IonToolbar className="sa-page__toolbar">
          <IonButtons slot="start">
            <button className="healer-back-btn" onClick={() => history.push('/patient/dashboard')}>
              <IonIcon icon={arrowBackOutline} />
            </button>
          </IonButtons>
          <IonTitle className="sa-page__toolbar-title">Payments & Ledger</IonTitle>
          <IonButtons slot="end">
            <IonMenuButton />
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent className="sa-page__content">
        <div className="healer-container">
          
          <div className="healer-header-box">
            <h1 className="healer-page-title">Billing & Payments</h1>
            <p className="healer-page-subtitle">
              View your healing receipts, invoice breakdowns, outstanding balances, and historical payments.
            </p>
          </div>

          {/* Metrics summary row */}
          <div className="healer-stats-grid" style={{ marginBottom: '24px', gridTemplateColumns: 'repeat(3, 1fr)' }}>
            
            {/* Total Billed */}
            <div className="healer-stat-card">
              <div className="healer-stat-card__icon-wrap healer-stat-card__icon-wrap--purple">
                <IonIcon icon={trendingUpOutline} />
              </div>
              <div className="healer-stat-card__info">
                <span className="healer-stat-card__label">Total Billed</span>
                <strong className="healer-stat-card__value" style={{ fontSize: '20px' }}>₹{totalBilled.toLocaleString()}</strong>
              </div>
            </div>

            {/* Total Paid */}
            <div className="healer-stat-card">
              <div className="healer-stat-card__icon-wrap healer-stat-card__icon-wrap--teal">
                <IonIcon icon={checkmarkCircleOutline} />
              </div>
              <div className="healer-stat-card__info">
                <span className="healer-stat-card__label">Total Paid</span>
                <strong className="healer-stat-card__value" style={{ fontSize: '20px' }}>₹{totalPaid.toLocaleString()}</strong>
              </div>
            </div>

            {/* Outstanding Balance */}
            <div className="healer-stat-card">
              <div className="healer-stat-card__icon-wrap healer-stat-card__icon-wrap--blue" style={{ background: outstandingBalance > 0 ? '#fef2f2' : '', color: outstandingBalance > 0 ? '#dc2626' : '' }}>
                <IonIcon icon={walletOutline} />
              </div>
              <div className="healer-stat-card__info">
                <span className="healer-stat-card__label">Outstanding Balance</span>
                <strong className="healer-stat-card__value" style={{ fontSize: '20px', color: outstandingBalance > 0 ? '#dc2626' : '' }}>₹{outstandingBalance.toLocaleString()}</strong>
              </div>
            </div>

          </div>

          {/* Detailed ledger table */}
          <AppCard padding="large" shadow>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#1e293b', margin: '0 0 16px 0' }}>
              Billing Ledgers & Invoices
            </h3>

            {ledgerEntries.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 16px', color: '#94a3b8' }}>
                <IonIcon icon={receiptOutline} style={{ fontSize: '48px', opacity: 0.3, marginBottom: '8px' }} />
                <p style={{ margin: 0 }}>No billing history found.</p>
              </div>
            ) : (
              <div className="dm-table-container" style={{ margin: 0, border: 'none', boxShadow: 'none' }}>
                <table className="dm-table">
                  <thead>
                    <tr>
                      <th>BILL ID</th>
                      <th>SESSION NO</th>
                      <th>HEALER</th>
                      <th>TOTAL BILLED</th>
                      <th>PAID AMOUNT</th>
                      <th>OUTSTANDING</th>
                      <th>STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ledgerEntries.map((item) => {
                      const resolvedStatus = item.outstanding === 0 
                        ? 'Paid' 
                        : (item.paid > 0 ? 'Partial' : 'Pending');
                      return (
                        <React.Fragment key={item.id}>
                          <tr className="dm-table-row">
                            <td style={{ fontWeight: 700, color: '#1e293b' }}>{item.id}</td>
                            <td style={{ color: '#0f766e', fontWeight: 600 }}>{item.sessionNo}</td>
                            <td>{item.assignedHealer}</td>
                            <td style={{ fontWeight: 600 }}>₹{item.totalBilled}</td>
                            <td style={{ color: '#16a34a', fontWeight: 600 }}>₹{item.paid}</td>
                            <td style={{ color: item.outstanding > 0 ? '#dc2626' : '#64748b', fontWeight: 600 }}>₹{item.outstanding}</td>
                            <td>
                              <span className={`healer-status-badge ${
                                resolvedStatus === 'Paid' 
                                  ? 'healer-status-badge--completed' 
                                  : resolvedStatus === 'Partial'
                                    ? 'healer-status-badge--partial' 
                                    : 'healer-status-badge--scheduled'
                              }`}>
                                {resolvedStatus}
                              </span>
                            </td>
                          </tr>
                        
                        {/* Transaction Receipt Sub-rows */}
                        {item.history && item.history.length > 0 && (
                          <tr>
                            <td colSpan={7} style={{ background: '#f8fafc', padding: '8px 24px' }}>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                <span style={{ fontSize: '11px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                  Receipt Payments History
                                </span>
                                {item.history.map((tx, idx) => (
                                  <div key={idx} style={{ display: 'flex', gap: '20px', fontSize: '12px', color: '#475569' }}>
                                    <span>• Receipt Date: <strong>{tx.date}</strong></span>
                                    <span>Amount Paid: <strong style={{ color: '#16a34a' }}>₹{tx.amount}</strong></span>
                                    <span>Method: <strong>{tx.mode}</strong></span>
                                    <span style={{ color: '#16a34a' }}>✓ Success</span>
                                  </div>
                                ))}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                  </tbody>
                </table>
              </div>
            )}
          </AppCard>

        </div>
      </IonContent>
    </IonPage>
  );
};

export default PaymentHistoryPage;