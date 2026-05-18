/**
 * GET /api/loans/available
 * Diğer takımların kiralık pazarına çıkardığı oyuncuları getirir.
 *
 * Query: ?profileId=xxx
 *
 * - is_on_loan_market = true VE profile_id != current user
 * - Oyuncu verisi + loan_fee dahil
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import { isValidUserId } from '@/lib/fm/security';

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

    if (!profileId || !isValidUserId(profileId)) {
      return NextResponse.json({ error: 'Geçersiz profil ID' }, { status: 400 });
    }

    // ── Kiralık pazarındaki oyuncuları getir (kendi takımımız hariç) ──
    const { data: players, error: playersError } = await supabase
      .from('players')
      .select(`
        id,
        name,
        position,
        specific_position,
        rating,
        potential,
        age,
        nation,
        speed,
        power,
        passing,
        shooting,
        defending,
        control,
        vision,
        heading,
        goalkeeping,
        cond,
        form,
        morale,
        team_name,
        profile_id,
        is_on_loan_market,
        loan_fee,
        loan_owner_profile_id,
        loan_status,
        loan_end_date,
        loaned_to_profile_id,
        personality
      `)
      .eq('is_on_loan_market', true)
      .neq('profile_id', profileId);

    if (playersError) {
      console.error('[GET /api/loans/available] Fetch error:', playersError.message);
      return NextResponse.json({ error: 'Kiralık oyuncular yüklenirken hata oluştu' }, { status: 500 });
    }

    // ── Zaten kirada olan oyuncuları filtrele ──
    const availablePlayers = (players || []).filter(
      (p: { loan_status: string | null }) => p.loan_status !== 'active'
    );

    // ── Her oyuncu için sahibin takım adını getir ──
    const ownerIds = [...new Set(
      availablePlayers
        .map((p: { loan_owner_profile_id: string | null; profile_id: string }) => p.loan_owner_profile_id || p.profile_id)
        .filter(Boolean)
    )] as string[];

    let ownerProfiles: Record<string, { team_name: string }> = {};
    if (ownerIds.length > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, team_name')
        .in('id', ownerIds);

      if (profiles) {
        ownerProfiles = profiles.reduce((acc: Record<string, { team_name: string }>, p: { id: string; team_name: string }) => {
          acc[p.id] = { team_name: p.team_name || '' };
          return acc;
        }, {});
      }
    }

    // ── Oyuncu verisini zenginleştir ──
    const enrichedPlayers = availablePlayers.map((p: Record<string, unknown>) => {
      const ownerId = (p.loan_owner_profile_id as string) || (p.profile_id as string);
      const ownerProfile = ownerProfiles[ownerId];
      return {
        ...p,
        owner_team_name: ownerProfile?.team_name || p.team_name || 'Bilinmeyen Takım',
        loan_fee: p.loan_fee || 0,
      };
    });

    return NextResponse.json({
      players: enrichedPlayers,
      count: enrichedPlayers.length,
    });
  } catch (err) {
    console.error('[GET /api/loans/available] Exception:', err);
    return NextResponse.json({ error: 'Bir hata oluştu. Lütfen daha sonra tekrar deneyin.' }, { status: 500 });
  }
}
