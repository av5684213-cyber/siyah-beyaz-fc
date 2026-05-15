'use client';

import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { Player, ActiveTactic } from './types';

interface MatchVisualizer2DProps {
  minute: number;
  homeTeam: Player[];
  awayTeam: Player[];
  activeTactic: ActiveTactic;
  ballPos: { x: number; y: number };
  score: { home: number; away: number };
  events: any[]; // Recent events to trigger animations
}

export const MatchVisualizer2D: React.FC<MatchVisualizer2DProps> = ({ 
  minute, 
  homeTeam, 
  awayTeam, 
  activeTactic,
  ballPos,
  score,
  events 
}) => {
  // Simple pitch dimensions
  const pitchWidth = 600;
  const pitchHeight = 400;

  // Calculate player positions based on formation and active minute
  // This is a simplified "dynamic" positioning based on the game minute and ball position
  const getPlayerPos = (player: Player, index: number, isHome: boolean) => {
    // Basic zones based on 4-4-2, 4-3-3 etc could be more complex
    // Here we use index and team side to spread them
    const sideMult = isHome ? -1 : 1;
    const centerX = pitchWidth / 2;
    const centerY = pitchHeight / 2;

    // Default positions (Start of match)
    let baseX = centerX + (sideMult * 100);
    let baseY = centerY;

    if (index === 0) { // GK
      baseX = centerX + (sideMult * 260);
    } else if (index < 5) { // DF
      baseX = centerX + (sideMult * 180);
      baseY = (index * 80) + 40;
    } else if (index < 9) { // MF
      baseX = centerX + (sideMult * 80);
      baseY = ((index - 4) * 80) + 40;
    } else { // FW
      baseX = centerX + (sideMult * 20);
      baseY = ((index - 8) * 120) + 120;
    }

    // Bias towards ball
    const biasX = (ballPos.x - centerX) * 0.1;
    const biasY = (ballPos.y - centerY) * 0.1;

    return { x: baseX + biasX, y: baseY + biasY };
  };

  return (
    <div className="relative w-full aspect-[3/2] bg-emerald-900 overflow-hidden border-4 border-white/20 rounded-xl shadow-2xl">
      {/* Pitch Markings */}
      <div className="absolute inset-x-0 top-1/2 h-0.5 bg-white/20" />
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 border-2 border-white/20 rounded-full" />
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-white/20 rounded-full" />
      
      {/* Penalty Boxes */}
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-20 h-40 border-2 border-white/20 border-l-0" />
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-20 h-40 border-2 border-white/20 border-r-0" />

      {/* Players - Home */}
      {homeTeam.slice(0, 11).map((p, i) => {
        const pos = getPlayerPos(p, i, true);
        return (
          <motion.div
            key={`home-${p.id}`}
            className="absolute w-6 h-6 -ml-3 -mt-3 rounded-full bg-white border-2 border-black flex items-center justify-center shadow-lg"
            animate={{ x: pos.x, y: pos.y }}
            transition={{ type: 'spring', damping: 20, stiffness: 60 }}
          >
            <span className="text-[8px] font-black">{i + 1}</span>
          </motion.div>
        );
      })}

      {/* Players - Away */}
      {awayTeam.slice(0, 11).map((p, i) => {
        const pos = getPlayerPos(p, i, false);
        return (
          <motion.div
            key={`away-${p.id}`}
            className="absolute w-6 h-6 -ml-3 -mt-3 rounded-full bg-besiktas-red border-2 border-white flex items-center justify-center shadow-lg"
            animate={{ x: pos.x, y: pos.y }}
            transition={{ type: 'spring', damping: 20, stiffness: 60 }}
          >
            <span className="text-[8px] font-black text-white">{i + 1}</span>
          </motion.div>
        );
      })}

      {/* Ball */}
      <motion.div
        className="absolute w-3 h-3 -ml-1.5 -mt-1.5 bg-white rounded-full shadow-2xl border border-black/20 z-10"
        initial={false}
        animate={{ 
          x: ballPos.x, 
          y: ballPos.y,
          scale: ballPos.x < 50 || ballPos.x > 550 ? 1.5 : 1 // "Air" effect near goal
        }}
        transition={{ duration: 0.5 }}
      >
         <div className="w-full h-full rounded-full border border-black/10 flex items-center justify-center">
            <div className="w-1 h-1 bg-black/40 rounded-full" />
         </div>
      </motion.div>

      {/* Goal/Offside/Corner Indicators */}
      <AnimatePresence>
        {events.some(e => e.minute === minute && e.type === 'GOAL') && (
           <motion.div
             initial={{ opacity: 0, scale: 0.5, y: 50 }}
             animate={{ opacity: 1, scale: 1, y: 0 }}
             exit={{ opacity: 0, scale: 1.5 }}
             className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none"
           >
             <h2 className="text-8xl font-black text-white drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)] italic tracking-tighter uppercase">GOOOOOL!</h2>
           </motion.div>
        )}
        {events.some(e => e.minute === minute && e.type === 'OFFSIDE') && (
           <motion.div
             initial={{ opacity: 0, scale: 0.5 }}
             animate={{ opacity: 1, scale: 1 }}
             exit={{ opacity: 0 }}
             className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none"
           >
             <h2 className="text-6xl font-black text-amber-400 drop-shadow-[0_5px_5px_rgba(0,0,0,0.5)] italic tracking-tighter uppercase border-4 border-amber-400 px-8 py-4 bg-black/40 backdrop-blur-md">OFSAYT!</h2>
           </motion.div>
        )}
        {events.some(e => e.minute === minute && e.type === 'CORNER') && (
           <motion.div
             initial={{ opacity: 0, y: -20 }}
             animate={{ opacity: 1, y: 0 }}
             exit={{ opacity: 0 }}
             className="absolute inset-x-0 top-10 flex items-center justify-center z-50 pointer-events-none"
           >
             <span className="text-xl font-black text-white bg-blue-600 px-4 py-1 rounded-full shadow-lg uppercase tracking-widest whitespace-nowrap">KÖŞE VURUŞI</span>
           </motion.div>
        )}
      </AnimatePresence>

      {/* Overlay UI */}
      <div className="absolute bottom-4 left-4 flex gap-4">
        <div className="bg-black/80 px-3 py-1 rounded-sm border border-white/20">
          <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest">{minute}&apos;</span>
        </div>
        <div className="bg-black/80 px-3 py-1 rounded-sm border border-white/20">
          <span className="text-[10px] font-bold text-white uppercase tracking-widest">{score.home} - {score.away}</span>
        </div>
      </div>
    </div>
  );
};
