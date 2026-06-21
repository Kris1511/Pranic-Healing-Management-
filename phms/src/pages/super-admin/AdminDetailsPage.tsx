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
} from 'ionicons/icons';
import { useParams, useHistory } from 'react-router-dom';
import { ROUTES } from '../../constants/routes.constant';
import { getBranchAdminById } from '../../api/branchAdmin.api';
import './super-admin.css';

const AdminDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const history = useHistory();
  const [admin, setAdmin] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'healers' | 'patients' | 'sessions' | 'finances'>('healers');

  useEffect(() => {
    let active = true;
    const fetchAdminDetails = async (isFirst = false) => {
      if (isFirst) {
        setLoading(true);
      }
      try {
        const response = await getBranchAdminById(id);
        if (active) {
          if (response.success && response.data) {
            setAdmin(response.data);
            setError(null);
          } else {
            if (isFirst) setError('Failed to fetch administrator details');
          }
        }
      } catch (err: any) {
        console.error('Error fetching admin details:', err);
        if (active && isFirst) {
          setError(err?.response?.data?.message || 'Error loading administrator details');
        }
      } finally {
        if (active && isFirst) {
          setLoading(false);
        }
      }
    };

    fetchAdminDetails(true);

    const interval = setInterval(() => {
      fetchAdminDetails(false);
    }, 3000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [id]);

  if (loading) {
    return (
      <IonPage>
        <IonContent>
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--ion-color-medium)' }}>Loading admin details...</div>
        </IonContent>
      </IonPage>
    );
  }

  if (error || !admin) {
    return (
      <IonPage>
        <IonContent>
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-danger)' }}>
            <h3>Error</h3>
            <p>{error || 'Admin details not found.'}</p>
            <button className="sa-btn sa-btn--outline" onClick={() => history.push(ROUTES.SUPER_ADMIN.BRANCH_ADMINS)}>
              Back to List
            </button>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  const branchAddress = admin.branch
    ? admin.branch.address || [
        admin.branch.addressLine1,
        admin.branch.addressLine2,
        admin.branch.city,
        admin.branch.district,
        admin.branch.state,
        admin.branch.pincode,
      ]
        .filter(Boolean)
        .join(', ')
    : 'N/A';

  return (
    <IonPage className="sa-page">
      <IonHeader className="ion-no-border">
        <IonToolbar className="sa-page__toolbar">
          <IonButtons slot="start">
            <IonBackButton defaultHref={ROUTES.SUPER_ADMIN.BRANCH_ADMINS} text="" />
          </IonButtons>
          <IonTitle className="sa-page__toolbar-title">Administrator Profile</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="sa-page__content">
        <div className="sa-page__body" style={{ margin: '0 auto' }}>
          
          {/* Main Profile Card */}
          <div className="sa-profile-header">
            <div className="sa-table__avatar sa-table__avatar--primary" style={{ width: '100px', height: '100px', fontSize: '40px' }}>
              {(admin.user?.name || admin.name || '').split(' ').map((n: string) => n[0]).join('')}
            </div>
            <div className="sa-profile-header__content">
              <h1 className="sa-profile-header__title">{admin.user?.name || admin.name}</h1>
              <p className="sa-profile-header__subtitle">{admin.branch?.name || 'Unassigned'} Administrator</p>
              <div className="sa-profile-header__badges">
                <span className={`sa-badge sa-badge--${(admin.user?.status || admin.status || 'active') === 'active' ? 'active' : 'inactive'}`}>
                  {admin.user?.status || admin.status}
                </span>
                <span className="sa-badge" style={{ background: '#f1f5f9', color: '#64748b' }}>
                  Joined {admin.user?.createdAt ? new Date(admin.user.createdAt).toLocaleDateString() : admin.createdAt ? new Date(admin.createdAt).toLocaleDateString() : 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* Performance Stats Summary Cards */}
          <div className="sa-stats sa-stats--4" style={{ marginBottom: '24px' }}>
            <div className="sa-stat-card">
              <div>
                <div className="sa-stat-card__label">Total Healers</div>
                <div className="sa-stat-card__value">{admin.healersCount || 0}</div>
                <div className="sa-stat-card__detail">Active practitioners</div>
              </div>
              <div className="sa-stat-card__icon" style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981' }}>
                <IonIcon icon={medkitOutline} />
              </div>
            </div>
            <div className="sa-stat-card">
              <div>
                <div className="sa-stat-card__label">Total Patients</div>
                <div className="sa-stat-card__value">{admin.patientsCount || 0}</div>
                <div className="sa-stat-card__detail">Registered patients</div>
              </div>
              <div className="sa-stat-card__icon" style={{ background: 'rgba(59,130,246,0.1)', color: '#3b82f6' }}>
                <IonIcon icon={peopleOutline} />
              </div>
            </div>
            <div className="sa-stat-card">
              <div>
                <div className="sa-stat-card__label">Total Sessions</div>
                <div className="sa-stat-card__value">{admin.sessionsCount || 0}</div>
                <div className="sa-stat-card__detail">Conducted sessions</div>
              </div>
              <div className="sa-stat-card__icon" style={{ background: 'rgba(245,158,11,0.1)', color: '#f59e0b' }}>
                <IonIcon icon={calendarOutline} />
              </div>
            </div>
            
          </div>

          {/* Detailed Information Sections */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Personal & Account */}
            <div className="sa-section">
              <SectionHeader icon={shieldCheckmarkOutline} title="Account & Identity" />
              <div className="sa-details-grid">
                <InfoItem label="Admin Name" value={admin.user?.name || admin.name || 'N/A'} icon={personOutline} />
                <InfoItem label="Email ID" value={admin.user?.email || admin.email || 'N/A'} icon={mailOutline} />
                <InfoItem label="Phone Number" value={admin.user?.phoneNumber || admin.phoneNumber || admin.phone || 'N/A'} icon={callOutline} />
                <InfoItem label="Date of Birth" value={admin.dob || 'N/A'} icon={calendarOutline} />
                <InfoItem label="Gender" value={admin.gender || 'N/A'} icon={personOutline} />
                <InfoItem 
                  label="Joined Date" 
                  value={admin.user?.createdAt ? new Date(admin.user.createdAt).toLocaleDateString() : admin.createdAt ? new Date(admin.createdAt).toLocaleDateString() : 'N/A'} 
                  icon={calendarOutline} 
                />
              </div>
            </div>

            {/* Location */}
            <div className="sa-section">
              <SectionHeader icon={locationOutline} title="Branch & Address" />
              <div className="sa-details-grid">
                <InfoItem label="Assigned Branch" value={admin.branch?.name || 'Unassigned'} icon={businessOutline} />
                <InfoItem label="Branch Address" value={branchAddress} icon={locationOutline} />
                <InfoItem label="Address Line 1" value={admin.addressLine1 || 'N/A'} icon={locationOutline} />
                <InfoItem label="Address Line 2" value={admin.addressLine2 || 'N/A'} icon={locationOutline} />
                <InfoItem label="City" value={admin.city || 'N/A'} icon={businessOutline} />
                <InfoItem label="District" value={admin.district || 'N/A'} icon={businessOutline} />
                <InfoItem label="State" value={admin.state || 'N/A'} icon={businessOutline} />
                <InfoItem label="Pincode" value={admin.pincode || 'N/A'} icon={locationOutline} />
                <InfoItem 
                  label="ID Proof" 
                  value={
                    admin.idProof ? (
                      <a 
                        href={`${(import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api').replace('/api', '')}/${admin.idProof}`} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        style={{ color: 'var(--color-primary)', textDecoration: 'underline', fontWeight: 600 }}
                      >
                        View ID Proof
                      </a>
                    ) : (
                      'Not Set'
                    )
                  } 
                  icon={shieldCheckmarkOutline} 
                />
              </div>
            </div>

            {/* Branch Operations Tabbed Lists */}
            {/* <div className="sa-section">
              <SectionHeader icon={businessOutline} title="Branch Operations & Data" />
              
              <div className="sa-filters" style={{ marginBottom: '20px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px', gap: '12px' }}>
                <button 
                  className={`sa-filter-tab ${activeTab === 'healers' ? 'sa-filter-tab--active' : ''}`}
                  onClick={() => setActiveTab('healers')}
                  style={{ borderRadius: '8px' }}
                >
                  Assigned Healers ({(admin.healersList || []).length})
                </button>
                <button 
                  className={`sa-filter-tab ${activeTab === 'patients' ? 'sa-filter-tab--active' : ''}`}
                  onClick={() => setActiveTab('patients')}
                  style={{ borderRadius: '8px' }}
                >
                  Registered Patients ({(admin.patientsList || []).length})
                </button>
                <button 
                  className={`sa-filter-tab ${activeTab === 'sessions' ? 'sa-filter-tab--active' : ''}`}
                  onClick={() => setActiveTab('sessions')}
                  style={{ borderRadius: '8px' }}
                >
                  Session History ({(admin.sessionsList || []).length})
                </button>
                <button 
                  className={`sa-filter-tab ${activeTab === 'finances' ? 'sa-filter-tab--active' : ''}`}
                  onClick={() => setActiveTab('finances')}
                  style={{ borderRadius: '8px' }}
                >
                  Finance Summary ({(admin.financesList || []).length})
                </button>
              </div>

              <div style={{ overflowX: 'auto' }}>
                {activeTab === 'healers' && (
                  <table className="sa-table">
                    <thead>
                      <tr>
                        <th>Healer ID</th>
                        <th>Name</th>
                        <th>Mobile</th>
                        <th>Email</th>
                        <th>Specialization</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(admin.healersList || []).length === 0 ? (
                        <tr>
                          <td colSpan={6} style={{ textAlign: 'center', color: '#94a3b8', padding: '30px 16px' }}>
                            No healers assigned to this branch.
                          </td>
                        </tr>
                      ) : (
                        (admin.healersList || []).map((healer: any) => (
                          <tr key={healer.id}>
                            <td style={{ fontWeight: 600, color: 'var(--color-primary-dark)' }}>{healer.healerId}</td>
                            <td style={{ fontWeight: 500 }}>{healer.name}</td>
                            <td>{healer.mobile || healer.phone || 'N/A'}</td>
                            <td>{healer.email || 'N/A'}</td>
                            <td>{healer.specialization || 'N/A'}</td>
                            <td>
                              <span className={`sa-badge sa-badge--${(healer.status || '').toLowerCase() === 'active' ? 'active' : 'inactive'}`}>
                                {healer.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                )}

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
                      {(admin.patientsList || []).length === 0 ? (
                        <tr>
                          <td colSpan={5} style={{ textAlign: 'center', color: '#94a3b8', padding: '30px 16px' }}>
                            No patients registered in this branch.
                          </td>
                        </tr>
                      ) : (
                        (admin.patientsList || []).map((patient: any) => (
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
                        <th>Healer</th>
                        <th>Treatment Type</th>
                        <th>Status</th>
                        <th>Payment Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(admin.sessionsList || []).length === 0 ? (
                        <tr>
                          <td colSpan={6} style={{ textAlign: 'center', color: '#94a3b8', padding: '30px 16px' }}>
                            No sessions recorded for this branch.
                          </td>
                        </tr>
                      ) : (
                        (admin.sessionsList || []).map((session: any) => (
                          <tr key={session.id}>
                            <td style={{ fontWeight: 500 }}>{session.sessionDate}</td>
                            <td>
                              <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontWeight: 600 }}>{session.patient?.name || 'Unknown Patient'}</span>
                                <span style={{ fontSize: '11px', color: '#94a3b8' }}>{session.patient?.patientId || ''}</span>
                              </div>
                            </td>
                            <td>
                              <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontWeight: 500 }}>{session.healer?.name || 'Unknown Healer'}</span>
                                <span style={{ fontSize: '11px', color: '#94a3b8' }}>{session.healer?.healerId || ''}</span>
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

                {activeTab === 'finances' && (
                  <table className="sa-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Type</th>
                        <th>Category</th>
                        <th>Amount</th>
                        <th>Description</th>
                        <th>Payment Mode</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(admin.financesList || []).length === 0 ? (
                        <tr>
                          <td colSpan={6} style={{ textAlign: 'center', color: '#94a3b8', padding: '30px 16px' }}>
                            No finance records found for this branch.
                          </td>
                        </tr>
                      ) : (
                        (admin.financesList || []).map((finance: any) => (
                          <tr key={finance.id}>
                            <td>{new Date(finance.date).toLocaleDateString()}</td>
                            <td>
                              <span className={`sa-badge sa-badge--${(finance.type || '').toLowerCase() === 'income' ? 'active' : 'inactive'}`}>
                                {finance.type}
                              </span>
                            </td>
                            <td style={{ fontWeight: 500 }}>{finance.category}</td>
                            <td style={{ fontWeight: 600, color: (finance.type || '').toLowerCase() === 'income' ? '#10b981' : '#ef4444' }}>
                              {(finance.type || '').toLowerCase() === 'income' ? '+' : '-'}₹{parseFloat(finance.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </td>
                            <td>{finance.description || 'N/A'}</td>
                            <td>{finance.paymentMode || 'N/A'}</td>
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

export default AdminDetailsPage;
