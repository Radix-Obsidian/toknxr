/**
 * Global type definitions for TokNxr application
 */

import { User as SupabaseUser } from '@supabase/supabase-js';

// User and Authentication Types
export interface User extends SupabaseUser {
  displayName?: string;
  email?: string;
  photoURL?: string;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

// AI Provider Types
export type AIProvider = 'openai' | 'anthropic' | 'ollama' | 'gemini';

export type QualityRating = 'useful' | 'partial' | 'wasted';

// Interaction and Analytics Types
export interface Interaction {
  id: string;
  provider: AIProvider;
  model: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  costUSD: number;
  taskType: string;
  qualityRating: QualityRating;
  hallucination: boolean;
  timestamp: string | Date;
  userId?: string;
  projectId?: string;
  organizationId?: string;
}

export interface DashboardStats {
  totalCost: number;
  wasteRate: number;
  hallucinationFreq: number;
  totalInteractions: number;
  averageQuality: number;
}

// Organization and Project Types
export interface Organization {
  id: string;
  name: string;
  description?: string;
  createdAt: string | Date;
  updatedAt: string | Date;
  ownerId: string;
  memberIds: string[];
  settings: OrganizationSettings;
}

export interface OrganizationSettings {
  budgetLimit?: number;
  alertThresholds: {
    cost: number;
    wasteRate: number;
    hallucinationRate: number;
  };
  allowedProviders: AIProvider[];
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  organizationId: string;
  createdAt: string | Date;
  updatedAt: string | Date;
  settings: ProjectSettings;
}

export interface ProjectSettings {
  budgetLimit?: number;
  trackingEnabled: boolean;
  qualityThreshold: number;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Form and UI Types
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'select' | 'checkbox' | 'textarea';
  required?: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
}

export interface LoadingState {
  isLoading: boolean;
  error?: string | null;
}

// Performance Monitoring Types
export interface PerformanceMetric {
  name: string;
  value: number;
  route: string;
  timestamp: Date;
}

export interface WebVital {
  id: string;
  name: 'FCP' | 'LCP' | 'CLS' | 'FID' | 'TTI';
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
}

// Error Types
export interface AppError extends Error {
  code?: string;
  statusCode?: number;
  context?: Record<string, any>;
}

// Environment Types
export interface EnvironmentConfig {
  NODE_ENV: 'development' | 'production' | 'test';
  NEXT_PUBLIC_SUPABASE_URL: string;
  NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  SUPABASE_JWT_SECRET?: string;
}

// Utility Types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type NonEmptyArray<T> = [T, ...T[]];

// Component Props Types
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
  'data-testid'?: string;
}

export interface ModalProps extends BaseComponentProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export interface ButtonProps extends BaseComponentProps {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}