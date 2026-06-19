'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';

interface FixtureData {
  id: string;
  home_team_id: string;
  away_team_id: string;
  home_score: number | null;
  away_score: number | null;
  match_date: string;
  match_time: string;
  status: string;
  competition_type: string;
  home_team_name?: string;
  away_team_name?: string;
}

export default function PreMatchPage() {
  const params = useParams();
  const router = useRouter();
  const fixtureId = params.fixtureId as string;

  const [fixture, setFixture] = useState<FixtureData | null>(null);
  const [injuredPlayers, setInjuredPlayers] = useState<any[]>([]);
  const [suspendedPlayers, setSuspendedPlayers] = useState<any[]>([]);
  const [opponentForm, setOpponentForm] = useState<any[]>([]);
  const [opponentTopPlayers, setOpponentTopPlayers] = useState<any[]>([]);
  const [countdown, setCountdown] = useState<string>('');
  const [isReady, setIsReady] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured() || !fixtureId) return;
    const supabase = getSupabase();
    if (!supabase) return;

    const fetchPreMatchData = async () => {
      try {
        // Fetch fixture
        const { data: fixData } = await supabase
          .from('fixtures')
          .select('*')
          .eq('id', fixtureId)
          .maybeSingle();

        if (fixData) {
          setFixture(fixData);

          // Fetch injured/suspended players
          const { data: players } = await supabase
            .from('players')
            .select('id, name, position, age, ovr, is_injured, suspended_until, profile_id')
            .in('profile_id', [fixData.home_team_id, fixData.away_team_id]);

          if (players) {
            setInjuredPlayers(players.filter((p: any) => p.is_injured));
            setSuspendedPlayers(players.filter((p: any) => p.suspended_until));
          }

          // Opponent form - last 5 fixtures
          const { data: formFixtures } = await supabase
            .from('fixtures')
            .select('*')
            .or(`home_team_id.eq.${fixData.away_team_id},away_team_id.eq.${fixData.away_team_id}`)
            .eq('status', 'completed')
            .order('match_date', { ascending: false })
            .limit(5);

          if (formFixtures) setOpponentForm(formFixtures);

          // Opponent top 3 players
          const { data: topPlayers } = await supabase
            .from('players')
            .select('id, name, position, ovr, age')
            .eq('profile_id', fixData.away_team_id)
            .order('ovr', { ascending: false })
            .limit(3);

          if (topPlayers) setOpponentTopPlayers(topPlayers);
        }
      } catch (err) {
        console.error('Pre-match data fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPreMatchData();
  }, [fixtureId]);

  // Countdown timer
  useEffect(() => {
    if (!fixture) return;
    const matchDateTime = new Date(`${fixture.match_date}T${fixture.match_time || '12:00'}`);

    const interval = setInterval(() => {
      const now = new Date();
      const diff = matchDateTime.getTime() - now.getTime();

      if (diff <= 0) {
        setCountdown('Maç başladı!');
        clearInterval(interval);
        return;
      }

      const hours = Math.floor(diff / 3600000);
      const minutes = Math.floor((diff % 3600000) / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      setCountdown(`${hours}s ${minutes}dk ${seconds}sn`);
    }, 1000);

    return () => clearInterval(interval);
  }, [fixture]);

  // Check readiness from localStorage
  useEffect(() => {
    if (fixtureId) {
      const ready = localStorage.getItem(`prematch_ready_${fixtureId}`);
      if (ready === 'true') setIsReady(true);
    }
  }, [fixtureId]);

  const handleReady = async () => {
    setIsReady(true);
    // Store readiness in localStorage
    localStorage.setItem(`prematch_ready_${fixtureId}`, 'true');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-950 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-white/30 border-t-white rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-950 text-white p-4 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <button onClick={() => router.back()} className="p-2 rounded-lg bg-white/5 hover:bg-white/10">
          ←
        </button>
        <h1 className="text-xl font-bold">Maça Hazırlık</h1>
      </div>

      {/* Countdown */}
      {fixture && (
        <div className="bg-gradient-to-r from-amber-900/40 to-amber-700/40 rounded-xl p-4 mb-4 text-center border border-amber-500/20">
          <div className="text-3xl font-mono font-bold text-amber-300">{countdown}</div>
          <div className="text-xs text-white/50 mt-1">
            {fixture.home_team_name || 'Ev Sahibi'} vs {fixture.away_team_name || 'Deplasman'}
          </div>
        </div>
      )}

      {/* Opponent Top Players */}
      {opponentTopPlayers.length > 0 && (
        <div className="bg-white/5 rounded-xl p-4 mb-4 border border-white/10">
          <h2 className="text-sm font-bold text-red-400 mb-3">⚠ Rakibin En İyi 3 Oyuncusu</h2>
          <div className="space-y-2">
            {opponentTopPlayers.map((p: any, i: number) => (
              <div key={p.id} className="flex items-center justify-between bg-white/5 rounded-lg p-2">
                <div className="flex items-center gap-2">
                  <span className="text-amber-400 font-bold text-xs">#{i + 1}</span>
                  <span className="text-sm">{p.name}</span>
                  <span className="text-[10px] text-white/40">{p.position}</span>
                </div>
                <span className="text-sm font-bold text-amber-300">{p.ovr}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Opponent Form */}
      {opponentForm.length > 0 && (
        <div className="bg-white/5 rounded-xl p-4 mb-4 border border-white/10">
          <h2 className="text-sm font-bold text-blue-400 mb-3">📊 Rakibin Son 5 Maçı</h2>
          <div className="space-y-1">
            {opponentForm.map((f: any, i: number) => {
              const isHome = f.home_team_id === fixture?.away_team_id;
              const teamScore = isHome ? f.home_score : f.away_score;
              const oppScore = isHome ? f.away_score : f.home_score;
              const result = teamScore > oppScore ? 'G' : teamScore < oppScore ? 'M' : 'B';
              const resultColor = result === 'G' ? 'text-green-400' : result === 'M' ? 'text-red-400' : 'text-yellow-400';
              return (
                <div key={i} className="flex items-center justify-between text-xs bg-white/5 rounded p-2">
                  <span className="text-white/50">{f.match_date}</span>
                  <span className={resultColor + ' font-bold'}>{result}</span>
                  <span className="text-white/70">{teamScore} - {oppScore}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Injured Players */}
      {injuredPlayers.length > 0 && (
        <div className="bg-white/5 rounded-xl p-4 mb-4 border border-red-500/20">
          <h2 className="text-sm font-bold text-red-400 mb-2">🏥 Sakat Oyuncular</h2>
          <div className="flex flex-wrap gap-2">
            {injuredPlayers.map((p: any) => (
              <span key={p.id} className="text-xs bg-red-500/10 text-red-300 px-2 py-1 rounded">{p.name} ({p.position})</span>
            ))}
          </div>
        </div>
      )}

      {/* Suspended Players */}
      {suspendedPlayers.length > 0 && (
        <div className="bg-white/5 rounded-xl p-4 mb-4 border border-yellow-500/20">
          <h2 className="text-sm font-bold text-yellow-400 mb-2">🟥 Cezalı Oyuncular</h2>
          <div className="flex flex-wrap gap-2">
            {suspendedPlayers.map((p: any) => (
              <span key={p.id} className="text-xs bg-yellow-500/10 text-yellow-300 px-2 py-1 rounded">{p.name} ({p.position})</span>
            ))}
          </div>
        </div>
      )}

      {/* Ready Button */}
      <button
        onClick={handleReady}
        disabled={isReady}
        className={`w-full py-3 rounded-xl font-bold text-lg transition-all ${
          isReady
            ? 'bg-green-600/30 text-green-300 border border-green-500/30'
            : 'bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white'
        }`}
      >
        {isReady ? '✅ Hazır — Taktik Onaylandı' : '⚡ Hazırım — Taktiği Onayla'}
      </button>
    </div>
  );
}
