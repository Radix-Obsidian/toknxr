'use client';

import { useState } from 'react';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app } from '../../firebase'; // Assuming your firebase config is in src/firebase.ts

const TrackerPage = () => {
  const [formData, setFormData] = useState({
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
  });
  const [result, setResult] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const { checked } = e.target as HTMLInputElement;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResult('');
    setError('');

    try {
      const functions = getFunctions(app);
      // In development, connect to the functions emulator
      if (process.env.NODE_ENV === 'development') {
        // functions.useEmulator('localhost', 5001);
      }
      const trackInteraction = httpsCallable(functions, 'trackInteraction');
      const response = await trackInteraction(formData);
      setResult(JSON.stringify(response.data, null, 2));
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '2rem' }}>
      <h1>AI Interaction Tracker</h1>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <label>Provider:</label>
          <select name="provider" value={formData.provider} onChange={handleChange}>
            <option value="openai">OpenAI</option>
            <option value="anthropic">Anthropic</option>
            <option value="ollama">Ollama</option>
          </select>
        </div>
        <div>
          <label>Model:</label>
          <input type="text" name="model" value={formData.model} onChange={handleChange} />
        </div>
        <div>
          <label>Prompt Tokens:</label>
          <input type="number" name="promptTokens" value={formData.promptTokens} onChange={handleChange} />
        </div>
        <div>
          <label>Completion Tokens:</label>
          <input type="number" name="completionTokens" value={formData.completionTokens} onChange={handleChange} />
        </div>
        <div>
          <label>Total Tokens:</label>
          <input type="number" name="totalTokens" value={formData.totalTokens} onChange={handleChange} />
        </div>
        <div>
          <label>Cost (USD):</label>
          <input type="number" step="0.0001" name="costUSD" value={formData.costUSD} onChange={handleChange} />
        </div>
        <div>
          <label>Task Type:</label>
          <input type="text" name="taskType" value={formData.taskType} onChange={handleChange} />
        </div>
        <div>
          <label>Quality Rating:</label>
          <select name="qualityRating" value={formData.qualityRating} onChange={handleChange}>
            <option value="useful">Useful</option>
            <option value="partial">Partial</option>
            <option value="wasted">Wasted</option>
          </select>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <label>Error Detected:</label>
          <input type="checkbox" name="errorDetected" checked={formData.errorDetected} onChange={handleChange} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <label>Hallucination:</label>
          <input type="checkbox" name="hallucination" checked={formData.hallucination} onChange={handleChange} />
        </div>
        <button type="submit" style={{ padding: '0.5rem 1rem', cursor: 'pointer' }}>Track Interaction</button>
      </form>
      {result && (
        <div style={{ marginTop: '1rem' }}>
          <h2>Success!</h2>
          <pre style={{ background: '#eee', padding: '1rem' }}>{result}</pre>
        </div>
      )}
      {error && (
        <div style={{ marginTop: '1rem', color: 'red' }}>
          <h2>Error</h2>
          <p>{error}</p>
        </div>
      )}
    </div>
  );
};

export default TrackerPage;
