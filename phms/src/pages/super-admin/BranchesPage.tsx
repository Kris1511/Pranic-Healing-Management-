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
  addOutline,
  homeOutline,
  locationOutline,
  callOutline,
  calendarOutline,
  chevronForwardOutline,
  trashOutline,
} from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { ROUTES } from '../../constants/routes.constant';
import './super-admin.css';

const BranchesPage: React.FC = () => {
  const history = useHistory();
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<any>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const filters = ['All', 'Active', 'Maintenance', 'Closed'];

  const [branches, setBranches] = useState([
    {
      name: 'Uptown Sanctuary',
      region: 'Northern Region',
      status: 'active',
      admin: 'John Admin',
      phone: '0876543210',
      est: '2023-01-16',
    },
    {
      name: 'Coastal Healing Center',
      region: 'Western Region',
      status: 'active',
      admin: 'Sarah Admin',
      phone: '0876543211',
      est: '2023-02-20',
    },
    {
      name: 'Green Valley Branch',
      region: 'Southern Region',
      status: 'maintenance',
      admin: 'Mike Admin',
      phone: '0876543212',
      est: '2022-02-10',
    },
    {
      name: 'Downtown Sanctuary',
      region: 'Central Region',
      status: 'active',
      admin: 'Elena Thorne',
      phone: '0876543212',
      est: '2023-04-05',
    },
  ]);

  const handleCreateBranch = () => {
    history.push(ROUTES.SUPER_ADMIN.CREATE_BRANCH);
  };

  const openEditModal = (branch: any, index: number) => {
    setEditingIndex(index);
    setSelectedBranch({ ...branch });
    setShowEditModal(true);
  };

  const openReportModal = (branch: any) => {
    setSelectedBranch({ ...branch });
    setShowReportModal(true);
  };

  const handleSaveEdit = () => {
    if (editingIndex !== null && selectedBranch) {
      const newBranches = [...branches];
      // Find the actual index if filtered
      const actualIndex = branches.findIndex(b => b.name === newBranches[editingIndex].name);
      if (actualIndex > -1) {
          newBranches[editingIndex] = selectedBranch;
      }
      setBranches(newBranches);
    }
    setShowEditModal(false);
  };

  const handleDeleteBranch = (index: number) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this branch?');
    if (confirmDelete) {
      const branchToDelete = filteredBranches[index];
      setBranches(branches.filter(b => b.name !== branchToDelete.name));
    }
  };

  const totalBranches = branches.length;
  const activeBranches = branches.filter(b => b.status === 'active').length;
  const maintenanceBranches = branches.filter(b => b.status === 'maintenance').length;

  const filteredBranches = branches
    .filter(b => activeFilter === 'All' || b.status === activeFilter.toLowerCase())
    .filter(b => 
      b.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      b.region.toLowerCase().includes(searchQuery.toLowerCase())
    );

  return (
    <IonPage className="sa-page">
      <IonHeader className="ion-no-border">
        <IonToolbar className="sa-page__toolbar">
          <IonButtons slot="start">
            <IonMenuButton />
          </IonButtons>
          <IonTitle className="sa-page__toolbar-title">Branches</IonTitle>
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
                <h1 className="sa-page__title">Sanctuary Branches</h1>
                <p className="sa-page__subtitle">Manage healing centers and administrative assignments</p>
              </div>
              <button className="sa-btn sa-btn--primary" onClick={handleCreateBranch}>
                <IonIcon icon={addOutline} /> Create New Branch
              </button>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="sa-stats sa-stats--3">
            <div className="sa-stat-card">
              <div>
                <div className="sa-stat-card__label">Total</div>
                <div className="sa-stat-card__value">{totalBranches}</div>
              </div>
            </div>
            <div className="sa-stat-card">
              <div>
                <div className="sa-stat-card__label">Active</div>
                <div className="sa-stat-card__value">{activeBranches}</div>
              </div>
            </div>
            <div className="sa-stat-card">
              <div>
                <div className="sa-stat-card__label">Maintenance</div>
                <div className="sa-stat-card__value">{maintenanceBranches}</div>
              </div>
            </div>
          </div>

          {/* Search & Filters */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
            <div className="sa-search">
              <IonIcon icon={searchOutline} />
              <input 
                placeholder="Search by name or region..." 
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

          {/* Branch Cards */}
          <div className="sa-branches-grid">
            {filteredBranches.map((branch, i) => (
              <div className="sa-branch-card" key={i}>
                <div className="sa-branch-card__header">
                  <div className="sa-branch-card__name-row">
                    <div className="sa-branch-card__icon">
                      <IonIcon icon={homeOutline} />
                    </div>
                    <div>
                      <h3 className="sa-branch-card__name">{branch.name}</h3>
                      <p className="sa-branch-card__region">
                        <IonIcon icon={locationOutline} /> {branch.region}
                      </p>
                    </div>
                  </div>
                  <span className={`sa-badge sa-badge--${branch.status}`}>
                    {branch.status}
                  </span>
                </div>

                <div 
                  className="sa-branch-card__admin" 
                  onClick={() => history.push(ROUTES.SUPER_ADMIN.BRANCH_DETAILS.replace(':id', encodeURIComponent(branch.name)))}
                >
                  <div>
                    <div className="sa-branch-card__admin-label">Branch Admin</div>
                    <div className="sa-branch-card__admin-name">{branch.admin}</div>
                  </div>
                  <IonIcon icon={chevronForwardOutline} style={{ color: '#999' }} />
                </div>

                <div className="sa-branch-card__meta">
                  <div className="sa-branch-card__meta-item">
                    <IonIcon icon={callOutline} /> {branch.phone}
                  </div>
                  <div className="sa-branch-card__meta-item">
                    <IonIcon icon={calendarOutline} /> Est. {branch.est}
                  </div>
                </div>

                {/* <div className="sa-branch-card__actions">
                  <button className="sa-btn sa-btn--outline sa-btn--sm" style={{ flex: 1 }} onClick={() => openEditModal(branch, i)}>Edit</button>
                  <button className="sa-btn sa-btn--outline sa-btn--sm" style={{ flex: 1 }} onClick={() => openReportModal(branch)}>Reports</button>
                  <button className="sa-btn sa-btn--outline sa-btn--sm" style={{ padding: '0 10px', color: 'var(--color-danger)', borderColor: 'var(--color-danger)' }} onClick={() => handleDeleteBranch(i)}>
                    <IonIcon icon={trashOutline} />
                  </button>
                </div> */}
              </div>
            ))}
          </div>
        </div>
      </IonContent>



      {/* 2. Edit Details Modal */}
      <IonModal isOpen={showEditModal} onDidDismiss={() => setShowEditModal(false)} className="sa-modal">
        <div className="sa-modal__content">
          <div className="sa-modal__header">
            <h2>Edit Branch Details</h2>
            <button className="sa-modal__close-btn" onClick={() => setShowEditModal(false)}>×</button>
          </div>
          {selectedBranch && (
            <div className="sa-modal__body">
              <div className="sa-settings__form-group">
                <label className="sa-settings__label">Branch Name</label>
                <input 
                  className="sa-settings__input" 
                  value={selectedBranch.name}
                  onChange={(e) => setSelectedBranch({...selectedBranch, name: e.target.value})}
                />
              </div>
              <div className="sa-settings__form-group">
                <label className="sa-settings__label">Region</label>
                <select 
                  className="sa-settings__input"
                  value={selectedBranch.region}
                  onChange={(e) => setSelectedBranch({...selectedBranch, region: e.target.value})}
                >
                  <option>Northern Region</option>
                  <option>Southern Region</option>
                  <option>Eastern Region</option>
                  <option>Western Region</option>
                  <option>Central Region</option>
                </select>
              </div>
              <div className="sa-settings__form-group">
                <label className="sa-settings__label">Assigned Admin</label>
                <select 
                  className="sa-settings__input"
                  value={selectedBranch.admin}
                  onChange={(e) => setSelectedBranch({...selectedBranch, admin: e.target.value})}
                >
                  <option>John Admin</option>
                  <option>Sarah Admin</option>
                  <option>Elena Thorne</option>
                  <option>Mike Admin</option>
                  <option>Unassigned</option>
                </select>
              </div>
              <div className="sa-settings__form-group">
                <label className="sa-settings__label">Status</label>
                <select 
                  className="sa-settings__input"
                  value={selectedBranch.status}
                  onChange={(e) => setSelectedBranch({...selectedBranch, status: e.target.value})}
                >
                  <option value="active">Active</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
            </div>
          )}
          <div className="sa-modal__footer">
            <button className="sa-btn sa-btn--outline" onClick={() => setShowEditModal(false)}>Cancel</button>
            <button className="sa-btn sa-btn--primary" onClick={handleSaveEdit}>Save Changes</button>
          </div>
        </div>
      </IonModal>

      {/* 3. Branch Reports Modal */}
      <IonModal isOpen={showReportModal} onDidDismiss={() => setShowReportModal(false)} className="sa-modal sa-modal--sm">
        <div className="sa-modal__content">
          <div className="sa-modal__header">
            <h2>Branch Overview</h2>
            <button className="sa-modal__close-btn" onClick={() => setShowReportModal(false)}>×</button>
          </div>
          {selectedBranch && (
            <div className="sa-modal__body">
              <p className="sa-modal__desc">
                Generating snapshot reports for <strong>{selectedBranch.name}</strong> as of {new Date().toLocaleDateString()}.
              </p>
              
              <div className="sa-finance-grid" style={{ marginBottom: 0 }}>
                <div className="sa-finance-card" style={{ padding: '12px' }}>
                  <div className="sa-finance-card__label">Total Sessions</div>
                  <div className="sa-finance-card__value" style={{ fontSize: '18px' }}>142</div>
                </div>
                <div className="sa-finance-card" style={{ padding: '12px' }}>
                  <div className="sa-finance-card__label">Est. Revenue</div>
                  <div className="sa-finance-card__value" style={{ fontSize: '18px' }}>₹12k</div>
                </div>
              </div>
              
            </div>
          )}
          <div className="sa-modal__footer" style={{ justifyContent: 'center' }}>
            <button className="sa-btn sa-btn--outline" style={{ flex: 1 }} onClick={() => setShowReportModal(false)}>Close</button>
            <button className="sa-btn sa-btn--primary" style={{ flex: 1 }}>Download PDF</button>
          </div>
        </div>
      </IonModal>
      
    </IonPage>
  );
};

export default BranchesPage;
