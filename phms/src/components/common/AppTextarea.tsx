import React from 'react';
import { IonTextarea, IonLabel, IonItem } from '@ionic/react';
import './AppTextarea.css';

interface AppTextareaProps {
  label?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: any) => void;
  onBlur?: (e: any) => void;
  disabled?: boolean;
  error?: string;
  rows?: number;
  maxLength?: number;
  name?: string;
}

const AppTextarea: React.FC<AppTextareaProps> = ({
  label,
  placeholder,
  value,
  onChange,
  onBlur,
  disabled = false,
  error,
  rows = 3,
  maxLength,
  name,
}) => {
  return (
    <div className={`app-textarea ${error ? 'app-textarea--error' : ''}`}>
      {label && <IonLabel className="app-textarea__label">{label}</IonLabel>}
      <IonItem lines="none" className="app-textarea__item">
        <IonTextarea
          placeholder={placeholder}
          value={value}
          onIonChange={onChange}
          onIonBlur={onBlur}
          disabled={disabled}
          rows={rows}
          maxlength={maxLength}
          name={name}
          className="app-textarea__field"
        />
      </IonItem>
      {error && <span className="app-textarea__error-text">{error}</span>}
    </div>
  );
};

export default AppTextarea;
