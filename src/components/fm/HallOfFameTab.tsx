'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Trophy, Star, Shield, Crown, Medal, Building2, Flame } from 'lucide-react';
import type { HallOfFameEntry, AllTimeRecord, LegendTier } from '@/lib/fm/hallOfFameService';
import { loadHallOfFame, computeAllTimeRecords } from '@/lib/fm/hallOfFameService';
import { AWARD_LABELS } from '@/lib/fm/types';
import type { AwardType } from '@/lib/fm/types';

// ─── Props ────────────────────────────────────────────────────────────

interface HallOfFameTabProps {
  profileId: string;
  teamName: string;
}

// ─── Tier Config ──────────────────────────────────────────────────────

const TIER_CONFIG: Record<LegendTier, {
  label: string;
  icon: string;
  gradient: string;
  border: string;
  textColor: string;
  glow: string;
}> = {
  platinum: {
    label: 'Platin Efsane',
    icon: '💎',
    gradient: 'from-cyan-400/15 via-blue-500/10 to-purple-500/15',
    border: 'border-cyan-400/30',
    textColor: 'text-cyan-300',
    glow: 'shadow-[0_0_30px_rgba(34,211,238,0.15)]',
  },
  gold: {
    label: 'Altın Efsane',
    icon: '🥇',
    gradient: 'from-yellow-400/15 via-amber-500/10 to-orange-400/15',
    border: 'border-yellow-400/30',
    textColor: 'text-yellow-300',
    glow: 'shadow-[0_0_25px_rgba(250,204,21,0.12)]',
  },
  silver: {
    label: 'Gümüş Efsane',
    icon: '🥈',
    gradient: 'from-gray-300/10 via-gray-400/5 to-gray-300/10',
    border: 'border-gray-300/20',
    textColor: 'text-gray-300',
    glow: 'shadow-[0_0_15px_rgba(209,213,219,0.08)]',
  },
  bronze: {
    label: 'Bronz Üye',
    icon: '🥉',
    gradient: 'from-amber-700/10 via-amber-800/5 to-amber-700/10',
    border: 'border-amber-700/20',
    textColor: 'text-amber-600',
    glow: '',
  },
};

const POSITION_COLORS: Record<string, string> = {
  GK: 'text-[#7AB4E8]',
  DEF: 'text-[#7EDBC8]',
  MID: 'text-[#F0C87A]',
  FWD: 'text-[#E87878]',
};

// ─── Stat Line Component ─────────────────────────────────────────────

function StatLine({ label, value, unit }: { label: string; value: number | string; unit?: string }) {
  return (
    <div className="flex justify-between items-center text-xs">
      <span className="text-white/30">{label}</span>
      <span className="text-white/70 font-mono">
        {value}{unit && <span className="text-white/30 ml-0.5">{unit}</span>}
      </span>
    </div>
  );
}

// ─── Legend Card Component ────────────────────────────────────────────

function LegendCard({ entry, index }: { entry: HallOfFameEntry; index: number }) {
  const tier = TIER_CONFIG[entry.legend_tier];
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.08, duration: 0.4, type: 'spring' }}
      className={`relative bg-gradient-to-br ${tier.gradient} border ${tier.border} rounded-2xl overflow-hidden ${tier.glow}`}
    >
      {/* Club Legend Badge */}
      {entry.is_club_legend && (
        <div className="absolute top-2 right-2 bg-amber-500/20 border border-amber-500/30 rounded-lg px-2 py-0.5">
          <span className="text-amber-300 text-[9px] font-bold uppercase tracking-wider">Kulüp Efsanesi</span>
        </div>
      )}

      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left p-4"
      >
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="text-3xl">{tier.icon}</div>
          <div className="flex-1 min-w-0">
            <h3 className={`font-bold text-sm ${tier.textColor}`}>
              {entry.player_name}
            </h3>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`text-[10px] font-medium ${POSITION_COLORS[entry.position] || 'text-white/50'}`}>
                {entry.position}
              </span>
              {entry.nationality && (
                <>
                  <span className="text-white/15">•</span>
                  <span className="text-white/30 text-[10px]">{entry.nationality}</span>
                </>
              )}
              <span className="text-white/15">•</span>
              <span className="text-white/30 text-[10px]">{entry.seasons_played} sezon</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-white/90 font-bold text-lg">{entry.peak_rating}</div>
            <div className="text-white/30 text-[8px] uppercase">Peak</div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-2 mt-3">
          <div className="bg-black/20 rounded-lg p-1.5 text-center">
            <div className="text-white/80 text-sm font-bold">{entry.total_goals}</div>
            <div className="text-white/25 text-[8px]">GOL</div>
          </div>
          <div className="bg-black/20 rounded-lg p-1.5 text-center">
            <div className="text-white/80 text-sm font-bold">{entry.total_assists}</div>
            <div className="text-white/25 text-[8px]">ASİST</div>
          </div>
          <div className="bg-black/20 rounded-lg p-1.5 text-center">
            <div className="text-white/80 text-sm font-bold">{entry.total_matches}</div>
            <div className="text-white/25 text-[8px]">MAÇ</div>
          </div>
          <div className="bg-black/20 rounded-lg p-1.5 text-center">
            <div className="text-white/80 text-sm font-bold">{entry.avg_rating}</div>
            <div className="text-white/25 text-[8px]">AVG</div>
          </div>
        </div>

        {/* Awards */}
        {entry.awards_won.length > 0 && (
          <div className="flex items-center gap-1.5 mt-2 flex-wrap">
            {entry.awards_won.map(awardType => {
              const label = AWARD_LABELS[awardType as AwardType];
              if (!label) return null;
              return (
                <span key={awardType} className="text-xs" title={label.title}>
                  {label.icon}
                </span>
              );
            })}
          </div>
        )}
      </button>

      {/* Expanded Details */}
      {expanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          className="border-t border-white/[0.06] px-4 pb-4 pt-3 space-y-2"
        >
          <StatLine label="Maçın Adamı" value={entry.total_motm} unit="kez" />
          <StatLine label="Clean Sheet" value={entry.total_clean_sheets} unit="adet" />
          <StatLine label="Ortalama Rating" value={entry.avg_rating} />
          <StatLine label="Zirve Rating" value={entry.peak_rating} unit="OVR" />
          {entry.retired_season && (
            <StatLine label="Emekli Sezonu" value={entry.retired_season.replace('season-', 'Sezon ')} />
          )}
          <StatLine label="Efsane Tier" value={tier.label} />

          {/* Awards Detail */}
          {entry.awards_won.length > 0 && (
            <div className="pt-2 border-t border-white/[0.04]">
              <p className="text-white/30 text-[9px] uppercase mb-1">Kazanılan Ödüller</p>
              <div className="space-y-1">
                {entry.awards_won.map(awardType => {
                  const label = AWARD_LABELS[awardType as AwardType];
                  if (!label) return null;
                  return (
                    <div key={awardType} className="flex items-center gap-1.5 text-xs">
                      <span>{label.icon}</span>
                      <span className={label.color}>{label.title}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}

// ─── Record Card ─────────────────────────────────────────────────────

function RecordCard({ record, index }: { record: AllTimeRecord; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.08 }}
      className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-3 flex items-center gap-3"
    >
      <div className="text-2xl">{record.icon}</div>
      <div className="flex-1 min-w-0">
        <div className="text-white/50 text-[9px] uppercase tracking-wider">{record.label}</div>
        <div className="text-white/80 text-sm font-medium truncate">{record.playerName}</div>
      </div>
      <div className="text-right">
        <div className="text-amber-300 font-bold text-lg">{record.value}</div>
        <div className="text-white/25 text-[8px] uppercase">{record.unit}</div>
      </div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════

export default function HallOfFameTab({ profileId, teamName }: HallOfFameTabProps) {
  const [legends, setLegends] = useState<HallOfFameEntry[]>([]);
  const [records, setRecords] = useState<AllTimeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterTier, setFilterTier] = useState<LegendTier | 'all'>('all');

  useEffect(() => {
    if (!profileId) return;
    let cancelled = false;

    (async () => {
      setLoading(true);
      const [loadedLegends, loadedRecords] = await Promise.all([
        loadHallOfFame(profileId),
        computeAllTimeRecords(profileId),
      ]);
      if (!cancelled) {
        setLegends(loadedLegends);
        setRecords(loadedRecords);
        setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [profileId]);

  // İstatistikler
  const platinumCount = legends.filter(l => l.legend_tier === 'platinum').length;
  const goldCount = legends.filter(l => l.legend_tier === 'gold').length;
  const silverCount = legends.filter(l => l.legend_tier === 'silver').length;
  const bronzeCount = legends.filter(l => l.legend_tier === 'bronze').length;
  const clubLegendCount = legends.filter(l => l.is_club_legend).length;

  // Filtreleme
  const filteredLegends = filterTier === 'all'
    ? legends
    : legends.filter(l => l.legend_tier === filterTier);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-10 h-10 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full" />
      </div>
    );
  }

  return (
    <div className="p-4 pb-24 space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
          <Building2 size={20} className="text-cyan-400" />
        </div>
        <div>
          <h2 className="text-white font-bold text-lg">Efsaneler Müzesi</h2>
          <p className="text-white/40 text-xs">{teamName} — Kulüp tarihine adını yazdıranlar</p>
        </div>
      </div>

      {/* Özet Kartları — mobilde 5 sütun (kompakt), sm+ 5 sütun */}
      <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
        <div className="bg-white/[0.02] border border-white/[0.04] rounded-xl p-2 text-center">
          <div className="text-xl mb-0.5">💎</div>
          <div className="text-cyan-300 font-bold text-sm">{platinumCount}</div>
          <div className="text-white/25 text-[7px] uppercase">Platin</div>
        </div>
        <div className="bg-white/[0.02] border border-white/[0.04] rounded-xl p-2 text-center">
          <div className="text-xl mb-0.5">🥇</div>
          <div className="text-yellow-300 font-bold text-sm">{goldCount}</div>
          <div className="text-white/25 text-[7px] uppercase">Altın</div>
        </div>
        <div className="bg-white/[0.02] border border-white/[0.04] rounded-xl p-2 text-center">
          <div className="text-xl mb-0.5">🥈</div>
          <div className="text-gray-300 font-bold text-sm">{silverCount}</div>
          <div className="text-white/25 text-[7px] uppercase">Gümüş</div>
        </div>
        <div className="bg-white/[0.02] border border-white/[0.04] rounded-xl p-2 text-center">
          <div className="text-xl mb-0.5">🥉</div>
          <div className="text-amber-600 font-bold text-sm">{bronzeCount}</div>
          <div className="text-white/25 text-[7px] uppercase">Bronz</div>
        </div>
        <div className="bg-white/[0.02] border border-white/[0.04] rounded-xl p-2 text-center">
          <div className="text-xl mb-0.5">👑</div>
          <div className="text-amber-300 font-bold text-sm">{clubLegendCount}</div>
          <div className="text-white/25 text-[7px] uppercase">K. Efsanesi</div>
        </div>
      </div>

      {/* Tüm Zamanların Rekorları */}
      {records.length > 0 && (
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Flame size={14} className="text-amber-400" />
            <h3 className="text-white/60 text-xs uppercase tracking-wider">Tüm Zamanların Rekorları</h3>
          </div>
          <div className="space-y-2">
            {records.map((record, idx) => (
              <RecordCard key={record.category} record={record} index={idx} />
            ))}
          </div>
        </div>
      )}

      {/* Efsane Galerisi */}
      <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-white/60 text-xs uppercase tracking-wider">Efsane Galerisi</h3>
          <span className="text-white/30 text-[10px]">{filteredLegends.length} üye</span>
        </div>

        {/* Tier Filter — yatay scroll, touch target 44px min */}
        <div className="flex gap-1.5 mb-4 overflow-x-auto pb-1 no-scrollbar">
          {(['all', 'platinum', 'gold', 'silver', 'bronze'] as const).map(tier => {
            const isActive = filterTier === tier;
            const config = tier !== 'all' ? TIER_CONFIG[tier] : null;
            return (
              <button
                key={tier}
                onClick={() => setFilterTier(tier)}
                className={`px-3 py-2 rounded-lg text-[10px] font-medium transition-all border whitespace-nowrap shrink-0 touch-target-44 flex items-center mobile-tap-highlight ${
                  isActive
                    ? 'bg-white/10 border-white/20 text-white/80'
                    : 'bg-white/[0.02] border-white/[0.06] text-white/30 hover:text-white/50'
                }`}
              >
                {tier === 'all' ? '🎬 Tümü' : `${config?.icon} ${config?.label}`}
              </button>
            );
          })}
        </div>

        {/* Legends Grid */}
        {filteredLegends.length === 0 ? (
          <div className="text-center py-12 text-white/20">
            <Building2 size={48} className="mx-auto mb-3 opacity-20" />
            <p className="text-sm">Henüz müzede efsane yok.</p>
            <p className="text-xs mt-1 text-white/15">Oyuncular emekli olduğunda otomatik olarak buraya eklenir.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredLegends.map((entry, idx) => (
              <LegendCard key={entry.id} entry={entry} index={idx} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
