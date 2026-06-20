'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  Search, RefreshCw, Edit3, Trash2, Save, X, Users, ChevronLeft, ChevronRight,
  Shield, DollarSign, Star, Activity, Eye, ArrowRightLeft, Filter, Trophy,
  UserCircle, Zap, Building2, TrendingUp,
} from 'lucide-react';

interface TeamProfile {
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
  bot_difficulty: number;
  role: string;
  primary_color: string;
  secondary_color: string;
  stadium_name: string;
  stadium_capacity: number;
  philosophy: string;
  staff_coaches: number;
  staff_physios: number;
  scout_slots: number;
  ticket_price: number;
  financial_health: number;
  player_count: number;
  created_at: string;
}

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
  cond: number;
  form: number;
  morale: number;
  is_injured: boolean;
  is_free_agent: boolean;
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

export default function AdminTeamsPage() {
  const { user } = useAuth();
  const [teams, setTeams] = useState<TeamProfile[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(30);
  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState('');
  const [botFilter, setBotFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  // Detail modal state
  const [selectedTeam, setSelectedTeam] = useState<TeamProfile | null>(null);
  const [teamPlayers, setTeamPlayers] = useState<Player[]>([]);
  const [playersLoading, setPlayersLoading] = useState(false);

  // Edit state
  const [editingTeam, setEditingTeam] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);

  // Player edit
  const [editingPlayer, setEditingPlayer] = useState<string | null>(null);
  const [editPlayerValues, setEditPlayerValues] = useState<Record<string, any>>({});

  // Transfer modal
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferPlayer, setTransferPlayer] = useState<Player | null>(null);
  const [transferTargetTeamId, setTransferTargetTeamId] = useState('');
  const [transferSearch, setTransferSearch] = useState('');
  const [transferTeams, setTransferTeams] = useState<TeamProfile[]>([]);

  const headers = { 'x-admin-user-id': user?.id || '' };

  const fetchTeams = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) });
      if (search) params.set('search', search);
      if (tierFilter) params.set('tier', tierFilter);
      if (botFilter) params.set('is_bot', botFilter);
      const res = await fetch(`/api/admin/teams?${params}`, { headers });
      if (!res.ok) throw new Error('Takımlar alınamadı');
      const data = await res.json();
      setTeams(data.teams || []);
      setTotal(data.total || 0);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [page, limit, search, tierFilter, botFilter, user?.id, user?.email]);

  useEffect(() => { fetchTeams(); }, [fetchTeams]);

  const fetchTeamPlayers = async (teamId: string) => {
    setPlayersLoading(true);
    try {
      const res = await fetch(`/api/admin/teams/players?teamId=${teamId}`, { headers });
      if (!res.ok) throw new Error('Oyuncular alınamadı');
      const data = await res.json();
      setTeamPlayers(data.players || []);
    } catch (err) { console.error(err); }
    finally { setPlayersLoading(false); }
  };

  const startEdit = (t: TeamProfile) => {
    setEditingTeam(t.id);
    setEditValues({
      manager_name: t.manager_name,
      team_name: t.team_name,
      money: t.money,
      credits: t.credits,
      level: t.level,
      xp: t.xp,
      fans: t.fans,
      reputation: t.reputation,
      current_day: t.current_day,
      league_tier: t.league_tier,
      league_position: t.league_position,
      stadium_capacity: t.stadium_capacity,
      ticket_price: t.ticket_price,
      financial_health: t.financial_health,
      staff_coaches: t.staff_coaches,
      staff_physios: t.staff_physios,
      scout_slots: t.scout_slots,
      primary_color: t.primary_color,
      secondary_color: t.secondary_color,
      is_bot: t.is_bot,
    });
  };

  const cancelEdit = () => { setEditingTeam(null); setEditValues({}); };

  const saveEdit = async (teamId: string) => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/teams', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...headers },
        body: JSON.stringify({ teamId, updates: editValues }),
      });
      if (!res.ok) throw new Error('Güncelleme başarısız');
      setTeams(prev => prev.map(t => t.id === teamId ? { ...t, ...editValues } : t));
      if (selectedTeam?.id === teamId) {
        setSelectedTeam(prev => prev ? { ...prev, ...editValues } : prev);
      }
      setEditingTeam(null);
      setEditValues({});
    } catch (err) { console.error(err); alert('Güncelleme başarısız!'); }
    finally { setSaving(false); }
  };

  const deleteTeam = async (teamId: string, name: string) => {
    if (!confirm(`"${name}" takımını silmek istediğinize emin misiniz? Bu işlem geri alınamaz!`)) return;
    try {
      const res = await fetch(`/api/admin/teams?teamId=${teamId}`, { method: 'DELETE', headers });
      if (!res.ok) throw new Error('Silme başarısız');
      setTeams(prev => prev.filter(t => t.id !== teamId));
      setTotal(prev => prev - 1);
      if (selectedTeam?.id === teamId) setSelectedTeam(null);
    } catch (err) { console.error(err); alert('Silme başarısız!'); }
  };

  // Player editing
  const startEditPlayer = (p: Player) => {
    setEditingPlayer(p.id);
    setEditPlayerValues({
      rating: p.rating, potential: p.potential, age: p.age,
      market_value: p.market_value, salary: p.salary,
      cond: p.cond, form: p.form, morale: p.morale,
      speed: p.speed, power: p.power, passing: p.passing,
      shooting: p.shooting, defending: p.defending, vision: p.vision,
      control: p.control, heading: p.heading, goalkeeping: p.goalkeeping,
      is_injured: p.is_injured, is_free_agent: p.is_free_agent,
      goals: p.goals, assists: p.assists, matches_played: p.matches_played,
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
      if (!res.ok) throw new Error('Oyuncu güncelleme başarısız');
      setTeamPlayers(prev => prev.map(p => p.id === playerId ? { ...p, ...editPlayerValues } : p));
      setEditingPlayer(null);
      setEditPlayerValues({});
    } catch (err) { console.error(err); alert('Oyuncu güncelleme başarısız!'); }
    finally { setSaving(false); }
  };

  const deletePlayer = async (playerId: string, name: string) => {
    if (!confirm(`"${name}" oyuncusunu silmek istediğinize emin misiniz?`)) return;
    try {
      const res = await fetch(`/api/admin/teams/players?playerId=${playerId}`, { method: 'DELETE', headers });
      if (!res.ok) throw new Error('Silme başarısız');
      setTeamPlayers(prev => prev.filter(p => p.id !== playerId));
    } catch (err) { console.error(err); alert('Silme başarısız!'); }
  };

  // Transfer player
  const openTransfer = async (player: Player) => {
    setTransferPlayer(player);
    setShowTransferModal(true);
    // Fetch all teams for transfer target
    try {
      const res = await fetch('/api/admin/teams?limit=200', { headers });
      if (res.ok) {
        const data = await res.json();
        setTransferTeams(data.teams || []);
      }
    } catch (err) { console.error(err); }
  };

  const executeTransfer = async () => {
    if (!transferPlayer || !transferTargetTeamId) return;
    setSaving(true);
    try {
      const res = await fetch('/api/admin/teams/players', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...headers },
        body: JSON.stringify({ playerId: transferPlayer.id, targetTeamId: transferTargetTeamId }),
      });
      if (!res.ok) throw new Error('Transfer başarısız');
      setTeamPlayers(prev => prev.filter(p => p.id !== transferPlayer.id));
      setShowTransferModal(false);
      setTransferPlayer(null);
      setTransferTargetTeamId('');
      // Refresh teams to update player count
      fetchTeams();
    } catch (err) { console.error(err); alert('Transfer başarısız!'); }
    finally { setSaving(false); }
  };

  const totalPages = Math.ceil(total / limit);
  const formatMoney = (v: number) => (v || 0).toLocaleString('tr-TR') + ' \u20AC';

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

  // Team detail view
  if (selectedTeam) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => { setSelectedTeam(null); setTeamPlayers([]); }} className="p-2 bg-white/5 rounded-xl hover:bg-white/10 transition-all">
              <ChevronLeft size={16} />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-black" style={{ backgroundColor: selectedTeam.primary_color || '#fff', color: selectedTeam.secondary_color || '#000' }}>
                {selectedTeam.team_name?.charAt(0) || '?'}
              </div>
              <div>
                <h1 className="text-xl font-black uppercase tracking-tighter">{selectedTeam.team_name}</h1>
                <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">{selectedTeam.manager_name} • {selectedTeam.league_name || 'Ligsiz'}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {editingTeam === selectedTeam.id ? (
              <>
                <button onClick={() => saveEdit(selectedTeam.id)} disabled={saving} className="flex items-center gap-1 px-3 py-2 bg-emerald-500 text-white rounded-xl text-xs font-bold uppercase hover:bg-emerald-600 transition-all disabled:opacity-50">
                  <Save size={12} /> Kaydet
                </button>
                <button onClick={cancelEdit} className="px-3 py-2 bg-zinc-800 text-zinc-400 rounded-xl text-xs font-bold uppercase hover:bg-zinc-700 transition-all">
                  <X size={12} /> İptal
                </button>
              </>
            ) : (
              <>
                <button onClick={() => startEdit(selectedTeam)} className="flex items-center gap-1 px-3 py-2 bg-blue-500/10 border border-blue-500/20 rounded-xl text-xs font-bold text-blue-400 hover:bg-blue-500/20 transition-all">
                  <Edit3 size={12} /> Düzenle
                </button>
                <button onClick={() => deleteTeam(selectedTeam.id, selectedTeam.team_name)} className="flex items-center gap-1 px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-xl text-xs font-bold text-red-400 hover:bg-red-500/20 transition-all">
                  <Trash2 size={12} /> Sil
                </button>
              </>
            )}
          </div>
        </div>

        {/* Team Stats Grid */}
        {editingTeam === selectedTeam.id ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { key: 'money', label: 'Bütçe', type: 'number' },
              { key: 'credits', label: 'Kredi', type: 'number' },
              { key: 'level', label: 'Seviye', type: 'number' },
              { key: 'xp', label: 'XP', type: 'number' },
              { key: 'fans', label: 'Taraftar', type: 'number' },
              { key: 'reputation', label: 'İtibar', type: 'number' },
              { key: 'current_day', label: 'Gün', type: 'number' },
              { key: 'league_tier', label: 'Lig Seviyesi', type: 'number' },
              { key: 'league_position', label: 'Lig Sırası', type: 'number' },
              { key: 'stadium_capacity', label: 'Stadyum Kapasitesi', type: 'number' },
              { key: 'ticket_price', label: 'Bilet Fiyatı', type: 'number' },
              { key: 'financial_health', label: 'Finansal Sağlık', type: 'number' },
              { key: 'staff_coaches', label: 'Antrenör Sayısı', type: 'number' },
              { key: 'staff_physios', label: 'Fizyoterapist', type: 'number' },
              { key: 'scout_slots', label: 'Gözlemci Yuvası', type: 'number' },
              { key: 'primary_color', label: 'Ana Renk', type: 'text' },
              { key: 'secondary_color', label: 'İkincil Renk', type: 'text' },
              { key: 'manager_name', label: 'Menajer Adı', type: 'text' },
              { key: 'team_name', label: 'Takım Adı', type: 'text' },
            ].map(field => (
              <div key={field.key} className="bg-zinc-900/50 border border-white/5 rounded-xl p-3">
                <label className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 block mb-1">{field.label}</label>
                <input
                  type={field.type}
                  value={editValues[field.key] ?? ''}
                  onChange={e => setEditValues(v => ({ ...v, [field.key]: field.type === 'number' ? (parseInt(e.target.value) || 0) : e.target.value }))}
                  className="w-full bg-black border border-white/10 rounded-lg px-3 py-1.5 text-xs"
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4">
              <DollarSign size={14} className="text-emerald-400 mb-1" />
              <p className="text-lg font-black text-emerald-400">{formatMoney(selectedTeam.money)}</p>
              <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-500">Bütçe</p>
            </div>
            <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4">
              <Star size={14} className="text-amber-400 mb-1" />
              <p className="text-lg font-black text-amber-400">{selectedTeam.credits}</p>
              <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-500">Kredi</p>
            </div>
            <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4">
              <Zap size={14} className="text-blue-400 mb-1" />
              <p className="text-lg font-black text-blue-400">Lv.{selectedTeam.level}</p>
              <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-500">Seviye ({selectedTeam.xp} XP)</p>
            </div>
            <div className="bg-purple-500/5 border border-purple-500/20 rounded-xl p-4">
              <Users size={14} className="text-purple-400 mb-1" />
              <p className="text-lg font-black text-purple-400">{selectedTeam.player_count}</p>
              <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-500">Oyuncu</p>
            </div>
            <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-4">
              <Trophy size={14} className="text-zinc-400 mb-1" />
              <p className="text-sm font-black">{selectedTeam.league_name || 'Ligsiz'}</p>
              <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-500">{selectedTeam.league_tier}. Lig • Sıra {selectedTeam.league_position || '-'}</p>
            </div>
            <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-4">
              <Building2 size={14} className="text-zinc-400 mb-1" />
              <p className="text-sm font-black">{selectedTeam.stadium_name || 'Stadyum Yok'}</p>
              <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-500">Kapasite: {(selectedTeam.stadium_capacity || 0).toLocaleString('tr-TR')}</p>
            </div>
            <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-4">
              <Activity size={14} className="text-zinc-400 mb-1" />
              <p className="text-sm font-black">Gün {selectedTeam.current_day}</p>
              <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-500">Finansal: {selectedTeam.financial_health || 0}%</p>
            </div>
            <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-4">
              <TrendingUp size={14} className="text-zinc-400 mb-1" />
              <p className="text-sm font-black">{(selectedTeam.fans || 0).toLocaleString('tr-TR')}</p>
              <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-500">Taraftar • İtibar: {selectedTeam.reputation}</p>
            </div>
          </div>
        )}

        {/* Players */}
        <div className="bg-zinc-900/50 border border-white/5 rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-white/5 flex items-center justify-between">
            <h3 className="text-sm font-black uppercase tracking-wider text-zinc-400 flex items-center gap-2">
              <UserCircle size={14} /> Kadro Oyuncuları
            </h3>
            <button onClick={() => fetchTeamPlayers(selectedTeam.id)} className="p-1.5 bg-white/5 rounded-lg hover:bg-white/10 transition-all">
              <RefreshCw size={12} className={playersLoading ? 'animate-spin' : ''} />
            </button>
          </div>

          {playersLoading ? (
            <div className="p-8 text-center text-zinc-500 text-xs">Yükleniyor...</div>
          ) : teamPlayers.length === 0 ? (
            <div className="p-8 text-center text-zinc-500 text-xs">Bu takımda oyuncu bulunamadı.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="text-left px-3 py-2.5 text-[9px] font-black uppercase tracking-widest text-zinc-500">Oyuncu</th>
                    <th className="text-center px-2 py-2.5 text-[9px] font-black uppercase tracking-widest text-zinc-500">Pos</th>
                    <th className="text-center px-2 py-2.5 text-[9px] font-black uppercase tracking-widest text-zinc-500">REY</th>
                    <th className="text-center px-2 py-2.5 text-[9px] font-black uppercase tracking-widest text-zinc-500">KLT</th>
                    <th className="text-center px-2 py-2.5 text-[9px] font-black uppercase tracking-widest text-zinc-500">Yaş</th>
                    <th className="text-right px-2 py-2.5 text-[9px] font-black uppercase tracking-widest text-zinc-500">Değer</th>
                    <th className="text-center px-2 py-2.5 text-[9px] font-black uppercase tracking-widest text-zinc-500">Kond</th>
                    <th className="text-center px-2 py-2.5 text-[9px] font-black uppercase tracking-widest text-zinc-500">G/A/M</th>
                    <th className="text-center px-2 py-2.5 text-[9px] font-black uppercase tracking-widest text-zinc-500">İşlem</th>
                  </tr>
                </thead>
                <tbody>
                  {teamPlayers.map(p => (
                    <tr key={p.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2">
                          <UserCircle size={12} className="text-zinc-600" />
                          <span className="font-bold">{p.name}</span>
                          {p.is_injured && <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />}
                        </div>
                      </td>
                      <td className="px-2 py-2 text-center">
                        <span className={`px-1 py-0.5 rounded text-[8px] font-black ${posColors[p.position] || 'bg-zinc-800 text-zinc-400'}`}>
                          {p.specific_position || p.position}
                        </span>
                      </td>
                      <td className="px-2 py-2 text-center font-black">
                        {editingPlayer === p.id ? (
                          <input type="number" value={editPlayerValues.rating} onChange={e => setEditPlayerValues(v => ({ ...v, rating: parseInt(e.target.value) || 0 }))} className="w-12 bg-black border border-white/10 rounded px-1 py-0.5 text-center" />
                        ) : (
                          <span className={p.rating >= 80 ? 'text-amber-400' : p.rating >= 65 ? 'text-emerald-400' : 'text-zinc-300'}>{p.rating}</span>
                        )}
                      </td>
                      <td className="px-2 py-2 text-center text-zinc-400">
                        {editingPlayer === p.id ? (
                          <input type="number" value={editPlayerValues.potential} onChange={e => setEditPlayerValues(v => ({ ...v, potential: parseInt(e.target.value) || 0 }))} className="w-12 bg-black border border-white/10 rounded px-1 py-0.5 text-center" />
                        ) : p.potential}
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
                      <td className="px-2 py-2 text-center text-zinc-400 font-mono">{p.goals}/{p.assists}/{p.matches_played}</td>
                      <td className="px-2 py-2 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {editingPlayer === p.id ? (
                            <>
                              <button onClick={() => saveEditPlayer(p.id)} className="p-1 bg-emerald-500/10 text-emerald-400 rounded hover:bg-emerald-500/20"><Save size={10} /></button>
                              <button onClick={() => { setEditingPlayer(null); setEditPlayerValues({}); }} className="p-1 bg-zinc-800 text-zinc-400 rounded hover:bg-zinc-700"><X size={10} /></button>
                            </>
                          ) : (
                            <>
                              <button onClick={() => startEditPlayer(p)} className="p-1 bg-blue-500/10 text-blue-400 rounded hover:bg-blue-500/20" title="Düzenle"><Edit3 size={10} /></button>
                              <button onClick={() => openTransfer(p)} className="p-1 bg-purple-500/10 text-purple-400 rounded hover:bg-purple-500/20" title="Transfer"><ArrowRightLeft size={10} /></button>
                              <button onClick={() => deletePlayer(p.id, p.name)} className="p-1 bg-red-500/10 text-red-400 rounded hover:bg-red-500/20" title="Sil"><Trash2 size={10} /></button>
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
            <div className="bg-zinc-900 border border-white/10 rounded-2xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
              <h3 className="text-lg font-black uppercase tracking-tighter mb-1">Oyuncu Transferi</h3>
              <p className="text-zinc-500 text-xs mb-4">{transferPlayer.name} ({transferPlayer.rating} REY) — {transferPlayer.specific_position || transferPlayer.position}</p>

              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Takım ara..."
                  value={transferSearch}
                  onChange={e => setTransferSearch(e.target.value)}
                  className="w-full bg-black border border-white/10 rounded-xl px-4 py-2 text-xs mb-3 focus:outline-none focus:border-white/30"
                />
                <div className="max-h-60 overflow-y-auto space-y-1">
                  {transferTeams
                    .filter(t => t.id !== selectedTeam.id)
                    .filter(t => !transferSearch || t.team_name?.toLowerCase().includes(transferSearch.toLowerCase()) || t.manager_name?.toLowerCase().includes(transferSearch.toLowerCase()))
                    .map(t => (
                      <button
                        key={t.id}
                        onClick={() => setTransferTargetTeamId(t.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left transition-all ${
                          transferTargetTeamId === t.id ? 'bg-purple-500/10 border border-purple-500/30' : 'bg-zinc-800/50 hover:bg-zinc-800 border border-transparent'
                        }`}
                      >
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black" style={{ backgroundColor: t.primary_color || '#fff', color: t.secondary_color || '#000' }}>
                          {t.team_name?.charAt(0) || '?'}
                        </div>
                        <div>
                          <p className="text-xs font-bold">{t.team_name}</p>
                          <p className="text-[9px] text-zinc-500">{t.manager_name} • {t.league_name || 'Ligsiz'}</p>
                        </div>
                      </button>
                    ))}
                </div>
              </div>

              <div className="flex gap-2">
                <button onClick={executeTransfer} disabled={!transferTargetTeamId || saving} className="flex-1 px-4 py-2 bg-purple-500 text-white rounded-xl text-xs font-bold uppercase hover:bg-purple-600 transition-all disabled:opacity-50">
                  {saving ? 'Transfer Ediliyor...' : 'Transfer Et'}
                </button>
                <button onClick={() => { setShowTransferModal(false); setTransferPlayer(null); setTransferTargetTeamId(''); }} className="px-4 py-2 bg-zinc-800 text-zinc-400 rounded-xl text-xs font-bold uppercase hover:bg-zinc-700 transition-all">
                  İptal
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Teams list view
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tighter">Takım Yönetimi</h1>
          <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mt-1">{total} takım — Tüm takımlar üzerinde tam kontrol</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input type="text" placeholder="Takım veya menajer ara..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="pl-9 pr-4 py-2 bg-zinc-900 border border-white/10 rounded-xl text-xs w-56 focus:outline-none focus:border-white/30" />
          </div>
          <button onClick={() => setShowFilters(!showFilters)} className={`p-2 rounded-xl border transition-all ${showFilters ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' : 'bg-white/5 border-white/10'}`}>
            <Filter size={14} />
          </button>
          <button onClick={fetchTeams} className="p-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-4 grid grid-cols-2 md:grid-cols-3 gap-3">
          <div>
            <label className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 block mb-1">Lig Seviyesi</label>
            <select value={tierFilter} onChange={e => { setTierFilter(e.target.value); setPage(1); }}
              className="w-full bg-black border border-white/10 rounded-lg px-3 py-1.5 text-xs">
              <option value="">Tümü</option>
              <option value="1">1. Lig</option>
              <option value="2">2. Lig</option>
              <option value="3">3. Lig</option>
              <option value="4">4. Lig</option>
            </select>
          </div>
          <div>
            <label className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 block mb-1">Tür</label>
            <select value={botFilter} onChange={e => { setBotFilter(e.target.value); setPage(1); }}
              className="w-full bg-black border border-white/10 rounded-lg px-3 py-1.5 text-xs">
              <option value="">Tümü</option>
              <option value="false">Gerçek Takım</option>
              <option value="true">Bot Takım</option>
            </select>
          </div>
        </div>
      )}

      {/* Teams Table */}
      <div className="bg-zinc-900/50 border border-white/5 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left px-4 py-3 text-[9px] font-black uppercase tracking-widest text-zinc-500">Takım</th>
                <th className="text-left px-3 py-3 text-[9px] font-black uppercase tracking-widest text-zinc-500">Lig</th>
                <th className="text-right px-3 py-3 text-[9px] font-black uppercase tracking-widest text-zinc-500">Bütçe</th>
                <th className="text-center px-3 py-3 text-[9px] font-black uppercase tracking-widest text-zinc-500">Oyuncu</th>
                <th className="text-center px-3 py-3 text-[9px] font-black uppercase tracking-widest text-zinc-500">Seviye</th>
                <th className="text-center px-3 py-3 text-[9px] font-black uppercase tracking-widest text-zinc-500">Gün</th>
                <th className="text-center px-3 py-3 text-[9px] font-black uppercase tracking-widest text-zinc-500">Tip</th>
                <th className="text-center px-3 py-3 text-[9px] font-black uppercase tracking-widest text-zinc-500">İşlem</th>
              </tr>
            </thead>
            <tbody>
              {teams.map(t => (
                <tr key={t.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black" style={{ backgroundColor: t.primary_color || '#fff', color: t.secondary_color || '#000' }}>
                        {t.team_name?.charAt(0) || '?'}
                      </div>
                      <div>
                        <p className="font-bold">{t.team_name}</p>
                        <p className="text-[9px] text-zinc-500">{t.manager_name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-black border ${tierColors[t.league_tier] || 'bg-zinc-800 text-zinc-400 border-zinc-700'}`}>
                      {t.league_tier ? `${t.league_tier}. Lig` : 'Ligsiz'}
                    </span>
                    {t.league_position && <span className="text-[9px] text-zinc-500 ml-1">#{t.league_position}</span>}
                  </td>
                  <td className="px-3 py-3 text-right font-mono text-emerald-400">{formatMoney(t.money)}</td>
                  <td className="px-3 py-3 text-center">
                    <span className="bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded font-bold">{t.player_count}</span>
                  </td>
                  <td className="px-3 py-3 text-center">
                    <span className="bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded font-bold">Lv.{t.level}</span>
                  </td>
                  <td className="px-3 py-3 text-center font-mono text-zinc-400">{t.current_day}</td>
                  <td className="px-3 py-3 text-center">
                    {t.is_bot ? (
                      <span className="px-2 py-0.5 rounded text-[8px] font-black bg-amber-500/10 text-amber-400">BOT</span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[8px] font-black bg-emerald-500/10 text-emerald-400">GERÇEK</span>
                    )}
                  </td>
                  <td className="px-3 py-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button onClick={() => { setSelectedTeam(t); fetchTeamPlayers(t.id); }} className="p-1.5 bg-blue-500/10 text-blue-400 rounded-lg hover:bg-blue-500/20 transition-all" title="Detay & Kadro">
                        <Eye size={12} />
                      </button>
                      <button onClick={() => startEdit(t)} className="p-1.5 bg-amber-500/10 text-amber-400 rounded-lg hover:bg-amber-500/20 transition-all" title="Hızlı Düzenle">
                        <Edit3 size={12} />
                      </button>
                      <button onClick={() => deleteTeam(t.id, t.team_name)} className="p-1.5 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-all" title="Sil">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inline quick edit */}
      {editingTeam && (
        <div className="bg-zinc-900/50 border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-black uppercase tracking-wider text-zinc-400">Hızlı Düzenleme</h3>
            <div className="flex gap-2">
              <button onClick={() => saveEdit(editingTeam)} disabled={saving} className="flex items-center gap-1 px-3 py-1.5 bg-emerald-500 text-white rounded-xl text-[10px] font-bold uppercase hover:bg-emerald-600 transition-all disabled:opacity-50">
                <Save size={12} /> Kaydet
              </button>
              <button onClick={cancelEdit} className="px-3 py-1.5 bg-zinc-800 text-zinc-400 rounded-xl text-[10px] font-bold uppercase hover:bg-zinc-700">
                İptal
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { key: 'money', label: 'Bütçe (€)', type: 'number' },
              { key: 'credits', label: 'Kredi', type: 'number' },
              { key: 'level', label: 'Seviye', type: 'number' },
              { key: 'xp', label: 'XP', type: 'number' },
              { key: 'current_day', label: 'Gün', type: 'number' },
              { key: 'fans', label: 'Taraftar', type: 'number' },
              { key: 'reputation', label: 'İtibar', type: 'number' },
              { key: 'league_tier', label: 'Lig Seviyesi', type: 'number' },
            ].map(field => (
              <div key={field.key}>
                <label className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 block mb-1">{field.label}</label>
                <input type={field.type} value={editValues[field.key] ?? ''} onChange={e => setEditValues(v => ({ ...v, [field.key]: field.type === 'number' ? (parseInt(e.target.value) || 0) : e.target.value }))}
                  className="w-full bg-black border border-white/10 rounded-lg px-3 py-1.5 text-xs" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pagination */}
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
