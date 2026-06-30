import React, { useState, useEffect } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import {
  IonPage,
  IonContent,
  IonIcon,
} from '@ionic/react';
import {
  arrowBackOutline,
  personOutline,
  callOutline,
  timeOutline,
  calendarOutline,
  documentTextOutline,
  checkmarkCircleOutline,
  logOutOutline,
  alertCircleOutline,
  businessOutline,
} from 'ionicons/icons';
import { getVisitorDetails } from '../../api/visitor.api';
import axiosInstance from '../../api/axois.instance';
import { ROUTES } from '../../constants/routes.constant';
import './branch-admin.css';
import './visitor-log.css';

interface Visitor {
  id: string;
  visitorId: string;
  name: string;
  phone: string;
  visitorType: string;
  purpose?: string;
  gender?: string;
  idProof?: string;
  address?: string;
  referenceSource?: string[];
  referralName?: string;
  checkIn: string;
  checkOut?: string;
}

export default function BAVisiterDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const history = useHistory();
  
  const [visitor, setVisitor] = useState<Visitor | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const fetchDetails = async () => {
    try {
      setIsLoading(true);
      const response = await getVisitorDetails(id);
      const data = response?.data || response;
      if (data) {
        setVisitor(data);
      }
    } catch (error) {
      console.error('Error fetching visitor details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const handleCheckOut = async () => {
    if (!visitor) return;
    try {
      setIsCheckingOut(true);
      await axiosInstance.put(`/visitors/check-out/${visitor.id}`);
      fetchDetails();
    } catch (error) {
      console.error('Error checking out visitor:', error);
      alert('Failed to check out visitor.');
    } finally {
      setIsCheckingOut(false);
    }
  };

  if (isLoading) {
    return (
      <IonPage className="sa-page">
        <IonContent className="sa-page__content" style={{ '--background': '#f8fafc' }} fullscreen>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <div className="vl-live-badge">
              <span className="vl-live-dot" /> Loading visitor record...
            </div>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  if (!visitor) {
    return (
      <IonPage className="sa-page">
        <IonContent className="sa-page__content" style={{ '--background': '#f8fafc' }} fullscreen>
          <div className="db-access-restricted-container">
            <div className="db-access-restricted-card">
              <div className="db-access-restricted-icon" style={{ background: '#fee2e2', color: '#ef4444' }}>
                <IonIcon icon={alertCircleOutline} />
              </div>
              <div className="db-access-restricted-details">
                <span className="db-access-restricted-title">Record Not Found</span>
                <p className="db-access-restricted-desc">
                  The requested visitor log record does not exist or has been deleted.
                </p>
                <button 
                  onClick={() => history.push(ROUTES.BRANCH_ADMIN.VISITOR_LOG)}
                  className="sa-btn sa-btn--primary"
                  style={{ marginTop: '16px', background: '#0D5C46' }}
                >
                  Return to Logs
                </button>
              </div>
            </div>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  const isInside = !visitor.checkOut;
  const checkInDate = new Date(visitor.checkIn);
  const checkOutDate = visitor.checkOut ? new Date(visitor.checkOut) : null;

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
      borderBottom: '1px solid #f1f5f9',
      paddingBottom: '12px',
      marginBottom: '8px',
    },
    subHeaderIcon: {
      color: '#0D5C46',
      fontSize: '22px',
    },
    label: {
      fontSize: '11px',
      fontWeight: 800,
      color: '#64748b',
      letterSpacing: '0.5px',
      marginBottom: '4px',
      textTransform: 'uppercase' as const,
      display: 'block',
    },
    value: {
      fontSize: '15px',
      fontWeight: 700,
      color: '#1e293b',
    },
  };

  return (
    <IonPage className="sa-page">
      <IonContent className="sa-page__content" style={{ '--background': '#f8fafc' }} fullscreen>
        <div className="db-corp-layout" style={{ background: '#f8fafc' }}>
          
          <main className="db-corp-canvas">
            
            {/* Navbar Header */}
            <header className="db-corp-navbar" style={{ background: '#ffffff', borderBottom: '1px solid #e2e8f0', padding: '16px 24px' }}>
              <div className="vl-details-header-content">
                <div className="vl-details-title-group">
                  <button 
                    onClick={() => history.push(ROUTES.BRANCH_ADMIN.VISITOR_LOG)} 
                    title="Back"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: '#f1f5f9',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'background 0.2s ease'
                    }}
                  >
                    <IonIcon icon={arrowBackOutline} style={{ color: '#0D5C46', fontSize: '20px' }} />
                  </button>
                  <div className="vl-details-title-text">
                    <h1 style={{ margin: 0, color: '#0d5c46', fontSize: '20px', fontWeight: 800 }}>Visitor Gate Pass</h1>
                    <p style={{ margin: 0, color: '#64748b', fontSize: '13px' }}>Pranic Healing Management System • Record Auditing</p>
                  </div>
                </div>

                {/* Status Badge */}
                <span 
                  className={`vl-badge-status vl-badge-status--${isInside ? 'inside' : 'exited'}`}
                  style={{ fontSize: '12px', padding: '6px 16px', borderRadius: '20px', fontWeight: 700, marginLeft: 'auto' }}
                >
                  {isInside && <span className="vl-now-inside-dot" />}
                  {isInside ? 'Currently Inside' : 'Exited Center'}
                </span>
              </div>
            </header>

            {/* Main Content Details Grid */}
            <div className="db-hc-layout" style={{ padding: '28px' }}>
              
              <div className="sa-edit-grid">
                
                {/* Left Column: Visitor Details & Identity */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
                  
                  {/* Card 1: Visitor Information */}
                  <div style={customStyles.formCard}>
                    <div style={customStyles.subHeader}>
                      <IonIcon icon={personOutline} style={customStyles.subHeaderIcon} />
                      <span>Visitor Information</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div>
                        <label style={customStyles.label}>Full Name</label>
                        <span style={{ ...customStyles.value, fontSize: '20px', color: '#0D5C46' }}>{visitor.name}</span>
                      </div>

                      <div className="ba-form-grid-2">
                        <div>
                          <label style={customStyles.label}>Contact Number</label>
                          <span style={customStyles.value}>{visitor.phone}</span>
                        </div>
                        <div>
                          <label style={customStyles.label}>Gender</label>
                          <span style={customStyles.value}>{visitor.gender || 'N/A'}</span>
                        </div>
                      </div>

                      <div>
                        <label style={customStyles.label}>Reference Source</label>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
                          {visitor.referenceSource && visitor.referenceSource.length > 0 ? (
                            visitor.referenceSource.map((ref) => (
                              <span key={ref} style={{ background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0', padding: '2px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 700 }}>
                                {ref}
                              </span>
                            ))
                          ) : (
                            <span style={{ fontSize: '13px', color: '#64748b', fontStyle: 'italic' }}>None selected</span>
                          )}
                        </div>
                      </div>

                      {visitor.referralName && (
                        <div>
                          <label style={customStyles.label}>Referral Name</label>
                          <span style={customStyles.value}>{visitor.referralName}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card 2: Visit Details & Identity */}
                  <div style={customStyles.formCard}>
                    <div style={customStyles.subHeader}>
                      <IonIcon icon={businessOutline} style={customStyles.subHeaderIcon} />
                      <span>Visit &amp; Identity</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div className="ba-form-grid-2">
                        <div>
                          <label style={customStyles.label}>Gate Pass ID</label>
                          <span style={{ ...customStyles.value, fontFamily: 'monospace', color: '#7c2d12' }}>{visitor.visitorId || '—'}</span>
                        </div>
                        <div>
                          <label style={customStyles.label}>Visitor Type</label>
                          <span 
                            className={`vl-badge-type vl-badge-type--${visitor.visitorType.toLowerCase()}`}
                            style={{
                              textTransform: 'uppercase', fontSize: '9px', padding: '2px 8px', borderRadius: '12px', fontWeight: 800,
                              background: visitor.visitorType === 'Session' ? '#eff6ff' : visitor.visitorType === 'Walk-in' ? '#ecfdf5' : visitor.visitorType === 'Meditation' ? '#fffbeb' : visitor.visitorType === 'Camp' ? '#fdf4ff' : visitor.visitorType === 'Conversion' ? '#f0fdf4' : '#ecfeff',
                              color: visitor.visitorType === 'Session' ? '#2563eb' : visitor.visitorType === 'Walk-in' ? '#10b981' : visitor.visitorType === 'Meditation' ? '#d97706' : visitor.visitorType === 'Camp' ? '#c084fc' : visitor.visitorType === 'Conversion' ? '#15803d' : '#0891b2',
                              border: `1px solid ${visitor.visitorType === 'Session' ? '#bfdbfe' : visitor.visitorType === 'Walk-in' ? '#a7f3d0' : visitor.visitorType === 'Meditation' ? '#fde68a' : visitor.visitorType === 'Camp' ? '#f3e8ff' : visitor.visitorType === 'Conversion' ? '#bbf7d0' : '#cffafe'}`
                            }}
                          >
                            {visitor.visitorType}
                          </span>
                        </div>
                      </div>

                      {visitor.idProof && (
                        <div>
                          <label style={customStyles.label}>ID Proof (Aadhar)</label>
                          <span style={customStyles.value}>{visitor.idProof}</span>
                        </div>
                      )}

                      {visitor.address && (
                        <div>
                          <label style={customStyles.label}>Address</label>
                          <span style={{ ...customStyles.value, fontWeight: 500, display: 'block', background: '#f8fafc', padding: '8px 12px', borderRadius: '6px', border: '1px solid #e2e8f0', lineHeight: 1.5 }}>
                            {visitor.address}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                </div>

                {/* Right Column: Audit Timeline & Actions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
                  
                  {/* Card 3: Audit Timeline */}
                  <div style={customStyles.formCard}>
                    <div style={customStyles.subHeader}>
                      <IonIcon icon={calendarOutline} style={customStyles.subHeaderIcon} />
                      <span>Audit &amp; Remarks</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div style={{ position: 'relative', borderLeft: '2px solid #e2e8f0', paddingLeft: '16px', marginLeft: '8px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        
                        {/* Check In */}
                        <div>
                          <div style={{ position: 'absolute', left: '-5px', top: '4px', width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} />
                          <label style={{ ...customStyles.label, color: '#10b981' }}>Check-In Time</label>
                          <span style={customStyles.value}>
                            {isNaN(checkInDate.getTime()) ? '—' : checkInDate.toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
                          </span>
                        </div>

                        {/* Check Out */}
                        <div>
                          <div style={{ position: 'absolute', left: '-5px', bottom: '16px', width: '8px', height: '8px', borderRadius: '50%', background: isInside ? '#cbd5e1' : '#64748b' }} />
                          <label style={{ ...customStyles.label, color: isInside ? '#64748b' : '#334155' }}>Check-Out Time</label>
                          <span style={customStyles.value}>
                            {isInside ? (
                              <span style={{ color: '#64748b', fontStyle: 'italic', fontWeight: 500 }}>Still inside branch</span>
                            ) : (
                              checkOutDate ? checkOutDate.toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }) : '—'
                            )}
                          </span>
                        </div>

                      </div>

                      {visitor.purpose && (
                        <div>
                          <label style={customStyles.label}>Purpose / Notes</label>
                          <span style={{ ...customStyles.value, fontWeight: 500, display: 'block', background: '#f8fafc', padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', minHeight: '80px', lineHeight: 1.5 }}>
                            {visitor.purpose}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions Block */}
                  {isInside && (
                    <button
                      onClick={handleCheckOut}
                      disabled={isCheckingOut}
                      style={{
                        background: '#0D5C46',
                        color: 'white',
                        border: 'none',
                        borderRadius: '12px',
                        padding: '16px 24px',
                        fontSize: '15px',
                        fontWeight: 700,
                        cursor: isCheckingOut ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        boxShadow: '0 4px 12px rgba(13, 92, 70, 0.25)',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <IonIcon icon={logOutOutline} style={{ fontSize: '20px' }} />
                      <span>{isCheckingOut ? 'Processing Check-Out...' : 'Complete Check-Out'}</span>
                    </button>
                  )}

                  <button
                    onClick={() => history.push(ROUTES.BRANCH_ADMIN.VISITOR_LOG)}
                    style={{
                      background: '#ffffff',
                      color: '#475569',
                      border: '1px solid #cbd5e1',
                      borderRadius: '12px',
                      padding: '12px 24px',
                      fontSize: '14px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      textAlign: 'center',
                    }}
                  >
                    Return to logs
                  </button>

                </div>

              </div>

            </div>

          </main>

        </div>
      </IonContent>
    </IonPage>
  );
}
