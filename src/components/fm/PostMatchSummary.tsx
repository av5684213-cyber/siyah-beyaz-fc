'use client';

import React from 'react';
import { motion } from 'motion/react';
import { Player, MatchResult } from '@/lib/fm/types';
import { formatCurrency } from '@/lib/fm/valuation';

interface PostMatchSummaryProps {
  result: MatchResult;
  homeScore: number;
  awayScore: number;
  players: Player[];
  onClose: () => void;
}

import { X } from 'lucide-react';

export default function PostMatchSummary({ result, homeScore, awayScore, players, onClose }: PostMatchSummaryProps) {
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative w-full max-w-2xl bg-zinc-900 border border-white/10 rounded-[2rem] p-10 space-y-8"
      >
        <button onClick={onClose} className="absolute top-6 right-6 p-2 bg-white/5 text-white/40 hover:text-white rounded-full transition-all">
          <X size={20} />
        </button>
        <div className="text-center space-y-2">
          <h2 className="text-4xl font-black italic uppercase tracking-tighter">Maç Raporu</h2>
          <div className="text-6xl font-black italic tracking-tighter">
            {homeScore} - {awayScore}
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-8">
           <div className="space-y-4">
              <h3 className="text-xs font-black uppercase text-white/30 tracking-widest border-b border-white/5 pb-2">Maçın Adamları</h3>
              {players.slice(0, 3).map(p => (
                <div key={p.id} className="flex justify-between items-center text-sm font-bold">
                  <span>{p.name}</span>
                  <span className="text-amber-400">{result.playerRatings && result.playerRatings[p.id] ? result.playerRatings[p.id].toFixed(1) : '—'}</span>
                </div>
              ))}
           </div>
           <div className="space-y-4">
              <h3 className="text-xs font-black uppercase text-white/30 tracking-widest border-b border-white/5 pb-2">Maç Özeti</h3>
              <div className="text-xs text-white/60 space-y-1">
                 <div>Topla Oynama: {result.stats.home.possession}% - {result.stats.away.possession}%</div>
                 <div>Şutlar: {result.stats.home.shots} - {result.stats.away.shots}</div>
              </div>
           </div>
        </div>

        <button 
          onClick={onClose}
          className="w-full py-4 bg-white text-black font-black uppercase tracking-widest rounded-xl hover:bg-emerald-400 transition-all"
        >
          Devam Et
        </button>
      </motion.div>
    </div>
  );
}
