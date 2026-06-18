import React from 'react';
import {
  IonPage,
  IonContent,
  IonButton,
  IonIcon,
  IonText,
  IonCard,
  IonCardContent,
} from '@ionic/react';
import { alertCircleOutline, logInOutline } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { ROUTES } from '../../constants/routes.constant';

const SessionExpiredPage: React.FC = () => {
  const history = useHistory();

  const handleGoToSignIn = () => {
    history.push(ROUTES.AUTH.LOGIN);
  };

  return (
    <IonPage>
      <IonContent className="ion-padding" color="light">
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
          }}
        >
          <IonCard style={{ maxWidth: '400px', width: '100%', textAlign: 'center', padding: '20px' }}>
            <IonCardContent>
              <IonIcon
                icon={alertCircleOutline}
                color="warning"
                style={{ fontSize: '80px', marginBottom: '16px' }}
              />
              <IonText color="dark">
                <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '12px' }}>
                  Session Expired
                </h2>
              </IonText>
              <IonText color="medium">
                <p style={{ fontSize: '16px', lineHeight: '1.5', marginBottom: '32px' }}>
                  Firebase ID token has expired. Please sign in again to continue.
                </p>
              </IonText>
              
              <IonButton
                expand="block"
                shape="round"
                onClick={handleGoToSignIn}
              >
                <IonIcon slot="start" icon={logInOutline} />
                Go Back to Sign In
              </IonButton>
            </IonCardContent>
          </IonCard>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default SessionExpiredPage;
