'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Swords, Clock, Trophy, Users, Zap, Shield, Coins, UserCheck, RotateCcw, Timer, ChevronRight } from 'lucide-react';
import { useFM } from '@/lib/fm/GameContext';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import { generateLocalizedPlayer } from '@/lib/fm/region-generator';
import { simulateMatch } from '@/lib/fm/matchEngine';
import { Player } from '@/lib/fm/types';

interface QueueEntry {
  user_id: string;
  team_name: string;
  joined_at: string;
  order: number;
}

export function FriendlyMatchTab() {
  const { profile, setProfile, squad, setSquad, setMatchState, setActiveTab, activeTactic } = useFM();
  const [loading, setLoading] = useState(false);
  const [queue, setQueue] = useState<QueueEntry[]>([]);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [isMyTurn, setIsMyTurn] = useState(false);
  const [inQueue, setInQueue] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [lastMatchResult, setLastMatchResult] = useState<{ home: number; away: number; opponent: string } | null>(null);

  // ── Timer & Queue Management ──
  const QUEUE_DURATION = 300; // 5 minutes

  const fetchQueue = useCallback(async () => {
    if (!isSupabaseConfigured()) return;
    const supabase = getSupabase();
    if (!supabase) return;
    const { data } = await supabase
      .from('friendly_queue')
      .select('*')
      .order('joined_at', { ascending: true })
      .limit(20);
    if (data) {
      setQueue(data.map((d: any) => ({
        user_id: d.user_id,
        team_name: d.team_name || 'Bilinmeyen Takım',
        joined_at: d.joined_at,
        order: 0
      })));
    }
  }, []);

  const checkMyQueueStatus = useCallback(async () => {
    if (!isSupabaseConfigured() || !profile) return;
    const supabase = getSupabase();
    if (!supabase) return;
    const { data } = await supabase
      .from('friendly_queue')
      .select('*')
      .eq('user_id', profile.id)
      .single();

    if (data) {
      const expires = new Date(data.expires_at).getTime();
      const now = new Date().getTime();
      const diff = Math.floor((expires - now) / 1000);
      if (diff > 0) {
        setInQueue(true);
        setTimeLeft(diff);
      } else {
        // Timer expired - check if it's my turn
        const allEntries = await supabase
          .from('friendly_queue')
          .select('*')
          .order('joined_at', { ascending: true })
          .limit(1);
        
        if (allEntries.data && allEntries.data[0]?.user_id === profile.id) {
          setIsMyTurn(true);
        } else {
          // Remove from queue
          await supabase.from('friendly_queue').delete().eq('user_id', profile.id);
          setInQueue(false);
          setTimeLeft(QUEUE_DURATION);
        }
      }
    }
  }, [profile]);

  const cleanupExpiredQueue = useCallback(async () => {
    if (!isSupabaseConfigured()) return;
    const supabase = getSupabase();
    if (!supabase) return;
    const now = new Date().toISOString();
    await supabase.from('friendly_queue').delete().lt('expires_at', now);
  }, []);

  const fetchHistory = useCallback(async () => {
    if (!isSupabaseConfigured() || !profile) return;
    const supabase = getSupabase();
    if (!supabase) return;
    const { data } = await supabase
      .from('friendly_matches')
      .select('*')
      .or(`home_team_id.eq.${profile.id},away_team_id.eq.${profile.id}`)
      .order('played_at', { ascending: false })
      .limit(10);
    if (data) setHistory(data);
  }, [profile]);

  useEffect(() => {
    // Use setTimeout to avoid calling setState synchronously within an effect
    setTimeout(() => {
      fetchQueue();
      fetchHistory();
      checkMyQueueStatus();
      cleanupExpiredQueue();
    }, 0);
  }, [fetchQueue, fetchHistory, checkMyQueueStatus, cleanupExpiredQueue]);

  // Timer tick
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (inQueue && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setInQueue(false);
            checkQueueTurn();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [inQueue, timeLeft]);

  const checkQueueTurn = async () => {
    if (!isSupabaseConfigured() || !profile) return;
    const supabase = getSupabase();
    if (!supabase) return;
    
    const { data } = await supabase
      .from('friendly_queue')
      .select('*')
      .order('joined_at', { ascending: true })
      .limit(1);
    
    if (data && data[0]?.user_id === profile.id) {
      setIsMyTurn(true);
    }
  };

  // ── Generate Opponent ──
  const generateOpponent = (difficulty: 'easy' | 'hard'): { name: string; squad: Player[] } => {
    const teamNames = ['Kasimpasa SK', 'Adana Demirspor', 'Eyupspor', 'Bandirmaspor', 'Giresunspor', 'Altay SK', 'Bursaspor', 'Konyaspor', 'Sivasspor', 'Rizespor'];
    const opponentTeamName = difficulty === 'hard' 
      ? 'Yildizlar Karmasi' 
      : teamNames[Math.floor(Math.random() * teamNames.length)];
    
    const opponentSquad: Player[] = [];
    const posCounts = { GK: 1, DEF: 4, MID: 4, FWD: 2 };
    
    Object.entries(posCounts).forEach(([pos, count]) => {
      for (let i = 0; i < count; i++) {
        const rating = difficulty === 'hard' 
          ? (70 + Math.floor(Math.random() * 15)) 
          : (55 + Math.floor(Math.random() * 15));
        const p = generateLocalizedPlayer(profile?.region || 'tr', opponentTeamName, 1, pos as any);
        opponentSquad.push({ ...p, rating });
      }
    });

    return { name: opponentTeamName, squad: opponentSquad };
  };

  // ── Start Match ──
  const startMatch = (opponent: { name: string; squad: Player[] }) => {
    if (!squad.length) return;

    const result = simulateMatch(squad, opponent.squad, { 
      homeTactics: activeTactic, 
      activeTactic 
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
  };

  // ── Button 1: Teklif Et (1 MG Coin - Direkt Mac) ──
  const handleOfferMatch = async () => {
    if (!profile) return;
    if ((profile.mg_coins || 0) < 1) {
      alert('Yetersiz MG Coin! (1 MG gerekli)');
      return;
    }

    if (!confirm('1 MG Coin karşılığında hazırlık maçı teklif edilecek. Rakip hemen bulunacak. Devam?')) return;

    setLoading(true);
    
    const opponent = generateOpponent('hard');
    
    // Deduct coin
    const newMG = (profile.mg_coins || 0) - 1;
    setProfile((prev: any) => ({ ...prev, mg_coins: newMG }));
    
    if (isSupabaseConfigured()) {
      const supabase = getSupabase();
      if (supabase) await supabase.from('profiles').update({ mg_coins: newMG }).eq('id', profile.id);
    }

    // Small delay for UX feel
    setTimeout(() => {
      setLoading(false);
      startMatch(opponent);
    }, 1500);
  };

  // ── Button 2: Siraya Gir (Ucretsiz - 5 dk bekleme) ──
  const handleJoinQueue = async () => {
    if (!profile) return;
    if (inQueue) {
      alert('Zaten siradasiniz!');
      return;
    }
    if (isMyTurn) {
      alert('Siranız gelmis! Mac oynayin.');
      return;
    }

    if (!confirm('Hazirlik maci sirasina gireceksiniz. 5 dakika icinde siraniz geldiginde mac yapabilirsiniz. Devam?')) return;

    setLoading(true);

    if (isSupabaseConfigured()) {
      const supabase = getSupabase();
      if (!supabase) { setLoading(false); return; }
      const expiresAt = new Date(Date.now() + QUEUE_DURATION * 1000).toISOString();
      
      // Check if already in queue
      const { data: existing } = await supabase
        .from('friendly_queue')
        .select('user_id')
        .eq('user_id', profile.id)
        .single();
      
      if (existing) {
        setLoading(false);
        alert('Zaten siradasiniz!');
        return;
      }

      const { error } = await supabase.from('friendly_queue').insert({
        user_id: profile.id,
        team_name: profile.team_name || 'Bilinmeyen',
        expires_at: expiresAt
      });

      if (error) {
        console.error('Queue join error:', error);
        setLoading(false);
        alert('Siraya girilemedi. Tekrar deneyin.');
        return;
      }

      setInQueue(true);
      setTimeLeft(QUEUE_DURATION);
      fetchQueue();
    } else {
      // Fallback without Supabase - simulate queue
      setInQueue(true);
      setTimeLeft(QUEUE_DURATION);
    }

    setLoading(false);
  };

  // ── Play from Queue (Sira Geldiginde - Otomatik Baslar) ──
  useEffect(() => {
    if (!isMyTurn || !profile) return;

    const autoStart = async () => {
      const opponent = generateOpponent('easy');

      // Remove from queue
      if (isSupabaseConfigured()) {
        const supabase = getSupabase();
        if (supabase) await supabase.from('friendly_queue').delete().eq('user_id', profile.id);
      }

      setIsMyTurn(false);
      setInQueue(false);
      setTimeLeft(QUEUE_DURATION);

      startMatch(opponent);
    };

    // Short delay so user sees the notification briefly
    const timer = setTimeout(autoStart, 1500);
    return () => clearTimeout(timer);
  }, [isMyTurn]);

  // ── Leave Queue ──
  const handleLeaveQueue = async () => {
    if (!confirm('Siradan cikmak istiyor musunuz?')) return;
    
    if (isSupabaseConfigured() && profile) {
      const supabase = getSupabase();
      if (supabase) await supabase.from('friendly_queue').delete().eq('user_id', profile.id);
    }

    setInQueue(false);
    setIsMyTurn(false);
    setTimeLeft(QUEUE_DURATION);
    fetchQueue();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const timerPercent = (timeLeft / QUEUE_DURATION) * 100;

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
                <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white">Hazirlik Maci Merkezi</h2>
                <p className="text-[8px] text-white/30 uppercase tracking-[0.3em] font-black">Kadro Uyumu & Form Yonetimi</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3 ml-11">
              <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[8px] font-black uppercase tracking-wider rounded-full">+10% Pozisyon Uyum</span>
              <span className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[8px] font-black uppercase tracking-wider rounded-full">2x Antrenman Puan</span>
              <span className="px-3 py-1 bg-red-500/10 border border-red-500/20 text-red-400 text-[8px] font-black uppercase tracking-wider rounded-full">-5% Kondisyon</span>
            </div>
          </div>

          {/* ── Action Buttons ── */}
          <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
            {/* Button 1: Teklif Et */}
            <button 
              onClick={handleOfferMatch}
              disabled={loading || isMyTurn}
              className="flex-1 lg:flex-none flex items-center gap-3 px-8 py-4 bg-amber-500 text-black rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-400 transition-all hover:scale-105 active:scale-95 disabled:opacity-30 disabled:hover:scale-100 shadow-[0_10px_30px_rgba(245,158,11,0.2)] relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors" />
              <div className="relative flex items-center gap-3">
                <div className="p-1.5 bg-black/20 rounded-lg">
                  <Coins size={16} className="fill-black" />
                </div>
                <div className="flex flex-col leading-none">
                  <span className="text-[11px]">HAZIRLIK MACI TEKLIF ET</span>
                  <span className="text-[7px] opacity-60 font-bold">1 MG COIN - ANINDA MAC</span>
                </div>
              </div>
            </button>

            {/* Button 2: Siraya Gir */}
            <button 
              onClick={inQueue ? handleLeaveQueue : handleJoinQueue}
              disabled={loading || isMyTurn}
              className={`flex-1 lg:flex-none flex items-center gap-3 px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all relative overflow-hidden group ${
                inQueue 
                  ? 'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30' 
                  : 'bg-emerald-500 text-black hover:bg-emerald-400 hover:scale-105 active:scale-95 disabled:opacity-30 shadow-[0_10px_30px_rgba(16,185,129,0.2)]'
              }`}
            >
              <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors" />
              <div className="relative flex items-center gap-3">
                <div className={`p-1.5 rounded-lg ${inQueue ? 'bg-red-500/20' : 'bg-black/20'}`}>
                  {inQueue ? <RotateCcw size={16} /> : <UserCheck size={16} />}
                </div>
                <div className="flex flex-col leading-none">
                  <span className="text-[11px]">{inQueue ? 'SIRADAN CIK' : 'SIRAYA GIR'}</span>
                  <span className="text-[7px] opacity-60 font-bold">{inQueue ? 'BEKLEMEYI IPTAL ET' : 'UcretsIZ - 5 DAKIKA BEKLEME'}</span>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* ═══ TIMER BAR (When in queue) ═══ */}
      <AnimatePresence>
        {(inQueue || isMyTurn) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            {isMyTurn ? (
              /* ── YOUR TURN - Auto-starting ── */
              <div className="bg-emerald-500/10 border-2 border-emerald-500/40 rounded-[2rem] p-8 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-emerald-500/5 animate-pulse" />
                <div className="relative z-10 space-y-4">
                  <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-[0_0_40px_rgba(16,185,129,0.4)] animate-spin">
                    <Zap size={36} className="text-black fill-black" />
                  </div>
                  <h3 className="text-2xl font-black italic uppercase tracking-tighter text-emerald-300">MAC BASLATILIYOR...</h3>
                  <p className="text-sm text-white/50 max-w-md mx-auto">
                    Siraniz geldi, rakip olusturuluyor. Hazirlik maci otomatik baslayacak.
                  </p>
                </div>
              </div>
            ) : (
              /* ── WAITING IN QUEUE ── */
              <div className="bg-zinc-900/60 border border-white/10 rounded-[2rem] p-6 relative overflow-hidden">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-500/10 rounded-xl border border-amber-500/20">
                      <Timer size={16} className="text-amber-400" />
                    </div>
                    <div>
                      <h3 className="text-xs font-black uppercase tracking-widest text-white/40">SIRA BEKLİYOR</h3>
                      <p className="text-[8px] text-white/20 uppercase tracking-wider font-bold">5 DAKIKA ICINDE MAC YAPABILIRSINIZ</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-4xl font-black font-mono text-amber-400 tracking-wider">
                      {formatTime(timeLeft)}
                    </div>
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
                      SIRA LISTESI ({queue.length} TAKIM)
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
                          {entry.team_name || 'Bilinmeyen Takim'}
                          {entry.user_id === profile?.id && (
                            <span className="ml-2 text-[7px] font-black uppercase text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full">SIZ</span>
                          )}
                        </span>
                        {idx === 0 && (
                          <ChevronRight size={12} className="text-emerald-400 animate-pulse" />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ BOTTOM GRID ═══ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* History */}
        <div className="bg-zinc-900/40 border border-white/5 rounded-[2rem] overflow-hidden">
          <div className="p-5 border-b border-white/5 flex items-center gap-2">
            <Clock size={14} className="text-white/30" />
            <h3 className="text-xs font-black uppercase tracking-widest text-white/40">Gecmis Hazirlik Maclari</h3>
          </div>
          <div className="p-4 max-h-[280px] overflow-y-auto">
            {history.length === 0 ? (
              <div className="py-12 text-center opacity-20 italic text-sm">Henuz mac oynamadiniz.</div>
            ) : (
              <div className="space-y-2">
                {history.map((m) => (
                  <div key={m.id} className="bg-white/5 p-3 rounded-xl flex items-center justify-between border border-white/5">
                    <div className="text-[10px] font-black uppercase italic text-white/40">
                      {m.home_team_id === profile?.id ? 'EV' : 'DEP'}
                    </div>
                    <div className="flex items-center gap-3 bg-black/40 px-5 py-1.5 rounded-full border border-white/10 font-mono text-lg font-black">
                      <span className={m.home_score > m.away_score ? 'text-emerald-400' : 'text-white/60'}>{m.home_score}</span>
                      <span className="text-white/20 text-xs">-</span>
                      <span className={m.away_score > m.home_score ? 'text-emerald-400' : 'text-white/60'}>{m.away_score}</span>
                    </div>
                    <div className="text-[9px] text-white/30 font-bold">{new Date(m.played_at).toLocaleDateString('tr-TR')}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Info Card */}
        <div className="bg-zinc-900/40 border border-white/5 rounded-[2rem] p-8 flex flex-col items-center justify-center text-center space-y-5">
          <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center">
            <Shield size={28} className="text-emerald-500/50" />
          </div>
          <div>
            <h4 className="text-base font-black italic uppercase text-white/80">Nasil Calisir?</h4>
          </div>
          <div className="space-y-3 text-left w-full max-w-xs">
            <div className="flex items-start gap-3">
              <div className="p-1 bg-amber-500/10 rounded-lg mt-0.5"><Coins size={12} className="text-amber-400" /></div>
              <div>
                <p className="text-[10px] font-black text-white/60 uppercase">Teklif Et (1 MG)</p>
                <p className="text-[9px] text-white/30">Hemen guclu bir rakiple mac yapin. 2x antrenman puani kazanin.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-1 bg-emerald-500/10 rounded-lg mt-0.5"><UserCheck size={12} className="text-emerald-400" /></div>
              <div>
                <p className="text-[10px] font-black text-white/60 uppercase">Siraya Gir (Ucretsiz)</p>
                <p className="text-[9px] text-white/30">5 dakikalik kuyruk. Siranız gelince ucretsiz mac yapin.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-1 bg-red-500/10 rounded-lg mt-0.5"><Timer size={12} className="text-red-400" /></div>
              <div>
                <p className="text-[10px] font-black text-white/60 uppercase">5 Dakika Kurali</p>
                <p className="text-[9px] text-white/30">Sure bittiginde kabul listesi sifirlanir. Tekrar siraya girin.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
