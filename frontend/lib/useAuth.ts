'use client';

import { useEffect, useState, useCallback } from 'react';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'doctor' | 'patient';
}

interface UseAuthReturn {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<AuthUser>;
  signup: (email: string, password: string, name: string, role: 'doctor' | 'patient') => Promise<AuthUser>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch current user on mount
  useEffect(() => {
    async function fetchUser() {
      try {
        const response = await fetch('/api/auth/me', {
          credentials: 'include', // Include cookies
        });
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        }
        setLoading(false);
      } catch (err) {
        console.error('[v0] Error fetching user:', err);
        setLoading(false);
      }
    }

    fetchUser();
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<AuthUser> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include', // Include cookies
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Login failed');
      }

      const data = await response.json();
      setUser(data.user);
      return data.user;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const signup = useCallback(async (
    email: string,
    password: string,
    name: string,
    role: 'doctor' | 'patient'
  ): Promise<AuthUser> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name, role }),
        credentials: 'include', // Include cookies
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Signup failed');
      }

      const data = await response.json();
      setUser(data.user);
      return data.user;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Signup failed';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
    } catch (err) {
      console.error('[v0] Error logging out:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    user,
    loading,
    error,
    login,
    signup,
    logout,
    isAuthenticated: !!user,
  };
}
