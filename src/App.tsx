import { IonApp, IonRouterOutlet, IonSplitPane, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { Redirect, Route, useLocation } from 'react-router-dom';
import Menu from './components/Menu';
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import { ROUTES } from './constants/routes.constant';

/* Super Admin Pages */
import SADashboardPage from './pages/super-admin/DashboardPage';
import SABranchesPage from './pages/super-admin/BranchesPage';
import SAUsersPage from './pages/super-admin/UsersPage';
import SAReportsPage from './pages/super-admin/ReportsPage';
import SASettingsPage from './pages/super-admin/SettingsPage';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/**
 * Ionic Dark Mode
 * -----------------------------------------------------
 * For more info, please see:
 * https://ionicframework.com/docs/theming/dark-mode
 */

/* import '@ionic/react/css/palettes/dark.always.css'; */
/* import '@ionic/react/css/palettes/dark.class.css'; */
import '@ionic/react/css/palettes/dark.system.css';

/* Theme variables */
import './theme/index.css';

setupIonicReact();

// Routes that should not show the Menu
const AUTH_ROUTES = [
  ROUTES.AUTH.LOGIN,
  ROUTES.AUTH.SIGNUP,
  ROUTES.AUTH.FORGOT_PASSWORD,
  ROUTES.AUTH.RESET_PASSWORD,
];

const AppContent: React.FC = () => {
  const location = useLocation();
  const shouldShowMenu = !AUTH_ROUTES.includes(location.pathname);

  return (
    <IonSplitPane contentId="main">
      {shouldShowMenu && <Menu />}
      <IonRouterOutlet id="main">
        {/* Auth Routes - No Menu */}
        <Route path={ROUTES.AUTH.LOGIN} exact={true}>
          <LoginPage />
        </Route>
        <Route path={ROUTES.AUTH.SIGNUP} exact={true}>
          <SignupPage />
        </Route>
        <Route path={ROUTES.AUTH.FORGOT_PASSWORD} exact={true}>
          <ForgotPasswordPage />
        </Route>

        {/* Super Admin Routes */}
        <Route path={ROUTES.SUPER_ADMIN.DASHBOARD} exact={true}>
          <SADashboardPage />
        </Route>
        <Route path={ROUTES.SUPER_ADMIN.BRANCHES} exact={true}>
          <SABranchesPage />
        </Route>
        <Route path={ROUTES.SUPER_ADMIN.USERS} exact={true}>
          <SAUsersPage />
        </Route>
        <Route path={ROUTES.SUPER_ADMIN.REPORTS} exact={true}>
          <SAReportsPage />
        </Route>
        <Route path={ROUTES.SUPER_ADMIN.SETTINGS} exact={true}>
          <SASettingsPage />
        </Route>

        {/* Default Route */}
        <Route path="/" exact={true}>
          <Redirect to={ROUTES.AUTH.LOGIN} />
        </Route>
      </IonRouterOutlet>
    </IonSplitPane>
  );
};

const App: React.FC = () => {
  return (
    <IonApp>
      <IonReactRouter>
        <AppContent />
      </IonReactRouter>
    </IonApp>
  );
};

export default App;
