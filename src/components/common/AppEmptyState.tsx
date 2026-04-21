import React from 'react';
import './AppEmptyState.css';

interface AppEmptyStateProps {
  title: string;
  message: string;
  icon?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const AppEmptyState: React.FC<AppEmptyStateProps> = ({ title, message, icon, action }) => {
  return (
    <div className="app-empty-state">
      {icon && <div className="app-empty-state__icon">{icon}</div>}
      <h2 className="app-empty-state__title">{title}</h2>
      <p className="app-empty-state__message">{message}</p>
      {action && (
        <button onClick={action.onClick} className="app-empty-state__action">
          {action.label}
        </button>
      )}
    </div>
  );
};

export default AppEmptyState;
