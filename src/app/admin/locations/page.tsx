import { createAdminClient } from '@/lib/supabase';
import LocationsList from './LocationsList';
import type { Location } from '@/lib/types';

async function getLocationsWithCounts() {
  const supabase = createAdminClient();

  const [locationsResult, employeeLocationsResult, employeesResult] = await Promise.all([
    supabase.from('locations').select('*').order('name'),
    supabase.from('employee_locations').select('*'),
    supabase.from('employees').select('id').eq('status', 'approved'),
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
  const locations = await getLocationsWithCounts();

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Locations</h1>
      <LocationsList initialLocations={locations} />
    </div>
  );
}
