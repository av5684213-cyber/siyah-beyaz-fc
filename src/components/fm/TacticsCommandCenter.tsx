'use client';

import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { GameTactics, ActiveTactic, Player } from '@/lib/fm/types';
import { Info, Shield, Zap, Target, MousePointer2, Clock, Swords, Flame, Users, ArrowRightLeft, CheckCircle, XCircle, AlertTriangle, Star, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import TacticsRolesPanel from './TacticsRolesPanel';
import { calculateTacticalScore } from '@/lib/fm/tacticsRoles';

function toTitleCase(str: string): string {
  return str.replace(/\b\w/g, c => c.toUpperCase());
}
import { POS_ORDER, POS_LABELS, POS_TO_GROUP } from '@/lib/fm/playerGenerator';
import { getPosGroup, getPosRowStyle } from '@/lib/fm/ui-helpers';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// Arketip açıklama haritası
const ARCHETYPE_INFO: Record<string, { desc: string; boosts: string[] }> = {
  'Refleks canavarı': { desc: 'Kaleci arketipi — Refleks ve kurtarış ustası', boosts: ['Kalecilik', 'Refleksler'] },
  'Güvenli eller': { desc: 'Kaleci arketipi — Top tutma ve soğukkanlılık', boosts: ['Kalecilik', 'Soğukkanlılık'] },
  '1v1 ustası': { desc: 'Kaleci arketipi — Bire bir durumlarda uzman', boosts: ['Kalecilik', 'Cesaret'] },
  'Hava hakimiyeti': { desc: 'Hava toplarında dominant — Kafa ve zıplama', boosts: ['Kafa', 'Zıplama'] },
  'Kale gibi': { desc: 'Defans arketipi — Markaj ve top kapma ustası', boosts: ['Markaj', 'Top Kapma'] },
  'Lider stoper': { desc: 'Defans arketipi — Liderlik ve pozisyon alma', boosts: ['Liderlik', 'Pozisyon'] },
  'Topla çıkan stoper': { desc: 'Defans arketipi — Pas ve dribling yeteneği yüksek', boosts: ['Pas', 'Dribling'] },
  'Hızlı stoper': { desc: 'Defans arketipi — Hız ve iverlenme', boosts: ['Hız', 'İverlenme'] },
  'Markajcı': { desc: 'Defans arketipi — Adam adama markaj ustası', boosts: ['Markaj'] },
  'Gölge Markajcı': { desc: 'Defans arketipi — Gölge markaj tekniği', boosts: ['Markaj'] },
  'Kanat bekçisi': { desc: 'Bek arketipi — Markaj ve top kapma', boosts: ['Markaj', 'Top Kapma'] },
  'Uzun pas ustası': { desc: 'Orta ve uzun pas uzmanı', boosts: ['Orta', 'Pas'] },
  'Süpürücü (libero)': { desc: 'Defans arketipi — Markaj ve pozisyon alma', boosts: ['Markaj', 'Pozisyon'] },
  'Top saklayan': { desc: 'Top saklama ve denge ustası', boosts: ['Dribling', 'Denge'] },
  'Pres ustası': { desc: 'Orta saha arketipi — Top kapma ve çalışkanlık', boosts: ['Top Kapma', 'Çalışkanlık'] },
  'Tempo kontrolcüsü': { desc: 'Orta saha arketipi — Pas ve vizyon', boosts: ['Pas', 'Vizyon'] },
  'Regista': { desc: 'Orta saha arketipi — Derin oyun kurucu', boosts: ['Pas', 'Vizyon'] },
  'Oyun Bozan': { desc: 'Orta saha arketipi — Top kapma ve öngörü', boosts: ['Top Kapma', 'Öngörü'] },
  'Oyun kurucu': { desc: 'Orta saha arketipi — Pas ve vizyon ile oyun kurar', boosts: ['Pas', 'Vizyon'] },
  'Box-to-box': { desc: 'Orta saha arketipi — Dayanıklılık, top kapma ve şut', boosts: ['Dayanıklılık', 'Top Kapma', 'Şut'] },
  'Top dağıtıcı': { desc: 'Orta saha arketibi — Pas ve ilk kontrol', boosts: ['Pas', 'İlk Kontrol'] },
  'Uzaktan şutçu': { desc: 'Uzaktan şut uzmanı', boosts: ['Uzaktan Şut', 'Şut'] },
  'Pas arası ustası': { desc: 'Öngörü ve top kapma ile pas arası', boosts: ['Öngörü', 'Top Kapma'] },
  '10 numara': { desc: 'Ofansif orta saha — Pas, vizyon ve dribling', boosts: ['Pas', 'Vizyon', 'Dribling'] },
  'Boşluk bulucu': { desc: 'Ofansif orta saha — Boş alan bulma ve dribling', boosts: ['Boş Alan', 'Dribling'] },
  'Oyun görüşü yüksek': { desc: 'Vizyon ve pas ile oyun okuma', boosts: ['Vizyon', 'Pas'] },
  'Koşu ustası': { desc: 'Hız ve dayanıklılık ile sürekli koşu', boosts: ['Hız', 'Dayanıklılık'] },
  'Hızlı forvet': { desc: 'Forvet arketipi — Hız ve iverlenme', boosts: ['Hız', 'İverlenme'] },
  'Boşluk avcısı': { desc: 'Forvet arketibi — Dribling ve boş alan bulma', boosts: ['Dribling', 'Boş Alan'] },
  'Kontra canavarı': { desc: 'Kontra atak ustası — Hız ve dribling', boosts: ['Hız', 'Dribling'] },
  'Bitirici': { desc: 'Forvet arketibi — Şut ve bitiricilik', boosts: ['Şut', 'Bitiricilik'] },
  'Sahte 9': { desc: 'Forvet arketibi — Vizyon, pas ve dribling', boosts: ['Vizyon', 'Pas', 'Dribling'] },
  'Pozisyoncu': { desc: 'Forvet arketibi — Boş alan ve bitiricilik', boosts: ['Boş Alan', 'Bitiricilik'] },
  'Fırsatçı': { desc: 'Forvet arketibi — Fırsatları değerlendirir', boosts: ['Boş Alan', 'Bitiricilik'] },
  'Gol makinesi': { desc: 'Forvet arketibi — Gol atma ustası', boosts: ['Şut', 'Bitiricilik', 'Boş Alan'] },
  'Fiziksel santrafor': { desc: 'Forvet arketibi — Güç ve kafa', boosts: ['Güç', 'Kafa'] },
  'Kafacı (forvet)': { desc: 'Forvet arketibi — Kafa vuruşu ve bitiricilik', boosts: ['Kafa', 'Bitiricilik'] },
};

interface TacticsCommandCenterProps {
  isAdmin?: boolean;
  userId: string;
  squad: Player[];
  activeTactic: ActiveTactic;
  onActiveTacticChange: (t: ActiveTactic) => void;
  onSquadUpdate: (s: Player[]) => void;
  playerConditions?: Record<string, number>;
  onPlayerClick?: (player: Player) => void;
  transferOffers?: Array<{ id: string; fromTeam: string; playerName: string; playerPosition: string; amount: number; status: string; date: string }>;
  onAcceptOffer?: (offerId: string) => void;
  onRejectOffer?: (offerId: string) => void;
  teamPrimaryColor?: string;
  teamSecondaryColor?: string;
  // Role system
  playerRoles?: Record<string, string>;
  onPlayerRolesChange?: (roles: Record<string, string>) => void;
  activeInstructions?: string[];
  onInstructionsChange?: (instructions: string[]) => void;
}

interface PitchPosition {
  x: number;
  y: number;
}

// Helper to darken a hex color by a given percentage
const darkenColor = (hex: string, percent: number): string => {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.max(0, (num >> 16) - Math.round(2.55 * percent));
  const g = Math.max(0, ((num >> 8) & 0x00ff) - Math.round(2.55 * percent));
  const b = Math.max(0, (num & 0x0000ff) - Math.round(2.55 * percent));
  return `#${(0x1000000 + r * 0x10000 + g * 0x100 + b).toString(16).slice(1)}`;
};

// Position group → primary kit color mapping
const POS_GROUP_COLORS: Record<string, string> = {
  GK: '#7AB4E8',
  DEF: '#7EDBC8',
  MID: '#F0C87A',
  FWD: '#E87878',
};

const POS_GROUP_SECONDARY: Record<string, string> = {
  GK: '#4A8BC2',
  DEF: '#4BB89E',
  MID: '#C9A24E',
  FWD: '#C44E4E',
};

// ── Touch drag-and-drop hook for mobile ──
interface TouchDragState {
  playerId: string;
  sourceIdx: number;
  sourceType: 'pitch' | 'bench';
  ghostEl: HTMLElement | null;
  startX: number;
  startY: number;
  isDragging: boolean;
  sourceEl: HTMLElement | null;
}

function useTouchDrag(onSwap: (srcIdx: number, srcType: 'pitch' | 'bench', tgtIdx: number, tgtType: 'pitch' | 'bench') => void) {
  const dragRef = useRef<TouchDragState | null>(null);
  const justDraggedRef = useRef(false);

  const onDocumentTouchMove = useCallback((e: TouchEvent) => {
    if (!dragRef.current) return;
    const touch = e.touches[0];

    if (!dragRef.current.isDragging) {
      const dx = touch.clientX - dragRef.current.startX;
      const dy = touch.clientY - dragRef.current.startY;
      if (Math.abs(dx) > 8 || Math.abs(dy) > 8) {
        dragRef.current.isDragging = true;
        if (dragRef.current.sourceEl) {
          const rect = dragRef.current.sourceEl.getBoundingClientRect();
          const ghost = dragRef.current.sourceEl.cloneNode(true) as HTMLElement;
          ghost.style.position = 'fixed';
          ghost.style.zIndex = '9999';
          ghost.style.pointerEvents = 'none';
          ghost.style.opacity = '0.75';
          ghost.style.width = `${rect.width}px`;
          ghost.style.height = `${rect.height}px`;
          ghost.style.left = `${touch.clientX - rect.width / 2}px`;
          ghost.style.top = `${touch.clientY - rect.height / 2}px`;
          ghost.style.transform = 'scale(1.1)';
          ghost.style.transition = 'none';
          ghost.style.boxShadow = '0 0 20px rgba(16,185,129,0.5)';
          document.body.appendChild(ghost);
          dragRef.current.ghostEl = ghost;
          dragRef.current.sourceEl.style.opacity = '0.3';
        }
      }
    }

    if (dragRef.current.isDragging) {
      e.preventDefault();
      if (dragRef.current.ghostEl) {
        const w = dragRef.current.ghostEl.offsetWidth;
        const h = dragRef.current.ghostEl.offsetHeight;
        dragRef.current.ghostEl.style.left = `${touch.clientX - w / 2}px`;
        dragRef.current.ghostEl.style.top = `${touch.clientY - h / 2}px`;
      }
    }
  }, []);

  const onDocumentTouchEnd = useCallback((e: TouchEvent) => {
    if (!dragRef.current) return;

    if (dragRef.current.sourceEl) {
      dragRef.current.sourceEl.style.opacity = '';
    }
    if (dragRef.current.ghostEl) {
      dragRef.current.ghostEl.remove();
    }

    if (dragRef.current.isDragging) {
      justDraggedRef.current = true;
      setTimeout(() => { justDraggedRef.current = false; }, 300);
      const touch = e.changedTouches[0];
      // Temporarily hide ghost to use elementFromPoint
      const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);

      const pitchEl = elementBelow?.closest('[data-pitch-idx]');
      const benchEl = elementBelow?.closest('[data-bench-idx]');

      if (pitchEl) {
        const targetIdx = parseInt(pitchEl.getAttribute('data-pitch-idx')!);
        onSwap(dragRef.current.sourceIdx, dragRef.current.sourceType, targetIdx, 'pitch');
      } else if (benchEl) {
        const targetIdx = parseInt(benchEl.getAttribute('data-bench-idx')!);
        onSwap(dragRef.current.sourceIdx, dragRef.current.sourceType, targetIdx, 'bench');
      }
    }

    document.removeEventListener('touchmove', onDocumentTouchMove);
    document.removeEventListener('touchend', onDocumentTouchEnd);
    dragRef.current = null;
  }, [onSwap, onDocumentTouchMove]);

  const handleTouchStart = useCallback((playerId: string, sourceIdx: number, sourceType: 'pitch' | 'bench') => (e: React.TouchEvent) => {
    dragRef.current = {
      playerId,
      sourceIdx,
      sourceType,
      ghostEl: null,
      startX: e.touches[0].clientX,
      startY: e.touches[0].clientY,
      isDragging: false,
      sourceEl: e.currentTarget as HTMLElement,
    };
    document.addEventListener('touchmove', onDocumentTouchMove, { passive: false });
    document.addEventListener('touchend', onDocumentTouchEnd);
  }, [onDocumentTouchMove, onDocumentTouchEnd]);

  return { handleTouchStart, justDraggedRef };
}

const PlayerIcon = ({ player, condition, pos, onDrop, onDragOver, onDragStart, onDragLeave, onClick, isDragOver, isSelected, teamPrimaryColor, teamSecondaryColor, onTouchStart, pitchIdx }: {
  player: Player;
  condition: number;
  pos: PitchPosition;
  onDrop: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragStart: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onClick?: () => void;
  isDragOver?: boolean;
  isSelected?: boolean;
  teamPrimaryColor?: string;
  teamSecondaryColor?: string;
  onTouchStart?: (e: React.TouchEvent) => void;
  pitchIdx?: number;
}) => {
  if (!player) return null;
  const displayName = toTitleCase(player.name || 'Bilinmeyen');
  
  const getRingColor = (cond: number): string => {
    if (cond >= 100) return 'rgb(34, 197, 94)';
    if (cond < 20) return 'rgb(239, 68, 68)';
    if (cond < 50) return 'rgb(234, 179, 8)';
    return 'rgba(255, 255, 255, 0.3)';
  };

  const ringColor = getRingColor(condition);

  // Team colors for outfield players, green variant for GK
  const isGoalkeeper = (player.specificPosition || player.position) === 'GK';
  const primaryColor = isGoalkeeper ? '#2E8B57' : (teamPrimaryColor || '#9B9B9B');
  const secondaryColor = isGoalkeeper ? '#1A5C3A' : (teamSecondaryColor || '#6B6B6B');
  const posCode = player.specificPosition || player.position;

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
        onTouchStart={onTouchStart}
        data-pitch-idx={pitchIdx}
        style={{ touchAction: 'none' }}
        className={`absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group cursor-grab active:cursor-grabbing ${isDragOver ? 'z-30 scale-110' : isSelected ? 'z-20 scale-110' : 'z-10'}`}
    >
        <div className="relative w-14 h-14 flex items-center justify-center">
            {/* Selection indicator for mobile tap-to-swap */}
            {isSelected && (
              <div className="absolute -inset-1 rounded-full border-2 border-amber-400 animate-pulse z-10" />
            )}
            {/* Condition ring */}
            <svg className="absolute inset-0 w-full h-full -rotate-90">
                <circle cx="28" cy="28" r="25" fill="none" stroke="rgba(0,0,0,0.1)" strokeWidth="4" />
                <circle 
                    cx="28" cy="28" r="25" 
                    fill="none" 
                    stroke={ringColor} 
                    strokeWidth={condition >= 100 ? 4 : 3}
                    strokeDasharray="157"
                    strokeDashoffset={157 * (1 - (condition || 100) / 100)}
                    className="transition-all duration-500"
                />
            </svg>
            
            {/* Football Jersey - Realistic Silhouette */}
            <div 
              className="w-12 h-[54px] relative group-hover:scale-110 transition-transform"
              style={{
                filter: `drop-shadow(0 0 1px ${secondaryColor}99) drop-shadow(0 4px 8px ${primaryColor}35) drop-shadow(0 2px 5px rgba(0,0,0,0.55))`
              }}
            >
              {/* Jersey body with silhouette clipPath — wider shoulders/sleeves, tapered waist, V-neck */}
              <div 
                className="absolute inset-0 flex flex-col items-center justify-center overflow-hidden"
                style={{
                  background: `linear-gradient(175deg, ${primaryColor} 0%, ${darkenColor(primaryColor, 10)} 35%, ${darkenColor(primaryColor, 22)} 100%)`,
                  clipPath: 'polygon(0% 8%, 0% 26%, 22% 26%, 18% 100%, 82% 100%, 78% 26%, 100% 26%, 100% 8%, 73% 0%, 58% 0%, 50% 13%, 42% 0%, 27% 0%)',
                }}
              >
                {/* Pronounced V-neck collar — secondary color */}
                <div 
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-[14px] h-[8px]"
                  style={{ 
                    background: `linear-gradient(180deg, ${secondaryColor}dd 0%, ${secondaryColor}55 65%, transparent 100%)`,
                    clipPath: 'polygon(0 0, 100% 0, 66% 100%, 34% 100%)',
                  }}
                />
                {/* Collar outline rim */}
                <div 
                  className="absolute top-[1px] left-1/2 -translate-x-1/2 w-[16px] h-[3px]"
                  style={{ 
                    background: `${secondaryColor}40`,
                    clipPath: 'polygon(5% 0, 95% 0, 70% 100%, 30% 100%)',
                  }}
                />
                {/* Left sleeve accent stripe */}
                <div className="absolute left-0 top-[10%] w-[20%] h-[5%]" style={{ background: `${secondaryColor}45` }} />
                {/* Left sleeve cuff */}
                <div className="absolute left-0 top-[22%] w-[20%] h-[3%]" style={{ background: `${secondaryColor}70` }} />
                {/* Right sleeve accent stripe */}
                <div className="absolute right-0 top-[10%] w-[20%] h-[5%]" style={{ background: `${secondaryColor}45` }} />
                {/* Right sleeve cuff */}
                <div className="absolute right-0 top-[22%] w-[20%] h-[3%]" style={{ background: `${secondaryColor}70` }} />
                {/* Horizontal kit stripe pattern */}
                <div 
                  className="absolute inset-0 opacity-[0.06]"
                  style={{
                    background: `repeating-linear-gradient(0deg, transparent, transparent 3px, ${secondaryColor} 3px, ${secondaryColor} 4px)`
                  }}
                />
                {/* Team badge on left chest */}
                <div 
                  className="absolute left-[22%] top-[33%] w-[5px] h-[5px] rounded-full"
                  style={{ background: `${secondaryColor}cc`, boxShadow: `0 0 2px ${secondaryColor}80` }}
                />
                {/* Large squad number — watermark style behind position */}
                <span 
                  className="absolute top-[30%] text-[17px] font-black text-white/20 leading-none tracking-tighter select-none"
                  style={{ textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}
                >
                  {player.rating}
                </span>
                {/* Position code at bottom */}
                <span 
                  className="absolute bottom-[8%] text-[10px] font-black text-white tracking-tight leading-none z-10"
                  style={{ textShadow: '0 1px 3px rgba(0,0,0,0.6)' }}
                >
                  {posCode}
                </span>
              </div>
            </div>
        </div>
        {/* Enhanced 3D depth shadow underneath */}
        <div className="w-11 h-[6px] bg-black/20 rounded-[50%] blur-[3px] mx-auto -mt-1" />
        <div className="mt-0.5 bg-black/80 backdrop-blur-sm text-white px-2 py-0.5 shadow-xl border border-white/10 min-w-[52px] max-w-[92px] rounded-sm">
            <span className="text-[10px] font-black tracking-tight block text-center leading-tight uppercase">{displayName}</span>
        </div>
    </motion.div>
  );
};

export default function TacticsCommandCenter({ 
  activeTactic, onActiveTacticChange, squad, onSquadUpdate, playerConditions = {}, onPlayerClick, transferOffers, onAcceptOffer, onRejectOffer, teamPrimaryColor, teamSecondaryColor,
  playerRoles: externalRoles, onPlayerRolesChange, activeInstructions: externalInstructions, onInstructionsChange
}: TacticsCommandCenterProps) {
  const [hoveredInfo, setHoveredInfo] = useState<string | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<string>('Poz');
  // ── Touch/Mobile: Tap-to-select & swap ──
  const [selectedForSwap, setSelectedForSwap] = useState<{ type: 'pitch' | 'bench'; idx: number; playerId: string } | null>(null);
  // ── Position-based player selection modal ──
  const [positionPicker, setPositionPicker] = useState<{ targetIdx: number; positionGroup: string; targetSlot: 'pitch' | 'bench' } | null>(null);

  // ── Shared swap logic (used by both tap-to-swap and touch drag) ──
  const performSwap = useCallback((srcIdx: number, srcType: 'pitch' | 'bench', tgtIdx: number, tgtType: 'pitch' | 'bench') => {
    if (srcType === tgtType && srcIdx === tgtIdx) return;
    let newSquad = [...squad];
    if (srcType === 'bench' && tgtType === 'pitch') {
      const temp = newSquad[srcIdx];
      newSquad[srcIdx] = newSquad[tgtIdx];
      newSquad[tgtIdx] = temp;
    } else if (srcType === 'pitch' && tgtType === 'bench') {
      const temp = newSquad[srcIdx];
      newSquad[srcIdx] = newSquad[tgtIdx];
      newSquad[tgtIdx] = temp;
    } else {
      const temp = newSquad[srcIdx];
      newSquad[srcIdx] = newSquad[tgtIdx];
      newSquad[tgtIdx] = temp;
    }
    newSquad = newSquad.map((p, i) => ({ ...p, is_starter: i < 11 }));
    onSquadUpdate(newSquad);
    setSelectedForSwap(null);
  }, [squad, onSquadUpdate]);

  // ── Touch drag-and-drop hook ──
  const { handleTouchStart: touchDragStart, justDraggedRef } = useTouchDrag(performSwap);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [hoveredPlayerId, setHoveredPlayerId] = useState<string | null>(null);
  // New: sub-view (squad management vs role assignment)
  const [activeView, setActiveView] = useState<'squad' | 'roles'>('squad');
  // Role state — use external if provided, else local
  const [localRoles, setLocalRoles] = useState<Record<string, string>>({});
  const [localInstructions, setLocalInstructions] = useState<string[]>([]);
  const playerRoles = externalRoles ?? localRoles;
  const activeInstructions = externalInstructions ?? localInstructions;
  const handleRoleChange = (playerId: string, roleId: string) => {
    const updated = { ...playerRoles, [playerId]: roleId };
    if (onPlayerRolesChange) onPlayerRolesChange(updated);
    else setLocalRoles(updated);
  };
  const handleInstructionToggle = (instructionId: string) => {
    const updated = activeInstructions.includes(instructionId)
      ? activeInstructions.filter(i => i !== instructionId)
      : [...activeInstructions, instructionId];
    if (onInstructionsChange) onInstructionsChange(updated);
    else setLocalInstructions(updated);
  };
  // Tactical score
  const tacticalScore = useMemo(() => {
    try {
      if (!squad.length) return null;
      const starters = squad.slice(0, 11);
      // Build SquadSlot[] for calculateTacticalScore
      const squadSlots = starters.map(p => ({
        player: p,
        position: (p.specificPosition || p.position) as any,
        roleId: playerRoles[p.id] || 'no_role',
      }));
      const tacticConfig = {
        formation: activeTactic.formation || '4-4-2',
        instructions: activeInstructions.map(i => ({ instructionName: i, option: 'on' })),
        playStyle: (activeTactic as any).playStyle,
      };
      return calculateTacticalScore(squadSlots, tacticConfig);
    } catch { return null; }
  }, [squad, playerRoles, activeInstructions, activeTactic]);

  const getStatValue = (player: Player, key: string): number => {
    const rating = player.rating || 50;
    switch (key) {
      case 'Poz': return 0; // handled separately
      case 'Oyuncu': return 0; // handled separately
      case 'Klt': return Math.round(player.potential || rating);
      case 'Klc': return Math.round(player.goalkeeping || (player.position === 'GK' ? rating * 1.05 : rating * 0.12));
      case 'Tk': return Math.round(player.defending || rating);
      case 'Pas': return Math.round(player.passing || rating);
      case 'Şut': return Math.round(player.shooting || rating);
      case 'Kfa': return Math.round(player.heading || rating * 0.95);
      case 'Hız': return Math.round(player.speed || rating);
      case 'Güç': return Math.round(player.power || rating);
      case 'Alg': return Math.round(player.vision || rating);
      case 'Top': return Math.round(player.control || rating);
      case 'Tplm': return Math.round(rating * 11.2);
      case 'Knd': return Math.round(player.cond || 100);
      case 'rating': return rating;
      default: return rating;
    }
  };

  const sortedSquad = useMemo(() => {
    const list = [...squad];
    const posOrder = POS_ORDER;
    if (sortBy === 'Oyuncu') {
      list.sort((a, b) => sortDirection === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name));
    } else if (sortBy === 'Poz') {
      list.sort((a, b) => {
        const oA = posOrder[a.specificPosition || a.position] ?? 99;
        const oB = posOrder[b.specificPosition || b.position] ?? 99;
        // Aynı grupta OVR'ye göre azalan
        if (oA === oB) return b.rating - a.rating;
        return sortDirection === 'asc' ? oA - oB : oB - oA;
      });
    } else {
      list.sort((a, b) => {
        const vA = getStatValue(a, sortBy);
        const vB = getStatValue(b, sortBy);
        if (vA !== vB) return sortDirection === 'asc' ? vA - vB : vB - vA;
        // Eşitse mevki grubu sırasına göre
        const oA = posOrder[a.specificPosition || a.position] ?? 99;
        const oB = posOrder[b.specificPosition || b.position] ?? 99;
        return oA - oB;
      });
    }
    return list;
  }, [squad, sortBy, sortDirection]);

  const toggleSort = (key: string) => {
    if (sortBy === key) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(key);
      setSortDirection('desc');
    }
  };

  const getPositionColor = (position: string): string => {
    const rowStyle = getPosRowStyle(position);
    const group = getPosGroup(position);
    const textColor = group === 'GK' ? 'text-[#7AB4E8]' : group === 'DEF' ? 'text-[#7EDBC8]' : group === 'MID' ? 'text-[#F0C87A]' : group === 'FWD' ? 'text-[#E87878]' : 'text-[#9B9B9B]';
    return `${rowStyle} ${textColor}`;
  };

  const players = squad.slice(0, 11);
  const bench = squad.slice(11);

  // ── Position group labels ──
  const POS_GROUP_LABELS: Record<string, string> = {
    GK: 'Kaleci',
    DEF: 'Defans',
    MID: 'Orta Saha',
    FWD: 'Forvet',
  };

  // ── Get position group for a player ──
  const getPlayerPosGroup = (p: Player): string => {
    return POS_TO_GROUP[(p.specificPosition || p.position) as keyof typeof POS_TO_GROUP] || 'MID';
  };


  // ── Get position group from FORMATION SLOT (not player) ──
  // [BUG-24] Forvet slot'una tıklayınca forvetler listelenmeli, defanslar değil
  const getSlotPosGroup = (formation: string, slotIdx: number): string => {
    const parts = formation.split('-');
    const defCount = parseInt(parts[0]) || 4;
    const midCount = parseInt(parts[1]) || 4;
    // fwdCount = parts[2] || (parts.length > 3 ? parts[3] : parts[2]) — bazı dizilişler 4 parçalı (4-2-3-1)
    let fwdCount = 1;
    if (parts.length === 3) fwdCount = parseInt(parts[2]) || 1;
    else if (parts.length === 4) fwdCount = parseInt(parts[3]) || 1;

    // GK: index 0
    // DEF: index 1..defCount
    // MID: index defCount+1..defCount+midCount
    // FWD: index defCount+midCount+1..defCount+midCount+fwdCount
    if (slotIdx === 0) return 'GK';
    if (slotIdx <= defCount) return 'DEF';
    if (slotIdx <= defCount + midCount) return 'MID';
    return 'FWD';
  };

  // ── Get players of same position group (for swap) ──
  const getPlayersForPositionGroup = (group: string): Player[] => {
    if (group === 'ALL') return [...squad];
    return squad.filter(p => getPlayerPosGroup(p) === group);
  };

  // ── Handle position-based player selection ──
  const handlePositionPick = (pickedPlayerId: string) => {
    if (!positionPicker) return;
    const { targetIdx, targetSlot } = positionPicker;
    const pickedIdx = squad.findIndex(p => p.id === pickedPlayerId);
    if (pickedIdx === -1 || pickedIdx === targetIdx) {
      setPositionPicker(null);
      return;
    }

    let newSquad = [...squad];
    const temp = newSquad[targetIdx];
    newSquad[targetIdx] = newSquad[pickedIdx];
    newSquad[pickedIdx] = temp;
    newSquad = newSquad.map((p, i) => ({ ...p, is_starter: i < 11 }));
    onSquadUpdate(newSquad);
    setPositionPicker(null);
  };

  // ═══ Takım Kimya Skoru ═══
  const teamChemistry = useMemo(() => {
    if (!players || players.length === 0) return null;
    const avg = Math.round(
      players.reduce((s, p) => s + ((p as any).chemistry || 70), 0) / players.length
    );
    const label = avg >= 80 ? 'Mükemmel' : avg >= 65 ? 'İyi' : avg >= 50 ? 'Orta' : 'Zayıf';
    const color = avg >= 80 ? 'text-emerald-400' : avg >= 65 ? 'text-amber-400' : avg >= 50 ? 'text-orange-400' : 'text-red-400';
    return { avg, label, color };
  }, [players]);

  // ═══ Taktik Kaydet/Yükle ═══
  const [savedTactics, setSavedTactics] = useState<
    { name: string; formation: string; mentality: number; pressing: boolean; timestamp: string }[]
  >([]);
  const [showSavedPanel, setShowSavedPanel] = useState(false);

  useEffect(() => {
    try {
      const stored = (typeof window !== "undefined" && localStorage).getItem('savedTactics');
      if (stored) setSavedTactics(JSON.parse(stored));
    } catch (e) { console.warn("[silent-catch]", e); }
  }, []);

  const handleSaveTactic = (name: string) => {
    const newTactic = {
      name,
      formation: activeTactic.formation || '4-4-2',
      mentality: activeTactic.mentality || 3,
      pressing: activeTactic.pressing || false,
      timestamp: new Date().toISOString(),
    };
    const updated = [...savedTactics.filter(t => t.name !== name), newTactic].slice(-5);
    setSavedTactics(updated);
    if (typeof window !== 'undefined') {
      (typeof window !== "undefined" && localStorage).setItem('savedTactics', JSON.stringify(updated));
    }
  };

  const tacticalParams = [
    { label: 'Hücum Hattı', key: 'lineHeight', type: 'slider', min: 0, max: 100, info: "Savunma hattının saha derinliğindeki konumunu belirler." },
    { label: 'Oyun Genişliği', key: 'width', type: 'slider', min: 0, max: 100, info: "Takımın saha yayılım genişliğini belirler." },
    { label: 'Sertlik Seviyesi', key: 'aggression', type: 'slider', min: 0, max: 100, info: "Top çalma ve ikili mücadelelerdeki müdahale sertliğini belirler." },
    { label: 'Pas Şiddeti', key: 'passingIntensity', type: 'slider', min: 0, max: 100, info: "Pasların hızını ve mesafesini belirler." },
  ];

  const toggles = [
    { label: 'Tam Saha Pres', key: 'pressing', icon: <Flame size={14} className="text-emerald-400" />, info: "Tüm saha boyunca yoğun baskı uygulanır. Kondisyonu hızla tüketir." },
    { label: 'Kaleciyi Perdele', key: 'screenKeeper', icon: <Target size={14} className="text-blue-400" />, info: "Kornerlerde bir oyuncuyu rakip kaleci dairesinin üzerine sabitler." },
    { label: 'Zamana Oyna', key: 'wasteTime', icon: <Clock size={14} className="text-amber-400" />, info: "Skor üstünlüğü varken oyun hızını yavaşlatır." },
    { label: 'Otobüs Çek', key: 'parkTheBus', icon: <Shield size={14} className="text-red-400" />, info: "Tamamen savunma odaklı yerleşim. Hücum gücü azalır, savunma direnci artar." },
    { label: 'Orta Açma Oyunu', key: 'crossGame', icon: <Swords size={14} className="text-cyan-400" />, info: "Kanat bekleri ve açıklar sürekli orta arar." },
    { label: 'Tek Forvet Kontra', key: 'loneStrikerCounter', icon: <Zap size={14} className="text-yellow-400" />, info: "Savunmada kalıp sadece tek forvetle hızlı çıkışlar denenir." },
    { label: 'Ofsayt Tuzağı', key: 'offsideTrap', icon: <Shield size={14} className="text-purple-400" />, info: "Savunma hattı birlikte ileri atarak rakip forvetleri ofsayta düşürür. Konsantrasyon ve zamanlama kritik. Hata = gol riski." },
  ];

  const posRoles: Record<string, { id: string; label: string; color: string; info: string }[]> = {
    GK: [
      { id: 'standard_gk', label: 'Geleneksel Kaleci', color: 'text-white', info: "Kalesini terk etmez, çizgi performansına odaklanır." },
      { id: 'sweeper_gk', label: 'Libero Kaleci (SK)', color: 'text-emerald-400', info: "Savunma arkasına sarkan topları süpürür, oyun kurmaya katılır." }
    ],
    DEF: [
      { id: 'bpd', label: 'Pasör Stoper (BPD)', color: 'text-blue-400', info: "Savunmadan oyun kurma becerisi %20 artar." },
      { id: 'wingback', label: 'Hücumcu Bek (WB)', color: 'text-yellow-400', info: "Kanat bindirmeleriyle ofansa destek verir." },
      { id: 'stopper', label: 'Kesici (Stopper)', color: 'text-red-400', info: "Rakip forveti fiziksel olarak sindirmeye çalışır." },
      { id: 'enforcer', label: 'Kasap (Enforcer)', color: 'text-red-600', info: "Sadece rakibi durdurmaya odaklanır, sertliği artırır." }
    ],
    MID: [
      { id: 'bwm', label: 'Savaşçı (BWM)', color: 'text-red-500', info: "Orta sahada dinamizm ve top kapma odaklı oynar." },
      { id: 'dlp', label: 'Oyun Kurucu (DLP)', color: 'text-blue-500', info: "Derinden oyunun yönünü tayin eder." },
      { id: 'btb', label: 'İki Yönlü (BTB)', color: 'text-emerald-500', info: "Hem savunma hem hücumda her yerde bulunur." },
      { id: 'mezzala', label: 'Mezzala', color: 'text-purple-400', info: "İç kanat boşluklarına sızarak skor katkısı arar." },
      { id: 'playmaker', label: 'Beyin (Playmaker)', color: 'text-blue-300', info: "Oyunun tüm kontrolünü üstlenir, pas isabetini artırır." }
    ],
    FWD: [
      { id: 'advanced_fwd', label: 'Fırsatçı (AF)', color: 'text-yellow-500', info: "Savunma hattını zorlar ve bitiriciliği odak noktasıdır." },
      { id: 'target_man', label: 'Hedef Santrafor (TM)', color: 'text-orange-500', info: "Hava toplarında hakimiyet kurar, top saklar." },
      { id: 'false_nine', label: 'Sahte Dokuz (F9)', color: 'text-blue-300', info: "Orta sahaya gelerek savunmayı üstüne çeker." },
      { id: 'inside_fwd', label: 'Ters Kanat (IF)', color: 'text-cyan-400', info: "Kanattan içeri katederek şut imkanı arar." },
      { id: 'sprinter', label: 'Sprinter', color: 'text-amber-400', info: "Kontra ataklarda normal hızının %115'ine çıkar." }
    ]
  };

  const getPitchPositions = (formation: string): PitchPosition[] => {
    const gk = { x: 50, y: 88 };
    const defs = formation === '3-5-2' || formation === '3-4-3' || formation === '3-1-4-2' || formation === '3-3-3-1' ? [{ x: 25, y: 73 }, { x: 50, y: 76 }, { x: 75, y: 73 }] : 
                 formation === '5-4-1' || formation === '5-3-2' ? [{ x: 15, y: 70 }, { x: 32, y: 73 }, { x: 50, y: 75 }, { x: 68, y: 73 }, { x: 85, y: 70 }] : 
                 [{ x: 15, y: 70 }, { x: 38, y: 73 }, { x: 62, y: 73 }, { x: 85, y: 70 }];
    
    let mids: PitchPosition[] = [];
    if (formation === '4-3-3') mids = [{ x: 25, y: 45 }, { x: 50, y: 48 }, { x: 75, y: 45 }];
    else if (formation === '3-5-2') mids = [{ x: 10, y: 45 }, { x: 30, y: 48 }, { x: 50, y: 50 }, { x: 70, y: 48 }, { x: 90, y: 45 }];
    else if (formation === '4-2-3-1') mids = [{ x: 35, y: 55 }, { x: 65, y: 55 }, { x: 20, y: 35 }, { x: 50, y: 32 }, { x: 80, y: 35 }];
    else if (formation === '3-4-3') mids = [{ x: 15, y: 50 }, { x: 38, y: 53 }, { x: 62, y: 53 }, { x: 85, y: 50 }];
    else if (formation === '4-1-4-1') mids = [{ x: 50, y: 58 }, { x: 20, y: 40 }, { x: 40, y: 42 }, { x: 60, y: 42 }, { x: 80, y: 40 }];
    else if (formation === '4-3-2-1') mids = [{ x: 25, y: 50 }, { x: 50, y: 52 }, { x: 75, y: 50 }, { x: 35, y: 32 }, { x: 65, y: 32 }];
    else if (formation === '5-3-2') mids = [{ x: 25, y: 48 }, { x: 50, y: 50 }, { x: 75, y: 48 }];
    else if (formation === '4-3-1-2') mids = [{ x: 25, y: 52 }, { x: 50, y: 55 }, { x: 75, y: 52 }, { x: 50, y: 35 }];
    else if (formation === '3-1-4-2') mids = [{ x: 50, y: 60 }, { x: 15, y: 45 }, { x: 38, y: 48 }, { x: 62, y: 48 }, { x: 85, y: 45 }];
    else if (formation === '4-4-1-1') mids = [{ x: 15, y: 45 }, { x: 38, y: 48 }, { x: 62, y: 48 }, { x: 85, y: 45 }, { x: 50, y: 32 }];
    else if (formation === '4-5-1') mids = [{ x: 10, y: 45 }, { x: 30, y: 48 }, { x: 50, y: 50 }, { x: 70, y: 48 }, { x: 90, y: 45 }];
    else if (formation === '3-3-3-1') mids = [{ x: 25, y: 55 }, { x: 50, y: 58 }, { x: 75, y: 55 }, { x: 25, y: 35 }, { x: 50, y: 38 }, { x: 75, y: 35 }];
    else mids = [{ x: 15, y: 45 }, { x: 38, y: 48 }, { x: 62, y: 48 }, { x: 85, y: 45 }];

    let fwds: PitchPosition[] = [];
    if (formation === '4-3-3') fwds = [{ x: 20, y: 18 }, { x: 50, y: 13 }, { x: 80, y: 18 }];
    else if (formation === '3-5-2' || formation === '5-3-2' || formation === '4-3-1-2' || formation === '3-1-4-2') fwds = [{ x: 35, y: 18 }, { x: 65, y: 18 }];
    else if (formation === '5-4-1' || formation === '4-1-4-1' || formation === '4-3-2-1' || formation === '4-4-1-1' || formation === '4-5-1' || formation === '3-3-3-1') fwds = [{ x: 50, y: 18 }];
    else if (formation === '4-2-3-1') fwds = [{ x: 50, y: 15 }];
    else if (formation === '3-4-3') fwds = [{ x: 20, y: 22 }, { x: 50, y: 18 }, { x: 80, y: 22 }];
    else fwds = [{ x: 35, y: 18 }, { x: 65, y: 18 }];

    return [gk, ...defs, ...mids, ...fwds];
  };

  const handlePitchDrop = (targetIdx: number) => (e: React.DragEvent) => {
    e.preventDefault();
    const playerInId = e.dataTransfer.getData("playerId");
    const sourceIdx = e.dataTransfer.getData("sourceIdx");

    let newSquad = [...squad];
    if (sourceIdx !== '' && parseInt(sourceIdx) !== targetIdx) {
      const temp = newSquad[targetIdx];
      newSquad[targetIdx] = newSquad[parseInt(sourceIdx)];
      newSquad[parseInt(sourceIdx)] = temp;
    } else if (sourceIdx === '') {
      const inPIdx = squad.findIndex(p => p.id === playerInId);
      if (inPIdx !== -1) {
        const inP = newSquad[inPIdx];
        const outP = newSquad[targetIdx];
        newSquad[targetIdx] = inP;
        newSquad[inPIdx] = outP;
      }
    }

    // Mark starters
    newSquad = newSquad.map((p, idx) => ({
      ...p,
      is_starter: idx < 11
    }));

    onSquadUpdate(newSquad);
    setDragOverIdx(null);
  };

  // ── Touch/Mobile: Tap-to-swap logic ──
  const handleTapPlayer = (type: 'pitch' | 'bench', idx: number) => {
    if (!selectedForSwap) {
      // First tap: select this player
      const player = type === 'pitch' ? squad[idx] : squad[idx];
      if (player) {
        setSelectedForSwap({ type, idx, playerId: player.id });
      }
      return;
    }

    // Second tap: swap with the selected player
    if (selectedForSwap.type === type && selectedForSwap.idx === idx) {
      // Tapped same player — deselect
      setSelectedForSwap(null);
      return;
    }

    let newSquad = [...squad];
    const srcIdx = selectedForSwap.idx;
    const tgtIdx = idx;

    if (selectedForSwap.type === 'bench' && type === 'pitch') {
      // Bench → Pitch: swap bench player into pitch position
      const benchPlayer = newSquad[srcIdx];
      const pitchPlayer = newSquad[tgtIdx];
      newSquad[tgtIdx] = benchPlayer;
      newSquad[srcIdx] = pitchPlayer;
    } else if (selectedForSwap.type === 'pitch' && type === 'bench') {
      // Pitch → Bench: swap pitch player into bench position
      const pitchPlayer = newSquad[srcIdx];
      const benchPlayer = newSquad[tgtIdx];
      newSquad[srcIdx] = benchPlayer;
      newSquad[tgtIdx] = pitchPlayer;
    } else if (selectedForSwap.type === 'pitch' && type === 'pitch') {
      // Pitch → Pitch: swap two pitch players
      const temp = newSquad[srcIdx];
      newSquad[srcIdx] = newSquad[tgtIdx];
      newSquad[tgtIdx] = temp;
    } else {
      // Bench → Bench: swap two bench players
      const temp = newSquad[srcIdx];
      newSquad[srcIdx] = newSquad[tgtIdx];
      newSquad[tgtIdx] = temp;
    }

    // Mark starters
    newSquad = newSquad.map((p, i) => ({ ...p, is_starter: i < 11 }));
    onSquadUpdate(newSquad);
    setSelectedForSwap(null);
  };

  const pitchPos = getPitchPositions(activeTactic.formation || '4-4-2');

  return (
    <div className="space-y-4">

      {/* ── View Switcher + Tactical Score ──────────────────────────────── */}
      <div className="flex items-center justify-between gap-4 px-1">
        <div className="flex bg-black/40 border border-white/8 rounded-xl p-1 gap-1">
          {([
            { id: 'squad', label: 'Kadro & Taktik', icon: <Users size={13} /> },
            { id: 'roles', label: 'Roller & Talimatlar', icon: <Star size={13} /> },
          ] as const).map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveView(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[11px] font-black uppercase tracking-wider transition-all ${
                activeView === tab.id
                  ? 'bg-white text-black shadow-sm'
                  : 'text-white/40 hover:text-white/70'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tactical Score Card — detaylı (TacticsRolesPanel'den taşındı) */}
        {tacticalScore && (
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
            <div className="flex items-center gap-2 mb-3">
              <Star className="w-4 h-4 text-amber-400" />
              <h3 className="text-xs font-bold uppercase tracking-widest text-white/70">
                Taktik Puanı
              </h3>
            </div>

            {/* Overall score ring + sub-scores */}
            <div className="flex items-center gap-5 mb-4">
              {/* Ring */}
              <div className="relative w-20 h-20 shrink-0">
                <svg className="w-20 h-20 -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
                  <circle
                    cx="50" cy="50" r="40" fill="none"
                    className={
                      tacticalScore.overall >= 75 ? 'text-emerald-400' :
                      tacticalScore.overall >= 55 ? 'text-amber-400' : 'text-red-400'
                    }
                    stroke="currentColor"
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 40}
                    strokeDashoffset={2 * Math.PI * 40 - (tacticalScore.overall / 100) * 2 * Math.PI * 40}
                    style={{ transition: 'stroke-dashoffset 0.8s ease' }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className={`text-xl font-black ${
                    tacticalScore.overall >= 75 ? 'text-emerald-400' :
                    tacticalScore.overall >= 55 ? 'text-amber-400' : 'text-red-400'
                  }`}>
                    {tacticalScore.overall}
                  </span>
                </div>
              </div>

              {/* Sub-scores */}
              <div className="space-y-1.5 flex-1 min-w-0">
                {[
                  { label: 'Rol Uyumu', v: tacticalScore.roleCompatibility },
                  { label: 'Talimat Sinerjisi', v: tacticalScore.instructionSynergy },
                  { label: 'Özellik Uyumu', v: tacticalScore.attributeFit },
                ].map(({ label, v }) => (
                  <div key={label} className="flex items-center gap-2">
                    <div className="text-[10px] text-white/40 w-24">{label}</div>
                    <div className="h-1.5 flex-1 bg-white/5 rounded-full overflow-hidden max-w-[80px]">
                      <div
                        className={`h-full rounded-full ${
                          v >= 75 ? 'bg-emerald-400' :
                          v >= 55 ? 'bg-amber-400' : 'bg-red-400'
                        }`}
                        style={{ width: `${v}%` }}
                      />
                    </div>
                    <div className="text-[10px] text-white/60 tabular-nums w-6">{v}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Strengths & Weaknesses */}
            {tacticalScore.breakdown?.strengths?.length > 0 && (
              <div className="mb-2">
                <p className="text-[10px] text-emerald-400/60 uppercase tracking-widest font-bold mb-1">
                  Güçlü Yönler
                </p>
                {tacticalScore.breakdown.strengths.map((s: string, i: number) => (
                  <div key={i} className="flex items-center gap-1.5 mb-0.5">
                    <Check className="w-3 h-3 text-emerald-400/50 shrink-0" />
                    <span className="text-[10px] text-white/40">{s}</span>
                  </div>
                ))}
              </div>
            )}
            {tacticalScore.breakdown?.weaknesses?.length > 0 && (
              <div>
                <p className="text-[10px] text-red-400/60 uppercase tracking-widest font-bold mb-1">
                  Zayıf Yönler
                </p>
                {tacticalScore.breakdown.weaknesses.map((w: string, i: number) => (
                  <div key={i} className="flex items-center gap-1.5 mb-0.5">
                    <AlertTriangle className="w-3 h-3 text-red-400/50 shrink-0" />
                    <span className="text-[10px] text-white/40">{w}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Roles & Instructions View ──────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {activeView === 'roles' && (
          <motion.div
            key="roles"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            <TacticsRolesPanel
              squad={squad.slice(0, 11)}
              currentFormation={activeTactic.formation || '4-4-2'}
              onFormationChange={(f) => onActiveTacticChange({ ...activeTactic, formation: f })}
              playerRoles={playerRoles}
              onRoleChange={handleRoleChange}
              activeInstructions={activeInstructions}
              onToggleInstruction={handleInstructionToggle}
            />
          </motion.div>
        )}

        {/* ── Squad & Tactic View (original content) ────────────────────── */}
        {activeView === 'squad' && (
          <motion.div
            key="squad"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6">
        
        {/* Left: Toggles & Stats (4 cols) */}
        <div className="md:col-span-4 lg:col-span-4 xl:col-span-4 p-4 md:p-6 bg-zinc-900/80 backdrop-blur-xl border border-white/5 rounded-3xl space-y-6 md:space-y-8 h-full">
           <div className="border-b border-white/5 pb-4">
              <h3 className="text-xl font-black italic text-white uppercase tracking-tighter flex items-center gap-2">
                <Swords className="text-emerald-500" /> Taktik Lab
              </h3>
              <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.3em]">Operasyonel Parametreler</p>
           </div>

           <div className="space-y-6">
             <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Diziliş', val: activeTactic.formation || '4-4-2', key: 'formation', options: ['4-4-2', '4-3-3', '4-2-3-1', '4-1-4-1', '4-5-1', '4-3-2-1', '4-4-1-1', '4-3-1-2', '3-5-2', '3-4-3', '3-1-4-2', '3-3-3-1', '5-4-1', '5-3-2'] },
                  { label: 'Tarz', val: activeTactic.playStyle, key: 'playStyle', options: ['dengeli', 'hucum', 'savunma', 'kontra', 'tikitaka', 'Gegenpressing', 'Catenaccio', 'Direct Play', 'Wing Play', 'Total Football', 'Route One', 'Possession Football', 'High Press', 'Parking the Bus'] },
                ].map(ctrl => (
                  <div key={ctrl.key} className="space-y-1.5">
                    <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] block">{ctrl.label}</label>
                    <select 
                      value={ctrl.val}
                      onChange={(e) => onActiveTacticChange({ ...activeTactic, [ctrl.key]: e.target.value })}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-white outline-none focus:border-emerald-500/50 transition-colors"
                    >
                      {ctrl.options.map(opt => <option key={opt} value={opt}>{opt.toUpperCase()}</option>)}
                    </select>
                  </div>
                ))}
             </div>

             <div className="space-y-5">
                {tacticalParams.map(param => (
                  <div key={param.key} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">{param.label}</label>
                      <span className="text-[10px] font-mono text-emerald-400 font-bold">{(activeTactic as any)[param.key]}%</span>
                    </div>
                    <input 
                      type="range" min={param.min} max={param.max}
                      value={(activeTactic as any)[param.key]}
                      onChange={(e) => onActiveTacticChange({ ...activeTactic, [param.key]: parseInt(e.target.value) })}
                      className="w-full h-1 bg-white/10 rounded-full appearance-none accent-emerald-500"
                    />
                  </div>
                ))}
             </div>

             <div className="grid grid-cols-2 gap-2 pt-4">
                {toggles.map(t => (
                  <button
                    key={t.key}
                    onClick={() => {
                      const nextValue = !(activeTactic as any)[t.key];
                      const newTactic = { ...activeTactic, [t.key]: nextValue };
                      
                      // Mutual exclusivity logic
                      if (nextValue) {
                        if (t.key === 'pressing') {
                          (newTactic as any).parkTheBus = false;
                          (newTactic as any).wasteTime = false;
                        } else if (t.key === 'parkTheBus') {
                          (newTactic as any).pressing = false;
                          (newTactic as any).offsideTrap = false;
                        } else if (t.key === 'wasteTime') {
                          (newTactic as any).pressing = false;
                        } else if (t.key === 'offsideTrap') {
                          (newTactic as any).parkTheBus = false;
                        }
                      }
                      
                      onActiveTacticChange(newTactic);
                    }}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-[10px] font-black uppercase tracking-wider transition-all ${
                      (activeTactic as any)[t.key] ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' : 'bg-black/20 border-white/5 text-white/30'
                    }`}
                  >
                    {t.icon} {t.label}
                  </button>
                ))}
             </div>

             {/* ── Taktik Kaydet/Yükle ── */}
             <div className="flex gap-2 mt-2">
               <button
                 className="flex-1 text-[10px] border border-white/10 text-white/40 hover:text-white py-1.5 rounded-lg"
                 onClick={() => {
                   const name = prompt('Taktik adı:');
                   if (name) handleSaveTactic(name.trim());
                 }}
               >
                 💾 Kaydet
               </button>
               {savedTactics.length > 0 && (
                 <button
                   className="flex-1 text-[10px] border border-amber-500/20 text-amber-400/70 hover:text-amber-400 py-1.5 rounded-lg"
                   onClick={() => setShowSavedPanel(!showSavedPanel)}
                 >
                   📂 Yükle ({savedTactics.length})
                 </button>
               )}
             </div>

             {showSavedPanel && (
               <div className="space-y-1 mt-2">
                 {savedTactics.map((t, i) => (
                   <button
                     key={i}
                     className="w-full flex justify-between items-center px-3 py-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10"
                     onClick={() => {
                       onActiveTacticChange({ ...activeTactic, formation: t.formation, mentality: t.mentality, pressing: t.pressing });
                       setShowSavedPanel(false);
                     }}
                   >
                     <span className="text-[10px] text-white font-bold">{t.name}</span>
                     <span className="text-[10px] text-white/30">{t.formation} M{t.mentality}</span>
                   </button>
                 ))}
               </div>
             )}
           </div>
        </div>

        {/* Center: Full Interactive Pitch (5 cols) */}
        <div className="md:col-span-8 lg:col-span-5 xl:col-span-5 flex flex-col gap-2">
          {/* ── Takım Kimyası ── */}
          {teamChemistry && (
            <div className="flex items-center justify-between px-3 py-2 bg-white/[0.02] border border-white/5 rounded-lg">
              <span className="text-[10px] text-white/30 uppercase tracking-wider">Takım Kimyası</span>
              <span className={`text-[11px] font-black ${teamChemistry.color}`}>
                {teamChemistry.avg}/100 · {teamChemistry.label}
              </span>
            </div>
          )}
          <div className="relative aspect-[2/3] xl:aspect-auto bg-[#1a472a] border-4 border-white/20 rounded-[2.5rem] overflow-hidden shadow-2xl min-h-[400px] md:min-h-[600px]">
           <div className="absolute inset-0 opacity-20"><div className="h-full w-full bg-[repeating-linear-gradient(0deg,rgba(0,0,0,0.1),rgba(0,0,0,0.1)_40px,transparent_40px,transparent_80px)]" /></div>
           <div className="absolute inset-4 border-2 border-white/20 rounded-xl" />
           <div className="absolute inset-x-4 top-1/2 h-0.5 bg-white/20" />
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-2 border-white/20 rounded-full" />
           <div className="absolute inset-x-1/4 top-4 h-32 border-2 border-white/20" />
           <div className="absolute inset-x-1/4 bottom-4 h-32 border-2 border-white/20" />

           {players.map((player, idx) => {
              const pos = pitchPos[idx] || { x: 50, y: 50 };
              const isSelected = selectedForSwap?.type === 'pitch' && selectedForSwap?.idx === idx;
              const iconProps = {
                player,
                condition: playerConditions[player.id] || 100,
                pos,
                onDragOver: (e: React.DragEvent) => { e.preventDefault(); setDragOverIdx(idx); },
                onDragLeave: () => { setDragOverIdx(null); },
                onDragStart: (e: React.DragEvent) => {
                  e.dataTransfer.setData('playerId', player.id);
                  e.dataTransfer.setData('sourceIdx', String(idx));
                },
                onDrop: handlePitchDrop(idx),
                onClick: () => {
                  if (justDraggedRef.current) return;
                  if (selectedForSwap) {
                    handleTapPlayer('pitch', idx);
                  } else {
                    // Open position-based player picker
                    const posGroup = getSlotPosGroup(activeTactic.formation || '4-4-2', idx);
                    setPositionPicker({ targetIdx: idx, positionGroup: posGroup, targetSlot: 'pitch' });
                  }
                },
                onTouchStart: touchDragStart(player.id, idx, 'pitch'),
                pitchIdx: idx,
                isDragOver: dragOverIdx === idx,
                isSelected,
                teamPrimaryColor: teamPrimaryColor || '',
                teamSecondaryColor: teamSecondaryColor || '',
              };
              return <PlayerIcon key={player.id} {...iconProps} />;
           })}
          </div>
        </div>

        {/* Right: Squad Management (3 cols) */}
        <div className="md:col-span-12 lg:col-span-3 xl:col-span-3 p-4 md:p-6 bg-zinc-900/60 border border-white/5 rounded-3xl flex flex-col h-full max-h-[700px]">
            <h4 className="text-[10px] text-white/30 uppercase font-black tracking-[0.4em] mb-6 flex items-center gap-2">
               <Users size={14} /> KADRO LİSTESİ
            </h4>
            <div className="flex-1 space-y-2 overflow-y-auto pr-2 custom-scrollbar">
                {/* ── Mobile: Tap-to-swap info banner ── */}
                {selectedForSwap && (
                  <div className="p-2 bg-amber-500/10 border border-amber-500/30 rounded-xl text-[10px] font-bold text-amber-400 text-center uppercase tracking-wider mb-2">
                    Takas için hedef oyuncuya dokun • İptal: aynı oyuncuya tekrar dokun
                  </div>
                )}
                {bench.sort((a, b) => {
                  const oA = POS_ORDER[a.specificPosition || a.position] ?? 99;
                  const oB = POS_ORDER[b.specificPosition || b.position] ?? 99;
                  return oA !== oB ? oA - oB : b.rating - a.rating;
                }).map((player, benchIdx) => {
                  const actualIdx = squad.findIndex(p => p.id === player.id);
                  const isBenchSelected = selectedForSwap?.type === 'bench' && selectedForSwap?.playerId === player.id;
                  return (
                  <div
                      key={player.id}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData("playerId", player.id);
                        e.dataTransfer.setData("sourceIdx", '');
                      }}
                      onTouchStart={touchDragStart(player.id, actualIdx, 'bench')}
                      onClick={() => {
                        if (justDraggedRef.current) return;
                        if (selectedForSwap) {
                          handleTapPlayer('bench', actualIdx);
                        } else {
                          // Open position-based player picker for bench swap
                          const posGroup = 'ALL';
                          setPositionPicker({ targetIdx: actualIdx, positionGroup: posGroup, targetSlot: 'bench' });
                        }
                      }}
                      data-bench-idx={actualIdx}
                      style={{ touchAction: 'none' }}
                      className={`p-3 rounded-xl flex items-center justify-between cursor-grab active:cursor-grabbing hover:border-white/20 transition-all group ${
                        isBenchSelected
                          ? 'bg-amber-500/15 border-2 border-amber-500/50'
                          : 'bg-black/40 border border-white/5'
                      }`}
                  >
                      <div className="flex items-center gap-3">
                          <div className="text-[10px] font-black p-1 bg-white/5 rounded text-white/30">{player.specificPosition || player.position}</div>
                          <span className="text-[10px] font-bold text-white uppercase truncate max-w-[100px]">{player.name}</span>
                      </div>
                      <span className="text-[10px] font-black text-emerald-400">{player.rating}</span>
                  </div>
                  );
                })}
            </div>
        </div>
      </div>

      {/* Roles Section */}
      <div className="p-6 bg-zinc-900/30 border border-white/5 rounded-3xl">
        <h3 className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mb-4">OYUNCU ROLLERİ</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-3">
          {players.map(p => (
            <div key={p.id} className="p-3 bg-black/40 rounded-xl border border-white/5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-white truncate max-w-[80px]">{p.name.split(' ').pop()}</span>
                <span className="text-[10px] font-black text-white/20">{p.position}</span>
              </div>
              <select
                value={p.special_role || ''}
                onChange={(e) => {
                  const newSquad = squad.map(sp => sp.id === p.id ? { ...sp, special_role: e.target.value || null } : sp);
                  onSquadUpdate(newSquad);
                }}
                className={`w-full bg-zinc-800/50 border border-white/10 rounded-lg px-2 py-1.5 text-[10px] font-black uppercase outline-none focus:border-emerald-500/50 transition-colors`}
              >
                <option value="">VARZAYILAN</option>
                {(() => {
                   const posKey = p.position === 'GK' ? 'GK' : (p.position.startsWith('D') ? 'DEF' : (p.position.startsWith('M') ? 'MID' : 'FWD'));
                   return posRoles[posKey]?.map(r => <option key={r.id} value={r.id}>{r.label}</option>);
                })()}
              </select>
            </div>
          ))}
        </div>
      </div>

      {/* Transfer Offers in Tactics */}
      <div className="p-6 bg-zinc-900/30 border border-emerald-500/10 rounded-3xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
            <ArrowRightLeft size={14} className="text-emerald-400" />
          </div>
          <h3 className="text-[10px] uppercase font-bold tracking-widest text-white/30">TRANSFER TEKLİFLERİ</h3>
        </div>
        {!transferOffers || transferOffers.length === 0 ? (
          <div className="flex items-center gap-2 py-3 text-white/20 text-xs">
            <Clock size={14} className="opacity-50" />
            <span>Gelen transfer teklifi bulunmuyor.</span>
          </div>
        ) : (
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {transferOffers.map((offer) => {
              const statusConfig: Record<string, { color: string; label: string; icon: React.ReactNode }> = {
                pending: { color: 'text-amber-400 bg-amber-500/10 border-amber-500/20', label: 'Beklemede', icon: <Clock size={10} /> },
                accepted: { color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20', label: 'Kabul', icon: <CheckCircle size={10} /> },
                rejected: { color: 'text-red-400 bg-red-500/10 border-red-500/20', label: 'Red', icon: <XCircle size={10} /> },
              };
              const sc = statusConfig[offer.status] || statusConfig.pending;
              return (
                <div key={offer.id} className="flex items-center justify-between gap-3 p-2.5 bg-black/30 border border-white/5 rounded-xl hover:border-emerald-500/20 transition-all">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 bg-white/5 rounded-lg flex items-center justify-center shrink-0">
                      <AlertTriangle size={12} className={offer.status === 'pending' ? 'text-amber-400' : 'text-white/20'} />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[10px] font-bold text-white/80 truncate">{offer.fromTeam} → {toTitleCase(offer.playerName)}</div>
                      <div className="text-[10px] text-white/25 font-bold uppercase tracking-widest">{offer.playerPosition} • {offer.date}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5 shrink-0">
                    <span className="text-[10px] font-black text-emerald-400">{(offer.amount / 1000000).toFixed(1)}M €</span>
                    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-black uppercase tracking-wider border rounded-full ${sc.color}`}>
                      {sc.icon} {sc.label}
                    </span>
                    {offer.status === 'pending' && (
                      <div className="flex gap-1">
                        <button onClick={() => onAcceptOffer?.(offer.id)} className="px-3 py-1.5 text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded hover:bg-emerald-500/30 transition-colors min-h-[36px]">
                          Kabul
                        </button>
                        <button onClick={() => onRejectOffer?.(offer.id)} className="px-3 py-1.5 text-[10px] font-black uppercase bg-red-500/20 text-red-400 border border-red-500/30 rounded hover:bg-red-500/30 transition-colors min-h-[36px]">
                          Reddet
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Team Ranking Table */}
      <div className="p-6 bg-zinc-900/30 border border-emerald-500/10 rounded-3xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
            <Shield size={14} className="text-emerald-400" />
          </div>
          <h3 className="text-[10px] uppercase font-bold tracking-widest text-white/30">TAKIM SIRALAMASI</h3>
          <div className="flex-1" />
          <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-[#7AB4E8]/10 border-2 border-[#7AB4E8]" /> Kaleci</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-[#7EDBC8]/10 border-2 border-[#7EDBC8]" /> Defans</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-[#F0C87A]/10 border-2 border-[#F0C87A]" /> Orta Saha</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-[#E87878]/10 border-2 border-[#E87878]" /> Forvet</span>
          </div>
        </div>
        <div className="overflow-x-auto">
          {/* Table Header */}
          <div className="grid gap-px min-w-[950px] text-[10px] font-black uppercase tracking-wider text-white/30 px-3 py-2.5 bg-black/30 rounded-t-xl border border-white/5 border-b-0" style={{ gridTemplateColumns: '56px 1fr repeat(12, 52px)' }}>
            <div onClick={() => toggleSort('Poz')} className={`text-center cursor-pointer hover:text-emerald-400 transition-colors flex items-center justify-center gap-0.5 ${sortBy === 'Poz' ? 'text-emerald-400' : ''}`}>
              Poz {sortBy === 'Poz' && (sortDirection === 'desc' ? <ChevronDown size={10} /> : <ChevronUp size={10} />)}
            </div>
            <div onClick={() => toggleSort('Oyuncu')} className={`text-left cursor-pointer hover:text-emerald-400 transition-colors flex items-center gap-0.5 ${sortBy === 'Oyuncu' ? 'text-emerald-400' : ''}`}>
              Oyuncu {sortBy === 'Oyuncu' && (sortDirection === 'desc' ? <ChevronDown size={10} /> : <ChevronUp size={10} />)}
            </div>
            {['Klt', 'Klc', 'Tk', 'Pas', 'Şut', 'Kfa', 'Hız', 'Güç', 'Alg', 'Top', 'Tplm', 'Knd'].map(col => (
              <div 
                key={col} 
                onClick={() => toggleSort(col)}
                className={`text-center cursor-pointer hover:text-emerald-400 transition-colors flex items-center justify-center gap-0.5 ${sortBy === col ? 'text-emerald-400' : ''}`}
              >
                {col} {sortBy === col && (sortDirection === 'desc' ? <ChevronDown size={10} /> : <ChevronUp size={10} />)}
              </div>
            ))}
          </div>
          {/* Table Body */}
          <div className="max-h-[400px] overflow-y-auto">
            {sortedSquad.map((player) => {
              const rating = player.rating || 50;
              const posColor = getPositionColor(player.specificPosition || player.position);
              const statKeys = ['Klt', 'Klc', 'Tk', 'Pas', 'Şut', 'Kfa', 'Hız', 'Güç', 'Alg', 'Top', 'Tplm', 'Knd'];
              const isHovered = hoveredPlayerId === player.id;

              // Tooltip data
              const archetypeName = player.archetype || player.playStyle || null;
              const formVal = player.form ?? player.form_rating ?? null;
              const condVal = player.cond ?? null;
              const moraleVal = player.morale ?? null;
              const formRating = player.form_rating ?? null;

              // Generate Son 5 maç performance ratings from match_ratings array
              const getLast5Ratings = (player: Player): { rating: number | null; color: string }[] => {
                const matchRatings = (player as any).match_ratings as number[] | undefined;
                const fr = (player as any).form_rating as number | undefined;

                // If we have actual match_ratings data, use it
                if (matchRatings && Array.isArray(matchRatings) && matchRatings.length > 0) {
                  const last5Ratings = matchRatings.slice(-5);
                  // Pad to 5 if fewer
                  while (last5Ratings.length < 5) last5Ratings.unshift(null as any);
                  return last5Ratings.map(r => {
                    if (r === null || r === undefined) return { rating: null, color: 'text-white/20' };
                    if (r >= 7.5) return { rating: r, color: 'text-emerald-400' };
                    if (r >= 6.0) return { rating: r, color: 'text-amber-400' };
                    return { rating: r, color: 'text-red-400' };
                  });
                }

                // Fallback: use form_rating to estimate match performance
                if (fr !== null && fr !== undefined) {
                  const seed = Math.floor(fr);
                  const baseRating = fr / 10; // form_rating 0-100 → 0-10 scale
                  return Array.from({ length: 5 }, (_, i) => {
                    const variation = ((seed + i * 7) % 13) / 10 - 0.6; // -0.6 to +0.6 variation
                    const rating = Math.max(3, Math.min(10, +(baseRating + variation).toFixed(1)));
                    if (rating >= 7.5) return { rating, color: 'text-emerald-400' };
                    if (rating >= 6.0) return { rating, color: 'text-amber-400' };
                    return { rating, color: 'text-red-400' };
                  });
                }

                // No data at all
                return Array.from({ length: 5 }, () => ({ rating: null, color: 'text-white/20' }));
              };
              const last5 = getLast5Ratings(player);

              return (
                <div 
                  key={player.id}
                  className="relative"
                >
                  {condVal !== null && condVal < 40 && (
                    <div className="absolute -top-1 -right-1 bg-red-500 rounded-full w-3 h-3 flex items-center justify-center z-10">
                      <span className="text-[10px] font-black text-white">!</span>
                    </div>
                  )}
                  {/* Hover Tooltip - appears above the row */}
                  <div 
                    className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 pointer-events-none transition-all duration-200 ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1'}`}
                  >
                    <div className="bg-zinc-900/95 backdrop-blur-xl border border-white/10 shadow-2xl rounded-xl px-4 py-3 min-w-[220px]">
                      {/* Arrow pointing down */}
                      <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px">
                        <div className="w-3 h-3 bg-zinc-900/95 border-r border-b border-white/10 rotate-45 -mt-[7px]" />
                      </div>
                      
                      {/* Archetype with Tooltip */}
                      {archetypeName && (
                        <TooltipProvider delayDuration={200}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="flex items-center gap-2 mb-2 pb-2 border-b border-white/5 cursor-help">
                                <div className="w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-black" 
                                  style={{ 
                                    background: `linear-gradient(135deg, ${POS_GROUP_COLORS[getPosGroup(player.specificPosition || player.position)] || '#9B9B9B'}40 0%, ${POS_GROUP_COLORS[getPosGroup(player.specificPosition || player.position)] || '#9B9B9B'}20 100%)`,
                                    color: POS_GROUP_COLORS[getPosGroup(player.specificPosition || player.position)] || '#9B9B9B'
                                  }}>
                                  {player.specificPosition?.charAt(0) || player.position.charAt(0)}
                                </div>
                                <div>
                                  <div className="text-[10px] font-black text-white/90">{archetypeName}</div>
                                  <div className="text-[10px] text-white/30 font-medium">Arketip</div>
                                </div>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="bg-zinc-900/95 backdrop-blur-xl border border-white/10 shadow-2xl max-w-[220px]">
                              <div className="px-1 py-0.5">
                                <div className="text-[10px] font-black text-white/90 mb-1">{archetypeName}</div>
                                <div className="text-[10px] text-white/60 leading-relaxed mb-1.5">
                                  {ARCHETYPE_INFO[archetypeName]?.desc || 'Bu arketip hakkında bilgi bulunmuyor.'}
                                </div>
                                {ARCHETYPE_INFO[archetypeName]?.boosts && ARCHETYPE_INFO[archetypeName].boosts.length > 0 && (
                                  <div className="flex flex-wrap gap-1">
                                    {ARCHETYPE_INFO[archetypeName].boosts.map((b: string) => (
                                      <span key={b} className="px-1.5 py-0.5 bg-amber-500/10 border border-amber-500/20 rounded text-[10px] font-bold text-amber-400">
                                        +{b}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}

                      {/* Stats row */}
                      <div className="grid grid-cols-3 gap-3 mb-2">
                        <div className="text-center">
                          <div className={`text-[11px] font-black ${
                            formVal !== null ? (formVal >= 75 ? 'text-emerald-400' : formVal >= 50 ? 'text-amber-400' : 'text-red-400') : 'text-white/20'
                          }`}>
                            {formVal !== null ? formVal : '-'}
                          </div>
                          <div className="text-[10px] text-white/25 font-bold uppercase tracking-wider">Form</div>
                        </div>
                        <div className="text-center">
                          <div className={`text-[11px] font-black ${
                            condVal !== null ? (condVal >= 75 ? 'text-emerald-400' : condVal >= 50 ? 'text-amber-400' : 'text-red-400') : 'text-white/20'
                          }`}>
                            {condVal !== null ? condVal : '-'}
                          </div>
                          <div className="text-[10px] text-white/25 font-bold uppercase tracking-wider">Kondisyon</div>
                          {condVal !== null && condVal < 40 && (
                            <span className="text-red-400 text-[10px]">⚠ YORGUN</span>
                          )}
                          {condVal !== null && condVal < 20 && (
                            <span className="text-red-400 text-[10px]">🚫 OYNAMAZ</span>
                          )}
                        </div>
                        <div className="text-center">
                          <div className={`text-[11px] font-black ${
                            moraleVal !== null ? (moraleVal >= 75 ? 'text-emerald-400' : moraleVal >= 50 ? 'text-amber-400' : 'text-red-400') : 'text-white/20'
                          }`}>
                            {moraleVal !== null ? moraleVal : '-'}
                          </div>
                          <div className="text-[10px] text-white/25 font-bold uppercase tracking-wider">Moral</div>
                        </div>
                      </div>

                      {/* Son 5 maç performans */}
                      <div className="pt-2 border-t border-white/5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-white/25 font-bold uppercase tracking-wider">Son 5 Maç</span>
                          <div className="flex gap-1">
                            {last5.map((ind, i) => {
                              const hasRating = ind.rating !== null && ind.rating !== undefined;
                              const bgColor = !hasRating ? 'bg-white/5' :
                                ind.rating! >= 7.5 ? 'bg-emerald-500/15' :
                                ind.rating! >= 6.0 ? 'bg-amber-500/15' :
                                'bg-red-500/15';
                              return (
                                <span key={i} className={`w-6 h-5 rounded text-[10px] font-black flex items-center justify-center ${bgColor} ${ind.color}`}>
                                  {hasRating ? ind.rating!.toFixed(1) : '-'}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Player Row */}
                  <div 
                    onClick={() => onPlayerClick?.(player)}
                    onMouseEnter={() => setHoveredPlayerId(player.id)}
                    onMouseLeave={() => setHoveredPlayerId(null)}
                    className={`grid gap-px min-w-[950px] px-3 py-2 border-b border-white/[0.03] hover:bg-white/[0.03] cursor-pointer transition-all ${posColor}`}
                    style={{ gridTemplateColumns: '56px 1fr repeat(12, 52px)' }}
                  >
                    <div className={`text-center text-[10px] font-black flex items-center justify-center gap-0.5 ${
                      player.position === 'GK' ? 'text-green-300' :
                      ['CB', 'LB', 'RB', 'LWB', 'RWB'].includes(player.specificPosition || player.position) ? 'text-blue-300' :
                      ['CDM', 'CM', 'CAM', 'LM', 'RM'].includes(player.specificPosition || player.position) ? 'text-amber-300' :
                      'text-red-300'
                    }`}>
                      <span>{player.specificPosition || player.position}</span>
                      {player.secondaryPositions && player.secondaryPositions.length > 0 && (
                        <span className="text-[10px] text-white/25 font-normal">/{player.secondaryPositions.join('/')}</span>
                      )}
                    </div>
                    <div className="text-left text-[10px] font-bold text-white/80 truncate flex items-center gap-1">
                      {toTitleCase(player.name)}
                      {(player.archetype || player.playStyle) && (
                        <span className="relative group/arch inline-flex items-center">
                          <Info size={10} className="text-amber-400/40 group-hover/arch:text-amber-400 transition-colors cursor-help" />
                          <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1.5 rounded-lg bg-zinc-900/95 border border-amber-500/20 shadow-2xl text-[10px] font-bold text-amber-300 whitespace-nowrap pointer-events-none opacity-0 group-hover/arch:opacity-100 transition-all z-50 backdrop-blur-xl">
                            {player.archetype || player.playStyle}
                            <span className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-zinc-900/95 border-r border-b border-amber-500/20 rotate-45 -mt-1" />
                          </span>
                        </span>
                      )}
                    </div>
                    {statKeys.map(key => {
                      const val = getStatValue(player, key);
                      return (
                        <div key={key} className={`text-center text-[10px] font-black flex items-center justify-center ${
                          val >= 85 ? 'text-emerald-300' : val >= 75 ? 'text-emerald-400' : val >= 60 ? 'text-yellow-400' : val >= 45 ? 'text-orange-400' : 'text-red-400'
                        }`}>
                          {val}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Position-Based Player Selection Modal ── */}
      <AnimatePresence>
        {positionPicker && (() => {
          const currentPlayer = squad[positionPicker.targetIdx];
          const availablePlayers = getPlayersForPositionGroup(positionPicker.positionGroup);
          const groupLabel = positionPicker.positionGroup === 'ALL' ? 'Tüm Oyuncular' : (POS_GROUP_LABELS[positionPicker.positionGroup] || positionPicker.positionGroup);
          const groupColor = positionPicker.positionGroup === 'ALL' ? '#ffffff' : positionPicker.positionGroup === 'GK' ? '#7AB4E8' : positionPicker.positionGroup === 'DEF' ? '#7EDBC8' : positionPicker.positionGroup === 'MID' ? '#F0C87A' : '#E87878';
          return (
            <motion.div
              key="position-picker"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[200] flex items-center justify-center bg-black/85 backdrop-blur-md p-2 sm:p-4"
              onClick={() => setPositionPicker(null)}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="bg-zinc-900 border border-white/10 rounded-none sm:rounded-2xl p-4 sm:p-6 w-full max-w-md max-h-[90vh] flex flex-col shadow-2xl"
                onClick={e => e.stopPropagation()}
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center border" style={{ backgroundColor: `${groupColor}15`, borderColor: `${groupColor}30` }}>
                      <Users size={18} style={{ color: groupColor }} />
                    </div>
                    <div>
                      <h3 className="text-sm font-black uppercase tracking-wider text-white">
                        {groupLabel} Oyuncuları
                      </h3>
                      <p className="text-[10px] text-white/30 font-bold uppercase tracking-wider">
                        {positionPicker.targetSlot === 'pitch' ? 'İlk 11' : 'Yedek'} pozisyonu için oyuncu seçin
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setPositionPicker(null)}
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all"
                  >
                    ✕
                  </button>
                </div>

                {/* Current player info */}
                {currentPlayer && (
                  <div className="mb-4 px-4 py-3 rounded-xl border border-white/5" style={{ backgroundColor: `${groupColor}08` }}>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-widest text-white/30">Mevcut Oyuncu:</span>
                      <span className="text-[11px] font-black text-white uppercase">{toTitleCase(currentPlayer.name)}</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ backgroundColor: `${groupColor}20`, color: groupColor }}>
                        {currentPlayer.specificPosition || currentPlayer.position}
                      </span>
                      <span className="text-[10px] font-black text-emerald-400">⭐ {currentPlayer.rating}</span>
                    </div>
                  </div>
                )}

                {/* Player list */}
                <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar">
                  {availablePlayers.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 gap-3">
                      <Users size={32} className="text-white/10" />
                      <p className="text-xs text-white/20 font-bold">Bu mevkiide oyuncu bulunmuyor</p>
                    </div>
                  ) : (
                    availablePlayers
                      .sort((a, b) => b.rating - a.rating)
                      .map(p => {
                        const isCurrentPlayer = p.id === currentPlayer?.id;
                        const isInStarting11 = squad.indexOf(p) < 11;
                        const cond = playerConditions[p.id] || 100;
                        return (
                          <button
                            key={p.id}
                            onClick={() => handlePositionPick(p.id)}
                            className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all text-left ${
                              isCurrentPlayer
                                ? 'bg-amber-500/10 border-amber-500/30'
                                : 'bg-black/40 border-white/5 hover:border-white/20 hover:bg-white/[0.03]'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-lg flex items-center justify-center text-[10px] font-black border" style={{ backgroundColor: `${groupColor}10`, borderColor: `${groupColor}25`, color: groupColor }}>
                                {p.specificPosition || p.position}
                              </div>
                              <div>
                                <span className="text-[11px] font-bold text-white uppercase block leading-tight">{toTitleCase(p.name)}</span>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span className="text-[10px] font-bold text-white/30">⭐ {p.rating}</span>
                                  <span className={`text-[10px] font-bold ${cond >= 70 ? 'text-emerald-400' : cond >= 40 ? 'text-amber-400' : 'text-red-400'}`}>Kond: {cond}%</span>
                                  {isInStarting11 && !isCurrentPlayer && (
                                    <span className="text-[10px] font-black uppercase px-1 py-0.5 rounded bg-emerald-500/15 text-emerald-400">İLK 11</span>
                                  )}
                                  {isCurrentPlayer && (
                                    <span className="text-[10px] font-black uppercase px-1 py-0.5 rounded bg-amber-500/15 text-amber-400">SEÇİLİ</span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-lg font-black italic" style={{ color: groupColor }}>{p.rating}</span>
                              <ArrowRightLeft size={14} className="text-white/20" />
                            </div>
                          </button>
                        );
                    })
                  )}
                </div>

                {/* All players / Position filter toggle */}
                <div className="mt-3 pt-3 border-t border-white/5">
                  <button
                    onClick={() => {
                      if (positionPicker.positionGroup === 'ALL') {
                        // Go back to position group filter - get the original group from the current player
                        const posGroup = getSlotPosGroup(activeTactic.formation || '4-4-2', idx);
                        setPositionPicker(prev => prev ? { ...prev, positionGroup: posGroup } : null);
                      } else {
                        setPositionPicker(prev => prev ? { ...prev, positionGroup: 'ALL' } : null);
                      }
                    }}
                    className="w-full py-2.5 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white hover:bg-white/10 transition-all"
                  >
                    {positionPicker.positionGroup === 'ALL' ? 'Sadece Aynı Mevkiidekileri Göster' : 'Tüm Oyuncuları Göster'}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>
    </div>
  );
}
