import React, { useState } from 'react';
import {
  IonPage,
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonIcon,
  IonMenuButton,
  IonModal,
  useIonViewWillEnter,
} from '@ionic/react';
import {
  notificationsOutline,
  searchOutline,
  personAddOutline,
  shieldCheckmarkOutline,
  personOutline,
  ellipsisVerticalOutline,
  refreshOutline,
  trashOutline,
  createOutline,
  eyeOutline,
  eyeOffOutline,
} from 'ionicons/icons';
import { getUsers, createUser, updateUser, deleteUser } from '../../api/user.api';
import { getBranches } from '../../api/branch.api';
import './super-admin.css';

const UsersPage: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState('All Roles');
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  
  const [users, setUsers] = useState<any[]>([]);
  const [availableBranches, setAvailableBranches] = useState<any[]>([]);
  const [unmaskedPasswords, setUnmaskedPasswords] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  const filters = ['All Roles', 'Super Admin', 'Branch Admin', 'Healer', 'Patient'];

  const mapRoleToUI = (role: string) => {
    if (role === 'SUPER_ADMIN') return 'Super Admin';
    if (role === 'BRANCH_ADMIN') return 'Branch Admin';
    if (role === 'HEALER') return 'Healer';
    if (role === 'PATIENT') return 'Patient';
    return role;
  };

  const mapRoleToAPI = (role: string) => {
    if (role === 'Super Admin') return 'SUPER_ADMIN';
    if (role === 'Branch Admin') return 'BRANCH_ADMIN';
    if (role === 'Healer') return 'HEALER';
    if (role === 'Patient') return 'PATIENT';
    return role;
  };

  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Branch Admin',
    branchId: '',
    status: 'active'
  });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await getUsers();
      setUsers(response.data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
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

  useIonViewWillEnter(() => {
    fetchUsers();
    fetchBranches();
  });

  const togglePasswordVisibility = (userId: string) => {
    setUnmaskedPasswords(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
  };

  const openCreateModal = () => {
    setSelectedUser(null);
    setNewUser({ name: '', email: '', password: '', role: 'Branch Admin', branchId: '', status: 'active' });
    setShowUserModal(true);
  };

  const openEditModal = (user: any) => {
    setSelectedUser({
      ...user,
      role: mapRoleToUI(user.role),
      password: user.password || '',
    });
    setShowUserModal(true);
  };

  const handleSaveUser = async () => {
    const roleApi = mapRoleToAPI(selectedUser ? selectedUser.role : newUser.role);
    const branchIdVal = selectedUser 
      ? (selectedUser.branchId || null)
      : (newUser.branchId || null);

    if (selectedUser) {
      // Edit
      if (!selectedUser.name || !selectedUser.email) return;
      try {
        const payload: any = {
          name: selectedUser.name,
          email: selectedUser.email,
          role: roleApi,
          branchId: branchIdVal,
          status: selectedUser.status,
        };
        if (selectedUser.password) {
          payload.password = selectedUser.password;
        }
        await updateUser(selectedUser.id, payload);
        fetchUsers();
        setShowUserModal(false);
      } catch (error: any) {
        console.error('Error updating user:', error);
        alert(error?.response?.data?.message || 'Failed to update user');
      }
    } else {
      // Create
      if (!newUser.name || !newUser.email || !newUser.password) {
        alert('Please fill name, email and password fields');
        return;
      }
      try {
        await createUser({
          name: newUser.name,
          email: newUser.email,
          password: newUser.password,
          role: roleApi,
          branchId: branchIdVal,
          status: newUser.status,
        });
        fetchUsers();
        setShowUserModal(false);
      } catch (error: any) {
        console.error('Error creating user:', error);
        alert(error?.response?.data?.message || 'Failed to create user');
      }
    }
  };

  const roleIconMap: Record<string, string> = {
    'SUPER_ADMIN': shieldCheckmarkOutline,
    'Super Admin': shieldCheckmarkOutline,
    'BRANCH_ADMIN': personOutline,
    'Branch Admin': personOutline,
    'HEALER': personOutline,
    'Healer': personOutline,
    'PATIENT': personOutline,
    'Patient': personOutline,
  };

  const filteredUsers = users
    .filter(u => activeFilter === 'All Roles' || mapRoleToUI(u.role) === activeFilter)
    .filter(u => 
      (u.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
      (u.email || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

  const handleDeleteUser = async (userId: string) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this user?');
    if (confirmDelete) {
      try {
        await deleteUser(userId);
        fetchUsers();
      } catch (error: any) {
        console.error('Error deleting user:', error);
        alert(error?.response?.data?.message || 'Failed to delete user');
      }
    }
  };

  const handleToggleStatus = async (user: any) => {
    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    try {
      await updateUser(user.id, { status: newStatus });
      fetchUsers();
    } catch (error: any) {
      console.error('Error toggling status:', error);
      alert(error?.response?.data?.message || 'Failed to update status');
    }
  };

  const getInitials = (name: string) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  return (
    <IonPage className="sa-page">
      <IonHeader className="ion-no-border">
        <IonToolbar className="sa-page__toolbar">
          <IonButtons slot="start">
            <IonMenuButton />
          </IonButtons>
          <IonTitle className="sa-page__toolbar-title">User Access</IonTitle>
          <IonButtons slot="end">
            <div className="sa-page__toolbar-actions">
              <IonButton fill="clear">
                <IonIcon icon={notificationsOutline} />
              </IonButton>
              <div className="sa-page__toolbar-avatar">AS</div>
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
                <h1 className="sa-page__title">User Access Control</h1>
                <p className="sa-page__subtitle">Manage administrative roles and system access boundaries</p>
              </div>
              <button className="sa-btn sa-btn--primary" onClick={openCreateModal}>
                <IonIcon icon={personAddOutline} /> Create User
              </button>
            </div>
          </div>

          {/* Search & Filters */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
            <div className="sa-search">
              <IonIcon icon={searchOutline} />
              <input 
                placeholder="Search by name..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="sa-filters" style={{ marginBottom: 0 }}>
              {filters.map(f => (
                <button
                  key={f}
                  className={`sa-filter-tab ${activeFilter === f ? 'sa-filter-tab--active' : ''}`}
                  onClick={() => setActiveFilter(f)}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Users Table */}
          <div className="sa-section" style={{ padding: 0, overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            {loading ? (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--ion-color-medium)' }}>
                Loading users...
              </div>
            ) : (
              <table className="sa-table">
                <thead>
                  <tr>
                    <th>User Details</th>
                    <th>Role & Branch</th>
                    <th>Password</th>
                    <th>Status</th>
                    <th>Joined Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user, i) => (
                    <tr key={user.id || i}>
                      <td>
                        <div className="sa-table__user">
                          <div className={`sa-table__avatar sa-table__avatar--primary`}>
                            {getInitials(user.name)}
                          </div>
                          <div className="sa-table__user-info">
                            <span className="sa-table__user-name">{user.name}</span>
                            <span className="sa-table__user-email">{user.email}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="sa-table__role">
                          <IonIcon icon={roleIconMap[user.role] || personOutline} className="sa-table__role-icon" />
                          <div className="sa-table__role-info">
                            <span className="sa-table__role-name">{mapRoleToUI(user.role)}</span>
                            <span className="sa-table__role-branch">{user.branch?.name || 'Global Access'}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontFamily: 'monospace' }}>
                            {unmaskedPasswords[user.id] ? (user.password || 'N/A') : '••••••••'}
                          </span>
                          {user.password && (
                            <button 
                              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', color: 'var(--ion-color-medium)' }} 
                              onClick={() => togglePasswordVisibility(user.id)}
                              title={unmaskedPasswords[user.id] ? "Hide password" : "Show password"}
                            >
                              <IonIcon icon={unmaskedPasswords[user.id] ? eyeOffOutline : eyeOutline} style={{ fontSize: '16px' }} />
                            </button>
                          )}
                        </div>
                      </td>
                      <td>
                        <span 
                          className={`sa-badge sa-badge--${user.status}`}
                          style={{ cursor: 'pointer' }}
                          title="Click to toggle status"
                          onClick={() => handleToggleStatus(user)}
                        >
                          {user.status}
                        </span>
                      </td>
                      <td>{user.createdAt ? user.createdAt.split('T')[0] : 'N/A'}</td>
                      <td>
                        <div className="sa-table__actions">
                          <button className="sa-table__action-btn" title="Edit User" onClick={() => openEditModal(user)}>
                            <IonIcon icon={createOutline} />
                          </button>
                          <button className="sa-table__action-btn" title="Delete User" onClick={() => handleDeleteUser(user.id)} style={{ color: 'var(--color-danger)' }}>
                            <IonIcon icon={trashOutline} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredUsers.length === 0 && (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '24px', color: 'var(--ion-color-medium)' }}>
                        No users found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </IonContent>

      <IonModal isOpen={showUserModal} onDidDismiss={() => setShowUserModal(false)} className="sa-modal">
        <div className="sa-modal__content">
          <div className="sa-modal__header">
            <h2>{selectedUser ? 'Edit User Details' : 'Create New User'}</h2>
            <button className="sa-modal__close-btn" onClick={() => setShowUserModal(false)}>×</button>
          </div>
          <div className="sa-modal__body">
            <div className="sa-settings__form-group">
              <label className="sa-settings__label">Full Name</label>
              <input 
                className="sa-settings__input" 
                placeholder="e.g. Elena Thorne"
                value={selectedUser ? selectedUser.name : newUser.name}
                onChange={(e) => selectedUser 
                  ? setSelectedUser({...selectedUser, name: e.target.value})
                  : setNewUser({...newUser, name: e.target.value})
                }
              />
            </div>
            <div className="sa-settings__form-group">
              <label className="sa-settings__label">Email Address</label>
              <input 
                className="sa-settings__input" 
                type="email"
                placeholder="e.g. elena@sanctuary.com"
                value={selectedUser ? selectedUser.email : newUser.email}
                onChange={(e) => selectedUser 
                  ? setSelectedUser({...selectedUser, email: e.target.value})
                  : setNewUser({...newUser, email: e.target.value})
                }
              />
            </div>

            <div className="sa-settings__form-group">
              <label className="sa-settings__label">Password</label>
              <input 
                className="sa-settings__input" 
                type="text"
                placeholder={selectedUser ? "Leave blank to keep unchanged" : "e.g. securePass123"}
                value={selectedUser ? selectedUser.password : newUser.password}
                onChange={(e) => selectedUser 
                  ? setSelectedUser({...selectedUser, password: e.target.value})
                  : setNewUser({...newUser, password: e.target.value})
                }
              />
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="sa-settings__form-group">
                <label className="sa-settings__label">Role</label>
                <select 
                  className="sa-settings__input"
                  value={selectedUser ? selectedUser.role : newUser.role}
                  onChange={(e) => selectedUser 
                    ? setSelectedUser({...selectedUser, role: e.target.value})
                    : setNewUser({...newUser, role: e.target.value})
                  }
                >
                  <option>Super Admin</option>
                  <option>Branch Admin</option>
                  <option>Healer</option>
                  <option>Patient</option>
                </select>
              </div>
              <div className="sa-settings__form-group">
                <label className="sa-settings__label">Status</label>
                <select 
                  className="sa-settings__input"
                  value={selectedUser ? selectedUser.status : newUser.status}
                  onChange={(e) => selectedUser 
                    ? setSelectedUser({...selectedUser, status: e.target.value})
                    : setNewUser({...newUser, status: e.target.value})
                  }
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div className="sa-settings__form-group">
              <label className="sa-settings__label">Branch Assignment</label>
              <select 
                className="sa-settings__input"
                value={selectedUser ? (selectedUser.branchId || '') : (newUser.branchId || '')}
                onChange={(e) => selectedUser 
                  ? setSelectedUser({...selectedUser, branchId: e.target.value})
                  : setNewUser({...newUser, branchId: e.target.value})
                }
              >
                <option value="">Global Access</option>
                {availableBranches.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
            
          </div>
          <div className="sa-modal__footer">
            <button className="sa-btn sa-btn--outline" onClick={() => setShowUserModal(false)}>Cancel</button>
            <button className="sa-btn sa-btn--primary" onClick={handleSaveUser}>
              {selectedUser ? 'Save Changes' : 'Create User'}
            </button>
          </div>
        </div>
      </IonModal>

    </IonPage>
  );
};

export default UsersPage;
