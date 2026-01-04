import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const name = formData.get('name') as string;
    const bio = formData.get('bio') as string;
    const venmo = formData.get('venmo') as string;
    const cashapp = formData.get('cashapp') as string;
    const zelle = formData.get('zelle') as string;
    const locationIds = JSON.parse(formData.get('locationIds') as string) as string[];
    const photo = formData.get('photo') as File | null;

    // Validation
    if (!name?.trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    if (!venmo && !cashapp && !zelle) {
      return NextResponse.json(
        { error: 'At least one payment method is required' },
        { status: 400 }
      );
    }

    if (!locationIds || locationIds.length === 0) {
      return NextResponse.json(
        { error: 'At least one location is required' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Create new employee
    const { data: newEmployee, error: insertError } = await supabase
      .from('employees')
      .insert({
        name: name.trim(),
        bio: bio?.trim() || null,
        venmo: venmo?.trim() || null,
        cashapp: cashapp?.trim() || null,
        zelle: zelle?.trim() || null,
        status: 'pending',
      })
      .select('id')
      .single();

    if (insertError) {
      throw insertError;
    }

    const employeeId = newEmployee.id;

    // Upload photo if provided
    if (photo && photo.size > 0) {
      const fileExt = photo.name.split('.').pop();
      const fileName = `${employeeId}.${fileExt}`;

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

        await supabase
          .from('employees')
          .update({ photo_url: urlData.publicUrl })
          .eq('id', employeeId);
      }
    }

    // Add location associations
    const locationInserts = locationIds.map((locationId) => ({
      employee_id: employeeId,
      location_id: locationId,
    }));

    const { error: locationsError } = await supabase
      .from('employee_locations')
      .insert(locationInserts);

    if (locationsError) {
      throw locationsError;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Failed to submit profile' },
      { status: 500 }
    );
  }
}
