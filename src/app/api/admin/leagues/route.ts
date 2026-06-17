/**
 * GET /api/admin/leagues — Lig listele + takım bilgileri
 * POST /api/admin/leagues — Lig oluştur / sıfırla / sezon oluştur
 */
import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase, getSupabase, isSupabaseConfigured } from '@/lib/supabase';

const ADMIN_EMAIL = 'selimporsuk@gmail.com';
export const dynamic = 'force-dynamic';

async function verifyAdmin(request: NextRequest): Promise<boolean> {
  const adminEmail = request.headers.get('x-admin-email');
  if (adminEmail?.toLowerCase() === ADMIN_EMAIL) return true;
  const adminUserId = request.headers.get('x-admin-user-id');
  if (adminUserId && isSupabaseConfigured()) {
    let supabase = getServiceSupabase();
    if (!supabase) supabase = getSupabase();
    if (supabase) {
      const { data: profile } = await supabase.from('profiles').select('role, email').eq('id', adminUserId).maybeSingle();
      if (profile?.role === 'admin' || profile?.email?.toLowerCase() === ADMIN_EMAIL) return true;
    }
  }
  return false;
}

export async function GET(request: NextRequest) {
  if (!await verifyAdmin(request)) return NextResponse.json({ error: 'Yetkisiz' }, { status: 403 });
  if (!isSupabaseConfigured()) return NextResponse.json({ error: 'Supabase yok' }, { status: 500 });

  const supabase = getServiceSupabase()!;

  // Get all leagues with team counts
  const { data: leagues, error: leaguesError } = await supabase
    .from('leagues')
    .select('id, name, tier, created_at')
    .order('tier', { ascending: true });

  if (leaguesError) return NextResponse.json({ error: leaguesError.message }, { status: 500 });

  // Get team counts per league
  const { data: teamCounts } = await supabase
    .from('league_teams')
    .select('league_id, id')
    .order('league_id');

  const countMap: Record<string, number> = {};
  (teamCounts || []).forEach((t: any) => {
    countMap[t.league_id] = (countMap[t.league_id] || 0) + 1;
  });

  // Get season info
  const { data: seasons } = await supabase
    .from('seasons')
    .select('id, league_id, name, status, current_tur, is_finished')
    .order('created_at', { ascending: false });

  const seasonMap: Record<string, any> = {};
  (seasons || []).forEach((s: any) => {
    if (!seasonMap[s.league_id]) seasonMap[s.league_id] = s;
  });

  const enrichedLeagues = (leagues || []).map((l: any) => ({
    ...l,
    team_count: countMap[l.id] || 0,
    current_season: seasonMap[l.id] || null,
  }));

  return NextResponse.json({ leagues: enrichedLeagues });
}

export async function POST(request: NextRequest) {
  if (!await verifyAdmin(request)) return NextResponse.json({ error: 'Yetkisiz' }, { status: 403 });
  if (!isSupabaseConfigured()) return NextResponse.json({ error: 'Supabase yok' }, { status: 500 });

  const supabase = getServiceSupabase()!;
  const body = await request.json();
  const { action, leagueId, seasonName } = body;

  if (action === 'create_season' && leagueId) {
    const { data, error } = await supabase.from('seasons').insert({
      league_id: leagueId,
      name: seasonName || 'Yeni Sezon',
      status: 'active',
      is_finished: false,
      current_tur: 1,
    }).select().single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, season: data });
  }

  if (action === 'finish_season' && leagueId) {
    const { error } = await supabase.from('seasons')
      .update({ is_finished: true, status: 'finished' })
      .eq('league_id', leagueId)
      .eq('is_finished', false);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, message: 'Sezon tamamlandı' });
  }

  if (action === 'reset_standings' && leagueId) {
    const { error } = await supabase.from('league_standings')
      .delete()
      .eq('league_id', leagueId);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, message: 'Puan durumu sıfırlandı' });
  }

  return NextResponse.json({ error: 'Geçersiz işlem' }, { status: 400 });
}
