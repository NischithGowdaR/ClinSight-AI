'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/useAuth';
import { Stethoscope, Users } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login, loading, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    try {
      const result = await login(email, password);
      // Redirect based on role - cookie is automatically set by fetch
      if (result) {
        // Use replace to avoid back button issues
        router.replace(result.role === 'doctor' ? '/doctor' : '/patient');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed';
      setLoginError(message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">ClinSight AI</h1>
          <p className="text-slate-400">Clinical Intelligence Platform</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-lg shadow-2xl p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">Login</h2>

          {loginError && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
              {loginError}
            </div>
          )}

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-cyan-600 hover:bg-cyan-700 disabled:bg-slate-400 text-white font-semibold py-2 rounded-lg transition mt-6"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <div className="mt-6 text-center text-slate-600 text-sm">
            Don&apos;t have an account?{' '}
            <Link href="/auth/signup" className="text-cyan-600 hover:underline font-semibold">
              Sign up
            </Link>
          </div>
        </div>

        {/* Demo Credentials */}
        <div className="mt-8 bg-slate-800 border border-slate-700 rounded-lg p-6">
          <h3 className="text-white font-semibold mb-3">Demo Credentials</h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <Stethoscope size={20} className="text-cyan-400 mt-0.5" />
              <div>
                <p className="text-slate-300">
                  <span className="font-mono bg-slate-700 px-2 py-1 rounded">dr.rajesh@clinsight.com</span>
                </p>
                <p className="text-slate-400">Password: <span className="font-mono">password123</span></p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Users size={20} className="text-emerald-400 mt-0.5" />
              <div>
                <p className="text-slate-300">
                  <span className="font-mono bg-slate-700 px-2 py-1 rounded">patient@clinsight.com</span>
                </p>
                <p className="text-slate-400">Password: <span className="font-mono">password123</span></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
