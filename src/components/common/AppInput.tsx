import React from 'react';
import { IonInput, IonLabel, IonItem } from '@ionic/react';
import './AppInput.css';

interface AppInputProps {
  label?: string;
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: any) => void;
  onBlur?: (e: any) => void;
  disabled?: boolean;
  error?: string;
  helperText?: string;
  icon?: string;
  required?: boolean;
  autoComplete?: string;
  maxLength?: number;
  name?: string;
  inputId?: string;
}

const AppInput: React.FC<AppInputProps> = ({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  onBlur,
  disabled = false,
  error,
  helperText,
  icon,
  required = false,
  autoComplete,
  maxLength,
  name,
  inputId,
}) => {
  return (
    <div className={`app-input ${error ? 'app-input--error' : ''}`}>
      {label && (
        <IonLabel className="app-input__label">
          {label}
          {required && <span className="app-input__required">*</span>}
        </IonLabel>
      )}
      <IonItem lines="none" className="app-input__item">
        <IonInput
          id={inputId}
          type={type}
          placeholder={placeholder}
          value={value}
          onIonChange={onChange}
          onIonBlur={onBlur}
          disabled={disabled}
          autoComplete={autoComplete}
          maxlength={maxLength}
          name={name}
          className="app-input__field"
        />
      </IonItem>
      {error && <span className="app-input__error-text">{error}</span>}
      {helperText && !error && <span className="app-input__helper-text">{helperText}</span>}
    </div>
  );
};

export default AppInput;
