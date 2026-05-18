'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Trophy,
  Calendar,
  Users,
  ChevronRight,
  Star,
  Award,
  Clock,
  Zap,
  Shield,
} from 'lucide-react';
import {
  type CupSeason,
  type CupDefinition,
  type CupScheduleEntry,
  type CupStandingEntry,
  type CupBracket,
  type BracketMatch,
  type BracketRound,
  type CupNews,
  CUP_DEFINITIONS,
  getCupSchedule,
  getCupStandings,
  formatCupBracket,
  getCupTypeName,
  getRoundTypeName,
  generateCupNews,
} from '@/lib/fm/cupSystem';

// ─── Props ──────────────────────────────────────────────────────────

interface CupTabProps {
  cupSeasons: CupSeason[];
  teamName: string;
}

// ─── Helpers ────────────────────────────────────────────────────────

function fmtMoney(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M Kredi`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K Kredi`;
  return `${n.toLocaleString('tr-TR')} Kredi`;
}

function importanceColor(importance: string): string {
  switch (importance) {
    case 'critical': return 'text-red-400 bg-red-500/10 border-red-500/20';
    case 'high': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
    case 'medium': return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
    default: return 'text-white/40 bg-white/5 border-white/10';
  }
}

function importanceLabel(importance: string): string {
  switch (importance) {
    case 'critical': return 'KRİTİK';
    case 'high': return 'ÖNEMLİ';
    case 'medium': return 'ORTA';
    default: return 'BİLGİ';
  }
}

// ─── Sub-components ─────────────────────────────────────────────────

function BracketMatchCard({ match, teamName }: { match: BracketMatch; teamName: string }) {
  const isHomeWinner = match.winner === match.homeTeam;
  const isAwayWinner = match.winner === match.awayTeam;
  const isOurTeam = match.homeTeam === teamName || match.awayTeam === teamName;

  const scoreText = (() => {
    if (match.status === 'scheduled' || !match.homeScore) return 'vs';
    let s = `${match.homeScore} - ${match.awayScore}`;
    if (match.homePenalties != null) {
      s += ` (${match.homePenalties}-${match.awayPenalties} pen)`;
    }
    return s;
  })();

  return (
    <div
      className={`
        rounded-lg border p-2 text-[10px] min-w-[140px]
        ${isOurTeam
          ? 'border-amber-500/40 bg-amber-500/5 shadow-[0_0_12px_rgba(245,158,11,0.08)]'
          : 'border-white/[0.06] bg-white/[0.02]'
        }
      `}
    >
      <div
        className={`font-bold truncate ${isHomeWinner ? 'text-amber-300' : 'text-white/60'}`}
      >
        {match.homeTeam === teamName && <Star size={9} className="inline text-amber-400 mr-1" />}
        {match.homeTeam}
      </div>
      <div className="text-center font-mono font-black text-white/30 my-1">{scoreText}</div>
      <div
        className={`font-bold truncate ${isAwayWinner ? 'text-amber-300' : 'text-white/60'}`}
      >
        {match.awayTeam === teamName && <Star size={9} className="inline text-amber-400 mr-1" />}
        {match.awayTeam}
      </div>
    </div>
  );
}

function BracketColumn({
  round,
  teamName,
  isLastRound,
}: {
  round: BracketRound;
  teamName: string;
  isLastRound: boolean;
}) {
  return (
    <div className="flex flex-col gap-3 min-w-[160px]">
      <div className="flex items-center gap-2 mb-1 px-1">
        {isLastRound ? (
          <Trophy size={12} className="text-amber-400" />
        ) : (
          <ChevronRight size={12} className="text-white/20" />
        )}
        <span className="text-[9px] font-black uppercase tracking-widest text-amber-400/80">
          {round.name}
        </span>
      </div>
      {round.matches.length === 0 && (
        <div className="text-[10px] text-white/20 italic px-1">Henüz kura çekilmedi</div>
      )}
      {round.matches.map((m) => (
        <BracketMatchCard key={m.id} match={m} teamName={teamName} />
      ))}
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────

export default function CupTab({ cupSeasons, teamName }: CupTabProps) {
  const [activeCupIdx, setActiveCupIdx] = useState(0);
  const [activeSection, setActiveSection] = useState<'bracket' | 'schedule' | 'standings' | 'news'>('bracket');

  // Find the cup definition for the currently selected cup season
  const cupSeason = cupSeasons[activeCupIdx] ?? null;
  const cupDef = CUP_DEFINITIONS.find((d) => d.id === cupSeason?.cupId);

  // Derived data
  const bracket: CupBracket | null = useMemo(
    () => (cupSeason ? formatCupBracket(cupSeason, cupDef) : null),
    [cupSeason, cupDef],
  );
  const schedule: CupScheduleEntry[] = useMemo(
    () => (cupSeason ? getCupSchedule(cupSeason) : []),
    [cupSeason],
  );
  const standings: CupStandingEntry[] = useMemo(
    () => (cupSeason ? getCupStandings(cupSeason) : []),
    [cupSeason],
  );
  const news: CupNews[] = useMemo(
    () => (cupSeason ? generateCupNews(cupSeason) : []),
    [cupSeason],
  );

  // Our team's participation
  const ourStanding = standings.find((s) => s.name === teamName);
  const remainingTeams = standings.filter((s) => s.status === 'active').length;
  const isOurTeamActive = ourStanding?.status === 'active';
  const isChampion = cupSeason?.winner === teamName;
  const isRunnerUp = cupSeason?.runnerUp === teamName;

  // Filter schedule for our team's matches
  const ourSchedule = schedule.filter(
    (e) => e.match.homeTeam === teamName || e.match.awayTeam === teamName,
  );
  const otherSchedule = schedule.filter(
    (e) => e.match.homeTeam !== teamName && e.match.awayTeam !== teamName,
  );

  if (cupSeasons.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-white/20">
        <Trophy size={48} className="mb-4 opacity-30" />
        <p className="text-sm font-bold uppercase tracking-widest">Kupa Verisi Bulunamadı</p>
        <p className="text-xs mt-1">Bu sezonda katıldığınız bir kupa turnuvası yok.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Cup Selector Tabs ── */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        {cupSeasons.map((cs, idx) => {
          const isActive = idx === activeCupIdx;
          const def = CUP_DEFINITIONS.find((d) => d.id === cs.cupId);
          const cupIcon = def?.type === 'super_cup'
            ? Shield
            : def?.type === 'youth_cup'
            ? Zap
            : Trophy;

          return (
            <button
              key={cs.id}
              onClick={() => { setActiveCupIdx(idx); setActiveSection('bracket'); }}
              className={`
                flex items-center gap-2 px-4 py-3 rounded-xl border text-xs font-black uppercase tracking-widest
                whitespace-nowrap transition-all shrink-0
                ${isActive
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.08)]'
                  : 'bg-white/[0.02] border-white/[0.06] text-white/40 hover:text-white/60 hover:border-white/10'
                }
              `}
            >
              <cupIcon size={14} />
              <span>{cs.name}</span>
              {cs.isCompleted && cs.winner && (
                <Award size={10} className="text-amber-400" />
              )}
            </button>
          );
        })}
      </div>

      {/* ── Current Round Info ── */}
      {cupSeason && (
        <motion.div
          key={`round-info-${cupSeason.id}`}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl border p-5"
          style={{
            borderColor: isChampion
              ? 'rgba(245,158,11,0.4)'
              : isOurTeamActive
              ? 'rgba(245,158,11,0.2)'
              : 'rgba(255,255,255,0.06)',
            background: isChampion
              ? 'linear-gradient(135deg, rgba(245,158,11,0.08), rgba(245,158,11,0.02))'
              : 'rgba(13,17,23,1)',
          }}
        >
          <div className="absolute -right-4 -top-4 opacity-[0.03]">
            <Trophy size={100} />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center border
                  ${isChampion
                    ? 'bg-amber-500/20 border-amber-500/30'
                    : isOurTeamActive
                    ? 'bg-amber-500/10 border-amber-500/20'
                    : 'bg-white/5 border-white/10'
                  }`}
              >
                {isChampion ? (
                  <Trophy size={28} className="text-amber-400" />
                ) : isRunnerUp ? (
                  <Award size={28} className="text-gray-300" />
                ) : (
                  <Shield size={28} className={isOurTeamActive ? 'text-amber-400' : 'text-white/30'} />
                )}
              </div>
              <div>
                <h2 className="text-lg font-black uppercase tracking-tight text-white">
                  {isChampion
                    ? `${cupSeason.name} Şampiyonu! 🏆`
                    : isRunnerUp
                    ? 'Finalist'
                    : cupSeason.isCompleted
                    ? 'Turnuva Tamamlandı'
                    : `${cupDef?.rounds[cupSeason.currentRound - 1]?.name || 'Tur'}`
                  }
                </h2>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-white/30">
                    Sezon {cupSeason.year}
                  </span>
                  {!cupSeason.isCompleted && (
                    <>
                      <span className="w-1 h-1 rounded-full bg-white/20" />
                      <span className="text-[10px] font-bold text-amber-400/60">
                        {remainingTeams} takım kaldı
                      </span>
                    </>
                  )}
                  {isOurTeamActive && !cupSeason.isCompleted && (
                    <>
                      <span className="w-1 h-1 rounded-full bg-white/20" />
                      <span className="text-[10px] font-bold text-emerald-400">
                        Turnuvada aktif
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Prize money */}
            <div className="text-right">
              <div className="text-[9px] font-bold uppercase tracking-widest text-white/20 mb-1">
                Şampiyon Ödülü
              </div>
              <div className="text-xl font-black font-mono text-amber-400">
                {fmtMoney(cupSeason.championReward)}
              </div>
            </div>
          </div>

          {/* Winner / Runner-up display */}
          {(isChampion || isRunnerUp || cupSeason.isCompleted) && (
            <div className="mt-4 pt-4 border-t border-white/[0.06] flex items-center gap-4">
              {cupSeason.winner && (
                <div className="flex items-center gap-2">
                  <Trophy size={12} className="text-amber-400" />
                  <span className="text-[10px] font-black text-amber-300">{cupSeason.winner}</span>
                </div>
              )}
              {cupSeason.runnerUp && (
                <div className="flex items-center gap-2">
                  <Award size={12} className="text-gray-400" />
                  <span className="text-[10px] font-bold text-white/40">{cupSeason.runnerUp}</span>
                </div>
              )}
            </div>
          )}
        </motion.div>
      )}

      {/* ── Section Tabs ── */}
      <div className="flex gap-1 bg-white/[0.02] border border-white/[0.06] rounded-xl p-1">
        {([
          { id: 'bracket' as const, label: 'Braket', icon: Trophy },
          { id: 'schedule' as const, label: 'Fikstür', icon: Calendar },
          { id: 'standings' as const, label: 'Takımlar', icon: Users },
          { id: 'news' as const, label: 'Haberler', icon: Star },
        ]).map((tab) => {
          const isActive = activeSection === tab.id;
          const count =
            tab.id === 'schedule' ? schedule.length :
            tab.id === 'standings' ? standings.length :
            tab.id === 'news' ? news.length : null;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id)}
              className={`
                flex items-center gap-1.5 px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest
                transition-all flex-1 justify-center
                ${isActive
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  : 'text-white/30 hover:text-white/50 border border-transparent'
                }
              `}
            >
              <tab.icon size={12} />
              <span>{tab.label}</span>
              {count !== null && count > 0 && (
                <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[8px] font-black
                  ${isActive ? 'bg-amber-500/20 text-amber-300' : 'bg-white/5 text-white/20'}`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Section Content ── */}
      <AnimatePresence mode="wait">
        {/* BRACKET */}
        {activeSection === 'bracket' && bracket && (
          <motion.div
            key="bracket"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="overflow-x-auto pb-2"
          >
            <div className="flex gap-4 items-start min-w-max">
              {bracket.rounds.map((round, idx) => (
                <BracketColumn
                  key={round.roundNumber}
                  round={round}
                  teamName={teamName}
                  isLastRound={idx === bracket.rounds.length - 1}
                />
              ))}
            </div>

            {bracket.rounds.length === 0 && (
              <div className="flex items-center justify-center py-16 text-white/20">
                <Trophy size={32} className="mr-3 opacity-30" />
                <span className="text-sm font-bold uppercase tracking-widest">
                  Henüz braket oluşturulmadı
                </span>
              </div>
            )}
          </motion.div>
        )}

        {/* SCHEDULE */}
        {activeSection === 'schedule' && (
          <motion.div
            key="schedule"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {/* Our matches */}
            {ourSchedule.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3 px-1">
                  <Star size={12} className="text-amber-400" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-amber-400/80">
                    Takımımızın Maçları
                  </span>
                </div>
                <div className="space-y-2">
                  {ourSchedule.map((entry, idx) => {
                    const isHome = entry.match.homeTeam === teamName;
                    const opponent = isHome ? entry.match.awayTeam : entry.match.homeTeam;

                    return (
                      <div
                        key={`our-${idx}`}
                        className="flex items-center justify-between gap-4 p-4 rounded-xl border border-amber-500/20 bg-amber-500/5"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0 border border-amber-500/20">
                            <Calendar size={16} className="text-amber-400" />
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-white truncate">
                              <span className="text-amber-300">{teamName}</span>
                              <span className="text-white/30 mx-2">{isHome ? 'vs' : '@'}</span>
                              <span className="text-white/70">{opponent}</span>
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[9px] font-bold uppercase tracking-widest text-white/30">
                                {entry.roundName}
                              </span>
                              <span className="text-[9px] text-white/15">•</span>
                              <span className="text-[9px] text-white/25">{entry.match.date}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {isHome ? (
                            <span className="px-2 py-1 text-[8px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full">
                              Ev
                            </span>
                          ) : (
                            <span className="px-2 py-1 text-[8px] font-black uppercase tracking-widest bg-white/5 text-white/40 border border-white/10 rounded-full">
                              Dep
                            </span>
                          )}
                          {entry.daysUntilMatch >= 0 && (
                            <span className="text-[10px] font-mono font-bold text-white/20">
                              {entry.daysUntilMatch}g
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Other matches */}
            {otherSchedule.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3 px-1">
                  <Clock size={12} className="text-white/20" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/30">
                    Diğer Maçlar
                  </span>
                </div>
                <div className="space-y-1 max-h-72 overflow-y-auto">
                  {otherSchedule.map((entry, idx) => (
                    <div
                      key={`other-${idx}`}
                      className="flex items-center justify-between gap-4 p-3 rounded-lg border border-white/[0.04] bg-white/[0.01] hover:bg-white/[0.03] transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                          <Calendar size={12} className="text-white/20" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-[10px] font-bold text-white/50 truncate">
                            {entry.match.homeTeam}
                            <span className="text-white/20 mx-1">vs</span>
                            {entry.match.awayTeam}
                          </div>
                          <span className="text-[8px] text-white/15">
                            {entry.roundName} • {entry.match.date}
                          </span>
                        </div>
                      </div>
                      {entry.daysUntilMatch >= 0 && (
                        <span className="text-[9px] font-mono text-white/15 shrink-0">
                          {entry.daysUntilMatch}g
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {schedule.length === 0 && (
              <div className="flex items-center justify-center py-16 text-white/20">
                <Calendar size={32} className="mr-3 opacity-30" />
                <span className="text-sm font-bold uppercase tracking-widest">
                  Planlanmış maç yok
                </span>
              </div>
            )}
          </motion.div>
        )}

        {/* STANDINGS */}
        {activeSection === 'standings' && (
          <motion.div
            key="standings"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <div className="rounded-xl border border-white/[0.06] overflow-hidden">
              {/* Header */}
              <div className="grid grid-cols-[1fr_auto_auto] gap-4 px-4 py-3 bg-white/[0.03] border-b border-white/[0.06]">
                <span className="text-[9px] font-black uppercase tracking-widest text-white/30">Takım</span>
                <span className="text-[9px] font-black uppercase tracking-widest text-white/30">Tur</span>
                <span className="text-[9px] font-black uppercase tracking-widest text-white/30">Durum</span>
              </div>

              {/* Body */}
              <div className="max-h-96 overflow-y-auto">
                {standings.map((entry, idx) => {
                  const isOurTeam = entry.name === teamName;

                  return (
                    <div
                      key={entry.name}
                      className={`
                        grid grid-cols-[1fr_auto_auto] gap-4 px-4 py-3 border-b border-white/[0.03]
                        transition-colors
                        ${isOurTeam
                          ? 'bg-amber-500/5 border-l-2 border-l-amber-500'
                          : 'hover:bg-white/[0.02]'
                        }
                      `}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className={`
                          w-6 text-center text-[10px] font-mono font-bold
                          ${isOurTeam ? 'text-amber-400' : 'text-white/20'}
                        `}>
                          {idx + 1}
                        </span>
                        <span className={`
                          text-xs font-bold truncate
                          ${isOurTeam ? 'text-amber-300' : 'text-white/60'}
                        `}>
                          {isOurTeam && <Star size={9} className="inline text-amber-400 mr-1" />}
                          {entry.name}
                        </span>
                      </div>
                      <span className={`text-[10px] font-bold ${isOurTeam ? 'text-amber-400' : 'text-white/30'}`}>
                        {entry.roundName || '-'}
                      </span>
                      <span>
                        {entry.status === 'active' ? (
                          <span className="px-2 py-0.5 text-[8px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full">
                            Aktif
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 text-[8px] font-black uppercase tracking-widest bg-red-500/5 text-red-400/60 border border-red-500/10 rounded-full">
                            Elendi
                          </span>
                        )}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* NEWS */}
        {activeSection === 'news' && (
          <motion.div
            key="news"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-3"
          >
            {news.length > 0 ? (
              news.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl border border-white/[0.06] bg-white/[0.01] p-4 hover:bg-white/[0.02] transition-colors"
                >
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <h4 className="text-sm font-bold text-white/80 leading-tight">{item.headline}</h4>
                    <span className={`shrink-0 px-2 py-0.5 text-[7px] font-black uppercase tracking-widest border rounded-full whitespace-nowrap ${importanceColor(item.importance)}`}>
                      {importanceLabel(item.importance)}
                    </span>
                  </div>
                  <p className="text-[11px] text-white/30 leading-relaxed mb-3">{item.body}</p>
                  <div className="flex items-center gap-3">
                    <span className="text-[9px] text-white/15">{item.date}</span>
                    <span className="text-[9px] text-white/15">•</span>
                    <span className="text-[9px] text-white/20">{getCupTypeName(cupSeason?.type ?? 'domestic_cup')}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex items-center justify-center py-16 text-white/20">
                <Star size={32} className="mr-3 opacity-30" />
                <span className="text-sm font-bold uppercase tracking-widest">
                  Henüz haber yok
                </span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Team's Cup Run Summary ── */}
      {cupSeason && ourStanding && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="rounded-xl border border-amber-500/10 bg-amber-500/[0.03] p-4"
        >
          <div className="flex items-center gap-2 mb-3">
            <Trophy size={14} className="text-amber-400/60" />
            <span className="text-[10px] font-black uppercase tracking-widest text-amber-400/60">
              {teamName} – Kupa Yolculuğu
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {cupSeason.rounds.map((round) => {
              const played = round.matches.some(
                (m) => m.homeTeam === teamName || m.awayTeam === teamName,
              );
              const teamMatch = round.matches.find(
                (m) => m.homeTeam === teamName || m.awayTeam === teamName,
              );
              const isCurrentRound = round.roundNumber === cupSeason.currentRound;

              return (
                <span
                  key={round.roundNumber}
                  className={`
                    px-3 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-lg border
                    ${played && teamMatch
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      : isCurrentRound && ourStanding.status === 'active'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 animate-pulse'
                      : 'bg-white/[0.02] text-white/15 border-white/[0.06]'
                    }
                  `}
                >
                  {round.name}
                  {played && teamMatch && ' ✓'}
                </span>
              );
            })}
          </div>
        </motion.div>
      )}
    </div>
  );
}
