'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import {
  Clock,
  Trophy,
  ArrowLeft,
  Timer,
  CircleDot,
  Zap,
  Activity,
  Users,
  MessageSquare,
  Calendar,
  ChevronRight,
  Shield,
  Bot,
  Target,
} from 'lucide-react';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import MatchChat from '@/components/Chat/MatchChat';
import type { MatchEvent } from '@/lib/fm/types';

// Duygusal katman — animasyonlar, ses efektleri, heyecanlı anlatım
import { Confetti, GoalCelebration, RecordBreak } from '@/components/animations';
import { playSound, isSoundEnabled, setSoundEnabled } from '@/utils/sound';
import { emitEmotionalEvent, type EmotionalEvent } from '@/lib/fm/emotionalEvents';
import MatchCommentary from '@/components/match/MatchCommentary';

// ═══════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════

interface FixtureData {
  id: string;
  tur: number;
  match_date: string;
  match_time: string;
  status: string;
  home_score: number | null;
  away_score: number | null;
  home_team_id: string;
  away_team_id: string;
  home: { name: string; id: string; is_bot?: boolean; profile_id?: string } | null;
  away: { name: string; id: string; is_bot?: boolean; profile_id?: string } | null;
  season_id?: string;
  is_friendly?: boolean;
  is_quick_match?: boolean;
}

interface MatchEventRow {
  id: string;
  fixture_id: string;
  event_type: string;
  minute: number;
  player_name: string | null;
  team: string | null;
  detail: string | null;
  created_at: string;
}

interface PlayerStatRow {
  id: string;
  name: string;
  position: string;
  rating: number;
  goals: number;
  assists: number;
  yellow_cards: number;
  red_cards: number;
  team_name: string;
}

// ═══════════════════════════════════════════════════════════════
// Helper: Geri sayım hesaplama
// ═══════════════════════════════════════════════════════════════

interface CountdownResult {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isPast: boolean;
}

function calculateCountdown(targetDate: string, targetTime: string): CountdownResult {
  try {
    const dateStr = targetTime ? `${targetDate}T${targetTime}:00` : `${targetDate}T18:00:00`;
    const target = new Date(dateStr).getTime();
    const now = Date.now();
    const diff = target - now;

    if (diff <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true };
    }

    return {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((diff % (1000 * 60)) / 1000),
      isPast: false,
    };
  } catch {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true };
  }
}

// ═══════════════════════════════════════════════════════════════
// Helper: Event tipine göre ikon ve renk
// ═══════════════════════════════════════════════════════════════

function getEventStyle(eventType: string): { icon: string; colorClass: string; label: string } {
  switch (eventType) {
    case 'goal':
    case 'GOAL':
      return { icon: '⚽', colorClass: 'bg-yellow-500/15 border-yellow-500/30 text-yellow-200', label: 'GOL' };
    case 'penalty_goal':
      return { icon: '⚽', colorClass: 'bg-yellow-500/15 border-yellow-500/30 text-yellow-200', label: 'PENALTI GOLU' };
    case 'own_goal':
      return { icon: '⚽', colorClass: 'bg-red-500/15 border-red-500/30 text-red-200', label: 'KENDİ KALESİNE' };
    case 'yellow_card':
    case 'YELLOW':
      return { icon: '🟨', colorClass: 'bg-yellow-600/10 border-yellow-600/20 text-yellow-300', label: 'SARI KART' };
    case 'red_card':
    case 'RED':
      return { icon: '🟥', colorClass: 'bg-red-600/15 border-red-600/30 text-red-200', label: 'KIRMIZI KART' };
    case 'second_yellow':
      return { icon: '🟥', colorClass: 'bg-orange-500/15 border-orange-500/30 text-orange-200', label: '2. SARI → KIRMIZI' };
    case 'injury':
    case 'INJURY':
      return { icon: '🏥', colorClass: 'bg-red-500/10 border-red-500/20 text-red-300', label: 'SAKATLIK' };
    case 'substitution':
    case 'SUB':
      return { icon: '🔄', colorClass: 'bg-blue-500/10 border-blue-500/20 text-blue-300', label: 'DEĞİŞİKLİK' };
    case 'halftime':
    case 'HALFTIME':
      return { icon: '⏱️', colorClass: 'bg-white/5 border-white/10 text-white/60', label: 'DEVRE ARASI' };
    case 'fulltime':
    case 'FULLTIME':
      return { icon: '🏁', colorClass: 'bg-white/5 border-white/10 text-white/60', label: 'MAÇ SONU' };
    case 'save':
      return { icon: '🧤', colorClass: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300', label: 'KURTARIŞ' };
    case 'offside':
    case 'OFFSIDE':
      return { icon: '🚩', colorClass: 'bg-orange-500/10 border-orange-500/20 text-orange-300', label: 'OFSAYT' };
    case 'corner':
    case 'CORNER':
      return { icon: '🚩', colorClass: 'bg-cyan-500/10 border-cyan-500/20 text-cyan-300', label: 'KÖŞE VURUŞU' };
    default:
      return { icon: '📝', colorClass: 'bg-white/5 border-white/10 text-white/50', label: 'OLAY' };
  }
}

// ═══════════════════════════════════════════════════════════════
// Alt bileşen: Geri Sayım Sayacı
// ═══════════════════════════════════════════════════════════════

function CountdownTimer({ targetDate, targetTime }: { targetDate: string; targetTime: string }) {
  const [countdown, setCountdown] = useState<CountdownResult>(() =>
    calculateCountdown(targetDate, targetTime)
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(calculateCountdown(targetDate, targetTime));
    }, 1000);
    return () => clearInterval(interval);
  }, [targetDate, targetTime]);

  if (countdown.isPast) {
    return (
      <div className="text-center">
        <p className="text-amber-400 text-sm font-bold uppercase tracking-widest animate-pulse">
          Maç başlamak üzere!
        </p>
      </div>
    );
  }

  const blocks = [
    { value: countdown.days, label: 'Gün' },
    { value: countdown.hours, label: 'Saat' },
    { value: countdown.minutes, label: 'Dakika' },
    { value: countdown.seconds, label: 'Saniye' },
  ];

  return (
    <div className="flex items-center justify-center gap-3">
      {blocks.map((block, idx) => (
        <React.Fragment key={block.label}>
          {idx > 0 && <span className="text-white/20 text-lg font-black">:</span>}
          <div className="flex flex-col items-center">
            <div className="bg-white/[0.06] border border-white/10 rounded-lg px-3 py-2 min-w-[52px] text-center">
              <span className="text-xl font-black text-white tabular-nums">
                {String(block.value).padStart(2, '0')}
              </span>
            </div>
            <span className="text-[8px] font-bold uppercase tracking-widest text-white/25 mt-1">
              {block.label}
            </span>
          </div>
        </React.Fragment>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Alt bileşen: Skor Tablosu
// ═══════════════════════════════════════════════════════════════

function ScoreBoard({
  homeName,
  awayName,
  homeScore,
  awayScore,
  status,
  minute,
}: {
  homeName: string;
  awayName: string;
  homeScore: number | null;
  awayScore: number | null;
  status: string;
  minute?: number;
}) {
  const isLive = status === 'live';

  return (
    <div className="bg-gradient-to-b from-zinc-900/90 to-black/90 border border-white/10 rounded-2xl p-6 md:p-8 text-center">
      {/* Canlı etiketi */}
      {isLive && (
        <div className="flex items-center justify-center gap-2 mb-4">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-red-400 text-[10px] font-black uppercase tracking-widest">CANLI</span>
          {minute != null && (
            <span className="text-white/40 text-xs font-bold ml-2">{minute}&apos;</span>
          )}
        </div>
      )}

      {/* Takımlar ve skor */}
      <div className="flex items-center justify-center gap-6 md:gap-12">
        {/* Ev sahibi */}
        <div className="flex flex-col items-center gap-2 min-w-[100px]">
          <div className="w-14 h-14 rounded-xl bg-white/[0.06] border border-white/10 flex items-center justify-center">
            <span className="text-lg font-black text-white/80">
              {homeName.slice(0, 2).toUpperCase()}
            </span>
          </div>
          <span className="text-xs font-bold text-white/70 uppercase tracking-wider truncate max-w-[120px]">
            {homeName}
          </span>
        </div>

        {/* Skor */}
        <div className="flex items-center gap-4">
          <span className={`text-5xl md:text-7xl font-black tabular-nums ${isLive ? 'text-white' : 'text-white/80'}`}>
            {homeScore ?? '-'}
          </span>
          <span className="text-xl md:text-3xl font-black text-white/15">:</span>
          <span className={`text-5xl md:text-7xl font-black tabular-nums ${isLive ? 'text-white' : 'text-white/80'}`}>
            {awayScore ?? '-'}
          </span>
        </div>

        {/* Deplasman */}
        <div className="flex flex-col items-center gap-2 min-w-[100px]">
          <div className="w-14 h-14 rounded-xl bg-white/[0.06] border border-white/10 flex items-center justify-center">
            <span className="text-lg font-black text-white/80">
              {awayName.slice(0, 2).toUpperCase()}
            </span>
          </div>
          <span className="text-xs font-bold text-white/70 uppercase tracking-wider truncate max-w-[120px]">
            {awayName}
          </span>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Alt bileşen: Olay Listesi
// ═══════════════════════════════════════════════════════════════

function EventList({ events }: { events: MatchEventRow[] }) {
  if (events.length === 0) {
    return (
      <div className="text-center py-8">
        <Activity className="w-8 h-8 text-white/10 mx-auto mb-3" />
        <p className="text-xs text-white/25">Henüz olay kaydedilmedi</p>
      </div>
    );
  }

  // Dakikaya göre sırala
  const sorted = [...events].sort((a, b) => (a.minute || 0) - (b.minute || 0));

  return (
    <div className="space-y-2">
      {sorted.map((event, idx) => {
        const style = getEventStyle(event.event_type);
        return (
          <motion.div
            key={event.id || idx}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.03 }}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${style.colorClass}`}
          >
            {/* Dakika */}
            <div className="w-10 text-center flex-shrink-0">
              <span className="text-xs font-black tabular-nums">{event.minute}&apos;</span>
            </div>

            {/* İkon */}
            <span className="text-base flex-shrink-0">{style.icon}</span>

            {/* İçerik */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-black uppercase tracking-widest opacity-60">
                  {style.label}
                </span>
                {event.team && (
                  <span className={`text-[8px] font-bold uppercase px-1.5 py-0.5 rounded ${
                    event.team === 'home' || event.team === 'HOME'
                      ? 'bg-white/10 text-white/50'
                      : 'bg-yellow-500/10 text-yellow-400/70'
                  }`}>
                    {event.team === 'home' || event.team === 'HOME' ? 'EV' : 'DEP'}
                  </span>
                )}
              </div>
              <p className="text-xs font-semibold mt-0.5 truncate">
                {event.player_name || event.detail || style.label}
              </p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Alt bileşen: Oyuncu İstatistik Tablosu (Bitmiş maç için)
// ═══════════════════════════════════════════════════════════════

function PlayerStatsTable({
  players,
  teamName,
  label,
}: {
  players: PlayerStatRow[];
  teamName: string;
  label: string;
}) {
  if (players.length === 0) return null;

  // Gol, asist, kart öncelikli sıralama
  const sorted = [...players].sort((a, b) => {
    if (b.goals !== a.goals) return b.goals - a.goals;
    if (b.assists !== a.assists) return b.assists - a.assists;
    return b.rating - a.rating;
  });

  return (
    <div className="rounded-xl border border-white/[0.06] overflow-hidden">
      <div className="px-4 py-3 bg-white/[0.02] border-b border-white/[0.06] flex items-center gap-2">
        <div className="w-6 h-6 rounded-md bg-white/[0.06] flex items-center justify-center">
          <span className="text-[8px] font-black text-white/50">
            {teamName.slice(0, 2).toUpperCase()}
          </span>
        </div>
        <span className="text-[10px] font-black uppercase tracking-widest text-white/40">
          {label} — {teamName}
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[400px]">
          <thead>
            <tr className="border-b border-white/[0.04]">
              <th className="text-left px-3 py-2 text-[8px] font-bold uppercase tracking-widest text-white/25">
                Oyuncu
              </th>
              <th className="text-center px-2 py-2 text-[8px] font-bold uppercase tracking-widest text-white/25 w-10">
                Poz
              </th>
              <th className="text-center px-2 py-2 text-[8px] font-bold uppercase tracking-widest text-white/25 w-10">
                OVR
              </th>
              <th className="text-center px-2 py-2 text-[8px] font-bold uppercase tracking-widest text-yellow-400/50 w-8">
                G
              </th>
              <th className="text-center px-2 py-2 text-[8px] font-bold uppercase tracking-widest text-blue-400/50 w-8">
                A
              </th>
              <th className="text-center px-2 py-2 text-[8px] font-bold uppercase tracking-widest text-yellow-500/50 w-8">
                SK
              </th>
              <th className="text-center px-2 py-2 text-[8px] font-bold uppercase tracking-widest text-red-500/50 w-8">
                KK
              </th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((player, idx) => (
              <tr
                key={player.id || idx}
                className="border-b border-white/[0.02] hover:bg-white/[0.02] transition-colors"
              >
                <td className="px-3 py-2 text-[11px] font-semibold text-white/70 truncate max-w-[150px]">
                  {player.name}
                </td>
                <td className="text-center px-2 py-2 text-[10px] font-bold text-white/30">
                  {player.position}
                </td>
                <td className="text-center px-2 py-2 text-[11px] font-black text-white/50">
                  {player.rating}
                </td>
                <td className="text-center px-2 py-2">
                  {player.goals > 0 ? (
                    <span className="text-[11px] font-black text-yellow-400">{player.goals}</span>
                  ) : (
                    <span className="text-[10px] text-white/15">-</span>
                  )}
                </td>
                <td className="text-center px-2 py-2">
                  {player.assists > 0 ? (
                    <span className="text-[11px] font-black text-blue-400">{player.assists}</span>
                  ) : (
                    <span className="text-[10px] text-white/15">-</span>
                  )}
                </td>
                <td className="text-center px-2 py-2">
                  {player.yellow_cards > 0 ? (
                    <span className="text-[11px] font-bold text-yellow-500">{player.yellow_cards}</span>
                  ) : (
                    <span className="text-[10px] text-white/15">-</span>
                  )}
                </td>
                <td className="text-center px-2 py-2">
                  {player.red_cards > 0 ? (
                    <span className="text-[11px] font-bold text-red-500">{player.red_cards}</span>
                  ) : (
                    <span className="text-[10px] text-white/15">-</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// ANA SAYFA BİLEŞENİ
// ═══════════════════════════════════════════════════════════════

export default function MatchPage() {
  const params = useParams();
  const router = useRouter();
  const fixtureId = params.id as string;

  const [fixture, setFixture] = useState<FixtureData | null>(null);
  const [events, setEvents] = useState<MatchEventRow[]>([]);
  const [homePlayers, setHomePlayers] = useState<PlayerStatRow[]>([]);
  const [awayPlayers, setAwayPlayers] = useState<PlayerStatRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'events' | 'stats' | 'chat'>('events');
  const [profileId, setProfileId] = useState<string>('');
  const [teamName, setTeamName] = useState<string>('');

  // ── Taktik seçimi (maç öncesi) ──
  const [selectedFormation, setSelectedFormation] = useState<string>('4-4-2');
  const [selectedTactic, setSelectedTactic] = useState<string>('normal');

  const FORMATIONS = ['4-4-2', '4-3-3', '3-5-2', '4-5-1', '4-2-3-1', '5-3-2', '3-4-3'];
  const TACTICS: { id: string; label: string; desc: string; goalMod: number }[] = [
    { id: 'normal', label: 'Normal', desc: 'Dengeli oyun', goalMod: 0 },
    { id: 'attack', label: 'Hücum', desc: 'Gol ihtimali +%10', goalMod: 0.1 },
    { id: 'defense', label: 'Defans', desc: 'Gol yeme ihtimali -%10', goalMod: -0.05 },
    { id: 'counter', label: 'Kontra Atak', desc: 'Gol ihtimali +%5, kontra şansı', goalMod: 0.05 },
    { id: 'press', label: 'Pres', desc: 'Top kazanma +%8, kondisyon -%5', goalMod: 0.03 },
  ];

  // Duygusal katman — gol kutlama state
  const [goalCelebrationTrigger, setGoalCelebrationTrigger] = useState(false);
  const [goalScorer, setGoalScorer] = useState<string | undefined>();
  const [goalMinute, setGoalMinute] = useState<number | undefined>();
  const [prevEventsLength, setPrevEventsLength] = useState(0);

  // Kullanıcı profil bilgilerini yükle
  useEffect(() => {
    try {
      const stored = localStorage.getItem('fm_auth_email');
      if (stored) {
        setProfileId(stored);
      }
      const profileStr = localStorage.getItem('fm_profile');
      if (profileStr) {
        const parsed = JSON.parse(profileStr);
        setTeamName(parsed.team_name || '');
        if (parsed.id) setProfileId(parsed.id);
      }
    } catch (err) {
      console.error('[MatchPage] Profil yükleme hatası:', err);
    }
  }, []);

  // Fikstür verisini yükle
  const loadFixture = useCallback(async () => {
    if (!fixtureId) return;

    setLoading(true);
    setError(null);

    try {
      const supabase = getSupabase();
      if (!supabase || !isSupabaseConfigured()) {
        setError('Supabase bağlantısı yapılandırılmamış.');
        setLoading(false);
        return;
      }

      // Fikstürü çek (home/away join ile — is_bot dahil)
      const { data: fixtureData, error: fixtureError } = await supabase
        .from('fixtures')
        .select(`
          id,
          tur,
          match_date,
          match_time,
          status,
          home_score,
          away_score,
          home_team_id,
          away_team_id,
          season_id,
          home:league_teams!home_team_id (name, id, is_bot, profile_id),
          away:league_teams!away_team_id (name, id, is_bot, profile_id)
        `)
        .eq('id', fixtureId)
        .single();

      if (fixtureError || !fixtureData) {
        setError('Maç bulunamadı.');
        setLoading(false);
        return;
      }

      setFixture(fixtureData as unknown as FixtureData);

      // Maç olaylarını çek
      const { data: eventsData } = await supabase
        .from('match_events')
        .select('*')
        .eq('fixture_id', fixtureId)
        .order('minute', { ascending: true });

      if (eventsData && eventsData.length > 0) {
        setEvents(eventsData as MatchEventRow[]);
      }

      // Bitmiş maç için oyuncu istatistiklerini çek
      const homeName = (fixtureData as any).home?.name || '';
      const awayName = (fixtureData as any).away?.name || '';

      if (fixtureData.status === 'completed' || fixtureData.status === 'finished') {
        const { data: homePData } = await supabase
          .from('players')
          .select('id, name, position, rating, goals, assists, yellow_cards, red_cards, team_name')
          .eq('team_name', homeName)
          .limit(20);

        const { data: awayPData } = await supabase
          .from('players')
          .select('id, name, position, rating, goals, assists, yellow_cards, red_cards, team_name')
          .eq('team_name', awayName)
          .limit(20);

        if (homePData) setHomePlayers(homePData as PlayerStatRow[]);
        if (awayPData) setAwayPlayers(awayPData as PlayerStatRow[]);
      }
    } catch (err) {
      console.error('[MatchPage] Veri yükleme hatası:', err);
      setError('Maç verisi yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  }, [fixtureId]);

  useEffect(() => {
    loadFixture();
  }, [loadFixture]);

  // Canlı maç için Realtime aboneliği (olay güncellemeleri)
  useEffect(() => {
    if (!fixtureId || !fixture || fixture.status !== 'live') return;

    const supabase = getSupabase();
    if (!supabase) return;

    const channel = supabase
      .channel(`match_events:${fixtureId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'match_events',
          filter: `fixture_id=eq.${fixtureId}`,
        },
        (payload: any) => {
          setEvents(prev => [...prev, payload.new as MatchEventRow]);
        }
      )
      .subscribe();

    // Fikstür durumu değişikliğini de dinle (live → completed)
    const fixtureChannel = supabase
      .channel(`fixture_status:${fixtureId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'fixtures',
          filter: `id=eq.${fixtureId}`,
        },
        (payload: any) => {
          if (payload.new) {
            setFixture(prev => prev ? { ...prev, ...payload.new } : prev);
          }
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
      fixtureChannel.unsubscribe();
    };
  }, [fixtureId, fixture?.status]);

  // Periyodik yenileme (canlı maçlar için 30 saniyede bir)
  useEffect(() => {
    if (!fixture || fixture.status !== 'live') return;
    const interval = setInterval(() => {
      loadFixture();
    }, 30000);
    return () => clearInterval(interval);
  }, [fixture?.status, loadFixture]);

  // ─── Duygusal katman: Canlı maçta gol kutlama ─────────────────
  useEffect(() => {
    if (fixture?.status !== 'live') return;
    if (events.length <= prevEventsLength) {
      setPrevEventsLength(events.length);
      return;
    }

    // Yeni olayları bul (sadece eklenenler)
    const newEvents = events.slice(prevEventsLength);
    setPrevEventsLength(events.length);

    for (const event of newEvents) {
      const evtType = event.event_type?.toUpperCase();

      // Gol kutlama animasyonu ve ses efekti
      if (evtType === 'GOAL' || evtType === 'PENALTY_GOAL') {
        setGoalScorer(event.player_name || undefined);
        setGoalMinute(event.minute);
        setGoalCelebrationTrigger(true);
        playSound('goal');
        setTimeout(() => setGoalCelebrationTrigger(false), 2600);

        // Son dakika golü duygusal olayı
        if (event.minute >= 85) {
          const currentHomeName = fixture?.home?.name || 'Ev Sahibi';
          try {
            emitEmotionalEvent({
              type: 'LATE_WINNER',
              severity: 'legendary',
              title: 'SON DAKİKA GOLÜ!',
              description: `${event.player_name || 'Bilinmeyen'}, ${event.minute}. dakikada golü attı! Tribünler çıldırdı!`,
              icon: '🔥',
              player: event.player_name || undefined,
              teamName: currentHomeName,
              timestamp: Date.now(),
            });
          } catch (err) {
            console.error('[MatchPage] emitEmotionalEvent error:', err);
          }
        }
      }

      // Kart ses efekti
      if (evtType === 'YELLOW_CARD' || evtType === 'RED_CARD') {
        playSound('card');
      }

      // Maç sonu düdük sesi
      if (evtType === 'FULLTIME') {
        playSound('whistle');
        const currentHomeName = fixture?.home?.name || 'Ev Sahibi';
        const currentAwayName = fixture?.away?.name || 'Deplasman';
        try {
          emitEmotionalEvent({
            type: 'CHAMPION',
            severity: 'legendary',
            title: 'MAÇ BİTTİ!',
            description: `${currentHomeName} vs ${currentAwayName} maç sona erdi!`,
            icon: '🏁',
            teamName,
            timestamp: Date.now(),
          });
        } catch (err) {
          console.error('[MatchPage] emitEmotionalEvent error:', err);
        }
      }

      // Devre arası düdük
      if (evtType === 'HALFTIME') {
        playSound('whistle');
      }
    }
  }, [events.length, fixture?.status, prevEventsLength, fixture?.home?.name, fixture?.away?.name, teamName]);

  // ═══ Hesaplanan değerler ═══

  const homeName = useMemo(() => fixture?.home?.name || 'Ev Sahibi', [fixture]);
  const awayName = useMemo(() => fixture?.away?.name || 'Deplasman', [fixture]);
  const matchStatus = useMemo(() => fixture?.status || 'scheduled', [fixture]);

  // Bot maçı tespiti — rakip bot takım mı?
  const isBotMatch = useMemo(() => {
    if (!fixture) return false;
    const homeIsBot = fixture.home?.is_bot === true;
    const awayIsBot = fixture.away?.is_bot === true;
    // Kullanıcının takımı olmayan taraf bot mu?
    // Eğer her iki takımdan biri bot ise
    return homeIsBot || awayIsBot;
  }, [fixture]);

  const isFriendlyOrQuick = useMemo(() => {
    return fixture?.is_friendly === true || fixture?.is_quick_match === true;
  }, [fixture]);

  // ═══ Yükleniyor ═══

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-white/10 border-t-white/40 rounded-full animate-spin" />
          <p className="text-white/30 text-xs font-bold uppercase tracking-widest">Maç Yükleniyor</p>
        </div>
      </div>
    );
  }

  // ═══ Hata ═══

  if (error || !fixture) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center px-6">
          <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
            <Activity className="w-8 h-8 text-red-400" />
          </div>
          <p className="text-white/50 text-sm">{error || 'Maç verisi bulunamadı.'}</p>
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

  // ═══ ANA RENDER ═══

  const isScheduled = matchStatus === 'scheduled';
  const isLive = matchStatus === 'live';
  const isFinished = matchStatus === 'completed' || matchStatus === 'finished';

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Duygusal katman — global animasyonlar */}
      <Confetti autoListen />
      <GoalCelebration trigger={goalCelebrationTrigger} scorer={goalScorer} minute={goalMinute} />
      <RecordBreak autoListen />

      {/* Ses açma/kapama butonu */}
      <button
        onClick={() => {
          try {
            const newState = !isSoundEnabled();
            setSoundEnabled(newState);
            if (newState) playSound('click');
          } catch (err) {
            console.error('[MatchPage] Sound toggle error:', err);
          }
        }}
        className="fixed bottom-4 right-4 z-50 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-zinc-900/90 text-sm backdrop-blur-sm transition-all hover:bg-zinc-800"
        title={isSoundEnabled() ? 'Sesi Kapat' : 'Sesi Aç'}
      >
        {isSoundEnabled() ? '🔊' : '🔇'}
      </button>

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

          <div className="flex items-center gap-3">
            {fixture.tur && (
              <span className="text-[9px] font-bold uppercase tracking-widest text-white/25">
                Hafta {fixture.tur}
              </span>
            )}
            {isLive && (
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-red-500/15 border border-red-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                <span className="text-[9px] font-black text-red-400 uppercase">Canlı</span>
              </div>
            )}
            {isFinished && (
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-white/5 border border-white/10">
                <span className="text-[9px] font-bold text-white/40 uppercase">Bitti</span>
              </div>
            )}
            {isScheduled && (
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-amber-500/10 border border-amber-500/20">
                <Clock size={10} className="text-amber-400" />
                <span className="text-[9px] font-bold text-amber-400 uppercase">Planlanmış</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 text-white/20">
            <Calendar size={14} />
            <span className="text-[10px] font-semibold">
              {fixture.match_date && new Date(fixture.match_date).toLocaleDateString('tr-TR', {
                day: 'numeric',
                month: 'short',
              })}
              {fixture.match_time ? ` ${fixture.match_time}` : ''}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* ═══ Skor Tablosu ═══ */}
        <ScoreBoard
          homeName={homeName}
          awayName={awayName}
          homeScore={fixture.home_score}
          awayScore={fixture.away_score}
          status={matchStatus}
        />

        {/* ═══ Planlanmış Maç: Geri Sayım ═══ */}
        {isScheduled && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-b from-amber-500/[0.04] to-transparent border border-amber-500/10 rounded-2xl p-6 text-center space-y-4"
          >
            {/* ── Bot Maçı Uyarısı ── */}
            {(isBotMatch || isFriendlyOrQuick) && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-blue-500/[0.08] border border-blue-500/20 rounded-xl p-4 flex items-center gap-3 text-left"
              >
                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center shrink-0">
                  <Bot size={20} className="text-blue-400" />
                </div>
                <div>
                  <p className="text-xs font-black text-blue-300 uppercase tracking-wider">
                    {isBotMatch ? 'Bu maç bot takıma karşı oynanmaktadır' : 'Hazırlık maçı'}
                  </p>
                  <p className="text-[10px] text-blue-400/50 mt-0.5">
                    {isBotMatch
                      ? 'Rakip takım yapay zeka tarafından yönetilmektedir.'
                      : 'Bu maç resmi lig müsabakası değildir.'}
                  </p>
                </div>
              </motion.div>
            )}

            <div className="flex items-center justify-center gap-2 mb-2">
              <Timer className="w-5 h-5 text-amber-400" />
              <span className="text-amber-400 text-xs font-black uppercase tracking-widest">
                Maça Kalan Süre
              </span>
            </div>

            <CountdownTimer targetDate={fixture.match_date} targetTime={fixture.match_time} />

            {/* ── Taktik Ekranı ── */}
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-zinc-900/80 border border-white/[0.06] rounded-xl p-5 text-left space-y-4"
            >
              <div className="flex items-center gap-2 mb-1">
                <Shield size={14} className="text-amber-400" />
                <span className="text-[9px] font-black uppercase tracking-widest text-white/30">Maç Öncesi Taktik</span>
              </div>

              {/* Formasyon Seçici */}
              <div>
                <label className="text-[8px] font-black uppercase tracking-widest text-white/25 block mb-2">Formasyon</label>
                <div className="flex flex-wrap gap-2">
                  {FORMATIONS.map(f => (
                    <button
                      key={f}
                      onClick={() => setSelectedFormation(f)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
                        selectedFormation === f
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-[0_0_10px_rgba(245,158,11,0.15)]'
                          : 'bg-white/[0.03] text-white/30 border border-white/[0.06] hover:bg-white/[0.06] hover:text-white/50'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              {/* Taktik Seçici */}
              <div>
                <label className="text-[8px] font-black uppercase tracking-widest text-white/25 block mb-2">Taktik</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {TACTICS.map(t => (
                    <button
                      key={t.id}
                      onClick={() => setSelectedTactic(t.id)}
                      className={`px-3 py-2.5 rounded-lg text-left transition-all ${
                        selectedTactic === t.id
                          ? 'bg-amber-500/15 border border-amber-500/25'
                          : 'bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04]'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <Target size={10} className={selectedTactic === t.id ? 'text-amber-400' : 'text-white/20'} />
                        <span className={`text-[10px] font-black uppercase tracking-wider ${
                          selectedTactic === t.id ? 'text-amber-300' : 'text-white/40'
                        }`}>
                          {t.label}
                        </span>
                      </div>
                      <p className={`text-[8px] mt-1 ${selectedTactic === t.id ? 'text-amber-400/50' : 'text-white/20'}`}>
                        {t.desc}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Seçilen taktik özeti */}
              <div className="flex items-center gap-3 px-3 py-2 bg-white/[0.02] rounded-lg border border-white/[0.04]">
                <span className="text-[8px] font-black uppercase tracking-widest text-white/20">Seçilen:</span>
                <span className="text-[10px] font-bold text-amber-400">{selectedFormation}</span>
                <span className="text-white/10">|</span>
                <span className="text-[10px] font-bold text-amber-400">{TACTICS.find(t => t.id === selectedTactic)?.label}</span>
                {selectedTactic !== 'normal' && (
                  <>
                    <span className="text-white/10">|</span>
                    <span className="text-[9px] text-emerald-400/60">
                      Gol mod: {TACTICS.find(t => t.id === selectedTactic)?.goalMod > 0 ? '+' : ''}{((TACTICS.find(t => t.id === selectedTactic)?.goalMod || 0) * 100).toFixed(0)}%
                    </span>
                  </>
                )}
              </div>
            </motion.div>

            <div className="pt-4">
              <p className="text-white/30 text-xs italic">
                Maç henüz başlamadı. Sayıç sıfırlandığında maç canlı olarak burada yayınlanacak.
              </p>
            </div>

            {/* Maç ön bilgisi */}
            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="bg-white/[0.02] border border-white/[0.04] rounded-xl p-4 text-center">
                <p className="text-[8px] font-black uppercase tracking-widest text-white/20 mb-2">EV SAHİBİ</p>
                <p className="text-sm font-bold text-white/70">{homeName}</p>
                {fixture.home?.is_bot && (
                  <span className="inline-flex items-center gap-1 mt-1 text-[8px] text-blue-400/50 uppercase font-bold">
                    <Bot size={8} /> Bot
                  </span>
                )}
              </div>
              <div className="bg-white/[0.02] border border-white/[0.04] rounded-xl p-4 text-center">
                <p className="text-[8px] font-black uppercase tracking-widest text-white/20 mb-2">DEPLASMAN</p>
                <p className="text-sm font-bold text-white/70">{awayName}</p>
                {fixture.away?.is_bot && (
                  <span className="inline-flex items-center gap-1 mt-1 text-[8px] text-blue-400/50 uppercase font-bold">
                    <Bot size={8} /> Bot
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* ═══ Canlı Maç / Bitmiş Maç: Olaylar ve İstatistikler ═══ */}
        {(isLive || isFinished) && (
          <>
            {/* Sekme Geçişi */}
            <div className="flex gap-1 p-1 bg-white/[0.02] rounded-xl border border-white/[0.06]">
              {[
                { id: 'events' as const, label: 'Olaylar', icon: <CircleDot size={14} /> },
                { id: 'stats' as const, label: 'İstatistikler', icon: <Users size={14} /> },
                { id: 'chat' as const, label: 'Sohbet', icon: <MessageSquare size={14} /> },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-[11px] font-bold uppercase tracking-widest transition-all ${
                    activeTab === tab.id
                      ? 'bg-amber-500/15 text-amber-300 shadow-md shadow-amber-500/5'
                      : 'text-white/25 hover:text-white/40 hover:bg-white/[0.02]'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Sekme İçeriği */}
            <AnimatePresence mode="wait">
              {activeTab === 'events' && (
                <motion.div
                  key="events"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="space-y-3"
                >
                  <div className="flex items-center gap-2 px-1 mb-2">
                    <Zap size={14} className="text-amber-400" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/30">
                      Maç Anlatımı
                    </span>
                    <span className="text-[9px] text-white/15">({events.length} olay)</span>
                  </div>
                  {events.length > 0 ? (
                    <MatchCommentary
                      events={events.map((e): MatchEvent => ({
                        minute: e.minute,
                        type: (e.event_type?.toUpperCase() === 'PENALTY_GOAL' ? 'GOAL'
                          : e.event_type?.toUpperCase() === 'OWN_GOAL' ? 'GOAL'
                          : e.event_type?.toUpperCase() === 'YELLOW_CARD' ? 'YELLOW'
                          : e.event_type?.toUpperCase() === 'RED_CARD' ? 'RED'
                          : e.event_type?.toUpperCase() === 'SECOND_YELLOW' ? 'RED'
                          : e.event_type?.toUpperCase() === 'INJURY' ? 'INJURY'
                          : e.event_type?.toUpperCase() === 'SUBSTITUTION' ? 'SUB'
                          : e.event_type?.toUpperCase() === 'HALFTIME' ? 'HALFTIME'
                          : e.event_type?.toUpperCase() === 'FULLTIME' ? 'FULLTIME'
                          : e.event_type?.toUpperCase() === 'OFFSIDE' ? 'OFFSIDE'
                          : e.event_type?.toUpperCase() === 'CORNER' ? 'CORNER'
                          : 'COMMENTARY') as MatchEvent['type'],
                        text: e.detail || e.event_type || '',
                        player: e.player_name || undefined,
                        team: (e.team?.toUpperCase() === 'HOME' || e.team?.toLowerCase() === 'home') ? 'HOME' as const
                          : (e.team?.toUpperCase() === 'AWAY' || e.team?.toLowerCase() === 'away') ? 'AWAY' as const
                          : undefined,
                      }))}
                      homeTeam={homeName}
                      awayTeam={awayName}
                    />
                  ) : (
                    <div className="text-center py-8">
                      <Activity className="w-8 h-8 text-white/10 mx-auto mb-3" />
                      <p className="text-xs text-white/25">Henüz olay kaydedilmedi</p>
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'stats' && (
                <motion.div
                  key="stats"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="space-y-4"
                >
                  <div className="flex items-center gap-2 px-1 mb-2">
                    <Users size={14} className="text-amber-400" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/30">
                      Oyuncu İstatistikleri
                    </span>
                  </div>

                  {isFinished && homePlayers.length > 0 && awayPlayers.length > 0 ? (
                    <>
                      <PlayerStatsTable players={homePlayers} teamName={homeName} label="EV SAHİBİ" />
                      <PlayerStatsTable players={awayPlayers} teamName={awayName} label="DEPLASMAN" />
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <Trophy className="w-8 h-8 text-white/10 mx-auto mb-3" />
                      <p className="text-xs text-white/25">
                        {isLive
                          ? 'Maç devam ediyor. İstatistikler maç sonunda güncellenecek.'
                          : 'Bu maç için oyuncu istatistikleri bulunamadı.'}
                      </p>
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'chat' && (
                <motion.div
                  key="chat"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                >
                  {profileId && teamName ? (
                    <MatchChat
                      match_id={fixtureId}
                      profileId={profileId}
                      teamName={teamName}
                      className="min-h-[400px]"
                    />
                  ) : (
                    <div className="text-center py-8 bg-white/[0.02] border border-white/[0.06] rounded-xl">
                      <MessageSquare className="w-8 h-8 text-white/10 mx-auto mb-3" />
                      <p className="text-xs text-white/25 mb-3">
                        Sohbete katılmak için giriş yapmalısınız.
                      </p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}

        {/* ═══ Planlanmış maç için de sohbet göster ═══ */}
        {isScheduled && profileId && teamName && (
          <div className="mt-6">
            <MatchChat
              match_id={fixtureId}
              profileId={profileId}
              teamName={teamName}
              className="min-h-[300px]"
            />
          </div>
        )}
      </div>
    </div>
  );
}
