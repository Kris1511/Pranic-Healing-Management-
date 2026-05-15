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
  notificationsOutline,
  searchOutline,
  personAddOutline,
  createOutline,
  trashOutline,
  eyeOutline,
  chevronBackOutline,
  chevronForwardOutline,
} from 'ionicons/icons';
import './super-admin.css';

const BranchAdminsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<any>(null);
  const [adminToDelete, setAdminToDelete] = useState<any>(null);
  
  const [admins, setAdmins] = useState([
    { id: 1, name: 'John Admin', email: 'john.a@phms.com', phone: '0876543210', branch: 'Uptown Sanctuary', status: 'active', joined: '2023-01-16' },
    { id: 2, name: 'Sarah Admin', email: 'sarah.m@phms.com', phone: '0876543211', branch: 'Coastal Healing Center', status: 'active', joined: '2023-02-20' },
    { id: 3, name: 'Mike Admin', email: 'mike.t@phms.com', phone: '0876543212', branch: 'Green Valley Branch', status: 'inactive', joined: '2022-02-10' },
    { id: 4, name: 'Elena Thorne', email: 'elena.t@phms.com', phone: '0876543212', branch: 'Downtown Sanctuary', status: 'active', joined: '2023-04-05' },
  ]);

  const [newAdmin, setNewAdmin] = useState({
    name: '',
    email: '',
    branch: 'Uptown Sanctuary',
  });

  const handleAssignAdmin = () => {
    if (!newAdmin.name || !newAdmin.email) return;
    
    const adminObj = {
      id: admins.length + 1,
      name: newAdmin.name,
      email: newAdmin.email,
      phone: 'Not Set',
      branch: newAdmin.branch,
      status: 'active',
      joined: new Date().toISOString().split('T')[0]
    };

    setAdmins([...admins, adminObj]);
    setNewAdmin({ name: '', email: '', branch: 'Uptown Sanctuary' });
    setShowAssignModal(false);
  };

  const handleDeleteClick = (admin: any) => {
    setAdminToDelete(admin);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    if (adminToDelete) {
      setAdmins(admins.filter(a => a.id !== adminToDelete.id));
      setShowDeleteModal(false);
      setAdminToDelete(null);
    }
  };

  const handleEditClick = (admin: any) => {
    setSelectedAdmin({ ...admin });
    setShowEditModal(true);
  };

  const handleUpdateAdmin = () => {
    if (!selectedAdmin) return;
    setAdmins(admins.map(a => a.id === selectedAdmin.id ? selectedAdmin : a));
    setShowEditModal(false);
  };

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  const filteredAdmins = admins.filter(admin => 
    admin.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    admin.branch.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredAdmins.length / ITEMS_PER_PAGE);
  const paginatedAdmins = filteredAdmins.slice(
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
          <IonTitle className="sa-page__toolbar-title">Branch Administrators</IonTitle>
          <IonButtons slot="end">
            <div className="sa-page__toolbar-actions">
              <button className="sa-page__toolbar-avatar" style={{ border: 'none' }}>SA</button>
            </div>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent className="sa-page__content">
        <div className="sa-page__body">
          {/* Page Header */}
          <div className="sa-page__header">
            <div className="sa-page__header-row">
              <div>
                <h1 className="sa-page__title">Staff Management</h1>
                <p className="sa-page__subtitle">Overview of administrators assigned to sanctuary branches</p>
              </div>
              {/* <button className="sa-btn sa-btn--primary" onClick={() => setShowAssignModal(true)}>
                <IonIcon icon={personAddOutline} /> Assign New Admin
              </button> */}
            </div>
          </div>

          {/* Stats Summary */}
          <div className="sa-stats sa-stats--3">
            <div className="sa-stat-card">
              <div>
                <div className="sa-stat-card__label">Total Admins</div>
                <div className="sa-stat-card__value">{admins.length}</div>
              </div>
            </div>
            <div className="sa-stat-card">
              <div>
                <div className="sa-stat-card__label">Active</div>
                <div className="sa-stat-card__value">{admins.filter(a => a.status === 'active').length}</div>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div style={{ marginBottom: '24px', display: 'flex', gap: '16px' }}>
            <div className="sa-search">
              <IonIcon icon={searchOutline} />
              <input 
                placeholder="Search admins or branches..." 
                value={searchQuery}
                onChange={handleSearchChange}
              />
            </div>
          </div>

          {/* Admins Table */}
          <div className="sa-section" style={{ padding: 0, overflow: 'hidden' }}>
            <table className="sa-table">
              <thead>
                <tr>
                  <th>Administrator</th>
                  <th>Assigned Branch</th>
                  <th>Contact Info</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedAdmins.map((admin) => (
                  <tr key={admin.id}>
                    <td>
                      <div className="sa-table__user">
                        <div className="sa-table__avatar sa-table__avatar--primary">
                          {admin.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="sa-table__user-info">
                          <span className="sa-table__user-name">{admin.name}</span>
                          <span className="sa-table__user-email">{admin.email}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 500 }}>
                        {admin.branch}
                      </div>
                    </td>
                    <td>{admin.phone}</td>
                    <td>
                      <span className={`sa-badge sa-badge--${admin.status === 'active' ? 'active' : 'inactive'}`}>
                        {admin.status}
                      </span>
                    </td>
                    <td>{admin.joined}</td>
                    <td>
                      <div className="sa-table__actions">
                        <button className="sa-table__action-btn" title="Edit Permissions" onClick={() => handleEditClick(admin)}>
                          <IonIcon icon={createOutline} />
                        </button>
                        <button className="sa-table__action-btn" title="Remove Assignment" style={{ color: 'var(--color-danger)' }} onClick={() => handleDeleteClick(admin)}>
                          <IonIcon icon={trashOutline} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination Footer */}
            <div className="sa-table__footer">
              <div className="sa-pagination__info">
                Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredAdmins.length)} of {filteredAdmins.length} admins
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

      {/* 1. Assign Admin Modal */}
      <IonModal isOpen={showAssignModal} onDidDismiss={() => setShowAssignModal(false)} className="sa-modal">
        <div className="sa-modal__content">
          <div className="sa-modal__header">
            <h2>Assign Branch Admin</h2>
            <button className="sa-modal__close-btn" onClick={() => setShowAssignModal(false)}>×</button>
          </div>
          <div className="sa-modal__body">
            <div className="sa-settings__form-group">
              <label className="sa-settings__label">Select Branch</label>
              <select 
                className="sa-settings__input"
                value={newAdmin.branch}
                onChange={(e) => setNewAdmin({ ...newAdmin, branch: e.target.value })}
              >
                <option>Uptown Sanctuary</option>
                <option>Coastal Healing Center</option>
                <option>Green Valley Branch</option>
                <option>Downtown Sanctuary</option>
              </select>
            </div>
            <div className="sa-settings__form-group">
              <label className="sa-settings__label">Admin Member Name</label>
              <input 
                className="sa-settings__input" 
                placeholder="Enter name of the practitioner/staff"
                value={newAdmin.name}
                onChange={(e) => setNewAdmin({ ...newAdmin, name: e.target.value })}
              />
            </div>
            <div className="sa-settings__form-group">
              <label className="sa-settings__label">Email Address</label>
              <input 
                className="sa-settings__input" 
                placeholder="email@example.com" 
                value={newAdmin.email}
                onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
              />
            </div>
          </div>
          <div className="sa-modal__footer">
            <button className="sa-btn sa-btn--outline" onClick={() => setShowAssignModal(false)}>Cancel</button>
            <button className="sa-btn sa-btn--primary" onClick={handleAssignAdmin}>Assign To Branch</button>
          </div>
        </div>
      </IonModal>

      {/* 2. Edit Admin Modal */}
      <IonModal isOpen={showEditModal} onDidDismiss={() => setShowEditModal(false)} className="sa-modal">
        <div className="sa-modal__content">
          <div className="sa-modal__header">
            <h2>Edit Administrator</h2>
            <button className="sa-modal__close-btn" onClick={() => setShowEditModal(false)}>×</button>
          </div>
          {selectedAdmin && (
            <div className="sa-modal__body">
              <div className="sa-settings__form-group">
                <label className="sa-settings__label">Full Name</label>
                <input 
                  className="sa-settings__input" 
                  value={selectedAdmin.name}
                  onChange={(e) => setSelectedAdmin({ ...selectedAdmin, name: e.target.value })}
                />
              </div>
              <div className="sa-settings__form-group">
                <label className="sa-settings__label">Email Address</label>
                <input 
                  className="sa-settings__input" 
                  value={selectedAdmin.email}
                  onChange={(e) => setSelectedAdmin({ ...selectedAdmin, email: e.target.value })}
                />
              </div>
              <div className="sa-settings__form-group">
                <label className="sa-settings__label">Contact Phone</label>
                <input 
                  className="sa-settings__input" 
                  value={selectedAdmin.phone}
                  onChange={(e) => setSelectedAdmin({ ...selectedAdmin, phone: e.target.value })}
                />
              </div>
              <div className="sa-settings__form-group">
                <label className="sa-settings__label">Branch Assignment</label>
                <select 
                  className="sa-settings__input"
                  value={selectedAdmin.branch}
                  onChange={(e) => setSelectedAdmin({ ...selectedAdmin, branch: e.target.value })}
                >
                  <option>Uptown Sanctuary</option>
                  <option>Coastal Healing Center</option>
                  <option>Green Valley Branch</option>
                  <option>Downtown Sanctuary</option>
                </select>
              </div>
              <div className="sa-settings__form-group">
                <label className="sa-settings__label">Status</label>
                <select 
                  className="sa-settings__input"
                  value={selectedAdmin.status}
                  onChange={(e) => setSelectedAdmin({ ...selectedAdmin, status: e.target.value })}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          )}
          <div className="sa-modal__footer">
            <button className="sa-btn sa-btn--outline" onClick={() => setShowEditModal(false)}>Cancel</button>
            <button className="sa-btn sa-btn--primary" onClick={handleUpdateAdmin}>Save Changes</button>
          </div>
        </div>
      </IonModal>
      {/* 3. Delete Confirmation Modal */}
      <IonModal isOpen={showDeleteModal} onDidDismiss={() => setShowDeleteModal(false)} className="sa-modal sa-modal--sm">
        <div className="sa-modal__content">
          <div className="sa-modal__header">
            <h2>Confirm Removal</h2>
            <button className="sa-modal__close-btn" onClick={() => setShowDeleteModal(false)}>×</button>
          </div>
          <div className="sa-modal__body">
            <p className="sa-modal__desc">
              Are you sure you want to remove <strong>{adminToDelete?.name}</strong> from their assignment at <strong>{adminToDelete?.branch}</strong>? This action cannot be undone.
            </p>
          </div>
          <div className="sa-modal__footer" style={{ justifyContent: 'center', gap: '12px' }}>
            <button className="sa-btn sa-btn--outline" style={{ flex: 1 }} onClick={() => setShowDeleteModal(false)}>Cancel</button>
            <button className="sa-btn" style={{ flex: 1, backgroundColor: 'var(--color-danger)', color: 'white' }} onClick={handleConfirmDelete}>Confirm Delete</button>
          </div>
        </div>
      </IonModal>
    </IonPage>
  );
};

export default BranchAdminsPage;
