import React from 'react';
import { IonSpinner } from '@ionic/react';
import './AppLoader.css';

interface AppLoaderProps {
  isLoading: boolean;
  size?: 'small' | 'medium' | 'large';
  color?: string;
  message?: string;
  fullScreen?: boolean;
}

const AppLoader: React.FC<AppLoaderProps> = ({
  isLoading,
  size = 'medium',
  color = 'primary',
  message,
  fullScreen = false,
}) => {
  if (!isLoading) return null;

  const sizeMap: Record<string, string> = {
    small: '24px',
    medium: '48px',
    large: '72px',
  };

  return (
    <div className={`app-loader ${fullScreen ? 'app-loader--full-screen' : ''}`}>
      <div className="app-loader__content">
        <IonSpinner name="crescent" color={color} style={{ width: sizeMap[size], height: sizeMap[size] }} />
        {message && <p className="app-loader__message">{message}</p>}
      </div>
    </div>
  );
};

export default AppLoader;
