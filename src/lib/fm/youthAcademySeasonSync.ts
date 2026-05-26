/**
 * youthAcademySeasonSync.ts
 *
 * Gençlik akademisi sezon başı üretim sistemi.
 * Yeni genç oyuncular SADECE sezon sonunda (34. hafta tamamlandığında) üretilir.
 * Haftalık cron sadece mevcut genç oyuncuların gelişimini yönetir.
 */

import { generateYouthPlayer } from './youthAcademy';
import { getAcademyQualityMultiplier } from './stadiumMatrix';

interface SupabaseClient {
  from: (table: string) => any;
}

interface YouthGenerationResult {
  totalGenerated: number;
  teamsProcessed: number;
  details: { profileId: string; count: number }[];
}

/**
 * Akademi seviyesine göre sezon başı üretilecek genç oyuncu sayısı
 * Level 1: 1 oyuncu, Level 2: 1-2, Level 3: 2, Level 4: 2-3, Level 5: 3
 * Level 6: 3-4, Level 7: 3-5, Level 8: 4-5, Level 9: 5-6
 */
function getYouthCountForLevel(academyLevel: number): number {
  const counts: Record<number, [number, number]> = {
    1: [1, 1],
    2: [1, 2],
    3: [2, 2],
    4: [2, 3],
    5: [3, 3],
    6: [3, 4],
    7: [3, 5],
    8: [4, 5],
    9: [5, 6],
    10: [6, 7],
  };
  const [min, max] = counts[academyLevel] || [1, 1];
  return min + Math.floor(Math.random() * (max - min + 1));
}

/**
 * user_facilities tablosundan akademi seviyesini oku.
 * facility_id = 'youth_academy' veya 'akademi' olan kaydın level'ını döndür.
 * Bulunamazsa varsayılan seviye 1.
 */
async function getAcademyLevel(supabase: SupabaseClient, profileId: string): Promise<number> {
  try {
    const { data } = await supabase
      .from('user_facilities')
      .select('level')
      .eq('profile_id', profileId)
      .in('facility_id', ['youth_academy', 'akademi', 'academy'])
      .order('level', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (data && typeof data.level === 'number') {
      return Math.max(1, Math.min(10, data.level));
    }
  } catch {
    // Table might not exist
  }

  // Fallback: profiles tablosundan academy_level kolonu dene
  try {
    const { data: profileData } = await supabase
      .from('profiles')
      .select('academy_level, youth_academy_level')
      .eq('id', profileId)
      .maybeSingle();

    if (profileData) {
      const level = profileData.academy_level || profileData.youth_academy_level;
      if (typeof level === 'number') return Math.max(1, Math.min(10, level));
    }
  } catch {
    // Column might not exist
  }

  return 1; // Default level 1
}

/**
 * Tüm takımlar için sezon sonu genç oyuncu üretimi.
 * Her takımın akademi seviyesine göre 1-3 yeni genç oyuncu üretir.
 * Oyuncuları players tablosuna ve (varsa) youth_players tablosuna ekler.
 */
export async function generateYouthPlayersForAllTeams(
  supabase: SupabaseClient,
): Promise<YouthGenerationResult> {
  // 1. Tüm aktif takımları getir (league_teams üzerinden)
  const { data: leagueTeams } = await supabase
    .from('league_teams')
    .select('profile_id, name')
    .not('profile_id', 'is', null);

  if (!leagueTeams || leagueTeams.length === 0) {
    return { totalGenerated: 0, teamsProcessed: 0, details: [] };
  }

  // Benzersiz profile_id'leri al
  const uniqueProfiles = Array.from(
    new Map(
      leagueTeams
        .filter((t: any) => t.profile_id)
        .map((t: any) => [t.profile_id, t])
    ).values()
  );

  const details: { profileId: string; count: number }[] = [];
  let totalGenerated = 0;

  for (const team of uniqueProfiles) {
    const profileId = team.profile_id as string;
    const teamName = team.name as string;

    // Akademi seviyesini oku
    const academyLevel = await getAcademyLevel(supabase, profileId);
    const youthCount = getYouthCountForLevel(academyLevel);

    // currentWeek hesapla (sözleşme bitiş haftası için)
    const { data: profileData } = await supabase
      .from('profiles')
      .select('current_day')
      .eq('id', profileId)
      .maybeSingle();
    const currentWeek = Math.ceil((profileData?.current_day || 1) / 7);

    // Genç oyuncuları üret
    const playersToInsert: any[] = [];

    for (let i = 0; i < youthCount; i++) {
      const youthPlayer = generateYouthPlayer(academyLevel);

      // Apply academy quality multiplier from stadiumMatrix
      const academyQualityMultiplier = getAcademyQualityMultiplier(academyLevel);
      const boostedRating = Math.min(99, Math.round(youthPlayer.rating * academyQualityMultiplier));
      const boostedPotential = Math.min(99, Math.round((youthPlayer.hidden_potential || youthPlayer.potential || youthPlayer.rating + 15) * academyQualityMultiplier));

      // YouthPlayer → players tablosu formatına dönüştür
      const playerRow = {
        id: `youth-${profileId}-${i}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        name: youthPlayer.name,
        position: youthPlayer.position,
        specific_position: youthPlayer.specificPosition || youthPlayer.position,
        rating: boostedRating,
        potential: boostedPotential,
        age: youthPlayer.age,
        nation: youthPlayer.nationality || 'Türkiye',
        team_name: teamName,
        profile_id: profileId,
        market_value: youthPlayer.rating * youthPlayer.rating * 80,
        salary: Math.round(youthPlayer.rating * 100),
        speed: youthPlayer.speed ?? youthPlayer.rating + Math.floor(Math.random() * 10) - 5,
        physical: youthPlayer.power ?? youthPlayer.rating + Math.floor(Math.random() * 10) - 5,
        passing: youthPlayer.passing ?? youthPlayer.rating + Math.floor(Math.random() * 10) - 5,
        shooting: youthPlayer.shooting ?? youthPlayer.rating + Math.floor(Math.random() * 10) - 5,
        heading: youthPlayer.heading ?? youthPlayer.rating + Math.floor(Math.random() * 10) - 5,
        goalkeeping: youthPlayer.goalkeeping ?? (youthPlayer.position === 'GK' ? youthPlayer.rating + 10 : Math.max(1, youthPlayer.rating - 30)),
        control: youthPlayer.control ?? youthPlayer.rating + Math.floor(Math.random() * 10) - 5,
        vision: youthPlayer.vision ?? youthPlayer.rating + Math.floor(Math.random() * 10) - 5,
        defending: youthPlayer.defending ?? youthPlayer.rating + Math.floor(Math.random() * 10) - 5,
        mental: youthPlayer.mental ?? youthPlayer.rating,
        cond: 100,
        morale: 80,
        is_injured: false,
        is_on_loan_market: false,
        loan_fee: 0,
        scouted: true,
        is_youth: true,
        contract_end_week: currentWeek + 34,
      };

      playersToInsert.push(playerRow);
    }

    // players tablosuna ekle
    if (playersToInsert.length > 0) {
      const { error: insertError } = await supabase
        .from('players')
        .insert(playersToInsert);

      if (insertError) {
        console.warn(`[youthSeasonSync] Players insert failed for ${teamName}:`, insertError.message);
      } else {
        totalGenerated += playersToInsert.length;
        details.push({ profileId, count: playersToInsert.length });
      }
    }

    // youth_players tablosuna da ekle (tablo varsa)
    try {
      const youthRows = playersToInsert.map(p => ({
        profile_id: profileId,
        player_id: p.id,
        player_name: p.name,
        position: p.position,
        rating: p.rating,
        potential: p.potential,
        discovered_at: new Date().toISOString(),
      }));

      await supabase.from('youth_players').insert(youthRows);
    } catch {
      // youth_players tablosu yoksa sessizce devam et
    }
  }

  return {
    totalGenerated,
    teamsProcessed: uniqueProfiles.length,
    details,
  };
}

/**
 * Sezon sonu gençlik alımının sezon durumunu kontrol et.
 * 34 hafta tamamlanmamışsa alım yapılamaz.
 */
export function canDoSeasonIntake(currentWeek: number, seasonIntakeUsed: boolean): {
  canIntake: boolean;
  reason?: string;
} {
  if (currentWeek < 34) {
    return {
      canIntake: false,
      reason: `Sezon sonu alım için 34 hafta tamamlanmalı. Şu an: ${currentWeek}/34`,
    };
  }

  if (seasonIntakeUsed) {
    return {
      canIntake: false,
      reason: 'Bu sezonun alımı zaten yapıldı.',
    };
  }

  return { canIntake: true };
}
