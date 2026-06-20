'use client';

import React, { useState, useMemo } from 'react';
import {
  Calendar,
  Trophy,
  TrendingUp,
  TrendingDown,
  Clock,
  Star,
  ChevronRight,
  Shield,
  Play,
  Eye,
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════════════

interface FixtureItem {
  id: string;
  tur: number;
  match_date: string;
  match_time: string;
  home_team: string;
  away_team: string;
  home_score: number | null;
  away_score: number | null;
  status: string;
}

interface StandingsItem {
  team_name: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  gf: number;
  ga: number;
  gd: number;
  points: number;
}

interface FixtureScreenProps {
  fixtures: FixtureItem[];
  standings: StandingsItem[];
  teamName: string;
  currentTur: number;
  onMatchClick?: (fixture: FixtureItem) => void;
  onWatchMatch?: (fixture: FixtureItem) => void;
}

// ═══════════════════════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════════════════════

type TabId = 'fikstur' | 'puandurumu' | 'sonuclar';
type FormResult = 'W' | 'D' | 'L';

function getResultColor(
  homeTeam: string,
  awayTeam: string,
  userTeam: string,
  homeScore: number | null,
  awayScore: number | null,
): string | null {
  if (homeScore === null || awayScore === null) return null;
  if (homeTeam === userTeam) {
    return homeScore > awayScore ? 'emerald' : homeScore === awayScore ? 'amber' : 'red';
  }
  if (awayTeam === userTeam) {
    return awayScore > homeScore ? 'emerald' : awayScore === homeScore ? 'amber' : 'red';
  }
  return null;
}

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
  } catch {
    return dateStr;
  }
}

function getTeamForm(teamName: string, fixtures: FixtureItem[]): FormResult[] {
  try {
    const completed = fixtures
      .filter(f => f.home_score !== null && f.away_score !== null)
      .filter(f => f.home_team === teamName || f.away_team === teamName)
      .sort((a, b) => new Date(b.match_date).getTime() - new Date(a.match_date).getTime());

    return completed.slice(0, 5).map(f => {
      if (f.home_team === teamName) {
        return f.home_score! > f.away_score! ? 'W' : f.home_score! === f.away_score! ? 'D' : 'L';
      } else {
        return f.away_score! > f.home_score! ? 'W' : f.away_score! === f.home_score! ? 'D' : 'L';
      }
    });
  } catch {
    return [];
  }
}

function getTeamInitials(name: string): string {
  try {
    const words = name.split(' ').filter(Boolean);
    if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  } catch {
    return '??';
  }
}

// ═══════════════════════════════════════════════════════════════════════
// Sub-Components
// ═══════════════════════════════════════════════════════════════════════

function FormDots({ results }: { results: FormResult[] }) {
  const colorMap: Record<FormResult, string> = {
    W: 'bg-emerald-500',
    D: 'bg-amber-500',
    L: 'bg-red-500',
  };
  return (
    <div className="flex gap-1 justify-center">
      {results.map((result, i) => (
        <div key={i} className={`w-2.5 h-2.5 rounded-full ${colorMap[result]}`} />
      ))}
      {results.length === 0 && <span className="text-[10px] text-white/15">—</span>}
    </div>
  );
}

function ResultPill({ result }: { result: 'W' | 'D' | 'L' | null }) {
  if (!result) return null;
  const config: Record<'W' | 'D' | 'L', { bg: string; text: string; label: string }> = {
    W: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', label: 'G' },
    D: { bg: 'bg-amber-500/20', text: 'text-amber-400', label: 'B' },
    L: { bg: 'bg-red-500/20', text: 'text-red-400', label: 'M' },
  };
  const c = config[result];
  return (
    <span className={`${c.bg} ${c.text} text-[10px] font-black px-1.5 py-0.5 rounded`}>
      {c.label}
    </span>
  );
}

function TeamShield({ name, isUser }: { name: string; isUser: boolean }) {
  return (
    <div
      className={`w-7 h-7 rounded-md flex items-center justify-center text-[10px] font-black shrink-0 ${
        isUser
          ? 'bg-gradient-to-br from-amber-500/25 to-amber-700/15 text-amber-300 border border-amber-500/30'
          : 'bg-white/[0.05] text-white/40 border border-white/10'
      }`}
    >
      {getTeamInitials(name)}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// Main Component
// ═══════════════════════════════════════════════════════════════════════

export default function FixtureScreen({
  fixtures,
  standings,
  teamName,
  currentTur,
  onMatchClick,
  onWatchMatch,
}: FixtureScreenProps) {
  const [activeTab, setActiveTab] = useState<TabId>('fikstur');

  // ── Derived data ──────────────────────────────────────────────────

  const fixturesByTur = useMemo(() => {
    const map = new Map<number, FixtureItem[]>();
    for (const f of fixtures) {
      const list = map.get(f.tur) ?? [];
      list.push(f);
      map.set(f.tur, list);
    }
    return new Map([...map.entries()].sort((a, b) => a[0] - b[0]));
  }, [fixtures]);

  const completedFixtures = useMemo(
    () =>
      fixtures
        .filter((f) => f.home_score !== null && f.away_score !== null)
        .sort((a, b) => {
          if (b.tur !== a.tur) return b.tur - a.tur;
          return b.match_date.localeCompare(a.match_date);
        }),
    [fixtures],
  );

  const sortedStandings = useMemo(
    () => [...standings].sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.gd !== a.gd) return b.gd - a.gd;
      return b.gf - a.gf;
    }),
    [standings],
  );

  // ── Tabs ──────────────────────────────────────────────────────────
  const tabs: { id: TabId; label: string }[] = [
    { id: 'fikstur', label: 'Fikstür' },
    { id: 'puandurumu', label: 'Puan Durumu' },
    { id: 'sonuclar', label: 'Sonuçlar' },
  ];

  const renderTabs = () => (
    <div className="flex gap-1 p-1 bg-white/[0.03] rounded-xl border border-white/[0.06]">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`flex-1 px-4 py-2.5 rounded-lg text-[11px] font-bold uppercase tracking-widest transition-all ${
            activeTab === tab.id
              ? 'bg-amber-500/15 text-amber-300 shadow-md shadow-amber-500/5'
              : 'text-white/30 hover:text-white/50 hover:bg-white/[0.03]'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );

  // ── Header ────────────────────────────────────────────────────────
  const renderHeader = () => (
    <div className="flex items-center justify-between mb-5">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
          <Trophy className="w-5 h-5 text-amber-400" />
        </div>
        <div>
          <h2 className="text-sm font-black text-white uppercase tracking-wider">
            Managerium Ligi
          </h2>
          <p className="text-[10px] text-white/30 uppercase tracking-widest">
            2024-25 Sezonu · {currentTur}. Hafta
          </p>
        </div>
      </div>
      <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06]">
        <Calendar className="w-3.5 h-3.5 text-white/30" />
        <span className="text-[10px] font-semibold text-white/40">
          {fixtures.length} maç · {standings.length} takım
        </span>
      </div>
    </div>
  );

  // ── Fixture List ──────────────────────────────────────────────────
  const renderFixtureList = () => (
    <div className="space-y-4 max-h-[700px] overflow-y-auto pr-1 custom-scrollbar">
      {fixturesByTur.size === 0 && (
        <div className="text-center py-12">
          <Calendar className="w-8 h-8 text-white/10 mx-auto mb-3" />
          <p className="text-xs text-white/25">Fikstür bulunamadı</p>
        </div>
      )}

      {[...fixturesByTur.entries()].map(([tur, matches]) => {
        const isCurrentTur = tur === currentTur;
        const hasUserMatch = matches.some(
          (m) => m.home_team === teamName || m.away_team === teamName,
        );

        return (
          <div
            key={tur}
            className={`rounded-xl border overflow-hidden ${
              isCurrentTur
                ? 'border-amber-500/25 bg-gradient-to-b from-amber-500/[0.04] to-transparent'
                : 'border-white/[0.06] bg-white/[0.01]'
            }`}
          >
            {/* Week separator header */}
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/[0.04] bg-white/[0.02]">
              <Shield
                className={`w-3.5 h-3.5 ${isCurrentTur ? 'text-amber-400' : 'text-white/20'}`}
              />
              <span
                className={`text-[10px] font-bold uppercase tracking-widest ${
                  isCurrentTur ? 'text-amber-300' : 'text-white/30'
                }`}
              >
                {tur}. Hafta
              </span>
              <span className="text-[10px] text-white/15 font-semibold">
                — {matches.length} Maç
              </span>
              {isCurrentTur && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold uppercase tracking-wider">
                  Mevcut
                </span>
              )}
              {hasUserMatch && !isCurrentTur && (
                <Star className="w-3 h-3 text-amber-400/50 ml-auto" />
              )}
            </div>

            {/* Match cards */}
            <div className="divide-y divide-white/[0.03]">
              {matches.map((match) => {
                const isUserMatch = match.home_team === teamName || match.away_team === teamName;
                const isFinished = match.status === 'finished' || match.status === 'completed' || match.home_score !== null;
                const isLive = match.status === 'live';
                const isScheduled = !isFinished && !isLive;
                const resultColor = isFinished
                  ? getResultColor(match.home_team, match.away_team, teamName, match.home_score, match.away_score)
                  : null;

                // Compute user result
                let userResult: FormResult | null = null;
                if (isUserMatch && isFinished && match.home_score !== null && match.away_score !== null) {
                  const isHome = match.home_team === teamName;
                  const myScore = isHome ? match.home_score : match.away_score;
                  const oppScore = isHome ? match.away_score : match.home_score;
                  userResult = myScore > oppScore ? 'W' : myScore === oppScore ? 'D' : 'L';
                }

                return (
                  <div
                    key={match.id}
                    className={`relative ${
                      isUserMatch
                        ? isLive
                          ? 'bg-red-500/[0.04] border-l-2 border-l-red-500'
                          : isScheduled
                            ? 'bg-amber-500/[0.03] border-l-2 border-l-amber-500'
                            : userResult === 'W'
                              ? 'bg-emerald-500/[0.03] border-l-2 border-l-emerald-500'
                              : userResult === 'L'
                                ? 'bg-red-500/[0.02] border-l-2 border-l-red-500/60'
                                : 'bg-amber-500/[0.02] border-l-2 border-l-amber-500/50'
                        : ''
                    }`}
                  >
                    <button
                      onClick={() => onMatchClick?.(match)}
                      className="w-full text-left px-4 py-3 transition-all hover:bg-white/[0.03]"
                    >
                      <div className="flex items-center gap-3">
                        {/* Time / Score / Status */}
                        <div className="w-16 shrink-0 text-center">
                          {isFinished ? (
                            <div className="flex flex-col items-center gap-0.5">
                              <span
                                className={`text-[11px] font-black tabular-nums ${
                                  resultColor === 'emerald'
                                    ? 'text-emerald-400'
                                    : resultColor === 'amber'
                                      ? 'text-amber-400'
                                      : resultColor === 'red'
                                        ? 'text-red-400'
                                        : 'text-white/30'
                                }`}
                              >
                                {match.home_score} - {match.away_score}
                              </span>
                              <ResultPill result={userResult} />
                            </div>
                          ) : isLive ? (
                            <div className="flex items-center justify-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                              <span className="text-[10px] font-black text-red-400 uppercase">Canlı</span>
                            </div>
                          ) : (
                            <span className="text-[10px] text-white/25 font-semibold font-mono">
                              {match.match_time || '--:--'}
                            </span>
                          )}
                        </div>

                        {/* Teams */}
                        <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                          <div className="flex items-center gap-2">
                            <TeamShield name={match.home_team} isUser={match.home_team === teamName} />
                            <span
                              className={`text-[11px] font-bold truncate ${
                                match.home_team === teamName
                                  ? 'text-amber-300'
                                  : isFinished
                                    ? 'text-white/50'
                                    : 'text-white/70'
                              }`}
                            >
                              {match.home_team}
                            </span>
                            {isUserMatch && match.home_team === teamName && (
                              <span className="ml-1 px-1.5 py-0.5 rounded text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/20">EV</span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <TeamShield name={match.away_team} isUser={match.away_team === teamName} />
                            <span
                              className={`text-[11px] font-bold truncate ${
                                match.away_team === teamName
                                  ? 'text-amber-300'
                                  : isFinished
                                    ? 'text-white/50'
                                    : 'text-white/70'
                              }`}
                            >
                              {match.away_team}
                            </span>
                            {isUserMatch && match.away_team === teamName && (
                              <span className="ml-1 px-1.5 py-0.5 rounded text-[10px] font-black uppercase bg-sky-500/20 text-sky-400 border border-sky-500/20">DEP</span>
                            )}
                          </div>
                        </div>

                        {/* Date */}
                        <div className="w-14 shrink-0 text-right hidden sm:block">
                          <span className="text-[10px] text-white/20">
                            {formatDate(match.match_date)}
                          </span>
                        </div>

                        {/* Action button or chevron - No İzle for scheduled, only for live/finished */}
                        {isUserMatch && isLive && onWatchMatch ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onWatchMatch(match);
                            }}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-red-600/90 to-red-500/90 hover:from-red-500 hover:to-red-400 text-white text-[10px] font-black uppercase tracking-widest rounded-lg shadow-[0_0_10px_rgba(239,68,68,0.2)] transition-all hover:scale-105 active:scale-95 animate-pulse shrink-0"
                          >
                            <Eye size={9} />
                            İzle
                          </button>
                        ) : (
                          <ChevronRight className="w-3.5 h-3.5 text-white/10 shrink-0" />
                        )}
                      </div>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );

  // ── League Table ──────────────────────────────────────────────────
  const renderLeagueTable = () => (
    <div className="rounded-xl border border-white/[0.06] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px]">
          <thead>
            <tr className="bg-white/[0.03] border-b border-white/[0.06]">
              <th className="text-left px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-white/30 w-8">#</th>
              <th className="text-left px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-white/30">Takım</th>
              <th className="text-center px-2 py-2.5 text-[10px] font-bold uppercase tracking-widest text-white/30 w-10">O</th>
              <th className="text-center px-2 py-2.5 text-[10px] font-bold uppercase tracking-widest text-white/30 w-10">G</th>
              <th className="text-center px-2 py-2.5 text-[10px] font-bold uppercase tracking-widest text-white/30 w-10">B</th>
              <th className="text-center px-2 py-2.5 text-[10px] font-bold uppercase tracking-widest text-white/30 w-10">M</th>
              <th className="text-center px-2 py-2.5 text-[10px] font-bold uppercase tracking-widest text-white/30 w-10">AG</th>
              <th className="text-center px-2 py-2.5 text-[10px] font-bold uppercase tracking-widest text-white/30 w-10">YG</th>
              <th className="text-center px-2 py-2.5 text-[10px] font-bold uppercase tracking-widest text-white/30 w-12">Averaj</th>
              <th className="text-center px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-white/30 w-28">Form</th>
              <th className="text-center px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-white/30 w-12">Puan</th>
            </tr>
          </thead>
          <tbody>
            {sortedStandings.length === 0 && (
              <tr>
                <td colSpan={11} className="text-center py-8 text-[11px] text-white/20">
                  Puan durumu verisi yok
                </td>
              </tr>
            )}
            {sortedStandings.map((team, idx) => {
              const position = idx + 1;
              const isUserTeam = team.team_name === teamName;
              const isInPromotionZone = position <= 3;
              const isInRelegationZone = position > sortedStandings.length - 3;
              const positionChange = 0;

              return (
                <tr
                  key={team.team_name}
                  className={`border-b border-white/[0.03] transition-colors hover:bg-white/[0.03] ${
                    isUserTeam
                      ? 'bg-amber-500/[0.06] border-l-2 border-l-amber-500'
                      : ''
                  } ${isInPromotionZone && !isUserTeam ? 'bg-emerald-500/[0.03]' : ''} ${
                    isInRelegationZone && !isUserTeam ? 'bg-red-500/[0.03]' : ''
                  }`}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center">
                      {position <= 3 ? (
                        <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-black flex items-center justify-center">
                          {position}
                        </span>
                      ) : isInRelegationZone ? (
                        <span className="w-5 h-5 rounded-full bg-red-500/20 text-red-400 text-[10px] font-black flex items-center justify-center">
                          {position}
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-white/30 w-5 text-center">
                          {position}
                        </span>
                      )}
                      <span className="ml-1.5">
                        {positionChange > 0 ? (
                          <TrendingUp className="w-3 h-3 text-emerald-400" />
                        ) : positionChange < 0 ? (
                          <TrendingDown className="w-3 h-3 text-red-400" />
                        ) : (
                          <div className="w-3 h-3 flex items-center justify-center">
                            <div className="w-1 h-1 rounded-full bg-white/15" />
                          </div>
                        )}
                      </span>
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold ${
                          isUserTeam
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-white/[0.05] text-white/40'
                        }`}
                      >
                        {team.team_name.slice(0, 2).toUpperCase()}
                      </div>
                      <span
                        className={`text-[11px] font-bold truncate max-w-[140px] ${
                          isUserTeam ? 'text-amber-300' : 'text-white/70'
                        }`}
                      >
                        {team.team_name}
                      </span>
                    </div>
                  </td>

                  <td className="text-center px-2 py-3 text-[11px] font-semibold text-white/40">{team.played}</td>
                  <td className="text-center px-2 py-3 text-[11px] font-semibold text-emerald-400/60">{team.won}</td>
                  <td className="text-center px-2 py-3 text-[11px] font-semibold text-amber-400/60">{team.drawn}</td>
                  <td className="text-center px-2 py-3 text-[11px] font-semibold text-red-400/60">{team.lost}</td>
                  <td className="text-center px-2 py-3 text-[11px] font-semibold text-white/40">{team.gf}</td>
                  <td className="text-center px-2 py-3 text-[11px] font-semibold text-white/40">{team.ga}</td>
                  <td className="text-center px-2 py-3">
                    <span
                      className={`text-[11px] font-bold ${
                        team.gd > 0 ? 'text-emerald-400' : team.gd < 0 ? 'text-red-400' : 'text-white/30'
                      }`}
                    >
                      {team.gd > 0 ? '+' : ''}{team.gd}
                    </span>
                  </td>
                  <td className="text-center px-3 py-3">
                    <FormDots results={getTeamForm(team.team_name, fixtures)} />
                  </td>
                  <td className="text-center px-4 py-3">
                    <span className="text-[12px] font-black text-white/80 bg-white/[0.05] px-2 py-0.5 rounded-md">
                      {team.points}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Zone legend */}
      <div className="flex items-center gap-4 px-4 py-2.5 border-t border-white/[0.04] bg-white/[0.01]">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-sm bg-emerald-500/30 border border-emerald-500/40" />
          <span className="text-[10px] text-white/25">Şampiyonluk / Yükselme</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-sm bg-red-500/30 border border-red-500/40" />
          <span className="text-[10px] text-white/25">Düşme</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-sm bg-amber-500/30 border border-amber-500/40" />
          <span className="text-[10px] text-white/25">Takımın</span>
        </div>
      </div>
    </div>
  );

  // ── Results (Sonuçlar) ────────────────────────────────────────────
  const renderResults = () => (
    <div className="space-y-2 max-h-[700px] overflow-y-auto pr-1 custom-scrollbar">
      {completedFixtures.length === 0 && (
        <div className="text-center py-12">
          <Clock className="w-8 h-8 text-white/10 mx-auto mb-3" />
          <p className="text-xs text-white/25">Henüz sonuç bulunmuyor</p>
        </div>
      )}

      {completedFixtures.map((match) => {
        const isUserMatch = match.home_team === teamName || match.away_team === teamName;
        const resultColor = getResultColor(
          match.home_team,
          match.away_team,
          teamName,
          match.home_score,
          match.away_score,
        );

        let userResultLabel: string | null = null;
        if (isUserMatch && resultColor) {
          if (resultColor === 'emerald') userResultLabel = 'GALİBİYET';
          else if (resultColor === 'amber') userResultLabel = 'BERABERLİK';
          else userResultLabel = 'MAĞLUBİYET';
        }

        let userResult: FormResult | null = null;
        if (isUserMatch && match.home_score !== null && match.away_score !== null) {
          const isHome = match.home_team === teamName;
          const myScore = isHome ? match.home_score : match.away_score;
          const oppScore = isHome ? match.away_score : match.home_score;
          userResult = myScore > oppScore ? 'W' : myScore === oppScore ? 'D' : 'L';
        }

        return (
          <button
            key={match.id}
            onClick={() => onMatchClick?.(match)}
            className={`w-full text-left px-4 py-3.5 rounded-xl border transition-all hover:bg-white/[0.03] ${
              isUserMatch
                ? userResult === 'W'
                  ? 'bg-emerald-500/[0.04] border-emerald-500/20'
                  : userResult === 'L'
                    ? 'bg-red-500/[0.03] border-red-500/15'
                    : 'bg-amber-500/[0.04] border-amber-500/20'
                : 'bg-white/[0.01] border-white/[0.06]'
            }`}
          >
            <div className="flex items-center gap-3">
              {/* Result badge */}
              <div className="w-16 shrink-0">
                {isUserMatch && resultColor ? (
                  <span
                    className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                      resultColor === 'emerald'
                        ? 'bg-emerald-500/15 text-emerald-400'
                        : resultColor === 'amber'
                          ? 'bg-amber-500/15 text-amber-400'
                          : 'bg-red-500/15 text-red-400'
                    }`}
                  >
                    {userResultLabel}
                  </span>
                ) : (
                  <span className="text-[10px] text-white/20">
                    {match.tur}. H
                  </span>
                )}
              </div>

              {/* Match info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  {/* Home team */}
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <TeamShield name={match.home_team} isUser={match.home_team === teamName} />
                    <span
                      className={`text-[11px] font-bold truncate ${
                        match.home_team === teamName ? 'text-amber-300' : 'text-white/60'
                      }`}
                    >
                      {match.home_team}
                    </span>
                    {isUserMatch && match.home_team === teamName && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/20">EV</span>
                    )}
                  </div>

                  {/* Score box */}
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/[0.04] border border-white/[0.06] shrink-0">
                    <span
                      className={`text-sm font-black tabular-nums ${
                        isUserMatch && resultColor === 'emerald' ? 'text-emerald-400'
                          : isUserMatch && resultColor === 'red' ? 'text-red-400' : 'text-white/70'
                      }`}
                    >
                      {match.home_score}
                    </span>
                    <span className="text-[10px] text-white/20">-</span>
                    <span
                      className={`text-sm font-black tabular-nums ${
                        isUserMatch && resultColor === 'emerald' ? 'text-emerald-400'
                          : isUserMatch && resultColor === 'red' ? 'text-red-400' : 'text-white/70'
                      }`}
                    >
                      {match.away_score}
                    </span>
                  </div>

                  {/* Away team */}
                  <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
                    {isUserMatch && match.away_team === teamName && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-black uppercase bg-sky-500/20 text-sky-400 border border-sky-500/20">DEP</span>
                    )}
                    <span
                      className={`text-[11px] font-bold truncate ${
                        match.away_team === teamName ? 'text-amber-300' : 'text-white/60'
                      }`}
                    >
                      {match.away_team}
                    </span>
                    <TeamShield name={match.away_team} isUser={match.away_team === teamName} />
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-[10px] text-white/15">
                    {formatDate(match.match_date)} · {match.match_time}
                  </span>
                </div>
              </div>

              <ChevronRight className="w-3.5 h-3.5 text-white/10 shrink-0" />
            </div>
          </button>
        );
      })}
    </div>
  );

  // ── Main ──────────────────────────────────────────────────────────
  return (
    <div className="w-full space-y-5">
      {renderHeader()}
      {renderTabs()}

      <div>
        {activeTab === 'fikstur' && renderFixtureList()}
        {activeTab === 'puandurumu' && renderLeagueTable()}
        {activeTab === 'sonuclar' && renderResults()}
      </div>
    </div>
  );
}
