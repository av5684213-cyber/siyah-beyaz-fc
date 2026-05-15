'use client';

import React, { useEffect } from 'react';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';

export default function RealTimeLeagueManager() {
  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    const interval = setInterval(async () => {
      const supabase = getSupabase();
      if (!supabase) return;

      const now = new Date();
      // Adjust to Turkish time if needed, but assuming server/DB uses UTC or a consistent timezone
      const today = now.toISOString().split('T')[0];
      const currentTime = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');

      // Find scheduled matches that should have happened
      const { data: pendingMatches, error } = await supabase
        .from('fixtures')
        .select('*')
        .eq('status', 'scheduled')
        .lte('match_date', today);

      // Trigger Maintenance check periodically (every 5 checks)
      if (Math.random() < 0.2) {
        fetch('/api/league/maintenance').catch(e => console.error('Maintenance trigger failed', e));
      }

      if (error || !pendingMatches) return;

      for (const match of pendingMatches) {
        if (match.match_date < today || (match.match_date === today && match.match_time <= currentTime)) {
          console.log(`Simulating match: ${match.id} (${match.match_time})`);
          try {
            // Simulate result
            const hScore = Math.floor(Math.random() * 4);
            const aScore = Math.floor(Math.random() * 4);
            
            const { error: updateError } = await supabase
              .from('fixtures')
              .update({
                status: 'finished',
                home_score: hScore,
                away_score: aScore
              })
              .eq('id', match.id);

            if (!updateError) {
              // Update Standings
              const updateTeam = async (teamId: string, gf: number, ga: number, pts: number, isWin: boolean, isDraw: boolean, isLoss: boolean) => {
                const { data: current, error: fetchError } = await supabase
                  .from('league_standings')
                  .select('*')
                  .eq('team_id', teamId)
                  .eq('season_id', match.season_id)
                  .maybeSingle();
                
                if (current) {
                  const newWon = (current.won || 0) + (isWin ? 1 : 0);
                  const newDrawn = (current.drawn || 0) + (isDraw ? 1 : 0);
                  const newLost = (current.lost || 0) + (isLoss ? 1 : 0);
                  const newGf = (current.gf || 0) + gf;
                  const newGa = (current.ga || 0) + ga;

                  await supabase.from('league_standings').update({
                    played: (current.played || 0) + 1,
                    gf: newGf,
                    ga: newGa,
                    gd: newGf - newGa,
                    points: (current.points || 0) + pts,
                    won: newWon,
                    drawn: newDrawn,
                    lost: newLost
                  }).eq('id', current.id);
                } else {
                  // Fallback: Create standing row if missing
                  await supabase.from('league_standings').insert({
                    season_id: match.season_id,
                    team_id: teamId,
                    played: 1,
                    won: isWin ? 1 : 0,
                    drawn: isDraw ? 1 : 0,
                    lost: isLoss ? 1 : 0,
                    gf: gf,
                    ga: ga,
                    gd: gf - ga,
                    points: pts
                  });
                }
              };

              await updateTeam(match.home_team_id, hScore, aScore, hScore > aScore ? 3 : hScore === aScore ? 1 : 0, hScore > aScore, hScore === aScore, hScore < aScore);
              await updateTeam(match.away_team_id, aScore, hScore, aScore > hScore ? 3 : aScore === hScore ? 1 : 0, aScore > hScore, aScore === hScore, aScore < hScore);
            }
          } catch (e) {
            console.error('Match simulation error:', e);
          }
        }
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  return null;
}
