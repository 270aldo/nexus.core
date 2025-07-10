export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const API_ENDPOINTS = {
  auth: {
    login: '/auth/login',
    logout: '/auth/logout',
    refresh: '/auth/refresh',
    me: '/auth/me',
  },
  clients: {
    list: '/api/v1/clients',
    create: '/api/v1/clients',
    get: (id: string) => `/api/v1/clients/${id}`,
    update: (id: string) => `/api/v1/clients/${id}`,
    delete: (id: string) => `/api/v1/clients/${id}`,
    search: '/api/v1/clients/search',
  },
  programs: {
    list: '/api/v1/programs',
    create: '/api/v1/programs',
    get: (id: string) => `/api/v1/programs/${id}`,
    update: (id: string) => `/api/v1/programs/${id}`,
    delete: (id: string) => `/api/v1/programs/${id}`,
  },
  analytics: {
    adherence: '/api/v1/analytics/adherence',
    effectiveness: '/api/v1/analytics/effectiveness',
    business: '/api/v1/analytics/business-metrics',
  },
  mcp: {
    chat: '/api/v1/mcp/chat',
    status: '/api/v1/mcp/status',
    analysis: '/api/v1/mcp/analysis',
  },
  health: '/health',
} as const;

export const PROGRAM_TYPES = {
  PRIME: 'PRIME',
  LONGEVITY: 'LONGEVITY',
} as const;

export const CLIENT_STATUS = {
  TRIAL: 'TRIAL',
  ACTIVE: 'ACTIVE',
  PAUSED: 'PAUSED',
  CANCELLED: 'CANCELLED',
} as const;

export const USER_ROLES = {
  ADMIN: 'admin',
  TRAINER: 'trainer',
  SPECIALIST: 'specialist',
} as const;

export const NOTIFICATION_TYPES = {
  INFO: 'info',
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error',
} as const;

export const DEFAULT_PAGINATION = {
  page: 1,
  limit: 10,
} as const;

export const DATE_FORMATS = {
  display: 'MMM dd, yyyy',
  input: 'yyyy-MM-dd',
  full: 'MMMM dd, yyyy HH:mm',
} as const;

export const THEME_OPTIONS = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system',
} as const;