import React, { useState, useEffect } from 'react';
import { useForm, Controller, FieldValues } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  IonPage,
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonGrid,
  IonRow,
  IonCol,
  IonText,
  IonButtons,
  IonButton,
  IonIcon,
  useIonToast,
} from '@ionic/react';
import { eye, eyeOff, informationCircle } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useAuthStore } from '../../store/auth.store';
import AppCard from '../../components/common/AppCard';
import AppInput from '../../components/common/AppInput';
import AppSelect from '../../components/common/AppSelect';
import AppButton from '../../components/common/AppButton';
import AppLoader from '../../components/common/AppLoader';
import { UserRole, LoginRequest } from '../../types/api.types';
import { ROUTES } from '../../constants/routes.constant';
import './LoginPage.css';

// Validation Schema
const loginValidationSchema = yup.object().shape({
  role: yup.string().required('Please select a role').oneOf(['SUPER_ADMIN', 'BRANCH_ADMIN', 'HEALER', 'PATIENT']),
  email: yup.string().email('Invalid email address').required('Email is required'),
  password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
});

type LoginFormInputs = yup.InferType<typeof loginValidationSchema>;

const LoginPage: React.FC = () => {
  const history = useHistory();
  const [showPassword, setShowPassword] = useState(false);
  const [present] = useIonToast();
  const { login, isLoggingIn, error, clearError } = useAuth();
  const { token, user } = useAuthStore();
  const isAuthenticated = !!token && !!user;

  // Redirect to home if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      history.push('/dashboard');
    }
  }, [isAuthenticated, history]);

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<LoginFormInputs>({
    resolver: yupResolver(loginValidationSchema),
    defaultValues: {
      role: 'SUPER_ADMIN',
      email: 'admin@sanctuary.com',
      password: 'admin123',
    },
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

  const roleOptions = [
    { label: 'Select a role...', value: '' },
    { label: 'Super Admin', value: 'SUPER_ADMIN' },
    { label: 'Branch Admin', value: 'BRANCH_ADMIN' },
    { label: 'Healer', value: 'HEALER' },
    { label: 'Patient', value: 'PATIENT' },
  ];

  const selectedRole = watch('role');

  const onSubmit = (data: LoginFormInputs) => {
    clearError();

    // Dummy login - bypass API, directly redirect to Super Admin Dashboard
    const roleRedirectMap: Record<string, string> = {
      SUPER_ADMIN: ROUTES.SUPER_ADMIN.DASHBOARD,
      BRANCH_ADMIN: ROUTES.BRANCH_ADMIN.DASHBOARD,
      HEALER: ROUTES.HEALER.DASHBOARD,
      PATIENT: ROUTES.PATIENT.DASHBOARD,
    };

    const selectedRole = data.role || 'SUPER_ADMIN';
    const redirectPath = roleRedirectMap[selectedRole] || ROUTES.SUPER_ADMIN.DASHBOARD;

    present({
      message: 'Login successful!',
      duration: 2000,
      position: 'top',
      color: 'success',
    });

    history.push(redirectPath);
  };

  return (
    <IonPage className="login-page">
      {/* <IonHeader className="login-page__header">
        <IonToolbar className="login-page__toolbar">
          <IonTitle className="login-page__title">Pranic Healing</IonTitle>
        </IonToolbar>
      </IonHeader> */}

      <IonContent fullscreen className="login-page__content ion-padding">
        <div className="login-page__bg-overlay"></div>
        {/* <AppLoader isLoading={isLoggingIn} message="Logging in..." fullScreen={false} /> */}

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
                <p className="login-page__subheading">Professional Healing Portal</p>
              </div>

              <AppCard className="login-page__form-card" shadow padding="large">
                <form onSubmit={handleSubmit(onSubmit)} className="login-page__form">
                  {/* Role Selection */}
                  {/* <div className="login-page__form-group">
                    <IonText className="login-page__form-label">
                      <strong>Login As</strong>
                    </IonText>
                    <div className="login-page__role-selector">
                      {roleOptions.slice(1).map((role) => (
                        <Controller
                          key={role.value}
                          name="role"
                          control={control}
                          render={({ field }: { field: FieldValues }) => (
                            <button
                              type="button"
                              onClick={() => field.onChange(role.value)}
                              className={`login-page__role-btn ${
                                selectedRole === role.value ? 'login-page__role-btn--active' : ''
                              }`}
                            >
                              <span className="login-page__role-btn-text">{role.label}</span>
                            </button>
                          )}
                        />
                      ))}
                    </div>
                    {errors.role && (
                      <IonText color="danger" className="login-page__error-text">
                        <small>{errors.role.message}</small>
                      </IonText>
                    )}
                  </div> */}

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
                  <div className="login-page__form-group">
                    <Controller
                      name="password"
                      control={control}
                      render={({ field }: { field: FieldValues }) => (
                        <div className="login-page__password-field">
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
                          />
                          <button
                            type="button"
                            className="login-page__password-toggle"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            <IonIcon icon={showPassword ? eyeOff : eye} />
                          </button>
                        </div>
                      )}
                    />
                  </div>

                  {/* Forgot Password Link */}
                  <div className="login-page__forgot-password">
                    <IonButton
                      fill="clear"
                      size="small"
                      routerLink="/auth/forgot-password"
                      className="login-page__forgot-password-link"
                    >
                      Forgot Password?
                    </IonButton>
                  </div>

                  {/* Submit Button */}
                  <AppButton
                    type="submit"
                    disabled={isLoggingIn}
                    loading={isLoggingIn}
                    fullWidth
                    className="login-page__submit-btn"
                  >
                    {isLoggingIn ? 'Logging in...' : 'Login'}
                  </AppButton>

                  {/* Sign Up Link */}
                  <div className="login-page__signup-section">
                    <IonText className="login-page__signup-text">
                      Don't have an account?{' '}
                      <IonButton
                        fill="clear"
                        size="small"
                        routerLink="/auth/signup"
                        className="login-page__signup-link"
                      >
                        Sign Up
                      </IonButton>
                    </IonText>
                  </div>
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

export default LoginPage;
