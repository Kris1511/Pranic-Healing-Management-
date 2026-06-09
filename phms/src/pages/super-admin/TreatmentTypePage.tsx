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
import './super-admin.css';

const TreatmentTypePage: React.FC = () => {
  const history = useHistory();
  const [searchQuery, setSearchQuery] = useState('');
  
  const [treatments, setTreatments] = useState([
    { id: 1, name: 'Stress Relief Healing', category: 'Mental Wellness', description: 'Energetically clearing stress and mental tension.', createdDate: '2024-01-15', sessionDuration: '45 min', status: 'Active' },
    { id: 2, name: 'Chakra Cleansing', category: 'Energy Maintenance', description: 'Balancing and purifying the main energy centers.', createdDate: '2024-01-15', sessionDuration: '30 min', status: 'Active' },
    { id: 3, name: 'Emotional Healing', category: 'Psychological', description: 'Releasing suppressed emotions and trauma.', createdDate: '2024-01-18', sessionDuration: '1 hr', status: 'Active' },
    { id: 4, name: 'Physical Pain Healing', category: 'Physical Health', description: 'Addressing localized physical ailments and pain.', createdDate: '2024-01-20', sessionDuration: '45 min', status: 'Active' },
    { id: 5, name: 'Energy Balancing', category: 'General Wellness', description: 'Harmonizing the overall energy body.', createdDate: '2024-01-22', sessionDuration: '30 min', status: 'Active' },
    { id: 6, name: 'Pranic Psychotherapy', category: 'Specialized', description: 'Advanced healing for psychological conditions.', createdDate: '2024-02-05', sessionDuration: '1 hr', status: 'Active' },
    { id: 7, name: 'Meditation Therapy', category: 'Spiritual', description: 'Guided healing through meditative states.', createdDate: '2024-02-10', sessionDuration: '45 min', status: 'Active' },
    { id: 8, name: 'Distance Healing', category: 'Remote', description: 'Healing sessions conducted from a distance.', createdDate: '2024-02-12', sessionDuration: '30 min', status: 'Active' },
    { id: 9, name: 'Aura Cleansing', category: 'Energy Maintenance', description: 'Purifying the outer energy shell.', createdDate: '2024-02-15', sessionDuration: '30 min', status: 'Active' },
    { id: 10, name: 'Relationship Healing', category: 'Social', description: 'Improving energetic ties between individuals.', createdDate: '2024-02-18', sessionDuration: '1 hr', status: 'Active' },
    { id: 11, name: 'Sleep Disorder Healing', category: 'Physical Health', description: 'Improving sleep patterns and insomnia.', createdDate: '2024-03-01', sessionDuration: '45 min', status: 'Active' },
    { id: 12, name: 'Anxiety Relief Healing', category: 'Psychological', description: 'Calming the nervous system and mind.', createdDate: '2024-03-05', sessionDuration: '45 min', status: 'Active' },
    { id: 13, name: 'Depression Support Healing', category: 'Psychological', description: 'Uplifting the energetic state and mood.', createdDate: '2024-03-08', sessionDuration: '1 hr', status: 'Active' },
    { id: 14, name: 'Back Pain Healing', category: 'Physical Health', description: 'Targeted healing for spinal and back issues.', createdDate: '2024-03-10', sessionDuration: '45 min', status: 'Active' },
    { id: 15, name: 'Migraine Relief Healing', category: 'Physical Health', description: 'Specialized healing for chronic headaches.', createdDate: '2024-03-12', sessionDuration: '30 min', status: 'Active' },
    { id: 16, name: 'Heart Chakra Healing', category: 'Specific Chakra', description: 'Focusing on emotional and cardiovascular energy.', createdDate: '2024-03-15', sessionDuration: '45 min', status: 'Active' },
    { id: 17, name: 'Solar Plexus Healing', category: 'Specific Chakra', description: 'Addressing digestive and willpower energy.', createdDate: '2024-03-18', sessionDuration: '45 min', status: 'Active' },
    { id: 18, name: 'General Wellness Healing', category: 'General Wellness', description: 'Standard maintenance for overall health.', createdDate: '2024-03-20', sessionDuration: '30 min', status: 'Active' },
    { id: 19, name: 'Follow-up Healing', category: 'General Wellness', description: 'Secondary session to stabilize previous healing.', createdDate: '2024-03-22', sessionDuration: '30 min', status: 'Active' },
    { id: 20, name: 'Advanced Pranic Healing', category: 'Specialized', description: 'High-level healing using color pranas.', createdDate: '2024-03-25', sessionDuration: '1.5 hrs', status: 'Active' },
  ]);
  
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedTreatment, setSelectedTreatment] = useState<any>(null);
  const [showToast, setShowToast] = useState(false);
  
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterDate, setFilterDate] = useState('');
  const [categories, setCategories] = useState<any[]>([]);
  
  useIonViewWillEnter(() => {
    const saved = localStorage.getItem('ph_treatments');
    if (saved) {
      setTreatments(JSON.parse(saved));
    }
    const savedCats = localStorage.getItem('ph_treatment_categories');
    if (savedCats) {
      setCategories(JSON.parse(savedCats));
    }
  });

  const handleDeleteClick = (treatment: any) => {
    setSelectedTreatment(treatment);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (selectedTreatment) {
      const updated = treatments.filter(t => t.id !== selectedTreatment.id);
      setTreatments(updated);
      localStorage.setItem('ph_treatments', JSON.stringify(updated));
      setShowToast(true);
      setShowDeleteModal(false);
      setSelectedTreatment(null);
    }
  };

  const filteredTreatments = treatments.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         t.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'All' || (t as any).status === filterStatus;
    const matchesCategory = filterCategory === 'All' || t.category === filterCategory;
    const matchesDate = !filterDate || t.createdDate === filterDate;
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
              <div className="sa-filter-select-wrapper" style={{ flex: '1' }}>
                <select 
                  className="sa-settings__input" 
                  style={{ height: '44px', margin: 0, background: '#f1f5f9', border: 'none', fontWeight: 600, color: '#64748b', width: '100%' }}
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                >
                  <option value="All">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
              </div>
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
            <div className="sa-filter-tabs" style={{ display: 'flex', gap: '8px', background: '#f1f5f9', padding: '4px', borderRadius: '10px' }}>
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
            </div>
          </div>

          <div className="sa-section" style={{ padding: 0, overflow: 'hidden' }}>
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
                            {treatment.createdDate}
                          </div>
                        </td>
                        <td style={{ whiteSpace: 'nowrap' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-primary)', fontWeight: 600 }}>
                            <IonIcon icon={timeOutline} style={{ fontSize: '14px' }} />
                            {(treatment as any).sessionDuration || (treatment as any).duration || 'N/A'}
                          </div>
                        </td>
                        <td>
                          <span className={`sa-badge sa-badge--${((treatment as any).status || 'Active').toLowerCase()}`}>
                            {(treatment as any).status || 'Active'}
                          </span>
                        </td>
                        <td>
                          <div className="sa-table__actions" style={{ justifyContent: 'center' }}>
                            <button 
                              className="sa-table__action-btn sa-action-btn--view"
                            //   onClick={() => history.push(ROUTES.SUPER_ADMIN.TREATMENT_TYPE_DETAILS.replace(':id', treatment.id.toString()))}
                            >
                              <IonIcon icon={eyeOutline} />
                            </button>
                            <button 
                              className="sa-table__action-btn sa-action-btn--edit"
                            //   onClick={() => history.push(ROUTES.SUPER_ADMIN.EDIT_TREATMENT_TYPE.replace(':id', treatment.id.toString()))}
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