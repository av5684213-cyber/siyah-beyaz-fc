'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Users, Search, Filter, ArrowLeft } from 'lucide-react';
import { isSupabaseConfigured, getSupabase } from '@/lib/supabase';
import { toTitleCase, formatPosBadge, getPosBadgeStyle, getPosGroup } from '@/lib/fm/ui-helpers';
import Link from 'next/link';

interface FreeAgent {
  id: string;
  name: string;
  position: string;
  specific_position: string;
  secondary_positions: string[];
  rating: number;
  potential: number;
  age: number;
  klt: number;
  market_value: number;
  preferred_foot: string;
  speed: number;
  power: number;
  passing: number;
  shooting: number;
  defending: number;
  vision: number;
  control: number;
  heading: number;
  goalkeeping: number;
  nation: string;
  salary: number;
}

export default function FreeAgentsPage() {
  const [players, setPlayers] = useState<FreeAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [posFilter, setPosFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState<'rating' | 'age' | 'value'>('rating');

  useEffect(() => {
    fetchFreeAgents();
  }, []);

  const fetchFreeAgents = async () => {
    if (!isSupabaseConfigured()) return;
    const supabase = getSupabase();
    if (!supabase) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .is('profile_id', null)
        .eq('is_for_sale', false)
        .order('rating', { ascending: false })
        .limit(200);

      if (error) {
        console.error('Free agents fetch error:', error.message);
      } else {
        setPlayers(data || []);
      }
    } catch (err) {
      console.error('Free agents error:', err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = players.filter(p => {
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (posFilter !== 'ALL') {
      const group = getPosGroup(p.specific_position || p.position);
      if (group !== posFilter) return false;
    }
    return true;
  }).sort((a, b) => {
    if (sortBy === 'rating') return b.rating - a.rating;
    if (sortBy === 'age') return a.age - b.age;
    return (b.market_value || 0) - (a.market_value || 0);
  });

  const formatCurrency = (val: number) => {
    if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(1)}M`;
    if (val >= 1_000) return `${(val / 1_000).toFixed(0)}K`;
    return val.toString();
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="p-2 bg-white/5 rounded-xl hover:bg-white/10 transition-all">
              <ArrowLeft size={18} />
            </Link>
            <div>
              <h1 className="text-2xl font-black italic uppercase tracking-tighter">Serbest Oyuncular</h1>
              <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Kadro dışı oyuncular — transfer pazarından kadroya katın</p>
            </div>
          </div>
          <div className="text-[10px] font-black text-white/30 uppercase tracking-widest">
            {filtered.length} OYUNCU
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 bg-zinc-900/50 p-4 rounded-2xl border border-white/5">
          <div className="flex-1 min-w-[200px]">
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
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-[11px] font-bold focus:outline-none"
          >
            <option value="rating">KALİTE</option>
            <option value="age">YAŞ (GENÇ)</option>
            <option value="value">DEĞER</option>
          </select>
        </div>

        {/* Player List */}
        {loading ? (
          <div className="py-20 text-center space-y-4">
            <div className="animate-spin w-8 h-8 border-2 border-white/20 border-t-white rounded-full mx-auto" />
            <p className="text-xs font-black uppercase tracking-widest text-white/40">Yükleniyor...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center space-y-4 opacity-50">
            <Users size={48} className="mx-auto" />
            <p className="text-xs font-black uppercase tracking-widest">Serbest oyuncu bulunamadı.</p>
          </div>
        ) : (
          <div className="bg-zinc-900/40 border border-white/5 rounded-[2rem] overflow-hidden">
            <div className="divide-y divide-white/5">
              {filtered.map((player, idx) => {
                const posBadge = formatPosBadge({
                  specificPosition: player.specific_position,
                  position: player.position,
                  secondaryPositions: player.secondary_positions,
                });
                const posStyle = getPosBadgeStyle(player.specific_position || player.position);

                return (
                  <motion.div
                    key={player.id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.01 }}
                    className="flex items-center gap-4 p-4 hover:bg-white/5 transition-colors"
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-[9px] font-black border ${posStyle}`}>
                      {posBadge}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-black italic tracking-tighter truncate">
                        {toTitleCase(player.name)}
                      </div>
                      <div className="text-[9px] text-white/30 font-bold">
                        {player.age} YAŞ • {player.nation || 'TR'} • {player.preferred_foot || 'Sağ'}
                      </div>
                    </div>
                    <div className="text-center px-3">
                      <div className="text-lg font-black text-emerald-400">{player.klt || player.rating}</div>
                      <div className="text-[7px] text-white/20 font-bold uppercase">Klt</div>
                    </div>
                    <div className="text-center px-3">
                      <div className="text-sm font-black text-white/60">{player.rating}</div>
                      <div className="text-[7px] text-white/20 font-bold uppercase">Ort</div>
                    </div>
                    <div className="text-right px-3">
                      <div className="text-[11px] font-black font-mono text-emerald-500/80">
                        {formatCurrency(player.market_value || 0)}
                      </div>
                      <div className="text-[7px] text-white/20 font-bold uppercase">Değer</div>
                    </div>
                    <div className="text-right px-2">
                      <div className="text-[11px] font-black font-mono text-white/40">
                        {formatCurrency(player.salary || 0)}/ay
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        <div className="text-center text-[10px] text-white/20 font-bold uppercase tracking-widest py-4">
          Transfer pazarından serbest oyuncuları kadronuza katabilirsiniz
        </div>
      </div>
    </div>
  );
}
