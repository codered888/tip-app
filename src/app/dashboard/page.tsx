import Link from 'next/link';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { createAdminClient } from '@/lib/supabase';
import type { Location, Employee, Organization } from '@/lib/types';

async function getOrganization(slug: string) {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from('organizations')
    .select('*')
    .eq('slug', slug)
    .single();
  return data as Organization | null;
}

async function getDashboardData(organizationId: string) {
  const supabase = createAdminClient();

  const [locationsResult, employeesResult, pendingResult] = await Promise.all([
    supabase
      .from('locations')
      .select('*')
      .eq('organization_id', organizationId)
      .order('name'),
    supabase
      .from('employees')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('status', 'approved'),
    supabase
      .from('employees')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('status', 'pending'),
  ]);

  const locations = (locationsResult.data || []) as Location[];
  const employees = (employeesResult.data || []) as Employee[];
  const pending = (pendingResult.data || []) as Employee[];

  // Get employee counts per location - only for this org's employees
  const employeeIds = employees.map((e) => e.id);
  const locationCounts: Record<string, number> = {};

  if (employeeIds.length > 0) {
    const { data: employeeLocations } = await supabase
      .from('employee_locations')
      .select('location_id, employee_id')
      .in('employee_id', employeeIds);

    (employeeLocations || []).forEach((el) => {
      locationCounts[el.location_id] = (locationCounts[el.location_id] || 0) + 1;
    });
  }

  return { locations, employees, pending, locationCounts };
}

export default async function DashboardPage() {
  const headersList = await headers();
  const orgSlug = headersList.get('x-organization-slug');

  if (!orgSlug) {
    redirect('/');
  }

  const org = await getOrganization(orgSlug);
  if (!org) {
    redirect('/');
  }

  const { locations, employees, pending, locationCounts } = await getDashboardData(org.id);

  return (
    <div>
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="text-3xl font-bold text-[var(--stone-800)]">{locations.length}</div>
          <div className="text-[var(--stone-500)] text-sm">Locations</div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="text-3xl font-bold text-[var(--stone-800)]">{employees.length}</div>
          <div className="text-[var(--stone-500)] text-sm">Active Employees</div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="text-3xl font-bold text-yellow-600">{pending.length}</div>
          <div className="text-[var(--stone-500)] text-sm">Pending Approval</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <Link
          href="/dashboard/locations"
          className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow group"
        >
          <h3 className="font-semibold text-[var(--stone-800)] mb-1 group-hover:text-[var(--sage-600)]">
            Manage Locations
          </h3>
          <p className="text-sm text-[var(--stone-500)]">
            Add, edit, or remove your business locations
          </p>
        </Link>
        <Link
          href="/dashboard/employees"
          className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow group"
        >
          <h3 className="font-semibold text-[var(--stone-800)] mb-1 group-hover:text-[var(--sage-600)]">
            Manage Employees
          </h3>
          <p className="text-sm text-[var(--stone-500)]">
            View and edit employee profiles
          </p>
        </Link>
      </div>

      {/* Locations Grid */}
      <h2 className="text-lg font-semibold text-[var(--stone-800)] mb-4">Your Locations</h2>
      {locations.length === 0 ? (
        <div className="bg-white rounded-xl p-8 shadow-sm text-center">
          <p className="text-[var(--stone-500)] mb-4">No locations yet</p>
          <Link
            href="/dashboard/locations"
            className="inline-block px-4 py-2 bg-[var(--sage-500)] text-white rounded-lg hover:bg-[var(--sage-600)] transition-colors"
          >
            Add Your First Location
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {locations.map((location) => (
            <div key={location.id} className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="font-semibold text-[var(--stone-800)] mb-1">{location.name}</h3>
              <p className="text-sm text-[var(--stone-500)] mb-3">
                {locationCounts[location.id] || 0} employee
                {locationCounts[location.id] !== 1 ? 's' : ''}
              </p>
              <Link
                href={`/location/${location.slug}`}
                className="text-sm text-[var(--sage-600)] hover:text-[var(--sage-700)]"
              >
                View Tip Page →
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* Employee Signup Link */}
      <div className="mt-8 bg-white rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-[var(--stone-800)] mb-2">
          Employee Signup Link
        </h2>
        <p className="text-[var(--stone-500)] text-sm mb-4">
          Share this link with new employees so they can create their profile.
        </p>
        <code className="block bg-[var(--stone-100)] px-4 py-3 rounded-lg text-sm text-[var(--stone-700)] overflow-x-auto">
          https://{orgSlug}.modelnets.com/signup
        </code>
      </div>
    </div>
  );
}
