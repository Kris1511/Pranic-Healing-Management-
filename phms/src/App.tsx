import { IonApp, IonRouterOutlet, IonSplitPane, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { Redirect, Route, useLocation } from 'react-router-dom';
import Menu from './components/Menu';
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import SessionExpiredPage from './pages/auth/SessionExpiredPage';
import { ROUTES } from './constants/routes.constant';

/* Super Admin Pages */
import SADashboardPage from './pages/super-admin/DashboardPage';
import SABranchAdminsPage from './pages/super-admin/BranchAdminsPage';
import SACreateBranchAdminPage from './pages/super-admin/CreateBranchAdminPage';
import SABranchAdminDetailsPage from './pages/super-admin/AdminDetailsPage';
import SABranchAdminEditPage from './pages/super-admin/EditBranchAdminPage';
import SAHealersPage from './pages/super-admin/HealersPage';
import SAHealerDetailsPage from './pages/super-admin/HealerDetailsPage';
import SAEditHealerPage from './pages/super-admin/EditHealerPage';
import SABranchesPage from './pages/super-admin/BranchesPage';
import SABranchDetailsPage from './pages/super-admin/BranchDetailsPage';
import SABranchRevenueDetailsPage from './pages/super-admin/BranchRevenueDetailsPage';
import SACreateBranchPage from './pages/super-admin/CreateBranchPage';
import SAUsersPage from './pages/super-admin/UsersPage';
import SAReportsPage from './pages/super-admin/ReportsPage';
import SASettingsPage from './pages/super-admin/SettingsPage';
import SAPatientsPage from './pages/super-admin/PatientsPage';
import SAPatientsDetailsPage from './pages/super-admin/PatientsDetailsPage';
import SAEditPatientPage from './pages/super-admin/EditPatientPages';
import SAVisitorLogPage from './pages/super-admin/VisitorLogPage';
import SAAttendancePage from './pages/super-admin/AttendancePage';
import SATreatmentTypePage from './pages/super-admin/TreatmentTypePage';
import SACreateTreatmentTypePage from './pages/super-admin/CreateTreatmentTypePage';
import SATreatmentTypeDetailsPage from './pages/super-admin/TreatmentTypeDetailsPage';
import SAEditTreatmentTypePage from './pages/super-admin/EditTreatmentTypePage';
import BAAttendancePage from './pages/branch-admin/AttendancePage';
import SARevenuePage from './pages/super-admin/RevenuePage';
import SADailyFinancePage from './pages/super-admin/DailyFinancePage';
import BAVisitorLogPage from './pages/branch-admin/VisitorLogPage';
import BADashboardPage from './pages/branch-admin/DashboardPage';
import BACreateHealerPage from './pages/branch-admin/CreateHealerPage';
import BAEditHealerPage from './pages/branch-admin/EditHealerPage';
import BADetailHealerPage from './pages/branch-admin/DetailHealerPage';
import BARegisterPatientPage from './pages/branch-admin/RegisterPatientPage';
import BAPatientsPage from './pages/branch-admin/PatientsPage';
import PatientDetailsPage from './pages/branch-admin/PatientDetailsPage';
import BAEditPatientPage from './pages/branch-admin/EditPatientPages';
import BAHealersPage from './pages/branch-admin/HealersPage';
import BASessionsPage from './pages/branch-admin/SessionsPage';
import BABookSessionPage from './pages/branch-admin/BookSessionPage';
import BAEditSessionPage from './pages/branch-admin/EditSessionPage';
import BADetailSessionPage from './pages/branch-admin/DetailsSessionPage';
import BAFinancePage from './pages/branch-admin/FinancePage';
import BADocumentManagementPage from './pages/branch-admin/DocumentManagementPage';
import BAReportPage from './pages/branch-admin/ReportPage';
import BASettingsPage from './pages/branch-admin/SettingsPage';
import BAVisitorsCheckInPage from './pages/branch-admin/VisitorsCheckInPage';
import BAVisiterDetailsPage from './pages/branch-admin/VisiterDetials';
import BAVisitorEditPage from './pages/branch-admin/VisitorEdit';

/* Healer Pages */
import HealerDashboardPage from './pages/healer/DashboardPage';
import MyPatientsPage from './pages/healer/MyPatientsPage';
import SessionLogPage from './pages/healer/SessionLogPage';
import SessionNotesPage from './pages/healer/SessionNotesPage';
import DocumentsPages from './pages/healer/DocumentsPages';
import ProfilePage from './pages/healer/ProfilePage';
import PatientsDetialsPages from './pages/healer/PatientsDetialsPages';

/* Patient Pages */
import PatientDashboardPage from './pages/patient/DashboardPage';
import SessionHistoryPage from './pages/patient/SessionHistoryPage';
import PatientSessionNotesPage from './pages/patient/SessionNotesPage';
import PaymentHistoryPage from './pages/patient/PaymentHistoryPage';
import PatientProfilePage from './pages/patient/ProfilePage';
import FeedbackPage from './pages/patient/FeedbackPage';
import DocumentsPage from './pages/patient/DocumentsPage';

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
  ROUTES.AUTH.SESSION_EXPIRED,
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
        <Route path={ROUTES.AUTH.SESSION_EXPIRED} exact={true}>
          <SessionExpiredPage />
        </Route>

        {/* Super Admin Routes */}
        <Route path={ROUTES.SUPER_ADMIN.DASHBOARD} exact={true}>
          <SADashboardPage />
        </Route>
        <Route path={ROUTES.SUPER_ADMIN.BRANCH_ADMINS} exact={true}>
          <SABranchAdminsPage />
        </Route>
        <Route path={ROUTES.SUPER_ADMIN.CREATE_BRANCH_ADMIN} exact={true}>
          <SACreateBranchAdminPage />
        </Route>
        <Route path={ROUTES.SUPER_ADMIN.BRANCH_ADMIN_DETAILS} exact={true}>
          <SABranchAdminDetailsPage />
        </Route>
        <Route path={ROUTES.SUPER_ADMIN.EDIT_BRANCH_ADMIN} exact={true}>
          <SABranchAdminEditPage />
        </Route>
        <Route path={ROUTES.SUPER_ADMIN.BRANCHES} exact={true}>
          <SABranchesPage />
        </Route>
        <Route path={ROUTES.SUPER_ADMIN.BRANCH_DETAILS} exact={true}>
          <SABranchDetailsPage />
        </Route>
        <Route path={ROUTES.SUPER_ADMIN.BRANCH_REVENUE_DETAILS} exact={true}>
          <SABranchRevenueDetailsPage />
        </Route>
        <Route path={ROUTES.SUPER_ADMIN.CREATE_BRANCH} exact={true}>
          <SACreateBranchPage />
        </Route>
        <Route path={ROUTES.SUPER_ADMIN.USERS} exact={true}>
          <SAUsersPage />
        </Route>
        <Route path={ROUTES.SUPER_ADMIN.REPORTS} exact={true}>
          <SAReportsPage />
        </Route>
        <Route path={ROUTES.SUPER_ADMIN.REVENUE} exact={true}>
          <SARevenuePage />
        </Route>
        <Route path={ROUTES.SUPER_ADMIN.DAILY_FINANCE} exact={true}>
          <SADailyFinancePage />
        </Route>
        <Route path={ROUTES.SUPER_ADMIN.HEALERS} exact={true}>
          <SAHealersPage />
        </Route>
        <Route path={ROUTES.SUPER_ADMIN.HEALER_DETAILS} exact={true}>
          <SAHealerDetailsPage />
        </Route>
        <Route path={ROUTES.SUPER_ADMIN.EDIT_HEALER} exact={true}>
          <SAEditHealerPage />
        </Route>
        <Route path={ROUTES.SUPER_ADMIN.PATIENTS} exact={true}>
          <SAPatientsPage />
        </Route>
        <Route path={ROUTES.SUPER_ADMIN.PATIENT_DETAILS} exact={true}>
          <SAPatientsDetailsPage />
        </Route>
        <Route path={ROUTES.SUPER_ADMIN.EDIT_PATIENT} exact={true}>
          <SAEditPatientPage />
        </Route>
        <Route path={ROUTES.SUPER_ADMIN.VISITOR_LOG} exact={true}>
          <SAVisitorLogPage />
        </Route>
        <Route path={ROUTES.SUPER_ADMIN.ATTENDANCE} exact={true}>
          <SAAttendancePage />
        </Route>
        <Route path={ROUTES.SUPER_ADMIN.TREATMENT_TYPE_LIST} exact={true}>
          <SATreatmentTypePage />
        </Route>
        <Route path={ROUTES.SUPER_ADMIN.CREATE_TREATMENT_TYPE} exact={true}>
          <SACreateTreatmentTypePage />
        </Route>
        <Route path={ROUTES.SUPER_ADMIN.TREATMENT_TYPE_DETAILS} exact={true}>
          <SATreatmentTypeDetailsPage />
        </Route>
        <Route path={ROUTES.SUPER_ADMIN.EDIT_TREATMENT_TYPE} exact={true}>
          <SAEditTreatmentTypePage />
        </Route>
        <Route path={ROUTES.SUPER_ADMIN.SETTINGS} exact={true}>
          <SASettingsPage />
        </Route>

        {/* Default Route */}
        <Route path={ROUTES.BRANCH_ADMIN.DASHBOARD} exact={true}>
          <BADashboardPage />
        </Route>
        <Route path={ROUTES.BRANCH_ADMIN.ATTENDANCE} exact={true}>
          <BAAttendancePage />
        </Route>
        <Route path={ROUTES.BRANCH_ADMIN.VISITOR_LOG} exact={true}>
          <BAVisitorLogPage />
        </Route>
        <Route path={ROUTES.BRANCH_ADMIN.VISITOR_CHECKIN} exact={true}>
          <BAVisitorsCheckInPage />
        </Route>
        <Route path={ROUTES.BRANCH_ADMIN.VISITOR_DETAILS} exact={true}>
          <BAVisiterDetailsPage />
        </Route>
        <Route path={ROUTES.BRANCH_ADMIN.VISITOR_EDIT} exact={true}>
          <BAVisitorEditPage />
        </Route>
        <Route path={ROUTES.BRANCH_ADMIN.PATIENTS} exact={true}>
          <BAPatientsPage />
        </Route>
        <Route path={ROUTES.BRANCH_ADMIN.PATIENT_DETAILS} exact={true}>
          <PatientDetailsPage />
        </Route>
        <Route path={ROUTES.BRANCH_ADMIN.HEALERS} exact={true}>
          <BAHealersPage />
        </Route>
        <Route path={ROUTES.BRANCH_ADMIN.EDIT_HEALER} exact={true}>
          <BAEditHealerPage />
        </Route>
        <Route path={ROUTES.BRANCH_ADMIN.HEALER_DETAILS} exact={true}>
          <BADetailHealerPage />
        </Route>
        <Route path={ROUTES.BRANCH_ADMIN.SESSIONS} exact={true}>
          <BASessionsPage />
        </Route>
        <Route path={ROUTES.BRANCH_ADMIN.BOOK_SESSION} exact={true}>
          <BABookSessionPage />
        </Route>
        <Route path={ROUTES.BRANCH_ADMIN.EDIT_SESSION} exact={true}>
          <BAEditSessionPage />
        </Route>
        <Route path={ROUTES.BRANCH_ADMIN.FINANCE_EDIT_SESSION} exact={true}>
          <BAEditSessionPage />
        </Route>
        <Route path={ROUTES.BRANCH_ADMIN.SESSION_DETAILS} exact={true}>
          <BADetailSessionPage />
        </Route>
        <Route path={ROUTES.BRANCH_ADMIN.FINANCE} exact={true}>
          <BAFinancePage />
        </Route>
        <Route path={ROUTES.BRANCH_ADMIN.CREATE_HEALER} exact={true}>
          <BACreateHealerPage />
        </Route>
        <Route path={ROUTES.BRANCH_ADMIN.REGISTER_PATIENT} exact={true}>
          <BARegisterPatientPage />
        </Route>
        <Route path={ROUTES.BRANCH_ADMIN.EDIT_PATIENT} exact={true}>
          <BAEditPatientPage />
        </Route>
        <Route path={ROUTES.BRANCH_ADMIN.DOCUMENTS} exact={true}>
          <BADocumentManagementPage />
        </Route>
        <Route path={ROUTES.BRANCH_ADMIN.REPORTS} exact={true}>
          <BAReportPage />
        </Route>
        <Route path={ROUTES.BRANCH_ADMIN.SETTINGS} exact={true}>
          <BASettingsPage />
        </Route>

        {/* Healer Portal Routes */}
        <Route path={ROUTES.HEALER.DASHBOARD} exact={true}>
          <HealerDashboardPage />
        </Route>
        <Route path={ROUTES.HEALER.PATIENTS} exact={true}>
          <MyPatientsPage />
        </Route>
        <Route path={ROUTES.HEALER.PATIENT_DETAILS} exact={true}>
          <PatientsDetialsPages />
        </Route>
        <Route path={ROUTES.HEALER.SESSIONS} exact={true}>
          <SessionLogPage />
        </Route>
        <Route path={ROUTES.HEALER.SESSION_NOTES} exact={true}>
          <SessionNotesPage />
        </Route>
        <Route path={ROUTES.HEALER.DOCUMENTS} exact={true}>
          <DocumentsPages />
        </Route>
        <Route path={ROUTES.HEALER.SCHEDULE} exact={true}>
          <SessionLogPage />
        </Route>
        <Route path={ROUTES.HEALER.AVAILABILITY} exact={true}>
          <SessionLogPage />
        </Route>
        <Route path={ROUTES.HEALER.PROFILE} exact={true}>
          <ProfilePage />
        </Route>

        {/* Patient Portal Routes */}
        <Route path={ROUTES.PATIENT.DASHBOARD} exact={true}>
          <PatientDashboardPage />
        </Route>
        <Route path={ROUTES.PATIENT.SESSION_HISTORY} exact={true}>
          <SessionHistoryPage />
        </Route>
        <Route path={ROUTES.PATIENT.SESSION_NOTES} exact={true}>
          <PatientSessionNotesPage />
        </Route>
        <Route path={ROUTES.PATIENT.PAYMENT_HISTORY} exact={true}>
          <PaymentHistoryPage />
        </Route>
        <Route path={ROUTES.PATIENT.PROFILE} exact={true}>
          <PatientProfilePage />
        </Route>
        <Route path={ROUTES.PATIENT.FEEDBACK} exact={true}>
          <FeedbackPage />
        </Route>
        <Route path={ROUTES.PATIENT.HEALTH_RECORDS} exact={true}>
          <DocumentsPage />
        </Route>

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
