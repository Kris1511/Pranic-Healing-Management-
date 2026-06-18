import React, { useState, useEffect } from 'react';
import {
  IonPage,
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonMenuButton,
  IonIcon,
  IonSpinner,
} from '@ionic/react';
import {
  personOutline,
  arrowBackOutline,
  mailOutline,
  phonePortraitOutline,
  businessOutline,
  ribbonOutline,
  leafOutline,
  checkmarkDoneOutline,
  peopleOutline,
  calendarOutline,
  timeOutline,
  cameraOutline,
  callOutline,
  alertCircleOutline,
} from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';
import AppCard from '../../components/common/AppCard';
import { getHealers, updateHealer } from '../../api/healer.api';
import { getPatients } from '../../api/patient.api';
import { getSessions } from '../../api/session.api';
import '../branch-admin/branch-admin.css';
import './Healers.css';

const ProfilePage: React.FC = () => {
  const history = useHistory();
  const { user, updateUser } = useAuthStore();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const userName = user?.name || 'Valued Healer';
  const userEmail = user?.email || 'healer@phms.com';
  const userPhone = user?.phoneNumber || '+91 98765 43210';
  
  const rawBranch = typeof user?.branch === 'object' && user?.branch !== null
    ? (user.branch as any).name
    : (user?.branch || 'Mumbai Main');
  const branchName = rawBranch.toLowerCase().includes('branch') ? rawBranch : `${rawBranch} Branch`;

  // States
  const [currentHealer, setCurrentHealer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activePatientsCount, setActivePatientsCount] = useState(0);
  const [healingStats, setHealingStats] = useState({
    cumulative: 0,
    thisMonth: 0,
    thisWeek: 0,
  });

  // Fetch healer statistics and properties on mount
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        const [healersRes, patientsRes, sessionsRes] = await Promise.all([
          getHealers({ email: userEmail }),
          getPatients(),
          getSessions(),
        ]);

        const apiHealers = Array.isArray(healersRes) ? healersRes : (healersRes.data || healersRes);
        const apiPatients = Array.isArray(patientsRes) ? patientsRes : (patientsRes.data || patientsRes);
        const apiSessions = Array.isArray(sessionsRes) ? sessionsRes : (sessionsRes.data || sessionsRes);

        let healer = apiHealers[0];
        
        // If not found in the DB, construct fallback structure
        if (!healer) {
          healer = {
            id: user?.id || 'healer-1',
            name: userName,
            email: userEmail,
            phone: userPhone,
            gender: 'Male',
            dob: '1985-05-15',
            address: '123 Spiritual Way, Mumbai',
            certLevel: 'Associate Certified Pranic Healer (ACPH)',
            specialization: 'Basic Pranic Healing, Advanced Pranic Healing, Pranic Psychotherapy, Crystal Healing',
            experience: 8,
            status: 'ACTIVE',
            branch: rawBranch,
            availabilityStatus: 'Available',
            emergencyContact: '+91 98765 43211',
            alternatePhone: '+91 98765 43212',
            certName: 'ACPH Certificate',
            certIssueDate: '2024-01-15',
            certNumber: 'ACPH-2024-8902',
            profilePhoto: user?.avatar || ''
          };
        }

        // Parse specialization comma-separated string to array
        const specs = healer.specialization
          ? healer.specialization.split(',').map((s: string) => s.trim())
          : ['Basic Pranic Healing', 'Advanced Pranic Healing', 'Pranic Psychotherapy', 'Crystal Healing'];

        setCurrentHealer({
          ...healer,
          specializationArray: specs,
          certificationLevel: healer.certLevel || healer.certificationLevel || 'Associate Certified Pranic Healer (ACPH)',
          certNumber: healer.healerId || healer.certNumber || 'ACPH-2024-8902',
          phone: healer.mobile || healer.phone || userPhone,
          availabilityStatus: healer.status === 'Active' || healer.status === 'ACTIVE' ? 'Available' : healer.status
        });

        // Load active patient count
        if (Array.isArray(apiPatients)) {
          setActivePatientsCount(apiPatients.length);
        }

        // Calculate healing session statistics
        if (Array.isArray(apiSessions)) {
          const completedSessions = apiSessions.filter(s => s.status === 'completed');
          const now = new Date();
          const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
          const startOfWeek = new Date();
          startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday as start of week

          const thisMonthSessions = completedSessions.filter(s => s.sessionDate && new Date(s.sessionDate) >= startOfMonth);
          const thisWeekSessions = completedSessions.filter(s => s.sessionDate && new Date(s.sessionDate) >= startOfWeek);

          setHealingStats({
            cumulative: completedSessions.length,
            thisMonth: thisMonthSessions.length,
            thisWeek: thisWeekSessions.length
          });
        }
      } catch (err) {
        console.error('Failed to load profile details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [userEmail, userName, userPhone, rawBranch]);

  // Save changes to database and local state
  const saveHealerUpdates = async (updatedFields: any) => {
    if (!currentHealer?.id) return;
    try {
      const dbFields = { ...updatedFields };
      // Map availability status to status if updated
      if (updatedFields.availabilityStatus) {
        dbFields.status = updatedFields.availabilityStatus;
      }
      
      await updateHealer(currentHealer.id, dbFields);
      setCurrentHealer((prev: any) => ({ ...prev, ...updatedFields }));

      // Update global auth store state
      if (updatedFields.profilePhoto !== undefined) {
        updateUser({ avatar: updatedFields.profilePhoto });
      }
      if (updatedFields.name !== undefined) {
        updateUser({ name: updatedFields.name });
      }
      if (updatedFields.phone !== undefined) {
        updateUser({ phoneNumber: updatedFields.phone });
      }
    } catch (err) {
      console.error('Failed to save healer updates:', err);
    }
  };

  // Base64 converter for local profile image uploading
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const base64 = uploadEvent.target?.result as string;
        saveHealerUpdates({ profilePhoto: base64 });
      };
      reader.readAsDataURL(file);
    }
  };

  const userInitials = (currentHealer?.name || userName)
    ? `${(currentHealer?.name || userName)[0] || 'H'}${(currentHealer?.name || userName).split(' ')?.[1]?.[0] || 'P'}`.toUpperCase()
    : 'HP';

  return (
    <IonPage className="sa-page">
      <IonHeader className="ion-no-border">
        <IonToolbar className="sa-page__toolbar">
          <IonButtons slot="start">
            <button className="healer-back-btn" onClick={() => history.push('/healer/dashboard')}>
              <IonIcon icon={arrowBackOutline} />
            </button>
          </IonButtons>
          <IonTitle className="sa-page__toolbar-title">My Profile</IonTitle>
          <IonButtons slot="end">
            <IonMenuButton />
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent className="sa-page__content">
        <div className="healer-container">
          
          <div className="healer-profile-grid">
            
            {/* Left Column */}
            <div className="healer-profile-left-col">
              
              {/* Profile Photo & Availability Card */}
              <AppCard padding="large" shadow>
                <div className="healer-profile-photo-section">
                  <div className="healer-avatar-wrapper">
                    {currentHealer?.profilePhoto ? (
                      <img src={currentHealer.profilePhoto} alt="Healer Profile" className="healer-avatar-img" />
                    ) : (
                      <div className="healer-avatar-initials">{userInitials}</div>
                    )}
                    <div className="healer-avatar-hover-overlay" onClick={() => fileInputRef.current?.click()}>
                      <IonIcon icon={cameraOutline} />
                      <span>Upload</span>
                    </div>
                  </div>
                  
                  <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    accept="image/*"
                    onChange={handlePhotoUpload}
                  />
                  
                  <button className="healer-photo-upload-btn" onClick={() => fileInputRef.current?.click()}>
                    Upload / Update Photo
                  </button>

                  <div style={{ textAlign: 'center', marginTop: '8px' }}>
                    <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#0f172a', margin: '0 0 4px 0' }}>
                      {currentHealer?.name || userName}
                    </h2>
                    <span className="healer-badge">Para Healer</span>
                  </div>

                  {/* Availability Status Selector */}
                  <div className="healer-availability-section">
                    <span className="healer-availability-label">Availability Status</span>
                    <div className="healer-status-pill-group">
                      <button
                        className={`healer-status-pill healer-status-pill--available ${
                          (currentHealer?.availabilityStatus || 'Available') === 'Available' ? 'active' : ''
                        }`}
                        onClick={() => saveHealerUpdates({ availabilityStatus: 'Available' })}
                      >
                        Available
                      </button>
                      <button
                        className={`healer-status-pill healer-status-pill--busy ${
                          (currentHealer?.availabilityStatus || 'Available') === 'Busy' ? 'active' : ''
                        }`}
                        onClick={() => saveHealerUpdates({ availabilityStatus: 'Busy' })}
                      >
                        Busy
                      </button>
                      <button
                        className={`healer-status-pill healer-status-pill--leave ${
                          (currentHealer?.availabilityStatus || 'Available') === 'On Leave' ? 'active' : ''
                        }`}
                        onClick={() => saveHealerUpdates({ availabilityStatus: 'On Leave' })}
                      >
                        On Leave
                      </button>
                    </div>
                  </div>
                </div>
              </AppCard>

              {/* Contact Information Card */}
              <AppCard padding="large" shadow>
                <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#1e293b', margin: '0 0 16px 0' }}>
                  Contact Information
                </h3>

                <div className="healer-profile-info-list" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div className="healer-profile-info-item" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <IonIcon icon={mailOutline} style={{ color: '#0f766e', fontSize: '18px' }} />
                    <div>
                      <span className="healer-credential-card__label" style={{ fontSize: '10px' }}>EMAIL ADDRESS</span>
                      <strong style={{ fontSize: '13px', color: '#1e293b' }}>{currentHealer?.email || userEmail}</strong>
                    </div>
                  </div>

                  <div className="healer-profile-info-item" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <IonIcon icon={phonePortraitOutline} style={{ color: '#0f766e', fontSize: '18px' }} />
                    <div>
                      <span className="healer-credential-card__label" style={{ fontSize: '10px' }}>PRIMARY PHONE</span>
                      <strong style={{ fontSize: '13px', color: '#1e293b' }}>{currentHealer?.phone || userPhone}</strong>
                    </div>
                  </div>

                  {/* <div className="healer-profile-info-item" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <IonIcon icon={callOutline} style={{ color: '#0f766e', fontSize: '18px' }} />
                    <div>
                      <span className="healer-credential-card__label" style={{ fontSize: '10px' }}>ALTERNATE PHONE</span>
                      <strong style={{ fontSize: '13px', color: '#1e293b' }}>{currentHealer?.alternatePhone || '+91 98765 43212'}</strong>
                    </div>
                  </div> */}

                  <div className="healer-profile-info-item" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <IonIcon icon={alertCircleOutline} style={{ color: '#ef4444', fontSize: '18px' }} />
                    <div>
                      <span className="healer-credential-card__label" style={{ fontSize: '10px', color: '#ef4444' }}>EMERGENCY CONTACT</span>
                      <strong style={{ fontSize: '13px', color: '#1e293b' }}>{currentHealer?.emergencyContact || '+91 98765 43211'}</strong>
                    </div>
                  </div>

                  <div className="healer-profile-info-item" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <IonIcon icon={businessOutline} style={{ color: '#0f766e', fontSize: '18px' }} />
                    <div>
                      <span className="healer-credential-card__label" style={{ fontSize: '10px' }}>ASSIGNED BRANCH</span>
                      <strong style={{ fontSize: '13px', color: '#1e293b' }}>{branchName}</strong>
                    </div>
                  </div>
                </div>
              </AppCard>

              {/* Recent Activity Card */}
              {/* <AppCard padding="large" shadow>
                <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#1e293b', margin: '0 0 16px 0' }}>
                  Recent Activity
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', paddingBottom: '8px', borderBottom: '1px dashed #f1f5f9' }}>
                    <span style={{ color: '#64748b' }}>Last Session Conducted</span>
                    <strong style={{ color: '#334155' }}>{lastSessionText}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                    <span style={{ color: '#64748b' }}>Last Login</span>
                    <strong style={{ color: '#334155' }}>{lastLoginText}</strong>
                  </div>
                </div>
              </AppCard> */}

            </div>

             {/* Right Column */}
            <div className="healer-profile-right-col">
              
              {/* Top Highlight Metrics Row (Top 3 Recommendations) */}
              <div className="healer-stats-grid" style={{ marginBottom: '0', gridTemplateColumns: 'repeat(3, 1fr)' }}>
                {/* Professional Experience */}
                <div className="healer-stat-card">
                  <div className="healer-stat-card__icon-wrap healer-stat-card__icon-wrap--purple">
                    <IonIcon icon={calendarOutline} />
                  </div>
                  <div className="healer-stat-card__info">
                    <span className="healer-stat-card__label">Experience</span>
                    <strong className="healer-stat-card__value" style={{ fontSize: '20px' }}>{currentHealer?.experience || 8} Years</strong>
                  </div>
                </div>

                {/* Active Patient Count */}
                <div className="healer-stat-card">
                  <div className="healer-stat-card__icon-wrap healer-stat-card__icon-wrap--teal">
                    <IonIcon icon={peopleOutline} />
                  </div>
                  <div className="healer-stat-card__info">
                    <span className="healer-stat-card__label">Active Patients</span>
                    <strong className="healer-stat-card__value" style={{ fontSize: '20px' }}>{loading ? '...' : activePatientsCount} patients</strong>
                  </div>
                </div>

                {/* Healing Count This Month */}
                <div className="healer-stat-card">
                  <div className="healer-stat-card__icon-wrap healer-stat-card__icon-wrap--blue">
                    <IonIcon icon={timeOutline} />
                  </div>
                  <div className="healer-stat-card__info">
                    <span className="healer-stat-card__label">This Month Healing</span>
                    <strong className="healer-stat-card__value" style={{ fontSize: '20px' }}>{loading ? '...' : healingStats.thisMonth} sessions</strong>
                  </div>
                </div>
              </div>

              {/* Complete Healing Statistics Card */}
              <AppCard padding="large" shadow>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#1e293b', margin: '0 0 16px 0' }}>
                  Healing Statistics & Performance
                </h3>
                
                <div className="healer-stats-subdeck">
                  <div className="healer-substat-card">
                    <div className="healer-substat-value">{loading ? '...' : healingStats.cumulative}</div>
                    <div className="healer-substat-label">Total Healings</div>
                  </div>
                  <div className="healer-substat-card">
                    <div className="healer-substat-value">{loading ? '...' : healingStats.thisMonth}</div>
                    <div className="healer-substat-label">This Month</div>
                  </div>
                  <div className="healer-substat-card">
                    <div className="healer-substat-value">{loading ? '...' : healingStats.thisWeek}</div>
                    <div className="healer-substat-label">This Week</div>
                  </div>
                </div>
              </AppCard>

              {/* Certifications Section Card */}
              <AppCard padding="large" shadow>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#1e293b', margin: '0 0 16px 0' }}>
                  Professional Credentials & Certifications
                </h3>

                <div className="healer-cert-display">
                  <div className="healer-cert-title-row">
                    <div className="healer-cert-icon-container">
                      <IonIcon icon={ribbonOutline} />
                    </div>
                    <div>
                      <h4 className="healer-cert-name">{currentHealer?.certificationLevel || 'Associate Certified Pranic Healer (ACPH)'}</h4>
                      <span style={{ fontSize: '12px', color: '#6b7280' }}>Verified Certification</span>
                    </div>
                  </div>
                  
                  <div className="healer-cert-details-grid">
                    <div>
                      <span className="healer-cert-detail-label">Certificate</span>
                      <div className="healer-cert-detail-value">{currentHealer?.certName || 'ACPH Certificate'}</div>
                    </div>
                    <div>
                      <span className="healer-cert-detail-label">Issue Date</span>
                      <div className="healer-cert-detail-value">{currentHealer?.certIssueDate || 'Jan 15, 2024'}</div>
                    </div>
                    <div style={{ gridColumn: 'span 2' }}>
                      <span className="healer-cert-detail-label">Certification Number</span>
                      <div className="healer-cert-detail-value" style={{ fontFamily: 'monospace', fontSize: '14px', color: '#6b21a8' }}>
                        {currentHealer?.certNumber || 'ACPH-2024-8902'}
                      </div>
                    </div>
                  </div>
                </div>
              </AppCard>

              {/* Assigned Treatment Types / Specializations tags */}
              <AppCard padding="large" shadow>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#1e293b', margin: '0 0 8px 0' }}>
                  Assigned Treatment Types & Expertise
                </h3>
                <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 16px 0' }}>
                  These treatment modalities show the healer's verified areas of therapeutic expertise.
                </p>
                <div className="healer-tags-container">
                  {(currentHealer?.specializationArray || ['Basic Pranic Healing', 'Advanced Pranic Healing', 'Pranic Psychotherapy', 'Crystal Healing']).map((spec: string, idx: number) => {
                    const themes = ['teal', 'purple', 'blue', 'pink'];
                    const theme = themes[idx % themes.length];
                    return (
                      <span key={spec} className={`healer-chip-tag healer-chip-tag--${theme}`}>
                        <IonIcon icon={leafOutline} style={{ fontSize: '14px' }} />
                        {spec}
                      </span>
                    );
                  })}
                </div>
              </AppCard>

            </div>

          </div>

        </div>

      </IonContent>
    </IonPage>
  );
};

export default ProfilePage;