import React from 'react';
import { IonModal, IonHeader, IonToolbar, IonTitle, IonContent, IonButton } from '@ionic/react';
import './AppModal.css';

interface AppModalProps {
  isOpen: boolean;
  onDidDismiss: () => void;
  title: string;
  children: React.ReactNode;
  actions?: {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary';
  }[];
}

const AppModal: React.FC<AppModalProps> = ({ isOpen, onDidDismiss, title, children, actions }) => {
  return (
    <IonModal isOpen={isOpen} onDidDismiss={onDidDismiss} className="app-modal">
      <IonHeader>
        <IonToolbar>
          <IonTitle>{title}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        {children}
        {actions && (
          <div className="app-modal__actions">
            {actions.map((action, index) => (
              <IonButton
                key={index}
                expand="block"
                onClick={action.onClick}
                color={action.variant === 'primary' ? 'success' : 'light'}
                className="ion-margin-top"
              >
                {action.label}
              </IonButton>
            ))}
          </div>
        )}
      </IonContent>
    </IonModal>
  );
};

export default AppModal;
