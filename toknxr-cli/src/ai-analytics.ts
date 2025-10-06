import fs from 'fs';
import path from 'path';
import { HallucinationDetector, HallucinationDetection, HallucinationMetrics, BusinessImpactMetrics } from './hallucination-detector.js';

export interface AIAnalyticsData {
  timestamp: string;
  provider: string;
  model: string;
  userPrompt: string;
  aiResponse: string;
  taskType: string;

  // Existing metrics
  codeQualityScore?: number;
  effectivenessScore?: number;

  // New hallucination metrics
  hallucinationDetection?: HallucinationDetection;
  businessImpact?: BusinessImpactMetrics;

  // Cost and usage
  costUSD: number;
  totalTokens: number;
}

export interface ProviderAnalytics {
  totalInteractions: number;
  hallucinationRate: number;
  avgQualityScore: number;
  avgEffectivenessScore: number;
  businessImpact: BusinessImpactMetrics;
}

export interface AggregatedAIAnalytics {
  totalInteractions: number;
  hallucinationMetrics: HallucinationMetrics;
  providerComparison: Record<string, ProviderAnalytics>;
  trends: {
    hallucinationRateOverTime: Array<{ date: string; rate: number }>;
    qualityScoreOverTime: Array<{ date: string; score: number }>;
    costEfficiencyOverTime: Array<{ date: string; efficiency: number }>;
  };
  recommendations: string[];
}

/**
 * Enhanced AI Analytics with hallucination tracking
 */
export class AIAnalytics {
  private detector: HallucinationDetector;
  private logFilePath: string;

  constructor(logFilePath?: string) {
    this.detector = new HallucinationDetector();
    this.logFilePath = logFilePath || path.resolve(process.cwd(), 'interactions.log');
  }

  /**
   * Analyze a single interaction for hallucinations and business impact
   */
  analyzeInteraction(
    userPrompt: string,
    aiResponse: string,
    context: {
      provider: string;
      model: string;
      taskType: string;
      costUSD: number;
      totalTokens: number;
      codeQualityScore?: number;
      effectivenessScore?: number;
    }
  ): AIAnalyticsData {
    // Run hallucination detection
    const hallucinationDetection = this.detector.detectHallucination(
      userPrompt,
      aiResponse
    );

    // Calculate business impact if hallucination detected
    let businessImpact: BusinessImpactMetrics | undefined;
    if (hallucinationDetection.isLikelyHallucination) {
      businessImpact = this.detector.calculateBusinessImpact(
        hallucinationDetection.confidence,
        1, // This interaction
        context.costUSD
      );
    }

    return {
      timestamp: new Date().toISOString(),
      provider: context.provider,
      model: context.model,
      userPrompt,
      aiResponse,
      taskType: context.taskType,
      costUSD: context.costUSD,
      totalTokens: context.totalTokens,
      codeQualityScore: context.codeQualityScore,
      effectivenessScore: context.effectivenessScore,
      hallucinationDetection,
      businessImpact
    };
  }

  /**
   * Generate comprehensive analytics from interaction logs
   */
  generateAnalytics(): AggregatedAIAnalytics {
    if (!fs.existsSync(this.logFilePath)) {
      return this.getEmptyAnalytics();
    }

    const fileContent = fs.readFileSync(this.logFilePath, 'utf8');
    const lines = fileContent.trim().split('\n');
    const interactions: AIAnalyticsData[] = [];

    // Parse all interactions
    for (const line of lines) {
      try {
        const interaction = JSON.parse(line);
        if (interaction.userPrompt && interaction.aiResponse) {
          interactions.push(interaction as AIAnalyticsData);
        }
      } catch (error) {
        // Skip malformed lines
        continue;
      }
    }

    if (interactions.length === 0) {
      return this.getEmptyAnalytics();
    }

    return this.aggregateAnalytics(interactions);
  }

  /**
   * Aggregate analytics from interaction data
   */
  private aggregateAnalytics(interactions: AIAnalyticsData[]): AggregatedAIAnalytics {
    const totalInteractions = interactions.length;

    // Calculate hallucination metrics
    const hallucinations = interactions.filter(i => i.hallucinationDetection?.isLikelyHallucination);
    const hallucinationCount = hallucinations.length;
    const hallucinationRate = (hallucinationCount / totalInteractions) * 100;

    const avgConfidence = hallucinations.length > 0
      ? hallucinations.reduce((sum, h) => sum + (h.hallucinationDetection?.confidence || 0), 0) / hallucinations.length
      : 0;

    // Category breakdown
    const byCategory: Record<string, number> = {};
    hallucinations.forEach(h => {
      h.hallucinationDetection?.evidence.forEach(evidence => {
        byCategory[evidence.type] = (byCategory[evidence.type] || 0) + 1;
      });
    });

    // Provider comparison
    const providerStats: Record<string, AIAnalyticsData[]> = {};
    interactions.forEach(interaction => {
      if (!providerStats[interaction.provider]) {
        providerStats[interaction.provider] = [];
      }
      providerStats[interaction.provider].push(interaction);
    });

    const providerComparison: Record<string, ProviderAnalytics> = {};
    Object.entries(providerStats).forEach(([provider, providerInteractions]) => {
      const providerHallucinations = providerInteractions.filter(i => i.hallucinationDetection?.isLikelyHallucination);
      const providerHallucinationRate = (providerHallucinations.length / providerInteractions.length) * 100;

      const avgQualityScore = providerInteractions.reduce((sum, i) => sum + (i.codeQualityScore || 0), 0) / providerInteractions.length;
      const avgEffectivenessScore = providerInteractions.reduce((sum, i) => sum + (i.effectivenessScore || 0), 0) / providerInteractions.length;

      // Calculate business impact for this provider
      const totalCost = providerInteractions.reduce((sum, i) => sum + i.costUSD, 0);
      const businessImpact = this.detector.calculateBusinessImpact(
        providerHallucinationRate,
        providerInteractions.length,
        totalCost / providerInteractions.length
      );

      providerComparison[provider] = {
        totalInteractions: providerInteractions.length,
        hallucinationRate: Math.round(providerHallucinationRate * 10) / 10,
        avgQualityScore: Math.round(avgQualityScore),
        avgEffectivenessScore: Math.round(avgEffectivenessScore),
        businessImpact
      };
    });

    // Calculate overall business impact
    const totalCost = interactions.reduce((sum, i) => sum + i.costUSD, 0);
    const avgCostPerInteraction = totalCost / totalInteractions;
    const overallBusinessImpact = this.detector.calculateBusinessImpact(
      hallucinationRate,
      totalInteractions,
      avgCostPerInteraction
    );

    const hallucinationMetrics: HallucinationMetrics = {
      totalAnalyses: totalInteractions,
      hallucinationCount,
      hallucinationRate: Math.round(hallucinationRate * 10) / 10,
      avgConfidence: Math.round(avgConfidence),
      byCategory,
      byProvider: Object.fromEntries(
        Object.entries(providerComparison).map(([provider, stats]) => [provider, stats.hallucinationRate])
      ),
      businessImpact: overallBusinessImpact
    };

    // Generate trends (last 30 days)
    const trends = this.generateTrends(interactions);

    // Generate recommendations
    const recommendations = this.generateRecommendations(hallucinationMetrics, providerComparison);

    return {
      totalInteractions,
      hallucinationMetrics,
      providerComparison,
      trends,
      recommendations
    };
  }

  /**
   * Generate trend data from interactions
   */
  private generateTrends(interactions: AIAnalyticsData[]) {
    const last30Days = new Date();
    last30Days.setDate(last30Days.getDate() - 30);

    const recentInteractions = interactions.filter(i => new Date(i.timestamp) >= last30Days);

    // Group by day
    const dailyGroups: Record<string, AIAnalyticsData[]> = {};
    recentInteractions.forEach(interaction => {
      const date = new Date(interaction.timestamp).toISOString().split('T')[0];
      if (!dailyGroups[date]) {
        dailyGroups[date] = [];
      }
      dailyGroups[date].push(interaction);
    });

    // Calculate daily metrics
    const hallucinationRateOverTime = Object.entries(dailyGroups)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, dayInteractions]) => {
        const hallucinations = dayInteractions.filter(i => i.hallucinationDetection?.isLikelyHallucination);
        const rate = dayInteractions.length > 0 ? (hallucinations.length / dayInteractions.length) * 100 : 0;
        return { date, rate: Math.round(rate * 10) / 10 };
      });

    const qualityScoreOverTime = Object.entries(dailyGroups)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, dayInteractions]) => {
        const avgQuality = dayInteractions.reduce((sum, i) => sum + (i.codeQualityScore || 0), 0) / dayInteractions.length;
        return { date, score: Math.round(avgQuality) };
      });

    const costEfficiencyOverTime = Object.entries(dailyGroups)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, dayInteractions]) => {
        const totalCost = dayInteractions.reduce((sum, i) => sum + i.costUSD, 0);
        const avgQuality = dayInteractions.reduce((sum, i) => sum + (i.codeQualityScore || 0), 0) / dayInteractions.length;
        const efficiency = totalCost > 0 ? (avgQuality / totalCost) * 1000 : 0; // Quality per dollar
        return { date, efficiency: Math.round(efficiency * 10) / 10 };
      });

    return {
      hallucinationRateOverTime,
      qualityScoreOverTime,
      costEfficiencyOverTime
    };
  }

  /**
   * Generate actionable recommendations
   */
  private generateRecommendations(
    metrics: HallucinationMetrics,
    providerComparison: Record<string, ProviderAnalytics>
  ): string[] {
    const recommendations: string[] = [];

    // Hallucination rate recommendations
    if (metrics.hallucinationRate > 20) {
      recommendations.push(`🚨 CRITICAL: Hallucination rate is ${metrics.hallucinationRate}%. Consider reviewing AI-generated content more carefully.`);
    } else if (metrics.hallucinationRate > 10) {
      recommendations.push(`⚠️ WARNING: Hallucination rate is ${metrics.hallucinationRate}%. Monitor closely and verify important information.`);
    } else if (metrics.hallucinationRate > 5) {
      recommendations.push(`ℹ️ Hallucination rate is ${metrics.hallucinationRate}%. Generally acceptable but watch for patterns.`);
    }

    // Provider-specific recommendations
    const worstProvider = Object.entries(providerComparison)
      .sort(([,a], [,b]) => (b.hallucinationRate || 0) - (a.hallucinationRate || 0))[0];

    if (worstProvider && (worstProvider[1].hallucinationRate || 0) > 15) {
      recommendations.push(`🔄 Consider reducing usage of ${worstProvider[0]} (hallucination rate: ${worstProvider[1].hallucinationRate}%) or improve prompt quality.`);
    }

    // Business impact recommendations
    if (metrics.businessImpact.estimatedDevTimeWasted > 5) {
      recommendations.push(`⏱️ Hallucinations are wasting ~${metrics.businessImpact.estimatedDevTimeWasted} hours of development time. Consider AI response verification workflows.`);
    }

    if (metrics.businessImpact.roiImpact > 10) {
      recommendations.push(`💰 Hallucinations are reducing ROI by ${metrics.businessImpact.roiImpact}%. Review AI usage strategy and prompt engineering.`);
    }

    // Quality improvement recommendations
    const bestProvider = Object.entries(providerComparison)
      .sort(([,a], [,b]) => (b.avgQualityScore || 0) - (a.avgQualityScore || 0))[0];

    if (bestProvider && (bestProvider[1].avgQualityScore || 0) > 80) {
      recommendations.push(`✅ ${bestProvider[0]} shows good performance (quality: ${bestProvider[1].avgQualityScore}/100). Consider using it more for critical tasks.`);
    }

    // Category-specific recommendations
    if (metrics.byCategory.fabrication > metrics.byCategory.contradiction) {
      recommendations.push(`🔧 High fabrication rate detected. Focus on improving technical prompt specificity and providing more context.`);
    }

    if (metrics.byCategory.contradiction > 3) {
      recommendations.push(`⚖️ Multiple contradictions detected. Consider breaking complex requests into smaller, focused prompts.`);
    }

    if (recommendations.length === 0) {
      recommendations.push('✨ AI hallucination metrics look good! Continue monitoring for any emerging patterns.');
    }

    return recommendations;
  }

  /**
   * Get empty analytics for when no data is available
   */
  private getEmptyAnalytics(): AggregatedAIAnalytics {
    return {
      totalInteractions: 0,
      hallucinationMetrics: {
        totalAnalyses: 0,
        hallucinationCount: 0,
        hallucinationRate: 0,
        avgConfidence: 0,
        byCategory: {},
        byProvider: {},
        businessImpact: {
          estimatedDevTimeWasted: 0,
          qualityDegradationScore: 0,
          roiImpact: 0,
          costOfHallucinations: 0
        }
      },
      providerComparison: {},
      trends: {
        hallucinationRateOverTime: [],
        qualityScoreOverTime: [],
        costEfficiencyOverTime: []
      },
      recommendations: ['No data available yet. Start using AI through the proxy to see analytics.']
    };
  }

  /**
   * Export analytics to JSON file
   */
  exportAnalytics(filePath?: string): void {
    const analytics = this.generateAnalytics();
    const exportPath = filePath || path.resolve(process.cwd(), 'ai-analytics.json');

    fs.writeFileSync(exportPath, JSON.stringify(analytics, null, 2));
    console.log(`AI analytics exported to ${exportPath}`);
  }

  /**
   * Get real-time hallucination rate for a specific provider
   */
  getProviderHallucinationRate(provider: string, hours: number = 24): number {
    if (!fs.existsSync(this.logFilePath)) return 0;

    const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000);
    const fileContent = fs.readFileSync(this.logFilePath, 'utf8');
    const lines = fileContent.trim().split('\n');

    let providerInteractions = 0;
    let providerHallucinations = 0;

    for (const line of lines) {
      try {
        const interaction = JSON.parse(line);
        const interactionTime = new Date(interaction.timestamp);

        if (interactionTime >= cutoffTime && interaction.provider === provider) {
          providerInteractions++;
          if (interaction.hallucinationDetection?.isLikelyHallucination) {
            providerHallucinations++;
          }
        }
      } catch {
        continue;
      }
    }

    return providerInteractions > 0 ? (providerHallucinations / providerInteractions) * 100 : 0;
  }
}

/**
 * Global AI analytics instance
 */
export const aiAnalytics = new AIAnalytics();
