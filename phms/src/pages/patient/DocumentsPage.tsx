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
  IonSpinner,
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
  downloadOutline
} from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';
import { useQuery } from '@tanstack/react-query';
import { getPatients } from '../../api/patient.api';
import { getPatientDocuments, uploadDocument, getDocumentBlob } from '../../api/document.api';
import '../branch-admin/branch-admin.css';
import './Patient.css';

import ProfileDropdown from '../../components/common/ProfileDropdown';

interface UploadedDocument {
  id: string;
  documentName: string;
  patientName: string;
  type: string;
  date: string;
  format: string;
  size: string;
  uploadedBy: string;
}

const mapFileTypeToLabel = (type: string) => {
  if (type === 'MEDICAL_REPORT') return 'Medical Report';
  if (type === 'LAB_REPORT') return 'Lab Report';
  if (type === 'PRESCRIPTION') return 'Prescription';
  if (type === 'ID_PROOF') return 'ID Proof';
  return 'Other Document';
};

const inferDocumentType = (fileName: string) => {
  const lower = fileName.toLowerCase();
  if (lower.includes('lab') || lower.includes('blood') || lower.includes('mri') || lower.includes('xray') || lower.includes('scan') || lower.includes('test')) return 'LAB_REPORT';
  if (lower.includes('consultation') || lower.includes('prescription') || lower.includes('note')) return 'PRESCRIPTION';
  if (lower.includes('id') || lower.includes('proof') || lower.includes('aadhaar') || lower.includes('pan') || lower.includes('passport')) return 'ID_PROOF';
  if (lower.includes('medical') || lower.includes('report') || lower.includes('discharge')) return 'MEDICAL_REPORT';
  return 'MEDICAL_REPORT';
};

const DocumentsPage: React.FC = () => {
  const history = useHistory();
  const { user } = useAuthStore();

  const userName = user?.name || 'Valued Patient';
  const userEmail = user?.email || '';

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // View Document State
  const [selectedViewDoc, setSelectedViewDoc] = useState<UploadedDocument | null>(null);
  const [viewBlobUrl, setViewBlobUrl] = useState<string | null>(null);
  const [isFetchingBlob, setIsFetchingBlob] = useState(false);

  // Add Document Modal State
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadForm, setUploadForm] = useState<{
    documentType: string;
    selectedFileName: string;
    selectedFile: File | null;
  }>({
    documentType: 'MEDICAL_REPORT',
    selectedFileName: '',
    selectedFile: null,
  });

  const [isUploading, setIsUploading] = useState(false);

  // 1. Fetch Patient
  const { data: patientData } = useQuery({
    queryKey: ['patient', userEmail],
    queryFn: async () => {
      const res = await getPatients({ email: userEmail });
      return res.data && res.data.length > 0 ? res.data[0] : null;
    },
    enabled: !!userEmail,
  });

  const resolvedPatientName = patientData?.name || userName;

  // 2. Fetch Documents
  const { data: documents = [], refetch: refetchDocs, isLoading: isLoadingDocs } = useQuery<UploadedDocument[]>({
    queryKey: ['patient-documents', patientData?.id],
    queryFn: async () => {
      if (!patientData?.id) return [];
      const res = await getPatientDocuments(patientData.id);
      return (res.data || []).map((d: any) => {
        const ext = (d.originalName || d.fileName || '').split('.').pop() || 'PDF';
        return {
          id: d.id,
          documentName: d.originalName || d.fileName,
          patientName: resolvedPatientName,
          type: mapFileTypeToLabel(d.fileType),
          date: new Date(d.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          format: ext.toUpperCase(),
          size: 'Unknown',
          uploadedBy: 'Patient',
        };
      }).sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
    },
    enabled: !!patientData?.id,
  });

  const handleModalUploadSubmit = async () => {
    if (!uploadForm.selectedFile) {
      alert('Please select a file to upload.');
      return;
    }
    if (!patientData?.id) {
      alert('Patient context not loaded properly.');
      return;
    }
    
    setIsUploading(true);
    try {
      await uploadDocument(patientData.id, uploadForm.selectedFile, uploadForm.documentType, uploadForm.selectedFileName);
      setShowUploadModal(false);
      setUploadForm({
        documentType: 'MEDICAL_REPORT',
        selectedFileName: '',
        selectedFile: null,
      });
      refetchDocs();
    } catch (e) {
      console.error(e);
      alert('Failed to upload document.');
    } finally {
      setIsUploading(false);
    }
  };

  // Filter logic
  const filteredDocs = documents.filter((doc) => {
    const matchesSearch =
      doc.documentName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'All' || doc.type === filterType;
    return matchesSearch && matchesType;
  });

  // Aggregate stats FOR THIS PATIENT ONLY
  const patientTotalDocs = documents.length;
  const patientDocReports = documents.filter((d) => d.type === 'Medical Report').length;
  const patientLabReports = documents.filter((d) => d.type === 'Lab Report').length;
  const patientConsultNotes = documents.filter((d) => d.type === 'Prescription').length;

  // Pagination
  const totalPages = Math.ceil(filteredDocs.length / itemsPerPage) || 1;
  const paginatedDocs = filteredDocs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterType]);

  const handleViewDoc = async (doc: UploadedDocument) => {
    try {
      setIsFetchingBlob(true);
      setSelectedViewDoc(doc);
      const blob = await getDocumentBlob(doc.id);
      
      let mimeType = 'application/pdf';
      if (doc.format === 'PNG') mimeType = 'image/png';
      else if (doc.format === 'JPG' || doc.format === 'JPEG') mimeType = 'image/jpeg';
      
      const fileBlob = new Blob([blob], { type: mimeType });
      const url = window.URL.createObjectURL(fileBlob);
      setViewBlobUrl(url);
    } catch (err: any) {
      console.error(err);
      alert('Failed to fetch document content for preview.');
      setSelectedViewDoc(null);
    } finally {
      setIsFetchingBlob(false);
    }
  };

  const handleCloseViewer = () => {
    if (viewBlobUrl) {
      window.URL.revokeObjectURL(viewBlobUrl);
    }
    setViewBlobUrl(null);
    setSelectedViewDoc(null);
  };

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
    } catch (err: any) {
      console.error(err);
      alert('Failed to download document.');
    }
  };

  return (
    <IonPage className="sa-page">
      <IonHeader className="ion-no-border">
        <IonToolbar className="sa-page__toolbar">
          <IonButtons slot="start">
            <IonMenuButton />
            {/* <button className="healer-back-btn" onClick={() => history.push('/patient/dashboard')}>
              <IonIcon icon={arrowBackOutline} />
            </button> */}
          </IonButtons>
          <IonTitle className="sa-page__toolbar-title">Health Records Workspace</IonTitle>
          <IonButtons slot="end">
          
              <ProfileDropdown />
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
            {/* <div className="dm-action-row__right">
              <button
                className="dm-action-btn dm-action-btn--primary"
                onClick={() => setShowUploadModal(true)}
              >
                <IonIcon icon={addOutline} className="dm-btn-icon dm-btn-icon--plus" />
                Upload New File
              </button>
            </div> */}
          </div>

          {/* Stats Horizontal Row (restricted to this patient only) */}
          <div className="dm-stats-row">
            <div className="dm-stat-card">
              <div className="dm-stat-card__main" style={{ alignItems: 'center' }}>
                <div className="dm-stat-card__left">
                  <div className="dm-stat-card__icon dm-stat-card__icon--teal">
                    <IonIcon icon={documentTextOutline} />
                  </div>
                  <div className="dm-stat-card__meta">
                    <span className="dm-stat-card__label">Total Files</span>
                  </div>
                </div>
                <span className="dm-stat-card__value" style={{ marginLeft: 'auto' }}>{patientTotalDocs}</span>
              </div>
            </div>

            <div className="dm-stat-card">
              <div className="dm-stat-card__main" style={{ alignItems: 'center' }}>
                <div className="dm-stat-card__left">
                  <div className="dm-stat-card__icon dm-stat-card__icon--blue">
                    <IonIcon icon={folderOpenOutline} />
                  </div>
                  <div className="dm-stat-card__meta">
                    <span className="dm-stat-card__label">Medical Reports</span>
                  </div>
                </div>
                <span className="dm-stat-card__value" style={{ marginLeft: 'auto' }}>{patientDocReports}</span>
              </div>
            </div>

            <div className="dm-stat-card">
              <div className="dm-stat-card__main" style={{ alignItems: 'center' }}>
                <div className="dm-stat-card__left">
                  <div className="dm-stat-card__icon dm-stat-card__icon--red">
                    <IonIcon icon={pieChartOutline} />
                  </div>
                  <div className="dm-stat-card__meta">
                    <span className="dm-stat-card__label">Lab Reports</span>
                  </div>
                </div>
                <span className="dm-stat-card__value" style={{ marginLeft: 'auto' }}>{patientLabReports}</span>
              </div>
            </div>

            <div className="dm-stat-card">
              <div className="dm-stat-card__main" style={{ alignItems: 'center' }}>
                <div className="dm-stat-card__left">
                  <div className="dm-stat-card__icon dm-stat-card__icon--purple">
                    <IonIcon icon={documentOutline} />
                  </div>
                  <div className="dm-stat-card__meta">
                    <span className="dm-stat-card__label">Prescriptions</span>
                  </div>
                </div>
                <span className="dm-stat-card__value" style={{ marginLeft: 'auto' }}>{patientConsultNotes}</span>
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
              {['All', 'Medical Report', 'Lab Report', 'Prescription', 'ID Proof', 'Other Document'].map((type) => (
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
                          onClick={() => handleViewDoc(doc)}
                        >
                          <IonIcon icon={documentOutline} className="dm-cell-icon" />
                          <span className="dm-doc-title pat-doc-title-link">{doc.documentName}</span>
                        </td>
                        <td>
                          <span className={`dm-badge dm-badge--${doc.type.toLowerCase().replace(' ', '-')}`}>
                            {doc.type}
                          </span>
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
            {totalPages > 1 && (
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
                onChange={(e) => setUploadForm({ ...uploadForm, documentType: e.target.value })}
              >
                <option value="MEDICAL_REPORT">Medical Report</option>
                <option value="LAB_REPORT">Lab Report</option>
                <option value="PRESCRIPTION">Consultation Note / Prescription</option>
                <option value="ID_PROOF">ID Proof</option>
              </select>
            </div>

            <div className="sa-settings__form-group">
              <label className="sa-settings__label">Scanned File Name (Optional)</label>
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
                      const file = files[0];
                      setUploadForm({
                        ...uploadForm,
                        selectedFile: file,
                        selectedFileName: file.name,
                        documentType: inferDocumentType(file.name)
                      });
                    }
                  }}
                  accept=".pdf,.jpg,.jpeg,.png,.docx"
                />
                <IonIcon icon={cloudUploadOutline} />
                <span className="dm-modal-drag-drop-text">
                  {uploadForm.selectedFile ? 'Change File' : 'Click to select scan'}
                </span>
                <span className="dm-modal-drag-drop-subtext">
                  {uploadForm.selectedFile ? `Selected: ${uploadForm.selectedFile.name}` : 'Supports: PDF, JPG, PNG, DOCX'}
                </span>
              </div>
            </div>
          </div>
          <div className="sa-modal__footer">
            <button className="sa-btn sa-btn--outline" onClick={() => setShowUploadModal(false)}>
              Cancel
            </button>
            <button className="sa-btn sa-btn--primary" onClick={handleModalUploadSubmit} disabled={isUploading}>
              {isUploading ? 'Uploading...' : 'Encrypt & Store'}
            </button>
          </div>
        </div>
      </IonModal>

      {/* Full-Page Document Viewer Modal */}
      <IonModal 
        isOpen={selectedViewDoc !== null} 
        onDidDismiss={handleCloseViewer} 
        className="sa-modal sa-modal--full"
      >
        {selectedViewDoc && (
          <div className="dm-viewer-container" style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
            <div className="dm-viewer-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 24px', height: '70px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', flexShrink: 0 }}>
              <div className="dm-viewer-header-left" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <IonIcon icon={documentOutline} style={{ fontSize: '24px', color: '#1f7a6a' }} />
                <div>
                  <h3 className="dm-viewer-title" style={{ margin: 0, fontSize: '16px', fontWeight: 700 }}>{selectedViewDoc.documentName}</h3>
                  <span className="dm-badge dm-badge--small" style={{ fontSize: '11px', marginTop: '2px', display: 'inline-block', color : "black" }}>
                    {selectedViewDoc.type} • {selectedViewDoc.format}
                  </span>
                </div>
              </div>
              <div className="dm-viewer-header-right" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {/* <button 
                  className="dm-viewer-download-btn" 
                  onClick={() => handleDownloadDoc(selectedViewDoc.id, selectedViewDoc.documentName)} 
                  style={{ background: '#1f7a6a', border: '1px solid #1f7a6a', color: '#fff', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}
                >
                  <IonIcon icon={downloadOutline} />
                  Download
                </button> */}
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
                  {selectedViewDoc.format === 'PDF' ? (
                    <iframe 
                      src={viewBlobUrl} 
                      style={{ width: '100%', height: 'calc(100vh - 70px)', border: 'none' }} 
                      title={selectedViewDoc.documentName} 
                    />
                  ) : ['PNG', 'JPG', 'JPEG'].includes(selectedViewDoc.format) ? (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: 'calc(100vh - 70px)', background: '#0f172a', padding: 0 }}>
                      <img 
                        src={viewBlobUrl} 
                        alt={selectedViewDoc.documentName} 
                        style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} 
                      />
                    </div>
                  ) : (
                    <div style={{ padding: '60px 40px', textAlign: 'center', background: '#ffffff', height: 'calc(100vh - 70px)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                      <IonIcon icon={documentOutline} style={{ fontSize: '72px', color: '#94a3b8', marginBottom: '20px' }} />
                      <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#1e293b', marginBottom: '8px' }}>Preview Not Supported</h3>
                      <p style={{ color: '#64748b', fontSize: '14px', maxWidth: '400px', margin: '0 auto 24px auto', lineHeight: 1.6 }}>
                        Direct browser previews are not supported for {selectedViewDoc.format} documents. Please download the file to view its content locally.
                      </p>
                      <button 
                        className="sa-btn sa-btn--primary" 
                        onClick={() => handleDownloadDoc(selectedViewDoc.id, selectedViewDoc.documentName)}
                      >
                        Download {selectedViewDoc.format}
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
  </IonContent>
</IonPage>
  );
};

export default DocumentsPage;
