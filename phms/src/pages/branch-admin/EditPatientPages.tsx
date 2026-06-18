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
  locationOutline,
  alertCircleOutline,
  medkitOutline,
  peopleOutline,
  documentTextOutline,
  cloudUploadOutline,
  checkmarkCircleOutline,
  trashOutline,
  shieldCheckmarkOutline,
} from 'ionicons/icons';
import { useHistory, useParams } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';
import { ROUTES } from '../../constants/routes.constant';
import { Patient } from './PatientsPage';
import { getPatientById, updatePatient } from '../../api/patient.api';
import { getHealers } from '../../api/healer.api';
import './branch-admin.css';
export default function EditPatientPages() {
  const { id } = useParams<{ id: string }>();
  const history = useHistory();
  const { user } = useAuthStore();
  const isBranchAdmin = user?.role === 'BRANCH_ADMIN';

  // Current Date display
  const formattedDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Form states matching RegisterPatientPage form fields
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    email: '',
    gender: '' as 'Male' | 'Female' | 'Other' | '',
    dateOfBirth: '',
    age: '',
    bloodGroup: '',
    occupation: '',
    emergencyContact: '',
    address: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
    status: 'Active' as 'Active' | 'On Hold' | 'Completed' | 'Inactive',
    medicalHistory: '',
    treatmentType: '',
    assignedHealer: '',
    password: '',
    accountStatus: 'Active' as 'Active' | 'Inactive',
  });

  // Uploaded files mock state
  const [uploadedFiles, setUploadedFiles] = useState<{ [key: string]: { name: string; size: string } | null }>({
    reports: null,
    labResults: null,
    prescriptions: null,
    scanImages: null,
    consultationNotes: null,
    idProofs: null,
    healingRecords: null,
  });

  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [savedPatientId, setSavedPatientId] = useState('');

  const [healersList, setHealersList] = useState<any[]>([]);
  const [patientHealer, setPatientHealer] = useState<any>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchHealers = async () => {
      try {
        const response = await getHealers({ status: 'active' });
        // getHealers() returns { success: boolean, data: Healer[] }
        const apiHealers = response?.data ?? (Array.isArray(response) ? response : []);
        if (isMounted) {
          setHealersList(apiHealers);
        }
      } catch (error) {
        console.error('[EditPatient] Error fetching healers:', error);
      }
    };
    fetchHealers();

    const intervalId = setInterval(fetchHealers, 3000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, []);

  // Load patient data from the database and populate all form fields
  useEffect(() => {
    const fetchPatient = async () => {
      try {
        console.log('[EditPatient] Fetching patient ID:', decodeURIComponent(id));
        const response = await getPatientById(decodeURIComponent(id));
        // API returns { success: true, data: { ...patient } }
        const p = response.data ?? response;
        console.log('[EditPatient] Patient data received from DB:', p);

        if (p) {
          const dob = p.dob || '';
          const computedAge = p.age ? String(p.age) : calculateAge(dob);

          setFormData({
            name: p.name || '',
            mobile: p.phone || '',
            email: p.email || '',
            gender: (p.gender as any) || '',
            dateOfBirth: dob,
            age: computedAge,
            bloodGroup: p.bloodGroup || '',
            occupation: p.occupation || '',
            emergencyContact: p.emergencyContact || '',
            address: p.address || '',
            addressLine1: p.address || '',
            addressLine2: '',
            city: '',
            state: '',
            pincode: '',
            status: (p.status as any) || 'Active',
            medicalHistory: p.medicalHistory || '',
            treatmentType: p.treatmentType || '',
            // healerId UUID from DB maps directly to the healer <select> value
            assignedHealer: p.healerId || '',
            password: '',
            accountStatus: p.status?.toLowerCase() === 'inactive' ? 'Inactive' : 'Active',
          });

          if (p.healer) {
            setPatientHealer(p.healer);
          }

          console.log('[EditPatient] Form populated — DOB:', dob, '| Age:', computedAge,
            '| Blood Group:', p.bloodGroup, '| Treatment:', p.treatmentType,
            '| Healer ID:', p.healerId, '| Emergency Contact:', p.emergencyContact);
        }
      } catch (error) {
        console.error('[EditPatient] Error fetching patient details:', error);
      }
    };
    fetchPatient();
  }, [id]);

  const calculateAge = (dobString: string) => {
    if (!dobString) return "";
    const today = new Date();
    const birthDate = new Date(dobString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age >= 0 ? String(age) : "0";
  };

  // Handle Input Changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === "dateOfBirth") {
      const calculatedAge = calculateAge(value);
      setFormData((prev) => ({
        ...prev,
        dateOfBirth: value,
        age: calculatedAge,
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Simulate File Upload
  const handleFileChange = (field: string, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
      setUploadedFiles((prev) => ({
        ...prev,
        [field]: { name: file.name, size: `${sizeMB} MB` },
      }));
    }
  };

  // Clear Uploaded File
  const handleClearFile = (field: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setUploadedFiles((prev) => ({
      ...prev,
      [field]: null,
    }));
  };

  const handleClearForm = () => {
    setFormData({
      name: '',
      mobile: '',
      email: '',
      gender: '',
      dateOfBirth: '',
      age: '',
      bloodGroup: '',
      occupation: '',
      emergencyContact: '',
      address: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      pincode: '',
      status: 'Active',
      medicalHistory: '',
      treatmentType: '',
      assignedHealer: '',
      password: '',
      accountStatus: 'Active',
    });
    setUploadedFiles({
      reports: null,
      labResults: null,
      prescriptions: null,
      scanImages: null,
      consultationNotes: null,
      idProofs: null,
      healingRecords: null,
    });
  };

  const handleRegeneratePassword = () => {
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    setFormData((prev) => ({
      ...prev,
      password: `PHMS-${randomDigits}`,
    }));
  };

  // Handle Submit
  const handleSaveRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Patient Full Name is required.');
      return;
    }
    if (!formData.mobile.trim()) {
      alert('Phone Number is required.');
      return;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      alert('A valid email address is required.');
      return;
    }

    // Combine address components
    const fullAddress = [
      formData.addressLine1.trim(),
      formData.addressLine2.trim(),
      formData.city.trim(),
      formData.state.trim(),
    ].filter(Boolean).join(', ') + (formData.pincode.trim() ? ` - ${formData.pincode.trim()}` : '');

    try {
      const payload = {
        name: formData.name,
        phone: formData.mobile,
        email: formData.email,
        gender: formData.gender,
        dob: formData.dateOfBirth || null,
        age: formData.age ? Number(formData.age) : null,
        bloodGroup: formData.bloodGroup,
        occupation: formData.occupation,
        emergencyContact: formData.emergencyContact,
        address: fullAddress,
        status: formData.status,
        medicalHistory: formData.medicalHistory,
        treatmentType: formData.treatmentType,
        healerId: formData.assignedHealer || null,
        password: formData.password || undefined,
      };

      await updatePatient(decodeURIComponent(id), payload);
      setSavedPatientId(formData.name);
      setShowSuccessToast(true);
    } catch (error: any) {
      console.error('Failed to update patient profile:', error);
      alert(error.response?.data?.message || 'Failed to update patient profile. Please try again.');
    }
  };

  const closeAndRedirect = () => {
    setShowSuccessToast(false);
    history.push(ROUTES.BRANCH_ADMIN.PATIENTS);
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
                <span className="db-access-restricted-title">Unauthorized Access</span>
                <p className="db-access-restricted-desc">
                  Access Denied. Patient profile editing is restricted to authorized Branch Admin users.
                </p>
              </div>
            </div>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  // Custom CSS Style Blocks matching the registration page style
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
      marginTop: '10px',
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
      position: 'relative' as const,
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
            <header
              className="db-corp-navbar"
              style={{
                background: '#ffffff',
                borderBottom: '1px solid #e2e8f0',
                padding: '16px 24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <button
                  className="db-corp-nav-icon-btn"
                  onClick={() => history.push(ROUTES.BRANCH_ADMIN.PATIENTS)}
                  title="Back to Patients"
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
                <div
                  className="db-corp-navbar-left"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                  }}
                >
                  <h1
                    className="db-corp-page-title"
                    style={{
                      color: '#0d5c46',
                      fontWeight: 800,
                      fontSize: '20px',
                      margin: 0,
                      lineHeight: 1.2,
                    }}
                  >
                    Edit Patient Profile
                  </h1>
                  <p
                    className="db-corp-page-subtitle"
                    style={{
                      fontSize: '13px',
                      color: '#64748b',
                      margin: '4px 0 0 0',
                      lineHeight: 1.2,
                    }}
                  >
                    Pranic Healing Management System • {formattedDate}
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: '#f59e0b',
                    marginRight: '8px',
                  }}
                />
                <span
                  style={{
                    fontSize: '11px',
                    color: '#64748b',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                  }}
                >
                  Patient Editor
                </span>
              </div>
            </header>

            {/* Main Form Workspace Area */}
            <div className="db-hc-layout" style={{ padding: '28px' }}>
              
              <form onSubmit={handleSaveRecord} style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
                
                {/* 2-Column Grid Layout */}
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '28px', alignItems: 'start' }}>
                  
                  {/* LEFT COLUMN: Identity, Contact, Address, Status */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
                    
                    {/* Card 1: Patient Identity & Contact Info */}
                    <div style={customStyles.formCard}>
                      
                      {/* Section 1: Patient Identity */}
                      <div>
                        <div style={customStyles.subHeader}>
                          <IonIcon icon={personOutline} style={customStyles.subHeaderIcon} />
                          <span>Patient Identity</span>
                        </div>
                        <div className="st-form-group">
                          <label style={customStyles.label}>PATIENT FULL NAME *</label>
                          <input 
                            type="text" 
                            name="name" 
                            style={customStyles.grayInput}
                            value={formData.name} 
                            onChange={handleInputChange} 
                            required 
                            placeholder="Enter Name"
                          />
                        </div>

                        {/* Gender & Date of Birth row */}
                        <div className="st-form-row" style={{ marginTop: '16px' }}>
                          <div className="st-form-group">
                            <label style={customStyles.label}>GENDER *</label>
                            <select
                              name="gender"
                              style={customStyles.grayInput}
                              value={formData.gender}
                              onChange={handleInputChange}
                              required
                            >
                              <option value="">Select Gender</option>
                              <option value="Female">Female</option>
                              <option value="Male">Male</option>
                              <option value="Other">Other</option>
                            </select>
                          </div>
                          <div className="st-form-group">
                            <label style={customStyles.label}>DATE OF BIRTH *</label>
                            <input
                              type="date"
                              name="dateOfBirth"
                              style={customStyles.grayInput}
                              value={formData.dateOfBirth}
                              onChange={handleInputChange}
                              required
                            />
                          </div>
                        </div>

                        {/* Age, Blood Group & Occupation row */}
                        <div className="st-form-row" style={{ marginTop: '16px' }}>
                          <div className="st-form-group">
                            <label style={customStyles.label}>AGE *</label>
                            <input
                              type="number"
                              name="age"
                              style={customStyles.grayInput}
                              value={formData.age}
                              onChange={handleInputChange}
                              placeholder="Enter age in years"
                              min="0"
                              max="120"
                              readOnly
                              required
                            />
                          </div>
                          <div className="st-form-group">
                            <label style={customStyles.label}>BLOOD GROUP *</label>
                            <select
                              name="bloodGroup"
                              style={customStyles.grayInput}
                              value={formData.bloodGroup}
                              onChange={handleInputChange}
                              required
                            >
                              <option value="">Select Blood Group</option>
                              <option value="A+">A+</option>
                              <option value="A-">A-</option>
                              <option value="B+">B+</option>
                              <option value="B-">B-</option>
                              <option value="AB+">AB+</option>
                              <option value="AB-">AB-</option>
                              <option value="O+">O+</option>
                              <option value="O-">O-</option>
                            </select>
                          </div>
                          
                        </div>
                        <div className="st-form-group">
                            <label style={customStyles.label}>OCCUPATION</label>
                            <input
                              type="text"
                              name="occupation"
                              style={customStyles.grayInput}
                              value={formData.occupation}
                              onChange={handleInputChange}
                              placeholder="Enter occupation (e.g. Engineer)"
                            />
                          </div>
                      </div>

                      {/* Section 2: Contact Information */}
                      <div>
                        <div style={customStyles.subHeader}>
                          <IonIcon icon={callOutline} style={customStyles.subHeaderIcon} />
                          <span>Contact Information</span>
                        </div>
                        
                        <div className="st-form-row" style={{ marginBottom: '16px' }}>
                          <div className="st-form-group">
                            <label style={customStyles.label}>PHONE NUMBER *</label>
                            <input 
                              type="tel" 
                              name="mobile" 
                              style={customStyles.grayInput}
                              value={formData.mobile} 
                              onChange={handleInputChange} 
                              required 
                              placeholder="Enter mobile number"
                            />
                          </div>
                        </div>

                        <div className="st-form-group">
                          <label style={customStyles.label}>EMERGENCY CONTACT DETAILS</label>
                          <input 
                            type="text" 
                            name="emergencyContact" 
                            style={customStyles.grayInput}
                            value={formData.emergencyContact} 
                            onChange={handleInputChange} 
                            placeholder="e.g Husband number"
                          />
                        </div>
                      </div>

                      {/* Section 3: Address */}
                      <div>
                        <div style={customStyles.subHeader}>
                          <IonIcon icon={locationOutline} style={customStyles.subHeaderIcon} />
                          <span>Address</span>
                        </div>
                        
                        {/* Address Line 1 */}
                        <div>
                                                <div className="st-form-group">
                                                  <label style={customStyles.label}>
                                                    RESIDENTIAL/COMMUNICATION ADDRESS
                                                  </label>
                                                  <textarea
                                                    name="address"
                                                    rows={3}
                                                    style={customStyles.grayTextarea}
                                                    value={formData.address}
                                                    onChange={handleInputChange}
                                                    placeholder="Enter complete residential address, including city and postal code"
                                                  />
                                                </div>
                                              </div>

                        {/* Address Line 2 */}
                        {/* <div className="st-form-group" style={{ marginTop: '16px' }}>
                          <label style={customStyles.label}>Address Line 2</label>
                          <input 
                            type="text" 
                            name="addressLine2" 
                            style={customStyles.grayInput}
                            value={formData.addressLine2} 
                            onChange={handleInputChange} 
                            placeholder="Landmark, Area, Locality (Optional)"
                          />
                        </div> */}

                        {/* City, State & Pincode Row */}
                        {/* <div className="st-form-row" style={{ marginTop: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                          <div className="st-form-group">
                            <label style={customStyles.label}>City *</label>
                            <input 
                              type="text" 
                              name="city" 
                              style={customStyles.grayInput}
                              value={formData.city} 
                              onChange={handleInputChange} 
                              placeholder="City"
                              required 
                            />
                          </div>

                          <div className="st-form-group">
                            <label style={customStyles.label}>State *</label>
                            <input 
                              type="text" 
                              name="state" 
                              style={customStyles.grayInput}
                              value={formData.state} 
                              onChange={handleInputChange} 
                              placeholder="State"
                              required 
                            />
                          </div>

                          <div className="st-form-group">
                            <label style={customStyles.label}>Pincode *</label>
                            <input 
                              type="text" 
                              name="pincode" 
                              style={customStyles.grayInput}
                              value={formData.pincode} 
                              onChange={handleInputChange} 
                              placeholder="6-digit Pincode"
                              pattern="[0-9]{6}"
                              required 
                            />
                          </div>
                        </div> */}
                      </div>

                    </div>
                  </div>

                  {/* RIGHT COLUMN: Medical History, Assigned Healer, Uploaded Documents */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', width: '100%' }}>
                    
                    {/* Card 1: Medical History & Allocation */}
                    <div style={customStyles.formCard}>
                      
                      {/* Section 1: Medical History */}
                      <div>
                        <div style={customStyles.subHeader}>
                          <IonIcon icon={medkitOutline} style={customStyles.subHeaderIcon} />
                          <span>Medical History</span>
                        </div>
                        <div className="st-form-group">
                          <label style={customStyles.label}>CONDITIONS, TREATMENTS &amp; ALLERGIES</label>
                          <textarea 
                            name="medicalHistory" 
                            rows={4} 
                            style={customStyles.grayTextarea}
                            value={formData.medicalHistory} 
                            onChange={handleInputChange} 
                            placeholder="Describe any chronic conditions, allergies, current medications, or previous energy healing experiences..."
                          />
                        </div>
                      </div>

                      {/* Section 2: Allocation */}
                      <div className="st-form-group" style={{ marginTop: '8px' }}>
                        <label style={customStyles.label}>ASSIGN TREATMENT TYPE</label>
                        <select name="treatmentType" className="st-input" style={customStyles.grayInput} value={formData.treatmentType} onChange={handleInputChange}>
                          <option value="">Select Treatment Type</option>
                          <option value="Pranic Psychotherapy">Pranic Psychotherapy</option>
                          <option value="Advanced Pranic Healing">Advanced Pranic Healing</option>
                          <option value="Crystal Pranic Healing">Crystal Pranic Healing</option>
                          <option value="Basic Pranic Healing">Basic Pranic Healing</option>
                        </select>
                      </div>

                      {/* Section 3: Assigned Healer */}
                      <div>
                        <div style={customStyles.subHeader}>
                          <IonIcon icon={peopleOutline} style={customStyles.subHeaderIcon} />
                          <span>Assigned Healer</span>
                        </div>
                        <div className="st-form-group">
                          <label style={customStyles.label}>RESPONSIBLE HEALER</label>
                          <select name="assignedHealer" className="st-input" style={customStyles.grayInput} value={formData.assignedHealer} onChange={handleInputChange}>
                            <option value="">Select Healer</option>
                            {healersList.map((h: any) => (
                              <option key={h.id} value={h.id}>{h.name}</option>
                            ))}
                            {formData.assignedHealer && patientHealer && !healersList.some((h: any) => h.id === formData.assignedHealer) && (
                              <option value={patientHealer.id}>{patientHealer.name} (Assigned)</option>
                            )}
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Card 2: Login Details */}
                    <div style={customStyles.formCard}>
                      <div style={customStyles.subHeader}>
                        <IonIcon icon={shieldCheckmarkOutline} style={customStyles.subHeaderIcon} />
                        <span>Login Details</span>
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
                          placeholder="Enter email address"
                        />
                      </div>

                      <div className="st-form-group">
                        <label style={customStyles.label}>PASSWORD (AUTO GENERATED)</label>
                        <div style={{ display: 'flex', gap: '12px' }}>
                          <input 
                            type="text" 
                            name="password" 
                            style={{ ...customStyles.grayInput, fontFamily: 'monospace', fontWeight: 'bold' }}
                            value={formData.password} 
                            onChange={handleInputChange} 
                            placeholder="PHMS-XXXX"
                          />
                          <button 
                            type="button"
                            onClick={handleRegeneratePassword}
                            style={{
                              background: '#0D5C46',
                              border: 'none',
                              borderRadius: '8px',
                              padding: '10px 16px',
                              fontSize: '12px',
                              fontWeight: 600,
                              color: '#ffffff',
                              cursor: 'pointer',
                              whiteSpace: 'nowrap',
                              transition: 'background 0.2s ease',
                            }}
                          >
                            {formData.password ? "Regenerate" : "Generate"}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label style={customStyles.label}>ACCOUNT STATUS</label>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '6px' }}>
                          {/* Active */}
                          <div 
                            onClick={() => setFormData(prev => ({ ...prev, accountStatus: 'Active', status: 'Active' }))}
                            style={{
                              padding: '12px',
                              borderRadius: '8px',
                              border: formData.accountStatus === 'Active' ? '2px solid #10b981' : '1px solid #cbd5e1',
                              background: formData.accountStatus === 'Active' ? '#f0fdf4' : '#f8fafc',
                              cursor: 'pointer',
                              textAlign: 'center',
                              fontWeight: 700,
                              fontSize: '13px',
                              color: formData.accountStatus === 'Active' ? '#047857' : '#475569',
                              transition: 'all 0.2s ease'
                            }}
                          >
                            Active
                          </div>

                          {/* Inactive */}
                          <div 
                            onClick={() => setFormData(prev => ({ ...prev, accountStatus: 'Inactive', status: 'Inactive' }))}
                            style={{
                              padding: '12px',
                              borderRadius: '8px',
                              border: formData.accountStatus === 'Inactive' ? '2px solid #ef4444' : '1px solid #cbd5e1',
                              background: formData.accountStatus === 'Inactive' ? '#fef2f2' : '#f8fafc',
                              cursor: 'pointer',
                              textAlign: 'center',
                              fontWeight: 700,
                              fontSize: '13px',
                              color: formData.accountStatus === 'Inactive' ? '#b91c1c' : '#475569',
                              transition: 'all 0.2s ease'
                            }}
                          >
                            Inactive
                          </div>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Full-Width: Uploaded Documents */}
                <div style={customStyles.formCard}>
                  <div style={customStyles.subHeader}>
                    <IonIcon icon={documentTextOutline} style={customStyles.subHeaderIcon} />
                    <span>Uploaded Documents</span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '20px' }}>
                    {/* Medical Reports */}
                    <div className="st-form-group">
                      <label style={customStyles.label}>Medical Reports</label>
                      {uploadedFiles.reports ? (
                        <div style={customStyles.dashedUploadActive}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', width: '80%' }}>
                            <IonIcon icon={checkmarkCircleOutline} style={{ color: '#10b981' }} />
                            <span style={{ fontSize: '11px', color: '#065f46', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {uploadedFiles.reports.name}
                            </span>
                          </div>
                          <IonIcon icon={trashOutline} onClick={(e) => handleClearFile('reports', e)} style={{ color: '#ef4444', fontSize: '14px' }} />
                        </div>
                      ) : (
                        <label style={customStyles.dashedUpload}>
                          <IonIcon icon={cloudUploadOutline} style={{ color: '#94a3b8', fontSize: '18px' }} />
                          <input type="file" style={{ display: 'none' }} onChange={(e) => handleFileChange('reports', e)} />
                        </label>
                      )}
                    </div>

                    {/* Lab Results */}
                    <div className="st-form-group">
                      <label style={customStyles.label}>Lab Results</label>
                      {uploadedFiles.labResults ? (
                        <div style={customStyles.dashedUploadActive}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', width: '80%' }}>
                            <IonIcon icon={checkmarkCircleOutline} style={{ color: '#10b981' }} />
                            <span style={{ fontSize: '11px', color: '#065f46', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {uploadedFiles.labResults.name}
                            </span>
                          </div>
                          <IonIcon icon={trashOutline} onClick={(e) => handleClearFile('labResults', e)} style={{ color: '#ef4444', fontSize: '14px' }} />
                        </div>
                      ) : (
                        <label style={customStyles.dashedUpload}>
                          <IonIcon icon={cloudUploadOutline} style={{ color: '#94a3b8', fontSize: '18px' }} />
                          <input type="file" style={{ display: 'none' }} onChange={(e) => handleFileChange('labResults', e)} />
                        </label>
                      )}
                    </div>

                    {/* Prescriptions */}
                    <div className="st-form-group">
                      <label style={customStyles.label}>Prescriptions</label>
                      {uploadedFiles.prescriptions ? (
                        <div style={customStyles.dashedUploadActive}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', width: '80%' }}>
                            <IonIcon icon={checkmarkCircleOutline} style={{ color: '#10b981' }} />
                            <span style={{ fontSize: '11px', color: '#065f46', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {uploadedFiles.prescriptions.name}
                            </span>
                          </div>
                          <IonIcon icon={trashOutline} onClick={(e) => handleClearFile('prescriptions', e)} style={{ color: '#ef4444', fontSize: '14px' }} />
                        </div>
                      ) : (
                        <label style={customStyles.dashedUpload}>
                          <IonIcon icon={cloudUploadOutline} style={{ color: '#94a3b8', fontSize: '18px' }} />
                          <input type="file" style={{ display: 'none' }} onChange={(e) => handleFileChange('prescriptions', e)} />
                        </label>
                      )}
                    </div>

                    {/* Scan Images */}
                    {/* <div className="st-form-group">
                      <label style={customStyles.label}>Scan Images</label>
                      {uploadedFiles.scanImages ? (
                        <div style={customStyles.dashedUploadActive}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', width: '80%' }}>
                            <IonIcon icon={checkmarkCircleOutline} style={{ color: '#10b981' }} />
                            <span style={{ fontSize: '11px', color: '#065f46', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {uploadedFiles.scanImages.name}
                            </span>
                          </div>
                          <IonIcon icon={trashOutline} onClick={(e) => handleClearFile('scanImages', e)} style={{ color: '#ef4444', fontSize: '14px' }} />
                        </div>
                      ) : (
                        <label style={customStyles.dashedUpload}>
                          <IonIcon icon={cloudUploadOutline} style={{ color: '#94a3b8', fontSize: '18px' }} />
                          <input type="file" style={{ display: 'none' }} onChange={(e) => handleFileChange('scanImages', e)} />
                        </label>
                      )}
                    </div> */}

                    {/* Consultation Notes */}
                    {/* <div className="st-form-group">
                      <label style={customStyles.label}>Consultation Notes</label>
                      {uploadedFiles.consultationNotes ? (
                        <div style={customStyles.dashedUploadActive}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', width: '80%' }}>
                            <IonIcon icon={checkmarkCircleOutline} style={{ color: '#10b981' }} />
                            <span style={{ fontSize: '11px', color: '#065f46', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {uploadedFiles.consultationNotes.name}
                            </span>
                          </div>
                          <IonIcon icon={trashOutline} onClick={(e) => handleClearFile('consultationNotes', e)} style={{ color: '#ef4444', fontSize: '14px' }} />
                        </div>
                      ) : (
                        <label style={customStyles.dashedUpload}>
                          <IonIcon icon={cloudUploadOutline} style={{ color: '#94a3b8', fontSize: '18px' }} />
                          <input type="file" style={{ display: 'none' }} onChange={(e) => handleFileChange('consultationNotes', e)} />
                        </label>
                      )}
                    </div> */}

                    {/* ID Proofs */}
                    <div className="st-form-group">
                      <label style={customStyles.label}>ID Proofs</label>
                      {uploadedFiles.idProofs ? (
                        <div style={customStyles.dashedUploadActive}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', width: '80%' }}>
                            <IonIcon icon={checkmarkCircleOutline} style={{ color: '#10b981' }} />
                            <span style={{ fontSize: '11px', color: '#065f46', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {uploadedFiles.idProofs.name}
                            </span>
                          </div>
                          <IonIcon icon={trashOutline} onClick={(e) => handleClearFile('idProofs', e)} style={{ color: '#ef4444', fontSize: '14px' }} />
                        </div>
                      ) : (
                        <label style={customStyles.dashedUpload}>
                          <IonIcon icon={cloudUploadOutline} style={{ color: '#94a3b8', fontSize: '18px' }} />
                          <input type="file" style={{ display: 'none' }} onChange={(e) => handleFileChange('idProofs', e)} />
                        </label>
                      )}
                    </div>

                    {/* Healing Records */}
                    {/* <div className="st-form-group">
                      <label style={customStyles.label}>Healing Records</label>
                      {uploadedFiles.healingRecords ? (
                        <div style={customStyles.dashedUploadActive}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', width: '80%' }}>
                            <IonIcon icon={checkmarkCircleOutline} style={{ color: '#10b981' }} />
                            <span style={{ fontSize: '11px', color: '#065f46', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {uploadedFiles.healingRecords.name}
                            </span>
                          </div>
                          <IonIcon icon={trashOutline} onClick={(e) => handleClearFile('healingRecords', e)} style={{ color: '#ef4444', fontSize: '14px' }} />
                        </div>
                      ) : (
                        <label style={customStyles.dashedUpload}>
                          <IonIcon icon={cloudUploadOutline} style={{ color: '#94a3b8', fontSize: '18px' }} />
                          <input type="file" style={{ display: 'none' }} onChange={(e) => handleFileChange('healingRecords', e)} />
                        </label>
                      )}
                    </div> */}
                  </div>
                </div>

                {/* Bottom Footer Actions block */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', marginTop: '12px', marginBottom: '28px' }}>
                  <button 
                    type="button" 
                    onClick={handleClearForm} 
                    style={{
                      background: '#ffffff',
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      padding: '10px 24px',
                      fontSize: '14px',
                      fontWeight: 600,
                      color: '#ef4444',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      marginRight: 'auto',
                    }}
                  >
                    Clear Form
                  </button>

                  <button 
                    type="button" 
                    onClick={() => history.push(ROUTES.BRANCH_ADMIN.PATIENTS)} 
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
                    Save Changes
                  </button>
                </div>

              </form>
            </div>
          </main>
        </div>

        {/* Success Modal */}
        {showSuccessToast && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)' }}>
            <div className="db-corp-card" style={{ maxWidth: '420px', width: '90%', padding: '32px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', animation: 'scaleUp 0.3s ease-out' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <IonIcon icon={checkmarkCircleOutline} style={{ color: '#10b981', fontSize: '40px' }} />
              </div>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#1e293b', margin: '0 0 6px 0' }}>Patient Updated Successfully</h3>
                <p style={{ fontSize: '13px', color: '#64748b', margin: '0', lineHeight: 1.5 }}>
                  Profile updates for <strong>{formData.name}</strong> have been successfully saved.
                </p>
              </div>
              
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '10px 16px', borderRadius: '8px', fontSize: '13px', width: '100%' }}>
                <span style={{ color: '#64748b', fontWeight: 600 }}>SYSTEM RECORD ID:</span>
                <strong style={{ color: '#0D5C46', display: 'block', fontSize: '15px', marginTop: '2px', fontFamily: 'monospace' }}>{savedPatientId}</strong>
              </div>

              <button onClick={closeAndRedirect} className="sa-btn sa-btn--primary" style={{ width: '100%', justifyContent: 'center', margin: 0 }}>
                Proceed to Patient Registry
              </button>
            </div>
          </div>
        )}
      </IonContent>
    </IonPage>
  );
}