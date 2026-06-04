'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { List } from 'react-window';
import { 
  Dumbbell, Target, Shield, Zap, 
  TrendingUp, AlertTriangle, Star, 
  ChevronDown, ChevronUp, Heart, GraduationCap, Award,
  FlaskConical, BarChart3, AlertCircle, Lock
} from 'lucide-react';
import type { Player, TrainingState, TrainingAssignment, TrainingProgramId, TrainingSessionResult } from '@/lib/fm/types';
import { TRAINING_PROGRAMS } from '@/lib/fm/constants';
import { runTrainingSession, isProgramCompatible, getRecommendedProgram } from '@/lib/fm/trainingEngine';
import { toTitleCase, getPosRowStyle, getPosGroup, getPlayerPos } from '@/lib/fm/ui-helpers';
import { useFM } from '@/lib/fm/GameContext';
import { useToast } from '@/hooks/use-toast';
import TacticLab from './TacticLab';

// ─────────────────────────────────────────────────
// PROGRAM ICON MAP
// ─────────────────────────────────────────────────
const programIcons: Record<string, React.ReactNode> = {
  fiziksel_yukleme:      <Dumbbell size={14} />,
  teknik_driller:        <Target size={14} />,
  savunma_okulu:         <Shield size={14} />,
  bitiricilik_kampi:     <Zap size={14} />,
  kaleci_antrenmani:     <span className="text-sm leading-none">🧤</span>,
  set_parcasi:           <span className="text-sm leading-none">📐</span>,
  zihinsel_hazirlik:     <span className="text-sm leading-none">🧠</span>,
  kondisyon_toparlanma:  <span className="text-sm leading-none">🔋</span>,
  takim_kimyasi:         <span className="text-sm leading-none">🤝</span>,
  pozisyon_adaptasyonu:  <span className="text-sm leading-none">🔄</span>,
};

const programColorMap: Record<string, { bg: string; border: string; text: string; glow: string }> = {
  red:     { bg: 'bg-red-500/10',     border: 'border-red-500/20',     text: 'text-red-400',     glow: 'bg-red-500/5' },
  blue:    { bg: 'bg-blue-500/10',    border: 'border-blue-500/20',    text: 'text-blue-400',    glow: 'bg-blue-500/5' },
  green:   { bg: 'bg-green-500/10',   border: 'border-green-500/20',   text: 'text-green-400',   glow: 'bg-green-500/5' },
  amber:   { bg: 'bg-amber-500/10',   border: 'border-amber-500/20',   text: 'text-amber-400',   glow: 'bg-amber-500/5' },
  cyan:    { bg: 'bg-cyan-500/10',    border: 'border-cyan-500/20',    text: 'text-cyan-400',    glow: 'bg-cyan-500/5' },
  purple:  { bg: 'bg-purple-500/10',  border: 'border-purple-500/20',  text: 'text-purple-400',  glow: 'bg-purple-500/5' },
  indigo:  { bg: 'bg-indigo-500/10',  border: 'border-indigo-500/20',  text: 'text-indigo-400',  glow: 'bg-indigo-500/5' },
  emerald: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-400', glow: 'bg-emerald-500/5' },
  orange:  { bg: 'bg-orange-500/10',  border: 'border-orange-500/20',  text: 'text-orange-400',  glow: 'bg-orange-500/5' },
  yellow:  { bg: 'bg-yellow-500/10',  border: 'border-yellow-500/20',  text: 'text-yellow-400',  glow: 'bg-yellow-500/5' },
};

const STAT_LABELS: Record<string, string> = {
  speed: 'Hız',
  power: 'Güç',
  passing: 'Pas',
  shooting: 'Şut',
  defending: 'Tk',
  vision: 'Alg',
  control: 'Top',
  stamina: 'Kond',
  heading: 'Kfa',
  goalkeeping: 'Klc',
  reflexes: 'Ref',
  concentration: 'Kons',
  decisions: 'Karar',
  composure: 'Soğ',
  teamwork: 'Takım',
  positioning: 'Poz',
};

// ─── react-window satır verisi tipi ────────────────────────────────
interface AntrenmanSatirVerisi {
  kadro: Player[];
  atamaHaritasi: Map<string, TrainingAssignment>;
  seciliProgram: TrainingProgramId | null;
  kadroGuncelle: (squad: Player[]) => void;
  oyuncuTikla?: (player: Player) => void;
  atamaDegistir: (playerId: string, programId: TrainingProgramId) => void;
  atamaKaldir: (playerId: string) => void;
  odakAyarla: (playerId: string, stat: string | null) => void;
}

// ─── react-window v2 satır bileşeni (memoize) ──────────────────────
const AntrenmanSatirBilesen = React.memo(function AntrenmanSatirBilesen({
  index, style, ariaAttributes, kadro, atamaHaritasi, seciliProgram,
  kadroGuncelle, oyuncuTikla, atamaDegistir, atamaKaldir, odakAyarla,
}: {
  ariaAttributes: { "aria-posinset": number; "aria-setsize": number; role: "listitem" };
  index: number;
  style: React.CSSProperties;
} & AntrenmanSatirVerisi): React.ReactElement | null {
  const player = kadro[index];
  if (!player) return null;

  const assignment = atamaHaritasi.get(player.id);
  const program = assignment ? TRAINING_PROGRAMS.find(p => p.id === assignment.programId) : null;
  const isU21 = player.age <= 21;
  const cond = player.cond || 100;
  const rating = player.rating || 50;

  const stats = [
    { label: 'Klt', val: Math.round(player.potential || rating), key: 'potential' },
    { label: 'Klc', val: Math.round(player.goalkeeping || (player.position === 'GK' ? rating * 1.05 : rating * 0.12)), key: 'goalkeeping' },
    { label: 'Tk', val: Math.round(player.defending || rating), key: 'defending' },
    { label: 'Pas', val: Math.round(player.passing || rating), key: 'passing' },
    { label: 'Şut', val: Math.round(player.shooting || rating), key: 'shooting' },
    { label: 'Kfa', val: Math.round(player.heading || rating * 0.95), key: 'heading' },
    { label: 'Hız', val: Math.round(player.speed || rating), key: 'speed' },
    { label: 'Güç', val: Math.round(player.power || rating), key: 'power' },
    { label: 'Alg', val: Math.round(player.vision || rating), key: 'vision' },
    { label: 'Top', val: Math.round(player.control || rating), key: 'control' },
    { label: 'Tplm', val: Math.round(rating * 11.2), key: 'total' },
    { label: 'Knd', val: Math.round(cond), key: 'cond' },
    { label: 'Ort', val: rating.toFixed(0), key: 'rating' }
  ];

  const posColor = getPosRowStyle(player.specificPosition || player.position);

  return (
    <div style={style} {...ariaAttributes}
      className={`flex items-center gap-4 px-4 py-2 border-b border-white/[0.03] transition-all hover:bg-white/[0.05] ${posColor || 'border-l-4 border-l-transparent'}`}>
      
      {/* Pozisyon rozeti ve İsim */}
      <div className="w-48 shrink-0 flex items-center gap-3">
        <div className={`w-8 h-8 flex items-center justify-center text-[9px] font-black rounded shrink-0 ${
          isU21 ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' : 'bg-white/5 text-white/40'
        }`}>
          {player.specificPosition || player.position}
        </div>
        <button 
          onClick={() => oyuncuTikla?.(player)}
          className="min-w-0 text-left hover:opacity-70 transition-opacity"
        >
          <div className="text-[10px] font-black tracking-tight truncate text-white/90">{toTitleCase(player.name)}</div>
          <div className="text-[7px] text-white/20 font-bold uppercase tracking-widest">{player.age} yaş {isU21 && <span className="text-emerald-400/60">• ACADEMY</span>}</div>
        </button>
      </div>

      {/* Hızlı Ekle Butonu */}
      <div className="w-32 shrink-0 flex items-center gap-2">
        <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-lg p-1">
          {assignment ? (
            <button 
              onClick={(e) => { e.stopPropagation(); atamaKaldir(player.id); }}
              className="w-7 h-7 rounded flex items-center justify-center bg-emerald-500 text-black shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all hover:scale-110 active:scale-90"
              title="Programdan Çıkar"
            >
              <Zap size={14} fill="black" />
            </button>
          ) : seciliProgram ? (() => {
            const compatible = isProgramCompatible(player, seciliProgram);
            return compatible ? (
              <button 
                onClick={(e) => { e.stopPropagation(); atamaDegistir(player.id, seciliProgram); }}
                className="w-7 h-7 rounded flex items-center justify-center bg-white/10 border border-white/20 text-white/40 hover:bg-emerald-500/20 hover:text-emerald-400 hover:border-emerald-500/40 transition-all hover:scale-110"
                title="Programa Ekle"
              >
                <Zap size={14} />
              </button>
            ) : (
              <div
                className="w-7 h-7 rounded flex items-center justify-center bg-red-500/10 border border-red-500/20 text-red-400/60 cursor-not-allowed"
                title="Bu program bu pozisyon için uygun değil"
              >
                <span className="text-[10px]">✕</span>
              </div>
            );
          })() : (
            <div className="w-7 h-7 rounded bg-white/[0.02] border border-white/5 flex items-center justify-center opacity-20">
               <Zap size={10} />
            </div>
          )}

          {/* Şahsi Gelişim Butonu */}
          <button 
            onClick={(e) => { e.stopPropagation(); oyuncuTikla?.(player); }}
            className={`w-7 h-7 rounded flex items-center justify-center transition-all hover:scale-110 ${
              assignment?.focusedStat 
                ? 'bg-blue-500/20 border border-blue-500/40 text-blue-400' 
                : 'bg-white/5 border border-white/10 text-white/20 hover:bg-emerald-500/10 hover:text-emerald-400 hover:border-emerald-500/30'
            }`}
            title={assignment?.focusedStat ? `Focus: ${STAT_LABELS[assignment.focusedStat]}` : "Şahsi Gelişim Arttır"}
          >
            <TrendingUp size={14} className={assignment?.focusedStat ? "animate-pulse" : ""} />
          </button>
        </div>
      </div>

      {/* Mini Stat'ler (13 sütun) */}
      <div className="flex-1 grid grid-cols-13 gap-px bg-white/5 rounded overflow-hidden p-px">
        {stats.map(s => {
          const isFocused = assignment?.focusedStat === s.key;
          const isTrainable = s.key !== 'total' && s.key !== 'rating' && s.key !== 'cond' && s.key !== 'potential';
          return (
            <div 
              key={s.label} 
              onClick={() => {
                if (isTrainable) {
                  if (!assignment) {
                    atamaDegistir(player.id, getRecommendedProgram(player) as TrainingProgramId);
                  }
                  odakAyarla(player.id, isFocused ? null : s.key);
                }
              }}
              className={`flex flex-col items-center justify-center py-1.5 transition-all cursor-pointer ${
                isFocused ? 'bg-[#000080] text-white border border-blue-400/50 shadow-[inset_0_0_10px_rgba(59,130,246,0.3)]' : 'bg-black/40 hover:bg-white/5'
              }`}
            >
              <span className={`text-[10px] font-mono font-bold ${
                isFocused ? 'text-white' :
                s.label === 'Knd' ? (Number(s.val) >= 70 ? 'text-emerald-400' : Number(s.val) >= 40 ? 'text-amber-400' : 'text-red-400') : 
                Number(s.val) >= 85 ? 'text-amber-400' : Number(s.val) >= 75 ? 'text-emerald-400' : 'text-white/60'
              }`}>{s.val}</span>
            </div>
          );
        })}
      </div>

      {/* Dinlenme Butonu */}
      <button 
        onClick={(e) => {
          e.stopPropagation();
          const guncelKadro = kadro.map(p => p.id === player.id ? { ...p, isResting: !p.isResting } : p);
          kadroGuncelle(guncelKadro);
        }}
        className={`w-8 h-8 flex-shrink-0 flex items-center justify-center rounded border transition-all ${
          player.isResting ? 'bg-amber-500/20 border-amber-500 text-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.2)]' : 'bg-white/5 border-white/10 text-white/20'
        }`}
      >
        {player.isResting ? <Heart size={10} fill="currentColor" /> : <Heart size={10} />}
      </button>

      {/* Program Rozeti */}
      <div className="w-16 flex justify-end">
        <AnimatePresence>
        {assignment && (
          <motion.div 
            key="badge"
            initial={{ scale: 0, rotate: -45 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0 }}
            className="bg-white/5 px-2 py-1 rounded text-[7px] font-black uppercase text-white/30 border border-white/5"
          >
             {TRAINING_PROGRAMS.find(p => p.id === assignment.programId)?.name.slice(0, 3)}
          </motion.div>
        )}
        </AnimatePresence>
      </div>
    </div>
  );
});

// ─────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────

interface TrainingAcademyProps {
  squad: Player[];
  trainingState: TrainingState;
  onTrainingStateChange: (state: TrainingState) => void;
  onSquadUpdate: (squad: Player[]) => void;
  onPlayerClick?: (player: Player) => void;
  isAdmin?: boolean;
}

export default function TrainingAcademy({ 
  squad, trainingState, onTrainingStateChange, onSquadUpdate, onPlayerClick, isAdmin
}: TrainingAcademyProps) {
  
  const { profile } = useFM();
  const { toast } = useToast();
  const [hasAnalyst, setHasAnalyst] = useState(false);
  const [analystStars, setAnalystStars] = useState(0);
  const [analystLoading, setAnalystLoading] = useState(true);
  const [assistantCoachCount, setAssistantCoachCount] = useState(0);
  const [topCoachStars, setTopCoachStars] = useState(0);
  const [staffLoading, setStaffLoading] = useState(true);

  // ── Check if user has analyst and assistant_coach staff members ──
  useEffect(() => {
    const checkStaff = async () => {
      if (!profile?.id) {
        setAnalystLoading(false);
        setStaffLoading(false);
        return;
      }
      try {
        const res = await fetch(`/api/staff?userId=${profile.id}`);
        if (!res.ok) throw new Error('Failed to fetch staff');
        const data = await res.json();
        const staffList = data.staff || [];
        const analyst = staffList.find((s: any) => s.type === 'analyst');
        setHasAnalyst(!!analyst);
        setAnalystStars(analyst?.stars || 0);
        const assistantCoaches = staffList.filter((s: any) => s.type === 'coach' || s.type === 'assistant_coach');
        setAssistantCoachCount(assistantCoaches.length);
        const maxStars = assistantCoaches.reduce((max: number, c: any) => Math.max(max, c.stars || 0), 0);
        setTopCoachStars(maxStars);
      } catch (err) {
        console.error('[TrainingAcademy] Staff check error:', err);
      } finally {
        setAnalystLoading(false);
        setStaffLoading(false);
      }
    };
    checkStaff();
  }, [profile?.id]);

  // ── Generate analyst recommendation based on squad data ──
  const analystRecommendation = useMemo(() => {
    if (!hasAnalyst || squad.length === 0) return null;
    
    const avgCond = squad.reduce((sum, p) => sum + (p.cond || 100), 0) / squad.length;
    const lowCondPlayers = squad.filter(p => (p.cond || 100) < 50).length;
    const avgAge = squad.reduce((sum, p) => sum + (p.age || 25), 0) / squad.length;
    const weakStats: { stat: string; avg: number }[] = [];
    
    const statKeys = ['speed', 'power', 'passing', 'shooting', 'defending', 'vision', 'control'];
    statKeys.forEach(key => {
      const avg = squad.reduce((sum, p) => sum + ((p as any)[key] || 50), 0) / squad.length;
      weakStats.push({ stat: key, avg });
    });
    weakStats.sort((a, b) => a.avg - b.avg);
    
    const weakest = weakStats.slice(0, 2);
    const statLabels: Record<string, string> = {
      speed: 'Hiz', power: 'Guc', passing: 'Pas', shooting: 'Sut',
      defending: 'Tk', vision: 'Alg', control: 'Top'
    };
    
    let recommendation = '';
    if (lowCondPlayers > 5) {
      recommendation = `Kadroda ${lowCondPlayers} oyuncunun kondisyonu kritik seviyede (%50 alti). Oncelikle dinlenme ve fiziksel yukleme programlarina agirlik verin.`;
    } else if (avgCond < 65) {
      recommendation = `Ortalama kondisyon %${Math.round(avgCond)} seviyesinde. Fiziksel yukleme ve dinlenme programlarini dengeleyin. Mac oncesi dinlenme oneriyoruz.`;
    } else if (weakest.length > 0) {
      recommendation = `En zayif alanlar: ${weakest.map(w => `${statLabels[w.stat] || w.stat} (Ort: ${Math.round(w.avg)})`).join(', ')}. Bu istatistiklere odakli antrenman programlari oneriyoruz.`;
    } else {
      recommendation = `Kadro ortalamasi iyi seviyede. Yas ortalamasi ${Math.round(avgAge)} - ${avgAge < 24 ? 'genc kadro icin teknik gelisim oncelikli.' : avgAge > 30 ? 'deneyimli kadro icin fiziksel idame onemli.' : 'dengeli bir antrenman programi uygulayabilirsiniz.'}`;
    }
    
    return recommendation;
  }, [hasAnalyst, squad]);

  const [selectedProgram, setSelectedProgram] = useState<TrainingProgramId | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showTacticLab, setShowTacticLab] = useState(false);
  const [sortBy, setSortBy] = useState<'name' | 'rating' | 'cond' | 'age' | 'position' | 'assignment' | 'Klt' | 'Klc' | 'Tk' | 'Pas' | 'Sut' | 'Kfa' | 'Hız' | 'Güç' | 'Alg' | 'Top' | 'total'>('rating');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [filterPos, setFilterPos] = useState<string>('ALL');

  // ── Training feedback state ──
  const [isTraining, setIsTraining] = useState(false);
  const [lastTrainingResults, setLastTrainingResults] = useState<Record<string, TrainingSessionResult> | null>(null);

  // ── Daily training counter ──
  const today = new Date().toISOString().split('T')[0];
  const sessionsToday = trainingState?.lastTrainingDate === today
    ? (trainingState?.dailyTrainingCount || 0) : 0;

  // ── Assigned players map ──
  const assignmentMap = useMemo(() => {
    const map = new Map<string, TrainingAssignment>();
    const assignments = trainingState?.assignments || [];
    assignments.forEach(a => map.set(a.playerId, a));
    return map;
  }, [trainingState?.assignments]);

  // ── Position group sort order ──
  const POS_GROUP_ORDER: Record<string, number> = { GK: 0, DEF: 1, MID: 2, FWD: 3, SUB: 4 };

  // ── Helper: get sort value for a player by key ──
  const getSortValue = useCallback((p: Player, key: typeof sortBy, assignmentMap: Map<string, TrainingAssignment>): any => {
    switch (key) {
      case 'name': return p.name;
      case 'position': return p.position;
      case 'assignment': {
        // Sort by assignment status: assigned players first, then by program name
        const a = assignmentMap.get(p.id);
        if (!a) return 'zzz_none'; // Unassigned sort last
        return `aaa_${a.programId}`; // Assigned sort first, grouped by program
      }
      case 'total': return p.rating * 11.2;
      case 'Klt': return (p as any).potential ?? p.potential ?? p.rating;
      case 'Klc': return (p as any).goalkeeping ?? p.goalkeeping ?? (p.position === 'GK' ? p.rating * 1.05 : p.rating * 0.12);
      case 'Tk': return (p as any).defending ?? p.defending ?? p.rating;
      case 'Pas': return (p as any).passing ?? p.passing ?? p.rating;
      case 'Sut': return (p as any).shooting ?? p.shooting ?? p.rating;
      case 'Kfa': return (p as any).heading ?? p.heading ?? p.rating * 0.95;
      case 'Hız': return (p as any).speed ?? p.speed ?? p.rating;
      case 'Güç': return (p as any).power ?? p.power ?? p.rating;
      case 'Alg': return (p as any).vision ?? p.vision ?? p.rating;
      case 'Top': return (p as any).control ?? p.control ?? p.rating;
      case 'rating': return p.rating;
      case 'cond': return (p as any).fitness ?? p.cond ?? 100;
      default: return p.rating;
    }
  }, []);

  // ── Filtered & sorted players ──
  const filteredSquad = useMemo(() => {
    let list = [...(squad || [])];
    if (filterPos !== 'ALL') list = list.filter(p => p.position === filterPos);
    
    // When sorting by position: primary = position group, secondary = rating
    // When sorting by any stat: primary = that stat, secondary = position group (for ties)
    list.sort((a, b) => {
      if (sortBy === 'position') {
        // Position sort: group first, then name
        const posA = getPlayerPos(a as unknown as Record<string, unknown>);
        const posB = getPlayerPos(b as unknown as Record<string, unknown>);
        const groupA = POS_GROUP_ORDER[getPosGroup(posA)] ?? 4;
        const groupB = POS_GROUP_ORDER[getPosGroup(posB)] ?? 4;
        if (groupA !== groupB) return groupA - groupB;
        return a.name.localeCompare(b.name);
      }

      // Stat sort: primary = selected stat value, secondary = position group for ties
      const valA = getSortValue(a, sortBy, assignmentMap);
      const valB = getSortValue(b, sortBy, assignmentMap);

      let cmp: number;
      if (typeof valA === 'string') {
        cmp = sortDirection === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      } else {
        cmp = sortDirection === 'asc' ? valA - valB : valB - valA;
      }

      // If values are equal, break tie by position group then name
      if (cmp === 0) {
        const posA = getPlayerPos(a as unknown as Record<string, unknown>);
        const posB = getPlayerPos(b as unknown as Record<string, unknown>);
        const groupA = POS_GROUP_ORDER[getPosGroup(posA)] ?? 4;
        const groupB = POS_GROUP_ORDER[getPosGroup(posB)] ?? 4;
        if (groupA !== groupB) return groupA - groupB;
        return a.name.localeCompare(b.name);
      }

      return cmp;
    });
    return list;
  }, [squad, filterPos, sortBy, sortDirection, getSortValue, assignmentMap]);

  const toggleSort = (key: any) => {
    if (sortBy === key) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(key);
      setSortDirection('desc');
    }
  };

  // ── Assign player to program ──
  const assignPlayer = useCallback((playerId: string, programId: TrainingProgramId) => {
    const assignments = trainingState?.assignments || [];
    const existing = assignments.filter(a => a.playerId !== playerId);
    const newAssignment: TrainingAssignment = { playerId, programId };
    onTrainingStateChange({
      ...trainingState,
      assignments: [...existing, newAssignment],
    });
  }, [trainingState, onTrainingStateChange]);

  // ── Remove assignment ──
  const removeAssignment = useCallback((playerId: string) => {
    const assignments = trainingState?.assignments || [];
    onTrainingStateChange({
      ...trainingState,
      assignments: assignments.filter(a => a.playerId !== playerId),
    });
  }, [trainingState, onTrainingStateChange]);

  // ── Set focused stat for a player ──
  const setPlayerFocus = useCallback((playerId: string, stat: string | null) => {
    const assignments = trainingState?.assignments || [];
    const exists = assignments.some(a => a.playerId === playerId);
    
    let newAssignments;
    if (exists) {
      newAssignments = assignments.map(a => {
        if (a.playerId === playerId) return { ...a, focusedStat: stat as keyof Player || undefined };
        return a;
      });
    } else {
      newAssignments = [...assignments, { 
        playerId, 
        programId: getRecommendedProgram({ id: playerId } as any) as any,
        focusedStat: stat as keyof Player || undefined 
      }];
    }
    onTrainingStateChange({ ...trainingState, assignments: newAssignments });
  }, [trainingState, onTrainingStateChange]);

  // ── Toggle player assignment ──
  const togglePlayerAssignment = useCallback((playerId: string, programId: TrainingProgramId) => {
    const assignments = trainingState?.assignments || [];
    const existing = assignments.find(a => a.playerId === playerId);
    
    if (existing && existing.programId === programId) {
      removeAssignment(playerId);
    } else {
      assignPlayer(playerId, programId);
    }
  }, [trainingState, assignPlayer, removeAssignment]);

  // ── Run training session ──
  const handleRunSession = useCallback(async () => {
    const assignments = trainingState?.assignments || [];
    if (assignments.length === 0) return;

    // Günlük antrenman limiti kontrolü
    const sessionToday = new Date().toISOString().split('T')[0];
    const lastDate = trainingState?.lastTrainingDate;
    const todayCount = lastDate === sessionToday ? (trainingState?.dailyTrainingCount || 0) : 0;

    if (todayCount >= 2) {
      return;
    }

    setIsTraining(true);

    try {
      // İkinci antrenmanda kondisyon kaybı artar (yorgunluk birikimi)
      const sessionMultiplier = todayCount === 1 ? 1.5 : 1.0;
      const facilityLevel = (profile as any)?.stadium_upgrades?.training || 0;
      const { updatedSquad, results } = runTrainingSession(squad, trainingState!, sessionMultiplier, {
        trainingFacilityLevel: facilityLevel,
        coachStars: topCoachStars,
      });
      onSquadUpdate(updatedSquad);
      onTrainingStateChange({
        ...(trainingState || {}),
        lastSessionResults: results,
        lastTrainingDate: sessionToday,
        dailyTrainingCount: todayCount + 1,
      } as TrainingState);

      // Show training results
      setLastTrainingResults(results);

      // Antrenman özet toast
      const _allGains = Object.values(results)
        .flatMap(r => Object.values(r.statsGained || {}));
      const _totalGain = _allGains.reduce((a, b) => a + (b as number || 0), 0);
      const _count = Object.keys(results).length;
      if (_totalGain > 0) {
        toast({
          title: 'Antrenman Tamamlandı',
          description: `${_count} oyuncu · Toplam +${_totalGain.toFixed(1)} puan gelişim`,
        });
      }

      // Antrenman sonuçlarını veritabanına kaydet
      try {
        const { saveTrainingResults } = await import('@/lib/fm/trainingEngine');
        const saveResult = await saveTrainingResults(
          results,
          updatedSquad,
          profile?.id || '',
          trainingState?.sessionType || 'morning',
          profile?.team_name || '',
        );
        if (saveResult.errors.length > 0) {
          console.warn('[TrainingAcademy] Save errors:', saveResult.errors);
        }
      } catch (saveErr) {
        console.warn('[TrainingAcademy] Failed to save training results:', saveErr);
      }
    } finally {
      setIsTraining(false);
    }
  }, [squad, trainingState, onSquadUpdate, onTrainingStateChange, profile?.id]);

  // ── Recover stamina ──
  const handleRecover = useCallback(() => {
    const recovered = squad.map(p => ({ ...p, cond: Math.min(100, (p.cond || 100) + 20) }));
    onSquadUpdate(recovered);
  }, [squad, onSquadUpdate]);

  // ── Coach quality change ──
  const handleCoachChange = useCallback((val: number) => {
    onTrainingStateChange({ ...(trainingState || {}), coachQuality: val } as TrainingState);
  }, [trainingState, onTrainingStateChange]);

  return (
    <div className="space-y-3 pb-6 animate-in fade-in duration-500">
      
      {/* ═══ HEADER — Green/Teal accent ═══ */}
      <div className="flex items-center justify-between px-3 py-2 bg-gradient-to-r from-emerald-950/60 to-teal-950/40 border border-emerald-500/15 rounded">
        <div className="flex items-center gap-3">
          <GraduationCap size={18} className="text-emerald-400" />
          <div>
            <h2 className="text-sm font-black italic uppercase tracking-tighter text-emerald-100">Training & Academy</h2>
            <span className="text-[7px] text-emerald-400/40 uppercase tracking-[0.3em] font-black">OYUNCU GELİŞİM MERKEZİ</span>
          </div>
        </div>

        <button 
          onClick={() => { if (assistantCoachCount >= 1) setShowTacticLab(true); }}
          disabled={assistantCoachCount < 1}
          className={`group relative flex items-center gap-3 px-6 py-2 rounded-lg transition-all transform ${
            assistantCoachCount >= 1 
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:shadow-[0_0_30px_rgba(37,99,235,0.6)] active:scale-95' 
              : 'bg-gradient-to-r from-gray-700 to-gray-800 cursor-not-allowed opacity-50'
          }`}
        >
           <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg" />
           <div className="relative flex items-center gap-2">
              {assistantCoachCount < 1 ? (
                <Lock size={16} className="text-white/40" />
              ) : (
                <FlaskConical size={16} className="text-white animate-pulse" />
              )}
              <div className="flex flex-col items-start leading-none">
                 <span className="text-[10px] font-black text-white uppercase tracking-wider">9v9 LABORATUVARI</span>
                 <span className="text-[6px] text-blue-200 uppercase font-bold tracking-widest">TAKTIK TEST MERKEZİ</span>
              </div>
           </div>
           {assistantCoachCount < 1 && (
             <span className="ml-2 text-[6px] text-amber-400/80 font-bold uppercase tracking-wider whitespace-nowrap">
               En az 1 Yardımcı Antrenör gerekir
             </span>
           )}
        </button>

        <div className="flex items-center gap-2">
          {/* Daily Training Counter */}
          <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded">
            <div className="flex gap-0.5">
              {[0, 1].map(i => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full ${i < sessionsToday ? 'bg-emerald-400' : 'bg-white/10'}`}
                />
              ))}
            </div>
            <span className="text-emerald-400 text-[7px] font-black uppercase tracking-widest">{sessionsToday}/2</span>
          </div>
          <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[7px] font-black uppercase tracking-widest">
            {trainingState?.assignments?.length || 0} ATAMA
          </span>
          <span className={`px-2 py-0.5 border text-[7px] font-black uppercase tracking-widest ${
            (trainingState?.coachQuality || 1.0) >= 1.5 ? 'bg-red-500/10 border-red-500/20 text-red-400' :
            (trainingState?.coachQuality || 1.0) >= 1.0 ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
            'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
          }`}>
            YOĞUNLUK: {(trainingState?.coachQuality || 1.0).toFixed(1)}x
          </span>
        </div>
      </div>

      {/* ═══ TACTIC LAB MODAL ═══ */}
      <AnimatePresence>
        {showTacticLab && (
          <TacticLab 
            onClose={() => setShowTacticLab(false)} 
            squad={squad}
          />
        )}
      </AnimatePresence>

      {/* ═══ PROGRAM SELECTOR + COACH + ACTIONS ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-2">
        
        {/* Program Cards */}
        <div className="lg:col-span-3 grid grid-cols-2 md:grid-cols-5 gap-2">
          {TRAINING_PROGRAMS.map(prog => {
            const colors = programColorMap[prog.color] || programColorMap.red;
            const assignedCount = (trainingState?.assignments || []).filter(a => a.programId === prog.id).length;
            const isSelected = selectedProgram === prog.id;
            const allowedLabel = prog.allowedPositions === 'ALL' ? 'Tümü' :
              prog.allowedPositions === 'GK' ? 'Kaleci' :
              prog.allowedPositions === 'FIELD' ? 'Saha' :
              Array.isArray(prog.allowedPositions) ? (prog.allowedPositions as string[]).join('/') : '';
            return (
              <button key={prog.id} onClick={() => setSelectedProgram(isSelected ? null : prog.id as TrainingProgramId)}
                className={`p-3 border text-left transition-all relative overflow-hidden ${
                  isSelected ? `${colors.bg} ${colors.border}` : 'bg-white/[0.02] border-white/5 hover:border-white/15'
                }`}>
                <div className="flex items-center gap-2 mb-1">
                  <div className={`w-7 h-7 rounded flex items-center justify-center ${colors.bg} ${colors.text}`}>
                    {programIcons[prog.id]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`text-[8px] font-black uppercase tracking-wide leading-snug ${isSelected ? colors.text : 'text-white/60'}`}>{prog.name}</div>
                    <span className={`text-[6px] font-black px-1 rounded ${colors.bg} ${colors.text}`}>{allowedLabel}</span>
                  </div>
                </div>
                <div className="text-[6px] text-white/20 leading-relaxed mb-1">{prog.description}</div>
                <div className="flex items-center justify-between">
                  <span className="text-[6px] text-white/15 font-black uppercase">{(prog.targetStats as unknown as string[]).map(s => STAT_LABELS[s] || s).join(', ')}</span>
                  {assignedCount > 0 && (
                    <span className={`text-[8px] font-black ${colors.text}`}>{assignedCount}</span>
                  )}
                </div>
                {isSelected && <div className={`absolute inset-0 ${colors.glow} opacity-50 pointer-events-none`} />}
              </button>
            );
          })}
        </div>

        {/* Coach Quality + Actions */}
        <div className="lg:col-span-2 space-y-2">
          {/* Training Intensity */}
          <div className="p-3 bg-emerald-950/30 border border-emerald-500/10 rounded space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-[7px] text-emerald-300/40 uppercase font-black tracking-[0.3em] flex items-center gap-1">
                <AlertTriangle size={10} className="text-emerald-400" /> ANTRENMAN YOĞUNLUĞU
              </span>
              <div className="flex items-center gap-2">
                <span className={`text-sm font-black italic ${(trainingState?.coachQuality || 1.0) >= 1.5 ? 'text-red-400' : (trainingState?.coachQuality || 1.0) >= 1.0 ? 'text-emerald-300' : 'text-emerald-500'}`}>
                  {(trainingState?.coachQuality || 1.0).toFixed(1)}x
                </span>
                {/* Risk Level Badge */}
                <span className={`px-1.5 py-0.5 rounded text-[6px] font-black uppercase tracking-wider ${
                  (trainingState?.coachQuality || 1.0) >= 1.5
                    ? 'bg-red-500/20 border border-red-500/30 text-red-400'
                    : (trainingState?.coachQuality || 1.0) >= 1.0
                      ? 'bg-amber-500/20 border border-amber-500/30 text-amber-400'
                      : 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-400'
                }`}>
                  {(trainingState?.coachQuality || 1.0) >= 1.5 ? 'YÜKSEK RİSK' : (trainingState?.coachQuality || 1.0) >= 1.0 ? 'ORTA RİSK' : 'DÜŞÜK RİSK'}
                </span>
              </div>
            </div>
            <input type="range" min="0.5" max="2.0" step="0.1" value={trainingState?.coachQuality || 1.0}
              onChange={(e) => handleCoachChange(parseFloat(e.target.value))}
              className="w-full h-1 bg-white/10 appearance-none cursor-pointer accent-emerald-400" />
            <div className="flex justify-between text-[6px] font-black text-white/15 uppercase">
              <span>Hafif (0.5x)</span><span>Normal (1.0x)</span><span>Ağır (2.0x)</span>
            </div>
            <div className="space-y-0.5">
              <div className="text-[5px] text-white/25 uppercase font-bold">
                Düşük yoğunluk (0.5x–0.9x): Düşük gelişim, düşük sakatlık riski.
              </div>
              <div className="text-[5px] text-white/25 uppercase font-bold">
                Orta yoğunluk (1.0x–1.4x): Dengeli gelişim, orta sakatlık riski.
              </div>
              <div className="text-[5px] text-white/25 uppercase font-bold">
                Yüksek yoğunluk (1.5x–2.0x): Yüksek gelişim, yüksek sakatlık riski.
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button onClick={() => {
              const resetResting = squad.map(p => ({ ...p, isResting: false }));
              onSquadUpdate(resetResting);
            }}
              className={`flex-1 py-2.5 border text-[8px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 bg-white/[0.02] border-white/5 text-white/40 hover:bg-white/10`}>
              <Zap size={10}/> KİMSE DİNLENMESİN
            </button>
            <button onClick={handleRecover}
              className="flex-1 py-2.5 bg-teal-500/5 border border-teal-500/10 text-teal-400/50 text-[8px] font-black uppercase tracking-widest hover:bg-teal-500/10 active:scale-95 transition-all flex items-center justify-center gap-2">
              <Heart size={10}/> DİNLENME (+20)
            </button>
            <button 
              onClick={handleRunSession}
              disabled={isTraining || sessionsToday >= 2 || assistantCoachCount < 2}
              className={`flex-1 py-2.5 border text-[8px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                isTraining
                  ? 'bg-emerald-500/5 border-emerald-500/10 text-emerald-400/50 cursor-wait animate-pulse'
                  : sessionsToday >= 2
                    ? 'bg-white/[0.02] border-white/5 text-white/20 cursor-not-allowed opacity-50'
                    : assistantCoachCount >= 2 
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 active:scale-95' 
                      : 'bg-white/[0.02] border-white/5 text-white/20 cursor-not-allowed opacity-50'
              }`}
            >
              {isTraining ? <Dumbbell size={10} className="animate-spin" /> : assistantCoachCount < 2 ? <Lock size={10} /> : sessionsToday >= 2 ? <BarChart3 size={10} /> : <Dumbbell size={10} />}
              {isTraining ? 'ÇALIŞIYOR...' : sessionsToday >= 2 ? 'LİMİT DOLDU' : 'ANTRENMANI ÇALIŞTIR'}
            </button>
          </div>
          {assistantCoachCount < 2 && (
            <div className="flex items-center gap-2 px-1">
              <Lock size={10} className="text-amber-400/60" />
              <span className="text-[7px] text-amber-400/80 font-bold uppercase tracking-wider">Bu özellik için 2. Yardımcı Antrenör gerekir</span>
            </div>
          )}

          <div className="flex gap-2 text-[6px] font-black uppercase tracking-wider text-white/15">
            <span>U21 Bonus: <span className="text-emerald-400/50">+25%</span></span>
            <span>•</span>
            <span>Knd &lt; 20 Riskli</span>
          </div>

          {/* ═══ TRAINING RESULTS FEEDBACK ═══ */}
          <AnimatePresence>
            {lastTrainingResults && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="p-3 bg-emerald-950/20 border border-emerald-500/10 rounded space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[7px] text-emerald-300/60 uppercase font-black tracking-[0.3em] flex items-center gap-1">
                      <TrendingUp size={10} className="text-emerald-400" /> ANTRENMAN SONUÇLARI
                    </span>
                    <button
                      onClick={() => setLastTrainingResults(null)}
                      className="text-[7px] text-white/20 hover:text-white/50 uppercase font-black tracking-wider transition-colors"
                    >
                      KAPAT
                    </button>
                  </div>
                  {/* EN ÇOK GELİŞEN HERO KART */}
                  {(() => {
                    let bestId = '';
                    let bestTotal = 0;
                    let bestGains: string[] = [];
                    for (const [pid, res] of Object.entries(lastTrainingResults)) {
                      const t = Object.values(res.statsGained || {})
                        .reduce((a, b) => a + ((b as number) || 0), 0);
                      if (t > bestTotal) {
                        bestTotal = t;
                        bestId = pid;
                        bestGains = Object.entries(res.statsGained || {})
                          .filter(([, v]) => (v as number) > 0)
                          .sort(([, a], [, b]) => (b as number) - (a as number))
                          .slice(0, 3)
                          .map(([k, v]) => `${STAT_LABELS[k] || k} +${(v as number).toFixed(1)}`);
                      }
                    }
                    if (!bestId || bestTotal < 0.1) return null;
                    const best = squad.find(p => p.id === bestId);
                    if (!best) return null;
                    return (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mb-3 p-3 rounded-lg bg-gradient-to-r from-amber-500/10 to-emerald-500/10 border border-amber-500/20"
                      >
                        <p className="text-[8px] font-black uppercase tracking-widest text-amber-400/70 mb-2 flex items-center gap-1">
                          <Star size={9} className="text-amber-400" />
                          BU HAFTANIN EN ÇOK GELİŞENİ
                        </p>
                        <div className="flex items-center justify-between gap-2">
                          <div>
                            <p className="text-sm font-black text-white leading-tight">
                              {toTitleCase(best.name?.split(' ').pop() || best.name || '')}
                            </p>
                            <p className="text-[9px] text-white/40">
                              {best.position} · {best.age} yaş · {Math.round(best.rating || 0)} OVR
                            </p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-[10px] font-black text-emerald-400">{bestGains.join('  ')}</p>
                            <p className="text-[8px] text-white/30">+{bestTotal.toFixed(1)} puan</p>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })()}
                  <div className="max-h-40 overflow-y-auto space-y-1 custom-scrollbar">
                    {Object.entries(lastTrainingResults).map(([playerId, result]) => {
                      const player = squad.find(p => p.id === playerId);
                      if (!player) return null;
                      const statGains = Object.entries(result.statsGained || {})
                        .filter(([, gain]) => gain > 0)
                        .map(([stat, gain]) => `${STAT_LABELS[stat] || stat} +${gain.toFixed(1)}`);
                      return (
                        <div key={playerId} className="flex items-center justify-between py-1 px-2 bg-white/[0.02] border border-white/5 rounded">
                          <span className="text-[9px] font-black text-white/70 truncate max-w-[120px]">{toTitleCase(player.name)}</span>
                          <div className="flex items-center gap-2">
                            {statGains.length > 0 ? (
                              <span className="text-[8px] font-mono text-emerald-400">{statGains.join(', ')}</span>
                            ) : (
                              <span className="text-[8px] text-white/20">Gelişim yok</span>
                            )}
                            {result.injuryRisk && (
                              <AlertTriangle size={10} className="text-red-400 shrink-0" />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ═══ PLAYER TABLE ═══ */}
      <div className="border border-emerald-500/10 rounded overflow-x-auto">
        {/* Sorting Bar / Header */}
        <div className="flex items-center gap-4 px-4 py-3 bg-black/40 border border-white/5 rounded-t min-w-[900px]">
          <div 
            onClick={() => toggleSort('position')}
            className="w-48 shrink-0 text-left text-[9px] font-black uppercase text-white/40 tracking-widest cursor-pointer hover:text-emerald-400 transition-colors flex items-center gap-2"
          >
            POZ {sortBy === 'position' && (sortDirection === 'desc' ? '▼' : '▲')}
          </div>
          <div 
            onClick={() => toggleSort('assignment')}
            className="w-32 shrink-0 text-left text-[9px] font-black uppercase text-white/40 tracking-widest cursor-pointer hover:text-emerald-400 transition-colors flex items-center gap-2"
          >
            AKTİF / GELİŞİM {sortBy === 'assignment' && (sortDirection === 'desc' ? '▼' : '▲')}
          </div>
          <div className="flex-1 grid grid-cols-13 gap-px text-white/40">
            {[
              { label: 'Klt', key: 'Klt' },
              { label: 'Klc', key: 'Klc' },
              { label: 'Tk', key: 'Tk' },
              { label: 'Pas', key: 'Pas' },
              { label: 'Şut', key: 'Sut' },
              { label: 'Kfa', key: 'Kfa' },
              { label: 'Hız', key: 'Hız' },
              { label: 'Güç', key: 'Güç' },
              { label: 'Alg', key: 'Alg' },
              { label: 'Top', key: 'Top' },
              { label: 'Tplm', key: 'total' },
              { label: 'Knd', key: 'cond' },
              { label: 'Ort', key: 'rating' },
            ].map((h, i) => (
              <div 
                key={h.label} 
                onClick={() => toggleSort(h.key as any)}
                className={`text-center text-[9px] font-black uppercase tracking-tighter leading-none cursor-pointer transition-colors flex flex-col items-center justify-center gap-1 py-1 rounded hover:bg-white/5 ${sortBy === h.key ? 'text-emerald-400' : 'text-white/20'}`}
              >
                {h.label}
                <div className={`w-1 h-1 rounded-full ${sortBy === h.key ? 'bg-emerald-400' : 'bg-transparent'}`} />
              </div>
            ))}
          </div>
          <div className="w-28 shrink-0" />
        </div>

        {/* Table Controls (Filters) */}
        <div className="flex items-center gap-2 px-3 py-2 bg-emerald-950/10 border-b border-emerald-500/10 min-w-[900px]">
          <span className="text-[7px] text-emerald-300/30 uppercase font-black tracking-[0.3em]">FİLTRELER</span>
          <div className="flex-1" />
          <div className="flex gap-1">
            {['ALL', 'GK', 'DEF', 'MID', 'FWD'].map(pos => (
              <button key={pos} onClick={() => setFilterPos(pos)}
                className={`px-1.5 py-0.5 text-[6px] font-black uppercase tracking-wider border transition-all ${
                  filterPos === pos ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300' : 'border-white/5 text-white/15 hover:border-white/10'
                }`}>{pos}</button>
            ))}
          </div>
          {selectedProgram && (
            <button onClick={() => setShowAssignModal(!showAssignModal)}
              className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[6px] font-black uppercase tracking-wider hover:bg-emerald-500/20 transition-all">
              {showAssignModal ? 'KAPAT' : 'TOPLU ATAMA'}
            </button>
          )}
        </div>

        {/* Table body — react-window ile sanal listeleme */}
        <div className="min-w-[900px]">
          <List<AntrenmanSatirVerisi>
            rowComponent={AntrenmanSatirBilesen}
            rowCount={filteredSquad.length}
            rowHeight={46}
            rowProps={{
              kadro: filteredSquad,
              atamaHaritasi: assignmentMap,
              seciliProgram: selectedProgram,
              kadroGuncelle: onSquadUpdate,
              oyuncuTikla: onPlayerClick,
              atamaDegistir: togglePlayerAssignment,
              atamaKaldir: removeAssignment,
              odakAyarla: setPlayerFocus,
            }}
            overscanCount={5}
            style={{ height: Math.min(filteredSquad.length * 46, 420) }}
          />
        </div>
      </div>

      {/* ═══ MAC ANALISTI ONERISI ═══ */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="border border-cyan-500/15 rounded-xl overflow-hidden"
      >
        {/* Section Header */}
        <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-cyan-950/40 to-zinc-900 border-b border-cyan-500/10">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
            <BarChart3 size={16} className="text-cyan-400" />
          </div>
          <div>
            <h3 className="text-sm font-black italic uppercase tracking-tighter text-cyan-100">Mac Analisti Onerisi</h3>
            <span className="text-[6px] text-cyan-400/40 uppercase tracking-[0.3em] font-black">ANTRENMAN TAVSIYESI</span>
          </div>
          {hasAnalyst && analystStars > 0 && (
            <div className="ml-auto flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={10}
                  className={i < analystStars ? 'text-cyan-400 fill-cyan-400' : 'text-white/10'}
                />
              ))}
              <span className="text-[8px] font-bold text-cyan-400/60 ml-1">{analystStars}★</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 bg-zinc-900/50">
          {staffLoading || analystLoading ? (
            <div className="flex items-center gap-2 text-white/30">
              <div className="w-4 h-4 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
              <span className="text-[10px] font-bold uppercase">Analiz yapiliyor...</span>
            </div>
          ) : assistantCoachCount < 1 ? (
            <div className="flex items-start gap-3 px-4 py-3 bg-amber-500/5 border border-amber-500/15 rounded-lg">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0 mt-0.5">
                <Lock size={14} className="text-amber-400" />
              </div>
              <div>
                <p className="text-[10px] font-black text-amber-300/80 uppercase tracking-wider mb-1">Yardımcı Antrenör gerekli</p>
                <p className="text-[9px] text-white/30 leading-relaxed">
                  Bu özellik için Yardımcı Antrenör işe almalısınız. Yerleşke → Personel
                </p>
              </div>
            </div>
          ) : !hasAnalyst ? (
            <div className="flex items-start gap-3 px-4 py-3 bg-amber-500/5 border border-amber-500/15 rounded-lg">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0 mt-0.5">
                <Lock size={14} className="text-amber-400" />
              </div>
              <div>
                <p className="text-[10px] font-black text-amber-300/80 uppercase tracking-wider mb-1">Mac analistiniz yok</p>
                <p className="text-[9px] text-white/30 leading-relaxed">
                  Mac Analisti Onerisi gorebilmek icin Yerleske sekmesinden bir Mac Analisti satin alin. Analistinizin yildiz sayisi arttikca tavsiyeler daha detayli olur.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0 mt-0.5">
                <BarChart3 size={14} className="text-cyan-400" />
              </div>
              <div className="flex-1">
                <p className="text-[10px] text-white/60 leading-relaxed mb-2">
                  {analystRecommendation || 'Kadro analizi yapiliyor...'}
                </p>
                {analystStars >= 3 && (
                  <div className="flex items-center gap-2 mt-2 pt-2 border-t border-white/5">
                    <span className="text-[7px] font-black text-cyan-400/40 uppercase tracking-widest">ANALIST DETAY</span>
                    <span className="text-[7px] text-white/15">•</span>
                    <span className="text-[7px] text-white/20">Kadro: {squad.length} oyuncu</span>
                    <span className="text-[7px] text-white/15">•</span>
                    <span className="text-[7px] text-white/20">Ort. Kondisyon: %{Math.round(squad.reduce((s, p) => s + (p.cond || 100), 0) / Math.max(1, squad.length))}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </motion.div>

    </div>
  );
}
