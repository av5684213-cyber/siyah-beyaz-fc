'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ChevronDown, Search, X, Star, Shield, Target, Brain } from 'lucide-react';

interface PlayerComparisonModalProps {
  open: boolean;
  onClose: () => void;
  player1: any;
  player2: any;
  squad?: any[];
  onPlayer1Change?: (player: any) => void;
  onPlayer2Change?: (player: any) => void;
}

const TECHNICAL_ATTRS = ['finishing', 'passing', 'dribbling', 'crossing', 'long_shots', 'free_kicks', 'heading', 'tackling', 'ball_control', 'vision'];
const PHYSICAL_ATTRS = ['pace', 'acceleration', 'stamina', 'strength', 'agility', 'jumping'];
const MENTAL_ATTRS = ['composure', 'work_rate', 'positioning', 'leadership', 'concentration', 'decisions'];

const ATTR_LABELS_TR: Record<string, string> = {
  finishing: 'Bitiricilik', passing: 'Pas', dribbling: 'Dripling', crossing: 'Orta',
  long_shots: 'Uzak Şut', free_kicks: 'Frikik', heading: 'Kafa', tackling: 'Müdahale',
  ball_control: 'Top Kontrol', vision: 'Vizyon',
  pace: 'Hız', acceleration: 'İvme', stamina: 'Dayanıklılık', strength: 'Kuvvet',
  agility: 'Çeviklik', jumping: 'Sıçrama',
  composure: 'Soğukkanlılık', work_rate: 'Çalışma Temposu', positioning: 'Pozisyon Alma',
  leadership: 'Liderlik', concentration: 'Konsantrasyon', decisions: 'Karar Verme',
};

// ─── Oyuncu Seçici Dropdown ───────────────────────────────────────────
function PlayerSelector({
  player,
  squad,
  onSelect,
  accentColor,
}: {
  player: any;
  squad: any[];
  onSelect: (p: any) => void;
  accentColor: 'amber' | 'blue';
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  if (!player) return null;

  const filtered = squad.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.position?.toLowerCase().includes(search.toLowerCase())
  );

  const colorMap = {
    amber: { text: 'text-amber-300', border: 'border-amber-500/40', bg: 'bg-amber-500/10', dot: 'bg-amber-400' },
    blue: { text: 'text-blue-300', border: 'border-blue-500/40', bg: 'bg-blue-500/10', dot: 'bg-blue-400' },
  };
  const c = colorMap[accentColor];

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => { setOpen(!open); setSearch(''); }}
        className={`w-full p-2.5 rounded-xl border ${c.border} ${c.bg} hover:opacity-80 transition-all text-center`}
      >
        <div className={`text-sm font-black ${c.text} truncate`}>{player.name}</div>
        <div className="text-[10px] text-white/40">{player.position || player.specificPosition || '?'} · OVR {player.rating || player.ovr || '?'}</div>
        {/* Arketip rozeti — her zaman görünür */}
        {(() => {
          const arch = getArchetypeLabel(player);
          const cat = getArchetypeCategory(player);
          if (!arch) return null;
          const meta = cat ? CATEGORY_META[cat] : null;
          const Icon = meta ? meta.icon : Star;
          return (
            <div className={`mt-1.5 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md ${meta ? `${meta.bg} ${meta.color}` : 'bg-white/5 text-white/60'} border ${meta ? meta.border : 'border-white/10'}`}>
              <Icon size={9} />
              <span className="text-[9px] font-bold tracking-wide">{arch}</span>
            </div>
          );
        })()}
        <ChevronDown size={12} className={`mx-auto mt-1 ${c.text} transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute z-50 top-full mt-1 left-0 right-0 bg-zinc-900 border border-white/15 rounded-xl shadow-2xl max-h-64 overflow-y-auto">
          {/* Search */}
          <div className="sticky top-0 bg-zinc-900 p-2 border-b border-white/10">
            <div className="flex items-center gap-1.5 px-2 py-1.5 bg-black/40 rounded-lg">
              <Search size={12} className="text-white/30" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Oyuncu ara..."
                className="flex-1 bg-transparent text-xs text-white/80 placeholder:text-white/20 focus:outline-none"
                autoFocus
              />
              {search && (
                <button onClick={() => setSearch('')}>
                  <X size={12} className="text-white/30 hover:text-white/60" />
                </button>
              )}
            </div>
          </div>

          {/* Player list */}
          <div className="p-1">
            {filtered.length === 0 && (
              <div className="text-center text-[10px] text-white/30 py-4">Oyuncu bulunamadı</div>
            )}
            {filtered.map((p) => {
              const arch = getArchetypeLabel(p);
              const cat = getArchetypeCategory(p);
              const meta = cat ? CATEGORY_META[cat] : null;
              const Icon = meta ? meta.icon : Star;
              return (
              <button
                key={p.id}
                onClick={() => {
                  onSelect(p);
                  setOpen(false);
                }}
                className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-left hover:bg-white/5 transition-all ${
                  p.id === player.id ? `${c.bg}` : ''
                }`}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${c.dot} text-black shrink-0`}>
                  {p.name?.charAt(0)?.toUpperCase() || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-white/80 truncate">{p.name}</div>
                  <div className="flex items-center gap-1 text-[8px] text-white/30">
                    <span>{p.position || p.specificPosition || '?'} · OVR {p.rating || p.ovr || '?'}</span>
                  </div>
                  {arch && (
                    <div className={`inline-flex items-center gap-0.5 mt-0.5 px-1 py-0 rounded ${meta ? `${meta.bg} ${meta.color}` : 'bg-white/5 text-white/50'} border ${meta ? meta.border : 'border-white/10'}`}>
                      <Icon size={7} />
                      <span className="text-[7px] font-bold tracking-wide">{arch}</span>
                    </div>
                  )}
                </div>
                {p.id === player.id && (
                  <span className={`text-[8px] font-black ${c.text} uppercase`}>● Seçili</span>
                )}
              </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Arketip etiketleri ─────────────────────────────────────────────────
// playerGenerator.ts içindeki traitBoosts isimleriyle birebir eşleşir.
const ARCHETYPE_LABELS_TR: Record<string, string> = {
  // Kaleci
  'Refleks canavarı': 'Refleks Canavarı',
  'Güvenli eller': 'Güvenli Eller',
  '1v1 ustası': '1v1 Ustası',
  'Hava hakimiyeti': 'Hava Hakimiyeti',
  // Defans
  'Kale gibi': 'Kale Gibi',
  'Lider stoper': 'Lider Stoper',
  'Topla çıkan stoper': 'Topla Çıkan Stoper',
  'Hızlı stoper': 'Hızlı Stoper',
  'Markajcı': 'Markajcı',
  'Gölge Markajcı': 'Gölge Markajcı',
  'Kanat bekçisi': 'Kanat Bekçisi',
  'Uzun pas ustası': 'Uzun Pas Ustası',
  'Süpürücü (libero)': 'Süpürücü (Libero)',
  'Top saklayan': 'Top Saklayan',
  // Orta Saha
  'Pres ustası': 'Pres Ustası',
  'Tempo kontrolcüsü': 'Tempo Kontrolcüsü',
  'Regista': 'Regista',
  'Oyun Bozan': 'Oyun Bozan',
  'Oyun kurucu': 'Oyun Kurucu',
  'Box-to-box': 'Box-to-Box',
  'Top dağıtıcı': 'Top Dağıtıcı',
  'Uzaktan şutçu': 'Uzaktan Şutçu',
  'Pas arası ustası': 'Pas Arası Ustası',
  // Ofansif Orta Saha / Kanat
  '10 numara': '10 Numara',
  'Boşluk bulucu': 'Boşluk Bulucu',
  'Oyun görüşü yüksek': 'Oyun Görüşü Yüksek',
  'Koşu ustası': 'Koşu Ustası',
  'Boşluk avcısı': 'Boşluk Avcısı',
  'Kontra canavarı': 'Kontra Canavarı',
  // Forvet
  'Bitirici': 'Bitirici',
  'Sahte 9': 'Sahte 9',
  'Pozisyoncu': 'Pozisyoncu',
  'Fırsatçı': 'Fırsatçı',
  'Gol makinesi': 'Gol Makinesi',
  'Fiziksel santrafor': 'Fiziksel Santrafor',
  'Hızlı forvet': 'Hızlı Forvet',
  'Kafacı (forvet)': 'Kafacı Forvet',
};

// Arketip → kategori (renk + ikon seçimi için)
type ArchetypeCategory = 'GK' | 'DEF' | 'MID' | 'FWD';

const ARCHETYPE_CATEGORY: Record<string, ArchetypeCategory> = {
  // Kaleci
  'Refleks canavarı': 'GK', 'Güvenli eller': 'GK', '1v1 ustası': 'GK', 'Hava hakimiyeti': 'GK',
  // Defans
  'Kale gibi': 'DEF', 'Lider stoper': 'DEF', 'Topla çıkan stoper': 'DEF',
  'Hızlı stoper': 'DEF', 'Markajcı': 'DEF', 'Gölge Markajcı': 'DEF',
  'Kanat bekçisi': 'DEF', 'Uzun pas ustası': 'DEF', 'Süpürücü (libero)': 'DEF', 'Top saklayan': 'DEF',
  // Orta Saha
  'Pres ustası': 'MID', 'Tempo kontrolcüsü': 'MID', 'Regista': 'MID', 'Oyun Bozan': 'MID',
  'Oyun kurucu': 'MID', 'Box-to-box': 'MID', 'Top dağıtıcı': 'MID',
  'Uzaktan şutçu': 'MID', 'Pas arası ustası': 'MID',
  // Ofansif
  '10 numara': 'MID', 'Boşluk bulucu': 'MID', 'Oyun görüşü yüksek': 'MID',
  'Koşu ustası': 'MID', 'Boşluk avcısı': 'FWD', 'Kontra canavarı': 'FWD',
  // Forvet
  'Bitirici': 'FWD', 'Sahte 9': 'FWD', 'Pozisyoncu': 'FWD', 'Fırsatçı': 'FWD',
  'Gol makinesi': 'FWD', 'Fiziksel santrafor': 'FWD', 'Hızlı forvet': 'FWD', 'Kafacı (forvet)': 'FWD',
};

const CATEGORY_META: Record<ArchetypeCategory, { label: string; icon: typeof Star; color: string; bg: string; border: string }> = {
  GK:   { label: 'Kaleci',     icon: Shield,  color: 'text-emerald-300', bg: 'bg-emerald-500/15', border: 'border-emerald-500/40' },
  DEF:  { label: 'Defans',     icon: Shield,  color: 'text-blue-300',    bg: 'bg-blue-500/15',    border: 'border-blue-500/40' },
  MID:  { label: 'Orta Saha',  icon: Brain,   color: 'text-purple-300',  bg: 'bg-purple-500/15',  border: 'border-purple-500/40' },
  FWD:  { label: 'Forvet',     icon: Target,  color: 'text-red-300',     bg: 'bg-red-500/15',     border: 'border-red-500/40' },
};

function getArchetypeLabel(player: any): string | null {
  if (!player) return null;
  const arch = player.archetype || player.archetypeType || player.archetype_label;
  if (!arch) return null;
  return ARCHETYPE_LABELS_TR[arch] || arch;
}

function getArchetypeCategory(player: any): ArchetypeCategory | null {
  if (!player) return null;
  const arch = player.archetype || player.archetypeType || player.archetype_label;
  if (!arch) return null;
  return ARCHETYPE_CATEGORY[arch] || null;
}

// ─── Ana Modal ───────────────────────────────────────────────────────────
export default function PlayerComparisonModal({
  open,
  onClose,
  player1,
  player2,
  squad = [],
  onPlayer1Change,
  onPlayer2Change,
}: PlayerComparisonModalProps) {
  if (!open) return null;

  const p1 = player1;
  const p2 = player2;
  const hasSquad = squad.length > 0;

  const categories = [
    { label: 'Teknik', attrs: TECHNICAL_ATTRS },
    { label: 'Fiziksel', attrs: PHYSICAL_ATTRS },
    { label: 'Zihinsel', attrs: MENTAL_ATTRS },
  ];

  const getAttrValue = (player: any, attr: string): number => {
    return player?.[attr] || 0;
  };

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto bg-zinc-950 border-white/10">
        <DialogHeader>
          <DialogTitle className="text-white text-sm">⚖️ Oyuncu Karşılaştırma</DialogTitle>
        </DialogHeader>

        {/* ── Oyuncu Seçiciler (tıklanabilir) ── */}
        <div className="grid grid-cols-[1fr_auto_1fr] gap-2 mb-3 items-start">
          <div>
            {hasSquad && onPlayer1Change ? (
              <PlayerSelector
                player={p1}
                squad={squad}
                onSelect={onPlayer1Change}
                accentColor="amber"
              />
            ) : (
              <div className="text-center p-2.5 rounded-xl border border-amber-500/40 bg-amber-500/10">
                <div className="text-sm font-black text-amber-300 truncate">{p1?.name}</div>
                <div className="text-[10px] text-white/40">{p1?.position} · OVR {p1?.ovr || p1?.rating}</div>
                {(() => {
                  const arch = getArchetypeLabel(p1);
                  const cat = getArchetypeCategory(p1);
                  if (!arch) return null;
                  const meta = cat ? CATEGORY_META[cat] : null;
                  const Icon = meta ? meta.icon : Star;
                  return (
                    <div className={`mt-1.5 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md ${meta ? `${meta.bg} ${meta.color}` : 'bg-white/5 text-white/60'} border ${meta ? meta.border : 'border-white/10'}`}>
                      <Icon size={9} />
                      <span className="text-[9px] font-bold tracking-wide">{arch}</span>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
          <div className="text-white/20 text-xs pt-4 font-bold">VS</div>
          <div>
            {hasSquad && onPlayer2Change ? (
              <PlayerSelector
                player={p2}
                squad={squad}
                onSelect={onPlayer2Change}
                accentColor="blue"
              />
            ) : (
              <div className="text-center p-2.5 rounded-xl border border-blue-500/40 bg-blue-500/10">
                <div className="text-sm font-black text-blue-300 truncate">{p2?.name}</div>
                <div className="text-[10px] text-white/40">{p2?.position} · OVR {p2?.ovr || p2?.rating}</div>
                {(() => {
                  const arch = getArchetypeLabel(p2);
                  const cat = getArchetypeCategory(p2);
                  if (!arch) return null;
                  const meta = cat ? CATEGORY_META[cat] : null;
                  const Icon = meta ? meta.icon : Star;
                  return (
                    <div className={`mt-1.5 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md ${meta ? `${meta.bg} ${meta.color}` : 'bg-white/5 text-white/60'} border ${meta ? meta.border : 'border-white/10'}`}>
                      <Icon size={9} />
                      <span className="text-[9px] font-bold tracking-wide">{arch}</span>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        </div>

        {/* ── Arketip Karşılaştırma Şeridi ── */}
        {(() => {
          const arch1 = getArchetypeLabel(p1);
          const arch2 = getArchetypeLabel(p2);
          const cat1 = getArchetypeCategory(p1);
          const cat2 = getArchetypeCategory(p2);
          if (!arch1 && !arch2) return null;

          const meta1 = cat1 ? CATEGORY_META[cat1] : null;
          const meta2 = cat2 ? CATEGORY_META[cat2] : null;
          const Icon1 = meta1 ? meta1.icon : Star;
          const Icon2 = meta2 ? meta2.icon : Star;
          // Aynı kategoride mi?
          const sameCat = cat1 && cat2 && cat1 === cat2;
          const sameArch = arch1 && arch2 && arch1 === arch2;

          return (
            <div className="mb-4 p-2.5 rounded-xl bg-white/[0.03] border border-white/10">
              <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                {/* Sol arketip */}
                <div className="flex items-center gap-1.5 justify-end min-w-0">
                  {arch1 ? (
                    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-md ${meta1 ? `${meta1.bg} ${meta1.color}` : 'bg-white/5 text-white/60'} border ${meta1 ? meta1.border : 'border-white/10'}`}>
                      <Icon1 size={11} />
                      <span className="text-[10px] font-black tracking-wide truncate">{arch1}</span>
                    </div>
                  ) : (
                    <span className="text-[9px] text-white/20 italic">—</span>
                  )}
                </div>
                {/* Merkez — karşılaştırma rozeti */}
                <div className="text-center">
                  <div className="text-[8px] font-black uppercase tracking-widest text-white/30 mb-0.5">Arketip</div>
                  {sameArch ? (
                    <div className="text-[9px] font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                      ⚡ AYNI
                    </div>
                  ) : sameCat ? (
                    <div className="text-[9px] font-black text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/30">
                      ≈ BENZER
                    </div>
                  ) : (
                    <div className="text-[9px] font-black text-white/40 bg-white/5 px-2 py-0.5 rounded-full border border-white/10">
                      ≠ FARKLI
                    </div>
                  )}
                </div>
                {/* Sağ arketip */}
                <div className="flex items-center gap-1.5 justify-start min-w-0">
                  {arch2 ? (
                    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-md ${meta2 ? `${meta2.bg} ${meta2.color}` : 'bg-white/5 text-white/60'} border ${meta2 ? meta2.border : 'border-white/10'}`}>
                      <Icon2 size={11} />
                      <span className="text-[10px] font-black tracking-wide truncate">{arch2}</span>
                    </div>
                  ) : (
                    <span className="text-[9px] text-white/20 italic">—</span>
                  )}
                </div>
              </div>
              {(p1?.playStyle || p2?.playStyle) && (
                <div className="mt-2 pt-2 border-t border-white/10 grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                  <div className="text-[9px] text-white/40 text-right truncate">
                    {p1?.playStyle ? `🎮 ${p1.playStyle}` : '—'}
                  </div>
                  <div className="text-[7px] font-black uppercase tracking-widest text-white/20">Stil</div>
                  <div className="text-[9px] text-white/40 text-left truncate">
                    {p2?.playStyle ? `🎮 ${p2.playStyle}` : '—'}
                  </div>
                </div>
              )}
            </div>
          );
        })()}

        {/* ── Oyuncu Özet Kartları ── */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {[p1, p2].map((p, i) => {
            if (!p) return null;
            const color = i === 0 ? 'amber' : 'blue';
            const colorClasses = color === 'amber'
              ? 'border-amber-500/30 bg-amber-500/5 text-amber-300'
              : 'border-blue-500/30 bg-blue-500/5 text-blue-300';
            return (
              <div key={i} className={`rounded-xl border ${colorClasses} p-3`}>
                {/* Temel bilgiler */}
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[8px] font-black uppercase tracking-wider text-white/30">Pozisyon</span>
                  <span className="text-[10px] font-bold text-white/70">{p.position || p.specificPosition || '?'}</span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[8px] font-black uppercase tracking-wider text-white/30">Yaş</span>
                  <span className="text-[10px] font-bold text-white/70">{p.age || '?'}</span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[8px] font-black uppercase tracking-wider text-white/30">Rating</span>
                  <span className="text-[10px] font-bold text-white/70">{p.rating || p.ovr || '?'}</span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[8px] font-black uppercase tracking-wider text-white/30">Potansiyel</span>
                  <span className="text-[10px] font-bold text-white/70">{p.potential || '?'}</span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[8px] font-black uppercase tracking-wider text-white/30">Uyruk</span>
                  <span className="text-[10px] font-bold text-white/70">{p.nation || p.nationality || '?'}</span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[8px] font-black uppercase tracking-wider text-white/30">Mevki Ayak</span>
                  <span className="text-[10px] font-bold text-white/70">{p.preferred_foot || '?'}</span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[8px] font-black uppercase tracking-wider text-white/30">Değer</span>
                  <span className="text-[10px] font-bold text-white/70">{(p.market_value || 0).toLocaleString('tr-TR')} €</span>
                </div>

                {/* ── Arketip kart üzerinde de görünür (kart rengiyle uyumlu) ── */}
                {(() => {
                  const arch = getArchetypeLabel(p);
                  const cat = getArchetypeCategory(p);
                  if (!arch) return null;
                  const meta = cat ? CATEGORY_META[cat] : null;
                  const Icon = meta ? meta.icon : Star;
                  return (
                    <div className="mt-2 pt-2 border-t border-white/10">
                      <span className="text-[8px] font-black uppercase tracking-wider text-white/30 block mb-1">Arketip</span>
                      <div className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md ${meta ? `${meta.bg} ${meta.color}` : 'bg-white/5 text-white/60'} border ${meta ? meta.border : 'border-white/10'}`}>
                        <Icon size={9} />
                        <span className="text-[9px] font-black tracking-wide">{arch}</span>
                      </div>
                      {p?.playStyle && (
                        <div className="mt-1 text-[9px] text-white/40">🎮 {p.playStyle}</div>
                      )}
                    </div>
                  );
                })()}

                {/* ── Özellikler (Traits) ── */}
                {p.traits && Array.isArray(p.traits) && p.traits.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-white/10">
                    <span className="text-[8px] font-black uppercase tracking-wider text-white/30 block mb-1">Özellikler</span>
                    <div className="flex flex-wrap gap-1">
                      {p.traits.slice(0, 5).map((t: string, ti: number) => (
                        <span key={ti} className={`text-[8px] px-1.5 py-0.5 rounded ${color === 'amber' ? 'bg-amber-500/15 text-amber-300/80' : 'bg-blue-500/15 text-blue-300/80'}`}>
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* ── Detaylı Nitelik Karşılaştırma ── */}
        {categories.map(cat => (
          <div key={cat.label} className="mb-4">
            <h4 className="text-xs font-bold text-white/50 mb-2 uppercase tracking-wider">{cat.label}</h4>
            <div className="space-y-0.5">
              {cat.attrs.map(attr => {
                const v1 = getAttrValue(p1, attr);
                const v2 = getAttrValue(p2, attr);
                const diff = v1 - v2;

                return (
                  <div key={attr} className="grid grid-cols-[1fr_auto_1fr] items-center gap-1 text-[10px] py-0.5">
                    {/* Sol değer + bar */}
                    <div className="flex items-center gap-1.5 justify-end">
                      <span className={`font-bold tabular-nums ${diff > 0 ? 'text-emerald-400' : 'text-white/40'}`}>
                        {v1}{diff > 0 ? ' ▲' : ''}
                      </span>
                      <div className="flex-1 max-w-[60px] h-1 bg-white/5 rounded-full overflow-hidden flex justify-end">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${(v1 / 100) * 100}%`,
                            background: diff > 0 ? 'rgb(251 191 36)' : 'rgba(255,255,255,0.2)',
                          }}
                        />
                      </div>
                    </div>
                    {/* Merkez — nitelik adı */}
                    <div className="text-white/30 text-center min-w-[70px] capitalize font-medium">
                      {ATTR_LABELS_TR[attr] || attr.replace(/_/g, ' ')}
                    </div>
                    {/* Sağ bar + değer */}
                    <div className="flex items-center gap-1.5">
                      <div className="flex-1 max-w-[60px] h-1 bg-white/5 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${(v2 / 100) * 100}%`,
                            background: diff < 0 ? 'rgb(96 165 250)' : 'rgba(255,255,255,0.2)',
                          }}
                        />
                      </div>
                      <span className={`font-bold tabular-nums ${diff < 0 ? 'text-emerald-400' : 'text-white/40'}`}>
                        {diff < 0 ? '▲ ' : ''}{v2}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </DialogContent>
    </Dialog>
  );
}
