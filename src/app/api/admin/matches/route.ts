/**
 * GET /api/admin/matches — Maç/fikstür listele
 * PATCH /api/admin/matches — Maç skoru güncelle
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
    const supabase = getServiceSupabase();
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
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '50');
  const status = searchParams.get('status') || '';

  let query = supabase
    .from('fixtures')
    .select('id, home_team_id, away_team_id, season_id, tur, match_date, status, home_score, away_score, competition_type, scheduled_time', { count: 'exact' })
    .order('match_date', { ascending: false })
    .range((page - 1) * limit, page * limit - 1);

  if (status) query = query.eq('status', status);

  const { data: fixtures, count, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Get team names
  const teamIds = new Set<string>();
  (fixtures || []).forEach((f: any) => { teamIds.add(f.home_team_id); teamIds.add(f.away_team_id); });

  let teamMap: Record<string, string> = {};
  if (teamIds.size > 0) {
    const { data: teams } = await supabase.from('league_teams').select('id, name').in('id', Array.from(teamIds));
    (teams || []).forEach((t: any) => { teamMap[t.id] = t.name; });
  }

  const enrichedFixtures = (fixtures || []).map((f: any) => ({
    ...f,
    home_team_name: teamMap[f.home_team_id] || 'Bilinmeyen',
    away_team_name: teamMap[f.away_team_id] || 'Bilinmeyen',
  }));

  return NextResponse.json({ fixtures: enrichedFixtures, total: count || 0, page, limit });
}

export async function PATCH(request: NextRequest) {
  if (!await verifyAdmin(request)) return NextResponse.json({ error: 'Yetkisiz' }, { status: 403 });
  if (!isSupabaseConfigured()) return NextResponse.json({ error: 'Supabase yok' }, { status: 500 });

  const supabase = getServiceSupabase()!;
  const body = await request.json();
  const { fixtureId, updates } = body;

  if (!fixtureId || !updates) return NextResponse.json({ error: 'fixtureId ve updates zorunlu' }, { status: 400 });

  const allowedFields = ['home_score', 'away_score', 'status', 'match_date', 'scheduled_time', 'events', 'match_data'];
  const filteredUpdates: Record<string, unknown> = {};
  for (const key of allowedFields) {
    if (updates[key] !== undefined) filteredUpdates[key] = updates[key];
  }

  if (Object.keys(filteredUpdates).length === 0) return NextResponse.json({ error: 'Güncellenecek alan yok' }, { status: 400 });

  const { data, error } = await supabase.from('fixtures').update(filteredUpdates).eq('id', fixtureId).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true, fixture: data });
}
