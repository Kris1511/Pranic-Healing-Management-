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
  codeOutline,
  documentTextOutline,
  timeOutline,
  checkmarkCircleOutline,
} from 'ionicons/icons';
import { useHistory, useParams } from 'react-router-dom';
import { ROUTES } from '../../constants/routes.constant';
import { getTreatmentTypeById, updateTreatmentType } from '../../api/treatmentType.api';
import './super-admin.css';

const SAEditTreatmentTypePage: React.FC = () => {
  const history = useHistory();
  const { id } = useParams<{ id: string }>();

  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastColor, setToastColor] = useState('success');

  const [formData, setFormData] = useState({
    name: '',
    category: 'General',
    code: '',
    status: 'Active',
    description: '',
    sessionDuration: '30 min',
  });
  const [isCustomDuration, setIsCustomDuration] = useState(false);

  // Store the original loaded details to reset back to them
  const [initialData, setInitialData] = useState<any>(null);

  useEffect(() => {
    const loadTreatmentType = async () => {
      try {
        const response = await getTreatmentTypeById(id);
        if (response.success && response.data) {
          const typeData = response.data;
          const loadedForm = {
            name: typeData.name || '',
            category: typeData.category || 'General',
            code: typeData.code || '',
            status: typeData.status || 'Active',
            description: typeData.description || '',
            sessionDuration: typeData.sessionDuration || typeData.duration || '30 min',
          };
          setFormData(loadedForm);
          setInitialData(loadedForm);

          // Check if sessionDuration is a custom duration preset
          const presets = ['30 min', '45 min', '1 hr'];
          if (loadedForm.sessionDuration && !presets.includes(loadedForm.sessionDuration)) {
            setIsCustomDuration(true);
          }
        }
      } catch (error) {
        console.error('Failed to load treatment details', error);
        setToastMessage('Failed to load treatment details');
        setToastColor('danger');
        setShowToast(true);
      }
    };
    loadTreatmentType();
  }, [id]);

  const handleSave = async () => {
    // 1. Mandatory Checks
    if (!formData.name.trim()) {
      setToastMessage('Treatment Name is required');
      setToastColor('danger');
      setShowToast(true);
      return;
    }

    try {
      await updateTreatmentType(id, formData);
      setToastMessage('Treatment Type updated successfully!');
      setToastColor('success');
      setShowToast(true);

      setTimeout(() => {
        history.push(ROUTES.SUPER_ADMIN.TREATMENT_TYPE_LIST);
      }, 1500);
    } catch (error: any) {
      setToastMessage(error.response?.data?.message || 'Failed to update treatment type');
      setToastColor('danger');
      setShowToast(true);
    }
  };

  const handleReset = () => {
    if (initialData) {
      setFormData(initialData);
      const presets = ['30 min', '45 min', '1 hr'];
      setIsCustomDuration(initialData.sessionDuration && !presets.includes(initialData.sessionDuration));
    }
  };

  const handleCancel = () => {
    history.push(ROUTES.SUPER_ADMIN.TREATMENT_TYPE_LIST);
  };

  if (!initialData) {
    return (
      <IonPage>
        <IonContent>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <p>Loading treatment details...</p>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage className="sa-page">
      <IonHeader className="ion-no-border">
        <IonToolbar className="sa-page__toolbar">
          <IonButtons slot="start">
            <IonBackButton defaultHref={ROUTES.SUPER_ADMIN.TREATMENT_TYPE_LIST} text="" />
          </IonButtons>
          <IonTitle className="sa-page__toolbar-title">Edit Treatment Type</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="sa-page__content">
        <div className="sa-page__body">
          <div className="sa-page__header">
            <h1 className="sa-page__title">Edit Treatment</h1>
            <p className="sa-page__subtitle">Update the healing method configurations and protocols</p>
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
                <IonIcon icon={saveOutline} /> Save Changes
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

export default SAEditTreatmentTypePage;
