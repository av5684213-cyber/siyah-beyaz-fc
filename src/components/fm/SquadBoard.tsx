'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
  useDroppable,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Shield, Swords, Zap, Hand, GripVertical,
  AlertTriangle, Search, ChevronDown, ChevronRight,
  TrendingUp, Heart, Star,
} from 'lucide-react';
import type { Player, PositionGroup, SpecificPosition } from '@/lib/fm/types';
import { useFM } from '@/lib/fm/GameContext';
import {
  getPosGroup,
  getPosBadgeStyle,
  formatPosBadge,
  localizePosFull,
  toTitleCase,
  fmStatColor,
} from '@/lib/fm/ui-helpers';
import { formatCurrency, calculateMarketValue } from '@/lib/fm/valuation';

// ── Position group configuration ──
const GROUP_CONFIG: Record<PositionGroup, {
  key: PositionGroup;
  label: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  borderColor: string;
  glowColor: string;
}> = {
  GK: {
    key: 'GK',
    label: 'Kaleci',
    icon: Hand,
    color: '#7AB4E8',
    bgColor: 'bg-[#7AB4E8]/5',
    borderColor: 'border-[#7AB4E8]/20',
    glowColor: 'shadow-[#7AB4E8]/10',
  },
  DEF: {
    key: 'DEF',
    label: 'Defans',
    icon: Shield,
    color: '#7EDBC8',
    bgColor: 'bg-[#7EDBC8]/5',
    borderColor: 'border-[#7EDBC8]/20',
    glowColor: 'shadow-[#7EDBC8]/10',
  },
  MID: {
    key: 'MID',
    label: 'Orta Saha',
    icon: Zap,
    color: '#F0C87A',
    bgColor: 'bg-[#F0C87A]/5',
    borderColor: 'border-[#F0C87A]/20',
    glowColor: 'shadow-[#F0C87A]/10',
  },
  FWD: {
    key: 'FWD',
    label: 'Forvet',
    icon: Swords,
    color: '#E87878',
    bgColor: 'bg-[#E87878]/5',
    borderColor: 'border-[#E87878]/20',
    glowColor: 'shadow-[#E87878]/10',
  },
};

const GROUP_ORDER: PositionGroup[] = ['GK', 'DEF', 'MID', 'FWD'];

// ── Sub-position definitions within each group ──
const SUB_POSITIONS: Record<PositionGroup, { code: SpecificPosition | 'GK'; label: string; sort: number }[]> = {
  GK: [
    { code: 'GK', label: 'Kaleci', sort: 0 },
  ],
  DEF: [
    { code: 'CB', label: 'Stoper', sort: 10 },
    { code: 'LB', label: 'Sol Bek', sort: 11 },
    { code: 'RB', label: 'Sağ Bek', sort: 12 },
    { code: 'LWB', label: 'Sol Kanat Bek', sort: 13 },
    { code: 'RWB', label: 'Sağ Kanat Bek', sort: 14 },
  ],
  MID: [
    { code: 'CDM', label: 'Defansif OS', sort: 20 },
    { code: 'CM', label: 'Merkez OS', sort: 21 },
    { code: 'CAM', label: 'Ofansif OS', sort: 22 },
    { code: 'LM', label: 'Sol Açık', sort: 23 },
    { code: 'RM', label: 'Sağ Açık', sort: 24 },
    { code: 'LW', label: 'Sol Kanat', sort: 25 },
    { code: 'RW', label: 'Sağ Kanat', sort: 26 },
  ],
  FWD: [
    { code: 'CF', label: 'Göbek Forvet', sort: 30 },
    { code: 'ST', label: 'Santrfor', sort: 31 },
  ],
};

// ── Sort players within a group ──
function sortPlayersInGroup(players: Player[]): Player[] {
  return [...players].sort((a, b) => {
    const posA = a.specificPosition || a.position;
    const posB = b.specificPosition || b.position;
    // Sort by specificPosition code first
    if (posA !== posB) return posA.localeCompare(posB);
    // Then by rating descending
    return (b.rating || 0) - (a.rating || 0);
  });
}

// ── Group players by position ──
function groupPlayers(squad: Player[]): Record<PositionGroup, Player[]> {
  const grouped: Record<PositionGroup, Player[]> = { GK: [], DEF: [], MID: [], FWD: [] };
  for (const player of squad) {
    const group = getPosGroup(player.specificPosition || player.position);
    if (group === 'SUB' || !GROUP_ORDER.includes(group as PositionGroup)) continue;
    if (grouped[group as PositionGroup]) {
      grouped[group].push(player);
    }
  }
  for (const key of GROUP_ORDER) {
    grouped[key] = sortPlayersInGroup(grouped[key]);
  }
  return grouped;
}

// ── Sub-group players by specific position within a group ──
function subGroupPlayers(players: Player[], groupKey: PositionGroup): Record<string, Player[]> {
  const subGroups: Record<string, Player[]> = {};
  const subDefs = SUB_POSITIONS[groupKey];
  for (const sp of subDefs) {
    subGroups[sp.code] = [];
  }
  for (const player of players) {
    const sp = player.specificPosition || player.position;
    if (subGroups[sp]) {
      subGroups[sp].push(player);
    } else {
      // Player has a position not in the sub-group list, put in first matching sub-group
      const fallback = subDefs[0]?.code;
      if (fallback && subGroups[fallback]) {
        subGroups[fallback].push(player);
      }
    }
  }
  return subGroups;
}

// ── Condition bar color ──
function condColor(cond: number): string {
  if (cond >= 80) return 'bg-emerald-500';
  if (cond >= 60) return 'bg-yellow-500';
  if (cond >= 40) return 'bg-orange-500';
  return 'bg-red-500';
}

// ── Morale indicator ──
function moraleIcon(morale: number): { icon: React.ReactNode; color: string } {
  if (morale >= 80) return { icon: <Star size={10} />, color: 'text-emerald-400' };
  if (morale >= 60) return { icon: <Heart size={10} />, color: 'text-yellow-400' };
  if (morale >= 40) return { icon: <Heart size={10} />, color: 'text-orange-400' };
  return { icon: <Heart size={10} />, color: 'text-red-400' };
}

// ── Droppable Group Container ──
function GroupContainer({ groupKey, children, isOver }: {
  groupKey: PositionGroup;
  children: React.ReactNode;
  isOver: boolean;
}) {
  const config = GROUP_CONFIG[groupKey];
  const { setNodeRef } = useDroppable({ id: `group-${groupKey}` });

  return (
    <div
      ref={setNodeRef}
      className={`rounded-2xl border transition-all duration-200 ${
        isOver
          ? `border-dashed ${config.borderColor} ${config.bgColor} shadow-lg ${config.glowColor}`
          : `border-white/5 bg-zinc-900/60`
      }`}
    >
      {children}
    </div>
  );
}

// ── Sortable Player Card ──
function SortablePlayerCard({ player, groupColor, onPlayerClick }: {
  player: Player;
  groupColor: string;
  onPlayerClick?: (player: Player) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: player.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 50 : 'auto',
  };

  const mv = calculateMarketValue(player);
  const badgeStyle = getPosBadgeStyle(player.specificPosition || player.position);
  const posLabel = formatPosBadge(player);
  const isGK = player.position === 'GK' || player.specificPosition === 'GK';
  const moraleInfo = moraleIcon(player.morale || 70);

  // Secondary positions display
  const secondaryLabel = player.secondaryPositions && player.secondaryPositions.length > 0
    ? player.secondaryPositions.map(sp => localizePosFull(sp)).join(', ')
    : null;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-2.5 px-3 py-2 rounded-xl bg-zinc-800/80 border border-white/5
        hover:bg-zinc-800 hover:border-white/10 transition-all cursor-pointer
        ${isDragging ? 'shadow-2xl ring-2 ring-white/20 cursor-grabbing' : ''}`}
      onClick={(e) => {
        // Only trigger click if not dragging
        if (!isDragging && onPlayerClick) onPlayerClick(player);
      }}
    >
      {/* Drag handle */}
      <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing touch-none">
        <GripVertical size={14} className="text-white/20 shrink-0 hover:text-white/40 transition-colors" />
      </div>

      {/* Position badge */}
      <span className={`px-1.5 py-0.5 rounded text-[9px] font-black border shrink-0 ${badgeStyle}`}>
        {posLabel}
      </span>

      {/* Player info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-bold text-white/90 truncate">
            {toTitleCase(player.name)}
          </span>
          {player.injury && (
            <AlertTriangle size={10} className="text-red-400 shrink-0 animate-pulse" />
          )}
          {player.is_for_sale && (
            <span className="px-1 py-0 rounded-sm bg-emerald-500/20 border border-emerald-500/30 text-[7px] font-bold uppercase text-emerald-400 shrink-0">
              Listede
            </span>
          )}
          {player.is_legend && (
            <span className="text-amber-400 text-[10px] shrink-0">&#9733;</span>
          )}
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[9px] font-bold text-white/30">{player.age} yaş</span>
          {secondaryLabel && (
            <>
              <span className="w-0.5 h-0.5 bg-white/10 rounded-full" />
              <span className="text-[8px] text-white/25 truncate" title={secondaryLabel}>
                {secondaryLabel}
              </span>
            </>
          )}
        </div>
        <div className="flex items-center gap-1.5 mt-0.5">
          <StatChip label="Hız" value={player.speed || 0} />
          <StatChip label="Pas" value={player.passing || 0} />
          <StatChip label={isGK ? 'Ref' : 'Şut'} value={isGK ? (player.goalkeeping || 0) : (player.shooting || 0)} />
          <StatChip label="Sav" value={player.defending || 0} />
        </div>
      </div>

      {/* Rating */}
      <div className="flex flex-col items-center shrink-0">
        <span className="text-lg font-black leading-none" style={{ color: groupColor }}>
          {player.rating}
        </span>
        <span className="text-[7px] font-bold text-white/20 uppercase">ORT</span>
      </div>

      {/* Morale + Condition */}
      <div className="flex flex-col items-center gap-0.5 shrink-0 w-12">
        <div className="flex items-center gap-0.5">
          <span className={moraleInfo.color}>{moraleInfo.icon}</span>
        </div>
        <div className="w-full h-1.5 bg-zinc-700 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${condColor(player.cond || 100)}`}
            style={{ width: `${Math.min(100, Math.max(0, player.cond || 100))}%` }}
          />
        </div>
        <span className="text-[7px] font-bold text-white/25">{player.cond || 100}%</span>
      </div>

      {/* Market value */}
      <div className="flex items-center gap-1 shrink-0">
        <TrendingUp size={10} className="text-emerald-500/50" />
        <span className="text-[9px] font-bold text-emerald-500/70">{formatCurrency(mv)}</span>
      </div>
    </div>
  );
}

// ── Mini stat chip ──
function StatChip({ label, value }: { label: string; value: number }) {
  return (
    <span className={`text-[8px] font-mono font-bold ${fmStatColor(value)}`}>
      {label}:{value}
    </span>
  );
}

// ── Drag overlay card (ghost preview) ──
function DragOverlayCard({ player, groupColor }: { player: Player; groupColor: string }) {
  const posLabel = formatPosBadge(player);
  const badgeStyle = getPosBadgeStyle(player.specificPosition || player.position);

  return (
    <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-zinc-800 border border-white/20 shadow-2xl ring-2 ring-white/10 rotate-1 scale-105">
      <GripVertical size={14} className="text-white/30 shrink-0" />
      <span className={`px-1.5 py-0.5 rounded text-[9px] font-black border shrink-0 ${badgeStyle}`}>
        {posLabel}
      </span>
      <div className="flex-1 min-w-0">
        <span className="text-xs font-bold text-white truncate">
          {toTitleCase(player.name)}
        </span>
      </div>
      <span className="text-lg font-black" style={{ color: groupColor }}>{player.rating}</span>
    </div>
  );
}

// ── Sub-position header ──
function SubPositionHeader({ code, label, count, color, collapsed, onToggle }: {
  code: string;
  label: string;
  count: number;
  color: string;
  collapsed: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-white/[0.03] transition-colors rounded-lg"
    >
      {collapsed ? (
        <ChevronRight size={12} style={{ color }} className="shrink-0" />
      ) : (
        <ChevronDown size={12} style={{ color }} className="shrink-0" />
      )}
      <span className="text-[10px] font-black uppercase tracking-wider" style={{ color }}>
        {label}
      </span>
      <span className="text-[8px] font-bold text-white/15 uppercase tracking-widest">
        ({code})
      </span>
      <span
        className="ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded-full"
        style={{ backgroundColor: `${color}15`, color }}
      >
        {count}
      </span>
    </button>
  );
}

// ═══════════════════════════════════════════════════════
// MAIN SQUAD BOARD COMPONENT
// ═══════════════════════════════════════════════════════
interface SquadBoardProps {
  onPlayerClick?: (player: Player) => void;
}

export default function SquadBoard({ onPlayerClick }: SquadBoardProps) {
  const { squad, setSquad } = useFM();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overGroupId, setOverGroupId] = useState<PositionGroup | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [collapsedSubs, setCollapsedSubs] = useState<Record<string, boolean>>({});
  const [viewMode, setViewMode] = useState<'grouped' | 'subgrouped'>('subgrouped');

  // Filter squad by search
  const filteredSquad = useMemo(() => {
    if (!searchQuery.trim()) return squad;
    const q = searchQuery.toLowerCase().trim();
    return squad.filter(p => {
      const name = (p.name || '').toLowerCase();
      const pos = (p.specificPosition || p.position || '').toLowerCase();
      const posFull = localizePosFull(p.specificPosition || p.position).toLowerCase();
      return name.includes(q) || pos.includes(q) || posFull.includes(q);
    });
  }, [squad, searchQuery]);

  // Group players by position
  const grouped = useMemo(() => groupPlayers(filteredSquad), [filteredSquad]);

  // Build a flat map of playerId → Player for quick lookup
  const playerMap = useMemo(() => {
    const map = new Map<string, Player>();
    for (const player of squad) {
      map.set(player.id, player);
    }
    return map;
  }, [squad]);

  // Find which group a player belongs to
  const findGroup = useCallback((playerId: string): PositionGroup | null => {
    for (const key of GROUP_ORDER) {
      if (grouped[key].some(p => p.id === playerId)) {
        return key;
      }
    }
    return null;
  }, [grouped]);

  // Toggle sub-position collapse
  const toggleSubCollapse = useCallback((key: string) => {
    setCollapsedSubs(prev => ({ ...prev, [key]: !prev[key] }));
  }, []);

  // Sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  );

  // Drag start
  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  }, []);

  // Drag over - track which group the item is hovering over
  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { over } = event;
    if (!over) {
      setOverGroupId(null);
      return;
    }

    const overId = over.id as string;
    if (overId.startsWith('group-')) {
      const groupKey = overId.replace('group-', '') as PositionGroup;
      setOverGroupId(groupKey);
      return;
    }

    const overGroup = findGroup(overId);
    if (overGroup) {
      setOverGroupId(overGroup);
    }
  }, [findGroup]);

  // Drag end
  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    setOverGroupId(null);

    if (!over || active.id === over.id) return;

    const activeIdStr = active.id as string;
    const overId = over.id as string;

    const activeGroup = findGroup(activeIdStr);
    let overGroup: PositionGroup | null = null;

    if (overId.startsWith('group-')) {
      overGroup = overId.replace('group-', '') as PositionGroup;
    } else {
      overGroup = findGroup(overId);
    }

    if (!activeGroup || !overGroup) return;

    let newSquad = [...squad];

    if (activeGroup === overGroup) {
      // Reorder within the same group
      const groupPlayersList = grouped[activeGroup];
      const oldIndex = groupPlayersList.findIndex(p => p.id === activeIdStr);
      const newIndex = groupPlayersList.findIndex(p => p.id === overId);

      if (oldIndex === -1 || newIndex === -1) return;

      const reorderedGroup = arrayMove(groupPlayersList, oldIndex, newIndex);

      newSquad = squad.filter(p => {
        const pg = getPosGroup(p.specificPosition || p.position);
        return pg !== activeGroup;
      });
      newSquad = [...newSquad, ...reorderedGroup];
    } else {
      // Move between groups - update player's position
      const playerIndex = newSquad.findIndex(p => p.id === activeIdStr);
      if (playerIndex === -1) return;

      const player = { ...newSquad[playerIndex] };

      // Update position to new group
      player.position = overGroup;

      // Update specificPosition if it doesn't match the new group
      const currentSpecificPos = player.specificPosition || player.position;
      const currentGroup = getPosGroup(currentSpecificPos);
      if (currentGroup !== overGroup) {
        const defaultPositions: Record<PositionGroup, string> = {
          GK: 'GK',
          DEF: 'CB',
          MID: 'CM',
          FWD: 'ST',
        };
        player.specificPosition = defaultPositions[overGroup] as any;
      }

      newSquad[playerIndex] = player;

      const newGrouped = groupPlayers(newSquad);
      newSquad = [];
      for (const key of GROUP_ORDER) {
        newSquad.push(...newGrouped[key]);
      }
    }

    setSquad(newSquad);
  }, [squad, grouped, findGroup, setSquad]);

  // Active player for drag overlay
  const activePlayer = activeId ? playerMap.get(activeId) : null;
  const activePlayerGroup = activeId ? findGroup(activeId) : null;

  return (
    <div className="space-y-4">
      {/* Search & Controls Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Oyuncu ara... (isim, pozisyon)"
            className="w-full pl-9 pr-4 py-2.5 bg-zinc-900/80 border border-white/10 rounded-xl
              text-xs text-white/80 placeholder-white/20 outline-none
              focus:border-white/25 focus:bg-zinc-900 transition-all"
          />
        </div>
        <div className="flex items-center gap-1.5 bg-zinc-900/80 border border-white/10 rounded-xl p-1">
          <button
            onClick={() => setViewMode('grouped')}
            className={`px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all ${
              viewMode === 'grouped'
                ? 'bg-white/10 text-white/80'
                : 'text-white/30 hover:text-white/50'
            }`}
          >
            Basit
          </button>
          <button
            onClick={() => setViewMode('subgrouped')}
            className={`px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all ${
              viewMode === 'subgrouped'
                ? 'bg-white/10 text-white/80'
                : 'text-white/30 hover:text-white/50'
            }`}
          >
            Detaylı
          </button>
        </div>
        {/* Quick stats */}
        <div className="flex items-center gap-3 px-3 py-2.5 bg-zinc-900/80 border border-white/10 rounded-xl">
          {GROUP_ORDER.map(g => {
            const config = GROUP_CONFIG[g];
            const count = grouped[g].length;
            const avg = count > 0
              ? Math.round(grouped[g].reduce((sum, p) => sum + (p.rating || 0), 0) / count)
              : 0;
            return (
              <div key={g} className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: config.color }} />
                <span className="text-[9px] font-black" style={{ color: config.color }}>
                  {count}
                </span>
                <span className="text-[8px] text-white/20">
                  ({avg})
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* DnD Context */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {GROUP_ORDER.map((groupKey, groupIndex) => {
            const config = GROUP_CONFIG[groupKey];
            const players = grouped[groupKey];
            const avgRating = players.length > 0
              ? Math.round(players.reduce((sum, p) => sum + (p.rating || 0), 0) / players.length)
              : 0;
            const playerIds = players.map(p => p.id);
            const isOver = overGroupId === groupKey && activePlayerGroup !== groupKey;
            const IconComp = config.icon;

            // Sub-grouping
            const subGroups = viewMode === 'subgrouped' ? subGroupPlayers(players, groupKey) : null;

            return (
              <motion.div
                key={groupKey}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: groupIndex * 0.08, duration: 0.3 }}
              >
                <GroupContainer groupKey={groupKey} isOver={isOver}>
                  {/* Group header */}
                  <div
                    className={`flex items-center justify-between px-4 py-3 border-b ${config.borderColor}`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${config.color}20` }}
                      >
                        <IconComp size={16} style={{ color: config.color }} />
                      </div>
                      <div>
                        <h3 className="text-sm font-black uppercase tracking-tight" style={{ color: config.color }}>
                          {config.label}
                        </h3>
                        <p className="text-[8px] font-bold text-white/20 uppercase tracking-widest">
                          {groupKey} MEVKİİ
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col items-end">
                        <span className="text-[8px] font-bold text-white/20 uppercase tracking-widest">Oyuncu</span>
                        <span className="text-sm font-black" style={{ color: config.color }}>{players.length}</span>
                      </div>
                      <div className="w-px h-6 bg-white/10" />
                      <div className="flex flex-col items-end">
                        <span className="text-[8px] font-bold text-white/20 uppercase tracking-widest">Ort.</span>
                        <span className="text-sm font-black" style={{ color: config.color }}>{avgRating}</span>
                      </div>
                    </div>
                  </div>

                  {/* Player list (sortable) */}
                  <div className="p-2 space-y-0.5 min-h-[80px]">
                    <SortableContext items={playerIds} strategy={verticalListSortingStrategy}>
                      <AnimatePresence mode="popLayout">
                        {players.length > 0 ? (
                          viewMode === 'subgrouped' && subGroups ? (
                            // ── Sub-grouped view ──
                            Object.entries(subGroups).map(([subCode, subPlayers]) => {
                              const subDef = SUB_POSITIONS[groupKey].find(s => s.code === subCode);
                              if (!subDef || subPlayers.length === 0) return null;
                              const collapseKey = `${groupKey}-${subCode}`;
                              const isCollapsed = collapsedSubs[collapseKey] ?? false;

                              return (
                                <div key={subCode} className="mb-1">
                                  <SubPositionHeader
                                    code={subCode}
                                    label={subDef.label}
                                    count={subPlayers.length}
                                    color={config.color}
                                    collapsed={isCollapsed}
                                    onToggle={() => toggleSubCollapse(collapseKey)}
                                  />
                                  <AnimatePresence>
                                    {!isCollapsed && (
                                      <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.15 }}
                                        className="overflow-hidden space-y-0.5 pl-2"
                                      >
                                        {subPlayers.map((player) => (
                                          <SortablePlayerCard
                                            key={player.id}
                                            player={player}
                                            groupColor={config.color}
                                            onPlayerClick={onPlayerClick}
                                          />
                                        ))}
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </div>
                              );
                            })
                          ) : (
                            // ── Simple flat view ──
                            players.map((player) => (
                              <SortablePlayerCard
                                key={player.id}
                                player={player}
                                groupColor={config.color}
                                onPlayerClick={onPlayerClick}
                              />
                            ))
                          )
                        ) : (
                          <div className="py-8 text-center">
                            <p className="text-[10px] font-bold text-white/15 uppercase tracking-widest">
                              Bu mevkide oyuncu yok
                            </p>
                          </div>
                        )}
                      </AnimatePresence>
                    </SortableContext>

                    {/* Drop zone indicator when dragging over empty area */}
                    {isOver && players.length === 0 && (
                      <div
                        className="py-4 border-2 border-dashed rounded-xl text-center"
                        style={{ borderColor: `${config.color}40`, backgroundColor: `${config.color}08` }}
                      >
                        <p className="text-[9px] font-bold uppercase tracking-widest" style={{ color: config.color }}>
                          Buraya bırak
                        </p>
                      </div>
                    )}
                  </div>
                </GroupContainer>
              </motion.div>
            );
          })}
        </div>

        {/* Drag overlay - the ghost card that follows the cursor */}
        <DragOverlay dropAnimation={null}>
          {activePlayer && activePlayerGroup ? (
            <DragOverlayCard
              player={activePlayer}
              groupColor={GROUP_CONFIG[activePlayerGroup].color}
            />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
