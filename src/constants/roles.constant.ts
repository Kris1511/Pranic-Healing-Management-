/**
 * User Roles and Permissions
 */

export type UserRole = 'SUPER_ADMIN' | 'BRANCH_ADMIN' | 'HEALER' | 'PATIENT';

export const ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  BRANCH_ADMIN: 'BRANCH_ADMIN',
  HEALER: 'HEALER',
  PATIENT: 'PATIENT',
} as const;

export const ROLE_LABELS: Record<UserRole, string> = {
  SUPER_ADMIN: 'Super Admin',
  BRANCH_ADMIN: 'Branch Admin',
  HEALER: 'Healer',
  PATIENT: 'Patient',
};

export const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  SUPER_ADMIN: 'System administrator with full access',
  BRANCH_ADMIN: 'Administrator for a specific branch',
  HEALER: 'Healthcare professional',
  PATIENT: 'Patient using the healing services',
};

// Define which roles can access which pages
export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  SUPER_ADMIN: ['/super-admin/*', '/branch-admin/*', '/healer/*', '/patient/*'],
  BRANCH_ADMIN: ['/branch-admin/*', '/healer/*', '/patient/*'],
  HEALER: ['/healer/*'],
  PATIENT: ['/patient/*'],
};
