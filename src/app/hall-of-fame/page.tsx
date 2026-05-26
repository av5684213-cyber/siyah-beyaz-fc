'use client';

import { useState, useEffect, useCallback } from 'react';
import { getSupabase } from '@/lib/supabase';
import { safeJsonParse } from '@/lib/fm/sharedUtils';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Trophy, Building2, Home } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────

type LegendTier = 'platinum' | 'gold' | 'silver' | 'bronze';

interface HallOfFameEntry {
  id: string;
  profile_id: string;
  player_id: string | null;
  player_name: string;
  position: string;
  nationality?: string;
  seasons_played: number;
  total_goals: number;
  total_assists: number;
  total_matches: number;
  total_clean_sheets: number;
  total_motm: number;
  avg_rating: number;
  peak_rating: number;
  legend_tier: LegendTier;
  is_club_legend: boolean;
  awards_won: string[];
  retired_season?: string;
  inducted_at?: string;
}

interface SeasonGroup {
  season: string;
  entries: HallOfFameEntry[];
}

// ─── Tier Config ──────────────────────────────────────────────────

const TIER_STYLES: Record<LegendTier, { bg: string; border: string; text: string; icon: string; glow: string }> = {
  platinum: { bg: 'bg-gradient-to-br from-slate-200 to-slate-100', border: 'border-slate-400', text: 'text-slate-700', icon: '💎', glow: 'shadow-slate-300/50' },
  gold: { bg: 'bg-gradient-to-br from-amber-100 to-yellow-50', border: 'border-amber-400', text: 'text-amber-700', icon: '🥇', glow: 'shadow-amber-300/50' },
  silver: { bg: 'bg-gradient-to-br from-gray-100 to-gray-50', border: 'border-gray-400', text: 'text-gray-600', icon: '🥈', glow: 'shadow-gray-300/40' },
  bronze: { bg: 'bg-gradient-to-br from-orange-50 to-amber-50', border: 'border-orange-300', text: 'text-orange-600', icon: '🥉', glow: 'shadow-orange-200/30' },
};

const POSITION_LABELS: Record<string, string> = {
  GK: 'Kaleci', DEF: 'Savunma', MID: 'Orta Saha', FWD: 'Forvet',
  ST: 'Forvet', CF: 'Santrafor', LW: 'Sol Kanat', RW: 'Sağ Kanat',
  CAM: 'Ofansif Ortasaha', CM: 'Ortasaha', CDM: 'Defansif Ortasaha',
  CB: 'Stoper', LB: 'Sol Bek', RB: 'Sağ Bek',
  team: 'Takım',
};

// ─── Main Page ────────────────────────────────────────────────────

export default function HallOfFamePage() {
  const router = useRouter();
  const [entries, setEntries] = useState<HallOfFameEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'legends' | 'seasons'>('all');
  const [selectedTier, setSelectedTier] = useState<LegendTier | 'all'>('all');

  const fetchHallOfFame = useCallback(async () => {
    setLoading(true);
    try {
      const supabase = getSupabase();
      if (!supabase) return;

      const { data, error } = await supabase
        .from('hall_of_fame')
        .select('*')
        .order('inducted_at', { ascending: false });

      if (error) {
        console.error('HoF fetch error:', error);
        return;
      }

      if (data) {
        const mapped = data.map((row: Record<string, unknown>) => ({
          id: row.id as string,
          profile_id: row.profile_id as string,
          player_id: (row.player_id as string) || null,
          player_name: (row.player_name as string) || 'Bilinmeyen',
          position: (row.position as string) || '',
          nationality: (row.nationality as string) || undefined,
          seasons_played: (row.seasons_played as number) || 0,
          total_goals: (row.total_goals as number) || 0,
          total_assists: (row.total_assists as number) || 0,
          total_matches: (row.total_matches as number) || 0,
          total_clean_sheets: (row.total_clean_sheets as number) || 0,
          total_motm: (row.total_motm as number) || 0,
          avg_rating: (row.avg_rating as number) || 0,
          peak_rating: (row.peak_rating as number) || 0,
          legend_tier: (row.legend_tier as LegendTier) || 'bronze',
          is_club_legend: (row.is_club_legend as boolean) || false,
          awards_won: safeJsonParse<string[]>(row.awards_won as string, []),
          retired_season: (row.retired_season as string) || undefined,
          inducted_at: (row.inducted_at as string) || undefined,
        }));
        setEntries(mapped);
      }
    } catch (err) {
      console.error('HoF fetch exception:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHallOfFame();
  }, [fetchHallOfFame]);

  // Filter logic
  const filteredEntries = entries.filter((e) => {
    if (selectedTier !== 'all' && e.legend_tier !== selectedTier) return false;
    if (activeTab === 'legends' && !e.is_club_legend) return false;
    return true;
  });

  // Group by season
  const seasonGroups: SeasonGroup[] = (() => {
    const groups: Record<string, HallOfFameEntry[]> = {};
    for (const e of filteredEntries) {
      const season = e.retired_season || 'Diğer';
      if (!groups[season]) groups[season] = [];
      groups[season].push(e);
    }
    return Object.entries(groups)
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([season, entries]) => ({ season, entries }));
  })();

  // Stats
  const totalEntries = entries.length;
  const legendCount = entries.filter((e) => e.is_club_legend).length;
  const tierCounts: Record<string, number> = { platinum: 0, gold: 0, silver: 0, bronze: 0 };
  entries.forEach((e) => { tierCounts[e.legend_tier] = (tierCounts[e.legend_tier] || 0) + 1; });

  // ─── Render ────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white p-4 md:p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-white/40 hover:text-white/70 transition-colors"
          >
            <ArrowLeft size={18} />
            <span className="text-xs font-bold uppercase tracking-widest">Geri</span>
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-2 text-white/20">
            <Building2 size={14} />
            <span className="text-[10px] font-semibold">{entries.length} efsane</span>
          </div>
        </div>

        <div className="flex items-center gap-4 mb-6">
          <div className="text-5xl">🏛️</div>
          <div>
            <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-300 bg-clip-text text-transparent">
              Efsaneler Müzesi
            </h1>
            <p className="text-slate-400 mt-1">Tüm zamanların en büyükleri</p>
          </div>
        </div>

        {/* Navigation Bar */}
        <div className="border-b border-white/[0.06] bg-slate-800/30 rounded-lg mb-6">
          <div className="px-4 py-2 flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest">
            <Link href="/" className="flex items-center gap-1.5 text-white/30 hover:text-white/60 transition-colors">
              <Home size={12} />
              <span>Ana Sayfa</span>
            </Link>
            <span className="text-white/10 mx-1">/</span>
            <Link href="/awards" className="flex items-center gap-1.5 text-white/30 hover:text-white/60 transition-colors">
              <Trophy size={12} />
              <span>Ödüller</span>
            </Link>
            <span className="text-white/10 mx-1">/</span>
            <span className="flex items-center gap-1.5 text-amber-400">
              <Building2 size={12} />
              <span>Efsaneler Müzesi</span>
            </span>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          {[
            { label: 'Toplam Üye', value: totalEntries, icon: '📋' },
            { label: 'Klüp Efsanesi', value: legendCount, icon: '👑' },
            { label: 'Platin', value: tierCounts.platinum, icon: '💎' },
            { label: 'Altın', value: tierCounts.gold, icon: '🥇' },
            { label: 'Gümüş/Bronz', value: tierCounts.silver + tierCounts.bronze, icon: '🥈' },
          ].map((stat) => (
            <div key={stat.label} className="bg-slate-800/60 rounded-xl p-3 text-center border border-slate-700/50">
              <div className="text-2xl mb-1">{stat.icon}</div>
              <div className="text-xl font-bold text-amber-300">{stat.value}</div>
              <div className="text-xs text-slate-400">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs & Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="flex bg-slate-800/80 rounded-lg p-1">
            {[
              { key: 'all' as const, label: 'Tümü' },
              { key: 'legends' as const, label: 'Klüp Efsaneleri' },
              { key: 'seasons' as const, label: 'Sezon Bazlı' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  activeTab === tab.key
                    ? 'bg-amber-500 text-slate-900'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            {(['all', 'platinum', 'gold', 'silver', 'bronze'] as const).map((tier) => (
              <button
                key={tier}
                onClick={() => setSelectedTier(tier)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                  selectedTier === tier
                    ? 'border-amber-400 bg-amber-400/20 text-amber-300'
                    : 'border-slate-600 bg-slate-800/60 text-slate-400 hover:border-slate-500'
                }`}
              >
                {tier === 'all' ? 'Tüm Tier' : TIER_STYLES[tier].icon + ' ' + tier.charAt(0).toUpperCase() + tier.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin h-10 w-10 border-4 border-amber-400 border-t-transparent rounded-full" />
            <span className="ml-4 text-slate-400 text-lg">Efsaneler yükleniyor...</span>
          </div>
        )}

        {/* No Data */}
        {!loading && filteredEntries.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🏟️</div>
            <h2 className="text-xl font-semibold text-slate-300 mb-2">Henüz Hall of Fame'e kabul edilen oyuncu yok</h2>
            <p className="text-slate-500">Sezon sonunda emekli olan yıldız oyuncular burada yer alacak.</p>
          </div>
        )}

        {/* All/Legends View */}
        {!loading && filteredEntries.length > 0 && activeTab !== 'seasons' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredEntries.map((entry) => (
              <HoFCard key={entry.id} entry={entry} />
            ))}
          </div>
        )}

        {/* Season View */}
        {!loading && seasonGroups.length > 0 && activeTab === 'seasons' && (
          <div className="space-y-8">
            {seasonGroups.map((group) => (
              <div key={group.season}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-px flex-1 bg-gradient-to-r from-amber-500/50 to-transparent" />
                  <h2 className="text-lg font-bold text-amber-300">{group.season}</h2>
                  <div className="h-px flex-1 bg-gradient-to-l from-amber-500/50 to-transparent" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {group.entries.map((entry) => (
                    <HoFCard key={entry.id} entry={entry} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── HoF Card Component ──────────────────────────────────────────

function HoFCard({ entry }: { entry: HallOfFameEntry }) {
  const tier = TIER_STYLES[entry.legend_tier];
  const isTeam = entry.position === 'team';

  return (
    <div
      className={`relative rounded-xl border-2 ${tier.border} ${tier.bg} ${tier.glow} shadow-lg p-5 transition-all hover:scale-[1.02] hover:shadow-xl`}
    >
      {/* Tier Badge */}
      <div className="absolute -top-3 -right-2 text-2xl">{tier.icon}</div>

      {/* Club Legend Crown */}
      {entry.is_club_legend && (
        <div className="absolute -top-3 -left-2 text-2xl">👑</div>
      )}

      {/* Player Info */}
      <div className="flex items-start gap-3 mb-3">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-white font-bold text-lg border-2 border-slate-600">
          {isTeam ? '🏆' : entry.player_name.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-lg truncate" style={{ color: 'var(--tw-text-opacity, #1e293b)' }}>
            <span className={tier.text}>{entry.player_name}</span>
          </h3>
          <p className="text-sm text-slate-500">
            {POSITION_LABELS[entry.position] || entry.position}
            {entry.nationality && ` • ${entry.nationality}`}
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      {!isTeam && (
        <div className="grid grid-cols-3 gap-2 mb-3">
          {[
            { label: 'Gol', value: entry.total_goals, icon: '⚽' },
            { label: 'Asist', value: entry.total_assists, icon: '🎯' },
            { label: 'Maç', value: entry.total_matches, icon: '🏟️' },
          ].map((stat) => (
            <div key={stat.label} className="bg-white/40 rounded-lg p-2 text-center">
              <div className="text-sm">{stat.icon}</div>
              <div className="font-bold text-slate-800">{stat.value}</div>
              <div className="text-xs text-slate-500">{stat.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Additional Stats */}
      <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
        <span>Rating: {entry.avg_rating.toFixed(1)} avg / {entry.peak_rating} peak</span>
        <span>{entry.seasons_played} sezon</span>
      </div>

      {/* Clean Sheets (GK only) */}
      {entry.position === 'GK' && entry.total_clean_sheets > 0 && (
        <div className="text-xs text-slate-500 mb-2">
          🧤 Clean Sheet: {entry.total_clean_sheets}
        </div>
      )}

      {/* MotM */}
      {entry.total_motm > 0 && (
        <div className="text-xs text-slate-500 mb-2">
          🏅 Maçın Adamı: {entry.total_motm}
        </div>
      )}

      {/* Awards */}
      {entry.awards_won.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {entry.awards_won.map((award) => (
            <span
              key={award}
              className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700 border border-amber-300"
            >
              {award.replace(/_/g, ' ')}
            </span>
          ))}
        </div>
      )}

      {/* Inducted Date */}
      {entry.inducted_at && (
        <div className="text-xs text-slate-400 mt-2">
          Giriş: {new Date(entry.inducted_at).toLocaleDateString('tr-TR')}
        </div>
      )}
    </div>
  );
}
