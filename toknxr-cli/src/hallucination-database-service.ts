/**
 * Hallucination Database Service
 * Handles all database operations for hallucination analysis data
 */

import {
  HallucinationDatabaseService,
  HallucinationAnalysisRecord,
  HallucinationCategoryRecord,
  ExecutionResultRecord,
  ExecutionErrorRecord,
  HallucinationRecommendationRecord,
  HistoricalPatternRecord,
  CreateHallucinationAnalysisInput,
  CreateHallucinationCategoryInput,
  CreateExecutionResultInput,
  CreateHallucinationRecommendationInput,
  CompleteHallucinationAnalysis,
  HallucinationAnalysisFilters,
  HallucinationCategoryFilters,
  PaginationOptions,
  HallucinationSummaryByProvider,
  HallucinationCategoryBreakdown,
  RecentHallucinationTrends,
} from './types/database-types.js';

/**
 * Mock implementation of the hallucination database service
 * In a real implementation, this would connect to Supabase/PostgreSQL
 */
export class MockHallucinationDatabaseService implements HallucinationDatabaseService {
  private analyses: Map<string, HallucinationAnalysisRecord> = new Map();
  private categories: Map<string, HallucinationCategoryRecord[]> = new Map();
  private executionResults: Map<string, ExecutionResultRecord> = new Map();
  private recommendations: Map<string, HallucinationRecommendationRecord[]> = new Map();
  private historicalPatterns: Map<string, HistoricalPatternRecord> = new Map();

  /**
   * Create a new hallucination analysis record
   */
  async createAnalysis(input: CreateHallucinationAnalysisInput): Promise<HallucinationAnalysisRecord> {
    const id = this.generateId();
    const now = new Date().toISOString();
    
    const analysis: HallucinationAnalysisRecord = {
      id,
      ...input,
      created_at: now,
      updated_at: now,
    };
    
    this.analyses.set(id, analysis);
    return analysis;
  }

  /**
   * Get complete hallucination analysis with all related data
   */
  async getAnalysis(id: string): Promise<CompleteHallucinationAnalysis | null> {
    const analysis = this.analyses.get(id);
    if (!analysis) return null;

    const categories = this.categories.get(id) || [];
    const executionResult = this.executionResults.get(id);
    const recommendations = this.recommendations.get(id) || [];
    
    return {
      analysis,
      categories,
      execution_result: executionResult,
      execution_errors: [], // Would be populated from execution_errors table
      recommendations,
    };
  }

  /**
   * Get analyses by interaction ID
   */
  async getAnalysesByInteraction(interactionId: string): Promise<HallucinationAnalysisRecord[]> {
    return Array.from(this.analyses.values()).filter(
      analysis => analysis.interaction_id === interactionId
    );
  }

  /**
   * List analyses with optional filtering and pagination
   */
  async listAnalyses(
    filters?: HallucinationAnalysisFilters,
    pagination?: PaginationOptions
  ): Promise<HallucinationAnalysisRecord[]> {
    let results = Array.from(this.analyses.values());

    // Apply filters
    if (filters) {
      if (filters.overall_risk) {
        results = results.filter(a => a.overall_risk === filters.overall_risk);
      }
      if (filters.has_critical_issues !== undefined) {
        results = results.filter(a => a.has_critical_issues === filters.has_critical_issues);
      }
      if (filters.min_hallucination_rate !== undefined) {
        results = results.filter(a => a.overall_hallucination_rate >= filters.min_hallucination_rate!);
      }
      if (filters.max_hallucination_rate !== undefined) {
        results = results.filter(a => a.overall_hallucination_rate <= filters.max_hallucination_rate!);
      }
    }

    // Apply pagination
    if (pagination) {
      const page = pagination.page || 1;
      const limit = pagination.limit || 10;
      const offset = (page - 1) * limit;
      
      // Sort if specified
      if (pagination.sort_by) {
        results.sort((a, b) => {
          const aVal = (a as any)[pagination.sort_by!];
          const bVal = (b as any)[pagination.sort_by!];
          const order = pagination.sort_order === 'desc' ? -1 : 1;
          return aVal < bVal ? -order : aVal > bVal ? order : 0;
        });
      }
      
      results = results.slice(offset, offset + limit);
    }

    return results;
  }

  /**
   * Create a new hallucination category
   */
  async createCategory(input: CreateHallucinationCategoryInput): Promise<HallucinationCategoryRecord> {
    const id = this.generateId();
    const now = new Date().toISOString();
    
    const category: HallucinationCategoryRecord = {
      id,
      analysis_id: input.analysis_id,
      category_type: input.category_type,
      category_subtype: input.category_subtype as any, // Type assertion for subtype
      severity: input.severity,
      confidence: input.confidence,
      detection_method: input.detection_method,
      evidence: input.evidence,
      line_numbers: input.line_numbers || null,
      error_message: input.error_message || null,
      suggested_fix: input.suggested_fix || null,
      estimated_dev_time_wasted: input.estimated_dev_time_wasted,
      cost_multiplier: input.cost_multiplier,
      quality_impact: input.quality_impact,
      estimated_cost_usd: input.estimated_cost_usd || null,
      created_at: now,
    };
    
    // Add to categories map
    const existingCategories = this.categories.get(input.analysis_id) || [];
    existingCategories.push(category);
    this.categories.set(input.analysis_id, existingCategories);
    
    return category;
  }

  /**
   * Get categories by analysis ID
   */
  async getCategoriesByAnalysis(analysisId: string): Promise<HallucinationCategoryRecord[]> {
    return this.categories.get(analysisId) || [];
  }

  /**
   * List categories with optional filtering
   */
  async listCategories(
    filters?: HallucinationCategoryFilters,
    pagination?: PaginationOptions
  ): Promise<HallucinationCategoryRecord[]> {
    let results: HallucinationCategoryRecord[] = [];
    
    // Flatten all categories
    for (const categories of this.categories.values()) {
      results.push(...categories);
    }

    // Apply filters
    if (filters) {
      if (filters.category_type) {
        results = results.filter(c => c.category_type === filters.category_type);
      }
      if (filters.severity) {
        results = results.filter(c => c.severity === filters.severity);
      }
      if (filters.min_confidence !== undefined) {
        results = results.filter(c => c.confidence >= filters.min_confidence!);
      }
      if (filters.detection_method) {
        results = results.filter(c => c.detection_method === filters.detection_method);
      }
    }

    // Apply pagination (similar to listAnalyses)
    if (pagination) {
      const page = pagination.page || 1;
      const limit = pagination.limit || 10;
      const offset = (page - 1) * limit;
      results = results.slice(offset, offset + limit);
    }

    return results;
  }

  /**
   * Create execution result
   */
  async createExecutionResult(input: CreateExecutionResultInput): Promise<ExecutionResultRecord> {
    const id = this.generateId();
    const now = new Date().toISOString();
    
    const executionResult: ExecutionResultRecord = {
      id,
      ...input,
      exit_code: input.exit_code || null,
      output: input.output || null,
      stderr: input.stderr || null,
      peak_memory_mb: input.peak_memory_mb || null,
      system_calls: input.system_calls || null,
      created_at: now,
    };
    
    this.executionResults.set(input.analysis_id, executionResult);
    return executionResult;
  }

  /**
   * Get execution result by analysis ID
   */
  async getExecutionResult(analysisId: string): Promise<ExecutionResultRecord | null> {
    return this.executionResults.get(analysisId) || null;
  }

  /**
   * Create recommendation
   */
  async createRecommendation(input: CreateHallucinationRecommendationInput): Promise<HallucinationRecommendationRecord> {
    const id = this.generateId();
    const now = new Date().toISOString();
    
    const recommendation: HallucinationRecommendationRecord = {
      id,
      ...input,
      estimated_time_to_fix: input.estimated_time_to_fix || null,
      resources: input.resources || null,
      created_at: now,
    };
    
    // Add to recommendations map
    const existingRecommendations = this.recommendations.get(input.analysis_id) || [];
    existingRecommendations.push(recommendation);
    this.recommendations.set(input.analysis_id, existingRecommendations);
    
    return recommendation;
  }

  /**
   * Get recommendations by analysis ID
   */
  async getRecommendationsByAnalysis(analysisId: string): Promise<HallucinationRecommendationRecord[]> {
    return this.recommendations.get(analysisId) || [];
  }

  /**
   * Get provider summary (mock implementation)
   */
  async getProviderSummary(): Promise<HallucinationSummaryByProvider[]> {
    // In a real implementation, this would query the database view
    return [
      {
        provider: 'Gemini-Pro',
        total_analyses: 15,
        avg_hallucination_rate: 0.65,
        total_critical: 3,
        total_high: 8,
        total_medium: 4,
        total_low: 0,
        avg_quality_impact: 28.5,
      },
      {
        provider: 'OpenAI-GPT4',
        total_analyses: 8,
        avg_hallucination_rate: 0.45,
        total_critical: 1,
        total_high: 3,
        total_medium: 3,
        total_low: 1,
        avg_quality_impact: 18.2,
      },
    ];
  }

  /**
   * Get category breakdown (mock implementation)
   */
  async getCategoryBreakdown(): Promise<HallucinationCategoryBreakdown[]> {
    return [
      {
        category_type: 'naming',
        category_subtype: 'identity',
        occurrence_count: 12,
        avg_confidence: 0.85,
        avg_dev_time_wasted: 2.1,
        avg_quality_impact: 22.0,
      },
      {
        category_type: 'mapping',
        category_subtype: 'data_compliance',
        occurrence_count: 8,
        avg_confidence: 0.78,
        avg_dev_time_wasted: 2.8,
        avg_quality_impact: 26.5,
      },
      {
        category_type: 'resource',
        category_subtype: 'computational_boundary',
        occurrence_count: 5,
        avg_confidence: 0.92,
        avg_dev_time_wasted: 4.2,
        avg_quality_impact: 38.0,
      },
    ];
  }

  /**
   * Get recent trends (mock implementation)
   */
  async getRecentTrends(days: number = 30): Promise<RecentHallucinationTrends[]> {
    const trends: RecentHallucinationTrends[] = [];
    const now = new Date();
    
    for (let i = 0; i < Math.min(days, 7); i++) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      
      trends.push({
        analysis_date: date.toISOString().split('T')[0],
        total_analyses: Math.floor(Math.random() * 10) + 1,
        avg_rate: Math.random() * 0.8 + 0.2,
        critical_issues: Math.floor(Math.random() * 3),
        critical_analyses: Math.floor(Math.random() * 2),
      });
    }
    
    return trends.reverse(); // Oldest first
  }

  /**
   * Update historical pattern
   */
  async updateHistoricalPattern(patternId: string, categories: string[]): Promise<void> {
    const existing = this.historicalPatterns.get(patternId);
    const now = new Date().toISOString();
    
    if (existing) {
      existing.frequency += 1;
      existing.last_seen = now;
      existing.updated_at = now;
      // Update reliability based on frequency
      existing.reliability = Math.min(0.95, existing.frequency / 20);
    } else {
      const newPattern: HistoricalPatternRecord = {
        id: this.generateId(),
        pattern_id: patternId,
        frequency: 1,
        categories,
        success_rate: 0.5, // Initial estimate
        reliability: 0.1, // Low initial reliability
        first_seen: now,
        last_seen: now,
        updated_at: now,
      };
      this.historicalPatterns.set(patternId, newPattern);
    }
  }

  /**
   * Get historical patterns
   */
  async getHistoricalPatterns(minReliability: number = 0.5): Promise<HistoricalPatternRecord[]> {
    return Array.from(this.historicalPatterns.values()).filter(
      pattern => pattern.reliability >= minReliability
    );
  }

  /**
   * Helper method to generate unique IDs
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

/**
 * Factory function to create database service
 * In production, this would create a real Supabase-connected service
 */
export function createHallucinationDatabaseService(): HallucinationDatabaseService {
  // For now, return mock service
  // In production: return new SupabaseHallucinationDatabaseService();
  return new MockHallucinationDatabaseService();
}

/**
 * Utility functions for database operations
 */

/**
 * Convert CodeHaluResult to database records
 */
export function convertCodeHaluResultToDbRecords(
  result: import('./types/hallucination-types.js').CodeHaluResult,
  interactionId: string
): {
  analysis: CreateHallucinationAnalysisInput;
  categories: CreateHallucinationCategoryInput[];
  executionResult?: CreateExecutionResultInput;
  recommendations: CreateHallucinationRecommendationInput[];
} {
  // Create analysis record
  const analysis: CreateHallucinationAnalysisInput = {
    interaction_id: interactionId,
    overall_hallucination_rate: result.overallHallucinationRate,
    analysis_version: result.detectionMetadata.detectionVersion,
    detection_time_ms: result.detectionMetadata.analysisTimeMs,
    code_length: result.detectionMetadata.codeLength,
    language: result.detectionMetadata.language,
    execution_verified: result.detectionMetadata.executionVerified,
    has_critical_issues: result.hasCriticalIssues,
    code_quality_impact: result.codeQualityImpact,
    total_hallucinations: result.summary.totalHallucinations,
    critical_count: result.summary.criticalCount,
    high_severity_count: result.summary.highSeverityCount,
    medium_severity_count: result.summary.mediumSeverityCount,
    low_severity_count: result.summary.lowSeverityCount,
    most_common_category: result.summary.mostCommonCategory,
    overall_risk: result.summary.overallRisk,
  };

  // Create category records
  const categories: CreateHallucinationCategoryInput[] = result.categories.map(category => ({
    analysis_id: '', // Will be set after analysis is created
    category_type: category.type,
    category_subtype: category.subtype,
    severity: category.severity,
    confidence: category.confidence,
    detection_method: category.detectionMethod,
    evidence: category.evidence,
    line_numbers: category.lineNumbers,
    error_message: category.errorMessage,
    suggested_fix: category.suggestedFix,
    estimated_dev_time_wasted: category.businessImpact.estimatedDevTimeWasted,
    cost_multiplier: category.businessImpact.costMultiplier,
    quality_impact: category.businessImpact.qualityImpact,
    estimated_cost_usd: category.businessImpact.estimatedCostUSD,
  }));

  // Create execution result if available
  let executionResult: CreateExecutionResultInput | undefined;
  if (result.executionResult) {
    executionResult = {
      analysis_id: '', // Will be set after analysis is created
      success: result.executionResult.success,
      exit_code: result.executionResult.exitCode,
      timed_out: result.executionResult.timedOut,
      output: result.executionResult.output,
      stderr: result.executionResult.stderr,
      errors: result.executionResult.errors.map(error => ({
        type: error.type,
        message: error.message,
        line_number: error.lineNumber,
        column_number: error.columnNumber,
        stack_trace: error.stackTrace,
      })),
      memory_mb: result.executionResult.resourceUsage.memoryMB,
      execution_time_ms: result.executionResult.resourceUsage.executionTimeMs,
      cpu_usage: result.executionResult.resourceUsage.cpuUsage,
      peak_memory_mb: result.executionResult.resourceUsage.peakMemoryMB,
      system_calls: result.executionResult.resourceUsage.systemCalls,
      security_flags: result.executionResult.securityFlags,
    };
  }

  // Create recommendation records
  const recommendations: CreateHallucinationRecommendationInput[] = result.recommendations.map(rec => ({
    analysis_id: '', // Will be set after analysis is created
    category_type: rec.category,
    priority: rec.priority,
    title: rec.title,
    description: rec.description,
    action_items: rec.actionItems,
    expected_impact: rec.expectedImpact,
    estimated_time_to_fix: rec.estimatedTimeToFix,
    resources: rec.resources,
  }));

  return {
    analysis,
    categories,
    executionResult,
    recommendations,
  };
}