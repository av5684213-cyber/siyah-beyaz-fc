'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import TacticsCommandCenter from './TacticsCommandCenter';
import PostMatchSummary from './PostMatchSummary';
import { UpdatePlayerStats } from '@/lib/fm/evolution';
import { tryMatchTraitGrowth } from '@/lib/fm/trainingEngine';
import { syncPlayerStats } from '@/lib/fm/helpers';
import type { Player, MatchState, GameTactics, MatchResult, ActiveTactic } from '@/lib/fm/types';
import { detectEmotionalEvents, emitEmotionalEvent } from '@/lib/fm/emotionalEvents';
import { matchEngine as unifiedMatchEngine } from '@/lib/fm/enhancedMatchEngine';
import { calculateTeamPlayStyleModifiers } from '@/lib/fm/playStyles';
import { generateLeagueReferees, pickRefereeForMatch, getRefereeDisplayInfo, type RefereePersonality } from '@/lib/fm/referee';
import { isMatchDay, isMatchTime, computeMatchDateFromDay } from '@/lib/fm/schedule';
import { getSupabase } from '@/lib/supabase';
import { toTitleCase } from '@/lib/fm/ui-helpers';
import { addHours } from 'date-fns';
import { getDefaultActiveTactic, getFormationSlotPositions } from '@/lib/fm/types';
import { STRATEGY_TACTICS } from '@/components/match/LiveStrategyPanel';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

// (Simulation flags moved to useRef inside component to avoid shared state across instances)

/** Check if current time (Europe/Istanbul = UTC+3) is a match hour (weekday 12:xx or 18:xx, full hour window) */
function isMatchHourNow(): boolean {
  const now = new Date();
  const trDate = addHours(now, 3); // UTC+3 for Europe/Istanbul
  const dayOfWeek = trDate.getDay(); // 0=Sun, 6=Sat
  const isWeekday = dayOfWeek >= 1 && dayOfWeek <= 5;
  const hour = trDate.getHours();
  return isWeekday && (hour === 12 || hour === 18);
}

/** Match Day Time Lock Warning Banner */
function MatchTimeWarningBanner() {
  return (
    <div className="relative overflow-hidden border border-amber-500/30 bg-gradient-to-r from-amber-950/80 via-amber-900/60 to-amber-950/80 rounded-lg px-4 py-3 mb-4">
      {/* Animated accent line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent animate-pulse" />
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0 w-9 h-9 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-amber-400">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-amber-200 text-sm font-bold tracking-wide">Maç saatleri hafta içi 12:00 ve 18:00&apos;dir</p>
          <p className="text-amber-400/60 text-[10px] font-medium tracking-wider uppercase mt-0.5">
            Şu an maç saati değil — sayfa görüntülenebilir ancak canlı maç özelliği devre dışı
          </p>
        </div>
        <div className="flex-shrink-0 hidden sm:flex items-center gap-1 px-2 py-1 rounded bg-amber-500/10 border border-amber-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500/50" />
          <span className="text-[9px] font-bold text-amber-400/70 uppercase tracking-widest">Beklemede</span>
        </div>
      </div>
    </div>
  );
}

interface MatchDayProps {
  profile: any;
  homeTeam: Player[];
  awayTeam: Player[];
  bench?: Player[];
  matchState: MatchState;
  setMatchState: React.Dispatch<React.SetStateAction<MatchState>>;
  onMatchEnd?: (results: MatchResult & { evolvedPlayers?: Player[] }) => void;
  activeTactic?: ActiveTactic;
  onPlayerClick?: (player: Player) => void;
  activeOperations?: string[];
  isTestMode?: boolean;
  setIsTestMode?: (val: boolean) => void;
  // Referee info
  refereeName?: string;
  refereePersonality?: RefereePersonality;
  refereeStrictness?: number;
  // Role system
  playerRoles?: Record<string, string>;
  // Away team real tactics (profile_id for Supabase query)
  awayProfileId?: string;
  // Tactical score from TacticsCommandCenter (0-100 overall)
  tacticalScore?: {
    overall: number;
    roleCompatibility: number;
    instructionSynergy: number;
  };
  // Match date (YYYY-MM-DD) — for deterministic weather sync with fixture page
  matchDate?: string;
}

const MatchDay = ({ 
  profile,
  homeTeam: initialHomeTeam = [], 
  awayTeam: initialAwayTeam = [], 
  bench: initialBench = [],
  matchState,
  setMatchState,
  onMatchEnd = () => {},
  activeTactic,
  onPlayerClick,
  activeOperations = [],
  isTestMode = false,
  setIsTestMode,
  refereeName,
  refereePersonality,
  refereeStrictness,
  playerRoles,
  awayProfileId,
  tacticalScore,
  matchDate,
}: MatchDayProps) => {
  const router = useRouter();
  const simulationStartedRef = useRef(false);
  const concurrentGuardRef = useRef(false);
  const [activeTab, setActiveTab] = useState<string>('commentary');
  const [liveFixtureId, setLiveFixtureId] = useState<string | null>(null);
  
  // Schedule-based cycle status (replaces GameCycleManager)
  //
  // SEZON KURALARI (KULLANICI NET TALEBİ):
  // - Lig 18 takım, çift devreli round-robin = 34 tur (her takım 34 maç)
  // - Her tur 9 maç, 10'ar dk arayla oynanır (12:00-13:30 veya 18:00-19:30)
  // - Hafta içi 5 gün (Pzt-Cum), her gün 2 tur: 12:00 + 18:00
  // - Hafta sonu (Cmt-Paz) lige ara
  // - 34 tur bittiğinde → pazartesiye kadar sezon ara
  // - Cuma 18:00 sonrası = hafta sonu zaten ara (sezon devam ediyorsa)
  //
  // 34 tur / günde 2 tur = 17 iş günü = 3 hafta + 2 gün
  // Sezon Pzt başlar → 3 hafta sonra Salı 18:00'de 34. tur oynanır → Çar günü sezon ara
  //
  // SEASON_START: ilk pazartesi. Şimdilik hardcoded — ileride Supabase seasons.start_date'den okunabilir.
  const SEASON_START = new Date('2026-06-22T00:00:00+03:00'); // Pzt, 22 Haziran 2026
  const TOTAL_TURS = 34;
  const TURS_PER_DAY = 2; // 12:00 + 18:00

  const getCycleStatus = useCallback(() => {
    const now = new Date();
    const trDate = addHours(now, 3);
    const dayOfWeek = trDate.getDay(); // 0=Pazar, 1=Pzt, ..., 6=Cumartesi
    const currentHour = trDate.getHours();
    const currentMinute = trDate.getMinutes();
    const isWeekday = dayOfWeek >= 1 && dayOfWeek <= 5;

    const dayNames = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
    const nextWeekday = () => {
      const daysUntilMon = dayOfWeek === 0 ? 1 : 8 - dayOfWeek;
      return dayNames[(dayOfWeek + daysUntilMon) % 7];
    };

    const totalMinutes = currentHour * 60 + currentMinute; // 12:00=720, 13:30=810, 18:00=1080, 19:30=1170

    // ── İş günü sayısı (sezon başından bugüne, hafta sonları hariç) ──
    let workDays = 0;
    const cursor = new Date(SEASON_START);
    cursor.setHours(0, 0, 0, 0);
    const todayMidnight = new Date(trDate);
    todayMidnight.setHours(0, 0, 0, 0);

    while (cursor <= todayMidnight) {
      const dow = cursor.getDay();
      if (dow >= 1 && dow <= 5) workDays++;
      cursor.setDate(cursor.getDate() + 1);
    }

    // Bugünün turları (eğer sezon içindeysek)
    // workDays=1 → 1. gün → 12:00 tur=1, 18:00 tur=2
    // workDays=2 → 2. gün → 12:00 tur=3, 18:00 tur=4
    // ...
    // workDays=17 → 17. gün → 12:00 tur=33, 18:00 tur=34
    const morningTur = workDays > 0 ? (workDays - 1) * 2 + 1 : 0;
    const eveningTur = workDays > 0 ? (workDays - 1) * 2 + 2 : 0;

    // Bir sonraki pazartesi tarihini hesapla
    const nextMonday = new Date(todayMidnight);
    const daysToMon = dayOfWeek === 0 ? 1 : 8 - dayOfWeek;
    nextMonday.setDate(todayMidnight.getDate() + daysToMon);

    // ── HAFTA SONU → LİGE ARA ──
    if (!isWeekday) {
      return {
        phase: 'IDLE' as const,
        nextEventTime: `${nextWeekday()} 12:00`,
        countDownMinutes: 0,
        isTrainingWindow: false,
        currentSlot: null,
        nextSlot: `${nextWeekday()} 12:00` as const,
        previousSlot: 'HAFTA SONU LİGE ARA VERİLDİ' as const,
        reason: 'WEEKEND' as const,
        workDays,
        morningTur,
        eveningTur,
      };
    }

    // ── SEZON BİTTİ (workDays > 17) → PAZARTESİYE KADAR ARA ──
    if (workDays > 17) {
      return {
        phase: 'IDLE' as const,
        nextEventTime: `${dayNames[nextMonday.getDay()]} 12:00`,
        countDownMinutes: 0,
        isTrainingWindow: false,
        currentSlot: null,
        nextSlot: `${dayNames[nextMonday.getDay()]} 12:00` as const,
        previousSlot: '34 TUR TAMAMLANDI - SEZON BİTTİ' as const,
        reason: 'SEASON_END' as const,
        workDays,
        morningTur: 0,
        eveningTur: 0,
      };
    }

    // ── HAFTA İÇİ, SEZON DEVAM EDİYOR ──
    // SLOT 1 CANLI: 12:00 (720) - 13:30 (810) — 9 maç sırayla
    if (totalMinutes >= 720 && totalMinutes < 810) {
      const matchIndex = Math.floor((totalMinutes - 720) / 10);
      const matchStartMin = 720 + matchIndex * 10;
      const matchStartTime = `${String(Math.floor(matchStartMin / 60)).padStart(2, '0')}:${String(matchStartMin % 60).padStart(2, '0')}`;
      return {
        phase: 'LIVE_MATCH' as const,
        nextEventTime: '13:30',
        countDownMinutes: 810 - totalMinutes,
        isTrainingWindow: false,
        currentSlot: '12:00' as const,
        slotLabel: 'ÖĞLE SLOTU' as const,
        nextSlot: '18:00' as const,
        currentMatchIndex: matchIndex,
        currentMatchTime: matchStartTime,
        matchesLeft: 9 - matchIndex,
        previousSlot: null,
        reason: null as any,
        workDays,
        morningTur,
        eveningTur,
      };
    }

    // SLOT 2 CANLI: 18:00 (1080) - 19:30 (1170)
    if (totalMinutes >= 1080 && totalMinutes < 1170) {
      const matchIndex = Math.floor((totalMinutes - 1080) / 10);
      const matchStartMin = 1080 + matchIndex * 10;
      const matchStartTime = `${String(Math.floor(matchStartMin / 60)).padStart(2, '0')}:${String(matchStartMin % 60).padStart(2, '0')}`;
      const isLastTurOfDay = eveningTur >= TOTAL_TURS;
      return {
        phase: 'LIVE_MATCH' as const,
        nextEventTime: '19:30',
        countDownMinutes: 1170 - totalMinutes,
        isTrainingWindow: false,
        currentSlot: '18:00' as const,
        slotLabel: 'AKŞAM SLOTU' as const,
        nextSlot: isLastTurOfDay ? 'Yeni Sezon Pazartesi 12:00' as const : 'Yarın 12:00' as const,
        currentMatchIndex: matchIndex,
        currentMatchTime: matchStartTime,
        matchesLeft: 9 - matchIndex,
        previousSlot: '12:00 (9 maç oynandı)' as const,
        reason: isLastTurOfDay ? 'LAST_TUR' as const : null as any,
        workDays,
        morningTur,
        eveningTur,
      };
    }

    // Sabah 10:00'dan önce → bekleme
    if (totalMinutes < 600) {
      return {
        phase: 'IDLE' as const,
        nextEventTime: '12:00',
        countDownMinutes: 720 - totalMinutes,
        isTrainingWindow: false,
        currentSlot: null,
        nextSlot: '12:00' as const,
        reason: null as any,
        workDays,
        morningTur,
        eveningTur,
      };
    }

    // 10:00 - 11:59 → 12:00 ÖĞLE slot'una hazırlık
    if (totalMinutes >= 600 && totalMinutes < 720) {
      return {
        phase: 'PRE_MATCH' as const,
        nextEventTime: '12:00',
        countDownMinutes: 720 - totalMinutes,
        isTrainingWindow: false,
        currentSlot: null,
        nextSlot: '12:00' as const,
        slotLabel: 'ÖĞLE SLOTU' as const,
        previousSlot: null,
        reason: null as any,
        workDays,
        morningTur,
        eveningTur,
      };
    }

    // 13:30 - 17:59 → Öğle slot bitti, akşam slot bekleniyor
    if (totalMinutes >= 810 && totalMinutes < 1080) {
      const isLastDay = eveningTur >= TOTAL_TURS;
      return {
        phase: 'PRE_MATCH' as const,
        nextEventTime: '18:00',
        countDownMinutes: 1080 - totalMinutes,
        isTrainingWindow: false,
        currentSlot: null,
        nextSlot: '18:00' as const,
        slotLabel: 'AKŞAM SLOTU' as const,
        previousSlot: isLastDay ? `12:00 (Tur ${morningTur}/${TOTAL_TURS} - SON TUR)` as const : `12:00 (Tur ${morningTur}/${TOTAL_TURS} oynandı)` as const,
        reason: null as any,
        workDays,
        morningTur,
        eveningTur,
      };
    }

    // 19:30+ → gün bitti
    // Eğer bu son tur günüydüyse → sezon bitti
    if (eveningTur >= TOTAL_TURS) {
      return {
        phase: 'IDLE' as const,
        nextEventTime: `${dayNames[nextMonday.getDay()]} 12:00`,
        countDownMinutes: 0,
        isTrainingWindow: false,
        currentSlot: null,
        nextSlot: `${dayNames[nextMonday.getDay()]} 12:00` as const,
        previousSlot: '34 TUR TAMAMLANDI - SEZON BİTTİ' as const,
        reason: 'SEASON_END' as const,
        workDays,
        morningTur: 0,
        eveningTur: 0,
      };
    }

    // Cuma 18:00 sonrası → hafta sonu başlıyor
    const isFriday = dayOfWeek === 5;
    return {
      phase: 'IDLE' as const,
      nextEventTime: isFriday ? `${nextWeekday()} 12:00` : 'Yarın 12:00',
      countDownMinutes: 0,
      isTrainingWindow: false,
      currentSlot: null,
      nextSlot: isFriday ? `${nextWeekday()} 12:00` as const : 'Yarın 12:00' as const,
      previousSlot: `Tur ${morningTur} + ${eveningTur}/${TOTAL_TURS} oynandı${isFriday ? ' - HAFTA SONU ARA' : ''}` as const,
      reason: isFriday ? ('FRIDAY_END' as const) : null as any,
      workDays,
      morningTur,
      eveningTur,
    };
  }, []);

  const [cycleStatus, setCycleStatus] = useState(getCycleStatus);
  const { minute: gameMinute, score, result: matchResult, visibleEvents, isFinished: isMatchFinished, isActive, playerConditions } = matchState;

  // Time Lock: check if current hour is a match time (weekday 12:00 or 18:00 Istanbul)
  // Re-check every minute
  const [isCurrentlyMatchTime, setIsCurrentlyMatchTime] = useState(isMatchHourNow);
  useEffect(() => {
    setIsCurrentlyMatchTime(isMatchHourNow());
    const timer = setInterval(() => {
      setIsCurrentlyMatchTime(isMatchHourNow());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // ── Canlı maç fixture ID çek ──
  useEffect(() => {
    if (!profile?.id || !profile?.team_name) return;
    const supabase = getSupabase();
    if (!supabase) return;
    const check = async () => {
      try {
        const { data: teamRow } = await supabase
          .from('league_teams').select('id').eq('profile_id', profile.id).maybeSingle();
        if (!teamRow) return;
        const { data: sessions } = await supabase
          .from('match_sessions')
          .select('fixture_id')
          .or(`home_team_id.eq.${teamRow.id},away_team_id.eq.${teamRow.id}`)
          .in('status', ['live', 'halftime'])
          .limit(1);
        if (sessions && sessions[0]?.fixture_id) {
          setLiveFixtureId(sessions[0].fixture_id);
        } else {
          setLiveFixtureId(null);
        }
      } catch { setLiveFixtureId(null); }
    };
    check();
    const id = setInterval(check, 30000);
    return () => clearInterval(id);
  }, [profile?.id, profile?.team_name]);
  // Show warning when NOT match time AND there's no active live match
  const showTimeWarning = !isCurrentlyMatchTime && !isActive;
  
  // Auto-generate referee for current match week if not provided via props
  const autoReferee = useMemo(() => {
    if (refereeName) return null; // props'tan gelmişse kullanma
    const currentDay = profile?.current_day || 1;
    const matchWeek = Math.ceil(currentDay / 2); // 2 maç/gün
    const leagueId = profile?.league_id || profile?.id || 'default';
    const referees = generateLeagueReferees(leagueId, 6);
    return pickRefereeForMatch(referees, matchWeek);
  }, [refereeName, profile?.current_day, profile?.league_id, profile?.id]);

  const effectiveRefereeName = refereeName || autoReferee?.name;
  const effectiveRefereePersonality = refereePersonality || (autoReferee?.personality as RefereePersonality | undefined);
  const effectiveRefereeStrictness = refereeStrictness || autoReferee?.strictness;

  // Real-time clock advancement is handled by the parent Page component
  // to ensure a single source of truth for the Match Engine.

  // Real-time cycle updater
  useEffect(() => {
    const timer = setInterval(() => {
      setCycleStatus(getCycleStatus());
    }, 10000);
    return () => clearInterval(timer);
  }, [getCycleStatus]);

  const [homeSquad, setHomeSquad] = useState<Player[]>([]); 
  const [bench, setBench] = useState<Player[]>([]); 

  useEffect(() => {
    if (initialHomeTeam?.length > 0) {
      setHomeSquad([...initialHomeTeam]);
    }
  }, [initialHomeTeam]);

  useEffect(() => {
    if (initialBench?.length > 0) {
      setBench([...initialBench]);
    }
  }, [initialBench]);

  const [gameTactics, setGameTactics] = useState<GameTactics>(activeTactic ? {
    mentality: 3,
    pressing: false,
    passingStyle: 'Karışık',
    formation: '4-4-2',
    lineHeight: 50,
    width: 50,
    aggression: 50,
    passingIntensity: 50,
    screenKeeper: false,
    wasteTime: false,
    ...activeTactic,
    formation: (activeTactic as any).formation || (activeTactic as any).tactic_type || '4-4-2'
  } : {
    mentality: 3,
    pressing: false,
    passingStyle: 'Karışık',
    formation: '4-4-2',
    lineHeight: 50,
    width: 50,
    aggression: 50,
    passingIntensity: 50,
    screenKeeper: false,
    wasteTime: false
  });

  // Track current live strategy (for tactic modifiers: goalMod/conceedMod)
  const [currentLiveStrategy, setCurrentLiveStrategy] = useState<string>('dengeli');

  const [subbingPlayer, setSubbingPlayer] = useState<Player | null>(null);
  const [subsUsed, setSubsUsed] = useState(0);
  const MAX_SUBS = 5;
  const [lastGoal, setLastGoal] = useState<MatchResult['events'][0] | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialHomeTeam.length > 0 && Object.keys(playerConditions).length === 0) {
      const initialConditions: Record<string, number> = {};
      initialHomeTeam.forEach(p => initialConditions[p.id] = (p.cond || 100));
      setMatchState(prev => ({ ...prev, playerConditions: initialConditions }));
    }
  }, [initialHomeTeam, playerConditions, setMatchState]);

  const runSimulation = useCallback(async (currentMin?: number, currentScore?: {home: number, away: number}, customSquad?: Player[], customTactics?: GameTactics) => {
    // Race condition guard: eğer zaten simülasyon çalışıyorsa tekrar başlatma
    if (concurrentGuardRef.current) {
      console.log('[MatchDay] runSimulation atlandı — zaten simülasyon çalışıyor');
      return;
    }
    concurrentGuardRef.current = true;
    
    try {
      // Robust defaults for simulation
      let effectiveHomeSquad = customSquad || homeSquad;

      // ── Formation-based position assignment ──
      // Apply assignedPositions from tactics so the match engine uses the correct
      // specificPosition for each starter (e.g. a player placed in RB slot plays as RB)
      const effectiveTactic = activeTactic || customTactics || gameTactics || getDefaultActiveTactic();
      if (effectiveHomeSquad.length > 0 && effectiveTactic) {
        // Priority: 1) assignedPositions from ActiveTactic, 2) formation slot mapping, 3) player's natural position
        const slotPositions = getFormationSlotPositions(effectiveTactic.formation || '4-4-2');
        effectiveHomeSquad = effectiveHomeSquad.map((p, idx) => {
          // Check assignedPositions first (explicit user assignment)
          const assignedPos = effectiveTactic.assignedPositions?.[p.id];
          // Then check formation slot for starters (first 11)
          const slotPos = idx < 11 && idx < slotPositions.length ? slotPositions[idx] : undefined;
          const newSpecificPosition = assignedPos || slotPos || p.specificPosition || p.position;
          return {
            ...p,
            specificPosition: newSpecificPosition as any,
            // Also update broad position group if the assigned position belongs to a different group
            position: (['GK'].includes(newSpecificPosition) ? 'GK' :
                       ['CB','LB','RB','LWB','RWB'].includes(newSpecificPosition) ? 'DEF' :
                       ['CDM','CM','CAM','LM','RM','LW','RW'].includes(newSpecificPosition) ? 'MID' :
                       ['CF','ST'].includes(newSpecificPosition) ? 'FWD' : p.position) as any,
          };
        });
      }

      // Ensure we have some opponent if awayTeam is missing
      let effectiveAwayTeam = (initialAwayTeam && initialAwayTeam.length > 0) ? initialAwayTeam : [];
      if (effectiveAwayTeam.length === 0) {
        // Generate a quick dummy opponent if needed
        for (let i = 0; i < 11; i++) {
          const dummyP = { ...effectiveHomeSquad[i % effectiveHomeSquad.length], id: `dummy_${i}`, name: `Rakip ${i+1}` };
          effectiveAwayTeam.push(dummyP);
        }
      }
      
      if (!effectiveHomeSquad || effectiveHomeSquad.length === 0) {
        toast.error("Kadro bulunamadı! Simülasyon başlatılamıyor.");
        return;
      }

      // Reset match state before starting — preserve visibleEvents so commentary is not lost
      setMatchState(prev => ({
        ...prev,
        minute: currentMin || 0,
        score: currentScore || {home: 0, away: 0},
        isActive: true,
        isFinished: false,
        isPaused: false,
        // Don't clear visibleEvents — preserve match commentary
      }));

      // Resolve tactic modifiers from current live strategy
      const strategyDef = STRATEGY_TACTICS.find(t => t.id === currentLiveStrategy) || STRATEGY_TACTICS[0];
      const homeTacticModifiers = {
        goalMod: strategyDef.goalMod,
        conceedMod: strategyDef.conceedMod,
        counterMod: strategyDef.counterMod,
      };

      // Play style modifiers — kullanıcı oyun stili seçtiğinde maç motoruna yansıt
      const homePlayStyle = (customTactics || gameTactics)?.playStyle || (activeTactic as any)?.playStyle || 'dengeli';
      const homePSMods = calculateTeamPlayStyleModifiers(
        effectiveHomeSquad.slice(0, 11),
        homePlayStyle
      );

      const result = await unifiedMatchEngine.runScheduledMatch(effectiveHomeSquad, effectiveAwayTeam, {
        homeTactics: customTactics || gameTactics,
        activeTactic: effectiveTactic,
        homeTeamName: profile?.team_name || 'Benim Takımım',
        awayTeamName: 'Rakip Takım',
        homeOperations: activeOperations,
        stadiumUpgrades: profile?.stadium_upgrades,
        startMinute: currentMin || 0,
        currentScore: currentScore || {home: 0, away: 0},
        // Pass referee data to engine
        refereeName: effectiveRefereeName || undefined,
        refereePersonality: effectiveRefereePersonality || undefined,
        refereeStrictness: effectiveRefereeStrictness || undefined,
        // Pass player roles for attribute bonuses
        playerRoles: playerRoles,
        // Pass tactic modifiers from live strategy
        homeTacticModifiers,
        // Pass play style modifiers (gegenpressing, tiki-taka, vb.)
        homePlayStyleModifiers: homePSMods,
        // Pass away team profile ID for real tactics from DB
        awayProfileId: awayProfileId,
        // Let the engine auto-detect night/winter conditions
        isNightMatch: undefined,
        isWinterMatch: undefined,
        // Pass tactical score from TacticsCommandCenter
        tacticalScore: tacticalScore,
        // Pass match date for deterministic weather sync with fixture page
        matchDate: matchDate || computeMatchDateFromDay(profile?.current_day || 1),
      });
      
      setMatchState(prev => ({
        ...prev,
        result: result,
        isActive: true 
      }));
    } catch (err) {
      console.error("Match Simulation Error:", err);
      toast.error("Simülasyon sırasında bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      concurrentGuardRef.current = false;
    }
  }, [homeSquad, initialAwayTeam, activeTactic, activeOperations, gameTactics, setMatchState, profile?.team_name, profile?.stadium_upgrades, profile?.current_day, matchDate]);

  const finalizeMatch = useCallback(() => {
    if (matchState.isFinished || !simulationStartedRef.current) return;
    
    setMatchState(prev => ({ ...prev, isFinished: true, isActive: false }));
    simulationStartedRef.current = false;
    
    if (!matchResult) {
      return;
    }

    const evolvedPlayers = homeSquad.map(player => {
        // Gerçek rating'i maç motorundan al, yoksa varsayılan 6.0 (rastgele değil, sabit)
        const rating = matchResult.playerRatings[player.id] ?? 6.0;
        const staminaLossVal = matchResult.staminaLoss[player.id] || 5;
        const stats = matchResult.playerStats[player.id] || { goals: 0, assists: 0 };
        const gains = matchResult.statsGains?.[player.id] || {};
        
        // match_ratings dizisini güncelle (son 5 maç)
        const updatedMatchRatings = [...(player.match_ratings || []), rating];
        if (updatedMatchRatings.length > 5) updatedMatchRatings.shift();

        // form_rating: son 5 maç ortalamasını hesapla (0-100 skalası)
        const formRating = updatedMatchRatings.length > 0
          ? Math.round((updatedMatchRatings.reduce((s, r) => s + r, 0) / updatedMatchRatings.length) * 10)
          : (player.form_rating ?? 50);

        // RULE 4: Apply farming multiplier based on goal count
        const farmingMult = matchResult.farmingMultipliers?.[player.id] || { [player.id]: 1.0 }[player.id] || 1.0;
        let evolved = UpdatePlayerStats(player, rating, farmingMult);
        
        // Apply individual stat gains from match performance
        Object.entries(gains).forEach(([stat, gain]) => {
           (evolved as any)[stat] = ((evolved as any)[stat] || 50) + gain;
        });

        // Sync with Turkish stats and cap at potential
        evolved = syncPlayerStats(evolved);
        
        // Accumulate Detailed Stats
        const newGoalStats = { ...(evolved.goalStats || {}) };
        if (stats.goalDetails) {
          Object.entries(stats.goalDetails).forEach(([type, count]) => {
            (newGoalStats as any)[type] = ((newGoalStats as any)[type] || 0) + count;
          });
        }

        const newSaveStats = { ...(evolved.saveStats || {}) };
        if (stats.saveDetails) {
          Object.entries(stats.saveDetails).forEach(([type, count]) => {
            (newSaveStats as any)[type] = ((newSaveStats as any)[type] || 0) + count;
          });
        }

        // v2: Maç bazlı trait growth — potansiyeli yüksek gençler iyi maç çıkarırsa trait kazanabilir
        let updatedTraits = [...(evolved.traits || [])];
        const matchTrait = tryMatchTraitGrowth(player, rating, stats.goals);
        if (matchTrait && !updatedTraits.includes(matchTrait)) {
          updatedTraits.push(matchTrait);
        }
        
        return {
            ...evolved,
            cond: Math.max(0, (playerConditions[player.id] || 100) - staminaLossVal),
            goals: (player.goals || 0) + stats.goals,
            assists: (player.assists || 0) + stats.assists,
            yellow_cards: (player.yellow_cards || 0) + (stats.yellowCards || 0),
            red_cards: (player.red_cards || 0) + (stats.redCards || 0),
            last_match_rating: rating,
            match_ratings: updatedMatchRatings,
            form_rating: Math.max(0, Math.min(100, formRating)),
            traits: updatedTraits,
            goalStats: newGoalStats,
            saveStats: newSaveStats,
        };
    });

    setHomeSquad(evolvedPlayers);
    onMatchEnd({ ...matchResult, evolvedPlayers });

    // Duygusal olay tespiti (şampiyonluk, hat-trick, son dakika golü, kariyer ilk gol)
    try {
      const emotionalEvents = detectEmotionalEvents({
        players: evolvedPlayers,
        profile: profile,
        matchResult: matchResult,
      });
      for (const event of emotionalEvents) {
        emitEmotionalEvent(event);
      }
    } catch (err) {
      console.warn('[MatchDay] Emotional event detection failed:', err);
    }
  }, [matchResult, homeSquad, playerConditions, onMatchEnd, setMatchState, matchState.isFinished]);

  // ── CLIENT-SIDE MAÇ SİMÜLASYONU DEVRE DIŞI ──
  // Maçlar artık sunucu tarafında (match-scheduler + match-tick cron) oynanıyor.
  // Kullanıcının tarayıcısı kapalı olsa bile maç otomatik oynanır.
  // Client-side simülasyon SADECE test modu veya tekrar izleme için aktif.
  // useEffect(() => {
  //   if (cycleStatus.phase === 'LIVE_MATCH' && homeSquad.length > 0 && initialAwayTeam.length > 0 && gameMinute === 0 && !isActive && !_simulationStarted) {
  //     _simulationStarted = true;
  //     setSubsUsed(0);
  //     runSimulation();
  //   }
  // }, [homeSquad, initialAwayTeam, gameMinute, isActive, gameTactics, runSimulation, cycleStatus.phase]);

  useEffect(() => {
    const isActuallyFinished = visibleEvents.some(e => e.type === 'FULLTIME');
    if (isActuallyFinished && matchResult && !isMatchFinished) {
       finalizeMatch();
    }
  }, [matchResult, isMatchFinished, visibleEvents, finalizeMatch]);

  const renderCommentaryText = (text: string): React.ReactNode[] => {
    if (!text) return [];
    
    const parts = text.split(/(\{.*?\})/g);
    
    return parts.map((part, i) => {
      if (part.startsWith('{') && part.endsWith('}')) {
        const content = part.slice(1, -1);
        const [team, name] = content.split(':');
        
        let className = "px-1 rounded-sm font-bold mx-0.5 shadow-sm ";
        if (team === 'HOME') {
          className += "bg-white text-black";
        } else if (team === 'AWAY') {
          className += "bg-yellow-400 text-black";
        } else {
          className += "bg-white/10 text-white";
        }
        
        return (
          <span key={i} className={className}>
            {toTitleCase(name)}
          </span>
        );
      }
      return <span key={i} className="text-white/80">{part}</span>;
    });
  };

  const lastProcessedMinuteRef = useRef<number>(-1);

  useEffect(() => {
    if (!matchResult || (gameMinute === 0 && !visibleEvents.length && !isActive)) return;

    const currentEvents = matchResult.events.filter(e => e.minute === gameMinute);
    const isHalftime = currentEvents.some(e => e.type === 'HALFTIME');
    const isFulltime = currentEvents.some(e => e.type === 'FULLTIME');

    if (lastProcessedMinuteRef.current === gameMinute && !isHalftime && !isFulltime) return;
    lastProcessedMinuteRef.current = gameMinute;

    if ((isHalftime || isFulltime) && !matchState.isPaused) {
        setMatchState(prev => ({
            ...prev,
            visibleEvents: [...currentEvents, ...prev.visibleEvents],
            isPaused: true
        }));
        
        if (isHalftime) {
            const halftimeTimer = setTimeout(() => {
                // Maç bittiyse ikinci yarıyı başlatma
                if (matchState.isFinished) return;
                setMatchState(prev => ({ ...prev, isPaused: false, minute: 46 }));
            }, 3000);
            return () => clearTimeout(halftimeTimer);
        }
        return;
    }

    if (matchState.isPaused) return;

    const goals = currentEvents.filter(e => e.type === 'GOAL');

    if (goals.length > 0) {
        setLastGoal(goals[goals.length - 1]);
        
        setMatchState(prev => {
            // Calculate what the score SHOULD be at this minute from matchResult
            const expectedScore = { home: 0, away: 0 };
            matchResult.events.filter(e => e.minute <= gameMinute && e.type === 'GOAL').forEach(e => {
                if (e.team === 'HOME') expectedScore.home++;
                else if (e.team === 'AWAY') expectedScore.away++;
            });

            const nextSummaryEvents = { ...prev.matchSummaryEvents };
            let hasSummaryChange = false;
            
            goals.forEach(ev => {
                const side = ev.team.toLowerCase() as 'home' | 'away';
                const isDup = nextSummaryEvents[side]?.some(s => s.minute === ev.minute && s.player === ev.player && s.type === ev.type);
                if (!isDup && side && nextSummaryEvents[side]) {
                    hasSummaryChange = true;
                    nextSummaryEvents[side] = [...nextSummaryEvents[side], {
                        minute: ev.minute,
                        displayMinute: ev.displayMinute,
                        player: ev.player || '',
                        type: ev.type
                    }].sort((a, b) => {
                        const getMin = (m: number | string) => typeof m === 'string' ? parseInt(m.split('+')[0]) + 0.5 : m;
                        return getMin(a.minute) - getMin(b.minute);
                    });
                }
            });

            const alreadyShowing = prev.visibleEvents.some(e => e.minute === gameMinute && e.type === 'GOAL');
            const nextEvents = alreadyShowing ? prev.visibleEvents : [...currentEvents, ...prev.visibleEvents];
            const hasEventChange = !alreadyShowing;
            const hasScoreChange = expectedScore.home !== prev.score.home || expectedScore.away !== prev.score.away;

            if (!hasScoreChange && !hasSummaryChange && !hasEventChange && prev.isPaused === false) {
              return prev;
            }

            return {
                ...prev,
                score: expectedScore,
                matchSummaryEvents: nextSummaryEvents,
                visibleEvents: nextEvents,
                isPaused: false
            };
        });
    } else {
        setMatchState(prev => {
            const nextConditions = { ...prev.playerConditions };
            homeSquad.forEach(p => {
                const loss = matchResult.staminaLoss[p.id] || 8;
                const drainPerMinute = loss / 90;
                nextConditions[p.id] = Math.max(0, (nextConditions[p.id] || 100) - drainPerMinute);
            });

            let nextEvents = [...prev.visibleEvents];
            let nextSummaryEvents = { ...prev.matchSummaryEvents };
            let hasSummaryChange = false;
            let hasEventChange = false;

            if (currentEvents.length > 0) {
                const alreadyShowing = prev.visibleEvents.some(e => e.minute === gameMinute && e.text === currentEvents[0].text);
                if (!alreadyShowing) {
                    nextEvents = [...currentEvents, ...prev.visibleEvents];
                    hasEventChange = true;
                    
                    currentEvents.forEach(ev => {
                        if (ev.type === 'YELLOW' || ev.type === 'RED' || ev.type === 'INJURY') {
                            const side = ev.team.toLowerCase() as 'home' | 'away';
                            if ((side === 'home' || side === 'away') && ev.player) {
                                const isDup = nextSummaryEvents[side].some(s => s.minute === ev.minute && s.player === ev.player && s.type === ev.type);
                                if (!isDup) {
                                    hasSummaryChange = true;
                                    nextSummaryEvents[side] = [...nextSummaryEvents[side], {
                                        minute: ev.minute,
                                        displayMinute: ev.displayMinute,
                                        player: ev.player,
                                        type: ev.type
                                    }].sort((a, b) => {
                                        const getMin = (m: number | string) => typeof m === 'string' ? parseInt(m.split('+')[0]) + 0.5 : m;
                                        return getMin(a.minute) - getMin(b.minute);
                                    });
                                }
                            }
                        }
                    });
                }
            }

            // ONLY update if something meaningful changed to avoid loops
            if (!hasEventChange && !hasSummaryChange && prev.isPaused === false) {
              // We could still check if conditions changed significantly, but minute updates are the main trigger
              // One more check: if we already did this for this minute
              if (prev.visibleEvents.length === nextEvents.length) {
                return prev;
              }
            }

            return {
                ...prev,
                visibleEvents: nextEvents,
                matchSummaryEvents: nextSummaryEvents,
                playerConditions: nextConditions,
                isPaused: false
            };
        });
    }
  }, [gameMinute, matchResult, isActive, homeSquad, setMatchState, visibleEvents.length, matchState.isPaused]);

  const handleTacticsChange = (key: string, value: unknown) => {
    if (key === 'SWAP') {
        const { players: swappedPlayers } = value as { players: Player[] };
        setHomeSquad(swappedPlayers);
        runSimulation(gameMinute, score, swappedPlayers, gameTactics);
        return;
    }

    if (key === 'SUBSTITUTE') {
        const { playerOutId, playerInId } = value as { playerOutId: string; playerInId: string };
        const playerIn = bench.find(p => p.id === playerInId);
        const playerOut = homeSquad.find(p => p.id === playerOutId);
        
        // Substitution limit check
        if (subsUsed >= MAX_SUBS) {
          setMatchState(prev => ({
            ...prev,
            visibleEvents: [{
              minute: gameMinute,
              type: 'TACTIC',
              team: 'NEUTRAL',
              text: `Maksimum değişiklik hakkı kullanıldı (${MAX_SUBS}/${MAX_SUBS}). Değişiklik yapılamaz.`
            }, ...prev.visibleEvents]
          }));
          return;
        }
        
        if (playerIn && playerOut) {
            const newSquad = homeSquad.map(p => p.id === playerOutId ? playerIn : p);
            setHomeSquad(newSquad);
            
            const newBench = bench.filter(p => p.id !== playerInId).concat(playerOut);
            setBench(newBench);
            
            // Run simulation first, then add event
            runSimulation(gameMinute, score, newSquad, gameTactics);
            setSubsUsed(prev => prev + 1);
            
            setMatchState(prev => ({
                ...prev,
                playerConditions: { ...prev.playerConditions, [playerInId]: 100 },
                visibleEvents: [{
                    minute: gameMinute,
                    type: 'SUB',
                    team: 'NEUTRAL',
                    text: `Dk ${gameMinute}: DEĞİŞİKLİK: ▲ ${playerIn?.name || 'Oyuncu'}  ▼ ${playerOut?.name || 'Oyuncu'}`
                }, ...prev.visibleEvents]
            }));
        }

        return;
    }

    const newTactics = { ...gameTactics, [key]: value };
    setGameTactics(newTactics);
    
    // Update live strategy when playStyle changes (for goalMod/conceedMod)
    if (key === 'playStyle' && typeof value === 'string') {
      setCurrentLiveStrategy(value);
    }
    
    let tacticMsg = "";
    if (key === 'mentality') {
      const texts = ["Çok Defansif", "Defansif", "Dengeli", "Ofansif", "Tam Hücum"];
      tacticMsg = `Oyun anlayışı ${texts[(value as number)-1]} olarak güncellendi.`;
    } else if (key === 'pressing') {
      tacticMsg = value ? "Tam saha pres emri verildi!" : "Baskı şiddeti düşürüldü.";
    } else if (key === 'lineHeight') {
      tacticMsg = `Savunma hattı ${(value as number) > 70 ? 'önde' : ((value as number) < 30 ? 'geride' : 'normal')} konumlandırıldı!`;
    } else if (key === 'aggression') {
      tacticMsg = `Mücadele sertliği ${(value as number) > 70 ? 'artırıldı! Kasap modu aktif!' : 'dengeleniyor.'}`;
    } else {
      tacticMsg = `${key === 'passingStyle' ? 'Pas stili' : 'Taktiksel ayar'} güncellendi.`;
    }

    // 2 Second Delay for management instructions to reach the pitch
    // Maç bittiyse taktik değişikliği simülasyonu tetikleme
    if (matchState.isFinished) return;
    const tacticTimer = setTimeout(() => {
        if (matchState.isFinished) return;
        setMatchState(prev => ({
          ...prev,
          visibleEvents: [{
            minute: gameMinute,
            type: 'TACTIC',
            team: 'NEUTRAL',
            text: `${gameMinute}. Dakika: ${tacticMsg}`
          }, ...prev.visibleEvents]
        }));
        runSimulation(gameMinute, score, homeSquad, newTactics);
    }, 2000);
    // Cleanup: bileşen unmount olursa timer'ı temizle
    return () => clearTimeout(tacticTimer);
  };

  const handleSubstitute = (playerIn: Player) => {
    if (!subbingPlayer || !playerIn) return;

    // Substitution limit check
    if (subsUsed >= MAX_SUBS) {
      setMatchState(prev => ({
        ...prev,
        visibleEvents: [{
          minute: gameMinute,
          type: 'TACTIC',
          team: 'NEUTRAL',
          text: `Maksimum değişiklik hakkı kullanıldı (${MAX_SUBS}/${MAX_SUBS}). Değişiklik yapılamaz.`
        }, ...prev.visibleEvents]
      }));
      setSubbingPlayer(null);
      return;
    }

    const newSquad = homeSquad.map(p => p.id === subbingPlayer.id ? playerIn : p);
    setHomeSquad(newSquad);

    // Run simulation with new squad first, then add substitution event
    runSimulation(gameMinute, score, newSquad, gameTactics);

    // Add substitution event after simulation
    setSubsUsed(prev => prev + 1);
    setMatchState(prev => ({
      ...prev,
      visibleEvents: [{
        minute: gameMinute,
        type: 'SUB',
        team: 'NEUTRAL',
        text: `DEĞİŞİKLİK: ▲ ${playerIn.name || 'Bilinmeyen'}  ▼ ${subbingPlayer?.name || 'Bilinmeyen'}`
      }, ...(prev.visibleEvents || [])],
    }));

    setSubbingPlayer(null);
  };


  // ── LIVE_MATCH aşaması: 12:00-13:30 (Öğle) VEYA 18:00-19:30 (Akşam) ──
  // 9 maç sırayla oynanıyor. Client-side simülasyon YOK.
  if (!isActive && !isTestMode && cycleStatus.phase === 'LIVE_MATCH') {
    const matchIndex = (cycleStatus as any).currentMatchIndex ?? 0;
    const matchTime = (cycleStatus as any).currentMatchTime ?? '12:00';
    const matchesLeft = (cycleStatus as any).matchesLeft ?? 9;
    const slotLabel = (cycleStatus as any).slotLabel ?? 'SLOT';
    const currentSlot = (cycleStatus as any).currentSlot ?? '12:00';
    const slotStartMin = currentSlot === '18:00' ? 1080 : 720;
    const slotEndMin = slotStartMin + 90;
    const totalMinutesNow = (function() {
      const trDate = addHours(new Date(), 3);
      return trDate.getHours() * 60 + trDate.getMinutes();
    })();
    const matchEndMin = slotStartMin + (matchIndex + 1) * 10;
    const minsToNextMatch = matchEndMin - totalMinutesNow;
    const otherSlotLabel = currentSlot === '12:00' ? '18:00 (Akşam)' : 'Yarın 12:00 (Öğle)';
    const otherSlotStatus = currentSlot === '12:00' ? 'BEKLENİYOR' : 'OYNANDI';

    return (
      <div className="flex flex-col h-full min-h-[600px] bg-black/80 backdrop-blur-md border border-white/5 overflow-y-auto">
        <div className="flex flex-col items-center justify-center flex-1 p-6 md:p-12 space-y-6 text-center">
          <div className="relative">
            <div className="w-24 h-24 rounded-full border-4 border-red-500 animate-pulse flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-red-400">
                  <circle cx="12" cy="12" r="10" />
                  <polygon points="10,8 16,12 10,16" fill="black" />
                </svg>
              </div>
            </div>
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full animate-ping" />
          </div>
          <div>
            <h2 className="text-3xl md:text-4xl font-black italic tracking-tighter text-white uppercase">CANLI MAÇ OYNANIYOR</h2>
            <p className="text-red-400 text-[10px] tracking-[0.4em] font-black mt-3 uppercase">
              {slotLabel} · {currentSlot} · TUR {currentSlot === '18:00' ? (cycleStatus as any).eveningTur : (cycleStatus as any).morningTur}/34 · MAÇ {matchIndex + 1}/9 · {matchTime} · {matchesLeft - 1} MAÇ KALDI
            </p>
            {minsToNextMatch > 0 && (
              <p className="text-white/40 text-[9px] tracking-[0.3em] font-bold mt-1.5 uppercase">
                SONRAKİ MAÇ {minsToNextMatch} DAKİKA SONRA
              </p>
            )}
          </div>

          {/* 2 slot durumu — hangisi canlı, hangisi bekliyor */}
          <div className="grid grid-cols-2 gap-3 w-full max-w-2xl">
            <div className={`p-3 rounded-xl border ${currentSlot === '12:00' ? 'bg-red-500/10 border-red-500/40 animate-pulse' : 'bg-zinc-900/40 border-white/8 opacity-60'}`}>
              <div className="text-[9px] font-black text-white/40 uppercase tracking-wider">ÖĞLE SLOTU</div>
              <div className="text-2xl font-black text-white tabular-nums mt-1">12:00</div>
              <div className={`text-[9px] font-black mt-1 uppercase tracking-wider ${currentSlot === '12:00' ? 'text-red-400' : 'text-emerald-400/60'}`}>
                {currentSlot === '12:00' ? '● CANLI' : '✓ OYNANDI'}
              </div>
            </div>
            <div className={`p-3 rounded-xl border ${currentSlot === '18:00' ? 'bg-red-500/10 border-red-500/40 animate-pulse' : 'bg-zinc-900/40 border-white/8'}`}>
              <div className="text-[9px] font-black text-white/40 uppercase tracking-wider">AKŞAM SLOTU</div>
              <div className="text-2xl font-black text-white tabular-nums mt-1">18:00</div>
              <div className={`text-[9px] font-black mt-1 uppercase tracking-wider ${currentSlot === '18:00' ? 'text-red-400' : 'text-amber-400/60'}`}>
                {currentSlot === '18:00' ? '● CANLI' : '↗ BEKLENİYOR'}
              </div>
            </div>
          </div>

          {/* 9 maçlık zaman çizelgesi — şu an oynanan vurgulu */}
          <div className="w-full max-w-3xl">
            <div className="flex items-center gap-2 mb-3 px-1">
              <div className="w-1 h-4 bg-red-500 rounded-full" />
              <h3 className="text-xs font-black text-red-500 uppercase tracking-[0.3em]">{slotLabel} · MAÇ ÇİZELGESİ</h3>
              <div className="flex-1 h-px bg-gradient-to-r from-red-500/30 to-transparent" />
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-9 gap-1.5">
              {Array.from({ length: 9 }, (_, i) => {
                const startMin = slotStartMin + i * 10;
                const endMin = startMin + 10;
                const fmt = (m: number) => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
                const isCurrent = i === matchIndex;
                const isPlayed = i < matchIndex;
                return (
                  <div
                    key={i}
                    className={`relative p-2 rounded-lg border text-center transition-all ${
                      isCurrent
                        ? 'bg-red-500/20 border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)] animate-pulse'
                        : isPlayed
                        ? 'bg-zinc-900/40 border-emerald-500/30 opacity-60'
                        : 'bg-zinc-900/40 border-white/8'
                    }`}
                  >
                    <div className="text-[8px] font-black text-white/30 uppercase">
                      {isPlayed ? '✓' : isCurrent ? '●' : `MAÇ ${i + 1}`}
                    </div>
                    <div className={`text-sm font-black tabular-nums mt-0.5 ${isCurrent ? 'text-red-400' : isPlayed ? 'text-emerald-400/60' : 'text-white/40'}`}>
                      {fmt(startMin)}
                    </div>
                    <div className="text-[8px] text-white/30 tabular-nums">{fmt(endMin)}</div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="max-w-md bg-red-500/10 border border-red-500/20 p-4 italic text-xs text-white/60 leading-relaxed">
            {currentSlot === '12:00'
              ? 'Öğle slotu (12:00-13:30) oynanıyor. Akşam slotu 18:00\'de başlayacak. Toplam 18 maç oynanacak.'
              : 'Akşam slotu (18:00-19:30) oynanıyor. Öğle slotu tamamlandı. Gün son maçtan sonra bitecek.'}
          </div>

          <button
            onClick={() => {
              if (liveFixtureId) {
                router.push(`/match/${liveFixtureId}`);
              } else {
                router.push('/fixture');
              }
            }}
            className="px-10 py-4 bg-red-500/20 text-red-300 border-2 border-red-500/40 text-xs font-black uppercase tracking-[0.3em] hover:bg-red-500/30 transition-colors active:scale-95"
          >
            {liveFixtureId ? '⚡ CANLI MAÇA GİT' : 'Fikstüre Git'}
          </button>
          {liveFixtureId && (
            <p className="text-[9px] text-red-400/40 mt-2">
              Maç ID: {liveFixtureId.slice(0, 8)}...
            </p>
          )}
        </div>
      </div>
    );
  }

  // If match isn't live, show different UI
  if (!isActive && (cycleStatus.phase === 'IDLE' || cycleStatus.phase === 'POST_MATCH' || cycleStatus.phase === 'TRAINING_WINDOW')) {
    const reason = (cycleStatus as any).reason;
    const isWeekend = reason === 'WEEKEND';
    const isSeasonEnd = reason === 'SEASON_END';
    const isFridayEnd = reason === 'FRIDAY_END';

    // IDLE ekranı başlığı ve mesajı — nedenine göre değişir
    const title = isSeasonEnd
      ? 'SEZON BİTTİ'
      : isWeekend
      ? 'HAFTA SONU — LİGE ARA VERİLDİ'
      : isFridayEnd
      ? 'CUMA AKŞAMI — HAFTA SONU BAŞLIYOR'
      : 'GÜN BİTTİ';

    const subtitle = isSeasonEnd
      ? '34 TUR TAMAMLANDI'
      : isWeekend
      ? 'PAZARTESİ 12:00\'DE LİG DEVAM EDECEK'
      : isFridayEnd
      ? 'PAZARTESİ 12:00\'DE LİG DEVAM EDECEK'
      : 'YARIN 12:00\'DE MAÇLAR BAŞLAYACAK';

    const message = isSeasonEnd
      ? '"Sezon 34 tur tamamlandı. Lig şampiyonu belirlendi. Yeni sezon pazartesi 12:00\'de başlayacak."'
      : isWeekend
      ? '"Hafta sonu lige ara verildi. Tüm takımlar dinleniyor. Pazartesi 12:00\'de yeni tur başlayacak."'
      : isFridayEnd
      ? '"Cuma akşamı maçları tamamlandı. Hafta sonu dinlenme. Pazartesi 12:00\'de lig devam edecek."'
      : '"Bugünkü 18 maç tamamlandı (12:00 + 18:00 slot\'ları). Yarın 12:00\'de yeni tur başlayacak."';

    return (
      <div className="flex flex-col h-full min-h-[600px] bg-black/80 backdrop-blur-md border border-white/5">
        {showTimeWarning && (
          <div className="px-4 pt-4">
            <MatchTimeWarningBanner />
          </div>
        )}
        <div className="flex flex-col items-center justify-center flex-1 p-6 md:p-12 space-y-8 text-center">
        <div className={`w-24 h-24 rounded-full border-4 animate-spin flex items-center justify-center ${
          isSeasonEnd ? 'border-amber-500 border-t-white' : 'border-besiktas-red border-t-white'
        }`}>
          <div className={`w-16 h-16 rounded-full ${
            isSeasonEnd ? 'bg-amber-500/20' : 'bg-besiktas-red/20'
          }`} />
        </div>
        <div>
          <h2 className="text-3xl md:text-4xl font-black italic tracking-tighter text-white uppercase">{title}</h2>
          <p className={`text-[10px] tracking-[0.4em] font-black mt-4 uppercase ${isSeasonEnd ? 'text-amber-500' : 'text-white/40'}`}>
            {subtitle}
          </p>
          <p className="text-white/30 text-[9px] tracking-[0.3em] font-bold mt-1.5 uppercase">
            Sıradaki: {cycleStatus.nextEventTime}
          </p>
        </div>
        <div className={`max-w-md p-6 border italic text-sm text-white/60 leading-relaxed ${
          isSeasonEnd ? 'bg-amber-500/5 border-amber-500/20' : 'bg-white/5 border-white/10'
        }`}>
          &quot;{message}&quot;
        </div>

        {/* Sezon ilerleme barı */}
        <div className="w-full max-w-2xl">
          <div className="flex items-center gap-2 mb-1.5 px-1">
            <span className="text-[9px] font-black text-white/40 uppercase tracking-wider">SEZON İLERLEMESİ</span>
            <span className="text-[9px] font-black text-amber-500 ml-auto">
              {isSeasonEnd ? '34/34 TUR (TAMAMLANDI)' : `${(cycleStatus as any).eveningTur || (cycleStatus as any).morningTur || 0}/34 TUR`}
            </span>
          </div>
          <div className="h-2 bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full transition-all"
              style={{ width: `${isSeasonEnd ? 100 : Math.min(100, (((cycleStatus as any).eveningTur || (cycleStatus as any).morningTur || 0) / 34) * 100)}%` }}
            />
          </div>
        </div>

        {/* SIM-5 FIX: Add useful navigation when no live match */}
        <div className="flex flex-col items-center gap-3">
          <p className="text-white/30 text-xs italic text-center">Canlı maçlar artık maç sayfasında gerçek zamanlı olarak simüle edilmektedir.</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <button
              onClick={() => router.push('/fixture')}
              className="px-8 py-3 bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-black uppercase tracking-[0.3em] hover:bg-amber-500/30 transition-colors active:scale-95"
            >
              Fikstüre Git
            </button>
            <button 
              onClick={() => router.push('/standings')}
              className="px-8 py-3 bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[10px] font-black uppercase tracking-[0.3em] hover:bg-blue-500/30 transition-colors active:scale-95"
            >
              Puan Tablosu
            </button>
            {isTestMode && (
              <button 
                onClick={() => runSimulation()}
                className="px-8 py-3 bg-green-500/20 text-green-300 border border-green-500/30 text-[10px] font-black uppercase tracking-[0.3em] hover:bg-green-500/30 transition-colors active:scale-95"
              >
                Test Maçı Başlat
              </button>
            )}
          </div>
        </div>
        </div>
      </div>
    );
  }

  if (!isActive && cycleStatus.phase === 'PRE_MATCH') {
    // Bugün 2 slot × 9 maç = 18 maç oynanacak
    const slotsData = [
      { name: '12:00', label: 'ÖĞLE SLOTU', startMin: 720, period: '12:00 - 13:30' },
      { name: '18:00', label: 'AKŞAM SLOTU', startMin: 1080, period: '18:00 - 19:30' },
    ];
    const fmt = (m: number) => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
    const slotLabel = (cycleStatus as any).slotLabel || 'SLOT';

     return (
        <div className="flex flex-col h-full min-h-[600px] bg-black/80 backdrop-blur-md border border-white/5 overflow-y-auto">
          {showTimeWarning && (
            <div className="px-4 pt-4">
              <MatchTimeWarningBanner />
            </div>
          )}
          <div className="flex flex-col items-center justify-center flex-1 p-6 md:p-12 space-y-6 text-center">
            <div className="text-amber-500 font-black text-6xl italic animate-pulse">!</div>
            <div>
                <h2 className="text-3xl md:text-4xl font-black italic tracking-tighter text-white uppercase">Isınma Hareketleri Başladı</h2>
                <p className="text-amber-500/90 text-[10px] tracking-[0.4em] font-black mt-3 uppercase">
                  {slotLabel} · TUR {(cycleStatus as any).nextSlot === '12:00' ? (cycleStatus as any).morningTur : (cycleStatus as any).eveningTur}/34 · MAÇLAR BAŞLIYOR: {cycleStatus.nextEventTime} ({cycleStatus.countDownMinutes} DK KALDI)
                </p>
                {cycleStatus.previousSlot && (
                  <p className="text-white/30 text-[9px] tracking-[0.3em] font-bold mt-1.5 uppercase">
                    ÖNCEKİ SLOT: {cycleStatus.previousSlot}
                  </p>
                )}
            </div>

            {/* Sezon ilerleme barı */}
            <div className="w-full max-w-2xl">
              <div className="flex items-center gap-2 mb-1.5 px-1">
                <span className="text-[9px] font-black text-white/40 uppercase tracking-wider">SEZON İLERLEMESİ</span>
                <span className="text-[9px] font-black text-amber-500 ml-auto">
                  {((cycleStatus as any).eveningTur || (cycleStatus as any).morningTur || 0)}/34 TUR
                </span>
              </div>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full transition-all"
                  style={{ width: `${Math.min(100, (((cycleStatus as any).eveningTur || (cycleStatus as any).morningTur || 0) / 34) * 100)}%` }}
                />
              </div>
            </div>

            {/* BUGÜNKÜ MAÇLAR — 2 slot × 9 maç */}
            <div className="w-full max-w-5xl">
              <div className="flex items-center gap-2 mb-3 px-1">
                <div className="w-1 h-4 bg-amber-500 rounded-full" />
                <h3 className="text-xs font-black text-amber-500 uppercase tracking-[0.3em]">BUGÜNKÜ MAÇLAR</h3>
                <div className="flex-1 h-px bg-gradient-to-r from-amber-500/30 to-transparent" />
                <span className="text-[9px] font-bold text-white/40 uppercase tracking-wider">2 SLOT · 18 MAÇ</span>
              </div>

              {/* 2 slot yan yana */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {slotsData.map((slot) => {
                  const isNextSlot = cycleStatus.nextSlot === slot.name;
                  const isPlayed = (cycleStatus as any).previousSlot?.includes(slot.name);
                  return (
                    <div
                      key={slot.name}
                      className={`relative p-4 rounded-xl border transition-all ${
                        isNextSlot
                          ? 'bg-amber-500/10 border-amber-500/40 shadow-[0_0_20px_rgba(245,158,11,0.15)]'
                          : isPlayed
                          ? 'bg-zinc-900/40 border-emerald-500/30 opacity-70'
                          : 'bg-zinc-900/40 border-white/8'
                      }`}
                    >
                      {/* Slot başlığı */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-black text-white tabular-nums">{slot.name}</span>
                          {isNextSlot && (
                            <span className="px-1.5 py-0.5 bg-amber-500 text-black rounded text-[8px] font-black uppercase tracking-wider">SIRADAKİ</span>
                          )}
                          {isPlayed && (
                            <span className="px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded text-[8px] font-black uppercase tracking-wider">OYNANDI</span>
                          )}
                        </div>
                        <span className="text-[9px] font-black text-white/40 uppercase tracking-wider">{slot.label}</span>
                      </div>

                      {/* 9 maçlık mini grid */}
                      <div className="grid grid-cols-9 gap-1">
                        {Array.from({ length: 9 }, (_, i) => {
                          const startMin = slot.startMin + i * 10;
                          return (
                            <div key={i} className="text-center">
                              <div className="text-[7px] font-black text-white/30 uppercase">M{i + 1}</div>
                              <div className="text-[10px] font-black text-amber-400/80 tabular-nums">{fmt(startMin).slice(0, 5)}</div>
                            </div>
                          );
                        })}
                      </div>
                      <p className="text-[9px] text-white/40 mt-2 text-center">{slot.period} · 9 maç</p>
                    </div>
                  );
                })}
              </div>

              {/* Açıklama */}
              <p className="text-[10px] text-white/40 mt-3 italic text-center">
                Her slot 9 maç içerir. Maçlar 10'ar dakika arayla sırayla oynanır. Her maç 10 dakika sürer.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
                <div className="p-3 bg-white/5 border border-white/10 text-[9px] font-bold uppercase tracking-widest text-white/40">LOBİ: AKTİF</div>
                <div className="p-3 bg-white/5 border border-white/10 text-[9px] font-bold uppercase tracking-widest text-white/40">MEDYA: HAZIR</div>
            </div>

            {/* Canlı maçlar artık maç sayfasında — fikstüre yönlendir */}
            <button
              onClick={() => router.push('/fixture')}
              className="px-8 py-3 bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-black uppercase tracking-[0.3em] hover:bg-amber-500/30 transition-colors active:scale-95"
            >
              Fikstüre Git &amp; Maç İzle
            </button>
          </div>
        </div>
     );
  }

  return (
    <div className="flex flex-col h-full min-h-[600px] bg-black/80 backdrop-blur-sm text-white font-sans overflow-hidden relative border border-white/5">
      {showTimeWarning && (
        <div className="px-4 pt-4">
          <MatchTimeWarningBanner />
        </div>
      )}
      <AnimatePresence>
        {isMatchFinished && gameMinute >= 90 && matchResult && (
          <PostMatchSummary 
            result={matchResult}
            homeScore={score.home}
            awayScore={score.away}
            players={homeSquad}
            awayTeam={initialAwayTeam}
            homeTeamName={profile?.team_name ?? 'Takımın'}
            awayTeamName="Rakip Takım"
            activeTactic={activeTactic}
            onClose={() => setMatchState(prev => ({ ...prev, isFinished: false }))} 
          />
        )}
      </AnimatePresence>

      {/* Score and Time Panel */}
      <div className="p-3 sm:p-6 md:p-12 bg-black/60 backdrop-blur-md border-b border-white/10 flex flex-col items-center">
        <div className="flex items-center gap-4 sm:gap-8 md:gap-12">
          <div className="text-center">
            <div className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em] mb-2">HOME</div>
            <div className="text-5xl sm:text-7xl md:text-9xl font-black tracking-tighter leading-none italic">
              {score.home}
            </div>
          </div>
          <div className="text-3xl sm:text-4xl md:text-5xl font-black text-white/10 mb-[-20px] tracking-widest italic">VS</div>
          <div className="text-center">
            <div className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em] mb-2">AWAY</div>
            <div className="text-5xl sm:text-7xl md:text-9xl font-black tracking-tighter leading-none italic">
              {score.away}
            </div>
          </div>
        </div>
        
        <div className="mt-8 w-full max-w-2xl grid grid-cols-2 gap-12 text-[12px] font-black italic">
            <div className="flex flex-col items-end space-y-1.5 ">
                {matchState.matchSummaryEvents.home.map((item, i) => (
                    <motion.div 
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        key={`home-sum-${i}`} 
                        className="flex items-center gap-2 text-white/70"
                    >
                        <span>{item.displayMinute || item.minute}&apos; {item.player}</span>
                        {item.type === 'GOAL' && <div className="w-2.5 h-2.5 rounded-full bg-white shadow-[0_0_8px_white] animate-pulse" />}
                        {item.type === 'YELLOW' && <div className="w-2 h-3 bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.5)] rotate-12" />}
                        {item.type === 'RED' && <div className="w-2 h-3 bg-red-600 shadow-[0_0_8px_rgba(220,38,38,0.5)] rotate-12" />}
                        {item.type === 'INJURY' && <div className="w-3 h-3 text-red-500 font-bold">✚</div>}
                    </motion.div>
                ))}
            </div>
            
            <div className="flex flex-col items-start space-y-1.5">
                {matchState.matchSummaryEvents.away.map((item, i) => (
                    <motion.div 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        key={`away-sum-${i}`} 
                        className="flex items-center gap-2 text-white/40"
                    >
                        {item.type === 'INJURY' && <div className="w-3 h-3 text-red-500 font-bold opacity-60">✚</div>}
                        {item.type === 'GOAL' && <div className="w-2 h-2 rounded-full bg-white/40 shadow-[0_0_5px_white] animate-pulse" />}
                        {item.type === 'YELLOW' && <div className="w-1.5 h-2.5 bg-yellow-600/40 rotate-12" />}
                        {item.type === 'RED' && <div className="w-1.5 h-2.5 bg-red-800/40 rotate-12" />}
                        <span>{item.displayMinute || item.minute}&apos; {item.player}</span>
                    </motion.div>
                ))}
            </div>
        </div>

        <div className="mt-10 flex items-center gap-6">
          <div className="h-px w-20 bg-white/20"></div>
          {/* Referee Info Badge */}
          {(effectiveRefereeName || matchResult?.refereeName) && (() => {
            const refName = effectiveRefereeName || matchResult?.refereeName;
            const refPersonality = effectiveRefereePersonality || matchResult?.refereePersonality;
            const refStrictness = effectiveRefereeStrictness || matchResult?.refereeStrictness;
            const REFEREE_LABELS_MATCH: Record<string, { emoji: string; label: string; color: string; desc: string }> = {
              katil: { emoji: '\u{1F534}', label: 'Kat\u0131lc\u0131', color: 'text-red-400', desc: 'Sert bir y\u00f6netim sergiler, kart g\u00f6stermekten \u00e7ekinmez.' },
              dengeci: { emoji: '\u2696\uFE0F', label: 'Dengeci', color: 'text-yellow-400', desc: 'Dengeli bir tutum sergiler, adil kararlar verir.' },
              'ho\u015fg\u00f6r\u00fcl\u00fc': { emoji: '\u{1F91D}', label: 'Ho\u015fg\u00f6r\u00fcl\u00fc', color: 'text-green-400', desc: 'Oyunun ak\u0131\u015f\u0131n\u0131 bozmamaya \u00e7al\u0131\u015f\u0131r, az faul \u00e7alar.' },
              ev_sahibi: { emoji: '\u{1F3E0}', label: 'Ev Sahibi', color: 'text-blue-400', desc: 'Ev sahibine k\u00fc\u00e7\u00fck avantajlar sa\u011flar.' },
              'de\u011fi\u015fken': { emoji: '\u{1F3B2}', label: 'De\u011fi\u015fken', color: 'text-purple-400', desc: 'Kararlar\u0131 tutars\u0131z, her ma\u00e7 farkl\u0131 bir hakem gibi.' },
              var_sever: { emoji: '\u{1F4FA}', label: 'VAR Sever', color: 'text-cyan-400', desc: 'VAR incelemelerini s\u0131k\u00e7a kullan\u0131r, bol penalt\u0131 karar.' },
            };
            const info = refPersonality ? REFEREE_LABELS_MATCH[refPersonality] : null;
            const strictLabel = !refStrictness ? '' : refStrictness >= 75 ? '\u00c7ok Sert' : refStrictness >= 55 ? 'Sert' : refStrictness >= 40 ? 'Dengeli' : refStrictness >= 25 ? 'Yumu\u015fak' : '\u00c7ok Yumu\u015fak';
            return (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg">
                <span className="text-[10px] font-bold text-white/60 uppercase tracking-wider">HAKEM</span>
                <span className="text-xs font-bold text-white/80">{refName}</span>
                {info && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="inline-flex items-center justify-center w-4 h-4 rounded-full border border-white/10 text-white/30 text-[10px] cursor-help hover:text-white/60 hover:border-white/20 transition-colors">\u24D8</span>
                    </TooltipTrigger>
                    <TooltipContent
                      side="top"
                      className="bg-zinc-900 border border-white/10 text-white/80 px-3 py-2 rounded-lg shadow-xl max-w-[220px]"
                      sideOffset={6}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm">{info.emoji}</span>
                          <span className="text-[10px] font-black text-white/90 uppercase tracking-wider">{info.label}</span>
                        </div>
                        <p className="text-[9px] text-white/50 leading-relaxed">{info.desc}</p>
                        {strictLabel && (
                          <div className="pt-1 border-t border-white/10 mt-1">
                            <span className="text-[8px] font-bold text-white/30 uppercase tracking-widest">Sertlik: </span>
                            <span className="text-[9px] font-bold text-amber-400/70">{strictLabel}</span>
                          </div>
                        )}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>
            );
          })()}
          <div className="h-px w-20 bg-white/20"></div>
          <div className="px-8 py-2 bg-white text-black text-xs font-black uppercase tracking-[0.3em] skew-x-[-12deg]">
            <span className="block skew-x-[12deg]">
              {(() => {
                const currentEvent = matchResult?.events.find(e => e.minute === gameMinute);
                if (currentEvent?.type === 'HALFTIME') return 'İLK YARI SONU';
                if (currentEvent?.type === 'FULLTIME') return 'MAÇ SONU';
                const disp = currentEvent?.displayMinute || gameMinute;
                return `DK: ${disp}'`;
              })()}
            </span>
          </div>
          {matchState.isFriendly && (
            <span className="px-3 py-1 bg-amber-500/20 border border-amber-500/30 text-amber-400 text-[8px] font-black uppercase tracking-widest rounded-full">
              Hızlandırılmış Mod
            </span>
          )}
          <div className="h-px w-20 bg-white/20"></div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-black/60 backdrop-blur-md border-b border-white/5">
        {['commentary', 'statistics', 'tactics'].map((tab) => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-6 text-[10px] font-black uppercase tracking-[0.4em] transition-all duration-300 relative ${
              activeTab === tab ? 'text-white' : 'text-white/20 hover:text-white/40'
            }`}
          >
            {tab === 'commentary' ? 'Canlı Anlatım' : tab === 'statistics' ? 'Savaş Verileri' : 'STRATEJİ ÜSSÜ'}
            {activeTab === tab && (
              <motion.div 
                layoutId="activeTab"
                className="absolute bottom-0 left-1/4 w-1/2 h-0.5 bg-white shadow-[0_0_15px_rgba(255,255,255,0.5)]" 
              />
            )}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        {activeTab === 'commentary' && (
          <div className="max-w-2xl mx-auto space-y-0.5 pb-20">
            <AnimatePresence initial={false}>
              {visibleEvents.map((event, idx) => (
                <motion.div 
                  key={`${event.minute}-${idx}`}
                  initial={{ opacity: 0, x: -20, height: 0 }}
                  animate={{ opacity: 1, x: 0, height: 'auto' }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: event.type === 'GOAL' ? 0.6 : 0.4, ease: "easeOut" }}
                  className={`p-1.5 border-l-4 rounded-none flex gap-1.5 shadow-lg transition-all duration-500 ${
                    event.type === 'GOAL' ? 'bg-zinc-800 border-yellow-400 text-white ring-1 ring-yellow-400/30 shadow-[0_0_20px_rgba(250,204,21,0.2)]' : 
                    event.type === 'TACTIC' ? 'bg-zinc-800 border-white text-white/90' :
                    event.type === 'YELLOW' ? 'bg-yellow-500/20 border-yellow-500 text-yellow-100' :
                    event.type === 'RED' ? 'bg-red-500/20 border-red-500 text-red-100' :
                    event.type === 'SAVE' ? 'bg-blue-500/10 border-blue-400 text-blue-100' :
                    event.type === 'OFFSIDE' ? 'bg-orange-500/10 border-orange-400 text-orange-100' :
                    event.type === 'CHANCE' ? 'bg-emerald-500/10 border-emerald-400 text-emerald-100 italic' :
                    event.type === 'BATTLE' ? 'bg-zinc-400/10 border-zinc-400 text-zinc-300' :
                    event.type === 'POST' ? 'bg-white/10 border-white text-white italic underline' :
                    event.type === 'PENALTY' ? 'bg-red-600/20 border-red-500 text-white font-black' :
                    event.type === 'ACADEMY' ? 'bg-indigo-500/20 border-indigo-400 text-indigo-100' :
                    event.type === 'CROWD' ? 'bg-rose-500/10 border-rose-400 text-rose-100' :
                    'bg-zinc-900 border-white/10 text-white/60'
                  }`}
                >
                  <div className="flex-shrink-0 w-7 text-xs font-black italic tracking-tighter text-center">
                    {event.type === 'GOAL' ? (
                      <span className="text-sm">⚽ {event.minute}&apos;</span>
                    ) : event.type === 'CHANCE' ? (
                      <span className="text-emerald-400">⚡ {event.minute}&apos;</span>
                    ) : event.type === 'POST' ? (
                      <span className="text-white">🥅 {event.minute}&apos;</span>
                    ) : (
                      <>{event.minute}&apos;</>
                    )}
                  </div>
                  <div className="flex-grow space-y-0.5">
                    <div className="flex items-center gap-2">
                      {event.type === 'GOAL' && (
                        <motion.span
                          animate={{ scale: [1, 1.15, 1] }}
                          transition={{ repeat: 3, duration: 0.4, ease: "easeInOut" }}
                          className="text-[10px] font-black uppercase tracking-widest bg-yellow-500 text-black px-2 py-0.5 skew-x-[-6deg]"
                        >
                          GOL!
                        </motion.span>
                      )}
                      <div className={`text-[7px] font-black uppercase tracking-[0.3em] ${event.type === 'GOAL' ? 'opacity-60' : 'opacity-40'}`}>
                        {event.type === 'GOAL' ? 'GOL' : 
                         event.type === 'TACTIC' ? 'TEKNİK DİREKTÖR MÜDAHALESİ' : 
                         event.type === 'YELLOW' ? 'SARI KART' :
                         event.type === 'RED' ? 'KIRMIZI KART' :
                         event.type === 'SAVE' ? 'KRİTİK HAMLE' :
                         event.type === 'OFFSIDE' ? 'OFSAYT' :
                         event.type === 'CHANCE' ? 'TEHLİKELİ POZİSYON' :
                         event.type === 'BATTLE' ? 'MÜCADELE' :
                         event.type === 'POST' ? 'DİREKTEN DÖNDÜ' :
                         event.type === 'CROWD' ? 'TRİBÜN COŞKUSU' :
                         event.type === 'ACADEMY' ? 'GENÇ YETENEK' :
                         event.type === 'PENALTY' ? 'PENALTI' :
                         event.type === 'INJURY' ? 'SAKATLIK' :
                         'MAÇ ANLATIMI'}
                      </div>
                    </div>
                    <div className={`text-[11px] font-bold italic tracking-tight leading-snug`}>
                      {renderCommentaryText(event.text)}
                    </div>
                    {event.type === 'GOAL' && (
                      <div className="flex items-center gap-2 mt-0.5 pt-0.5 border-t border-white/5">
                        <span className="text-[7px] font-black uppercase tracking-widest text-white/30">
                          {event.team === 'HOME' ? 'EV SAHİBİ' : 'DEPLASMAN'}
                        </span>
                        {event.assistant && (
                          <span className="text-[7px] font-bold tracking-tight text-white/30">
                            Asist: {event.assistant}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            <div className="flex gap-3 p-3 bg-white/[0.02] border border-white/5 items-start opacity-30">
              <span className="text-white/20 font-black font-mono text-sm shrink-0">00&apos;</span>
              <p className="text-white/90 text-xs font-black uppercase tracking-tight">Kritik mücadele başlıyor...</p>
            </div>
          </div>
        )}

        {activeTab === 'statistics' && matchResult && (
          <div className="max-w-md mx-auto space-y-12 py-6">
             <div className="text-center text-[10px] text-white/20 uppercase font-black tracking-[0.5em] mb-12">VERİ ANALİZİ</div>
             
             {[
               { label: 'TOPLA OYNAMA', h: matchResult.stats.home.possession, a: matchResult.stats.away.possession, suffix: '%' },
               { label: 'TOPLAM ŞUT', h: matchResult.stats.home.shots, a: matchResult.stats.away.shots },
               { label: 'İSABETLİ ŞUT', h: matchResult.stats.home.shotsOnTarget, a: matchResult.stats.away.shotsOnTarget },
               { label: 'PAS İSABETİ', h: matchResult.stats.home.passing || 0, a: matchResult.stats.away.passing || 0, suffix: '%' }
             ].map((stat, i) => (
               <div key={`stat-row-${i}`} className="space-y-4">
                  <div className="flex justify-between text-[11px] font-black uppercase tracking-widest">
                      <span className="w-12 text-white">{stat.h}{stat.suffix || ''}</span>
                      <span className="text-white/30 italic">{stat.label}</span>
                      <span className="w-12 text-right text-white/60">{stat.a}{stat.suffix || ''}</span>
                  </div>
                  <div className="flex h-1 bg-white/5 rounded-none overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${(stat.h / (stat.h + stat.a || 1)) * 100}%` }}
                        className="bg-white h-full shadow-[0_0_10px_white]"
                      />
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${(stat.a / (stat.h + stat.a || 1)) * 100}%` }}
                        className="bg-zinc-800 h-full"
                      />
                  </div>
               </div>
             ))}
          </div>
        )}

        {activeTab === 'tactics' && (
          <div className="max-w-6xl mx-auto space-y-12 pb-24">
            <div className="bg-zinc-900/40 p-4 border-b border-white/5 mb-8">
               <p className="text-[10px] text-white/40 font-bold uppercase tracking-[0.5em] text-center">Gerçek Zamanlı Taktiksel Müdahale Üssü</p>
            </div>
            
            <TacticsCommandCenter
              activeTactic={gameTactics}
              onActiveTacticChange={(t) => {
                const diff = Object.keys(t).find(k => (t as any)[k] !== (gameTactics as any)[k]);
                if (diff) handleTacticsChange(diff, (t as any)[diff]);
              }}
              squad={homeSquad}
              onSquadUpdate={(newSquad) => {
                setHomeSquad(newSquad);
                // Trigger immediate engine update on squad swap
                runSimulation(gameMinute, score, newSquad, gameTactics);
              }}
              userId={profile?.id || ''}
              playerConditions={playerConditions}
              onPlayerClick={onPlayerClick}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="p-8 bg-zinc-900/60 border border-white/5 rounded-[2rem]">
                  <div className="flex items-center justify-between mb-6">
                    <h4 className="text-xl font-black italic tracking-tighter">YEDEK KULÜBESİ</h4>
                    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded ${subsUsed >= MAX_SUBS ? 'bg-red-500/20 text-red-400' : 'bg-white/5 text-white/40'}`}>
                      Değişiklik: {subsUsed}/{MAX_SUBS}
                    </span>
                  </div>
                  <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                     {bench.map((playerIn, idx) => (
                       <div 
                         key={`bench-row-${playerIn.id}-${idx}`}
                         className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-2xl group hover:border-emerald-500/50 transition-all"
                       >
                         <div>
                            <div className="font-bold text-sm tracking-tight">{playerIn.name}</div>
                            <div className="text-[10px] text-white/30 uppercase font-black">{(playerIn as any).specificPosition || (playerIn as any).specific_position || playerIn.position} | RT: {playerIn.rating}</div>
                         </div>
                         {subbingPlayer ? (
                           <button 
                             onClick={() => {
                               const oldSquadPlayer = subbingPlayer;
                               const newBench = bench.filter(p => p.id !== playerIn.id);
                               newBench.push(oldSquadPlayer);
                               setBench(newBench);
                               handleSubstitute(playerIn);
                             }}
                             className="px-4 py-2 bg-emerald-500 text-black text-[10px] font-black uppercase tracking-widest rounded-lg"
                           >
                             Oyuna Al
                           </button>
                         ) : (
                           <span className="text-[10px] text-white/20 italic">Oyuncu Seçilmedi</span>
                         )}
                       </div>
                     ))}
                  </div>
               </div>

               <div className="p-8 bg-zinc-900/60 border border-white/5 rounded-[2rem]">
                  <div className="flex items-center justify-between mb-6">
                    <h4 className="text-xl font-black italic tracking-tighter">SAHADAKİLER (DEĞİŞTİR)</h4>
                    <span className="text-[8px] text-white/30">Değişiklik: {subsUsed}/{MAX_SUBS}</span>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                     {homeSquad.map((player) => (
                       <button 
                         key={`active-sub-${player.id}`}
                         onClick={() => {
                           if (subsUsed >= MAX_SUBS) return;
                           setSubbingPlayer(player);
                         }}
                         className={`p-4 rounded-2xl border transition-all text-left flex items-center justify-between ${subsUsed >= MAX_SUBS ? 'opacity-40 cursor-not-allowed' : ''} ${
                            subbingPlayer?.id === player.id ? 'bg-emerald-500/10 border-emerald-500' : 'bg-black/20 border-white/5 hover:border-white/20'
                         }`}
                       >
                         <div className="flex flex-col">
                            <span className="font-bold text-sm">{player.name}</span>
                            <span className="text-[10px] text-white/30 uppercase font-black">RT: {matchResult?.playerRatings[player.id]?.toFixed(1) || '6.0'}</span>
                         </div>
                         <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,1)]" />
                       </button>
                     ))}
                  </div>
               </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Bar */}
      <div className="p-6 bg-black/60 backdrop-blur-md border-t border-white/10 flex justify-center">
        <div className="flex items-center gap-6">
            <div className={`w-1.5 h-1.5 rounded-full ${gameMinute < 90 ? 'bg-white animate-pulse' : 'bg-white/10'}`}></div>
            <span className="text-[9px] font-black uppercase tracking-[0.6em] text-white/30">
                {gameMinute < 90 ? 'CANLI ANALİZ SİSTEMİ AKTİF' : 'ANALİZ TAMAMLANDI'}
            </span>
        </div>
      </div>
    </div>
  );
};

export default MatchDay;
