/**
 * Hallucination Pattern Detection
 * Advanced pattern matching for systematic code hallucination detection
 * 
 * Based on CodeHalu research methodology for pattern-based detection
 */

import {
  HallucinationCategory,
  HallucinationType,
  HallucinationSubtype,
  PatternMatch,
  CodeStructure,
  DEFAULT_BUSINESS_IMPACT,
} from './types/hallucination-types.js';

/**
 * Pattern detection result
 */
export interface PatternDetectionResult {
  matches: PatternMatch[];
  categories: HallucinationCategory[];
  codeStructure: CodeStructure;
  confidence: number;
}

/**
 * Pattern definition for hallucination detection
 */
export interface HallucinationPattern {
  id: string;
  name: string;
  description: string;
  category: HallucinationType;
  subtype: HallucinationSubtype;
  severity: 'low' | 'medium' | 'high' | 'critical';
  regex: RegExp;
  confidence: number;
  evidenceExtractor: (match: RegExpMatchArray, code: string) => string[];
  suggestedFix?: string;
  examples: string[];
}

/**
 * Advanced pattern matcher for hallucination detection
 */
export class HallucinationPatterns {
  private patterns: HallucinationPattern[] = [];

  constructor() {
    this.initializePatterns();
  }

  /**
   * Initialize all hallucination detection patterns
   */
  private initializePatterns(): void {
    // Mapping Hallucination Patterns
    this.patterns.push(...this.getMappingPatterns());
    
    // Naming Hallucination Patterns
    this.patterns.push(...this.getNamingPatterns());
    
    // Resource Hallucination Patterns
    this.patterns.push(...this.getResourcePatterns());
    
    // Logic Hallucination Patterns
    this.patterns.push(...this.getLogicPatterns());
  }

  /**
   * Detect all patterns in the given code
   */
  detectPatterns(code: string): PatternDetectionResult {
    const matches: PatternMatch[] = [];
    const categories: HallucinationCategory[] = [];
    
    // Analyze code structure first
    const codeStructure = this.analyzeCodeStructure(code);
    
    // Run pattern detection
    for (const pattern of this.patterns) {
      const patternMatches = this.detectPattern(pattern, code);
      matches.push(...patternMatches);
      
      // Convert matches to categories
      for (const match of patternMatches) {
        categories.push(this.createCategoryFromMatch(match, pattern));
      }
    }
    
    // Calculate overall confidence
    const confidence = this.calculateOverallConfidence(matches);
    
    return {
      matches,
      categories,
      codeStructure,
      confidence,
    };
  }

  /**
   * Detect a specific pattern in code
   */
  private detectPattern(pattern: HallucinationPattern, code: string): PatternMatch[] {
    const matches: PatternMatch[] = [];
    const lines = code.split('\n');
    
    for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
      const line = lines[lineIndex];
      const regex = new RegExp(pattern.regex.source, pattern.regex.flags);
      let match;
      
      while ((match = regex.exec(line)) !== null) {
        const evidence = pattern.evidenceExtractor(match, code);
        
        matches.push({
          pattern: pattern.id,
          confidence: pattern.confidence,
          location: {
            startLine: lineIndex + 1,
            endLine: lineIndex + 1,
            startColumn: match.index,
            endColumn: match.index + match[0].length,
          },
          evidence: evidence.join('; '),
          suggestedCategory: {
            type: pattern.category,
            subtype: pattern.subtype,
            severity: pattern.severity,
            confidence: pattern.confidence,
            evidence,
            detectionMethod: 'pattern',
            businessImpact: DEFAULT_BUSINESS_IMPACT[pattern.category],
            lineNumbers: [lineIndex + 1],
            suggestedFix: pattern.suggestedFix,
          },
        });
        
        // Prevent infinite loops
        if (regex.lastIndex === match.index) {
          regex.lastIndex++;
        }
      }
    }
    
    return matches;
  }

  /**
   * Get mapping hallucination patterns
   */
  private getMappingPatterns(): HallucinationPattern[] {
    return [
      {
        id: 'type_mismatch_string_number',
        name: 'String-Number Type Mismatch',
        description: 'Attempting to perform arithmetic operations between strings and numbers',
        category: 'mapping',
        subtype: 'data_compliance',
        severity: 'high',
        regex: /(\w+|\d+)\s*[\+\-\*\/]\s*['"][^'"]*['"]|['"][^'"]*['"]\s*[\+\-\*\/]\s*(\w+|\d+)/g,
        confidence: 0.85,
        evidenceExtractor: (match) => [`Type mismatch detected: ${match[0]}`],
        suggestedFix: 'Convert types explicitly before operations (e.g., str(number) or int(string))',
        examples: [
          'result = 5 + "hello"',
          'value = "10" * number',
          'total = count + "items"',
        ],
      },
      {
        id: 'invalid_method_on_primitive',
        name: 'Invalid Method Call on Primitive',
        description: 'Calling list/dict methods on numbers or strings',
        category: 'mapping',
        subtype: 'data_compliance',
        severity: 'high',
        regex: /(\d+|'[^']*'|"[^"]*")\.(append|extend|remove|pop|keys|values|items)\s*\(/g,
        confidence: 0.90,
        evidenceExtractor: (match) => [`Invalid method call: ${match[0]}`],
        suggestedFix: 'Ensure the variable is the correct type before calling methods',
        examples: [
          '5.append(item)',
          '"hello".keys()',
          '3.14.remove(x)',
        ],
      },
      {
        id: 'index_out_of_bounds_hardcoded',
        name: 'Potential Index Out of Bounds',
        description: 'Hardcoded large indices that may exceed array bounds',
        category: 'mapping',
        subtype: 'structure_access',
        severity: 'medium',
        regex: /(\w+)\[(\d{2,})\]/g,
        confidence: 0.70,
        evidenceExtractor: (match) => [`Potential index out of bounds: ${match[0]} (index ${match[2]})`],
        suggestedFix: 'Check array length before accessing or use try-catch for index errors',
        examples: [
          'arr[100]',
          'data[999]',
          'items[50]',
        ],
      },
      {
        id: 'unchecked_dict_access',
        name: 'Unchecked Dictionary Key Access',
        description: 'Accessing dictionary keys without checking existence',
        category: 'mapping',
        subtype: 'structure_access',
        severity: 'medium',
        regex: /(\w+)\[['"](\w+)['"]\]/g,
        confidence: 0.75,
        evidenceExtractor: (match, code) => {
          const varName = match[1];
          const keyName = match[2];
          const hasCheck = code.includes(`'${keyName}' in ${varName}`) || 
                          code.includes(`"${keyName}" in ${varName}`) ||
                          code.includes(`${varName}.get('${keyName}'`) ||
                          code.includes(`${varName}.get("${keyName}"`);
          return hasCheck ? [] : [`Unchecked dictionary access: ${match[0]}`];
        },
        suggestedFix: 'Use dict.get(key, default) or check key existence with "key in dict"',
        examples: [
          'data["name"]',
          'config["port"]',
          'user["email"]',
        ],
      },
    ];
  }

  /**
   * Get naming hallucination patterns
   */
  private getNamingPatterns(): HallucinationPattern[] {
    return [
      {
        id: 'undefined_variable_usage',
        name: 'Undefined Variable Usage',
        description: 'Using variables that have not been defined',
        category: 'naming',
        subtype: 'identity',
        severity: 'high',
        regex: /\b([a-zA-Z_][a-zA-Z0-9_]*)\b/g,
        confidence: 0.80,
        evidenceExtractor: (match, code) => {
          const varName = match[1];
          
          // Skip Python keywords and builtins
          const keywords = [
            'and', 'as', 'assert', 'break', 'class', 'continue', 'def', 'del', 'elif', 'else',
            'except', 'exec', 'finally', 'for', 'from', 'global', 'if', 'import', 'in', 'is',
            'lambda', 'not', 'or', 'pass', 'print', 'raise', 'return', 'try', 'while', 'with',
            'yield', 'True', 'False', 'None', 'len', 'range', 'str', 'int', 'float', 'list',
            'dict', 'set', 'tuple', 'type', 'isinstance', 'hasattr', 'getattr', 'setattr'
          ];
          
          if (keywords.includes(varName)) return [];
          
          // Check if variable is defined before this usage
          const lines = code.split('\n');
          const currentLineIndex = code.substring(0, match.index).split('\n').length - 1;
          
          for (let i = 0; i < currentLineIndex; i++) {
            if (lines[i].includes(`${varName} =`) || lines[i].includes(`def ${varName}(`)) {
              return [];
            }
          }
          
          return [`Variable '${varName}' used before definition`];
        },
        suggestedFix: 'Define the variable before using it',
        examples: [
          'print(undefined_var)',
          'result = unknown_function()',
          'value = missing_variable + 1',
        ],
      },
      {
        id: 'nonexistent_module_import',
        name: 'Non-existent Module Import',
        description: 'Importing modules that likely do not exist',
        category: 'naming',
        subtype: 'external_source',
        severity: 'high',
        regex: /^(?:from\s+(\w+(?:\.\w+)*)\s+)?import\s+(\w+(?:\s*,\s*\w+)*)/gm,
        confidence: 0.85,
        evidenceExtractor: (match) => {
          const moduleName = match[1] || match[2].split(',')[0].trim();
          
          // Common Python modules that should exist
          const commonModules = [
            'os', 'sys', 'json', 'math', 'random', 'datetime', 'time', 'collections',
            'itertools', 'functools', 're', 'urllib', 'http', 'pathlib', 'typing',
            'asyncio', 'threading', 'multiprocessing', 'subprocess', 'shutil',
            'pickle', 'csv', 'xml', 'html', 'email', 'base64', 'hashlib', 'hmac',
            'sqlite3', 'logging', 'unittest', 'argparse', 'configparser'
          ];
          
          // Check for suspicious characteristics
          const isSuspicious = !commonModules.includes(moduleName) && (
            moduleName.length > 15 || // Very long names
            /[A-Z]{3,}/.test(moduleName) || // Multiple consecutive capitals
            /\d{3,}/.test(moduleName) || // Multiple consecutive numbers
            /[^a-zA-Z0-9_]/.test(moduleName) // Invalid characters
          );
          
          return isSuspicious ? [`Potentially non-existent module: ${moduleName}`] : [];
        },
        suggestedFix: 'Verify the module exists and is properly installed',
        examples: [
          'import nonexistentmoduleverylongname',
          'from INVALIDMODULE import something',
          'import module123456',
        ],
      },
      {
        id: 'attribute_on_none',
        name: 'Attribute Access on None',
        description: 'Accessing attributes on variables that might be None',
        category: 'naming',
        subtype: 'identity',
        severity: 'medium',
        regex: /(\w+)\.(\w+)/g,
        confidence: 0.60,
        evidenceExtractor: (match, code) => {
          const varName = match[1];
          const attrName = match[2];
          
          // Check if variable is explicitly set to None
          if (code.includes(`${varName} = None`)) {
            return [`Attribute access on potentially None variable: ${match[0]}`];
          }
          
          return [];
        },
        suggestedFix: 'Check if variable is not None before accessing attributes',
        examples: [
          'result.value  # where result = None',
          'data.items()  # where data might be None',
        ],
      },
    ];
  }

  /**
   * Get resource hallucination patterns
   */
  private getResourcePatterns(): HallucinationPattern[] {
    return [
      {
        id: 'infinite_loop_while_true',
        name: 'Infinite Loop - While True',
        description: 'While True loops without break conditions',
        category: 'resource',
        subtype: 'computational_boundary',
        severity: 'critical',
        regex: /while\s+True\s*:/g,
        confidence: 0.95,
        evidenceExtractor: (match, code) => {
          const matchIndex = match.index!;
          const afterMatch = code.substring(matchIndex);
          const loopEnd = this.findBlockEnd(afterMatch);
          const loopBody = afterMatch.substring(0, loopEnd);
          
          const hasBreak = loopBody.includes('break') || loopBody.includes('return');
          return hasBreak ? [] : ['Potential infinite loop: while True without break'];
        },
        suggestedFix: 'Add a break condition or use a finite loop',
        examples: [
          'while True:\n    print("forever")',
          'while True:\n    process_data()',
        ],
      },
      {
        id: 'recursive_without_base_case',
        name: 'Recursion Without Base Case',
        description: 'Recursive functions that may lack proper base cases',
        category: 'resource',
        subtype: 'physical_constraint',
        severity: 'critical',
        regex: /def\s+(\w+)\s*\([^)]*\):/g,
        confidence: 0.85,
        evidenceExtractor: (match, code) => {
          const funcName = match[1];
          const funcStart = match.index!;
          const funcEnd = this.findFunctionEnd(code, funcStart);
          const funcBody = code.substring(funcStart, funcEnd);
          
          // Check if function calls itself
          const hasRecursion = funcBody.includes(`${funcName}(`);
          if (!hasRecursion) return [];
          
          // Check for base case indicators
          const hasBaseCase = funcBody.includes('return') && 
                             (funcBody.includes('if') || funcBody.includes('elif'));
          
          return hasBaseCase ? [] : [`Recursive function '${funcName}' may lack proper base case`];
        },
        suggestedFix: 'Add a base case condition to prevent infinite recursion',
        examples: [
          'def factorial(n):\n    return n * factorial(n-1)',
          'def fibonacci(n):\n    return fibonacci(n-1) + fibonacci(n-2)',
        ],
      },
      {
        id: 'large_range_operation',
        name: 'Large Range Operation',
        description: 'Range operations with very large numbers',
        category: 'resource',
        subtype: 'computational_boundary',
        severity: 'high',
        regex: /range\s*\(\s*(\d+)\s*\)/g,
        confidence: 0.80,
        evidenceExtractor: (match) => {
          const rangeSize = parseInt(match[1]);
          return rangeSize > 1000000 ? [`Large range operation: range(${rangeSize})`] : [];
        },
        suggestedFix: 'Consider using generators or processing data in chunks',
        examples: [
          'for i in range(10000000):',
          'list(range(5000000))',
        ],
      },
      {
        id: 'memory_intensive_operation',
        name: 'Memory Intensive Operation',
        description: 'Operations that may consume excessive memory',
        category: 'resource',
        subtype: 'physical_constraint',
        severity: 'medium',
        regex: /\[[^\]]{200,}\]|\{[^}]{200,}\}/g,
        confidence: 0.70,
        evidenceExtractor: (match) => [`Large data structure detected: ${match[0].substring(0, 50)}...`],
        suggestedFix: 'Consider using generators or loading data incrementally',
        examples: [
          '[1, 2, 3, ...] # very long list',
          '{"key1": "value1", ...} # very large dict',
        ],
      },
    ];
  }

  /**
   * Get logic hallucination patterns
   */
  private getLogicPatterns(): HallucinationPattern[] {
    return [
      {
        id: 'contradictory_condition',
        name: 'Contradictory Condition',
        description: 'Logical conditions that are always false or contradictory',
        category: 'logic',
        subtype: 'logic_deviation',
        severity: 'high',
        regex: /if\s+([^:]+):/g,
        confidence: 0.90,
        evidenceExtractor: (match) => {
          const condition = match[1].trim();
          
          // Check for always false conditions
          if (condition.includes('False') || condition === '0 == 1' || condition === '1 == 0') {
            return [`Always false condition: ${condition}`];
          }
          
          // Check for contradictory comparisons
          const contradictoryPattern = /(\w+)\s*==\s*(\w+)\s+and\s+\1\s*!=\s*\2/;
          if (contradictoryPattern.test(condition)) {
            return [`Contradictory condition: ${condition}`];
          }
          
          return [];
        },
        suggestedFix: 'Review the logical condition for correctness',
        examples: [
          'if False:',
          'if x == y and x != y:',
          'if 0 == 1:',
        ],
      },
      {
        id: 'repeated_lines',
        name: 'Repeated Code Lines',
        description: 'Identical lines repeated consecutively (stuttering)',
        category: 'logic',
        subtype: 'logic_breakdown',
        severity: 'medium',
        regex: /^(.{10,})$/gm,
        confidence: 0.80,
        evidenceExtractor: (match, code) => {
          const line = match[1].trim();
          const lines = code.split('\n').map(l => l.trim());
          const lineIndex = lines.indexOf(line);
          
          if (lineIndex >= 0 && lineIndex < lines.length - 1) {
            const nextLine = lines[lineIndex + 1];
            if (line === nextLine && line.length > 10) {
              return [`Repeated line detected: ${line}`];
            }
          }
          
          return [];
        },
        suggestedFix: 'Remove duplicate lines or use loops if repetition is intentional',
        examples: [
          'print("Hello")\nprint("Hello")',
          'x = 5\nx = 5',
        ],
      },
      {
        id: 'incomplete_function',
        name: 'Incomplete Function Definition',
        description: 'Function definitions without body or implementation',
        category: 'logic',
        subtype: 'logic_breakdown',
        severity: 'high',
        regex: /def\s+\w+\s*\([^)]*\):\s*$/gm,
        confidence: 0.95,
        evidenceExtractor: (match) => [`Incomplete function definition: ${match[0].trim()}`],
        suggestedFix: 'Complete the function implementation or add pass statement',
        examples: [
          'def my_function():',
          'def process_data(x, y):',
        ],
      },
      {
        id: 'unreachable_code',
        name: 'Unreachable Code',
        description: 'Code that appears after return statements',
        category: 'logic',
        subtype: 'logic_deviation',
        severity: 'medium',
        regex: /return\s+[^;\n]*\n\s*([^#\n\s][^\n]*)/g,
        confidence: 0.75,
        evidenceExtractor: (match) => [`Unreachable code after return: ${match[1].trim()}`],
        suggestedFix: 'Remove unreachable code or restructure the logic',
        examples: [
          'return result\nprint("This will never execute")',
          'return True\nx = 5',
        ],
      },
    ];
  }

  /**
   * Analyze code structure for context
   */
  private analyzeCodeStructure(code: string): CodeStructure {
    const functions: string[] = [];
    const classes: string[] = [];
    const variables: string[] = [];
    const imports: string[] = [];
    
    let loops = 0;
    let conditionals = 0;
    let tryBlocks = 0;
    
    const lines = code.split('\n');
    let nestingDepth = 0;
    let maxNesting = 0;
    
    for (const line of lines) {
      const trimmed = line.trim();
      
      // Count indentation for nesting depth
      const indent = line.length - line.trimStart().length;
      const currentDepth = Math.floor(indent / 4); // Assuming 4-space indentation
      nestingDepth = currentDepth;
      maxNesting = Math.max(maxNesting, nestingDepth);
      
      // Extract functions
      const funcMatch = trimmed.match(/^def\s+(\w+)/);
      if (funcMatch) functions.push(funcMatch[1]);
      
      // Extract classes
      const classMatch = trimmed.match(/^class\s+(\w+)/);
      if (classMatch) classes.push(classMatch[1]);
      
      // Extract variables (simple assignment)
      const varMatch = trimmed.match(/^(\w+)\s*=/);
      if (varMatch) variables.push(varMatch[1]);
      
      // Extract imports
      const importMatch = trimmed.match(/^(?:from\s+\w+\s+)?import\s+(\w+)/);
      if (importMatch) imports.push(importMatch[1]);
      
      // Count control structures
      if (/^(for|while)\s/.test(trimmed)) loops++;
      if (/^(if|elif)\s/.test(trimmed)) conditionals++;
      if (/^try\s*:/.test(trimmed)) tryBlocks++;
    }
    
    // Calculate cyclomatic complexity (simplified)
    const cyclomaticComplexity = 1 + conditionals + loops + tryBlocks;
    
    return {
      functions,
      classes,
      variables,
      imports,
      controlFlow: {
        loops,
        conditionals,
        tryBlocks,
      },
      complexity: {
        cyclomaticComplexity,
        linesOfCode: lines.length,
        nestingDepth: maxNesting,
      },
    };
  }

  /**
   * Create hallucination category from pattern match
   */
  private createCategoryFromMatch(
    match: PatternMatch,
    pattern: HallucinationPattern
  ): HallucinationCategory {
    return {
      type: pattern.category,
      subtype: pattern.subtype,
      severity: pattern.severity,
      confidence: match.confidence,
      evidence: [match.evidence],
      detectionMethod: 'pattern',
      businessImpact: DEFAULT_BUSINESS_IMPACT[pattern.category],
      lineNumbers: [match.location.startLine],
      errorMessage: undefined,
      suggestedFix: pattern.suggestedFix,
    };
  }

  /**
   * Calculate overall confidence from matches
   */
  private calculateOverallConfidence(matches: PatternMatch[]): number {
    if (matches.length === 0) return 1.0;
    
    const totalConfidence = matches.reduce((sum, match) => sum + match.confidence, 0);
    return totalConfidence / matches.length;
  }

  /**
   * Find the end of a code block
   */
  private findBlockEnd(code: string): number {
    const lines = code.split('\n');
    let indentLevel = -1;
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();
      
      if (trimmed === '') continue; // Skip empty lines
      
      const currentIndent = line.length - line.trimStart().length;
      
      if (indentLevel === -1) {
        indentLevel = currentIndent;
      } else if (currentIndent <= indentLevel && trimmed !== '') {
        return lines.slice(0, i).join('\n').length;
      }
    }
    
    return code.length;
  }

  /**
   * Find the end of a function definition
   */
  private findFunctionEnd(code: string, start: number): number {
    const afterStart = code.substring(start);
    const nextFuncMatch = afterStart.search(/\ndef\s+\w+/);
    const nextClassMatch = afterStart.search(/\nclass\s+\w+/);
    
    let end = code.length;
    if (nextFuncMatch !== -1) end = Math.min(end, start + nextFuncMatch);
    if (nextClassMatch !== -1) end = Math.min(end, start + nextClassMatch);
    
    return end;
  }

  /**
   * Get all available patterns
   */
  getPatterns(): HallucinationPattern[] {
    return [...this.patterns];
  }

  /**
   * Get patterns by category
   */
  getPatternsByCategory(category: HallucinationType): HallucinationPattern[] {
    return this.patterns.filter(p => p.category === category);
  }

  /**
   * Get pattern by ID
   */
  getPattern(id: string): HallucinationPattern | undefined {
    return this.patterns.find(p => p.id === id);
  }
}