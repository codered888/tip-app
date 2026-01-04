import { notFound } from 'next/navigation';
import { createAdminClient } from '@/lib/supabase';
import EmployeeEditForm from './EmployeeEditForm';
import type { Employee, Location, EmployeeLocation } from '@/lib/types';

interface PageProps {
  params: Promise<{ id: string }>;
}

async function getEmployee(id: string) {
  const supabase = createAdminClient();

  const [employeeResult, locationsResult, employeeLocationsResult] = await Promise.all([
    supabase.from('employees').select('*').eq('id', id).single(),
    supabase.from('locations').select('*').order('name'),
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
  const { id } = await params;
  const data = await getEmployee(id);

  if (!data) {
    notFound();
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Edit Employee</h1>
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
