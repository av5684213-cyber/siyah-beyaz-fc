'use client';

import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { Trophy, Target, AlertTriangle, Clock, TrendingUp, Star } from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════════
// TİP TANIMLARI
// ═══════════════════════════════════════════════════════════════════════

interface MatchEvent {
  type: 'goal' | 'assist' | 'yellow_card' | 'red_card' | 'injury' | 'substitution';
  minute: number;
  playerId?: string;
  playerName: string;
  teamId?: string;
  teamName?: string;
  assistBy?: string;
  reason?: string;
}

interface PlayerStats {
  playerId: string;
  playerName: string;
  teamName: string;
  position: string;
  goals: number;
  assists: number;
  yellowCards: number;
  redCards: number;
  minutesPlayed: number;
}

interface MatchSummaryProps {
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  events: MatchEvent[];
  playerStats?: PlayerStats[];
}

// ═══════════════════════════════════════════════════════════════════════
// YARDIMCI FONKSİYONLAR
// ═══════════════════════════════════════════════════════════════════════

/**
 * Oyuncu değerlendirme puanı hesaplar (1-10).
 * - Gol: +2
 * - Asist: +1
 * - Sarı kart: -1
 * - Kırmızı kart: -3
 * - 90 dakika oynama: +1
 * - Baz puan: 5.0
 */
function calculatePlayerRating(stats: PlayerStats): number {
  let rating = 5.0;
  rating += stats.goals * 2;
  rating += stats.assists * 1;
  rating -= stats.yellowCards * 1;
  rating -= stats.redCards * 3;
  if (stats.minutesPlayed >= 90) rating += 1;
  if (stats.minutesPlayed >= 60 && stats.minutesPlayed < 90) rating += 0.5;

  return Math.max(1.0, Math.min(10.0, Math.round(rating * 10) / 10));
}

/**
 * Simüle edilmiş maç istatistikleri üretir.
 */
function generateSimulatedStats() {
  const rand = () => Math.floor(Math.random() * 30 + 35);
  return {
    possession: [rand() + 10, 100 - (rand() + 10)].sort(() => Math.random() - 0.5),
    shots: [Math.floor(Math.random() * 12 + 4), Math.floor(Math.random() * 12 + 4)],
    shotsOnTarget: [Math.floor(Math.random() * 6 + 2), Math.floor(Math.random() * 6 + 2)],
    corners: [Math.floor(Math.random() * 8 + 1), Math.floor(Math.random() * 8 + 1)],
    fouls: [Math.floor(Math.random() * 15 + 5), Math.floor(Math.random() * 15 + 5)],
    offsides: [Math.floor(Math.random() * 5), Math.floor(Math.random() * 5)],
  };
}

// ═══════════════════════════════════════════════════════════════════════
// EVENT İKON FONKSİYONU
// ═══════════════════════════════════════════════════════════════════════

function getEventIcon(type: string) {
  switch (type) {
    case 'goal':
      return <Target size={14} className="text-green-400" />;
    case 'assist':
      return <TrendingUp size={14} className="text-blue-400" />;
    case 'yellow_card':
      return <div className="w-3 h-4 bg-yellow-400 rounded-sm" />;
    case 'red_card':
      return <div className="w-3 h-4 bg-red-500 rounded-sm" />;
    case 'injury':
      return <AlertTriangle size={14} className="text-orange-400" />;
    case 'substitution':
      return <span className="text-[10px] font-black text-white/40">↔</span>;
    default:
      return <Clock size={14} className="text-white/30" />;
  }
}

function getEventLabel(type: string): string {
  switch (type) {
    case 'goal': return 'GOL';
    case 'assist': return 'ASİST';
    case 'yellow_card': return 'SARI KART';
    case 'red_card': return 'KIRMIZI KART';
    case 'injury': return 'SAKATLIK';
    case 'substitution': return 'DEĞİŞİKLİK';
    default: return type.toUpperCase();
  }
}

// ═══════════════════════════════════════════════════════════════════════
// ANA BİLEŞEN
// ═══════════════════════════════════════════════════════════════════════

export default function MatchSummary({
  homeTeam,
  awayTeam,
  homeScore,
  awayScore,
  events,
  playerStats,
}: MatchSummaryProps) {
  // İstatistikler (simüle edilmiş)
  const stats = useMemo(() => generateSimulatedStats(), []);

  // Oyuncu değerlendirmeleri
  const ratedPlayers = useMemo(() => {
    const players = playerStats || [];
    return players
      .map((p) => ({
        ...p,
        rating: calculatePlayerRating(p),
      }))
      .sort((a, b) => b.rating - a.rating);
  }, [playerStats]);

  // En iyi 3 oyuncu
  const top3 = ratedPlayers.slice(0, 3);

  // Olayları dakikaya göre sırala
  const sortedEvents = useMemo(
    () => [...events].sort((a, b) => a.minute - b.minute),
    [events]
  );

  // Gol olayları
  const goals = sortedEvents.filter((e) => e.type === 'goal');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Skor tablosu */}
      <div className="bg-[#111820] border border-white/5 rounded-2xl p-6 text-center">
        <p className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-3">
          Maç Sonucu
        </p>
        <div className="flex items-center justify-center gap-6">
          <div className="text-right flex-1">
            <p className="text-lg font-black text-white uppercase">{homeTeam}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-4xl font-black text-amber-400">{homeScore}</span>
            <span className="text-xl text-white/20">-</span>
            <span className="text-4xl font-black text-amber-400">{awayScore}</span>
          </div>
          <div className="text-left flex-1">
            <p className="text-lg font-black text-white uppercase">{awayTeam}</p>
          </div>
        </div>
      </div>

      {/* En iyi 3 oyuncu */}
      {top3.length > 0 && (
        <div className="bg-[#111820] border border-white/5 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Star size={14} className="text-amber-400" />
            <h3 className="text-xs font-black text-white uppercase tracking-tight">
              En İyi 3 Oyuncu
            </h3>
          </div>
          <div className="space-y-2">
            {top3.map((player, idx) => (
              <div
                key={player.playerId || idx}
                className="flex items-center gap-3 bg-black/40 rounded-xl px-3 py-2"
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black ${
                    idx === 0
                      ? 'bg-amber-500 text-black'
                      : idx === 1
                        ? 'bg-zinc-400 text-black'
                        : 'bg-amber-700 text-white'
                  }`}
                >
                  {idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-white truncate">
                    {player.playerName}
                  </p>
                  <p className="text-[9px] text-white/30">
                    {player.teamName} • {player.position}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-amber-400">{player.rating.toFixed(1)}</p>
                  <p className="text-[8px] text-white/20">
                    {player.goals > 0 && `${player.goals}G `}
                    {player.assists > 0 && `${player.assists}A`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Olay akışı */}
      {sortedEvents.length > 0 && (
        <div className="bg-[#111820] border border-white/5 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Clock size={14} className="text-white/40" />
            <h3 className="text-xs font-black text-white uppercase tracking-tight">
              Maç Olayları
            </h3>
          </div>
          <div className="space-y-1.5 max-h-64 overflow-y-auto">
            {sortedEvents.map((event, idx) => (
              <div
                key={`${event.minute}-${event.type}-${idx}`}
                className="flex items-center gap-3 px-3 py-2 bg-black/30 rounded-lg hover:bg-black/50 transition-colors"
              >
                <div className="w-8 text-center">
                  <span className="text-[10px] font-bold text-white/30">{event.minute}&apos;</span>
                </div>
                <div className="w-5 flex items-center justify-center">
                  {getEventIcon(event.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-white truncate">
                    {event.playerName}
                  </p>
                  {event.type === 'goal' && event.assistBy && (
                    <p className="text-[9px] text-white/20">
                      Asist: {event.assistBy}
                    </p>
                  )}
                </div>
                <span className="text-[9px] font-bold text-white/20 uppercase">
                  {getEventLabel(event.type)}
                </span>
                {event.teamName && (
                  <span className="text-[8px] text-white/15 truncate max-w-[60px]">
                    {event.teamName}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* İstatistikler */}
      <div className="bg-[#111820] border border-white/5 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Trophy size={14} className="text-white/40" />
          <h3 className="text-xs font-black text-white uppercase tracking-tight">
            İstatistikler
          </h3>
        </div>
        <div className="space-y-3">
          {/* Topla sahip olma */}
          <StatBar
            label="Topla Sahip Olma"
            homeValue={`${stats.possession[0]}%`}
            awayValue={`${stats.possession[1]}%`}
            homePct={stats.possession[0]}
            awayPct={stats.possession[1]}
          />
          <StatBar
            label="İsabetli Şut"
            labelSub="Şut"
            homeValue={`${stats.shotsOnTarget[0]}/${stats.shots[0]}`}
            awayValue={`${stats.shotsOnTarget[1]}/${stats.shots[1]}`}
            homePct={stats.shots[0]}
            awayPct={stats.shots[1]}
          />
          <StatBar
            label="Köşe Vuruşu"
            homeValue={`${stats.corners[0]}`}
            awayValue={`${stats.corners[1]}`}
            homePct={stats.corners[0]}
            awayPct={stats.corners[1]}
          />
          <StatBar
            label="Faul"
            homeValue={`${stats.fouls[0]}`}
            awayValue={`${stats.fouls[1]}`}
            homePct={stats.fouls[0]}
            awayPct={stats.fouls[1]}
          />
          <StatBar
            label="Ofsayt"
            homeValue={`${stats.offsides[0]}`}
            awayValue={`${stats.offsides[1]}`}
            homePct={stats.offsides[0]}
            awayPct={stats.offsides[1]}
          />
        </div>
      </div>

      {/* Tüm oyuncu değerlendirmeleri */}
      {ratedPlayers.length > 3 && (
        <div className="bg-[#111820] border border-white/5 rounded-2xl p-5">
          <h3 className="text-xs font-black text-white uppercase tracking-tight mb-3">
            Tüm Değerlendirmeler
          </h3>
          <div className="grid grid-cols-2 gap-1.5">
            {ratedPlayers.map((player, idx) => (
              <div
                key={player.playerId || idx}
                className="flex items-center justify-between bg-black/30 rounded-lg px-2.5 py-1.5"
              >
                <span className="text-[10px] text-white/60 truncate flex-1">
                  {player.playerName}
                </span>
                <span
                  className={`text-[10px] font-black ml-2 ${
                    player.rating >= 7
                      ? 'text-green-400'
                      : player.rating >= 5
                        ? 'text-amber-400'
                        : 'text-red-400'
                  }`}
                >
                  {player.rating.toFixed(1)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// STAT BAR ALT BİLEŞENİ
// ═══════════════════════════════════════════════════════════════════════

function StatBar({
  label,
  labelSub,
  homeValue,
  awayValue,
  homePct,
  awayPct,
}: {
  label: string;
  labelSub?: string;
  homeValue: string;
  awayValue: string;
  homePct: number;
  awayPct: number;
}) {
  const total = homePct + awayPct || 1;
  const homeWidth = (homePct / total) * 100;
  const awayWidth = (awayPct / total) * 100;

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] font-bold text-white/50">{homeValue}</span>
        <span className="text-[9px] text-white/20 uppercase font-bold">
          {label}
          {labelSub && <span className="text-white/10 ml-1">{labelSub}</span>}
        </span>
        <span className="text-[10px] font-bold text-white/50">{awayValue}</span>
      </div>
      <div className="flex gap-0.5 h-1.5">
        <div className="flex-1 bg-white/5 rounded-l-full overflow-hidden flex justify-end">
          <div
            className="h-full bg-amber-500/60 rounded-l-full"
            style={{ width: `${homeWidth}%` }}
          />
        </div>
        <div className="flex-1 bg-white/5 rounded-r-full overflow-hidden">
          <div
            className="h-full bg-white/20 rounded-r-full"
            style={{ width: `${awayWidth}%` }}
          />
        </div>
      </div>
    </div>
  );
}
