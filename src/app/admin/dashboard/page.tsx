import Link from 'next/link';
import { createAdminClient } from '@/lib/supabase';
import SignupLinkDisplay from './SignupLinkDisplay';
import type { Location, Employee } from '@/lib/types';

async function getDashboardData() {
  const supabase = createAdminClient();

  const [locationsResult, employeesResult, pendingResult] = await Promise.all([
    supabase.from('locations').select('*').order('name'),
    supabase.from('employees').select('*').eq('status', 'approved'),
    supabase.from('employees').select('*').eq('status', 'pending'),
  ]);

  const locations = (locationsResult.data || []) as Location[];
  const employees = (employeesResult.data || []) as Employee[];
  const pending = (pendingResult.data || []) as Employee[];

  // Get employee counts per location
  const { data: employeeLocations } = await supabase
    .from('employee_locations')
    .select('location_id, employee_id');

  const locationCounts: Record<string, number> = {};
  const approvedEmployeeIds = new Set(employees.map((e) => e.id));

  (employeeLocations || []).forEach((el) => {
    if (approvedEmployeeIds.has(el.employee_id)) {
      locationCounts[el.location_id] = (locationCounts[el.location_id] || 0) + 1;
    }
  });

  return { locations, employees, pending, locationCounts };
}

export default async function DashboardPage() {
  const { locations, employees, pending, locationCounts } = await getDashboardData();

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <Link
          href="/admin/pending"
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            pending.length > 0
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-gray-100 text-gray-600'
          }`}
        >
          {pending.length} Pending Approval{pending.length !== 1 ? 's' : ''}
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="text-3xl font-bold text-gray-900">{locations.length}</div>
          <div className="text-gray-600 text-sm">Locations</div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="text-3xl font-bold text-gray-900">{employees.length}</div>
          <div className="text-gray-600 text-sm">Active Employees</div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="text-3xl font-bold text-yellow-600">{pending.length}</div>
          <div className="text-gray-600 text-sm">Pending Approval</div>
        </div>
      </div>

      {/* Locations Grid */}
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Locations</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {locations.map((location) => (
          <div key={location.id} className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-1">{location.name}</h3>
            <p className="text-sm text-gray-500 mb-3">
              {locationCounts[location.id] || 0} employee{locationCounts[location.id] !== 1 ? 's' : ''}
            </p>
            <div className="flex gap-2">
              <Link
                href={`/location/${location.slug}`}
                target="_blank"
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                View Page →
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Employee Signup Link */}
      <div className="mt-8 bg-white rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">
          Employee Signup Link
        </h2>
        <p className="text-gray-600 text-sm mb-4">
          Share this link with new employees so they can create their profile.
        </p>
        <SignupLinkDisplay />
      </div>
    </div>
  );
}
