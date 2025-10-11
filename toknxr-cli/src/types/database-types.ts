/**
 * Database Types for Hallucination Analysis
 * TypeScript interfaces matching the PostgreSQL schema
 */

/**
 * Main hallucination analysis record
 */
export interface HallucinationAnalysisRecord {
  id: string;
  interaction_id: string;
  overall_hallucination_rate: number;
  analysis_version: string;
  detection_time_ms: number;
  code_length: number;
  language: string;
  execution_verified: boolean;
  has_critical_issues: boolean;
  code_quality_impact: number;
  
  // Summary statistics
  total_hallucinations: number;
  critical_count: number;
  high_severity_count: number;
  medium_severity_count: number;
  low_severity_count: number;
  most_common_category: string | null;
  overall_risk: 'low' | 'medium' | 'high' | 'critical';
  
  created_at: string;
  updated_at: string;
}

/**
 * Individual hallucination category record
 */
export interface HallucinationCategoryRecord {
  id: string;
  analysis_id: string;
  
  // Category classification
  category_type: 'mapping' | 'naming' | 'resource' | 'logic';
  category_subtype: 
    | 'data_compliance' | 'structure_access'
    | 'identity' | 'external_source'
    | 'physical_constraint' | 'computational_boundary'
    | 'logic_deviation' | 'logic_breakdown';
  
  // Severity and confidence
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  
  // Detection details
  detection_method: 'static' | 'execution' | 'pattern' | 'statistical';
  evidence: string[]; // JSONB array
  line_numbers: number[] | null;
  error_message: string | null;
  suggested_fix: string | null;
  
  // Business impact
  estimated_dev_time_wasted: number;
  cost_multiplier: number;
  quality_impact: number;
  estimated_cost_usd: number | null;
  
  created_at: string;
}

/**
 * Execution result record
 */
export interface ExecutionResultRecord {
  id: string;
  analysis_id: string;
  
  // Execution status
  success: boolean;
  exit_code: number | null;
  timed_out: boolean;
  
  // Output and errors
  output: string | null;
  stderr: string | null;
  errors: ExecutionErrorData[]; // JSONB array
  
  // Resource usage
  memory_mb: number;
  execution_time_ms: number;
  cpu_usage: number;
  peak_memory_mb: number | null;
  system_calls: number | null;
  
  // Security
  security_flags: string[]; // JSONB array
  
  created_at: string;
}

/**
 * Individual execution error record
 */
export interface ExecutionErrorRecord {
  id: string;
  execution_result_id: string;
  
  error_type: string;
  error_message: string;
  line_number: number | null;
  column_number: number | null;
  stack_trace: string | null;
  
  created_at: string;
}

/**
 * Hallucination recommendation record
 */
export interface HallucinationRecommendationRecord {
  id: string;
  analysis_id: string;
  
  category_type: 'mapping' | 'naming' | 'resource' | 'logic';
  priority: 'low' | 'medium' | 'high';
  
  title: string;
  description: string;
  action_items: string[]; // JSONB array
  expected_impact: string;
  estimated_time_to_fix: string | null;
  resources: string[] | null; // JSONB array
  
  created_at: string;
}

/**
 * Historical pattern record
 */
export interface HistoricalPatternRecord {
  id: string;
  
  pattern_id: string;
  frequency: number;
  categories: string[]; // Array of category types
  success_rate: number;
  reliability: number;
  
  first_seen: string;
  last_seen: string;
  updated_at: string;
}

/**
 * Execution error data structure (stored in JSONB)
 */
export interface ExecutionErrorData {
  type: string;
  message: string;
  line_number?: number;
  column_number?: number;
  stack_trace?: string;
}

/**
 * Database view types
 */

/**
 * Hallucination summary by provider view
 */
export interface HallucinationSummaryByProvider {
  provider: string;
  total_analyses: number;
  avg_hallucination_rate: number;
  total_critical: number;
  total_high: number;
  total_medium: number;
  total_low: number;
  avg_quality_impact: number;
}

/**
 * Category breakdown view
 */
export interface HallucinationCategoryBreakdown {
  category_type: string;
  category_subtype: string;
  occurrence_count: number;
  avg_confidence: number;
  avg_dev_time_wasted: number;
  avg_quality_impact: number;
}

/**
 * Recent trends view
 */
export interface RecentHallucinationTrends {
  analysis_date: string;
  total_analyses: number;
  avg_rate: number;
  critical_issues: number;
  critical_analyses: number;
}

/**
 * Database operation interfaces
 */

/**
 * Input for creating hallucination analysis
 */
export interface CreateHallucinationAnalysisInput {
  interaction_id: string;
  overall_hallucination_rate: number;
  analysis_version: string;
  detection_time_ms: number;
  code_length: number;
  language: string;
  execution_verified: boolean;
  has_critical_issues: boolean;
  code_quality_impact: number;
  total_hallucinations: number;
  critical_count: number;
  high_severity_count: number;
  medium_severity_count: number;
  low_severity_count: number;
  most_common_category: string | null;
  overall_risk: 'low' | 'medium' | 'high' | 'critical';
}

/**
 * Input for creating hallucination category
 */
export interface CreateHallucinationCategoryInput {
  analysis_id: string;
  category_type: 'mapping' | 'naming' | 'resource' | 'logic';
  category_subtype: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  detection_method: 'static' | 'execution' | 'pattern' | 'statistical';
  evidence: string[];
  line_numbers?: number[];
  error_message?: string;
  suggested_fix?: string;
  estimated_dev_time_wasted: number;
  cost_multiplier: number;
  quality_impact: number;
  estimated_cost_usd?: number;
}

/**
 * Input for creating execution result
 */
export interface CreateExecutionResultInput {
  analysis_id: string;
  success: boolean;
  exit_code?: number;
  timed_out: boolean;
  output?: string;
  stderr?: string;
  errors: ExecutionErrorData[];
  memory_mb: number;
  execution_time_ms: number;
  cpu_usage: number;
  peak_memory_mb?: number;
  system_calls?: number;
  security_flags: string[];
}

/**
 * Input for creating recommendation
 */
export interface CreateHallucinationRecommendationInput {
  analysis_id: string;
  category_type: 'mapping' | 'naming' | 'resource' | 'logic';
  priority: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  action_items: string[];
  expected_impact: string;
  estimated_time_to_fix?: string;
  resources?: string[];
}

/**
 * Query filters for hallucination analysis
 */
export interface HallucinationAnalysisFilters {
  provider?: string;
  language?: string;
  overall_risk?: 'low' | 'medium' | 'high' | 'critical';
  has_critical_issues?: boolean;
  date_from?: string;
  date_to?: string;
  min_hallucination_rate?: number;
  max_hallucination_rate?: number;
}

/**
 * Query filters for hallucination categories
 */
export interface HallucinationCategoryFilters {
  category_type?: 'mapping' | 'naming' | 'resource' | 'logic';
  category_subtype?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  min_confidence?: number;
  detection_method?: 'static' | 'execution' | 'pattern' | 'statistical';
}

/**
 * Pagination options
 */
export interface PaginationOptions {
  page?: number;
  limit?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

/**
 * Complete hallucination analysis with related data
 */
export interface CompleteHallucinationAnalysis {
  analysis: HallucinationAnalysisRecord;
  categories: HallucinationCategoryRecord[];
  execution_result?: ExecutionResultRecord;
  execution_errors: ExecutionErrorRecord[];
  recommendations: HallucinationRecommendationRecord[];
}

/**
 * Database service interface
 */
export interface HallucinationDatabaseService {
  // Analysis operations
  createAnalysis(input: CreateHallucinationAnalysisInput): Promise<HallucinationAnalysisRecord>;
  getAnalysis(id: string): Promise<CompleteHallucinationAnalysis | null>;
  getAnalysesByInteraction(interactionId: string): Promise<HallucinationAnalysisRecord[]>;
  listAnalyses(filters?: HallucinationAnalysisFilters, pagination?: PaginationOptions): Promise<HallucinationAnalysisRecord[]>;
  
  // Category operations
  createCategory(input: CreateHallucinationCategoryInput): Promise<HallucinationCategoryRecord>;
  getCategoriesByAnalysis(analysisId: string): Promise<HallucinationCategoryRecord[]>;
  listCategories(filters?: HallucinationCategoryFilters, pagination?: PaginationOptions): Promise<HallucinationCategoryRecord[]>;
  
  // Execution operations
  createExecutionResult(input: CreateExecutionResultInput): Promise<ExecutionResultRecord>;
  getExecutionResult(analysisId: string): Promise<ExecutionResultRecord | null>;
  
  // Recommendation operations
  createRecommendation(input: CreateHallucinationRecommendationInput): Promise<HallucinationRecommendationRecord>;
  getRecommendationsByAnalysis(analysisId: string): Promise<HallucinationRecommendationRecord[]>;
  
  // Analytics operations
  getProviderSummary(): Promise<HallucinationSummaryByProvider[]>;
  getCategoryBreakdown(): Promise<HallucinationCategoryBreakdown[]>;
  getRecentTrends(days?: number): Promise<RecentHallucinationTrends[]>;
  
  // Historical patterns
  updateHistoricalPattern(patternId: string, categories: string[]): Promise<void>;
  getHistoricalPatterns(minReliability?: number): Promise<HistoricalPatternRecord[]>;
}