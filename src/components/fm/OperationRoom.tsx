'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldAlert, Skull, Target, Zap, 
  TrendingDown, Globe, MessageSquare, 
  UserPlus, Gavel, Lock, Info, Shield 
} from 'lucide-react';
import { OperationManager } from '@/lib/fm/OperationManager';
import { OPERATIONS } from '@/lib/fm/operations';
import { TrainingState, Operation } from '@/lib/fm/types';
import { InfoTrigger } from './InfoPopup';
import NextMatchOpponentSquad from './NextMatchOpponentSquad';

interface OperationRoomProps {
  trainingState: TrainingState;
  budget: number;
  onUpdateState: (state: TrainingState) => void;
  onDeductBudget: (amount: number) => void;
  userId?: string;
}

export default function OperationRoom({ trainingState, budget, onUpdateState, onDeductBudget, userId }: OperationRoomProps) {
  const [selectedTier, setSelectedTier] = useState<number | null>(null);
  const manager = OperationManager.getInstance();

  const handleLaunch = (op: Operation) => {
    const { state: newState, cost, error } = manager.launchOperation(op.id, trainingState, budget);
    if (error) {
      alert(error);
      return;
    }
    onUpdateState(newState);
    onDeductBudget(cost);
  };

  const getTierColor = (tier: number) => {
    if (tier <= 3) return 'text-blue-400 border-blue-500/20 bg-blue-500/5';
    if (tier <= 6) return 'text-amber-400 border-amber-500/20 bg-amber-500/5';
    if (tier <= 9) return 'text-red-400 border-red-500/20 bg-red-500/5';
    return 'text-purple-400 border-purple-500/20 bg-purple-500/5';
  };

  const activeOps = trainingState.activeOperations || [];

  return (
    <div className="space-y-4 p-4 bg-black/40 border border-white/5 rounded-lg animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center border border-red-500/30">
             <Skull className="text-red-500" size={20} />
          </div>
          <div>
            <h2 className="text-lg font-black italic uppercase tracking-tighter text-white">Operasyon Odası</h2>
            <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest">Siyah Beyaz FC Gizli Operatör Paneli</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-[10px] text-white/20 font-black uppercase mb-1">Operasyon Bütçesi</div>
          <div className="text-xl font-mono font-bold text-emerald-400 tracking-tighter">{budget.toLocaleString()} €</div>
        </div>
      </div>

      {/* Usage Notice */}
      <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded flex items-center gap-3">
        <ShieldAlert size={16} className="text-amber-500 shrink-0" />
        <div className="text-[10px] text-amber-200/80 font-black uppercase tracking-tighter">
          HER OPERASYONUN KULLANIM SINIRI <span className="text-white">10</span> İLE SINIRLANDIRILMIŞTIR. KULLANIMDAN SONRA GERİ DÖNÜŞÜ YOKTUR. BİLGİNİZE.
        </div>
      </div>

      {/* Opponent Squad Reveal Card */}
      {userId && (
        <NextMatchOpponentSquad userId={userId} />
      )}

      {/* Tier Tabs */}
      <div className="flex flex-wrap items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <div className="flex flex-col items-center gap-1">
          <button
            onClick={() => setSelectedTier(null)}
            className={`px-3 py-2 border text-[10px] font-black transition-all shrink-0 ${
              selectedTier === null 
                ? 'bg-white/10 border-white/30 text-white' 
                : 'bg-white/5 border-white/5 text-white/30 hover:bg-white/10'
            }`}
          >
            HEPSİ
          </button>
          <div className="h-4" /> {/* Spacer to align with Tier buttons that have info icons */}
        </div>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(tier => {
          let infoKey = '';
          if (tier <= 3) infoKey = 'Tier 1-3';
          else if (tier <= 6) infoKey = 'Tier 4-6';
          else if (tier <= 9) infoKey = 'Tier 7-9';
          else infoKey = 'Tier 10';

          return (
            <div key={tier} className="flex flex-col items-center gap-1">
              <button
                onClick={() => setSelectedTier(tier)}
                className={`px-3 py-2 border text-[10px] font-black transition-all shrink-0 ${
                  selectedTier === tier 
                    ? 'bg-white/10 border-white/30 text-white' 
                    : 'bg-white/5 border-white/5 text-white/30 hover:bg-white/10'
                }`}
              >
                TIER {tier}
              </button>
              <InfoTrigger title={`Tier ${tier} Bilgi`} infoKey={infoKey as any} />
            </div>
          );
        })}
      </div>

      {/* Operations List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {OPERATIONS.filter(o => selectedTier ? o.tier === selectedTier : true).map(op => {
          const isPending = activeOps.some(ao => ao.operationId === op.id && ao.status === 'pending');
          const tierStyle = getTierColor(op.tier);
          const isDefense = op.type === 'DEFENSE' || op.type === 'CLEANUP';
          
          let opInfoKey = '';
          if (op.tier <= 3) opInfoKey = 'Tier 1-3';
          else if (op.tier <= 6) opInfoKey = 'Tier 4-6';
          else if (op.tier <= 9) opInfoKey = 'Tier 7-9';
          else opInfoKey = 'Tier 10';

          return (
            <div key={op.id} className={`p-4 border rounded relative overflow-hidden transition-all group ${isPending ? 'opacity-50 grayscale' : 'hover:border-white/20'} ${isDefense ? 'border-blue-500/30 bg-blue-500/5' : 'border-white/5 bg-white/5'}`}>
              <div className="absolute top-2 right-2 flex flex-col items-end gap-1">
                <InfoTrigger title={op.name} infoKey={opInfoKey as any} />
                <span className="text-[7px] font-black text-white/20 uppercase tracking-tighter">
                   KULLANIM: {activeOps.filter(ao => ao.operationId === op.id).length}/10
                </span>
              </div>
              <div className="flex justify-between items-start mb-3">
                <div className={`px-2 py-0.5 border text-[8px] font-black uppercase ${tierStyle}`}>
                  TIER {op.tier} {isDefense ? '// DEFENSIVE' : '// OFFENSIVE'}
                </div>
                <div className="text-[10px] font-mono font-bold text-white/40 mr-6">{op.cost.toLocaleString()} €</div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${isDefense ? 'bg-blue-500/10 text-blue-500' : 'bg-red-500/10 text-red-500'}`}>
                   {isDefense ? <Shield size={16} /> : <Zap size={16} />}
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-black text-white mb-1 uppercase italic tracking-tight">{op.name}</h3>
                  <p className="text-[10px] text-white/40 leading-relaxed mb-4">{op.description}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <div className="text-[7px] text-white/20 uppercase font-black mb-1">Başarı Şansı</div>
                  <div className="flex items-center gap-1">
                    <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500" style={{ width: `${op.successRate * 100}%` }} />
                    </div>
                    <span className="text-[8px] font-mono text-emerald-400">%{Math.round(op.successRate * 100)}</span>
                  </div>
                </div>
                <div>
                  <div className="text-[7px] text-white/20 uppercase font-black mb-1">Skandal Riski</div>
                  <div className="flex items-center gap-1">
                    <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-red-500" style={{ width: `${op.scandalRisk * 100}%` }} />
                    </div>
                    <span className="text-[8px] font-mono text-red-500">%{Math.round(op.scandalRisk * 100)}</span>
                  </div>
                </div>
              </div>

              <button
                disabled={isPending || budget < op.cost}
                onClick={() => handleLaunch(op)}
                className={`w-full py-2 text-[9px] font-black uppercase tracking-widest border transition-all ${
                  isPending 
                    ? 'bg-white/5 border-white/10 text-white/20' 
                    : budget < op.cost 
                      ? 'bg-red-500/5 border-red-500/10 text-red-500/40 cursor-not-allowed'
                      : 'bg-white/10 border-white/20 text-white hover:bg-white/20 active:scale-95'
                }`}
              >
                {isPending ? 'OP_BEKLEMEDE' : 'OPERASYONU BAŞLAT'}
              </button>
              
              {isPending && (
                <div className="absolute top-0 right-0 p-2">
                   <Lock size={12} className="text-amber-500 animate-pulse" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Active Operations Log */}
      {activeOps.length > 0 && (
        <div className="mt-6 border-t border-white/5 pt-4">
          <h4 className="text-[9px] font-black text-white/30 uppercase tracking-[0.3em] mb-3 flex items-center gap-2">
             <MessageSquare size={10} /> SON OPERASYON RAPORLARI
          </h4>
          <div className="space-y-2">
            {activeOps.slice(-5).reverse().map(ao => {
              const op = OPERATIONS.find(o => o.id === ao.operationId);
              return (
                <div key={ao.id} className="flex items-center justify-between p-2 bg-white/5 border border-white/5 rounded text-[9px]">
                  <span className="font-bold text-white/60">{op?.name}</span>
                  <span className={`font-black tracking-widest ${
                    ao.status === 'success' ? 'text-emerald-400' :
                    ao.status === 'scandal' ? 'text-red-500' :
                    ao.status === 'pending' ? 'text-amber-400 italic animate-pulse' : 'text-white/20'
                  }`}>
                    {ao.status.toUpperCase()}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
