/**
 * API Route: Maç Sırası Taktik Değişikliği
 *
 * Kullanıcı maç izlerken taktik değiştirmek istediğinde bu endpoint çağrılır.
 * match_sessions tablosundaki taktik alanlarını günceller.
 * match-tick cron'u bir sonraki tick'te güncel taktikleri okur ve
 * kalan simülasyonu bu taktiklere göre yürütür.
 *
 * POST /api/match/update-tactic
 * Body: { fixtureId, tactic, formation? }
 * Headers: Authorization (kullanıcı kimliği)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import { verifyProfileExists } from '@/lib/fm/security';
import { createErrorResponse } from '@/lib/api-error-handler';
import { getAuthenticatedUserId } from '@/lib/apiAuth';

// ═══════════════════════════════════════════════════════════════
// Taktik → goalMod/conceedMod dönüşümü
// ═══════════════════════════════════════════════════════════════
const TACTIC_MODIFIERS: Record<string, { goalMod: number; conceedMod: number; label: string }> = {
  normal:    { goalMod: 0,     conceedMod: 0,     label: 'Dengeli' },
  dengeli:   { goalMod: 0,     conceedMod: 0,     label: 'Dengeli' },
  hucum:     { goalMod: 0.10,  conceedMod: 0.05,  label: 'Hücum' },
  attack:    { goalMod: 0.10,  conceedMod: 0.05,  label: 'Hücum' },
  savunma:   { goalMod: -0.05, conceedMod: -0.10, label: 'Savunma' },
  defense:   { goalMod: -0.05, conceedMod: -0.10, label: 'Savunma' },
  kontra:    { goalMod: 0.05,  conceedMod: 0.0,   label: 'Kontra Atak' },
  counter:   { goalMod: 0.05,  conceedMod: 0.0,   label: 'Kontra Atak' },
  pres:      { goalMod: 0.03,  conceedMod: 0.02,  label: 'Pres' },
  press:     { goalMod: 0.03,  conceedMod: 0.02,  label: 'Pres' },
  tikitaka:  { goalMod: 0.02,  conceedMod: -0.03, label: 'Tiki-Taka' },
};

// Maksimum taktik değişikliği sayısı (maç başına)
const MAX_TACTIC_CHANGES = 5;

export async function POST(request: NextRequest) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
    }

    const supabase = getSupabase();
    if (!supabase) {
      return NextResponse.json({ error: 'Supabase client is null' }, { status: 500 });
    }

    // ── Request body'yi parse et ──
    const body = await request.json();
    const { fixtureId, tactic, formation, profileId: bodyProfileId } = body;

    if (!fixtureId || !tactic) {
      return NextResponse.json({ error: 'fixtureId ve tactic zorunlu alanlardır' }, { status: 400 });
    }

    // Taktik doğrulama
    const tacticMods = TACTIC_MODIFIERS[tactic];
    if (!tacticMods) {
      return NextResponse.json({
        error: `Geçersiz taktik: ${tactic}. Geçerli taktikler: ${Object.keys(TACTIC_MODIFIERS).join(', ')}`
      }, { status: 400 });
    }

    // ── Kullanıcı kimliğini belirle ──
    // Önce auth header'dan, yoksa body'den al (BUG-18 fix)
    const profileId = getAuthenticatedUserId(request, bodyProfileId);
    if (!profileId) {
      return NextResponse.json({ error: 'profileId zorunlu alanı eksik' }, { status: 400 });
    }

    // Verify profile exists
    const { valid, error: profileError, status: profileStatus } = await verifyProfileExists(supabase, profileId);
    if (!valid) {
      return NextResponse.json({ error: profileError || 'Profil bulunamadı' }, { status: profileStatus || 404 });
    }

    // ── Maç oturumunu bul ──
    const { data: session, error: sessionError } = await supabase
      .from('match_sessions')
      .select('*')
      .eq('fixture_id', fixtureId)
      .in('status', ['live', 'halftime'])
      .maybeSingle();

    if (sessionError || !session) {
      return NextResponse.json({
        error: 'Bu maç için aktif oturum bulunamadı. Maç canlı değil veya oturum oluşturulmamış.'
      }, { status: 404 });
    }

    // ── Kullanıcının hangi takımda olduğunu belirle ──
    let userSide: 'home' | 'away' | null = null;

    // home_team_id ve away_team_id ile takım bilgilerini çek
    const { data: homeTeam } = await supabase
      .from('league_teams')
      .select('profile_id, name')
      .eq('id', session.home_team_id)
      .maybeSingle();

    const { data: awayTeam } = await supabase
      .from('league_teams')
      .select('profile_id, name')
      .eq('id', session.away_team_id)
      .maybeSingle();

    if (homeTeam?.profile_id === profileId) {
      userSide = 'home';
    } else if (awayTeam?.profile_id === profileId) {
      userSide = 'away';
    } else {
      return NextResponse.json({
        error: 'Bu maçta sizin takımınız bulunmuyor.'
      }, { status: 403 });
    }

    // ── Taktik değişikliği sayısını kontrol et ──
    const { data: tacticChanges } = await supabase
      .from('match_events')
      .select('id')
      .eq('fixture_id', fixtureId)
      .eq('event_type', 'TACTICAL_CHANGE')
      .eq('team', userSide);

    if (tacticChanges && tacticChanges.length >= MAX_TACTIC_CHANGES) {
      return NextResponse.json({
        error: `Maç başına maksimum ${MAX_TACTIC_CHANGES} taktik değişikliği yapılabilir.`,
        currentChanges: tacticChanges.length,
      }, { status: 429 });
    }

    // ── Session'ı güncelle ──
    const updateData: Record<string, any> = {
      last_updated: new Date().toISOString(),
    };

    if (userSide === 'home') {
      updateData.home_tactic = tactic;
      updateData.home_goal_mod = tacticMods.goalMod;
      updateData.home_conceed_mod = tacticMods.conceedMod;
      if (formation) updateData.home_formation = formation;

      // Tactic objesini de güncelle (match-tick bunu kullanıyor)
      try {
        const existingTactic = typeof session.home_tactic_obj === 'string'
          ? JSON.parse(session.home_tactic_obj) : session.home_tactic_obj || {};

        const defenseLineMap: Record<string, string> = {
          hucum: 'onde', attack: 'onde',
          savunma: 'geride', defense: 'geride',
          normal: 'standart', dengeli: 'standart',
          kontra: 'standart', counter: 'standart',
          pres: 'standart', press: 'standart',
          tikitaka: 'standart',
        };

        existingTactic.playStyle = tactic;
        existingTactic.formation = formation || existingTactic.formation || '4-4-2';
        existingTactic.defensiveLine = defenseLineMap[tactic] || 'standart';
        existingTactic.pressing = tactic === 'pres' || tactic === 'press';

        updateData.home_tactic_obj = JSON.stringify(existingTactic);
      } catch {}
    } else {
      updateData.away_tactic = tactic;
      updateData.away_goal_mod = tacticMods.goalMod;
      updateData.away_conceed_mod = tacticMods.conceedMod;
      if (formation) updateData.away_formation = formation;

      try {
        const existingTactic = typeof session.away_tactic_obj === 'string'
          ? JSON.parse(session.away_tactic_obj) : session.away_tactic_obj || {};

        const defenseLineMap: Record<string, string> = {
          hucum: 'onde', attack: 'onde',
          savunma: 'geride', defense: 'geride',
          normal: 'standart', dengeli: 'standart',
          kontra: 'standart', counter: 'standart',
          pres: 'standart', press: 'standart',
          tikitaka: 'standart',
        };

        existingTactic.playStyle = tactic;
        existingTactic.formation = formation || existingTactic.formation || '4-4-2';
        existingTactic.defensiveLine = defenseLineMap[tactic] || 'standart';
        existingTactic.pressing = tactic === 'pres' || tactic === 'press';

        updateData.away_tactic_obj = JSON.stringify(existingTactic);
      } catch {}
    }

    const { error: updateError } = await supabase
      .from('match_sessions')
      .update(updateData)
      .eq('id', session.id);

    if (updateError) {
      console.error('[update-tactic] Session update error:', updateError);
      return NextResponse.json({ error: 'Taktik güncellenirken bir hata oluştu.' }, { status: 500 });
    }

    // ── active_tactics tablosunu da güncelle ──
    try {
      const defenseLineMap: Record<string, string> = {
        hucum: 'onde', attack: 'onde',
        savunma: 'geride', defense: 'geride',
        normal: 'standart', dengeli: 'standart',
        kontra: 'standart', counter: 'standart',
        pres: 'standart', press: 'standart',
        tikitaka: 'standart',
      };

      await supabase
        .from('active_tactics')
        .update({
          formation: formation || undefined,
          defense_line: defenseLineMap[tactic] || 'standart',
        })
        .eq('profile_id', profileId);
    } catch (tacticUpdateErr) {
      console.warn('[update-tactic] active_tactics update failed (non-critical):', tacticUpdateErr);
    }

    // ── TACTICAL_CHANGE olayını match_events'e ekle ──
    const currentMinute = session.current_minute || 0;
    const teamName = userSide === 'home'
      ? (session.home_team_name || 'Ev Sahibi')
      : (session.away_team_name || 'Deplasman');

    const effectDesc = tacticMods.goalMod > 0
      ? `Gol ihtimali arttı, defans riski yükseldi`
      : tacticMods.conceedMod < 0
        ? `Defans güçlendi, hücum gücü azaldı`
        : tacticMods.goalMod > 0 && tacticMods.conceedMod > 0
          ? `Agresif oyun, her iki taraf da riskli`
          : 'Dengeli oyun';

    const detailParts: string[] = [];
    if (formation) detailParts.push(`Formasyon: ${formation}`);
    detailParts.push(`Stil: ${tacticMods.label}`);
    const detailText = detailParts.join(', ') + `. ${effectDesc}`;

    try {
      await supabase.from('match_events').insert({
        fixture_id: fixtureId,
        event_type: 'TACTICAL_CHANGE',
        minute: currentMinute,
        team: userSide,
        detail: detailText,
        is_revealed: true,
      });
    } catch (evtErr) {
      console.warn('[update-tactic] TACTICAL_CHANGE event insert failed:', evtErr);
    }

    console.log(`[update-tactic] ${teamName} (${userSide}): ${tacticMods.label} at minute ${currentMinute}`);

    return NextResponse.json({
      success: true,
      tactic: tacticMods.label,
      side: userSide,
      goalMod: tacticMods.goalMod,
      conceedMod: tacticMods.conceedMod,
      currentMinute,
      changesRemaining: MAX_TACTIC_CHANGES - (tacticChanges?.length || 0) - 1,
    });

  } catch (err) {
    return createErrorResponse(err, { route: '/api/match/update-tactic', method: 'POST' });
  }
}
