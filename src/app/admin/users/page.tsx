'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  Users, Search, Edit3, Trash2, Save, X, RefreshCw,
  DollarSign, Star, Shield, ChevronLeft, ChevronRight, Eye
} from 'lucide-react';

const ADMIN_EMAIL = 'selimporsuk@gmail.com';

interface UserProfile {
  id: string;
  manager_name: string;
  team_name: string;
  league_name: string;
  league_tier: number;
  level: number;
  xp: number;
  money: number;
  fans: number;
  reputation: number;
  credits: number;
  current_day: number;
  is_bot: boolean;
  role: string;
  primary_color: string;
  secondary_color: string;
  created_at: string;
}

export default function AdminUsersPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(30);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);

  const headers = {
    'x-admin-user-id': user?.id || '',
  };

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) });
      if (search) params.set('search', search);
      const res = await fetch(`/api/admin/users?${params}`, { headers });
      if (!res.ok) throw new Error('Kullanıcılar alınamadı');
      const data = await res.json();
      setUsers(data.users || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, user?.id, user?.email]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const startEdit = (u: UserProfile) => {
    setEditingUser(u.id);
    setEditValues({ money: u.money, credits: u.credits, level: u.level, xp: u.xp, fans: u.fans, reputation: u.reputation, role: u.role, current_day: u.current_day });
  };

  const cancelEdit = () => { setEditingUser(null); setEditValues({}); };

  const saveEdit = async (userId: string) => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...headers },
        body: JSON.stringify({ userId, updates: editValues }),
      });
      if (!res.ok) throw new Error('Güncelleme başarısız');
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, ...editValues } : u));
      setEditingUser(null);
      setEditValues({});
    } catch (err) {
      console.error(err);
      alert('Güncelleme başarısız!');
    } finally {
      setSaving(false);
    }
  };

  const deleteUser = async (userId: string, name: string) => {
    if (!confirm(`"${name}" kullanıcısını silmek istediğinize emin misiniz? Bu işlem geri alınamaz!`)) return;
    try {
      const res = await fetch(`/api/admin/users?userId=${userId}`, { method: 'DELETE', headers });
      if (!res.ok) throw new Error('Silme başarısız');
      setUsers(prev => prev.filter(u => u.id !== userId));
      setTotal(prev => prev - 1);
    } catch (err) {
      console.error(err);
      alert('Silme başarısız!');
    }
  };

  const totalPages = Math.ceil(total / limit);

  const formatMoney = (v: number) => (v || 0).toLocaleString('tr-TR') + ' €';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tighter">Kullanıcı Yönetimi</h1>
          <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mt-1">{total} kullanıcı</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="İsim veya takım ara..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="pl-9 pr-4 py-2 bg-zinc-900 border border-white/10 rounded-xl text-xs w-64 focus:outline-none focus:border-white/30"
            />
          </div>
          <button onClick={fetchUsers} className="p-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      <div className="bg-zinc-900/50 border border-white/5 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left px-4 py-3 text-[9px] font-black uppercase tracking-widest text-zinc-500">Menajer</th>
                <th className="text-left px-4 py-3 text-[9px] font-black uppercase tracking-widest text-zinc-500">Takım</th>
                <th className="text-left px-4 py-3 text-[9px] font-black uppercase tracking-widest text-zinc-500">Lig</th>
                <th className="text-right px-4 py-3 text-[9px] font-black uppercase tracking-widest text-zinc-500">Bütçe</th>
                <th className="text-right px-4 py-3 text-[9px] font-black uppercase tracking-widest text-zinc-500">Kredi</th>
                <th className="text-center px-4 py-3 text-[9px] font-black uppercase tracking-widest text-zinc-500">Seviye</th>
                <th className="text-center px-4 py-3 text-[9px] font-black uppercase tracking-widest text-zinc-500">Rol</th>
                <th className="text-center px-4 py-3 text-[9px] font-black uppercase tracking-widest text-zinc-500">Gün</th>
                <th className="text-center px-4 py-3 text-[9px] font-black uppercase tracking-widest text-zinc-500">İşlem</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg flex items-center justify-center text-[9px] font-black" style={{ backgroundColor: u.primary_color || '#fff', color: u.secondary_color || '#000' }}>
                        {u.manager_name?.charAt(0) || '?'}
                      </div>
                      <span className="font-bold">{u.manager_name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-zinc-300">{u.team_name}</td>
                  <td className="px-4 py-3 text-zinc-400">{u.league_name || '-'}</td>
                  <td className="px-4 py-3 text-right font-mono">
                    {editingUser === u.id ? (
                      <input type="number" value={editValues.money || 0} onChange={e => setEditValues(v => ({ ...v, money: parseInt(e.target.value) || 0 }))} className="w-28 bg-black border border-white/10 rounded px-2 py-1 text-right" />
                    ) : (
                      <span className="text-emerald-400">{formatMoney(u.money)}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right font-mono">
                    {editingUser === u.id ? (
                      <input type="number" value={editValues.credits || 0} onChange={e => setEditValues(v => ({ ...v, credits: parseInt(e.target.value) || 0 }))} className="w-20 bg-black border border-white/10 rounded px-2 py-1 text-right" />
                    ) : (
                      <span className="text-amber-400">{u.credits}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {editingUser === u.id ? (
                      <input type="number" value={editValues.level || 1} onChange={e => setEditValues(v => ({ ...v, level: parseInt(e.target.value) || 1 }))} className="w-14 bg-black border border-white/10 rounded px-2 py-1 text-center" />
                    ) : (
                      <span className="bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded font-bold">{u.level}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {editingUser === u.id ? (
                      <select value={editValues.role || 'user'} onChange={e => setEditValues(v => ({ ...v, role: e.target.value }))} className="bg-black border border-white/10 rounded px-2 py-1 text-xs">
                        <option value="user">user</option>
                        <option value="admin">admin</option>
                      </select>
                    ) : (
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${u.role === 'admin' ? 'bg-red-500/10 text-red-400' : 'bg-zinc-800 text-zinc-400'}`}>{u.role}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center font-mono text-zinc-400">
                    {editingUser === u.id ? (
                      <input type="number" value={editValues.current_day || 1} onChange={e => setEditValues(v => ({ ...v, current_day: parseInt(e.target.value) || 1 }))} className="w-16 bg-black border border-white/10 rounded px-2 py-1 text-center" />
                    ) : (
                      u.current_day
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      {editingUser === u.id ? (
                        <>
                          <button onClick={() => saveEdit(u.id)} disabled={saving} className="p-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg hover:bg-emerald-500/20 transition-all disabled:opacity-50"><Save size={12} /></button>
                          <button onClick={cancelEdit} className="p-1.5 bg-zinc-800 text-zinc-400 rounded-lg hover:bg-zinc-700 transition-all"><X size={12} /></button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => startEdit(u)} className="p-1.5 bg-blue-500/10 text-blue-400 rounded-lg hover:bg-blue-500/20 transition-all"><Edit3 size={12} /></button>
                          <button onClick={() => deleteUser(u.id, u.manager_name)} className="p-1.5 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-all"><Trash2 size={12} /></button>
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-2 bg-white/5 rounded-xl hover:bg-white/10 disabled:opacity-30 transition-all">
            <ChevronLeft size={16} />
          </button>
          <span className="text-xs font-bold text-zinc-400">{page} / {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-2 bg-white/5 rounded-xl hover:bg-white/10 disabled:opacity-30 transition-all">
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
