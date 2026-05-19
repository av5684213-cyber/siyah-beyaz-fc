'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, ArrowUpCircle, ArrowDownCircle, MinusCircle, RefreshCw, Shield, ChevronRight, Users, Search, Bot } from 'lucide-react';
import PlayerDetailModal from './PlayerDetailModal';
import type { Player } from '@/lib/fm/types';
import { useFM } from '@/lib/fm/GameContext';
import { toTitleCase } from '@/lib/fm/ui-helpers';

// Takım ismini güvenli şekilde temizle - undefined/null metinlerini filtrele
function sanitizeTeamName(raw: unknown): string {
  if (raw === null || raw === undefined) return 'Bilinmiyor';
  if (typeof raw !== 'string') return 'Bilinmiyor';
  const cleaned = raw.trim();
  if (!cleaned || cleaned.toLowerCase() === 'undefined' || cleaned.toLowerCase() === 'null' || cleaned === 'NaN') return 'Bilinmiyor';
  if (cleaned.toLowerCase().includes('undefined') || cleaned.toLowerCase().includes('null')) return 'Bilinmiyor';
  return cleaned;
}

interface StandingRow {
  id: string;
  team_id: string;
  league_id: number;
  season: number;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goals_for: number;
  goals_against: number;
  goal_diff: number;
  points: number;
  teams?: { name: string; is_user_team: boolean; is_bot: boolean; avg_rating: number };
}

interface LeagueInfo {
  id: number;
  name: string;
  tier: number;
}

interface PlayerRowData extends Player {
  team_name?: string;
  technical?: number;
  mental?: number;
  physical?: number;
  gk_reflexes?: number;
}

interface FixtureData {
  id: string;
  home: { name: string };
  away: { name: string };
  home_score?: number;
  away_score?: number;
  status: string;
  match_time?: string;
  tur: number;
}

interface StandingsData {
  source: string;
  leagues: LeagueInfo[];
  standings: StandingRow[];
  error?: string;
}

const LEAGUE_COLORS: Record<number, { bg: string; border: string; text: string; accent: string }> = {
  1: { bg: 'bg-gradient-to-br from-amber-500/10 to-amber-900/5', border: 'border-amber-500/20', text: 'text-amber-400', accent: 'bg-amber-500' },
  2: { bg: 'bg-gradient-to-br from-sky-500/10 to-sky-900/5', border: 'border-sky-500/20', text: 'text-sky-400', accent: 'bg-sky-500' },
  3: { bg: 'bg-gradient-to-br from-emerald-500/10 to-emerald-900/5', border: 'border-emerald-500/20', text: 'text-emerald-400', accent: 'bg-emerald-500' },
  4: { bg: 'bg-gradient-to-br from-violet-500/10 to-violet-900/5', border: 'border-violet-500/20', text: 'text-violet-400', accent: 'bg-violet-500' },
};

const TIER_LABELS: Record<number, string> = {
  1: '1. KADEME',
  2: '2. KADEME',
  3: '3. KADEME',
  4: '4. KADEME',
};

export default function LeagueStandings({ isAdmin }: { isAdmin?: boolean }) {
  const { profile, squad, setSelectedTeamProfile, league: allPlayers = [] } = useFM();
  const [activeLeague, setActiveLeague] = useState<string | number>('');
  const [viewMode, setViewMode] = useState<'table' | 'players' | 'fixtures'>('table');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPos, setFilterPos] = useState('ALL');
  const [data, setData] = useState<StandingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [sortKey, setSortKey] = useState<string>('points');
  const [sortDir, setSortDir] = useState<string>('desc');

  // Lig listesini ayrı state'te tut — infinite loop'u önlemek için
  const [fetchedLeagues, setFetchedLeagues] = useState<LeagueInfo[]>([]);

  // effectiveActiveLeague: kullanıcı seçtiyse onu kullan, yoksa fetchedLeagues'den ilkini al
  const effectiveActiveLeague = useMemo(() => {
    if (activeLeague) return activeLeague;
    if (fetchedLeagues.length > 0) return fetchedLeagues[0].id;
    return '';
  }, [activeLeague, fetchedLeagues]);

  const filteredPlayers = useMemo(() => {
    return (allPlayers as Player[]).filter((p: Player) => {
       if (!p) return false;
       const playerName = p.name || '';
       const matchesSearch = playerName.toLowerCase().includes(searchTerm.toLowerCase());
       const matchesPos = filterPos === 'ALL' || p.position === filterPos;
       return matchesSearch && matchesPos;
    }).sort((a: Player, b: Player) => (b.rating || 0) - (a.rating || 0));
  }, [allPlayers, searchTerm, filterPos]);

  // Team players state removed as we use the context-based modal now
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);

  const handleTeamClick = (team: { id: string; name: string; team_id?: string }) => {
    setSelectedTeamProfile(team.name);
  };

  const handleSort = useCallback((key: string) => {
    if (sortKey === key) {
      setSortDir(prev => prev === 'desc' ? 'asc' : 'desc');
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  }, [sortKey]);

  const fetchStandings = useCallback(async (leagueId: number, showRefresh = false) => {
    if (showRefresh) setIsRefreshing(true);
    setLoading(true);
    try {
      const res = await fetch(`/api/league/standings?leagueId=${leagueId || ''}`);
      if (!res.ok) throw new Error('Network response was not ok');
      const json = await res.json();
      setData(json);
      // Lig listesini ayrı tut, böylece effect dependency'sinde data?.leagues kullanmayız
      if (json.leagues && json.leagues.length > 0) {
        setFetchedLeagues(prev => {
          // Sadece farklıysa güncelle (gereksiz re-render'ı önle)
          if (prev.length === json.leagues.length && prev.every((l, i) => l.id === json.leagues[i].id)) return prev;
          return json.leagues;
        });
      }
    } catch (err) {
      console.error('Standings fetch error:', err);
      // Fallback: fetchedLeagues boşsa varsayılan ligler ata
      setFetchedLeagues(prev => prev.length > 0 ? prev : [
        { id: 1, name: '1. Lig', tier: 1 },
        { id: 2, name: '2. Lig', tier: 2 },
        { id: 3, name: '3. Lig', tier: 3 },
        { id: 4, name: '4. Lig', tier: 4 },
      ]);
      setData(prev => prev || {
        source: 'error_fallback',
        leagues: [
            { id: 1, name: '1. Lig', tier: 1 },
            { id: 2, name: '2. Lig', tier: 2 },
            { id: 3, name: '3. Lig', tier: 3 },
            { id: 4, name: '4. Lig', tier: 4 },
        ],
        standings: []
      });
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // İlk yükleme: fetchedLeagues gelene kadar bekle, sonra aktif ligi getir
  const hasFetchedRef = React.useRef(false);
  useEffect(() => {
    if (hasFetchedRef.current) return; // zaten fetch yapıldı
    hasFetchedRef.current = true;
    fetchStandings(1); // varsayılan: 1. Lig
  }, [fetchStandings]);

  // activeLeague değiştiğinde o ligi getir
  useEffect(() => {
    if (activeLeague) {
      fetchStandings(Number(activeLeague));
    }
  }, [activeLeague, fetchStandings]);

  const leagues = useMemo(() => fetchedLeagues.length > 0 ? fetchedLeagues : (data?.leagues || [
    { id: 1, name: '1. Lig', tier: 1 },
    { id: 2, name: '2. Lig', tier: 2 },
    { id: 3, name: '3. Lig', tier: 3 },
    { id: 4, name: '4. Lig', tier: 4 },
  ]), [fetchedLeagues, data?.leagues]);

  // Group leagues by tier
  const tierMap = useMemo(() => {
    const map: Record<number, LeagueInfo[]> = {};
    leagues.forEach(l => {
      if (!map[l.tier]) map[l.tier] = [];
      map[l.tier].push(l);
    });
    return map;
  }, [leagues]);

  const activeTierLeagues = tierMap[leagues.find(l => String(l.id) === String(effectiveActiveLeague))?.tier || 1] || [];

  const standings = useMemo(() => data?.standings || [], [data?.standings]);

  const sortedStandings = useMemo(() => {
    if (!standings.length) return standings;
    const sorted = [...standings].sort((a, b) => {
      const aVal = (a as unknown as Record<string, unknown>)[sortKey] as number || 0;
      const bVal = (b as unknown as Record<string, unknown>)[sortKey] as number || 0;
      return sortDir === 'desc' ? bVal - aVal : aVal - bVal;
    });
    return sorted;
  }, [standings, sortKey, sortDir]);

  // Promotion zones: top 2 (direct) + 3-6 (playoff)
  // Relegation zone: bottom 3
  const getRowStyle = (idx: number, leagueId: number) => {
    const tier = leagues.find(l => l.id === leagueId)?.tier || 1;
    if (tier === 1) {
      // Super Lig: 1-2 Champions League, 3-6 Europa, 16-18 Relegation
      if (idx < 2) return 'border-l-2 border-l-emerald-500 bg-emerald-500/5';
      if (idx < 6) return 'border-l-2 border-l-sky-500 bg-sky-500/5';
      if (idx >= 15) return 'border-l-2 border-l-red-500 bg-red-500/5';
    } else {
      // Lower leagues: 1-2 Direct promotion, 3-6 Playoff, 16-18 Relegation
      if (idx < 2) return 'border-l-2 border-l-emerald-500 bg-emerald-500/5';
      if (idx < 6) return 'border-l-2 border-l-amber-500 bg-amber-500/5';
      if (idx >= 15) return 'border-l-2 border-l-red-500 bg-red-500/5';
    }
    return 'border-l-2 border-l-transparent';
  };

  const getZoneIcon = (idx: number, leagueId: number) => {
    const tier = leagues.find(l => l.id === leagueId)?.tier || 1;
    if (tier === 1) {
      if (idx < 2) return <ArrowUpCircle size={14} className="text-emerald-500" />;
      if (idx < 6) return <ChevronRight size={14} className="text-sky-400" />;
      if (idx >= 15) return <ArrowDownCircle size={14} className="text-red-500" />;
    } else {
      if (idx < 2) return <ArrowUpCircle size={14} className="text-emerald-500" />;
      if (idx < 6) return <MinusCircle size={14} className="text-amber-400" />;
      if (idx >= 15) return <ArrowDownCircle size={14} className="text-red-500" />;
    }
    return null;
  };

  const currentLeague = leagues.find(l => String(l.id) === String(effectiveActiveLeague));
  const colors = LEAGUE_COLORS[currentLeague?.tier || 1] || LEAGUE_COLORS[1];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-display font-black italic uppercase tracking-tighter text-white">Lig Merkezi</h2>
          <p className="text-[10px] text-white/30 uppercase tracking-[0.3em] font-black mt-1">
            {activeTierLeagues.length > 1 ? `${activeTierLeagues.length} GRUP • ` : ''} 1000+ OYUNCU • SEZON 1
          </p>
        </div>
        <div className="flex gap-2">
            <button 
                onClick={() => setViewMode('table')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${viewMode === 'table' ? 'bg-white text-black border-white' : 'bg-white/5 border-white/10 text-white/40'}`}
            >
                <Trophy size={14} /> PUAN DURUMU
            </button>
            <button 
                onClick={() => setViewMode('fixtures')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${viewMode === 'fixtures' ? 'bg-white text-black border-white' : 'bg-white/5 border-white/10 text-white/40'}`}
            >
                <RefreshCw size={14} /> MAÇLAR
            </button>
            <button 
                onClick={() => setViewMode('players')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${viewMode === 'players' ? 'bg-white text-black border-white' : 'bg-white/5 border-white/10 text-white/40'}`}
            >
                <Users size={14} /> OYUNCU SIRALAMASI
            </button>
        </div>
      </div>

      {viewMode === 'fixtures' && (
        <FixturesList leagueId={effectiveActiveLeague} />
      )}

      {viewMode === 'players' && (
        <div className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between p-4 bg-zinc-900 border border-white/5 rounded-2xl">
                <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" size={14} />
                    <input 
                        type="text" 
                        placeholder="OYUNCU ARA..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-[10px] font-black uppercase tracking-widest text-white placeholder:text-white/10 focus:border-red-500/50 outline-none transition-all"
                    />
                </div>
                <div className="flex gap-2 overflow-x-auto pb-1 w-full md:w-auto">
                    {['ALL', 'GK', 'DEF', 'MID', 'FWD'].map(pos => (
                        <button
                            key={pos}
                            onClick={() => setFilterPos(pos)}
                            className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${filterPos === pos ? 'bg-red-600 text-white' : 'bg-white/5 text-white/30 hover:bg-white/10'}`}
                        >
                            {pos}
                        </button>
                    ))}
                </div>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-white/5">
                <table className="w-full text-left border-collapse bg-zinc-900/40">
                    <thead>
                        <tr className="bg-zinc-900/80 border-b border-white/10">
                            <th className="p-4 text-[9px] font-black uppercase text-white/30 truncate">OYUNCU</th>
                            <th className="p-4 text-[9px] font-black uppercase text-white/30 text-center">TAKIM</th>
                            <th className="p-4 text-[9px] font-black uppercase text-white/30 text-center">Klt</th>
                            <th className="p-4 text-[9px] font-black uppercase text-white/30 text-center">Klc</th>
                            <th className="p-4 text-[9px] font-black uppercase text-white/30 text-center">Tk</th>
                            <th className="p-4 text-[9px] font-black uppercase text-white/30 text-center">Pas</th>
                            <th className="p-4 text-[9px] font-black uppercase text-white/30 text-center">Şut</th>
                            <th className="p-4 text-[9px] font-black uppercase text-white/30 text-center">Kfa</th>
                            <th className="p-4 text-[9px] font-black uppercase text-white/30 text-center">Hız</th>
                            <th className="p-4 text-[9px] font-black uppercase text-white/30 text-center">Güç</th>
                            <th className="p-4 text-[9px] font-black uppercase text-white/30 text-center">Alg</th>
                            <th className="p-4 text-[9px] font-black uppercase text-white/30 text-center">Top</th>
                            <th className="p-4 text-[9px] font-black uppercase text-white/30 text-center">Tplm</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredPlayers.slice(0, 50).map((p: PlayerRowData) => {
                             const total = ((p.rating || 0) + (p.passing || 0) + (p.shooting || 0) + (p.heading || 0) + (p.speed || 0) + (p.physical || 0) + (p.mental || 0) + (p.technical || 0));
                             return (
                                <tr 
                                    key={p.id} 
                                    onClick={() => setSelectedPlayer(p)}
                                    className="border-b border-white/5 hover:bg-white/5 cursor-pointer transition-all"
                                >
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded bg-black/40 flex items-center justify-center text-[10px] font-black text-red-500 border border-white/10 shrink-0">
                                                {p.position?.slice(0, 2) || '??'}
                                            </div>
                                            <span className="text-xs font-black uppercase italic text-white truncate">{p.name}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-center">
                                        <span className="text-[10px] font-black uppercase text-white/40 tracking-wider">{p.team_name || p.club || 'SERBEST'}</span>
                                    </td>
                                    <td className="p-4 text-center text-xs font-mono font-bold text-white">{p.rating}</td>
                                    <td className="p-4 text-center text-xs font-mono font-bold text-white/40">{p.position === 'GK' ? (p.gk_reflexes || p.goalkeeping || 70) : '-'}</td>
                                    <td className="p-4 text-center text-xs font-mono font-bold text-white/60">{p.technical || 70}</td>
                                    <td className="p-4 text-center text-xs font-mono font-bold text-white/60">{p.passing || 70}</td>
                                    <td className="p-4 text-center text-xs font-mono font-bold text-white/60">{p.shooting || 70}</td>
                                    <td className="p-4 text-center text-xs font-mono font-bold text-white/60">{p.heading || 70}</td>
                                    <td className="p-4 text-center text-xs font-mono font-bold text-white/60">{p.speed || 70}</td>
                                    <td className="p-4 text-center text-xs font-mono font-bold text-white/60">{p.physical || 70}</td>
                                    <td className="p-4 text-center text-xs font-mono font-bold text-white/60">{p.mental || 70}</td>
                                    <td className="p-4 text-center text-xs font-mono font-bold text-white/60">{p.technical || 70}</td>
                                    <td className="p-4 text-center text-xs font-mono font-bold text-red-500">{Math.round(total)}</td>
                                </tr>
                             );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
      )}

      {viewMode === 'table' && (
        <>

      {/* League Tabs */}
      <div className="flex flex-col gap-4">
        {/* Tier Tabs */}
        <div className="grid grid-cols-4 gap-2">
            {[1, 2, 3, 4].map((tier) => {
                const tierLeagues = tierMap[tier] || [];
                const isActiveTier = tierLeagues.some(l => String(l.id) === String(effectiveActiveLeague));
                const lc = LEAGUE_COLORS[tier] || LEAGUE_COLORS[1];
                
                return (
                    <button
                        key={tier}
                        onClick={() => {
                            if (tierLeagues.length > 0) setActiveLeague(tierLeagues[0].id);
                        }}
                        className={`relative p-3 rounded-xl border transition-all duration-200 ${isActiveTier
                            ? `${lc.bg} ${lc.border} scale-[1.02]`
                            : 'bg-zinc-900/40 border-white/5 hover:border-white/10 hover:bg-zinc-900/60'
                        }`}
                    >
                        <div className="flex items-center gap-2 mb-1">
                            {isActiveTier && <div className={`w-1.5 h-1.5 rounded-full ${lc.accent}`} />}
                            <span className="text-[8px] uppercase font-black tracking-widest text-white/30">
                                {TIER_LABELS[tier]}
                            </span>
                        </div>
                        <p className={`text-xs font-black uppercase tracking-wider ${isActiveTier ? lc.text : 'text-white/50'}`}>
                            {tier}. KADEME
                        </p>
                    </button>
                );
            })}
        </div>

        {/* Group Selector (if multiple groups exist for active tier) */}
        {activeTierLeagues.length > 1 && (
            <div className="flex flex-col gap-2 p-4 bg-black/40 rounded-2xl border border-white/5 shadow-2xl">
                <div className="flex items-center justify-between border-b border-white/5 mb-2 pb-2">
                   <div className="flex items-center gap-2">
                     <span className="text-[10px] font-black uppercase tracking-widest text-white/40">AKTİF BÖLÜMLER</span>
                     <span className="px-1.5 py-0.5 rounded-md bg-white/10 text-[9px] font-black text-white/60">{activeTierLeagues.length} GRUP</span>
                   </div>
                   {currentLeague?.tier === 4 && (
                     <span className="text-[9px] font-bold text-violet-400 animate-pulse">YENI DEPARTMANLAR AKTIF</span>
                   )}
                </div>
                
                <div className={`grid ${activeTierLeagues.length > 6 ? 'grid-cols-2 md:grid-cols-4 lg:grid-cols-6' : 'flex flex-wrap'} gap-2 overflow-x-auto no-scrollbar`}>
                    {activeTierLeagues.map(l => (
                        <button
                            key={l.id}
                            onClick={() => setActiveLeague(l.id)}
                            className={`px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all flex flex-col items-center gap-1 border ${
                              String(activeLeague) === String(l.id) 
                                ? 'bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.2)]' 
                                : 'text-white/40 border-white/5 hover:text-white hover:bg-white/5'
                            }`}
                        >
                            <span className="text-[8px] opacity-40">GRUP</span>
                            {l.name.replace('4. Lig ', '').replace('Bölüm ', '') || l.name}
                        </button>
                    ))}
                </div>
            </div>
        )}
      </div>

      {/* Zone Legend */}
      <div className="flex flex-wrap gap-4 px-2">
        <div className="flex items-center gap-1.5 text-[8px] uppercase font-bold tracking-widest text-white/30">
          <div className="w-3 h-0.5 bg-emerald-500 rounded" />
          {currentLeague?.tier === 1 ? 'Şampiyonluk' : 'Doğrudan Çıkma'}
        </div>
        <div className="flex items-center gap-1.5 text-[8px] uppercase font-bold tracking-widest text-white/30">
          <div className={`w-3 h-0.5 ${currentLeague?.tier === 1 ? 'bg-sky-500' : 'bg-amber-500'} rounded`} />
          {currentLeague?.tier === 1 ? 'Avrupa' : 'Play-off'}
        </div>
        <div className="flex items-center gap-1.5 text-[8px] uppercase font-bold tracking-widest text-white/30">
          <div className="w-3 h-0.5 bg-red-500 rounded" />
          Düşme
        </div>
      </div>

      {/* Standings Table */}
      <div className={`rounded-2xl border ${colors.border} overflow-hidden`}>
        {/* Table Header */}
        <div className={`${colors.bg} px-4 py-3 border-b ${colors.border}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg ${colors.accent} flex items-center justify-center`}>
                <Trophy size={14} className="text-white" />
              </div>
              <div>
                <p className={`text-sm font-black uppercase tracking-wider ${colors.text}`}>
                  {currentLeague?.name || '1. Lig'}
                </p>
                <p className="text-[8px] text-white/20 uppercase tracking-widest font-bold">Hafta 1 / 34</p>
              </div>
            </div>
            {data?.source === 'fallback' && (
              <span className="text-[8px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase font-black tracking-widest">
                Offline
              </span>
            )}
          </div>
        </div>

        {/* Column Headers */}
        <div className="grid grid-cols-[2rem_1fr_repeat(8,_3.5rem)] items-center px-4 py-2.5 border-b border-white/5 bg-zinc-900/50">
          <span className="text-[8px] font-black uppercase tracking-widest text-white/20 text-center">#</span>
          <span className="text-[8px] font-black uppercase tracking-widest text-white/20">Takım</span>
          {[{ l: 'O', k: 'played' }, { l: 'G', k: 'won' }, { l: 'B', k: 'drawn' }, { l: 'M', k: 'lost' }, { l: 'AG', k: 'goals_for' }, { l: 'YG', k: 'goals_against' }, { l: 'AV', k: 'goal_diff' }, { l: 'P', k: 'points' }].map(h => (
            <span
              key={h.k}
              onClick={() => handleSort(h.k)}
              className={`text-[8px] font-black uppercase tracking-widest text-center cursor-pointer hover:text-white transition-colors ${sortKey === h.k ? 'text-white' : 'text-white/20'}`}
            >
              {h.l}{sortKey === h.k && (sortDir === 'desc' ? ' ↓' : ' ↑')}
            </span>
          ))}
        </div>

        {/* Loading State */}
        {loading && standings.length === 0 && (
          <div className="flex items-center justify-center py-20">
            <RefreshCw size={20} className="text-white/20 animate-spin" />
          </div>
        )}

        {/* Rows */}
        {sortedStandings.map((row, idx) => {
          const teamName = sanitizeTeamName(row.teams?.name);
          const teamId = row.team_id;
          const isUser = row.teams?.is_user_team || 
                        (profile && (teamName === profile.team_name || teamId === profile.id || teamId === profile.team_id)) ||
                        (teamId === 'Siyahbeyazfc_001');
          const isBot = row.teams?.is_bot || false;
          const zoneIcon = getZoneIcon(idx, effectiveActiveLeague);
          
          // Safety defaults for goals/points
          const played = row.played || 0;
          const won = row.won || 0;
          const drawn = row.drawn || 0;
          const lost = row.lost || 0;
          const gf = row.gf || row.goals_for || 0;
          const ga = row.ga || row.goals_against || 0;
          const gd = row.gd || (gf - ga);
          const points = row.points || (won * 3 + drawn);

          return (
            <div
              key={row.team_id || row.id}
              onClick={() => handleTeamClick({ id: row.team_id, name: teamName })}
              className={`grid grid-cols-[2rem_1fr_repeat(8,_3.5rem)] items-center px-4 py-2.5 border-b border-white/[0.03] hover:bg-white/5 transition-colors group cursor-pointer ${getRowStyle(idx, effectiveActiveLeague)} ${isUser ? 'bg-white/[0.07] hover:bg-white/[0.1]' : ''}`}
            >
              <div className="flex items-center justify-center gap-1">
                {zoneIcon}
                <span className={`text-xs font-bold font-mono ${isUser ? 'text-white' : 'text-white/40'}`}>
                  {idx + 1}
                </span>
              </div>
              <div className="flex items-center gap-2 min-w-0">
                {isUser ? (
                  <Shield size={12} className="text-white shrink-0" />
                ) : isBot ? (
                  <Bot size={12} className="text-cyan-400/60 shrink-0" />
                ) : (
                  <Bot size={12} className="text-white/20 shrink-0" />
                )}
                <span className={`text-xs font-bold tracking-wider truncate ${isUser ? 'text-white' : 'text-white/60 group-hover:text-white'}`}>
                  {toTitleCase(teamName) || teamName || 'Bilinmiyor'}
                </span>
                {isBot && !isUser && (
                  <span className="text-[9px] text-cyan-400/50 font-mono">BOT</span>
                )}
              </div>
              <span className="text-xs font-mono text-white/30 text-center">{played}</span>
              <span className="text-xs font-mono text-white/30 text-center">{won}</span>
              <span className="text-xs font-mono text-white/30 text-center">{drawn}</span>
              <span className="text-xs font-mono text-white/30 text-center">{lost}</span>
              <span className="text-xs font-mono text-white/30 text-center">{gf}</span>
              <span className="text-xs font-mono text-white/30 text-center">{ga}</span>
              <span className={`text-xs font-mono text-center ${gd > 0 ? 'text-green-400' : gd < 0 ? 'text-red-400' : 'text-white/30'}`}>{gd > 0 ? '+' : ''}{gd}</span>
              <span className={`text-xs font-black font-mono text-center ${isUser ? 'text-white' : 'text-white/70'}`}>
                {points}
              </span>
            </div>
          );
        })}

        {/* Empty State */}
        {!loading && standings.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-white/20">
            <Trophy size={32} className="mb-3 opacity-20" />
            <p className="text-xs uppercase tracking-widest font-bold">Henüz puan durumu yok</p>
            <p className="text-[10px] mt-1 text-white/10">Maçlar başladığında standings güncellenecek</p>
          </div>
        )}
      </div>
      </>)}

      {/* Nested Player Detail Modal */}
      <AnimatePresence>
        {selectedPlayer && (
          <PlayerDetailModal
            player={selectedPlayer}
            onClose={() => setSelectedPlayer(null)}
            teamStats={{}}
            isAdmin={isAdmin}
            profileId={profile?.id}
            profileTeamName={profile?.team_name}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function FixturesList({ leagueId }: { leagueId: number }) {
  const [fixtures, setFixtures] = useState<FixtureData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFixtures = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/league/fixtures?leagueId=${leagueId}`);
        const data = await res.json();
        setFixtures(data.fixtures || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchFixtures();
  }, [leagueId]);

  if (loading) return <div className="py-20 flex justify-center"><RefreshCw className="animate-spin text-white/20" /></div>;

  return (
    <div className="space-y-4">
      {fixtures.length === 0 ? (
        <div className="py-20 text-center text-white/20">Henüz maç kaydı bulunamadı.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {fixtures.map((f: FixtureData) => (
            <div key={f.id} className="bg-zinc-900/40 border border-white/5 rounded-2xl p-4 flex items-center justify-between group hover:border-white/10 transition-all">
              <div className="flex-1 text-right pr-4">
                <p className="text-xs font-black uppercase italic text-white truncate">{f.home?.name || 'Bilinmiyor'}</p>
              </div>
              <div className="flex flex-col items-center gap-1 w-24">
                <div className="px-3 py-1 bg-black/60 rounded-lg text-sm font-black italic border border-white/10">
                   {f.status === 'finished' ? `${f.home_score} - ${f.away_score}` : f.match_time}
                </div>
                <span className="text-[8px] font-bold text-white/20 uppercase tracking-widest">{f.tur}. Hafta</span>
              </div>
              <div className="flex-1 text-left pl-4">
                <p className="text-xs font-black uppercase italic text-white truncate">{f.away?.name || 'Bilinmiyor'}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
