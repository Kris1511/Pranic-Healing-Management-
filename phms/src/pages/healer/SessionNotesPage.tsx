import React, { useState } from 'react';
import {
  IonPage,
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonMenuButton,
  IonIcon,
  useIonToast,
  IonToggle,
} from '@ionic/react';
import {
  documentTextOutline,
  arrowBackOutline,
  saveOutline,
  personOutline,
  leafOutline,
} from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import AppInput from '../../components/common/AppInput';
import AppButton from '../../components/common/AppButton';
import AppCard from '../../components/common/AppCard';
import '../branch-admin/branch-admin.css';
import './Healers.css';

const mockPatients = [
  { label: 'Rajesh Kumar (PAT-10023)', value: 'PAT-10023' },
  { label: 'Priya Sharma (PAT-10045)', value: 'PAT-10045' },
  { label: 'Amit Patel (PAT-10088)', value: 'PAT-10088' },
  { label: 'Sunita Rao (PAT-10112)', value: 'PAT-10112' },
  { label: 'Vikram Singh (PAT-10156)', value: 'PAT-10156' },
];

const treatmentOptions = [
  { label: 'Basic Pranic Healing', value: 'Basic Pranic Healing' },
  { label: 'Advanced Pranic Healing', value: 'Advanced Pranic Healing' },
  { label: 'Pranic Psychotherapy', value: 'Pranic Psychotherapy' },
  { label: 'Pranic Crystal Healing', value: 'Pranic Crystal Healing' },
];

const SessionNotesPage: React.FC = () => {
  const history = useHistory();
  const [present] = useIonToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    patientId: '',
    treatmentType: '',
    observations: '',
    notes: '',
    recommendation: '',
    followUp: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleToggleChange = (e: any) => {
    setFormData(prev => ({ ...prev, followUp: e.detail.checked }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.patientId) newErrors.patientId = 'Please select a patient';
    if (!formData.treatmentType) newErrors.treatmentType = 'Please select a treatment type';
    if (!formData.observations.trim()) newErrors.observations = 'Observations are required';
    if (!formData.notes.trim()) newErrors.notes = 'Session notes are required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      // Simulate API submit delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      present({
        message: 'Session notes saved successfully!',
        duration: 2000,
        position: 'top',
        color: 'success',
      });

      // Clear form
      setFormData({
        patientId: '',
        treatmentType: '',
        observations: '',
        notes: '',
        recommendation: '',
        followUp: false,
      });

      history.push('/healer/dashboard');
    } catch (err) {
      console.error(err);
      present({
        message: 'Failed to save session notes.',
        duration: 2000,
        position: 'top',
        color: 'danger',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <IonPage className="sa-page">
      <IonHeader className="ion-no-border">
        <IonToolbar className="sa-page__toolbar">
          <IonTitle className="sa-page__toolbar-title">Session Notes</IonTitle>
          <IonButtons slot="end">
            <IonMenuButton />
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent className="sa-page__content">
        <div className="healer-container">
          
          <div className="healer-header-box">
            <h2 className="healer-page-title">Record Healing Notes</h2>
            <p className="healer-page-subtitle">Log patient observations and energy work notes post-session.</p>
          </div>

          <AppCard padding="large" shadow>
            <form onSubmit={handleSubmit} className="healer-form">
              <div className="healer-form-grid-2col">
                {/* Left Column */}
                <div className="healer-actions-list">
                  {/* Patient Selection */}
                  <div>
                    <label className="healer-form-label">
                      Select Patient *
                    </label>
                    <select
                      name="patientId"
                      value={formData.patientId}
                      onChange={handleInputChange}
                      className={`healer-form-select ${errors.patientId ? 'healer-form-select--error' : ''}`}
                    >
                      <option value="">Select a patient...</option>
                      {mockPatients.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    {errors.patientId && (
                      <span className="healer-form-error-text">
                        {errors.patientId}
                      </span>
                    )}
                  </div>

                  {/* Treatment Type */}
                  <div>
                    <label className="healer-form-label">
                      Treatment Type *
                    </label>
                    <select
                      name="treatmentType"
                      value={formData.treatmentType}
                      onChange={handleInputChange}
                      className={`healer-form-select ${errors.treatmentType ? 'healer-form-select--error' : ''}`}
                    >
                      <option value="">Select a treatment...</option>
                      {treatmentOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    {errors.treatmentType && (
                      <span className="healer-form-error-text">
                        {errors.treatmentType}
                      </span>
                    )}
                  </div>

                  {/* Recommendation */}
                  <div>
                    <label className="healer-form-label">
                      Next Recommendation (Optional)
                    </label>
                    <textarea
                      name="recommendation"
                      rows={3}
                      placeholder="e.g. Next session in 3 days, breathing exercises, salt water bath..."
                      value={formData.recommendation}
                      onChange={handleInputChange}
                      className="healer-form-textarea"
                    />
                  </div>

                  {/* Follow-up flag */}
                  <div className="healer-form-toggle-box">
                    <div>
                      <span className="healer-form-toggle-label">Follow-up Required</span>
                      <span className="healer-form-toggle-sub">Flag this patient for a scheduled follow-up review.</span>
                    </div>
                    <IonToggle
                      checked={formData.followUp}
                      onIonChange={handleToggleChange}
                      className="healer-toggle-custom"
                    />
                  </div>
                </div>

                {/* Right Column */}
                <div className="healer-actions-list">
                  {/* Observations */}
                  <div>
                    <label className="healer-form-label">
                      Observations *
                    </label>
                    <textarea
                      name="observations"
                      rows={4}
                      placeholder="Record chakra congestions, aura details, or energy leaks noticed..."
                      value={formData.observations}
                      onChange={handleInputChange}
                      className={`healer-form-textarea ${errors.observations ? 'healer-form-textarea--error' : ''}`}
                    />
                    {errors.observations && (
                      <span className="healer-form-error-text">
                        {errors.observations}
                      </span>
                    )}
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="healer-form-label">
                      Energy Healing Notes (Details of Prana used) *
                    </label>
                    <textarea
                      name="notes"
                      rows={5}
                      placeholder="Details of chakras cleaned, colored pranas projected, and stabilization techniques used..."
                      value={formData.notes}
                      onChange={handleInputChange}
                      className={`healer-form-textarea ${errors.notes ? 'healer-form-textarea--error' : ''}`}
                    />
                    {errors.notes && (
                      <span className="healer-form-error-text">
                        {errors.notes}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Submit button */}
              <div className="healer-notes-submit-wrapper">
                <AppButton
                  type="submit"
                  loading={isSubmitting}
                  disabled={isSubmitting}
                  size="medium"
                >
                  Save Notes
                  <IonIcon icon={saveOutline} slot="end" />
                </AppButton>
              </div>

            </form>
          </AppCard>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default SessionNotesPage;