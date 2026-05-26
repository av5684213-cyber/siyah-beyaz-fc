'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Trophy, Star, Award, Shield, Target, TrendingUp, Crown, Medal } from 'lucide-react';
import type { SeasonSummary, SeasonAward, SeasonBadge, AwardType } from '@/lib/fm/types';
import { AWARD_LABELS } from '@/lib/fm/types';
import { loadAllSeasonSummaries, loadSeasonAwards, getChampionshipCount } from '@/lib/fm/seasonAwardsService';
import { loadHallOfFame, type HallOfFameEntry } from '@/lib/fm/hallOfFameService';

// ─── Props ────────────────────────────────────────────────────────────

interface TrophyCabinetTabProps {
  profileId: string;
  teamName: string;
}

// ─── Milestone Badges ─────────────────────────────────────────────────

interface MilestoneBadge {
  id: string;
  label: string;
  description: string;
  icon: string;
  color: string;
  bgColor: string;
  requirement: string;
  unlocked: boolean;
}

function computeMilestones(
  championships: number,
  totalAwards: number,
  goldenBoots: number,
  mvpCount: number,
  seasonsPlayed: number,
): MilestoneBadge[] {
  return [
    {
      id: 'first_champion',
      label: 'İlk Şampiyonluk',
      description: 'İlk lig şampiyonluğunu kazan',
      icon: '🏆',
      color: 'text-yellow-300',
      bgColor: 'from-yellow-500/20 to-amber-600/10 border-yellow-500/30',
      requirement: '1 şampiyonluk',
      unlocked: championships >= 1,
    },
    {
      id: 'triple_crown',
      label: 'Üç Taç',
      description: '3 kez şampiyon ol',
      icon: '👑',
      color: 'text-purple-300',
      bgColor: 'from-purple-500/20 to-indigo-600/10 border-purple-500/30',
      requirement: '3 şampiyonluk',
      unlocked: championships >= 3,
    },
    {
      id: 'legend_manager',
      label: 'Efsane Menajer',
      description: '5 kez şampiyon ol',
      icon: '🌟',
      color: 'text-amber-200',
      bgColor: 'from-amber-400/20 to-yellow-600/10 border-amber-400/30',
      requirement: '5 şampiyonluk',
      unlocked: championships >= 5,
    },
    {
      id: 'dynasty',
      label: 'Hanedanlık',
      description: '10 kez şampiyon ol',
      icon: '🏰',
      color: 'text-red-300',
      bgColor: 'from-red-500/20 to-orange-600/10 border-red-500/30',
      requirement: '10 şampiyonluk',
      unlocked: championships >= 10,
    },
    {
      id: 'sharpshooter',
      label: 'Keskin Nişancı',
      description: '3 Altın Krampon kazan',
      icon: '👢',
      color: 'text-yellow-400',
      bgColor: 'from-yellow-500/20 to-orange-500/10 border-yellow-500/30',
      requirement: '3 Altın Krampon',
      unlocked: goldenBoots >= 3,
    },
    {
      id: 'hall_of_famer_boot',
      label: 'Krampon Efsanesi',
      description: '5 Altın Krampon kazan',
      icon: '🏅',
      color: 'text-amber-300',
      bgColor: 'from-amber-500/20 to-yellow-400/10 border-amber-500/30',
      requirement: '5 Altın Krampon',
      unlocked: goldenBoots >= 5,
    },
    {
      id: 'mvp_king',
      label: 'MVP Kralı',
      description: '3 MVP ödülü kazan',
      icon: '⭐',
      color: 'text-blue-300',
      bgColor: 'from-blue-500/20 to-cyan-500/10 border-blue-500/30',
      requirement: '3 MVP',
      unlocked: mvpCount >= 3,
    },
    {
      id: 'veteran',
      label: 'Gazi Menajer',
      description: '5 sezon tamamla',
      icon: '🎖️',
      color: 'text-green-300',
      bgColor: 'from-green-500/20 to-emerald-500/10 border-green-500/30',
      requirement: '5 sezon',
      unlocked: seasonsPlayed >= 5,
    },
    {
      id: 'decade',
      label: 'On Yıl',
      description: '10 sezon tamamla',
      icon: '💎',
      color: 'text-cyan-300',
      bgColor: 'from-cyan-500/20 to-teal-500/10 border-cyan-500/30',
      requirement: '10 sezon',
      unlocked: seasonsPlayed >= 10,
    },
    {
      id: 'collector',
      label: 'Koleksiyoncu',
      description: 'Toplam 20 ödül kazan',
      icon: '🎯',
      color: 'text-pink-300',
      bgColor: 'from-pink-500/20 to-rose-500/10 border-pink-500/30',
      requirement: '20 ödül',
      unlocked: totalAwards >= 20,
    },
  ];
}

// ─── Position Badge Helper ────────────────────────────────────────────

function getPositionBadge(position: number): { label: string; color: string; bg: string } {
  if (position === 1) return { label: 'Şampiyon', color: 'text-yellow-300', bg: 'bg-yellow-500/15 border-yellow-500/30' };
  if (position === 2) return { label: '2.', color: 'text-gray-300', bg: 'bg-gray-500/15 border-gray-500/30' };
  if (position === 3) return { label: '3.', color: 'text-amber-600', bg: 'bg-amber-700/15 border-amber-700/30' };
  if (position <= 4) return { label: `${position}.`, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' };
  if (position <= 8) return { label: `${position}.`, color: 'text-white/60', bg: 'bg-white/5 border-white/10' };
  return { label: `${position}.`, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' };
}

// ─── Stat Box ─────────────────────────────────────────────────────────

function StatBox({ label, value, icon }: { label: string; value: number | string; icon?: React.ReactNode }) {
  return (
    <div className="bg-white/[0.02] border border-white/[0.04] rounded-xl p-3 text-center">
      {icon && <div className="mb-1 flex justify-center">{icon}</div>}
      <div className="text-white/90 text-lg font-bold">{value}</div>
      <div className="text-white/30 text-[9px] uppercase tracking-wider">{label}</div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════

export default function TrophyCabinetTab({ profileId, teamName }: TrophyCabinetTabProps) {
  const [summaries, setSummaries] = useState<SeasonSummary[]>([]);
  const [allAwards, setAllAwards] = useState<SeasonAward[]>([]);
  const [championships, setChampionships] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedSeason, setSelectedSeason] = useState<string | null>(null);
  const [hofEntries, setHofEntries] = useState<HallOfFameEntry[]>([]);

  // Özet ve ödülleri yükle
  useEffect(() => {
    if (!profileId) return;
    let cancelled = false;

    (async () => {
      setLoading(true);
      const [loadedSummaries, champCount] = await Promise.all([
        loadAllSeasonSummaries(profileId),
        getChampionshipCount(profileId),
      ]);

      // Tüm sezonların ödüllerini topla
      const awardsPromises = loadedSummaries.map(s =>
        loadSeasonAwards(profileId, s.season_id)
      );
      const awardsArrays = await Promise.all(awardsPromises);
      const flatAwards = awardsArrays.flat();

      if (!cancelled) {
        setSummaries(loadedSummaries);
        setAllAwards(flatAwards);
        setChampionships(champCount);
        setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [profileId]);

  // Hall of Fame verisini yükle
  useEffect(() => {
    if (!profileId) return;
    let cancelled = false;
    (async () => {
      const hof = await loadHallOfFame(profileId);
      if (!cancelled) setHofEntries(hof);
    })();
    return () => { cancelled = true; };
  }, [profileId]);

  // Seçili sezonun ödüllerini getir (useMemo ile hesapla)
  const seasonAwards = React.useMemo(
    () => selectedSeason ? allAwards.filter(a => a.season_id === selectedSeason) : [],
    [selectedSeason, allAwards]
  );

  // İstatistikleri hesapla
  const goldenBootCount = allAwards.filter(a => a.award_type === 'golden_boot').length;
  const mvpCount = allAwards.filter(a => a.award_type === 'mvp').length;
  const bestGkCount = allAwards.filter(a => a.award_type === 'best_gk').length;
  const topAssistsCount = allAwards.filter(a => a.award_type === 'top_assists').length;
  const bestYoungCount = allAwards.filter(a => a.award_type === 'best_young').length;
  const fairPlayCount = allAwards.filter(a => a.award_type === 'fair_play').length;
  const fastestGoalCount = allAwards.filter(a => a.award_type === 'fastest_goal').length;
  const mostSavesCount = allAwards.filter(a => a.award_type === 'most_saves').length;
  const bestDefenderCount = allAwards.filter(a => a.award_type === 'best_defender').length;
  const mostMotmCount = allAwards.filter(a => a.award_type === 'most_motm').length;
  const cleanSheetWinCount = allAwards.filter(a => a.award_type === 'clean_sheet_win').length;
  const longestStreakCount = allAwards.filter(a => a.award_type === 'longest_streak').length;
  const totalAwards = allAwards.length;
  const seasonsPlayed = summaries.length;

  const milestones = computeMilestones(championships, totalAwards, goldenBootCount, mvpCount, seasonsPlayed);
  const unlockedMilestones = milestones.filter(m => m.unlocked).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-10 h-10 border-2 border-amber-400/30 border-t-amber-400 rounded-full" />
      </div>
    );
  }

  return (
    <div className="p-4 pb-24 space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
          <Trophy size={20} className="text-amber-400" />
        </div>
        <div>
          <h2 className="text-white font-bold text-lg">Ödül Dolabı</h2>
          <p className="text-white/40 text-xs">{teamName} — Tüm sezonların ödülleri ve başarımları</p>
        </div>
      </div>

      {/* Özet Kartları */}
      <div className="grid grid-cols-4 gap-3">
        <StatBox label="Şampiyonluk" value={championships} icon={<span className="text-xl">🏆</span>} />
        <StatBox label="Toplam Ödül" value={totalAwards} icon={<span className="text-xl">🏅</span>} />
        <StatBox label="Altın Krampon" value={goldenBootCount} icon={<span className="text-xl">👢</span>} />
        <StatBox label="MVP" value={mvpCount} icon={<span className="text-xl">⭐</span>} />
      </div>

      {/* Ödül Dağılımı */}
      <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-4">
        <h3 className="text-white/60 text-xs uppercase tracking-wider mb-3">Ödül Dağılımı</h3>
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
          {[
            { type: 'golden_boot' as AwardType, count: goldenBootCount },
            { type: 'mvp' as AwardType, count: mvpCount },
            { type: 'best_gk' as AwardType, count: bestGkCount },
            { type: 'top_assists' as AwardType, count: topAssistsCount },
            { type: 'best_young' as AwardType, count: bestYoungCount },
            { type: 'fair_play' as AwardType, count: fairPlayCount },
            { type: 'fastest_goal' as AwardType, count: fastestGoalCount },
            { type: 'most_saves' as AwardType, count: mostSavesCount },
            { type: 'best_defender' as AwardType, count: bestDefenderCount },
            { type: 'most_motm' as AwardType, count: mostMotmCount },
            { type: 'clean_sheet_win' as AwardType, count: cleanSheetWinCount },
            { type: 'longest_streak' as AwardType, count: longestStreakCount },
          ].map(item => {
            const label = AWARD_LABELS[item.type];
            return (
              <div key={item.type} className="bg-white/[0.02] border border-white/[0.04] rounded-xl p-2 text-center">
                <div className="text-2xl mb-1">{label.icon}</div>
                <div className={`text-lg font-bold ${label.color}`}>{item.count}</div>
                <div className="text-white/30 text-[8px] uppercase">{label.title}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Başım Rozetleri (Milestones) */}
      <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-white/60 text-xs uppercase tracking-wider">Başım Rozetleri</h3>
          <span className="text-white/30 text-[10px]">{unlockedMilestones}/{milestones.length} kilitli açık</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {milestones.map((m, idx) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
              className={`relative rounded-xl p-3 border transition-all ${
                m.unlocked
                  ? `bg-gradient-to-br ${m.bgColor}`
                  : 'bg-white/[0.01] border-white/[0.04] opacity-40'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-2xl">{m.icon}</span>
                <div className="flex-1 min-w-0">
                  <h4 className={`text-sm font-bold ${m.unlocked ? m.color : 'text-white/30'}`}>
                    {m.label}
                  </h4>
                  <p className="text-white/30 text-[10px] truncate">{m.description}</p>
                </div>
                {m.unlocked && (
                  <div className="text-green-400 text-xs font-bold">✓</div>
                )}
              </div>
              {!m.unlocked && (
                <div className="absolute bottom-1 right-2 text-white/15 text-[8px]">{m.requirement}</div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Sezon Geçmişi */}
      <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-4">
        <h3 className="text-white/60 text-xs uppercase tracking-wider mb-3">Sezon Geçmişi</h3>
        {summaries.length === 0 ? (
          <div className="text-center py-8 text-white/20 text-sm">Henüz sezon geçmişi yok.</div>
        ) : (
          <div className="space-y-2">
            {summaries.map((s, idx) => {
              const posBadge = s.final_position ? getPositionBadge(s.final_position) : null;
              const isSelected = selectedSeason === s.season_id;
              const seasonAwardList = allAwards.filter(a => a.season_id === s.season_id);

              return (
                <motion.div
                  key={s.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.03 }}
                >
                  <button
                    onClick={() => setSelectedSeason(isSelected ? null : s.season_id)}
                    className={`w-full text-left bg-white/[0.02] border rounded-xl p-3 transition-all hover:bg-white/[0.04] ${
                      isSelected ? 'border-amber-500/30 bg-amber-500/5' : 'border-white/[0.06]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Position */}
                      {posBadge && (
                        <div className={`px-2 py-1 rounded-lg border text-xs font-bold ${posBadge.bg} ${posBadge.color}`}>
                          {s.final_position}.
                        </div>
                      )}

                      {/* Season Info */}
                      <div className="flex-1 min-w-0">
                        <div className="text-white/80 text-sm font-medium">
                          {s.season_id.replace('season-', 'Sezon ')}
                        </div>
                        <div className="text-white/30 text-xs">
                          {s.won}G {s.drawn}B {s.lost}M • {s.points} puan • {s.goals_for || s.total_goals} gol
                        </div>
                      </div>

                      {/* Awards Icons */}
                      <div className="flex items-center gap-1">
                        {s.is_champion && <span className="text-lg">🏆</span>}
                        {seasonAwardList.some(a => a.award_type === 'golden_boot') && <span className="text-sm">👢</span>}
                        {seasonAwardList.some(a => a.award_type === 'mvp') && <span className="text-sm">⭐</span>}
                        {seasonAwardList.some(a => a.award_type === 'best_gk') && <span className="text-sm">🧤</span>}
                        {seasonAwardList.some(a => a.award_type === 'top_assists') && <span className="text-sm">🎯</span>}
                        {s.is_relegated && <span className="text-sm">⬇️</span>}
                      </div>
                    </div>
                  </button>

                  {/* Expanded Award Details */}
                  {isSelected && seasonAwardList.length > 0 && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      className="overflow-hidden ml-4 mt-1 space-y-1"
                    >
                      {seasonAwardList.map(award => {
                        const label = AWARD_LABELS[award.award_type];
                        return (
                          <div key={award.id} className="bg-white/[0.02] border border-white/[0.04] rounded-lg p-2 flex items-center gap-2">
                            <span className="text-lg">{label.icon}</span>
                            <div className="flex-1">
                              <span className={`text-xs font-medium ${label.color}`}>{label.title}</span>
                              <span className="text-white/50 text-xs ml-2">{award.player_name || ''}</span>
                            </div>
                            <span className="text-white/40 text-xs font-mono">{award.stat_value}</span>
                          </div>
                        );
                      })}
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Hall of Fame */}
      {hofEntries.length > 0 && (
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-4">
          <h3 className="text-white/60 text-xs uppercase tracking-wider mb-3">Efsaneler Salonu</h3>
          <div className="space-y-2">
            {hofEntries.map((entry, idx) => {
              const tierColors: Record<string, string> = {
                platinum: 'text-cyan-300 border-cyan-500/30 bg-cyan-500/10',
                gold: 'text-yellow-300 border-yellow-500/30 bg-yellow-500/10',
                silver: 'text-gray-300 border-gray-500/30 bg-gray-500/10',
                bronze: 'text-amber-600 border-amber-700/30 bg-amber-700/10',
              };
              const tierLabels: Record<string, string> = {
                platinum: 'Platin', gold: 'Altın', silver: 'Gümüş', bronze: 'Bronz',
              };
              const tierClass = tierColors[entry.legend_tier] || tierColors.bronze;
              return (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  className="bg-white/[0.02] border border-white/[0.04] rounded-xl p-3 flex items-center gap-3"
                >
                  <div className={`px-2 py-1 rounded-lg border text-[9px] font-bold ${tierClass}`}>
                    {tierLabels[entry.legend_tier] || 'Bronz'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-white/80 text-sm font-medium">{entry.player_name}</div>
                    <div className="text-white/30 text-xs">
                      {entry.position} • {entry.seasons_played} sezon • {entry.total_goals} gol • {entry.avg_rating.toFixed(1)} ort.
                    </div>
                  </div>
                  {entry.is_club_legend && <span className="text-yellow-400 text-sm">⭐</span>}
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
