import React, { useState, useEffect, useCallback } from 'react';
import {
  IonPage,
  IonContent,
  IonHeader,
  IonToolbar,
  IonButtons,
  IonMenuButton,
  IonTitle,
  IonButton,
  IonIcon,
  IonModal,
  useIonViewWillEnter,
} from '@ionic/react';
import {
  arrowBackOutline,
  pencilOutline,
  timeOutline,
  personOutline,
  receiptOutline,
  addCircleOutline,
  calendarOutline,
  medkitOutline,
  shieldCheckmarkOutline,
  checkmarkCircleOutline,
  alertCircleOutline,
  trashOutline,
  eyeOutline,
  notificationsOutline
} from 'ionicons/icons';
import { useHistory, useParams, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';
import { ROUTES } from '../../constants/routes.constant';
import { getPatientById, updatePatient } from '../../api/patient.api';
import { getPatientPaymentLedger, processPayment, deletePayment } from '../../api/payment.api';
import { updateSession, deleteSession } from '../../api/session.api';
import { Patient } from './PatientsPage';

const mapLedgerToDrawerPayment = (item: any) => {
  return {
    id: item.id || `INV-?`,
    patientId: item.patientId || '',
    patientName: item.patientName || 'Unknown Patient',
    sessionNo: item.sessionNo || '—',
    totalBilled: parseFloat(item.totalBilled || 0),
    paid: parseFloat(item.paid || 0),
    outstanding: parseFloat(item.outstanding || 0),
    status: item.paymentStatus || 'Pending',
    assignedHealer: item.healer || 'Unknown Healer',
    caseId: item.sessionId || '',
    history: item.paymentDate ? [{
      date: item.paymentDate.split('T')[0],
      amount: parseFloat(item.paid || 0),
      mode: item.paymentMethod || 'UPI',
      status: 'Paid'
    }] : []
  };
};

export default function PatientDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const history = useHistory();
  const location = useLocation();
  const { user } = useAuthStore();

  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [patientLedger, setPatientLedger] = useState<any[]>([]);
  const [loadingLedger, setLoadingLedger] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const getTabFromUrl = () => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab === 'sessions' || tab === 'financials' || tab === 'basic') {
      return tab as 'basic' | 'sessions' | 'financials';
    }
    return 'basic';
  };

  const [profileTab, setProfileTabState] = useState<'basic' | 'sessions' | 'financials'>(getTabFromUrl());

  const setProfileTab = useCallback((tab: 'basic' | 'sessions' | 'financials') => {
    setProfileTabState(tab);
    const params = new URLSearchParams(window.location.search);
    params.set('tab', tab);
    history.replace({ search: params.toString() });
  }, [history]);
  const [showRecordPaymentModal, setShowRecordPaymentModal] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);
  const [drawerPayment, setDrawerPayment] = useState<any>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [paymentRecord, setPaymentRecord] = useState({
    amountPaid: 0,
    method: 'UPI' as 'Cash' | 'UPI' | 'Bank Transfer',
    status: 'Paid' as 'Paid' | 'Partial' | 'Pending',
  });

  const userName = user?.name || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Aria Seraphina';
  const userInitials = user
    ? `${user.name?.[0] || user.firstName?.[0] || 'B'}${user.name?.split(' ')?.[1]?.[0] || user.lastName?.[0] || 'A'}`.toUpperCase()
    : 'BA';

  // ── Fetch the live patient details ─────────────────
  const fetchPatientDetails = useCallback(async (patId: string) => {
    try {
      const response = await getPatientById(patId);
      const p = response?.data || response;
      if (p) {
        // Dynamic Documents
        const documentsList = [];
        if (p.medicalReport) {
          documentsList.push({
            id: 'med-rep',
            name: p.medicalReport,
            category: 'Doctor Report' as const,
            size: 'N/A',
            date: p.updatedAt ? p.updatedAt.split('T')[0] : 'N/A',
            type: p.medicalReport.endsWith('.pdf') ? 'pdf' as const : 'image' as const,
            uploadedBy: 'System',
          });
        }
        if (p.labReport) {
          documentsList.push({
            id: 'lab-rep',
            name: p.labReport,
            category: 'Lab Report' as const,
            size: 'N/A',
            date: p.updatedAt ? p.updatedAt.split('T')[0] : 'N/A',
            type: p.labReport.endsWith('.pdf') ? 'pdf' as const : 'image' as const,
            uploadedBy: 'System',
          });
        }
        if (p.prescription) {
          documentsList.push({
            id: 'prescription',
            name: p.prescription,
            category: 'Other' as const,
            size: 'N/A',
            date: p.updatedAt ? p.updatedAt.split('T')[0] : 'N/A',
            type: p.prescription.endsWith('.pdf') ? 'pdf' as const : 'image' as const,
            uploadedBy: 'System',
          });
        }
        if (p.idProof) {
          documentsList.push({
            id: 'id-proof',
            name: p.idProof,
            category: 'Other' as const,
            size: 'N/A',
            date: p.updatedAt ? p.updatedAt.split('T')[0] : 'N/A',
            type: p.idProof.endsWith('.pdf') ? 'pdf' as const : 'image' as const,
            uploadedBy: 'System',
          });
        }

        // Dynamic Sessions
        const sessionsList = p.sessions || [];
        const mappedSessions = sessionsList.map((s: any) => ({
          id: s.id,
          healer: s.healer?.name || p.healer?.name || 'None',
          status: s.status ? (s.status.charAt(0).toUpperCase() + s.status.slice(1)) as any : 'Scheduled',
          notes: s.notes || 'No notes entered.',
          followUpDate: s.updatedAt ? s.updatedAt.split('T')[0] : undefined,
        }));

        // Dynamic Invoices & financials
        const invoices = sessionsList.map((s: any) => ({
          id: s.id,
          date: s.sessionDate ? s.sessionDate.split('T')[0] : 'N/A',
          amount: Number(s.totalAmount || 0),
          status: s.paymentStatus === 'paid' ? 'Paid' as const : s.paymentStatus === 'partial' ? 'Partial' as const : 'Unpaid' as const,
          method: s.paymentMethod === 'cash' ? 'Cash' as const : s.paymentMethod === 'upi' ? 'UPI' as const : s.paymentMethod === 'card' ? 'Card' as const : s.paymentMethod === 'bank_transfer' ? 'Bank Transfer' as const : undefined,
        }));

        const balanceDue = invoices
          .filter((inv: any) => inv.status !== 'Paid')
          .reduce((sum: number, inv: any) => sum + inv.amount, 0);

        // Feedbacks
        const feedbacks = p.feedbacks || [];
        const mappedFeedback = feedbacks.map((f: any) => ({
          sessionRef: f.id,
          rating: f.rating || 5,
          comment: f.comment || '',
          date: f.createdAt ? f.createdAt.split('T')[0] : 'N/A',
        }));

        const formatted: Patient = {
          id: p.id,
          patientId: p.patientId || p.id,
          name: p.name,
          initials: p.name ? p.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() : 'PT',
          avatarColor: ['#0f5b4b', '#1e3a8a', '#b45309', '#7c3aed', '#db2777'][Math.floor(Math.random() * 5)],
          mobile: p.phone || p.mobile || '',
          email: p.email || '',
          gender: p.gender || 'Female',
          age: p.age || 30,
          bloodGroup: p.bloodGroup || 'O+',
          dateOfBirth: p.dob || p.dateOfBirth || '',
          occupation: p.occupation || '',
          assignedHealer: p.healer?.name || p.assignedHealer || 'None',
          regDate: p.createdAt ? p.createdAt.split('T')[0] : new Date().toISOString().split('T')[0],
          lastVisitDate: p.updatedAt ? p.updatedAt.split('T')[0] : new Date().toISOString().split('T')[0],
          status: p.status ? (p.status.charAt(0).toUpperCase() + p.status.slice(1)) as any : 'Active',
          address: p.address || '',
          treatmentType: p.treatmentType || '',
          emergencyContact: {
            name: p.emergencyContact || 'Emergency Contact',
            relation: 'Family',
            mobile: '',
          },
          medicalInfo: {
            conditions: p.medicalHistory ? p.medicalHistory.split(',').map((c: string) => c.trim()) : ['None recorded'],
            allergies: ['No known allergies'],
            medications: [],
            notes: 'No specialized clinical notes entered.',
          },
          appointments: [],
          sessions: mappedSessions,
          financials: { balanceDue, invoices },
          documents: documentsList,
          activityLogs: [
            { action: 'Profile loaded from database node', timestamp: 'Just now', category: 'login' as const }
          ],
          statusHistory: [],
          healerHistory: [],
          feedback: mappedFeedback,
          branchId: p.branchId || '',
        };
        setSelectedPatient(formatted);
      }
    } catch (error) {
      console.error('Error fetching patient details:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ── Fetch the live payment ledger ─────────────────
  const fetchPatientLedger = useCallback(async (patId: string) => {
    if (!patId) return;
    setLoadingLedger(true);
    try {
      const response = await getPatientPaymentLedger(patId);
      const ledger = Array.isArray(response) ? response : (response.data || []);
      setPatientLedger(ledger);
    } catch (err) {
      console.error('Error fetching patient payment ledger:', err);
      setPatientLedger([]);
    } finally {
      setLoadingLedger(false);
    }
  }, []);

  // Fetch initial data
  useEffect(() => {
    if (id) {
      fetchPatientDetails(id);
      fetchPatientLedger(id);
    }
  }, [id, fetchPatientDetails, fetchPatientLedger]);



  useIonViewWillEnter(() => {
    if (id) {
      fetchPatientDetails(id);
      fetchPatientLedger(id);
    }
  });

  // Action: Transition Session Status in database
  const handleTransitionSessionStatus = async (sesId: string, nextStatus: any) => {
    if (!selectedPatient) return;
    try {
      await updateSession(sesId, { status: nextStatus.toLowerCase() });
      await fetchPatientDetails(selectedPatient.id);
    } catch (err: any) {
      console.error('Error updating session status:', err);
      alert(`Failed to update status: ${err.message || 'Unknown error'}`);
    }
  };

  // Action: Record payment in database
  const handleRecordPaymentSubmit = async () => {
    if (!selectedInvoice || !paymentRecord.amountPaid || !selectedPatient) {
      alert('Please enter a valid amount.');
      return;
    }

    const amountPaid = Number(paymentRecord.amountPaid);
    const method = paymentRecord.method;

    try {
      await processPayment({
        sessionId: selectedInvoice.sessionId,
        amount: amountPaid,
        paymentMethod: method.toLowerCase().replace(' ', '_'),
        branchId: selectedPatient.branchId,
      });

      await fetchPatientLedger(selectedPatient.id);
      await fetchPatientDetails(selectedPatient.id);
      setShowRecordPaymentModal(false);
      setSelectedInvoice(null);
      alert('Payment recorded successfully!');
    } catch (err: any) {
      console.error('Error recording payment:', err);
      alert(`Failed to record payment: ${err?.response?.data?.message || err.message || 'Unknown error'}`);
    }
  };

  // Action: Remove Assigned Healer in database
  const handleQuickRemoveHealer = async () => {
    if (!selectedPatient) return;
    try {
      await updatePatient(selectedPatient.id, { healerId: null });
      alert('Healer allocation removed successfully.');
      await fetchPatientDetails(selectedPatient.id);
    } catch (err: any) {
      console.error('Error removing healer:', err);
      alert(`Failed to remove healer: ${err.message || 'Unknown error'}`);
    }
  };

  // Action: Delete Session in database
  const handleDeleteSession = async (sesId: string) => {
    if (!window.confirm('Are you sure you want to delete this session?')) return;
    try {
      await deleteSession(sesId);
      alert('Session deleted successfully!');
      if (id) {
        await fetchPatientDetails(id);
        await fetchPatientLedger(id);
      }
    } catch (err: any) {
      console.error('Error deleting session:', err);
      alert(`Failed to delete session: ${err.message || 'Unknown error'}`);
    }
  };

  // Action: Delete Payment in database
  const handleDeletePayment = async (paymentId: string) => {
    if (!window.confirm('Are you sure you want to delete this payment?')) return;
    try {
      await deletePayment(paymentId);
      alert('Payment deleted successfully!');
      if (id) {
        await fetchPatientLedger(id);
        await fetchPatientDetails(id);
      }
    } catch (err: any) {
      console.error('Error deleting payment:', err);
      alert(`Failed to delete payment: ${err.message || 'Unknown error'}`);
    }
  };

  // Action: Upload Document to database
  const handleUploadDocument = async (field: string, file: File) => {
    if (!selectedPatient) return;
    try {
      const formData = new FormData();
      formData.append(field, file);
      await updatePatient(selectedPatient.id, formData);
      alert('Document uploaded successfully!');
      await fetchPatientDetails(selectedPatient.id);
    } catch (err: any) {
      console.error('Error uploading document:', err);
      alert(`Failed to upload document: ${err.message || 'Unknown error'}`);
    }
  };

  // Action: Delete Document from database
  const handleDeleteDocument = async (field: string) => {
    if (!selectedPatient) return;
    if (!window.confirm(`Are you sure you want to delete this document?`)) return;
    try {
      await updatePatient(selectedPatient.id, { [field]: null });
      alert('Document deleted successfully!');
      await fetchPatientDetails(selectedPatient.id);
    } catch (err: any) {
      console.error('Error deleting document:', err);
      alert(`Failed to delete document: ${err.message || 'Unknown error'}`);
    }
  };

  if (isLoading || !selectedPatient) {
    return (
      <IonPage className="sa-page">
        <IonHeader className="ion-no-border">
          <IonToolbar className="sa-page__toolbar">
            <IonButtons slot="start">
              <IonMenuButton />
            </IonButtons>
            <IonTitle className="sa-page__toolbar-title">Patient Management</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent className="sa-page__content" fullscreen>
          <div className="sa-page__body" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80%' }}>
            <span style={{ fontSize: '16px', fontWeight: 600, color: '#64748b' }}>Loading Patient Details...</span>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage className="sa-page">
      {/* Page Header */}
      <IonHeader className="ion-no-border">
        <IonToolbar className="sa-page__toolbar">
          <IonButtons slot="start">
            <IonMenuButton />
          </IonButtons>
          <IonTitle className="sa-page__toolbar-title">Patient Management</IonTitle>
          <IonButtons slot="end">
            <div className="sa-page__toolbar-actions">
              <IonButton fill="clear">
                <IonIcon icon={notificationsOutline} />
              </IonButton>
              <div className="sa-page__toolbar-avatar">{userInitials}</div>
            </div>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent className="sa-page__content" fullscreen>
        <div className="sa-page__body" style={{ padding: '24px' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <p className="sa-page__subtitle" style={{ margin: 0 }}>
              Patient Records, Medical Workflows and Session Tracking
            </p>
          </div>

          {/* Floating Back Button */}
          <div style={{ marginBottom: '16px' }}>
            <button 
              className="sa-btn sa-btn--outline" 
              onClick={() => history.push(ROUTES.BRANCH_ADMIN.PATIENTS)}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 700, background: '#ffffff', border: '1px solid #cbd5e1', color: 'var(--ba-color-primary)' }}
            >
              <IonIcon icon={arrowBackOutline} /> Back
            </button>
          </div>

          {/* Header Card */}
          <div style={{
            background: 'var(--ba-color-primary)',
            borderRadius: '16px',
            padding: '24px 32px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '20px',
            color: '#ffffff',
            boxShadow: '0 4px 20px rgba(31, 122, 106, 0.15)',
            marginBottom: '20px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              {/* Avatar */}
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                border: '2px solid rgba(255, 255, 255, 0.8)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                fontSize: '20px',
                color: '#ffffff',
                background: 'rgba(255, 255, 255, 0.15)',
                textShadow: '0 1px 2px rgba(0,0,0,0.1)'
              }}>
                {selectedPatient.initials}
              </div>
              
              {/* Patient Info */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <h2 style={{ fontSize: '26px', fontWeight: 700, margin: 0, color: '#ffffff', letterSpacing: '-0.5px' }}>
                  {selectedPatient.name}
                </h2>
                <span style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.85)', fontWeight: 500 }}>
                  Patient ID: <strong style={{ color: '#ffffff' }}>{selectedPatient.patientId || selectedPatient.id}</strong> • Gender: <strong style={{ color: '#ffffff' }}>{selectedPatient.gender}</strong> • Age: <strong style={{ color: '#ffffff' }}>{selectedPatient.age}</strong>
                </span>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                onClick={() => history.push(ROUTES.BRANCH_ADMIN.EDIT_PATIENT.replace(':id', encodeURIComponent(selectedPatient.id)))}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 20px',
                  background: 'rgba(255, 255, 255, 0.15)',
                  border: '1px solid rgba(255, 255, 255, 0.6)',
                  borderRadius: '8px',
                  color: '#ffffff',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  outline: 'none'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)';
                  e.currentTarget.style.borderColor = '#ffffff';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.6)';
                }}
              >
                <IonIcon icon={pencilOutline} style={{ fontSize: '16px' }} /> Edit Profile
              </button>
            </div>
          </div>

          {/* Tabs navigation */}
          <div style={{
            display: 'flex',
            borderBottom: '1px solid #e2e8f0',
            marginBottom: '24px',
            background: '#ffffff',
            padding: '0 8px',
            gap: '32px',
            overflowX: 'auto'
          }}>
            {[
              { id: 'basic', label: 'BASIC INFO' },
              { id: 'sessions', label: 'SESSION HISTORY' },
              { id: 'financials', label: 'PAYMENTS' },
            ].map((tab) => {
              const isActive = profileTab === tab.id;
              return (
                <button 
                  key={tab.id}
                  onClick={() => setProfileTab(tab.id as any)}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: '16px 4px',
                    fontSize: '13px',
                    fontWeight: 700,
                    color: isActive ? 'var(--ba-color-primary)' : '#64748b',
                    borderBottom: isActive ? '3px solid var(--ba-color-primary)' : '3px solid transparent',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    outline: 'none',
                    letterSpacing: '0.5px',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          <div className="sa-profile-body" style={{ padding: 0, background: 'transparent' }}>
            {profileTab === 'basic' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
                {/* Basic Info Column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px' }}>
                    <span className="pa-info-block-title" style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', color: '#0f172a', margin: '0 0 16px 0' }}>
                      <IonIcon icon={personOutline} style={{ color: 'var(--ba-color-primary)' }} />
                      Basic Information
                    </span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div>
                        <span className="pa-info-label" style={{ fontSize: '10px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>Mobile Number</span>
                        <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px', fontWeight: 700, color: '#334155', marginTop: '4px' }}>
                          {selectedPatient.mobile}
                        </div>
                      </div>
                      <div>
                        <span className="pa-info-label" style={{ fontSize: '10px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>Email Address</span>
                        <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px', fontWeight: 700, color: '#334155', marginTop: '4px' }}>
                          {selectedPatient.email || 'None'}
                        </div>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div>
                          <span className="pa-info-label" style={{ fontSize: '10px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>Registration Date</span>
                          <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px', fontWeight: 700, color: '#334155', marginTop: '4px' }}>
                            {selectedPatient.regDate}
                          </div>
                        </div>
                        <div>
                          <span className="pa-info-label" style={{ fontSize: '10px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>Blood Group</span>
                          <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px', fontWeight: 700, color: '#334155', marginTop: '4px' }}>
                            {selectedPatient.bloodGroup || 'O+'}
                          </div>
                        </div>
                      </div>
                      <div>
                        <span className="pa-info-label" style={{ fontSize: '10px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>Address</span>
                        <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px', fontWeight: 700, color: '#334155', marginTop: '4px', lineHeight: 1.4 }}>
                          {selectedPatient.address || 'None provided'}
                        </div>
                      </div>
                      <div>
                        <span className="pa-info-label" style={{ fontSize: '10px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>Emergency Contact</span>
                        <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px', fontWeight: 700, color: '#334155', marginTop: '4px' }}>
                          {selectedPatient.emergencyContact?.name || 'None'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Documents Management Card */}
                  <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px' }}>
                    <span className="pa-info-block-title" style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', color: '#0f172a', margin: '0 0 16px 0' }}>
                      <IonIcon icon={receiptOutline} style={{ color: 'var(--ba-color-primary)' }} />
                      Patient Documents
                    </span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {[
                        { key: 'medicalReport', label: 'Medical Report', doc: selectedPatient.documents.find(d => d.id === 'med-rep') },
                        { key: 'labReport', label: 'Lab Report', doc: selectedPatient.documents.find(d => d.id === 'lab-rep') },
                        { key: 'prescription', label: 'Prescription', doc: selectedPatient.documents.find(d => d.id === 'prescription') },
                        { key: 'idProof', label: 'ID Proof', doc: selectedPatient.documents.find(d => d.id === 'id-proof') },
                      ].map((item) => {
                        const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
                        const serverOrigin = apiBase.replace('/api', '');
                        const fileUrl = item.doc ? `${serverOrigin}/${item.doc.name}` : '';

                        return (
                          <div key={item.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', maxWidth: '70%', overflow: 'hidden' }}>
                              <span style={{ fontSize: '10px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>{item.label}</span>
                              {item.doc ? (
                                <a 
                                  href={fileUrl} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  style={{ fontSize: '13px', fontWeight: 700, color: 'var(--ba-color-primary)', textDecoration: 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                                >
                                  {item.doc.name.split('/').pop()}
                                </a>
                              ) : (
                                <span style={{ fontSize: '13px', color: '#64748b', fontStyle: 'italic' }}>Not Uploaded</span>
                              )}
                            </div>
                            <div style={{ display: 'flex', gap: '6px' }}>
                              {item.doc ? (
                                <button 
                                  className="sa-btn sa-btn--outline" 
                                  onClick={() => handleDeleteDocument(item.key)} 
                                  style={{ color: '#ef4444', borderColor: '#fee2e2', background: '#fef2f2', padding: '6px 10px', fontSize: '12px', cursor: 'pointer' }}
                                >
                                  <IonIcon icon={trashOutline} /> Delete
                                </button>
                              ) : (
                                <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: 'pointer', background: 'var(--ba-color-primary)', color: '#ffffff', padding: '6px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 600 }}>
                                  Upload
                                  <input 
                                    type="file" 
                                    style={{ display: 'none' }} 
                                    onChange={(e) => {
                                      if (e.target.files && e.target.files[0]) {
                                        handleUploadDocument(item.key, e.target.files[0]);
                                      }
                                    }} 
                                  />
                                </label>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Medical Info Column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px' }}>
                    <span className="pa-info-block-title" style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', color: '#0f172a', margin: '0 0 16px 0' }}>
                      <IonIcon icon={medkitOutline} style={{ color: '#ef4444' }} />
                      Medical Information
                    </span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div>
                        <span className="pa-info-label" style={{ fontSize: '10px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>Health Conditions</span>
                        <div style={{ marginTop: '6px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          {selectedPatient.medicalInfo.conditions.map((c, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700, color: '#475569' }}>
                              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} />
                              {c}
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <span className="pa-info-label" style={{ fontSize: '10px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>Clinical Notes</span>
                        <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px', fontStyle: 'italic', color: '#64748b', marginTop: '6px', lineHeight: 1.5 }}>
                          "{selectedPatient.medicalInfo.notes}"
                        </div>
                      </div>
                      <div>
                        <span className="pa-info-label" style={{ fontSize: '10px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>Allergies</span>
                        <div style={{ marginTop: '6px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          {selectedPatient.medicalInfo.allergies && selectedPatient.medicalInfo.allergies.length > 0 ? (
                            selectedPatient.medicalInfo.allergies.map((a, i) => (
                              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700, color: '#475569' }}>
                                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ef4444' }} />
                                {a}
                              </div>
                            ))
                          ) : (
                            <div style={{ fontSize: '12px', color: '#64748b' }}>No known allergies</div>
                          )}
                        </div>
                      </div>
                      <div>
                        <span className="pa-info-label" style={{ fontSize: '10px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>Treatment Information</span>
                        <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px', fontWeight: 700, color: '#334155', marginTop: '4px' }}>
                          {selectedPatient.treatmentType || 'None specified'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Assignment Box */}
                  <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <span className="pa-info-block-title" style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', color: '#0f172a', margin: 0 }}>
                        <IonIcon icon={personOutline} style={{ color: 'var(--ba-color-primary)' }} />
                        Assigned Clinical Healer
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <div style={{ width: '36px', height: '36px', background: 'var(--ba-color-primary)', color: '#ffffff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '14px' }}>
                          {(selectedPatient.assignedHealer === 'None' ? 'U' : selectedPatient.assignedHealer.replace('Dr. ', '')[0])}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontSize: '13px', fontWeight: 800, color: '#334155' }}>
                            {selectedPatient.assignedHealer === 'None' ? 'None (Unassigned)' : selectedPatient.assignedHealer}
                          </span>
                          <span style={{ fontSize: '10px', color: '#94a3b8', marginTop: '2px' }}>Energetics Specialist</span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        {selectedPatient.assignedHealer === 'None' ? (
                          <button className="sa-btn sa-btn--primary" onClick={() => history.push(ROUTES.BRANCH_ADMIN.EDIT_PATIENT.replace(':id', encodeURIComponent(selectedPatient.id)))} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                            + Assign
                          </button>
                        ) : (
                          <button className="sa-btn sa-btn--outline" onClick={handleQuickRemoveHealer} style={{ color: '#ef4444', borderColor: '#fee2e2', background: '#fef2f2' }}>
                            <IonIcon icon={trashOutline} /> Remove
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {profileTab === 'sessions' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
                {/* Healing Sessions Table */}
                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #e6f4f1', paddingBottom: '12px', marginBottom: '16px' }}>
                    <h4 style={{ fontSize: '13px', fontWeight: 800, color: 'var(--ba-color-primary)', textTransform: 'uppercase', letterSpacing: '0.6px', display: 'flex', alignItems: 'center', gap: '6px', margin: 0 }}>
                      <IonIcon icon={timeOutline} style={{ color: 'var(--ba-color-primary)', fontSize: '18px' }} />
                      Clinical Sessions History Ledger
                    </h4>
                    <button className="sa-btn sa-btn--primary" onClick={() => history.push(ROUTES.BRANCH_ADMIN.BOOK_SESSION, { patientId: selectedPatient.id })} style={{ fontSize: '12px', padding: '6px 14px', whiteSpace: 'nowrap' }}>
                      + Add Session / Appointment
                    </button>
                  </div>

                  <div className="sa-table-container">
                    <table className="sa-table" style={{ width: '100%' }}>
                      <thead>
                        <tr>
                          <th>SES ID</th>
                          <th>HEALER SPECIALIST</th>
                          <th>NOTES / PRESCRIPTIONS</th>
                          <th>STATUS</th>
                          <th>ACTIONS</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedPatient.sessions && selectedPatient.sessions.length > 0 ? (
                          [...selectedPatient.sessions].reverse().map((s) => {
                            return (
                              <tr key={s.id} className="sa-table-row">
                                <td style={{ fontWeight: '700', whiteSpace: 'nowrap' }}>{s.id.substring(0, 8).toUpperCase()}</td>
                                <td style={{ whiteSpace: 'nowrap' }}>{s.healer}</td>
                                <td style={{ maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={s.notes}>
                                  {s.notes}
                                </td>
                                <td>
                                  <select
                                    value={s.status}
                                    onChange={(e) => handleTransitionSessionStatus(s.id, e.target.value as any)}
                                    style={{
                                      padding: '4px 8px',
                                      borderRadius: '6px',
                                      fontSize: '11px',
                                      fontWeight: 700,
                                      background:
                                        s.status === 'Completed' ? '#ecfdf5' :
                                        s.status === 'Ongoing' ? '#eff6ff' :
                                        s.status === 'Cancelled' ? '#fef2f2' : '#fffbeb',
                                      color:
                                        s.status === 'Completed' ? '#047857' :
                                        s.status === 'Ongoing' ? '#1d4ed8' :
                                        s.status === 'Cancelled' ? '#ef4444' : '#b45309',
                                      border: '1px solid #cbd5e1',
                                      outline: 'none',
                                    }}
                                  >
                                    <option value="Scheduled">Scheduled</option>
                                    <option value="Ongoing">Ongoing</option>
                                    <option value="Completed">Completed</option>
                                    <option value="Cancelled">Cancelled</option>
                                  </select>
                                </td>
                                <td>
                                  <button
                                    onClick={() => handleDeleteSession(s.id)}
                                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}
                                    title="Delete Session"
                                  >
                                    <IonIcon icon={trashOutline} style={{ color: '#ef4444', fontSize: '18px' }} />
                                  </button>
                                </td>
                              </tr>
                            );
                          })
                        ) : (
                          <tr>
                            <td colSpan={5} className="sa-table-empty">
                              No sequential sessions registered yet.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {profileTab === 'financials' && (() => {
              const liveLedger = patientLedger;

              // Summary card calculations from live data
              const totalBilled = liveLedger.reduce((s: number, r: any) => s + (Number(r.totalBilled) || 0), 0);
              const totalPaid   = liveLedger.reduce((s: number, r: any) => s + (Number(r.paid) || 0), 0);
              const outstandingBalance = liveLedger.reduce((s: number, r: any) => s + (Number(r.outstanding) || 0), 0);

              return (
                <div>
                  {/* Summary Cards */}
                  <div className="pa-billing-summary" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '20px' }}>
                    <div style={{ borderLeft: '4px solid #3b82f6', background: '#ffffff', padding: '16px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                      <span style={{ fontSize: '10px', textTransform: 'uppercase', color: '#64748b', fontWeight: 700 }}>Total Billed</span>
                      <span style={{ display: 'block', fontSize: '24px', fontWeight: 800, color: '#3b82f6', marginTop: '4px' }}>
                        ₹{totalBilled.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div style={{ borderLeft: '4px solid #10b981', background: '#ffffff', padding: '16px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                      <span style={{ fontSize: '10px', textTransform: 'uppercase', color: '#64748b', fontWeight: 700 }}>Total Paid</span>
                      <span style={{ display: 'block', fontSize: '24px', fontWeight: 800, color: '#10b981', marginTop: '4px' }}>
                        ₹{totalPaid.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div style={{ borderLeft: '4px solid #ef4444', background: '#ffffff', padding: '16px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                      <span style={{ fontSize: '10px', textTransform: 'uppercase', color: '#64748b', fontWeight: 700 }}>Outstanding Balance</span>
                      <span style={{ display: 'block', fontSize: '24px', fontWeight: 800, color: outstandingBalance > 0 ? '#ef4444' : '#64748b', marginTop: '4px' }}>
                        ₹{outstandingBalance.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  {/* Ledger Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '2px solid #e6f4f1', paddingBottom: '12px' }}>
                    <div>
                      <h4 style={{ fontSize: '13px', fontWeight: 800, color: 'var(--ba-color-primary)', textTransform: 'uppercase', letterSpacing: '0.6px', display: 'flex', alignItems: 'center', gap: '6px', margin: 0 }}>
                        Patient Payment Ledger
                      </h4>
                      <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#64748b' }}>
                        Detailed tracking of patient invoicing, installments, and status logs
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      {loadingLedger && (
                        <span style={{ fontSize: '11px', color: '#94a3b8' }}>Refreshing…</span>
                      )}
                      <button
                        className="sa-btn"
                        style={{ background: '#0D5C46', color: 'white', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', padding: '6px 14px' }}
                        onClick={() => {
                          const firstOutstanding = liveLedger.find((r: any) => Number(r.outstanding) > 0);
                          if (firstOutstanding) {
                            setSelectedInvoice({ ...firstOutstanding, id: firstOutstanding.id, sessionId: firstOutstanding.sessionId, amount: firstOutstanding.outstanding });
                            setPaymentRecord({ amountPaid: firstOutstanding.outstanding, method: 'UPI', status: 'Paid' });
                            setShowRecordPaymentModal(true);
                          } else if (liveLedger.length > 0) {
                            const first = liveLedger[0];
                            setSelectedInvoice({ ...first, id: first.id, sessionId: first.sessionId, amount: first.outstanding });
                            setPaymentRecord({ amountPaid: first.outstanding, method: 'UPI', status: 'Paid' });
                            setShowRecordPaymentModal(true);
                          } else {
                            alert('No sessions found for this patient to record a payment against. Please book a session first.');
                          }
                        }}
                      >
                        <IonIcon icon={addCircleOutline} /> Add Payment
                      </button>
                    </div>
                  </div>

                  {/* Live Ledger Table */}
                  <div className="sa-table-container" style={{ overflowX: 'auto' }}>
                    <table className="sa-table" style={{ width: '100%' }}>
                      <thead>
                        <tr>
                          <th>PATIENT</th>
                          <th>SESSION NO</th>
                          <th>TOTAL BILLED</th>
                          <th>PAID</th>
                          <th>OUTSTANDING</th>
                          <th>STATUS</th>
                          <th>ACTIONS</th>
                        </tr>
                      </thead>
                      <tbody>
                        {loadingLedger ? (
                          <tr>
                            <td colSpan={7} className="sa-table-empty">Loading payment records…</td>
                          </tr>
                        ) : liveLedger.length > 0 ? (
                          liveLedger.map((r: any) => {
                            const isPaid = (r.paymentStatus || '').toLowerCase() === 'paid';
                            const patientName = r.patientName || (selectedPatient && selectedPatient.name) || 'Unknown';
                            const sessionNo = r.sessionNo || `SES-${r.sessionId.substring(0, 8).toUpperCase()}`;
                            return (
                              <tr key={r.id} className="sa-table-row">
                                <td style={{ fontWeight: '700' }}>{patientName}</td>
                                <td style={{ fontWeight: '600' }}>{sessionNo}</td>
                                <td style={{ fontWeight: '700', color: '#475569' }}>₹{Number(r.totalBilled || 0).toLocaleString('en-IN')}</td>
                                <td style={{ color: '#10b981', fontWeight: 700 }}>₹{Number(r.paid || 0).toLocaleString('en-IN')}</td>
                                <td style={{ color: Number(r.outstanding) > 0 ? '#ef4444' : '#64748b', fontWeight: 700 }}>₹{Number(r.outstanding || 0).toLocaleString('en-IN')}</td>
                                <td>
                                  <span
                                    style={{
                                      textTransform: 'uppercase',
                                      fontSize: '9px',
                                      padding: '2px 8px',
                                      borderRadius: '12px',
                                      fontWeight: 800,
                                      background: isPaid ? '#ecfdf5' : (r.paymentStatus || '').toLowerCase() === 'pending' ? '#fef2f2' : '#fffbeb',
                                      color: isPaid ? '#10b981' : (r.paymentStatus || '').toLowerCase() === 'pending' ? '#ef4444' : '#f59e0b',
                                      border: `1px solid ${isPaid ? '#a7f3d0' : (r.paymentStatus || '').toLowerCase() === 'pending' ? '#fecaca' : '#fde68a'}`
                                    }}
                                  >
                                    {r.paymentStatus || 'Pending'}
                                  </span>
                                </td>
                                <td>
                                  <div style={{ display: 'flex', gap: '8px' }}>
                                    <button
                                      style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}
                                      title="View Session Details"
                                      onClick={() => {
                                        history.push(ROUTES.BRANCH_ADMIN.SESSION_DETAILS.replace(':id', r.sessionId), { fromPatientId: selectedPatient.id });
                                      }}
                                    >
                                      <IonIcon icon={eyeOutline} style={{ fontSize: '18px', color: '#64748b' }} />
                                    </button>
                                    <button
                                      style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}
                                      title="Edit Session"
                                      onClick={() => {
                                        history.push(ROUTES.BRANCH_ADMIN.EDIT_SESSION.replace(':id', r.sessionId), { fromPatientId: selectedPatient.id });
                                      }}
                                    >
                                      <IonIcon icon={pencilOutline} style={{ fontSize: '18px', color: '#6366f1' }} />
                                    </button>
                                    <button
                                      style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}
                                      title="View Payment Drawer"
                                      onClick={() => {
                                        setDrawerPayment(mapLedgerToDrawerPayment(r));
                                        setShowDrawer(true);
                                      }}
                                    >
                                      <IonIcon icon={receiptOutline} style={{ fontSize: '18px', color: '#0D5C46' }} />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        ) : (
                          <tr>
                            <td colSpan={7} className="sa-table-empty">
                              No payment records found for this patient.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Modal: Record Payment */}
          <IonModal isOpen={showRecordPaymentModal} onDidDismiss={() => setShowRecordPaymentModal(false)} className="sa-modal sa-modal--sm">
            <div className="sa-modal__content">
              <div className="sa-modal__header">
                <h2>Record Bill Payment: {selectedInvoice?.id}</h2>
                <button className="sa-modal__close-btn" onClick={() => setShowRecordPaymentModal(false)}>×</button>
              </div>
              <div className="sa-modal__body">
                {selectedInvoice && (
                  <div className="st-form">
                    <div className="st-form-group">
                      <label className="st-form-label">TOTAL INVOICE AMOUNT (INR)</label>
                      <input
                        type="text"
                        className="st-input"
                        value={`₹${selectedInvoice.amount}`}
                        disabled
                        style={{ background: '#f1f5f9', fontWeight: 'bold' }}
                      />
                    </div>
                    
                    <div className="st-form-group">
                      <label className="st-form-label">AMOUNT RECEIVED (INR) *</label>
                      <input
                        type="number"
                        className="st-input"
                        value={paymentRecord.amountPaid}
                        onChange={(e) => setPaymentRecord({ ...paymentRecord, amountPaid: Number(e.target.value) })}
                        placeholder="Enter amount paid"
                      />
                    </div>

                    <div className="st-form-group">
                      <label className="st-form-label">PAYMENT CHANNEL MODE *</label>
                      <select
                        className="st-input"
                        value={paymentRecord.method}
                        onChange={(e) => setPaymentRecord({ ...paymentRecord, method: e.target.value as any })}
                      >
                        <option value="UPI">UPI Payment Channel</option>
                        <option value="Cash">Cash Handover Ledger</option>
                        <option value="Bank Transfer">Bank Wire Transfer</option>
                      </select>
                    </div>

                    <div className="st-form-group">
                      <label className="st-form-label">POST-TRANSACTION STATUS *</label>
                      <select
                        className="st-input"
                        value={paymentRecord.status}
                        onChange={(e) => setPaymentRecord({ ...paymentRecord, status: e.target.value as any })}
                      >
                        <option value="Paid">Fully Paid (Settled)</option>
                        <option value="Partial">Partially Paid (Pending balance)</option>
                        <option value="Pending">Still Pending (Unpaid)</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>
              <div className="sa-modal__footer">
                <button className="sa-btn sa-btn--outline" onClick={() => setShowRecordPaymentModal(false)}>Cancel</button>
                <button className="sa-btn sa-btn--primary" onClick={handleRecordPaymentSubmit}>Save Payment Record</button>
              </div>
            </div>
          </IonModal>

        </div>
      </IonContent>

      {/* ── DRAWER: PATIENT BILLING SUMMARY ────────────────────────────── */}
      {showDrawer && drawerPayment && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.4)', zIndex: 100000, display: 'flex', justifyContent: 'flex-end' }} onClick={() => setShowDrawer(false)}>
          <div 
            style={{ background: '#fff', width: '100%', maxWidth: '480px', height: '100%', boxShadow: '-5px 0 25px rgba(0,0,0,0.15)', display: 'flex', flexDirection: 'column' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div style={{ padding: '24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#0D5C46', color: '#fff' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 800 }}>Billing Summary</h2>
                <span style={{ fontSize: '12px', opacity: 0.8 }}>Case ID: {drawerPayment.caseId} • {drawerPayment.sessionNo}</span>
              </div>
              <button 
                onClick={() => setShowDrawer(false)}
                style={{ background: 'none', border: 'none', color: '#fff', fontSize: '24px', cursor: 'pointer', outline: 'none' }}
              >
                ×
              </button>
            </div>

            {/* Drawer Content */}
            <div style={{ padding: '24px', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* Patient Info */}
              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #cbd5e1' }}>
                <h3 style={{ margin: '0 0 12px 0', fontSize: '13px', fontWeight: 800, color: '#0d5c46', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Patient Information</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>Patient Name:</span>
                    <strong style={{ color: '#334155' }}>{drawerPayment.patientName}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>Assigned Healer:</span>
                    <strong style={{ color: '#334155' }}>{drawerPayment.assignedHealer}</strong>
                  </div>
                </div>
              </div>

              {/* Billing Summary */}
              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #cbd5e1' }}>
                <h3 style={{ margin: '0 0 12px 0', fontSize: '13px', fontWeight: 800, color: '#0d5c46', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Billing Summary</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>Total Billed:</span>
                    <strong style={{ color: '#334155', fontSize: '14px' }}>₹{drawerPayment.totalBilled.toLocaleString('en-IN')}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>Total Paid:</span>
                    <strong style={{ color: '#16a34a', fontSize: '14px' }}>₹{drawerPayment.paid.toLocaleString('en-IN')}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed #cbd5e1', paddingTop: '8px', marginTop: '4px' }}>
                    <span style={{ color: '#64748b', fontWeight: 700 }}>Outstanding Balance:</span>
                    <strong style={{ color: '#ef4444', fontSize: '15px' }}>₹{drawerPayment.outstanding.toLocaleString('en-IN')}</strong>
                  </div>
                </div>
              </div>

              {/* Payment History */}
              <div>
                <h3 style={{ margin: '0 0 12px 0', fontSize: '13px', fontWeight: 800, color: '#0d5c46', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Payment Installment History</h3>
                {drawerPayment.history.length > 0 ? (
                  <div style={{ border: '1px solid #cbd5e1', borderRadius: '8px', overflow: 'hidden' }}>
                    <table style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ background: '#f1f5f9', borderBottom: '1px solid #cbd5e1' }}>
                          <th style={{ padding: '8px', textAlign: 'left' }}>DATE</th>
                          <th style={{ padding: '8px', textAlign: 'left' }}>AMOUNT</th>
                          <th style={{ padding: '8px', textAlign: 'left' }}>MODE</th>
                          <th style={{ padding: '8px', textAlign: 'left' }}>STATUS</th>
                        </tr>
                      </thead>
                      <tbody>
                        {drawerPayment.history.map((h: any, i: number) => (
                          <tr key={i} style={{ borderBottom: i < drawerPayment.history.length - 1 ? '1px solid #cbd5e1' : 'none' }}>
                            <td style={{ padding: '8px', fontWeight: 600 }}>{h.date}</td>
                            <td style={{ padding: '8px', fontWeight: 700, color: '#16a34a' }}>₹{h.amount.toLocaleString('en-IN')}</td>
                            <td style={{ padding: '8px' }}>{h.mode}</td>
                            <td style={{ padding: '8px' }}>
                              <span style={{ background: '#ecfdf5', color: '#10b981', padding: '2px 6px', borderRadius: '4px', fontWeight: 800, fontSize: '9px' }}>{h.status}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '20px', color: '#64748b', fontSize: '12px', background: '#f8fafc', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
                    No payment transaction history logged yet.
                  </div>
                )}
              </div>

            </div>

            {/* Drawer Footer */}
            <div style={{ padding: '16px 24px', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '12px', background: '#f8fafc' }}>
              <button 
                onClick={() => setShowDrawer(false)}
                style={{
                  background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '10px 20px',
                  fontSize: '13px', fontWeight: 600, color: '#475569', cursor: 'pointer', flex: 1, textAlign: 'center'
                }}
              >
                Close Drawer
              </button>
            </div>
          </div>
        </div>
      )}
    </IonPage>
  );
}
