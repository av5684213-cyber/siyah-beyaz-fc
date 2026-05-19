'use client';

import React from 'react';
import { motion } from 'motion/react';
import { Star, ChevronRight, Globe } from 'lucide-react';
import { calculateMarketValue, formatCurrency } from '@/lib/fm/valuation';
import { getPosColor, localizePos, localizePosFull, getPosRowStyle, formatPosBadge, getPlayerPos } from '@/lib/fm/ui-helpers';
import { getTraitInfo, getPlayStyleInfo, getTraitColor, getTraitBgColor } from '@/lib/fm/traits';
import { fmStatColor, fmStatBg, toTitleCase } from '@/lib/fm/ui-helpers';
import type { Player, TrainingState, TrainingAssignment, TrainingProgramId } from '@/lib/fm/types';
import { useCallback, useMemo } from 'react';
import { DollarSign } from 'lucide-react';

interface PlayerRowProps {
  player: Player;
  index: number;
  onClick: () => void;
  teamStats: Record<string, number>;
  teamName: string;
  trainingState?: TrainingState;
  onTrainingStateChange?: (state: TrainingState) => void;
  onSell?: (player: Player) => void;
  onLoan?: (player: Player) => void;
  isOwnTeam?: boolean;
  isAdmin?: boolean;
}

export default function PlayerRow({ 
  player, 
  index, 
  onClick, 
  teamStats: _teamStats, 
  teamName,
  trainingState,
  onTrainingStateChange,
  onSell,
  onLoan,
  isOwnTeam,
  isAdmin
}: PlayerRowProps) {
  const rating = player?.rating || 65;
  const marketValue = player ? calculateMarketValue(player) : 0;

  // Extract values before memoization to avoid optional chaining in deps
  const playerId = player?.id;
  const playerTraits = player?.traits;
  const playerNegTraits = player?.negTraits;
  const assignments = trainingState?.assignments;

  const assignment = useMemo(() => {
    if (!player || !playerId) return null;
    return assignments?.find(a => a.playerId === playerId);
  }, [assignments, playerId]);

  const allTraits = useMemo(() => {
    if (!player) return { pos: [], neg: [] };
    const list = [...(playerTraits || [])];
    const negs = [...(playerNegTraits || [])];
    return { pos: list, neg: negs };
  }, [playerTraits, playerNegTraits]);

  const setPlayerFocus = useCallback((stat: string | null) => {
    if (!player || !onTrainingStateChange || !trainingState) return;
    const currentAssignments = trainingState.assignments || [];
    const exists = currentAssignments.some(a => a.playerId === playerId);
    
    let newAssignments;
    if (exists) {
      newAssignments = currentAssignments.map(a => {
        if (a.playerId === playerId) return { ...a, focusedStat: stat as keyof Player || undefined };
        return a;
      });
    } else {
      newAssignments = [...currentAssignments, { 
        playerId: playerId, 
        programId: 'fiziksel_yukleme' as TrainingProgramId, 
        focusedStat: stat as keyof Player || undefined 
      }];
    }
    onTrainingStateChange({ ...trainingState, assignments: newAssignments });
  }, [player, trainingState, onTrainingStateChange, playerId]);

  if (!player) return null;

  const isGK = player.position === 'GK';

  const stats = [
    { label: 'Poz', val: formatPosBadge(player), key: 'position' },
    { label: 'Mevki', val: localizePosFull(getPlayerPos(player as Record<string, unknown>)), key: 'specificPosition' },
    { label: 'Klt', val: Math.round(player.potential || rating), key: 'potential' },
    { label: isGK ? 'Ref' : 'Klc', val: Math.round(player.goalkeeping || 0), key: 'goalkeeping' },
    { label: 'Tk', val: Math.round(player.control || rating), key: 'control' },
    { label: 'Pas', val: Math.round(player.passing || rating), key: 'passing' },
    { label: 'Şut', val: Math.round(player.shooting || rating), key: 'shooting' },
    { label: 'Kfa', val: Math.round(player.heading || 0), key: 'heading' },
    { label: 'Hız', val: Math.round(player.speed || rating), key: 'speed' },
    { label: 'Güç', val: Math.round(player.power || rating), key: 'power' },
    { label: 'Alg', val: Math.round(player.vision || 0), key: 'vision' },
    { label: 'Sav', val: Math.round(player.defending || rating), key: 'defending' },
    { 
      label: 'Tplm', 
      val: Math.round(
        isGK 
          ? ((player.goalkeeping || 0) * 0.4 + (player.passing * 0.1) + (player.speed * 0.1) + (player.power * 0.1) + (player.defending * 0.1) + ((player.vision || 0) * 0.1) + ((player.control || 0) * 0.1)) / 1
          : ((player.passing + player.shooting + (player.control || 0) + player.speed + player.power + player.defending + (player.vision || 0) + (player.heading || 0)) / 8)
      ), 
      key: 'total' 
    },
    { label: 'Knd', val: Math.round(player.cond || 100), key: 'cond' },
    { label: 'Ort', val: rating.toFixed(0), key: 'rating' }
  ];

  const posColor = getPosRowStyle(getPlayerPos(player as Record<string, unknown>));

  return (
    <motion.div 
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.005 }}
      onClick={onClick}
      className={`flex items-center gap-4 px-4 py-2 border-b border-white/[0.03] hover:bg-white/[0.05] transition-all cursor-pointer group w-full min-w-[1200px] border-l-[3px] hover:border-l-white ${posColor}`}
    >
      <div className="flex flex-col shrink-0 w-48 min-w-0">
          <div className="flex items-center gap-1.5 truncate">
            <h3 className="text-[10px] font-black tracking-tight text-white/90 truncate leading-none group-hover:text-white transition-colors">
              {toTitleCase(player.name)}
            </h3>
            {player.injury && (
              <span className="text-[10px] animate-pulse" title={`Sakatlık: ${player.injury.remaining_days} gün kaldı`}>🏥</span>
            )}
            {player.is_legend && (
              <span className="text-[10px] text-amber-400 drop-shadow-sm" title="Kulüp Efsanesi">⭐</span>
            )}
            {player.is_for_sale && (
              <span className="px-1 py-0 rounded-sm bg-emerald-500/20 border border-emerald-500/30 text-[6px] font-bold uppercase text-emerald-400 shrink-0">
                LİSTEDE
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1 whitespace-nowrap">
             <span className="text-[7px] font-bold text-white/40 uppercase tracking-widest leading-none shrink-0">{toTitleCase(teamName || 'Boşta')}</span>
             <span className="w-1 h-1 bg-white/10 rounded-full shrink-0" />
             <span className="text-[7px] font-bold text-white/20 uppercase tracking-widest leading-none shrink-0">{player.age} YAŞ</span>
             <span className="w-1 h-1 bg-white/10 rounded-full shrink-0" />
             <span className="text-[7px] font-mono font-bold text-emerald-500/60 leading-none shrink-0">{formatCurrency(marketValue)}</span>
          </div>
          
          {/* TRAITS & PLAYSTYLE AT BOTTOM LEFT OF CARD INFO */}
          <div className="flex flex-wrap gap-1 mt-1.5">
            {player.playStyle && (
              <div className="px-1.5 py-0.5 rounded-sm bg-white/10 border border-white/10 text-[6px] font-black uppercase text-white/60 tracking-wider">
                {player.scouted || isAdmin || isOwnTeam ? player.playStyle : '(? STİL)'}
              </div>
            )}
            {allTraits.pos.slice(0, 1).map((tname, idx) => {
              const info = getTraitInfo(tname);
              if (!info) return null;
              const level = player.traitLevels?.[tname] || info.level;
              const traitStyles = getTraitColor(level);
              return (
                <div key={idx} className={`px-1.5 py-0.5 rounded-sm bg-gradient-to-br border text-[6px] font-black uppercase tracking-wider transition-all hover:scale-110 cursor-help ${traitStyles}`}>
                  {player.scouted || isAdmin || isOwnTeam ? tname : '??'}
                </div>
              );
            })}
          </div>
      </div>

      <div className="flex-1 grid grid-cols-15 gap-px bg-white/5 rounded overflow-hidden p-px">
        {stats.map(s => {
          const isFocused = assignment?.focusedStat === s.key;
          const isTrainable = s.key !== 'total' && s.key !== 'rating' && s.key !== 'cond' && s.key !== 'potential' && s.key !== 'position' && s.key !== 'specificPosition';
          const isSpecial = s.key === 'position' || s.key === 'specificPosition';

          return (
            <div 
              key={s.key} 
              onClick={(e) => {
                if (isTrainable) {
                  e.stopPropagation();
                  setPlayerFocus(isFocused ? null : s.key);
                }
              }}
              className={`flex flex-col items-center justify-center py-2 min-w-0 transition-colors cursor-pointer ${
                  isFocused ? 'bg-white/20 text-white border border-white/30' : 'bg-black/40 hover:bg-white/5'
              }`}
            >
              <span className={`text-[9px] font-mono font-bold leading-none ${
                  isFocused ? 'text-white' :
                  isSpecial ? 'text-white/80' :
                  s.key === 'cond' ? (Number(s.val) >= 70 ? 'text-emerald-400' : Number(s.val) >= 40 ? 'text-amber-400' : 'text-red-400') : 
                  Number(s.val) >= 85 ? 'text-amber-400' : Number(s.val) >= 75 ? 'text-emerald-400' : 'text-white/60'
              }`}>{s.val}</span>
            </div>
          );
        })}
      </div>

      <div className="w-32 shrink-0 flex items-center justify-center gap-1">
        {isOwnTeam && onSell && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSell(player);
            }}
            className="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-emerald-500/10 hover:border-emerald-500/40 hover:text-emerald-400 transition-all group/sell"
            title="Satış Listesine Koy"
          >
            <DollarSign size={14} />
          </button>
        )}
        {isOwnTeam && onLoan && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onLoan(player);
            }}
            className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500 hover:text-white transition-all"
            title="Kiralık Olarak Gönder"
          >
            <Globe size={14} />
          </button>
        )}
      </div>

      <div className="w-8 shrink-0 flex items-center justify-end">
         <ChevronRight size={14} className="text-white/10 group-hover:text-white transition-colors" />
      </div>
    </motion.div>
  );
}
