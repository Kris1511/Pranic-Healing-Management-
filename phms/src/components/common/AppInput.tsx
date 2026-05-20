import React from 'react';
import { IonInput, IonLabel, IonItem, IonIcon } from '@ionic/react';
import { TextFieldTypes } from '@ionic/core';
import { eye, eyeOff } from 'ionicons/icons';
import './AppInput.css';

interface AppInputProps {
  label?: string;
  type?: TextFieldTypes;
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
  showPasswordToggle?: boolean;
  isPasswordVisible?: boolean;
  onTogglePassword?: () => void;
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
  showPasswordToggle = false,
  isPasswordVisible = false,
  onTogglePassword,
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
          type={type as any}
          placeholder={placeholder}
          value={value}
          onIonChange={onChange}
          onIonBlur={onBlur}
          disabled={disabled}
          // autoComplete={autoComplete}
          maxlength={maxLength}
          name={name}
          className={`app-input__field ${showPasswordToggle ? 'app-input__field--has-toggle' : ''}`}
        />
        {showPasswordToggle && onTogglePassword && (
          <button
            type="button"
            className="app-input__password-toggle"
            onClick={onTogglePassword}
            tabIndex={-1}
          >
            <IonIcon icon={isPasswordVisible ? eyeOff : eye} />
          </button>
        )}
      </IonItem>
      {error && <span className="app-input__error-text">{error}</span>}
      {helperText && !error && <span className="app-input__helper-text">{helperText}</span>}
    </div>
  );
};

export default AppInput;

