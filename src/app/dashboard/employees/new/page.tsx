import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { createAdminClient } from '@/lib/supabase';
import NewEmployeeForm from './NewEmployeeForm';
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

async function getLocations(organizationId: string) {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from('locations')
    .select('*')
    .eq('organization_id', organizationId)
    .order('name');
  return (data || []) as Location[];
}

export default async function NewEmployeePage() {
  const headersList = await headers();
  const orgSlug = headersList.get('x-organization-slug');

  if (!orgSlug) {
    redirect('/');
  }

  const org = await getOrganization(orgSlug);
  if (!org) {
    redirect('/');
  }

  const locations = await getLocations(org.id);

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--stone-800)] mb-8">Add Employee</h1>
      <div className="max-w-2xl">
        <NewEmployeeForm locations={locations} />
      </div>
    </div>
  );
}
