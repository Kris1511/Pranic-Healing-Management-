import React, { useState } from 'react';
import {
  IonContent,
  IonPage,
  IonRow,
  IonCol,
  IonGrid,
  IonIcon,
  IonText,
  IonRouterLink,
  useIonToast,
} from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { 
  personOutline, 
  mailOutline, 
  lockClosedOutline, 
  eyeOutline, 
  eyeOffOutline,
  leafOutline,
  personAddOutline,
  informationCircleOutline
} from 'ionicons/icons';
import AppInput from '../../components/common/AppInput';
import AppButton from '../../components/common/AppButton';
import AppSelect from '../../components/common/AppSelect';
import AppCard from '../../components/common/AppCard';
import AppLoader from '../../components/common/AppLoader';
import { useAuth } from '../../hooks/useAuth';
import './SignupPage.css';

const SignupPage: React.FC = () => {
  const { error, clearError } = useAuth();
  const history = useHistory();
  const [present] = useIonToast();
  const [showPassword, setShowPassword] = useState(false);
  const [isRegisteringLocal, setIsRegisteringLocal] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'SUPER ADMIN' as 'SUPER ADMIN'
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const roleOptions = [
    { label: 'Super Admin', value: 'SUPER ADMIN' },
    { label: 'Branch Admin', value: 'Branch Admin' },
  ];

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.fullName.trim()) errors.fullName = 'Full name is required';
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Invalid email format';
    }
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    if (error) clearError();
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;


    setIsRegisteringLocal(true);

    // Simulate an API call
    setTimeout(() => {
      setIsRegisteringLocal(false);
      present({
        message: 'Account created successfully! You can now login.',
        duration: 3000,
        position: 'top',
        color: 'success',
      });
      history.push('/auth/signin');
    }, 1500);
  };

  return (
    <IonPage className="signup-page">
      <IonContent fullscreen className="signup-page__content ion-padding">
        <div className="signup-page__bg-overlay"></div>
        {/* {isRegisteringLocal && <AppLoader isLoading={true} message="Creating your account..." fullScreen={false} />} */}
        
        <IonGrid className="signup-page__grid ion-no-padding">
          <IonRow className="ion-justify-content-center ion-align-items-center">
            <IonCol sizeMd="6" sizeLg="5" sizeXl="4">
              
              {/* Hero Section */}
              <div className="signup-page__hero">
                {/* <div className="signup-page__logo">
                  <IonIcon
                    icon={informationCircleOutline}
                    className="signup-page__logo-icon"
                  />
                </div>
                <h1 className="signup-page__heading">Pranic Healing Management</h1> */}
                <p className="signup-page__subheading">CREATE YOUR HEALING ACCOUNT</p>
              </div>

              {/* Form Card */}
              <AppCard className="signup-page__form-card" shadow padding="large">
                <form className="signup-page__form" onSubmit={handleSignup} style={{ gap: '16px' }}>                  

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    {/* Name Field */}
                    <div className="signup-page__form-group">
                      <AppInput
                        label="Full Name"
                        name="fullName"
                        placeholder="Enter your full name"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        error={formErrors.fullName}
                        icon={personOutline}
                      />
                    </div>

                    {/* Email Field */}
                    <div className="signup-page__form-group">
                      <AppInput
                        label="Email Address"
                        name="email"
                        type="email"
                        placeholder="Enter your email"
                        value={formData.email}
                        onChange={handleInputChange}
                        error={formErrors.email || (error?.includes('Email') ? error : '')}
                        icon={mailOutline}
                      />
                    </div>
                  </div>

                  {/* Password Field */}
                  <div className="signup-page__form-group">
                    <div className="signup-page__password-field">
                      <AppInput
                        label="Create Password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Choose a strong password"
                        value={formData.password}
                        onChange={handleInputChange}
                        error={formErrors.password}
                        icon={lockClosedOutline}
                      />
                      <button 
                        type="button"
                        className="signup-page__password-toggle"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        <IonIcon icon={showPassword ? eyeOffOutline : eyeOutline} />
                      </button>
                    </div>
                  </div>

                  {/* Role Selector */}
                  <div className="signup-page__form-group">
                    <AppSelect
                      label="I'm a..."
                      name="role"
                      value={formData.role}
                      options={roleOptions}
                      onChange={handleInputChange}
                      error={formErrors.role}
                    />
                  </div>

                  {/* Submit Button */}
                  <AppButton 
                    type="submit"
                    className="signup-page__submit-btn"
                    disabled={isRegisteringLocal}
                    loading={isRegisteringLocal}
                    fullWidth
                  >
                    Sign Up
                    <IonIcon slot="end" icon={personAddOutline} />
                  </AppButton>

                  {/* General Error */}
                  {error && !error.includes('Email') && (
                    <div className="signup-page__error ion-text-center">
                      <IonText color="danger">{error}</IonText>
                    </div>
                  )}

                  {/* Login Link */}
                  <div className="signup-page__login-section ion-text-center">
                    <IonText className="signup-page__login-text">
                      Already have an account? <IonRouterLink routerLink="/auth/signin" className="signup-page__login-link">Login</IonRouterLink>
                    </IonText>
                  </div>
                </form>
              </AppCard>

              {/* Footer Text */}
              <div className="signup-page__footer">
                <p className="signup-page__tagline">
                  <em>"Healing is the return to the memory of wholeness."</em>
                </p>
                <p className="signup-page__tagline-author">— Pranic Healing</p>
              </div>

            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default SignupPage;
