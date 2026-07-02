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
  cashOutline,
  starOutline,
} from 'ionicons/icons';
import { useParams, useHistory } from 'react-router-dom';
import { ROUTES } from '../../constants/routes.constant';
import { getHealerById } from '../../api/healer.api';
import './super-admin.css';

const HealerDetailsPage: React.FC = () => {
  const { healerId } = useParams<{ healerId: string }>();
  const history = useHistory();
  const [healer, setHealer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'patients' | 'sessions' | 'payments'>('patients');

  useEffect(() => {
    let active = true;
    const fetchHealerDetails = async (isFirst = false) => {
      if (isFirst) {
        setLoading(true);
      }
      try {
        const response = await getHealerById(healerId);
        if (active) {
          if (response.success && response.data) {
            setHealer(response.data);
            setError(null);
          } else {
            if (isFirst) setError('Failed to fetch practitioner details');
          }
        }
      } catch (err: any) {
        console.error('Error fetching healer details:', err);
        if (active && isFirst) {
          setError(err?.response?.data?.message || 'Error loading practitioner details');
        }
      } finally {
        if (active && isFirst) {
          setLoading(false);
        }
      }
    };

    fetchHealerDetails(true);

    // removed setInterval

    return () => {
      active = false;
      // removed clearInterval
    };
  }, [healerId]);

  if (loading) {
    return (
      <IonPage>
        <IonContent>
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--ion-color-medium)' }}>Loading practitioner details...</div>
        </IonContent>
      </IonPage>
    );
  }

  if (error || !healer) {
    return (
      <IonPage>
        <IonContent>
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-danger)' }}>
            <h3>Error</h3>
            <p>{error || 'Practitioner details not found.'}</p>
            <button className="sa-btn sa-btn--outline" onClick={() => history.push(ROUTES.SUPER_ADMIN.HEALERS)}>
              Back to List
            </button>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  const branchAddress = healer.branch
    ? healer.branch.address || [
        healer.branch.addressLine1,
        healer.branch.addressLine2,
        healer.branch.city,
        healer.branch.district,
        healer.branch.state,
        healer.branch.pincode,
      ]
        .filter(Boolean)
        .join(', ')
    : 'N/A';

  return (
    <IonPage className="sa-page">
      <IonHeader className="ion-no-border">
        <IonToolbar className="sa-page__toolbar">
          <IonButtons slot="start">
            <IonBackButton defaultHref={ROUTES.SUPER_ADMIN.HEALERS} text="" />
          </IonButtons>
          <IonTitle className="sa-page__toolbar-title">Practitioner Profile</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="sa-page__content">
        <div className="sa-page__body" style={{ margin: '0 auto' }}>
          
          {/* Main Profile Card */}
          <div className="sa-profile-header">
            <div className="sa-table__avatar sa-table__avatar--primary" style={{ width: '100px', height: '100px', fontSize: '40px' }}>
              {(healer.name || '').split(' ').map((n: string) => n[0]).join('')}
            </div>
            <div className="sa-profile-header__content">
              <h1 className="sa-profile-header__title">{healer.name}</h1>
              <p className="sa-profile-header__subtitle">{healer.specialization || healer.specialty || 'General'} Practitioner • {healer.branch?.name || 'Unassigned Branch'}</p>
              <div className="sa-profile-header__badges">
                <span className={`sa-badge sa-badge--${(healer.status || 'active').toLowerCase() === 'active' ? 'active' : 'inactive'}`}>
                  {healer.status}
                </span>
                <span className="sa-badge" style={{ background: '#f1f5f9', color: '#64748b' }}>
                  Joined {healer.createdAt ? new Date(healer.createdAt).toLocaleDateString() : 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* Performance Stats Summary Cards */}
          <div className="sa-stats sa-stats--4" style={{ marginBottom: '24px' }}>
            <div className="sa-stat-card">
              <div>
                <div className="sa-stat-card__label">Total Patients</div>
                <div className="sa-stat-card__value">{healer.patientsCount || 0}</div>
                <div className="sa-stat-card__detail">Assigned patients</div>
              </div>
              <div className="sa-stat-card__icon" style={{ background: 'rgba(59,130,246,0.1)', color: '#3b82f6' }}>
                <IonIcon icon={peopleOutline} />
              </div>
            </div>
            <div className="sa-stat-card">
              <div>
                <div className="sa-stat-card__label">Total Sessions</div>
                <div className="sa-stat-card__value">{healer.sessionsCount || 0}</div>
                <div className="sa-stat-card__detail">Sessions conducted</div>
              </div>
              <div className="sa-stat-card__icon" style={{ background: 'rgba(245,158,11,0.1)', color: '#f59e0b' }}>
                <IonIcon icon={calendarOutline} />
              </div>
            </div>
            <div className="sa-stat-card">
              <div>
                <div className="sa-stat-card__label">Experience</div>
                <div className="sa-stat-card__value">{healer.experience || 0} Yrs</div>
                <div className="sa-stat-card__detail">Years in practice</div>
              </div>
              <div className="sa-stat-card__icon" style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981' }}>
                <IonIcon icon={starOutline} />
              </div>
            </div>
            
          </div>

          {/* Detailed Information Sections */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Professional Background */}
            <div className="sa-section">
              <SectionHeader icon={shieldCheckmarkOutline} title="Professional Background" />
              <div className="sa-details-grid">
                <InfoItem label="Healer Name" value={healer.name || 'N/A'} icon={personOutline} />
                <InfoItem label="Specialization" value={healer.specialization || 'N/A'} icon={medkitOutline} />
                <InfoItem label="Experience (Years)" value={healer.experience !== undefined ? `${healer.experience} Years` : 'N/A'} icon={starOutline} />
                <InfoItem label="Certification Level" value={healer.certLevel || 'N/A'} icon={shieldCheckmarkOutline} />
                <InfoItem label="Languages" value={healer.languages || 'N/A'} icon={personOutline} />
                <InfoItem label="Email ID" value={healer.email || 'N/A'} icon={mailOutline} />
                <InfoItem label="Phone Number" value={healer.mobile || healer.phone || 'N/A'} icon={callOutline} />
              </div>
            </div>

            {/* Branch & Location */}
            <div className="sa-section">
              <SectionHeader icon={locationOutline} title="Branch & Location" />
              <div className="sa-details-grid">
                <InfoItem label="Assigned Branch" value={healer.branch?.name || 'Unassigned'} icon={businessOutline} />
                <InfoItem label="Branch Address" value={branchAddress} icon={locationOutline} />
                <InfoItem label="Date of Birth" value={healer.dob || 'N/A'} icon={calendarOutline} />
                <InfoItem label="Gender" value={healer.gender || 'N/A'} icon={personOutline} />
                <InfoItem label="Address" value={healer.address || 'N/A'} icon={locationOutline} />
                <InfoItem 
                  label="Verification Status" 
                  value={healer.verificationStatus || 'N/A'} 
                  icon={shieldCheckmarkOutline} 
                />
              </div>
            </div>

            {/* Practitioner Operations Tabbed Lists */}
            {/* <div className="sa-section">
              <SectionHeader icon={businessOutline} title="Practitioner Operations & Data" />
              
              <div className="sa-filters" style={{ marginBottom: '20px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px', gap: '12px' }}>
                <button 
                  className={`sa-filter-tab ${activeTab === 'patients' ? 'sa-filter-tab--active' : ''}`}
                  onClick={() => setActiveTab('patients')}
                  style={{ borderRadius: '8px' }}
                >
                  Assigned Patients ({(healer.patientsList || []).length})
                </button>
                <button 
                  className={`sa-filter-tab ${activeTab === 'sessions' ? 'sa-filter-tab--active' : ''}`}
                  onClick={() => setActiveTab('sessions')}
                  style={{ borderRadius: '8px' }}
                >
                  Session History ({(healer.sessionsList || []).length})
                </button>
                <button 
                  className={`sa-filter-tab ${activeTab === 'payments' ? 'sa-filter-tab--active' : ''}`}
                  onClick={() => setActiveTab('payments')}
                  style={{ borderRadius: '8px' }}
                >
                  Revenue Summary ({(healer.paymentsList || []).length})
                </button>
              </div>

              <div style={{ overflowX: 'auto' }}>
                {activeTab === 'patients' && (
                  <table className="sa-table">
                    <thead>
                      <tr>
                        <th>Patient ID</th>
                        <th>Name</th>
                        <th>Phone</th>
                        <th>Email</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(healer.patientsList || []).length === 0 ? (
                        <tr>
                          <td colSpan={5} style={{ textAlign: 'center', color: '#94a3b8', padding: '30px 16px' }}>
                            No patients assigned to this practitioner.
                          </td>
                        </tr>
                      ) : (
                        (healer.patientsList || []).map((patient: any) => (
                          <tr key={patient.id}>
                            <td style={{ fontWeight: 600, color: 'var(--color-primary-dark)' }}>{patient.patientId}</td>
                            <td style={{ fontWeight: 500 }}>{patient.name}</td>
                            <td>{patient.phone || 'N/A'}</td>
                            <td>{patient.email || 'N/A'}</td>
                            <td>
                              <span className={`sa-badge sa-badge--${(patient.status || '').toLowerCase() === 'active' ? 'active' : 'inactive'}`}>
                                {patient.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                )}

                {activeTab === 'sessions' && (
                  <table className="sa-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Patient</th>
                        <th>Treatment Type</th>
                        <th>Status</th>
                        <th>Payment Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(healer.sessionsList || []).length === 0 ? (
                        <tr>
                          <td colSpan={5} style={{ textAlign: 'center', color: '#94a3b8', padding: '30px 16px' }}>
                            No sessions recorded for this practitioner.
                          </td>
                        </tr>
                      ) : (
                        (healer.sessionsList || []).map((session: any) => (
                          <tr key={session.id}>
                            <td style={{ fontWeight: 500 }}>{session.sessionDate}</td>
                            <td>
                              <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontWeight: 600 }}>{session.patient?.name || 'Unknown Patient'}</span>
                                <span style={{ fontSize: '11px', color: '#94a3b8' }}>{session.patient?.patientId || ''}</span>
                              </div>
                            </td>
                            <td>{session.treatmentType || 'N/A'}</td>
                            <td>
                              <span className={`sa-badge sa-badge--${(session.status || '').toLowerCase() === 'completed' ? 'active' : 'inactive'}`}>
                                {session.status}
                              </span>
                            </td>
                            <td>
                              <span className={`sa-badge sa-badge--${(session.paymentStatus || '').toLowerCase() === 'paid' ? 'active' : 'inactive'}`}>
                                {session.paymentStatus}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                )}

                {activeTab === 'payments' && (
                  <table className="sa-table">
                    <thead>
                      <tr>
                        <th>Payment Date</th>
                        <th>Patient</th>
                        <th>Session Date</th>
                        <th>Amount</th>
                        <th>Payment Method</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(healer.paymentsList || []).length === 0 ? (
                        <tr>
                          <td colSpan={6} style={{ textAlign: 'center', color: '#94a3b8', padding: '30px 16px' }}>
                            No revenue records found for this practitioner.
                          </td>
                        </tr>
                      ) : (
                        (healer.paymentsList || []).map((payment: any) => (
                          <tr key={payment.id}>
                            <td>{new Date(payment.paymentDate).toLocaleDateString()}</td>
                            <td style={{ fontWeight: 500 }}>{payment.session?.patient?.name || 'N/A'}</td>
                            <td>{payment.session?.sessionDate || 'N/A'}</td>
                            <td style={{ fontWeight: 600, color: '#10b981' }}>
                              ₹{parseFloat(payment.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </td>
                            <td>{payment.paymentMethod || 'N/A'}</td>
                            <td>
                              <span className={`sa-badge sa-badge--${(payment.status || '').toLowerCase() === 'paid' ? 'active' : 'inactive'}`}>
                                {payment.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                )}
              </div>
            </div> */}

          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

const SectionHeader: React.FC<{ icon: string, title: string }> = ({ icon, title }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
    <IonIcon icon={icon} style={{ color: 'var(--color-primary)', fontSize: '20px' }} />
    <h2 style={{ fontSize: '17px', fontWeight: 600, margin: 0, color: '#1e293b' }}>{title}</h2>
  </div>
);

const InfoItem: React.FC<{ label: string, value: any, icon: string }> = ({ label, value, icon }) => (
  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
    <div style={{ background: '#f8fafc', padding: '8px', borderRadius: '8px', color: '#64748b' }}>
      <IonIcon icon={icon} style={{ fontSize: '16px', display: 'block' }} />
    </div>
    <div>
      <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</div>
      <div style={{ fontSize: '14px', color: '#1e293b', fontWeight: 500, marginTop: '2px' }}>{value}</div>
    </div>
  </div>
);

export default HealerDetailsPage;
