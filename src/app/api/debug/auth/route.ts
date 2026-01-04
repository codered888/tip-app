import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { createAdminClient } from '@/lib/supabase';

export async function GET() {
  try {
    const cookieStore = await cookies();

    // Create Supabase client to get current user
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // Ignore
            }
          },
        },
      }
    );

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({
        authenticated: false,
        error: authError?.message || 'No user session found',
      });
    }

    const adminSupabase = createAdminClient();

    // Check users table
    const { data: userRecord, error: userError } = await adminSupabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    // Check organization_members table
    const { data: memberships, error: membershipError } = await adminSupabase
      .from('organization_members')
      .select('*')
      .eq('user_id', user.id);

    // If membership found, get organization details
    let organizations = [];
    if (memberships && memberships.length > 0) {
      const orgIds = memberships.map(m => m.organization_id);
      const { data: orgs, error: orgsError } = await adminSupabase
        .from('organizations')
        .select('*')
        .in('id', orgIds);

      if (orgsError) {
        console.error('Orgs lookup error:', orgsError);
      }
      organizations = orgs || [];
    }

    // Also get all organizations for comparison
    const { data: allOrgs } = await adminSupabase
      .from('organizations')
      .select('id, name, slug')
      .limit(10);

    return NextResponse.json({
      authenticated: true,
      authUser: {
        id: user.id,
        email: user.email,
      },
      userRecord: userRecord || null,
      userRecordError: userError?.message || null,
      memberships: memberships || [],
      membershipError: membershipError?.message || null,
      organizations,
      allOrganizations: allOrgs || [],
    });
  } catch (error) {
    console.error('Debug auth error:', error);
    return NextResponse.json(
      { error: 'Debug endpoint failed', details: String(error) },
      { status: 500 }
    );
  }
}
