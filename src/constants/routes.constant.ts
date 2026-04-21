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
    BRANCHES: '/super-admin/branches',
    REPORTS: '/super-admin/reports',
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
