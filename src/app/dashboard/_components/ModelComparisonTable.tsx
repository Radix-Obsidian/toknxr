'use client';

import React, { useMemo } from 'react';
import {
  QualityBadge,
  ProviderBadge,
  CostBadge,
  HallucinationBadge,
  WorthItBadge,
} from '@/components/ui';
import { Interaction } from '../_types/dashboard';

interface ModelStats {
  provider: string;
  model: string;
  totalInteractions: number;
  totalTokens: number;
  totalCost: number;
  avgQualityScore: number;
  avgEffectivenessScore: number;
  hallucinationRate: number;
  avgCostPerToken: number;
  avgCostPerInteraction: number;
  worthItScore: number;
  qualityDistribution: {
    excellent: number;
    good: number;
    fair: number;
    poor: number;
  };
}

interface ModelComparisonTableProps {
  interactions: Interaction[];
  className?: string;
}

export function ModelComparisonTable({ interactions, className }: ModelComparisonTableProps) {
  const modelStats = useMemo(() => {
    const statsMap = new Map<string, ModelStats>();
    let maxCost = 0;

    interactions.forEach((interaction) => {
      const key = `${interaction.provider}-${interaction.model}`;
      
      if (!statsMap.has(key)) {
        statsMap.set(key, {
          provider: interaction.provider,
          model: interaction.model,
          totalInteractions: 0,
          totalTokens: 0,
          totalCost: 0,
          avgQualityScore: 0,
          avgEffectivenessScore: 0,
          hallucinationRate: 0,
          avgCostPerToken: 0,
          avgCostPerInteraction: 0,
          worthItScore: 0,
          qualityDistribution: {
            excellent: 0,
            good: 0,
            fair: 0,
            poor: 0,
          },
        });
      }

      const stats = statsMap.get(key)!;
      stats.totalInteractions += 1;
      stats.totalTokens += interaction.totalTokens;
      stats.totalCost += interaction.costUSD || 0;

      const qualityScore = (interaction as any).codeQualityScore || 0;
      const effectivenessScore = (interaction as any).effectivenessScore || 0;
      
      stats.avgQualityScore += qualityScore;
      stats.avgEffectivenessScore += effectivenessScore;

      if (qualityScore >= 90) stats.qualityDistribution.excellent += 1;
      else if (qualityScore >= 75) stats.qualityDistribution.good += 1;
      else if (qualityScore >= 60) stats.qualityDistribution.fair += 1;
      else stats.qualityDistribution.poor += 1;

      if (interaction.hallucination) {
        stats.hallucinationRate += 1;
      }
    });

    statsMap.forEach((stats) => {
      if (stats.totalInteractions > 0) {
        stats.avgQualityScore = Math.round(stats.avgQualityScore / stats.totalInteractions);
        stats.avgEffectivenessScore = Math.round(stats.avgEffectivenessScore / stats.totalInteractions);
        stats.hallucinationRate = (stats.hallucinationRate / stats.totalInteractions) * 100;
        stats.avgCostPerToken = stats.totalCost / stats.totalTokens;
        stats.avgCostPerInteraction = stats.totalCost / stats.totalInteractions;
        if (stats.totalCost > maxCost) {
          maxCost = stats.totalCost;
        }
      }
    });

    statsMap.forEach((stats) => {
      if (maxCost > 0) {
        const normalizedCost = (stats.totalCost / maxCost) * 100;
        stats.worthItScore = (stats.avgQualityScore * 0.4) + (stats.avgEffectivenessScore * 0.4) - (normalizedCost * 0.2);
      } else {
        stats.worthItScore = (stats.avgQualityScore * 0.4) + (stats.avgEffectivenessScore * 0.4);
      }
    });

    return Array.from(statsMap.values()).sort((a, b) => b.worthItScore - a.worthItScore);
  }, [interactions]);

  if (modelStats.length === 0) {
    return (
      <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Model Comparison</h3>
        <p className="text-gray-500 text-center py-8">
          No interaction data available for model comparison.
        </p>
      </div>
    );
  }

  const getPerformanceLevel = (score: number): 'high' | 'medium' | 'low' => {
    if (score >= 80) return 'high';
    if (score >= 60) return 'medium';
    return 'low';
  };

  const getCostEfficiency = (costPerToken: number): 'high' | 'medium' | 'low' => {
    if (costPerToken <= 0.00001) return 'high';
    if (costPerToken <= 0.0001) return 'medium';
    return 'low';
  };

  return (
    <div className={`bg-white rounded-lg shadow ${className}`}>
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Model Comparison</h3>
        <p className="text-sm text-gray-500 mt-1">
          Performance metrics across different AI models and providers
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Model
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Worth It Score
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Usage
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Quality Score
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Effectiveness
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cost Efficiency
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Hallucinations
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Quality Distribution
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {modelStats.map((stats, index) => (
              <tr key={`${stats.provider}-${stats.model}`} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col space-y-1">
                    <ProviderBadge 
                      provider={stats.provider} 
                      performance={getPerformanceLevel(stats.avgQualityScore)}
                    />
                    <span className="text-sm font-medium text-gray-900">{stats.model}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <WorthItBadge score={stats.worthItScore} />
                </td>

                {/* Usage Stats */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    <div>{stats.totalInteractions} interactions</div>
                    <div className="text-gray-500">{stats.totalTokens.toLocaleString()} tokens</div>
                  </div>
                </td>

                {/* Quality Score */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <QualityBadge score={stats.avgQualityScore} size="sm" />
                </td>

                {/* Effectiveness */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <QualityBadge 
                    score={stats.avgEffectivenessScore} 
                    size="sm"
                    variant="outline"
                  />
                </td>

                {/* Cost Efficiency */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col space-y-1">
                    <CostBadge 
                      cost={stats.avgCostPerInteraction}
                      efficiency={getCostEfficiency(stats.avgCostPerToken)}
                      size="sm"
                    />
                    <span className="text-xs text-gray-500">
                      ${stats.avgCostPerToken.toFixed(6)}/token
                    </span>
                  </div>
                </td>

                {/* Hallucinations */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <HallucinationBadge 
                    detected={stats.hallucinationRate > 0}
                    confidence={Math.round(stats.hallucinationRate)}
                    size="sm"
                  />
                </td>

                {/* Quality Distribution */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex space-x-1">
                    {stats.qualityDistribution.excellent > 0 && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {stats.qualityDistribution.excellent}E
                      </span>
                    )}
                    {stats.qualityDistribution.good > 0 && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {stats.qualityDistribution.good}G
                      </span>
                    )}
                    {stats.qualityDistribution.fair > 0 && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        {stats.qualityDistribution.fair}F
                      </span>
                    )}
                    {stats.qualityDistribution.poor > 0 && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        {stats.qualityDistribution.poor}P
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    E=Excellent, G=Good, F=Fair, P=Poor
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary Footer */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
        <div className="flex justify-between items-center text-sm text-gray-600">
          <span>
            Showing {modelStats.length} model{modelStats.length !== 1 ? 's' : ''} across {new Set(modelStats.map(s => s.provider)).size} provider{new Set(modelStats.map(s => s.provider)).size !== 1 ? 's' : ''}
          </span>
          <span>
            Total: {modelStats.reduce((sum, s) => sum + s.totalInteractions, 0)} interactions
          </span>
        </div>
      </div>
    </div>
  );
}