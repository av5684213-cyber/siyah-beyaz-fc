'use client';
import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import type { Player } from '@/lib/fm/types';

interface Props {
  player1: Player | null;
  player2: Player | null;
  onClose: () => void;
}

const STATS = [
  { key: 'rating',      label: 'OVR' },
  { key: 'passing',     label: 'Pas' },
  { key: 'shooting',    label: 'Şut' },
  { key: 'defending',   label: 'Savunma' },
  { key: 'speed',       label: 'Hız' },
  { key: 'power',       label: 'Güç' },
  { key: 'vision',      label: 'Vizyon' },
  { key: 'control',     label: 'Kontrol' },
  { key: 'heading',     label: 'Kafa' },
  { key: 'cond',        label: 'Kondisyon' },
  { key: 'morale',      label: 'Moral' },
  { key: 'age',         label: 'Yaş' },
] as const;

export default function PlayerCompareModal({ player1, player2, onClose }: Props) {
  if (!player1 || !player2) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-3"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="bg-zinc-900 border border-white/10 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
          initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9 }}
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-zinc-900/95 border-b border-white/10 p-4 flex items-center justify-between">
            <p className="text-[9px] font-black uppercase tracking-widest text-white/30">Oyuncu Karşılaştırma</p>
            <button onClick={onClose}><X size={16} className="text-white/30 hover:text-white" /></button>
          </div>

          {/* İsimler */}
          <div className="grid grid-cols-3 p-4 border-b border-white/5">
            <div className="text-center">
              <p className="text-sm font-black text-blue-400">{player1.name?.split(' ').pop()}</p>
              <p className="text-[9px] text-white/30">{player1.position} · {player1.age} yaş</p>
              <p className="text-[9px] text-blue-400/60">{((player1.market_value||0)/1e6).toFixed(1)}M€</p>
            </div>
            <div className="text-center text-[9px] text-white/15 uppercase tracking-widest flex items-center justify-center">vs</div>
            <div className="text-center">
              <p className="text-sm font-black text-amber-400">{player2.name?.split(' ').pop()}</p>
              <p className="text-[9px] text-white/30">{player2.position} · {player2.age} yaş</p>
              <p className="text-[9px] text-amber-400/60">{((player2.market_value||0)/1e6).toFixed(1)}M€</p>
            </div>
          </div>

          {/* Stat karşılaştırma */}
          <div className="p-4 space-y-2.5">
            {STATS.map(({ key, label }) => {
              const v1 = Number((player1 as any)[key] ?? 0);
              const v2 = Number((player2 as any)[key] ?? 0);
              const maxV = Math.max(v1, v2, 1);
              return (
                <div key={key} className="grid grid-cols-3 items-center gap-2">
                  {/* Oyuncu 1 */}
                  <div className="flex items-center justify-end gap-1.5">
                    <span className={`text-xs font-black tabular-nums ${v1 > v2 ? 'text-emerald-400' : v1 < v2 ? 'text-red-400' : 'text-white/50'}`}>{v1}</span>
                    <div className="w-12 h-1.5 bg-white/5 rounded-full overflow-hidden flex justify-end">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: `${(v1/maxV)*100}%` }} />
                    </div>
                  </div>
                  {/* Stat adı */}
                  <p className="text-[9px] text-white/30 text-center uppercase tracking-wider">{label}</p>
                  {/* Oyuncu 2 */}
                  <div className="flex items-center gap-1.5">
                    <div className="w-12 h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full" style={{ width: `${(v2/maxV)*100}%` }} />
                    </div>
                    <span className={`text-xs font-black tabular-nums ${v2 > v1 ? 'text-emerald-400' : v2 < v1 ? 'text-red-400' : 'text-white/50'}`}>{v2}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Maaş karşılaştırma */}
          <div className="grid grid-cols-3 p-4 border-t border-white/5 text-center">
            <div>
              <p className="text-[9px] text-white/30">Haftalık Maaş</p>
              <p className="text-xs font-black text-blue-400">{((player1.salary||0)/1000).toFixed(0)}K€</p>
            </div>
            <div />
            <div>
              <p className="text-[9px] text-white/30">Haftalık Maaş</p>
              <p className="text-xs font-black text-amber-400">{((player2.salary||0)/1000).toFixed(0)}K€</p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
