import React, { useState } from "react";
import axios from "axios";
import { IonPage, IonContent, IonIcon } from "@ionic/react";
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
  refreshOutline,
  cameraOutline,
  shieldCheckmarkOutline,
} from "ionicons/icons";
import { useHistory } from "react-router-dom";
import { useAuthStore } from "../../store/auth.store";
import { ROUTES } from "../../constants/routes.constant";
import "./branch-admin.css";

export default function BACreateHealerPage() {
  const history = useHistory();
  const { user } = useAuthStore();
  const isBranchAdmin = user?.role === "BRANCH_ADMIN";

  // Dynamic Branch Name
  const rawBranch = typeof user?.branch === 'object' && user?.branch !== null
    ? (user.branch as any).name
    : (user?.branch || 'Main');
  const branchName = rawBranch.toLowerCase().includes('branch') ? rawBranch : `${rawBranch} Branch`;

  // Current Date display
  const formattedDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Form states with requested healer defaults
  const [formData, setFormData] = useState({
    name: "Dr. Aris Varma",
    gender: "Male",
    dob: "1985-08-22",
    mobile: "0876543210",
    email: "aris.v@phms.com",
    address: "45 Lotus Gardens, OM Road, Chennai",
    username: "dr._aris varma",
    password: "PHMS-" + Math.floor(1000 + Math.random() * 9000),
    status: "Active" as "Active" | "Inactive",
    certLevel: "Advanced",
    specialization: "Energy Healing",
    experience: "8",
    languages: "English, Tamil",
    verificationStatus: "Verified Practitioner",
  });

  // Profile Photo state
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);

  // Uploaded files state
  const [uploadedFiles, setUploadedFiles] = useState<{
    idProof: { name: string; size: string } | null;
    certification: { name: string; size: string } | null;
  }>({
    idProof: null,
    certification: null,
  });

  // Success alert/modal control
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [newHealerId, setNewHealerId] = useState("");

  // Handle Input Changes
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Simulate Photo Upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        setProfilePhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Generate new random password
  const handleRegeneratePassword = () => {
    const chars =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let newPass = "PHMS-";
    for (let i = 0; i < 6; i++) {
      newPass += chars[Math.floor(Math.random() * chars.length)];
    }
    setFormData((prev) => ({ ...prev, password: newPass }));
  };

  // Simulate File Upload
  const handleFileChange = (
    field: "idProof" | "certification",
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
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
  const handleClearFile = (
    field: "idProof" | "certification",
    e: React.MouseEvent,
  ) => {
    e.stopPropagation();
    setUploadedFiles((prev) => ({
      ...prev,
      [field]: null,
    }));
  };

  // Handle Submit
  // const handleSaveProfile = (e: React.FormEvent) => {
  //   e.preventDefault();
  //   if (!formData.name.trim()) {
  //     alert('Healer Full Name is required.');
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

  //   // Generate random healer registration ID
  //   const generatedId = `PHMS-H-${Math.floor(10000 + Math.random() * 90000)}`;
  //   setNewHealerId(generatedId);
  //   setShowSuccessToast(true);
  // };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert("Healer Full Name is required.");
      return;
    }

    if (!formData.mobile.trim()) {
      alert("Phone Number is required.");
      return;
    }

    if (!formData.email.trim() || !formData.email.includes("@")) {
      alert("A valid email address is required.");
      return;
    }

    try {
      const payload = {
        ...formData,
        branchId: typeof user?.branch === 'object' && user?.branch !== null 
          ? (user.branch as any).id 
          : (user as any)?.branchId || undefined
      };

      const response = await axios.post(
        "http://localhost:5000/api/healers",
        payload,
      );

      console.log("API Response:", response.data);

      setNewHealerId(response.data.data.healerId);

      setFormData({
        name: "",
        gender: "Male",
        dob: "",
        mobile: "",
        email: "",
        address: "",
        username: "",
        password: "PHMS-" + Math.floor(1000 + Math.random() * 9000),
        status: "Active",
        certLevel: "",
        specialization: "",
        experience: "",
        languages: "",
        verificationStatus: "Pending Review",
      });

      setProfilePhoto(null);

      setUploadedFiles({
        idProof: null,
        certification: null,
      });

      setShowSuccessToast(true);
    } catch (error) {
      console.error("Create Healer Error:", error);

      alert("Failed to create healer");
    }
  };

  const closeAndRedirect = () => {
    setShowSuccessToast(false);
    history.push(ROUTES.BRANCH_ADMIN.HEALERS);
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
                  Access Denied. Healer profile creation is restricted
                  exclusively to authorized Branch Admin users.
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
      background: "#ffffff",
      borderRadius: "16px",
      padding: "28px",
      border: "1px solid #e2e8f0",
      boxShadow:
        "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.025)",
      display: "flex",
      flexDirection: "column" as const,
      gap: "20px",
    },
    subHeader: {
      display: "flex",
      alignItems: "center",
      gap: "10px",
      fontSize: "18px",
      fontWeight: 700,
      color: "#0D5C46",
      marginTop: "4px",
      marginBottom: "12px",
    },
    subHeaderIcon: {
      color: "#0D5C46",
      fontSize: "22px",
    },
    label: {
      fontSize: "11px",
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
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                  }}
                >
                  <h1
                    style={{
                      color: "#0d5c46",
                      fontWeight: 800,
                      fontSize: "20px",
                      margin: 0,
                      lineHeight: 1.2,
                    }}
                  >
                    Create Healer Profile
                  </h1>
                  <p
                    style={{
                      fontSize: "13px",
                      color: "#64748b",
                      margin: "4px 0 0 0",
                      lineHeight: 1.2,
                    }}
                  >
                    Pranic Healing Management System • {branchName} • {formattedDate}
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
                  Healers Registry
                </span>
              </div>
            </header>

            {/* Main Form Workspace */}
            <div className="db-hc-layout" style={{ padding: "28px" }}>
              <form
                onSubmit={handleSaveProfile}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "28px",
                }}
              >
                {/* 2-Column Grid Layout matching visual screenshots style */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1.2fr 1fr",
                    gap: "28px",
                    alignItems: "start",
                  }}
                >
                  {/* LEFT COLUMN: Basic Information, Professional Details */}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "28px",
                    }}
                  >
                    {/* Card 1: Basic Information */}
                    <div style={customStyles.formCard}>
                      <div>
                        <div style={customStyles.subHeader}>
                          <IonIcon
                            icon={personOutline}
                            style={customStyles.subHeaderIcon}
                          />
                          <span>Basic Information</span>
                        </div>

                        <div className="st-form" style={{ gap: "18px" }}>
                          {/* Photo Upload Section */}
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "16px",
                              marginBottom: "8px",
                            }}
                          >
                            <div
                              style={{
                                position: "relative",
                                width: "64px",
                                height: "64px",
                                borderRadius: "50%",
                                background: "#e2e8f0",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                overflow: "hidden",
                                border: "2px solid #cbd5e1",
                              }}
                            >
                              {profilePhoto ? (
                                <img
                                  src={profilePhoto}
                                  alt="Healer avatar"
                                  style={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover",
                                  }}
                                />
                              ) : (
                                <span
                                  style={{
                                    fontSize: "24px",
                                    fontWeight: 700,
                                    color: "#475569",
                                  }}
                                >
                                  D
                                </span>
                              )}
                            </div>
                            <label
                              className="sa-btn sa-btn--outline sa-btn--sm"
                              style={{
                                cursor: "pointer",
                                margin: 0,
                                padding: "8px 16px",
                                display: "flex",
                                alignItems: "center",
                                gap: "6px",
                                fontSize: "12px",
                              }}
                            >
                              <IonIcon icon={cameraOutline} />
                              Change Photo
                              <input
                                type="file"
                                accept="image/*"
                                style={{ display: "none" }}
                                onChange={handlePhotoUpload}
                              />
                            </label>
                          </div>

                          <div className="st-form-group">
                            <label style={customStyles.label}>
                              HEALER FULL NAME *
                            </label>
                            <input
                              type="text"
                              name="name"
                              style={customStyles.grayInput}
                              value={formData.name}
                              onChange={handleInputChange}
                              required
                              placeholder="Dr. Aris Varma"
                            />
                          </div>

                          <div className="st-form-row">
                            <div className="st-form-group">
                              <label style={customStyles.label}>GENDER</label>
                              <select
                                name="gender"
                                className="st-input"
                                style={customStyles.grayInput}
                                value={formData.gender}
                                onChange={handleInputChange}
                              >
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                              </select>
                            </div>

                            <div className="st-form-group">
                              <label style={customStyles.label}>
                                DATE OF BIRTH
                              </label>
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
                                placeholder="0876543210"
                              />
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
                                placeholder="aris.v@phms.com"
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
                              placeholder="45 Lotus Gardens, OM Road, Chennai"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Card 2: Professional Details */}
                    <div style={customStyles.formCard}>
                      <div>
                        <div style={customStyles.subHeader}>
                          <IonIcon
                            icon={ribbonOutline}
                            style={customStyles.subHeaderIcon}
                          />
                          <span>Professional Details</span>
                        </div>

                        <div className="st-form" style={{ gap: "18px" }}>
                          <div className="st-form-row">
                            <div className="st-form-group">
                              <label style={customStyles.label}>
                                CERTIFICATION LEVEL
                              </label>
                              <select
                                name="certLevel"
                                className="st-input"
                                style={customStyles.grayInput}
                                value={formData.certLevel}
                                onChange={handleInputChange}
                              >
                                <option value="Advanced">Advanced</option>
                                <option value="Associate">Associate</option>
                                <option value="Certified">Certified</option>
                                <option value="Senior">Senior Healer</option>
                              </select>
                            </div>

                            <div className="st-form-group">
                              <label style={customStyles.label}>
                                AREA OF SPECIALIZATION
                              </label>
                              <input
                                type="text"
                                name="specialization"
                                style={customStyles.grayInput}
                                value={formData.specialization}
                                onChange={handleInputChange}
                                placeholder="Energy Healing"
                              />
                            </div>
                          </div>

                          <div className="st-form-row">
                            <div className="st-form-group">
                              <label style={customStyles.label}>
                                YEARS OF EXPERIENCE
                              </label>
                              <input
                                type="number"
                                name="experience"
                                style={customStyles.grayInput}
                                value={formData.experience}
                                onChange={handleInputChange}
                                placeholder="8"
                              />
                            </div>

                            <div className="st-form-group">
                              <label style={customStyles.label}>
                                LANGUAGES KNOWN
                              </label>
                              <input
                                type="text"
                                name="languages"
                                style={customStyles.grayInput}
                                value={formData.languages}
                                onChange={handleInputChange}
                                placeholder="English, Tamil"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* RIGHT COLUMN: Login Details, Verification Documents */}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "28px",
                    }}
                  >
                    {/* Card 3: Login Details */}
                    <div style={customStyles.formCard}>
                      <div>
                        <div style={customStyles.subHeader}>
                          <IonIcon
                            icon={lockClosedOutline}
                            style={customStyles.subHeaderIcon}
                          />
                          <span>Login Details</span>
                        </div>

                        <div className="st-form" style={{ gap: "18px" }}>
                          <div className="st-form-group">
                            <label style={customStyles.label}>USERNAME</label>
                            <input
                              type="text"
                              name="username"
                              style={customStyles.grayInput}
                              value={formData.username}
                              onChange={handleInputChange}
                              placeholder="dr._aris varma"
                            />
                          </div>

                          <div className="st-form-group">
                            <label style={customStyles.label}>
                              PASSWORD (AUTO GENERATED)
                            </label>
                            <div style={{ display: "flex", gap: "10px" }}>
                              <input
                                type="text"
                                name="password"
                                style={{
                                  ...customStyles.grayInput,
                                  fontFamily: "monospace",
                                }}
                                value={formData.password}
                                readOnly
                              />
                              <button
                                type="button"
                                onClick={handleRegeneratePassword}
                                className="sa-btn sa-btn--outline"
                                style={{
                                  margin: 0,
                                  padding: "0 16px",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "6px",
                                  height: "44px",
                                }}
                                title="Regenerate Password"
                              >
                                <IonIcon icon={refreshOutline} />
                                Regenerate
                              </button>
                            </div>
                          </div>

                          <div className="st-form-group">
                            <label style={customStyles.label}>
                              ACCOUNT STATUS
                            </label>
                            <div style={{ display: "flex", gap: "12px" }}>
                              <label
                                style={{
                                  flex: 1,
                                  border:
                                    formData.status === "Active"
                                      ? "2px solid #0D5C46"
                                      : "1px solid #cbd5e1",
                                  background:
                                    formData.status === "Active"
                                      ? "#f0fdf4"
                                      : "white",
                                  padding: "10px",
                                  borderRadius: "8px",
                                  cursor: "pointer",
                                  display: "block",
                                  textAlign: "center",
                                }}
                              >
                                <input
                                  type="radio"
                                  name="status"
                                  value="Active"
                                  checked={formData.status === "Active"}
                                  onChange={() =>
                                    setFormData((prev) => ({
                                      ...prev,
                                      status: "Active",
                                    }))
                                  }
                                  style={{ display: "none" }}
                                />
                                <span
                                  style={{
                                    fontWeight: 700,
                                    fontSize: "13px",
                                    color: "#0d5c46",
                                  }}
                                >
                                  Active
                                </span>
                              </label>

                              <label
                                style={{
                                  flex: 1,
                                  border:
                                    formData.status === "Inactive"
                                      ? "2px solid #dc2626"
                                      : "1px solid #cbd5e1",
                                  background:
                                    formData.status === "Inactive"
                                      ? "#fef2f2"
                                      : "white",
                                  padding: "10px",
                                  borderRadius: "8px",
                                  cursor: "pointer",
                                  display: "block",
                                  textAlign: "center",
                                }}
                              >
                                <input
                                  type="radio"
                                  name="status"
                                  value="Inactive"
                                  checked={formData.status === "Inactive"}
                                  onChange={() =>
                                    setFormData((prev) => ({
                                      ...prev,
                                      status: "Inactive",
                                    }))
                                  }
                                  style={{ display: "none" }}
                                />
                                <span
                                  style={{
                                    fontWeight: 700,
                                    fontSize: "13px",
                                    color: "#dc2626",
                                  }}
                                >
                                  Inactive
                                </span>
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
                          <IonIcon
                            icon={shieldCheckmarkOutline}
                            style={customStyles.subHeaderIcon}
                          />
                          <span>Verification Documents</span>
                        </div>

                        <div className="st-form" style={{ gap: "18px" }}>
                          {/* 1. ID Proof */}
                          <div className="st-form-group">
                            <label style={customStyles.label}>
                              ID PROOF (AADHAAR / PAN / PASSPORT)
                            </label>
                            {uploadedFiles.idProof ? (
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
                                    {uploadedFiles.idProof.name}
                                  </span>
                                </div>
                                <IonIcon
                                  icon={trashOutline}
                                  onClick={(e) => handleClearFile("idProof", e)}
                                  style={{ color: "#ef4444", fontSize: "14px" }}
                                />
                              </div>
                            ) : (
                              <label style={customStyles.dashedUpload}>
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "6px",
                                  }}
                                >
                                  <IonIcon
                                    icon={cloudUploadOutline}
                                    style={{
                                      color: "#94a3b8",
                                      fontSize: "16px",
                                    }}
                                  />
                                  <span
                                    style={{
                                      fontSize: "11px",
                                      color: "#64748b",
                                      fontWeight: 600,
                                    }}
                                  >
                                    Upload ID Proof
                                  </span>
                                </div>
                                <input
                                  type="file"
                                  style={{ display: "none" }}
                                  onChange={(e) =>
                                    handleFileChange("idProof", e)
                                  }
                                />
                              </label>
                            )}
                          </div>

                          {/* 2. Certification */}
                          <div className="st-form-group">
                            <label style={customStyles.label}>
                              CERTIFICATION UPLOAD
                            </label>
                            {uploadedFiles.certification ? (
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
                                    {uploadedFiles.certification.name}
                                  </span>
                                </div>
                                <IonIcon
                                  icon={trashOutline}
                                  onClick={(e) =>
                                    handleClearFile("certification", e)
                                  }
                                  style={{ color: "#ef4444", fontSize: "14px" }}
                                />
                              </div>
                            ) : (
                              <label style={customStyles.dashedUpload}>
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "6px",
                                  }}
                                >
                                  <IonIcon
                                    icon={cloudUploadOutline}
                                    style={{
                                      color: "#94a3b8",
                                      fontSize: "16px",
                                    }}
                                  />
                                  <span
                                    style={{
                                      fontSize: "11px",
                                      color: "#64748b",
                                      fontWeight: 600,
                                    }}
                                  >
                                    Upload Certification
                                  </span>
                                </div>
                                <input
                                  type="file"
                                  style={{ display: "none" }}
                                  onChange={(e) =>
                                    handleFileChange("certification", e)
                                  }
                                />
                              </label>
                            )}
                          </div>

                          {/* 3. Verification Status */}
                          <div className="st-form-group">
                            <label style={customStyles.label}>
                              PROFILE VERIFICATION STATUS
                            </label>
                            <select
                              name="verificationStatus"
                              className="st-input"
                              style={customStyles.grayInput}
                              value={formData.verificationStatus}
                              onChange={handleInputChange}
                            >
                              <option value="Verified Practitioner">
                                Verified Practitioner
                              </option>
                              <option value="Pending Review">
                                Pending Review
                              </option>
                              <option value="Suspended">Suspended</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Buttons Block */}
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
                    Save Profile
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
                Healer Profile Created
              </h3>
              <p
                style={{
                  fontSize: "13px",
                  color: "#64748b",
                  margin: "0",
                  lineHeight: 1.5,
                }}
              >
                Professional records for <strong>{formData.name}</strong> have
                been successfully saved in the branch database.
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
                REGISTERED HEALER ID:
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
                {newHealerId}
              </strong>
            </div>

            <button
              onClick={closeAndRedirect}
              className="sa-btn sa-btn--primary"
              style={{ width: "100%", justifyContent: "center", margin: 0 }}
            >
              Proceed to Healers List
            </button>
          </div>
        </div>
      )}
    </IonPage>
  );
}
