'use client';

import React, { useState, useMemo } from 'react';
import { GameTactics, ActiveTactic, Player } from '@/lib/fm/types';
import { Info, Shield, Zap, Target, MousePointer2, Clock, Swords, Flame, Users, ArrowRightLeft, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

function toTitleCase(str: string): string {
  return str.replace(/\b\w/g, c => c.toUpperCase());
}
import { POS_ORDER, POS_LABELS, POS_TO_GROUP } from '@/lib/fm/playerGenerator';
import { getPosGroup, getPosRowStyle } from '@/lib/fm/ui-helpers';
import { ChevronUp, ChevronDown } from 'lucide-react';

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

const PlayerIcon = ({ player, condition, pos, onDrop, onDragOver, onDragStart, onDragLeave, onClick, isDragOver, teamPrimaryColor, teamSecondaryColor }: {
  player: Player;
  condition: number;
  pos: PitchPosition;
  onDrop: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragStart: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onClick?: () => void;
  isDragOver?: boolean;
  teamPrimaryColor?: string;
  teamSecondaryColor?: string;
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
        className={`absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group cursor-grab active:cursor-grabbing ${isDragOver ? 'z-30 scale-110' : 'z-10'}`}
    >
        <div className="relative w-12 h-12 flex items-center justify-center">
            {/* Condition ring */}
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
            
            {/* Modern Kit Card */}
            <div 
              className="w-10 h-11 relative rounded-lg flex flex-col items-center justify-center group-hover:scale-110 transition-transform"
              style={{
                background: `linear-gradient(135deg, ${primaryColor} 0%, ${darkenColor(primaryColor, 20)} 100%)`,
                border: `1.5px solid ${secondaryColor}60`,
                boxShadow: `0 2px 8px ${primaryColor}50, inset 0 1px 0 ${secondaryColor}30`
              }}
            >
              {/* Subtle collar/accent line at top */}
              <div 
                className="absolute top-0 inset-x-2 h-[2px] rounded-b"
                style={{ background: `${secondaryColor}80` }}
              />
              <span className="text-[9px] font-black text-white tracking-tight leading-none drop-shadow-sm">
                {posCode}
              </span>
              <span className="text-[7px] font-bold text-white/50 leading-none mt-0.5">
                {player.rating}
              </span>
            </div>
        </div>
        <div className="mt-1 bg-black/80 backdrop-blur-sm text-white px-2 py-0.5 shadow-xl border border-white/10 min-w-[50px] max-w-[90px] rounded-sm">
            <span className="text-[7px] font-black tracking-tight block text-center leading-tight uppercase">{displayName}</span>
        </div>
    </motion.div>
  );
};

export default function TacticsCommandCenter({ 
  activeTactic, onActiveTacticChange, squad, onSquadUpdate, playerConditions = {}, onPlayerClick, transferOffers, onAcceptOffer, onRejectOffer, teamPrimaryColor, teamSecondaryColor
}: TacticsCommandCenterProps) {
  const [hoveredInfo, setHoveredInfo] = useState<string | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<string>('Poz');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [hoveredPlayerId, setHoveredPlayerId] = useState<string | null>(null);

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

  const pitchPos = getPitchPositions(activeTactic.formation || '4-4-2');

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* Left: Toggles & Stats (4 cols) */}
        <div className="xl:col-span-4 p-6 bg-zinc-900/80 backdrop-blur-xl border border-white/5 rounded-3xl space-y-8 h-full">
           <div className="border-b border-white/5 pb-4">
              <h3 className="text-xl font-black italic text-white uppercase tracking-tighter flex items-center gap-2">
                <Swords className="text-emerald-500" /> Taktik Lab
              </h3>
              <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.3em]">Operasyonel Parametreler</p>
           </div>

           <div className="space-y-6">
             <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Diziliş', val: activeTactic.formation || '4-4-2', key: 'formation', options: ['4-4-2', '4-3-3', '3-5-2', '5-4-1', '4-2-3-1', '3-4-3', '4-1-4-1', '4-3-2-1', '5-3-2', '4-3-1-2', '3-1-4-2', '4-4-1-1', '4-5-1', '3-3-3-1'] },
                  { label: 'Tarz', val: activeTactic.playStyle, key: 'playStyle', options: ['dengeli', 'hucum', 'savunma', 'kontra', 'tikitaka'] },
                ].map(ctrl => (
                  <div key={ctrl.key} className="space-y-1.5">
                    <label className="text-[8px] font-black text-white/30 uppercase tracking-[0.2em] block">{ctrl.label}</label>
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
                      <label className="text-[9px] font-black text-white/40 uppercase tracking-widest">{param.label}</label>
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
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-[9px] font-black uppercase tracking-wider transition-all ${
                      (activeTactic as any)[t.key] ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' : 'bg-black/20 border-white/5 text-white/30'
                    }`}
                  >
                    {t.icon} {t.label}
                  </button>
                ))}
             </div>
           </div>
        </div>

        {/* Center: Full Interactive Pitch (5 cols) */}
        <div className="xl:col-span-5 relative aspect-[2/3] xl:aspect-auto bg-[#1a472a] border-4 border-white/20 rounded-[2.5rem] overflow-hidden shadow-2xl min-h-[600px]">
           <div className="absolute inset-0 opacity-20"><div className="h-full w-full bg-[repeating-linear-gradient(0deg,rgba(0,0,0,0.1),rgba(0,0,0,0.1)_40px,transparent_40px,transparent_80px)]" /></div>
           <div className="absolute inset-4 border-2 border-white/20 rounded-xl" />
           <div className="absolute inset-x-4 top-1/2 h-0.5 bg-white/20" />
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-2 border-white/20 rounded-full" />
           <div className="absolute inset-x-1/4 top-4 h-32 border-2 border-white/20" />
           <div className="absolute inset-x-1/4 bottom-4 h-32 border-2 border-white/20" />

           {players.map((player, idx) => {
              const pos = pitchPos[idx] || { x: 50, y: 50 };
              return (
                <PlayerIcon 
                  key={player.id} player={player} condition={playerConditions[player.id] || 100} pos={pos}
                  onDragOver={(e) => { e.preventDefault(); setDragOverIdx(idx); }}
                  onDragLeave={() => setDragOverIdx(null)}
                  onDragStart={(e) => {
                    e.dataTransfer.setData("playerId", player.id);
                    e.dataTransfer.setData("sourceIdx", String(idx));
                  }}
                  onDrop={handlePitchDrop(idx)}
                  onClick={() => onPlayerClick?.(player)}
                  isDragOver={dragOverIdx === idx}
                  teamPrimaryColor={teamPrimaryColor}
                  teamSecondaryColor={teamSecondaryColor}
                />
              );
           })}
        </div>

        {/* Right: Squad Management (3 cols) */}
        <div className="xl:col-span-3 p-6 bg-zinc-900/60 border border-white/5 rounded-3xl flex flex-col h-full max-h-[700px]">
            <h4 className="text-[10px] text-white/30 uppercase font-black tracking-[0.4em] mb-6 flex items-center gap-2">
               <Users size={14} /> KADRO LİSTESİ
            </h4>
            <div className="flex-1 space-y-2 overflow-y-auto pr-2 custom-scrollbar">
                {bench.sort((a, b) => {
                  const oA = POS_ORDER[a.specificPosition || a.position] ?? 99;
                  const oB = POS_ORDER[b.specificPosition || b.position] ?? 99;
                  return oA !== oB ? oA - oB : b.rating - a.rating;
                }).map((player) => (
                  <div 
                      key={player.id}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData("playerId", player.id);
                        e.dataTransfer.setData("sourceIdx", '');
                      }}
                      onClick={() => onPlayerClick?.(player)}
                      className="p-3 bg-black/40 border border-white/5 rounded-xl flex items-center justify-between cursor-grab active:cursor-grabbing hover:border-white/20 transition-all group"
                  >
                      <div className="flex items-center gap-3">
                          <div className="text-[8px] font-black p-1 bg-white/5 rounded text-white/30">{player.specificPosition || player.position}</div>
                          <span className="text-[10px] font-bold text-white uppercase truncate max-w-[100px]">{player.name}</span>
                      </div>
                      <span className="text-[10px] font-black text-emerald-400">{player.rating}</span>
                  </div>
                ))}
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
                <span className="text-[9px] font-bold text-white truncate max-w-[80px]">{p.name.split(' ').pop()}</span>
                <span className="text-[8px] font-black text-white/20">{p.position}</span>
              </div>
              <select
                value={p.special_role || ''}
                onChange={(e) => {
                  const newSquad = squad.map(sp => sp.id === p.id ? { ...sp, special_role: e.target.value || null } : sp);
                  onSquadUpdate(newSquad);
                }}
                className={`w-full bg-zinc-800/50 border border-white/10 rounded-lg px-2 py-1.5 text-[9px] font-black uppercase outline-none focus:border-emerald-500/50 transition-colors`}
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
                      <div className="text-[9px] font-bold text-white/80 truncate">{offer.fromTeam} → {toTitleCase(offer.playerName)}</div>
                      <div className="text-[7px] text-white/25 font-bold uppercase tracking-widest">{offer.playerPosition} • {offer.date}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5 shrink-0">
                    <span className="text-[10px] font-black text-emerald-400">{(offer.amount / 1000000).toFixed(1)}M €</span>
                    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 text-[7px] font-black uppercase tracking-wider border rounded-full ${sc.color}`}>
                      {sc.icon} {sc.label}
                    </span>
                    {offer.status === 'pending' && (
                      <div className="flex gap-1">
                        <button onClick={() => onAcceptOffer?.(offer.id)} className="px-2 py-0.5 text-[7px] font-black uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded hover:bg-emerald-500/30 transition-colors">
                          Kabul
                        </button>
                        <button onClick={() => onRejectOffer?.(offer.id)} className="px-2 py-0.5 text-[7px] font-black uppercase bg-red-500/20 text-red-400 border border-red-500/30 rounded hover:bg-red-500/30 transition-colors">
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
          <div className="flex items-center gap-3 text-[7px] font-black uppercase tracking-widest">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-[#7AB4E8]/10 border-2 border-[#7AB4E8]" /> Kaleci</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-[#7EDBC8]/10 border-2 border-[#7EDBC8]" /> Defans</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-[#F0C87A]/10 border-2 border-[#F0C87A]" /> Orta Saha</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-[#E87878]/10 border-2 border-[#E87878]" /> Forvet</span>
          </div>
        </div>
        <div className="overflow-x-auto">
          {/* Table Header */}
          <div className="grid gap-px min-w-[950px] text-[8px] font-black uppercase tracking-wider text-white/30 px-3 py-2.5 bg-black/30 rounded-t-xl border border-white/5 border-b-0" style={{ gridTemplateColumns: '56px 1fr repeat(12, 52px)' }}>
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

              // Generate Son 5 maç indicators from form_rating as proxy
              const getLast5Indicators = (fr: number | null): { letter: string; color: string }[] => {
                if (fr === null) return Array.from({ length: 5 }, () => ({ letter: '-', color: 'text-white/20' }));
                // Use form_rating to derive a simple pattern
                const results: { letter: string; color: string }[] = [];
                const seed = Math.floor(fr);
                const patterns = [
                  // Higher form_rating = more wins
                  fr >= 80 ? ['W','W','W','D','W'] : 
                  fr >= 65 ? ['W','D','W','D','L'] : 
                  fr >= 50 ? ['D','L','D','W','L'] : 
                  fr >= 35 ? ['L','D','L','D','L'] : 
                             ['L','L','L','D','L']
                ][0] as string[];
                const colorMap: Record<string, string> = {
                  W: 'text-emerald-400',
                  D: 'text-amber-400', 
                  L: 'text-red-400',
                };
                // Vary slightly based on seed for visual interest
                for (let i = 0; i < 5; i++) {
                  const idx = (seed + i) % patterns.length;
                  const letter = patterns[idx];
                  results.push({ letter, color: colorMap[letter] || 'text-white/20' });
                }
                return results;
              };
              const last5 = getLast5Indicators(formRating);

              return (
                <div 
                  key={player.id}
                  className="relative"
                >
                  {/* Hover Tooltip - appears above the row */}
                  <div 
                    className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 pointer-events-none transition-all duration-200 ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1'}`}
                  >
                    <div className="bg-zinc-900/95 backdrop-blur-xl border border-white/10 shadow-2xl rounded-xl px-4 py-3 min-w-[220px]">
                      {/* Arrow pointing down */}
                      <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px">
                        <div className="w-3 h-3 bg-zinc-900/95 border-r border-b border-white/10 rotate-45 -mt-[7px]" />
                      </div>
                      
                      {/* Archetype */}
                      {archetypeName && (
                        <div className="flex items-center gap-2 mb-2 pb-2 border-b border-white/5">
                          <div className="w-5 h-5 rounded-md flex items-center justify-center text-[8px] font-black" 
                            style={{ 
                              background: `linear-gradient(135deg, ${POS_GROUP_COLORS[getPosGroup(player.specificPosition || player.position)] || '#9B9B9B'}40 0%, ${POS_GROUP_COLORS[getPosGroup(player.specificPosition || player.position)] || '#9B9B9B'}20 100%)`,
                              color: POS_GROUP_COLORS[getPosGroup(player.specificPosition || player.position)] || '#9B9B9B'
                            }}>
                            {player.specificPosition?.charAt(0) || player.position.charAt(0)}
                          </div>
                          <div>
                            <div className="text-[9px] font-black text-white/90">{archetypeName}</div>
                            <div className="text-[7px] text-white/30 font-medium">Arketip</div>
                          </div>
                        </div>
                      )}

                      {/* Stats row */}
                      <div className="grid grid-cols-3 gap-3 mb-2">
                        <div className="text-center">
                          <div className={`text-[11px] font-black ${
                            formVal !== null ? (formVal >= 75 ? 'text-emerald-400' : formVal >= 50 ? 'text-amber-400' : 'text-red-400') : 'text-white/20'
                          }`}>
                            {formVal !== null ? formVal : '-'}
                          </div>
                          <div className="text-[7px] text-white/25 font-bold uppercase tracking-wider">Form</div>
                        </div>
                        <div className="text-center">
                          <div className={`text-[11px] font-black ${
                            condVal !== null ? (condVal >= 75 ? 'text-emerald-400' : condVal >= 50 ? 'text-amber-400' : 'text-red-400') : 'text-white/20'
                          }`}>
                            {condVal !== null ? condVal : '-'}
                          </div>
                          <div className="text-[7px] text-white/25 font-bold uppercase tracking-wider">Kondisyon</div>
                        </div>
                        <div className="text-center">
                          <div className={`text-[11px] font-black ${
                            moraleVal !== null ? (moraleVal >= 75 ? 'text-emerald-400' : moraleVal >= 50 ? 'text-amber-400' : 'text-red-400') : 'text-white/20'
                          }`}>
                            {moraleVal !== null ? moraleVal : '-'}
                          </div>
                          <div className="text-[7px] text-white/25 font-bold uppercase tracking-wider">Moral</div>
                        </div>
                      </div>

                      {/* Son 5 maç */}
                      <div className="pt-2 border-t border-white/5">
                        <div className="flex items-center justify-between">
                          <span className="text-[7px] text-white/25 font-bold uppercase tracking-wider">Son 5 Maç</span>
                          <div className="flex gap-1">
                            {last5.map((ind, i) => (
                              <span key={i} className={`w-5 h-5 rounded text-[8px] font-black flex items-center justify-center ${
                                ind.letter === 'W' ? 'bg-emerald-500/15 text-emerald-400' : 
                                ind.letter === 'D' ? 'bg-amber-500/15 text-amber-400' : 
                                'bg-red-500/15 text-red-400'
                              }`}>
                                {ind.letter}
                              </span>
                            ))}
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
                    <div className={`text-center text-[9px] font-black flex items-center justify-center gap-0.5 ${
                      player.position === 'GK' ? 'text-green-300' :
                      ['CB', 'LB', 'RB', 'LWB', 'RWB'].includes(player.specificPosition || player.position) ? 'text-blue-300' :
                      ['CDM', 'CM', 'CAM', 'LM', 'RM'].includes(player.specificPosition || player.position) ? 'text-amber-300' :
                      'text-red-300'
                    }`}>
                      <span>{player.specificPosition || player.position}</span>
                      {player.secondaryPositions && player.secondaryPositions.length > 0 && (
                        <span className="text-[6px] text-white/25 font-normal">/{player.secondaryPositions.join('/')}</span>
                      )}
                    </div>
                    <div className="text-left text-[9px] font-bold text-white/80 truncate flex items-center gap-1">
                      {toTitleCase(player.name)}
                      {(player.archetype || player.playStyle) && (
                        <span className="relative group/arch inline-flex items-center">
                          <Info size={10} className="text-amber-400/40 group-hover/arch:text-amber-400 transition-colors cursor-help" />
                          <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1.5 rounded-lg bg-zinc-900/95 border border-amber-500/20 shadow-2xl text-[9px] font-bold text-amber-300 whitespace-nowrap pointer-events-none opacity-0 group-hover/arch:opacity-100 transition-all z-50 backdrop-blur-xl">
                            {player.archetype || player.playStyle}
                            <span className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-zinc-900/95 border-r border-b border-amber-500/20 rotate-45 -mt-1" />
                          </span>
                        </span>
                      )}
                    </div>
                    {statKeys.map(key => {
                      const val = getStatValue(player, key);
                      return (
                        <div key={key} className={`text-center text-[9px] font-black flex items-center justify-center ${
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
    </div>
  );
}
