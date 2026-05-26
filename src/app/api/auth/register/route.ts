import { NextRequest, NextResponse } from 'next/server';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import { sanitizeInput, isValidUserId } from '@/lib/fm/security';
import { checkRateLimit } from '@/lib/fm/supabaseRateLimit';
import { createErrorResponse } from '@/lib/api-error-handler';
import { assignUserToLeague } from '@/lib/fm/leagueHelpers';
import { generateLocalizedPlayer } from '@/lib/fm/region-generator';

export async function POST(request: NextRequest) {
  // Rate limiting: 3 registrations per 5 minutes
  const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const rateCheck = await checkRateLimit(`register:${clientIp}`, 3, 300000);
  if (!rateCheck.allowed) {
    return NextResponse.json({ error: 'Çok fazla kayıt denemesi. Lütfen bekleyin.' }, { status: 429 });
  }

  const supabaseConfigured = isSupabaseConfigured();
  const supabase = supabaseConfigured ? getSupabase() : null;

  try {
    const body = await request.json();
    const { userId, teamName, managerName, philosophy, color1, color2, region } = body;

    // Input validation
    if (!userId || !teamName || !managerName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Validate userId format
    if (!isValidUserId(userId)) {
      return NextResponse.json({ error: 'Geçersiz kullanıcı ID formatı' }, { status: 400 });
    }

    // Sanitize text inputs
    const safeTeamName = sanitizeInput(teamName, 50);
    const safeManagerName = sanitizeInput(managerName, 50);
    const safePhilosophy = sanitizeInput(philosophy || 'balanced', 20);
    const safeColor1 = sanitizeInput(color1 || '#000000', 7);
    const safeColor2 = sanitizeInput(color2 || '#ffffff', 7);
    const safeRegion = sanitizeInput(region || 'TR', 5);

    // ─── LİG ATAMASI ─────────────────────────────────
    let leagueName = '4. Lig';
    let tookOverBot = false;
    let hasFixtures = false;

    if (supabase) {
      // 1. Atomically assign bot team via RPC (prevents race condition)
      try {
        const { data: rpcResult, error: rpcError } = await supabase.rpc('assign_bot_to_user', {
          p_profile_id: userId,
          p_team_name: safeTeamName,
          p_manager_name: safeManagerName,
          p_philosophy: safePhilosophy,
          p_color1: safeColor1,
          p_color2: safeColor2,
          p_region: safeRegion,
        });

        if (rpcError) {
          console.warn('[register] assign_bot_to_user RPC error:', rpcError.message);
        } else if (rpcResult?.success) {
          leagueName = rpcResult.league_name || '4. Lig';
          tookOverBot = true;
          console.log(`[register] Atomik bot devralma: "${safeTeamName}" → ${leagueName}`);
        } else {
          console.warn('[register] Atomik bot devralma başarısız:', rpcResult?.reason);
        }
      } catch (rpcErr) {
        console.warn('[register] RPC çağrısı hatası:', rpcErr);
      }

      // 2. If atomic bot takeover failed, fallback to assignUserToLeague
      if (!tookOverBot) {
        try {
          const leagueAssignment = await assignUserToLeague(supabase, userId, safeTeamName, safeColor1);
          if (leagueAssignment) {
            leagueName = leagueAssignment.leagueName;
            tookOverBot = true;
            console.log(`[register] Fallback lig ataması: "${safeTeamName}" → ${leagueName}`);
          }
        } catch (leagueErr) {
          console.warn('[register] Fallback lig ataması hatası:', leagueErr);
        }
      }

      if (!tookOverBot) {
        console.warn('[register] LİG ATAMASI BAŞARISIZ — Kullanıcıya ligsiz profil oluşturuluyor.');
      }
    } else {
      console.warn('[register] Supabase yapılandırılmamış — offline/demo modunda kayıt yapılıyor.');
    }

    // ─── FELSEFE BONUSLARI ─────────────────────────────────
    // Base değerler: 25M € para, 250 kredi, 30 itibar, akademi lv.1
    // balanced = sadece base değerler (bonus yok)
    // financial = +15M € bütçe (toplam 40M)
    // legend = +250 kredi (toplam 500)
    // youth = akademi lv.3 (base 1)
    // squad = +%10 kadro kalitesi (rating + potential)
    // reputation = +20 itibar (toplam 50)
    const BASE_MONEY = 25_000_000;
    const BASE_CREDITS = 250;
    const BASE_REPUTATION = 30;
    const BASE_ACADEMY_LEVEL = 1;

    let startMoney = BASE_MONEY;
    let startCredits = BASE_CREDITS;
    let startReputation = BASE_REPUTATION;
    let startAcademyLevel = BASE_ACADEMY_LEVEL;
    let squadQualityMod = 1.0; // squad felsefesi için çarpan

    switch (safePhilosophy) {
      case 'financial':
        startMoney += 15_000_000; // +15M €
        break;
      case 'legend':
        startCredits += 250; // +250 kredi (toplam 500)
        break;
      case 'youth':
        startAcademyLevel = 3; // Lv.3 akademi
        break;
      case 'squad':
        squadQualityMod = 1.1; // +%10 kadro kalitesi
        break;
      case 'reputation':
        startReputation += 20; // +20 itibar (toplam 50)
        break;
      case 'balanced':
      default:
        // Sadece base değerler, bonus yok
        break;
    }

    // ─── PROFİL OLUŞTUR ─────────────────────────────────
    const newProfile = {
      id: userId,
      team_name: safeTeamName,
      league_name: leagueName,
      manager_name: safeManagerName,
      money: startMoney,
      credits: startCredits,
      level: 1,
      xp: 0,
      fans: 1000,
      current_day: 1,
      ticket_price: 35,
      stadium_capacity: 10000,
      region: safeRegion,
      philosophy: safePhilosophy,
      primary_color: safeColor1,
      secondary_color: safeColor2,
      reputation: startReputation,
      academy_level: startAcademyLevel,
      is_bot: false,
      created_at: new Date().toISOString(),
    };

    if (supabase) {
      const { error: profileError } = await supabase.from('profiles').upsert(newProfile);
      if (profileError) {
        console.error('[register] Profile upsert error:', profileError.message);
        return NextResponse.json({ error: 'Profil oluşturulamadı.' }, { status: 500 });
      }
    } else {
      console.log('[register] Offline mod — profil sadece istemciye döndürülüyor (DB yazılmadı).');
    }

    // ─── OYUNCULARI OLUŞTUR ─────────────────────────────────
    // HER ZAMAN kullanıcıya özel 19 oyuncu oluştur
    // squad felsefesi: rating ve potential %10 artırılır
    const playersToInsert: any[] = [];
    const posCounts = { GK: 2, DEF: 6, MID: 6, FWD: 5 };

    Object.entries(posCounts).forEach(([pos, count]) => {
      for (let i = 0; i < count; i++) {
        const p = generateLocalizedPlayer(safeRegion as any, safeTeamName, 4, pos as any);
        playersToInsert.push({
          ...p,
          rating: Math.min(94, Math.floor(p.rating * squadQualityMod)),
          potential: Math.min(99, Math.floor((p.potential || p.rating + 10) * squadQualityMod)),
          position: pos,
          profile_id: userId,
          team_name: safeTeamName,
        });
      }
    });

    if (supabase) {
      // Önce eski oyuncuları temizle, sonra yenisini ekle
      await supabase.from('players').delete().eq('profile_id', userId);

      // Oyuncuları kaydet
      const { error: playersError } = await supabase.from('players').insert(
        playersToInsert.map(p => ({
          id: p.id,
          name: p.name,
          position: p.position,
          specific_position: p.specificPosition || p.position,
          rating: p.rating,
          potential: p.potential,
          hidden_potential: p.hidden_potential || p.potential,
          age: p.age,
          nation: p.nation || 'TR',
          preferred_foot: p.preferred_foot || 'Right',
          speed: p.speed || 50,
          power: p.power || 50,
          passing: p.passing || 50,
          shooting: p.shooting || 50,
          defending: p.defending || 50,
          vision: p.vision || 50,
          control: p.control || 50,
          heading: p.heading || 50,
          goalkeeping: p.goalkeeping || 10,
          cond: p.cond || 100,
          form: p.form || 60,
          morale: p.morale || 60,
          confidence: p.confidence || 60,
          market_value: p.market_value || 500000,
          salary: p.salary || 5000,
          personality: JSON.stringify({
            traits: p.traits || [],
            negTraits: p.negTraits || [],
            personalityTraits: p.personalityTraits || [],
            traitLevels: p.traitLevels || {},
            styleLevels: p.styleLevels || {},
            archetype: p.archetype,
            special_role: p.special_role,
          }),
          is_for_sale: false,
          is_injured: false,
          profile_id: userId,
          team_name: safeTeamName,
        }))
      );

      if (playersError) {
        console.error('[register] Players insert error:', playersError.message);
      }

      // ─── FİKSTÜR KONTROLÜ ─────────────────────────────────
      try {
        const { data: userTeam } = await supabase
          .from('league_teams')
          .select('id, league_id')
          .eq('profile_id', userId)
          .maybeSingle();

        if (userTeam?.league_id) {
          const { data: season } = await supabase
            .from('seasons')
            .select('id')
            .eq('league_id', userTeam.league_id)
            .eq('is_finished', false)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          if (season?.id) {
            const { count: fixtureCount } = await supabase
              .from('fixtures')
              .select('*', { count: 'exact', head: true })
              .eq('season_id', season.id);

            if (fixtureCount && fixtureCount > 0) {
              hasFixtures = true;
            } else {
              console.log(`[register] Fikstür bulunamadı, oluşturuluyor... seasonId: ${season.id}`);
              try {
                await supabase.rpc('generate_league_fixtures', { p_season_id: season.id });
                hasFixtures = true;
                console.log(`[register] Fikstür oluşturuldu.`);
              } catch (fixErr) {
                console.warn('[register] Fikstür oluşturma RPC hatası:', fixErr);
              }
            }
          }
        }
      } catch (fixCheckErr) {
        console.warn('[register] Fikstür kontrol hatası:', fixCheckErr);
      }
    }

    console.log(`[register] Başarılı: "${safeTeamName}" → ${leagueName}, ${playersToInsert.length} oyuncu, fikstür: ${hasFixtures ? 'var' : 'YOK'}`);

    return NextResponse.json({
      success: true,
      tookOverBot,
      botTeamName: tookOverBot ? safeTeamName : null,
      leagueName,
      hasFixtures,
      profile: newProfile,
      players: playersToInsert,
    });
  } catch (err: any) {
    console.error('[register] Error:', err);
    return createErrorResponse(err, { route: '/api/auth/register', method: 'POST' });
  }
}
