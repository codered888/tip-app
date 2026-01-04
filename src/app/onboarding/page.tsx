'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import BackgroundShapes from '@/components/BackgroundShapes';

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export default function OnboardingPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [error, setError] = useState('');

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      setIsCheckingAuth(false);
    }
    checkAuth();
  }, [supabase, router]);

  useEffect(() => {
    setSlug(generateSlug(name));
  }, [name]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/organizations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, slug }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create organization');
      }

      // Redirect to the new organization's dashboard
      window.location.href = `https://${slug}.modelnets.com/dashboard`;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  if (isCheckingAuth) {
    return (
      <main className="min-h-screen bg-[var(--cream)] flex items-center justify-center">
        <p className="text-[var(--stone-500)]">Loading...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--cream)] relative overflow-hidden">
      <BackgroundShapes variant="minimal" />

      <div className="relative z-10">
        {/* Header */}
        <nav className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[var(--sage-500)] flex items-center justify-center">
              <span className="text-white font-bold text-sm">M</span>
            </div>
            <span className="font-display text-xl font-medium text-[var(--stone-800)]">
              Modelnets
            </span>
          </div>
        </nav>

        {/* Onboarding Form */}
        <div className="max-w-md mx-auto px-6 pt-12 pb-24">
          <div className="text-center mb-8">
            <h1 className="font-display text-3xl md:text-4xl text-[var(--stone-800)] mb-4 tracking-tight font-medium">
              Set up your business
            </h1>
            <p className="text-[var(--stone-500)] font-light">
              Create your organization to start collecting tips
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
                  htmlFor="name"
                  className="block text-sm font-medium text-[var(--stone-700)] mb-2"
                >
                  Business Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Acme Massage & Spa"
                  className="w-full px-4 py-3 rounded-xl border border-[var(--stone-200)] focus:border-[var(--sage-400)] focus:ring-2 focus:ring-[var(--sage-100)] outline-none transition-all text-[var(--stone-800)] placeholder:text-[var(--stone-400)]"
                />
              </div>

              <div>
                <label
                  htmlFor="slug"
                  className="block text-sm font-medium text-[var(--stone-700)] mb-2"
                >
                  Your URL
                </label>
                <div className="flex items-center">
                  <span className="text-[var(--stone-400)] text-sm mr-1">https://</span>
                  <input
                    type="text"
                    id="slug"
                    value={slug}
                    onChange={(e) => setSlug(generateSlug(e.target.value))}
                    required
                    placeholder="acme-massage"
                    className="flex-1 px-3 py-3 rounded-l-xl border border-r-0 border-[var(--stone-200)] focus:border-[var(--sage-400)] focus:ring-2 focus:ring-[var(--sage-100)] outline-none transition-all text-[var(--stone-800)] placeholder:text-[var(--stone-400)]"
                  />
                  <span className="px-3 py-3 bg-[var(--stone-100)] border border-l-0 border-[var(--stone-200)] rounded-r-xl text-[var(--stone-500)] text-sm">
                    .modelnets.com
                  </span>
                </div>
                <p className="text-xs text-[var(--stone-400)] mt-2">
                  This will be your unique tip page URL
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoading || !name || !slug}
                className="w-full py-3 bg-[var(--sage-500)] hover:bg-[var(--sage-600)] disabled:bg-[var(--stone-300)] text-white font-medium rounded-xl transition-colors"
              >
                {isLoading ? 'Creating...' : 'Create Organization'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
