import { headers } from 'next/headers';
import Link from 'next/link';
import BackgroundShapes from '@/components/BackgroundShapes';
import { supabase } from '@/lib/supabase';
import type { Location, Organization } from '@/lib/types';

// Get organization from subdomain
async function getOrganization(slug: string | null) {
  if (!slug) return null;

  const { data } = await supabase
    .from('organizations')
    .select('*')
    .eq('slug', slug)
    .single();

  return data as Organization | null;
}

// Get locations for an organization
async function getLocations(organizationId: string) {
  const { data } = await supabase
    .from('locations')
    .select('*')
    .eq('organization_id', organizationId)
    .order('name');

  return (data || []) as Location[];
}

export default async function HomePage() {
  const headersList = await headers();
  const subdomainType = headersList.get('x-subdomain-type') || 'marketing';
  const orgSlug = headersList.get('x-organization-slug');

  // TENANT VIEW: Show locations for this organization
  if (subdomainType === 'tenant' && orgSlug) {
    const org = await getOrganization(orgSlug);
    if (!org) {
      return (
        <main className="min-h-screen bg-[var(--cream)] flex items-center justify-center">
          <p className="text-[var(--stone-500)]">Organization not found</p>
        </main>
      );
    }

    const locations = await getLocations(org.id);

    return (
      <main className="min-h-screen bg-[var(--cream)] relative overflow-hidden">
        <BackgroundShapes />

        <div className="relative z-10 max-w-lg mx-auto px-5 py-12 min-h-screen flex flex-col">
          <header className="text-center mb-12 animate-fade-up">
            <div className="mb-6">
              <p className="text-xs font-medium tracking-[0.25em] uppercase text-[var(--stone-400)]">
                {org.name}
              </p>
            </div>

            <h1 className="font-display text-4xl md:text-5xl text-[var(--stone-800)] mb-4 tracking-tight font-medium">
              Tip Our Team
            </h1>

            <div className="flex items-center justify-center gap-3 mb-5">
              <div className="h-px w-16 bg-gradient-to-r from-transparent to-[var(--sage-300)]" />
              <div className="w-2 h-2 rounded-full bg-[var(--sage-400)]" />
              <div className="h-px w-16 bg-gradient-to-l from-transparent to-[var(--sage-300)]" />
            </div>

            <p className="text-[var(--stone-500)] text-base font-light">
              Select a location to view our team
            </p>
          </header>

          <section className="flex-1">
            {locations.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-[var(--stone-400)]">No locations available yet.</p>
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

          <footer className="mt-12 pt-6 text-center">
            <p className="text-xs text-[var(--stone-400)] font-light">
              Thank you for supporting our team
            </p>
          </footer>
        </div>
      </main>
    );
  }

  // MARKETING VIEW: Show landing page
  return (
    <main className="min-h-screen bg-[var(--cream)] relative overflow-hidden">
      <BackgroundShapes />

      <div className="relative z-10">
        {/* Navigation */}
        <nav className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[var(--sage-500)] flex items-center justify-center">
              <span className="text-white font-bold text-sm">T</span>
            </div>
            <span className="font-display text-xl font-medium text-[var(--stone-800)]">
              Tips
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-medium text-[var(--stone-600)] hover:text-[var(--stone-800)] transition-colors"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="px-4 py-2 bg-[var(--sage-500)] hover:bg-[var(--sage-600)] text-white text-sm font-medium rounded-full transition-colors"
            >
              Get Started
            </Link>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="max-w-4xl mx-auto px-6 pt-20 pb-32 text-center">
          <h1 className="font-display text-5xl md:text-6xl lg:text-7xl text-[var(--stone-800)] mb-6 tracking-tight font-medium leading-tight">
            Tipping made simple
            <br />
            <span className="text-[var(--sage-500)]">for your team</span>
          </h1>

          <p className="text-lg md:text-xl text-[var(--stone-500)] mb-10 max-w-2xl mx-auto font-light leading-relaxed">
            Create beautiful, branded tip pages for your service business.
            Let customers show their appreciation directly to your team members.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/signup"
              className="px-8 py-4 bg-[var(--sage-500)] hover:bg-[var(--sage-600)] text-white font-medium rounded-full transition-all shadow-lg hover:shadow-xl text-lg"
            >
              Start Free Trial
            </Link>
            <Link
              href="#how-it-works"
              className="px-8 py-4 bg-white/80 border border-[var(--stone-200)] text-[var(--stone-700)] font-medium rounded-full hover:bg-white hover:shadow-md transition-all text-lg"
            >
              See How It Works
            </Link>
          </div>
        </section>

        {/* Features Section */}
        <section id="how-it-works" className="bg-white/50 backdrop-blur-sm py-24">
          <div className="max-w-6xl mx-auto px-6">
            <h2 className="font-display text-3xl md:text-4xl text-[var(--stone-800)] text-center mb-4 font-medium">
              How it works
            </h2>
            <p className="text-[var(--stone-500)] text-center mb-16 max-w-2xl mx-auto">
              Set up in minutes, start receiving tips today
            </p>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center p-8">
                <div className="w-16 h-16 rounded-full bg-[var(--sage-100)] flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl font-display font-medium text-[var(--sage-600)]">1</span>
                </div>
                <h3 className="text-xl font-semibold text-[var(--stone-800)] mb-3">
                  Create your account
                </h3>
                <p className="text-[var(--stone-500)] font-light">
                  Sign up and add your business locations. Get a custom subdomain like yourname.tips.app
                </p>
              </div>

              <div className="text-center p-8">
                <div className="w-16 h-16 rounded-full bg-[var(--sage-100)] flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl font-display font-medium text-[var(--sage-600)]">2</span>
                </div>
                <h3 className="text-xl font-semibold text-[var(--stone-800)] mb-3">
                  Add your team
                </h3>
                <p className="text-[var(--stone-500)] font-light">
                  Invite team members to create profiles with their photos and payment info
                </p>
              </div>

              <div className="text-center p-8">
                <div className="w-16 h-16 rounded-full bg-[var(--sage-100)] flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl font-display font-medium text-[var(--sage-600)]">3</span>
                </div>
                <h3 className="text-xl font-semibold text-[var(--stone-800)] mb-3">
                  Share with customers
                </h3>
                <p className="text-[var(--stone-500)] font-light">
                  Print QR codes or share your link. Customers tap to tip via Venmo, Cash App, or Zelle
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h2 className="font-display text-3xl md:text-4xl text-[var(--stone-800)] mb-6 font-medium">
              Ready to empower your team?
            </h2>
            <p className="text-lg text-[var(--stone-500)] mb-8 font-light">
              Join service businesses using Tips to boost team morale and income.
            </p>
            <Link
              href="/signup"
              className="inline-block px-8 py-4 bg-[var(--sage-500)] hover:bg-[var(--sage-600)] text-white font-medium rounded-full transition-all shadow-lg hover:shadow-xl text-lg"
            >
              Get Started Free
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-[var(--stone-200)] py-12">
          <div className="max-w-6xl mx-auto px-6 text-center">
            <p className="text-sm text-[var(--stone-400)]">
              &copy; {new Date().getFullYear()} Tips. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </main>
  );
}
