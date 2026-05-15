'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Mail, 
  Users, 
  MapPin, 
  User, 
  ShieldCheck,
  Zap,
  Upload,
  ChevronUp,
  ChevronDown,
  ImagePlus,
  Coins,
  Trophy
} from 'lucide-react';
import { Player, LeagueTeam } from '@/lib/fm/types';
import { useFM } from '@/lib/fm/GameContext';
import { isSupabaseConfigured, getSupabase } from '@/lib/supabase';
import { toTitleCase } from '@/lib/fm/ui-helpers';

interface TeamProfileModalProps {
  teamName: string;
  onClose: () => void;
  onMessage: (team: any) => void;
  onOffer: (player: Player) => void;
}

const STAT_KEYS = [
  { key: 'Klt', field: 'potential' as const },
  { key: 'Klc', field: 'goalkeeping' as const },
  { key: 'Tk', field: 'defending' as const },
  { key: 'Pas', field: 'passing' as const },
  { key: 'Şut', field: 'shooting' as const },
  { key: 'Kfa', field: 'heading' as const },
  { key: 'Hız', field: 'speed' as const },
  { key: 'Güç', field: 'power' as const },
  { key: 'Alg', field: 'vision' as const },
  { key: 'Top', field: 'control' as const },
];

const getStatVal = (player: Player, field: keyof Player, key: string): number => {
  if (key === 'Klt') return Math.round(player.potential || player.rating || (player as any).klt || 50);
  if (key === 'Klc') {
    const gk = (player as any).goalkeeping || (player as any).klc || 0;
    if (gk > 0) return Math.round(gk);
    return Math.round(player.position === 'GK' ? (player.rating || 50) * 1.05 : (player.rating || 50) * 0.12);
  }
  if (key === 'Tplm') {
    const r = player.rating || 50;
    return Math.round(r * 11.2);
  }
  // For other stats: check field, fallback to position-specific defaults
  const val = (player as any)[field];
  if (val && val > 0) return Math.round(val);
  // Fallback: position-based reasonable defaults
  const r = player.rating || 50;
  if (key === 'Tk') return Math.round(player.position === 'DEF' ? r : player.position === 'GK' ? r * 0.3 : r * 0.6);
  if (key === 'Pas') return Math.round(player.position === 'MID' ? r : player.position === 'FWD' ? r * 0.85 : r * 0.7);
  if (key === 'Şut') return Math.round(player.position === 'FWD' ? r : player.position === 'MID' ? r * 0.8 : r * 0.3);
  if (key === 'Kfa') return Math.round(player.position === 'DEF' || player.position === 'FWD' ? r * 0.9 : r * 0.6);
  if (key === 'Hız') return Math.round(player.position === 'FWD' ? r : player.position === 'GK' ? r * 0.7 : r * 0.85);
  if (key === 'Güç') return Math.round(player.position === 'DEF' || player.position === 'GK' ? r * 0.95 : r * 0.8);
  if (key === 'Alg') return Math.round(player.position === 'MID' ? r : r * 0.7);
  if (key === 'Top') return Math.round(player.position === 'MID' || player.position === 'FWD' ? r : r * 0.6);
  return Math.round(player.rating || 50);
};

const FORM_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
  W: { color: 'text-white', bg: 'bg-emerald-500', label: 'Kazandi' },
  D: { color: 'text-white', bg: 'bg-zinc-500', label: 'Berabere' },
  L: { color: 'text-white', bg: 'bg-red-500', label: 'Kaybetti' },
};

export default function TeamProfileModal({ teamName, onClose, onMessage, onOffer }: TeamProfileModalProps) {
  const { profile, setProfile } = useFM();
  const [teamData, setTeamData] = useState<any>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<string>('rating');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sortedPlayers = useMemo(() => {
    const list = [...players];
    if (sortBy === 'Oyuncu' || sortBy === 'name') {
      list.sort((a, b) => sortDirection === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name));
    } else if (sortBy === 'Poz' || sortBy === 'position') {
      const posOrder: Record<string, number> = { GK: 0, CB: 1, LB: 2, RB: 3, CDM: 4, CM: 5, CAM: 6, LM: 7, RM: 8, LW: 9, RW: 10, CF: 11, ST: 12 };
      list.sort((a, b) => {
        const oA = posOrder[a.position] ?? 99;
        const oB = posOrder[b.position] ?? 99;
        return sortDirection === 'asc' ? oA - oB : oB - oA;
      });
    } else {
      list.sort((a, b) => {
        const vA = getStatVal(a, 'rating', sortBy);
        const vB = getStatVal(b, 'rating', sortBy);
        return sortDirection === 'asc' ? vA - vB : vB - vA;
      });
    }
    return list;
  }, [players, sortBy, sortDirection]);

  const toggleSort = (key: string) => {
    if (sortBy === key) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(key);
      setSortDirection('desc');
    }
  };

  const avgQuality = useMemo(() => {
    if (!players.length) return 0;
    const sum = players.reduce((acc, p) => acc + (p.rating || 0), 0);
    return sum / players.length;
  }, [players]);

  const formDisplay = useMemo(() => {
    if (teamData?.form) return teamData.form;
    // Generate pseudo-random form from team name
    let hash = 0;
    for (let i = 0; i < teamName.length; i++) hash = ((hash << 5) - hash) + teamName.charCodeAt(i);
    const forms = ['W', 'D', 'L'];
    return Array.from({ length: 5 }, (_, i) => forms[Math.abs(hash + i * 7) % 3]);
  }, [teamData, teamName]);

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const response = await fetch(`/api/league/team-players?teamName=${encodeURIComponent(teamName)}`);
        const data = await response.json();
        setPlayers(data.players || []);
        
        if (isSupabaseConfigured()) {
          const supabase = getSupabase();
          if (supabase) {
            const { data: prof } = await supabase
              .from('profiles')
              .select('id, manager_name, stadium_name, reputation, team_logo')
              .eq('team_name', teamName)
              .single();
          
            if (prof) {
              setTeamData({
                manager: prof.manager_name || 'Bilinmiyor',
                stadium: prof.stadium_name || 'Siyah Beyaz Arena',
                reputation: prof.reputation || 75,
                form: ['W', 'D', 'W', 'W', 'L'],
                id: prof.id,
                team_logo: prof.team_logo || null
              });
            } else {
              setTeamData({
                manager: 'AI Teknik Direktor',
                stadium: 'Siyah Beyaz Arena',
                reputation: 50 + Math.floor(Math.random() * 30),
                form: null
              });
            }
          }
        } else {
          setTeamData({
            manager: 'AI Teknik Direktor',
            stadium: 'Siyah Beyaz Arena',
            reputation: 50 + Math.floor(Math.random() * 30),
            form: null
          });
        }
        setLoading(false);
      } catch (e) {
        setLoading(false);
      }
    };
    fetchTeam();
  }, [teamName]);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!profile || !teamData?.id) return;
    if ((profile.mg_coins || 0) < 2) {
      alert('Amblem yuklemek icin 2 MG Coin gerekli!');
      return;
    }
    if (!e.target.files || !e.target.files[0]) return;

    const file = e.target.files[0];
    if (file.size > 2 * 1024 * 1024) {
      alert('Dosya boyutu 2MB\'dan kucuk olmali!');
      return;
    }

    if (!confirm('Amblem yuklemek icin 2 MG Coin harcanacak. Devam?')) return;

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result as string;
        const newMG = (profile.mg_coins || 0) - 2;
        setProfile((prev: any) => ({ ...prev, mg_coins: newMG }));

        if (isSupabaseConfigured()) {
          const supabase = getSupabase();
          if (supabase) {
            await supabase.from('profiles').update({ mg_coins: newMG, team_logo: base64 }).eq('id', profile.id);
            setTeamData(prev => ({ ...prev, team_logo: base64 }));
          }
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      alert('Amblem yuklenemedi!');
    }
  };

  const getPositionColor = (position: string): string => {
    if (position === 'GK') return 'bg-emerald-950 border-l-4 border-l-emerald-400 text-emerald-400';
    if (position === 'DEF' || ['CB', 'LB', 'RB', 'LWB', 'RWB'].includes(position)) return 'bg-blue-950 border-l-4 border-l-blue-400 text-blue-400';
    if (position === 'MID' || ['CDM', 'CM', 'CAM', 'LM', 'RM'].includes(position)) return 'bg-amber-950 border-l-4 border-l-amber-400 text-amber-400';
    if (position === 'FWD' || ['LW', 'RW', 'CF', 'ST'].includes(position)) return 'bg-red-950 border-l-4 border-l-red-400 text-red-400';
    return '';
  };

  const SortHeader = ({ label, sortKey, className = '' }: { label: string; sortKey: string; className?: string }) => (
    <th 
      onClick={() => toggleSort(sortKey)}
      className={`pb-3 cursor-pointer hover:text-emerald-400 transition-colors select-none flex items-center justify-center gap-0.5 ${sortBy === sortKey ? 'text-emerald-400' : ''} ${className}`}
    >
      {label}
      {sortBy === sortKey && (sortDirection === 'desc' ? <ChevronDown size={8} /> : <ChevronUp size={8} />)}
    </th>
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
      />
      
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="w-full max-w-5xl bg-zinc-950 border border-white/10 rounded-[2rem] overflow-hidden relative z-10 flex flex-col max-h-[90vh]"
      >
        {/* ═══ HEADER PANEL ═══ */}
        <div className="p-8 bg-zinc-900 border-b border-white/5 relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/5 blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
          
          <div className="flex flex-col lg:flex-row justify-between gap-6 relative z-10">
            <div className="flex gap-6">
              {/* ── Logo / Emblem Frame ── */}
              <div className="relative group shrink-0">
                {teamData?.team_logo ? (
                  <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-white/10 shadow-2xl">
                    <img src={teamData.team_logo} alt="logo" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-20 h-20 bg-white/5 rounded-2xl flex flex-col items-center justify-center border-2 border-dashed border-white/10 hover:border-amber-500/50 hover:bg-amber-500/5 transition-all shrink-0 shadow-2xl"
                    title="Amblem yukle (2 MG Coin)"
                  >
                    <ImagePlus size={20} className="text-white/20 group-hover:text-amber-400 transition-colors mb-1" />
                    <span className="text-[6px] font-black text-white/15 uppercase tracking-wider group-hover:text-amber-400/60 transition-colors">2 MG</span>
                  </button>
                )}
                <input 
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
              </div>

              <div className="space-y-1">
                <h2 className="text-3xl font-black italic tracking-tighter uppercase text-white">{teamName}</h2>
                <div className="flex flex-wrap gap-4 text-[10px] font-black uppercase text-white/40 tracking-widest">
                  <div className="flex items-center gap-1.5">
                    <User size={12} className="text-red-500" /> 
                    {teamData?.manager || 'AI Teknik Direktor'}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin size={12} className="text-red-500" /> 
                    {teamData?.stadium || 'Arena'}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 self-end">
              <button 
                onClick={async () => {
                  if (confirm(`${teamName} takimina 1 MG Coin karsiliginda hazirlik maci teklif etmek istiyor musunuz?`)) {
                    alert('Hazirlik maci teklifiniz iletildi!');
                  }
                }}
                className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-red-700 transition-all transform active:scale-95"
              >
                <Zap size={14} /> HAZIRLIK MACI
              </button>
              <button 
                onClick={() => onMessage(teamData || { team_name: teamName })}
                className="flex items-center gap-2 px-6 py-3 bg-white text-black text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-zinc-200 transition-all transform active:scale-95"
              >
                <Mail size={14} /> MESAJ
              </button>
              <button 
                onClick={onClose}
                className="flex items-center justify-center p-3 bg-red-600/20 text-red-500 rounded-xl hover:bg-red-600 hover:text-white transition-all transform active:scale-95"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* ── Stats Row: Form + Avg Quality ── */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-6 border-t border-white/5 pt-6">
            {/* Last 5 Form */}
            <div className="flex flex-col gap-2">
              <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">SON 5 MAC</span>
              <div className="flex gap-1.5">
                {formDisplay.map((f: string, i: number) => {
                  const cfg = FORM_CONFIG[f] || FORM_CONFIG.D;
                  return (
                    <div 
                      key={i} 
                      className={`w-9 h-9 rounded-lg flex items-center justify-center ${cfg.bg} ${cfg.color} shadow-lg border border-white/10`}
                      title={cfg.label}
                    >
                      <span className="text-xs font-black">{f}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Average Quality */}
            <div className="flex flex-col gap-2">
              <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">ORTALAMA KALITE</span>
              <div className="flex items-center gap-3">
                <div className="w-32 h-2.5 bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-500"
                    style={{ 
                      width: `${Math.min(100, (avgQuality / 100) * 100)}%`,
                      backgroundColor: avgQuality >= 75 ? '#10b981' : avgQuality >= 60 ? '#eab308' : avgQuality >= 45 ? '#f97316' : '#ef4444'
                    }}
                  />
                </div>
                <span className={`text-sm font-black font-mono ${
                  avgQuality >= 75 ? 'text-emerald-400' : avgQuality >= 60 ? 'text-yellow-400' : avgQuality >= 45 ? 'text-orange-400' : 'text-red-400'
                }`}>
                  {avgQuality > 0 ? avgQuality.toFixed(1) : '-'}
                </span>
              </div>
            </div>

            {/* Squad Size */}
            <div className="flex flex-col gap-2">
              <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">KADRO</span>
              <div className="flex items-center gap-2">
                <Users size={14} className="text-white/30" />
                <span className="text-sm font-black text-white">{players.length} <span className="text-white/30 font-normal text-xs">Oyuncu</span></span>
              </div>
            </div>
          </div>
        </div>

        {/* ═══ SQUAD TABLE ═══ */}
        <div className="flex-1 overflow-auto p-4 md:p-6">
          <div className="min-w-[900px]">
            {/* Table Header */}
            <div className="grid gap-px text-[8px] font-black uppercase tracking-wider text-white/30 px-3 py-2.5 bg-black/30 rounded-t-xl border border-white/5 border-b-0" style={{ gridTemplateColumns: '56px 1fr repeat(11, 52px) 52px' }}>
              <SortHeader label="Poz" sortKey="Poz" />
              <SortHeader label="Oyuncu" sortKey="Oyuncu" className="justify-start" />
              {STAT_KEYS.map(s => (
                <SortHeader key={s.key} label={s.key} sortKey={s.key} />
              ))}
              <SortHeader label="Tplm" sortKey="Tplm" />
              <div className="pb-3 text-center text-white/10">İşlem</div>
            </div>

            {/* Table Body */}
            <div className="max-h-[400px] overflow-y-auto rounded-b-xl border border-t-0 border-white/5">
              {loading ? (
                Array(11).fill(0).map((_, i) => (
                  <div key={i} className="animate-pulse bg-white/5 h-10 m-px rounded" />
                ))
              ) : sortedPlayers.length === 0 ? (
                <div className="py-16 text-center text-white/20 text-sm italic">Oyuncu bulunamadi.</div>
              ) : (
                sortedPlayers.map(player => {
                  const posColor = getPositionColor(player.position);
                  return (
                    <div 
                      key={player.id}
                      onClick={() => onOffer(player)}
                      className={`grid gap-px px-3 py-2 border-b border-white/[0.03] hover:bg-white/[0.03] cursor-pointer transition-all ${posColor}`}
                      style={{ gridTemplateColumns: '56px 1fr repeat(11, 52px) 52px' }}
                    >
                      <div className="text-center text-[9px] font-black flex items-center justify-center">
                        {player.position}
                      </div>
                      <div className="text-left text-[9px] font-bold text-white/80 truncate flex items-center">
                        {toTitleCase(player.name)}
                      </div>
                      {STAT_KEYS.map(s => {
                        const val = getStatVal(player, s.field, s.key);
                        return (
                          <div key={s.key} className={`text-center text-[9px] font-black flex items-center justify-center ${
                            val >= 85 ? 'text-emerald-300' : val >= 75 ? 'text-emerald-400' : val >= 60 ? 'text-yellow-400' : val >= 45 ? 'text-orange-400' : 'text-red-400'
                          }`}>
                            {val}
                          </div>
                        );
                      })}
                      <div className="text-center text-[9px] font-black text-amber-400 flex items-center justify-center">
                        {getStatVal(player, 'rating', 'Tplm')}
                      </div>
                      <div className="flex items-center justify-center pr-1">
                        <button 
                          onClick={(e) => { e.stopPropagation(); onOffer(player); }}
                          className="p-1.5 bg-white/5 rounded-lg hover:bg-red-600 hover:text-white transition-all text-white/20"
                        >
                          <Zap size={12} />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-black/40 text-white/40 hover:text-white rounded-full transition-all">
          <X size={20} />
        </button>
      </motion.div>
    </div>
  );
}
