'use client';
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { runTrainingSession } from './trainingEngine';
import { getDefaultGameTactics, getDefaultTrainingState, Player, Profile, ActiveTactic, TrainingState, MatchState } from './types';
import { 
  loadProfile, loadPlayers, loadActiveTactic, loadTrainingState, loadWatchlist,
  saveProfile, savePlayers, saveActiveTactic, saveTrainingState, saveWatchlist
} from './persistence';
import { simulateHistory } from './historySimulator';
import { isSupabaseConfigured, getSupabase } from '@/lib/supabase';
import { getBrowserLocale, Locale } from './i18n';
import { generateLocalizedPlayer, getRegionConfig } from './region-generator';
import { getTeamNamesForDepartment } from './constants';

interface FMContextValue {
  userId: string | null;
  setUserId: React.Dispatch<React.SetStateAction<string | null>>;
  authEmail: string | null;
  setAuthEmail: React.Dispatch<React.SetStateAction<string | null>>;
  isAdmin: boolean;
  profile: Profile | null;
  setProfile: (data: Profile | null | ((prev: Profile | null) => Profile | null)) => void;
  squad: Player[];
  setSquad: React.Dispatch<React.SetStateAction<Player[]>>;
  activeTactic: ActiveTactic;
  setActiveTactic: React.Dispatch<React.SetStateAction<ActiveTactic>>;
  trainingState: TrainingState;
  setTrainingState: React.Dispatch<React.SetStateAction<TrainingState>>;
  league: Player[];
  setLeague: React.Dispatch<React.SetStateAction<Player[]>>;
  selectedTeamProfile: string | null;
  setSelectedTeamProfile: React.Dispatch<React.SetStateAction<string | null>>;
  directMessageRecipient: any | null;
  setDirectMessageRecipient: React.Dispatch<React.SetStateAction<any | null>>;
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  refreshData: (id?: string) => Promise<void>;
  locale: Locale;
  setLocale: React.Dispatch<React.SetStateAction<Locale>>;
  sellPlayer: (player: Player) => Promise<{ success: boolean; netRevenue: number; taxAmount: number } | void>;
  scoutPlayer: (playerId: string, playerObj?: Player) => Promise<{ success: boolean; reason?: string; player?: Player } | { success: boolean; player: Player }>;
  playFriendlyMatch: (isPaid?: boolean) => Promise<{ success: boolean; reason?: string; homeScore?: number; awayScore?: number; results?: any }>;
  watchlist: string[];
  toggleWatchlist: (player: Player) => Promise<void>;
  negotiatePurchase: (player: Player, offerPrice: number) => Promise<{ success: boolean; reason?: string; totalCost?: number; agentCommission?: number; signingBonus?: number; counterOffer?: number }>;
  addSponsor: (sponsor: any) => Promise<void>;
  initTeam: (teamNameInput: string, managerName: string, philosophy: string, color1: string, color2: string) => Promise<void>;
  matchState: MatchState;
  setMatchState: React.Dispatch<React.SetStateAction<MatchState>>;
  activeTab: string;
  setActiveTab: React.Dispatch<React.SetStateAction<string>>;
}

const FMContext = createContext<FMContextValue | null>(null);

export const FMProvider = ({ children }: { children: React.ReactNode }) => {
  const [userId, setUserId] = useState<string | null>(null);
  const [authEmail, setAuthEmail] = useState<string | null>(null);
  const [profile, setProfileState] = useState<Profile | null>(null);

  const setProfile = useCallback((newProfileData: Profile | null | ((prev: Profile | null) => Profile | null)) => {
    setProfileState(prev => {
      const updated = typeof newProfileData === 'function' ? newProfileData(prev) : newProfileData;
      return updated;
    });
  }, []);

  // Check for completed upgrades when profile or day changes
  useEffect(() => {
    if (!profile) return;
    
    if (profile.active_upgrade_type && profile.current_day >= (profile.active_upgrade_finish_day || 0)) {
       setProfile((prev: Profile | null) => {
         if (!prev) return prev;
         const finalProfile = { ...prev };
         if (finalProfile.active_upgrade_type === 'academy') {
           finalProfile.academy_level = (finalProfile.academy_level || 0) + 1;
         } else if (finalProfile.active_upgrade_type === 'stadium') {
           const upId = finalProfile.active_upgrade_id;
           if (upId) {
             const currentUps = { ...(finalProfile.stadium_upgrades || {}) };
             currentUps[upId] = (currentUps[upId] || 1) + 1;
             finalProfile.stadium_upgrades = currentUps;
           }
           finalProfile.stadium_capacity = (finalProfile.stadium_capacity || 0) + 5000;
           finalProfile.reputation = (finalProfile.reputation || 0) + 2;
         }
         
         // Clear upgrade state
         finalProfile.active_upgrade_type = null;
         finalProfile.active_upgrade_id = null;
         finalProfile.active_upgrade_finish_day = null;
         
         return finalProfile;
       });
       alert('İnşaat projesi tamamlandı!');
    }
  }, [profile?.current_day, profile?.active_upgrade_type, profile?.active_upgrade_finish_day, setProfile, profile]);

  // Sync to database
  useEffect(() => {
    if (isSupabaseConfigured() && profile?.id) {
      const supabase = getSupabase();
      supabase.from('profiles').update(profile).eq('id', profile.id);
    }
  }, [profile]);
  const [locale, setLocale] = useState<Locale>(getBrowserLocale());

  useEffect(() => {
    const savedEmail = localStorage.getItem('fm_auth_email');
    if (savedEmail) setAuthEmail(savedEmail);
  }, []);

  useEffect(() => {
    if (authEmail) {
      localStorage.setItem('fm_auth_email', authEmail);
    } else {
      localStorage.removeItem('fm_auth_email');
    }
  }, [authEmail]);
  const [squad, setSquad] = useState<Player[]>([]);
  const [activeTactic, setActiveTactic] = useState<ActiveTactic>(getDefaultGameTactics());
  const [trainingState, setTrainingState] = useState<TrainingState>(getDefaultTrainingState());
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [league, setLeague] = useState<Player[]>([]);
  const [selectedTeamProfile, setSelectedTeamProfile] = useState<string | null>(null);
  const [directMessageRecipient, setDirectMessageRecipient] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [matchState, setMatchState] = useState<MatchState>({
    minute: 0,
    score: { home: 0, away: 0 },
    result: null,
    visibleEvents: [],
    matchSummaryEvents: { home: [], away: [] },
    isActive: false,
    isFinished: false,
    isPaused: false,
    playerConditions: {}
  });

  // Admin check: server-side profile role tabanlı (hardcoded email veya localStorage bypass yok)
  useEffect(() => {
    const checkAdminRole = async () => {
      if (!userId || !isSupabaseConfigured()) {
        setIsAdmin(false);
        return;
      }
      try {
        const supabase = getSupabase();
        if (!supabase) { setIsAdmin(false); return; }
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', userId)
          .maybeSingle();
        setIsAdmin(profile?.role === 'admin');
      } catch {
        setIsAdmin(false);
      }
    };
    checkAdminRole();
  }, [userId]);

  const initTeam = useCallback(async (teamNameInput: string, managerName: string, philosophy: string, color1: string, color2: string) => {
    if (!userId) {
      console.error('[initTeam] HATA: userId bos, takim kurulamiyor!');
      return;
    }
    console.log(`[initTeam] Basladi: teamName="${teamNameInput}", userId="${userId}"`);
    setLoading(true);
    try {
      const userRegion = locale || getBrowserLocale();
      const supabase = isSupabaseConfigured() ? getSupabase()! : null;
      // Kullanıcı ismi HER ZAMAN kullanılır, NPC ismi asla fallback olmaz
      const finalTeamName = teamNameInput.trim() || 'İsimsiz Kulüp';
      let targetLeagueId: string | null = null;
      let targetLeagueName = '4. Lig';
      let replacedTeamSlotId: string | null = null;
      let replacedTeamOldName = '';

      if (supabase) {
        // 1. 4. Lig grubunu bul veya oluştur
        let groupFound = false;
        let groupIndex = 1;
        
        // Önce maintenance API'nin oluşturduğu 4. Lig'i bul (hardcoded UUID)
        const { data: maintenance4Lig } = await supabase.from('leagues').select('id, name').eq('tier', 4).order('created_at', { ascending: true }).limit(1).single();
        
        while (!groupFound && groupIndex <= 20) {
          const leagueName = groupIndex === 1 ? '4. Lig' : `4. Lig ${groupIndex}. Departman`;
          let { data: leagueData } = await supabase.from('leagues').select('id').eq('name', leagueName).single();
          
          // İlk grup için maintenance'in oluşturduğu ligi kullan
          if (groupIndex === 1 && !leagueData && maintenance4Lig) {
            // Maintenance zaten bir 4. Lig oluşturmuş, onu kullan
            leagueData = maintenance4Lig;
            console.log(`[initTeam] Maintenance 4. Lig kullanılıyor: id=${maintenance4Lig.id}`);
          }
          
          if (!leagueData) {
            // Yeni departman oluştur
            const { data: newLeague } = await supabase.from('leagues').insert({ name: leagueName, tier: 4 }).select().single();
            leagueData = newLeague;
            
            // 18 NPC takım seed et (özel isimlerle)
            if (leagueData) {
              const teamNames = getTeamNamesForDepartment(4, groupIndex);
              const npcTeams = Array.from({ length: 18 }).map((_, i) => ({
                league_id: leagueData.id,
                name: teamNames[i] || `${leagueName} Kulüp ${i + 1}`,
                is_npc: true,
                strength: 45 + Math.floor(Math.random() * 10)
              }));
              await supabase.from('league_teams').insert(npcTeams);

              // Sezon oluştur ( Pazartesi başlangıç)
              const now = new Date();
              const day = now.getDay();
              const diff = now.getDate() - day + (day === 0 ? -6 : 1);
              const monday = new Date(now.setDate(diff));
              
              const { data: newSeason } = await supabase.from('seasons').insert({
                league_id: leagueData.id,
                year: '2025/26',
                start_date: monday.toISOString().split('T')[0],
                current_tur: 1
              }).select().single();

              if (newSeason) {
                await supabase.rpc('generate_league_fixtures', { p_season_id: newSeason.id });
              }
            }
          }

          if (leagueData) {
            // Sezon yoksa oluştur
            const { data: existingSeason } = await supabase.from('seasons').select('id').eq('league_id', leagueData.id).single();
            if (!existingSeason) {
               const now = new Date();
               const day = now.getDay();
               const diff = now.getDate() - day + (day === 0 ? -6 : 1);
               const monday = new Date(now.setDate(diff));
               const { data: bSeason } = await supabase.from('seasons').insert({
                league_id: leagueData.id,
                year: '2025/26',
                start_date: monday.toISOString().split('T')[0],
                current_tur: 1
              }).select().single();
              if (bSeason) {
                await supabase.rpc('generate_league_fixtures', { p_season_id: bSeason.id });
              }
            }

            // Boş NPC slot bul
            let { data: availableSlots } = await supabase
              .from('league_teams')
              .select('id, name')
              .eq('league_id', leagueData.id)
              .eq('is_npc', true)
              .is('profile_id', null);

            // FALLBACK: Eğer boş NPC slot yoksa, orphaned slotları da kontrol et
            // (is_npc=false ama profile_id'si profiles tablosunda olmayan takımlar)
            if (!availableSlots || availableSlots.length === 0) {
              const { data: allSlots } = await supabase
                .from('league_teams')
                .select('id, name, profile_id')
                .eq('league_id', leagueData.id);

              if (allSlots && allSlots.length > 0) {
                // Get all existing profile IDs
                const { data: allProfiles } = await supabase.from('profiles').select('id');
                const existingProfileIds = new Set((allProfiles || []).map((p: any) => p.id));
                
                // Find orphaned slots (profile doesn't exist)
                const orphanedSlots = allSlots.filter(s => s.profile_id && !existingProfileIds.has(s.profile_id));
                if (orphanedSlots.length > 0) {
                  // Restore orphaned slots to NPC
                  const orphanedSlot = orphanedSlots[0];
                  await supabase.from('league_teams').update({
                    is_npc: true,
                    profile_id: null,
                    name: `${leagueName} Kulüp`,
                    strength: 45 + Math.floor(Math.random() * 10),
                    color: null
                  }).eq('id', orphanedSlot.id);
                  
                  availableSlots = [{ id: orphanedSlot.id, name: `${leagueName} Kulüp` }];
                  console.log(`[initTeam] Restored orphaned slot ${orphanedSlot.id} to NPC`);
                }
              }
            }

            if (availableSlots && availableSlots.length > 0) {
              const randomSlot = availableSlots[Math.floor(Math.random() * availableSlots.length)];
              targetLeagueId = leagueData.id;
              targetLeagueName = leagueName;
              replacedTeamSlotId = randomSlot.id;
              replacedTeamOldName = randomSlot.name;
              groupFound = true;
              console.log(`[initTeam] Slot bulundu: "${replacedTeamOldName}" (id:${replacedTeamSlotId}) lig: "${targetLeagueName}"`);
            } else {
              console.log(`[initTeam] Grup ${groupIndex} dolu, sonraki departmana geciliyor...`);
              groupIndex++;
            }
          } else {
            break;
          }
        }
        
        if (!groupFound) {
          console.error('[initTeam] HATA: 4. Lig\'de bos slot bulunamadi! 20 departman dolu.');
        }
      } else {
        console.warn('[initTeam] Supabase baglantisi yok, offline modda devam ediliyor.');
      }

      const newProfile = {
        id: userId,
        team_name: finalTeamName,
        league_name: targetLeagueName,
        manager_name: managerName || authEmail?.split('@')[0] || 'Menajer',
        money: philosophy === 'financial' ? 150000000 : 100000000,
        credits: philosophy === 'legend' ? 500 : 250,
        current_day: 1, 
        ticket_price: 35,
        stadium_capacity: 10000,
        region: userRegion,
        philosophy: philosophy,
        primary_color: color1,
        secondary_color: color2,
        reputation: philosophy === 'reputation' ? 40 : 30,
        academy_level: philosophy === 'youth' ? 3 : 1,
        created_at: new Date().toISOString()
      };
      
      setProfileState(newProfile);
      
      // HER ZAMAN kullanıcıya özel 19 oyuncu oluştur (NPC oyuncuları DEĞİL)
      const playersToInsert: any[] = [];
      const posCounts = { GK: 2, DEF: 6, MID: 6, FWD: 5 };
      const qualityMod = philosophy === 'squad' ? 1.1 : 1.0;
      Object.entries(posCounts).forEach(([pos, count]) => {
        for (let i = 0; i < count; i++) {
          const p = generateLocalizedPlayer(userRegion as any, finalTeamName, 4, pos as any);
          playersToInsert.push({
            ...p,
            rating: Math.min(94, Math.floor(p.rating * qualityMod)),
            position: pos,
            profile_id: userId,
            team_name: finalTeamName
          });
        }
      });
      
      setSquad(playersToInsert);

      if (supabase) {
        // Eski NPC takımın oyuncularını temizle
        if (replacedTeamOldName) {
          try { await supabase.from('players').delete().eq('team_name', replacedTeamOldName).is('profile_id', null); } catch (e) { console.error('NPC player cleanup error:', e); }
        }

        // league_teams'de NPC takımın adını kullanıcının adıyla değiştir
        if (replacedTeamSlotId) {
          try {
            await supabase.from('league_teams').update({
              profile_id: userId,
              is_npc: false,
              name: finalTeamName,
              strength: 55,
              color: color1
            }).eq('id', replacedTeamSlotId);
          } catch (e) { console.error('League team update error:', e); }
        }

        // LEAGUE STANDINGS BAŞLANGIÇ - Tüm takımlar için standings oluştur
        if (targetLeagueId) {
          try {
            const { data: seasonData } = await supabase
              .from('seasons')
              .select('id')
              .eq('league_id', targetLeagueId)
              .order('created_at', { ascending: false })
              .limit(1)
              .single();

            if (seasonData) {
              // Mevcut standings var mı kontrol et
              const { count: existingStandings } = await supabase
                .from('league_standings')
                .select('*', { count: 'exact', head: true })
                .eq('season_id', seasonData.id);

              if (!existingStandings || existingStandings === 0) {
                // Tüm takımları getir
                const { data: allTeams } = await supabase
                  .from('league_teams')
                  .select('id')
                  .eq('league_id', targetLeagueId);

                if (allTeams && allTeams.length > 0) {
                  const standingsRows = allTeams.map((t: any) => ({
                    season_id: seasonData.id,
                    team_id: t.id,
                    played: 0, won: 0, drawn: 0, lost: 0,
                    gf: 0, ga: 0, gd: 0, points: 0
                  }));
                  await supabase.from('league_standings').insert(standingsRows);
                  console.log(`[initTeam] ${standingsRows.length} standings rows created for league ${targetLeagueName}`);
                }
              }
            }
          } catch (standingsErr) {
            console.error('League standings init error:', standingsErr);
          }
        }

        // PROFIL VE OYUNCULARI HEMEN KAYDET (history'den once)
        try {
          await supabase.from('profiles').upsert(newProfile);
          await supabase.from('players').delete().eq('profile_id', userId);
          await savePlayers(playersToInsert, userId, finalTeamName);
          console.log(`[initTeam] Profile and ${playersToInsert.length} players saved to Supabase for team: ${finalTeamName}`);
        } catch (saveErr) {
          console.error('Save profile/players error:', saveErr);
          // Fallback: save to localStorage
          localStorage.setItem('fm_profile', JSON.stringify(newProfile));
          localStorage.setItem('fm_squad', JSON.stringify(playersToInsert));
        }
      } else {
        localStorage.setItem('fm_profile', JSON.stringify(newProfile));
        localStorage.setItem('fm_squad', JSON.stringify(playersToInsert));
      }
      
      // SIMULATE HISTORY (non-blocking, don't fail team creation)
      try {
        const history = await simulateHistory(userId, finalTeamName, playersToInsert);
        const lastSimDay = history.length > 0 ? Math.max(...history.map(m => m.day)) : 1;
        const finalProfile = { ...newProfile, current_day: lastSimDay + 1 };
        setProfileState(finalProfile);

        if (supabase) {
          await supabase.from('profiles').upsert(finalProfile);
          for (const m of history) {
            try {
              await supabase.from('match_history').insert({
                user_id: userId,
                home_team: m.homeTeam,
                away_team: m.awayTeam,
                score: `${m.homeScore}-${m.awayScore}`,
                match_data: JSON.stringify(m.result),
                created_at: m.date
              });
            } catch (histErr) { console.error('History insert error:', histErr); }
          }
        } else {
          localStorage.setItem('fm_match_history', JSON.stringify(history));
          localStorage.setItem('fm_last_processed_day', (lastSimDay + 1).toString());
        }
      } catch (err) {
        console.error('History Simulation Error:', err);
        // History failed but team+players already saved, continue
      }
    } catch (err) {
      console.error('initTeam Error Details:', err);
      alert('Takım kurulurken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  }, [userId, locale, authEmail]);

  const refreshData = useCallback(async (id?: string) => {
    const targetId = id || userId;
    if (!targetId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const isConfigured = isSupabaseConfigured();
      const supabase = isConfigured ? getSupabase() : null;
      
      let savedProfile = null;
      let pError = null;

      if (isConfigured && supabase) {
        const result = await supabase.from('profiles').select('*').eq('id', targetId).single();
        savedProfile = result.data;
        pError = result.error;
      }

      const savedTactic = await loadActiveTactic(targetId);
      const savedTraining = await loadTrainingState(targetId);

      // Load League Players (Global Ranking)
      if (isConfigured && supabase) {
        const { data: topPlayers } = await supabase
          .from('players')
          .select('*')
          .order('rating', { ascending: false })
          .limit(100);
        
        if (topPlayers) {
          const mapped = topPlayers.map((p: any) => ({
            ...p,
            rating: p.rating ?? p.klt ?? 60,
            passing: p.passing ?? p.pas ?? 50,
            shooting: p.shooting ?? p.sut ?? 50,
            defending: p.defending ?? p.tk ?? 50,
            speed: p.speed ?? p.hiz ?? 50,
            power: p.power ?? p.guc ?? 50,
            vision: p.vision ?? p.alg ?? 50,
            control: p.control ?? p.top ?? 50,
            heading: p.heading ?? p.kfa ?? 50,
            goalkeeping: p.goalkeeping ?? p.klc ?? 10,
          }));
          setLeague(mapped);
        }
      }

      if (pError || !savedProfile) {
        // NEW USER FLOW: Stop auto-seeding here. ManagerRegistration will handle initTeam.
        setProfileState(null);
        setSquad([]);
        setLoading(false);
        return;
      } else {
        // Backfill for existing users
        const backfilledProfile = {
          ...savedProfile,
          league_name: savedProfile.league_name || '4. Lig',
          primary_color: savedProfile.primary_color || '#ffffff',
          secondary_color: savedProfile.secondary_color || '#000000',
        };
        setProfileState(backfilledProfile);
        const players = await loadPlayers(targetId, savedProfile.team_name);
        if (players && players.length > 0) {
          setSquad(players);
        } else {
          // Profile exists but NO players. This might happen if seeding failed or was skipped.
          // Seed them now at the correct tier.
          const userRegion = savedProfile.region || getBrowserLocale();
          const team = savedProfile.team_name || 'İsimsiz Kulüp';
          const tier = (savedProfile.league_name || '').includes('4') ? 4 : 1;
          
          const playersToInsert: any[] = [];
          const posCounts = { GK: 2, DEF: 6, MID: 6, FWD: 5 };
          
          Object.entries(posCounts).forEach(([pos, count]) => {
            for (let i = 0; i < count; i++) {
              const p = generateLocalizedPlayer(userRegion, team, tier, pos as any);
              playersToInsert.push({
                ...p,
                position: pos,
                profile_id: targetId,
                team_name: team
              });
            }
          });
          
          if (isConfigured && supabase) {
            const { data } = await supabase.from('players').insert(playersToInsert).select();
            if (data) setSquad(data);
            else setSquad(playersToInsert);
          } else {
            setSquad(playersToInsert);
          }
        }
      }

      if (savedTactic) setActiveTactic(savedTactic);
      if (savedTraining) setTrainingState(savedTraining);

      const savedWatchlist = await loadWatchlist(targetId);
      if (savedWatchlist && isConfigured && supabase) {
        // PERMANENT WATCHLIST REFINEMENT: Remove retired players
        const { data: activeWatchlistPlayers } = await supabase
          .from('players')
          .select('id, age')
          .in('id', savedWatchlist);
        
        if (activeWatchlistPlayers) {
          const retiredIds = activeWatchlistPlayers.filter(p => (p.age || 0) >= 38).map(p => p.id);
          const validIds = activeWatchlistPlayers.filter(p => (p.age || 0) < 38).map(p => p.id);
          
          if (retiredIds.length > 0) {
            await supabase.from('watchlist').delete().eq('user_id', targetId).in('player_id', retiredIds);
          }
          setWatchlist(validIds);
        } else {
          setWatchlist(savedWatchlist);
        }
      } else if (savedWatchlist) {
        setWatchlist(savedWatchlist);
      }
    } catch (err) {
      console.error('Failed to load FM data:', err);
      // Fallback with random team even on failure if possible
      const region = getBrowserLocale();
      const config = getRegionConfig(region);
      const randomT = config.teams[Math.floor(Math.random() * config.teams.length)];

      setProfile((current: any) => {
        if (!current) {
          return {
            id: targetId,
            team_name: randomT,
            manager_name: 'Misafir Menajer',
            money: 50000000,
            credits: 100,
            ticket_price: 20,
            academy_level: 1,
            reputation: 50,
            stadium_capacity: 5000,
            stadium_upgrades: {},
            current_day: 1,
            created_at: new Date().toISOString()
          };
        }
        return current;
      });
    } finally {
      setLoading(false);
    }
  }, [userId, setProfile]);

  const processFinancials = useCallback((day: number) => {
    setProfile((prev: Profile | null) => {
      if (!prev) return prev;
      let newMoney = prev.money || 0;
      const sponsors = prev.sponsors || [];
      const upgrades = prev.stadium_upgrades || {};
      
      // 1. Weekly Sponsor Payouts (Every 7 days)
      if (day % 7 === 0) {
        const weeklyTotal = sponsors.reduce((acc: number, s: any) => acc + s.weeklyPayment, 0);
        newMoney += weeklyTotal;
      }

      // 2. Passive Stadium Income (Daily)
      // Merchandising (Store)
      const storeLvl = upgrades['store'] || 0;
      const storeIncome = storeLvl * 25000;
      
      // VIP Passive (Level 10 bonus)
      const vipLvl = upgrades['vip'] || 0;
      const vipIncome = vipLvl === 10 ? 500000 : (vipLvl * 15000);
      
      newMoney += (storeIncome + vipIncome);

      // 3. Player Wages (Daily)
      const dailyWages = squad.reduce((acc, p) => acc + (p.salary / 30), 0);
      newMoney -= dailyWages;

      // 4. Update Sponsor durations
      const updatedSponsors = sponsors.map((s: any) => ({
        ...s,
        remainingDays: Math.max(0, s.remainingDays - 1)
      })).filter((s: any) => s.remainingDays > 0);

      return {
        ...prev,
        money: Math.max(0, newMoney), // Prevent negative if possible
        sponsors: updatedSponsors
      };
    });
  }, [squad, setProfile]);

  const processScouting = useCallback((day: number) => {
    setTrainingState((prev: Profile | null) => {
      if (!prev || !prev.scouting) return prev;
      
      const currentScouting = prev.scouting;
      const updatedScouts = currentScouting.scouts.map((s: any) => {
        if (s.status === 'SCOUTING') {
          const nextDays = Math.max(0, s.remainingDays - 1);
          return { ...s, remainingDays: nextDays };
        }
        return s;
      });

      const finishingScouts = updatedScouts.filter((s: any) => s.status === 'SCOUTING' && s.remainingDays === 0);
      let newPlayers: Player[] = [];

      finishingScouts.forEach((s: any) => {
        // Find continent duration to match back to minStars/region if needed
        // Or just generate 1-3 players per scout
        const playersToFind = 1 + Math.floor(Math.random() * 2); // 1-2 players
        for (let i = 0; i < playersToFind; i++) {
          // Determine region from scout location
          let region: any = 'TR'; // Default
          if (s.location === 'AVRUPA') region = 'EN';
          else if (s.location === 'GÜNEY AMERİKA') region = 'BR';
          else if (s.location === 'AFRİKA') region = 'NG' as any; // Approximate
          else if (s.location === 'ASYA') region = 'CN' as any;
          else if (s.location === 'KUZEY AMERİKA') region = 'US' as any;

          // Quality based on scout stars
          // s.stars 1: ~60 rating, 5: ~85 rating
          const minRating = 40 + (s.stars * 8);
          const p = generateLocalizedPlayer(region, 'Serbest', 1);
          newPlayers.push({
            ...p,
            rating: Math.max(minRating, p.rating),
            scouted: true,
            scouting_stars: s.stars
          });
        }
        s.status = 'IDLE';
        s.location = undefined;
      });

      return {
        ...prev,
        scouting: {
          ...currentScouting,
          scouts: updatedScouts,
          foundPlayersPool: [...(currentScouting.foundPlayersPool || []), ...newPlayers]
        }
      };
    });
  }, [setTrainingState]);

  // Financials and Day end processing
  useEffect(() => {
    if (!profile) return;
    
    // Check if a new day has started in game terms (this is a simplified check)
    // In a real multi-user app, this would be server-side.
    const lastProcessedDay = parseInt(localStorage.getItem('fm_last_processed_day') || '0');
    if (profile.current_day > lastProcessedDay) {
      processFinancials(profile.current_day);
      processScouting(profile.current_day);
      localStorage.setItem('fm_last_processed_day', profile.current_day.toString());
    }
  }, [profile?.current_day, processFinancials, processScouting, profile]);

  const addMatchRevenue = useCallback((isHome: boolean) => {
    setProfile((prev: Profile | null) => {
      if (!prev || !isHome) return prev;
      
      const upgrades = prev.stadium_upgrades || {};
      const capacityLvl = upgrades['capacity'] || 0;
      const capacity = 5000 + (capacityLvl * 10000);
      
      // Assume 90% attendance on average
      const attendance = Math.floor(capacity * 0.9);
      const ticketPrice = 50 + (capacityLvl * 10);
      const ticketRevenue = attendance * ticketPrice;
      
      // Food & Beverage (Utensils/Restaurant if added, but let's use a base anyway)
      const fbRevenue = attendance * 15;
      
      const totalMatchRevenue = ticketRevenue + fbRevenue;
      
      return {
        ...prev,
        money: (prev.money || 0) + totalMatchRevenue
      };
    });
  }, [setProfile]);

  const negotiatePurchase = useCallback(async (player: Player, offerPrice: number) => {
    if (!profile) return { success: false, reason: 'Profil bulunamadı' };

    try {
      // market_value null/0 koruması: Oyuncunun rating'ine göre tahmini değer hesapla
      const effectiveMarketValue = player.market_value && player.market_value > 0
        ? player.market_value
        : Math.round(Math.pow(player.rating || 60, 2.5) * 5000);

      const ratio = effectiveMarketValue > 0 ? offerPrice / effectiveMarketValue : 999;
      let accepted = false;
      let counterOffer = 0;

      if (ratio >= 1.2) {
        accepted = true; // %120+ her zaman kabul
      } else if (ratio < 0.5) {
        return { success: false, reason: 'Kulüp bu düşük teklifi hakaret olarak gördü ve masadan kalktı.' };
      } else if (ratio < 0.8) {
        // %50-80 arası: %20 kabul şansı, yoksa karşı teklif
        if (Math.random() < 0.2) {
          accepted = true;
        } else {
          counterOffer = Math.round(effectiveMarketValue * (1.0 + Math.random() * 0.2));
          return { success: false, reason: `Kulüp teklifi yetersiz buldu. Karşı teklif: ${counterOffer.toLocaleString()} TL`, counterOffer };
        }
      } else {
        // %80-120 arası: %85 kabul şansı
        const chance = (ratio - 0.8) / 0.4; // 0 to 1
        if (Math.random() < 0.7 + chance * 0.15) {
          accepted = true;
        } else {
          counterOffer = Math.round(effectiveMarketValue * (1.05 + Math.random() * 0.1));
          return { success: false, reason: `Kulüp teklifi yetersiz buldu. Karşı teklif: ${counterOffer.toLocaleString()} TL`, counterOffer };
        }
      }

      if (accepted) {
        // Komisyon ve Bonus
        const agentCommission = Math.round(offerPrice * 0.05);
        const signingBonus = Math.round(offerPrice * 0.03);
        const totalCost = offerPrice + agentCommission + signingBonus;

        const currentMoney = profile.money || 0;
        if (currentMoney < totalCost) {
          return { success: false, reason: `Yetersiz bütçe. Toplam maliyet (Komisyonlar dahil): ${totalCost.toLocaleString()} TL. Bütçen: ${currentMoney.toLocaleString()} TL` };
        }

        // Oyuncuyu kadroya ekle
        const transferredPlayer = {
          ...player,
          profile_id: profile.id,
          team_name: profile.team_name,
          club: profile.team_name,
          market_value: effectiveMarketValue,
        };
        setSquad(prev => [...prev, transferredPlayer]);

        // Bütçeyi güncelle
        const newMoney = currentMoney - totalCost;
        setProfile((prev: Profile | null) => ({ ...prev, money: newMoney }));

        // Oyuncuyu transfer listesinden (league state) kaldır
        setLeague((prev) => prev.filter((p) => p.id !== player.id));

        // Supabase'e kaydet
        if (isSupabaseConfigured()) {
          const supabase = getSupabase();
          await supabase.from('players').update({
            profile_id: profile.id,
            team_name: profile.team_name,
            club: profile.team_name,
            is_for_sale: false
          }).eq('id', player.id);
          await supabase.from('profiles').update({ money: newMoney }).eq('id', profile.id);
        }

        console.log(`[TRANSFER] ${player.name} → ${profile.team_name}, Bedel: ${offerPrice.toLocaleString()} TL`);
        return { success: true, totalCost, agentCommission, signingBonus };
      }

      return { success: false, reason: 'Bilinmeyen bir hata oluştu.' };
    } catch (err: any) {
      console.error('[TRANSFER HATASI]', err);
      return { success: false, reason: `Transfer sırasında hata oluştu: ${err.message || 'Bilinmeyen hata'}` };
    }
  }, [profile, setProfile, setSquad, setLeague]);

  const addSponsor = useCallback(async (sponsor: any) => {
    setProfile((prev: Profile | null) => ({
      ...prev,
      sponsors: [...(prev.sponsors || []), sponsor]
    }));
  }, [setProfile]);

  const sellPlayer = useCallback(async (player: Player) => {
    if (!profile) return;
    
    const taxRate = 0.025;
    const salePrice = player.market_value;
    const taxAmount = salePrice * taxRate;
    const netRevenue = salePrice - taxAmount;

    // 1. Remove from squad
    setSquad(prev => prev.filter(p => p.id !== player.id));
    
    // 2. Add money to profile
    setProfile(prev => ({
      ...prev,
      money: (prev.money || 0) + netRevenue
    }));

    // 3. Update in Supabase (Mark as free agent or handled by system)
    if (isSupabaseConfigured()) {
      const supabase = getSupabase();
      // Record transaction? For now just move player to system
      await supabase.from('players').update({ 
        club: 'Transfer Listesi', 
        team_name: 'Transfer Listesi', 
        profile_id: null,
        is_for_sale: false 
      }).eq('id', player.id);
      
      // Update profile money in DB
      await supabase.from('profiles').update({ 
        money: (profile.money || 0) + netRevenue 
      }).eq('id', profile.id);
    }
    
    return { success: true, netRevenue, taxAmount };
  }, [profile, setProfile]);

  const scoutPlayer = useCallback(async (playerId: string, playerObj?: Player) => {
    if (!profile || (profile.money || 0) < 150000) return { success: false, reason: 'Yetersiz bütçe (150.000 TL gerekli)' };

    const newMoney = (profile.money || 0) - 150000;
    
    // Find player in squad or use provided object
    const targetPlayer = squad.find(p => p.id === playerId) || playerObj;
    
    if (!targetPlayer) return { success: false, reason: 'Oyuncu bulunamadı' };

    // Calculate accuracy
    const scoutCount = (targetPlayer.scouting_count || 0) + 1;
    const scoutStars = trainingState?.scouting?.stars || 1;
    const accuracy = Math.min(0.95, 0.2 + (scoutCount * 0.1) + (scoutStars * 0.05));
    
    const isCorrect = Math.random() < accuracy;
    
    let guessedStars = 3;
    const actualStars = Math.max(1, Math.min(5, Math.ceil((targetPlayer.potential || 70) / 20)));
    guessedStars = actualStars;
    if (!isCorrect) {
      // If wrong, deviate by 1-2 stars
      const offset = Math.random() < 0.5 ? 1 : -1;
      guessedStars = Math.max(1, Math.min(5, actualStars + offset));
    }

    const updatedPlayer = { 
      ...targetPlayer, 
      scouted: true, 
      scouting_stars: guessedStars,
      scouting_count: scoutCount
    };

    // Update squad if player is in it
    if (squad.find(p => p.id === playerId)) {
      setSquad(prev => prev.map(p => p.id === playerId ? updatedPlayer : p));
    }
    
    // Update profile money
    setProfile((prev: Profile | null) => ({ ...prev, money: newMoney }));

    // Update in Supabase
    if (isSupabaseConfigured()) {
      const supabase = getSupabase();
      await supabase.from('players').update({ 
        scouted: true, 
        scouting_stars: guessedStars, 
        scouting_count: scoutCount
      }).eq('id', playerId);
      await supabase.from('profiles').update({ money: newMoney }).eq('id', profile.id);
    }

    return { success: true, player: updatedPlayer };
  }, [profile, trainingState, setProfile, squad]);

  const playFriendlyMatch = useCallback(async (isPaid: boolean = false) => {
    if (!profile) return { success: false, reason: 'Profil bulunamadı' };
    
    if (isPaid && (profile.credits || 0) < 1) {
      return { success: false, reason: 'Yetersiz Kredi (1 Kredi gerekli)' };
    }

    const newCredits = isPaid ? (profile.credits || 0) - 1 : (profile.credits || 0);
    
    // Simulate Match
    const homeScore = Math.floor(Math.random() * 4);
    const awayScore = Math.floor(Math.random() * 4);
    
    // Apply Training Bonus (2x) as requested
    const { updatedSquad, results } = runTrainingSession(squad, trainingState, 2.0);
    
    setSquad(updatedSquad);
    setProfile((prev: Profile | null) => ({ ...prev, credits: newCredits }));
    
    if (isSupabaseConfigured()) {
      const supabase = getSupabase();
      await supabase.from('profiles').update({ credits: newCredits }).eq('id', profile.id);
      
      await supabase.from('friendly_matches').insert({
        home_team_id: profile.id,
        away_team_id: 'cpu',
        home_score: homeScore,
        away_score: awayScore,
        match_data: { results, simulated: true }
      });
      
      // Batch update players would be better but let's do critical sync
      for (const p of updatedSquad) {
         await supabase.from('players').update({
           rating: p.rating,
           potential: p.potential,
           speed: p.speed,
           power: p.power,
           passing: p.passing,
           shooting: p.shooting,
           defending: p.defending,
           vision: p.vision,
           control: p.control,
           cond: p.cond,
           form: p.form
         }).eq('id', p.id);
      }
    }
    
    return { success: true, homeScore, awayScore, results };
  }, [profile, squad, trainingState, setProfile]);

  const toggleWatchlist = useCallback(async (player: Player) => {
    if (!profile || !player) return;
    
    // Retirement check
    if ((player.age || 0) >= 38) {
      alert('Emekli olmuş oyuncular izleme listesine eklenemez.');
      return;
    }

    const playerId = player.id;
    const isWatched = watchlist.includes(playerId);
    const newWatchlist = isWatched 
      ? watchlist.filter(id => id !== playerId)
      : [...watchlist, playerId];
    
    setWatchlist(newWatchlist);
    saveWatchlist(profile.id, newWatchlist);
 
    if (isSupabaseConfigured()) {
      const supabase = getSupabase();
      try {
        if (isWatched) {
          await supabase.from('watchlist').delete().eq('user_id', profile.id).eq('player_id', playerId);
        } else {
          // CRITICAL: Ensure player exists in 'players' table first due to FK constraint
          const { data: existingPlayer } = await supabase.from('players').select('id').eq('id', playerId).single();
          
          if (!existingPlayer) {
            // Insert player data if missing
            await supabase.from('players').insert({
              ...player,
              profile_id: null, // It's a scouted/free player, not owned by user yet
              scouted: true // Mark as scouted since they are in watchlist
            });
          }
          
          await supabase.from('watchlist').insert({ user_id: profile.id, player_id: playerId });
        }
      } catch (err) {
        console.error('Watchlist sync error:', err);
      }
    }
  }, [profile, watchlist]);

  // Initial load
  useEffect(() => {
    const generateUUID = () => {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    };

    const savedId = typeof window !== 'undefined' ? localStorage.getItem('fm_user_id') : null;
    
    // If we have an ID but it's not a UUID, and Supabase is configured, we might need a new one
    // However, for consistency, let's just ensure NEW users get a UUID.
    const defaultId = savedId || generateUUID();
    setUserId(defaultId);
  }, []);

  useEffect(() => {
    if (userId) {
      localStorage.setItem('fm_user_id', userId);
      refreshData(userId);
    }
  }, [userId, refreshData]);

  // Default check if no profile exists - DISABLE AUTO SEED TO PREFER REGISTRATION
  useEffect(() => {
    if (!loading && !profile && userId) {
      // Don't auto-seed anymore, let ManagerRegistration handle it
      return;
    }
  }, [loading, profile, userId]);

  // Auto-save logic
  useEffect(() => {
    if (userId && profile) {
      saveProfile(profile);
    }
  }, [profile, userId]);

  useEffect(() => {
    if (userId && squad.length > 0) {
      savePlayers(squad, userId, profile?.team_name || 'Başakşehir');
    }
  }, [squad, userId, profile?.team_name]);

  useEffect(() => {
    if (userId && activeTactic) {
      saveActiveTactic(userId, activeTactic);
    }
  }, [activeTactic, userId]);

  useEffect(() => {
    if (userId && trainingState) {
      saveTrainingState(userId, trainingState);
    }
  }, [trainingState, userId]);

  return (
    <FMContext.Provider value={{
      userId, setUserId,
      authEmail, setAuthEmail,
      isAdmin,
      profile, setProfile,
      squad, setSquad,
      activeTactic, setActiveTactic,
      trainingState, setTrainingState,
      league, setLeague,
      selectedTeamProfile, setSelectedTeamProfile,
      directMessageRecipient, setDirectMessageRecipient,
      loading, setLoading, refreshData,
      locale, setLocale,
      sellPlayer, scoutPlayer, playFriendlyMatch,
      watchlist, toggleWatchlist,
      negotiatePurchase, addSponsor, initTeam,
      matchState, setMatchState,
      activeTab, setActiveTab
    }}>
      {children}
    </FMContext.Provider>
  );
};

export const useFM = () => {
  const context = useContext(FMContext);
  if (!context) throw new Error('useFM must be used within an FMProvider');
  return context;
};
