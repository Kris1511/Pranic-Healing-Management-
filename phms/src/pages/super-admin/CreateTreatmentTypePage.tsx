import React, { useState, useEffect } from 'react';
import {
  IonPage,
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonBackButton,
  IonIcon,
  IonToast,
} from '@ionic/react';
import {
  saveOutline,
  closeOutline,
  refreshOutline,
  medkitOutline,
  gridOutline,
  codeOutline,
  documentTextOutline,
  timeOutline,
  checkmarkCircleOutline,
} from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { ROUTES } from '../../constants/routes.constant';
import './super-admin.css';

const SACreateTreatmentTypePage: React.FC = () => {
  const history = useHistory();
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastColor, setToastColor] = useState('success');

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    code: '',
    status: 'Active',
    description: '',
    sessionDuration: '30 min',
  });
  const [isCustomDuration, setIsCustomDuration] = useState(false);

  const [categories, setCategories] = useState<any[]>([]);
  const [treatments, setTreatments] = useState<any[]>([]);

  useEffect(() => {
    // Load Categories
    const savedCats = localStorage.getItem('ph_treatment_categories');
    if (savedCats) {
      setCategories(JSON.parse(savedCats));
    }

    // Load existing Treatments for uniqueness check
    const savedTreatments = localStorage.getItem('ph_treatments');
    if (savedTreatments) {
      setTreatments(JSON.parse(savedTreatments));
    }
  }, []);

  const handleSave = () => {
    // 1. Mandatory Checks
    if (!formData.name.trim() || !formData.category) {
      setToastMessage('Treatment Name and Category are required');
      setToastColor('danger');
      setShowToast(true);
      return;
    }

    // 2. Duplicate Check
    const isDuplicate = treatments.some(
      (t) => t.name.toLowerCase() === formData.name.toLowerCase()
    );
    if (isDuplicate) {
      setToastMessage('Treatment Name already exists');
      setToastColor('danger');
      setShowToast(true);
      return;
    }

    // 3. Create New Treatment Type
    const newTreatment = {
      id: Date.now(),
      ...formData,
      createdDate: new Date().toISOString().split('T')[0],
      createdTime: new Date().toLocaleTimeString(),
      createdBy: 'Super Admin',
      totalSessions: 0, // Initial sessions used
      lastUpdated: new Date().toISOString(),
    };

    const updatedTreatments = [...treatments, newTreatment];
    localStorage.setItem('ph_treatments', JSON.stringify(updatedTreatments));

    setToastMessage('Treatment Type saved successfully!');
    setToastColor('success');
    setShowToast(true);

    setTimeout(() => {
      history.push(ROUTES.SUPER_ADMIN.TREATMENT_TYPE_LIST);
    }, 1500);
  };

  const handleReset = () => {
    setFormData({
      name: '',
      category: '',
      code: '',
      status: 'Active',
      description: '',
      sessionDuration: '30 min',
    });
    setIsCustomDuration(false);
  };

  const handleCancel = () => {
    history.push(ROUTES.SUPER_ADMIN.TREATMENT_TYPE_LIST);
  };

  // Filter only active categories
  const activeCategories = categories.filter(c => c.status === 'Active');

  return (
    <IonPage className="sa-page">
      <IonHeader className="ion-no-border">
        <IonToolbar className="sa-page__toolbar">
          <IonButtons slot="start">
            <IonBackButton defaultHref={ROUTES.SUPER_ADMIN.TREATMENT_TYPE_LIST} text="" />
          </IonButtons>
          <IonTitle className="sa-page__toolbar-title">Add Treatment Type</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="sa-page__content">
        <div className="sa-page__body">
          <div className="sa-page__header">
            <h1 className="sa-page__title">Create New Treatment</h1>
            <p className="sa-page__subtitle">Configure a new healing method and its specific protocols</p>
          </div>

          <div className="sa-form-layout">
            <div className="sa-section">
              <div className="sa-section__header">
                <div>
                  <h2 className="sa-section__title">Treatment Details</h2>
                  <p className="sa-section__subtitle">Core identification and session specifications</p>
                </div>
              </div>

              <div className="sa-settings__form">
                <div className="sa-settings__form-group">
                  <label className="sa-settings__label">
                    <IonIcon icon={medkitOutline} style={{ marginRight: '8px', fontSize: '14px' }} />
                    Treatment Type Name <span style={{ color: '#ef4444', marginLeft: '4px' }}>*</span>
                  </label>
                  <input
                    className="sa-settings__input"
                    placeholder="e.g., Stress Relief Healing"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className="sa-settings__form-group">
                  <label className="sa-settings__label">
                    <IonIcon icon={gridOutline} style={{ marginRight: '8px', fontSize: '14px' }} />
                    Treatment Category <span style={{ color: '#ef4444', marginLeft: '4px' }}>*</span>
                  </label>
                  <select
                    className="sa-settings__input"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    <option value="">Select Category</option>
                    {activeCategories.map(cat => (
                      <option key={cat.id} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div className="sa-settings__form-group">
                  <label className="sa-settings__label">
                    <IonIcon icon={codeOutline} style={{ marginRight: '8px', fontSize: '14px' }} />
                    Treatment Code (Optional)
                  </label>
                  <input
                    className="sa-settings__input"
                    placeholder="e.g., TRT001"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  />
                </div>

                <div className="sa-settings__form-group">
                  <label className="sa-settings__label">
                    <IonIcon icon={timeOutline} style={{ marginRight: '8px', fontSize: '14px' }} />
                    Session Duration
                  </label>
                  <div style={{ position: 'relative', width: '100%' }}>
                    {!isCustomDuration ? (
                      <select
                        className="sa-settings__input"
                        value={formData.sessionDuration}
                        style={{ width: '100%', padding: '12px', appearance: 'auto' }}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === 'Custom') {
                            setIsCustomDuration(true);
                            setFormData({ ...formData, sessionDuration: '' });
                          } else {
                            setIsCustomDuration(false);
                            setFormData({ ...formData, sessionDuration: val });
                          }
                        }}
                      >
                        <option value="30 min">30 min</option>
                        <option value="45 min">45 min</option>
                        <option value="1 hr">1 hr</option>
                        <option value="Custom">Custom...</option>
                      </select>
                    ) : (
                      <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
                        <input
                          className="sa-settings__input"
                          placeholder="Type duration (e.g. 2 hrs)"
                          style={{ width: '100%' }}
                          value={formData.sessionDuration}
                          onChange={(e) => setFormData({ ...formData, sessionDuration: e.target.value })}
                          autoFocus
                        />
                        <button 
                          className="sa-btn sa-btn--outline" 
                          style={{ padding: '0 12px', height: '44px', minWidth: 'auto' }}
                          onClick={() => {
                            setIsCustomDuration(false);
                            setFormData({ ...formData, sessionDuration: '30 min' });
                          }}
                          title="Back to dropdown"
                        >
                          <IonIcon icon={refreshOutline} style={{ margin: 0 }} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="sa-settings__form-group">
                  <label className="sa-settings__label">
                    <IonIcon icon={checkmarkCircleOutline} style={{ marginRight: '8px', fontSize: '14px' }} />
                    Status
                  </label>
                  <select
                    className="sa-settings__input"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>

                <div className="sa-settings__form-group sa-settings__form-group--full">
                  <label className="sa-settings__label">
                    <IonIcon icon={documentTextOutline} style={{ marginRight: '8px', fontSize: '14px' }} />
                    Description
                  </label>
                  <textarea
                    className="sa-settings__input"
                    placeholder="Brief overview of the treatment..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    style={{ resize: 'vertical', width: '100%', minHeight: '100px', padding: '12px' }}
                  ></textarea>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', marginTop: '32px', paddingBottom: '40px', flexWrap: 'wrap' }}>
              <button className="sa-btn sa-btn--outline" onClick={handleReset}>
                <IonIcon icon={refreshOutline} /> Reset
              </button>
              <button className="sa-btn sa-btn--outline" onClick={handleCancel} style={{ color: '#ef4444', borderColor: '#fee2e2' }}>
                <IonIcon icon={closeOutline} /> Cancel
              </button>
              <button className="sa-btn sa-btn--primary" onClick={handleSave} style={{ minWidth: '160px' }}>
                <IonIcon icon={saveOutline} /> Save Treatment
              </button>
            </div>
          </div>
        </div>

        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={3000}
          color={toastColor}
          position="bottom"
        />
      </IonContent>
    </IonPage>
  );
};

export default SACreateTreatmentTypePage;