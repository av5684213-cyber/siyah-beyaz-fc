'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Globe, ShoppingCart, TrendingUp, Users, DollarSign, ArrowRight, ShieldCheck, Trophy, LayoutList, Database, Clock, Timer, Gavel, XCircle } from 'lucide-react';
import { getMarketListings, listPlayerOnMarket, buyPlayerFromMarket, getGlobalLeaderboard, MarketListing, placeBid, initFreeAgentsOnMarket, cancelAuction, AuctionBid, getAuctionBids, getMyAuctions } from '@/lib/fm/multiplayer';
import { isSupabaseConfigured, getSupabase } from '@/lib/supabase';
import { Player } from '@/lib/fm/types';
import { formatCurrency } from '@/lib/fm/valuation';
import { syncPlayerStats } from '@/lib/fm/helpers';
import { toTitleCase } from '@/lib/fm/ui-helpers';
import { useFM } from '@/lib/fm/GameContext';
import PlayerRow from './PlayerRow';

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
  const [activeSubTab, setActiveSubTab] = useState<'market' | 'auctions' | 'rankings' | 'store'>('market');
  const [myAuctions, setMyAuctions] = useState<MarketListing[]>([]);
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

  const sortedAndFilteredListings = useMemo(() => {
    const filtered = listings.filter(l => {
      const p = l.player_data;
      if (!p) return false;

      // Handle sub-positions in filtering
      if (filter.position !== 'ALL') {
        const bigPosMap: Record<string, string> = {
          'GK': 'GK',
          'CB': 'DEF', 'LB': 'DEF', 'RB': 'DEF', 'LWB': 'DEF', 'RWB': 'DEF', 'DEF': 'DEF',
          'CDM': 'MID', 'CM': 'MID', 'CAM': 'MID', 'LM': 'MID', 'RM': 'MID', 'MID': 'MID',
          'ST': 'FWD', 'LW': 'FWD', 'RW': 'FWD', 'CF': 'FWD', 'FWD': 'FWD'
        };
        const playerBigPos = bigPosMap[p.position] || p.position;
        if (playerBigPos !== filter.position) return false;
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
          setSelectedListing(null);
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
        setSelectedListing(null);
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
            onClick={() => setActiveSubTab('store')}
            className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeSubTab === 'store' ? 'bg-amber-500 text-black' : 'text-white/40 hover:text-white'}`}
          >
            Mağaza
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
                  <div className="text-[10px] font-black text-white/40 uppercase tracking-widest">
                    {sortedAndFilteredListings.length} OYUNCU BULUNDU
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-3 bg-white/5 p-4 rounded-2xl border border-white/5">
                  {/* Position Filter */}
                  <div className="space-y-1">
                    <label className="text-[8px] font-black text-white/20 uppercase">MEVKİİ</label>
                    <select 
                      value={filter.position}
                      onChange={(e) => setFilter({...filter, position: e.target.value})}
                      className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2 text-[10px] font-black uppercase text-white outline-none focus:border-emerald-500"
                    >
                      <option value="ALL">HEPSİ</option>
                      <option value="GK">KALECİ</option>
                      <option value="DEF">DEFANS</option>
                      <option value="MID">ORTA SAHA</option>
                      <option value="FWD">FORVET</option>
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
                                  {p?.position || '??'}
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
                        {p?.position || '??'}
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
        ) : (
          <motion.div key="store" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { coins: 100, price: '₺69.99', desc: 'Başlangıç Paketi', color: 'border-white/10 bg-white/5' },
                { coins: 500, price: '₺299.99', desc: 'Gümüş Paket', color: 'border-white/10 bg-white/5' },
                { coins: 1200, price: '₺599.99', desc: 'Altın Paket', color: 'border-amber-500/20 bg-amber-500/5', badge: 'POPÜLER' },
                { coins: 3000, price: '₺1299.99', desc: 'Efsanevi Paket', color: 'border-emerald-500/20 bg-emerald-500/5', badge: 'EN İYİ DEĞER' },
              ].map((pkg, i) => (
                <div 
                  key={i}
                  className={`relative p-8 rounded-[2rem] border ${pkg.color} flex flex-col items-center text-center group cursor-pointer hover:scale-[1.02] transition-all`}
                  onClick={() => alert(`Google Play Store üzerinden ${pkg.coins} MG Coin satın alma işlemi başlatılıyor...`)}
                >
                  {pkg.badge && (
                    <div className="absolute -top-3 px-3 py-1 bg-white text-black text-[8px] font-black uppercase tracking-widest rounded-full shadow-lg">
                      {pkg.badge}
                    </div>
                  )}
                  <div className="w-20 h-20 bg-amber-400 rounded-full flex items-center justify-center border-4 border-amber-600 shadow-[0_0_30px_rgba(251,191,36,0.3)] mb-6 group-hover:scale-110 transition-transform">
                    <span className="text-2xl font-black text-amber-900">MG</span>
                  </div>
                  <h4 className="text-2xl font-black italic leading-none mb-1">{pkg.coins} MG COIN</h4>
                  <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-6">{pkg.desc}</p>
                  
                  <div className="mt-auto w-full">
                    <div className="text-lg font-black font-mono text-white mb-4">{pkg.price}</div>
                    <div className="w-full py-3 bg-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest group-hover:bg-white group-hover:text-black transition-all">
                      SATIN AL
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-2 text-[8px] font-bold text-white/20 uppercase">
                    <Database size={10} /> Secure Google Play Payment
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-zinc-900/40 border border-white/5 rounded-[2rem] p-10 text-center space-y-6">
              <div className="max-w-2xl mx-auto space-y-4">
                <h3 className="text-2xl font-black italic uppercase tracking-tighter">MG COIN NEDİR?</h3>
                <p className="text-sm text-white/60 leading-relaxed">
                  MG Coin, Managerium evreninde kullanılan özel bir para birimidir. Bu paralarla transfer pazarında serbest oyuncuları kadronuza katabilir, stadyumunuzu geliştirebilir veya özel antrenman programları satın alabilirsiniz. Satın alınan coinler anında hesabınıza tanımlanır.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
