import React from 'react';
import {
  IonPage,
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonMenuButton,
  IonIcon,
} from '@ionic/react';
import {
  personOutline,
  arrowBackOutline,
  mailOutline,
  phonePortraitOutline,
  businessOutline,
  medkitOutline,
  heartOutline,
  shieldCheckmarkOutline,
  calendarOutline,
  callOutline,
  alertCircleOutline,
  cameraOutline,
} from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';
import AppCard from '../../components/common/AppCard';
import { getPatients } from '../../api/patient.api';
import '../branch-admin/branch-admin.css';
import '../healer/Healers.css';

import ProfileDropdown from '../../components/common/ProfileDropdown';

const ProfilePage: React.FC = () => {
  const history = useHistory();
  const { user, updateUser } = useAuthStore();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const userName = user?.name || 'Valued Patient';
  const userEmail = user?.email || 'patient@phms.com';
  const userPhone = user?.phoneNumber || '+91 98765 43210';

  const rawBranch = typeof user?.branch === 'object' && user?.branch !== null
    ? (user.branch as any).name
    : (user?.branch || 'Mumbai Main');
  const branchName = rawBranch.toLowerCase().includes('branch') ? rawBranch : `${rawBranch} Branch`;

  // Default patient values for fallback
  const defaultPatient = {
    id: user?.id || 'pat-1',
    name: userName,
    email: userEmail,
    mobile: userPhone,
    gender: 'Male' as const,
    age: 35,
    bloodGroup: 'O+',
    dateOfBirth: '1991-04-12',
    occupation: 'Engineer',
    assignedHealer: 'Dr. Arjun',
    regDate: '2025-10-15',
    lastVisitDate: '2026-06-01',
    status: 'Active' as const,
    address: '404 Tranquil Hills, Powai, Mumbai',
    treatmentType: 'Basic Pranic Healing',
    emergencyContact: {
      name: 'Anjali Sharma',
      relation: 'Spouse',
      mobile: '+91 98765 43219'
    },
    medicalInfo: {
      conditions: ['Chronic Fatigue', 'Mild Insomnia'],
    },
    profilePhoto: user?.avatar || ''
  };

  // State
  const [currentPatient, setCurrentPatient] = React.useState<any>(null);

  React.useEffect(() => {
    const fetchDbPatient = async () => {
      let foundPatient: any = null;

      // 1. Try to fetch patient details from backend database
      try {
        const res = await getPatients({ email: userEmail });
        if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
          const dbPatient = res.data[0];
          foundPatient = {
            id: dbPatient.patientId || dbPatient.id || user?.id || 'pat-1',
            name: dbPatient.name || userName,
            email: dbPatient.email || userEmail,
            mobile: dbPatient.phone || userPhone,
            gender: dbPatient.gender || 'Male',
            age: dbPatient.age || 35,
            bloodGroup: dbPatient.bloodGroup || 'O+',
            dateOfBirth: dbPatient.dob || '1991-04-12',
            occupation: dbPatient.occupation || 'Engineer',
            assignedHealer: dbPatient.healer?.name ? (dbPatient.healer.name.startsWith('Dr.') ? dbPatient.healer.name : `Dr. ${dbPatient.healer.name}`) : 'Dr. Arjun',
            regDate: dbPatient.createdAt ? new Date(dbPatient.createdAt).toISOString().split('T')[0] : '2025-10-15',
            lastVisitDate: dbPatient.updatedAt ? new Date(dbPatient.updatedAt).toISOString().split('T')[0] : '2026-06-01',
            status: dbPatient.status || 'Active',
            address: dbPatient.address || '404 Tranquil Hills, Powai, Mumbai',
            treatmentType: dbPatient.treatmentType || 'Basic Pranic Healing',
            emergencyContact: {
              name: 'Emergency Contact',
              relation: 'Mobile',
              mobile: dbPatient.emergencyContact || '+91 98765 43219'
            },
            medicalInfo: {
              conditions: dbPatient.medicalHistory ? dbPatient.medicalHistory.split(',').map((c: string) => c.trim()) : ['Chronic Fatigue', 'Mild Insomnia'],
            },
            profilePhoto: user?.avatar || ''
          };
          console.log('Fetched patient from backend:', res);
        }
      } catch (err) {
        console.warn('Backend patient details fetch failed, using offline patient profile:', err);
      }

      // 2. Fallback to localStorage patients resolution
      if (!foundPatient) {
        const savedPatients = localStorage.getItem('phms_patients');
        let list: any[] = [];
        if (savedPatients) {
          try {
            list = JSON.parse(savedPatients);
          } catch (e) {
            console.error(e);
          }
        }

        foundPatient = list.find((p: any) => p.email?.toLowerCase() === userEmail.toLowerCase());
        if (!foundPatient) {
          foundPatient = defaultPatient;
          list.push(defaultPatient);
          localStorage.setItem('phms_patients', JSON.stringify(list));
        }
      }

      // Sync auth avatar to patient profilePhoto if not set
      if (!foundPatient.profilePhoto && user?.avatar) {
        foundPatient.profilePhoto = user.avatar;
      }
      setCurrentPatient(foundPatient);
    };

    fetchDbPatient();
  }, [userEmail, userName, userPhone, rawBranch, user?.avatar]);

  // Save updates to localStorage and state
  const savePatientUpdates = (updatedFields: any) => {
    const activePatient = currentPatient || { ...defaultPatient };
    const mergedPatient = { ...activePatient, ...updatedFields };

    setCurrentPatient(mergedPatient);

    const savedPatients = localStorage.getItem('phms_patients');
    let list: any[] = [];
    if (savedPatients) {
      try {
        list = JSON.parse(savedPatients);
      } catch (e) {
        console.error(e);
      }
    }

    const updatedList = list.map((p: any) => 
      p.email?.toLowerCase() === userEmail.toLowerCase() ? mergedPatient : p
    );
    if (!updatedList.some((p: any) => p.email?.toLowerCase() === userEmail.toLowerCase())) {
      updatedList.push(mergedPatient);
    }
    
    localStorage.setItem('phms_patients', JSON.stringify(updatedList));

    // Update global auth store state
    if (updatedFields.profilePhoto !== undefined) {
      updateUser({ avatar: updatedFields.profilePhoto });
    }
  };

  // Base64 converter for local profile image uploading
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const base64 = uploadEvent.target?.result as string;
        savePatientUpdates({ profilePhoto: base64 });
      };
      reader.readAsDataURL(file);
    }
  };

  const patient = currentPatient || defaultPatient;
  const initials = patient.name
    ? `${patient.name[0] || 'P'}${patient.name.split(' ')?.[1]?.[0] || 'T'}`.toUpperCase()
    : 'PT';

  return (
    <IonPage className="sa-page">
      <IonHeader className="ion-no-border">
        <IonToolbar className="sa-page__toolbar">
          <IonButtons slot="start">
            <IonMenuButton />
          </IonButtons>
          <IonTitle className="sa-page__toolbar-title">My Profile</IonTitle>
          <IonButtons slot="end">
          
              <ProfileDropdown />
</IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent className="sa-page__content">
        <div className="healer-container">
          
          <div className="healer-profile-grid">
            
            {/* Left Column */}
            <div className="healer-profile-left-col">
              
              {/* Profile Card */}
              <AppCard padding="large" shadow>
                <div className="healer-profile-photo-section">
                  <div className="healer-avatar-wrapper" style={{ background: '#e2f5f1', cursor: 'pointer' }} onClick={() => fileInputRef.current?.click()}>
                    {patient.profilePhoto ? (
                      <img src={patient.profilePhoto} alt="Patient Profile" className="healer-avatar-img" />
                    ) : (
                      <div className="healer-avatar-initials" style={{ color: '#0f766e' }}>{initials}</div>
                    )}
                    <div className="healer-avatar-hover-overlay">
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

                  <div style={{ textAlign: 'center', marginTop: '12px' }}>
                    <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#0f172a', margin: '0 0 4px 0' }}>
                      {patient.name}
                    </h2>
                    <span className={`healer-status-badge ${
                      patient.status === 'Active' || patient.status === 'Completed'
                        ? 'healer-status-badge--completed' 
                        : patient.status === 'On Hold'
                          ? 'healer-status-badge--scheduled'
                          : 'healer-status-badge--partial'
                    }`}>
                      {patient.status}
                    </span>
                  </div>

                  <div style={{ borderTop: '1px solid #e2e8f0', width: '100%', marginTop: '16px', paddingTop: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '8px' }}>
                      <span style={{ color: '#64748b' }}>Patient ID</span>
                      <strong style={{ color: '#0f172a' }}>{patient.id}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '8px' }}>
                      <span style={{ color: '#64748b' }}>Registered On</span>
                      <strong style={{ color: '#0f172a' }}>{patient.regDate}</strong>
                    </div>
                    {/* <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                      <span style={{ color: '#64748b' }}>Last Visit</span>
                      <strong style={{ color: '#0f172a' }}>{patient.lastVisitDate}</strong>
                    </div> */}
                  </div>
                </div>
              </AppCard>

              {/* Emergency Contact */}
              <AppCard padding="large" shadow>
                <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#1e293b', margin: '0 0 16px 0' }}>
                  Emergency Contact
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <IonIcon icon={alertCircleOutline} style={{ color: '#ef4444', fontSize: '18px' }} />
                    <div>
                      <span className="healer-credential-card__label" style={{ fontSize: '10px', color: '#ef4444' }}>CONTACT PERSON</span>
                      <strong style={{ fontSize: '13px', color: '#1e293b' }}>
                        {patient.emergencyContact?.name || 'Not Assigned'} ({patient.emergencyContact?.mobile || 'Spouse'})
                      </strong>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <IonIcon icon={callOutline} style={{ color: '#ef4444', fontSize: '18px' }} />
                    <div>
                      <span className="healer-credential-card__label" style={{ fontSize: '10px', color: '#ef4444' }}>PHONE NUMBER</span>
                      <strong style={{ fontSize: '13px', color: '#1e293b' }}>{patient.mobile || 'N/A'}</strong>
                    </div>
                  </div>
                </div>
              </AppCard>

            </div>

            {/* Right Column */}
            <div className="healer-profile-right-col">
              
              {/* Personal & Medical Info */}
              <AppCard padding="large" shadow>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#1e293b', margin: '0 0 16px 0' }}>
                  Personal Information
                </h3>
                
                <div className="healer-detail-grid" style={{ marginBottom: 0 }}>
                  <div>
                    <span className="healer-detail-grid__label">GENDER</span>
                    <strong>{patient.gender}</strong>
                  </div>
                  <div>
                    <span className="healer-detail-grid__label">AGE</span>
                    <strong>{patient.age} Years</strong>
                  </div>
                  <div>
                    <span className="healer-detail-grid__label">DATE OF BIRTH</span>
                    <strong>{patient.dateOfBirth}</strong>
                  </div>
                  <div>
                    <span className="healer-detail-grid__label">BLOOD GROUP</span>
                    <strong>{patient.bloodGroup}</strong>
                  </div>
                  <div>
                    <span className="healer-detail-grid__label">OCCUPATION</span>
                    <strong>{patient.occupation}</strong>
                  </div>
                  <div>
                    <span className="healer-detail-grid__label">RESIDENTIAL ADDRESS</span>
                    <strong>{patient.address || 'N/A'}</strong>
                  </div>
                </div>
              </AppCard>

              {/* Medical History Summary */}
              <AppCard padding="large" shadow>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#1e293b', margin: '0 0 16px 0' }}>
                  Medical History Summary
                </h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div>
                    <span className="healer-credential-card__label" style={{ fontSize: '10px', color: '#0d9488' }}>PRIMARY CONDITIONS</span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '6px' }}>
                      {patient.medicalInfo?.conditions && patient.medicalInfo.conditions.length > 0 ? (
                        patient.medicalInfo.conditions.map((cond: string, idx: number) => (
                          <span 
                            key={idx} 
                            style={{ fontSize: '12px', background: '#fef2f2', color: '#dc2626', padding: '4px 10px', borderRadius: '6px', fontWeight: '600' }}
                          >
                            {cond}
                          </span>
                        ))
                      ) : (
                        <span style={{ fontSize: '13px', color: '#64748b' }}>No active medical conditions logged.</span>
                      )}
                    </div>
                  </div>

                  {/* <div style={{ borderTop: '1px dashed #e2e8f0', paddingTop: '12px' }}>
                    <span className="healer-credential-card__label" style={{ fontSize: '10px' }}>CLINICAL NOTES & HISTORY</span>
                    <p style={{ margin: '6px 0 0 0', fontSize: '13px', color: '#475569', lineHeight: 1.5 }}>
                      {patient.name === 'Valued Patient' || patient.name === defaultPatient.name
                        ? 'Lumbar Disc Herniation (Diagnosed 2024). Patient complains of chronic back fatigue. Energy sweeps scheduled on lower back chakras.'
                        : 'No detailed clinical notes available in primary records.'
                      }
                    </p>
                  </div> */}
                </div>
              </AppCard>

              {/* Assigned Treatment & Healer */}
              <AppCard padding="large" shadow>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#1e293b', margin: '0 0 16px 0' }}>
                  Assigned Treatment Modality & Healing Team
                </h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
                  <div className="healer-cert-display" style={{ background: '#e2f5f1', borderColor: '#ccfbf1' }}>
                    <div className="healer-cert-title-row">
                      <div className="healer-cert-icon-container" style={{ color: '#0f766e' }}>
                        <IonIcon icon={medkitOutline} />
                      </div>
                      <div>
                        <h4 className="healer-cert-name" style={{ color: '#0f766e' }}>{patient.assignedHealer || 'Assigned Healer'}</h4>
                        <span style={{ fontSize: '12px', color: '#0d9488' }}>Primary Healing Practitioner</span>
                      </div>
                    </div>
                  </div>

                  <div className="healer-cert-display" style={{ background: '#faf8fc', borderColor: '#faf5ff' }}>
                    <div className="healer-cert-title-row">
                      <div className="healer-cert-icon-container" style={{ color: '#6b21a8' }}>
                        <IonIcon icon={heartOutline} />
                      </div>
                      <div>
                        <h4 className="healer-cert-name" style={{ color: '#6b21a8' }}>{patient.treatmentType || 'Basic Pranic Healing'}</h4>
                        <span style={{ fontSize: '12px', color: '#7c3aed' }}>Assigned Treatment Type</span>
                      </div>
                    </div>
                  </div>
                </div>
              </AppCard>

              {/* Contact Information */}
              <AppCard padding="large" shadow>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#1e293b', margin: '0 0 16px 0' }}>
                  Contact Information
                </h3>
                
                <div className="healer-profile-info-list" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div className="healer-profile-info-item" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <IonIcon icon={mailOutline} style={{ color: '#0f766e', fontSize: '18px' }} />
                    <div>
                      <span className="healer-credential-card__label" style={{ fontSize: '10px' }}>EMAIL ADDRESS</span>
                      <strong style={{ fontSize: '13px', color: '#1e293b' }}>{patient.email}</strong>
                    </div>
                  </div>

                  <div className="healer-profile-info-item" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <IonIcon icon={phonePortraitOutline} style={{ color: '#0f766e', fontSize: '18px' }} />
                    <div>
                      <span className="healer-credential-card__label" style={{ fontSize: '10px' }}>MOBILE NUMBER</span>
                      <strong style={{ fontSize: '13px', color: '#1e293b' }}>{patient.mobile}</strong>
                    </div>
                  </div>

                  <div className="healer-profile-info-item" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <IonIcon icon={businessOutline} style={{ color: '#0f766e', fontSize: '18px' }} />
                    <div>
                      <span className="healer-credential-card__label" style={{ fontSize: '10px' }}>BRANCH LOCATION</span>
                      <strong style={{ fontSize: '13px', color: '#1e293b' }}>{branchName}</strong>
                    </div>
                  </div>
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