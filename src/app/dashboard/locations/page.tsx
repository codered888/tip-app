import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { createAdminClient } from '@/lib/supabase';
import LocationsList from './LocationsList';
import type { Location, Organization } from '@/lib/types';

async function getOrganization(slug: string) {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from('organizations')
    .select('*')
    .eq('slug', slug)
    .single();
  return data as Organization | null;
}

async function getLocationsWithCounts(organizationId: string) {
  const supabase = createAdminClient();

  // First fetch locations and approved employees for this org
  const [locationsResult, employeesResult] = await Promise.all([
    supabase
      .from('locations')
      .select('*')
      .eq('organization_id', organizationId)
      .order('name'),
    supabase
      .from('employees')
      .select('id')
      .eq('organization_id', organizationId)
      .eq('status', 'approved'),
  ]);

  const locations = (locationsResult.data || []) as Location[];
  const approvedEmployeeIds = (employeesResult.data || []).map((e) => e.id);

  // Only fetch employee_locations for approved employees (not ALL globally)
  const counts: Record<string, number> = {};
  if (approvedEmployeeIds.length > 0) {
    const { data: employeeLocations } = await supabase
      .from('employee_locations')
      .select('location_id, employee_id')
      .in('employee_id', approvedEmployeeIds);

    (employeeLocations || []).forEach((el) => {
      counts[el.location_id] = (counts[el.location_id] || 0) + 1;
    });
  }

  return locations.map((loc) => ({
    ...loc,
    employeeCount: counts[loc.id] || 0,
  }));
}

export default async function LocationsPage() {
  const headersList = await headers();
  const orgSlug = headersList.get('x-organization-slug');

  if (!orgSlug) {
    redirect('/');
  }

  const org = await getOrganization(orgSlug);
  if (!org) {
    redirect('/');
  }

  const locations = await getLocationsWithCounts(org.id);

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--stone-800)] mb-8">Locations</h1>
      <LocationsList initialLocations={locations} />
    </div>
  );
}
