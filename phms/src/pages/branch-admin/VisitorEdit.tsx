import React, { useState, useEffect } from 'react';
import { getVisitorDetails, updateVisitor } from '../../api/visitor.api';
import {
  IonPage,
  IonContent,
  IonIcon,
} from '@ionic/react';
import {
  arrowBackOutline,
  personOutline,
  locationOutline,
  alertCircleOutline,
  calendarOutline,
  checkmarkCircleOutline,
  businessOutline,
} from 'ionicons/icons';
import { useHistory, useParams } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';
import { ROUTES } from '../../constants/routes.constant';
import './branch-admin.css';
import './visitor-log.css';

export default function BAVisitorEditPage() {
  const { id } = useParams<{ id: string }>();
  const history = useHistory();
  const { user } = useAuthStore();
  const isBranchAdmin = user?.role === 'BRANCH_ADMIN';

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    gender: 'Male',
    visitorType: 'Session',
    idProof: '',
    address: '',
    entryDate: '',
    notes: '',
    referralName: '',
  });

  const [referenceSource, setReferenceSource] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Success modal control
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  // Fetch visitor details on mount
  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const res = await getVisitorDetails(id);
        const visitor = res.data || res;
        
        let dateVal = '';
        if (visitor.checkIn) {
          const d = new Date(visitor.checkIn);
          if (!isNaN(d.getTime())) {
            dateVal = d.toISOString().split('T')[0];
          }
        }

        setFormData({
          name: visitor.name || '',
          mobile: visitor.phone || '',
          gender: visitor.gender || 'Male',
          visitorType: visitor.visitorType || 'Session',
          idProof: visitor.idProof || '',
          address: visitor.address || '',
          entryDate: dateVal,
          notes: visitor.purpose || '',
          referralName: visitor.referralName || '',
        });
        
        setReferenceSource(visitor.referenceSource || []);
      } catch (err) {
        console.error('Error fetching visitor details:', err);
        setError('Failed to fetch visitor details. Please return to the log and try again.');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchDetails();
    }
  }, [id]);

  // Current Date display
  const formattedDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Handle Input Changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle Submit
  const handleSaveRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Full Name is required.');
      return;
    }
    if (!formData.mobile.trim()) {
      alert('Contact Number is required.');
      return;
    }
    if (referenceSource.length === 0) {
      alert('Please select at least one Reference Source.');
      return;
    }

    try {
      setIsSaving(true);
      const payload = {
        name: formData.name,
        phone: formData.mobile,
        visitorType: formData.visitorType,
        purpose: formData.notes,
        referenceSource,
        gender: formData.gender,
        idProof: formData.idProof,
        address: formData.address,
        referralName: formData.referralName,
        checkIn: formData.entryDate ? new Date(formData.entryDate) : undefined,
      };

      await updateVisitor(id, payload);
      setShowSuccessToast(true);
    } catch (err) {
      console.error(err);
      alert('Failed to update visitor details. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const closeAndRedirect = () => {
    setShowSuccessToast(false);
    history.push(ROUTES.BRANCH_ADMIN.VISITOR_LOG);
  };

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
                  Access Denied. Visitor editing is restricted exclusively to authorized Branch Admin users.
                </p>
              </div>
            </div>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  const customStyles = {
    formCard: {
      background: '#ffffff',
      borderRadius: '16px',
      padding: '28px',
      border: '1px solid #e2e8f0',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.025)',
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '24px',
    },
    subHeader: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      fontSize: '18px',
      fontWeight: 700,
      color: '#0D5C46',
      marginTop: '8px',
      marginBottom: '16px',
    },
    subHeaderIcon: {
      color: '#0D5C46',
      fontSize: '22px',
    },
    label: {
      fontSize: '11px',
      fontWeight: 800,
      color: '#475569',
      letterSpacing: '0.5px',
      marginBottom: '6px',
      textTransform: 'uppercase' as const,
    },
    grayInput: {
      background: '#f8fafc',
      border: '1px solid #e2e8f0',
      borderRadius: '8px',
      padding: '12px 16px',
      fontSize: '14px',
      color: '#1e293b',
      outline: 'none',
      width: '100%',
      transition: 'all 0.2s ease',
    },
    grayTextarea: {
      background: '#f8fafc',
      border: '1px solid #e2e8f0',
      borderRadius: '8px',
      padding: '12px 16px',
      fontSize: '14px',
      color: '#1e293b',
      outline: 'none',
      width: '100%',
      resize: 'none' as const,
      lineHeight: 1.5,
      transition: 'all 0.2s ease',
    },
  };

  return (
    <IonPage className="sa-page">
      <IonContent className="sa-page__content" style={{ '--background': '#f8fafc' }} fullscreen>
        <div className="db-corp-layout" style={{ background: '#f8fafc' }}>
          
          <main className="db-corp-canvas">
            
            {/* Horizontal Header Navbar */}
            <header className="db-corp-navbar" style={{ background: '#ffffff', borderBottom: '1px solid #e2e8f0', padding: '16px 24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <button 
                  type="button"
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
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <h1 style={{ margin: 0, color: '#0d5c46', fontSize: '20px', fontWeight: 800 }}>Edit Visitor Details</h1>
                  <p style={{ margin: 0, color: '#64748b', fontSize: '13px' }}>Pranic Healing Management System • {formattedDate}</p>
                </div>
              </div>
            </header>

            {/* Main Form Workspace */}
            <div className="db-hc-layout" style={{ padding: '28px' }}>
              {isLoading ? (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ width: '48px', height: '48px', border: '4px solid #f3f3f3', borderTop: '4px solid #0D5C46', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                  <span style={{ color: '#64748b', fontSize: '14px', fontWeight: 600 }}>Loading visitor details...</span>
                </div>
              ) : error ? (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px', flexDirection: 'column', gap: '16px', textAlign: 'center', padding: '24px' }}>
                  <IonIcon icon={alertCircleOutline} style={{ color: '#ef4444', fontSize: '48px' }} />
                  <span style={{ color: '#1e293b', fontSize: '16px', fontWeight: 700 }}>{error}</span>
                  <button 
                    type="button"
                    onClick={() => history.push(ROUTES.BRANCH_ADMIN.VISITOR_LOG)}
                    className="sa-btn sa-btn--primary"
                  >
                    Back to Visitor Logs
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSaveRecord} style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
                  
                  {/* 2-Column Grid Layout matching patient page styling */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '28px', alignItems: 'start' }}>
                    
                    {/* LEFT COLUMN: Basic Information, Visit & Identity */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
                      
                      {/* Card 1: Basic Information */}
                      <div style={customStyles.formCard}>
                        <div>
                          <div style={customStyles.subHeader}>
                            <IonIcon icon={personOutline} style={customStyles.subHeaderIcon} />
                            <span>Basic Information</span>
                          </div>
                          
                          <div className="st-form" style={{ gap: '20px' }}>
                            <div className="st-form-group">
                              <label style={customStyles.label}>FULL NAME *</label>
                              <input 
                                type="text" 
                                name="name" 
                                style={customStyles.grayInput}
                                value={formData.name} 
                                onChange={handleInputChange} 
                                required 
                                placeholder="Enter Full Name"
                              />
                            </div>

                            <div className="st-form-row">
                              <div className="st-form-group">
                                <label style={customStyles.label}>CONTACT NUMBER *</label>
                                <input 
                                  type="tel" 
                                  name="mobile" 
                                  style={customStyles.grayInput}
                                  value={formData.mobile} 
                                  onChange={handleInputChange} 
                                  required 
                                  placeholder="Enter Contact Number"
                                />
                              </div>
                            </div>

                            <div className="st-form-group">
                              <label style={customStyles.label}>REFERENCE SOURCE *</label>
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px', marginTop: '6px' }}>
                                {['Family', 'Online', 'Advertisement', 'Friend', 'Healing Camp'].map((option) => (
                                  <label key={option} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', color: '#1e293b', fontWeight: 600 }}>
                                    <input 
                                      type="checkbox" 
                                      checked={referenceSource.includes(option)}
                                      onChange={(e) => {
                                        if (e.target.checked) {
                                          setReferenceSource(prev => [...prev, option]);
                                        } else {
                                          setReferenceSource(prev => prev.filter(item => item !== option));
                                        }
                                      }}
                                      style={{
                                        width: '16px',
                                        height: '16px',
                                        cursor: 'pointer',
                                        accentColor: '#0D5C46',
                                      }}
                                    />
                                    <span>{option}</span>
                                  </label>
                                ))}
                              </div>
                            </div>

                            <div className="st-form-group">
                              <label style={customStyles.label}>REFERRAL NAME</label>
                              <input 
                                type="text" 
                                name="referralName" 
                                style={customStyles.grayInput}
                                value={formData.referralName} 
                                onChange={handleInputChange} 
                                placeholder="Enter Referral Name (if referred)"
                              />
                            </div>

                            <div className="st-form-group" style={{ maxWidth: '50%' }}>
                              <label style={customStyles.label}>GENDER</label>
                              <select name="gender" className="st-input" style={customStyles.grayInput} value={formData.gender} onChange={handleInputChange}>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                              </select>
                            </div>
                          </div>

                        </div>
                      </div>

                      {/* Card 2: Visit & Identity */}
                      <div style={customStyles.formCard}>
                        <div>
                          <div style={customStyles.subHeader}>
                            <IonIcon icon={businessOutline} style={customStyles.subHeaderIcon} />
                            <span>Visit &amp; Identity</span>
                          </div>
                          
                          <div className="st-form" style={{ gap: '20px' }}>
                            <div className="st-form-row">
                              <div className="st-form-group">
                                <label style={customStyles.label}>VISITOR TYPE</label>
                                <select name="visitorType" className="st-input" style={customStyles.grayInput} value={formData.visitorType} onChange={handleInputChange}>
                                  <option value="Walk-in">Walk-in</option>
                                  <option value="Meditation">Meditation</option>
                                  <option value="Session">Session</option>
                                  <option value="Camp">Camp</option>
                                  <option value="Healer">Healer</option>
                                  <option value="Conversion">Conversion</option>
                                </select>
                              </div>
                            </div>

                            <div className="st-form-group">
                              <label style={customStyles.label}>ID PROOF (AADHAR)</label>
                              <input 
                                type="text" 
                                name="idProof" 
                                style={customStyles.grayInput}
                                value={formData.idProof} 
                                onChange={handleInputChange} 
                                placeholder="Enter ID Proof (e.g. Aadhar)"
                              />
                            </div>

                            <div className="st-form-group">
                              <label style={customStyles.label}>ADDRESS</label>
                              <textarea 
                                name="address" 
                                rows={3} 
                                style={customStyles.grayTextarea}
                                value={formData.address} 
                                onChange={handleInputChange} 
                                placeholder="Enter Home Address"
                              />
                            </div>
                          </div>

                        </div>
                      </div>

                    </div>

                    {/* RIGHT COLUMN: Visit Summary */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
                      
                      {/* Card 3: Visit Summary */}
                      <div style={customStyles.formCard}>
                        <div>
                          <div style={customStyles.subHeader}>
                            <IonIcon icon={calendarOutline} style={customStyles.subHeaderIcon} />
                            <span>Visit Summary</span>
                          </div>
                          
                          <div className="st-form" style={{ gap: '20px' }}>
                            <div className="st-form-group">
                              <label style={customStyles.label}>ENTRY DATE</label>
                              <input 
                                type="date" 
                                name="entryDate" 
                                style={customStyles.grayInput}
                                value={formData.entryDate} 
                                onChange={handleInputChange} 
                              />
                            </div>

                            <div className="st-form-group">
                              <label style={customStyles.label}>NOTES</label>
                              <textarea 
                                name="notes" 
                                rows={5} 
                                style={customStyles.grayTextarea}
                                value={formData.notes} 
                                onChange={handleInputChange} 
                                placeholder="Enter visit remarks or notes..."
                              />
                            </div>
                          </div>

                        </div>
                      </div>

                    </div>

                  </div>

                  {/* Footer Buttons Block */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', marginTop: '12px', marginBottom: '28px' }}>
                    <button 
                      type="button" 
                      onClick={() => history.push(ROUTES.BRANCH_ADMIN.VISITOR_LOG)} 
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
                      Cancel
                    </button>

                    <button 
                      type="submit" 
                      disabled={isSaving}
                      style={{
                        background: '#0D5C46',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '10px 28px',
                        fontSize: '14px',
                        fontWeight: 600,
                        color: '#ffffff',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        opacity: isSaving ? 0.7 : 1,
                      }}
                    >
                      {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>

                </form>
              )}
            </div>

          </main>

        </div>
      </IonContent>

      {/* Success Modal */}
      {showSuccessToast && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)' }}>
          <div className="db-corp-card" style={{ maxWidth: '420px', width: '90%', padding: '32px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', animation: 'scaleUp 0.3s ease-out' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <IonIcon icon={checkmarkCircleOutline} style={{ color: '#10b981', fontSize: '40px' }} />
            </div>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#1e293b', margin: '0 0 6px 0' }}>Visitor Updated Successfully</h3>
              <p style={{ fontSize: '13px', color: '#64748b', margin: '0', lineHeight: 1.5 }}>
                Visitor record for <strong>{formData.name}</strong> has been updated successfully.
              </p>
            </div>

            <button type="button" onClick={closeAndRedirect} className="sa-btn sa-btn--primary" style={{ width: '100%', justifyContent: 'center', margin: 0 }}>
              Back to Visitor Logs
            </button>
          </div>
        </div>
      )}
    </IonPage>
  );
}
