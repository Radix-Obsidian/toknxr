import React from 'react';

export default function CliLoginLoading() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full text-center p-8">
        <div className="h-8 w-64 bg-gray-200 rounded animate-pulse mx-auto mb-4"></div>
        <div className="h-4 w-80 bg-gray-200 rounded animate-pulse mx-auto mb-8"></div>
        
        {/* Loading spinner */}
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    </div>
  );
}