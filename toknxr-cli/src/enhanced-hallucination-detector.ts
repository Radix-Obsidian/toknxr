/**
 * Enhanced Hallucination Detector
 * Core detection algorithm implementing CodeHalu methodology
 */

import {
  HallucinationCategory,
  CodeHaluResult,
  ExecutionResult,
  Recommendation,
  DetectionMethod,
  AnalysisMetadata,
} from './types/hallucination-types.js';

import {
  HallucinationPatterns,
  PatternMatchResult,
  detectAllPatterns,
  getPatternStatistics,
} from './hallucination-patterns.js';

import { ExecutionSandbox } from './execution-sandbox.js';

/**
 * Detection configuration options
 */
export interface DetectionConfig {
  enableStaticAnalysis: boolean;
  enableExecutionAnalysis: boolean;
  enablePatternMatching: boolean;
  enableStatisticalAnalysis: boolean;
  maxExecutionTime: number;
  confidenceThreshold: number;
  severityThreshold: 'low' | 'medium' | 'high' | 'critical';
}

/**
 * Default detection configuration
 */
const DEFAULT_CONFIG: DetectionConfig = {
  enableStaticAnalysis: true,
  enableExecutionAnalysis: true,
  enablePatternMatching: true,
  enableStatisticalAnalysis: true,
  maxExecutionTime: 5000,
  confidenceThreshold: 0.6,
  severityThreshold: 'medium',
};

/**
 * Enhanced CodeHalu detection engine
 */
export class CodeHaluDetector {
  private config: DetectionConfig;
  private executionSandbox: ExecutionSandbox;
  private detectionHistory: Map<string, CodeHaluResult> = new Map();

  constructor(config: Partial<DetectionConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.executionSandbox = new ExecutionSandbox({
      maxExecutionTimeMs: this.config.maxExecutionTime,
      maxMemoryMB: 128,
      maxCpuCores: 1,
    });
  }

  /**
   * Main detection method - orchestrates all detection techniques
   */
  async detectHallucinations(
    code: string,
    language: string = 'python',
    context?: {
      prompt?: string;
      expectedOutput?: any;
      previousInteractions?: string[];
    }
  ): Promise<CodeHaluResult> {
    const startTime = Date.now();
    
    try {
      // Input validation
      this.validateInput(code, language);

      // Initialize result structure
      const result: CodeHaluResult = {
        overallHallucinationRate: 0,
        categories: [],
        executionResult: undefined,
        recommendations: [],
        analysisMetadata: {
          detectionTimeMs: 0,
          codeLength: code.length,
          language,
          detectionMethods: [],
          analysisVersion: '1.0.0',
        },
        businessImpact: {
          estimatedDevTimeWasted: 0,
          costMultiplier: 1.0,
          qualityImpact: 0,
          costOfHallucinations: 0,
        },
      };

      // 1. Static Analysis (Pattern-based detection)
      if (this.config.enableStaticAnalysis && this.config.enablePatternMatching) {
        await this.performStaticAnalysis(code, result);
      }

      // 2. Execution-based Analysis
      if (this.config.enableExecutionAnalysis && language === 'python') {
        await this.performExecutionAnalysis(code, result, context);
      }

      // 3. Statistical Analysis (if enabled and we have history)
      if (this.config.enableStatisticalAnalysis) {
        await this.performStatisticalAnalysis(code, result, context);
      }

      // 4. Calculate overall hallucination rate
      this.calculateOverallHallucinationRate(result);

      // 5. Generate recommendations
      this.generateRecommendations(result, context);

      // 6. Calculate business impact
      this.calculateBusinessImpact(result);

      // 7. Finalize metadata
      result.analysisMetadata.detectionTimeMs = Date.now() - startTime;

      // Store in history for statistical analysis
      const codeHash = this.generateCodeHash(code);
      this.detectionHistory.set(codeHash, result);

      return result;

    } catch (error) {
      // Graceful error handling
      return this.createErrorResult(error, code, language, Date.now() - startTime);
    }
  }

  /**
   * Perform static analysis using pattern matching
   */
  private async performStaticAnalysis(code: string, result: CodeHaluResult): Promise<void> {
    try {
      const patternResults = detectAllPatterns(code);
      const categories = HallucinationPatterns.convertToHallucinationCategories(patternResults);
      
      // Filter by confidence threshold
      const filteredCategories = categories.filter(
        category => category.confidence >= this.config.confidenceThreshold
      );

      result.categories.push(...filteredCategories);
      result.analysisMetadata.detectionMethods.push('static');

      // Add pattern-specific metadata
      const stats = getPatternStatistics(patternResults);
      result.analysisMetadata.patternStats = stats;

    } catch (error) {
      console.warn('Static analysis failed:', error);
      // Continue with other detection methods
    }
  }

  /**
   * Perform execution-based analysis using sandbox
   */
  private async performExecutionAnalysis(
    code: string,
    result: CodeHaluResult,
    context?: any
  ): Promise<void> {
    try {
      // Security check first
      const securityAssessment = this.executionSandbox.validateSafety(code);
      
      if (!securityAssessment.isSafe) {
        // Add security-related hallucination categories
        result.categories.push({
          type: 'resource',
          subtype: 'physical_constraint',
          severity: 'critical',
          confidence: securityAssessment.confidence,
          description: 'Code contains potentially dangerous operations',
          evidence: securityAssessment.risks.map(risk => ({
            type: 'security_risk',
            content: risk,
            confidence: 0.9,
          })),
          suggestedFix: 'Remove dangerous operations or add proper security measures',
          businessImpact: {
            estimatedDevTimeWasted: 4.0,
            costMultiplier: 2.0,
            qualityImpact: 50,
            costOfHallucinations: 400.0,
          },
        });
        return;
      }

      // Execute the code
      const executionResult = await this.executionSandbox.execute(code);
      result.executionResult = executionResult;
      result.analysisMetadata.detectionMethods.push('execution');

      // Analyze execution results for hallucinations
      await this.analyzeExecutionResults(executionResult, result, context);

    } catch (error) {
      console.warn('Execution analysis failed:', error);
      // Add execution failure as potential hallucination indicator
      result.categories.push({
        type: 'logic',
        subtype: 'logic_breakdown',
        severity: 'high',
        confidence: 0.8,
        description: 'Code failed to execute properly',
        evidence: [{
          type: 'execution_error',
          content: error instanceof Error ? error.message : 'Unknown execution error',
          confidence: 0.9,
        }],
        suggestedFix: 'Review code for syntax and logical errors',
        businessImpact: {
          estimatedDevTimeWasted: 3.0,
          costMultiplier: 1.5,
          qualityImpact: 40,
          costOfHallucinations: 225.0,
        },
      });
    }
  }

  /**
   * Analyze execution results for hallucination indicators
   */
  private async analyzeExecutionResults(
    executionResult: ExecutionResult,
    result: CodeHaluResult,
    context?: any
  ): Promise<void> {
    // 1. Check for runtime errors
    if (executionResult.errors.length > 0) {
      executionResult.errors.forEach(error => {
        const category = this.mapExecutionErrorToCategory(error);
        if (category) {
          result.categories.push(category);
        }
      });
    }

    // 2. Check for resource usage anomalies
    if (executionResult.resourceUsage.memoryMB > 100) {
      result.categories.push({
        type: 'resource',
        subtype: 'physical_constraint',
        severity: 'medium',
        confidence: 0.7,
        description: 'Code uses excessive memory',
        evidence: [{
          type: 'resource_usage',
          content: `Memory usage: ${executionResult.resourceUsage.memoryMB}MB`,
          confidence: 0.9,
        }],
        suggestedFix: 'Optimize memory usage or add memory limits',
        businessImpact: {
          estimatedDevTimeWasted: 1.5,
          costMultiplier: 1.2,
          qualityImpact: 20,
          costOfHallucinations: 90.0,
        },
      });
    }

    // 3. Check for timeout issues
    if (executionResult.timedOut) {
      result.categories.push({
        type: 'resource',
        subtype: 'computational_boundary',
        severity: 'high',
        confidence: 0.9,
        description: 'Code execution timed out',
        evidence: [{
          type: 'timeout',
          content: `Execution exceeded ${this.config.maxExecutionTime}ms`,
          confidence: 1.0,
        }],
        suggestedFix: 'Optimize algorithm or add proper termination conditions',
        businessImpact: {
          estimatedDevTimeWasted: 3.0,
          costMultiplier: 1.6,
          qualityImpact: 35,
          costOfHallucinations: 240.0,
        },
      });
    }

    // 4. Check output consistency (if expected output provided)
    if (context?.expectedOutput && executionResult.output) {
      const outputConsistency = this.checkOutputConsistency(
        executionResult.output,
        context.expectedOutput
      );
      
      if (outputConsistency.confidence < 0.7) {
        result.categories.push({
          type: 'logic',
          subtype: 'logic_deviation',
          severity: 'medium',
          confidence: 1.0 - outputConsistency.confidence,
          description: 'Output does not match expected result',
          evidence: [{
            type: 'output_mismatch',
            content: `Expected: ${context.expectedOutput}, Got: ${executionResult.output}`,
            confidence: 0.8,
          }],
          suggestedFix: 'Review logic and ensure correct implementation',
        businessImpact: {
          estimatedDevTimeWasted: 2.5,
          costMultiplier: 1.3,
          qualityImpact: 25,
          costOfHallucinations: 125.0,
        },
        });
      }
    }
  }

  /**
   * Perform statistical analysis based on historical patterns
   */
  private async performStatisticalAnalysis(
    code: string,
    result: CodeHaluResult,
    context?: any
  ): Promise<void> {
    try {
      // Analyze patterns across historical data
      const historicalPatterns = this.analyzeHistoricalPatterns(code);
      
      if (historicalPatterns.length > 0) {
        result.analysisMetadata.detectionMethods.push('statistical');
        
        // Add statistical confidence adjustments
        result.categories.forEach(category => {
          const historicalMatch = historicalPatterns.find(
            pattern => pattern.categoryType === category.type
          );
          
          if (historicalMatch) {
            // Adjust confidence based on historical reliability
            category.confidence = Math.min(1.0, 
              category.confidence * historicalMatch.reliability
            );
          }
        });
      }
    } catch (error) {
      console.warn('Statistical analysis failed:', error);
    }
  }

  /**
   * Calculate overall hallucination rate
   */
  private calculateOverallHallucinationRate(result: CodeHaluResult): void {
    if (result.categories.length === 0) {
      result.overallHallucinationRate = 0;
      return;
    }

    // Weight by severity and confidence
    const severityWeights = { low: 1, medium: 2, high: 3, critical: 4 };
    
    let totalWeight = 0;
    let weightedSum = 0;

    result.categories.forEach(category => {
      const weight = severityWeights[category.severity] * category.confidence;
      totalWeight += weight;
      weightedSum += weight;
    });

    // Normalize to 0-1 scale
    const maxPossibleWeight = result.categories.length * 4; // All critical with confidence 1.0
    result.overallHallucinationRate = Math.min(1.0, weightedSum / maxPossibleWeight);
  }

  /**
   * Generate actionable recommendations
   */
  private generateRecommendations(result: CodeHaluResult, context?: any): void {
    const recommendations: Recommendation[] = [];

    // Group categories by type for targeted recommendations
    const categoryGroups = this.groupCategoriesByType(result.categories);

    Object.entries(categoryGroups).forEach(([type, categories]) => {
      const recommendation = this.generateTypeSpecificRecommendation(
        type as any,
        categories,
        context
      );
      if (recommendation) {
        recommendations.push(recommendation);
      }
    });

    // Add general recommendations based on overall analysis
    if (result.overallHallucinationRate > 0.7) {
      recommendations.push({
        priority: 'high',
        title: 'Critical Code Review Required',
        description: 'Multiple serious issues detected that require immediate attention',
        actionItems: [
          'Conduct thorough code review',
          'Test with multiple input scenarios',
          'Consider alternative implementation approach',
        ],
        expectedImpact: 'Prevent production issues and reduce debugging time',
        estimatedTimeToFix: '2-4 hours',
      });
    }

    result.recommendations = recommendations;
  }

  /**
   * Calculate business impact metrics
   */
  private calculateBusinessImpact(result: CodeHaluResult): void {
    const impact = result.businessImpact;

    // Sum up individual category impacts
    result.categories.forEach(category => {
      impact.estimatedDevTimeWasted += category.businessImpact.estimatedDevTimeWasted;
      impact.qualityImpact = Math.max(impact.qualityImpact, category.businessImpact.qualityImpact);
      impact.costMultiplier = Math.max(impact.costMultiplier, category.businessImpact.costMultiplier);
    });

    // Calculate cost of hallucinations (assuming $100/hour developer rate)
    const hourlyRate = 100;
    impact.costOfHallucinations = impact.estimatedDevTimeWasted * hourlyRate;

    // Apply cost multiplier for indirect costs
    impact.costOfHallucinations *= impact.costMultiplier;
  }

  /**
   * Helper methods
   */

  private validateInput(code: string, language: string): void {
    if (!code || code.trim().length === 0) {
      throw new Error('Code cannot be empty');
    }

    if (code.length > 100000) {
      throw new Error('Code is too long (max 100KB)');
    }

    const supportedLanguages = ['python', 'javascript', 'typescript'];
    if (!supportedLanguages.includes(language.toLowerCase())) {
      console.warn(`Language '${language}' not fully supported. Using generic analysis.`);
    }
  }

  private mapExecutionErrorToCategory(error: any): HallucinationCategory | null {
    const errorTypeMap: Record<string, {
      type: 'mapping' | 'naming' | 'resource' | 'logic';
      subtype: string;
      severity: 'low' | 'medium' | 'high' | 'critical';
    }> = {
      'TypeError': { type: 'mapping', subtype: 'data_compliance', severity: 'high' },
      'IndexError': { type: 'mapping', subtype: 'structure_access', severity: 'medium' },
      'KeyError': { type: 'mapping', subtype: 'structure_access', severity: 'medium' },
      'NameError': { type: 'naming', subtype: 'identity', severity: 'high' },
      'AttributeError': { type: 'naming', subtype: 'identity', severity: 'medium' },
      'ImportError': { type: 'naming', subtype: 'external_source', severity: 'critical' },
      'MemoryError': { type: 'resource', subtype: 'physical_constraint', severity: 'critical' },
      'RecursionError': { type: 'resource', subtype: 'computational_boundary', severity: 'high' },
      'ZeroDivisionError': { type: 'logic', subtype: 'logic_deviation', severity: 'high' },
    };

    const mapping = errorTypeMap[error.type];
    if (!mapping) return null;

    return {
      type: mapping.type,
      subtype: mapping.subtype as any,
      severity: mapping.severity,
      confidence: 0.9,
      description: `Runtime ${error.type}: ${error.message}`,
      evidence: [{
        type: 'execution_error',
        content: error.message,
        lineNumber: error.lineNumber,
        confidence: 1.0,
      }],
      suggestedFix: this.getErrorSpecificFix(error.type),
      businessImpact: {
        estimatedDevTimeWasted: mapping.severity === 'critical' ? 4.0 : 
                               mapping.severity === 'high' ? 2.5 : 1.5,
        costMultiplier: mapping.severity === 'critical' ? 2.0 : 1.3,
        qualityImpact: mapping.severity === 'critical' ? 50 : 
                      mapping.severity === 'high' ? 35 : 20,
        costOfHallucinations: (mapping.severity === 'critical' ? 4.0 : 
                              mapping.severity === 'high' ? 2.5 : 1.5) * 100,
      },
    };
  }

  private getErrorSpecificFix(errorType: string): string {
    const fixes: Record<string, string> = {
      'TypeError': 'Check data types and add type validation',
      'IndexError': 'Add bounds checking before array access',
      'KeyError': 'Use .get() method or verify key existence',
      'NameError': 'Define variable before use',
      'AttributeError': 'Verify object has the required attribute',
      'ImportError': 'Install required package or fix import path',
      'MemoryError': 'Optimize memory usage',
      'RecursionError': 'Add base case or use iteration',
      'ZeroDivisionError': 'Add zero division check',
    };

    return fixes[errorType] || 'Review and fix the error';
  }

  private checkOutputConsistency(actual: string, expected: any): { confidence: number } {
    // Simple consistency check - can be enhanced with more sophisticated comparison
    const actualStr = actual.toString().trim();
    const expectedStr = expected.toString().trim();

    if (actualStr === expectedStr) {
      return { confidence: 1.0 };
    }

    // Check for partial matches
    const similarity = this.calculateStringSimilarity(actualStr, expectedStr);
    return { confidence: similarity };
  }

  private calculateStringSimilarity(str1: string, str2: string): number {
    // Simple Levenshtein distance-based similarity
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;

    if (longer.length === 0) return 1.0;

    const distance = this.levenshteinDistance(longer, shorter);
    return (longer.length - distance) / longer.length;
  }

  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));

    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;

    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + indicator
        );
      }
    }

    return matrix[str2.length][str1.length];
  }

  private analyzeHistoricalPatterns(code: string): Array<{
    categoryType: string;
    reliability: number;
  }> {
    // Simplified historical analysis - in production, this would use a database
    const patterns: Array<{ categoryType: string; reliability: number }> = [];
    
    // Analyze code characteristics and match with historical patterns
    const codeFeatures = this.extractCodeFeatures(code);
    
    // Mock historical pattern matching
    if (codeFeatures.hasLoops && codeFeatures.hasArrayAccess) {
      patterns.push({ categoryType: 'mapping', reliability: 0.85 });
    }
    
    if (codeFeatures.hasImports && codeFeatures.hasExternalCalls) {
      patterns.push({ categoryType: 'naming', reliability: 0.75 });
    }

    return patterns;
  }

  private extractCodeFeatures(code: string): {
    hasLoops: boolean;
    hasArrayAccess: boolean;
    hasImports: boolean;
    hasExternalCalls: boolean;
  } {
    return {
      hasLoops: /for\s+|while\s+/.test(code),
      hasArrayAccess: /\[\s*\w+\s*\]/.test(code),
      hasImports: /import\s+|from\s+/.test(code),
      hasExternalCalls: /\w+\.\w+\s*\(/.test(code),
    };
  }

  private groupCategoriesByType(categories: HallucinationCategory[]): Record<string, HallucinationCategory[]> {
    return categories.reduce((groups, category) => {
      const type = category.type;
      if (!groups[type]) groups[type] = [];
      groups[type].push(category);
      return groups;
    }, {} as Record<string, HallucinationCategory[]>);
  }

  private generateTypeSpecificRecommendation(
    type: 'mapping' | 'naming' | 'resource' | 'logic',
    categories: HallucinationCategory[],
    context?: any
  ): Recommendation | null {
    const recommendations = {
      mapping: {
        title: 'Data Type and Structure Issues',
        description: 'Code contains potential data mapping problems',
        actionItems: [
          'Add type checking and validation',
          'Verify data structure assumptions',
          'Test with edge cases and different data types',
        ],
      },
      naming: {
        title: 'Identifier and Reference Issues',
        description: 'Code contains potential naming and reference problems',
        actionItems: [
          'Verify all variables and functions are defined',
          'Check import statements and module availability',
          'Review scope and naming conventions',
        ],
      },
      resource: {
        title: 'Resource and Performance Issues',
        description: 'Code may have resource consumption problems',
        actionItems: [
          'Add resource limits and monitoring',
          'Optimize memory and CPU usage',
          'Implement proper error handling for resource constraints',
        ],
      },
      logic: {
        title: 'Logic and Flow Issues',
        description: 'Code contains potential logical inconsistencies',
        actionItems: [
          'Review algorithm logic and flow',
          'Add proper termination conditions',
          'Test with various input scenarios',
        ],
      },
    };

    const config = recommendations[type];
    if (!config) return null;

    const highSeverityCount = categories.filter(c => c.severity === 'high' || c.severity === 'critical').length;
    const priority = highSeverityCount > 0 ? 'high' : 'medium';

    return {
      priority,
      title: config.title,
      description: config.description,
      actionItems: config.actionItems,
      expectedImpact: `Resolve ${categories.length} ${type} issue(s)`,
      estimatedTimeToFix: this.estimateFixTime(categories),
    };
  }

  private estimateFixTime(categories: HallucinationCategory[]): string {
    const totalTime = categories.reduce((sum, category) => {
      return sum + category.businessImpact.estimatedDevTimeWasted;
    }, 0);

    if (totalTime < 1) return '15-30 minutes';
    if (totalTime < 2) return '30-60 minutes';
    if (totalTime < 4) return '1-2 hours';
    if (totalTime < 8) return '2-4 hours';
    return '4+ hours';
  }

  private generateCodeHash(code: string): string {
    // Simple hash function for code identification
    let hash = 0;
    for (let i = 0; i < code.length; i++) {
      const char = code.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(36);
  }

  private createErrorResult(
    error: any,
    code: string,
    language: string,
    detectionTime: number
  ): CodeHaluResult {
    return {
      overallHallucinationRate: 1.0, // Assume high hallucination rate on error
      categories: [{
        type: 'logic',
        subtype: 'logic_breakdown',
        severity: 'critical',
        confidence: 0.9,
        description: 'Detection failed due to critical error',
        evidence: [{
          type: 'system_error',
          content: error instanceof Error ? error.message : 'Unknown error',
          confidence: 1.0,
        }],
        suggestedFix: 'Review code structure and syntax',
        businessImpact: {
          estimatedDevTimeWasted: 4.0,
          costMultiplier: 2.0,
          qualityImpact: 50,
          costOfHallucinations: 400.0,
        },
      }],
      recommendations: [{
        priority: 'high',
        title: 'Critical Analysis Failure',
        description: 'Code analysis failed - manual review required',
        actionItems: [
          'Check code syntax and structure',
          'Verify code is complete and valid',
          'Consider breaking down complex code',
        ],
        expectedImpact: 'Enable proper analysis and detection',
        estimatedTimeToFix: '1-2 hours',
      }],
      analysisMetadata: {
        detectionTimeMs: detectionTime,
        codeLength: code.length,
        language,
        detectionMethods: ['error'],
        analysisVersion: '1.0.0',
      },
      businessImpact: {
        estimatedDevTimeWasted: 4.0,
        costMultiplier: 2.0,
        qualityImpact: 50,
        costOfHallucinations: 800.0, // 4 hours * $100/hour * 2.0 multiplier
      },
    };
  }
}

/**
 * Factory function to create detector with default configuration
 */
export function createCodeHaluDetector(config?: Partial<DetectionConfig>): CodeHaluDetector {
  return new CodeHaluDetector(config);
}

/**
 * Utility function for quick hallucination detection
 */
export async function detectCodeHallucinations(
  code: string,
  language: string = 'python',
  options?: {
    enableExecution?: boolean;
    maxExecutionTime?: number;
    confidenceThreshold?: number;
  }
): Promise<CodeHaluResult> {
  const config: Partial<DetectionConfig> = {
    enableExecutionAnalysis: options?.enableExecution ?? true,
    maxExecutionTime: options?.maxExecutionTime ?? 5000,
    confidenceThreshold: options?.confidenceThreshold ?? 0.6,
  };

  const detector = createCodeHaluDetector(config);
  return await detector.detectHallucinations(code, language);
}