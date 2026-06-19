/**
 * LİG YARDIMCI FONKSİYONLARI
 *
 * Kademeli lig sistemi: 1. Lig (üst) → 2. Lig → 3. Lig → 4. Lig (en alt)
 * 4. Lig birden fazla gruba (departmana) ayrılabilir.
 * Her grupta 18 takım.
 *
 * Bu modül şunları sağlar:
 * - Yeni kullanıcı kaydında bot takım devralma veya yeni grup oluşturma
 * - Sezon sonu yükselme / düşme mekanizması
 * - Kullanıcının mevcut lig bilgisini sorgulama
 */

import { getTeamNamesForDepartment, TEAMS_PER_LEAGUE } from './constants';
import { getTomorrowNoon } from './league';

// ═══════════════════════════════════════════════════
// TÜRLER
// ═══════════════════════════════════════════════════

interface LeagueRow {
  id: string;
  name: string;
  tier: number;
  created_at?: string;
}

interface LeagueTeamRow {
  id: string;
  name: string;
  league_id: string;
  profile_id: string | null;
  is_npc: boolean;
  is_bot: boolean;
  strength?: number;
  color?: string | null;
}

interface StandingRow {
  id: string;
  team_id: string;
  league_id?: string;
  season_id?: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  gf: number;
  ga: number;
  gd?: number;
  points: number;
  league_teams?: { name: string; profile_id: string | null; is_npc: boolean; is_bot: boolean };
}

// ═══════════════════════════════════════════════════
// GÖREV 1: YENİ KULLANICI KAYIT – BOT TAKIM DEVRALMA / YENİ GRUP OLUŞTURMA
// ═══════════════════════════════════════════════════

/**
 * Yeni kullanıcıya 4. Lig'de bir takım atar.
 *
 * Mantık sırası:
 * 1. tier=4 olan liglerde bot/NPC takım bul (is_bot=true VEYA is_npc=true, profile_id IS NULL)
 * 2. Bulursa → o takımı kullanıcıya ata
 * 3. Bulamazsa → yeni 4. Lig bölümü oluştur (17 bot + 1 kullanıcı)
 *
 * @returns Atanan ligin ID'si ve adı, veya null (başarısız)
 */
export async function assignUserToLeague(
  supabase: any,
  userId: string,
  teamName: string,
  color1: string
): Promise<{ leagueId: string; leagueName: string; teamSlotId: string } | null> {
  // 1. Tüm 4. Lig gruplarını bul
  const { data: tier4Leagues, error: t4Err } = await supabase
    .from('leagues')
    .select('id, name, tier')
    .eq('tier', 4)
    .order('created_at', { ascending: true });

  if (t4Err || !tier4Leagues || tier4Leagues.length === 0) {
    // Hiç 4. Lig yoksa oluştur
    return await createNewLeagueGroup(supabase, userId, teamName, color1, 4, 1);
  }

  // 2. Her grupta bot/NPC slot ara — atomik UPDATE ile claim et (race condition önler)
  // is_bot=true VEYA is_npc=true olan ve profile_id=NULL olan takımları devral
  for (const league of tier4Leagues) {
    // Önce is_bot=true olanları dene (öncelikli)
    const { data: claimedSlot, error: claimError } = await supabase
      .from('league_teams')
      .update({
        profile_id: userId,
        is_bot: false,
        is_npc: false,
        name: teamName,
        color: color1,
      })
      .eq('is_bot', true)
      .is('profile_id', null)
      .eq('league_id', league.id)
      .select('id, name')
      .limit(1)
      .maybeSingle();

    if (claimedSlot && !claimError) {
      console.log(`[assignUserToLeague] Bot takım devralındı: "${claimedSlot.name}" → "${teamName}" (Lig: ${league.name})`);
      return { leagueId: league.id, leagueName: league.name, teamSlotId: claimedSlot.id };
    }

    // is_bot yoksa, is_npc=true olanları dene (maintenance tarafından oluşturulanlar)
    const { data: claimedNpcSlot, error: npcClaimError } = await supabase
      .from('league_teams')
      .update({
        profile_id: userId,
        is_bot: false,
        is_npc: false,
        name: teamName,
        color: color1,
      })
      .eq('is_npc', true)
      .is('profile_id', null)
      .eq('league_id', league.id)
      .select('id, name')
      .limit(1)
      .maybeSingle();

    if (claimedNpcSlot && !npcClaimError) {
      console.log(`[assignUserToLeague] NPC takım devralındı: "${claimedNpcSlot.name}" → "${teamName}" (Lig: ${league.name})`);
      return { leagueId: league.id, leagueName: league.name, teamSlotId: claimedNpcSlot.id };
    }
  }

  // 3. Boş bot/NPC yok → yeni bölüm oluştur
  const nextGroupIndex = tier4Leagues.length + 1;
  return await createNewLeagueGroup(supabase, userId, teamName, color1, 4, nextGroupIndex);
}

/**
 * Yeni bir lig grubu oluşturur ve kullanıcıya atar.
 * Gruba 17 bot takım + 1 kullanıcı takım ekler.
 * Sezon ve fikstür de oluşturur.
 */
export async function createNewLeagueGroup(
  supabase: any,
  userId: string,
  teamName: string,
  color1: string,
  tier: number,
  groupIndex: number
): Promise<{ leagueId: string; leagueName: string; teamSlotId: string } | null> {
  // 1-3. Ligler tek grup
  const leagueName = tier <= 3
    ? `${tier}. Lig`
    : groupIndex === 1
      ? '4. Lig'
      : `4. Lig ${groupIndex}. Bölüm`;

  // Lig oluştur
  const { data: newLeague, error: leagueErr } = await supabase
    .from('leagues')
    .insert({ name: leagueName, tier })
    .select()
    .maybeSingle();

  if (leagueErr || !newLeague) {
    console.error('[createNewLeagueGroup] Lig oluşturma hatası:', leagueErr?.message);
    return null;
  }

  // Takım isimlerini al
  const teamNames = getTeamNamesForDepartment(tier, groupIndex);

  // 17 bot takım oluştur
  const botTeams: any[] = [];
  for (let i = 0; i < 17; i++) {
    botTeams.push({
      league_id: newLeague.id,
      name: teamNames[i + 1] || `${leagueName} Bot ${i + 1}`,
      is_npc: true,
      is_bot: true,
      strength: 45 + Math.floor(Math.random() * 10),
    });
  }

  const { error: botsErr } = await supabase.from('league_teams').insert(botTeams);
  if (botsErr) {
    console.error('[createNewLeagueGroup] Bot takım ekleme hatası:', botsErr.message);
  }

  // Kullanıcı takımını oluştur
  const { data: userTeam, error: userTeamErr } = await supabase
    .from('league_teams')
    .insert({
      league_id: newLeague.id,
      name: teamName,
      profile_id: userId,
      is_bot: false,
      is_npc: false,
      strength: 55,
      color: color1,
    })
    .select()
    .maybeSingle();

  if (userTeamErr || !userTeam) {
    console.error('[createNewLeagueGroup] Kullanıcı takım ekleme hatası:', userTeamErr?.message);
    return null;
  }

  // Sezon oluştur
  const seasonStart = getTomorrowNoon();
  const { data: newSeason } = await supabase
    .from('seasons')
    .insert({
      league_id: newLeague.id,
      year: new Date().getFullYear(),
      start_date: seasonStart.toISOString().split('T')[0],
      current_tur: 1,
      is_finished: false,
    })
    .select()
    .maybeSingle();

  if (newSeason) {
    // Fikstür oluştur (RPC)
    try {
      await supabase.rpc('generate_league_fixtures', { p_season_id: newSeason.id });
    } catch (fixErr) {
      console.warn('[createNewLeagueGroup] Fikstür oluşturma hatası:', fixErr);
    }

    // Standings oluştur
    const { data: allTeams } = await supabase
      .from('league_teams')
      .select('id')
      .eq('league_id', newLeague.id);

    if (allTeams && allTeams.length > 0) {
      const standingsRows = allTeams.map((t: any) => ({
        season_id: newSeason.id,
        team_id: t.id,
        league_id: newLeague.id,
        played: 0, won: 0, drawn: 0, lost: 0,
        gf: 0, ga: 0, gd: 0, points: 0,
      }));
      try {
        await supabase.from('league_standings').insert(standingsRows);
      } catch (sErr) {
        console.warn('[createNewLeagueGroup] Standings oluşturma hatası:', sErr);
      }
    }

    // Hakem ata
    try {
      const { assignRefereesToSeason } = await import('./referee');
      await assignRefereesToSeason(supabase, newLeague.id, newSeason.id);
    } catch (refErr) {
      console.warn('[createNewLeagueGroup] Hakem atama hatası:', refErr);
    }
  }

  console.log(`[createNewLeagueGroup] Yeni grup oluşturuldu: "${leagueName}" (18 takım, ID: ${newLeague.id})`);
  return { leagueId: newLeague.id, leagueName, teamSlotId: userTeam.id };
}

// ═══════════════════════════════════════════════════
// GÖREV 2: YÜKSELME VE DÜŞME MEKANİZMASI
// ═══════════════════════════════════════════════════

/**
 * Bir lig grubu için sezon sonu yükselme/düşme işlemlerini yapar.
 *
 * Kurallar:
 * - 1. sıra → doğrudan bir üst lige yükselir
 * - 2-5. sıra → playoff oynar, kazanan yükselir
 * - Son 2 sıra → bir alt lige düşer (4. Lig'den düşme yok)
 * - Yükselen ve düşen takım sayısı dengeli olmalı
 */
export async function processPromotionRelegation(
  supabase: any,
  leagueId: string,
  seasonId: string
): Promise<{
  promoted: Array<{ teamId: string; teamName: string; fromLeague: string; toLeague: string }>;
  relegated: Array<{ teamId: string; teamName: string; fromLeague: string; toLeague: string }>;
  playoffWinner?: { teamId: string; teamName: string };
}> {
  // 1. Lig bilgisini al
  const { data: leagueInfo } = await supabase
    .from('leagues')
    .select('id, name, tier')
    .eq('id', leagueId)
    .maybeSingle();

  if (!leagueInfo) {
    console.error('[processPromotionRelegation] Lig bulunamadı:', leagueId);
    return { promoted: [], relegated: [] };
  }

  const tier = leagueInfo.tier;
  const result = {
    promoted: [] as Array<{ teamId: string; teamName: string; fromLeague: string; toLeague: string }>,
    relegated: [] as Array<{ teamId: string; teamName: string; fromLeague: string; toLeague: string }>,
    playoffWinner: undefined as { teamId: string; teamName: string } | undefined,
  };

  // 2. Sıralamayı al (puan durumuna göre)
  const { data: standings } = await supabase
    .from('league_standings')
    .select(`
      id, team_id, played, won, drawn, lost, gf, ga, gd, points,
      league_teams ( id, name, profile_id, is_npc, is_bot )
    `)
    .eq('season_id', seasonId)
    .order('points', { ascending: false })
    .order('gd', { ascending: false })
    .order('gf', { ascending: false });

  if (!standings || standings.length < 2) {
    console.warn('[processPromotionRelegation] Yetersiz takım:', standings?.length || 0);
    return result;
  }

  const teamCount = standings.length;

  // ─── YÜKSELME ─────────────────────────────
  if (tier > 1) {
    const upperTier = tier - 1;

    // Şampiyon (1. sıra) → doğrudan yükselir
    const champion = standings[0];
    const champTeam = champion.league_teams as any;
    if (champTeam) {
      const targetLeague = await findOrCreateLeagueGroup(supabase, upperTier);
      if (targetLeague) {
        await moveTeamToLeague(supabase, champTeam.id, targetLeague.id, champTeam.name, champTeam.profile_id);
        result.promoted.push({
          teamId: champTeam.id,
          teamName: champTeam.name,
          fromLeague: leagueInfo.name,
          toLeague: targetLeague.name,
        });
      }
    }

    // BUG #22 FIX: Playoff kazananını simülasyonla belirle
    // Gerçek playoff fixture'ları oluşturmak yerine, simülasyon ile
    // kazananı belirle ve hemen yükselt. Bu, playoff maçlarının
    // asla işlenmemesi sorununu çözer.
    if (teamCount >= 5) {
      const playoffTeams = standings.slice(1, 5).map((s: any) => s.league_teams);

      // Sıralama haritası oluştur (ağırlıklı seçim için)
      const standingsMap: Record<string, { points: number; gd: number }> = {};
      for (const s of standings) {
        const t = s.league_teams as any;
        if (t) {
          standingsMap[t.id] = { points: s.points || 0, gd: s.gd || 0 };
        }
      }

      // Playoff simülasyonu
      const playoffWinner = simulatePlayoff(playoffTeams, standingsMap);
      if (playoffWinner) {
        const targetLeague = await findOrCreateLeagueGroup(supabase, upperTier);
        if (targetLeague) {
          await moveTeamToLeague(supabase, playoffWinner.id, targetLeague.id, playoffWinner.name, playoffWinner.profile_id);
          result.promoted.push({
            teamId: playoffWinner.id,
            teamName: playoffWinner.name,
            fromLeague: leagueInfo.name,
            toLeague: targetLeague.name,
          });
          result.playoffWinner = { teamId: playoffWinner.id, teamName: playoffWinner.name };
          console.log(`[processPromotionRelegation] Playoff kazananı yükseldi: ${playoffWinner.name}`);
        }
      }
    }
  }

  // ─── DÜŞME ─────────────────────────────
  if (tier < 4) {
    // BUG #4 FIX: Düşen takım sayısı yükselen takım sayısına eşit olmalı
    // Bu sayede liglerdeki takım sayısı dengede kalır
    const relegationCount = result.promoted.length > 0 ? result.promoted.length : 2;
    const lowerTier = tier + 1;

    for (let i = teamCount - 1; i >= teamCount - relegationCount; i--) {
      const relegatedStanding = standings[i];
      const relTeam = relegatedStanding?.league_teams as any;
      if (relTeam) {
        const targetLeague = await findOrCreateLeagueGroup(supabase, lowerTier);
        if (targetLeague) {
          await moveTeamToLeague(supabase, relTeam.id, targetLeague.id, relTeam.name, relTeam.profile_id);
          result.relegated.push({
            teamId: relTeam.id,
            teamName: relTeam.name,
            fromLeague: leagueInfo.name,
            toLeague: targetLeague.name,
          });
        }
      }
    }
  }

  // 4. Lig'den düşme yok
  console.log(`[processPromotionRelegation] ${leagueInfo.name}: ${result.promoted.length} yükselen, ${result.relegated.length} düşen`);
  return result;
}

/**
 * Takımı bir ligden diğerine taşır.
 */
export async function moveTeamToLeague(
  supabase: any,
  teamId: string,
  targetLeagueId: string,
  teamName: string,
  profileId: string | null
): Promise<boolean> {
  // league_teams'ı güncelle
  const { error: ltErr } = await supabase
    .from('league_teams')
    .update({ league_id: targetLeagueId })
    .eq('id', teamId);

  if (ltErr) {
    console.error('[moveTeamToLeague] league_teams güncelleme hatası:', ltErr.message);
    return false;
  }

  // Profile'ın league_name VE league_tier'ını güncelle (eğer gerçek kullanıcıysa)
  // BUG D5 FIX: ticket_price yeni tier'ın maksimumunu aşüyorsa sınırlandı, ancak asla varsayılana sıfırlama
  if (profileId) {
    const { data: targetLeague } = await supabase
      .from('leagues')
      .select('name, tier')
      .eq('id', targetLeagueId)
      .maybeSingle();

    if (targetLeague) {
      const profileUpdate: Record<string, unknown> = {
        league_name: targetLeague.name,
        league_tier: targetLeague.tier,
      };

      // Mevcut ticket_price'ı koru, ancak yeni tier'ın maksimumunu aşıyorsa sınırlandır
      const MAX_TICKET_BY_TIER: Record<number, number> = {
        1: 120,   // Süper Lig
        2: 90,    // 1. Lig
        3: 60,    // 2. Lig
        4: 40,    // 3. Lig
      };
      const newMaxPrice = MAX_TICKET_BY_TIER[targetLeague.tier] || 40;
      const { data: currentProfile } = await supabase
        .from('profiles')
        .select('ticket_price')
        .eq('id', profileId)
        .maybeSingle();

      if (currentProfile) {
        const currentTicketPrice = currentProfile.ticket_price ?? 35;
        // Sadece yeni tier'ın maksimumunu aşıyorsa sınırlandır, asla varsayılana sıfırlama
        const cappedPrice = Math.min(currentTicketPrice, newMaxPrice);
        profileUpdate.ticket_price = cappedPrice;
      }

      await supabase
        .from('profiles')
        .update(profileUpdate)
        .eq('id', profileId);
    }
  }

  return true;
}

/**
 * Verilen tier'da bir lig bulur veya oluşturur.
 * 18 takımdan az olan (boş slotu olan) ligleri öncelikli döndürür.
 * Hiçbiri yoksa yeni lig oluşturur.
 *
 * Bu fonksiyon yükselme/düşme sırasında kullanılır.
 */
async function findOrCreateLeagueGroup(
  supabase: any,
  tier: number
): Promise<LeagueRow | null> {
  // Mevcut ligleri bul
  const { data: existingLeagues } = await supabase
    .from('leagues')
    .select('id, name, tier')
    .eq('tier', tier)
    .order('created_at', { ascending: true });

  if (existingLeagues && existingLeagues.length > 0) {
    // 18 takımdan az olan (boş slotu olan) ligi bul
    for (const league of existingLeagues) {
      const { count: teamCount } = await supabase
        .from('league_teams')
        .select('*', { count: 'exact', head: true })
        .eq('league_id', league.id);

      if (!teamCount || teamCount < TEAMS_PER_LEAGUE) {
        // Bu ligde boş slot var → takım eklenebilir
        return league;
      }
    }

    // Tüm ligler dolu — 4. Lig için yeni departman (bölüm) oluştur
    // 1-3. Liglerde sadece 1 grup olabilir, takım fazlası tolere edilir
    if (tier <= 3) {
      return existingLeagues[0];
    }

    // 4. Lig: Yeni bölüm oluştur (4. Lig 2. Bölüm, 3. Bölüm, vb.)
    const nextDeptIndex = existingLeagues.length + 1;
    console.log(`[findOrCreateLeagueGroup] 4. Lig tüm bölümler dolu, ${nextDeptIndex}. bölüm oluşturuluyor`);
    // Aşağıda yeni lig oluşturma kodu çalışacak
  }

  // Yeni lig oluştur
  // 4. Lig için bölüm numarasını hesapla
  const deptIndex = tier === 4
    ? (existingLeagues?.length || 0) + 1
    : 1;
  const leagueName = tier <= 3
    ? `${tier}. Lig`
    : deptIndex === 1
      ? '4. Lig'
      : `4. Lig ${deptIndex}. Bölüm`;
  const { data: newLeague, error } = await supabase
    .from('leagues')
    .insert({ name: leagueName, tier })
    .select()
    .maybeSingle();

  if (error || !newLeague) {
    console.error('[findOrCreateLeagueGroup] Lig oluşturma hatası:', error?.message);
    return null;
  }

  // 18 bot takım ekle + her biri için bot profile oluştur
  // Departman indeksine göre isim havuzundan doğru isimleri al
  const teamNames = getTeamNamesForDepartment(tier, deptIndex);
  const botTeams: any[] = [];
  const botProfiles: any[] = [];

  for (let i = 0; i < teamNames.length; i++) {
    const botId = crypto.randomUUID();
    botTeams.push({
      league_id: newLeague.id,
      name: teamNames[i],
      profile_id: botId,
      is_npc: true,
      is_bot: true,
      strength: 40 + Math.floor(Math.random() * 15),
    });
    // BUG #9 FIX: Her bot takım için profile kaydı oluştur
    // Bu sayede bot-actions cron bu takımları yönetebilir
    botProfiles.push({
      id: botId,
      team_name: teamNames[i],
      manager_name: `Bot Menajer ${i + 1}`,
      money: 25_000_000 + tier * 10_000_000,
      credits: 250,
      level: 1,
      xp: 0,
      fans: 1000,
      current_day: 1,
      ticket_price: 35,
      stadium_capacity: 10000,
      league_name: leagueName,
      league_tier: tier,
      is_bot: true,
      reputation: 20 + tier * 5,
      academy_level: 1,
    });
  }

  // Bot profillerini oluştur
  if (botProfiles.length > 0) {
    const { error: profileErr } = await supabase.from('profiles').insert(botProfiles);
    if (profileErr) {
      console.warn('[findOrCreateLeagueGroup] Bot profil oluşturma hatası:', profileErr.message);
    }
  }

  // Bot takımlarını oluştur
  await supabase.from('league_teams').insert(botTeams);

  // Her bot takım için oyuncular oluştur
  try {
    const { generateLocalizedPlayer } = await import('./region-generator');
    const allBotPlayers: any[] = [];
    const posCounts = { GK: 2, DEF: 6, MID: 6, FWD: 5 }; // 19 oyuncu per bot

    for (let i = 0; i < botProfiles.length; i++) {
      const botProfile = botProfiles[i];
      for (const [pos, count] of Object.entries(posCounts)) {
        for (let j = 0; j < count; j++) {
          const p = generateLocalizedPlayer('TR' as any, botProfile.team_name, tier, pos as any);
          allBotPlayers.push({
            id: p.id || crypto.randomUUID(),
            name: p.name,
            position: pos,
            specific_position: p.specificPosition || pos,
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
            personality: JSON.stringify({ traits: [], negTraits: [], personalityTraits: [], traitLevels: {}, styleLevels: {}, archetype: p.archetype, special_role: p.special_role }),
            is_for_sale: false,
            is_injured: false,
            profile_id: botProfile.id,
            team_name: botProfile.team_name,
          });
        }
      }
    }

    // Batch insert - her 100 oyuncuda bir
    for (let i = 0; i < allBotPlayers.length; i += 100) {
      const batch = allBotPlayers.slice(i, i + 100);
      const { error: playerErr } = await supabase.from('players').insert(batch);
      if (playerErr) {
        console.warn('[findOrCreateLeagueGroup] Bot oyuncu ekleme hatası:', playerErr.message);
      }
    }
    console.log(`[findOrCreateLeagueGroup] ${allBotPlayers.length} bot oyuncu oluşturuldu`);
  } catch (playerGenErr) {
    console.warn('[findOrCreateLeagueGroup] Bot oyuncu oluşturma hatası:', playerGenErr);
  }

  // Sezon ve fikstür oluştur
  const seasonStart = getTomorrowNoon();
  const { data: newSeason } = await supabase
    .from('seasons')
    .insert({
      league_id: newLeague.id,
      year: new Date().getFullYear(),
      start_date: seasonStart.toISOString().split('T')[0],
      current_tur: 1,
      is_finished: false,
    })
    .select()
    .maybeSingle();

  if (newSeason) {
    try {
      await supabase.rpc('generate_league_fixtures', { p_season_id: newSeason.id });
    } catch (e) {
      console.warn('[findOrCreateLeagueGroup] Fikstür oluşturma hatası:', e);
    }

    // Standings oluştur
    const { data: allTeams } = await supabase
      .from('league_teams')
      .select('id')
      .eq('league_id', newLeague.id);

    if (allTeams) {
      const rows = allTeams.map((t: any) => ({
        season_id: newSeason.id,
        team_id: t.id,
        league_id: newLeague.id,
        played: 0, won: 0, drawn: 0, lost: 0,
        gf: 0, ga: 0, gd: 0, points: 0,
      }));
      await supabase.from('league_standings').insert(rows);
    }

    // Hakem
    try {
      const { assignRefereesToSeason } = await import('./referee');
      await assignRefereesToSeason(supabase, newLeague.id, newSeason.id);
    } catch (e) { console.warn("[silent-catch]", e); }
  }

  return newLeague;
}

/**
 * Playoff simülasyonu: 4 takım arasında eleme.
 * Yarı finale:
 *   2. vs 5. ve 3. vs 4.
 * Kazananlar finalde.
 * Final kazananı yükselir.
 *
 * @param teams — Playoff takımları (2-5. sıra)
 * @param standingsMap — Her takımın puan ve gol averajı
 */
function simulatePlayoff(
  teams: any[],
  standingsMap: Record<string, { points: number; gd: number }>
): { id: string; name: string; profile_id: string | null } | null {
  if (teams.length < 4) {
    // 4'ten az takım varsa en yüksek sıralı yükselir
    return teams[0] ? { id: teams[0].id, name: teams[0].name, profile_id: teams[0].profile_id } : null;
  }

  // Yarı final 1: 2. vs 5. (sıralama daha yüksek olanın kazanma şansı fazla)
  const semi1Winner = weightedRandomWinner(teams[0], teams[3], standingsMap);
  // Yarı final 2: 3. vs 4.
  const semi2Winner = weightedRandomWinner(teams[1], teams[2], standingsMap);

  // Final
  if (semi1Winner && semi2Winner) {
    return weightedRandomWinner(semi1Winner, semi2Winner, standingsMap);
  }

  return semi1Winner || semi2Winner || null;
}

/**
 * Ağırlıklı rastgele kazanan belirler.
 * Takımların puan ve gol averajı kazanma şansını etkiler.
 * En az %30, en fazla %70 şans — tamamen deterministik değil.
 */
function weightedRandomWinner(
  team1: { id: string; name: string; profile_id: string | null },
  team2: { id: string; name: string; profile_id: string | null },
  standingsMap: Record<string, { points: number; gd: number }>
): { id: string; name: string; profile_id: string | null } {
  const s1 = standingsMap[team1.id] || { points: 0, gd: 0 };
  const s2 = standingsMap[team2.id] || { points: 0, gd: 0 };

  const score1 = s1.points * 3 + (s1.gd || 0);
  const score2 = s2.points * 3 + (s2.gd || 0);
  const total = score1 + score2;

  // En az %30, en fazla %70 şans — tamamen deterministik değil
  const team1Chance = total > 0
    ? Math.max(0.30, Math.min(0.70, score1 / total))
    : 0.50;

  return Math.random() < team1Chance ? team1 : team2;
}

// ═══════════════════════════════════════════════════
// GÖREV 3: KULLANICININ LİG BİLGİSİNİ SORGULAMA
// ═══════════════════════════════════════════════════

/**
 * Bir kullanıcının mevcut lig bilgisini döndürür.
 * league_teams tablosu üzerinden kullanıcının league_id'sini bulur.
 */
export async function getUserLeagueInfo(
  supabase: any,
  profileId: string
): Promise<{
  leagueId: string;
  leagueName: string;
  tier: number;
  teamId: string;
  teamName: string;
  position: number;
  totalTeams: number;
  points: number;
  promotionZone: boolean;
  playoffZone: boolean;
  relegationZone: boolean;
} | null> {
  // 1. Kullanıcının league_teams kaydını bul
  const { data: userTeam } = await supabase
    .from('league_teams')
    .select('id, name, league_id')
    .eq('profile_id', profileId)
    .maybeSingle();

  if (!userTeam) return null;

  // 2. Lig bilgisini al
  const { data: leagueInfo } = await supabase
    .from('leagues')
    .select('id, name, tier')
    .eq('id', userTeam.league_id)
    .maybeSingle();

  if (!leagueInfo) return null;

  // 3. Mevcut sezonu bul
  const { data: currentSeason } = await supabase
    .from('seasons')
    .select('id')
    .eq('league_id', leagueInfo.id)
    .eq('is_finished', false)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!currentSeason) {
    return {
      leagueId: leagueInfo.id,
      leagueName: leagueInfo.name,
      tier: leagueInfo.tier,
      teamId: userTeam.id,
      teamName: userTeam.name,
      position: 0,
      totalTeams: 0,
      points: 0,
      promotionZone: false,
      playoffZone: false,
      relegationZone: false,
    };
  }

  // 4. Sıralamayı al
  const { data: standings } = await supabase
    .from('league_standings')
    .select('team_id, points, gd, gf')
    .eq('season_id', currentSeason.id)
    .order('points', { ascending: false })
    .order('gd', { ascending: false })
    .order('gf', { ascending: false });

  const totalTeams = standings?.length || 0;
  const position = standings?.findIndex((s: any) => s.team_id === userTeam.id) + 1 || 0;
  const userStanding = standings?.find((s: any) => s.team_id === userTeam.id);

  // 5. Yükselme/düşme bölgesi hesapla
  const tier_val = leagueInfo.tier;
  let promotionZone = false;
  let playoffZone = false;
  let relegationZone = false;

  if (tier_val > 1 && position === 1) promotionZone = true;
  if (tier_val > 1 && position >= 2 && position <= 5) playoffZone = true;
  if (tier_val < 4 && position > totalTeams - 2) relegationZone = true;

  return {
    leagueId: leagueInfo.id,
    leagueName: leagueInfo.name,
    tier: leagueInfo.tier,
    teamId: userTeam.id,
    teamName: userTeam.name,
    position,
    totalTeams,
    points: userStanding?.points || 0,
    promotionZone,
    playoffZone,
    relegationZone,
  };
}

/**
 * Kullanıcının mevcut lig ID'sini döndürür (API endpoint'ler için)
 */
export async function getUserLeagueId(supabase: any, profileId: string): Promise<string | null> {
  const { data } = await supabase
    .from('league_teams')
    .select('league_id')
    .eq('profile_id', profileId)
    .maybeSingle();
  return data?.league_id || null;
}
