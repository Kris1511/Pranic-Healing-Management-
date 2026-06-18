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
  mailOutline, 
  informationCircleOutline,
  arrowForwardOutline,
  eye,
  eyeOff
} from 'ionicons/icons';
import AppInput from '../../components/common/AppInput';
import AppButton from '../../components/common/AppButton';
import AppCard from '../../components/common/AppCard';
import AppLoader from '../../components/common/AppLoader';
import { useAuth } from '../../hooks/useAuth';
import './ForgotPasswordPage.css';

const ForgotPasswordPage: React.FC = () => {
  const history = useHistory();
  const [present] = useIonToast();
  const { forgotPassword } = useAuth();
  
  // Form State
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // UI/Visibility State
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Validation Error States
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let hasError = false;

    // Validate Email
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Please enter a valid email address');
      hasError = true;
    } else {
      setEmailError('');
    }

    // Validate New Password
    if (!newPassword) {
      setPasswordError('New password is required');
      hasError = true;
    } else if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      hasError = true;
    } else {
      setPasswordError('');
    }

    // Validate Confirm Password
    if (!confirmPassword) {
      setConfirmPasswordError('Please confirm your new password');
      hasError = true;
    } else if (confirmPassword !== newPassword) {
      setConfirmPasswordError('Passwords do not match');
      hasError = true;
    } else {
      setConfirmPasswordError('');
    }

    if (hasError) return;
    
    setIsLoading(true);

    try {
      // Call the real backend API through the hook
      await forgotPassword({ email, password: newPassword });
      
      present({
        message: 'Password reset successfully! Please login with your new credentials.',
        duration: 3000,
        position: 'top',
        color: 'success',
      });
      history.push('/auth/signin');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to reset password';
      present({
        message: errorMessage,
        duration: 4000,
        position: 'top',
        color: 'danger',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <IonPage className="forgot-password-page">
      <IonContent fullscreen className="forgot-password-page__content ion-padding">
        {/* <div className="forgot-password-page__bg-overlay"></div>
        {isLoading && <AppLoader isLoading={true} message="Resetting password..." fullScreen={false} />} */}
        

        
        <IonGrid className="forgot-password-page__grid ion-no-padding">
          <IonRow className="ion-justify-content-center ion-align-items-center">
            <IonCol sizeMd="6" sizeLg="5" sizeXl="4">
              
              {/* Hero Section */}
              <div className="forgot-password-page__hero">
                <div className="forgot-password-page__logo">
                  <IonIcon
                    icon={informationCircleOutline}
                    className="forgot-password-page__logo-icon"
                  />
                </div>
                <h1 className="forgot-password-page__heading">Reset Password</h1>
                {/* <p className="forgot-passw?ord-page__subheading">SECURE ACCOUNT RECOVERY</p> */}
              </div>

              {/* Form Card */}
              <AppCard className="forgot-password-page__form-card" shadow padding="large">
                <form className="forgot-password-page__form" onSubmit={handleResetPassword} style={{ gap: '16px' }}>                  

                  {/* <div className="ion-text-center ion-margin-bottom">
                    <IonText color="medium">
                      <p>Enter your registered email address and a new password to directly reset your account password.</p>
                    </IonText>
                  </div> */}

                  {/* Email Field */}
                  <div className="forgot-password-page__form-group">
                    <AppInput
                      label="Email Address"
                      name="email"
                      type="email"
                      placeholder="Enter your registered email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (emailError) setEmailError('');
                      }}
                      error={emailError}
                      icon={mailOutline}
                    />
                  </div>

                  {/* New Password Field */}
                  <div className="forgot-password-page__form-group">
                    <AppInput
                      label="New Password"
                      name="newPassword"
                      type={showNewPassword ? 'text' : 'password'}
                      placeholder="Enter new password"
                      value={newPassword}
                      onChange={(e) => {
                        setNewPassword(e.target.value);
                        if (passwordError) setPasswordError('');
                      }}
                      error={passwordError}
                      showPasswordToggle={true}
                      isPasswordVisible={showNewPassword}
                      onTogglePassword={() => setShowNewPassword(!showNewPassword)}
                    />
                  </div>

                  {/* Confirm Password Field */}
                  <div className="forgot-password-page__form-group">
                    <AppInput
                      label="Confirm Password"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        if (confirmPasswordError) setConfirmPasswordError('');
                      }}
                      error={confirmPasswordError}
                      showPasswordToggle={true}
                      isPasswordVisible={showConfirmPassword}
                      onTogglePassword={() => setShowConfirmPassword(!showConfirmPassword)}
                    />
                  </div>

                  {/* Submit Button */}
                  <AppButton 
                    type="submit"
                    className="forgot-password-page__submit-btn"
                    disabled={isLoading}
                    loading={isLoading}
                    fullWidth
                  >
                    Reset Password
                    <IonIcon slot="end" icon={arrowForwardOutline} />
                  </AppButton>

                  {/* Login Link */}
                  <div className="forgot-password-page__login-section ion-text-center">
                    <IonText className="forgot-password-page__login-text">
                      Remembered your password? <IonRouterLink routerLink="/auth/signin" className="forgot-password-page__login-link">Login</IonRouterLink>
                    </IonText>
                  </div>
                </form>
              </AppCard>

              {/* Footer Text */}
              <div className="forgot-password-page__footer">
                <p className="forgot-password-page__tagline">
                  <em>"Healing is the return to the memory of wholeness."</em>
                </p>
                <p className="forgot-password-page__tagline-author">— Pranic Healing</p>
              </div>

            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default ForgotPasswordPage;
