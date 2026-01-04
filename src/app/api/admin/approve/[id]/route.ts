import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticatedLegacy, getOrganizationId } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase';

export async function POST(
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

    // Approve employee (only if it belongs to this organization)
    const { error } = await supabase
      .from('employees')
      .update({ status: 'approved' })
      .eq('id', id)
      .eq('organization_id', organizationId);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Approve employee error:', error);
    return NextResponse.json({ error: 'Failed to approve employee' }, { status: 500 });
  }
}
