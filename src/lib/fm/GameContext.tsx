'use client';
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getDefaultGameTactics, getDefaultTrainingState, Player, Profile, ActiveTactic, TrainingState } from './types';
import { 
  loadProfile, loadPlayers, loadActiveTactic, loadTrainingState, loadWatchlist,
  saveProfile, savePlayers, saveActiveTactic, saveTrainingState, saveWatchlist
} from './persistence';
import { isSupabaseConfigured, getSupabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { assignRefereesToSeason } from './referee';
import { getBrowserLocale, Locale } from './i18n';
import { showToast } from '@/components/fm/ToastNotifications';
import { playSound } from '@/utils/sound';
import { generateLocalizedPlayer, getRegionConfig } from './region-generator';
import { getTeamNamesForDepartment } from './constants';
import { getTomorrowNoon } from './league';
import { formatCurrency } from './valuation';

interface FMContextValue {
  userId: string | null;
  authEmail: string | null;
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
  playFriendlyMatch: (isPaid?: boolean) => Promise<{ success: boolean; reason?: string; homeScore?: number; awayScore?: number; results?: Record<string, unknown> }>;
  watchlist: string[];
  toggleWatchlist: (player: Player) => Promise<void>;
  negotiatePurchase: (player: Player, offerPrice: number) => Promise<{ success: boolean; reason?: string; totalCost?: number; agentCommission?: number; signingBonus?: number; counterOffer?: number }>;
  addSponsor: (sponsor: any) => Promise<void>;
  initTeam: (teamNameInput: string, managerName: string, philosophy: string, color1: string, color2: string) => Promise<void>;
  activeTab: string;
  setActiveTab: React.Dispatch<React.SetStateAction<string>>;
}

const FMContext = createContext<FMContextValue | null>(null);

export const FMProvider = ({ children }: { children: React.ReactNode }) => {
  // Get auth state from AuthContext
  const { user: authUser, signOut: authSignOut } = useAuth();
  const userId = authUser?.id ?? null;
  const authEmail = authUser?.email ?? null;
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
         } else if (finalProfile.active_upgrade_type === 'stadium' || finalProfile.active_upgrade_type === 'stadium_matrix') {
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
       showToast('İnşaat projesi tamamlandı!', 'success');
      playSound('success');
    }
  }, [profile?.current_day, profile?.active_upgrade_type, profile?.active_upgrade_finish_day, setProfile, profile]);

  // Sync to database (with localStorage backup and await)
  // Columns that may not exist in the database yet (pending migrations)
  // consecutive_losses already exists; these are the ones still missing:
  const PENDING_MIGRATION_COLUMNS = [
    'last_newspaper_applied', 'financial_health',
    'last_friendly_date', 'daily_friendly_count'
  ];

  useEffect(() => {
    if (profile?.id) {
      // Always save to localStorage first as backup
      try {
        localStorage.setItem('fm_profile', JSON.stringify(profile));
      } catch (e) { /* ignore */ }
      
      // Then persist to Supabase with await
      if (isSupabaseConfigured()) {
        const supabase = getSupabase();
        if (supabase) {
          // Strip columns that may not exist in the database yet to prevent sync errors
          const profileForDb = { ...profile };
          for (const col of PENDING_MIGRATION_COLUMNS) {
            delete (profileForDb as any)[col];
          }
          supabase.from('profiles').update(profileForDb).eq('id', profile.id)
            .then(({ error }) => {
              if (error) {
                // Only log non-migration-related errors
                if (!error.message?.includes('does not exist') && !error.message?.includes('schema cache')) {
                  console.error('[GameContext] Profile sync error:', error.message);
                }
              }
            });
        }
      }
    }
  }, [profile]);
  const [locale, setLocale] = useState<Locale>(getBrowserLocale());

  // authEmail is now derived from authUser.email — no localStorage needed
  const [squad, setSquad] = useState<Player[]>([]);
  const [activeTactic, setActiveTactic] = useState<ActiveTactic>(getDefaultGameTactics());
  const [trainingState, setTrainingState] = useState<TrainingState>(getDefaultTrainingState());
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [league, setLeague] = useState<Player[]>([]);
  const [selectedTeamProfile, setSelectedTeamProfile] = useState<string | null>(null);
  const [directMessageRecipient, setDirectMessageRecipient] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // Safety timeout: if loading hangs for more than 8 seconds, force it to false
  // This prevents the app from being stuck on the loading spinner forever
  useEffect(() => {
    const timeout = setTimeout(() => {
      setLoading(prev => {
        if (prev) {
          console.warn('[GameContext] Loading timeout - forcing loading=false');
          return false;
        }
        return prev;
      });
    }, 8000);
    return () => clearTimeout(timeout);
  }, []);

  const [activeTab, setActiveTab] = useState('dashboard');

  // Admin check: refreshData ile birleştirildi (ayrı sorgu yok)
  // Sadece Supabase yapılandırılmamışsa false kalır
  useEffect(() => {
    if (!userId || !isSupabaseConfigured()) {
      setIsAdmin(false);
    }
    // Supabase configured ise, refreshData zaten rolü kontrol ediyor
  }, [userId]);

  const initTeam = useCallback(async (teamNameInput: string, managerName: string, philosophy: string, color1: string, color2: string) => {
    if (!userId) {
      console.error('[initTeam] HATA: userId bos, takim kurulamiyor!');
      return;
    }
    console.log(`[initTeam] /api/auth/register cagriliyor: teamName="${teamNameInput}", userId="${userId}"`);
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          teamName: teamNameInput.trim(),
          managerName: managerName.trim(),
          philosophy,
          color1,
          color2,
          region: locale || 'TR',
        }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        console.error('[initTeam] Register API hatası:', data.error || data.message);
        showToast(data.error || data.message || 'Takım kurulurken hata oluştu.', 'error');
        return;
      }

      // Lig ataması başarısız olduysa uyarı göster
      if (!data.tookOverBot && !data.leagueName) {
        showToast('Lig ataması yapılamadı. Lütfen sayfayı yenileyip tekrar deneyin.', 'error');
      }

      // Fikstür yoksa uyarı göster
      if (data.hasFixtures === false) {
        showToast('Fikstür oluşturulamadı. Sezon başlangıcında fikstürler oluşturulacak.', 'info');
      }

      // API'den dönen oyuncuları context'e yaz
      // NOT: Profil set etmeyi aşağıdaki loadProfile + freshProfile akışına bırak
      // (BÖLÜM 15.4: iki setProfileState çağrısı race condition'ı önle)
      if (data.players && data.players.length > 0) {
        setSquad(data.players);
      }

      showToast(`${data.leagueName}'te "${teamNameInput}" kuruldu!`, 'success');

      // Verileri yeniden yükle (doğrudan persistence fonksiyonları ile)
      try {
        const freshProfile = await loadProfile(userId);
        if (freshProfile) setProfileState(freshProfile);
        const freshPlayers = await loadPlayers(userId, teamNameInput.trim());
        if (freshPlayers && freshPlayers.length > 0) setSquad(freshPlayers);
      } catch (reloadErr) {
        console.warn('[initTeam] Veri yeniden yükleme hatası (veriler kaydedildi):', reloadErr);
      }
    } catch (err) {
      // API çağrısı başarısız (sunucu çökmüş, ağ hatası vb.)
      // Client-side fallback: doğrudan tarayıcıda profil ve oyuncu oluştur
      console.warn('[initTeam] API fetch failed, using client-side fallback:', err);
      try {
        const BASE_MONEY = 25_000_000;
        const BASE_CREDITS = 250;
        const BASE_REPUTATION = 30;
        const BASE_ACADEMY_LEVEL = 1;

        let startMoney = BASE_MONEY;
        let startCredits = BASE_CREDITS;
        let startReputation = BASE_REPUTATION;
        let startAcademyLevel = BASE_ACADEMY_LEVEL;
        let squadQualityMod = 1.0;

        switch (philosophy) {
          case 'financial': startMoney += 15_000_000; break;
          case 'legend': startCredits += 250; break;
          case 'youth': startAcademyLevel = 3; break;
          case 'squad': squadQualityMod = 1.1; break;
          case 'reputation': startReputation += 20; break;
          default: break;
        }

        const fallbackProfile = {
          id: userId,
          team_name: teamNameInput.trim(),
          league_name: '4. Lig',
          manager_name: managerName.trim(),
          money: startMoney,
          credits: startCredits,
          level: 1,
          xp: 0,
          fans: 1000,
          current_day: 1,
          ticket_price: 35,
          stadium_capacity: 10000,
          region: locale || 'TR',
          philosophy,
          primary_color: color1,
          secondary_color: color2,
          reputation: startReputation,
          academy_level: startAcademyLevel,
          is_bot: false,
          created_at: new Date().toISOString(),
        };

        const posCounts = { GK: 2, DEF: 6, MID: 6, FWD: 5 };
        const playersToInsert: any[] = [];
        Object.entries(posCounts).forEach(([pos, count]) => {
          for (let i = 0; i < count; i++) {
            const p = generateLocalizedPlayer(locale || 'TR', teamNameInput.trim(), 4, pos as any);
            playersToInsert.push({
              ...p,
              rating: Math.min(94, Math.floor(p.rating * squadQualityMod)),
              potential: Math.min(99, Math.floor((p.potential || p.rating + 10) * squadQualityMod)),
              position: pos,
              profile_id: userId,
              team_name: teamNameInput.trim(),
            });
          }
        });

        setProfileState(fallbackProfile);
        setSquad(playersToInsert);

        // localStorage'a kaydet
        try {
          saveProfile(fallbackProfile);
          savePlayers(playersToInsert, userId, teamNameInput.trim());
        } catch (saveErr) {
          console.warn('[initTeam] localStorage save failed:', saveErr);
        }

        showToast(`4. Lig'de "${teamNameInput}" kuruldu! (Çevrimdışı mod)`, 'success');
      } catch (fallbackErr) {
        console.error('[initTeam] Client-side fallback also failed:', fallbackErr);
        showToast('Takım kurulurken bir hata oluştu. Lütfen sayfayı yenileyip tekrar deneyin.', 'error');
      }
    } finally {
      setLoading(false);
    }
  }, [userId, locale]);

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
        // Admin rolünü aynı sorgudan kontrol et (ayrı sorguya gerek yok)
        setIsAdmin(result.data?.role === 'admin');

        // Akademi seviyesini user_academy tablosundan oku (tek kaynak: user_academy.current_level)
        // Eğer user_academy kaydı varsa, profiles.academy_level'ı bu değerle override et
        if (savedProfile) {
          const { data: academyData } = await supabase
            .from('user_academy')
            .select('current_level')
            .eq('profile_id', targetId)
            .maybeSingle();

          if (academyData) {
            savedProfile.academy_level = academyData.current_level;
          }
          // user_academy kaydı yoksa profiles.academy_level varsayılan olarak kalır

          // ─── BÖLÜM 13: Sezon senkronizasyonu ─────────────
          // current_day yerel profilde tutuluyor, diğer oyuncularla farklı olabilir.
          // Lig'in sezonundan current_tur okuyup current_day'i senkronize et.
          // Formül: current_day = (current_tur - 1) * 7 + 1
          // (Her tur 7 gün, tur 1 = gün 1, tur 2 = gün 8, vb.)
          try {
            const { data: userTeam } = await supabase
              .from('league_teams')
              .select('league_id')
              .eq('profile_id', targetId)
              .maybeSingle();

            if (userTeam?.league_id) {
              const { data: seasonData } = await supabase
                .from('seasons')
                .select('current_tur')
                .eq('league_id', userTeam.league_id)
                .eq('is_finished', false)
                .order('created_at', { ascending: false })
                .limit(1)
                .maybeSingle();

              if (seasonData?.current_tur && seasonData.current_tur > 1) {
                const syncedDay = (seasonData.current_tur - 1) * 7 + 1;
                // Sadece yerel gün gerideyse güncelle (ileriye doğru)
                if (savedProfile.current_day < syncedDay) {
                  savedProfile.current_day = syncedDay;
                }
              }
            }
          } catch (syncErr) {
            // Senkronizasyon hatası kritik değil — mevcut current_day ile devam et
            console.warn('[refreshData] Sezon senkronizasyonu hatası:', syncErr);
          }
        }
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
        // IMPORTANT: If a profile is already set in context (e.g., from just-completed
        // registration), don't reset it to null — that would cause an infinite loop
        // (register → setProfile → refreshData → profile=null → ManagerRegistration again).
        setProfileState(prev => {
          if (prev) {
            // Profile already exists in context (e.g., just registered)
            // Keep it and don't reset. Just log a warning.
            console.warn('[refreshData] Supabase read returned no profile, but context already has one. Keeping existing profile.');
            return prev;
          }
          // Genuinely new user — no profile anywhere
          return null;
        });
        setSquad(prev => prev.length > 0 ? prev : []);
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
      
      // 1. Sponsor payouts are handled by /api/cron/weekly-income ONLY (no client-side duplication)
      // The cron job properly calculates weekly revenue including sponsors, TV, and stadium income.
      // Client-side sponsor payments have been removed to prevent double-counting.

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

      // 4. Update Sponsor durations (UI-level countdown, not financial)
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
    setTrainingState((prev: TrainingState) => {
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

  const addMatchRevenue = useCallback((isHome: boolean, leaguePosition?: number, totalTeams?: number) => {
    setProfile((prev: Profile | null) => {
      if (!prev || !isHome) return prev;
      
      try {
        const upgrades = prev.stadium_upgrades || {};
        const capacityLvl = upgrades['capacity'] || 0;
        const ticketPrice = prev.ticket_price ?? 35;
        const pos = leaguePosition ?? 10;
        const teams = totalTeams ?? 18;

        // Use the formula from financialModel
        // stadiumCapacity = 10000 + stadiumLevel * 2000
        const capacity = 10000 + (capacityLvl * 2000);
        const positionFactor = 0.5 + 0.5 * ((teams - pos + 1) / teams);
        const baseAttendance = capacity * positionFactor;
        const priceElasticity = Math.max(0.1, 1 - (ticketPrice - 50) / 100);
        const attendance = Math.floor(Math.min(capacity, baseAttendance * priceElasticity));
        const ticketRevenue = attendance * ticketPrice;

        // Food & Beverage
        const fbRevenue = attendance * 15;

        const totalMatchRevenue = ticketRevenue + fbRevenue;

        return {
          ...prev,
          money: (prev.money || 0) + totalMatchRevenue
        };
      } catch {
        return prev;
      }
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
          return { success: false, reason: `Kulüp teklifi yetersiz buldu. Karşı teklif: ${formatCurrency(counterOffer)}`, counterOffer };
        }
      } else {
        // %80-120 arası: %85 kabul şansı
        const chance = (ratio - 0.8) / 0.4; // 0 to 1
        if (Math.random() < 0.7 + chance * 0.15) {
          accepted = true;
        } else {
          counterOffer = Math.round(effectiveMarketValue * (1.05 + Math.random() * 0.1));
          return { success: false, reason: `Kulüp teklifi yetersiz buldu. Karşı teklif: ${formatCurrency(counterOffer)}`, counterOffer };
        }
      }

      if (accepted) {
        // Komisyon ve Bonus
        const agentCommission = Math.round(offerPrice * 0.05);
        const signingBonus = Math.round(offerPrice * 0.03);
        const totalCost = offerPrice + agentCommission + signingBonus;

        const currentMoney = profile.money || 0;
        if (currentMoney < totalCost) {
          return { success: false, reason: `Yetersiz bütçe. Toplam maliyet (Komisyonlar dahil): ${formatCurrency(totalCost)}. Bütçen: ${formatCurrency(currentMoney)}` };
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

        console.log(`[TRANSFER] ${player.name} → ${profile.team_name}, Bedel: ${formatCurrency(offerPrice)}`);
        playSound('transfer');
        return { success: true, totalCost, agentCommission, signingBonus };
      }

      return { success: false, reason: 'Bilinmeyen bir hata oluştu.' };
    } catch (err: any) {
      console.error('[TRANSFER HATASI]', err);
      return { success: false, reason: `Transfer sırasında hata oluştu: ${err.message || 'Bilinmeyen hata'}` };
    }
  }, [profile, setProfile, setSquad, setLeague]);

  const addSponsor = useCallback(async (sponsor: any) => {
    // Önce state'i güncelle
    const updatedSponsors = [...(profile?.sponsors || []), sponsor];
    setProfile((prev: Profile | null) => ({
      ...prev,
      sponsors: updatedSponsors
    }));
    playSound('success');

    // Sonra doğrudan Supabase'e kaydet (auto-save beklemeden)
    if (isSupabaseConfigured() && userId) {
      const supabase = getSupabase();
      if (supabase) {
        const { error } = await supabase
          .from('profiles')
          .update({ sponsors: updatedSponsors })
          .eq('id', userId);
        if (error) {
          console.error('[addSponsor] Supabase kayıt hatası:', error.message);
        }
      }
    }
  }, [profile, userId, setProfile]);

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
    if (!profile || (profile.money || 0) < 150000) return { success: false, reason: `Yetersiz bütçe (${formatCurrency(150000)} gerekli)` };

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

    // ── Günlük limit kontrolü ──
    const today = new Date().toISOString().split('T')[0];
    const lastFriendly = profile.last_friendly_date;
    const friendlyCount = (lastFriendly === today) ? (profile.daily_friendly_count || 0) : 0;
    if (friendlyCount >= 2) {
      return { success: false, reason: 'Günlük hazırlık maçı limitine ulaştınız (2/2).' };
    }

    if (isPaid && (profile.credits || 0) < 1) {
      return { success: false, reason: 'Yetersiz Kredi (1 Kredi gerekli)' };
    }

    const newCredits = isPaid ? (profile.credits || 0) - 1 : (profile.credits || 0);

    // ── Poisson tabanlı skor hesaplama ──
    const homeAvgRating = squad.slice(0, 11).reduce((s, p) => s + p.rating, 0) / Math.max(1, Math.min(11, squad.length));
    const enemyRating = 60 + Math.random() * 15; // random AI opponent
    const homeGoalLambda = Math.max(0.3, (homeAvgRating - enemyRating) * 0.05 + 1.2);
    const awayGoalLambda = Math.max(0.3, (enemyRating - homeAvgRating) * 0.05 + 1.2);
    const poissonSample = (lambda: number) => {
      let k = 0, p = Math.random();
      while (p > Math.exp(-lambda)) { p *= Math.random(); k++; }
      return Math.min(k, 6);
    };
    const homeScore = poissonSample(homeGoalLambda);
    const awayScore = poissonSample(awayGoalLambda);

    // ── Kondisyon maliyeti: her oyuncu 5-10 cond kaybeder ──
    const updatedSquad = squad.map(p => ({
      ...p,
      cond: Math.max(0, (p.cond || 100) - (5 + Math.floor(Math.random() * 6)))
    }));
    setSquad(updatedSquad);

    const newCount = friendlyCount + 1;
    setProfile((prev: Profile | null) => prev ? {
      ...prev,
      credits: newCredits,
      last_friendly_date: today,
      daily_friendly_count: newCount,
    } : prev);

    if (isSupabaseConfigured()) {
      try {
        const supabase = getSupabase();
        if (!supabase) return { success: false, reason: 'Supabase bağlantı hatası' };

        await supabase.from('profiles').update({
          credits: newCredits,
          // last_friendly_date and daily_friendly_count columns may not exist yet
          // They are saved to localStorage via the state update above
        }).eq('id', profile.id);

        await supabase.from('friendly_matches').insert({
          home_team_id: profile.id,
          away_team_id: 'cpu',
          home_score: homeScore,
          away_score: awayScore,
          home_team_name: profile.team_name || 'Bilinmeyen',
          away_team_name: 'CPU Takımı',
          match_data: { homeAvgRating, enemyRating, simulated: true }
        });

        // Batch update players (only cond changed)
        for (const p of updatedSquad) {
          await supabase.from('players').update({
            cond: p.cond,
          }).eq('id', p.id);
        }
      } catch (err) {
        console.error('[playFriendlyMatch] Supabase error:', err);
      }
    }

    return { success: true, homeScore, awayScore };
  }, [profile, squad, setProfile]);

  const toggleWatchlist = useCallback(async (player: Player) => {
    if (!profile || !player) return;
    
    // Retirement check
    if ((player.age || 0) >= 38) {
      alert('Emekli olmuş oyuncular izleme listesine eklenemez.');
      showToast('Emekli olmuş oyuncular izleme listesine eklenemez.', 'info');
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

  // userId is now derived from authUser.id — no localStorage UUID needed
  // When authUser changes (login/logout), refresh data automatically
  useEffect(() => {
    if (userId) {
      refreshData(userId);
    } else {
      // No user = clear all game state
      setProfileState(null);
      setSquad([]);
      setWatchlist([]);
      setLoading(false);
    }
  }, [userId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Profile check: if user is authenticated but has no profile, show ManagerRegistration

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
      userId,
      authEmail,
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
