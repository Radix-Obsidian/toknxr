import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { StatsCards } from '../StatsCards';
import { DashboardStats, Interaction } from '../../_types';

// Mock data for testing
const mockStats: DashboardStats = {
  totalCost: 12.3456,
  wasteRate: 15.7,
  hallucinationFreq: 3.2,
};

const mockInteractions: Interaction[] = [
  {
    id: '1',
    provider: 'openai',
    model: 'gpt-4',
    promptTokens: 100,
    completionTokens: 200,
    totalTokens: 300,
    costUSD: 0.01,
    taskType: 'coding',
    qualityRating: 'useful',
    hallucination: false,
    timestamp: new Date('2024-01-01'),
    codeQualityScore: 85,
    effectivenessScore: 90,
  },
];

describe('StatsCards', () => {
  it('renders all stat cards with correct values', () => {
    render(<StatsCards stats={mockStats} interactions={mockInteractions} />);

    // Check if all cards are rendered
    expect(screen.getByText('Total Cost')).toBeInTheDocument();
    expect(screen.getByText('Waste Rate')).toBeInTheDocument();
    expect(screen.getByText('Hallucination Freq.')).toBeInTheDocument();

    // Check if values are formatted correctly
    expect(screen.getByText('$12.3456')).toBeInTheDocument();
    expect(screen.getByText('15.7%')).toBeInTheDocument();
    expect(screen.getByText('3.2%')).toBeInTheDocument();
  });

  it('handles zero values correctly', () => {
    const zeroStats: DashboardStats = {
      totalCost: 0,
      wasteRate: 0,
      hallucinationFreq: 0,
    };

    render(<StatsCards stats={zeroStats} interactions={mockInteractions} />);

    expect(screen.getByText('$0.0000')).toBeInTheDocument();
    expect(screen.getByText('0.0%')).toBeInTheDocument();
  });

  it('formats decimal places correctly', () => {
    const preciseStats: DashboardStats = {
      totalCost: 0.123456789,
      wasteRate: 99.999,
      hallucinationFreq: 0.1,
    };

    render(<StatsCards stats={preciseStats} interactions={mockInteractions} />);

    expect(screen.getByText('$0.1235')).toBeInTheDocument(); // 4 decimal places
    expect(screen.getByText('100.0%')).toBeInTheDocument(); // 1 decimal place
    expect(screen.getByText('0.1%')).toBeInTheDocument(); // 1 decimal place
  });
});
