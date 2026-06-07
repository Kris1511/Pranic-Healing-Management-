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
import '../branch-admin/branch-admin.css';
import './Healers.css';

const HealerDashboardPage: React.FC = () => {
  const { user } = useAuthStore();
  const history = useHistory();

  const userName = user?.name || 'Valued Healer';
  
  const rawBranch = typeof user?.branch === 'object' && user?.branch !== null
    ? (user.branch as any).name
    : (user?.branch || 'Mumbai Main');
  const branchName = rawBranch.toLowerCase().includes('branch') ? rawBranch : `${rawBranch} Branch`;

  const dashboardPatients = [
    { id: '1', name: 'Rajesh Kumar', patientId: 'PAT-10023', condition: 'Chronic Back Pain' },
    { id: '2', name: 'Priya Sharma', patientId: 'PAT-10045', condition: 'Anxiety & Migraine' },
    { id: '3', name: 'Amit Patel', patientId: 'PAT-10088', condition: 'Post-stroke Rehabilitation' },
  ];

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
          <div className="healer-alert-widget">
            <div className="healer-alert-widget__left">
              <IonIcon icon={alertCircleOutline} className="healer-alert-widget__icon" />
              <div>
                <h4 className="healer-alert-widget__title">Urgent Follow-Ups</h4>
                <p className="healer-alert-widget__desc">Sessions flagged for urgent follow-up action</p>
              </div>
            </div>
            <span className="healer-alert-widget__count">2</span>
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
                <span className="healer-stat-card__value">5</span>
              </div>
            </div>

            {/* Today's Sessions */}
            <div className="healer-stat-card">
              <div className="healer-stat-card__icon-wrap healer-stat-card__icon-wrap--blue">
                <IonIcon icon={timeOutline} />
              </div>
              <div className="healer-stat-card__info">
                <span className="healer-stat-card__label">Today's Sessions</span>
                <span className="healer-stat-card__value">2</span>
              </div>
            </div>

            {/* Cumulative Healings */}
            <div className="healer-stat-card">
              <div className="healer-stat-card__icon-wrap healer-stat-card__icon-wrap--emerald">
                <IonIcon icon={medkitOutline} />
              </div>
              <div className="healer-stat-card__info">
                <span className="healer-stat-card__label">Cumulative Healings</span>
                <span className="healer-stat-card__value">142</span>
              </div>
            </div>

            {/* Pending Notes */}
            <div className="healer-stat-card">
              <div className="healer-stat-card__icon-wrap healer-stat-card__icon-wrap--amber">
                <IonIcon icon={documentTextOutline} />
              </div>
              <div className="healer-stat-card__info">
                <span className="healer-stat-card__label">Pending Notes</span>
                <span className="healer-stat-card__value">3</span>
              </div>
            </div>
          </div>

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
              {dashboardPatients.map(patient => (
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
              ))}
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