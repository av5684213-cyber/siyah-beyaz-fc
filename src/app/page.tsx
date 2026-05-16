'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';

import { calculateMarketValue, getTransferCorridor, formatCurrency } from '@/lib/fm/valuation';
import { INITIAL_TEAM_STATS, INITIAL_SLOTS } from '@/lib/fm/teamStats';
import { processTacticalGrowth, processTacticalDecay } from '@/lib/fm/tacticsEngine';
import TrainingAcademy from '@/components/fm/TrainingAcademy';
import TacticsCommandCenter from '@/components/fm/TacticsCommandCenter';
import PlayerDetailModal from '@/components/fm/PlayerDetailModal';
import ManagerRegistration from '@/components/fm/ManagerRegistration';
import { NavButton } from '@/components/fm/UIComponents';
import { UpdatePlayerStats, processDailyUpdates } from '@/lib/fm/evolution';
import { FitnessManager } from '@/lib/fm/FitnessManager';
import { isTrainingTime } from '@/lib/fm/schedule';
import MatchDay from '@/components/fm/MatchDay';
import LeagueStandings from '@/components/fm/LeagueStandings';
import type { Player, MatchState, LeagueTeam, ActiveTactic, TrainingState } from '@/lib/fm/types';
import { getDefaultActiveTactic, getDefaultTrainingState } from '@/lib/fm/types';
import { runTrainingSession } from '@/lib/fm/trainingEngine';
import { 
  loadProfile, loadPlayers, loadLeague, loadActiveTactic, loadTrainingState,
  saveProfile, savePlayers, saveLeague, saveActiveTactic,
  saveMatchResult, loadLastMatchResult,
  checkConnectionHealth, type ConnectionStatus, resetLeague
} from '@/lib/fm/persistence';
import { isSupabaseConfigured, getSupabase } from '@/lib/supabase';
import { migrateLocalStorageToSupabase, type MigrationResult, checkSupabaseData } from '@/lib/fm/migration';
import { generateStarterPlayer, aiTeamNames, generateEliteWonderkid } from '@/lib/fm/playerGenerator';
import { shouldPlayerRetire, processSeasonEndRetirements } from '@/lib/fm/retirement';
import { updateMatchCareerStats } from '@/lib/fm/careerStats';
import { inductRetiredPlayers } from '@/lib/fm/hallOfFameService';
import { generateFixtureId } from '@/lib/fm/matchChatService';

import { AppHeader } from '@/components/fm/AppHeader';
import { ToastNotifications } from '@/components/fm/ToastNotifications';
import { DashboardTab } from '@/components/fm/DashboardTab';
import MyTeamTab from '@/components/fm/MyTeamTab';
import FixtureTab from '@/components/fm/FixtureTab';
import { FriendlyMatchTab } from '@/components/fm/FriendlyMatchTab';

import OperationRoomTab from '@/components/fm/OperationRoomTab';
import StadiumTab from '@/components/fm/StadiumTab';
import InventoryTab from '@/components/fm/InventoryTab';
import NewspaperTab from '@/components/fm/NewspaperTab';
import MarketTab from '@/components/fm/MarketTab';
import ScoutingTab from '@/components/fm/ScoutingTab';
import AdminPanel from '@/components/fm/AdminPanel';
import TrophyCabinetTab from '@/components/fm/TrophyCabinetTab';
import HallOfFameTab from '@/components/fm/HallOfFameTab';
import MatchChatPanel from '@/components/fm/MatchChatPanel';

import { MultiplayerTab } from '@/components/fm/MultiplayerTab';
import { listPlayerOnMarket, massListPlayers, initFreeAgentsOnMarket, moveTeamToMarket, listAllSquadOnMarket, buyPlayerFromMarket, MarketListing, assignTeamToManager, getTeamSquad } from '@/lib/fm/multiplayer';
import { 
  Trophy, 
  Users, 
  Activity, 
  Settings, 
  LayoutDashboard,
  Shield,
  Swords, 
  Dumbbell,
  Download,
  Globe,
  LogOut,
  Calendar,
  Newspaper,
  TrendingUp,
  ShoppingBag,
  Zap,
  Archive,
  Building2,
  Binoculars,
  ShieldAlert,
  RefreshCw,
  DollarSign,
  Award
} from 'lucide-react';

import { useFM } from '@/lib/fm/GameContext';

import RivalMessagingPanel from '@/components/fm/RivalMessagingPanel';
import MatchChat from '@/components/Chat/MatchChat';
import RivalMessaging from '@/components/Chat/RivalMessaging';
import TeamProfileModal from '@/components/fm/TeamProfileModal';
import MatchReportPanel from '@/components/fm/MatchReportPanel';
import YouthAcademyTab from '@/components/fm/YouthAcademyTab';
import { generateYouthPlayer, generateScoutReport, YouthPlayer, processYouthWeeklyTraining, YOUTH_FACILITIES, getDefaultFacilityState } from '@/lib/fm/youthAcademy';
import { loadYouthPlayers, saveYouthPlayers, loadYouthFacilities, saveYouthFacilities } from '@/lib/fm/persistence';
import { computeSeasonAwardsWithCareerStats, computeSeasonSummary, computeSeasonBadge, saveSeasonAwardsAndSummary, getSeasonId } from '@/lib/fm/seasonAwardsService';
import SeasonAwardsModal from '@/components/fm/SeasonAwardsModal';
import CupTab from '@/components/fm/CupTab';
import FinancialTab from '@/components/fm/FinancialTab';
import TacticsRolesPanel from '@/components/fm/TacticsRolesPanel';
import FixtureScreen from '@/components/fm/FixtureScreen';

import RealTimeLeagueManager from '@/components/fm/RealTimeLeagueManager';

// Duygusal katman — animasyonlar ve ses efektleri
import { Confetti, GoalCelebration, RecordBreak } from '@/components/animations';
import { playSound, isSoundEnabled, setSoundEnabled } from '@/utils/sound';
import { emitEmotionalEvent, type EmotionalEvent } from '@/lib/fm/emotionalEvents';

// UX katman — eğitim, bildirim, ipucu
import OnboardingTutorial, { shouldShowOnboarding } from '@/components/OnboardingTutorial';
import HintBox from '@/components/hints/HintBox';
import { useToast } from '@/hooks/use-toast';

export default function Home() {
  const { 
    userId, setUserId, 
    profile, setProfile, 
    squad, setSquad, 
    activeTactic, setActiveTactic, 
    trainingState, setTrainingState, 
    league, setLeague, 
    selectedTeamProfile, setSelectedTeamProfile,
    directMessageRecipient, setDirectMessageRecipient,
    loading, setLoading, refreshData,
    isAdmin,
    matchState, setMatchState,
    activeTab, setActiveTab
  } = useFM();

  const [sortConfig, setSortConfig] = useState<{ key: string; direction: string }>({ key: 'rating', direction: 'desc' });
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [selectedListing, setSelectedListing] = useState<MarketListing | null>(null);
  const [teamStats, setTeamStats] = useState<Record<string, number>>(INITIAL_TEAM_STATS);
  const [activeSlots, setActiveSlots] = useState<string[]>(INITIAL_SLOTS);
  
  // Yeni sistemler state
  const [playerRoles, setPlayerRoles] = useState<Record<string, string>>({});
  const [activeInstructions, setActiveInstructions] = useState<string[]>([]);
  const [youthFacilities, setYouthFacilities] = useState<Record<string, number>>({});
  const [youthPlayers, setYouthPlayers] = useState<any[]>([]);
  
  const [isTestMode, setIsTestMode] = useState(false);
  
  const [dbStatus, setDbStatus] = useState<ConnectionStatus>('checking');
  const [dbLatency, setDbLatency] = useState<number | null>(null);
  const [migrating, setMigrating] = useState(false);
  const [lastMatch, setLastMatch] = useState<{result: any, homeTeamName: string, awayTeamName: string} | null>(null);
  const [migrationResult, setMigrationResult] = useState<MigrationResult | null>(null);
  const [showMigrationBanner, setShowMigrationBanner] = useState(false);
  const [retiredLog, setRetiredLog] = useState<{ retired: Player[], talents: Player[] } | null>(null);
  const [showTrainingToast, setShowTrainingToast] = useState(false);
  const [transferOffers, setTransferOffers] = useState<Array<{ id: string; fromTeam: string; playerName: string; playerPosition: string; amount: number; status: string; date: string }>>([]);

  // ADIM 4: Sezon sonu ödülleri
  const [showSeasonAwards, setShowSeasonAwards] = useState(false);
  const [lastCompletedSeasonId, setLastCompletedSeasonId] = useState<string>('');

  // ADIM 3: Youth Academy verilerini profile yüklendiğinde çek
  useEffect(() => {
    if (!profile?.id) return;
    let cancelled = false;
    (async () => {
      try {
        const [loadedPlayers, loadedFacilities] = await Promise.all([
          loadYouthPlayers(profile.id),
          loadYouthFacilities(profile.id),
        ]);
        if (!cancelled) {
          if (loadedPlayers.length > 0) setYouthPlayers(loadedPlayers);
          if (Object.keys(loadedFacilities).length > 0) setYouthFacilities(loadedFacilities);
        }
      } catch (err) {
        console.error('[Youth Academy] Veri yükleme hatası:', err);
      }
    })();
    return () => { cancelled = true; };
  }, [profile?.id]);

  const sellPlayer = async (player: Player, price: number) => {
    if (!profile) return;
    const marketValue = calculateMarketValue(player);
    const corridor = getTransferCorridor(marketValue);
    
    if (price < corridor.min || price > corridor.max) {
      alert(`Girilen fiyat (${formatCurrency(price)}) koridor aralığı dışında! (${formatCurrency(corridor.min)} - ${formatCurrency(corridor.max)})`);
      return;
    }

    try {
      const result = await listPlayerOnMarket(player, profile.id, profile.team_name, price, corridor.min, corridor.max);
      if (result.success) {
        // Sync removal from local squad
        setSquad(prev => prev.filter(p => p.id !== player.id));
        
        // Also remove from Supabase players table if connected
        const supabase = getSupabase();
        if (supabase) {
           await supabase.from('players').delete().eq('id', player.id);
        }

        setSelectedPlayer(null);
        setActiveTab('multiplayer');
        alert('Oyuncu başarıyla transfer pazarına ilan edildi!');
      } else {
        alert(`İşlem başarısız: ${result.error}`);
      }
    } catch (err) {
      console.error('Sell player error:', err);
      alert('İşlem sırasında beklenmedik bir hata oluştu.');
    }
  };

  const handleMassList = async () => {
    if (!profile || squad.length === 0) return;
    
    const count = Math.min(squad.length, 380);
    if (!confirm(`${count} oyuncuyu kadronuzdan çıkarıp transfer listesine göndermek istediğinize emin misiniz?`)) return;

    setLoading(true);
    try {
      const playersToList = squad.slice(0, count);
      const result = await massListPlayers(playersToList, profile.id, profile.team_name);
      
      if (result.success || (result.total > 0)) {
        const listedIds = new Set(playersToList.map(p => p.id));
        setSquad(prev => prev.filter(p => !listedIds.has(p.id)));
        
        // Use debounced save or immediate save to persist squad shrinkage
        const supabase = getSupabase();
        if (supabase && profile.id.includes('-')) { // Valid UUID check
           await supabase.from('players').delete().in('id', Array.from(listedIds));
        }

        alert(`İşlem tamamlandı! ${result.total} oyuncu pazara gönderildi.`);
        setActiveTab('multiplayer');
      } else {
        alert(`İşlem başarısız oldu: ${result.errors?.[0] || 'Bilinmeyen hata'}`);
      }
    } catch (err) {
      console.error('Mass list error:', err);
      alert('İşlem sırasında bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const handleBuyMarketPlayer = async (listing: MarketListing) => {
    if (!profile || !userId) return;
    if (profile.money < listing.price) {
      alert('Yetersiz bütçe!');
      return;
    }

    if (confirm(`${listing.player_data.name} oyuncusunu ${formatCurrency(listing.price)} bedelle hemen satın almak istiyor musunuz?`)) {
      setLoading(true);
      try {
        const result = await buyPlayerFromMarket(listing.id, userId, profile.team_name);
        if (result.success) {
          const newSquad = [...squad, result.player];
          setSquad(newSquad);
          setProfile({ ...profile, money: profile.money - result.price });
          setSelectedListing(null);
          setSelectedPlayer(null);
          alert('Transfer başarıyla tamamlandı! Oyuncu kadronuza katıldı.');
        } else {
          alert(`Satın alma hatası: ${result.error}`);
        }
      } catch (err) {
        console.error('Buy error:', err);
        alert('İşlem sırasında bir hata oluştu.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleMoveAllToMarket = async () => {
    if (!profile || squad.length === 0) return;
    if (!confirm(`${squad.length} oyuncuyu pazara taşımak üzeresiniz. Onaylıyor musunuz?`)) return;
    
    setLoading(true);
    try {
      const result = await listAllSquadOnMarket(squad, profile.id, profile.team_name);
      if (result.success) {
        setSquad([]);
        alert(`${result.total} oyuncu transfer pazarına taşındı!`);
        setActiveTab('multiplayer');
      }
    } catch (err) {
      console.error(err);
      alert('İşlem sırasında hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const handleNuke = async () => {
    if (!confirm('DİKKAT: Oyundaki TÜM oyuncular ve lig verileri silinecek. Emin misiniz?')) return;
    if (!confirm('SON UYARI: Bu işlem geri alınamaz. Onaylıyor musunuz?')) return;

    setLoading(true);
    try {
      const result = await resetLeague();
      if (result.success) {
        setSquad([]);
        alert('Tüm veriler başarıyla silindi. Sistem sıfırlandı.');
        window.location.reload();
      } else {
        alert('Sıfırlama işlemi başarısız: ' + (result.error || 'Bilinmeyen hata'));
      }
    } catch (err) {
      console.error(err);
      alert('Sıfırlama sırasında hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const maxMinRef = useRef(90);
  useEffect(() => {
    if (matchState.result?.events && matchState.result.events.length > 0) {
      maxMinRef.current = Math.max(...matchState.result.events.map(e => e.minute));
    } else {
      maxMinRef.current = 90;
    }
  }, [matchState.result]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (matchState.isActive && !matchState.isPaused) {
      const currentMax = maxMinRef.current || 95;
      const tickRate = isTestMode ? 200 : 3000; // Even faster test mode

      if (matchState.minute < currentMax) {
        interval = setInterval(() => {
          setMatchState(prev => {
            const max = maxMinRef.current || 95;
            if (prev.minute >= max) {
              return { ...prev, isFinished: true, isActive: false };
            }
            return { ...prev, minute: prev.minute + 1 };
          });
        }, tickRate);
      } else {
        setMatchState(prev => ({ ...prev, isFinished: true, isActive: false }));
      }
    }
    return () => clearInterval(interval);
  }, [matchState.isActive, matchState.minute, matchState.isPaused, setMatchState, isTestMode]);

  const handleCheckDb = useCallback(async () => {
    if (dbStatus === 'not_configured') {
      alert('Supabase henüz yapılandırılmamış.');
    } else {
      const health = await checkConnectionHealth();
      setDbStatus(health.status);
      setDbLatency(health.latency ?? null);
    }
  }, [dbStatus]);

  useEffect(() => {
    const checkDb = async () => {
      const health = await checkConnectionHealth();
      setDbStatus(health.status);
      setDbLatency(health.latency ?? null);
      
      const last = await loadLastMatchResult();
      if (last) setLastMatch(last);

      if (health.status === 'connected' && isSupabaseConfigured()) {
        if (userId) {
          const counts = await checkSupabaseData(userId);
          if (counts.players === 0) setShowMigrationBanner(true);
        }
        // Move free agents to market on startup if connected
        initFreeAgentsOnMarket();
      }
    };
    checkDb();
    const interval = setInterval(checkDb, 60000);
    return () => clearInterval(interval);
  }, [userId]);

  // Fitness restoration loop
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      if (isTrainingTime(now)) {
        const rehabLevel = teamStats.medical || 1; 
        const intensity = activeTactic.intensity || 'normal';
        setSquad(prev => FitnessManager.restoreFitness(prev, rehabLevel, intensity));
      }
    }, 60000);
    return () => clearInterval(interval);
  }, [squad, activeTactic, teamStats, setSquad]);

  const sortedSquad = useMemo(() => {
    if (!squad || squad.length === 0) return [];
    return [...squad].sort((a, b) => {
      if (sortConfig.key === 'name') return sortConfig.direction === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
      
      let aVal: number = 0;
      let bVal: number = 0;

      const getVal = (p: Player, key: string) => {
        if (key === 'Klt') return p.potential || p.rating;
        if (key === 'Klc') return p.goalkeeping || (p.position === 'GK' ? p.rating * 1.05 : p.rating * 0.12);
        if (key === 'Tk') return p.defending || p.rating;
        if (key === 'Pas') return p.passing || p.rating;
        if (key === 'Sut' || key === 'shooting') return p.shooting || p.rating;
        if (key === 'Kfa') return p.heading || p.rating * 0.95;
        if (key === 'Hız' || key === 'speed') return p.speed || p.rating;
        if (key === 'Güç' || key === 'power') return p.power || p.rating;
        if (key === 'Alg' || key === 'vision') return p.vision || p.rating;
        if (key === 'Top' || key === 'control') return p.control || p.rating;
        if (key === 'total') return p.rating * 11.2;
        if (key === 'fitness' || key === 'cond') return p.fitness || (p as any).cond || 100;
        if (key === 'rating') return p.rating;
        return (p[key as keyof Player] as number) || 0;
      };

      aVal = getVal(a, sortConfig.key);
      bVal = getVal(b, sortConfig.key);

      if (sortConfig.key === 'value') { aVal = calculateMarketValue(a); bVal = calculateMarketValue(b); }
      return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
    });
  }, [squad, sortConfig]);

  const teamAvgStats = useMemo(() => {
    const len = squad.length || 1;
    const safeNum = (v: any) => isNaN(Number(v)) ? 50 : Number(v);
    return {
      speed: Math.round(squad.reduce((acc, p) => acc + safeNum(p.speed || p.rating), 0) / len),
      power: Math.round(squad.reduce((acc, p) => acc + safeNum(p.power || p.rating), 0) / len),
      passing: Math.round(squad.reduce((acc, p) => acc + safeNum(p.passing || p.rating), 0) / len),
      shooting: Math.round(squad.reduce((acc, p) => acc + safeNum(p.shooting || p.rating), 0) / len),
      rating: Math.round(squad.reduce((acc, p) => acc + safeNum(p.rating), 0) / len),
      defending: Math.round(squad.reduce((acc, p) => acc + safeNum(p.defending || p.rating), 0) / len),
    };
  }, [squad]);

  const radarChartData = useMemo(() => {
    const posCounts: Record<string, number> = {};
    squad.forEach(p => { posCounts[p.position] = (posCounts[p.position] || 0) + 1; });
    const topPos = Object.entries(posCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'MID';
    const posRadar: Record<string, Array<{subject: string; A: number}>> = {
      GK: [{ subject: 'KLC', A: teamAvgStats.rating }, { subject: 'TK', A: teamAvgStats.defending }, { subject: 'PAS', A: teamAvgStats.passing }, { subject: 'GÜÇ', A: teamAvgStats.power }, { subject: 'ALG', A: teamAvgStats.rating }],
      DEF: [{ subject: 'TK', A: teamAvgStats.defending }, { subject: 'GÜÇ', A: teamAvgStats.power }, { subject: 'PAS', A: teamAvgStats.passing }, { subject: 'HIZ', A: teamAvgStats.speed }, { subject: 'ALG', A: teamAvgStats.rating }],
      MID: [{ subject: 'PAS', A: teamAvgStats.passing }, { subject: 'TOP', A: teamAvgStats.rating }, { subject: 'ALG', A: teamAvgStats.rating }, { subject: 'HIZ', A: teamAvgStats.speed }, { subject: 'GÜÇ', A: teamAvgStats.power }],
      FWD: [{ subject: 'ŞUT', A: teamAvgStats.shooting }, { subject: 'HIZ', A: teamAvgStats.speed }, { subject: 'PAS', A: teamAvgStats.passing }, { subject: 'GÜÇ', A: teamAvgStats.power }, { subject: 'ALG', A: teamAvgStats.rating }],
    };
    return posRadar[topPos] || posRadar['MID'];
  }, [squad, teamAvgStats]);

  const handleMigrate = useCallback(async () => {
    setMigrating(true);
    try {
      const result = await migrateLocalStorageToSupabase('guest-manager');
      setMigrationResult(result);
      if (result.success) setShowMigrationBanner(false);
    } catch (err) {
      console.error('Migration error:', err);
    } finally {
      setMigrating(false);
    }
  }, []);

  const runEvolution = useCallback(() => {
    const isSeasonEnd = profile && (profile.current_day > 0 && profile.current_day % 34 === 0);
    let updatedSquad = squad.map(player => {
      const performance = 5 + Math.random() * 5;
      let evolved = UpdatePlayerStats(player, performance);
      if (profile?.current_day % 34 === 17 && !evolved.is_retiring) {
        if (shouldPlayerRetire(evolved)) evolved.is_retiring = true;
      }
      return evolved;
    });
    
    // Apply daily updates (injuries, form, morale)
    updatedSquad = processDailyUpdates(updatedSquad);

    if (isSeasonEnd && profile) {
      const { updatedSquad: nextSeasonSquad, retiredPlayers, newTalents } = processSeasonEndRetirements(updatedSquad, profile.id);
      updatedSquad = nextSeasonSquad;
      
      // Stadium Academy Bonus
      const academyLvl = (profile.stadium_upgrades || {})['academy'] || 0;
      if (academyLvl === 10) {
        const eliteWonderkid = generateEliteWonderkid();
        eliteWonderkid.id = `wonderkid-${Date.now()}`;
        newTalents.push(eliteWonderkid);
        updatedSquad.push(eliteWonderkid);
      }

      // ADIM 3: Sezon sonunda genç oyuncuların yaşını büyüt ve kategori güncelle
      setYouthPlayers(prev => {
        const aged = prev.map(yp => {
          const newAge = yp.age + 1;
          const newCategory = newAge <= 17 ? 'U17' : newAge <= 19 ? 'U19' : 'U21';
          // 21 yaşını geçenler otomatik A takıma çıkar (yada serbest kalır)
          if (newAge > 21) return null;
          return { ...yp, age: newAge, category: newCategory };
        }).filter(Boolean) as any[];
        // Sezon sonu genç alımı (akademi seviyesine göre 2-5 oyuncu)
        const academyLevel = profile.academy_level || 1;
        const intakeCount = Math.min(5, 1 + academyLevel);
        const newIntake: any[] = [];
        for (let i = 0; i < intakeCount; i++) {
          const yp = generateYouthPlayer(academyLevel);
          const withReport = { ...yp, scoutReport: generateScoutReport(yp) };
          newIntake.push(withReport);
        }
        const finalList = [...aged, ...newIntake];
        // Supabase'e kaydet
        if (profile.id) {
          saveYouthPlayers(finalList, profile.id);
        }
        return finalList;
      });

      setRetiredLog({ retired: retiredPlayers, talents: newTalents });

      // ADIM 5: Emekli oyuncuları Hall of Fame'e kaydet (asenkron)
      if (retiredPlayers.length > 0 && profile.id) {
        const retiredSeason = getSeasonId(profile.current_day);
        inductRetiredPlayers(retiredPlayers, profile.id, profile.current_day, retiredSeason)
          .then(({ inducted, skipped }) => {
            if (inducted.length > 0) {
              console.log(`[HOF] ${inducted.length} oyuncu Efsaneler Müzesi'ne eklendi`);
              inducted.forEach(entry => {
                if (entry.is_club_legend) {
                  console.log(`[HOF] KULÜP EFSANESİ: ${entry.player_name} (${entry.legend_tier})`);
                }
              });
            }
            if (skipped.length > 0) {
              console.log(`[HOF] ${skipped.length} oyuncu HOF kriterlerini karşılamadı`);
            }
          })
          .catch(err => console.error('[HOF] Induction error:', err));
      }
    }

    // ADIM 3: Haftalık gençlik antrenmanı (her 7 günde bir)
    const currentDay = profile?.current_day ?? 1;
    if (currentDay > 0 && currentDay % 7 === 0 && profile) {
      setYouthPlayers(prev => {
        if (prev.length === 0) return prev;
        // FacilityState[] formatına çevir
        const facilityStates: { facilityId: string; currentLevel: number }[] = YOUTH_FACILITIES.map(f => ({
          facilityId: f.id,
          currentLevel: youthFacilities[f.id] ?? 1,
        }));
        const trained = prev.map(yp => {
          try {
            return processYouthWeeklyTraining(yp, facilityStates);
          } catch {
            return yp; // Hata olursa eski halinde bırak
          }
        });
        // Supabase'e kaydet
        if (profile.id) {
          saveYouthPlayers(trained, profile.id);
        }
        return trained;
      });
    }

    setSquad(updatedSquad);
    setProfile(prev => {
      if (!prev) return prev;
      const stadiumUpgrades = prev.stadium_upgrades || {};
      const storeLvl = stadiumUpgrades['store'] || 0;
      const dailyIncome = storeLvl * 5000;
      return { 
        ...prev, 
        current_day: (prev.current_day || 1) + 1, 
        money: (prev.money || 0) + dailyIncome 
      };
    });

    // Scouting Progress
    if (trainingState?.scouting) {
      const newFoundPlayers: Player[] = [];
      const updatedScouts = trainingState.scouting.scouts.map((s: any) => {
        if (s.status === 'SCOUTING') {
          const remaining = s.remainingDays - 1;
          if (remaining <= 0) {
            // Mission completed!
            const playerCount = 2 + Math.floor(Math.random() * s.stars);
            for(let i=0; i<playerCount; i++) {
              const pos = ['GK', 'DEF', 'MID', 'FWD'][Math.floor(Math.random() * 4)];
              const p = generateStarterPlayer(pos);
              const bonus = (s.stars - 3) * 4; 
              p.rating = Math.max(45, Math.min(94, p.rating + bonus));
              p.potential = Math.max(p.rating, Math.min(99, p.potential + bonus + 2));
              newFoundPlayers.push(p);
            }
            return { ...s, status: 'IDLE', remainingDays: 0, location: undefined };
          }
          return { ...s, remainingDays: remaining };
        }
        return s;
      });

      setTrainingState((prev: any) => ({
        ...prev,
        scouting: {
          ...prev.scouting,
          scouts: updatedScouts,
          foundPlayersPool: [...(prev.scouting.foundPlayersPool || []), ...newFoundPlayers]
        }
      }));
    }

    // Simulated Enemy Attack check (20% chance per day)
    if (Math.random() < 0.2 && profile) {
      import('@/lib/fm/OperationManager').then(({ OperationManager }) => {
        const { updatedState, alertHeader, alertText } = OperationManager.getInstance().simulateEnemyAttack(profile as any, trainingState);
        setTrainingState(updatedState);
        if (alertHeader) {
          alert(`${alertHeader}\n\n${alertText}`);
        }
      });
    }
  }, [squad, profile, setSquad, setProfile, trainingState, setTrainingState]);

  const handleSeasonEnd = useCallback(() => {
    if (!profile) return;
    const seasonId = getSeasonId(profile.current_day);

    // Önce sezon evrimini çalıştır
    runEvolution();

    // Sezon sonu ödüllerini hesapla ve kaydet (asenkron)
    (async () => {
      try {
        // Ödülleri hesapla (career_stats kullanarak)
        const awards = await computeSeasonAwardsWithCareerStats(
          profile.id,
          seasonId,
          squad,
          profile.team_name,
          profile.league_name,
        );

        // Sezon özetini hesapla
        const summary = computeSeasonSummary(
          squad,
          seasonId,
          profile.id,
          profile.team_name,
          profile.league_name,
          league || undefined,
        );

        // Badge hesapla
        const badge = computeSeasonBadge(
          summary.final_position || 0,
          summary.is_champion,
          awards,
          league?.length,
        );

        // Supabase'e kaydet
        await saveSeasonAwardsAndSummary(awards, summary, badge, profile.id);

        // Ödül modalını aç
        setLastCompletedSeasonId(seasonId);
        setShowSeasonAwards(true);
      } catch (err) {
        console.error('[handleSeasonEnd] Award computation error:', err);
      }
    })();
  }, [runEvolution, profile, squad, league]);

  const runTraining = useCallback((sessionType: 'morning' | 'afternoon') => {
    let updatedSquad = [...squad];
    const growth = processTacticalGrowth({ ...teamStats }, activeSlots);
    const decay = processTacticalDecay(growth.newStats, activeSlots);
    setTeamStats(decay.newStats);
    
    // Call the correct function from trainingEngine
    const { updatedSquad: newSquad } = runTrainingSession(updatedSquad, trainingState);
    setSquad(newSquad);
    
    setShowTrainingToast(true);
    setTimeout(() => setShowTrainingToast(false), 5000);
  }, [squad, teamStats, activeSlots, trainingState, setSquad]);

  const handleLogout = () => { setUserId(null); setProfile(null); setSquad([]); };

  const [activeOperations, setActiveOperations] = useState<string[]>([]);

  useEffect(() => {
    if (userId) {
      import('@/lib/fm/persistence').then(({ getMatchPreparations }) => {
        getMatchPreparations(userId).then(preps => {
          if (preps) setActiveOperations(preps.filter(Boolean) as string[]);
        });
      });
    }
  }, [userId, activeTab]);

  const handleSignScoutedPlayer = async (player: Player) => {
    if (!profile) return;
    const signingCost = calculateMarketValue(player) * 0.5;
    if (profile.money < signingCost) {
      alert('Yetersiz bütçe!');
      return;
    }

    if (confirm(`${player.name} ile ${formatCurrency(signingCost)} karşılığında sözleşme imzalamak istiyor musunuz?`)) {
      setSquad(prev => [...prev, player]);
      setProfile({ ...profile, money: profile.money - signingCost });
      
      // Remove from pool
      setTrainingState((prev: any) => ({
        ...prev,
        scouting: {
          ...prev.scouting,
          foundPlayersPool: prev.scouting.foundPlayersPool.filter((p: any) => p.id !== player.id)
        }
      }));

      setSelectedPlayer(null);
      alert('Sözleşme imzalandı! Oyuncu kadronuza katıldı.');
    }
  };

  const homeSquadSlice = useMemo(() => squad.slice(0, 11), [squad]);
  const benchSlice = useMemo(() => squad.slice(11), [squad]);
  const awayTeamSlice = useMemo(() => squad.slice(11, 22).length > 0 ? squad.slice(11, 22) : squad.slice(0, 11), [squad]);

  if (!profile && !loading) {
    return <ManagerRegistration />;
  }

  if (loading) {
    return (
      <div className="h-screen bg-black flex items-center justify-center">
        <Activity className="w-8 h-8 text-white animate-spin opacity-20" />
      </div>
    );
  }

  // ─── Duygusal katman: Gol kutlama state ────────────────────────────
  const [goalCelebrationTrigger, setGoalCelebrationTrigger] = useState(false);
  const [goalScorer, setGoalScorer] = useState<string | undefined>();
  const [goalMinute, setGoalMinute] = useState<number | undefined>();

  // ─── UX katman: Onboarding ve Toast ────────────────────────────
  const [showOnboarding, setShowOnboarding] = useState(false);
  const { toast } = useToast();

  // Onboarding gösterim kontrolü
  useEffect(() => {
    if (profile?.id) {
      setShowOnboarding(shouldShowOnboarding());
    }
  }, [profile?.id]);

  // Maç olaylarını dinle ve gol kutlamasını tetikle
  useEffect(() => {
    if (!matchState.isActive || !matchState.result?.events) return;
    const events = matchState.result.events as Array<{ type: string; player?: string; minute: number; team?: string }>;
    const lastEvent = events[events.length - 1];
    if (lastEvent?.type === 'GOAL' && lastEvent.team === 'HOME') {
      setGoalScorer(lastEvent.player);
      setGoalMinute(lastEvent.minute);
      setGoalCelebrationTrigger(true);
      playSound('goal');
      setTimeout(() => setGoalCelebrationTrigger(false), 2600);
    }
  }, [matchState.result?.events?.length, matchState.isActive]);

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-white selection:text-black">
      {/* Duygusal katman — global animasyonlar */}
      <Confetti autoListen />
      <GoalCelebration trigger={goalCelebrationTrigger} scorer={goalScorer} minute={goalMinute} />
      <RecordBreak autoListen />

      {/* UX katman — Onboarding eğitimi */}
      {showOnboarding && (
        <OnboardingTutorial
          onComplete={(tab) => {
            setShowOnboarding(false);
            if (tab) setActiveTab(tab);
            toast({ title: 'Hoş geldin, Menajer!', description: 'Siyah Beyaz FC artık senin takımın!' });
          }}
          onDismiss={() => setShowOnboarding(false)}
        />
      )}

      {/* UX katman — İpucu kutusu */}
      {profile?.id && !showOnboarding && <HintBox />}

      {/* Ses açma/kapama butonu */}
      <button
        onClick={() => {
          const newState = !isSoundEnabled();
          setSoundEnabled(newState);
          if (newState) playSound('click');
        }}
        className="fixed bottom-4 right-4 z-50 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-zinc-900/90 text-sm backdrop-blur-sm transition-all hover:bg-zinc-800"
        title={isSoundEnabled() ? 'Sesi Kapat' : 'Sesi Aç'}
      >
        {isSoundEnabled() ? '🔊' : '🔇'}
      </button>

      <AppHeader profile={profile} dbStatus={dbStatus} dbLatency={dbLatency} showMigrationBanner={showMigrationBanner} onCheckDb={handleCheckDb} onMigrate={handleMigrate} onNuke={handleNuke} migrating={migrating} />
      <ToastNotifications showTrainingToast={showTrainingToast} migrationResult={migrationResult} onDismissMigration={() => setMigrationResult(null)} />
      <RealTimeLeagueManager />
      
      {/* Global Upgrade Persistence Banner */}
      {profile?.active_upgrade_type && (
        <div className="max-w-7xl mx-auto px-4 mt-4">
           <motion.div 
             initial={{ opacity: 0, scale: 0.95 }}
             animate={{ opacity: 1, scale: 1 }}
             className="bg-besiktas-red text-white p-4 rounded-2xl flex items-center justify-between shadow-xl border border-white/20"
           >
              <div className="flex items-center gap-4">
                 <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center animate-spin">
                    <RefreshCw size={20} />
                 </div>
                 <div>
                    <p className="text-[8px] font-black uppercase tracking-widest opacity-60">GELİŞTİRME SIRASINDAKİ YÜKSELTME</p>
                    <p className="text-xs font-bold uppercase italic">
                      {profile.active_upgrade_type === 'academy' ? 'Yetiştirme Merkezi' : 'Stadyum Tesisi'} • LV. {(profile.stadium_upgrades?.[profile.active_upgrade_id!] || 0) + 1} HEDEFİ
                    </p>
                 </div>
              </div>
              <div className="flex items-center gap-6">
                 <div className="text-right">
                    <p className="text-[8px] font-black uppercase tracking-widest opacity-50">KALAN SÜRE</p>
                    <p className="text-sm font-black italic tracking-tighter">{(profile?.active_upgrade_finish_day || 0) - (profile?.current_day || 0)} GÜN</p>
                 </div>
                 <button 
                  onClick={() => setActiveTab('stadium')}
                  className="px-4 py-2 bg-black/20 hover:bg-black/40 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all"
                 >
                  DETAYLARI GÖR
                 </button>
              </div>
           </motion.div>
        </div>
      )}
      <main className="max-w-7xl mx-auto p-4 pb-32">
        <div className="flex flex-col lg:flex-row gap-6">
          <nav className="flex flex-row lg:flex-col gap-1 bg-gradient-to-b from-zinc-900 to-black p-3 rounded-2xl border border-white/5 lg:w-64 h-fit sticky top-[100px] z-40">
            <div className="hidden lg:block pb-4 mb-3 border-b border-white/5">
              <div className="flex items-center gap-3 px-2">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg shadow-white/5 rotate-0 transition-transform"><Shield size={20} className="text-black" /></div>
                <div>
                  <p className="text-sm font-black uppercase tracking-wider text-white">MANAGER Pro</p>
                  <p className="text-[9px] uppercase tracking-widest text-white/30 font-bold">Football Sim</p>
                </div>
              </div>
            </div>

            <NavButton icon={<LayoutDashboard size={18} />} label="DASHBOARD" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
            {isAdmin && (
              <NavButton icon={<Shield size={18} />} label="ADMİN PANEL" active={activeTab === 'admin'} onClick={() => setActiveTab('admin')} className="!text-red-500 !border-red-500/20 bg-red-500/5 shadow-[0_0_15px_rgba(239,68,68,0.1)]" />
            )}
            <NavButton icon={<Building2 size={18} />} label="YERLEŞKE" active={activeTab === 'stadium'} onClick={() => setActiveTab('stadium')} />
            <NavButton icon={<Binoculars size={18} />} label="GÖZLEMCİLİK" active={activeTab === 'scouting'} onClick={() => setActiveTab('scouting')} />
            <NavButton icon={<Settings size={18} />} label="TAKTİK&TAKIMIM" active={activeTab === 'tactics'} onClick={() => setActiveTab('tactics')} />
            <NavButton icon={<Dumbbell size={18} />} label="ANTRENMAN" active={activeTab === 'training'} onClick={() => setActiveTab('training')} />

            <NavButton icon={<Zap size={18} />} label="OPERASYON ODASI" active={activeTab === 'operations'} onClick={() => setActiveTab('operations')} />
            <NavButton icon={<Archive size={18} />} label="ARŞİV & ENVANTER" active={activeTab === 'inventory'} onClick={() => setActiveTab('inventory')} />
            <NavButton icon={<Newspaper size={18} />} label="HABERLER" active={activeTab === 'newspaper'} onClick={() => setActiveTab('newspaper')} />

            <NavButton icon={<Swords size={18} />} label="MAÇ GÜNÜ" active={activeTab === 'matchday'} onClick={() => setActiveTab('matchday')} />
            <NavButton icon={<Activity size={18} />} label="HAZIRLIK MAÇI" active={activeTab === 'friendly'} onClick={() => setActiveTab('friendly')} />
            <NavButton icon={<Calendar size={18} />} label="FİKSTÜR" active={activeTab === 'fixtures'} onClick={() => setActiveTab('fixtures')} />
            <NavButton icon={<Trophy size={18} />} label="LİG" active={activeTab === 'league'} onClick={() => setActiveTab('league')} />

            <div className="mt-4 px-3 py-1 mb-2 border-t border-white/5 pt-4 group">
               <p className="text-[8px] font-black tracking-widest text-white/20 uppercase mb-2 group-hover:text-emerald-400 transition-colors">EKONOMİ</p>
               <NavButton icon={<Globe size={18} />} label="TRANSFER PAZARI" active={activeTab === 'multiplayer'} onClick={() => setActiveTab('multiplayer')} />
               <NavButton icon={<ShoppingBag size={18} />} label="MAĞAZA" active={activeTab === 'market'} onClick={() => setActiveTab('market')} />
               <NavButton icon={<DollarSign size={18} />} label="FİNANSAL" active={activeTab === 'financial'} onClick={() => setActiveTab('financial')} />
            </div>
            
            <div className="mt-4 px-3 py-1 mb-2 border-t border-white/5 pt-4 group">
               <p className="text-[8px] font-black tracking-widest text-white/20 uppercase mb-2 group-hover:text-amber-400 transition-colors">AKADemi & KUPA</p>
               <NavButton icon={<Users size={18} />} label="GENÇLİK AKAD." active={activeTab === 'youth'} onClick={() => setActiveTab('youth')} />
               <NavButton icon={<Trophy size={18} />} label="KUPALAR" active={activeTab === 'cups'} onClick={() => setActiveTab('cups')} />
               <NavButton icon={<Award size={18} />} label="ÖDÜLLER" active={activeTab === 'awards'} onClick={() => setActiveTab('awards')} />
               <NavButton icon={<Building2 size={18} />} label="EFSANELER" active={activeTab === 'hof'} onClick={() => setActiveTab('hof')} />
            </div>
            
            <div className="mt-6 pt-4 border-t border-white/5 space-y-1">
              <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest text-white/30 hover:text-white hover:bg-white/5 transition-all"><LogOut size={14} /> ÇIKIŞ YAP</button>
            </div>
          </nav>
          <section className="flex-1 min-h-[600px]">
            <AnimatePresence mode="wait">
              {activeTab === 'dashboard' && (
                <DashboardTab 
                  squad={squad} 
                  teamAvgStats={teamAvgStats} 
                  profile={profile} 
                  retiredLog={retiredLog}
                  onClearRetiredLog={() => setRetiredLog(null)}
                  onNextSeason={handleSeasonEnd}
                  onNavigate={(tab) => setActiveTab(tab)}
                  onRunTraining={runTraining}
                  onRunEvolution={runEvolution}
                  isAdmin={isAdmin}
                  transferOffers={transferOffers}
                />
              )}
              {activeTab === 'admin' && isAdmin && (
                <motion.div key="admin" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <AdminPanel />
                </motion.div>
              )}
              {activeTab === 'stadium' && userId && profile && (
                <motion.div key="stadium" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <StadiumTab />
                </motion.div>
              )}
              {activeTab === 'matchday' && (
                <motion.div key="matchday" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <div className="flex gap-3">
                    {/* Match Simulation */}
                    <div className="flex-1 h-[750px] rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl">
                      <MatchDay 
                    profile={profile}
                    activeOperations={activeOperations}
                    homeTeam={homeSquadSlice} 
                    bench={benchSlice} 
                    awayTeam={awayTeamSlice} 
                    matchState={matchState} 
                    setMatchState={setMatchState} 
                    activeTactic={activeTactic} 
                    onPlayerClick={setSelectedPlayer} 
                    isTestMode={isTestMode}
                    setIsTestMode={setIsTestMode}
                    lastMatch={lastMatch}
                    onStartReplay={(replayData) => {
                      const initialConditions: Record<string, number> = {};
                      squad.slice(0, 11).forEach(p => initialConditions[p.id] = (p.cond || 100));
                      
                      setMatchState({
                        minute: 0,
                        score: { home: 0, away: 0 },
                        result: replayData.result,
                        visibleEvents: [],
                        matchSummaryEvents: { home: [], away: [] },
                        isActive: true,
                        isFinished: false,
                        isPaused: false,
                        playerConditions: initialConditions,
                        isReplay: true
                      });
                    }}
                    onMatchEnd={(results) => {
                      const isFriendly = activeTab === 'friendly';
                      
                      let attendance = 0;
                      let revenue = 0;
                      if (!isFriendly && profile) {
                        const stadiumUpgrades = profile.stadium_upgrades || {};
                        const capLevel = stadiumUpgrades['capacity'] || 0;
                        const stadiumCapacity = 5000 + (capLevel * 10000);

                        const ticketPrice = profile.ticket_price || 20;
                        const opponentRank = Math.floor(Math.random() * 18) + 1;
                        let demandMultiplier = 1.0;
                        if (opponentRank > 2) {
                          demandMultiplier = 1.0 - (opponentRank - 2) * 0.05;
                        }
                        demandMultiplier = Math.max(0.3, demandMultiplier);
                        const priceImpact = Math.max(0.1, 1.5 - (ticketPrice / 40));
                        attendance = Math.floor(stadiumCapacity * demandMultiplier * priceImpact);
                        attendance = Math.min(stadiumCapacity, attendance);
                        
                        const mediaLevel = stadiumUpgrades['media'] || 0;
                        const vipLevel = stadiumUpgrades['vip'] || 0;

                        let baseRevenue = attendance * ticketPrice;
                        if (mediaLevel === 10) baseRevenue *= 2; 
                        else baseRevenue *= (1 + mediaLevel * 0.1);

                        let vipBonus = 0;
                        if (vipLevel === 10) vipBonus = 500000;
                        else vipBonus = (vipLevel * 25000);

                        revenue = Math.floor(baseRevenue + vipBonus);
                      }

                      const evolvedSquad = squad.map(p => {
                        const newRatings = [...(p.match_ratings || [])];
                        const isStarter = squad.slice(0, 11).some(sp => sp.id === p.id);
                        if (isStarter) {
                          newRatings.push(6 + Math.random() * 3.5);
                          if (newRatings.length > 5) newRatings.shift();
                        }
                        const intensityMult = ((activeTactic as any).intensity === 'high' ? 1.5 : ((activeTactic as any).intensity === 'low' ? 0.8 : 1.0));
                        const staminaFactor = (p.stamina || 50) / 100;
                        const loss = isFriendly 
                           ? 5 
                           : Math.floor((10 + Math.random() * 15) * intensityMult * (1.2 - staminaFactor));
                        const fitnessGain = isFriendly ? 10 : 0;
                        return { 
                          ...p, 
                          fitness: Math.max(0, Math.min(100, p.fitness - loss + fitnessGain)),
                          match_ratings: newRatings
                        };
                      });
                      setSquad(evolvedSquad);

                      import('@/lib/fm/OperationManager').then(({ OperationManager }) => {
                        const { updatedState, scandalOccured } = OperationManager.getInstance().resolveOperations(trainingState);
                        setTrainingState(updatedState);
                        if (scandalOccured) {
                          setProfile((prev: any) => ({
                            ...prev,
                            money: Math.max(0, (prev.money || prev.budget) - 500000),
                            reputation: Math.max(0, (prev.reputation || 0) - 10)
                          }));
                        }
                      });

                      if (profile) {
                        saveMatchResult(profile.id, results, profile.team_name || 'Siyah Beyaz FC', 'Rakip Takım');
                        setLastMatch({ 
                          result: results, 
                          homeTeamName: profile.team_name || 'Siyah Beyaz FC', 
                          awayTeamName: 'Rakip Takım' 
                        });
                        
                        if (revenue > 0) {
                          setProfile((prev: any) => ({ ...prev, money: (prev.money || 0) + revenue }));
                          alert(`Maç Sonu Özeti:\nSeyirci: ${attendance}\nBilet Geliri: ${new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'EUR' }).format(revenue)}`);
                        }
                        if (isFriendly && isSupabaseConfigured()) {
                          import('@/lib/supabase').then(({ getSupabase }) => {
                            const supabase = getSupabase();
                            supabase.from('friendly_matches').insert({
                              home_team_id: profile.id,
                              away_team_id: 'cpu',
                              home_score: results.score.home,
                              away_score: results.score.away,
                              match_data: results
                            }).then(() => {});
                          });
                        }
                        if (!isFriendly) {
                          const seasonId = `season-${Math.ceil((profile.current_day || 1) / 34)}`;
                          // En yüksek rating'li oyuncuyu MotM olarak belirle
                          let motmPlayerId = '';
                          let motmRating = 0;
                          homeSquadSlice.forEach(p => {
                            const r = results.playerRatings[p.id] || 0;
                            if (r > motmRating) { motmRating = r; motmPlayerId = p.id; }
                          });
                          // Kaleci clean sheet kontrolü: rakip golü 0 ise kaleci clean sheet yapar
                          const awayGoals = results.score.away;
                          homeSquadSlice.forEach(player => {
                            const rating = results.playerRatings[player.id] || 6.0;
                            const stats = results.playerStats[player.id] || { goals: 0, assists: 0, yellowCards: 0, redCards: 0, fouls: 0 };
                            const isGK = player.position === 'GK';
                            const isMotm = player.id === motmPlayerId;
                            const gkSaves = isGK ? (stats as any).saves || Math.floor(Math.random() * 5) + 1 : 0;
                            updateMatchCareerStats(player.id, seasonId, profile.id, {
                              goals: stats.goals,
                              assists: stats.assists,
                              yellowCards: stats.yellowCards || 0,
                              redCards: stats.redCards || 0,
                              fouls: stats.fouls || Math.floor(Math.random() * 3),
                              rating: rating,
                              cleanSheet: isGK && awayGoals === 0,
                              isMotm: isMotm,
                              saves: gkSaves,
                              position: player.position,
                              playerRating: player.rating,
                            });
                          });
                        }
                      }
                    }} />
                    </div>
                    {/* Match Chat Panel */}
                    {profile && (
                      <div className="w-80 h-[750px] flex-shrink-0">
                        <MatchChatPanel
                          fixtureId={generateFixtureId(profile.current_day, awayTeamSlice[0]?.name)}
                          profileId={profile.id}
                          teamName={profile.team_name}
                          currentMinute={matchState.minute}
                        />
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
              {activeTab === 'friendly' && (
                <FriendlyMatchTab />
              )}
              {activeTab === 'tactics' && (
                <motion.div key="tactics" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <div className="pb-20">
                    <TacticsCommandCenter 
                      isAdmin={isAdmin} 
                      userId={userId || ''} 
                      squad={squad} 
                      activeTactic={activeTactic} 
                      onActiveTacticChange={setActiveTactic} 
                      onSquadUpdate={setSquad} 
                      playerConditions={matchState.playerConditions}
                      onPlayerClick={setSelectedPlayer}
                      transferOffers={transferOffers}
                    />
                  </div>
                </motion.div>
              )}
              {activeTab === 'training' && <motion.div key="training" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}><TrainingAcademy isAdmin={isAdmin} squad={squad} trainingState={trainingState} onTrainingStateChange={setTrainingState} onSquadUpdate={setSquad} onPlayerClick={setSelectedPlayer} /></motion.div>}
              {activeTab === 'scouting' && <motion.div key="scouting" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}><ScoutingTab isAdmin={isAdmin} onPlayerClick={setSelectedPlayer} /></motion.div>}
              {activeTab === 'league' && <motion.div key="league" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}><LeagueStandings isAdmin={isAdmin} /></motion.div>}
              {activeTab === 'fixtures' && profile && (
                <motion.div key="fixtures" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <FixtureTab 
                    teamName={profile.team_name} 
                    teamId={profile.id} 
                    currentWeek={profile.current_day || 12} 
                    onNavigateToMatch={() => setActiveTab('matchday')}
                  />
                </motion.div>
              )}
              {activeTab === 'operations' && (
                <motion.div key="operations" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <OperationRoomTab userId={userId || undefined} />
                </motion.div>
              )}
              {activeTab === 'inventory' && (
                <motion.div key="inventory" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <InventoryTab userId={userId || undefined} onMarketRedirect={() => setActiveTab('market')} />
                </motion.div>
              )}
              {activeTab === 'newspaper' && (
                <motion.div key="newspaper" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <NewspaperTab />
                </motion.div>
              )}
              {activeTab === 'market' && (
                <motion.div key="market" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <MarketTab />
                </motion.div>
              )}
              {activeTab === 'multiplayer' && userId && profile && (
                <MultiplayerTab 
                  userId={userId} 
                  profile={profile} 
                  squad={squad} 
                  onSetSquad={setSquad} 
                  onSetProfile={setProfile}
                  onPlayerClick={setSelectedPlayer}
                  onListingClick={(listing) => {
                    setSelectedPlayer(listing.player_data);
                    setSelectedListing(listing);
                  }}
                  teamName={profile?.team_name || 'Siyah Beyaz FC'}
                  isAdmin={isAdmin}
                />
              )}
              {activeTab === 'financial' && profile && (
                <motion.div key="financial" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <FinancialTab
                    money={profile.money}
                    weeklyRevenue={500000}
                    weeklyExpenses={300000}
                    sponsors={[]}
                    broadcastDeal={null}
                    squadSize={squad.length}
                    stadiumCapacity={profile.stadium_capacity || 5000}
                    ticketPrice={profile.ticket_price || 20}
                    leaguePosition={1}
                    onAcceptSponsor={() => {}}
                  />
                </motion.div>
              )}
              {activeTab === 'youth' && (
                <motion.div key="youth" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <YouthAcademyTab
                    academyLevel={profile.academy_level || 1}
                    facilities={youthFacilities as any}
                    onUpgradeFacility={(id, cost) => {
                      if ((profile.money || 0) >= cost) {
                        // Bütçeden düş
                        setProfile(p => ({ ...p, money: (p.money || 0) - cost }));
                        // Tesis seviyesini güncelle
                        const newFacilities = { ...youthFacilities, [id]: (youthFacilities[id] || 1) + 1 };
                        setYouthFacilities(newFacilities);
                        // Supabase'e kaydet
                        if (profile.id) {
                          saveYouthFacilities(newFacilities, profile.id);
                        }
                      }
                    }}
                    onPromotePlayer={(youthPlayer: YouthPlayer) => {
                      // Genç oyuncuyu A takım oyuncusuna dönüştür
                      const promotedPlayer: Player = {
                        id: youthPlayer.id.replace('youth_', 'p_'),
                        name: youthPlayer.name,
                        position: youthPlayer.position,
                        specificPosition: youthPlayer.specificPosition,
                        rating: youthPlayer.rating,
                        age: youthPlayer.age,
                        potential: youthPlayer.potential,
                        hidden_potential: youthPlayer.hidden_potential,
                        market_value: Math.round(Math.pow(youthPlayer.rating, 2.5) * 3000),
                        salary: Math.round(youthPlayer.rating * 800 + 5000),
                        nation: 'TR',
                        club: profile.team_name,
                        defending: youthPlayer.defending,
                        passing: youthPlayer.passing,
                        shooting: youthPlayer.shooting,
                        speed: youthPlayer.speed,
                        power: youthPlayer.power,
                        goalkeeping: youthPlayer.goalkeeping ?? 10,
                        finishing: youthPlayer.finishing,
                        dribbling: youthPlayer.dribbling,
                        firstTouch: youthPlayer.firstTouch,
                        crossing: youthPlayer.crossing,
                        marking: youthPlayer.marking,
                        tackling: youthPlayer.tackling,
                        technique: youthPlayer.technique,
                        longShots: youthPlayer.longShots,
                        offTheBall: youthPlayer.offTheBall,
                        heading: youthPlayer.heading,
                        aggression: youthPlayer.aggression,
                        bravery: youthPlayer.bravery,
                        workRate: youthPlayer.workRate,
                        decisions: youthPlayer.decisions,
                        determination: youthPlayer.determination,
                        concentration: youthPlayer.concentration,
                        leadership: youthPlayer.leadership,
                        anticipation: youthPlayer.anticipation,
                        flair: youthPlayer.flair,
                        positioning: youthPlayer.positioning,
                        composure: youthPlayer.composure,
                        teamwork: youthPlayer.teamwork,
                        vision: youthPlayer.vision,
                        agility: youthPlayer.agility,
                        balance: youthPlayer.balance,
                        strength: youthPlayer.strength,
                        acceleration: youthPlayer.acceleration,
                        jumping: youthPlayer.jumping,
                        cond: youthPlayer.cond,
                        form: youthPlayer.form,
                        morale: youthPlayer.morale,
                        confidence: youthPlayer.confidence,
                        traits: youthPlayer.traits,
                        personalityTraits: youthPlayer.personalityTraits,
                        traitLevels: youthPlayer.traitLevels,
                        form_rating: 50,
                        injury_history: [],
                        suspended_until: undefined,
                        is_injured: youthPlayer.injured,
                        injury_end_date: undefined,
                      };
                      // A takıma ekle
                      setSquad(prev => [...prev, promotedPlayer]);
                      // Genç listeden çıkar
                      setYouthPlayers(prev => prev.filter(p => p.id !== youthPlayer.id));
                    }}
                    budget={profile.money || 0}
                    youthPlayers={youthPlayers}
                    onYouthPlayersChange={(newPlayers) => {
                      setYouthPlayers(newPlayers);
                      // Supabase'e kaydet
                      if (profile.id) {
                        saveYouthPlayers(newPlayers, profile.id);
                      }
                    }}
                  />
                </motion.div>
              )}
              {activeTab === 'cups' && (
                <motion.div key="cups" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <CupTab cupSeasons={[]} teamName={profile?.team_name || ''} />
                </motion.div>
              )}
              {activeTab === 'awards' && profile && (
                <motion.div key="awards" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <TrophyCabinetTab profileId={profile.id} teamName={profile.team_name} />
                </motion.div>
              )}
              {activeTab === 'hof' && profile && (
                <motion.div key="hof" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <HallOfFameTab profileId={profile.id} teamName={profile.team_name} />
                </motion.div>
              )}
            </AnimatePresence>
          </section>
        </div>
      </main>
      <AnimatePresence>
        {selectedPlayer && (
          <PlayerDetailModal 
            player={selectedPlayer} 
            onClose={() => {
              setSelectedPlayer(null);
              setSelectedListing(null);
            }} 
            teamStats={teamStats} 
            onSell={sellPlayer} 
            marketListing={selectedListing || undefined}
            onBuy={handleBuyMarketPlayer}
            onSign={trainingState?.scouting?.foundPlayersPool?.some(p => p.id === selectedPlayer.id) ? handleSignScoutedPlayer : undefined}
            trainingState={trainingState}
            onTrainingStateChange={setTrainingState}
            profileMoney={profile?.money}
            profileTeamName={profile?.team_name}
            isAdmin={isAdmin}
          />
        )}
        {selectedTeamProfile && (
           <TeamProfileModal 
              teamName={selectedTeamProfile}
              onClose={() => setSelectedTeamProfile(null)}
              onMessage={(team) => {
                setDirectMessageRecipient(team);
                setSelectedTeamProfile(null);
              }}
              onOffer={(p) => {
                setSelectedPlayer(p);
                setSelectedTeamProfile(null);
              }}
           />
        )}
      </AnimatePresence>

      {/* ADIM 4: Sezon Sonu Ödüller Modal */}
      {profile && lastCompletedSeasonId && (
        <SeasonAwardsModal
          isOpen={showSeasonAwards}
          onClose={() => setShowSeasonAwards(false)}
          profileId={profile.id}
          seasonId={lastCompletedSeasonId}
          teamName={profile.team_name}
        />
      )}

      {userId && profile && (
        <RivalMessagingPanel 
          userId={userId}
          userName={profile.manager_name || 'Manager'}
          teamName={profile.team_name || 'Siyah Beyaz FC'}
        />
      )}
    </div>
  );
}
