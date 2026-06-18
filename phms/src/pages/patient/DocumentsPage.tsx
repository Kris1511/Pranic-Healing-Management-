import React, { useState, useEffect } from 'react';
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
  pieChartOutline,
  folderOpenOutline,
  documentOutline,
  chevronBackOutline,
  chevronForwardOutline,
  closeOutline,
  arrowBackOutline,
} from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';
import '../branch-admin/branch-admin.css';
import './Patient.css';

interface UploadedDocument {
  id: number;
  documentName: string;
  patientName: string;
  type: 'Doctor Report' | 'Lab Report' | 'Consultation Note' | 'Other';
  date: string;
  format: 'PDF' | 'JPG' | 'PNG' | 'DOCX' | 'XLSX';
  size: string;
  uploadedBy: string;
  assignedHealer?: string;
}

const DocumentsPage: React.FC = () => {
  const history = useHistory();
  const { user } = useAuthStore();

  const userName = user?.name || 'Valued Patient';
  const userEmail = user?.email || 'patient@phms.com';

  // Dynamic Patient Info lookup
  const [resolvedPatientName, setResolvedPatientName] = useState(userName);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [showAll, setShowAll] = useState(false);
  const itemsPerPage = 5;

  // View Document State
  const [selectedViewDoc, setSelectedViewDoc] = useState<UploadedDocument | null>(null);

  // Add Document Modal State
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    documentType: 'Doctor Report' as 'Doctor Report' | 'Lab Report' | 'Consultation Note' | 'Other',
    selectedFileName: '',
  });

  // Mock Upload Progress State
  const [isUploading, setIsUploading] = useState(false);

  // Primary Documents State (restricted to logged in Patient)
  const [documents, setDocuments] = useState<UploadedDocument[]>([]);

  // Initial load
  useEffect(() => {
    // 1. Resolve Patient name
    let patientName = userName;
    const savedPatients = localStorage.getItem('phms_patients');
    if (savedPatients) {
      try {
        const parsed = JSON.parse(savedPatients);
        const found = parsed.find((p: any) => p.email?.toLowerCase() === userEmail.toLowerCase());
        if (found) {
          patientName = found.name;
          setResolvedPatientName(found.name);
        }
      } catch (e) {
        console.error(e);
      }
    }

    // 2. Load all documents from localStorage
    const cached = localStorage.getItem('phms_uploaded_documents');
    let docsList: UploadedDocument[] = [];
    if (cached) {
      try {
        docsList = JSON.parse(cached);
      } catch (e) {
        console.error(e);
      }
    }

    // Filter documents for this patient to check if any exist
    const patientDocs = docsList.filter(
      (d) => d.patientName?.toLowerCase().trim() === patientName.toLowerCase().trim()
    );
    if (patientDocs.length === 0) {
      const sampleDocs: UploadedDocument[] = [
        {
          id: Date.now() - 3600000 * 24 * 3, // 3 days ago
          documentName: 'Doctor_Diagnosis_May2026.pdf',
          patientName: patientName,
          type: 'Doctor Report',
          date: new Date(Date.now() - 3600000 * 24 * 3).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          format: 'PDF',
          size: '1.8 MB',
          uploadedBy: 'Dr. David'
        },
        {
          id: Date.now() - 3600000 * 24 * 10, // 10 days ago
          documentName: 'Thyroid_Profile_Lab_Report.png',
          patientName: patientName,
          type: 'Lab Report',
          date: new Date(Date.now() - 3600000 * 24 * 10).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          format: 'PNG',
          size: '2.4 MB',
          uploadedBy: patientName
        },
        {
          id: Date.now() - 3600000 * 24 * 15, // 15 days ago
          documentName: 'Chakra_Aura_Assessment.docx',
          patientName: patientName,
          type: 'Consultation Note',
          date: new Date(Date.now() - 3600000 * 24 * 15).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          format: 'DOCX',
          size: '1.2 MB',
          uploadedBy: 'Dr. Shailesh'
        }
      ];
      docsList = [...sampleDocs, ...docsList];
      localStorage.setItem('phms_uploaded_documents', JSON.stringify(docsList));
    }
    setDocuments(docsList);
  }, [userEmail, userName]);

  // Sync documents list back to localStorage when patient uploads a new document
  const saveAllDocuments = (newDocsList: UploadedDocument[]) => {
    setDocuments(newDocsList);
    localStorage.setItem('phms_uploaded_documents', JSON.stringify(newDocsList));
  };

  const triggerMockUpload = (fileName: string, type: 'Doctor Report' | 'Lab Report' | 'Consultation Note' | 'Other') => {
    if (isUploading) return;
    setIsUploading(true);

    setTimeout(() => {
      const extension = (fileName.split('.').pop() || 'PDF').toUpperCase() as any;
      const newDoc: UploadedDocument = {
        id: Date.now(),
        documentName: fileName,
        patientName: resolvedPatientName,
        type: type,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        format: extension,
        size: `${(Math.random() * 3 + 1).toFixed(1)} MB`,
        uploadedBy: resolvedPatientName,
        assignedHealer: 'Dr. Shailesh',
      };

      // Prepend new document
      const updatedDocsList = [newDoc, ...documents];
      saveAllDocuments(updatedDocsList);

      setIsUploading(false);
    }, 1000);
  };

  const handleModalUploadSubmit = () => {
    if (!uploadForm.selectedFileName) {
      alert('Please select a file to upload.');
      return;
    }
    setShowUploadModal(false);
    triggerMockUpload(uploadForm.selectedFileName, uploadForm.documentType);
    setUploadForm({
      documentType: 'Doctor Report',
      selectedFileName: '',
    });
  };

  // Filter logic (Strictly limited to current patient name)
  const filteredDocs = documents.filter((doc) => {
    const matchesPatient = doc.patientName?.toLowerCase().trim() === resolvedPatientName.toLowerCase().trim();
    if (!matchesPatient) return false;

    const matchesSearch =
      doc.documentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.uploadedBy.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = filterType === 'All' || doc.type === filterType;

    return matchesSearch && matchesType;
  });

  // Aggregate stats FOR THIS PATIENT ONLY
  const patientTotalDocs = filteredDocs.length;
  const patientDocReports = filteredDocs.filter((d) => d.type === 'Doctor Report').length;
  const patientLabReports = filteredDocs.filter((d) => d.type === 'Lab Report').length;
  const patientConsultNotes = filteredDocs.filter((d) => d.type === 'Consultation Note').length;

  // Pagination
  const totalPages = Math.ceil(filteredDocs.length / itemsPerPage) || 1;
  const paginatedDocs = showAll
    ? filteredDocs
    : filteredDocs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
    setShowAll(false);
  }, [searchQuery, filterType]);

  return (
    <IonPage className="sa-page">
      <IonHeader className="ion-no-border">
        <IonToolbar className="sa-page__toolbar">
          <IonButtons slot="start">
            <button className="healer-back-btn" onClick={() => history.push('/patient/dashboard')}>
              <IonIcon icon={arrowBackOutline} />
            </button>
          </IonButtons>
          <IonTitle className="sa-page__toolbar-title">Health Records Workspace</IonTitle>
          <IonButtons slot="end">
            <IonMenuButton />
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent className="sa-page__content">
        <div className="healer-container">
          
          {/* Action Row */}
          <div className="dm-action-row">
            <div className="dm-action-row__left">
              <h1 className="dm-action-row__title">My Health Records</h1>
              <p className="dm-action-row__subtitle">
                Upload and view your doctor reports, laboratory analyses, consultation assessments, and wellness plans.
              </p>
            </div>
            <div className="dm-action-row__right">
              <button
                className="dm-action-btn dm-action-btn--primary"
                onClick={() => setShowUploadModal(true)}
              >
                <IonIcon icon={addOutline} className="dm-btn-icon dm-btn-icon--plus" />
                Upload New File
              </button>
            </div>
          </div>

          {/* Stats Horizontal Row (restricted to this patient only) */}
          <div className="dm-stats-row">
            <div className="dm-stat-card">
              <div className="dm-stat-card__main">
                <div className="dm-stat-card__left">
                  <div className="dm-stat-card__icon dm-stat-card__icon--teal">
                    <IonIcon icon={documentTextOutline} />
                  </div>
                  <div className="dm-stat-card__meta">
                    <span className="dm-stat-card__label">Total Files</span>
                    <span className="dm-stat-card__value">{patientTotalDocs}</span>
                  </div>
                </div>
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
                    <span className="dm-stat-card__value">{patientDocReports}</span>
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
                    <span className="dm-stat-card__value">{patientLabReports}</span>
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
                    <span className="dm-stat-card__value">{patientConsultNotes}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="dm-control-bar">
            <div className="dm-body-search">
              <IonIcon icon={searchOutline} className="dm-search-bar-icon" />
              <input
                type="text"
                placeholder="Search file names..."
                className="dm-search-bar-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="dm-panel-filter-tabs">
              {['All', 'Doctor Report', 'Lab Report', 'Consultation Note', 'Other'].map((type) => (
                <button
                  key={type}
                  className={`dm-filter-tab ${filterType === type ? 'dm-filter-tab--active' : ''}`}
                  onClick={() => setFilterType(type)}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Documents Panel */}
          <div className="dm-panel pat-margin-bottom-24">
            <div className="dm-panel__header">
              <h2 className="dm-panel__title">My Uploaded Documents</h2>
            </div>

            <div className="dm-table-container">
              <table className="dm-table">
                <thead>
                  <tr>
                    <th>DOCUMENT NAME</th>
                    <th>TYPE</th>
                    <th>UPLOADED BY</th>
                    <th>DATE</th>
                    <th>FORMAT</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedDocs.length > 0 ? (
                    paginatedDocs.map((doc) => (
                      <tr key={doc.id} className="dm-table-row">
                        <td 
                          className="dm-cell-docname pat-cursor-pointer"
                          onClick={() => setSelectedViewDoc(doc)}
                        >
                          <IonIcon icon={documentOutline} className="dm-cell-icon" />
                          <span className="dm-doc-title pat-doc-title-link">{doc.documentName}</span>
                        </td>
                        <td>
                          <span className={`dm-badge dm-badge--${doc.type.toLowerCase().replace(' ', '-')}`}>
                            {doc.type}
                          </span>
                        </td>
                        <td className="dm-cell-uploadedby pat-td-uploadedby">
                          {doc.uploadedBy === resolvedPatientName ? 'Me' : doc.uploadedBy}
                        </td>
                        <td className="dm-cell-date">{doc.date}</td>
                        <td>
                          <span className={`dm-format dm-format--${doc.format.toLowerCase()}`}>
                            {doc.format}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="dm-table-empty">
                        No health records found matching your filters.
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
          </div>

         

        </div>

      {/* Upload Document Modal */}
      <IonModal isOpen={showUploadModal} onDidDismiss={() => setShowUploadModal(false)} className="sa-modal sa-modal--sm">
        <div className="sa-modal__content">
          <div className="sa-modal__header">
            <h2>Add Health Record File</h2>
            <button className="sa-modal__close-btn" onClick={() => setShowUploadModal(false)}>×</button>
          </div>
          <div className="sa-modal__body">
            <div className="sa-settings__form-group">
              <label className="sa-settings__label">Patient Record owner</label>
              <input
                type="text"
                className="sa-input"
                value={resolvedPatientName}
                disabled
              />
            </div>

            <div className="sa-settings__form-group">
              <label className="sa-settings__label">Document Classification Type</label>
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
              <label className="sa-settings__label">Scanned File Name</label>
              <input
                type="text"
                className="sa-input"
                placeholder="e.g. Lab_Work_June.pdf"
                value={uploadForm.selectedFileName}
                onChange={(e) => setUploadForm({ ...uploadForm, selectedFileName: e.target.value })}
              />
            </div>

            <div className="sa-settings__form-group pat-margin-top-16">
              <label className="sa-settings__label">Verify Selected File</label>
              <div
                className="dm-modal-drag-drop"
                onClick={() => document.getElementById('modal-file-input-pat')?.click()}
              >
                <input
                  type="file"
                  id="modal-file-input-pat"
                  className="pat-display-none"
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
                  {uploadForm.selectedFileName ? 'Change File' : 'Click to select scan'}
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
              Encrypt & Store
            </button>
          </div>
        </div>
      </IonModal>

      {/* View Modal */}
      <IonModal 
        isOpen={selectedViewDoc !== null} 
        onDidDismiss={() => setSelectedViewDoc(null)} 
        className="dm-document-viewer-popup"
      >
        {selectedViewDoc && (
          <div className="dm-viewer-container">
            <div className="dm-viewer-header">
              <div className="dm-viewer-header-left">
                <IonIcon icon={documentOutline} className="pat-viewer-doc-icon" />
                <div>
                  <h3 className="dm-viewer-title">{selectedViewDoc.documentName}</h3>
                  <span className="dm-badge dm-badge--small pat-viewer-doc-badge">
                    {selectedViewDoc.type} • {selectedViewDoc.format} • {selectedViewDoc.size}
                  </span>
                </div>
              </div>
              <div className="dm-viewer-header-right">
                <button className="dm-viewer-close-btn pat-viewer-close-btn" onClick={() => setSelectedViewDoc(null)}>
                  <IonIcon icon={closeOutline} />
                  Close
                </button>
              </div>
            </div>

            <div className="dm-viewer-body">
              <div className="dm-viewer-paper">
                <div className="dm-viewer-paper-header">
                  <div className="dm-viewer-paper-logo">
                    <div className="dm-viewer-logo-icon pat-viewer-logo-icon">✦</div>
                    <div>
                      <div className="dm-viewer-logo-text pat-viewer-logo-text">NPHMS HEALTHCARE</div>
                      <div className="dm-viewer-logo-sub pat-viewer-logo-sub">Mumbai Main Branch • Private Records Division</div>
                    </div>
                  </div>
                  <div className="dm-viewer-paper-meta pat-viewer-paper-meta">
                    <h2 className="dm-viewer-meta-title pat-viewer-meta-title">{selectedViewDoc.type}</h2>
                    <p className="dm-viewer-meta-text pat-viewer-meta-text"><strong>RECORD ID:</strong> NPHMS-DOC-{selectedViewDoc.id}</p>
                    <p className="dm-viewer-meta-text pat-viewer-meta-text"><strong>DATE GENERATED:</strong> {selectedViewDoc.date}</p>
                  </div>
                </div>

                <div className="pat-viewer-content-divider">
                  <div className="pat-viewer-grid-2col">
                    <div>
                      <h4 className="pat-viewer-sub-section-title">Patient Details</h4>
                      <p className="pat-viewer-p-margin">Name: <strong>{selectedViewDoc.patientName}</strong></p>
                      <p className="pat-viewer-p-margin">Record Type: <strong>{selectedViewDoc.type}</strong></p>
                    </div>
                    <div className="pat-text-right">
                      <h4 className="pat-viewer-sub-section-title">Security Details</h4>
                      <p className="pat-viewer-p-margin">Uploaded By: <strong>{selectedViewDoc.uploadedBy}</strong></p>
                      <p className="pat-viewer-p-margin">File Size: <strong>{selectedViewDoc.size} ({selectedViewDoc.format})</strong></p>
                    </div>
                  </div>
                </div>

                <div className="pat-viewer-enc-box">
                  <IonIcon icon={documentOutline} className="pat-viewer-enc-icon" />
                  <h3 className="pat-viewer-enc-title">Clinical Document Secured & Encrypted</h3>
                  <p className="pat-viewer-enc-desc">The content of this file is protected with end-to-end patient-healer cryptographic keys.</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </IonModal>
  </IonContent>
</IonPage>
  );
};

export default DocumentsPage;
