/**
 * Oyuncu Gelişim Geçmişi API
 *
 * player_development_log tablosundan oyuncunun OVR değişikliklerini getirir.
 * Tablodaki sütun isimleri: old_ovr, new_ovr (veya eski: old_rating, new_rating),
 * change_reason (veya eski: reason), season_week, created_at
 *
 * GET /api/players/[id]/development-log
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import { getAuthenticatedUserId } from '@/lib/apiAuth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Supabase yapılandırılmamış' }, { status: 500 });
  }

  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase client null' }, { status: 500 });
  }

  try {
    const limitParam = request.nextUrl.searchParams.get('limit');
    const limit = Math.min(parseInt(limitParam || '10', 10), 50);

    // ── Sahiplik doğrulama (opsiyonel) ──
    // profileId query param ile sınırlama — verilmişse sadece o profile ait logları döndür
    const profileId = getAuthenticatedUserId(request, request.nextUrl.searchParams.get('profileId'));

    // Önce yeni sütun isimlerini dene (old_ovr, new_ovr, change_reason, season_week)
    // Eğer hata alırsan eski sütun isimlerine dön (old_rating, new_rating, reason)
    let query = supabase
      .from('player_development_log')
      .select('player_id, old_ovr, new_ovr, change_reason, season_week, match_performance_contribution, old_rating, new_rating, reason, created_at, profile_id')
      .eq('player_id', id)
      .order('created_at', { ascending: false })
      .limit(limit);

    // Eğer profileId verildiyse, sadece o kullanıcının oyuncusunun loglarını getir
    if (profileId) {
      query = query.eq('profile_id', profileId);
    }

    const { data, error } = await query;

    if (error) {
      // Tablo yoksa veya sütun yoksa boş dizi döndür
      console.warn('[development-log] Sorgu hatası:', error.message);
      return NextResponse.json([]);
    }

    const result = (data || []).map((row: any) => {
      // Yeni sütunlar mevcutsa onları kullan, yoksa eski sütunlardan düş
      const oldOvr = row.old_ovr ?? row.old_rating ?? 0;
      const newOvr = row.new_ovr ?? row.new_rating ?? 0;
      const changeReason = row.change_reason ?? row.reason ?? 'weekly_training';
      const seasonWeek = row.season_week ?? null;
      const matchContrib = row.match_performance_contribution ?? 0;

      return {
        week: seasonWeek,
        old_ovr: oldOvr,
        new_ovr: newOvr,
        ovr_change: parseFloat((newOvr - oldOvr).toFixed(1)),
        change_reason: changeReason,
        match_performance_contribution: matchContrib,
        week_label: row.created_at
          ? new Date(row.created_at).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short' })
          : '',
        created_at: row.created_at,
      };
    });

    return NextResponse.json(result);
  } catch (err) {
    console.warn('[development-log] Hata:', err);
    return NextResponse.json([], { status: 200 }); // Zarif geri dönüş
  }
}
