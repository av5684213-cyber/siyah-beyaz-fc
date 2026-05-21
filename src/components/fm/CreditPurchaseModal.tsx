'use client';

import React, { useState } from 'react';
import { useDraggableModal } from '@/hooks/useDraggableModal';
import { motion, AnimatePresence } from 'motion/react';
import { X, Coins, Check, Sparkles, Zap, Crown, Star } from 'lucide-react';

interface CreditPackage {
  id: string;
  credits: number;
  price: string;
  bonus: number;
  icon: React.ReactNode;
  color: string;
  popular?: boolean;
}

const CREDIT_PACKAGES: CreditPackage[] = [
  {
    id: 'starter',
    credits: 50,
    price: '9.99 TL',
    bonus: 0,
    icon: <Coins size={20} />,
    color: 'emerald',
  },
  {
    id: 'standard',
    credits: 120,
    price: '19.99 TL',
    bonus: 10,
    icon: <Zap size={20} />,
    color: 'blue',
    popular: true,
  },
  {
    id: 'premium',
    credits: 250,
    price: '39.99 TL',
    bonus: 30,
    icon: <Star size={20} />,
    color: 'purple',
  },
  {
    id: 'legendary',
    credits: 500,
    price: '69.99 TL',
    bonus: 75,
    icon: <Crown size={20} />,
    color: 'amber',
  },
];

const COLOR_MAP: Record<string, { bg: string; border: string; text: string; glow: string; btn: string }> = {
  emerald: {
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    text: 'text-emerald-400',
    glow: 'shadow-[0_0_15px_rgba(16,185,129,0.1)]',
    btn: 'bg-emerald-500 hover:bg-emerald-400',
  },
  blue: {
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    text: 'text-blue-400',
    glow: 'shadow-[0_0_20px_rgba(59,130,246,0.15)]',
    btn: 'bg-blue-500 hover:bg-blue-400',
  },
  purple: {
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/20',
    text: 'text-purple-400',
    glow: 'shadow-[0_0_20px_rgba(168,85,247,0.15)]',
    btn: 'bg-purple-500 hover:bg-purple-400',
  },
  amber: {
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    text: 'text-amber-400',
    glow: 'shadow-[0_0_25px_rgba(245,158,11,0.2)]',
    btn: 'bg-amber-500 hover:bg-amber-400',
  },
};

interface CreditPurchaseModalProps {
  currentCredits: number;
  userId?: string;
  onClose: () => void;
  onPurchase: (credits: number) => void;
}

export default function CreditPurchaseModal({ currentCredits, userId, onClose, onPurchase }: CreditPurchaseModalProps) {
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handlePurchase = async (pkg: CreditPackage) => {
    setPurchasing(pkg.id);
    const totalCredits = pkg.credits + pkg.bonus;

    try {
      // Try to persist to Supabase
      if (userId) {
        const res = await fetch('/api/credits/purchase', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, credits: totalCredits }),
        });
        if (res.ok) {
          onPurchase(totalCredits);
          setSuccess(pkg.id);
        } else {
          // Fallback: just update locally
          onPurchase(totalCredits);
          setSuccess(pkg.id);
        }
      } else {
        // No userId, just update locally
        onPurchase(totalCredits);
        setSuccess(pkg.id);
      }
    } catch {
      // Fallback: just update locally
      onPurchase(totalCredits);
      setSuccess(pkg.id);
    }

    setTimeout(() => {
      setSuccess(null);
      setPurchasing(null);
    }, 1500);
  };

  const { modalRef, handleRef, position, isDragging } = useDraggableModal();

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-md"
        />
        <motion.div
          ref={modalRef}
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 30 }}
          transition={{ type: 'spring', damping: 25 }}
          className="relative w-full max-w-lg bg-zinc-900 border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl"
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
          <div className="relative px-8 pt-8 pb-6 bg-gradient-to-br from-amber-500/10 via-zinc-900 to-amber-500/5 border-b border-white/5">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-white hover:bg-white/10 transition-all"
            >
              <X size={16} />
            </button>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/25 flex items-center justify-center">
                <Coins size={24} className="text-amber-400" />
              </div>
              <div>
                <h2 className="text-xl font-black italic uppercase tracking-tighter text-white">
                  Kredi Satin Al
                </h2>
                <p className="text-[10px] text-white/30 uppercase font-bold tracking-widest">
                  Mevcut: {currentCredits} Kredi
                </p>
              </div>
            </div>
            <p className="text-[11px] text-white/40 leading-relaxed">
              Kredi ile transfer ucretleri, personel ise alim ve sozlesme masraflarini odeyebilirsiniz.
            </p>
          </div>

          {/* Credit Packages */}
          <div className="p-6 space-y-3">
            {CREDIT_PACKAGES.map((pkg) => {
              const colors = COLOR_MAP[pkg.color];
              const isPurchasing = purchasing === pkg.id;
              const isSuccess = success === pkg.id;
              const totalCredits = pkg.credits + pkg.bonus;

              return (
                <motion.div
                  key={pkg.id}
                  className={`relative border rounded-2xl p-4 transition-all ${colors.border} ${colors.bg} ${colors.glow} ${
                    pkg.popular ? 'ring-1 ring-blue-500/30' : ''
                  }`}
                >
                  {/* Popular badge */}
                  {pkg.popular && (
                    <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-blue-500 rounded-full text-[7px] font-black uppercase tracking-widest text-white shadow-lg">
                      En Popüler
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${colors.bg} ${colors.border} ${colors.text}`}>
                        {pkg.icon}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`text-lg font-black ${colors.text}`}>{pkg.credits}</span>
                          <span className="text-[10px] font-bold text-white/40 uppercase">Kredi</span>
                          {pkg.bonus > 0 && (
                            <span className="px-1.5 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[8px] font-black uppercase rounded">
                              +{pkg.bonus} Bonus
                            </span>
                          )}
                        </div>
                        <p className="text-[9px] text-white/25 mt-0.5">
                          Toplam: {totalCredits} Kredi • {pkg.price}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => handlePurchase(pkg)}
                      disabled={!!purchasing}
                      className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider text-white transition-all active:scale-95 disabled:opacity-50 disabled:cursor-wait ${
                        isSuccess
                          ? 'bg-emerald-500'
                          : colors.btn
                      }`}
                    >
                      {isSuccess ? (
                        <span className="flex items-center gap-1.5">
                          <Check size={12} /> Eklendi!
                        </span>
                      ) : isPurchasing ? (
                        <span className="flex items-center gap-1.5">
                          <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Isleniyor...
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5">
                          <Sparkles size={10} /> {pkg.price}
                        </span>
                      )}
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Footer Note */}
          <div className="px-6 pb-6">
            <p className="text-[8px] text-white/15 text-center uppercase tracking-widest leading-relaxed">
              Krediler aninda hesabiniza eklenir. Simulasyon modunda krediler ucretsiz saglanir.
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
