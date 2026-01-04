import { notFound, redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { createAdminClient } from '@/lib/supabase';
import EmployeeEditForm from './EmployeeEditForm';
import type { Employee, Location, EmployeeLocation, Organization } from '@/lib/types';

interface PageProps {
  params: Promise<{ id: string }>;
}

async function getOrganization(slug: string) {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from('organizations')
    .select('*')
    .eq('slug', slug)
    .single();
  return data as Organization | null;
}

async function getEmployee(id: string, organizationId: string) {
  const supabase = createAdminClient();

  const [employeeResult, locationsResult, employeeLocationsResult] = await Promise.all([
    supabase
      .from('employees')
      .select('*')
      .eq('id', id)
      .eq('organization_id', organizationId)
      .single(),
    supabase
      .from('locations')
      .select('*')
      .eq('organization_id', organizationId)
      .order('name'),
    supabase.from('employee_locations').select('*').eq('employee_id', id),
  ]);

  if (employeeResult.error || !employeeResult.data) {
    return null;
  }

  const employee = employeeResult.data as Employee;
  const locations = (locationsResult.data || []) as Location[];
  const employeeLocations = (employeeLocationsResult.data || []) as EmployeeLocation[];
  const employeeLocationIds = employeeLocations.map((el) => el.location_id);

  return { employee, locations, employeeLocationIds };
}

export default async function EmployeeEditPage({ params }: PageProps) {
  const headersList = await headers();
  const orgSlug = headersList.get('x-organization-slug');

  if (!orgSlug) {
    redirect('/');
  }

  const org = await getOrganization(orgSlug);
  if (!org) {
    redirect('/');
  }

  const { id } = await params;
  const data = await getEmployee(id, org.id);

  if (!data) {
    notFound();
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--stone-800)] mb-8">Edit Employee</h1>
      <div className="max-w-2xl">
        <EmployeeEditForm
          employee={data.employee}
          locations={data.locations}
          initialLocationIds={data.employeeLocationIds}
        />
      </div>
    </div>
  );
}
