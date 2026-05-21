'use client';

import React from 'react';
import type { PlayerStatRow } from './matchTypes';

interface PlayerStatsTableProps {
  players: PlayerStatRow[];
  teamName: string;
  label: string;
}

export default function PlayerStatsTable({ players, teamName, label }: PlayerStatsTableProps) {
  if (players.length === 0) return null;

  // Gol, asist, kart öncelikli sıralama
  const sorted = [...players].sort((a, b) => {
    if (b.goals !== a.goals) return b.goals - a.goals;
    if (b.assists !== a.assists) return b.assists - a.assists;
    return b.rating - a.rating;
  });

  return (
    <div className="rounded-xl border border-white/[0.06] overflow-hidden">
      <div className="px-4 py-3 bg-white/[0.02] border-b border-white/[0.06] flex items-center gap-2">
        <div className="w-6 h-6 rounded-md bg-white/[0.06] flex items-center justify-center">
          <span className="text-[8px] font-black text-white/50">
            {teamName.slice(0, 2).toUpperCase()}
          </span>
        </div>
        <span className="text-[10px] font-black uppercase tracking-widest text-white/40">
          {label} — {teamName}
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[400px]">
          <thead>
            <tr className="border-b border-white/[0.04]">
              <th className="text-left px-3 py-2 text-[8px] font-bold uppercase tracking-widest text-white/25">
                Oyuncu
              </th>
              <th className="text-center px-2 py-2 text-[8px] font-bold uppercase tracking-widest text-white/25 w-10">
                Poz
              </th>
              <th className="text-center px-2 py-2 text-[8px] font-bold uppercase tracking-widest text-white/25 w-10">
                OVR
              </th>
              <th className="text-center px-2 py-2 text-[8px] font-bold uppercase tracking-widest text-yellow-400/50 w-8">
                G
              </th>
              <th className="text-center px-2 py-2 text-[8px] font-bold uppercase tracking-widest text-blue-400/50 w-8">
                A
              </th>
              <th className="text-center px-2 py-2 text-[8px] font-bold uppercase tracking-widest text-yellow-500/50 w-8">
                SK
              </th>
              <th className="text-center px-2 py-2 text-[8px] font-bold uppercase tracking-widest text-red-500/50 w-8">
                KK
              </th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((player, idx) => (
              <tr
                key={player.id || idx}
                className="border-b border-white/[0.02] hover:bg-white/[0.02] transition-colors"
              >
                <td className="px-3 py-2 text-[11px] font-semibold text-white/70 truncate max-w-[150px]">
                  {player.name}
                </td>
                <td className="text-center px-2 py-2 text-[10px] font-bold text-white/30">
                  {player.position}
                </td>
                <td className="text-center px-2 py-2 text-[11px] font-black text-white/50">
                  {player.rating}
                </td>
                <td className="text-center px-2 py-2">
                  {player.goals > 0 ? (
                    <span className="text-[11px] font-black text-yellow-400">{player.goals}</span>
                  ) : (
                    <span className="text-[10px] text-white/15">-</span>
                  )}
                </td>
                <td className="text-center px-2 py-2">
                  {player.assists > 0 ? (
                    <span className="text-[11px] font-black text-blue-400">{player.assists}</span>
                  ) : (
                    <span className="text-[10px] text-white/15">-</span>
                  )}
                </td>
                <td className="text-center px-2 py-2">
                  {player.yellow_cards > 0 ? (
                    <span className="text-[11px] font-bold text-yellow-500">{player.yellow_cards}</span>
                  ) : (
                    <span className="text-[10px] text-white/15">-</span>
                  )}
                </td>
                <td className="text-center px-2 py-2">
                  {player.red_cards > 0 ? (
                    <span className="text-[11px] font-bold text-red-500">{player.red_cards}</span>
                  ) : (
                    <span className="text-[10px] text-white/15">-</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
