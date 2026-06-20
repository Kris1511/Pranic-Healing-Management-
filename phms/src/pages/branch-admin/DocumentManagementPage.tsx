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
  useIonToast,
  useIonViewWillEnter,
  useIonViewWillLeave,
} from '@ionic/react';
import {
  searchOutline,
  addOutline,
  documentTextOutline,
  cloudUploadOutline,
  eyeOutline,
  pieChartOutline,
  folderOpenOutline,
  documentOutline,
  chevronBackOutline,
  chevronForwardOutline,
  closeOutline,
  downloadOutline,
} from 'ionicons/icons';
import { useAuthStore } from '../../store/auth.store';
import { getPatients } from '../../api/patient.api';
import {
  getAllDocuments,
  uploadDocument,
  deleteDocument,
  getDocumentBlob,
} from '../../api/document.api';
import './branch-admin.css';

interface UploadedDocument {
  id: string;
  documentName: string;
  patientName: string;
  patientId: string;
  type: string;
  date: string;
  format: string;
  mimeType: string;
  filePath: string;
}

const DocumentManagementPage: React.FC = () => {
  const { user } = useAuthStore();
  const [present] = useIonToast();

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [showAll, setShowAll] = useState(false);
  const itemsPerPage = 10;

  // Documents and Patients States
  const [documents, setDocuments] = useState<UploadedDocument[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isPageActive, setIsPageActive] = useState(true);

  // Full-Page Document Viewer State
  const [viewingDoc, setViewingDoc] = useState<UploadedDocument | null>(null);
  const [viewBlobUrl, setViewBlobUrl] = useState<string | null>(null);
  const [isFetchingBlob, setIsFetchingBlob] = useState(false);
  const [docToDelete, setDocToDelete] = useState<UploadedDocument | null>(null);

  // Add Document Modal State
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadForm, setUploadForm] = useState<{
    patientId: string;
    documentType: 'Medical Report' | 'Lab Report' | 'Prescription' | 'ID Proof';
    selectedFile: File | null;
    selectedFileName: string;
  }>({
    patientId: '',
    documentType: 'Medical Report',
    selectedFile: null,
    selectedFileName: '',
  });

  const triggerToast = (msg: string, color: 'success' | 'danger' = 'success') => {
    present({
      message: msg,
      duration: 3000,
      position: 'top',
      color: color,
    });
  };

  const fetchAllData = async (showLoading = false) => {
    if (showLoading) setIsLoading(true);
    try {
      // 1. Fetch Patients
      const patientsRes = await getPatients();
      if (patientsRes.success) {
        setPatients(patientsRes.data);
      }

      // 2. Fetch Documents
      const documentsRes = await getAllDocuments();
      if (documentsRes.success && Array.isArray(documentsRes.data)) {
        const mapped: UploadedDocument[] = documentsRes.data.map((doc: any) => {
          // Use originalName/original_name if available, fallback to fileName (generated unique filename)
          const docName = doc.original_name || doc.originalName || doc.fileName;
          const extension = (docName.split('.').pop() || 'PDF').toUpperCase();
          
          // Map backend fileType to UI display type
          let displayType = 'Other';
          if (doc.fileType === 'MEDICAL_REPORT') displayType = 'Medical Report';
          else if (doc.fileType === 'LAB_REPORT') displayType = 'Lab Report';
          else if (doc.fileType === 'PRESCRIPTION') displayType = 'Prescription';
          else if (doc.fileType === 'ID_PROOF') displayType = 'ID Proof';

          // Format date
          const dateObj = new Date(doc.createdAt);
          const formattedDate = dateObj.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          });

          return {
            id: doc.id,
            documentName: docName,
            patientName: doc.patient ? doc.patient.name : 'Unknown Patient',
            patientId: doc.patient ? doc.patient.patientId : 'N/A',
            type: displayType,
            date: formattedDate,
            format: extension,
            mimeType: doc.mimeType || 'application/pdf',
            filePath: doc.filePath,
          };
        });
        setDocuments(mapped);
      }
    } catch (err: any) {
      console.error(err);
      if (showLoading) {
        triggerToast('Failed to retrieve documents ledger.', 'danger');
      }
    } finally {
      if (showLoading) setIsLoading(false);
    }
  };

  useIonViewWillEnter(() => {
    setIsPageActive(true);
  });

  useIonViewWillLeave(() => {
    setIsPageActive(false);
  });

  useEffect(() => {
    if (!isPageActive) return;

    // Load initially with spinner if list is empty
    fetchAllData(documents.length === 0);

    // Setup live update polling interval
    const interval = setInterval(() => {
      fetchAllData(false);
    }, 3000);

    return () => clearInterval(interval);
  }, [isPageActive, documents.length]);

  // Filter & Search Logic
  const filteredDocs = documents.filter((doc) => {
    const matchesSearch =
      doc.documentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.patientId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.type.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = filterType === 'All' || doc.type === filterType;

    return matchesSearch && matchesType;
  });

  // Dynamic summary values based on full list
  const totalDocsCount = documents.length;
  const medicalReportsCount = documents.filter((d) => d.type === 'Medical Report').length;
  const labReportsCount = documents.filter((d) => d.type === 'Lab Report').length;
  const prescriptionsCount = documents.filter((d) => d.type === 'Prescription').length;
  const idProofsCount = documents.filter((d) => d.type === 'ID Proof').length;

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

  // Action: View Document
  const handleViewDoc = async (doc: UploadedDocument) => {
    try {
      setIsFetchingBlob(true);
      setViewingDoc(doc);
      const blob = await getDocumentBlob(doc.id);
      const fileBlob = new Blob([blob], { type: doc.mimeType });
      const url = window.URL.createObjectURL(fileBlob);
      setViewBlobUrl(url);
    } catch (err: any) {
      console.error(err);
      triggerToast('Failed to fetch document content for preview.', 'danger');
      setViewingDoc(null);
    } finally {
      setIsFetchingBlob(false);
    }
  };

  const handleCloseViewer = () => {
    if (viewBlobUrl) {
      window.URL.revokeObjectURL(viewBlobUrl);
    }
    setViewBlobUrl(null);
    setViewingDoc(null);
  };

  // Action: Download Document
  const handleDownloadDoc = async (id: string, fileName: string) => {
    try {
      const blob = await getDocumentBlob(id);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      triggerToast('Document download started.', 'success');
    } catch (err: any) {
      console.error(err);
      triggerToast('Failed to download document.', 'danger');
    }
  };

  // Action: Delete Document Confirmation Trigger
  const handleDeleteDoc = (doc: UploadedDocument) => {
    setDocToDelete(doc);
  };

  // Action: Confirm Delete
  const handleConfirmDelete = async () => {
    if (!docToDelete) return;
    try {
      await deleteDocument(docToDelete.id);
      triggerToast('Document deleted successfully!', 'success');
      setDocToDelete(null);
      fetchAllData(false);
    } catch (err: any) {
      console.error(err);
      triggerToast(err.response?.data?.message || 'Failed to delete document', 'danger');
    }
  };

  // Modal Upload Submit Handler
  const handleModalUploadSubmit = async () => {
    if (!uploadForm.patientId || !uploadForm.selectedFile) {
      triggerToast('Please select a patient and a document file.', 'danger');
      return;
    }

    let backendType = 'MEDICAL_REPORT';
    if (uploadForm.documentType === 'Lab Report') backendType = 'LAB_REPORT';
    else if (uploadForm.documentType === 'Prescription') backendType = 'PRESCRIPTION';
    else if (uploadForm.documentType === 'ID Proof') backendType = 'ID_PROOF';

    try {
      setIsUploading(true);
      await uploadDocument(uploadForm.patientId, uploadForm.selectedFile, backendType, uploadForm.selectedFileName || undefined);
      triggerToast('Document uploaded successfully!', 'success');
      setShowUploadModal(false);
      
      // Reset Form
      setUploadForm({
        patientId: '',
        documentType: 'Medical Report',
        selectedFile: null,
        selectedFileName: '',
      });
      
      fetchAllData();
    } catch (err: any) {
      console.error(err);
      triggerToast(err.response?.data?.message || 'Failed to upload document.', 'danger');
    } finally {
      setIsUploading(false);
    }
  };

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
                Manage medical records, lab results, and patient credentials.
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

          {/* Dashboard Summary Cards */}
          <div className="dm-stats-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
            <div className="dm-stat-card">
              <div className="dm-stat-card__main">
                <div className="dm-stat-card__left">
                  <div className="dm-stat-card__icon dm-stat-card__icon--teal">
                    <IonIcon icon={documentTextOutline} />
                  </div>
                  <div className="dm-stat-card__meta">
                    <span className="dm-stat-card__label">Total Documents</span>
                    <span className="dm-stat-card__value">{totalDocsCount}</span>
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
                    <span className="dm-stat-card__label">Medical Reports</span>
                    <span className="dm-stat-card__value">{medicalReportsCount}</span>
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
                    <span className="dm-stat-card__label">Prescriptions</span>
                    <span className="dm-stat-card__value">{prescriptionsCount}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="dm-stat-card">
              <div className="dm-stat-card__main">
                <div className="dm-stat-card__left">
                  <div className="dm-stat-card__icon dm-stat-card__icon--teal">
                    <IonIcon icon={cloudUploadOutline} />
                  </div>
                  <div className="dm-stat-card__meta">
                    <span className="dm-stat-card__label">ID Proofs</span>
                    <span className="dm-stat-card__value">{idProofsCount}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="dm-control-bar">
            {/* Search Input */}
            <div className="dm-body-search">
              <IonIcon icon={searchOutline} className="dm-search-bar-icon" />
              <input
                type="text"
                placeholder="Search patients, ID, document name..."
                className="dm-search-bar-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Document Filter Tabs */}
            <div className="dm-panel-filter-tabs">
              {['All', 'Medical Report', 'Lab Report', 'Prescription', 'ID Proof'].map((tab) => (
                <button
                  key={tab}
                  className={`dm-filter-tab ${filterType === tab ? 'dm-filter-tab--active' : ''}`}
                  onClick={() => setFilterType(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Documents Ledger Panel */}
          <div className="dm-panel" style={{ marginBottom: '24px' }}>
            <div className="dm-panel__header">
              <h2 className="dm-panel__title">Documents Registry</h2>
            </div>

            <div className="dm-table-container">
              <table className="dm-table">
                <thead>
                  <tr>
                    <th>DOCUMENT NAME</th>
                    <th>PATIENT NAME</th>
                    {/* <th>PATIENT ID</th> */}
                    <th>TYPE</th>
                    <th>UPLOAD DATE</th>
                    <th style={{ textAlign: 'center' }}>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} className="dm-table-empty">
                        Loading documents ledger...
                      </td>
                    </tr>
                  ) : paginatedDocs.length > 0 ? (
                    paginatedDocs.map((doc) => (
                      <tr key={doc.id} className="dm-table-row">
                        <td 
                          className="dm-cell-docname"
                          style={{ cursor: 'pointer' }}
                          onClick={() => handleViewDoc(doc)}
                        >
                          <IonIcon icon={documentOutline} className="dm-cell-icon" />
                          <span className="dm-doc-title" style={{ color: '#1f7a6a', fontWeight: 600 }}>
                            {doc.documentName}
                          </span>
                        </td>
                        <td className="dm-cell-patient">{doc.patientName}</td>
                        {/* <td style={{ color: '#64748b', fontWeight: 500 }}>{doc.patientId}</td> */}
                        <td>
                          <span className={`dm-badge dm-badge--${doc.type.toLowerCase().replace(' ', '-')}`}>
                            {doc.type}
                          </span>
                        </td>
                        <td className="dm-cell-date">{doc.date}</td>
                        <td>
                          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
                            <button
                              onClick={() => handleViewDoc(doc)}
                              style={{ background: 'none', border: 'none', color: '#1f7a6a', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}
                              title="View Document"
                            >
                              <IonIcon icon={eyeOutline} /> View
                            </button>
                            <button
                              onClick={() => handleDownloadDoc(doc.id, doc.documentName)}
                              style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}
                              title="Download Document"
                            >
                              <IonIcon icon={downloadOutline} /> Download
                            </button>
                            <button
                               onClick={() => handleDeleteDoc(doc)}
                               style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}
                               title="Delete Document"
                             >
                               <IonIcon icon={closeOutline} /> Delete
                             </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="dm-table-empty">
                        No documents found matching the filter query.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
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

            {/* <div className="dm-panel__footer">
              <button className="dm-view-all-btn" onClick={() => setShowAll(!showAll)}>
                {showAll ? 'Show Sliced Pages' : 'View All Documents'}
                <IonIcon 
                  icon={showAll ? chevronBackOutline : chevronForwardOutline} 
                  className="dm-view-all-arrow" 
                />
              </button>
            </div> */}
          </div>
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
              <label className="sa-settings__label">Select Patient</label>
              <select
                className="sa-input"
                value={uploadForm.patientId}
                onChange={(e) => setUploadForm({ ...uploadForm, patientId: e.target.value })}
              >
                <option value="">Choose Patient</option>
                {patients.map((pat) => (
                  <option key={pat.id} value={pat.id}>
                    {pat.name} ({pat.patientId})
                  </option>
                ))}
              </select>
            </div>

            <div className="sa-settings__form-group">
              <label className="sa-settings__label">Document Type</label>
              <select
                className="sa-input"
                value={uploadForm.documentType}
                onChange={(e) => setUploadForm({ ...uploadForm, documentType: e.target.value as any })}
              >
                <option value="Medical Report">Medical Report</option>
                <option value="Lab Report">Lab Report</option>
                <option value="Prescription">Prescription</option>
                <option value="ID Proof">ID Proof</option>
              </select>
            </div>

            <div className="sa-settings__form-group">
              <label className="sa-settings__label">Document File Name</label>
              <input
                type="text"
                className="sa-input"
                placeholder="Selected file name will appear here"
                value={uploadForm.selectedFileName}
                onChange={(e) => setUploadForm({ ...uploadForm, selectedFileName: e.target.value })}
              />
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
                      const file = files[0];
                      setUploadForm({
                        ...uploadForm,
                        selectedFile: file,
                        selectedFileName: file.name
                      });
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
            <button className="sa-btn sa-btn--primary" onClick={handleModalUploadSubmit} disabled={isUploading}>
              {isUploading ? 'Uploading...' : 'Upload & Encrypt'}
            </button>
          </div>
        </div>
      </IonModal>

      {/* Full-Page Document Viewer Modal */}
      <IonModal 
        isOpen={viewingDoc !== null} 
        onDidDismiss={handleCloseViewer} 
        className="sa-modal sa-modal--full"
      >
        {viewingDoc && (
          <div className="dm-viewer-container" style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
            <div className="dm-viewer-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 24px', height: '70px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', flexShrink: 0 }}>
              <div className="dm-viewer-header-left" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <IonIcon icon={documentOutline} style={{ fontSize: '24px', color: '#1f7a6a' }} />
                <div>
                  <h3 className="dm-viewer-title" style={{ margin: 0, fontSize: '16px', fontWeight: 700 }}>{viewingDoc.documentName}</h3>
                  <span className="dm-badge dm-badge--small" style={{ fontSize: '11px', marginTop: '2px', display: 'inline-block', color : "black" }}>
                    {viewingDoc.type} • {viewingDoc.format}
                  </span>
                </div>
              </div>
              <div className="dm-viewer-header-right" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button 
                  className="dm-viewer-download-btn" 
                  onClick={() => handleDownloadDoc(viewingDoc.id, viewingDoc.documentName)} 
                  style={{ background: '#1f7a6a', border: '1px solid #1f7a6a', color: '#fff', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}
                >
                  <IonIcon icon={downloadOutline} />
                  Download
                </button>
                <button 
                  className="dm-viewer-close-btn" 
                  onClick={handleCloseViewer} 
                  style={{ background: '#ef4444', borderColor: '#ef4444', color: '#fff', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}
                >
                  <IonIcon icon={closeOutline} />
                  Close
                </button>
              </div>
            </div>

            <div className="dm-viewer-body" style={{ flex: 1, padding: 0, background: '#0f172a', overflowY: 'auto' }}>
              {isFetchingBlob ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#fff' }}>
                  <h3>Loading Document Preview...</h3>
                </div>
              ) : viewBlobUrl ? (
                <div className="dm-viewer-paper" style={{ width: '100%', height: '100%', background: 'transparent', overflow: 'hidden' }}>
                  {viewingDoc.mimeType === 'application/pdf' || viewingDoc.format === 'PDF' ? (
                    <iframe 
                      src={viewBlobUrl} 
                      style={{ width: '100%', height: 'calc(100vh - 70px)', border: 'none' }} 
                      title={viewingDoc.documentName} 
                    />
                  ) : viewingDoc.mimeType.startsWith('image/') || ['PNG', 'JPG', 'JPEG'].includes(viewingDoc.format) ? (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: 'calc(100vh - 70px)', background: '#0f172a', padding: 0 }}>
                      <img 
                        src={viewBlobUrl} 
                        alt={viewingDoc.documentName} 
                        style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} 
                      />
                    </div>
                  ) : (
                    <div style={{ padding: '60px 40px', textAlign: 'center', background: '#ffffff', height: 'calc(100vh - 70px)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                      <IonIcon icon={documentOutline} style={{ fontSize: '72px', color: '#94a3b8', marginBottom: '20px' }} />
                      <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#1e293b', marginBottom: '8px' }}>Preview Not Supported</h3>
                      <p style={{ color: '#64748b', fontSize: '14px', maxWidth: '400px', margin: '0 auto 24px auto', lineHeight: 1.6 }}>
                        Direct browser previews are not supported for {viewingDoc.format} documents. Please download the file to view its content locally.
                      </p>
                      <button 
                        className="sa-btn sa-btn--primary" 
                        onClick={() => handleDownloadDoc(viewingDoc.id, viewingDoc.documentName)}
                      >
                        Download {viewingDoc.format}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px', color: '#fff' }}>
                  <h3>Document content is unavailable.</h3>
                </div>
              )}
            </div>
          </div>
        )}
      </IonModal>

      {/* Delete Confirmation Modal */}
      <IonModal 
        isOpen={docToDelete !== null} 
        onDidDismiss={() => setDocToDelete(null)} 
        className="sa-modal sa-modal--sm"
      >
        <div className="sa-modal__content">
          <div className="sa-modal__header">
            <h2 style={{ color: '#ef4444' }}>Confirm Deletion</h2>
            <button className="sa-modal__close-btn" onClick={() => setDocToDelete(null)}>×</button>
          </div>
          <div className="sa-modal__body" style={{ padding: '24px', textAlign: 'center' }}>
            {/* <IonIcon icon={closeOutline} style={{ fontSize: '48px', color: '#ef4444', marginBottom: '16px' }} /> */}
            <p style={{ margin: 0, fontSize: '15px', color: '#475569', lineHeight: 1.6 }}>
              Are you sure you want to permanently delete the document <strong>{docToDelete?.documentName}</strong>?
            </p>
            <p style={{ margin: '8px 0 0 0', fontSize: '13px', color: '#94a3b8' }}>
              This action cannot be undone and the file will be removed from the server.
            </p>
          </div>
          <div className="sa-modal__footer" style={{ background: '#fafbfc', padding: '16px 24px', borderTop: '1px solid #f1f5f9', borderBottomLeftRadius: '16px', borderBottomRightRadius: '16px' }}>
            <button className="sa-btn sa-btn--outline" onClick={() => setDocToDelete(null)}>
              Cancel
            </button>
            <button className="sa-btn" onClick={handleConfirmDelete} style={{ background: '#ef4444', color: '#fff' }}>
              Delete Document
            </button>
          </div>
        </div>
      </IonModal>
    </IonPage>
  );
};

export default DocumentManagementPage;