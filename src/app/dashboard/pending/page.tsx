import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { createAdminClient } from '@/lib/supabase';
import PendingList from './PendingList';
import type { Employee, Location, EmployeeLocation, Organization } from '@/lib/types';

async function getOrganization(slug: string) {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from('organizations')
    .select('*')
    .eq('slug', slug)
    .single();
  return data as Organization | null;
}

async function getPendingEmployees(organizationId: string) {
  const supabase = createAdminClient();

  const [employeesResult, locationsResult, employeeLocationsResult] = await Promise.all([
    supabase
      .from('employees')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false }),
    supabase
      .from('locations')
      .select('*')
      .eq('organization_id', organizationId),
    supabase.from('employee_locations').select('*'),
  ]);

  const employees = (employeesResult.data || []) as Employee[];
  const locations = (locationsResult.data || []) as Location[];
  const employeeLocations = (employeeLocationsResult.data || []) as EmployeeLocation[];

  const locationsMap = new Map(locations.map((l) => [l.id, l]));

  return employees.map((employee) => {
    const empLocations = employeeLocations
      .filter((el) => el.employee_id === employee.id)
      .map((el) => locationsMap.get(el.location_id))
      .filter(Boolean) as Location[];

    return { ...employee, locations: empLocations };
  });
}

export default async function PendingPage() {
  const headersList = await headers();
  const orgSlug = headersList.get('x-organization-slug');

  if (!orgSlug) {
    redirect('/');
  }

  const org = await getOrganization(orgSlug);
  if (!org) {
    redirect('/');
  }

  const pendingEmployees = await getPendingEmployees(org.id);

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--stone-800)] mb-8">Pending Approvals</h1>

      {pendingEmployees.length === 0 ? (
        <div className="bg-white rounded-xl p-12 shadow-sm text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-lg font-medium text-[var(--stone-800)] mb-2">All caught up!</h2>
          <p className="text-[var(--stone-500)]">No pending employee approvals at this time.</p>
        </div>
      ) : (
        <PendingList employees={pendingEmployees} />
      )}
    </div>
  );
}
