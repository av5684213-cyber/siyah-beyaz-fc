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
  ShieldCheck,
  Globe,
  ArrowRightLeft,
  Clock,
  Send,
  Ban,
  Check,
  X,
  RefreshCw,
  Calendar,
  Coins
} from 'lucide-react';
import { useFM } from '@/lib/fm/GameContext';
import { Player, Sponsor } from '@/lib/fm/types';
import { formatCurrency } from '@/lib/fm/valuation';
import { toTitleCase, localizePosFull, getPosBadgeStyle, getPosGroup, getPlayerPos } from '@/lib/fm/ui-helpers';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import { calculateLoanFeeEuro } from '@/lib/fm/inflation';
import ContractOfferModal from '@/components/fm/ContractOfferModal';

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
  const [activeSubTab, setActiveSubTab] = useState<'transfers' | 'sponsors' | 'kiralik'>('transfers');
  const [searchTerm, setSearchTerm] = useState('');
  const [positionFilter, setPositionFilter] = useState('ALL');
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

  // ── Kiralık oyuncular state ──
  const [loanPlayers, setLoanPlayers] = useState<any[]>([]);
  const [loanLoading, setLoanLoading] = useState(false);

  // ── Kiralık alt sekme ──
  const [rentalSubTab, setRentalSubTab] = useState<'market' | 'my-listed' | 'my-rented'>('market');

  // ── Kiralama modal state ──
  const [rentalModalPlayer, setRentalModalPlayer] = useState<any>(null);
  const [rentalWeeks, setRentalWeeks] = useState(12);
  const [rentalSubmitting, setRentalSubmitting] = useState(false);
  const [rentalResult, setRentalResult] = useState<{ success: boolean; message: string } | null>(null);

  // ── Benim ilanlarım ve teklifler ──
  const [myListings, setMyListings] = useState<any[]>([]);
  const [myOffers, setMyOffers] = useState<any[]>([]);
  const [myActiveRentals, setMyActiveRentals] = useState<any[]>([]);
  const [myListingsLoading, setMyListingsLoading] = useState(false);
  const [respondingOfferId, setRespondingOfferId] = useState<string | null>(null);

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
              specificPosition: (pd.specific_position as string) || (pd.specificPosition as string) || pd.position as string,
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
          specificPosition: (p.specific_position as string) || (p.specificPosition as string) || p.position as string,
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

  // ── Fetch loan/rental players when Kiralık tab is active ──
  const fetchLoanPlayers = useCallback(async () => {
    if (!isSupabaseConfigured() || !profile) return;
    setLoanLoading(true);
    try {
      // Önce rental_listings API dene, fallback olarak loans/available kullan
      const res = await fetch(`/api/rental/listings?profileId=${profile.id}`);
      const data = await res.json();
      if (data.listings && Array.isArray(data.listings) && data.listings.length > 0) {
        // rental_listings verisini loanPlayers formatına çevir
        const mapped = data.listings.map((l: any) => ({
          ...l.player,
          id: l.player_id || l.player?.id,
          listing_id: l.id,
          daily_cost: l.daily_cost,
          owner_team_name: l.owner_team_name,
          listed_at: l.listed_at,
        }));
        setLoanPlayers(mapped);
      } else {
        // Fallback: loans/available
        const res2 = await fetch(`/api/loans/available?profileId=${profile.id}`);
        const data2 = await res2.json();
        setLoanPlayers(data2.players || []);
      }
    } catch (err) {
      console.error('[fetchLoanPlayers] Error:', err);
      setLoanPlayers([]);
    } finally {
      setLoanLoading(false);
    }
  }, [profile]);

  // ── Benim ilanlarımı ve tekliflerimi getir ──
  const fetchMyListings = useCallback(async () => {
    if (!isSupabaseConfigured() || !profile) return;
    setMyListingsLoading(true);
    try {
      const res = await fetch(`/api/rental/my-listings?profileId=${profile.id}`);
      const data = await res.json();
      if (data.listings) setMyListings(data.listings);
      if (data.offers) setMyOffers(data.offers);
      if (data.activeRentals) setMyActiveRentals(data.activeRentals);
    } catch (err) {
      console.error('[fetchMyListings] Error:', err);
    } finally {
      setMyListingsLoading(false);
    }
  }, [profile]);

  useEffect(() => {
    if (activeSubTab === 'kiralik') {
      fetchLoanPlayers();
      fetchMyListings();
    }
  }, [activeSubTab, fetchLoanPlayers, fetchMyListings]);

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

    return unique.filter((p: Player) => {
      if (p?.club?.includes(myTeam) || p?.team_name?.includes(myTeam)) return false;
      const term = searchTerm.toLowerCase();
      const nameMatch = (p?.name || '').toLowerCase().includes(term);
      const posDisplay = getPlayerPos(p as Record<string, unknown>);
      const posMatch = posDisplay.toLowerCase().includes(term) || localizePosFull(posDisplay).toLowerCase().includes(term);
      if (term && !nameMatch && !posMatch) return false;
      if (positionFilter !== 'ALL') {
        const bigPosMap: Record<string, string> = {
          'GK': 'GK', 'CB': 'DEF', 'LB': 'DEF', 'RB': 'DEF', 'LWB': 'DEF', 'RWB': 'DEF', 'DEF': 'DEF',
          'CDM': 'MID', 'CM': 'MID', 'CAM': 'MID', 'LM': 'MID', 'RM': 'MID', 'LW': 'MID', 'RW': 'MID', 'MID': 'MID',
          'ST': 'FWD', 'CF': 'FWD', 'FWD': 'FWD'
        };
        const playerPos = posDisplay;
        const filterGroup = bigPosMap[positionFilter];
        if (filterGroup) {
          const playerBigPos = bigPosMap[playerPos] || playerPos;
          if (playerBigPos !== filterGroup) return false;
        } else {
          if (playerPos !== positionFilter) return false;
        }
      }
      return true;
    }).slice(0, 50);
  }, [transferListings, freeAgents, profile?.team_name, searchTerm, positionFilter]);

  // ─── Player demands (randomly generated when opening negotiation) ───
  const [playerDemands, setPlayerDemands] = useState<{ minSalary: number; minWeeks: number } | null>(null);
  const [contractOfferListing, setContractOfferListing] = useState<any>(null);

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
    // Generate player demands based on rating
    const range = getSalaryRange(player.rating);
    const minSalary = Math.round(range.min + Math.random() * (range.max - range.min) * 0.5);
    const minWeeks = 12 + Math.floor(Math.random() * 40); // 12-52 weeks
    setPlayerDemands({ minSalary, minWeeks });
  };

  const handleNegotiate = async () => {
    if (!negotiatingPlayer || isNegotiating) return;
    setIsNegotiating(true);
    try {
      // For loan mode, the effective offer is the loan fee (or 0 if no buy clause)
      const effectiveOffer = isLoan ? loanFee : offerAmount;

      // Check player demands
      if (playerDemands) {
        const salaryMeetsDemand = weeklySalary >= playerDemands.minSalary * 0.8; // ±20% tolerance
        const durationWeeks = contractYears * 12;
        const durationMeetsDemand = durationWeeks >= playerDemands.minWeeks * 0.8;

        if (!salaryMeetsDemand && !durationMeetsDemand) {
          setNegotiationResult({
            success: false,
            message: `Oyuncu teklifinizi reddetti. Maaş talebi: ${playerDemands.minSalary.toLocaleString('tr-TR')} €/hafta, Minimum süre: ${playerDemands.minWeeks} hafta. Teklifiniz bu taleplerden çok uzak.`
          });
          setIsNegotiating(false);
          return;
        }
      }

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
          setPlayerDemands(null);
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
            onClick={() => setActiveSubTab('kiralik')}
            className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-1.5 ${activeSubTab === 'kiralik' ? 'bg-cyan-500 text-white' : 'text-white/40 hover:text-white'}`}
          >
            <Globe size={12} />
            Kiralık
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
          {/* Search Bar & Position Filter */}
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
              <input 
                type="text" 
                placeholder="OYUNCU ARA..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-xs font-black uppercase tracking-widest focus:outline-none focus:border-white/30 transition-all"
              />
            </div>
            <div className="w-full md:w-56">
              <select 
                value={positionFilter}
                onChange={(e) => setPositionFilter(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-4 text-xs font-black uppercase tracking-widest focus:outline-none focus:border-white/30 transition-all appearance-none cursor-pointer text-white/60"
              >
                <option value="ALL">Tüm Mevkiler</option>
                <optgroup label="Kaleci">
                  <option value="GK">GK — Kaleci</option>
                </optgroup>
                <optgroup label="Defans">
                  <option value="DEF">Tüm Defans</option>
                  <option value="CB">CB — Stoper</option>
                  <option value="LB">LB — Sol Bek</option>
                  <option value="RB">RB — Sağ Bek</option>
                  <option value="LWB">LWB — Sol Kanat Bek</option>
                  <option value="RWB">RWB — Sağ Kanat Bek</option>
                </optgroup>
                <optgroup label="Orta Saha">
                  <option value="MID">Tüm Orta Saha</option>
                  <option value="CDM">CDM — Defansif Orta Saha</option>
                  <option value="CM">CM — Merkez Orta Saha</option>
                  <option value="CAM">CAM — Ofansif Orta Saha</option>
                  <option value="LM">LM — Sol Açık</option>
                  <option value="RM">RM — Sağ Açık</option>
                  <option value="LW">LW — Sol Kanat</option>
                  <option value="RW">RW — Sağ Kanat</option>
                </optgroup>
                <optgroup label="Forvet">
                  <option value="FWD">Tüm Forvet</option>
                  <option value="CF">CF — İkinci Forvet</option>
                  <option value="ST">ST — Santrfor</option>
                </optgroup>
              </select>
            </div>
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
                    <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">{getPlayerPos(player as Record<string, unknown>)} • {player.age} YAŞ • {player.nation}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">{formatCurrency(getEffectiveMarketValue(player))}</p>
                    <p className="text-[9px] text-white/20 uppercase font-bold">Pazar Değeri</p>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-2 mb-4 text-center">
                  <div className={`p-2 rounded-lg border ${getPosBadgeStyle(getPlayerPos(player as Record<string, unknown>))} border`}>
                    <p className="text-[8px] uppercase font-black opacity-60">{localizePosFull(getPlayerPos(player as Record<string, unknown>))}</p>
                    <p className="text-xs font-black">{getPlayerPos(player as Record<string, unknown>)}</p>
                  </div>
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
      ) : activeSubTab === 'kiralik' ? (
        <div className="space-y-6">
          {/* ═══ Kiralık Alt Sekmeler ═══ */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-cyan-500/10 rounded-xl flex items-center justify-center border border-cyan-500/20">
                <Globe size={20} className="text-cyan-400" />
              </div>
              <div>
                <h3 className="text-sm font-black uppercase tracking-widest text-white/80">Kiralık Sistemi</h3>
                <p className="text-[9px] text-white/30 font-bold uppercase tracking-wider">Oyuncu kiralayın veya kiralık pazara çıkarın</p>
              </div>
            </div>
            <button 
              onClick={() => { fetchLoanPlayers(); fetchMyListings(); }}
              className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-[9px] font-bold uppercase tracking-wider text-white/40 hover:text-white transition-all rounded-lg border border-white/5 flex items-center gap-1.5"
            >
              <RefreshCw size={10} /> Yenile
            </button>
          </div>

          {/* Alt Sekme Butonları */}
          <div className="flex p-1 bg-white/5 rounded-xl border border-white/5">
            <button 
              onClick={() => setRentalSubTab('market')}
              className={`flex-1 px-4 py-2.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-1.5 ${rentalSubTab === 'market' ? 'bg-cyan-500 text-white' : 'text-white/40 hover:text-white'}`}
            >
              <Globe size={11} /> Kiralık Pazar
            </button>
            <button 
              onClick={() => setRentalSubTab('my-listed')}
              className={`flex-1 px-4 py-2.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-1.5 ${rentalSubTab === 'my-listed' ? 'bg-amber-500 text-white' : 'text-white/40 hover:text-white'}`}
            >
              <Send size={11} /> Verdiğim Kiralıklar
              {myOffers.filter((o: any) => o.status === 'pending').length > 0 && (
                <span className="px-1.5 py-0.5 bg-red-500 text-white text-[7px] font-black rounded-full">{myOffers.filter((o: any) => o.status === 'pending').length}</span>
              )}
            </button>
            <button 
              onClick={() => setRentalSubTab('my-rented')}
              className={`flex-1 px-4 py-2.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-1.5 ${rentalSubTab === 'my-rented' ? 'bg-emerald-500 text-white' : 'text-white/40 hover:text-white'}`}
            >
              <ArrowRightLeft size={11} /> Aldığım Kiralıklar
            </button>
          </div>

          {/* ═══════════════════════════════════════════════════ */}
          {/* ALT SEKME: KİRALIK PAZAR                         */}
          {/* ═══════════════════════════════════════════════════ */}
          {rentalSubTab === 'market' && (
            <>
              {loanLoading ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <div className="w-8 h-8 border-2 border-cyan-500/20 border-t-cyan-500/40 rounded-full animate-spin" />
                  <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest">Kiralık oyuncular yükleniyor</p>
                </div>
              ) : loanPlayers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <Globe size={48} className="text-cyan-500/20" />
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-white/30">Kiralık oyuncu bulunmuyor</p>
                  <p className="text-[10px] text-white/20 text-center max-w-xs">
                    Diğer takımlar oyuncularını kiralık pazara çıkardığında burada görünecek.
                    Kendi oyuncularınızı da &quot;Kiralık Olarak Gönder&quot; seçeneği ile pazara çıkarabilirsiniz.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {loanPlayers.map((lp: any) => {
                    const dailyCost = lp.daily_cost || lp.loan_fee || 0;
                    const computedDaily = dailyCost > 0 ? dailyCost : Math.round((lp.market_value || (lp.rating || 50) * 50000) * 0.002);
                    const computedWeekCost = computedDaily * 7;
                    const feeStr = computedDaily >= 1000000 ? `${(computedDaily / 1000000).toFixed(1)}M €` : computedDaily >= 1000 ? `${(computedDaily / 1000).toFixed(0)}K €` : `${computedDaily} €`;
                    const weekStr = computedWeekCost >= 1000000 ? `${(computedWeekCost / 1000000).toFixed(1)}M €` : computedWeekCost >= 1000 ? `${(computedWeekCost / 1000).toFixed(0)}K €` : `${computedWeekCost} €`;
                    const posDisplay = getPlayerPos(lp as Record<string, unknown>);
                    return (
                      <motion.div
                        key={lp.id || lp.listing_id}
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="fm-card p-5 group hover:border-cyan-500/20"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="text-sm font-black italic uppercase tracking-tighter text-white">{toTitleCase(lp.name)}</h4>
                              <span className="px-1.5 py-0.5 bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 text-[7px] font-black uppercase tracking-widest rounded">KİRALIK</span>
                            </div>
                            <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">
                              {localizePosFull(posDisplay)} • {lp.age || '?'} YAŞ • {lp.owner_team_name || lp.team_name || 'Bilinmeyen'}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] font-black text-cyan-400 uppercase tracking-widest">{feeStr}</p>
                            <p className="text-[8px] text-white/20 uppercase font-bold">Günlük</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-4 gap-2 mb-4 text-center">
                          <div className={`p-2 rounded-lg border ${getPosBadgeStyle(posDisplay)} border`}>
                            <p className="text-[7px] uppercase font-black opacity-60">{localizePosFull(posDisplay)}</p>
                            <p className="text-[10px] font-black">{posDisplay}</p>
                          </div>
                          <div className="bg-white/5 p-2 rounded-lg">
                            <p className="text-[8px] text-white/30 uppercase font-black">Rating</p>
                            <p className="text-xs font-black text-white">{lp.rating || '?'}</p>
                          </div>
                          <div className="bg-white/5 p-2 rounded-lg">
                            <p className="text-[8px] text-white/30 uppercase font-black">Pot.</p>
                            <p className="text-xs font-black text-emerald-500">{lp.potential || '?'}</p>
                          </div>
                          <div className="bg-white/5 p-2 rounded-lg">
                            <p className="text-[8px] text-white/30 uppercase font-black">Haftalık</p>
                            <p className="text-[8px] font-black text-cyan-400">{weekStr}</p>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            setRentalModalPlayer(lp);
                            setRentalWeeks(12);
                            setRentalResult(null);
                          }}
                          className="w-full py-3 bg-cyan-500/10 group-hover:bg-cyan-500 group-hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 text-cyan-400 border border-cyan-500/20 group-hover:border-cyan-500"
                        >
                          <Globe size={14} /> KİRALAMA TEKLİFİ GÖNDER
                        </button>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {/* ═══════════════════════════════════════════════════ */}
          {/* ALT SEKME: VERDİĞİM KİRALIKLAR                   */}
          {/* ═══════════════════════════════════════════════════ */}
          {rentalSubTab === 'my-listed' && (
            <>
              {myListingsLoading ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <div className="w-8 h-8 border-2 border-amber-500/20 border-t-amber-500/40 rounded-full animate-spin" />
                  <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest">İlanlar yükleniyor</p>
                </div>
              ) : (
                <>
                  {/* Bekleyen Teklifler */}
                  {myOffers.filter((o: any) => o.status === 'pending').length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-amber-400 flex items-center gap-2">
                        <Send size={12} /> BEKLEYEN TEKLİFLER
                      </h4>
                      {myOffers.filter((o: any) => o.status === 'pending').map((offer: any) => (
                        <motion.div
                          key={offer.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-5"
                        >
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="text-sm font-black italic uppercase tracking-tighter text-white">{toTitleCase(offer.player_name)}</h4>
                                <span className="px-1.5 py-0.5 bg-amber-500/20 text-amber-400 text-[7px] font-black uppercase tracking-widest rounded">{offer.player_position}</span>
                                <span className="px-1.5 py-0.5 bg-white/5 text-white/40 text-[7px] font-black uppercase tracking-widest rounded">⭐ {offer.player_rating}</span>
                              </div>
                              <p className="text-[10px] text-white/40 font-bold">
                                Teklif sahibi: <span className="text-amber-400">{offer.renter_team_name}</span> • Süre: {offer.duration_weeks} hafta • Toplam: {offer.total_cost?.toLocaleString('tr-TR')} € + {offer.commission} KR
                              </p>
                              <p className="text-[9px] text-white/20 mt-1">Günlük ücret: {offer.daily_cost?.toLocaleString('tr-TR')} €</p>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={async () => {
                                  if (!profile?.id) return;
                                  setRespondingOfferId(offer.id);
                                  try {
                                    const res = await fetch('/api/rental/respond', {
                                      method: 'POST',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({ agreementId: offer.id, response: 'accept', ownerTeamId: profile.id }),
                                    });
                                    const data = await res.json();
                                    if (data.success) {
                                      fetchMyListings();
                                      fetchLoanPlayers();
                                    } else {
                                      alert(data.error || 'Hata oluştu');
                                    }
                                  } catch (err) {
                                    alert('Bir hata oluştu');
                                  } finally {
                                    setRespondingOfferId(null);
                                  }
                                }}
                                disabled={respondingOfferId === offer.id}
                                className="px-4 py-2.5 bg-emerald-500/20 hover:bg-emerald-500 text-emerald-400 hover:text-white text-[9px] font-black uppercase tracking-widest rounded-xl border border-emerald-500/30 transition-all flex items-center gap-1.5 disabled:opacity-50"
                              >
                                <Check size={12} /> KABUL
                              </button>
                              <button
                                onClick={async () => {
                                  if (!profile?.id) return;
                                  setRespondingOfferId(offer.id);
                                  try {
                                    const res = await fetch('/api/rental/respond', {
                                      method: 'POST',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({ agreementId: offer.id, response: 'reject', ownerTeamId: profile.id }),
                                    });
                                    const data = await res.json();
                                    if (data.success) {
                                      fetchMyListings();
                                      fetchLoanPlayers();
                                    } else {
                                      alert(data.error || 'Hata oluştu');
                                    }
                                  } catch (err) {
                                    alert('Bir hata oluştu');
                                  } finally {
                                    setRespondingOfferId(null);
                                  }
                                }}
                                disabled={respondingOfferId === offer.id}
                                className="px-4 py-2.5 bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white text-[9px] font-black uppercase tracking-widest rounded-xl border border-red-500/30 transition-all flex items-center gap-1.5 disabled:opacity-50"
                              >
                                <X size={12} /> REDDET
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}

                  {/* İlanlarım Listesi */}
                  <div className="space-y-3">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-white/30 flex items-center gap-2">
                      <Send size={12} /> KİRALIK PAZARINDAKİ OYUNCULARIM
                    </h4>
                    {myListings.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-16 gap-3">
                        <Send size={36} className="text-amber-500/20" />
                        <p className="text-[10px] text-white/20 text-center">Henüz kiralık pazara oyuncu çıkarmamışsınız.</p>
                        <p className="text-[9px] text-white/10 text-center">Kadronuzdan bir oyuncuyu &quot;Kiralık Olarak Gönder&quot; ile pazara çıkarabilirsiniz.</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {myListings.map((listing: any) => {
                          const p = listing.player || {};
                          const posDisplay = getPlayerPos(p as Record<string, unknown>);
                          return (
                            <div key={listing.id} className="bg-white/[0.03] border border-white/5 rounded-xl p-4 flex items-center gap-4">
                              <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-[10px] font-black border ${getPosBadgeStyle(posDisplay)}`}>
                                {posDisplay}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-black uppercase tracking-tighter text-white truncate">{toTitleCase(p.name || 'Bilinmeyen')}</p>
                                <p className="text-[9px] text-white/30 font-bold">{localizePosFull(posDisplay)} • ⭐ {p.rating || '?'} • {p.age || '?'} yaş</p>
                              </div>
                              <div className="text-right">
                                <p className="text-[10px] font-black text-cyan-400">{(listing.daily_cost || 0).toLocaleString('tr-TR')} €/gün</p>
                                <span className={`px-1.5 py-0.5 text-[7px] font-black uppercase tracking-widest rounded ${
                                  listing.status === 'active' ? 'bg-emerald-500/15 text-emerald-400' :
                                  listing.status === 'pending' ? 'bg-amber-500/15 text-amber-400' :
                                  listing.status === 'rented' ? 'bg-sky-500/15 text-sky-400' :
                                  'bg-white/5 text-white/30'
                                }`}>
                                  {listing.status === 'active' ? 'AKTİF' : listing.status === 'pending' ? 'BEKLİYOR' : listing.status === 'rented' ? 'KİRALANDI' : listing.status?.toUpperCase()}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Yanıtlanmış Teklifler (Kabul/Red) */}
                  {myOffers.filter((o: any) => o.status !== 'pending').length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-white/20 flex items-center gap-2">
                        <Clock size={12} /> GEÇMİŞ TEKLİFLER
                      </h4>
                      {myOffers.filter((o: any) => o.status !== 'pending').map((offer: any) => (
                        <div key={offer.id} className="bg-white/[0.02] border border-white/5 rounded-xl p-3 flex items-center gap-3 opacity-50">
                          <div className="flex-1">
                            <p className="text-[10px] font-black text-white/60">{toTitleCase(offer.player_name)} → {offer.renter_team_name}</p>
                            <p className="text-[9px] text-white/30">{offer.duration_weeks} hafta • {offer.total_cost?.toLocaleString('tr-TR')} €</p>
                          </div>
                          <span className={`px-2 py-1 text-[8px] font-black uppercase rounded ${
                            offer.status === 'accepted' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'
                          }`}>
                            {offer.status === 'accepted' ? 'KABUL' : 'RED'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </>
          )}

          {/* ═══════════════════════════════════════════════════ */}
          {/* ALT SEKME: ALDIĞIM KİRALIKLAR                    */}
          {/* ═══════════════════════════════════════════════════ */}
          {rentalSubTab === 'my-rented' && (
            <>
              {myListingsLoading ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <div className="w-8 h-8 border-2 border-emerald-500/20 border-t-emerald-500/40 rounded-full animate-spin" />
                  <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest">Anlaşmalar yükleniyor</p>
                </div>
              ) : myActiveRentals.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <ArrowRightLeft size={48} className="text-emerald-500/20" />
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-white/30">Henüz kiralama anlaşmanız yok</p>
                  <p className="text-[10px] text-white/20 text-center max-w-xs">
                    &quot;Kiralık Pazar&quot; sekmesinden oyuncu kiralayarak burada takip edebilirsiniz.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {myActiveRentals.map((rental: any) => (
                    <motion.div
                      key={rental.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`border rounded-2xl p-5 ${
                        rental.status === 'accepted' ? 'bg-emerald-500/5 border-emerald-500/20' :
                        rental.status === 'pending' ? 'bg-amber-500/5 border-amber-500/20' :
                        'bg-white/[0.03] border-white/5'
                      }`}
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xs font-black border ${
                            getPosBadgeStyle(rental.player_position)
                          }`}>
                            {rental.player_position}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-black italic uppercase tracking-tighter text-white">{toTitleCase(rental.player_name)}</h4>
                              <span className={`px-1.5 py-0.5 text-[7px] font-black uppercase tracking-widest rounded ${
                                rental.status === 'accepted' ? 'bg-emerald-500/15 text-emerald-400' :
                                rental.status === 'pending' ? 'bg-amber-500/15 text-amber-400' :
                                'bg-white/5 text-white/30'
                              }`}>
                                {rental.status === 'accepted' ? 'AKTİF' : rental.status === 'pending' ? 'BEKLİYOR' : rental.status?.toUpperCase()}
                              </span>
                            </div>
                            <p className="text-[10px] text-white/40 font-bold">
                              ⭐ {rental.player_rating} • {rental.player_age || '?'} yaş • Sahip: {rental.owner_team_name}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-4 text-center">
                          <div className="bg-white/5 px-3 py-2 rounded-lg">
                            <p className="text-[8px] text-white/30 uppercase font-black">Süre</p>
                            <p className="text-xs font-black text-white">{rental.duration_weeks} hafta</p>
                          </div>
                          <div className="bg-white/5 px-3 py-2 rounded-lg">
                            <p className="text-[8px] text-white/30 uppercase font-black">Toplam</p>
                            <p className="text-xs font-black text-cyan-400">{(rental.total_cost || 0).toLocaleString('tr-TR')} €</p>
                          </div>
                          <div className="bg-white/5 px-3 py-2 rounded-lg">
                            <p className="text-[8px] text-white/30 uppercase font-black">Bitiş</p>
                            <p className="text-[10px] font-black text-white/60">{rental.loan_end_date || rental.end_date?.split('T')[0] || '?'}</p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* ═══════════════════════════════════════════════════ */}
          {/* KİRALAMA MODALI                                   */}
          {/* ═══════════════════════════════════════════════════ */}
          <AnimatePresence>
            {rentalModalPlayer && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => { setRentalModalPlayer(null); setRentalResult(null); }}
                  className="absolute inset-0 bg-black/90 backdrop-blur-md"
                />
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 20 }}
                  className="relative w-full max-w-md bg-zinc-900 border border-cyan-500/20 rounded-[32px] p-8 overflow-hidden shadow-2xl"
                >
                  {/* Modal Kapat */}
                  <button
                    onClick={() => { setRentalModalPlayer(null); setRentalResult(null); }}
                    className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all"
                  >
                    <X size={16} />
                  </button>

                  {!rentalResult ? (
                    <>
                      {/* Oyuncu Başlık */}
                      <div className="flex items-center gap-4 mb-6">
                        <div className="w-14 h-14 bg-cyan-500/10 rounded-2xl flex items-center justify-center border border-cyan-500/20">
                          <Globe size={24} className="text-cyan-400" />
                        </div>
                        <div>
                          <h3 className="text-lg font-black italic tracking-tighter text-white uppercase">{toTitleCase(rentalModalPlayer.name)}</h3>
                          <p className="text-[10px] text-white/40 font-black uppercase tracking-widest">
                            {localizePosFull(getPlayerPos(rentalModalPlayer as Record<string, unknown>))} • ⭐ {rentalModalPlayer.rating} • {rentalModalPlayer.age} yaş
                          </p>
                          <p className="text-[9px] text-white/20">Sahip: {rentalModalPlayer.owner_team_name || rentalModalPlayer.team_name}</p>
                        </div>
                      </div>

                      {/* Günlük Ücret */}
                      <div className="bg-cyan-500/5 border border-cyan-500/10 rounded-2xl p-4 mb-4">
                        <div className="flex items-center justify-between">
                          <p className="text-[10px] font-black uppercase tracking-widest text-cyan-400">Günlük Kiralama Ücreti</p>
                          <p className="text-lg font-black text-cyan-400 italic">
                            {(rentalModalPlayer.daily_cost || 0).toLocaleString('tr-TR')} €
                          </p>
                        </div>
                      </div>

                      {/* Süre Seçimi */}
                      <div className="mb-4">
                        <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-3 flex items-center gap-1.5">
                          <Calendar size={11} /> Kiralama Süresi (Hafta)
                        </p>
                        <div className="grid grid-cols-6 gap-2">
                          {[4, 8, 12, 17, 24, 34].map(w => (
                            <button
                              key={w}
                              onClick={() => setRentalWeeks(w)}
                              className={`py-2.5 rounded-lg text-[10px] font-black uppercase transition-all border ${
                                rentalWeeks === w
                                  ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400'
                                  : 'bg-white/5 border-white/5 text-white/40 hover:bg-white/10'
                              }`}
                            >
                              {w}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Maliyet Hesaplama */}
                      {(() => {
                        const dailyCost = rentalModalPlayer.daily_cost || 0;
                        const totalDays = rentalWeeks * 7;
                        const totalCost = dailyCost * totalDays;
                        const myMoney = profile?.money || 0;
                        const myCredits = profile?.credits || 0;
                        const canAfford = myMoney >= totalCost && myCredits >= 10;
                        return (
                          <div className="bg-white/5 rounded-2xl p-4 mb-4 space-y-2">
                            <div className="flex justify-between text-[10px]">
                              <span className="text-white/40 font-bold">Günlük ücret</span>
                              <span className="text-white font-black">{dailyCost.toLocaleString('tr-TR')} €</span>
                            </div>
                            <div className="flex justify-between text-[10px]">
                              <span className="text-white/40 font-bold">Gün sayısı</span>
                              <span className="text-white font-black">{totalDays} gün ({rentalWeeks} hafta)</span>
                            </div>
                            <div className="border-t border-white/5 my-2" />
                            <div className="flex justify-between text-[10px]">
                              <span className="text-white/40 font-bold">Toplam kira ücreti</span>
                              <span className="text-cyan-400 font-black">{totalCost.toLocaleString('tr-TR')} €</span>
                            </div>
                            <div className="flex justify-between text-[10px]">
                              <span className="text-white/40 font-bold">Sistem komisyonu</span>
                              <span className="text-amber-400 font-black">10 KR</span>
                            </div>
                            <div className="border-t border-white/5 my-2" />
                            <div className="flex justify-between text-[10px]">
                              <span className="text-white/40 font-bold">Bakiyeniz (€)</span>
                              <span className={`font-black ${myMoney >= totalCost ? 'text-emerald-400' : 'text-red-400'}`}>
                                {myMoney.toLocaleString('tr-TR')} €
                              </span>
                            </div>
                            <div className="flex justify-between text-[10px]">
                              <span className="text-white/40 font-bold">Krediniz (KR)</span>
                              <span className={`font-black ${myCredits >= 10 ? 'text-emerald-400' : 'text-red-400'}`}>
                                {myCredits} KR
                              </span>
                            </div>
                          </div>
                        );
                      })()}

                      {/* Gönder Butonu */}
                      <button
                        onClick={async () => {
                          if (!profile?.id || rentalSubmitting) return;
                          setRentalSubmitting(true);
                          try {
                            const dailyCost = rentalModalPlayer.daily_cost || 0;
                            const totalCost = dailyCost * rentalWeeks * 7;
                            const myMoney = profile?.money || 0;
                            const myCredits = profile?.credits || 0;

                            if (myMoney < totalCost) {
                              setRentalResult({ success: false, message: `Yetersiz Euro bakiye. Gerekli: ${totalCost.toLocaleString('tr-TR')} €, Mevcut: ${myMoney.toLocaleString('tr-TR')} €` });
                              return;
                            }
                            if (myCredits < 10) {
                              setRentalResult({ success: false, message: `Yetersiz kredi. Gerekli: 10 KR, Mevcut: ${myCredits} KR` });
                              return;
                            }

                            const res = await fetch('/api/rental/offer', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({
                                listingId: rentalModalPlayer.listing_id,
                                playerId: rentalModalPlayer.id,
                                renterTeamId: profile.id,
                                durationWeeks: rentalWeeks,
                              }),
                            });
                            const data = await res.json();
                            if (data.success) {
                              setRentalResult({ success: true, message: `${toTitleCase(rentalModalPlayer.name)} için ${rentalWeeks} haftalık kiralama teklifi gönderildi! İlan sahibinin onayı bekleniyor.` });
                              fetchLoanPlayers();
                              fetchMyListings();
                            } else {
                              setRentalResult({ success: false, message: data.error || 'Teklif gönderilemedi' });
                            }
                          } catch (err) {
                            setRentalResult({ success: false, message: 'Bir hata oluştu' });
                          } finally {
                            setRentalSubmitting(false);
                          }
                        }}
                        disabled={rentalSubmitting}
                        className="w-full py-3.5 bg-cyan-500 hover:bg-cyan-400 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {rentalSubmitting ? (
                          <><div className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin" /> GÖNDERİLİYOR...</>
                        ) : (
                          <><Send size={14} /> TEKLİFİ GÖNDER</>
                        )}
                      </button>
                    </>
                  ) : (
                    /* Sonuç */
                    <div className="text-center py-4">
                      <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 ${
                        rentalResult.success ? 'bg-emerald-500/15' : 'bg-red-500/15'
                      }`}>
                        {rentalResult.success ? (
                          <CheckCircle2 size={32} className="text-emerald-400" />
                        ) : (
                          <XCircle size={32} className="text-red-400" />
                        )}
                      </div>
                      <h3 className={`text-lg font-black italic uppercase tracking-tighter mb-2 ${
                        rentalResult.success ? 'text-emerald-400' : 'text-red-400'
                      }`}>
                        {rentalResult.success ? 'TEKLİF GÖNDERİLDİ!' : 'HATA OLUŞTU'}
                      </h3>
                      <p className="text-[11px] text-white/60 leading-relaxed">{rentalResult.message}</p>
                      <button
                        onClick={() => { setRentalModalPlayer(null); setRentalResult(null); }}
                        className="mt-6 px-6 py-2.5 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all"
                      >
                        KAPAT
                      </button>
                    </div>
                  )}
                </motion.div>
              </div>
            )}
          </AnimatePresence>
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
                     {getPlayerPos(negotiatingPlayer as Record<string, unknown>)} • {localizePosFull(getPlayerPos(negotiatingPlayer as Record<string, unknown>))} • {negotiatingPlayer.age} YAŞ • {negotiatingPlayer.nation} • ⭐ {negotiatingPlayer.rating}
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

                    {/* Player Demands Box */}
                    {playerDemands && (
                      <div className="bg-amber-500/5 border border-amber-500/15 rounded-xl p-3 space-y-1.5">
                        <div className="flex items-center gap-2 mb-1">
                          <Star size={12} className="text-amber-400" />
                          <span className="text-[9px] font-black uppercase tracking-widest text-amber-400">Oyuncu Talepleri</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] text-white/40 font-bold uppercase">Minimum Haftalık Ücret</span>
                          <span className="text-[10px] font-black text-amber-300">{playerDemands.minSalary.toLocaleString('tr-TR')} €</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] text-white/40 font-bold uppercase">Minimum Sözleşme Süresi</span>
                          <span className="text-[10px] font-black text-amber-300">{playerDemands.minWeeks} hafta (~{Math.ceil(playerDemands.minWeeks / 12)} yıl)</span>
                        </div>
                        <p className="text-[8px] text-white/20 mt-1 italic">Teklifiniz oyuncunun taleplerine yakınsa anlaşma şansı artar.</p>
                      </div>
                    )}

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
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] font-black text-white/20 uppercase">€ / Hafta</span>
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

                  {/* ─── SATIN AL Button (opens ContractOfferModal) ─── */}
                  <button 
                    onClick={() => {
                      if (!negotiatingPlayer) return;
                      const listingForModal = {
                        id: `listing-${negotiatingPlayer.id}`,
                        player_id: negotiatingPlayer.id,
                        player_data: {
                          name: negotiatingPlayer.name,
                          position: negotiatingPlayer.position,
                          specific_position: (negotiatingPlayer as any).specificPosition || negotiatingPlayer.position,
                          age: negotiatingPlayer.age,
                          nation: negotiatingPlayer.nation,
                          Klt: negotiatingPlayer.rating,
                          rating: negotiatingPlayer.rating,
                          Klc: (negotiatingPlayer as any).Klc || (negotiatingPlayer as any).klc || 0,
                          Tk: (negotiatingPlayer as any).Tk || (negotiatingPlayer as any).tk || 0,
                          Pas: (negotiatingPlayer as any).Pas || (negotiatingPlayer as any).pas || 0,
                          Sut: (negotiatingPlayer as any).Sut || (negotiatingPlayer as any).sut || 0,
                          Hız: (negotiatingPlayer as any).Hız || (negotiatingPlayer as any).hiz || 0,
                        },
                        price: getEffectiveMarketValue(negotiatingPlayer),
                        seller_id: (negotiatingPlayer as any).seller_id || 'free-agent-system',
                        is_active: true,
                      };
                      setContractOfferListing(listingForModal);
                    }}
                    className="w-full py-4 rounded-[20px] text-xs font-black uppercase tracking-[0.2em] transform active:scale-95 shadow-xl transition-all bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500 hover:text-white flex items-center justify-center gap-2"
                  >
                    <Coins size={16} /> SATIN AL
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

      {/* ─── Contract Offer Modal ─── */}
      {contractOfferListing && (
        <ContractOfferModal
          listing={contractOfferListing}
          profile={profile}
          onClose={() => setContractOfferListing(null)}
          onOfferResult={(result) => {
            if (result.accepted) {
              fetchMarketPlayers();
              setContractOfferListing(null);
              setNegotiatingPlayer(null);
              setPlayerDemands(null);
            }
          }}
        />
      )}
    </div>
  );
}
