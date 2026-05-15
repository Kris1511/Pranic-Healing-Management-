import React from 'react';
import { IonLabel, IonItem, IonSelect, IonSelectOption } from '@ionic/react';
import './AppSelect.css';

interface AppSelectOption {
  label: string;
  value: string;
}

interface AppSelectProps {
  label?: string;
  value?: string;
  options: AppSelectOption[];
  onChange?: (e: any) => void;
  onBlur?: (e: any) => void;
  disabled?: boolean;
  error?: string;
  required?: boolean;
  placeholder?: string;
  name?: string;
  selectId?: string;
}

const AppSelect: React.FC<AppSelectProps> = ({
  label,
  value,
  options,
  onChange,
  onBlur,
  disabled = false,
  error,
  required = false,
  placeholder,
  name,
  selectId,
}) => {
  return (
    <div className={`app-select ${error ? 'app-select--error' : ''}`}>
      {label && (
        <IonLabel className="app-select__label">
          {label}
          {required && <span className="app-select__required">*</span>}
        </IonLabel>
      )}
      <IonItem lines="none" className="app-select__item">
        <IonSelect
          id={selectId}
          value={value}
          onIonChange={onChange}
          onIonBlur={onBlur}
          disabled={disabled}
          placeholder={placeholder}
          name={name}
          className="app-select__field"
        >
          {options.map((option) => (
            <IonSelectOption key={option.value} value={option.value}>
              {option.label}
            </IonSelectOption>
          ))}
        </IonSelect>
      </IonItem>
      {error && <span className="app-select__error-text">{error}</span>}
    </div>
  );
};

export default AppSelect;
