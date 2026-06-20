'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Users, Trophy, Wallet, Zap, Trash2, Edit3, Save, Search, Eye, ArrowRightLeft, RefreshCw, Star, Activity, DollarSign, Building2, TrendingUp, UserCircle, ChevronLeft, ChevronRight, Filter, X } from 'lucide-react';
import { useFM } from '@/lib/fm/GameContext';
import { isSupabaseConfigured, getSupabase } from '@/lib/supabase';

interface TeamInfo {
  id: string;
  manager_name: string;
  team_name: string;
  league_name: string;
  league_tier: number;
  league_position: number;
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
  stadium_capacity: number;
  financial_health: number;
  player_count: number;
}

interface PlayerInfo {
  id: string;
  name: string;
  position: string;
  specific_position: string;
  rating: number;
  potential: number;
  age: number;
  market_value: number;
  salary: number;
  cond: number;
  form: number;
  morale: number;
  is_injured: boolean;
  goals: number;
  assists: number;
  matches_played: number;
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

export default function AdminPanel() {
  const { profile, setProfile, squad, setSquad, authEmail, isAdmin, userId } = useFM();

  const [activeTab, setActiveTab] = useState<'overview' | 'teams' | 'squad' | 'league'>('teams');
  const [teams, setTeams] = useState<TeamInfo[]>([]);
  const [teamsTotal, setTeamsTotal] = useState(0);
  const [teamsPage, setTeamsPage] = useState(1);
  const [teamsSearch, setTeamsSearch] = useState('');
  const [teamsLoading, setTeamsLoading] = useState(false);

  // Selected team for detail view
  const [selectedTeam, setSelectedTeam] = useState<TeamInfo | null>(null);
  const [teamPlayers, setTeamPlayers] = useState<PlayerInfo[]>([]);
  const [playersLoading, setPlayersLoading] = useState(false);

  // Quick edit for selected team
  const [editingTeam, setEditingTeam] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);

  // Player edit
  const [editingPlayer, setEditingPlayer] = useState<string | null>(null);
  const [editPlayerValues, setEditPlayerValues] = useState<Record<string, any>>({});

  // Transfer
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferPlayer, setTransferPlayer] = useState<PlayerInfo | null>(null);
  const [transferTargetId, setTransferTargetId] = useState('');
  const [transferSearch, setTransferSearch] = useState('');
  const [transferTeams, setTransferTeams] = useState<TeamInfo[]>([]);

  const headers = { 'x-admin-user-id': userId || '' };

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center p-20 bg-zinc-950 rounded-3xl border border-red-500/20">
        <Shield size={64} className="text-red-500 mb-6 animate-pulse" />
        <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white mb-2 underline decoration-red-500 decoration-4">Erişim Engellendi</h2>
        <p className="text-zinc-500 text-sm font-bold uppercase tracking-widest text-center">Bu alan yalnızca baş yönetici içindir.</p>
        <p className="text-zinc-600 text-[10px] mt-4 font-mono">Current User: {authEmail || 'Guest'}</p>
      </div>
    );
  }

  const fetchTeams = async (page = 1, search = '') => {
    setTeamsLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '30' });
      if (search) params.set('search', search);
      const res = await fetch(`/api/admin/teams?${params}`, { headers });
      if (res.ok) {
        const data = await res.json();
        setTeams(data.teams || []);
        setTeamsTotal(data.total || 0);
      }
    } catch (err) { console.error(err); }
    finally { setTeamsLoading(false); }
  };

  const fetchTeamPlayers = async (teamId: string) => {
    setPlayersLoading(true);
    try {
      const res = await fetch(`/api/admin/teams/players?teamId=${teamId}`, { headers });
      if (res.ok) {
        const data = await res.json();
        setTeamPlayers(data.players || []);
      }
    } catch (err) { console.error(err); }
    finally { setPlayersLoading(false); }
  };

  // Load teams on mount
  useEffect(() => {
    if (isAdmin) fetchTeams(1);
  }, [isAdmin]);

  const handleUpdateBudget = (amount: number) => {
    setProfile((prev: any) => ({ ...prev, money: amount }));
  };

  const handleSimulateWeek = async () => {
    setProfile((prev: any) => ({ ...prev, current_day: (prev.current_day || 0) + 7 }));
  };

  const startEditTeam = (t: TeamInfo) => {
    setEditingTeam(t.id);
    setEditValues({
      money: t.money, credits: t.credits, level: t.level, xp: t.xp,
      fans: t.fans, reputation: t.reputation, current_day: t.current_day,
      league_tier: t.league_tier, league_position: t.league_position,
      financial_health: t.financial_health, stadium_capacity: t.stadium_capacity,
    });
  };

  const saveEditTeam = async (teamId: string) => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/teams', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...headers },
        body: JSON.stringify({ teamId, updates: editValues }),
      });
      if (res.ok) {
        setTeams(prev => prev.map(t => t.id === teamId ? { ...t, ...editValues } : t));
        if (selectedTeam?.id === teamId) {
          setSelectedTeam(prev => prev ? { ...prev, ...editValues } as TeamInfo : prev);
        }
        setEditingTeam(null);
        setEditValues({});
      }
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  const startEditPlayer = (p: PlayerInfo) => {
    setEditingPlayer(p.id);
    setEditPlayerValues({
      rating: p.rating, potential: p.potential, age: p.age,
      market_value: p.market_value, salary: p.salary,
      cond: p.cond, form: p.form, morale: p.morale,
      speed: p.speed, power: p.power, passing: p.passing,
      shooting: p.shooting, defending: p.defending, vision: p.vision,
      control: p.control, heading: p.heading, goalkeeping: p.goalkeeping,
      is_injured: p.is_injured, goals: p.goals, assists: p.assists,
    });
  };

  const saveEditPlayer = async (playerId: string) => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/teams/players', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...headers },
        body: JSON.stringify({ playerId, updates: editPlayerValues }),
      });
      if (res.ok) {
        setTeamPlayers(prev => prev.map(p => p.id === playerId ? { ...p, ...editPlayerValues } as PlayerInfo : p));
        setEditingPlayer(null);
        setEditPlayerValues({});
      }
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  const openTransfer = async (player: PlayerInfo) => {
    setTransferPlayer(player);
    setShowTransferModal(true);
    try {
      const res = await fetch('/api/admin/teams?limit=200', { headers });
      if (res.ok) {
        const data = await res.json();
        setTransferTeams(data.teams || []);
      }
    } catch (err) { console.error(err); }
  };

  const executeTransfer = async () => {
    if (!transferPlayer || !transferTargetId) return;
    setSaving(true);
    try {
      const res = await fetch('/api/admin/teams/players', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...headers },
        body: JSON.stringify({ playerId: transferPlayer.id, targetTeamId: transferTargetId }),
      });
      if (res.ok) {
        setTeamPlayers(prev => prev.filter(p => p.id !== transferPlayer.id));
        setShowTransferModal(false);
        setTransferPlayer(null);
        setTransferTargetId('');
        fetchTeams(teamsPage, teamsSearch);
      }
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  const deletePlayer = async (playerId: string, name: string) => {
    if (!window.confirm(`"${name}" oyuncusunu silmek istediğinize emin misiniz?`)) return;
    try {
      await fetch(`/api/admin/teams/players?playerId=${playerId}`, { method: 'DELETE', headers });
      setTeamPlayers(prev => prev.filter(p => p.id !== playerId));
    } catch (err) { console.error(err); }
  };

  const formatMoney = (v: number) => (v || 0).toLocaleString('tr-TR') + ' \u20AC';
  const totalPages = Math.ceil(teamsTotal / 30);

  const tierColors: Record<number, string> = {
    1: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    2: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    3: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    4: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
  };

  const posColors: Record<string, string> = {
    GK: 'bg-amber-500/10 text-amber-400',
    DEF: 'bg-blue-500/10 text-blue-400',
    MID: 'bg-emerald-500/10 text-emerald-400',
    FWD: 'bg-red-500/10 text-red-400',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between bg-zinc-900/50 p-6 rounded-3xl border border-white/5">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-red-500 rounded-2xl flex items-center justify-center shadow-lg shadow-red-500/20">
            <Shield size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-black italic uppercase tracking-tighter">Admin Kontrol Paneli</h1>
            <p className="text-[10px] text-red-400/60 font-bold uppercase tracking-widest">Tüm takımlar üzerinde tam yetki</p>
          </div>
        </div>
        <div className="flex gap-2">
          {[
            { key: 'teams', label: 'Takımlar', icon: Users },
            { key: 'overview', label: 'Genel Bakış', icon: Activity },
            { key: 'squad', label: 'Kadro', icon: Shield },
            { key: 'league', label: 'Lig', icon: Trophy },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                activeTab === tab.key ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' : 'bg-white/5 text-white/40 hover:bg-white/10'
              }`}
            >
              <tab.icon size={12} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ─── TEAMS TAB (Main) ─── */}
      {activeTab === 'teams' && !selectedTeam && (
        <div className="space-y-4">
          {/* Search */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                placeholder="Takım veya menajer ara..."
                value={teamsSearch}
                onChange={e => { setTeamsSearch(e.target.value); setTeamsPage(1); fetchTeams(1, e.target.value); }}
                className="w-full pl-9 pr-4 py-2 bg-zinc-900/50 border border-white/10 rounded-xl text-xs focus:outline-none focus:border-white/30"
              />
            </div>
            <button onClick={() => fetchTeams(teamsPage, teamsSearch)} className="p-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all">
              <RefreshCw size={14} className={teamsLoading ? 'animate-spin' : ''} />
            </button>
          </div>

          {/* Teams List */}
          <div className="bg-zinc-900/50 border border-white/5 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-zinc-500">Takım</th>
                    <th className="text-left px-3 py-3 text-[10px] font-black uppercase tracking-widest text-zinc-500">Lig</th>
                    <th className="text-right px-3 py-3 text-[10px] font-black uppercase tracking-widest text-zinc-500">Bütçe</th>
                    <th className="text-center px-3 py-3 text-[10px] font-black uppercase tracking-widest text-zinc-500">Oyuncu</th>
                    <th className="text-center px-3 py-3 text-[10px] font-black uppercase tracking-widest text-zinc-500">Seviye</th>
                    <th className="text-center px-3 py-3 text-[10px] font-black uppercase tracking-widest text-zinc-500">Tip</th>
                    <th className="text-center px-3 py-3 text-[10px] font-black uppercase tracking-widest text-zinc-500">İşlem</th>
                  </tr>
                </thead>
                <tbody>
                  {teamsLoading ? (
                    <tr><td colSpan={7} className="text-center py-8 text-zinc-500">Yükleniyor...</td></tr>
                  ) : teams.length === 0 ? (
                    <tr><td colSpan={7} className="text-center py-8 text-zinc-500">Takım bulunamadı</td></tr>
                  ) : teams.map(t => (
                    <tr key={t.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black" style={{ backgroundColor: t.primary_color || '#fff', color: t.secondary_color || '#000' }}>
                            {t.team_name?.charAt(0) || '?'}
                          </div>
                          <div>
                            <p className="font-bold">{t.team_name}</p>
                            <p className="text-[10px] text-zinc-500">{t.manager_name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black border ${tierColors[t.league_tier] || 'bg-zinc-800 text-zinc-400 border-zinc-700'}`}>
                          {t.league_tier ? `${t.league_tier}. Lig` : 'Ligsiz'}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-right font-mono text-emerald-400">{formatMoney(t.money)}</td>
                      <td className="px-3 py-3 text-center"><span className="bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded font-bold">{t.player_count}</span></td>
                      <td className="px-3 py-3 text-center"><span className="bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded font-bold">Lv.{t.level}</span></td>
                      <td className="px-3 py-3 text-center">
                        {t.is_bot ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-black bg-amber-500/10 text-amber-400">BOT</span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-500/10 text-emerald-400">GERÇEK</span>
                        )}
                      </td>
                      <td className="px-3 py-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button onClick={() => { setSelectedTeam(t); fetchTeamPlayers(t.id); }} className="p-1.5 bg-blue-500/10 text-blue-400 rounded-lg hover:bg-blue-500/20 transition-all" title="Detay">
                            <Eye size={12} />
                          </button>
                          <button onClick={() => startEditTeam(t)} className="p-1.5 bg-amber-500/10 text-amber-400 rounded-lg hover:bg-amber-500/20 transition-all" title="Düzenle">
                            <Edit3 size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick Edit Panel */}
          {editingTeam && (
            <div className="bg-zinc-900/50 border border-amber-500/20 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-black uppercase tracking-wider text-amber-400 flex items-center gap-2">
                  <Edit3 size={14} /> Hızlı Düzenleme
                </h3>
                <div className="flex gap-2">
                  <button onClick={() => saveEditTeam(editingTeam)} disabled={saving} className="flex items-center gap-1 px-3 py-1.5 bg-emerald-500 text-white rounded-xl text-[10px] font-bold uppercase hover:bg-emerald-600 disabled:opacity-50">
                    <Save size={12} /> Kaydet
                  </button>
                  <button onClick={() => { setEditingTeam(null); setEditValues({}); }} className="px-3 py-1.5 bg-zinc-800 text-zinc-400 rounded-xl text-[10px] font-bold uppercase">
                    İptal
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { key: 'money', label: 'Bütçe (€)' },
                  { key: 'credits', label: 'Kredi' },
                  { key: 'level', label: 'Seviye' },
                  { key: 'xp', label: 'XP' },
                  { key: 'current_day', label: 'Gün' },
                  { key: 'fans', label: 'Taraftar' },
                  { key: 'reputation', label: 'İtibar' },
                  { key: 'league_tier', label: 'Lig Seviyesi' },
                ].map(f => (
                  <div key={f.key}>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 block mb-1">{f.label}</label>
                    <input type="number" value={editValues[f.key] ?? 0} onChange={e => setEditValues(v => ({ ...v, [f.key]: parseInt(e.target.value) || 0 }))}
                      className="w-full bg-black border border-white/10 rounded-lg px-3 py-1.5 text-xs" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <button onClick={() => { const p = Math.max(1, teamsPage - 1); setTeamsPage(p); fetchTeams(p, teamsSearch); }} disabled={teamsPage === 1} className="p-2 bg-white/5 rounded-xl hover:bg-white/10 disabled:opacity-30"><ChevronLeft size={16} /></button>
              <span className="text-xs font-bold text-zinc-400">{teamsPage} / {totalPages}</span>
              <button onClick={() => { const p = Math.min(totalPages, teamsPage + 1); setTeamsPage(p); fetchTeams(p, teamsSearch); }} disabled={teamsPage === totalPages} className="p-2 bg-white/5 rounded-xl hover:bg-white/10 disabled:opacity-30"><ChevronRight size={16} /></button>
            </div>
          )}
        </div>
      )}

      {/* ─── TEAM DETAIL VIEW ─── */}
      {activeTab === 'teams' && selectedTeam && (
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <button onClick={() => { setSelectedTeam(null); setTeamPlayers([]); setEditingTeam(null); }} className="p-2 bg-white/5 rounded-xl hover:bg-white/10 transition-all">
              <ChevronLeft size={16} />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-black" style={{ backgroundColor: selectedTeam.primary_color || '#fff', color: selectedTeam.secondary_color || '#000' }}>
                {selectedTeam.team_name?.charAt(0) || '?'}
              </div>
              <div>
                <h2 className="text-lg font-black uppercase tracking-tighter">{selectedTeam.team_name}</h2>
                <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">{selectedTeam.manager_name} • {selectedTeam.league_name || 'Ligsiz'}</p>
              </div>
            </div>
            <div className="ml-auto">
              {editingTeam === selectedTeam.id ? (
                <div className="flex gap-2">
                  <button onClick={() => saveEditTeam(selectedTeam.id)} disabled={saving} className="px-3 py-2 bg-emerald-500 text-white rounded-xl text-xs font-bold uppercase disabled:opacity-50"><Save size={12} className="inline mr-1" />Kaydet</button>
                  <button onClick={() => { setEditingTeam(null); setEditValues({}); }} className="px-3 py-2 bg-zinc-800 text-zinc-400 rounded-xl text-xs font-bold uppercase">İptal</button>
                </div>
              ) : (
                <button onClick={() => startEditTeam(selectedTeam)} className="px-3 py-2 bg-blue-500/10 border border-blue-500/20 rounded-xl text-xs font-bold text-blue-400 hover:bg-blue-500/20 transition-all">
                  <Edit3 size={12} className="inline mr-1" />Düzenle
                </button>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-3">
              <p className="text-sm font-black text-emerald-400">{formatMoney(selectedTeam.money)}</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Bütçe</p>
            </div>
            <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-3">
              <p className="text-sm font-black text-amber-400">{selectedTeam.credits}</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Kredi</p>
            </div>
            <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-3">
              <p className="text-sm font-black text-blue-400">Lv.{selectedTeam.level}</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Seviye</p>
            </div>
            <div className="bg-purple-500/5 border border-purple-500/20 rounded-xl p-3">
              <p className="text-sm font-black text-purple-400">{selectedTeam.player_count}</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Oyuncu</p>
            </div>
          </div>

          {/* Players */}
          <div className="bg-zinc-900/50 rounded-3xl border border-white/10 overflow-hidden">
            <div className="p-4 bg-zinc-800/50 border-b border-white/5 flex justify-between items-center">
              <h3 className="text-[10px] font-black uppercase text-white/40 flex items-center gap-2">
                <UserCircle size={14} /> Kadro ({teamPlayers.length} oyuncu)
              </h3>
              <button onClick={() => fetchTeamPlayers(selectedTeam.id)} className="p-1.5 bg-white/5 rounded-lg hover:bg-white/10">
                <RefreshCw size={12} className={playersLoading ? 'animate-spin' : ''} />
              </button>
            </div>
            {playersLoading ? (
              <div className="p-8 text-center text-zinc-500 text-xs">Yükleniyor...</div>
            ) : teamPlayers.length === 0 ? (
              <div className="p-8 text-center text-zinc-500 text-xs">Oyuncu bulunamadı</div>
            ) : (
              <div className="max-h-[500px] overflow-y-auto">
                <table className="w-full text-xs">
                  <thead className="sticky top-0 bg-zinc-900">
                    <tr className="border-b border-white/5">
                      <th className="text-left px-3 py-2 text-[10px] font-black uppercase tracking-widest text-zinc-500">Oyuncu</th>
                      <th className="text-center px-2 py-2 text-[10px] font-black uppercase tracking-widest text-zinc-500">Pos</th>
                      <th className="text-center px-2 py-2 text-[10px] font-black uppercase tracking-widest text-zinc-500">REY</th>
                      <th className="text-center px-2 py-2 text-[10px] font-black uppercase tracking-widest text-zinc-500">Yaş</th>
                      <th className="text-right px-2 py-2 text-[10px] font-black uppercase tracking-widest text-zinc-500">Değer</th>
                      <th className="text-center px-2 py-2 text-[10px] font-black uppercase tracking-widest text-zinc-500">Kond</th>
                      <th className="text-center px-2 py-2 text-[10px] font-black uppercase tracking-widest text-zinc-500">G/A/M</th>
                      <th className="text-center px-2 py-2 text-[10px] font-black uppercase tracking-widest text-zinc-500">İşlem</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teamPlayers.map(p => (
                      <tr key={p.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                        <td className="px-3 py-2"><span className="font-bold">{p.name}</span> {p.is_injured && <span className="w-1.5 h-1.5 bg-red-500 rounded-full inline-block ml-1" />}</td>
                        <td className="px-2 py-2 text-center"><span className={`px-1 py-0.5 rounded text-[10px] font-black ${posColors[p.position] || 'bg-zinc-800 text-zinc-400'}`}>{p.specific_position || p.position}</span></td>
                        <td className="px-2 py-2 text-center font-black">
                          {editingPlayer === p.id ? (
                            <input type="number" value={editPlayerValues.rating} onChange={e => setEditPlayerValues(v => ({ ...v, rating: parseInt(e.target.value) || 0 }))} className="w-12 bg-black border border-white/10 rounded px-1 py-0.5 text-center" />
                          ) : (
                            <span className={p.rating >= 80 ? 'text-amber-400' : p.rating >= 65 ? 'text-emerald-400' : 'text-zinc-300'}>{p.rating}</span>
                          )}
                        </td>
                        <td className="px-2 py-2 text-center text-zinc-400">
                          {editingPlayer === p.id ? (
                            <input type="number" value={editPlayerValues.age} onChange={e => setEditPlayerValues(v => ({ ...v, age: parseInt(e.target.value) || 0 }))} className="w-10 bg-black border border-white/10 rounded px-1 py-0.5 text-center" />
                          ) : p.age}
                        </td>
                        <td className="px-2 py-2 text-right font-mono text-emerald-400/80">{(p.market_value || 0).toLocaleString('tr-TR')}</td>
                        <td className="px-2 py-2 text-center">
                          <span className={(p.cond || 0) >= 70 ? 'text-emerald-400' : (p.cond || 0) >= 40 ? 'text-amber-400' : 'text-red-400'}>{p.cond || 0}</span>
                        </td>
                        <td className="px-2 py-2 text-center text-zinc-400 font-mono text-[10px]">{p.goals}/{p.assists}/{p.matches_played}</td>
                        <td className="px-2 py-2 text-center">
                          <div className="flex items-center justify-center gap-0.5">
                            {editingPlayer === p.id ? (
                              <>
                                <button onClick={() => saveEditPlayer(p.id)} className="p-1 bg-emerald-500/10 text-emerald-400 rounded hover:bg-emerald-500/20"><Save size={10} /></button>
                                <button onClick={() => { setEditingPlayer(null); setEditPlayerValues({}); }} className="p-1 bg-zinc-800 text-zinc-400 rounded hover:bg-zinc-700"><X size={10} /></button>
                              </>
                            ) : (
                              <>
                                <button onClick={() => startEditPlayer(p)} className="p-1 bg-blue-500/10 text-blue-400 rounded hover:bg-blue-500/20"><Edit3 size={10} /></button>
                                <button onClick={() => openTransfer(p)} className="p-1 bg-purple-500/10 text-purple-400 rounded hover:bg-purple-500/20"><ArrowRightLeft size={10} /></button>
                                <button onClick={() => deletePlayer(p.id, p.name)} className="p-1 bg-red-500/10 text-red-400 rounded hover:bg-red-500/20"><Trash2 size={10} /></button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Transfer Modal */}
          {showTransferModal && transferPlayer && (
            <div className="fixed inset-0 bg-black/70 z-[100] flex items-center justify-center p-4" onClick={() => setShowTransferModal(false)}>
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-zinc-900 border border-white/10 rounded-2xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
                <h3 className="text-lg font-black uppercase tracking-tighter mb-1 flex items-center gap-2">
                  <ArrowRightLeft size={16} className="text-purple-400" /> Oyuncu Transferi
                </h3>
                <p className="text-zinc-500 text-xs mb-4">{transferPlayer.name} ({transferPlayer.rating} REY) — {transferPlayer.specific_position || transferPlayer.position}</p>
                <input type="text" placeholder="Takım ara..." value={transferSearch} onChange={e => setTransferSearch(e.target.value)}
                  className="w-full bg-black border border-white/10 rounded-xl px-4 py-2 text-xs mb-3 focus:outline-none focus:border-white/30" />
                <div className="max-h-48 overflow-y-auto space-y-1 mb-4">
                  {transferTeams.filter(t => t.id !== selectedTeam.id).filter(t => !transferSearch || t.team_name?.toLowerCase().includes(transferSearch.toLowerCase()) || t.manager_name?.toLowerCase().includes(transferSearch.toLowerCase())).map(t => (
                    <button key={t.id} onClick={() => setTransferTargetId(t.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left transition-all ${transferTargetId === t.id ? 'bg-purple-500/10 border border-purple-500/30' : 'bg-zinc-800/50 hover:bg-zinc-800 border border-transparent'}`}>
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-black" style={{ backgroundColor: t.primary_color || '#fff', color: t.secondary_color || '#000' }}>{t.team_name?.charAt(0) || '?'}</div>
                      <div>
                        <p className="text-xs font-bold">{t.team_name}</p>
                        <p className="text-[10px] text-zinc-500">{t.manager_name}</p>
                      </div>
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <button onClick={executeTransfer} disabled={!transferTargetId || saving} className="flex-1 px-4 py-2 bg-purple-500 text-white rounded-xl text-xs font-bold uppercase hover:bg-purple-600 disabled:opacity-50">
                    {saving ? 'Transfer Ediliyor...' : 'Transfer Et'}
                  </button>
                  <button onClick={() => { setShowTransferModal(false); setTransferPlayer(null); setTransferTargetId(''); }} className="px-4 py-2 bg-zinc-800 text-zinc-400 rounded-xl text-xs font-bold uppercase">İptal</button>
                </div>
              </motion.div>
            </div>
          )}
        </div>
      )}

      {/* ─── OVERVIEW TAB ─── */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-emerald-500/10 border border-emerald-500/20 p-8 rounded-3xl flex flex-col items-center text-center">
            <Users size={32} className="text-emerald-400 mb-4" />
            <h4 className="text-2xl font-black text-white">{squad.length}</h4>
            <p className="text-[10px] font-bold text-emerald-400/60 uppercase tracking-widest mt-2">Kadro Oyuncu</p>
          </div>
          <div className="bg-blue-500/10 border border-blue-500/20 p-8 rounded-3xl flex flex-col items-center text-center">
            <Zap size={32} className="text-blue-400 mb-4" />
            <h4 className="text-2xl font-black text-white">{profile?.current_day || 1}</h4>
            <p className="text-[10px] font-bold text-blue-400/60 uppercase tracking-widest mt-2">Gün Sayısı</p>
          </div>
          <div className="bg-zinc-900/50 p-6 rounded-3xl col-span-2 border border-white/5">
            <h3 className="text-xs font-black uppercase mb-4 text-white/40">Sistem Bilgileri & Kritik Araçlar</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-white/5">
                <span className="text-[10px] text-zinc-500 font-bold uppercase">DB Bağlantısı</span>
                <span className="text-[10px] text-emerald-400 font-black">AKTİF (SUPABASE)</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-white/5">
                <span className="text-[10px] text-zinc-500 font-bold uppercase">Zaman Kontrolü</span>
                <button onClick={handleSimulateWeek} className="px-3 py-1 bg-blue-500/20 text-blue-400 text-[10px] font-black rounded-lg border border-blue-500/30 hover:bg-blue-500 hover:text-white transition-all">
                  + 7 GÜN SİMÜLE ET
                </button>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-white/5">
                <span className="text-[10px] text-zinc-500 font-bold uppercase">Toplam Takım</span>
                <span className="text-[10px] text-amber-400 font-black">{teamsTotal} TAKIM</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── SQUAD TAB (Own team) ─── */}
      {activeTab === 'squad' && (
        <div className="bg-zinc-900/50 rounded-3xl border border-white/10 overflow-hidden">
          <div className="p-4 bg-zinc-800/50 border-b border-white/5 flex justify-between items-center">
            <h3 className="text-[10px] font-black uppercase text-white/40">Kendi Kadro Yönetimi</h3>
            <button onClick={() => { const ok = window.confirm('Tüm kadroyu silmek istediğinizden emin misiniz?'); if (ok) setSquad([]); }} className="flex items-center gap-2 text-[10px] font-black text-red-500 hover:text-red-400">
              <Trash2 size={12} /> TÜMÜNÜ SİL
            </button>
          </div>
          <div className="max-h-[400px] overflow-y-auto">
            {squad.map((p, idx) => (
              <div key={p.id} className="flex items-center justify-between p-4 border-b border-white/5 hover:bg-white/5 transition-all">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-[10px] font-black text-white/40">{idx + 1}</span>
                  <div>
                    <p className="text-xs font-black text-white uppercase">{p.name}</p>
                    <p className="text-[10px] font-bold text-white/20 uppercase">{(p as any).specificPosition || (p as any).specific_position || p.position} • {p.rating} REY</p>
                  </div>
                </div>
                <button onClick={() => setSquad(prev => prev.filter(pl => pl.id !== p.id))} className="p-2 bg-red-500/10 hover:bg-red-500/20 rounded-lg text-red-500"><Trash2 size={14} /></button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── LEAGUE TAB ─── */}
      {activeTab === 'league' && (
        <div className="bg-zinc-900/50 rounded-3xl border border-white/10 overflow-hidden">
          <div className="p-4 bg-zinc-800/50 border-b border-white/5 flex justify-between items-center">
            <h3 className="text-[10px] font-black uppercase text-white/40">Lig & Fikstür Yönetimi</h3>
            <div className="flex gap-2">
              <button className="px-3 py-1 bg-amber-500 text-black text-[10px] font-black uppercase rounded-lg">Fikstür Çek</button>
              <button className="px-3 py-1 bg-blue-500 text-white text-[10px] font-black uppercase rounded-lg">Tümünü Simüle Et</button>
            </div>
          </div>
          <div className="p-8 flex flex-col items-center justify-center text-center opacity-40">
            <Trophy size={48} className="mb-4" />
            <p className="text-[10px] font-bold uppercase tracking-widest">Lig verileri Supabase üzerinden yönetilmektedir.</p>
            <p className="text-[10px] mt-2">Takımlar sekmesinden her takımın lig bilgisini düzenleyebilirsiniz.</p>
          </div>
        </div>
      )}
    </div>
  );
}
