import React from 'react';
import {
  IonPage,
  IonContent,
  IonHeader,
  IonToolbar,
  IonButtons,
  IonMenuButton,
  IonTitle,
  IonIcon,
} from '@ionic/react';
import { alertCircleOutline, arrowBackOutline } from 'ionicons/icons';
import { useHistory, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import { ROUTES } from '../constants/routes.constant';

const NotFoundPage: React.FC = () => {
  const history = useHistory();
  const location = useLocation();
  const { user } = useAuthStore();

  const getDashboardRoute = () => {1
    if (!user?.role) return ROUTES.AUTH.LOGIN;
    switch (user.role) {
      case 'SUPER_ADMIN':
        return ROUTES.SUPER_ADMIN.DASHBOARD;
      case 'BRANCH_ADMIN':
        return ROUTES.BRANCH_ADMIN.DASHBOARD;
      case 'HEALER':
        return ROUTES.HEALER.DASHBOARD;
      case 'PATIENT':
        return ROUTES.PATIENT.DASHBOARD;
      default:
        return ROUTES.AUTH.LOGIN;
    }
  };

  const handleGoBack = () => {
    history.push(getDashboardRoute());
  };

  return (
    <IonPage className="sa-page">

      <IonContent className="sa-page__content" fullscreen>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          padding: '20px',
        }}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            padding: '48px 40px',
            maxWidth: '520px',
            textAlign: 'center',
            boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
          }}>
            {/* 404 Large Number */}
            <div style={{
              fontSize: '80px',
              fontWeight: 800,
              color: '#0D5C46',
              lineHeight: 1,
              marginBottom: '8px',
              letterSpacing: '-2px',
              opacity: 0.15,
            }}>
              404
            </div>

            {/* Icon */}
            <div style={{
              color: '#f59e0b',
              fontSize: '48px',
              marginBottom: '16px',
            }}>
              <IonIcon icon={alertCircleOutline} />
            </div>

            {/* Heading */}
            <h2 style={{
              fontSize: '22px',
              fontWeight: 700,
              margin: '0 0 12px 0',
              color: '#1e293b',
            }}>
              Page Not Found
            </h2>

            {/* Description */}
            <p style={{
              color: '#64748b',
              fontSize: '14px',
              lineHeight: 1.6,
              margin: '0 0 8px 0',
            }}>
              The page you're looking for doesn't exist or has been moved.
            </p>

            {/* Path display */}
            <p style={{
              color: '#94a3b8',
              fontSize: '12px',
              lineHeight: 1.5,
              margin: '0 0 28px 0',
              fontFamily: 'monospace',
              background: '#f8fafc',
              padding: '8px 16px',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              wordBreak: 'break-all',
            }}>
              {location.pathname}
            </p>

            {/* Go Back Button */}
            <button
              onClick={handleGoBack}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 28px',
                backgroundColor: '#0D5C46',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 2px 8px rgba(13, 92, 70, 0.3)',
              }}
              onMouseOver={(e) => {
                (e.currentTarget as HTMLElement).style.backgroundColor = '#0a4a38';
                (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)';
                (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 12px rgba(13, 92, 70, 0.4)';
              }}
              onMouseOut={(e) => {
                (e.currentTarget as HTMLElement).style.backgroundColor = '#0D5C46';
                (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 8px rgba(13, 92, 70, 0.3)';
              }}
            >
              <IonIcon icon={arrowBackOutline} style={{ fontSize: '18px' }} />
              Go to Dashboard
            </button>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default NotFoundPage;
