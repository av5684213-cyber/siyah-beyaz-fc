/**
 * GET /api/admin/users — Tüm kullanıcıları listele
 * PATCH /api/admin/users — Kullanıcı güncelle
 * DELETE /api/admin/users — Kullanıcı sil
 * Sadece selimporsuk@gmail.com
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
  const role = searchParams.get('role') || '';

  let query = supabase
    .from('profiles')
    .select('id, manager_name, team_name, league_name, league_tier, level, xp, money, fans, reputation, credits, current_day, is_bot, role, primary_color, secondary_color, created_at', { count: 'exact' })
    .eq('is_bot', false)
    .order('created_at', { ascending: false })
    .range((page - 1) * limit, page * limit - 1);

  if (search) {
    query = query.or(`manager_name.ilike.%${search}%,team_name.ilike.%${search}%,id.eq.${search}`);
  }
  if (role) {
    query = query.eq('role', role);
  }

  const { data: profiles, count, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ users: profiles || [], total: count || 0, page, limit });
}

export async function PATCH(request: NextRequest) {
  if (!(await verifyAdminRequest(request)).isAdmin) return NextResponse.json({ error: 'Yetkisiz' }, { status: 403 });
  if (!isSupabaseConfigured()) return NextResponse.json({ error: 'Supabase yok' }, { status: 500 });

  const supabase = getServiceSupabase()!;
  const body = await request.json();
  const { userId, updates } = body;

  if (!userId || !updates) return NextResponse.json({ error: 'userId ve updates zorunlu' }, { status: 400 });

  // Allowed fields for admin update
  const allowedFields = ['money', 'credits', 'level', 'xp', 'fans', 'reputation', 'league_name', 'league_tier', 'league_position', 'current_day', 'scout_slots', 'staff_coaches', 'staff_physios', 'stadium_capacity', 'ticket_price', 'academy_level', 'primary_color', 'secondary_color', 'stadium_name', 'philosophy', 'is_bot', 'bot_difficulty']; // [BUG-25] 'role' çıkarıldı — role değişikliği set-role endpoint'inden yapılmalı
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
    .eq('id', userId)
    .select()
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true, user: data });
}

export async function DELETE(request: NextRequest) {
  if (!(await verifyAdminRequest(request)).isAdmin) return NextResponse.json({ error: 'Yetkisiz' }, { status: 403 });
  if (!isSupabaseConfigured()) return NextResponse.json({ error: 'Supabase yok' }, { status: 500 });

  const supabase = getServiceSupabase()!;
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) return NextResponse.json({ error: 'userId zorunlu' }, { status: 400 });

  // Delete related data first
  await supabase.from('players').delete().eq('profile_id', userId);
  await supabase.from('staff').delete().eq('user_id', userId);
  await supabase.from('watchlist').delete().eq('user_id', userId);
  await supabase.from('notifications').delete().eq('profile_id', userId);
  await supabase.from('league_teams').update({ profile_id: null, is_bot: true }).eq('profile_id', userId);
  await supabase.from('profiles').delete().eq('id', userId);

  return NextResponse.json({ success: true, message: `Kullanıcı ${userId} silindi` });
}
