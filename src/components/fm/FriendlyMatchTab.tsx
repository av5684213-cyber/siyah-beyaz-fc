'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Swords, Clock, Trophy, Users, Zap, Shield, UserCheck, RotateCcw, Timer, ChevronRight, Play, Eye, ArrowRight, Sparkles } from 'lucide-react';
import { useFM } from '@/lib/fm/GameContext';
import { useMatchContext } from '@/lib/fm/MatchContext';
import { useToast } from '@/lib/fm/ToastContext';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import { generateLocalizedPlayer } from '@/lib/fm/region-generator';
import { runUnifiedMatch } from '@/lib/fm/enhancedMatchEngine';
import { Player, MatchState } from '@/lib/fm/types';
import { useRouter } from 'next/navigation';

// Global type for storing friendly match opponent info between components
declare global {
  interface Window {
    _friendlyOpponentInfo?: { opponentId: string; opponentTeamName: string };
  }
}

// ═══════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════

interface QueueEntry {
  user_id: string;
  team_name: string;
  joined_at: string;
  expires_at: string;
  is_priority: boolean;
}

interface FriendlyMatchRecord {
  id: string;
  home_team_id: string;
  away_team_id: string;
  home_score: number;
  away_score: number;
  played_at: string;
  home_team_name?: string;
  away_team_name?: string;
  match_data?: Record<string, unknown>;
}

type MatchNotification = {
  type: 'matched';
  opponentName: string;
  opponentId: string;
} | null;

// ═══════════════════════════════════════════════════════════════
// Constants
// ═══════════════════════════════════════════════════════════════

const QUEUE_DURATION_SECONDS = 300; // 5 minutes
const POLL_INTERVAL_MS = 4000; // Check every 4 seconds
const MATCH_START_DELAY_MS = 2500; // Delay before starting matched game

// ═══════════════════════════════════════════════════════════════
// Component
// ═══════════════════════════════════════════════════════════════

export function FriendlyMatchTab() {
  const router = useRouter();
  const { profile, setProfile, squad, setSquad, setActiveTab, activeTactic } = useFM();
  const { setMatchState } = useMatchContext();
  const toast = useToast();

  // ── State ──
  const [loading, setLoading] = useState(false);
  const [queue, setQueue] = useState<QueueEntry[]>([]);
  const [timeLeft, setTimeLeft] = useState(QUEUE_DURATION_SECONDS);
  const [inQueue, setInQueue] = useState(false);
  const [isMatched, setIsMatched] = useState(false);
  const [matchedOpponent, setMatchedOpponent] = useState<string>('');
  const [history, setHistory] = useState<FriendlyMatchRecord[]>([]);
  const [notification, setNotification] = useState<MatchNotification>(null);
  const [activeView, setActiveView] = useState<'queue' | 'history'>('queue');

  // Refs for cleanup
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // ── Cleanup expired queue entries ──
  const cleanupExpiredQueue = useCallback(async () => {
    if (!isSupabaseConfigured()) return;
    try {
      const supabase = getSupabase();
      if (!supabase) return;
      const now = new Date().toISOString();
      await supabase.from('friendly_queue').delete().lt('expires_at', now);
    } catch (err) {
      console.error('[cleanupExpiredQueue] Error:', err);
    }
  }, []);

  // ── Fetch current queue ──
  const fetchQueue = useCallback(async () => {
    if (!isSupabaseConfigured()) return;
    try {
      const supabase = getSupabase();
      if (!supabase) return;

      // First cleanup expired
      await cleanupExpiredQueue();

      const { data, error } = await supabase
        .from('friendly_queue')
        .select('*')
        .gt('expires_at', new Date().toISOString())
        .order('is_priority', { ascending: false })
        .order('joined_at', { ascending: true })
        .limit(20);

      if (error) {
        console.error('[fetchQueue] Error:', error.message);
        return;
      }

      if (data) {
        setQueue(data.map((d: Record<string, unknown>) => ({
          user_id: d.user_id as string,
          team_name: (d.team_name as string) || 'Bilinmeyen Takım',
          joined_at: d.joined_at as string,
          expires_at: d.expires_at as string,
          is_priority: (d.is_priority as boolean) || false,
        })));
      }
    } catch (err) {
      console.error('[fetchQueue] Exception:', err);
    }
  }, [cleanupExpiredQueue]);

  // ── Fetch match history ──
  const fetchHistory = useCallback(async () => {
    if (!isSupabaseConfigured() || !profile) return;
    try {
      const supabase = getSupabase();
      if (!supabase) return;

      const { data, error } = await supabase
        .from('friendly_matches')
        .select('*')
        .or(`home_team_id.eq.${profile.id},away_team_id.eq.${profile.id}`)
        .order('played_at', { ascending: false })
        .limit(20);

      if (error) {
        console.error('[fetchHistory] Error:', error.message);
        return;
      }

      if (data) {
        // Enrich with team names from profiles
        const enriched = await Promise.all((data as FriendlyMatchRecord[]).map(async (m) => {
          if (m.home_team_name && m.away_team_name) return m;

          let homeName = 'Bilinmeyen';
          let awayName = 'Bilinmeyen';

          try {
            const { data: homeProfile } = await supabase
              .from('profiles')
              .select('team_name')
              .eq('id', m.home_team_id)
              .maybeSingle();
            if (homeProfile) homeName = homeProfile.team_name || homeName;

            const { data: awayProfile } = await supabase
              .from('profiles')
              .select('team_name')
              .eq('id', m.away_team_id)
              .maybeSingle();
            if (awayProfile) awayName = awayProfile.team_name || awayName;
          } catch {
            // Use fallback names
          }

          return { ...m, home_team_name: homeName, away_team_name: awayName };
        }));

        setHistory(enriched);
      }
    } catch (err) {
      console.error('[fetchHistory] Exception:', err);
    }
  }, [profile]);

  // ── Check my queue status on mount ──
  const checkMyQueueStatus = useCallback(async () => {
    if (!isSupabaseConfigured() || !profile) return;
    try {
      const supabase = getSupabase();
      if (!supabase) return;

      const { data, error } = await supabase
        .from('friendly_queue')
        .select('*')
        .eq('user_id', profile.id)
        .maybeSingle();

      if (error) {
        console.error('[checkMyQueueStatus] Error:', error.message);
        return;
      }

      if (data) {
        const expires = new Date(data.expires_at as string).getTime();
        const now = Date.now();
        const diff = Math.max(0, Math.floor((expires - now) / 1000));

        if (diff > 0) {
          setInQueue(true);
          setTimeLeft(diff);
        } else {
          // Entry expired, remove it
          await supabase.from('friendly_queue').delete().eq('user_id', profile.id);
          setInQueue(false);
          setTimeLeft(QUEUE_DURATION_SECONDS);
        }
      } else {
        setInQueue(false);
        setTimeLeft(QUEUE_DURATION_SECONDS);
      }
    } catch (err) {
      console.error('[checkMyQueueStatus] Exception:', err);
    }
  }, [profile]);

  // ── Generate AI Opponent (FALLBACK ONLY — real user squads fetched from Supabase) ──
  const generateOpponent = useCallback((teamName: string): { name: string; squad: Player[] } => {
    const opponentSquad: Player[] = [];
    const posCounts = { GK: 1, DEF: 4, MID: 4, FWD: 2 };

    Object.entries(posCounts).forEach(([pos, count]) => {
      for (let i = 0; i < count; i++) {
        const rating = 55 + Math.floor(Math.random() * 15);
        const p = generateLocalizedPlayer('tr', teamName, 1, pos as Player['position']);
        opponentSquad.push({ ...p, rating });
      }
    });

    return { name: teamName, squad: opponentSquad };
  }, [profile]);

  // ── Fetch real opponent squad from Supabase ──
  const fetchOpponentSquad = useCallback(async (opponentUserId: string, teamName: string): Promise<{ name: string; squad: Player[] } | null> => {
    if (!isSupabaseConfigured()) return null;
    try {
      const supabase = getSupabase();
      if (!supabase) return null;

      // Try fetching by profile_id first (real user players)
      const { data: players, error } = await supabase
        .from('players')
        .select('*')
        .eq('profile_id', opponentUserId)
        .limit(20);

      if (error) {
        console.error('[fetchOpponentSquad] Error:', error.message);
        return null;
      }

      if (players && players.length >= 7) {
        // Map DB columns to Player type
        const squad: Player[] = players.map((p: any) => ({
          id: p.id,
          name: p.name || 'Bilinmeyen',
          position: p.position || 'MID',
          specificPosition: p.specific_position || p.specificPosition || p.position || 'CM',
          rating: p.rating || 60,
          age: p.age || 20,
          potential: p.potential || p.rating || 60,
          market_value: p.market_value || 0,
          salary: p.salary || 0,
          nation: p.nation || 'TR',
          club: p.team_name || teamName,
          defending: p.defending || 50,
          passing: p.passing || 50,
          shooting: p.shooting || 50,
          speed: p.speed || 50,
          power: p.power || 50,
          cond: p.cond ?? p.form ?? 80,
          form: p.form ?? 50,
          morale: p.morale ?? 60,
          confidence: p.confidence ?? 50,
          hidden_potential: p.hidden_potential || p.potential || 60,
          traits: typeof p.traits === 'string' ? JSON.parse(p.traits || '[]') : (p.traits || []),
          negTraits: typeof p.neg_traits === 'string' ? JSON.parse(p.neg_traits || '[]') : (p.neg_traits || []),
          is_injured: p.is_injured || false,
          match_ratings: typeof p.match_ratings === 'string' ? JSON.parse(p.match_ratings || '[]') : (p.match_ratings || []),
        } as Player));
        return { name: teamName, squad };
      }

      // Not enough players found — fallback will be used
      console.warn(`[fetchOpponentSquad] Only ${players?.length || 0} players found for user ${opponentUserId}, using AI fallback`);
      return null;
    } catch (err) {
      console.error('[fetchOpponentSquad] Exception:', err);
      return null;
    }
  }, []);

  // ── Start match simulation ──
  const startMatch = useCallback(async (opponent: { name: string; squad: Player[] }) => {
    if (!squad.length) return;

    try {
      const result = await runUnifiedMatch(squad, opponent.squad, {
        activeTactic,
        homeTeamName: profile?.team_name || 'Benim Takımım',
        awayTeamName: opponent.name,
      });

      setMatchState({
        minute: 0,
        score: { home: 0, away: 0 },
        result: result,
        visibleEvents: [],
        matchSummaryEvents: { home: [], away: [] },
        isActive: true,
        isFinished: false,
        isPaused: false,
        playerConditions: squad.reduce((acc, p) => ({ ...acc, [p.id]: p.cond || 100 }), {}),
        isFriendly: true
      });

      setActiveTab('matchday');
    } catch (err) {
      console.error('[startMatch] Error:', err);
    }
  }, [squad, activeTactic, setMatchState, setActiveTab]);

  // ── Save match to friendly_matches (insert OR update) ──
  const saveFriendlyMatch = useCallback(async (
    opponentId: string,
    homeScore: number,
    awayScore: number,
    matchResult?: Record<string, unknown>,
    matchId?: string
  ) => {
    if (!isSupabaseConfigured() || !profile) return;
    try {
      const supabase = getSupabase();
      if (!supabase) return;

      if (matchId) {
        // UPDATE existing record with real score
        const { error } = await supabase
          .from('friendly_matches')
          .update({
            home_score: homeScore,
            away_score: awayScore,
            match_data: matchResult ? JSON.stringify(matchResult) : null,
          })
          .eq('id', matchId);
        if (error) {
          console.error('[saveFriendlyMatch] Update error:', error.message);
        }
      } else {
        // INSERT new record
        await supabase.from('friendly_matches').insert({
          home_team_id: profile.id,
          away_team_id: opponentId,
          home_score: homeScore,
          away_score: awayScore,
          played_at: new Date().toISOString(),
          match_data: matchResult ? JSON.stringify(matchResult) : null
        });
      }
    } catch (err) {
      console.error('[saveFriendlyMatch] Error:', err);
    }
  }, [profile]);

  // ── Check for auto-match (2 teams in queue) ──
  const checkForMatch = useCallback(async () => {
    if (!isSupabaseConfigured() || !profile || !inQueue) return;
    try {
      const supabase = getSupabase();
      if (!supabase) return;

      // Get all valid queue entries
      const { data: allInQueue, error } = await supabase
        .from('friendly_queue')
        .select('*')
        .gt('expires_at', new Date().toISOString())
        .order('is_priority', { ascending: false })
        .order('joined_at', { ascending: true });

      if (error || !allInQueue || allInQueue.length < 2) return;

      // Find first two different users
      const first = allInQueue[0];
      const second = allInQueue.find((e: Record<string, unknown>) => e.user_id !== first.user_id);
      if (!second) return;

      // Check if current user is one of the matched pair
      const isUserMatched = (first.user_id as string) === profile.id || (second.user_id as string) === profile.id;

      if (isUserMatched) {
        // Remove both from queue
        await supabase.from('friendly_queue').delete().eq('user_id', first.user_id);
        await supabase.from('friendly_queue').delete().eq('user_id', second.user_id);

        // Determine opponent
        const opponentEntry = (first.user_id as string) === profile.id ? second : first;
        const opponentTeamName = (opponentEntry.team_name as string) || 'Bilinmeyen Takım';
        const opponentId = opponentEntry.user_id as string;

        // Show match notification
        setNotification({ type: 'matched', opponentName: opponentTeamName, opponentId });
        setIsMatched(true);
        setMatchedOpponent(opponentTeamName);
        setInQueue(false);

        // Fetch real opponent squad from Supabase (fallback to AI-generated)
        const realOpponent = await fetchOpponentSquad(opponentId, opponentTeamName);
        const opponent = realOpponent || generateOpponent(opponentTeamName);

        // Store opponent info for post-match save (do NOT save with 0-0 before match)
        // Match record will be saved with real score after match ends
        window._friendlyOpponentInfo = { opponentId, opponentTeamName };

        // Start match after brief delay
        setTimeout(() => {
          setIsMatched(false);
          setNotification(null);
          startMatch(opponent);
        }, MATCH_START_DELAY_MS);
      }
    } catch (err) {
      console.error('[checkForMatch] Error:', err);
    }
  }, [profile, inQueue, generateOpponent, saveFriendlyMatch, startMatch]);

  // ── JOIN QUEUE (Main button - free) ──
  const handleJoinQueue = async () => {
    if (!profile) return;
    if (inQueue) {
      return; // Already in queue
    }
    if (isMatched) {
      return; // Match found, don't re-queue
    }

    setLoading(true);

    try {
      if (isSupabaseConfigured()) {
        const supabase = getSupabase();
        if (!supabase) {
          setLoading(false);
          return;
        }

        // Check if already in queue
        const { data: existing } = await supabase
          .from('friendly_queue')
          .select('user_id')
          .eq('user_id', profile.id)
          .maybeSingle();

        if (existing) {
          // Already in queue, just update state
          setInQueue(true);
          setLoading(false);
          return;
        }

        const expiresAt = new Date(Date.now() + QUEUE_DURATION_SECONDS * 1000).toISOString();

        const { error } = await supabase.from('friendly_queue').insert({
          user_id: profile.id,
          team_name: profile.team_name || 'Bilinmeyen',
          expires_at: expiresAt,
          is_priority: false
        });

        if (error) {
          console.error('[handleJoinQueue] Insert error:', error.message);
          setLoading(false);
          toast.error('Sıraya girilemedi. Tekrar deneyin.');
          return;
        }
      }

      setInQueue(true);
      setTimeLeft(QUEUE_DURATION_SECONDS);
      fetchQueue();

      // Immediately check for match after joining
      setTimeout(() => checkForMatch(), 500);
    } catch (err) {
      console.error('[handleJoinQueue] Exception:', err);
      toast.error('Bir hata oluştu. Tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  // ── JOIN PRIORITY QUEUE (1 Credit) ──
  const handleJoinPriorityQueue = async () => {
    if (!profile) return;
    if (inQueue || isMatched) return;
    if ((profile.credits || 0) < 1) {
      toast.error('Yetersiz kredi! Öncelikli eşleşme için 1 KR gereklidir.');
      return;
    }

    setLoading(true);
    try {
      if (isSupabaseConfigured()) {
        const supabase = getSupabase();
        if (!supabase) {
          setLoading(false);
          return;
        }

        // Check if already in queue
        const { data: existing } = await supabase
          .from('friendly_queue')
          .select('user_id')
          .eq('user_id', profile.id)
          .maybeSingle();

        if (existing) {
          setInQueue(true);
          setLoading(false);
          return;
        }

        const expiresAt = new Date(Date.now() + QUEUE_DURATION_SECONDS * 1000).toISOString();

        const { error } = await supabase.from('friendly_queue').insert({
          user_id: profile.id,
          team_name: profile.team_name || 'Bilinmeyen',
          expires_at: expiresAt,
          is_priority: true
        });

        if (error) {
          console.error('[handleJoinPriorityQueue] Insert error:', error.message);
          setLoading(false);
          toast.error('Sıraya girilemedi. Tekrar deneyin.');
          return;
        }

        // Deduct 1 credit
        const newCredits = Math.max(0, (profile.credits || 0) - 1);
        await supabase.from('profiles').update({ credits: newCredits }).eq('id', profile.id);
        setProfile((prev: any) => {
          if (!prev) return prev;
          return { ...prev, credits: newCredits };
        });
      }

      setInQueue(true);
      setTimeLeft(QUEUE_DURATION_SECONDS);
      fetchQueue();

      // Immediately check for match after joining
      setTimeout(() => checkForMatch(), 500);
    } catch (err) {
      console.error('[handleJoinPriorityQueue] Exception:', err);
      toast.error('Bir hata oluştu. Tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  // ── LEAVE QUEUE ──
  const handleLeaveQueue = async () => {
    try {
      if (isSupabaseConfigured() && profile) {
        const supabase = getSupabase();
        if (supabase) {
          await supabase.from('friendly_queue').delete().eq('user_id', profile.id);
        }
      }
    } catch (err) {
      console.error('[handleLeaveQueue] Error:', err);
    }

    setInQueue(false);
    setIsMatched(false);
    setTimeLeft(QUEUE_DURATION_SECONDS);
    setNotification(null);
    fetchQueue();
  };

  // ── EFFECTS ──

  // Initial load
  useEffect(() => {
    const init = async () => {
      await cleanupExpiredQueue();
      await fetchQueue();
      await fetchHistory();
      await checkMyQueueStatus();
    };
    init();
  }, [cleanupExpiredQueue, fetchQueue, fetchHistory, checkMyQueueStatus]);

  // Timer countdown when in queue
  useEffect(() => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    if (inQueue && timeLeft > 0) {
      timerIntervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            // Time's up - leave queue automatically
            handleLeaveQueue();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [inQueue, timeLeft]);

  // Polling for match while in queue
  useEffect(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }

    if (inQueue && profile) {
      pollIntervalRef.current = setInterval(() => {
        checkForMatch();
        fetchQueue();
      }, POLL_INTERVAL_MS);
    }

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [inQueue, profile, checkForMatch, fetchQueue]);

  // ── Helpers ──
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const timerPercent = (timeLeft / QUEUE_DURATION_SECONDS) * 100;

  const getMatchResult = (m: FriendlyMatchRecord): 'W' | 'D' | 'L' | null => {
    if (!profile) return null;
    const isHome = m.home_team_id === profile.id;
    const myScore = isHome ? m.home_score : m.away_score;
    const oppScore = isHome ? m.away_score : m.home_score;
    if (myScore > oppScore) return 'W';
    if (myScore === oppScore) return 'D';
    return 'L';
  };

  // ═══════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* ═══ HERO SECTION ═══ */}
      <div className="bg-zinc-900/40 border border-white/5 rounded-[2.5rem] p-8 backdrop-blur-md">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                <Swords size={18} className="text-emerald-400" />
              </div>
              <div>
                <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white">Hazırlık Maçı Merkezi</h2>
                <p className="text-[8px] text-white/30 uppercase tracking-[0.3em] font-black">Kadro Uyumu & Form Yönetimi</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3 ml-11">
              <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[8px] font-black uppercase tracking-wider rounded-full">+10% Pozisyon Uyumu</span>
              <span className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[8px] font-black uppercase tracking-wider rounded-full">2x Antrenman Puanı</span>
              <span className="px-3 py-1 bg-red-500/10 border border-red-500/20 text-red-400 text-[8px] font-black uppercase tracking-wider rounded-full">-5% Kondisyon</span>
            </div>
          </div>

          {/* ── Main Action Buttons ── */}
          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            {/* Free Queue Button — SIRAYA GİR (ücretsiz, is_priority: false) */}
            <button
              onClick={inQueue ? handleLeaveQueue : handleJoinQueue}
              disabled={loading || isMatched}
              className={`flex-1 lg:flex-none flex items-center gap-3 px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all relative overflow-hidden group ${
                inQueue
                  ? 'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30'
                  : 'bg-emerald-500 text-black hover:bg-emerald-400 hover:scale-105 active:scale-95 shadow-[0_10px_30px_rgba(16,185,129,0.2)]'
              } disabled:opacity-30 disabled:hover:scale-100`}
            >
              <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors" />
              <div className="relative flex items-center gap-3">
                <div className={`p-1.5 rounded-lg ${inQueue ? 'bg-red-500/20' : 'bg-black/20'}`}>
                  {inQueue ? <RotateCcw size={16} /> : <Users size={16} />}
                </div>
                <div className="flex flex-col leading-none">
                  <span className="text-[11px]">{inQueue ? 'SIRADAN ÇIK' : 'SIRAYA GİR'}</span>
                  <span className="text-[7px] opacity-60 font-bold">
                    {inQueue ? 'BEKLEMEYİ İPTAL ET' : 'ÜCRETSİZ — OTOMATİK EŞLEŞME'}
                  </span>
                </div>
              </div>
            </button>

            {/* Paid Priority Button — HAZIRLIK MAÇI TEKLİFİ VER (1 kredi, is_priority: true) */}
            {!inQueue && !isMatched && (
              <button
                onClick={handleJoinPriorityQueue}
                disabled={loading || isMatched || (profile?.credits || 0) < 1}
                className={`flex-1 lg:flex-none flex items-center gap-3 px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all relative overflow-hidden group ${
                  (profile?.credits || 0) < 1
                    ? 'bg-white/5 text-white/20 border border-white/10 cursor-not-allowed'
                    : 'bg-gradient-to-r from-purple-600 to-violet-600 text-white hover:from-purple-500 hover:to-violet-500 hover:scale-105 active:scale-95 shadow-[0_10px_30px_rgba(139,92,246,0.25)]'
                } disabled:opacity-30 disabled:hover:scale-100`}
              >
                <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors" />
                <div className="relative flex items-center gap-3">
                  <div className={`p-1.5 rounded-lg ${(profile?.credits || 0) < 1 ? 'bg-white/10' : 'bg-white/20'}`}>
                    <Zap size={16} />
                  </div>
                  <div className="flex flex-col leading-none">
                    <span className="text-[11px]">HAZIRLIK MAÇI TEKLİFİ VER</span>
                    <span className="text-[7px] opacity-60 font-bold">
                      {(profile?.credits || 0) < 1 ? 'YETERSİZ KREDİ' : '⚡ 1 KREDİ — ÖNCELİKLİ EŞLEŞME'}
                    </span>
                  </div>
                </div>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ═══ MATCH FOUND NOTIFICATION ═══ */}
      <AnimatePresence>
        {isMatched && notification?.type === 'matched' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            className="bg-emerald-500/10 border-2 border-emerald-500/40 rounded-[2rem] p-8 text-center relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-emerald-500/5 animate-pulse" />
            <div className="relative z-10 space-y-4">
              <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-[0_0_40px_rgba(16,185,129,0.4)]">
                <Zap size={36} className="text-black fill-black" />
              </div>
              <h3 className="text-2xl font-black italic uppercase tracking-tighter text-emerald-300">
                EŞLEŞME BULUNDU!
              </h3>
              <p className="text-sm text-white/50 max-w-md mx-auto">
                Rakip: <span className="text-emerald-300 font-black">{notification.opponentName}</span>
              </p>
              <p className="text-xs text-white/30">Maç otomatik olarak başlıyor...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ TIMER BAR (When in queue) ═══ */}
      <AnimatePresence>
        {inQueue && !isMatched && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="bg-zinc-900/60 border border-white/10 rounded-[2rem] p-6 relative overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-500/10 rounded-xl border border-amber-500/20">
                    <Timer size={16} className="text-amber-400" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-widest text-white/40">EŞLEŞME BEKLENİYOR</h3>
                    <p className="text-[8px] text-white/20 uppercase tracking-wider font-bold">5 DAKİKA İÇİNDE RAKİP ARANIYOR</p>
                  </div>
                </div>
                <div className="text-4xl font-black font-mono text-amber-400 tracking-wider">
                  {formatTime(timeLeft)}
                </div>
              </div>

              {/* Progress bar */}
              <div className="h-2 bg-black/40 rounded-full overflow-hidden mb-4">
                <motion.div
                  className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full"
                  animate={{ width: `${timerPercent}%` }}
                  transition={{ duration: 1, ease: 'linear' }}
                />
              </div>

              {/* Queue list */}
              {queue.length > 0 && (
                <div className="space-y-1">
                  <p className="text-[8px] font-black uppercase tracking-widest text-white/20 mb-2">
                    SIRA LİSTESİ ({queue.length} TAKIM)
                  </p>
                  {queue.slice(0, 8).map((entry, idx) => (
                    <div
                      key={entry.user_id}
                      className={`flex items-center gap-3 px-4 py-2 rounded-xl transition-all ${
                        entry.user_id === profile?.id
                          ? 'bg-amber-500/10 border border-amber-500/20'
                          : 'bg-black/20'
                      }`}
                    >
                      <span className={`text-[9px] font-black w-5 text-center ${idx === 0 ? 'text-emerald-400' : 'text-white/20'}`}>
                        {idx + 1}.
                      </span>
                      <span className={`text-[10px] font-bold flex-1 ${
                        entry.user_id === profile?.id ? 'text-amber-400' : 'text-white/50'
                      }`}>
                        {entry.team_name || 'Bilinmeyen Takım'}
                        {entry.user_id === profile?.id && (
                          <span className="ml-2 text-[7px] font-black uppercase text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full">SİZ</span>
                        )}
                        {entry.is_priority && (
                          <span className="ml-1 text-[7px] font-black uppercase text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full">ÖNCELİKLİ</span>
                        )}
                      </span>
                      {idx < 2 && queue.length >= 2 && (
                        <Sparkles size={10} className="text-emerald-400 animate-pulse" />
                      )}
                    </div>
                  ))}
                  {queue.length > 8 && (
                    <p className="text-[8px] text-white/20 text-center mt-2">
                      +{queue.length - 8} takım daha bekliyor
                    </p>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ TAB SWITCHER (Queue / History) ═══ */}
      <div className="flex gap-1 p-1 bg-white/[0.03] rounded-xl border border-white/[0.06]">
        <button
          onClick={() => setActiveView('queue')}
          className={`flex-1 px-6 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
            activeView === 'queue'
              ? 'bg-amber-500/15 text-amber-300 shadow-md shadow-amber-500/5'
              : 'text-white/30 hover:text-white/50 hover:bg-white/[0.03]'
          }`}
        >
          <Users size={12} /> Sıra Durumu
        </button>
        <button
          onClick={() => setActiveView('history')}
          className={`flex-1 px-6 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
            activeView === 'history'
              ? 'bg-amber-500/15 text-amber-300 shadow-md shadow-amber-500/5'
              : 'text-white/30 hover:text-white/50 hover:bg-white/[0.03]'
          }`}
        >
          <Clock size={12} /> Geçmiş Maçlar
        </button>
      </div>

      {/* ═══ CONTENT AREA ═══ */}
      <AnimatePresence mode="wait">
        {activeView === 'queue' ? (
          <motion.div
            key="queue"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-6"
          >
            {/* Current queue status (when not in queue) */}
            {!inQueue && !isMatched && (
              <div className="bg-zinc-900/40 border border-white/5 rounded-[2rem] p-8 flex flex-col items-center justify-center text-center space-y-5">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center">
                  <Swords size={28} className="text-emerald-500/50" />
                </div>
                <div>
                  <h4 className="text-base font-black italic uppercase text-white/80">Nasıl Çalışır?</h4>
                </div>
                <div className="space-y-3 text-left w-full max-w-xs">
                  <div className="flex items-start gap-3">
                    <div className="p-1 bg-emerald-500/10 rounded-lg mt-0.5"><Swords size={12} className="text-emerald-400" /></div>
                    <div>
                      <p className="text-[10px] font-black text-white/60 uppercase">Hazırlık Maçı Teklifi Ver</p>
                      <p className="text-[9px] text-white/30">Sıraya girin, 5 dakika içinde rakip bulunca otomatik maç başlar.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="p-1 bg-amber-500/10 rounded-lg mt-0.5"><Users size={12} className="text-amber-400" /></div>
                    <div>
                      <p className="text-[10px] font-black text-white/60 uppercase">Otomatik Eşleşme</p>
                      <p className="text-[9px] text-white/30">İlk 2 takım eşleşir. Kalanlar sıradaki eşleşmeyi bekler.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="p-1 bg-red-500/10 rounded-lg mt-0.5"><Timer size={12} className="text-red-400" /></div>
                    <div>
                      <p className="text-[10px] font-black text-white/60 uppercase">5 Dakika Kuralı</p>
                      <p className="text-[9px] text-white/30">Süre bittiğinde sıra temizlenir. Tekrar girmeniz gerekir.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Live queue status */}
            {queue.length > 0 && !inQueue && (
              <div className="bg-zinc-900/40 border border-white/5 rounded-[2rem] p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Users size={14} className="text-amber-400" />
                  <h3 className="text-xs font-black uppercase tracking-widest text-white/40">
                    ŞU AN BEKLEYEN ({queue.length} TAKIM)
                  </h3>
                </div>
                <div className="space-y-1">
                  {queue.slice(0, 6).map((entry, idx) => (
                    <div
                      key={entry.user_id}
                      className="flex items-center gap-3 px-4 py-2 rounded-xl bg-black/20"
                    >
                      <span className="text-[9px] font-black w-5 text-center text-white/20">{idx + 1}.</span>
                      <span className="text-[10px] font-bold flex-1 text-white/50">
                        {entry.team_name}
                        {entry.is_priority && (
                          <span className="ml-1 text-[7px] font-black uppercase text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full">ÖNCELİKLİ</span>
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="history"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div className="bg-zinc-900/40 border border-white/5 rounded-[2rem] overflow-hidden">
              <div className="p-5 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock size={14} className="text-white/30" />
                  <h3 className="text-xs font-black uppercase tracking-widest text-white/40">Geçmiş Hazırlık Maçları</h3>
                </div>
                <span className="text-[9px] text-white/20 font-bold">{history.length} MAÇ</span>
              </div>
              <div className="p-4 max-h-[400px] overflow-y-auto">
                {history.length === 0 ? (
                  <div className="py-12 text-center opacity-20 italic text-sm">Henüz hazırlık maçı oynamadınız.</div>
                ) : (
                  <div className="space-y-2">
                    {history.map((m) => {
                      const result = getMatchResult(m);
                      const isHome = m.home_team_id === profile?.id;
                      const homeName = m.home_team_name || (isHome ? profile?.team_name : 'Rakip');
                      const awayName = m.away_team_name || (!isHome ? profile?.team_name : 'Rakip');

                      return (
                        <div
                          key={m.id}
                          className="bg-white/5 p-4 rounded-xl flex items-center justify-between border border-white/5 hover:bg-white/[0.07] transition-all"
                        >
                          {/* Venue */}
                          <div className="flex flex-col items-center gap-1 w-12">
                            <span className={`text-[8px] font-black uppercase tracking-widest ${
                              isHome ? 'text-emerald-400' : 'text-sky-400'
                            }`}>
                              {isHome ? 'EV' : 'DEP'}
                            </span>
                            {result && (
                              <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${
                                result === 'W' ? 'bg-emerald-500/20 text-emerald-400' :
                                result === 'D' ? 'bg-amber-500/20 text-amber-400' :
                                'bg-red-500/20 text-red-400'
                              }`}>
                                {result === 'W' ? 'G' : result === 'D' ? 'B' : 'M'}
                              </span>
                            )}
                          </div>

                          {/* Teams & Score */}
                          <div className="flex-1 px-3">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`text-[11px] font-bold ${isHome ? 'text-amber-300' : 'text-white/50'}`}>
                                {homeName}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`text-[11px] font-bold ${!isHome ? 'text-amber-300' : 'text-white/50'}`}>
                                {awayName}
                              </span>
                            </div>
                          </div>

                          {/* Score */}
                          <div className="flex items-center gap-3 bg-black/40 px-5 py-2 rounded-full border border-white/10">
                            <span className={`text-lg font-black font-mono ${
                              m.home_score > m.away_score
                                ? (isHome ? 'text-emerald-400' : 'text-white/60')
                                : 'text-white/60'
                            }`}>{m.home_score}</span>
                            <span className="text-white/20 text-xs">-</span>
                            <span className={`text-lg font-black font-mono ${
                              m.away_score > m.home_score
                                ? (!isHome ? 'text-emerald-400' : 'text-white/60')
                                : 'text-white/60'
                            }`}>{m.away_score}</span>
                          </div>

                          {/* Date & Replay */}
                          <div className="flex flex-col items-end gap-1 ml-3 w-20">
                            <span className="text-[9px] text-white/30 font-bold">
                              {new Date(m.played_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
                            </span>
                            <button
                              onClick={() => router.push(`/match/${m.id}`)}
                              className="flex items-center gap-1 px-2 py-0.5 bg-white/5 hover:bg-white/10 rounded-md text-[8px] font-black uppercase tracking-widest text-white/40 hover:text-white/70 transition-all"
                            >
                              <Eye size={8} /> Tekrar İzle
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
