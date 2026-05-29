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
  useIonToast,
} from '@ionic/react';
import {
  saveOutline,
  closeOutline,
  homeOutline,
  locationOutline,
  callOutline,
  mailOutline,
  lockClosedOutline,
  eyeOutline,
  eyeOffOutline,
  informationCircleOutline,
} from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { ROUTES } from '../../constants/routes.constant';
import { createBranch } from '../../api/branch.api';
import './super-admin.css';

const CreateBranchPage: React.FC = () => {
  const history = useHistory();
  const [formData, setFormData] = useState({
    name: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    district: '',
    state: '',
    pincode: '',
    phone: '',
    email: '',
    password: '',
    details: '',
  });

  const [showPassword, setShowPassword] = useState(false);

  const [admins, setAdmins] = React.useState<any[]>([]);

  React.useEffect(() => {
    const savedAdmins = localStorage.getItem('ph_admins');
    if (savedAdmins) {
      setAdmins(JSON.parse(savedAdmins));
    } else {
      const INITIAL_ADMINS = [
        { id: 1, name: 'John Admin', email: 'john.a@phms.com', phone: '0876543210', branch: 'Uptown Sanctuary', status: 'active', joined: '2023-01-16' },
        { id: 2, name: 'Sarah Admin', email: 'sarah.m@phms.com', phone: '0876543211', branch: 'Coastal Healing Center', status: 'active', joined: '2023-02-20' },
        { id: 3, name: 'Mike Admin', email: 'mike.t@phms.com', phone: '0876543212', branch: 'Green Valley Branch', status: 'Inactive', joined: '2022-02-10' },
        { id: 4, name: 'Elena Thorne', email: 'elena.t@phms.com', phone: '0876543212', branch: 'Downtown Sanctuary', status: 'active', joined: '2023-04-05' },
      ];
      setAdmins(INITIAL_ADMINS);
      localStorage.setItem('ph_admins', JSON.stringify(INITIAL_ADMINS));
    }
  }, []);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [presentToast] = useIonToast();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const combinedAddress = [
        formData.addressLine1,
        formData.addressLine2,
        formData.city,
        formData.district,
        formData.state,
        formData.pincode
      ].filter(Boolean).join(', ');

      const payload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: combinedAddress,
        status: 'active',
        addressLine1: formData.addressLine1,
        addressLine2: formData.addressLine2,
        city: formData.city,
        district: formData.district,
        state: formData.state,
        pincode: formData.pincode,
        details: formData.details
      };

      // API call to save branch data to the database
      const response = await createBranch(payload);
      
      presentToast({
        message: 'Branch created successfully!',
        duration: 2000,
        color: 'success',
        position: 'top'
      });

      // Navigate back after successful creation
      history.push({
        pathname: ROUTES.SUPER_ADMIN.BRANCHES,
        state: { newBranch: response.data || payload, refresh: true }
      });
    } catch (error) {
      console.error('Error creating branch:', error);
      presentToast({
        message: 'Failed to create branch. Please try again.',
        duration: 3000,
        color: 'danger',
        position: 'top'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    history.push(ROUTES.SUPER_ADMIN.BRANCHES);
  };

  return (
    <IonPage className="sa-page">
      <IonHeader className="ion-no-border">
        <IonToolbar className="sa-page__toolbar">
          <IonButtons slot="start">
            <IonBackButton defaultHref={ROUTES.SUPER_ADMIN.BRANCHES} text="" />
          </IonButtons>
          <IonTitle className="sa-page__toolbar-title">Create New Branch</IonTitle>

        </IonToolbar>
      </IonHeader>

      <IonContent className="sa-page__content">
        <div className="sa-page__body">
          <div className="sa-page__header">
            <h1 className="sa-page__title">Register New Branch</h1>
            <p className="sa-page__subtitle">Enter the details to establish a new healing branch</p>
          </div>

          <form onSubmit={handleCreate} className="sa-form-layout">
            <div className="sa-section">
              <div className="sa-section__header">
                <div>
                  <h2 className="sa-section__title">Branch Information</h2>
                  <p className="sa-section__subtitle">Primary identification and contact details</p>
                </div>
              </div>

              <div className="sa-settings__form">
                <div className="sa-settings__form-group">
                  <label className="sa-settings__label sa-label--required">
                    <IonIcon icon={homeOutline} style={{ marginRight: '8px' }} />
                    Branch Name
                  </label>
                  <input
                    className="sa-settings__input"
                    placeholder="Enter the name of the branch"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="sa-settings__form-group">
                  <label className="sa-settings__label sa-label--required">
                    <IonIcon icon={mailOutline} style={{ marginRight: '8px' }} />
                    Email ID
                  </label>
                  <input
                    type="email"
                    className="sa-settings__input"
                    placeholder="Enter email address"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>

                {/* <div className="sa-settings__form-group">
                  <label className="sa-settings__label sa-label--required">
                    <IonIcon icon={lockClosedOutline} style={{ marginRight: '8px' }} />
                    Password
                  </label>
                  <div className="sa-settings__input-wrapper" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="sa-settings__input"
                      placeholder="Enter a secure password"
                      style={{ paddingRight: '40px', width: '100%' }}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: 'absolute',
                        right: '12px',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        color: 'var(--color-text-muted)',
                        padding: 0
                      }}
                    >
                      <IonIcon icon={showPassword ? eyeOffOutline : eyeOutline} style={{ fontSize: '20px' }} />
                    </button>
                  </div>
                </div> */}

                <div className="sa-settings__form-group">
                  <label className="sa-settings__label sa-label--required">
                    <IonIcon icon={callOutline} style={{ marginRight: '8px' }} />
                    Contact Number
                  </label>
                  <input
                    type="tel"
                    className="sa-settings__input"
                    placeholder="Enter phone number"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                  />
                </div>

                <div className="sa-settings__form-group">
                  <label className="sa-settings__label sa-label--required">
                    <IonIcon icon={locationOutline} style={{ marginRight: '8px' }} />
                    Address Line 1
                  </label>
                  <input
                    className="sa-settings__input"
                    placeholder="Building / Street name"
                    value={formData.addressLine1}
                    onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
                    required
                  />
                </div>

                <div className="sa-settings__form-group">
                  <label className="sa-settings__label sa-label">
                    <IonIcon icon={locationOutline} style={{ marginRight: '8px' }} />
                    Address Line 2
                  </label>
                  <input
                    className="sa-settings__input"
                    placeholder="Area / Landmark"
                    value={formData.addressLine2}
                    onChange={(e) => setFormData({ ...formData, addressLine2: e.target.value })}
                  />
                </div>

                <div className="sa-settings__form-group">
                  <label className="sa-settings__label sa-label--required">City</label>
                  <input
                    className="sa-settings__input"
                    placeholder="City name"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    required
                  />
                </div>
                <div className="sa-settings__form-group">
                  <label className="sa-settings__label sa-label--required">District</label>
                  <input
                    className="sa-settings__input"
                    placeholder="District name"
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    required
                  />
                </div>

                <div className="sa-settings__form-group">
                  <label className="sa-settings__label sa-label--required">State</label>
                  <input
                    className="sa-settings__input"
                    placeholder="State name"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    required
                  />
                </div>
                <div className="sa-settings__form-group">
                  <label className="sa-settings__label sa-label--required">Pincode</label>
                  <input
                    className="sa-settings__input"
                    placeholder="Postal code"
                    value={formData.pincode}
                    onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                    required
                  />
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
                <div className="sa-settings__form-group sa-settings__form-group--full">
                  <label className="sa-settings__label sa-label--required">
                    <IonIcon icon={informationCircleOutline} style={{ marginRight: '8px' }} />
                    Branch Description
                  </label>
                  <textarea
                    className="sa-settings__input"
                    placeholder="Provide a detailed overview of the branch, healing specialties, and overall mission..."
                    style={{ resize: 'none', padding: '12px', width: '100%', height: '100px', minHeight: '100px' }}
                    value={formData.details}
                    onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                    required
                  ></textarea>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', marginBottom: '40px', marginTop: '30px' }}>
              <button type="button" className="sa-btn sa-btn--outline" onClick={handleCancel}>
                <IonIcon icon={closeOutline} /> Cancel
              </button>
              <button type="submit" className="sa-btn sa-btn--primary" disabled={isSubmitting}>
                <IonIcon icon={saveOutline} /> {isSubmitting ? 'Saving...' : 'Save Branch'}
              </button>
            </div>
          </form>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default CreateBranchPage;
