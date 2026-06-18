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
  IonButton,
} from '@ionic/react';
import {
  personOutline,
  mailOutline,
  callOutline,
  locationOutline,
  businessOutline,
  calendarOutline,
  shieldCheckmarkOutline,
  createOutline,
  lockClosedOutline,
  keyOutline,
  peopleOutline,
  medkitOutline,
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

  useEffect(() => {
    const fetchAdminDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await getBranchAdminById(id);
        if (response.success && response.data) {
          setAdmin(response.data);
        } else {
          setError('Failed to fetch administrator details');
        }
      } catch (err: any) {
        console.error('Error fetching admin details:', err);
        setError(err?.response?.data?.message || 'Error loading administrator details');
      } finally {
        setLoading(false);
      }
    };

    fetchAdminDetails();
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

  return (
    <IonPage className="sa-page">
      <IonHeader className="ion-no-border">
        <IonToolbar className="sa-page__toolbar">
          <IonButtons slot="start">
            <IonBackButton defaultHref={ROUTES.SUPER_ADMIN.BRANCH_ADMINS} text="" />
          </IonButtons>
          <IonTitle className="sa-page__toolbar-title">Administrator Profile</IonTitle>
          <IonButtons slot="end" style={{ display: 'flex', alignItems: 'center' }}>
            {/* <button 
              className="sa-btn sa-btn--primary sa-btn--sm" 
              style={{ marginRight: '8px' }}
              onClick={() => history.push(ROUTES.SUPER_ADMIN.EDIT_BRANCH_ADMIN.replace(':id', id))}
            >
              <IonIcon icon={createOutline} />
              <span className="sa-hide-on-mobile" style={{ marginLeft: '4px' }}>Edit Profile</span>
              <span className="sa-show-on-mobile" style={{ marginLeft: '4px' }}>Edit</span>
            </button> */}
          </IonButtons>
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

          {/* Performance Stats */}
          <div className="sa-stats sa-stats--2" style={{ marginBottom: '24px' }}>
            <div className="sa-stat-card">
              <div>
                <div className="sa-stat-card__label">Healers Assigned</div>
                <div className="sa-stat-card__value">{admin.healersCount || 0}</div>
                <div className="sa-stat-card__detail">Active practitioners in branch</div>
              </div>
              <div className="sa-stat-card__icon" style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981' }}>
                <IonIcon icon={medkitOutline} />
              </div>
            </div>
            <div className="sa-stat-card">
              <div>
                <div className="sa-stat-card__label">Patients Handled</div>
                <div className="sa-stat-card__value">{admin.patientsCount || 0}</div>
                <div className="sa-stat-card__detail">Total assignments across branch</div>
              </div>
              <div className="sa-stat-card__icon" style={{ background: 'rgba(59,130,246,0.1)', color: '#3b82f6' }}>
                <IonIcon icon={peopleOutline} />
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
              </div>
            </div>

            {/* Location */}
            <div className="sa-section">
              <SectionHeader icon={locationOutline} title="Branch & Address" />
              <div className="sa-details-grid">
                <InfoItem label="Assigned Branch" value={admin.branch?.name || 'Unassigned'} icon={businessOutline} />
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
