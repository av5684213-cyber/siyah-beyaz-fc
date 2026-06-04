'use client';

import { useState } from 'react';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';

interface LoanWithBuyOption {
  id: string;
  player_id: string;
  player_name?: string;
  from_profile_id: string;
  buy_option_price: number;
  buy_option_deadline: string | null;
}

interface LoanBuyOptionCardProps {
  loans: LoanWithBuyOption[];
  userId: string;
  onUpdate: () => void;
}

export default function LoanBuyOptionCard({ loans, userId, onUpdate }: LoanBuyOptionCardProps) {
  const [exercising, setExercising] = useState<string | null>(null);

  const activeLoans = loans.filter(l => l.buy_option_price && l.buy_option_price > 0);

  if (activeLoans.length === 0) return null;

  const handleExercise = async (loanId: string) => {
    if (!isSupabaseConfigured()) return;
    const supabase = getSupabase();
    if (!supabase) return;

    setExercising(loanId);
    try {
      const { data, error } = await supabase.rpc('exercise_buy_option', {
        p_loan_id: loanId,
        p_profile_id: userId,
      });

      if (error) {
        console.error('Buy option error:', error.message);
        alert(error.message);
      } else if (data?.success) {
        onUpdate();
      } else {
        alert(data?.error || 'Opsiyon kullanılamadı');
      }
    } catch (err) {
      console.error('Exercise buy option error:', err);
    } finally {
      setExercising(null);
    }
  };

  return (
    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
      <h3 className="text-sm font-bold text-white mb-3">🏠 Kiralıkta Satın Alma Opsiyonu</h3>
      <div className="space-y-2">
        {activeLoans.map(loan => {
          const isExpired = loan.buy_option_deadline && new Date(loan.buy_option_deadline) < new Date();
          const daysLeft = loan.buy_option_deadline
            ? Math.ceil((new Date(loan.buy_option_deadline).getTime() - Date.now()) / 86400000)
            : null;

          return (
            <div key={loan.id} className="bg-white/5 rounded-lg p-3 border border-white/5">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-white font-medium">{loan.player_name || 'Oyuncu'}</span>
                <span className="text-xs text-green-400 font-bold">{(loan.buy_option_price / 1000000).toFixed(1)}M €</span>
              </div>
              {loan.buy_option_deadline && (
                <div className={`text-[10px] ${isExpired ? 'text-red-400' : daysLeft && daysLeft < 7 ? 'text-amber-400' : 'text-white/40'}`}>
                  {isExpired ? '❌ Süresi doldu' : `⏰ ${daysLeft} gün kaldı`}
                </div>
              )}
              {!isExpired && (
                <button
                  onClick={() => handleExercise(loan.id)}
                  disabled={exercising === loan.id}
                  className="mt-2 w-full text-[10px] py-1.5 rounded bg-green-600/80 hover:bg-green-500 text-white font-medium disabled:opacity-50"
                >
                  {exercising === loan.id ? 'İşleniyor...' : 'Opsiyonu Kullan'}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
