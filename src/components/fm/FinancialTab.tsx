'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Cell } from 'recharts';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Trophy,
  Tv,
  Building2,
  Users,
  Briefcase,
  Wallet,
  CreditCard,
  Ticket,
  ShoppingBag,
  Zap,
  GraduationCap,
  UserCheck,
  Truck,
  ShieldCheck,
  Handshake,
  X,
  Check,
  Clock,
  BarChart3,
  PieChart,
  Repeat,
} from 'lucide-react';
import {
  type FinancialOverview,
  type RevenueBreakdown,
  type ExpenseBreakdown,
  type Sponsor,
  type BroadcastDeal,
  type FinancialHealthStatus,
  generateSponsorOffer,
  checkFinancialHealth,
  buildFinancialOverview,
  calculateWeeklyRevenue,
  calculateWeeklyExpenses,
  FINANCIAL_DEFAULTS,
} from '@/lib/fm/financialModel';
import type { Profile, Player } from '@/lib/fm/types';

// ─── Props ──────────────────────────────────────────────────────────

interface FinancialTabProps {
  profile: Profile;
  squad: Player[];
  leaguePosition?: number;
  leagueTier?: number;
  lastMatchAttendance?: number;
  isHomeLastMatch?: boolean;
  onAcceptSponsor?: (sponsor: Sponsor) => void;
  onUpdateProfile?: (updates: Partial<Profile>) => void;
}

// ─── Helpers ────────────────────────────────────────────────────────

function fmtMoney(n: number): string {
  if (Math.abs(n) >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M €`;
  if (Math.abs(n) >= 1_000) return `${(n / 1_000).toFixed(0)}K €`;
  return `${n.toLocaleString('tr-TR')} €`;
}

function fmtMoneyFull(n: number): string {
  return `${n.toLocaleString('tr-TR')} €`;
}

function healthConfig(status: FinancialHealthStatus) {
  switch (status) {
    case 'healthy':
      return {
        color: 'text-emerald-400',
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/20',
        bar: 'bg-emerald-500',
        label: 'SAĞLIKLI',
        glow: 'shadow-[0_0_30px_rgba(16,185,129,0.06)]',
      };
    case 'warning':
      return {
        color: 'text-amber-400',
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/20',
        bar: 'bg-amber-500',
        label: 'UYARI',
        glow: 'shadow-[0_0_30px_rgba(245,158,11,0.06)]',
      };
    case 'critical':
      return {
        color: 'text-red-400',
        bg: 'bg-red-500/10',
        border: 'border-red-500/20',
        bar: 'bg-red-500',
        label: 'KRİTİK',
        glow: 'shadow-[0_0_30px_rgba(239,68,68,0.08)]',
      };
    case 'bankrupt':
      return {
        color: 'text-red-500',
        bg: 'bg-red-600/20',
        border: 'border-red-500/40',
        bar: 'bg-red-600',
        label: 'İFLAS',
        glow: 'shadow-[0_0_40px_rgba(239,68,68,0.15)] animate-pulse',
      };
  }
}

function sponsorTypeLabel(type: Sponsor['type']): string {
  switch (type) {
    case 'kit': return 'Forma';
    case 'shirt': return 'Göğüs Reklamı';
    case 'stadium': return 'Stadyum';
    case 'training_ground': return 'Tesis';
  }
}

function sponsorTypeColor(type: Sponsor['type']): string {
  switch (type) {
    case 'kit': return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
    case 'shirt': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
    case 'stadium': return 'text-purple-400 bg-purple-500/10 border-purple-500/20';
    case 'training_ground': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
  }
}

function sponsorTypeIcon(type: Sponsor['type']) {
  switch (type) {
    case 'kit': return ShoppingBag;
    case 'shirt': return Briefcase;
    case 'stadium': return Building2;
    case 'training_ground': return Zap;
  }
}

// ─── Sub-components ─────────────────────────────────────────────────

function RevenueBar({ label, icon: Icon, amount, color }: {
  label: string;
  icon: React.ElementType;
  amount: number;
  color: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-2 group">
      <div className="flex items-center gap-2 min-w-0">
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 bg-white/[0.03] border border-white/[0.06] group-hover:border-white/10 transition-colors`}>
          <Icon size={12} className={color} />
        </div>
        <span className="text-[11px] font-bold text-white/50 truncate">{label}</span>
      </div>
      <span className={`text-xs font-black font-mono ${color} shrink-0`}>
        {fmtMoney(amount)}
      </span>
    </div>
  );
}

function ExpenseBar({ label, icon: Icon, amount }: {
  label: string;
  icon: React.ElementType;
  amount: number;
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-2 group">
      <div className="flex items-center gap-2 min-w-0">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 bg-white/[0.03] border border-white/[0.06] group-hover:border-white/10 transition-colors">
          <Icon size={12} className="text-red-400/70" />
        </div>
        <span className="text-[11px] font-bold text-white/50 truncate">{label}</span>
      </div>
      <span className="text-xs font-black font-mono text-red-400 shrink-0">
        -{fmtMoney(amount)}
      </span>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────

export default function FinancialTab({
  profile,
  squad,
  leaguePosition = 10,
  leagueTier = 1,
  lastMatchAttendance,
  isHomeLastMatch = false,
  onAcceptSponsor,
  onUpdateProfile,
}: FinancialTabProps) {
  const [activeSection, setActiveSection] = useState<'overview' | 'revenue' | 'expenses' | 'sponsors' | 'ffp' | 'pnl'>('overview');
  const [sponsorOffer, setSponsorOffer] = useState<Sponsor | null>(null);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [negotiating, setNegotiating] = useState<string | null>(null);
  const [customOffer, setCustomOffer] = useState<number>(0);

  // ── Gerçek finansal model hesaplaması ────────────────────────────
  const fin = useMemo(() => buildFinancialOverview(profile, squad, {
    isHome: isHomeLastMatch,
    lastMatchAttendance,
    leaguePosition,
    tier: leagueTier,
  }), [profile, squad, isHomeLastMatch, lastMatchAttendance, leaguePosition, leagueTier]);

  const { healthStatus } = fin;
  const hc = healthConfig(healthStatus);

  // Gerçek haftalık gelir/gider breakdown (financialModel'den)
  const revenueBreakdown = useMemo(
    () => calculateWeeklyRevenue(profile, lastMatchAttendance, isHomeLastMatch, leaguePosition, leagueTier),
    [profile, lastMatchAttendance, isHomeLastMatch, leaguePosition, leagueTier]
  );

  const expenseBreakdown = useMemo(
    () => calculateWeeklyExpenses(squad, profile.stadium_upgrades, profile.academy_level, leagueTier),
    [squad, profile, leagueTier]
  );

  // ── Pozisyon grubuna göre maaş dağılımı ────────────────────────────
  const salaryByPosition = useMemo(() => {
    const groups: Record<string, { label: string; salary: number; count: number; color: string }> = {
      GK:  { label: 'Kaleci',   salary: 0, count: 0, color: '#f59e0b' },
      DEF: { label: 'Defans',   salary: 0, count: 0, color: '#3b82f6' },
      MID: { label: 'Orta Saha', salary: 0, count: 0, color: '#8b5cf6' },
      FWD: { label: 'Forvet',   salary: 0, count: 0, color: '#ef4444' },
    };
    for (const p of squad || []) {
      const pos = (p.position as string) || 'MID';
      if (groups[pos]) {
        groups[pos].salary += (p.salary as number) || 0;
        groups[pos].count += 1;
      }
    }
    return (['GK', 'DEF', 'MID', 'FWD'] as const).map(key => ({
      position: groups[key].label,
      salary: groups[key].salary,
      count: groups[key].count,
      color: groups[key].color,
    }));
  }, [squad]);

  const money = profile.money ?? 0;
  const sponsors = (profile.sponsors ?? []) as unknown as Sponsor[];
  const weeklyRevenue = fin.weeklyRevenue;
  const weeklyExpenses = fin.weeklyExpenses;
  const weeklyProfit = fin.weeklyProfit;
  const monthlyProfit = fin.monthlyProfit;
  const wageUtilization = fin.wageUtilization;
  const wageBillLimit = fin.wageBillLimit;

  const weeklyBurn = weeklyProfit < 0 ? Math.abs(weeklyProfit) : 0;
  const weeksRunway = weeklyBurn > 0 ? Math.floor(money / weeklyBurn) : Infinity;

  const maxBarValue = Math.max(weeklyRevenue, weeklyExpenses, 1);
  const revenuePct = (weeklyRevenue / maxBarValue) * 100;
  const expensePct = (weeklyExpenses / maxBarValue) * 100;

  const handleGenerateOffer = () => {
    const rep = Math.min(100, Math.max(20, 30 + (20 - Math.min(leaguePosition, 20)) * 3));
    const offer = generateSponsorOffer(leaguePosition, rep, profile.stadium_capacity ?? 5000);
    setSponsorOffer(offer);
    setShowOfferModal(true);
  };
  const handleAcceptOffer = () => {
    if (sponsorOffer) { onAcceptSponsor?.(sponsorOffer); setShowOfferModal(false); setSponsorOffer(null); }
  };
  const handleRejectOffer = () => { setShowOfferModal(false); setSponsorOffer(null); };

  return (
    <div className="space-y-6">
      {/* ── Section Tabs — mobilde yatay scroll + touch target 44px ── */}
      <div className="flex gap-1 bg-white/[0.02] border border-white/[0.06] rounded-xl p-1 overflow-x-auto no-scrollbar">
        {([
          { id: 'overview' as const, label: 'Genel Bakış', icon: BarChart3 },
          { id: 'revenue' as const, label: 'Gelirler', icon: TrendingUp },
          { id: 'expenses' as const, label: 'Giderler', icon: TrendingDown },
          { id: 'sponsors' as const, label: 'Sponsorlar', icon: Handshake },
          { id: 'ffp' as const, label: 'FFP', icon: ShieldCheck },
          { id: 'pnl' as const, label: 'P&L', icon: PieChart },
        ]).map((tab) => {
          const isActive = activeSection === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id)}
              className={`
                flex items-center gap-1.5 px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest
                transition-all flex-1 justify-center whitespace-nowrap min-w-fit touch-target-44 mobile-tap-highlight
                ${isActive
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'text-white/30 hover:text-white/50 border border-transparent'
                }
              `}
            >
              <tab.icon size={12} />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── İFLAS UYARI BANNER'I ── */}
      {healthStatus === 'bankrupt' && (
        <div className="border border-red-500/40 bg-red-500/10 rounded-2xl p-4 mb-4">
          <p className="text-red-400 font-black text-sm uppercase tracking-wider">
            ⚠️ İFLAS — Haftalık ödeme yapılamıyor. En yüksek maaşlı oyuncu serbest bırakılacak.
          </p>
        </div>
      )}

      <AnimatePresence mode="wait">
        {/* ═══ OVERVIEW ═══ */}
        {activeSection === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {/* Financial Health Card */}
            <div className={`relative overflow-hidden rounded-2xl border p-3 sm:p-6 ${hc.glow}`} style={{ borderColor: 'var(--border-color, rgba(255,255,255,0.06))' }}>
              <div className={`absolute inset-0 border-2 rounded-2xl pointer-events-none ${hc.border} opacity-20`} />
              <div className="absolute -right-6 -top-6 opacity-[0.03]">
                <Wallet size={120} />
              </div>

              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 sm:gap-6">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center border ${hc.bg} ${hc.border} shrink-0`}>
                    <DollarSign size={24} className={hc.color} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 text-[10px] font-black uppercase tracking-widest border rounded-full ${hc.color} ${hc.bg} ${hc.border}`}>
                        {hc.label}
                      </span>
                      {healthStatus === 'bankrupt' && (
                        <AlertTriangle size={14} className="text-red-500 animate-pulse" />
                      )}
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-black font-mono tracking-tighter text-white truncate">
                      {fmtMoney(money)}
                    </h2>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-white/20 font-bold uppercase tracking-widest">Mevcut Bakiye</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 sm:gap-4">
                  {/* Weekly P/L */}
                  <div className="flex-1 text-center px-3 py-3 sm:px-6 sm:py-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      {weeklyProfit >= 0 ? (
                        <TrendingUp size={12} className="text-emerald-400" />
                      ) : (
                        <TrendingDown size={12} className="text-red-400" />
                      )}
                      <span className="text-[10px] font-bold uppercase tracking-widest text-white/30">
                        Haftalık
                      </span>
                    </div>
                    <div className={`text-base sm:text-xl font-black font-mono ${weeklyProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {weeklyProfit >= 0 ? '+' : ''}{fmtMoney(weeklyProfit)}
                    </div>
                  </div>

                  {/* Monthly P/L */}
                  <div className="flex-1 text-center px-3 py-3 sm:px-6 sm:py-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Repeat size={12} className="text-white/20" />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-white/30">
                        Aylık
                      </span>
                    </div>
                    <div className={`text-base sm:text-xl font-black font-mono ${monthlyProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {monthlyProfit >= 0 ? '+' : ''}{fmtMoney(monthlyProfit)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Wage Utilization Bar */}
              <div className="mt-5 pt-4 border-t border-white/[0.06]">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Users size={12} className="text-white/30" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/30">
                      Maaş Limiti Kullanımı
                    </span>
                  </div>
                  <span className={`text-xs font-black font-mono ${
                    wageUtilization > 90 ? 'text-red-400' : wageUtilization > 70 ? 'text-amber-400' : 'text-emerald-400'
                  }`}>
                    %{wageUtilization}
                  </span>
                </div>
                <div className="w-full h-2 bg-white/[0.04] rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full ${
                      wageUtilization > 90 ? 'bg-red-500' : wageUtilization > 70 ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    initial={{ width: 0 }}
                    animate={{ width: `${wageUtilization}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                  />
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-[10px] text-white/15">FFP Limiti: {fmtMoney(wageBillLimit)}/hafta</span>
                  {weeksRunway !== Infinity && weeklyBurn > 0 && (
                    <span className={`text-[10px] font-bold ${
                      weeksRunway < 3 ? 'text-red-400' : weeksRunway < 8 ? 'text-amber-400' : 'text-white/20'
                    }`}>
                      {weeksRunway} hafta bütçe kaldı
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
              {[
                { label: 'Haftalık Gelir', value: fmtMoney(weeklyRevenue), icon: TrendingUp, color: 'text-emerald-400' },
                { label: 'Haftalık Gider', value: fmtMoney(weeklyExpenses), icon: TrendingDown, color: 'text-red-400' },
                { label: 'Aktif Sponsor', value: sponsors.length.toString(), icon: Handshake, color: 'text-amber-400' },
                { label: 'Kadro', value: squad.length.toString(), icon: Users, color: 'text-blue-400' },
              ].map((stat, i) => (
                <div key={i} className="rounded-xl border border-white/[0.06] bg-white/[0.01] p-3 sm:p-4 group hover:bg-white/[0.02] transition-colors">
                  <div className="flex items-center gap-2 mb-2">
                    <stat.icon size={12} className={`${stat.color} opacity-60`} />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-white/25 truncate">{stat.label}</span>
                  </div>
                  <div className={`text-base sm:text-lg font-black font-mono ${stat.color} truncate`}>{stat.value}</div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ═══ REVENUE ═══ */}
        {activeSection === 'revenue' && (
          <motion.div
            key="revenue"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {/* Gerçek gelir dağılımı */}
            {revenueBreakdown && (['matchday', 'commercial', 'broadcast', 'prize'] as const).map(cat => {
              const catSources = revenueBreakdown[cat] ?? [];
              if (catSources.length === 0) return null;
              const catTotal = catSources.reduce((s: number, r: any) => s + r.amount, 0);
              const catLabel: Record<string, string> = { matchday: 'Maç Günü', commercial: 'Ticari', broadcast: 'Yayın', prize: 'Ödül' };
              const catColor: Record<string, string> = { matchday: 'text-emerald-400', commercial: 'text-amber-400', broadcast: 'text-blue-400', prize: 'text-purple-400' };
              const catIcon: Record<string, React.ElementType> = { matchday: Ticket, commercial: Handshake, broadcast: Tv, prize: Trophy };
              const Icon = catIcon[cat] ?? DollarSign;
              return (
                <div key={cat} className="rounded-2xl border border-white/[0.06] bg-white/[0.01] p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Icon size={13} className={catColor[cat]} />
                      <span className="text-[10px] font-black uppercase tracking-widest text-white/40">{catLabel[cat]} Gelirleri</span>
                    </div>
                    <span className={`text-sm font-black font-mono ${catColor[cat]}`}>{fmtMoney(catTotal)}</span>
                  </div>
                  <div className="space-y-1">
                    {catSources.map((src: any) => (
                      <div key={src.id} className="group">
                        <div className="flex items-center justify-between py-1.5">
                          <span className="text-[11px] text-white/50 font-medium">{src.name}</span>
                          <span className={`text-[11px] font-black font-mono ${catColor[cat]}`}>{fmtMoney(src.amount)}</span>
                        </div>
                        {src.calculation && (
                          <p className="text-[10px] text-white/20 pb-1 leading-relaxed">{src.calculation}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            {/* Dağılım çubuğu */}
            {revenueBreakdown && weeklyRevenue > 0 && (
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.01] p-4">
                <div className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-3">Haftalık Gelir Dağılımı — {fmtMoney(weeklyRevenue)}</div>
                <div className="w-full h-3 bg-white/[0.04] rounded-full overflow-hidden flex">
                  {(['matchday', 'commercial', 'broadcast', 'prize'] as const).map((cat, i) => {
                    const total = (revenueBreakdown[cat] ?? []).reduce((s: number, r: any) => s + r.amount, 0);
                    const pct = (total / weeklyRevenue) * 100;
                    const colors = ['bg-emerald-500', 'bg-amber-500', 'bg-blue-500', 'bg-purple-500'];
                    return <div key={cat} className={`h-full ${colors[i]}`} style={{ width: `${pct}%` }} />;
                  })}
                </div>
                <div className="flex items-center gap-4 mt-2 flex-wrap">
                  {[
                    { label: 'Maç Günü', color: 'bg-emerald-500' },
                    { label: 'Ticari', color: 'bg-amber-500' },
                    { label: 'Yayın', color: 'bg-blue-500' },
                    { label: 'Ödül', color: 'bg-purple-500' },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-1.5">
                      <div className={`w-2 h-2 rounded-full ${item.color}`} />
                      <span className="text-[10px] font-bold text-white/25 uppercase tracking-widest">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Stadyum özeti */}
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.01] p-4">
              <div className="flex items-center gap-2 mb-3">
                <Building2 size={12} className="text-white/30" />
                <span className="text-[10px] font-black uppercase tracking-widest text-white/30">Stadyum</span>
              </div>
              <div className="grid grid-cols-3 gap-2 sm:gap-4">
                <div>
                  <span className="text-[10px] text-white/15 font-bold uppercase tracking-widest">Kapasite</span>
                  <p className="text-sm font-black text-white/60">{(profile.stadium_capacity ?? 5000).toLocaleString('tr-TR')}</p>
                </div>
                <div>
                  <span className="text-[10px] text-white/15 font-bold uppercase tracking-widest">Bilet Fiyatı</span>
                  <p className="text-sm font-black text-white/60">{fmtMoneyFull(profile.ticket_price ?? 50)}</p>
                </div>
                <div>
                  <span className="text-[10px] text-white/15 font-bold uppercase tracking-widest">İtibar</span>
                  <p className="text-sm font-black text-white/60">{profile.reputation ?? 50}/100</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ═══ EXPENSES ═══ */}
        {activeSection === 'expenses' && (
          <motion.div
            key="expenses"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {expenseBreakdown && (['wages', 'facility', 'operation', 'agent'] as const).map(cat => {
              const catItems = expenseBreakdown[cat] ?? [];
              if (catItems.length === 0) return null;
              const catTotal = catItems.reduce((s: number, e: any) => s + e.amount, 0);
              const catLabel: Record<string, string> = { wages: 'Maaşlar', facility: 'Tesis Bakım', operation: 'Operasyonel', agent: 'Komisyonlar' };
              const catIcon: Record<string, React.ElementType> = { wages: Users, facility: Building2, operation: Truck, agent: Briefcase };
              const Icon = catIcon[cat] ?? DollarSign;
              return (
                <div key={cat} className="rounded-2xl border border-white/[0.06] bg-white/[0.01] p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Icon size={13} className="text-red-400/70" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-white/40">{catLabel[cat]}</span>
                    </div>
                    <span className="text-sm font-black font-mono text-red-400">-{fmtMoney(catTotal)}</span>
                  </div>
                  <div className="space-y-1">
                    {catItems.map((exp: any) => (
                      <div key={exp.id} className="flex items-center justify-between py-1.5 border-b border-white/[0.03] last:border-0">
                        <span className="text-[11px] text-white/50 font-medium">{exp.name}</span>
                        <span className="text-[11px] font-black font-mono text-red-400">-{fmtMoney(exp.amount)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            {/* Gider dağılım çubuğu */}
            {expenseBreakdown && weeklyExpenses > 0 && (
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.01] p-4">
                <div className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-3">Toplam Haftalık Gider — {fmtMoney(weeklyExpenses)}</div>
                <div className="w-full h-3 bg-white/[0.04] rounded-full overflow-hidden flex">
                  {(['wages', 'facility', 'operation', 'agent'] as const).map((cat, i) => {
                    const total = (expenseBreakdown[cat] ?? []).reduce((s: number, e: any) => s + e.amount, 0);
                    const colors = ['bg-red-600', 'bg-red-400', 'bg-orange-500', 'bg-rose-400'];
                    return <div key={cat} className={`h-full ${colors[i]}`} style={{ width: `${(total / weeklyExpenses) * 100}%` }} />;
                  })}
                </div>
                <div className="flex items-center gap-4 mt-2 flex-wrap">
                  {[
                    { label: 'Maaşlar', color: 'bg-red-600' },
                    { label: 'Tesis', color: 'bg-red-400' },
                    { label: 'Operasyon', color: 'bg-orange-500' },
                    { label: 'Komisyon', color: 'bg-rose-400' },
                  ].map(item => (
                    <div key={item.label} className="flex items-center gap-1.5">
                      <div className={`w-2 h-2 rounded-full ${item.color}`} />
                      <span className="text-[10px] font-bold text-white/25 uppercase tracking-widest">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* ═══ SPONSORS ═══ */}
        {activeSection === 'sponsors' && (
          <motion.div
            key="sponsors"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {/* Active Sponsors */}
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.01] p-4 sm:p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Handshake size={14} className="text-amber-400" />
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-white/30">Aktif Sponsorlar</h3>
                </div>
                <button
                  onClick={handleGenerateOffer}
                  disabled={sponsors.length >= FINANCIAL_DEFAULTS.maxSponsors}
                  className="px-3 sm:px-4 py-2 text-[10px] font-black uppercase tracking-widest bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-lg hover:bg-amber-500/20 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1.5 whitespace-nowrap"
                >
                  <Zap size={10} />
                  <span className="hidden sm:inline">Yeni Sponsor Teklifleri</span>
                  <span className="sm:hidden">Yeni Teklif</span>
                </button>
              </div>

              {sponsors.length === 0 ? (
                <div className="flex items-center justify-center py-12 text-white/20">
                  <Handshake size={24} className="mr-3 opacity-30" />
                  <span className="text-xs font-bold uppercase tracking-widest">Aktif sponsor yok</span>
                </div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {sponsors.map((sp) => {
                    const SpIcon = sponsorTypeIcon(sp.type);
                    const weeksLeft = Math.ceil(sp.weeksRemaining / 7);
                    return (
                      <div key={sp.id} className="flex items-center justify-between gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl border border-white/[0.06] bg-white/[0.01] hover:bg-white/[0.02] transition-colors">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/[0.04] flex items-center justify-center shrink-0 border border-white/[0.08]">
                            <SpIcon size={16} className="text-white/50" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-white/80 truncate">{sp.name}</span>
                              <span className={`px-1.5 py-0.5 text-[10px] font-black uppercase tracking-widest border rounded-full shrink-0 ${sponsorTypeColor(sp.type)}`}>
                                {sponsorTypeLabel(sp.type)}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[10px] text-white/20">
                                <Clock size={8} className="inline mr-0.5" />
                                {weeksLeft} hafta kaldı
                              </span>
                              <span className="text-[10px] text-white/10">•</span>
                              <span className="text-[10px] text-white/20">
                                {'★'.repeat(sp.prestige)}{'☆'.repeat(5 - sp.prestige)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="text-xs font-black font-mono text-emerald-400">{fmtMoney(sp.weeklyPayout)}</div>
                          <div className="text-[10px] text-white/15 font-bold uppercase">/ hafta</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {sponsors.length >= FINANCIAL_DEFAULTS.maxSponsors && (
                <div className="mt-3 flex items-center gap-2 px-1">
                  <AlertTriangle size={10} className="text-amber-400/50" />
                  <span className="text-[10px] text-amber-400/50 font-bold">
                    Maksimum sponsor sayısına ulaştınız ({FINANCIAL_DEFAULTS.maxSponsors})
                  </span>
                </div>
              )}
            </div>

            {/* Sponsor Offer Modal */}
            <AnimatePresence>
              {showOfferModal && sponsorOffer && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-2 sm:p-4"
                  onClick={handleRejectOffer}
                >
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-[#0d1117] border border-amber-500/20 rounded-none sm:rounded-2xl p-4 sm:p-6 max-w-md w-full mx-2 sm:mx-4 shadow-[0_0_40px_rgba(245,158,11,0.08)] max-h-[95vh] overflow-y-auto"
                  >
                    <div className="flex items-center justify-between mb-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                          <Handshake size={20} className="text-amber-400" />
                        </div>
                        <div>
                          <h3 className="text-sm font-black uppercase tracking-tight text-white">Sponsor Teklifi</h3>
                          <span className={`px-1.5 py-0.5 text-[10px] font-black uppercase tracking-widest border rounded-full ${sponsorTypeColor(sponsorOffer.type)}`}>
                            {sponsorTypeLabel(sponsorOffer.type)}
                          </span>
                        </div>
                      </div>
                      <button onClick={handleRejectOffer} className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
                        <X size={14} className="text-white/40" />
                      </button>
                    </div>

                    <div className="space-y-3 mb-5">
                      <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                        <span className="text-[10px] font-bold text-white/40">Sponsor</span>
                        <span className="text-sm font-bold text-white">{sponsorOffer.name}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                        <span className="text-[10px] font-bold text-white/40">Yıllık Değer</span>
                        <span className="text-sm font-black font-mono text-amber-400">{fmtMoney(sponsorOffer.annualValue)}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                        <span className="text-[10px] font-bold text-white/40">Haftalık Ödeme</span>
                        <span className="text-sm font-black font-mono text-emerald-400">{fmtMoney(sponsorOffer.weeklyPayout)}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                        <span className="text-[10px] font-bold text-white/40">Süre</span>
                        <span className="text-sm font-bold text-white">{Math.ceil(sponsorOffer.durationWeeks / 7)} hafta</span>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                        <span className="text-[10px] font-bold text-white/40">Prestij</span>
                        <span className="text-sm text-amber-400">{'★'.repeat(sponsorOffer.prestige)}{'☆'.repeat(5 - sponsorOffer.prestige)}</span>
                      </div>
                    </div>

                    {sponsorOffer.bonusConditions.length > 0 && (
                      <div className="mb-5 p-3 rounded-xl bg-amber-500/5 border border-amber-500/10">
                        <span className="text-[10px] font-black uppercase tracking-widest text-amber-400/60 mb-2 block">Bonus Koşulları</span>
                        {sponsorOffer.bonusConditions.map((bc, i) => (
                          <div key={i} className="flex items-center justify-between text-[10px] py-1">
                            <span className="text-white/40">
                              {bc.type === 'league_position' ? `Lig ${bc.threshold}. sıra` : `Hasılat ${bc.threshold.toLocaleString()}`}
                            </span>
                            <span className="font-mono font-bold text-amber-400">+{fmtMoney(bc.bonus)}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {(sponsorOffer as any)?.bonusCondition && (
                      <p className="text-[10px] text-amber-400/60 mt-2">
                        Bonus: {(sponsorOffer as any).bonusCondition} → +{((sponsorOffer as any).bonusAmount || 0).toLocaleString('tr-TR')}€
                      </p>
                    )}

                    {negotiating === (sponsorOffer as any)?.id ? (
                      <div className="space-y-2 mt-3">
                        <p className="text-[10px] text-white/40">Haftalık teklifiniz (min: {Math.round(((sponsorOffer as any)?.weeklyPayout || 0) * 0.7).toLocaleString('tr-TR')}€)</p>
                        <input
                          type="number"
                          value={customOffer}
                          onChange={e => {
                            const min = Math.round(((sponsorOffer as any)?.weeklyPayout || 0) * 0.7);
                            const max = Math.round(((sponsorOffer as any)?.weeklyPayout || 0) * 1.3);
                            setCustomOffer(Math.min(max, Math.max(min, Number(e.target.value) || 0)));
                          }}
                          className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-[11px] text-white"
                        />
                        <div className="flex gap-2">
                          <button onClick={() => {
                            const modifiedOffer = { ...sponsorOffer, weeklyPayout: customOffer };
                            onAcceptSponsor?.(modifiedOffer as any);
                            setShowOfferModal(false);
                            setSponsorOffer(null);
                            setNegotiating(null);
                          }} className="flex-1 py-1.5 bg-emerald-500/20 border border-emerald-500/30 rounded-lg text-emerald-400 text-[10px] font-black">
                            Anlaş
                          </button>
                          <button onClick={() => setNegotiating(null)}
                            className="px-3 py-1.5 border border-white/10 rounded-lg text-white/30 text-[10px]">
                            İptal
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-2 mt-3">
                        <button onClick={handleAcceptOffer}
                          className="flex-1 py-2 bg-emerald-500/20 border border-emerald-500/30 rounded-lg text-emerald-400 text-[10px] font-black">
                          Kabul Et
                        </button>
                        <button onClick={() => {
                          setNegotiating((sponsorOffer as any)?.id || 'default');
                          setCustomOffer((sponsorOffer as any)?.weeklyPayout || 0);
                        }}
                          className="px-3 py-2 border border-white/10 rounded-lg text-white/40 hover:text-white text-[10px]">
                          Pazarlık
                        </button>
                        <button onClick={handleRejectOffer}
                          className="px-3 py-2 border border-white/10 rounded-lg text-red-400/50 hover:text-red-400 text-[10px]">
                          Reddet
                        </button>
                      </div>
                    )}
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* ═══ FFP / ÜCRET TAVANI ═══ */}
        {activeSection === 'ffp' && (
          <motion.div
            key="ffp"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {/* FFP Durum Kartı */}
            <div className={`rounded-2xl border p-5 ${hc.bg} ${hc.border}`}>
              <div className="flex items-center gap-3 mb-4">
                <ShieldCheck size={20} className={hc.color} />
                <div>
                  <div className={`text-xs font-black uppercase tracking-widest ${hc.color}`}>FFP Durumu: {hc.label}</div>
                  <div className="text-[10px] text-white/30">Finansal Fair Play — UEFA standartları</div>
                </div>
              </div>

              {/* Ücret Tavanı */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-white/40 font-bold uppercase tracking-wider">Maaş Tavanı Kullanımı</span>
                  <span className={`font-black tabular-nums ${wageUtilization > 90 ? 'text-red-400' : wageUtilization > 75 ? 'text-amber-400' : 'text-emerald-400'}`}>
                    %{wageUtilization}
                  </span>
                </div>
                <div className="w-full h-3 bg-white/[0.04] rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full ${wageUtilization > 90 ? 'bg-red-500' : wageUtilization > 75 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, wageUtilization)}%` }}
                    transition={{ duration: 0.8 }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-white/20">
                  <span>Haftalık maaş: <span className="text-white/50 font-black">{fmtMoney(fin.totalWages)}</span></span>
                  <span>Tavan: <span className="text-white/50 font-black">{fmtMoney(wageBillLimit)}</span></span>
                </div>
              </div>

              {/* Haftalık Maaş Detayı */}
              {(() => {
                const weeklyWages = (squad || []).reduce((s, p) => s + ((p.salary as number) || 0), 0);
                const wageLimit = wageBillLimit || Math.round(((fin.weeklyRevenue || 0) * 52 * 0.70) / 52);
                const wageUtilPct = wageLimit > 0 ? Math.min(100, Math.round((weeklyWages / wageLimit) * 100)) : 0;
                return (
                  <div className="mt-4 space-y-2 border-t border-white/5 pt-4">
                    <div className="flex justify-between">
                      <span className="text-[10px] text-white/40">Haftalık Maaş Faturası</span>
                      <span className="text-[10px] font-black text-white">{fmtMoney(weeklyWages)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[10px] text-white/40">FFP Limiti (Gelirin %70'i)</span>
                      <span className="text-[10px] text-white/50">{fmtMoney(wageLimit)}</span>
                    </div>
                    <div className="space-y-1">
                      <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            wageUtilPct > 90 ? 'bg-red-500' :
                            wageUtilPct > 70 ? 'bg-amber-500' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${wageUtilPct}%` }}
                        />
                      </div>
                      <div className="flex justify-between">
                        <span className={`text-[10px] font-black ${
                          wageUtilPct > 90 ? 'text-red-400' :
                          wageUtilPct > 70 ? 'text-amber-400' : 'text-emerald-400'
                        }`}>%{wageUtilPct} kullanım</span>
                        <span className="text-[10px] text-white/25">
                          {fmtMoney(Math.max(0, wageLimit - weeklyWages))} kapasite kaldı
                        </span>
                      </div>
                    </div>
                    {wageUtilPct > 90 && (
                      <p className="text-[10px] text-red-400 bg-red-500/10 border border-red-500/20 rounded px-2 py-1">
                        FFP ihlali riski — oyuncu satmayı veya maaş indirmeyi düşünün
                      </p>
                    )}
                    {wageUtilPct > 0 && wageUtilPct <= 50 && (
                      <p className="text-[10px] text-emerald-400/50 text-center">
                        Finansal sağlık iyi — {fmtMoney(Math.max(0, wageLimit - weeklyWages))} transfer kapasitesi mevcut
                      </p>
                    )}
                  </div>
                );
              })()}
            </div>

            {/* ── Haftalık Maaş Dağılımı ── */}
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.01] p-4 sm:p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <BarChart3 size={14} className="text-white/30" />
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-white/30">Haftalık Maaş Dağılımı</h3>
                </div>
                <div className="flex items-center gap-3 flex-wrap justify-end">
                  <span className="text-[10px] text-white/20">
                    Toplam: <span className="text-white/50 font-black font-mono">{fmtMoney(fin.totalWages)}</span>
                  </span>
                  {wageUtilization > 90 && (
                    <span className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest border rounded-full text-red-400 bg-red-500/10 border-red-500/20 animate-pulse">
                      <AlertTriangle size={8} />
                      FFP Aşılıyor
                    </span>
                  )}
                </div>
              </div>

              {/* Bar Chart */}
              <div className="w-full h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={salaryByPosition} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                    <XAxis
                      dataKey="position"
                      tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.4)' }}
                      axisLine={{ stroke: 'rgba(255,255,255,0.06)' }}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 9, fill: 'rgba(255,255,255,0.3)' }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v: number) => fmtMoney(v)}
                      width={65}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1a1f2e',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '10px',
                        fontSize: '11px',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
                      }}
                      labelStyle={{ color: 'rgba(255,255,255,0.6)', fontWeight: 700, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}
                      formatter={(value: number, name: string) => [fmtMoney(value), 'Haftalık Maaş']}
                      cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                    />
                    <ReferenceLine
                      y={wageBillLimit}
                      stroke={wageUtilization > 90 ? '#ef4444' : wageUtilization > 75 ? '#f59e0b' : '#10b981'}
                      strokeDasharray="6 4"
                      strokeWidth={1.5}
                      label={{
                        value: `FFP Tavanı (${fmtMoney(wageBillLimit)})`,
                        position: 'right',
                        fill: wageUtilization > 90 ? '#ef4444' : wageUtilization > 75 ? '#f59e0b' : '#10b981',
                        fontSize: 9,
                        fontWeight: 700,
                      }}
                    />
                    <Bar dataKey="salary" radius={[4, 4, 0, 0]} maxBarSize={56}>
                      {salaryByPosition.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.8} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Position Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2 mt-4">
                {salaryByPosition.map((pos) => (
                  <div key={pos.position} className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-2.5 text-center">
                    <div
                      className="w-2 h-2 rounded-full mx-auto mb-1.5"
                      style={{ backgroundColor: pos.color }}
                    />
                    <div className="text-[10px] text-white/25 font-bold uppercase tracking-widest mb-0.5">{pos.position}</div>
                    <div className="text-[11px] font-black font-mono" style={{ color: pos.color }}>{fmtMoney(pos.salary)}</div>
                    <div className="text-[10px] text-white/15 mt-0.5">{pos.count} oyuncu</div>
                  </div>
                ))}
              </div>

              {/* FFP Cap vs Current */}
              <div className="mt-4 pt-3 border-t border-white/[0.06]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-white/25">Maaş vs FFP Tavanı</span>
                  <span className={`text-[10px] font-black font-mono ${
                    wageUtilization > 90 ? 'text-red-400' : wageUtilization > 75 ? 'text-amber-400' : 'text-emerald-400'
                  }`}>
                    {wageUtilization > 100 ? '⚠ AŞILIYOR' : `%${wageUtilization} kullanım`}
                  </span>
                </div>
                <div className="w-full h-3 bg-white/[0.04] rounded-full overflow-hidden relative">
                  {/* FFP limit marker */}
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-white/30 z-10"
                    style={{ left: '100%' }}
                  />
                  <motion.div
                    className={`h-full rounded-full ${
                      wageUtilization > 100 ? 'bg-red-500' :
                      wageUtilization > 90 ? 'bg-red-500' :
                      wageUtilization > 75 ? 'bg-amber-500' :
                      'bg-emerald-500'
                    }`}
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, wageUtilization)}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                  />
                </div>
                <div className="flex items-center justify-between mt-1.5">
                  <span className="text-[10px] text-white/15">
                    Maaş: <span className="text-white/40 font-bold font-mono">{fmtMoney(fin.totalWages)}</span>
                  </span>
                  <span className="text-[10px] text-white/15">
                    Tavan: <span className="text-white/40 font-bold font-mono">{fmtMoney(wageBillLimit)}</span>
                  </span>
                </div>
                {wageUtilization > 90 && (
                  <div className="mt-2 flex items-start gap-1.5 px-2 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20">
                    <AlertTriangle size={10} className="text-red-400 shrink-0 mt-0.5" />
                    <span className="text-[10px] text-red-400 font-medium leading-relaxed">
                      Toplam maaşlar FFP tavanını {wageUtilization > 100 ? 'aşıyor' : 'tehdit ediyor'}.
                      {wageUtilization > 100 ? ' Acil maaş düşürme veya oyuncu satışı gerekli.' : ' Oyuncu satışı veya maaş indirimini değerlendirin.'}
                    </span>
                  </div>
                )}
                {wageUtilization > 0 && wageUtilization <= 70 && (
                  <div className="mt-2 text-[10px] text-emerald-400/50 text-center">
                    FFP uyumlu — {fmtMoney(Math.max(0, wageBillLimit - fin.totalWages))} transfer bütçesi mevcut
                  </div>
                )}
              </div>
            </div>

            {/* Sezon P&L Tahmini */}
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.01] p-4 sm:p-5">
              <div className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-4">Sezon Tahmini (42 Hafta)</div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
                {[
                  { label: 'Toplam Gelir', value: fin.seasonRevenue, color: 'text-emerald-400' },
                  { label: 'Toplam Gider', value: fin.seasonExpenses, color: 'text-red-400' },
                  { label: 'Net Kâr/Zarar', value: fin.seasonProfit, color: fin.seasonProfit >= 0 ? 'text-emerald-400' : 'text-red-400' },
                ].map(({ label, value, color }) => (
                  <div key={label} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 text-center">
                    <div className={`text-base font-black font-mono ${color}`}>{fmtMoney(value)}</div>
                    <div className="text-[10px] text-white/20 uppercase tracking-widest mt-1">{label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bütçe Pisti */}
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.01] p-4 sm:p-5">
              <div className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-4">Kasadaki Para</div>
              <div className="flex flex-col sm:flex-row sm:items-end gap-2 sm:gap-4">
                <div className="text-2xl sm:text-3xl font-black font-mono text-white">{fmtMoney(money)}</div>
                {weeklyBurn > 0 && (
                  <div className="pb-1">
                    <div className="text-[10px] text-white/25">
                      {weeksRunway === Infinity ? '∞' : `${weeksRunway} hafta`} pist kaldı
                    </div>
                    <div className={`text-[10px] font-black ${weeksRunway < 4 ? 'text-red-400' : weeksRunway < 8 ? 'text-amber-400' : 'text-white/30'}`}>
                      Haftalık kayıp: {fmtMoney(weeklyBurn)}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}


        {/* ═══ P&L CHART ═══ */}
        {activeSection === 'pnl' && (
          <motion.div
            key="pnl"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.01] p-4 sm:p-5">
              <div className="flex items-center gap-2 mb-4 sm:mb-6">
                <PieChart size={14} className="text-white/30" />
                <h3 className="text-[10px] font-black uppercase tracking-widest text-white/30">Haftalık Gelir vs Gider</h3>
              </div>

              {/* Bar Chart */}
              <div className="space-y-6">
                {/* Revenue Bar */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <TrendingUp size={12} className="text-emerald-400" />
                      <span className="text-[10px] font-bold text-white/40">Gelir</span>
                    </div>
                    <span className="text-xs font-black font-mono text-emerald-400">{fmtMoney(weeklyRevenue)}</span>
                  </div>
                  <div className="w-full h-8 bg-white/[0.04] rounded-lg overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-lg flex items-center justify-end pr-3"
                      initial={{ width: 0 }}
                      animate={{ width: `${revenuePct}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                    >
                      <span className="text-[10px] font-black text-white/80">{revenuePct > 15 ? fmtMoney(weeklyRevenue) : ''}</span>
                    </motion.div>
                  </div>
                </div>

                {/* Expense Bar */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <TrendingDown size={12} className="text-red-400" />
                      <span className="text-[10px] font-bold text-white/40">Gider</span>
                    </div>
                    <span className="text-xs font-black font-mono text-red-400">{fmtMoney(weeklyExpenses)}</span>
                  </div>
                  <div className="w-full h-8 bg-white/[0.04] rounded-lg overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-red-600 to-red-400 rounded-lg flex items-center justify-end pr-3"
                      initial={{ width: 0 }}
                      animate={{ width: `${expensePct}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
                    >
                      <span className="text-[10px] font-black text-white/80">{expensePct > 15 ? fmtMoney(weeklyExpenses) : ''}</span>
                    </motion.div>
                  </div>
                </div>

                {/* Net Profit Bar */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {weeklyProfit >= 0 ? (
                        <TrendingUp size={12} className="text-emerald-400" />
                      ) : (
                        <TrendingDown size={12} className="text-red-400" />
                      )}
                      <span className="text-[10px] font-bold text-white/40">Net Kâr / Zarar</span>
                    </div>
                    <span className={`text-xs font-black font-mono ${weeklyProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {weeklyProfit >= 0 ? '+' : ''}{fmtMoney(weeklyProfit)}
                    </span>
                  </div>
                  <div className="w-full h-10 bg-white/[0.04] rounded-lg overflow-hidden relative">
                    <motion.div
                      className={`absolute top-0 h-full rounded-lg ${
                        weeklyProfit >= 0
                          ? 'bg-gradient-to-r from-emerald-700 to-emerald-500'
                          : 'bg-gradient-to-r from-red-700 to-red-500'
                      }`}
                      style={{ left: weeklyProfit >= 0 ? '50%' : undefined, right: weeklyProfit < 0 ? '50%' : undefined }}
                      initial={{ width: 0 }}
                      animate={{
                        width: `${Math.min(50, Math.abs(weeklyProfit / maxBarValue) * 50)}%`,
                      }}
                      transition={{ duration: 0.8, ease: 'easeOut', delay: 0.4 }}
                    />
                    {/* Center line */}
                    <div className="absolute top-0 bottom-0 left-1/2 w-px bg-white/10" />
                  </div>
                </div>
              </div>

              {/* Summary Stats */}
              <div className="mt-6 pt-4 border-t border-white/[0.06] grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {[
                  { label: 'Haftalık Kâr', value: weeklyProfit, format: (v: number) => `${v >= 0 ? '+' : ''}${fmtMoney(v)}`, color: weeklyProfit >= 0 ? 'text-emerald-400' : 'text-red-400' },
                  { label: 'Aylık Kâr', value: monthlyProfit, format: (v: number) => `${v >= 0 ? '+' : ''}${fmtMoney(v)}`, color: monthlyProfit >= 0 ? 'text-emerald-400' : 'text-red-400' },
                  { label: 'Sezon Tahmini', value: weeklyProfit * 42, format: (v: number) => `${v >= 0 ? '+' : ''}${fmtMoney(v)}`, color: (weeklyProfit * 42) >= 0 ? 'text-emerald-400' : 'text-red-400' },
                  { label: 'Gider/Gelir Oranı', value: weeklyRevenue > 0 ? weeklyExpenses / weeklyRevenue : 0, format: (v: number) => `%${(v * 100).toFixed(0)}`, color: (weeklyRevenue > 0 ? weeklyExpenses / weeklyRevenue : 0) > 1 ? 'text-red-400' : 'text-emerald-400' },
                ].map((stat, i) => (
                  <div key={i} className="text-center">
                    <span className="text-[10px] text-white/15 font-bold uppercase tracking-widest block mb-1">{stat.label}</span>
                    <span className={`text-sm font-black font-mono ${stat.color}`}>{stat.format(stat.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
