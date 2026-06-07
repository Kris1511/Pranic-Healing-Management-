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
  IonSearchbar,
  IonModal,
} from '@ionic/react';
import {
  peopleOutline,
  documentTextOutline,
  folderOpenOutline,
  medkitOutline,
  chevronForwardOutline,
  searchOutline,
  chevronBackOutline,
  eyeOutline,
} from 'ionicons/icons';
import { useAuthStore } from '../../store/auth.store';
import { useHistory } from 'react-router-dom';
import './Healers.css';

interface SessionHistory {
  date: string;
  protocol: string;
  notes: string;
}

interface Patient {
  id: string;
  patientId: string;
  name: string;
  gender: string;
  age: number;
  phone: string;
  healerName: string;
  condition: string;
  status: 'Active' | 'Completed' | 'On Hold';
  lastSession: string;
  nextSession: string;
  medicalHistory: string;
  followUpNotes: string;
  sessions: SessionHistory[];
}

const MyPatientsPage: React.FC = () => {
  const { user } = useAuthStore();
  const history = useHistory();
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const ITEMS_PER_PAGE = 5;

  // Sample assigned patients (BRD 6.11)
  const [patients] = useState<Patient[]>([
    {
      id: '1',
      patientId: 'PAT-10023',
      name: 'Rajesh Kumar',
      gender: 'Male',
      age: 45,
      phone: '+91 98765 43210',
      healerName: user?.name || 'Dr. Aris Varma',
      condition: 'Chronic Back Pain',
      status: 'Active',
      lastSession: '2026-06-05',
      nextSession: '2026-06-12',
      medicalHistory: 'Diagnosed with Chronic Lower Back Pain (L4-L5 disc bulge) 2 years ago. Suffers from mild hypertension and occasional fatigue.',
      followUpNotes: 'Focus on cleaning the basic and solar plexus chakras in next session. Energize using light whitish-red and light whitish-orange.',
      sessions: [
        {
          date: '2026-06-05',
          protocol: 'Basic & Advanced Aura Cleansing',
          notes: 'Scanned and cleaned the aura. Focused healing on lower back area. Relieved pain score from 8/10 to 4/10.'
        },
        {
          date: '2026-06-01',
          protocol: 'Chakra Scanning & Balancing',
          notes: 'Identified congestion in solar plexus and depletion in basic chakra. Cleaned congestion and stabilized energization.'
        }
      ]
    },
    {
      id: '2',
      patientId: 'PAT-10045',
      name: 'Priya Sharma',
      gender: 'Female',
      age: 32,
      phone: '+91 87654 32109',
      healerName: user?.name || 'Dr. Aris Varma',
      condition: 'Anxiety & Migraine',
      status: 'Active',
      lastSession: '2026-06-06',
      nextSession: '2026-06-10',
      medicalHistory: 'Suffering from generalized anxiety disorder and migraine for 6 months. High stress due to work environment.',
      followUpNotes: 'Clean Ajna and solar plexus chakras to alleviate stress. Gentle scanning of crown chakra.',
      sessions: [
        {
          date: '2026-06-06',
          protocol: 'Stress & Anxiety Relief Therapy',
          notes: 'Cleaned and stabilized Ajna, solar plexus, and throat chakras. Disintegrated stress energies. Patient reported feeling deeply relaxed.'
        },
        {
          date: '2026-06-02',
          protocol: 'Migraine Pain Management',
          notes: 'Applied local sweeping to the back of the head. Cleaned temple and forehead chakras. Migraine intensity reduced significantly.'
        }
      ]
    },
    {
      id: '3',
      patientId: 'PAT-10088',
      name: 'Amit Patel',
      gender: 'Male',
      age: 58,
      phone: '+91 76543 21098',
      healerName: user?.name || 'Dr. Aris Varma',
      condition: 'Post-stroke Rehabilitation',
      status: 'Active',
      lastSession: '2026-05-28',
      nextSession: '2026-06-09',
      medicalHistory: 'Post-stroke rehabilitation. Left side weakness. Undergoing physical therapy alongside pranic healing.',
      followUpNotes: 'Energize left arm and leg meridians. Strengthen basic and spleen chakras.',
      sessions: [
        {
          date: '2026-05-28',
          protocol: 'Motor Function Restoration',
          notes: 'Cleaned and energized the brain and spine. Energized depleted left side chakras. Minor improvements in toe movement observed.'
        },
        {
          date: '2026-05-21',
          protocol: 'Nerve and Muscle Revitalizing',
          notes: 'Sweeping of spine and limb chakras. Energized with light whitish-green and blue.'
        }
      ]
    },
    {
      id: '4',
      patientId: 'PAT-10112',
      name: 'Neha Gupta',
      gender: 'Female',
      age: 27,
      phone: '+91 65432 10987',
      healerName: user?.name || 'Dr. Aris Varma',
      condition: 'Insomnia & Stress Management',
      status: 'On Hold',
      lastSession: '2026-05-15',
      nextSession: 'TBD',
      medicalHistory: 'Insomnia for over a year. Severe stress management issues. Prone to panic attacks.',
      followUpNotes: 'Ensure session is conducted in late afternoon to aid nighttime sleep. Clean solar plexus chakra.',
      sessions: [
        {
          date: '2026-05-15',
          protocol: 'Sleep Alignment & Calming',
          notes: 'Cleaned solar plexus and heart chakras. Energized with calming light whitish-blue. Patient reported 3 consecutive nights of restful sleep.'
        }
      ]
    },
    {
      id: '5',
      patientId: 'PAT-10156',
      name: 'Vikram Singh',
      gender: 'Male',
      age: 39,
      phone: '+91 54321 09876',
      healerName: user?.name || 'Dr. Aris Varma',
      condition: 'Frozen Shoulder',
      status: 'Completed',
      lastSession: '2026-05-30',
      nextSession: 'None',
      medicalHistory: 'Frozen Shoulder (adhesive capsulitis) on the right side. Limited range of motion.',
      followUpNotes: 'Treatment completed. Patient advised to practice light stretching and basic breathing exercises.',
      sessions: [
        {
          date: '2026-05-30',
          protocol: 'Shoulder Joint Mobilization',
          notes: 'Thorough sweeping of right shoulder joint. Energized with light green and orange. Range of motion restored to 95%.'
        },
        {
          date: '2026-05-25',
          protocol: 'Pain and Inflammation Control',
          notes: 'Sweeping of right shoulder chakra. Applied blue light to cool down inflammation, followed by green and orange for regeneration.'
        }
      ]
    },
  ]);

  const filteredPatients = patients.filter(
    (patient) =>
      patient.name.toLowerCase().includes(searchText.toLowerCase()) ||
      patient.patientId.toLowerCase().includes(searchText.toLowerCase()) ||
      patient.condition.toLowerCase().includes(searchText.toLowerCase()) ||
      patient.phone.toLowerCase().includes(searchText.toLowerCase()) ||
      patient.healerName.toLowerCase().includes(searchText.toLowerCase())
  );

  const totalPages = Math.ceil(filteredPatients.length / ITEMS_PER_PAGE);
  const paginatedPatients = filteredPatients.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const getStatusClass = (status: Patient['status']) => {
    switch (status) {
      case 'Active':
        return 'healer-badge healer-badge--success';
      case 'Completed':
        return 'healer-badge healer-badge--primary';
      case 'On Hold':
        return 'healer-badge healer-badge--warning';
      default:
        return 'healer-badge';
    }
  };

  return (
    <IonPage className="sa-page">
      <IonHeader className="ion-no-border">
        <IonToolbar className="sa-page__toolbar">
          <IonButtons slot="start">
            <IonMenuButton />
          </IonButtons>
          <IonTitle className="sa-page__toolbar-title">My Patients</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="sa-page__content">
        <div className="healer-page-container">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div>
              <h2 style={{ margin: 0, fontWeight: 700, fontSize: '1.4rem' }}>Assigned Patients</h2>
              <p style={{ margin: '0.2rem 0 0 0', color: 'var(--ion-color-medium)', fontSize: '0.9rem' }}>
                Manage treatment details, notes, and records for your assigned patients.
              </p>
            </div>
          </div>

          <div className="sa-search" style={{ margin: '1rem 0', maxWidth: '100%' }}>
            <IonIcon icon={searchOutline} />
            <input
              placeholder="Search patients by name, ID, phone, condition or healer..."
              value={searchText}
              onChange={(e) => {
                setSearchText(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          <div className="healer-table-card" style={{ padding: 0 }}>
            <table className="healer-table">
              <thead>
                <tr>
                  <th>Patient Info</th>
                  <th>Age/Gender</th>
                  <th>Phone</th>
                  <th>Primary Condition</th>
                  <th>Healer Name</th>
                  <th>Status</th>
                  <th>Last Session</th>
                  <th style={{ textAlign: 'right', paddingRight: '24px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedPatients.length > 0 ? (
                  paginatedPatients.map((patient) => (
                    <tr key={patient.id}>
                      <td style={{ paddingLeft: '24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div className="healer-patient-row__avatar">
                            {patient.name.split(' ').map((n) => n[0]).join('')}
                          </div>
                          <div>
                            <span style={{ fontWeight: 600, display: 'block' }}>{patient.name}</span>
                            <span style={{ fontSize: '0.8rem', color: 'var(--ion-color-medium)' }}>
                              {patient.patientId}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td>
                        {patient.age} / {patient.gender}
                      </td>
                      <td>{patient.phone}</td>
                      <td>{patient.condition}</td>
                      <td>{patient.healerName}</td>
                      <td>
                        <span className={getStatusClass(patient.status)}>{patient.status}</span>
                      </td>
                      <td>{patient.lastSession}</td>
                      <td style={{ textAlign: 'right', paddingRight: '24px' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                          <button
                            className="healer-btn"
                            onClick={() => {
                              setSelectedPatient(patient);
                              setShowDetailModal(true);
                            }}
                            title="View Patient Details"
                            style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                          >
                            <IonIcon icon={eyeOutline} /> View
                          </button>
                          <button
                            className="healer-btn healer-btn--secondary"
                            onClick={() => {
                              setSelectedPatient(patient);
                              setShowNotesModal(true);
                            }}
                            title="View Patient Notes"
                            style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                          >
                            <IonIcon icon={documentTextOutline} /> Notes
                          </button>
                          {/* <button
                            className="healer-btn healer-btn--secondary"
                            onClick={() => history.push(`/healer/documents?patientId=${patient.id}`)}
                            title="View Patient Documents"
                            style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                          >
                            <IonIcon icon={folderOpenOutline} /> Docs
                          </button> */}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: '3rem', color: 'var(--ion-color-medium)' }}>
                      <IonIcon icon={peopleOutline} style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.5 }} />
                      <p style={{ margin: 0, fontWeight: 500 }}>No patients found matching your search criteria.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Pagination controls */}
            <div className="sa-table__footer">
              <div className="sa-pagination__info">
                Showing {filteredPatients.length > 0 ? (currentPage - 1) * ITEMS_PER_PAGE + 1 : 0} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredPatients.length)} of {filteredPatients.length} patients
              </div>
              <div className="sa-pagination__controls">
                <button
                  className="sa-pagination__btn"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((prev) => prev - 1)}
                >
                  <IonIcon icon={chevronBackOutline} />
                </button>
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    className={`sa-pagination__btn ${currentPage === i + 1 ? 'sa-pagination__btn--active' : ''}`}
                    onClick={() => setCurrentPage(i + 1)}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  className="sa-pagination__btn"
                  disabled={currentPage === totalPages || totalPages === 0}
                  onClick={() => setCurrentPage((prev) => prev + 1)}
                >
                  <IonIcon icon={chevronForwardOutline} />
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* Patient Detail Modal */}
        <IonModal
          isOpen={showDetailModal}
          onDidDismiss={() => {
            setShowDetailModal(false);
            setSelectedPatient(null);
          }}
          className="healer-modal-content"
        >
          <div className="sa-modal__content">
            <div className="sa-modal__header">
              <h2>Patient Profile Details</h2>
              <button
                className="sa-modal__close-btn"
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedPatient(null);
                }}
              >
                ×
              </button>
            </div>

            <div className="healer-modal-body">
              {selectedPatient && (
                <>
                  <div className="healer-modal-profile">
                    <div className="healer-modal-avatar">
                      {selectedPatient.name.split(' ').map((n) => n[0]).join('')}
                    </div>
                    <div>
                      <h3 className="healer-modal-name">{selectedPatient.name}</h3>
                      <span className="healer-modal-id">{selectedPatient.patientId}</span>
                    </div>
                  </div>

                  <div className="healer-modal-grid">
                    {/* Left Column: Basic Info & Medical History */}
                    <div className="healer-modal-col">
                      <h4 className="healer-modal-sec-title">Basic Information</h4>
                      <div className="healer-modal-info-card">
                        <div className="healer-modal-info-item">
                          <strong>Age / Gender:</strong> {selectedPatient.age} / {selectedPatient.gender}
                        </div>
                        <div className="healer-modal-info-item">
                          <strong>Phone:</strong> {selectedPatient.phone}
                        </div>
                        <div className="healer-modal-info-item">
                          <strong>Primary Condition:</strong> {selectedPatient.condition}
                        </div>
                        <div className="healer-modal-info-item">
                          <strong>Healer Name:</strong> {selectedPatient.healerName}
                        </div>
                        <div className="healer-modal-info-item">
                          <strong>Status:</strong> <span className={getStatusClass(selectedPatient.status)}>{selectedPatient.status}</span>
                        </div>
                        <div className="healer-modal-info-item">
                          <strong>Last Session:</strong> {selectedPatient.lastSession}
                        </div>
                        <div className="healer-modal-info-item">
                          <strong>Next Session:</strong> {selectedPatient.nextSession}
                        </div>
                      </div>

                      <h4 className="healer-modal-sec-title">Medical History</h4>
                      <div className="healer-modal-history-card">
                        <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: 1.5, color: 'var(--color-text-primary)' }}>
                          {selectedPatient.medicalHistory}
                        </p>
                      </div>
                    </div>

                    {/* Right Column: Session History & Follow-up Notes */}
                    <div className="healer-modal-col">
                      <h4 className="healer-modal-sec-title">Session History</h4>
                      <div className="healer-modal-sessions-list">
                        {selectedPatient.sessions && selectedPatient.sessions.length > 0 ? (
                          selectedPatient.sessions.map((session, idx) => (
                            <div key={idx} className="healer-modal-session-item">
                              <div className="healer-modal-session-header">
                                <span className="healer-modal-session-date">{session.date}</span>
                                <span className="healer-modal-session-proto">{session.protocol}</span>
                              </div>
                              <p className="healer-modal-session-notes">{session.notes}</p>
                            </div>
                          ))
                        ) : (
                          <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
                            No session history recorded.
                          </p>
                        )}
                      </div>

                      <h4 className="healer-modal-sec-title">Follow-up Notes</h4>
                      <div className="healer-modal-followup-card">
                        <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: 1.5, color: 'var(--color-text-primary)' }}>
                          {selectedPatient.followUpNotes}
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </IonModal>

        {/* Patient Notes Modal */}
        <IonModal
          isOpen={showNotesModal}
          onDidDismiss={() => {
            setShowNotesModal(false);
            setSelectedPatient(null);
          }}
          className="healer-modal-content"
        >
          <div className="sa-modal__content">
            <div className="sa-modal__header">
              <h2>Patient Notes: {selectedPatient?.name}</h2>
              <button
                className="sa-modal__close-btn"
                onClick={() => {
                  setShowNotesModal(false);
                  setSelectedPatient(null);
                }}
              >
                ×
              </button>
            </div>

            <div className="healer-modal-body">
              {selectedPatient && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                  <h4 className="healer-modal-sec-title">Follow-up Notes</h4>
                  <div className="healer-modal-followup-card">
                    <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: 1.5, color: 'var(--color-text-primary)' }}>
                      {selectedPatient.followUpNotes}
                    </p>
                  </div>

                  <h4 className="healer-modal-sec-title">Session History Notes</h4>
                  <div className="healer-modal-sessions-list">
                    {selectedPatient.sessions && selectedPatient.sessions.length > 0 ? (
                      selectedPatient.sessions.map((session, idx) => (
                        <div key={idx} className="healer-modal-session-item">
                          <div className="healer-modal-session-header">
                            <span className="healer-modal-session-date">{session.date}</span>
                            <span className="healer-modal-session-proto">{session.protocol}</span>
                          </div>
                          <p className="healer-modal-session-notes">{session.notes}</p>
                        </div>
                      ))
                    ) : (
                      <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
                        No session notes recorded.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </IonModal>
      </IonContent>
    </IonPage>
  );
};

export default MyPatientsPage;
