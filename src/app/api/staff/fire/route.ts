/**
 * Staff Fire API — Personel işten çıkar
 * DELETE /api/staff/fire
 * Body: { userId, staffId }
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';

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
    const { userId, staffId } = body;

    if (!userId || !staffId) {
      return NextResponse.json({ error: true, message: 'userId ve staffId zorunlu.' }, { status: 400 });
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
    console.error('[DELETE /api/staff/fire] Exception:', err);
    return NextResponse.json({ error: true, message: 'Bir hata oluştu.' }, { status: 500 });
  }
}
