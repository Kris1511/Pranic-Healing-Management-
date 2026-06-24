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
  calendarOutline,
  timeOutline,
  medkitOutline,
  documentTextOutline,
  chevronForwardOutline,
  personOutline,
  chatboxOutline,
  businessOutline,
  personCircleOutline,
  cashOutline,
  notificationsOutline,
} from 'ionicons/icons';
import { useAuthStore } from '../../store/auth.store';
import { useHistory } from 'react-router-dom';
import { getPatients } from '../../api/patient.api';
import { getSessions } from '../../api/session.api';
import { getPayments } from '../../api/payment.api';
import '../branch-admin/branch-admin.css';
import '../healer/Healers.css';

const PatientDashboardPage: React.FC = () => {
  const { user } = useAuthStore();
  const history = useHistory();

  const userName = user?.name || 'Valued Patient';

  const [patientData, setPatientData] = React.useState<any>(null);
  const [totalPaid, setTotalPaid] = React.useState(0);
  const [completedCount, setCompletedCount] = React.useState(0);
  const [recordsCount, setRecordsCount] = React.useState(0);

  const [notifications, setNotifications] = React.useState<any[]>([]);
  const [showNotificationsModal, setShowNotificationsModal] = React.useState(false);

  // Load patient notifications from localStorage
  const loadNotifications = React.useCallback(() => {
    try {
      const saved = localStorage.getItem('phms_notifications') || '[]';
      const parsed = JSON.parse(saved);
      
      const targetEmail = user?.email?.toLowerCase();
      const targetName = (patientData?.name || user?.name || '').toLowerCase().trim();
      const targetId = patientData?.id;
      
      // Filter for In-App notifications destined for this patient
      const patientNotifs = parsed.filter((n: any) => {
        if (n.type !== 'In-App') return false;
        
        const matchesEmail = n.recipient && targetEmail && n.recipient.toLowerCase() === targetEmail;
        const matchesId = targetId && n.recipient === targetId;
        const matchesName = n.recipientName && targetName && n.recipientName.toLowerCase().trim() === targetName;
        const matchesRecipientAsName = n.recipient && targetName && n.recipient.toLowerCase().trim() === targetName;
        
        return matchesEmail || matchesId || matchesName || matchesRecipientAsName;
      });
      // Sort notifications by timestamp descending (newest first)
      patientNotifs.sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setNotifications(patientNotifs);
    } catch (e) {
      console.error('Failed to load notifications from localStorage:', e);
    }
  }, [user?.email, user?.name, patientData?.id, patientData?.name]);

  React.useEffect(() => {
    loadNotifications();
  }, [loadNotifications, showNotificationsModal]);

  const markAsRead = (notifId: string) => {
    try {
      const saved = localStorage.getItem('phms_notifications') || '[]';
      const parsed = JSON.parse(saved);
      const updated = parsed.map((n: any) => {
        if (n.id === notifId) {
          return { ...n, status: 'read' };
        }
        return n;
      });
      localStorage.setItem('phms_notifications', JSON.stringify(updated));
      loadNotifications();
    } catch (e) {
      console.error(e);
    }
  };

  const deleteNotification = (notifId: string) => {
    try {
      const saved = localStorage.getItem('phms_notifications') || '[]';
      const parsed = JSON.parse(saved);
      const updated = parsed.filter((n: any) => n.id !== notifId);
      localStorage.setItem('phms_notifications', JSON.stringify(updated));
      loadNotifications();
    } catch (e) {
      console.error(e);
    }
  };

  const markAllAsRead = () => {
    if (!user?.email) return;
    try {
      const saved = localStorage.getItem('phms_notifications') || '[]';
      const parsed = JSON.parse(saved);
      const updated = parsed.map((n: any) => {
        const matchesEmail = n.recipient && n.recipient.toLowerCase() === user.email.toLowerCase();
        const matchesId = patientData?.id && n.recipient === patientData.id;
        if (n.type === 'In-App' && (matchesEmail || matchesId)) {
          return { ...n, status: 'read' };
        }
        return n;
      });
      localStorage.setItem('phms_notifications', JSON.stringify(updated));
      loadNotifications();
    } catch (e) {
      console.error(e);
    }
  };

  const unreadCount = notifications.filter((n) => n.status === 'unread').length;

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
            const completed = res.data.filter((s: any) => (s.status || '').toLowerCase() === 'completed').length;
            setCompletedCount(completed);
            setRecordsCount(patientData.documents?.length || 0);
          }
        })
        .catch(console.error);

      getPayments()
        .then((res: any) => {
          if (res.data) {
            const raw = Array.isArray(res.data) ? res.data : [];
            const sumPaid = raw.reduce((sum: number, item: any) => sum + (parseFloat(item.paid) || 0), 0);
            setTotalPaid(sumPaid);
          }
        })
        .catch(console.error);
    } else {
      // Fallback for UI if patient not loaded yet
      setTotalPaid(0);
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
          <IonButtons slot="end">
            <div className="sa-page__toolbar-actions" style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingRight: '12px' }}>
              <button 
                onClick={() => setShowNotificationsModal(true)} 
                style={{ 
                  background: 'transparent', 
                  border: 'none', 
                  cursor: 'pointer', 
                  fontSize: '24px', 
                  color: '#0D5C46', 
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '6px',
                  borderRadius: '50%',
                  transition: 'background 0.2s',
                  outline: 'none'
                }}
                title="Notifications"
              >
                <IonIcon icon={notificationsOutline} />
                {unreadCount > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: '2px',
                    right: '2px',
                    background: '#ef4444',
                    color: '#ffffff',
                    fontSize: '9px',
                    fontWeight: 800,
                    borderRadius: '50%',
                    minWidth: '16px',
                    height: '16px',
                    padding: '0 3px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 0 0 2px #ffffff',
                    transform: 'translate(20%, -20%)'
                  }}>
                    {unreadCount}
                  </span>
                )}
              </button>
            </div>
          </IonButtons>
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
            <div 
              className="healer-stat-card"
              onClick={() => history.push('/patient/payment-history')}
              style={{ cursor: 'pointer' }}
            >
              <div className="healer-stat-card__icon-wrap healer-stat-card__icon-wrap--teal">
                <IonIcon icon={cashOutline} />
              </div>
              <div className="healer-stat-card__info">
                <span className="healer-stat-card__label">Total Paid</span>
                <span className="healer-stat-card__value">₹{totalPaid.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
              </div>
            </div>

            <div 
              className="healer-stat-card"
              onClick={() => history.push('/patient/session-history')}
              style={{ cursor: 'pointer' }}
            >
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

        {/* Notifications Drawer Modal */}
        <IonModal 
          isOpen={showNotificationsModal} 
          onDidDismiss={() => setShowNotificationsModal(false)}
          className="sa-modal sa-modal--sm"
        >
          <div className="sa-modal__content" style={{ display: 'flex', flexDirection: 'column', height: '100%', maxHeight: '550px', background: '#ffffff', borderRadius: '16px', overflow: 'hidden' }}>
            <div className="sa-modal__header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid #f1f5f9' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <IonIcon icon={notificationsOutline} style={{ fontSize: '22px', color: '#0D5C46' }} />
                <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: 0 }}>Your Notifications</h2>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {unreadCount > 0 && (
                  <button 
                    onClick={markAllAsRead} 
                    style={{ background: 'none', border: 'none', color: '#0D5C46', fontSize: '12px', fontWeight: 700, cursor: 'pointer', outline: 'none' }}
                  >
                    Mark all as read
                  </button>
                )}
                <button 
                  onClick={() => setShowNotificationsModal(false)}
                  style={{ background: 'none', border: 'none', fontSize: '24px', color: '#94a3b8', cursor: 'pointer', lineHeight: 1, padding: '0 4px', outline: 'none' }}
                >
                  ×
                </button>
              </div>
            </div>
            
            <div className="sa-modal__body" style={{ padding: '20px 24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {notifications.length === 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', color: '#94a3b8', textAlign: 'center', gap: '12px' }}>
                  <IonIcon icon={notificationsOutline} style={{ fontSize: '48px', color: '#cbd5e1' }} />
                  <div>
                    <p style={{ fontSize: '14px', fontWeight: 700, margin: '0 0 4px 0', color: '#64748b' }}>No notifications yet</p>
                    <p style={{ fontSize: '12px', margin: 0, color: '#94a3b8' }}>You will receive updates here when your sessions are booked.</p>
                  </div>
                </div>
              ) : (
                notifications.map((n) => (
                  <div 
                    key={n.id} 
                    style={{
                      background: n.status === 'unread' ? '#f0fdf4' : '#ffffff',
                      border: n.status === 'unread' ? '1px solid #bbf7d0' : '1px solid #e2e8f0',
                      borderRadius: '12px',
                      padding: '16px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                      position: 'relative',
                      transition: 'all 0.2s',
                      boxShadow: n.status === 'unread' ? '0 2px 4px rgba(13, 92, 70, 0.05)' : 'none'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <span style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          background: '#10b981',
                          display: n.status === 'unread' ? 'inline-block' : 'none',
                        }} />
                        <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', margin: 0 }}>{n.title || 'Notification'}</h4>
                      </div>
                      <span style={{ fontSize: '11px', color: '#94a3b8' }}>{n.timestamp ? n.timestamp.split(' ')[0] : ''}</span>
                    </div>
                    
                    <p style={{ fontSize: '13px', color: '#475569', margin: 0, lineHeight: 1.5 }}>{n.message}</p>
                    
                    {n.sessionNo && (
                      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '4px', padding: '8px 12px', background: '#f8fafc', borderRadius: '8px', fontSize: '12px' }}>
                        <span style={{ color: '#64748b' }}>Session: <strong style={{ color: '#0f172a' }}>{n.sessionNo}</strong></span>
                        <span style={{ color: '#64748b' }}>Healer: <strong style={{ color: '#0f172a' }}>{n.healer}</strong></span>
                        <span style={{ color: '#64748b' }}>Date: <strong style={{ color: '#0f172a' }}>{n.date}</strong></span>
                        <span style={{ color: '#64748b' }}>Time: <strong style={{ color: '#0f172a' }}>{n.time}</strong></span>
                      </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '6px' }}>
                      {n.status === 'unread' && (
                        <button 
                          onClick={() => markAsRead(n.id)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#0D5C46',
                            fontSize: '12px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            padding: '4px 8px',
                            borderRadius: '4px',
                          }}
                        >
                          Mark as Read
                        </button>
                      )}
                      <button 
                        onClick={() => deleteNotification(n.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#ef4444',
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          padding: '4px 8px',
                          borderRadius: '4px',
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </IonModal>
      </IonContent>
    </IonPage>
  );
};

export default PatientDashboardPage;
