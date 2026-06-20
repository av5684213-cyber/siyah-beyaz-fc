/**
 * GET /api/admin/players — Oyuncu listele (filtreli)
 * PATCH /api/admin/players — Oyuncu güncelle
 * DELETE /api/admin/players — Oyuncu sil
 */
import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase, getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import { verifyAdminRequest } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';


export async function GET(request: NextRequest) {
  if (!(await verifyAdminRequest(request)).isAdmin) return NextResponse.json({ error: 'Yetkisiz' }, { status: 403 });
  if (!isSupabaseConfigured()) return NextResponse.json({ error: 'Supabase yok' }, { status: 500 });

  const supabase = getServiceSupabase()!;
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '50');
  const search = searchParams.get('search') || '';
  const position = searchParams.get('position') || '';
  const minRating = parseInt(searchParams.get('minRating') || '0');
  const maxRating = parseInt(searchParams.get('maxRating') || '99');
  const teamName = searchParams.get('team') || '';
  const freeAgent = searchParams.get('freeAgent') || '';

  let query = supabase
    .from('players')
    .select('id, name, position, specific_position, rating, potential, age, market_value, salary, team_name, profile_id, preferred_foot, cond, form, morale, is_injured, is_free_agent, is_for_sale, nation, contract_end_week, form_rating, speed, power, passing, shooting, defending, vision, control, heading, goalkeeping', { count: 'exact' })
    .order('rating', { ascending: false })
    .range((page - 1) * limit, page * limit - 1);

  if (search) query = query.ilike('name', `%${search}%`);
  if (position) query = query.eq('position', position);
  if (minRating > 0) query = query.gte('rating', minRating);
  if (maxRating < 99) query = query.lte('rating', maxRating);
  if (teamName) query = query.eq('team_name', teamName);
  if (freeAgent === 'true') query = query.eq('is_free_agent', true);
  if (freeAgent === 'false') query = query.eq('is_free_agent', false);

  const { data: players, count, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ players: players || [], total: count || 0, page, limit });
}

export async function PATCH(request: NextRequest) {
  if (!(await verifyAdminRequest(request)).isAdmin) return NextResponse.json({ error: 'Yetkisiz' }, { status: 403 });
  if (!isSupabaseConfigured()) return NextResponse.json({ error: 'Supabase yok' }, { status: 500 });

  const supabase = getServiceSupabase()!;
  const body = await request.json();
  const { playerId, updates } = body;

  if (!playerId || !updates) return NextResponse.json({ error: 'playerId ve updates zorunlu' }, { status: 400 });

  const allowedFields = [
    'name', 'rating', 'potential', 'age', 'market_value', 'salary', 'position', 'specific_position',
    'speed', 'power', 'passing', 'shooting', 'defending', 'vision', 'control', 'heading', 'goalkeeping',
    'cond', 'form', 'morale', 'confidence', 'form_rating', 'is_injured', 'is_free_agent', 'is_for_sale',
    'team_name', 'profile_id', 'preferred_foot', 'nation', 'contract_end_week',
    'finishing', 'dribbling', 'first_touch', 'crossing', 'marking', 'tackling', 'technique', 'long_shots',
    'determination', 'concentration', 'leadership', 'anticipation', 'flair', 'positioning', 'composure', 'teamwork', 'work_rate', 'aggression', 'bravery', 'decisions',
    'acceleration', 'agility', 'balance', 'strength', 'jumping',
  ];
  const filteredUpdates: Record<string, unknown> = {};
  for (const key of allowedFields) {
    if (updates[key] !== undefined) filteredUpdates[key] = updates[key];
  }

  if (Object.keys(filteredUpdates).length === 0) return NextResponse.json({ error: 'Güncellenecek alan yok' }, { status: 400 });

  const { data, error } = await supabase.from('players').update(filteredUpdates).eq('id', playerId).select().maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true, player: data });
}

export async function DELETE(request: NextRequest) {
  if (!(await verifyAdminRequest(request)).isAdmin) return NextResponse.json({ error: 'Yetkisiz' }, { status: 403 });
  if (!isSupabaseConfigured()) return NextResponse.json({ error: 'Supabase yok' }, { status: 500 });

  const supabase = getServiceSupabase()!;
  const { searchParams } = new URL(request.url);
  const playerId = searchParams.get('playerId');

  if (!playerId) return NextResponse.json({ error: 'playerId zorunlu' }, { status: 400 });

  const { error } = await supabase.from('players').delete().eq('id', playerId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
