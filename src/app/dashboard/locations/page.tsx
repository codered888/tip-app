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

  const [locationsResult, employeeLocationsResult, employeesResult] = await Promise.all([
    supabase
      .from('locations')
      .select('*')
      .eq('organization_id', organizationId)
      .order('name'),
    supabase.from('employee_locations').select('*'),
    supabase
      .from('employees')
      .select('id')
      .eq('organization_id', organizationId)
      .eq('status', 'approved'),
  ]);

  const locations = (locationsResult.data || []) as Location[];
  const employeeLocations = employeeLocationsResult.data || [];
  const approvedEmployeeIds = new Set((employeesResult.data || []).map((e) => e.id));

  const counts: Record<string, number> = {};
  employeeLocations.forEach((el) => {
    if (approvedEmployeeIds.has(el.employee_id)) {
      counts[el.location_id] = (counts[el.location_id] || 0) + 1;
    }
  });

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
