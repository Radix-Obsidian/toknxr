
'use client';

import React from 'react';

interface WorthItBadgeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
}

const getWorthItColor = (score: number) => {
  if (score >= 80) return 'bg-green-100 text-green-800';
  if (score >= 60) return 'bg-yellow-100 text-yellow-800';
  return 'bg-red-100 text-red-800';
};

export function WorthItBadge({ score, size = 'md' }: WorthItBadgeProps) {
  const colorClass = getWorthItColor(score);
  const sizeClass = size === 'sm' ? 'px-2 py-1 text-xs' : 'px-3 py-1.5 text-sm';

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full ${colorClass} ${sizeClass}`}
    >
      {score.toFixed(0)}
    </span>
  );
}
