/**
 * GET /api/rental/my-listings
 * Kullanıcının kendi kiralık listesindeki oyuncular + gelen teklifler
 *
 * Query: ?profileId=xxx
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase, getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import { createErrorResponse } from '@/lib/api-error-handler';
import { getAuthenticatedUserId } from '@/lib/apiAuth';

export async function GET(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Supabase yapılandırılmamış' }, { status: 500 });
  }

  let supabase = getServiceSupabase();
  if (!supabase) supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase istemcisi oluşturulamadı' }, { status: 500 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const profileId = getAuthenticatedUserId(request, searchParams.get('profileId'));

    if (!profileId) {
      return NextResponse.json({ error: 'profileId zorunlu' }, { status: 400 });
    }

    // ── Kullanıcının kendi ilanları ──
    const { data: myListings, error: listingsError } = await supabase
      .from('rental_listings')
      .select(`
        id,
        player_id,
        owner_team_id,
        daily_cost,
        status,
        listed_at
      `)
      .eq('owner_team_id', profileId)
      .order('listed_at', { ascending: false });

    if (listingsError) {
      console.error('[GET /api/rental/my-listings] Listings error:', listingsError.message);
      if (listingsError.message?.includes('does not exist') || listingsError.code === '42P01') {
        return NextResponse.json({ listings: [], offers: [], activeRentals: [] });
      }
      return NextResponse.json({ error: 'İlanlar yüklenemedi' }, { status: 500 });
    }

    // ── Oyuncu verilerini getir ──
    const playerIds = (myListings || []).map((l: { player_id: string }) => l.player_id);

    let playerMap: Record<string, any> = {};
    if (playerIds.length > 0) {
      const { data: players } = await supabase
        .from('players')
        .select('id, name, position, specific_position, secondary_positions, rating, potential, age, market_value, team_name, loan_status, loaned_to_profile_id, loan_end_date')
        .in('id', playerIds);

      if (players) {
        playerMap = players.reduce((acc: Record<string, any>, p: any) => {
          acc[p.id] = p;
          return acc;
        }, {});
      }
    }

    // ── Kullanıcıya gelen teklifler (rental_agreements) ──
    let offers: any[] = [];
    try {
      const { data: agreements, error: agreementsError } = await supabase
        .from('rental_agreements')
        .select('*')
        .eq('owner_team_id', profileId)
        .in('status', ['pending', 'accepted', 'rejected'])
        .order('created_at', { ascending: false });

      if (!agreementsError && agreements) {
        // Teklif sahiplerinin takım isimlerini getir
        const renterIds = [...new Set(agreements.map((a: { renter_team_id: string }) => a.renter_team_id).filter(Boolean))] as string[];

        let renterProfiles: Record<string, { team_name: string }> = {};
        if (renterIds.length > 0) {
          const { data: profiles } = await supabase
            .from('profiles')
            .select('id, team_name')
            .in('id', renterIds);

          if (profiles) {
            renterProfiles = profiles.reduce((acc: Record<string, { team_name: string }>, p: { id: string; team_name: string }) => {
              acc[p.id] = { team_name: p.team_name || '' };
              return acc;
            }, {});
          }
        }

        offers = agreements.map((a: any) => {
          const player = playerMap[a.player_id];
          const renterProfile = renterProfiles[a.renter_team_id];
          return {
            ...a,
            player_name: player?.name || 'Bilinmeyen',
            player_position: player?.specific_position || player?.position || '?',
            player_rating: player?.rating || 0,
            renter_team_name: renterProfile?.team_name || a.renter_team_id,
          };
        });
      }
    } catch (err: any) {
      console.warn('[GET /api/rental/my-listings] Agreements fetch failed:', err?.message);
    }

    // ── Aktif kiralama anlaşmaları (kullanıcının kiraladığı oyuncular) ──
    let activeRentals: any[] = [];
    try {
      const { data: myRentals, error: rentalsError } = await supabase
        .from('rental_agreements')
        .select('*')
        .eq('renter_team_id', profileId)
        .in('status', ['pending', 'accepted'])
        .order('created_at', { ascending: false });

      if (!rentalsError && myRentals) {
        const rentalPlayerIds = myRentals.map((r: { player_id: string }) => r.player_id);

        let rentalPlayerMap: Record<string, any> = {};
        if (rentalPlayerIds.length > 0) {
          const { data: rentalPlayers } = await supabase
            .from('players')
            .select('id, name, position, specific_position, rating, potential, age, loan_end_date, loaned_to_profile_id')
            .in('id', rentalPlayerIds);

          if (rentalPlayers) {
            rentalPlayerMap = rentalPlayers.reduce((acc: Record<string, any>, p: any) => {
              acc[p.id] = p;
              return acc;
            }, {});
          }
        }

        // Sahip takım isimleri
        const rentalOwnerIds = [...new Set(myRentals.map((r: { owner_team_id: string }) => r.owner_team_id).filter(Boolean))] as string[];
        let rentalOwnerProfiles: Record<string, { team_name: string }> = {};
        if (rentalOwnerIds.length > 0) {
          const { data: profiles } = await supabase
            .from('profiles')
            .select('id, team_name')
            .in('id', rentalOwnerIds);

          if (profiles) {
            rentalOwnerProfiles = profiles.reduce((acc: Record<string, { team_name: string }>, p: { id: string; team_name: string }) => {
              acc[p.id] = { team_name: p.team_name || '' };
              return acc;
            }, {});
          }
        }

        activeRentals = myRentals.map((r: any) => {
          const player = rentalPlayerMap[r.player_id];
          const ownerProfile = rentalOwnerProfiles[r.owner_team_id];
          return {
            ...r,
            player_name: player?.name || 'Bilinmeyen',
            player_position: player?.specific_position || player?.position || '?',
            player_rating: player?.rating || 0,
            player_potential: player?.potential || 0,
            player_age: player?.age || 0,
            loan_end_date: player?.loan_end_date || r.end_date?.split('T')[0],
            owner_team_name: ownerProfile?.team_name || r.owner_team_id,
          };
        });
      }
    } catch (err: any) {
      console.warn('[GET /api/rental/my-listings] Active rentals fetch failed:', err?.message);
    }

    // İlanları zenginleştir
    const parseSecondary = (raw: any): string[] | undefined => {
      if (!raw) return undefined;
      if (Array.isArray(raw)) return raw;
      if (typeof raw === 'string') {
        try { return JSON.parse(raw); } catch { return undefined; }
      }
      return undefined;
    };

    const enrichedListings = (myListings || []).map((l: any) => {
      const player = playerMap[l.player_id] || {};
      return {
        ...l,
        player: {
          ...player,
          secondary_positions: parseSecondary(player.secondary_positions),
        },
      };
    });

    return NextResponse.json({
      listings: enrichedListings,
      offers,
      activeRentals,
    });
  } catch (err) {
    return createErrorResponse(err, { route: '/api/rental/my-listings', method: 'GET' });
  }
}
