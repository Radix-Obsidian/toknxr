import { pluginManager } from './plugin-system.js';

export interface CodeQualityMetrics {
  syntaxValid: boolean;
  linesOfCode: number;
  complexity: number;
  hasFunctions: boolean;
  hasClasses: boolean;
  hasTests: boolean;
  estimatedReadability: number; // 1-10 scale
  potentialIssues: string[];
  language?: string;
  framework?: string;

  // Plugin-extensible fields
  pluginMetrics?: Record<string, unknown>;
  securityScore?: number;
  performanceScore?: number;
  maintainabilityScore?: number;
}

export interface EffectivenessScore {
  promptClarityMatch: number; // How well AI understood the request
  codeCompleteness: number; // How complete the solution is
  codeCorrectness: number; // Basic syntax and structure correctness
  codeEfficiency: number; // Potential performance indicators
  overallEffectiveness: number; // Combined score 0-100

  // Plugin-extensible fields
  hallucinationRisk?: number;
  promptAlignment?: number;
  contextUnderstanding?: number;
}

/**
 * Analyzes code quality and provides metrics
 */
export function analyzeCodeQuality(code: string, language?: string): CodeQualityMetrics {
  const metrics: CodeQualityMetrics = {
    syntaxValid: true,
    linesOfCode: 0,
    complexity: 0,
    hasFunctions: false,
    hasClasses: false,
    hasTests: false,
    estimatedReadability: 5,
    potentialIssues: [],
    language: detectLanguage(code) || language
  };

  if (!code || code.trim().length === 0) {
    return metrics;
  }

  const lines = code.split('\n').filter(l => l.trim());
  metrics.linesOfCode = lines.length;

  // Detect language if not provided
  const detectedLang = metrics.language || 'unknown';

  // Basic complexity analysis
  metrics.complexity = calculateComplexity(lines, detectedLang);

  // Check for structural elements based on language
  switch (detectedLang) {
    case 'javascript':
    case 'typescript':
      metrics.hasFunctions = /function\s+\w+|const\s+\w+\s*=.*=>|class\s+\w+/.test(code);
      metrics.hasClasses = /class\s+\w+/.test(code);
      metrics.hasTests = /describe|test|it\(/.test(code);

      // Syntax validation (basic)
      metrics.syntaxValid = validateJSTypescript(code, detectedLang);

      // Readability scoring
      metrics.estimatedReadability = calculateJSReadability(code);
      break;

    case 'python':
      metrics.hasFunctions = /def\s+\w+/.test(code);
      metrics.hasClasses = /class\s+\w+/.test(code);
      metrics.hasTests = /def test_|unittest|pytest/.test(code);

      metrics.syntaxValid = validatePython(code);

      metrics.estimatedReadability = calculatePythonReadability(code);
      break;

    case 'go':
      metrics.hasFunctions = /func\s+\w+\(/.test(code);
      metrics.hasClasses = /type\s+\w+\s+struct/.test(code);
      metrics.hasTests = /func\s+Test\w+/.test(code);

      metrics.syntaxValid = validateGo(code);

      metrics.estimatedReadability = calculateGoReadability(code);
      break;

    case 'rust':
      metrics.hasFunctions = /fn\s+\w+\(/.test(code);
      metrics.hasClasses = /(struct|enum)\s+\w+/.test(code);
      metrics.hasTests = /#\[test\]/.test(code);

      metrics.syntaxValid = validateRust(code);

      metrics.estimatedReadability = calculateRustReadability(code);
      break;

    case 'java':
      metrics.hasFunctions = /public\s+(\w+)\s+\w+\(/.test(code);
      metrics.hasClasses = /public\s+class\s+\w+/.test(code);
      metrics.hasTests = /@Test/.test(code);

      metrics.syntaxValid = validateJava(code);

      metrics.estimatedReadability = calculateJavaReadability(code);
      break;

    case 'cpp':
      metrics.hasFunctions = /(\w+)\s+\w+\(/.test(code) && !/class\s+/.test(code);
      metrics.hasClasses = /class\s+\w+/.test(code);
      metrics.hasTests = /(TEST|TEST_F)/.test(code);

      metrics.syntaxValid = validateCpp(code);

      metrics.estimatedReadability = calculateCppReadability(code);
      break;

    default:
      metrics.potentialIssues.push('Language not recognized for detailed analysis');
  }

  // Common issues
  if (lines.length > 100) {
    metrics.potentialIssues.push('Very long file - consider splitting');
  }

  if (!metrics.syntaxValid) {
    metrics.potentialIssues.push('Potential syntax errors detected');
  }

  // Apply plugin enhancements
  try {
    const enhancedMetrics = pluginManager.analyzeWithPlugins(code, metrics);
    return enhancedMetrics;
  } catch (error) {
    console.warn('Plugin analysis failed, returning base metrics:', error);
    return metrics;
  }
}

/**
 * Calculate an effectiveness score comparing prompt to code output
 */
export function scoreEffectiveness(userPrompt: string, aiResponse: string, extractedCode?: string): EffectivenessScore {
  const code = extractedCode || aiResponse;

  const score: EffectivenessScore = {
    promptClarityMatch: 0,
    codeCompleteness: 0,
    codeCorrectness: 0,
    codeEfficiency: 0,
    overallEffectiveness: 0
  };

  if (!userPrompt || !code) return score;

  const prompt = userPrompt.toLowerCase();
  const response = aiResponse.toLowerCase();

  // Analyze how well the AI understood the request
  score.promptClarityMatch = analyzePromptMatch(prompt, response, code);

  // Analyze code quality and completeness
  const metrics = analyzeCodeQuality(code);
  score.codeCorrectness = calculateCorrectnessScore(metrics);
  score.codeCompleteness = analyzeCompleteness(prompt, code);
  score.codeEfficiency = estimateEfficiencyScore(code, metrics);

  // Calculate overall effectiveness (weighted average)
  score.overallEffectiveness = Math.round(
    (score.promptClarityMatch * 0.3) +
    (score.codeCompleteness * 0.25) +
    (score.codeCorrectness * 0.25) +
    (score.codeEfficiency * 0.2)
  );

  // Apply plugin enhancements for effectiveness scoring
  try {
    const enhancedScore = pluginManager.scoreEffectivenessWithPlugins(userPrompt, aiResponse, score, extractedCode);
    return enhancedScore;
  } catch (error) {
    console.warn('Plugin effectiveness scoring failed, returning base score:', error);
    return score;
  }
}

/**
 * Extract code blocks from AI responses
 */
export function extractCodeFromResponse(response: string): { code: string; language?: string } | null {
  // Common code block patterns
  const codeBlockRegex = /```(\w+)?\n?([\s\S]*?)```/g;
  const match = codeBlockRegex.exec(response);

  if (match) {
    return {
      code: match[2].trim(),
      language: match[1]?.toLowerCase()
    };
  }

  // Look for inline code that might be a complete solution
  const inlineCodeRegex = /`([^`\n]+)`/g;
  const inlineMatches = Array.from(response.matchAll(inlineCodeRegex));

  if (inlineMatches.length > 0) {
    // If multiple inline codes, combine them
    const combined = inlineMatches.map(m => m[1]).join('\n\n');
    if (combined.length > 50) { // Arbitrary threshold for "substantial" code
      return { code: combined };
    }
  }

  return null;
}

/**
 * Detect programming language from code content
 */
function detectLanguage(code: string): string | undefined {
  if (/(?:import|export|function|const|let|var)\s+/.test(code)) {
    return code.includes('interface') || code.includes(': string') || code.includes('<') ? 'typescript' : 'javascript';
  }

  if (/def\s+|import\s+|class\s+/.test(code) && /:/.test(code)) {
    return 'python';
  }

  // Go detection
  if (/package\s+\w+|import\s+\(|func\s+\w+\(/.test(code) && /\.\w+\(/.test(code)) {
    return 'go';
  }

  // Rust detection
  if (/fn\s+\w+|let\s+mut|println!|use\s+std::/.test(code) && /::/.test(code)) {
    return 'rust';
  }

  // Java detection
  if (/public\s+class|import\s+java\.|public\s+static\s+void\s+main/.test(code) && /System\.out\.println/.test(code)) {
    return 'java';
  }

  // C++ detection
  if (/#include\s+<|std::|cout\s+<<|int\s+main\(/.test(code) && /namespace\s+std/.test(code)) {
    return 'cpp';
  }

  return undefined;
}

/**
 * Calculate code complexity score
 */
function calculateComplexity(lines: string[], language: string): number {
  let complexity = 1; // Base complexity

  for (const line of lines) {
    // Control flow increases complexity
    if (/(if|for|while|switch|try|catch)/.test(line)) {
      complexity += 0.5;
    }

    // Nested blocks
    const indentLevel = line.length - line.trimStart().length;
    complexity += indentLevel * 0.1;

    // Function/class definitions
    if (/(function|def|class)/.test(line)) {
      complexity += 1;
    }
  }

  return Math.min(complexity, 10); // Cap at 10
}

/**
 * Basic JavaScript/TypeScript validation
 */
function validateJSTypescript(code: string, lang: string): boolean {
  try {
    // Basic bracket matching
    const brackets = { '(': 0, '[': 0, '{': 0 };
    for (const char of code) {
      if (char === '(') brackets['(']++;
      if (char === ')') brackets['(']--;
      if (char === '[') brackets['[']++;
      if (char === ']') brackets['[']--;
      if (char === '{') brackets['{']++;
      if (char === '}') brackets['{']--;

      if (brackets['('] < 0 || brackets['['] < 0 || brackets['{'] < 0) {
        return false;
      }
    }
    return brackets['('] === 0 && brackets['['] === 0 && brackets['{'] === 0;
  } catch {
    return false;
  }
}

/**
 * Basic Python validation
 */
function validatePython(code: string): boolean {
  // Basic indentation check
  const lines = code.split('\n');
  let indentLevel = 0;
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const currentIndent = line.length - line.trimStart().length;
    if (currentIndent > indentLevel + 4) return false; // Too much indentation
    indentLevel = currentIndent;
  }
  return true;
}

/**
 * Calculate readability for JS/TS
 */
function calculateJSReadability(code: string): number {
  let score = 5; // Base score

  // Length factors
  if (code.length > 2000) score -= 2;
  if (code.split('\n').length > 50) score -= 1;

  // Good practices
  if (code.includes('//') || code.includes('/*')) score += 1; // Has comments
  if (/\w+_\w+/.test(code)) score -= 1; // Poor naming (underscores in JS)
  if (/[a-z][A-Z]/.test(code.replace(/const|let|var/g, ''))) score += 1; // camelCase

  return Math.max(1, Math.min(10, score));
}

/**
 * Calculate readability for Python
 */
function calculatePythonReadability(code: string): number {
  let score = 7; // Python typically more readable

  // Length factors
  if (code.length > 1500) score -= 1.5;
  if (code.split('\n').length > 40) score -= 1;

  // Good practices
  if (code.includes('#')) score += 0.5; // Has comments
  if (/"""[\s\S]*?"""/.test(code)) score += 1; // Has docstrings
  if (/_/.test(code.replace(/__\w+__/g, ''))) score -= 0.5; // Uses underscores (good)

  return Math.max(1, Math.min(10, score));
}

/**
 * Analyze how well AI response matches the user's prompt
 */
function analyzePromptMatch(prompt: string, response: string, code: string): number {
  let match = 0;

  // Keywords from prompt appearing in code
  const promptWords = prompt.split(/\s+/).filter(w => w.length > 3);
  const codeContent = code.toLowerCase();
  const matchingWords = promptWords.filter(word =>
    codeContent.includes(word.toLowerCase())
  );
  match += (matchingWords.length / Math.max(promptWords.length, 1)) * 40;

  // Check if response acknowledges the request
  if (response.includes('here') || response.includes('below') || response.includes('code')) {
    match += 20;
  }

  // Has explanation or context
  if (response.length > code.length * 2) {
    match += 15;
  }

  return Math.min(100, match);
}

/**
 * Calculate correctness score from metrics
 */
function calculateCorrectnessScore(metrics: CodeQualityMetrics): number {
  let score = 50; // Base score

  if (metrics.syntaxValid) score += 25;
  else score -= 20;

  if (metrics.estimatedReadability > 6) score += 15;
  else if (metrics.estimatedReadability < 4) score -= 10;

  if (metrics.potentialIssues.length === 0) score += 10;

  return Math.max(0, Math.min(100, score));
}

/**
 * Analyze code completeness
 */
function analyzeCompleteness(prompt: string, code: string): number {
  let completeness = 50; // Base

  // Look for completion indicators
  if (/(function|def|class)\s+\w+/.test(code)) completeness += 20;

  if (/(return|yield|export)/.test(code)) completeness += 15;

  // Check if code has implementation (not just skeleton)
  const lines = code.split('\n').length;
  if (lines > 10) completeness += 10;

  if (/(todo|fixme|implement)/i.test(code)) completeness -= 15;

  return Math.max(0, Math.min(100, completeness));
}

/**
 * Estimate efficiency score
 */
function estimateEfficiencyScore(code: string, metrics: CodeQualityMetrics): number {
  let score = 60; // Base

  // Complexity affects efficiency
  if (metrics.complexity < 3) score += 20;
  else if (metrics.complexity > 7) score -= 20;

  // Length considerations
  if (metrics.linesOfCode > 100) score -= 10;

  // Look for inefficient patterns
  if (/while.*true|for.*;.*;.*\+\+/.test(code)) {
    if (!/(break|return)/.test(code)) score -= 15; // Potential infinite loops
  }

  return Math.max(0, Math.min(100, score));
}

/**
 * Basic Go validation
 */
function validateGo(code: string): boolean {
  try {
    // Basic bracket matching for Go
    const brackets = { '(': 0, '{': 0 };
    let inString = false;
    let inComment = false;

    for (let i = 0; i < code.length; i++) {
      const char = code[i];
      const nextChar = code[i + 1] || '';

      // Handle strings
      if (char === '"' && (i === 0 || code[i - 1] !== '\\')) {
        inString = !inString;
        continue;
      }
      if (inString) continue;

      // Handle comments
      if (char === '/' && nextChar === '/') {
        inComment = true;
        continue;
      }
      if (char === '\n') {
        inComment = false;
        continue;
      }
      if (inComment) continue;

      if (char === '(') brackets['(']++;
      if (char === ')') brackets['(']--;
      if (char === '{') brackets['{']++;
      if (char === '}') brackets['{']--;

      if (brackets['('] < 0 || brackets['{'] < 0) {
        return false;
      }
    }
    return brackets['('] === 0 && brackets['{'] === 0;
  } catch {
    return false;
  }
}

/**
 * Basic Rust validation
 */
function validateRust(code: string): boolean {
  try {
    // Basic bracket matching for Rust
    const brackets = { '(': 0, '[': 0, '{': 0 };
    let inString = false;
    let inChar = false;

    for (let i = 0; i < code.length; i++) {
      const char = code[i];

      // Handle strings and characters
      if (char === '"' && (i === 0 || code[i - 1] !== '\\')) {
        inString = !inString;
        continue;
      }
      if (char === "'" && code[i + 1] && code[i + 1] !== "\\") {
        inChar = !inChar;
        continue;
      }
      if (inString || inChar) continue;

      if (char === '(') brackets['(']++;
      if (char === ')') brackets['(']--;
      if (char === '[') brackets['[']++;
      if (char === ']') brackets['[']--;
      if (char === '{') brackets['{']++;
      if (char === '}') brackets['{']--;

      if (brackets['('] < 0 || brackets['['] < 0 || brackets['{'] < 0) {
        return false;
      }
    }
    return brackets['('] === 0 && brackets['['] === 0 && brackets['{'] === 0;
  } catch {
    return false;
  }
}

/**
 * Basic Java validation
 */
function validateJava(code: string): boolean {
  try {
    // Basic bracket matching for Java
    const brackets = { '(': 0, '[': 0, '{': 0 };
    let inString = false;

    for (let i = 0; i < code.length; i++) {
      const char = code[i];

      // Handle strings
      if (char === '"' && (i === 0 || code[i - 1] !== '\\')) {
        inString = !inString;
        continue;
      }
      if (inString) continue;

      if (char === '(') brackets['(']++;
      if (char === ')') brackets['(']--;
      if (char === '[') brackets['[']++;
      if (char === ']') brackets['[']--;
      if (char === '{') brackets['{']++;
      if (char === '}') brackets['{']--;

      if (brackets['('] < 0 || brackets['['] < 0 || brackets['{'] < 0) {
        return false;
      }
    }
    return brackets['('] === 0 && brackets['['] === 0 && brackets['{'] === 0;
  } catch {
    return false;
  }
}

/**
 * Basic C++ validation
 */
function validateCpp(code: string): boolean {
  try {
    // Basic bracket matching for C++
    const brackets = { '(': 0, '[': 0, '{': 0 };
    let inString = false;
    let inComment = false;

    for (let i = 0; i < code.length; i++) {
      const char = code[i];
      const nextChar = code[i + 1] || '';

      // Handle strings
      if (char === '"' && (i === 0 || code[i - 1] !== '\\')) {
        inString = !inString;
        continue;
      }
      if (inString) continue;

      // Handle comments
      if (char === '/' && (nextChar === '/' || nextChar === '*')) {
        inComment = true;
        if (nextChar === '*') {
          // Multi-line comment
          const endComment = code.indexOf('*/', i + 2);
          if (endComment !== -1) {
            i = endComment + 1;
          }
          continue;
        }
      }
      if (inComment && char === '\n') {
        inComment = false;
      }
      if (inComment) continue;

      if (char === '(') brackets['(']++;
      if (char === ')') brackets['(']--;
      if (char === '[') brackets['[']++;
      if (char === ']') brackets['[']--;
      if (char === '{') brackets['{']++;
      if (char === '}') brackets['{']--;

      if (brackets['('] < 0 || brackets['['] < 0 || brackets['{'] < 0) {
        return false;
      }
    }
    return brackets['('] === 0 && brackets['['] === 0 && brackets['{'] === 0;
  } catch {
    return false;
  }
}

/**
 * Calculate readability for Go
 */
function calculateGoReadability(code: string): number {
  let score = 6; // Go is generally readable

  // Length factors
  if (code.length > 2000) score -= 2;
  if (code.split('\n').length > 50) score -= 1;

  // Good practices
  if (code.includes('//')) score += 1; // Has comments
  if (/^\s*\w+\./.test(code)) score += 0.5; // Uses qualified names
  if (/err\s*!=\s*nil/.test(code)) score += 0.5; // Error handling

  // Poor practices
  if (/\w+\s*:=\s*[^;]*;/.test(code)) score -= 1; // Short variable declarations with semicolon

  return Math.max(1, Math.min(10, score));
}

/**
 * Calculate readability for Rust
 */
function calculateRustReadability(code: string): number {
  let score = 5; // Rust can be complex but expressive

  // Length factors
  if (code.length > 2500) score -= 2;
  if (code.split('\n').length > 60) score -= 1;

  // Good practices
  if (code.includes('//')) score += 1; // Has comments
  if (/let\s+/.test(code)) score += 0.5; // Explicit variable declarations
  if (/->/.test(code)) score += 0.5; // Return type annotations
  if (/\?/m.test(code)) score += 0.5; // Error propagation

  // Code organization
  if (/impl\s+\w+/.test(code)) score += 0.5; // Has implementations
  if (/trait\s+\w+/.test(code)) score += 0.5; // Has traits

  return Math.max(1, Math.min(10, score));
}

/**
 * Calculate readability for Java
 */
function calculateJavaReadability(code: string): number {
  let score = 4; // Java can be verbose

  // Length factors
  if (code.length > 3000) score -= 2;
  if (code.split('\n').length > 70) score -= 1;

  // Good practices
  if (code.includes('//') || code.includes('/*')) score += 1; // Has comments
  if (/public\s+class\s+\w+/.test(code)) score += 0.5; // Proper class declaration
  if (/throws\s+\w+/.test(code)) score += 0.5; // Exception declarations

  // Code organization
  if (/@Override/.test(code)) score += 0.5; // Uses annotations properly
  if (/import\s+java\./.test(code)) score += 0.5; // Proper imports

  return Math.max(1, Math.min(10, score));
}

/**
 * Calculate readability for C++
 */
function calculateCppReadability(code: string): number {
  let score = 3; // C++ can be complex

  // Length factors
  if (code.length > 2500) score -= 2;
  if (code.split('\n').length > 80) score -= 1;

  // Good practices
  if (code.includes('//')) score += 1; // Has comments
  if (/std::/.test(code)) score += 0.5; // Uses standard library
  if (/const\s+/.test(code)) score += 0.5; // Uses const

  // Code organization
  if (/namespace\s+\w+/.test(code)) score += 0.5; // Uses namespaces
  if (/#include\s+<[\w\/]+>/.test(code)) score += 0.5; // Proper includes

  return Math.max(1, Math.min(10, score));
}
