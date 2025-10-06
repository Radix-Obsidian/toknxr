import React from 'react';
import { render, screen } from '@testing-library/react';
import { ModelComparisonTable } from '../ModelComparisonTable';
import { Interaction } from '../../_types';

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
  {
    id: '2',
    provider: 'anthropic',
    model: 'claude-3',
    promptTokens: 150,
    completionTokens: 250,
    totalTokens: 400,
    costUSD: 0.02,
    taskType: 'analysis',
    qualityRating: 'partial',
    hallucination: true,
    timestamp: new Date('2024-01-02'),
    codeQualityScore: 70,
    effectivenessScore: 75,
  },
  {
    id: '3',
    provider: 'openai',
    model: 'gpt-4',
    promptTokens: 120,
    completionTokens: 180,
    totalTokens: 300,
    costUSD: 0.015,
    taskType: 'coding',
    qualityRating: 'useful',
    hallucination: false,
    timestamp: new Date('2024-01-03'),
    codeQualityScore: 92,
    effectivenessScore: 88,
  },
];

describe('ModelComparisonTable', () => {
  it('renders table headers correctly', () => {
    render(<ModelComparisonTable interactions={mockInteractions} />);

    expect(screen.getByText('Model Comparison')).toBeInTheDocument();
    expect(screen.getByText('Model')).toBeInTheDocument();
    expect(screen.getByText('Usage')).toBeInTheDocument();
    expect(screen.getByText('Quality Score')).toBeInTheDocument();
    expect(screen.getByText('Effectiveness')).toBeInTheDocument();
    expect(screen.getByText('Cost Efficiency')).toBeInTheDocument();
    expect(screen.getByText('Hallucinations')).toBeInTheDocument();
    expect(screen.getByText('Quality Distribution')).toBeInTheDocument();
  });

  it('aggregates data correctly for same model', () => {
    render(<ModelComparisonTable interactions={mockInteractions} />);

    // Should show gpt-4 with 2 interactions
    expect(screen.getByText('2 interactions')).toBeInTheDocument();
    // Should show claude-3 with 1 interaction
    expect(screen.getByText('1 interactions')).toBeInTheDocument();
  });

  it('calculates average quality scores correctly', () => {
    render(<ModelComparisonTable interactions={mockInteractions} />);

    // For gpt-4: (85 + 92) / 2 = 88.5 → 89 (rounded)
    // For claude-3: 70
    expect(screen.getByText('Good (89)')).toBeInTheDocument();
    expect(screen.getByText('Fair (70)')).toBeInTheDocument();
  });

  it('shows provider badges with correct performance levels', () => {
    render(<ModelComparisonTable interactions={mockInteractions} />);

    expect(screen.getByText('openai')).toBeInTheDocument();
    expect(screen.getByText('anthropic')).toBeInTheDocument();
  });

  it('displays cost information correctly', () => {
    render(<ModelComparisonTable interactions={mockInteractions} />);

    // Should show cost badges and per-token costs
    expect(screen.getByText(/\$0\./)).toBeInTheDocument();
  });

  it('shows hallucination detection results', () => {
    render(<ModelComparisonTable interactions={mockInteractions} />);

    // Should show hallucination badges
    expect(screen.getByText('None')).toBeInTheDocument();
    expect(screen.getByText('Detected (50%)')).toBeInTheDocument();
  });

  it('displays quality distribution correctly', () => {
    render(<ModelComparisonTable interactions={mockInteractions} />);

    // Should show quality distribution badges (E=Excellent, G=Good, F=Fair, P=Poor)
    expect(screen.getByText('1E')).toBeInTheDocument(); // gpt-4 has one excellent score (92)
    expect(screen.getByText('1G')).toBeInTheDocument(); // gpt-4 has one good score (85)
  });

  it('handles empty interactions gracefully', () => {
    render(<ModelComparisonTable interactions={[]} />);

    expect(screen.getByText('Model Comparison')).toBeInTheDocument();
    expect(screen.getByText('No interaction data available for model comparison.')).toBeInTheDocument();
  });

  it('sorts models by interaction count', () => {
    render(<ModelComparisonTable interactions={mockInteractions} />);

    const rows = screen.getAllByRole('row');
    // First row should be header, second should be gpt-4 (2 interactions), third should be claude-3 (1 interaction)
    expect(rows[1]).toHaveTextContent('gpt-4');
    expect(rows[2]).toHaveTextContent('claude-3');
  });

  it('shows summary footer with correct totals', () => {
    render(<ModelComparisonTable interactions={mockInteractions} />);

    expect(screen.getByText('Showing 2 models across 2 providers')).toBeInTheDocument();
    expect(screen.getByText('Total: 3 interactions')).toBeInTheDocument();
  });

  it('applies alternating row colors', () => {
    render(<ModelComparisonTable interactions={mockInteractions} />);

    const rows = screen.getAllByRole('row');
    // Check that rows have alternating background colors
    expect(rows[1]).toHaveClass('bg-white');
    expect(rows[2]).toHaveClass('bg-gray-50');
  });
});