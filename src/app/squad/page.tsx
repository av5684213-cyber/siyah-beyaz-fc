'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Users, Search, TrendingUp, Heart, Shield } from 'lucide-react';
import { useFM } from '@/lib/fm/GameContext';
import { formatPosBadge, getPosBadgeStyle, toTitleCase, getPosGroup } from '@/lib/fm/ui-helpers';
import Link from 'next/link';

const POSITION_ORDER: Record<string, number> = { GK: 0, DEF: 1, MID: 2, FWD: 3 };

function formatCurrency(val: number) {
  if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(1)}M`;
  if (val >= 1_000) return `${(val / 1_000).toFixed(0)}K`;
  return val.toString();
}

function condColor(val: number) {
  if (val >= 80) return 'bg-emerald-500';
  if (val >= 60) return 'bg-yellow-400';
  if (val >= 40) return 'bg-orange-500';
  return 'bg-red-500';
}

function condTextColor(val: number) {
  if (val >= 80) return 'text-emerald-400';
  if (val >= 60) return 'text-yellow-400';
  if (val >= 40) return 'text-orange-400';
  return 'text-red-400';
}

export default function SquadPage() {
  const { squad, profile, userId } = useFM();
  const [search, setSearch] = useState('');
  const [posFilter, setPosFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState<'position' | 'rating' | 'age' | 'value' | 'condition'>('position');

  const filtered = useMemo(() => {
    let list = squad.filter(p => {
      if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (posFilter !== 'ALL') {
        const group = getPosGroup(p.specificPosition || p.position);
        if (group !== posFilter) return false;
      }
      return true;
    });

    list.sort((a, b) => {
      if (sortBy === 'position') {
        const ga = POSITION_ORDER[getPosGroup(a.specificPosition || a.position)] ?? 99;
        const gb = POSITION_ORDER[getPosGroup(b.specificPosition || b.position)] ?? 99;
        if (ga !== gb) return ga - gb;
        return b.rating - a.rating;
      }
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'age') return a.age - b.age;
      if (sortBy === 'value') return (b.market_value || 0) - (a.market_value || 0);
      if (sortBy === 'condition') return (b.cond || 0) - (a.cond || 0);
      return 0;
    });

    return list;
  }, [squad, search, posFilter, sortBy]);

  // Team stats
  const avgRating = squad.length > 0 ? (squad.reduce((s, p) => s + (p.rating || 0), 0) / squad.length).toFixed(1) : '0';
  const avgCond = squad.length > 0 ? Math.round(squad.reduce((s, p) => s + (p.cond || 0), 0) / squad.length) : 0;
  const totalValue = squad.reduce((s, p) => s + (p.market_value || 0), 0);

  // Position counts
  const posCounts = useMemo(() => {
    const counts: Record<string, number> = { GK: 0, DEF: 0, MID: 0, FWD: 0 };
    squad.forEach(p => {
      const group = getPosGroup(p.specificPosition || p.position);
      if (counts[group] !== undefined) counts[group]++;
      else counts[group] = (counts[group] || 0) + 1;
    });
    return counts;
  }, [squad]);

  // Group players by position for section headers
  const grouped = useMemo(() => {
    const groups: { key: string; label: string; players: typeof filtered }[] = [];
    const map = new Map<string, typeof filtered>();
    filtered.forEach(p => {
      const group = getPosGroup(p.specificPosition || p.position);
      if (!map.has(group)) map.set(group, []);
      map.get(group)!.push(p);
    });
    const order = ['GK', 'DEF', 'MID', 'FWD'];
    const labels: Record<string, string> = { GK: 'Kaleciler', DEF: 'Defans', MID: 'Orta Saha', FWD: 'Forvet' };
    order.forEach(key => {
      const players = map.get(key);
      if (players && players.length > 0) {
        groups.push({ key, label: labels[key] || key, players });
      }
    });
    return groups;
  }, [filtered]);

  // Current group label helper for section divider
  const posSectionColors: Record<string, string> = {
    GK: 'text-[#7AB4E8]',
    DEF: 'text-[#7EDBC8]',
    MID: 'text-[#F0C87A]',
    FWD: 'text-[#E87878]',
  };

  return (
    <div className="min-h-screen bg-black text-white p-4 sm:p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="p-2 bg-white/5 rounded-xl hover:bg-white/10 transition-all">
              <ArrowLeft size={18} />
            </Link>
            <div>
              <h1 className="text-2xl font-black italic uppercase tracking-tighter">Kadro</h1>
              <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
                {profile?.team_name || 'Takım'} — {squad.length} oyuncu
              </p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-4">
            <div className="text-[10px] font-black text-white/30 uppercase tracking-widest">
              {filtered.length} GÖSTERİLİYOR
            </div>
          </div>
        </div>

        {/* Team Stats Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.0 }}
            className="bg-zinc-900/50 border border-white/5 rounded-2xl p-4 text-center"
          >
            <Users size={16} className="mx-auto text-white/30 mb-2" />
            <div className="text-2xl font-black">{squad.length}</div>
            <div className="text-[9px] text-white/30 font-bold uppercase tracking-widest">Oyuncu</div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="bg-zinc-900/50 border border-white/5 rounded-2xl p-4 text-center"
          >
            <TrendingUp size={16} className="mx-auto text-emerald-400/50 mb-2" />
            <div className="text-2xl font-black text-emerald-400">{avgRating}</div>
            <div className="text-[9px] text-white/30 font-bold uppercase tracking-widest">Ort. Kalite</div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-zinc-900/50 border border-white/5 rounded-2xl p-4 text-center"
          >
            <Heart size={16} className={`mx-auto mb-2 ${condTextColor(avgCond)}`} />
            <div className={`text-2xl font-black ${condTextColor(avgCond)}`}>{avgCond}%</div>
            <div className="text-[9px] text-white/30 font-bold uppercase tracking-widest">Ort. Kondisyon</div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-zinc-900/50 border border-white/5 rounded-2xl p-4 text-center"
          >
            <Shield size={16} className="mx-auto text-amber-400/50 mb-2" />
            <div className="text-lg font-black text-amber-400 font-mono">{formatCurrency(totalValue)} €</div>
            <div className="text-[9px] text-white/30 font-bold uppercase tracking-widest">Toplam Değer</div>
          </motion.div>
        </div>

        {/* Position Count Badges */}
        <div className="flex items-center gap-2 flex-wrap">
          {Object.entries(posCounts).map(([pos, count]) => (
            <div key={pos} className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-wider ${getPosBadgeStyle(pos)}`}>
              <span>{pos}</span>
              <span className="text-white/40">•</span>
              <span>{count}</span>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 sm:gap-3 bg-zinc-900/50 p-3 sm:p-4 rounded-2xl border border-white/5">
          <div className="flex-1 min-w-[140px] sm:min-w-[200px]">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Oyuncu ara..."
                className="w-full bg-black/50 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-[11px] font-bold focus:outline-none focus:border-white/30"
              />
            </div>
          </div>
          <select
            value={posFilter}
            onChange={(e) => setPosFilter(e.target.value)}
            className="bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-[11px] font-bold focus:outline-none"
          >
            <option value="ALL">HEPSİ</option>
            <option value="GK">KALECİ</option>
            <option value="DEF">DEFANS</option>
            <option value="MID">ORTA SAHA</option>
            <option value="FWD">FORVET</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'position' | 'rating' | 'age' | 'value' | 'condition')}
            className="bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-[11px] font-bold focus:outline-none"
          >
            <option value="position">MEVKİ</option>
            <option value="rating">KALİTE</option>
            <option value="age">YAŞ (GENÇ)</option>
            <option value="value">DEĞER</option>
            <option value="condition">KONDİSYON</option>
          </select>
        </div>

        {/* Player List */}
        {squad.length === 0 ? (
          <div className="py-20 text-center space-y-4 opacity-50">
            <Users size={48} className="mx-auto" />
            <p className="text-xs font-black uppercase tracking-widest">Kadronuzda oyuncu bulunmuyor.</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center space-y-4 opacity-50">
            <Search size={48} className="mx-auto" />
            <p className="text-xs font-black uppercase tracking-widest">Aramanızla eşleşen oyuncu bulunamadı.</p>
          </div>
        ) : (
          <div className="bg-zinc-900/40 border border-white/5 rounded-[2rem] overflow-hidden">
            {grouped.map((group, gIdx) => (
              <div key={group.key}>
                {/* Section header */}
                <div className={`flex items-center gap-3 px-4 py-2.5 bg-white/[0.02] border-b border-white/5 ${gIdx > 0 ? 'border-t border-white/5' : ''}`}>
                  <div className={`text-[10px] font-black uppercase tracking-widest ${posSectionColors[group.key] || 'text-white/50'}`}>
                    {group.label}
                  </div>
                  <div className="text-[9px] font-bold text-white/20 uppercase">
                    {group.players.length} OYUNCU
                  </div>
                </div>
                {/* Player rows */}
                <div className="divide-y divide-white/5">
                  {group.players.map((player, idx) => {
                    const posBadge = formatPosBadge({
                      specificPosition: player.specificPosition,
                      position: player.position,
                      secondaryPositions: player.secondaryPositions,
                    });
                    const posStyle = getPosBadgeStyle(player.specificPosition || player.position);
                    const cond = player.cond ?? 100;
                    const isInjured = player.is_injured || (player.injury && player.injury.remaining_days > 0);
                    const isSuspended = !!player.suspended_until;
                    const globalIdx = gIdx * 100 + idx;

                    return (
                      <motion.div
                        key={player.id}
                        initial={{ opacity: 0, x: -5 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: globalIdx * 0.015 }}
                      >
                        <Link
                          href={`/player/${player.id}`}
                          className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 hover:bg-white/5 transition-colors"
                        >
                          {/* Position Badge */}
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-[9px] font-black border shrink-0 ${posStyle}`}>
                            {posBadge}
                          </div>

                          {/* Name & Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-[13px] font-black italic tracking-tighter truncate">
                                {toTitleCase(player.name)}
                              </span>
                              {isInjured && (
                                <span className="text-[8px] font-bold bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded-md uppercase">Sakat</span>
                              )}
                              {isSuspended && (
                                <span className="text-[8px] font-bold bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded-md uppercase">Cezalı</span>
                              )}
                            </div>
                            <div className="text-[9px] text-white/30 font-bold">
                              {player.age} YAŞ • {player.nation || 'TR'}
                            </div>
                          </div>

                          {/* Rating (Klt) */}
                          <div className="text-center px-2 sm:px-3 shrink-0">
                            <div className="text-lg font-black text-emerald-400">{player.rating}</div>
                            <div className="text-[7px] text-white/20 font-bold uppercase">Klt</div>
                          </div>

                          {/* Condition Bar */}
                          <div className="hidden sm:block w-20 shrink-0">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[8px] text-white/30 font-bold">Kond.</span>
                              <span className={`text-[9px] font-black ${condTextColor(cond)}`}>{cond}%</span>
                            </div>
                            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${condColor(cond)} transition-all`}
                                style={{ width: `${cond}%` }}
                              />
                            </div>
                          </div>

                          {/* Market Value */}
                          <div className="text-right px-2 sm:px-3 shrink-0">
                            <div className="text-[11px] font-black font-mono text-amber-500/80">
                              {formatCurrency(player.market_value || 0)} €
                            </div>
                            <div className="text-[7px] text-white/20 font-bold uppercase">Değer</div>
                          </div>
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="text-center text-[10px] text-white/20 font-bold uppercase tracking-widest py-4">
          Kadro listeniz — oyuncu detaylarına gitmek için tıklayın
        </div>
      </div>
    </div>
  );
}
