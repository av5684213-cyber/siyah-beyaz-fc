'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Globe, ShoppingCart, TrendingUp, Users, DollarSign, ArrowRight, ShieldCheck, Trophy, LayoutList, Database, Clock, Timer, Gavel, XCircle, Coins, FileText, Handshake } from 'lucide-react';
import CreditPurchaseModal from './CreditPurchaseModal';
import { getMarketListings, listPlayerOnMarket, buyPlayerFromMarket, getGlobalLeaderboard, MarketListing, placeBid, initFreeAgentsOnMarket, cancelAuction, AuctionBid, getAuctionBids, getMyAuctions } from '@/lib/fm/multiplayer';
import { isSupabaseConfigured, getSupabase } from '@/lib/supabase';
import { Player } from '@/lib/fm/types';
import { formatCurrency } from '@/lib/fm/valuation';
import { syncPlayerStats } from '@/lib/fm/helpers';
import { toTitleCase } from '@/lib/fm/ui-helpers';
import { calculateLoanFeeEuro, getInflationSummary } from '@/lib/fm/inflation';
import { useFM } from '@/lib/fm/GameContext';
import PlayerRow from './PlayerRow';
import ContractOfferModal from './ContractOfferModal';

interface MultiplayerTabProps {
  userId: string;
  profile: any;
  squad: Player[];
  onSetSquad: (squad: Player[]) => void;
  onSetProfile: (profile: any) => void;
  onPlayerClick?: (player: Player) => void;
  onListingClick?: (listing: MarketListing) => void;
  teamName: string;
  isAdmin?: boolean;
}

function AttrFilter({ label, value, onChange }: { label: string, value: any, onChange: (val: any) => void }) {
  const attrs = ['Klc', 'Tk', 'Pas', 'Sut', 'Kfa', 'Hız', 'Güç', 'Alg', 'Top'];
  return (
    <div className="space-y-1">
      <label className="text-[8px] font-black text-white/20 uppercase">{label}</label>
      <div className="flex gap-1">
        <select 
          value={value.key}
          onChange={(e) => onChange({...value, key: e.target.value})}
          className="w-[60%] bg-zinc-900 border border-white/10 rounded-lg p-2 text-[9px] font-black uppercase text-white outline-none"
        >
          {attrs.map(a => <option key={a} value={a}>{a}</option>)}
        </select>
        <input 
          type="number" 
          value={value.min}
          onChange={(e) => onChange({...value, min: Number(e.target.value)})}
          placeholder="Min"
          className="w-[40%] bg-zinc-900 border border-white/10 rounded-lg p-2 text-[9px] font-black text-white outline-none"
        />
      </div>
    </div>
  );
}

function AuctionTimer({ expiresAt }: { expiresAt?: string }) {
  const [timeLeft, setTimeLeft] = useState('');
  const [isExpired, setIsExpired] = useState(false);
  const [isUrgent, setIsUrgent] = useState(false);

  useEffect(() => {
    if (!expiresAt) return;
    const update = () => {
      const now = Date.now();
      const end = new Date(expiresAt).getTime();
      const diff = end - now;
      if (diff <= 0) {
        setIsExpired(true);
        setTimeLeft('Sona Erdi');
        return;
      }
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      if (hours > 0) setTimeLeft(`${hours}s ${minutes}dk`);
      else setTimeLeft(`${minutes}dk ${seconds}sn`);
      setIsUrgent(diff < 30 * 60 * 1000); // less than 30 min
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  if (!expiresAt) return null;

  return (
    <div className={`flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider ${
      isExpired ? 'text-red-400' : isUrgent ? 'text-amber-400 animate-pulse' : 'text-emerald-400'
    }`}>
      <Timer size={12} />
      <span>{timeLeft}</span>
    </div>
  );
}

export function MultiplayerTab({ userId, profile, squad, onSetSquad, onSetProfile, onPlayerClick, onListingClick, teamName, isAdmin }: MultiplayerTabProps) {
  const { setDirectMessageRecipient, setSelectedTeamProfile } = useFM();
  const [listings, setListings] = useState<MarketListing[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [activeSubTab, setActiveSubTab] = useState<'market' | 'auctions' | 'rankings' | 'loans'>('market');
  const [myAuctions, setMyAuctions] = useState<MarketListing[]>([]);
  const [loanPlayers, setLoanPlayers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' }>({ key: 'price', direction: 'asc' });
  const [filter, setFilter] = useState({
    position: 'ALL',
    minKlt: 0,
    maxKlt: 100,
    attr1: { key: 'Klc', min: 0, max: 100 },
    attr2: { key: 'Tk', min: 0, max: 100 },
    attr3: { key: 'Pas', min: 0, max: 100 },
  });
  const [contractListing, setContractListing] = useState<MarketListing | null>(null);
  const [contractMode, setContractMode] = useState<'free-agent' | 'auction-win' | null>(null);
  const [showCreditPurchase, setShowCreditPurchase] = useState(false);
  const [wonAuctions, setWonAuctions] = useState<MarketListing[]>([]);
  const [loanModalPlayer, setLoanModalPlayer] = useState<Player | null>(null);
  const [loanFeePercent, setLoanFeePercent] = useState(15);
  const [loanSubmitting, setLoanSubmitting] = useState(false);

  const sortedAndFilteredListings = useMemo(() => {
    const filtered = listings.filter(l => {
      const p = l.player_data;
      if (!p) return false;

      // Handle sub-positions in filtering — now supports specific_position
      if (filter.position !== 'ALL') {
        const bigPosMap: Record<string, string> = {
          'GK': 'GK',
          'CB': 'DEF', 'LB': 'DEF', 'RB': 'DEF', 'LWB': 'DEF', 'RWB': 'DEF', 'DEF': 'DEF',
          'CDM': 'MID', 'CM': 'MID', 'CAM': 'MID', 'LM': 'MID', 'RM': 'MID', 'MID': 'MID',
          'ST': 'FWD', 'LW': 'FWD', 'RW': 'FWD', 'CF': 'FWD', 'FWD': 'FWD'
        };
        // Use specific_position if available, fallback to position
        const playerPos = p.specific_position || p.position;
        // If filter is a group (GK/DEF/MID/FWD), match by group
        const filterGroup = bigPosMap[filter.position];
        if (filterGroup) {
          const playerBigPos = bigPosMap[playerPos] || playerPos;
          if (playerBigPos !== filterGroup) return false;
        } else {
          // Filter is a specific position (CB, CDM, LW etc.) — exact match
          if (playerPos !== filter.position) return false;
        }
      }

      const klt = p.Klt || p.rating;
      if (klt < filter.minKlt || klt > filter.maxKlt) return false;
      
      const checkAttr = (attr: any) => {
        const val = p[attr.key] || 0;
        return val >= attr.min && val <= attr.max;
      };

      if (!checkAttr(filter.attr1)) return false;
      if (!checkAttr(filter.attr2)) return false;
      if (!checkAttr(filter.attr3)) return false;

      return true;
    });

    return [...filtered].sort((a, b) => {
      const getVal = (item: MarketListing) => {
        const p = item.player_data;
        switch (sortConfig.key) {
          case 'Klt': return p.Klt || p.rating;
          case 'Klc': return p.Klc || 0;
          case 'Tk': return p.Tk || 0;
          case 'Pas': return p.Pas || 0;
          case 'Sut': return p.Sut || 0;
          case 'Kfa': return p.Kfa || 0;
          case 'Hız': return p.Hız || 0;
          case 'Güç': return p.Güç || 0;
          case 'Alg': return p.Alg || 0;
          case 'Top': return p.Top || 0;
          case 'Tplm': return (p.Klt || p.rating) + (p.Klc || 0) + (p.Tk || 0) + (p.Pas || 0) + (p.Sut || 0) + (p.Kfa || 0) + (p.Hız || 0) + (p.Güç || 0) + (p.Alg || 0) + (p.Top || 0);
          case 'price': return item.price;
          default: return 0;
        }
      };

      const aVal = getVal(a);
      const bVal = getVal(b);
      return sortConfig.direction === 'desc' ? bVal - aVal : aVal - bVal;
    });
  }, [listings, filter, sortConfig]);

  const toggleSort = (key: string) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'desc' ? 'asc' : 'desc'
    }));
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [marketData, rankingData] = await Promise.all([
        getMarketListings(),
        getGlobalLeaderboard()
      ]);
      
      // Sync stats and prices for market players to handle legacy/missing data
      const syncedMarket = (await Promise.all((marketData || []).map(async (listing) => {
        if (!listing.player_data) return null;
        const syncedPlayer = syncPlayerStats(listing.player_data);
        let price = listing.price;
        let maxPrice = listing.max_price;
        let minPrice = listing.min_price;
        let needsDbUpdate = false;

        // If it's a free agent and the price/corridor is legacy
        if (listing.seller_id === 'free-agent-system') {
          const mVal = syncedPlayer.market_value || 0;
          
          // Detect legacy (if max price is significantly lower than value, or just 200M hardcoded)
          if (maxPrice < mVal || maxPrice === 200000000) {
            price = Math.round(mVal * 0.92);
            minPrice = Math.round(mVal * 0.85);
            maxPrice = Math.round(mVal * 1.15);
            needsDbUpdate = true;
          }
        }

        const updatedListing = {
          ...listing,
          player_data: syncedPlayer,
          price: price,
          min_price: minPrice,
          max_price: maxPrice || Math.round(price * 1.15)
        };

        // Proactively repair the database for this free agent
        if (needsDbUpdate && isSupabaseConfigured()) {
          const supabase = getSupabase();
          if (supabase) {
            await supabase.from('transfer_market').update({
              price: price,
              min_price: minPrice,
              max_price: maxPrice,
              player_data: syncedPlayer
            }).eq('id', listing.id);
          }
        }

        return updatedListing;
      }))).filter(l => l !== null) as MarketListing[];
      
      setListings(syncedMarket);
      setLeaderboard(rankingData || []);

      if (userId) {
        const myData = await getMyAuctions(userId);
        setMyAuctions(myData || []);

        // Fetch won auctions (expired auctions where this user is the highest bidder)
        try {
          const sb = getSupabase();
          if (sb) {
            const { data: expiredWins } = await sb
              .from('transfer_market')
              .select('*')
              .eq('highest_bidder_id', userId)
              .eq('is_active', false)
              .order('created_at', { ascending: false });
            setWonAuctions((expiredWins as MarketListing[]) || []);
          }
        } catch (wonErr) {
          console.error('Won auctions fetch error:', wonErr);
        }
      }

      // Fetch loan players
      try {
        const loanRes = await fetch('/api/loans/available?profileId=' + userId);
        if (loanRes.ok) {
          const loanData = await loanRes.json();
          setLoanPlayers(loanData.players || []);
        }
      } catch (loanErr) {
        console.error('Loan fetch error:', loanErr);
      }
    } catch (err) {
      console.error('Multiplayer fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000); // 10s refresh for bidding
    return () => clearInterval(interval);
  }, []);

  const handleBuy = async (listing: MarketListing) => {
    if (profile?.money < listing.price) {
      alert('Yetersiz bütçe!');
      return;
    }

    const playerName = listing.player_data?.name || 'Bilinmeyen Oyuncu';
    if (confirm(`${playerName} oyuncusunu ${formatCurrency(listing.price)} bedelle hemen satın almak istiyor musunuz?`)) {
      setLoading(true);
      try {
        const result = await buyPlayerFromMarket(listing.id, userId, profile.team_name);
        if (result.success) {
          // Update local squad
          const newSquad = [...squad, result.player];
          onSetSquad(newSquad);
          // Update local profile money
          onSetProfile({ ...profile, money: profile.money - result.price });
          
          alert('Transfer başarıyla tamamlandı! Oyuncu kadronuza katıldı.');
          fetchData();
        } else {
          alert(`Satın alma hatası: ${result.error}`);
        }
      } catch (err) {
        console.error('Buy error:', err);
        alert('İşlem sırasında bir hata oluştu.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleLoanPlayer = async (player: Player) => {
    setLoanModalPlayer(player);
    setLoanFeePercent(15);
  };

  const handleLoanSubmit = async () => {
    if (!loanModalPlayer || !userId) return;

    if (!loanModalPlayer.id) {
      alert('Oyuncu ID bulunamadı.');
      return;
    }

    const loanFee = calculateLoanFeeEuro(
      loanModalPlayer.market_value || (loanModalPlayer.rating || 50) * 50000,
      profile?.current_day || 1
    );

    setLoanSubmitting(true);
    try {
      console.log('[MultiplayerTab Loan] Sending:', { playerId: loanModalPlayer.id, loanFee, profileId: userId });
      const res = await fetch('/api/loans/list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerId: loanModalPlayer.id,
          loanFee,
          profileId: userId,
        }),
      });
      const data = await res.json();
      console.log('[MultiplayerTab Loan] Response:', data);
      if (data.success) {
        const feeStr = loanFee >= 1_000_000 ? `${(loanFee / 1_000_000).toFixed(1)}M €` : loanFee >= 1_000 ? `${(loanFee / 1_000).toFixed(0)}K €` : `${loanFee} €`;
        alert(`${toTitleCase(loanModalPlayer.name)} kiralık listesine çıkarıldı!\n\nKiralık ücret: ${feeStr}\n10 Kredi komisyon kiracıdan alınacak.`);
        setLoanModalPlayer(null);
        // Update squad to reflect loan status
        const updatedSquad = squad.map(p =>
          p.id === loanModalPlayer.id ? { ...p, is_on_loan_market: true } : p
        );
        onSetSquad(updatedSquad);
        fetchData();
      } else {
        const debugInfo = data.debug ? `\n\nHata Ayıklama: ${JSON.stringify(data.debug)}` : '';
        alert(data.error || 'Kiralık listesine çıkarılamadı.' + debugInfo);
      }
    } catch (err) {
      console.error('[MultiplayerTab Loan] Exception:', err);
      alert('Bir hata oluştu.');
    } finally {
      setLoanSubmitting(false);
    }
  };

  const handleBid = async (listing: MarketListing) => {
    const currentPrice = listing.current_bid || listing.price;
    const bidIncrement = Math.round(listing.price * 0.02); // 2% increment
    let nextBid = currentPrice + bidIncrement;
    
    // Cap at max price
    if (nextBid >= listing.max_price) {
      nextBid = listing.max_price;
    }

    if (profile?.money < nextBid) {
      alert('Yetersiz bütçe!');
      return;
    }

    const playerName = listing.player_data?.name || 'Bilinmeyen Oyuncu';
    const confirmMsg = nextBid >= listing.max_price 
      ? `${playerName} için ${formatCurrency(nextBid)} (MAKSİMUM BEDEL) ödeyip oyuncuyu hemen almak istiyor musunuz?`
      : `${playerName} için ${formatCurrency(nextBid)} teklif vermek istiyor musunuz?`;

    if (confirm(confirmMsg)) {
      const result = await placeBid(listing.id, userId, profile.team_name, nextBid);
      if (result.success) {
        if (result.autoWin) {
          const newSquad = [...squad, result.player];
          onSetSquad(newSquad);
          onSetProfile({ ...profile, money: profile.money - result.price });
          alert('Maksimum bedel ödendi! Oyuncu kadronuza katıldı.');
        } else {
          alert('Teklifiniz başarıyla iletildi!');
        }
        fetchData();
      } else {
        alert(result.error);
      }
    }
  };

  const handleCancelAuction = async (listingId: string) => {
    if (!confirm('Bu açık artırmayı iptal etmek istediğinize emin misiniz? (Teklif yoksa iptal edilebilir)')) return;
    setLoading(true);
    try {
      const result = await cancelAuction(listingId, userId);
      if (result.success) {
        alert('Artırma iptal edildi.');
        fetchData();
      } else {
        alert(result.error || 'İptal başarısız.');
      }
    } catch (err) {
      alert('Bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="space-y-6 pb-20"
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex bg-zinc-900/50 backdrop-blur-md p-1 rounded-2xl border border-white/5 max-w-sm flex-1">
          <button 
            onClick={() => setActiveSubTab('market')}
            className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeSubTab === 'market' ? 'bg-white text-black' : 'text-white/40 hover:text-white'}`}
          >
            Transfer Pazarı
          </button>
          <button 
            onClick={() => setActiveSubTab('auctions')}
            className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeSubTab === 'auctions' ? 'bg-amber-500 text-black' : 'text-white/40 hover:text-white'}`}
          >
            Artırmalarım
          </button>
          <button 
            onClick={() => setActiveSubTab('rankings')}
            className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeSubTab === 'rankings' ? 'bg-white text-black' : 'text-white/40 hover:text-white'}`}
          >
            Sıralama
          </button>

          <button 
            onClick={() => setActiveSubTab('loans')}
            className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeSubTab === 'loans' ? 'bg-cyan-500 text-black' : 'text-white/40 hover:text-white'}`}
          >
            Kiralık
          </button>
        </div>
        
        <a 
          href="/sql-download/free_agents.sql" 
          download 
          className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all text-white/60"
        >
          <Database size={14} />
          SQL İNDİR
        </a>
      </div>

      <AnimatePresence mode="wait">
        {activeSubTab === 'market' ? (
          <motion.div 
            key="market" 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="space-y-8 bg-zinc-900/40 border border-white/5 rounded-[2rem] overflow-hidden backdrop-blur-md"
          >
              <div className="p-6 border-b border-white/5 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Globe className="text-emerald-500" size={20} />
                    <h3 className="text-sm font-black uppercase tracking-widest text-white/80">Aktif Transfer Listesi</h3>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setShowCreditPurchase(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/15 border border-amber-500/30 text-amber-400 rounded-lg text-[8px] font-black uppercase tracking-widest hover:bg-amber-500/25 hover:text-amber-300 transition-all"
                    >
                      <Coins size={12} />
                      Kredi Satın Al
                    </button>
                    <div className="text-[10px] font-black text-white/40 uppercase tracking-widest">
                      {sortedAndFilteredListings.length} OYUNCU BULUNDU
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-3 bg-white/5 p-4 rounded-2xl border border-white/5">
                  {/* Position Filter — Detaylı Pozisyon Sistemi */}
                  <div className="space-y-1">
                    <label className="text-[8px] font-black text-white/20 uppercase">MEVKİİ</label>
                    <select 
                      value={filter.position}
                      onChange={(e) => setFilter({...filter, position: e.target.value})}
                      className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2 text-[10px] font-black uppercase text-white outline-none focus:border-emerald-500"
                    >
                      <option value="ALL">HEPSİ</option>
                      <optgroup label="🏆 Kaleci">
                        <option value="GK">GK — Kaleci</option>
                      </optgroup>
                      <optgroup label="🛡️ Defans">
                        <option value="DEF">Tüm Defans</option>
                        <option value="CB">CB — Stoper</option>
                        <option value="LB">LB — Sol Bek</option>
                        <option value="RB">RB — Sağ Bek</option>
                        <option value="LWB">LWB — Sol Kanat Bek</option>
                        <option value="RWB">RWB — Sağ Kanat Bek</option>
                      </optgroup>
                      <optgroup label="⚙️ Orta Saha">
                        <option value="MID">Tüm Orta Saha</option>
                        <option value="CDM">CDM — Defansif Orta Saha</option>
                        <option value="CM">CM — Merkez Orta Saha</option>
                        <option value="CAM">CAM — Ofansif Orta Saha</option>
                        <option value="LM">LM — Sol Açık</option>
                        <option value="RM">RM — Sağ Açık</option>
                        <option value="LW">LW — Sol Kanat</option>
                        <option value="RW">RW — Sağ Kanat</option>
                      </optgroup>
                      <optgroup label="⚡ Forvet">
                        <option value="FWD">Tüm Forvet</option>
                        <option value="CF">CF — Göbek Forvet</option>
                        <option value="ST">ST — Santrfor</option>
                      </optgroup>
                    </select>
                  </div>

                  {/* Kalite Range */}
                  <div className="space-y-1">
                    <label className="text-[8px] font-black text-white/20 uppercase">KALİTE (Klt)</label>
                    <div className="flex gap-2">
                      <input 
                        type="number" 
                        value={filter.minKlt}
                        onChange={(e) => setFilter({...filter, minKlt: Number(e.target.value)})}
                        placeholder="Min"
                        className="w-1/2 bg-zinc-900 border border-white/10 rounded-lg p-2 text-[10px] font-black text-white outline-none"
                      />
                      <input 
                        type="number" 
                        value={filter.maxKlt}
                        onChange={(e) => setFilter({...filter, maxKlt: Number(e.target.value)})}
                        placeholder="Max"
                        className="w-1/2 bg-zinc-900 border border-white/10 rounded-lg p-2 text-[10px] font-black text-white outline-none"
                      />
                    </div>
                  </div>

                  {/* Attr 1 */}
                  <AttrFilter 
                    label="ÖZELLİK 1" 
                    value={filter.attr1} 
                    onChange={(val) => setFilter({...filter, attr1: val})} 
                  />
                  {/* Attr 2 */}
                  <AttrFilter 
                    label="ÖZELLİK 2" 
                    value={filter.attr2} 
                    onChange={(val) => setFilter({...filter, attr2: val})} 
                  />
                  {/* Attr 3 */}
                  <AttrFilter 
                    label="ÖZELLİK 3" 
                    value={filter.attr3} 
                    onChange={(val) => setFilter({...filter, attr3: val})} 
                  />
                </div>
              </div>

              {sortedAndFilteredListings.length === 0 ? (
                <div className="py-20 text-center space-y-4 opacity-50">
                  <Globe size={48} className="mx-auto" />
                  <p className="text-xs font-black uppercase tracking-[.2em]">Sonuç bulunamadı.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="text-[10px] font-black uppercase tracking-widest text-white/30 border-b border-white/5">
                        <th className="text-left p-4 px-6">OYUNCU</th>
                        <th onClick={() => toggleSort('Klt')} className="p-4 text-center cursor-pointer hover:text-white transition-colors">Klt {sortConfig.key === 'Klt' && (sortConfig.direction === 'desc' ? '▼' : '▲')}</th>
                        <th onClick={() => toggleSort('Klc')} className="p-4 text-center cursor-pointer hover:text-white transition-colors">Klc {sortConfig.key === 'Klc' && (sortConfig.direction === 'desc' ? '▼' : '▲')}</th>
                        <th onClick={() => toggleSort('Tk')} className="p-4 text-center cursor-pointer hover:text-white transition-colors">Tk {sortConfig.key === 'Tk' && (sortConfig.direction === 'desc' ? '▼' : '▲')}</th>
                        <th onClick={() => toggleSort('Pas')} className="p-4 text-center cursor-pointer hover:text-white transition-colors">Pas {sortConfig.key === 'Pas' && (sortConfig.direction === 'desc' ? '▼' : '▲')}</th>
                        <th onClick={() => toggleSort('Sut')} className="p-4 text-center cursor-pointer hover:text-white transition-colors">Şut {sortConfig.key === 'Sut' && (sortConfig.direction === 'desc' ? '▼' : '▲')}</th>
                        <th onClick={() => toggleSort('Kfa')} className="p-4 text-center cursor-pointer hover:text-white transition-colors">Kfa {sortConfig.key === 'Kfa' && (sortConfig.direction === 'desc' ? '▼' : '▲')}</th>
                        <th onClick={() => toggleSort('Hız')} className="p-4 text-center cursor-pointer hover:text-white transition-colors">Hız {sortConfig.key === 'Hız' && (sortConfig.direction === 'desc' ? '▼' : '▲')}</th>
                        <th onClick={() => toggleSort('Güç')} className="p-4 text-center cursor-pointer hover:text-white transition-colors">Güç {sortConfig.key === 'Güç' && (sortConfig.direction === 'desc' ? '▼' : '▲')}</th>
                        <th onClick={() => toggleSort('Alg')} className="p-4 text-center cursor-pointer hover:text-white transition-colors">Alg {sortConfig.key === 'Alg' && (sortConfig.direction === 'desc' ? '▼' : '▲')}</th>
                        <th onClick={() => toggleSort('Top')} className="p-4 text-center cursor-pointer hover:text-white transition-colors">Top {sortConfig.key === 'Top' && (sortConfig.direction === 'desc' ? '▼' : '▲')}</th>
                        <th onClick={() => toggleSort('Tplm')} className="p-4 text-center cursor-pointer hover:text-white transition-colors">Tplm {sortConfig.key === 'Tplm' && (sortConfig.direction === 'desc' ? '▼' : '▲')}</th>
                        <th onClick={() => toggleSort('price')} className="p-4 text-right cursor-pointer hover:text-white transition-colors">BEDEL {sortConfig.key === 'price' && (sortConfig.direction === 'desc' ? '▼' : '▲')}</th>
                        <th className="p-4 text-right">TEKLİF</th>
                        <th className="p-4 text-center">SÜRE</th>
                        <th className="p-4 text-center">DURUM</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {sortedAndFilteredListings.map((listing) => {
                        const p = listing.player_data;
                        const totalStats = (p.Klt || p.rating) + (p.Klc || 0) + (p.Tk || 0) + (p.Pas || 0) + (p.Sut || 0) + (p.Kfa || 0) + (p.Hız || 0) + (p.Güç || 0) + (p.Alg || 0) + (p.Top || 0);
                        return (
                          <motion.tr 
                            key={listing.id}
                            layoutId={listing.id}
                            onClick={() => onListingClick?.(listing)}
                            className="group hover:bg-white/5 transition-colors cursor-pointer text-[11px] font-bold"
                          >
                            <td className="p-4 px-6">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-zinc-800 rounded-lg flex items-center justify-center text-[10px] font-black italic border border-white/10 group-hover:bg-emerald-500 group-hover:text-black transition-colors">
                                  {p?.specific_position || p?.position || '??'}
                                </div>
                                <div>
                                  <div className="text-[13px] font-black italic tracking-tighter truncate max-w-[120px]">{toTitleCase(p?.name)}
                                    {listing.is_auction && (
                                      <span className="ml-1 px-1 py-px rounded text-[6px] font-black uppercase bg-amber-500/20 text-amber-400 border border-amber-500/20">
                                        ARTIRMA
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-[8px] font-black text-white/30 uppercase tracking-widest truncate max-w-[120px]">
                                    {listing.seller_id === 'free-agent-system' ? 'SERBEST OYUNCU' : (
                                      <>
                                        {toTitleCase(listing.seller_name || '')}
                                        {listing.seller_name && listing.seller_name !== profile?.team_name && (
                                          <span className="ml-1 text-cyan-400/50">🤖</span>
                                        )}
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="p-3 text-center text-emerald-400 font-black">{p?.Klt || p?.rating || 0}</td>
                            <td className="p-3 text-center text-white/60">{p?.Klc || 0}</td>
                            <td className="p-3 text-center text-white/60">{p?.Tk || 0}</td>
                            <td className="p-3 text-center text-white/60">{p?.Pas || 0}</td>
                            <td className="p-3 text-center text-white/60">{p?.Sut || 0}</td>
                            <td className="p-3 text-center text-white/60">{p?.Kfa || 0}</td>
                            <td className="p-3 text-center text-white/60">{p?.Hız || 0}</td>
                            <td className="p-3 text-center text-white/60">{p?.Güç || 0}</td>
                            <td className="p-3 text-center text-white/60">{p?.Alg || 0}</td>
                            <td className="p-3 text-center text-white/60">{p?.Top || 0}</td>
                            <td className="p-3 text-center font-black">{totalStats}</td>
                            <td className="p-3 text-right text-emerald-500/80 font-mono text-[10px]">{formatCurrency(listing.price)}</td>
                            <td className="p-3 text-right font-mono text-[10px]">
                              {listing.is_auction ? (
                                <div>
                                  <div className={listing.current_bid ? 'text-amber-400' : 'text-white/40'}>
                                    {listing.current_bid ? formatCurrency(listing.current_bid) : 'Henüz teklif yok'}
                                  </div>
                                  {listing.bid_count && listing.bid_count > 0 && (
                                    <div className="text-[8px] text-white/20">{listing.bid_count} teklif</div>
                                  )}
                                </div>
                              ) : (
                                <span className="text-emerald-500/80">{formatCurrency(listing.price)}</span>
                              )}
                            </td>
                            <td className="p-3 text-center">
                              {listing.is_auction ? <AuctionTimer expiresAt={listing.expires_at} /> : <span className="text-[9px] text-white/20">—</span>}
                            </td>
                            <td className="p-3 text-center">
                              {listing.is_auction ? (
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleBid(listing); }}
                                  disabled={listing.seller_id === userId || loading}
                                  className={`px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-wider transition-all ${
                                    listing.seller_id === userId 
                                      ? 'bg-white/5 text-white/20 cursor-not-allowed' 
                                      : 'bg-amber-500/20 text-amber-400 border border-amber-500/30 hover:bg-amber-500/30 hover:text-amber-300'
                                  }`}
                                >
                                  <Gavel size={10} className="inline mr-1" />
                                  Teklif Ver
                                </button>
                              ) : listing.seller_id === 'free-agent-system' ? (
                                <button
                                  onClick={(e) => { e.stopPropagation(); setContractListing(listing); setContractMode('free-agent'); }}
                                  disabled={loading}
                                  className="px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30 hover:text-emerald-300 transition-all"
                                >
                                  <FileText size={10} className="inline mr-1" />
                                  Sozlesme Teklifi
                                </button>
                              ) : (
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleBuy(listing); }}
                                  disabled={loading}
                                  className="px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30 hover:text-emerald-300 transition-all"
                                >
                                  Satın Al
                                </button>
                              )}
                            </td>
                          </motion.tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* ── KİRALIK LİSTESİNE GÖNDER BÖLÜMÜ ── */}
              <div className="mt-6 border-t border-white/5">
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Globe className="text-cyan-500" size={16} />
                    <h4 className="text-[11px] font-black uppercase tracking-widest text-white/60">Kiralık Listesine Gönder</h4>
                  </div>
                  <div className="text-[9px] text-white/25 uppercase tracking-widest">
                    {squad.filter(p => !p.is_injured && !(p as any).is_on_loan_market && !(p as any).loan_status).length} UYGun OYUNCU
                  </div>
                </div>
                <div className="px-4 pb-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-white/10">
                    {squad
                      .filter(p => !p.is_injured && !(p as any).is_on_loan_market && !(p as any).loan_status)
                      .map(player => {
                        const loanFee = calculateLoanFeeEuro(
                          player.market_value || (player.rating || 50) * 50000,
                          profile?.current_day || 1
                        );
                        const feeStr = loanFee >= 1_000_000 ? `${(loanFee / 1_000_000).toFixed(1)}M €` : loanFee >= 1_000 ? `${(loanFee / 1_000).toFixed(0)}K €` : `${loanFee} €`;
                        const posColor = (() => {
                          const pos = player.specificPosition || player.position;
                          if (pos === 'GK') return 'border-yellow-500/30 bg-yellow-500/5';
                          if (['CB','LB','RB','LWB','RWB'].includes(pos || '')) return 'border-blue-500/30 bg-blue-500/5';
                          if (['CDM','CM','CAM','LM','RM','LW','RW'].includes(pos || '')) return 'border-green-500/30 bg-green-500/5';
                          return 'border-red-500/30 bg-red-500/5';
                        })();
                        return (
                          <div
                            key={player.id}
                            className={`flex items-center gap-2 p-2 rounded-lg border ${posColor} hover:border-cyan-500/50 transition-all group/loan`}
                          >
                            <div className="w-8 h-8 rounded-md flex items-center justify-center text-[8px] font-black bg-black/30 shrink-0">
                              {player.specificPosition || player.position}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-[10px] font-black truncate">{toTitleCase(player.name)}</div>
                              <div className="text-[8px] text-white/30">Klt {player.rating} • {feeStr}</div>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleLoanPlayer(player);
                              }}
                              className="shrink-0 px-2 py-1 rounded-md text-[7px] font-black uppercase tracking-wider bg-cyan-500/15 text-cyan-400 border border-cyan-500/25 hover:bg-cyan-500 hover:text-white transition-all opacity-60 group-hover/loan:opacity-100"
                              title="Kiralık Olarak Gönder"
                            >
                              <Globe size={10} className="inline mr-0.5" />
                              Kiralık
                            </button>
                          </div>
                        );
                      })}
                    {squad.filter(p => !p.is_injured && !(p as any).is_on_loan_market && !(p as any).loan_status).length === 0 && (
                      <div className="col-span-full py-6 text-center text-[10px] text-white/20 uppercase">
                        Kiralığa gönderilecek uygun oyuncu yok
                      </div>
                    )}
                  </div>
                </div>
              </div>
          </motion.div>
        ) : activeSubTab === 'auctions' ? (
          <motion.div key="auctions" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
            className="bg-zinc-900/40 border border-white/5 rounded-[2rem] overflow-hidden backdrop-blur-md">
            <div className="p-6 border-b border-white/5">
              <div className="flex items-center gap-3">
                <Gavel className="text-amber-500" size={20} />
                <h3 className="text-sm font-black uppercase tracking-widest text-white/80">Açık Artırmalarım</h3>
              </div>
            </div>
            {myAuctions.length === 0 ? (
              <div className="py-20 text-center space-y-4 opacity-50">
                <Gavel size={48} className="mx-auto" />
                <p className="text-xs font-black uppercase tracking-[.2em]">Aktif artırmanız yok.</p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {myAuctions.map(listing => {
                  const p = listing.player_data;
                  return (
                    <div key={listing.id} className="p-4 flex items-center gap-4">
                      <div className="w-10 h-10 bg-zinc-800 rounded-xl flex items-center justify-center text-[10px] font-black border border-white/10">
                        {p?.specific_position || p?.position || '??'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[13px] font-black italic tracking-tighter truncate">{toTitleCase(p?.name)}</div>
                        <div className="text-[9px] text-white/30">
                          Başlangıç: {formatCurrency(listing.starting_price || listing.price)}
                          {listing.current_bid && ` | En Yüksek: ${formatCurrency(listing.current_bid)}`}
                          {listing.bid_count && ` | ${listing.bid_count} teklif`}
                        </div>
                      </div>
                      <AuctionTimer expiresAt={listing.expires_at} />
                      {!listing.bid_count && (
                        <button
                          onClick={() => handleCancelAuction(listing.id)}
                          className="px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-wider bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition-all"
                        >
                          <XCircle size={10} className="inline mr-1" />
                          İptal
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Won Auctions - Contract Signing Section */}
            {wonAuctions.length > 0 && (
              <div className="mt-6 border-t border-white/5">
                <div className="p-6 border-b border-white/5">
                  <div className="flex items-center gap-3">
                    <Handshake className="text-emerald-500" size={20} />
                    <div>
                      <h4 className="text-sm font-black uppercase tracking-widest text-white/80">Kazanilan Artirmalar</h4>
                      <p className="text-[9px] text-white/30 uppercase tracking-widest">Sozlesme imzalamak icin tiklayin</p>
                    </div>
                  </div>
                </div>
                <div className="divide-y divide-white/5">
                  {wonAuctions.map(listing => {
                    const p = listing.player_data;
                    const bidAmount = listing.current_bid || listing.price;
                    const penaltyAmount = Math.round(bidAmount * 0.05);
                    return (
                      <div key={listing.id} className="p-4 flex items-center gap-4">
                        <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-[10px] font-black border border-emerald-500/20 text-emerald-400">
                          {p?.specific_position || p?.position || '??'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[13px] font-black italic tracking-tighter truncate">{toTitleCase(p?.name)}</div>
                          <div className="text-[9px] text-white/30">
                            Kazandiginiz Teklif: {formatCurrency(bidAmount)}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => { setContractListing(listing); setContractMode('auction-win'); }}
                            className="px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30 hover:text-emerald-300 transition-all flex items-center gap-1"
                          >
                            <FileText size={10} />
                            Sozlesme Imzala
                          </button>
                          <button
                            onClick={async () => {
                              if (!confirm(`Vazgecerseniz teklif bedelinin %5'i (${formatCurrency(penaltyAmount)}) saticiya tazminat olarak odenecektir. Emin misiniz?`)) return;
                              try {
                                const res = await fetch('/api/contract-offer', {
                                  method: 'PUT',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({
                                    listingId: listing.id,
                                    playerId: listing.player_id,
                                    buyerId: userId,
                                    giveUp: true,
                                    auctionBidAmount: bidAmount,
                                  }),
                                });
                                const data = await res.json();
                                if (data.gaveUp) {
                                  alert(`Vazgecildi. ${formatCurrency(data.penalty)} tazminat odediniz.`);
                                  onSetProfile({ ...profile, money: profile.money - data.penalty });
                                  fetchData();
                                } else {
                                  alert(data.reason || 'Islem basarisiz.');
                                }
                              } catch (err) {
                                alert('Bir hata olustu.');
                              }
                            }}
                            className="px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-wider bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 hover:text-red-300 transition-all flex items-center gap-1"
                          >
                            <XCircle size={10} />
                            Vazgec
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </motion.div>
        ) : activeSubTab === 'rankings' ? (
          <motion.div key="rankings" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="bg-zinc-900 border border-white/5 rounded-[2.5rem] overflow-hidden">
             <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center border border-amber-500/20">
                      <Trophy className="text-amber-500" size={24} />
                   </div>
                   <div>
                      <h3 className="text-xl font-black italic uppercase tracking-tighter">Dünya Sıralaması</h3>
                      <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest text-emerald-400">En Hazır Kulüpler</p>
                   </div>
                </div>
                <div className="text-right">
                   <span className="text-[10px] font-black uppercase tracking-widest bg-white/5 px-2 py-1 rounded-lg">{leaderboard.length} AKTİF MENAJER</span>
                </div>
             </div>

             <div className="divide-y divide-white/5">
                {leaderboard.map((user, idx) => (
                   <div 
                    key={user.id} 
                    onClick={() => setSelectedTeamProfile(user.team_name)}
                    className={`flex items-center gap-4 p-5 hover:bg-white/5 transition-all cursor-pointer group ${user.id === userId ? 'bg-white/5' : ''}`}
                  >
                      <div className="w-8 text-center text-xs font-black text-white/20 group-hover:text-amber-400 transition-colors">#{idx + 1}</div>
                      <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center border border-white/10">
                         <ShieldCheck className={idx < 3 ? 'text-amber-400' : 'text-white/40'} size={18} />
                      </div>
                      <div className="flex-1">
                         <div className="text-sm font-black italic tracking-tighter">{toTitleCase(user.team_name)}</div>
                         <div className="text-[10px] font-bold text-white/30 uppercase tracking-widest">{user.id === userId ? 'SENİN TAKIMIN' : 'RAKİP'}</div>
                      </div>
                      <div className="text-right">
                         <div className="text-sm font-black font-mono text-emerald-400">{formatCurrency(user.money)}</div>
                         <div className="text-[9px] font-bold text-white/20 uppercase tracking-widest">BÜTÇE</div>
                      </div>
                   </div>
                ))}
             </div>
          </motion.div>

        ) : activeSubTab === 'loans' ? (
          <motion.div key="loans" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="space-y-4">
            {/* Kiralık Oyuncular Listesi */}
            <div className="bg-zinc-900/40 border border-white/5 rounded-[2rem] overflow-hidden backdrop-blur-md">
              <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Globe className="text-cyan-500" size={20} />
                  <h3 className="text-sm font-black uppercase tracking-widest text-white/80">Kiralık Oyuncular</h3>
                </div>
                <div className="text-[10px] font-black text-white/40 uppercase tracking-widest">
                  {loanPlayers.length} OYUNCU MEVCUT
                </div>
              </div>
              {loanPlayers.length === 0 ? (
                <div className="py-20 text-center space-y-4 opacity-50">
                  <Globe size={48} className="mx-auto" />
                  <p className="text-xs font-black uppercase tracking-[.2em]">Kiralık oyuncu bulunmuyor.</p>
                  <p className="text-[10px] text-white/30">Diğer takımlar oyuncularını kiralık pazara çıkardığında burada görünecek.</p>
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {loanPlayers.map((lp: any) => {
                    const p = lp;
                    const loanFee = calculateLoanFeeEuro(p.market_value || (p.rating || 50) * 50000, profile?.current_day || 1);
                    const feeStr = loanFee >= 1_000_000 ? `${(loanFee / 1_000_000).toFixed(1)}M €` : loanFee >= 1_000 ? `${(loanFee / 1_000).toFixed(0)}K €` : `${loanFee} €`;
                    return (
                      <div key={lp.id} className="p-4 flex items-center gap-4 hover:bg-white/5 transition-colors">
                        <div className="w-10 h-10 bg-cyan-500/10 rounded-xl flex items-center justify-center text-[10px] font-black border border-cyan-500/20 text-cyan-400">
                          {p.specific_position || p.position || '??'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[13px] font-black italic tracking-tighter truncate">{toTitleCase(p.name)}</div>
                          <div className="text-[9px] text-white/30">
                            {toTitleCase(p.team_name || 'Bilinmeyen')} • {p.age} YAŞ • Klt {p.klt || p.rating || 0}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-[11px] font-black text-cyan-400">{feeStr}</div>
                          <div className="text-[8px] text-white/20 uppercase">Kiralık Ücret (Euro)</div>
                        </div>
                        <button
                          onClick={async () => {
                            if (!confirm(`${toTitleCase(p.name)} oyuncusunu ${feeStr} + 10 Kredi karşılığında kiralamak istiyor musunuz?\n\n• ${feeStr} oyuncu sahibine ödenecek\n• 10 Kredi sistem komisyonu olarak düşülecek`)) return;
                            try {
                              const res = await fetch('/api/loans/request', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ playerId: lp.id, profileId: userId }),
                              });
                              const data = await res.json();
                              if (data.success) {
                                alert(`Oyuncu başarıyla kiralandı!\n• ${data.loanFeeEuroFormatted || ''} oyuncu sahibine ödendi\n• 10 Kredi sistem komisyonu düşüldü\nSezon sonunda oyuncu geri dönecek.`);
                                fetchData();
                              } else {
                                alert(data.error || 'Kiralama başarısız.');
                              }
                            } catch (err) {
                              alert('Bir hata oluştu.');
                            }
                          }}
                          className="px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-wider bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/30 hover:text-cyan-300 transition-all"
                        >
                          Kirala (10 KR + Euro)
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Kendi kadromdan kiralığa gönderme (Kiralık sekmesinde de göster) */}
            <div className="bg-zinc-900/40 border border-white/5 rounded-[2rem] overflow-hidden backdrop-blur-md">
              <div className="p-4 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Globe className="text-cyan-400" size={16} />
                  <h4 className="text-[11px] font-black uppercase tracking-widest text-white/60">Kiralık Listesine Gönder</h4>
                </div>
                <div className="text-[9px] text-white/25 uppercase tracking-widest">
                  {squad.filter(p => !p.is_injured && !(p as any).is_on_loan_market && !(p as any).loan_status).length} UYGUN OYUNCU
                </div>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-white/10">
                  {squad
                    .filter(p => !p.is_injured && !(p as any).is_on_loan_market && !(p as any).loan_status)
                    .map(player => {
                      const loanFee = calculateLoanFeeEuro(
                        player.market_value || (player.rating || 50) * 50000,
                        profile?.current_day || 1
                      );
                      const feeStr = loanFee >= 1_000_000 ? `${(loanFee / 1_000_000).toFixed(1)}M €` : loanFee >= 1_000 ? `${(loanFee / 1_000).toFixed(0)}K €` : `${loanFee} €`;
                      const posColor = (() => {
                        const pos = player.specificPosition || player.position;
                        if (pos === 'GK') return 'border-yellow-500/30 bg-yellow-500/5';
                        if (['CB','LB','RB','LWB','RWB'].includes(pos || '')) return 'border-blue-500/30 bg-blue-500/5';
                        if (['CDM','CM','CAM','LM','RM','LW','RW'].includes(pos || '')) return 'border-green-500/30 bg-green-500/5';
                        return 'border-red-500/30 bg-red-500/5';
                      })();
                      return (
                        <div
                          key={player.id}
                          className={`flex items-center gap-2 p-2.5 rounded-lg border ${posColor} hover:border-cyan-500/50 transition-all group/loan`}
                        >
                          <div className="w-9 h-9 rounded-lg flex items-center justify-center text-[9px] font-black bg-black/30 shrink-0">
                            {player.specificPosition || player.position}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-[10px] font-black truncate">{toTitleCase(player.name)}</div>
                            <div className="text-[8px] text-white/30">Klt {player.rating} • {feeStr}</div>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleLoanPlayer(player);
                            }}
                            className="shrink-0 px-2.5 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-wider bg-cyan-500/15 text-cyan-400 border border-cyan-500/25 hover:bg-cyan-500 hover:text-white transition-all"
                            title="Kiralık Olarak Gönder"
                          >
                            <Globe size={10} className="inline mr-0.5" />
                            Kiralık Gönder
                          </button>
                        </div>
                      );
                    })}
                  {squad.filter(p => !p.is_injured && !(p as any).is_on_loan_market && !(p as any).loan_status).length === 0 && (
                    <div className="col-span-full py-8 text-center text-[10px] text-white/20 uppercase">
                      Kiralığa gönderilecek uygun oyuncu yok
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* Contract Offer Modal */}
      {contractListing && contractMode && (
        <ContractOfferModal
          listing={contractListing}
          profile={profile}
          isAuctionWin={contractMode === 'auction-win'}
          auctionBidAmount={contractMode === 'auction-win' ? (contractListing.current_bid || contractListing.price) : undefined}
          onClose={() => { setContractListing(null); setContractMode(null); }}
          onOfferResult={(result) => {
            if (result.accepted) {
              const newSquad = [...squad, result.player];
              onSetSquad(newSquad);
              // Update credits and money
              const updatedProfile = { ...profile };
              updatedProfile.credits = (profile.credits || 0) - (result.signingFee || 0);
              if (contractMode === 'free-agent') {
                updatedProfile.money = profile.money - contractListing.price;
              }
              onSetProfile(updatedProfile);
              alert('Sozlesme basariyla imzalandi! Oyuncu kadronuza katildi.');
              fetchData();
            }
            setContractListing(null);
            setContractMode(null);
          }}
        />
      )}

      {/* Credit Purchase Modal */}
      {showCreditPurchase && (
        <CreditPurchaseModal
          currentCredits={profile?.credits || 0}
          userId={userId}
          onClose={() => setShowCreditPurchase(false)}
          onPurchase={(credits) => {
            if (profile) {
              const updatedProfile = { ...profile, credits: (profile.credits || 0) + credits };
              onSetProfile(updatedProfile);
            }
          }}
        />
      )}

      {/* ── KİRALIK LİSTESİNE GÖNDER MODALI ── */}
      {loanModalPlayer && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          onClick={() => setLoanModalPlayer(null)}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="bg-zinc-900 border border-white/10 rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-cyan-500/15 rounded-xl flex items-center justify-center text-sm font-black border border-cyan-500/30 text-cyan-400">
                {loanModalPlayer.specificPosition || loanModalPlayer.position}
              </div>
              <div>
                <h3 className="text-lg font-black">{toTitleCase(loanModalPlayer.name)}</h3>
                <div className="text-xs text-white/40">
                  Klt {loanModalPlayer.rating} • {loanModalPlayer.age} YAŞ • {loanModalPlayer.specificPosition || loanModalPlayer.position}
                </div>
              </div>
            </div>

            {/* Bilgi kutusu */}
            <div className="bg-cyan-500/5 border border-cyan-500/15 rounded-xl p-3 mb-4 space-y-1.5">
              <div className="flex items-center gap-2 text-[10px] text-cyan-300/80">
                <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full shrink-0" />
                Kiralık ücret: Oyuncu piyasasına göre otomatik hesaplanır
              </div>
              <div className="flex items-center gap-2 text-[10px] text-cyan-300/80">
                <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full shrink-0" />
                10 Kredi komisyon kiracıdan alınır
              </div>
              <div className="flex items-center gap-2 text-[10px] text-cyan-300/80">
                <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full shrink-0" />
                Kiralık ücret (Euro) oyuncu sahibine ödenir
              </div>
              <div className="flex items-center gap-2 text-[10px] text-cyan-300/80">
                <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full shrink-0" />
                Sezon sonunda oyuncu otomatik olarak geri döner
              </div>
            </div>

            {/* Hesaplanan ücret */}
            {(() => {
              const fee = calculateLoanFeeEuro(
                loanModalPlayer.market_value || (loanModalPlayer.rating || 50) * 50000,
                profile?.current_day || 1
              );
              const feeStr = fee >= 1_000_000 ? `${(fee / 1_000_000).toFixed(1)}M €` : fee >= 1_000 ? `${(fee / 1_000).toFixed(0)}K €` : `${fee} €`;
              return (
                <div className="bg-white/5 border border-white/10 rounded-xl p-3 mb-4 text-center">
                  <div className="text-[8px] font-black text-white/30 uppercase tracking-widest mb-1">Hesaplanan Kiralık Ücret</div>
                  <div className="text-xl font-black text-cyan-400">{feeStr}</div>
                  <div className="text-[8px] text-white/20 mt-1">
                    Piyasa değeri: {(() => {
                      const mv = loanModalPlayer.market_value || (loanModalPlayer.rating || 50) * 50000;
                      return mv >= 1_000_000 ? `${(mv / 1_000_000).toFixed(1)}M €` : mv >= 1_000 ? `${(mv / 1_000).toFixed(0)}K €` : `${mv} €`;
                    })()} × 15% × enflasyon
                  </div>
                </div>
              );
            })()}

            {/* Butonlar */}
            <div className="flex gap-3">
              <button
                onClick={() => setLoanModalPlayer(null)}
                className="flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-white/5 border border-white/10 text-white/50 hover:text-white hover:bg-white/10 transition-all"
              >
                İptal
              </button>
              <button
                onClick={handleLoanSubmit}
                disabled={loanSubmitting}
                className="flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loanSubmitting ? 'Gönderiliyor...' : 'Kiralık Listesine Gönder'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
}
