'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Trophy,
  ArrowLeft,
  Calendar,
  Star,
  Target,
  Shield,
  Zap,
  Heart,
  Crown,
  Medal,
  Home,
  Building2,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import type { AwardType } from '@/lib/fm/types';

// ═══════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════

interface SeasonAwardRow {
  id: string;
  season_id: string;
  profile_id: string;
  league_name?: string;
  award_type: AwardType | string;
  player_id?: string;
  player_name?: string;
  team_name?: string;
  stat_value: number;
  stat_detail?: Record<string, number | string> | string;
  created_at?: string;
}

// ═══════════════════════════════════════════════════════════════
// Award display config
// ═══════════════════════════════════════════════════════════════

const AWARD_CONFIG: Record<string, { label: string; icon: React.ReactNode; color: string; bg: string }> = {
  golden_boot: { label: 'Altın Krampon', icon: <Zap size={20} />, color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20' },
  mvp: { label: 'En Değerli Oyuncu', icon: <Star size={20} />, color: 'text-amber-300', bg: 'bg-amber-500/10 border-amber-500/20' },
  best_gk: { label: 'En İyi Kaleci', icon: <Shield size={20} />, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
  top_assists: { label: 'Asist Kralı', icon: <Target size={20} />, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
  best_young: { label: 'Yılın Genci', icon: <Zap size={20} />, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
  fair_play: { label: 'Fair Play', icon: <Heart size={20} />, color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20' },
  champion: { label: 'Şampiyon', icon: <Crown size={20} />, color: 'text-yellow-300', bg: 'bg-yellow-400/10 border-yellow-400/20' },
};

function getAwardConfig(type: string) {
  return AWARD_CONFIG[type] || { label: type, icon: <Medal size={20} />, color: 'text-white/50', bg: 'bg-white/5 border-white/10' };
}

// ═══════════════════════════════════════════════════════════════
// Ana Bileşen
// ═══════════════════════════════════════════════════════════════

export default function AwardsPage() {
  const router = useRouter();
  const [awards, setAwards] = useState<SeasonAwardRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSeason, setSelectedSeason] = useState<string>('all');

  useEffect(() => {
    const loadAwards = async () => {
      try {
        if (!isSupabaseConfigured()) {
          setLoading(false);
          return;
        }
        const supabase = getSupabase();
        if (!supabase) {
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from('season_awards')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(200);

        if (!error && data) {
          setAwards(data as SeasonAwardRow[]);
        }
      } catch (err) {
        console.error('[AwardsPage] Error:', err);
      } finally {
        setLoading(false);
      }
    };
    loadAwards();
  }, []);

  // Sezon listesi
  const seasons = useMemo(() => {
    const seasonSet = new Set(awards.map(a => a.season_id).filter(Boolean));
    return ['all', ...Array.from(seasonSet)];
  }, [awards]);

  // Filtrelenmiş ödüller
  const filteredAwards = useMemo(() => {
    if (selectedSeason === 'all') return awards;
    return awards.filter(a => a.season_id === selectedSeason);
  }, [awards, selectedSeason]);

  // Ödül tipine göre grupla
  const awardsByType = useMemo(() => {
    const map = new Map<string, SeasonAwardRow[]>();
    for (const award of filteredAwards) {
      const list = map.get(award.award_type) || [];
      list.push(award);
      map.set(award.award_type, list);
    }
    // Önem sırasına göre sırala
    const order = ['champion', 'golden_boot', 'mvp', 'top_assists', 'best_gk', 'best_young', 'fair_play'];
    const sorted = [...map.entries()].sort((a, b) => {
      const ai = order.indexOf(a[0]);
      const bi = order.indexOf(b[0]);
      return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
    });
    return sorted;
  }, [filteredAwards]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-white/10 border-t-amber-400 rounded-full animate-spin" />
          <p className="text-white/30 text-xs font-bold uppercase tracking-widest">Ödüller Yükleniyor</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Üst Bar */}
      <div className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/[0.06] px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-white/40 hover:text-white/70 transition-colors"
          >
            <ArrowLeft size={18} />
            <span className="text-xs font-bold uppercase tracking-widest">Geri</span>
          </button>
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-black uppercase tracking-wider text-white/70">Ödüller</span>
          </div>
          <div className="flex items-center gap-2 text-white/20">
            <Medal size={14} />
            <span className="text-[10px] font-semibold">{awards.length} ödül</span>
          </div>
        </div>
      </div>

      {/* Navigation Bar */}
      <div className="border-b border-white/[0.06] bg-black/40">
        <div className="max-w-4xl mx-auto px-4 py-2 flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest">
          <Link href="/" className="flex items-center gap-1.5 text-white/30 hover:text-white/60 transition-colors">
            <Home size={12} />
            <span>Ana Sayfa</span>
          </Link>
          <span className="text-white/10 mx-1">/</span>
          <Link href="/hall-of-fame" className="flex items-center gap-1.5 text-white/30 hover:text-white/60 transition-colors">
            <Building2 size={12} />
            <span>Efsaneler Müzesi</span>
          </Link>
          <span className="text-white/10 mx-1">/</span>
          <span className="flex items-center gap-1.5 text-amber-400">
            <Trophy size={12} />
            <span>Ödüller</span>
          </span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Sezon Sekmeleri */}
        <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
          {seasons.map(season => (
            <button
              key={season}
              onClick={() => setSelectedSeason(season)}
              className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap ${
                selectedSeason === season
                  ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                  : 'bg-white/[0.03] text-white/30 border border-white/[0.06] hover:bg-white/[0.06]'
              }`}
            >
              {season === 'all' ? 'Tüm Sezonlar' : `Sezon ${season.slice(0, 8)}`}
            </button>
          ))}
        </div>

        {/* Ödül Listesi */}
        {awardsByType.length === 0 ? (
          <div className="text-center py-12">
            <Trophy className="w-8 h-8 text-white/10 mx-auto mb-3" />
            <p className="text-xs text-white/25">Henüz ödül kaydı bulunmuyor</p>
          </div>
        ) : (
          awardsByType.map(([awardType, items]) => {
            const config = getAwardConfig(awardType);
            return (
              <div key={awardType} className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg border ${config.bg}`}>
                    <span className={config.color}>{config.icon}</span>
                  </div>
                  <div>
                    <h3 className={`text-sm font-black uppercase tracking-wider ${config.color}`}>{config.label}</h3>
                    <p className="text-[9px] text-white/20 uppercase tracking-widest">{items.length} kazanan</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {items.map((award, idx) => (
                    <motion.div
                      key={award.id || idx}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.03 }}
                      className={`rounded-xl border ${config.bg} p-4`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-white/70 truncate">
                          {award.player_name || 'Bilinmiyor'}
                        </span>
                        {idx === 0 && (
                          <span className="text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300">
                            Kazanan
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-white/30">{award.team_name || ''}</span>
                        <span className="text-[10px] font-bold text-white/50">
                          {award.stat_value} {award.award_type === 'golden_boot' ? 'gol' : award.award_type === 'top_assists' ? 'asist' : 'puan'}
                        </span>
                      </div>
                      {award.season_id && (
                        <div className="mt-2 pt-2 border-t border-white/[0.04]">
                          <span className="text-[8px] text-white/15">Sezon: {award.season_id.slice(0, 10)}</span>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
