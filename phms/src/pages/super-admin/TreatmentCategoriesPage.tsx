import React, { useState } from 'react';
import {
  IonPage,
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonMenuButton,
  IonIcon,
  useIonViewWillEnter,
  IonAlert,
  IonToast,
  IonModal,
} from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { ROUTES } from '../../constants/routes.constant';
import { getTreatmentCategories, deleteTreatmentCategory, updateTreatmentCategory } from '../../api/treatmentCategory.api';
import {
  gridOutline,
  addOutline,
  searchOutline,
  createOutline,
  trashOutline,
  leafOutline,
  calendarOutline,
  eyeOutline,
  closeOutline,
} from 'ionicons/icons';
import './super-admin.css';

const TreatmentCategoriesPage: React.FC = () => {
  const history = useHistory();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('');
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<any>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  
  const [categories, setCategories] = useState<any[]>([]);

  useIonViewWillEnter(() => {
    const loadCategories = async () => {
      try {
        const response = await getTreatmentCategories();
        if (response.success && response.data) {
          setCategories(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch categories', error);
      }
    };
    loadCategories();
  });

  const filteredCategories = categories.filter(c => {
    const matchesSearch = 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (c.code && c.code.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
    const matchesDate = !dateFilter || 
      (c.createdAt && new Date(c.createdAt).toISOString().split('T')[0] === dateFilter);
    return matchesSearch && matchesStatus && matchesDate;
  });

  const handleDelete = async (id: number | string) => {
    try {
      await deleteTreatmentCategory(id as string);
      const updatedCategories = categories.filter(c => c.id !== id);
      setCategories(updatedCategories);
      setToastMessage('Category deleted successfully');
      setShowToast(true);
    } catch (error) {
      console.error('Failed to delete category', error);
      setToastMessage('Failed to delete category');
      setShowToast(true);
    }
  };

  const handleToggleStatus = async (category: any) => {
    const newStatus = category.status === 'Active' ? 'Inactive' : 'Active';
    try {
      await updateTreatmentCategory(category.id, {
        ...category,
        status: newStatus
      });
      setCategories(prevCategories =>
        prevCategories.map(c => (c.id === category.id ? { ...c, status: newStatus } : c))
      );
      setToastMessage(`Category status updated to ${newStatus}`);
      setShowToast(true);
    } catch (error) {
      console.error('Error toggling status:', error);
      setToastMessage('Failed to update status');
      setShowToast(true);
    }
  };

  return (
    <IonPage className="sa-page">
      <IonHeader className="ion-no-border">
        <IonToolbar className="sa-page__toolbar">
          <IonButtons slot="start">
            <IonMenuButton />
          </IonButtons>
          <IonTitle className="sa-page__toolbar-title">Treatment Categories</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="sa-page__content">
        <div className="sa-page__body">
          {/* Page Header */}
          <div className="sa-page__header">
            <div className="sa-page__header-row">
              <div>
                <h1 className="sa-page__title">Treatment Categories</h1>
                <p className="sa-page__subtitle">Manage and monitor treatment categories across all branches</p>
              </div>
              <button 
                className="sa-btn sa-btn--primary" 
                onClick={() => history.push(ROUTES.SUPER_ADMIN.CREATE_TREATMENT_CATEGORY)}
              >
                <IonIcon icon={addOutline} /> Add Category
              </button>
            </div>
          </div>

          {/* Search & Filters */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
            <div className="sa-search">
              <IonIcon icon={searchOutline} />
              <input 
                placeholder="Search categories..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="sa-filters" style={{ marginBottom: 0 }}>
              {['All', 'Active', 'Inactive'].map((status) => (
                <button 
                  key={status}
                  className={`sa-filter-tab ${statusFilter === status ? 'sa-filter-tab--active' : ''}`}
                  onClick={() => setStatusFilter(status)}
                >
                  {status}
                </button>
              ))}
              
              {/* <div className="sa-search" style={{ marginBottom: 0, maxWidth: '200px', marginLeft: '12px' }}>
                <IonIcon icon={calendarOutline} />
                <input 
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  style={{ cursor: 'pointer' }}
                />
                {dateFilter && (
                  <button 
                    onClick={() => setDateFilter('')}
                    style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}
                  >
                    Clear
                  </button>
                )}
              </div> */}
            </div>
          </div>

          <div className="sa-section" style={{ padding: 0, overflow: 'hidden' }}>
            <div className="sa-table-responsive">
              <table className="sa-table">
                <thead>
                  <tr>
                    <th>Category Name</th>
                    <th style={{ textAlign: 'center' }}>Category Code</th>
                    <th style={{ textAlign: 'center' }}>Total Treatment Type</th>
                    <th>Description</th>
                    <th style={{ textAlign: 'center' }}>Created Date</th>
                    <th style={{ textAlign: 'center' }}>Status</th>
                    <th style={{ textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCategories.length > 0 ? (
                    filteredCategories.map((cat) => (
                      <tr key={cat.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16a34a' }}>
                              <IonIcon icon={gridOutline} />
                            </div>
                            <span style={{ fontWeight: 600, color: '#1e293b' }}>{cat.name}</span>
                          </div>
                        </td>
                        <td style={{ textAlign: 'center', fontWeight: 500, color: '#64748b' }}>
                          {cat.code || '---'}
                        </td>
                        <td>
                          <div style={{ fontWeight: 700, color: '#16a34a', textAlign: 'center' }}>{cat.treatmentCount}</div>
                        </td>
                        <td style={{ color: '#64748b', fontSize: '13px' }}>{cat.description}</td>
                        <td style={{ color: '#64748b', fontSize: '13px', textAlign: 'center' }}>
                          {new Date(cat.createdAt || Date.now()).toLocaleDateString('en-GB')}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <span 
                            className={`sa-badge sa-badge--${cat.status.toLowerCase()}`}
                            style={{ cursor: 'pointer' }}
                            title="Click to toggle status"
                            onClick={() => handleToggleStatus(cat)}
                          >
                            {cat.status}
                          </span>
                        </td>
                        <td>
                          <div className="sa-table__actions" style={{ justifyContent: 'center' }}>
                            <button 
                              className="sa-table__action-btn sa-action-btn--view"
                              onClick={() => history.push(ROUTES.SUPER_ADMIN.TREATMENT_CATEGORY_DETAILS.replace(':id', cat.id.toString()))}
                            >
                              <IonIcon icon={eyeOutline} />
                            </button>
                            <button 
                              className="sa-table__action-btn sa-action-btn--edit"
                              onClick={() => history.push(ROUTES.SUPER_ADMIN.EDIT_TREATMENT_CATEGORY.replace(':id', cat.id.toString()))}
                            >
                              <IonIcon icon={createOutline} />
                            </button>
                            <button 
                              className="sa-table__action-btn sa-action-btn--delete"
                              onClick={() => {
                                setCategoryToDelete(cat);
                                setShowDeleteAlert(true);
                              }}
                            >
                              <IonIcon icon={trashOutline} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: '0' }}>
                        <div className="sa-empty-state" style={{ border: 'none', background: 'transparent', margin: '0' }}>
                          <div className="sa-empty-state__icon">
                            <IonIcon icon={gridOutline} />
                          </div>
                          <h3 className="sa-empty-state__title">No categories found</h3>
                          <p className="sa-empty-state__text">
                            {searchQuery 
                              ? `No categories matching "${searchQuery}" were found.` 
                              : `There are currently no treatment categories matching the selected filters.`}
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <IonModal 
          isOpen={showDeleteAlert} 
          onDidDismiss={() => setShowDeleteAlert(false)}
          className="sa-modal sa-modal--confirm"
          style={{ '--height': 'auto', '--width': '450px', '--border-radius': '16px' }}
        >
          <div className="sa-modal__container" style={{ padding: '32px' }}>
            <div className="sa-modal__header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#164e63', margin: 0 }}>Confirm Removal</h2>
              <button 
                onClick={() => setShowDeleteAlert(false)}
                style={{ background: 'none', border: 'none', padding: '4px', cursor: 'pointer', color: '#94a3b8' }}
              >
                <IonIcon icon={closeOutline} style={{ fontSize: '24px' }} />
              </button>
            </div>

            <div className="sa-modal__body" style={{ marginBottom: '32px' }}>
              <p style={{ fontSize: '15px', color: '#64748b', lineHeight: '1.6', margin: 0 }}>
                Are you sure you want to remove <strong style={{ color: '#1e293b' }}>{categoryToDelete?.name}</strong> from their 
                assignment at <strong style={{ color: '#1e293b' }}>Super Admin Portal</strong>? This action cannot be undone.
              </p>
            </div>

            <div className="sa-modal__footer" style={{ display: 'flex', gap: '16px' }}>
              <button 
                className="sa-btn sa-btn--outline" 
                onClick={() => setShowDeleteAlert(false)}
                style={{ flex: 1, height: '48px', borderRadius: '10px', fontSize: '15px' }}
              >
                Cancel
              </button>
              <button 
                className="sa-btn sa-btn--danger" 
                onClick={() => {
                  if (categoryToDelete) {
                    handleDelete(categoryToDelete.id);
                    setShowDeleteAlert(false);
                  }
                }}
                style={{ flex: 1.2, height: '48px', borderRadius: '10px', fontSize: '15px', fontWeight: 700 }}
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </IonModal>

        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={2000}
          color="success"
          position="bottom"
        />
      </IonContent>
    </IonPage>
  );
};

export default TreatmentCategoriesPage;