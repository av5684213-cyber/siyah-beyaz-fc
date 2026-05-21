/**
 * GET /api/rental/my-agreements
 * Kullanıcının kiralama anlaşmaları (hem verdiği hem aldığı)
 *
 * Query: ?profileId=xxx
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Supabase yapılandırılmamış' }, { status: 500 });
  }

  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase istemcisi oluşturulamadı' }, { status: 500 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const profileId = searchParams.get('profileId');

    if (!profileId) {
      return NextResponse.json({ error: 'profileId zorunlu' }, { status: 400 });
    }

    // ── Tüm anlaşmalar (verilen + alınan) ──
    let agreements: any[] = [];
    try {
      const { data, error } = await supabase
        .from('rental_agreements')
        .select('*')
        .or(`owner_team_id.eq.${profileId},renter_team_id.eq.${profileId}`)
        .order('created_at', { ascending: false });

      if (!error && data) {
        agreements = data;
      }
    } catch (err: any) {
      console.warn('[GET /api/rental/my-agreements] Fetch failed:', err?.message);
      return NextResponse.json({ agreements: [] });
    }

    // ── Oyuncu ve takım verilerini zenginleştir ──
    const playerIds = [...new Set(agreements.map((a: { player_id: string }) => a.player_id))];
    const teamIds = [...new Set([
      ...agreements.map((a: { owner_team_id: string }) => a.owner_team_id),
      ...agreements.map((a: { renter_team_id: string }) => a.renter_team_id),
    ].filter(Boolean))] as string[];

    let playerMap: Record<string, any> = {};
    if (playerIds.length > 0) {
      const { data: players } = await supabase
        .from('players')
        .select('id, name, position, specific_position, rating, potential, age, loan_status, loan_end_date')
        .in('id', playerIds);

      if (players) {
        playerMap = players.reduce((acc: Record<string, any>, p: any) => {
          acc[p.id] = p;
          return acc;
        }, {});
      }
    }

    let teamMap: Record<string, { team_name: string }> = {};
    if (teamIds.length > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, team_name')
        .in('id', teamIds);

      if (profiles) {
        teamMap = profiles.reduce((acc: Record<string, { team_name: string }>, p: { id: string; team_name: string }) => {
          acc[p.id] = { team_name: p.team_name || '' };
          return acc;
        }, {});
      }
    }

    const enriched = agreements.map((a: any) => {
      const player = playerMap[a.player_id] || {};
      return {
        ...a,
        player_name: player.name || 'Bilinmeyen',
        player_position: player.specific_position || player.position || '?',
        player_rating: player.rating || 0,
        player_potential: player.potential || 0,
        player_age: player.age || 0,
        owner_team_name: teamMap[a.owner_team_id]?.team_name || a.owner_team_id,
        renter_team_name: teamMap[a.renter_team_id]?.team_name || a.renter_team_id,
        is_owner: a.owner_team_id === profileId,
        is_renter: a.renter_team_id === profileId,
      };
    });

    return NextResponse.json({
      agreements: enriched,
      count: enriched.length,
    });
  } catch (err) {
    console.error('[GET /api/rental/my-agreements] Exception:', err);
    return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 });
  }
}
