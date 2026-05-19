'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  TrendingUp, 
  Zap, 
  Filter, 
  ArrowUpDown, 
  Search,
  LayoutGrid,
  List as ListIcon,
  ChevronRight,
  Star,
  Info,
  Globe
} from 'lucide-react';
import type { Player, TrainingState } from '@/lib/fm/types';
import { calculateMarketValue, formatCurrency } from '@/lib/fm/valuation';
import { toTitleCase, fmStatColor, localizePos, getPosColor, localizePosFull, getPlayerPos } from '@/lib/fm/ui-helpers';
import PlayerRow from './PlayerRow';
import { POS_TO_GROUP, POS_LABELS } from '@/lib/fm/playerGenerator';

interface MyTeamTabProps {
  userId: string;
  squad: Player[];
  teamName: string;
  teamBudget: number;
  onListPlayer: (player: Player) => void;
  onLoanPlayer: (player: Player) => void;
  onBenchPlayer: (player: Player) => void;
  onPlayerClick: (player: Player) => void;
  trainingState?: TrainingState;
  onTrainingStateChange?: (state: TrainingState) => void;
  isAdmin?: boolean;
}

export default function MyTeamTab({ 
  squad, 
  teamName, 
  teamBudget, 
  onListPlayer, 
  onLoanPlayer,
  onBenchPlayer, 
  onPlayerClick,
  trainingState,
  onTrainingStateChange,
  isAdmin
}: MyTeamTabProps) {
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPos, setFilterPos] = useState<string>('ALL');
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({ 
    key: 'rating', 
    direction: 'desc' 
  });

  // Calculate team stats
  const teamStats = useMemo(() => {
    if (squad.length === 0) return { avgRating: 0, totalValue: 0, avgAge: 0 };
    const avgRating = squad.reduce((acc, p) => acc + (p.rating || 0), 0) / squad.length;
    const totalValue = squad.reduce((acc, p) => acc + calculateMarketValue(p), 0);
    const avgAge = squad.reduce((acc, p) => acc + (p.age || 0), 0) / squad.length;
    return { avgRating, totalValue, avgAge };
  }, [squad]);

  const filteredAndSortedSquad = useMemo(() => {
    let list = [...squad];
    
    // Filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      list = list.filter(p => p && p.name && p.name.toLowerCase().includes(term));
    }
    if (filterPos !== 'ALL') {
      const bigGroups = ['GK', 'DEF', 'MID', 'FWD'];
      list = list.filter(p => {
        if (!p) return false;
        const sp = getPlayerPos(p as Record<string, unknown>);
        if (bigGroups.includes(filterPos)) {
          // Geniş grup filtresi: hem position hem specificPosition grubu eşleşmeli
          return p.position === filterPos || (POS_TO_GROUP as any)[sp] === filterPos;
        }
        // Detaylı mevki filtresi: specificPosition eşleşmeli
        return sp === filterPos;
      });
    }

    // Sort
    list.sort((a, b) => {
      let aVal: any = a[sortConfig.key as keyof Player];
      let bVal: any = b[sortConfig.key as keyof Player];

      if (sortConfig.key === 'value') {
        aVal = calculateMarketValue(a);
        bVal = calculateMarketValue(b);
      }

      if (typeof aVal === 'string') {
        return sortConfig.direction === 'asc' 
          ? aVal.localeCompare(bVal) 
          : bVal.localeCompare(aVal);
      }

      return sortConfig.direction === 'asc' 
        ? (aVal || 0) - (bVal || 0) 
        : (bVal || 0) - (aVal || 0);
    });

    return list;
  }, [squad, searchTerm, filterPos, sortConfig]);

  const handleSort = (key: string) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc'
    }));
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="space-y-6"
    >
      {/* ═══ Header Section ═══ */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 p-8 bg-zinc-900 border border-white/5 rounded-[2.5rem] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-besiktas-red/5 blur-[100px] pointer-events-none" />
        
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-besiktas-red rounded-full animate-pulse" />
            <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30 font-mono">STAFF_ONLY // KADRO_YONETIMI</h2>
          </div>
          <div>
            <h1 className="text-5xl font-black italic tracking-tighter uppercase leading-none">
              {toTitleCase(teamName)} <span className="text-besiktas-red">SQUAD</span>
            </h1>
            <p className="text-xs text-white/40 mt-3 font-medium uppercase tracking-widest">Profesyonel Futbol A Takımı Kadro Analizi</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-8">
          <div className="space-y-1">
            <p className="text-[8px] font-black text-white/20 uppercase tracking-widest">Kadro Gücü</p>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black font-mono">{teamStats.avgRating.toFixed(1)}</span>
              <span className="text-[10px] font-bold text-emerald-400">GENEL</span>
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-[8px] font-black text-white/20 uppercase tracking-widest">Piyasa Değeri</p>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black font-mono">{formatCurrency(teamStats.totalValue)}</span>
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-[8px] font-black text-white/20 uppercase tracking-widest">Yaş Ort.</p>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black font-mono">{teamStats.avgAge.toFixed(1)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ Controls bar ═══ */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
          <input 
            type="text" 
            placeholder="OYUNCU ARA..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-zinc-900 border border-white/5 rounded-2xl py-3 pl-12 pr-4 text-[10px] font-black tracking-widest uppercase focus:border-white/20 outline-none transition-all placeholder:text-white/10"
          />
        </div>
        
        <div className="flex gap-2 shrink-0">
          <div className="bg-zinc-900 border border-white/5 rounded-2xl p-1 flex overflow-x-auto no-scrollbar">
            {['ALL', 'GK', 'DEF', 'MID', 'FWD'].map(pos => (
              <button 
                key={pos}
                onClick={() => setFilterPos(pos)}
                className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all whitespace-nowrap ${filterPos === pos ? 'bg-white text-black' : 'text-white/30 hover:text-white hover:bg-white/5'}`}
              >
                {pos}
              </button>
            ))}
            <select
              value={filterPos}
              onChange={(e) => setFilterPos(e.target.value)}
              className="bg-zinc-800 border border-white/10 rounded-xl px-3 py-2 text-[10px] font-black text-white/70 outline-none cursor-pointer"
            >
              <option value="ALL">Tüm Mevkiler</option>
              <optgroup label="Kaleci">
                <option value="GK">GK - Kaleci</option>
              </optgroup>
              <optgroup label="Defans">
                <option value="CB">CB - Merkez Defans</option>
                <option value="LB">LB - Sol Bek</option>
                <option value="RB">RB - Sağ Bek</option>
                <option value="LWB">LWB - Sol Kanat Bek</option>
                <option value="RWB">RWB - Sağ Kanat Bek</option>
              </optgroup>
              <optgroup label="Orta Saha">
                <option value="CDM">CDM - Defansif Orta Saha</option>
                <option value="CM">CM - Merkez Orta Saha</option>
                <option value="CAM">CAM - Ofansif Orta Saha</option>
                <option value="LM">LM - Sol Açık</option>
                <option value="RM">RM - Sağ Açık</option>
                <option value="LW">LW - Sol Kanat</option>
                <option value="RW">RW - Sağ Kanat</option>
              </optgroup>
              <optgroup label="Forvet">
                <option value="CF">CF - Göbek Forvet</option>
                <option value="ST">ST - Santrfor</option>
              </optgroup>
            </select>
          </div>

          <div className="bg-zinc-900 border border-white/5 rounded-2xl p-1 flex">
            <button onClick={() => setViewMode('list')} className={`p-2 rounded-xl transition-all ${viewMode === 'list' ? 'bg-white text-black' : 'text-white/30 hover:text-white'}`}>
              <ListIcon size={16} />
            </button>
            <button onClick={() => setViewMode('grid')} className={`p-2 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-white text-black' : 'text-white/30 hover:text-white'}`}>
              <LayoutGrid size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* ═══ Stats Header (only for list) ═══ */}
      {viewMode === 'list' && (
        <div className="overflow-x-auto pb-4 custom-scrollbar">
          <div className="min-w-[1200px] flex flex-col gap-4">
            <div className="hidden lg:flex items-center gap-4 px-4 py-3 bg-zinc-900/50 border border-white/5 rounded-2xl border-l-2 border-l-transparent">
              <div 
                onClick={() => handleSort('name')}
                className="w-48 shrink-0 text-left text-[9px] font-black uppercase text-white/40 tracking-widest cursor-pointer hover:text-besiktas-red transition-colors flex items-center gap-2"
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
                  { label: 'Top', key: 'defending' },
                  { label: 'Tplm', key: 'total' },
                  { label: 'Knd', key: 'cond' },
                  { label: 'Ort', key: 'rating' },
                ].map(h => (
                  <button 
                    key={h.label} 
                    onClick={() => handleSort(h.key)}
                    className={`text-center text-[9px] font-black uppercase tracking-tighter leading-none cursor-pointer transition-colors flex flex-col items-center justify-center gap-1 py-1 rounded hover:bg-white/5 ${sortConfig.key === h.key ? 'text-besiktas-red' : 'text-white/20'}`}
                  >
                    {h.label}
                    <div className={`w-1 h-1 rounded-full ${sortConfig.key === h.key ? 'bg-besiktas-red' : 'bg-transparent'}`} />
                  </button>
                ))}
              </div>
              <div className="w-24 shrink-0" />
            </div>
            
            <div className="space-y-px">
              <AnimatePresence mode="popLayout">
                {filteredAndSortedSquad.map((player, idx) => (
                  <PlayerRow 
                    key={player.id} 
                    player={player} 
                    index={idx} 
                    onClick={() => onPlayerClick(player)} 
                    teamName={teamName} 
                    teamStats={{}} 
                    trainingState={trainingState}
                    onTrainingStateChange={onTrainingStateChange}
                    onSell={onListPlayer}
                    onLoan={onLoanPlayer}
                    isOwnTeam={true}
                    isAdmin={isAdmin}
                  />
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>
      )}

      {/* ═══ Player List/Grid ═══ */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {filteredAndSortedSquad.map((player, idx) => (
              <motion.div
                key={player.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                onClick={() => onPlayerClick(player)}
                className="fm-card group cursor-pointer relative"
              >
                {/* Pos Badge */}
                <div className={`absolute top-4 left-4 w-10 h-10 rounded-xl flex items-center justify-center font-black italic shadow-2xl ${getPosColor(getPlayerPos(player as Record<string, unknown>))} border border-white/10`}>
                   {getPlayerPos(player as Record<string, unknown>)}
                </div>

                {/* Main Identity */}
                <div className="p-6 pt-16">
                  <div className="flex items-center justify-between mb-4">
                     <div>
                       <div className="flex items-center gap-2">
                         <h3 className="text-xl font-black italic tracking-tighter uppercase truncate max-w-[150px]">{toTitleCase(player.name)}</h3>
                         {player.age <= 21 && <Star size={12} className="text-amber-400 fill-amber-400" />}
                       </div>
                       <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">{player.age} YAŞ • {localizePosFull(getPlayerPos(player as Record<string, unknown>))}</p>
                     </div>
                     <div className="text-right">
                        <div className={`text-3xl font-black font-mono italic leading-none ${fmStatColor(player.rating)}`}>{Math.round(player.rating)}</div>
                        <div className="text-[8px] font-black text-white/20 uppercase tracking-widest mt-1">GENEL RTG</div>
                     </div>
                  </div>

                  {/* MINI STATS GRID */}
                  <div className="grid grid-cols-3 gap-2 py-4 border-y border-white/5 bg-white/[0.01] -mx-2 px-2 rounded-xl">
                    <div className="text-center">
                       <p className="text-[7px] font-black text-white/20 uppercase mb-1">PİYASA DEĞERİ</p>
                       <p className="text-[10px] font-mono font-bold text-emerald-500">{formatCurrency(calculateMarketValue(player))}</p>
                    </div>
                    <div className="text-center">
                       <p className="text-[7px] font-black text-white/20 uppercase mb-1">KONDİSYON</p>
                       <p className={`text-[10px] font-mono font-bold ${player.cond >= 70 ? 'text-emerald-400' : 'text-amber-400'}`}>{player.cond || 100}%</p>
                    </div>
                    <div className="text-center">
                       <p className="text-[7px] font-black text-white/20 uppercase mb-1">POTANSİYEL</p>
                       <p className="text-[10px] font-mono font-bold text-amber-500/80">{player.potential || '—'}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-4 flex gap-2">
                    <button 
                      onClick={(e) => { e.stopPropagation(); onListPlayer(player); }}
                      className="flex-1 py-3 bg-white/5 border border-white/5 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-emerald-500 hover:text-black transition-all"
                    >
                      SATILIGA CIKAR
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); onLoanPlayer(player); }}
                      className="flex-1 py-3 bg-cyan-500/10 border border-cyan-500/30 rounded-xl text-[9px] font-black uppercase tracking-widest text-cyan-400 hover:bg-cyan-500 hover:text-white transition-all flex items-center justify-center gap-1.5"
                    >
                      <Globe size={12} />
                      KIRALIK GÖNDER
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); onBenchPlayer(player); }}
                      className="p-3 bg-white/5 border border-white/5 rounded-xl text-white/30 hover:text-besiktas-red transition-all"
                    >
                      <Zap size={14} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {filteredAndSortedSquad.length === 0 && (
        <div className="flex flex-col items-center justify-center p-20 bg-zinc-900 border border-white/5 border-dashed rounded-[3rem] text-center">
           <Search size={48} className="text-white/5 mb-4" />
           <h3 className="text-lg font-black uppercase tracking-widest text-white/40">OYUNCU BULUNAMADI</h3>
           <p className="text-[10px] text-white/20 mt-2 uppercase tracking-widest font-bold">Arama kriterlerini veya filtreleri değiştirin.</p>
        </div>
      )}
    </motion.div>
  );
}
