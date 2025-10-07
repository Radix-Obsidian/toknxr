import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { CliAuthStatus } from '../CliAuthStatus';
import { CliLoginState } from '../../_types';

describe('CliAuthStatus', () => {
  it('renders initial state correctly', () => {
    const state: CliLoginState = {
      message: 'Please log in to connect your account to the TokNxr CLI.',
      isComplete: false,
      isLoading: false,
    };

    render(<CliAuthStatus state={state} />);

    expect(screen.getByText('TokNxr CLI Authentication')).toBeInTheDocument();
    expect(
      screen.getByText('Please log in to connect your account to the TokNxr CLI.')
    ).toBeInTheDocument();
    expect(screen.queryByText('Success!')).not.toBeInTheDocument();
  });

  it('shows loading spinner when isLoading is true', () => {
    const state: CliLoginState = {
      message: 'Login successful! Exchanging token for CLI...',
      isComplete: false,
      isLoading: true,
    };

    render(<CliAuthStatus state={state} />);

    expect(screen.getByText('Login successful! Exchanging token for CLI...')).toBeInTheDocument();
    // Check for loading spinner (div with animate-spin class)
    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('shows error message when error exists', () => {
    const state: CliLoginState = {
      message: 'Error occurred',
      isComplete: false,
      isLoading: false,
      error: 'Missing port parameter',
    };

    render(<CliAuthStatus state={state} />);

    expect(screen.getByText('Missing port parameter')).toBeInTheDocument();
    // Check for error styling
    const errorDiv = screen.getByText('Missing port parameter').closest('div');
    expect(errorDiv).toHaveClass('bg-red-100', 'text-red-700');
  });

  it('shows success state when isComplete is true', () => {
    const state: CliLoginState = {
      message: 'CLI authentication successful! You can now close this window.',
      isComplete: true,
      isLoading: false,
    };

    render(<CliAuthStatus state={state} />);

    expect(screen.getByText('Success!')).toBeInTheDocument();
    expect(
      screen.getByText('You can now close this window and return to your terminal.')
    ).toBeInTheDocument();

    // Check for success styling
    const successDiv = screen.getByText('Success!').closest('div');
    expect(successDiv).toHaveClass('bg-green-100', 'text-green-800');

    // Check for checkmark icon
    const checkIcon = document.querySelector('svg');
    expect(checkIcon).toBeInTheDocument();
  });

  it('updates message content correctly', () => {
    const customMessage = 'Custom authentication message';
    const state: CliLoginState = {
      message: customMessage,
      isComplete: false,
      isLoading: false,
    };

    render(<CliAuthStatus state={state} />);

    expect(screen.getByText(customMessage)).toBeInTheDocument();
  });
});
