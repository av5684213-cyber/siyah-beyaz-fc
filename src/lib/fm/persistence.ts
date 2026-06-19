import { getSupabase, isSupabaseConfigured } from '../supabase';
import { safeJsonParse, mapYouthPlayerFromRow, buildStatsObject, DEFAULT_STAT_VALUES } from './sharedUtils';

const STORAGE_KEYS = {
  PROFILE: 'fm_profile',
  SQUAD: 'fm_squad',
  LEAGUE: 'fm_league',
  TACTIC: 'fm_active_tactic',
  TRAINING: 'fm_training_state',
  WATCHLIST: 'fm_watchlist',
  LAST_MATCH: 'fm_last_match',
  YOUTH_PLAYERS: 'fm_youth_players',
  YOUTH_FACILITIES: 'fm_youth_facilities',
};

export const loadProfile = async (userId: string) => {
  if (isSupabaseConfigured()) {
    const supabase = getSupabase();
    const { data } = await supabase.from('profiles').select('id,manager_name,team_name,league_name,level,xp,money,fans,reputation,credits,current_day,team_id,defense_powers,ticket_price,academy_level,academy_extra_slots,stadium_capacity,region,active_upgrade_type,active_upgrade_id,active_upgrade_finish_day,active_upgrade_speedup,active_upgrade_started_at,active_upgrade_end_at,stadium_upgrades,sponsors,philosophy,primary_color,secondary_color,stadium_name,is_bot,bot_difficulty,academy_weekly_budget,last_youth_intake_season,total_trophies,total_awards,season_badges,hof_count,created_at,scout_slots,staff_coaches,staff_physios,staff_monthly_fees').eq('id', userId).maybeSingle();
    return data || null;
  }
  
  const local = localStorage.getItem(STORAGE_KEYS.PROFILE);
  if (!local) return null;
  const profile = JSON.parse(local);
  // Offline modda: profil farklı bir userId'ye sahipse bile yükle
  // (demo user ID değişmiş olabilir ama veri hala geçerli)
  // Ancak şu anki userId ile profil ID'si farklıysa, profili güncelle
  if (profile && profile.id !== userId) {
    profile.id = userId;
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  }
  return profile;
};

export const loadPlayers = async (userId: string, teamName?: string) => {
  if (isSupabaseConfigured()) {
    const supabase = getSupabase();
    
    const mapPlayer = (p: Record<string, unknown>) => {
      // personality JSONB'sini güvenli şekilde parse et
      // Eski format: {traits, negTraits, personalityTraits, traitLevels, styleLevels, archetype}
      // Yeni format: {ambition, professionalism, temperament, loyalty, pressure_handling}
      const rawPersonality = p.personality;
      const extra = safeJsonParse<Record<string, unknown>>(rawPersonality, {});

      // personality objesini Player tipine uygun formata dönüştür
      let safePersonality: { ambition: number; professionalism: number; temperament: number; loyalty: number; pressure_handling: number } | undefined;
      if (extra && typeof extra === 'object') {
        // Yeni format: ambition, professionalism, temperament, loyalty, pressure_handling
        if ('ambition' in extra || 'professionalism' in extra || 'pressure_handling' in extra) {
          safePersonality = {
            ambition: (extra.ambition as number) ?? 10,
            professionalism: (extra.professionalism as number) ?? 10,
            temperament: (extra.temperament as number) ?? 10,
            loyalty: (extra.loyalty as number) ?? 10,
            pressure_handling: (extra.pressure_handling as number) ?? 10,
          };
        }
      }

      return {
        ...p,
        // personality alanını güvenli şekilde üzerine yaz — React child olarak render edilmesini önle
        personality: safePersonality,
        // Eski format personality'den traits/negTraits/personalityTraits çıkar
        traits: safeJsonParse<string[]>(p.traits || extra.traits, []),
        negTraits: safeJsonParse<string[]>(p.neg_traits || extra.negTraits, []),
        personalityTraits: safeJsonParse<string[]>(extra.personalityTraits, []),
        club: (p.team_name as string) || (p.club as string) || ((extra as Record<string, unknown>).club as string) || undefined,
        rating: (p.rating as number) ?? (p.klt as number) ?? 60,
        potential: (p.potential as number) ?? (p.klt as number) ?? (p.rating as number) ?? 70,
        passing: (p.passing as number) ?? (p.pas as number) ?? 50,
        shooting: (p.shooting as number) ?? (p.sut as number) ?? 50,
        defending: (p.defending as number) ?? (p.tk as number) ?? 50,
        speed: (p.speed as number) ?? (p.hiz as number) ?? 50,
        power: (p.power as number) ?? (p.guc as number) ?? 50,
        vision: (p.vision as number) ?? (p.alg as number) ?? 50,
        control: (p.control as number) ?? (p.top as number) ?? 50,
        heading: (p.heading as number) ?? (p.kfa as number) ?? 50,
        goalkeeping: (p.goalkeeping as number) ?? (p.klc as number) ?? 10,
        
        scouting_stars: p.scouting_stars,
        scouting_count: p.scouting_count,
        preferred_foot: p.preferred_foot,
        injury: safeJsonParse(p.injury, null),
        // ADIM 1: Form rating ve sakatlık geçmişi
        form_rating: (p.form_rating as number) ?? (p.form as number) ?? 50,
        injury_history: safeJsonParse<unknown[]>(p.injury_history, []),
        // ADIM 2: Kart cezaları ve sakatlık
        suspended_until: p.suspended_until || null,
        is_injured: p.is_injured || false,
        injury_end_date: p.injury_end_date || null,
        traitLevels: safeJsonParse<Record<string, string>>(p.trait_levels, (extra as Record<string, unknown>).traitLevels as Record<string, string> || {}),
        styleLevels: safeJsonParse<Record<string, number>>(p.style_levels, (extra as Record<string, unknown>).styleLevels as Record<string, number> || {}),
        playStyle: p.play_style || (extra as Record<string, unknown>).playStyle,
        special_role: p.special_role || (extra as Record<string, unknown>).special_role,
        is_starter: p.is_starter || false,
        squad_no: p.squad_no,
        fitness: (p.cond as number) ?? (p as Record<string, unknown>).fitness ?? 100,
        // Detailed attributes
        finishing: (p.finishing as number) ?? (p.sut as number) ?? 50,
        dribbling: (p.dribbling as number) ?? (p.top as number) ?? 50,
        firstTouch: (p.first_touch as number) ?? (p.control as number) ?? 50,
        crossing: (p.crossing as number) ?? (p.pas as number) ?? 50,
        marking: (p.marking as number) ?? (p.tk as number) ?? 50,
        tackling: (p.tackling_detailed as number) ?? (p.tk as number) ?? 50,
        technique: (p.technique as number) ?? (p.control as number) ?? 50,
        longShots: (p.long_shots as number) ?? (p.sut as number) ?? 50,
        offTheBall: (p.off_the_ball as number) ?? (p.vision as number) ?? 50,
        acceleration: (p.acceleration as number) ?? (p.hiz as number) ?? 50,
        agility: (p.agility as number) ?? (p.hiz as number) ?? 50,
        balance: (p.balance as number) ?? (p.guc as number) ?? 50,
        jumping: (p.jumping as number) ?? (p.guc as number) ?? 50,
        leftFoot: (p.left_foot_detailed as number) ?? 50,
        rightFoot: (p.right_foot_detailed as number) ?? 50,
        workRate: (p.work_rate as number) ?? (p as Record<string, unknown>).workrate as number ?? 50,
        specificPosition: (p.specific_position as string) || (p as Record<string, unknown>).specificPosition as string || undefined,
        secondaryPositions: Array.isArray(p.secondary_positions) ? p.secondary_positions as string[] : undefined,
      };
    };

    if (teamName) {
       const { data } = await supabase.from('players').select('id,name,position,specific_position,secondary_positions,rating,potential,hidden_potential,age,height,weight,market_value,salary,nation,club,team_name,preferred_foot,defending,passing,shooting,speed,power,vision,control,stamina,heading,goalkeeping,finishing,dribbling,first_touch,crossing,marking,tackling_detailed,technique,long_shots,off_the_ball,aggression,bravery,work_rate,decisions,determination,concentration,leadership,anticipation,flair,positioning,composure,teamwork,agility,balance,strength,acceleration,jumping,left_foot_detailed,right_foot_detailed,cond,form,morale,confidence,chemistry,is_legend,form_rating,injury_history,traits,personality,scouting_stars,scouting_count,injury,suspended_until,is_injured,injury_end_date,injury_severity,play_style,trait_levels,style_levels,special_role,is_starter,squad_no,photo_url,profile_id,is_for_sale,sale_price,is_retiring,isResting,is_free_agent,contract_end_week,match_ratings,last_match_rating').ilike('team_name', teamName);
       if (data && data.length > 0) return data.map(mapPlayer);
    }
    
    if (userId) {
       const { data, error } = await supabase.from('players').select('id,name,position,specific_position,secondary_positions,rating,potential,hidden_potential,age,height,weight,market_value,salary,nation,club,team_name,preferred_foot,defending,passing,shooting,speed,power,vision,control,stamina,heading,goalkeeping,finishing,dribbling,first_touch,crossing,marking,tackling_detailed,technique,long_shots,off_the_ball,aggression,bravery,work_rate,decisions,determination,concentration,leadership,anticipation,flair,positioning,composure,teamwork,agility,balance,strength,acceleration,jumping,left_foot_detailed,right_foot_detailed,cond,form,morale,confidence,chemistry,is_legend,form_rating,injury_history,traits,personality,scouting_stars,scouting_count,injury,suspended_until,is_injured,injury_end_date,injury_severity,play_style,trait_levels,style_levels,special_role,is_starter,squad_no,photo_url,profile_id,is_for_sale,sale_price,is_retiring,isResting,is_free_agent,contract_end_week,match_ratings,last_match_rating').eq('profile_id', userId);
       if (!error && data && data.length > 0) {
         return data.map(mapPlayer);
       }
    }
    return [];
  }
  
  const local = localStorage.getItem(STORAGE_KEYS.SQUAD);
  return local ? JSON.parse(local) : [];
};

export const loadLeague = async () => {
  if (isSupabaseConfigured()) {
    const supabase = getSupabase();
    const { data } = await supabase.from('league_standings').select('id,team_id,season_id,league_id,played,won,drawn,lost,gf,ga,gd,points');
    return data || [];
  }
  
  const local = localStorage.getItem(STORAGE_KEYS.LEAGUE);
  return local ? JSON.parse(local) : [];
};

export const loadFixtures = async (teamId: string, seasonId?: string) => {
  if (isSupabaseConfigured()) {
    const supabase = getSupabase();
    let query = supabase
      .from('fixtures')
      .select('*, home:home_team_id(name), away:away_team_id(name)')
      .or(`home_team_id.eq.${teamId},away_team_id.eq.${teamId}`);

    // Sezon filtresi: belirtilmemişse aktif sezonu bul
    if (seasonId) {
      query = query.eq('season_id', seasonId);
    } else {
      // Takımın ligini bul, aktif sezonu al
      try {
        const { data: teamData } = await supabase
          .from('league_teams')
          .select('league_id')
          .eq('id', teamId)
          .maybeSingle();

        if (teamData?.league_id) {
          const { data: activeSeason } = await supabase
            .from('seasons')
            .select('id')
            .eq('league_id', teamData.league_id)
            .eq('is_finished', false)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          if (activeSeason) {
            query = query.eq('season_id', activeSeason.id);
          }
        }
      } catch {
        // Filtre uygulanamazsa tüm sezonların fikstürlerini getir
      }
    }

    const { data } = await query.order('tur', { ascending: true });

    if (data) return data;
  }
  return [];
};

export const loadActiveTactic = async (userId: string) => {
  if (isSupabaseConfigured()) {
    const supabase = getSupabase();
    const { data } = await supabase.from('active_tactics').select('id,tactic_data,updated_at').eq('id', userId).maybeSingle();
    return data || null;
  }
  const local = localStorage.getItem(STORAGE_KEYS.TACTIC);
  return local ? JSON.parse(local) : null;
};

export const loadTrainingState = async (userId: string) => {
  if (isSupabaseConfigured()) {
    const supabase = getSupabase();
    const { data } = await supabase.from('training_state').select('id,state,updated_at').eq('id', userId).maybeSingle();
    return data || null;
  }
  const local = localStorage.getItem(STORAGE_KEYS.TRAINING);
  return local ? JSON.parse(local) : null;
};

export const loadWatchlist = async (userId: string) => {
  if (isSupabaseConfigured()) {
    const supabase = getSupabase();
    const { data } = await supabase.from('watchlist').select('player_id').eq('user_id', userId);
    return data ? data.map((i: Record<string, unknown>) => i.player_id) : [];
  }
  const local = localStorage.getItem(STORAGE_KEYS.WATCHLIST);
  return local ? JSON.parse(local) : [];
};

export const saveProfile = async (profile: Record<string, unknown>) => {
  // localStorage yedekleme kaldırıldı (SORUN-14) — Supabase tek kaynak
  if (isSupabaseConfigured()) {
    const supabase = getSupabase();
    // TODO: Migrate to RPC (BUG-1) — No rpc_update_profile exists yet; direct upsert will fail once RLS is enforced
    await supabase.from('profiles').upsert(profile);
  }
};

export const savePlayers = async (players: Record<string, unknown>[], userId?: string, teamName?: string) => {
  // localStorage yedekleme kaldırıldı (SORUN-14) — Supabase tek kaynak
  if (isSupabaseConfigured() && userId) {
    // TODO: Migrate to RPC (BUG-1) — No rpc_upsert_players exists; batch upsert will fail once RLS is enforced
    const supabase = getSupabase();
    const playersToSave = players.map(p => {
      // Pack extra traits back into personality string
      const personalityObj = {
        traits: p.traits,
        negTraits: p.negTraits,
        personalityTraits: p.personalityTraits,
        traitLevels: p.traitLevels,
        styleLevels: p.styleLevels,
        archetype: p.archetype,
        special_role: p.special_role
      };

      return {
        id: p.id,
        name: p.name,
        position: p.position,
        rating: p.rating,
        speed: p.speed || 50,
        power: p.power || 50,
        passing: p.passing || 50,
        shooting: p.shooting || 50,
        defending: p.defending || 50,
        vision: p.vision || 50,
        control: p.control || 50,
        klt: p.rating,
        pas: p.passing || 50,
        sut: p.shooting || 50,
        tk: p.defending || 50,
        hiz: p.speed || 50,
        guc: p.power || 50,
        alg: p.vision || 50,
        top: p.control || 50,
        kfa: p.heading || (p as Record<string, unknown>).heading || 50,
        klc: p.goalkeeping || (p as Record<string, unknown>).goalkeeping || 10,
        potential: p.potential,
        hidden_potential: p.hidden_potential || p.potential,
        age: p.age,
        personality: JSON.stringify(personalityObj),
        form: p.form || 60,
        morale: p.morale || 60,
        confidence: p.confidence || 60,
        cond: p.cond || p.fitness || 100,
        play_style: p.playStyle,
        market_value: p.market_value,
        scouted: p.scouted || false,
        scouting_stars: p.scouting_stars || 0,
        scouting_count: p.scouting_count || 0,
        preferred_foot: p.preferred_foot || 'Right',
        is_legend: p.is_legend || false,
        is_starter: p.is_starter || false,
        squad_no: p.squad_no || null,
        injury: p.injury ? JSON.stringify(p.injury) : null,
        form_rating: p.form_rating ?? p.form ?? 50,
        injury_history: p.injury_history ? JSON.stringify(p.injury_history) : '[]',
        suspended_until: p.suspended_until || null,
        is_injured: p.is_injured || false,
        injury_end_date: p.injury_end_date || null,
        trait_levels: JSON.stringify(p.traitLevels || {}),
        style_levels: JSON.stringify(p.styleLevels || {}),
        profile_id: userId || null,
        team_name: teamName || p.team_name || p.club || 'Başakşehir',
        determination: p.determination ?? 50,
        concentration: p.concentration ?? 50,
        leadership: p.leadership ?? 50,
        anticipation: p.anticipation ?? 50,
        flair: p.flair ?? 50,
        positioning: p.positioning ?? 50,
        composure: p.composure ?? 50,
        teamwork: p.teamwork ?? 50,
        workrate: (p as Record<string, unknown>).workrate ?? p.workRate ?? 50,
        aggression: p.aggression ?? 50,
        bravery: p.bravery ?? 50,
        decisions: p.decisions ?? 50,
        // Technical
        finishing: p.finishing ?? p.shooting ?? 50,
        dribbling: p.dribbling ?? p.control ?? 50,
        first_touch: p.firstTouch ?? p.control ?? 50,
        crossing: p.crossing ?? p.passing ?? 50,
        marking: p.marking ?? p.defending ?? 50,
        tackling_detailed: p.tackling ?? p.defending ?? 50,
        technique: p.technique ?? p.control ?? 50,
        long_shots: p.longShots ?? p.shooting ?? 50,
        off_the_ball: p.offTheBall ?? p.vision ?? 50,
        // Mental
        work_rate: p.workRate ?? (p as Record<string, unknown>).workrate ?? 50,
        // Physical
        acceleration: p.acceleration ?? p.speed ?? 50,
        agility: p.agility ?? p.speed ?? 50,
        balance: p.balance ?? p.power ?? 50,
        jumping: p.jumping ?? p.power ?? 50,
        left_foot_detailed: p.leftFoot || 50,
        right_foot_detailed: p.rightFoot || 50,
        photo_url: p.photo_url,
        specific_position: p.specificPosition || (p as Record<string, unknown>).specific_position || null,
        secondary_positions: p.secondaryPositions && Array.isArray(p.secondaryPositions) && p.secondaryPositions.length > 0 ? p.secondaryPositions : null,
        // Arketip ve özellikler — top-level DB sütunlarına yaz (arama filtresi için gerekli)
        archetype: p.archetype || null,
        traits: p.traits ? (typeof p.traits === 'string' ? p.traits : JSON.stringify(p.traits)) : null,
        updated_at: new Date().toISOString()
      };
    });
    
    playersToSave.forEach(p => {
      delete (p as Record<string, unknown>).user_id;
    });

    await supabase.from('players').upsert(playersToSave);
  }
};

export const saveLeague = async (league: unknown[]) => {
  // localStorage yedekleme kaldırıldı (SORUN-14)
};

export const saveActiveTactic = async (userId: string, tactic: Record<string, unknown>) => {
  // localStorage yedekleme kaldırıldı (SORUN-14) — Supabase tek kaynak
  if (isSupabaseConfigured()) {
    const supabase = getSupabase();
    // TODO: Migrate to RPC (BUG-1) — rpc_update_tactics exists but expects specific JSONB keys;
    // the `tactic` param here may contain arbitrary keys (e.g. tactic_data) that the RPC doesn't handle.
    // Safe migration: extract known RPC fields and call rpcUpdateTactics() as primary path.
    await supabase.from('active_tactics').upsert({ id: userId, ...tactic });
  }
};

export const saveTrainingState = async (userId: string, state: Record<string, unknown>) => {
  // localStorage yedekleme kaldırıldı (SORUN-14) — Supabase tek kaynak
  if (isSupabaseConfigured()) {
    const supabase = getSupabase();
    // TODO: Migrate to RPC (BUG-1) — No rpc_update_training_state exists yet
    await supabase.from('training_state').upsert({ id: userId, ...state });
  }
};

export const saveWatchlist = async (userId: string, watchlist: string[]) => {
  // localStorage yedekleme kaldırıldı (SORUN-14) — Supabase tek kaynak
  if (isSupabaseConfigured() && userId) {
    try {
      const supabase = getSupabase();

      // TODO: Migrate to RPC (BUG-1) — No rpc_update_watchlist exists; delete+insert will fail once RLS is enforced

      // Önce mevcut kayıtları sil
      await supabase.from('watchlist').delete().eq('user_id', userId);

      // Sonra yeni listeyi ekle
      if (watchlist.length > 0) {
        const rows = watchlist.map(playerId => ({
          user_id: userId,
          player_id: playerId,
        }));
        // TODO: Migrate to RPC (BUG-1) — watchlist insert will fail once RLS is enforced
        const { error } = await supabase.from('watchlist').insert(rows);
        if (error) {
          console.error('[saveWatchlist] Supabase insert error:', error.message);
        }
      }
    } catch (err) {
      console.error('[saveWatchlist] Supabase sync error:', err);
    }
  }
};

/**
 * İzleme listesinden tek bir oyuncuyu kaldırır.
 * Hem localStorage hem Supabase'den siler.
 */
export const removeFromWatchlist = async (userId: string, playerId: string, currentWatchlist: string[]): Promise<string[]> => {
  const newWatchlist = currentWatchlist.filter(id => id !== playerId);

  // Supabase'den sil
  if (isSupabaseConfigured() && userId) {
    try {
      const supabase = getSupabase();
      // TODO: Migrate to RPC (BUG-1) — watchlist delete will fail once RLS is enforced
      const { error } = await supabase
        .from('watchlist')
        .delete()
        .eq('user_id', userId)
        .eq('player_id', playerId);
      if (error) {
        console.error('[removeFromWatchlist] Supabase delete error:', error.message);
      }
    } catch (err) {
      console.error('[removeFromWatchlist] Supabase error:', err);
    }
  }

  return newWatchlist;
};

export const saveMatchResult = async (userId: string, result: Record<string, unknown>, homeTeamName: string, awayTeamName: string) => {
  const matchInfo = {
    result,
    homeTeamName,
    awayTeamName,
    timestamp: new Date().toISOString()
  };
  localStorage.setItem(STORAGE_KEYS.LAST_MATCH, JSON.stringify(matchInfo));
  
  if (isSupabaseConfigured() && userId) {
    const supabase = getSupabase();
    const score = result.score as Record<string, number>;
    // TODO: Migrate to RPC (BUG-1) — match_history insert may fail once RLS is enforced
    await supabase.from('match_history').insert({
      user_id: userId,
      home_team: homeTeamName,
      away_team: awayTeamName,
      score: `${score.home}-${score.away}`,
      match_data: JSON.stringify(result)
    });
  }
};

export const loadMatchHistory = async (userId: string) => {
  if (isSupabaseConfigured()) {
    const supabase = getSupabase();
    const { data } = await supabase.from('match_history').select('id,user_id,home_team,away_team,score,match_data,created_at').eq('user_id', userId).order('created_at', { ascending: false });
    return data || [];
  }
  const local = localStorage.getItem('fm_match_history');
  return local ? JSON.parse(local) : [];
};

export const loadLastMatchResult = async () => {
  const local = localStorage.getItem(STORAGE_KEYS.LAST_MATCH);
  return local ? JSON.parse(local) : null;
};

export type ConnectionStatus = 'checking' | 'connected' | 'not_configured' | 'error';
export const checkConnectionHealth = async (): Promise<{ status: ConnectionStatus; latency?: number }> => {
  if (!isSupabaseConfigured()) return { status: 'not_configured' };
  try {
    const start = Date.now();
    const supabase = getSupabase();
    const { error } = await supabase.from('profiles').select('count', { count: 'exact', head: true }).limit(1);
    if (error) throw error;
    return { status: 'connected', latency: Date.now() - start };
  } catch {
    return { status: 'error' };
  }
};

export const resetLeague = async () => {
  const savedUserId = localStorage.getItem('fm_user_id');
  
  // Clear all localStorage data
  Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
  localStorage.removeItem('fm_fixtures');
  localStorage.removeItem('fm_user_id');
  localStorage.removeItem('fm_auth_email');
  localStorage.removeItem('fm_match_history');
  localStorage.removeItem('fm_last_processed_day');

  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabase();
      
      if (savedUserId) {
        const { data: profile } = await supabase.from('profiles').select('team_name, league_name').eq('id', savedUserId).maybeSingle();
        
        if (profile) {
          // TODO: Migrate to RPC (BUG-1) — player delete will fail once RLS is enforced
      await supabase.from('players').delete().eq('profile_id', savedUserId);
          
          if (profile.team_name) {
            await supabase.from('league_teams').update({
              is_npc: true,
              profile_id: null,
              strength: 45 + Math.floor(Math.random() * 10),
              color: null
            }).eq('name', profile.team_name);
          }
        }
        
        // TODO: Migrate to RPC (BUG-1) — all these deletes will fail once RLS is enforced
        await supabase.from('profiles').delete().eq('id', savedUserId);
        await supabase.from('active_tactics').delete().eq('id', savedUserId);
        await supabase.from('training_state').delete().eq('id', savedUserId);
        await supabase.from('watchlist').delete().eq('user_id', savedUserId);
        await supabase.from('match_history').delete().eq('user_id', savedUserId);
        await supabase.from('youth_players').delete().eq('profile_id', savedUserId);
        await supabase.from('youth_facilities').delete().eq('profile_id', savedUserId);
      }
    } catch (err) {
      console.error('Supabase reset error:', err);
    }
  }

  return { success: true };
};

export const getMatchPreparations = async (id: string) => {
  if (!isSupabaseConfigured()) return [];
  try {
    const supabase = getSupabase();

    const { data: tsData, error: tsError } = await supabase
      .from('training_state')
      .select('state')
      .eq('id', id)
      .maybeSingle();

    if (tsError || !tsData?.state) return [];

    const state = safeJsonParse<Record<string, unknown>>(tsData.state, {});
    const activeOps = (state.activeOperations || []) as Record<string, unknown>[];
    return activeOps
      .filter((op) => op.status === 'pending')
      .map((op) => op.operationId || op.operation_id);
  } catch {
    return [];
  }
};

// ═══════════════════════════════════════════════════════════════════════
// ADIM 3: Youth Academy — Genç Oyuncu ve Tesis Persistence
// ═══════════════════════════════════════════════════════════════════════

/**
 * Genç oyuncuları Supabase'den veya localStorage'dan yükler.
 * Supabase'den gelen veriyi YouthPlayer formatına map eder.
 * Mapping için sharedUtils.mapYouthPlayerFromRow kullanır.
 */
export const loadYouthPlayers = async (userId: string): Promise<Record<string, unknown>[]> => {
  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from('youth_players')
        .select('id,profile_id,name,age,position,specific_position,rating,potential,hidden_potential,academy_level,category,is_wonderkid,development_curve,join_date,weekly_training_hours,total_training_weeks,stats_gained_this_season,personality_traits,traits,trait_levels,scout_report,injured,injury_weeks_remaining,cond,form,morale,confidence,stats,updated_at')
        .eq('profile_id', userId);

      if (error) {
        console.error('[loadYouthPlayers] Supabase error:', error.message);
      } else if (data && data.length > 0) {
        return data.map((row: Record<string, unknown>) => mapYouthPlayerFromRow(row));
      }
    } catch (err) {
      console.error('[loadYouthPlayers] Exception:', err);
    }
  }

  const local = localStorage.getItem(STORAGE_KEYS.YOUTH_PLAYERS);
  return local ? JSON.parse(local) : [];
};

/**
 * Genç oyuncuları Supabase'e ve localStorage'a kaydeder.
 * Batch upsert kullanır. Stats oluşturma için sharedUtils.buildStatsObject kullanır.
 */
export const saveYouthPlayers = async (players: Record<string, unknown>[], userId: string): Promise<void> => {
  // localStorage yedekleme kaldırıldı (SORUN-14) — Supabase tek kaynak
  if (isSupabaseConfigured() && userId) {
    try {
      const supabase = getSupabase();

      const rows = players.map(p => {
        const stats = buildStatsObject(p);

        return {
          id: p.id,
          profile_id: userId,
          name: p.name,
          age: p.age,
          position: p.position,
          specific_position: p.specificPosition,
          rating: p.rating,
          potential: p.potential,
          hidden_potential: p.hidden_potential,
          academy_level: p.academyLevel,
          category: p.category,
          is_wonderkid: p.isWonderkid ?? false,
          development_curve: p.developmentCurve ?? 'normal',
          join_date: p.joinDate,
          weekly_training_hours: p.weeklyTrainingHours ?? 15,
          total_training_weeks: p.totalTrainingWeeks ?? 0,
          stats_gained_this_season: JSON.stringify(p.statsGainedThisSeason ?? {}),
          personality_traits: JSON.stringify(p.personalityTraits ?? []),
          traits: JSON.stringify(p.traits ?? []),
          trait_levels: JSON.stringify(p.traitLevels ?? {}),
          scout_report: p.scoutReport ? JSON.stringify(p.scoutReport) : null,
          injured: p.injured ?? false,
          injury_weeks_remaining: p.injuryWeeksRemaining ?? 0,
          cond: p.cond ?? 85,
          form: p.form ?? 60,
          morale: p.morale ?? 70,
          confidence: p.confidence ?? 60,
          stats: JSON.stringify(stats),
          updated_at: new Date().toISOString(),
        };
      });

      // TODO: Migrate to RPC (BUG-1) — youth_players delete+insert will fail once RLS is enforced
      await supabase.from('youth_players').delete().eq('profile_id', userId);
      if (rows.length > 0) {
        const { error } = await supabase.from('youth_players').insert(rows);
        if (error) {
          console.error('[saveYouthPlayers] Insert error:', error.message);
        }
      }
    } catch (err) {
      console.error('[saveYouthPlayers] Exception:', err);
    }
  }
};

/**
 * Tesis seviyelerini Supabase'den veya localStorage'dan yükler.
 */
export const loadYouthFacilities = async (userId: string): Promise<Record<string, number>> => {
  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from('youth_facilities')
        .select('facility_levels')
        .eq('profile_id', userId)
        .maybeSingle();

      if (!error && data?.facility_levels) {
        return safeJsonParse<Record<string, number>>(data.facility_levels, {});
      }
    } catch (err) {
      console.error('[loadYouthFacilities] Exception:', err);
    }
  }

  const local = localStorage.getItem(STORAGE_KEYS.YOUTH_FACILITIES);
  return local ? JSON.parse(local) : {};
};

/**
 * Tesis seviyelerini Supabase'e ve localStorage'a kaydeder.
 */
/**
 * Kredi bakiyesini Supabase'e ve localStorage'a kaydeder.
 */
export const saveCredits = async (credits: number, userId: string): Promise<void> => {
  if (isSupabaseConfigured() && userId) {
    try {
      const supabase = getSupabase();
      // TODO: Migrate to RPC (BUG-1) — profiles.update will fail once RLS is enforced
      const { error } = await supabase
        .from('profiles')
        .update({ credits })
        .eq('id', userId);

      if (error) {
        console.error('[saveCredits] Update error:', error.message);
      }
    } catch (err) {
      console.error('[saveCredits] Exception:', err);
    }
  }
};

export const saveYouthFacilities = async (facilityLevels: Record<string, number>, userId: string): Promise<void> => {
  // localStorage yedekleme kaldırıldı (SORUN-14) — Supabase tek kaynak
  if (isSupabaseConfigured() && userId) {
    try {
      const supabase = getSupabase();
      // TODO: Migrate to RPC (BUG-1) — youth_facilities upsert will fail once RLS is enforced
      const { error } = await supabase.from('youth_facilities').upsert({
        profile_id: userId,
        facility_levels: JSON.stringify(facilityLevels),
        updated_at: new Date().toISOString(),
      }, { onConflict: 'profile_id' });

      if (error) {
        console.error('[saveYouthFacilities] Upsert error:', error.message);
      }
    } catch (err) {
      console.error('[saveYouthFacilities] Exception:', err);
    }
  }
};
