import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { createAdminClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
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

    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, slug } = await request.json();

    if (!name?.trim()) {
      return NextResponse.json({ error: 'Business name is required' }, { status: 400 });
    }

    if (!slug?.trim()) {
      return NextResponse.json({ error: 'URL slug is required' }, { status: 400 });
    }

    // Validate slug format
    if (!/^[a-z0-9-]+$/.test(slug)) {
      return NextResponse.json(
        { error: 'URL can only contain lowercase letters, numbers, and hyphens' },
        { status: 400 }
      );
    }

    // Reserved slugs
    const reserved = ['admin', 'api', 'www', 'app', 'dashboard', 'login', 'signup', 'auth'];
    if (reserved.includes(slug)) {
      return NextResponse.json({ error: 'This URL is not available' }, { status: 400 });
    }

    const adminSupabase = createAdminClient();

    // Check if slug already exists
    const { data: existing } = await adminSupabase
      .from('organizations')
      .select('id')
      .eq('slug', slug)
      .single();

    if (existing) {
      return NextResponse.json({ error: 'This URL is already taken' }, { status: 400 });
    }

    // Create organization
    const { data: org, error: orgError } = await adminSupabase
      .from('organizations')
      .insert({
        name: name.trim(),
        slug: slug.trim(),
      })
      .select()
      .single();

    if (orgError) {
      throw orgError;
    }

    // Ensure user exists in users table
    const { data: existingUser } = await adminSupabase
      .from('users')
      .select('id')
      .eq('id', user.id)
      .single();

    if (!existingUser) {
      // Create user record
      await adminSupabase.from('users').insert({
        id: user.id,
        email: user.email!,
        name: user.user_metadata?.name || user.email?.split('@')[0],
        role: 'customer_admin',
      });
    }

    // Add user as owner of the organization
    const { error: memberError } = await adminSupabase
      .from('organization_members')
      .insert({
        organization_id: org.id,
        user_id: user.id,
        role: 'owner',
      });

    if (memberError) {
      throw memberError;
    }

    return NextResponse.json({ success: true, organization: org });
  } catch (error) {
    console.error('Create organization error:', error);
    return NextResponse.json(
      { error: 'Failed to create organization' },
      { status: 500 }
    );
  }
}
