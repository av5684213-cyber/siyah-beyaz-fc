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
  Users,
  MessageSquare,
  Calendar,
  Shield,
  Bot,
  Target,
  Activity,
} from 'lucide-react';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import MatchChatWithRival from '@/components/Chat/MatchChatWithRival';
import type { MatchEvent } from '@/lib/fm/types';
import { getMatchType } from '@/lib/fm/matchTypeUtils';

// Duygusal katman — animasyonlar, ses efektleri, heyecanlı anlatım
import { Confetti, GoalCelebration, RecordBreak } from '@/components/animations';
import { playSound, isSoundEnabled, setSoundEnabled } from '@/utils/sound';
import { emitEmotionalEvent, type EmotionalEvent } from '@/lib/fm/emotionalEvents';
import MatchCommentary from '@/components/match/MatchCommentary';

// Ayrıştırılmış alt bileşenler
import CountdownTimer from '@/components/match/CountdownTimer';
import ScoreBoard from '@/components/match/ScoreBoard';
import EventList from '@/components/match/EventList';
import PlayerStatsTable from '@/components/match/PlayerStatsTable';
import LiveStrategyPanel from '@/components/match/LiveStrategyPanel';
import type { FixtureData, MatchEventRow, PlayerStatRow } from '@/components/match/matchTypes';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { REFEREE_PERSONALITIES, type RefereePersonality } from '@/lib/fm/referee';

// ═══════════════════════════════════════════════════════════════
// Types (sadece MatchPage'e özel olanlar burada kalır)
// ═══════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════
// ANA SAYFA BİLEŞENİ
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
  const [activeTab, setActiveTab] = useState<'events' | 'stats' | 'chat' | 'strategy'>('events');
  const [profileId, setProfileId] = useState<string>('');
  const [teamName, setTeamName] = useState<string>('');

  // ── Canlı maç dakikası (live_matches tablosundan) ──
  const [liveMatchMinute, setLiveMatchMinute] = useState<number | undefined>(undefined);

  // ── Stadyum duyuru state ──
  const [showStadiumAnnouncement, setShowStadiumAnnouncement] = useState(false);
  const [stadiumDisplayName, setStadiumDisplayName] = useState<string>('');

  // ── Taktik seçimi (maç öncesi) ──
  const [selectedFormation, setSelectedFormation] = useState<string>('4-4-2');
  const [selectedTactic, setSelectedTactic] = useState<string>('normal');

  // ── Canlı maç strateji müdahalesi ──
  const [isApplyingTactic, setIsApplyingTactic] = useState(false);
  const [lastTacticApplied, setLastTacticApplied] = useState<string | null>(null);
  const [tacticChangeCount, setTacticChangeCount] = useState(0);

  const FORMATIONS = ['4-4-2', '4-3-3', '3-5-2', '4-5-1', '4-2-3-1', '5-3-2', '3-4-3'];
  const TACTICS: { id: string; label: string; desc: string; goalMod: number }[] = [
    { id: 'normal', label: 'Normal', desc: 'Dengeli oyun', goalMod: 0 },
    { id: 'attack', label: 'Hücum', desc: 'Gol ihtimali +%10', goalMod: 0.1 },
    { id: 'defense', label: 'Defans', desc: 'Gol yeme ihtimali -%10', goalMod: -0.05 },
    { id: 'counter', label: 'Kontra Atak', desc: 'Gol ihtimali +%5, kontra şansı', goalMod: 0.05 },
    { id: 'press', label: 'Pres', desc: 'Top kazanma +%8, kondisyon -%5', goalMod: 0.03 },
  ];

  // ═══ Hesaplanan değerler — MUST be before any callback that references them (TDZ fix) ═══
  const homeName = useMemo(() => fixture?.home?.name || 'Ev Sahibi', [fixture]);
  const awayName = useMemo(() => fixture?.away?.name || 'Deplasman', [fixture]);
  const matchStatus = useMemo(() => fixture?.status || 'scheduled', [fixture]);

  // ── Canlı maç strateji müdahalesi (yeni: /api/match/update-tactic endpoint) ──
  const handleLiveTacticChange = useCallback(async (newFormation: string, newTactic: string) => {
    if (isApplyingTactic || tacticChangeCount >= 5) return;
    setIsApplyingTactic(true);
    try {
      const currentProfileId = profileId;
      if (!currentProfileId) throw new Error('Profile ID bulunamadı.');

      // ── Yeni: /api/match/update-tactic endpoint'ini çağır ──
      // Bu endpoint match_sessions tablosunu günceller,
      // match-tick cron'u bir sonraki tick'te güncel taktikleri okur
      const response = await fetch('/api/match/update-tactic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fixtureId,
          tactic: newTactic,
          formation: newFormation,
          profileId: currentProfileId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 429) {
          console.warn('[MatchPage] Maksimum taktik değişikliği sayısına ulaşıldı');
        }
        throw new Error(errorData.error || 'Taktik güncellenemedi');
      }

      const result = await response.json();

      // Local state'leri güncelle
      setSelectedFormation(newFormation);
      setSelectedTactic(newTactic);
      setTacticChangeCount(prev => prev + 1);
      setLastTacticApplied(new Date().toLocaleTimeString('tr-TR'));

      // Local events'e TACTICAL_CHANGE ekle (anlık gösterim için)
      const tacticLabelMap: Record<string, string> = {
        'dengeli': 'Dengeli', 'hucum': 'Hücum', 'savunma': 'Savunma',
        'kontra': 'Kontra Atak', 'tikitaka': 'Tiki-Taka', 'normal': 'Dengeli',
        'attack': 'Hücum', 'defense': 'Defans', 'counter': 'Kontra Atak', 'press': 'Pres',
      };
      const currentMinute = result.currentMinute || (events.length > 0 ? events[events.length - 1].minute : 45);
      const detailText = `Stil: ${tacticLabelMap[newTactic] || newTactic}${newFormation ? `, Formasyon: ${newFormation}` : ''}`;

      setEvents(prev => [...prev, {
        id: `tactical-${Date.now()}`,
        fixture_id: fixtureId,
        event_type: 'TACTICAL_CHANGE',
        minute: currentMinute,
        player_name: null,
        team: result.side || (teamName === homeName ? 'home' : 'away'),
        detail: detailText,
        created_at: new Date().toISOString(),
      } as MatchEventRow]);

      if (typeof playSound === 'function') playSound('click');
    } catch (err) {
      console.error('[MatchPage] Canlı taktik müdahale hatası:', err);
    } finally {
      setIsApplyingTactic(false);
    }
  }, [isApplyingTactic, tacticChangeCount, profileId, selectedFormation, selectedTactic, events, fixtureId, teamName, homeName]);

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
        if (parsed.stadium_name) {
          setStadiumDisplayName(parsed.stadium_name);
        }
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
          referee_name,
          referee_personality,
          referee_strictness,
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

      // Maç olaylarını çek — sadece is_revealed=true olanları getir (kolon yoksa graceful fallback)
      let eventsQuery = supabase
        .from('match_events')
        .select('*')
        .eq('fixture_id', fixtureId)
        .order('minute', { ascending: true });

      // Try filtering by is_revealed if the column exists
      try {
        eventsQuery = eventsQuery.eq('is_revealed', true);
      } catch {}

      const { data: eventsData } = await eventsQuery;

      // If filtered query returns nothing, try without filter (graceful fallback)
      let finalEventsData = eventsData;
      if ((!eventsData || eventsData.length === 0) && fixtureData.status !== 'scheduled') {
        try {
          const { data: fallbackData } = await supabase
            .from('match_events')
            .select('*')
            .eq('fixture_id', fixtureId)
            .order('minute', { ascending: true });
          if (fallbackData && fallbackData.length > 0) {
            finalEventsData = fallbackData;
          }
        } catch {}
      }

      if (finalEventsData && finalEventsData.length > 0) {
        // Filter client-side for is_revealed if the data has the field
        const filtered = finalEventsData.filter((e: any) =>
          e.is_revealed === undefined || e.is_revealed === null || e.is_revealed === true
        );
        setEvents(filtered as MatchEventRow[]);
      }

      // Canlı maç dakikasını live_matches tablosundan çek
      if (fixtureData.status === 'live') {
        try {
          const { data: liveData } = await supabase
            .from('live_matches')
            .select('current_minute, home_score, away_score, status')
            .eq('fixture_id', fixtureId)
            .maybeSingle();
          if (liveData) {
            setLiveMatchMinute(liveData.current_minute ?? undefined);
          }
        } catch (err) {
          console.warn('[MatchPage] live_matches sorgusu başarısız (tablo mevcut olmayabilir):', err);
        }
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

  // Canlı maç için Realtime aboneliği (olay güncellemeleri + live_matches + is_revealed)
  useEffect(() => {
    if (!fixtureId || !fixture || fixture.status !== 'live') return;

    const supabase = getSupabase();
    if (!supabase) return;

    // ── match_events INSERT dinle ──
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
          const newEvent = payload.new as MatchEventRow;
          // Only add if revealed (or if is_revealed column doesn't exist)
          if (newEvent.is_revealed === undefined || newEvent.is_revealed === null || newEvent.is_revealed === true) {
            setEvents(prev => [...prev, newEvent]);
          }
        }
      )
      // ── match_events UPDATE dinle (is_revealed false → true) ──
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'match_events',
          filter: `fixture_id=eq.${fixtureId}`,
        },
        (payload: any) => {
          const updatedEvent = payload.new as MatchEventRow;
          if (updatedEvent.is_revealed === true) {
            setEvents(prev => {
              // Don't add duplicates
              if (prev.some(e => e.id === updatedEvent.id)) return prev;
              return [...prev, updatedEvent];
            });
          }
        }
      )
      .subscribe();

    // ── Fikstür durumu değişikliğini dinle (live → completed) ──
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

    // ── live_matches tablosunu dinle (skor/dakika güncellemeleri) ──
    let liveMatchChannel: ReturnType<typeof supabase.channel> | null = null;
    try {
      liveMatchChannel = supabase
        .channel(`live_match:${fixtureId}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'live_matches',
            filter: `fixture_id=eq.${fixtureId}`,
          },
          (payload: any) => {
            if (payload.new) {
              const liveData = payload.new;
              // Update live match minute
              if (liveData.current_minute != null) {
                setLiveMatchMinute(liveData.current_minute);
              }
              // Update local fixture state with live scores
              setFixture(prev => prev ? {
                ...prev,
                home_score: liveData.home_score ?? prev.home_score,
                away_score: liveData.away_score ?? prev.away_score,
                status: liveData.status === 'completed' ? 'completed' : liveData.status === 'halftime' ? 'live' : prev.status,
              } : prev);
            }
          }
        )
        .subscribe();
    } catch (err) {
      console.warn('[MatchPage] live_matches realtime aboneliği başarısız (tablo mevcut olmayabilir):', err);
    }

    // ── match_sessions tablosunu dinle (artırımlı simülasyon güncellemeleri) ──
    let sessionChannel: ReturnType<typeof supabase.channel> | null = null;
    try {
      sessionChannel = supabase
        .channel(`match_session:${fixtureId}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'match_sessions',
            filter: `fixture_id=eq.${fixtureId}`,
          },
          (payload: any) => {
            if (payload.new) {
              const sessionData = payload.new;
              // Dakikayı güncelle
              if (sessionData.current_minute != null) {
                setLiveMatchMinute(sessionData.current_minute);
              }
              // Skoru güncelle
              setFixture(prev => prev ? {
                ...prev,
                home_score: sessionData.home_score ?? prev.home_score,
                away_score: sessionData.away_score ?? prev.away_score,
                status: sessionData.status === 'completed' ? 'completed' : sessionData.status === 'halftime' ? 'live' : prev.status,
              } : prev);
            }
          }
        )
        .subscribe();
    } catch (err) {
      console.warn('[MatchPage] match_sessions realtime aboneliği başarısız:', err);
    }

    return () => {
      channel.unsubscribe();
      fixtureChannel.unsubscribe();
      if (liveMatchChannel) liveMatchChannel.unsubscribe();
      if (sessionChannel) sessionChannel.unsubscribe();
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

  // ═══ Hesaplanan değerler (moved to top of component — see TDZ fix above) ═══

  // ── Stadyum duyurusu: Canlı veya bitmiş maçta göster ──
  useEffect(() => {
    if ((matchStatus === 'live' || matchStatus === 'completed' || matchStatus === 'finished') && !showStadiumAnnouncement) {
      setShowStadiumAnnouncement(true);
      const timer = setTimeout(() => setShowStadiumAnnouncement(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [matchStatus]);

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

  // ── Spoiler Kalkanı: Bitmiş bir maç sayfasını görüntüleyen kullanıcı izlemiş sayılır ──
  useEffect(() => {
    if (isFinished && fixtureId && typeof window !== 'undefined') {
      localStorage.setItem(`watched_match_${fixtureId}`, 'true');
    }
  }, [isFinished, fixtureId]);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* ── Stadyum Duyuru Banner ── */}
      <AnimatePresence>
        {showStadiumAnnouncement && (
          <motion.div
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="fixed top-0 left-0 right-0 z-[100] bg-gradient-to-r from-amber-600/95 via-amber-500/95 to-amber-600/95 text-black text-center py-3 px-4 backdrop-blur-sm shadow-lg shadow-amber-500/20"
          >
            <div className="flex items-center justify-center gap-3">
              <span className="text-lg">🏟️</span>
              <p className="text-sm font-black uppercase tracking-wider">
                Hoş geldiniz! Bugünkü maçınız {stadiumDisplayName || homeName + ' Stadyumu'} Stadyumu'nda oynanacak.
              </p>
              <span className="text-lg">🏟️</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
                {liveMatchMinute != null && (
                  <span className="text-[10px] font-black text-amber-400 ml-1">{liveMatchMinute}&apos;</span>
                )}
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
          minute={liveMatchMinute}
        />

        {/* ═══ Hakem Bilgisi Kartı ═══ */}
        {fixture.referee_name && (() => {
          const refPersonality = fixture.referee_personality as RefereePersonality | undefined;
          const refConfig = refPersonality ? REFEREE_PERSONALITIES[refPersonality] : null;
          const strictness = fixture.referee_strictness ?? 50;
          const strictLabel = strictness >= 75 ? 'Çok Sert' : strictness >= 55 ? 'Sert' : strictness >= 40 ? 'Dengeli' : strictness >= 25 ? 'Yumuşak' : 'Çok Yumuşak';
          const personalityLabel = refConfig?.label_tr || (refPersonality === 'katil' ? 'Katilci' : refPersonality === 'ev_sahibi' ? 'Ev Sahibi' : refPersonality === 'degisken' ? 'Değişken' : refPersonality === 'var_sever' ? 'VAR Sever' : refPersonality === 'hosgorulu' || refPersonality === 'hoşgörülü' ? 'Hoşgörülü' : 'Dengeci');
          const personalityEmoji = refConfig?.emoji || (refPersonality === 'katil' ? '🟥' : refPersonality === 'ev_sahibi' ? '🏠' : refPersonality === 'degisken' ? '🎲' : refPersonality === 'var_sever' ? '📺' : '⚖️');
          const personalityDesc = refConfig?.description_tr || 'Standart hakem yönetimi.';
          const personalityColor = refPersonality === 'katil' ? 'red' : refPersonality === 'ev_sahibi' ? 'sky' : refPersonality === 'degisken' ? 'purple' : refPersonality === 'var_sever' ? 'cyan' : refPersonality === 'hosgorulu' || refPersonality === 'hoşgörülü' ? 'emerald' : 'amber';
          const colorMap: Record<string, { bg: string; border: string; text: string; bar: string }> = {
            red: { bg: 'bg-red-500/10', border: 'border-red-500/20', text: 'text-red-400', bar: 'bg-red-500' },
            sky: { bg: 'bg-sky-500/10', border: 'border-sky-500/20', text: 'text-sky-400', bar: 'bg-sky-500' },
            purple: { bg: 'bg-purple-500/10', border: 'border-purple-500/20', text: 'text-purple-400', bar: 'bg-purple-500' },
            cyan: { bg: 'bg-cyan-500/10', border: 'border-cyan-500/20', text: 'text-cyan-400', bar: 'bg-cyan-500' },
            emerald: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-400', bar: 'bg-emerald-500' },
            amber: { bg: 'bg-amber-500/10', border: 'border-amber-500/20', text: 'text-amber-400', bar: 'bg-amber-500' },
          };
          const colors = colorMap[personalityColor] || colorMap.amber;
          const rawName = fixture.referee_name;
          const knownTypes = ['Ev Sahibi', 'Sert', 'Katılcı', 'Adil', 'Dengeli', 'Hoşgörülü', 'Değişken', 'VAR Meraklısı', 'Yumuşak', 'Çok Sert', 'Çok Yumuşak'];
          let cleanName = rawName;
          for (const t of knownTypes) { cleanName = cleanName.replace(t, ''); }
          cleanName = cleanName.replace(/\s*\([^)]*\)\s*/g, '').replace(/\s+/g, ' ').trim();

          return (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className={`rounded-2xl border p-4 ${colors.bg} ${colors.border}`}
            >
              <div className="flex items-center gap-4">
                {/* Emoji avatar */}
                <div className={`w-12 h-12 rounded-xl border flex items-center justify-center text-xl shrink-0 ${colors.bg} ${colors.border}`}>
                  {personalityEmoji}
                </div>
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-black text-white uppercase tracking-tight">{cleanName}</span>
                    <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded border ${colors.text} ${colors.bg} ${colors.border}`}>
                      {personalityLabel}
                    </span>
                  </div>
                  <p className="text-[10px] text-white/40 mt-0.5 leading-relaxed truncate">{personalityDesc}</p>
                </div>
                {/* Strictness */}
                <div className="text-right shrink-0">
                  <div className="text-[8px] font-black text-white/25 uppercase tracking-widest mb-1">Sertlik</div>
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${colors.bar}`} style={{ width: `${strictness}%` }} />
                    </div>
                    <span className="text-xs font-mono font-bold text-white/60">{strictness}</span>
                  </div>
                  <span className={`text-[8px] font-bold ${colors.text}`}>{strictLabel}</span>
                </div>
              </div>
            </motion.div>
          );
        })()}

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
                      Gol mod: {(TACTICS.find(t => t.id === selectedTactic)?.goalMod ?? 0) > 0 ? '+' : ''}{(((TACTICS.find(t => t.id === selectedTactic)?.goalMod ?? 0)) * 100).toFixed(0)}%
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
                ...(isLive ? [{ id: 'strategy' as const, label: 'Strateji', icon: <Shield size={14} /> }] : []),
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
                  {events.length > 0 ? (
                    <MatchCommentary
                      events={events.map((e): MatchEvent => ({
                        minute: e.minute,
                        type: (e.event_type?.toUpperCase() === 'PENALTY_GOAL' ? 'PENALTY_GOAL'
                          : e.event_type?.toUpperCase() === 'OWN_GOAL' ? 'OWN_GOAL'
                          : e.event_type?.toUpperCase() === 'YELLOW_CARD' ? 'YELLOW'
                          : e.event_type?.toUpperCase() === 'RED_CARD' ? 'RED'
                          : e.event_type?.toUpperCase() === 'SECOND_YELLOW' ? 'SECOND_YELLOW'
                          : e.event_type?.toUpperCase() === 'INJURY' ? 'INJURY'
                          : e.event_type?.toUpperCase() === 'SUBSTITUTION' ? 'SUB'
                          : e.event_type?.toUpperCase() === 'HALFTIME' ? 'HALFTIME'
                          : e.event_type?.toUpperCase() === 'FULLTIME' ? 'FULLTIME'
                          : e.event_type?.toUpperCase() === 'OFFSIDE' ? 'OFFSIDE'
                          : e.event_type?.toUpperCase() === 'CORNER' ? 'CORNER'
                          : e.event_type?.toUpperCase() === 'TACTICAL_CHANGE' ? 'TACTICAL_CHANGE'
                          : 'COMMENTARY') as MatchEvent['type'],
                        text: e.detail || e.event_type || '',
                        player: e.player_name || undefined,
                        team: (e.team?.toUpperCase() === 'HOME' || e.team?.toLowerCase() === 'home') ? 'HOME' as const
                          : (e.team?.toUpperCase() === 'AWAY' || e.team?.toLowerCase() === 'away') ? 'AWAY' as const
                          : undefined,
                        // Trait tabanlı yorum üretimi için bağlam verileri
                        detail: e.detail || undefined,
                        homeTeamName: homeName,
                        awayTeamName: awayName,
                        matchType: getMatchType({
                          tur: fixture?.tur || 1,
                          home_team_id: fixture?.home_team_id || '',
                          away_team_id: fixture?.away_team_id || '',
                          is_friendly: fixture?.is_friendly,
                        }),
                      }))}
                      homeTeam={homeName}
                      awayTeam={awayName}
                      matchType={getMatchType({
                        tur: fixture?.tur || 1,
                        home_team_id: fixture?.home_team_id || '',
                        away_team_id: fixture?.away_team_id || '',
                        is_friendly: fixture?.is_friendly,
                      })}
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
                    <MatchChatWithRival
                      matchId={fixtureId}
                      profileId={profileId}
                      teamName={teamName}
                      currentMinute={liveMatchMinute}
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

              {activeTab === 'strategy' && isLive && (
                <motion.div
                  key="strategy"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                >
                  <div className="flex items-center gap-2 px-1 mb-3">
                    <Shield size={14} className="text-amber-400" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/30">
                      Kenardan Müdahale
                    </span>
                  </div>
                  <LiveStrategyPanel
                    currentFormation={selectedFormation || '4-4-2'}
                    currentTactic={selectedTactic === 'normal' ? 'dengeli' : selectedTactic}
                    onApply={handleLiveTacticChange}
                    isApplying={isApplyingTactic}
                    lastApplied={lastTacticApplied}
                    changeCount={tacticChangeCount}
                  />
                  {/* ═══ Taktik Etki Bilgi Kutusu ═══ */}
                  <div className="mt-4 bg-white/[0.02] border border-white/[0.06] rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Zap size={12} className="text-amber-400" />
                      <p className="text-[9px] font-black uppercase tracking-widest text-amber-400/50">Taktik Etki Rehberi</p>
                    </div>
                    <div className="space-y-2">
                      {[
                        { label: 'Hücum', goalMod: '+%12', conceedMod: '+%5', color: 'text-red-400' },
                        { label: 'Savunma', goalMod: '-%5', conceedMod: '-%15', color: 'text-emerald-400' },
                        { label: 'Kontra Atak', goalMod: '+%5', conceedMod: '—', color: 'text-cyan-400' },
                        { label: 'Tiki-Taka', goalMod: '+%4', conceedMod: '-%2', color: 'text-purple-400' },
                      ].map(t => (
                        <div key={t.label} className="flex items-center justify-between text-[10px] bg-white/[0.02] rounded-lg px-3 py-2">
                          <span className={`font-bold ${t.color}`}>{t.label}</span>
                          <div className="flex items-center gap-4">
                            <span className="text-white/30">Gol şansı: <span className={t.goalMod.startsWith('+') ? 'text-emerald-400 font-black' : 'text-red-400 font-black'}>{t.goalMod}</span></span>
                            <span className="text-white/30">Gol yeme: <span className={t.conceedMod.startsWith('+') ? 'text-red-400 font-black' : t.conceedMod.startsWith('-') ? 'text-emerald-400 font-black' : 'text-white/20 font-black'}>{t.conceedMod}</span></span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <p className="text-[8px] text-white/15 mt-2">Formasyon değişiklikleri de ofans/defans dengesini etkiler. Maç başına 3 müdahale hakkınız vardır.</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}

        {/* ═══ Planlanmış maç için de sohbet göster ═══ */}
        {isScheduled && profileId && teamName && (
          <div className="mt-6">
            <MatchChatWithRival
              matchId={fixtureId}
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
