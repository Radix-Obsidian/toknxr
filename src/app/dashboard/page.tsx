'use client';

import React, { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { UserMenu } from '@/components/auth/UserMenu';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app, db } from '@/firebase';
import { useAuth } from '@/hooks/useAuth';
import { collection, query, onSnapshot, orderBy, DocumentData } from 'firebase/firestore';

export default function DashboardPage() {
  const { user } = useAuth();
  const [status, setStatus] = useState('');
  const [interactions, setInteractions] = useState<DocumentData[]>([]);
  const [stats, setStats] = useState({ totalCost: 0, wasteRate: 0, hallucinationFreq: 0 });

  useEffect(() => {
    if (user) {
      const q = query(
        collection(db, 'users', user.uid, 'interactions'),
        orderBy('timestamp', 'desc')
      );
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const interactionsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
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
      });
      return () => unsubscribe();
    }
  }, [user]);

  const handleTrackInteraction = async (quality: 'useful' | 'partial' | 'wasted', hallucination: boolean) => {
    setStatus('Tracking interaction...');
    try {
      const functions = getFunctions(app);
      const trackInteraction = httpsCallable(functions, 'trackInteraction');
      
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

      await trackInteraction(dummyData);
      setStatus(`Successfully tracked a '${quality}' interaction.`);
    } catch (error: any) {
      setStatus(`Error: ${error.message}`);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-sm border-b">
          {/* ... nav content ... */}
        </nav>

        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {/* --- Statistics Cards --- */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <dt className="text-sm font-medium text-gray-500 truncate">Total Cost</dt>
                <dd className="mt-1 text-3xl font-semibold text-gray-900">${stats.totalCost.toFixed(4)}</dd>
              </div>
            </div>
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <dt className="text-sm font-medium text-gray-500 truncate">Waste Rate</dt>
                <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats.wasteRate.toFixed(1)}%</dd>
              </div>
            </div>
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <dt className="text-sm font-medium text-gray-500 truncate">Hallucination Freq.</dt>
                <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats.hallucinationFreq.toFixed(1)}%</dd>
              </div>
            </div>
          </div>

          {/* --- Dummy Interaction Buttons --- */}
          <div className="mt-8 p-8 bg-white border-4 border-dashed border-gray-200 rounded-lg text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Track New Interactions</h2>
            <div className="mt-6 space-x-4">
              <button onClick={() => handleTrackInteraction('useful', false)} className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">Track Useful</button>
              <button onClick={() => handleTrackInteraction('partial', false)} className="bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600">Track Partial</button>
              <button onClick={() => handleTrackInteraction('wasted', false)} className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700">Track Wasted</button>
              <button onClick={() => handleTrackInteraction('useful', true)} className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700">Track Hallucination</button>
            </div>
            {status && <p className="mt-4 text-sm text-gray-600">{status}</p>}
          </div>

          {/* --- Interaction History Table --- */}
          <div className="mt-8">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Interaction History</h3>
            <div className="mt-4 border-t border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Model</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Tokens</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cost (USD)</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quality</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hallucination</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {interactions.map((interaction) => (
                    <tr key={interaction.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{interaction.model}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{interaction.totalTokens}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{interaction.costUSD?.toFixed(6)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{interaction.qualityRating}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{interaction.hallucination ? 'Yes' : 'No'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}