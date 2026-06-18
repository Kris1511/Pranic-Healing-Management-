import React, { useState, useEffect } from 'react';
import {
  IonPage,
  IonContent,
  IonIcon,
} from '@ionic/react';
import {
  arrowBackOutline,
  personOutline,
  callOutline,
  mailOutline,
  locationOutline,
  alertCircleOutline,
  lockOpenOutline,
  ribbonOutline,
  documentTextOutline,
  checkmarkCircleOutline,
  closeCircleOutline,
  shieldCheckmarkOutline,
  pencilOutline,
  calendarOutline,
  maleFemaleOutline,
  globeOutline,
  timeOutline,
  idCardOutline,
} from 'ionicons/icons';
import { useHistory, useParams } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';
import { ROUTES } from '../../constants/routes.constant';
import { getHealerById } from '../../api/healer.api';
import './branch-admin.css';

export default function BADetailHealerPage() {
  const history = useHistory();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthStore();
  const isBranchAdmin = user?.role === 'BRANCH_ADMIN';

  const getPhotoUrl = (path: string | null) => {
    if (!path) return null;
    if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) return path;
    const baseUrl = import.meta.env.VITE_API_BASE_URL 
      ? import.meta.env.VITE_API_BASE_URL.replace(/\/api\/?$/, '') 
      : 'http://localhost:3000';
    return `${baseUrl}/${path}`;
  };

  // Current Date display
  const formattedDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const [healer, setHealer] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHealerData = async () => {
      try {
        setLoading(true);
        const response = await getHealerById(id);
        const h = response.data || response;
        if (h) {
          const formatted = {
            id: h.id,
            healerId: h.healerId,
            name: h.name,
            gender: h.gender || 'Not Specified',
            dob: h.dob || 'Not Specified',
            email: h.email || '',
            phone: h.mobile || h.phone || '',
            address: h.address || '',
            certificationLevel: h.certLevel || 'Associate Healer',
            specialization: typeof h.specialization === 'string' ? h.specialization.split(',') : (h.specialization || []),
            experience: h.experience || 0,
            status: h.status?.toUpperCase() || 'ACTIVE',
            branch: h.branch?.name || (typeof user?.branch === 'object' && user?.branch !== null ? (user.branch as any).name : (user?.branch || 'Main')),
            createdAt: h.createdAt || new Date().toISOString(),
            profilePhoto: h.profilePhoto || null,
            idProof: h.idProof || null,
            certification: h.certification || null,
            initials: h.name ? h.name.split(' ').map((w: string) => w[0]).join('').substring(0, 2).toUpperCase() : 'HE',
            bio: h.bio || `Certified practitioner specializing in ${typeof h.specialization === 'string' ? h.specialization : 'general healing'}.`,
          };
          setHealer(formatted);
        }
      } catch (error) {
        console.error('Error fetching healer detail:', error);
      } finally {
        setLoading(false);
      }
    };
    if (id && isBranchAdmin) {
      fetchHealerData();
    }
  }, [id, isBranchAdmin, user]);

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
                <span className="db-access-restricted-title">Unauthorized Node Access</span>
                <p className="db-access-restricted-desc">
                  Access Denied. Healer profile viewing is restricted exclusively to authorized Branch Admin users.
                </p>
              </div>
            </div>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  if (loading) {
    return (
      <IonPage className="sa-page">
        <IonContent className="sa-page__content" style={{ '--background': '#f8fafc' }} fullscreen>
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b' }}>Loading Healer Profile...</h3>
            <p style={{ color: '#64748b', fontSize: '14px' }}>
              Fetching professional records from the branch registry database.
            </p>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  if (!healer) {
    return (
      <IonPage className="sa-page">
        <IonContent className="sa-page__content" style={{ '--background': '#f8fafc' }} fullscreen>
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <IonIcon icon={alertCircleOutline} style={{ fontSize: '48px', color: '#ef4444', marginBottom: '16px' }} />
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b' }}>Healer Profile Not Found</h3>
            <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '24px' }}>
              The requested healer record could not be found in the branch registry database.
            </p>
            <button 
              className="st-btn st-btn--primary" 
              onClick={() => history.push(ROUTES.BRANCH_ADMIN.HEALERS)}
            >
              Back to Healers Registry
            </button>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  // Visual layout CSS blocks matching CreateHealerPage style
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
      fontSize: '18px',
      fontWeight: 700,
      color: '#0D5C46',
      marginTop: '4px',
      marginBottom: '12px',
    },
    subHeaderIcon: {
      color: '#0D5C46',
      fontSize: '22px',
    },
    label: {
      fontSize: '10px',
      fontWeight: 800,
      color: '#64748b',
      letterSpacing: '0.6px',
      textTransform: 'uppercase' as const,
      marginBottom: '4px',
    },
    valueText: {
      fontSize: '15px',
      color: '#1e293b',
      fontWeight: 600,
      wordBreak: 'break-word' as const,
    },
    detailRow: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '4px',
      borderBottom: '1px solid #f1f5f9',
      paddingBottom: '12px',
    },
    documentBadge: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      background: '#f0fdf4',
      border: '1px solid #a7f3d0',
      borderRadius: '8px',
      padding: '12px 16px',
      width: '100%',
    },
  };

  return (
    <IonPage className="sa-page">
      <IonContent className="sa-page__content" style={{ '--background': '#f8fafc' }} fullscreen>
        <div className="db-corp-layout" style={{ background: '#f8fafc' }}>
          
          <main className="db-corp-canvas">
            
            {/* Horizontal Header Navbar */}
            <header className="db-corp-navbar" style={{ background: '#ffffff', borderBottom: '1px solid #e2e8f0', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <button 
                  className="db-corp-nav-icon-btn" 
                  onClick={() => history.push(ROUTES.BRANCH_ADMIN.HEALERS)} 
                  title="Back to Healers Registry"
                  style={{
                    background: '#f1f5f9',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    width: '40px',
                    height: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    padding: 0,
                    flexShrink: 0,
                    transition: 'all 0.2s ease',
                  }}
                >
                  <IonIcon icon={arrowBackOutline} style={{ color: '#0D5C46', fontSize: '20px' }} />
                </button>
                <div className="db-corp-navbar-left">
                  <h1 className="db-corp-page-title" style={{ color: '#0d5c46', fontWeight: 800, margin: 0, fontSize: '20px', lineHeight: 1.2 }}>Healer Detailed Profile</h1>
                  <p className="db-corp-page-subtitle" style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0 0', lineHeight: 1.2 }}>Pranic Healing Management System • {formattedDate}</p>
                </div>
              </div>
              
              <div className="db-corp-navbar-right">
                <span style={{ 
                  fontSize: '11px', 
                  fontWeight: 700, 
                  padding: '4px 12px', 
                  borderRadius: '9999px', 
                  textTransform: 'uppercase',
                  background: healer.status === 'ACTIVE' ? '#ecfdf5' : '#fef2f2',
                  color: healer.status === 'ACTIVE' ? '#10b981' : '#ef4444',
                }}>
                  {healer.status}
                </span>
              </div>
            </header>

            {/* Main Details Workspace */}
            <div className="db-hc-layout" style={{ padding: '28px' }}>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
                
                {/* 2-Column Grid Layout */}
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '28px', alignItems: 'start' }}>
                  
                  {/* LEFT COLUMN: Basic Information, Professional Details */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
                    
                    {/* Card 1: Basic Information */}
                    <div style={customStyles.formCard}>
                      <div>
                        <div style={customStyles.subHeader}>
                          <IonIcon icon={personOutline} style={customStyles.subHeaderIcon} />
                          <span>Basic Information</span>
                        </div>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                          
                          {/* Photo display */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
                            <div style={{ position: 'relative', width: '64px', height: '64px', borderRadius: '50%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: '2px solid #cbd5e1' }}>
                              {healer.profilePhoto ? (
                                <img src={getPhotoUrl(healer.profilePhoto) || ''} alt="Healer avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              ) : (
                                <span style={{ fontSize: '24px', fontWeight: 700, color: '#475569' }}>{healer.initials}</span>
                              )}
                            </div>
                            <div>
                              <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0d5c46', margin: 0 }}>Dr. {healer.name}</h2>
                              <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0 0' }}>Registered Healer Profile</p>
                            </div>
                          </div>

                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div style={customStyles.detailRow}>
                              <span style={customStyles.label}>GENDER</span>
                              <span style={customStyles.valueText}>{healer.gender || 'Not Specified'}</span>
                            </div>
                            <div style={customStyles.detailRow}>
                              <span style={customStyles.label}>DATE OF BIRTH</span>
                              <span style={customStyles.valueText}>{healer.dob || 'Not Specified'}</span>
                            </div>
                          </div>

                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div style={customStyles.detailRow}>
                              <span style={customStyles.label}>PHONE NUMBER</span>
                              <span style={customStyles.valueText}>{healer.phone}</span>
                            </div>
                            <div style={customStyles.detailRow}>
                              <span style={customStyles.label}>EMAIL ADDRESS</span>
                              <span style={customStyles.valueText}>{healer.email}</span>
                            </div>
                          </div>

                          <div style={customStyles.detailRow}>
                            <span style={customStyles.label}>COMPLETE ADDRESS</span>
                            <span style={customStyles.valueText}>{healer.address || 'Not Specified'}</span>
                          </div>

                        </div>
                      </div>
                    </div>

                    {/* Card 2: Professional Details */}
                    <div style={customStyles.formCard}>
                      <div>
                        <div style={customStyles.subHeader}>
                          <IonIcon icon={ribbonOutline} style={customStyles.subHeaderIcon} />
                          <span>Professional Details</span>
                        </div>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div style={customStyles.detailRow}>
                              <span style={customStyles.label}>CERTIFICATION LEVEL</span>
                              <span style={customStyles.valueText}>{healer.certificationLevel}</span>
                            </div>
                            <div style={customStyles.detailRow}>
                              <span style={customStyles.label}>YEARS OF EXPERIENCE</span>
                              <span style={customStyles.valueText}>{healer.experience} Years</span>
                            </div>
                          </div>

                          <div style={customStyles.detailRow}>
                            <span style={customStyles.label}>SPECIALIZATIONS</span>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '4px' }}>
                              {healer.specialization.map((spec: string, idx: number) => (
                                <span key={idx} style={{ padding: '6px 12px', background: '#e6f4f1', color: '#0d5c46', borderRadius: '20px', fontSize: '12px', fontWeight: 700 }}>
                                  {spec}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div style={customStyles.detailRow}>
                            <span style={customStyles.label}>BIO SUMMARY</span>
                            <span style={{ ...customStyles.valueText, fontWeight: 500, lineHeight: 1.5, color: '#475569' }}>
                              {healer.bio || `Certified practitioner specializing in ${healer.specialization.join(', ')}.`}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* RIGHT COLUMN: Account Details, Verification Documents */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
                    
                    {/* Card 3: Account & Login Info */}
                    <div style={customStyles.formCard}>
                      <div>
                        <div style={customStyles.subHeader}>
                          <IonIcon icon={lockOpenOutline} style={customStyles.subHeaderIcon} />
                          <span>Account & Login Details</span>
                        </div>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                          <div style={customStyles.detailRow}>
                            <span style={customStyles.label}>LOGIN USERNAME</span>
                            <span style={{ ...customStyles.valueText, fontFamily: 'monospace' }}>{healer.email}</span>
                          </div>

                          <div style={customStyles.detailRow}>
                            <span style={customStyles.label}>ASSIGNED BRANCH</span>
                            <span style={customStyles.valueText}>{healer.branch} Branch</span>
                          </div>

                          <div style={customStyles.detailRow}>
                            <span style={customStyles.label}>HEALER ID</span>
                            <span style={{ ...customStyles.valueText, color: '#0D5C46', fontFamily: 'monospace' }}>{healer.id}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Card 4: Verification Documents */}
                    <div style={customStyles.formCard}>
                      <div>
                        <div style={customStyles.subHeader}>
                          <IonIcon icon={shieldCheckmarkOutline} style={customStyles.subHeaderIcon} />
                          <span>Verification Documents</span>
                        </div>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                          
                          {/* 1. ID Proof */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <span style={customStyles.label}>ID PROOF DOCUMENT</span>
                            {healer.idProof ? (
                              <div style={customStyles.documentBadge}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <IonIcon icon={checkmarkCircleOutline} style={{ color: '#10b981', fontSize: '18px' }} />
                                  <span style={{ fontSize: '13px', color: '#065f46', fontWeight: 600 }}>
                                    {healer.idProof.split('/').pop()}
                                  </span>
                                </div>
                                <IonIcon 
                                  icon={documentTextOutline} 
                                  style={{ color: '#0d5c46', fontSize: '18px', cursor: 'pointer' }} 
                                  onClick={() => {
                                    const url = getPhotoUrl(healer.idProof);
                                    if (url) window.open(url, '_blank');
                                  }}
                                />
                              </div>
                            ) : (
                              <div style={{ fontSize: '13px', color: '#64748b', fontStyle: 'italic', padding: '4px 0' }}>
                                No ID proof document uploaded.
                              </div>
                            )}
                          </div>

                          {/* 2. Certification */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <span style={customStyles.label}>CERTIFICATION FILE</span>
                            {healer.certification ? (
                              <div style={customStyles.documentBadge}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <IonIcon icon={checkmarkCircleOutline} style={{ color: '#10b981', fontSize: '18px' }} />
                                  <span style={{ fontSize: '13px', color: '#065f46', fontWeight: 600 }}>
                                    {healer.certification.split('/').pop()}
                                  </span>
                                </div>
                                <IonIcon 
                                  icon={documentTextOutline} 
                                  style={{ color: '#0d5c46', fontSize: '18px', cursor: 'pointer' }} 
                                  onClick={() => {
                                    const url = getPhotoUrl(healer.certification);
                                    if (url) window.open(url, '_blank');
                                  }}
                                />
                              </div>
                            ) : (
                              <div style={{ fontSize: '13px', color: '#64748b', fontStyle: 'italic', padding: '4px 0' }}>
                                No certification file uploaded.
                              </div>
                            )}
                          </div>

                          {/* 3. Verification Status */}
                          <div style={customStyles.detailRow}>
                            <span style={customStyles.label}>VERIFICATION LEVEL</span>
                            <span style={{ ...customStyles.valueText, color: '#10b981' }}>Verified Practitioner</span>
                          </div>

                        </div>
                      </div>
                    </div>

                  </div>

                </div>

                {/* Footer Buttons Block */}
                {/* <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', marginTop: '12px', marginBottom: '28px' }}>
                  <button 
                    onClick={() => history.push(ROUTES.BRANCH_ADMIN.HEALERS)} 
                    style={{
                      background: '#ffffff',
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      padding: '10px 24px',
                      fontSize: '14px',
                      fontWeight: 600,
                      color: '#475569',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    Back to Registry
                  </button>
                </div> */}

              </div>

            </div>

          </main>

        </div>
      </IonContent>
    </IonPage>
  );
}
