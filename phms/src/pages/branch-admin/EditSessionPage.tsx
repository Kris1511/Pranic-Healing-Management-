import React, { useState, useEffect } from 'react';
import {
  IonPage,
  IonContent,
  IonIcon,
  useIonToast,
} from '@ionic/react';
import {
  arrowBackOutline,
  personOutline,
  calendarOutline,
  timeOutline,
  medkitOutline,
  alertCircleOutline,
  documentTextOutline,
  walletOutline,
  checkmarkCircleOutline,
  star,
  starOutline,
} from 'ionicons/icons';
import { useHistory, useParams } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';
import { ROUTES } from '../../constants/routes.constant';
import './branch-admin.css';

interface Patient {
  id: string;
  name: string;
  assignedHealerId: string;
  status: string;
  caseType: string;
}

interface Healer {
  id: string;
  name: string;
  specialization: string[];
  status: string;
}

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
  paymentMethod?: 'UPI' | 'Cash';
  followUp: {
    required: boolean;
    urgency: 'Urgent' | 'Pending' | 'None';
  };
  notes?: {
    treatmentType: string;
    observations: string;
    detailedNotes: string;
    recommendation: string;
  };
  feedback?: {
    rating: number;
    comment: string;
  };
}

export default function EditSessionsPages() {
  const history = useHistory();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthStore();
  const [present] = useIonToast();

  const isBranchAdmin = user?.role === 'BRANCH_ADMIN';
  const rawBranch = typeof user?.branch === 'object' && user?.branch !== null
    ? (user.branch as any).name
    : (user?.branch || 'Mumbai');
  const branchName = rawBranch.toLowerCase().includes('branch') ? rawBranch : `${rawBranch} Branch`;

  // Load healers, patients, and sessions from localStorage
  const [registeredHealers] = useState<Healer[]>(() => {
    const saved = localStorage.getItem('phms_healers');
    return saved ? JSON.parse(saved) : [];
  });

  const [sessions, setSessions] = useState<HealingSession[]>(() => {
    const saved = localStorage.getItem('phms_sessions');
    return saved ? JSON.parse(saved) : [];
  });

  // Target session
  const [targetSession, setTargetSession] = useState<HealingSession | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    patientName: '',
    sessionNo: '',
    healer: '',
    date: '',
    startTime: '',
    endTime: '',
    type: 'Basic Pranic Healing',
    status: 'Scheduled' as 'Completed' | 'Scheduled' | 'Cancelled',
    followUpRequired: false,
    followUpUrgency: 'None' as 'Urgent' | 'Pending' | 'None',
    observations: '',
    detailedNotes: '',
    recommendation: '',
    paymentStatus: 'Pending' as 'Paid' | 'Pending',
    paymentMethod: 'UPI' as 'UPI' | 'Cash',
    rating: 5,
    comment: '',
  });

  // Load and pre-populate target session data
  useEffect(() => {
    const found = sessions.find(s => s.id === Number(id));
    if (found) {
      setTargetSession(found);
      
      // Clean healer name string (if it starts with "Dr. ", we can strip it or keep it based on preference,
      // but let's match the option value in activeHealers which has Dr. prepended dynamically or exactly match)
      let cleanHealerName = found.healer;
      if (cleanHealerName.startsWith('Dr. ')) {
        cleanHealerName = cleanHealerName.replace('Dr. ', '');
      }

      setFormData({
        patientName: found.patient,
        sessionNo: found.sessionNo,
        healer: cleanHealerName,
        date: found.date,
        startTime: found.startTime,
        endTime: found.endTime,
        type: found.type,
        status: found.status,
        followUpRequired: found.followUp?.required || false,
        followUpUrgency: found.followUp?.urgency || 'None',
        observations: found.notes?.observations || '',
        detailedNotes: found.notes?.detailedNotes || '',
        recommendation: found.notes?.recommendation || '',
        paymentStatus: found.paymentStatus,
        paymentMethod: found.paymentMethod || 'UPI',
        rating: found.feedback?.rating || 5,
        comment: found.feedback?.comment || '',
      });
    } else if (sessions.length > 0) {
      triggerToast(`Session ID ${id} not found in registry.`, 'danger');
      history.push(ROUTES.BRANCH_ADMIN.SESSIONS);
    }
  }, [id, sessions]);

  // Dynamic healers list falling back to default active healers if empty
  const activeHealers = registeredHealers.length > 0
    ? registeredHealers.filter(h => h.status === 'ACTIVE')
    : [
        { id: 'H-2091', name: 'Aris Varma', specialization: ['Advanced Pranic Healing'] },
        { id: 'H-2104', name: 'Julian Mars', specialization: ['Pranic Psychotherapy'] },
        { id: 'H-1822', name: 'Maya Rose', specialization: ['Crystal Healing'] },
        { id: 'H-1994', name: 'Lila Thorne', specialization: ['Basic Pranic Healing'] }
      ];

  // Current Date display
  const formattedDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Toast notifier helper
  const triggerToast = (msg: string, color: 'success' | 'danger' = 'success') => {
    present({
      message: msg,
      duration: 3000,
      position: 'top',
      color: color,
    });
  };

  // Handle form submission
  const handleSaveSession = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.patientName.trim()) {
      triggerToast('Patient name cannot be blank.', 'danger');
      return;
    }

    const healerFullName = formData.healer.toLowerCase().startsWith('dr.') 
      ? formData.healer 
      : `Dr. ${formData.healer}`;

    const updatedSessions = sessions.map(s => {
      if (s.id === Number(id)) {
        const hasNotes = formData.status === 'Completed' || formData.observations || formData.detailedNotes || formData.recommendation;
        const hasFeedback = formData.status === 'Completed' || formData.comment || formData.rating !== 5;

        return {
          ...s,
          healer: healerFullName,
          date: formData.date,
          startTime: formData.startTime,
          endTime: formData.endTime,
          type: formData.type,
          status: formData.status,
          paymentStatus: formData.paymentStatus,
          paymentMethod: formData.paymentStatus === 'Paid' ? formData.paymentMethod : undefined,
          followUp: {
            required: formData.followUpRequired,
            urgency: formData.followUpRequired ? formData.followUpUrgency : 'None',
          },
          notes: hasNotes ? {
            treatmentType: formData.type,
            observations: formData.observations || 'No observations logged.',
            detailedNotes: formData.detailedNotes || 'No clinical notes.',
            recommendation: formData.recommendation || 'None',
          } : s.notes,
          feedback: hasFeedback ? {
            rating: formData.rating,
            comment: formData.comment || 'No feedback comment.',
          } : s.feedback
        };
      }
      return s;
    });

    // Auto-bookkeeping: sync finance when session is Completed for the first time
    // OR when payment status changes on an already-Completed session
    const isNowCompleted = formData.status === 'Completed';
    const wasAlreadyCompleted = targetSession && targetSession.status === 'Completed';
    const paymentStatusChanged = targetSession && targetSession.paymentStatus !== formData.paymentStatus;

    if (targetSession && isNowCompleted) {
      const totalBilled = formData.type === 'Pranic Psychotherapy' ? 2500
        : formData.type === 'Crystal Healing' ? 3000
        : formData.type === 'Advanced Pranic Healing' ? 2000
        : 1200;
      const amountPaid = formData.paymentStatus === 'Paid' ? totalBilled : 0;
      const outstanding = totalBilled - amountPaid;
      const autoStatus = amountPaid === totalBilled ? 'Paid' : amountPaid === 0 ? 'Pending' : 'Partial';

      // 1. Update or create Patient Payment record
      const savedPayments = localStorage.getItem('phms_patient_payments') || '[]';
      const payments: any[] = JSON.parse(savedPayments);
      const existingPayIndex = payments.findIndex((p: any) => p.sessionNo === formData.sessionNo);

      if (existingPayIndex === -1) {
        // First time: create new record
        const newPaymentHistory = amountPaid > 0 ? [{
          date: new Date().toISOString().split('T')[0],
          amount: amountPaid,
          mode: formData.paymentMethod || 'UPI',
          status: 'Paid' as const
        }] : [];

        const newPayment = {
          id: `P-${Math.floor(1000 + Math.random() * 9000)}`,
          patientName: formData.patientName,
          sessionNo: formData.sessionNo,
          totalBilled: totalBilled,
          paid: amountPaid,
          outstanding: outstanding,
          status: autoStatus,
          assignedHealer: healerFullName,
          caseId: `C-${Math.floor(1000 + Math.random() * 9000)}`,
          history: newPaymentHistory
        };
        payments.unshift(newPayment);
      } else if (wasAlreadyCompleted && paymentStatusChanged) {
        // Already completed: update payment fields in existing record
        const existing = payments[existingPayIndex];
        const updatedPaid = amountPaid;
        const updatedOutstanding = totalBilled - updatedPaid;
        const updatedAutoStatus = updatedPaid >= totalBilled ? 'Paid' : updatedPaid === 0 ? 'Pending' : 'Partial';

        const newHistoryEntry = updatedPaid > existing.paid ? [{
          date: new Date().toISOString().split('T')[0],
          amount: updatedPaid - existing.paid,
          mode: (formData.paymentMethod || 'UPI') as 'Cash' | 'UPI' | 'Bank Transfer',
          status: 'Paid' as const
        }] : [];

        payments[existingPayIndex] = {
          ...existing,
          paid: updatedPaid,
          outstanding: updatedOutstanding,
          status: updatedAutoStatus,
          history: [...(newHistoryEntry), ...(existing.history || [])]
        };
      }
      localStorage.setItem('phms_patient_payments', JSON.stringify(payments));

      // 2. Write an Income Entry to general finance ledger if payment is received
      //    Only add new transaction when switching to Paid for the first time
      const justBecamePaid = formData.paymentStatus === 'Paid' &&
        (!wasAlreadyCompleted || targetSession.paymentStatus !== 'Paid');

      if (justBecamePaid && amountPaid > 0) {
        const savedTx = localStorage.getItem('phms_finance_transactions') || '[]';
        const transactionsList = JSON.parse(savedTx);

        const newTx = {
          id: Date.now(),
          timestamp: `${new Date().toISOString().split('T')[0]}, ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
          category: 'Session Fee',
          type: 'income',
          amount: amountPaid,
          mode: formData.paymentMethod || 'UPI',
          recordedBy: user?.name || 'Admin - Anjali Rao',
          description: `${formData.patientName} - Session fee for ${formData.sessionNo} (${formData.type})`,
          dateStr: new Date().toISOString().split('T')[0]
        };
        localStorage.setItem('phms_finance_transactions', JSON.stringify([newTx, ...transactionsList]));
      }
    }

    localStorage.setItem('phms_sessions', JSON.stringify(updatedSessions));

    // Audit Log recording
    const savedAudits = localStorage.getItem('phms_audits') || '[]';
    const audits = JSON.parse(savedAudits);
    const newAudit = {
      id: `A-${Math.floor(1000 + Math.random() * 9000)}`,
      action: 'SESSION_MODIFICATION',
      details: `Updated details for Session ${formData.sessionNo} of Patient ${formData.patientName}. Status changed to ${formData.status}.`,
      changedBy: user?.name || user?.email || 'Aria Seraphina',
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };
    localStorage.setItem('phms_audits', JSON.stringify([newAudit, ...audits]));

    triggerToast(`Session ${formData.sessionNo} details successfully saved!`);
    history.push(ROUTES.BRANCH_ADMIN.SESSIONS);
  };

  if (!isBranchAdmin) {
    return (
      <IonPage className="sa-page">
        <IonContent className="sa-page__content" fullscreen>
          <div className="db-access-restricted-container">
            <div className="db-access-restricted-card">
              <div className="db-access-restricted-icon">
                <IonIcon icon={alertCircleOutline} />
              </div>
              <div className="db-access-restricted-details">
                <span className="db-access-restricted-title">Access Restricted</span>
                <p className="db-access-restricted-desc">
                  Session editing is restricted strictly to authorized Branch Admin personnel.
                </p>
              </div>
            </div>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  if (!targetSession) {
    return (
      <IonPage className="sa-page">
        <IonContent className="sa-page__content" style={{ '--background': '#f8fafc' }} fullscreen>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            <div style={{ textAlign: 'center', color: '#64748b' }}>
              <IonIcon icon={alertCircleOutline} style={{ fontSize: '48px', color: '#0d5c46' }} />
              <p style={{ marginTop: '12px', fontWeight: 600 }}>Loading healing session records...</p>
            </div>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  // Premium PHMS Styles
  const customStyles = {
    formCard: {
      background: '#ffffff',
      borderRadius: '16px',
      padding: '28px',
      border: '1px solid #e2e8f0',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.025)',
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '20px',
    },
    subHeader: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      fontSize: '16px',
      fontWeight: 700,
      color: '#0D5C46',
      marginTop: '4px',
      marginBottom: '12px',
      textTransform: 'uppercase' as const,
      letterSpacing: '0.5px',
    },
    subHeaderIcon: {
      color: '#0D5C46',
      fontSize: '20px',
    },
    label: {
      fontSize: '11px',
      fontWeight: 800,
      color: '#475569',
      letterSpacing: '0.5px',
      marginBottom: '6px',
      textTransform: 'uppercase' as const,
    },
    grayInput: {
      background: '#f8fafc',
      border: '1px solid #e2e8f0',
      borderRadius: '8px',
      padding: '12px 16px',
      fontSize: '14px',
      color: '#1e293b',
      outline: 'none',
      width: '100%',
      transition: 'all 0.2s ease',
    },
    grayTextarea: {
      background: '#f8fafc',
      border: '1px solid #e2e8f0',
      borderRadius: '8px',
      padding: '12px 16px',
      fontSize: '14px',
      color: '#1e293b',
      outline: 'none',
      width: '100%',
      resize: 'none' as const,
      lineHeight: 1.5,
      transition: 'all 0.2s ease',
    },
  };

  return (
    <IonPage className="sa-page">
      <IonContent className="sa-page__content" style={{ '--background': '#f8fafc' }} fullscreen>
        <div className="db-corp-layout" style={{ background: '#f8fafc' }}>
          <main className="db-corp-canvas">
            
            {/* Header Navbar */}
            <header className="db-corp-navbar" style={{ background: '#ffffff', borderBottom: '1px solid #e2e8f0', padding: '16px 24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button 
                  className="db-corp-nav-icon-btn" 
                  onClick={() => history.push(ROUTES.BRANCH_ADMIN.SESSIONS)} 
                  title="Back to Sessions Registry"
                  style={{ background: 'none', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <IonIcon icon={arrowBackOutline} style={{ color: '#0D5C46', fontSize: '20px' }} />
                </button>
                <div className="db-corp-navbar-left">
                  <h1 className="db-corp-page-title" style={{ color: '#0d5c46', fontWeight: 800, fontSize: '20px', margin: 0 }}>
                    Edit Session {formData.sessionNo}
                  </h1>
                  <p className="db-corp-page-subtitle" style={{ color: '#64748b', fontSize: '12px', margin: '2px 0 0 0' }}>
                    Pranic Healing Management System • {branchName} • {formattedDate}
                  </p>
                </div>
              </div>
            </header>

            {/* Layout Canvas */}
            <div className="db-hc-layout" style={{ padding: '28px' }}>
              <form onSubmit={handleSaveSession} style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
                
                {/* Two Column Form Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '28px', alignItems: 'start' }}>
                  
                  {/* LEFT COLUMN: Core Session Details */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
                    <div style={customStyles.formCard}>
                      <div>
                        <div style={customStyles.subHeader}>
                          <IonIcon icon={personOutline} style={customStyles.subHeaderIcon} />
                          <span>Core Session & Patient details</span>
                        </div>

                        <div className="st-form" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                          
                          {/* Patient Name Input (Read-only as required) */}
                          <div className="st-form-group">
                            <label style={customStyles.label}>Patient Name (Read-Only)</label>
                            <input 
                              type="text" 
                              disabled
                              style={{ ...customStyles.grayInput, background: '#e2e8f0', color: '#64748b', cursor: 'not-allowed' }}
                              value={formData.patientName}
                            />
                          </div>

                          {/* Healer Dynamic Dropdown */}
                          <div className="st-form-group">
                            <label style={customStyles.label}>Assigned Healer *</label>
                            <select 
                              className="st-input" 
                              style={customStyles.grayInput}
                              value={formData.healer}
                              onChange={(e) => setFormData({ ...formData, healer: e.target.value })}
                            >
                              {activeHealers.map((h, i) => (
                                <option key={i} value={h.name}>
                                  Dr. {h.name} {h.specialization ? `(${h.specialization.join(', ')})` : ''}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Session Type & Date Grid */}
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div className="st-form-group">
                              <label style={customStyles.label}>Session Type</label>
                              <select 
                                className="st-input" 
                                style={customStyles.grayInput}
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                              >
                                <option>Basic Pranic Healing</option>
                                <option>Advanced Pranic Healing</option>
                                <option>Pranic Psychotherapy</option>
                                <option>Crystal Healing</option>
                              </select>
                            </div>

                            <div className="st-form-group">
                              <label style={customStyles.label}>Session Date</label>
                              <input 
                                type="date" 
                                required
                                style={customStyles.grayInput}
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                              />
                            </div>
                          </div>

                          {/* Time Slots Grid */}
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div className="st-form-group">
                              <label style={customStyles.label}>Start Time</label>
                              <input 
                                type="text" 
                                required
                                style={customStyles.grayInput}
                                placeholder="e.g. 09:00 AM"
                                value={formData.startTime}
                                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                              />
                            </div>

                            <div className="st-form-group">
                              <label style={customStyles.label}>End Time</label>
                              <input 
                                type="text" 
                                required
                                style={customStyles.grayInput}
                                placeholder="e.g. 10:00 AM"
                                value={formData.endTime}
                                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                              />
                            </div>
                          </div>

                          {/* Session Status & Payment Status */}
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div className="st-form-group">
                              <label style={customStyles.label}>Session Status</label>
                              <select 
                                className="st-input" 
                                style={customStyles.grayInput}
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                              >
                                <option value="Scheduled">Scheduled</option>
                                <option value="Completed">Completed</option>
                                <option value="Cancelled">Cancelled</option>
                              </select>
                            </div>

                            <div className="st-form-group">
                              <label style={customStyles.label}>Payment Status</label>
                              <select 
                                className="st-input" 
                                style={customStyles.grayInput}
                                value={formData.paymentStatus}
                                onChange={(e) => setFormData({ ...formData, paymentStatus: e.target.value as any })}
                              >
                                <option value="Pending">Pending</option>
                                <option value="Paid">Paid</option>
                              </select>
                            </div>
                          </div>

                          {/* Follow-up Required Toggle */}
                          <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #cbd5e1', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <input 
                                type="checkbox" 
                                id="followUpRequiredPage" 
                                style={{ width: '16px', height: '16px', accentColor: '#0D5C46', cursor: 'pointer' }}
                                checked={formData.followUpRequired} 
                                onChange={(e) => setFormData({ ...formData, followUpRequired: e.target.checked })} 
                              />
                              <label htmlFor="followUpRequiredPage" style={{ fontWeight: 700, fontSize: '13px', color: '#334155', cursor: 'pointer' }}>
                                Mark Follow-up Required
                              </label>
                            </div>

                            {formData.followUpRequired && (
                              <div className="st-form-group">
                                <label style={customStyles.label}>Urgency Priority</label>
                                <select 
                                  className="st-input"
                                  style={customStyles.grayInput}
                                  value={formData.followUpUrgency}
                                  onChange={(e) => setFormData({ ...formData, followUpUrgency: e.target.value as any })}
                                >
                                  <option value="None">None</option>
                                  <option value="Pending">Pending (Orange)</option>
                                  <option value="Urgent">Urgent (Red)</option>
                                </select>
                              </div>
                            )}
                          </div>

                        </div>
                      </div>
                    </div>
                  </div>

                  {/* RIGHT COLUMN: Diagnostic Observations, Star Ratings & Ledger details */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
                    
                    {/* Clinical Details Card (Dynamic if status is Completed) */}
                    {formData.status === 'Completed' ? (
                      <div style={{ ...customStyles.formCard, background: '#ecfdf5', border: '1px solid #a7f3d0' }}>
                        <div>
                          <div style={{ ...customStyles.subHeader, color: '#0d5c46' }}>
                            <IonIcon icon={documentTextOutline} style={{ color: '#0d5c46', fontSize: '20px' }} />
                            <span>Clinical Healing Records</span>
                          </div>

                          <div className="st-form" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                            <div className="st-form-group">
                              <label style={{ ...customStyles.label, color: '#0d5c46' }}>Healing Observations (Chakra blocks)</label>
                              <textarea 
                                rows={2}
                                style={customStyles.grayTextarea}
                                placeholder="Solar plexus chakra congested, lower chakras depleted."
                                value={formData.observations}
                                onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
                              />
                            </div>

                            <div className="st-form-group">
                              <label style={{ ...customStyles.label, color: '#0d5c46' }}>Detailed Clinical Notes</label>
                              <textarea 
                                rows={2}
                                style={customStyles.grayTextarea}
                                placeholder="Performed general sweeping, localized sweeping on affected organs."
                                value={formData.detailedNotes}
                                onChange={(e) => setFormData({ ...formData, detailedNotes: e.target.value })}
                              />
                            </div>

                            <div className="st-form-group">
                              <label style={{ ...customStyles.label, color: '#0d5c46' }}>Next Recommendations</label>
                              <input 
                                type="text"
                                style={customStyles.grayInput}
                                placeholder="Salt water bath twice weekly, daily physical scanning."
                                value={formData.recommendation}
                                onChange={(e) => setFormData({ ...formData, recommendation: e.target.value })}
                              />
                            </div>

                            {/* Feedback Stars Selector */}
                            <div className="st-form-group">
                              <label style={{ ...customStyles.label, color: '#0d5c46' }}>Feedback Stars</label>
                              <div style={{ display: 'flex', gap: '8px', fontSize: '24px', color: '#f59e0b', marginTop: '4px' }}>
                                {[1, 2, 3, 4, 5].map((starVal) => (
                                  <IonIcon
                                    key={starVal}
                                    icon={starVal <= formData.rating ? star : starOutline}
                                    style={{ cursor: 'pointer', transition: 'all 0.15s ease' }}
                                    onClick={() => setFormData({ ...formData, rating: starVal })}
                                  />
                                ))}
                              </div>
                            </div>

                            <div className="st-form-group">
                              <label style={{ ...customStyles.label, color: '#0d5c46' }}>Feedback Comments</label>
                              <input 
                                type="text"
                                style={customStyles.grayInput}
                                placeholder="Patient felt significantly lighter and relaxed after deep sweeps."
                                value={formData.comment}
                                onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div style={{ ...customStyles.formCard, background: '#f1f5f9', border: '1px solid #cbd5e1' }}>
                        <div style={{ textAlign: 'center', padding: '16px 8px', color: '#475569' }}>
                          <IonIcon icon={alertCircleOutline} style={{ fontSize: '32px', color: '#475569' }} />
                          <h4 style={{ margin: '8px 0 4px 0', fontSize: '14px', fontWeight: 700 }}>Clinical Records Locked</h4>
                          <p style={{ margin: 0, fontSize: '12px', lineHeight: 1.4 }}>
                            Set the Session Status to <strong>Completed</strong> to unlock observations, clinical notes, patient feedback, and ratings.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Ledger & Billing Info */}
                    <div style={customStyles.formCard}>
                      <div>
                        <div style={customStyles.subHeader}>
                          <IonIcon icon={walletOutline} style={customStyles.subHeaderIcon} />
                          <span>Ledger & Billing Info</span>
                        </div>

                        <div className="st-form" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                          {formData.paymentStatus === 'Paid' ? (
                            <div className="st-form-group">
                              <label style={customStyles.label}>Payment Method *</label>
                              <select 
                                className="st-input" 
                                style={customStyles.grayInput}
                                value={formData.paymentMethod}
                                onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value as any })}
                              >
                                <option value="UPI">UPI Node</option>
                                <option value="Cash">Cash Ledger</option>
                              </select>
                            </div>
                          ) : (
                            <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', color: '#64748b', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <IonIcon icon={alertCircleOutline} style={{ fontSize: '18px', color: '#64748b' }} />
                              <span>Payment Method is locked. Select payment status "Paid" to set payment type.</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                  </div>

                </div>

                {/* Footer Buttons Section */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', marginTop: '12px', marginBottom: '40px', borderTop: '1px solid #e2e8f0', paddingTop: '24px' }}>
                  <button 
                    type="button"
                    onClick={() => history.push(ROUTES.BRANCH_ADMIN.SESSIONS)} 
                    style={{
                      background: '#ffffff',
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      padding: '12px 28px',
                      fontSize: '14px',
                      fontWeight: 600,
                      color: '#475569',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    Cancel
                  </button>

                  <button 
                    type="submit"
                    style={{
                      background: '#0D5C46',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '12px 28px',
                      fontSize: '14px',
                      fontWeight: 600,
                      color: '#ffffff',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    Save Changes
                  </button>
                </div>

              </form>
            </div>
            
          </main>
        </div>
      </IonContent>
    </IonPage>
  );
}