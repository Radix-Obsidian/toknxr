/**
 * Unit tests for Hallucination Database Service
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import { 
  MockHallucinationDatabaseService,
  convertCodeHaluResultToDbRecords,
} from '../../src/hallucination-database-service.js';
import {
  CreateHallucinationAnalysisInput,
  CreateHallucinationCategoryInput,
  CreateExecutionResultInput,
  CreateHallucinationRecommendationInput,
} from '../../src/types/database-types.js';

describe('MockHallucinationDatabaseService', () => {
  let service: MockHallucinationDatabaseService;

  beforeEach(() => {
    service = new MockHallucinationDatabaseService();
  });

  describe('Analysis Operations', () => {
    it('should create and retrieve hallucination analysis', async () => {
      const input: CreateHallucinationAnalysisInput = {
        interaction_id: 'test-interaction-123',
        overall_hallucination_rate: 0.75,
        analysis_version: '1.0.0',
        detection_time_ms: 150,
        code_length: 250,
        language: 'python',
        execution_verified: true,
        has_critical_issues: true,
        code_quality_impact: 25.5,
        total_hallucinations: 3,
        critical_count: 1,
        high_severity_count: 1,
        medium_severity_count: 1,
        low_severity_count: 0,
        most_common_category: 'mapping',
        overall_risk: 'high',
      };

      const created = await service.createAnalysis(input);
      
      expect(created.id).toBeDefined();
      expect(created.interaction_id).toBe(input.interaction_id);
      expect(created.overall_hallucination_rate).toBe(input.overall_hallucination_rate);
      expect(created.overall_risk).toBe(input.overall_risk);
      expect(created.created_at).toBeDefined();
      expect(created.updated_at).toBeDefined();

      const retrieved = await service.getAnalysis(created.id);
      expect(retrieved).toBeDefined();
      expect(retrieved!.analysis.id).toBe(created.id);
    });

    it('should list analyses by interaction ID', async () => {
      const interactionId = 'test-interaction-456';
      
      const input1: CreateHallucinationAnalysisInput = {
        interaction_id: interactionId,
        overall_hallucination_rate: 0.5,
        analysis_version: '1.0.0',
        detection_time_ms: 100,
        code_length: 200,
        language: 'python',
        execution_verified: false,
        has_critical_issues: false,
        code_quality_impact: 15.0,
        total_hallucinations: 2,
        critical_count: 0,
        high_severity_count: 1,
        medium_severity_count: 1,
        low_severity_count: 0,
        most_common_category: 'naming',
        overall_risk: 'medium',
      };

      const input2: CreateHallucinationAnalysisInput = {
        ...input1,
        overall_hallucination_rate: 0.8,
        overall_risk: 'high',
      };

      await service.createAnalysis(input1);
      await service.createAnalysis(input2);

      const analyses = await service.getAnalysesByInteraction(interactionId);
      expect(analyses).toHaveLength(2);
      expect(analyses.every(a => a.interaction_id === interactionId)).toBe(true);
    });

    it('should filter analyses by risk level', async () => {
      // Create analyses with different risk levels
      const inputs = [
        { overall_risk: 'low' as const, overall_hallucination_rate: 0.2 },
        { overall_risk: 'medium' as const, overall_hallucination_rate: 0.5 },
        { overall_risk: 'high' as const, overall_hallucination_rate: 0.8 },
        { overall_risk: 'critical' as const, overall_hallucination_rate: 0.95 },
      ];

      for (const input of inputs) {
        await service.createAnalysis({
          interaction_id: 'test-interaction',
          analysis_version: '1.0.0',
          detection_time_ms: 100,
          code_length: 200,
          language: 'python',
          execution_verified: false,
          has_critical_issues: false,
          code_quality_impact: 10,
          total_hallucinations: 1,
          critical_count: 0,
          high_severity_count: 0,
          medium_severity_count: 1,
          low_severity_count: 0,
          most_common_category: 'naming',
          ...input,
        });
      }

      const highRiskAnalyses = await service.listAnalyses({ overall_risk: 'high' });
      expect(highRiskAnalyses).toHaveLength(1);
      expect(highRiskAnalyses[0].overall_risk).toBe('high');

      const criticalAnalyses = await service.listAnalyses({ overall_risk: 'critical' });
      expect(criticalAnalyses).toHaveLength(1);
      expect(criticalAnalyses[0].overall_risk).toBe('critical');
    });
  });

  describe('Category Operations', () => {
    it('should create and retrieve hallucination categories', async () => {
      // First create an analysis
      const analysis = await service.createAnalysis({
        interaction_id: 'test-interaction',
        overall_hallucination_rate: 0.6,
        analysis_version: '1.0.0',
        detection_time_ms: 120,
        code_length: 180,
        language: 'python',
        execution_verified: true,
        has_critical_issues: false,
        code_quality_impact: 20,
        total_hallucinations: 2,
        critical_count: 0,
        high_severity_count: 1,
        medium_severity_count: 1,
        low_severity_count: 0,
        most_common_category: 'mapping',
        overall_risk: 'medium',
      });

      const categoryInput: CreateHallucinationCategoryInput = {
        analysis_id: analysis.id,
        category_type: 'mapping',
        category_subtype: 'data_compliance',
        severity: 'high',
        confidence: 0.85,
        detection_method: 'static',
        evidence: ['Type mismatch detected at: x + "hello"'],
        line_numbers: [3],
        error_message: 'TypeError: unsupported operand type(s)',
        suggested_fix: 'Add type checking before operations',
        estimated_dev_time_wasted: 2.5,
        cost_multiplier: 1.3,
        quality_impact: 25,
        estimated_cost_usd: 12.50,
      };

      const created = await service.createCategory(categoryInput);
      
      expect(created.id).toBeDefined();
      expect(created.analysis_id).toBe(analysis.id);
      expect(created.category_type).toBe('mapping');
      expect(created.severity).toBe('high');
      expect(created.confidence).toBe(0.85);

      const categories = await service.getCategoriesByAnalysis(analysis.id);
      expect(categories).toHaveLength(1);
      expect(categories[0].id).toBe(created.id);
    });

    it('should filter categories by type and severity', async () => {
      const analysis = await service.createAnalysis({
        interaction_id: 'test-interaction',
        overall_hallucination_rate: 0.7,
        analysis_version: '1.0.0',
        detection_time_ms: 140,
        code_length: 220,
        language: 'python',
        execution_verified: false,
        has_critical_issues: true,
        code_quality_impact: 30,
        total_hallucinations: 3,
        critical_count: 1,
        high_severity_count: 1,
        medium_severity_count: 1,
        low_severity_count: 0,
        most_common_category: 'resource',
        overall_risk: 'high',
      });

      // Create categories with different types and severities
      const categories = [
        { category_type: 'mapping' as const, severity: 'high' as const },
        { category_type: 'naming' as const, severity: 'medium' as const },
        { category_type: 'resource' as const, severity: 'critical' as const },
      ];

      for (const cat of categories) {
        await service.createCategory({
          analysis_id: analysis.id,
          category_subtype: 'data_compliance',
          confidence: 0.8,
          detection_method: 'static',
          evidence: ['Test evidence'],
          estimated_dev_time_wasted: 2.0,
          cost_multiplier: 1.2,
          quality_impact: 20,
          ...cat,
        });
      }

      const mappingCategories = await service.listCategories({ category_type: 'mapping' });
      expect(mappingCategories).toHaveLength(1);
      expect(mappingCategories[0].category_type).toBe('mapping');

      const highSeverityCategories = await service.listCategories({ severity: 'high' });
      expect(highSeverityCategories).toHaveLength(1);
      expect(highSeverityCategories[0].severity).toBe('high');
    });
  });

  describe('Execution Operations', () => {
    it('should create and retrieve execution results', async () => {
      const analysis = await service.createAnalysis({
        interaction_id: 'test-interaction',
        overall_hallucination_rate: 0.4,
        analysis_version: '1.0.0',
        detection_time_ms: 80,
        code_length: 150,
        language: 'python',
        execution_verified: true,
        has_critical_issues: false,
        code_quality_impact: 15,
        total_hallucinations: 1,
        critical_count: 0,
        high_severity_count: 0,
        medium_severity_count: 1,
        low_severity_count: 0,
        most_common_category: 'logic',
        overall_risk: 'low',
      });

      const executionInput: CreateExecutionResultInput = {
        analysis_id: analysis.id,
        success: false,
        exit_code: 1,
        timed_out: false,
        output: '',
        stderr: 'TypeError: unsupported operand type(s)',
        errors: [
          {
            type: 'TypeError',
            message: 'unsupported operand type(s) for +: \'int\' and \'str\'',
            line_number: 3,
          }
        ],
        memory_mb: 45.2,
        execution_time_ms: 1250,
        cpu_usage: 15.5,
        peak_memory_mb: 48.1,
        system_calls: 125,
        security_flags: [],
      };

      const created = await service.createExecutionResult(executionInput);
      
      expect(created.id).toBeDefined();
      expect(created.analysis_id).toBe(analysis.id);
      expect(created.success).toBe(false);
      expect(created.errors).toHaveLength(1);
      expect(created.memory_mb).toBe(45.2);

      const retrieved = await service.getExecutionResult(analysis.id);
      expect(retrieved).toBeDefined();
      expect(retrieved!.id).toBe(created.id);
    });
  });

  describe('Recommendation Operations', () => {
    it('should create and retrieve recommendations', async () => {
      const analysis = await service.createAnalysis({
        interaction_id: 'test-interaction',
        overall_hallucination_rate: 0.65,
        analysis_version: '1.0.0',
        detection_time_ms: 130,
        code_length: 190,
        language: 'python',
        execution_verified: false,
        has_critical_issues: false,
        code_quality_impact: 22,
        total_hallucinations: 2,
        critical_count: 0,
        high_severity_count: 1,
        medium_severity_count: 1,
        low_severity_count: 0,
        most_common_category: 'naming',
        overall_risk: 'medium',
      });

      const recommendationInput: CreateHallucinationRecommendationInput = {
        analysis_id: analysis.id,
        category_type: 'naming',
        priority: 'high',
        title: 'Resolve Variable and Import Issues',
        description: 'Fix undefined variables and missing imports',
        action_items: [
          'Define all variables before use',
          'Check import statements for typos',
          'Verify module availability',
        ],
        expected_impact: 'Eliminate name-related errors',
        estimated_time_to_fix: '15 minutes',
        resources: ['https://docs.python.org/3/tutorial/modules.html'],
      };

      const created = await service.createRecommendation(recommendationInput);
      
      expect(created.id).toBeDefined();
      expect(created.analysis_id).toBe(analysis.id);
      expect(created.category_type).toBe('naming');
      expect(created.priority).toBe('high');
      expect(created.action_items).toHaveLength(3);

      const recommendations = await service.getRecommendationsByAnalysis(analysis.id);
      expect(recommendations).toHaveLength(1);
      expect(recommendations[0].id).toBe(created.id);
    });
  });

  describe('Analytics Operations', () => {
    it('should return provider summary', async () => {
      const summary = await service.getProviderSummary();
      
      expect(Array.isArray(summary)).toBe(true);
      expect(summary.length).toBeGreaterThan(0);
      
      const provider = summary[0];
      expect(provider).toHaveProperty('provider');
      expect(provider).toHaveProperty('total_analyses');
      expect(provider).toHaveProperty('avg_hallucination_rate');
      expect(provider).toHaveProperty('total_critical');
      expect(provider).toHaveProperty('avg_quality_impact');
    });

    it('should return category breakdown', async () => {
      const breakdown = await service.getCategoryBreakdown();
      
      expect(Array.isArray(breakdown)).toBe(true);
      expect(breakdown.length).toBeGreaterThan(0);
      
      const category = breakdown[0];
      expect(category).toHaveProperty('category_type');
      expect(category).toHaveProperty('category_subtype');
      expect(category).toHaveProperty('occurrence_count');
      expect(category).toHaveProperty('avg_confidence');
      expect(category).toHaveProperty('avg_dev_time_wasted');
    });

    it('should return recent trends', async () => {
      const trends = await service.getRecentTrends(7);
      
      expect(Array.isArray(trends)).toBe(true);
      expect(trends.length).toBeGreaterThan(0);
      expect(trends.length).toBeLessThanOrEqual(7);
      
      const trend = trends[0];
      expect(trend).toHaveProperty('analysis_date');
      expect(trend).toHaveProperty('total_analyses');
      expect(trend).toHaveProperty('avg_rate');
      expect(trend).toHaveProperty('critical_issues');
    });
  });

  describe('Historical Patterns', () => {
    it('should update and retrieve historical patterns', async () => {
      const patternId = 'type_mismatch_string_int';
      const categories = ['mapping'];

      // Update pattern (creates new one)
      await service.updateHistoricalPattern(patternId, categories);
      
      let patterns = await service.getHistoricalPatterns(0.0); // Get all patterns
      expect(patterns).toHaveLength(1);
      expect(patterns[0].pattern_id).toBe(patternId);
      expect(patterns[0].frequency).toBe(1);
      expect(patterns[0].categories).toEqual(categories);

      // Update again (increments frequency)
      await service.updateHistoricalPattern(patternId, categories);
      
      patterns = await service.getHistoricalPatterns(0.0);
      expect(patterns).toHaveLength(1);
      expect(patterns[0].frequency).toBe(2);

      // Test reliability filtering
      const highReliabilityPatterns = await service.getHistoricalPatterns(0.8);
      expect(highReliabilityPatterns).toHaveLength(0); // New pattern has low reliability
    });
  });
});

describe('convertCodeHaluResultToDbRecords', () => {
  it('should convert CodeHaluResult to database records', () => {
    const mockResult = {
      overallHallucinationRate: 0.75,
      categories: [
        {
          type: 'mapping' as const,
          subtype: 'data_compliance' as const,
          severity: 'high' as const,
          confidence: 0.85,
          evidence: ['Type mismatch detected'],
          detectionMethod: 'static' as const,
          businessImpact: {
            estimatedDevTimeWasted: 2.5,
            costMultiplier: 1.3,
            qualityImpact: 25,
            estimatedCostUSD: 12.50,
          },
          lineNumbers: [3],
          errorMessage: 'TypeError',
          suggestedFix: 'Add type checking',
        }
      ],
      executionResult: {
        success: false,
        output: '',
        stderr: 'Error output',
        errors: [
          {
            type: 'TypeError',
            message: 'Type error',
            lineNumber: 3,
          }
        ],
        resourceUsage: {
          memoryMB: 45.2,
          executionTimeMs: 1250,
          cpuUsage: 15.5,
        },
        securityFlags: [],
        timedOut: false,
        exitCode: 1,
      },
      codeQualityImpact: 25.5,
      recommendations: [
        {
          category: 'mapping' as const,
          priority: 'high' as const,
          title: 'Fix Type Issues',
          description: 'Address type mismatches',
          actionItems: ['Add type checking'],
          expectedImpact: 'Reduce errors',
        }
      ],
      detectionMetadata: {
        analysisTimeMs: 150,
        detectionVersion: '1.0.0',
        language: 'python',
        codeLength: 250,
        timestamp: '2025-01-27T00:00:00Z',
        executionVerified: true,
      },
      hasCriticalIssues: true,
      summary: {
        totalHallucinations: 1,
        criticalCount: 0,
        highSeverityCount: 1,
        mediumSeverityCount: 0,
        lowSeverityCount: 0,
        mostCommonCategory: 'mapping' as const,
        overallRisk: 'high' as const,
      },
    };

    const interactionId = 'test-interaction-123';
    const result = convertCodeHaluResultToDbRecords(mockResult, interactionId);

    // Check analysis record
    expect(result.analysis.interaction_id).toBe(interactionId);
    expect(result.analysis.overall_hallucination_rate).toBe(0.75);
    expect(result.analysis.language).toBe('python');
    expect(result.analysis.has_critical_issues).toBe(true);

    // Check categories
    expect(result.categories).toHaveLength(1);
    expect(result.categories[0].category_type).toBe('mapping');
    expect(result.categories[0].severity).toBe('high');
    expect(result.categories[0].confidence).toBe(0.85);

    // Check execution result
    expect(result.executionResult).toBeDefined();
    expect(result.executionResult!.success).toBe(false);
    expect(result.executionResult!.memory_mb).toBe(45.2);

    // Check recommendations
    expect(result.recommendations).toHaveLength(1);
    expect(result.recommendations[0].category_type).toBe('mapping');
    expect(result.recommendations[0].priority).toBe('high');
  });
});