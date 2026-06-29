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
  medkitOutline,
  documentTextOutline,
  cloudUploadOutline,
  checkmarkCircleOutline,
  trashOutline,
  shieldCheckmarkOutline,
  lockClosedOutline,
  keyOutline,
} from 'ionicons/icons';
import { useHistory, useParams } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';
import { ROUTES } from '../../constants/routes.constant';
import { getPatientById, updatePatient } from '../../api/patient.api';
import { getBranches } from '../../api/branch.api';
import { getHealers } from '../../api/healer.api';
import { getTreatmentTypes } from '../../api/treatmentType.api';
import { uploadDocument, deleteDocument } from '../../api/document.api';
import '../branch-admin/branch-admin.css';
import './super-admin.css';

export default function EditPatientPages() {
  const history = useHistory();
  const { patientId } = useParams<{ patientId: string }>();
  const { user } = useAuthStore();
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  const formattedDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const [loading, setLoading] = useState(true);
  const [patient, setPatient] = useState<any>(null);
  const [branches, setBranches] = useState<any[]>([]);
  const [healers, setHealers] = useState<any[]>([]);
  const [treatmentTypes, setTreatmentTypes] = useState<any[]>([]);

  // Form fields state
  const [formData, setFormData] = useState({
    name: '',
    gender: 'Female',
    dob: '',
    age: '',
    bloodGroup: 'O+',
    occupation: '',
    phone: '',
    emergencyContact: '',
    address: '',
    medicalHistory: '',
    treatmentType: '',
    healerId: '',
    branchId: '',
    email: '',
    password: '',
    status: 'active'
  });

  // Selected files for new uploads
  const [medicalReportFile, setMedicalReportFile] = useState<File | null>(null);
  const [labReportFile, setLabReportFile] = useState<File | null>(null);
  const [prescriptionFile, setPrescriptionFile] = useState<File | null>(null);
  const [idProofFile, setIdProofFile] = useState<File | null>(null);

  // Existing document database records
  const [existingMedicalReport, setExistingMedicalReport] = useState<string | null>(null);
  const [existingLabReport, setExistingLabReport] = useState<string | null>(null);
  const [existingPrescription, setExistingPrescription] = useState<string | null>(null);
  const [existingIdProof, setExistingIdProof] = useState<string | null>(null);

  const [medicalReportDocId, setMedicalReportDocId] = useState<string | null>(null);
  const [labReportDocId, setLabReportDocId] = useState<string | null>(null);
  const [prescriptionDocId, setPrescriptionDocId] = useState<string | null>(null);
  const [idProofDocId, setIdProofDocId] = useState<string | null>(null);

  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [saving, setSaving] = useState(false);

  const calculateAge = (dobString: string) => {
    if (!dobString) return '';
    const today = new Date();
    const birthDate = new Date(dobString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age >= 0 ? String(age) : '0';
  };

  const fetchPatientData = async () => {
    try {
      setLoading(true);
      const [pRes, bRes, hRes, tRes] = await Promise.all([
        getPatientById(patientId),
        getBranches(),
        getHealers(),
        getTreatmentTypes()
      ]);

      const p = pRes.data || pRes;
      setPatient(p);

      const loadedBranches = bRes.data || bRes;
      setBranches(Array.isArray(loadedBranches) ? loadedBranches : []);

      const loadedHealers = hRes.data || hRes;
      setHealers(Array.isArray(loadedHealers) ? loadedHealers : []);

      const loadedTypes = tRes.data || tRes;
      setTreatmentTypes(Array.isArray(loadedTypes) ? loadedTypes : []);

      if (p) {
        setFormData({
          name: p.name || '',
          gender: p.gender || 'Female',
          dob: p.dob || '',
          age: String(p.age || ''),
          bloodGroup: p.bloodGroup || 'O+',
          occupation: p.occupation || '',
          phone: p.phone || '',
          emergencyContact: p.emergencyContact || '',
          address: p.address || '',
          medicalHistory: p.medicalHistory || '',
          treatmentType: p.treatmentType || '',
          healerId: p.healerId || '',
          branchId: p.branchId || '',
          email: p.email || '',
          password: p.password || '',
          status: p.status || 'active'
        });

        // Set existing document paths and database document IDs
        const docs = p.documents || [];
        const medRep = docs.find((d: any) => d.fileType === 'MEDICAL_REPORT');
        const labRep = docs.find((d: any) => d.fileType === 'LAB_REPORT');
        const presc = docs.find((d: any) => d.fileType === 'PRESCRIPTION');
        const idPrf = docs.find((d: any) => d.fileType === 'ID_PROOF');

        setExistingMedicalReport(medRep ? medRep.filePath : (p.medicalReport || null));
        setExistingLabReport(labRep ? labRep.filePath : (p.labReport || null));
        setExistingPrescription(presc ? presc.filePath : (p.prescription || null));
        setExistingIdProof(idPrf ? idPrf.filePath : (p.idProof || null));

        setMedicalReportDocId(medRep ? medRep.id : null);
        setLabReportDocId(labRep ? labRep.id : null);
        setPrescriptionDocId(presc ? presc.id : null);
        setIdProofDocId(idPrf ? idPrf.id : null);
      }
    } catch (error) {
      console.error('Error loading patient details:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (patientId && isSuperAdmin) {
      fetchPatientData();
    }
  }, [patientId, isSuperAdmin]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'dob') {
      const computedAge = calculateAge(value);
      setFormData(prev => ({ ...prev, dob: value, age: computedAge }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleGeneratePassword = () => {
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    setFormData(prev => ({
      ...prev,
      password: `PHMS-${randomDigits}`
    }));
  };

  const handleFileChange = (field: 'medicalReport' | 'labReport' | 'prescription' | 'idProof', e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (field === 'medicalReport') setMedicalReportFile(file);
      else if (field === 'labReport') setLabReportFile(file);
      else if (field === 'prescription') setPrescriptionFile(file);
      else if (field === 'idProof') setIdProofFile(file);
    }
  };

  const handleDeleteDoc = async (field: 'medicalReport' | 'labReport' | 'prescription' | 'idProof', docId: string | null) => {
    if (!window.confirm(`Are you sure you want to delete this ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}?`)) return;
    try {
      if (docId) {
        await deleteDocument(docId);
      }
      await updatePatient(patientId, { [field]: '' });
      if (field === 'medicalReport') {
        setExistingMedicalReport(null);
        setMedicalReportDocId(null);
        setMedicalReportFile(null);
      } else if (field === 'labReport') {
        setExistingLabReport(null);
        setLabReportDocId(null);
        setLabReportFile(null);
      } else if (field === 'prescription') {
        setExistingPrescription(null);
        setPrescriptionDocId(null);
        setPrescriptionFile(null);
      } else if (field === 'idProof') {
        setExistingIdProof(null);
        setIdProofDocId(null);
        setIdProofFile(null);
      }
      alert('Document deleted successfully');
    } catch (error) {
      console.error('Error deleting document:', error);
      alert('Failed to delete document');
    }
  };

  const handleClearForm = () => {
    if (patient) {
      setFormData({
        name: patient.name || '',
        gender: patient.gender || 'Female',
        dob: patient.dob || '',
        age: String(patient.age || ''),
        bloodGroup: patient.bloodGroup || 'O+',
        occupation: patient.occupation || '',
        phone: patient.phone || '',
        emergencyContact: patient.emergencyContact || '',
        address: patient.address || '',
        medicalHistory: patient.medicalHistory || '',
        treatmentType: patient.treatmentType || '',
        healerId: patient.healerId || '',
        branchId: patient.branchId || '',
        email: patient.email || '',
        password: patient.password || '',
        status: patient.status || 'active'
      });
      setMedicalReportFile(null);
      setLabReportFile(null);
      setPrescriptionFile(null);
      setIdProofFile(null);
    }
  };

  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Patient Full Name is required.');
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

    try {
      setSaving(true);

      const payload = {
        name: formData.name,
        gender: formData.gender,
        dob: formData.dob || null,
        age: formData.age ? Number(formData.age) : null,
        bloodGroup: formData.bloodGroup,
        occupation: formData.occupation,
        phone: formData.phone,
        emergencyContact: formData.emergencyContact,
        address: formData.address,
        medicalHistory: formData.medicalHistory,
        treatmentType: formData.treatmentType || null,
        healerId: formData.healerId || null,
        branchId: formData.branchId || null,
        email: formData.email,
        password: formData.password || undefined,
        status: formData.status
      };

      await updatePatient(patientId, payload);

      // Upload newly selected files
      const uploadPromises = [];
      if (medicalReportFile) {
        uploadPromises.push(uploadDocument(patientId, medicalReportFile, 'MEDICAL_REPORT'));
      }
      if (labReportFile) {
        uploadPromises.push(uploadDocument(patientId, labReportFile, 'LAB_REPORT'));
      }
      if (prescriptionFile) {
        uploadPromises.push(uploadDocument(patientId, prescriptionFile, 'PRESCRIPTION'));
      }
      if (idProofFile) {
        uploadPromises.push(uploadDocument(patientId, idProofFile, 'ID_PROOF'));
      }

      if (uploadPromises.length > 0) {
        await Promise.all(uploadPromises);
      }

      setShowSuccessToast(true);
    } catch (error: any) {
      console.error('Error updating patient profile:', error);
      const errMsg = error.response?.data?.message || 'Failed to update patient profile. Please check validation rules.';
      alert(errMsg);
    } finally {
      setSaving(false);
    }
  };

  const closeAndRedirect = () => {
    setShowSuccessToast(false);
    history.push(ROUTES.SUPER_ADMIN.PATIENTS);
  };

  const getFileDownloadUrl = (path: string | null) => {
    if (!path) return '#';
    const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
    const serverOrigin = apiBase.replace('/api', '');
    return `${serverOrigin}/${path}`;
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
      height: '42px',
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
      height: '42px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 12px',
      cursor: 'pointer',
      width: '100%',
    },
  };

  if (!isSuperAdmin) {
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
                  Access Denied. Only system Super Administrators are permitted to view and modify patient records.
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
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b' }}>Loading Patient Editor...</h3>
            <p style={{ color: '#64748b', fontSize: '14px' }}>
              Fetching records from the centralized directory.
            </p>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  if (!patient) {
    return (
      <IonPage className="sa-page">
        <IonContent className="sa-page__content" style={{ '--background': '#f8fafc' }} fullscreen>
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <IonIcon icon={alertCircleOutline} style={{ fontSize: '48px', color: '#ef4444', marginBottom: '16px' }} />
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b' }}>Patient Record Not Found</h3>
            <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '24px' }}>
              The requested patient record could not be found.
            </p>
            <button 
              className="sa-btn sa-btn--primary" 
              onClick={() => history.push(ROUTES.SUPER_ADMIN.PATIENTS)}
            >
              Back to Patient Directory
            </button>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage className="sa-page">
      <IonContent className="sa-page__content" style={{ '--background': '#f8fafc' }} fullscreen>
        <div className="db-corp-layout" style={{ background: '#f8fafc' }}>
          <main className="db-corp-canvas">
            
            <header className="db-corp-navbar" style={{ background: '#ffffff', borderBottom: '1px solid #e2e8f0', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <button 
                  className="db-corp-nav-icon-btn" 
                  onClick={() => history.push(ROUTES.SUPER_ADMIN.PATIENTS)} 
                  title="Back to Patient Directory"
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
                  <h1 className="db-corp-page-title" style={{ color: '#0d5c46', fontWeight: 800, margin: 0, fontSize: '20px', lineHeight: 1.2 }}>Edit Patient Profile</h1>
                  <p className="db-corp-page-subtitle" style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0 0', lineHeight: 1.2 }}>Pranic Healing Management System • {formattedDate}</p>
                </div>
              </div>
              
              <div className="db-corp-navbar-right" style={{ display: 'flex', alignItems: 'center' }}>
                <div className="db-corp-badge-dot" style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f59e0b', position: 'relative', marginRight: '6px' }} />
                <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Editing: #{patient.patientId || patient.id}</span>
              </div>
            </header>

            <div className="db-hc-layout" style={{ padding: '28px' }}>
              <form onSubmit={handleSaveChanges} style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
                
                <div className="sa-edit-grid">
                  
                  {/* LEFT COLUMN */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
                    
                    {/* Card 1: Patient Identity */}
                    <div style={customStyles.formCard}>
                      <div>
                        <div style={customStyles.subHeader}>
                          <IonIcon icon={personOutline} style={customStyles.subHeaderIcon} />
                          <span>Patient Identity</span>
                        </div>
                      </div>

                      <div className="sa-grid-2">
                        <div>
                          <label style={customStyles.label}>Patient Full Name *</label>
                          <input 
                            name="name"
                            style={customStyles.grayInput}
                            value={formData.name}
                            onChange={handleInputChange}
                            required
                            placeholder="Full Name"
                          />
                        </div>
                        <div>
                          <label style={customStyles.label}>Gender *</label>
                          <select 
                            name="gender"
                            style={customStyles.grayInput}
                            value={formData.gender}
                            onChange={handleInputChange}
                            required
                          >
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                      </div>

                      <div className="sa-grid-2">
                        <div>
                          <label style={customStyles.label}>Date of Birth *</label>
                          <input 
                            name="dob"
                            type="date"
                            style={customStyles.grayInput}
                            value={formData.dob ? formData.dob.split('T')[0] : ''}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                        <div>
                          <label style={customStyles.label}>Age (Auto-calculated)</label>
                          <input 
                            name="age"
                            style={customStyles.grayInput}
                            value={formData.age}
                            disabled
                            placeholder="Calculated Age"
                          />
                        </div>
                      </div>

                      <div className="sa-grid-2">
                        <div>
                          <label style={customStyles.label}>Blood Group *</label>
                          <select 
                            name="bloodGroup"
                            style={customStyles.grayInput}
                            value={formData.bloodGroup}
                            onChange={handleInputChange}
                            required
                          >
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
                        <div>
                          <label style={customStyles.label}>Occupation</label>
                          <input 
                            name="occupation"
                            style={customStyles.grayInput}
                            value={formData.occupation}
                            onChange={handleInputChange}
                            placeholder="Occupation"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Card 2: Contact Information */}
                    <div style={customStyles.formCard}>
                      <div>
                        <div style={customStyles.subHeader}>
                          <IonIcon icon={callOutline} style={customStyles.subHeaderIcon} />
                          <span>Contact Information</span>
                        </div>
                      </div>

                      <div className="sa-grid-2">
                        <div>
                          <label style={customStyles.label}>Phone Number *</label>
                          <input 
                            name="phone"
                            style={customStyles.grayInput}
                            value={formData.phone}
                            onChange={handleInputChange}
                            required
                            placeholder="Phone Number"
                          />
                        </div>
                        <div>
                          <label style={customStyles.label}>Emergency Contact Details *</label>
                          <input 
                            name="emergencyContact"
                            style={customStyles.grayInput}
                            value={formData.emergencyContact}
                            onChange={handleInputChange}
                            required
                            placeholder="Name & Relationship / Contact"
                          />
                        </div>
                      </div>

                      <div>
                        <label style={customStyles.label}>Residential / Communication Address</label>
                        <textarea 
                          name="address"
                          style={{ ...customStyles.grayTextarea, height: '80px' }}
                          value={formData.address}
                          onChange={handleInputChange}
                          placeholder="Residential Address"
                        />
                      </div>
                    </div>

                    {/* Card 3: Medical History */}
                    <div style={customStyles.formCard}>
                      <div>
                        <div style={customStyles.subHeader}>
                          <IonIcon icon={medkitOutline} style={customStyles.subHeaderIcon} />
                          <span>Medical History</span>
                        </div>
                      </div>

                      <div>
                        <label style={customStyles.label}>Conditions, Treatments & Allergies</label>
                        <textarea 
                          name="medicalHistory"
                          style={{ ...customStyles.grayTextarea, height: '90px' }}
                          value={formData.medicalHistory}
                          onChange={handleInputChange}
                          placeholder="List any chronic ailments, allergies, or past operations"
                        />
                      </div>

                      <div>
                        <label style={customStyles.label}>Assigned Treatment Type</label>
                        <select
                          name="treatmentType"
                          style={customStyles.grayInput}
                          value={formData.treatmentType}
                          onChange={handleInputChange}
                        >
                          <option value="">Select Treatment Type</option>
                          {treatmentTypes.map(t => (
                            <option key={t.id} value={t.name}>{t.name} ({t.category})</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* RIGHT COLUMN */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
                    
                    {/* Card 4: Assigned Healer & Branch */}
                    <div style={customStyles.formCard}>
                      <div>
                        <div style={customStyles.subHeader}>
                          <IonIcon icon={shieldCheckmarkOutline} style={customStyles.subHeaderIcon} />
                          <span>Clinical Assignment</span>
                        </div>
                      </div>

                      <div>
                        <label style={customStyles.label}>Assigned Branch</label>
                        <select
                          name="branchId"
                          style={customStyles.grayInput}
                          value={formData.branchId}
                          onChange={handleInputChange}
                        >
                          <option value="">Select Branch</option>
                          {branches.map(b => (
                            <option key={b.id} value={b.id}>{b.name} - {b.city}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label style={customStyles.label}>Responsible Healer</label>
                        <select
                          name="healerId"
                          style={customStyles.grayInput}
                          value={formData.healerId}
                          onChange={handleInputChange}
                        >
                          <option value="">Select Healer</option>
                          {healers
                            .filter(h => !formData.branchId || h.branchId === formData.branchId)
                            .map(h => (
                              <option key={h.id} value={h.id}>{h.name}</option>
                            ))}
                        </select>
                      </div>
                    </div>

                    {/* Card 5: Login Details */}
                    <div style={customStyles.formCard}>
                      <div>
                        <div style={customStyles.subHeader}>
                          <IonIcon icon={lockClosedOutline} style={customStyles.subHeaderIcon} />
                          <span>Login Credentials</span>
                        </div>
                      </div>

                      <div>
                        <label style={customStyles.label}>Email Address *</label>
                        <input 
                          name="email"
                          type="email"
                          style={customStyles.grayInput}
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                          placeholder="patient@example.com"
                        />
                      </div>

                      <div>
                        <label style={customStyles.label}>Password (Enter to Reset)</label>
                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                          <input 
                            name="password"
                            style={{ ...customStyles.grayInput, flex: '1 1 200px' }}
                            value={formData.password}
                            onChange={handleInputChange}
                            placeholder="Reset password key"
                          />
                          <button 
                            type="button" 
                            className="sa-btn sa-btn--primary" 
                            style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px', whiteSpace: 'nowrap', padding: '0 16px', flex: '1 1 auto', height: '42px' }}
                            onClick={handleGeneratePassword}
                          >
                            <IonIcon icon={keyOutline} /> Generate
                          </button>
                        </div>
                      </div>

                      <div>
                        <label style={customStyles.label}>Account Status</label>
                        <select 
                          name="status"
                          style={customStyles.grayInput}
                          value={formData.status}
                          onChange={handleInputChange}
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                        </select>
                      </div>
                    </div>

                    {/* Card 6: Uploaded Documents */}
                    <div style={customStyles.formCard}>
                      <div>
                        <div style={customStyles.subHeader}>
                          <IonIcon icon={documentTextOutline} style={customStyles.subHeaderIcon} />
                          <span>Uploaded Documents</span>
                        </div>
                      </div>

                      {[
                        { field: 'medicalReport', label: 'Medical Reports', file: medicalReportFile, existing: existingMedicalReport, docId: medicalReportDocId },
                        { field: 'labReport', label: 'Lab Results', file: labReportFile, existing: existingLabReport, docId: labReportDocId },
                        { field: 'prescription', label: 'Prescriptions', file: prescriptionFile, existing: existingPrescription, docId: prescriptionDocId },
                        { field: 'idProof', label: 'ID Proofs', file: idProofFile, existing: existingIdProof, docId: idProofDocId },
                      ].map((item) => (
                        <div key={item.field} style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '16px', marginBottom: '4px' }}>
                          <span style={{ fontSize: '10px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>{item.label}</span>
                          
                          {/* File status */}
                          {item.existing ? (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '8px 12px', marginBottom: '8px' }}>
                              <a 
                                href={getFileDownloadUrl(item.existing)}
                                target="_blank" 
                                rel="noopener noreferrer" 
                                style={{ fontSize: '13px', fontWeight: 700, color: '#15803d', textDecoration: 'underline', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '70%' }}
                              >
                                {item.existing.split('/').pop()}
                              </a>
                              <button 
                                type="button" 
                                style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px' }} 
                                onClick={() => handleDeleteDoc(item.field as any, item.docId)}
                              >
                                <IonIcon icon={trashOutline} style={{ color: '#ef4444', fontSize: '16px' }} />
                              </button>
                            </div>
                          ) : (
                            <div style={{ fontSize: '12px', color: '#94a3b8', fontStyle: 'italic', marginBottom: '8px' }}>No document uploaded</div>
                          )}

                          {/* File upload input */}
                          <div>
                            {item.file ? (
                              <div style={customStyles.dashedUploadActive}>
                                <span style={{ fontSize: '13px', color: '#16a34a', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '80%' }}>
                                  {item.file.name}
                                </span>
                                <button 
                                  type="button" 
                                  style={{ background: 'transparent', border: 'none', color: '#ef4444', fontWeight: 700 }}
                                  onClick={() => {
                                    if (item.field === 'medicalReport') setMedicalReportFile(null);
                                    else if (item.field === 'labReport') setLabReportFile(null);
                                    else if (item.field === 'prescription') setPrescriptionFile(null);
                                    else if (item.field === 'idProof') setIdProofFile(null);
                                  }}
                                >
                                  ×
                                </button>
                              </div>
                            ) : (
                              <label style={customStyles.dashedUpload}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#64748b', fontWeight: 600 }}>
                                  <IonIcon icon={cloudUploadOutline} style={{ fontSize: '18px', color: '#0d5c46' }} />
                                  <span>{item.existing ? 'Replace File' : 'Upload File'}</span>
                                </div>
                                <input 
                                  type="file" 
                                  style={{ display: 'none' }}
                                  onChange={(e) => handleFileChange(item.field as any, e)}
                                />
                              </label>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Bottom Actions Form Footer */}
                <footer style={{ display: 'flex', justifyContent: 'flex-end', gap: '14px', borderTop: '1px solid #e2e8f0', paddingTop: '24px', marginTop: '12px' }}>
                  <button 
                    type="button" 
                    className="sa-btn sa-btn--outline" 
                    style={{ borderColor: '#cbd5e1', color: '#475569', minWidth: '110px' }}
                    onClick={handleClearForm}
                    disabled={saving}
                  >
                    Clear Form
                  </button>
                  
                  <button 
                    type="button" 
                    className="sa-btn sa-btn--outline" 
                    style={{ borderColor: '#cbd5e1', color: '#475569', minWidth: '110px' }}
                    onClick={() => history.push(ROUTES.SUPER_ADMIN.PATIENTS)}
                    disabled={saving}
                  >
                    Cancel
                  </button>

                  <button 
                    type="submit" 
                    className="sa-btn sa-btn--primary" 
                    style={{ minWidth: '150px' }}
                    disabled={saving}
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </footer>

              </form>
            </div>
          </main>
        </div>
      </IonContent>

      {/* Success Modal */}
      {showSuccessToast && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.5)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#ffffff', borderRadius: '16px', padding: '32px', width: '90%', maxWidth: '400px', textAlign: 'center', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
            <div style={{ width: '56px', height: '56px', background: '#ecfdf5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto', color: '#10b981' }}>
              <IonIcon icon={checkmarkCircleOutline} style={{ fontSize: '32px' }} />
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#1e293b', margin: '0 0 8px 0' }}>Changes Saved Successfully</h2>
            <p style={{ fontSize: '14px', color: '#64748b', margin: '0 0 24px 0', lineHeight: 1.5 }}>
              The patient profile and uploaded files have been updated in the database directory.
            </p>
            <button 
              className="sa-btn sa-btn--primary" 
              style={{ width: '100%' }}
              onClick={closeAndRedirect}
            >
              Back to Patients Directory
            </button>
          </div>
        </div>
      )}
    </IonPage>
  );
}