'use client';

import React from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { PerformanceMonitor } from '@/components/performance/PerformanceMonitor';
import {
  DashboardNav,
  StatsCards,
  InteractionTracker,
  InteractionHistory,
  ModelComparisonTable,
} from './_components';
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
          {interactions.length === 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg
                    className="h-6 w-6 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">Welcome to TokNxr! 🚀</h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <p>Get started by setting up your CLI proxy to track AI usage in real-time.</p>
                    <div className="mt-3">
                      <a
                        href="/cli-login"
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
                      >
                        Setup CLI Proxy →
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <StatsCards stats={stats} interactions={interactions} />
          <InteractionTracker onInteractionTracked={refetch} />
          <ModelComparisonTable interactions={interactions} className="mt-8" />
          <InteractionHistory interactions={interactions} />
        </main>
      </div>
    </ProtectedRoute>
  );
}
