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
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

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
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

type TabId = 'fikstur' | 'puandurumu' | 'sonuclar';

function getResultColor(
  homeTeam: string,
  awayTeam: string,
  userTeam: string,
  homeScore: number | null,
  awayScore: number | null,
): string | null {
  if (homeScore === null || awayScore === null) return null;
  if (homeTeam === userTeam) {
    return homeScore > awayScore
      ? 'emerald'
      : homeScore === awayScore
        ? 'amber'
        : 'red';
  }
  if (awayTeam === userTeam) {
    return awayScore > homeScore
      ? 'emerald'
      : awayScore === homeScore
        ? 'amber'
        : 'red';
  }
  return null;
}

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'short',
    });
  } catch {
    return dateStr;
  }
}

function getTeamForm(teamName: string, fixtures: FixtureItem[]): ('W' | 'D' | 'L')[] {
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
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export default function FixtureScreen({
  fixtures,
  standings,
  teamName,
  currentTur,
  onMatchClick,
}: FixtureScreenProps) {
  const [activeTab, setActiveTab] = useState<TabId>('fikstur');

  // ── Derived data ──────────────────────────────────────────────────────

  // Group fixtures by tur
  const fixturesByTur = useMemo(() => {
    const map = new Map<number, FixtureItem[]>();
    for (const f of fixtures) {
      const list = map.get(f.tur) ?? [];
      list.push(f);
      map.set(f.tur, list);
    }
    // Sort turs descending
    return new Map(
      [...map.entries()].sort((a, b) => b[0] - a[0]),
    );
  }, [fixtures]);

  // Completed fixtures (has scores)
  const completedFixtures = useMemo(
    () =>
      fixtures
        .filter((f) => f.home_score !== null && f.away_score !== null)
        .sort((a, b) => {
          // Sort by tur desc, then date desc
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

  // ── Render: Tab Switcher ───────────────────────────────────────────────
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

  // ── Render: League Header ──────────────────────────────────────────────
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

  // ── Render: Fixture List (Fikstür) ────────────────────────────────────
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
                ? 'border-amber-500/30 bg-amber-500/[0.03]'
                : 'border-white/[0.06] bg-white/[0.01]'
            }`}
          >
            {/* Matchday header */}
            <div className="flex items-center gap-2 px-4 py-2 border-b border-white/[0.04] bg-white/[0.02]">
              <Shield
                className={`w-3.5 h-3.5 ${isCurrentTur ? 'text-amber-400' : 'text-white/20'}`}
              />
              <span
                className={`text-[10px] font-bold uppercase tracking-widest ${
                  isCurrentTur ? 'text-amber-300' : 'text-white/30'
                }`}
              >
                {tur}. Hafta — {matches.length} Maç
              </span>
              {isCurrentTur && (
                <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold uppercase tracking-wider">
                  Mevcut
                </span>
              )}
              {hasUserMatch && !isCurrentTur && (
                <Star className="w-3 h-3 text-amber-400/50 ml-auto" />
              )}
            </div>

            {/* Matches */}
            <div className="divide-y divide-white/[0.03]">
              {matches.map((match) => {
                const isUserMatch =
                  match.home_team === teamName ||
                  match.away_team === teamName;
                const isFinished =
                  match.status === 'finished' ||
                  match.status === 'completed' ||
                  match.home_score !== null;
                const isLive = match.status === 'live';
                const isScheduled =
                  !isFinished && !isLive;
                const resultColor = isFinished
                  ? getResultColor(
                      match.home_team,
                      match.away_team,
                      teamName,
                      match.home_score,
                      match.away_score,
                    )
                  : null;

                return (
                  <button
                    key={match.id}
                    onClick={() => onMatchClick?.(match)}
                    className={`w-full text-left px-4 py-3 transition-all hover:bg-white/[0.03] ${
                      isUserMatch
                        ? 'bg-amber-500/[0.04] border-l-2 border-l-amber-500'
                        : ''
                    } ${isFinished ? 'opacity-70' : ''} ${
                      isLive ? 'bg-emerald-500/[0.05]' : ''
                    } ${isUserMatch && isScheduled ? 'animate-[subtlePulse_3s_ease-in-out_infinite]' : ''}`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Time / Status */}
                      <div className="w-14 shrink-0 text-right">
                        {isFinished ? (
                          <span
                            className={`text-[10px] font-bold ${
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
                        ) : isLive ? (
                          <div className="flex items-center justify-end gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            <span className="text-[10px] font-bold text-emerald-400">
                              CANLI
                            </span>
                          </div>
                        ) : (
                          <span className="text-[10px] text-white/25 font-semibold">
                            {match.match_time || '--:--'}
                          </span>
                        )}
                      </div>

                      {/* Teams */}
                      <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                        <div className="flex items-center gap-2">
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
                            <span className="ml-1 px-1.5 py-0.5 rounded text-[7px] font-black uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/20">EV</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
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
                            <span className="ml-1 px-1.5 py-0.5 rounded text-[7px] font-black uppercase bg-blue-500/20 text-blue-400 border border-blue-500/20">DEP</span>
                          )}
                        </div>
                      </div>

                      {/* Date */}
                      <div className="w-16 shrink-0 text-right">
                        <span className="text-[9px] text-white/20">
                          {formatDate(match.match_date)}
                        </span>
                      </div>

                      {/* Arrow */}
                      <ChevronRight className="w-3.5 h-3.5 text-white/10 shrink-0" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );

  // ── Render: League Table (Puan Durumu) ────────────────────────────────
  const renderLeagueTable = () => (
    <div className="rounded-xl border border-white/[0.06] overflow-hidden">
      {/* Table header */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px]">
          <thead>
            <tr className="bg-white/[0.03] border-b border-white/[0.06]">
              <th className="text-left px-4 py-2.5 text-[9px] font-bold uppercase tracking-widest text-white/30 w-8">
                #
              </th>
              <th className="text-left px-4 py-2.5 text-[9px] font-bold uppercase tracking-widest text-white/30">
                Takım
              </th>
              <th className="text-center px-2 py-2.5 text-[9px] font-bold uppercase tracking-widest text-white/30 w-10">
                O
              </th>
              <th className="text-center px-2 py-2.5 text-[9px] font-bold uppercase tracking-widest text-white/30 w-10">
                G
              </th>
              <th className="text-center px-2 py-2.5 text-[9px] font-bold uppercase tracking-widest text-white/30 w-10">
                B
              </th>
              <th className="text-center px-2 py-2.5 text-[9px] font-bold uppercase tracking-widest text-white/30 w-10">
                M
              </th>
              <th className="text-center px-2 py-2.5 text-[9px] font-bold uppercase tracking-widest text-white/30 w-10">
                AG
              </th>
              <th className="text-center px-2 py-2.5 text-[9px] font-bold uppercase tracking-widest text-white/30 w-10">
                YG
              </th>
              <th className="text-center px-2 py-2.5 text-[9px] font-bold uppercase tracking-widest text-white/30 w-12">
                Averaj
              </th>
              <th className="text-center px-3 py-2.5 text-[9px] font-bold uppercase tracking-widest text-white/30 w-28">
                Form
              </th>
              <th className="text-center px-4 py-2.5 text-[9px] font-bold uppercase tracking-widest text-white/30 w-12">
                Puan
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedStandings.length === 0 && (
              <tr>
                <td
                  colSpan={11}
                  className="text-center py-8 text-[11px] text-white/20"
                >
                  Puan durumu verisi yok
                </td>
              </tr>
            )}
            {sortedStandings.map((team, idx) => {
              const position = idx + 1;
              const isUserTeam = team.team_name === teamName;
              const isInPromotionZone = position <= 3;
              const isInRelegationZone =
                position > sortedStandings.length - 3;

              // Determine position change arrow (simulated from previous week)
              const positionChange = 0; // Would come from API, defaulting to same

              return (
                <tr
                  key={team.team_name}
                  className={`border-b border-white/[0.03] transition-colors hover:bg-white/[0.03] ${
                    isUserTeam
                      ? 'bg-amber-500/[0.06] border-l-2 border-l-amber-500'
                      : ''
                  } ${isInPromotionZone && !isUserTeam ? 'bg-emerald-500/[0.03]' : ''} ${
                    isInRelegationZone && !isUserTeam
                      ? 'bg-red-500/[0.03]'
                      : ''
                  }`}
                >
                  {/* Position */}
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
                      {/* Position change indicator */}
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

                  {/* Team name */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-6 h-6 rounded-md flex items-center justify-center text-[9px] font-bold ${
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

                  {/* Stats */}
                  <td className="text-center px-2 py-3 text-[11px] font-semibold text-white/40">
                    {team.played}
                  </td>
                  <td className="text-center px-2 py-3 text-[11px] font-semibold text-emerald-400/60">
                    {team.won}
                  </td>
                  <td className="text-center px-2 py-3 text-[11px] font-semibold text-amber-400/60">
                    {team.drawn}
                  </td>
                  <td className="text-center px-2 py-3 text-[11px] font-semibold text-red-400/60">
                    {team.lost}
                  </td>
                  <td className="text-center px-2 py-3 text-[11px] font-semibold text-white/40">
                    {team.gf}
                  </td>
                  <td className="text-center px-2 py-3 text-[11px] font-semibold text-white/40">
                    {team.ga}
                  </td>
                  <td className="text-center px-2 py-3">
                    <span
                      className={`text-[11px] font-bold ${
                        team.gd > 0
                          ? 'text-emerald-400'
                          : team.gd < 0
                            ? 'text-red-400'
                            : 'text-white/30'
                      }`}
                    >
                      {team.gd > 0 ? '+' : ''}
                      {team.gd}
                    </span>
                  </td>
                  {/* Form dots */}
                  <td className="text-center px-3 py-3">
                    <div className="flex gap-1 justify-center">
                      {getTeamForm(team.team_name, fixtures).map((result, i) => (
                        <div key={i} className={`w-2.5 h-2.5 rounded-full ${
                          result === 'W' ? 'bg-emerald-500' : result === 'D' ? 'bg-amber-500' : 'bg-red-500'
                        }`} />
                      ))}
                      {getTeamForm(team.team_name, fixtures).length === 0 && (
                        <span className="text-[9px] text-white/15">—</span>
                      )}
                    </div>
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
          <span className="text-[9px] text-white/25">Şampiyonluk / Yükselme</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-sm bg-red-500/30 border border-red-500/40" />
          <span className="text-[9px] text-white/25">Düşme</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-sm bg-amber-500/30 border border-amber-500/40" />
          <span className="text-[9px] text-white/25">Takımın</span>
        </div>
      </div>
    </div>
  );

  // ── Render: Results (Sonuçlar) ─────────────────────────────────────────
  const renderResults = () => (
    <div className="space-y-2 max-h-[700px] overflow-y-auto pr-1 custom-scrollbar">
      {completedFixtures.length === 0 && (
        <div className="text-center py-12">
          <Clock className="w-8 h-8 text-white/10 mx-auto mb-3" />
          <p className="text-xs text-white/25">Henüz sonuç bulunmuyor</p>
        </div>
      )}

      {completedFixtures.map((match) => {
        const isUserMatch =
          match.home_team === teamName || match.away_team === teamName;
        const resultColor = getResultColor(
          match.home_team,
          match.away_team,
          teamName,
          match.home_score,
          match.away_score,
        );

        let userResult: string | null = null;
        if (isUserMatch && resultColor) {
          if (resultColor === 'emerald') userResult = 'GALİBİYET';
          else if (resultColor === 'amber') userResult = 'BERABERLİK';
          else userResult = 'MAĞLUBİYET';
        }

        return (
          <button
            key={match.id}
            onClick={() => onMatchClick?.(match)}
            className={`w-full text-left px-4 py-3 rounded-xl border transition-all hover:bg-white/[0.03] ${
              isUserMatch
                ? `bg-amber-500/[0.04] border-amber-500/20`
                : 'bg-white/[0.01] border-white/[0.06]'
            }`}
          >
            <div className="flex items-center gap-3">
              {/* Result badge */}
              <div className="w-16 shrink-0">
                {isUserMatch && resultColor ? (
                  <span
                    className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                      resultColor === 'emerald'
                        ? 'bg-emerald-500/15 text-emerald-400'
                        : resultColor === 'amber'
                          ? 'bg-amber-500/15 text-amber-400'
                          : 'bg-red-500/15 text-red-400'
                    }`}
                  >
                    {userResult}
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
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span
                      className={`text-[11px] font-bold truncate ${
                        match.home_team === teamName
                          ? 'text-amber-300'
                          : 'text-white/60'
                      }`}
                    >
                      {match.home_team}
                    </span>
                    {isUserMatch && match.home_team === teamName && (
                      <span className="ml-1 px-1.5 py-0.5 rounded text-[7px] font-black uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/20">EV</span>
                    )}
                  </div>
                  <div
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/[0.04] border border-white/[0.06]`}
                  >
                    <span
                      className={`text-sm font-black ${
                        isUserMatch && resultColor === 'emerald'
                          ? 'text-emerald-400'
                          : isUserMatch && resultColor === 'red'
                            ? 'text-red-400'
                            : 'text-white/70'
                      }`}
                    >
                      {match.home_score}
                    </span>
                    <span className="text-[9px] text-white/20">-</span>
                    <span
                      className={`text-sm font-black ${
                        isUserMatch && resultColor === 'emerald'
                          ? 'text-emerald-400'
                          : isUserMatch && resultColor === 'red'
                            ? 'text-red-400'
                            : 'text-white/70'
                      }`}
                    >
                      {match.away_score}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
                    <span
                      className={`text-[11px] font-bold truncate ${
                        match.away_team === teamName
                          ? 'text-amber-300'
                          : 'text-white/60'
                      }`}
                    >
                      {match.away_team}
                    </span>
                    {isUserMatch && match.away_team === teamName && (
                      <span className="ml-1 px-1.5 py-0.5 rounded text-[7px] font-black uppercase bg-blue-500/20 text-blue-400 border border-blue-500/20">DEP</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[9px] text-white/15">
                    {formatDate(match.match_date)} · {match.match_time}
                  </span>
                </div>
              </div>

              {/* Chevron */}
              <ChevronRight className="w-3.5 h-3.5 text-white/10 shrink-0" />
            </div>
          </button>
        );
      })}
    </div>
  );

  // ── Main ──────────────────────────────────────────────────────────────
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
