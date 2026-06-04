'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabase } from '@/lib/supabase';

interface LiveMatchAlertProps {
  profileId: string;
  teamName: string;
}

export default function LiveMatchAlert({ profileId, teamName }: LiveMatchAlertProps) {
  const router = useRouter();
  const [liveMatch, setLiveMatch] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profileId || !teamName) { setLoading(false); return; }

    const supabase = getSupabase();
    if (!supabase) { setLoading(false); return; }

    // Check for live matches involving this team
    const checkLiveMatch = async () => {
      try {
        // Find team ID from league_teams
        const { data: teamData } = await supabase
          .from('league_teams')
          .select('id')
          .eq('name', teamName)
          .maybeSingle();

        if (!teamData) { setLoading(false); return; }

        // Check live_matches for this team
        const { data: liveData } = await supabase
          .from('live_matches')
          .select('*')
          .or(`home_team_id.eq.${teamData.id},away_team_id.eq.${teamData.id}`)
          .in('status', ['live', 'halftime'])
          .maybeSingle();

        if (liveData) {
          setLiveMatch(liveData);
        } else {
          setLiveMatch(null);
        }
      } catch (err) {
        console.warn('[LiveMatchAlert] Error checking live matches:', err);
      } finally {
        setLoading(false);
      }
    };

    checkLiveMatch();

    // Subscribe to live_matches changes for this team
    let liveChannel: ReturnType<typeof supabase.channel> | null = null;
    try {
      liveChannel = supabase
        .channel('live_match_alert')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'live_matches',
          },
          () => {
            // Re-check on any change
            checkLiveMatch();
          }
        )
        .subscribe();
    } catch (err) {
      console.warn('[LiveMatchAlert] Realtime subscription failed:', err);
    }

    const interval = setInterval(checkLiveMatch, 30000); // Check every 30s
    return () => {
      clearInterval(interval);
      if (liveChannel) liveChannel.unsubscribe();
    };
  }, [profileId, teamName]);

  if (loading || !liveMatch) return null;

  return (
    <div
      onClick={() => router.push(`/match/${liveMatch.fixture_id}`)}
      className="cursor-pointer bg-gradient-to-r from-red-600/20 via-red-500/10 to-red-600/20 border border-red-500/30 rounded-xl p-4 mb-4 flex items-center gap-4 hover:border-red-400/50 transition-all"
    >
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
        <span className="text-red-400 text-xs font-black uppercase tracking-widest">CANLI MAÇ</span>
      </div>

      <div className="flex-1 text-center">
        <span className="text-white/80 text-sm font-bold">{liveMatch.home_team_name}</span>
        <span className="text-white font-black text-lg mx-3">{liveMatch.home_score} - {liveMatch.away_score}</span>
        <span className="text-white/80 text-sm font-bold">{liveMatch.away_team_name}</span>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-amber-400 text-xs font-bold">{liveMatch.current_minute}&apos;</span>
        <span className="text-white/50 text-xs">İzle →</span>
      </div>
    </div>
  );
}
