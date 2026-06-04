'use client';

import { useRef, useState, useCallback } from 'react';

interface SwipeablePlayerCardProps {
  player: {
    id: string;
    name: string;
    position: string;
    ovr: number;
    age: number;
  };
  onSwipeLeft?: (playerId: string) => void; // Add to transfer list
  onSwipeRight?: (playerId: string) => void; // Remove from squad
  onSwipeUp?: (playerId: string) => void;    // Extend contract
  children?: React.ReactNode;
}

export default function SwipeablePlayerCard({
  player, onSwipeLeft, onSwipeRight, onSwipeUp, children
}: SwipeablePlayerCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [showAction, setShowAction] = useState<string | null>(null);

  const startX = useRef(0);
  const startY = useRef(0);

  const SWIPE_THRESHOLD = 80;

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    startY.current = e.touches[0].clientY;
    setIsDragging(true);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging) return;
    const dx = e.touches[0].clientX - startX.current;
    const dy = e.touches[0].clientY - startY.current;
    setOffsetX(dx);
    setOffsetY(Math.min(0, dy)); // Only allow upward swipe

    // Show action hint
    if (dx < -SWIPE_THRESHOLD) setShowAction('list');
    else if (dx > SWIPE_THRESHOLD) setShowAction('remove');
    else if (dy < -SWIPE_THRESHOLD) setShowAction('contract');
    else setShowAction(null);
  }, [isDragging]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);

    if (offsetX < -SWIPE_THRESHOLD && onSwipeLeft) {
      onSwipeLeft(player.id);
    } else if (offsetX > SWIPE_THRESHOLD && onSwipeRight) {
      onSwipeRight(player.id);
    } else if (offsetY < -SWIPE_THRESHOLD && onSwipeUp) {
      onSwipeUp(player.id);
    }

    setOffsetX(0);
    setOffsetY(0);
    setShowAction(null);
  }, [offsetX, offsetY, player.id, onSwipeLeft, onSwipeRight, onSwipeUp]);

  const rotation = offsetX * 0.05;
  const opacity = 1 - Math.abs(offsetX) / 300;

  return (
    <div className="relative overflow-hidden">
      {/* Action indicators */}
      {showAction === 'list' && (
        <div className="absolute left-2 top-1/2 -translate-y-1/2 bg-amber-500 text-black text-[10px] px-2 py-1 rounded font-bold z-10">
          Listele
        </div>
      )}
      {showAction === 'remove' && (
        <div className="absolute right-2 top-1/2 -translate-y-1/2 bg-red-500 text-white text-[10px] px-2 py-1 rounded font-bold z-10">
          Kaldır
        </div>
      )}
      {showAction === 'contract' && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-green-500 text-white text-[10px] px-2 py-1 rounded font-bold z-10">
          Sözleşme Uzat
        </div>
      )}

      <div
        ref={cardRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="transition-[transform,opacity] select-none touch-pan-y"
        style={{
          transform: `translateX(${offsetX}px) translateY(${offsetY}px) rotate(${rotation}deg)`,
          opacity: Math.max(0.5, opacity),
          transition: isDragging ? 'none' : 'all 0.3s ease',
        }}
      >
        {children || (
          <div className="bg-white/5 rounded-lg p-3 border border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-white font-medium">{player.name}</div>
                <div className="text-[10px] text-white/40">{player.position} • {player.age} yaş</div>
              </div>
              <div className="text-amber-400 font-bold text-sm">{player.ovr}</div>
            </div>
            <div className="text-[9px] text-white/20 mt-1 text-center">
              ← Listele  |  Kaldır →  |  ↑ Sözleşme
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
