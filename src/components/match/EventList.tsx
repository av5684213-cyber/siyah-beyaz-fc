'use client';

import React from 'react';
import { motion } from 'motion/react';
import { Activity } from 'lucide-react';
import { getEventStyle } from './matchHelpers';
import type { MatchEventRow } from './matchTypes';

interface EventListProps {
  events: MatchEventRow[];
}

export default function EventList({ events }: EventListProps) {
  if (events.length === 0) {
    return (
      <div className="text-center py-8">
        <Activity className="w-8 h-8 text-white/10 mx-auto mb-3" />
        <p className="text-xs text-white/25">Henüz olay kaydedilmedi</p>
      </div>
    );
  }

  // Dakikaya göre sırala
  const sorted = [...events].sort((a, b) => (a.minute || 0) - (b.minute || 0));

  return (
    <div className="space-y-2">
      {sorted.map((event, idx) => {
        const style = getEventStyle(event.event_type);
        return (
          <motion.div
            key={event.id || idx}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.03 }}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${style.colorClass}`}
          >
            {/* Dakika */}
            <div className="w-10 text-center flex-shrink-0">
              <span className="text-xs font-black tabular-nums">{event.minute}&apos;</span>
            </div>

            {/* İkon */}
            <span className="text-base flex-shrink-0">{style.icon}</span>

            {/* İçerik */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-black uppercase tracking-widest opacity-60">
                  {style.label}
                </span>
                {event.team && (
                  <span className={`text-[8px] font-bold uppercase px-1.5 py-0.5 rounded ${
                    event.team === 'home' || event.team === 'HOME'
                      ? 'bg-white/10 text-white/50'
                      : 'bg-yellow-500/10 text-yellow-400/70'
                  }`}>
                    {event.team === 'home' || event.team === 'HOME' ? 'EV' : 'DEP'}
                  </span>
                )}
              </div>
              <p className="text-xs font-semibold mt-0.5 truncate">
                {event.player_name || event.detail || style.label}
              </p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
