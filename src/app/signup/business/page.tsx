'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createBrowserClient } from '@supabase/ssr';
import BackgroundShapes from '@/components/BackgroundShapes';

export default function BusinessSignupPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState('');

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: 'https://modelnets.com/auth/callback',
        },
      });

      if (error) {
        throw error;
      }

      setIsSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send sign up link');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSent) {
    return (
      <main className="min-h-screen bg-[var(--cream)] relative overflow-hidden">
        <BackgroundShapes variant="minimal" />

        <div className="relative z-10">
          <nav className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[var(--sage-500)] flex items-center justify-center">
                <span className="text-white font-bold text-sm">M</span>
              </div>
              <span className="font-display text-xl font-medium text-[var(--stone-800)]">
                Modelnets
              </span>
            </Link>
          </nav>

          <div className="max-w-md mx-auto px-6 pt-16 pb-24">
            <div
              className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 text-center"
              style={{
                boxShadow: '0 2px 8px rgba(90,122,96,0.08), 0 8px 24px rgba(90,122,96,0.04)',
              }}
            >
              <div className="w-16 h-16 rounded-full bg-[var(--sage-100)] flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-[var(--sage-600)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>

              <h1 className="font-display text-2xl font-medium text-[var(--stone-800)] mb-2">
                Check your email
              </h1>

              <p className="text-[var(--stone-500)] mb-6">
                We sent a sign up link to <strong className="text-[var(--stone-700)]">{email}</strong>
              </p>

              <p className="text-sm text-[var(--stone-400)]">
                Click the link in the email to complete your sign up. The link will expire in 1 hour.
              </p>

              <button
                onClick={() => setIsSent(false)}
                className="mt-6 text-sm text-[var(--sage-600)] hover:text-[var(--sage-700)]"
              >
                Use a different email
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--cream)] relative overflow-hidden">
      <BackgroundShapes variant="minimal" />

      <div className="relative z-10">
        {/* Navigation */}
        <nav className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[var(--sage-500)] flex items-center justify-center">
              <span className="text-white font-bold text-sm">M</span>
            </div>
            <span className="font-display text-xl font-medium text-[var(--stone-800)]">
              Modelnets
            </span>
          </Link>

          <Link
            href="/login"
            className="text-sm font-medium text-[var(--stone-600)] hover:text-[var(--stone-800)] transition-colors"
          >
            Log in
          </Link>
        </nav>

        {/* Signup Form */}
        <div className="max-w-md mx-auto px-6 pt-16 pb-24">
          <div className="text-center mb-8">
            <h1 className="font-display text-3xl md:text-4xl text-[var(--stone-800)] mb-4 tracking-tight font-medium">
              Create your account
            </h1>
            <p className="text-[var(--stone-500)] font-light">
              Enter your email to get started with Modelnets
            </p>
          </div>

          <div
            className="bg-white/90 backdrop-blur-sm rounded-2xl p-8"
            style={{
              boxShadow: '0 2px 8px rgba(90,122,96,0.08), 0 8px 24px rgba(90,122,96,0.04)',
            }}
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 text-red-700 p-3 rounded-xl text-sm border border-red-100">
                  {error}
                </div>
              )}

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-[var(--stone-700)] mb-2"
                >
                  Email address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@yourbusiness.com"
                  className="w-full px-4 py-3 rounded-xl border border-[var(--stone-200)] focus:border-[var(--sage-400)] focus:ring-2 focus:ring-[var(--sage-100)] outline-none transition-all text-[var(--stone-800)] placeholder:text-[var(--stone-400)]"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || !email}
                className="w-full py-3 bg-[var(--sage-500)] hover:bg-[var(--sage-600)] disabled:bg-[var(--stone-300)] text-white font-medium rounded-xl transition-colors"
              >
                {isLoading ? 'Sending...' : 'Sign Up'}
              </button>

              <p className="text-xs text-center text-[var(--stone-400)]">
                Already have an account?{' '}
                <Link href="/login" className="text-[var(--sage-500)] hover:underline">
                  Log in
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
