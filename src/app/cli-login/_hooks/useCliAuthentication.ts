'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/supabase';
import { useAuth } from '@/hooks/useAuth';
import axios from 'axios';
import { CliLoginState, CliTokenExchangeResponse } from '../_types/cli-login';

export function useCliAuthentication() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const [state, setState] = useState<CliLoginState>({
    message: 'Please log in to connect your account to the TokNxr CLI.',
    isComplete: false,
    isLoading: false,
  });

  useEffect(() => {
    const sendTokenToCli = async () => {
      if (user && !state.isComplete && !state.isLoading) {
        setState(prev => ({
          ...prev,
          message: 'Login successful! Exchanging token for CLI...',
          isLoading: true,
        }));

        const port = searchParams.get('port');
        if (!port) {
          setState(prev => ({
            ...prev,
            message: 'Error: CLI callback port not found.',
            error: 'Missing port parameter',
            isLoading: false,
          }));
          return;
        }

        try {
          // Call the Supabase Edge Function to exchange ID token for Custom Token
          const { data, error } = await supabase.functions.invoke('exchange-id-for-token');
          if (error) throw error;
          const customToken = (data as CliTokenExchangeResponse).customToken;

          // Send the Custom Token to the CLI's local server
          await axios.post(`http://localhost:${port}/token`, { token: customToken });
          
          setState(prev => ({
            ...prev,
            message: 'CLI authentication successful! You can now close this window.',
            isComplete: true,
            isLoading: false,
          }));
        } catch (error) {
          console.error('CLI token passing error:', error);
          setState(prev => ({
            ...prev,
            message: 'Error: Could not connect to the CLI or exchange token. Please try running the login command again.',
            error: error instanceof Error ? error.message : 'Unknown error',
            isLoading: false,
          }));
        }
      }
    };

    sendTokenToCli();
  }, [user, searchParams, state.isComplete, state.isLoading]);

  return {
    ...state,
    user,
    hasUser: !!user,
  };
}