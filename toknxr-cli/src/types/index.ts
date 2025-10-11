/**
 * TokNXR Type Definitions
 * Centralized exports for all TypeScript types and interfaces
 */

// Enhanced Hallucination Detection Types
export * from './hallucination-types.js';

// Database Types for Hallucination Analysis
export * from './database-types.js';

// Re-export existing types for backward compatibility
export interface Interaction {
  provider: string;
  totalTokens: number;
  promptTokens: number;
  completionTokens: number;
  costUSD: number;
  taskType?: string;
  codeQualityScore?: number;
  effectivenessScore?: number;
  codeQualityMetrics?: {
    language?: string;
    potentialIssues?: string[];
  };
  userPrompt?: string;
  model?: string;
  requestId?: string;
  timestamp?: string;
  
  // New: Enhanced hallucination analysis
  hallucinationAnalysis?: import('./hallucination-types.js').CodeHaluResult;
}

// Provider configuration types
export interface ProviderConfig {
  name: string;
  routePrefix: string;
  targetUrl: string;
  apiKeyEnvVar: string;
  authHeader: string;
  authScheme: string;
  tokenMapping: {
    prompt: string;
    completion: string;
    total: string;
  };
}

// Analytics types
export interface ProviderStats {
  totalTokens: number;
  promptTokens: number;
  completionTokens: number;
  requestCount: number;
  costUSD: number;
  codingCount: number;
  qualitySum: number;
  effectivenessSum: number;
  avgQualityScore: number;
  avgEffectivenessScore: number;
  
  // New: Hallucination metrics
  hallucinationRate?: number;
  hallucinationsByCategory?: Record<string, number>;
}

// Enhanced interaction with hallucination data
export interface EnhancedInteraction extends Interaction {
  hallucinationAnalysis: import('./hallucination-types.js').CodeHaluResult;
  enhancedQualityScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  recommendations: import('./hallucination-types.js').Recommendation[];
}