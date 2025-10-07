import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { TrackerForm } from '../TrackerForm';
import { TrackerFormData } from '../../_types';

const mockFormData: TrackerFormData = {
  provider: 'openai',
  model: 'gpt-4',
  promptTokens: 100,
  completionTokens: 200,
  totalTokens: 300,
  costUSD: 0.01,
  taskType: 'test',
  qualityRating: 'useful',
  errorDetected: false,
  hallucination: false,
};

const mockProps = {
  formData: mockFormData,
  isSubmitting: false,
  onInputChange: jest.fn(),
  onSubmit: jest.fn(),
  onReset: jest.fn(),
};

describe('TrackerForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all form fields with correct values', () => {
    render(<TrackerForm {...mockProps} />);

    // Check select fields
    expect(screen.getByDisplayValue('openai')).toBeInTheDocument();
    expect(screen.getByDisplayValue('useful')).toBeInTheDocument();

    // Check text inputs
    expect(screen.getByDisplayValue('gpt-4')).toBeInTheDocument();
    expect(screen.getByDisplayValue('test')).toBeInTheDocument();

    // Check number inputs
    expect(screen.getByDisplayValue('100')).toBeInTheDocument();
    expect(screen.getByDisplayValue('200')).toBeInTheDocument();
    expect(screen.getByDisplayValue('300')).toBeInTheDocument();
    expect(screen.getByDisplayValue('0.01')).toBeInTheDocument();

    // Check checkboxes
    const errorCheckbox = screen.getByRole('checkbox', { name: /error detected/i });
    const hallucinationCheckbox = screen.getByRole('checkbox', { name: /hallucination/i });
    expect(errorCheckbox).not.toBeChecked();
    expect(hallucinationCheckbox).not.toBeChecked();
  });

  it('calls onInputChange when form fields are modified', () => {
    render(<TrackerForm {...mockProps} />);

    // Test text input change
    const modelInput = screen.getByDisplayValue('gpt-4');
    fireEvent.change(modelInput, { target: { value: 'gpt-3.5-turbo' } });
    expect(mockProps.onInputChange).toHaveBeenCalled();

    // Test select change
    fireEvent.change(screen.getByDisplayValue('openai'), { target: { value: 'anthropic' } });
    expect(mockProps.onInputChange).toHaveBeenCalled();

    // Test checkbox change
    const errorCheckbox = screen.getByRole('checkbox', { name: /error detected/i });
    fireEvent.click(errorCheckbox);
    expect(mockProps.onInputChange).toHaveBeenCalled();
  });

  it('calls onSubmit when form is submitted', () => {
    render(<TrackerForm {...mockProps} />);

    const submitButton = screen.getByRole('button', { name: /track interaction/i });
    fireEvent.click(submitButton);

    expect(mockProps.onSubmit).toHaveBeenCalled();
  });

  it('calls onReset when reset button is clicked', () => {
    render(<TrackerForm {...mockProps} />);

    const resetButton = screen.getByRole('button', { name: /reset/i });
    fireEvent.click(resetButton);

    expect(mockProps.onReset).toHaveBeenCalled();
  });

  it('shows loading state when isSubmitting is true', () => {
    const submittingProps = { ...mockProps, isSubmitting: true };
    render(<TrackerForm {...submittingProps} />);

    expect(screen.getByText('Tracking...')).toBeInTheDocument();

    const submitButton = screen.getByRole('button', { name: /tracking/i });
    expect(submitButton).toBeDisabled();

    // Check for loading spinner
    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('renders all provider options', () => {
    render(<TrackerForm {...mockProps} />);

    const providerSelect = screen.getByDisplayValue('openai'); // eslint-disable-line @typescript-eslint/no-unused-vars

    // Check that all options are present
    expect(screen.getByRole('option', { name: 'OpenAI' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Anthropic' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Ollama' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Gemini' })).toBeInTheDocument();
  });

  it('renders all quality rating options', () => {
    render(<TrackerForm {...mockProps} />);

    expect(screen.getByRole('option', { name: 'Useful' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Partial' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Wasted' })).toBeInTheDocument();
  });

  it('has proper form labels', () => {
    render(<TrackerForm {...mockProps} />);

    expect(screen.getByText('Provider')).toBeInTheDocument();
    expect(screen.getByText('Model')).toBeInTheDocument();
    expect(screen.getByText('Prompt Tokens')).toBeInTheDocument();
    expect(screen.getByText('Completion Tokens')).toBeInTheDocument();
    expect(screen.getByText('Total Tokens')).toBeInTheDocument();
    expect(screen.getByText('Cost (USD)')).toBeInTheDocument();
    expect(screen.getByText('Task Type')).toBeInTheDocument();
    expect(screen.getByText('Quality Rating')).toBeInTheDocument();
    expect(screen.getByText('Error Detected')).toBeInTheDocument();
    expect(screen.getByText('Hallucination')).toBeInTheDocument();
  });
});
