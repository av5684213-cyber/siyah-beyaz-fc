'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import TacticsPanel from './TacticsPanel';
import TacticsCommandCenter from './TacticsCommandCenter';
import PostMatchSummary from './PostMatchSummary';
import { UpdatePlayerStats } from '@/lib/fm/evolution';
import { tryMatchTraitGrowth } from '@/lib/fm/trainingEngine';
import { syncPlayerStats } from '@/lib/fm/helpers';
import type { Player, MatchState, GameTactics, MatchResult, ActiveTactic } from '@/lib/fm/types';
import { unifiedMatchEngine } from '@/lib/fm/unifiedMatchEngine';
import { generateLeagueReferees, pickRefereeForMatch, getRefereeDisplayInfo, type RefereePersonality } from '@/lib/fm/referee';
import { GameCycleManager } from '@/lib/fm/GameCycleManager';
import { toTitleCase } from '@/lib/fm/ui-helpers';
import { getDefaultActiveTactic } from '@/lib/fm/types';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

// Module-level flag to prevent double-starting match simulation
// (Cannot use useRef + mutation inside useEffect due to React Compiler immutability rule)
let _simulationStarted = false;

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
  lastMatch?: { result: any, homeTeamName: string, awayTeamName: string } | null;
  onStartReplay?: (data: { result: any, homeTeamName: string, awayTeamName: string }) => void;
  // Referee info
  refereeName?: string;
  refereePersonality?: 'katil' | 'dengeci' | 'hoşgörülü' | 'ev_sahibi' | 'değişken' | 'var_sever';
  refereeStrictness?: number;
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
  lastMatch,
  onStartReplay,
  refereeName,
  refereePersonality,
  refereeStrictness
}: MatchDayProps) => {
  const [activeTab, setActiveTab] = useState<string>('commentary');
  const [cycleStatus, setCycleStatus] = useState(GameCycleManager.getStatus());
  const { minute: gameMinute, score, result: matchResult, visibleEvents, isFinished: isMatchFinished, isActive, playerConditions } = matchState;
  
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
      setCycleStatus(GameCycleManager.getStatus());
    }, 10000);
    return () => clearInterval(timer);
  }, []);

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

  const [subbingPlayer, setSubbingPlayer] = useState<Player | null>(null);
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
    // Robust defaults for simulation
    const effectiveHomeSquad = customSquad || homeSquad;
    
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
      alert("HATA: Kadro bulunamadı! Simülasyon başlatılamıyor.");
      return;
    }

    const effectiveTactic = activeTactic || customTactics || gameTactics || getDefaultActiveTactic();

    try {
      // Reset match state before starting
      setMatchState(prev => ({
        ...prev,
        minute: currentMin || 0,
        score: currentScore || {home: 0, away: 0},
        isActive: true,
        isFinished: false,
        isPaused: false,
        visibleEvents: []
      }));

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
      });
      
      setMatchState(prev => ({
        ...prev,
        result: result,
        isActive: true 
      }));
    } catch (err) {
      console.error("Match Simulation Error:", err);
      alert("Simülasyon sırasında bir hata oluştu. Lütfen tekrar deneyin.");
    }
  }, [homeSquad, initialAwayTeam, activeTactic, activeOperations, gameTactics, setMatchState, profile?.team_name, profile?.stadium_upgrades]);

  const finalizeMatch = useCallback(() => {
    if (matchState.isFinished || !_simulationStarted) return;
    
    setMatchState(prev => ({ ...prev, isFinished: true, isActive: false }));
    _simulationStarted = false;
    
    if (!matchResult || matchState.isReplay) {
      return;
    }

    const evolvedPlayers = homeSquad.map(player => {
        const rating = matchResult.playerRatings[player.id] || 6.0;
        const staminaLossVal = matchResult.staminaLoss[player.id] || 5;
        const stats = matchResult.playerStats[player.id] || { goals: 0, assists: 0 };
        const gains = matchResult.statsGains?.[player.id] || {};
        
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
            traits: updatedTraits,
            goalStats: newGoalStats,
            saveStats: newSaveStats,
        };
    });

    setHomeSquad(evolvedPlayers);
    onMatchEnd({ ...matchResult, evolvedPlayers });
  }, [matchResult, homeSquad, playerConditions, onMatchEnd, setMatchState, matchState.isFinished, matchState.isReplay]);

  useEffect(() => {
    // Only run if it's Live Match time and we haven't started yet
    if (cycleStatus.phase === 'LIVE_MATCH' && homeSquad.length > 0 && initialAwayTeam.length > 0 && gameMinute === 0 && !isActive && !_simulationStarted) {
      _simulationStarted = true;
      runSimulation();
    }
  }, [homeSquad, initialAwayTeam, gameMinute, isActive, gameTactics, runSimulation, cycleStatus.phase]);

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
            setTimeout(() => {
                setMatchState(prev => ({ ...prev, isPaused: false, minute: 46 }));
            }, 3000);
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
        
        if (playerIn && playerOut) {
            const newSquad = homeSquad.map(p => p.id === playerOutId ? playerIn : p);
            setHomeSquad(newSquad);
            
            const newBench = bench.filter(p => p.id !== playerInId).concat(playerOut);
            setBench(newBench);
            
            setMatchState(prev => ({
                ...prev,
                playerConditions: { ...prev.playerConditions, [playerInId]: 100 },
                visibleEvents: [{
                    minute: gameMinute,
                    type: 'SUB',
                    team: 'NEUTRAL',
                    text: `Dk ${gameMinute}: Teknik Direktör Onur oyuna müdahale ediyor! ${playerOut?.name || 'Oyuncu'} yerini ${playerIn?.name || 'Oyuncu'} isimli oyuncuya bıraktı.`
                }, ...prev.visibleEvents]
            }));
            
            runSimulation(gameMinute, score, newSquad, gameTactics);
        }

        return;
    }

    const newTactics = { ...gameTactics, [key]: value };
    setGameTactics(newTactics);
    
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
    setTimeout(() => {
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
  };

  const handleSubstitute = (playerIn: Player) => {
    if (!subbingPlayer || !playerIn) return;
    
    const newSquad = homeSquad.map(p => p.id === subbingPlayer.id ? playerIn : p);
    setHomeSquad(newSquad);
    
    setMatchState(prev => ({
      ...prev,
      visibleEvents: [{
        minute: gameMinute,
        type: 'SUB',
        team: 'NEUTRAL',
        text: `OYUNCU DEĞİŞİKLİĞİ: Giren: ${playerIn.name || 'Bilinmeyen'}, Çıkan: ${subbingPlayer.name || 'Bilinmeyen'}`
      }, ...prev.visibleEvents]
    }));
    
    setSubbingPlayer(null);
    runSimulation(gameMinute, score, newSquad, gameTactics);
  };


  // If match isn't live, show different UI
  if (!isActive && (cycleStatus.phase === 'IDLE' || cycleStatus.phase === 'POST_MATCH' || cycleStatus.phase === 'TRAINING_WINDOW')) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[600px] p-20 bg-black/80 backdrop-blur-md border border-white/5 space-y-8 text-center">
        <div className="w-24 h-24 rounded-full border-4 border-besiktas-red border-t-white animate-spin flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-besiktas-red/20" />
        </div>
        <div>
          <h2 className="text-4xl font-black italic tracking-tighter text-white uppercase">Sıradaki Maç Hazırlanıyor</h2>
          <p className="text-white/40 text-[10px] tracking-[0.4em] font-bold mt-4 uppercase">Sıradaki Randevu: {cycleStatus.nextEventTime}</p>
        </div>
        <div className="max-w-md bg-white/5 p-6 border border-white/10 italic text-sm text-white/60 leading-relaxed">
          &quot;Teknik ekip şu an antrenman programını veya bir sonraki rakip analizini gerçekleştiriyor. Canlı maç saati (12:00 veya 18:00) geldiğinde simülasyon motoru otomatik olarak devreye girecek.&quot;
        </div>

        {lastMatch && onStartReplay && (
          <button 
            onClick={() => onStartReplay(lastMatch)}
            className="flex items-center gap-4 p-4 bg-zinc-900 border border-white/5 rounded-2xl hover:border-emerald-500 hover:bg-emerald-500/5 transition-all group"
          >
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
               <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-6 h-6">
                 <path d="M5 3l14 9-14 9V3z" />
               </svg>
            </div>
            <div className="text-left">
              <p className="text-[10px] text-white/30 uppercase font-black tracking-widest mb-1">Son Maçı Tekrar İzle</p>
              <h3 className="text-sm font-black italic tracking-tight">{lastMatch.homeTeamName} {lastMatch.result.score.home} - {lastMatch.result.score.away} {lastMatch.awayTeamName}</h3>
            </div>
          </button>
        )}

        <button 
          onClick={async () => {
            if (setIsTestMode) setIsTestMode(true);
            // Small delay to ensure state propagates
            setTimeout(() => runSimulation(), 100);
          }}
          className="px-8 py-3 bg-white text-black text-[10px] font-black uppercase tracking-[0.3em] hover:bg-emerald-400 transition-colors shadow-2xl active:scale-95"
        >
          Manuel Simülasyonu Başlat (Test)
        </button>
      </div>
    );
  }

  if (!isActive && cycleStatus.phase === 'PRE_MATCH') {
     return (
        <div className="flex flex-col items-center justify-center h-full min-h-[600px] p-20 bg-black/80 backdrop-blur-md border border-white/5 space-y-8 text-center">
            <div className="text-amber-500 font-black text-6xl italic animate-pulse">!</div>
            <div>
                <h2 className="text-4xl font-black italic tracking-tighter text-white uppercase">Isınma Hareketleri Başladı</h2>
                <p className="text-white/40 text-[10px] tracking-[0.4em] font-bold mt-4 uppercase">Maç Başlıyor: {cycleStatus.nextEventTime} ({cycleStatus.countDownMinutes} DK KALDI)</p>
            </div>
            <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
                <div className="p-4 bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-widest text-white/40">LOBİ DURUMU: AKTİF</div>
                <div className="p-4 bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-widest text-white/40">MEDYA: HAZIR</div>
            </div>

            {lastMatch && onStartReplay && (
              <button 
                onClick={() => onStartReplay(lastMatch)}
                className="flex items-center gap-4 p-4 bg-zinc-900 border border-white/5 rounded-2xl hover:border-amber-500/50 hover:bg-amber-500/5 transition-all group"
              >
                <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-500">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-5 h-5">
                    <path d="M5 3l14 9-14 9V3z" />
                  </svg>
                </div>
                <div className="text-left">
                  <p className="text-[9px] text-white/30 uppercase font-black tracking-widest mb-1">Tekrar Modu</p>
                  <h3 className="text-xs font-black italic tracking-tight">{lastMatch.homeTeamName} vs {lastMatch.awayTeamName} (Replay)</h3>
                </div>
              </button>
            )}

            <button 
              onClick={async () => {
                if (setIsTestMode) setIsTestMode(true);
                setTimeout(() => runSimulation(), 100);
              }}
              className="px-8 py-3 bg-white text-black text-[10px] font-black uppercase tracking-[0.3em] hover:bg-emerald-400 transition-colors shadow-2xl active:scale-95"
            >
              Erken Başla (Test)
            </button>
        </div>
     );
  }

  return (
    <div className="flex flex-col h-full min-h-[600px] bg-black/80 backdrop-blur-sm text-white font-sans overflow-hidden relative border border-white/5">
      <AnimatePresence>
        {isMatchFinished && gameMinute >= 90 && matchResult && (
          <PostMatchSummary 
            result={matchResult}
            homeScore={score.home}
            awayScore={score.away}
            players={homeSquad}
            onClose={() => setMatchState(prev => ({ ...prev, isFinished: false }))} 
          />
        )}
      </AnimatePresence>

      {/* Score and Time Panel */}
      <div className="p-12 bg-black/60 backdrop-blur-md border-b border-white/10 flex flex-col items-center">
        <div className="flex items-center gap-12">
          <div className="text-center">
            <div className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em] mb-2">HOME</div>
            <div className="text-9xl font-black tracking-tighter leading-none italic">
              {score.home}
            </div>
          </div>
          <div className="text-5xl font-black text-white/10 mb-[-20px] tracking-widest italic">VS</div>
          <div className="text-center">
            <div className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em] mb-2">AWAY</div>
            <div className="text-9xl font-black tracking-tighter leading-none italic">
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
                  <h4 className="text-xl font-black italic tracking-tighter mb-6">YEDEK KULÜBESİ</h4>
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
                  <h4 className="text-xl font-black italic tracking-tighter mb-6">SAHADAKİLER (DEĞİŞTİR)</h4>
                  <div className="grid grid-cols-1 gap-2">
                     {homeSquad.map((player) => (
                       <button 
                         key={`active-sub-${player.id}`}
                         onClick={() => setSubbingPlayer(player)}
                         className={`p-4 rounded-2xl border transition-all text-left flex items-center justify-between ${
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
