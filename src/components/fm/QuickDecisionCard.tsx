'use client';

import { useEffect, useState } from 'react';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';

interface QuickAction {
  id: string;
  icon: string;
  title: string;
  description: string;
  action: string; // tab name or route
  urgency: 'high' | 'medium' | 'low';
}

interface QuickDecisionCardProps {
  userId: string;
  onNavigate: (tab: string) => void;
  hasMatchToday: boolean;
  contractExpiringCount: number;
  hasUntrained: boolean;
}

export default function QuickDecisionCard({ userId, onNavigate, hasMatchToday, contractExpiringCount, hasUntrained }: QuickDecisionCardProps) {
  const [actions, setActions] = useState<QuickAction[]>([]);

  useEffect(() => {
    const buildActions = () => {
      const result: QuickAction[] = [];

      if (hasMatchToday) {
        result.push({
          id: 'match',
          icon: '⚽',
          title: 'Maçın var!',
          description: 'Taktiğini onayla ve kadroyu düzenle',
          action: 'matchday',
          urgency: 'high',
        });
      }

      if (hasUntrained) {
        result.push({
          id: 'training',
          icon: '🏋️',
          title: 'Antrenman yap',
          description: 'Bugünkü antrenman programını uygula',
          action: 'training',
          urgency: 'medium',
        });
      }

      if (contractExpiringCount > 0) {
        result.push({
          id: 'contracts',
          icon: '📝',
          title: `${contractExpiringCount} sözleşme bitiyor`,
          description: 'Oyuncuların sözleşmelerini uzat',
          action: 'squad',
          urgency: 'high',
        });
      }

      // Always suggest at least 2 actions
      if (result.length < 2) {
        result.push({
          id: 'scout',
          icon: '🔍',
          title: 'Oyuncu keşfet',
          description: 'Yeni yetenekleri ara',
          action: 'scouting',
          urgency: 'low',
        });
      }

      if (result.length < 3) {
        result.push({
          id: 'market',
          icon: '💰',
          title: 'Transfer piyasası',
          description: 'Mevcut fırsatları incele',
          action: 'multiplayer',
          urgency: 'low',
        });
      }

      setActions(result);
    };

    buildActions();
  }, [hasMatchToday, contractExpiringCount, hasUntrained]);

  if (actions.length === 0) return null;

  const urgencyStyles: Record<string, string> = {
    high: 'border-amber-500/30 bg-amber-500/5',
    medium: 'border-blue-500/20 bg-blue-500/5',
    low: 'border-white/5 bg-white/[0.02]',
  };

  return (
    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
      <h3 className="text-sm font-bold text-white mb-3">🎯 Bugün Ne Yapmalısın?</h3>
      <div className="space-y-2">
        {actions.map(action => (
          <button
            key={action.id}
            onClick={() => onNavigate(action.action)}
            className={`w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-all hover:scale-[1.02] ${urgencyStyles[action.urgency]}`}
          >
            <span className="text-xl">{action.icon}</span>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-white">{action.title}</div>
              <div className="text-[10px] text-white/40">{action.description}</div>
            </div>
            <span className="text-white/20 text-xs">→</span>
          </button>
        ))}
      </div>
    </div>
  );
}
