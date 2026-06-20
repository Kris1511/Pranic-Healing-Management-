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
  calendarOutline,
  timeOutline,
  medkitOutline,
  documentTextOutline,
  chevronForwardOutline,
  personOutline,
  chatboxOutline,
  businessOutline,
  personCircleOutline
} from 'ionicons/icons';
import { useAuthStore } from '../../store/auth.store';
import { useHistory } from 'react-router-dom';
import { getPatients } from '../../api/patient.api';
import { getSessions } from '../../api/session.api';
import '../branch-admin/branch-admin.css';
import '../healer/Healers.css';

const PatientDashboardPage: React.FC = () => {
  const { user } = useAuthStore();
  const history = useHistory();

  const userName = user?.name || 'Valued Patient';

  const [patientData, setPatientData] = React.useState<any>(null);
  const [upcomingCount, setUpcomingCount] = React.useState(0);
  const [completedCount, setCompletedCount] = React.useState(0);
  const [recordsCount, setRecordsCount] = React.useState(0);

  React.useEffect(() => {
    const fetchPatientData = async () => {
      if (user?.email) {
        try {
          const res = await getPatients({ email: user.email });
          if (res.data && res.data.length > 0) {
            setPatientData(res.data[0]);
          }
        } catch (e) {
          console.error('Failed to fetch patient data', e);
        }
      }
    };
    fetchPatientData();
  }, [user?.email]);

  React.useEffect(() => {
    if (patientData?.id) {
      getSessions({ patientId: patientData.id })
        .then((res: any) => {
          if (res.data) {
            const upcoming = res.data.filter((s: any) => s.status === 'Scheduled').length;
            const completed = res.data.filter((s: any) => s.status === 'Completed').length;
            setUpcomingCount(upcoming);
            setCompletedCount(completed);
            setRecordsCount(patientData.documents?.length || 0);
          }
        })
        .catch(console.error);
    } else {
      // Fallback for UI if patient not loaded yet
      setUpcomingCount(0);
      setCompletedCount(0);
      setRecordsCount(0);
    }
  }, [patientData]);

  return (
    <IonPage className="sa-page">
      <IonHeader className="ion-no-border">
        <IonToolbar className="sa-page__toolbar">
          <IonButtons slot="start">
            <IonMenuButton />
          </IonButtons>
          <IonTitle className="sa-page__toolbar-title">Patient Portal</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="sa-page__content">
        <div className="healer-container">
          <div className="healer-alert-widget" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
            <div className="healer-alert-widget__left">
              <IonIcon icon={medkitOutline} className="healer-alert-widget__icon" />
              <div>
                <h4 className="healer-alert-widget__title" style={{ color: 'white' }}>Welcome back, {userName}!</h4>
                <p className="healer-alert-widget__desc" style={{ color: 'rgba(255,255,255,0.9)' }}>We hope you're having a wonderful day.</p>
              </div>
            </div>
          </div>

          {patientData && (
            <>
              <h3 className="healer-section-title">Assigned Details</h3>
              <div className="healer-stats-grid">
                {patientData.branch && (
                  <div className="healer-stat-card">
                    <div className="healer-stat-card__icon-wrap" style={{ background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6' }}>
                      <IonIcon icon={businessOutline} />
                    </div>
                    <div className="healer-stat-card__info">
                      <span className="healer-stat-card__label">Branch</span>
                      <span className="healer-stat-card__value" style={{ fontSize: '1.1rem' }}>{patientData.branch.name}</span>
                    </div>
                  </div>
                )}
                
                {patientData.healer ? (
                  <div className="healer-stat-card">
                    <div className="healer-stat-card__icon-wrap healer-stat-card__icon-wrap--teal">
                      <IonIcon icon={personCircleOutline} />
                    </div>
                    <div className="healer-stat-card__info">
                      <span className="healer-stat-card__label">Assigned Healer</span>
                      <span className="healer-stat-card__value" style={{ fontSize: '1.1rem' }}>{patientData.healer.name}</span>
                    </div>
                  </div>
                ) : (
                  <div className="healer-stat-card">
                    <div className="healer-stat-card__icon-wrap" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
                      <IonIcon icon={personCircleOutline} />
                    </div>
                    <div className="healer-stat-card__info">
                      <span className="healer-stat-card__label">Assigned Healer</span>
                      <span className="healer-stat-card__value" style={{ fontSize: '1rem', color: '#6b7280' }}>Unassigned</span>
                    </div>
                  </div>
                )}

                {patientData.treatmentType ? (
                  <div className="healer-stat-card">
                    <div className="healer-stat-card__icon-wrap" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
                      <IonIcon icon={medkitOutline} />
                    </div>
                    <div className="healer-stat-card__info">
                      <span className="healer-stat-card__label">Treatment</span>
                      <span className="healer-stat-card__value" style={{ fontSize: '1.1rem', textTransform: 'capitalize' }}>{patientData.treatmentType}</span>
                    </div>
                  </div>
                ) : (
                  <div className="healer-stat-card">
                    <div className="healer-stat-card__icon-wrap" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
                      <IonIcon icon={medkitOutline} />
                    </div>
                    <div className="healer-stat-card__info">
                      <span className="healer-stat-card__label">Treatment</span>
                      <span className="healer-stat-card__value" style={{ fontSize: '1rem', color: '#6b7280' }}>Unassigned</span>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          <h3 className="healer-section-title">
            Your Overview
          </h3>

          <div className="healer-stats-grid">
            <div className="healer-stat-card">
              <div className="healer-stat-card__icon-wrap healer-stat-card__icon-wrap--teal">
                <IonIcon icon={calendarOutline} />
              </div>
              <div className="healer-stat-card__info">
                <span className="healer-stat-card__label">Upcoming Sessions</span>
                <span className="healer-stat-card__value">{upcomingCount}</span>
              </div>
            </div>

            <div className="healer-stat-card">
              <div className="healer-stat-card__icon-wrap healer-stat-card__icon-wrap--blue">
                <IonIcon icon={medkitOutline} />
              </div>
              <div className="healer-stat-card__info">
                <span className="healer-stat-card__label">Completed Sessions</span>
                <span className="healer-stat-card__value">{completedCount}</span>
              </div>
            </div>

            <div className="healer-stat-card">
              <div className="healer-stat-card__icon-wrap healer-stat-card__icon-wrap--emerald">
                <IonIcon icon={documentTextOutline} />
              </div>
              <div className="healer-stat-card__info">
                <span className="healer-stat-card__label">Health Records</span>
                <span className="healer-stat-card__value">{recordsCount}</span>
              </div>
            </div>
          </div>

          <h3 className="healer-section-title">
            Quick Actions
          </h3>

          <div className="healer-actions-grid">
            <div 
              className="healer-action-card" 
              onClick={() => history.push('/patient/session-history')}
            >
              <div className="healer-action-card__inner">
                <div className="healer-action-card__left">
                  <div className="healer-stat-card__icon-wrap healer-stat-card__icon-wrap--teal">
                    <IonIcon icon={timeOutline} className="healer-action-card__icon" />
                  </div>
                  <div>
                    <h4 className="healer-action-card__title">
                      Session History
                    </h4>
                    <p className="healer-action-card__subtitle">
                      View your session timeline, healer notes, and advice.
                    </p>
                  </div>
                </div>
                <IonIcon icon={chevronForwardOutline} className="healer-action-card__arrow" />
              </div>
            </div>

            <div 
              className="healer-action-card" 
              onClick={() => history.push('/patient/payment-history')}
            >
              <div className="healer-action-card__inner">
                <div className="healer-action-card__left">
                  <div className="healer-stat-card__icon-wrap healer-stat-card__icon-wrap--emerald">
                    <IonIcon icon={documentTextOutline} className="healer-action-card__icon" />
                  </div>
                  <div>
                    <h4 className="healer-action-card__title">
                      Payment History
                    </h4>
                    <p className="healer-action-card__subtitle">
                      Review your invoices, receipts, and payment status.
                    </p>
                  </div>
                </div>
                <IonIcon icon={chevronForwardOutline} className="healer-action-card__arrow" />
              </div>
            </div>

            <div 
              className="healer-action-card" 
              onClick={() => history.push('/patient/profile')}
            >
              <div className="healer-action-card__inner">
                <div className="healer-action-card__left">
                  <div className="healer-stat-card__icon-wrap healer-stat-card__icon-wrap--blue">
                    <IonIcon icon={personOutline} className="healer-action-card__icon" />
                  </div>
                  <div>
                    <h4 className="healer-action-card__title">
                      My Profile
                    </h4>
                    <p className="healer-action-card__subtitle">
                      Update your personal details and contact information.
                    </p>
                  </div>
                </div>
                <IonIcon icon={chevronForwardOutline} className="healer-action-card__arrow" />
              </div>
            </div>

            <div 
              className="healer-action-card" 
              onClick={() => history.push('/patient/feedback')}
            >
              <div className="healer-action-card__inner">
                <div className="healer-action-card__left">
                  <div className="healer-stat-card__icon-wrap healer-stat-card__icon-wrap--purple">
                    <IonIcon icon={chatboxOutline} className="healer-action-card__icon" />
                  </div>
                  <div>
                    <h4 className="healer-action-card__title">
                      Feedback
                    </h4>
                    <p className="healer-action-card__subtitle">
                      Submit ratings and testimonials for your completed sessions.
                    </p>
                  </div>
                </div>
                <IonIcon icon={chevronForwardOutline} className="healer-action-card__arrow" />
              </div>
            </div>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default PatientDashboardPage;
