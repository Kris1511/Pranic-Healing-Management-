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
  IonAlert,
} from '@ionic/react';
import {
  saveOutline,
  closeOutline,
  homeOutline,
  personOutline,
  lockClosedOutline,
  mailOutline,
  callOutline,
  calendarOutline,
  maleFemaleOutline,
  locationOutline,
  documentAttachOutline,
  eyeOutline,
  eyeOffOutline,
} from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { ROUTES } from '../../constants/routes.constant';
import { getBranches } from '../../api/branch.api';
import { createUser } from '../../api/user.api';
import './super-admin.css';

const CreateBranchAdminPage: React.FC = () => {
  const history = useHistory();
  const [formData, setFormData] = useState({
    adminName: '',
    username: '',
    password: '',
    email: '',
    phone: '',
    dob: '',
    gender: 'Male',
    addressLine1: '',
    addressLine2: '',
    city: '',
    district: '',
    state: '',
    pincode: '',
    idProof: null as any,
    assignedBranch: '',
  });

  const [availableBranches, setAvailableBranches] = useState<any[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertHeader, setAlertHeader] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [alertButtons, setAlertButtons] = useState<any[]>(['OK']);

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const response = await getBranches();
        setAvailableBranches(response.data || []);
      } catch (error) {
        console.error('Error fetching branches:', error);
      }
    };
    fetchBranches();
  }, []);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAssign = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const payload = {
        name: formData.adminName,
        username: formData.username,
        password: formData.password,
        email: formData.email,
        phone: formData.phone,
        branchId: formData.assignedBranch || null,
        role: 'BRANCH_ADMIN'
      };

      await createUser(payload);

      console.log('Successfully created Branch Admin:', payload);
      setAlertHeader('Success');
      setAlertMessage('Branch admin created successfully.');
      setAlertButtons([{
        text: 'OK',
        handler: () => {
          setFormData({
            adminName: '',
            username: '',
            password: '',
            email: '',
            phone: '',
            dob: '',
            gender: 'Male',
            addressLine1: '',
            addressLine2: '',
            city: '',
            district: '',
            state: '',
            pincode: '',
            idProof: null as any,
            assignedBranch: '',
          });
          const fileInput = document.getElementById('idProofInput') as HTMLInputElement;
          if (fileInput) fileInput.value = '';
        }
      }]);
      setShowAlert(true);
    } catch (error: any) {
      console.error('Error creating branch admin:', error);
      const errorMessage = error?.response?.data?.message || 'Failed to create branch admin. Please try again.';
      setAlertHeader('Error');
      setAlertMessage(errorMessage);
      setAlertButtons(['OK']);
      setShowAlert(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    history.push(ROUTES.SUPER_ADMIN.DASHBOARD);
  };

  return (
    <IonPage className="sa-page">
      <IonHeader className="ion-no-border">
        <IonToolbar className="sa-page__toolbar">
          <IonButtons slot="start">
            <IonBackButton defaultHref={ROUTES.SUPER_ADMIN.DASHBOARD} text="" />
          </IonButtons>
          <IonTitle className="sa-page__toolbar-title">Create Branch Admin</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="sa-page__content">
        <div className="sa-page__body">
          <div className="sa-page__header">
            <h1 className="sa-page__title">Create Branch Admin</h1>
            <p className="sa-page__subtitle">Create a new admin account and assign them to a branch.</p>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); handleAssign(); }} className="sa-form-layout">
            <div className="sa-section">
              <div className="sa-section__header">
                <div>
                  <h2 className="sa-section__title">Admin Details</h2>
                  <p className="sa-section__subtitle">Personal and account information</p>
                </div>
              </div>

              <div className="sa-settings__form-grid">
                <div className="sa-settings__form-group">
                  <label className="sa-settings__label sa-label--required">
                    <IonIcon icon={personOutline} style={{ marginRight: '8px' }} />
                    Admin Name
                  </label>
                  <input
                    className="sa-settings__input"
                    placeholder="Full name"
                    value={formData.adminName}
                    onChange={(e) => setFormData({ ...formData, adminName: e.target.value })}
                    required
                  />
                </div>

                <div className="sa-settings__form-group">
                  <label className="sa-settings__label sa-label--required">
                    <IonIcon icon={personOutline} style={{ marginRight: '8px' }} />
                    Username
                  </label>
                  <input
                    className="sa-settings__input"
                    placeholder="Login name"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    required
                    autoComplete="off"
                  />
                </div>

                <div className="sa-settings__form-group">
                  <label className="sa-settings__label sa-label--required">
                    <IonIcon icon={lockClosedOutline} style={{ marginRight: '8px' }} />
                    Password
                  </label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="sa-settings__input"
                      placeholder="Secure password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                      autoComplete="new-password"
                      style={{ paddingRight: '40px', width: '100%' }}
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
                        color: 'var(--color-text-muted)',
                        display: 'flex',
                        alignItems: 'center',
                        padding: 0
                      }}
                      title={showPassword ? "Hide password" : "Show password"}
                    >
                      <IonIcon icon={showPassword ? eyeOffOutline : eyeOutline} style={{ fontSize: '20px' }} />
                    </button>
                  </div>
                </div>

                <div className="sa-settings__form-group">
                  <label className="sa-settings__label sa-label--required">
                    <IonIcon icon={mailOutline} style={{ marginRight: '8px' }} />
                    Email ID
                  </label>
                  <input
                    type="email"
                    className="sa-settings__input"
                    placeholder="Email address"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>

                <div className="sa-settings__form-group">
                  <label className="sa-settings__label sa-label--required">
                    <IonIcon icon={callOutline} style={{ marginRight: '8px' }} />
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    className="sa-settings__input"
                    placeholder="Phone number"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                  />
                </div>

                <div className="sa-settings__form-group">
                  <label className="sa-settings__label sa-label--required">
                    <IonIcon icon={calendarOutline} style={{ marginRight: '8px' }} />
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    className="sa-settings__input"
                    value={formData.dob}
                    onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                    required
                  />
                </div>

                <div className="sa-settings__form-group">
                  <label className="sa-settings__label sa-label--required">
                    <IonIcon icon={maleFemaleOutline} style={{ marginRight: '8px' }} />
                    Gender
                  </label>
                  <select
                    className="sa-settings__input"
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    required
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="sa-settings__form-group">
                  <label className="sa-settings__label sa-label--required">
                    <IonIcon icon={homeOutline} style={{ marginRight: '8px' }} />
                    Assigned Branch
                  </label>
                  <select
                    className="sa-settings__input"
                    value={formData.assignedBranch}
                    onChange={(e) => setFormData({ ...formData, assignedBranch: e.target.value })}
                    required
                  >
                    <option value="">Select a Branch</option>
                    {availableBranches.map((branch, idx) => (
                      <option key={idx} value={branch.id}>{branch.name}</option>
                    ))}
                  </select>
                </div>

                <div className="sa-settings__form-group">
                  <label className="sa-settings__label sa-label--required">
                    <IonIcon icon={locationOutline} style={{ marginRight: '8px' }} />
                    Address
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

                <div className="sa-settings__form-group">
                  <label className="sa-settings__label sa-label--required">
                    <IonIcon icon={documentAttachOutline} style={{ marginRight: '8px' }} />
                    Upload ID Proof (Aadhaar / PAN)
                  </label>
                  <input
                    type="file"
                    id="idProofInput"
                    className="sa-settings__input"
                    style={{ padding: '10px', width: '100%' }}
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        setFormData({ ...formData, idProof: e.target.files[0] });
                      }
                    }}
                    required
                  />
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', marginTop: '24px' }}>
              <button type="button" className="sa-btn sa-btn--outline" onClick={handleCancel}>
                <IonIcon icon={closeOutline} /> Cancel
              </button>
              <button type="submit" className="sa-btn sa-btn--primary" disabled={isSubmitting}>
                <IonIcon icon={saveOutline} /> {isSubmitting ? 'Creating...' : 'Create Admin'}
              </button>
            </div>
          </form>
        </div>
      </IonContent>
      <IonAlert
        isOpen={showAlert}
        onDidDismiss={() => setShowAlert(false)}
        header={alertHeader}
        message={alertMessage}
        buttons={alertButtons}
      />
    </IonPage>
  );
};

export default CreateBranchAdminPage;