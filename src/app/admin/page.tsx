'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Login failed');
      }

      router.push('/admin/dashboard');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[var(--cream)] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Subtle background accent */}
      <div
        className="fixed top-0 right-0 w-[500px] h-[500px] opacity-30"
        style={{
          background: 'radial-gradient(circle at 100% 0%, var(--sage-200), transparent 70%)',
        }}
      />
      <div
        className="fixed bottom-0 left-0 w-[400px] h-[400px] opacity-20"
        style={{
          background: 'radial-gradient(circle at 0% 100%, var(--stone-200), transparent 70%)',
        }}
      />

      <div className="relative z-10 w-full max-w-sm">
        <div
          className="bg-white/90 backdrop-blur-sm rounded-2xl p-8"
          style={{
            boxShadow: '0 2px 8px rgba(90,122,96,0.08), 0 8px 24px rgba(90,122,96,0.04)',
          }}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="font-display text-2xl font-medium text-[var(--stone-800)]">
              Admin Login
            </h1>
            <div className="flex items-center justify-center gap-2 mt-3">
              <div className="h-px w-8 bg-gradient-to-r from-transparent to-[var(--sage-300)]" />
              <div className="w-1.5 h-1.5 rounded-full bg-[var(--sage-400)]" />
              <div className="h-px w-8 bg-gradient-to-l from-transparent to-[var(--sage-300)]" />
            </div>
            <p className="text-[var(--stone-500)] mt-4 text-sm font-light">
              Enter the master password to continue
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 text-red-700 p-3 rounded-xl text-sm border border-red-100">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-[var(--stone-200)] rounded-xl focus:ring-2 focus:ring-[var(--sage-300)] focus:border-[var(--sage-400)] bg-white/50 text-[var(--stone-800)] placeholder:text-[var(--stone-400)] transition-colors"
                placeholder="Enter password"
                autoFocus
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !password}
              className="w-full py-3.5 px-4 bg-[var(--stone-800)] hover:bg-[var(--stone-700)] disabled:bg-[var(--stone-300)] text-white font-medium rounded-xl transition-colors shadow-sm hover:shadow-md"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
