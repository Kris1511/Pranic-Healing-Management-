import React, { useState, useEffect } from 'react';
import { useForm, Controller, FieldValues } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  IonPage,
  IonContent,
  IonGrid,
  IonRow,
  IonCol,
  IonIcon,
  useIonToast,
  useIonViewWillEnter,
} from '@ionic/react';
import { informationCircle } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useAuthStore } from '../../store/auth.store';
import AppCard from '../../components/common/AppCard';
import AppInput from '../../components/common/AppInput';
import AppButton from '../../components/common/AppButton';
import { LoginRequest } from '../../types/api.types';
import { ROUTES } from '../../constants/routes.constant';
import './LoginPage.css';

// Validation Schema
const loginValidationSchema = yup.object().shape({
  email: yup.string().email('Invalid email address').required('Email is required'),
  password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
});

type LoginFormInputs = yup.InferType<typeof loginValidationSchema>;

const EmailLoginPage: React.FC = () => {
  const history = useHistory();
  const [showPassword, setShowPassword] = useState(false);
  const [present] = useIonToast();
  const { login, isLoggingIn, error, clearError } = useAuth();
  const { token, user } = useAuthStore();
  const isAuthenticated = !!token && !!user;

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      const roleRedirectMap: Record<string, string> = {
        SUPER_ADMIN: ROUTES.SUPER_ADMIN.DASHBOARD,
        BRANCH_ADMIN: ROUTES.BRANCH_ADMIN.DASHBOARD,
        HEALER: ROUTES.HEALER.DASHBOARD,
        PATIENT: ROUTES.PATIENT.DASHBOARD,
      };
      
      const actualRole = user.role;
      const redirectPath = roleRedirectMap[actualRole as string] || ROUTES.SUPER_ADMIN.DASHBOARD;
      history.push(redirectPath);
    }
  }, [isAuthenticated, user, history]);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<LoginFormInputs>({
    resolver: yupResolver(loginValidationSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // Reset form when page comes into view (handles Ionic page caching)
  useIonViewWillEnter(() => {
    reset({ email: '', password: '' });
    setShowPassword(false);
    clearError();
  });

  // Show error toast when error occurs
  useEffect(() => {
    if (error) {
      present({
        message: error,
        duration: 4000,
        position: 'top',
        color: 'danger',
      });
    }
  }, [error, present]);

  const onSubmit = async (data: LoginFormInputs) => {
    clearError();
    const { email } = data;
    console.log("Email Login Payload:", { email });

    try {
      await login(data as LoginRequest);

      const roleRedirectMap: Record<string, string> = {
        SUPER_ADMIN: ROUTES.SUPER_ADMIN.DASHBOARD,
        BRANCH_ADMIN: ROUTES.BRANCH_ADMIN.DASHBOARD,
        HEALER: ROUTES.HEALER.DASHBOARD,
        PATIENT: ROUTES.PATIENT.DASHBOARD,
      };

      // Get actual logged-in user
      const loggedInUser = useAuthStore.getState().user;
      const actualRole = loggedInUser?.role;

      const redirectPath =
        roleRedirectMap[actualRole as string] ||
        ROUTES.SUPER_ADMIN.DASHBOARD;

      present({
        message: 'Login successful!',
        duration: 2000,
        position: 'top',
        color: 'success',
      });

      history.push(redirectPath);
    } catch (err: any) {
      console.error('Login error:', err);
    }
  };

  return (
    <IonPage className="login-page">
      <IonContent fullscreen className="login-page__content ion-padding">
        <div className="login-page__bg-overlay"></div>

        <IonGrid className="login-page__grid ion-no-padding">
          <IonRow className="ion-align-items-center ion-justify-content-center">
            <IonCol sizeMd="6" sizeLg="5" sizeXl="4">
              <div className="login-page__hero">
                <div className="login-page__logo">
                  <IonIcon
                    icon={informationCircle}
                    className="login-page__logo-icon"
                  />
                </div>
                <h1 className="login-page__heading">Pranic Healing Management</h1>
                <p className="login-page__subheading">Credential Sign-In</p>
              </div>

              <AppCard className="login-page__form-card" shadow padding="large">
                <form onSubmit={handleSubmit(onSubmit)} className="login-page__form">
                  
                  {/* Email Input */}
                  <div className="login-page__form-group">
                    <Controller
                      name="email"
                      control={control}
                      render={({ field }: { field: FieldValues }) => (
                        <AppInput
                          label="Email Address"
                          type="email"
                          placeholder="Enter your email"
                          value={field.value}
                          onChange={(e) => field.onChange(e.detail.value)}
                          onBlur={field.onBlur}
                          error={errors.email?.message}
                          required
                          autoComplete="email"
                          inputId="email"
                          name={field.name}
                        />
                      )}
                    />
                  </div>

                  {/* Password Input */}
                  <div className="login-page__form-group" style={{ marginBottom: '24px' }}>
                    <Controller
                      name="password"
                      control={control}
                      render={({ field }: { field: FieldValues }) => (
                        <AppInput
                          label="Password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Enter your password"
                          value={field.value}
                          onChange={(e) => field.onChange(e.detail.value)}
                          onBlur={field.onBlur}
                          error={errors.password?.message}
                          required
                          autoComplete="current-password"
                          inputId="password"
                          name={field.name}
                          showPasswordToggle={true}
                          isPasswordVisible={showPassword}
                          onTogglePassword={() => setShowPassword(!showPassword)}
                        />
                      )}
                    />
                  </div>

                  {/* Submit Button */}
                  <AppButton
                    type="submit"
                    disabled={isLoggingIn}
                    loading={isLoggingIn}
                    fullWidth
                    className="login-page__submit-btn"
                  >
                    {isLoggingIn ? 'Logging in...' : 'Login Now'}
                  </AppButton>
                </form>
              </AppCard>

              {/* Footer Text */}
              <div className="login-page__footer">
                <p className="login-page__tagline">
                  <em>"Healing is the return to the memory of wholeness."</em>
                </p>
                <p className="login-page__tagline-author">— Pranic Healing</p>
              </div>
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default EmailLoginPage;
