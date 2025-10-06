'use client';

import React from 'react';
import { CliLoginState } from '../_types/cli-login';

interface CliAuthStatusProps {
  state: CliLoginState;
}

export function CliAuthStatus({ state }: CliAuthStatusProps) {
  const { message, isComplete, isLoading, error } = state;

  return (
    <div className="max-w-md w-full text-center p-8">
      <h1 className="text-2xl font-semibold text-gray-900 mb-4">
        TokNxr CLI Authentication
      </h1>
      
      <div className="mb-8">
        <p className="text-gray-600">{message}</p>
        
        {isLoading && (
          <div className="mt-4 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        )}
        
        {error && (
          <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
            {error}
          </div>
        )}
      </div>

      {isComplete && (
        <div className="mt-8 p-4 bg-green-100 text-green-800 rounded-md">
          <div className="flex items-center justify-center mb-2">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Success!
          </div>
          <p>You can now close this window and return to your terminal.</p>
        </div>
      )}
    </div>
  );
}