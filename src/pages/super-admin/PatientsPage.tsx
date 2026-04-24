import React, { useState } from 'react';
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
  personAddOutline,
  createOutline,
  trashOutline,
  chevronBackOutline,
  chevronForwardOutline,
  peopleOutline,
  heartOutline,
  checkmarkCircleOutline,
  callOutline,
  mailOutline,
  calendarOutline,
} from 'ionicons/icons';
import './super-admin.css';

const PatientsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [patientToDelete, setPatientToDelete] = useState<any>(null);
  
  const [patients, setPatients] = useState([
    { id: 1, name: 'Elena Gilbert', email: 'elena.g@example.com', phone: '+1 234 567 8901', branch: 'Uptown Sanctuary', healer: 'Dr. Aris Varma', lastVisit: '2024-04-20', status: 'active' },
    { id: 2, name: 'Stefan Salvatore', email: 'stefan.s@example.com', phone: '+1 234 567 8902', branch: 'Coastal Healing Center', healer: 'Maya Rose', lastVisit: '2024-04-18', status: 'recovered' },
    { id: 3, name: 'Bonnie Bennett', email: 'bonnie.b@example.com', phone: '+1 234 567 8903', branch: 'Green Valley Branch', healer: 'Samuel Chen', lastVisit: '2024-04-22', status: 'active' },
    { id: 4, name: 'Damon Salvatore', email: 'damon.s@example.com', phone: '+1 234 567 8904', branch: 'Downtown Sanctuary', healer: 'Lila Thorne', lastVisit: '2024-03-15', status: 'on-hold' },
    { id: 5, name: 'Caroline Forbes', email: 'caroline.f@example.com', phone: '+1 234 567 8905', branch: 'Uptown Sanctuary', healer: 'Julian Mars', lastVisit: '2024-04-21', status: 'active' },
    { id: 6, name: 'Matt Donovan', email: 'matt.d@example.com', phone: '+1 234 567 8906', branch: 'Coastal Healing Center', healer: 'Sofia Bell', lastVisit: '2024-04-10', status: 'recovered' },
  ]);

  const [newPatient, setNewPatient] = useState({
    name: '',
    email: '',
    phone: '',
    branch: 'Uptown Sanctuary',
    healer: 'Dr. Aris Varma',
  });

  const handleAddPatient = () => {
    if (!newPatient.name || !newPatient.email) return;
    
    const patientObj = {
      id: patients.length + 1,
      ...newPatient,
      lastVisit: new Date().toISOString().split('T')[0],
      status: 'active'
    };

    setPatients([...patients, patientObj]);
    setNewPatient({ name: '', email: '', phone: '', branch: 'Uptown Sanctuary', healer: 'Dr. Aris Varma' });
    setShowAddModal(false);
  };

  const handleEditClick = (patient: any) => {
    setSelectedPatient({ ...patient });
    setShowEditModal(true);
  };

  const handleUpdatePatient = () => {
    if (!selectedPatient) return;
    setPatients(patients.map(p => p.id === selectedPatient.id ? selectedPatient : p));
    setShowEditModal(false);
  };

  const handleDeleteClick = (patient: any) => {
    setPatientToDelete(patient);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    if (patientToDelete) {
      setPatients(patients.filter(p => p.id !== patientToDelete.id));
      setShowDeleteModal(false);
      setPatientToDelete(null);
    }
  };

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  const filteredPatients = patients.filter(patient => 
    patient.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    patient.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.branch.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.healer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredPatients.length / ITEMS_PER_PAGE);
  const paginatedPatients = filteredPatients.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleSearchChange = (e: any) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  return (
    <IonPage className="sa-page">
      <IonHeader className="ion-no-border">
        <IonToolbar className="sa-page__toolbar">
          <IonButtons slot="start">
            <IonMenuButton />
          </IonButtons>
          <IonTitle className="sa-page__toolbar-title">Patient Directory</IonTitle>
          <IonButtons slot="end">
            <button className="sa-page__toolbar-avatar">SA</button>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent className="sa-page__content">
        <div className="sa-page__body">
          <div className="sa-page__header">
            <div className="sa-page__header-row">
              <div>
                <h1 className="sa-page__title">Patient Management</h1>
                <p className="sa-page__subtitle">Track and manage patient records across all branches</p>
              </div>
              <button className="sa-btn sa-btn--primary" onClick={() => setShowAddModal(true)}>
                <IonIcon icon={personAddOutline} /> Add New Patient
              </button>
            </div>
          </div>

          <div className="sa-stats sa-stats--3">
            <div className="sa-stat-card">
              <div className="sa-stat-card__icon sa-stat-card__icon--primary">
                <IonIcon icon={peopleOutline} />
              </div>
              <div>
                <div className="sa-stat-card__label">Total Patients</div>
                <div className="sa-stat-card__value">{patients.length}</div>
              </div>
            </div>
            <div className="sa-stat-card">
              <div className="sa-stat-card__icon sa-stat-card__icon--warning">
                <IonIcon icon={heartOutline} />
              </div>
              <div>
                <div className="sa-stat-card__label">Active Treatments</div>
                <div className="sa-stat-card__value">{patients.filter(p => p.status === 'active').length}</div>
              </div>
            </div>
            <div className="sa-stat-card">
              <div className="sa-stat-card__icon sa-stat-card__icon--success">
                <IonIcon icon={checkmarkCircleOutline} />
              </div>
              <div>
                <div className="sa-stat-card__label">Fully Recovered</div>
                <div className="sa-stat-card__value">{patients.filter(p => p.status === 'recovered').length}</div>
              </div>
            </div>
          </div>

          <div className="sa-section-header">
            <div className="sa-search">
              <IonIcon icon={searchOutline} />
              <input 
                placeholder="Search by name, email, branch or healer..." 
                value={searchQuery}
                onChange={handleSearchChange}
              />
            </div>
          </div>

          <div className="sa-section" style={{ padding: 0, overflow: 'hidden' }}>
            <table className="sa-table">
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Contact</th>
                  <th>Assigned Branch</th>
                  <th>Assigned Healer</th>
                  <th>Last Visit</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedPatients.map((patient) => (
                  <tr key={patient.id}>
                    <td>
                      <div className="sa-table__user">
                        <div className="sa-table__avatar sa-table__avatar--patient">
                          {patient.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="sa-table__user-info">
                          <span className="sa-table__user-name">{patient.name}</span>
                          <span className="sa-table__user-id">ID: #PT-{1000 + patient.id}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="sa-table__contact-info">
                        <div className="sa-table__contact-item">
                          <IonIcon icon={mailOutline} /> {patient.email}
                        </div>
                        <div className="sa-table__contact-item">
                          <IonIcon icon={callOutline} /> {patient.phone}
                        </div>
                      </div>
                    </td>
                    <td>{patient.branch}</td>
                    <td>{patient.healer}</td>
                    <td>
                      <div className="sa-table__date">
                        <IonIcon icon={calendarOutline} />
                        {patient.lastVisit}
                      </div>
                    </td>
                    <td>
                      <span className={`sa-badge sa-badge--${patient.status}`}>
                        {patient.status.replace('-', ' ')}
                      </span>
                    </td>
                    <td>
                      <div className="sa-table__actions">
                        <button className="sa-table__action-btn" onClick={() => handleEditClick(patient)}>
                          <IonIcon icon={createOutline} />
                        </button>
                        <button className="sa-table__action-btn sa-table__action-btn--danger" onClick={() => handleDeleteClick(patient)}>
                          <IonIcon icon={trashOutline} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="sa-table__footer">
              <div className="sa-pagination__info">
                Showing {filteredPatients.length > 0 ? (currentPage - 1) * ITEMS_PER_PAGE + 1 : 0} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredPatients.length)} of {filteredPatients.length} patients
              </div>
              <div className="sa-pagination__controls">
                <button 
                  className="sa-pagination__btn" 
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => prev - 1)}
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
                  onClick={() => setCurrentPage(prev => prev + 1)}
                >
                  <IonIcon icon={chevronForwardOutline} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </IonContent>

      {/* Add Patient Modal */}
      <IonModal isOpen={showAddModal} onDidDismiss={() => setShowAddModal(false)} className="sa-modal">
        <div className="sa-modal__content">
          <div className="sa-modal__header">
            <h2>Register New Patient</h2>
            <button className="sa-modal__close-btn" onClick={() => setShowAddModal(false)}>×</button>
          </div>
          <div className="sa-modal__body">
            <div className="sa-settings__form-group">
              <label className="sa-settings__label">Full Name</label>
              <input 
                className="sa-settings__input" 
                placeholder="Patient Full Name"
                value={newPatient.name}
                onChange={(e) => setNewPatient({ ...newPatient, name: e.target.value })}
              />
            </div>
            <div className="sa-settings__form-row">
              <div className="sa-settings__form-group">
                <label className="sa-settings__label">Email</label>
                <input 
                  className="sa-settings__input" 
                  placeholder="email@example.com"
                  value={newPatient.email}
                  onChange={(e) => setNewPatient({ ...newPatient, email: e.target.value })}
                />
              </div>
              <div className="sa-settings__form-group">
                <label className="sa-settings__label">Phone Number</label>
                <input 
                  className="sa-settings__input" 
                  placeholder="+1 234 567 8900"
                  value={newPatient.phone}
                  onChange={(e) => setNewPatient({ ...newPatient, phone: e.target.value })}
                />
              </div>
            </div>
            <div className="sa-settings__form-row">
              <div className="sa-settings__form-group">
                <label className="sa-settings__label">Assigned Branch</label>
                <select 
                  className="sa-settings__input"
                  value={newPatient.branch}
                  onChange={(e) => setNewPatient({ ...newPatient, branch: e.target.value })}
                >
                  <option>Uptown Sanctuary</option>
                  <option>Coastal Healing Center</option>
                  <option>Green Valley Branch</option>
                  <option>Downtown Sanctuary</option>
                </select>
              </div>
              <div className="sa-settings__form-group">
                <label className="sa-settings__label">Assigned Healer</label>
                <select 
                  className="sa-settings__input"
                  value={newPatient.healer}
                  onChange={(e) => setNewPatient({ ...newPatient, healer: e.target.value })}
                >
                  <option>Dr. Aris Varma</option>
                  <option>Maya Rose</option>
                  <option>Samuel Chen</option>
                  <option>Lila Thorne</option>
                </select>
              </div>
            </div>
          </div>
          <div className="sa-modal__footer">
            <button className="sa-btn sa-btn--outline" onClick={() => setShowAddModal(false)}>Cancel</button>
            <button className="sa-btn sa-btn--primary" onClick={handleAddPatient}>Register Patient</button>
          </div>
        </div>
      </IonModal>

      {/* Edit Patient Modal */}
      <IonModal isOpen={showEditModal} onDidDismiss={() => setShowEditModal(false)} className="sa-modal">
        <div className="sa-modal__content">
          <div className="sa-modal__header">
            <h2>Edit Patient Record</h2>
            <button className="sa-modal__close-btn" onClick={() => setShowEditModal(false)}>×</button>
          </div>
          {selectedPatient && (
            <div className="sa-modal__body">
              <div className="sa-settings__form-group">
                <label className="sa-settings__label">Full Name</label>
                <input 
                  className="sa-settings__input" 
                  value={selectedPatient.name}
                  onChange={(e) => setSelectedPatient({ ...selectedPatient, name: e.target.value })}
                />
              </div>
              <div className="sa-settings__form-row">
                <div className="sa-settings__form-group">
                  <label className="sa-settings__label">Status</label>
                  <select 
                    className="sa-settings__input"
                    value={selectedPatient.status}
                    onChange={(e) => setSelectedPatient({ ...selectedPatient, status: e.target.value })}
                  >
                    <option value="active">Active</option>
                    <option value="recovered">Recovered</option>
                    <option value="on-hold">On Hold</option>
                  </select>
                </div>
                <div className="sa-settings__form-group">
                  <label className="sa-settings__label">Healer</label>
                  <select 
                    className="sa-settings__input"
                    value={selectedPatient.healer}
                    onChange={(e) => setSelectedPatient({ ...selectedPatient, healer: e.target.value })}
                  >
                    <option>Dr. Aris Varma</option>
                    <option>Maya Rose</option>
                    <option>Samuel Chen</option>
                    <option>Lila Thorne</option>
                  </select>
                </div>
              </div>
            </div>
          )}
          <div className="sa-modal__footer">
            <button className="sa-btn sa-btn--outline" onClick={() => setShowEditModal(false)}>Cancel</button>
            <button className="sa-btn sa-btn--primary" onClick={handleUpdatePatient}>Save Changes</button>
          </div>
        </div>
      </IonModal>

      {/* Delete Confirmation Modal */}
      <IonModal isOpen={showDeleteModal} onDidDismiss={() => setShowDeleteModal(false)} className="sa-modal sa-modal--sm">
        <div className="sa-modal__content">
          <div className="sa-modal__header">
            <h2>Archive Patient Record</h2>
            <button className="sa-modal__close-btn" onClick={() => setShowDeleteModal(false)}>×</button>
          </div>
          <div className="sa-modal__body">
            <p className="sa-modal__desc">
              Are you sure you want to archive <strong>{patientToDelete?.name}</strong>? All their treatment history will be preserved but they will no longer appear in active lists.
            </p>
          </div>
          <div className="sa-modal__footer">
            <button className="sa-btn sa-btn--outline" onClick={() => setShowDeleteModal(false)}>Cancel</button>
            <button className="sa-btn sa-btn--danger" onClick={handleConfirmDelete}>Confirm Archive</button>
          </div>
        </div>
      </IonModal>
    </IonPage>
  );
};

export default PatientsPage;
