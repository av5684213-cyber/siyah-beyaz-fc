'use client';

import React, { useState, useMemo, useCallback, useRef } from 'react';
import {
  Shield,
  Target,
  Zap,
  Users,
  Info,
  Check,
  X,
  ChevronDown,
  Star,
  AlertTriangle,
  Activity,
} from 'lucide-react';
import {
  type PlayerRole,
  type FormationTemplate,
  type TacticalInstruction,
  ROLES,
  FORMATION_TEMPLATES,
  TACTICAL_INSTRUCTIONS,
  getCompatibleRoles,
  getRoleAttributeBonuses,
  calculateTacticalScore,
} from '@/lib/fm/tacticsRoles';
import type { Player } from '@/lib/fm/types';

// ─────────────────────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────────────────────

interface TacticsRolesPanelProps {
  squad: Player[];
  currentFormation: string;
  onFormationChange: (formation: string) => void;
  playerRoles: Record<string, string>; // playerId -> roleId
  onRoleChange: (playerId: string, roleId: string) => void;
  activeInstructions: string[]; // instruction ids (instruction names)
  onToggleInstruction: (instructionId: string) => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const CATEGORY_COLORS: Record<string, string> = {
  goalkeeper: 'bg-[#7AB4E8]/20 text-[#7AB4E8] border-[#7AB4E8]/30',
  defensive: 'bg-[#7EDBC8]/20 text-[#7EDBC8] border-[#7EDBC8]/30',
  midfield: 'bg-[#F0C87A]/20 text-[#F0C87A] border-[#F0C87A]/30',
  attacking: 'bg-[#E87878]/20 text-[#E87878] border-[#E87878]/30',
};

const CATEGORY_DOT_COLORS: Record<string, string> = {
  goalkeeper: 'bg-[#7AB4E8]',
  defensive: 'bg-[#7EDBC8]',
  midfield: 'bg-[#F0C87A]',
  attacking: 'bg-[#E87878]',
};

const CATEGORY_GLOW: Record<string, string> = {
  goalkeeper: 'shadow-[#7AB4E8]/40',
  defensive: 'shadow-[#7EDBC8]/40',
  midfield: 'shadow-[#F0C87A]/40',
  attacking: 'shadow-[#E87878]/40',
};

const INSTRUCTION_CATEGORY_LABELS: Record<string, string> = {
  team: 'Takım',
  attacking: 'Hücum',
  defensive: 'Savunma',
  set_piece: 'Set Piece',
};

const INSTRUCTION_CATEGORY_ICONS: Record<string, React.ReactNode> = {
  team: <Users className="w-3.5 h-3.5" />,
  attacking: <Zap className="w-3.5 h-3.5" />,
  defensive: <Shield className="w-3.5 h-3.5" />,
  set_piece: <Target className="w-3.5 h-3.5" />,
};

// Pairs of instruction names that conflict
const INSTRUCTION_CONFLICTS: [string, string][] = [
  ['Geriye Çekil', 'Baskı Yoğunluğu'],
  ['Bölge Markajı', 'Adam Markajı'],
  ['Zaman Kaybet', 'Tempo'],
  ['Yüzen Orta Açma', 'Sert Orta Açma'],
  ['Overlap Koşuları', 'Underlap Koşuları'],
  ['Görünen Şut', 'Kutu İçine Sok'],
  ['Savunma Hattı', 'Daha Derin İn'],
];

function hasConflict(id: string, activeIds: string[]): boolean {
  const inst = TACTICAL_INSTRUCTIONS.find(
    (t) => t.name === id || t.nameEn === id,
  );
  if (!inst) return false;
  for (const [a, b] of INSTRUCTION_CONFLICTS) {
    const nameA = inst.name;
    const partnerA = nameA === a ? b : nameA === b ? a : null;
    if (partnerA && activeIds.includes(partnerA)) return true;
  }
  return false;
}

function getPositionGroup(pos: string): string {
  if (pos === 'GK') return 'goalkeeper';
  if (['CB', 'LB', 'RB', 'LWB', 'RWB'].includes(pos)) return 'defensive';
  if (['CDM', 'CM', 'CAM', 'LM', 'RM', 'LW', 'RW'].includes(pos)) return 'midfield';
  return 'attacking';
}

function scoreColor(score: number): string {
  if (score >= 75) return 'text-emerald-400';
  if (score >= 50) return 'text-amber-400';
  return 'text-red-400';
}

function scoreRingColor(score: number): string {
  if (score >= 75) return 'stroke-emerald-400';
  if (score >= 50) return 'stroke-amber-400';
  return 'stroke-red-400';
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export default function TacticsRolesPanel({
  squad,
  currentFormation,
  onFormationChange,
  playerRoles,
  onRoleChange,
  activeInstructions,
  onToggleInstruction,
}: TacticsRolesPanelProps) {
  // ── State ──────────────────────────────────────────────────────────────
  const [selectedSlot, setSelectedSlot] = useState<{
    index: number;
    position: string;
  } | null>(null);
  const [hoveredRole, setHoveredRole] = useState<PlayerRole | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<
    Record<string, boolean>
  >({ team: true, attacking: false, defensive: false, set_piece: false });
  const rolePopupRef = useRef<HTMLDivElement>(null);

  // ── Derived ────────────────────────────────────────────────────────────
  const formation = useMemo(
    () =>
      FORMATION_TEMPLATES.find((f) => f.name === currentFormation) ??
      FORMATION_TEMPLATES[0],
    [currentFormation],
  );

  // Build squad slots for score calculation
  const squadSlots = useMemo(() => {
    return formation.positions
      .map((slot, idx) => {
        const player = squad[idx];
        if (!player) return null;
        return {
          player,
          position: slot.pos,
          roleId: playerRoles[player.id] ?? slot.defaultRole,
        };
      })
      .filter(Boolean) as {
      player: Player;
      position: string;
      roleId: string;
    }[];
  }, [formation, squad, playerRoles]);

  // ── Tactical Score ─────────────────────────────────────────────────────
  const tacticalScore = useMemo(() => {
    const instructions = activeInstructions.map((id) => {
      const inst = TACTICAL_INSTRUCTIONS.find(
        (t) => t.name === id || t.nameEn === id,
      );
      return {
        instructionName: inst?.name ?? id,
        option: inst?.options[0] ?? 'Evet',
      };
    });
    return calculateTacticalScore(squadSlots, {
      formation: currentFormation,
      instructions,
    });
  }, [squadSlots, currentFormation, activeInstructions]);

  // ── Role popup handlers ────────────────────────────────────────────────
  const handleSlotClick = useCallback(
    (index: number, position: string) => {
      setSelectedSlot((prev) =>
        prev?.index === index && prev?.position === position
          ? null
          : { index, position },
      );
      setHoveredRole(null);
    },
    [],
  );

  const handleRoleSelect = useCallback(
    (playerId: string, roleId: string) => {
      onRoleChange(playerId, roleId);
      setSelectedSlot(null);
    },
    [onRoleChange],
  );

  const toggleCategory = useCallback((cat: string) => {
    setExpandedCategories((prev) => ({ ...prev, [cat]: !prev[cat] }));
  }, []);

  // ── Compatible roles for selected slot ─────────────────────────────────
  const compatibleRoles = useMemo(() => {
    if (!selectedSlot) return [];
    return getCompatibleRoles(
      formation.positions[selectedSlot.index].pos as never,
    );
  }, [selectedSlot, formation]);

  const selectedPlayer = useMemo(() => {
    if (!selectedSlot) return null;
    return squad[selectedSlot.index] ?? null;
  }, [selectedSlot, squad]);

  // ── Grouped instructions ───────────────────────────────────────────────
  const groupedInstructions = useMemo(() => {
    const groups: Record<string, TacticalInstruction[]> = {};
    for (const inst of TACTICAL_INSTRUCTIONS) {
      if (!groups[inst.category]) groups[inst.category] = [];
      groups[inst.category].push(inst);
    }
    return groups;
  }, []);

  // ── Render: Formation Picker ───────────────────────────────────────────
  const renderFormationPicker = () => (
    <div className="mb-4">
      <div className="flex items-center gap-2 mb-3">
        <Shield className="w-4 h-4 text-amber-400" />
        <h3 className="text-xs font-bold uppercase tracking-widest text-white/70">
          Diziliş Seçimi
        </h3>
      </div>
      <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
        {FORMATION_TEMPLATES.map((fmt) => {
          const isSelected = fmt.name === currentFormation;
          return (
            <button
              key={fmt.name}
              onClick={() => onFormationChange(fmt.name)}
              className={`relative rounded-lg px-2 py-2.5 text-center transition-all border ${
                isSelected
                  ? 'bg-amber-500/15 border-amber-500/50 text-amber-300 shadow-lg shadow-amber-500/10'
                  : 'bg-white/[0.03] border-white/[0.06] text-white/50 hover:bg-white/[0.06] hover:text-white/70'
              }`}
              title={fmt.description}
            >
              {/* Mini formation icon */}
              <div className="flex flex-col items-center gap-1">
                <FormationIcon name={fmt.name} active={isSelected} />
                <span className="text-[10px] font-bold tracking-wider">
                  {fmt.name}
                </span>
              </div>
            </button>
          );
        })}
      </div>
      {formation && (
        <p className="mt-2 text-[10px] text-white/30 leading-relaxed px-1">
          {formation.description}
        </p>
      )}
    </div>
  );

  // ── Render: Pitch Visualization ────────────────────────────────────────
  const renderPitch = () => (
    <div className="relative w-full aspect-[3/2] rounded-xl overflow-hidden border-2 border-white/[0.08]">
      {/* Pitch background */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, #0f2a0f 0%, #1a3a1a 30%, #1e3e1e 50%, #1a3a1a 70%, #0f2a0f 100%)',
        }}
      />

      {/* Pitch markings */}
      <div className="absolute inset-0">
        {/* Center line */}
        <div className="absolute top-1/2 left-[4%] right-[4%] h-px bg-white/10" />
        {/* Center circle */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 sm:w-24 sm:h-24 rounded-full border border-white/10" />
        {/* Center dot */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-white/20" />
        {/* Top penalty area */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[50%] h-[14%] border-b border-l border-r border-white/10" />
        {/* Top goal area */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[24%] h-[6%] border-b border-l border-r border-white/10" />
        {/* Bottom penalty area */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[50%] h-[14%] border-t border-l border-r border-white/10" />
        {/* Bottom goal area */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[24%] h-[6%] border-t border-l border-r border-white/10" />
        {/* Side lines */}
        <div className="absolute top-0 left-[4%] right-[4%] bottom-0 border-l border-r border-white/[0.06]" />
      </div>

      {/* Player dots */}
      {formation.positions.map((slot, idx) => {
        const player = squad[idx];
        const roleId = player
          ? playerRoles[player.id] ?? slot.defaultRole
          : slot.defaultRole;
        const role = ROLES.find((r) => r.id === roleId);
        const posGroup = getPositionGroup(slot.pos);
        const isSelected =
          selectedSlot?.index === idx && selectedSlot?.position === slot.pos;

        return (
          <button
            key={`${slot.pos}-${idx}`}
            className="absolute -translate-x-1/2 -translate-y-1/2 z-10 group"
            style={{
              left: `${slot.x}%`,
              top: `${slot.y}%`,
            }}
            onClick={() => handleSlotClick(idx, slot.pos)}
          >
            {/* Glow ring */}
            <div
              className={`absolute -inset-2 rounded-full transition-all duration-200 ${
                isSelected
                  ? `bg-amber-500/30 ${CATEGORY_GLOW[posGroup] ?? ''} shadow-lg`
                  : 'bg-transparent group-hover:bg-white/10'
              }`}
            />
            {/* Main dot */}
            <div
              className={`relative w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-[11px] font-bold border-2 transition-all duration-200 ${
                isSelected
                  ? 'border-amber-400 bg-zinc-900 scale-110'
                  : `border-white/30 bg-zinc-900/90 group-hover:border-white/50`
              }`}
            >
              <span className="truncate px-0.5 text-white/90">
                {player ? player.name.charAt(0).toUpperCase() : '?'}
              </span>
              {/* Role indicator */}
              {role && (
                <div
                  className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[8px] ${
                    CATEGORY_DOT_COLORS[posGroup] ?? 'bg-zinc-500'
                  }`}
                >
                  {role.icon}
                </div>
              )}
            </div>
            {/* Label */}
            <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap">
              <span className="text-[8px] sm:text-[9px] font-bold text-white/40 uppercase tracking-wider">
                {slot.pos}
              </span>
            </div>
          </button>
        );
      })}

      {/* Role Selector Popup */}
      {selectedSlot && selectedPlayer && (
        <div
          ref={rolePopupRef}
          className="absolute z-50 inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => setSelectedSlot(null)}
        >
          <div
            className="relative w-[92%] max-w-md max-h-[80%] bg-[#0d1117] border border-white/[0.08] rounded-2xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Popup header */}
            <div className="flex items-center justify-between p-4 border-b border-white/[0.06]">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                    CATEGORY_DOT_COLORS[
                      getPositionGroup(
                        formation.positions[selectedSlot.index].pos,
                      )
                    ] ?? 'bg-zinc-600'
                  }`}
                >
                  {selectedPlayer.name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-bold text-white">
                    {selectedPlayer.name}
                  </p>
                  <p className="text-[10px] text-white/40 uppercase tracking-wider">
                    {formation.positions[selectedSlot.index].pos} · Oyuncu: {selectedPlayer.rating}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedSlot(null)}
                className="w-8 h-8 rounded-lg bg-white/[0.05] hover:bg-white/10 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4 text-white/60" />
              </button>
            </div>

            {/* Compatible roles list */}
            <div className="p-3 overflow-y-auto max-h-60">
              <p className="text-[10px] text-white/30 uppercase tracking-widest mb-2 px-1">
                Uyumlu Roller
              </p>
              <div className="space-y-2">
                {compatibleRoles.map((role) => {
                  const bonuses = getRoleAttributeBonuses(role.id);
                  const currentRoleId =
                    playerRoles[selectedPlayer.id] ??
                    formation.positions[selectedSlot.index].defaultRole;
                  const isCurrentRole = currentRoleId === role.id;

                  return (
                    <button
                      key={role.id}
                      onClick={() =>
                        handleRoleSelect(selectedPlayer.id, role.id)
                      }
                      className={`w-full text-left p-3 rounded-xl border transition-all ${
                        isCurrentRole
                          ? 'bg-amber-500/10 border-amber-500/30'
                          : 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.05] hover:border-white/[0.12]'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2.5">
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm shrink-0 ${
                              CATEGORY_COLORS[role.category] ?? ''
                            } border`}
                          >
                            {role.icon}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-white">
                                {role.name}
                              </span>
                              {isCurrentRole && (
                                <Check className="w-3 h-3 text-amber-400" />
                              )}
                            </div>
                            <p className="text-[9px] text-white/30 mt-0.5 leading-relaxed line-clamp-2">
                              {role.description}
                            </p>
                            {/* Attribute bonuses preview */}
                            <div className="flex flex-wrap gap-1 mt-1.5">
                              {Object.entries(bonuses)
                                .sort(([, a], [, b]) => b - a)
                                .slice(0, 4)
                                .map(([attr, val]) => (
                                  <span
                                    key={attr}
                                    className="text-[8px] px-1.5 py-0.5 rounded bg-white/[0.05] text-emerald-300/70 font-semibold"
                                  >
                                    +{val} {attr}
                                  </span>
                                ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Confirm */}
            <div className="p-3 border-t border-white/[0.06]">
              <button
                onClick={() => setSelectedSlot(null)}
                className="w-full py-2 rounded-lg bg-amber-500/10 text-amber-300 text-xs font-bold uppercase tracking-widest hover:bg-amber-500/20 transition-colors"
              >
                Onayla
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // ── Render: Instructions Panel ─────────────────────────────────────────
  const renderInstructions = () => (
    <div className="space-y-2">
      <div className="flex items-center gap-2 mb-3">
        <Activity className="w-4 h-4 text-amber-400" />
        <h3 className="text-xs font-bold uppercase tracking-widest text-white/70">
          Talimatlar
        </h3>
        <span className="text-[10px] text-white/30 ml-auto">
          {activeInstructions.length} aktif
        </span>
      </div>

      {(Object.entries(groupedInstructions) as [string, TacticalInstruction[]][]).map(([category, instructions]) => (
        <div
          key={category}
          className="rounded-xl border border-white/[0.06] overflow-hidden"
        >
          {/* Category header */}
          <button
            onClick={() => toggleCategory(category)}
            className="w-full flex items-center gap-2 px-3 py-2.5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
          >
            <span className="text-white/40">{INSTRUCTION_CATEGORY_ICONS[category]}</span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-white/60">
              {INSTRUCTION_CATEGORY_LABELS[category] ?? category}
            </span>
            <span className="text-[10px] text-white/25 ml-1">
              ({instructions.length})
            </span>
            <ChevronDown
              className={`w-3.5 h-3.5 text-white/30 ml-auto transition-transform ${
                expandedCategories[category] ? 'rotate-180' : ''
              }`}
            />
          </button>

          {/* Instructions list */}
          {expandedCategories[category] && (
            <div className="p-2 space-y-1">
              {instructions.map((inst) => {
                const isActive = activeInstructions.includes(inst.name);
                const isConflicting =
                  isActive && hasConflict(inst.name, activeInstructions);

                return (
                  <button
                    key={inst.name}
                    onClick={() => onToggleInstruction(inst.name)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-all border ${
                      isConflicting
                        ? 'bg-red-500/10 border-red-500/30'
                        : isActive
                          ? 'bg-amber-500/10 border-amber-500/20'
                          : 'bg-white/[0.01] border-transparent hover:bg-white/[0.04]'
                    }`}
                    title={inst.description}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {isActive ? (
                          <Check
                            className={`w-3.5 h-3.5 ${isConflicting ? 'text-red-400' : 'text-amber-400'}`}
                          />
                        ) : (
                          <div className="w-3.5 h-3.5 rounded border border-white/15" />
                        )}
                        <span
                          className={`text-[11px] font-semibold ${
                            isActive ? 'text-white/90' : 'text-white/40'
                          }`}
                        >
                          {inst.name}
                        </span>
                        {inst.options.length > 1 && (
                          <span className="text-[9px] text-white/25 ml-1">
                            {inst.options[0]}
                          </span>
                        )}
                      </div>
                      {isConflicting && (
                        <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                      )}
                    </div>
                    {isActive && !isConflicting && (
                      <p className="text-[9px] text-white/25 mt-1 ml-5.5 leading-relaxed">
                        {inst.description}
                      </p>
                    )}
                    {isConflicting && (
                      <p className="text-[9px] text-red-400/70 mt-1 ml-5.5">
                        Çakışan talimat!
                      </p>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      ))}
    </div>
  );

  // ── Render: Tactical Score Card ────────────────────────────────────────
  const renderTacticalScore = () => {
    const { overall, roleCompatibility, instructionSynergy, attributeFit, breakdown } =
      tacticalScore;
    const radius = 40;
    const circumference = 2 * Math.PI * radius;
    const progress = (overall / 100) * circumference;

    return (
      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
        <div className="flex items-center gap-2 mb-3">
          <Star className="w-4 h-4 text-amber-400" />
          <h3 className="text-xs font-bold uppercase tracking-widest text-white/70">
            Taktik Puanı
          </h3>
        </div>

        {/* Overall score ring */}
        <div className="flex items-center gap-5 mb-4">
          <div className="relative w-24 h-24 shrink-0">
            <svg
              className="w-24 h-24 -rotate-90"
              viewBox="0 0 100 100"
            >
              <circle
                cx="50"
                cy="50"
                r={radius}
                fill="none"
                stroke="rgba(255,255,255,0.06)"
                strokeWidth="6"
              />
              <circle
                cx="50"
                cy="50"
                r={radius}
                fill="none"
                className={scoreRingColor(overall)}
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={circumference - progress}
                style={{ transition: 'stroke-dashoffset 0.8s ease' }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={`text-2xl font-black ${scoreColor(overall)}`}>
                {overall}
              </span>
            </div>
          </div>

          {/* Sub-scores */}
          <div className="space-y-2 flex-1 min-w-0">
            <ScoreBar
              label="Rol Uyumu"
              value={roleCompatibility}
            />
            <ScoreBar
              label="Talimat Sinerjisi"
              value={instructionSynergy}
            />
            <ScoreBar
              label="Özellik Uyumu"
              value={attributeFit}
            />
          </div>
        </div>

        {/* Strengths & Weaknesses */}
        {breakdown.strengths.length > 0 && (
          <div className="mb-2">
            <p className="text-[9px] text-emerald-400/60 uppercase tracking-widest font-bold mb-1">
              Güçlü Yönler
            </p>
            {breakdown.strengths.map((s, i) => (
              <div key={i} className="flex items-center gap-1.5 mb-0.5">
                <Check className="w-3 h-3 text-emerald-400/50 shrink-0" />
                <span className="text-[10px] text-white/40">{s}</span>
              </div>
            ))}
          </div>
        )}
        {breakdown.weaknesses.length > 0 && (
          <div>
            <p className="text-[9px] text-red-400/60 uppercase tracking-widest font-bold mb-1">
              Zayıf Yönler
            </p>
            {breakdown.weaknesses.map((w, i) => (
              <div key={i} className="flex items-center gap-1.5 mb-0.5">
                <AlertTriangle className="w-3 h-3 text-red-400/50 shrink-0" />
                <span className="text-[10px] text-white/40">{w}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // ── Render: Role Details Card (hover) ──────────────────────────────────
  const renderRoleDetails = () => {
    if (!hoveredRole) return null;

    const bonuses = getRoleAttributeBonuses(hoveredRole.id);

    return (
      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
        <div className="flex items-center gap-2 mb-3">
          <Info className="w-4 h-4 text-amber-400" />
          <h3 className="text-xs font-bold uppercase tracking-widest text-white/70">
            Rol Detayı
          </h3>
        </div>

        <div className="flex items-center gap-3 mb-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg border ${
              CATEGORY_COLORS[hoveredRole.category] ?? ''
            }`}
          >
            {hoveredRole.icon}
          </div>
          <div>
            <p className="text-sm font-bold text-white">{hoveredRole.name}</p>
            <p className="text-[10px] text-white/30">{hoveredRole.nameEn}</p>
          </div>
        </div>

        <p className="text-[10px] text-white/40 leading-relaxed mb-3">
          {hoveredRole.description}
        </p>

        {/* Compatible positions */}
        <div className="mb-3">
          <p className="text-[9px] text-white/25 uppercase tracking-widest font-bold mb-1">
            Uyumlu Pozisyonlar
          </p>
          <div className="flex flex-wrap gap-1">
            {hoveredRole.compatiblePositions.map((pos) => (
              <span
                key={pos}
                className={`text-[9px] px-2 py-0.5 rounded-full border font-bold uppercase ${
                  CATEGORY_COLORS[getPositionGroup(pos)] ?? ''
                }`}
              >
                {pos}
              </span>
            ))}
          </div>
        </div>

        {/* Attribute bonuses */}
        <div className="mb-3">
          <p className="text-[9px] text-white/25 uppercase tracking-widest font-bold mb-1">
            Özellik Bonusları
          </p>
          <div className="grid grid-cols-2 gap-1">
            {Object.entries(bonuses)
              .sort(([, a], [, b]) => b - a)
              .map(([attr, val]) => (
                <div
                  key={attr}
                  className="flex items-center justify-between px-2 py-1 rounded bg-white/[0.03]"
                >
                  <span className="text-[9px] text-white/50">{attr}</span>
                  <span className="text-[10px] font-bold text-emerald-400">
                    +{val}
                  </span>
                </div>
              ))}
          </div>
        </div>

        {/* Play style affinity */}
        <div>
          <p className="text-[9px] text-white/25 uppercase tracking-widest font-bold mb-1">
            Oyun Stili Uyumu
          </p>
          <div className="space-y-1">
            {Object.entries(hoveredRole.playStyleAffinity).map(
              ([style, affinityRaw]) => {
                const affinity = affinityRaw as number;
                return (
                <div
                  key={style}
                  className="flex items-center gap-2 px-2 py-1 rounded bg-white/[0.02]"
                >
                  <span className="text-[9px] text-white/40 flex-1">{style}</span>
                  <div className="w-16 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        affinity >= 0.5
                          ? 'bg-emerald-400'
                          : affinity >= 0
                            ? 'bg-amber-400'
                            : 'bg-red-400'
                      }`}
                      style={{ width: `${Math.abs(affinity) * 100}%` }}
                    />
                  </div>
                  <span
                    className={`text-[9px] font-bold ${
                      affinity >= 0
                        ? 'text-emerald-300'
                        : 'text-red-300'
                    }`}
                  >
                    {affinity >= 0 ? '+' : ''}
                    {affinity.toFixed(1)}
                  </span>
                </div>
                );
              },
            )}
          </div>
        </div>
      </div>
    );
  };

  // ── Main Layout ────────────────────────────────────────────────────────
  return (
    <div className="w-full space-y-4">
      {/* Section 1: Formation Picker + Pitch */}
      <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-4">
        {/* Left: Formation + Instructions + Score */}
        <div className="space-y-4 max-h-[900px] overflow-y-auto pr-1 custom-scrollbar">
          {renderFormationPicker()}
          {renderInstructions()}
          {renderTacticalScore()}
        </div>

        {/* Right: Pitch */}
        <div className="space-y-4">
          {renderPitch()}
          {/* Role details when hovered */}
          {renderRoleDetails()}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

function FormationIcon({ name, active }: { name: string; active: boolean }) {
  // Simple formation visualization with dots
  const parts = name.split('-').map(Number);
  const totalLines = parts.length;
  const totalPlayers = parts.reduce((a, b) => a + b, 0);

  return (
    <svg
      viewBox="0 0 40 50"
      className={`w-8 h-10 ${active ? 'text-amber-400' : 'text-white/25'}`}
    >
      {/* Mini pitch outline */}
      <rect
        x="2"
        y="2"
        width="36"
        height="46"
        rx="2"
        fill="none"
        stroke="currentColor"
        strokeWidth="0.8"
        opacity="0.4"
      />
      {/* Center line */}
      <line
        x1="2"
        y1="25"
        x2="38"
        y2="25"
        stroke="currentColor"
        strokeWidth="0.5"
        opacity="0.3"
      />

      {/* Player dots */}
      {parts.map((count, lineIdx) => {
        const yBase = 8 + ((lineIdx + 1) / (totalLines + 1)) * 36;
        return Array.from({ length: count }).map((_, dotIdx) => {
          const x =
            count === 1
              ? 20
              : 6 + (dotIdx / (count - 1)) * 28;
          return (
            <circle
              key={`${lineIdx}-${dotIdx}`}
              cx={x}
              cy={yBase}
              r="2"
              fill="currentColor"
              opacity={active ? 0.9 : 0.5}
            />
          );
        });
      })}

      {/* GK */}
      <circle cx="20" cy="4.5" r="2" fill="currentColor" opacity={active ? 0.9 : 0.5} />
    </svg>
  );
}

function ScoreBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="space-y-0.5">
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-white/40">{label}</span>
        <span className={`text-[11px] font-bold ${scoreColor(value)}`}>
          {value}
        </span>
      </div>
      <div className="w-full h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            value >= 75
              ? 'bg-emerald-400'
              : value >= 50
                ? 'bg-amber-400'
                : 'bg-red-400'
          }`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}
