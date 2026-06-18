import React from 'react';
import { IonDatetime, IonLabel, IonItem } from '@ionic/react';
import './AppDatePicker.css';

interface AppDatePickerProps {
  label?: string;
  value?: string;
  onChange?: (e: any) => void;
  disabled?: boolean;
  error?: string;
  min?: string;
  max?: string;
}

const AppDatePicker: React.FC<AppDatePickerProps> = ({ label, value, onChange, disabled, error, min, max }) => {
  return (
    <div className={`app-date-picker ${error ? 'app-date-picker--error' : ''}`}>
      {label && <IonLabel className="app-date-picker__label">{label}</IonLabel>}
      <IonItem lines="none" className="app-date-picker__item">
        <IonDatetime value={value} onIonChange={onChange} disabled={disabled} min={min} max={max} />
      </IonItem>
      {error && <span className="app-date-picker__error-text">{error}</span>}
    </div>
  );
};

export default AppDatePicker;
