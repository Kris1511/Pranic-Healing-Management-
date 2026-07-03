import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
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
  useIonViewWillEnter,
  useIonViewWillLeave,
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
  eyeOutline,
} from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { getPatients, updatePatient, deletePatient, createPatient } from '../../api/patient.api';
import { getBranches } from '../../api/branch.api';
import { getHealers } from '../../api/healer.api';
import '../branch-admin/branch-admin.css';
import './super-admin.css';
import ProfileDropdown from '../../components/common/ProfileDropdown';


const PatientsPage: React.FC = () => {
  const history = useHistory();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [patientToDelete, setPatientToDelete] = useState<any>(null);
  const [isPageActive, setIsPageActive] = useState(true);

  const [selectedBranch, setSelectedBranch] = useState('All Branches');
  const [selectedStatus, setSelectedStatus] = useState('All Status');
  const [availableBranches, setAvailableBranches] = useState<any[]>([]);
  const [availableHealers, setAvailableHealers] = useState<any[]>([]);

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const response = await getBranches();
        setAvailableBranches(response.data || response || []);
      } catch (error) {
        console.error('Error fetching branches:', error);
      }
    };
    const fetchHealers = async () => {
      try {
        const response = await getHealers();
        setAvailableHealers(response.data || response || []);
      } catch (error) {
        console.error('Error fetching healers:', error);
      }
    };
    fetchBranches();
    fetchHealers();
  }, []);

  useIonViewWillEnter(() => setIsPageActive(true));
  useIonViewWillLeave(() => setIsPageActive(false));

  const { data: patientsRes, refetch } = useQuery({
    queryKey: ['super-admin-patients', selectedBranch, selectedStatus],
    queryFn: async () => {
      const params: any = {};
      if (selectedBranch !== 'All Branches') params.branchId = selectedBranch;
      if (selectedStatus !== 'All Status') params.status = selectedStatus;

      const response = await getPatients(params);
      const raw = Array.isArray(response) ? response : (response?.data || []);
      return raw.map((p: any) => ({
        id: p.id,
        patientId: p.patientId || '—',
        name: p.name,
        email: p.email || '',
        phone: p.phone || '',
        branch: p.branch?.name || 'Unassigned',
        healer: p.healer?.name || 'Unassigned',
        lastVisit: p.lastVisit || '—',
        status: p.status?.toLowerCase() || 'active',
      }));
    },
    enabled: true,
    refetchInterval: isPageActive ? 3000 : false,
    staleTime: 0,
  });

  const patients = patientsRes || [];

  const [newPatient, setNewPatient] = useState({
    name: '',
    email: '',
    phone: '',
    branchId: '',
    healerId: '',
  });

  useEffect(() => {
    if (availableBranches.length > 0 && !newPatient.branchId) {
      setNewPatient(prev => ({ ...prev, branchId: availableBranches[0].id }));
    }
  }, [availableBranches, newPatient.branchId]);

  useEffect(() => {
    if (availableHealers.length > 0 && !newPatient.healerId) {
      setNewPatient(prev => ({ ...prev, healerId: availableHealers[0].id }));
    }
  }, [availableHealers, newPatient.healerId]);

  const handleAddPatient = async () => {
    if (!newPatient.name || !newPatient.email || !newPatient.branchId) {
      alert('Please fill in all required fields.');
      return;
    }
    try {
      await createPatient({
        name: newPatient.name,
        email: newPatient.email,
        phone: newPatient.phone,
        branchId: newPatient.branchId,
        healerId: newPatient.healerId || null,
        status: 'active'
      });
      refetch();
      setNewPatient({
        name: '',
        email: '',
        phone: '',
        branchId: availableBranches[0]?.id || '',
        healerId: availableHealers[0]?.id || '',
      });
      setShowAddModal(false);
    } catch (error) {
      console.error('Error creating patient:', error);
      alert('Failed to create patient');
    }
  };

  const handleEditClick = (patient: any) => {
    setSelectedPatient({ ...patient });
    setShowEditModal(true);
  };

  const handleUpdatePatient = async () => {
    if (!selectedPatient) return;
    try {
      if (selectedPatient.id) {
        await updatePatient(String(selectedPatient.id), {
          name: selectedPatient.name,
          email: selectedPatient.email,
          phone: selectedPatient.phone,
          status: selectedPatient.status
        });
      }
      refetch();
      setShowEditModal(false);
    } catch (error) {
      console.error('Error updating patient:', error);
      alert('Failed to update patient');
    }
  };

  const handleDeleteClick = (patient: any) => {
    setPatientToDelete(patient);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (patientToDelete) {
      try {
        if (patientToDelete.id) {
          await deletePatient(String(patientToDelete.id));
        }
        refetch();
        setShowDeleteModal(false);
        setPatientToDelete(null);
      } catch (error) {
        console.error('Failed to delete patient:', error);
        alert('Failed to delete patient. Please try again.');
      }
    }
  };

  const handleToggleStatus = async (patient: any) => {
    const newStatus = patient.status === 'active' ? 'inactive' : 'active';
    try {
      if (patient.id) {
        await updatePatient(String(patient.id), {
          status: newStatus
        });
      }
      refetch();
    } catch (error) {
      console.error('Error toggling patient status:', error);
      alert('Failed to update status');
    }
  };

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  const filteredPatients = patients.filter((patient: any) => 
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

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
            <ProfileDropdown />
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
                <div className="sa-stat-card__value">{patients.filter((p: any) => p.status === 'active').length}</div>
              </div>
            </div>
            <div className="sa-stat-card">
              <div className="sa-stat-card__icon sa-stat-card__icon--success">
                <IonIcon icon={checkmarkCircleOutline} />
              </div>
              <div>
                <div className="sa-stat-card__label">Fully Recovered</div>
                <div className="sa-stat-card__value">{patients.filter((p: any) => p.status === 'recovered').length}</div>
              </div>
            </div>
          </div>

          <div className="sa-section-header" style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
              <div className="sa-search" style={{ margin: 0, flex: '1 1 300px', maxWidth: '400px' }}>
                <IonIcon icon={searchOutline} />
                <input 
                  placeholder="Search by name, email, branch or healer..." 
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
              </div>
              
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
                {/* Branch Filter */}
                <select 
                  style={{
                    padding: '8px 14px',
                    borderRadius: '8px',
                    border: '1px solid var(--color-border)',
                    background: '#f5f6fa',
                    fontSize: '14px',
                    outline: 'none',
                    color: 'var(--color-text-primary)',
                    cursor: 'pointer',
                    minWidth: '150px'
                  }}
                  value={selectedBranch}
                  onChange={(e) => {
                    setSelectedBranch(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  <option value="All Branches">All Branches</option>
                  {availableBranches.map((branch: any) => (
                    <option key={branch.id} value={branch.id}>{branch.name}</option>
                  ))}
                </select>

                {/* Status Filter */}
                <select 
                  style={{
                    padding: '8px 14px',
                    borderRadius: '8px',
                    border: '1px solid var(--color-border)',
                    background: '#f5f6fa',
                    fontSize: '14px',
                    outline: 'none',
                    color: 'var(--color-text-primary)',
                    cursor: 'pointer',
                    minWidth: '130px'
                  }}
                  value={selectedStatus}
                  onChange={(e) => {
                    setSelectedStatus(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  <option value="All Status">All Status</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>

          <div className="sa-section pa-table-container">
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
                {paginatedPatients.map((patient: any) => (
                  <tr key={patient.id}>
                    <td>
                      <div className="sa-table__user">
                        <div className="sa-table__avatar sa-table__avatar--patient">
                          {patient.name.split(' ').map((n: string) => n[0]).join('')}
                        </div>
                        <div className="sa-table__user-info">
                          <span className="sa-table__user-name">{patient.name}</span>
                          <span className="sa-table__user-id">ID: #{patient.patientId}</span>
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
                      <span 
                        className={`sa-badge sa-badge--${patient.status}`}
                        style={{ cursor: 'pointer' }}
                        title="Click to toggle status"
                        onClick={() => handleToggleStatus(patient)}
                      >
                        {patient.status.replace('-', ' ')}
                      </span>
                    </td>
                    <td>
                      <div className="sa-table__actions">
                        <button className="sa-table__action-btn" onClick={() => history.push(`/super-admin/patients/details/${patient.id}`)} title="View Details">
                          <IonIcon icon={eyeOutline} />
                        </button>
                        <button className="sa-table__action-btn" onClick={() => history.push(`/super-admin/patients/edit/${patient.id}`)} title="Edit Details">
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
                <label className="sa-settings__label">Assigned Branch *</label>
                <select 
                  className="sa-settings__input"
                  value={newPatient.branchId}
                  onChange={(e) => setNewPatient({ ...newPatient, branchId: e.target.value })}
                >
                  <option value="">Select a branch</option>
                  {availableBranches.map((b: any) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>
              <div className="sa-settings__form-group">
                <label className="sa-settings__label">Assigned Healer</label>
                <select 
                  className="sa-settings__input"
                  value={newPatient.healerId}
                  onChange={(e) => setNewPatient({ ...newPatient, healerId: e.target.value })}
                >
                  <option value="">Select a healer</option>
                  {availableHealers.map((h: any) => (
                    <option key={h.id} value={h.id}>{h.name}</option>
                  ))}
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
