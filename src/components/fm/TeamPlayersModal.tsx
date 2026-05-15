'use client';

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Shield, Users, Info } from 'lucide-react';
import type { Player } from '@/lib/fm/types';
import PlayerRow from './PlayerRow';
import { toTitleCase } from '@/lib/fm/ui-helpers';

interface TeamPlayersModalProps {
  teamName: string;
  players: Player[];
  loading: boolean;
  onClose: () => void;
  onPlayerClick: (player: Player) => void;
}

export default function TeamPlayersModal({ teamName, players, loading, onClose, onPlayerClick }: TeamPlayersModalProps) {
  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/90 backdrop-blur-md"
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-5xl max-h-[90vh] bg-zinc-900 border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl flex flex-col"
        >
          {/* Header */}
          <div className="p-6 border-b border-white/5 bg-gradient-to-r from-zinc-900 to-black shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg">
                  <Shield size={24} className="text-black" />
                </div>
                <div>
                  <h2 className="text-2xl font-display font-black italic tracking-tighter text-white">
                    {toTitleCase(teamName)}
                  </h2>
                  <div className="flex items-center gap-3 mt-1">
                    <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-white/40">
                      <Users size={12} />
                      {players.length} OYUNCU
                    </div>
                    <div className="h-1 w-1 rounded-full bg-white/20" />
                    <div className="text-[10px] font-black uppercase tracking-widest text-amber-500/80">
                      PROFESYONEL KADRO
                    </div>
                  </div>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/5 rounded-full text-white/40 hover:text-white transition-all"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Info Banner */}
          <div className="px-6 py-3 bg-amber-500/5 border-b border-white/5 flex items-center gap-2 text-amber-400/60">
            <Info size={14} />
            <p className="text-[10px] font-bold uppercase tracking-widest leading-none">
              TAKIM ANALİZİ: KADRO VERİSİ SUPABASE ÜZERİNDEN CANLI OLARAK ÇEKİLMEKTEDİR.
            </p>
          </div>

          {/* Player List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-px custom-scrollbar">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="w-10 h-10 border-2 border-white/10 border-t-white rounded-full animate-spin" />
                <p className="text-xs font-black uppercase tracking-[0.2em] text-white/20">KADRO VERİSİ YÜKLENİYOR...</p>
              </div>
            ) : players.length > 0 ? (
              <div className="min-w-fit">
                {/* Column Headers for alignment if matches PlayerRow */}
                <div className="flex items-center gap-4 px-2 py-2 mb-2 bg-black/40 border border-white/5 rounded-lg">
                    <div className="w-32 md:w-48 text-center text-[8px] font-black uppercase text-white/20 tracking-widest">
                        OYUNCU BİLGİSİ
                    </div>
                    <div className="flex-1 grid grid-cols-13 text-center text-[7px] font-black uppercase text-white/20 tracking-widest">
                        <span>Klt</span>
                        <span>Klc</span>
                        <span>Tk</span>
                        <span>Pas</span>
                        <span>Şut</span>
                        <span>Kfa</span>
                        <span>Hız</span>
                        <span>Güç</span>
                        <span>Alg</span>
                        <span>Top</span>
                        <span>Tplm</span>
                        <span>Knd</span>
                        <span>Ort</span>
                    </div>
                    <div className="hidden lg:block w-32 " />
                </div>
                {players.map((player, idx) => (
                  <PlayerRow
                    key={player.id || idx}
                    player={player}
                    index={idx}
                    onClick={() => onPlayerClick(player)}
                    teamStats={{}}
                    teamName={teamName}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-white/10">
                <Users size={48} className="mb-4 opacity-50" />
                <p className="text-xs font-black uppercase tracking-widest italic">BU TAKIM İÇİN OYUNCU BULUNAMADI</p>
              </div>
            )}
          </div>
          
          {/* Footer */}
          <div className="p-4 border-t border-white/5 bg-black/40 shrink-0 flex justify-end">
            <button
                onClick={onClose}
                className="px-6 py-2 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-white/50 hover:bg-white/10 hover:text-white transition-all shadow-xl"
            >
                Kapat
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
