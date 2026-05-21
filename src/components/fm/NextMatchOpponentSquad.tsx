'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Eye, Shield, Users, ChevronDown, ChevronUp, MapPin } from 'lucide-react';

interface OpponentPlayer {
  id: string;
  name: string;
  position: string;
  specific_position: string;
  rating: number;
  age: number;
  nation: string;
  form: number;
}

interface OpponentSquad {
  starting: OpponentPlayer[];
  subs: OpponentPlayer[];
}

interface FixtureInfo {
  id: string;
  tur: number;
  match_date: string;
  match_time: string;
  opponent: string;
  is_home: boolean;
}

interface NextMatchOpponentSquadProps {
  userId: string;
}

const POSITION_COLORS: Record<string, string> = {
  'GK': 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  'CB': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  'LB': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  'RB': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  'LWB': 'bg-blue-500/15 text-blue-300 border-blue-500/20',
  'RWB': 'bg-blue-500/15 text-blue-300 border-blue-500/20',
  'CDM': 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  'CM': 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  'CAM': 'bg-emerald-500/15 text-emerald-300 border-emerald-500/20',
  'LM': 'bg-emerald-500/15 text-emerald-300 border-emerald-500/20',
  'RM': 'bg-emerald-500/15 text-emerald-300 border-emerald-500/20',
  'LW': 'bg-red-500/20 text-red-400 border-red-500/30',
  'RW': 'bg-red-500/20 text-red-400 border-red-500/30',
  'CF': 'bg-red-500/15 text-red-300 border-red-500/20',
  'ST': 'bg-red-500/20 text-red-400 border-red-500/30',
  'DEF': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  'MID': 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  'FWD': 'bg-red-500/20 text-red-400 border-red-500/30',
};

const POSITION_LABELS: Record<string, string> = {
  'GK': 'Kaleci',
  'CB': 'Stoper',
  'LB': 'Sol Bek',
  'RB': 'Sağ Bek',
  'LWB': 'Sol Kanat Bek',
  'RWB': 'Sağ Kanat Bek',
  'CDM': 'Defansif OS',
  'CM': 'Merkez OS',
  'CAM': 'Ofansif OS',
  'LM': 'Sol Açık',
  'RM': 'Sağ Açık',
  'LW': 'Sol Kanat',
  'RW': 'Sağ Kanat',
  'CF': 'İkinci Forvet',
  'ST': 'Santrfor',
  'DEF': 'Defans',
  'MID': 'Orta Saha',
  'FWD': 'Forvet',
};

export default function NextMatchOpponentSquad({ userId }: NextMatchOpponentSquadProps) {
  const [revealed, setRevealed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [squad, setSquad] = useState<OpponentSquad | null>(null);
  const [opponent, setOpponent] = useState<string | null>(null);
  const [fixture, setFixture] = useState<FixtureInfo | null>(null);
  const [showSubs, setShowSubs] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleReveal = async () => {
    if (revealed || loading) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/next-opponent-squad?userId=${userId}`);
      const data = await res.json();

      if (data.error || !data.squad) {
        setError(data.error || 'Rakip kadrosu bulunamadı.');
        setLoading(false);
        return;
      }

      setSquad(data.squad);
      setOpponent(data.opponent);
      setFixture(data.fixture);
      setRevealed(true);
    } catch (err) {
      console.error('[NextMatchOpponentSquad] Error:', err);
      setError('Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  const renderPlayer = (player: OpponentPlayer, index: number) => {
    const pos = player.specific_position || player.position || 'MID';
    const colorClass = POSITION_COLORS[pos] || 'bg-white/10 text-white/60 border-white/20';
    const posLabel = POSITION_LABELS[pos] || pos;

    return (
      <motion.div
        key={player.id}
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.04 }}
        className="flex items-center gap-3 p-2.5 bg-white/[0.02] border border-white/5 rounded-lg hover:bg-white/[0.04] transition-colors group"
      >
        <div className="w-5 text-center text-[9px] font-mono text-white/15 font-bold">
          {index + 1}
        </div>
        <div className={`px-2 py-1 rounded text-[8px] font-black uppercase tracking-wider border ${colorClass}`}>
          {pos}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[11px] font-bold text-white/80 truncate">{player.name}</div>
          <div className="text-[8px] text-white/25 uppercase font-bold tracking-wider">{posLabel} • {player.age} yaş • {player.nation || ''}</div>
        </div>
        <div className="text-right">
          <div className="text-[12px] font-black text-emerald-400">{player.rating}</div>
          <div className="text-[7px] text-white/20 uppercase font-bold">KLT</div>
        </div>
        <div className="w-12">
          <div className="h-1 bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${player.form || 70}%`,
                backgroundColor: (player.form || 70) >= 70 ? '#22c55e' : (player.form || 70) >= 50 ? '#eab308' : '#ef4444',
              }}
            />
          </div>
          <div className="text-[7px] text-white/15 text-center mt-0.5 uppercase">Form</div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="bg-black/40 border border-white/5 rounded-lg overflow-hidden animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center border border-purple-500/30">
            <Eye className="text-purple-500" size={20} />
          </div>
          <div>
            <h2 className="text-lg font-black italic uppercase tracking-tighter text-white">Rakip İstihbarat</h2>
            <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest">Sonraki Maç Rakip Kadro Analizi</p>
          </div>
        </div>
        {!revealed && (
          <button
            onClick={handleReveal}
            disabled={loading}
            className={`px-4 py-2.5 text-[9px] font-black uppercase tracking-widest border transition-all ${
              loading
                ? 'bg-white/5 border-white/10 text-white/20 cursor-wait'
                : 'bg-purple-500/20 border-purple-500/30 text-purple-400 hover:bg-purple-500/30 hover:text-purple-300 active:scale-95'
            }`}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 border border-white/20 border-t-purple-400 rounded-full animate-spin" />
                Taranıyor...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Eye size={14} />
                Rakip İlk 11&apos;i Gör
              </span>
            )}
          </button>
        )}
      </div>

      {/* Error State */}
      {error && !revealed && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 m-4 rounded">
          <div className="text-[10px] font-black text-red-400 uppercase tracking-wider">{error}</div>
        </div>
      )}

      {/* Revealed Content */}
      <AnimatePresence>
        {revealed && squad && fixture && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            {/* Fixture Info Bar */}
            <div className="bg-purple-500/10 border-b border-purple-500/20 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <MapPin size={14} className={fixture.is_home ? 'text-emerald-400' : 'text-amber-400'} />
                <div>
                  <div className="text-[10px] font-black text-white/60 uppercase tracking-widest">
                    {fixture.is_home ? 'EV SAHİBİ' : 'DEPLASMAN'} • TUR {fixture.tur}
                  </div>
                  <div className="text-[12px] font-black text-white">
                    vs <span className="text-purple-400">{opponent}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-white/30 font-bold">{fixture.match_date || ''}</div>
                <div className="text-[10px] text-white/20 font-bold">{fixture.match_time || ''}</div>
              </div>
            </div>

            {/* Starting XI */}
            <div className="p-4 space-y-2">
              <div className="flex items-center gap-2 mb-3">
                <Shield size={12} className="text-purple-400" />
                <h3 className="text-[10px] font-black text-white/50 uppercase tracking-widest">İLK 11</h3>
                <div className="flex-1 h-px bg-white/5" />
                <div className="text-[8px] text-white/20 font-bold">
                  ORT: {squad.starting.length > 0 ? Math.round(squad.starting.reduce((sum, p) => sum + (p.rating || 0), 0) / squad.starting.length) : 0} KLT
                </div>
              </div>

              {squad.starting.map((player, i) => renderPlayer(player, i))}

              {/* Average rating bar */}
              {squad.starting.length > 0 && (() => {
                const avgRating = Math.round(squad.starting.reduce((sum, p) => sum + (p.rating || 0), 0) / squad.starting.length);
                const barWidth = Math.min(100, avgRating);
                return (
                <div className="mt-3 p-3 bg-white/[0.02] border border-white/5 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">Takım Gücü</span>
                    <span className="text-[10px] font-black text-purple-400">
                      {avgRating} KLT
                    </span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-purple-400 rounded-full transition-all"
                      style={{ width: barWidth + '%' }}
                    />
                  </div>
                </div>
                );
              })()}
            </div>

            {/* Substitutes (collapsible) */}
            {squad.subs.length > 0 && (
              <div className="border-t border-white/5">
                <button
                  onClick={() => setShowSubs(!showSubs)}
                  className="w-full p-3 flex items-center justify-between hover:bg-white/[0.02] transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Users size={12} className="text-white/30" />
                    <span className="text-[9px] font-black text-white/30 uppercase tracking-widest">
                      YEDEKLER ({squad.subs.length})
                    </span>
                  </div>
                  {showSubs ? (
                    <ChevronUp size={14} className="text-white/20" />
                  ) : (
                    <ChevronDown size={14} className="text-white/20" />
                  )}
                </button>
                <AnimatePresence>
                  {showSubs && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 space-y-2">
                        {squad.subs.map((player, i) => renderPlayer(player, i + squad.starting.length))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
