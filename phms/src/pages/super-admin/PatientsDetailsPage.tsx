import React, { useState, useEffect } from 'react';
import {
  IonPage,
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonIcon,
  IonBackButton,
} from '@ionic/react';
import {
  personOutline,
  mailOutline,
  callOutline,
  locationOutline,
  businessOutline,
  calendarOutline,
  shieldCheckmarkOutline,
  peopleOutline,
  medkitOutline,
  documentTextOutline,
  alertCircleOutline,
  timeOutline,
  waterOutline,
  lockClosedOutline,
  star,
  starOutline,
  chatbubblesOutline,
} from 'ionicons/icons';
import { useParams, useHistory } from 'react-router-dom';
import { ROUTES } from '../../constants/routes.constant';
import { getPatientById } from '../../api/patient.api';
import { getFeedbacks } from '../../api/feedback.api';
import './super-admin.css';

const PatientsDetailsPage: React.FC = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const history = useHistory();
  const [patient, setPatient] = useState<any>(null);
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPatientDetails = async (isFirst = false) => {
    if (isFirst) {
      setLoading(true);
    }
    try {
      const response = await getPatientById(patientId);
      const p = response.data || response;
      if (p) {
        setPatient(p);
        setError(null);
      } else {
        if (isFirst) setError('Failed to fetch patient details');
      }

      try {
        const feedbackResponse = await getFeedbacks({ patientId });
        if (feedbackResponse && feedbackResponse.data) {
          setFeedbacks(feedbackResponse.data);
        }
      } catch (fbErr) {
        console.error('Error fetching patient feedbacks:', fbErr);
      }
    } catch (err: any) {
      console.error('Error fetching patient details:', err);
      if (isFirst) {
        setError(err?.response?.data?.message || 'Error loading patient details');
      }
    } finally {
      if (isFirst) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchPatientDetails(true);

    // removed setInterval

    return () => {
      // removed clearInterval
    };
  }, [patientId]);

  if (loading) {
    return (
      <IonPage>
        <IonContent style={{ '--background': '#f8fafc' }}>
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--ion-color-medium)' }}>
            <h3>Loading Patient details...</h3>
            <p style={{ color: '#64748b', fontSize: '14px' }}>Retrieving live database records.</p>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  if (error || !patient) {
    return (
      <IonPage>
        <IonContent style={{ '--background': '#f8fafc' }}>
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-danger)' }}>
            <IonIcon icon={alertCircleOutline} style={{ fontSize: '48px', color: '#ef4444', marginBottom: '16px' }} />
            <h3>Error</h3>
            <p>{error || 'Patient record not found.'}</p>
            <button className="sa-btn sa-btn--outline" onClick={() => history.push(ROUTES.SUPER_ADMIN.PATIENTS)}>
              Back to Patient Directory
            </button>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  const getFileDownloadUrl = (path: string | null) => {
    if (!path) return '#';
    const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
    const serverOrigin = apiBase.replace('/api', '');
    return `${serverOrigin}/${path}`;
  };

  return (
    <IonPage className="sa-page">
      <IonHeader className="ion-no-border">
        <IonToolbar className="sa-page__toolbar">
          <IonButtons slot="start">
            <IonBackButton defaultHref={ROUTES.SUPER_ADMIN.PATIENTS} text="" />
          </IonButtons>
          <IonTitle className="sa-page__toolbar-title">Patient details</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="sa-page__content" style={{ '--background': '#f8fafc' }}>
        <div className="sa-page__body" style={{ margin: '0 auto', padding: '24px' }}>
          
          {/* Main Profile Header */}
          <div className="sa-profile-header" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '28px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
            <div className="sa-table__avatar sa-table__avatar--patient" style={{ width: '90px', height: '90px', fontSize: '36px', background: '#0D5C46', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', fontWeight: 700 }}>
              {(patient.name || '').split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
            </div>
            <div className="sa-profile-header__content">
              <h1 className="sa-profile-header__title" style={{ fontSize: '24px', fontWeight: 800, color: '#1e293b', margin: 0 }}>{patient.name}</h1>
              <p className="sa-profile-header__subtitle" style={{ fontSize: '14px', color: '#64748b', margin: '4px 0 0 0' }}>Patient ID: #{patient.patientId || patient.id} • {patient.branch?.name || 'Unassigned Branch'}</p>
              <div className="sa-profile-header__badges" style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                <span className={`sa-badge sa-badge--${(patient.status || 'active').toLowerCase() === 'active' ? 'active' : 'inactive'}`}>
                  {patient.status}
                </span>
                <span className="sa-badge" style={{ background: '#f1f5f9', color: '#64748b' }}>
                  Registered {patient.createdAt ? new Date(patient.createdAt).toLocaleDateString() : 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* Detailed Information Sections */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            
            {/* Section 1: Patient Identity */}
            <div className="sa-section">
              <SectionHeader icon={personOutline} title="Patient Identity" />
              <div className="sa-details-grid">
                <InfoItem label="Full Name" value={patient.name || '—'} icon={personOutline} />
                <InfoItem label="Gender" value={patient.gender || '—'} icon={personOutline} />
                <InfoItem label="Date of Birth" value={patient.dob ? patient.dob.split('T')[0] : '—'} icon={calendarOutline} />
                <InfoItem label="Age (Auto-calculated)" value={patient.age !== undefined && patient.age !== null ? `${patient.age} Years` : '—'} icon={timeOutline} />
                <InfoItem label="Blood Group" value={patient.bloodGroup || '—'} icon={waterOutline} />
                <InfoItem label="Occupation" value={patient.occupation || '—'} icon={businessOutline} />
              </div>
            </div>

            {/* Section 2: Contact Information */}
            <div className="sa-section">
              <SectionHeader icon={callOutline} title="Contact Information" />
              <div className="sa-details-grid">
                <InfoItem label="Phone Number" value={patient.phone || '—'} icon={callOutline} />
                <InfoItem label="Emergency Contact Details" value={patient.emergencyContact || '—'} icon={alertCircleOutline} />
                <InfoItem label="Email Address" value={patient.email || '—'} icon={mailOutline} />
                <InfoItem label="Residential Address" value={patient.address || '—'} icon={locationOutline} />
              </div>
            </div>

            {/* Section 3: Medical History */}
            <div className="sa-section">
              <SectionHeader icon={medkitOutline} title="Medical History" />
              <div className="sa-details-grid">
                <InfoItem label="Conditions, Treatments & Allergies" value={patient.medicalHistory || 'No medical conditions reported.'} icon={medkitOutline} />
                <InfoItem label="Assigned Treatment Type" value={patient.treatmentType || '—'} icon={shieldCheckmarkOutline} />
              </div>
            </div>

            {/* Section 4: Clinical Assignment */}
            <div className="sa-section">
              <SectionHeader icon={shieldCheckmarkOutline} title="Clinical Assignment" />
              <div className="sa-details-grid">
                <InfoItem label="Responsible Healer" value={patient.healer?.name || 'Unassigned'} icon={personOutline} />
                <InfoItem label="Assigned Branch" value={patient.branch?.name || 'Unassigned'} icon={businessOutline} />
              </div>
            </div>

            {/* Section 5: Login & Status Details */}
            <div className="sa-section">
              <SectionHeader icon={lockClosedOutline} title="Account & Login Details" />
              <div className="sa-details-grid">
                <InfoItem label="Login Email" value={patient.email || '—'} icon={mailOutline} />
                <InfoItem label="Password Details" value={patient.password ? 'PHMS Generated Security Key' : '—'} icon={lockClosedOutline} />
                <InfoItem label="Account Status" value={patient.status ? patient.status.charAt(0).toUpperCase() + patient.status.slice(1).toLowerCase() : 'Active'} icon={shieldCheckmarkOutline} />
              </div>
            </div>

            {/* Section 6: Uploaded Documents */}
            <div className="sa-section">
              <SectionHeader icon={documentTextOutline} title="Uploaded Documents" />
              <div className="sa-details-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
                {[
                  { label: 'Medical Reports', path: patient.medicalReport },
                  { label: 'Lab Results', path: patient.labReport },
                  { label: 'Prescriptions', path: patient.prescription },
                  { label: 'ID Proofs', path: patient.idProof },
                ].map((doc) => {
                  const fileName = doc.path ? doc.path.split('/').pop() : null;
                  return (
                    <div key={doc.label} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', background: '#ffffff', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                      <div style={{ background: '#0D5C46', padding: '8px', borderRadius: '8px', color: '#ffffff', display: 'flex', alignItems: 'center' }}>
                        <IonIcon icon={documentTextOutline} style={{ fontSize: '18px' }} />
                      </div>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{doc.label}</div>
                        {doc.path ? (
                          <a 
                            href={getFileDownloadUrl(doc.path)} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            style={{ fontSize: '13px', color: '#0D5C46', fontWeight: 700, marginTop: '4px', display: 'block', textDecoration: 'underline', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                          >
                            {fileName}
                          </a>
                        ) : (
                          <div style={{ fontSize: '13px', color: '#94a3b8', fontStyle: 'italic', marginTop: '4px' }}>Not Uploaded</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Section 7: Patient Feedbacks */}
            <div className="sa-section">
              <SectionHeader icon={chatbubblesOutline} title="Patient Feedback & Reviews" />
              {feedbacks.length === 0 ? (
                <div style={{ color: '#64748b', fontSize: '14px', fontStyle: 'italic', padding: '16px', background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  No feedback provided by this patient yet.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {feedbacks.map((fb: any, index: number) => (
                    <div key={index} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>
                            Session #{fb.sessionId}
                          </div>
                          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                            {new Date(fb.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '2px' }}>
                          {[1, 2, 3, 4, 5].map((s) => (
                            <IonIcon 
                              key={s} 
                              icon={s <= fb.rating ? star : starOutline} 
                              style={{ color: s <= fb.rating ? '#f59e0b' : '#cbd5e1', fontSize: '16px' }}
                            />
                          ))}
                        </div>
                      </div>
                      {fb.comment && (
                        <div style={{ fontSize: '13px', color: '#334155', marginTop: '8px', lineHeight: '1.5', padding: '12px', background: '#f8fafc', borderRadius: '8px' }}>
                          "{fb.comment}"
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Back Button Footer Action */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px', borderTop: '1px solid #e2e8f0', paddingTop: '24px' }}>
              <button 
                className="sa-btn sa-btn--primary" 
                style={{ minWidth: '150px' }}
                onClick={() => history.push(ROUTES.SUPER_ADMIN.PATIENTS)}
              >
                Back to Patient Directory
              </button>
            </div>

          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

const SectionHeader: React.FC<{ icon: string, title: string }> = ({ icon, title }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
    <IonIcon icon={icon} style={{ color: '#0D5C46', fontSize: '20px' }} />
    <h2 style={{ fontSize: '17px', fontWeight: 600, margin: 0, color: '#1e293b' }}>{title}</h2>
  </div>
);

const InfoItem: React.FC<{ label: string, value: any, icon: string }> = ({ label, value, icon }) => (
  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
    <div style={{ background: '#ffffff', padding: '8px', borderRadius: '8px', color: '#64748b', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center' }}>
      <IonIcon icon={icon} style={{ fontSize: '16px' }} />
    </div>
    <div style={{ minWidth: 0, flex: 1 }}>
      <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</div>
      <div style={{ fontSize: '14px', color: '#1e293b', fontWeight: 500, marginTop: '2px', wordBreak: 'break-word' }}>{value}</div>
    </div>
  </div>
);

export default PatientsDetailsPage;
