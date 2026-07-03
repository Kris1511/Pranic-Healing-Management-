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
  IonSpinner,
  useIonViewWillEnter,
} from '@ionic/react';
import {
  documentTextOutline,
  arrowBackOutline,
  saveOutline,
  personOutline,
  leafOutline,
} from 'ionicons/icons';
import { useHistory, useLocation } from 'react-router-dom';
import AppInput from '../../components/common/AppInput';
import AppButton from '../../components/common/AppButton';
import AppCard from '../../components/common/AppCard';
import { getPatients } from '../../api/patient.api';
import { createSession, updateSession, getSessionById } from '../../api/session.api';
import { getTreatmentTypes } from '../../api/treatmentType.api';
import '../branch-admin/branch-admin.css';
import './Healers.css';

import ProfileDropdown from '../../components/common/ProfileDropdown';

interface AssignedPatient {
  id: string;
  patientId: string;
  name: string;
  branchId: string;
  treatmentType?: string;
}



const SessionNotesPage: React.FC = () => {
  const history = useHistory();
  const location = useLocation();
  const [present] = useIonToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [patients, setPatients] = useState<AssignedPatient[]>([]);
  const [treatmentOptions, setTreatmentOptions] = useState<{label: string, value: string}[]>([]);
  const [loading, setLoading] = useState(true);

  // Parse query params
  const query = new URLSearchParams(location.search);
  const sessionId = query.get('sessionId');

  const [formData, setFormData] = useState({
    patientId: '',
    treatmentType: '',
    observations: '',
    notes: '',
    recommendation: '',
    followUp: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch initial assigned patients and existing session notes if editing, or reset form if not editing
  useIonViewWillEnter(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const patientsRes = await getPatients();
        const treatmentsRes = await getTreatmentTypes();
        
        const apiPatients = Array.isArray(patientsRes) ? patientsRes : (patientsRes.data || patientsRes);
        const apiTreatments = Array.isArray(treatmentsRes) ? treatmentsRes : (treatmentsRes.data || treatmentsRes);
        
        if (Array.isArray(apiTreatments)) {
          setTreatmentOptions(apiTreatments.map((t: any) => ({
            label: t.name,
            value: t.name
          })));
        }

        let fetchedPatients: AssignedPatient[] = [];
        if (Array.isArray(apiPatients)) {
          fetchedPatients = apiPatients.map((p: any) => ({
            id: p.id,
            patientId: p.patientId || 'N/A',
            name: p.name,
            branchId: p.branchId || '',
            treatmentType: p.treatmentType || ''
          }));
          setPatients(fetchedPatients);
        }

        // If editing an existing session
        if (sessionId) {
          const sessionRes = await getSessionById(sessionId);
          const session = sessionRes.data || sessionRes;
          if (session) {
            const rawNotes = session.notes || '';
            let observations = '';
            let notes = rawNotes;
            let recommendation = '';
            let followUp = false;

            if (rawNotes.includes('Observations:')) {
              const parts = rawNotes.split('\n\n');
              parts.forEach((part: string) => {
                if (part.startsWith('Observations:')) {
                  observations = part.replace('Observations:', '').trim();
                } else if (part.startsWith('Notes:')) {
                  notes = part.replace('Notes:', '').trim();
                } else if (part.startsWith('Recommendations:')) {
                  recommendation = part.replace('Recommendations:', '').trim();
                } else if (part.startsWith('Follow-up Required:')) {
                  followUp = part.replace('Follow-up Required:', '').trim().toLowerCase() === 'yes';
                }
              });
            }

            setFormData({
              patientId: session.patientId || '',
              treatmentType: session.treatments?.[0]?.treatmentName || 'Basic Pranic Healing',
              observations,
              notes,
              recommendation,
              followUp,
            });
          }
          console.log('session',session);
        } else {
          // If not editing (fresh note), reset form fields and errors to empty
          setFormData({
            patientId: '',
            treatmentType: '',
            observations: '',
            notes: '',
            recommendation: '',
            followUp: false,
          });
          setErrors({});
        }
      } catch (err) {
        console.error('Failed to load form initialization data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  });

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    
    setFormData(prev => {
      const updated = { ...prev, [name]: value };
      
      // Auto-populate treatment type when patient changes
      if (name === 'patientId') {
        const selectedPatient = patients.find(p => p.id === value);
        if (selectedPatient && selectedPatient.treatmentType) {
          // Only auto-fill if the treatment type exists in the options or we can add logic to support any.
          // We'll set it here.
          updated.treatmentType = selectedPatient.treatmentType;
          
          // Clear treatment type error if it exists
          setErrors(prevErr => {
            const newErr = { ...prevErr };
            delete newErr.treatmentType;
            return newErr;
          });
        } else {
          updated.treatmentType = ''; // Reset if patient doesn't have one
        }
      }
      
      return updated;
    });

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
      const combinedNotes = `Observations: ${formData.observations}\n\nNotes: ${formData.notes}\n\nRecommendations: ${formData.recommendation}\n\nFollow-up Required: ${formData.followUp ? 'Yes' : 'No'}`;

      if (sessionId) {
        // Update existing session
        await updateSession(sessionId, {
          notes: combinedNotes,
          status: 'completed',
        });
      } else {
        // Create new session
        const selectedPatientObj = patients.find(p => p.id === formData.patientId);
        const branchId = selectedPatientObj ? selectedPatientObj.branchId : undefined;

        await createSession({
          patient_id: formData.patientId,
          treatment_type: formData.treatmentType,
          notes: combinedNotes,
          status: 'completed',
          session_date: new Date().toISOString(),
          branch_id: branchId,
          start_time: '00:00',
          end_time: '00:00',
          total_amount: 0,
        });
      }
      
      present({
        message: sessionId ? 'Session notes updated successfully!' : 'Session notes saved successfully!',
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
      console.error('Failed to submit session notes:', err);
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
          <IonButtons slot="start">
            <IonMenuButton />
          </IonButtons>
        
          <IonButtons slot="end">
            <ProfileDropdown />
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
                      {loading ? (
                        <option disabled>Loading assigned patients...</option>
                      ) : patients.length === 0 ? (
                        <option disabled>No assigned patients found</option>
                      ) : (
                        patients.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} 
                          </option>
                        ))
                      )}
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
                      {formData.treatmentType && !treatmentOptions.some(o => o.value === formData.treatmentType) && (
                        <option value={formData.treatmentType}>
                          {formData.treatmentType}
                        </option>
                      )}
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
                  {/* <div className="healer-form-toggle-box">
                    <div>
                      <span className="healer-form-toggle-label">Follow-up Required</span>
                      <span className="healer-form-toggle-sub">Flag this patient for a scheduled follow-up review.</span>
                    </div>
                    <IonToggle
                      checked={formData.followUp}
                      onIonChange={handleToggleChange}
                      className="healer-toggle-custom"
                    />
                  </div> */}
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