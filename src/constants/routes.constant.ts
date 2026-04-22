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
  },

  // Super Admin Routes
  SUPER_ADMIN: {
    DASHBOARD: '/super-admin/dashboard',
    USERS: '/super-admin/users',
    BRANCH_ADMINS: '/super-admin/branch-admins',
    HEALERS: '/super-admin/healers',
    BRANCHES: '/super-admin/branches',
    BRANCH_DETAILS: '/super-admin/branches/details/:id',
    CREATE_BRANCH: '/super-admin/branches/create',
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
    ATTENDANCE: '/branch-admin/attendance',
    FINANCE: '/branch-admin/finance',
    REPORTS: '/branch-admin/reports',
    SETTINGS: '/branch-admin/settings',
  },

  // Healer Routes
  HEALER: {
    DASHBOARD: '/healer/dashboard',
    SESSIONS: '/healer/sessions',
    PATIENTS: '/healer/patients',
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
    VISITORS: '/patient/visitors',
  },

  // Common Routes
  COMMON: {
    HOME: '/',
    NOT_FOUND: '/404',
    UNAUTHORIZED: '/401',
  },
};
