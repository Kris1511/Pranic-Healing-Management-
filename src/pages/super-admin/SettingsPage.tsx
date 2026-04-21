import React, { useState } from 'react';
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

const SettingsPage: React.FC = () => {
  const [profile, setProfile] = useState({
    fullName: 'Aria Seraphina',
    email: 'aria@sanctuary.com',
    phone: '+91 98 765 43210',
    role: 'Super Admin',
    region: 'North America',
    language: 'English (US)',
  });

  const handleChange = (field: string, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

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
              <div className="sa-page__toolbar-avatar">AS</div>
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
              <div className="sa-settings__avatar">AS</div>
              <h2 className="sa-settings__name">Aria Seraphina</h2>
              <span className="sa-settings__role-badge">Super Admin</span>
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
                <label className="sa-settings__label">Region</label>
                <input
                  className="sa-settings__input"
                  value={profile.region}
                  onChange={e => handleChange('region', e.target.value)}
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
                <button className="sa-btn sa-btn--outline">Cancel</button>
                <button className="sa-btn sa-btn--primary">Save Changes</button>
              </div>
            </div>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default SettingsPage;
