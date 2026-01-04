'use client';

import { useState } from 'react';
import Link from 'next/link';
import BackgroundShapes from '@/components/BackgroundShapes';

export default function BusinessSignupPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // For now, just show success - you can add actual form handling later
    setSubmitted(true);
  };

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
              Get Started with Modelnets
            </h1>
            <p className="text-[var(--stone-500)] font-light">
              Join our waitlist and we&apos;ll reach out to set up your account
            </p>
          </div>

          <div
            className="bg-white/90 backdrop-blur-sm rounded-2xl p-8"
            style={{
              boxShadow: '0 2px 8px rgba(90,122,96,0.08), 0 8px 24px rgba(90,122,96,0.04)',
            }}
          >
            {submitted ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-[var(--sage-100)] flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-[var(--sage-500)]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-[var(--stone-800)] mb-2">
                  You&apos;re on the list!
                </h2>
                <p className="text-[var(--stone-500)] font-light">
                  We&apos;ll be in touch soon to get you set up.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-[var(--stone-700)] mb-2"
                  >
                    Business Email
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
                  className="w-full py-3 bg-[var(--sage-500)] hover:bg-[var(--sage-600)] text-white font-medium rounded-xl transition-colors"
                >
                  Join Waitlist
                </button>

                <p className="text-xs text-center text-[var(--stone-400)]">
                  Already have an account?{' '}
                  <Link href="/login" className="text-[var(--sage-500)] hover:underline">
                    Log in
                  </Link>
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
