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

  const updateFormData = (field: keyof TrackerFormData, value: string | number | boolean) => {
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
      // First, find the AI service
      const { data: aiService, error: aiError } = await supabase
        .from('ai_services')
        .select('id')
        .eq('provider', state.formData.provider)
        .eq('name', state.formData.model)
        .single();

      if (aiError || !aiService) {
        throw new Error('AI service not found for the selected provider and model');
      }

      // Get the user's project (assuming they have at least one)
      const { data: projects, error: projError } = await supabase
        .from('projects')
        .select('id')
        .limit(1);

      if (projError || !projects || projects.length === 0) {
        throw new Error('No projects found. Please create a project first.');
      }

      const projectId = projects[0].id;

      // Transform form data to match Edge Function expectations
      const interactionData = {
        project_id: projectId,
        ai_service_id: aiService.id,
        tokens_used: state.formData.totalTokens,
        cost_in_cents: Math.round(state.formData.costUSD * 100),
        request_details: `Task: ${state.formData.taskType}, Quality: ${state.formData.qualityRating}, Error: ${state.formData.errorDetected}, Hallucination: ${state.formData.hallucination}`,
        response_details: `Prompt tokens: ${state.formData.promptTokens}, Completion tokens: ${state.formData.completionTokens}`
      };

      const { data, error } = await supabase.functions.invoke('track-interaction', { body: interactionData });
      if (error) throw error;

      setState(prev => ({
        ...prev,
        result: JSON.stringify(data, null, 2),
        isSubmitting: false,
      }));
    } catch (err: unknown) {
      setState(prev => ({
        ...prev,
        error: err instanceof Error ? err.message : 'An error occurred while tracking the interaction',
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