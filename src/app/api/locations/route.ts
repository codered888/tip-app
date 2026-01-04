import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticatedLegacy, getOrganizationId } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase';

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export async function POST(request: NextRequest) {
  try {
    const authenticated = await isAuthenticatedLegacy();
    if (!authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get organization from context
    const organizationId = await getOrganizationId();
    if (!organizationId) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 400 });
    }

    const { name } = await request.json();

    if (!name?.trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const supabase = createAdminClient();
    const slug = generateSlug(name);

    // Check if slug already exists within this organization
    const { data: existing } = await supabase
      .from('locations')
      .select('id')
      .eq('slug', slug)
      .eq('organization_id', organizationId)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'A location with a similar name already exists' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('locations')
      .insert({
        name: name.trim(),
        slug,
        organization_id: organizationId,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Create location error:', error);
    return NextResponse.json({ error: 'Failed to create location' }, { status: 500 });
  }
}
