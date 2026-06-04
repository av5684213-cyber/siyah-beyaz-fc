/**
 * GET /api/rental/listings
 * Aktif kiralık ilanları getirir (rental_listings tablosu)
 *
 * Query: ?profileId=xxx (kullanıcının kendi ilanları hariç)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import { createErrorResponse } from '@/lib/api-error-handler';
import { getAuthenticatedUserId } from '@/lib/apiAuth';

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
    const profileId = getAuthenticatedUserId(request, searchParams.get('profileId'));

    // Aktif ilanları getir
    let query = supabase
      .from('rental_listings')
      .select(`
        id,
        player_id,
        owner_team_id,
        daily_cost,
        status,
        listed_at
      `)
      .eq('status', 'active')
      .order('listed_at', { ascending: false });

    const { data: listings, error: listingsError } = await query;

    if (listingsError) {
      console.error('[GET /api/rental/listings] Error:', listingsError.message);
      // Tablo yoksa boş dön
      if (listingsError.message?.includes('does not exist') || listingsError.code === '42P01') {
        return NextResponse.json({ listings: [], count: 0 });
      }
      return NextResponse.json({ error: 'İlanlar yüklenemedi' }, { status: 500 });
    }

    if (!listings || listings.length === 0) {
      return NextResponse.json({ listings: [], count: 0 });
    }

    // İlanlardaki oyuncu ID'lerini topla
    const playerIds = listings.map((l: { player_id: string }) => l.player_id);
    const ownerIds = [...new Set(listings.map((l: { owner_team_id: string }) => l.owner_team_id).filter(Boolean))] as string[];

    // Oyuncu verilerini getir
    const { data: players, error: playersError } = await supabase
      .from('players')
      .select(`
        id, name, position, specific_position, secondary_positions,
        rating, potential, age, nation, speed, power, passing,
        shooting, defending, control, vision, heading, goalkeeping,
        market_value, team_name, profile_id, personality
      `)
      .in('id', playerIds);

    if (playersError) {
      console.error('[GET /api/rental/listings] Players fetch error:', playersError.message);
      return NextResponse.json({ listings: [], count: 0 });
    }

    // Sahip takım profilleri
    let ownerProfiles: Record<string, { team_name: string; id: string }> = {};
    if (ownerIds.length > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, team_name')
        .in('id', ownerIds);

      if (profiles) {
        ownerProfiles = profiles.reduce((acc: Record<string, { team_name: string; id: string }>, p: { id: string; team_name: string }) => {
          acc[p.id] = { team_name: p.team_name || '', id: p.id };
          return acc;
        }, {});
      }
    }

    // İlanları oyuncu verisiyle zenginleştir
    const playerMap = (players || []).reduce((acc: Record<string, any>, p: any) => {
      acc[p.id] = p;
      return acc;
    }, {});

    // secondary_positions parse
    const parseSecondary = (raw: any): string[] | undefined => {
      if (!raw) return undefined;
      if (Array.isArray(raw)) return raw;
      if (typeof raw === 'string') {
        try { return JSON.parse(raw); } catch { return undefined; }
      }
      return undefined;
    };

    const enriched = listings
      .filter((l: { player_id: string }) => playerMap[l.player_id])
      .map((l: { id: string; player_id: string; owner_team_id: string; daily_cost: number; status: string; listed_at: string }) => {
        const player = playerMap[l.player_id];
        const ownerProfile = ownerProfiles[l.owner_team_id];
        // Kendi ilanlarını filtrele
        if (profileId && player.profile_id === profileId) return null;
        return {
          ...l,
          player: {
            ...player,
            secondary_positions: parseSecondary(player.secondary_positions),
          },
          owner_team_name: ownerProfile?.team_name || player.team_name || 'Bilinmeyen Takım',
        };
      })
      .filter(Boolean);

    return NextResponse.json({
      listings: enriched,
      count: enriched.length,
    });
  } catch (err) {
    return createErrorResponse(err, { route: '/api/rental/listings', method: 'GET' });
  }
}
