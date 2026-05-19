'use client';

import React, { useMemo, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { MatchEvent, MatchType } from '@/lib/fm/types';
import {
  generateCommentary,
  getAnimationDuration,
  getIntensityScale,
  getMatchTypeLabel,
  type CommentaryEventType,
  type GeneratedCommentary,
} from '@/lib/fm/matchCommentaryGenerator';

/**
 * MatchCommentary — maç sırasında olayları zengin, trait tabanlı
 * hikaye anlatımıyla gösterir.
 *
 * Her olay, matchCommentaryGenerator motoru tarafından üretilen
 * bağlama duyarlı yorumlarla sunulur. Gol, kart, sakatlık gibi
 * olaylar oyuncu trait'lerine, maçın türüne (derbi/kupa/hazırlık),
 * dakikaya ve skor durumuna göre farklı anlatımlarla gösterilir.
 */

interface MatchCommentaryProps {
  /** Maç olayları listesi */
  events: MatchEvent[];
  /** Ev sahibi takım adı */
  homeTeam: string;
  /** Deplasman takım adı */
  awayTeam: string;
  /** Maç türü (derbi, kupa, hazırlık vs.) */
  matchType?: MatchType;
  /** Maksimum gösterilecek olay sayısı */
  maxVisible?: number;
  /** Özel stil sınıfı */
  className?: string;
  /** Ses efektleri açıksa gol/kart anlarında bip */
  soundEnabled?: boolean;
}

// ─── Olay İkonları ────────────────────────────────────────────────

function getEventIcon(type: MatchEvent['type'], intensity: number): string {
  // Yüksek intensity'li gollerde farklı ikon
  if (type === 'GOAL' && intensity >= 4) return '🔥';
  if (type === 'GOAL') return '⚽';
  if (type === 'PENALTY_GOAL') return '⚽';
  if (type === 'OWN_GOAL') return '😵';
  if (type === 'YELLOW') return '🟨';
  if (type === 'RED') return '🟥';
  if (type === 'SECOND_YELLOW') return '🟨🟥';
  if (type === 'INJURY') return '🏥';
  if (type === 'SUB') return '🔄';
  if (type === 'HALFTIME') return '⏸️';
  if (type === 'FULLTIME') return '🏁';
  if (type === 'OFFSIDE') return '🚩';
  if (type === 'CORNER') return '🚩';
  if (type === 'COMMENTARY') return '💬';
  return '📋';
}

function getEventColor(type: MatchEvent['type'], intensity: number): string {
  // Intensity'ye göre daha canlı renkler
  if (type === 'GOAL' || type === 'PENALTY_GOAL') {
    if (intensity >= 5) return 'border-yellow-400/60 bg-yellow-900/30';
    if (intensity >= 4) return 'border-green-400/50 bg-green-900/25';
    return 'border-green-500/40 bg-green-900/20';
  }
  if (type === 'OWN_GOAL') return 'border-red-500/40 bg-red-900/20';
  if (type === 'YELLOW') return 'border-yellow-500/40 bg-yellow-900/20';
  if (type === 'RED' || type === 'SECOND_YELLOW') return 'border-red-500/40 bg-red-900/20';
  if (type === 'INJURY') return 'border-orange-500/40 bg-orange-900/20';
  if (type === 'SUB') return 'border-blue-500/40 bg-blue-900/20';
  if (type === 'HALFTIME' || type === 'FULLTIME') return 'border-white/30 bg-white/5';
  return 'border-white/10 bg-white/5';
}

function getEventTextStyle(type: MatchEvent['type'], intensity: number): string {
  if (type === 'GOAL' || type === 'PENALTY_GOAL') {
    if (intensity >= 5) return 'font-black text-yellow-200 text-sm';
    if (intensity >= 4) return 'font-bold text-green-200';
    return 'font-bold text-green-300';
  }
  if (type === 'OWN_GOAL') return 'font-semibold text-red-300';
  if (type === 'RED' || type === 'SECOND_YELLOW') return 'font-semibold text-red-300';
  if (type === 'YELLOW') return 'text-yellow-200/80';
  if (type === 'INJURY') return 'text-orange-200/80';
  if (type === 'HALFTIME' || type === 'FULLTIME') return 'font-semibold text-white/80';
  return 'text-white/70';
}

/** Maç türü badge rengi */
function getMatchTypeBadgeStyle(matchType?: MatchType): string | null {
  switch (matchType) {
    case 'derby': return 'bg-red-500/20 text-red-300 border-red-500/30';
    case 'cup': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
    case 'cup_final': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
    case 'friendly': return 'bg-green-500/20 text-green-300 border-green-500/30';
    default: return null;
  }
}

// ─── Ses Efekti ────────────────────────────────────────────────

function playEventSound(type: MatchEvent['type'], intensity: number): void {
  try {
    if (typeof window === 'undefined' || !window.AudioContext) return;

    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    switch (type) {
      case 'GOAL':
      case 'PENALTY_GOAL':
        // Gol sesi — yüksek ve heyecanlı
        osc.frequency.setValueAtTime(intensity >= 4 ? 880 : 660, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.5);
        break;
      case 'RED':
      case 'SECOND_YELLOW':
        // Kırmızı kart sesi — sert
        osc.frequency.setValueAtTime(220, ctx.currentTime);
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.3);
        break;
      case 'HALFTIME':
      case 'FULLTIME':
        // Düdük sesi
        osc.frequency.setValueAtTime(550, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.15);
        osc.frequency.exponentialRampToValueAtTime(550, ctx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.6);
        break;
    }
  } catch {
    // Audio context desteklenmiyorsa sessizce devam et
  }
}

// ─── NarratedEvent (iç tip) ──────────────────────────────────────

interface NarratedEvent extends MatchEvent {
  narration: string;
  commentary: GeneratedCommentary;
}

// ─── Bileşen ───────────────────────────────────────────────────────

export default function MatchCommentary({
  events,
  homeTeam,
  awayTeam,
  matchType,
  maxVisible = 30,
  className = '',
  soundEnabled = false,
}: MatchCommentaryProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const prevEventCountRef = useRef(0);

  // Son N olayı al ve zengin anlatıma dönüştür
  const narratedEvents = useMemo(() => {
    try {
      const recent = events.slice(-maxVisible);
      return recent.map((event): NarratedEvent => {
        // MatchEvent → CommentaryContext dönüşümü
        const eventType = (event.type.toUpperCase() === 'PENALTY_GOAL' ? 'PENALTY_GOAL'
          : event.type.toUpperCase() === 'OWN_GOAL' ? 'OWN_GOAL'
          : event.type.toUpperCase() === 'SECOND_YELLOW' ? 'SECOND_YELLOW'
          : event.type) as CommentaryEventType;

        const commentary = generateCommentary({
          eventType,
          playerName: event.player,
          team: event.team,
          minute: event.minute,
          homeScore: event.homeScore,
          awayScore: event.awayScore,
          matchType: event.matchType || matchType,
          playerTraits: event.playerTraits,
          playerNegTraits: event.playerNegTraits,
          playerPersonality: event.playerPersonality,
          goalType: event.goalType,
          isFormerPlayer: event.isFormerPlayer,
          homeTeamName: event.homeTeamName || homeTeam,
          awayTeamName: event.awayTeamName || awayTeam,
          playerGoalCount: event.playerGoalCount,
          assistPlayerName: event.assistPlayer,
          detail: event.detail || event.text,
        });

        return {
          ...event,
          narration: commentary.text,
          commentary,
        };
      });
    } catch (err) {
      console.error('[MatchCommentary] narratedEvents error:', err);
      return [];
    }
  }, [events, maxVisible, matchType, homeTeam, awayTeam]);

  // Yeni olay geldiğinde ses çal ve scroll yap
  useEffect(() => {
    if (!soundEnabled) return;

    const newEvents = events.length - prevEventCountRef.current;
    if (newEvents > 0) {
      const latestEvent = events[events.length - 1];
      if (latestEvent) {
        playEventSound(latestEvent.type, 3);
      }
    }
    prevEventCountRef.current = events.length;
  }, [events.length, soundEnabled]);

  // Yeni olay geldiğinde en alta scroll
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [narratedEvents.length]);

  const getTeamLabel = useCallback(
    (team?: 'HOME' | 'AWAY'): string => {
      if (!team) return '';
      return team === 'HOME' ? homeTeam : awayTeam;
    },
    [homeTeam, awayTeam]
  );

  // Maç türü badge
  const matchTypeBadge = getMatchTypeBadgeStyle(matchType);

  return (
    <div className={`flex flex-col ${className}`}>
      {/* Başlık */}
      <div className="flex items-center justify-between mb-2 px-1">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-white/30">
            Maç Anlatımı
          </span>
          <span className="text-[9px] text-white/15">({events.length} olay)</span>
          {matchTypeBadge && (
            <span className={`text-[9px] px-1.5 py-0.5 rounded border ${matchTypeBadge}`}>
              {getMatchTypeLabel(matchType)}
            </span>
          )}
        </div>
      </div>

      {/* Olay listesi */}
      <div
        ref={containerRef}
        className="flex flex-col gap-1 max-h-[60vh] overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent pr-1"
      >
        {narratedEvents.length === 0 && (
          <div className="py-8 text-center text-sm text-white/30">
            Maç başladığında olaylar burada görünecek...
          </div>
        )}

        <AnimatePresence mode="popLayout">
          {narratedEvents.map((event, index) => {
            const isLatest = index === narratedEvents.length - 1;
            const intensity = event.commentary.intensity;
            const animDuration = getAnimationDuration(intensity);
            const scaleVal = isLatest ? getIntensityScale(intensity) : 1.0;

            return (
              <motion.div
                key={`${event.minute}-${event.type}-${index}-${event.player || ''}`}
                initial={{
                  opacity: 0,
                  x: intensity >= 4 ? 0 : -15,
                  y: intensity >= 4 ? -10 : 0,
                  scale: 0.95,
                }}
                animate={{
                  opacity: 1,
                  x: 0,
                  y: 0,
                  scale: scaleVal,
                }}
                exit={{ opacity: 0, x: 20, scale: 0.9 }}
                transition={{
                  duration: animDuration,
                  ease: intensity >= 4 ? 'easeOut' : 'easeInOut',
                }}
                className={`rounded-lg border px-3 py-2 text-sm ${getEventColor(event.type, intensity)} ${
                  isLatest && intensity >= 4 ? 'ring-1 ring-white/10' : ''
                }`}
              >
                <div className="flex items-start gap-2">
                  {/* Dakika */}
                  <span className="mt-0.5 min-w-[2.5rem] text-right font-mono text-xs text-white/40">
                    {event.minute}&apos;
                  </span>

                  {/* İkon */}
                  <span className="text-base flex-shrink-0">
                    {getEventIcon(event.type, intensity)}
                  </span>

                  {/* Anlatım */}
                  <div className="flex-1 min-w-0">
                    <p className={getEventTextStyle(event.type, intensity)}>
                      {event.narration}
                    </p>
                    {/* Takım + asist bilgisi */}
                    <div className="flex items-center gap-2 mt-0.5">
                      {event.team && (
                        <span className="text-xs text-white/30">
                          {getTeamLabel(event.team)}
                        </span>
                      )}
                      {event.assistPlayer && (
                        <span className="text-xs text-white/20">
                          Asist: {event.assistPlayer}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Intensity göstergesi (sadece yüksek intensity) */}
                  {intensity >= 4 && (
                    <div className="flex-shrink-0 flex items-center">
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map(i => (
                          <div
                            key={i}
                            className={`w-1 h-2 rounded-full ${
                              i <= intensity
                                ? intensity >= 5
                                  ? 'bg-yellow-400'
                                  : 'bg-green-400'
                                : 'bg-white/10'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
