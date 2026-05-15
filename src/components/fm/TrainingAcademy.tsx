'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Dumbbell, Target, Shield, Zap, 
  TrendingUp, AlertTriangle, Star, 
  ChevronDown, ChevronUp, Heart, GraduationCap, Award,
  FlaskConical
} from 'lucide-react';
import type { Player, TrainingState, TrainingAssignment, TrainingProgramId } from '@/lib/fm/types';
import { TRAINING_PROGRAMS } from '@/lib/fm/constants';
import { runTrainingSession } from '@/lib/fm/trainingEngine';
import { toTitleCase } from '@/lib/fm/ui-helpers';
import TacticLab from './TacticLab';

// ─────────────────────────────────────────────────
// PROGRAM ICON MAP
// ─────────────────────────────────────────────────
const programIcons: Record<string, React.ReactNode> = {
  fiziksel_yukleme: <Dumbbell size={14} />,
  teknik_driller: <Target size={14} />,
  savunma_okulu: <Shield size={14} />,
  bitiricilik_kampi: <Zap size={14} />,
};

const programColorMap: Record<string, { bg: string; border: string; text: string; glow: string }> = {
  red:    { bg: 'bg-red-500/10',    border: 'border-red-500/20',    text: 'text-red-400',    glow: 'bg-red-500/5' },
  blue:   { bg: 'bg-blue-500/10',   border: 'border-blue-500/20',   text: 'text-blue-400',   glow: 'bg-blue-500/5' },
  green:  { bg: 'bg-green-500/10',  border: 'border-green-500/20',  text: 'text-green-400',  glow: 'bg-green-500/5' },
  amber:  { bg: 'bg-amber-500/10',  border: 'border-amber-500/20',  text: 'text-amber-400',  glow: 'bg-amber-500/5' },
};

const STAT_LABELS: Record<string, string> = {
  speed: 'Hız', 
  power: 'Güç', 
  passing: 'Pas', 
  shooting: 'Şut',
  defending: 'Tk', 
  vision: 'Alg', 
  control: 'Top',
  stamina: 'Kondisyon',
  heading: 'Kfa',
  goalkeeping: 'Klc'
};

// ─────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────

interface TrainingAcademyProps {
  squad: Player[];
  trainingState: TrainingState;
  onTrainingStateChange: (state: TrainingState) => void;
  onSquadUpdate: (squad: Player[]) => void;
  onPlayerClick?: (player: Player) => void;
}

export default function TrainingAcademy({ 
  squad, trainingState, onTrainingStateChange, onSquadUpdate, onPlayerClick
}: TrainingAcademyProps) {
  
  const [selectedProgram, setSelectedProgram] = useState<TrainingProgramId | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showTacticLab, setShowTacticLab] = useState(false);
  const [sortBy, setSortBy] = useState<'name' | 'rating' | 'cond' | 'age' | 'position' | 'Klt' | 'Klc' | 'Tk' | 'Pas' | 'Sut' | 'Kfa' | 'Hız' | 'Güç' | 'Alg' | 'Top' | 'total'>('rating');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [filterPos, setFilterPos] = useState<string>('ALL');

  // ── Assigned players map ──
  const assignmentMap = useMemo(() => {
    const map = new Map<string, TrainingAssignment>();
    const assignments = trainingState?.assignments || [];
    assignments.forEach(a => map.set(a.playerId, a));
    return map;
  }, [trainingState?.assignments]);

  // ── Filtered & sorted players ──
  const filteredSquad = useMemo(() => {
    let list = [...(squad || [])];
    if (filterPos !== 'ALL') list = list.filter(p => p.position === filterPos);
    
    list.sort((a, b) => {
      let valA: any = a[sortBy as keyof Player] || 0;
      let valB: any = b[sortBy as keyof Player] || 0;

      if (sortBy === 'name') {
        valA = a.name;
        valB = b.name;
      } else if (sortBy === 'position') {
        valA = a.position;
        valB = b.position;
      } else if (sortBy === 'total') {
        valA = a.rating * 11.2;
        valB = b.rating * 11.2;
      } else if (sortBy === 'Klt') {
        valA = (a as any).Klt || a.rating;
        valB = (b as any).Klt || b.rating;
      } else if (sortBy === 'Klc') {
        valA = (a as any).Klc || (a.position === 'GK' ? a.rating * 1.05 : a.rating * 0.12);
        valB = (b as any).Klc || (b.position === 'GK' ? b.rating * 1.05 : b.rating * 0.12);
      } else if (sortBy === 'Tk') {
        valA = (a as any).Tk || a.defending || a.rating;
        valB = (b as any).Tk || b.defending || b.rating;
      } else if (sortBy === 'Pas') {
        valA = (a as any).Pas || a.passing || a.rating;
        valB = (b as any).Pas || b.passing || b.rating;
      } else if (sortBy === 'Sut') {
        valA = (a as any).Sut || a.shooting || a.rating;
        valB = (b as any).Sut || b.shooting || b.rating;
      } else if (sortBy === 'Kfa') {
        valA = (a as any).Kfa || a.rating * 0.95;
        valB = (b as any).Kfa || b.rating * 0.95;
      } else if (sortBy === 'Hız') {
        valA = (a as any).Hız || a.speed || a.rating;
        valB = (b as any).Hız || b.speed || b.rating;
      } else if (sortBy === 'Güç') {
        valA = (a as any).Güç || a.power || a.rating;
        valB = (b as any).Güç || b.power || b.rating;
      } else if (sortBy === 'Alg') {
        valA = (a as any).Alg || a.vision || a.rating;
        valB = (b as any).Alg || b.vision || b.rating;
      } else if (sortBy === 'Top') {
        valA = (a as any).Top || a.control || a.rating;
        valB = (b as any).Top || b.control || b.rating;
      } else if (sortBy === 'rating') {
        valA = a.rating;
        valB = b.rating;
      } else if (sortBy === 'cond') {
        valA = a.fitness || 100;
        valB = b.fitness || 100;
      }

      if (typeof valA === 'string') {
        return sortDirection === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      return sortDirection === 'asc' ? valA - valB : valB - valA;
    });
    return list;
  }, [squad, filterPos, sortBy, sortDirection]);

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
        programId: 'fiziksel_yukleme', 
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
  const handleRunSession = useCallback(() => {
    const assignments = trainingState?.assignments || [];
    if (assignments.length === 0) return;
    const { updatedSquad, results } = runTrainingSession(squad, trainingState!);
    onSquadUpdate(updatedSquad);
    onTrainingStateChange({ ...(trainingState || {}), lastSessionResults: results } as TrainingState);
  }, [squad, trainingState, onSquadUpdate, onTrainingStateChange]);

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
          onClick={() => setShowTacticLab(true)}
          className="group relative flex items-center gap-3 px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:shadow-[0_0_30px_rgba(37,99,235,0.6)] transition-all transform active:scale-95"
        >
           <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg" />
           <div className="relative flex items-center gap-2">
              <FlaskConical size={16} className="text-white animate-pulse" />
              <div className="flex flex-col items-start leading-none">
                 <span className="text-[10px] font-black text-white uppercase tracking-wider">9v9 LABORATUVARI</span>
                 <span className="text-[6px] text-blue-200 uppercase font-bold tracking-widest">TAKTIK TEST MERKEZİ</span>
              </div>
           </div>
        </button>

        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[7px] font-black uppercase tracking-widest">
            {trainingState?.assignments?.length || 0} ATAMA
          </span>
          <span className="px-2 py-0.5 bg-teal-500/10 border border-teal-500/20 text-teal-400 text-[7px] font-black uppercase tracking-widest">
            ANTRENÖR: {(trainingState?.coachQuality || 1.0).toFixed(1)}x
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
        <div className="lg:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-2">
          {TRAINING_PROGRAMS.map(prog => {
            const colors = programColorMap[prog.color] || programColorMap.red;
            const assignedCount = (trainingState?.assignments || []).filter(a => a.programId === prog.id).length;
            const isSelected = selectedProgram === prog.id;
            return (
              <button key={prog.id} onClick={() => setSelectedProgram(isSelected ? null : prog.id)}
                className={`p-3 border text-left transition-all relative overflow-hidden ${
                  isSelected ? `${colors.bg} ${colors.border}` : 'bg-white/[0.02] border-white/5 hover:border-white/15'
                }`}>
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-7 h-7 rounded flex items-center justify-center ${colors.bg} ${colors.text}`}>
                    {programIcons[prog.id]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`text-[8px] font-black uppercase tracking-wider truncate ${isSelected ? colors.text : 'text-white/60'}`}>{prog.name}</div>
                  </div>
                </div>
                <div className="text-[6px] text-white/25 uppercase tracking-wider leading-relaxed mb-2">{prog.description}</div>
                <div className="flex items-center justify-between">
                  <span className="text-[6px] text-white/15 font-black uppercase">HEDEF: {prog.targetStats.map(s => STAT_LABELS[s] || s).join(', ')}</span>
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
          {/* Coach Quality */}
          <div className="p-3 bg-emerald-950/30 border border-emerald-500/10 rounded space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-[7px] text-emerald-300/40 uppercase font-black tracking-[0.3em] flex items-center gap-1">
                < Award size={10} className="text-emerald-400" /> ANTRENMAN YOĞUNLUĞU
              </span>
              <span className={`text-sm font-black italic ${(trainingState?.coachQuality || 1.0) >= 1.5 ? 'text-red-400' : (trainingState?.coachQuality || 1.0) >= 1.0 ? 'text-emerald-300' : 'text-emerald-500'}`}>
                {(trainingState?.coachQuality || 1.0).toFixed(1)}x
              </span>
            </div>
            <input type="range" min="0.5" max="2.0" step="0.1" value={trainingState?.coachQuality || 1.0}
              onChange={(e) => handleCoachChange(parseFloat(e.target.value))}
              className="w-full h-1 bg-white/10 appearance-none cursor-pointer accent-emerald-400" />
            <div className="flex justify-between text-[6px] font-black text-white/15 uppercase">
              <span>Hafif (0.5x)</span><span>Normal (1.0x)</span><span>Ağır (2.0x)</span>
            </div>
            <div className="text-[5px] text-white/20 uppercase font-bold text-center">YÜKSEK YOĞUNLUK DAHA FAZLA KONDİSYON HARCAR VE SAKATLIK RİSKİNİ ARTIRIR.</div>
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
          </div>

          <div className="flex gap-2 text-[6px] font-black uppercase tracking-wider text-white/15">
            <span>U21 Bonus: <span className="text-emerald-400/50">+25%</span></span>
            <span>•</span>
            <span>Knd &lt; 20 Riskli</span>
          </div>
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
          <div className="w-32 shrink-0 text-[9px] font-black uppercase text-white/40 tracking-widest">AKTİF / GELİŞİM</div>
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

        {/* Table body */}
        <div className="max-h-[420px] overflow-y-auto min-w-[900px]">
          {filteredSquad.map(player => {
            const assignment = assignmentMap.get(player.id);
            const program = assignment ? TRAINING_PROGRAMS.find(p => p.id === assignment.programId) : null;
            const colors = program ? (programColorMap[program.color] || programColorMap.red) : null;
            const isU21 = player.age <= 21;
            const cond = player.fitness || player.cond || 100;
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

            const posColor = 
              player.position === 'GK' ? 'bg-emerald-950 border-l-4 border-l-emerald-400' :
              ['CB', 'LB', 'RB', 'LWB', 'RWB', 'DEF'].includes(player.position) ? 'bg-blue-950 border-l-4 border-l-blue-400' :
              ['CAM', 'CM', 'CDM', 'LM', 'RM', 'MID'].includes(player.position) ? 'bg-amber-950 border-l-4 border-l-amber-400' :
              ['ST', 'CF', 'LF', 'RF', 'FWD'].includes(player.position) ? 'bg-red-950 border-l-4 border-l-red-400' : '';

            return (
              <div key={player.id} 
                className={`flex items-center gap-4 px-4 py-2 border-b border-white/[0.03] transition-all hover:bg-white/[0.05] ${posColor || 'border-l-4 border-l-transparent'}`}>
                
                {/* Position badge & Name */}
                <div className="w-48 shrink-0 flex items-center gap-3">
                  <div className={`w-8 h-8 flex items-center justify-center text-[9px] font-black rounded shrink-0 ${
                    isU21 ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' : 'bg-white/5 text-white/40'
                  }`}>
                    {player.position}
                  </div>
                  <button 
                    onClick={() => onPlayerClick?.(player)}
                    className="min-w-0 text-left hover:opacity-70 transition-opacity"
                  >
                    <div className="text-[10px] font-black tracking-tight truncate text-white/90">{toTitleCase(player.name)}</div>
                    <div className="text-[7px] text-white/20 font-bold uppercase tracking-widest">{player.age} yaş {isU21 && <span className="text-emerald-400/60">• ACADEMY</span>}</div>
                  </button>
                </div>

                {/* Quick Add Button */}
                <div className="w-32 shrink-0 flex items-center gap-2">
                  <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-lg p-1">
                    {assignment ? (
                      <button 
                        onClick={(e) => { e.stopPropagation(); removeAssignment(player.id); }}
                        className="w-7 h-7 rounded flex items-center justify-center bg-emerald-500 text-black shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all hover:scale-110 active:scale-90"
                        title="Programdan Çıkar"
                      >
                        <Zap size={14} fill="black" />
                      </button>
                    ) : selectedProgram ? (
                      <button 
                        onClick={(e) => { e.stopPropagation(); togglePlayerAssignment(player.id, selectedProgram); }}
                        className="w-7 h-7 rounded flex items-center justify-center bg-white/10 border border-white/20 text-white/40 hover:bg-emerald-500/20 hover:text-emerald-400 hover:border-emerald-500/40 transition-all hover:scale-110"
                        title="Programa Ekle"
                      >
                        <Zap size={14} />
                      </button>
                    ) : (
                      <div className="w-7 h-7 rounded bg-white/[0.02] border border-white/5 flex items-center justify-center opacity-20">
                         <Zap size={10} />
                      </div>
                    )}

                    {/* Individual Development Button */}
                    <button 
                      onClick={(e) => { e.stopPropagation(); onPlayerClick?.(player); }}
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

                {/* Mini Stats (13 columns) */}
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
                              // Auto-assign to first program if not assigned
                              togglePlayerAssignment(player.id, 'fiziksel_yukleme');
                              // We need to wait for state, but since we're in React session, better use a direct call if possible or just handle it gracefully
                              // For simplicity, we'll use setPlayerFocus but make it aware of assignment
                            }
                            setPlayerFocus(player.id, isFocused ? null : s.key);
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

                {/* Rest Toggle */}
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    const updated = squad.map(p => p.id === player.id ? { ...p, isResting: !p.isResting } : p);
                    onSquadUpdate(updated);
                  }}
                  className={`w-8 h-8 flex-shrink-0 flex items-center justify-center rounded border transition-all ${
                    player.isResting ? 'bg-amber-500/20 border-amber-500 text-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.2)]' : 'bg-white/5 border-white/10 text-white/20'
                  }`}
                >
                  {player.isResting ? <Heart size={10} fill="currentColor" /> : <Heart size={10} />}
                </button>

                {/* Program Badge */}
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
          })}
        </div>
      </div>

    </div>
  );
}
