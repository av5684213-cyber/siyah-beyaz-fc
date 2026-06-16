'use client';
import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Trophy, Clock, TrendingUp } from 'lucide-react';

interface LeaderboardEntry {
  id: string;
  team_name: string;
  manager_name: string;
  reputation: number;
  seasons_played: number;
  league_tier: number;
  primary_color: string;
}

const TIER_NAMES: Record<number, string> = { 1: 'Süper Lig', 2: '1. Lig', 3: '2. Lig', 4: '3. Lig' };
const TIER_COLORS: Record<number, string> = { 1: 'text-amber-400', 2: 'text-emerald-400', 3: 'text-blue-400', 4: 'text-white/50' };

export default function LeaderboardTab() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [category, setCategory] = useState<'championships' | 'seasons'>('championships');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/leaderboard?category=${category}`)
      .then(r => r.json())
      .then(data => { setEntries(data.leaderboard || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [category]);

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button onClick={() => setCategory('championships')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-[10px] font-black ${category==='championships' ? 'bg-white/10 text-white' : 'text-white/30'}`}>
          <Trophy size={12} /> İTİBAR
        </button>
        <button onClick={() => setCategory('seasons')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-[10px] font-black ${category==='seasons' ? 'bg-white/10 text-white' : 'text-white/30'}`}>
          <Clock size={12} /> SEZON
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8"><p className="text-white/20 text-[10px]">Yükleniyor...</p></div>
      ) : entries.length === 0 ? (
        <div className="text-center py-8"><p className="text-white/20 text-[10px]">Henüz menajer yok</p></div>
      ) : (
        <div className="space-y-1.5">
          {entries.map((e, i) => (
            <motion.div key={e.id} initial={{ opacity:0, x:-10 }} animate={{ opacity:1, x:0 }} transition={{ delay: i*0.02 }}
              className="flex items-center gap-3 p-2.5 bg-white/[0.03] border border-white/8 rounded-xl">
              <div className="w-6 text-center">
                {i < 3 ? (
                  <span className="text-sm">{['🥇','🥈','🥉'][i]}</span>
                ) : (
                  <span className="text-[10px] text-white/30 font-black">{i+1}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-black text-white truncate">{e.team_name}</p>
                <p className="text-[9px] text-white/30">{e.manager_name}</p>
              </div>
              <div className="text-right shrink-0">
                <p className={`text-[9px] font-black ${TIER_COLORS[e.league_tier] || 'text-white/30'}`}>
                  {TIER_NAMES[e.league_tier] || `Lig ${e.league_tier}`}
                </p>
                <div className="flex items-center gap-1 justify-end">
                  <TrendingUp size={8} className="text-amber-400/50" />
                  <p className="text-[10px] text-amber-400/70 font-black">
                    {category === 'championships' ? e.reputation : e.seasons_played}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
