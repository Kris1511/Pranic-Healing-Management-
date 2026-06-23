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
  IonSearchbar,
  IonModal,
  IonSpinner,
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
import { getPatients } from '../../api/patient.api';
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
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const ITEMS_PER_PAGE = 5;

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getPatients();
        const apiPatients = Array.isArray(response) ? response : (response.data || response);

        if (Array.isArray(apiPatients)) {
          let relevantPatients = apiPatients;
          if (user?.role?.toUpperCase() === 'HEALER') {
            const currentUserName = user?.name || [user?.firstName, user?.lastName].filter(Boolean).join(' ');
            relevantPatients = apiPatients.filter((p: any) => {
              if (!currentUserName) return false;
              const isAssigned = p.healer?.name === currentUserName || p.healerName === currentUserName;
              const hasSession = p.sessions?.some((s: any) => s.healer?.name === currentUserName || s.healerName === currentUserName);
              return isAssigned || hasSession;
            });
          }

          const formattedPatients: Patient[] = relevantPatients.map((p: any) => {
            const completedSessions = p.sessions ? p.sessions.filter((s: any) => s.status === 'completed') : [];
            const scheduledSessions = p.sessions ? p.sessions.filter((s: any) => s.status === 'scheduled') : [];
            
            const lastSessionDate = completedSessions.length > 0 
              ? new Date(Math.max(...completedSessions.map((s: any) => new Date(s.sessionDate).getTime()))).toISOString().split('T')[0]
              : 'None';

            const nextSessionDate = scheduledSessions.length > 0
              ? new Date(Math.min(...scheduledSessions.map((s: any) => new Date(s.sessionDate).getTime()))).toISOString().split('T')[0]
              : 'TBD';

            return {
              id: p.id,
              patientId: p.patientId || 'N/A',
              name: p.name,
              gender: p.gender || 'Unknown',
              age: p.age || 0,
              phone: p.phone || '',
              healerName: p.healer?.name || 'Unassigned',
              condition: p.treatmentType || 'General Treatment',
              status: p.status ? (p.status.charAt(0).toUpperCase() + p.status.slice(1).toLowerCase()) as any : 'Active',
              lastSession: lastSessionDate,
              nextSession: nextSessionDate,
              medicalHistory: p.medicalHistory || 'No medical history recorded.',
              followUpNotes: p.medicalHistory || 'No follow-up notes.',
              sessions: p.sessions ? p.sessions.map((s: any) => ({
                date: s.sessionDate ? new Date(s.sessionDate).toISOString().split('T')[0] : 'N/A',
                protocol: s.treatments && s.treatments.length > 0 
                  ? s.treatments.map((t: any) => t.treatmentName).join(', ') 
                  : 'Pranic Restoration',
                notes: s.notes || 'No session notes.'
              })) : []
            };
          });
          setPatients(formattedPatients);
        }
      } catch (err: any) {
        console.error('Failed to load assigned patients:', err);
        setError('Failed to retrieve assigned patients.');
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, []);

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
                {loading ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: '3rem' }}>
                      <IonSpinner name="crescent" />
                      <p style={{ margin: '0.5rem 0 0 0', fontWeight: 500, color: 'var(--ion-color-medium)' }}>Loading assigned patients...</p>
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: '3rem', color: 'var(--ion-color-danger)' }}>
                      <p style={{ margin: 0, fontWeight: 500 }}>{error}</p>
                    </td>
                  </tr>
                ) : paginatedPatients.length > 0 ? (
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
                              history.push(`/healer/patients/details/${patient.id}`);
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
