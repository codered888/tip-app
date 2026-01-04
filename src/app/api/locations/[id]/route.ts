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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const { name } = await request.json();

    if (!name?.trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const supabase = createAdminClient();
    const slug = generateSlug(name);

    // Verify location belongs to this organization
    const { data: existingLocation } = await supabase
      .from('locations')
      .select('id')
      .eq('id', id)
      .eq('organization_id', organizationId)
      .single();

    if (!existingLocation) {
      return NextResponse.json({ error: 'Location not found' }, { status: 404 });
    }

    // Check if slug already exists for a different location in this org
    const { data: existing } = await supabase
      .from('locations')
      .select('id')
      .eq('slug', slug)
      .eq('organization_id', organizationId)
      .neq('id', id)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'A location with a similar name already exists' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('locations')
      .update({ name: name.trim(), slug })
      .eq('id', id)
      .eq('organization_id', organizationId);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update location error:', error);
    return NextResponse.json({ error: 'Failed to update location' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const supabase = createAdminClient();

    // Delete location (only if it belongs to this organization)
    const { error } = await supabase
      .from('locations')
      .delete()
      .eq('id', id)
      .eq('organization_id', organizationId);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete location error:', error);
    return NextResponse.json({ error: 'Failed to delete location' }, { status: 500 });
  }
}
