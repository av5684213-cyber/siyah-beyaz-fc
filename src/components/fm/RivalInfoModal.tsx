'use client';

import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';

interface RivalInfoModalProps {
  open: boolean;
  onClose: () => void;
  teamId: string;
  teamName: string;
}

export default function RivalInfoModal({ open, onClose, teamId, teamName }: RivalInfoModalProps) {
  const [form, setForm] = useState<any[]>([]);
  const [topPlayers, setTopPlayers] = useState<any[]>([]);
  const [avgOvr, setAvgOvr] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [leagueTarget, setLeagueTarget] = useState<string>('');

  useEffect(() => {
    if (!open || !teamId || !isSupabaseConfigured()) return;
    const supabase = getSupabase();
    if (!supabase) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        // Last 5 matches
        const { data: fixtures } = await supabase
          .from('fixtures')
          .select('*')
          .or(`home_team_id.eq.${teamId},away_team_id.eq.${teamId}`)
          .eq('status', 'completed')
          .order('match_date', { ascending: false })
          .limit(5);
        if (fixtures) setForm(fixtures);

        // Top 3 players
        const { data: players } = await supabase
          .from('players')
          .select('id, name, position, ovr, age')
          .eq('profile_id', teamId)
          .order('ovr', { ascending: false })
          .limit(3);
        if (players) {
          setTopPlayers(players);
          const allPlayers = await supabase
            .from('players')
            .select('ovr')
            .eq('profile_id', teamId);
          if (allPlayers.data && allPlayers.data.length > 0) {
            setAvgOvr(Math.round(allPlayers.data.reduce((s, p) => s + (p.ovr || 0), 0) / allPlayers.data.length));
          }
        }

        // League target (based on position)
        const { data: teamData } = await supabase
          .from('league_teams')
          .select('points, league_id')
          .eq('id', teamId)
          .maybeSingle();

        if (teamData) {
          const { data: standings } = await supabase
            .from('league_teams')
            .select('id')
            .eq('league_id', teamData.league_id)
            .order('points', { ascending: false });

          if (standings) {
            const pos = standings.findIndex((s: any) => s.id === teamId) + 1;
            const total = standings.length;
            if (pos <= 2) setLeagueTarget('🏆 Şampiyonluk');
            else if (pos <= Math.ceil(total * 0.3)) setLeagueTarget('🥈 Üst sıra');
            else if (pos <= Math.ceil(total * 0.7)) setLeagueTarget('🔰 Orta sıra');
            else setLeagueTarget('🛡️ Düşmeme');
          }
        }
      } catch (err) {
        console.error('Rival info fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [open, teamId]);

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-sm bg-gray-900 border-white/10">
        <DialogHeader>
          <DialogTitle className="text-white text-sm">⚔️ {teamName}</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="text-center py-6 text-white/30 text-xs animate-pulse">Yükleniyor...</div>
        ) : (
          <div className="space-y-4">
            {/* Overview */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/5 rounded-lg p-3 text-center">
                <div className="text-xl font-bold text-white">{avgOvr}</div>
                <div className="text-[10px] text-white/40">Ortalama OVR</div>
              </div>
              <div className="bg-white/5 rounded-lg p-3 text-center">
                <div className="text-sm font-bold text-white">{leagueTarget || '—'}</div>
                <div className="text-[10px] text-white/40">Lig Hedefi</div>
              </div>
            </div>

            {/* Top Players */}
            {topPlayers.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-white/50 mb-2">En İyi Oyuncular</h4>
                <div className="space-y-1">
                  {topPlayers.map((p, i) => (
                    <div key={p.id} className="flex items-center justify-between bg-white/5 rounded-lg p-2 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="text-amber-400 font-bold text-[10px]">#{i + 1}</span>
                        <span className="text-white">{p.name}</span>
                        <span className="text-white/30 text-[10px]">{p.position}</span>
                      </div>
                      <span className="text-amber-300 font-bold">{p.ovr}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Form Guide */}
            {form.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-white/50 mb-2">Son 5 Maç</h4>
                <div className="flex gap-1.5">
                  {form.map((f, i) => {
                    const isHome = f.home_team_id === teamId;
                    const gf = isHome ? f.home_score : f.away_score;
                    const ga = isHome ? f.away_score : f.home_score;
                    const result = gf > ga ? 'G' : gf < ga ? 'M' : 'B';
                    const colors: Record<string, string> = { G: 'bg-green-500', M: 'bg-red-500', B: 'bg-yellow-500' };
                    return (
                      <div key={i} className={`${colors[result]} w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold text-white`}>
                        {result}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
