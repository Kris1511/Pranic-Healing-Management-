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
  IonModal,
  IonSpinner,
  useIonViewWillEnter,
  useIonViewWillLeave,
} from '@ionic/react';
import {
  timeOutline,
  arrowBackOutline,
  personOutline,
  calendarOutline,
  leafOutline,
  closeOutline,
  refreshOutline,
} from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';
import { useQuery } from '@tanstack/react-query';
import AppCard from '../../components/common/AppCard';
import { getSessions } from '../../api/session.api';
import '../branch-admin/branch-admin.css';
import '../healer/Healers.css';
import './Patient.css';

/* ─── Types ──────────────────────────────────────────────────────── */
interface SessionRecord {
  id: string;
  sessionNo: string;
  date: string;
  startTime: string;
  endTime: string;
  healer: string;
  type: string;
  status: 'Completed' | 'Scheduled' | 'Cancelled';
  paymentStatus: 'Paid' | 'Pending';
  notes?: string;
  branchName?: string;
  totalAmount?: number | string;
  paymentMethod?: string;
  followupRequired?: boolean;
  followupDate?: string;
  followupPriority?: string;
}

/* ─── Helpers ─────────────────────────────────────────────────────── */
const toLocalDate = (raw: string | null | undefined): string => {
  if (!raw) return 'N/A';
  if (raw.length === 10 && /^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    return raw;
  }
  if (raw.includes('T')) {
    return raw.split('T')[0];
  }
  const d = new Date(raw);
  if (isNaN(d.getTime())) return 'N/A';
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
};

const normaliseStatus = (s: string): 'Completed' | 'Scheduled' | 'Cancelled' => {
  const lower = (s || '').toLowerCase();
  if (lower === 'completed') return 'Completed';
  if (lower === 'cancelled') return 'Cancelled';
  return 'Scheduled';
};

const normalisePayment = (p: string): 'Paid' | 'Pending' =>
  (p || '').toLowerCase() === 'paid' ? 'Paid' : 'Pending';

const mapApiSession = (s: any): SessionRecord => ({
  id: s.id,
  sessionNo: s.sessionNo || `SES-${String(s.id).substring(0, 6).toUpperCase()}`,
  date: toLocalDate(s.sessionDate || s.session_date || s.createdAt),
  startTime: s.startTime || s.start_time || '—',
  endTime: s.endTime || s.end_time || '—',
  healer: s.healer?.name
    ? (s.healer.name.startsWith('Dr.') ? s.healer.name : `Dr. ${s.healer.name}`)
    : (s.healer_name ? `Dr. ${s.healer_name}` : 'Unknown Healer'),
  type: s.treatmentType || s.treatment_type || s.type || 'Pranic Healing',
  status: normaliseStatus(s.status),
  paymentStatus: normalisePayment(s.paymentStatus || s.payment_status),
  notes: s.notes || undefined,
  branchName: s.branch?.name || s.branch_name || 'Unknown Branch',
  totalAmount: s.totalAmount || s.total_amount || s.sessionFee || s.session_fee,
  paymentMethod: s.paymentMethod || s.payment_method || '—',
  followupRequired: s.followupRequired || s.followup_required,
  followupDate: toLocalDate(s.followupDate || s.followup_date),
  followupPriority: s.followupPriority || s.followup_priority,
});

/* ─── Component ───────────────────────────────────────────────────── */
const SessionHistoryPage: React.FC = () => {
  const history = useHistory();
  const { user } = useAuthStore();
  const [selectedSession, setSelectedSession] = useState<SessionRecord | null>(null);
  const [isPageActive, setIsPageActive] = useState(true);

  useIonViewWillEnter(() => setIsPageActive(true));
  useIonViewWillLeave(() => setIsPageActive(false));

  /* Live polling — re-fetches every 3 s while page is visible */
  const { data, isLoading, isError, refetch } = useQuery<SessionRecord[]>({
    queryKey: ['patient-sessions', user?.email],
    queryFn: async () => {
      const res = await getSessions();
      const raw: any[] = Array.isArray(res?.data) ? res.data : [];
      return raw
        .map(mapApiSession)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    },
    enabled: !!user,
    refetchInterval: isPageActive ? 3000 : false,
    staleTime: 0,
  });

  const sessions: SessionRecord[] = data ?? [];

  /* ─── Status badge helper ─────────────────────────────────────── */
  const statusClass = (status: SessionRecord['status']) => {
    if (status === 'Completed') return 'healer-status-badge healer-status-badge--completed';
    if (status === 'Cancelled') return 'healer-status-badge healer-status-badge--cancelled';
    return 'healer-status-badge healer-status-badge--scheduled';
  };

  return (
    <IonPage className="sa-page">
      <IonHeader className="ion-no-border">
        <IonToolbar className="sa-page__toolbar">
          <IonButtons slot="start">
            <button className="healer-back-btn" onClick={() => history.push('/patient/dashboard')}>
              <IonIcon icon={arrowBackOutline} />
            </button>
          </IonButtons>
          <IonTitle className="sa-page__toolbar-title">Healing Sessions History</IonTitle>
          <IonButtons slot="end">
            <button
              className="healer-back-btn"
              onClick={() => refetch()}
              title="Refresh sessions"
              style={{ marginRight: '4px' }}
            >
              <IonIcon icon={refreshOutline} />
            </button>
            <IonMenuButton />
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent className="sa-page__content">
        <div className="healer-container pat-container-narrow-900">

          <div className="healer-header-box">
            <h1 className="healer-page-title">Session History</h1>
            <p className="healer-page-subtitle">
              Track your complete healing timeline. View notes and details logged by your assigned healer.
            </p>
          </div>

          <AppCard padding="large" shadow>
            <h3 className="pat-card-title-16-m16">
              My Healing Sessions ({sessions.length})
            </h3>

            {/* Loading state */}
            {isLoading && (
              <div style={{ textAlign: 'center', padding: '40px 16px', color: '#0d9488' }}>
                <IonSpinner name="crescent" style={{ color: '#0d9488' }} />
                <p style={{ marginTop: '12px', fontWeight: 600, color: '#64748b' }}>
                  Loading your sessions…
                </p>
              </div>
            )}

            {/* Error state */}
            {!isLoading && isError && (
              <div style={{ textAlign: 'center', padding: '40px 16px', color: '#ef4444' }}>
                <p style={{ margin: 0, fontWeight: 600 }}>Failed to load sessions.</p>
                <button
                  className="healer-btn"
                  onClick={() => refetch()}
                  style={{ marginTop: '12px' }}
                >
                  Retry
                </button>
              </div>
            )}

            {/* Empty state */}
            {!isLoading && !isError && sessions.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px 16px', color: '#94a3b8' }}>
                <IonIcon icon={timeOutline} style={{ fontSize: '48px', opacity: 0.3, marginBottom: '8px', display: 'block', margin: '0 auto 8px' }} />
                <p style={{ margin: 0 }}>No session records found for your account.</p>
              </div>
            )}

            {/* Sessions list */}
            {!isLoading && !isError && sessions.length > 0 && (
              <div className="pat-vertical-list-16">
                {sessions.map((session) => (
                  <div key={session.id} className="pat-session-card">
                    <div className="pat-card-header-flex">
                      <div>
                        <div className="pat-flex-align-center-gap8">
                          <strong className="pat-session-no-text">{session.sessionNo}</strong>
                          <span className="pat-session-badge-teal">{session.type}</span>
                        </div>

                        <p className="pat-card-line-p6">
                          <IonIcon icon={personOutline} /> Healer: <strong>{session.healer}</strong>
                        </p>

                        <p className="pat-card-line-p4">
                          <IonIcon icon={calendarOutline} /> Conducted:{' '}
                          <strong>{session.date} • {session.startTime} – {session.endTime}</strong>
                        </p>

                        <p className="pat-card-line-p4" style={{ marginTop: '4px' }}>
                          Payment:{' '}
                          <span style={{
                            fontWeight: 700,
                            color: session.paymentStatus === 'Paid' ? '#0d9488' : '#f59e0b',
                          }}>
                            {session.paymentStatus}
                          </span>
                        </p>
                      </div>

                      <div className="pat-card-right-flex">
                        <span className={statusClass(session.status)}>
                          {session.status}
                        </span>

                        <button
                          className="pat-btn-notes-outline"
                          onClick={() => setSelectedSession(session)}
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </AppCard>
        </div>

        {/* Session Details Modal */}
        <IonModal
          isOpen={selectedSession !== null}
          onDidDismiss={() => setSelectedSession(null)}
          className="healer-modal-popup"
        >
          <div className="healer-modal-container">
            <IonHeader className="ion-no-border">
              <IonToolbar className="healer-modal-toolbar">
                <IonTitle>Session Details: {selectedSession?.sessionNo}</IonTitle>
                <IonButtons slot="end">
                  <button className="healer-modal-close-btn" onClick={() => setSelectedSession(null)}>
                    <IonIcon icon={closeOutline} style={{ fontSize: '24px' }} />
                  </button>
                </IonButtons>
              </IonToolbar>
            </IonHeader>

            <IonContent className="ion-padding healer-modal-content">
              {selectedSession && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '16px 8px' }}>

                  {/* Overview Card */}
                  <AppCard padding="large" shadow>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {[
                        ['Session Modality', selectedSession.type],
                        ['Healing Practitioner', selectedSession.healer],
                        ['Branch', selectedSession.branchName],
                        ['Conduct Date', selectedSession.date],
                        ['Timing Slot', `${selectedSession.startTime} – ${selectedSession.endTime}`],
                        ['Session Status', selectedSession.status],
                        ['Payment Status', selectedSession.paymentStatus],
                        ['Amount / Fee', `₹${selectedSession.totalAmount || 0}`],
                        ['Payment Method', selectedSession.paymentMethod],
                        ['Follow-up Required', selectedSession.followupRequired ? 'Yes' : 'No'],
                        ...(selectedSession.followupRequired ? [
                          ['Follow-up Date', selectedSession.followupDate !== 'N/A' ? selectedSession.followupDate : 'Pending'],
                          ['Follow-up Priority', selectedSession.followupPriority]
                        ] : []),
                      ].map(([label, value]) => (
                        <div key={label as string} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                          <span style={{ color: '#64748b' }}>{label}</span>
                          <strong style={{ color: '#0f766e', textAlign: 'right' }}>{value as React.ReactNode}</strong>
                        </div>
                      ))}
                    </div>
                  </AppCard>

                  {/* Notes Section */}
                  <div>
                    <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#0f766e', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
                      Healer Notes &amp; Observations
                    </h4>
                    <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px', fontSize: '14px', color: '#334155', lineHeight: 1.5 }}>
                      {selectedSession.notes && selectedSession.notes !== '—'
                        ? selectedSession.notes
                        : 'No notes logged for this session.'}
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedSession(null)}
                    style={{ padding: '12px', borderRadius: '8px', border: 'none', background: '#0f766e', color: 'white', fontWeight: 700, cursor: 'pointer', marginTop: '12px' }}
                  >
                    Done
                  </button>
                </div>
              )}
            </IonContent>
          </div>
        </IonModal>

      </IonContent>
    </IonPage>
  );
};

export default SessionHistoryPage;