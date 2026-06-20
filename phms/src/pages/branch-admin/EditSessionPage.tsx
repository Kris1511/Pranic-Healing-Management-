import React, { useState, useEffect, useRef } from 'react';
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
import { useHistory, useParams, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';
import { ROUTES } from '../../constants/routes.constant';
import { getHealers } from '../../api/healer.api';
import { getSessionById, updateSession } from '../../api/session.api';
import { getTreatmentTypes } from '../../api/treatmentType.api';
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
  id: string | number;
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

const timeSlots = [
  '07:00 AM', '07:30 AM', '08:00 AM', '08:30 AM', '09:00 AM', '09:30 AM',
  '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM',
  '01:00 PM', '01:30 PM', '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM',
  '04:00 PM', '04:30 PM', '05:00 PM', '05:30 PM', '06:00 PM', '06:30 PM',
  '07:00 PM', '07:30 PM', '08:00 PM', '08:30 PM', '09:00 PM'
];

const CustomTimeSelect = ({ 
  label, 
  value, 
  onChange, 
  options,
  customStyles
}: { 
  label: string; 
  value: string; 
  onChange: (val: string) => void; 
  options: string[];
  customStyles: any;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="st-form-group" ref={containerRef} style={{ position: 'relative' }}>
      <label style={customStyles.label}>{label}</label>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          ...customStyles.grayInput,
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'relative',
          paddingRight: '36px'
        }}
      >
        <span>{value}</span>
        <span style={{
          position: 'absolute',
          right: '16px',
          top: '50%',
          transform: `translateY(-50%) rotate(${isOpen ? '180deg' : '0deg'})`,
          transition: 'transform 0.2s ease',
          fontSize: '10px',
          color: '#64748b',
          pointerEvents: 'none'
        }}>
          ▼
        </span>
      </div>
      
      {isOpen && (
        <div 
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            width: '100%',
            maxHeight: '180px',
            overflowY: 'auto',
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            zIndex: 9999,
          }}
        >
          {options.map((opt) => (
            <div 
              key={opt}
              onClick={() => {
                onChange(opt);
                setIsOpen(false);
              }}
              style={{
                padding: '10px 16px',
                fontSize: '14px',
                color: opt === value ? '#0D5C46' : '#1e293b',
                fontWeight: opt === value ? 700 : 400,
                background: opt === value ? '#f0fdf4' : 'transparent',
                cursor: 'pointer',
                transition: 'background 0.15s ease',
              }}
              onMouseEnter={(e) => {
                if (opt !== value) e.currentTarget.style.background = '#f8fafc';
              }}
              onMouseLeave={(e) => {
                if (opt !== value) e.currentTarget.style.background = 'transparent';
              }}
            >
              {opt}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default function EditSessionsPages() {
  const history = useHistory();
  const { id } = useParams<{ id: string }>();
  const location = useLocation<{ fromPatientId?: string }>();
  const { user } = useAuthStore();

  const fromPatientId = location.state?.fromPatientId;
  const isFromFinance = history.location.pathname.includes('/finance');
  const redirectBack = () => {
    if (fromPatientId) {
      history.push(`${ROUTES.BRANCH_ADMIN.PATIENT_DETAILS.replace(':id', encodeURIComponent(fromPatientId))}?tab=financials`);
    } else {
      history.push(isFromFinance ? ROUTES.BRANCH_ADMIN.FINANCE : ROUTES.BRANCH_ADMIN.SESSIONS);
    }
  };
  const [present] = useIonToast();

  const isBranchAdmin = user?.role === 'BRANCH_ADMIN';
  const rawBranch = typeof user?.branch === 'object' && user?.branch !== null
    ? (user.branch as any).name
    : (user?.branch || 'Mumbai');
  const branchName = rawBranch.toLowerCase().includes('branch') ? rawBranch : `${rawBranch} Branch`;

  // Load healers
  const [registeredHealers, setRegisteredHealers] = useState<Healer[]>([]);

  const [sessions, setSessions] = useState<HealingSession[]>(() => {
    const saved = localStorage.getItem('phms_sessions');
    return saved ? JSON.parse(saved) : [];
  });

  // Target session
  const [targetSession, setTargetSession] = useState<HealingSession | null>(null);
  const [targetSessionBackend, setTargetSessionBackend] = useState<any>(null);

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
    followUpDate: '',
    observations: '',
    detailedNotes: '',
    recommendation: '',
    paymentStatus: 'Pending' as 'Paid' | 'Pending',
    paymentMethod: 'UPI' as 'UPI' | 'Cash',
    sessionFee: 1200,
    rating: 5,
    comment: '',
  });

  const [treatmentTypes, setTreatmentTypes] = useState<any[]>([]);

  // Load and pre-populate target session data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const healersRes = await getHealers();
        if (healersRes.success) {
          setRegisteredHealers(healersRes.data);
        }

        const treatmentRes = await getTreatmentTypes({ status: 'Active' });
        if (treatmentRes.success && Array.isArray(treatmentRes.data)) {
          setTreatmentTypes(treatmentRes.data);
        }

        const sessionRes = await getSessionById(id);
        if (sessionRes.success && sessionRes.data) {
          const s = sessionRes.data;
          setTargetSessionBackend(s);
          const mappedMockSession: any = {
            id: s.id,
            status: s.status === 'scheduled' ? 'Scheduled' : s.status === 'completed' ? 'Completed' : s.status === 'cancelled' ? 'Cancelled' : s.status || 'Scheduled',
            paymentStatus: s.paymentStatus || (s.status === 'completed' ? 'Paid' : 'Pending'),
          };
          setTargetSession(mappedMockSession);

          setFormData(prev => ({
            ...prev,
            patientName: s.patient_name || 'Unknown Patient',
            sessionNo: `S-${String(s.id).substring(0, 4)}`,
            healer: s.healer_name || '',
            date: s.session_date ? s.session_date.split('T')[0] : '',
            startTime: s.start_time || '',
            endTime: s.end_time || '',
            type: s.treatment_type || 'Basic Pranic Healing',
            status: mappedMockSession.status,
            observations: s.notes || '',
            paymentStatus: s.payment_status || 'Pending',
            paymentMethod: s.payment_method || 'Cash',
            sessionFee: s.session_fee !== undefined && s.session_fee !== null ? s.session_fee : (s.total_amount || 1200),
            followUpRequired: !!s.followup_required,
            followUpUrgency: s.followup_priority ? (s.followup_priority === 'NONE' ? 'None' : s.followup_priority === 'PENDING' ? 'Pending' : 'Urgent') : 'None',
            followUpDate: s.followup_date || '',
          }));
          return;
        }
      } catch (error) {
        console.error('Failed to fetch from API:', error);
      }

      // Fallback to local storage (mock data)
      const found = sessions.find(s => s.id === id || String(s.id) === String(id));
      if (found) {
        setTargetSession(found);
        
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
          followUpDate: '',
          observations: found.notes?.observations || '',
          detailedNotes: found.notes?.detailedNotes || '',
          recommendation: found.notes?.recommendation || '',
          paymentStatus: found.paymentStatus,
          paymentMethod: found.paymentMethod || 'UPI',
          sessionFee: 1200,
          rating: found.feedback?.rating || 5,
          comment: found.feedback?.comment || '',
        });
      } else if (sessions.length > 0) {
        triggerToast(`Session ID ${id} not found in registry.`, 'danger');
        redirectBack();
      }
    };
    fetchData();
  }, [id, sessions]);

  // Dynamic healers list
  const activeHealers = registeredHealers.filter(h => h.status && h.status.toUpperCase() === 'ACTIVE');

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
  const handleSaveSession = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.patientName.trim()) {
      triggerToast('Patient name cannot be blank.', 'danger');
      return;
    }

    const healerFullName = formData.healer.toLowerCase().startsWith('dr.') 
      ? formData.healer 
      : `Dr. ${formData.healer}`;
      
    // Find matching active healer for ID
    const selectedHealer = activeHealers.find(h => h.name === formData.healer || `Dr. ${h.name}` === formData.healer);
    const healerId = selectedHealer?.id;

    if (targetSessionBackend) {
      // Backend update
      try {
        const payload = {
          healer_id: healerId || targetSessionBackend.healer_id,
          session_date: `${formData.date}T00:00:00.000Z`,
          notes: formData.observations || formData.detailedNotes || targetSessionBackend.notes,
          status: formData.status.toLowerCase(),
          payment_status: formData.paymentStatus,
          payment_method: formData.paymentMethod,
          total_amount: formData.sessionFee,
          session_fee: formData.sessionFee,
          treatment_type: formData.type,
          start_time: formData.startTime,
          end_time: formData.endTime,
          followup_required: formData.followUpRequired,
          followup_priority: formData.followUpRequired ? formData.followUpUrgency : 'None',
          followup_date: formData.followUpRequired ? formData.followUpDate : null
        };
        await updateSession(id, payload);
      } catch (error) {
        console.error('Failed to update session on backend', error);
      }
    }

    const updatedSessions = sessions.map(s => {
      if (s.id === id || String(s.id) === String(id)) {
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
    redirectBack();
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
                  onClick={() => redirectBack()} 
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
                              disabled={activeHealers.length === 0}
                            >
                              {activeHealers.length === 0 ? (
                                <option value="">No Healers Available</option>
                              ) : (
                                activeHealers.map((h, i) => {
                                  let specText = '';
                                  if (h.specialization) {
                                    if (Array.isArray(h.specialization)) {
                                      specText = ` (${h.specialization.join(', ')})`;
                                    } else {
                                      try {
                                        const parsed = JSON.parse(h.specialization);
                                        if (Array.isArray(parsed)) {
                                          specText = ` (${parsed.join(', ')})`;
                                        } else {
                                          specText = ` (${h.specialization})`;
                                        }
                                      } catch (e) {
                                        specText = ` (${h.specialization})`;
                                      }
                                    }
                                  }
                                  return (
                                    <option key={i} value={h.name}>
                                      Dr. {h.name}{specText}
                                    </option>
                                  );
                                })
                              )}
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
                                <option value="">Select Treatment Type</option>
                                {treatmentTypes.map(t => (
                                  <option key={t.id} value={t.name}>{t.name}</option>
                                ))}
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
                            <CustomTimeSelect
                              label="Start Time"
                              value={formData.startTime}
                              onChange={(val) => setFormData({ ...formData, startTime: val })}
                              options={timeSlots}
                              customStyles={customStyles}
                            />
                            <CustomTimeSelect
                              label="End Time"
                              value={formData.endTime}
                              onChange={(val) => setFormData({ ...formData, endTime: val })}
                              options={timeSlots}
                              customStyles={customStyles}
                            />
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
                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
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
                                <div className="st-form-group">
                                  <label style={customStyles.label}>Follow-up Date</label>
                                  <input 
                                    type="date"
                                    required
                                    className="st-input"
                                    style={customStyles.grayInput}
                                    value={formData.followUpDate}
                                    onChange={(e) => setFormData({ ...formData, followUpDate: e.target.value })}
                                  />
                                </div>
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
                          
                          <div className="st-form-group">
                            <label style={customStyles.label}>Session Fee (₹) *</label>
                            <input 
                              type="number"
                              required
                              className="st-input"
                              style={customStyles.grayInput}
                              placeholder="e.g. 1200"
                              value={formData.sessionFee}
                              onChange={(e) => setFormData({ ...formData, sessionFee: parseFloat(e.target.value) || 0 })}
                            />
                          </div>

                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
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

                            <div className="st-form-group">
                              <label style={customStyles.label}>Payment Method</label>
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
                          </div>
                        </div>
                      </div>
                    </div>

                  </div>

                </div>

                {/* Footer Buttons Section */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', marginTop: '12px', marginBottom: '40px', borderTop: '1px solid #e2e8f0', paddingTop: '24px' }}>
                  <button 
                    type="button"
                    onClick={() => redirectBack()} 
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