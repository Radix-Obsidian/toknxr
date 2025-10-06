export interface TrackerFormData {
  provider: 'openai' | 'anthropic' | 'ollama' | 'gemini';
  model: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  costUSD: number;
  taskType: string;
  qualityRating: 'useful' | 'partial' | 'wasted';
  errorDetected: boolean;
  hallucination: boolean;
}

export interface TrackerState {
  formData: TrackerFormData;
  result: string;
  error: string;
  isSubmitting: boolean;
}

export interface TrackerResponse {
  success: boolean;
  data?: any;
  message?: string;
}