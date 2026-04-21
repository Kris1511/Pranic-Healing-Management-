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
  arrowForwardOutline
} from 'ionicons/icons';
import AppInput from '../../components/common/AppInput';
import AppButton from '../../components/common/AppButton';
import AppCard from '../../components/common/AppCard';
import AppLoader from '../../components/common/AppLoader';
import './ForgotPasswordPage.css';

const ForgotPasswordPage: React.FC = () => {
  const history = useHistory();
  const [present] = useIonToast();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }
    
    setError('');
    setIsLoading(true);

    // Simulate an API call
    setTimeout(() => {
      setIsLoading(false);
      present({
        message: 'Password reset link sent to your email!',
        duration: 3000,
        position: 'top',
        color: 'success',
      });
      history.push('/auth/signin');
    }, 1500);
  };

  return (
    <IonPage className="forgot-password-page">
      <IonContent fullscreen className="forgot-password-page__content ion-padding">
        <div className="forgot-password-page__bg-overlay"></div>
        {isLoading && <AppLoader isLoading={true} message="Sending reset link..." fullScreen={false} />}
        
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
                <p className="forgot-password-page__subheading">SECURE ACCOUNT RECOVERY</p>
              </div>

              {/* Form Card */}
              <AppCard className="forgot-password-page__form-card" shadow padding="large">
                <form className="forgot-password-page__form" onSubmit={handleResetPassword} style={{ gap: '16px' }}>                  

                  <div className="ion-text-center ion-margin-bottom">
                    <IonText color="medium">
                      <p>Enter your email address to receive a secure link to reset your password.</p>
                    </IonText>
                  </div>

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
                        if (error) setError('');
                      }}
                      error={error}
                      icon={mailOutline}
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
                    Send Reset Link
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
