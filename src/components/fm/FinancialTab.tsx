'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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
  type Sponsor,
  type BroadcastDeal,
  type FinancialHealthStatus,
  calculateWeeklyRevenue,
  calculateWeeklyExpenses,
  generateSponsorOffer,
  checkFinancialHealth,
  FINANCIAL_DEFAULTS,
} from '@/lib/fm/financialModel';

// ─── Props ──────────────────────────────────────────────────────────

interface FinancialTabProps {
  money: number;
  weeklyRevenue: number;
  weeklyExpenses: number;
  sponsors: Sponsor[];
  broadcastDeal: BroadcastDeal | null;
  squadSize: number;
  stadiumCapacity: number;
  ticketPrice: number;
  leaguePosition: number;
  onAcceptSponsor: (sponsor: Sponsor) => void;
}

// ─── Helpers ────────────────────────────────────────────────────────

function fmtMoney(n: number): string {
  if (Math.abs(n) >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M Kredi`;
  if (Math.abs(n) >= 1_000) return `${(n / 1_000).toFixed(0)}K Kredi`;
  return `${n.toLocaleString('tr-TR')} Kredi`;
}

function fmtMoneyFull(n: number): string {
  return `${n.toLocaleString('tr-TR')} Kredi`;
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
  money,
  weeklyRevenue,
  weeklyExpenses,
  sponsors,
  broadcastDeal,
  squadSize,
  stadiumCapacity,
  ticketPrice,
  leaguePosition,
  onAcceptSponsor,
}: FinancialTabProps) {
  const [activeSection, setActiveSection] = useState<'overview' | 'revenue' | 'expenses' | 'sponsors' | 'broadcast' | 'pnl'>('overview');
  const [sponsorOffer, setSponsorOffer] = useState<Sponsor | null>(null);
  const [showOfferModal, setShowOfferModal] = useState(false);

  // Derived financial data
  const weeklyProfit = weeklyRevenue - weeklyExpenses;
  const monthlyRevenue = Math.round(weeklyRevenue * 4.33);
  const monthlyExpenses = Math.round(weeklyExpenses * 4.33);
  const monthlyProfit = monthlyRevenue - monthlyExpenses;

  // Wage estimation (assume 60-70% of expenses are wages)
  const estimatedWages = Math.round(weeklyExpenses * 0.65);
  const wageBillLimit = FINANCIAL_DEFAULTS.ffpWageRatio > 0
    ? Math.round((weeklyRevenue * 52 * FINANCIAL_DEFAULTS.ffpWageRatio) / 52)
    : 0;
  const wageUtilization = wageBillLimit > 0
    ? Math.min(100, Math.round((estimatedWages / wageBillLimit) * 100))
    : 0;

  // Estimated revenue breakdown
  const estimatedMatchdayRevenue = Math.round(stadiumCapacity * 0.7 * ticketPrice * 0.15); // per week average
  const estimatedSponsorRevenue = sponsors.reduce((s, sp) => s + sp.weeklyPayout, 0);
  const estimatedBroadcastRevenue = broadcastDeal?.weeklyPayout ?? 0;
  const estimatedOtherRevenue = Math.max(0, weeklyRevenue - estimatedMatchdayRevenue - estimatedSponsorRevenue - estimatedBroadcastRevenue);

  // Estimated expense breakdown
  const estimatedFacilityMaintenance = Math.round(weeklyExpenses * 0.1);
  const estimatedAcademyCosts = Math.round(weeklyExpenses * 0.06);
  const estimatedAgentFees = Math.round(weeklyExpenses * 0.03);
  const estimatedOtherExpenses = Math.max(0, weeklyExpenses - estimatedWages - estimatedFacilityMaintenance - estimatedAcademyCosts - estimatedAgentFees);

  // Financial health check
  const overview: FinancialOverview = {
    weeklyRevenue,
    weeklyExpenses,
    weeklyProfit,
    monthlyRevenue,
    monthlyExpenses,
    monthlyProfit,
    seasonRevenue: weeklyRevenue * 42,
    seasonExpenses: weeklyExpenses * 42,
    seasonProfit: (weeklyRevenue - weeklyExpenses) * 42,
    totalWages: estimatedWages,
    wageBillLimit,
    wageUtilization,
    sponsorCount: sponsors.length,
    sponsorRevenue: estimatedSponsorRevenue,
    matchdayRevenue: estimatedMatchdayRevenue,
    broadcastRevenue: estimatedBroadcastRevenue,
    transferRevenue: 0,
    transferSpending: 0,
  };

  const healthStatus = checkFinancialHealth(overview, money);
  const hc = healthConfig(healthStatus);

  // Weeks of runway
  const weeklyBurn = weeklyProfit < 0 ? Math.abs(weeklyProfit) : 0;
  const weeksRunway = weeklyBurn > 0 ? Math.floor(money / weeklyBurn) : Infinity;

  // Generate sponsor offer
  const handleGenerateOffer = () => {
    const reputation = Math.min(100, Math.max(20, 30 + (20 - Math.min(leaguePosition, 20)) * 3));
    const offer = generateSponsorOffer(leaguePosition, reputation, stadiumCapacity);
    setSponsorOffer(offer);
    setShowOfferModal(true);
  };

  const handleAcceptOffer = () => {
    if (sponsorOffer) {
      onAcceptSponsor(sponsorOffer);
      setShowOfferModal(false);
      setSponsorOffer(null);
    }
  };

  const handleRejectOffer = () => {
    setShowOfferModal(false);
    setSponsorOffer(null);
  };

  // Bar chart data for P&L
  const maxBarValue = Math.max(weeklyRevenue, weeklyExpenses, 1);
  const revenuePct = (weeklyRevenue / maxBarValue) * 100;
  const expensePct = (weeklyExpenses / maxBarValue) * 100;

  return (
    <div className="space-y-6">
      {/* ── Section Tabs ── */}
      <div className="flex gap-1 bg-white/[0.02] border border-white/[0.06] rounded-xl p-1 overflow-x-auto">
        {([
          { id: 'overview' as const, label: 'Genel Bakış', icon: BarChart3 },
          { id: 'revenue' as const, label: 'Gelirler', icon: TrendingUp },
          { id: 'expenses' as const, label: 'Giderler', icon: TrendingDown },
          { id: 'sponsors' as const, label: 'Sponsorlar', icon: Handshake },
          { id: 'broadcast' as const, label: 'Yayın', icon: Tv },
          { id: 'pnl' as const, label: 'P&L', icon: PieChart },
        ]).map((tab) => {
          const isActive = activeSection === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id)}
              className={`
                flex items-center gap-1.5 px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest
                transition-all flex-1 justify-center whitespace-nowrap min-w-fit
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
            <div className={`relative overflow-hidden rounded-2xl border p-6 ${hc.glow}`} style={{ borderColor: 'var(--border-color, rgba(255,255,255,0.06))' }}>
              <div className={`absolute inset-0 border-2 rounded-2xl pointer-events-none ${hc.border} opacity-20`} />
              <div className="absolute -right-6 -top-6 opacity-[0.03]">
                <Wallet size={120} />
              </div>

              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center border ${hc.bg} ${hc.border}`}>
                    <DollarSign size={32} className={hc.color} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 text-[8px] font-black uppercase tracking-widest border rounded-full ${hc.color} ${hc.bg} ${hc.border}`}>
                        {hc.label}
                      </span>
                      {healthStatus === 'bankrupt' && (
                        <AlertTriangle size={14} className="text-red-500 animate-pulse" />
                      )}
                    </div>
                    <h2 className="text-3xl font-black font-mono tracking-tighter text-white">
                      {fmtMoney(money)}
                    </h2>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[9px] text-white/20 font-bold uppercase tracking-widest">Mevcut Bakiye</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  {/* Weekly P/L */}
                  <div className="text-center px-6 py-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      {weeklyProfit >= 0 ? (
                        <TrendingUp size={12} className="text-emerald-400" />
                      ) : (
                        <TrendingDown size={12} className="text-red-400" />
                      )}
                      <span className="text-[9px] font-bold uppercase tracking-widest text-white/30">
                        Haftalık
                      </span>
                    </div>
                    <div className={`text-xl font-black font-mono ${weeklyProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {weeklyProfit >= 0 ? '+' : ''}{fmtMoney(weeklyProfit)}
                    </div>
                  </div>

                  {/* Monthly P/L */}
                  <div className="text-center px-6 py-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Repeat size={12} className="text-white/20" />
                      <span className="text-[9px] font-bold uppercase tracking-widest text-white/30">
                        Aylık
                      </span>
                    </div>
                    <div className={`text-xl font-black font-mono ${monthlyProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
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
                  <span className="text-[8px] text-white/15">FFP Limiti: {fmtMoney(wageBillLimit)}/hafta</span>
                  {weeksRunway !== Infinity && weeklyBurn > 0 && (
                    <span className={`text-[8px] font-bold ${
                      weeksRunway < 3 ? 'text-red-400' : weeksRunway < 8 ? 'text-amber-400' : 'text-white/20'
                    }`}>
                      {weeksRunway} hafta bütçe kaldı
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: 'Haftalık Gelir', value: fmtMoney(weeklyRevenue), icon: TrendingUp, color: 'text-emerald-400' },
                { label: 'Haftalık Gider', value: fmtMoney(weeklyExpenses), icon: TrendingDown, color: 'text-red-400' },
                { label: 'Aktif Sponsor', value: sponsors.length.toString(), icon: Handshake, color: 'text-amber-400' },
                { label: 'Kadro', value: squadSize.toString(), icon: Users, color: 'text-blue-400' },
              ].map((stat, i) => (
                <div key={i} className="rounded-xl border border-white/[0.06] bg-white/[0.01] p-4 group hover:bg-white/[0.02] transition-colors">
                  <div className="flex items-center gap-2 mb-2">
                    <stat.icon size={12} className={`${stat.color} opacity-60`} />
                    <span className="text-[9px] font-bold uppercase tracking-widest text-white/25">{stat.label}</span>
                  </div>
                  <div className={`text-lg font-black font-mono ${stat.color}`}>{stat.value}</div>
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
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.01] p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <TrendingUp size={14} className="text-emerald-400" />
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-white/30">Haftalık Gelir Dağılımı</h3>
                </div>
                <span className="text-lg font-black font-mono text-emerald-400">{fmtMoney(weeklyRevenue)}</span>
              </div>

              <div className="space-y-1">
                <RevenueBar label="Maç Günü Geliri (Bilet, VIP, Souvenir)" icon={Ticket} amount={estimatedMatchdayRevenue} color="text-emerald-400" />
                <RevenueBar label="Ticari Gelir (Sponsorlar)" icon={Handshake} amount={estimatedSponsorRevenue} color="text-amber-400" />
                <RevenueBar label="Yayın Geliri (TV)" icon={Tv} amount={estimatedBroadcastRevenue} color="text-blue-400" />
                <RevenueBar label="Diğer Gelirler" icon={DollarSign} amount={estimatedOtherRevenue} color="text-white/40" />
              </div>

              {/* Revenue Distribution Bar */}
              <div className="mt-4 pt-4 border-t border-white/[0.06]">
                <div className="w-full h-3 bg-white/[0.04] rounded-full overflow-hidden flex">
                  {weeklyRevenue > 0 && (
                    <>
                      <div className="h-full bg-emerald-500" style={{ width: `${(estimatedMatchdayRevenue / weeklyRevenue) * 100}%` }} />
                      <div className="h-full bg-amber-500" style={{ width: `${(estimatedSponsorRevenue / weeklyRevenue) * 100}%` }} />
                      <div className="h-full bg-blue-500" style={{ width: `${(estimatedBroadcastRevenue / weeklyRevenue) * 100}%` }} />
                      <div className="h-full bg-white/20" style={{ width: `${(estimatedOtherRevenue / weeklyRevenue) * 100}%` }} />
                    </>
                  )}
                </div>
                <div className="flex items-center gap-4 mt-2 flex-wrap">
                  {[
                    { label: 'Maç Günü', color: 'bg-emerald-500' },
                    { label: 'Ticari', color: 'bg-amber-500' },
                    { label: 'Yayın', color: 'bg-blue-500' },
                    { label: 'Diğer', color: 'bg-white/20' },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-1.5">
                      <div className={`w-2 h-2 rounded-full ${item.color}`} />
                      <span className="text-[8px] font-bold text-white/25 uppercase tracking-widest">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Stadium Info */}
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.01] p-4">
              <div className="flex items-center gap-2 mb-3">
                <Building2 size={12} className="text-white/30" />
                <span className="text-[10px] font-black uppercase tracking-widest text-white/30">Stadyum Bilgileri</span>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <span className="text-[8px] text-white/15 font-bold uppercase tracking-widest">Kapasite</span>
                  <p className="text-sm font-black text-white/60">{stadiumCapacity.toLocaleString('tr-TR')}</p>
                </div>
                <div>
                  <span className="text-[8px] text-white/15 font-bold uppercase tracking-widest">Bilet Fiyatı</span>
                  <p className="text-sm font-black text-white/60">{fmtMoneyFull(ticketPrice)}</p>
                </div>
                <div>
                  <span className="text-[8px] text-white/15 font-bold uppercase tracking-widest">Tahmini Doluluk</span>
                  <p className="text-sm font-black text-white/60">%70</p>
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
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.01] p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <TrendingDown size={14} className="text-red-400" />
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-white/30">Haftalık Gider Dağılımı</h3>
                </div>
                <span className="text-lg font-black font-mono text-red-400">{fmtMoney(weeklyExpenses)}</span>
              </div>

              <div className="space-y-1">
                <ExpenseBar label={`Oyuncu Maaşları (${squadSize} oyuncu)`} icon={Users} amount={estimatedWages} />
                <ExpenseBar label="Tesis Bakım (Stadyum, Antrenman, Tıbbi)" icon={Building2} amount={estimatedFacilityMaintenance} />
                <ExpenseBar label="Akademi ve Altyapı Giderleri" icon={GraduationCap} amount={estimatedAcademyCosts} />
                <ExpenseBar label="Menajer Komisyonları ve Agent Ücretleri" icon={Briefcase} amount={estimatedAgentFees} />
                <ExpenseBar label="Personel, Seyahat, Güvenlik, Sigorta" icon={Truck} amount={estimatedOtherExpenses} />
              </div>

              {/* Expense Distribution Bar */}
              <div className="mt-4 pt-4 border-t border-white/[0.06]">
                <div className="w-full h-3 bg-white/[0.04] rounded-full overflow-hidden flex">
                  {weeklyExpenses > 0 && (
                    <>
                      <div className="h-full bg-red-600" style={{ width: `${(estimatedWages / weeklyExpenses) * 100}%` }} />
                      <div className="h-full bg-red-400" style={{ width: `${(estimatedFacilityMaintenance / weeklyExpenses) * 100}%` }} />
                      <div className="h-full bg-orange-500" style={{ width: `${(estimatedAcademyCosts / weeklyExpenses) * 100}%` }} />
                      <div className="h-full bg-rose-400" style={{ width: `${(estimatedAgentFees / weeklyExpenses) * 100}%` }} />
                      <div className="h-full bg-white/20" style={{ width: `${(estimatedOtherExpenses / weeklyExpenses) * 100}%` }} />
                    </>
                  )}
                </div>
                <div className="flex items-center gap-4 mt-2 flex-wrap">
                  {[
                    { label: 'Maaşlar', color: 'bg-red-600' },
                    { label: 'Tesis', color: 'bg-red-400' },
                    { label: 'Akademi', color: 'bg-orange-500' },
                    { label: 'Komisyon', color: 'bg-rose-400' },
                    { label: 'Diğer', color: 'bg-white/20' },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-1.5">
                      <div className={`w-2 h-2 rounded-full ${item.color}`} />
                      <span className="text-[8px] font-bold text-white/25 uppercase tracking-widest">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
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
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.01] p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Handshake size={14} className="text-amber-400" />
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-white/30">Aktif Sponsorlar</h3>
                </div>
                <button
                  onClick={handleGenerateOffer}
                  disabled={sponsors.length >= FINANCIAL_DEFAULTS.maxSponsors}
                  className="px-4 py-2 text-[9px] font-black uppercase tracking-widest bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-lg hover:bg-amber-500/20 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1.5"
                >
                  <Zap size={10} />
                  Yeni Sponsor Teklifleri
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
                      <div key={sp.id} className="flex items-center justify-between gap-4 p-4 rounded-xl border border-white/[0.06] bg-white/[0.01] hover:bg-white/[0.02] transition-colors">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-white/[0.04] flex items-center justify-center shrink-0 border border-white/[0.08]">
                            <SpIcon size={18} className="text-white/50" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-white/80 truncate">{sp.name}</span>
                              <span className={`px-1.5 py-0.5 text-[7px] font-black uppercase tracking-widest border rounded-full shrink-0 ${sponsorTypeColor(sp.type)}`}>
                                {sponsorTypeLabel(sp.type)}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[9px] text-white/20">
                                <Clock size={8} className="inline mr-0.5" />
                                {weeksLeft} hafta kaldı
                              </span>
                              <span className="text-[9px] text-white/10">•</span>
                              <span className="text-[9px] text-white/20">
                                {'★'.repeat(sp.prestige)}{'☆'.repeat(5 - sp.prestige)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="text-xs font-black font-mono text-emerald-400">{fmtMoney(sp.weeklyPayout)}</div>
                          <div className="text-[8px] text-white/15 font-bold uppercase">/ hafta</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {sponsors.length >= FINANCIAL_DEFAULTS.maxSponsors && (
                <div className="mt-3 flex items-center gap-2 px-1">
                  <AlertTriangle size={10} className="text-amber-400/50" />
                  <span className="text-[9px] text-amber-400/50 font-bold">
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
                  className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
                  onClick={handleRejectOffer}
                >
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-[#0d1117] border border-amber-500/20 rounded-2xl p-6 max-w-md w-full mx-4 shadow-[0_0_40px_rgba(245,158,11,0.08)]"
                  >
                    <div className="flex items-center justify-between mb-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                          <Handshake size={20} className="text-amber-400" />
                        </div>
                        <div>
                          <h3 className="text-sm font-black uppercase tracking-tight text-white">Sponsor Teklifi</h3>
                          <span className={`px-1.5 py-0.5 text-[7px] font-black uppercase tracking-widest border rounded-full ${sponsorTypeColor(sponsorOffer.type)}`}>
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
                        <span className="text-[9px] font-black uppercase tracking-widest text-amber-400/60 mb-2 block">Bonus Koşulları</span>
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

                    <div className="flex gap-3">
                      <button
                        onClick={handleRejectOffer}
                        className="flex-1 py-3 text-[10px] font-black uppercase tracking-widest bg-white/5 text-white/40 border border-white/10 rounded-xl hover:bg-white/10 transition-all"
                      >
                        Reddet
                      </button>
                      <button
                        onClick={handleAcceptOffer}
                        className="flex-1 py-3 text-[10px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl hover:bg-emerald-500/20 transition-all flex items-center justify-center gap-1.5"
                      >
                        <Check size={12} />
                        Kabul Et
                      </button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* ═══ BROADCAST ═══ */}
        {activeSection === 'broadcast' && (
          <motion.div
            key="broadcast"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {broadcastDeal ? (
              <div className="rounded-2xl border border-blue-500/10 bg-blue-500/[0.02] p-5">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                    <Tv size={24} className="text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-tight text-white">{broadcastDeal.name}</h3>
                    <span className="text-[9px] text-white/25 font-bold">
                      {Math.ceil(broadcastDeal.weeksRemaining / 7)} hafta kaldı
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-5">
                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                    <span className="text-[8px] text-white/15 font-bold uppercase tracking-widest">Yıllık Değer</span>
                    <p className="text-sm font-black font-mono text-blue-400 mt-1">{fmtMoney(broadcastDeal.annualValue)}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                    <span className="text-[8px] text-white/15 font-bold uppercase tracking-widest">Haftalık Ödeme</span>
                    <p className="text-sm font-black font-mono text-emerald-400 mt-1">{fmtMoney(broadcastDeal.weeklyPayout)}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                    <span className="text-[8px] text-white/15 font-bold uppercase tracking-widest">Maç Başına Bonus</span>
                    <p className="text-sm font-black font-mono text-amber-400 mt-1">{fmtMoney(broadcastDeal.perMatchBonus)}</p>
                  </div>
                </div>

                {/* Position Bonuses */}
                {broadcastDeal.positionBonuses.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Trophy size={12} className="text-amber-400/60" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-white/30">
                        Sıralama Bonusları
                      </span>
                    </div>
                    <div className="space-y-2">
                      {broadcastDeal.positionBonuses.map((pb, i) => {
                        const isQualified = leaguePosition <= pb.minPosition;
                        return (
                          <div
                            key={i}
                            className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                              isQualified
                                ? 'bg-amber-500/5 border-amber-500/15'
                                : 'bg-white/[0.01] border-white/[0.04]'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span className={`text-xs font-black font-mono ${
                                isQualified ? 'text-amber-400' : 'text-white/20'
                              }`}>
                                {pb.minPosition}. sıra
                              </span>
                              {isQualified && <Check size={10} className="text-emerald-400" />}
                            </div>
                            <span className={`text-xs font-black font-mono ${
                              isQualified ? 'text-amber-400' : 'text-white/15'
                            }`}>
                              {fmtMoney(pb.bonus)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                    <p className="text-[8px] text-white/15 mt-2">
                      Mevcut lig pozisyonunuz: {leaguePosition}. sıra
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center py-16 text-white/20 rounded-2xl border border-white/[0.06] bg-white/[0.01]">
                <Tv size={32} className="mr-3 opacity-30" />
                <span className="text-sm font-bold uppercase tracking-widest">Aktif yayın anlaşması yok</span>
              </div>
            )}
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
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.01] p-5">
              <div className="flex items-center gap-2 mb-6">
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
                      <span className="text-[9px] font-black text-white/80">{revenuePct > 15 ? fmtMoney(weeklyRevenue) : ''}</span>
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
                      <span className="text-[9px] font-black text-white/80">{expensePct > 15 ? fmtMoney(weeklyExpenses) : ''}</span>
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
              <div className="mt-6 pt-4 border-t border-white/[0.06] grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Haftalık Kâr', value: weeklyProfit, format: (v: number) => `${v >= 0 ? '+' : ''}${fmtMoney(v)}`, color: weeklyProfit >= 0 ? 'text-emerald-400' : 'text-red-400' },
                  { label: 'Aylık Kâr', value: monthlyProfit, format: (v: number) => `${v >= 0 ? '+' : ''}${fmtMoney(v)}`, color: monthlyProfit >= 0 ? 'text-emerald-400' : 'text-red-400' },
                  { label: 'Sezon Tahmini', value: weeklyProfit * 42, format: (v: number) => `${v >= 0 ? '+' : ''}${fmtMoney(v)}`, color: (weeklyProfit * 42) >= 0 ? 'text-emerald-400' : 'text-red-400' },
                  { label: 'Gider/Gelir Oranı', value: weeklyRevenue > 0 ? weeklyExpenses / weeklyRevenue : 0, format: (v: number) => `%${(v * 100).toFixed(0)}`, color: (weeklyRevenue > 0 ? weeklyExpenses / weeklyRevenue : 0) > 1 ? 'text-red-400' : 'text-emerald-400' },
                ].map((stat, i) => (
                  <div key={i} className="text-center">
                    <span className="text-[8px] text-white/15 font-bold uppercase tracking-widest block mb-1">{stat.label}</span>
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
