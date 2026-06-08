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
  IonModal,
} from '@ionic/react';
import {
  timeOutline,
  arrowBackOutline,
  personOutline,
  calendarOutline,
  leafOutline,
  documentTextOutline,
  closeOutline,
} from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';
import AppCard from '../../components/common/AppCard';
import '../branch-admin/branch-admin.css';
import '../healer/Healers.css';

interface HealingSession {
  id: number;
  sessionNo: string;
  date: string;
  startTime: string;
  endTime: string;
  patient: string;
  healer: string;
  type: string;
  status: 'Completed' | 'Scheduled' | 'Cancelled';
  paymentStatus: 'Paid' | 'Pending';
  notes?: {
    treatmentType: string;
    observations: string;
    detailedNotes: string;
    recommendation: string;
  };
}

const SessionHistoryPage: React.FC = () => {
  const history = useHistory();
  const { user } = useAuthStore();

  const userName = user?.name || 'Valued Patient';
  const userEmail = user?.email || 'patient@phms.com';

  const [sessions, setSessions] = React.useState<HealingSession[]>([]);
  const [selectedSession, setSelectedSession] = React.useState<HealingSession | null>(null);

  // Load sessions from localStorage
  React.useEffect(() => {
    // 1. Resolve patient name
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

    // 2. Load sessions matching patientName
    const savedSessions = localStorage.getItem('phms_sessions');
    let filtered: HealingSession[] = [];
    if (savedSessions) {
      try {
        const parsed: HealingSession[] = JSON.parse(savedSessions);
        filtered = parsed.filter(
          (s) => s.patient?.toLowerCase().trim() === patientName.toLowerCase().trim()
        );
      } catch (e) {
        console.error(e);
      }
    }

    // Fallback/Sample data for session history if empty
    if (filtered.length === 0) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];

      filtered = [
        {
          id: Date.now() - 3600000 * 2, // Booked 2 hours ago
          sessionNo: 'SESS-2041',
          date: tomorrowStr,
          startTime: '10:00 AM',
          endTime: '11:00 AM',
          patient: patientName,
          healer: currentHealer,
          type: 'Advanced Pranic Healing',
          status: 'Scheduled',
          paymentStatus: 'Pending'
        },
        {
          id: Date.now() - 3600000 * 48, // Booked 2 days ago
          sessionNo: 'SESS-2035',
          date: yesterdayStr,
          startTime: '11:00 AM',
          endTime: '12:00 PM',
          patient: patientName,
          healer: currentHealer,
          type: 'Basic Pranic Healing',
          status: 'Completed',
          paymentStatus: 'Paid',
          notes: {
            treatmentType: 'Basic Pranic Healing',
            observations: 'Patient reported moderate stress levels and shoulder tension. Performed aura cleansing and energized the solar plexus and throat chakras. Patient felt lighter immediately after the session.',
            detailedNotes: 'Successfully completed the basic chakra alignment protocol. Cleansed both front and back solar plexus chakras. Energized the throat chakra to ease communication blockages.',
            recommendation: 'Perform soft breathing exercises daily in the morning. Hydrate well and walk in nature twice a day.'
          }
        }
      ];
    }

    // Sort by date/time descending
    filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setSessions(filtered);
  }, [userEmail, userName]);

  return (
    <IonPage className="sa-page">
      <IonHeader className="ion-no-border">
        <IonToolbar className="sa-page__toolbar">
          <IonTitle className="sa-page__toolbar-title">Healing Sessions History</IonTitle>
          <IonButtons slot="end">
            <IonMenuButton />
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent className="sa-page__content">
        <div className="healer-container">
          
          <div className="healer-header-box">
            <h1 className="healer-page-title">Session History</h1>
            <p className="healer-page-subtitle">
              Track your complete healing timeline. View notes and recommendations logged by your assigned healer.
            </p>
          </div>

          <AppCard padding="large" shadow>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#1e293b', margin: '0 0 16px 0' }}>
              My Healing Sessions ({sessions.length})
            </h3>

            {sessions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 16px', color: '#94a3b8' }}>
                <IonIcon icon={timeOutline} style={{ fontSize: '48px', opacity: 0.3, marginBottom: '8px' }} />
                <p style={{ margin: 0 }}>No session logs found on your account.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {sessions.map((session) => (
                  <div 
                    key={session.id}
                    style={{
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '12px',
                      padding: '18px',
                      transition: 'all 0.2s',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <strong style={{ fontSize: '16px', color: '#0f172a' }}>{session.sessionNo}</strong>
                          <span style={{ fontSize: '12px', background: '#e2f5f1', color: '#0f766e', padding: '2px 8px', borderRadius: '4px', fontWeight: '700' }}>
                            {session.type}
                          </span>
                        </div>
                        
                        <p style={{ margin: '8px 0 0 0', fontSize: '13px', color: '#475569', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <IonIcon icon={personOutline} style={{ color: '#0d9488' }} /> Healer: <strong>{session.healer}</strong>
                        </p>
                        
                        <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <IonIcon icon={calendarOutline} style={{ color: '#0d9488' }} /> Conducted: <strong>{session.date} • {session.startTime} - {session.endTime}</strong>
                        </p>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                        <span className={`healer-status-badge ${
                          session.status === 'Completed' ? 'healer-status-badge--completed' : 'healer-status-badge--scheduled'
                        }`}>
                          {session.status}
                        </span>

                        {/* {session.status === 'Completed' && (
                          <button 
                            className="healer-photo-upload-btn"
                            style={{ border: '1px solid #0f766e', color: '#0f766e', background: 'transparent' }}
                            onClick={() => setSelectedSession(session)}
                          >
                            View Notes & Advice
                          </button>
                        )} */}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </AppCard>

        </div>

        {/* Detailed Session Notes Modal */}
        <IonModal 
          isOpen={selectedSession !== null} 
          onDidDismiss={() => setSelectedSession(null)}
          className="healer-modal-popup"
        >
          <div className="healer-modal-container">
            <IonHeader className="ion-no-border">
              <IonToolbar className="healer-modal-toolbar">
                <IonTitle>Session Notes: {selectedSession?.sessionNo}</IonTitle>
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
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                        <span style={{ color: '#64748b' }}>Session Modality</span>
                        <strong style={{ color: '#0f766e' }}>{selectedSession.type}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                        <span style={{ color: '#64748b' }}>Healing Practitioner</span>
                        <strong style={{ color: '#1e293b' }}>{selectedSession.healer}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                        <span style={{ color: '#64748b' }}>Conduct Date</span>
                        <strong style={{ color: '#1e293b' }}>{selectedSession.date}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                        <span style={{ color: '#64748b' }}>Timing Slot</span>
                        <strong style={{ color: '#1e293b' }}>{selectedSession.startTime} - {selectedSession.endTime}</strong>
                      </div>
                    </div>
                  </AppCard>

                  {/* Observations Section */}
                  <div>
                    <h4 style={{ fontSize: '14px', fontWeight: '800', color: '#0f766e', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
                      Healer Observations & Aura Assessment
                    </h4>
                    <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px', fontSize: '14px', color: '#334155', lineHeight: 1.5 }}>
                      {selectedSession.notes?.observations && selectedSession.notes.observations !== '—' 
                        ? selectedSession.notes.observations 
                        : 'No observations logged for this session.'
                      }
                    </div>
                  </div>

                  {/* Detailed Notes Section */}
                  <div>
                    <h4 style={{ fontSize: '14px', fontWeight: '800', color: '#0f766e', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
                      Session Treatment Summary
                    </h4>
                    <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px', fontSize: '14px', color: '#334155', lineHeight: 1.5 }}>
                      {selectedSession.notes?.detailedNotes && selectedSession.notes.detailedNotes !== '—' 
                        ? selectedSession.notes.detailedNotes 
                        : 'No detailed clinical summary logged.'
                      }
                    </div>
                  </div>

                  {/* Recommendations Section */}
                  <div>
                    <h4 style={{ fontSize: '14px', fontWeight: '800', color: '#7c3aed', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <IonIcon icon={leafOutline} /> Healer Recommendations & Advice
                    </h4>
                    <div style={{ background: '#faf8fc', border: '1px solid #faf5ff', borderRadius: '8px', padding: '16px', fontSize: '14px', color: '#5b21b6', lineHeight: 1.5, fontWeight: '500' }}>
                      {selectedSession.notes?.recommendation && selectedSession.notes.recommendation !== '—' 
                        ? selectedSession.notes.recommendation 
                        : 'No specific recommendations logged yet. Ensure regular practice of physical exercises and meditation as advised.'
                      }
                    </div>
                  </div>

                  <button 
                    className="healer-btn-primary" 
                    onClick={() => setSelectedSession(null)}
                    style={{ padding: '12px', borderRadius: '8px', border: 'none', background: '#0f766e', color: 'white', fontWeight: '700', cursor: 'pointer', marginTop: '12px' }}
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