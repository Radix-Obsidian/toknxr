/**
 * Hallucination Pattern Detection
 * Static analysis patterns for detecting common code hallucinations
 */

import {
  HallucinationCategory,
  PatternMatch,
  Evidence,
  CodeStructure,
} from './types/hallucination-types.js';

/**
 * Pattern matching result with confidence and evidence
 */
export interface PatternMatchResult {
  pattern: string;
  confidence: number;
  evidence: Evidence[];
  lineNumbers: number[];
  category: 'mapping' | 'naming' | 'resource' | 'logic';
  subtype: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

/**
 * Code structure analysis result
 */
export interface CodeStructureAnalysis {
  functions: string[];
  classes: string[];
  imports: string[];
  variables: string[];
  complexity: number;
  linesOfCode: number;
  hasAsyncCode: boolean;
  hasErrorHandling: boolean;
}

/**
 * Hallucination pattern detection engine
 */
export class HallucinationPatterns {
  private static readonly MAPPING_PATTERNS = {
    // TypeError patterns - incorrect type assumptions
    typeError: {
      patterns: [
        /(\w+)\s*\+\s*(\w+).*#.*(?:string|str).*(?:int|integer|number)/i,
        /(\w+)\.(\w+)\s*\(.*\).*#.*(?:not callable|has no attribute)/i,
        /(\w+)\[(\w+)\].*#.*(?:not subscriptable|unhashable)/i,
        /len\s*\(\s*(\w+)\s*\).*#.*(?:has no len|object of type)/i,
        /for\s+\w+\s+in\s+(\w+).*#.*(?:not iterable|object is not iterable)/i,
      ],
      severity: 'high' as const,
      subtype: 'data_compliance',
    },

    // IndexError patterns - incorrect array/list access
    indexError: {
      patterns: [
        /(\w+)\[(\d+)\].*#.*(?:index out of range|list index)/i,
        /(\w+)\[(\w+)\].*#.*(?:index out of range|string index)/i,
        /(\w+)\[(-\d+)\].*#.*(?:index out of range)/i,
        /(\w+)\.pop\s*\(\s*(\d+)\s*\).*#.*(?:index out of range)/i,
      ],
      severity: 'medium' as const,
      subtype: 'structure_access',
    },

    // KeyError patterns - incorrect dictionary access
    keyError: {
      patterns: [
        /(\w+)\[['"](\w+)['"]\].*#.*(?:key error|keyerror)/i,
        /(\w+)\.get\s*\(\s*['"](\w+)['"]\s*\).*#.*(?:none|missing)/i,
        /(\w+)\[(\w+)\].*#.*(?:key error|keyerror)/i,
        /del\s+(\w+)\[['"](\w+)['"]\].*#.*(?:key error)/i,
      ],
      severity: 'medium' as const,
      subtype: 'structure_access',
    },
  };

  private static readonly NAMING_PATTERNS = {
    // NameError patterns - undefined variables/functions
    nameError: {
      patterns: [
        /(\w+)\s*=.*#.*(?:name.*not defined|undefined)/i,
        /(\w+)\s*\(.*\).*#.*(?:name.*not defined|undefined)/i,
        /print\s*\(\s*(\w+)\s*\).*#.*(?:name.*not defined)/i,
        /return\s+(\w+).*#.*(?:name.*not defined)/i,
        /if\s+(\w+).*#.*(?:name.*not defined)/i,
      ],
      severity: 'high' as const,
      subtype: 'identity',
    },

    // AttributeError patterns - incorrect method/property access
    attributeError: {
      patterns: [
        /(\w+)\.(\w+).*#.*(?:has no attribute|attribute error)/i,
        /(\w+)\.(\w+)\s*\(.*\).*#.*(?:has no attribute)/i,
        /(\w+)\.(\w+)\s*=.*#.*(?:has no attribute)/i,
        /del\s+(\w+)\.(\w+).*#.*(?:has no attribute)/i,
      ],
      severity: 'medium' as const,
      subtype: 'identity',
    },

    // ImportError patterns - incorrect module imports
    importError: {
      patterns: [
        /import\s+(\w+).*#.*(?:no module named|import error)/i,
        /from\s+(\w+)\s+import\s+(\w+).*#.*(?:cannot import|import error)/i,
        /import\s+(\w+)\.(\w+).*#.*(?:no module named)/i,
        /__import__\s*\(\s*['"](\w+)['"]\s*\).*#.*(?:no module)/i,
      ],
      severity: 'critical' as const,
      subtype: 'external_source',
    },
  };

  private static readonly RESOURCE_PATTERNS = {
    // Memory-related patterns
    memoryError: {
      patterns: [
        /\[\s*\w+\s*for\s+\w+\s+in\s+range\s*\(\s*\d{6,}\s*\)\s*\].*#.*(?:memory|out of memory)/i,
        /\*\s*\[\s*\d+\s*\]\s*\*\s*\d{4,}.*#.*(?:memory)/i,
        /(\w+)\s*=\s*\[\s*\]\s*\*\s*\d{6,}.*#.*(?:memory)/i,
      ],
      severity: 'high' as const,
      subtype: 'physical_constraint',
    },

    // Recursion-related patterns
    recursionError: {
      patterns: [
        /def\s+(\w+)\s*\([^)]*\):\s*[^{]*\1\s*\([^)]*\).*#.*(?:recursion|stack)/i,
        /(\w+)\s*\([^)]*\).*\1\s*\([^)]*\).*#.*(?:maximum recursion)/i,
      ],
      severity: 'critical' as const,
      subtype: 'computational_boundary',
    },

    // File/IO patterns
    ioError: {
      patterns: [
        /open\s*\(\s*['"]([^'"]+)['"]\s*\).*#.*(?:no such file|permission denied)/i,
        /with\s+open\s*\(\s*['"]([^'"]+)['"]\s*\).*#.*(?:file not found)/i,
        /(\w+)\.read\s*\(\s*\).*#.*(?:closed file|io error)/i,
      ],
      severity: 'medium' as const,
      subtype: 'physical_constraint',
    },
  };

  private static readonly LOGIC_PATTERNS = {
    // Logic deviation patterns
    logicDeviation: {
      patterns: [
        /if\s+(\w+)\s*==\s*(\w+)\s*and\s+\1\s*!=\s*\2.*#.*(?:contradiction|impossible)/i,
        /while\s+True:\s*[^{]*(?!break).*#.*(?:infinite|endless)/i,
        /(\w+)\s*=\s*(\w+)\s*\/\s*0.*#.*(?:division by zero)/i,
        /return\s+(\w+)\s*and\s+not\s+\1.*#.*(?:contradiction)/i,
      ],
      severity: 'high' as const,
      subtype: 'logic_deviation',
    },

    // Logic breakdown patterns
    logicBreakdown: {
      patterns: [
        /if\s+(\w+):\s*[^{]*else:\s*[^{]*\1.*#.*(?:unreachable|dead code)/i,
        /(\w+)\s*=\s*None\s*[^{]*\1\.(\w+).*#.*(?:none type|attribute)/i,
        /assert\s+False.*#.*(?:assertion|always fails)/i,
      ],
      severity: 'critical' as const,
      subtype: 'logic_breakdown',
    },
  };

  /**
   * Detect mapping hallucinations (data type and structure issues)
   */
  static detectMappingHallucinations(code: string): PatternMatchResult[] {
    const results: PatternMatchResult[] = [];
    const lines = code.split('\n');

    // Check TypeError patterns
    for (const [patternName, config] of Object.entries(this.MAPPING_PATTERNS)) {
      for (const pattern of config.patterns) {
        lines.forEach((line, index) => {
          const match = pattern.exec(line);
          if (match) {
            const confidence = this.calculatePatternConfidence(match, line, patternName);
            const evidence = this.extractEvidence(match, line, index + 1);

            results.push({
              pattern: patternName,
              confidence,
              evidence,
              lineNumbers: [index + 1],
              category: 'mapping',
              subtype: config.subtype,
              severity: config.severity,
            });
          }
        });
      }
    }

    return results;
  }

  /**
   * Detect naming hallucinations (identifier and reference issues)
   */
  static detectNamingHallucinations(code: string): PatternMatchResult[] {
    const results: PatternMatchResult[] = [];
    const lines = code.split('\n');

    for (const [patternName, config] of Object.entries(this.NAMING_PATTERNS)) {
      for (const pattern of config.patterns) {
        lines.forEach((line, index) => {
          const match = pattern.exec(line);
          if (match) {
            const confidence = this.calculatePatternConfidence(match, line, patternName);
            const evidence = this.extractEvidence(match, line, index + 1);

            results.push({
              pattern: patternName,
              confidence,
              evidence,
              lineNumbers: [index + 1],
              category: 'naming',
              subtype: config.subtype,
              severity: config.severity,
            });
          }
        });
      }
    }

    return results;
  }

  /**
   * Detect resource hallucinations (memory, file, network issues)
   */
  static detectResourceHallucinations(code: string): PatternMatchResult[] {
    const results: PatternMatchResult[] = [];
    const lines = code.split('\n');

    for (const [patternName, config] of Object.entries(this.RESOURCE_PATTERNS)) {
      for (const pattern of config.patterns) {
        lines.forEach((line, index) => {
          const match = pattern.exec(line);
          if (match) {
            const confidence = this.calculatePatternConfidence(match, line, patternName);
            const evidence = this.extractEvidence(match, line, index + 1);

            results.push({
              pattern: patternName,
              confidence,
              evidence,
              lineNumbers: [index + 1],
              category: 'resource',
              subtype: config.subtype,
              severity: config.severity,
            });
          }
        });
      }
    }

    return results;
  }

  /**
   * Detect logic hallucinations (logical inconsistencies)
   */
  static detectLogicHallucinations(code: string): PatternMatchResult[] {
    const results: PatternMatchResult[] = [];
    const lines = code.split('\n');

    for (const [patternName, config] of Object.entries(this.LOGIC_PATTERNS)) {
      for (const pattern of config.patterns) {
        lines.forEach((line, index) => {
          const match = pattern.exec(line);
          if (match) {
            const confidence = this.calculatePatternConfidence(match, line, patternName);
            const evidence = this.extractEvidence(match, line, index + 1);

            results.push({
              pattern: patternName,
              confidence,
              evidence,
              lineNumbers: [index + 1],
              category: 'logic',
              subtype: config.subtype,
              severity: config.severity,
            });
          }
        });
      }
    }

    return results;
  }

  /**
   * Analyze code structure for complexity and patterns
   */
  static analyzeCodeStructure(code: string): CodeStructureAnalysis {
    const lines = code.split('\n');
    const analysis: CodeStructureAnalysis = {
      functions: [],
      classes: [],
      imports: [],
      variables: [],
      complexity: 0,
      linesOfCode: lines.filter(line => line.trim() && !line.trim().startsWith('#')).length,
      hasAsyncCode: false,
      hasErrorHandling: false,
    };

    // Extract functions
    const functionPattern = /def\s+(\w+)\s*\(/g;
    let match;
    while ((match = functionPattern.exec(code)) !== null) {
      analysis.functions.push(match[1]);
    }

    // Extract classes
    const classPattern = /class\s+(\w+)\s*[:(]/g;
    while ((match = classPattern.exec(code)) !== null) {
      analysis.classes.push(match[1]);
    }

    // Extract imports
    const importPattern = /(?:import|from)\s+(\w+)/g;
    while ((match = importPattern.exec(code)) !== null) {
      analysis.imports.push(match[1]);
    }

    // Extract variables
    const variablePattern = /(\w+)\s*=/g;
    while ((match = variablePattern.exec(code)) !== null) {
      if (!analysis.variables.includes(match[1])) {
        analysis.variables.push(match[1]);
      }
    }

    // Check for async code
    analysis.hasAsyncCode = /async\s+def|await\s+/.test(code);

    // Check for error handling
    analysis.hasErrorHandling = /try:|except|finally:|raise/.test(code);

    // Calculate complexity (simplified cyclomatic complexity)
    const complexityPatterns = [
      /if\s+/g,
      /elif\s+/g,
      /else:/g,
      /for\s+/g,
      /while\s+/g,
      /except/g,
      /and\s+/g,
      /or\s+/g,
    ];

    analysis.complexity = complexityPatterns.reduce((total, pattern) => {
      const matches = code.match(pattern);
      return total + (matches ? matches.length : 0);
    }, 1); // Base complexity of 1

    return analysis;
  }

  /**
   * Extract evidence from pattern match
   */
  static extractEvidence(match: RegExpExecArray, line: string, lineNumber: number): Evidence[] {
    const evidence: Evidence[] = [];

    // Add the matched line as primary evidence
    evidence.push({
      type: 'code_line',
      content: line.trim(),
      lineNumber,
      confidence: 0.9,
    });

    // Add specific match groups as evidence
    if (match.length > 1) {
      for (let i = 1; i < match.length; i++) {
        if (match[i]) {
          evidence.push({
            type: 'identifier',
            content: match[i],
            lineNumber,
            confidence: 0.8,
          });
        }
      }
    }

    // Add context if there's a comment indicating the issue
    const commentMatch = line.match(/#\s*(.+)$/);
    if (commentMatch) {
      evidence.push({
        type: 'error_message',
        content: commentMatch[1].trim(),
        lineNumber,
        confidence: 0.95,
      });
    }

    return evidence;
  }

  /**
   * Calculate confidence score for a pattern match
   */
  private static calculatePatternConfidence(
    match: RegExpExecArray,
    line: string,
    patternName: string
  ): number {
    let confidence = 0.7; // Base confidence

    // Increase confidence if there's an error comment
    if (line.includes('#') && /error|exception|fail|wrong|issue/i.test(line)) {
      confidence += 0.2;
    }

    // Increase confidence for specific error types in comments
    const errorKeywords = {
      typeError: /type.*error|cannot.*add|not.*callable/i,
      indexError: /index.*out.*of.*range|list.*index/i,
      keyError: /key.*error|key.*not.*found/i,
      nameError: /name.*not.*defined|undefined.*variable/i,
      attributeError: /has.*no.*attribute|attribute.*error/i,
      importError: /no.*module.*named|import.*error/i,
      memoryError: /memory.*error|out.*of.*memory/i,
      recursionError: /recursion.*limit|maximum.*recursion/i,
      ioError: /file.*not.*found|permission.*denied/i,
    };

    if (errorKeywords[patternName as keyof typeof errorKeywords]?.test(line)) {
      confidence += 0.15;
    }

    // Decrease confidence for common variable names that might be false positives
    const commonNames = ['data', 'result', 'value', 'item', 'temp', 'x', 'y', 'i', 'j'];
    if (match[1] && commonNames.includes(match[1].toLowerCase())) {
      confidence -= 0.1;
    }

    // Ensure confidence is within bounds
    return Math.max(0.1, Math.min(1.0, confidence));
  }

  /**
   * Convert pattern match results to hallucination categories
   */
  static convertToHallucinationCategories(results: PatternMatchResult[]): HallucinationCategory[] {
    return results.map(result => ({
      type: result.category,
      subtype: result.subtype as any,
      severity: result.severity,
      confidence: result.confidence,
      description: this.generateDescription(result),
      evidence: result.evidence,
      lineNumbers: result.lineNumbers,
      suggestedFix: this.generateSuggestedFix(result),
      businessImpact: this.calculateBusinessImpact(result),
    }));
  }

  /**
   * Generate human-readable description for a pattern match
   */
  private static generateDescription(result: PatternMatchResult): string {
    const descriptions = {
      typeError: 'Potential type mismatch or incorrect type assumption',
      indexError: 'Array or list index may be out of bounds',
      keyError: 'Dictionary key may not exist',
      nameError: 'Variable or function may not be defined',
      attributeError: 'Object may not have the specified attribute or method',
      importError: 'Module or package may not be available',
      memoryError: 'Code may consume excessive memory',
      recursionError: 'Infinite recursion or stack overflow risk',
      ioError: 'File or I/O operation may fail',
      logicDeviation: 'Logical inconsistency or contradiction detected',
      logicBreakdown: 'Code logic may be fundamentally flawed',
    };

    return descriptions[result.pattern as keyof typeof descriptions] || 
           `Potential ${result.category} hallucination detected`;
  }

  /**
   * Generate suggested fix for a pattern match
   */
  private static generateSuggestedFix(result: PatternMatchResult): string {
    const fixes = {
      typeError: 'Verify data types and add type checking or conversion',
      indexError: 'Add bounds checking before accessing array elements',
      keyError: 'Use .get() method or check if key exists before access',
      nameError: 'Define the variable or function before using it',
      attributeError: 'Verify object type and available methods/attributes',
      importError: 'Install required package or check import statement',
      memoryError: 'Optimize data structures or add memory limits',
      recursionError: 'Add base case or use iterative approach',
      ioError: 'Add file existence check and error handling',
      logicDeviation: 'Review and fix logical contradictions',
      logicBreakdown: 'Restructure the logic flow',
    };

    return fixes[result.pattern as keyof typeof fixes] || 
           'Review and test the code thoroughly';
  }

  /**
   * Calculate business impact score for a pattern match
   */
  private static calculateBusinessImpact(result: PatternMatchResult): {
    estimatedDevTimeWasted: number;
    costMultiplier: number;
    qualityImpact: number;
    costOfHallucinations: number;
  } {
    const severityMultipliers = {
      low: { time: 0.5, cost: 1.1, quality: 5 },
      medium: { time: 2.0, cost: 1.3, quality: 15 },
      high: { time: 4.0, cost: 1.6, quality: 30 },
      critical: { time: 8.0, cost: 2.0, quality: 50 },
    };

    const multiplier = severityMultipliers[result.severity];
    const devTimeWasted = multiplier.time * result.confidence;
    
    return {
      estimatedDevTimeWasted: devTimeWasted,
      costMultiplier: multiplier.cost,
      qualityImpact: Math.round(multiplier.quality * result.confidence),
      costOfHallucinations: devTimeWasted * 100, // $100/hour dev rate
    };
  }
}

/**
 * Factory function to create pattern detection results
 */
export function detectAllPatterns(code: string): PatternMatchResult[] {
  const results: PatternMatchResult[] = [];
  
  results.push(...HallucinationPatterns.detectMappingHallucinations(code));
  results.push(...HallucinationPatterns.detectNamingHallucinations(code));
  results.push(...HallucinationPatterns.detectResourceHallucinations(code));
  results.push(...HallucinationPatterns.detectLogicHallucinations(code));
  
  // Sort by severity and confidence
  return results.sort((a, b) => {
    const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
    const severityDiff = severityOrder[b.severity] - severityOrder[a.severity];
    if (severityDiff !== 0) return severityDiff;
    return b.confidence - a.confidence;
  });
}

/**
 * Utility function to get pattern statistics
 */
export function getPatternStatistics(results: PatternMatchResult[]): {
  totalPatterns: number;
  byCategory: Record<string, number>;
  bySeverity: Record<string, number>;
  avgConfidence: number;
} {
  const stats = {
    totalPatterns: results.length,
    byCategory: {} as Record<string, number>,
    bySeverity: {} as Record<string, number>,
    avgConfidence: 0,
  };

  if (results.length === 0) return stats;

  // Count by category
  results.forEach(result => {
    stats.byCategory[result.category] = (stats.byCategory[result.category] || 0) + 1;
    stats.bySeverity[result.severity] = (stats.bySeverity[result.severity] || 0) + 1;
  });

  // Calculate average confidence
  stats.avgConfidence = results.reduce((sum, result) => sum + result.confidence, 0) / results.length;

  return stats;
}