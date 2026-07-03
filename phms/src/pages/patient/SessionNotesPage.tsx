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
  arrowBackOutline,
  personOutline,
  calendarOutline,
  documentTextOutline,
  timeOutline,
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

import ProfileDropdown from '../../components/common/ProfileDropdown';

/* ─── Types ──────────────────────────────────────────────────────── */
interface SessionRecord {
  id: string;
  sessionNo: string;
  date: string;
  startTime: string;
  endTime: string;
  healer: string;
  type: string;
  notes?: string;
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
  notes: s.notes || undefined,
});

/* ─── Component ───────────────────────────────────────────────────── */
const PatientSessionNotesPage: React.FC = () => {
  const history = useHistory();
  const { user } = useAuthStore();
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
  console.log('session: ', sessions);
  const sessionsWithNotes = sessions.filter(s => s.notes && s.notes.trim() !== '' && s.notes !== '—');

  return (
    <IonPage className="sa-page">
      <IonHeader className="ion-no-border">
        <IonToolbar className="sa-page__toolbar">
          <IonButtons slot="start">
            <IonMenuButton />
            {/* <button className="healer-back-btn" onClick={() => history.push('/patient/dashboard')}>
              <IonIcon icon={arrowBackOutline} />
            </button> */}
          </IonButtons>
          <IonTitle className="sa-page__toolbar-title">Healing Session Notes</IonTitle>
          <IonButtons slot="end">
            <button
              className="healer-back-btn"
              onClick={() => refetch()}
              title="Refresh notes"
              style={{ marginRight: '4px' }}
            >
              <IonIcon icon={refreshOutline} />
            </button>
          
              <ProfileDropdown />
</IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent className="sa-page__content">
        <div className="healer-container pat-container-narrow">
          <div className="healer-header-box">
            <h1 className="healer-page-title">Session Notes</h1>
            <p className="healer-page-subtitle">
              Review the healing notes, observations, and recommendations logged by your healers.
            </p>
          </div>

          <AppCard padding="large" shadow>
            <h3 className="pat-card-title-16-m16">
              My Healing Notes ({sessionsWithNotes.length})
            </h3>

            {/* Loading state */}
            {isLoading && (
              <div style={{ textAlign: 'center', padding: '40px 16px', color: '#0d9488' }}>
                <IonSpinner name="crescent" style={{ color: '#0d9488' }} />
                <p style={{ marginTop: '12px', fontWeight: 600, color: '#64748b' }}>
                  Loading your notes…
                </p>
              </div>
            )}

            {/* Error state */}
            {!isLoading && isError && (
              <div style={{ textAlign: 'center', padding: '40px 16px', color: '#ef4444' }}>
                <p style={{ margin: 0, fontWeight: 600 }}>Failed to load notes.</p>
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
            {!isLoading && !isError && sessionsWithNotes.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px 16px', color: '#94a3b8' }}>
                <IonIcon icon={documentTextOutline} style={{ fontSize: '48px', opacity: 0.3, marginBottom: '8px', display: 'block', margin: '0 auto 8px' }} />
                <p style={{ margin: 0 }}>No session notes have been recorded yet.</p>
              </div>
            )}

            {/* Notes list */}
            {!isLoading && !isError && sessionsWithNotes.length > 0 && (
              <div className="pat-vertical-list-16">
                {sessionsWithNotes.map((session) => (
                  <div key={session.id} className="pat-session-card" style={{ display: 'block' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                      <div>
                        <div className="pat-flex-align-center-gap8">
                          <strong className="pat-session-no-text">{session.sessionNo}</strong>
                          <span className="pat-session-badge-teal">{session.type}</span>
                        </div>
                        <p className="pat-card-line-p6" style={{ marginTop: '6px' }}>
                          <IonIcon icon={personOutline} /> Healer: <strong>{session.healer}</strong>
                        </p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p className="pat-card-line-p4">
                          <IonIcon icon={calendarOutline} /> <strong>{session.date}</strong>
                        </p>
                        <p className="pat-card-line-p4" style={{ marginTop: '4px' }}>
                          {session.startTime} – {session.endTime}
                        </p>
                      </div>
                    </div>
                    
                    <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px', fontSize: '14px', color: '#334155', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                      {session.notes}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </AppCard>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default PatientSessionNotesPage;
