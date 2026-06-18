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
  chatboxOutline
} from 'ionicons/icons';
import { useAuthStore } from '../../store/auth.store';
import { useHistory } from 'react-router-dom';
import '../branch-admin/branch-admin.css';
import '../healer/Healers.css';

const PatientDashboardPage: React.FC = () => {
  const { user } = useAuthStore();
  const history = useHistory();

  const userName = user?.name || 'Valued Patient';

  const [upcomingCount, setUpcomingCount] = React.useState(0);
  const [completedCount, setCompletedCount] = React.useState(0);
  const [recordsCount, setRecordsCount] = React.useState(0);

  React.useEffect(() => {
    let patientName = userName;
    const savedPatients = localStorage.getItem('phms_patients');
    if (savedPatients) {
      try {
        const parsed = JSON.parse(savedPatients);
        const found = parsed.find((p: any) => p.email?.toLowerCase() === user?.email?.toLowerCase());
        if (found) {
          patientName = found.name;
        }
      } catch (e) {
        console.error(e);
      }
    }

    const savedSessions = localStorage.getItem('phms_sessions');
    let upcoming = 0;
    let completed = 0;

    if (savedSessions) {
      try {
        const parsed = JSON.parse(savedSessions);
        const filtered = parsed.filter(
          (s: any) => s.patient?.toLowerCase().trim() === patientName.toLowerCase().trim()
        );
        upcoming = filtered.filter((s: any) => s.status === 'Scheduled').length;
        completed = filtered.filter((s: any) => s.status === 'Completed').length;
      } catch (e) {
        console.error(e);
      }
    } else {
      upcoming = 1;
      completed = 12;
    }

    setUpcomingCount(upcoming);
    setCompletedCount(completed);
    setRecordsCount(completed > 0 ? completed : 4);
  }, [user?.email, userName]);


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
