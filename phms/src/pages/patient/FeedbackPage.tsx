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
  arrowBackOutline,
  star,
  starOutline,
  checkmarkCircleOutline,
  timeOutline,
  calendarOutline,
  personOutline,
} from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';
import AppCard from '../../components/common/AppCard';
import '../branch-admin/branch-admin.css';
import '../healer/Healers.css';
import './Patient.css';

interface Feedback {
  id: number;
  sessionId: number;
  sessionNo: string;
  patientName: string;
  healerName: string;
  rating: number;
  comments: string;
  date: string;
}

const FeedbackPage: React.FC = () => {
  const history = useHistory();
  const { user } = useAuthStore();

  const userName = user?.name || 'Valued Patient';
  const userEmail = user?.email || 'patient@phms.com';

  // State
  const [sessions, setSessions] = React.useState<any[]>([]);
  const [feedbacks, setFeedbacks] = React.useState<Feedback[]>([]);
  const [selectedSession, setSelectedSession] = React.useState<any | null>(null);
  
  // Form State
  const [rating, setRating] = React.useState<number>(5);
  const [comments, setComments] = React.useState<string>('');
  const [successMsg, setSuccessMsg] = React.useState<string | null>(null);

  // Load from localStorage
  React.useEffect(() => {
    // 1. Load patient name and healer
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

    // 2. Load sessions matching patient name and status 'Completed'
    const savedSessions = localStorage.getItem('phms_sessions');
    let completedList: any[] = [];
    if (savedSessions) {
      try {
        const parsed = JSON.parse(savedSessions);
        completedList = parsed.filter(
          (s: any) => 
            s.patient?.toLowerCase().trim() === patientName.toLowerCase().trim() &&
            s.status === 'Completed'
        );
      } catch (e) {
        console.error(e);
      }
    }

    // Fallback completed sessions if empty
    const session2035Id = Date.now() - 3600000 * 48; // keep matching timestamp reference
    if (completedList.length === 0) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      const twoDaysAgo = new Date();
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
      const twoDaysAgoStr = twoDaysAgo.toISOString().split('T')[0];

      completedList = [
        {
          id: Date.now() - 3600000 * 12, // 12 hours ago
          sessionNo: 'SESS-2038',
          date: yesterdayStr,
          startTime: '03:00 PM',
          endTime: '04:00 PM',
          patient: patientName,
          healer: currentHealer,
          type: 'Advanced Pranic Healing',
          status: 'Completed'
        },
        {
          id: session2035Id,
          sessionNo: 'SESS-2035',
          date: twoDaysAgoStr,
          startTime: '11:00 AM',
          endTime: '12:00 PM',
          patient: patientName,
          healer: currentHealer,
          type: 'Basic Pranic Healing',
          status: 'Completed'
        }
      ];
    }
    setSessions(completedList);

    // 3. Load feedbacks list
    const savedFeedbacks = localStorage.getItem('phms_feedbacks');
    let feedbacksList: Feedback[] = [];
    if (savedFeedbacks) {
      try {
        feedbacksList = JSON.parse(savedFeedbacks);
      } catch (e) {
        console.error(e);
      }
    }

    const patientFeedbacks = feedbacksList.filter(
      (f) => f.patientName?.toLowerCase().trim() === patientName.toLowerCase().trim()
    );
    if (patientFeedbacks.length === 0) {
      const sampleFeedback: Feedback = {
        id: Date.now() - 3600000 * 24, // 1 day ago
        sessionId: session2035Id,
        sessionNo: 'SESS-2035',
        patientName: patientName,
        healerName: currentHealer,
        rating: 5,
        comments: 'Excellent healing session. I felt immediate relief from my shoulder tension and felt very calm and energized afterwards. The healer was highly professional and compassionate.',
        date: new Date(Date.now() - 86400000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      };
      
      feedbacksList = [sampleFeedback, ...feedbacksList];
      localStorage.setItem('phms_feedbacks', JSON.stringify(feedbacksList));
    }
    setFeedbacks(feedbacksList);
  }, [userEmail, userName]);

  const handleSubmitFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSession) return;

    const newFeedback: Feedback = {
      id: Date.now(),
      sessionId: selectedSession.id,
      sessionNo: selectedSession.sessionNo,
      patientName: selectedSession.patient,
      healerName: selectedSession.healer,
      rating,
      comments,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    };

    const updatedFeedbacks = [newFeedback, ...feedbacks];
    setFeedbacks(updatedFeedbacks);
    localStorage.setItem('phms_feedbacks', JSON.stringify(updatedFeedbacks));

    // Also write an audit log
    const savedAudits = localStorage.getItem('phms_audits') || '[]';
    try {
      const audits = JSON.parse(savedAudits);
      const newAudit = {
        id: `A-${Math.floor(1000 + Math.random() * 9000)}`,
        action: 'PATIENT_FEEDBACK',
        details: `Patient ${selectedSession.patient} submitted rating of ${rating}/5 for session ${selectedSession.sessionNo}.`,
        changedBy: user?.name || user?.email || 'Patient',
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      };
      localStorage.setItem('phms_audits', JSON.stringify([newAudit, ...audits]));
    } catch (err) {
      console.error(err);
    }

    setSuccessMsg(`Feedback submitted successfully for session ${selectedSession.sessionNo}!`);
    setSelectedSession(null);
    setComments('');
    setRating(5);

    setTimeout(() => {
      setSuccessMsg(null);
    }, 4000);
  };

  const getFeedbackForSession = (sessionId: number) => {
    return feedbacks.find(f => f.sessionId === sessionId);
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
          <IonTitle className="sa-page__toolbar-title">Session Feedback</IonTitle>
          <IonButtons slot="end">
            <IonMenuButton />
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent className="sa-page__content">
        <div className="healer-container pat-container-narrow-900">
          
          <div className="healer-header-box">
            <h1 className="healer-page-title">Give Session Reviews</h1>
            <p className="healer-page-subtitle">
              Your feedback is crucial for tracing progress. Submit ratings and testimonials for your completed sessions.
            </p>
          </div>

          {successMsg && (
            <div className="pat-feedback-success-banner">
              <IonIcon icon={checkmarkCircleOutline} className="pat-success-banner-icon" />
              {successMsg}
            </div>
          )}

          <div className={`pat-feedback-grid ${selectedSession ? 'pat-feedback-grid-2col' : 'pat-feedback-grid-1col'}`}>
            
            {/* Completed Sessions List */}
            <div className="pat-vertical-list-16">
              <AppCard padding="large" shadow>
                <h3 className="pat-card-title-16-m16">
                  Completed Healing Sessions ({sessions.length})
                </h3>

                {sessions.length === 0 ? (
                  <div className="pat-empty-state-container-32">
                    <IonIcon icon={timeOutline} className="pat-empty-state-icon" />
                    <p className="pat-empty-state-text">No completed sessions found to rate.</p>
                  </div>
                ) : (
                  <div className="pat-vertical-list-12">
                    {sessions.map((session) => {
                      const submittedFeedback = getFeedbackForSession(session.id);
                      const isSelected = selectedSession?.id === session.id;

                      return (
                        <div 
                          key={session.id} 
                          className={isSelected ? 'pat-feedback-card-selected' : 'pat-feedback-card-normal'}
                        >
                          <div className="pat-card-header-flex">
                            <div>
                              <div className="pat-flex-align-center-gap8">
                                <strong className="pat-session-no-text">{session.sessionNo}</strong>
                                <span className="pat-session-badge-teal">
                                  {session.type}
                                </span>
                              </div>
                              <p className="pat-card-line-p6">
                                <IonIcon icon={personOutline} /> Healer: {session.healer}
                              </p>
                              <p className="pat-card-line-p4">
                                <IonIcon icon={calendarOutline} /> Conducted: {session.date} • {session.startTime}
                              </p>
                            </div>

                            <div>
                              {submittedFeedback ? (
                                <div className="pat-flex-col-align-end">
                                  <span className="pat-status-submitted-label">
                                    <IonIcon icon={checkmarkCircleOutline} /> Submitted
                                  </span>
                                  <div className="pat-flex-gap2">
                                    {[1, 2, 3, 4, 5].map((s) => (
                                      <IonIcon 
                                        key={s} 
                                        icon={s <= (submittedFeedback.rating || 5) ? star : starOutline} 
                                        className="pat-star-icon"
                                      />
                                    ))}
                                  </div>
                                </div>
                              ) : (
                                <button 
                                  className={isSelected ? 'pat-action-btn-selected' : 'pat-action-btn-normal'}
                                  onClick={() => {
                                    setSelectedSession(session);
                                    setComments('');
                                    setRating(5);
                                  }}
                                >
                                  Submit Review
                                </button>
                              )}
                            </div>
                          </div>

                           {submittedFeedback && (
                             <div className="pat-feedback-details-box">
                               {submittedFeedback.comments && (
                                 <span className="pat-feedback-text">
                                   "{submittedFeedback.comments}"
                                 </span>
                               )}
                               <span className="pat-feedback-date">
                                 Submitted On: {submittedFeedback.date}
                               </span>
                             </div>
                           )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </AppCard>
            </div>

            {/* Submit Feedback Form panel */}
            {selectedSession && (
              <div className="pat-vertical-list-16">
                <AppCard padding="large" shadow>
                  <h3 className="pat-card-title-feedback-header">
                    Rate Session {selectedSession.sessionNo}
                  </h3>

                  <form onSubmit={handleSubmitFeedback} className="healer-form">
                    <div>
                      <span className="healer-form-label">Healer Rating</span>
                      <div className="pat-stars-input-container">
                        {[1, 2, 3, 4, 5].map((starNum) => (
                          <button
                            key={starNum}
                            type="button"
                            className="pat-star-button-input"
                            onClick={() => setRating(starNum)}
                          >
                            <IonIcon 
                              icon={starNum <= rating ? star : starOutline} 
                              className="pat-star-icon-large"
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="healer-form-label">Written Feedback</label>
                      <textarea
                        required
                        rows={4}
                        className="healer-form-textarea"
                        placeholder="Share your experience (e.g., pain relief, energy levels, healer conduct)..."
                        value={comments}
                        onChange={(e) => setComments(e.target.value)}
                      />
                    </div>

                    <div className="pat-button-row">
                      <button 
                        type="submit" 
                        className="healer-btn-primary pat-btn-submit"
                      >
                        Submit Feedback
                      </button>
                      <button 
                        type="button" 
                        className="healer-btn-secondary pat-btn-cancel" 
                        onClick={() => setSelectedSession(null)}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </AppCard>
              </div>
            )}

          </div>

        </div>
      </IonContent>
    </IonPage>
  );
};

export default FeedbackPage;
