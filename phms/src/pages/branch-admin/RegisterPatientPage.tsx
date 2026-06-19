import React, { useState, useEffect } from "react";
import { IonPage, IonContent, IonIcon } from "@ionic/react";
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
  closeCircleOutline,
  trashOutline,
  shieldCheckmarkOutline,
} from "ionicons/icons";
import { useHistory } from "react-router-dom";
import { useAuthStore } from "../../store/auth.store";
import { ROUTES } from "../../constants/routes.constant";
import { getHealers } from "../../api/healer.api";
import { createPatient } from "../../api/patient.api";
import { uploadDocument } from "../../api/document.api";
import "./branch-admin.css";

export default function BARegisterPatientPage() {
  const history = useHistory();
  const { user } = useAuthStore();
  const isBranchAdmin = user?.role === "BRANCH_ADMIN";

  // Current Date display
  const formattedDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Form states with requested defaults
  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    email: "",
    gender: "Female" as "Male" | "Female" | "Other",
    dateOfBirth: "",
    age: "",
    bloodGroup: "O+",
    occupation: "",
    emergencyContact: "",
    address: "",
    status: "Active" as "Active" | "On Hold" | "Completed" | "Inactive",
    medicalHistory: "",
    treatmentType: "Pranic Psychotherapy",
    assignedHealer: "",
    password: "",
    accountStatus: "Active" as "Active" | "Inactive",
  });

  // Uploaded files state for the 7 requested fields
  const [uploadedFiles, setUploadedFiles] = useState<{
    [key: string]: { file?: File; name: string; size: string } | null;
  }>({
    reports: null,
    labResults: null,
    prescriptions: null,
    scanImages: null,
    consultationNotes: null,
    idProofs: null,
    healingRecords: null,
  });

  // Success alert/modal control
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [newPatientId, setNewPatientId] = useState("");

  // Error alert/modal control
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [healers, setHealers] = useState<any[]>([]);

  useEffect(() => {
    const fetchHealers = async () => {
      try {
        const response = await getHealers();
        if (response.success) {
          setHealers(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch healers", error);
      }
    };
    fetchHealers();
  }, []);

  // Handle Input Changes
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Simulate File Upload
  const handleFileChange = (
    field: string,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
      setUploadedFiles((prev) => ({
        ...prev,
        [field]: { file, name: file.name, size: `${sizeMB} MB` },
      }));
    }
  };

  // Clear Uploaded File
  const handleClearFile = (field: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid triggering file chooser again
    setUploadedFiles((prev) => ({
      ...prev,
      [field]: null,
    }));
  };

  // Clear all form inputs and uploaded files
  const handleClearForm = () => {
    setFormData({
      name: "",
      mobile: "",
      email: "",
      gender: "" as any,
      dateOfBirth: "",
      age: "",
      bloodGroup: "",
      occupation: "",
      emergencyContact: "",
      address: "",
      status: "Active",
      medicalHistory: "",
      treatmentType: "",
      assignedHealer: "",
      password: "",
      accountStatus: "Active",
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

  // Generate random password like PHMS-XXXX
  const handleRegeneratePassword = () => {
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    setFormData((prev) => ({
      ...prev,
      password: `PHMS-${randomDigits}`,
    }));
  };

  // Handle Submit
  // const handleSaveRecord = (e: React.FormEvent) => {
  //   e.preventDefault();
  //   if (!formData.name.trim()) {
  //     alert('Patient Full Name is required.');
  //     return;
  //   }
  //   if (!formData.mobile.trim()) {
  //     alert('Phone Number is required.');
  //     return;
  //   }
  //   if (!formData.email.trim() || !formData.email.includes('@')) {
  //     alert('A valid email address is required.');
  //     return;
  //   }

  //   // Generate random patient ID for tracking
  //   const generatedId = `PHMS-P-${Math.floor(10000 + Math.random() * 90000)}`;
  //   setNewPatientId(generatedId);
  //   setShowSuccessToast(true);
  // };

  const handleSaveRecord = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const payload = {
        name: formData.name,
        age: Number(formData.age),
        gender: formData.gender,
        phone: formData.mobile,
        email: formData.email,
        address: formData.address,

        dob: formData.dateOfBirth,
        emergencyContact: formData.emergencyContact,
        bloodGroup: formData.bloodGroup,
        occupation: formData.occupation,
        medicalHistory: formData.medicalHistory,
        treatmentType: formData.treatmentType,
        healerId: formData.assignedHealer,
        password: formData.password,
        status: formData.accountStatus,
        branchId: typeof user?.branch === 'object' && user?.branch !== null 
          ? (user.branch as any).id 
          : (user as any)?.branchId || undefined,
      };

      const result = await createPatient(payload);

      const realPatientId = result.data.id;
      setNewPatientId(result.data.patientId);

      // Upload documents
      const uploadPromises: Promise<any>[] = [];
      const documentTypes: Record<string, string> = {
        reports: "MEDICAL_REPORT",
        labResults: "LAB_REPORT",
        prescriptions: "PRESCRIPTION",
        idProofs: "ID_PROOF",
      };

      Object.entries(uploadedFiles).forEach(([field, data]) => {
        if (data && data.file && documentTypes[field]) {
          uploadPromises.push(
            uploadDocument(realPatientId, data.file, documentTypes[field])
          );
        }
      });

      if (uploadPromises.length > 0) {
        await Promise.all(uploadPromises);
      }

      // Clear form
      setFormData({
        name: "",
        mobile: "",
        email: "",
        gender: "Female",
        dateOfBirth: "",
        age: "",
        bloodGroup: "O+",
        occupation: "",
        emergencyContact: "",
        address: "",
        status: "Active",
        medicalHistory: "",
        treatmentType: "Pranic Psychotherapy",
        assignedHealer: "",
        password: "",
        accountStatus: "Active",
      });

      // Clear uploaded files
      setUploadedFiles({
        reports: null,
        labResults: null,
        prescriptions: null,
        scanImages: null,
        consultationNotes: null,
        idProofs: null,
        healingRecords: null,
      });

      setShowSuccessToast(true);
      console.log("Patient registered successfully:", result.data);
    } catch (error: any) {
      console.error(error);
      const msg = error.response?.data?.message || "Failed to register patient";
      if (msg.toLowerCase().includes("email") && msg.toLowerCase().includes("already")) {
        setErrorMessage("A patient with this email address already exists. Please use a different email.");
      } else {
        setErrorMessage(msg);
      }
      setShowErrorModal(true);
    }
  };

  const closeAndRedirect = () => {
    setShowSuccessToast(false);
    // Use replace so Ionic removes this page from the stack and
    // fires useIonViewWillEnter on PatientsPage, triggering a fresh fetch.
    history.replace(ROUTES.BRANCH_ADMIN.PATIENTS);
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
                <span className="db-access-restricted-title">
                  Unauthorized Node Access
                </span>
                <p className="db-access-restricted-desc">
                  Access Denied. Patient registration is restricted exclusively
                  to authorized Branch Admin users.
                </p>
              </div>
            </div>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  // Custom CSS Style Blocks for exact matching with user images
  const customStyles = {
    formCard: {
      background: "#ffffff",
      borderRadius: "16px",
      padding: "28px",
      border: "1px solid #e2e8f0",
      boxShadow:
        "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.025)",
      display: "flex",
      flexDirection: "column" as const,
      gap: "24px",
    },
    subHeader: {
      display: "flex",
      alignItems: "center",
      gap: "10px",
      fontSize: "18px",
      fontWeight: 700,
      color: "#0D5C46",
      marginTop: "8px",
      marginBottom: "16px",
    },
    subHeaderIcon: {
      color: "#0D5C46",
      fontSize: "22px",
    },
    label: {
      fontSize: "11px",
      marginTop: "10px",
      fontWeight: 800,
      color: "#475569",
      letterSpacing: "0.5px",
      marginBottom: "6px",
      textTransform: "uppercase" as const,
    },
    grayInput: {
      background: "#f8fafc",
      border: "1px solid #e2e8f0",
      borderRadius: "8px",
      padding: "12px 16px",
      fontSize: "14px",
      color: "#1e293b",
      outline: "none",
      width: "100%",
      transition: "all 0.2s ease",
    },
    grayTextarea: {
      background: "#f8fafc",
      border: "1px solid #e2e8f0",
      borderRadius: "8px",
      padding: "12px 16px",
      fontSize: "14px",
      color: "#1e293b",
      outline: "none",
      width: "100%",
      resize: "none" as const,
      lineHeight: 1.5,
      transition: "all 0.2s ease",
    },
    dashedUpload: {
      background: "#f8fafc",
      border: "1px dashed #cbd5e1",
      borderRadius: "8px",
      height: "38px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: "pointer",
      width: "100%",
      transition: "all 0.2s ease",
      position: "relative" as const,
    },
    dashedUploadActive: {
      background: "#f0fdf4",
      border: "1px solid #a7f3d0",
      borderRadius: "8px",
      height: "38px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 12px",
      cursor: "pointer",
      width: "100%",
    },
    statusCard: {
      display: "flex",
      flexDirection: "column" as const,
      alignItems: "center",
      justifyContent: "center",
      padding: "20px 12px",
      borderRadius: "12px",
      cursor: "pointer",
      textAlign: "center" as const,
      transition: "all 0.2s ease",
      width: "100%",
      minHeight: "104px",
    },
  };

  return (
    <IonPage className="sa-page">
      <IonContent
        className="sa-page__content"
        style={{ "--background": "#f8fafc" }}
        fullscreen
      >
        <div className="db-corp-layout" style={{ background: "#f8fafc" }}>
          <main className="db-corp-canvas">
            {/* Horizontal Header Navbar */}
            <header
              className="db-corp-navbar"
              style={{
                background: "#ffffff",
                borderBottom: "1px solid #e2e8f0",
                padding: "16px 24px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "16px" }}
              >
                <button
                  className="db-corp-nav-icon-btn"
                  onClick={() => history.push(ROUTES.BRANCH_ADMIN.DASHBOARD)}
                  title="Back to Dashboard"
                  style={{
                    background: "#f1f5f9",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    width: "40px",
                    height: "40px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    padding: 0,
                    flexShrink: 0,
                    transition: "all 0.2s ease",
                  }}
                >
                  <IonIcon
                    icon={arrowBackOutline}
                    style={{ color: "#0D5C46", fontSize: "20px" }}
                  />
                </button>
                <div
                  className="db-corp-navbar-left"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                  }}
                >
                  <h1
                    className="db-corp-page-title"
                    style={{
                      color: "#0d5c46",
                      fontWeight: 800,
                      fontSize: "20px",
                      margin: 0,
                      lineHeight: 1.2,
                    }}
                  >
                    Register Patient
                  </h1>
                  <p
                    className="db-corp-page-subtitle"
                    style={{
                      fontSize: "13px",
                      color: "#64748b",
                      margin: "4px 0 0 0",
                      lineHeight: 1.2,
                    }}
                  >
                    Pranic Healing Management System • {formattedDate}
                  </p>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center" }}>
                <div
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    background: "#10b981",
                    marginRight: "8px",
                  }}
                />
                <span
                  style={{
                    fontSize: "11px",
                    color: "#64748b",
                    fontWeight: 700,
                    textTransform: "uppercase",
                  }}
                >
                  Patient Registry
                </span>
              </div>
            </header>

            {/* Main Form Workspace Area */}
            <div className="db-hc-layout" style={{ padding: "28px" }}>
              <form
                onSubmit={handleSaveRecord}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "28px",
                }}
              >
                {/* 2-Column Grid Layout matching user images */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1.2fr 1fr",
                    gap: "28px",
                    alignItems: "start",
                  }}
                >
                  {/* LEFT COLUMN: Identity, Contact, Address, Status */}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "28px",
                    }}
                  >
                    {/* Card 1: Patient Identity & Contact Info */}
                    <div style={customStyles.formCard}>
                      {/* Section 1: Patient Identity */}
                      <div>
                        <div style={customStyles.subHeader}>
                          <IonIcon
                            icon={personOutline}
                            style={customStyles.subHeaderIcon}
                          />
                          <span>Patient Identity</span>
                        </div>
                        <div className="st-form-group">
                          <label style={customStyles.label}>
                            PATIENT FULL NAME *
                          </label>
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
                        <div
                          className="st-form-row"
                          style={{ marginTop: "16px" }}
                        >
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
                            <label style={customStyles.label}>
                              DATE OF BIRTH *
                            </label>
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
                        <div
                          className="st-form-row"
                          style={{ marginTop: "16px" }}
                        >
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
                              required
                            />
                          </div>
                          <div className="st-form-group">
                            <label style={customStyles.label}>
                              BLOOD GROUP *
                            </label>
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
                          <IonIcon
                            icon={callOutline}
                            style={customStyles.subHeaderIcon}
                          />
                          <span>Contact Information</span>
                        </div>

                        <div
                          className="st-form-row"
                          style={{ marginBottom: "16px" }}
                        >
                          <div className="st-form-group">
                            <label style={customStyles.label}>
                              PHONE NUMBER *
                            </label>
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
                          <label style={customStyles.label}>
                            EMERGENCY CONTACT DETAILS
                          </label>
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
                          <IonIcon
                            icon={locationOutline}
                            style={customStyles.subHeaderIcon}
                          />
                          <span>Address</span>
                        </div>
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
                    </div>
                  </div>

                  {/* RIGHT COLUMN: Medical History, Assigned Healer, Uploaded Documents */}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "28px",
                      width: "100%",
                    }}
                  >
                    {/* Card 1: Medical History & Allocation */}
                    <div style={customStyles.formCard}>
                      {/* Section 1: Medical History */}
                      <div>
                        <div style={customStyles.subHeader}>
                          <IonIcon
                            icon={medkitOutline}
                            style={customStyles.subHeaderIcon}
                          />
                          <span>Medical History</span>
                        </div>
                        <div className="st-form-group">
                          <label style={customStyles.label}>
                            CONDITIONS, TREATMENTS &amp; ALLERGIES
                          </label>
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
                      <div
                        className="st-form-group"
                        style={{ marginTop: "8px" }}
                      >
                        <label style={customStyles.label}>
                          ASSIGN TREATMENT TYPE
                        </label>
                        <select
                          name="treatmentType"
                          className="st-input"
                          style={customStyles.grayInput}
                          value={formData.treatmentType}
                          onChange={handleInputChange}
                        >
                          <option value="">Select Treatment Type</option>
                          <option value="Pranic Psychotherapy">
                            Pranic Psychotherapy
                          </option>
                          <option value="Advanced Pranic Healing">
                            Advanced Pranic Healing
                          </option>
                          <option value="Crystal Pranic Healing">
                            Crystal Pranic Healing
                          </option>
                          <option value="Basic Pranic Healing">
                            Basic Pranic Healing
                          </option>
                        </select>
                      </div>

                      {/* Section 3: Assigned Healer */}
                      <div>
                        <div style={customStyles.subHeader}>
                          <IonIcon
                            icon={peopleOutline}
                            style={customStyles.subHeaderIcon}
                          />
                          <span>Assigned Healer</span>
                        </div>
                        <div className="st-form-group">
                          <label style={customStyles.label}>
                            RESPONSIBLE HEALER
                          </label>
                          <select
                            name="assignedHealer"
                            className="st-input"
                            style={customStyles.grayInput}
                            value={formData.assignedHealer}
                            onChange={handleInputChange}
                          >
                            <option value="">Select Healer</option>
                            {healers.map((healer: any) => (
                              <option key={healer.id} value={healer.id}>
                                {healer.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Card 2: Login Details */}
                    <div style={customStyles.formCard}>
                      <div style={customStyles.subHeader}>
                        <IonIcon
                          icon={shieldCheckmarkOutline}
                          style={customStyles.subHeaderIcon}
                        />
                        <span>Login Details</span>
                      </div>

                      <div className="st-form-group">
                            <label style={customStyles.label}>
                              EMAIL ADDRESS *
                            </label>
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
                        <label style={customStyles.label}>
                          PASSWORD (AUTO GENERATED)
                        </label>
                        <div style={{ display: "flex", gap: "12px" }}>
                          <input
                            type="text"
                            name="password"
                            style={{
                              ...customStyles.grayInput,
                              fontWeight: "bold",
                            }}
                            value={formData.password}
                            onChange={handleInputChange}
                            placeholder="PHMS-XXXX"
                          />
                          <button
                            type="button"
                            onClick={handleRegeneratePassword}
                            style={{
                              background: "#0D5C46",
                              border: "none",
                              borderRadius: "8px",
                              padding: "10px 16px",
                              fontSize: "12px",
                              fontWeight: 600,
                              color: "#ffffff",
                              cursor: "pointer",
                              whiteSpace: "nowrap",
                              transition: "background 0.2s ease",
                            }}
                          >
                            {formData.password ? "Regenerate" : "Generate"}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label style={customStyles.label}>ACCOUNT STATUS</label>
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr",
                            gap: "12px",
                            marginTop: "6px",
                          }}
                        >
                          {/* Active */}
                          <div
                            onClick={() =>
                              setFormData((prev) => ({
                                ...prev,
                                accountStatus: "Active",
                              }))
                            }
                            style={{
                              padding: "12px",
                              borderRadius: "8px",
                              border:
                                formData.accountStatus === "Active"
                                  ? "2px solid #10b981"
                                  : "1px solid #cbd5e1",
                              background:
                                formData.accountStatus === "Active"
                                  ? "#f0fdf4"
                                  : "#f8fafc",
                              cursor: "pointer",
                              textAlign: "center",
                              fontWeight: 700,
                              fontSize: "13px",
                              color:
                                formData.accountStatus === "Active"
                                  ? "#047857"
                                  : "#475569",
                              transition: "all 0.2s ease",
                            }}
                          >
                            Active
                          </div>

                          {/* Inactive */}
                          <div
                            onClick={() =>
                              setFormData((prev) => ({
                                ...prev,
                                accountStatus: "Inactive",
                              }))
                            }
                            style={{
                              padding: "12px",
                              borderRadius: "8px",
                              border:
                                formData.accountStatus === "Inactive"
                                  ? "2px solid #ef4444"
                                  : "1px solid #cbd5e1",
                              background:
                                formData.accountStatus === "Inactive"
                                  ? "#fef2f2"
                                  : "#f8fafc",
                              cursor: "pointer",
                              textAlign: "center",
                              fontWeight: 700,
                              fontSize: "13px",
                              color:
                                formData.accountStatus === "Inactive"
                                  ? "#b91c1c"
                                  : "#475569",
                              transition: "all 0.2s ease",
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
                    <IonIcon
                      icon={documentTextOutline}
                      style={customStyles.subHeaderIcon}
                    />
                    <span>Uploaded Documents</span>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fill, minmax(180px, 1fr))",
                      gap: "20px",
                    }}
                  >
                    {/* 1. Medical Reports */}
                    <div className="st-form-group">
                      <label style={customStyles.label}>Medical Reports</label>
                      {uploadedFiles.reports ? (
                        <div style={customStyles.dashedUploadActive}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "6px",
                              width: "80%",
                            }}
                          >
                            <IonIcon
                              icon={checkmarkCircleOutline}
                              style={{ color: "#10b981" }}
                            />
                            <span
                              style={{
                                fontSize: "11px",
                                color: "#065f46",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {uploadedFiles.reports.name}
                            </span>
                          </div>
                          <IonIcon
                            icon={trashOutline}
                            onClick={(e) => handleClearFile("reports", e)}
                            style={{ color: "#ef4444", fontSize: "14px" }}
                          />
                        </div>
                      ) : (
                        <label style={customStyles.dashedUpload}>
                          <IonIcon
                            icon={cloudUploadOutline}
                            style={{ color: "#94a3b8", fontSize: "18px" }}
                          />
                          <input
                            type="file"
                            style={{ display: "none" }}
                            onChange={(e) => handleFileChange("reports", e)}
                          />
                        </label>
                      )}
                    </div>

                    {/* 2. Lab Results */}
                    <div className="st-form-group">
                      <label style={customStyles.label}>Lab Results</label>
                      {uploadedFiles.labResults ? (
                        <div style={customStyles.dashedUploadActive}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "6px",
                              width: "80%",
                            }}
                          >
                            <IonIcon
                              icon={checkmarkCircleOutline}
                              style={{ color: "#10b981" }}
                            />
                            <span
                              style={{
                                fontSize: "11px",
                                color: "#065f46",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {uploadedFiles.labResults.name}
                            </span>
                          </div>
                          <IonIcon
                            icon={trashOutline}
                            onClick={(e) => handleClearFile("labResults", e)}
                            style={{ color: "#ef4444", fontSize: "14px" }}
                          />
                        </div>
                      ) : (
                        <label style={customStyles.dashedUpload}>
                          <IonIcon
                            icon={cloudUploadOutline}
                            style={{ color: "#94a3b8", fontSize: "18px" }}
                          />
                          <input
                            type="file"
                            style={{ display: "none" }}
                            onChange={(e) => handleFileChange("labResults", e)}
                          />
                        </label>
                      )}
                    </div>

                    {/* 3. Prescriptions */}
                    <div className="st-form-group">
                      <label style={customStyles.label}>Prescriptions</label>
                      {uploadedFiles.prescriptions ? (
                        <div style={customStyles.dashedUploadActive}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "6px",
                              width: "80%",
                            }}
                          >
                            <IonIcon
                              icon={checkmarkCircleOutline}
                              style={{ color: "#10b981" }}
                            />
                            <span
                              style={{
                                fontSize: "11px",
                                color: "#065f46",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {uploadedFiles.prescriptions.name}
                            </span>
                          </div>
                          <IonIcon
                            icon={trashOutline}
                            onClick={(e) => handleClearFile("prescriptions", e)}
                            style={{ color: "#ef4444", fontSize: "14px" }}
                          />
                        </div>
                      ) : (
                        <label style={customStyles.dashedUpload}>
                          <IonIcon
                            icon={cloudUploadOutline}
                            style={{ color: "#94a3b8", fontSize: "18px" }}
                          />
                          <input
                            type="file"
                            style={{ display: "none" }}
                            onChange={(e) =>
                              handleFileChange("prescriptions", e)
                            }
                          />
                        </label>
                      )}
                    </div>

                    {/* 4. Scan Images */}
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

                    {/* 5. Consultation Notes */}
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

                    {/* 6. ID Proofs */}
                    <div className="st-form-group">
                      <label style={customStyles.label}>ID Proofs</label>
                      {uploadedFiles.idProofs ? (
                        <div style={customStyles.dashedUploadActive}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "6px",
                              width: "80%",
                            }}
                          >
                            <IonIcon
                              icon={checkmarkCircleOutline}
                              style={{ color: "#10b981" }}
                            />
                            <span
                              style={{
                                fontSize: "11px",
                                color: "#065f46",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {uploadedFiles.idProofs.name}
                            </span>
                          </div>
                          <IonIcon
                            icon={trashOutline}
                            onClick={(e) => handleClearFile("idProofs", e)}
                            style={{ color: "#ef4444", fontSize: "14px" }}
                          />
                        </div>
                      ) : (
                        <label style={customStyles.dashedUpload}>
                          <IonIcon
                            icon={cloudUploadOutline}
                            style={{ color: "#94a3b8", fontSize: "18px" }}
                          />
                          <input
                            type="file"
                            style={{ display: "none" }}
                            onChange={(e) => handleFileChange("idProofs", e)}
                          />
                        </label>
                      )}
                    </div>

                    {/* 7. Healing Records */}
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

                {/* Bottom Footer Actions block (matches bottom right layout in image) */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: "16px",
                    marginTop: "12px",
                    marginBottom: "28px",
                  }}
                >
                  <button
                    type="button"
                    onClick={handleClearForm}
                    style={{
                      background: "#ffffff",
                      border: "1px solid #cbd5e1",
                      borderRadius: "8px",
                      padding: "10px 24px",
                      fontSize: "14px",
                      fontWeight: 600,
                      color: "#ef4444",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      marginRight: "auto",
                    }}
                  >
                    Clear Form
                  </button>

                  <button
                    type="button"
                    onClick={() => history.push(ROUTES.BRANCH_ADMIN.DASHBOARD)}
                    style={{
                      background: "#ffffff",
                      border: "1px solid #cbd5e1",
                      borderRadius: "8px",
                      padding: "10px 24px",
                      fontSize: "14px",
                      fontWeight: 600,
                      color: "#475569",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                    }}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    style={{
                      background: "#0D5C46",
                      border: "none",
                      borderRadius: "8px",
                      padding: "10px 28px",
                      fontSize: "14px",
                      fontWeight: 600,
                      color: "#ffffff",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
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
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(15,23,42,0.6)",
            backdropFilter: "blur(4px)",
          }}
        >
          <div
            className="db-corp-card"
            style={{
              maxWidth: "420px",
              width: "90%",
              padding: "32px",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "16px",
              animation: "scaleUp 0.3s ease-out",
            }}
          >
            <div
              style={{
                width: "64px",
                height: "64px",
                borderRadius: "50%",
                background: "#ecfdf5",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <IonIcon
                icon={checkmarkCircleOutline}
                style={{ color: "#10b981", fontSize: "40px" }}
              />
            </div>
            <div>
              <h3
                style={{
                  fontSize: "18px",
                  fontWeight: "800",
                  color: "#1e293b",
                  margin: "0 0 6px 0",
                }}
              >
                Patient Registered Successfully
              </h3>
              <p
                style={{
                  fontSize: "13px",
                  color: "#64748b",
                  margin: "0",
                  lineHeight: 1.5,
                }}
              >
                Folder for <strong>{formData.name}</strong> has been
                successfully initialized in the branch registry.
              </p>
            </div>

            <div
              style={{
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                padding: "10px 16px",
                borderRadius: "8px",
                fontSize: "13px",
                width: "100%",
              }}
            >
              <span style={{ color: "#64748b", fontWeight: 600 }}>
                SYSTEM RECORD ID:
              </span>
              <strong
                style={{
                  color: "#0D5C46",
                  display: "block",
                  fontSize: "15px",
                  marginTop: "2px",
                  fontFamily: "monospace",
                }}
              >
                {newPatientId}
              </strong>
            </div>

            <button
              onClick={closeAndRedirect}
              className="sa-btn sa-btn--primary"
              style={{ width: "100%", justifyContent: "center", margin: 0 }}
            >
              Proceed to Patient Registry
            </button>
          </div>
        </div>
      )}

      {/* Error Modal */}
      {showErrorModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(15,23,42,0.6)",
            backdropFilter: "blur(4px)",
          }}
        >
          <div
            className="db-corp-card"
            style={{
              maxWidth: "420px",
              width: "90%",
              padding: "32px",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "16px",
              animation: "scaleUp 0.3s ease-out",
            }}
          >
            <div
              style={{
                width: "64px",
                height: "64px",
                borderRadius: "50%",
                background: "#fef2f2",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <IonIcon
                icon={closeCircleOutline}
                style={{ color: "#ef4444", fontSize: "40px" }}
              />
            </div>
            <div>
              <h3
                style={{
                  fontSize: "18px",
                  fontWeight: "800",
                  color: "#1e293b",
                  margin: "0 0 6px 0",
                }}
              >
                Action Failed
              </h3>
              <p
                style={{
                  fontSize: "13px",
                  color: "white",
                  margin: "0",
                  lineHeight: 1.5,
                }}
              >
                {errorMessage}
              </p>
            </div>

            <button
              onClick={() => setShowErrorModal(false)}
              className="sa-btn sa-btn--primary"
              style={{ width: "100%", justifyContent: "center", margin: 0, background: "#ef4444", border: "none" }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </IonPage>
  );
}
