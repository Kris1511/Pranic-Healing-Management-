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
} from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';
import { ROUTES } from '../../constants/routes.constant';
import { getPatients } from '../../api/patient.api';
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
}

export default function CreateBookSession() {
  const history = useHistory();
  const { user } = useAuthStore();
  const [present] = useIonToast();

  const isBranchAdmin = user?.role === 'BRANCH_ADMIN';
  const rawBranch = typeof user?.branch === 'object' && user?.branch !== null
    ? (user.branch as any).name
    : (user?.branch || 'Mumbai');
  const branchName = rawBranch.toLowerCase().includes('branch') ? rawBranch : `${rawBranch} Branch`;

  const todayStr = new Date().toISOString().split('T')[0];

  // Load healers and patients from database to provide responsive selectors
  const [registeredPatients, setRegisteredPatients] = useState<any[]>([]);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await getPatients();
        if (response.success) {
          setRegisteredPatients(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch patients:', error);
      }
    };
    fetchPatients();
  }, []);

  const [registeredHealers] = useState<Healer[]>(() => {
    const saved = localStorage.getItem('phms_healers');
    return saved ? JSON.parse(saved) : [];
  });

  // Dynamic healers list falling back to default mock list if empty
  const activeHealers = registeredHealers.length > 0
    ? registeredHealers.filter(h => h.status === 'ACTIVE')
    : [
        { id: 'H-2091', name: 'Aris Varma', specialization: ['Advanced Pranic Healing'] },
        { id: 'H-2104', name: 'Julian Mars', specialization: ['Pranic Psychotherapy'] },
        { id: 'H-1822', name: 'Maya Rose', specialization: ['Crystal Healing'] },
        { id: 'H-1994', name: 'Lila Thorne', specialization: ['Basic Pranic Healing'] }
      ];

  // Sessions state loaded from localStorage
  const [sessions, setSessions] = useState<HealingSession[]>(() => {
    const saved = localStorage.getItem('phms_sessions');
    return saved ? JSON.parse(saved) : [];
  });

  // Form State
  const [formData, setFormData] = useState({
    patientName: '',
    selectedPatientId: '',
    healer: activeHealers[0]?.name || 'Dr. Aris Varma',
    date: todayStr,
    startTime: '09:00 AM',
    endTime: '10:00 AM',
    type: 'Basic Pranic Healing',
    followUpRequired: false,
    followUpUrgency: 'None' as 'Urgent' | 'Pending' | 'None',
    followUpDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0], // Default to 7 days from now
    sessionFee: 1200,
    paymentStatus: 'Pending' as 'Paid' | 'Pending',
    paymentMethod: 'UPI' as 'UPI' | 'Cash',
  });

  // Current Date display
  const formattedDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Sync back to localStorage when sessions state updates
  useEffect(() => {
    if (sessions.length > 0) {
      localStorage.setItem('phms_sessions', JSON.stringify(sessions));
    }
  }, [sessions]);

  // Auto-update session fee based on session type
  useEffect(() => {
    let fee = 1200;
    if (formData.type === 'Pranic Psychotherapy') fee = 2500;
    else if (formData.type === 'Crystal Healing') fee = 3000;
    else if (formData.type === 'Advanced Pranic Healing') fee = 2000;
    setFormData(prev => ({ ...prev, sessionFee: fee }));
  }, [formData.type]);

  // Handle patient autocomplete / registration state
  const handlePatientSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const patId = e.target.value;
    if (patId === 'NEW_PATIENT') {
      setFormData(prev => ({ ...prev, selectedPatientId: patId, patientName: '' }));
    } else {
      const selected = registeredPatients.find(p => p.id === patId);
      if (selected) {
        setFormData(prev => ({
          ...prev,
          selectedPatientId: patId,
          patientName: selected.name,
          type: selected.caseType || prev.type
        }));
      }
    }
  };

  // Toast notifier helper
  const triggerToast = (msg: string, color: 'success' | 'danger' = 'success') => {
    present({
      message: msg,
      duration: 3000,
      position: 'top',
      color: color,
    });
  };

  // Helper: Sequentially calculate S-XXXX per patient name
  const getNextSessionNo = (patientName: string): string => {
    const patientSessions = sessions.filter(
      s => s.patient.toLowerCase().trim() === patientName.toLowerCase().trim()
    );
    const nextSeq = patientSessions.length + 1;
    return `S-${String(nextSeq).padStart(4, '0')}`;
  };

  // Handle form submission
  const handleBookSession = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.patientName.trim()) {
      triggerToast('Patient name is required.', 'danger');
      return;
    }

    const finalPatientName = formData.patientName.trim();
    const healerFullName = formData.healer.toLowerCase().startsWith('dr.') 
      ? formData.healer 
      : `Dr. ${formData.healer}`;
      
    const sessionNo = getNextSessionNo(finalPatientName);
    const totalBilled = formData.sessionFee;
    const amountPaid = formData.paymentStatus === 'Paid' ? totalBilled : 0;
    const outstanding = totalBilled - amountPaid;
    const autoStatus = amountPaid === totalBilled ? 'Paid' : 'Pending';

    const newSession: HealingSession = {
      id: Date.now(),
      sessionNo: sessionNo,
      date: formData.date,
      startTime: formData.startTime,
      endTime: formData.endTime,
      patient: finalPatientName,
      healer: healerFullName,
      type: formData.type,
      status: 'Scheduled',
      paymentStatus: formData.paymentStatus,
      paymentMethod: formData.paymentMethod,
      followUp: {
        required: formData.followUpRequired,
        urgency: formData.followUpRequired ? formData.followUpUrgency : 'None',
      },
      notes: {
        treatmentType: formData.type,
        observations: '—',
        detailedNotes: '—',
        recommendation: '—',
      }
    };

    // Update sessions state & localStorage
    const updatedSessions = [newSession, ...sessions];
    setSessions(updatedSessions);
    localStorage.setItem('phms_sessions', JSON.stringify(updatedSessions));

    // Write to phms_patient_payments in localStorage (Rule 3)
    const savedPayments = localStorage.getItem('phms_patient_payments') || '[]';
    const payments = JSON.parse(savedPayments);
    const newPaymentHistory = amountPaid > 0 ? [{
      date: new Date().toISOString().split('T')[0],
      amount: amountPaid,
      mode: formData.paymentMethod === 'UPI' ? 'UPI' as const : 'Cash' as const,
      status: 'Paid' as const
    }] : [];

    const newPayment = {
      id: `P-${Math.floor(1000 + Math.random() * 9000)}`,
      patientName: finalPatientName,
      sessionNo: sessionNo,
      totalBilled: totalBilled,
      paid: amountPaid,
      outstanding: outstanding,
      status: autoStatus,
      assignedHealer: healerFullName,
      caseId: `C-${Math.floor(1000 + Math.random() * 9000)}`,
      history: newPaymentHistory
    };
    localStorage.setItem('phms_patient_payments', JSON.stringify([newPayment, ...payments]));

    // Write an Income Entry to general finance ledger
    if (amountPaid > 0) {
      const savedTx = localStorage.getItem('phms_finance_transactions') || '[]';
      const transactionsList = JSON.parse(savedTx);

      const newTx = {
        id: Date.now(),
        timestamp: `${new Date().toISOString().split('T')[0]}, ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
        category: 'Session Fee',
        type: 'income',
        amount: amountPaid,
        mode: formData.paymentMethod === 'UPI' ? 'UPI (GPay)' : 'Cash',
        recordedBy: user?.name || 'Admin - Anjali Rao',
        description: `${finalPatientName} - Session fee for booked ${sessionNo} (${formData.type})`,
        dateStr: new Date().toISOString().split('T')[0]
      };
      localStorage.setItem('phms_finance_transactions', JSON.stringify([newTx, ...transactionsList]));
    }

    // Audit Log recording (SMS & Push Reminder simulation - Rule 5)
    const savedAudits = localStorage.getItem('phms_audits') || '[]';
    const audits = JSON.parse(savedAudits);
    const newAudit = {
      id: `A-${Math.floor(1000 + Math.random() * 9000)}`,
      action: 'SESSION_BOOKING',
      details: `Booked healing session ${sessionNo} for Patient ${finalPatientName} with Healer ${healerFullName}. Automated patient SMS & push notifications triggered.`,
      changedBy: user?.name || user?.email || 'Aria Seraphina',
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };
    localStorage.setItem('phms_audits', JSON.stringify([newAudit, ...audits]));

    triggerToast(`Session ${sessionNo} successfully booked! Patient received SMS & Push reminders.`);
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
                  Healing session registration is limited strictly to authorized Branch Admin personnel.
                </p>
              </div>
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
                  <h1 className="db-corp-page-title" style={{ color: '#0d5c46', fontWeight: 800, fontSize: '20px', margin: 0 }}>Book Healing Session</h1>
                  <p className="db-corp-page-subtitle" style={{ color: '#64748b', fontSize: '12px', margin: '2px 0 0 0' }}>Pranic Healing Management System • {branchName} • {formattedDate}</p>
                </div>
              </div>
            </header>

            {/* Layout Canvas */}
            <div className="db-hc-layout" style={{ padding: '28px' }}>
              <form onSubmit={handleBookSession} style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
                
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
                          
                          {/* Registered Patient Quick Picker */}
                          {registeredPatients.length > 0 && (
                            <div className="st-form-group">
                              <label style={customStyles.label}>Select Registered Patient</label>
                              <select 
                                className="st-input" 
                                style={customStyles.grayInput}
                                value={formData.selectedPatientId}
                                onChange={handlePatientSelect}
                              >
                                <option value="">-- Choose Existing Patient --</option>
                                {registeredPatients.map(p => (
                                  <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                                {/* <option value="NEW_PATIENT">-- Type New Patient Name --</option> */}
                              </select>
                            </div>
                          )}

                          {/* Patient Name Input */}
                          {/* <div className="st-form-group">
                            <label style={customStyles.label}>Patient Name *</label>
                            <input 
                              type="text" 
                              required 
                              style={customStyles.grayInput}
                              placeholder="Enter patient full name"
                              value={formData.patientName}
                              onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                            />
                          </div> */}

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
                              <label style={customStyles.label}>Treatment Type</label>
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

                  {/* RIGHT COLUMN: Ledger details */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>

                    {/* Billing Details Card */}
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
                    Book Healing Session
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
