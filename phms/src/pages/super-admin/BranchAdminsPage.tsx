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
  useIonViewWillEnter,
  IonAlert,
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
  closeOutline,
} from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { ROUTES } from '../../constants/routes.constant';
import { getBranches } from '../../api/branch.api';
import { deleteBranchAdmin, getBranchAdmins, updateBranchAdmin } from '../../api/branchAdmin.api';
import './super-admin.css';
import ProfileDropdown from '../../components/common/ProfileDropdown';


const BranchAdminsPage: React.FC = () => {
  const history = useHistory();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<any>(null);
  const [adminToDelete, setAdminToDelete] = useState<any>(null);
  
  const [admins, setAdmins] = useState<any[]>([]);
  const [availableBranches, setAvailableBranches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useIonViewWillEnter(() => {
    fetchAdmins();
    fetchBranches();
  });

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const response = await getBranchAdmins();
      setAdmins(response.data || []);
    } catch (error) {
      console.error('Error fetching admins:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBranches = async () => {
    try {
      const response = await getBranches();
      setAvailableBranches(response.data || []);
    } catch (error) {
      console.error('Error fetching branches:', error);
    }
  };

  const [newAdmin, setNewAdmin] = useState({
    name: '',
    email: '',
    branch: '',
  });

  const handleAssignAdmin = () => {
    // Legacy assign logic
    history.push(ROUTES.SUPER_ADMIN.CREATE_BRANCH_ADMIN);
  };

  const handleDeleteClick = (admin: any) => {
    setAdminToDelete(admin);
    setShowDeleteAlert(true);
  };

  const handleConfirmDelete = async () => {
    if (adminToDelete) {
      try {
        await deleteBranchAdmin(adminToDelete.id);
        setAdmins(admins.filter(a => a.id !== adminToDelete.id));
        setShowDeleteAlert(false);
        setAdminToDelete(null);
      } catch (error) {
        console.error('Error deleting admin:', error);
        alert('Failed to delete admin');
      }
    }
  };

  const handleToggleStatus = async (admin: any) => {
    const newStatus = admin.status === 'active' ? 'inactive' : 'active';
    try {
      const data = new FormData();
      data.append('status', newStatus);
      await updateBranchAdmin(admin.id, data);
      setAdmins(prevAdmins =>
        prevAdmins.map(a => (a.id === admin.id ? { ...a, status: newStatus } : a))
      );
    } catch (error) {
      console.error('Error toggling status:', error);
      alert('Failed to update status');
    }
  };

  const handleUpdateAdmin = async () => {
    if (!selectedAdmin) return;
    try {
      const data = new FormData();
      data.append('name', selectedAdmin.name);
      data.append('email', selectedAdmin.email);
      data.append('phone', selectedAdmin.phone || selectedAdmin.phoneNumber);
      data.append('status', selectedAdmin.status);
      data.append('branchId', selectedAdmin.branchId || '');

      await updateBranchAdmin(selectedAdmin.id, data);
      
      // Re-fetch admins to ensure relations and formatting are perfectly refreshed
      fetchAdmins();
      setShowEditModal(false);
    } catch (error) {
      console.error('Error updating admin:', error);
      alert('Failed to update admin');
    }
  };

  const [currentPage, setCurrentPage] = useState(1);
  const [activeFilter, setActiveFilter] = useState('All');
  const ITEMS_PER_PAGE = 5;
  const filters = ['All', 'Active', 'Inactive'];

  const filteredAdmins = admins
    .filter(admin => activeFilter === 'All' || admin.status === activeFilter.toLowerCase())
    .filter(admin => 
      (admin.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
      (admin.branch?.name || admin.branch || '').toLowerCase().includes(searchQuery.toLowerCase())
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
              <ProfileDropdown />
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
              <button className="sa-btn sa-btn--primary" onClick={() => history.push(ROUTES.SUPER_ADMIN.CREATE_BRANCH_ADMIN)}>
                <IonIcon icon={personAddOutline} style={{ marginRight: '6px' }} /> Create Branch Admin
              </button>
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
            <div className="sa-stat-card">
              <div>
                <div className="sa-stat-card__label">Inactive</div>
                <div className="sa-stat-card__value">{admins.filter(a => a.status === 'inactive').length}</div>
              </div>
            </div>
          </div>

          {/* Search & Filters */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
            <div className="sa-search">
              <IonIcon icon={searchOutline} />
              <input 
                placeholder="Search admins or branches..." 
                value={searchQuery}
                onChange={handleSearchChange}
              />
            </div>
            <div className="sa-filters" style={{ marginBottom: 0 }}>
              {filters.map((f) => (
                <button
                  key={f}
                  className={`sa-filter-tab ${activeFilter === f ? 'sa-filter-tab--active' : ''}`}
                  onClick={() => { setActiveFilter(f); setCurrentPage(1); }}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Admins Table */}
          <div className="sa-section" style={{ padding: 0, overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
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
                {paginatedAdmins.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--ion-color-medium)' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                        <IonIcon icon={searchOutline} style={{ fontSize: '32px', color: 'var(--ion-color-medium)' }} />
                        <span style={{ fontSize: '15px', fontWeight: 500 }}>No administrators found</span>
                        <span style={{ fontSize: '13px', opacity: 0.8 }}>
                          {activeFilter === 'All' 
                            ? "Try adjusting your search query or create a new branch admin."
                            : `There are currently no ${activeFilter.toLowerCase()} administrators matching your criteria.`
                          }
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedAdmins.map((admin) => (
                    <tr key={admin.id}>
                      <td>
                        <div className="sa-table__user">
                          <div className="sa-table__avatar sa-table__avatar--primary">
                            {(admin.name || '').split(' ').map((n: string) => n[0]).join('')}
                          </div>
                          <div className="sa-table__user-info">
                            <span className="sa-table__user-name">{admin.name}</span>
                            <span className="sa-table__user-email">{admin.email}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 500 }}>
                          {admin.branch?.name || admin.branch || 'Unassigned'}
                        </div>
                      </td>
                      <td>{admin.phone || admin.phoneNumber || 'Not Set'}</td>
                      <td>
                        <span 
                          className={`sa-badge sa-badge--${admin.status === 'active' ? 'active' : 'inactive'}`}
                          style={{ cursor: 'pointer' }}
                          title="Click to toggle status"
                          onClick={() => handleToggleStatus(admin)}
                        >
                          {admin.status}
                        </span>
                      </td>
                      <td>{admin.createdAt ? new Date(admin.createdAt).toLocaleDateString() : admin.joined || 'N/A'}</td>
                      <td>
                        <div className="sa-table__actions">
                          <button className="sa-table__action-btn" title="View Details" onClick={() => history.push(ROUTES.SUPER_ADMIN.BRANCH_ADMIN_DETAILS.replace(':id', admin.id))}>
                            <IonIcon icon={eyeOutline} />
                          </button>
                          <button className="sa-table__action-btn" title="Edit Profile" onClick={() => history.push(ROUTES.SUPER_ADMIN.EDIT_BRANCH_ADMIN.replace(':id', admin.id))}>
                            <IonIcon icon={createOutline} />
                          </button>
                          <button className="sa-table__action-btn" title="Remove Assignment" style={{ color: 'var(--color-danger)' }} onClick={() => handleDeleteClick(admin)}>
                            <IonIcon icon={trashOutline} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
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


      {/* 3. Delete Confirmation Modal (Custom Styled Dialog) */}
      <IonModal
        isOpen={showDeleteAlert}
        onDidDismiss={() => setShowDeleteAlert(false)}
        className="sa-modal sa-modal--sm"
        style={{ '--height': 'auto', '--width': '450px', '--border-radius': '16px' }}
      >
        <div className="sa-modal__container" style={{ padding: '32px' }}>
          <div className="sa-modal__header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', padding: 0, border: 'none' }}>
            <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#164e63', margin: 0 }}>Confirm Removal</h2>
            <button
              onClick={() => setShowDeleteAlert(false)}
              style={{ background: 'none', border: 'none', padding: '4px', cursor: 'pointer', color: '#94a3b8' }}
            >
              <IonIcon icon={closeOutline} style={{ fontSize: '24px' }} />
            </button>
          </div>

          <div className="sa-modal__body" style={{ marginBottom: '32px', padding: 0 }}>
            <p style={{ fontSize: '15px', color: '#64748b', lineHeight: '1.6', margin: 0 }}>
              Are you sure you want to remove <strong style={{ color: '#1e293b' }}>{adminToDelete?.name}</strong> from their assignment? This action cannot be undone.
            </p>
          </div>

          <div className="sa-modal__footer" style={{ display: 'flex', gap: '16px', padding: 0, border: 'none', background: 'transparent' }}>
            <button
              className="sa-btn sa-btn--outline"
              onClick={() => setShowDeleteAlert(false)}
              style={{ flex: 1, height: '48px', borderRadius: '10px', fontSize: '15px' }}
            >
              Cancel
            </button>
            <button
              className="sa-btn"
              onClick={handleConfirmDelete}
              style={{ flex: 1.2, height: '48px', borderRadius: '10px', fontSize: '15px', fontWeight: 700, backgroundColor: 'var(--color-danger)', color: 'white' }}
            >
              Confirm Delete
            </button>
          </div>
        </div>
      </IonModal>
    </IonPage>
  );
};

export default BranchAdminsPage;
