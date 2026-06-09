import React, { useState, useEffect } from 'react';
import {
  IonPage,
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonIcon,
  IonBackButton,
} from '@ionic/react';
import {
  folderOutline,
  codeOutline,
  documentTextOutline,
  calendarOutline,
  personOutline,
  timeOutline,
  checkmarkCircleOutline,
} from 'ionicons/icons';
import { useParams } from 'react-router-dom';
import { ROUTES } from '../../constants/routes.constant';
import './super-admin.css';

const SATreatmentCategoryDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [category, setCategory] = useState<any>(null);

  useEffect(() => {
    const savedCategories = localStorage.getItem('ph_treatment_categories');
    if (savedCategories) {
      const allCategories = JSON.parse(savedCategories);
      const foundCategory = allCategories.find((c: any) => c.id.toString() === id);
      setCategory(foundCategory);
    }
  }, [id]);

  if (!category) {
    return (
      <IonPage>
        <IonContent>
          <div style={{ padding: '20px', textAlign: 'center' }}>Loading category details...</div>
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
          <IonTitle className="sa-page__toolbar-title">Category Details</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="sa-page__content">
        <div className="sa-page__body">
          <div className="sa-page__header">
            <h1 className="sa-page__title">{category.name}</h1>
            <p className="sa-page__subtitle">Detailed overview and metadata for this treatment category</p>
          </div>

          <div className="sa-section">
            <SectionHeader icon={folderOutline} title="Basic Information" />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
              <InfoItem 
                label="Category Name" 
                value={category.name} 
                icon={folderOutline} 
              />
              <InfoItem 
                label="Category Code" 
                value={category.code || 'Not Assigned'} 
                icon={codeOutline} 
              />
              <InfoItem 
                label="Status" 
                value={category.status} 
                icon={checkmarkCircleOutline}
                isBadge={true}
              />
              <InfoItem 
                label="Total Treatment Type" 
                value={category.treatmentCount.toString()} 
                icon={documentTextOutline} 
              />
            </div>

            <div style={{ marginTop: '32px' }}>
              <InfoItem 
                label="Description" 
                value={category.description || 'No description provided.'} 
                icon={documentTextOutline} 
                fullWidth={true}
              />
            </div>
          </div>

          <div className="sa-section">
            <SectionHeader icon={calendarOutline} title="System Metadata" />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
              <InfoItem 
                label="Created Date" 
                value={new Date(category.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })} 
                icon={calendarOutline} 
              />
              <InfoItem 
                label="Created By" 
                value={category.createdBy || 'Super Admin'} 
                icon={personOutline} 
              />
              {/* <InfoItem 
                label="Last Updated" 
                value={category.lastUpdated ? new Date(category.lastUpdated).toLocaleString('en-GB') : 'N/A'} 
                icon={timeOutline} 
              /> */}
            </div>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

const SectionHeader: React.FC<{ icon: string, title: string }> = ({ icon, title }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
    <IonIcon icon={icon} style={{ color: 'var(--color-primary)', fontSize: '20px' }} />
    <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: '#1e293b' }}>{title}</h2>
  </div>
);

const InfoItem: React.FC<{ label: string, value: string, icon: string, fullWidth?: boolean, isBadge?: boolean }> = ({ label, value, icon, fullWidth, isBadge }) => (
  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', gridColumn: fullWidth ? 'span 2' : 'span 1' }}>
    <div style={{ background: '#f0fdf4', padding: '10px', borderRadius: '10px', color: '#16a34a' }}>
      <IonIcon icon={icon} style={{ fontSize: '20px', display: 'block' }} />
    </div>
    <div>
      <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: '4px' }}>{label}</div>
      {isBadge ? (
        <span className={`sa-badge sa-badge--${value.toLowerCase()}`} style={{ fontSize: '12px' }}>
          {value}
        </span>
      ) : (
        <div style={{ fontSize: '15px', color: '#1e293b', fontWeight: 500, lineHeight: '1.5' }}>{value}</div>
      )}
    </div>
  </div>
);

export default SATreatmentCategoryDetailsPage;