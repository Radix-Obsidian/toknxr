'use client';

import React, { useState } from 'react';
import { supabase } from '@/supabase';
import { QualityRating } from '../_types/dashboard';

interface InteractionTrackerProps {
  onInteractionTracked?: () => void;
}

export function InteractionTracker({ onInteractionTracked }: InteractionTrackerProps) {
  const [status, setStatus] = useState('');

  const handleTrackInteraction = async (quality: QualityRating, hallucination: boolean) => {
    setStatus('Tracking interaction...');
    try {
      const dummyData = {
        provider: 'openai',
        model: 'gpt-4-turbo',
        promptTokens: Math.floor(Math.random() * 100) + 50, // 50-150
        completionTokens: Math.floor(Math.random() * 200) + 100, // 100-300
        totalTokens: 350, // This should be calculated based on the above
        costUSD: Math.random() * 0.01, // Random cost up to 1 cent
        taskType: 'dashboard-test',
        qualityRating: quality,
        hallucination: hallucination,
      };
      dummyData.totalTokens = dummyData.promptTokens + dummyData.completionTokens;

      const { error } = await supabase.functions.invoke('track-interaction', { body: dummyData });
      if (error) throw error;

      setStatus(`Successfully tracked a '${quality}' interaction.`);
      onInteractionTracked?.();
    } catch (error: any) {
      setStatus(`Error: ${error.message}`);
    }
  };

  return (
    <div className="mt-8 p-8 bg-white border-4 border-dashed border-gray-200 rounded-lg text-center">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Track New Interactions</h2>
      <div className="mt-6 space-x-4">
        <button 
          onClick={() => handleTrackInteraction('useful', false)} 
          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
        >
          Track Useful
        </button>
        <button 
          onClick={() => handleTrackInteraction('partial', false)} 
          className="bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600"
        >
          Track Partial
        </button>
        <button 
          onClick={() => handleTrackInteraction('wasted', false)} 
          className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
        >
          Track Wasted
        </button>
        <button 
          onClick={() => handleTrackInteraction('useful', true)} 
          className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700"
        >
          Track Hallucination
        </button>
      </div>
      {status && <p className="mt-4 text-sm text-gray-600">{status}</p>}
    </div>
  );
}