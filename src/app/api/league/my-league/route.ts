import { NextRequest, NextResponse } from 'next/server';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import { getUserLeagueInfo } from '@/lib/fm/leagueHelpers';
import { createErrorResponse } from '@/lib/api-error-handler';

/**
 * Kullanıcının mevcut lig bilgisini döndürür.
 * GET /api/league/my-league?profileId=xxx
 *
 * Döndürdüğü veriler:
 * - leagueId, leagueName, tier
 * - position, totalTeams, points
 * - promotionZone, playoffZone, relegationZone
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const profileId = searchParams.get('profileId');

  if (!profileId) {
    return NextResponse.json({ error: 'profileId gerekli' }, { status: 400 });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
  }

  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ error: 'No Supabase client' }, { status: 500 });
  }

  try {
    const leagueInfo = await getUserLeagueInfo(supabase, profileId);

    if (!leagueInfo) {
      return NextResponse.json({
        found: false,
        message: 'Kullanıcının lig kaydı bulunamadı',
      });
    }

    return NextResponse.json({
      found: true,
      ...leagueInfo,
    });
  } catch (err: any) {
    return createErrorResponse(err, { route: '/api/league/my-league', method: 'GET' });
  }
}
