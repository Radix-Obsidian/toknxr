import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { InteractionHistory } from '../InteractionHistory';
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
    taskType: 'test',
    qualityRating: 'useful',
    hallucination: false,
    timestamp: new Date(),
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
    timestamp: new Date(),
  },
];

describe('InteractionHistory', () => {
  it('renders table headers correctly', () => {
    render(<InteractionHistory interactions={[]} />);

    expect(screen.getByText('Model')).toBeInTheDocument();
    expect(screen.getByText('Total Tokens')).toBeInTheDocument();
    expect(screen.getByText('Cost (USD)')).toBeInTheDocument();
    expect(screen.getByText('Quality')).toBeInTheDocument();
    expect(screen.getByText('Hallucination')).toBeInTheDocument();
  });

  it('renders interaction data correctly', () => {
    render(<InteractionHistory interactions={mockInteractions} />);

    // Check first interaction
    expect(screen.getByText('gpt-4')).toBeInTheDocument();
    expect(screen.getByText('300')).toBeInTheDocument();
    expect(screen.getByText('0.010000')).toBeInTheDocument();
    expect(screen.getByText('useful')).toBeInTheDocument();
    expect(screen.getByText('No')).toBeInTheDocument();

    // Check second interaction
    expect(screen.getByText('claude-3')).toBeInTheDocument();
    expect(screen.getByText('400')).toBeInTheDocument();
    expect(screen.getByText('0.020000')).toBeInTheDocument();
    expect(screen.getByText('partial')).toBeInTheDocument();
    expect(screen.getByText('Yes')).toBeInTheDocument();
  });

  it('handles empty interactions list', () => {
    render(<InteractionHistory interactions={[]} />);

    // Should still render headers but no data rows
    expect(screen.getByText('Interaction History')).toBeInTheDocument();
    expect(screen.getByRole('table')).toBeInTheDocument();

    // Should not have any data rows
    const rows = screen.getAllByRole('row');
    expect(rows).toHaveLength(1); // Only header row
  });

  it('formats cost with 6 decimal places', () => {
    const interactionWithPreciseCost: Interaction[] = [
      {
        ...mockInteractions[0],
        costUSD: 0.123456789,
      },
    ];

    render(<InteractionHistory interactions={interactionWithPreciseCost} />);
    expect(screen.getByText('0.123457')).toBeInTheDocument();
  });
});
