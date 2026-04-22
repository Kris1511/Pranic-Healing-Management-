import React from 'react';
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
  homeOutline,
  locationOutline,
  callOutline,
  calendarOutline,
  peopleOutline,
  barChartOutline,
  flashOutline,
  informationCircleOutline,
} from 'ionicons/icons';
import { useParams } from 'react-router-dom';
import './super-admin.css';

const BranchDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  // Mock data for the detailed view
  const branchData = {
    name: id ? decodeURIComponent(id) : 'Uptown Sanctuary',
    region: 'Northern Region',
    status: 'active',
    admin: 'John Admin',
    phone: '0876543210',
    est: '2023-01-16',
    address: '123 Healing Road, Northern District, City Plaza, 110045',
    details: 'The Uptown Sanctuary is a premier healing branch specializing in advanced pranic protocols. Established to serve the growing community in the northern region, it features state-of-the-art meditation halls and multiple dedicated private healing rooms. Our mission is to provide a serene space for recovery and spiritual growth.',
    stats: [
      { label: 'Total Sessions', value: '1,248', icon: flashOutline },
      { label: 'Monthly Revenue', value: '₹145k', icon: barChartOutline },
      { label: 'Staff Count', value: '12', icon: peopleOutline },
      { label: 'Active Patients', value: '86', icon: peopleOutline }
    ]
  };

  return (
    <IonPage className="sa-page">
      <IonHeader className="ion-no-border">
        <IonToolbar className="sa-page__toolbar">
          <IonButtons slot="start">
            <IonBackButton defaultHref="/super-admin/branches" />
          </IonButtons>
          <IonTitle className="sa-page__toolbar-title">Branch Overview</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="sa-page__content">
        <div className="sa-page__body">
          {/* Header Section */}
          <div className="sa-page__header">
            <div className="sa-page__header-row">
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div className="sa-branch-card__icon" style={{ width: '56px', height: '56px', fontSize: '24px' }}>
                  <IonIcon icon={homeOutline} />
                </div>
                <div>
                  <h1 className="sa-page__title">{branchData.name}</h1>
                  <p className="sa-page__subtitle">
                    <IonIcon icon={locationOutline} /> {branchData.region} • Established {branchData.est}
                  </p>
                </div>
              </div>
              <span className={`sa-badge sa-badge--${branchData.status}`} style={{ padding: '6px 16px', fontSize: '13px' }}>
                {branchData.status}
              </span>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="sa-stats sa-stats--4">
            {branchData.stats.map((stat, i) => (
              <div className="sa-stat-card" key={i}>
                <div>
                  <div className="sa-stat-card__label">{stat.label}</div>
                  <div className="sa-stat-card__value" style={{ fontSize: '24px' }}>{stat.value}</div>
                </div>
                <div className="sa-stat-card__icon">
                  <IonIcon icon={stat.icon} />
                </div>
              </div>
            ))}
          </div>

          <div className="sa-grid-2">
            <div>
              {/* Branch Overview */}
              <div className="sa-section">
                <div className="sa-section__header">
                  <h2 className="sa-section__title">
                    <IonIcon icon={informationCircleOutline} style={{ marginRight: '8px', color: 'var(--color-primary)' }} />
                    About this Sanctuary
                  </h2>
                </div>
                <p style={{ lineHeight: '1.6', color: 'var(--color-text-secondary)', fontSize: '15px' }}>
                  {branchData.details}
                </p>
              </div>

              {/* Location & Contact */}
              <div className="sa-section">
                <div className="sa-section__header">
                  <h2 className="sa-section__title">
                    <IonIcon icon={locationOutline} style={{ marginRight: '8px', color: 'var(--color-primary)' }} />
                    Location & Contact
                  </h2>
                </div>
                <div className="sa-settings__form">
                  <div className="sa-settings__form-group">
                    <label className="sa-settings__label">Physical Address</label>
                    <p style={{ marginBottom: '16px', fontSize: '14px' }}>{branchData.address}</p>
                  </div>
                  <div className="sa-settings__form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div className="sa-settings__form-group">
                      <label className="sa-settings__label">Contact Number</label>
                      <div className="sa-branch-card__meta-item" style={{ fontSize: '14px' }}>
                        <IonIcon icon={callOutline} /> {branchData.phone}
                      </div>
                    </div>
                    <div className="sa-settings__form-group">
                      <label className="sa-settings__label">Geographic Region</label>
                      <div className="sa-branch-card__meta-item" style={{ fontSize: '14px' }}>
                        <IonIcon icon={locationOutline} /> {branchData.region}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              {/* Administration */}
              <div className="sa-section">
                <div className="sa-section__header">
                  <h2 className="sa-section__title">Administration</h2>
                </div>
                <div className="sa-branch-card__admin" style={{ cursor: 'default' }}>
                  <div>
                    <div className="sa-branch-card__admin-label">Primary Branch Admin</div>
                    <div className="sa-branch-card__admin-name" style={{ fontSize: '16px' }}>{branchData.admin}</div>
                  </div>
                  <div className="sa-page__toolbar-avatar" style={{ background: 'var(--color-primary-dark)' }}>
                    {branchData.admin.split(' ').map(n => n[0]).join('')}
                  </div>
                </div>
                <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginTop: '12px' }}>
                  Admin is responsible for practitioner attendance, financial reconciliation, and branch-level patient reporting.
                </p>
              </div>

              {/* Maintenance & Compliance */}
              {/* <div className="sa-section">
                <h2 className="sa-section__title" style={{ fontSize: '16px', marginBottom: '16px' }}>Compliance Status</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '14px' }}>License Renewal</span>
                    <span className="sa-badge sa-badge--active">Current</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '14px' }}>Safety Inspection</span>
                    <span className="sa-badge sa-badge--active">Passed</span>
                  </div>
                </div>
              </div> */}
            </div>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default BranchDetailsPage;
