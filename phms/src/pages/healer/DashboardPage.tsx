import React, { useState, useEffect } from 'react';
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
} from '@ionic/react';
import {
  peopleOutline,
  calendarOutline,
  timeOutline,
  chevronForwardOutline,
  medkitOutline,
  personOutline,
  documentTextOutline,
  documentOutline,
  folderOpenOutline,
  alertCircleOutline,
} from 'ionicons/icons';
import { useAuthStore } from '../../store/auth.store';
import { useHistory } from 'react-router-dom';
import { getPatients } from '../../api/patient.api';
import { getSessions } from '../../api/session.api';
import '../branch-admin/branch-admin.css';
import './Healers.css';

interface DashboardPatient {
  id: string;
  name: string;
  patientId: string;
  condition: string;
}

interface WeeklyChartData {
  day: string;
  scheduled: number;
  completed: number;
}

const HealerDashboardPage: React.FC = () => {
  const { user } = useAuthStore();
  const history = useHistory();
  const [patients, setPatients] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const userName = user?.name || 'Valued Healer';
  
  const rawBranch = typeof user?.branch === 'object' && user?.branch !== null
    ? (user.branch as any).name
    : (user?.branch || 'Mumbai Main');
  const branchName = rawBranch.toLowerCase().includes('branch') ? rawBranch : `${rawBranch} Branch`;

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [patientsRes, sessionsRes] = await Promise.all([
          getPatients(),
          getSessions()
        ]);

        const apiPatients = Array.isArray(patientsRes) ? patientsRes : (patientsRes.data || patientsRes);
        const apiSessions = Array.isArray(sessionsRes) ? sessionsRes : (sessionsRes.data || sessionsRes);

        if (Array.isArray(apiPatients)) setPatients(apiPatients);
        if (Array.isArray(apiSessions)) setSessions(apiSessions);
      } catch (err) {
        console.error('Failed to load healer dashboard metrics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Compute Core Metrics
  const assignedPatientsCount = patients.length;
  
  const todayStr = new Date().toISOString().split('T')[0];
  const todaySessionsCount = sessions.filter(s => s.sessionDate && new Date(s.sessionDate).toISOString().split('T')[0] === todayStr).length;
  const cumulativeHealingsCount = sessions.filter(s => s.status === 'completed').length;
  const pendingNotesCount = sessions.filter(s => s.status === 'completed' && !s.notes).length;

  const dashboardPatients: DashboardPatient[] = patients.slice(0, 3).map(p => ({
    id: p.id,
    name: p.name || 'Unknown',
    patientId: p.patientId || 'N/A',
    condition: p.treatmentType || 'General Treatment'
  }));

  // Calculate Weekly Chart Data
  const getWeeklyData = (): WeeklyChartData[] => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const counts = days.map(d => ({ day: d, scheduled: 0, completed: 0 }));
    
    // Group sessions in the last 7 days by day of the week
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    sessions.forEach(s => {
      if (!s.sessionDate) return;
      const date = new Date(s.sessionDate);
      if (date >= sevenDaysAgo) {
        const dayName = days[date.getDay()];
        const idx = counts.findIndex(c => c.day === dayName);
        if (idx !== -1) {
          if (s.status === 'completed') {
            counts[idx].completed++;
          } else {
            counts[idx].scheduled++;
          }
        }
      }
    });

    // Reorder to start with Mon -> Sun
    const reorderedDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return reorderedDays.map(day => {
      const found = counts.find(c => c.day === day);
      return found || { day, scheduled: 0, completed: 0 };
    });
  };

  const weeklyData = getWeeklyData();
  const maxSessions = Math.max(...weeklyData.map(d => Math.max(d.scheduled, d.completed)), 1);
  const urgentFollowUpSessions = sessions.filter(s => s.followup_required && s.followup_priority === 'Urgent');
  const urgentFollowUpsCount = urgentFollowUpSessions.length;

  return (
    <IonPage className="sa-page">
      <IonHeader className="ion-no-border">
        <IonToolbar className="sa-page__toolbar">
          <IonButtons slot="start">
            <IonMenuButton />
          </IonButtons>
          <IonTitle className="sa-page__toolbar-title">Healer Portal</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="sa-page__content">
        <div className="healer-container">
          {/* Urgent Follow-Up Alerts Widget (BRD 6.6) */}
          <div className="healer-alert-widget" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="healer-alert-widget__left">
                <IonIcon icon={alertCircleOutline} className="healer-alert-widget__icon" />
                <div>
                  <h4 className="healer-alert-widget__title">Urgent Follow-Ups</h4>
                  <p className="healer-alert-widget__desc">Sessions flagged for urgent follow-up action</p>
                </div>
              </div>
              <span className="healer-alert-widget__count">
                {loading ? <IonSpinner name="dots" style={{ height: '20px' }} /> : urgentFollowUpsCount}
              </span>
            </div>
            {urgentFollowUpsCount > 0 && !loading && (
              <div style={{ marginTop: '1rem', borderTop: '1px solid rgba(231, 76, 60, 0.2)', paddingTop: '0.75rem' }}>
                <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-danger)' }}>Patients requiring attention:</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {urgentFollowUpSessions.map((session: any) => (
                    <div key={session.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(231, 76, 60, 0.05)', padding: '0.5rem 0.75rem', borderRadius: '4px', border: '1px solid rgba(231, 76, 60, 0.1)' }}>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-danger)' }}>{session.patient?.name || 'Unknown Patient'}</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-light)' }}>Session Date: {new Date(session.sessionDate).toLocaleDateString()}</span>
                      </div>
                      <button 
                        onClick={() => history.push(`/healer/patients/details/${session.patient?.id || session.patientId}`)}
                        style={{ background: 'transparent', border: '1px solid rgba(231, 76, 60, 0.5)', color: 'var(--color-danger)', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer', transition: 'all 0.2s ease' }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(231, 76, 60, 0.1)' }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
                      >
                        View Profile
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <h3 className="healer-section-title">
            Quick Stats
          </h3>

          <div className="healer-stats-grid">
            {/* Assigned Patients */}
            <div className="healer-stat-card">
              <div className="healer-stat-card__icon-wrap healer-stat-card__icon-wrap--teal">
                <IonIcon icon={peopleOutline} />
              </div>
              <div className="healer-stat-card__info">
                <span className="healer-stat-card__label">Assigned Patients</span>
                <span className="healer-stat-card__value">
                  {loading ? <IonSpinner name="dots" style={{ height: '20px' }} /> : assignedPatientsCount}
                </span>
              </div>
            </div>

            {/* Today's Sessions */}
            <div className="healer-stat-card">
              <div className="healer-stat-card__icon-wrap healer-stat-card__icon-wrap--blue">
                <IonIcon icon={timeOutline} />
              </div>
              <div className="healer-stat-card__info">
                <span className="healer-stat-card__label">Today's Sessions</span>
                <span className="healer-stat-card__value">
                  {loading ? <IonSpinner name="dots" style={{ height: '20px' }} /> : todaySessionsCount}
                </span>
              </div>
            </div>

            {/* Cumulative Healings */}
            <div className="healer-stat-card">
              <div className="healer-stat-card__icon-wrap healer-stat-card__icon-wrap--emerald">
                <IonIcon icon={medkitOutline} />
              </div>
              <div className="healer-stat-card__info">
                <span className="healer-stat-card__label">Cumulative Healings</span>
                <span className="healer-stat-card__value">
                  {loading ? <IonSpinner name="dots" style={{ height: '20px' }} /> : cumulativeHealingsCount}
                </span>
              </div>
            </div>

            {/* Pending Notes */}
            {/* <div className="healer-stat-card">
              <div className="healer-stat-card__icon-wrap healer-stat-card__icon-wrap--amber">
                <IonIcon icon={documentTextOutline} />
              </div>
              <div className="healer-stat-card__info">
                <span className="healer-stat-card__label">Pending Notes</span>
                <span className="healer-stat-card__value">
                  {loading ? <IonSpinner name="dots" style={{ height: '20px' }} /> : pendingNotesCount}
                </span>
              </div>
            </div> */}
          </div>

          {/* Weekly Sessions Chart Section */}
          {/* <div className="healer-patient-list-widget" style={{ padding: '20px', marginBottom: '1.5rem' }}>
            <div className="healer-patient-list-widget__header" style={{ marginBottom: '1rem' }}>
              <h4 className="healer-patient-list-widget__title">Weekly Sessions Activity</h4>
              <div style={{ display: 'flex', gap: '10px', fontSize: '11px', fontWeight: 600 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--ion-color-primary)', opacity: 0.6 }} />
                  <span>Scheduled</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--ion-color-success)' }} />
                  <span>Completed</span>
                </div>
              </div>
            </div>

            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
                <IonSpinner name="crescent" />
              </div>
            ) : (
              <div className="sa-chart-container" style={{ marginTop: '0.5rem', background: '#f8fafc', padding: '16px', borderRadius: '8px' }}>
                <div className="sa-chart-plot-area" style={{ height: '140px', display: 'flex', justifyContent: 'space-around', alignItems: 'flex-end', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>
                  {weeklyData.map((data, i) => (
                    <div className="sa-chart-day-group sa-chart-group" key={i} style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <div className="sa-chart-bars-row" style={{ display: 'flex', gap: '4px', alignItems: 'flex-end' }}>

                        <div 
                          className="sa-chart-bar" 
                          style={{ 
                            height: `${data.scheduled * scale}px`, 
                            width: '12px',
                            background: 'var(--ion-color-primary)', 
                            opacity: 0.6,
                            borderRadius: '4px 4px 0 0',
                            transition: 'height 0.3s ease'
                          }} 
                          title={`Scheduled: ${data.scheduled}`}
                        />
                        <div 
                          className="sa-chart-bar" 
                          style={{ 
                            height: `${data.completed * scale}px`, 
                            width: '12px',
                            background: 'var(--ion-color-success)', 
                            borderRadius: '4px 4px 0 0',
                            transition: 'height 0.3s ease'
                          }} 
                          title={`Completed: ${data.completed}`}
                        />
                      </div>
                      
                      <div className="sa-chart-tooltip" style={{ minWidth: '100px', padding: '8px', background: '#1e293b', color: 'white', borderRadius: '4px', position: 'absolute', bottom: '100%', left: '50%', transform: 'translateX(-50%)', marginBottom: '8px', zIndex: 10, pointerEvents: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                        <div style={{ fontWeight: 700, fontSize: '11px', marginBottom: '4px', borderBottom: '1px solid rgba(255,255,255,0.2)', paddingBottom: '2px', textAlign: 'center' }}>
                          {data.day} Sessions
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '10px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
                            <span>Scheduled:</span>
                            <strong>{data.scheduled}</strong>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
                            <span>Completed:</span>
                            <strong>{data.completed}</strong>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="sa-chart-x-axis" style={{ display: 'flex', justifyContent: 'space-around', marginTop: '8px' }}>
                  {weeklyData.map((data, i) => (
                    <div key={i} style={{ width: '28px', textAlign: 'center' }}>
                      <span className="sa-chart-label" style={{ fontSize: '11px', fontWeight: 600, color: '#64748b' }}>{data.day}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div> */}

          {/* Assigned Patient List Widget (BRD 6.11) */}
          <div className="healer-patient-list-widget">
            <div className="healer-patient-list-widget__header">
              <h4 className="healer-patient-list-widget__title">Recent Assigned Patients</h4>
              <button 
                className="healer-patient-list-widget__view-all"
                onClick={() => history.push('/healer/patients')}
              >
                View All <IonIcon icon={chevronForwardOutline} />
              </button>
            </div>
            <div className="healer-patient-list-widget__list">
              {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
                  <IonSpinner name="crescent" />
                </div>
              ) : dashboardPatients.length > 0 ? (
                dashboardPatients.map(patient => (
                  <div 
                    key={patient.id}
                    className="healer-patient-row"
                    onClick={() => history.push('/healer/patients')}
                  >
                    <div className="healer-patient-row__left">
                      <div className="healer-patient-row__avatar">
                        {patient.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="healer-patient-row__info">
                        <span className="healer-patient-row__name">{patient.name}</span>
                        <span className="healer-patient-row__meta">
                          {patient.patientId}
                          <span className="healer-patient-row__condition">{patient.condition}</span>
                        </span>
                      </div>
                    </div>
                    <div className="healer-patient-row__right">
                      <IonIcon icon={chevronForwardOutline} />
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--ion-color-medium)' }}>
                  No assigned patients found.
                </div>
              )}
            </div>
          </div>

          <h3 className="healer-section-title">
            Healer Actions
          </h3>

          <div className="healer-actions-grid">
            {/* Assigned Patients Page Link */}
            <div 
              className="healer-action-card" 
              onClick={() => history.push('/healer/patients')}
            >
              <div className="healer-action-card__inner">
                <div className="healer-action-card__left">
                  <div className="healer-stat-card__icon-wrap healer-stat-card__icon-wrap--teal">
                    <IonIcon icon={peopleOutline} className="healer-action-card__icon" />
                  </div>
                  <div>
                    <h4 className="healer-action-card__title">
                      Assigned Patients
                    </h4>
                    <p className="healer-action-card__subtitle">
                      View patient profile, medical history, and uploaded documents.
                    </p>
                  </div>
                </div>
                <IonIcon icon={chevronForwardOutline} className="healer-action-card__arrow" />
              </div>
            </div>

            {/* Sessions List Page Link */}
            <div 
              className="healer-action-card" 
              onClick={() => history.push('/healer/sessions')}
            >
              <div className="healer-action-card__inner">
                <div className="healer-action-card__left">
                  <div className="healer-stat-card__icon-wrap healer-stat-card__icon-wrap--blue">
                    <IonIcon icon={timeOutline} className="healer-action-card__icon" />
                  </div>
                  <div>
                    <h4 className="healer-action-card__title">
                      Sessions
                    </h4>
                    <p className="healer-action-card__subtitle">
                      View today's sessions, history, and patient records.
                    </p>
                  </div>
                </div>
                <IonIcon icon={chevronForwardOutline} className="healer-action-card__arrow" />
              </div>
            </div>

            {/* Session Notes Form Link */}
            <div 
              className="healer-action-card" 
              onClick={() => history.push('/healer/session-notes')}
            >
              <div className="healer-action-card__inner">
                <div className="healer-action-card__left">
                  <div className="healer-stat-card__icon-wrap healer-stat-card__icon-wrap--emerald">
                    <IonIcon icon={documentOutline} className="healer-action-card__icon" />
                  </div>
                  <div>
                    <h4 className="healer-action-card__title">
                      Session Notes
                    </h4>
                    <p className="healer-action-card__subtitle">
                      Enter treatment details, observations, notes, and follow-up flags.
                    </p>
                  </div>
                </div>
                <IonIcon icon={chevronForwardOutline} className="healer-action-card__arrow" />
              </div>
            </div>

            {/* Documents Directory Link */}
            {/* <div 
              className="healer-action-card" 
              onClick={() => history.push('/healer/documents')}
            >
              <div className="healer-action-card__inner">
                <div className="healer-action-card__left">
                  <div className="healer-stat-card__icon-wrap healer-stat-card__icon-wrap--teal">
                    <IonIcon icon={folderOpenOutline} className="healer-action-card__icon" />
                  </div>
                  <div>
                    <h4 className="healer-action-card__title">
                      Documents
                    </h4>
                    <p className="healer-action-card__subtitle">
                      Access doctor reports, lab records, and consultation files.
                    </p>
                  </div>
                </div>
                <IonIcon icon={chevronForwardOutline} className="healer-action-card__arrow" />
              </div>
            </div>   */}
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default HealerDashboardPage;