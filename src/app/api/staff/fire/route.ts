/**
 * Staff Fire API — Personel işten çıkar
 * DELETE /api/staff/fire
 * Body: { userId, staffId }
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import { verifyProfileExists } from '@/lib/fm/security';
import { createErrorResponse } from '@/lib/api-error-handler';
import { getAuthenticatedUserId } from '@/lib/apiAuth';

export async function DELETE(request: NextRequest) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ error: true, message: 'Supabase yapılandırılmamış.' }, { status: 500 });
    }

    const supabase = getSupabase();
    if (!supabase) {
      return NextResponse.json({ error: true, message: 'Supabase client null.' }, { status: 500 });
    }

    const body = await request.json();
    const { userId: bodyUserId, staffId } = body;
    const userId = getAuthenticatedUserId(request, bodyUserId);

    if (!userId || !staffId) {
      return NextResponse.json({ error: true, message: 'userId ve staffId zorunlu.' }, { status: 400 });
    }

    // Verify profile exists
    const { valid, error: profileError, status: profileStatus } = await verifyProfileExists(supabase, userId);
    if (!valid) {
      return NextResponse.json({ error: true, message: profileError || 'Profil bulunamadı.' }, { status: profileStatus || 404 });
    }

    // Validate the staff belongs to the user
    const { data: staffRecord, error: fetchError } = await supabase
      .from('staff')
      .select('id, name, type')
      .eq('id', staffId)
      .eq('user_id', userId)
      .maybeSingle();

    if (fetchError) {
      console.error('[DELETE /api/staff/fire] Fetch error:', fetchError.message);
      return NextResponse.json({ error: true, message: 'Personel bulunamadı.' }, { status: 404 });
    }

    if (!staffRecord) {
      return NextResponse.json({ error: true, message: 'Bu personel size ait değil.' }, { status: 403 });
    }

    // Delete the staff record (no refund)
    const { error: deleteError } = await supabase
      .from('staff')
      .delete()
      .eq('id', staffId)
      .eq('user_id', userId);

    if (deleteError) {
      console.error('[DELETE /api/staff/fire] Delete error:', deleteError.message);
      return NextResponse.json({ error: true, message: 'Personel çıkarılamadı.' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `${staffRecord.name} işten çıkarıldı.`,
    });
  } catch (err) {
    return createErrorResponse(err, { route: '/api/staff/fire', method: 'DELETE' });
  }
}
