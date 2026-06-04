'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Trophy, RefreshCw, Plus, CheckCircle2, RotateCcw, Users } from 'lucide-react';

interface LeagueInfo {
  id: string;
  name: string;
  tier: number;
  created_at: string;
  team_count: number;
  current_season: { id: string; name: string; status: string; current_tur: number; is_finished: boolean } | null;
}

export default function AdminLeaguesPage() {
  const { user } = useAuth();
  const [leagues, setLeagues] = useState<LeagueInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const headers = { 'x-admin-user-id': user?.id || '', 'x-admin-email': user?.email || '' };

  const fetchLeagues = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/leagues', { headers });
      if (!res.ok) throw new Error('Ligler alınamadı');
      const data = await res.json();
      setLeagues(data.leagues || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [user?.id, user?.email]);

  useEffect(() => { fetchLeagues(); }, [fetchLeagues]);

  const createSeason = async (leagueId: string) => {
    setActionLoading(leagueId);
    try {
      const res = await fetch('/api/admin/leagues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...headers },
        body: JSON.stringify({ action: 'create_season', leagueId }),
      });
      if (!res.ok) throw new Error('Sezon oluşturulamadı');
      await fetchLeagues();
    } catch (err) { console.error(err); alert('Sezon oluşturulamadı!'); }
    finally { setActionLoading(null); }
  };

  const finishSeason = async (leagueId: string) => {
    if (!confirm('Bu ligin aktif sezonunu tamamlamak istediğinize emin misiniz?')) return;
    setActionLoading(leagueId);
    try {
      const res = await fetch('/api/admin/leagues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...headers },
        body: JSON.stringify({ action: 'finish_season', leagueId }),
      });
      if (!res.ok) throw new Error('Sezon tamamlanamadı');
      await fetchLeagues();
    } catch (err) { console.error(err); alert('Sezon tamamlanamadı!'); }
    finally { setActionLoading(null); }
  };

  const resetStandings = async (leagueId: string) => {
    if (!confirm('Bu ligin puan durumunu sıfırlamak istediğinize emin misiniz?')) return;
    setActionLoading(leagueId);
    try {
      const res = await fetch('/api/admin/leagues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...headers },
        body: JSON.stringify({ action: 'reset_standings', leagueId }),
      });
      if (!res.ok) throw new Error('Sıfırlama başarısız');
      alert('Puan durumu sıfırlandı!');
    } catch (err) { console.error(err); alert('Sıfırlama başarısız!'); }
    finally { setActionLoading(null); }
  };

  const tierColors: Record<number, string> = {
    1: 'from-amber-500/10 to-amber-500/5 border-amber-500/20',
    2: 'from-blue-500/10 to-blue-500/5 border-blue-500/20',
    3: 'from-emerald-500/10 to-emerald-500/5 border-emerald-500/20',
    4: 'from-zinc-500/10 to-zinc-500/5 border-zinc-500/20',
  };

  const tierTextColors: Record<number, string> = {
    1: 'text-amber-400',
    2: 'text-blue-400',
    3: 'text-emerald-400',
    4: 'text-zinc-400',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tighter">Lig Yönetimi</h1>
          <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mt-1">{leagues.length} lig</p>
        </div>
        <button onClick={fetchLeagues} className="p-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all">
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {leagues.map(l => (
          <div key={l.id} className={`bg-gradient-to-br ${tierColors[l.tier] || tierColors[4]} border rounded-2xl p-5`}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[9px] font-black uppercase tracking-widest ${tierTextColors[l.tier] || 'text-zinc-400'}`}>
                    {l.tier}. Lig
                  </span>
                </div>
                <h3 className="text-base font-black uppercase tracking-tight">{l.name}</h3>
              </div>
              <div className="flex items-center gap-1">
                <Users size={12} className="text-zinc-500" />
                <span className="text-xs font-bold text-zinc-300">{l.team_count}</span>
              </div>
            </div>

            {l.current_season ? (
              <div className="bg-black/30 rounded-xl p-3 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-zinc-400">{l.current_season.name}</span>
                  <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${l.current_season.is_finished ? 'bg-zinc-800 text-zinc-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                    {l.current_season.is_finished ? 'Tamamlandı' : 'Aktif'}
                  </span>
                </div>
                <p className="text-xs text-zinc-300 font-mono">Tur: {l.current_season.current_tur}</p>
              </div>
            ) : (
              <div className="bg-black/30 rounded-xl p-3 mb-4 text-center">
                <p className="text-[10px] text-zinc-600 font-bold uppercase">Aktif sezon yok</p>
              </div>
            )}

            <div className="flex items-center gap-2">
              <button
                onClick={() => createSeason(l.id)}
                disabled={actionLoading === l.id}
                className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-500/10 border border-blue-500/20 rounded-xl text-[10px] font-bold text-blue-400 hover:bg-blue-500/20 transition-all disabled:opacity-50"
              >
                <Plus size={12} /> Yeni Sezon
              </button>
              {!l.current_season?.is_finished && l.current_season && (
                <button
                  onClick={() => finishSeason(l.id)}
                  disabled={actionLoading === l.id}
                  className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-amber-500/10 border border-amber-500/20 rounded-xl text-[10px] font-bold text-amber-400 hover:bg-amber-500/20 transition-all disabled:opacity-50"
                >
                  <CheckCircle2 size={12} /> Bitir
                </button>
              )}
              <button
                onClick={() => resetStandings(l.id)}
                disabled={actionLoading === l.id}
                className="p-2 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 hover:bg-red-500/20 transition-all disabled:opacity-50"
                title="Puan durumunu sıfırla"
              >
                <RotateCcw size={12} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
