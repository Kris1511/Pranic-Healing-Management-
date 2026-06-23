import React, { useState, useEffect, useMemo } from 'react';
import {
  IonPage,
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonIcon,
  IonSpinner,
  useIonViewWillEnter,
  useIonViewWillLeave,
} from '@ionic/react';
import {
  arrowBackOutline,
  personOutline,
  calendarOutline,
  documentTextOutline,
  medkitOutline,
  fileTrayFullOutline,
  documentOutline,
  ribbonOutline,
} from 'ionicons/icons';
import { useHistory, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getPatientById } from '../../api/patient.api';
import './Healers.css';

interface SessionHistoryItem {
  id: string;
  date: string;
  time: string;
  protocol: string;
  notes: string;
  healerName: string;
  followupRequired: boolean;
  followupPriority: string;
  followupDate: string;
}

interface DocumentItem {
  id: string;
  fileName: string;
  fileType: string;
  date: string;
}

interface MedicalHistoryItem {
  condition: string;
  diagnosedDate: string;
  description: string;
}

const PatientsDetialsPages: React.FC = () => {
  const history = useHistory();
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<'profile' | 'history' | 'documents'>('profile');
  const [isPageActive, setIsPageActive] = useState(true);

  // Fetch patient details from database using React Query
  const { data: patientRes, isLoading, error, refetch } = useQuery({
    queryKey: ['patient-details', id],
    queryFn: () => getPatientById(id),
    enabled: !!id,
    refetchInterval: isPageActive ? 3000 : false, // Poll every 3 seconds for real-time synchronization
  });

  useIonViewWillEnter(() => {
    setIsPageActive(true);
    refetch();
  });

  useIonViewWillLeave(() => {
    setIsPageActive(false);
  });

  // Automatically redirect if the patient record was deleted (404 status)
  useEffect(() => {
    if (error) {
      const status = (error as any)?.response?.status;
      if (status === 404) {
        history.push('/healer/patients');
      }
    }
  }, [error, history]);

  const patient = useMemo(() => {
    if (!patientRes) return null;
    return patientRes.data || patientRes;
  }, [patientRes]);

  // Use patient address directly
  const displayAddress = useMemo(() => {
    return patient?.address || 'N/A';
  }, [patient?.address]);

  // Parse medical history text from database (structured as "Condition | DiagnosedDate | Description, ...")
  const parsedMedicalHistory = useMemo<MedicalHistoryItem[]>(() => {
    if (!patient?.medicalHistory) return [];
    
    // Check if it looks like comma separated
    return patient.medicalHistory.split(',').map((item: string) => {
      const parts = item.split('|');
      return {
        condition: parts[0]?.trim() || item.trim(),
        diagnosedDate: parts[1]?.trim() || 'N/A',
        description: parts[2]?.trim() || 'No additional details recorded.'
      };
    });
  }, [patient?.medicalHistory]);

  // Map session treatment history
  const sessionHistory = useMemo<SessionHistoryItem[]>(() => {
    if (!patient?.sessions || !Array.isArray(patient.sessions)) return [];
    
    return patient.sessions.map((s: any) => ({
      id: s.id,
      date: s.sessionDate 
        ? (() => {
            const d = new Date(s.sessionDate);
            return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
          })()
        : 'N/A',
      time: s.startTime ? (s.endTime ? `${s.startTime} - ${s.endTime}` : s.startTime) : 'N/A',
      protocol: s.treatments && s.treatments.length > 0 
        ? s.treatments.map((t: any) => t.treatmentName).join(', ') 
        : 'Pranic Restoration',
      notes: s.notes || 'No notes added.',
      healerName: s.healer?.name || 'Unknown Healer',
      followupRequired: !!s.followupRequired || !!s.followup_required,
      followupPriority: (s.followupPriority || s.followup_priority || 'NONE').toUpperCase(),
      followupDate: s.followupDate || s.followup_date || '',
    }));
  }, [patient?.sessions]);

  // Map documents list
  const documentsList = useMemo<DocumentItem[]>(() => {
    if (!patient?.documents || !Array.isArray(patient.documents)) return [];
    
    return patient.documents.map((d: any) => ({
      id: d.id,
      fileName: d.original_name || d.originalName || d.fileName,
      fileType: d.fileType || 'Report',
      date: d.createdAt 
        ? (() => {
            const dateObj = new Date(d.createdAt);
            return `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;
          })()
        : 'N/A'
    }));
  }, [patient?.documents]);

  const errorMsg = error ? 'Failed to retrieve patient profile details.' : null;

  return (
    <IonPage className="sa-page">
      <IonHeader className="ion-no-border">
        <IonToolbar className="sa-page__toolbar">
          <IonButtons slot="start">
            <button 
              className="healer-back-btn"
              onClick={() => history.push('/healer/patients')}
              style={{ color: '#0d9488' }}
            >
              <IonIcon icon={arrowBackOutline} />
            </button>
          </IonButtons>
          <IonTitle className="sa-page__toolbar-title" style={{ color: '#0d9488', fontWeight: 700 }}>
            {patient ? `${patient.name} - Case File` : 'Patient Details'}
          </IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="sa-page__content">
        <div className="healer-page-container">
          
          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '5rem 0' }}>
              <IonSpinner name="crescent" style={{ color: '#0d9488' }} />
              <p style={{ margin: '1rem 0 0 0', fontWeight: 600, color: 'var(--ion-color-medium)' }}>
                Loading patient record...
              </p>
            </div>
          ) : errorMsg ? (
            <div style={{ textAlign: 'center', padding: '5rem 0', color: 'var(--ion-color-danger)' }}>
              <p style={{ fontWeight: 600 }}>{errorMsg}</p>
              <button className="healer-btn" onClick={() => history.push('/healer/patients')}>
                Back to Patients List
              </button>
            </div>
          ) : patient ? (
            <>
              {/* Patient Header Section */}
              <div className="patient-details-header">
                <h1 className="patient-details-name">{patient.name}</h1>
                <p className="patient-details-subtitle">
                  Patient ID: {patient.patientId || 'N/A'} | Status: {patient.status || 'Active'}
                </p>
              </div>

              {/* Tab Navigation Pill Container */}
              <div className="pill-tabs-container">
                <button
                  className={`pill-tab ${activeTab === 'profile' ? 'pill-tab--active' : ''}`}
                  onClick={() => setActiveTab('profile')}
                >
                  Profile
                </button>
                <button
                  className={`pill-tab ${activeTab === 'history' ? 'pill-tab--active' : ''}`}
                  onClick={() => setActiveTab('history')}
                >
                  History
                </button>
                <button
                  className={`pill-tab ${activeTab === 'documents' ? 'pill-tab--active' : ''}`}
                  onClick={() => setActiveTab('documents')}
                >
                  Documents
                </button>
              </div>

              {/* Tab Content Rendering */}
              {activeTab === 'profile' && (
                <div className="info-section-card">
                  <div className="info-section-title-row">
                    <IonIcon icon={personOutline} />
                    <span>General Information</span>
                  </div>
                  
                  <div className="info-grid">
                    <div className="info-item">
                      <span className="info-label">Patient ID</span>
                      <span className="info-value">{patient.patientId || 'N/A'}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Full Name</span>
                      <span className="info-value">{patient.name}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Age / Gender</span>
                      <span className="info-value">
                        {patient.age ? `${patient.age} yrs` : 'N/A'} / {patient.gender || 'Unknown'}
                      </span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Blood Group</span>
                      <span className="info-value">{patient.bloodGroup || 'N/A'}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Email ID</span>
                      <span className="info-value">{patient.email || 'N/A'}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Phone Number</span>
                      <span className="info-value">{patient.phone || 'N/A'}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Date of Birth</span>
                      <span className="info-value">{patient.dob || 'N/A'}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Occupation</span>
                      <span className="info-value">{patient.occupation || 'N/A'}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Address</span>
                      <span className="info-value">{displayAddress}</span>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'history' && (
                <div className="info-section-card">
                  <div className="info-section-title-row">
                    <IonIcon icon={medkitOutline} />
                    <span>Medical History</span>
                  </div>

                  {parsedMedicalHistory.length > 0 ? (
                    parsedMedicalHistory.map((item, idx) => (
                      <div key={idx} className="history-item-card">
                        <div className="history-item-header">
                          <h4 className="history-item-title">{item.condition}</h4>
                          <span className="history-item-date">Diagnosed: {item.diagnosedDate}</span>
                        </div>
                        <p className="history-item-description">{item.description}</p>
                      </div>
                    ))
                  ) : (
                    <p style={{ margin: 0, color: 'var(--ion-color-medium)', fontSize: '0.95rem' }}>
                      No diagnosed medical conditions recorded in profile.
                    </p>
                  )}

                  {/* Sessions & Treatments History Section */}
                  <div className="info-section-title-row" style={{ marginTop: '2.5rem' }}>
                    <IonIcon icon={calendarOutline} />
                    <span>Treatment History</span>
                  </div>

                  {sessionHistory.length > 0 ? (
                    sessionHistory.map((session) => (
                      <div key={session.id} className={`history-item-card ${session.followupRequired && session.followupPriority === 'URGENT' ? 'history-item-card--urgent' : ''}`} style={{ borderLeftColor: session.followupRequired && session.followupPriority === 'URGENT' ? 'var(--color-danger)' : '#0ea5e9' }}>
                        <div className="history-item-header">
                          <h4 className="history-item-title" style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                            {session.protocol}
                            {session.followupRequired && session.followupPriority !== 'NONE' && (
                              <span style={{ 
                                padding: '2px 8px', 
                                borderRadius: '4px', 
                                fontSize: '0.75rem', 
                                fontWeight: 600, 
                                background: session.followupPriority === 'URGENT' ? 'rgba(231,76,60,0.1)' : 'rgba(243,156,18,0.1)', 
                                color: session.followupPriority === 'URGENT' ? 'var(--color-danger)' : 'var(--color-warning)',
                                border: `1px solid ${session.followupPriority === 'URGENT' ? 'var(--color-danger)' : 'var(--color-warning)'}`,
                                whiteSpace: 'nowrap'
                              }}>
                                Follow-up: {session.followupPriority} {session.followupDate ? `(${session.followupDate})` : ''}
                              </span>
                            )}
                          </h4>
                          <span className="history-item-date">
                            {session.date} | {session.time}
                          </span>
                        </div>
                        <p className="history-item-description" style={{ color: 'var(--ion-color-medium)', fontSize: '0.85rem' }}>
                          Healer: {session.healerName}
                        </p>
                        <p className="history-item-description" style={{ marginTop: '0.25rem' }}>
                          <strong>Session Notes:</strong> {session.notes}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p style={{ margin: 0, color: 'var(--ion-color-medium)', fontSize: '0.95rem' }}>
                      No prior healing sessions recorded for this patient.
                    </p>
                  )}
                </div>
              )}

              {activeTab === 'documents' && (
                <div className="info-section-card">
                  <div className="info-section-title-row">
                    <IonIcon icon={fileTrayFullOutline} />
                    <span>Uploaded Documents</span>
                  </div>

                  {documentsList.length > 0 ? (
                    documentsList.map((doc) => (
                      <div key={doc.id} className="doc-item-card">
                        <div className="doc-info-left">
                          <div className="doc-icon-wrapper">
                            <IonIcon icon={documentOutline} />
                          </div>
                          <div>
                            <span className="doc-name">{doc.fileName}</span>
                            <span className="doc-type-badge">{doc.fileType}</span>
                          </div>
                        </div>
                        <span className="doc-date-right">{doc.date}</span>
                      </div>
                    ))
                  ) : (
                    <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--ion-color-medium)' }}>
                      <IonIcon icon={documentOutline} style={{ fontSize: '3rem', opacity: 0.3, marginBottom: '0.5rem' }} />
                      <p style={{ margin: 0, fontSize: '0.95rem' }}>
                        No medical reports or documents uploaded yet.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </>
          ) : null}

        </div>
      </IonContent>
    </IonPage>
  );
};

export default PatientsDetialsPages;
