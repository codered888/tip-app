import { createAdminClient } from '@/lib/supabase';
import SignupForm from '@/components/SignupForm';
import BackgroundShapes from '@/components/BackgroundShapes';
import type { Location } from '@/lib/types';

async function getLocations() {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from('locations')
    .select('*')
    .order('name');

  return (data || []) as Location[];
}

export default async function SignupPage() {
  const locations = await getLocations();

  return (
    <main className="min-h-screen bg-[var(--cream)] relative overflow-hidden">
      <BackgroundShapes variant="minimal" />

      <div className="relative z-10 max-w-md mx-auto px-5 py-12">
        {/* Header */}
        <header className="text-center mb-8 animate-fade-up">
          {/* Elements Massage Wordmark */}
          <div className="mb-4">
            <p className="text-xs font-medium tracking-[0.25em] uppercase text-[var(--stone-400)]">
              Elements Massage
            </p>
          </div>

          <h1 className="font-display text-3xl text-[var(--stone-800)] mb-3 tracking-tight font-medium">
            Join Our Team
          </h1>

          {/* Decorative line */}
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-[var(--sage-300)]" />
            <div className="w-1.5 h-1.5 rounded-full bg-[var(--sage-400)]" />
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-[var(--sage-300)]" />
          </div>

          <p className="text-[var(--stone-500)] text-sm font-light">
            Set up your profile so customers can tip you
          </p>
        </header>

        {/* Form Card */}
        <div
          className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 animate-fade-in"
          style={{
            boxShadow: '0 2px 8px rgba(90,122,96,0.08), 0 8px 24px rgba(90,122,96,0.04)',
            animationDelay: '150ms',
          }}
        >
          <SignupForm locations={locations} />
        </div>
      </div>
    </main>
  );
}

export function generateMetadata() {
  return {
    title: 'Employee Signup | Elements Massage',
    description: 'Set up your profile to receive tips from customers',
  };
}
