/**
 * GET /api/admin/teams/players — Belirli bir takımın oyuncularını getir
 * POST /api/admin/teams/players — Oyuncuyu takıma ekle veya transfer et
 * PATCH /api/admin/teams/players — Oyuncu güncelle
 * DELETE /api/admin/teams/players — Oyuncu sil
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
  const teamId = searchParams.get('teamId');

  if (!teamId) return NextResponse.json({ error: 'teamId zorunlu' }, { status: 400 });

  const { data: players, error } = await supabase
    .from('players')
    .select('*')
    .eq('profile_id', teamId)
    .order('rating', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ players: players || [] });
}

export async function POST(request: NextRequest) {
  // Transfer a player from one team to another
  if (!await verifyAdmin(request)) return NextResponse.json({ error: 'Yetkisiz' }, { status: 403 });
  if (!isSupabaseConfigured()) return NextResponse.json({ error: 'Supabase yok' }, { status: 500 });

  const supabase = getServiceSupabase()!;
  const body = await request.json();
  const { playerId, targetTeamId } = body;

  if (!playerId || !targetTeamId) {
    return NextResponse.json({ error: 'playerId ve targetTeamId zorunlu' }, { status: 400 });
  }

  // Get target team info
  const { data: targetTeam } = await supabase
    .from('profiles')
    .select('team_name')
    .eq('id', targetTeamId)
    .single();

  // Update player's team
  const { data, error } = await supabase
    .from('players')
    .update({
      profile_id: targetTeamId,
      team_name: targetTeam?.team_name || 'Bilinmeyen',
    })
    .eq('id', playerId)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true, player: data });
}

export async function PATCH(request: NextRequest) {
  if (!await verifyAdmin(request)) return NextResponse.json({ error: 'Yetkisiz' }, { status: 403 });
  if (!isSupabaseConfigured()) return NextResponse.json({ error: 'Supabase yok' }, { status: 500 });

  const supabase = getServiceSupabase()!;
  const body = await request.json();
  const { playerId, updates } = body;

  if (!playerId || !updates) return NextResponse.json({ error: 'playerId ve updates zorunlu' }, { status: 400 });

  // Allow updating almost all player fields
  const allowedFields = [
    'name', 'position', 'specific_position', 'rating', 'potential', 'hidden_potential',
    'age', 'market_value', 'salary', 'contract_end_week',
    'speed', 'power', 'passing', 'shooting', 'defending', 'vision', 'control', 'heading', 'goalkeeping',
    'finishing', 'dribbling', 'first_touch', 'crossing', 'marking', 'tackling_detailed',
    'technique', 'long_shots', 'off_the_ball',
    'aggression', 'bravery', 'work_rate', 'decisions', 'determination',
    'concentration', 'leadership', 'anticipation', 'flair', 'positioning', 'composure', 'teamwork',
    'acceleration', 'agility', 'balance', 'strength', 'stamina', 'jumping',
    'cond', 'form', 'morale', 'confidence', 'form_rating',
    'goals', 'assists', 'yellow_cards', 'red_cards', 'matches_played', 'clean_sheets',
    'is_injured', 'is_free_agent', 'is_for_sale', 'nation', 'preferred_foot',
    'personality', 'play_style', 'archetype',
  ];
  const filteredUpdates: Record<string, unknown> = {};
  for (const key of allowedFields) {
    if (updates[key] !== undefined) filteredUpdates[key] = updates[key];
  }

  if (Object.keys(filteredUpdates).length === 0) {
    return NextResponse.json({ error: 'Güncellenecek alan yok' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('players')
    .update(filteredUpdates)
    .eq('id', playerId)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true, player: data });
}

export async function DELETE(request: NextRequest) {
  if (!await verifyAdmin(request)) return NextResponse.json({ error: 'Yetkisiz' }, { status: 400 });
  if (!isSupabaseConfigured()) return NextResponse.json({ error: 'Supabase yok' }, { status: 500 });

  const supabase = getServiceSupabase()!;
  const { searchParams } = new URL(request.url);
  const playerId = searchParams.get('playerId');

  if (!playerId) return NextResponse.json({ error: 'playerId zorunlu' }, { status: 400 });

  const { error } = await supabase.from('players').delete().eq('id', playerId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
