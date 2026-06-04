import React, { useState, useEffect, useRef } from 'react';
import {
  IonPage,
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonIcon,
  IonMenuButton,
  IonModal,
} from '@ionic/react';
import {
  searchOutline,
  addOutline,
  documentTextOutline,
  cloudUploadOutline,
  funnelOutline,
  ellipsisVerticalOutline,
  heartOutline,
  eyeOutline,
  pieChartOutline,
  folderOpenOutline,
  documentOutline,
  chevronBackOutline,
  chevronForwardOutline,
  closeOutline,
  printOutline,
  downloadOutline,
} from 'ionicons/icons';
import { useAuthStore } from '../../store/auth.store';
import './branch-admin.css';

interface UploadedDocument {
  id: number;
  documentName: string;
  patientName: string;
  type: 'Doctor Report' | 'Lab Report' | 'Consultation Note' | 'Other';
  date: string;
  format: 'PDF' | 'JPG' | 'PNG' | 'DOCX' | 'XLSX';
  size: string;
  uploadedBy: string;
  assignedHealer?: string; // BRD Requirement: Healer Visibility restriction
}



const DocumentManagementPage: React.FC = () => {
  const { user } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Dynamic Branch Names
  const rawBranch = typeof user?.branch === 'object' && user?.branch !== null
    ? (user.branch as any).name
    : (user?.branch || 'Mumbai Main');
  const branchName = rawBranch.toLowerCase().includes('branch') ? rawBranch : `${rawBranch} Branch`;

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [showAll, setShowAll] = useState(false);
  const itemsPerPage = 5;

  // Full-Page Document Viewer State
  const [selectedViewDoc, setSelectedViewDoc] = useState<UploadedDocument | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleRecentReportClick = (reportTitle: string, patientName: string) => {
    setSelectedViewDoc({
      id: Date.now(),
      documentName: `${reportTitle.replace(/\s+/g, '_')}.pdf`,
      patientName: patientName,
      type: reportTitle.includes('Cardiology') ? 'Doctor Report' : 'Lab Report',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      format: 'PDF',
      size: '1.2 MB',
      uploadedBy: 'Dr. Shailesh [Cardiology]',
      assignedHealer: 'Dr. Shailesh'
    });
  };

  // Add Document Modal State
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    patientName: '',
    documentType: 'Doctor Report' as 'Doctor Report' | 'Lab Report' | 'Consultation Note' | 'Other',
    selectedFileName: '',
  });

  // Load patients list from localStorage with fallback defaults
  const [patientOptions] = useState<string[]>(() => {
    const saved = localStorage.getItem('phms_patients');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Unique list of patient names
          const names = parsed.map((p: any) => p.name);
          return Array.from(new Set(names));
        }
      } catch (e) {
        console.error(e);
      }
    }
    return ['Arjun Sharma', 'Priya Kapoor', 'Rahul Verma', 'Meera Singh'];
  });

  // Mock Upload Progress State
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadingFileName, setUploadingFileName] = useState('');

  // Primary Documents State (BRD Categories + Healer Assignments)
  const [documents, setDocuments] = useState<UploadedDocument[]>(() => {
    const cached = localStorage.getItem('phms_uploaded_documents');
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        console.error(e);
      }
    }
    const defaults: UploadedDocument[] = [
      {
        id: 1,
        documentName: 'Post-Op_Scan_V1.pdf',
        patientName: 'Arjun Sharma',
        type: 'Doctor Report',
        date: 'Oct 24, 2023',
        format: 'PDF',
        size: '2.4 MB',
        uploadedBy: 'Dr. Shailesh [Cardiology]',
        assignedHealer: 'Dr. Shailesh',
      },
      {
        id: 2,
        documentName: 'Blood_Work_Q3.jpg',
        patientName: 'Priya Kapoor',
        type: 'Lab Report',
        date: 'Oct 23, 2023',
        format: 'JPG',
        size: '4.8 MB',
        uploadedBy: 'Lab Tech Priya',
        assignedHealer: 'Healer Julian',
      },
      {
        id: 3,
        documentName: 'Healing_Plan_Final.docx',
        patientName: 'Rahul Verma',
        type: 'Consultation Note',
        date: 'Oct 22, 2023',
        format: 'DOCX',
        size: '1.1 MB',
        uploadedBy: 'Healer Julian',
        assignedHealer: 'Healer Julian',
      },
      {
        id: 4,
        documentName: 'General_Waiver.pdf',
        patientName: 'Meera Singh',
        type: 'Other',
        date: 'Oct 20, 2023',
        format: 'PDF',
        size: '0.8 MB',
        uploadedBy: 'Admin Staff David',
        assignedHealer: 'Dr. Aris Varma',
      },
    ];
    localStorage.setItem('phms_uploaded_documents', JSON.stringify(defaults));
    return defaults;
  });

  useEffect(() => {
    localStorage.setItem('phms_uploaded_documents', JSON.stringify(documents));
  }, [documents]);



  // Handle clicking the dashed dropzone
  const handleDropzoneClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Handle selecting a file from the hidden input
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const fileName = files[0].name;
      // Pre-fill file details and redirect/open the upload modal for remainder details filling
      setUploadForm((prev) => ({
        ...prev,
        selectedFileName: fileName,
      }));
      setShowUploadModal(true);
      // Reset input element value so same file can be selected again
      e.target.value = '';
    }
  };

  // Simulates file encryption and uploading
  const triggerMockUpload = (fileName: string, type: 'Doctor Report' | 'Lab Report' | 'Consultation Note' | 'Other', patient: string) => {
    if (isUploading) return;
    setIsUploading(true);
    setUploadProgress(0);
    setUploadingFileName(fileName);

    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            const extension = (fileName.split('.').pop() || 'PDF').toUpperCase() as any;
            const newDoc: UploadedDocument = {
              id: Date.now(),
              documentName: fileName,
              patientName: patient || 'Guest Patient',
              type: type,
              date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
              format: extension,
              size: `${(Math.random() * 5 + 1).toFixed(1)} MB`,
              uploadedBy: user?.name || 'Branch Admin',
              assignedHealer: user?.name || 'Healer Julian',
            };

            // Prepend new document
            setDocuments((prevDocs) => [newDoc, ...prevDocs]);



            setIsUploading(false);
            setUploadProgress(0);
            setUploadingFileName('');
          }, 300);
          return 100;
        }
        return prev + 10;
      });
    }, 150);
  };

  // Handle submitting from the modal
  const handleModalUploadSubmit = () => {
    const patientName = user?.role === 'PATIENT' ? (user.name || 'Guest Patient') : uploadForm.patientName;
    if (!patientName || !uploadForm.selectedFileName) {
      alert('Please fill out all fields and select a file name.');
      return;
    }
    setShowUploadModal(false);
    triggerMockUpload(
      uploadForm.selectedFileName,
      uploadForm.documentType,
      patientName
    );
    // Reset form
    setUploadForm({
      patientName: '',
      documentType: 'Doctor Report',
      selectedFileName: '',
    });
  };

  // Filter logic
  const filteredDocs = documents.filter((doc) => {
    const matchesSearch =
      doc.documentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.uploadedBy.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = filterType === 'All' || doc.type === filterType;

    // Assigned Healer Visibility Logic (BRD Security Compliance):
    // Documents are visible ONLY to the Assigned Healer and Branch Admins.
    let matchesHealerVisibility = true;
    if (user?.role === 'HEALER') {
      // Healer can only see documents assigned to them or uploaded by them
      matchesHealerVisibility = 
        doc.assignedHealer === user.name || 
        doc.uploadedBy === user.name;
    } else if (user?.role === 'PATIENT') {
      // Patients can only see their own documents
      matchesHealerVisibility = doc.patientName === user.name;
    }

    return matchesSearch && matchesType && matchesHealerVisibility;
  });

  // Dynamic values based on list length
  const totalDocsCount = 1280 + documents.length;
  const docReportsCount = 430 + documents.filter((d) => d.type === 'Doctor Report').length;
  const labReportsCount = 313 + documents.filter((d) => d.type === 'Lab Report').length;
  const consultNotesCount = 535 + documents.filter((d) => d.type === 'Consultation Note').length;

  // Pagination
  const totalPages = Math.ceil(filteredDocs.length / itemsPerPage) || 1;
  const paginatedDocs = showAll
    ? filteredDocs
    : filteredDocs.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
      );

  useEffect(() => {
    setCurrentPage(1);
    setShowAll(false);
  }, [searchQuery, filterType]);

  return (
    <IonPage className="sa-page">
      <IonHeader className="ion-no-border">
        <IonToolbar className="sa-page__toolbar">
          <IonButtons slot="start">
            <IonMenuButton />
          </IonButtons>
          <IonTitle className="sa-page__toolbar-title">Document Workspace</IonTitle>
          <IonButtons slot="end">
            <button className="sa-page__toolbar-avatar">BA</button>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent className="sa-page__content">
        <div className="sa-page__body">

          {/* Action Row */}
          <div className="dm-action-row">
            <div className="dm-action-row__left">
              <h1 className="dm-action-row__title">Document Management</h1>
              <p className="dm-action-row__subtitle">
                Manage medical records, lab results, and healer assessments.
              </p>
            </div>
            <div className="dm-action-row__right">
              
              <button
                className="dm-action-btn dm-action-btn--primary"
                onClick={() => setShowUploadModal(true)}
              >
                <IonIcon icon={addOutline} className="dm-btn-icon dm-btn-icon--plus" />
                Upload Document
              </button>
            </div>
          </div>

          {/* Stat Cards Horizontal Row (4 Cards) */}
          <div className="dm-stats-row">
            <div className="dm-stat-card">
              <div className="dm-stat-card__main">
                <div className="dm-stat-card__left">
                  <div className="dm-stat-card__icon dm-stat-card__icon--teal">
                    <IonIcon icon={documentTextOutline} />
                  </div>
                  <div className="dm-stat-card__meta">
                    <span className="dm-stat-card__label">Total Documents</span>
                    <span className="dm-stat-card__value">{totalDocsCount.toLocaleString()}</span>
                  </div>
                </div>
                <span className="dm-stat-badge dm-stat-badge--success">+12%</span>
              </div>
            </div>

            <div className="dm-stat-card">
              <div className="dm-stat-card__main">
                <div className="dm-stat-card__left">
                  <div className="dm-stat-card__icon dm-stat-card__icon--blue">
                    <IonIcon icon={folderOpenOutline} />
                  </div>
                  <div className="dm-stat-card__meta">
                    <span className="dm-stat-card__label">Doctor Reports</span>
                    <span className="dm-stat-card__value">{docReportsCount}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="dm-stat-card">
              <div className="dm-stat-card__main">
                <div className="dm-stat-card__left">
                  <div className="dm-stat-card__icon dm-stat-card__icon--red">
                    <IonIcon icon={pieChartOutline} />
                  </div>
                  <div className="dm-stat-card__meta">
                    <span className="dm-stat-card__label">Lab Reports</span>
                    <span className="dm-stat-card__value">{labReportsCount}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="dm-stat-card">
              <div className="dm-stat-card__main">
                <div className="dm-stat-card__left">
                  <div className="dm-stat-card__icon dm-stat-card__icon--purple">
                    <IonIcon icon={documentOutline} />
                  </div>
                  <div className="dm-stat-card__meta">
                    <span className="dm-stat-card__label">Consultation Notes</span>
                    <span className="dm-stat-card__value">{consultNotesCount}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Search & Filter Bar (Moved side-by-side above the Recently Uploaded Documents section) */}
          <div className="dm-control-bar">
            {/* Search Input */}
            <div className="dm-body-search">
              <IonIcon icon={searchOutline} className="dm-search-bar-icon" />
              <input
                type="text"
                placeholder="Search patients or files..."
                className="dm-search-bar-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Document Filter Tabs */}
            <div className="dm-panel-filter-tabs">
              <button
                className={`dm-filter-tab ${filterType === 'All' ? 'dm-filter-tab--active' : ''}`}
                onClick={() => setFilterType('All')}
              >
                All
              </button>
              <button
                className={`dm-filter-tab ${filterType === 'Doctor Report' ? 'dm-filter-tab--active' : ''}`}
                onClick={() => setFilterType('Doctor Report')}
              >
                Doctor Report
              </button>
              <button
                className={`dm-filter-tab ${filterType === 'Lab Report' ? 'dm-filter-tab--active' : ''}`}
                onClick={() => setFilterType('Lab Report')}
              >
                Lab Report
              </button>
              <button
                className={`dm-filter-tab ${filterType === 'Consultation Note' ? 'dm-filter-tab--active' : ''}`}
                onClick={() => setFilterType('Consultation Note')}
              >
                Consultation Note
              </button>
              <button
                className={`dm-filter-tab ${filterType === 'Other' ? 'dm-filter-tab--active' : ''}`}
                onClick={() => setFilterType('Other')}
              >
                Other
              </button>
            </div>
          </div>

          {/* Recently Uploaded Documents Panel (Full-Width) */}
          <div className="dm-panel" style={{ marginBottom: '24px' }}>
            <div className="dm-panel__header">
              <h2 className="dm-panel__title">Recently Uploaded Documents</h2>
              <div className="dm-panel__controls">
                {/* <button className="dm-icon-btn">
                  <IonIcon icon={ellipsisVerticalOutline} />
                </button> */}
              </div>
            </div>

            <div className="dm-table-container">
              <table className="dm-table">
                <thead>
                  <tr>
                    <th>DOCUMENT NAME</th>
                    <th>PATIENT NAME</th>
                    <th>TYPE</th>
                    <th>UPLOADED BY</th>
                    <th>DATE</th>
                    {/* <th>FORMAT</th> */}
                  </tr>
                </thead>
                <tbody>
                  {paginatedDocs.length > 0 ? (
                    paginatedDocs.map((doc) => (
                      <tr key={doc.id} className="dm-table-row">
                        <td 
                          className="dm-cell-docname"
                          style={{ cursor: 'pointer' }}
                          onClick={() => setSelectedViewDoc(doc)}
                        >
                          <IonIcon icon={documentOutline} className="dm-cell-icon" />
                          <span className="dm-doc-title" style={{ color: '#1f7a6a', fontWeight: 600 }}>{doc.documentName}</span>
                        </td>
                        <td className="dm-cell-patient">{doc.patientName}</td>
                        <td>
                          <span className={`dm-badge dm-badge--${doc.type.toLowerCase().replace(' ', '-')}`}>
                            {doc.type}
                          </span>
                        </td>
                        <td className="dm-cell-uploadedby" style={{ fontWeight: 500, color: '#475569' }}>
                          {doc.uploadedBy}
                        </td>
                        <td className="dm-cell-date">{doc.date}</td>
                        {/* <td>
                          <span className={`dm-format dm-format--${doc.format.toLowerCase()}`}>
                            {doc.format}
                          </span>
                        </td> */}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="dm-table-empty">
                        No documents match your filter query.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination footer */}
            {totalPages > 1 && !showAll && (
              <div className="dm-pagination">
                <button
                  className="dm-page-btn"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((c) => Math.max(c - 1, 1))}
                >
                  <IonIcon icon={chevronBackOutline} />
                </button>
                <span className="dm-page-info">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  className="dm-page-btn"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((c) => Math.min(c + 1, totalPages))}
                >
                  <IonIcon icon={chevronForwardOutline} />
                </button>
              </div>
            )}

            <div className="dm-panel__footer">
              <button className="dm-view-all-btn" onClick={() => setShowAll(!showAll)}>
                {showAll ? 'Show Sliced Pages' : 'View All Documents'}
                <IonIcon 
                  icon={showAll ? chevronBackOutline : chevronForwardOutline} 
                  className="dm-view-all-arrow" 
                />
              </button>
            </div>
          </div>

          {/* 2-Column Workspace Grid */}
          {/* <div className="dm-workspace-grid"> */}
            
            {/* COLUMN 1: Secure File Upload */}
            {/* <div className="dm-col">
              <div className="dm-panel">
                <div
                  className={`dm-upload-dropzone ${isUploading ? 'dm-upload-dropzone--uploading' : ''}`}
                  onClick={handleDropzoneClick}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    onChange={handleFileChange}
                    accept=".pdf,.jpg,.jpeg,.png,.docx"
                  />
                  <div className="dm-upload-dropzone__body">
                    <div className="dm-upload-cloud-icon">
                      <IonIcon icon={cloudUploadOutline} />
                    </div>
                    <h3 className="dm-upload-dropzone__title">Secure File Upload</h3>
                    <p className="dm-upload-dropzone__text">
                      Drag and drop patient files here, or <span className="dm-upload-link">click to browse</span> local storage.
                    </p>
                    <p className="dm-upload-dropzone__subtext">
                      Supported: PDF, JPG, PNG, DOCX (Max 25MB)
                    </p>
                  </div>
                </div>

                {isUploading && (
                  <div className="dm-upload-progress-container">
                    <div className="dm-upload-progress-header">
                      <span className="dm-uploading-file-label">
                        Encrypting & Storing: <strong>{uploadingFileName}</strong>
                      </span>
                      <span className="dm-uploading-file-pct">{uploadProgress}%</span>
                    </div>
                    <div
                      className="dm-upload-progress-bar"
                      style={{ '--progress-pct': `${uploadProgress}%` } as React.CSSProperties}
                    ></div>
                    <span className="dm-uploading-subtext">Ready to encrypt and store...</span>
                  </div>
                )}
              </div>
            </div> */}

            {/* COLUMN 2: Recent Reports */}
            {/* <div className="dm-col">
              <div className="dm-panel">
                <div className="dm-panel__header">
                  <h2 className="dm-panel__title">Recent Reports</h2>
                  <IonIcon icon={documentTextOutline} className="dm-panel-header-icon" />
                </div>
                <div className="dm-report-cards-list">
                  <div 
                    className="dm-report-item" 
                    style={{ cursor: 'pointer' }} 
                    onClick={() => handleRecentReportClick('Cardiology Report', 'Kumar')}
                  >
                    <div className="dm-report-item__left">
                      <div className="dm-report-item__circle-icon dm-report-item__circle-icon--blue">
                        <IonIcon icon={heartOutline} />
                      </div>
                      <div className="dm-report-item__meta">
                        <h4 className="dm-report-item__title">Cardiology Report</h4>
                        <span className="dm-report-item__patient">Patient: Kumar</span>
                      </div>
                    </div>
                    <button className="dm-report-action-icon" onClick={(e) => e.stopPropagation()}>
                      <IonIcon icon={ellipsisVerticalOutline} />
                    </button>
                  </div>

                  <div 
                    className="dm-report-item" 
                    style={{ cursor: 'pointer' }} 
                    onClick={() => handleRecentReportClick('Ophthalmology Report', 'Rao')}
                  >
                    <div className="dm-report-item__left">
                      <div className="dm-report-item__circle-icon dm-report-item__circle-icon--red">
                        <IonIcon icon={eyeOutline} />
                      </div>
                      <div className="dm-report-item__meta">
                        <h4 className="dm-report-item__title">Ophthalmology</h4>
                        <span className="dm-report-item__patient">Patient: Rao</span>
                      </div>
                    </div>
                    <button className="dm-report-action-icon" onClick={(e) => e.stopPropagation()}>
                      <IonIcon icon={ellipsisVerticalOutline} />
                    </button>
                  </div>
                </div>
              </div>
            </div> */}

          {/* </div> */}
        </div>
      </IonContent>

      {/* Upload Document Modal */}
      <IonModal isOpen={showUploadModal} onDidDismiss={() => setShowUploadModal(false)} className="sa-modal sa-modal--sm">
        <div className="sa-modal__content">
          <div className="sa-modal__header">
            <h2>Secure Document Upload</h2>
            <button className="sa-modal__close-btn" onClick={() => setShowUploadModal(false)}>×</button>
          </div>
          <div className="sa-modal__body">
            <div className="sa-settings__form-group">
              <label className="sa-settings__label">Patient Name</label>
              {user?.role === 'PATIENT' ? (
                <input
                  type="text"
                  className="sa-input"
                  value={user.name || ''}
                  disabled
                />
              ) : (
                <select
                  className="sa-input"
                  value={uploadForm.patientName}
                  onChange={(e) => setUploadForm({ ...uploadForm, patientName: e.target.value })}
                >
                  <option value="">Select Patient Name</option>
                  {patientOptions.map((patName) => (
                    <option key={patName} value={patName}>
                      {patName}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="sa-settings__form-group">
              <label className="sa-settings__label">Document Type</label>
              <select
                className="sa-input"
                value={uploadForm.documentType}
                onChange={(e) => setUploadForm({ ...uploadForm, documentType: e.target.value as any })}
              >
                <option value="Doctor Report">Doctor Report</option>
                <option value="Lab Report">Lab Report</option>
                <option value="Consultation Note">Consultation Note</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="sa-settings__form-group">
              <label className="sa-settings__label">Document File Name</label>
              <input
                type="text"
                className="sa-input"
                placeholder="e.g. MRI_Scan_Final.pdf"
                value={uploadForm.selectedFileName}
                onChange={(e) => setUploadForm({ ...uploadForm, selectedFileName: e.target.value })}
              />
              <span className="dm-modal-tip">Include extension (.pdf, .jpg, .docx)</span>
            </div>

            <div className="sa-settings__form-group" style={{ marginTop: '16px' }}>
              <label className="sa-settings__label">Upload Document File</label>
              <div
                className="dm-modal-drag-drop"
                onClick={() => document.getElementById('modal-file-input')?.click()}
              >
                <input
                  type="file"
                  id="modal-file-input"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    const files = e.target.files;
                    if (files && files.length > 0) {
                      setUploadForm({ ...uploadForm, selectedFileName: files[0].name });
                    }
                  }}
                  accept=".pdf,.jpg,.jpeg,.png,.docx"
                />
                <IonIcon icon={cloudUploadOutline} />
                <span className="dm-modal-drag-drop-text">
                  {uploadForm.selectedFileName ? 'Change Selected File' : 'Click to browse local files'}
                </span>
                <span className="dm-modal-drag-drop-subtext">
                  {uploadForm.selectedFileName ? `Selected: ${uploadForm.selectedFileName}` : 'Supports: PDF, JPG, PNG, DOCX'}
                </span>
              </div>
            </div>
          </div>
          <div className="sa-modal__footer">
            <button className="sa-btn sa-btn--outline" onClick={() => setShowUploadModal(false)}>
              Cancel
            </button>
            <button className="sa-btn sa-btn--primary" onClick={handleModalUploadSubmit}>
              Upload & Encrypt
            </button>
          </div>
        </div>
      </IonModal>
      {/* Full-Page Document Viewer Modal */}
      <IonModal 
        isOpen={selectedViewDoc !== null} 
        onDidDismiss={() => setSelectedViewDoc(null)} 
        className="sa-modal sa-modal--full"
      >
        {selectedViewDoc && (
          <div className="dm-viewer-container">
            <div className="dm-viewer-header">
              <div className="dm-viewer-header-left">
                <IonIcon icon={documentOutline} style={{ fontSize: '24px', color: '#10b981' }} />
                <div>
                  <h3 className="dm-viewer-title">{selectedViewDoc.documentName}</h3>
                  <span className="dm-badge dm-badge--small" style={{ fontSize: '10px', marginTop: '2px', display: 'inline-block' }}>
                    {selectedViewDoc.type} • {selectedViewDoc.format} • {selectedViewDoc.size}
                  </span>
                </div>
              </div>
              <div className="dm-viewer-header-right">
                <button className="dm-viewer-close-btn" onClick={() => setSelectedViewDoc(null)} style={{ background: '#ef4444', borderColor: '#ef4444' }}>
                  <IonIcon icon={closeOutline} />
                  Close
                </button>
              </div>
            </div>

            <div className="dm-viewer-body">
              <div className="dm-viewer-paper">
                <div className="dm-viewer-paper-header">
                  <div className="dm-viewer-paper-logo">
                    <div className="dm-viewer-logo-icon" style={{ fontSize: '24px', color: '#1f7a6a', marginRight: '8px' }}>✦</div>
                    <div>
                      <div className="dm-viewer-logo-text" style={{ fontSize: '18px', fontWeight: 700, color: '#1f7a6a' }}>NPHMS HEALTHCARE</div>
                      <div className="dm-viewer-logo-sub" style={{ fontSize: '10px', color: '#64748b' }}>Mumbai Main Branch • Patient Records Division</div>
                    </div>
                  </div>
                  <div className="dm-viewer-paper-meta" style={{ textAlign: 'right' }}>
                    <h2 className="dm-viewer-meta-title" style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 4px 0' }}>{selectedViewDoc.type}</h2>
                    <p className="dm-viewer-meta-text" style={{ fontSize: '11px', color: '#64748b', margin: '2px 0' }}><strong>RECORD ID:</strong> NPHMS-DOC-{selectedViewDoc.id}</p>
                    <p className="dm-viewer-meta-text" style={{ fontSize: '11px', color: '#64748b', margin: '2px 0' }}><strong>DATE GENERATED:</strong> {selectedViewDoc.date}</p>
                  </div>
                </div>

                <div className="dm-viewer-patient-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', background: '#f8fafc', padding: '16px', borderRadius: '6px', border: '1px solid #e2e8f0', marginBottom: '24px' }}>
                  <div className="dm-viewer-patient-item" style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <span className="dm-viewer-patient-label" style={{ fontSize: '10px', fontWeight: 600, color: '#64748b' }}>PATIENT NAME</span>
                    <span className="dm-viewer-patient-val" style={{ fontSize: '14px', fontWeight: 500 }}>{selectedViewDoc.patientName}</span>
                  </div>
                  <div className="dm-viewer-patient-item" style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <span className="dm-viewer-patient-label" style={{ fontSize: '10px', fontWeight: 600, color: '#64748b' }}>ASSIGNED HEALER</span>
                    <span className="dm-viewer-patient-val" style={{ fontSize: '14px', fontWeight: 500 }}>{selectedViewDoc.assignedHealer || 'Healer Julian'}</span>
                  </div>
                  <div className="dm-viewer-patient-item" style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <span className="dm-viewer-patient-label" style={{ fontSize: '10px', fontWeight: 600, color: '#64748b' }}>UPLOADED BY</span>
                    <span className="dm-viewer-patient-val" style={{ fontSize: '14px', fontWeight: 500 }}>{selectedViewDoc.uploadedBy}</span>
                  </div>
                  <div className="dm-viewer-patient-item" style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <span className="dm-viewer-patient-label" style={{ fontSize: '10px', fontWeight: 600, color: '#64748b' }}>ENCRYPTION STATUS</span>
                    <span className="dm-viewer-patient-val" style={{ fontSize: '14px', color: '#10b981', fontWeight: 600 }}>✓ SECURE AES-256</span>
                  </div>
                </div>

                {selectedViewDoc.type === 'Doctor Report' && (
                  <div className="dm-viewer-content-block" style={{ marginBottom: '24px' }}>
                    <h3 className="dm-viewer-section-title" style={{ fontSize: '13px', fontWeight: 700, color: '#1f7a6a', textTransform: 'uppercase', borderBottom: '1px solid #e2e8f0', paddingBottom: '6px', marginBottom: '12px' }}>Clinical Diagnoses & Evaluation</h3>
                    <p className="dm-viewer-content-text" style={{ fontSize: '13px', lineHeight: 1.6, color: '#334155', margin: '0 0 12px 0' }}>
                      Patient presented for deep energy diagnostic evaluation. Subjective scans indicate persistent physical discomfort in the upper back region and mild chest tightness, which has been exacerbated by occupational stress.
                    </p>
                    <p className="dm-viewer-content-text" style={{ fontSize: '13px', lineHeight: 1.6, color: '#334155', margin: '0 0 12px 0' }}>
                      <strong>Pranic Scan Observations:</strong><br />
                      Congestion detected in the front and back Solar Plexus chakras. The Heart chakra scans clean but exhibits minor energy leakage in the left auric sheath. The Ajna chakra is balanced and active.
                    </p>
                    <p className="dm-viewer-content-text" style={{ fontSize: '13px', lineHeight: 1.6, color: '#334155', margin: '0 0 12px 0' }}>
                      <strong>Prescribed Therapy Action Plan:</strong><br />
                      1. General sweeping of the entire body aura twice daily.<br />
                      2. Thorough localized sweeping on the solar plexus and chest cavity.<br />
                      3. Energizing the treated chakras with light-whitish green and light-whitish blue pranic frequencies.<br />
                      4. Scheduled for 3 crystal-assisted healing sessions over the next 2 weeks.
                    </p>
                  </div>
                )}

                {selectedViewDoc.type === 'Lab Report' && (
                  <div className="dm-viewer-content-block" style={{ marginBottom: '24px' }}>
                    <h3 className="dm-viewer-section-title" style={{ fontSize: '13px', fontWeight: 700, color: '#1f7a6a', textTransform: 'uppercase', borderBottom: '1px solid #e2e8f0', paddingBottom: '6px', marginBottom: '12px' }}>Diagnostic Lab Analysis Results</h3>
                    <table className="dm-viewer-lab-table" style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '16px' }}>
                      <thead>
                        <tr>
                          <th style={{ background: '#f1f5f9', color: '#475569', fontSize: '11px', fontWeight: 600, padding: '8px 12px', borderBottom: '2px solid #cbd5e1', textAlign: 'left' }}>TEST PARAMETER</th>
                          <th style={{ background: '#f1f5f9', color: '#475569', fontSize: '11px', fontWeight: 600, padding: '8px 12px', borderBottom: '2px solid #cbd5e1', textAlign: 'left' }}>PATIENT VALUE</th>
                          <th style={{ background: '#f1f5f9', color: '#475569', fontSize: '11px', fontWeight: 600, padding: '8px 12px', borderBottom: '2px solid #cbd5e1', textAlign: 'left' }}>REFERENCE RANGE</th>
                          <th style={{ background: '#f1f5f9', color: '#475569', fontSize: '11px', fontWeight: 600, padding: '8px 12px', borderBottom: '2px solid #cbd5e1', textAlign: 'left' }}>STATUS</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                          <td style={{ padding: '10px 12px', fontSize: '13px' }}>Blood Glucose (Fasting)</td>
                          <td style={{ padding: '10px 12px', fontSize: '13px' }}>94 mg/dL</td>
                          <td style={{ padding: '10px 12px', fontSize: '13px' }}>70 - 100 mg/dL</td>
                          <td style={{ padding: '10px 12px' }}><span className="dm-viewer-lab-badge dm-viewer-lab-badge--normal" style={{ background: '#dcfce7', color: '#15803d', padding: '2px 6px', borderRadius: '12px', fontSize: '10px', fontWeight: 600 }}>Normal</span></td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                          <td style={{ padding: '10px 12px', fontSize: '13px' }}>Total Cholesterol</td>
                          <td style={{ padding: '10px 12px', fontSize: '13px' }}>218 mg/dL</td>
                          <td style={{ padding: '10px 12px', fontSize: '13px' }}>&lt; 200 mg/dL</td>
                          <td style={{ padding: '10px 12px' }}><span className="dm-viewer-lab-badge dm-viewer-lab-badge--high" style={{ background: '#fee2e2', color: '#b91c1c', padding: '2px 6px', borderRadius: '12px', fontSize: '10px', fontWeight: 600 }}>High</span></td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                          <td style={{ padding: '10px 12px', fontSize: '13px' }}>Hemoglobin</td>
                          <td style={{ padding: '10px 12px', fontSize: '13px' }}>14.5 g/dL</td>
                          <td style={{ padding: '10px 12px', fontSize: '13px' }}>12.0 - 16.0 g/dL</td>
                          <td style={{ padding: '10px 12px' }}><span className="dm-viewer-lab-badge dm-viewer-lab-badge--normal" style={{ background: '#dcfce7', color: '#15803d', padding: '2px 6px', borderRadius: '12px', fontSize: '10px', fontWeight: 600 }}>Normal</span></td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                          <td style={{ padding: '10px 12px', fontSize: '13px' }}>Platelet Count</td>
                          <td style={{ padding: '10px 12px', fontSize: '13px' }}>285,000 /µL</td>
                          <td style={{ padding: '10px 12px', fontSize: '13px' }}>150,000 - 450,000 /µL</td>
                          <td style={{ padding: '10px 12px' }}><span className="dm-viewer-lab-badge dm-viewer-lab-badge--normal" style={{ background: '#dcfce7', color: '#15803d', padding: '2px 6px', borderRadius: '12px', fontSize: '10px', fontWeight: 600 }}>Normal</span></td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                          <td style={{ padding: '10px 12px', fontSize: '13px' }}>TSH (Thyroid Stimulating Hormone)</td>
                          <td style={{ padding: '10px 12px', fontSize: '13px' }}>0.45 µIU/mL</td>
                          <td style={{ padding: '10px 12px', fontSize: '13px' }}>0.50 - 5.00 µIU/mL</td>
                          <td style={{ padding: '10px 12px' }}><span className="dm-viewer-lab-badge dm-viewer-lab-badge--low" style={{ background: '#dbeafe', color: '#1d4ed8', padding: '2px 6px', borderRadius: '12px', fontSize: '10px', fontWeight: 600 }}>Low</span></td>
                        </tr>
                      </tbody>
                    </table>
                    <p className="dm-viewer-content-text" style={{ fontSize: '13px', color: '#64748b' }}>
                      *Fast-draw procedure completed successfully. Recommended clinical evaluation relative to clinical thyroid baseline observations.
                    </p>
                  </div>
                )}

                {selectedViewDoc.type === 'Consultation Note' && (
                  <div className="dm-viewer-content-block" style={{ marginBottom: '24px' }}>
                    <h3 className="dm-viewer-section-title" style={{ fontSize: '13px', fontWeight: 700, color: '#1f7a6a', textTransform: 'uppercase', borderBottom: '1px solid #e2e8f0', paddingBottom: '6px', marginBottom: '12px' }}>Healer Consultation Observation & Chakra Analysis</h3>
                    <p className="dm-viewer-content-text" style={{ fontSize: '13px', lineHeight: 1.6, color: '#334155', margin: '0 0 12px 0' }}>
                      Conducted full aura evaluation. The client experienced deep relaxation during the treatment log sweeps. Noted release of negative emotional energetic build-ups in the lower abdominal auric layers.
                    </p>
                    
                    <h4 style={{ fontSize: '12px', fontWeight: 700, color: '#334155', margin: '16px 0 8px 0' }}>Chakra Energy Status Measurements</h4>
                    <div className="dm-viewer-energy-list" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div className="dm-viewer-energy-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                        <span className="dm-viewer-energy-name" style={{ fontSize: '12px', fontWeight: 600 }}>Ajna Chakra (Intuition)</span>
                        <div className="dm-viewer-energy-bar-container" style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '200px' }}>
                          <div className="dm-viewer-energy-bar" style={{ flex: 1, height: '6px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                            <div className="dm-viewer-energy-fill dm-viewer-energy-fill--clean" style={{ width: '85%', height: '100%', background: '#10b981' }}></div>
                          </div>
                          <span className="dm-viewer-energy-val" style={{ fontSize: '10px', color: '#64748b', width: '50px', textAlign: 'right' }}>85% Clean</span>
                        </div>
                      </div>
                      <div className="dm-viewer-energy-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                        <span className="dm-viewer-energy-name" style={{ fontSize: '12px', fontWeight: 600 }}>Heart Chakra (Compassion)</span>
                        <div className="dm-viewer-energy-bar-container" style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '200px' }}>
                          <div className="dm-viewer-energy-bar" style={{ flex: 1, height: '6px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                            <div className="dm-viewer-energy-fill dm-viewer-energy-fill--clean" style={{ width: '70%', height: '100%', background: '#10b981' }}></div>
                          </div>
                          <span className="dm-viewer-energy-val" style={{ fontSize: '10px', color: '#64748b', width: '50px', textAlign: 'right' }}>70% Clean</span>
                        </div>
                      </div>
                      <div className="dm-viewer-energy-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                        <span className="dm-viewer-energy-name" style={{ fontSize: '12px', fontWeight: 600 }}>Solar Plexus Chakra (Emotion)</span>
                        <div className="dm-viewer-energy-bar-container" style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '200px' }}>
                          <div className="dm-viewer-energy-bar" style={{ flex: 1, height: '6px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                            <div className="dm-viewer-energy-fill dm-viewer-energy-fill--highly-congested" style={{ width: '90%', height: '100%', background: '#ef4444' }}></div>
                          </div>
                          <span className="dm-viewer-energy-val" style={{ fontSize: '10px', color: '#64748b', width: '50px', textAlign: 'right' }}>90% Cong.</span>
                        </div>
                      </div>
                      <div className="dm-viewer-energy-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                        <span className="dm-viewer-energy-name" style={{ fontSize: '12px', fontWeight: 600 }}>Basic Chakra (Grounding)</span>
                        <div className="dm-viewer-energy-bar-container" style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '200px' }}>
                          <div className="dm-viewer-energy-bar" style={{ flex: 1, height: '6px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                            <div className="dm-viewer-energy-fill dm-viewer-energy-fill--congested" style={{ width: '60%', height: '100%', background: '#f59e0b' }}></div>
                          </div>
                          <span className="dm-viewer-energy-val" style={{ fontSize: '10px', color: '#64748b', width: '50px', textAlign: 'right' }}>60% Cong.</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {selectedViewDoc.type === 'Other' && (
                  <div className="dm-viewer-content-block" style={{ marginBottom: '24px' }}>
                    <h3 className="dm-viewer-section-title" style={{ fontSize: '13px', fontWeight: 700, color: '#1f7a6a', textTransform: 'uppercase', borderBottom: '1px solid #e2e8f0', paddingBottom: '6px', marginBottom: '12px' }}>General Center Waiver & Consent</h3>
                    <p className="dm-viewer-content-text" style={{ fontSize: '13px', fontStyle: 'italic', background: '#f8fafc', padding: '16px', borderRadius: '6px', borderLeft: '3px solid #1f7a6a', margin: '0 0 12px 0' }}>
                      "I hereby acknowledge that pranic healing therapy is designed to balance the physical body's energy system and is a complementary wellness practice. I understand that healers do not diagnose physical illnesses, prescribe drugs, or interfere with traditional medical treatments."
                    </p>
                    <p className="dm-viewer-content-text" style={{ fontSize: '13px', lineHeight: 1.6, color: '#334155', margin: '0 0 12px 0' }}>
                      <strong>Patient Confirmation Statement:</strong><br />
                      The patient has signed this intake waiver indicating agreement with the NPHMS privacy policy. This consent is stored securely under the blockchain vault reference key `NPHMS-RBAC-SEC-KEY`.
                    </p>
                  </div>
                )}

                <div className="dm-viewer-paper-footer" style={{ marginTop: 'auto', borderTop: '1px solid #e2e8f0', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                  <div className="dm-viewer-signature-box" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                    <div className="dm-viewer-signature-line" style={{ width: '150px', borderBottom: '1px dashed #64748b', marginBottom: '4px' }}></div>
                    <span className="dm-viewer-signature-label" style={{ fontSize: '10px', color: '#64748b' }}>Signature of Attending Staff</span>
                  </div>
                  <div className="dm-viewer-seal" style={{ width: '60px', height: '60px', border: '2px dashed rgba(31, 122, 106, 0.4)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: 700, color: 'rgba(31, 122, 106, 0.5)', transform: 'rotate(-15deg)', textTransform: 'uppercase', textAlign: 'center' }}>
                    NPHMS<br />SEAL
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </IonModal>

      {/* Glassmorphic Toast Overlay */}
      {toastMessage && (
        <div className="dm-toast">
          <span>{toastMessage}</span>
        </div>
      )}
    </IonPage>
  );
};

export default DocumentManagementPage;