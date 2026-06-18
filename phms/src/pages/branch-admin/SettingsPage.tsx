import React, { useState } from 'react';
import {
  IonPage,
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonIcon,
  IonMenuButton,
} from '@ionic/react';
import {
  notificationsOutline,
  checkmarkCircleOutline,
  businessOutline,
} from 'ionicons/icons';
import { useAuthStore } from '../../store/auth.store';
import '../super-admin/super-admin.css';
import './branch-admin.css';

const SettingsPage: React.FC = () => {
  const { user } = useAuthStore();

  // Dynamic prefill branch info
  const rawBranch = typeof user?.branch === 'object' && user?.branch !== null
    ? (user.branch as any).name
    : (user?.branch || 'Salem');
  const isSalem = rawBranch.toLowerCase().includes('salem');
  const isMumbai = rawBranch.toLowerCase().includes('mumbai');

  const defaultBranchName = isSalem ? 'Salem PH Center' : (isMumbai ? 'Mumbai PH Center' : `${rawBranch} PH Center`);
  const defaultEmail = isSalem ? 'salem@pranichealing.com' : (isMumbai ? 'mumbai@pranichealing.com' : `${rawBranch.toLowerCase().replace(/ /g, '')}@pranichealing.com`);
  const defaultContact = isSalem ? '+91 98765 43210' : (isMumbai ? '+91 99112 23344' : '+91 98765 00000');
  const defaultAddress = isSalem 
    ? '12/B Heritage Plaza, Omalur Main Road, Salem, Tamil Nadu, 636004' 
    : (isMumbai ? '404 Corporate Park, Omalur Main Road, Mumbai, Maharashtra, 400001' : '123 Spiritual Pathway, Healing Center');

  const [showToastMessage, setShowToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setShowToastMessage(msg);
    setTimeout(() => setShowToastMessage(null), 3000);
  };

  // Center Profile Configuration State
  const [centerForm, setCenterForm] = useState({
    name: defaultBranchName,
    contact: defaultContact,
    email: defaultEmail,
    address: defaultAddress,
    timezone: 'Asia/Kolkata (IST)',
    emergencyContact: '+91 91100 91100',
    operatingHours: '9 AM - 6 PM',
  });
  const [savedCenterForm, setSavedCenterForm] = useState({ ...centerForm });
  const [logoUploaded, setLogoUploaded] = useState<boolean>(true);

  // Actions
  const handleSaveCenter = () => {
    setSavedCenterForm({ ...centerForm });
    triggerToast('Center profile settings saved successfully!');
  };

  const handleDiscardCenter = () => {
    setCenterForm({ ...savedCenterForm });
    triggerToast('Discarded changes. Restored last saved profile.');
  };

  return (
    <IonPage className="sa-page">
      <IonHeader className="ion-no-border">
        <IonToolbar className="sa-page__toolbar">
          <IonButtons slot="start">
            <IonMenuButton />
          </IonButtons>
          <IonTitle className="sa-page__toolbar-title">Branch Settings</IonTitle>
          
          <IonButtons slot="end">
            <button className="st-header-bell" title="Notifications">
              <IonIcon icon={notificationsOutline} />
            </button>
            <button className="sa-page__toolbar-avatar">BA</button>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent className="sa-page__content" fullscreen>
        <div className="sa-page__body">
          {/* Header row */}
          <div className="st-header-row">
            <div>
              <h1 className="st-page-title">Center Profile</h1>
              <p className="st-page-subtitle">
                Manage physical address coordinates, business hours, and operational contact channels.
              </p>
            </div>
          </div>

          {/* Action Toasts */}
          {showToastMessage && (
            <div className="st-toast-notification st-toast-notification--success" style={{ zIndex: 1000 }}>
              <IonIcon icon={checkmarkCircleOutline} className="toast-icon" />
              <span>{showToastMessage}</span>
            </div>
          )}

          {/* Single Content Panel without sidebar */}
          <div className="st-settings-content-panel">
            <div className="st-settings-section-header">
              <h2 className="st-settings-section-title">Center Profile Settings</h2>
              <p className="st-settings-section-desc">Keep your branch details up to date.</p>
            </div>

            {/* Logo Management */}
            <div className="sa-code-box" style={{ display: 'flex', gap: '20px', alignItems: 'center', padding: '16px', borderRadius: '8px' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '8px', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                {logoUploaded ? (
                  <div style={{ background: 'var(--color-primary)', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>Logo</div>
                ) : (
                  <IonIcon icon={businessOutline} style={{ fontSize: '32px', color: '#64748b' }} />
                )}
              </div>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 400, marginBottom: '4px', color: 'black' }}>Center Logo</div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button className="sa-btn sa-btn--sm sa-btn--outline" onClick={() => { setLogoUploaded(true); triggerToast('Logo uploaded successfully!'); }}>Upload Logo</button>
                  {logoUploaded && (
                    <button className="sa-btn sa-btn--sm sa-btn--delete-light" onClick={() => { setLogoUploaded(false); triggerToast('Logo removed.'); }}>Remove</button>
                  )}
                </div>
              </div>
            </div>

            <div className="st-form" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="st-settings-grid-row">
                <div className="st-form-group">
                  <label className="st-form-label">BRANCH NAME</label>
                  <input
                    type="text"
                    className="st-input"
                    value={centerForm.name}
                    onChange={(e) => setCenterForm({ ...centerForm, name: e.target.value })}
                  />
                </div>
                <div className="st-form-group">
                  <label className="st-form-label">BRANCH CONTACT NUMBER</label>
                  <input
                    type="text"
                    className="st-input"
                    value={centerForm.contact}
                    onChange={(e) => setCenterForm({ ...centerForm, contact: e.target.value })}
                  />
                </div>
                <div className="st-form-group">
                  <label className="st-form-label">EMERGENCY CONTACT NUMBER</label>
                  <input
                    type="text"
                    className="st-input"
                    value={centerForm.emergencyContact}
                    onChange={(e) => setCenterForm({ ...centerForm, emergencyContact: e.target.value })}
                  />
                </div>
                <div className="st-form-group">
                  <label className="st-form-label">BRANCH EMAIL ADDRESS</label>
                  <input
                    type="email"
                    className="st-input"
                    value={centerForm.email}
                    onChange={(e) => setCenterForm({ ...centerForm, email: e.target.value })}
                  />
                </div>
                <div className="st-form-group">
                  <label className="st-form-label">TIME ZONE</label>
                  <select
                    className="st-input"
                    value={centerForm.timezone}
                    onChange={(e) => setCenterForm({ ...centerForm, timezone: e.target.value })}
                  >
                    <option value="Asia/Kolkata (IST)">Asia/Kolkata (IST)</option>
                    <option value="America/New_York (EST)">America/New_York (EST)</option>
                    <option value="GMT/UTC (UTC)">GMT/UTC (UTC)</option>
                  </select>
                </div>
                 <div className="st-form-group">
                  <label className="st-form-label">OPERATING HOURS</label>
                  <input
                    type="text"
                    className="st-input"
                    value={centerForm.operatingHours}
                    onChange={(e) => setCenterForm({ ...centerForm, operatingHours: e.target.value })}
                  />
                </div>
              </div>

              <div className="st-form-group">
                <label className="st-form-label">POSTAL ADDRESS</label>
                <textarea
                  className="st-textarea"
                  rows={3}
                  value={centerForm.address}
                  onChange={(e) => setCenterForm({ ...centerForm, address: e.target.value })}
                />
              </div>
            </div>

            <div className="st-form-footer" style={{ borderTop: '1px solid #e2e8f0', paddingTop: '20px', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button className="st-btn st-btn--outline" onClick={handleDiscardCenter}>Discard</button>
              <button className="st-btn st-btn--primary" onClick={handleSaveCenter}>Save Changes</button>
            </div>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default SettingsPage;