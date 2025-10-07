'use client';

import React from 'react';
import { DashboardStats, Interaction } from '../_types/dashboard';
import { WorthItBadge } from '@/components/ui';

interface StatsCardsProps {
  stats: DashboardStats;
  interactions: Interaction[];
}

export function StatsCards({ stats, interactions }: StatsCardsProps) {
  const overallWorthItScore = () => {
    if (interactions.length === 0) {
      return 0;
    }

    const totalWorthItScore = interactions.reduce((acc, interaction) => {
      const qualityScore = (interaction as any).codeQualityScore || 0;
      const effectivenessScore = (interaction as any).effectivenessScore || 0;
      const cost = interaction.costUSD || 0;
      // Simple worth it score calculation, can be improved
      const worthItScore = qualityScore * 0.4 + effectivenessScore * 0.4 - cost * 0.2;
      return acc + worthItScore;
    }, 0);

    return totalWorthItScore / interactions.length;
  };

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-4">
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <dt className="text-sm font-medium text-gray-500 truncate">Overall Worth It</dt>
          <dd className="mt-1 text-3xl font-semibold text-gray-900">
            <WorthItBadge score={overallWorthItScore()} size="lg" />
          </dd>
        </div>
      </div>
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <dt className="text-sm font-medium text-gray-500 truncate">Total Cost</dt>
          <dd className="mt-1 text-3xl font-semibold text-gray-900">
            ${stats.totalCost.toFixed(4)}
          </dd>
        </div>
      </div>

      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <dt className="text-sm font-medium text-gray-500 truncate">Waste Rate</dt>
          <dd className="mt-1 text-3xl font-semibold text-gray-900">
            {stats.wasteRate.toFixed(1)}%
          </dd>
        </div>
      </div>

      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <dt className="text-sm font-medium text-gray-500 truncate">Hallucination Freq.</dt>
          <dd className="mt-1 text-3xl font-semibold text-gray-900">
            {stats.hallucinationFreq.toFixed(1)}%
          </dd>
        </div>
      </div>
    </div>
  );
}
