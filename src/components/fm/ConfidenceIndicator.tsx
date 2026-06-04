'use client';

import { ConfidenceLevel, getConfidenceDisplay } from '@/lib/fm/confidenceSystem';

interface ConfidenceIndicatorProps {
  level: ConfidenceLevel;
  consecutiveGood: number;
  consecutiveBad: number;
  size?: 'sm' | 'md';
}

export default function ConfidenceIndicator({ level, consecutiveGood, consecutiveBad, size = 'sm' }: ConfidenceIndicatorProps) {
  const display = getConfidenceDisplay(level);
  const isSmall = size === 'sm';

  return (
    <div className={`flex items-center gap-1.5 ${isSmall ? 'text-[10px]' : 'text-xs'}`}>
      <span className={isSmall ? 'text-sm' : 'text-lg'}>{display.icon}</span>
      <div>
        <div className={`font-medium ${display.color}`}>{display.label}</div>
        {!isSmall && <div className="text-white/30 text-[10px]">{display.description}</div>}
      </div>
      {level === 'high' && consecutiveGood > 0 && (
        <span className="text-green-400/50 text-[10px]">({consecutiveGood} iyi maç)</span>
      )}
      {level === 'low' && consecutiveBad > 0 && (
        <span className="text-red-400/50 text-[10px]">({consecutiveBad} kötü maç)</span>
      )}
    </div>
  );
}
