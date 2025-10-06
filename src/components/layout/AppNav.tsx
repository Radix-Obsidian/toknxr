'use client';

import React from 'react';
import { UserMenu } from '@/components/auth/UserMenu';

interface AppNavProps {
  title?: string;
  subtitle?: string;
}

export function AppNav({ title = 'TokNxr', subtitle }: AppNavProps) {
  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-semibold text-gray-900">
              {title}
              {subtitle && (
                <span className="ml-2 text-sm font-normal text-gray-500">
                  {subtitle}
                </span>
              )}
            </h1>
          </div>
          <div className="flex items-center">
            <UserMenu />
          </div>
        </div>
      </div>
    </nav>
  );
}