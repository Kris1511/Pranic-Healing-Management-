import React, { useState } from 'react';
import {
  IonPage,
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonBackButton,
  IonIcon,
  IonSpinner,
  useIonViewWillEnter,
  IonModal,
} from '@ionic/react';
import {
  homeOutline,
  locationOutline,
  callOutline,
  calendarOutline,
  peopleOutline,
  barChartOutline,
  flashOutline,
  informationCircleOutline,
  closeCircleOutline,
  checkmarkCircleOutline,
} from 'ionicons/icons';
import { useParams, useHistory } from 'react-router-dom';
import { getBranchById, updateBranch } from '../../api/branch.api';
import { getPatients } from '../../api/patient.api';
import { getHealers } from '../../api/healer.api';
import { getSessions } from '../../api/session.api';
import { getSuperAdminRevenueFinance } from '../../api/finance.api';
import './super-admin.css';

const BranchDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const history = useHistory();

  const [branchData, setBranchData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activePatientsCount, setActivePatientsCount] = useState<number | string>('...');
  const [activeStaffCount, setActiveStaffCount] = useState<number | string>('...');
  const [totalSessionsCount, setTotalSessionsCount] = useState<number | string>('...');
  const [monthlyRevenue, setMonthlyRevenue] = useState<number | string>('...');
  const [staffList, setStaffList] = useState<any[]>([]);
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [patientsList, setPatientsList] = useState<any[]>([]);
  const [showPatientsModal, setShowPatientsModal] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const handleStatusToggle = async () => {
    if (!branchData || updatingStatus) return;
    setUpdatingStatus(true);
    try {
      const currentStatus = (branchData.status || 'active').toLowerCase();
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      
      const res = await updateBranch(id, { status: newStatus });
      setBranchData(res.data || res);
    } catch (error) {
      console.error("Failed to toggle branch status:", error);
      alert("Failed to update branch status. Please try again.");
    } finally {
      setUpdatingStatus(false);
    }
  };

  useIonViewWillEnter(() => {
    const fetchBranchData = async () => {
      setLoading(true);
      try {
        const [res, patientsRes, healersRes, sessionsRes, revenueRes] = await Promise.all([
          getBranchById(id),
          getPatients({ branchId: id, status: 'active' }),
          getHealers({ branchId: id }),
          getSessions({ branchId: id }),
          getSuperAdminRevenueFinance({ branchId: id, period: '1month' })
        ]);
        
        setBranchData(res.data || res);
        
        const patientsListData = patientsRes.data || patientsRes;
        if (Array.isArray(patientsListData)) {
          setPatientsList(patientsListData);
          setActivePatientsCount(patientsListData.length.toString());
        } else {
          setPatientsList([]);
          setActivePatientsCount('0');
        }

        const healersList = healersRes.data || healersRes;
        if (Array.isArray(healersList)) {
          setStaffList(healersList);
          // Count healers with 'active' or 'Active' status
          const activeHealers = healersList.filter((h: any) => h.status && h.status.toLowerCase() === 'active');
          setActiveStaffCount(activeHealers.length.toString());
        } else {
          setStaffList([]);
          setActiveStaffCount('0');
        }

        const sessionsListData = sessionsRes.data || sessionsRes;
        if (Array.isArray(sessionsListData)) {
          setTotalSessionsCount(sessionsListData.length.toString());
        } else {
          setTotalSessionsCount('0');
        }

        const revenueData = revenueRes.data || revenueRes;
        if (revenueData && revenueData.stats) {
          const formattedRevenue = (revenueData.stats.totalIncome || 0).toLocaleString('en-IN');
          setMonthlyRevenue(`₹${formattedRevenue}`);
        } else {
          setMonthlyRevenue('₹0');
        }
      } catch (error) {
        console.error("Failed to load branch details:", error);
      } finally {
        setLoading(false);
      }
    };
    if (id) {
      fetchBranchData();
    }
  });

  if (loading) {
    return (
      <IonPage className="sa-page">
        <IonHeader className="ion-no-border">
          <IonToolbar className="sa-page__toolbar">
            <IonButtons slot="start"><IonBackButton defaultHref="/super-admin/branches" /></IonButtons>
            <IonTitle className="sa-page__toolbar-title">Branch Overview</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent className="sa-page__content">
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '50px' }}>
            <IonSpinner name="crescent" />
          </div>
        </IonContent>
      </IonPage>
    );
  }

  if (!branchData) {
    return (
      <IonPage className="sa-page">
        <IonHeader className="ion-no-border">
          <IonToolbar className="sa-page__toolbar">
            <IonButtons slot="start"><IonBackButton defaultHref="/super-admin/branches" /></IonButtons>
            <IonTitle className="sa-page__toolbar-title">Branch Overview</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent className="sa-page__content">
          <div style={{ padding: '20px', textAlign: 'center' }}>Branch not found.</div>
        </IonContent>
      </IonPage>
    );
  }

  const estDate = branchData.createdAt ? new Date(branchData.createdAt).toLocaleDateString() : 'N/A';
  const adminName = branchData.admin || 'Unassigned';
  const description = branchData.details || `The ${branchData.name} is a premier healing branch specializing in advanced pranic protocols. Our mission is to provide a serene space for recovery and spiritual growth.`;
  
  const displayRegion = branchData.region || branchData.state || branchData.city || 'Unknown';
  const displayAddress = branchData.address || [branchData.addressLine1, branchData.addressLine2, branchData.city, branchData.state, branchData.pincode].filter(Boolean).join(', ') || 'N/A';

  const stats = [
    { label: 'Total Sessions', value: totalSessionsCount, icon: flashOutline, onClick: undefined },
    { label: 'Monthly Revenue', value: monthlyRevenue, icon: barChartOutline, onClick: () => history.push(`/super-admin/branches/details/${id}/revenue`) },
    { label: 'Staff Count', value: activeStaffCount, icon: peopleOutline, onClick: () => setShowStaffModal(true) },
    { label: 'Active Patients', value: activePatientsCount, icon: peopleOutline, onClick: () => setShowPatientsModal(true) }
  ];

  return (
    <IonPage className="sa-page">
      <IonHeader className="ion-no-border">
        <IonToolbar className="sa-page__toolbar">
          <IonButtons slot="start">
            <IonBackButton defaultHref="/super-admin/branches" />
          </IonButtons>
          <IonTitle className="sa-page__toolbar-title">Branch Overview</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="sa-page__content">
        <div className="sa-page__body">
          {/* Header Section */}
          <div className="sa-page__header">
            <div className="sa-page__header-row">
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div className="sa-branch-card__icon" style={{ width: '56px', height: '56px', fontSize: '24px' }}>
                  <IonIcon icon={homeOutline} />
                </div>
                <div>
                  <h1 className="sa-page__title">{branchData.name}</h1>
                  <p className="sa-page__subtitle">
                    <IonIcon icon={locationOutline} /> {branchData.region || 'Unknown Region'} • Established {estDate}
                  </p>
                </div>
              </div>
              <button 
                className={`sa-badge sa-badge--${branchData.status?.toLowerCase() === 'active' ? 'active' : 'inactive'}`} 
                onClick={handleStatusToggle}
                style={{ 
                  padding: '8px 20px', 
                  fontSize: '14px', 
                  cursor: 'pointer',
                  border: 'none',
                  outline: 'none',
                  borderRadius: '9999px',
                  fontWeight: 700,
                  transition: 'all 0.2s ease',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  color: '#ffffff',
                  backgroundColor: branchData.status?.toLowerCase() === 'active' ? '#10b981' : '#ef4444',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                }}
                disabled={updatingStatus}
              >
                {updatingStatus ? (
                  <IonSpinner name="dots" style={{ height: '14px', width: '24px', margin: 0, '--color': '#ffffff' }} />
                ) : (
                  <>
                    <IonIcon 
                      icon={branchData.status?.toLowerCase() === 'active' ? checkmarkCircleOutline : closeCircleOutline} 
                      style={{ fontSize: '18px', color: '#ffffff' }} 
                    />
                    <span>{branchData.status?.toLowerCase() === 'active' ? 'Active' : 'Inactive'}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="sa-stats sa-stats--4">
            {stats.map((stat, i) => (
              <div 
                className="sa-stat-card" 
                key={i}
                onClick={stat.onClick}
                style={{ cursor: stat.onClick ? 'pointer' : 'default' }}
              >
                <div>
                  <div className="sa-stat-card__label">{stat.label}</div>
                  <div className="sa-stat-card__value" style={{ fontSize: '24px' }}>{stat.value}</div>
                </div>
                <div className="sa-stat-card__icon">
                  <IonIcon icon={stat.icon} />
                </div>
              </div>
            ))}
          </div>

          <div className="sa-grid-2">
            <div>
              {/* Branch Overview */}
              <div className="sa-section">
                <div className="sa-section__header">
                  <h2 className="sa-section__title">
                    <IonIcon icon={informationCircleOutline} style={{ marginRight: '8px', color: 'var(--color-primary)' }} />
                    About this Clinic
                  </h2>
                </div>
                <p style={{ lineHeight: '1.6', color: 'var(--color-text-secondary)', fontSize: '15px' }}>
                  {description}
                </p>
              </div>

              {/* Location & Contact */}
              <div className="sa-section">
                <div className="sa-section__header">
                  <h2 className="sa-section__title">
                    <IonIcon icon={locationOutline} style={{ marginRight: '8px', color: 'var(--color-primary)' }} />
                    Location & Contact
                  </h2>
                </div>
                <div className="sa-settings__form">
                  <div className="sa-settings__form-group">
                    <label className="sa-settings__label">Physical Address</label>
                    <p style={{ marginBottom: '16px', fontSize: '14px', color: 'var(--color-text-primary)' }}>{displayAddress}</p>
                  </div>
                  <div className="sa-settings__form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div className="sa-settings__form-group">
                      <label className="sa-settings__label">Contact Number</label>
                      <div className="sa-branch-card__meta-item" style={{ fontSize: '14px', color: 'var(--color-text-primary)' }}>
                        <IonIcon icon={callOutline} /> {branchData.phone || 'N/A'}
                      </div>
                    </div>
                    <div className="sa-settings__form-group">
                      <label className="sa-settings__label">Geographic Region</label>
                      <div className="sa-branch-card__meta-item" style={{ fontSize: '14px', color: 'var(--color-text-primary)' }}>
                        <IonIcon icon={locationOutline} /> {displayRegion}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              {/* Administration */}
              <div className="sa-section">
                <div className="sa-section__header">
                  <h2 className="sa-section__title">Administration</h2>
                </div>
                <div className="sa-branch-card__admin" style={{ cursor: 'pointer' }} onClick={() => history.push('/super-admin/branch-admins/create')}>
                  <div>
                    <div className="sa-branch-card__admin-label">Primary Branch Admin</div>
                    <div className="sa-branch-card__admin-name" style={{ fontSize: '16px' }}>{adminName}</div>
                  </div>
                  <div className="sa-page__toolbar-avatar" style={{ background: 'var(--color-primary-dark)' }}>
                    {adminName.split(' ').map((n: string) => n[0]).join('').substring(0,2).toUpperCase()}
                  </div>
                </div>
                <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginTop: '12px' }}>
                  Admin is responsible for practitioner attendance, financial reconciliation, and branch-level patient reporting.
                </p>
              </div>

              {/* Maintenance & Compliance */}
              {/* <div className="sa-section">
                <h2 className="sa-section__title" style={{ fontSize: '16px', marginBottom: '16px' }}>Compliance Status</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '14px' }}>License Renewal</span>
                    <span className="sa-badge sa-badge--active">Current</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '14px' }}>Safety Inspection</span>
                    <span className="sa-badge sa-badge--active">Passed</span>
                  </div>
                </div>
              </div> */}
            </div>
          </div>
        </div>
      </IonContent>

      <IonModal isOpen={showStaffModal} onDidDismiss={() => setShowStaffModal(false)} className="sa-modal">
        <div className="sa-modal__content">
          <div className="sa-modal__header">
            <h2>Branch Staff ({staffList.length})</h2>
            <button className="sa-modal__close-btn" onClick={() => setShowStaffModal(false)}>×</button>
          </div>
          <div className="sa-modal__body">
            {staffList.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {staffList.map((staff, idx) => (
                  <div key={idx} style={{ padding: '12px', border: '1px solid var(--color-border)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '15px', color: 'var(--color-primary-dark)' }}>{staff.name}</div>
                      <div style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                        {staff.email || staff.mobile || staff.phone || 'No Contact Info'}
                      </div>
                    </div>
                    <span className={`sa-badge sa-badge--${staff.status?.toLowerCase() === 'active' ? 'active' : 'inactive'}`}>
                      {staff.status || 'Active'}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', margin: '20px 0' }}>No staff found for this branch.</p>
            )}
          </div>
        </div>
      </IonModal>

      <IonModal isOpen={showPatientsModal} onDidDismiss={() => setShowPatientsModal(false)} className="sa-modal">
        <div className="sa-modal__content">
          <div className="sa-modal__header">
            <h2>Active Patients ({patientsList.length})</h2>
            <button className="sa-modal__close-btn" onClick={() => setShowPatientsModal(false)}>×</button>
          </div>
          <div className="sa-modal__body">
            {patientsList.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {patientsList.map((patient, idx) => (
                  <div key={idx} style={{ padding: '12px', border: '1px solid var(--color-border)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '15px', color: 'var(--color-primary-dark)' }}>{patient.name}</div>
                      <div style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginTop: '4px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {/* <div><strong>ID:</strong> {patient.patientId || 'N/A'} &bull; <strong>Phone:</strong> {patient.phone || 'N/A'}</div> */}
                        <div><strong>Phone:</strong> {patient.phone || 'N/A'}</div>
                        <div><strong>Email:</strong> {patient.email || 'N/A'}</div>
                        <div><strong>Treatment:</strong> {patient.treatmentType || 'Not Specified'}</div>
                      </div>
                    </div>
                    <span className={`sa-badge sa-badge--${patient.status?.toLowerCase() === 'active' ? 'active' : 'inactive'}`}>
                      {patient.status || 'Active'}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', margin: '20px 0' }}>No active patients found for this branch.</p>
            )}
          </div>
        </div>
      </IonModal>
    </IonPage>
  );
};

export default BranchDetailsPage;
