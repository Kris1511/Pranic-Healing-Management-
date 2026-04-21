import React from 'react';
import './AppCard.css';

interface AppCardProps {
  children: React.ReactNode;
  className?: string;
  shadow?: boolean;
  bordered?: boolean;
  padding?: 'small' | 'medium' | 'large';
}

const AppCard: React.FC<AppCardProps> = ({
  children,
  className = '',
  shadow = true,
  bordered = false,
  padding = 'medium',
}) => {
  return (
    <div
      className={`app-card app-card--padding-${padding} ${shadow ? 'app-card--shadow' : ''} ${
        bordered ? 'app-card--bordered' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
};

export default AppCard;
