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
  IonSearchbar,
} from '@ionic/react';
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
import './Healers.css';

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

  // Mock sessions list (BRD 6.11)
  const [sessions] = useState<Session[]>([
    {
      id: '1',
      sessionId: 'SES-2001',
      patientName: 'Rajesh Kumar',
      patientId: 'PAT-10023',
      date: '2026-06-07',
      time: '10:00 AM - 10:45 AM',
      status: 'Completed',
      protocol: 'Basic Pranic Healing - Back pain protocol',
      notesAdded: true,
    },
    {
      id: '2',
      sessionId: 'SES-2002',
      patientName: 'Priya Sharma',
      patientId: 'PAT-10045',
      date: '2026-06-07',
      time: '02:30 PM - 03:15 PM',
      status: 'In Progress',
      protocol: 'Advanced Pranic Healing - Stress & Anxiety protocol',
      notesAdded: false,
    },
    {
      id: '3',
      sessionId: 'SES-2003',
      patientName: 'Amit Patel',
      patientId: 'PAT-10088',
      date: '2026-06-07',
      time: '05:00 PM - 05:45 PM',
      status: 'Scheduled',
      protocol: 'Pranic Psychotherapy - Post-stroke healing',
      notesAdded: false,
    },
    {
      id: '4',
      sessionId: 'SES-1994',
      patientName: 'Neha Gupta',
      patientId: 'PAT-10112',
      date: '2026-06-05',
      time: '11:30 AM - 12:15 PM',
      status: 'Completed',
      protocol: 'Basic Pranic Healing - Insomnia protocol',
      notesAdded: true,
    },
    {
      id: '5',
      sessionId: 'SES-1988',
      patientName: 'Rajesh Kumar',
      patientId: 'PAT-10023',
      date: '2026-06-03',
      time: '10:00 AM - 10:45 AM',
      status: 'Completed',
      protocol: 'Basic Pranic Healing - Back pain protocol',
      notesAdded: true,
    },
  ]);

  const todayStr = '2026-06-07'; // Match mock date to current mock context date

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
            <table className="healer-table">
              <thead>
                <tr>
                  <th>Session ID</th>
                  <th>Patient</th>
                  <th>Date & Time</th>
                  <th>Protocol / Treatment</th>
                  <th>Status</th>
                  {/* <th>Notes Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th> */}
                </tr>
              </thead>
              <tbody>
                {filteredSessions.length > 0 ? (
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
                      <td>{session.protocol}</td>
                      <td>
                        <span className={getStatusClass(session.status)}>{session.status}</span>
                      </td>
                      {/* <td>
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
                      <td style={{ textAlign: 'right' }}>
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
      </IonContent>
    </IonPage>
  );
};

export default SessionLogPage;
