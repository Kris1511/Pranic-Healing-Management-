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
  medkitOutline,
  ribbonOutline,
  peopleOutline,
} from 'ionicons/icons';
import './super-admin.css';

const HealersPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedHealer, setSelectedHealer] = useState<any>(null);
  const [healerToDelete, setHealerToDelete] = useState<any>(null);
  
  const [healers, setHealers] = useState([
    { id: 1, name: 'Dr. Aris Varma', email: 'aris.v@phms.com', specialty: 'Pranic Psychotherapy', branch: 'Uptown Sanctuary', experience: 8, load: 12, status: 'active' },
    { id: 2, name: 'Maya Rose', email: 'maya.r@phms.com', specialty: 'Advanced Pranic Healing', branch: 'Coastal Healing Center', experience: 5, load: 8, status: 'active' },
    { id: 3, name: 'Samuel Chen', email: 'sam.c@phms.com', specialty: 'Basic Pranic Healing', branch: 'Green Valley Branch', experience: 3, load: 15, status: 'active' },
    { id: 4, name: 'Lila Thorne', email: 'lila.t@phms.com', specialty: 'Crystal Healing', branch: 'Downtown Sanctuary', experience: 12, load: 5, status: 'inactive' },
    { id: 5, name: 'Julian Mars', email: 'julian.m@phms.com', specialty: 'Pranic Psychotherapy', branch: 'Uptown Sanctuary', experience: 6, load: 10, status: 'active' },
    { id: 6, name: 'Sofia Bell', email: 'sofia.b@phms.com', specialty: 'Advanced Pranic Healing', branch: 'Coastal Healing Center', experience: 4, load: 14, status: 'active' },
  ]);

  const [newHealer, setNewHealer] = useState({
    name: '',
    email: '',
    specialty: 'Advanced Pranic Healing',
    branch: 'Uptown Sanctuary',
    experience: 0,
  });

  const handleAddHealer = () => {
    if (!newHealer.name || !newHealer.email) return;
    
    const healerObj = {
      id: healers.length + 1,
      ...newHealer,
      load: 0,
      status: 'active'
    };

    setHealers([...healers, healerObj]);
    setNewHealer({ name: '', email: '', specialty: 'Advanced Pranic Healing', branch: 'Uptown Sanctuary', experience: 0 });
    setShowAddModal(false);
  };

  const handleEditClick = (healer: any) => {
    setSelectedHealer({ ...healer });
    setShowEditModal(true);
  };

  const handleUpdateHealer = () => {
    if (!selectedHealer) return;
    setHealers(healers.map(h => h.id === selectedHealer.id ? selectedHealer : h));
    setShowEditModal(false);
  };

  const handleDeleteClick = (healer: any) => {
    setHealerToDelete(healer);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    if (healerToDelete) {
      setHealers(healers.filter(h => h.id !== healerToDelete.id));
      setShowDeleteModal(false);
      setHealerToDelete(null);
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
            <button className="sa-page__toolbar-avatar">SA</button>
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
              <button className="sa-btn sa-btn--primary" onClick={() => setShowAddModal(true)}>
                <IonIcon icon={personAddOutline} /> Add New Healer
              </button>
            </div>
          </div>

          <div className="sa-stats sa-stats--3">
            <div className="sa-stat-card">
              <div className="sa-stat-card__icon sa-stat-card__icon--primary">
                <IonIcon icon={peopleOutline} />
              </div>
              <div>
                <div className="sa-stat-card__label">Total Healers</div>
                <div className="sa-stat-card__value">{healers.length}</div>
              </div>
            </div>
            <div className="sa-stat-card">
              <div className="sa-stat-card__icon sa-stat-card__icon--success">
                <IonIcon icon={ribbonOutline} />
              </div>
              <div>
                <div className="sa-stat-card__label">Active Now</div>
                <div className="sa-stat-card__value">{healers.filter(h => h.status === 'active').length}</div>
              </div>
            </div>
            <div className="sa-stat-card">
              <div className="sa-stat-card__icon sa-stat-card__icon--warning">
                <IonIcon icon={medkitOutline} />
              </div>
              <div>
                <div className="sa-stat-card__label">Avg. Patient Load</div>
                <div className="sa-stat-card__value">
                  {Math.round(healers.reduce((acc, h) => acc + h.load, 0) / healers.length)}
                </div>
              </div>
            </div>
          </div>

          <div className="sa-section-header">
            <div className="sa-search">
              <IonIcon icon={searchOutline} />
              <input 
                placeholder="Search by name, specialty or branch..." 
                value={searchQuery}
                onChange={handleSearchChange}
              />
            </div>
          </div>

          <div className="sa-section" style={{ padding: 0, overflow: 'hidden' }}>
            <table className="sa-table">
              <thead>
                <tr>
                  <th>Healer</th>
                  <th>Specialty</th>
                  <th>Branch</th>
                  <th>Exp. (Yrs)</th>
                  <th>Current Load</th>
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
                          {healer.name.split(' ').map(n => n[0]).join('')}
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
                      <div className="sa-table__load">
                        <span className="sa-table__load-count">{healer.load} Patients</span>
                        <div className="sa-table__load-bar">
                          <div 
                            className="sa-table__load-fill" 
                            style={{ 
                              width: `${Math.min((healer.load / 20) * 100, 100)}%`,
                              backgroundColor: healer.load > 15 ? 'var(--color-danger)' : 'var(--color-primary)'
                            }} 
                          />
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`sa-badge sa-badge--${healer.status}`}>
                        {healer.status}
                      </span>
                    </td>
                    <td>
                      <div className="sa-table__actions">
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
                <option>Basic Pranic Healing</option>
                <option>Advanced Pranic Healing</option>
                <option>Pranic Psychotherapy</option>
                <option>Crystal Healing</option>
              </select>
            </div>
            <div className="sa-settings__form-row">
              <div className="sa-settings__form-group">
                <label className="sa-settings__label">Assigned Branch</label>
                <select 
                  className="sa-settings__input"
                  value={newHealer.branch}
                  onChange={(e) => setNewHealer({ ...newHealer, branch: e.target.value })}
                >
                  <option>Uptown Sanctuary</option>
                  <option>Coastal Healing Center</option>
                  <option>Green Valley Branch</option>
                  <option>Downtown Sanctuary</option>
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
                    <option>Basic Pranic Healing</option>
                    <option>Advanced Pranic Healing</option>
                    <option>Pranic Psychotherapy</option>
                    <option>Crystal Healing</option>
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
