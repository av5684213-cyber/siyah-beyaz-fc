'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShoppingBag, 
  Search, 
  Handshake, 
  AlertCircle,
  CheckCircle2,
  XCircle,
  Building2,
  Star,
  Users,
  Wallet,
  ChevronDown,
  ChevronUp,
  DollarSign,
  Timer,
  Trophy,
  Target,
  Footprints,
  Percent,
  FileText,
  Repeat,
  CircleDollarSign,
  TrendingUp,
  ShieldCheck
} from 'lucide-react';
import { useFM } from '@/lib/fm/GameContext';
import { Player, Sponsor } from '@/lib/fm/types';
import { formatCurrency } from '@/lib/fm/valuation';
import { toTitleCase } from '@/lib/fm/ui-helpers';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';

// ─── Suggested salary based on rating ───
function getSuggestedSalary(rating: number): number {
  if (rating >= 80) return 90000;
  if (rating >= 70) return 45000;
  return 22000;
}

function getSalaryRange(rating: number): { min: number; max: number } {
  if (rating >= 80) return { min: 60000, max: 120000 };
  if (rating >= 70) return { min: 30000, max: 60000 };
  return { min: 15000, max: 30000 };
}

export default function MarketTab() {
  const { league, profile, negotiatePurchase, addSponsor } = useFM();
  const [activeSubTab, setActiveSubTab] = useState<'transfers' | 'sponsors'>('transfers');
  const [searchTerm, setSearchTerm] = useState('');
  const [negotiatingPlayer, setNegotiatingPlayer] = useState<Player | null>(null);
  const [offerAmount, setOfferAmount] = useState<number>(0);
  const [negotiationResult, setNegotiationResult] = useState<{ success: boolean; message: string; counterOffer?: number } | null>(null);
  const [isNegotiating, setIsNegotiating] = useState(false);

  // ─── New negotiation state ───
  const [contractYears, setContractYears] = useState(3);
  const [weeklySalary, setWeeklySalary] = useState(0);
  const [isLoan, setIsLoan] = useState(false);
  const [loanFee, setLoanFee] = useState(2000000);
  const [hasBuyClause, setHasBuyClause] = useState(false);
  const [salaryPercentage, setSalaryPercentage] = useState(50);
  const [bonusesOpen, setBonusesOpen] = useState(false);
  const [goalBonus, setGoalBonus] = useState(10000);
  const [assistBonus, setAssistBonus] = useState(5000);
  const [appearanceBonus, setAppearanceBonus] = useState(3000);
  const [sellOnClause, setSellOnClause] = useState(0);

  // market_value null/0 için tahmini değer hesaplama
  const getEffectiveMarketValue = (player: Player) => {
    if (player.market_value && player.market_value > 0) return player.market_value;
    return Math.round(Math.pow(player.rating || 60, 2.5) * 5000);
  };

  // ── Fetch transfer market listings + free agents ──
  const [transferListings, setTransferListings] = useState<Player[]>([]);
  const [freeAgents, setFreeAgents] = useState<Player[]>([]);
  const [marketLoading, setMarketLoading] = useState(true);

  const fetchMarketPlayers = useCallback(async () => {
    if (!isSupabaseConfigured() || !profile) {
      setMarketLoading(false);
      return;
    }
    setMarketLoading(true);
    try {
      const supabase = getSupabase();
      if (!supabase) { setMarketLoading(false); return; }

      // 1. Fetch active transfer listings with player data
      const { data: listings, error: listingsError } = await supabase
        .from('transfer_market')
        .select('player_id, player_data, price, is_auction, expires_at, seller_id')
        .eq('is_active', true)
        .neq('seller_id', profile.id) // Don't show own listings
        .order('price', { ascending: true })
        .limit(50);

      if (!listingsError && listings) {
        const mapped = listings
          .filter((l: Record<string, unknown>) => l.player_data)
          .map((l: Record<string, unknown>) => {
            const pd = l.player_data as Record<string, unknown>;
            return {
              ...pd,
              id: l.player_id as string,
              market_value: l.price as number,
              is_for_sale: true,
              is_auction: l.is_auction as boolean,
              expires_at: l.expires_at as string,
              seller_id: l.seller_id as string,
            } as unknown as Player;
          });
        setTransferListings(mapped);
      }

      // 2. Fetch free agents (players with no team)
      const { data: agents, error: agentsError } = await supabase
        .from('players')
        .select('*')
        .is('profile_id', null)
        .eq('is_free_agent', true)
        .limit(30);

      if (!agentsError && agents) {
        const mapped = agents.map((p: Record<string, unknown>) => ({
          ...p,
          id: p.id as string,
          name: p.name as string,
          position: p.position as string,
          rating: (p.rating as number) ?? 60,
          potential: (p.potential as number) ?? (p.rating as number) ?? 70,
          age: p.age as number,
          market_value: (p.market_value as number) || Math.round(Math.pow((p.rating as number) || 60, 2.5) * 5000),
          is_free_agent: true,
          club: '',
          team_name: '',
        } as unknown as Player));
        setFreeAgents(mapped);
      }
    } catch (err) {
      console.error('[fetchMarketPlayers] Error:', err);
    } finally {
      setMarketLoading(false);
    }
  }, [profile]);

  useEffect(() => {
    fetchMarketPlayers();
  }, [fetchMarketPlayers]);

  // Combine transfer-listed + free agents, filter by search
  const availablePlayers = useMemo(() => {
    const myTeam = profile?.team_name || '';
    const combined = [...transferListings, ...freeAgents];

    // Deduplicate by player id
    const seen = new Set<string>();
    const unique = combined.filter(p => {
      if (!p || !p.id) return false;
      if (seen.has(p.id)) return false;
      seen.add(p.id);
      return true;
    });

    return unique.filter((p: Player) =>
      !p?.club?.includes(myTeam) &&
      !p?.team_name?.includes(myTeam) &&
      (p?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
    ).slice(0, 50);
  }, [transferListings, freeAgents, profile?.team_name, searchTerm]);

  const handleOpenNegotiation = (player: Player) => {
    setNegotiatingPlayer(player);
    const mv = getEffectiveMarketValue(player);
    setOfferAmount(mv);
    setContractYears(3);
    setWeeklySalary(getSuggestedSalary(player.rating));
    setIsLoan(false);
    setLoanFee(2000000);
    setHasBuyClause(false);
    setSalaryPercentage(50);
    setBonusesOpen(false);
    setGoalBonus(10000);
    setAssistBonus(5000);
    setAppearanceBonus(3000);
    setSellOnClause(0);
    setNegotiationResult(null);
    setIsNegotiating(false);
  };

  const handleNegotiate = async () => {
    if (!negotiatingPlayer || isNegotiating) return;
    setIsNegotiating(true);
    try {
      // For loan mode, the effective offer is the loan fee (or 0 if no buy clause)
      const effectiveOffer = isLoan ? loanFee : offerAmount;
      const res = await negotiatePurchase(negotiatingPlayer, effectiveOffer);
      setNegotiationResult({
        success: res.success,
        message: res.reason || (res.success ? 'Anlaşma sağlandı!' : 'Hata oluştu'),
        counterOffer: res.counterOffer
      });
      if (res.success) {
        setTimeout(() => {
          setNegotiatingPlayer(null);
          setIsNegotiating(false);
        }, 2000);
      }
    } catch (err: any) {
      console.error('[PIYASA HATASI]', err);
      setNegotiationResult({
        success: false,
        message: `Hata oluştu: ${err.message || 'Bilinmeyen hata'}`
      });
    } finally {
      setIsNegotiating(false);
    }
  };

  // ─── Cost calculations ───
  const totalSalaryCost = weeklySalary * 12 * contractYears;
  const effectiveOffer = isLoan ? loanFee : offerAmount;
  const totalCost = effectiveOffer + totalSalaryCost;
  const annualCost = weeklySalary * 12;
  const budget = profile?.money || 0;
  const budgetRemaining = budget - totalCost;

  // Mock sponsors
  const availableSponsors: Sponsor[] = [
    { id: 'sp1', name: 'Global Airlines', type: 'Main', weeklyPayment: 2500000, duration: 30, remainingDays: 30, bonus: { type: 'champion', amount: 10000000 } },
    { id: 'sp2', name: 'Tech Giant', type: 'Sleeve', weeklyPayment: 750000, duration: 30, remainingDays: 30 },
    { id: 'sp3', name: 'Arena X', type: 'Stadium', weeklyPayment: 1500000, duration: 60, remainingDays: 60 },
    { id: 'sp4', name: 'Local Bank', type: 'Global', weeklyPayment: 500000, duration: 15, remainingDays: 15 }
  ];

  return (
    <div className="space-y-6">
      {/* Header & Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10">
            <ShoppingBag className="text-white" size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white">YÖNETİM & TİCARET</h2>
            <p className="text-[10px] text-white/40 font-black uppercase tracking-widest">Transferler ve Sponsorluk Anlaşmaları</p>
          </div>
        </div>

        <div className="flex p-1 bg-white/5 rounded-xl border border-white/10">
          <button 
            onClick={() => setActiveSubTab('transfers')}
            className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeSubTab === 'transfers' ? 'bg-white text-black' : 'text-white/40 hover:text-white'}`}
          >
            Transfer Pazarı
          </button>
          <button 
            onClick={() => setActiveSubTab('sponsors')}
            className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeSubTab === 'sponsors' ? 'bg-white text-black' : 'text-white/40 hover:text-white'}`}
          >
            Sponsorluklar
          </button>
        </div>
      </div>

      {activeSubTab === 'transfers' ? (
        <div className="space-y-6">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
            <input 
              type="text" 
              placeholder="OYUNCU ARA..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-xs font-black uppercase tracking-widest focus:outline-none focus:border-white/30 transition-all"
            />
          </div>

          {/* Player Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {marketLoading ? (
              <div className="col-span-full flex flex-col items-center justify-center py-16 gap-3">
                <div className="w-8 h-8 border-2 border-white/10 border-t-emerald-500/40 rounded-full animate-spin" />
                <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest">Pazar Yükleniyor</p>
              </div>
            ) : availablePlayers.length === 0 ? (
              <div className="col-span-full flex flex-col items-center justify-center py-16 gap-3">
                <ShoppingBag className="w-10 h-10 text-white/10" />
                <p className="text-xs text-white/25 text-center">Transfer listesinde veya serbest oyuncu bulunmuyor</p>
                <p className="text-[9px] text-white/15 text-center">Sadece transfer listesine gönderilmiş oyuncular ve serbest oyuncular burada görünür</p>
              </div>
            ) : (
              availablePlayers.map((player: Player) => (
              <motion.div 
                key={player.id}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="fm-card p-5 group hover:border-white/20"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-sm font-black italic uppercase tracking-tighter text-white">{toTitleCase(player.name)}</h4>
                      {(player as Record<string, unknown>).is_free_agent ? (
                        <span className="px-1.5 py-0.5 bg-sky-500/15 border border-sky-500/30 text-sky-400 text-[7px] font-black uppercase tracking-widest rounded">SERBEST</span>
                      ) : (player as Record<string, unknown>).is_for_sale ? (
                        <span className="px-1.5 py-0.5 bg-amber-500/15 border border-amber-500/30 text-amber-400 text-[7px] font-black uppercase tracking-widest rounded">LİSTEDE</span>
                      ) : null}
                    </div>
                    <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">{player.position} • {player.age} YAŞ • {player.nation}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">{formatCurrency(getEffectiveMarketValue(player))}</p>
                    <p className="text-[9px] text-white/20 uppercase font-bold">Pazar Değeri</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 mb-4 text-center">
                  <div className="bg-white/5 p-2 rounded-lg">
                    <p className="text-[8px] text-white/30 uppercase font-black">Rating</p>
                    <p className="text-xs font-black text-white">{player.rating}</p>
                  </div>
                  <div className="bg-white/5 p-2 rounded-lg">
                    <p className="text-[8px] text-white/30 uppercase font-black">{player.position === 'GK' ? 'Klc' : 'Sav'}</p>
                    <p className="text-xs font-black text-white">{player.position === 'GK' ? (player.goalkeeping || 0) : (player.defending || 0)}</p>
                  </div>
                  <div className="bg-white/5 p-2 rounded-lg">
                    <p className="text-[8px] text-white/30 uppercase font-black">Pot.</p>
                    <p className="text-xs font-black text-emerald-500">{player.potential}</p>
                  </div>
                </div>

                <button 
                  onClick={() => handleOpenNegotiation(player)}
                  className="w-full py-3 bg-white/5 group-hover:bg-white group-hover:text-black rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                >
                  <Handshake size={14} /> GÖRÜŞMELERE BAŞLA
                </button>
              </motion.div>
            ))
            )}
          </div>
        </div>
      ) : activeSubTab === 'sponsors' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Active Sponsors */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-white/30 px-2">AKTİF ANLAŞMALAR</h3>
            {profile?.sponsors && profile.sponsors.length > 0 ? (
               profile.sponsors.map((s: Sponsor) => (
                 <div key={s.id} className="fm-card p-6 border-l-4 border-l-emerald-500">
                    <div className="flex justify-between items-center">
                       <div>
                          <p className="text-[10px] text-emerald-400 font-black uppercase tracking-widest mb-1">{s.type} SPONSOR</p>
                          <h4 className="text-lg font-black italic uppercase tracking-tighter text-white">{s.name}</h4>
                          <p className="text-xs text-white/40 font-bold uppercase tracking-widest">Kalan Süre: {s.remainingDays} Gün</p>
                       </div>
                       <div className="text-right">
                          <p className="text-xl font-black text-white italic">{formatCurrency(s.weeklyPayment)}</p>
                          <p className="text-[9px] text-white/20 font-black uppercase">HAFTALIK ÖDEME</p>
                       </div>
                    </div>
                 </div>
               ))
            ) : (
              <div className="fm-card p-10 text-center opacity-40 italic text-xs uppercase tracking-widest">Aktif sponsorunuz bulunmuyor.</div>
            )}
          </div>

          {/* Available Offers */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-white/30 px-2">YENİ TEKLİFLER</h3>
            {availableSponsors.filter(as => !profile?.sponsors?.some(ps => ps.id === as.id)).map((s) => (
               <div key={s.id} className="fm-card p-6 hover:bg-white/5 transition-all group">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                       <h4 className="text-lg font-black italic tracking-tighter text-white uppercase">{s.name}</h4>
                       <span className="text-[8px] bg-white text-black px-2 py-0.5 rounded font-black uppercase tracking-widest">{s.type}</span>
                    </div>
                    <Building2 className="text-white/10 group-hover:text-white/30 transition-colors" size={32} />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                       <p className="text-[8px] text-white/30 font-black uppercase mb-1">HAFTALIK</p>
                       <p className="text-sm font-black text-emerald-400">{formatCurrency(s.weeklyPayment)}</p>
                    </div>
                    <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                       <p className="text-[8px] text-white/30 font-black uppercase mb-1">SÜRE</p>
                       <p className="text-sm font-black text-white">{s.duration} GÜN</p>
                    </div>
                  </div>

                  <button 
                    onClick={() => addSponsor(s)}
                    disabled={profile?.sponsors?.some(ps => ps.type === s.type)}
                    className="w-full py-3 bg-white text-black rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-black"
                  >
                    {profile?.sponsors?.some(ps => ps.type === s.type) ? 'KONTENJAN DOLU' : 'SÖZLEŞMEYİ İMZALA'}
                  </button>
               </div>
            ))}
          </div>
        </div>
      ) : null}

      {/* ═══════════════════════════════════════════════════════ */}
      {/* ENHANCED Negotiation Modal                                */}
      {/* ═══════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {negotiatingPlayer && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setNegotiatingPlayer(null)}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-xl bg-zinc-900 border border-white/10 rounded-[40px] p-8 overflow-hidden shadow-2xl max-h-[92vh] overflow-y-auto"
            >
              {/* Player header */}
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-white border border-white/10">
                  <Users size={28} />
                </div>
                <div className="flex-1">
                   <h3 className="text-2xl font-black italic tracking-tighter text-white uppercase">{toTitleCase(negotiatingPlayer.name)}</h3>
                   <p className="text-[10px] text-white/40 font-black uppercase tracking-widest">
                     {negotiatingPlayer.position} • {negotiatingPlayer.age} YAŞ • {negotiatingPlayer.nation} • ⭐ {negotiatingPlayer.rating}
                   </p>
                </div>
                <div className="text-right">
                   <p className="text-sm font-black text-emerald-400 italic">{formatCurrency(getEffectiveMarketValue(negotiatingPlayer))}</p>
                   <p className="text-[9px] text-white/20 font-black uppercase">Pazar Değeri</p>
                </div>
              </div>

              {!negotiationResult ? (
                <div className="space-y-4">

                  {/* ─── Section 1: Transfer Fee / Loan Fee ─── */}
                  <div className="bg-white/5 p-5 rounded-2xl border border-white/5">
                    <div className="flex items-center gap-2 mb-4">
                      <CircleDollarSign size={14} className="text-emerald-400" />
                      <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400">
                        {isLoan ? 'Kiralık Bedeli' : 'Transfer Bedeli'}
                      </p>
                    </div>
                    <input 
                      type="number"
                      value={isLoan ? loanFee : offerAmount}
                      onChange={(e) => isLoan ? setLoanFee(Number(e.target.value)) : setOfferAmount(Number(e.target.value))}
                      className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-lg font-black text-emerald-400 focus:outline-none focus:border-emerald-500 transition-all"
                    />
                    <div className="flex gap-2 mt-3">
                       {[0.8, 1.0, 1.2, 1.5].map(mult => (
                          <button 
                            key={mult}
                            onClick={() => {
                              const val = Math.round(getEffectiveMarketValue(negotiatingPlayer) * mult);
                              if (isLoan) setLoanFee(val);
                              else setOfferAmount(val);
                            }}
                            className="flex-1 py-2 bg-white/5 hover:bg-white/10 text-[9px] font-black uppercase tracking-tighter rounded-lg border border-white/5 transition-all"
                          >
                            %{mult * 100}
                          </button>
                       ))}
                    </div>
                  </div>

                  {/* ─── Section 2: Contract & Salary ─── */}
                  <div className="bg-white/5 p-5 rounded-2xl border border-white/5 space-y-4">
                    <div className="flex items-center gap-2">
                      <FileText size={14} className="text-white/40" />
                      <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Sözleşme Detayları</p>
                    </div>

                    {/* Contract Length */}
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-white/30 block mb-2">
                        <Timer size={10} className="inline mr-1" /> Sözleşme Süresi
                      </label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map(yr => (
                          <button
                            key={yr}
                            onClick={() => setContractYears(yr)}
                            className={`flex-1 py-2.5 rounded-lg text-xs font-black uppercase transition-all border ${
                              contractYears === yr
                                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                                : 'bg-white/5 border-white/5 text-white/40 hover:bg-white/10'
                            }`}
                          >
                            {yr} {yr === 1 ? 'Yıl' : 'Yıl'}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Weekly Salary */}
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-white/30 block mb-2">
                        <Wallet size={10} className="inline mr-1" /> Haftalık Maaş
                      </label>
                      <div className="relative">
                        <input 
                          type="number"
                          value={weeklySalary}
                          onChange={(e) => setWeeklySalary(Number(e.target.value))}
                          className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-base font-black text-amber-400 focus:outline-none focus:border-amber-500 transition-all pr-14"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] font-black text-white/20 uppercase">Kredi / Hafta</span>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={() => setWeeklySalary(15000)}
                          className={`flex-1 py-1.5 rounded-lg text-[8px] font-black uppercase transition-all border ${
                            weeklySalary === 15000 ? 'bg-amber-500/20 border-amber-500 text-amber-400' : 'bg-white/5 border-white/5 text-white/30 hover:bg-white/10'
                          }`}
                        >15K</button>
                        <button
                          onClick={() => setWeeklySalary(30000)}
                          className={`flex-1 py-1.5 rounded-lg text-[8px] font-black uppercase transition-all border ${
                            weeklySalary === 30000 ? 'bg-amber-500/20 border-amber-500 text-amber-400' : 'bg-white/5 border-white/5 text-white/30 hover:bg-white/10'
                          }`}
                        >30K</button>
                        <button
                          onClick={() => setWeeklySalary(60000)}
                          className={`flex-1 py-1.5 rounded-lg text-[8px] font-black uppercase transition-all border ${
                            weeklySalary === 60000 ? 'bg-amber-500/20 border-amber-500 text-amber-400' : 'bg-white/5 border-white/5 text-white/30 hover:bg-white/10'
                          }`}
                        >60K</button>
                        <button
                          onClick={() => setWeeklySalary(90000)}
                          className={`flex-1 py-1.5 rounded-lg text-[8px] font-black uppercase transition-all border ${
                            weeklySalary === 90000 ? 'bg-amber-500/20 border-amber-500 text-amber-400' : 'bg-white/5 border-white/5 text-white/30 hover:bg-white/10'
                          }`}
                        >90K</button>
                        <button
                          onClick={() => setWeeklySalary(getSuggestedSalary(negotiatingPlayer.rating))}
                          className="flex-1 py-1.5 rounded-lg text-[8px] font-black uppercase transition-all border bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20"
                        >Öneri</button>
                      </div>
                      <p className="text-[9px] text-white/20 mt-2">
                        Önerilen Aralık: {formatCurrency(getSalaryRange(negotiatingPlayer.rating).min)} – {formatCurrency(getSalaryRange(negotiatingPlayer.rating).max)} / hafta
                      </p>
                    </div>
                  </div>

                  {/* ─── Section 3: Loan Option Toggle ─── */}
                  <div className="bg-white/5 p-5 rounded-2xl border border-white/5">
                    <button
                      onClick={() => setIsLoan(!isLoan)}
                      className="flex items-center justify-between w-full"
                    >
                      <div className="flex items-center gap-2">
                        <Repeat size={14} className={isLoan ? 'text-sky-400' : 'text-white/40'} />
                        <p className={`text-[10px] font-black uppercase tracking-widest ${isLoan ? 'text-sky-400' : 'text-white/40'}`}>Kiralık Seçeneği</p>
                      </div>
                      <div className={`w-10 h-6 rounded-full transition-all flex items-center ${isLoan ? 'bg-sky-500 justify-end' : 'bg-white/10 justify-start'}`}>
                        <div className="w-4 h-4 rounded-full bg-white mx-1" />
                      </div>
                    </button>

                    <AnimatePresence>
                      {isLoan && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="pt-4 space-y-4">
                            {/* Loan Fee info */}
                            <p className="text-[9px] text-white/20 font-bold uppercase">
                              Kiralık modunda yukarıdaki bedel kiralık ücreti olarak değerlendirilir.
                            </p>

                            {/* Buy Clause */}
                            <div>
                              <button
                                onClick={() => setHasBuyClause(!hasBuyClause)}
                                className="flex items-center justify-between w-full"
                              >
                                <div className="flex items-center gap-2">
                                  <ShieldCheck size={12} className={hasBuyClause ? 'text-emerald-400' : 'text-white/30'} />
                                  <p className={`text-[9px] font-black uppercase tracking-widest ${hasBuyClause ? 'text-emerald-400' : 'text-white/30'}`}>Satın Alma Opsiyonu</p>
                                </div>
                                <div className={`w-8 h-5 rounded-full transition-all flex items-center ${hasBuyClause ? 'bg-emerald-500 justify-end' : 'bg-white/10 justify-start'}`}>
                                  <div className="w-3 h-3 rounded-full bg-white mx-0.5" />
                                </div>
                              </button>
                              {hasBuyClause && (
                                <p className="text-[9px] text-emerald-400/60 mt-1 pl-5">
                                  Opsiyon Bedeli: {formatCurrency(offerAmount)}
                                </p>
                              )}
                            </div>

                            {/* Salary Percentage */}
                            <div>
                              <label className="text-[9px] font-black uppercase tracking-widest text-white/30 block mb-2">
                                <Percent size={10} className="inline mr-1" /> Maaş Yüzdesi (Sizin Ödediğiniz)
                              </label>
                              <div className="flex gap-2">
                                {[25, 50, 75, 100].map(pct => (
                                  <button
                                    key={pct}
                                    onClick={() => setSalaryPercentage(pct)}
                                    className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase transition-all border ${
                                      salaryPercentage === pct
                                        ? 'bg-sky-500/20 border-sky-500 text-sky-400'
                                        : 'bg-white/5 border-white/5 text-white/30 hover:bg-white/10'
                                    }`}
                                  >
                                    %{pct}
                                  </button>
                                ))}
                              </div>
                              <p className="text-[9px] text-white/20 mt-2">
                                Haftalık maaş yükünüz: <span className="text-amber-400 font-black">{formatCurrency(Math.round(weeklySalary * salaryPercentage / 100))}</span>
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* ─── Section 4: Performance Bonuses (Collapsible) ─── */}
                  <div className="bg-white/5 rounded-2xl border border-white/5 overflow-hidden">
                    <button
                      onClick={() => setBonusesOpen(!bonusesOpen)}
                      className="flex items-center justify-between w-full p-5"
                    >
                      <div className="flex items-center gap-2">
                        <Trophy size={14} className={bonusesOpen ? 'text-amber-400' : 'text-white/40'} />
                        <p className={`text-[10px] font-black uppercase tracking-widest ${bonusesOpen ? 'text-amber-400' : 'text-white/40'}`}>Performans Bonusları</p>
                        {(goalBonus > 0 || assistBonus > 0 || appearanceBonus > 0) && (
                          <span className="text-[8px] bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full font-black">AKTİF</span>
                        )}
                      </div>
                      {bonusesOpen ? <ChevronUp size={14} className="text-white/40" /> : <ChevronDown size={14} className="text-white/40" />}
                    </button>

                    <AnimatePresence>
                      {bonusesOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="px-5 pb-5 space-y-4">
                            {/* Goal Bonus */}
                            <div>
                              <label className="text-[9px] font-black uppercase tracking-widest text-white/30 flex items-center gap-1.5 mb-2">
                                <Target size={10} /> Gol Bonusu
                              </label>
                              <div className="flex gap-2">
                                {[0, 5000, 10000, 20000, 50000].map(val => (
                                  <button
                                    key={val}
                                    onClick={() => setGoalBonus(val)}
                                    className={`flex-1 py-2 rounded-lg text-[8px] font-black uppercase transition-all border ${
                                      goalBonus === val
                                        ? 'bg-amber-500/20 border-amber-500 text-amber-400'
                                        : 'bg-white/5 border-white/5 text-white/30 hover:bg-white/10'
                                    }`}
                                  >
                                    {val === 0 ? 'Yok' : formatCurrency(val)}
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Assist Bonus */}
                            <div>
                              <label className="text-[9px] font-black uppercase tracking-widest text-white/30 flex items-center gap-1.5 mb-2">
                                <Footprints size={10} /> Asist Bonusu
                              </label>
                              <div className="flex gap-2">
                                {[0, 2000, 5000, 10000, 20000].map(val => (
                                  <button
                                    key={val}
                                    onClick={() => setAssistBonus(val)}
                                    className={`flex-1 py-2 rounded-lg text-[8px] font-black uppercase transition-all border ${
                                      assistBonus === val
                                        ? 'bg-amber-500/20 border-amber-500 text-amber-400'
                                        : 'bg-white/5 border-white/5 text-white/30 hover:bg-white/10'
                                    }`}
                                  >
                                    {val === 0 ? 'Yok' : formatCurrency(val)}
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Appearance Bonus */}
                            <div>
                              <label className="text-[9px] font-black uppercase tracking-widest text-white/30 flex items-center gap-1.5 mb-2">
                                <Footprints size={10} /> Maç Başı Bonus
                              </label>
                              <div className="flex gap-2">
                                {[0, 1000, 3000, 5000, 10000].map(val => (
                                  <button
                                    key={val}
                                    onClick={() => setAppearanceBonus(val)}
                                    className={`flex-1 py-2 rounded-lg text-[8px] font-black uppercase transition-all border ${
                                      appearanceBonus === val
                                        ? 'bg-amber-500/20 border-amber-500 text-amber-400'
                                        : 'bg-white/5 border-white/5 text-white/30 hover:bg-white/10'
                                    }`}
                                  >
                                    {val === 0 ? 'Yok' : formatCurrency(val)}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* ─── Section 5: Sell-on Clause ─── */}
                  <div className="bg-white/5 p-5 rounded-2xl border border-white/5">
                    <div className="flex items-center gap-2 mb-3">
                      <TrendingUp size={14} className="text-white/40" />
                      <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Satış Clause %</p>
                    </div>
                    <p className="text-[9px] text-white/20 mb-3">Gelecekteki transfer bedelinin satan kulübe ödenecek yüzdesi.</p>
                    <div className="flex gap-2">
                      {[0, 10, 15, 20, 25, 30].map(pct => (
                        <button
                          key={pct}
                          onClick={() => setSellOnClause(pct)}
                          className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase transition-all border ${
                            sellOnClause === pct
                              ? 'bg-purple-500/20 border-purple-500 text-purple-400'
                              : 'bg-white/5 border-white/5 text-white/30 hover:bg-white/10'
                          }`}
                        >
                          {pct === 0 ? 'Yok' : `%${pct}`}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* ─── Section 6: Summary Panel ─── */}
                  <div className="bg-black/40 p-5 rounded-2xl border border-white/10 space-y-3">
                    <div className="flex items-center gap-2 mb-1">
                      <DollarSign size={14} className="text-white/60" />
                      <p className="text-[10px] font-black uppercase tracking-widest text-white/60">Maliyet Özeti</p>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="text-white/40 font-bold">{isLoan ? 'Kiralık Bedeli' : 'Transfer Bedeli'}</span>
                        <span className="font-black text-white">{formatCurrency(effectiveOffer)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-white/40 font-bold">Toplam Maaş ({contractYears} yıl)</span>
                        <span className="font-black text-amber-400">{formatCurrency(totalSalaryCost)}</span>
                      </div>
                      <div className="border-t border-white/5 pt-2 flex justify-between items-center">
                        <span className="text-white/60 font-black uppercase tracking-wider text-[10px]">Toplam Transfer Maliyeti</span>
                        <span className="text-base font-black text-white">{formatCurrency(totalCost)}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <div className="bg-white/5 p-3 rounded-xl">
                        <p className="text-[9px] font-black text-white/30 uppercase mb-1">Bütçe Durumu</p>
                        <p className={`text-sm font-black ${budgetRemaining >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {budgetRemaining >= 0 ? '' : '-'}{formatCurrency(Math.abs(budgetRemaining))}
                        </p>
                      </div>
                      <div className="bg-white/5 p-3 rounded-xl">
                        <p className="text-[9px] font-black text-white/30 uppercase mb-1">Yıllık Maliyet</p>
                        <p className="text-sm font-black text-amber-400">{formatCurrency(annualCost)}</p>
                      </div>
                    </div>

                    {budgetRemaining < 0 && (
                      <div className="flex items-center gap-2 bg-red-500/10 p-3 rounded-xl border border-red-500/20">
                        <AlertCircle size={14} className="text-red-400 shrink-0" />
                        <p className="text-[9px] font-bold text-red-400 uppercase tracking-wider">Bütçeniz bu transfer için yetersiz!</p>
                      </div>
                    )}
                  </div>

                  {/* ─── Submit Button ─── */}
                  <button 
                    onClick={handleNegotiate}
                    disabled={isNegotiating || effectiveOffer <= 0}
                    className={`w-full py-5 rounded-[20px] text-xs font-black uppercase tracking-[0.2em] transform active:scale-95 shadow-xl transition-all ${
                      isNegotiating || effectiveOffer <= 0
                        ? 'bg-white/20 text-white/30 cursor-not-allowed'
                        : budgetRemaining >= 0
                          ? 'bg-white text-black hover:bg-emerald-500 hover:text-white'
                          : 'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30'
                    }`}
                  >
                    {isNegotiating ? 'TEKLİF GÖNDERİLİYOR...' : (effectiveOffer <= 0 ? 'GEÇERLİ BİR TEKLİF GİR' : 'TEKLİFİ GÖNDER')}
                  </button>
                </div>
              ) : (
                <div className="text-center space-y-6 py-8">
                   {negotiationResult.success ? (
                     <motion.div initial={{ scale: 0.5 }} animate={{ scale: 1 }} className="space-y-4">
                        <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto">
                           <CheckCircle2 className="text-emerald-500" size={48} />
                        </div>
                        <h4 className="text-2xl font-black italic text-white uppercase tracking-tighter">HOŞ GELDİN {negotiatingPlayer.name.split(' ')[0]}!</h4>
                        <p className="text-xs text-white/40 font-bold uppercase tracking-widest">{negotiationResult.message}</p>
                     </motion.div>
                   ) : (
                     <motion.div initial={{ scale: 0.5 }} animate={{ scale: 1 }} className="space-y-4">
                        <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
                           <XCircle className="text-red-500" size={48} />
                        </div>
                        <h4 className="text-2xl font-black italic text-white uppercase tracking-tighter">TEKLİF REDDEDİLDİ</h4>
                        <p className="text-xs text-white/40 font-bold uppercase tracking-widest">{negotiationResult.message}</p>
                        {negotiationResult.counterOffer && (
                           <button 
                             onClick={() => {
                               setOfferAmount(negotiationResult.counterOffer!);
                               setNegotiationResult(null);
                             }}
                             className="px-6 py-2 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-emerald-600 transition-all"
                           >
                             Karşı Teklifi Kabul Et
                           </button>
                        )}
                        <br />
                        <button 
                          onClick={() => setNegotiationResult(null)}
                          className="text-[10px] font-black text-white/20 uppercase hover:text-white transition-colors"
                        >
                          TEKRAR DENE
                        </button>
                     </motion.div>
                   )}
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
