import { notFound } from 'next/navigation';
import Link from 'next/link';
import { createAdminClient } from '@/lib/supabase';
import EmployeeCard from '@/components/EmployeeCard';
import BackgroundShapes from '@/components/BackgroundShapes';
import type { Employee, Location, Organization } from '@/lib/types';

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function getLocationWithEmployees(slug: string) {
  const supabase = createAdminClient();

  const { data: location, error: locationError } = await supabase
    .from('locations')
    .select('*')
    .eq('slug', slug)
    .single();

  if (locationError || !location) {
    return null;
  }

  // Get the organization for this location
  const { data: organization } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', location.organization_id)
    .single();

  const { data: allLocations } = await supabase
    .from('locations')
    .select('*')
    .eq('organization_id', location.organization_id)
    .order('name');

  const { data: employeeLocations } = await supabase
    .from('employee_locations')
    .select('employee_id')
    .eq('location_id', location.id);

  if (!employeeLocations || employeeLocations.length === 0) {
    return {
      location: location as Location,
      organization: organization as Organization | null,
      employees: [],
      otherLocations: (allLocations || []).filter((l: Location) => l.id !== location.id) as Location[],
    };
  }

  const employeeIds = employeeLocations.map((el) => el.employee_id);

  const { data: employees } = await supabase
    .from('employees')
    .select('*')
    .in('id', employeeIds)
    .eq('status', 'approved')
    .order('name');

  return {
    location: location as Location,
    organization: organization as Organization | null,
    employees: (employees || []) as Employee[],
    otherLocations: (allLocations || []).filter((l: Location) => l.id !== location.id) as Location[],
  };
}

export default async function LocationPage({ params }: PageProps) {
  const { slug } = await params;
  const data = await getLocationWithEmployees(slug);

  if (!data) {
    notFound();
  }

  const { location, organization, employees, otherLocations } = data;
  const orgName = organization?.name || 'Our Team';

  return (
    <main className="min-h-screen bg-[var(--cream)] relative overflow-hidden">
      <BackgroundShapes />

      <div className="relative z-10 max-w-lg mx-auto px-5 py-8 min-h-screen flex flex-col">
        {/* Header */}
        <header className="text-center mb-10 animate-fade-up">
          {/* Organization Name */}
          <div className="mb-6">
            <p className="text-xs font-medium tracking-[0.25em] uppercase text-[var(--stone-400)]">
              {orgName}
            </p>
          </div>

          {/* Location Name */}
          <h1 className="font-display text-4xl md:text-5xl text-[var(--stone-800)] mb-4 tracking-tight font-medium">
            {location.name}
          </h1>

          {/* Decorative line with sage accent */}
          <div className="flex items-center justify-center gap-3 mb-5">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-[var(--sage-300)]" />
            <div className="w-2 h-2 rounded-full bg-[var(--sage-400)]" />
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-[var(--sage-300)]" />
          </div>

          <p className="text-[var(--stone-500)] text-base font-light">
            Show your appreciation
          </p>
        </header>

        {/* Employee Cards */}
        <section className="flex-1">
          {employees.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-[var(--stone-400)]">
                No team members available at this location yet.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {employees.map((employee, index) => (
                <div
                  key={employee.id}
                  className="animate-fade-in"
                  style={{
                    animationDelay: `${index * 100}ms`,
                  }}
                >
                  <EmployeeCard employee={employee} />
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Location Switcher */}
        {otherLocations.length > 0 && (
          <nav className="mt-12 pt-8 border-t border-[var(--stone-200)]">
            <p className="text-xs font-medium tracking-[0.2em] uppercase text-[var(--stone-400)] mb-4 text-center">
              Other Locations
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {otherLocations.map((loc) => (
                <Link
                  key={loc.id}
                  href={`/location/${loc.slug}`}
                  className="px-5 py-2.5 bg-white/80 backdrop-blur-sm border border-[var(--stone-200)] rounded-full text-sm font-medium text-[var(--stone-600)] hover:text-[var(--stone-800)] hover:border-[var(--sage-300)] hover:bg-[var(--sage-100)] transition-all duration-300"
                >
                  {loc.name}
                </Link>
              ))}
            </div>
          </nav>
        )}

        {/* Footer */}
        <footer className="mt-12 pt-6 text-center">
          <p className="text-xs text-[var(--stone-400)] font-light">
            Thank you for visiting {orgName}
          </p>
        </footer>
      </div>
    </main>
  );
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const data = await getLocationWithEmployees(slug);

  if (!data) {
    return { title: 'Location Not Found' };
  }

  const orgName = data.organization?.name || 'Tips';

  return {
    title: `${data.location.name} | ${orgName}`,
    description: `Show your appreciation to our team at ${orgName} ${data.location.name}`,
  };
}
