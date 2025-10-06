'use client';

import React from 'react';
import { QualityBadge, ProviderBadge, HallucinationBadge, CostBadge } from '@/components/ui';
import { Interaction } from '../_types/dashboard';
import { formatDate } from '@/lib/utils';

interface InteractionHistoryProps {
  interactions: Interaction[];
}

export function InteractionHistory({ interactions }: InteractionHistoryProps) {
  if (interactions.length === 0) {
    return (
      <div className="mt-8 bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
          Interaction History
        </h3>
        <p className="text-gray-500 text-center py-8">
          No interactions recorded yet. Start using AI through the TokNxr proxy to see data here.
        </p>
      </div>
    );
  }

  const getCostEfficiency = (costUSD: number, totalTokens: number): 'high' | 'medium' | 'low' => {
    const costPerToken = costUSD / totalTokens;
    if (costPerToken <= 0.00001) return 'high';
    if (costPerToken <= 0.0001) return 'medium';
    return 'low';
  };

  const getProviderPerformance = (qualityRating: string): 'high' | 'medium' | 'low' => {
    if (qualityRating === 'useful') return 'high';
    if (qualityRating === 'partial') return 'medium';
    return 'low';
  };

  return (
    <div className="mt-8 bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium leading-6 text-gray-900">
          Interaction History
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          Recent AI interactions with quality metrics and cost analysis
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Model & Provider
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tokens & Cost
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Quality Rating
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Code Quality
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Hallucination
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Timestamp
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {interactions.map((interaction, index) => (
              <tr key={interaction.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                {/* Model & Provider */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col space-y-2">
                    <ProviderBadge 
                      provider={interaction.provider}
                      performance={getProviderPerformance(interaction.qualityRating)}
                      size="sm"
                    />
                    <span className="text-sm font-medium text-gray-900">
                      {interaction.model}
                    </span>
                  </div>
                </td>

                {/* Tokens & Cost */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col space-y-1">
                    <span className="text-sm text-gray-900">
                      {interaction.totalTokens.toLocaleString()} tokens
                    </span>
                    <CostBadge 
                      cost={interaction.costUSD || 0}
                      efficiency={getCostEfficiency(interaction.costUSD || 0, interaction.totalTokens)}
                      size="sm"
                    />
                  </div>
                </td>

                {/* Quality Rating */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <QualityBadge 
                    level={
                      interaction.qualityRating === 'useful' ? 'excellent' :
                      interaction.qualityRating === 'partial' ? 'fair' : 'poor'
                    }
                    showScore={false}
                    size="sm"
                  />
                </td>

                {/* Code Quality Score */}
                <td className="px-6 py-4 whitespace-nowrap">
                  {(interaction as any).codeQualityScore ? (
                    <QualityBadge 
                      score={(interaction as any).codeQualityScore}
                      size="sm"
                      variant="outline"
                    />
                  ) : (
                    <span className="text-sm text-gray-400">N/A</span>
                  )}
                </td>

                {/* Hallucination */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <HallucinationBadge 
                    detected={interaction.hallucination}
                    confidence={(interaction as any).hallucinationConfidence}
                    size="sm"
                  />
                </td>

                {/* Timestamp */}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(interaction.timestamp)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer with summary */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
        <div className="flex justify-between items-center text-sm text-gray-600">
          <span>
            Showing {interactions.length} interaction{interactions.length !== 1 ? 's' : ''}
          </span>
          <div className="flex space-x-4">
            <span>
              Total Cost: ${interactions.reduce((sum, i) => sum + (i.costUSD || 0), 0).toFixed(4)}
            </span>
            <span>
              Total Tokens: {interactions.reduce((sum, i) => sum + i.totalTokens, 0).toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}