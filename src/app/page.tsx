'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FootballLoader } from '@/components/ui/FootballLoader';

import { calculateMarketValue, getTransferCorridor, formatCurrency } from '@/lib/fm/valuation';
import { calculateLoanFeeEuro } from '@/lib/fm/inflation';
import { toTitleCase } from '@/lib/fm/ui-helpers';
import { INITIAL_TEAM_STATS, INITIAL_SLOTS } from '@/lib/fm/teamStats';
import { processTacticalGrowth, processTacticalDecay } from '@/lib/fm/tacticsEngine';
import { calculateTacticalScore } from '@/lib/fm/tacticsRoles';
import TrainingAcademy from '@/components/fm/TrainingAcademy';
import TacticsCommandCenter from '@/components/fm/TacticsCommandCenter';
import PlayerDetailModal from '@/components/fm/PlayerDetailModal';
import ManagerRegistration from '@/components/fm/ManagerRegistration';
import { NavButton } from '@/components/fm/UIComponents';
import { processEvolutionDay } from '@/lib/fm/evolutionDayService';

import MatchDay from '@/components/fm/MatchDay';
import LeagueStandings from '@/components/fm/LeagueStandings';
import type { Player, MatchState, LeagueTeam, ActiveTactic, TrainingState } from '@/lib/fm/types';
import { getDefaultActiveTactic, getDefaultTrainingState } from '@/lib/fm/types';
import { runTrainingSession } from '@/lib/fm/trainingEngine';
import { 
  loadProfile, loadPlayers, loadLeague, loadActiveTactic, loadTrainingState,
  saveProfile, savePlayers, saveLeague, saveActiveTactic,
  saveMatchResult,
  resetLeague
} from '@/lib/fm/persistence';
import { isSupabaseConfigured, getSupabase } from '@/lib/supabase';
import { updateLeagueStandingsAfterClientMatch } from '@/lib/fm/league';

import { updateMatchCareerStats } from '@/lib/fm/careerStats';
import { generateFixtureId } from '@/lib/fm/unifiedMessagingService';

import { AppHeader } from '@/components/fm/AppHeader';
import { ToastNotifications } from '@/components/fm/ToastNotifications';
import { DashboardTab } from '@/components/fm/DashboardTab';
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
import { listPlayerOnMarket, massListPlayers, moveTeamToMarket, listAllSquadOnMarket, buyPlayerFromMarket, MarketListing, assignTeamToManager, getTeamSquad } from '@/lib/fm/multiplayer';
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
  Award,
  Bell,
  Cog
} from 'lucide-react';

import { useFM } from '@/lib/fm/GameContext';
import { useDbHealth } from '@/lib/fm/useDbHealth';
import { useYouthAcademy } from '@/lib/fm/useYouthAcademy';
import { useCupSeasons } from '@/lib/fm/useCupSeasons';
import { useActiveOperations } from '@/lib/fm/useActiveOperations';
import { useMatchContext } from '@/lib/fm/MatchContext';
import NotificationSettings from '@/components/fm/NotificationSettings';
import ThemeToggle from '@/components/ThemeToggle';

// ── Upgrade Countdown Component for global banner ──
function UpgradeCountdown({ endAt }: { endAt: string }) {
  const [timeLeft, setTimeLeft] = useState<{ d: number; h: number; m: number; s: number } | null>(null);

  useEffect(() => {
    const calc = () => {
      const diff = new Date(endAt).getTime() - Date.now();
      if (diff <= 0) { setTimeLeft({ d: 0, h: 0, m: 0, s: 0 }); return; }
      setTimeLeft({
        d: Math.floor(diff / 86400000),
        h: Math.floor((diff % 86400000) / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      });
    };
    calc();
    const iv = setInterval(calc, 1000);
    return () => clearInterval(iv);
  }, [endAt]);

  if (!timeLeft) return <p className="text-xs font-black italic tracking-tighter">...</p>;
  return (
    <p className="text-xs font-black italic tracking-tighter tabular-nums">
      {timeLeft.d > 0 && <>{timeLeft.d}g </>}{String(timeLeft.h).padStart(2,'0')}:{String(timeLeft.m).padStart(2,'0')}:{String(timeLeft.s).padStart(2,'0')}
    </p>
  );
}

import RivalMessagingPanel from '@/components/fm/RivalMessagingPanel';
import TeamProfileModal from '@/components/fm/TeamProfileModal';
import YouthAcademyTab from '@/components/fm/YouthAcademyTab';
import type { YouthPlayer } from '@/lib/fm/youthAcademy';
import { saveYouthPlayers, saveYouthFacilities, saveCredits } from '@/lib/fm/persistence';
import { computeSeasonAwardsWithCareerStats, computeSeasonSummary, computeSeasonBadge, saveSeasonAwardsAndSummary, getSeasonId } from '@/lib/fm/seasonAwardsService';
import SeasonAwardsModal from '@/components/fm/SeasonAwardsModal';
import NewSeasonBriefing from '@/components/fm/NewSeasonBriefing';
import CupTab from '@/components/fm/CupTab';
import FinancialTab from '@/components/fm/FinancialTab';

import DailyTasksWidget from '@/components/fm/DailyTasksWidget';
import QuickDecisionCard from '@/components/fm/QuickDecisionCard';
import DissatisfactionPanel from '@/components/fm/DissatisfactionPanel';
import WatchlistAlertPanel from '@/components/fm/WatchlistAlertPanel';
import TransferNegotiationPanel from '@/components/fm/TransferNegotiationPanel';
import AgentInboxPanel from '@/components/fm/AgentInboxPanel';
import MatchReportPanel from '@/components/fm/MatchReportPanel';
import PlayerComparisonModal from '@/components/fm/PlayerComparisonModal';
import MentorAssignment from '@/components/fm/MentorAssignment';
import RivalInfoModal from '@/components/fm/RivalInfoModal';
import WeeklyReportTab from '@/components/fm/WeeklyReportTab';
import SwipeablePlayerCard from '@/components/fm/SwipeablePlayerCard';
import ConfidenceIndicator from '@/components/fm/ConfidenceIndicator';
import { applyTeamColors } from '@/lib/fm/themeSystem';

import RealTimeLeagueManager from '@/components/fm/RealTimeLeagueManager';

// Duygusal katman — animasyonlar ve ses efektleri
import { Confetti, GoalCelebration, RecordBreak } from '@/components/animations';
import { playSound, isSoundEnabled, setSoundEnabled } from '@/utils/sound';
import { useEmotionalEvents } from '@/lib/fm/useEmotionalEvents';
import { useOnboarding } from '@/lib/fm/useOnboarding';

// UX katman — eğitim, bildirim, ipucu
import OnboardingTutorial from '@/components/OnboardingTutorial';
import HintBox from '@/components/hints/HintBox';
import MobileBottomNav from '@/components/fm/MobileBottomNav';
import { useToast } from '@/hooks/use-toast';
import { useConfirm } from '@/hooks/use-confirm'; // DÜZELTME 8: confirm() → AlertDialog
import { useAuth } from '@/contexts/AuthContext';

export default function Home() {
  const { confirm, ConfirmDialog } = useConfirm(); // DÜZELTME 8
  const { 
    userId,
    profile, setProfile, 
    squad, setSquad, 
    activeTactic, setActiveTactic, 
    trainingState, setTrainingState, 
    league, setLeague, 
    selectedTeamProfile, setSelectedTeamProfile,
    directMessageRecipient, setDirectMessageRecipient,
    loading, setLoading, refreshData,
    isAdmin,
    activeTab, setActiveTab
  } = useFM();
  const { signOut: authSignOut, user: authUser, loading: authLoading } = useAuth();
  const { matchState, setMatchState } = useMatchContext();

  const [sortConfig, setSortConfig] = useState<{ key: string; direction: string }>({ key: 'rating', direction: 'desc' });
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [selectedListing, setSelectedListing] = useState<MarketListing | null>(null);
  const [teamStats, setTeamStats] = useState<Record<string, number>>(INITIAL_TEAM_STATS);
  const [activeSlots, setActiveSlots] = useState<string[]>(INITIAL_SLOTS);
  
  // Yeni sistemler state
  const [playerRoles, setPlayerRoles] = useState<Record<string, string>>({});
  const [activeInstructions, setActiveInstructions] = useState<string[]>([]);

  // Taktik skoru hesaplama — TacticsCommandCenter ile aynı mantık
  const tacticalScore = useMemo(() => {
    try {
      if (!squad || squad.length === 0 || !activeTactic) return undefined;
      const starters = squad.slice(0, 11);
      const squadSlots = starters.map(p => ({
        player: p,
        position: (p.specificPosition || p.position) as any,
        roleId: playerRoles[p.id] || 'no_role',
      }));
      const tacticConfig = {
        formation: (activeTactic as any).formation || '4-4-2',
        instructions: activeInstructions.map(i => ({ instructionName: i, option: 'on' })),
        playStyle: (activeTactic as any).playStyle,
      };
      return calculateTacticalScore(squadSlots, tacticConfig);
    } catch { return undefined; }
  }, [squad, playerRoles, activeInstructions, activeTactic]);

  
  const [isTestMode, setIsTestMode] = useState(false);
  
  const {
    dbStatus, dbLatency, migrating, migrationResult, showMigrationBanner,
    lastMatch,
    handleCheckDb, handleMigrate,
    setShowMigrationBanner, setMigrationResult, setLastMatch,
  } = useDbHealth(userId, squad, activeTactic, teamStats, setSquad);
  const [retiredLog, setRetiredLog] = useState<{ retired: Player[], talents: Player[] } | null>(null);
  const [showTrainingToast, setShowTrainingToast] = useState(false);
  const [transferOffers, setTransferOffers] = useState<Array<{ id: string; fromTeam: string; playerName: string; playerPosition: string; amount: number; status: string; date: string }>>([]);

  // ADIM 4: Sezon sonu ödülleri
  const [showSeasonAwards, setShowSeasonAwards] = useState(false);
  const [lastCompletedSeasonId, setLastCompletedSeasonId] = useState<string>('');
  const [showComingSoon, setShowComingSoon] = useState(false);

  // ── New season briefing ──
  const [showNewSeasonBriefing, setShowNewSeasonBriefing] = useState(false);
  const [newSeasonInfo, setNewSeasonInfo] = useState<{
    leagueName: string;
    promoted: boolean;
    relegated: boolean;
    season: number;
    retiredPlayers: { name: string; age: number; goals: number; matches: number; seasons: number }[];
  }>({
    leagueName: '',
    promoted: false,
    relegated: false,
    season: 0,
    retiredPlayers: [],
  });

  // ── New feature component state ──
  const [showMentorModal, setShowMentorModal] = useState(false);
  const [rivalInfo, setRivalInfo] = useState<{ id: string; name: string } | null>(null);
  const [comparePlayers, setComparePlayers] = useState<[any, any] | null>(null);
  const [showMatchReport, setShowMatchReport] = useState(false);

  // ─── Duygusal katman: Gol kutlama ────────────────────────────
  const { goalCelebrationTrigger, setGoalCelebrationTrigger, goalScorer, goalMinute } = useEmotionalEvents();

  // ─── UX katman: Onboarding ve Toast ────────────────────────────
  const { showOnboarding, setShowOnboarding } = useOnboarding(profile?.id);
  const { toast } = useToast();

  // Cup seasons
  const { cupSeasons, setCupSeasons } = useCupSeasons(profile?.id, profile?.team_name || '');

  // Youth Academy state & effects
  const {
    youthPlayers, setYouthPlayers,
    youthFacilities, setYouthFacilities,
  } = useYouthAcademy(profile?.id ?? null);

  const sellPlayer = async (player: Player, price: number) => {
    if (!profile) return;
    const marketValue = calculateMarketValue(player);
    const corridor = getTransferCorridor(marketValue);
    
    if (price < corridor.min || price > corridor.max) {
      toast({ title: "Fiyat Uyarısı", description: `Girilen fiyat (${formatCurrency(price)}) koridor aralığı dışında! (${formatCurrency(corridor.min)} - ${formatCurrency(corridor.max)})`, variant: "destructive" });
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
        toast({ title: "Başarılı", description: "Oyuncu başarıyla transfer pazarına ilan edildi!" });
      } else {
        toast({ title: "Hata", description: `İşlem başarısız: ${result.error}`, variant: "destructive" });
      }
    } catch (err) {
      console.error('Sell player error:', err);
      toast({ title: "Hata", description: "İşlem sırasında beklenmedik bir hata oluştu.", variant: "destructive" });
    }
  };

  const handleMassList = async () => {
    if (!profile || squad.length === 0) return;
    
    const count = Math.min(squad.length, 380);
    const ok = await confirm({ title: 'Toplu Listeleme', description: `${count} oyuncuyu kadronuzdan çıkarıp transfer listesine göndermek istediğinize emin misiniz?`, variant: 'destructive', confirmText: 'Gönder' });
    if (!ok) return;

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

        toast({ title: "Başarılı", description: `İşlem tamamlandı! ${result.total} oyuncu pazara gönderildi.` });
        setActiveTab('multiplayer');
      } else {
        toast({ title: "Hata", description: `İşlem başarısız oldu: ${result.errors?.[0] || 'Bilinmeyen hata'}`, variant: "destructive" });
      }
    } catch (err) {
      console.error('Mass list error:', err);
      toast({ title: "Hata", description: "İşlem sırasında bir hata oluştu.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleBuyMarketPlayer = async (listing: MarketListing) => {
    if (!profile || !userId) return;
    if (profile.money < listing.price) {
      toast({ title: "Yetersiz Bütçe", description: "Bu işlem için yeterli bütçeniz yok.", variant: "destructive" });
      return;
    }

    const ok = await confirm({ title: 'Oyuncu Satın Al', description: `${listing.player_data.name} oyuncusunu ${formatCurrency(listing.price)} bedelle hemen satın almak istiyor musunuz?`, confirmText: 'Satın Al' });
    if (ok) {
      setLoading(true);
      try {
        const result = await buyPlayerFromMarket(listing.id, userId, profile.team_name);
        if (result.success) {
          const newSquad = [...squad, result.player];
          setSquad(newSquad);
          setProfile({ ...profile, money: profile.money - result.price });
          setSelectedListing(null);
          setSelectedPlayer(null);
          toast({ title: "Başarılı", description: "Transfer başarıyla tamamlandı! Oyuncu kadronuza katıldı." });
        } else {
          toast({ title: "Hata", description: `Satın alma hatası: ${result.error}`, variant: "destructive" });
        }
      } catch (err) {
        console.error('Buy error:', err);
        toast({ title: "Hata", description: "İşlem sırasında bir hata oluştu.", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleMoveAllToMarket = async () => {
    if (!profile || squad.length === 0) return;
    const ok = await confirm({ title: 'Pazara Taşı', description: `${squad.length} oyuncuyu pazara taşımak üzeresiniz. Onaylıyor musunuz?`, variant: 'destructive', confirmText: 'Taşı' });
    if (!ok) return;
    
    setLoading(true);
    try {
      const result = await listAllSquadOnMarket(squad, profile.id, profile.team_name);
      if (result.success) {
        setSquad([]);
        toast({ title: "Başarılı", description: `${result.total} oyuncu transfer pazarına taşındı!` });
        setActiveTab('multiplayer');
      }
    } catch (err) {
      console.error(err);
      toast({ title: "Hata", description: "İşlem sırasında hata oluştu.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleNuke = async () => {
    const ok1 = await confirm({ title: 'DİKKAT', description: 'Oyundaki TÜM oyuncular ve lig verileri silinecek. Emin misiniz?', variant: 'destructive', confirmText: 'Sil' });
    if (!ok1) return;
    const ok2 = await confirm({ title: 'SON UYARI', description: 'Bu işlem geri alınamaz. Onaylıyor musunuz?', variant: 'destructive', confirmText: 'Kesinlikle Sil' });
    if (!ok2) return;

    setLoading(true);
    try {
      const result = await resetLeague();
      if (result.success) {
        setSquad([]);
        toast({ title: "Sıfırlandı", description: "Tüm veriler başarıyla silindi. Sistem sıfırlandı." });
        window.location.reload();
      } else {
        toast({ title: "Hata", description: 'Sıfırlama işlemi başarısız: ' + (result.error || 'Bilinmeyen hata'), variant: "destructive" });
      }
    } catch (err) {
      console.error(err);
      toast({ title: "Hata", description: "Sıfırlama sırasında hata oluştu.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const maxMinRef = useRef(90);
  // ── Apply team colors on profile load ──
  useEffect(() => {
    if (profile?.primary_color && profile?.secondary_color) {
      applyTeamColors({ primary: profile.primary_color, secondary: profile.secondary_color });
    }
  }, [profile?.primary_color, profile?.secondary_color]);
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
      const tickRate = isTestMode ? 200 : (matchState.isFriendly ? 500 : 3000); // Friendly matches 6x faster

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
        if (key === 'fitness' || key === 'cond') return p.cond || 100;
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



  const runEvolution = useCallback(() => {
    if (!profile) return;

    const result = processEvolutionDay({
      squad,
      profile,
      trainingState,
      youthPlayers,
      youthFacilities,
    });

    // Apply state updates
    setSquad(result.updatedSquad);
    setProfile(result.updatedProfile);
    setTrainingState(result.updatedTrainingState);
    setYouthPlayers(result.updatedYouthPlayers);
    if (result.retiredLog) setRetiredLog(result.retiredLog);

    // Persist youth players to Supabase if changed
    if (result.youthSaveNeeded && profile.id) {
      saveYouthPlayers(result.updatedYouthPlayers as unknown as Record<string, unknown>[], profile.id);
    }

    // Async Hall-of-Fame induction
    if (result.hofInduction) {
      const { retiredPlayers, profileId, currentDay, retiredSeason } = result.hofInduction;
      import('@/lib/fm/hallOfFameService').then(({ inductRetiredPlayers }) => {
        inductRetiredPlayers(retiredPlayers, profileId, currentDay, retiredSeason)
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
      });
    }

    // Enemy attack toast notification
    if (result.alertInfo) {
      import('@/components/fm/ToastNotifications').then(({ showToast }) => {
        showToast(`⚠️ ${result.alertInfo!.header}: ${result.alertInfo!.text}`, 'info');
      });
    }
  }, [squad, profile, trainingState, youthPlayers, youthFacilities, setSquad, setProfile, setTrainingState, setYouthPlayers, setRetiredLog]);

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
        const summary = await computeSeasonSummary(
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

        // Capture promotion/relegation info for new season briefing
        const nextSeason = Math.floor((profile.current_day || 0) / 10) + 1;
        setNewSeasonInfo({
          leagueName: profile.league_name || 'Amatör Lig',
          promoted: summary.is_promoted || false,
          relegated: summary.is_relegated || false,
          season: nextSeason,
          retiredPlayers: (squad || [])
            .filter(p => (p as any).is_retiring)
            .map(p => ({
              name: p.name || '',
              age:  (p as any).age || 0,
              goals: (p as any).goals || 0,
              matches: (p as any).matches_played || 0,
              seasons: (p as any).seasons_with_team || 1,
            })),
        });

        // Ödül modalını aç
        setLastCompletedSeasonId(seasonId);
        setShowSeasonAwards(true);
      } catch (err) {
        console.error('[handleSeasonEnd] Award computation error:', err);
      }
    })();
  }, [runEvolution, profile, squad, league]);

  const runTraining = useCallback(async (sessionType: 'morning' | 'afternoon') => {
    // Günlük limit kontrolü
    const today = new Date().toISOString().split('T')[0];
    const ts = trainingState as any;
    const lastDate = ts?.lastTrainingDate;
    const todayCount = lastDate === today ? (ts?.dailyTrainingCount || 0) : 0;

    if (todayCount >= 2) {
      if (typeof window !== 'undefined') {
        import('@/components/fm/ToastNotifications').then(({ showToast }) => {
          showToast('Günlük antrenman limitine ulaşıldı (2/2).', 'warning');
        });
      }
      return;
    }

    let updatedSquad = [...squad];
    const growth = processTacticalGrowth({ ...teamStats }, activeSlots);
    const decay = processTacticalDecay(growth.newStats, activeSlots);
    setTeamStats(decay.newStats);
    
    // Fetch top coach stars for coachFactor
    let topCoachStars = 0;
    try {
      const staffRes = await fetch(`/api/staff?userId=${profile?.id}`);
      if (staffRes.ok) {
        const staffData = await staffRes.json();
        const coaches = (staffData.staff || []).filter((s: any) => s.type === 'coach' || s.type === 'assistant_coach');
        topCoachStars = coaches.reduce((max: number, c: any) => Math.max(max, c.stars || 0), 0);
      }
    } catch {}

    const { updatedSquad: newSquad } = runTrainingSession(updatedSquad, trainingState, 1.0, {
      trainingFacilityLevel: (profile as any)?.stadium_upgrades?.training || 0,
      coachStars: topCoachStars,
    });
    setSquad(newSquad);
    
    // Sayacı güncelle
    setTrainingState(prev => ({
      ...prev,
      lastTrainingDate: today,
      dailyTrainingCount: todayCount + 1,
    }));
    
    setShowTrainingToast(true);
    setTimeout(() => setShowTrainingToast(false), 5000);
  }, [squad, teamStats, activeSlots, trainingState, setSquad]);

  const handleLogout = async () => {
    // State'i temizle
    setProfile(null);
    setSquad([]);

    // localStorage'dan tüm fm_ anahtarlarını ve demo user ID'yi temizle
    if (typeof window !== 'undefined') {
      const keysToRemove = [
        'fm_user_id',
        'fm_auth_email',
        'fm_profile',
        'fm_squad',
        'fm_training',
        'fm_tactic',
        'fm_league',
        'fm_last_match',
        'fm_watchlist',
        'fm_fixtures',
        'fm_active_tactic',
        'fm_training_state',
        'fm_youth_players',
        'fm_youth_facilities',
        'fm_transfer_offers',
        'fm_retired_log',
        'fm_match_state',
        'sb_demo_user_id',
      ];
      for (const key of keysToRemove) {
        try { localStorage.removeItem(key); } catch {}
      }
      // fm_ ön ekli diğer anahtarları da yakala
      try {
        const allKeys = Object.keys(localStorage);
        for (const k of allKeys) {
          if (k.startsWith('fm_')) {
            try { localStorage.removeItem(k); } catch {}
          }
        }
      } catch {}

      // sessionStorage'ı da temizle
      try {
        sessionStorage.clear();
      } catch {}
    }

    // Supabase auth oturumunu kapat
    await authSignOut();

    // Login sayfasına yönlendir — logged_out=1 parametresi ile
    // Google One Tap'in otomatik tetiklenmesini engelliyoruz
    if (typeof window !== 'undefined') {
      window.location.replace('/auth/login?logged_out=1');
    }
  };

  const { activeOperations, setActiveOperations } = useActiveOperations(userId, activeTab);

  const handleSignScoutedPlayer = async (player: Player) => {
    if (!profile) return;
    const signingCost = calculateMarketValue(player) * 0.5;
    if (profile.money < signingCost) {
      toast({ title: "Yetersiz Bütçe", description: "Bu işlem için yeterli bütçeniz yok.", variant: "destructive" });
      return;
    }

    const ok = await confirm({ title: 'Sözleşme İmzala', description: `${player.name} ile ${formatCurrency(signingCost)} karşılığında sözleşme imzalamak istiyor musunuz?`, confirmText: 'İmzala' });
    if (ok) {
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
      toast({ title: "Başarılı", description: "Sözleşme imzalandı! Oyuncu kadronuza katıldı." });
    }
  };

  const homeSquadSlice = useMemo(() => squad.slice(0, 11), [squad]);
  const benchSlice = useMemo(() => squad.slice(11), [squad]);
  const awayTeamSlice = useMemo(() => squad.slice(11, 22).length > 0 ? squad.slice(11, 22) : squad.slice(0, 11), [squad]);

  // Auth check: Kullanıcı auth olmamışsa (gizli sekme dahil) hemen login'e yönlendir.
  // Hiçbir takım verisi / UI gösterme — gizli sekmede flash görünmeyi engeller.
  if (!authUser && !authLoading) {
    if (typeof window !== 'undefined') {
      // Redirect öncesinde sayfayı tamamen boşalt
      window.location.replace('/auth/login');
      return null;
    }
  }

  // Auth yüklenirken bekle — hiçbir içerik gösterme
  // (gizli sekmede brief takım görünmesini engellemek için)
  if (authLoading || (!userId && authUser)) {
    return (
      <div className="h-screen bg-black flex items-center justify-center">
        <FootballLoader size={56} label="Yükleniyor" />
      </div>
    );
  }

  // Authenticated but no team set up = show team setup screen
  // KRİTİK: !profile DEĞİL, !profile?.team_name kontrolü yap.
  // /api/auth/google minimal profile oluşturuyor (team_name=null) — bu durumda
  // profile objesi null değildir ama takım kurulmamıştır. ManagerRegistration
  // gösterilmeli. Eski kontrol !profile olduğu için minimal profile oluştuktan
  // sonra bile ManagerRegistration gösterilmiyordu → kullanıcı direkt oyuna atıyordu.
  if (authUser && !loading && (!profile || !profile.team_name)) {
    return <ManagerRegistration />;
  }

  if (!authUser) {
    return null;
  }

  if (loading) {
    return (
      <div className="h-screen bg-black flex items-center justify-center">
        <FootballLoader size={56} label="Takım Yükleniyor" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-white selection:text-black">
      {/* DÜZELTME 8: Custom confirmation dialog (replaces browser confirm()) */}
      {ConfirmDialog}

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
            toast({ title: 'Hoş geldin, Menajer!', description: 'Touchline Manager artık senin takımın!' });
          }}
          onDismiss={() => setShowOnboarding(false)}
          userId={profile?.id}
        />
      )}

      {/* UX katman — İpucu kutusu */}
      {profile?.id && !showOnboarding && <HintBox />}

      {/* Mobil Alt Navigasyon — sadece mobilde görünür */}
      <MobileBottomNav activeTab={activeTab} onTabChange={setActiveTab} isAdmin={isAdmin} />

      {/* Ses açma/kapama butonu — mobilde bottom nav üstünde */}
      <button
        onClick={() => {
          const newState = !isSoundEnabled();
          setSoundEnabled(newState);
          if (newState) playSound('click');
        }}
        className="fixed bottom-20 right-4 lg:bottom-4 z-50 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-zinc-900/90 text-sm backdrop-blur-sm transition-all hover:bg-zinc-800"
        title={isSoundEnabled() ? 'Sesi Kapat' : 'Sesi Aç'}
      >
        {isSoundEnabled() ? '🔊' : '🔇'}
      </button>

      <AppHeader profile={profile} />
      <ToastNotifications showTrainingToast={showTrainingToast} migrationResult={migrationResult} onDismissMigration={() => setMigrationResult(null)} />
      <RealTimeLeagueManager />
      
      {/* Global Upgrade Progress Banner — nötr renk, kırmızı şerit değil */}
      {profile?.active_upgrade_type && (
        <div className="max-w-7xl mx-auto px-4 mt-4">
           <motion.div 
             initial={{ opacity: 0, scale: 0.95 }}
             animate={{ opacity: 1, scale: 1 }}
             className="bg-zinc-800/80 text-white p-3 rounded-2xl flex items-center justify-between shadow-lg border border-white/10 backdrop-blur-sm"
           >
              <div className="flex items-center gap-3">
                 <div className="w-8 h-8 bg-amber-500/20 rounded-lg flex items-center justify-center">
                    <RefreshCw size={16} className="text-amber-400 animate-spin" />
                 </div>
                 <div>
                    <p className="text-[7px] font-black uppercase tracking-widest text-white/40">YÜKSELTME DEVAM EDİYOR</p>
                    <p className="text-[11px] font-bold uppercase italic">
                      {profile.active_upgrade_type === 'academy' ? 'Yetiştirme Merkezi' : 'Stadyum Tesisi'} • LV. {(profile.stadium_upgrades?.[profile.active_upgrade_id!] || 0) + 1}
                    </p>
                 </div>
              </div>
              <div className="flex items-center gap-4">
                 <div className="text-right">
                    <p className="text-[7px] font-black uppercase tracking-widest text-white/30">KALAN</p>
                    {profile.active_upgrade_end_at ? (
                      <UpgradeCountdown endAt={profile.active_upgrade_end_at} />
                    ) : (
                      <p className="text-xs font-black italic tracking-tighter">{(profile?.active_upgrade_finish_day || 0) - (profile?.current_day || 0)} GÜN</p>
                    )}
                 </div>
                 <button 
                  onClick={() => setActiveTab('stadium')}
                  className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all"
                 >
                  DETAY
                 </button>
              </div>
           </motion.div>
        </div>
      )}
      <main className="max-w-7xl mx-auto p-4 pb-32">
        <div className="flex flex-col lg:flex-row gap-6">
          <nav className="hidden lg:flex flex-col gap-1 bg-gradient-to-b from-zinc-900 to-black p-3 rounded-2xl border border-white/5 w-64 h-fit sticky top-[100px] z-40">
            <div className="pb-4 mb-3 border-b border-white/5">
              <div className="flex items-center gap-3 px-2">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg shadow-white/5 rotate-0 transition-transform overflow-hidden"><img src="/game-icon.png" alt="Touchline Manager" className="w-full h-full object-cover" /></div>
                <div>
                  <p className="text-sm font-black uppercase tracking-wider text-white">MANAGER Pro</p>
                  <p className="text-[9px] uppercase tracking-widest text-white/30 font-bold">Football Sim</p>
                </div>
              </div>
            </div>

            <NavButton icon={<LayoutDashboard size={18} />} label="DASHBOARD" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
            <NavButton icon={<Building2 size={18} />} label="YERLEŞKE" active={activeTab === 'stadium'} onClick={() => setActiveTab('stadium')} />
            <NavButton icon={<Binoculars size={18} />} label="GÖZLEMCİLİK" active={activeTab === 'scouting'} onClick={() => setActiveTab('scouting')} />
            <NavButton icon={<Settings size={18} />} label="TAKTİK&TAKIMIM" active={activeTab === 'tactics'} onClick={() => setActiveTab('tactics')} />
            <NavButton icon={<Dumbbell size={18} />} label="ANTRENMAN" active={activeTab === 'training'} onClick={() => setActiveTab('training')} />

            <NavButton icon={<Zap size={18} />} label="OPERASYON ODASI" active={false} onClick={() => setShowComingSoon(true)} disabled /> {/* SORUN-6: Disabled - coming soon */}
            <NavButton icon={<Archive size={18} />} label="ARŞİV & ENVANTER" active={activeTab === 'inventory'} onClick={() => setActiveTab('inventory')} dimmed /> {/* SORUN-6: Marked as limited */}
            <NavButton icon={<Newspaper size={18} />} label="HABERLER" active={activeTab === 'newspaper'} onClick={() => setActiveTab('newspaper')} />

            <NavButton icon={<Swords size={18} />} label="MAÇ GÜNÜ" active={activeTab === 'matchday'} onClick={() => setActiveTab('matchday')} />
            <NavButton icon={<Activity size={18} />} label="HAZIRLIK MAÇI" active={activeTab === 'friendly'} onClick={() => setActiveTab('friendly')} />
            <NavButton icon={<Calendar size={18} />} label="FİKSTÜR" active={activeTab === 'fixtures'} onClick={() => setActiveTab('fixtures')} />
            <NavButton icon={<Trophy size={18} />} label="LİG" active={activeTab === 'league'} onClick={() => setActiveTab('league')} />

            <div className="mt-4 px-3 py-1 mb-2 border-t border-white/5 pt-4 group">
               <p className="text-[8px] font-black tracking-widest text-white/20 uppercase mb-2 group-hover:text-emerald-400 transition-colors">EKONOMİ</p>
               <NavButton icon={<Globe size={18} />} label="TRANSFER PAZARI" active={activeTab === 'multiplayer'} onClick={() => setActiveTab('multiplayer')} />
               <NavButton icon={<DollarSign size={18} />} label="FİNANSAL" active={activeTab === 'financial'} onClick={() => setActiveTab('financial')} />
            </div>
            
            <div className="mt-4 px-3 py-1 mb-2 border-t border-white/5 pt-4 group">
               <p className="text-[8px] font-black tracking-widest text-white/20 uppercase mb-2 group-hover:text-amber-400 transition-colors">AKADemi & KUPA</p>
               <NavButton icon={<Users size={18} />} label="GENÇLİK AKAD." active={activeTab === 'youth'} onClick={() => setActiveTab('youth')} />
               <NavButton icon={<Trophy size={18} />} label="KUPALAR" active={activeTab === 'cups'} onClick={() => setActiveTab('cups')} />
               <NavButton icon={<Award size={18} />} label="ÖDÜLLER" active={activeTab === 'awards'} onClick={() => setActiveTab('awards')} />
               <NavButton icon={<Building2 size={18} />} label="EFSANELER" active={activeTab === 'hof'} onClick={() => setActiveTab('hof')} />
               <NavButton icon={<Newspaper size={18} />} label="HAFTALIK RAPORLAR" active={activeTab === 'reports'} onClick={() => setActiveTab('reports')} />
            </div>
            
            <div className="mt-4 pt-4 border-t border-white/5 space-y-1">
              <NavButton icon={<Cog size={18} />} label="AYARLAR" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
              {isAdmin && (
                <NavButton icon={<Shield size={18} />} label="ADMİN PANEL" active={activeTab === 'admin'} onClick={() => setActiveTab('admin')} className="!text-red-500 !border-red-500/20 bg-red-500/5 shadow-[0_0_15px_rgba(239,68,68,0.1)]" />
              )}
            </div>
            <div className="mt-2 pt-2 border-t border-white/5 space-y-1">
              <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest text-white/30 hover:text-white hover:bg-white/5 transition-all"><LogOut size={14} /> ÇIKIŞ YAP</button>
            </div>
          </nav>
          <section className="flex-1 min-h-[600px]">
            <AnimatePresence mode="wait">
              {activeTab === 'dashboard' && (
                <motion.div key="dashboard" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <div className="space-y-4">
                    <QuickDecisionCard
                      userId={userId || ''}
                      onNavigate={(tab) => setActiveTab(tab)}
                      hasMatchToday={!!lastMatch}
                      contractExpiringCount={squad.filter(p => {
                        const endWeek = (p as any).contract_end_week;
                        if (!endWeek) return false;
                        const currentWeek = Math.ceil((profile?.current_day || 1) / 7);
                        return endWeek - currentWeek <= 4;
                      }).length}
                      hasUntrained={!trainingState?.lastTrainingDate || trainingState.lastTrainingDate !== new Date().toISOString().split('T')[0]}
                    />
                    <DailyTasksWidget userId={userId || ''} />
                    <DissatisfactionPanel userId={userId || ''} onUpdate={() => refreshData()} />
                    <DashboardTab 
                      squad={squad} 
                      teamAvgStats={teamAvgStats} 
                      profile={profile} 
                      retiredLog={retiredLog}
                      onClearRetiredLog={() => setRetiredLog(null)}
                      onNextSeason={handleSeasonEnd}
                      onNavigate={(tab) => setActiveTab(tab)}
                      onRunTraining={runTraining}
                      isAdmin={isAdmin}
                      transferOffers={transferOffers}
                    />
                  </div>
                </motion.div>
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
                    playerRoles={playerRoles}
                    awayProfileId={(window as any)?._friendlyOpponentInfo?.opponentId}
                    tacticalScore={tacticalScore}
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
                    onMatchEnd={async (results) => {
                      const isFriendly = activeTab === 'friendly';
                      
                      // ── ÖNEMLİ: Lig maçları artık sunucu tarafında (match-tick cron) oynanıyor ──
                      // Client-side simülasyon SADECE dostluk maçları, test modu ve tekrar izleme için aktif.
                      // Lig maçı için DB'ye YAZMA — match-tick cron zaten tüm güncellemeleri yapıyor
                      // (bilet geliri, puan tablosu, oyuncu istatistikleri, kondisyon, kart cezaları, sakatlıklar)
                      if (!isFriendly) {
                        console.log('[onMatchEnd] Lig maçı — DB güncellemesi atlanıyor (sunucu tarafında yapılıyor)');
                      }
                      
                      let revenue = 0;
                      // Sadece dostluk maçları için bilet geliri (lig maçı match-tick tarafından halledilir)
                      if (isFriendly && profile && isSupabaseConfigured()) {
                        try {
                          const res = await fetch('/api/match/end', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              userId: profile.id,
                              isHome: true,
                              homeScore: results.score?.home ?? 0,
                              awayScore: results.score?.away ?? 0,
                              isFriendly: true,
                            }),
                          });
                          if (res.ok) {
                            const data = await res.json();
                            revenue = data.revenue || 0;
                            if (data.revenue > 0) {
                              setProfile((prev: any) => ({ ...prev, money: (prev.money || 0) + data.revenue }));
                            }
                          }
                        } catch (e) {
                          console.error('[Match End API] Error:', e);
                        }
                      }

                      const evolvedSquad = squad.map(p => {
                        const newRatings = [...(p.match_ratings || [])];
                        const isStarter = squad.slice(0, 11).some(sp => sp.id === p.id);
                        if (isStarter) {
                          // Gerçek rating'i maç motorundan al, yoksa varsayılan 6.0 (rastgele değil, sabit)
                          const engineRating = results?.playerRatings?.[p.id] ?? 6.0;
                          newRatings.push(engineRating);
                          if (newRatings.length > 5) newRatings.shift();
                        }
                        const intensityMult = ((activeTactic as any).intensity === 'high' ? 1.5 : ((activeTactic as any).intensity === 'low' ? 0.8 : 1.0));
                        const staminaFactor = (p.stamina || 50) / 100;

                        // Kondisyon kaybı: maç sonucuna göre çarpan
                        const homeScore = results?.score?.home ?? 0;
                        const awayScore = results?.score?.away ?? 0;
                        const goalDiff = Math.abs(homeScore - awayScore);
                        const didWin = homeScore > awayScore;
                        const didLose = homeScore < awayScore;
                        // Gerçekçi: Baskılı/differentli maç daha çok yorar
                        // Galibiyette -%20, mağlubiyette +%20, beraberlikte ±0
                        const resultMod = didWin ? 0.8 : didLose ? 1.2 : 1.0;
                        // Farklı maç (3+ gol) ekstra yorucu
                        const diffMod = goalDiff >= 3 ? 1.15 : 1.0;

                        const baseLoss = isFriendly
                           ? 5
                           : Math.floor(18 * intensityMult * (1.2 - staminaFactor) * resultMod * diffMod);
                        const loss = Math.min(40, Math.max(2, baseLoss));
                        const fitnessGain = isFriendly ? 10 : 0;
                        // form_rating: son 5 maç ortalamasını hesapla (0-100 skalası)
                        const formRating = newRatings.length > 0
                          ? Math.round((newRatings.reduce((s, r) => s + r, 0) / newRatings.length) * 10)
                          : (p.form_rating ?? 50);

                        // ── MORAL GÜNCELLEME ──
                        // Win: +5, Draw: +1, Loss: -4
                        // Big win/loss (3+ gol fark): +3/-3 ekstra
                        // Gol atan oyuncu: +3/gol
                        let moraleDelta = 0;
                        if (!isFriendly && isStarter) {
                          if (didWin) moraleDelta += 5;
                          else if (homeScore === awayScore) moraleDelta += 1;
                          else if (didLose) moraleDelta -= 4;
                          // Büyük fark ekstra
                          if (goalDiff >= 3) {
                            moraleDelta += didWin ? 3 : didLose ? -3 : 0;
                          }
                          // Gol atan oyunculara +3/gol
                          if (results?.events) {
                            const goalsScored = results.events.filter(
                              (e: any) => e.type === 'GOAL' && e.playerId === p.id
                            ).length;
                            moraleDelta += goalsScored * 3;
                          }
                        }
                        const newMorale = Math.max(10, Math.min(100, (p.morale ?? 60) + moraleDelta));

                        return { 
                          ...p, 
                          cond: Math.max(0, Math.min(100, (p.cond ?? 100) - loss + fitnessGain)),
                          match_ratings: newRatings,
                          form_rating: Math.max(0, Math.min(100, formRating)),
                          last_match_rating: isStarter ? (results?.playerRatings?.[p.id] ?? 6.0) : (p.last_match_rating ?? 0),
                          morale: newMorale,
                        };
                      });
                      setSquad(evolvedSquad);

                      // ── match_ratings ve form_rating'i Supabase'e kalıcı olarak kaydet ──
                      // SADECE dostluk maçları için — lig maçları match-tick cron tarafından güncellenir
                      if (isFriendly && isSupabaseConfigured() && profile) {
                        import('@/lib/supabase').then(({ getSupabase }) => {
                          const supabase = getSupabase();
                          if (!supabase) return;
                          
                          // Sadece ilk 11 (maç oynayanlar) için güncelle
                          const starterUpdates = evolvedSquad.filter(p => 
                            squad.slice(0, 11).some(sp => sp.id === p.id)
                          );
                          
                          for (const player of starterUpdates) {
                            supabase
                              .from('players')
                              .update({
                                match_ratings: JSON.stringify(player.match_ratings),
                                form_rating: player.form_rating,
                                last_match_rating: player.last_match_rating,
                                morale: player.morale,
                              })
                              .eq('id', player.id)
                              .then(({ error }) => {
                                if (error) {
                                  console.error(`[onMatchEnd] Player ${player.id} match_ratings kaydetme hatası:`, error.message);
                                }
                              });
                          }
                          console.log(`[onMatchEnd] ${starterUpdates.length} oyuncunun match_ratings + form_rating Supabase'e kaydedildi (dostluk maçı)`);

                          // Increment matches_played for starters
                          const starterIds = squad.slice(0, 11).map(p => p.id);
                          for (const pid of starterIds) {
                            supabase.from('players')
                              .select('matches_played')
                              .eq('id', pid)
                              .maybeSingle()
                              .then(({ data }: any) => {
                                if (data) {
                                  supabase.from('players')
                                    .update({ matches_played: (data.matches_played || 0) + 1 })
                                    .eq('id', pid)
                                    .then(() => {});
                                }
                              });
                          }
                        });
                      }

                      // SORUN-14 FIX: Drain condition for players after friendly match
                      if (isFriendly) {
                        try {
                          const squadPlayerIds = squad.map((p: any) => p.id).filter(Boolean);
                          if (squadPlayerIds.length > 0 && profile?.id) {
                            await fetch('/api/players/drain-condition', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({
                                playerIds: squadPlayerIds,
                                drain: 8,  // Less drain than league matches
                                profileId: profile.id,
                              }),
                            });
                          }
                        } catch (drainErr) {
                          console.warn('[FriendlyMatch] Condition drain failed:', drainErr);
                        }
                      }

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
                        saveMatchResult(profile.id, results, profile.team_name || 'Touchline FC', 'Rakip Takım');
                        setLastMatch({ 
                          result: results, 
                          homeTeamName: profile.team_name || 'Touchline FC', 
                          awayTeamName: 'Rakip Takım' 
                        });
                        
                        if (isFriendly && isSupabaseConfigured()) {
                          import('@/lib/supabase').then(({ getSupabase }) => {
                            const supabase = getSupabase();
                            // Use real opponent info if available (from queue match), otherwise fallback to 'cpu'
                            const opponentInfo = window._friendlyOpponentInfo;
                            const awayTeamId = opponentInfo?.opponentId || 'cpu';
                            const awayTeamName = opponentInfo?.opponentTeamName || 'CPU Takımı';
                            supabase.from('friendly_matches').insert({
                              home_team_id: profile.id,
                              away_team_id: awayTeamId,
                              home_score: results.score.home,
                              away_score: results.score.away,
                              home_team_name: profile.team_name || 'Bilinmeyen',
                              away_team_name: awayTeamName,
                              match_data: results
                            }).then(({ error }: { error: any }) => {
                              if (error) {
                                console.error('[onMatchEnd] Friendly match kaydetme hatası:', error.message);
                              }
                            });
                            // Clean up global opponent info
                            delete window._friendlyOpponentInfo;
                          });
                        }
                        if (!isFriendly) {
                          // ── LİG PUAN DURUMU GÜNCELLEME: ATLANIYOR ──
                          // Lig maçları artık sunucu tarafında oynanıyor.
                          // match-tick cron zaten league_standings, consecutive_losses, moral ve
                          // kariyer istatistikleri güncellemelerini yapıyor.
                          // Client-side DB yazma = çift güncelleme riski (veri bozulması).
                          console.log('[onMatchEnd] Lig maçı — tüm DB güncellemeleri atlanıyor (match-tick cron tarafından yapılıyor)');
                        } else {
                          // ── DOSTLUK MAÇLARI: Kariyer istatistiklerini güncelle ──
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
                            const gkSaves = isGK ? (stats as any).saves || 0 : 0;
                            updateMatchCareerStats(player.id, seasonId, profile.id, {
                              goals: stats.goals,
                              assists: stats.assists,
                              yellowCards: stats.yellowCards || 0,
                              redCards: stats.redCards || 0,
                              fouls: stats.fouls || 0,
                              rating: rating,
                              cleanSheet: isGK && awayGoals === 0,
                              isMotm: isMotm,
                              saves: gkSaves,
                              position: player.position,
                              playerRating: player.rating,
                              goalTypes: stats.goalDetails || {},
                              saveTypes: stats.saveDetails || {},
                            });
                          });
                        }
                      }

                      // ═══ GÜNLÜK GÖREV TAMAMLAMA KONTROLÜ ═══
                      // Maç sonucuna göre günlük görevleri tamamla
                      try {
                        const homeWon = results.score.home > results.score.away;
                        const scoreDiff = results.score.home - results.score.away;

                        const sb = getSupabase();
                        if (sb && userId) {
                          // Görev tiplerini kontrol et ve tamamla
                          const taskChecks: Array<{ type: string; condition: boolean }> = [
                            { type: 'WIN_BIG', condition: homeWon && scoreDiff >= 3 },
                            { type: 'FULL_TRAINING', condition: false }, // antrenman'da tetiklenir
                          ];

                          for (const check of taskChecks) {
                            if (!check.condition) continue;
                            const { data: tasks } = await sb
                              .from('daily_tasks')
                              .select('id, task_type, is_completed')
                              .eq('profile_id', userId)
                              .eq('task_type', check.type)
                              .eq('is_completed', false)
                              .gt('expires_at', new Date().toISOString())
                              .limit(1);

                            if (tasks && tasks.length > 0) {
                              await sb.from('daily_tasks')
                                .update({
                                  is_completed: true,
                                  completed_at: new Date().toISOString()
                                })
                                .eq('id', tasks[0].id);
                              console.log(`[onMatchEnd] Günlük görev tamamlandı: ${check.type}`);
                            }
                          }
                        }
                      } catch (taskErr) {
                        console.warn('[onMatchEnd] Günlük görev tamamlama hatası:', taskErr);
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
                  {/* Match Report Panel — shown after match ends */}
                  {matchState.isFinished && matchState.result && (
                    <div className="mt-4">
                      <MatchReportPanel
                        homeTeamName={profile?.team_name || 'Ev Sahibi'}
                        awayTeamName={lastMatch?.awayTeamName || 'Rakip Takım'}
                        homeScore={matchState.result?.score?.home ?? 0}
                        awayScore={matchState.result?.score?.away ?? 0}
                        events={(matchState.result?.events || []).map((e: any) => ({
                          type: e.type || '',
                          minute: e.minute || 0,
                          playerId: e.playerId,
                          playerName: e.playerName,
                          team: e.team || 'home',
                          assistPlayerName: e.assistPlayerName,
                          assistPlayerId: e.assistPlayerId,
                          subtype: e.subtype,
                        }))}
                        playerStats={Object.entries(matchState.result?.playerStats || {}).map(([playerId, stats]: [string, any]) => {
                          const player = squad.find(p => p.id === playerId);
                          return {
                            id: playerId,
                            name: player?.name || 'Oyuncu',
                            team: 'home',
                            rating: matchState.result?.playerRatings?.[playerId] || 6.0,
                            position: player?.position || 'MID',
                          };
                        })}
                        homeTactic={activeTactic as any}
                        awayTactic={undefined}
                      />
                    </div>
                  )}
                </motion.div>
              )}
              {activeTab === 'friendly' && (
                <FriendlyMatchTab />
              )}
              {activeTab === 'tactics' && (
                <motion.div key="tactics" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <div className="pb-20">
                    <div className="flex items-center gap-2 mb-4">
                      <button onClick={() => setShowMentorModal(true)} className="px-4 py-2 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 rounded-xl text-[10px] font-black uppercase tracking-widest text-amber-300 transition-all">
                        🎓 Mentor Ata
                      </button>
                      {squad.length >= 2 && (
                        <button onClick={() => {
                          const top2 = [...squad].sort((a, b) => b.rating - a.rating).slice(0, 2);
                          setComparePlayers([top2[0], top2[1]]);
                        }} className="px-4 py-2 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 rounded-xl text-[10px] font-black uppercase tracking-widest text-emerald-300 transition-all">
                          ⚖️ Oyuncu Karşılaştır
                        </button>
                      )}
                    </div>
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
                      teamPrimaryColor={profile?.primary_color}
                      teamSecondaryColor={profile?.secondary_color}
                      playerRoles={playerRoles}
                      onPlayerRolesChange={setPlayerRoles}
                      activeInstructions={activeInstructions}
                      onInstructionsChange={setActiveInstructions}
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
                    onRivalClick={(teamId, teamName) => setRivalInfo({ id: teamId, name: teamName })}
                  />
                  <RivalInfoModal
                    open={!!rivalInfo}
                    onClose={() => setRivalInfo(null)}
                    teamId={rivalInfo?.id || ''}
                    teamName={rivalInfo?.name || ''}
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
                  <InventoryTab userId={userId || undefined} onMarketRedirect={() => setActiveTab('multiplayer')} />
                </motion.div>
              )}
              {activeTab === 'newspaper' && (
                <motion.div key="newspaper" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <NewspaperTab />
                </motion.div>
              )}
              {/* MarketTab removed - transfer market is now in MultiplayerTab */}
              {activeTab === 'multiplayer' && userId && profile && (
                <motion.div key="multiplayer" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <div className="space-y-4">
                    <WatchlistAlertPanel userId={userId} />
                    <TransferNegotiationPanel userId={userId} />
                    <AgentInboxPanel userId={userId} />
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
                      teamName={profile?.team_name || 'Touchline FC'}
                      isAdmin={isAdmin}
                    />
                  </div>
                </motion.div>
              )}
              {activeTab === 'financial' && profile && (
                <motion.div key="financial" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <FinancialTab
                    profile={profile}
                    squad={squad}
                    leaguePosition={10}
                    leagueTier={1}
                    onAcceptSponsor={(sponsor) => {
                      const current = (profile.sponsors ?? []) as any[];
                      setProfile(p => ({ ...p, sponsors: [...current, sponsor] }));
                    }}
                  />
                </motion.div>
              )}

              {activeTab === 'youth' && (
                <motion.div key="youth" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <YouthAcademyTab
                    academyLevel={profile.academy_level || 1}
                    facilities={youthFacilities as any}
                    onUpgradeFacility={(id, cost) => {
                      if ((profile.money || 0) < cost) return;
                      // Bütçeden düş
                      setProfile(p => ({ ...p, money: (p.money || 0) - cost }));
                      // Tesis seviyesini güncelle (functional update to avoid stale closure)
                      setYouthFacilities(prev => {
                        const newLevel = (prev[id] || 1) + 1;
                        const newFacilities = { ...prev, [id]: newLevel };
                        // Supabase'e kaydet
                        if (profile.id) {
                          saveYouthFacilities(newFacilities, profile.id);
                        }
                        return newFacilities;
                      });
                    }}
                    onPromotePlayer={async (youthPlayer: YouthPlayer) => {
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
                        nation: youthPlayer.nation || 'TR',
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

                      // ── Supabase'e kaydet ──
                      if (isSupabaseConfigured() && profile?.id) {
                        try {
                          const supabase = getSupabase();
                          const playerRow = {
                            id: promotedPlayer.id,
                            profile_id: profile.id,
                            name: promotedPlayer.name,
                            position: promotedPlayer.position,
                            specific_position: promotedPlayer.specificPosition || null,
                            rating: promotedPlayer.rating,
                            age: promotedPlayer.age,
                            potential: promotedPlayer.potential,
                            market_value: promotedPlayer.market_value || 0,
                            salary: promotedPlayer.salary || 0,
                            nation: promotedPlayer.nation || 'TR',
                            team_name: profile.team_name,
                            defending: promotedPlayer.defending || 50,
                            passing: promotedPlayer.passing || 50,
                            shooting: promotedPlayer.shooting || 50,
                            speed: promotedPlayer.speed || 50,
                            power: promotedPlayer.power || 50,
                            goalkeeping: promotedPlayer.goalkeeping || 10,
                            vision: promotedPlayer.vision || 50,
                            control: promotedPlayer.control || 50,
                            heading: promotedPlayer.heading || 50,
                            traits: JSON.stringify(promotedPlayer.traits || []),
                            form_rating: 50,
                            is_injured: false,
                            is_free_agent: false,
                            contract_end_week: Math.ceil((profile.current_day || 1) / 7) + 34,
                            created_at: new Date().toISOString(),
                            updated_at: new Date().toISOString(),
                          };

                          const { error: insertErr } = await supabase
                            .from('players')
                            .upsert(playerRow);

                          if (insertErr) {
                            console.error('[onPromotePlayer] Supabase insert failed:', insertErr.message);
                          } else {
                            console.log(`[onPromotePlayer] ${promotedPlayer.name} A takima eklendi (DB)`);
                          }

                          // Genç oyuncuyu youth_players tablosundan sil
                          await supabase
                            .from('youth_players')
                            .delete()
                            .eq('id', youthPlayer.id);

                        } catch (err) {
                          console.error('[onPromotePlayer] Supabase error:', err);
                        }
                      }
                    }}
                    budget={profile.money || 0}
                    credits={profile.credits || 0}
                    onDeductCredits={(amount: number) => {
                      setProfile(p => {
                        if (!p) return p;
                        const newCredits = (p.credits || 0) - amount;
                        // Save credits to Supabase immediately
                        if (p.id) {
                          saveCredits(newCredits, p.id);
                        }
                        return { ...p, credits: newCredits };
                      });
                    }}
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
                  <CupTab cupSeasons={cupSeasons} teamName={profile?.team_name || ''} />
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
              {activeTab === 'reports' && userId && (
                <motion.div key="reports" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <WeeklyReportTab userId={userId} />
                </motion.div>
              )}

              {activeTab === 'settings' && profile && (
                <motion.div key="settings" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-14 h-14 bg-zinc-800 border border-white/10 rounded-2xl flex items-center justify-center">
                      <Cog size={24} className="text-white/60" />
                    </div>
                    <div>
                      <h1 className="text-2xl font-black text-white uppercase tracking-tighter">Ayarlar</h1>
                      <p className="text-sm text-white/40">Bildirimler ve tercihlerini yönet</p>
                    </div>
                  </div>
                  <NotificationSettings profileId={profile.id} />

                  {/* ── Tema Seçimi ── */}
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-black text-white uppercase tracking-wider">Tema</h3>
                        <p className="text-[10px] text-white/30 mt-1">Görünüm tercihini değiştir</p>
                      </div>
                      <ThemeToggle />
                    </div>
                  </div>
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
            profileId={profile?.id}
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
          onClose={() => {
            setShowSeasonAwards(false);
            setShowNewSeasonBriefing(true);
          }}
          profileId={profile.id}
          seasonId={lastCompletedSeasonId}
          teamName={profile.team_name}
        />
      )}

      {/* New Season Briefing */}
      <NewSeasonBriefing
        isOpen={showNewSeasonBriefing}
        onClose={() => setShowNewSeasonBriefing(false)}
        newLeagueName={newSeasonInfo.leagueName}
        wasPromoted={newSeasonInfo.promoted}
        wasRelegated={newSeasonInfo.relegated}
        season={newSeasonInfo.season}
        retiredPlayers={newSeasonInfo.retiredPlayers}
      />

      {/* Yakında Modal — Operasyon Odası vb. */}
      {showComingSoon && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={() => setShowComingSoon(false)}>
          <div className="bg-[#111820] border border-white/10 rounded-2xl p-8 text-center max-w-sm mx-4" onClick={e => e.stopPropagation()}>
            <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap size={28} className="text-amber-400" />
            </div>
            <h3 className="text-lg font-black uppercase tracking-tighter text-white mb-2">Yakında!</h3>
            <p className="text-sm text-white/50 mb-6">Bu bölüm şu anda geliştirme aşamasındadır. Yakında aktif olacaktır.</p>
            <button
              onClick={() => setShowComingSoon(false)}
              className="px-6 py-2 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 rounded-xl text-[10px] font-black uppercase tracking-widest text-amber-300 transition-all"
            >
              Tamam
            </button>
          </div>
        </div>
      )}

      {userId && profile && (
        <RivalMessagingPanel 
          userId={userId}
          userName={profile.manager_name || 'Manager'}
          teamName={profile.team_name || 'Touchline FC'}
        />
      )}

      {/* ── Mentor Assignment Modal ── */}
      <MentorAssignment
        open={showMentorModal}
        onClose={() => setShowMentorModal(false)}
        userId={userId || ''}
        players={(squad || []).map(p => ({
          id: p.id,
          name: p.name,
          age: p.age,
          position: p.position,
          ovr: p.rating,
          leadership: (p as any).leadership,
        }))}
      />

      {/* ── Player Comparison Modal ── */}
      <PlayerComparisonModal
        open={!!comparePlayers}
        onClose={() => setComparePlayers(null)}
        player1={comparePlayers?.[0]}
        player2={comparePlayers?.[1]}
      />
    </div>
  );
}
