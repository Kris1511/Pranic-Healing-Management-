import React, { useState, useEffect } from 'react';
import {
  IonPage,
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonIcon,
  IonMenuButton,
} from '@ionic/react';
import { notificationsOutline } from 'ionicons/icons';
import './super-admin.css';
import { useAuthStore } from '../../store/auth.store';
import ProfileDropdown from '../../components/common/ProfileDropdown';


const SettingsPage: React.FC = () => {
  const { user, updateUser } = useAuthStore();

  const [profile, setProfile] = useState({
    fullName: '',
    email: '',
    phone: '',
    role: '',
    branch: '',
    language: 'English (US)',
  });

  useEffect(() => {
    if (user) {
      setProfile({
        fullName: user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Super Admin',
        email: user.email || '',
        phone: user.phoneNumber || '',
        role: user.role || 'Super Admin',
        branch: user.branchName || user.branch || 'Headquarters',
        language: 'English (US)',
      });
    }
  }, [user]);

  const handleChange = (field: string, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    if (user) {
      updateUser({
        name: profile.fullName,
        email: profile.email,
        phoneNumber: profile.phone,
        // Since we combined firstName and lastName into fullName for display,
        // you might want to split them back, or just use `name`.
      });
    }
    // TODO: Integrate with backend API to persist changes
  };

  const getInitials = (name: string) => {
    if (!name) return 'SA';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const initials = getInitials(profile.fullName);

  return (
    <IonPage className="sa-page">
      <IonHeader className="ion-no-border">
        <IonToolbar className="sa-page__toolbar">
          <IonButtons slot="start">
            <IonMenuButton />
          </IonButtons>
          <IonTitle className="sa-page__toolbar-title">Settings</IonTitle>
          <IonButtons slot="end">
            <div className="sa-page__toolbar-actions">
              <IonButton fill="clear">
                <IonIcon icon={notificationsOutline} />
              </IonButton>
              <ProfileDropdown />
            </div>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent className="sa-page__content">
        <div className="sa-page__body">
          {/* Page Header */}
          <div className="sa-page__header">
            <h1 className="sa-page__title" style={{ color: 'var(--color-primary)' }}>Settings</h1>
            <p className="sa-page__subtitle">Manage your system preferences</p>
          </div>

          {/* Profile Header Card */}
          <div className="sa-section">
            <div className="sa-settings__profile-header">
              <div className="sa-settings__avatar">{initials}</div>
              <h2 className="sa-settings__name">{profile.fullName || 'User Name'}</h2>
              <span className="sa-settings__role-badge">{profile.role || 'Super Admin'}</span>
              <div>
                <span className="sa-settings__change-photo">Change Photo</span>
              </div>
            </div>
          </div>

          {/* Profile Details Form */}
          <div className="sa-section">
            <h2 className="sa-section__title" style={{ color: 'var(--color-primary)', marginBottom: 24 }}>
              Profile Details
            </h2>

            <div className="sa-settings__form">
              <div className="sa-settings__form-group sa-settings__form-group--full">
                <label className="sa-settings__label">Full Name</label>
                <input
                  className="sa-settings__input"
                  value={profile.fullName}
                  onChange={e => handleChange('fullName', e.target.value)}
                />
              </div>

              <div className="sa-settings__form-group sa-settings__form-group--full">
                <label className="sa-settings__label">Email Address</label>
                <input
                  className="sa-settings__input"
                  value={profile.email}
                  onChange={e => handleChange('email', e.target.value)}
                />
              </div>

              <div className="sa-settings__form-group sa-settings__form-group--full">
                <label className="sa-settings__label">Phone Number</label>
                <input
                  className="sa-settings__input"
                  value={profile.phone}
                  onChange={e => handleChange('phone', e.target.value)}
                />
              </div>

              <div className="sa-settings__form-group">
                <label className="sa-settings__label">Role</label>
                <input className="sa-settings__input" value={profile.role} readOnly style={{ opacity: 0.7 }} />
              </div>

              <div className="sa-settings__form-group">
                <label className="sa-settings__label">Branch / Region</label>
                <input
                  className="sa-settings__input"
                  value={profile.branch}
                  readOnly
                  style={{ opacity: 0.7 }}
                />
              </div>

              <div className="sa-settings__form-group sa-settings__form-group--full">
                <label className="sa-settings__label">Language</label>
                <input
                  className="sa-settings__input"
                  value={profile.language}
                  onChange={e => handleChange('language', e.target.value)}
                />
              </div>

              <div className="sa-settings__actions">
                <button className="sa-btn sa-btn--outline" onClick={() => {
                  // Reset form to user defaults
                  if (user) {
                     setProfile({
                        fullName: user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Super Admin',
                        email: user.email || '',
                        phone: user.phoneNumber || '',
                        role: user.role || 'Super Admin',
                        branch: user.branchName || user.branch || 'Headquarters',
                        language: 'English (US)',
                      });
                  }
                }}>Cancel</button>
                <button className="sa-btn sa-btn--primary" onClick={handleSave}>Save Changes</button>
              </div>
            </div>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default SettingsPage;
