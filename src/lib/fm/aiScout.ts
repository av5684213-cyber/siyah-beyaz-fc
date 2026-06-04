import type { Player } from './types';

export interface ScoutFilters {
  position?: string;
  ageMin?: number;
  ageMax?: number;
  ratingMin?: number;
  ratingMax?: number;
  scoutLevel?: number;
  archetype?: string;
  region?: string;
  potentialMin?: number;
  potentialMax?: number;
}

export interface ScoutedPlayer {
  player: Partial<Player>;
  isRevealed: boolean;
  discoveryScore: number;
  notes: string;
}

export interface ScoutingReport {
  summary: string;
  foundPlayers: ScoutedPlayer[];
  scoutQuality: number;
  duration: number;
}

/**
 * Filtre bazlı keşif motoru — Gerçek Supabase sorgusu.
 * Scout seviyesine göre sonuç kalitesi ve miktarı değişir.
 * Seviye 1: Düşük OVR (40-60), az bilgi
 * Seviye 2: Orta OVR (55-75), rating + nadirlik
 * Seviye 3: Yüksek OVR (70-90), tam profil + potansiyel
 */
export async function generateScoutingReport(
  filters: ScoutFilters = {},
  scoutQuality: number = 60
): Promise<ScoutingReport> {
  const {
    position = 'MID',
    ageMin = 16,
    ageMax = 35,
    ratingMin = 40,
    ratingMax = 90,
    scoutLevel = 1,
    archetype,
    region,
    potentialMin = 0,
    potentialMax = 99,
  } = filters;

  try {
    const { getSupabase } = await import('@/lib/supabase');
    const supabase = getSupabase();
    
    if (!supabase) {
      // Fallback to generator if no DB
      return generateFallbackReport(filters, scoutQuality);
    }

    // Scout seviyesine göre OVR aralığı belirle
    let effectiveRatingMin = ratingMin;
    let effectiveRatingMax = ratingMax;
    if (scoutLevel === 1) {
      effectiveRatingMin = Math.max(ratingMin, 40);
      effectiveRatingMax = Math.min(ratingMax, 65);
    } else if (scoutLevel === 2) {
      effectiveRatingMin = Math.max(ratingMin, 55);
      effectiveRatingMax = Math.min(ratingMax, 80);
    } else if (scoutLevel === 3) {
      effectiveRatingMin = Math.max(ratingMin, 70);
      effectiveRatingMax = Math.min(ratingMax, 95);
    }

    // DB sorgusu oluştur — SADECE serbest oyuncular veya transfer listesindekiler
    let query = supabase
      .from('players')
      .select('*')
      .or('is_free_agent.eq.true,profile_id.is.null')
      .gte('rating', effectiveRatingMin)
      .lte('rating', effectiveRatingMax)
      .gte('age', ageMin)
      .lte('age', ageMax);

    if (position && position !== 'ALL') {
      query = query.eq('position', position.toUpperCase());
    }

    if (potentialMin > 0) {
      query = query.gte('potential', potentialMin);
    }
    if (potentialMax < 99) {
      query = query.lte('potential', potentialMax);
    }

    // Rastgele sıralama için (farklı oyuncular her seferinde)
    query = query.limit(50);

    const { data, error } = await query;

    if (error || !data || data.length === 0) {
      return generateFallbackReport(filters, scoutQuality);
    }

    // Bölge filtresi (nation bazlı)
    const regionNationMap: Record<string, string[]> = {
      'EUROPE': ['Türkiye', 'Almanya', 'İspanya', 'İtalya', 'Fransa', 'İngiltere', 'Hollanda', 'Portekiz', 'Belçika'],
      'SOUTH_AMERICA': ['Brezilya', 'Arjantin', 'Kolombiya', 'Uruguay', 'Şili', 'Ekvador'],
      'AFRICA': ['Nijerya', 'Senegal', 'Fas', 'Gana', 'Kamerun', 'Mısır'],
      'ASIA': ['Japonya', 'Güney Kore', 'İran', 'Suudi Arabistan', 'Avustralya'],
      'NORTH_AMERICA': ['ABD', 'Meksika', 'Kanada', 'Kosta Rika'],
    };

    let filteredData = data;
    if (region && regionNationMap[region]) {
      const nations = regionNationMap[region];
      filteredData = data.filter((p: Record<string, unknown>) => nations.includes(p.nation as string));
    }

    // Arketip filtresi
    if (archetype && filteredData.length > 0) {
      const filtered = filteredData.filter((p: Record<string, unknown>) => {
        const traits = (p.traits || []) as string[];
        return traits.some((t: string) => t.toLowerCase().includes(archetype.toLowerCase().substring(0, 5)));
      });
      if (filtered.length > 0) filteredData = filtered;
    }

    // Scout seviyesine göre sonuç sayısı: lvl 1 → 5-8, lvl 2 → 8-12, lvl 3 → 10-15
    const maxResults = scoutLevel === 1 ? 8 : scoutLevel === 2 ? 12 : 15;

    // Rastgele karıştır ve sınırla
    const shuffled = filteredData.sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, maxResults);

    // Scout seviyesine göre potansiyeli yüksek oyuncuların çıkma ihtimali
    // Seviye arttıkça daha yüksek potansiyelli oyuncular ön plana çıkar
    if (scoutLevel >= 2 && selected.length > 0) {
      selected.sort((a: Record<string, unknown>, b: Record<string, unknown>) => ((b.potential as number) || 70) - ((a.potential as number) || 70));
    }

    // ScoutedPlayer formatına dönüştür
    const foundPlayers: ScoutedPlayer[] = selected.map((p: Record<string, unknown>) => {
      const revealed = scoutLevel >= 3 || (scoutQuality > 75 && scoutLevel >= 2);

      const partialPlayer: Partial<Player> = {
        id: p.id as string,
        name: p.name as string,
        position: p.position as any,
        specificPosition: p.specific_position as any,
        age: p.age as number,
        nation: p.nation as string,
        rating: scoutLevel >= 2 ? (p.rating as number) : undefined,
        potential: scoutLevel >= 3 ? (p.potential as number) : undefined,
        ...(revealed ? {
          speed: p.speed as number,
          passing: p.passing as number,
          shooting: p.shooting as number,
          defending: (p.defending || p.tk) as number,
          power: (p.power || p.guc) as number,
          vision: (p.vision || p.alg) as number,
          control: (p.control || p.top) as number,
        } : {}),
      };

      const discoveryScore = Math.min(100, Math.round(
        (((p.potential as number) || 70) / 100) * 60 +
        (scoutQuality / 100) * 40
      ));

      const notes = generateScoutNoteFromDB(p, scoutLevel, scoutQuality);

      return {
        player: partialPlayer,
        isRevealed: revealed,
        discoveryScore,
        notes,
      };
    });

    const summary = foundPlayers.length > 0
      ? `${foundPlayers.length} aday tespit edildi. En iyi buluş: ${foundPlayers[0]?.player?.name || '?'} (${foundPlayers[0]?.notes}).`
      : 'Bu kriterlere uyan oyuncu bulunamadı. Filtreleri genişlet.';

    return {
      summary,
      foundPlayers,
      scoutQuality,
      duration: scoutLevel === 1 ? 1 : scoutLevel === 2 ? 3 : 7,
    };
  } catch (err) {
    console.error('[generateScoutingReport] Error, using fallback:', err);
    return generateFallbackReport(filters, scoutQuality);
  }
}

/** Fallback: Uses playerGenerator when Supabase is not available */
async function generateFallbackReport(
  filters: ScoutFilters = {},
  scoutQuality: number = 60,
): Promise<ScoutingReport> {
  const {
    position = 'MID',
    ageMin = 16,
    ageMax = 35,
    ratingMin = 50,
    ratingMax = 90,
    scoutLevel = 1,
    archetype,
  } = filters;

  const { generateStarterPlayer } = await import('./playerGenerator');

  const candidateCount = Math.min(5, Math.max(1, Math.floor(scoutQuality / 25)));
  const foundPlayers: ScoutedPlayer[] = [];

  for (let i = 0; i < candidateCount + 3; i++) {
    const pos = position as any;
    const targetRating = ratingMin + Math.random() * (ratingMax - ratingMin);
    let player: Player;
    try {
      player = generateStarterPlayer(pos, Math.round(targetRating));
    } catch { continue; }

    if (player.age < ageMin || player.age > ageMax) continue;
    if (archetype && player.traits && !player.traits.some(t =>
      t.toLowerCase().includes(archetype.toLowerCase().substring(0, 5))
    )) continue;

    const revealed = scoutLevel >= 3 || (scoutQuality > 75 && scoutLevel >= 2);
    const partialPlayer: Partial<Player> = {
      id: player.id, name: player.name, position: player.position,
      specificPosition: (player as any).specificPosition, age: player.age,
      nation: (player as any).nation,
      rating: scoutLevel >= 2 ? player.rating : undefined,
      potential: scoutLevel >= 3 ? player.potential : undefined,
      ...(revealed ? player : {}),
    };

    const discoveryScore = Math.min(100, Math.round(
      ((player.potential || 70) / 100) * 60 + (scoutQuality / 100) * 40
    ));

    foundPlayers.push({
      player: partialPlayer, isRevealed: revealed, discoveryScore,
      notes: generateScoutNote(player, scoutLevel, scoutQuality),
    });

    if (foundPlayers.length >= candidateCount) break;
  }

  const summary = foundPlayers.length > 0
    ? `${foundPlayers.length} aday tespit edildi. En iyi buluş: ${foundPlayers[0]?.player?.name || '?'}.`
    : 'Bu kriterlere uyan oyuncu bulunamadı.';

  return { summary, foundPlayers, scoutQuality, duration: scoutLevel === 1 ? 1 : scoutLevel === 2 ? 3 : 7 };
}

function generateScoutNoteFromDB(player: Record<string, unknown>, scoutLevel: number, quality: number): string {
  if (scoutLevel <= 1) {
    return quality > 70 ? 'Gelecek vadediyor' : 'Standart potansiyel';
  }
  if (scoutLevel === 2) {
    const rat = (player.rating as number) || 60;
    if (rat >= 80) return `Dikkat çekici rating (${rat}), takip değer`;
    if (rat >= 65) return `Ortalama üstü profil (${rat})`;
    return `Gelişim potansiyeli var (${rat})`;
  }
  const strengths: string[] = [];
  if (((player.speed as number) || 0) > 75) strengths.push('hız');
  if (((player.passing as number) || 0) > 75) strengths.push('pas');
  if (((player.shooting as number) || 0) > 75) strengths.push('şut');
  if (((player.defending as number) || 0) > 75) strengths.push('savunma');
  if (((player.potential as number) || 0) > 85) strengths.push('yüksek potansiyel');
  return strengths.length > 0
    ? `Güçlü yanlar: ${strengths.join(', ')}. Takıma katkı sağlayabilir.`
    : `${player.position} pozisyonunda dengeli profil.`;
}

function generateScoutNote(player: Player, scoutLevel: number, quality: number): string {
  if (scoutLevel <= 1) {
    return quality > 70 ? 'Gelecek vadediyor' : 'Standart potansiyel';
  }
  if (scoutLevel === 2) {
    const rat = player.rating;
    if (rat >= 80) return `Dikkat çekici rating (${rat}), takip değer`;
    if (rat >= 65) return `Ortalama üstü profil (${rat})`;
    return `Gelişim potansiyeli var (${rat})`;
  }
  const strengths: string[] = [];
  if ((player.speed || 0) > 75) strengths.push('hız');
  if ((player.passing || 0) > 75) strengths.push('pas');
  if ((player.shooting || 0) > 75) strengths.push('şut');
  if ((player.defending || 0) > 75) strengths.push('savunma');
  return strengths.length > 0
    ? `Güçlü yanlar: ${strengths.join(', ')}. Takıma katkı sağlayabilir.`
    : `${player.position} pozisyonunda dengeli profil.`;
}
