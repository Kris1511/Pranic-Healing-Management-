import React from 'react';
import { IonButton } from '@ionic/react';
import './AppButton.css';

interface AppButtonProps {
  onClick?: () => void;
  type?: 'submit' | 'button' | 'reset';
  disabled?: boolean;
  loading?: boolean;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'tertiary' | 'danger';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  className?: string;
}

const AppButton: React.FC<AppButtonProps> = ({
  onClick,
  type = 'button',
  disabled = false,
  loading = false,
  children,
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  className = '',
}) => {
  return (
    <IonButton
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      fill="solid"
      color={variant === 'primary' ? 'success' : variant === 'danger' ? 'danger' : 'light'}
      expand={fullWidth ? 'block' : 'block'}
      className={`app-button app-button--${variant} app-button--${size} ${fullWidth ? 'ion-margin-top' : ''} ${className}`}
    >
      {loading ? <span className="app-button__spinner"></span> : children}
    </IonButton>
  );
};

export default AppButton;
