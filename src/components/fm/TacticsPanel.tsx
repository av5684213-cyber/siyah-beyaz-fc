'use client';

import React from 'react';
import { motion } from 'motion/react';
import { Info, Shield, Zap, Target, MousePointer2, Clock, Swords, Flame, Users, TrendingUp } from 'lucide-react';

import { Player } from '@/lib/fm/types';
import { toTitleCase } from '@/lib/fm/ui-helpers';

interface PitchPosition {
  x: number;
  y: number;
}

interface PlayerIconProps {
  player: Player;
  condition: number;
  pos: PitchPosition;
  onDrop: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragStart: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onClick?: () => void;
  isDragOver?: boolean;
}

const PlayerIcon = ({ player, condition, pos, onDrop, onDragOver, onDragStart, onDragLeave, onClick, isDragOver }: PlayerIconProps) => {
  const displayName = toTitleCase(player.name);
  
  const getRingColor = (cond: number): string => {
    if (cond >= 100) return 'rgb(34, 197, 94)';
    if (cond < 20) return 'rgb(239, 68, 68)';
    if (cond < 50) return 'rgb(234, 179, 8)';
    return 'rgba(255, 255, 255, 0.3)';
  };

  const ringColor = getRingColor(condition);

  return (
    <motion.div 
        layout
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1, left: `${pos.x}%`, top: `${pos.y}%` }}
        draggable
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDrop={onDrop}
        onDragLeave={onDragLeave}
        onClick={onClick}
        className={`absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group cursor-grab active:cursor-grabbing ${isDragOver ? 'z-30 scale-110' : 'z-10'}`}
    >
        <div className="relative w-12 h-12 flex items-center justify-center">
            <svg className="absolute inset-0 w-full h-full -rotate-90">
                <circle cx="24" cy="24" r="22" fill="none" stroke="rgba(0,0,0,0.1)" strokeWidth="4" />
                <circle 
                    cx="24" cy="24" r="22" 
                    fill="none" 
                    stroke={ringColor} 
                    strokeWidth={condition >= 100 ? 4 : 3}
                    strokeDasharray="138"
                    strokeDashoffset={138 * (1 - (condition || 100) / 100)}
                    className="transition-all duration-500"
                />
            </svg>
            
            <div className="w-9 h-10 relative group-hover:scale-110 transition-transform drop-shadow-lg">
                {(() => {
                  const getRoleColor = (role?: string | null) => {
                    if (!role) return 'white';
                    if (role === 'enforcer' || role === 'stopper' || role === 'bwm') return '#ef4444';
                    if (role === 'playmaker' || role === 'dlp' || role === 'bpd' || role === 'false_nine') return '#3b82f6';
                    if (role === 'sprinter' || role === 'advanced_fwd' || role === 'wingback') return '#eab308';
                    if (role === 'sweeper_gk') return '#10b981';
                    if (role === 'mezzala' || role === 'btb') return '#a855f7';
                    return 'white';
                  };
                  return (
                    <svg viewBox="0 0 36 40" className="w-full h-full">
                        <path d="M12,1 L18,5 L24,1 L31,5 L36,13 L36,20 L27,17 L27,39 L9,39 L9,17 L0,20 L0,13 L5,5 Z"
                            fill={getRoleColor(player.special_role)} 
                            stroke="black" strokeWidth="1.5" strokeLinejoin="round" />
                    </svg>
                  );
                })()}
                <span className={`absolute inset-0 flex items-center justify-center text-[9px] font-black pt-1 ${player.special_role ? 'text-white' : 'text-black'}`}>
                  {player.specificPosition || player.position}
                </span>
                
                {/* Role Badge */}
                {player.special_role && (
                  <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center border border-white/20 shadow-lg ${
                    (() => {
                      const role = player.special_role;
                      if (role === 'enforcer' || role === 'stopper' || role === 'bwm') return 'bg-red-500';
                      if (role === 'playmaker' || role === 'dlp' || role === 'bpd' || role === 'false_nine') return 'bg-blue-500';
                      if (role === 'sprinter' || role === 'advanced_fwd' || role === 'wingback') return 'bg-amber-500';
                      if (role === 'sweeper_gk') return 'bg-emerald-500';
                      if (role === 'mezzala' || role === 'btb') return 'bg-purple-500';
                      return 'bg-zinc-500';
                    })()
                  }`}>
                    <span className="text-[6px] font-black text-white uppercase italic">
                      {player.special_role[0]}
                    </span>
                  </div>
                )}
            </div>
        </div>

        <div className="mt-1 bg-black/80 backdrop-blur-sm text-white px-2 py-0.5 shadow-xl border border-white/10 min-w-[50px] max-w-[90px] rounded-sm">
            <span className="text-[7px] font-black tracking-tight block text-center leading-tight uppercase">{displayName}</span>
        </div>
    </motion.div>
  );
};

interface TacticsPanelProps {
  tactics: any;
  onTacticChange: (key: string, value: unknown) => void;
  players: Player[];
  bench?: Player[];
  playerRatings?: Record<string, number>;
  playerConditions?: Record<string, number>;
  onPlayerClick?: (player: Player) => void;
}

const TacticsPanel = ({ 
  tactics, 
  onTacticChange, 
  players, 
  bench = [],
  playerRatings = {},
  playerConditions = {},
  onPlayerClick
}: TacticsPanelProps) => {
  const formations = [
    '4-4-2', '4-3-3', '3-5-2', '5-4-1', '4-2-3-1', 
    '3-4-3', '4-1-4-1', '4-3-2-1', '5-3-2', '4-3-1-2',
    '3-1-4-2', '4-4-1-1', '4-5-1', '3-3-3-1'
  ];
  const [dragOverIdx, setDragOverIdx] = React.useState<number | null>(null);

  const handlePitchDrop = (targetIdx: number) => (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverIdx(null);
    const playerInId = e.dataTransfer.getData("playerId");
    const sourceIdx = e.dataTransfer.getData("sourceIdx");

    if (sourceIdx !== '' && parseInt(sourceIdx) !== targetIdx) {
      const newArr = [...players];
      const temp = newArr[targetIdx];
      newArr[targetIdx] = newArr[parseInt(sourceIdx)];
      newArr[parseInt(sourceIdx)] = temp;
      onTacticChange('SWAP', { players: newArr });
    } else if (sourceIdx === '') {
      onTacticChange('SUBSTITUTE', { playerOutId: players[targetIdx]?.id, playerInId });
    }
  };
  
  const getPitchPositions = (formation: string): PitchPosition[] => {
    const gk = { x: 50, y: 88 };
    let defs: PitchPosition[] = [];
    let mids: PitchPosition[] = [];
    let fwds: PitchPosition[] = [];

    if (formation === '4-3-3') {
        defs = [{ x: 15, y: 70 }, { x: 38, y: 73 }, { x: 62, y: 73 }, { x: 85, y: 70 }];
        mids = [{ x: 25, y: 45 }, { x: 50, y: 48 }, { x: 75, y: 45 }];
        fwds = [{ x: 20, y: 18 }, { x: 50, y: 13 }, { x: 80, y: 18 }];
    } else if (formation === '3-5-2') {
        defs = [{ x: 25, y: 73 }, { x: 50, y: 76 }, { x: 75, y: 73 }];
        mids = [{ x: 10, y: 45 }, { x: 30, y: 48 }, { x: 50, y: 50 }, { x: 70, y: 48 }, { x: 90, y: 45 }];
        fwds = [{ x: 35, y: 18 }, { x: 65, y: 18 }];
    } else if (formation === '5-4-1') {
        defs = [{ x: 10, y: 70 }, { x: 30, y: 73 }, { x: 50, y: 75 }, { x: 70, y: 73 }, { x: 90, y: 70 }];
        mids = [{ x: 15, y: 45 }, { x: 38, y: 48 }, { x: 62, y: 48 }, { x: 85, y: 45 }];
        fwds = [{ x: 50, y: 18 }];
    } else if (formation === '4-2-3-1') {
        defs = [{ x: 15, y: 70 }, { x: 38, y: 73 }, { x: 62, y: 73 }, { x: 85, y: 70 }];
        mids = [{ x: 35, y: 55 }, { x: 65, y: 55 }, { x: 20, y: 35 }, { x: 50, y: 32 }, { x: 80, y: 35 }];
        fwds = [{ x: 50, y: 15 }];
    } else if (formation === '3-4-3') {
        defs = [{ x: 25, y: 75 }, { x: 50, y: 78 }, { x: 75, y: 75 }];
        mids = [{ x: 15, y: 50 }, { x: 38, y: 53 }, { x: 62, y: 53 }, { x: 85, y: 50 }];
        fwds = [{ x: 20, y: 22 }, { x: 50, y: 18 }, { x: 80, y: 22 }];
    } else if (formation === '4-1-4-1') {
        defs = [{ x: 15, y: 70 }, { x: 38, y: 73 }, { x: 62, y: 73 }, { x: 85, y: 70 }];
        mids = [{ x: 50, y: 58 }, { x: 20, y: 40 }, { x: 40, y: 42 }, { x: 60, y: 42 }, { x: 80, y: 40 }];
        fwds = [{ x: 50, y: 18 }];
    } else if (formation === '4-3-2-1') {
        defs = [{ x: 15, y: 70 }, { x: 38, y: 73 }, { x: 62, y: 73 }, { x: 85, y: 70 }];
        mids = [{ x: 25, y: 50 }, { x: 50, y: 52 }, { x: 75, y: 50 }, { x: 35, y: 32 }, { x: 65, y: 32 }];
        fwds = [{ x: 50, y: 15 }];
    } else if (formation === '5-3-2') {
        defs = [{ x: 15, y: 70 }, { x: 32, y: 73 }, { x: 50, y: 75 }, { x: 68, y: 73 }, { x: 85, y: 70 }];
        mids = [{ x: 25, y: 48 }, { x: 50, y: 50 }, { x: 75, y: 48 }];
        fwds = [{ x: 35, y: 18 }, { x: 65, y: 18 }];
    } else if (formation === '4-3-1-2') {
        defs = [{ x: 15, y: 70 }, { x: 38, y: 73 }, { x: 62, y: 73 }, { x: 85, y: 70 }];
        mids = [{ x: 25, y: 52 }, { x: 50, y: 55 }, { x: 75, y: 52 }, { x: 50, y: 35 }];
        fwds = [{ x: 35, y: 18 }, { x: 65, y: 18 }];
    } else if (formation === '3-1-4-2') {
        defs = [{ x: 25, y: 73 }, { x: 50, y: 76 }, { x: 75, y: 73 }];
        mids = [{ x: 50, y: 60 }, { x: 15, y: 45 }, { x: 38, y: 48 }, { x: 62, y: 48 }, { x: 85, y: 45 }];
        fwds = [{ x: 35, y: 18 }, { x: 65, y: 18 }];
    } else if (formation === '4-4-1-1') {
        defs = [{ x: 15, y: 70 }, { x: 38, y: 73 }, { x: 62, y: 73 }, { x: 85, y: 70 }];
        mids = [{ x: 15, y: 45 }, { x: 38, y: 48 }, { x: 62, y: 48 }, { x: 85, y: 45 }, { x: 50, y: 32 }];
        fwds = [{ x: 50, y: 15 }];
    } else if (formation === '4-5-1') {
        defs = [{ x: 15, y: 70 }, { x: 38, y: 73 }, { x: 62, y: 73 }, { x: 85, y: 70 }];
        mids = [{ x: 10, y: 45 }, { x: 30, y: 48 }, { x: 50, y: 50 }, { x: 70, y: 48 }, { x: 90, y: 45 }];
        fwds = [{ x: 50, y: 18 }];
    } else if (formation === '3-3-3-1') {
        defs = [{ x: 25, y: 73 }, { x: 50, y: 76 }, { x: 75, y: 73 }];
        mids = [{ x: 25, y: 55 }, { x: 50, y: 58 }, { x: 75, y: 55 }, { x: 25, y: 35 }, { x: 50, y: 38 }, { x: 75, y: 35 }];
        fwds = [{ x: 50, y: 18 }];
    } else {
        // Default 4-4-2
        defs = [{ x: 15, y: 70 }, { x: 38, y: 73 }, { x: 62, y: 73 }, { x: 85, y: 70 }];
        mids = [{ x: 15, y: 45 }, { x: 38, y: 48 }, { x: 62, y: 48 }, { x: 85, y: 45 }];
        fwds = [{ x: 35, y: 18 }, { x: 65, y: 18 }];
    }
    
    return [gk, ...defs, ...mids, ...fwds];
  };

  const pitchPos = getPitchPositions(tactics.formation || '4-4-2');

  const onPitchDragStart = (e: React.DragEvent, idx: number, player: Player) => {
    e.dataTransfer.setData("playerId", player.id);
    e.dataTransfer.setData("sourceIdx", String(idx));
    e.dataTransfer.effectAllowed = 'move';
  };

  const onBenchDragStart = (e: React.DragEvent, player: Player) => {
    e.dataTransfer.setData("playerId", player.id);
    e.dataTransfer.setData("sourceIdx", '');
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-32">
      
      {/* 2. Pitch and Bench Layout (CENTER) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* SIDEBAR: Squad List */}
        <div className="lg:col-span-1 space-y-6">
            <div className="p-6 bg-zinc-900 border border-white/10 rounded-2xl h-full">
                <h4 className="text-[10px] text-white/30 uppercase font-black tracking-[0.4em] mb-6 flex items-center gap-2">
                   <Users size={14} /> KADRO LİSTESİ
                </h4>
                <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                    {bench.concat(players).sort((a, b) => b.rating - a.rating).map((player, idx) => {
                        const isStarter = players.some(p => p.id === player.id);
                        return (
                          <div 
                              key={`squad-list-${player.id}-${idx}`}
                              draggable
                              onDragStart={(e) => onBenchDragStart(e, player)}
                              onClick={() => onPlayerClick?.(player)}
                              className={`p-3 rounded-xl border transition-all cursor-grab active:cursor-grabbing group hover:scale-[1.02] ${
                                isStarter ? 'bg-white text-black border-white' : 'bg-black/40 border-white/5 text-white/60 hover:border-white/20'
                              }`}
                          >
                              <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                      <div className={`text-[8px] font-black italic ${isStarter ? 'text-black/40' : 'text-white/20'}`}>{player.specificPosition || player.position}</div>
                                      <div className="text-[10px] font-bold uppercase truncate max-w-[80px]">{player.name}</div>
                                  </div>
                                  <div className="text-[10px] font-black">{player.rating}</div>
                              </div>
                          </div>
                        );
                    })}
                </div>
            </div>
        </div>

        {/* PITCH: Formation Display */}
        <div className="lg:col-span-3 space-y-6">
            <div className="relative aspect-[3/2] bg-[#1a472a] border-4 border-white/20 rounded-2xl overflow-hidden shadow-2xl">
                 {/* Grass Pattern */}
                 <div className="absolute inset-0 opacity-40">
                    <div className="h-full w-full bg-[repeating-linear-gradient(90deg,rgba(0,0,0,0.05),rgba(0,0,0,0.05)_50px,transparent_50px,transparent_100px)]"></div>
                 </div>
                 
                 {/* Pitch Lines */}
                 <div className="absolute inset-4 border-2 border-white/30 rounded-lg"></div>
                 <div className="absolute inset-y-4 left-1/2 w-0.5 bg-white/30"></div>
                 <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-2 border-white/30 rounded-full"></div>
                 <div className="absolute inset-y-1/4 left-4 w-40 border-2 border-white/30"></div>
                 <div className="absolute inset-y-1/4 right-4 w-40 border-2 border-white/30"></div>
                 
                 {/* Pitch Players */}
                 {(() => {
                    const sortedPlayers = [...players].sort((a, b) => {
                        const getOrder = (pos: string) => {
                            if (pos === 'GK') return 0;
                            if (pos === 'DEF') return 1;
                            if (pos === 'MID') return 2;
                            return 3;
                        };
                        return getOrder(a.position) - getOrder(b.position);
                    });

                    return sortedPlayers.map((player, idx) => {
                        const pos = pitchPos[idx] || { x: 50, y: 50 };
                        // Swap X and Y for landscape pitch
                        const landscapePos = { x: 100 - pos.y, y: pos.x };

                        return (
                            <PlayerIcon 
                                key={`pitch-player-${player.id}-${idx}`}
                                player={player}
                                condition={playerConditions[player.id] || 100}
                                pos={landscapePos}
                                onDragOver={(e) => { e.preventDefault(); setDragOverIdx(idx); }}
                                onDragLeave={() => setDragOverIdx(null)}
                                onDragStart={(e) => onPitchDragStart(e, idx, player)}
                                onDrop={handlePitchDrop(idx)}
                                onClick={() => onPlayerClick?.(player)}
                                isDragOver={dragOverIdx === idx}
                            />
                        );
                    });
                 })()}

                 <div className="absolute top-6 left-6 flex items-center gap-4">
                    <div className="px-4 py-2.5 bg-black/80 backdrop-blur-md border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-white shadow-lg">
                      {tactics.formation || '4-4-2'}
                    </div>
                    <div className="px-4 py-2 bg-black/40 backdrop-blur-sm rounded-xl border border-white/5 text-[9px] font-bold text-white/40 uppercase tracking-widest leading-none">
                      KADRO DİZİLİŞ ŞEMASI
                    </div>
                 </div>
            </div>

            <div className="p-8 bg-zinc-900 border border-white/10 rounded-2xl grid grid-cols-1 md:grid-cols-2 gap-12">
               <div className="space-y-6">
                  <div className="flex justify-between items-center">
                      <span className="text-[10px] text-white/20 uppercase font-black tracking-[0.4em]">HAZIRLIK SEVİYESİ</span>
                      <span className="text-xs font-black text-white italic">{['Çok Defansif', 'Defansif', 'Dengeli', 'Ofansif', 'Tam Hücum'][tactics.mentality - 1]}</span>
                  </div>
                  <input 
                    type="range" 
                    min="1" 
                    max="5" 
                    step="1"
                    value={tactics.mentality}
                    onChange={(e) => onTacticChange('mentality', parseInt(e.target.value))}
                    className="w-full h-1.5 bg-black rounded-full appearance-none cursor-pointer accent-white"
                  />
               </div>
               <div className="space-y-6">
                  <span className="text-[10px] text-white/20 uppercase font-black tracking-[0.4em]">PAS ORGANİZASYONU</span>
                  <div className="flex gap-2">
                      {['Kısa', 'Uzun', 'Karışık'].map(style => (
                        <button
                            key={style}
                            onClick={() => onTacticChange('passingStyle', style)}
                            className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest border transition-all rounded-xl ${
                                tactics.passingStyle === style ? 'bg-white text-black border-white' : 'bg-transparent text-white/30 border-white/5 hover:border-white/20'
                            }`}
                        >
                            {style}
                        </button>
                      ))}
                  </div>
               </div>
            </div>
        </div>
      </div>

    </div>
  );
};

export default TacticsPanel;
