/**
 * Application Routes
 */

export const ROUTES = {
  // Auth Routes
  AUTH: {
    LOGIN: '/auth/signin',
    SIGNUP: '/auth/signup',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    SESSION_EXPIRED: '/auth/session-expired',
  },

  // Super Admin Routes
  SUPER_ADMIN: {
    DASHBOARD: '/super-admin/dashboard',
    USERS: '/super-admin/users',
    BRANCH_ADMINS: '/super-admin/branch-admins',
    CREATE_BRANCH_ADMIN: '/super-admin/branch-admins/create',
    BRANCH_ADMIN_DETAILS: '/super-admin/branch-admins/details/:id',
    EDIT_BRANCH_ADMIN: '/super-admin/branch-admins/edit/:id',
    HEALERS: '/super-admin/healers',
    HEALER_DETAILS: '/super-admin/healers/details/:healerId',
    EDIT_HEALER: '/super-admin/healers/edit/:healerId',
    PATIENTS: '/super-admin/patients',
    PATIENT_DETAILS: '/super-admin/patients/details/:patientId',
    EDIT_PATIENT: '/super-admin/patients/edit/:patientId',
    BRANCHES: '/super-admin/branches',
    BRANCH_DETAILS: '/super-admin/branches/details/:id',
    BRANCH_REVENUE_DETAILS: '/super-admin/branches/details/:id/revenue',
    CREATE_BRANCH: '/super-admin/branches/create',
    TREATMENT_TYPE_LIST: '/super-admin/treatment-types',
    CREATE_TREATMENT_TYPE: '/super-admin/treatment-types/create',
    TREATMENT_TYPE_DETAILS: '/super-admin/treatment-types/details/:id',
    EDIT_TREATMENT_TYPE: '/super-admin/treatment-types/edit/:id',
    REPORTS: '/super-admin/reports',
    REVENUE: '/super-admin/revenue',
    VISITOR_LOG: '/super-admin/visitor-log',
    ATTENDANCE: '/super-admin/attendance',
    DAILY_FINANCE: '/super-admin/daily-finance',
    SETTINGS: '/super-admin/settings',
  },

  // Branch Admin Routes
  BRANCH_ADMIN: {
    DASHBOARD: '/branch-admin/dashboard',
    HEALERS: '/branch-admin/healers',
    PATIENTS: '/branch-admin/patients',
    SESSIONS: '/branch-admin/sessions',
    BOOK_SESSION: '/branch-admin/sessions/book',
    EDIT_SESSION: '/branch-admin/sessions/edit/:id',
    FINANCE_EDIT_SESSION: '/branch-admin/finance/edit/:id',
    SESSION_DETAILS: '/branch-admin/sessions/details/:id',
    ATTENDANCE: '/branch-admin/attendance',
    VISITOR_LOG: '/branch-admin/visitor-log',
    FINANCE: '/branch-admin/finance',
    REPORTS: '/branch-admin/reports',
    DOCUMENTS: '/branch-admin/documents',
    SETTINGS: '/branch-admin/settings',
    REGISTER_PATIENT: '/branch-admin/patients/register',
    CREATE_HEALER: '/branch-admin/healers/create',
    EDIT_HEALER: '/branch-admin/healers/edit/:id',
    HEALER_DETAILS: '/branch-admin/healers/details/:id',
    EDIT_PATIENT: '/branch-admin/patients/edit/:id',
    PATIENT_DETAILS: '/branch-admin/patients/details/:id',
    VISITOR_CHECKIN: '/branch-admin/visitor-log/checkin',
    VISITOR_DETAILS: '/branch-admin/visitor-log/details/:id',
    VISITOR_EDIT: '/branch-admin/visitor-log/edit/:id',
  },

  // Healer Routes
  HEALER: {
    DASHBOARD: '/healer/dashboard',
    SESSIONS: '/healer/sessions',
    PATIENTS: '/healer/patients',
    PATIENT_DETAILS: '/healer/patients/details/:id',
    SESSION_NOTES: '/healer/session-notes',
    DOCUMENTS: '/healer/documents',
    SCHEDULE: '/healer/schedule',
    AVAILABILITY: '/healer/availability',
    PROFILE: '/healer/profile',
  },

  // Patient Routes
  PATIENT: {
    DASHBOARD: '/patient/dashboard',
    APPOINTMENTS: '/patient/appointments',
    HEALERS: '/patient/healers',
    PROFILE: '/patient/profile',
    HEALTH_RECORDS: '/patient/health-records',
    SESSION_HISTORY: '/patient/session-history',
    SESSION_NOTES: '/patient/session-notes',
    PAYMENT_HISTORY: '/patient/payment-history',
    VISITORS: '/patient/visitors',
    FEEDBACK: '/patient/feedback',
  },

  // Common Routes
  COMMON: {
    HOME: '/',
    NOT_FOUND: '/404',
    UNAUTHORIZED: '/401',
  },
};
