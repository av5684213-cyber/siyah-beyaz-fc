'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'motion/react';
import {
  ArrowLeft, Target, Activity, Footprints, Shield, HeartPulse,
  Zap, TrendingUp, DollarSign, Timer
} from 'lucide-react';
import { isSupabaseConfigured, getSupabase } from '@/lib/supabase';
import {
  toTitleCase, localizePosFull, formatPosBadge, getPosBadgeStyle,
  fmStatColor, fmStatBg, cap99, getPosGroup
} from '@/lib/fm/ui-helpers';
import { traitDescriptions } from '@/lib/fm/traits';
import { TRAIT_LEVELS } from '@/lib/fm/traitsData';
import Link from 'next/link';

// ──── Helpers ────

function safeJsonParse<T>(value: unknown, fallback: T): T {
  if (value === null || value === undefined) return fallback;
  if (typeof value === 'object') return value as T;
  if (typeof value === 'string') {
    try { return JSON.parse(value) as T; } catch { return fallback; }
  }
  return fallback;
}

function fmtVal(val: number): string {
  if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(1)}M`;
  if (val >= 1_000) return `${(val / 1_000).toFixed(0)}K`;
  return val.toString();
}

function fmtMoney(val: number): string {
  if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(1)}M €`;
  if (val >= 1_000) return `${(val / 1_000).toFixed(0)}K €`;
  return `${Math.round(val).toLocaleString('tr-TR')} €`;
}

// ──── Stat Row Component ────

function StatRow({ label, value }: { label: string; value: number | string }) {
  const valNum = typeof value === 'number' ? value : 50;
  const displayVal = typeof value === 'number' ? Math.round(value) : value;
  return (
    <div className={`flex items-center justify-between px-2 py-[3px] rounded-sm ${typeof value === 'number' ? fmStatBg(valNum) : 'bg-white/[0.02]'}`}>
      <span className="text-[10px] text-white/50 font-medium">{label}</span>
      <span className={`text-[11px] font-bold font-mono ${typeof value === 'number' ? fmStatColor(valNum) : 'text-white/20'}`}>{displayVal}</span>
    </div>
  );
}

// ──── Attribute Column Component ────

function AttrColumn({ title, icon, stats }: { title: string; icon: React.ReactNode; stats: { label: string; val: number }[] }) {
  const avg = stats.length > 0 ? Math.round(stats.reduce((a, s) => a + s.val, 0) / stats.length) : 0;
  return (
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-1.5 px-2 py-1.5 bg-white/[0.03] border border-white/[0.05] rounded-t-sm mb-px">
        {icon}
        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/60">{title}</span>
        <div className="flex-1 h-px bg-white/[0.06]" />
        <span className={`text-[11px] font-mono font-black ${fmStatColor(avg)}`}>{avg}</span>
      </div>
      <div>
        {stats.map(s => (
          <StatRow key={s.label} label={s.label} value={s.val} />
        ))}
      </div>
    </div>
  );
}

// ──── Condition / Morale Bar ────

function ConditionBar({ label, value, colorFn }: { label: string; value: number; colorFn: (v: number) => string }) {
  const pct = Math.min(100, Math.max(0, value));
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-[9px] font-bold text-white/40 uppercase tracking-wider">{label}</span>
        <span className={`text-[11px] font-mono font-black ${colorFn(pct)}`}>{Math.round(pct)}</span>
      </div>
      <div className="h-[6px] bg-white/[0.04] rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className={`h-full rounded-full ${colorFn(pct).replace('text-', 'bg-')}`}
          style={{ opacity: 0.85 }}
        />
      </div>
    </div>
  );
}

function barColor(v: number): string {
  if (v >= 80) return 'text-green-500';
  if (v >= 60) return 'text-emerald-400';
  if (v >= 40) return 'text-yellow-400';
  if (v >= 20) return 'text-orange-500';
  return 'text-red-500';
}

// ──── Main Component ────

export default function PlayerDetailPage() {
  const params = useParams();
  const playerId = params?.id as string;
  const [player, setPlayer] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!playerId) return;
    fetchPlayer();
  }, [playerId]);

  const fetchPlayer = async () => {
    if (!isSupabaseConfigured()) return;
    const supabase = getSupabase();
    if (!supabase) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .eq('id', playerId)
        .maybeSingle();

      if (error) console.error('Player fetch error:', error.message);
      else setPlayer(data);
    } catch (err) {
      console.error('Player fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-white/20 border-t-white rounded-full" />
      </div>
    );
  }

  if (!player) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        <p className="text-sm font-bold">Oyuncu bulunamadı.</p>
      </div>
    );
  }

  // ──── Parse personality JSONB ────
  const extra = safeJsonParse<Record<string, unknown>>(player.personality, {});
  const traits: string[] = safeJsonParse<string[]>(player.traits || extra.traits, []);
  const negTraits: string[] = safeJsonParse<string[]>(player.neg_traits || extra.negTraits, []);
  const personalityTraits: string[] = safeJsonParse<string[]>(player.personality_traits || extra.personalityTraits, []);
  const traitLevels = safeJsonParse<Record<string, string>>(player.trait_levels || extra.traitLevels, {});
  const playStyle: string | null = player.play_style || extra.playStyle || null;
  const archetype: string | null = player.archetype || extra.archetype || null;

  // ──── Position info ────
  const sp = player.specific_position || player.position;
  const isGK = player.position === 'GK' || sp === 'GK';
  const posBadge = formatPosBadge({
    specificPosition: player.specific_position,
    position: player.position,
    secondaryPositions: player.secondary_positions || [],
  });
  const posStyle = getPosBadgeStyle(player.specific_position || player.position);
  const secondaryPositions: string[] = Array.isArray(player.secondary_positions) ? player.secondary_positions as string[] : [];

  // ──── Attribute stat builders (using snake_case Supabase column names with fallbacks) ────

  const technicalStats: { label: string; val: number }[] = isGK ? [
    { label: 'Refleksler', val: player.gk_reflexes ?? player.goalkeeping ?? 50 },
    { label: 'Dalış', val: player.gk_diving ?? 50 },
    { label: 'Tutuş', val: player.gk_handling ?? 50 },
    { label: 'Vuruş', val: player.gk_kicking ?? player.passing ?? 50 },
    { label: 'Pozisyon', val: player.gk_positioning ?? player.positioning ?? 50 },
    { label: 'Yumruk', val: player.gk_punching ?? 50 },
  ] : [
    { label: 'Bitiricilik', val: player.finishing ?? player.shooting ?? 50 },
    { label: 'Dribbling', val: player.dribbling ?? player.control ?? 50 },
    { label: 'Pas', val: player.passing ?? 50 },
    { label: 'Orta Yapma', val: player.crossing ?? player.passing ?? 50 },
    { label: 'Serbest Vuruş', val: player.free_kick ?? player.shooting ?? 50 },
    { label: 'Uzaktan Şut', val: player.long_shots ?? player.shooting ?? 50 },
  ];

  const mentalStats: { label: string; val: number }[] = [
    { label: 'Vizyon', val: player.vision ?? 50 },
    { label: 'Pozisyon Alma', val: player.positioning ?? 50 },
    { label: 'Soğukkanlılık', val: player.composure ?? 50 },
    { label: 'Agresiflik', val: player.aggression ?? 50 },
    { label: 'Çalışkanlık', val: player.work_rate ?? player.workrate ?? 50 },
    { label: 'Liderlik', val: player.leadership ?? 50 },
  ];

  const physicalStats: { label: string; val: number }[] = [
    { label: 'Hızlanma', val: player.acceleration ?? player.speed ?? 50 },
    { label: 'Sprint Hızı', val: player.sprint_speed ?? player.speed ?? 50 },
    { label: 'Dayanıklılık', val: player.stamina ?? player.cond ?? 50 },
    { label: 'Güç', val: player.strength ?? player.power ?? 50 },
    { label: 'Çeviklik', val: player.agility ?? player.speed ?? 50 },
    { label: 'Zıplama', val: player.jumping ?? player.power ?? 50 },
  ];

  const gkStats: { label: string; val: number }[] = isGK ? [
    { label: 'Refleksler', val: player.gk_reflexes ?? player.goalkeeping ?? 50 },
    { label: 'Dalış', val: player.gk_diving ?? 50 },
    { label: 'Tutuş', val: player.gk_handling ?? 50 },
    { label: 'Vuruş', val: player.gk_kicking ?? player.passing ?? 50 },
    { label: 'Pozisyon', val: player.gk_positioning ?? player.positioning ?? 50 },
    { label: 'Yumruk', val: player.gk_punching ?? 50 },
  ] : [];

  // ──── Basic stat rows (kept from original) ────
  const statRows = [
    { label: 'Kalite (Klt)', value: player.klt || player.potential || 0 },
    { label: 'Ortalama', value: player.rating || 0 },
    { label: 'Kalecilik', value: player.goalkeeping || 0 },
    { label: 'Kontrol', value: player.control || 0 },
    { label: 'Pas', value: player.pas || player.passing || 0 },
    { label: 'Şut', value: player.sut || player.shooting || 0 },
    { label: 'Kafa', value: player.kfa || player.heading || 0 },
    { label: 'Hız', value: player.hiz || player.speed || 0 },
    { label: 'Güç', value: player.guc || player.power || 0 },
    { label: 'Algı', value: player.alg || player.vision || 0 },
    { label: 'Savunma', value: player.tk || player.defending || 0 },
    { label: 'Top Hakimiyeti', value: player.top || 0 },
  ];

  // ──── Injury ────
  const isInjured = player.is_injured || false;
  const injurySeverity = player.injury_severity;
  const injuryEndDate = player.injury_end_date;
  const injuryData = safeJsonParse<{ remaining_days?: number; severity?: number; type?: string } | null>(player.injury, null);

  // ──── Condition / Morale ────
  const cond = player.cond ?? 100;
  const morale = player.morale ?? 60;

  // ──── Form ────
  const formRating = player.form_rating ?? player.form ?? 50;
  const lastMatchRating = player.last_match_rating ?? null;

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* ──── Back link ──── */}
        <Link href="/" className="inline-flex items-center gap-2 text-white/40 hover:text-white transition-colors text-sm font-bold">
          <ArrowLeft size={16} /> Geri
        </Link>

        {/* ──── Header Card ──── */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-zinc-900/50 border border-white/5 rounded-[2rem] p-6 md:p-8">
          <div className="flex items-start gap-6">
            {/* Position Badge */}
            <div className={`w-20 h-20 rounded-2xl flex items-center justify-center text-lg font-black border-2 ${posStyle}`}>
              {posBadge}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl md:text-3xl font-black italic tracking-tighter">{toTitleCase(player.name)}</h1>
              <div className="flex flex-wrap gap-2 mt-2 text-[10px] font-bold text-white/40">
                <span className={`px-2 py-1 rounded-lg border ${posStyle}`}>
                  {localizePosFull(sp)}
                </span>
                {/* Secondary Positions as badges */}
                {secondaryPositions.length > 0 && secondaryPositions.map((p: string, idx: number) => {
                  const secGroup = getPosGroup(p);
                  const secBadgeStyle = getPosBadgeStyle(secGroup);
                  return (
                    <span key={idx} className={`px-2 py-1 rounded-lg border ${secBadgeStyle}`}>
                      {localizePosFull(p)}
                    </span>
                  );
                })}
                <span className="px-2 py-1 rounded-lg bg-white/5 border border-white/10">{player.age} YAŞ</span>
                <span className="px-2 py-1 rounded-lg bg-white/5 border border-white/10">{player.nation || 'TR'}</span>
                {player.preferred_foot && (
                  <span className="px-2 py-1 rounded-lg bg-white/5 border border-white/10">
                    {player.preferred_foot === 'Left' ? 'Sol' : player.preferred_foot === 'Right' ? 'Sağ' : 'Her İki'} Ayak
                  </span>
                )}
              </div>

              {/* Key numbers */}
              <div className="flex flex-wrap gap-4 mt-4">
                <div className="text-center">
                  <div className="text-2xl font-black text-emerald-400">{player.klt || player.potential || 0}</div>
                  <div className="text-[8px] text-white/20 font-bold uppercase">Kalite</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-black text-white/60">{player.rating || 0}</div>
                  <div className="text-[8px] text-white/20 font-bold uppercase">Ortalama</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-black text-amber-400">{fmtVal(player.market_value || 0)}</div>
                  <div className="text-[8px] text-white/20 font-bold uppercase">Değer</div>
                </div>
                {player.salary && (
                  <div className="text-center">
                    <div className="text-2xl font-black text-cyan-400">{fmtMoney(player.salary)}</div>
                    <div className="text-[8px] text-white/20 font-bold uppercase">Maaş</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* ──── Condition & Morale ──── */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="bg-zinc-900/50 border border-white/5 rounded-[2rem] p-6">
          <h2 className="text-sm font-black uppercase tracking-widest text-white/40 mb-4">Durum & Moral</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <ConditionBar label="Kondisyon" value={cond} colorFn={barColor} />
            <ConditionBar label="Moral" value={morale} colorFn={barColor} />
          </div>
        </motion.div>

        {/* ──── Form & Recent Performance ──── */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.07 }}
          className="bg-zinc-900/50 border border-white/5 rounded-[2rem] p-6">
          <h2 className="text-sm font-black uppercase tracking-widest text-white/40 mb-4">Form & Performans</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="px-3 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-center">
              <div className={`text-[22px] font-black ${cap99(formRating) >= 70 ? 'text-emerald-400' : 'text-red-400'}`}>
                {cap99(formRating)}%
              </div>
              <div className="text-[8px] font-bold uppercase tracking-[0.15em] text-white/25 mt-0.5">Form</div>
            </div>
            <div className="px-3 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-center">
              <div className="text-[22px] font-black text-amber-400">
                {lastMatchRating != null ? lastMatchRating.toFixed(1) : '—'}
              </div>
              <div className="text-[8px] font-bold uppercase tracking-[0.15em] text-white/25 mt-0.5">Son Maç RT</div>
            </div>
            <div className="px-3 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-center">
              <div className="text-[22px] font-black text-white/90">{player.goals ?? 0}</div>
              <div className="text-[8px] font-bold uppercase tracking-[0.15em] text-white/25 mt-0.5">Gol</div>
            </div>
            <div className="px-3 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-center">
              <div className="text-[22px] font-black text-white/90">{player.assists ?? 0}</div>
              <div className="text-[8px] font-bold uppercase tracking-[0.15em] text-white/25 mt-0.5">Asist</div>
            </div>
          </div>
        </motion.div>

        {/* ──── Injury Status ──── */}
        {isInjured && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
            className="bg-red-500/[0.06] border border-red-500/20 rounded-[2rem] p-6">
            <div className="flex items-center gap-3 mb-3">
              <HeartPulse size={18} className="text-red-400 animate-pulse" />
              <h2 className="text-sm font-black uppercase tracking-widest text-red-400">Sakatlık Durumu</h2>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-red-300 uppercase tracking-wider">Sakat</span>
                {injurySeverity && (
                  <span className={`px-1.5 py-px rounded-sm text-[7px] font-black uppercase tracking-wider ${
                    injurySeverity === 'light' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                    : injurySeverity === 'medium' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                    : 'bg-red-500/20 text-red-400 border border-red-500/30'
                  }`}>
                    {injurySeverity === 'light' ? 'Hafif' : injurySeverity === 'medium' ? 'Orta' : 'Ağır'}
                  </span>
                )}
              </div>
              {injuryEndDate && (
                <div className="flex items-center justify-between">
                  <span className="text-[9px] text-white/40">Tahmini İyileşme</span>
                  <span className="text-[10px] font-bold text-red-300/80">
                    {new Date(injuryEndDate).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })}
                  </span>
                </div>
              )}
              {injuryData?.remaining_days !== undefined && injuryData.remaining_days !== null && (
                <div className="flex items-center justify-between">
                  <span className="text-[9px] text-white/40">Kalan Gün</span>
                  <span className="text-[10px] font-bold text-red-300/80">{injuryData.remaining_days} gün</span>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* ──── Basic Stats (original compact view) ──── */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-zinc-900/50 border border-white/5 rounded-[2rem] p-6">
          <h2 className="text-sm font-black uppercase tracking-widest text-white/40 mb-4">Özet İstatistikler</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {statRows.map((stat, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                <span className="text-[10px] font-bold text-white/40">{stat.label}</span>
                <span className={`text-sm font-black font-mono ${fmStatColor(stat.value)}`}>{Math.round(stat.value)}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ──── Extended Attributes ──── */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="bg-zinc-900/50 border border-white/5 rounded-[2rem] p-6">
          <h2 className="text-sm font-black uppercase tracking-widest text-white/40 mb-4">Detaylı Özellikler</h2>
          <div className={`grid gap-2 ${isGK ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'}`}>
            {/* Technical / GK Column */}
            <AttrColumn
              title={isGK ? 'Kalecilik' : 'Teknik'}
              icon={<Target size={10} className="text-cyan-400/70" />}
              stats={technicalStats}
            />
            {/* Mental Column */}
            <AttrColumn
              title="Zihinsel"
              icon={<Activity size={10} className="text-purple-400/70" />}
              stats={mentalStats}
            />
            {/* Physical Column */}
            <AttrColumn
              title="Fiziksel"
              icon={<Footprints size={10} className="text-red-400/70" />}
              stats={physicalStats}
            />
            {/* GK-specific column (if GK) */}
            {isGK && gkStats.length > 0 && (
              <AttrColumn
                title="Kaleci Detay"
                icon={<Shield size={10} className="text-[#7AB4E8]/70" />}
                stats={gkStats}
              />
            )}
          </div>
        </motion.div>

        {/* ──── All Detailed Stats as Bars ──── */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-zinc-900/50 border border-white/5 rounded-[2rem] p-6">
          <h2 className="text-sm font-black uppercase tracking-widest text-white/40 mb-4">Tüm Özellikler</h2>
          <div className="space-y-1 max-h-96 overflow-y-auto pr-1 custom-scrollbar">
            {[
              ...technicalStats.map(s => ({ ...s, group: isGK ? 'Kalecilik' : 'Teknik' })),
              ...mentalStats.map(s => ({ ...s, group: 'Zihinsel' })),
              ...physicalStats.map(s => ({ ...s, group: 'Fiziksel' })),
              ...(isGK ? gkStats.map(s => ({ ...s, group: 'Kaleci Detay' })) : []),
            ].map((s, idx) => (
              <div key={`${s.group}-${s.label}`} className="flex items-center gap-3 py-[2px]">
                <span className="w-[100px] shrink-0 text-[9px] font-medium text-white/40">{s.label}</span>
                <div className="flex-1 h-[5px] bg-white/[0.03] rounded-sm overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(s.val / 99) * 100}%` }}
                    transition={{ duration: 0.6, ease: 'easeOut', delay: idx * 0.02 }}
                    className={`h-full rounded-sm ${
                      s.val >= 80 ? 'bg-green-500' :
                      s.val >= 65 ? 'bg-emerald-500' :
                      s.val >= 50 ? 'bg-yellow-500' :
                      s.val >= 35 ? 'bg-orange-500' : 'bg-red-500'
                    }`}
                    style={{ opacity: 0.8 }}
                  />
                </div>
                <span className={`w-7 text-right text-[10px] font-mono font-bold ${fmStatColor(s.val)}`}>{Math.round(s.val)}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ──── Play Style ──── */}
        {playStyle && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }}
            className="bg-zinc-900/50 border border-white/5 rounded-[2rem] p-6">
            <h2 className="text-sm font-black uppercase tracking-widest text-white/40 mb-4">Oyun Stili</h2>
            <div className="flex items-center gap-3 px-3 py-2.5 bg-white/[0.03] border border-white/[0.06] rounded-xl">
              <Zap size={16} className="text-amber-400" />
              <div>
                <div className="text-[11px] font-black text-white/80 uppercase tracking-wider">{toTitleCase(playStyle)}</div>
                {archetype && (
                  <div className="text-[9px] text-white/30 mt-0.5">Arketip: {toTitleCase(archetype)}</div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* ──── Traits & Personality ──── */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="bg-zinc-900/50 border border-white/5 rounded-[2rem] p-6">
          <h2 className="text-sm font-black uppercase tracking-widest text-white/40 mb-4">Yetenekler & Kişilik</h2>

          {traits.length === 0 && negTraits.length === 0 && personalityTraits.length === 0 ? (
            <div className="py-8 flex flex-col items-center justify-center border border-dashed border-white/5 rounded-2xl bg-white/[0.02]">
              <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mb-3">
                <Zap size={20} className="text-white/20" />
              </div>
              <p className="text-[10px] text-white/20 font-bold uppercase tracking-widest text-center">Özel Yetenek Bulunmuyor</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Positive Traits */}
              {traits.length > 0 && (
                <div>
                  <div className="text-[8px] font-black uppercase tracking-[0.2em] text-white/25 mb-2">Yetenekler</div>
                  <div className="flex flex-wrap gap-1.5">
                    {traits.map((tk: string, idx: number) => {
                      const levelKey = traitLevels?.[tk] || 'BEYAZ';
                      const levelInfo = (TRAIT_LEVELS as any)[levelKey] || TRAIT_LEVELS.BEYAZ;
                      const t = traitDescriptions[tk] || { name: tk, short: 'Özel yetenek.', type: 'pozitif' };
                      return (
                        <motion.div
                          key={idx}
                          whileHover={{ scale: 1.05 }}
                          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-extrabold shadow-lg ${levelInfo.color} cursor-default group relative`}
                        >
                          <span className="filter drop-shadow-sm">{levelInfo.icon}</span>
                          <span className="tracking-tight">{t.name}</span>
                          {/* Tooltip */}
                          <div className="absolute top-full left-0 mt-3 w-56 p-3 bg-zinc-950 border border-white/20 rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all text-[10px] font-medium text-white/70 z-[500] pointer-events-none shadow-2xl backdrop-blur-xl">
                            <p className="font-black text-white uppercase tracking-tighter text-xs mb-1">{t.name}</p>
                            <p className="text-white/50 leading-relaxed">{t.short}</p>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Negative Traits */}
              {negTraits.length > 0 && (
                <div>
                  <div className="text-[8px] font-black uppercase tracking-[0.2em] text-white/25 mb-2">Negatif Özellikler</div>
                  <div className="flex flex-wrap gap-1.5">
                    {negTraits.map((nt: string, idx: number) => {
                      const t = traitDescriptions[nt] || { name: nt, short: 'Negatif özellik.', type: 'negatif' };
                      return (
                        <motion.div
                          key={`neg-${idx}`}
                          whileHover={{ scale: 1.05 }}
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-red-500/30 bg-red-500/10 text-red-100 text-[10px] font-black shadow-lg cursor-default"
                        >
                          <span>🚩</span>
                          <span className="tracking-tight">{t.name}</span>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Personality Traits */}
              {personalityTraits.length > 0 && (
                <div>
                  <div className="text-[8px] font-black uppercase tracking-[0.2em] text-white/25 mb-2">Kişilik Özellikleri</div>
                  <div className="flex flex-wrap gap-2">
                    {personalityTraits.map((ptr: string, pidx: number) => {
                      const info = traitDescriptions[ptr] || { name: ptr, type: 'pozitif' };
                      const isNeg = info.type === 'negatif';
                      return (
                        <motion.div
                          key={`ptr-${pidx}`}
                          whileHover={{ scale: 1.05 }}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[10px] font-black shadow-xl cursor-default transition-all ${
                            isNeg
                            ? 'border-red-500/40 bg-red-500/10 text-red-200'
                            : 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200'
                          }`}
                        >
                          <span className="text-[12px]">{isNeg ? '🚩' : '💠'}</span>
                          <span className="tracking-tight uppercase">{info.name}</span>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </motion.div>

        {/* ──── Contract Info ──── */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="bg-zinc-900/50 border border-white/5 rounded-[2rem] p-6">
          <h2 className="text-sm font-black uppercase tracking-widest text-white/40 mb-4">Sözleşme Bilgileri</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="px-3 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-center">
              <DollarSign size={14} className="text-cyan-400 mx-auto mb-1" />
              <div className="text-sm font-black text-cyan-400">{fmtMoney(player.salary || 0)}</div>
              <div className="text-[8px] font-bold uppercase tracking-[0.15em] text-white/25 mt-0.5">Haftalık Maaş</div>
            </div>
            <div className="px-3 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-center">
              <Timer size={14} className="text-amber-400 mx-auto mb-1" />
              <div className="text-sm font-black text-amber-400">
                {player.contract_weeks_remaining != null ? `${player.contract_weeks_remaining} hf` : '—'}
              </div>
              <div className="text-[8px] font-bold uppercase tracking-[0.15em] text-white/25 mt-0.5">Kalan Hafta</div>
            </div>
            <div className="px-3 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-center">
              <TrendingUp size={14} className="text-emerald-400 mx-auto mb-1" />
              <div className="text-sm font-black text-emerald-400">{fmtVal(player.market_value || 0)}</div>
              <div className="text-[8px] font-bold uppercase tracking-[0.15em] text-white/25 mt-0.5">Piyasa Değeri</div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ──── Custom scrollbar styling ──── */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255,255,255,0.02);
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.08);
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255,255,255,0.15);
        }
      `}</style>
    </div>
  );
}
