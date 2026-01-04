'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createBrowserClient } from '@supabase/ssr';
import BackgroundShapes from '@/components/BackgroundShapes';

function LoginForm() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState('');

  // Check for error in URL params (from auth callback)
  useEffect(() => {
    const urlError = searchParams.get('error');
    if (urlError) {
      setError(urlError);
    }
  }, [searchParams]);

  // Set cookies on parent domain for cross-subdomain auth
  const cookieDomain = '.modelnets.com';

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookieOptions: {
        domain: cookieDomain,
      },
    }
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
      setError(err instanceof Error ? err.message : 'Failed to send magic link');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSent) {
    return (
      <main className="min-h-screen bg-[var(--cream)] relative overflow-hidden flex items-center justify-center p-4">
        <BackgroundShapes variant="minimal" />

        <div className="relative z-10 w-full max-w-md text-center">
          <div
            className="bg-white/90 backdrop-blur-sm rounded-2xl p-8"
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
              We sent a magic link to <strong className="text-[var(--stone-700)]">{email}</strong>
            </p>

            <p className="text-sm text-[var(--stone-400)]">
              Click the link in the email to sign in. The link will expire in 1 hour.
            </p>

            <button
              onClick={() => setIsSent(false)}
              className="mt-6 text-sm text-[var(--sage-600)] hover:text-[var(--sage-700)]"
            >
              Use a different email
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--cream)] relative overflow-hidden flex items-center justify-center p-4">
      <BackgroundShapes variant="minimal" />

      <div className="relative z-10 w-full max-w-md">
        <div
          className="bg-white/90 backdrop-blur-sm rounded-2xl p-8"
          style={{
            boxShadow: '0 2px 8px rgba(90,122,96,0.08), 0 8px 24px rgba(90,122,96,0.04)',
          }}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-full bg-[var(--sage-500)] flex items-center justify-center">
                <span className="text-white font-bold text-sm">M</span>
              </div>
              <span className="font-display text-xl font-medium text-[var(--stone-800)]">
                Modelnets
              </span>
            </Link>

            <h1 className="font-display text-2xl font-medium text-[var(--stone-800)]">
              Welcome back
            </h1>

            <div className="flex items-center justify-center gap-2 mt-3 mb-4">
              <div className="h-px w-8 bg-gradient-to-r from-transparent to-[var(--sage-300)]" />
              <div className="w-1.5 h-1.5 rounded-full bg-[var(--sage-400)]" />
              <div className="h-px w-8 bg-gradient-to-l from-transparent to-[var(--sage-300)]" />
            </div>

            <p className="text-[var(--stone-500)] text-sm">
              Enter your email to receive a magic link
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 text-red-700 p-3 rounded-xl text-sm border border-red-100">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[var(--stone-700)] mb-1">
                Email address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-[var(--stone-200)] rounded-xl focus:ring-2 focus:ring-[var(--sage-300)] focus:border-[var(--sage-400)] bg-white/50 text-[var(--stone-800)] placeholder:text-[var(--stone-400)] transition-colors"
                placeholder="you@example.com"
                required
                autoFocus
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !email}
              className="w-full py-3.5 px-4 bg-[var(--sage-500)] hover:bg-[var(--sage-600)] disabled:bg-[var(--stone-300)] text-white font-medium rounded-xl transition-colors shadow-sm hover:shadow-md"
            >
              {isLoading ? 'Sending...' : 'Send Magic Link'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-[var(--stone-500)]">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="text-[var(--sage-600)] hover:text-[var(--sage-700)] font-medium">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-[var(--cream)] flex items-center justify-center">
        <p className="text-[var(--stone-500)]">Loading...</p>
      </main>
    }>
      <LoginForm />
    </Suspense>
  );
}
