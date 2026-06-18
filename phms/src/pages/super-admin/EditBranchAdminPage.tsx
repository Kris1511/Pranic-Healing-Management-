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
import { useHistory, useParams } from 'react-router-dom';
import { ROUTES } from '../../constants/routes.constant';
import { getBranches } from '../../api/branch.api';
import { getBranchAdminById, updateBranchAdmin } from '../../api/branchAdmin.api';
import './super-admin.css';

const EditBranchAdminPage: React.FC = () => {
  const history = useHistory();
  const { id } = useParams<{ id: string }>();
  const [formData, setFormData] = useState({
    adminName: '',
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
    status: 'active',
  });

  const [availableBranches, setAvailableBranches] = useState<any[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingIdProof, setExistingIdProof] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Fetch branches
        const branchesResponse = await getBranches();
        setAvailableBranches(branchesResponse.data || []);

        // Fetch admin details
        const adminResponse = await getBranchAdminById(id);
        if (adminResponse.success && adminResponse.data) {
          const adminData = adminResponse.data;
          setFormData({
            adminName: adminData.user?.name || adminData.name || '',
            password: '', // Keep blank unless resetting
            email: adminData.user?.email || adminData.email || '',
            phone: adminData.user?.phoneNumber || adminData.phoneNumber || adminData.phone || '',
            dob: adminData.dob || '',
            gender: adminData.gender || 'Male',
            addressLine1: adminData.addressLine1 || '',
            addressLine2: adminData.addressLine2 || '',
            city: adminData.city || '',
            district: adminData.district || '',
            state: adminData.state || '',
            pincode: adminData.pincode || '',
            idProof: null,
            assignedBranch: adminData.branchId || '',
            status: adminData.user?.status || adminData.status || 'active',
          });
          setExistingIdProof(adminData.idProof);
        }
      } catch (error) {
        console.error('Error loading branch admin data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  const handleUpdate = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const data = new FormData();
      data.append('name', formData.adminName);
      if (formData.password) data.append('password', formData.password);
      data.append('email', formData.email);
      data.append('phone', formData.phone);
      data.append('branchId', formData.assignedBranch);
      
      data.append('dob', formData.dob || '');
      data.append('gender', formData.gender);
      data.append('addressLine1', formData.addressLine1 || '');
      data.append('addressLine2', formData.addressLine2 || '');
      data.append('city', formData.city || '');
      data.append('district', formData.district || '');
      data.append('state', formData.state || '');
      data.append('pincode', formData.pincode || '');
      data.append('status', formData.status);

      if (formData.idProof) {
        data.append('idProof', formData.idProof);
      }

      await updateBranchAdmin(id, data);
      history.push(ROUTES.SUPER_ADMIN.BRANCH_ADMINS);
    } catch (error) {
      console.error('Error updating branch admin:', error);
      alert('Failed to update branch admin. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    history.push(ROUTES.SUPER_ADMIN.BRANCH_ADMINS);
  };

  if (loading) {
    return (
      <IonPage className="sa-page">
        <IonContent className="sa-page__content">
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--ion-color-medium)' }}>
            Loading administrator data...
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
            <IonBackButton defaultHref={ROUTES.SUPER_ADMIN.BRANCH_ADMINS} text="" />
          </IonButtons>
          <IonTitle className="sa-page__toolbar-title">Edit Branch Admin</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="sa-page__content">
        <div className="sa-page__body">
          <div className="sa-page__header">
            <h1 className="sa-page__title">Edit Administrator</h1>
            <p className="sa-page__subtitle">Update account details and branch assignment.</p>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); handleUpdate(); }} className="sa-form-layout">
            <div className="sa-section">
              <div className="sa-section__header">
                <div>
                  <h2 className="sa-section__title">Admin Details</h2>
                  <p className="sa-section__subtitle">Personal and account information</p>
                </div>
              </div>

              <div className="sa-settings__form-grid">
                <div className="sa-settings__form-group">
                  <label className="sa-settings__label">
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
                  <label className="sa-settings__label">
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
                  <label className="sa-settings__label">
                    <IonIcon icon={lockClosedOutline} style={{ marginRight: '8px' }} />
                    Password
                  </label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="sa-settings__input"
                      placeholder="Leave blank to keep current password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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
                  <label className="sa-settings__label">
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
                  <label className="sa-settings__label">
                    <IonIcon icon={calendarOutline} style={{ marginRight: '8px' }} />
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    className="sa-settings__input"
                    value={formData.dob}
                    onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                  />
                </div>

                <div className="sa-settings__form-group">
                  <label className="sa-settings__label">
                    <IonIcon icon={maleFemaleOutline} style={{ marginRight: '8px' }} />
                    Gender
                  </label>
                  <select
                    className="sa-settings__input"
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="sa-settings__form-group">
                  <label className="sa-settings__label">
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
                  <label className="sa-settings__label">
                    <IonIcon icon={personOutline} style={{ marginRight: '8px' }} />
                    Status
                  </label>
                  <select
                    className="sa-settings__input"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    required
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                <div className="sa-settings__form-group">
                  <label className="sa-settings__label">
                    <IonIcon icon={locationOutline} style={{ marginRight: '8px' }} />
                    Address Line 1
                  </label>
                  <input
                    className="sa-settings__input"
                    placeholder="Building / Street name"
                    value={formData.addressLine1}
                    onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
                  />
                </div>

                <div className="sa-settings__form-group">
                  <label className="sa-settings__label">
                    <IonIcon icon={locationOutline} style={{ marginRight: '8px' }} />
                    Address Line 2
                  </label>
                  <input
                    className="sa-settings__input"
                    placeholder="Area / Landmark (optional)"
                    value={formData.addressLine2}
                    onChange={(e) => setFormData({ ...formData, addressLine2: e.target.value })}
                  />
                </div>

                <div className="sa-settings__form-group">
                  <label className="sa-settings__label">City</label>
                  <input
                    className="sa-settings__input"
                    placeholder="City name"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  />
                </div>
                <div className="sa-settings__form-group">
                  <label className="sa-settings__label">District</label>
                  <input
                    className="sa-settings__input"
                    placeholder="District name"
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                  />
                </div>

                <div className="sa-settings__form-group">
                  <label className="sa-settings__label">State</label>
                  <input
                    className="sa-settings__input"
                    placeholder="State name"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  />
                </div>
                <div className="sa-settings__form-group">
                  <label className="sa-settings__label">Pincode</label>
                  <input
                    className="sa-settings__input"
                    placeholder="Postal code"
                    value={formData.pincode}
                    onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                  />
                </div>

                <div className="sa-settings__form-group">
                  <label className="sa-settings__label">
                    <IonIcon icon={documentAttachOutline} style={{ marginRight: '8px' }} />
                    Update ID Proof (Aadhaar / PAN)
                  </label>
                  <input
                    type="file"
                    className="sa-settings__input"
                    style={{ padding: '10px', width: '100%' }}
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        setFormData({ ...formData, idProof: e.target.files[0] });
                      }
                    }}
                  />
                  {existingIdProof && (
                    <div style={{ marginTop: '8px', fontSize: '13px' }}>
                      Existing ID Proof:{' '}
                      <a
                        href={`${(import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api').replace('/api', '')}/${existingIdProof}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: 'var(--color-primary)', textDecoration: 'underline' }}
                      >
                        View Proof
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', marginTop: '24px' }}>
              <button type="button" className="sa-btn sa-btn--outline" onClick={handleCancel}>
                <IonIcon icon={closeOutline} /> Cancel
              </button>
              <button type="submit" className="sa-btn sa-btn--primary" disabled={isSubmitting}>
                <IonIcon icon={saveOutline} /> {isSubmitting ? 'Updating...' : 'Update Administrator'}
              </button>
            </div>
          </form>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default EditBranchAdminPage;
