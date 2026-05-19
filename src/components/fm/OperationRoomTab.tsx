'use client';

import React, { useCallback } from 'react';
import { motion } from 'motion/react';
import { useFM } from '@/lib/fm/GameContext';
import OperationRoom from './OperationRoom';
import { Skull, Construction } from 'lucide-react';

export default function OperationRoomTab({ userId }: { userId?: string }) {
  const { profile, trainingState, setTrainingState, setProfile } = useFM();

  const budget = profile?.money || 0;

  const handleUpdateState = useCallback((newState: any) => {
    setTrainingState(newState);
  }, [setTrainingState]);

  const handleDeductBudget = useCallback((amount: number) => {
    setProfile((prev: any) => {
      if (!prev) return prev;
      return { ...prev, money: Math.max(0, (prev.money || 0) - amount) };
    });
  }, [setProfile]);

  if (!profile) {
    return (
      <div className="flex items-center justify-center h-64 text-white/30">
        <Skull size={32} className="mr-3 opacity-30" />
        <span className="text-sm font-bold uppercase tracking-widest">Takım kurulmadı</span>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-4"
    >
      {/* Yakinda Warning Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl border border-amber-500/25 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-amber-500/10 p-4"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/25 flex items-center justify-center shrink-0">
            <Construction size={20} className="text-amber-400" />
          </div>
          <div>
            <p className="text-sm font-black text-amber-300 uppercase tracking-wider">Bu ozellik yakinda kullanima sunulacak.</p>
            <p className="text-[10px] text-white/30 mt-0.5">Operasyon odasi henuz gelistirme asamasindadir. Gosterilen icerik ornek veridir.</p>
          </div>
        </div>
        <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />
      </motion.div>

      {/* Content - dimmed & disabled */}
      <div className="opacity-60 pointer-events-none select-none">
        <OperationRoom
          trainingState={trainingState}
          budget={budget}
          onUpdateState={handleUpdateState}
          onDeductBudget={handleDeductBudget}
          userId={userId}
        />
      </div>
    </motion.div>
  );
}
