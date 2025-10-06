export interface HallucinationDetection {
  isLikelyHallucination: boolean;
  confidence: number; // 0-100, higher = more likely hallucination
  severity: 'low' | 'medium' | 'high' | 'critical';
  categories: HallucinationCategory[];
  issues: string[];
  evidence: HallucinationEvidence[];
}

export interface HallucinationCategory {
  type: 'factual' | 'contextual' | 'technical' | 'logical' | 'citation';
  description: string;
  confidence: number;
}

export interface HallucinationEvidence {
  type: 'contradiction' | 'overconfidence' | 'fabrication' | 'context_drift' | 'invalid_reference';
  description: string;
  severity: number; // 1-10
  context?: string;
}

export interface HallucinationMetrics {
  totalAnalyses: number;
  hallucinationCount: number;
  hallucinationRate: number; // percentage
  avgConfidence: number;
  byCategory: Record<string, number>;
  byProvider: Record<string, number>;
  businessImpact: BusinessImpactMetrics;
}

export interface BusinessImpactMetrics {
  estimatedDevTimeWasted: number; // hours
  qualityDegradationScore: number; // 0-100
  roiImpact: number; // percentage reduction in ROI
  costOfHallucinations: number; // USD
}

/**
 * Main hallucination detection engine
 */
export class HallucinationDetector {
  private technicalTerms = new Set([
    'api', 'endpoint', 'function', 'method', 'class', 'interface', 'module',
    'library', 'framework', 'database', 'server', 'client', 'request', 'response',
    'parameter', 'argument', 'variable', 'constant', 'algorithm', 'data structure'
  ]);

  private commonLibraries = new Set([
    'react', 'express', 'axios', 'lodash', 'jquery', 'bootstrap', 'tailwind',
    'tensorflow', 'pytorch', 'pandas', 'numpy', 'requests', 'flask', 'django'
  ]);

  /**
   * Analyze response for potential hallucinations
   */
  detectHallucination(
    userPrompt: string,
    aiResponse: string,
    context?: string[]
  ): HallucinationDetection {
    const issues: string[] = [];
    const evidence: HallucinationEvidence[] = [];
    const categories: HallucinationCategory[] = [];

    // 1. Check for overconfidence indicators
    const overconfidenceEvidence = this.detectOverconfidence(aiResponse);
    if (overconfidenceEvidence) {
      evidence.push(overconfidenceEvidence);
      issues.push('Response shows signs of overconfidence without sufficient evidence');
    }

    // 2. Check for factual contradictions
    const contradictions = this.detectContradictions(aiResponse, context);
    evidence.push(...contradictions);
    if (contradictions.length > 0) {
      issues.push('Internal contradictions detected in response');
    }

    // 3. Check for technical hallucinations (made-up APIs, libraries, etc.)
    const technicalHallucinations = this.detectTechnicalHallucinations(aiResponse);
    evidence.push(...technicalHallucinations);
    if (technicalHallucinations.length > 0) {
      issues.push('Potential technical hallucinations detected');
    }

    // 4. Check for context drift
    const contextDrift = this.detectContextDrift(userPrompt, aiResponse, context);
    if (contextDrift) {
      evidence.push(contextDrift);
      issues.push('Response may have drifted from original context');
    }

    // 5. Check for citation/reference issues
    const citationIssues = this.detectCitationIssues(aiResponse);
    evidence.push(...citationIssues);
    if (citationIssues.length > 0) {
      issues.push('Questionable citations or references detected');
    }

    // Calculate overall confidence and categorize
    const overallConfidence = this.calculateOverallConfidence(evidence, categories);
    const severity = this.determineSeverity(overallConfidence);

    // Determine if this is likely a hallucination
    const isLikelyHallucination = overallConfidence > 60 || issues.length >= 2;

    return {
      isLikelyHallucination,
      confidence: overallConfidence,
      severity,
      categories,
      issues,
      evidence
    };
  }

  /**
   * Detect overconfidence indicators
   */
  private detectOverconfidence(response: string): HallucinationEvidence | null {
    const overconfidencePatterns = [
      /definitely\s+(correct|right|accurate)/gi,
      /absolutely\s+(certain|sure|positive)/gi,
      /without\s+(a\s+)?doubt/gi,
      /everyone\s+knows/gi,
      /obviously/gi,
      /clearly/gi
    ];

    const confidence = overconfidencePatterns.reduce((score, pattern) => {
      const matches = response.match(pattern);
      return score + (matches ? matches.length * 15 : 0);
    }, 0);

    if (confidence > 30) {
      return {
        type: 'overconfidence',
        description: `Response shows ${confidence}% overconfidence indicators`,
        severity: Math.min(confidence / 10, 10)
      };
    }

    return null;
  }

  /**
   * Detect internal contradictions
   */
  private detectContradictions(response: string, context?: string[]): HallucinationEvidence[] {
    const evidence: HallucinationEvidence[] = [];

    // Look for contradictory statements
    const contradictions = [
      { pattern: /(yes|correct|true).*?(no|incorrect|false)/gi, description: 'Direct yes/no contradiction' },
      { pattern: /(always).*?(never)/gi, description: 'Always/never contradiction' },
      { pattern: /(all|every).*?(none|no)/gi, description: 'All/none contradiction' },
      { pattern: /(\d+).*?(\d+)/g, description: 'Numerical contradictions' }
    ];

    contradictions.forEach(({ pattern, description }) => {
      const matches = response.match(pattern);
      if (matches) {
        evidence.push({
          type: 'contradiction',
          description: `${description} detected`,
          severity: 8,
          context: matches[0]
        });
      }
    });

    return evidence;
  }

  /**
   * Detect technical hallucinations (made-up APIs, libraries, etc.)
   */
  private detectTechnicalHallucinations(response: string): HallucinationEvidence[] {
    const evidence: HallucinationEvidence[] = [];

    // Extract technical terms and check if they're likely made up
    const technicalTerms = response.match(/\b[A-Z][a-zA-Z]*[A-Z]\w*\b/g) || [];
    const suspiciousTerms = technicalTerms.filter(term => {
      // Check if it looks like a class name or API but isn't common
      return term.length > 6 &&
             !this.technicalTerms.has(term.toLowerCase()) &&
             /[A-Z]/.test(term) && // Has uppercase letters (likely class/API name)
             !this.commonLibraries.has(term.toLowerCase());
    });

    if (suspiciousTerms.length > 0) {
      evidence.push({
        type: 'fabrication',
        description: `Suspicious technical terms detected: ${suspiciousTerms.join(', ')}`,
        severity: 7
      });
    }

    // Check for made-up method names
    const methodPatterns = [
      /\.([a-z][a-zA-Z]*[A-Z]\w*)\(/g, // camelCase methods
      /\b([a-z]+_[a-z_]*)\(/g // snake_case functions
    ];

    methodPatterns.forEach(pattern => {
      const matches = [...response.matchAll(pattern)];
      const suspiciousMethods = matches.filter(match => {
        const methodName = match[1];
        return methodName.length > 10 &&
               !this.technicalTerms.has(methodName.toLowerCase()) &&
               /[A-Z]/.test(methodName); // Likely made up
      });

      if (suspiciousMethods.length > 0) {
        evidence.push({
          type: 'fabrication',
          description: `Potentially fabricated method names: ${suspiciousMethods.map(m => m[1]).join(', ')}`,
          severity: 6
        });
      }
    });

    return evidence;
  }

  /**
   * Detect context drift from conversation history
   */
  private detectContextDrift(
    userPrompt: string,
    response: string,
    context?: string[]
  ): HallucinationEvidence | null {
    if (!context || context.length === 0) return null;

    // Check if response addresses the current prompt or drifts to previous context
    const promptKeywords = this.extractKeywords(userPrompt);
    const responseKeywords = this.extractKeywords(response);

    const contextOverlap = promptKeywords.filter(keyword =>
      responseKeywords.some(respKeyword =>
        respKeyword.includes(keyword) || keyword.includes(respKeyword)
      )
    ).length;

    const driftScore = Math.max(0, (promptKeywords.length - contextOverlap) / promptKeywords.length * 100);

    if (driftScore > 60) {
      return {
        type: 'context_drift',
        description: `High context drift detected (${driftScore.toFixed(1)}% deviation from prompt)`,
        severity: Math.min(driftScore / 10, 10)
      };
    }

    return null;
  }

  /**
   * Detect citation and reference issues
   */
  private detectCitationIssues(response: string): HallucinationEvidence[] {
    const evidence: HallucinationEvidence[] = [];

    // Look for citations that might be fabricated
    const citationPatterns = [
      /according\s+to\s+([^,\.]+)/gi,
      /as\s+stated\s+(in|by)\s+([^,\.]+)/gi,
      /\[([^\]]+)\]/g, // Reference brackets
      /source[s]?:\s*([^,\.]+)/gi
    ];

    citationPatterns.forEach(pattern => {
      const matches = [...response.matchAll(pattern)];
      matches.forEach(match => {
        const citation = match[1] || match[0];
        if (citation && citation.length > 50) { // Unusually long citation
          evidence.push({
            type: 'invalid_reference',
            description: `Suspiciously long or complex citation: ${citation.substring(0, 50)}...`,
            severity: 5
          });
        }
      });
    });

    return evidence;
  }

  /**
   * Calculate overall hallucination confidence
   */
  private calculateOverallConfidence(
    evidence: HallucinationEvidence[],
    categories: HallucinationCategory[]
  ): number {
    if (evidence.length === 0) return 0;

    // Weight different types of evidence
    const weights = {
      contradiction: 1.0,
      overconfidence: 0.8,
      fabrication: 0.9,
      context_drift: 0.7,
      invalid_reference: 0.6
    };

    const totalWeightedScore = evidence.reduce((sum, ev) => {
      return sum + (ev.severity * (weights[ev.type] || 0.5));
    }, 0);

    const avgScore = totalWeightedScore / evidence.length;

    // Cap at 100 and apply some randomness to simulate uncertainty
    return Math.min(100, Math.max(0, avgScore * 10 + Math.random() * 10 - 5));
  }

  /**
   * Determine severity level
   */
  private determineSeverity(confidence: number): 'low' | 'medium' | 'high' | 'critical' {
    if (confidence >= 80) return 'critical';
    if (confidence >= 60) return 'high';
    if (confidence >= 40) return 'medium';
    return 'low';
  }

  /**
   * Extract meaningful keywords from text
   */
  private extractKeywords(text: string): string[] {
    return text
      .toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 4)
      .filter(word => !['that', 'with', 'from', 'this', 'will', 'should', 'would', 'could'].includes(word))
      .slice(0, 10); // Limit to top 10 keywords
  }

  /**
   * Calculate business impact of hallucinations
   */
  calculateBusinessImpact(
    hallucinationRate: number,
    totalInteractions: number,
    avgCostPerInteraction: number,
    avgDevTimePerFix: number = 0.5 // hours
  ): BusinessImpactMetrics {
    const devTimeWasted = (hallucinationRate / 100) * totalInteractions * avgDevTimePerFix;
    const qualityDegradationScore = Math.min(100, hallucinationRate * 1.5);
    const roiImpact = hallucinationRate * 0.8; // 0.8% ROI reduction per 1% hallucination rate
    const costOfHallucinations = (hallucinationRate / 100) * totalInteractions * avgCostPerInteraction * 2; // 2x multiplier for debugging cost

    return {
      estimatedDevTimeWasted: Math.round(devTimeWasted * 10) / 10,
      qualityDegradationScore: Math.round(qualityDegradationScore),
      roiImpact: Math.round(roiImpact * 10) / 10,
      costOfHallucinations: Math.round(costOfHallucinations * 100) / 100
    };
  }
}

/**
 * Global hallucination detector instance
 */
export const hallucinationDetector = new HallucinationDetector();
