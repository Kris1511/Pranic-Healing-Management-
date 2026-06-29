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
  IonModal,
  IonAlert,
  IonToast,
  useIonViewWillEnter,
} from '@ionic/react';
import {
  medkitOutline,
  addOutline,
  searchOutline,
  createOutline,
  trashOutline,
  checkmarkCircleOutline,
  calendarOutline,
  gridOutline,
  eyeOutline,
  timeOutline,
  closeOutline,
} from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { ROUTES } from '../../constants/routes.constant';
import { getTreatmentTypes, deleteTreatmentType, updateTreatmentType } from '../../api/treatmentType.api';
import './super-admin.css';

const TreatmentTypePage: React.FC = () => {
  const history = useHistory();
  const [searchQuery, setSearchQuery] = useState('');
  
  const [treatments, setTreatments] = useState<any[]>([]);
  
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedTreatment, setSelectedTreatment] = useState<any>(null);
  const [showToast, setShowToast] = useState(false);
  
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterDate, setFilterDate] = useState('');
  const CATEGORIES = ['General', 'Advanced', 'Psychotherapy', 'Crystal'];
  
  useIonViewWillEnter(() => {
    const loadData = async () => {
      try {
        const typeResponse = await getTreatmentTypes();
        if (typeResponse.success && typeResponse.data) {
          setTreatments(typeResponse.data);
        }
      } catch (error) {
        console.error('Failed to fetch data', error);
      }
    };
    loadData();
  });

  const handleDeleteClick = (treatment: any) => {
    setSelectedTreatment(treatment);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (selectedTreatment) {
      try {
        await deleteTreatmentType(selectedTreatment.id);
        const updated = treatments.filter(t => t.id !== selectedTreatment.id);
        setTreatments(updated);
        setShowToast(true);
      } catch (error) {
        console.error('Failed to delete', error);
      } finally {
        setShowDeleteModal(false);
        setSelectedTreatment(null);
      }
    }
  };

  const handleToggleStatus = async (treatment: any) => {
    const currentStatus = treatment.status || 'Active';
    const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
    try {
      await updateTreatmentType(treatment.id, {
        ...treatment,
        status: newStatus
      });
      setTreatments(prevTreatments =>
        prevTreatments.map(t => (t.id === treatment.id ? { ...t, status: newStatus } : t))
      );
    } catch (error) {
      console.error('Error toggling status:', error);
      alert('Failed to update status');
    }
  };

  const filteredTreatments = treatments.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         t.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'All' || (t as any).status === filterStatus;
    const matchesCategory = filterCategory === 'All' || t.category === filterCategory;
    const matchesDate = !filterDate || new Date(t.createdAt || t.createdDate).toLocaleDateString() === new Date(filterDate).toLocaleDateString();
    return matchesSearch && matchesStatus && matchesCategory && matchesDate;
  });

  return (
    <IonPage className="sa-page">
      <IonHeader className="ion-no-border">
        <IonToolbar className="sa-page__toolbar">
          <IonButtons slot="start">
            <IonMenuButton />
          </IonButtons>
          <IonTitle className="sa-page__toolbar-title">Treatments Type</IonTitle>          
        </IonToolbar>
      </IonHeader>

      <IonContent className="sa-page__content">
        <div className="sa-page__body">
            <div className="sa-page__header">
                        <div className="sa-page__header-row">
                          <div>
                            <h1 className="sa-page__title">Treatment Categories</h1>
                            <p className="sa-page__subtitle">Manage and monitor treatment categories across all branches</p>
                          </div>
                           <button 
                            className="sa-btn sa-btn--primary" 
                            onClick={() => history.push(ROUTES.SUPER_ADMIN.CREATE_TREATMENT_TYPE)}
                            >
                            <IonIcon icon={addOutline} /> Add New Treatment
                            </button>
                        </div>
                      </div>
          <div className="sa-section-header" style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div className="sa-search sa-search--full-mobile" style={{ flex: 1, minWidth: '280px' }}>
              <IonIcon icon={searchOutline} />
              <input 
                placeholder="Search treatments or categories..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="sa-filter-group" style={{ display: 'flex', gap: '12px', flex: '1', minWidth: '300px' }}>
              {/* <div className="sa-filter-select-wrapper" style={{ flex: '1' }}>
                <select 
                  className="sa-settings__input" 
                  style={{ height: '44px', margin: 0, background: '#f1f5f9', border: 'none', fontWeight: 600, color: '#64748b', width: '100%' }}
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                >
                  <option value="All">All Categories</option>
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div> */}
              {/* <div className="sa-filter-date-wrapper" style={{ flex: '1' }}>
                <input 
                  type="date" 
                  className="sa-settings__input sa-date-input" 
                  placeholder="dd-mm-yyyy"
                  style={{ height: '44px', margin: 0, background: '#f1f5f9', border: 'none', fontWeight: 600, color: '#64748b', width: '100%' }}
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                />
              </div> */}
            </div>
            {/* <div className="sa-filter-tabs" style={{ display: 'flex', gap: '8px', background: '#f1f5f9', padding: '4px', borderRadius: '10px' }}>
              <button 
                onClick={() => setFilterStatus('All')}
                style={{ 
                  padding: '8px 16px', 
                  borderRadius: '8px', 
                  fontSize: '13px', 
                  fontWeight: 600,
                  transition: 'all 0.2s',
                  background: filterStatus === 'All' ? 'white' : 'transparent',
                  color: filterStatus === 'All' ? 'var(--color-primary)' : '#64748b',
                  boxShadow: filterStatus === 'All' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
                  border: 'none'
                }}
              >
                All
              </button>
              <button 
                onClick={() => setFilterStatus('Active')}
                style={{ 
                  padding: '8px 16px', 
                  borderRadius: '8px', 
                  fontSize: '13px', 
                  fontWeight: 600,
                  transition: 'all 0.2s',
                  background: filterStatus === 'Active' ? 'white' : 'transparent',
                  color: filterStatus === 'Active' ? '#10b981' : '#64748b',
                  boxShadow: filterStatus === 'Active' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
                  border: 'none'
                }}
              >
                Active
              </button>
              <button 
                onClick={() => setFilterStatus('Inactive')}
                style={{ 
                  padding: '8px 16px', 
                  borderRadius: '8px', 
                  fontSize: '13px', 
                  fontWeight: 600,
                  transition: 'all 0.2s',
                  background: filterStatus === 'Inactive' ? 'white' : 'transparent',
                  color: filterStatus === 'Inactive' ? '#ef4444' : '#64748b',
                  boxShadow: filterStatus === 'Inactive' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
                  border: 'none'
                }}
              >
                Inactive
              </button>
            </div> */}
          </div>

          <div className="sa-section" style={{ padding: 0, overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <div className="sa-table-container">
              <table className="sa-table">
                <thead>
                  <tr>
                    <th>Treatment Name</th>
                    <th>Category</th>
                    <th>Created Date</th>
                    <th>Duration</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTreatments.length > 0 ? (
                    filteredTreatments.map((treatment) => (
                      <tr key={treatment.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--color-primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)' }}>
                              <IonIcon icon={medkitOutline} />
                            </div>
                            <span style={{ fontWeight: 600, color: '#1e293b', whiteSpace: 'nowrap' }}>{treatment.name}</span>
                          </div>
                        </td>
                        <td>
                          <span style={{ color: '#64748b', fontSize: '13px', whiteSpace: 'nowrap' }}>
                            {treatment.category}
                          </span>
                        </td>
                        <td style={{ color: '#64748b', fontSize: '13px', whiteSpace: 'nowrap' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <IonIcon icon={calendarOutline} style={{ fontSize: '14px' }} />
                            {new Date(treatment.createdAt || treatment.createdDate).toLocaleDateString()}
                          </div>
                        </td>
                        <td style={{ whiteSpace: 'nowrap' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-primary)', fontWeight: 600 }}>
                            <IonIcon icon={timeOutline} style={{ fontSize: '14px' }} />
                            {(treatment as any).sessionDuration || (treatment as any).duration || 'N/A'}
                          </div>
                        </td>
                        <td>
                          <span 
                            className={`sa-badge sa-badge--${((treatment as any).status || 'Active').toLowerCase()}`}
                            style={{ cursor: 'pointer' }}
                            title="Click to toggle status"
                            onClick={() => handleToggleStatus(treatment)}
                          >
                            {(treatment as any).status || 'Active'}
                          </span>
                        </td>
                        <td>
                          <div className="sa-table__actions" style={{ justifyContent: 'center' }}>
                            <button 
                              className="sa-table__action-btn sa-action-btn--view"
                              onClick={() => history.push(ROUTES.SUPER_ADMIN.TREATMENT_TYPE_DETAILS.replace(':id', treatment.id.toString()))}
                            >
                              <IonIcon icon={eyeOutline} />
                            </button>
                            <button 
                              className="sa-table__action-btn sa-action-btn--edit"
                              onClick={() => history.push(ROUTES.SUPER_ADMIN.EDIT_TREATMENT_TYPE.replace(':id', treatment.id.toString()))}
                            >
                              <IonIcon icon={createOutline} />
                            </button>
                            <button 
                              className="sa-table__action-btn sa-action-btn--delete"
                              onClick={() => handleDeleteClick(treatment)}
                            >
                              <IonIcon icon={trashOutline} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '0' }}>
                        <div className="sa-empty-state" style={{ border: 'none', background: 'transparent', margin: '0' }}>
                          <div className="sa-empty-state__icon">
                            <IonIcon icon={medkitOutline} />
                          </div>
                          <h3 className="sa-empty-state__title">No treatment types found</h3>
                          <p className="sa-empty-state__text">
                            {searchQuery 
                              ? `No treatments matching "${searchQuery}" were found.` 
                              : `There are currently no treatment types matching the selected filters.`}
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
          isOpen={showDeleteModal} 
          onDidDismiss={() => setShowDeleteModal(false)}
          className="sa-modal sa-modal--sm"
        >
          <div className="sa-modal__content">
            <div className="sa-modal__header">
              <h2 style={{ color: '#064e3b', fontWeight: 700 }}>Confirm Removal</h2>
              <button className="sa-modal__close-btn" onClick={() => setShowDeleteModal(false)}>
                <IonIcon icon={closeOutline} />
              </button>
            </div>
            <div className="sa-modal__body">
              <p style={{ color: '#4b5563', lineHeight: '1.6', fontSize: '15px' }}>
                Are you sure you want to remove <strong>{selectedTreatment?.name}</strong> from the treatment catalog? This action cannot be undone.
              </p>
            </div>
            <div className="sa-modal__footer" style={{ background: 'white', padding: '16px 24px' }}>
              <button 
                className="sa-btn sa-btn--outline" 
                onClick={() => setShowDeleteModal(false)}
                style={{ borderRadius: '10px', padding: '12px 24px', fontWeight: 700, border: '1px solid #e5e7eb' }}
              >
                Cancel
              </button>
              <button 
                className="sa-btn sa-btn--danger" 
                onClick={confirmDelete}
                style={{ borderRadius: '10px', padding: '12px 24px', fontWeight: 700 }}
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </IonModal>

        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message="Treatment Type deleted successfully"
          duration={2000}
          color="success"
          position="bottom"
        />
      </IonContent>
    </IonPage>
  );
};

export default TreatmentTypePage;