// Types for dashboard

export interface DashboardStats {
  totalCost: number;
  wasteRate: number;
  hallucinationFreq: number;
}

export interface Interaction {
  id: string;
  provider: string;
  model: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  costUSD: number;
  taskType: string;
  qualityRating: 'useful' | 'partial' | 'wasted';
  hallucination: boolean;
  timestamp: string | Date; // Supabase timestamp
}

export type QualityRating = 'useful' | 'partial' | 'wasted';