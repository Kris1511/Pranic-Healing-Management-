/**
 * React Query Key Factory
 * Centralized keys for all API queries to ensure consistency and easy invalidation
 */

export const queryKeys = {
  auth: {
    all: ['auth'] as const,
    me: () => [...queryKeys.auth.all, 'me'] as const,
    currentUser: () => [...queryKeys.auth.all, 'currentUser'] as const,
  },
  
  patients: {
    all: ['patients'] as const,
    list: (page?: number, limit?: number) => [...queryKeys.patients.all, 'list', page, limit] as const,
    detail: (id: string) => [...queryKeys.patients.all, 'detail', id] as const,
  },
  
  healers: {
    all: ['healers'] as const,
    list: (page?: number, limit?: number) => [...queryKeys.healers.all, 'list', page, limit] as const,
    detail: (id: string) => [...queryKeys.healers.all, 'detail', id] as const,
  },
  
  sessions: {
    all: ['sessions'] as const,
    list: (page?: number, limit?: number) => [...queryKeys.sessions.all, 'list', page, limit] as const,
    detail: (id: string) => [...queryKeys.sessions.all, 'detail', id] as const,
  },
  
  attendance: {
    all: ['attendance'] as const,
    list: (page?: number, limit?: number) => [...queryKeys.attendance.all, 'list', page, limit] as const,
    detail: (id: string) => [...queryKeys.attendance.all, 'detail', id] as const,
  },
  
  finance: {
    all: ['finance'] as const,
    reports: () => [...queryKeys.finance.all, 'reports'] as const,
    transactions: (page?: number, limit?: number) => [...queryKeys.finance.all, 'transactions', page, limit] as const,
  },
  
  visitors: {
    all: ['visitors'] as const,
    list: (page?: number, limit?: number) => [...queryKeys.visitors.all, 'list', page, limit] as const,
    detail: (id: string) => [...queryKeys.visitors.all, 'detail', id] as const,
  },
  
  reports: {
    all: ['reports'] as const,
    attendance: () => [...queryKeys.reports.all, 'attendance'] as const,
    revenue: () => [...queryKeys.reports.all, 'revenue'] as const,
    sessions: () => [...queryKeys.reports.all, 'sessions'] as const,
  },
};
