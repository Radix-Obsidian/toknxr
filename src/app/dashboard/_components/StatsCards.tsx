'use client';

import React from 'react';
import { DashboardStats } from '../_types/dashboard';

interface StatsCardsProps {
  stats: DashboardStats;
}

export function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
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
          <dt className="text-sm font-medium text-gray-500 truncate">
            Hallucination Freq.
          </dt>
          <dd className="mt-1 text-3xl font-semibold text-gray-900">
            {stats.hallucinationFreq.toFixed(1)}%
          </dd>
        </div>
      </div>
    </div>
  );
}