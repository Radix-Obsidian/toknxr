'use client';

import React from 'react';
import { CliAuthStatus, CliAuthModal } from './_components';
import { useCliAuthentication } from './_hooks';

export default function CliLoginPage() {
  const authState = useCliAuthentication();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <CliAuthStatus state={authState} />
      <CliAuthModal showModal={!authState.hasUser && !authState.isComplete} />
    </div>
  );
}