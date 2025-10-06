'use client';

import React from 'react';
import { TrackerNav, TrackerForm, TrackerResults } from './_components';
import { useTrackerForm } from './_hooks';

export default function TrackerPage() {
  const {
    formData,
    result,
    error,
    isSubmitting,
    handleInputChange,
    submitForm,
    resetForm,
  } = useTrackerForm();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitForm();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <TrackerNav />
      
      <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">AI Interaction Tracker</h2>
            <p className="mt-2 text-gray-600">
              Track and analyze AI interactions for cost and quality monitoring.
            </p>
          </div>

          <TrackerForm
            formData={formData}
            isSubmitting={isSubmitting}
            onInputChange={handleInputChange}
            onSubmit={handleSubmit}
            onReset={resetForm}
          />

          <TrackerResults result={result} error={error} />
        </div>
      </main>
    </div>
  );
}