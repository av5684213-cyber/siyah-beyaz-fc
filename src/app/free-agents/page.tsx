'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Users, Search, ArrowLeft, ShoppingCart, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { isSupabaseConfigured, getSupabase } from '@/lib/supabase';
import { toTitleCase, formatPosBadge, getPosBadgeStyle, getPosGroup } from '@/lib/fm/ui-helpers';
import { sanitizeLikePattern } from '@/lib/fm/security';
import { useFM } from '@/lib/fm/GameContext';
import Link from 'next/link';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface FreeAgent {
  id: string;
  name: string;
  position: string;
  specific_position: string;
  secondary_positions: string[];
  rating: number;
  potential: number;
  age: number;
  klt: number;
  market_value: number;
  preferred_foot: string;
  speed: number;
  power: number;
  passing: number;
  shooting: number;
  defending: number;
  vision: number;
  control: number;
  heading: number;
  goalkeeping: number;
  nation: string;
  salary: number;
  is_retired: boolean;
}

export default function FreeAgentsPage() {
  const [players, setPlayers] = useState<FreeAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [posFilter, setPosFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState<'rating' | 'age' | 'value'>('rating');
  const [buyingPlayerId, setBuyingPlayerId] = useState<string | null>(null);
  const [buyResult, setBuyResult] = useState<{ success: boolean; message: string } | null>(null);

  // Modal state
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<FreeAgent | null>(null);
  const [contractWeeks, setContractWeeks] = useState(52);

  const { profile, userId, onSetProfile } = useFM();

  useEffect(() => {
    fetchFreeAgents();
  }, []);

  // Auto-dismiss buy result after 4 seconds
  useEffect(() => {
    if (buyResult) {
      const timer = setTimeout(() => setBuyResult(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [buyResult]);

  const fetchFreeAgents = async () => {
    if (!isSupabaseConfigured()) return;
    const supabase = getSupabase();
    if (!supabase) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .is('profile_id', null)
        .eq('is_for_sale', false)
        .eq('is_retired', false)
        .order('rating', { ascending: false })
        .limit(200);

      if (error) {
        console.error('Free agents fetch error:', error.message);
      } else {
        setPlayers(data || []);
      }
    } catch (err) {
      console.error('Free agents error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Modal'ı aç
  const openPurchaseModal = (player: FreeAgent) => {
    if (!userId) {
      setBuyResult({ success: false, message: 'Oturum açmanız gerekiyor.' });
      return;
    }
    setSelectedPlayer(player);
    setContractWeeks(52);
    setShowPurchaseModal(true);
  };

  // Modal'dan onayla
  const confirmPurchase = async () => {
    if (!selectedPlayer || !userId) return;

    setShowPurchaseModal(false);
    setBuyingPlayerId(selectedPlayer.id);

    const transferFee = selectedPlayer.market_value || (selectedPlayer.rating || 50) * 50000;
    const feeStr = formatCurrency(transferFee);

    try {
      const res = await fetch('/api/free-agents/buy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerId: selectedPlayer.id,
          profileId: userId,
          contractWeeks,
        }),
      });
      const data = await res.json();

      if (data.success) {
        setBuyResult({ success: true, message: `${toTitleCase(selectedPlayer.name)} kadroya katıldı! (${feeStr} €)` });
        if (profile && onSetProfile) {
          onSetProfile({ ...profile, money: data.moneyRemaining });
        }
        setPlayers(prev => prev.filter(p => p.id !== selectedPlayer.id));
      } else {
        setBuyResult({ success: false, message: data.error || 'Transfer başarısız.' });
      }
    } catch (err) {
      setBuyResult({ success: false, message: 'Bir hata oluştu.' });
    } finally {
      setBuyingPlayerId(null);
      setSelectedPlayer(null);
    }
  };

  const filtered = players.filter(p => {
    // SORUN-9 FIX: Sanitize search input for safety (defense-in-depth)
    const safeSearch = sanitizeLikePattern(search).replace(/\\%/g, '').replace(/\\_/g, '');
    if (safeSearch && !p.name.toLowerCase().includes(safeSearch.toLowerCase())) return false;
    if (posFilter !== 'ALL') {
      const group = getPosGroup(p.specific_position || p.position);
      if (group !== posFilter) return false;
    }
    return true;
  }).sort((a, b) => {
    if (sortBy === 'rating') return b.rating - a.rating;
    if (sortBy === 'age') return a.age - b.age;
    return (b.market_value || 0) - (a.market_value || 0);
  });

  const formatCurrency = (val: number) => {
    if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(1)}M`;
    if (val >= 1_000) return `${(val / 1_000).toFixed(0)}K`;
    return val.toString();
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="p-2 bg-white/5 rounded-xl hover:bg-white/10 transition-all">
              <ArrowLeft size={18} />
            </Link>
            <div>
              <h1 className="text-2xl font-black italic uppercase tracking-tighter">Serbest Oyuncular</h1>
              <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Kadro dışı oyuncular — transfer pazarından kadroya katın</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {profile && (
              <div className="text-[10px] font-black text-emerald-400/80 uppercase tracking-widest">
                Bakiye: {formatCurrency(profile.money || 0)} €
              </div>
            )}
            <div className="text-[10px] font-black text-white/30 uppercase tracking-widest">
              {filtered.length} OYUNCU
            </div>
          </div>
        </div>

        {/* Buy Result Toast */}
        {buyResult && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`flex items-center gap-3 p-4 rounded-xl border ${
              buyResult.success
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                : 'bg-red-500/10 border-red-500/20 text-red-400'
            }`}
          >
            {buyResult.success ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
            <span className="text-[11px] font-bold">{buyResult.message}</span>
          </motion.div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap gap-3 bg-zinc-900/50 p-4 rounded-2xl border border-white/5">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Oyuncu ara..."
                className="w-full bg-black/50 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-[11px] font-bold focus:outline-none focus:border-white/30"
              />
            </div>
          </div>
          <select
            value={posFilter}
            onChange={(e) => setPosFilter(e.target.value)}
            className="bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-[11px] font-bold focus:outline-none"
          >
            <option value="ALL">HEPSİ</option>
            <option value="GK">KALECİ</option>
            <option value="DEF">DEFANS</option>
            <option value="MID">ORTA SAHA</option>
            <option value="FWD">FORVET</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'rating' | 'age' | 'value')}
            className="bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-[11px] font-bold focus:outline-none"
          >
            <option value="rating">KALİTE</option>
            <option value="age">YAŞ (GENÇ)</option>
            <option value="value">DEĞER</option>
          </select>
        </div>

        {/* Player List */}
        {loading ? (
          <div className="py-20 text-center space-y-4">
            <div className="animate-spin w-8 h-8 border-2 border-white/20 border-t-white rounded-full mx-auto" />
            <p className="text-xs font-black uppercase tracking-widest text-white/40">Yükleniyor...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center space-y-4 opacity-50">
            <Users size={48} className="mx-auto" />
            <p className="text-xs font-black uppercase tracking-widest">Serbest oyuncu bulunamadı.</p>
          </div>
        ) : (
          <div className="bg-zinc-900/40 border border-white/5 rounded-[2rem] overflow-hidden">
            <div className="divide-y divide-white/5">
              {filtered.map((player, idx) => {
                const posBadge = formatPosBadge({
                  specificPosition: player.specific_position,
                  position: player.position,
                  secondaryPositions: player.secondary_positions,
                });
                const posStyle = getPosBadgeStyle(player.specific_position || player.position);
                const transferFee = player.market_value || (player.rating || 50) * 50000;
                const canAfford = (profile?.money || 0) >= transferFee;
                const isBuying = buyingPlayerId === player.id;

                return (
                  <motion.div
                    key={player.id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.01 }}
                    className="flex items-center gap-4 p-4 hover:bg-white/5 transition-colors"
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-[9px] font-black border ${posStyle}`}>
                      {posBadge}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-black italic tracking-tighter truncate">
                        {toTitleCase(player.name)}
                      </div>
                      <div className="text-[9px] text-white/30 font-bold">
                        {player.age} YAŞ • {player.nation || 'TR'} • {player.preferred_foot || 'Sağ'}
                      </div>
                    </div>
                    <div className="text-center px-3">
                      <div className="text-lg font-black text-emerald-400">{player.klt || player.rating}</div>
                      <div className="text-[7px] text-white/20 font-bold uppercase">Klt</div>
                    </div>
                    <div className="text-center px-3">
                      <div className="text-sm font-black text-white/60">{player.rating}</div>
                      <div className="text-[7px] text-white/20 font-bold uppercase">Ort</div>
                    </div>
                    <div className="text-right px-3">
                      <div className="text-[11px] font-black font-mono text-emerald-500/80">
                        {formatCurrency(player.market_value || 0)} €
                      </div>
                      <div className="text-[7px] text-white/20 font-bold uppercase">Değer</div>
                    </div>
                    <div className="text-right px-2">
                      <div className="text-[11px] font-black font-mono text-white/40">
                        {formatCurrency(player.salary || 0)} €/ay
                      </div>
                    </div>
                    {/* Buy Button */}
                    <button
                      onClick={() => openPurchaseModal(player)}
                      disabled={isBuying || !canAfford}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all ${
                        isBuying
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 opacity-70'
                          : canAfford
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30 hover:text-emerald-300'
                            : 'bg-white/5 text-white/20 border border-white/5 cursor-not-allowed'
                      }`}
                    >
                      {isBuying ? (
                        <>
                          <Loader2 size={12} className="animate-spin" />
                          Alınıyor...
                        </>
                      ) : (
                        <>
                          <ShoppingCart size={12} />
                          Kadroya Kat
                        </>
                      )}
                    </button>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        <div className="text-center text-[10px] text-white/20 font-bold uppercase tracking-widest py-4">
          Transfer pazarından serbest oyuncuları kadronuza katabilirsiniz
        </div>
      </div>

      {/* ═══ SATIN ALMA MODAL'I ═══ */}
      <Dialog open={showPurchaseModal} onOpenChange={setShowPurchaseModal}>
        <DialogContent className="bg-zinc-900 border-white/10 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-black italic uppercase tracking-tighter text-white">
              Oyuncu Transferi
            </DialogTitle>
            <DialogDescription className="text-[11px] text-white/50">
              Oyuncuyu kadronuza katmak için onaylayın.
            </DialogDescription>
          </DialogHeader>

          {selectedPlayer && (
            <div className="space-y-4 py-2">
              {/* Oyuncu Bilgileri */}
              <div className="bg-black/40 rounded-xl p-4 border border-white/5 space-y-3">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-[9px] font-black border ${getPosBadgeStyle(selectedPlayer.specific_position || selectedPlayer.position)}`}>
                    {formatPosBadge({
                      specificPosition: selectedPlayer.specific_position,
                      position: selectedPlayer.position,
                      secondaryPositions: selectedPlayer.secondary_positions,
                    })}
                  </div>
                  <div>
                    <div className="text-[13px] font-black italic tracking-tighter text-white">
                      {toTitleCase(selectedPlayer.name)}
                    </div>
                    <div className="text-[9px] text-white/30 font-bold">
                      {selectedPlayer.age} YAŞ • {selectedPlayer.nation || 'TR'} • {selectedPlayer.preferred_foot || 'Sağ'}
                    </div>
                  </div>
                </div>

                {/* İstatistikler */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-center bg-white/5 rounded-lg py-2">
                    <div className="text-lg font-black text-emerald-400">{selectedPlayer.klt || selectedPlayer.rating}</div>
                    <div className="text-[7px] text-white/20 font-bold uppercase">Kalite</div>
                  </div>
                  <div className="text-center bg-white/5 rounded-lg py-2">
                    <div className="text-sm font-black text-white/60">{selectedPlayer.rating}</div>
                    <div className="text-[7px] text-white/20 font-bold uppercase">Ortalama</div>
                  </div>
                  <div className="text-center bg-white/5 rounded-lg py-2">
                    <div className="text-sm font-black text-amber-400">{selectedPlayer.potential}</div>
                    <div className="text-[7px] text-white/20 font-bold uppercase">Potansiyel</div>
                  </div>
                </div>
              </div>

              {/* Transfer Ücreti */}
              <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3">
                <span className="text-[10px] font-black uppercase tracking-widest text-white/50">Transfer Ücreti</span>
                <span className="text-[14px] font-black font-mono text-emerald-400">
                  {formatCurrency(selectedPlayer.market_value || (selectedPlayer.rating || 50) * 50000)} €
                </span>
              </div>

              {/* Sözleşme Süresi */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/50">
                  Sözleşme Süresi (Hafta)
                </label>
                <input
                  type="range"
                  min={13}
                  max={104}
                  step={13}
                  value={contractWeeks}
                  onChange={(e) => setContractWeeks(Number(e.target.value))}
                  className="w-full accent-emerald-500"
                />
                <div className="flex justify-between text-[9px] text-white/30 font-bold">
                  <span>13 hf (3 ay)</span>
                  <span className="text-emerald-400 font-black">{contractWeeks} hafta ({Math.round(contractWeeks / 4.33)} ay)</span>
                  <span>104 hf (2 yıl)</span>
                </div>
              </div>

              {/* Bakiye Kontrolü */}
              {((profile?.money || 0) < (selectedPlayer.market_value || (selectedPlayer.rating || 50) * 50000)) && (
                <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                  <XCircle size={14} className="text-red-400 shrink-0" />
                  <span className="text-[10px] font-bold text-red-400">
                    Yetersiz bakiye! Mevcut: {formatCurrency(profile?.money || 0)} €
                  </span>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <DialogClose asChild>
              <Button
                variant="outline"
                className="bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:text-white/80 text-[10px] font-black uppercase tracking-widest"
              >
                İptal
              </Button>
            </DialogClose>
            <Button
              onClick={confirmPurchase}
              disabled={!selectedPlayer || ((profile?.money || 0) < (selectedPlayer?.market_value || (selectedPlayer?.rating || 50) * 50000))}
              className="bg-emerald-600 hover:bg-emerald-500 text-black text-[10px] font-black uppercase tracking-widest disabled:opacity-30"
            >
              <ShoppingCart size={12} className="mr-1.5" />
              Satın Al
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
