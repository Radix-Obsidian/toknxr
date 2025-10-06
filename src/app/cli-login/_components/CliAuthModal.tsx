'use client';

import React from 'react';
import { AuthModal } from '@/components/auth/AuthModal';

interface CliAuthModalProps {
  showModal: boolean;
}

export function CliAuthModal({ showModal }: CliAuthModalProps) {
  if (!showModal) return null;

  return (
    <AuthModal 
      isOpen={true} 
      onClose={() => {}} // Don't allow closing during CLI auth flow
    />
  );
}