'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/supabase';
import { useAuth } from '@/hooks/useAuth';
import { DashboardStats, Interaction } from '../_types/dashboard';

export function useDashboardData() {
  const { user } = useAuth(); // This will need to be updated for Supabase Auth
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalCost: 0,
    wasteRate: 0,
    hallucinationFreq: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchInteractions = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      // Assuming 'interactions' is a table in Supabase and has a 'user_id' column
      const { data, error } = await supabase
        .from('interactions')
        .select('*')
        .eq('user_id', user.id) // Filter by user ID
        .order('timestamp', { ascending: false });

      if (error) {
        console.error('Error fetching interactions:', error);
        setLoading(false);
        return;
      }

      const interactionsData = (data || []) as Interaction[];
      setInteractions(interactionsData);

      // Calculate stats
      if (interactionsData.length > 0) {
        const totalCost = interactionsData.reduce((acc, curr) => acc + (curr.costUSD || 0), 0);
        const wastedCount = interactionsData.filter(i => i.qualityRating === 'wasted').length;
        const hallucinationCount = interactionsData.filter(i => i.hallucination === true).length;
        const wasteRate = (wastedCount / interactionsData.length) * 100;
        const hallucinationFreq = (hallucinationCount / interactionsData.length) * 100;

        setStats({ totalCost, wasteRate, hallucinationFreq });
      }
    } catch (err) {
      console.error('Unexpected error fetching interactions:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchInteractions();
  }, [fetchInteractions]);

  return {
    interactions,
    stats,
    loading,
    refetch: fetchInteractions,
  };
}