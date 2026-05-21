'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import {
  Calendar,
  Trophy,
  ArrowLeft,
  MapPin,
  ChevronRight,
  Clock,
  CircleDot,
  Loader2,
  AlertTriangle,
  Ban,
  Swords,
  Shield,
  Users,
  Circle,
  CloudSun,
  CloudRain,
  Wind,
  Thermometer,
  Handshake,
} from 'lucide-react';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import { toTitleCase } from '@/lib/fm/ui-helpers';

// ═══════════════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════════════

interface FixtureListItem {
  id: string;
  tur: number;
  match_date: string;
  match_time: string;
  status: string;
  home_score: number | null;
  away_score: number | null;
  home_team: string;
  away_team: string;
  home_team_id: string;
  away_team_id: string;
  is_home: boolean;
  is_friendly?: boolean;
  referee_name?: string | null;
  season_id?: string;
}

interface MatchEventRow {
  id: string;
  fixture_id: string;
  minute: number;
  event_type: string;
  player_name: string | null;
  team: string | null;
  detail: string | null;
}

type FormResult = 'W' | 'D' | 'L';
type FilterType = 'all' | 'upcoming' | 'past';

// ═══════════════════════════════════════════════════════════════════════
// Constants
// ═══════════════════════════════════════════════════════════════════════

const TURKISH_MONTHS: Record<number, string> = {
  1: 'OCAK',
  2: 'ŞUBAT',
  3: 'MART',
  4: 'NİSAN',
  5: 'MAYIS',
  6: 'HAZİRAN',
  7: 'TEMMUZ',
  8: 'AĞUSTOS',
  9: 'EYLÜL',
  10: 'EKİM',
  11: 'KASIM',
  12: 'ARALIK',
};

const STADIUM_NAMES: Record<string, string> = {
  'Anadolu Kartalı': 'Kartal Yuvası Stadyumu',
  'Bozkır Gücü': 'Bozkır Arenası',
  'Yıldız Spor': 'Yıldız Park Stadyumu',
  'Karadeniz Fırtınası': 'Fırtına Arenası',
  'Altın Şahin': 'Şahin Yuvası Stadyumu',
  'Çelik Kale': 'Çelik Stadyumu',
  'Akdeniz Yıldızı': 'Akdeniz Parkı',
  'Ateş Parıltısı': 'Ateş Arenası',
  'Orta Anadolu FK': 'Anadolu Stadyumu',
  'Yıldırım Spor': 'Yıldırım Parkı',
  'Erciyes Gücü': 'Erciyes Stadyumu',
  'Akdeniz Kılıcı': 'Kılıç Arenası',
  'Başkent Birlik': 'Başkent Stadyumu',
  'Marmara Gücü': 'Marmara Parkı',
  'Güney Rüzgarı': 'Rüzgar Stadyumu',
  'Doğu Yıldızı': 'Doğu Arenası',
  'Boğaz Kalesi': 'Kale Stadyumu',
  'Ege Fırtınası': 'Ege Parkı',
};

// ═══════════════════════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════════════════════

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
  } catch {
    return dateStr;
  }
}

function formatDateFull(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString('tr-TR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

function getMonthYear(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    const month = TURKISH_MONTHS[d.getMonth() + 1] || 'BİLİNMİYOR';
    return `${month} ${d.getFullYear()}`;
  } catch {
    return 'BİLİNMİYOR';
  }
}

function getUserResult(isHome: boolean, homeScore: number | null, awayScore: number | null): FormResult | null {
  if (homeScore === null || awayScore === null) return null;
  const myScore = isHome ? homeScore : awayScore;
  const oppScore = isHome ? awayScore : homeScore;
  if (myScore > oppScore) return 'W';
  if (myScore === oppScore) return 'D';
  return 'L';
}

function getCompetitionType(fixture: FixtureListItem): { label: string; icon: string; color: string } {
  if (fixture.is_friendly) {
    return { label: 'Hazırlık Maçı', icon: '🤝', color: 'text-green-400' };
  }
  if (fixture.tur >= 34) {
    return { label: 'Kupa Finali', icon: '🏆', color: 'text-yellow-300' };
  }
  if (fixture.tur >= 30) {
    return { label: 'Kupa Maçı', icon: '🏆', color: 'text-amber-400' };
  }
  return { label: 'Lig Maçı', icon: '⚽', color: 'text-white/60' };
}

function getStadiumName(teamName: string): string {
  return STADIUM_NAMES[teamName] || `${toTitleCase(teamName)} Stadyumu`;
}

function getShortTeamName(name: string): string {
  if (!name) return '???';
  const words = name.split(' ').filter(Boolean);
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return name.slice(0, 3).toUpperCase();
}

function isMatchFinished(fixture: FixtureListItem): boolean {
  return fixture.status === 'completed' || fixture.status === 'finished' || fixture.home_score !== null;
}

function isMatchLive(fixture: FixtureListItem): boolean {
  return fixture.status === 'live';
}

// ═══════════════════════════════════════════════════════════════════════
// Simüle Edilmiş Hava Durumu
// ═══════════════════════════════════════════════════════════════════════

type WeatherType = 'sunny' | 'rainy' | 'windy' | 'cloudy' | 'snowy';

interface SimulatedWeather {
  type: WeatherType;
  temperature: number;
  label: string;
  icon: React.ReactNode;
}

function simulateWeather(matchDate: string): SimulatedWeather {
  // Deterministic pseudo-random based on date
  const d = new Date(matchDate);
  const seed = d.getDate() * 31 + d.getMonth() * 7 + d.getFullYear();
  const roll = ((seed * 9301 + 49297) % 233280) / 233280;

  const month = d.getMonth() + 1; // 1-12

  // Season-based temperature & weather probability
  let baseTemp: number;
  if (month >= 6 && month <= 8) baseTemp = 28;      // Summer
  else if (month >= 12 || month <= 2) baseTemp = 5;  // Winter
  else if (month >= 3 && month <= 5) baseTemp = 15;  // Spring
  else baseTemp = 14;                                  // Autumn

  const tempVariance = Math.floor(roll * 12) - 6;
  const temperature = baseTemp + tempVariance;

  // Weather distribution
  if (roll < 0.40) {
    return { type: 'sunny', temperature, label: 'Güneşli', icon: <CloudSun size={16} className="text-amber-400" /> };
  } else if (roll < 0.60) {
    return { type: 'cloudy', temperature, label: 'Bulutlu', icon: <CloudSun size={16} className="text-white/40" /> };
  } else if (roll < 0.78) {
    return { type: 'rainy', temperature, label: 'Yağmurlu', icon: <CloudRain size={16} className="text-sky-400" /> };
  } else if (roll < 0.92) {
    return { type: 'windy', temperature, label: 'Rüzgarlı', icon: <Wind size={16} className="text-white/50" /> };
  } else {
    return { type: 'snowy', temperature: Math.min(temperature, 2), label: 'Karlı', icon: <CloudRain size={16} className="text-blue-300" /> };
  }
}

// ═══════════════════════════════════════════════════════════════════════
// Sakat/Cezalı Oyuncular Bileşeni
// ═══════════════════════════════════════════════════════════════════════

function InjuredSuspendedPlayers({ teamName }: { teamName: string }) {
  const [players, setPlayers] = useState<{ name: string; status: string; detail: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlayers = async () => {
      const supabase = getSupabase();
      if (!supabase || !teamName) { setLoading(false); return; }

      try {
        const { data, error } = await supabase
          .from('players')
          .select('name, is_injured, suspended_until, injury')
          .ilike('team_name', teamName)
          .or('is_injured.eq.true,suspended_until.not.is.null');

        if (!error && data) {
          const mapped = data
            .filter((p: any) => p.is_injured || p.suspended_until)
            .map((p: any) => ({
              name: p.name || 'Bilinmeyen',
              status: p.is_injured ? 'Sakat' : 'Cezalı',
              detail: p.is_injured
                ? (p.injury ? `${(p.injury as any)?.remaining_days || '?'} gün` : 'Sakat')
                : `Cezası var`,
            }));
          setPlayers(mapped);
        }
      } catch { /* silent */ }
      finally { setLoading(false); }
    };
    fetchPlayers();
  }, [teamName]);

  if (loading) return null;
  if (players.length === 0) return null;

  return (
    <div className="bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-2xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <AlertTriangle size={14} className="text-orange-400" />
        <span className="text-[10px] font-black uppercase tracking-widest text-white/50">Sakat / Cezalı</span>
        <span className="text-[9px] text-white/25 bg-white/5 px-1.5 py-0.5 rounded-full">{players.length}</span>
      </div>
      <div className="space-y-1.5">
        {players.slice(0, 6).map((p, i) => (
          <div key={i} className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg bg-white/[0.02] border border-white/[0.04]">
            <span className={`text-[8px] font-bold shrink-0 ${p.status === 'Sakat' ? 'text-orange-400' : 'text-red-400'}`}>
              {p.status === 'Sakat' ? '🏥' : '🟥'} {p.status}
            </span>
            <span className="text-[11px] font-semibold text-white/70 truncate flex-1">{toTitleCase(p.name)}</span>
            <span className="text-[9px] text-white/30 shrink-0">{p.detail}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// Sub-Components: Badges & Pills
// ═══════════════════════════════════════════════════════════════════════

function VenueBadge({ isHome }: { isHome: boolean }) {
  return (
    <span
      className={`px-1.5 py-0.5 text-[7px] font-black uppercase tracking-widest rounded ${
        isHome
          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
          : 'bg-sky-500/15 text-sky-400 border border-sky-500/30'
      }`}
    >
      {isHome ? 'EV' : 'DEP'}
    </span>
  );
}

function ResultPill({ result }: { result: FormResult | null }) {
  if (!result) return null;
  const config: Record<FormResult, { bg: string; text: string; label: string }> = {
    W: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', label: 'G' },
    D: { bg: 'bg-amber-500/20', text: 'text-amber-400', label: 'B' },
    L: { bg: 'bg-red-500/20', text: 'text-red-400', label: 'M' },
  };
  const c = config[result];
  return (
    <span className={`${c.bg} ${c.text} text-[9px] font-black px-1.5 py-0.5 rounded`}>
      {c.label}
    </span>
  );
}

function StatusBadge({ fixture }: { fixture: FixtureListItem }) {
  const finished = isMatchFinished(fixture);
  const live = isMatchLive(fixture);

  if (live) {
    return (
      <span className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-red-500/15 border border-red-500/30">
        <Circle size={6} className="text-red-400 fill-red-400 animate-pulse" />
        <span className="text-[8px] font-black text-red-400 uppercase">Canlı</span>
      </span>
    );
  }
  if (finished) {
    return (
      <span className="px-2 py-1 rounded-full bg-white/5 border border-white/10 text-[8px] font-bold text-white/40 uppercase">
        Bitti
      </span>
    );
  }
  return (
    <span className="px-2 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-[8px] font-bold text-amber-400 uppercase">
      Planlanmış
    </span>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// MonthGroupHeader — Ay gruplama başlığı
// ═══════════════════════════════════════════════════════════════════════

function MonthGroupHeader({ monthYear, count }: { monthYear: string; count: number }) {
  return (
    <div className="sticky top-0 z-10 backdrop-blur-md bg-[#0a0e17]/90 border-b border-white/[0.06] px-3 py-2 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Calendar size={12} className="text-amber-400/70" />
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-400/80">
          {monthYear}
        </span>
      </div>
      <span className="text-[9px] text-white/20 font-semibold">{count} maç</span>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// FixtureList — Sol panel, maç listesi
// ═══════════════════════════════════════════════════════════════════════

function FixtureListRow({
  match,
  teamName,
  isSelected,
  onSelect,
}: {
  match: FixtureListItem;
  teamName: string;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const finished = isMatchFinished(match);
  const live = isMatchLive(match);
  const isHomeTeam = match.is_home || match.home_team === teamName;
  const opponent = isHomeTeam ? match.away_team : match.home_team;
  const result = finished && (match.is_home || match.home_team === teamName || match.away_team === teamName)
    ? getUserResult(isHomeTeam, match.home_score, match.away_score)
    : null;

  return (
    <button
      onClick={onSelect}
      className={`w-full text-left px-3 py-2.5 rounded-xl border transition-all duration-200 hover:scale-[1.005] active:scale-[0.995] overflow-hidden ${
        isSelected
          ? 'border-amber-500/40 bg-amber-500/[0.07] shadow-[0_0_16px_rgba(245,158,11,0.06)]'
          : 'border-white/[0.04] bg-white/[0.015] hover:bg-white/[0.03] hover:border-white/10'
      }`}
    >
      <div className="flex items-center gap-3">
        {/* Date & Time */}
        <div className="flex flex-col items-center min-w-[40px] shrink-0">
          <span className="text-[10px] text-white/40 font-semibold">
            {formatDate(match.match_date)}
          </span>
          <span className="text-[9px] text-white/25 font-mono">
            {match.match_time || '--:--'}
          </span>
        </div>

        {/* Divider */}
        <div className="w-px h-8 bg-white/[0.06] shrink-0" />

        {/* Opponent + badges */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <VenueBadge isHome={match.is_home} />
            <span className="text-xs font-bold text-white/80 truncate">
              {toTitleCase(opponent)}
            </span>
          </div>
        </div>

        {/* Score / VS / Live */}
        <div className="flex items-center gap-2 shrink-0">
          {live && (
            <span className="flex items-center gap-1">
              <Circle size={4} className="text-red-500 fill-red-500 animate-pulse" />
              <span className="text-[8px] font-black text-red-400 uppercase">CANLI</span>
            </span>
          )}
          {finished ? (
            <span className={`text-sm font-black tabular-nums ${
              result === 'W' ? 'text-emerald-400' :
              result === 'D' ? 'text-amber-400' :
              result === 'L' ? 'text-red-400' : 'text-white/40'
            }`}>
              {match.home_score} - {match.away_score}
            </span>
          ) : !live ? (
            <span className="text-[10px] font-black text-amber-400/50 uppercase tracking-wider">
              VS
            </span>
          ) : null}
          {result && <ResultPill result={result} />}
        </div>
      </div>
    </button>
  );
}

function FixtureList({
  groupedFixtures,
  monthKeys,
  teamName,
  selectedFixtureId,
  onSelect,
}: {
  groupedFixtures: Map<string, FixtureListItem[]>;
  monthKeys: string[];
  teamName: string;
  selectedFixtureId: string | null;
  onSelect: (id: string) => void;
}) {
  if (monthKeys.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Calendar size={32} className="text-white/10 mb-3" />
        <p className="text-xs text-white/25 font-medium">Fikstür bulunamadı</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto custom-scrollbar">
      <div className="space-y-1">
        {monthKeys.map((monthKey) => {
          const matches = groupedFixtures.get(monthKey) || [];
          return (
            <div key={monthKey}>
              <MonthGroupHeader monthYear={monthKey} count={matches.length} />
              <div className="px-2 py-1.5 space-y-1">
                {matches.map((match) => (
                  <FixtureListRow
                    key={match.id}
                    match={match}
                    teamName={teamName}
                    isSelected={selectedFixtureId === match.id}
                    onSelect={() => onSelect(match.id)}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// MatchDetailsPanel — Sağ panel, seçilen maç detayı
// ═══════════════════════════════════════════════════════════════════════

function MatchEventIcon({ eventType }: { eventType: string }) {
  const type = eventType.toUpperCase();
  if (type === 'GOAL' || type === 'PENALTY_GOAL') return <CircleDot size={12} className="text-emerald-400" />;
  if (type === 'OWN_GOAL') return <CircleDot size={12} className="text-red-400" />;
  if (type === 'YELLOW_CARD' || type === 'SECOND_YELLOW') return <AlertTriangle size={12} className="text-yellow-400" />;
  if (type === 'RED_CARD') return <Ban size={12} className="text-red-500" />;
  if (type === 'SUBSTITUTION') return <Users size={12} className="text-sky-400" />;
  if (type === 'INJURY') return <AlertTriangle size={12} className="text-orange-400" />;
  return <CircleDot size={12} className="text-white/30" />;
}

function GoalSummary({ events, homeTeam, awayTeam }: { events: MatchEventRow[]; homeTeam: string; awayTeam: string }) {
  const goalEvents = events.filter(
    (e) => ['GOAL', 'PENALTY_GOAL', 'OWN_GOAL'].includes(e.event_type?.toUpperCase())
  );

  if (goalEvents.length === 0) return null;

  return (
    <div className="bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-2xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <CircleDot size={14} className="text-emerald-400" />
        <span className="text-[10px] font-black uppercase tracking-widest text-white/50">Goller</span>
      </div>
      <div className="space-y-1.5">
        {goalEvents.map((evt, i) => {
          const isOwn = evt.event_type?.toUpperCase() === 'OWN_GOAL';
          const isPenalty = evt.event_type?.toUpperCase() === 'PENALTY_GOAL';
          const teamLabel = evt.team?.toLowerCase() === 'home' ? homeTeam : awayTeam;
          const isHome = evt.team?.toLowerCase() === 'home';

          return (
            <div
              key={evt.id || i}
              className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg bg-white/[0.02] border border-white/[0.04]"
            >
              <MatchEventIcon eventType={evt.event_type} />
              <span className="text-[10px] text-white/30 font-mono shrink-0">{evt.minute}&apos;</span>
              <span className="text-[11px] font-semibold text-white/70 truncate flex-1">
                {evt.player_name ? toTitleCase(evt.player_name) : 'Bilinmiyor'}
                {isPenalty && <span className="text-amber-400/60 ml-1 text-[9px]">(Penaltı)</span>}
                {isOwn && <span className="text-red-400/60 ml-1 text-[9px]">(K.K.)</span>}
              </span>
              <span className={`text-[8px] font-bold shrink-0 ${
                isHome ? 'text-emerald-400/60' : 'text-sky-400/60'
              }`}>
                {getShortTeamName(teamLabel)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CardSummary({ events }: { events: MatchEventRow[] }) {
  const cardEvents = events.filter(
    (e) => ['YELLOW_CARD', 'SECOND_YELLOW', 'RED_CARD'].includes(e.event_type?.toUpperCase())
  );

  if (cardEvents.length === 0) return null;

  return (
    <div className="bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-2xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <Ban size={14} className="text-yellow-400" />
        <span className="text-[10px] font-black uppercase tracking-widest text-white/50">Kartlar</span>
        <span className="text-[9px] text-white/25 bg-white/5 px-1.5 py-0.5 rounded-full">{cardEvents.length}</span>
      </div>
      <div className="space-y-1.5">
        {cardEvents.map((evt, i) => {
          const isRed = evt.event_type?.toUpperCase() === 'RED_CARD';
          const isSecondYellow = evt.event_type?.toUpperCase() === 'SECOND_YELLOW';

          return (
            <div
              key={evt.id || i}
              className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg bg-white/[0.02] border border-white/[0.04]"
            >
              <MatchEventIcon eventType={evt.event_type} />
              <span className="text-[10px] text-white/30 font-mono shrink-0">{evt.minute}&apos;</span>
              <span className="text-[11px] font-semibold text-white/70 truncate flex-1">
                {evt.player_name ? toTitleCase(evt.player_name) : 'Bilinmiyor'}
              </span>
              <span className={`text-[8px] font-bold shrink-0 ${
                isRed ? 'text-red-400' : isSecondYellow ? 'text-orange-400' : 'text-yellow-400'
              }`}>
                {isRed ? 'Kırmızı' : isSecondYellow ? '2. Sarı' : 'Sarı'}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MatchNotPlayed() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-b from-amber-500/[0.04] to-transparent border border-amber-500/10 rounded-2xl p-6 text-center"
    >
      <div className="w-14 h-14 rounded-2xl bg-amber-500/[0.08] border border-amber-500/20 flex items-center justify-center mx-auto mb-4">
        <Clock size={24} className="text-amber-400/60" />
      </div>
      <p className="text-sm font-bold text-white/50 mb-1">Maç Henüz Oynanmadı</p>
      <p className="text-[11px] text-white/25 leading-relaxed">
        Bu maç planlanmış durumda. Maç başladığında canlı olarak takip edebilirsiniz.
      </p>
    </motion.div>
  );
}

function PreviousEncounters({
  fixture,
}: {
  fixture: FixtureListItem;
}) {
  const [matches, setMatches] = useState<{ id: string; match_date: string; home_team: string; away_team: string; home_score: number | null; away_score: number | null }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPrevious = async () => {
      const supabase = getSupabase();
      if (!supabase || !fixture.home_team_id || !fixture.away_team_id) {
        setLoading(false);
        return;
      }

      try {
        // İki takımın birlikte oynadığı maçları bul
        // Senaryo 1: home_team_id=A, away_team_id=B
        // Senaryo 2: home_team_id=B, away_team_id=A
        const { data, error } = await supabase
          .from('fixtures')
          .select('id, match_date, home_team_id, away_team_id, home_score, away_score, home:league_teams!home_team_id(name), away:league_teams!away_team_id(name)')
          .or(`and(home_team_id.eq.${fixture.home_team_id},away_team_id.eq.${fixture.away_team_id}),and(home_team_id.eq.${fixture.away_team_id},away_team_id.eq.${fixture.home_team_id})`)
          .order('match_date', { ascending: false })
          .limit(6);

        if (error) {
          console.error('PreviousEncounters error:', error.message);
          setMatches([]);
        } else {
          const filtered = (data || [])
            .filter((m: any) => m.id !== fixture.id)
            .slice(0, 5)
            .map((m: any) => ({
              id: m.id,
              match_date: m.match_date,
              home_team: m.home?.name || '?',
              away_team: m.away?.name || '?',
              home_score: m.home_score,
              away_score: m.away_score,
            }));
          setMatches(filtered);
        }
      } catch {
        setMatches([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPrevious();
  }, [fixture.home_team_id, fixture.away_team_id, fixture.id]);

  if (loading) {
    return (
      <div className="bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Swords size={14} className="text-amber-400" />
          <span className="text-[10px] font-black uppercase tracking-widest text-white/50">Önceki Karşılaşmalar</span>
        </div>
        <div className="flex items-center justify-center py-4">
          <Loader2 size={16} className="animate-spin text-white/20" />
        </div>
      </div>
    );
  }

  if (matches.length === 0) return null;

  return (
    <div className="bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-2xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <Swords size={14} className="text-amber-400" />
        <span className="text-[10px] font-black uppercase tracking-widest text-white/50">Önceki Karşılaşmalar</span>
        <span className="text-[9px] text-white/25 bg-white/5 px-1.5 py-0.5 rounded-full">{matches.length}</span>
      </div>
      <div className="space-y-1.5">
        {matches.map((m) => (
          <div
            key={m.id}
            className="flex items-center gap-3 px-2.5 py-2 rounded-lg bg-white/[0.02] border border-white/[0.04]"
          >
            <span className="text-[9px] text-white/25 min-w-[55px] shrink-0 font-mono">
              {formatDate(m.match_date)}
            </span>
            <div className="flex-1 flex items-center justify-between overflow-hidden">
              <span className="text-[11px] text-white/60 font-medium truncate">
                {toTitleCase(m.home_team)}
              </span>
              <span className="text-xs font-black text-white/70 tabular-nums px-2 shrink-0">
                {m.home_score !== null ? `${m.home_score} - ${m.away_score}` : '- - -'}
              </span>
              <span className="text-[11px] text-white/60 font-medium truncate text-right">
                {toTitleCase(m.away_team)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MatchDetailsPanel({
  fixture,
  teamName,
}: {
  fixture: FixtureListItem;
  teamName: string;
}) {
  const [events, setEvents] = useState<MatchEventRow[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [friendlyLoading, setFriendlyLoading] = useState(false);
  const finished = isMatchFinished(fixture);
  const live = isMatchLive(fixture);
  const competition = getCompetitionType(fixture);
  const stadium = getStadiumName(fixture.is_home ? fixture.home_team : fixture.away_team);
  const weather = useMemo(() => simulateWeather(fixture.match_date), [fixture.match_date]);

  // Fetch match events for finished/live matches
  useEffect(() => {
    const fetchEvents = async () => {
      if (!finished && !live) {
        setEventsLoading(false);
        return;
      }

      const supabase = getSupabase();
      if (!supabase) {
        setEventsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('match_events')
          .select('id, fixture_id, minute, event_type, player_name, team, detail')
          .eq('fixture_id', fixture.id)
          .order('minute', { ascending: true });

        if (!error && data) {
          setEvents(data as MatchEventRow[]);
        }
      } catch {
        // silent
      } finally {
        setEventsLoading(false);
      }
    };

    fetchEvents();
  }, [fixture.id, finished, live]);

  return (
    <motion.div
      key={fixture.id}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.25 }}
      className="space-y-4"
    >
      {/* ── Match Header Card ── */}
      <div className="bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-2xl p-5">
        {/* Competition & Status */}
        <div className="flex items-center justify-between mb-4">
          <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border bg-white/[0.03] ${competition.color} border-white/[0.08]`}>
            {competition.icon} {competition.label}
          </span>
          <StatusBadge fixture={fixture} />
        </div>

        {/* Teams & Score */}
        <div className="flex items-center justify-center gap-4 sm:gap-6 py-4">
          {/* Home Team */}
          <div className="flex flex-col items-center gap-2 min-w-0 flex-1">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-lg font-black ${
              fixture.home_team === teamName
                ? 'bg-gradient-to-br from-amber-500/30 to-amber-700/20 text-amber-300 border border-amber-500/40 shadow-[0_0_16px_rgba(245,158,11,0.12)]'
                : 'bg-white/[0.06] text-white/40 border border-white/10'
            }`}>
              {getShortTeamName(fixture.home_team)}
            </div>
            <span className={`text-[11px] font-bold text-center truncate max-w-[100px] ${
              fixture.home_team === teamName ? 'text-amber-300' : 'text-white/60'
            }`}>
              {toTitleCase(fixture.home_team)}
            </span>
            <VenueBadge isHome={true} />
          </div>

          {/* Score / VS / Live */}
          <div className="flex flex-col items-center gap-1 shrink-0">
            {fixture.home_score !== null ? (
              <span className="text-3xl font-black text-white/80 tabular-nums">
                {fixture.home_score} - {fixture.away_score}
              </span>
            ) : live ? (
              <div className="flex items-center gap-2">
                <Circle size={6} className="text-red-500 fill-red-500 animate-pulse" />
                <span className="text-sm font-black text-red-400 uppercase">CANLI</span>
              </div>
            ) : (
              <span className="text-2xl font-black text-amber-400/40">VS</span>
            )}
            <span className="text-[9px] text-white/25 font-mono">
              {fixture.match_time || '--:--'}
            </span>
          </div>

          {/* Away Team */}
          <div className="flex flex-col items-center gap-2 min-w-0 flex-1">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-lg font-black ${
              fixture.away_team === teamName
                ? 'bg-gradient-to-br from-amber-500/30 to-amber-700/20 text-amber-300 border border-amber-500/40 shadow-[0_0_16px_rgba(245,158,11,0.12)]'
                : 'bg-white/[0.06] text-white/40 border border-white/10'
            }`}>
              {getShortTeamName(fixture.away_team)}
            </div>
            <span className={`text-[11px] font-bold text-center truncate max-w-[100px] ${
              fixture.away_team === teamName ? 'text-amber-300' : 'text-white/60'
            }`}>
              {toTitleCase(fixture.away_team)}
            </span>
            <VenueBadge isHome={false} />
          </div>
        </div>

        {/* Match Info Row */}
        <div className="flex items-center justify-between pt-3 border-t border-white/[0.04]">
          <div className="flex items-center gap-2">
            <Calendar size={12} className="text-white/25" />
            <span className="text-[11px] text-white/40 font-medium">
              {formatDateFull(fixture.match_date)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin size={12} className="text-amber-400/60" />
            <span className="text-[11px] text-white/40 font-medium">{stadium}</span>
          </div>
        </div>

        {/* Referee */}
        {fixture.referee_name && (
          <div className="flex items-center gap-2 mt-2">
            <Shield size={12} className="text-white/20" />
            <span className="text-[10px] text-white/25">Hakem: {fixture.referee_name}</span>
          </div>
        )}

        {/* Hafta */}
        <div className="mt-2">
          <span className="text-[9px] text-white/15 font-mono">Hafta {fixture.tur}</span>
        </div>

        {/* ── Weather Card ── */}
        <div className="mt-3 pt-3 border-t border-white/[0.04]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {weather.icon}
              <span className="text-[11px] text-white/50 font-medium">{weather.label}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Thermometer size={12} className="text-white/25" />
              <span className="text-[11px] text-white/40 font-semibold">{weather.temperature}°C</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Match Not Played ── */}
      {!finished && !live && <MatchNotPlayed />}

      {/* ── Match Events (finished or live) ── */}
      {(finished || live) && eventsLoading && (
        <div className="bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-2xl p-4">
          <div className="flex items-center justify-center py-6">
            <Loader2 size={18} className="animate-spin text-white/20" />
            <span className="ml-2 text-[10px] text-white/30">Maç olayları yükleniyor...</span>
          </div>
        </div>
      )}

      {(finished || live) && !eventsLoading && events.length > 0 && (
        <>
          <GoalSummary events={events} homeTeam={fixture.home_team} awayTeam={fixture.away_team} />
          <CardSummary events={events} />
        </>
      )}

      {(finished || live) && !eventsLoading && events.length === 0 && (
        <div className="bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-2xl p-4 text-center">
          <p className="text-[11px] text-white/25">Bu maç için olay kaydı bulunamadı.</p>
        </div>
      )}

      {/* ── Previous Encounters ── */}
      <PreviousEncounters fixture={fixture} />

      {/* ── Injured/Suspended Players ── */}
      <InjuredSuspendedPlayers teamName={teamName} />

      {/* ── Friendly Match Button (only for scheduled matches) ── */}
      {!finished && !live && (
        <div className="pt-1">
          <button
            onClick={async () => {
              setFriendlyLoading(true);
              try {
                const { getSupabase: getSB, isSupabaseConfigured: isConfigured } = await import('@/lib/supabase');
                if (!isConfigured()) {
                  alert('Supabase yapılandırılmamış');
                  return;
                }
                const supabase = getSB();
                if (!supabase) return;

                const profileStr = localStorage.getItem('fm_profile');
                const profile = profileStr ? JSON.parse(profileStr) : null;
                if (!profile?.id) {
                  alert('Profil bulunamadı');
                  return;
                }

                const expiresAt = new Date(Date.now() + 300 * 1000).toISOString();
                const { error } = await supabase.from('friendly_queue').upsert({
                  user_id: profile.id,
                  team_name: profile.team_name || 'Bilinmeyen',
                  expires_at: expiresAt,
                  is_priority: false
                }, { onConflict: 'user_id' });

                if (error) {
                  console.error('[FixturePage] Friendly queue error:', error.message);
                  alert('Sıraya girilemedi: ' + error.message);
                } else {
                  alert('Hazırlık maçı sıraya eklendi! Eşleşme bulunduğunda bildirim alacaksınız.');
                }
              } catch (err) {
                console.error('[FixturePage] Friendly queue exception:', err);
                alert('Bir hata oluştu.');
              } finally {
                setFriendlyLoading(false);
              }
            }}
            disabled={friendlyLoading}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-emerald-500/10 to-emerald-600/10 border border-emerald-500/25 text-emerald-400 text-xs font-black uppercase tracking-widest hover:from-emerald-500/20 hover:to-emerald-600/20 transition-all active:scale-[0.98] disabled:opacity-30"
          >
            {friendlyLoading ? (
              <div className="w-4 h-4 border-2 border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin" />
            ) : (
              <Handshake size={14} />
            )}
            {friendlyLoading ? 'Ayarlanıyor...' : 'Hazırlık Maçı Ayarla'}
          </button>
        </div>
      )}

      {/* ── Go to Match Page Button ── */}
      {finished && (
        <div className="pt-1">
          <GoToMatchButton fixtureId={fixture.id} />
        </div>
      )}
    </motion.div>
  );
}

function GoToMatchButton({ fixtureId }: { fixtureId: string }) {
  const router = useRouter();
  return (
    <button
      onClick={() => router.push(`/match/${fixtureId}`)}
      className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-amber-500/10 to-amber-600/10 border border-amber-500/25 text-amber-400 text-xs font-black uppercase tracking-widest hover:from-amber-500/20 hover:to-amber-600/20 transition-all active:scale-[0.98]"
    >
      <Trophy size={14} />
      Maç Detayına Git
    </button>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-4">
        <ChevronRight size={24} className="text-white/10" />
      </div>
      <p className="text-sm text-white/25 font-medium">Bir maç seçin</p>
      <p className="text-[11px] text-white/15 mt-1">Detayları görüntülemek için soldaki listeden bir maç seçin</p>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// Main Component
// ═══════════════════════════════════════════════════════════════════════

export default function FixturePage() {
  const router = useRouter();
  const [fixtures, setFixtures] = useState<FixtureListItem[]>([]);
  const [teamName, setTeamName] = useState<string>('');
  const [profileId, setProfileId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterType>('all');
  const [selectedFixtureId, setSelectedFixtureId] = useState<string | null>(null);

  // ── Load data ──
  useEffect(() => {
    const loadData = async () => {
      try {
        const profileStr = localStorage.getItem('fm_profile');
        if (!profileStr) {
          setError('Profil bulunamadı. Lütfen giriş yapın.');
          setLoading(false);
          return;
        }
        const profile = JSON.parse(profileStr);
        const pId = profile.id;
        setTeamName(profile.team_name || '');
        setProfileId(pId);

        if (!isSupabaseConfigured()) {
          setError('Supabase yapılandırılmamış.');
          setLoading(false);
          return;
        }

        const res = await fetch(`/api/fixture/${pId}`);
        if (!res.ok) {
          setError('Fikstür yüklenirken hata oluştu.');
          setLoading(false);
          return;
        }
        const data = await res.json();

        const supabase = getSupabase();
        let enrichedFixtures = data.fixtures || [];

        if (supabase && enrichedFixtures.length > 0) {
          const teamNames = new Set<string>();
          enrichedFixtures.forEach((f: any) => {
            if (f.home_team) teamNames.add(f.home_team);
            if (f.away_team) teamNames.add(f.away_team);
          });

          const { data: teams } = await supabase
            .from('league_teams')
            .select('id, name')
            .in('name', Array.from(teamNames));

          const teamIdMap = new Map<string, string>();
          (teams || []).forEach((t: any) => {
            teamIdMap.set(t.name, t.id);
          });

          enrichedFixtures = enrichedFixtures.map((f: any) => ({
            ...f,
            home_team_id: f.home_team_id || teamIdMap.get(f.home_team) || '',
            away_team_id: f.away_team_id || teamIdMap.get(f.away_team) || '',
          }));
        }

        setFixtures(enrichedFixtures);
      } catch {
        setError('Bir hata oluştu.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // ── Group by month ──
  const groupedFixtures = useMemo(() => {
    const filtered = fixtures.filter((f) => {
      const finished = isMatchFinished(f);
      if (filter === 'upcoming') return !finished;
      if (filter === 'past') return finished;
      return true;
    });

    const groups = new Map<string, FixtureListItem[]>();
    for (const f of filtered) {
      const key = getMonthYear(f.match_date);
      const list = groups.get(key) ?? [];
      list.push(f);
      groups.set(key, list);
    }

    const sorted = new Map<string, FixtureListItem[]>();
    for (const [key, list] of groups) {
      sorted.set(key, [...list].sort((a, b) => a.match_date.localeCompare(b.match_date)));
    }

    return sorted;
  }, [fixtures, filter]);

  const monthKeys = useMemo(() => {
    return [...groupedFixtures.entries()]
      .sort((a, b) => {
        const dateA = a[1][0]?.match_date || '';
        const dateB = b[1][0]?.match_date || '';
        return dateA.localeCompare(dateB);
      })
      .map(([key]) => key);
  }, [groupedFixtures]);

  // ── Selected fixture ──
  const selectedFixture = useMemo(() => {
    if (!selectedFixtureId) return null;
    return fixtures.find((f) => f.id === selectedFixtureId) || null;
  }, [fixtures, selectedFixtureId]);

  // ── Auto-select first match on load ──
  useEffect(() => {
    if (fixtures.length > 0 && !selectedFixtureId) {
      const upcoming = fixtures.find(
        (f) => f.status === 'scheduled' && f.home_score === null
      );
      setSelectedFixtureId(upcoming?.id || fixtures[0]?.id || null);
    }
  }, [fixtures, selectedFixtureId]);

  const handleSelect = useCallback((id: string) => {
    setSelectedFixtureId(id);
  }, []);

  // ── Loading ──
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0e17] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-white/10 border-t-amber-500/40 rounded-full animate-spin" />
          <p className="text-white/30 text-xs font-bold uppercase tracking-widest">Fikstür Yükleniyor</p>
        </div>
      </div>
    );
  }

  // ── Error ──
  if (error) {
    return (
      <div className="min-h-screen bg-[#0a0e17] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center px-6">
          <p className="text-white/50 text-sm">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-2 bg-white/5 border border-white/10 rounded-lg text-xs font-bold uppercase tracking-widest text-white/50 hover:bg-white/10 transition-all"
          >
            Ana Sayfaya Dön
          </button>
        </div>
      </div>
    );
  }

  // ── Main Render ──
  return (
    <div className="min-h-screen bg-[#0a0e17] text-white flex flex-col overflow-x-hidden">
      {/* ── Top Bar ── */}
      <div className="sticky top-0 z-50 bg-[#0a0e17]/80 backdrop-blur-md border-b border-white/[0.06] px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-white/40 hover:text-white/70 transition-colors"
          >
            <ArrowLeft size={18} />
            <span className="text-xs font-bold uppercase tracking-widest">Geri</span>
          </button>
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-black uppercase tracking-wider text-white/70">Fikstür</span>
          </div>
          <div className="flex items-center gap-2 text-white/20">
            <Calendar size={14} />
            <span className="text-[10px] font-semibold">{fixtures.length} maç</span>
          </div>
        </div>
      </div>

      {/* ── Filter Tabs ── */}
      <div className="px-4 pt-4 max-w-7xl mx-auto w-full">
        <div className="flex gap-1 p-1 bg-white/[0.03] rounded-xl border border-white/[0.06]">
          {([
            { key: 'all' as FilterType, label: 'Tümü' },
            { key: 'upcoming' as FilterType, label: 'Gelen' },
            { key: 'past' as FilterType, label: 'Geçmiş' },
          ]).map(({ key, label }) => (
            <button
              key={key}
              onClick={() => { setFilter(key); setSelectedFixtureId(null); }}
              className={`flex-1 px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${
                filter === key
                  ? 'bg-amber-500/15 text-amber-300 shadow-md shadow-amber-500/5'
                  : 'text-white/30 hover:text-white/50 hover:bg-white/[0.03]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Main Content: Left List + Right Detail ── */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-4 pt-4 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-4 h-full">
          {/* Left Panel — Fixture List */}
          <div className="bg-white/[0.02] backdrop-blur-sm border border-white/[0.06] rounded-2xl overflow-hidden lg:max-h-[calc(100vh-180px)]">
            <FixtureList
              groupedFixtures={groupedFixtures}
              monthKeys={monthKeys}
              teamName={teamName}
              selectedFixtureId={selectedFixtureId}
              onSelect={handleSelect}
            />
          </div>

          {/* Right Panel — Match Details */}
          <div className="bg-white/[0.02] backdrop-blur-sm border border-white/[0.06] rounded-2xl p-4 overflow-y-auto lg:max-h-[calc(100vh-180px)] custom-scrollbar">
            <AnimatePresence mode="wait">
              {selectedFixture ? (
                <MatchDetailsPanel
                  key={selectedFixture.id}
                  fixture={selectedFixture}
                  teamName={teamName}
                />
              ) : (
                <EmptyState key="empty" />
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
