import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authenticated = await isAuthenticated();
    if (!authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const formData = await request.formData();

    const name = formData.get('name') as string;
    const bio = formData.get('bio') as string;
    const venmo = formData.get('venmo') as string;
    const cashapp = formData.get('cashapp') as string;
    const zelle = formData.get('zelle') as string;
    const status = formData.get('status') as 'pending' | 'approved';
    const locationIds = JSON.parse(formData.get('locationIds') as string) as string[];
    const photo = formData.get('photo') as File | null;

    if (!name?.trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Upload photo if provided
    let photoUrl: string | undefined;
    if (photo && photo.size > 0) {
      const fileExt = photo.name.split('.').pop();
      const fileName = `${id}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('photos')
        .upload(fileName, photo, {
          upsert: true,
          contentType: photo.type,
        });

      if (!uploadError) {
        const { data: urlData } = supabase.storage
          .from('photos')
          .getPublicUrl(fileName);
        photoUrl = urlData.publicUrl;
      }
    }

    // Update employee
    const updateData: Record<string, unknown> = {
      name: name.trim(),
      bio: bio?.trim() || null,
      venmo: venmo?.trim() || null,
      cashapp: cashapp?.trim() || null,
      zelle: zelle?.trim() || null,
      status,
    };

    if (photoUrl) {
      updateData.photo_url = photoUrl;
    }

    const { error: updateError } = await supabase
      .from('employees')
      .update(updateData)
      .eq('id', id);

    if (updateError) {
      throw updateError;
    }

    // Update locations
    await supabase
      .from('employee_locations')
      .delete()
      .eq('employee_id', id);

    if (locationIds.length > 0) {
      const locationInserts = locationIds.map((locationId) => ({
        employee_id: id,
        location_id: locationId,
      }));

      await supabase.from('employee_locations').insert(locationInserts);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update employee error:', error);
    return NextResponse.json({ error: 'Failed to update employee' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authenticated = await isAuthenticated();
    if (!authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const supabase = createAdminClient();

    // Delete employee (cascades to employee_locations)
    const { error } = await supabase
      .from('employees')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete employee error:', error);
    return NextResponse.json({ error: 'Failed to delete employee' }, { status: 500 });
  }
}
