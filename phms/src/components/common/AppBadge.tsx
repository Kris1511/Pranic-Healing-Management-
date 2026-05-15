import React from 'react';
import { IonBadge } from '@ionic/react';
import './AppBadge.css';

interface AppBadgeProps {
  children: React.ReactNode;
  color?: string;
  variant?: 'dot' | 'filled' | 'outlined';
  className?: string;
}

const AppBadge: React.FC<AppBadgeProps> = ({ children, color = 'primary', variant = 'filled', className = '' }) => {
  return (
    <IonBadge color={color} className={`app-badge app-badge--${variant} ${className}`}>
      {children}
    </IonBadge>
  );
};

export default AppBadge;
