import React, { useState } from 'react';
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
import { useHistory } from 'react-router-dom';
import { ROUTES } from '../../constants/routes.constant';
import { saveOutline, closeOutline } from 'ionicons/icons';
import { createTreatmentCategory } from '../../api/treatmentCategory.api';
import './super-admin.css';

const CreateTreatmentCategoryPage: React.FC = () => {
  const history = useHistory();
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    status: 'Active'
  });

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.code) {
      setToastMessage('Please fill in all required fields');
      setShowToast(true);
      return;
    }

    try {
      await createTreatmentCategory(formData);
      setToastMessage('Treatment Category Created Successfully!');
      setShowToast(true);
      console.log("Validation successful: ", formData);

      
      setTimeout(() => {
        history.push(ROUTES.SUPER_ADMIN.TREATMENT_CATEGORIES);
      }, 1500);
    } catch (error: any) {
      setToastMessage(error.response?.data?.message || 'Failed to create treatment category');
      setShowToast(true);
    }
  };

  return (
    <IonPage className="sa-page">
      <IonHeader className="ion-no-border">
        <IonToolbar className="sa-page__toolbar">
          <IonButtons slot="start">
            <IonBackButton defaultHref={ROUTES.SUPER_ADMIN.TREATMENT_CATEGORIES} text="" />
          </IonButtons>
          <IonTitle className="sa-page__toolbar-title">Create Treatment Category</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="sa-page__content">
        <div className="sa-page__body">
          <div className="sa-page__header">
            <h1 className="sa-page__title">Create Treatment Category</h1>
            <p className="sa-page__subtitle">Add a new treatment category to the system</p>
          </div>

          <form onSubmit={handleSubmit} className="sa-form-layout">
            <div className="sa-section">
              <div className="sa-section__header">
                <div>
                  <h2 className="sa-section__title">Category Details</h2>
                  <p className="sa-section__subtitle">Basic details and status</p>
                </div>
              </div>

              <div className="sa-settings__form">
                <div className="sa-settings__form-group">
                  <label className="sa-settings__label sa-label--required">
                    Category Name
                  </label>
                  <input 
                    type="text" 
                    className="sa-settings__input" 
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. Physical Healing"
                    required
                  />
                </div>

                <div className="sa-settings__form-group">
                  <label className="sa-settings__label sa-label--required">
                    Category Code
                  </label>
                  <input 
                    type="text" 
                    className="sa-settings__input" 
                    name="code"
                    value={formData.code}
                    onChange={handleChange}
                    placeholder="e.g. PH-001"
                    required
                  />
                </div>

                <div className="sa-settings__form-group">
                  <label className="sa-settings__label">
                    Status
                  </label>
                  <select 
                    className="sa-settings__input" 
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    style={{ padding: '12px', appearance: 'auto' }}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>

                <div className="sa-settings__form-group sa-settings__form-group--full">
                  <label className="sa-settings__label">
                    Description
                  </label>
                  <textarea 
                    className="sa-settings__input" 
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Brief description of this category..."
                    style={{ resize: 'vertical', minHeight: '100px', width: '100%', padding: '12px' }}
                  ></textarea>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', marginBottom: '40px', marginTop: '30px' }}>
              <button 
                type="button" 
                className="sa-btn sa-btn--outline"
                onClick={() => history.goBack()}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="sa-btn sa-btn--primary"
              >
                <IonIcon icon={saveOutline} slot="start" /> Save Category
              </button>
            </div>
          </form>
        </div>

        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={2000}
          color={toastMessage.includes('Successfully') ? 'success' : 'danger'}
          position="top"
        />
      </IonContent>
    </IonPage>
  );
};

export default CreateTreatmentCategoryPage;
