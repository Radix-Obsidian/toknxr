/**
 * Plugin System for TokNxr Code Analysis
 * Allows extensible analysis capabilities for custom analyzers
 */

export interface Plugin {
  name: string;
  version: string;
  description?: string;
  supportedLanguages: string[];

  /**
   * Analyze code quality metrics specific to this plugin
   */
  analyzeQuality?(code: string, language: string): Partial<CodeQualityMetrics>;

  /**
   * Perform custom effectiveness scoring
   */
  analyzeEffectiveness?(userPrompt: string, aiResponse: string, extractedCode?: string): Partial<EffectivenessScore>;

  /**
   * Validate language-specific syntax rules
   */
  validateSyntax?(code: string, language: string): boolean;

  /**
   * Calculate language-specific readability metrics
   */
  calculateReadability?(code: string, language: string): number;

  /**
   * Detect hallucination patterns (plugin-specific)
   */
  detectHallucinations?(code: string, language: string): HallucinationDetection[];
}

/**
 * Hallucination detection result from plugins
 */
export interface HallucinationDetection {
  confidence: number; // 0-100
  type: string; // e.g., 'unused_import', 'incorrect_api_usage'
  message: string;
  location?: {
    line: number;
    column?: number;
  };
}

/**
 * Extended code quality metrics that plugins can enhance
 */
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

/**
 * Extended effectiveness score
 */
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
 * Plugin registry and management
 */
export class PluginManager {
  private plugins: Map<string, Plugin> = new Map();

  /**
   * Register a new plugin
   */
  register(plugin: Plugin): void {
    this.plugins.set(plugin.name, plugin);
  }

  /**
   * Unregister a plugin
   */
  unregister(name: string): boolean {
    return this.plugins.delete(name);
  }

  /**
   * Get all registered plugins
   */
  getPlugins(): Plugin[] {
    return Array.from(this.plugins.values());
  }

  /**
   * Get plugins that support a specific language
   */
  getPluginsForLanguage(language: string): Plugin[] {
    return Array.from(this.plugins.values())
      .filter(plugin => plugin.supportedLanguages.includes(language));
  }

  /**
   * Analyze code using all applicable plugins
   */
  analyzeWithPlugins(
    code: string,
    baseMetrics: CodeQualityMetrics,
    plugins?: Plugin[]
  ): CodeQualityMetrics {
    const applicablePlugins = plugins || this.getPluginsForLanguage(baseMetrics.language || 'unknown');

    // Apply plugin analyses
    for (const plugin of applicablePlugins) {
      if (plugin.analyzeQuality && plugin.validateSyntax && plugin.calculateReadability) {
        try {
          const pluginResults = plugin.analyzeQuality(code, baseMetrics.language || 'unknown');

          // Merge plugin results
          if (pluginResults.pluginMetrics) {
            baseMetrics.pluginMetrics = {
              ...baseMetrics.pluginMetrics,
              [plugin.name]: pluginResults.pluginMetrics
            };
          }

          // Override base metrics if plugin provides better validation
          if (pluginResults.syntaxValid !== undefined) {
            const pluginValid = plugin.validateSyntax(code, baseMetrics.language || 'unknown');
            if (!pluginValid && baseMetrics.syntaxValid) {
              // Plugin detected issues that base validation missed
              baseMetrics.syntaxValid = false;
              baseMetrics.potentialIssues.push(`${plugin.name}: syntax validation failed`);
            }
          }

          // Enhance readability if plugin provides better calculation
          if (pluginResults.estimatedReadability !== undefined) {
            const pluginReadability = plugin.calculateReadability(code, baseMetrics.language || 'unknown');
            // Use the better (higher) readability score
            if (pluginReadability > baseMetrics.estimatedReadability) {
              baseMetrics.estimatedReadability = pluginReadability;
            }
          }

          // Add potential issues from plugin
          if (pluginResults.potentialIssues && pluginResults.potentialIssues.length > 0) {
            baseMetrics.potentialIssues.push(
              ...pluginResults.potentialIssues.map(issue => `${plugin.name}: ${issue}`)
            );
          }

        } catch (error) {
          console.warn(`Plugin ${plugin.name} failed during analysis:`, error);
        }
      }
    }

    return baseMetrics;
  }

  /**
   * Score effectiveness using plugins
   */
  scoreEffectivenessWithPlugins(
    userPrompt: string,
    aiResponse: string,
    baseScore: EffectivenessScore,
    extractedCode?: string,
    plugins?: Plugin[]
  ): EffectivenessScore {
    const code = extractedCode || aiResponse;
    const codeMetrics = { language: this.detectLanguageFromCode(code) } as CodeQualityMetrics;
    const applicablePlugins = plugins || this.getPluginsForLanguage(codeMetrics.language || 'unknown');

    // Apply plugin effectiveness analysis
    for (const plugin of applicablePlugins) {
      if (plugin.analyzeEffectiveness) {
        try {
          const pluginResults = plugin.analyzeEffectiveness(userPrompt, aiResponse, extractedCode);

          // Apply hallucination detection
          if (plugin.detectHallucinations) {
            const hallucinations = plugin.detectHallucinations(code, codeMetrics.language || 'unknown');
            if (hallucinations.length > 0) {
              const avgConfidence = hallucinations.reduce((sum, h) => sum + h.confidence, 0) / hallucinations.length;
              baseScore.hallucinationRisk = (baseScore.hallucinationRisk || 0) + (avgConfidence * 0.3);
            }
          }

          // Merge other effectiveness metrics
          Object.assign(baseScore, pluginResults);

        } catch (error) {
          console.warn(`Plugin ${plugin.name} failed during effectiveness scoring:`, error);
        }
      }
    }

    return baseScore;
  }

  /**
   * Detect language from code (helper method)
   */
  private detectLanguageFromCode(code: string): string | undefined {
    if (/(?:import|export|function|const|let|var)\s+/.test(code)) {
      return code.includes('interface') || code.includes(': string') ? 'typescript' : 'javascript';
    }
    if (/package\s+\w+|func\s+\w+\(/.test(code)) return 'go';
    if (/fn\s+\w+|use\s+std::/.test(code)) return 'rust';
    if (/public\s+class|import\s+java\./.test(code)) return 'java';
    if (/#include\s+<|std::|cout\s+<<|int\s+main\(/.test(code)) return 'cpp';
    return undefined;
  }
}

/**
 * Built-in security analyzer plugin
 */
export const SecurityAnalyzerPlugin: Plugin = {
  name: 'security-analyzer',
  version: '1.0.0',
  description: 'Analyzes code for security vulnerabilities',
  supportedLanguages: ['javascript', 'typescript', 'python', 'go', 'rust', 'java', 'cpp'],

  analyzeQuality(code: string, language: string): Partial<CodeQualityMetrics> {
    const issues: string[] = [];
    let securityScore = 100;

    // Common security issues across languages
    if (code.includes('eval(') || code.includes('Function(')) {
      issues.push('Use of eval() or Function() constructor - potential code injection');
      securityScore -= 30;
    }

    if (code.includes('innerHTML') || code.includes('outerHTML')) {
      issues.push('Direct HTML manipulation - potential XSS vulnerability');
      securityScore -= 20;
    }

    if (/(password|secret|key).*=\s*["'][^"']*["']/.test(code)) {
      issues.push('Hardcoded credentials detected');
      securityScore -= 40;
    }

    // Language-specific checks
    switch (language) {
      case 'javascript':
      case 'typescript':
        if (code.includes('document.cookie')) {
          issues.push('Direct cookie manipulation without secure flags');
          securityScore -= 15;
        }
        break;
      case 'python':
        if (code.includes('exec(') || code.includes('eval(')) {
          issues.push('Use of exec() or eval() in Python - code injection risk');
          securityScore -= 30;
        }
        break;
    }

    return {
      potentialIssues: issues,
      securityScore: Math.max(0, securityScore)
    };
  },

  detectHallucinations(code: string, language: string): HallucinationDetection[] {
    const detections: HallucinationDetection[] = [];

    // Check for obviously incorrect API usage patterns
    if (language === 'javascript' && code.includes('fs.readFile') && !code.includes('import fs')) {
      detections.push({
        confidence: 85,
        type: 'missing_import',
        message: 'Using fs.readFile without importing fs module'
      });
    }

    if (language === 'python' && code.includes('import requests') && code.includes('requests.get') && !code.includes('response.raise_for_status()')) {
      detections.push({
        confidence: 60,
        type: 'missing_error_handling',
        message: 'HTTP request without proper error handling'
      });
    }

    return detections;
  }
};

/**
 * Performance analyzer plugin
 */
export const PerformanceAnalyzerPlugin: Plugin = {
  name: 'performance-analyzer',
  version: '1.0.0',
  description: 'Analyzes code for performance bottlenecks',
  supportedLanguages: ['javascript', 'typescript', 'python', 'go', 'rust', 'java', 'cpp'],

  analyzeQuality(code: string, language: string): Partial<CodeQualityMetrics> {
    const issues: string[] = [];
    let performanceScore = 100;

    // Detect performance anti-patterns
    if (/(for.*for|while.*while)/.test(code)) {
      issues.push('Nested loops detected - potential O(n²) complexity');
      performanceScore -= 15;
    }

    // Memory leaks in JavaScript
    if (/(setInterval|setTimeout)/.test(code) && !code.includes('clearInterval') && !code.includes('clearTimeout')) {
      issues.push('Timer without cleanup - potential memory leak');
      performanceScore -= 20;
    }

    // Inefficient string concatenation
    if (/(\w+\s*\+\s*\w+.*){3,}/.test(code) && !code.includes('join(')) {
      issues.push('Inefficient string concatenation - consider using array join');
      performanceScore -= 10;
    }

    return {
      potentialIssues: issues,
      performanceScore: Math.max(0, performanceScore)
    };
  }
};

/**
 * Framework detector plugin
 */
export const FrameworkDetectorPlugin: Plugin = {
  name: 'framework-detector',
  version: '1.0.0',
  description: 'Detects and analyzes framework-specific code',
  supportedLanguages: ['javascript', 'typescript', 'python'],

  analyzeQuality(code: string, language: string): Partial<CodeQualityMetrics> {
    let framework: string | undefined;

    if (code.includes('import React') || code.includes('from "react"')) {
      framework = 'react';
    } else if (code.includes('import Vue') || code.includes('from "vue"')) {
      framework = 'vue';
    } else if (code.includes('import { Component }') && code.includes('@Component')) {
      framework = 'angular';
    } else if (code.includes('from flask import') || code.includes('import flask')) {
      framework = 'flask';
    } else if (code.includes('from django') || code.includes('import django')) {
      framework = 'django';
    } else if (code.includes('from fastapi import') || code.includes('import fastapi')) {
      framework = 'fastapi';
    }

    return {
      framework
    };
  }
};

// Export default plugin manager instance
export const pluginManager = new PluginManager();

// Register built-in plugins
pluginManager.register(SecurityAnalyzerPlugin);
pluginManager.register(PerformanceAnalyzerPlugin);
pluginManager.register(FrameworkDetectorPlugin);
