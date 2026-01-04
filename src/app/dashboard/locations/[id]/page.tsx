import { headers } from 'next/headers';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
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

async function getLocation(id: string, organizationId: string) {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from('locations')
    .select('*')
    .eq('id', id)
    .eq('organization_id', organizationId)
    .single();
  return data as Location | null;
}

async function getLocationEmployees(locationId: string, organizationId: string) {
  const supabase = createAdminClient();

  // Get employee IDs for this location
  const { data: employeeLocations } = await supabase
    .from('employee_locations')
    .select('employee_id')
    .eq('location_id', locationId);

  if (!employeeLocations?.length) return [];

  const employeeIds = employeeLocations.map((el) => el.employee_id);

  // Get employee details
  const { data: employees } = await supabase
    .from('employees')
    .select('*')
    .eq('organization_id', organizationId)
    .eq('status', 'approved')
    .in('id', employeeIds)
    .order('name');

  return (employees || []) as Employee[];
}

export default async function LocationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const headersList = await headers();
  const orgSlug = headersList.get('x-organization-slug');

  if (!orgSlug) {
    redirect('/');
  }

  const org = await getOrganization(orgSlug);
  if (!org) {
    redirect('/');
  }

  const location = await getLocation(id, org.id);
  if (!location) {
    notFound();
  }

  const employees = await getLocationEmployees(id, org.id);

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/dashboard/locations"
          className="text-[var(--sage-600)] hover:text-[var(--sage-700)] text-sm font-medium"
        >
          &larr; Back to Locations
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h1 className="text-2xl font-bold text-[var(--stone-800)] mb-2">
          {location.name}
        </h1>
        <p className="text-[var(--stone-500)] text-sm">
          Public URL: /location/{location.slug}
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-[var(--stone-200)]">
          <h2 className="text-lg font-semibold text-[var(--stone-800)]">
            Employees ({employees.length})
          </h2>
        </div>

        {employees.length === 0 ? (
          <div className="px-6 py-8 text-center text-[var(--stone-500)]">
            No employees assigned to this location yet.
            <br />
            <Link
              href="/dashboard/employees"
              className="text-[var(--sage-600)] hover:text-[var(--sage-700)] font-medium"
            >
              Manage employees
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-[var(--stone-200)]">
            {employees.map((employee) => (
              <div key={employee.id} className="px-6 py-4 flex items-center gap-4">
                {employee.photo_url ? (
                  <img
                    src={employee.photo_url}
                    alt={employee.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-[var(--sage-100)] flex items-center justify-center">
                    <span className="text-[var(--sage-600)] font-medium text-lg">
                      {employee.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div className="flex-1">
                  <p className="font-medium text-[var(--stone-800)]">{employee.name}</p>
                  {employee.bio && (
                    <p className="text-sm text-[var(--stone-500)] line-clamp-1">{employee.bio}</p>
                  )}
                </div>
                <Link
                  href={`/dashboard/employees/${employee.id}`}
                  className="text-[var(--sage-600)] hover:text-[var(--sage-700)] text-sm font-medium"
                >
                  View
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
