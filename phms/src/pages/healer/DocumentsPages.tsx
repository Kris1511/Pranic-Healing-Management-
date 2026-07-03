import React, { useState, useEffect } from 'react';
import {
  IonPage,
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonMenuButton,
  IonIcon,
  IonModal,
  useIonToast,
  useIonViewWillEnter,
  useIonViewWillLeave,
  IonSpinner
} from '@ionic/react';
import {
  folderOpenOutline,
  arrowBackOutline,
  searchOutline,
  documentTextOutline,
  personOutline,
  calendarOutline,
  documentOutline,
  closeOutline,
  downloadOutline
} from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { getAllDocuments, getDocumentBlob } from '../../api/document.api';
import '../branch-admin/branch-admin.css';
import './Healers.css';

import ProfileDropdown from '../../components/common/ProfileDropdown';

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

const DocumentsPages: React.FC = () => {
  const history = useHistory();
  const [present] = useIonToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'All' | 'Medical Report' | 'Lab Report' | 'Prescription' | 'ID Proof' | 'Other Document'>('All');
  
  const [documents, setDocuments] = useState<UploadedDocument[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isPageActive, setIsPageActive] = useState(true);

  const [viewingDoc, setViewingDoc] = useState<UploadedDocument | null>(null);
  const [viewBlobUrl, setViewBlobUrl] = useState<string | null>(null);
  const [isFetchingBlob, setIsFetchingBlob] = useState(false);

  const triggerToast = (msg: string, color: 'success' | 'danger' = 'success') => {
    present({
      message: msg,
      duration: 3000,
      position: 'top',
      color: color,
    });
  };

  const fetchDocuments = async (showLoading = false) => {
    if (showLoading) setIsLoading(true);
    try {
      const documentsRes = await getAllDocuments();
      if (documentsRes.success && Array.isArray(documentsRes.data)) {
        const mapped: UploadedDocument[] = documentsRes.data.map((doc: any) => {
          const docName = doc.original_name || doc.originalName || doc.fileName;
          const extension = (docName.split('.').pop() || 'PDF').toUpperCase();
          
          let displayType = 'Other Document';
          if (doc.fileType === 'MEDICAL_REPORT') displayType = 'Medical Report';
          else if (doc.fileType === 'LAB_REPORT') displayType = 'Lab Report';
          else if (doc.fileType === 'PRESCRIPTION') displayType = 'Prescription';
          else if (doc.fileType === 'ID_PROOF') displayType = 'ID Proof';

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
        triggerToast('Failed to retrieve documents.', 'danger');
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
    fetchDocuments(documents.length === 0);
  }, [isPageActive, documents.length]);

  const filteredDocs = documents.filter(doc => {
    const matchesSearch = doc.patientName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          doc.documentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          doc.patientId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'All' ? true : doc.type === typeFilter;
    return matchesSearch && matchesType;
  });

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

  return (
    <IonPage className="sa-page">
      <IonHeader className="ion-no-border">
        <IonToolbar className="sa-page__toolbar">
          <IonButtons slot="start">
            <IonMenuButton />
            {/* <button className="healer-back-btn" onClick={() => history.push('/healer/dashboard')}>
              <IonIcon icon={arrowBackOutline} />
            </button> */}
          </IonButtons>
          <IonTitle className="sa-page__toolbar-title">Documents</IonTitle>
          <IonButtons slot="end">
          
              <ProfileDropdown />
</IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent className="sa-page__content">
        <div className="healer-container">
          
          <div className="healer-header-box">
            <h2 className="healer-page-title">Patient Documents</h2>
            <p className="healer-page-subtitle">Review lab reports, doctor records, and consultation files uploaded for your assigned patients.</p>
          </div>

          <div className="sa-search" style={{ margin: '1rem 0', maxWidth: '100%' }}>
            <IonIcon icon={searchOutline} />
            <input
              type="text"
              placeholder="Search by patient name, ID, or file name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="healer-filter-tabs">
            {(['All', 'Medical Report', 'Lab Report', 'Prescription', 'ID Proof', 'Other Document'] as const).map(tab => {
              let colorClass = '';
              if (tab === 'Medical Report') colorClass = 'healer-filter-tab-btn--medical';
              else if (tab === 'Lab Report') colorClass = 'healer-filter-tab-btn--lab';
              else if (tab === 'Prescription') colorClass = 'healer-filter-tab-btn--prescription';
              else if (tab === 'ID Proof') colorClass = 'healer-filter-tab-btn--id';
              else if (tab === 'Other Document') colorClass = 'healer-filter-tab-btn--other';

              return (
                <button
                  key={tab}
                  onClick={() => setTypeFilter(tab)}
                  className={`healer-filter-tab-btn ${colorClass} ${typeFilter === tab ? 'healer-filter-tab-btn--active' : ''}`}
                >
                  {tab === 'All' ? 'All Files' : `${tab}s`}
                </button>
              );
            })}
          </div>

          <div className="healer-documents-list">
            {isLoading && filteredDocs.length === 0 ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
                <IonSpinner name="crescent" />
              </div>
            ) : filteredDocs.map(doc => (
              <div 
                key={doc.id} 
                className="healer-document-item-horizontal"
                onClick={() => handleViewDoc(doc)}
              >
                <div className="healer-document-item__left">
                  <div className="healer-document-item__icon-container">
                    <IonIcon icon={documentTextOutline} className="healer-document-item__icon" />
                  </div>
                  <div>
                    <strong className="healer-document-item__name--large">{doc.documentName}</strong>
                    <div className="healer-document-item__subtext">
                      <span className="healer-document-item__patient-info">
                        <IonIcon icon={personOutline} />
                        {doc.patientName} ({doc.patientId})
                      </span>
                      <span>|</span>
                      <span className="healer-document-item__type-label">{doc.type}</span>
                    </div>
                  </div>
                </div>

                <div className="healer-document-item__right">
                  <IonIcon icon={calendarOutline} />
                  <span>{doc.date}</span>
                </div>
              </div>
            ))}

            {!isLoading && filteredDocs.length === 0 && (
              <div className="healer-empty-state">
                <IonIcon icon={folderOpenOutline} className="healer-empty-state__icon" />
                <p>No documents found matching the filters.</p>
              </div>
            )}
          </div>
        </div>

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
      </IonContent>
    </IonPage>
  );
};

export default DocumentsPages;
