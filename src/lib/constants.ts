/**
 * Application constants
 */

// Application metadata
export const APP_NAME = 'TokNxr';
export const APP_DESCRIPTION = 'AI effectiveness & code quality analysis system';
export const APP_VERSION = '1.0.0';

// API endpoints
export const API_ENDPOINTS = {
  AUTH: '/api/auth',
  INTERACTIONS: '/api/interactions',
  ORGANIZATIONS: '/api/organizations',
  PROJECTS: '/api/projects',
  ANALYTICS: '/api/analytics',
} as const;

// AI Providers
export const AI_PROVIDERS = {
  OPENAI: 'openai',
  ANTHROPIC: 'anthropic',
  OLLAMA: 'ollama',
  GEMINI: 'gemini',
} as const;

export const AI_PROVIDER_LABELS = {
  [AI_PROVIDERS.OPENAI]: 'OpenAI',
  [AI_PROVIDERS.ANTHROPIC]: 'Anthropic',
  [AI_PROVIDERS.OLLAMA]: 'Ollama',
  [AI_PROVIDERS.GEMINI]: 'Google Gemini',
} as const;

// Quality ratings
export const QUALITY_RATINGS = {
  USEFUL: 'useful',
  PARTIAL: 'partial',
  WASTED: 'wasted',
} as const;

export const QUALITY_RATING_LABELS = {
  [QUALITY_RATINGS.USEFUL]: 'Useful',
  [QUALITY_RATINGS.PARTIAL]: 'Partial',
  [QUALITY_RATINGS.WASTED]: 'Wasted',
} as const;

export const QUALITY_RATING_COLORS = {
  [QUALITY_RATINGS.USEFUL]: 'text-green-600 bg-green-100',
  [QUALITY_RATINGS.PARTIAL]: 'text-yellow-600 bg-yellow-100',
  [QUALITY_RATINGS.WASTED]: 'text-red-600 bg-red-100',
} as const;

// Routes
export const ROUTES = {
  HOME: '/',
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
  CLI_LOGIN: '/cli-login',
  TRACKER: '/tracker',
  ORGANIZATIONS: '/organizations',
  PROJECTS: '/projects',
  SETTINGS: '/settings',
} as const;

// Local storage keys
export const STORAGE_KEYS = {
  THEME: 'toknxr-theme',
  USER_PREFERENCES: 'toknxr-user-preferences',
  LAST_VISITED_ROUTE: 'toknxr-last-route',
} as const;

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
} as const;

// Validation rules
export const VALIDATION = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD_MIN_LENGTH: 8,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 50,
  DESCRIPTION_MAX_LENGTH: 500,
  PROJECT_NAME_MAX_LENGTH: 100,
  ORGANIZATION_NAME_MAX_LENGTH: 100,
} as const;

// File upload
export const FILE_UPLOAD = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
} as const;

// Date formats
export const DATE_FORMATS = {
  SHORT: 'MMM d, yyyy',
  LONG: 'MMMM d, yyyy',
  WITH_TIME: 'MMM d, yyyy h:mm a',
  ISO: 'yyyy-MM-dd',
  TIME_ONLY: 'h:mm a',
} as const;

// Theme colors
export const THEME_COLORS = {
  PRIMARY: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },
  GRAY: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },
} as const;

// Animation durations (in milliseconds)
export const ANIMATION_DURATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
} as const;

// Breakpoints (matching Tailwind CSS)
export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  '2XL': 1536,
} as const;

// Error messages
export const ERROR_MESSAGES = {
  GENERIC: 'An unexpected error occurred. Please try again.',
  NETWORK: 'Network error. Please check your connection and try again.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  FORBIDDEN: 'Access denied. You do not have permission to access this resource.',
  NOT_FOUND: 'The requested resource was not found.',
  VALIDATION: 'Please check your input and try again.',
  SERVER_ERROR: 'Server error. Please try again later.',
} as const;

// Success messages
export const SUCCESS_MESSAGES = {
  SAVED: 'Changes saved successfully.',
  CREATED: 'Created successfully.',
  UPDATED: 'Updated successfully.',
  DELETED: 'Deleted successfully.',
  SENT: 'Sent successfully.',
} as const;

// Feature flags
export const FEATURE_FLAGS = {
  ANALYTICS: true,
  ORGANIZATIONS: true,
  PROJECTS: true,
  REAL_TIME_UPDATES: true,
  PERFORMANCE_MONITORING: true,
} as const;

// External links
export const EXTERNAL_LINKS = {
  GITHUB: 'https://github.com/yourusername/toknxr',
  DOCUMENTATION: 'https://docs.toknxr.com',
  SUPPORT: 'https://support.toknxr.com',
  PRIVACY_POLICY: 'https://toknxr.com/privacy',
  TERMS_OF_SERVICE: 'https://toknxr.com/terms',
} as const;

// Performance thresholds
export const PERFORMANCE_THRESHOLDS = {
  FCP: { GOOD: 1800, POOR: 3000 }, // First Contentful Paint
  LCP: { GOOD: 2500, POOR: 4000 }, // Largest Contentful Paint
  FID: { GOOD: 100, POOR: 300 }, // First Input Delay
  CLS: { GOOD: 0.1, POOR: 0.25 }, // Cumulative Layout Shift
  TTI: { GOOD: 3800, POOR: 7300 }, // Time to Interactive
} as const;