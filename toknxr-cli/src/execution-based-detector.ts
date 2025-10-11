/**
 * Execution-Based Hallucination Detection
 * Integrates execution sandbox with hallucination detection for runtime analysis
 */

import {
  HallucinationCategory,
  ExecutionResult,
  TestCase,
  ResourceUsage,
  ExecutionError,
} from './types/hallucination-types.js';

import { ExecutionSandbox } from './execution-sandbox.js';

/**
 * Execution analysis configuration
 */
export interface ExecutionAnalysisConfig {
  enableResourceMonitoring: boolean;
  enableLogicValidation: boolean;
  enablePerformanceAnalysis: boolean;
  memoryThresholdMB: number;
  executionTimeThresholdMs: number;
  cpuUsageThreshold: number;
}

/**
 * Default execution analysis configuration
 */
const DEFAULT_EXECUTION_CONFIG: ExecutionAnalysisConfig = {
  enableResourceMonitoring: true,
  enableLogicValidation: true,
  enablePerformanceAnalysis: true,
  memoryThresholdMB: 64,
  executionTimeThresholdMs: 3000,
  cpuUsageThreshold: 80,
};

/**
 * Resource analysis result
 */
export interface ResourceAnalysis {
  memoryUsage: {
    current: number;
    peak: number;
    threshold: number;
    isExcessive: boolean;
  };
  executionTime: {
    actual: number;
    threshold: number;
    isExcessive: boolean;
  };
  cpuUsage: {
    percentage: number;
    threshold: number;
    isExcessive: boolean;
  };
}

/**
 * Loop analysis result
 */
export interface LoopAnalysis {
  hasInfiniteLoopRisk: boolean;
  loopComplexity: number;
  terminationConditions: string[];
  confidence: number;
}

/**
 * Correctness analysis result
 */
export interface CorrectnessAnalysis {
  outputMatches: boolean;
  similarity: number;
  expectedType: string;
  actualType: string;
  confidence: number;
}

/**
 * Execution-based hallucination detector
 */
export class ExecutionBasedDetector {
  private config: ExecutionAnalysisConfig;
  private sandbox: ExecutionSandbox;

  constructor(config: Partial<ExecutionAnalysisConfig> = {}) {
    this.config = { ...DEFAULT_EXECUTION_CONFIG, ...config };
    this.sandbox = new ExecutionSandbox({
      maxMemoryMB: this.config.memoryThresholdMB * 2, // Allow some headroom
      maxExecutionTimeMs: this.config.executionTimeThresholdMs * 2,
    });
  }

  /**
   * Detect resource-related hallucinations from execution results
   */
  async detectResourceHallucinations(executionResult: ExecutionResult): Promise<HallucinationCategory[]> {
    const categories: HallucinationCategory[] = [];

    if (!this.config.enableResourceMonitoring) {
      return categories;
    }

    try {
      const resourceAnalysis = this.analyzeResourceUsage(executionResult.resourceUsage);

      // Memory usage hallucinations
      if (resourceAnalysis.memoryUsage.isExcessive) {
        categories.push({
          type: 'resource',
          subtype: 'physical_constraint',
          severity: this.getMemorySeverity(resourceAnalysis.memoryUsage.current),
          confidence: 0.9,
          description: `Excessive memory usage detected: ${resourceAnalysis.memoryUsage.current.toFixed(2)}MB`,
          evidence: [
            {
              type: 'resource_usage',
              content: `Memory: ${resourceAnalysis.memoryUsage.current}MB (threshold: ${resourceAnalysis.memoryUsage.threshold}MB)`,
              confidence: 1.0,
            },
            {
              type: 'resource_usage',
              content: `Peak memory: ${resourceAnalysis.memoryUsage.peak}MB`,
              confidence: 0.9,
            },
          ],
          suggestedFix: 'Optimize data structures, use generators, or implement memory-efficient algorithms',
          businessImpact: {
            estimatedDevTimeWasted: this.calculateMemoryImpact(resourceAnalysis.memoryUsage.current),
            costMultiplier: 1.5,
            qualityImpact: 30,
            costOfHallucinations: this.calculateMemoryImpact(resourceAnalysis.memoryUsage.current) * 100,
          },
        });
      }

      // Execution time hallucinations
      if (resourceAnalysis.executionTime.isExcessive) {
        categories.push({
          type: 'resource',
          subtype: 'computational_boundary',
          severity: this.getTimeSeverity(resourceAnalysis.executionTime.actual),
          confidence: 0.85,
          description: `Excessive execution time: ${resourceAnalysis.executionTime.actual}ms`,
          evidence: [
            {
              type: 'performance_metric',
              content: `Execution time: ${resourceAnalysis.executionTime.actual}ms (threshold: ${resourceAnalysis.executionTime.threshold}ms)`,
              confidence: 1.0,
            },
          ],
          suggestedFix: 'Optimize algorithm complexity, add caching, or use more efficient data structures',
          businessImpact: {
            estimatedDevTimeWasted: this.calculateTimeImpact(resourceAnalysis.executionTime.actual),
            costMultiplier: 1.3,
            qualityImpact: 20,
            costOfHallucinations: this.calculateTimeImpact(resourceAnalysis.executionTime.actual) * 100,
          },
        });
      }

      // CPU usage hallucinations
      if (resourceAnalysis.cpuUsage.isExcessive) {
        categories.push({
          type: 'resource',
          subtype: 'computational_boundary',
          severity: 'medium',
          confidence: 0.7,
          description: `High CPU usage detected: ${resourceAnalysis.cpuUsage.percentage}%`,
          evidence: [
            {
              type: 'resource_usage',
              content: `CPU usage: ${resourceAnalysis.cpuUsage.percentage}% (threshold: ${resourceAnalysis.cpuUsage.threshold}%)`,
              confidence: 0.8,
            },
          ],
          suggestedFix: 'Optimize computational complexity or add CPU usage limits',
          businessImpact: {
            estimatedDevTimeWasted: 1.5,
            costMultiplier: 1.2,
            qualityImpact: 15,
            costOfHallucinations: 150.0,
          },
        });
      }

      // Timeout hallucinations
      if (executionResult.timedOut) {
        categories.push({
          type: 'resource',
          subtype: 'computational_boundary',
          severity: 'high',
          confidence: 1.0,
          description: 'Code execution timed out, indicating potential infinite loop or excessive computation',
          evidence: [
            {
              type: 'timeout',
              content: 'Execution exceeded maximum allowed time',
              confidence: 1.0,
            },
          ],
          suggestedFix: 'Add proper termination conditions, optimize loops, or reduce computational complexity',
          businessImpact: {
            estimatedDevTimeWasted: 3.0,
            costMultiplier: 1.6,
            qualityImpact: 35,
            costOfHallucinations: 300.0,
          },
        });
      }

    } catch (error) {
      console.warn('Resource analysis failed:', error);
    }

    return categories;
  }

  /**
   * Detect logic-related hallucinations from code and execution results
   */
  async detectLogicHallucinations(
    code: string,
    executionResult: ExecutionResult,
    expectedOutput?: any
  ): Promise<HallucinationCategory[]> {
    const categories: HallucinationCategory[] = [];

    if (!this.config.enableLogicValidation) {
      return categories;
    }

    try {
      // 1. Analyze infinite loop risks
      const loopAnalysis = this.detectInfiniteLoops(code);
      if (loopAnalysis.hasInfiniteLoopRisk) {
        categories.push({
          type: 'logic',
          subtype: 'logic_deviation',
          severity: loopAnalysis.confidence > 0.8 ? 'high' : 'medium',
          confidence: loopAnalysis.confidence,
          description: 'Potential infinite loop or inadequate termination conditions detected',
          evidence: [
            {
              type: 'code_pattern',
              content: `Loop complexity: ${loopAnalysis.loopComplexity}`,
              confidence: 0.8,
            },
            {
              type: 'code_pattern',
              content: `Termination conditions: ${loopAnalysis.terminationConditions.join(', ')}`,
              confidence: 0.7,
            },
          ],
          suggestedFix: 'Add proper loop termination conditions and bounds checking',
          businessImpact: {
            estimatedDevTimeWasted: 2.5,
            costMultiplier: 1.4,
            qualityImpact: 30,
            costOfHallucinations: 250.0,
          },
        });
      }

      // 2. Validate output correctness
      if (expectedOutput !== undefined) {
        const correctnessAnalysis = this.validateOutputCorrectness(executionResult, expectedOutput);
        if (!correctnessAnalysis.outputMatches && correctnessAnalysis.confidence > 0.7) {
          categories.push({
            type: 'logic',
            subtype: 'logic_breakdown',
            severity: this.getCorrectnessSeverity(correctnessAnalysis.similarity),
            confidence: correctnessAnalysis.confidence,
            description: 'Output does not match expected result, indicating logic errors',
            evidence: [
              {
                type: 'output_comparison',
                content: `Expected type: ${correctnessAnalysis.expectedType}, Actual type: ${correctnessAnalysis.actualType}`,
                confidence: 0.9,
              },
              {
                type: 'output_comparison',
                content: `Similarity score: ${correctnessAnalysis.similarity.toFixed(2)}`,
                confidence: 0.8,
              },
            ],
            suggestedFix: 'Review algorithm logic and test with various input scenarios',
            businessImpact: {
              estimatedDevTimeWasted: this.calculateCorrectnessImpact(correctnessAnalysis.similarity),
              costMultiplier: 1.3,
              qualityImpact: 25,
              costOfHallucinations: this.calculateCorrectnessImpact(correctnessAnalysis.similarity) * 100,
            },
          });
        }
      }

      // 3. Analyze execution errors for logic issues
      if (executionResult.errors.length > 0) {
        const logicErrors = this.analyzeExecutionErrorsForLogic(executionResult.errors);
        categories.push(...logicErrors);
      }

    } catch (error) {
      console.warn('Logic analysis failed:', error);
    }

    return categories;
  }

  /**
   * Analyze resource usage patterns
   */
  private analyzeResourceUsage(resourceUsage: ResourceUsage): ResourceAnalysis {
    return {
      memoryUsage: {
        current: resourceUsage.memoryMB,
        peak: resourceUsage.peakMemoryMB || resourceUsage.memoryMB,
        threshold: this.config.memoryThresholdMB,
        isExcessive: resourceUsage.memoryMB > this.config.memoryThresholdMB,
      },
      executionTime: {
        actual: resourceUsage.executionTimeMs,
        threshold: this.config.executionTimeThresholdMs,
        isExcessive: resourceUsage.executionTimeMs > this.config.executionTimeThresholdMs,
      },
      cpuUsage: {
        percentage: resourceUsage.cpuUsage,
        threshold: this.config.cpuUsageThreshold,
        isExcessive: resourceUsage.cpuUsage > this.config.cpuUsageThreshold,
      },
    };
  }

  /**
   * Detect potential infinite loops in code
   */
  private detectInfiniteLoops(code: string): LoopAnalysis {
    const analysis: LoopAnalysis = {
      hasInfiniteLoopRisk: false,
      loopComplexity: 0,
      terminationConditions: [],
      confidence: 0,
    };

    // Detect while loops
    const whileLoops = code.match(/while\s+([^:]+):/g) || [];
    const forLoops = code.match(/for\s+[^:]+:/g) || [];
    
    analysis.loopComplexity = whileLoops.length + forLoops.length;

    // Check for dangerous while patterns
    whileLoops.forEach(loop => {
      const condition = loop.match(/while\s+([^:]+):/)?.[1] || '';
      
      // Check for "while True" without break
      if (condition.trim() === 'True' || condition.trim() === '1') {
        const loopBlock = this.extractLoopBlock(code, loop);
        if (!loopBlock.includes('break') && !loopBlock.includes('return')) {
          analysis.hasInfiniteLoopRisk = true;
          analysis.confidence = Math.max(analysis.confidence, 0.9);
        } else {
          analysis.terminationConditions.push('break/return statement');
        }
      }
      
      // Check for complex conditions that might not terminate
      if (condition.includes('!=') || condition.includes('>=') || condition.includes('<=')) {
        analysis.confidence = Math.max(analysis.confidence, 0.6);
        analysis.terminationConditions.push(`condition: ${condition}`);
      }
    });

    // Check for nested loops (higher complexity risk)
    const nestedLoopPattern = /(for|while)[^:]*:[\s\S]*?(for|while)[^:]*:/g;
    const nestedLoops = code.match(nestedLoopPattern) || [];
    if (nestedLoops.length > 0) {
      analysis.loopComplexity += nestedLoops.length;
      analysis.confidence = Math.max(analysis.confidence, 0.5);
    }

    return analysis;
  }

  /**
   * Validate output correctness against expected results
   */
  private validateOutputCorrectness(
    executionResult: ExecutionResult,
    expectedOutput: any
  ): CorrectnessAnalysis {
    const analysis: CorrectnessAnalysis = {
      outputMatches: false,
      similarity: 0,
      expectedType: typeof expectedOutput,
      actualType: 'undefined',
      confidence: 0.8,
    };

    if (!executionResult.output) {
      analysis.actualType = 'null';
      analysis.similarity = 0;
      return analysis;
    }

    // Try to parse the output
    let actualOutput: any;
    try {
      // Try to extract the last line as the result
      const outputLines = executionResult.output.trim().split('\n');
      const lastLine = outputLines[outputLines.length - 1];
      
      // Try to parse as JSON first
      try {
        actualOutput = JSON.parse(lastLine);
      } catch {
        // If not JSON, use as string
        actualOutput = lastLine;
      }
    } catch {
      actualOutput = executionResult.output;
    }

    analysis.actualType = typeof actualOutput;

    // Type comparison
    if (analysis.expectedType === analysis.actualType) {
      analysis.similarity += 0.3;
    }

    // Value comparison
    if (analysis.expectedType === 'string' && analysis.actualType === 'string') {
      analysis.similarity += this.calculateStringSimilarity(
        expectedOutput.toString(),
        actualOutput.toString()
      ) * 0.7;
    } else if (analysis.expectedType === 'number' && analysis.actualType === 'number') {
      const diff = Math.abs(expectedOutput - actualOutput);
      const maxValue = Math.max(Math.abs(expectedOutput), Math.abs(actualOutput), 1);
      analysis.similarity += Math.max(0, 1 - (diff / maxValue)) * 0.7;
    } else if (expectedOutput === actualOutput) {
      analysis.similarity = 1.0;
    } else {
      // Try string comparison as fallback
      analysis.similarity += this.calculateStringSimilarity(
        expectedOutput.toString(),
        actualOutput.toString()
      ) * 0.5;
    }

    analysis.outputMatches = analysis.similarity > 0.9;

    return analysis;
  }

  /**
   * Analyze execution errors for logic-related issues
   */
  private analyzeExecutionErrorsForLogic(errors: ExecutionError[]): HallucinationCategory[] {
    const categories: HallucinationCategory[] = [];

    const logicErrorTypes = [
      'ZeroDivisionError',
      'ValueError',
      'AssertionError',
      'LogicError',
      'RuntimeError',
    ];

    errors.forEach(error => {
      if (logicErrorTypes.includes(error.type)) {
        const severity = this.getLogicErrorSeverity(error.type);
        
        categories.push({
          type: 'logic',
          subtype: error.type === 'ZeroDivisionError' ? 'logic_deviation' : 'logic_breakdown',
          severity,
          confidence: 0.9,
          description: `Logic error detected: ${error.type}`,
          evidence: [
            {
              type: 'execution_error',
              content: error.message,
              lineNumber: error.lineNumber,
              confidence: 1.0,
            },
          ],
          suggestedFix: this.getLogicErrorFix(error.type),
          businessImpact: {
            estimatedDevTimeWasted: severity === 'critical' ? 4.0 : severity === 'high' ? 2.5 : 1.5,
            costMultiplier: severity === 'critical' ? 2.0 : severity === 'high' ? 1.5 : 1.2,
            qualityImpact: severity === 'critical' ? 50 : severity === 'high' ? 35 : 20,
            costOfHallucinations: (severity === 'critical' ? 4.0 : severity === 'high' ? 2.5 : 1.5) * 100,
          },
        });
      }
    });

    return categories;
  }

  /**
   * Helper methods
   */

  private extractLoopBlock(code: string, loopStatement: string): string {
    const loopIndex = code.indexOf(loopStatement);
    if (loopIndex === -1) return '';

    const lines = code.substring(loopIndex).split('\n');
    const loopBlock: string[] = [lines[0]]; // Include the loop statement
    
    let indentLevel = 0;
    let baseIndent = -1;

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();
      
      if (trimmed === '') continue;
      
      const currentIndent = line.length - line.trimStart().length;
      
      if (baseIndent === -1 && trimmed !== '') {
        baseIndent = currentIndent;
      }
      
      if (currentIndent <= baseIndent && trimmed !== '' && i > 1) {
        break; // End of loop block
      }
      
      loopBlock.push(line);
    }

    return loopBlock.join('\n');
  }

  private calculateStringSimilarity(str1: string, str2: string): number {
    if (str1 === str2) return 1.0;
    
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

  private getMemorySeverity(memoryMB: number): 'low' | 'medium' | 'high' | 'critical' {
    if (memoryMB > 200) return 'critical';
    if (memoryMB > 128) return 'high';
    if (memoryMB > 64) return 'medium';
    return 'low';
  }

  private getTimeSeverity(timeMs: number): 'low' | 'medium' | 'high' | 'critical' {
    if (timeMs > 10000) return 'critical';
    if (timeMs > 5000) return 'high';
    if (timeMs > 3000) return 'medium';
    return 'low';
  }

  private getCorrectnessSeverity(similarity: number): 'low' | 'medium' | 'high' | 'critical' {
    if (similarity < 0.3) return 'critical';
    if (similarity < 0.5) return 'high';
    if (similarity < 0.7) return 'medium';
    return 'low';
  }

  private getLogicErrorSeverity(errorType: string): 'low' | 'medium' | 'high' | 'critical' {
    const severityMap: Record<string, 'low' | 'medium' | 'high' | 'critical'> = {
      'ZeroDivisionError': 'high',
      'ValueError': 'medium',
      'AssertionError': 'high',
      'LogicError': 'critical',
      'RuntimeError': 'medium',
    };
    return severityMap[errorType] || 'medium';
  }

  private getLogicErrorFix(errorType: string): string {
    const fixes: Record<string, string> = {
      'ZeroDivisionError': 'Add zero division check before division operations',
      'ValueError': 'Validate input values and add proper error handling',
      'AssertionError': 'Review assertion conditions and fix logic',
      'LogicError': 'Restructure the algorithm logic',
      'RuntimeError': 'Add proper error handling and resource management',
    };
    return fixes[errorType] || 'Review and fix the logic error';
  }

  private calculateMemoryImpact(memoryMB: number): number {
    if (memoryMB > 200) return 4.0;
    if (memoryMB > 128) return 2.5;
    if (memoryMB > 64) return 1.5;
    return 0.5;
  }

  private calculateTimeImpact(timeMs: number): number {
    if (timeMs > 10000) return 3.5;
    if (timeMs > 5000) return 2.0;
    if (timeMs > 3000) return 1.0;
    return 0.5;
  }

  private calculateCorrectnessImpact(similarity: number): number {
    if (similarity < 0.3) return 4.0;
    if (similarity < 0.5) return 3.0;
    if (similarity < 0.7) return 2.0;
    return 1.0;
  }
}

/**
 * Factory function to create execution-based detector
 */
export function createExecutionBasedDetector(config?: Partial<ExecutionAnalysisConfig>): ExecutionBasedDetector {
  return new ExecutionBasedDetector(config);
}

/**
 * Utility function for quick execution-based analysis
 */
export async function analyzeExecutionForHallucinations(
  code: string,
  expectedOutput?: any,
  config?: Partial<ExecutionAnalysisConfig>
): Promise<{
  executionResult: ExecutionResult;
  resourceHallucinations: HallucinationCategory[];
  logicHallucinations: HallucinationCategory[];
}> {
  const detector = createExecutionBasedDetector(config);
  const sandbox = new ExecutionSandbox();
  
  const executionResult = await sandbox.execute(code);
  const resourceHallucinations = await detector.detectResourceHallucinations(executionResult);
  const logicHallucinations = await detector.detectLogicHallucinations(code, executionResult, expectedOutput);
  
  return {
    executionResult,
    resourceHallucinations,
    logicHallucinations,
  };
}