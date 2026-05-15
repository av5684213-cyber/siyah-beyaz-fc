'use client';

import React, { useCallback } from 'react';
import { motion } from 'motion/react';
import { useFM } from '@/lib/fm/GameContext';
import OperationRoom from './OperationRoom';
import { Skull } from 'lucide-react';

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
    >
      <OperationRoom
        trainingState={trainingState}
        budget={budget}
        onUpdateState={handleUpdateState}
        onDeductBudget={handleDeductBudget}
      />
    </motion.div>
  );
}
