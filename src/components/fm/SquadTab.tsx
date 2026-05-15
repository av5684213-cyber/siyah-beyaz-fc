'use client';

import React from 'react';
import { motion } from 'motion/react';
import { Zap } from 'lucide-react';
import type { Player } from '@/lib/fm/types';
import { TeamRadarChart } from './TeamRadarChart';
import PlayerRow from './PlayerRow';
import { toTitleCase } from '@/lib/fm/ui-helpers';

interface TeamAvgStats {
  speed: number;
  power: number;
  passing: number;
  shooting: number;
  rating: number;
  defending: number;
}

interface SquadTabProps {
  squad: Player[];
  sortedSquad: Player[];
  radarChartData: Array<{subject: string; A: number}>;
  teamAvgStats: TeamAvgStats;
  sortConfig: { key: string; direction: string };
  onSortConfigChange: (config: { key: string; direction: string }) => void;
  onPlayerClick: (player: Player) => void;
  onRunEvolution: () => void;
  onMassList?: () => void;
  teamName: string; // Added
}

export function SquadTab({ 
  squad, 
  sortedSquad, 
  radarChartData, 
  teamAvgStats, 
  sortConfig, 
  onSortConfigChange, 
  onPlayerClick, 
  onRunEvolution,
  onMassList,
  teamName // Added
}: SquadTabProps) {
  return (
    <motion.div key="squad" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 px-2">
        <div>
          <h2 className="text-4xl font-black italic tracking-tighter text-white">{toTitleCase(teamName)} Kadro Yönetimi</h2>
          <div className="flex items-center gap-2 mt-1">
            <div className="w-8 h-px bg-besiktas-red" />
            <p className="text-[10px] text-white/30 uppercase tracking-[0.3em] font-black">{squad.length} AKTİF OYUNCU ANALİZİ</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={onRunEvolution} 
            className="fm-button-primary flex items-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
          >
            <Zap size={14} />
            GELİŞİM SİMÜLASYONU
          </button>
        </div>
      </div>

      {squad.length > 0 && onMassList && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 bg-besiktas-red/10 border border-besiktas-red/30 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6"
        >
          <div className="flex items-center gap-4 text-center md:text-left">
            <div className="w-14 h-14 bg-besiktas-red rounded-2xl flex items-center justify-center text-white shadow-lg shadow-besiktas-red/20 rotate-3">
              <Zap size={28} fill="currentColor" />
            </div>
            <div>
              <h3 className="text-xl font-black italic uppercase tracking-tighter text-besiktas-red">Kadro Transfer Emirleri</h3>
              <p className="text-xs text-white/50 font-medium leading-tight">Bu sekmedeki tüm oyuncuları transfer pazarına taşımak için emir verin. <br className="hidden md:block" /> Taşıma işlemi sonrası bu liste boşalacaktır.</p>
            </div>
          </div>
          <button 
            onClick={onMassList}
            className="w-full md:w-auto px-10 py-5 bg-besiktas-red text-white font-black uppercase tracking-[0.2em] text-xs rounded-2xl hover:bg-red-600 transition-all shadow-2xl shadow-besiktas-red/40 active:scale-95 group flex items-center justify-center gap-3"
          >
            SISTEME AKTAR
            <Zap size={16} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>
      )}

      <div className="fm-card p-6 flex flex-col md:flex-row items-center gap-8 border-l-4 border-l-white">
        <div className="w-full md:w-56 h-56 shrink-0 relative">
          <div className="absolute inset-0 bg-white/5 rounded-full blur-2xl" />
          <TeamRadarChart data={radarChartData} />
        </div>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 font-mono">{toTitleCase(teamName)}_PROFILI</h4>
          </div>
          <p className="text-sm text-white/70 leading-relaxed font-medium italic max-w-xl">
            &quot;{toTitleCase(teamName)}&quot; ekolüne uygun olarak teknik kapasite ve pas kalitesi ön planda. 
            Takımın ortalama hızı <span className="text-emerald-400 font-bold">{teamAvgStats.speed}</span>, 
            fiziksel gücü ise <span className="text-emerald-400 font-bold">{teamAvgStats.power}</span> seviyesinde. 
            Genç yeteneklerin adaptasyon süreci başarıyla devam ediyor.
          </p>
          <div className="flex gap-4">
             <div className="flex flex-col">
               <span className="text-[8px] uppercase font-black text-white/20 tracking-widest">Ort. Rating</span>
               <span className="text-xl font-black font-mono text-white">{teamAvgStats.rating}</span>
             </div>
             <div className="w-px h-8 bg-white/10" />
             <div className="flex flex-col">
               <span className="text-[8px] uppercase font-black text-white/20 tracking-widest">Kadro Değeri</span>
               <span className="text-xl font-black font-mono text-emerald-500">$94.2M</span>
             </div>
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto pb-4 custom-scrollbar">
        <div className="min-w-[1200px] space-y-4">
          <div className="hidden md:flex items-center gap-4 px-4 py-3 bg-black/40 border border-white/5 rounded-xl">
            <div 
              onClick={() => onSortConfigChange({ key: 'name', direction: sortConfig.key === 'name' && sortConfig.direction === 'desc' ? 'asc' : 'desc' })}
              className="w-48 shrink-0 text-left text-[9px] font-black uppercase text-white/40 tracking-widest cursor-pointer hover:text-emerald-400 transition-colors flex items-center gap-2"
            >
              OYUNCU KİMLİĞİ {sortConfig.key === 'name' && (sortConfig.direction === 'desc' ? '▼' : '▲')}
            </div>
            <div className="flex-1 grid grid-cols-14 gap-px text-white/40">
              {[
                { label: 'Poz', key: 'position' },
                { label: 'Klt', key: 'potential' },
                { label: 'Klc', key: 'goalkeeping' },
                { label: 'Tk', key: 'control' },
                { label: 'Pas', key: 'passing' },
                { label: 'Şut', key: 'shooting' },
                { label: 'Kfa', key: 'heading' },
                { label: 'Hız', key: 'speed' },
                { label: 'Güç', key: 'power' },
                { label: 'Alg', key: 'vision' },
                { label: 'Sav', key: 'defending' },
                { label: 'Tplm', key: 'total' },
                { label: 'Knd', key: 'cond' },
                { label: 'Ort', key: 'rating' }
              ].map(h => (
                <div 
                  key={h.label} 
                  onClick={() => onSortConfigChange({ key: h.key, direction: sortConfig.key === h.key && sortConfig.direction === 'desc' ? 'asc' : 'desc' })}
                  className={`text-center text-[9px] font-black uppercase tracking-tighter leading-none cursor-pointer transition-colors flex flex-col items-center justify-center gap-1 py-1 rounded hover:bg-white/5 ${sortConfig.key === h.key ? 'text-emerald-400' : 'text-white/20'}`}
                >
                  {h.label}
                  <div className={`w-1 h-1 rounded-full ${sortConfig.key === h.key ? 'bg-emerald-400' : 'bg-transparent'}`} />
                </div>
              ))}
            </div>
            <div className="w-24 shrink-0" />
          </div>
          
          <div className="space-y-px bg-white/[0.02] max-h-[600px] overflow-y-auto">
            {sortedSquad.length > 0 ? (
              sortedSquad.map((player, i) => (
                <PlayerRow 
                  key={player.id || `p-${i}`} 
                  player={player} 
                  index={i} 
                  onClick={() => onPlayerClick(player)} 
                  teamStats={{}}
                  teamName={teamName}
                />
              ))
            ) : (
              <div className="p-12 text-center text-white/20 uppercase tracking-[0.3em] font-black italic">
                Oyuncular yükleniyor veya veri hatası var...
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
