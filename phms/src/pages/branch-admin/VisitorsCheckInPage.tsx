import React, { useState } from 'react';
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
  calendarOutline,
  documentTextOutline,
  checkmarkCircleOutline,
  closeOutline,
  businessOutline,
  shieldCheckmarkOutline,
} from 'ionicons/icons';
import { useHistory, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';
import { ROUTES } from '../../constants/routes.constant';
import './branch-admin.css';
import './visitor-log.css';

export default function BAVisitorCheckInPage() {
  const history = useHistory();
  const location = useLocation<{ from?: string }>();
  const { user } = useAuthStore();
  const isBranchAdmin = user?.role === 'BRANCH_ADMIN';

  // Current Date display
  const formattedDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Form states initialized as empty
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    gender: 'Male',
    visitorType: 'Session',
    branchLocation: '',
    idProof: '',
    address: '',
    entryDate: '',
    notes: '',
  });

  // Success alert/modal control
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [newVisitorId, setNewVisitorId] = useState('');

  // Handle Input Changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle Submit
  const handleSaveRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Full Name is required.');
      return;
    }
    if (!formData.mobile.trim()) {
      alert('Contact Number is required.');
      return;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      alert('A valid email address is required.');
      return;
    }

    // Load existing visitor records from localStorage
    const cached = localStorage.getItem('phms_visitor_logs');
    let currentVisitors: any[] = [];
    if (cached) {
      try {
        currentVisitors = JSON.parse(cached);
      } catch (err) {
        currentVisitors = [];
      }
    }

    // Generate random visitor pass ID
    const generatedId = `PHMS-V-${Math.floor(10000 + Math.random() * 90000)}`;
    setNewVisitorId(generatedId);

    // Sequential code helper for VIS-XXXX
    const maxNum = currentVisitors.reduce((max, v) => {
      const match = v.visitorId?.match(/VIS-(\d+)/);
      return match ? Math.max(max, parseInt(match[1], 10)) : max;
    }, 0);
    const sequentialVisId = `VIS-${String(maxNum + 1).padStart(4, '0')}`;

    const now = new Date();
    const formattedTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newRec = {
      id: Date.now(),
      visitorId: sequentialVisId,
      name: formData.name,
      type: formData.visitorType,
      contact: formData.mobile,
      entry: formattedTime,
      exit: '—',
      duration: '5m',
      status: 'Inside' as const,
      dateStr: formData.entryDate || now.toISOString().split('T')[0],
    };

    const updatedList = [newRec, ...currentVisitors];
    localStorage.setItem('phms_visitor_logs', JSON.stringify(updatedList));

    setShowSuccessToast(true);
  };

  const fromPath = location.state?.from || ROUTES.BRANCH_ADMIN.VISITOR_LOG;

  const closeAndRedirect = () => {
    setShowSuccessToast(false);
    history.push(fromPath);
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
                  Access Denied. Visitor check-in logging is restricted exclusively to authorized Branch Admin users.
                </p>
              </div>
            </div>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  // Visual layout CSS blocks matching premium look
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
                  onClick={() => history.push(fromPath)} 
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
                  <h1 style={{ margin: 0, color: '#0d5c46', fontSize: '20px', fontWeight: 800 }}>Visitor Check-In Log</h1>
                  <p style={{ margin: 0, color: '#64748b', fontSize: '13px' }}>Pranic Healing Management System • {formattedDate}</p>
                </div>
              </div>
            </header>

            {/* Main Form Workspace */}
            <div className="db-hc-layout" style={{ padding: '28px' }}>
              
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
                              <label style={customStyles.label}>EMAIL ADDRESS *</label>
                              <input 
                                type="email" 
                                name="email" 
                                style={customStyles.grayInput}
                                value={formData.email} 
                                onChange={handleInputChange} 
                                required 
                                placeholder="Enter Email Address"
                              />
                            </div>

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
                              </select>
                            </div>

                            {/* <div className="st-form-group">
                              <label style={customStyles.label}>BRANCH LOCATION</label>
                              <input 
                                type="text" 
                                name="branchLocation" 
                                style={customStyles.grayInput}
                                value={formData.branchLocation} 
                                onChange={handleInputChange} 
                                placeholder="Enter Branch Location"
                              />
                            </div> */}
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
                    onClick={() => history.push(fromPath)} 
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
                    }}
                  >
                    Save Record
                  </button>
                </div>

              </form>

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
              <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#1e293b', margin: '0 0 6px 0' }}>Visitor Logged Successfully</h3>
              <p style={{ fontSize: '13px', color: '#64748b', margin: '0', lineHeight: 1.5 }}>
                Entry pass for <strong>{formData.name}</strong> has been registered and initialized in the gate log.
              </p>
            </div>
            
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '10px 16px', borderRadius: '8px', fontSize: '13px', width: '100%' }}>
              <span style={{ color: '#64748b', fontWeight: 600 }}>GATE VISIT PASS ID:</span>
              <strong style={{ color: '#0D5C46', display: 'block', fontSize: '15px', marginTop: '2px', fontFamily: 'monospace' }}>{newVisitorId}</strong>
            </div>

            <button onClick={closeAndRedirect} className="sa-btn sa-btn--primary" style={{ width: '100%', justifyContent: 'center', margin: 0 }}>
              Proceed to Visitor Logs
            </button>
          </div>
        </div>
      )}
    </IonPage>
  );
}