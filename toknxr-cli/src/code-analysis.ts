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
}

export interface EffectivenessScore {
  promptClarityMatch: number; // How well AI understood the request
  codeCompleteness: number; // How complete the solution is
  codeCorrectness: number; // Basic syntax and structure correctness
  codeEfficiency: number; // Potential performance indicators
  overallEffectiveness: number; // Combined score 0-100
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

  return metrics;
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

  return score;
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
  const inlineMatches = [...response.matchAll(inlineCodeRegex)];

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
    return code.includes('interface') || code.includes(': string') ? 'typescript' : 'javascript';
  }

  if (/def\s+|import\s+|class\s+/.test(code) && /:/.test(code)) {
    return 'python';
  }

  // Add more language detection as needed...

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
