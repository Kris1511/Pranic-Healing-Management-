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
  lockClosedOutline,
  ribbonOutline,
  documentTextOutline,
  cloudUploadOutline,
  checkmarkCircleOutline,
  closeCircleOutline,
  trashOutline,
  cameraOutline,
  shieldCheckmarkOutline,
} from 'ionicons/icons';
import { useHistory, useParams } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';
import { ROUTES } from '../../constants/routes.constant';
import { getHealerById, updateHealer } from '../../api/healer.api';
import './branch-admin.css';

export default function BAEditHealerPage() {
  const history = useHistory();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthStore();
  const isBranchAdmin = user?.role === 'BRANCH_ADMIN';

  // Current Date display
  const formattedDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const getPhotoUrl = (path: string | null) => {
    if (!path) return null;
    if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) return path;
    const baseUrl = import.meta.env.VITE_API_BASE_URL 
      ? import.meta.env.VITE_API_BASE_URL.replace(/\/api\/?$/, '') 
      : 'http://localhost:3000';
    return `${baseUrl}/${path}`;
  };

  const [healer, setHealer] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Form states pre-filled with loaded healer data
  const [formData, setFormData] = useState({
    name: '',
    gender: '',
    dob: '',
    phone: '',
    email: '',
    address: '',
    status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE',
    certificationLevel: '',
    specialization: '',
    experience: 0,
    bio: '',
  });

  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [profilePhotoFile, setProfilePhotoFile] = useState<File | null>(null);

  const [idProofFile, setIdProofFile] = useState<File | null>(null);
  const [existingIdProof, setExistingIdProof] = useState<string | null>(null);
  const [uploadedIdProofMeta, setUploadedIdProofMeta] = useState<{ name: string; size: string } | null>(null);

  const [certificationFile, setCertificationFile] = useState<File | null>(null);
  const [existingCertification, setExistingCertification] = useState<string | null>(null);
  const [uploadedCertificationMeta, setUploadedCertificationMeta] = useState<{ name: string; size: string } | null>(null);

  const [showSuccessToast, setShowSuccessToast] = useState(false);

  // Refs for file inputs
  const photoInputRef = React.useRef<HTMLInputElement>(null);
  const idProofInputRef = React.useRef<HTMLInputElement>(null);
  const certificationInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchHealer = async () => {
      try {
        setLoading(true);
        const response = await getHealerById(id);
        const h = response.data || response;
        if (h) {
          setHealer(h);
          setFormData({
            name: h.name || '',
            gender: h.gender || 'Female',
            dob: h.dob || '',
            phone: h.mobile || h.phone || '',
            email: h.email || '',
            address: h.address || '',
            status: h.status?.toUpperCase() === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE',
            certificationLevel: h.certLevel || 'Associate Healer',
            specialization: typeof h.specialization === 'string' 
              ? h.specialization 
              : (Array.isArray(h.specialization) && h.specialization.length > 0 ? h.specialization[0] : 'Stress Healing'),
            experience: h.experience || 0,
            bio: h.bio || '',
          });
          if (h.profilePhoto) {
            setProfilePhoto(h.profilePhoto);
          }
          if (h.idProof) {
            setExistingIdProof(h.idProof);
          }
          if (h.certification) {
            setExistingCertification(h.certification);
          }
        }
      } catch (error) {
        console.error('Error fetching healer details for edit:', error);
      } finally {
        setLoading(false);
      }
    };
    if (id && isBranchAdmin) {
      fetchHealer();
    }
  }, [id, isBranchAdmin]);

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
                  Access Denied. Healer profile editing is restricted exclusively to authorized Branch Admin users.
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
              The requested healer record could not be found for editing.
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

  // Handle Input Changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Photo Upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setProfilePhotoFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setProfilePhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // File Upload
  const handleFileChange = (
    field: "idProof" | "certification",
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
      if (field === "idProof") {
        setIdProofFile(file);
        setUploadedIdProofMeta({ name: file.name, size: `${sizeMB} MB` });
      } else {
        setCertificationFile(file);
        setUploadedCertificationMeta({ name: file.name, size: `${sizeMB} MB` });
      }
    }
  };

  // Clear Uploaded File
  const handleClearFile = (
    field: "idProof" | "certification",
    e: React.MouseEvent,
  ) => {
    e.stopPropagation();
    if (field === "idProof") {
      setIdProofFile(null);
      setExistingIdProof(null);
      setUploadedIdProofMeta(null);
      if (idProofInputRef.current) idProofInputRef.current.value = "";
    } else {
      setCertificationFile(null);
      setExistingCertification(null);
      setUploadedCertificationMeta(null);
      if (certificationInputRef.current) certificationInputRef.current.value = "";
    }
  };

  // Handle Save
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Healer Full Name is required.');
      return;
    }
    if (!formData.phone.trim()) {
      alert('Phone Number is required.');
      return;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      alert('A valid email address is required.');
      return;
    }

    // DEBUG LOGS
    console.log("[DEBUG] Updating Healer Profile. ID:", id);
    console.log("[DEBUG] Frontend Form Data state:", formData);

    try {
      const data = new FormData();
      Object.keys(formData).forEach((key) => {
        if (key === 'bio') {
          console.log("[DEBUG] Skipping key 'bio' from payload as it is not allowed in Joi schema.");
          return;
        }

        let val = (formData as any)[key];
        if (val !== undefined && val !== null) {
          if (key === 'certificationLevel') {
            console.log("[DEBUG] Mapping certificationLevel -> certLevel:", val);
            data.append('certLevel', val);
          } else if (key === 'phone') {
            console.log("[DEBUG] Mapping phone -> mobile:", val);
            data.append('mobile', val);
          } else if (key === 'status') {
            // Convert status case for backend Joi validation
            const statusVal = val === 'ACTIVE' ? 'Active' : (val === 'INACTIVE' ? 'Inactive' : val);
            console.log("[DEBUG] Mapping status ->", statusVal);
            data.append('status', statusVal);
          } else {
            console.log(`[DEBUG] Appending field ${key} ->`, val);
            data.append(key, val);
          }
        }
      });

      // Handle profile photo
      if (profilePhotoFile) {
        console.log("[DEBUG] Appending new profilePhoto file:", profilePhotoFile.name);
        data.append("profilePhoto", profilePhotoFile);
      } else if (!profilePhoto) {
        console.log("[DEBUG] Cleared profilePhoto");
        data.append("profilePhoto", "");
      }

      // Handle ID Proof
      if (idProofFile) {
        console.log("[DEBUG] Appending new idProof file:", idProofFile.name);
        data.append("idProof", idProofFile);
      } else if (!existingIdProof) {
        console.log("[DEBUG] Cleared idProof");
        data.append("idProof", "");
      }

      // Handle Certification
      if (certificationFile) {
        console.log("[DEBUG] Appending new certification file:", certificationFile.name);
        data.append("certification", certificationFile);
      } else if (!existingCertification) {
        console.log("[DEBUG] Cleared certification");
        data.append("certification", "");
      }

      // Log exact keys and values of FormData
      const formDataObj: any = {};
      data.forEach((value, key) => {
        formDataObj[key] = value instanceof File ? `File: ${value.name}` : value;
      });
      console.log("[DEBUG] Exact FormData payload being sent:", formDataObj);
      console.log("[DEBUG] Request headers: Content-Type: multipart/form-data");

      await updateHealer(id, data);
      setShowSuccessToast(true);
    } catch (error: any) {
      console.error('[DEBUG] Error updating healer profile (Full Error):', error);
      if (error.response) {
        console.error('[DEBUG] Backend response status:', error.response.status);
        console.error('[DEBUG] Backend error details (error.response.data):', error.response.data);
        alert(`Failed to update healer profile. Error: ${error.response.data?.message || 'Bad Request (400)'}`);
      } else {
        alert('Failed to update healer profile. Please check your network connection.');
      }
    }
  };

  const closeAndRedirect = () => {
    setShowSuccessToast(false);
    history.push(ROUTES.BRANCH_ADMIN.HEALERS);
  };

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
    dashedUpload: {
      background: '#f8fafc',
      border: '1px dashed #cbd5e1',
      borderRadius: '8px',
      height: '38px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      width: '100%',
      transition: 'all 0.2s ease',
    },
    dashedUploadActive: {
      background: '#f0fdf4',
      border: '1px solid #a7f3d0',
      borderRadius: '8px',
      height: '38px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 12px',
      cursor: 'pointer',
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
                  <h1 className="db-corp-page-title" style={{ color: '#0d5c46', fontWeight: 800, margin: 0, fontSize: '20px', lineHeight: 1.2 }}>Edit Healer Profile</h1>
                  <p className="db-corp-page-subtitle" style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0 0', lineHeight: 1.2 }}>Pranic Healing Management System • {formattedDate}</p>
                </div>
              </div>
              
              <div className="db-corp-navbar-right" style={{ display: 'flex', alignItems: 'center' }}>
                <div className="db-corp-badge-dot" style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', position: 'relative', marginRight: '6px' }} />
                <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Editing Healer Profile: {healer?.healerId || healer?.id || id}</span>
              </div>
            </header>

            {/* Main Form Workspace */}
            <div className="db-hc-layout" style={{ padding: '28px' }}>
              
              <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
                
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
                        
                        <div className="st-form" style={{ gap: '18px' }}>
                          
                          {/* Photo Upload Section */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
                            <div style={{ position: 'relative', width: '64px', height: '64px', borderRadius: '50%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: '2px solid #cbd5e1' }}>
                              {profilePhoto ? (
                                <img src={getPhotoUrl(profilePhoto) || ''} alt="Healer avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              ) : (
                                <span style={{ fontSize: '24px', fontWeight: 700, color: '#475569' }}>{healer?.initials || 'HE'}</span>
                              )}
                            </div>
                            <label className="sa-btn sa-btn--outline sa-btn--sm" style={{ cursor: 'pointer', margin: 0, padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
                              <IonIcon icon={cameraOutline} />
                              Change Photo
                              <input ref={photoInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhotoUpload} />
                            </label>
                          </div>

                          <div className="st-form-group">
                            <label style={customStyles.label}>HEALER FULL NAME *</label>
                            <input 
                              type="text" 
                              name="name" 
                              style={customStyles.grayInput}
                              value={formData.name} 
                              onChange={handleInputChange} 
                              required 
                            />
                          </div>

                          <div className="st-form-row">
                            <div className="st-form-group">
                              <label style={customStyles.label}>GENDER</label>
                              <select name="gender" className="st-input" style={customStyles.grayInput} value={formData.gender} onChange={handleInputChange}>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                              </select>
                            </div>

                            <div className="st-form-group">
                              <label style={customStyles.label}>DATE OF BIRTH</label>
                              <input 
                                type="date" 
                                name="dob" 
                                style={customStyles.grayInput}
                                value={formData.dob} 
                                onChange={handleInputChange} 
                              />
                            </div>
                          </div>

                          <div className="st-form-row">
                            <div className="st-form-group">
                              <label style={customStyles.label}>PHONE NUMBER *</label>
                              <input 
                                type="tel" 
                                name="phone" 
                                style={customStyles.grayInput}
                                value={formData.phone} 
                                onChange={handleInputChange} 
                                required 
                              />
                            </div>

                            <div className="st-form-group">
                              <label style={customStyles.label}>EMAIL ADDRESS *</label>
                              <input 
                                type="email" 
                                name="email" 
                                style={customStyles.grayInput}
                                value={formData.email} 
                                onChange={handleInputChange} 
                                required 
                              />
                            </div>
                          </div>

                          <div className="st-form-group">
                            <label style={customStyles.label}>ADDRESS</label>
                            <textarea 
                              name="address" 
                              rows={3} 
                              style={customStyles.grayTextarea}
                              value={formData.address} 
                              onChange={handleInputChange} 
                            />
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
                        
                        <div className="st-form" style={{ gap: '18px' }}>
                          <div className="st-form-row">
                            <div className="st-form-group">
                              <label style={customStyles.label}>CERTIFICATION LEVEL</label>
                              <select name="certificationLevel" className="st-input" style={customStyles.grayInput} value={formData.certificationLevel} onChange={handleInputChange}>
                                <option value="Advanced Healer">Advanced Healer</option>
                                <option value="Associate Healer">Associate Healer</option>
                                <option value="Certified Healer">Certified Healer</option>
                                <option value="Senior Healer">Senior Healer</option>
                              </select>
                            </div>

                            <div className="st-form-group">
                              <label style={customStyles.label}>AREA OF SPECIALIZATION</label>
                              <select 
                                name="specialization" 
                                style={{ ...customStyles.grayInput, color: '#1e293b' }}
                                value={formData.specialization} 
                                onChange={handleInputChange}
                              >
                                <option value="Stress Healing">Stress Healing</option>
                                <option value="Energy Cleansing">Energy Cleansing</option>
                                <option value="Aura Cleansing">Aura Cleansing</option>
                                <option value="Chakra Balancing">Chakra Balancing</option>
                                <option value="Grief Therapy">Grief Therapy</option>
                                <option value="PTSD Care">PTSD Care</option>
                              </select>
                            </div>
                          </div>

                          <div className="st-form-row">
                            <div className="st-form-group">
                              <label style={customStyles.label}>YEARS OF EXPERIENCE</label>
                              <input 
                                type="number" 
                                name="experience" 
                                style={customStyles.grayInput}
                                value={formData.experience} 
                                onChange={handleInputChange} 
                                min="0"
                              />
                            </div>
                          </div>

                          <div className="st-form-group">
                            <label style={customStyles.label}>BIO SUMMARY</label>
                            <textarea 
                              name="bio" 
                              rows={3} 
                              style={customStyles.grayTextarea}
                              value={formData.bio} 
                              onChange={handleInputChange} 
                            />
                          </div>
                        </div>

                      </div>
                    </div>

                  </div>

                  {/* RIGHT COLUMN: Account Status, Verification */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
                    
                    {/* Card 3: Account Status */}
                    <div style={customStyles.formCard}>
                      <div>
                        <div style={customStyles.subHeader}>
                          <IonIcon icon={lockClosedOutline} style={customStyles.subHeaderIcon} />
                          <span>Account Status</span>
                        </div>
                        
                        <div className="st-form" style={{ gap: '18px' }}>
                          <div className="st-form-group">
                            <label style={customStyles.label}>ACCOUNT STATUS</label>
                            <div style={{ display: 'flex', gap: '12px' }}>
                              
                              <label style={{ flex: 1, border: formData.status === 'ACTIVE' ? '2px solid #0D5C46' : '1px solid #cbd5e1', background: formData.status === 'ACTIVE' ? '#f0fdf4' : 'white', padding: '10px', borderRadius: '8px', cursor: 'pointer', display: 'block', textAlign: 'center' }}>
                                <input 
                                  type="radio" 
                                  name="status" 
                                  value="ACTIVE" 
                                  checked={formData.status === 'ACTIVE'} 
                                  onChange={() => setFormData((prev) => ({ ...prev, status: 'ACTIVE' }))} 
                                  style={{ display: 'none' }}
                                />
                                <span style={{ fontWeight: 700, fontSize: '13px', color: '#0d5c46' }}>ACTIVE</span>
                              </label>

                              <label style={{ flex: 1, border: formData.status === 'INACTIVE' ? '2px solid #dc2626' : '1px solid #cbd5e1', background: formData.status === 'INACTIVE' ? '#fef2f2' : 'white', padding: '10px', borderRadius: '8px', cursor: 'pointer', display: 'block', textAlign: 'center' }}>
                                <input 
                                  type="radio" 
                                  name="status" 
                                  value="INACTIVE" 
                                  checked={formData.status === 'INACTIVE'} 
                                  onChange={() => setFormData((prev) => ({ ...prev, status: 'INACTIVE' }))} 
                                  style={{ display: 'none' }}
                                />
                                <span style={{ fontWeight: 700, fontSize: '13px', color: '#dc2626' }}>INACTIVE</span>
                              </label>

                            </div>
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
                        
                        <div className="st-form" style={{ gap: '18px' }}>
                          {/* 1. ID Proof */}
                          <div className="st-form-group">
                            <label style={customStyles.label}>ID PROOF FILE</label>
                            {uploadedIdProofMeta ? (
                              <div style={customStyles.dashedUploadActive}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <IonIcon icon={checkmarkCircleOutline} style={{ color: '#10b981' }} />
                                  <span style={{ fontSize: '12px', color: '#065f46', fontWeight: 600 }}>{uploadedIdProofMeta.name} (New)</span>
                                </div>
                                <IonIcon icon={trashOutline} onClick={(e) => handleClearFile("idProof", e)} style={{ color: '#ef4444', fontSize: '14px', cursor: 'pointer' }} />
                              </div>
                            ) : existingIdProof ? (
                              <div style={{ ...customStyles.dashedUploadActive, background: '#f8fafc', border: '1px solid #cbd5e1' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <IonIcon icon={checkmarkCircleOutline} style={{ color: '#0d5c46' }} />
                                  <span style={{ fontSize: '12px', color: '#1e293b', fontWeight: 600 }}>{existingIdProof.split('/').pop()}</span>
                                </div>
                                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                  <IonIcon 
                                    icon={documentTextOutline} 
                                    style={{ color: '#0d5c46', fontSize: '16px', cursor: 'pointer' }} 
                                    onClick={() => {
                                      const url = getPhotoUrl(existingIdProof);
                                      if (url) window.open(url, '_blank');
                                    }}
                                  />
                                  <IonIcon icon={trashOutline} onClick={(e) => handleClearFile("idProof", e)} style={{ color: '#ef4444', fontSize: '14px', cursor: 'pointer' }} />
                                </div>
                              </div>
                            ) : (
                              <label style={customStyles.dashedUpload}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <IonIcon icon={cloudUploadOutline} style={{ color: '#94a3b8', fontSize: '16px' }} />
                                  <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>Upload ID Proof</span>
                                </div>
                                <input ref={idProofInputRef} type="file" style={{ display: 'none' }} onChange={(e) => handleFileChange("idProof", e)} />
                              </label>
                            )}
                          </div>

                          {/* 2. Certification */}
                          <div className="st-form-group">
                            <label style={customStyles.label}>CERTIFICATION FILE</label>
                            {uploadedCertificationMeta ? (
                              <div style={customStyles.dashedUploadActive}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <IonIcon icon={checkmarkCircleOutline} style={{ color: '#10b981' }} />
                                  <span style={{ fontSize: '12px', color: '#065f46', fontWeight: 600 }}>{uploadedCertificationMeta.name} (New)</span>
                                </div>
                                <IonIcon icon={trashOutline} onClick={(e) => handleClearFile("certification", e)} style={{ color: '#ef4444', fontSize: '14px', cursor: 'pointer' }} />
                              </div>
                            ) : existingCertification ? (
                              <div style={{ ...customStyles.dashedUploadActive, background: '#f8fafc', border: '1px solid #cbd5e1' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <IonIcon icon={checkmarkCircleOutline} style={{ color: '#0d5c46' }} />
                                  <span style={{ fontSize: '12px', color: '#1e293b', fontWeight: 600 }}>{existingCertification.split('/').pop()}</span>
                                </div>
                                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                  <IonIcon 
                                    icon={documentTextOutline} 
                                    style={{ color: '#0d5c46', fontSize: '16px', cursor: 'pointer' }} 
                                    onClick={() => {
                                      const url = getPhotoUrl(existingCertification);
                                      if (url) window.open(url, '_blank');
                                    }}
                                  />
                                  <IonIcon icon={trashOutline} onClick={(e) => handleClearFile("certification", e)} style={{ color: '#ef4444', fontSize: '14px', cursor: 'pointer' }} />
                                </div>
                              </div>
                            ) : (
                              <label style={customStyles.dashedUpload}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <IonIcon icon={cloudUploadOutline} style={{ color: '#94a3b8', fontSize: '16px' }} />
                                  <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>Upload Certification</span>
                                </div>
                                <input ref={certificationInputRef} type="file" style={{ display: 'none' }} onChange={(e) => handleFileChange("certification", e)} />
                              </label>
                            )}
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
                    Save Modifications
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
              <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#1e293b', margin: '0 0 6px 0' }}>Profile Updated</h3>
              <p style={{ fontSize: '13px', color: '#64748b', margin: '0', lineHeight: 1.5 }}>
                Professional records for <strong>{formData.name}</strong> have been successfully updated in the database.
              </p>
            </div>

            <button onClick={closeAndRedirect} className="sa-btn sa-btn--primary" style={{ width: '100%', justifyContent: 'center', margin: 0 }}>
              Return to Healers Registry
            </button>
          </div>
        </div>
      )}
    </IonPage>
  );
}
