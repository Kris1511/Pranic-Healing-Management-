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
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSessions } from '../../api/session.api';
import { getFeedbacks, createFeedback } from '../../api/feedback.api';
import '../branch-admin/branch-admin.css';
import '../healer/Healers.css';
import './Patient.css';

import ProfileDropdown from '../../components/common/ProfileDropdown';

interface SessionRecord {
  id: string;
  sessionNo: string;
  date: string;
  startTime: string;
  endTime: string;
  healer: string;
  type: string;
  status: 'Completed' | 'Scheduled' | 'Cancelled';
  patient: string; // added to submit feedback properly
  patientId: string;
  branchId: string;
}

interface Feedback {
  id: string | number;
  sessionId: string | number;
  sessionNo: string;
  patientName: string;
  healerName: string;
  rating: number;
  comment?: string;
  comments?: string; // mapped from comment
  date: string;
  createdAt?: string;
}

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
  patient: s.patient?.name || s.patient_name || 'Valued Patient',
  patientId: s.patientId || s.patient_id,
  branchId: s.branchId || s.branch_id,
});

const FeedbackPage: React.FC = () => {
  const history = useHistory();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  // State
  const [selectedSession, setSelectedSession] = useState<SessionRecord | null>(null);
  
  // Form State
  const [rating, setRating] = useState<number>(5);
  const [comments, setComments] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const { data: sessions = [], isLoading, isError } = useQuery<SessionRecord[]>({
    queryKey: ['patient-sessions-completed', user?.email],
    queryFn: async () => {
      const res = await getSessions();
      const raw: any[] = Array.isArray(res?.data) ? res.data : [];
      return raw
        .map(mapApiSession)
        .filter(s => s.status === 'Completed')
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    },
    enabled: !!user,
  });

  const { data: rawFeedbacks = [] } = useQuery<any[]>({
    queryKey: ['feedbacks', user?.email],
    queryFn: async () => {
      const res = await getFeedbacks();
      return Array.isArray(res?.data) ? res.data : [];
    },
    enabled: !!user,
  });

  const feedbacks: Feedback[] = rawFeedbacks.map(f => ({
    id: f.id,
    sessionId: f.sessionId || f.session_id,
    sessionNo: '', // Not strictly needed for mapping, display handles it
    patientName: f.patient?.name || '',
    healerName: '',
    rating: f.rating,
    comments: f.comment || '',
    date: new Date(f.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }));

  const createFeedbackMutation = useMutation({
    mutationFn: createFeedback,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedbacks'] });
      setSuccessMsg(`Feedback submitted successfully for session ${selectedSession?.sessionNo}!`);
      setSelectedSession(null);
      setComments('');
      setRating(5);
      setTimeout(() => setSuccessMsg(null), 4000);
    },
    onError: (error: any) => {
      alert(error?.response?.data?.message || 'Failed to submit feedback');
    }
  });

  const handleSubmitFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSession) return;

    createFeedbackMutation.mutate({
      sessionId: selectedSession.id,
      patientId: selectedSession.patientId,
      branchId: selectedSession.branchId,
      rating,
      comment: comments,
    });

  };

  const getFeedbackForSession = (sessionId: string | number) => {
    return feedbacks.find(f => String(f.sessionId) === String(sessionId));
  };

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
          <IonTitle className="sa-page__toolbar-title">Session Feedback</IonTitle>
          <IonButtons slot="end">
          
              <ProfileDropdown />
</IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent className="sa-page__content">
        <div className="healer-container pat-container-narrow">
          
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

                {isLoading && (
                  <div style={{ textAlign: 'center', padding: '40px 16px', color: '#0d9488' }}>
                    <IonSpinner name="crescent" style={{ color: '#0d9488' }} />
                    <p style={{ marginTop: '12px', fontWeight: 600, color: '#64748b' }}>
                      Loading your completed sessions…
                    </p>
                  </div>
                )}

                {!isLoading && isError && (
                  <div style={{ textAlign: 'center', padding: '40px 16px', color: '#ef4444' }}>
                    <p style={{ margin: 0, fontWeight: 600 }}>Failed to load sessions.</p>
                  </div>
                )}

                {!isLoading && !isError && sessions.length === 0 ? (
                  <div className="pat-empty-state-container-32">
                    <IonIcon icon={timeOutline} className="pat-empty-state-icon" />
                    <p className="pat-empty-state-text">No completed sessions found to rate.</p>
                  </div>
                ) : (
                  !isLoading && !isError && (
                    <div className="pat-vertical-list-12">
                      {sessions.map((session) => {
                        const submittedFeedback = getFeedbackForSession(session.id);
                        const isSelected = selectedSession?.id === session.id;

                        return (
                          <div 
                            key={session.id} 
                            className={isSelected ? 'pat-feedback-card-selected' : 'pat-feedback-card-normal'}
                          >
                            <div className="pat-feedback-card-inner" style={{ position: 'relative' }}>
                              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', rowGap: '10px', alignItems: 'center' }}>
                                
                                {/* Row 1: Treatment Type & Submit Button / Tag */}
                                <div className="pat-flex-align-center-gap8" style={{ minWidth: 0 }}>
                                  <strong className="pat-session-no-text">{session.sessionNo}</strong>
                                  <span className="pat-session-badge-teal">
                                    {session.type}
                                  </span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                  {submittedFeedback ? (
                                    <span className="pat-status-submitted-label">
                                      <IonIcon icon={checkmarkCircleOutline} /> Submitted
                                    </span>
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

                                {/* Row 2: Healer & Stars */}
                                <div className="pat-card-line-p6" style={{ margin: 0, minWidth: 0 }}>
                                  <IonIcon icon={personOutline} style={{ minWidth: '16px' }} />
                                  <span>Healer: <strong>{session.healer}</strong></span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                  {submittedFeedback && (
                                    <div className="pat-flex-gap2">
                                      {[1, 2, 3, 4, 5].map((s) => (
                                        <IonIcon 
                                          key={s} 
                                          icon={s <= (submittedFeedback.rating || 5) ? star : starOutline} 
                                          className="pat-star-icon"
                                        />
                                      ))}
                                    </div>
                                  )}
                                </div>

                                {/* Row 3: Conducted (Spans both columns) */}
                                <div className="pat-card-line-p4" style={{ margin: 0, minWidth: 0, gridColumn: '1 / -1', whiteSpace: 'nowrap' }}>
                                  <IonIcon icon={calendarOutline} style={{ minWidth: '16px' }} />
                                  <span>Conducted: <strong>{session.date} • {session.startTime}</strong></span>
                                </div>

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
                  )
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
                        className="healer-btn pat-btn-submit"
                        disabled={createFeedbackMutation.isPending}
                      >
                        {createFeedbackMutation.isPending ? 'Submitting...' : 'Submit Feedback'}
                      </button>
                      <button 
                        type="button" 
                        className="healer-btn healer-btn--secondary pat-btn-cancel" 
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
