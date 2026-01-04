import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
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
    const authenticated = await isAuthenticated();
    if (!authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name } = await request.json();

    if (!name?.trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const supabase = createAdminClient();
    const slug = generateSlug(name);

    // Check if slug already exists
    const { data: existing } = await supabase
      .from('locations')
      .select('id')
      .eq('slug', slug)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'A location with a similar name already exists' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('locations')
      .insert({ name: name.trim(), slug })
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
