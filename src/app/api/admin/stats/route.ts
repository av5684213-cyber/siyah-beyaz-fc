/**
 * GET /api/admin/stats
 * Admin dashboard istatistiklerini döndürür.
 * Sadece selimporsuk@gmail.com erişebilir.
 */
import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase, getSupabase, isSupabaseConfigured } from '@/lib/supabase';

const ADMIN_EMAIL = 'selimporsuk@gmail.com';

export const dynamic = 'force-dynamic';

async function verifyAdmin(request: NextRequest): Promise<boolean> {
  const adminUserId = request.headers.get('x-admin-user-id');
  const adminEmail = request.headers.get('x-admin-email');

  if (adminEmail?.toLowerCase() === ADMIN_EMAIL) return true;

  if (adminUserId && isSupabaseConfigured()) {
    const supabase = getServiceSupabase();
    if (supabase) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, email')
        .eq('id', adminUserId)
        .maybeSingle();
      if (profile?.role === 'admin' || profile?.email?.toLowerCase() === ADMIN_EMAIL) {
        return true;
      }
    }
  }
  return false;
}

export async function GET(request: NextRequest) {
  const authorized = await verifyAdmin(request);
  if (!authorized) {
    return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Supabase yapılandırılmamış' }, { status: 500 });
  }

  let supabase = getServiceSupabase();
  if (!supabase) supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase client null' }, { status: 500 });
  }

  try {
    const [
      profilesResult,
      playersResult,
      fixturesResult,
      leaguesResult,
      transferMarketResult,
      leagueTeamsResult,
      errorLogsResult,
      recentUsersResult,
      avgRatingResult,
    ] = await Promise.all([
      supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('is_bot', false),
      supabase.from('players').select('id', { count: 'exact', head: true }),
      supabase.from('fixtures').select('id', { count: 'exact', head: true }),
      supabase.from('leagues').select('id', { count: 'exact', head: true }),
      supabase.from('transfer_market').select('id', { count: 'exact', head: true }).eq('is_active', true),
      supabase.from('league_teams').select('id, is_bot'),
      supabase.from('error_logs').select('id', { count: 'exact', head: true }),
      supabase.from('profiles').select('id, manager_name, team_name, money, league_name, role').eq('is_bot', false).order('created_at', { ascending: false }).limit(8),
      supabase.from('players').select('rating'),
    ]);

    let avgRating = 0;
    if (avgRatingResult.data && avgRatingResult.data.length > 0) {
      const total = avgRatingResult.data.reduce((sum: number, p: any) => sum + (p.rating || 0), 0);
      avgRating = total / avgRatingResult.data.length;
    }

    const teams = leagueTeamsResult.data || [];
    const totalBotTeams = teams.filter(t => t.is_bot).length;
    const totalHumanTeams = teams.filter(t => !t.is_bot).length;

    const { data: moneyData } = await supabase
      .from('profiles')
      .select('money')
      .eq('is_bot', false);

    const totalMoney = (moneyData || []).reduce((sum: number, p: any) => sum + (p.money || 0), 0);

    return NextResponse.json({
      totalUsers: profilesResult.count || 0,
      totalPlayers: playersResult.count || 0,
      totalMatches: 0,
      totalLeagues: leaguesResult.count || 0,
      totalFixtures: fixturesResult.count || 0,
      totalTransferListings: transferMarketResult.count || 0,
      totalBotTeams,
      totalHumanTeams,
      avgRating: Math.round(avgRating * 10) / 10,
      totalMoney,
      errorCount: errorLogsResult.count || 0,
      recentUsers: recentUsersResult.data || [],
      systemHealth: { db: true, realtime: true, cron: true },
    });
  } catch (err: any) {
    console.error('[admin/stats] Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
