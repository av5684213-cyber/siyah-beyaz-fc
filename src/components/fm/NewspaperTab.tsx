'use client';

import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import {
  Newspaper,
  Trophy,
  TrendingUp,
  TrendingDown,
  ArrowRightLeft,
  AlertTriangle,
  Star,
  Flame,
  Eye,
  RefreshCw,
  Shield,
} from 'lucide-react';
import { useFM } from '@/lib/fm/GameContext';
import { generateWeeklyNews } from '@/lib/fm/mediaSystem';
import type { Profile, Player } from '@/lib/fm/types';
import { isSupabaseConfigured, getSupabase } from '@/lib/supabase';

// ═══════════════════════════════════════════════════
//  TİP TANIMLARI
// ═══════════════════════════════════════════════════

interface NewsArticle {
  id: string;
  category: 'headline' | 'match' | 'transfer' | 'rumor' | 'league';
  title: string;
  summary: string;
  importance: number;
  timestamp: string;
  impact?: { morale: number; reputation: number };
}

/** API'den gelen tek bir puan durumu satırı */
interface StandingRow {
  id: string;
  team_id: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goals_for: number;
  goals_against: number;
  gd: number;
  points: number;
  teams?: {
    name: string;
    is_user_team: boolean;
    is_bot: boolean;
    avg_rating: number;
  };
}

/** Kullanıcının üye olduğu lig bilgisi */
interface UserLeagueInfo {
  id: string;
  name: string;
  tier: number;
}

// ═══════════════════════════════════════════════════
//  SABİTLER
// ═══════════════════════════════════════════════════

const FAKE_OPPONENTS = [
  'Karagümrük SK', 'Sivasspor', 'Kayserispor', 'Alanyaspor',
  'Hatayspor', 'Gaziantep FK', 'Adana Demirspor', 'Kasımpaşa',
  'Antalyaspor', 'Konyaspor', 'Rizespor', 'Pendikspor',
  'İstanbulspor', 'Altay SK', 'Bandırmaspor', 'Boluspor',
];

// ═══════════════════════════════════════════════════
//  YARDIMCI FONKSİYONLAR
// ═══════════════════════════════════════════════════

function generateArticles(profile: Profile, squad: Player[]): NewsArticle[] {
  if (!profile) return [];

  const teamName = profile.team_name || 'Takım';
  const articles: NewsArticle[] = [];

  // Generate weekly news using mediaSystem
  const lastResult = Math.random() > 0.4 ? 'win' : Math.random() > 0.5 ? 'draw' : 'loss';
  const opponent = FAKE_OPPONENTS[Math.floor(Math.random() * FAKE_OPPONENTS.length)];
  const goalsFor = lastResult === 'win' ? Math.floor(Math.random() * 3) + 1 : Math.floor(Math.random() * 2);
  const goalsAgainst = lastResult === 'loss' ? Math.floor(Math.random() * 3) + 1 : Math.floor(Math.random() * 2);

  try {
    const mediaMessages = generateWeeklyNews({
      profile,
      lastMatch: {
        result: lastResult,
        opponentName: opponent,
        goalsFor,
        goalsAgainst,
      },
      leaguePosition: Math.floor(Math.random() * 12) + 1,
      tier: 4,
    });

    // Convert MediaMessages to NewsArticles
    for (const msg of mediaMessages) {
      let category: NewsArticle['category'] = 'headline';
      if (msg.type === 'transfer') category = 'transfer';
      else if (msg.type === 'rumor') category = 'rumor';
      else if (msg.type === 'praise' || msg.type === 'criticism') category = 'match';
      else if (msg.type === 'milestone') category = 'league';

      articles.push({
        id: msg.id,
        category,
        title: msg.headline,
        summary: msg.body,
        importance: msg.importance,
        timestamp: msg.date,
        impact: { morale: msg.teamImpact.morale, reputation: msg.teamImpact.reputation },
      });
    }
  } catch (err) {
    console.error('[NewspaperTab] generateWeeklyNews hatası:', err);
  }

  // Add transfer rumors from squad
  if (squad.length > 0) {
    const topPlayer = [...squad].sort((a, b) => (b.market_value || 0) - (a.market_value || 0))[0];
    if (topPlayer) {
      const interestedClubs = FAKE_OPPONENTS.filter(t => t !== teamName);
      const club = interestedClubs[Math.floor(Math.random() * interestedClubs.length)];
      articles.push({
        id: 'rumor-top',
        category: 'rumor',
        title: `${club.toUpperCase()} ${topPlayer.name?.toUpperCase() || 'YILDIZ'} İÇİN DEVREDE!`,
        summary: `${club}, ${teamName}'nın yıldız oyuncusu ${topPlayer.name || 'isimsiz'} için gizli görüşme başlattığı iddia edildi. Oyuncunun piyasası ${((topPlayer.market_value || 0) / 1000000).toFixed(1)}M Kredi seviyesinde.`,
        importance: 4,
        timestamp: new Date().toISOString(),
        impact: { morale: -3, reputation: 2 },
      });
    }

    // Random squad rumor
    const randomPlayer = squad[Math.floor(Math.random() * squad.length)];
    if (randomPlayer && randomPlayer !== topPlayer) {
      articles.push({
        id: 'rumor-random',
        category: 'rumor',
        title: `${teamName.toUpperCase()} ${randomPlayer.position} ARAYIŞINDA!`,
        summary: `${teamName} teknik heyeti, ${randomPlayer.position} mevkiisine takviye için piyasayı tarıyor. ${randomPlayer.name || 'Oyuncu'} alternatif olarak değerlendiriliyor.`,
        importance: 2,
        timestamp: new Date().toISOString(),
        impact: { morale: 1, reputation: 0 },
      });
    }
  }

  // Sort by importance
  articles.sort((a, b) => b.importance - a.importance);

  return articles.slice(0, 8);
}

function getCategoryIcon(category: NewsArticle['category']) {
  switch (category) {
    case 'headline': return <Newspaper size={14} />;
    case 'match': return <Trophy size={14} />;
    case 'transfer': return <ArrowRightLeft size={14} />;
    case 'rumor': return <Eye size={14} />;
    case 'league': return <Star size={14} />;
  }
}

function getCategoryColor(category: NewsArticle['category']) {
  switch (category) {
    case 'headline': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
    case 'match': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    case 'transfer': return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
    case 'rumor': return 'text-purple-400 bg-purple-500/10 border-purple-500/20';
    case 'league': return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
  }
}

function getCategoryLabel(category: NewsArticle['category']) {
  switch (category) {
    case 'headline': return 'MANŞET';
    case 'match': return 'MAÇ';
    case 'transfer': return 'TRANSFER';
    case 'rumor': return 'RÜZGAR';
    case 'league': return 'LİG';
  }
}

/** Takım ismini güvenli şekilde temizle */
function sanitizeTeamName(raw: unknown): string {
  if (raw === null || raw === undefined) return 'Bilinmiyor';
  if (typeof raw !== 'string') return 'Bilinmiyor';
  const cleaned = raw.trim();
  if (!cleaned || cleaned.toLowerCase() === 'undefined' || cleaned.toLowerCase() === 'null' || cleaned === 'NaN') return 'Bilinmiyor';
  if (cleaned.toLowerCase().includes('undefined') || cleaned.toLowerCase().includes('null')) return 'Bilinmiyor';
  return cleaned;
}

// ═══════════════════════════════════════════════════
//  ANA BİLEŞEN
// ═══════════════════════════════════════════════════

export default function NewspaperTab() {
  const { profile, squad } = useFM();

  // ── Puan Durumu State ──
  const [userLeagues, setUserLeagues] = useState<UserLeagueInfo[]>([]);
  const [activeLeagueId, setActiveLeagueId] = useState<string>('');
  const [standings, setStandings] = useState<StandingRow[]>([]);
  const [standingsLoading, setStandingsLoading] = useState(false);
  const [standingsError, setStandingsError] = useState<string>('');

  // ── Kullanıcının liglerini bul ──
  useEffect(() => {
    if (!profile?.id) return;
    if (!isSupabaseConfigured()) return;

    const fetchUserLeagues = async () => {
      try {
        const supabase = getSupabase();
        if (!supabase) return;

        // league_teams tablosundan kullanıcının takımlarını bul
        const { data: teamRows, error: teamError } = await supabase
          .from('league_teams')
          .select('league_id, leagues ( id, name, tier )')
          .eq('profile_id', profile.id);

        if (teamError) {
          console.error('[NewspaperTab] league_teams sorgu hatası:', teamError);
          return;
        }

        if (teamRows && teamRows.length > 0) {
          const leagues: UserLeagueInfo[] = teamRows
            .map((row: Record<string, unknown>) => {
              const leagueData = row.leagues as Record<string, unknown> | null;
              if (!leagueData) return null;
              return {
                id: String(leagueData.id),
                name: String(leagueData.name || 'Bilinmeyen Lig'),
                tier: Number(leagueData.tier || 4),
              };
            })
            .filter((l: UserLeagueInfo | null): l is UserLeagueInfo => l !== null);

          setUserLeagues(leagues);

          // İlk ligi aktif olarak ayarla
          if (leagues.length > 0 && !activeLeagueId) {
            setActiveLeagueId(leagues[0].id);
          }
        } else {
          // league_teams'de yoksa, profile.league_name'den dene
          if (profile.league_name) {
            try {
              const { data: leagueByName } = await supabase
                .from('leagues')
                .select('id, name, tier')
                .eq('name', profile.league_name)
                .maybeSingle();

              if (leagueByName) {
                const leagueInfo: UserLeagueInfo = {
                  id: String(leagueByName.id),
                  name: String(leagueByName.name),
                  tier: Number(leagueByName.tier || 4),
                };
                setUserLeagues([leagueInfo]);
                if (!activeLeagueId) {
                  setActiveLeagueId(leagueInfo.id);
                }
              }
            } catch (nameErr) {
              console.error('[NewspaperTab] league_name ile lig bulunamadı:', nameErr);
            }
          }
        }
      } catch (err) {
        console.error('[NewspaperTab] Kullanıcı ligleri yüklenemedi:', err);
      }
    };

    fetchUserLeagues();
  }, [profile?.id, profile?.league_name]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Aktif lig için puan durumu çek ──
  const fetchStandingsForLeague = useCallback(async (leagueId: string) => {
    if (!leagueId) return;
    setStandingsLoading(true);
    setStandingsError('');

    try {
      const res = await fetch(`/api/league/standings?leagueId=${encodeURIComponent(leagueId)}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();

      if (json.standings && Array.isArray(json.standings)) {
        setStandings(json.standings);
      } else {
        setStandings([]);
      }
    } catch (err) {
      console.error('[NewspaperTab] Puan durumu yüklenemedi:', err);
      setStandingsError('Puan durumu yüklenemedi');
      setStandings([]);
    } finally {
      setStandingsLoading(false);
    }
  }, []);

  // Aktif lig değiştiğinde puan durumu çek
  useEffect(() => {
    if (activeLeagueId) {
      fetchStandingsForLeague(activeLeagueId);
    }
  }, [activeLeagueId, fetchStandingsForLeague]);

  // ── Haber makaleleri ──
  const articles = useMemo(() => {
    if (!profile) return [];
    return generateArticles(profile, squad);
  }, [profile, squad]);

  // ── Aktif lig adını bul ──
  const activeLeague = userLeagues.find(l => l.id === activeLeagueId);

  // ── Kullanıcının takımını puan durumunda vurgula ──
  const userTeamName = profile?.team_name || '';

  if (!profile) {
    return (
      <div className="flex items-center justify-center h-64 text-white/30">
        <Newspaper size={32} className="mr-3 opacity-30" />
        <span className="text-sm font-bold uppercase tracking-widest">Takım kurulmadı</span>
      </div>
    );
  }

  const headlines = articles.filter(a => a.category === 'headline' || a.category === 'match');
  const transferRumors = articles.filter(a => a.category === 'transfer' || a.category === 'rumor');

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-6"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center gap-4 border-b border-white/10 pb-4"
      >
        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
          <Newspaper className="text-amber-500" size={24} />
        </div>
        <div>
          <h2 className="text-xl font-black italic uppercase tracking-tighter text-white">
            Spor Gazetesi
          </h2>
          <p className="text-[10px] text-white/40 uppercase font-bold tracking-[0.3em]">
            Gün {profile.current_day || 1} • {profile.team_name} Bülteni
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2 text-[10px] text-white/20 font-bold uppercase">
          <Flame size={12} className="text-amber-500" />
          <span>Son Dakika</span>
        </div>
      </motion.div>

      {/* Headlines Section */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 px-1">
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">
            Manşetler
          </h3>
          <div className="h-px flex-1 bg-white/5" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {headlines.length > 0 ? headlines.slice(0, 4).map((article, i) => (
            <motion.div
              key={article.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="bg-zinc-950 border border-white/5 rounded-2xl p-4 hover:border-white/10 transition-all group"
            >
              <div className="flex items-start gap-3">
                <div className={`shrink-0 p-2 rounded-xl border ${getCategoryColor(article.category)}`}>
                  {getCategoryIcon(article.category)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className={`text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded border ${getCategoryColor(article.category)}`}>
                      {getCategoryLabel(article.category)}
                    </span>
                    <span className="text-[8px] text-white/15 font-bold">
                      {'★'.repeat(article.importance)}
                    </span>
                  </div>
                  <h4 className="text-sm font-black text-white/90 uppercase tracking-tight leading-tight mb-2 group-hover:text-white transition-colors">
                    {article.title}
                  </h4>
                  <p className="text-[11px] text-white/40 leading-relaxed line-clamp-2">
                    {article.summary}
                  </p>
                  {article.impact && (
                    <div className="flex items-center gap-3 mt-2">
                      <span className={`text-[8px] font-bold flex items-center gap-1 ${article.impact.morale >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {article.impact.morale >= 0 ? <TrendingUp size={8} /> : <TrendingDown size={8} />}
                        Moral {article.impact.morale >= 0 ? '+' : ''}{article.impact.morale}
                      </span>
                      <span className={`text-[8px] font-bold flex items-center gap-1 ${article.impact.reputation >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {article.impact.reputation >= 0 ? <TrendingUp size={8} /> : <TrendingDown size={8} />}
                        Rep {article.impact.reputation >= 0 ? '+' : ''}{article.impact.reputation}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )) : (
            <div className="col-span-2 text-center py-8 text-white/20 text-xs">
              Henüz haber yok
            </div>
          )}
        </div>
      </div>

      {/* Two-Column Layout: Transfer Rumors + League Table */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

        {/* Transfer Rumors */}
        <div className="lg:col-span-3 space-y-3">
          <div className="flex items-center gap-2 px-1">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">
              Transfer Rüzgarı
            </h3>
            <div className="h-px flex-1 bg-white/5" />
          </div>

          <div className="space-y-2 max-h-80 overflow-y-auto pr-1 scrollbar-none">
            {transferRumors.length > 0 ? transferRumors.map((article, i) => (
              <motion.div
                key={article.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                className="bg-zinc-950 border border-white/5 rounded-xl p-3 hover:border-white/10 transition-all"
              >
                <div className="flex items-start gap-2.5">
                  <div className={`shrink-0 p-1.5 rounded-lg border ${getCategoryColor(article.category)}`}>
                    {getCategoryIcon(article.category)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[7px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded border ${getCategoryColor(article.category)}`}>
                        {getCategoryLabel(article.category)}
                      </span>
                    </div>
                    <h4 className="text-[11px] font-black text-white/80 uppercase tracking-tight leading-tight mb-1">
                      {article.title}
                    </h4>
                    <p className="text-[10px] text-white/30 leading-relaxed line-clamp-2">
                      {article.summary}
                    </p>
                  </div>
                </div>
              </motion.div>
            )) : (
              <div className="text-center py-6 text-white/15 text-[10px]">
                <AlertTriangle size={16} className="mx-auto mb-2 opacity-30" />
                Transfer rüzgarı sakin
              </div>
            )}
          </div>
        </div>

        {/* League Table - Kullanıcının Ligi */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center gap-2 px-1">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">
              Puan Durumu
            </h3>
            <div className="h-px flex-1 bg-white/5" />
          </div>

          {/* Lig sekmeleri (birden fazla lig varsa) */}
          {userLeagues.length > 1 && (
            <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {userLeagues.map(league => (
                <button
                  key={league.id}
                  onClick={() => setActiveLeagueId(league.id)}
                  className={`px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-wider whitespace-nowrap transition-all border ${
                    activeLeagueId === league.id
                      ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                      : 'bg-white/5 text-white/30 border-white/5 hover:text-white/50 hover:border-white/10'
                  }`}
                >
                  {league.name}
                </button>
              ))}
            </div>
          )}

          {/* Lig adı göstergesi */}
          {activeLeague && (
            <div className="flex items-center gap-2 px-1">
              <Trophy size={10} className="text-amber-500/60" />
              <span className="text-[9px] font-bold text-amber-400/60 uppercase tracking-wider">
                {activeLeague.name}
              </span>
            </div>
          )}

          <div className="bg-zinc-950 border border-white/5 rounded-2xl overflow-hidden">
            {/* Yükleniyor durumu */}
            {standingsLoading && (
              <div className="flex items-center justify-center py-10">
                <RefreshCw size={16} className="text-white/20 animate-spin" />
              </div>
            )}

            {/* Hata durumu */}
            {!standingsLoading && standingsError && (
              <div className="flex flex-col items-center justify-center py-8 text-white/20">
                <AlertTriangle size={16} className="mb-2 opacity-30" />
                <p className="text-[9px] uppercase tracking-wider font-bold">{standingsError}</p>
                <button
                  onClick={() => fetchStandingsForLeague(activeLeagueId)}
                  className="mt-2 text-[8px] px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-white/40 hover:text-white/60 border border-white/5 transition-all"
                >
                  Tekrar Dene
                </button>
              </div>
            )}

            {/* Puan durumu tablosu */}
            {!standingsLoading && !standingsError && standings.length > 0 && (
              <table className="w-full text-[10px]">
                <thead>
                  <tr className="border-b border-white/5 text-white/20">
                    <th className="text-left py-2 px-3 font-black uppercase">#</th>
                    <th className="text-left py-2 px-1 font-black uppercase">Takım</th>
                    <th className="text-center py-2 px-1 font-black uppercase">O</th>
                    <th className="text-center py-2 px-1 font-black uppercase">G</th>
                    <th className="text-center py-2 px-1 font-black uppercase">B</th>
                    <th className="text-center py-2 px-1 font-black uppercase">M</th>
                    <th className="text-center py-2 px-1 font-black uppercase">Av</th>
                    <th className="text-center py-2 px-1 font-black uppercase">P</th>
                  </tr>
                </thead>
                <tbody>
                  {standings.map((row, i) => {
                    const teamName = sanitizeTeamName(row.teams?.name);
                    const isUserTeam = row.teams?.is_user_team || teamName === userTeamName;
                    const gd = row.gd || (row.goals_for - row.goals_against);

                    return (
                      <tr
                        key={row.team_id || row.id}
                        className={`border-b border-white/5 ${isUserTeam ? 'bg-amber-500/5' : 'hover:bg-white/[0.02]'} transition-colors`}
                      >
                        <td className={`py-2 px-3 font-mono font-bold ${i < 2 ? 'text-emerald-400' : i < 4 ? 'text-amber-400' : 'text-white/30'}`}>
                          {i + 1}
                        </td>
                        <td className={`py-2 px-1 font-bold truncate max-w-[80px] ${isUserTeam ? 'text-amber-400' : 'text-white/70'}`}>
                          <div className="flex items-center gap-1">
                            {isUserTeam && <Shield size={8} className="shrink-0" />}
                            <span className="truncate">{teamName}</span>
                          </div>
                        </td>
                        <td className="py-2 px-1 text-center text-white/30 font-mono">{row.played}</td>
                        <td className="py-2 px-1 text-center text-emerald-400/60 font-mono">{row.won}</td>
                        <td className="py-2 px-1 text-center text-white/30 font-mono">{row.drawn}</td>
                        <td className="py-2 px-1 text-center text-red-400/60 font-mono">{row.lost}</td>
                        <td className={`py-2 px-1 text-center font-mono ${gd > 0 ? 'text-emerald-400/60' : gd < 0 ? 'text-red-400/60' : 'text-white/30'}`}>
                          {gd > 0 ? '+' : ''}{gd}
                        </td>
                        <td className={`py-2 px-1 text-center font-black font-mono ${isUserTeam ? 'text-amber-400' : 'text-white/80'}`}>
                          {row.points}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}

            {/* Boş durum - lig bulunamadı */}
            {!standingsLoading && !standingsError && standings.length === 0 && userLeagues.length === 0 && (
              <div className="flex flex-col items-center justify-center py-8 text-white/20">
                <Trophy size={20} className="mb-2 opacity-20" />
                <p className="text-[9px] uppercase tracking-wider font-bold">Lig bulunamadı</p>
                <p className="text-[8px] text-white/10 mt-1">Takımınız bir lige kayıtlı değil</p>
              </div>
            )}

            {/* Boş durum - lig var ama puan durumu yok */}
            {!standingsLoading && !standingsError && standings.length === 0 && userLeagues.length > 0 && (
              <div className="flex flex-col items-center justify-center py-8 text-white/20">
                <Trophy size={20} className="mb-2 opacity-20" />
                <p className="text-[9px] uppercase tracking-wider font-bold">Henüz puan durumu yok</p>
                <p className="text-[8px] text-white/10 mt-1">Maçlar başladığında güncellenecek</p>
              </div>
            )}

            {/* Alt açıklama şeridi */}
            {standings.length > 0 && (
              <div className="p-2 border-t border-white/5 flex items-center justify-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500/40" />
                <span className="text-[7px] text-white/15 font-bold uppercase">Doğrudan Çıkma</span>
                <div className="w-2 h-2 rounded-full bg-amber-500/40 ml-2" />
                <span className="text-[7px] text-white/15 font-bold uppercase">Play-off</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
