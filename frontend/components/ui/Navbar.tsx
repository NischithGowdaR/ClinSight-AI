'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Menu, X, LogOut, BarChart3 } from 'lucide-react';
import { useAuth } from '@/lib/useAuth';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.refresh();
    setIsOpen(false);
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="bg-gradient-to-r from-cyan-600 to-blue-600 p-2 rounded-lg">
              <BarChart3 size={24} className="text-white" />
            </div>
            <span className="font-bold text-xl bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
              ClinSight AI
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/#features" className="text-gray-700 hover:text-cyan-600 transition">
              Features
            </Link>
            <Link href="/#about" className="text-gray-700 hover:text-cyan-600 transition">
              About
            </Link>

            {isAuthenticated && user ? (
              <div className="flex items-center space-x-4">
                <span className="text-gray-700 text-sm">Welcome, <strong>{user.name}</strong></span>
                <Link
                  href={user.role === 'doctor' ? '/doctor' : '/patient'}
                  className="bg-cyan-600 text-white px-6 py-2 rounded-lg hover:bg-cyan-700 transition"
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-red-600 hover:text-red-700 transition flex items-center space-x-1"
                >
                  <LogOut size={18} />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  href="/auth/login"
                  className="text-gray-700 hover:text-cyan-600 transition font-medium"
                >
                  Login
                </Link>
                <Link
                  href="/auth/signup"
                  className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white px-6 py-2 rounded-lg hover:shadow-lg transition"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-700 hover:text-cyan-600 transition"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden pb-4 border-t">
            <Link href="/#features" className="block py-2 text-gray-700 hover:text-cyan-600 transition">
              Features
            </Link>
            <Link href="/#about" className="block py-2 text-gray-700 hover:text-cyan-600 transition">
              About
            </Link>

            {isAuthenticated && user ? (
              <>
                <div className="py-2 text-gray-700 text-sm border-t mt-2 pt-2">
                  Welcome, <strong>{user.name}</strong>
                </div>
                <Link
                  href={user.role === 'doctor' ? '/doctor' : '/patient'}
                  className="block bg-cyan-600 text-white px-4 py-2 rounded-lg mt-2 text-center hover:bg-cyan-700 transition"
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left text-red-600 hover:text-red-700 transition py-2 mt-2"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="block py-2 text-gray-700 hover:text-cyan-600 transition"
                >
                  Login
                </Link>
                <Link
                  href="/auth/signup"
                  className="block bg-gradient-to-r from-cyan-600 to-blue-600 text-white px-4 py-2 rounded-lg mt-2 text-center hover:shadow-lg transition"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
