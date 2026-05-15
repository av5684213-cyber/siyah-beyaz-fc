import { getSupabase, isSupabaseConfigured } from '../supabase';

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
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
    return data || null;
  }
  
  const local = localStorage.getItem(STORAGE_KEYS.PROFILE);
  return local ? JSON.parse(local) : null;
};

export const loadPlayers = async (userId: string, teamName?: string) => {
  if (isSupabaseConfigured()) {
    const supabase = getSupabase();
    
    const mapPlayer = (p: any) => {
      let extra = {};
      if (p.personality) {
        try { extra = typeof p.personality === 'string' ? JSON.parse(p.personality) : p.personality; } catch (e) {}
      }
      
      return {
        ...p,
        ...extra,
        rating: p.rating ?? p.klt ?? 60,
        potential: p.potential ?? p.klt ?? p.rating ?? 70,
        passing: p.passing ?? p.pas ?? 50,
        shooting: p.shooting ?? p.sut ?? 50,
        defending: p.defending ?? p.tk ?? 50,
        speed: p.speed ?? p.hiz ?? 50,
        power: p.power ?? p.guc ?? 50,
        vision: p.vision ?? p.alg ?? 50,
        control: p.control ?? p.top ?? 50,
        heading: p.heading ?? p.kfa ?? 50,
        goalkeeping: p.goalkeeping ?? p.klc ?? 10,
        
        scouting_stars: p.scouting_stars,
        scouting_count: p.scouting_count,
        preferred_foot: p.preferred_foot,
        injury: p.injury ? (typeof p.injury === 'string' ? JSON.parse(p.injury) : p.injury) : null,
        // ADIM 1: Form rating ve sakatlık geçmişi
        form_rating: p.form_rating ?? p.form ?? 50,
        injury_history: p.injury_history ? (typeof p.injury_history === 'string' ? JSON.parse(p.injury_history) : p.injury_history) : [],
        // ADIM 2: Kart cezaları ve sakatlık
        suspended_until: p.suspended_until || null,
        is_injured: p.is_injured || false,
        injury_end_date: p.injury_end_date || null,
        traitLevels: p.trait_levels ? (typeof p.trait_levels === 'string' ? JSON.parse(p.trait_levels) : p.trait_levels) : (extra as any).traitLevels || {},
        styleLevels: p.style_levels ? (typeof p.style_levels === 'string' ? JSON.parse(p.style_levels) : p.style_levels) : (extra as any).styleLevels || {},
        playStyle: p.play_style || (extra as any).playStyle,
        special_role: p.special_role || (extra as any).special_role,
        is_starter: p.is_starter || false,
        squad_no: p.squad_no,
        fitness: p.cond ?? (p as any).fitness ?? 100,
        // Detailed attributes
        finishing: p.finishing ?? p.sut ?? 50,
        dribbling: p.dribbling ?? p.top ?? 50,
        firstTouch: p.first_touch ?? p.control ?? 50,
        crossing: p.crossing ?? p.pas ?? 50,
        marking: p.marking ?? p.tk ?? 50,
        tackling: p.tackling_detailed ?? p.tk ?? 50,
        technique: p.technique ?? p.control ?? 50,
        longShots: p.long_shots ?? p.sut ?? 50,
        offTheBall: p.off_the_ball ?? p.vision ?? 50,
        acceleration: p.acceleration ?? p.hiz ?? 50,
        agility: p.agility ?? p.hiz ?? 50,
        balance: p.balance ?? p.guc ?? 50,
        jumping: p.jumping ?? p.guc ?? 50,
        leftFoot: p.left_foot_detailed ?? 50,
        rightFoot: p.right_foot_detailed ?? 50,
        workRate: p.work_rate ?? p.workrate ?? 50,
      };
    };

    if (teamName) {
       const { data } = await supabase.from('players').select('*').ilike('team_name', teamName);
       if (data && data.length > 0) return data.map(mapPlayer);
    }
    
    if (userId) {
       const { data, error } = await supabase.from('players').select('*').eq('profile_id', userId);
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
    const { data } = await supabase.from('league_standings').select('*');
    return data || [];
  }
  
  const local = localStorage.getItem(STORAGE_KEYS.LEAGUE);
  return local ? JSON.parse(local) : [];
};

export const loadFixtures = async (teamId: string) => {
  if (isSupabaseConfigured()) {
    const supabase = getSupabase();
    // Fetch fixtures for the user's team or all fixtures in the league
    // For now, let's fetch user team's fixtures
    const { data } = await supabase
      .from('fixtures')
      .select('*, home:home_team_id(name), away:away_team_id(name)')
      .or(`home_team_id.eq.${teamId},away_team_id.eq.${teamId}`)
      .order('tur', { ascending: true });
    
    if (data) return data;
  }
  return [];
};

export const loadActiveTactic = async (userId: string) => {
  if (isSupabaseConfigured()) {
    const supabase = getSupabase();
    const { data } = await supabase.from('active_tactics').select('*').eq('id', userId).single();
    return data || null;
  }
  const local = localStorage.getItem(STORAGE_KEYS.TACTIC);
  return local ? JSON.parse(local) : null;
};

export const loadTrainingState = async (userId: string) => {
  if (isSupabaseConfigured()) {
    const supabase = getSupabase();
    const { data } = await supabase.from('training_state').select('*').eq('id', userId).single();
    return data || null;
  }
  const local = localStorage.getItem(STORAGE_KEYS.TRAINING);
  return local ? JSON.parse(local) : null;
};

export const loadWatchlist = async (userId: string) => {
  if (isSupabaseConfigured()) {
    const supabase = getSupabase();
    const { data } = await supabase.from('watchlist').select('player_id').eq('user_id', userId);
    return data ? data.map((i: any) => i.player_id) : [];
  }
  const local = localStorage.getItem(STORAGE_KEYS.WATCHLIST);
  return local ? JSON.parse(local) : [];
};

export const saveProfile = async (profile: any) => {
  localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  if (isSupabaseConfigured()) {
    const supabase = getSupabase();
    await supabase.from('profiles').upsert(profile);
  }
};

export const savePlayers = async (players: any[], userId?: string, teamName?: string) => {
  localStorage.setItem(STORAGE_KEYS.SQUAD, JSON.stringify(players));
  if (isSupabaseConfigured() && userId) {
    const supabase = getSupabase();
    // Prepare for batch upsert
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

      const isUUID = userId.length === 36 && userId.includes('-');
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
        kfa: p.heading || (p as any).heading || 50,
        klc: p.goalkeeping || (p as any).goalkeeping || 10,
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
        // ADIM 1: Form rating ve sakatlık geçmişi
        form_rating: p.form_rating ?? p.form ?? 50,
        injury_history: p.injury_history ? JSON.stringify(p.injury_history) : '[]',
        // ADIM 2: Kart cezaları ve sakatlık
        suspended_until: p.suspended_until || null,
        is_injured: p.is_injured || false,
        injury_end_date: p.injury_end_date || null,
        trait_levels: JSON.stringify(p.traitLevels || {}),
        style_levels: JSON.stringify(p.styleLevels || {}),
        profile_id: userId || null,
        team_name: teamName || p.team_name || p.club || 'Başakşehir',
        determination: p.determination || 50,
        concentration: p.concentration || 50,
        leadership: p.leadership || 50,
        anticipation: p.anticipation || 50,
        flair: p.flair || 50,
        positioning: p.positioning || 50,
        composure: p.composure || 50,
        teamwork: p.teamwork || 50,
        workrate: p.workrate || 50,
        aggression: p.aggression || 50,
        bravery: p.bravery || 50,
        decisions: p.decisions || 50,
        // Technical
        finishing: p.finishing || p.shooting || 50,
        dribbling: p.dribbling || p.control || 50,
        first_touch: p.firstTouch || p.control || 50,
        crossing: p.crossing || p.passing || 50,
        marking: p.marking || p.defending || 50,
        tackling_detailed: p.tackling || p.defending || 50,
        technique: p.technique || p.control || 50,
        long_shots: p.longShots || p.shooting || 50,
        off_the_ball: p.offTheBall || p.vision || 50,
        // Mental
        work_rate: p.workRate || p.workrate || 50,
        // Physical
        acceleration: p.acceleration || p.speed || 50,
        agility: p.agility || p.speed || 50,
        balance: p.balance || p.power || 50,
        jumping: p.jumping || p.power || 50,
        left_foot_detailed: p.leftFoot || 50,
        right_foot_detailed: p.rightFoot || 50,
        photo_url: p.photo_url,
        updated_at: new Date().toISOString()
      };
    });
    
    // Remove user_id as it doesn't exist in the schema
    playersToSave.forEach(p => {
      delete p.user_id;
    });

    await supabase.from('players').upsert(playersToSave);
  }
};

export const saveLeague = async (league: any) => {
  localStorage.setItem(STORAGE_KEYS.LEAGUE, JSON.stringify(league));
};

export const saveActiveTactic = async (userId: string, tactic: any) => {
  localStorage.setItem(STORAGE_KEYS.TACTIC, JSON.stringify(tactic));
  if (isSupabaseConfigured()) {
    const supabase = getSupabase();
    await supabase.from('active_tactics').upsert({ id: userId, ...tactic });
  }
};

export const saveTrainingState = async (userId: string, state: any) => {
  localStorage.setItem(STORAGE_KEYS.TRAINING, JSON.stringify(state));
  if (isSupabaseConfigured()) {
    const supabase = getSupabase();
    await supabase.from('training_state').upsert({ id: userId, ...state });
  }
};

export const saveWatchlist = async (userId: string, watchlist: string[]) => {
  localStorage.setItem(STORAGE_KEYS.WATCHLIST, JSON.stringify(watchlist));
  // Supabase sync is handled in toggleWatchlist for more atomic control, 
  // but we can ensure it here too if needed.
};

export const saveMatchResult = async (userId: string, result: any, homeTeamName: string, awayTeamName: string) => {
  const matchInfo = {
    result,
    homeTeamName,
    awayTeamName,
    timestamp: new Date().toISOString()
  };
  localStorage.setItem(STORAGE_KEYS.LAST_MATCH, JSON.stringify(matchInfo));
  
  if (isSupabaseConfigured() && userId) {
    const supabase = getSupabase();
    await supabase.from('match_history').insert({
      user_id: userId,
      home_team: homeTeamName,
      away_team: awayTeamName,
      score: `${result.score.home}-${result.score.away}`,
      match_data: JSON.stringify(result)
    });
  }
};

export const loadMatchHistory = async (userId: string) => {
  if (isSupabaseConfigured()) {
    const supabase = getSupabase();
    const { data } = await supabase.from('match_history').select('*').eq('user_id', userId).order('created_at', { ascending: false });
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
  } catch (e) {
    return { status: 'error' };
  }
};

export const resetLeague = async () => {
  // SAVE userId BEFORE clearing localStorage (needed for Supabase cleanup)
  const savedUserId = localStorage.getItem('fm_user_id');
  
  // Clear all localStorage data
  localStorage.removeItem(STORAGE_KEYS.LEAGUE);
  localStorage.removeItem(STORAGE_KEYS.SQUAD);
  localStorage.removeItem(STORAGE_KEYS.PROFILE);
  localStorage.removeItem(STORAGE_KEYS.TACTIC);
  localStorage.removeItem(STORAGE_KEYS.TRAINING);
  localStorage.removeItem(STORAGE_KEYS.WATCHLIST);
  localStorage.removeItem(STORAGE_KEYS.LAST_MATCH);
  localStorage.removeItem('fm_fixtures');
  localStorage.removeItem('fm_user_id');
  localStorage.removeItem('fm_auth_email');
  localStorage.removeItem('fm_match_history');
  localStorage.removeItem('fm_last_processed_day');
  localStorage.removeItem(STORAGE_KEYS.YOUTH_PLAYERS);
  localStorage.removeItem(STORAGE_KEYS.YOUTH_FACILITIES);

  // Also clear Supabase data if configured
  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabase();
      
      if (savedUserId) {
        // Get team_name from profile before deleting
        const { data: profile } = await supabase.from('profiles').select('team_name, league_name').eq('id', savedUserId).single();
        
        if (profile) {
          // Delete players for this user
          await supabase.from('players').delete().eq('profile_id', savedUserId);
          
          // Restore the league_teams entry back to NPC
          if (profile.team_name) {
            await supabase.from('league_teams').update({
              is_npc: true,
              profile_id: null,
              strength: 45 + Math.floor(Math.random() * 10),
              color: null
            }).eq('name', profile.team_name);
          }
        }
        
        // Delete profile
        await supabase.from('profiles').delete().eq('id', savedUserId);
        
        // Delete related data
        await supabase.from('active_tactics').delete().eq('id', savedUserId);
        await supabase.from('training_state').delete().eq('id', savedUserId);
        await supabase.from('watchlist').delete().eq('user_id', savedUserId);
        await supabase.from('match_history').delete().eq('user_id', savedUserId);
        // ADIM 3: Youth Academy verilerini de temizle
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

    // Read from training_state table (match_preparations table was never created)
    const { data: tsData, error: tsError } = await supabase
      .from('training_state')
      .select('state')
      .eq('id', id)
      .single();

    if (tsError || !tsData?.state) return [];

    const state = typeof tsData.state === 'string' ? JSON.parse(tsData.state) : tsData.state;
    const activeOps = state?.activeOperations || [];
    return activeOps
      .filter((op: any) => op.status === 'pending')
      .map((op: any) => op.operationId || op.operation_id);
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
 */
export const loadYouthPlayers = async (userId: string): Promise<any[]> => {
  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from('youth_players')
        .select('*')
        .eq('profile_id', userId);

      if (error) {
        console.error('[loadYouthPlayers] Supabase error:', error.message);
        // Fallback to localStorage
      } else if (data && data.length > 0) {
        return data.map(mapYouthPlayerFromRow);
      }
    } catch (err) {
      console.error('[loadYouthPlayers] Exception:', err);
    }
  }

  // localStorage fallback
  const local = localStorage.getItem(STORAGE_KEYS.YOUTH_PLAYERS);
  return local ? JSON.parse(local) : [];
};

/**
 * Supabase youth_players satırını YouthPlayer objesine dönüştürür.
 */
function mapYouthPlayerFromRow(row: any): any {
  const stats = row.stats ? (typeof row.stats === 'string' ? JSON.parse(row.stats) : row.stats) : {};
  const personalityTraits = row.personality_traits
    ? (typeof row.personality_traits === 'string' ? JSON.parse(row.personality_traits) : row.personality_traits)
    : [];
  const traits = row.traits
    ? (typeof row.traits === 'string' ? JSON.parse(row.traits) : row.traits)
    : [];
  const traitLevels = row.trait_levels
    ? (typeof row.trait_levels === 'string' ? JSON.parse(row.trait_levels) : row.trait_levels)
    : {};
  const scoutReport = row.scout_report
    ? (typeof row.scout_report === 'string' ? JSON.parse(row.scout_report) : row.scout_report)
    : null;
  const statsGained = row.stats_gained_this_season
    ? (typeof row.stats_gained_this_season === 'string' ? JSON.parse(row.stats_gained_this_season) : row.stats_gained_this_season)
    : {};

  return {
    id: row.id,
    name: row.name,
    age: row.age,
    position: row.position,
    specificPosition: row.specific_position,
    rating: row.rating,
    potential: row.potential,
    hidden_potential: row.hidden_potential,
    academyLevel: row.academy_level,
    joinDate: row.join_date,
    weeklyTrainingHours: row.weekly_training_hours,
    totalTrainingWeeks: row.total_training_weeks,
    developmentCurve: row.development_curve,
    isWonderkid: row.is_wonderkid,
    category: row.category,
    scoutReport,
    personalityTraits,
    traits,
    traitLevels: Object.keys(traitLevels).length > 0 ? traitLevels : undefined,
    // Primary stats from stats JSONB
    speed: stats.speed ?? 50,
    passing: stats.passing ?? 50,
    shooting: stats.shooting ?? 50,
    defending: stats.defending ?? 50,
    power: stats.power ?? 50,
    goalkeeping: stats.goalkeeping ?? 15,
    // Technical
    finishing: stats.finishing ?? 50,
    dribbling: stats.dribbling ?? 50,
    firstTouch: stats.firstTouch ?? 50,
    crossing: stats.crossing ?? 50,
    marking: stats.marking ?? 50,
    tackling: stats.tackling ?? 50,
    technique: stats.technique ?? 50,
    longShots: stats.longShots ?? 50,
    offTheBall: stats.offTheBall ?? 50,
    heading: stats.heading ?? 50,
    // Mental
    aggression: stats.aggression ?? 50,
    bravery: stats.bravery ?? 50,
    workRate: stats.workRate ?? 50,
    decisions: stats.decisions ?? 50,
    determination: stats.determination ?? 50,
    concentration: stats.concentration ?? 50,
    leadership: stats.leadership ?? 30,
    anticipation: stats.anticipation ?? 50,
    flair: stats.flair ?? 20,
    positioning: stats.positioning ?? 50,
    composure: stats.composure ?? 50,
    teamwork: stats.teamwork ?? 50,
    vision: stats.vision ?? 50,
    // Physical
    agility: stats.agility ?? 50,
    balance: stats.balance ?? 50,
    strength: stats.strength ?? 50,
    acceleration: stats.acceleration ?? stats.speed ?? 50,
    jumping: stats.jumping ?? 50,
    stamina: stats.stamina ?? 60,
    control: stats.control ?? 50,
    // Condition
    cond: row.cond ?? 85,
    form: row.form ?? 60,
    morale: row.morale ?? 70,
    confidence: row.confidence ?? 60,
    // Injury
    injured: row.injured ?? false,
    injuryWeeksRemaining: row.injury_weeks_remaining ?? 0,
    // Stats gained
    statsGainedThisSeason: statsGained,
  };
}

/**
 * Genç oyuncuları Supabase'e ve localStorage'a kaydeder.
 * Batch upsert kullanır.
 */
export const saveYouthPlayers = async (players: any[], userId: string): Promise<void> => {
  // Her zaman localStorage'a kaydet
  localStorage.setItem(STORAGE_KEYS.YOUTH_PLAYERS, JSON.stringify(players));

  if (isSupabaseConfigured() && userId) {
    try {
      const supabase = getSupabase();

      const rows = players.map(p => {
        // Tüm stat'leri tek bir JSONB'de topla
        const stats: Record<string, number> = {
          speed: p.speed ?? 50,
          passing: p.passing ?? 50,
          shooting: p.shooting ?? 50,
          defending: p.defending ?? 50,
          power: p.power ?? 50,
          goalkeeping: p.goalkeeping ?? 15,
          finishing: p.finishing ?? 50,
          dribbling: p.dribbling ?? 50,
          firstTouch: p.firstTouch ?? 50,
          crossing: p.crossing ?? 50,
          marking: p.marking ?? 50,
          tackling: p.tackling ?? 50,
          technique: p.technique ?? 50,
          longShots: p.longShots ?? 50,
          offTheBall: p.offTheBall ?? 50,
          heading: p.heading ?? 50,
          aggression: p.aggression ?? 50,
          bravery: p.bravery ?? 50,
          workRate: p.workRate ?? 50,
          decisions: p.decisions ?? 50,
          determination: p.determination ?? 50,
          concentration: p.concentration ?? 50,
          leadership: p.leadership ?? 30,
          anticipation: p.anticipation ?? 50,
          flair: p.flair ?? 20,
          positioning: p.positioning ?? 50,
          composure: p.composure ?? 50,
          teamwork: p.teamwork ?? 50,
          vision: p.vision ?? 50,
          agility: p.agility ?? 50,
          balance: p.balance ?? 50,
          strength: p.strength ?? 50,
          acceleration: p.acceleration ?? p.speed ?? 50,
          jumping: p.jumping ?? 50,
          stamina: p.stamina ?? 60,
          control: p.control ?? 50,
        };

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

      // Önce eski oyuncuları sil, sonra yeni listeyi insert et
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
 * Dönüş: { training_pitch: 2, gym: 3, ... } şeklinde Record<string, number>
 */
export const loadYouthFacilities = async (userId: string): Promise<Record<string, number>> => {
  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from('youth_facilities')
        .select('facility_levels')
        .eq('profile_id', userId)
        .single();

      if (!error && data?.facility_levels) {
        const levels = typeof data.facility_levels === 'string'
          ? JSON.parse(data.facility_levels)
          : data.facility_levels;
        return levels as Record<string, number>;
      }
    } catch (err) {
      console.error('[loadYouthFacilities] Exception:', err);
    }
  }

  // localStorage fallback
  const local = localStorage.getItem(STORAGE_KEYS.YOUTH_FACILITIES);
  return local ? JSON.parse(local) : {};
};

/**
 * Tesis seviyelerini Supabase'e ve localStorage'a kaydeder.
 */
export const saveYouthFacilities = async (facilityLevels: Record<string, number>, userId: string): Promise<void> => {
  // Her zaman localStorage'a kaydet
  localStorage.setItem(STORAGE_KEYS.YOUTH_FACILITIES, JSON.stringify(facilityLevels));

  if (isSupabaseConfigured() && userId) {
    try {
      const supabase = getSupabase();
      const { error } = await supabase.from('youth_facilities').upsert({
        profile_id: userId,
        facility_levels: JSON.stringify(facilityLevels),
        updated_at: new Date().toISOString(),
      });

      if (error) {
        console.error('[saveYouthFacilities] Upsert error:', error.message);
      }
    } catch (err) {
      console.error('[saveYouthFacilities] Exception:', err);
    }
  }
};
