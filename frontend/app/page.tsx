'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Stethoscope,
  Users,
  Brain,
  Zap,
  Shield,
  CheckCircle,
  ArrowRight,
  TrendingUp,
  Heart,
  Clock,
} from 'lucide-react';
import { useAuth } from '@/lib/useAuth';

export default function Home() {
  const router = useRouter();
  const { user, isAuthenticated, loading } = useAuth();

  useEffect(() => {
    // If authenticated, redirect to appropriate dashboard
    if (isAuthenticated && user) {
      router.push(user.role === 'doctor' ? '/doctor' : '/patient');
    }
  }, [isAuthenticated, user, router]);

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
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-cyan-50 to-blue-50 py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent mb-6 leading-tight">
                AI-Powered Clinical Intelligence
              </h1>
              <p className="text-xl text-gray-700 mb-8 leading-relaxed">
                Transform healthcare delivery with actionable clinical insights. ClinSight AI connects doctors and patients with intelligent, data-driven recommendations in seconds.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/auth/signup?role=patient"
                  className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white px-8 py-4 rounded-lg font-semibold hover:shadow-lg transition flex items-center justify-center space-x-2"
                >
                  <span>For Patients</span>
                  <ArrowRight size={20} />
                </Link>
                <Link
                  href="/auth/signup?role=doctor"
                  className="border-2 border-cyan-600 text-cyan-600 px-8 py-4 rounded-lg font-semibold hover:bg-cyan-50 transition flex items-center justify-center space-x-2"
                >
                  <span>For Doctors</span>
                  <ArrowRight size={20} />
                </Link>
              </div>
              <p className="text-sm text-gray-600 mt-6">
                Already have an account? <Link href="/auth/login" className="text-cyan-600 font-semibold hover:underline">Login here</Link>
              </p>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-cyan-100 to-blue-100 rounded-2xl p-8 h-80 flex items-center justify-center">
                <div className="text-center">
                  <Brain size={80} className="text-cyan-600 mx-auto mb-4" />
                  <p className="text-gray-700 font-semibold">Intelligent Clinical Insights</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose ClinSight AI?</h2>
            <p className="text-xl text-gray-600">Revolutionizing healthcare with intelligent, AI-powered solutions</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {/* Feature 1 - For Doctors */}
            <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 p-8 rounded-xl hover:shadow-lg transition">
              <div className="bg-cyan-600 w-14 h-14 rounded-full flex items-center justify-center mb-4">
                <Stethoscope size={28} className="text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Doctor Dashboard</h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start space-x-2">
                  <CheckCircle size={20} className="text-cyan-600 flex-shrink-0 mt-1" />
                  <span>60-second pre-consultation briefs</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle size={20} className="text-cyan-600 flex-shrink-0 mt-1" />
                  <span>Drug interaction warnings</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle size={20} className="text-cyan-600 flex-shrink-0 mt-1" />
                  <span>Lab trends & clinical flags</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle size={20} className="text-cyan-600 flex-shrink-0 mt-1" />
                  <span>AI-powered clinical insights</span>
                </li>
              </ul>
            </div>

            {/* Feature 2 - For Patients */}
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-8 rounded-xl hover:shadow-lg transition">
              <div className="bg-emerald-600 w-14 h-14 rounded-full flex items-center justify-center mb-4">
                <Users size={28} className="text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Patient Portal</h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start space-x-2">
                  <CheckCircle size={20} className="text-emerald-600 flex-shrink-0 mt-1" />
                  <span>Easy appointment booking</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle size={20} className="text-emerald-600 flex-shrink-0 mt-1" />
                  <span>Health summary overview</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle size={20} className="text-emerald-600 flex-shrink-0 mt-1" />
                  <span>Test reminder notifications</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle size={20} className="text-emerald-600 flex-shrink-0 mt-1" />
                  <span>AI receptionist assistant</span>
                </li>
              </ul>
            </div>

            {/* Feature 3 - AI Assistant */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-8 rounded-xl hover:shadow-lg transition">
              <div className="bg-purple-600 w-14 h-14 rounded-full flex items-center justify-center mb-4">
                <Brain size={28} className="text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">AI Assistant</h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start space-x-2">
                  <CheckCircle size={20} className="text-purple-600 flex-shrink-0 mt-1" />
                  <span>Intelligent query processing</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle size={20} className="text-purple-600 flex-shrink-0 mt-1" />
                  <span>Clinical decision support</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle size={20} className="text-purple-600 flex-shrink-0 mt-1" />
                  <span>Natural language understanding</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle size={20} className="text-purple-600 flex-shrink-0 mt-1" />
                  <span>24/7 availability</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Key Benefits */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-gray-50 to-gray-100">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-gray-900 mb-16 text-center">Key Benefits</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="flex flex-col items-center text-center">
              <div className="bg-cyan-600 p-4 rounded-full mb-4">
                <Zap size={32} className="text-white" />
              </div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">Lightning Fast</h3>
              <p className="text-gray-600">Get insights in seconds, not hours</p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="bg-blue-600 p-4 rounded-full mb-4">
                <Shield size={32} className="text-white" />
              </div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">Secure & HIPAA</h3>
              <p className="text-gray-600">Patient data protection at highest level</p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="bg-emerald-600 p-4 rounded-full mb-4">
                <TrendingUp size={32} className="text-white" />
              </div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">Improved Outcomes</h3>
              <p className="text-gray-600">Better decisions lead to better results</p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="bg-purple-600 p-4 rounded-full mb-4">
                <Heart size={32} className="text-white" />
              </div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">Patient-Centric</h3>
              <p className="text-gray-600">Designed with patients in mind</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-cyan-600 to-blue-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Ready to Transform Healthcare?</h2>
          <p className="text-xl text-cyan-100 mb-8">
            Join thousands of healthcare professionals already using ClinSight AI
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/signup?role=doctor"
              className="bg-white text-cyan-600 px-8 py-4 rounded-lg font-semibold hover:shadow-lg transition flex items-center justify-center space-x-2"
            >
              <Stethoscope size={20} />
              <span>Doctor Sign Up</span>
            </Link>
            <Link
              href="/auth/signup?role=patient"
              className="bg-cyan-800 text-white px-8 py-4 rounded-lg font-semibold hover:bg-cyan-700 transition flex items-center justify-center space-x-2"
            >
              <Users size={20} />
              <span>Patient Sign Up</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <section className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-bold text-lg mb-4">ClinSight AI</h3>
              <p className="text-gray-400 text-sm">Agentic Clinical Intelligence Platform</p>
            </div>
            <div>
              <h4 className="font-bold mb-4">For Doctors</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="#" className="hover:text-white transition">Features</Link></li>
                <li><Link href="#" className="hover:text-white transition">Pricing</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">For Patients</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="#" className="hover:text-white transition">Features</Link></li>
                <li><Link href="#" className="hover:text-white transition">Support</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="#" className="hover:text-white transition">Privacy</Link></li>
                <li><Link href="#" className="hover:text-white transition">Terms</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400 text-sm">
            <p>&copy; 2024 ClinSight AI. All rights reserved.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
