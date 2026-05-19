'use client';

import React, { useState, useMemo } from 'react';
import { useDraggableModal } from '@/hooks/useDraggableModal';
import { motion, AnimatePresence } from 'motion/react';
import { X, FileText, Euro, Coins, Calendar, AlertTriangle, CheckCircle2, XCircle, Loader2, Handshake } from 'lucide-react';
import { MarketListing } from '@/lib/fm/multiplayer';
import { toTitleCase } from '@/lib/fm/ui-helpers';
import { getPosBadgeStyle, getPosColor, localizePosFull } from '@/lib/fm/ui-helpers';

// ── Player Demands Generator ──────────────────────────────────────────
interface PlayerDemands {
  minWeeklySalary: number;
  maxWeeklySalary: number;
  minSigningFee: number;
  maxSigningFee: number;
}

function generatePlayerDemands(rating: number): PlayerDemands {
  if (rating >= 90) {
    return {
      minWeeklySalary: 600000,
      maxWeeklySalary: 1000000,
      minSigningFee: 30,
      maxSigningFee: 50,
    };
  } else if (rating >= 80) {
    return {
      minWeeklySalary: 300000,
      maxWeeklySalary: 600000,
      minSigningFee: 15,
      maxSigningFee: 30,
    };
  } else if (rating >= 70) {
    return {
      minWeeklySalary: 150000,
      maxWeeklySalary: 300000,
      minSigningFee: 8,
      maxSigningFee: 15,
    };
  } else {
    return {
      minWeeklySalary: 50000,
      maxWeeklySalary: 150000,
      minSigningFee: 3,
      maxSigningFee: 8,
    };
  }
}

function formatEuro(val: number): string {
  if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(1)}M`;
  if (val >= 1_000) return `${(val / 1_000).toFixed(0)}K`;
  return `${Math.round(val)}`;
}

// ── Props ─────────────────────────────────────────────────────────────
interface ContractOfferModalProps {
  listing: MarketListing;
  profile: any;
  onClose: () => void;
  onOfferResult: (result: { accepted: boolean; player?: any; reason?: string; signingFee?: number; weeklySalary?: number; contractWeeks?: number }) => void;
  /** If this is for an auction win, show "Sign Contract" flow instead of "Make Offer" */
  isAuctionWin?: boolean;
  auctionBidAmount?: number;
}

export default function ContractOfferModal({
  listing,
  profile,
  onClose,
  onOfferResult,
  isAuctionWin = false,
  auctionBidAmount,
}: ContractOfferModalProps) {
  const p = listing.player_data;
  const rating = p?.Klt || p?.rating || 60;

  const demands = useMemo(() => generatePlayerDemands(rating), [rating]);

  const [weeklySalary, setWeeklySalary] = useState<number>(Math.round((demands.minWeeklySalary + demands.maxWeeklySalary) / 2));
  const [contractWeeks, setContractWeeks] = useState<number>(17);
  const [signingFee, setSigningFee] = useState<number>(Math.round((demands.minSigningFee + demands.maxSigningFee) / 2));
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ accepted: boolean; reason?: string } | null>(null);

  const canAfford = profile
    ? (isAuctionWin
        ? profile.credits >= signingFee
        : profile.credits >= signingFee && profile.money >= listing.price)
    : false;

  const handleSubmit = async () => {
    if (!canAfford || submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/contract-offer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listingId: listing.id,
          playerId: listing.player_id,
          buyerId: profile.id,
          buyerTeam: profile.team_name,
          weeklySalary,
          contractWeeks,
          signingFee,
          isAuctionWin,
          auctionBidAmount,
          playerRating: rating,
        }),
      });
      const data = await res.json();
      setResult({ accepted: data.accepted, reason: data.reason });
      if (data.accepted) {
        onOfferResult({
          accepted: true,
          player: data.player,
          signingFee,
          weeklySalary,
          contractWeeks,
        });
      }
    } catch (err) {
      console.error('Contract offer error:', err);
      setResult({ accepted: false, reason: 'Bir hata oluştu.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSignAuction = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/contract-offer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listingId: listing.id,
          playerId: listing.player_id,
          buyerId: profile.id,
          buyerTeam: profile.team_name,
          weeklySalary,
          contractWeeks,
          signingFee,
          isAuctionWin: true,
          auctionBidAmount,
          playerRating: rating,
        }),
      });
      const data = await res.json();
      setResult({ accepted: data.accepted, reason: data.reason });
      if (data.accepted) {
        onOfferResult({
          accepted: true,
          player: data.player,
          signingFee,
          weeklySalary,
          contractWeeks,
        });
      }
    } catch (err) {
      console.error('Contract sign error:', err);
      setResult({ accepted: false, reason: 'Bir hata oluştu.' });
    } finally {
      setSubmitting(false);
    }
  };

  const totalSalaryCost = weeklySalary * contractWeeks;

  const { modalRef, handleRef, position, isDragging } = useDraggableModal();

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          ref={modalRef}
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="bg-zinc-900 border border-white/10 rounded-[2rem] w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl relative"
          onClick={(e) => e.stopPropagation()}
          style={{ transform: `translate(${position.x}px, ${position.y}px)`, userSelect: isDragging ? 'none' : 'auto' }}
        >
          {/* Drag Handle */}
          <div
            ref={handleRef}
            className="flex items-center justify-center px-4 py-1 bg-zinc-900 border-b border-white/[0.04] cursor-grab active:cursor-grabbing hover:bg-zinc-800/50 transition-colors select-none rounded-t-[2rem]"
            title="Sürüklemek için tutun · Çift tıklayın: sıfırla"
          >
            <div className="flex items-center gap-2 text-white/20">
              <div className="w-10 h-1 rounded-full bg-white/15" />
              <span className="text-[7px] font-black uppercase tracking-[0.2em]">sürükle</span>
              <div className="w-10 h-1 rounded-full bg-white/15" />
            </div>
          </div>

          {/* Header */}
          <div className="p-6 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/20">
                <Handshake className="text-emerald-500" size={20} />
              </div>
              <div>
                <h3 className="text-sm font-black uppercase tracking-widest text-white/80">
                  {isAuctionWin ? 'Sozlesme Imzala' : 'Sozlesme Teklifi Yap'}
                </h3>
                <p className="text-[10px] text-white/30 uppercase tracking-widest">
                  {isAuctionWin ? 'Artirma kazanimi icin sozlesme imzalayin' : 'Serbest oyuncu icin sozlesme teklifi'}
                </p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-all">
              <X size={16} className="text-white/40" />
            </button>
          </div>

          {/* Player Info Card */}
          <div className="p-6 border-b border-white/5">
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-[12px] font-black italic border ${getPosBadgeStyle(p?.specific_position || p?.position || 'MID')}`}>
                {p?.specific_position || p?.position || '??'}
              </div>
              <div className="flex-1">
                <div className="text-lg font-black italic tracking-tighter">{toTitleCase(p?.name)}</div>
                <div className="text-[10px] text-white/40 uppercase tracking-widest">
                  {localizePosFull(p?.specific_position || p?.position)} • {p?.age || '?'} Yas • {toTitleCase(p?.nation || '')}
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-black text-emerald-400">{rating}</div>
                <div className="text-[8px] text-white/30 uppercase tracking-widest">Klt</div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-5 gap-2 mt-4">
              {[
                { label: 'Klc', val: p?.Klc || 0 },
                { label: 'Tk', val: p?.Tk || 0 },
                { label: 'Pas', val: p?.Pas || 0 },
                { label: 'Sut', val: p?.Sut || 0 },
                { label: 'Hiz', val: p?.Hız || 0 },
              ].map((s) => (
                <div key={s.label} className="text-center bg-white/5 rounded-xl p-2">
                  <div className="text-[11px] font-black text-white/80">{s.val}</div>
                  <div className="text-[7px] font-black text-white/30 uppercase">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Result Message */}
          {result && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className={`mx-6 mt-4 p-4 rounded-2xl border ${
                result.accepted
                  ? 'bg-emerald-500/10 border-emerald-500/20'
                  : 'bg-red-500/10 border-red-500/20'
              }`}
            >
              <div className="flex items-center gap-3">
                {result.accepted ? (
                  <CheckCircle2 className="text-emerald-400" size={20} />
                ) : (
                  <XCircle className="text-red-400" size={20} />
                )}
                <div>
                  <div className={`text-xs font-black ${result.accepted ? 'text-emerald-400' : 'text-red-400'}`}>
                    {result.accepted ? 'SOZLESME KABUL EDILDI!' : 'TEKLIF REDDEDILDI'}
                  </div>
                  <div className="text-[10px] text-white/50 mt-1">
                    {result.accepted
                      ? 'Oyuncu kadronuza katildi!'
                      : result.reason || 'Oyuncu teklifinizi reddetti.'}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Player Demands Section */}
          <div className="p-6 border-b border-white/5">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="text-amber-400" size={14} />
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">
                Oyuncunun Talepleri
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-amber-500/5 border border-amber-500/10 rounded-xl p-3">
                <div className="text-[8px] font-black text-amber-400/60 uppercase tracking-widest mb-1">Haftalik Ucret (Euro)</div>
                <div className="text-sm font-black text-amber-300">
                  {formatEuro(demands.minWeeklySalary)} - {formatEuro(demands.maxWeeklySalary)}
                </div>
              </div>
              <div className="bg-amber-500/5 border border-amber-500/10 rounded-xl p-3">
                <div className="text-[8px] font-black text-amber-400/60 uppercase tracking-widest mb-1">Imza Ucreti (Kredi)</div>
                <div className="text-sm font-black text-amber-300">
                  {demands.minSigningFee} - {demands.maxSigningFee}
                </div>
              </div>
            </div>
          </div>

          {/* Contract Offer Form */}
          <div className="p-6 space-y-5">
            <div className="flex items-center gap-2 mb-1">
              <FileText className="text-emerald-400" size={14} />
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">
                {isAuctionWin ? 'Sozlesme Detaylari' : 'Sozlesme Teklifi Formu'}
              </span>
            </div>

            {/* Weekly Salary */}
            <div className="space-y-2">
              <label className="flex items-center gap-1.5 text-[9px] font-black text-white/40 uppercase tracking-widest">
                <Euro size={10} />
                Haftalik Ucret (Euro)
              </label>
              <input
                type="number"
                value={weeklySalary}
                onChange={(e) => setWeeklySalary(Number(e.target.value))}
                min={0}
                step={10000}
                className="w-full bg-zinc-800 border border-white/10 rounded-xl p-3 text-sm font-black text-white outline-none focus:border-emerald-500 transition-colors"
              />
              {/* Salary range indicator */}
              <div className="relative h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="absolute h-full bg-emerald-500/40 rounded-full transition-all"
                  style={{
                    width: `${Math.min(100, Math.max(0, ((weeklySalary - demands.minWeeklySalary) / (demands.maxWeeklySalary - demands.minWeeklySalary)) * 100))}%`,
                  }}
                />
              </div>
              <div className="flex justify-between text-[8px] text-white/20">
                <span>{formatEuro(demands.minWeeklySalary)}</span>
                <span>{formatEuro(demands.maxWeeklySalary)}</span>
              </div>
            </div>

            {/* Contract Duration */}
            <div className="space-y-2">
              <label className="flex items-center gap-1.5 text-[9px] font-black text-white/40 uppercase tracking-widest">
                <Calendar size={10} />
                Sozlesme Suresi (Hafta): {contractWeeks}
              </label>
              <input
                type="range"
                min={1}
                max={34}
                value={contractWeeks}
                onChange={(e) => setContractWeeks(Number(e.target.value))}
                className="w-full h-2 bg-zinc-800 rounded-full appearance-none cursor-pointer accent-emerald-500"
              />
              <div className="flex justify-between text-[8px] text-white/20">
                <span>1 Hafta</span>
                <span>17 Hafta (Yarim Sezon)</span>
                <span>34 Hafta (Tam Sezon)</span>
              </div>
            </div>

            {/* Signing Fee */}
            <div className="space-y-2">
              <label className="flex items-center gap-1.5 text-[9px] font-black text-white/40 uppercase tracking-widest">
                <Coins size={10} />
                Imza Ucreti (Kredi)
              </label>
              <input
                type="number"
                value={signingFee}
                onChange={(e) => setSigningFee(Number(e.target.value))}
                min={0}
                step={1}
                className="w-full bg-zinc-800 border border-white/10 rounded-xl p-3 text-sm font-black text-white outline-none focus:border-emerald-500 transition-colors"
              />
              {/* Signing fee range indicator */}
              <div className="relative h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="absolute h-full bg-amber-500/40 rounded-full transition-all"
                  style={{
                    width: `${Math.min(100, Math.max(0, ((signingFee - demands.minSigningFee) / (demands.maxSigningFee - demands.minSigningFee)) * 100))}%`,
                  }}
                />
              </div>
              <div className="flex justify-between text-[8px] text-white/20">
                <span>{demands.minSigningFee} Kredi</span>
                <span>{demands.maxSigningFee} Kredi</span>
              </div>
            </div>

            {/* Cost Summary */}
            <div className="bg-white/5 rounded-2xl p-4 border border-white/5 space-y-2">
              <div className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-2">Maliyet Ozeti</div>
              {!isAuctionWin && (
                <div className="flex justify-between text-[11px]">
                  <span className="text-white/50">Transfer Bedeli (Euro)</span>
                  <span className="font-mono font-black text-emerald-400">{formatEuro(listing.price)}</span>
                </div>
              )}
              {isAuctionWin && auctionBidAmount && (
                <div className="flex justify-between text-[11px]">
                  <span className="text-white/50">Artirma Bedeli (Euro)</span>
                  <span className="font-mono font-black text-amber-400">{formatEuro(auctionBidAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-[11px]">
                <span className="text-white/50">Imza Ucreti (Kredi)</span>
                <span className="font-mono font-black text-amber-400">{signingFee}</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-white/50">Toplam Maas ({contractWeeks} Hafta)</span>
                <span className="font-mono font-black text-white/60">{formatEuro(totalSalaryCost)}</span>
              </div>
              <div className="border-t border-white/10 pt-2 flex justify-between text-[12px]">
                <span className="text-white/70 font-black uppercase">Toplam</span>
                <span className="font-mono font-black text-emerald-400">
                  {formatEuro(listing.price + totalSalaryCost)} + {signingFee} Kr
                </span>
              </div>
            </div>

            {/* Budget Warning */}
            {!canAfford && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex items-center gap-2">
                <AlertTriangle className="text-red-400" size={14} />
                <span className="text-[10px] text-red-400 font-bold">
                  Yetersiz butce! Mevcut Kredi: {profile?.credits || 0} | Mevcut Euro: {formatEuro(profile?.money || 0)}
                </span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="p-6 border-t border-white/5 space-y-3">
            {!result ? (
              <>
                <button
                  onClick={isAuctionWin ? handleSignAuction : handleSubmit}
                  disabled={submitting || !canAfford}
                  className={`w-full py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                    canAfford && !submitting
                      ? 'bg-emerald-500 text-black hover:bg-emerald-400'
                      : 'bg-white/5 text-white/20 cursor-not-allowed'
                  }`}
                >
                  {submitting ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Handshake size={16} />
                  )}
                  {isAuctionWin ? 'Sozlesme Imzala' : 'Teklif Yap'}
                </button>
                <button
                  onClick={onClose}
                  className="w-full py-3 rounded-xl text-xs font-black uppercase tracking-widest bg-white/5 text-white/40 hover:bg-white/10 hover:text-white transition-all"
                >
                  Vazgec
                </button>
              </>
            ) : result.accepted ? (
              <button
                onClick={onClose}
                className="w-full py-3 rounded-xl text-xs font-black uppercase tracking-widest bg-emerald-500 text-black hover:bg-emerald-400 transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle2 size={16} />
                Tamam
              </button>
            ) : (
              <div className="space-y-3">
                <button
                  onClick={() => setResult(null)}
                  className="w-full py-3 rounded-xl text-xs font-black uppercase tracking-widest bg-white/5 text-white/40 hover:bg-white/10 hover:text-white transition-all"
                >
                  Yeniden Dene
                </button>
                <button
                  onClick={onClose}
                  className="w-full py-3 rounded-xl text-xs font-black uppercase tracking-widest bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-all"
                >
                  Vazgec
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
