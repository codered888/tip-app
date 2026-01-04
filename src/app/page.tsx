import { headers } from 'next/headers';
import Link from 'next/link';
import BackgroundShapes from '@/components/BackgroundShapes';
import TenantHeader from '@/components/TenantHeader';
import { createAdminClient } from '@/lib/supabase';
import type { Location, Organization } from '@/lib/types';

// Get organization from subdomain
async function getOrganization(slug: string | null) {
  if (!slug) return null;

  const supabase = createAdminClient();
  const { data } = await supabase
    .from('organizations')
    .select('*')
    .eq('slug', slug)
    .single();

  return data as Organization | null;
}

// Get locations for an organization
async function getLocations(organizationId: string) {
  const supabase = createAdminClient();
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
        <TenantHeader orgName={org.name} />
        <BackgroundShapes />

        <div className="relative z-10 max-w-lg mx-auto px-5 py-8 min-h-screen flex flex-col">
          <header className="text-center mb-10 animate-fade-up">
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
              <span className="text-white font-bold text-sm">M</span>
            </div>
            <span className="font-display text-xl font-medium text-[var(--stone-800)]">
              Modelnets
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
              href="/signup/business"
              className="px-4 py-2 bg-[var(--sage-500)] hover:bg-[var(--sage-600)] text-white text-sm font-medium rounded-full transition-colors"
            >
              Get Started
            </Link>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="max-w-4xl mx-auto px-6 pt-20 pb-32 text-center">
          <h1 className="font-display text-5xl md:text-6xl lg:text-7xl text-[var(--stone-800)] mb-6 tracking-tight font-medium leading-tight">
            Digital tipping
            <br />
            <span className="text-[var(--sage-500)]">made effortless</span>
          </h1>

          <p className="text-lg md:text-xl text-[var(--stone-500)] mb-10 max-w-2xl mx-auto font-light leading-relaxed">
            Modelnets helps service businesses create beautiful, branded tip pages.
            Your customers scan a QR code and tip your team directly via Venmo, Cash App, or Zelle.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/signup/business"
              className="px-8 py-4 bg-[var(--sage-500)] hover:bg-[var(--sage-600)] text-white font-medium rounded-full transition-all shadow-lg hover:shadow-xl text-lg"
            >
              Start Free
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
                  Sign up and add your business locations. Get a custom subdomain like yourbusiness.modelnets.com
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
                  Team members create profiles with their photo, bio, and payment handles
                </p>
              </div>

              <div className="text-center p-8">
                <div className="w-16 h-16 rounded-full bg-[var(--sage-100)] flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl font-display font-medium text-[var(--sage-600)]">3</span>
                </div>
                <h3 className="text-xl font-semibold text-[var(--stone-800)] mb-3">
                  Share &amp; collect tips
                </h3>
                <p className="text-[var(--stone-500)] font-light">
                  Display QR codes at your location. Customers scan and tip instantly—no app download required
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Use Cases Section */}
        <section className="py-24">
          <div className="max-w-6xl mx-auto px-6">
            <h2 className="font-display text-3xl md:text-4xl text-[var(--stone-800)] text-center mb-4 font-medium">
              Perfect for
            </h2>
            <p className="text-[var(--stone-500)] text-center mb-12 max-w-2xl mx-auto">
              Any service business where customers want to show appreciation
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
              {['Massage & Spa', 'Salons & Barbers', 'Restaurants', 'Hotels'].map((item) => (
                <div
                  key={item}
                  className="bg-white/80 backdrop-blur-sm rounded-xl p-4 text-center shadow-sm"
                >
                  <p className="text-[var(--stone-700)] font-medium">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 bg-[var(--sage-500)]">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h2 className="font-display text-3xl md:text-4xl text-white mb-6 font-medium">
              Ready to boost your team&apos;s earnings?
            </h2>
            <p className="text-lg text-white/80 mb-8 font-light">
              Join businesses using Modelnets to make tipping simple and seamless.
            </p>
            <Link
              href="/signup/business"
              className="inline-block px-8 py-4 bg-white text-[var(--sage-600)] font-medium rounded-full transition-all shadow-lg hover:shadow-xl text-lg hover:bg-[var(--cream)]"
            >
              Get Started Free
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-[var(--stone-200)] py-12 bg-white/50">
          <div className="max-w-6xl mx-auto px-6 text-center">
            <p className="text-sm text-[var(--stone-400)]">
              &copy; {new Date().getFullYear()} Modelnets. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </main>
  );
}
