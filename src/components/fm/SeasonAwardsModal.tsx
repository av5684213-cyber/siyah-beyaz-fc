'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Trophy, Star, Shield, Target, Users, Award, TrendingUp, ArrowDown, ChevronRight } from 'lucide-react';
import type { SeasonAwardCeremony, SeasonAward, SeasonSummary, SeasonBadge, AwardType } from '@/lib/fm/types';
import { AWARD_LABELS } from '@/lib/fm/types';
import { loadAwardCeremony, loadAllSeasonSummaries } from '@/lib/fm/seasonAwardsService';

// ─── Props ────────────────────────────────────────────────────────────

interface SeasonAwardsModalProps {
  isOpen: boolean;
  onClose: () => void;
  profileId: string;
  seasonId: string;
  teamName: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────

function formatStatValue(award: SeasonAward): string {
  const detail = award.stat_detail || {};
  switch (award.award_type) {
    case 'golden_boot':
      return `${award.stat_value} gol`;
    case 'mvp':
      return `${detail.avg_rating || award.stat_value} rating`;
    case 'best_gk':
      return `${detail.avg_rating || award.stat_value} rating, ${detail.clean_sheets || 0} clean sheet`;
    case 'top_assists':
      return `${award.stat_value} asist`;
    case 'best_young':
      return `${detail.avg_rating || award.stat_value} rating (Yaş ${detail.age || '?'})`;
    case 'fair_play':
      return `${detail.yellow_cards || 0} sarı, ${detail.red_cards || 0} kırmızı`;
    case 'champion':
      return 'Şampiyon!';
    default:
      return String(award.stat_value);
  }
}

function getPositionBadge(position: number): { label: string; color: string; bg: string } {
  if (position === 1) return { label: '🏆 Şampiyon', color: 'text-yellow-300', bg: 'bg-yellow-500/15 border-yellow-500/30' };
  if (position === 2) return { label: '🥈 2.', color: 'text-gray-300', bg: 'bg-gray-500/15 border-gray-500/30' };
  if (position === 3) return { label: '🥉 3.', color: 'text-amber-600', bg: 'bg-amber-700/15 border-amber-700/30' };
  if (position <= 4) return { label: `${position}.`, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' };
  if (position <= 8) return { label: `${position}.`, color: 'text-white/60', bg: 'bg-white/5 border-white/10' };
  return { label: `${position}.`, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' };
}

// ─── Award Card Component ─────────────────────────────────────────────

function AwardCard({ award, index }: { award: SeasonAward; index: number }) {
  const label = AWARD_LABELS[award.award_type];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.15, duration: 0.4, type: 'spring' }}
      className="bg-gradient-to-br from-white/[0.03] to-white/[0.01] border border-white/[0.06] rounded-2xl p-4 hover:border-white/[0.12] transition-all"
    >
      <div className="flex items-start gap-3">
        {/* Award Icon */}
        <div className={`text-3xl flex-shrink-0`}>
          {label.icon}
        </div>

        {/* Award Info */}
        <div className="flex-1 min-w-0">
          <h4 className={`font-bold text-sm ${label.color}`}>
            {label.title}
          </h4>
          <p className="text-white/80 text-sm font-medium mt-0.5 truncate">
            {award.player_name || award.team_name}
          </p>
          <p className="text-white/40 text-xs mt-1">
            {formatStatValue(award)}
          </p>
        </div>

        {/* Stat Value */}
        <div className="text-right flex-shrink-0">
          <span className="text-white/60 text-xs font-mono">
            {award.stat_value}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Summary Card Component ───────────────────────────────────────────

function SummaryCard({ summary }: { summary: SeasonSummary }) {
  const posBadge = summary.final_position ? getPositionBadge(summary.final_position) : null;

  return (
    <div className="bg-gradient-to-br from-[#0d1117] to-[#111820] border border-white/[0.06] rounded-2xl p-5">
      <h3 className="text-white/70 text-xs uppercase tracking-wider mb-3">Sezon Özeti</h3>

      {/* Position */}
      {posBadge && (
        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border ${posBadge.bg} mb-4`}>
          <span className={`text-lg font-bold ${posBadge.color}`}>{posBadge.label}</span>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3 text-center">
        <StatBox label="Puan" value={summary.points} />
        <StatBox label="Galibiyet" value={summary.won} />
        <StatBox label="Mağlubiyet" value={summary.lost} />
        <StatBox label="Gol" value={summary.goals_for || summary.total_goals} />
        <StatBox label="Yedi" value={summary.goals_against} />
        <StatBox label="Avg Rating" value={summary.avg_team_rating} />
      </div>

      {/* Top Performers */}
      {(summary.top_scorer_name || summary.best_player_name) && (
        <div className="mt-4 pt-3 border-t border-white/[0.06] space-y-2">
          {summary.top_scorer_name && (
            <div className="flex justify-between text-sm">
              <span className="text-white/40">👢 En Golcü</span>
              <span className="text-white/80">{summary.top_scorer_name} ({summary.top_scorer_goals})</span>
            </div>
          )}
          {summary.top_assister_name && (
            <div className="flex justify-between text-sm">
              <span className="text-white/40">🎯 En Asistli</span>
              <span className="text-white/80">{summary.top_assister_name} ({summary.top_assister_assists})</span>
            </div>
          )}
          {summary.best_player_name && (
            <div className="flex justify-between text-sm">
              <span className="text-white/40">⭐ MVP</span>
              <span className="text-white/80">{summary.best_player_name} ({summary.best_player_rating})</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function StatBox({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="bg-white/[0.02] rounded-xl p-2">
      <div className="text-white/90 text-sm font-bold">{value}</div>
      <div className="text-white/30 text-[10px] uppercase">{label}</div>
    </div>
  );
}

// ─── Badge Display ────────────────────────────────────────────────────

function BadgeDisplay({ badge }: { badge: SeasonBadge | null }) {
  if (!badge) return null;

  return (
    <motion.div
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
      className="flex flex-col items-center gap-2 py-4"
    >
      <div className="text-5xl">{badge.icon}</div>
      <span className="text-white/80 font-bold text-sm">{badge.label}</span>
      <span className="text-white/30 text-xs">Kazanılan Badge</span>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// MAIN MODAL COMPONENT
// ═══════════════════════════════════════════════════════════════════════

export default function SeasonAwardsModal({
  isOpen,
  onClose,
  profileId,
  seasonId,
  teamName,
}: SeasonAwardsModalProps) {
  const [ceremony, setCeremony] = useState<SeasonAwardCeremony | null>(null);
  const [allSummaries, setAllSummaries] = useState<SeasonSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<'ceremony' | 'history'>('ceremony');

  useEffect(() => {
    if (!isOpen || !profileId || !seasonId) return;
    let cancelled = false;

    (async () => {
      setLoading(true);
      const [loadedCeremony, loadedSummaries] = await Promise.all([
        loadAwardCeremony(profileId, seasonId),
        loadAllSeasonSummaries(profileId),
      ]);
      if (!cancelled) {
        setCeremony(loadedCeremony);
        setAllSummaries(loadedSummaries);
        setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [isOpen, profileId, seasonId]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.8, y: 50 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.8, y: 50 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="bg-[#0a0e14] border border-white/[0.08] rounded-[2rem] w-full max-w-lg max-h-[85vh] overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="relative bg-gradient-to-r from-amber-500/10 via-yellow-500/5 to-amber-500/10 border-b border-white/[0.06] p-6">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-white/40 hover:text-white/80 transition-colors"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3">
              <div className="text-4xl">🏆</div>
              <div>
                <h2 className="text-white font-bold text-lg">Sezon Sonu Ödülleri</h2>
                <p className="text-white/50 text-sm">{teamName} — {seasonId.replace('season-', 'Sezon ')}</p>
              </div>
            </div>

            {/* View Tabs */}
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setActiveView('ceremony')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeView === 'ceremony'
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    : 'bg-white/5 text-white/40 border border-white/[0.06] hover:text-white/60'
                }`}
              >
                🏅 Ödül Töreni
              </button>
              <button
                onClick={() => setActiveView('history')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeView === 'history'
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    : 'bg-white/5 text-white/40 border border-white/[0.06] hover:text-white/60'
                }`}
              >
                📊 Sezon Geçmişi
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="overflow-y-auto max-h-[65vh] p-5">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin w-8 h-8 border-2 border-amber-400/30 border-t-amber-400 rounded-full" />
              </div>
            ) : activeView === 'ceremony' ? (
              <CeremonyView ceremony={ceremony} />
            ) : (
              <HistoryView summaries={allSummaries} />
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Ceremony View ────────────────────────────────────────────────────

function CeremonyView({ ceremony }: { ceremony: SeasonAwardCeremony | null }) {
  if (!ceremony) {
    return (
      <div className="text-center py-12 text-white/30">
        <Trophy size={48} className="mx-auto mb-3 opacity-30" />
        <p>Bu sezon için ödül verisi bulunamadı.</p>
      </div>
    );
  }

  const { summary, awards, badge } = ceremony;

  return (
    <div className="space-y-5">
      {/* Champion Banner */}
      {summary.is_champion && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="bg-gradient-to-r from-yellow-500/20 via-amber-500/10 to-yellow-500/20 border border-yellow-500/30 rounded-2xl p-6 text-center"
        >
          <div className="text-6xl mb-2">🏆</div>
          <h3 className="text-yellow-300 font-bold text-xl">ŞAMPİYON!</h3>
          <p className="text-yellow-200/60 text-sm mt-1">Lig birincisi olarak tarihe geçtin!</p>
        </motion.div>
      )}

      {/* Badge */}
      <BadgeDisplay badge={badge} />

      {/* Summary */}
      <SummaryCard summary={summary} />

      {/* Awards */}
      {awards.length > 0 && (
        <div>
          <h3 className="text-white/60 text-xs uppercase tracking-wider mb-3">Bireysel Ödüller</h3>
          <div className="space-y-2">
            {awards.map((award, idx) => (
              <AwardCard key={award.id} award={award} index={idx} />
            ))}
          </div>
        </div>
      )}

      {awards.length === 0 && !summary.is_champion && (
        <div className="text-center py-6 text-white/30 text-sm">
          Bu sezon bireysel ödül kazanan olmadı.
        </div>
      )}
    </div>
  );
}

// ─── History View ─────────────────────────────────────────────────────

function HistoryView({ summaries }: { summaries: SeasonSummary[] }) {
  if (summaries.length === 0) {
    return (
      <div className="text-center py-12 text-white/30">
        <TrendingUp size={48} className="mx-auto mb-3 opacity-30" />
        <p>Henüz sezon geçmişi yok.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {summaries.map((s, idx) => {
        const posBadge = s.final_position ? getPositionBadge(s.final_position) : null;
        return (
          <motion.div
            key={s.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-3 flex items-center gap-3 hover:bg-white/[0.04] transition-all"
          >
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
                {s.won}G {s.drawn}B {s.lost}M • {s.points} puan
              </div>
            </div>

            {/* Badges */}
            <div className="flex items-center gap-1">
              {s.is_champion && <span className="text-lg">🏆</span>}
              {s.badge_earned && s.badge_earned.includes('golden_boot') && <span className="text-sm">👢</span>}
              {s.badge_earned && s.badge_earned.includes('mvp') && <span className="text-sm">⭐</span>}
              {s.is_relegated && <span className="text-sm">⬇️</span>}
              <ChevronRight size={14} className="text-white/20" />
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
