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
} from 'ionicons/icons';
import './super-admin.css';

const UsersPage: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState('All Roles');
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const filters = ['All Roles', 'Super Admin', 'Branch Admin', 'Healer', 'Patient'];

  const [users, setUsers] = useState([
    {
      name: 'Aria Seraphina',
      email: 'aria@sanctuary.com',
      role: 'Super Admin',
      branch: 'Global Access',
      status: 'active',
      joinedDate: '2023-09-01',
      avatar: null,
      initials: 'AS',
      hasImage: true,
    },
    {
      name: 'John Admin',
      email: 'john@uptown.com',
      role: 'Branch Admin',
      branch: 'Uptown Sanctuary',
      status: 'active',
      joinedDate: '2023-09-15',
      avatar: null,
      initials: 'J',
      hasImage: false,
    },
    {
      name: 'Sarah Admin',
      email: 'sarah@coastal.com',
      role: 'Branch Admin',
      branch: 'Coastal Healing Center',
      status: 'active',
      joinedDate: '2023-02-20',
      avatar: null,
      initials: 'S',
      hasImage: false,
    },
    {
      name: 'Mike Admin',
      email: 'mike@greenvalley.com',
      role: 'Branch Admin',
      branch: 'Green Valley Branch',
      status: 'inactive',
      joinedDate: '2023-03-10',
      avatar: null,
      initials: 'M',
      hasImage: false,
    },
    {
      name: 'Elena Thorne',
      email: 'elena@uptown.com',
      role: 'Healer',
      branch: 'Uptown Sanctuary',
      status: 'active',
      joinedDate: '2023-09-20',
      avatar: null,
      initials: 'E',
      hasImage: false,
    },
  ]);

  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'Branch Admin',
    branch: 'Global Access',
    status: 'active'
  });

  const openCreateModal = () => {
    setSelectedUser(null);
    setNewUser({ name: '', email: '', role: 'Branch Admin', branch: 'Global Access', status: 'active' });
    setShowUserModal(true);
  };

  const openEditModal = (user: any, index: number) => {
    setEditingIndex(index);
    setSelectedUser({ ...user });
    setShowUserModal(true);
  };

  const handleSaveUser = () => {
    if (selectedUser) {
      // Edit
      const newUsersList = [...users];
      const actualIndex = users.findIndex(u => u.name === filteredUsers[editingIndex!].name);
      if (actualIndex > -1) {
          newUsersList[actualIndex] = selectedUser;
      }
      setUsers(newUsersList);
    } else {
      // Create
      if (!newUser.name || !newUser.email) return;
      const newUserObj = {
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        branch: newUser.branch,
        status: newUser.status,
        joinedDate: new Date().toISOString().split('T')[0],
        avatar: null,
        initials: newUser.name.charAt(0).toUpperCase() || 'U',
        hasImage: false,
      };
      setUsers([newUserObj, ...users]);
    }
    setShowUserModal(false);
  };

  const roleIconMap: Record<string, string> = {
    'Super Admin': shieldCheckmarkOutline,
    'Branch Admin': personOutline,
    'Healer': personOutline,
    'Patient': personOutline,
  };

  const filteredUsers = users
    .filter(u => activeFilter === 'All Roles' || u.role === activeFilter)
    .filter(u => 
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const handleDeleteUser = (index: number) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this user?');
    if (confirmDelete) {
      const newUsers = [...users];
      // Note: mapping against filtered index vs real index - using name for safety
      const userToDelete = filteredUsers[index];
      setUsers(users.filter(u => u.name !== userToDelete.name));
    }
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
          <div className="sa-section" style={{ padding: 0, overflow: 'hidden' }}>
            <table className="sa-table">
              <thead>
                <tr>
                  <th>User Details</th>
                  <th>Role & Branch</th>
                  <th>Status</th>
                  <th>Joined Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user, i) => (
                  <tr key={i}>
                    <td>
                      <div className="sa-table__user">
                        <div className={`sa-table__avatar sa-table__avatar--primary`}>
                          {user.initials}
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
                          <span className="sa-table__role-name">{user.role}</span>
                          <span className="sa-table__role-branch">{user.branch}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`sa-badge sa-badge--${user.status}`}>
                        {user.status}
                      </span>
                    </td>
                    <td>{user.joinedDate}</td>
                    <td>
                      <div className="sa-table__actions">
                        <button className="sa-table__action-btn" title="Edit User" onClick={() => openEditModal(user, i)}>
                          <IonIcon icon={createOutline} />
                        </button>
                        <button className="sa-table__action-btn" title="Delete User" onClick={() => handleDeleteUser(i)} style={{ color: 'var(--color-danger)' }}>
                          <IonIcon icon={trashOutline} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
                value={selectedUser ? selectedUser.branch : newUser.branch}
                onChange={(e) => selectedUser 
                  ? setSelectedUser({...selectedUser, branch: e.target.value})
                  : setNewUser({...newUser, branch: e.target.value})
                }
              >
                <option>Global Access</option>
                <option>Uptown Sanctuary</option>
                <option>Coastal Healing Center</option>
                <option>Green Valley Branch</option>
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
