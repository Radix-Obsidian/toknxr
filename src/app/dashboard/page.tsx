'use client';

import React from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { PerformanceMonitor } from '@/components/performance/PerformanceMonitor';
import { DashboardNav, StatsCards, InteractionTracker, InteractionHistory, ModelComparisonTable } from './_components';
import { useDashboardData } from './_hooks';

export default function DashboardPage() {
  const { interactions, stats, loading, refetch } = useDashboardData();

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
            <p className="mt-4 text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <PerformanceMonitor routeName="dashboard" />
      <div className="min-h-screen bg-gray-50">
        <DashboardNav />
        
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <StatsCards stats={stats} />
          <InteractionTracker onInteractionTracked={refetch} />
          <ModelComparisonTable interactions={interactions} className="mt-8" />
          <InteractionHistory interactions={interactions} />
        </main>
      </div>
    </ProtectedRoute>
  );
}