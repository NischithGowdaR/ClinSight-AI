'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';

interface PatientSearchProps {
  onSearch: (patientId: string) => void;
  loading: boolean;
}

export default function PatientSearch({ onSearch, loading }: PatientSearchProps) {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onSearch(input.trim());
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg border border-slate-200 p-8">
        <h2 className="text-3xl font-bold text-slate-900 mb-2 text-center">Enter Patient ID</h2>
        <p className="text-slate-600 text-center mb-8">
          Search for a patient to generate their pre-consultation brief and access clinical data.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-3 text-slate-400" size={20} />
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value.toUpperCase())}
              placeholder="e.g., P001, P002, P003"
              className="w-full pl-12 pr-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-cyan-600 text-lg font-semibold"
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="w-full bg-cyan-600 text-white py-3 px-4 rounded-lg hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed font-bold transition-colors"
          >
            {loading ? 'Searching...' : 'Search Patient'}
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-slate-200">
          <p className="text-sm font-semibold text-slate-900 mb-4">Available Demo Patients:</p>
          <div className="space-y-3">
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="font-semibold text-slate-900">P001 - Rajesh Kumar</p>
              <p className="text-sm text-slate-600">62yo, Type 2 Diabetes, Hypertension, CKD Stage 3</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
              <p className="font-semibold text-slate-900">P002 - Priya Nair</p>
              <p className="text-sm text-slate-600">45yo, Asthma (Intermittent), Allergic Rhinitis</p>
            </div>
            <div className="p-3 bg-red-50 rounded-lg border border-red-200">
              <p className="font-semibold text-slate-900">P003 - Arjun Singh</p>
              <p className="text-sm text-slate-600">58yo, CAD, Post-MI, Heart Failure (HFrEF)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
