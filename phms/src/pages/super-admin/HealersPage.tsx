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
  personAddOutline,
  createOutline,
  trashOutline,
  chevronBackOutline,
  chevronForwardOutline,
  medkitOutline,
  ribbonOutline,
  peopleOutline,
  eyeOutline,
} from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { getHealers, updateHealer, deleteHealer, createHealer } from '../../api/healer.api';
import { getBranches } from '../../api/branch.api';
import { getTreatmentTypes } from '../../api/treatmentType.api';
import './super-admin.css';
import ProfileDropdown from '../../components/common/ProfileDropdown';


const HealersPage: React.FC = () => {
  const history = useHistory();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedHealer, setSelectedHealer] = useState<any>(null);
  const [healerToDelete, setHealerToDelete] = useState<any>(null);
  
  const [healers, setHealers] = useState<any[]>([]);
  const [availableBranches, setAvailableBranches] = useState<any[]>([]);
  const [availableSpecialties, setAvailableSpecialties] = useState<any[]>([]);

  const [selectedSpecialty, setSelectedSpecialty] = useState('All Specialties');
  const [selectedBranch, setSelectedBranch] = useState('All Branches');
  const [selectedStatus, setSelectedStatus] = useState('All Status');

  useEffect(() => {
    let intervalId: any;

    const fetchAllData = async () => {
      try {
        const specialtiesResponse = await getTreatmentTypes();
        const specialtiesData = specialtiesResponse.data || specialtiesResponse || [];
        setAvailableSpecialties(specialtiesData);

        const branchesResponse = await getBranches();
        const branchesData = branchesResponse.data || branchesResponse || [];
        setAvailableBranches(branchesData);

        const params: any = {};
        if (selectedSpecialty !== 'All Specialties') params.specialty = selectedSpecialty;
        if (selectedBranch !== 'All Branches') params.branchId = selectedBranch;
        if (selectedStatus !== 'All Status') params.status = selectedStatus;

        const healersResponse = await getHealers(params);
        const apiHealers = Array.isArray(healersResponse) ? healersResponse : (healersResponse.data || healersResponse);
        if (Array.isArray(apiHealers)) {
          const formattedHealers = apiHealers.map((h: any) => ({
            id: h.id,
            name: h.name,
            email: h.email || '',
            specialty: h.specialization || 'General',
            branch: h.branch?.name || 'Unassigned',
            branchId: h.branchId || '',
            experience: h.experience || 0,
            load: h.patientsCount || 0,
            status: h.status?.toLowerCase() || 'active',
          }));
          setHealers(formattedHealers);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchAllData();
    // removed single-line setInterval

  }, [selectedSpecialty, selectedBranch, selectedStatus]);

  const [newHealer, setNewHealer] = useState({
    name: '',
    email: '',
    specialty: '',
    branchId: '',
    experience: 0,
  });

  useEffect(() => {
    if (availableSpecialties.length > 0 && !newHealer.specialty) {
      setNewHealer(prev => ({ ...prev, specialty: availableSpecialties[0].name }));
    }
  }, [availableSpecialties, newHealer.specialty]);

  const handleAddHealer = async () => {
    if (!newHealer.name || !newHealer.email || !newHealer.branchId) {
      alert('Please fill in all required fields.');
      return;
    }
    
    try {
      const response = await createHealer({
        name: newHealer.name,
        email: newHealer.email,
        specialization: newHealer.specialty,
        branchId: newHealer.branchId,
        experience: newHealer.experience,
        status: 'active'
      });
      
      const created = response.data || response;
      const formatted = {
        id: created.id,
        name: created.name,
        email: created.email || '',
        specialty: created.specialization || 'General',
        branch: availableBranches.find(b => b.id === created.branchId)?.name || 'Unassigned',
        branchId: created.branchId || '',
        experience: created.experience || 0,
        load: 0,
        status: created.status?.toLowerCase() || 'active',
      };

      setHealers([...healers, formatted]);
      setNewHealer({ name: '', email: '', specialty: 'Advanced Pranic Healing', branchId: '', experience: 0 });
      setShowAddModal(false);
    } catch (error) {
      console.error('Error creating healer:', error);
      alert('Failed to create healer. Please check the fields and try again.');
    }
  };

  const handleEditClick = (healer: any) => {
    history.push(`/super-admin/healers/edit/${healer.id}`);
  };

  const handleUpdateHealer = async () => {
    if (!selectedHealer) return;
    try {
      if (typeof selectedHealer.id === 'string') {
        const payload: any = {
          name: selectedHealer.name,
          specialization: selectedHealer.specialty,
          status: selectedHealer.status
        };
        if (selectedHealer.branchId) {
          payload.branchId = selectedHealer.branchId;
        }
        await updateHealer(selectedHealer.id, payload);
      }
      
      const branchName = availableBranches.find(b => b.id === selectedHealer.branchId)?.name || 'Unassigned';
      const updatedHealer = {
        ...selectedHealer,
        branch: branchName
      };

      setHealers(healers.map(h => h.id === selectedHealer.id ? updatedHealer : h));
      setShowEditModal(false);
    } catch (error) {
      console.error('Error updating healer:', error);
      alert('Failed to update healer');
    }
  };

  const handleDeleteClick = (healer: any) => {
    setHealerToDelete(healer);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (healerToDelete) {
      try {
        if (typeof healerToDelete.id === 'string') {
          await deleteHealer(healerToDelete.id);
        }
        setHealers(healers.filter(h => h.id !== healerToDelete.id));
        setShowDeleteModal(false);
        setHealerToDelete(null);
      } catch (error) {
        console.error('Error deleting healer:', error);
        alert('Failed to delete healer');
      }
    }
  };

  const handleToggleStatus = async (healer: any) => {
    const newStatus = healer.status === 'active' ? 'inactive' : 'active';
    try {
      if (typeof healer.id === 'string') {
        await updateHealer(healer.id, {
          status: newStatus
        });
      }
      setHealers(prevHealers =>
        prevHealers.map(h => (h.id === healer.id ? { ...h, status: newStatus } : h))
      );
    } catch (error) {
      console.error('Error toggling healer status:', error);
      alert('Failed to update status');
    }
  };

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  const filteredHealers = healers.filter(healer => 
    healer.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    healer.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
    healer.branch.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredHealers.length / ITEMS_PER_PAGE);
  const paginatedHealers = filteredHealers.slice(
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
          <IonTitle className="sa-page__toolbar-title">Healers Directory</IonTitle>
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
                <h1 className="sa-page__title">Practitioner Management</h1>
                <p className="sa-page__subtitle">Monitor and manage healers across all branch locations</p>
              </div>
              {/* <button className="sa-btn sa-btn--primary" onClick={() => setShowAddModal(true)}>
                <IonIcon icon={personAddOutline} /> Add New Healer
              </button> */}
            </div>
          </div>

          <div className="sa-stats sa-stats--3">
            <div className="sa-stat-card" style={{ '--stat-card-accent': '#0f766e' } as React.CSSProperties}>
              <div>
                <div className="sa-stat-card__label">Total Healers</div>
                <div className="sa-stat-card__value" style={{ fontSize: '32px', marginTop: '4px' }}>{healers.length}</div>
              </div>
            </div>
            <div className="sa-stat-card" style={{ '--stat-card-accent': '#0f766e' } as React.CSSProperties}>
              <div>
                <div className="sa-stat-card__label">Active</div>
                <div className="sa-stat-card__value" style={{ fontSize: '32px', marginTop: '4px' }}>{healers.filter(h => h.status === 'active').length}</div>
              </div>
            </div>
            <div className="sa-stat-card" style={{ '--stat-card-accent': '#0f766e' } as React.CSSProperties}>
              <div>
                <div className="sa-stat-card__label">Inactive</div>
                <div className="sa-stat-card__value" style={{ fontSize: '32px', marginTop: '4px' }}>{healers.filter(h => h.status === 'inactive').length}</div>
              </div>
            </div>
          </div>

          <div className="sa-section-header" style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
              <div className="sa-search" style={{ margin: 0, flex: '1 1 300px', maxWidth: '400px' }}>
                <IonIcon icon={searchOutline} />
                <input 
                  placeholder="Search by name, specialty or branch..." 
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
              </div>
              
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
                {/* Specialty Filter */}
                {/* <select 
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
                  value={selectedSpecialty}
                  onChange={(e) => {
                    setSelectedSpecialty(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  <option value="All Specialties">All Specialties</option>
                  {availableSpecialties.map((spec: any) => (
                    <option key={spec.id} value={spec.name}>{spec.name}</option>
                  ))}
                </select> */}

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

          <div className="sa-section" style={{ padding: 0, overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <table className="sa-table">
              <thead>
                <tr>
                  <th>Healer</th>
                  <th>Specialty</th>
                  <th>Branch</th>
                  <th>Exp. (Yrs)</th>
                  <th>Current Patient</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedHealers.map((healer) => (
                  <tr key={healer.id}>
                    <td>
                      <div className="sa-table__user">
                        <div className="sa-table__avatar">
                          {healer.name.split(' ').map((n: string) => n[0]).join('')}
                        </div>
                        <div className="sa-table__user-info">
                          <span className="sa-table__user-name">{healer.name}</span>
                          <span className="sa-table__user-email">{healer.email}</span>
                        </div>
                      </div>
                    </td>
                    <td>{healer.specialty}</td>
                    <td>{healer.branch}</td>
                    <td>{healer.experience} Years</td>
                    <td>
                        <span className="sa-table__load-count">{healer.load} Patients</span>
                      {/* <div className="sa-table__load">
                        <div className="sa-table__load-bar">
                          <div 
                            className="sa-table__load-fill" 
                            style={{ 
                              width: `${Math.min((healer.load / 20) * 100, 100)}%`,
                              backgroundColor: healer.load > 15 ? 'var(--color-danger)' : 'var(--color-primary)'
                            }} 
                          />
                        </div>
                      </div> */}
                    </td>
                    <td>
                      <span 
                        className={`sa-badge sa-badge--${healer.status}`}
                        style={{ cursor: 'pointer' }}
                        title="Click to toggle status"
                        onClick={() => handleToggleStatus(healer)}
                      >
                        {healer.status}
                      </span>
                    </td>
                    <td>
                      <div className="sa-table__actions">
                        <button className="sa-table__action-btn" onClick={() => history.push(`/super-admin/healers/details/${healer.id}`)} title="View Details">
                          <IonIcon icon={eyeOutline} />
                        </button>
                        <button className="sa-table__action-btn" onClick={() => handleEditClick(healer)}>
                          <IonIcon icon={createOutline} />
                        </button>
                        <button className="sa-table__action-btn sa-table__action-btn--danger" onClick={() => handleDeleteClick(healer)}>
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
                Showing {filteredHealers.length > 0 ? (currentPage - 1) * ITEMS_PER_PAGE + 1 : 0} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredHealers.length)} of {filteredHealers.length} healers
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

      {/* Add Healer Modal */}
      <IonModal isOpen={showAddModal} onDidDismiss={() => setShowAddModal(false)} className="sa-modal">
        <div className="sa-modal__content">
          <div className="sa-modal__header">
            <h2>Add New Healer</h2>
            <button className="sa-modal__close-btn" onClick={() => setShowAddModal(false)}>×</button>
          </div>
          <div className="sa-modal__body">
            <div className="sa-settings__form-row">
              <div className="sa-settings__form-group">
                <label className="sa-settings__label">Full Name</label>
                <input 
                  className="sa-settings__input" 
                  placeholder="Practitioner Name"
                  value={newHealer.name}
                  onChange={(e) => setNewHealer({ ...newHealer, name: e.target.value })}
                />
              </div>
              <div className="sa-settings__form-group">
                <label className="sa-settings__label">Email</label>
                <input 
                  className="sa-settings__input" 
                  placeholder="email@phms.com"
                  value={newHealer.email}
                  onChange={(e) => setNewHealer({ ...newHealer, email: e.target.value })}
                />
              </div>
            </div>
            <div className="sa-settings__form-group">
              <label className="sa-settings__label">Specialty</label>
              <select 
                className="sa-settings__input"
                value={newHealer.specialty}
                onChange={(e) => setNewHealer({ ...newHealer, specialty: e.target.value })}
              >
                {availableSpecialties.map((spec: any) => (
                  <option key={spec.id} value={spec.name}>{spec.name}</option>
                ))}
              </select>
            </div>
            <div className="sa-settings__form-row">
              <div className="sa-settings__form-group">
                <label className="sa-settings__label">Assigned Branch</label>
                <select 
                  className="sa-settings__input"
                  value={newHealer.branchId}
                  onChange={(e) => setNewHealer({ ...newHealer, branchId: e.target.value })}
                >
                  <option value="">Select a branch</option>
                  {availableBranches.map((b) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>
              <div className="sa-settings__form-group">
                <label className="sa-settings__label">Experience (Years)</label>
                <input 
                  type="number"
                  className="sa-settings__input" 
                  value={newHealer.experience}
                  onChange={(e) => setNewHealer({ ...newHealer, experience: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>
          </div>
          <div className="sa-modal__footer">
            <button className="sa-btn sa-btn--outline" onClick={() => setShowAddModal(false)}>Cancel</button>
            <button className="sa-btn sa-btn--primary" onClick={handleAddHealer}>Add Healer</button>
          </div>
        </div>
      </IonModal>

      {/* Edit Healer Modal */}
      <IonModal isOpen={showEditModal} onDidDismiss={() => setShowEditModal(false)} className="sa-modal">
        <div className="sa-modal__content">
          <div className="sa-modal__header">
            <h2>Edit Healer Details</h2>
            <button className="sa-modal__close-btn" onClick={() => setShowEditModal(false)}>×</button>
          </div>
          {selectedHealer && (
            <div className="sa-modal__body">
              <div className="sa-settings__form-group">
                <label className="sa-settings__label">Full Name</label>
                <input 
                  className="sa-settings__input" 
                  value={selectedHealer.name}
                  onChange={(e) => setSelectedHealer({ ...selectedHealer, name: e.target.value })}
                />
              </div>
              <div className="sa-settings__form-row">
                <div className="sa-settings__form-group">
                  <label className="sa-settings__label">Specialty</label>
                  <select 
                    className="sa-settings__input"
                    value={selectedHealer.specialty}
                    onChange={(e) => setSelectedHealer({ ...selectedHealer, specialty: e.target.value })}
                  >
                    {availableSpecialties.map((spec: any) => (
                      <option key={spec.id} value={spec.name}>{spec.name}</option>
                    ))}
                  </select>
                </div>
                <div className="sa-settings__form-group">
                  <label className="sa-settings__label">Status</label>
                  <select 
                    className="sa-settings__input"
                    value={selectedHealer.status}
                    onChange={(e) => setSelectedHealer({ ...selectedHealer, status: e.target.value })}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="sa-settings__form-group">
                <label className="sa-settings__label">Assigned Branch</label>
                <select 
                  className="sa-settings__input"
                  value={selectedHealer.branchId || ''}
                  onChange={(e) => setSelectedHealer({ ...selectedHealer, branchId: e.target.value })}
                >
                  <option value="">Select a branch</option>
                  {availableBranches.map((b) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
          <div className="sa-modal__footer">
            <button className="sa-btn sa-btn--outline" onClick={() => setShowEditModal(false)}>Cancel</button>
            <button className="sa-btn sa-btn--primary" onClick={handleUpdateHealer}>Save Changes</button>
          </div>
        </div>
      </IonModal>

      {/* Delete Confirmation Modal */}
      <IonModal isOpen={showDeleteModal} onDidDismiss={() => setShowDeleteModal(false)} className="sa-modal sa-modal--sm">
        <div className="sa-modal__content">
          <div className="sa-modal__header">
            <h2>Remove Healer</h2>
            <button className="sa-modal__close-btn" onClick={() => setShowDeleteModal(false)}>×</button>
          </div>
          <div className="sa-modal__body">
            <p className="sa-modal__desc">
              Are you sure you want to remove <strong>{healerToDelete?.name}</strong>? This will de-assign them from <strong>{healerToDelete?.branch}</strong>.
            </p>
          </div>
          <div className="sa-modal__footer">
            <button className="sa-btn sa-btn--outline" onClick={() => setShowDeleteModal(false)}>Cancel</button>
            <button className="sa-btn sa-btn--danger" onClick={handleConfirmDelete}>Confirm Removal</button>
          </div>
        </div>
      </IonModal>
    </IonPage>
  );
};

export default HealersPage;
