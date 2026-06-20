'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Swords, RefreshCw, ChevronLeft, ChevronRight, Edit3, Save, X, Clock, CheckCircle2 } from 'lucide-react';

interface Fixture {
  id: string;
  home_team_id: string;
  away_team_id: string;
  season_id: string;
  tur: number;
  match_date: string;
  status: string;
  home_score: number;
  away_score: number;
  competition_type: string;
  scheduled_time: string;
  home_team_name: string;
  away_team_name: string;
}

export default function AdminMatchesPage() {
  const { user } = useAuth();
  const [fixtures, setFixtures] = useState<Fixture[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingFixture, setEditingFixture] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Record<string, any>>({});

  const headers = { 'x-admin-user-id': user?.id || '' };

  const fetchFixtures = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '50' });
      if (statusFilter) params.set('status', statusFilter);
      const res = await fetch(`/api/admin/matches?${params}`, { headers });
      if (!res.ok) throw new Error('Maçlar alınamadı');
      const data = await res.json();
      setFixtures(data.fixtures || []);
      setTotal(data.total || 0);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [page, statusFilter, user?.id, user?.email]);

  useEffect(() => { fetchFixtures(); }, [fetchFixtures]);

  const startEdit = (f: Fixture) => {
    setEditingFixture(f.id);
    setEditValues({ home_score: f.home_score, away_score: f.away_score, status: f.status });
  };
  const cancelEdit = () => { setEditingFixture(null); setEditValues({}); };

  const saveEdit = async (fixtureId: string) => {
    try {
      const res = await fetch('/api/admin/matches', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...headers },
        body: JSON.stringify({ fixtureId, updates: editValues }),
      });
      if (!res.ok) throw new Error('Güncelleme başarısız');
      setFixtures(prev => prev.map(f => f.id === fixtureId ? { ...f, ...editValues } : f));
      setEditingFixture(null);
      setEditValues({});
    } catch (err) { console.error(err); alert('Güncelleme başarısız!'); }
  };

  const statusColors: Record<string, string> = {
    scheduled: 'bg-blue-500/10 text-blue-400',
    live: 'bg-emerald-500/10 text-emerald-400 animate-pulse',
    completed: 'bg-zinc-800 text-zinc-400',
    postponed: 'bg-amber-500/10 text-amber-400',
  };

  const totalPages = Math.ceil(total / 50);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tighter">Maç Yönetimi</h1>
          <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mt-1">{total} fikstür</p>
        </div>
        <div className="flex items-center gap-2">
          <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
            className="bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-xs">
            <option value="">Tüm Durumlar</option>
            <option value="scheduled">Planlanmış</option>
            <option value="live">Canlı</option>
            <option value="completed">Tamamlanmış</option>
            <option value="postponed">Ertelenmiş</option>
          </select>
          <button onClick={fetchFixtures} className="p-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      <div className="bg-zinc-900/50 border border-white/5 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-center px-3 py-3 text-[9px] font-black uppercase tracking-widest text-zinc-500">Tur</th>
                <th className="text-left px-3 py-3 text-[9px] font-black uppercase tracking-widest text-zinc-500">Ev Sahibi</th>
                <th className="text-center px-3 py-3 text-[9px] font-black uppercase tracking-widest text-zinc-500">Skor</th>
                <th className="text-left px-3 py-3 text-[9px] font-black uppercase tracking-widest text-zinc-500">Deplasman</th>
                <th className="text-center px-3 py-3 text-[9px] font-black uppercase tracking-widest text-zinc-500">Tarih</th>
                <th className="text-center px-3 py-3 text-[9px] font-black uppercase tracking-widest text-zinc-500">Durum</th>
                <th className="text-center px-3 py-3 text-[9px] font-black uppercase tracking-widest text-zinc-500">Tip</th>
                <th className="text-center px-3 py-3 text-[9px] font-black uppercase tracking-widest text-zinc-500">İşlem</th>
              </tr>
            </thead>
            <tbody>
              {fixtures.map(f => (
                <tr key={f.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                  <td className="px-3 py-2.5 text-center font-mono text-zinc-400">{f.tur}</td>
                  <td className="px-3 py-2.5 font-bold text-right">{f.home_team_name}</td>
                  <td className="px-3 py-2.5 text-center">
                    {editingFixture === f.id ? (
                      <div className="flex items-center justify-center gap-1">
                        <input type="number" value={editValues.home_score ?? 0} onChange={e => setEditValues(v => ({ ...v, home_score: parseInt(e.target.value) || 0 }))}
                          className="w-10 bg-black border border-white/10 rounded px-1 py-0.5 text-center" />
                        <span className="text-zinc-500">-</span>
                        <input type="number" value={editValues.away_score ?? 0} onChange={e => setEditValues(v => ({ ...v, away_score: parseInt(e.target.value) || 0 }))}
                          className="w-10 bg-black border border-white/10 rounded px-1 py-0.5 text-center" />
                      </div>
                    ) : (
                      <span className="font-black text-lg">{f.home_score ?? '-'} : {f.away_score ?? '-'}</span>
                    )}
                  </td>
                  <td className="px-3 py-2.5 font-bold">{f.away_team_name}</td>
                  <td className="px-3 py-2.5 text-center text-zinc-400 font-mono">{f.match_date || '-'}</td>
                  <td className="px-3 py-2.5 text-center">
                    {editingFixture === f.id ? (
                      <select value={editValues.status} onChange={e => setEditValues(v => ({ ...v, status: e.target.value }))}
                        className="bg-black border border-white/10 rounded px-2 py-0.5 text-[10px]">
                        <option value="scheduled">Planlanmış</option>
                        <option value="live">Canlı</option>
                        <option value="completed">Tamamlanmış</option>
                        <option value="postponed">Ertelenmiş</option>
                      </select>
                    ) : (
                      <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${statusColors[f.status] || 'bg-zinc-800 text-zinc-400'}`}>
                        {f.status}
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2.5 text-center text-[9px] text-zinc-500 uppercase">{f.competition_type || 'lig'}</td>
                  <td className="px-3 py-2.5 text-center">
                    {editingFixture === f.id ? (
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => saveEdit(f.id)} className="p-1 bg-emerald-500/10 text-emerald-400 rounded hover:bg-emerald-500/20"><Save size={11} /></button>
                        <button onClick={cancelEdit} className="p-1 bg-zinc-800 text-zinc-400 rounded hover:bg-zinc-700"><X size={11} /></button>
                      </div>
                    ) : (
                      <button onClick={() => startEdit(f)} className="p-1 bg-blue-500/10 text-blue-400 rounded hover:bg-blue-500/20"><Edit3 size={11} /></button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-2 bg-white/5 rounded-xl hover:bg-white/10 disabled:opacity-30"><ChevronLeft size={16} /></button>
          <span className="text-xs font-bold text-zinc-400">{page} / {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-2 bg-white/5 rounded-xl hover:bg-white/10 disabled:opacity-30"><ChevronRight size={16} /></button>
        </div>
      )}
    </div>
  );
}
