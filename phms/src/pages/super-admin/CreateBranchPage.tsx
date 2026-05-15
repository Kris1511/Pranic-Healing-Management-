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
} from '@ionic/react';
import {
  saveOutline,
  closeOutline,
  homeOutline,
  locationOutline,
  callOutline,
  informationCircleOutline,
} from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { ROUTES } from '../../constants/routes.constant';
import './super-admin.css';

const CreateBranchPage: React.FC = () => {
  const history = useHistory();
  const [formData, setFormData] = useState({
    name: '',
    region: 'North Region',
    phone: '',
    address: '',
    details: '',
  });

  const handleCreate = () => {
    // In a real app, this would be an API call
    console.log('Creating Branch:', formData);
    // After creation, navigate back
    history.push(ROUTES.SUPER_ADMIN.BRANCHES);
  };

  const handleCancel = () => {
    history.push(ROUTES.SUPER_ADMIN.BRANCHES);
  };

  return (
    <IonPage className="sa-page">
      <IonHeader className="ion-no-border">
        <IonToolbar className="sa-page__toolbar">
          <IonButtons slot="start">
            <IonBackButton defaultHref={ROUTES.SUPER_ADMIN.BRANCHES} />
          </IonButtons>
          <IonTitle className="sa-page__toolbar-title">Create New Branch</IonTitle>
          <IonButtons slot="end">
            <div className="sa-page__toolbar-actions">
              <button className="sa-btn sa-btn--outline sa-btn--sm" onClick={handleCancel}>
                <IonIcon icon={closeOutline} /> Cancel
              </button>
              <button className="sa-btn sa-btn--primary sa-btn--sm" onClick={handleCreate}>
                <IonIcon icon={saveOutline} /> Save Branch
              </button>
            </div>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent className="sa-page__content">
        <div className="sa-page__body">
          <div className="sa-page__header">
            <h1 className="sa-page__title">Register New Sanctuary</h1>
            <p className="sa-page__subtitle">Enter the details to establish a new healing branch</p>
          </div>

          <div className="sa-grid-2">
            <div className="sa-section">
              <div className="sa-section__header">
                <div>
                  <h2 className="sa-section__title">Branch Information</h2>
                  <p className="sa-section__subtitle">Primary identification and contact details</p>
                </div>
              </div>

              <div className="sa-settings__form">
                <div className="sa-settings__form-group">
                  <label className="sa-settings__label">
                    <IonIcon icon={homeOutline} style={{ marginRight: '8px' }} />
                    Branch Name
                  </label>
                  <input
                    className="sa-settings__input"
                    placeholder="e.g. Uptown Sanctuary"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className="sa-settings__form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="sa-settings__form-group">
                    <label className="sa-settings__label">
                      <IonIcon icon={locationOutline} style={{ marginRight: '8px' }} />
                      Region
                    </label>
                    <select
                      className="sa-settings__input"
                      value={formData.region}
                      onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                    >
                      <option>North Region</option>
                      <option>South Region</option>
                      <option>East Region</option>
                      <option>West Region</option>
                      <option>Central Region</option>
                    </select>
                  </div>

                  <div className="sa-settings__form-group">
                    <label className="sa-settings__label">
                      <IonIcon icon={callOutline} style={{ marginRight: '8px' }} />
                      Contact Phone
                    </label>
                    <input
                      className="sa-settings__input"
                      placeholder="+91 xxxxx xxxxx"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                </div>

                <div className="sa-settings__form-group">
                  <label className="sa-settings__label">
                    <IonIcon icon={locationOutline} style={{ marginRight: '8px' }} />
                    Branch Address
                  </label>
                  <textarea
                    className="sa-settings__input"
                    rows={4}
                    placeholder="Enter the full physical address of the sanctuary..."
                    style={{ resize: 'none', padding: '12px' }}
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  ></textarea>
                </div>
              </div>
            </div>

            <div className="sa-section">
              <div className="sa-section__header">
                <div>
                  <h2 className="sa-section__title">Overall Details</h2>
                  <p className="sa-section__subtitle">Additional description and mission</p>
                </div>
              </div>

              <div className="sa-settings__form">
                <div className="sa-settings__form-group">
                  <label className="sa-settings__label">
                    <IonIcon icon={informationCircleOutline} style={{ marginRight: '8px' }} />
                    Branch Description
                  </label>
                  <textarea
                    className="sa-settings__input"
                    rows={10}
                    placeholder="Provide a detailed overview of the branch, healing specialties, and overall mission..."
                    style={{ resize: 'none', padding: '12px' }}
                    value={formData.details}
                    onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                  ></textarea>
                </div>
              </div>

              <div className="sa-quick-actions" style={{ marginTop: '24px' }}>
                <h3 className="sa-quick-actions__title">Creation Note</h3>
                <p style={{ fontSize: '14px', opacity: 0.8, lineHeight: 1.5 }}>
                  Registering a new branch will create a fresh environment for healers and patients in that region.
                  Ensure the information provided is accurate for administrative purposes.
                </p>
              </div>
            </div>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default CreateBranchPage;
