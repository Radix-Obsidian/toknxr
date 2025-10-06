import React from 'react';
import { render, screen } from '@testing-library/react';
import { 
  QualityBadge, 
  EffectivenessBadge, 
  HallucinationBadge, 
  ProviderBadge, 
  CostBadge 
} from '../QualityBadge';

describe('QualityBadge', () => {
  it('renders excellent quality badge for high scores', () => {
    render(<QualityBadge score={95} />);
    expect(screen.getByText('Excellent (95)')).toBeInTheDocument();
  });

  it('renders good quality badge for medium-high scores', () => {
    render(<QualityBadge score={80} />);
    expect(screen.getByText('Good (80)')).toBeInTheDocument();
  });

  it('renders fair quality badge for medium scores', () => {
    render(<QualityBadge score={65} />);
    expect(screen.getByText('Fair (65)')).toBeInTheDocument();
  });

  it('renders poor quality badge for low scores', () => {
    render(<QualityBadge score={40} />);
    expect(screen.getByText('Poor (40)')).toBeInTheDocument();
  });

  it('renders without score when showScore is false', () => {
    render(<QualityBadge score={85} showScore={false} />);
    expect(screen.getByText('Good')).toBeInTheDocument();
    expect(screen.queryByText('85')).not.toBeInTheDocument();
  });

  it('renders with custom level', () => {
    render(<QualityBadge level="excellent" showScore={false} />);
    expect(screen.getByText('Excellent')).toBeInTheDocument();
  });

  it('applies different variants correctly', () => {
    const { rerender } = render(<QualityBadge score={90} variant="outline" />);
    expect(screen.getByText('Excellent (90)')).toHaveClass('bg-transparent');

    rerender(<QualityBadge score={90} variant="solid" />);
    expect(screen.getByText('Excellent (90)')).toHaveClass('bg-green-600');
  });

  it('applies different sizes correctly', () => {
    const { rerender } = render(<QualityBadge score={90} size="sm" />);
    expect(screen.getByText('Excellent (90)')).toHaveClass('text-xs');

    rerender(<QualityBadge score={90} size="lg" />);
    expect(screen.getByText('Excellent (90)')).toHaveClass('text-base');
  });
});

describe('EffectivenessBadge', () => {
  it('renders effectiveness badge with score', () => {
    render(<EffectivenessBadge score={88} />);
    expect(screen.getByText('Good (88)')).toBeInTheDocument();
  });
});

describe('HallucinationBadge', () => {
  it('renders detected hallucination with confidence', () => {
    render(<HallucinationBadge detected={true} confidence={75} />);
    expect(screen.getByText('Detected (75%)')).toBeInTheDocument();
  });

  it('renders detected hallucination without confidence', () => {
    render(<HallucinationBadge detected={true} />);
    expect(screen.getByText('Detected')).toBeInTheDocument();
  });

  it('renders no hallucination', () => {
    render(<HallucinationBadge detected={false} />);
    expect(screen.getByText('None')).toBeInTheDocument();
  });
});

describe('ProviderBadge', () => {
  it('renders provider name with performance level', () => {
    render(<ProviderBadge provider="OpenAI" performance="high" />);
    expect(screen.getByText('OpenAI')).toBeInTheDocument();
  });

  it('applies correct styling for different performance levels', () => {
    const { rerender } = render(<ProviderBadge provider="OpenAI" performance="high" />);
    expect(screen.getByText('OpenAI')).toHaveClass('border-green-500');

    rerender(<ProviderBadge provider="OpenAI" performance="low" />);
    expect(screen.getByText('OpenAI')).toHaveClass('border-yellow-500');
  });
});

describe('CostBadge', () => {
  it('renders cost with efficiency level', () => {
    render(<CostBadge cost={0.0123} efficiency="high" />);
    expect(screen.getByText('$0.0123')).toBeInTheDocument();
  });

  it('formats cost to 4 decimal places', () => {
    render(<CostBadge cost={0.123456789} efficiency="medium" />);
    expect(screen.getByText('$0.1235')).toBeInTheDocument();
  });
});