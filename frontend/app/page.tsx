'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Stethoscope, Users, LogOut } from 'lucide-react';
import { useAuth } from '@/lib/useAuth';

export default function Home() {
  const router = useRouter();
  const { user, isAuthenticated, logout, loading } = useAuth();

  useEffect(() => {
    // If authenticated, redirect to appropriate dashboard
    if (isAuthenticated && user) {
      router.push(user.role === 'doctor' ? '/doctor' : '/patient');
    }
  }, [isAuthenticated, user, router]);

  const handleLogout = async () => {
    await logout();
    router.refresh();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <p className="text-white">Loading...</p>
      </div>
    );
  }

  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
        <p className="text-white">Redirecting...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex flex-col items-center justify-center p-4">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold text-white mb-4">ClinSight AI</h1>
        <p className="text-xl text-slate-300">Agentic Clinical Intelligence Platform</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 w-full max-w-2xl mb-12">
        {/* Doctor Dashboard */}
        <Link href="/doctor">
          <div className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl hover:scale-105 transition-all cursor-pointer h-full">
            <div className="flex justify-center mb-6">
              <div className="bg-cyan-600 p-4 rounded-full">
                <Stethoscope size={40} className="text-white" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-3 text-center">Doctor Dashboard</h2>
            <p className="text-slate-600 text-center mb-6">
              Access 60-second pre-consultation briefs, drug interactions, lab trends, and AI-powered clinical insights.
            </p>
            <div className="bg-cyan-50 border border-cyan-200 rounded p-4 text-sm text-slate-700">
              <p className="font-semibold mb-2">Enter Patient ID to access:</p>
              <ul className="text-xs space-y-1">
                <li>✓ Pre-consultation brief</li>
                <li>✓ Clinical flags &amp; triage</li>
                <li>✓ Drug interactions</li>
                <li>✓ Lab trends</li>
                <li>✓ Visit history</li>
                <li>✓ AI assistant</li>
              </ul>
            </div>
          </div>
        </Link>

        {/* Patient Portal */}
        <Link href="/patient">
          <div className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl hover:scale-105 transition-all cursor-pointer h-full">
            <div className="flex justify-center mb-6">
              <div className="bg-emerald-600 p-4 rounded-full">
                <Users size={40} className="text-white" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-3 text-center">Patient Portal</h2>
            <p className="text-slate-600 text-center mb-6">
              Book appointments, check health summary, get test reminders, and chat with AI receptionist.
            </p>
            <div className="bg-emerald-50 border border-emerald-200 rounded p-4 text-sm text-slate-700">
              <p className="font-semibold mb-2">Type &quot;hey&quot; to access:</p>
              <ul className="text-xs space-y-1">
                <li>✓ Book appointment</li>
                <li>✓ Hospital info</li>
                <li>✓ Health summary</li>
                <li>✓ Test reminders</li>
                <li>✓ Emergency contacts</li>
                <li>✓ AI receptionist</li>
              </ul>
            </div>
          </div>
        </Link>
      </div>

      <div className="flex gap-4 mb-8">
        <Link href="/auth/login">
          <button className="bg-cyan-600 hover:bg-cyan-700 text-white font-semibold px-6 py-2 rounded-lg transition">
            Login
          </button>
        </Link>
        <Link href="/auth/signup">
          <button className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-2 rounded-lg transition">
            Sign Up
          </button>
        </Link>
      </div>

      <div className="text-center text-slate-400 text-sm">
        <p>Demo Patient IDs: P001, P002, P003</p>
      </div>
    </div>
  );
}
