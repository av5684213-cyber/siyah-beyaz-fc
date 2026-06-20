'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Trophy,
  ArrowUpCircle,
  ArrowDownCircle,
  MinusCircle,
  TrendingUp,
  Shield,
  Loader2,
} from 'lucide-react';

interface LeagueInfoData {
  found: boolean;
  leagueName: string;
  tier: number;
  position: number;
  totalTeams: number;
  points: number;
  promotionZone: boolean;
  playoffZone: boolean;
  relegationZone: boolean;
}

const TIER_LABELS: Record<number, string> = {
  1: '1. Lig',
  2: '2. Lig',
  3: '3. Lig',
  4: '4. Lig',
};

const TIER_COLORS: Record<number, { bg: string; border: string; text: string; badge: string }> = {
  1: { bg: 'from-amber-500/10 to-amber-900/5', border: 'border-amber-500/20', text: 'text-amber-400', badge: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
  2: { bg: 'from-sky-500/10 to-sky-900/5', border: 'border-sky-500/20', text: 'text-sky-400', badge: 'bg-sky-500/15 text-sky-400 border-sky-500/30' },
  3: { bg: 'from-emerald-500/10 to-emerald-900/5', border: 'border-emerald-500/20', text: 'text-emerald-400', badge: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
  4: { bg: 'from-violet-500/10 to-violet-900/5', border: 'border-violet-500/20', text: 'text-violet-400', badge: 'bg-violet-500/15 text-violet-400 border-violet-500/30' },
};

export default function LeagueInfoCard({ profileId }: { profileId: string }) {
  const [leagueInfo, setLeagueInfo] = useState<LeagueInfoData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profileId) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/league/my-league?profileId=${profileId}`);
        if (res.ok && !cancelled) {
          const data = await res.json();
          if (data.found) {
            setLeagueInfo(data as LeagueInfoData);
          }
        }
      } catch (err) {
        console.error('[LeagueInfoCard] Error:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [profileId]);

  if (loading) {
    return (
      <div className="bg-zinc-900 border border-white/5 rounded-2xl p-6">
        <div className="flex items-center justify-center gap-2 py-4">
          <Loader2 size={16} className="animate-spin text-white/20" />
          <span className="text-[10px] text-white/20 uppercase tracking-widest">Lig bilgisi yükleniyor...</span>
        </div>
      </div>
    );
  }

  if (!leagueInfo || !leagueInfo.found) return null;

  const colors = TIER_COLORS[leagueInfo.tier] || TIER_COLORS[4];
  const tierLabel = TIER_LABELS[leagueInfo.tier] || `${leagueInfo.tier}. Lig`;

  // Yükselme/düşme durumu belirleme
  let statusLabel = '';
  let statusIcon: React.ReactNode = null;
  let statusColor = '';

  if (leagueInfo.promotionZone) {
    statusLabel = 'Doğrudan Yükselme Hattı';
    statusIcon = <ArrowUpCircle size={14} className="text-emerald-400" />;
    statusColor = 'text-emerald-400';
  } else if (leagueInfo.playoffZone) {
    statusLabel = 'Playoff Hattı';
    statusIcon = <MinusCircle size={14} className="text-amber-400" />;
    statusColor = 'text-amber-400';
  } else if (leagueInfo.relegationZone) {
    statusLabel = 'Düşme Hattı';
    statusIcon = <ArrowDownCircle size={14} className="text-red-400" />;
    statusColor = 'text-red-400';
  } else if (leagueInfo.tier === 4 && leagueInfo.position <= 5) {
    statusLabel = 'Yükselme Mücadelesi';
    statusIcon = <TrendingUp size={14} className="text-violet-400" />;
    statusColor = 'text-violet-400';
  } else if (leagueInfo.tier === 1) {
    statusLabel = 'Zirve Mücadelesi';
    statusIcon = <Trophy size={14} className="text-amber-400" />;
    statusColor = 'text-amber-400';
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-gradient-to-br ${colors.bg} border ${colors.border} rounded-2xl p-6 space-y-4`}
    >
      {/* Başlık */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/5 rounded-lg border border-white/5">
            <Trophy size={14} className={colors.text} />
          </div>
          <div>
            <h3 className="text-[10px] uppercase font-bold tracking-widest text-white/30">LİG DURUMU</h3>
            <p className={`text-xs font-black ${colors.text}`}>{leagueInfo.leagueName || tierLabel}</p>
          </div>
        </div>
        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${colors.badge}`}>
          {leagueInfo.tier}. KADEME
        </span>
      </div>

      {/* Sıralama */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-black/30 border border-white/[0.04] rounded-xl p-3 text-center">
          <span className="text-[10px] text-white/20 uppercase font-bold tracking-widest">Sıra</span>
          <div className="flex items-baseline justify-center gap-1 mt-1">
            <span className="text-xl font-black font-mono text-white">{leagueInfo.position || '-'}</span>
            <span className="text-[10px] text-white/20">/ {leagueInfo.totalTeams || 18}</span>
          </div>
        </div>
        <div className="bg-black/30 border border-white/[0.04] rounded-xl p-3 text-center">
          <span className="text-[10px] text-white/20 uppercase font-bold tracking-widest">Puan</span>
          <p className="text-xl font-black font-mono text-white mt-1">{leagueInfo.points || 0}</p>
        </div>
        <div className="bg-black/30 border border-white/[0.04] rounded-xl p-3 text-center">
          <span className="text-[10px] text-white/20 uppercase font-bold tracking-widest">Lig</span>
          <p className={`text-lg font-black ${colors.text} mt-1`}>{tierLabel}</p>
        </div>
      </div>

      {/* Yükselme/Düşme Durumu */}
      {statusLabel && (
        <div className={`flex items-center gap-2 p-3 bg-black/20 border border-white/[0.04] rounded-xl ${statusColor}`}>
          {statusIcon}
          <span className="text-[10px] font-black uppercase tracking-widest">{statusLabel}</span>
          <Shield size={10} className="ml-auto opacity-40" />
        </div>
      )}

      {/* Açıklama */}
      {leagueInfo.tier > 1 && (
        <p className="text-[10px] text-white/20 leading-relaxed">
          {leagueInfo.tier === 4
            ? '4. Lig\'den düşme yok. İlk 2 sıra bir üst lige yükselir (şampiyon doğrudan, playoff kazananı da).'
            : `${tierLabel}'de son 2 sıra küme düşer. İlk 2 sıra bir üst lige yükselir.`}
        </p>
      )}
      {leagueInfo.tier === 1 && (
        <p className="text-[10px] text-white/20 leading-relaxed">
          1. Lig şampiyonluk mücadelesi. Son 2 sıra 2. Lig'e düşer.
        </p>
      )}
    </motion.div>
  );
}
