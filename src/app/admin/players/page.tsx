'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  Search, RefreshCw, Edit3, Trash2, Save, X,
  ChevronLeft, ChevronRight, Filter, UserCircle
} from 'lucide-react';

const ADMIN_EMAIL = 'selimporsuk@gmail.com';

interface Player {
  id: string;
  name: string;
  position: string;
  specific_position: string;
  rating: number;
  potential: number;
  age: number;
  market_value: number;
  salary: number;
  team_name: string;
  profile_id: string | null;
  preferred_foot: string;
  cond: number;
  form: number;
  morale: number;
  is_injured: boolean;
  is_free_agent: boolean;
  is_for_sale: boolean;
  nation: string;
  contract_end_week: number;
  form_rating: number;
  speed: number;
  power: number;
  passing: number;
  shooting: number;
  defending: number;
  vision: number;
  control: number;
  heading: number;
  goalkeeping: number;
}

export default function AdminPlayersPage() {
  const { user } = useAuth();
  const [players, setPlayers] = useState<Player[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(50);
  const [search, setSearch] = useState('');
  const [positionFilter, setPositionFilter] = useState('');
  const [minRating, setMinRating] = useState(0);
  const [maxRating, setMaxRating] = useState(99);
  const [loading, setLoading] = useState(true);
  const [editingPlayer, setEditingPlayer] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Record<string, any>>({});
  const [showFilters, setShowFilters] = useState(false);

  const headers = { 'x-admin-user-id': user?.id || '', 'x-admin-email': user?.email || '' };

  const fetchPlayers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) });
      if (search) params.set('search', search);
      if (positionFilter) params.set('position', positionFilter);
      if (minRating > 0) params.set('minRating', String(minRating));
      if (maxRating < 99) params.set('maxRating', String(maxRating));
      const res = await fetch(`/api/admin/players?${params}`, { headers });
      if (!res.ok) throw new Error('Oyuncular alınamadı');
      const data = await res.json();
      setPlayers(data.players || []);
      setTotal(data.total || 0);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [page, limit, search, positionFilter, minRating, maxRating, user?.id, user?.email]);

  useEffect(() => { fetchPlayers(); }, [fetchPlayers]);

  const startEdit = (p: Player) => {
    setEditingPlayer(p.id);
    setEditValues({ rating: p.rating, potential: p.potential, age: p.age, market_value: p.market_value, salary: p.salary, cond: p.cond, form: p.form, morale: p.morale, speed: p.speed, power: p.power, passing: p.passing, shooting: p.shooting, defending: p.defending, vision: p.vision, control: p.control, heading: p.heading, goalkeeping: p.goalkeeping });
  };

  const cancelEdit = () => { setEditingPlayer(null); setEditValues({}); };

  const saveEdit = async (playerId: string) => {
    try {
      const res = await fetch('/api/admin/players', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...headers },
        body: JSON.stringify({ playerId, updates: editValues }),
      });
      if (!res.ok) throw new Error('Güncelleme başarısız');
      setPlayers(prev => prev.map(p => p.id === playerId ? { ...p, ...editValues } : p));
      setEditingPlayer(null);
      setEditValues({});
    } catch (err) { console.error(err); alert('Güncelleme başarısız!'); }
  };

  const deletePlayer = async (playerId: string, name: string) => {
    if (!confirm(`"${name}" oyuncusunu silmek istediğinize emin misiniz?`)) return;
    try {
      const res = await fetch(`/api/admin/players?playerId=${playerId}`, { method: 'DELETE', headers });
      if (!res.ok) throw new Error('Silme başarısız');
      setPlayers(prev => prev.filter(p => p.id !== playerId));
      setTotal(prev => prev - 1);
    } catch (err) { console.error(err); alert('Silme başarısız!'); }
  };

  const totalPages = Math.ceil(total / limit);
  const posColors: Record<string, string> = {
    GK: 'bg-amber-500/10 text-amber-400',
    DEF: 'bg-blue-500/10 text-blue-400',
    MID: 'bg-emerald-500/10 text-emerald-400',
    FWD: 'bg-red-500/10 text-red-400',
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tighter">Oyuncu Yönetimi</h1>
          <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mt-1">{total.toLocaleString('tr-TR')} oyuncu</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input type="text" placeholder="İsim ara..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="pl-9 pr-4 py-2 bg-zinc-900 border border-white/10 rounded-xl text-xs w-48 focus:outline-none focus:border-white/30" />
          </div>
          <button onClick={() => setShowFilters(!showFilters)} className={`p-2 rounded-xl border transition-all ${showFilters ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' : 'bg-white/5 border-white/10'}`}>
            <Filter size={14} />
          </button>
          <button onClick={fetchPlayers} className="p-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-4 grid grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <label className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 block mb-1">Pozisyon</label>
            <select value={positionFilter} onChange={e => { setPositionFilter(e.target.value); setPage(1); }}
              className="w-full bg-black border border-white/10 rounded-lg px-3 py-1.5 text-xs">
              <option value="">Tümü</option>
              <option value="GK">Kaleci</option>
              <option value="DEF">Defans</option>
              <option value="MID">Orta Saha</option>
              <option value="FWD">Forvet</option>
            </select>
          </div>
          <div>
            <label className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 block mb-1">Min Rating</label>
            <input type="number" value={minRating || ''} onChange={e => { setMinRating(parseInt(e.target.value) || 0); setPage(1); }}
              className="w-full bg-black border border-white/10 rounded-lg px-3 py-1.5 text-xs" />
          </div>
          <div>
            <label className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 block mb-1">Max Rating</label>
            <input type="number" value={maxRating < 99 ? maxRating : ''} onChange={e => { setMaxRating(parseInt(e.target.value) || 99); setPage(1); }}
              className="w-full bg-black border border-white/10 rounded-lg px-3 py-1.5 text-xs" />
          </div>
        </div>
      )}

      <div className="bg-zinc-900/50 border border-white/5 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left px-4 py-3 text-[9px] font-black uppercase tracking-widest text-zinc-500">Oyuncu</th>
                <th className="text-center px-3 py-3 text-[9px] font-black uppercase tracking-widest text-zinc-500">Pos</th>
                <th className="text-center px-3 py-3 text-[9px] font-black uppercase tracking-widest text-zinc-500">REY</th>
                <th className="text-center px-3 py-3 text-[9px] font-black uppercase tracking-widest text-zinc-500">KLT</th>
                <th className="text-center px-3 py-3 text-[9px] font-black uppercase tracking-widest text-zinc-500">Yaş</th>
                <th className="text-right px-3 py-3 text-[9px] font-black uppercase tracking-widest text-zinc-500">Değer</th>
                <th className="text-right px-3 py-3 text-[9px] font-black uppercase tracking-widest text-zinc-500">Maaş</th>
                <th className="text-left px-3 py-3 text-[9px] font-black uppercase tracking-widest text-zinc-500">Takım</th>
                <th className="text-center px-3 py-3 text-[9px] font-black uppercase tracking-widest text-zinc-500">Kond</th>
                <th className="text-center px-3 py-3 text-[9px] font-black uppercase tracking-widest text-zinc-500">Durum</th>
                <th className="text-center px-3 py-3 text-[9px] font-black uppercase tracking-widest text-zinc-500">İşlem</th>
              </tr>
            </thead>
            <tbody>
              {players.map(p => (
                <tr key={p.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <UserCircle size={14} className="text-zinc-600" />
                      <span className="font-bold">{p.name}</span>
                      <span className="text-[9px] text-zinc-600">{p.nation}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-black ${posColors[p.position] || 'bg-zinc-800 text-zinc-400'}`}>
                      {p.specific_position || p.position}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-center font-black">
                    {editingPlayer === p.id ? (
                      <input type="number" value={editValues.rating} onChange={e => setEditValues(v => ({ ...v, rating: parseInt(e.target.value) || 0 }))} className="w-14 bg-black border border-white/10 rounded px-1 py-0.5 text-center" />
                    ) : (
                      <span className={p.rating >= 80 ? 'text-amber-400' : p.rating >= 65 ? 'text-emerald-400' : 'text-zinc-300'}>{p.rating}</span>
                    )}
                  </td>
                  <td className="px-3 py-2.5 text-center font-bold text-zinc-400">
                    {editingPlayer === p.id ? (
                      <input type="number" value={editValues.potential} onChange={e => setEditValues(v => ({ ...v, potential: parseInt(e.target.value) || 0 }))} className="w-14 bg-black border border-white/10 rounded px-1 py-0.5 text-center" />
                    ) : p.potential}
                  </td>
                  <td className="px-3 py-2.5 text-center text-zinc-400">{p.age}</td>
                  <td className="px-3 py-2.5 text-right font-mono text-emerald-400/80">{(p.market_value || 0).toLocaleString('tr-TR')}</td>
                  <td className="px-3 py-2.5 text-right font-mono text-zinc-400">{(p.salary || 0).toLocaleString('tr-TR')}</td>
                  <td className="px-3 py-2.5 text-zinc-300 max-w-[120px] truncate">{p.team_name || 'Serbest'}</td>
                  <td className="px-3 py-2.5 text-center">
                    {editingPlayer === p.id ? (
                      <input type="number" value={editValues.cond} onChange={e => setEditValues(v => ({ ...v, cond: parseInt(e.target.value) || 0 }))} className="w-12 bg-black border border-white/10 rounded px-1 py-0.5 text-center" />
                    ) : (
                      <span className={(p.cond || 0) >= 70 ? 'text-emerald-400' : (p.cond || 0) >= 40 ? 'text-amber-400' : 'text-red-400'}>{p.cond || 0}</span>
                    )}
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    <div className="flex items-center justify-center gap-1">
                      {p.is_injured && <span className="w-1.5 h-1.5 bg-red-500 rounded-full" title="Sakat" />}
                      {p.is_free_agent && <span className="text-[8px] text-cyan-400 font-bold">SA</span>}
                      {p.is_for_sale && <span className="text-[8px] text-amber-400 font-bold">SL</span>}
                    </div>
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    <div className="flex items-center justify-center gap-1">
                      {editingPlayer === p.id ? (
                        <>
                          <button onClick={() => saveEdit(p.id)} className="p-1 bg-emerald-500/10 text-emerald-400 rounded hover:bg-emerald-500/20 transition-all"><Save size={11} /></button>
                          <button onClick={cancelEdit} className="p-1 bg-zinc-800 text-zinc-400 rounded hover:bg-zinc-700 transition-all"><X size={11} /></button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => startEdit(p)} className="p-1 bg-blue-500/10 text-blue-400 rounded hover:bg-blue-500/20 transition-all"><Edit3 size={11} /></button>
                          <button onClick={() => deletePlayer(p.id, p.name)} className="p-1 bg-red-500/10 text-red-400 rounded hover:bg-red-500/20 transition-all"><Trash2 size={11} /></button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-2 bg-white/5 rounded-xl hover:bg-white/10 disabled:opacity-30 transition-all"><ChevronLeft size={16} /></button>
          <span className="text-xs font-bold text-zinc-400">{page} / {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-2 bg-white/5 rounded-xl hover:bg-white/10 disabled:opacity-30 transition-all"><ChevronRight size={16} /></button>
        </div>
      )}
    </div>
  );
}
