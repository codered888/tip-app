import { createAdminClient } from '@/lib/supabase';
import PendingList from './PendingList';
import type { Employee, Location, EmployeeLocation } from '@/lib/types';

async function getPendingEmployees() {
  const supabase = createAdminClient();

  // First fetch pending employees and locations
  const [employeesResult, locationsResult] = await Promise.all([
    supabase.from('employees').select('*').eq('status', 'pending').order('created_at', { ascending: false }),
    supabase.from('locations').select('*'),
  ]);

  const employees = (employeesResult.data || []) as Employee[];
  const locations = (locationsResult.data || []) as Location[];
  const locationsMap = new Map(locations.map((l) => [l.id, l]));

  // Only fetch employee_locations for pending employees (not ALL)
  const employeeIds = employees.map((e) => e.id);
  let employeeLocations: EmployeeLocation[] = [];

  if (employeeIds.length > 0) {
    const { data } = await supabase
      .from('employee_locations')
      .select('*')
      .in('employee_id', employeeIds);
    employeeLocations = (data || []) as EmployeeLocation[];
  }

  return employees.map((employee) => {
    const empLocations = employeeLocations
      .filter((el) => el.employee_id === employee.id)
      .map((el) => locationsMap.get(el.location_id))
      .filter(Boolean) as Location[];

    return { ...employee, locations: empLocations };
  });
}

export default async function PendingPage() {
  const pendingEmployees = await getPendingEmployees();

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Pending Approvals</h1>

      {pendingEmployees.length === 0 ? (
        <div className="bg-white rounded-xl p-12 shadow-sm text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-lg font-medium text-gray-900 mb-2">All caught up!</h2>
          <p className="text-gray-500">No pending employee approvals at this time.</p>
        </div>
      ) : (
        <PendingList employees={pendingEmployees} />
      )}
    </div>
  );
}
