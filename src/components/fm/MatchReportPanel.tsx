'use client';

import { useMemo } from 'react';
import {
  Target,
  Shield,
  Zap,
  Star,
  Clock,
  Activity,
  Wind,
  Sun,
  Cloud,
  CloudSnow,
  AlertTriangle,
  TrendingUp,
  ArrowRightLeft,
  CircleDot,
  CircleOff,
} from 'lucide-react';
import {
  type EnhancedMatchResult,
  type MatchEvent,
  type PlayerMatchRating,
  type MatchStats,
  generateMatchReport,
} from '@/lib/fm/enhancedMatchEngine';

// ─── Props ────────────────────────────────────────────────────────────────────
interface MatchReportPanelProps {
  result: EnhancedMatchResult;
  homeTeamName: string;
  awayTeamName: string;
  homeFormation?: string;
  awayFormation?: string;
  weather?: string;
}

// ─── Event display config ─────────────────────────────────────────────────────
const EVENT_DISPLAY: Record<
  string,
  { icon: string; label: string; color: string; bg: string; showInTimeline: boolean }
> = {
  goal:         { icon: '⚽', label: 'Gol',          color: 'text-emerald-400',  bg: 'bg-emerald-400/15',  showInTimeline: true  },
  shot_saved:   { icon: '🧤', label: 'Şut Kurtarıldı', color: 'text-sky-300',   bg: 'bg-sky-300/10',      showInTimeline: true  },
  shot_wide:    { icon: '📍', label: 'Şut Auta',      color: 'text-white/40',    bg: 'bg-white/5',          showInTimeline: true  },
  shot_post:    { icon: '📍', label: 'Direk',         color: 'text-white/40',    bg: 'bg-white/5',          showInTimeline: true  },
  foul:         { icon: '⚠️', label: 'Faul',          color: 'text-white/30',    bg: 'bg-white/5',          showInTimeline: false },
  yellow_card:  { icon: '🟡', label: 'Sarı Kart',     color: 'text-yellow-400',  bg: 'bg-yellow-400/15',   showInTimeline: true  },
  red_card:     { icon: '🔴', label: 'Kırmızı Kart', color: 'text-red-400',     bg: 'bg-red-400/15',      showInTimeline: true  },
  injury:       { icon: '🤕', label: 'Sakatlık',      color: 'text-orange-400',  bg: 'bg-orange-400/15',   showInTimeline: true  },
  substitution: { icon: '🔄', label: 'Değişiklik',    color: 'text-blue-400',    bg: 'bg-blue-400/15',     showInTimeline: true  },
  offside:      { icon: '🚩', label: 'Ofsayt',        color: 'text-white/40',    bg: 'bg-white/5',          showInTimeline: true  },
  save:         { icon: '🧤', label: 'Kurtarış',      color: 'text-sky-300',     bg: 'bg-sky-300/10',      showInTimeline: false },
  corner:       { icon: '🚩', label: 'Korner',        color: 'text-white/30',    bg: 'bg-white/5',          showInTimeline: false },
  free_kick:    { icon: '🚩', label: 'Serbest Vuruş', color: 'text-white/30',    bg: 'bg-white/5',          showInTimeline: false },
  penalty:      { icon: '🚩', label: 'Penaltı',       color: 'text-white/30',    bg: 'bg-white/5',          showInTimeline: false },
  tackle:       { icon: '🛡️', label: 'Müdahale',      color: 'text-white/25',    bg: 'bg-white/5',          showInTimeline: false },
  interception: { icon: '✋', label: 'Top Kapma',     color: 'text-white/25',    bg: 'bg-white/5',          showInTimeline: false },
  chance:       { icon: '💡', label: 'Fırsat',        color: 'text-white/30',    bg: 'bg-white/5',          showInTimeline: false },
};

// ─── Weather icon mapping ─────────────────────────────────────────────────────
function WeatherIcon({ weather }: { weather: string }) {
  switch (weather) {
    case 'sunny':
      return <Sun className="w-3.5 h-3.5 text-amber-400" />;
    case 'rainy':
      return <Cloud className="w-3.5 h-3.5 text-blue-400" />;
    case 'snowy':
      return <CloudSnow className="w-3.5 h-3.5 text-blue-200" />;
    case 'windy':
      return <Wind className="w-3.5 h-3.5 text-gray-400" />;
    default:
      return <Sun className="w-3.5 h-3.5 text-amber-400" />;
  }
}

function weatherLabel(w: string): string {
  switch (w) {
    case 'sunny': return 'Güneşli';
    case 'rainy': return 'Yağmurlu';
    case 'snowy': return 'Karlı';
    case 'windy': return 'Rüzgarlı';
    default: return w;
  }
}

// ─── Rating color helper ──────────────────────────────────────────────────────
function ratingColor(r: number): string {
  if (r >= 8.0) return 'text-emerald-300';
  if (r >= 7.0) return 'text-emerald-400';
  if (r >= 6.0) return 'text-yellow-400';
  if (r >= 5.0) return 'text-orange-400';
  return 'text-red-400';
}

function ratingBg(r: number): string {
  if (r >= 8.0) return 'bg-emerald-400/20 border-emerald-400/30';
  if (r >= 7.0) return 'bg-emerald-400/15 border-emerald-400/20';
  if (r >= 6.0) return 'bg-yellow-400/15 border-yellow-400/20';
  if (r >= 5.0) return 'bg-orange-400/15 border-orange-400/20';
  return 'bg-red-400/15 border-red-400/20';
}

// ─── Position badge color ─────────────────────────────────────────────────────
function positionBadge(pos: string): string {
  switch (pos) {
    case 'GK':  return 'bg-[#4A90E2]/20 text-[#4A90E2] border-[#4A90E2]/30';
    case 'DEF': return 'bg-[#50E3C2]/20 text-[#50E3C2] border-[#50E3C2]/30';
    case 'MID': return 'bg-[#F5A623]/20 text-[#F5A623] border-[#F5A623]/30';
    case 'FWD': return 'bg-[#D0021B]/20 text-[#D0021B] border-[#D0021B]/30';
    default:    return 'bg-[#9B9B9B]/20 text-[#9B9B9B] border-[#9B9B9B]/30';
  }
}

// ─── Stat Bar ─────────────────────────────────────────────────────────────────
function StatBar({
  label,
  homeVal,
  awayVal,
  isPercent = false,
  invertHome = false,
}: {
  label: string;
  homeVal: number;
  awayVal: number;
  isPercent?: boolean;
  invertHome?: boolean;
}) {
  const total = Math.max(homeVal + awayVal, 1);
  const homePct = invertHome
    ? Math.max((awayVal / total) * 100, 2)
    : Math.max((homeVal / total) * 100, 2);
  const awayPct = invertHome
    ? Math.max((homeVal / total) * 100, 2)
    : Math.max((awayVal / total) * 100, 2);

  const homeDisplay = isPercent ? `${homeVal}%` : String(homeVal);
  const awayDisplay = isPercent ? `${awayVal}%` : String(awayVal);

  return (
    <div className="flex items-center gap-2 text-[11px]">
      <span
        className={`w-7 text-right tabular-nums font-semibold ${
          homeVal > awayVal ? 'text-amber-400' : homeVal < awayVal ? 'text-white/40' : 'text-white/60'
        }`}
      >
        {homeDisplay}
      </span>
      <div className="flex-1 flex flex-col gap-[2px]">
        <div className="flex items-center gap-[2px]">
          <div className="flex-1 flex justify-end">
            <div
              className="h-[5px] rounded-l-full transition-all duration-500"
              style={{
                width: `${homePct}%`,
                backgroundColor: 'rgba(251, 191, 36, 0.7)',
              }}
            />
          </div>
          <div className="w-[2px] h-[5px] bg-white/10 rounded-full" />
          <div className="flex-1">
            <div
              className="h-[5px] rounded-r-full transition-all duration-500"
              style={{
                width: `${awayPct}%`,
                backgroundColor: 'rgba(96, 165, 250, 0.7)',
              }}
            />
          </div>
        </div>
        <span className="text-center text-[9px] text-white/30 leading-none">{label}</span>
      </div>
      <span
        className={`w-7 text-left tabular-nums font-semibold ${
          awayVal > homeVal ? 'text-blue-400' : awayVal < homeVal ? 'text-white/40' : 'text-white/60'
        }`}
      >
        {awayDisplay}
      </span>
    </div>
  );
}

// ─── Player Rating Row ────────────────────────────────────────────────────────
function PlayerRatingRow({ player, isMotm }: { player: PlayerMatchRating; isMotm: boolean }) {
  return (
    <div
      className={`flex items-center gap-2 px-2.5 py-1.5 rounded-md border transition-colors ${
        isMotm
          ? 'bg-amber-400/10 border-amber-400/25'
          : 'bg-white/[0.02] border-white/[0.04] hover:bg-white/[0.04]'
      }`}
    >
      {isMotm && (
        <div className="flex items-center justify-center w-4 h-4 shrink-0">
          <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
        </div>
      )}
      {!isMotm && <div className="w-4 shrink-0" />}
      <span className="flex-1 text-[11px] text-white/80 truncate">{player.playerName}</span>
      <span
        className={`inline-flex items-center px-1.5 py-[1px] rounded text-[9px] font-medium border ${positionBadge(
          player.position
        )}`}
      >
        {player.position}
      </span>
      {player.goals > 0 && (
        <span className="text-[9px] text-emerald-400 font-bold shrink-0">
          {player.goals > 1 ? `${player.goals}⚽` : '⚽'}
        </span>
      )}
      {player.assists > 0 && (
        <span className="text-[9px] text-blue-400 font-bold shrink-0">
          {player.assists > 1 ? `${player.assists}🅰️` : '🅰️'}
        </span>
      )}
      <span
        className={`inline-flex items-center justify-center min-w-[28px] px-1.5 py-[1px] rounded text-[11px] font-bold tabular-nums border ${ratingBg(
          player.rating
        )} ${ratingColor(player.rating)}`}
      >
        {player.rating.toFixed(1)}
      </span>
    </div>
  );
}

// ─── Timeline Event ───────────────────────────────────────────────────────────
function TimelineEvent({ event, homeTeamName, awayTeamName }: { event: MatchEvent; homeTeamName: string; awayTeamName: string }) {
  const config = EVENT_DISPLAY[event.type] || EVENT_DISPLAY.chance;
  const isHome = event.team === 'home';
  const teamColor = isHome ? 'text-amber-400' : 'text-blue-400';

  // Half separator
  if (event.minute === 0 && event.type === 'chance' && event.playerName === '') {
    return (
      <div className="flex items-center gap-2 pl-1">
        <div className="w-5 h-5 flex items-center justify-center shrink-0">
          <Activity className="w-3 h-3 text-white/30" />
        </div>
        <div className="flex-1 bg-white/[0.03] rounded px-2.5 py-1.5">
          <span className="text-[10px] text-white/50">{event.description}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-2 pl-1 group">
      {/* Minute + icon */}
      <div className="flex flex-col items-center shrink-0 w-5">
        <div
          className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${config.bg}`}
          title={`${event.minute}. dk — ${config.label}`}
        >
          <span className="text-[10px] leading-none">{config.icon}</span>
        </div>
        {event.minute <= 45 && (
          <div className="w-px flex-1 min-h-[6px] bg-white/[0.06]" />
        )}
      </div>
      {/* Content */}
      <div className={`flex-1 rounded px-2.5 py-1.5 border border-white/[0.03] ${config.bg} transition-colors group-hover:border-white/[0.08]`}>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-bold text-white/50 tabular-nums w-5 shrink-0">
            {event.minute}&apos;
          </span>
          <span className={`text-[10px] font-medium ${teamColor} shrink-0`}>
            {isHome ? homeTeamName : awayTeamName}
          </span>
          {event.playerName && (
            <>
              <span className="text-white/20 text-[10px]">·</span>
              <span className="text-[11px] text-white/80 font-medium truncate">{event.playerName}</span>
            </>
          )}
        </div>
        {event.description && (
          <p className="text-[10px] text-white/40 mt-0.5 leading-relaxed line-clamp-2">
            {event.description}
          </p>
        )}
        {event.assistPlayerName && event.type === 'goal' && (
          <span className="text-[9px] text-blue-400/70 mt-0.5 block">
            Asist: {event.assistPlayerName}
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Stat comparison row definition ───────────────────────────────────────────
interface StatRow {
  label: string;
  homeKey: keyof MatchStats;
  isPercent?: boolean;
  invertHome?: boolean;
}

const STAT_ROWS: StatRow[] = [
  { label: 'Pozisyon',     homeKey: 'posession',    isPercent: true  },
  { label: 'Şut',          homeKey: 'shots'                         },
  { label: 'Şut İsabet',   homeKey: 'shotsOnTarget'                  },
  { label: 'Pas',          homeKey: 'passes'                        },
  { label: 'Pas İsabet',   homeKey: 'passAccuracy', isPercent: true },
  { label: 'Faul',         homeKey: 'fouls'                         },
  { label: 'Sarı Kart',    homeKey: 'yellowCards'                   },
  { label: 'Kırmızı Kart', homeKey: 'redCards'                      },
  { label: 'Korner',       homeKey: 'corners'                       },
  { label: 'Ofsayt',       homeKey: 'offsides'                      },
];

// ─── Main Component ───────────────────────────────────────────────────────────
export default function MatchReportPanel({
  result,
  homeTeamName,
  awayTeamName,
  homeFormation,
  awayFormation,
  weather: weatherProp,
}: MatchReportPanelProps) {
  const weather = weatherProp || result.weather;

  // Memoize expensive computations
  const timelineEvents = useMemo(
    () =>
      result.events
        .filter((e) => EVENT_DISPLAY[e.type]?.showInTimeline || (e.minute === 0 && e.type === 'chance' && e.playerName === ''))
        .sort((a, b) => a.minute - b.minute),
    [result.events]
  );

  const homeRatings = useMemo(
    () => [...result.homePlayerRatings].sort((a, b) => b.rating - a.rating),
    [result.homePlayerRatings]
  );

  const awayRatings = useMemo(
    () => [...result.awayPlayerRatings].sort((a, b) => b.rating - a.rating),
    [result.awayPlayerRatings]
  );

  const motmPlayer = useMemo(
    () =>
      [...result.homePlayerRatings, ...result.awayPlayerRatings].find(
        (r) => r.playerId === result.manOfTheMatch
      ),
    [result.homePlayerRatings, result.awayPlayerRatings, result.manOfTheMatch]
  );

  const matchReport = useMemo(() => generateMatchReport(result), [result]);

  const homeWin = result.homeScore > result.awayScore;
  const awayWin = result.awayScore > result.homeScore;

  return (
    <div className="max-h-[85vh] overflow-y-auto bg-[#0d1117] rounded-xl border border-white/[0.06] shadow-2xl">
      {/* Custom scrollbar */}
      <style>{`
        .match-report-scroll::-webkit-scrollbar { width: 4px; }
        .match-report-scroll::-webkit-scrollbar-track { background: transparent; }
        .match-report-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 9999px; }
        .match-report-scroll::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.15); }
      `}</style>

      <div className="match-report-scroll max-h-[85vh] overflow-y-auto">
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* HEADER */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <div className="relative bg-gradient-to-b from-[#111820] to-[#0d1117] border-b border-white/[0.06] px-4 pt-5 pb-4">
          {/* Weather & meta */}
          <div className="flex items-center justify-center gap-2 mb-3">
            <WeatherIcon weather={weather} />
            <span className="text-[10px] text-white/40 font-medium">{weatherLabel(weather)}</span>
            <span className="text-white/10">|</span>
            <Clock className="w-3 h-3 text-white/30" />
            <span className="text-[10px] text-white/40 font-medium">90 dk</span>
          </div>

          {/* Score header */}
          <div className="flex items-center justify-between">
            {/* Home team */}
            <div className="flex items-center gap-2 flex-1 justify-end">
              <div className="text-right">
                <p className={`text-[13px] font-bold leading-tight ${homeWin ? 'text-white' : 'text-white/70'}`}>
                  {homeTeamName}
                </p>
                {homeFormation && (
                  <span className="inline-block mt-0.5 px-1.5 py-[1px] rounded text-[9px] font-medium bg-white/[0.06] text-white/40 border border-white/[0.04]">
                    {homeFormation}
                  </span>
                )}
              </div>
              <div className="w-8 h-8 rounded-lg bg-amber-400/10 border border-amber-400/20 flex items-center justify-center">
                <Shield className="w-4 h-4 text-amber-400" />
              </div>
            </div>

            {/* Score */}
            <div className="flex items-center gap-2 mx-4 sm:mx-6">
              <span className={`text-3xl sm:text-4xl font-black tabular-nums ${homeWin ? 'text-amber-400' : 'text-white/70'}`}>
                {result.homeScore}
              </span>
              <span className="text-xl text-white/20 font-light">-</span>
              <span className={`text-3xl sm:text-4xl font-black tabular-nums ${awayWin ? 'text-blue-400' : 'text-white/70'}`}>
                {result.awayScore}
              </span>
            </div>

            {/* Away team */}
            <div className="flex items-center gap-2 flex-1 justify-start">
              <div className="w-8 h-8 rounded-lg bg-blue-400/10 border border-blue-400/20 flex items-center justify-center">
                <Shield className="w-4 h-4 text-blue-400" />
              </div>
              <div className="text-left">
                <p className={`text-[13px] font-bold leading-tight ${awayWin ? 'text-white' : 'text-white/70'}`}>
                  {awayTeamName}
                </p>
                {awayFormation && (
                  <span className="inline-block mt-0.5 px-1.5 py-[1px] rounded text-[9px] font-medium bg-white/[0.06] text-white/40 border border-white/[0.04]">
                    {awayFormation}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Possession mini bar */}
          <div className="mt-3 flex items-center gap-2">
            <span className="text-[9px] text-amber-400/70 font-semibold tabular-nums w-8 text-right">
              {result.homeStats.possession}%
            </span>
            <div className="flex-1 flex items-center h-[4px] bg-white/[0.04] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-400/80 to-amber-400/50 rounded-l-full transition-all duration-700"
                style={{ width: `${result.homeStats.possession}%` }}
              />
              <div className="w-[1px] bg-white/10" />
              <div
                className="h-full bg-gradient-to-l from-blue-400/80 to-blue-400/50 rounded-r-full transition-all duration-700"
                style={{ width: `${result.awayStats.possession}%` }}
              />
            </div>
            <span className="text-[9px] text-blue-400/70 font-semibold tabular-nums w-8 text-left">
              {result.awayStats.possession}%
            </span>
          </div>
          <p className="text-center text-[8px] text-white/20 mt-1 tracking-wider uppercase">Topla Oynama</p>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* MAN OF THE MATCH */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {motmPlayer && (
          <div className="px-4 pt-4 pb-3 border-b border-white/[0.04]">
            <div className="relative bg-gradient-to-r from-amber-400/[0.06] via-amber-400/[0.03] to-transparent rounded-lg border border-amber-400/15 px-4 py-3 overflow-hidden">
              {/* Glow */}
              <div className="absolute top-0 left-0 w-20 h-20 bg-amber-400/10 rounded-full blur-2xl -translate-x-4 -translate-y-4" />
              <div className="relative flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-amber-400/15 border border-amber-400/25">
                  <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-amber-400/60 font-semibold tracking-wider uppercase">
                    Maçın Yıldızı
                  </p>
                  <p className="text-[13px] font-bold text-white truncate mt-0.5">
                    {motmPlayer.playerName}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {motmPlayer.goals > 0 && (
                    <span className="text-[11px] text-emerald-400 font-bold">
                      {motmPlayer.goals}⚽
                    </span>
                  )}
                  {motmPlayer.assists > 0 && (
                    <span className="text-[11px] text-blue-400 font-bold">
                      {motmPlayer.assists}🅰️
                    </span>
                  )}
                  <div
                    className={`flex items-center justify-center min-w-[38px] px-2 py-1 rounded-md border ${ratingBg(
                      motmPlayer.rating
                    )}`}
                  >
                    <span className={`text-[14px] font-black tabular-nums ${ratingColor(motmPlayer.rating)}`}>
                      {motmPlayer.rating.toFixed(1)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* MATCH TIMELINE */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <div className="px-4 pt-4 pb-3 border-b border-white/[0.04]">
          <div className="flex items-center gap-2 mb-3">
            <Activity className="w-3.5 h-3.5 text-white/40" />
            <h3 className="text-[11px] font-bold text-white/60 tracking-wider uppercase">
              Maç Zaman Çizelgesi
            </h3>
          </div>

          {/* Half separator */}
          <div className="flex items-center gap-2 mb-2">
            <div className="flex-1 h-px bg-white/[0.06]" />
            <span className="text-[9px] text-white/25 font-medium px-2">İLK YARI</span>
            <div className="flex-1 h-px bg-white/[0.06]" />
          </div>

          <div className="space-y-1.5">
            {timelineEvents
              .filter((e) => e.minute <= 45 || e.minute === 0)
              .map((e, i) => (
                <TimelineEvent key={`ht-${e.minute}-${i}`} event={e} homeTeamName={homeTeamName} awayTeamName={awayTeamName} />
              ))}
          </div>

          {/* HT / 2H separator */}
          <div className="flex items-center gap-2 my-3">
            <div className="flex-1 h-px bg-white/[0.06]" />
            <span className="text-[9px] text-amber-400/50 font-bold px-2 bg-amber-400/[0.06] rounded py-0.5">
              DEVRE ARASI
            </span>
            <div className="flex-1 h-px bg-white/[0.06]" />
          </div>

          <div className="flex items-center gap-2 mb-2">
            <div className="flex-1 h-px bg-white/[0.06]" />
            <span className="text-[9px] text-white/25 font-medium px-2">İKİNCİ YARI</span>
            <div className="flex-1 h-px bg-white/[0.06]" />
          </div>

          <div className="space-y-1.5">
            {timelineEvents
              .filter((e) => e.minute > 45)
              .map((e, i) => (
                <TimelineEvent key={`at-${e.minute}-${i}`} event={e} homeTeamName={homeTeamName} awayTeamName={awayTeamName} />
              ))}
          </div>

          {/* Full time */}
          <div className="flex items-center gap-2 mt-3">
            <div className="flex-1 h-px bg-white/[0.06]" />
            <span className="text-[9px] text-white/25 font-bold px-2 bg-white/[0.03] rounded py-0.5">
              MAÇ SONU
            </span>
            <div className="flex-1 h-px bg-white/[0.06]" />
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* STATS COMPARISON */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <div className="px-4 pt-4 pb-4 border-b border-white/[0.04]">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-3.5 h-3.5 text-white/40" />
            <h3 className="text-[11px] font-bold text-white/60 tracking-wider uppercase">
              İstatistik Karşılaştırması
            </h3>
          </div>

          {/* Column headers */}
          <div className="flex items-center gap-2 mb-2">
            <span className="w-7 text-right text-[9px] font-bold text-amber-400/60 tracking-wider">
              {homeTeamName.substring(0, 3).toUpperCase()}
            </span>
            <div className="flex-1" />
            <span className="w-7 text-left text-[9px] font-bold text-blue-400/60 tracking-wider">
              {awayTeamName.substring(0, 3).toUpperCase()}
            </span>
          </div>

          <div className="space-y-2">
            {STAT_ROWS.map((row) => (
              <StatBar
                key={row.label}
                label={row.label}
                homeVal={result.homeStats[row.homeKey] as number}
                awayVal={result.awayStats[row.homeKey] as number}
                isPercent={row.isPercent}
                invertHome={row.invertHome}
              />
            ))}
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* PLAYER RATINGS */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <div className="px-4 pt-4 pb-4 border-b border-white/[0.04]">
          <div className="flex items-center gap-2 mb-3">
            <Target className="w-3.5 h-3.5 text-white/40" />
            <h3 className="text-[11px] font-bold text-white/60 tracking-wider uppercase">
              Oyuncu Puanları
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Home players */}
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                <span className="text-[10px] font-bold text-amber-400/70 tracking-wider uppercase">
                  {homeTeamName}
                </span>
              </div>
              <div className="space-y-1">
                {homeRatings.map((p) => (
                  <PlayerRatingRow
                    key={p.playerId}
                    player={p}
                    isMotm={p.playerId === result.manOfTheMatch}
                  />
                ))}
              </div>
            </div>

            {/* Away players */}
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                <span className="text-[10px] font-bold text-blue-400/70 tracking-wider uppercase">
                  {awayTeamName}
                </span>
              </div>
              <div className="space-y-1">
                {awayRatings.map((p) => (
                  <PlayerRatingRow
                    key={p.playerId}
                    player={p}
                    isMotm={p.playerId === result.manOfTheMatch}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* MATCH REPORT TEXT */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <div className="px-4 pt-4 pb-5">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-3.5 h-3.5 text-white/40" />
            <h3 className="text-[11px] font-bold text-white/60 tracking-wider uppercase">
              Maç Raporu
            </h3>
          </div>
          <div className="bg-white/[0.02] rounded-lg border border-white/[0.04] px-4 py-3">
            <pre className="text-[10px] text-white/50 leading-relaxed whitespace-pre-wrap font-sans">
              {matchReport}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
