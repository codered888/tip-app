import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
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
    // Create Supabase client with cookies for auth check
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll() {
            // no-op for API routes - we don't need to set cookies here
          },
        },
      }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError) {
      console.error('Create location - auth error:', authError);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (!user) {
      console.error('Create location - no user found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get organization from request headers (set by middleware)
    const orgSlug = request.headers.get('x-organization-slug');

    if (!orgSlug) {
      console.error('Create location - no org slug in headers');
      return NextResponse.json({ error: 'Organization not found' }, { status: 400 });
    }

    const adminSupabase = createAdminClient();
    const { data: org, error: orgError } = await adminSupabase
      .from('organizations')
      .select('id')
      .eq('slug', orgSlug)
      .maybeSingle();

    if (orgError) {
      console.error('Create location - org lookup error:', orgError);
      return NextResponse.json({ error: 'Organization not found' }, { status: 400 });
    }

    if (!org?.id) {
      console.error('Create location - org not found:', orgSlug);
      return NextResponse.json({ error: 'Organization not found' }, { status: 400 });
    }

    const organizationId = org.id;

    const { name } = await request.json();

    if (!name?.trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const slug = generateSlug(name);

    // Check if slug already exists within this organization
    const { data: existing } = await adminSupabase
      .from('locations')
      .select('id')
      .eq('slug', slug)
      .eq('organization_id', organizationId)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { error: 'A location with a similar name already exists' },
        { status: 400 }
      );
    }

    const { data, error } = await adminSupabase
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
