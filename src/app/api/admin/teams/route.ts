/**
 * GET /api/admin/teams — Tüm takımları listele (bot dahil)
 * PATCH /api/admin/teams — Herhangi bir takımı güncelle
 * DELETE /api/admin/teams — Bir takımı sil
 * Sadece selimporsuk@gmail.com
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
  const limit = parseInt(searchParams.get('limit') || '30');
  const search = searchParams.get('search') || '';
  const tier = searchParams.get('tier') || '';
  const botFilter = searchParams.get('is_bot'); // 'true', 'false', or null (all)

  let query = supabase
    .from('profiles')
    .select('id, manager_name, team_name, league_name, league_tier, league_position, level, xp, money, fans, reputation, credits, current_day, is_bot, bot_difficulty, role, primary_color, secondary_color, stadium_name, stadium_capacity, philosophy, staff_coaches, staff_physios, scout_slots, ticket_price, financial_health, created_at', { count: 'exact' })
    .order('league_tier', { ascending: true, nullsFirst: false });

  if (search) {
    query = query.or(`manager_name.ilike.%${search}%,team_name.ilike.%${search}%`);
  }
  if (tier) {
    query = query.eq('league_tier', parseInt(tier));
  }
  if (botFilter === 'true') {
    query = query.eq('is_bot', true);
  } else if (botFilter === 'false') {
    query = query.eq('is_bot', false);
  }

  query = query.range((page - 1) * limit, page * limit - 1);

  const { data: profiles, count, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Get player counts per team
  const teamIds = (profiles || []).map(p => p.id);
  const { data: playerCounts } = await supabase
    .from('players')
    .select('profile_id')
    .in('profile_id', teamIds);

  const playerCountMap: Record<string, number> = {};
  (playerCounts || []).forEach(p => {
    playerCountMap[p.profile_id] = (playerCountMap[p.profile_id] || 0) + 1;
  });

  const teamsWithCounts = (profiles || []).map(p => ({
    ...p,
    player_count: playerCountMap[p.id] || 0,
  }));

  return NextResponse.json({ teams: teamsWithCounts, total: count || 0, page, limit });
}

export async function PATCH(request: NextRequest) {
  if (!await verifyAdmin(request)) return NextResponse.json({ error: 'Yetkisiz' }, { status: 403 });
  if (!isSupabaseConfigured()) return NextResponse.json({ error: 'Supabase yok' }, { status: 500 });

  const supabase = getServiceSupabase()!;
  const body = await request.json();
  const { teamId, updates } = body;

  if (!teamId || !updates) return NextResponse.json({ error: 'teamId ve updates zorunlu' }, { status: 400 });

  const allowedFields = [
    'money', 'credits', 'level', 'xp', 'fans', 'reputation', 'role',
    'league_name', 'league_tier', 'league_position', 'current_day',
    'scout_slots', 'staff_coaches', 'staff_physios', 'stadium_capacity',
    'ticket_price', 'financial_health', 'primary_color', 'secondary_color',
    'stadium_name', 'philosophy', 'is_bot', 'bot_difficulty',
    'manager_name', 'team_name', 'tv_revenue_weekly', 'sponsors',
    'stadium_upgrades', 'season_badges', 'onboarding_completed',
  ];
  const filteredUpdates: Record<string, unknown> = {};
  for (const key of allowedFields) {
    if (updates[key] !== undefined) filteredUpdates[key] = updates[key];
  }

  if (Object.keys(filteredUpdates).length === 0) {
    return NextResponse.json({ error: 'Güncellenecek alan yok' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('profiles')
    .update(filteredUpdates)
    .eq('id', teamId)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true, team: data });
}

export async function DELETE(request: NextRequest) {
  if (!await verifyAdmin(request)) return NextResponse.json({ error: 'Yetkisiz' }, { status: 403 });
  if (!isSupabaseConfigured()) return NextResponse.json({ error: 'Supabase yok' }, { status: 500 });

  const supabase = getServiceSupabase()!;
  const { searchParams } = new URL(request.url);
  const teamId = searchParams.get('teamId');

  if (!teamId) return NextResponse.json({ error: 'teamId zorunlu' }, { status: 400 });

  // Delete related data
  await supabase.from('players').delete().eq('profile_id', teamId);
  await supabase.from('staff').delete().eq('user_id', teamId);
  await supabase.from('watchlist').delete().eq('user_id', teamId);
  await supabase.from('training_state').delete().eq('id', teamId);
  await supabase.from('active_tactics').delete().eq('id', teamId);
  await supabase.from('league_teams').update({ profile_id: null, is_bot: true }).eq('profile_id', teamId);
  await supabase.from('profiles').delete().eq('id', teamId);

  return NextResponse.json({ success: true, message: `Takım ${teamId} silindi` });
}
