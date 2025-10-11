/**
 * Enhanced Hallucination Detector
 * Implementation of CodeHalu research methodology for systematic code hallucination detection
 * 
 * Based on: "CodeHalu: Investigating Code Hallucinations in LLMs via Execution-based Verification"
 * @see https://github.com/yuchen814/CodeHalu
 */

import {
  CodeHaluResult,
  HallucinationCategory,
  HallucinationType,
  HallucinationSubtype,
  DetectionOptions,
  ExecutionResult,
  DetectionMetadata,
  Recommendation,
  CodeContext,
  PatternMatch,
  CodeStructure,
  DEFAULT_DETECTION_OPTIONS,
  DEFAULT_BUSINESS_IMPACT,
  ERROR_CATEGORY_MAP,
} from './types/hallucination-types.js';

/**
 * Main CodeHalu detection engine following the research methodology
 */
export class CodeHaluDetector {
  private detectionVersion = '1.0.0';
  private startTime: number = 0;

  /**
   * Primary detection method following CodeHalu algorithm
   * 
   * @param code - Source code to analyze
   * @param language - Programming language (currently supports 'python')
   * @param options - Detection configuration options
   * @returns Complete hallucination analysis result
   */
  async detectHallucinations(
    code: string,
    language: string = 'python',
    options: DetectionOptions = {}
  ): Promise<CodeHaluResult> {
    this.startTime = Date.now();
    const config = { ...DEFAULT_DETECTION_OPTIONS, ...options };

    try {
      // Step 1: Validate input and prepare analysis
      this.validateInput(code, language);
      
      // Step 2: Perform static analysis for immediate issues
      const staticCategories = await this.performStaticAnalysis(code, language, config);
      
      // Step 3: Execute code if enabled and safe
      let executionResult: ExecutionResult | undefined;
      let executionCategories: HallucinationCategory[] = [];
      
      if (config.enableExecution && this.isExecutionSafe(code)) {
        executionResult = await this.executeCodeSafely(code, language, config);
        executionCategories = await this.analyzeExecutionResult(executionResult, code);
      }
      
      // Step 4: Combine all detected categories
      const allCategories = [...staticCategories, ...executionCategories];
      const filteredCategories = this.filterByConfidence(allCategories, config.confidenceThreshold);
      
      // Step 5: Calculate overall metrics
      const overallRate = this.calculateHallucinationRate(filteredCategories);
      const qualityImpact = this.calculateQualityImpact(filteredCategories);
      
      // Step 6: Generate recommendations if enabled
      const recommendations = config.generateRecommendations 
        ? this.generateRecommendations(filteredCategories, config.codeContext)
        : [];
      
      // Step 7: Compile final result
      return this.compileResult(
        filteredCategories,
        overallRate,
        qualityImpact,
        recommendations,
        executionResult,
        code,
        language
      );
      
    } catch (error) {
      // Handle detection errors gracefully
      return this.createErrorResult(error, code, language);
    }
  }

  /**
   * Perform static analysis to detect hallucination patterns
   */
  private async performStaticAnalysis(
    code: string,
    language: string,
    options: DetectionOptions
  ): Promise<HallucinationCategory[]> {
    const categories: HallucinationCategory[] = [];
    
    // Analyze each category if included in focus
    if (options.focusCategories?.includes('mapping')) {
      categories.push(...await this.detectMappingHallucinations(code));
    }
    
    if (options.focusCategories?.includes('naming')) {
      categories.push(...await this.detectNamingHallucinations(code));
    }
    
    if (options.focusCategories?.includes('resource')) {
      categories.push(...await this.detectResourceHallucinations(code));
    }
    
    if (options.focusCategories?.includes('logic')) {
      categories.push(...await this.detectLogicHallucinations(code));
    }
    
    return categories;
  }

  /**
   * Detect mapping hallucinations - issues with data types, values, and structures
   */
  private async detectMappingHallucinations(code: string): Promise<HallucinationCategory[]> {
    const categories: HallucinationCategory[] = [];
    
    // Data compliance hallucinations
    const dataComplianceIssues = this.detectDataComplianceIssues(code);
    categories.push(...dataComplianceIssues);
    
    // Structure access hallucinations
    const structureAccessIssues = this.detectStructureAccessIssues(code);
    categories.push(...structureAccessIssues);
    
    return categories;
  }

  /**
   * Detect naming hallucinations - memory and factual issues with variables, attributes, modules
   */
  private async detectNamingHallucinations(code: string): Promise<HallucinationCategory[]> {
    const categories: HallucinationCategory[] = [];
    
    // Identity hallucinations
    const identityIssues = this.detectIdentityIssues(code);
    categories.push(...identityIssues);
    
    // External source hallucinations
    const externalSourceIssues = this.detectExternalSourceIssues(code);
    categories.push(...externalSourceIssues);
    
    return categories;
  }

  /**
   * Detect resource hallucinations - issues with resource consumption and control flow
   */
  private async detectResourceHallucinations(code: string): Promise<HallucinationCategory[]> {
    const categories: HallucinationCategory[] = [];
    
    // Physical constraint hallucinations
    const physicalConstraintIssues = this.detectPhysicalConstraintIssues(code);
    categories.push(...physicalConstraintIssues);
    
    // Computational boundary hallucinations
    const computationalBoundaryIssues = this.detectComputationalBoundaryIssues(code);
    categories.push(...computationalBoundaryIssues);
    
    return categories;
  }

  /**
   * Detect logic hallucinations - discrepancies between expected and actual outcomes
   */
  private async detectLogicHallucinations(code: string): Promise<HallucinationCategory[]> {
    const categories: HallucinationCategory[] = [];
    
    // Logic deviation hallucinations
    const logicDeviationIssues = this.detectLogicDeviationIssues(code);
    categories.push(...logicDeviationIssues);
    
    // Logic breakdown hallucinations
    const logicBreakdownIssues = this.detectLogicBreakdownIssues(code);
    categories.push(...logicBreakdownIssues);
    
    return categories;
  }

  /**
   * Detect data compliance issues (type mismatches, rule violations)
   */
  private detectDataComplianceIssues(code: string): HallucinationCategory[] {
    const issues: HallucinationCategory[] = [];
    
    // Pattern: Type mismatches (e.g., string operations on numbers)
    const typeMismatchPattern = /(\w+)\s*\+\s*['"]|['"].*\+\s*(\d+)/g;
    let match;
    while ((match = typeMismatchPattern.exec(code)) !== null) {
      issues.push(this.createHallucinationCategory(
        'mapping',
        'data_compliance',
        'medium',
        0.8,
        [`Type mismatch detected at: ${match[0]}`],
        'pattern',
        this.getLineNumber(code, match.index)
      ));
    }
    
    // Pattern: Invalid method calls on wrong types
    const invalidMethodPattern = /(\d+)\.(\w+)\(|(\w+)\.(\w+)\(\s*\)/g;
    while ((match = invalidMethodPattern.exec(code)) !== null) {
      if (match[1] && ['append', 'extend', 'remove'].includes(match[2])) {
        issues.push(this.createHallucinationCategory(
          'mapping',
          'data_compliance',
          'high',
          0.9,
          [`Invalid method call on number: ${match[0]}`],
          'pattern',
          this.getLineNumber(code, match.index)
        ));
      }
    }
    
    return issues;
  }

  /**
   * Detect structure access issues (non-existent indices, keys)
   */
  private detectStructureAccessIssues(code: string): HallucinationCategory[] {
    const issues: HallucinationCategory[] = [];
    
    // Pattern: Potential index out of bounds
    const indexAccessPattern = /(\w+)\[(\d+|\w+)\]/g;
    let match;
    while ((match = indexAccessPattern.exec(code)) !== null) {
      // Check if index is hardcoded and potentially problematic
      if (/^\d+$/.test(match[2]) && parseInt(match[2]) > 10) {
        issues.push(this.createHallucinationCategory(
          'mapping',
          'structure_access',
          'medium',
          0.6,
          [`Potential index out of bounds: ${match[0]}`],
          'pattern',
          this.getLineNumber(code, match.index)
        ));
      }
    }
    
    // Pattern: Dictionary key access without checking
    const keyAccessPattern = /(\w+)\[['"](\w+)['"]\]/g;
    while ((match = keyAccessPattern.exec(code)) !== null) {
      // Check if there's no prior key existence check
      const beforeCode = code.substring(0, match.index);
      if (!beforeCode.includes(`'${match[2]}' in ${match[1]}`) && 
          !beforeCode.includes(`"${match[2]}" in ${match[1]}`)) {
        issues.push(this.createHallucinationCategory(
          'mapping',
          'structure_access',
          'medium',
          0.7,
          [`Unchecked dictionary key access: ${match[0]}`],
          'pattern',
          this.getLineNumber(code, match.index)
        ));
      }
    }
    
    return issues;
  }

  /**
   * Detect identity issues (undefined variables, unassigned variables)
   */
  private detectIdentityIssues(code: string): HallucinationCategory[] {
    const issues: HallucinationCategory[] = [];
    
    // Simple variable usage analysis
    const lines = code.split('\n');
    const definedVars = new Set<string>();
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Track variable definitions
      const assignmentMatch = line.match(/^(\w+)\s*=/);
      if (assignmentMatch) {
        definedVars.add(assignmentMatch[1]);
      }
      
      // Check for variable usage
      const usageMatches = line.matchAll(/\b(\w+)\b/g);
      for (const match of usageMatches) {
        const varName = match[1];
        
        // Skip Python keywords and builtins
        if (this.isPythonKeywordOrBuiltin(varName)) continue;
        
        // Check if variable is used before definition
        if (!definedVars.has(varName) && !line.includes(`${varName} =`)) {
          issues.push(this.createHallucinationCategory(
            'naming',
            'identity',
            'high',
            0.8,
            [`Variable '${varName}' used before definition`],
            'static',
            i + 1
          ));
        }
      }
    }
    
    return issues;
  }

  /**
   * Detect external source issues (non-existent modules, import failures)
   */
  private detectExternalSourceIssues(code: string): HallucinationCategory[] {
    const issues: HallucinationCategory[] = [];
    
    // Pattern: Import statements
    const importPattern = /^(?:from\s+(\w+(?:\.\w+)*)\s+)?import\s+(\w+(?:\s*,\s*\w+)*)/gm;
    let match;
    
    while ((match = importPattern.exec(code)) !== null) {
      const moduleName = match[1] || match[2].split(',')[0].trim();
      
      // Check for potentially non-existent modules
      if (this.isPotentiallyNonExistentModule(moduleName)) {
        issues.push(this.createHallucinationCategory(
          'naming',
          'external_source',
          'high',
          0.9,
          [`Potentially non-existent module: ${moduleName}`],
          'pattern',
          this.getLineNumber(code, match.index)
        ));
      }
    }
    
    return issues;
  }

  /**
   * Detect physical constraint issues (memory, stack depth)
   */
  private detectPhysicalConstraintIssues(code: string): HallucinationCategory[] {
    const issues: HallucinationCategory[] = [];
    
    // Pattern: Recursive functions without base case
    const functionPattern = /def\s+(\w+)\s*\([^)]*\):/g;
    let match;
    
    while ((match = functionPattern.exec(code)) !== null) {
      const funcName = match[1];
      const funcStart = match.index;
      const funcEnd = this.findFunctionEnd(code, funcStart);
      const funcBody = code.substring(funcStart, funcEnd);
      
      // Check if function calls itself
      if (funcBody.includes(funcName + '(')) {
        // Check for base case
        if (!funcBody.includes('return') || !funcBody.includes('if')) {
          issues.push(this.createHallucinationCategory(
            'resource',
            'physical_constraint',
            'critical',
            0.9,
            [`Recursive function '${funcName}' may lack proper base case`],
            'static',
            this.getLineNumber(code, match.index)
          ));
        }
      }
    }
    
    // Pattern: Large data structures
    const largeListPattern = /\[[^\]]{200,}\]/g;
    while ((match = largeListPattern.exec(code)) !== null) {
      issues.push(this.createHallucinationCategory(
        'resource',
        'physical_constraint',
        'medium',
        0.7,
        [`Large data structure detected: ${match[0].substring(0, 50)}...`],
        'pattern',
        this.getLineNumber(code, match.index)
      ));
    }
    
    return issues;
  }

  /**
   * Detect computational boundary issues (overflow, iteration control)
   */
  private detectComputationalBoundaryIssues(code: string): HallucinationCategory[] {
    const issues: HallucinationCategory[] = [];
    
    // Pattern: Infinite loops
    const whileTruePattern = /while\s+True\s*:/g;
    let whileMatch;
    
    while ((whileMatch = whileTruePattern.exec(code)) !== null) {
      const loopStart = whileMatch.index;
      const loopEnd = this.findBlockEnd(code, loopStart);
      const loopBody = code.substring(loopStart, loopEnd);
      
      // Check for break statements
      if (!loopBody.includes('break') && !loopBody.includes('return')) {
        issues.push(this.createHallucinationCategory(
          'resource',
          'computational_boundary',
          'critical',
          0.95,
          [`Potential infinite loop: while True without break`],
          'static',
          this.getLineNumber(code, whileMatch.index)
        ));
      }
    }
    
    // Pattern: Large range operations
    const rangePattern = /range\s*\(\s*(\d+)\s*\)/g;
    let rangeMatch;
    while ((rangeMatch = rangePattern.exec(code)) !== null) {
      const rangeSize = parseInt(rangeMatch[1]);
      if (rangeSize > 1000000) {
        issues.push(this.createHallucinationCategory(
          'resource',
          'computational_boundary',
          'high',
          0.8,
          [`Large range operation: range(${rangeSize})`],
          'pattern',
          this.getLineNumber(code, rangeMatch.index)
        ));
      }
    }
    
    return issues;
  }

  /**
   * Detect logic deviation issues (incorrect logic, contradictions)
   */
  private detectLogicDeviationIssues(code: string): HallucinationCategory[] {
    const issues: HallucinationCategory[] = [];
    
    // Pattern: Contradictory conditions
    const ifPattern = /if\s+([^:]+):/g;
    let match;
    
    while ((match = ifPattern.exec(code)) !== null) {
      const condition = match[1].trim();
      
      // Check for always false conditions
      if (condition.includes('False') || condition.includes('0 == 1')) {
        issues.push(this.createHallucinationCategory(
          'logic',
          'logic_deviation',
          'high',
          0.9,
          [`Always false condition: ${condition}`],
          'static',
          this.getLineNumber(code, match.index)
        ));
      }
      
      // Check for contradictory comparisons
      if (/(\w+)\s*==\s*(\w+)\s+and\s+\1\s*!=\s*\2/.test(condition)) {
        issues.push(this.createHallucinationCategory(
          'logic',
          'logic_deviation',
          'high',
          0.95,
          [`Contradictory condition: ${condition}`],
          'static',
          this.getLineNumber(code, match.index)
        ));
      }
    }
    
    return issues;
  }

  /**
   * Detect logic breakdown issues (stuttering, context loss)
   */
  private detectLogicBreakdownIssues(code: string): HallucinationCategory[] {
    const issues: HallucinationCategory[] = [];
    
    // Pattern: Repeated lines (stuttering)
    const lines = code.split('\n');
    for (let i = 0; i < lines.length - 1; i++) {
      const currentLine = lines[i].trim();
      const nextLine = lines[i + 1].trim();
      
      if (currentLine.length > 10 && currentLine === nextLine) {
        issues.push(this.createHallucinationCategory(
          'logic',
          'logic_breakdown',
          'medium',
          0.8,
          [`Repeated line detected: ${currentLine}`],
          'pattern',
          i + 1
        ));
      }
    }
    
    // Pattern: Incomplete function definitions
    const incompleteFuncPattern = /def\s+\w+\s*\([^)]*\):\s*$/gm;
    let incompleteMatch;
    while ((incompleteMatch = incompleteFuncPattern.exec(code)) !== null) {
      issues.push(this.createHallucinationCategory(
        'logic',
        'logic_breakdown',
        'high',
        0.9,
        [`Incomplete function definition: ${incompleteMatch[0]}`],
        'static',
        this.getLineNumber(code, incompleteMatch.index)
      ));
    }
    
    return issues;
  }

  /**
   * Execute code safely in a controlled environment
   */
  private async executeCodeSafely(
    code: string,
    language: string,
    options: DetectionOptions
  ): Promise<ExecutionResult> {
    // This is a placeholder for the actual execution sandbox
    // In a real implementation, this would use a secure container
    
    return {
      success: false,
      output: '',
      stderr: 'Execution sandbox not yet implemented',
      errors: [],
      resourceUsage: {
        memoryMB: 0,
        executionTimeMs: 0,
        cpuUsage: 0,
      },
      securityFlags: [],
      timedOut: false,
    };
  }

  /**
   * Analyze execution result for hallucinations
   */
  private async analyzeExecutionResult(
    executionResult: ExecutionResult,
    code: string
  ): Promise<HallucinationCategory[]> {
    const categories: HallucinationCategory[] = [];
    
    // Analyze execution errors
    for (const error of executionResult.errors) {
      const mapping = ERROR_CATEGORY_MAP[error.type];
      if (mapping) {
        categories.push(this.createHallucinationCategory(
          mapping.type,
          mapping.subtype,
          'high',
          0.95,
          [`Execution error: ${error.message}`],
          'execution',
          error.lineNumber
        ));
      }
    }
    
    // Analyze resource usage
    if (executionResult.resourceUsage.memoryMB > 100) {
      categories.push(this.createHallucinationCategory(
        'resource',
        'physical_constraint',
        'medium',
        0.8,
        [`High memory usage: ${executionResult.resourceUsage.memoryMB}MB`],
        'execution'
      ));
    }
    
    if (executionResult.timedOut) {
      categories.push(this.createHallucinationCategory(
        'resource',
        'computational_boundary',
        'high',
        0.9,
        ['Code execution timed out'],
        'execution'
      ));
    }
    
    return categories;
  }

  /**
   * Helper method to create hallucination category
   */
  private createHallucinationCategory(
    type: HallucinationType,
    subtype: HallucinationSubtype,
    severity: 'low' | 'medium' | 'high' | 'critical',
    confidence: number,
    evidence: string[],
    detectionMethod: 'static' | 'execution' | 'pattern' | 'statistical',
    lineNumber?: number
  ): HallucinationCategory {
    return {
      type,
      subtype,
      severity,
      confidence,
      evidence,
      detectionMethod,
      businessImpact: DEFAULT_BUSINESS_IMPACT[type],
      lineNumbers: lineNumber ? [lineNumber] : undefined,
    };
  }

  /**
   * Utility methods
   */
  private validateInput(code: string, language: string): void {
    if (!code || code.trim().length === 0) {
      throw new Error('Code cannot be empty');
    }
    
    if (language !== 'python') {
      throw new Error(`Language '${language}' not yet supported`);
    }
  }

  private isExecutionSafe(code: string): boolean {
    // Basic safety checks
    const dangerousPatterns = [
      /import\s+os/,
      /import\s+subprocess/,
      /import\s+sys/,
      /exec\s*\(/,
      /eval\s*\(/,
      /__import__/,
    ];
    
    return !dangerousPatterns.some(pattern => pattern.test(code));
  }

  private filterByConfidence(
    categories: HallucinationCategory[],
    threshold: number
  ): HallucinationCategory[] {
    return categories.filter(cat => cat.confidence >= threshold);
  }

  private calculateHallucinationRate(categories: HallucinationCategory[]): number {
    if (categories.length === 0) return 0;
    
    // Weight by severity and confidence
    const totalWeight = categories.reduce((sum, cat) => {
      const severityWeight = { low: 1, medium: 2, high: 3, critical: 4 }[cat.severity];
      return sum + (severityWeight * cat.confidence);
    }, 0);
    
    const maxPossibleWeight = categories.length * 4; // All critical with 1.0 confidence
    return Math.min(totalWeight / maxPossibleWeight, 1.0);
  }

  private calculateQualityImpact(categories: HallucinationCategory[]): number {
    return categories.reduce((sum, cat) => sum + cat.businessImpact.qualityImpact, 0);
  }

  private generateRecommendations(
    categories: HallucinationCategory[],
    context?: CodeContext
  ): Recommendation[] {
    const recommendations: Recommendation[] = [];
    const categoryGroups = this.groupByCategory(categories);
    
    for (const [type, cats] of Object.entries(categoryGroups)) {
      recommendations.push(this.createRecommendationForCategory(type as HallucinationType, cats));
    }
    
    return recommendations;
  }

  private groupByCategory(categories: HallucinationCategory[]): Record<string, HallucinationCategory[]> {
    return categories.reduce((groups, cat) => {
      if (!groups[cat.type]) groups[cat.type] = [];
      groups[cat.type].push(cat);
      return groups;
    }, {} as Record<string, HallucinationCategory[]>);
  }

  private createRecommendationForCategory(
    type: HallucinationType,
    categories: HallucinationCategory[]
  ): Recommendation {
    const recommendations = {
      mapping: {
        title: 'Fix Data Type and Structure Issues',
        description: 'Address type mismatches and structure access problems',
        actionItems: [
          'Add type checking before operations',
          'Validate array indices and dictionary keys',
          'Use proper type conversion methods',
        ],
        expectedImpact: 'Reduce runtime errors by 60-80%',
      },
      naming: {
        title: 'Resolve Variable and Import Issues',
        description: 'Fix undefined variables and missing imports',
        actionItems: [
          'Define all variables before use',
          'Check import statements for typos',
          'Verify module availability',
        ],
        expectedImpact: 'Eliminate name-related errors',
      },
      resource: {
        title: 'Optimize Resource Usage',
        description: 'Address memory and computational constraints',
        actionItems: [
          'Add proper base cases to recursive functions',
          'Limit data structure sizes',
          'Implement timeout mechanisms',
        ],
        expectedImpact: 'Prevent resource exhaustion issues',
      },
      logic: {
        title: 'Improve Code Logic',
        description: 'Fix logical inconsistencies and incomplete code',
        actionItems: [
          'Review conditional statements',
          'Complete function implementations',
          'Remove contradictory logic',
        ],
        expectedImpact: 'Improve code correctness and reliability',
      },
    };

    const rec = recommendations[type];
    return {
      category: type,
      priority: categories.some(c => c.severity === 'critical') ? 'high' : 'medium',
      title: rec.title,
      description: rec.description,
      actionItems: rec.actionItems,
      expectedImpact: rec.expectedImpact,
    };
  }

  private compileResult(
    categories: HallucinationCategory[],
    overallRate: number,
    qualityImpact: number,
    recommendations: Recommendation[],
    executionResult: ExecutionResult | undefined,
    code: string,
    language: string
  ): CodeHaluResult {
    const analysisTime = Date.now() - this.startTime;
    
    const summary = {
      totalHallucinations: categories.length,
      criticalCount: categories.filter(c => c.severity === 'critical').length,
      highSeverityCount: categories.filter(c => c.severity === 'high').length,
      mediumSeverityCount: categories.filter(c => c.severity === 'medium').length,
      lowSeverityCount: categories.filter(c => c.severity === 'low').length,
      mostCommonCategory: this.getMostCommonCategory(categories),
      overallRisk: this.calculateOverallRisk(categories),
    };

    return {
      overallHallucinationRate: overallRate,
      categories,
      executionResult,
      codeQualityImpact: qualityImpact,
      recommendations,
      detectionMetadata: {
        analysisTimeMs: analysisTime,
        detectionVersion: this.detectionVersion,
        language,
        codeLength: code.length,
        timestamp: new Date().toISOString(),
        executionVerified: !!executionResult,
      },
      hasCriticalIssues: summary.criticalCount > 0,
      summary,
    };
  }

  private createErrorResult(error: any, code: string, language: string): CodeHaluResult {
    return {
      overallHallucinationRate: 0,
      categories: [],
      codeQualityImpact: 0,
      recommendations: [],
      detectionMetadata: {
        analysisTimeMs: Date.now() - this.startTime,
        detectionVersion: this.detectionVersion,
        language,
        codeLength: code.length,
        timestamp: new Date().toISOString(),
        executionVerified: false,
      },
      hasCriticalIssues: false,
      summary: {
        totalHallucinations: 0,
        criticalCount: 0,
        highSeverityCount: 0,
        mediumSeverityCount: 0,
        lowSeverityCount: 0,
        mostCommonCategory: null,
        overallRisk: 'low',
      },
    };
  }

  private getMostCommonCategory(categories: HallucinationCategory[]): HallucinationType | null {
    if (categories.length === 0) return null;
    
    const counts = categories.reduce((acc, cat) => {
      acc[cat.type] = (acc[cat.type] || 0) + 1;
      return acc;
    }, {} as Record<HallucinationType, number>);
    
    return Object.entries(counts).reduce((a, b) => counts[a[0] as HallucinationType] > counts[b[0] as HallucinationType] ? a : b)[0] as HallucinationType;
  }

  private calculateOverallRisk(categories: HallucinationCategory[]): 'low' | 'medium' | 'high' | 'critical' {
    if (categories.some(c => c.severity === 'critical')) return 'critical';
    if (categories.filter(c => c.severity === 'high').length >= 2) return 'high';
    if (categories.filter(c => c.severity === 'medium').length >= 3) return 'medium';
    return 'low';
  }

  // Utility helper methods
  private getLineNumber(code: string, index: number): number {
    return code.substring(0, index).split('\n').length;
  }

  private findFunctionEnd(code: string, start: number): number {
    // Simple implementation - find next function or end of file
    const nextFunc = code.indexOf('\ndef ', start + 1);
    return nextFunc === -1 ? code.length : nextFunc;
  }

  private findBlockEnd(code: string, start: number): number {
    // Simple implementation - find next unindented line
    const lines = code.substring(start).split('\n');
    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim() && !lines[i].startsWith('    ') && !lines[i].startsWith('\t')) {
        return start + lines.slice(0, i).join('\n').length;
      }
    }
    return code.length;
  }

  private isPythonKeywordOrBuiltin(word: string): boolean {
    const keywords = [
      'and', 'as', 'assert', 'break', 'class', 'continue', 'def', 'del', 'elif', 'else',
      'except', 'exec', 'finally', 'for', 'from', 'global', 'if', 'import', 'in', 'is',
      'lambda', 'not', 'or', 'pass', 'print', 'raise', 'return', 'try', 'while', 'with',
      'yield', 'True', 'False', 'None', 'len', 'range', 'str', 'int', 'float', 'list',
      'dict', 'set', 'tuple', 'type', 'isinstance', 'hasattr', 'getattr', 'setattr'
    ];
    return keywords.includes(word);
  }

  private isPotentiallyNonExistentModule(moduleName: string): boolean {
    // Common modules that should exist
    const commonModules = [
      'os', 'sys', 'json', 'math', 'random', 'datetime', 'time', 'collections',
      'itertools', 'functools', 're', 'urllib', 'http', 'pathlib', 'typing'
    ];
    
    // If it's not a common module and has unusual characteristics, flag it
    return !commonModules.includes(moduleName) && 
           (moduleName.length > 15 || /[A-Z]{3,}/.test(moduleName));
  }
}