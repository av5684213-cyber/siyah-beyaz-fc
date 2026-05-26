/**
 * POST /api/scout/search
 * Keşif arama endpoint'i — kullanıcının scout seviyesine göre
 * oyuncu araması yapar.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import { generateScoutingReport, type ScoutFilters } from '@/lib/fm/aiScout';
import { verifyProfileExists } from '@/lib/fm/security';
import { createErrorResponse } from '@/lib/api-error-handler';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { profileId, filters } = body as {
      profileId: string;
      filters?: ScoutFilters;
    };

    if (!profileId) {
      return NextResponse.json({ error: 'profileId gerekli' }, { status: 400 });
    }

    if (!isSupabaseConfigured()) {
      return NextResponse.json({ error: 'Supabase yapılandırılmamış' }, { status: 500 });
    }

    const supabase = getSupabase();
    if (!supabase) {
      return NextResponse.json({ error: 'Supabase bağlantı hatası' }, { status: 500 });
    }

    // Verify profile exists
    const { valid, error: profileError, status: profileStatus } = await verifyProfileExists(supabase, profileId);
    if (!valid) {
      return NextResponse.json({ error: profileError || 'Profil bulunamadı' }, { status: profileStatus || 404 });
    }

    // Kullanıcının scout seviyesini staff tablosundan oku
    const { count: scoutCount } = await supabase
      .from('staff')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', profileId)
      .eq('type', 'scout');

    const scoutLevel = Math.min(3, scoutCount || 0);
    if (scoutLevel < 1) {
      return NextResponse.json({ error: 'Gözlemciniz bulunmuyor' }, { status: 403 });
    }

    // Scout kalitesi hesapla
    const { data: scoutData } = await supabase
      .from('staff')
      .select('stars')
      .eq('user_id', profileId)
      .eq('type', 'scout');

    const avgStars = scoutData && scoutData.length > 0
      ? scoutData.reduce((sum: number, s: Record<string, unknown>) => sum + ((s.stars as number) || 1), 0) / scoutData.length
      : 1;
    const scoutQuality = avgStars * 20; // 1-5 stars → 20-100 quality

    // Keşif raporu oluştur
    const report = await generateScoutingReport(
      { ...filters, scoutLevel },
      scoutQuality
    );

    return NextResponse.json({ success: true, report });
  } catch (err) {
    return createErrorResponse(err, { route: '/api/scout/search', method: 'POST' });
  }
}
