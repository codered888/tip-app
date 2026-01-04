import { createAdminClient } from '@/lib/supabase';
import NewEmployeeForm from './NewEmployeeForm';
import type { Location } from '@/lib/types';

async function getLocations() {
  const supabase = createAdminClient();
  const { data } = await supabase.from('locations').select('*').order('name');
  return (data || []) as Location[];
}

export default async function NewEmployeePage() {
  const locations = await getLocations();

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Add Employee</h1>
      <div className="max-w-2xl">
        <NewEmployeeForm locations={locations} />
      </div>
    </div>
  );
}
