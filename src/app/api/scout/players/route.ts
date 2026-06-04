/**
 * POST /api/scout/players
 * Gözlemcilik arama endpoint'i — service_role key ile RLS bypass eder.
 * Client-side doğrudan Supabase sorgusu RLS nedeniyle tüm oyuncuları
 * göremeyebileceği için bu endpoint kullanılır.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createErrorResponse } from '@/lib/api-error-handler';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { profileId, filters } = body as {
      profileId: string;
      filters: {
        name?: string;
        position?: string;
        ageMin?: number;
        ageMax?: number;
        ovrMin?: number;
        ovrMax?: number;
        scoutLevel?: number;
        Klt?: number;
        Klc?: number;
        Sav?: number;
        Pas?: number;
        Sut?: number;
        Kfa?: number;
        Hiz?: number;
        Guc?: number;
        Alg?: number;
        Top?: number;
        Tplm?: number;
        rarity?: string;
        archetypes?: string[];
      };
    };

    if (!profileId) {
      return NextResponse.json({ error: 'profileId gerekli' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: 'Supabase yapılandırılmamış' }, { status: 500 });
    }

    // Service role key ile client oluştur — RLS bypass
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Kullanıcının scout seviyesini doğrula — staff tablosu yoksa sessizce devam et
    let scoutCount = 0;
    try {
      const { count } = await supabase
        .from('staff')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', profileId)
        .eq('type', 'scout');
      scoutCount = count ?? 0;
    } catch {
      // staff tablosu yoksa veya RLS engelliyse sessizce devam et
    }

    const scoutLevel = filters?.scoutLevel ?? Math.min(3, scoutCount);

    // ── TÜM OYUNCULARI ARAYAN SORGU ──
    // * select kullanıyoruz — tüm sütunları getirir, duplicate column riski yok
    let query = supabase
      .from('players')
      .select('*');

    // ── LEVEL 1: Temel filtreler (isim, pozisyon, yaş) ──
    if (filters?.name && filters.name.trim().length > 0) {
      query = query.ilike('name', `%${filters.name.trim()}%`);
    }
    if (filters?.position && filters.position.trim().length > 0) {
      query = query.eq('position', filters.position.toUpperCase());
    }
    if (filters?.ageMin && filters.ageMin > 0) {
      query = query.gte('age', filters.ageMin);
    }
    if (filters?.ageMax && filters.ageMax > 0) {
      query = query.lte('age', filters.ageMax);
    }

    // ── LEVEL 2: OVR aralığı, nadirlik ──
    if (scoutLevel >= 2) {
      if (filters?.ovrMin && filters.ovrMin > 0) query = query.gte('rating', filters.ovrMin);
      if (filters?.ovrMax && filters.ovrMax > 0) query = query.lte('rating', filters.ovrMax);

      // ── LEVEL 2: İstatistik filtreleri (İngilizce sütun adları) ──
      if (filters?.Klt && filters.Klt > 0) query = query.gte('rating', filters.Klt);
      if (filters?.Klc && filters.Klc > 0) query = query.gte('goalkeeping', filters.Klc);
      if (filters?.Sav && filters.Sav > 0) query = query.gte('defending', filters.Sav);
      if (filters?.Pas && filters.Pas > 0) query = query.gte('passing', filters.Pas);
      if (filters?.Sut && filters.Sut > 0) query = query.gte('shooting', filters.Sut);
      if (filters?.Kfa && filters.Kfa > 0) query = query.gte('heading', filters.Kfa);
      if (filters?.Hiz && filters.Hiz > 0) query = query.gte('speed', filters.Hiz);
      if (filters?.Guc && filters.Guc > 0) query = query.gte('power', filters.Guc);
      if (filters?.Alg && filters.Alg > 0) query = query.gte('vision', filters.Alg);
      if (filters?.Top && filters.Top > 0) query = query.gte('control', filters.Top);
    }

    query = query.order('rating', { ascending: false }).limit(2000);

    const { data, error } = await query;
    if (error) {
      console.error('[scout/players] Supabase error:', error);
      return NextResponse.json({ error: error.message || 'Veritabanı hatası', details: error.details, hint: error.hint }, { status: 500 });
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ players: [], total: 0 });
    }

    // ── Client-side filtreler: Toplam puan, arketip, nadirlik ──
    let results = data as Record<string, unknown>[];

    // Toplam puan filtresi
    if (filters?.Tplm && filters.Tplm > 0) {
      results = results.filter(p => {
        const total =
          ((p.rating as number) ?? 0) +
          ((p.goalkeeping as number) ?? 0) +
          ((p.defending as number) ?? 0) +
          ((p.passing as number) ?? 0) +
          ((p.shooting as number) ?? 0) +
          ((p.heading as number) ?? 0) +
          ((p.speed as number) ?? 0) +
          ((p.power as number) ?? 0) +
          ((p.vision as number) ?? 0) +
          ((p.control as number) ?? 0);
        return total >= filters.Tplm!;
      });
    }

    // Nadirlik filtresi
    if (scoutLevel >= 2 && filters?.rarity && filters.rarity !== 'all') {
      const rarityMap: Record<string, [number, number]> = {
        'common': [0, 64],
        'uncommon': [65, 74],
        'rare': [75, 84],
        'epic': [85, 89],
        'legendary': [90, 100],
      };
      const range = rarityMap[filters.rarity];
      if (range) {
        results = results.filter(p => {
          const ratingVal = (p.rating as number) ?? 60;
          return ratingVal >= range[0] && ratingVal <= range[1];
        });
      }
    }

    // Arketip filtresi — sadece kesin (exact) eşleşme
    if (scoutLevel >= 3 && filters?.archetypes && filters.archetypes.length > 0) {
      const selectedLower = filters.archetypes.map(a => a.toLowerCase());

      results = results.filter(p => {
        let playerArchetype = ((p.archetype as string) ?? '').toLowerCase();
        if (!playerArchetype) {
          try {
            const raw = p.personality;
            if (raw && typeof raw === 'string') {
              const personalityObj = JSON.parse(raw) as Record<string, unknown>;
              const fromPersonality = (personalityObj.archetype as string) ?? '';
              if (fromPersonality) playerArchetype = fromPersonality.toLowerCase();
            } else if (raw && typeof raw === 'object') {
              const fromPersonality = ((raw as Record<string, unknown>).archetype as string) ?? '';
              if (fromPersonality) playerArchetype = fromPersonality.toLowerCase();
            }
          } catch { /* personality parse hatası yoksay */ }
        }

        return playerArchetype && selectedLower.includes(playerArchetype);
      });
    }

    // Sonuçları sırala ve ilk 50'yi al
    results.sort((a, b) => ((b.rating as number) || 0) - ((a.rating as number) || 0));

    const limitedResults = results.slice(0, 50).map(p => {
      // ── Temel istatistikler ──
      const ratingVal = (p.rating as number) ?? 60;
      const passingVal = (p.passing as number) ?? 50;
      const shootingVal = (p.shooting as number) ?? 50;
      const defendingVal = (p.defending as number) ?? 50;
      const speedVal = (p.speed as number) ?? 50;
      const powerVal = (p.power as number) ?? 50;
      const visionVal = (p.vision as number) ?? 50;
      const controlVal = (p.control as number) ?? 50;
      const headingVal = (p.heading as number) ?? 50;
      const goalkeepingVal = (p.goalkeeping as number) ?? 10;
      const resolvedTeamName = (p.team_name as string) || 'Serbest';

      // ── Zihinsel (Mental) Nitelikler ──
      const aggressionVal = (p.aggression as number) ?? 50;
      const braveryVal = (p.bravery as number) ?? 50;
      const workRateVal = (p.work_rate as number) ?? (p.workrate as number) ?? 50;
      const decisionsVal = (p.decisions as number) ?? 50;
      const determinationVal = (p.determination as number) ?? 50;
      const concentrationVal = (p.concentration as number) ?? 50;
      const leadershipVal = (p.leadership as number) ?? 50;
      const anticipationVal = (p.anticipation as number) ?? 50;
      const flairVal = (p.flair as number) ?? 50;
      const positioningVal = (p.positioning as number) ?? 50;
      const composureVal = (p.composure as number) ?? 50;
      const teamworkVal = (p.teamwork as number) ?? 50;
      const offTheBallVal = (p.off_the_ball as number) ?? 50;

      // ── Fiziksel Nitelikler ──
      const accelerationVal = (p.acceleration as number) ?? 50;
      const agilityVal = (p.agility as number) ?? 50;
      const balanceVal = (p.balance as number) ?? 50;
      const strengthVal = (p.strength as number) ?? 50;
      const jumpingVal = (p.jumping as number) ?? 50;
      const staminaVal = (p.stamina as number) ?? 50;
      const leftFootVal = (p.left_foot as number) ?? (p.left_foot_detailed as number) ?? 50;
      const rightFootVal = (p.right_foot as number) ?? (p.right_foot_detailed as number) ?? 50;

      // ── Teknik (detay) Nitelikler ──
      const finishingVal = (p.finishing as number) ?? 50;
      const dribblingVal = (p.dribbling as number) ?? 50;
      const firstTouchVal = (p.first_touch as number) ?? 50;
      const crossingVal = (p.crossing as number) ?? 50;
      const markingVal = (p.marking as number) ?? 50;
      const tacklingVal = (p.tackling as number) ?? (p.tackling_detailed as number) ?? 50;
      const techniqueVal = (p.technique as number) ?? 50;
      const longShotsVal = (p.long_shots as number) ?? 50;

      // ── Personality JSONB ──
      const rawPersonality = p.personality;
      let safePersonality: { ambition: number; professionalism: number; temperament: number; loyalty: number; pressure_handling: number } | undefined;
      if (rawPersonality && typeof rawPersonality === 'object') {
        const pObj = rawPersonality as Record<string, unknown>;
        safePersonality = {
          ambition: (pObj.ambition as number) ?? 10,
          professionalism: (pObj.professionalism as number) ?? 10,
          temperament: (pObj.temperament as number) ?? 10,
          loyalty: (pObj.loyalty as number) ?? 10,
          pressure_handling: (pObj.pressure_handling as number) ?? 10,
        };
      } else if (typeof rawPersonality === 'string') {
        try {
          const parsed = JSON.parse(rawPersonality as string) as Record<string, unknown>;
          safePersonality = {
            ambition: (parsed.ambition as number) ?? 10,
            professionalism: (parsed.professionalism as number) ?? 10,
            temperament: (parsed.temperament as number) ?? 10,
            loyalty: (parsed.loyalty as number) ?? 10,
            pressure_handling: (parsed.pressure_handling as number) ?? 10,
          };
        } catch { /* ignore */ }
      }

      return {
        id: p.id,
        name: p.name,
        position: p.position,
        specific_position: p.specific_position,
        rating: ratingVal,
        potential: (p.potential as number) ?? 70,
        age: (p.age as number) ?? 20,
        height: p.height,
        weight: p.weight,
        preferred_foot: p.preferred_foot,
        market_value: p.market_value,
        team_name: resolvedTeamName,
        club: resolvedTeamName,
        profile_id: p.profile_id,
        is_for_sale: p.is_for_sale,
        is_free_agent: p.is_free_agent,
        scouted: true,
        scouting_stars: p.scouting_stars,
        scouting_count: p.scouting_count,
        form_rating: p.form_rating,
        morale: p.morale,
        cond: p.cond,
        is_injured: p.is_injured,
        injury: p.injury,
        contract_end_week: p.contract_end_week,
        nation: p.nation,
        archetype: p.archetype,
        play_style: p.play_style,
        personality: safePersonality,
        traits: p.traits,
        negTraits: (p.neg_traits as string[]) || [],
        traitLevels: (p.trait_levels as Record<string, string>) || {},
        styleLevels: (p.style_levels as Record<string, number>) || {},
        personalityTraits: (p.personality_traits as string[]) || [],
        special_role: p.special_role,
        is_legend: p.is_legend,
        salary: p.salary,
        confidence: p.confidence,
        injury_severity: p.injury_severity,
        injury_end_date: p.injury_end_date,
        suspended_until: p.suspended_until,
        match_ratings: p.match_ratings,
        last_match_rating: p.last_match_rating,
        photo_url: p.photo_url,
        hidden_potential: p.hidden_potential,
        secondary_positions: p.secondary_positions,

        // ── Teknik istatistikler (hem EN hem TR key) ──
        passing: passingVal,
        pas: passingVal,
        shooting: shootingVal,
        sut: shootingVal,
        defending: defendingVal,
        tk: defendingVal,
        speed: speedVal,
        hiz: speedVal,
        power: powerVal,
        guc: powerVal,
        vision: visionVal,
        alg: visionVal,
        control: controlVal,
        top: controlVal,
        heading: headingVal,
        kfa: headingVal,
        goalkeeping: goalkeepingVal,
        klc: goalkeepingVal,
        stamina: staminaVal,
        klt: ratingVal,

        // ── Teknik detay ──
        finishing: finishingVal,
        dribbling: dribblingVal,
        firstTouch: firstTouchVal,
        crossing: crossingVal,
        marking: markingVal,
        tackling: tacklingVal,
        technique: techniqueVal,
        longShots: longShotsVal,

        // ── Zihinsel (Mental) Nitelikler ──
        aggression: aggressionVal,
        bravery: braveryVal,
        workRate: workRateVal,
        work_rate: workRateVal,
        decisions: decisionsVal,
        determination: determinationVal,
        concentration: concentrationVal,
        leadership: leadershipVal,
        anticipation: anticipationVal,
        flair: flairVal,
        positioning: positioningVal,
        composure: composureVal,
        teamwork: teamworkVal,
        offTheBall: offTheBallVal,
        off_the_ball: offTheBallVal,

        // ── Fiziksel Nitelikler ──
        acceleration: accelerationVal,
        agility: agilityVal,
        balance: balanceVal,
        strength: strengthVal,
        jumping: jumpingVal,
        leftFoot: leftFootVal,
        left_foot: leftFootVal,
        rightFoot: rightFootVal,
        right_foot: rightFootVal,
      };
    });

    return NextResponse.json({ players: limitedResults, total: results.length });
  } catch (err) {
    return createErrorResponse(err, { route: '/api/scout/players', method: 'POST' });
  }
}
