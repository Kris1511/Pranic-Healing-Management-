import React, { useState } from "react";
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
} from "@ionic/react";
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
  alertCircleOutline,
} from "ionicons/icons";
import { useHistory } from "react-router-dom";
import { ROUTES } from "../../constants/routes.constant";
import { getBranches, updateBranch, deleteBranch } from "../../api/branch.api";
import "./super-admin.css";

const BranchesPage: React.FC = () => {
  const history = useHistory();
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<any>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const filters = ["All", "Active", "Inactive"];

  const [branches, setBranches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useIonViewWillEnter(() => {
    fetchBranches();
  });

  const fetchBranches = async () => {
    setLoading(true);
    try {
      const response = await getBranches();
      setBranches(response.data || []);
    } catch (error) {
      console.error("Error fetching branches:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBranch = () => {
    history.push(ROUTES.SUPER_ADMIN.CREATE_BRANCH);
  };

  const openEditModal = (branch: any, index: number) => {
    // Find the original index in the main branches array
    const actualIndex = branches.findIndex((b) => b.id === branch.id);
    setEditingIndex(actualIndex);
    setSelectedBranch({ ...branch });
    setShowEditModal(true);
  };

  const openReportModal = (branch: any) => {
    setSelectedBranch({ ...branch });
    setShowReportModal(true);
  };

  const handleSaveEdit = async () => {
    if (editingIndex !== null && selectedBranch && selectedBranch.id) {
      try {
        const response = await updateBranch(selectedBranch.id, selectedBranch);
        const newBranches = [...branches];
        newBranches[editingIndex] = response.data || selectedBranch;
        setBranches(newBranches);
        setShowEditModal(false);
      } catch (error) {
        console.error("Error updating branch:", error);
        alert("Failed to update branch");
      }
    }
  };

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [branchToDelete, setBranchToDelete] = useState<any>(null);

  const handleDeleteBranch = (branch: any) => {
    setBranchToDelete(branch);
    setShowDeleteModal(true);
  };

  const confirmDeleteBranch = async () => {
    if (branchToDelete) {
      try {
        await deleteBranch(branchToDelete.id);
        setBranches(branches.filter((b) => b.id !== branchToDelete.id));
        setShowDeleteModal(false);
        setBranchToDelete(null);
      } catch (error) {
        console.error("Error deleting branch:", error);
        alert("Failed to delete branch");
      }
    }
  };

  const handleToggleStatus = async (branch: any) => {
    const newStatus = branch.status === 'active' ? 'inactive' : 'active';
    try {
      await updateBranch(branch.id, {
        ...branch,
        status: newStatus
      });
      setBranches(prevBranches =>
        prevBranches.map(b => (b.id === branch.id ? { ...b, status: newStatus } : b))
      );
    } catch (error) {
      console.error('Error toggling status:', error);
      alert('Failed to update status');
    }
  };

  const totalBranches = branches.length;
  const activeBranches = branches.filter((b) => b.status === "active").length;
  const inactiveBranches = branches.filter(
    (b) => b.status === "inactive",
  ).length;

  const filteredBranches = branches
    .filter(
      (b) => activeFilter === "All" || b.status === activeFilter.toLowerCase(),
    )
    .filter(
      (b) =>
        b.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (b.address &&
          b.address.toLowerCase().includes(searchQuery.toLowerCase())),
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
                <h1 className="sa-page__title">Branches</h1>
                <p className="sa-page__subtitle">
                  Manage healing centers and administrative assignments
                </p>
              </div>
              <button
                className="sa-btn sa-btn--primary"
                onClick={handleCreateBranch}
              >
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
                <div className="sa-stat-card__label">Inactive</div>
                <div className="sa-stat-card__value">{inactiveBranches}</div>
              </div>
            </div>
          </div>

          {/* Search & Filters */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              marginBottom: 24,
              flexWrap: "wrap",
            }}
          >
            <div className="sa-search">
              <IonIcon icon={searchOutline} />
              <input
                placeholder="Search by name or region..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="sa-filters" style={{ marginBottom: 0 }}>
              {filters.map((f) => (
                <button
                  key={f}
                  className={`sa-filter-tab ${activeFilter === f ? "sa-filter-tab--active" : ""}`}
                  onClick={() => setActiveFilter(f)}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Branch Cards */}
          {filteredBranches.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 20px", color: "var(--ion-color-medium)" }}>
              <IonIcon icon={alertCircleOutline} style={{ fontSize: "48px", marginBottom: "16px", opacity: 0.5 }} />
              <h3 style={{ margin: "0 0 8px 0", fontSize: "18px", color: "var(--ion-color-dark)" }}>
                {activeFilter === "Inactive" ? "Right now no inactive branches" : "No branches found"}
              </h3>
              <p style={{ margin: 0, fontSize: "14px" }}>
                {activeFilter === "Inactive" 
                  ? "All your branches are currently active." 
                  : "Try adjusting your search or filters to find what you're looking for."}
              </p>
            </div>
          ) : (
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
                          <IonIcon icon={locationOutline} />{" "}
                          {branch.address || "No Address"}
                        </p>
                      </div>
                    </div>
                    <span 
                      className={`sa-badge sa-badge--${branch.status}`}
                      style={{ cursor: 'pointer' }}
                      title="Click to toggle status"
                      onClick={() => handleToggleStatus(branch)}
                    >
                      {branch.status}
                    </span>
                  </div>

                  <div
                    className="sa-branch-card__admin"
                    onClick={() =>
                      history.push(
                        ROUTES.SUPER_ADMIN.BRANCH_DETAILS.replace(
                          ":id",
                          encodeURIComponent(branch.id || branch._id),
                        ),
                      )
                    }
                  >
                    <div>
                      <div className="sa-branch-card__admin-label">
                        Branch Admin
                      </div>
                      <div className="sa-branch-card__admin-name">
                        {branch.admin || 'Unassigned'}
                      </div>
                    </div>
                    <IonIcon
                      icon={chevronForwardOutline}
                      style={{ color: "#999" }}
                    />
                  </div>

                  <div className="sa-branch-card__meta">
                    <div className="sa-branch-card__meta-item">
                      <IonIcon icon={callOutline} /> {branch.phone || "N/A"}
                    </div>
                    <div className="sa-branch-card__meta-item">
                      <IonIcon icon={calendarOutline} /> Est.{" "}
                      {branch.createdAt
                        ? new Date(branch.createdAt).toLocaleDateString()
                        : "N/A"}
                    </div>
                  </div>

                  <div className="sa-branch-card__actions">
                    <button
                      className="sa-btn sa-btn--outline sa-btn--sm"
                      style={{
                        width: "100%",
                        color: "var(--color-danger)",
                        borderColor: "var(--color-danger)",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                      onClick={() => handleDeleteBranch(branch)}
                    >
                      <IonIcon icon={trashOutline} />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </IonContent>

      {/* 2. Edit Details Modal */}
      <IonModal
        isOpen={showEditModal}
        onDidDismiss={() => setShowEditModal(false)}
        className="sa-modal"
      >
        <div className="sa-modal__content">
          <div className="sa-modal__header">
            <h2>Edit Branch Details</h2>
            <button
              className="sa-modal__close-btn"
              onClick={() => setShowEditModal(false)}
            >
              ×
            </button>
          </div>
          {selectedBranch && (
            <div className="sa-modal__body">
              <div className="sa-settings__form-group">
                <label className="sa-settings__label">Branch Name</label>
                <input
                  className="sa-settings__input"
                  value={selectedBranch.name}
                  onChange={(e) =>
                    setSelectedBranch({
                      ...selectedBranch,
                      name: e.target.value,
                    })
                  }
                />
              </div>
              <div className="sa-settings__form-group">
                <label className="sa-settings__label">Region</label>
                <select
                  className="sa-settings__input"
                  value={selectedBranch.region}
                  onChange={(e) =>
                    setSelectedBranch({
                      ...selectedBranch,
                      region: e.target.value,
                    })
                  }
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
                  onChange={(e) =>
                    setSelectedBranch({
                      ...selectedBranch,
                      admin: e.target.value,
                    })
                  }
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
                  onChange={(e) =>
                    setSelectedBranch({
                      ...selectedBranch,
                      status: e.target.value,
                    })
                  }
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          )}
          <div className="sa-modal__footer">
            <button
              className="sa-btn sa-btn--outline"
              onClick={() => setShowEditModal(false)}
            >
              Cancel
            </button>
            <button className="sa-btn sa-btn--primary" onClick={handleSaveEdit}>
              Save Changes
            </button>
          </div>
        </div>
      </IonModal>

      {/* 3. Branch Reports Modal */}
      <IonModal
        isOpen={showReportModal}
        onDidDismiss={() => setShowReportModal(false)}
        className="sa-modal sa-modal--sm"
      >
        <div className="sa-modal__content">
          <div className="sa-modal__header">
            <h2>Branch Overview</h2>
            <button
              className="sa-modal__close-btn"
              onClick={() => setShowReportModal(false)}
            >
              ×
            </button>
          </div>
          {selectedBranch && (
            <div className="sa-modal__body">
              <p className="sa-modal__desc">
                Generating snapshot reports for{" "}
                <strong>{selectedBranch.name}</strong> as of{" "}
                {new Date().toLocaleDateString()}.
              </p>

              <div className="sa-finance-grid" style={{ marginBottom: 0 }}>
                <div className="sa-finance-card" style={{ padding: "12px" }}>
                  <div className="sa-finance-card__label">Total Sessions</div>
                  <div
                    className="sa-finance-card__value"
                    style={{ fontSize: "18px" }}
                  >
                    142
                  </div>
                </div>
                <div className="sa-finance-card" style={{ padding: "12px" }}>
                  <div className="sa-finance-card__label">Est. Revenue</div>
                  <div
                    className="sa-finance-card__value"
                    style={{ fontSize: "18px" }}
                  >
                    ₹12k
                  </div>
                </div>
              </div>
            </div>
          )}
          <div
            className="sa-modal__footer"
            style={{ justifyContent: "center" }}
          >
            <button
              className="sa-btn sa-btn--outline"
              style={{ flex: 1 }}
              onClick={() => setShowReportModal(false)}
            >
              Close
            </button>
            <button className="sa-btn sa-btn--primary" style={{ flex: 1 }}>
              Download PDF
            </button>
          </div>
        </div>
      </IonModal>

      {/* 4. Delete Confirmation Modal */}
      <IonModal
        isOpen={showDeleteModal}
        onDidDismiss={() => { setShowDeleteModal(false); setBranchToDelete(null); }}
        className="sa-modal sa-modal--sm"
      >
        <div className="sa-modal__content" style={{ borderTop: '4px solid var(--color-danger)' }}>
          <div className="sa-modal__header">
            <h2 style={{ color: 'var(--color-danger)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <IonIcon icon={trashOutline} /> Delete Branch
            </h2>
            <button
              className="sa-modal__close-btn"
              onClick={() => { setShowDeleteModal(false); setBranchToDelete(null); }}
            >
              ×
            </button>
          </div>
          {branchToDelete && (
            <div className="sa-modal__body">
              <p style={{ margin: '0 0 16px 0', fontSize: '15px', lineHeight: '1.5', color: 'var(--ion-color-dark)' }}>
                Are you sure you want to delete the branch <strong>{branchToDelete.name}</strong>?
              </p>
              
              <div style={{
                background: 'rgba(var(--ion-color-danger-rgb, 235, 68, 90), 0.08)',
                borderLeft: '4px solid var(--color-danger)',
                padding: '12px 16px',
                borderRadius: '4px',
                marginBottom: '16px'
              }}>
                <p style={{ margin: 0, fontSize: '13px', color: 'var(--color-danger)', fontWeight: 500, lineHeight: '1.4' }}>
                  <IonIcon icon={alertCircleOutline} style={{ verticalAlign: 'middle', marginRight: '6px', fontSize: '16px' }} />
                  Warning: This action is permanent and cannot be undone. All active sessions, schedules, and assignments linked to this branch will be affected.
                </p>
              </div>

              <div style={{
                fontSize: '13px',
                color: 'var(--ion-color-medium)',
                background: '#f8f9fa',
                padding: '10px 14px',
                borderRadius: '6px',
                border: '1px solid #e9ecef'
              }}>
                <strong>Branch Details:</strong>
                <div style={{ marginTop: '4px' }}>Location: {branchToDelete.address || 'N/A'}</div>
                <div>Status: <span style={{ textTransform: 'capitalize', fontWeight: 500 }}>{branchToDelete.status}</span></div>
              </div>
            </div>
          )}
          <div className="sa-modal__footer" style={{ display: 'flex', gap: '12px' }}>
            <button
              className="sa-btn sa-btn--outline"
              style={{ flex: 1 }}
              onClick={() => { setShowDeleteModal(false); setBranchToDelete(null); }}
            >
              Cancel
            </button>
            <button 
              className="sa-btn" 
              style={{ flex: 1, backgroundColor: 'var(--color-danger)', color: 'white' }} 
              onClick={confirmDeleteBranch}
            >
              Delete Branch
            </button>
          </div>
        </div>
      </IonModal>
    </IonPage>
  );
};

export default BranchesPage;
