import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import BackgroundShapes from '@/components/BackgroundShapes';
import type { Location } from '@/lib/types';

async function getLocations() {
  const { data } = await supabase
    .from('locations')
    .select('*')
    .order('name');

  return (data || []) as Location[];
}

export default async function Home() {
  const locations = await getLocations();

  return (
    <main className="min-h-screen bg-[var(--cream)] relative overflow-hidden">
      <BackgroundShapes />

      <div className="relative z-10 max-w-lg mx-auto px-5 py-12 min-h-screen flex flex-col">
        {/* Header */}
        <header className="text-center mb-12 animate-fade-up">
          {/* Elements Massage Wordmark */}
          <div className="mb-6">
            <p className="text-xs font-medium tracking-[0.25em] uppercase text-[var(--stone-400)]">
              Elements Massage
            </p>
          </div>

          {/* Title */}
          <h1 className="font-display text-4xl md:text-5xl text-[var(--stone-800)] mb-4 tracking-tight font-medium">
            Tip Our Team
          </h1>

          {/* Decorative line with sage accent */}
          <div className="flex items-center justify-center gap-3 mb-5">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-[var(--sage-300)]" />
            <div className="w-2 h-2 rounded-full bg-[var(--sage-400)]" />
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-[var(--sage-300)]" />
          </div>

          <p className="text-[var(--stone-500)] text-base font-light">
            Select a location to view our therapists
          </p>
        </header>

        {/* Location Cards */}
        <section className="flex-1">
          {locations.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-[var(--stone-400)]">
                No locations available yet.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {locations.map((location, index) => (
                <Link
                  key={location.id}
                  href={`/location/${location.slug}`}
                  className="group block animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <article
                    className="relative bg-white/90 backdrop-blur-sm rounded-2xl p-6 transition-all duration-300 hover:shadow-xl hover:bg-white"
                    style={{
                      boxShadow: '0 2px 8px rgba(90,122,96,0.08), 0 8px 24px rgba(90,122,96,0.04)',
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-xl font-semibold text-[var(--stone-800)] tracking-tight group-hover:text-[var(--sage-600)] transition-colors">
                          {location.name}
                        </h2>
                        <p className="text-[var(--stone-400)] text-sm mt-1 font-light">
                          View team members
                        </p>
                      </div>

                      {/* Arrow indicator */}
                      <div className="w-10 h-10 rounded-full bg-[var(--sage-100)] flex items-center justify-center group-hover:bg-[var(--sage-200)] transition-colors">
                        <svg
                          className="w-5 h-5 text-[var(--sage-500)] group-hover:translate-x-0.5 transition-transform"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Footer */}
        <footer className="mt-12 pt-6 text-center">
          <p className="text-xs text-[var(--stone-400)] font-light">
            Thank you for supporting our team
          </p>
        </footer>
      </div>
    </main>
  );
}
