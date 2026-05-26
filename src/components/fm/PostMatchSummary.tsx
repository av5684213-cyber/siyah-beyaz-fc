'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronRight, Star, Clock, BarChart2, Shield, Swords, TrendingUp, User } from 'lucide-react';
import { Player, MatchResult } from '@/lib/fm/types';

interface PostMatchSummaryProps {
  result: MatchResult;
  homeScore: number;
  awayScore: number;
  players: Player[];            // homeSquad
  awayTeam?: Player[];          // awaySquad (opponent)
  homeTeamName?: string;
  awayTeamName?: string;
  activeTactic?: { formation?: string; tactic_type?: string; mentality?: number };
  onClose: () => void;
}

// ─── Yardımcı: Oyuncunun rating'ine göre neden üretir ───────────────────────
function getRatingReason(
  player: Player,
  rating: number,
  stats: { goals: number; assists: number; yellowCards?: number; redCards?: number; fouls?: number; saves?: number },
  isGK: boolean
): string {
  const g = stats.goals || 0;
  const a = stats.assists || 0;
  const yc = stats.yellowCards || 0;
  const rc = stats.redCards || 0;
  const saves = stats.saves || 0;

  if (rc > 0) return 'Kırmızı kart gördü, takımı on kişi bıraktı';
  if (g >= 3) return `Harika hat-trick performansı!`;
  if (g === 2 && a >= 1) return `${g} gol ${a} asist — olağanüstü maç`;
  if (g === 2) return `2 gol attı, maça damga vurdu`;
  if (g === 1 && a >= 2) return `Gol + ${a} asist, yaratıcılığıyla öne çıktı`;
  if (g === 1 && a === 1) return `Gol ve asist — dengeli ve etkili`;
  if (g === 1) return `Golüyle fark yarattı`;
  if (a >= 2) return `${a} asist — yaratıcılık zirvesinde`;
  if (a === 1) return `Asistli performans, takıma katkı`;
  if (isGK && saves >= 5) return `${saves} kurtarış — takımı sırtladı`;
  if (isGK && saves >= 3) return `${saves} kritik kurtarış yaptı`;
  if (isGK && rating >= 7.5) return `Güvenilir performans, kale çok iyi korundu`;
  if (isGK && rating < 5.5) return `Gol yemesini engelleyemedi`;
  if (rating >= 8.5) return `Üstün saha performansı, her dueloda kazandı`;
  if (rating >= 7.5) return `Güçlü katkı, tutarlı ve etkili oyun`;
  if (rating >= 6.5) return `Tatmin edici, görevini yerine getirdi`;
  if (rating >= 5.5) return `Sıradan performans, belirgin katkı sağlayamadı`;
  if (yc > 0) return `Sarı kart aldı, disiplin sorunu yaşadı`;
  return `Etkisiz kaldı, maça yeterince damga vuramadı`;
}

// ─── Yardımcı: Rating renk sınıfı ────────────────────────────────────────────
function getRatingColor(r: number): string {
  if (r >= 8.5) return 'text-emerald-400';
  if (r >= 7.5) return 'text-lime-400';
  if (r >= 6.5) return 'text-amber-400';
  if (r >= 5.5) return 'text-orange-400';
  return 'text-red-400';
}

// ─── Yardımcı: Olay ikonunu ve rengini belirle ────────────────────────────────
function getEventStyle(type: string): { icon: string; color: string; label: string } {
  switch (type) {
    case 'GOAL':          return { icon: '⚽', color: 'text-white',     label: 'Gol' };
    case 'PENALTY_GOAL':  return { icon: '⚽', color: 'text-amber-300', label: 'Penaltı Golü' };
    case 'OWN_GOAL':      return { icon: '⚽', color: 'text-red-400',   label: 'Kendi Kalesine' };
    case 'YELLOW':        return { icon: '🟨', color: 'text-yellow-400', label: 'Sarı Kart' };
    case 'SECOND_YELLOW': return { icon: '🟧', color: 'text-orange-400', label: 'İkinci Sarı' };
    case 'RED':           return { icon: '🟥', color: 'text-red-500',    label: 'Kırmızı Kart' };
    case 'INJURY':        return { icon: '🩹', color: 'text-rose-400',   label: 'Sakatlık' };
    case 'SUB':           return { icon: '🔄', color: 'text-blue-400',   label: 'Oyuncu Değişikliği' };
    default:              return { icon: '•',  color: 'text-white/40',   label: '' };
  }
}

// ─── Yardımcı: Rakip güç hesabı ─────────────────────────────────────────────
function calcOpponentStrength(team: Player[]): { overall: number; attack: number; midfield: number; defense: number } {
  if (!team.length) return { overall: 60, attack: 60, midfield: 60, defense: 60 };
  const avg = (arr: number[]) => arr.length ? arr.reduce((s, v) => s + v, 0) / arr.length : 60;
  const fwd = team.filter(p => p.position === 'FWD').map(p => p.rating);
  const mid = team.filter(p => p.position === 'MID').map(p => p.rating);
  const def = team.filter(p => p.position === 'DEF' || p.position === 'GK').map(p => p.rating);
  const overall = Math.round(avg(team.map(p => p.rating)));
  return {
    overall,
    attack:   Math.round(avg(fwd.length ? fwd : team.map(p => p.rating))),
    midfield: Math.round(avg(mid.length ? mid : team.map(p => p.rating))),
    defense:  Math.round(avg(def.length ? def : team.map(p => p.rating))),
  };
}

// ─── Yardımcı: Rakip taktik analizi ─────────────────────────────────────────
function analyzeOpponentTactic(
  awayScore: number,
  homeScore: number,
  extStats: any,
  awayTeam: Player[]
): { label: string; desc: string; icon: string; details: string[] } {
  const possession = extStats?.away?.possession ?? 50;
  const shots      = extStats?.away?.shots ?? 0;
  const fouls      = extStats?.away?.fouls ?? 0;
  const corners    = extStats?.away?.corners ?? 0;

  const isAggressive = fouls >= 12;
  const isDominant   = possession > 55;
  const isCounter    = possession < 40 && shots >= 6;
  const isDefensive  = possession < 45 && shots < 5;

  if (isCounter) return {
    label: 'Kontra Atak',
    icon: '⚡',
    desc: 'Düşük topla oynama, yüksek atakta etkinlik. Savunmayı sağlam tutup hızlı geçiş arıyor.',
    details: [
      `Topla oynama: %${possession} (düşük, planlı)`,
      `${shots} şut, geçişten gelme eğilimi`,
      `${corners} korner — alan baskısı kurmuyor`,
    ],
  };

  if (isDominant) return {
    label: 'Dominant Kontrol',
    icon: '🌊',
    desc: 'Yüksek topla oynama. Maçın temposunu kendisi belirliyor, baskıyla alanı daralttı.',
    details: [
      `Topla oynama: %${possession} (yüksek)`,
      `${shots} şut — baskıdan fırsatlar yaratıldı`,
      `${corners} korner — set parçası tehlikesi`,
    ],
  };

  if (isAggressive) return {
    label: 'Yüksek Baskı',
    icon: '🔥',
    desc: 'Agresif pressing ve sert müdahaleler. Topu erken kaybettirmeye odaklı.',
    details: [
      `${fouls} faul — baskı odaklı oyun tarzı`,
      `Topla oynama: %${possession}`,
      `Sert mücadeleden kaçınmıyor`,
    ],
  };

  if (isDefensive) return {
    label: 'Kale Önü Savunma',
    icon: '🛡️',
    desc: 'Düşük çizgi, sıkı blok. Gol yememek için her şeyden önce savunmayı düşünüyor.',
    details: [
      `Topla oynama: %${possession} (pasif)`,
      `${shots} şut — minimum ofans riski`,
      `Dar alan, sıkı markaj eğilimi`,
    ],
  };

  return {
    label: 'Dengeli Oyun',
    icon: '⚖️',
    desc: 'Ne tam saldırı ne tam savunma. Risk almadan, fırsatı bekledi.',
    details: [
      `Topla oynama: %${possession}`,
      `${shots} şut`,
      `${corners} korner`,
    ],
  };
}

// ─── Sekme tanımları ─────────────────────────────────────────────────────────
const TABS = [
  { id: 'summary',   label: 'Özet',        Icon: Star },
  { id: 'players',   label: 'Oyuncular',   Icon: User },
  { id: 'timeline',  label: 'Zaman Çizelgesi', Icon: Clock },
  { id: 'stats',     label: 'İstatistikler', Icon: BarChart2 },
  { id: 'opponent',  label: 'Rakip Analizi', Icon: Swords },
] as const;

type TabId = typeof TABS[number]['id'];

// ═════════════════════════════════════════════════════════════════════════════
// ANA BILEŞEN
// ═════════════════════════════════════════════════════════════════════════════
export default function PostMatchSummary({
  result,
  homeScore,
  awayScore,
  players,
  awayTeam = [],
  homeTeamName = 'Takımın',
  awayTeamName = 'Rakip',
  activeTactic,
  onClose,
}: PostMatchSummaryProps) {
  const [activeTab, setActiveTab] = useState<TabId>('summary');

  const isWin  = homeScore > awayScore;
  const isDraw = homeScore === awayScore;

  const resultLabel = isWin ? 'GALİBİYET' : isDraw ? 'BERABERLİK' : 'MAĞLUBIYET';
  const resultColor = isWin ? 'text-emerald-400' : isDraw ? 'text-amber-400' : 'text-red-400';
  const resultBg    = isWin ? 'from-emerald-900/20' : isDraw ? 'from-amber-900/20' : 'from-red-900/20';

  // ─── Hesaplamalar ──────────────────────────────────────────────────────────
  const extStats = (result as any).extendedStats;

  const playerRows = useMemo(() => {
    return players
      .map(p => {
        const rating = result.playerRatings?.[p.id] ?? 6.0;
        const stats  = result.playerStats?.[p.id] ?? { goals: 0, assists: 0 };
        const isGK   = p.position === 'GK' || p.specificPosition === 'GK';
        const eventsForPlayer = result.events.filter(
          e => e.player === p.name || e.player === p.id
        );
        const saves = eventsForPlayer.filter(e => (e.type as string) === 'SAVE').length;
        const fullStats = { ...stats, saves };
        const reason = getRatingReason(p, rating, fullStats, isGK);
        return { player: p, rating, stats: fullStats, reason, isGK };
      })
      .sort((a, b) => b.rating - a.rating);
  }, [players, result]);

  const criticalEvents = useMemo(() => {
    const types = new Set(['GOAL', 'PENALTY_GOAL', 'OWN_GOAL', 'RED', 'SECOND_YELLOW', 'YELLOW', 'INJURY', 'SUB']);
    return result.events
      .filter(e => types.has(e.type))
      .sort((a, b) => a.minute - b.minute);
  }, [result.events]);

  const opponentStrength = useMemo(() => calcOpponentStrength(awayTeam), [awayTeam]);
  const opponentTactic   = useMemo(
    () => analyzeOpponentTactic(awayScore, homeScore, extStats, awayTeam),
    [awayScore, homeScore, extStats, awayTeam]
  );

  const motmPlayer = useMemo(() => {
    if (!result.motm) return playerRows[0]?.player;
    return players.find(p => p.name === result.motm || p.id === result.motm) ?? playerRows[0]?.player;
  }, [result.motm, players, playerRows]);

  const homeStr = useMemo(() => {
    const avg = players.length
      ? Math.round(players.reduce((s, p) => s + p.rating, 0) / players.length)
      : 60;
    return avg;
  }, [players]);

  // ─── Tüm istatistik satırları ──────────────────────────────────────────────
  const allStats = useMemo(() => {
    const h = result.stats.home;
    const a = result.stats.away;
    const eh = extStats?.home ?? {};
    const ea = extStats?.away ?? {};
    return [
      { label: 'Topla Oynama',    h: h.possession,         a: a.possession,         suffix: '%' },
      { label: 'Toplam Şut',      h: h.shots,              a: a.shots,              suffix: '' },
      { label: 'İsabetli Şut',    h: h.shotsOnTarget,      a: a.shotsOnTarget,      suffix: '' },
      { label: 'Pas İsabeti',     h: h.passing ?? 0,       a: a.passing ?? 0,       suffix: '%' },
      { label: 'Faul',            h: eh.fouls ?? 0,        a: ea.fouls ?? 0,        suffix: '' },
      { label: 'Korner',          h: eh.corners ?? 0,      a: ea.corners ?? 0,      suffix: '' },
      { label: 'Kurtarış',        h: eh.saves ?? 0,        a: ea.saves ?? 0,        suffix: '' },
      { label: 'Ofsayt',          h: eh.offsides ?? 0,     a: ea.offsides ?? 0,     suffix: '' },
    ];
  }, [result, extStats]);

  // ═════════════════════════════════════════════════════════════════════════
  // RENDER
  // ═════════════════════════════════════════════════════════════════════════
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-2 sm:p-4 bg-black/95 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-2xl bg-zinc-950 border border-white/10 rounded-2xl overflow-hidden flex flex-col"
        style={{ maxHeight: '92vh' }}
      >
        {/* ── Header ── */}
        <div className={`relative bg-gradient-to-b ${resultBg} to-transparent px-6 pt-6 pb-4 flex-shrink-0`}>
          {/* glow line */}
          <div className={`absolute top-0 left-0 right-0 h-[2px] ${isWin ? 'bg-emerald-500' : isDraw ? 'bg-amber-500' : 'bg-red-500'} opacity-60`} />

          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-white/5 hover:bg-white/10 text-white/40 hover:text-white rounded-full transition-all"
          >
            <X size={16} />
          </button>

          <div className="flex items-center gap-6">
            {/* skor */}
            <div className="flex items-baseline gap-3">
              <span className="text-5xl font-black italic tracking-tighter text-white">{homeScore}</span>
              <span className="text-xl font-black text-white/20 italic">—</span>
              <span className="text-5xl font-black italic tracking-tighter text-white/60">{awayScore}</span>
            </div>

            {/* bilgi */}
            <div className="flex-1 min-w-0">
              <div className={`text-xs font-black uppercase tracking-[0.3em] mb-0.5 ${resultColor}`}>
                {resultLabel}
              </div>
              <div className="flex items-center gap-2 text-[11px] text-white/40 font-medium">
                <span className="truncate">{homeTeamName}</span>
                <span className="text-white/20">vs</span>
                <span className="truncate">{awayTeamName}</span>
              </div>
              {motmPlayer && (
                <div className="flex items-center gap-1.5 mt-1.5">
                  <Star size={10} className="text-amber-400 fill-amber-400" />
                  <span className="text-[10px] font-bold text-amber-400/80">
                    {motmPlayer.name}
                  </span>
                  <span className="text-[10px] text-white/30">maçın adamı</span>
                </div>
              )}
            </div>

            {/* oyuncu gücü */}
            <div className="text-right flex-shrink-0">
              <div className="text-2xl font-black italic text-white">{homeStr}</div>
              <div className="text-[10px] text-white/30 uppercase tracking-widest">OVR</div>
            </div>
          </div>
        </div>

        {/* ── Sekmeler ── */}
        <div className="flex border-b border-white/5 bg-black/40 flex-shrink-0 overflow-x-auto">
          {TABS.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-1.5 px-3 py-3 text-[11px] font-bold uppercase tracking-widest whitespace-nowrap transition-all flex-1 justify-center ${
                activeTab === id
                  ? 'text-white border-b-2 border-white'
                  : 'text-white/30 hover:text-white/60'
              }`}
            >
              <Icon size={11} />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>

        {/* ── İçerik ── */}
        <div className="overflow-y-auto flex-1 min-h-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.18 }}
              className="p-4 space-y-4"
            >
              {/* ════════════════════ ÖZET ════════════════════ */}
              {activeTab === 'summary' && (
                <>
                  {/* Sonuç metni */}
                  <div className="bg-white/3 border border-white/5 rounded-xl p-4">
                    <div className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-2">Maç Özeti</div>
                    <p className="text-sm text-white/70 leading-relaxed">
                      {isWin
                        ? `${homeTeamName}, ${awayTeamName} karşısında ${homeScore}-${awayScore}'lik güçlü galibiyetiyle 3 puanı aldı. ${motmPlayer ? `${motmPlayer.name}'in öne çıkan performansıyla` : 'Takım oyunuyla'} kazanılan bu zafer, ligdeki konumu açısından kritik öneme sahip.`
                        : isDraw
                        ? `${homeTeamName} ile ${awayTeamName} ${homeScore}-${awayScore} beraberlikle ayrıldı. İki takım da galibiyet için mücadele etti, ancak kazanan taraf çıkmadı. Puanın ikiye bölünmesi her iki taraf için de hayal kırıklığı yarattı.`
                        : `${homeTeamName} bu kez ${awayTeamName} karşısında ${homeScore}-${awayScore} yenilerek sahadan ayrıldı. Savunmadaki açıklar ve topu değerlendirmedeki yetersizlik mağlubiyetin temel sebepleri arasında.`
                      }
                    </p>
                  </div>

                  {/* Top 3 oyuncu */}
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-2 px-1">Öne Çıkan Oyuncular</div>
                    <div className="space-y-2">
                      {playerRows.slice(0, 3).map(({ player, rating, reason }, i) => (
                        <div key={player.id} className="flex items-center gap-3 bg-white/3 border border-white/5 rounded-xl px-4 py-3">
                          <div className="text-[10px] font-black text-white/20 w-4">{i + 1}</div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-bold text-white truncate">{player.name}</div>
                            <div className="text-[10px] text-white/40 truncate">{reason}</div>
                          </div>
                          <div className={`text-xl font-black italic tabular-nums ${getRatingColor(rating)}`}>
                            {rating.toFixed(1)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Hızlı istatistikler */}
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: 'Top Hakimiyeti', v: `${result.stats.home.possession}%` },
                      { label: 'İsabetli Şut',   v: `${result.stats.home.shotsOnTarget}/${result.stats.home.shots}` },
                      { label: 'Rakip Güç',      v: `${opponentStrength.overall} OVR` },
                    ].map(({ label, v }) => (
                      <div key={label} className="bg-white/3 border border-white/5 rounded-xl px-3 py-3 text-center">
                        <div className="text-sm font-black text-white">{v}</div>
                        <div className="text-[10px] text-white/30 mt-0.5">{label}</div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* ════════════════════ OYUNCULAR ════════════════════ */}
              {activeTab === 'players' && (
                <div className="space-y-1.5">
                  {/* Başlık satırı */}
                  <div className="grid grid-cols-[1fr_auto_auto] gap-2 px-3 pb-1 text-[9px] font-black uppercase tracking-widest text-white/20">
                    <span>Oyuncu</span>
                    <span className="w-16 text-center">G/A</span>
                    <span className="w-10 text-right">Puan</span>
                  </div>

                  {playerRows.map(({ player, rating, stats, reason }) => (
                    <motion.div
                      key={player.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="grid grid-cols-[1fr_auto_auto] gap-2 items-center bg-white/3 hover:bg-white/5 border border-white/5 rounded-xl px-3 py-2.5 transition-colors"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black text-white/20 w-8 flex-shrink-0">
                            {player.specificPosition || player.position}
                          </span>
                          <span className="text-sm font-bold text-white truncate">{player.name}</span>
                        </div>
                        <div className="text-[10px] text-white/35 mt-0.5 truncate pl-10">{reason}</div>
                      </div>
                      <div className="text-[11px] font-black text-white/50 w-16 text-center tabular-nums">
                        {stats.goals > 0 || stats.assists > 0
                          ? `${stats.goals}G ${stats.assists}A`
                          : <span className="text-white/20">—</span>
                        }
                      </div>
                      <div className={`text-lg font-black italic w-10 text-right tabular-nums ${getRatingColor(rating)}`}>
                        {rating.toFixed(1)}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* ════════════════════ ZAMAN ÇİZELGESİ ════════════════════ */}
              {activeTab === 'timeline' && (
                <div className="relative">
                  {/* dikey çizgi */}
                  <div className="absolute left-[30px] top-0 bottom-0 w-px bg-white/5" />

                  {criticalEvents.length === 0 && (
                    <div className="text-center text-white/20 text-sm py-8">Kritik olay kaydedilmedi</div>
                  )}

                  <div className="space-y-3">
                    {criticalEvents.map((event, i) => {
                      const style = getEventStyle(event.type);
                      const isHomeTeam = event.team === 'HOME';
                      return (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -12 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.04 }}
                          className="flex items-start gap-3"
                        >
                          {/* dakika badge */}
                          <div className="w-[60px] flex-shrink-0 flex items-center justify-end pr-3">
                            <span className="text-[11px] font-black text-white/40 tabular-nums">
                              {event.minute}&apos;
                            </span>
                          </div>

                          {/* nokta */}
                          <div className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center text-[10px] mt-0.5 z-10 bg-zinc-950 ${
                            isHomeTeam ? 'border-white/30' : 'border-white/10'
                          }`}>
                            {style.icon}
                          </div>

                          {/* içerik */}
                          <div className={`flex-1 min-w-0 pb-3 ${i < criticalEvents.length - 1 ? 'border-b border-white/4' : ''}`}>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`text-sm font-bold ${isHomeTeam ? 'text-white' : 'text-white/50'}`}>
                                {event.player || '—'}
                              </span>
                              {event.assistant && (
                                <span className="text-[10px] text-white/30">
                                  (asist: {event.assistant})
                                </span>
                              )}
                              <span className={`text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-white/5 ${style.color}`}>
                                {style.label}
                              </span>
                              {!isHomeTeam && (
                                <span className="text-[9px] text-white/20 uppercase tracking-widest">rakip</span>
                              )}
                            </div>
                            {event.text && (
                              <p className="text-[11px] text-white/35 mt-1 leading-relaxed line-clamp-2">
                                {event.text}
                              </p>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ════════════════════ İSTATİSTİKLER ════════════════════ */}
              {activeTab === 'stats' && (
                <div className="space-y-4">
                  {/* takım isimleri */}
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest px-1">
                    <span className="text-white">{homeTeamName}</span>
                    <span className="text-white/30">{awayTeamName}</span>
                  </div>

                  {allStats.map(({ label, h, a, suffix }, i) => {
                    const total = (h as number) + (a as number) || 1;
                    const hPct  = ((h as number) / total) * 100;
                    return (
                      <motion.div
                        key={label}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.05 }}
                        className="space-y-1.5"
                      >
                        <div className="flex justify-between items-center text-[11px]">
                          <span className="font-black text-white tabular-nums">{h}{suffix}</span>
                          <span className="text-white/30 text-[10px] uppercase tracking-widest">{label}</span>
                          <span className="font-bold text-white/40 tabular-nums">{a}{suffix}</span>
                        </div>
                        <div className="flex h-1 bg-white/5 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${hPct}%` }}
                            transition={{ duration: 0.6, delay: i * 0.05 }}
                            className="bg-white h-full"
                          />
                          <div className="bg-zinc-700 h-full flex-1" />
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}

              {/* ════════════════════ RAKİP ANALİZİ ════════════════════ */}
              {activeTab === 'opponent' && (
                <div className="space-y-4">
                  {/* Genel Güç */}
                  <div className="bg-white/3 border border-white/5 rounded-xl p-4">
                    <div className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-3">Rakip Genel Gücü</div>
                    <div className="flex items-end gap-4">
                      <div className="text-4xl font-black italic text-white">{opponentStrength.overall}</div>
                      <div className="text-sm text-white/40 pb-1">OVR</div>
                      <div className="flex-1 grid grid-cols-3 gap-2 pb-1">
                        {[
                          { label: 'Hücum',    v: opponentStrength.attack,   color: 'text-rose-400' },
                          { label: 'Orta Saha', v: opponentStrength.midfield, color: 'text-amber-400' },
                          { label: 'Savunma',  v: opponentStrength.defense,  color: 'text-blue-400' },
                        ].map(({ label, v, color }) => (
                          <div key={label} className="text-center">
                            <div className={`text-sm font-black ${color}`}>{v}</div>
                            <div className="text-[9px] text-white/25 uppercase tracking-widest">{label}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* güç karşılaştırma çubuğu */}
                    <div className="mt-3 space-y-1">
                      <div className="flex justify-between text-[10px] text-white/30">
                        <span>{homeTeamName} ({homeStr})</span>
                        <span>{awayTeamName} ({opponentStrength.overall})</span>
                      </div>
                      <div className="flex h-2 bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(homeStr / (homeStr + opponentStrength.overall)) * 100}%` }}
                          transition={{ duration: 0.8 }}
                          className="bg-white h-full rounded-l-full"
                        />
                        <div className="bg-zinc-600 h-full flex-1 rounded-r-full" />
                      </div>
                    </div>
                  </div>

                  {/* Taktik Analizi */}
                  <div className="bg-white/3 border border-white/5 rounded-xl p-4">
                    <div className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-3">Taktik Analizi</div>
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-2xl">{opponentTactic.icon}</span>
                      <div>
                        <div className="text-sm font-black text-white">{opponentTactic.label}</div>
                        <div className="text-[10px] text-white/40">{awayTeamName}</div>
                      </div>
                    </div>
                    <p className="text-[12px] text-white/55 leading-relaxed mb-3">{opponentTactic.desc}</p>
                    <div className="space-y-1.5">
                      {opponentTactic.details.map((d, i) => (
                        <div key={i} className="flex items-center gap-2 text-[11px] text-white/40">
                          <ChevronRight size={10} className="flex-shrink-0 text-white/20" />
                          {d}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Kendi taktiğin */}
                  {activeTactic && (
                    <div className="bg-white/3 border border-white/5 rounded-xl p-4">
                      <div className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-2">Senin Taktiğin</div>
                      <div className="flex items-center gap-4">
                        <div>
                          <div className="text-lg font-black text-white">
                            {activeTactic.formation || activeTactic.tactic_type || '4-4-2'}
                          </div>
                          <div className="text-[10px] text-white/30">Formasyon</div>
                        </div>
                        {activeTactic.mentality !== undefined && (
                          <div>
                            <div className="text-lg font-black text-white">
                              {['—','Defansif','Dengeli','Dengeli','Dengeli','Ofansif'][activeTactic.mentality] || activeTactic.mentality}
                            </div>
                            <div className="text-[10px] text-white/30">Mentalite</div>
                          </div>
                        )}
                        <div className="flex-1 flex items-center justify-end">
                          <TrendingUp size={14} className={isWin ? 'text-emerald-400' : isDraw ? 'text-amber-400' : 'text-red-400'} />
                          <span className={`text-[11px] font-bold ml-1.5 ${isWin ? 'text-emerald-400' : isDraw ? 'text-amber-400' : 'text-red-400'}`}>
                            {isWin ? 'İşe yaradı' : isDraw ? 'Dengeleyici' : 'Yetersiz kaldı'}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ── Footer ── */}
        <div className="flex-shrink-0 p-4 border-t border-white/5">
          <button
            onClick={onClose}
            className="w-full py-3 bg-white text-black text-[11px] font-black uppercase tracking-[0.3em] rounded-xl hover:bg-emerald-400 transition-colors"
          >
            Devam Et
          </button>
        </div>
      </motion.div>
    </div>
  );
}
