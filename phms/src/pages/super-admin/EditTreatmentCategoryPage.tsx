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
  folderOutline,
  codeOutline,
  documentTextOutline,
  checkmarkCircleOutline,
} from 'ionicons/icons';
import { useHistory, useParams } from 'react-router-dom';
import { ROUTES } from '../../constants/routes.constant';
import './super-admin.css';

const SAEditTreatmentCategoryPage: React.FC = () => {
  const history = useHistory();
  const { id } = useParams<{ id: string }>();
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastColor, setToastColor] = useState('success');

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    status: 'Active',
  });

  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedCategories = localStorage.getItem('ph_treatment_categories');
    if (savedCategories) {
      const allCategories = JSON.parse(savedCategories);
      setCategories(allCategories);
      const foundCategory = allCategories.find((c: any) => c.id.toString() === id);
      if (foundCategory) {
        setFormData({
          name: foundCategory.name,
          code: foundCategory.code || '',
          description: foundCategory.description || '',
          status: foundCategory.status,
        });
      }
    }
    setLoading(false);
  }, [id]);

  const handleUpdate = () => {
    // 1. Validate Name
    if (!formData.name.trim()) {
      setToastMessage('Category Name is required');
      setToastColor('danger');
      setShowToast(true);
      return;
    }

    // 2. Validate Uniqueness (excluding current ID)
    const isDuplicate = categories.some(
      (cat) => cat.name.toLowerCase() === formData.name.toLowerCase() && cat.id.toString() !== id
    );
    if (isDuplicate) {
      setToastMessage('Category Name already exists');
      setToastColor('danger');
      setShowToast(true);
      return;
    }

    // 3. Update Category
    const updatedCategories = categories.map((cat) => {
      if (cat.id.toString() === id) {
        return {
          ...cat,
          ...formData,
          lastUpdated: new Date().toISOString(),
        };
      }
      return cat;
    });

    localStorage.setItem('ph_treatment_categories', JSON.stringify(updatedCategories));

    setToastMessage('Category updated successfully!');
    setToastColor('success');
    setShowToast(true);

    setTimeout(() => {
      history.push(ROUTES.SUPER_ADMIN.TREATMENT_CATEGORIES);
    }, 1500);
  };

  const handleReset = () => {
    const foundCategory = categories.find((c: any) => c.id.toString() === id);
    if (foundCategory) {
      setFormData({
        name: foundCategory.name,
        code: foundCategory.code || '',
        description: foundCategory.description || '',
        status: foundCategory.status,
      });
    }
  };

  const handleCancel = () => {
    history.push(ROUTES.SUPER_ADMIN.TREATMENT_CATEGORIES);
  };

  if (loading) {
    return (
      <IonPage>
        <IonContent>
          <div style={{ padding: '20px', textAlign: 'center' }}>Loading category data...</div>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage className="sa-page">
      <IonHeader className="ion-no-border">
        <IonToolbar className="sa-page__toolbar">
          <IonButtons slot="start">
            <IonBackButton defaultHref={ROUTES.SUPER_ADMIN.TREATMENT_CATEGORIES} text="" />
          </IonButtons>
          <IonTitle className="sa-page__toolbar-title">Edit Treatment Category</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="sa-page__content">
        <div className="sa-page__body">
          <div className="sa-page__header">
            <h1 className="sa-page__title">Update Category</h1>
            <p className="sa-page__subtitle">Modify the details and classification for this treatment category</p>
          </div>

          <div className="sa-form-layout">
            <div className="sa-section">
              <div className="sa-section__header">
                <div>
                  <h2 className="sa-section__title">Basic Information</h2>
                  <p className="sa-section__subtitle">Core identification details for the category</p>
                </div>
              </div>

              <div className="sa-settings__form">
                <div className="sa-settings__form-group">
                  <label className="sa-settings__label">
                    <IonIcon icon={folderOutline} style={{ marginRight: '8px' }} />
                    Category Name <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    className="sa-settings__input"
                    placeholder="e.g., Advanced Healing"
                    value={formData.name}
                    maxLength={50}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className="sa-settings__form-group">
                  <label className="sa-settings__label">
                    <IonIcon icon={codeOutline} style={{ marginRight: '8px' }} />
                    Category Code (Optional)
                  </label>
                  <input
                    className="sa-settings__input"
                    placeholder="e.g., AD-001"
                    value={formData.code}
                    maxLength={10}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  />
                </div>

                <div className="sa-settings__form-group">
                  <label className="sa-settings__label">
                    <IonIcon icon={checkmarkCircleOutline} style={{ marginRight: '8px' }} />
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
                    <IonIcon icon={documentTextOutline} style={{ marginRight: '8px' }} />
                    Description
                  </label>
                  <textarea
                    className="sa-settings__input"
                    rows={4}
                    placeholder="Describe the treatments included in this category..."
                    style={{ resize: 'vertical', padding: '12px', width: '100%', minHeight: '100px' }}
                    value={formData.description}
                    maxLength={200}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  ></textarea>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', marginTop: '32px', paddingBottom: '40px' }}>
              {/* <button className="sa-btn sa-btn--outline" onClick={handleReset}>
                <IonIcon icon={refreshOutline} /> Reset Changes
              </button> */}
              <button className="sa-btn sa-btn--outline" onClick={handleCancel} style={{ color: '#ef4444', borderColor: '#fee2e2' }}>
                <IonIcon icon={closeOutline} /> Cancel
              </button>
              <button className="sa-btn sa-btn--primary" onClick={handleUpdate} style={{ minWidth: '160px' }}>
                <IonIcon icon={saveOutline} /> Update Category
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

export default SAEditTreatmentCategoryPage;