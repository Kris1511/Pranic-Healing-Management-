import React, { useState, useEffect, useMemo } from 'react';
import {
  IonPage,
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonMenuButton,
  IonIcon,
  IonSearchbar,
  IonSpinner,
  useIonViewWillEnter,
  useIonViewWillLeave,
} from '@ionic/react';
import { useQuery } from '@tanstack/react-query';
import {
  timeOutline,
  checkmarkCircleOutline,
  alertCircleOutline,
  documentTextOutline,
  calendarOutline,
  searchOutline,
} from 'ionicons/icons';
import { useAuthStore } from '../../store/auth.store';
import { useHistory } from 'react-router-dom';
import { getSessions } from '../../api/session.api';
import './Healers.css';

import ProfileDropdown from '../../components/common/ProfileDropdown';

interface Session {
  id: string;
  sessionId: string;
  patientName: string;
  patientId: string;
  time: string;
  date: string;
  status: 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled';
  protocol: string;
  notesAdded: boolean;
}

const SessionLogPage: React.FC = () => {
  const { user } = useAuthStore();
  const history = useHistory();
  const [activeTab, setActiveTab] = useState<'today' | 'all'>('today');
  const [searchText, setSearchText] = useState('');
  const [isPageActive, setIsPageActive] = useState(true);

  const todayStr = (() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  })();

  const { data: apiSessionsRes, isLoading, error, refetch } = useQuery({
    queryKey: ['sessions'],
    queryFn: getSessions,
    refetchInterval: isPageActive ? 3000 : false, // Poll every 3 seconds for real-time live synchronization
  });

  useIonViewWillEnter(() => {
    setIsPageActive(true);
    refetch();
  });

  useIonViewWillLeave(() => {
    setIsPageActive(false);
  });

  const sessions = useMemo<Session[]>(() => {
    if (!apiSessionsRes) return [];
    const apiSessions = Array.isArray(apiSessionsRes)
      ? apiSessionsRes
      : (apiSessionsRes.data || apiSessionsRes);

    if (!Array.isArray(apiSessions)) return [];

    const mapStatus = (status: string): Session['status'] => {
      const s = status ? status.toLowerCase() : '';
      if (s === 'completed') return 'Completed';
      if (s === 'cancelled') return 'Cancelled';
      if (s === 'ongoing' || s === 'in progress') return 'In Progress';
      return 'Scheduled';
    };

    return apiSessions.map((s: any) => ({
      id: s.id,
      sessionId: s.id ? 'SES-' + s.id.substring(0, 5).toUpperCase() : 'SES-N/A',
      patientName: s.patient?.name || 'Unknown Patient',
      patientId: s.patient?.patientId || 'N/A',
      date: s.sessionDate 
        ? (() => {
            const d = new Date(s.sessionDate);
            return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
          })()
        : 'N/A',
      time: s.startTime ? (s.endTime ? `${s.startTime} - ${s.endTime}` : s.startTime) : 'N/A',
      status: mapStatus(s.status),
      protocol: s.treatments && s.treatments.length > 0 
        ? s.treatments.map((t: any) => t.treatmentName).join(', ') 
        : 'Pranic Restoration',
      notesAdded: !!s.notes,
    }));
  }, [apiSessionsRes]);
  // console.log('session: ', sessions)

  const loading = isLoading;
  const errorMsg = error ? 'Failed to retrieve sessions log.' : null;

  const filteredSessions = sessions.filter((session) => {
    const matchesSearch =
      session.patientName.toLowerCase().includes(searchText.toLowerCase()) ||
      session.patientId.toLowerCase().includes(searchText.toLowerCase()) ||
      session.sessionId.toLowerCase().includes(searchText.toLowerCase()) ||
      session.protocol.toLowerCase().includes(searchText.toLowerCase());

    if (activeTab === 'today') {
      return session.date === todayStr && matchesSearch;
    }
    return matchesSearch;
  });

  const getStatusClass = (status: Session['status']) => {
    switch (status) {
      case 'Completed':
        return 'healer-badge healer-badge--success';
      case 'In Progress':
        return 'healer-badge healer-badge--primary';
      case 'Scheduled':
        return 'healer-badge healer-badge--warning';
      case 'Cancelled':
        return 'healer-badge';
      default:
        return 'healer-badge';
    }
  };

  return (
    <IonPage className="sa-page">
      <IonHeader className="ion-no-border">
        <IonToolbar className="sa-page__toolbar">
          <IonButtons slot="start">
            <IonMenuButton />
          </IonButtons>
          <IonTitle className="sa-page__toolbar-title">Sessions Log</IonTitle>
        
          <IonButtons slot="end">
            <ProfileDropdown />
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent className="sa-page__content">
        <div className="healer-page-container">
          <div>
            <h2 style={{ margin: 0, fontWeight: 700, fontSize: '1.4rem' }}>Healing Sessions</h2>
            <p style={{ margin: '0.2rem 0 0 0', color: 'var(--ion-color-medium)', fontSize: '0.9rem' }}>
              Track scheduled appointments, perform healings, and complete treatment records.
            </p>
          </div>

          {/* Custom Tabs */}
          <div style={{ display: 'flex', gap: '0.5rem', margin: '1.5rem 0 0.5rem 0' }}>            
            <button
              className={`healer-btn ${activeTab === 'today' ? '' : 'healer-btn--secondary'}`}
              onClick={() => setActiveTab('today')}
              style={{ borderRadius: '20px', padding: '0.5rem 1.25rem' }}
            >
              Today's Sessions
            </button>            
            <button
              className={`healer-btn ${activeTab === 'all' ? '' : 'healer-btn--secondary'}`}
              onClick={() => setActiveTab('all')}
              style={{ borderRadius: '20px', padding: '0.5rem 1.25rem' }}
            >
              All Sessions
            </button>
          </div>

          <div className="sa-search" style={{ margin: '1rem 0', maxWidth: '100%' }}>
            <IonIcon icon={searchOutline} />
            <input
              placeholder="Search sessions by patient, ID, or protocol..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>

          <div className="healer-table-card">
            <div style={{ overflowX: 'auto' }}>
              <table className="healer-table">
              <thead>
                <tr>
                  <th>Session ID</th>
                  <th>Patient</th>
                  <th>Date & Time</th>
                  {/* <th>Protocol / Treatment</th> */}
                  <th>Status</th>
                  <th>Notes Status</th>
                  {/* <th style={{ textAlign: 'right' }}>Actions</th> */}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '3rem' }}>
                      <IonSpinner name="crescent" />
                      <p style={{ margin: '0.5rem 0 0 0', fontWeight: 500, color: 'var(--ion-color-medium)' }}>Loading sessions...</p>
                    </td>
                  </tr>
                ) : errorMsg ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: 'var(--ion-color-danger)' }}>
                      <p style={{ margin: 0, fontWeight: 500 }}>{errorMsg}</p>
                    </td>
                  </tr>
                ) : filteredSessions.length > 0 ? (
                  filteredSessions.map((session) => (
                    <tr key={session.id}>
                      <td style={{ fontWeight: 600 }}>{session.sessionId}</td>
                      <td>
                        <span style={{ fontWeight: 600, display: 'block' }}>{session.patientName}</span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--ion-color-medium)' }}>
                          {session.patientId}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <IonIcon icon={calendarOutline} style={{ color: 'var(--ion-color-medium)' }} />
                          <span>{session.date}</span>
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--ion-color-medium)', marginTop: '0.15rem' }}>
                          {session.time}
                        </div>
                      </td>
                      {/* <td>{session.protocol}</td> */}
                      <td>
                        <span className={getStatusClass(session.status)}>{session.status}</span>
                      </td>
                      <td>
                        {session.notesAdded ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#10b981', fontWeight: 600, fontSize: '0.85rem' }}>
                            <IonIcon icon={checkmarkCircleOutline} /> Saved
                          </div>
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#f59e0b', fontWeight: 600, fontSize: '0.85rem' }}>
                            <IonIcon icon={alertCircleOutline} /> Pending
                          </div>
                        )}
                      </td>
                      {/* <td style={{ textAlign: 'right' }}>
                        <button
                          className={`healer-btn ${session.notesAdded ? 'healer-btn--secondary' : ''}`}
                          onClick={() => history.push(`/healer/session-notes?sessionId=${session.id}`)}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                        >
                          <IonIcon icon={documentTextOutline} />
                          {session.notesAdded ? 'Edit Notes' : 'Add Notes'}
                        </button>
                      </td> */}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: 'var(--ion-color-medium)' }}>
                      <IonIcon icon={timeOutline} style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.5 }} />
                      <p style={{ margin: 0, fontWeight: 500 }}>No sessions found matching your filter criteria.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            </div>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default SessionLogPage;
