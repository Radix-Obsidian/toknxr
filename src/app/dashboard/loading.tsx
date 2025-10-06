import React from 'react';

export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Skeleton */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div className="flex items-center">
              <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 mb-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="h-8 w-20 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Interaction Tracker Skeleton */}
        <div className="mt-8 p-8 bg-white border-4 border-dashed border-gray-200 rounded-lg">
          <div className="text-center">
            <div className="h-8 w-64 bg-gray-200 rounded animate-pulse mx-auto mb-4"></div>
            <div className="flex justify-center space-x-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-10 w-24 bg-gray-200 rounded animate-pulse"></div>
              ))}
            </div>
          </div>
        </div>

        {/* Table Skeleton */}
        <div className="mt-8">
          <div className="h-6 w-48 bg-gray-200 rounded animate-pulse mb-4"></div>
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <div className="bg-gray-50 px-6 py-3">
              <div className="flex space-x-8">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
                ))}
              </div>
            </div>
            {[1, 2, 3].map((i) => (
              <div key={i} className="border-t border-gray-200 px-6 py-4">
                <div className="flex space-x-8">
                  {[1, 2, 3, 4, 5].map((j) => (
                    <div key={j} className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}