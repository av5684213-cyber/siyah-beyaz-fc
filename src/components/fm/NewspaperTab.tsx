'use client';

import React, { useMemo } from 'react';
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
} from 'lucide-react';
import { useFM } from '@/lib/fm/GameContext';
import { generateWeeklyNews } from '@/lib/fm/mediaSystem';
import type { MediaMessage } from '@/lib/fm/mediaSystem';

interface NewsArticle {
  id: string;
  category: 'headline' | 'match' | 'transfer' | 'rumor' | 'league';
  title: string;
  summary: string;
  importance: number;
  timestamp: string;
  impact?: { morale: number; reputation: number };
}

const FAKE_OPPONENTS = [
  'Karagümrük SK', 'Sivasspor', 'Kayserispor', 'Alanyaspor',
  'Hatayspor', 'Gaziantep FK', 'Adana Demirspor', 'Kasımpaşa',
  'Antalyaspor', 'Konyaspor', 'Rizespor', 'Pendikspor',
  'İstanbulspor', 'Altay SK', 'Bandırmaspor', 'Boluspor',
];

const FAKE_TEAMS_TOP5 = [
  { name: 'Galatasaray', p: 34, w: 24, d: 6, l: 4, gf: 68, ga: 22, pts: 78 },
  { name: 'Fenerbahçe', p: 34, w: 22, d: 7, l: 5, gf: 64, ga: 28, pts: 73 },
  { name: 'Beşiktaş', p: 34, w: 20, d: 5, l: 9, gf: 58, ga: 35, pts: 65 },
  { name: 'Trabzonspor', p: 34, w: 18, d: 8, l: 8, gf: 52, ga: 32, pts: 62 },
  { name: 'Başakşehir', p: 34, w: 16, d: 9, l: 9, gf: 48, ga: 36, pts: 57 },
];

function generateArticles(profile: any, squad: any[]): NewsArticle[] {
  if (!profile) return [];

  const teamName = profile.team_name || 'Takım';
  const articles: NewsArticle[] = [];
  const day = profile.current_day || 1;

  // Generate weekly news using mediaSystem
  const lastResult = Math.random() > 0.4 ? 'win' : Math.random() > 0.5 ? 'draw' : 'loss';
  const opponent = FAKE_OPPONENTS[Math.floor(Math.random() * FAKE_OPPONENTS.length)];
  const goalsFor = lastResult === 'win' ? Math.floor(Math.random() * 3) + 1 : Math.floor(Math.random() * 2);
  const goalsAgainst = lastResult === 'loss' ? Math.floor(Math.random() * 3) + 1 : Math.floor(Math.random() * 2);

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
        summary: `${club}, ${teamName}'nın yıldız oyuncusu ${topPlayer.name || 'isimsiz'} için gizli görüşme başlattığı iddia edildi. Oyuncunun piyasası ₺${((topPlayer.market_value || 0) / 1000000).toFixed(1)}M seviyesinde.`,
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

export default function NewspaperTab() {
  const { profile, squad } = useFM();

  const articles = useMemo(() => generateArticles(profile, squad), [profile, squad]);

  const top5Teams = useMemo(() => {
    if (!profile) return FAKE_TEAMS_TOP5;
    // Insert user's team into the table at a random position
    const userTeam = {
      name: profile.team_name || 'Takımım',
      p: 34, w: 15, d: 8, l: 11, gf: 45, ga: 38, pts: 53,
      isUser: true,
    };
    const teams = [...FAKE_TEAMS_TOP5].map(t => ({ ...t, isUser: false }));
    teams.push(userTeam);
    teams.sort((a, b) => b.pts - a.pts);
    return teams.slice(0, 6);
  }, [profile]);

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

        {/* League Table Snippet */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center gap-2 px-1">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">
              Puan Durumu
            </h3>
            <div className="h-px flex-1 bg-white/5" />
          </div>

          <div className="bg-zinc-950 border border-white/5 rounded-2xl overflow-hidden">
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
                {top5Teams.map((team, i) => (
                  <tr
                    key={team.name}
                    className={`border-b border-white/5 ${team.isUser ? 'bg-amber-500/5' : 'hover:bg-white/[0.02]'} transition-colors`}
                  >
                    <td className={`py-2 px-3 font-mono font-bold ${i < 2 ? 'text-emerald-400' : i < 4 ? 'text-amber-400' : 'text-white/30'}`}>
                      {i + 1}
                    </td>
                    <td className={`py-2 px-1 font-bold truncate max-w-[80px] ${team.isUser ? 'text-amber-400' : 'text-white/70'}`}>
                      {team.name}
                    </td>
                    <td className="py-2 px-1 text-center text-white/30 font-mono">{team.p}</td>
                    <td className="py-2 px-1 text-center text-emerald-400/60 font-mono">{team.w}</td>
                    <td className="py-2 px-1 text-center text-white/30 font-mono">{team.d}</td>
                    <td className="py-2 px-1 text-center text-red-400/60 font-mono">{team.l}</td>
                    <td className="py-2 px-1 text-center text-white/30 font-mono">
                      {team.gf - team.ga > 0 ? '+' : ''}{team.gf - team.ga}
                    </td>
                    <td className="py-2 px-1 text-center font-black font-mono text-white/80">{team.pts}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="p-2 border-t border-white/5 flex items-center justify-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500/40" />
              <span className="text-[7px] text-white/15 font-bold uppercase">Şampiyonlar Ligi</span>
              <div className="w-2 h-2 rounded-full bg-amber-500/40 ml-2" />
              <span className="text-[7px] text-white/15 font-bold uppercase">AVrupa Ligi</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
