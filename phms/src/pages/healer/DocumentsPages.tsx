import React, { useState } from 'react';
import {
  IonPage,
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonMenuButton,
  IonIcon,
} from '@ionic/react';
import {
  folderOpenOutline,
  arrowBackOutline,
  searchOutline,
  documentTextOutline,
  personOutline,
  calendarOutline,
} from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import '../branch-admin/branch-admin.css';
import './Healers.css';

export interface PatientMock {
  name: string;
  age: number;
  gender: string;
  phone: string;
  patientId: string;
  condition: string;
  assignedHealer: string;
}

export const mockPatients: PatientMock[] = [
  { name: 'Rajesh Kumar', age: 45, gender: 'Male', phone: '+91 98765 43210', patientId: 'PAT-10023', condition: 'Chronic Back Pain', assignedHealer: 'Dr. Nilesh Joshi' },
  { name: 'Priya Sharma', age: 34, gender: 'Female', phone: '+91 91234 56789', patientId: 'PAT-10045', condition: 'Severe Anxiety & Migraine', assignedHealer: 'Dr. Nilesh Joshi' },
  { name: 'Amit Patel', age: 52, gender: 'Male', phone: '+91 98111 22233', patientId: 'PAT-10088', condition: 'Acute Ischemic Stroke Rehab', assignedHealer: 'Dr. David' },
  { name: 'Sunita Rao', age: 29, gender: 'Female', phone: '+91 99888 77665', patientId: 'PAT-10112', condition: 'Insomnia', assignedHealer: 'Dr. David' },
  { name: 'Vikram Singh', age: 60, gender: 'Male', phone: '+91 97777 88888', patientId: 'PAT-10156', condition: 'Bilateral Knee Pain', assignedHealer: 'Dr. Rajeshwari Iyer' }
];

interface PatientDoc {
  id: string;
  patientName: string;
  patientId: string;
  docName: string;
  type: 'Doctor Report' | 'Lab Report' | 'Consultation Note' | 'Other Document';
  date: string;
}

const mockDocuments: PatientDoc[] = [
  { id: '1', patientName: 'Rajesh Kumar', patientId: 'PAT-10023', docName: 'MRI_Spine_Lumbar.pdf', type: 'Lab Report', date: '2025-11-20' },
  { id: '2', patientName: 'Rajesh Kumar', patientId: 'PAT-10023', docName: 'Consultation_Notes_Dr_Joshi.pdf', type: 'Consultation Note', date: '2025-11-22' },
  { id: '3', patientName: 'Priya Sharma', patientId: 'PAT-10045', docName: 'Neurologist_Consultation_Priya.pdf', type: 'Consultation Note', date: '2025-07-02' },
  { id: '4', patientName: 'Priya Sharma', patientId: 'PAT-10045', docName: 'EEG_Report.pdf', type: 'Lab Report', date: '2025-06-30' },
  { id: '5', patientName: 'Amit Patel', patientId: 'PAT-10088', docName: 'Discharge_Summary_Fortis.pdf', type: 'Doctor Report', date: '2025-08-15' },
  { id: '6', patientName: 'Amit Patel', patientId: 'PAT-10088', docName: 'Physiotherapy_Assessment_Amit.pdf', type: 'Other Document', date: '2025-09-01' },
  { id: '7', patientName: 'Sunita Rao', patientId: 'PAT-10112', docName: 'Sleep_Study_Analysis.pdf', type: 'Lab Report', date: '2026-02-05' },
  { id: '8', patientName: 'Vikram Singh', patientId: 'PAT-10156', docName: 'XRay_Knee_Bilateral.pdf', type: 'Lab Report', date: '2025-10-10' },
  { id: '9', patientName: 'Vikram Singh', patientId: 'PAT-10156', docName: 'Orthopedic_Referral_Vikram.pdf', type: 'Doctor Report', date: '2025-10-15' }
];

const DocumentsPages: React.FC = () => {
  const history = useHistory();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'All' | 'Doctor Report' | 'Lab Report' | 'Consultation Note' | 'Other Document'>('All');
  const [selectedDoc, setSelectedDoc] = useState<PatientDoc | null>(null);

  const filteredDocs = mockDocuments.filter(doc => {
    const matchesSearch = doc.patientName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          doc.docName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          doc.patientId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'All' ? true : doc.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const renderMockDocumentContent = (doc: { name: string; type: string; date: string }, p: PatientMock) => {
    const docName = doc.name.toLowerCase();

    if (docName.includes('mri')) {
      return (
        <div className="healer-doc-paper">
          <div className="healer-doc-header">
            <div className="healer-doc-logo">NPHMS IMAGING CENTER</div>
            <div className="healer-doc-meta-right">
              <div><strong>Report ID:</strong> RAD-2026-9931</div>
              <div><strong>Date:</strong> {doc.date}</div>
            </div>
          </div>
          
          <hr className="healer-doc-divider" />
          
          <div className="healer-doc-patient-info">
            <h3>MRI CLINICAL STUDY REPORT</h3>
            <div className="healer-doc-info-grid">
              <div><strong>Patient Name:</strong> {p.name}</div>
              <div><strong>Age / Gender:</strong> {p.age} / {p.gender}</div>
              <div><strong>Referred By:</strong> Dr. Nilesh Joshi</div>
              <div><strong>Modality:</strong> MRI Lumbar Spine (3.0T)</div>
            </div>
          </div>
          
          <div className="healer-doc-body">
            <h4>CLINICAL INDICATION</h4>
            <p>Chronic lower back pain with radiation to the left lower extremity. Suspected radiculopathy.</p>
            
            <h4>FINDINGS</h4>
            <p><strong>Sagittal and Axial T1 & T2 weighted sequences of the lumbar spine:</strong></p>
            <ul>
              <li><strong>L1-L2, L2-L3, L3-L4:</strong> Normal disc heights. No evidence of bulge, herniation, or canal stenosis.</li>
              <li><strong>L4-L5:</strong> Prominent left paracentral herniation (extrusion) of the nucleus pulposus measuring approximately 6.5mm, causing moderate compression on the descending left L5 nerve root. Mild narrowing of the left neural foramina is observed.</li>
              <li><strong>L5-S1:</strong> Mild diffuse disc bulge without significant root impingement or canal stenosis.</li>
              <li><strong>Conus Medullaris:</strong> Normal signal intensity, terminates at L1.</li>
            </ul>
            
            <h4>IMPRESSION</h4>
            <ol>
              <li>Left paracentral herniated nucleus pulposus at L4-L5 causing moderate mass effect and compression of the left L5 nerve root.</li>
              <li>Mild degenerative changes of the L5-S1 disc.</li>
            </ol>
          </div>
          
          <div className="healer-doc-footer">
            <div className="healer-doc-signature">
              <div className="signature-line"></div>
              <strong>Dr. Rajeshwari Iyer, MD</strong>
              <span>Consultant Radiologist</span>
            </div>
          </div>
        </div>
      );
    }

    if (docName.includes('consultation')) {
      const isPriya = p.name.includes('Priya');
      return (
        <div className="healer-doc-paper">
          <div className="healer-doc-header healer-doc-header--clinic">
            <div className="healer-doc-logo">
              <h2>DR. NILESH JOSHI, MD</h2>
              <span>Consultant Neurologist & Spine Specialist</span>
            </div>
            <div className="healer-doc-meta-right">
              <div>Reg No: 58821-A</div>
              <div>Date: {doc.date}</div>
            </div>
          </div>
          
          <hr className="healer-doc-divider healer-doc-divider--prescription" />
          
          <div className="healer-doc-patient-info">
            <div className="healer-doc-info-grid">
              <div><strong>Patient:</strong> {p.name}</div>
              <div><strong>Age/Gender:</strong> {p.age} / {p.gender}</div>
              <div><strong>Phone:</strong> {p.phone}</div>
              <div><strong>Status:</strong> OP Referral</div>
            </div>
          </div>
          
          <div className="healer-doc-body">
            <h4>CLINICAL OBSERVATIONS</h4>
            {isPriya ? (
              <p>Patient presents with severe anxiety episodes, somatic muscle tension, and weekly chronic migraines. Migraines are preceded by visual auras and triggered by intense sensory environments or high stress. Conventional medications have yielded partial relief. Advised complementary energy healing sessions for nervous system relaxation.</p>
            ) : (
              <p>Patient presents with recurrent lower back pain radiating down the left thigh (sciatic path). Pain has increased over the past 3 months, worsening with prolonged sitting. MRI reports confirm L4-L5 herniated disc compressing the left L5 nerve root. Recommended conservative management including specialized energy healing therapies for pain modulation and inflammation reduction before surgery is considered.</p>
            )}
            
            <h4>RECOMMENDED PLAN</h4>
            <ul>
              <li>Avoid heavy lifting, sudden twisting, or high-impact activities.</li>
              <li>Initiate target energy healing therapy sessions (2-3 times a week) to relieve muscle spasms.</li>
              <li>Incorporate gentle stretching exercises (hamstring, cat-cow) only if pain permits.</li>
              <li>Re-evaluate neurological symptoms (reflexes, muscle strength) in 4 weeks.</li>
            </ul>
          </div>
          
          <div className="healer-doc-footer">
            <div className="healer-doc-signature">
              <div className="signature-line"></div>
              <strong>Dr. Nilesh Joshi, MD</strong>
              <span>Neurologist</span>
            </div>
          </div>
        </div>
      );
    }

    if (docName.includes('eeg')) {
      return (
        <div className="healer-doc-paper">
          <div className="healer-doc-header">
            <div className="healer-doc-logo">METROPOLIS NEURO-LAB</div>
            <div className="healer-doc-meta-right">
              <div><strong>Lab Report ID:</strong> EEG-99212</div>
              <div><strong>Date:</strong> {doc.date}</div>
            </div>
          </div>
          
          <hr className="healer-doc-divider" />
          
          <div className="healer-doc-patient-info">
            <h3>ELECTROENCEPHALOGRAPHY (EEG) REPORT</h3>
            <div className="healer-doc-info-grid">
              <div><strong>Patient Name:</strong> {p.name}</div>
              <div><strong>Age / Gender:</strong> {p.age} / {p.gender}</div>
              <div><strong>Referred By:</strong> Dr. Nilesh Joshi</div>
              <div><strong>Technique:</strong> 10-20 System Electrode Placement</div>
            </div>
          </div>
          
          <div className="healer-doc-body">
            <h4>RECORDING CONDITIONS</h4>
            <p>Awake state with eyes open and closed, hyperventilation for 3 minutes, and photic stimulation.</p>
            
            <h4>FINDINGS</h4>
            <ul>
              <li><strong>Background Activity:</strong> Alpha rhythm of 9.5 Hz, symmetrical and responsive to eye opening, mostly over posterior head regions.</li>
              <li><strong>Photic Stimulation:</strong> Occipital driving response observed at various flash rates without epileptiform discharges.</li>
              <li><strong>Hyperventilation:</strong> Caused mild, diffuse, symmetrical slowing of background activity. No paroxysmal activity triggered.</li>
              <li><strong>Epileptiform Activity:</strong> No focal spikes, sharp waves, or spike-wave complexes noted during recording.</li>
            </ul>
            
            <h4>IMPRESSION</h4>
            <p>Normal awake electroencephalogram. No electrographic evidence of focal or generalized epileptiform activity during the study.</p>
          </div>
          
          <div className="healer-doc-footer">
            <div className="healer-doc-signature">
              <div className="signature-line"></div>
              <strong>Dr. Anita Deshmukh, MD</strong>
              <span>Consultant Neurologist</span>
            </div>
          </div>
        </div>
      );
    }

    if (docName.includes('discharge')) {
      return (
        <div className="healer-doc-paper">
          <div className="healer-doc-header">
            <div className="healer-doc-logo">FORTIS HOSPITALS</div>
            <div className="healer-doc-meta-right">
              <div><strong>Discharge Summary No:</strong> IP-550912</div>
              <div><strong>Discharge Date:</strong> {doc.date}</div>
            </div>
          </div>
          
          <hr className="healer-doc-divider" />
          
          <div className="healer-doc-patient-info">
            <h3>CLINICAL DISCHARGE SUMMARY</h3>
            <div className="healer-doc-info-grid">
              <div><strong>Patient Name:</strong> {p.name}</div>
              <div><strong>Age / Gender:</strong> {p.age} / {p.gender}</div>
              <div><strong>Admission Date:</strong> 2025-08-01</div>
              <div><strong>Discharge Status:</strong> Stable / Ambulatory</div>
            </div>
          </div>
          
          <div className="healer-doc-body">
            <h4>DIAGNOSIS</h4>
            <p>Acute Ischemic Stroke involving the right middle cerebral artery (MCA) territory. Resulting in left-sided hemiparesis.</p>
            
            <h4>SUMMARY OF HOSPITAL COURSE</h4>
            <p>Patient was admitted with sudden onset of left-sided weakness and slurred speech. Received thrombolytic therapy within window. Monitored in ICU. Symptoms stabilized. Left-sided limb mobility has improved significantly from 1/5 to 3/5. Remitted for outpatient physical and energy healing rehabilitation.</p>
            
            <h4>OUTPATIENT ADVICE</h4>
            <ul>
              <li>Continue antiplatelet and antihypertensive therapy as prescribed.</li>
              <li>Undergo physical and occupational rehabilitation daily.</li>
              <li>Energy healing sessions scheduled weekly to aid motor recovery and energy balancing.</li>
            </ul>
          </div>
          
          <div className="healer-doc-footer">
            <div className="healer-doc-signature">
              <div className="signature-line"></div>
              <strong>Dr. Sameer Mehta, DM</strong>
              <span>Chief Neurologist</span>
            </div>
          </div>
        </div>
      );
    }

    // Fallback / default document view for others
    return (
      <div className="healer-doc-paper">
        <div className="healer-doc-header">
          <div className="healer-doc-logo">NPHMS MEDICAL ARCHIVE</div>
          <div className="healer-doc-meta-right">
            <div><strong>Document ID:</strong> DOC-{p.patientId}-{doc.date.replace(/-/g, '')}</div>
            <div><strong>Date:</strong> {doc.date}</div>
          </div>
        </div>
        
        <hr className="healer-doc-divider" />
        
        <div className="healer-doc-patient-info">
          <h3>{doc.type.toUpperCase()}: {doc.name.replace('.pdf', '')}</h3>
          <div className="healer-doc-info-grid">
            <div><strong>Patient Name:</strong> {p.name}</div>
            <div><strong>Age / Gender:</strong> {p.age} / {p.gender}</div>
            <div><strong>Patient ID:</strong> {p.patientId}</div>
            <div><strong>Status:</strong> Logged Document</div>
          </div>
        </div>
        
        <div className="healer-doc-body">
          <h4>DOCUMENT DESCRIPTION</h4>
          <p>This is a scanned file upload of a patient medical record. The authenticity of this electronic copy has been verified by the clinic archives.</p>
          
          <h4>RECORD DETAIL</h4>
          <p>This record corresponds to clinical observations for {p.name}. The diagnosis of <strong>{p.condition}</strong> is active. The recommended healing regimens should be modified according to the diagnostic contents of this clinical record.</p>
          
          <h4>CLINICAL NOTE</h4>
          <p>Please contact the primary healthcare provider or the assigned healer, {p.assignedHealer}, for diagnostic interpretations regarding this patient chart.</p>
        </div>
        
        <div className="healer-doc-footer">
          <div className="healer-doc-signature">
            <div className="signature-line"></div>
            <strong>NPHMS Clinic Registrar</strong>
            <span>Medical Records Department</span>
          </div>
        </div>
      </div>
    );
  };

  if (selectedDoc) {
    const activePatient = mockPatients.find(p => p.patientId === selectedDoc.patientId) || {
      name: selectedDoc.patientName,
      patientId: selectedDoc.patientId,
      phone: '+91 98765 43210',
      gender: 'Male',
      age: 45,
      condition: 'Chronic Back Pain',
      assignedHealer: 'Dr. David'
    };

    const docItem = {
      name: selectedDoc.docName,
      type: selectedDoc.type,
      date: selectedDoc.date
    };

    return (
      <IonPage className="sa-page">
        <IonHeader className="ion-no-border">
          <IonToolbar className="sa-page__toolbar">
            <IonButtons slot="start">
              <button className="healer-back-btn" onClick={() => setSelectedDoc(null)}>
                <IonIcon icon={arrowBackOutline} />
              </button>
            </IonButtons>
            <IonTitle className="sa-page__toolbar-title">{selectedDoc.docName}</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent className="healer-doc-viewer-content">
          <div className="healer-doc-viewer-container">
            {renderMockDocumentContent(docItem, activePatient)}
          </div>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage className="sa-page">
      <IonHeader className="ion-no-border">
        <IonToolbar className="sa-page__toolbar">
          <IonButtons slot="start">
            <button className="healer-back-btn" onClick={() => history.push('/healer/dashboard')}>
              <IonIcon icon={arrowBackOutline} />
            </button>
          </IonButtons>
          <IonTitle className="sa-page__toolbar-title">Documents</IonTitle>
          <IonButtons slot="end">
            <IonMenuButton />
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent className="sa-page__content">
        <div className="healer-container">
          
          <div className="healer-header-box">
            <h2 className="healer-page-title">Patient Documents</h2>
            <p className="healer-page-subtitle">Review lab reports, doctor records, and consultation files uploaded for your assigned patients.</p>
          </div>

          {/* Search Bar */}
          <div className="sa-search" style={{ margin: '1rem 0', maxWidth: '100%' }}>
            <IonIcon icon={searchOutline} />
            <input
              type="text"
              placeholder="Search by patient name, ID, or file name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Category Filter Segments */}
          <div className="healer-filter-tabs">
            {(['All', 'Doctor Report', 'Lab Report', 'Consultation Note', 'Other Document'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setTypeFilter(tab)}
                className={`healer-filter-tab-btn ${typeFilter === tab ? 'healer-filter-tab-btn--active' : ''}`}
              >
                {tab === 'All' ? 'All Files' : `${tab}s`}
              </button>
            ))}
          </div>

          {/* Document list */}
          <div className="healer-documents-list">
            {filteredDocs.map(doc => (
              <div 
                key={doc.id} 
                className="healer-document-item-horizontal"
                onClick={() => setSelectedDoc(doc)}
              >
                <div className="healer-document-item__left">
                  <div className="healer-document-item__icon-container">
                    <IonIcon icon={documentTextOutline} className="healer-document-item__icon" />
                  </div>
                  <div>
                    <strong className="healer-document-item__name--large">{doc.docName}</strong>
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

            {filteredDocs.length === 0 && (
              <div className="healer-empty-state">
                <IonIcon icon={folderOpenOutline} className="healer-empty-state__icon" />
                <p>No documents found matching the filters.</p>
              </div>
            )}
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default DocumentsPages;
