import React, { useState } from 'react';
import {
  IonPage,
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonMenuButton,
  IonIcon,
  IonSpinner,
  useIonViewWillEnter,
  useIonViewWillLeave,
} from '@ionic/react';
import {
  cashOutline,
  arrowBackOutline,
  walletOutline,
  receiptOutline,
  trendingUpOutline,
  checkmarkCircleOutline,
  timeOutline,
  refreshOutline,
  calendarOutline,
  personOutline,
  walkOutline,
} from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';
import { useQuery } from '@tanstack/react-query';
import AppCard from '../../components/common/AppCard';
import { getPayments } from '../../api/payment.api';
import '../branch-admin/branch-admin.css';
import '../healer/Healers.css';

import ProfileDropdown from '../../components/common/ProfileDropdown';

/* ─── Types ──────────────────────────────────────────────────────── */
interface LedgerEntry {
  id: string;
  sessionId: string;
  sessionNo: string;
  sessionDate: string | null;
  treatmentType: string;
  startTime: string | null;
  endTime: string | null;
  healer: string;
  totalBilled: number;
  paid: number;
  outstanding: number;
  paymentStatus: 'Paid' | 'Partial' | 'Pending';
  paymentMethod: string | null;
  paymentDate: string | null;
  sessionStatus: string;
}

/* ─── Helpers ─────────────────────────────────────────────────────── */
const toDisplayDate = (raw: string | null | undefined): string => {
  if (!raw) return '—';
  const d = new Date(raw);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

const fmt = (n: number) =>
  n.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 });

const mapApiEntry = (item: any): LedgerEntry => ({
  id: item.id || `INV-?`,
  sessionId: item.sessionId || '',
  sessionNo: item.sessionNo || '—',
  sessionDate: item.sessionDate || null,
  treatmentType: item.treatmentType || item.type || 'Pranic Healing',
  startTime: item.startTime || null,
  endTime: item.endTime || null,
  healer: item.healer || 'Unknown Healer',
  totalBilled: parseFloat(item.totalBilled) || 0,
  paid: parseFloat(item.paid) || 0,
  outstanding: parseFloat(item.outstanding) || 0,
  paymentStatus:
    item.paymentStatus === 'Paid'
      ? 'Paid'
      : item.paymentStatus === 'Partial'
      ? 'Partial'
      : 'Pending',
  paymentMethod: item.paymentMethod || null,
  paymentDate: item.paymentDate || null,
  sessionStatus: item.sessionStatus || 'scheduled',
});

const statusBadgeClass = (s: LedgerEntry['paymentStatus']) => {
  if (s === 'Paid') return 'healer-status-badge healer-status-badge--completed';
  if (s === 'Partial') return 'healer-status-badge healer-status-badge--partial';
  return 'healer-status-badge healer-status-badge--pending';
};

/* ─── Component ───────────────────────────────────────────────────── */
const PaymentHistoryPage: React.FC = () => {
  const history = useHistory();
  const { user } = useAuthStore();
  const [isPageActive, setIsPageActive] = useState(true);

  useIonViewWillEnter(() => setIsPageActive(true));
  useIonViewWillLeave(() => setIsPageActive(false));

  /* Live polling — refetches every 3 s while page is active */
  const { data, isLoading, isError, refetch } = useQuery<LedgerEntry[]>({
    queryKey: ['patient-payments', user?.email],
    queryFn: async () => {
      const res = await getPayments();
      const raw: any[] = Array.isArray(res?.data) ? res.data : [];
      return raw.map(mapApiEntry);
    },
    enabled: !!user,
    refetchInterval: isPageActive ? 3000 : false,
    staleTime: 0,
  });

  const entries: LedgerEntry[] = data ?? [];

  /* Aggregate totals */
  const totalBilled     = entries.reduce((s, e) => s + e.totalBilled, 0);
  const totalPaid       = entries.reduce((s, e) => s + e.paid, 0);
  const totalOutstanding = entries.reduce((s, e) => s + e.outstanding, 0);

  return (
    <IonPage className="sa-page">
      <IonHeader className="ion-no-border">
        <IonToolbar className="sa-page__toolbar">
          <IonButtons slot="start">
            <IonMenuButton />
            {/* <button
              className="healer-back-btn"
              onClick={() => history.push('/patient/dashboard')}
            >
              <IonIcon icon={arrowBackOutline} />
            </button> */}
          </IonButtons>
          <IonTitle className="sa-page__toolbar-title">Payments &amp; Ledger</IonTitle>
          <IonButtons slot="end">
            <button
              className="healer-back-btn"
              onClick={() => refetch()}
              title="Refresh payments"
              style={{ marginRight: '4px' }}
            >
              <IonIcon icon={refreshOutline} />
            </button>
          
              <ProfileDropdown />
</IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent className="sa-page__content">
        <div className="healer-container">

          <div className="healer-header-box">
            <h1 className="healer-page-title">Billing &amp; Payments</h1>
            <p className="healer-page-subtitle">
              View your healing receipts, invoice breakdowns, outstanding balances, and payment history.
            </p>
          </div>

          {/* ── Summary Cards ─────────────────────────────────── */}
          <div
            className="healer-stats-grid"
            style={{ marginBottom: '24px' }}
          >
            <div className="healer-stat-card">
              <div className="healer-stat-card__icon-wrap healer-stat-card__icon-wrap--teal">
                <IonIcon icon={cashOutline} />
              </div>
              <div className="healer-stat-card__info">
                <span className="healer-stat-card__label">Total Billed</span>
                <strong className="healer-stat-card__value" style={{ fontSize: '20px' }}>
                  ₹{fmt(totalBilled)}
                </strong>
              </div>
            </div>

            <div className="healer-stat-card">
              <div className="healer-stat-card__icon-wrap healer-stat-card__icon-wrap--teal">
                <IonIcon icon={checkmarkCircleOutline} />
              </div>
              <div className="healer-stat-card__info">
                <span className="healer-stat-card__label">Total Paid</span>
                <strong className="healer-stat-card__value" style={{ fontSize: '20px' }}>
                  ₹{fmt(totalPaid)}
                </strong>
              </div>
            </div>

            <div className="healer-stat-card">
              <div
                className="healer-stat-card__icon-wrap healer-stat-card__icon-wrap--blue"
                style={totalOutstanding > 0 ? { background: '#fef2f2', color: '#dc2626' } : {}}
              >
                <IonIcon icon={walletOutline} />
              </div>
              <div className="healer-stat-card__info">
                <span className="healer-stat-card__label">Outstanding</span>
                <strong
                  className="healer-stat-card__value"
                  style={{ fontSize: '20px', color: totalOutstanding > 0 ? '#dc2626' : undefined }}
                >
                  ₹{fmt(totalOutstanding)}
                </strong>
              </div>
            </div>
          </div>

          {/* ── Ledger Table ───────────────────────────────────── */}
          <AppCard padding="large" shadow>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b', margin: '0 0 16px 0' }}>
              Billing Ledger &amp; Invoices
            </h3>

            {/* Loading */}
            {isLoading && (
              <div style={{ textAlign: 'center', padding: '40px 16px', color: '#0d9488' }}>
                <IonSpinner name="crescent" style={{ color: '#0d9488' }} />
                <p style={{ marginTop: '12px', fontWeight: 600, color: '#64748b' }}>
                  Loading payment history…
                </p>
              </div>
            )}

            {/* Error */}
            {!isLoading && isError && (
              <div style={{ textAlign: 'center', padding: '40px 16px', color: '#ef4444' }}>
                <p style={{ margin: 0, fontWeight: 600 }}>Failed to load payment records.</p>
                <button className="healer-btn" onClick={() => refetch()} style={{ marginTop: '12px' }}>
                  Retry
                </button>
              </div>
            )}

            {/* Empty */}
            {!isLoading && !isError && entries.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px 16px', color: '#94a3b8' }}>
                <IonIcon
                  icon={receiptOutline}
                  style={{ fontSize: '48px', opacity: 0.3, display: 'block', margin: '0 auto 8px' }}
                />
                <p style={{ margin: 0 }}>No billing records found for your account.</p>
              </div>
            )}

            {/* Table */}
            {!isLoading && !isError && entries.length > 0 && (
              <div className="dm-table-container" style={{ margin: 0, border: 'none', boxShadow: 'none' }}>
                <table className="dm-table">
                  <thead>
                    <tr>
                      {/* <th>INVOICE ID</th> */}
                      <th>SESSION NO</th>
                      <th>SESSION DATE</th>
                      <th>TREATMENT</th>
                      <th>HEALER</th>
                      <th>TOTAL BILLED</th>
                      <th>PAID</th>
                      <th>OUTSTANDING</th>
                      <th>METHOD</th>
                      <th>STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {entries.map((entry) => (
                      <tr className="dm-table-row" key={entry.id}>
                        {/* <td style={{ fontWeight: 700, color: '#1e293b' }}>{entry.id}</td> */}
                        <td style={{ color: '#0f766e', fontWeight: 600 }}>{entry.sessionNo}</td>
                        <td style={{ color: '#475569', whiteSpace: 'nowrap' }}>
                          {toDisplayDate(entry.sessionDate)}
                        </td>
                        <td style={{ maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {entry.treatmentType}
                        </td>
                        <td>{entry.healer}</td>
                        <td style={{ fontWeight: 600 }}>₹{fmt(entry.totalBilled)}</td>
                        <td style={{ color: '#16a34a', fontWeight: 600 }}>₹{fmt(entry.paid)}</td>
                        <td style={{ color: entry.outstanding > 0 ? '#dc2626' : '#64748b', fontWeight: 600 }}>
                          ₹{fmt(entry.outstanding)}
                        </td>
                        <td style={{ color: '#475569' }}>
                          {entry.paymentMethod || '—'}
                        </td>
                        <td>
                          <span className={statusBadgeClass(entry.paymentStatus)}>
                            {entry.paymentStatus}
                          </span>
                        </td>
                      </tr>
                    ))}
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