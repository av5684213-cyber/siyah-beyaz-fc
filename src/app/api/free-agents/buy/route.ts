/**
 * POST /api/free-agents/buy
 * Serbest oyuncuyu doğrudan kadroya katma.
 *
 * Body: { playerId, profileId }
 *
 * İşlem:
 * 1. Oyuncunun gerçekten serbest olduğunu doğrula (profile_id IS NULL)
 * 2. Alıcının bakiyesini kontrol et (oyuncunun market_value kadar)
 * 3. players tablosunda profile_id ve team_name güncelle
 * 4. Eğer transfer_market'te kaydı varsa, deaktif et
 * 5. profiles tablosundan alıcının parasını düş
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import { isValidUserId } from '@/lib/fm/security';

interface BuyFreeAgentRequest {
  playerId: string;
  profileId: string;
}

export async function POST(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Supabase yapılandırılmamış' }, { status: 500 });
  }

  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase istemcisi oluşturulamadı' }, { status: 500 });
  }

  try {
    const body: BuyFreeAgentRequest = await request.json();
    const { playerId, profileId } = body;

    if (!playerId || !profileId) {
      return NextResponse.json({ error: 'playerId ve profileId zorunlu' }, { status: 400 });
    }

    if (!isValidUserId(profileId)) {
      return NextResponse.json({ error: 'Geçersiz profil ID' }, { status: 400 });
    }

    // ── Alıcının profilini getir ──
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, money, team_name')
      .eq('id', profileId)
      .maybeSingle();

    if (profileError || !profile) {
      console.error('[POST /api/free-agents/buy] Profile fetch error:', profileError?.message);
      return NextResponse.json({ error: 'Profil bulunamadı' }, { status: 404 });
    }

    // ── Oyuncuyu getir ──
    const { data: player, error: playerError } = await supabase
      .from('players')
      .select('id, name, profile_id, market_value, rating, salary, position, specific_position, age, nation, team_name')
      .eq('id', playerId)
      .maybeSingle();

    if (playerError || !player) {
      console.error('[POST /api/free-agents/buy] Player fetch error:', playerError?.message);
      return NextResponse.json({ error: 'Oyuncu bulunamadı' }, { status: 404 });
    }

    // ── Oyuncu gerçekten serbest mi? ──
    if (player.profile_id) {
      return NextResponse.json({ error: 'Bu oyuncu zaten bir takıma ait' }, { status: 400 });
    }

    // ── Transfer ücreti (piyasa değeri) ──
    const transferFee = player.market_value || (player.rating || 50) * 50000;

    // ── Bakiye kontrolü ──
    if ((profile.money || 0) < transferFee) {
      return NextResponse.json({
        error: `Yetersiz bakiye. Transfer ücreti: ${transferFee.toLocaleString('tr-TR')} €. Mevcut: ${(profile.money || 0).toLocaleString('tr-TR')} €`,
      }, { status: 400 });
    }

    // ── Parasını düş ──
    const newMoney = (profile.money || 0) - transferFee;
    const { error: moneyError } = await supabase
      .from('profiles')
      .update({ money: newMoney })
      .eq('id', profileId);

    if (moneyError) {
      console.error('[POST /api/free-agents/buy] Money update error:', moneyError.message);
      return NextResponse.json({ error: 'Bakiye güncellenemedi' }, { status: 500 });
    }

    // ── Oyuncunun sahipliğini güncelle ──
    const { error: updatePlayerError } = await supabase
      .from('players')
      .update({
        profile_id: profileId,
        team_name: profile.team_name || profileId,
      })
      .eq('id', playerId);

    if (updatePlayerError) {
      console.error('[POST /api/free-agents/buy] Player update error:', updatePlayerError.message);
      // Parayı geri iade et (rollback)
      await supabase
        .from('profiles')
        .update({ money: profile.money || 0 })
        .eq('id', profileId);
      return NextResponse.json({ error: 'Oyuncu transfer edilemedi' }, { status: 500 });
    }

    // ── Transfer market'te kayıt varsa deaktif et ──
    const { data: marketListing } = await supabase
      .from('transfer_market')
      .select('id')
      .eq('player_id', playerId)
      .eq('is_active', true)
      .maybeSingle();

    if (marketListing) {
      await supabase
        .from('transfer_market')
        .update({ is_active: false })
        .eq('id', marketListing.id);
    }

    return NextResponse.json({
      success: true,
      message: `${player.name || 'Oyuncu'} kadroya katıldı`,
      transferFee,
      moneyRemaining: newMoney,
      player: {
        id: player.id,
        name: player.name,
        position: player.position,
        specific_position: player.specific_position,
        rating: player.rating,
        age: player.age,
        nation: player.nation,
      },
    });
  } catch (err) {
    console.error('[POST /api/free-agents/buy] Exception:', err);
    return NextResponse.json({ error: 'Bir hata oluştu. Lütfen daha sonra tekrar deneyin.' }, { status: 500 });
  }
}
