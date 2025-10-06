'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export type QualityLevel = 'excellent' | 'good' | 'fair' | 'poor' | 'unknown';
export type BadgeVariant = 'default' | 'outline' | 'solid';

interface QualityBadgeProps {
  score?: number;
  level?: QualityLevel;
  variant?: BadgeVariant;
  size?: 'sm' | 'md' | 'lg';
  showScore?: boolean;
  className?: string;
}

/**
 * Determine quality level from score
 */
function getQualityLevel(score: number): QualityLevel {
  if (score >= 90) return 'excellent';
  if (score >= 75) return 'good';
  if (score >= 60) return 'fair';
  if (score >= 0) return 'poor';
  return 'unknown';
}

/**
 * Get quality level display text
 */
function getQualityText(level: QualityLevel): string {
  const texts = {
    excellent: 'Excellent',
    good: 'Good',
    fair: 'Fair',
    poor: 'Poor',
    unknown: 'Unknown',
  };
  return texts[level];
}

/**
 * Get quality level colors and styles
 */
function getQualityStyles(level: QualityLevel, variant: BadgeVariant) {
  const styles = {
    excellent: {
      default: 'bg-green-100 text-green-800 border-green-200',
      outline: 'border-green-500 text-green-700 bg-transparent',
      solid: 'bg-green-600 text-white border-green-600',
    },
    good: {
      default: 'bg-blue-100 text-blue-800 border-blue-200',
      outline: 'border-blue-500 text-blue-700 bg-transparent',
      solid: 'bg-blue-600 text-white border-blue-600',
    },
    fair: {
      default: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      outline: 'border-yellow-500 text-yellow-700 bg-transparent',
      solid: 'bg-yellow-600 text-white border-yellow-600',
    },
    poor: {
      default: 'bg-red-100 text-red-800 border-red-200',
      outline: 'border-red-500 text-red-700 bg-transparent',
      solid: 'bg-red-600 text-white border-red-600',
    },
    unknown: {
      default: 'bg-gray-100 text-gray-800 border-gray-200',
      outline: 'border-gray-500 text-gray-700 bg-transparent',
      solid: 'bg-gray-600 text-white border-gray-600',
    },
  };

  return styles[level][variant];
}

/**
 * Get size styles
 */
function getSizeStyles(size: 'sm' | 'md' | 'lg') {
  const sizes = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base',
  };
  return sizes[size];
}

export function QualityBadge({
  score,
  level,
  variant = 'default',
  size = 'md',
  showScore = true,
  className,
}: QualityBadgeProps) {
  // Determine quality level from score or use provided level
  const qualityLevel = level || (score !== undefined ? getQualityLevel(score) : 'unknown');
  const qualityText = getQualityText(qualityLevel);
  const qualityStyles = getQualityStyles(qualityLevel, variant);
  const sizeStyles = getSizeStyles(size);

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border font-medium',
        qualityStyles,
        sizeStyles,
        className
      )}
    >
      {showScore && score !== undefined ? `${qualityText} (${score})` : qualityText}
    </span>
  );
}

/**
 * Specialized badge for effectiveness scores
 */
export function EffectivenessBadge({
  score,
  className,
  ...props
}: Omit<QualityBadgeProps, 'level'> & { score: number }) {
  return (
    <QualityBadge
      score={score}
      className={cn('bg-purple-100 text-purple-800 border-purple-200', className)}
      {...props}
    />
  );
}

/**
 * Specialized badge for hallucination detection
 */
export function HallucinationBadge({
  detected,
  confidence,
  className,
  ...props
}: Omit<QualityBadgeProps, 'score' | 'level'> & {
  detected: boolean;
  confidence?: number;
}) {
  const level: QualityLevel = detected ? 'poor' : 'excellent';
  const text = detected
    ? confidence
      ? `Detected (${confidence}%)`
      : 'Detected'
    : 'None';

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border font-medium',
        getQualityStyles(level, props.variant || 'default'),
        getSizeStyles(props.size || 'md'),
        className
      )}
    >
      {text}
    </span>
  );
}

/**
 * Provider performance badge
 */
export function ProviderBadge({
  provider,
  performance,
  className,
  ...props
}: Omit<QualityBadgeProps, 'score' | 'level'> & {
  provider: string;
  performance?: 'high' | 'medium' | 'low';
}) {
  const performanceLevel: QualityLevel =
    performance === 'high' ? 'excellent' : performance === 'medium' ? 'good' : 'fair';

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border font-medium',
        getQualityStyles(performanceLevel, props.variant || 'outline'),
        getSizeStyles(props.size || 'sm'),
        className
      )}
    >
      {provider}
    </span>
  );
}

/**
 * Cost efficiency badge
 */
export function CostBadge({
  cost,
  efficiency,
  className,
  ...props
}: Omit<QualityBadgeProps, 'score' | 'level'> & {
  cost: number;
  efficiency?: 'high' | 'medium' | 'low';
}) {
  const efficiencyLevel: QualityLevel =
    efficiency === 'high' ? 'excellent' : efficiency === 'medium' ? 'good' : 'poor';

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border font-medium',
        getQualityStyles(efficiencyLevel, props.variant || 'default'),
        getSizeStyles(props.size || 'sm'),
        className
      )}
    >
      ${cost.toFixed(4)}
    </span>
  );
}