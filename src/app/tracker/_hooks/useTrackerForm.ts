'use client';

import { useState } from 'react';
import { supabase } from '@/supabase';
import { TrackerFormData, TrackerState } from '../_types/tracker';

const initialFormData: TrackerFormData = {
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

export function useTrackerForm() {
  const [state, setState] = useState<TrackerState>({
    formData: initialFormData,
    result: '',
    error: '',
    isSubmitting: false,
  });

  const updateFormData = (field: keyof TrackerFormData, value: any) => {
    setState(prev => ({
      ...prev,
      formData: {
        ...prev.formData,
        [field]: value,
      },
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const { checked } = e.target as HTMLInputElement;
      updateFormData(name as keyof TrackerFormData, checked);
    } else if (type === 'number') {
      updateFormData(name as keyof TrackerFormData, parseFloat(value) || 0);
    } else {
      updateFormData(name as keyof TrackerFormData, value);
    }
  };

  const submitForm = async () => {
    setState(prev => ({ ...prev, result: '', error: '', isSubmitting: true }));

    try {
      const { data, error } = await supabase.functions.invoke('track-interaction', { body: state.formData });
      if (error) throw error;

      setState(prev => ({
        ...prev,
        result: JSON.stringify(data, null, 2),
        isSubmitting: false,
      }));
    } catch (err: any) {
      setState(prev => ({
        ...prev,
        error: err.message || 'An error occurred while tracking the interaction',
        isSubmitting: false,
      }));
    }
  };

  const resetForm = () => {
    setState({
      formData: initialFormData,
      result: '',
      error: '',
      isSubmitting: false,
    });
  };

  return {
    ...state,
    handleInputChange,
    submitForm,
    resetForm,
    updateFormData,
  };
}