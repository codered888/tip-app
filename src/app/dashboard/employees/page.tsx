import Link from 'next/link';
import Image from 'next/image';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { createAdminClient } from '@/lib/supabase';
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

async function getEmployeesWithLocations(organizationId: string) {
  const supabase = createAdminClient();

  const [employeesResult, locationsResult, employeeLocationsResult] = await Promise.all([
    supabase
      .from('employees')
      .select('*')
      .eq('organization_id', organizationId)
      .order('name'),
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

export default async function EmployeesPage() {
  const headersList = await headers();
  const orgSlug = headersList.get('x-organization-slug');

  if (!orgSlug) {
    redirect('/');
  }

  const org = await getOrganization(orgSlug);
  if (!org) {
    redirect('/');
  }

  const employees = await getEmployeesWithLocations(org.id);

  const approved = employees.filter((e) => e.status === 'approved');
  const pending = employees.filter((e) => e.status === 'pending');

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-[var(--stone-800)]">Employees</h1>
      </div>

      {/* Approved Employees */}
      <h2 className="text-lg font-semibold text-[var(--stone-800)] mb-4">
        Active Employees ({approved.length})
      </h2>

      {approved.length === 0 ? (
        <p className="text-[var(--stone-500)] mb-8">No active employees yet.</p>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-8">
          <table className="w-full">
            <thead className="bg-[var(--stone-50)] border-b border-[var(--stone-200)]">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-[var(--stone-500)] uppercase tracking-wider">
                  Employee
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-[var(--stone-500)] uppercase tracking-wider">
                  Locations
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-[var(--stone-500)] uppercase tracking-wider">
                  Payment Methods
                </th>
                <th className="text-right px-6 py-3 text-xs font-medium text-[var(--stone-500)] uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--stone-200)]">
              {approved.map((employee) => (
                <tr key={employee.id}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[var(--stone-100)] overflow-hidden flex-shrink-0">
                        {employee.photo_url ? (
                          <Image
                            src={employee.photo_url}
                            alt={employee.name}
                            width={40}
                            height={40}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[var(--stone-400)]">
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                            </svg>
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-[var(--stone-800)]">{employee.name}</div>
                        {employee.bio && (
                          <div className="text-sm text-[var(--stone-500)] truncate max-w-xs">
                            {employee.bio}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {employee.locations.map((loc) => (
                        <span
                          key={loc.id}
                          className="inline-block px-2 py-1 bg-[var(--stone-100)] text-[var(--stone-700)] text-xs rounded"
                        >
                          {loc.name}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2 text-xs">
                      {employee.venmo && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">Venmo</span>
                      )}
                      {employee.cashapp && (
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded">Cash App</span>
                      )}
                      {employee.zelle && (
                        <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded">Zelle</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/dashboard/employees/${employee.id}`}
                      className="text-[var(--sage-600)] hover:text-[var(--sage-700)] text-sm font-medium"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pending Section */}
      {pending.length > 0 && (
        <>
          <h2 className="text-lg font-semibold text-[var(--stone-800)] mb-4">
            Pending Approval ({pending.length})
          </h2>
          <div className="bg-yellow-50 rounded-xl p-4 mb-4">
            <p className="text-yellow-800 text-sm">
              Go to{' '}
              <Link href="/dashboard/pending" className="underline font-medium">
                Pending Approvals
              </Link>{' '}
              to review and approve these employees.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
