'use client';

import React, { useEffect, useState } from 'react';
import {
  Users, UserCircle, Trophy, Swords, Database,
  DollarSign, TrendingUp, Activity, AlertTriangle,
  RefreshCw, CheckCircle2, XCircle, Clock, Zap
} from 'lucide-react';
import Link from 'next/link';

interface AdminStats {
  totalUsers: number;
  totalPlayers: number;
  totalMatches: number;
  totalLeagues: number;
  totalFixtures: number;
  totalTransferListings: number;
  totalBotTeams: number;
  totalHumanTeams: number;
  avgRating: number;
  totalMoney: number;
  errorCount: number;
  recentUsers: Array<{ id: string; manager_name: string; team_name: string; money: number; league_name: string; role: string }>;
  systemHealth: { db: boolean; realtime: boolean; cron: boolean };
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/stats');
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'İstatistikler alınamadı');
      }
      const data = await res.json();
      setStats(data);
      setLastRefresh(new Date());
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStats(); }, []);

  const statCards = stats ? [
    { label: 'Toplam Kullanıcı', value: stats.totalUsers, icon: Users, color: 'blue', href: '/admin/users' },
    { label: 'Toplam Oyuncu', value: stats.totalPlayers, icon: UserCircle, color: 'emerald', href: '/admin/players' },
    { label: 'Toplam Maç', value: stats.totalFixtures, icon: Swords, color: 'amber', href: '/admin/matches' },
    { label: 'Lig Sayısı', value: stats.totalLeagues, icon: Trophy, color: 'purple', href: '/admin/leagues' },
    { label: 'Transfer İlanı', value: stats.totalTransferListings, icon: DollarSign, color: 'cyan' },
    { label: 'Ort. Rating', value: stats.avgRating.toFixed(1), icon: TrendingUp, color: 'orange' },
    { label: 'Bot Takım', value: stats.totalBotTeams, icon: Activity, color: 'rose' },
    { label: 'Hata Kaydı', value: stats.errorCount, icon: AlertTriangle, color: 'red' },
  ] : [];

  const colorMap: Record<string, string> = {
    blue: 'from-blue-500/10 to-blue-500/5 border-blue-500/20 text-blue-400',
    emerald: 'from-emerald-500/10 to-emerald-500/5 border-emerald-500/20 text-emerald-400',
    amber: 'from-amber-500/10 to-amber-500/5 border-amber-500/20 text-amber-400',
    purple: 'from-purple-500/10 to-purple-500/5 border-purple-500/20 text-purple-400',
    cyan: 'from-cyan-500/10 to-cyan-500/5 border-cyan-500/20 text-cyan-400',
    orange: 'from-orange-500/10 to-orange-500/5 border-orange-500/20 text-orange-400',
    rose: 'from-rose-500/10 to-rose-500/5 border-rose-500/20 text-rose-400',
    red: 'from-red-500/10 to-red-500/5 border-red-500/20 text-red-400',
  };

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-3 border-white/10 border-t-red-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-8 text-center">
        <AlertTriangle size={48} className="text-red-500 mx-auto mb-4" />
        <p className="text-red-400 font-bold">{error}</p>
        <button onClick={fetchStats} className="mt-4 px-4 py-2 bg-red-500 text-white rounded-xl text-xs font-bold uppercase">
          Tekrar Dene
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tighter">Gösterge Paneli</h1>
          <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mt-1">
            Sistem geneli istatistikler ve hızlı erişim
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-zinc-600 font-mono">
            Son: {lastRefresh.toLocaleTimeString('tr-TR')}
          </span>
          <button
            onClick={fetchStats}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-bold uppercase hover:bg-white/10 transition-all disabled:opacity-50"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Yenile
          </button>
        </div>
      </div>

      {/* System Health */}
      {stats && (
        <div className="grid grid-cols-3 gap-3">
          <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${stats.systemHealth.db ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-red-500/5 border-red-500/20'}`}>
            {stats.systemHealth.db ? <CheckCircle2 size={16} className="text-emerald-400" /> : <XCircle size={16} className="text-red-400" />}
            <div>
              <p className="text-[9px] text-zinc-500 font-bold uppercase">Veritabanı</p>
              <p className={`text-xs font-black ${stats.systemHealth.db ? 'text-emerald-400' : 'text-red-400'}`}>
                {stats.systemHealth.db ? 'Aktif' : 'Hata'}
              </p>
            </div>
          </div>
          <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${stats.systemHealth.realtime ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-amber-500/5 border-amber-500/20'}`}>
            {stats.systemHealth.realtime ? <CheckCircle2 size={16} className="text-emerald-400" /> : <Clock size={16} className="text-amber-400" />}
            <div>
              <p className="text-[9px] text-zinc-500 font-bold uppercase">Realtime</p>
              <p className={`text-xs font-black ${stats.systemHealth.realtime ? 'text-emerald-400' : 'text-amber-400'}`}>
                {stats.systemHealth.realtime ? 'Aktif' : 'Kontrol'}
              </p>
            </div>
          </div>
          <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${stats.systemHealth.cron ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-amber-500/5 border-amber-500/20'}`}>
            {stats.systemHealth.cron ? <CheckCircle2 size={16} className="text-emerald-400" /> : <Clock size={16} className="text-amber-400" />}
            <div>
              <p className="text-[9px] text-zinc-500 font-bold uppercase">Cron Jobs</p>
              <p className={`text-xs font-black ${stats.systemHealth.cron ? 'text-emerald-400' : 'text-amber-400'}`}>
                {stats.systemHealth.cron ? 'Çalışıyor' : 'Bekliyor'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {statCards.map((card, i) => {
          const colorClass = colorMap[card.color] || colorMap.blue;
          const Wrapper = card.href ? Link : 'div';
          return (
            <Wrapper
              key={i}
              href={(card.href as any) || '#'}
              className={`bg-gradient-to-br ${colorClass} border rounded-2xl p-4 transition-all hover:scale-[1.02] ${card.href ? 'cursor-pointer' : ''}`}
            >
              <div className="flex items-center justify-between mb-3">
                <card.icon size={18} className="opacity-60" />
              </div>
              <p className="text-2xl font-black">{card.value?.toLocaleString('tr-TR')}</p>
              <p className="text-[9px] font-bold uppercase tracking-widest mt-1 opacity-60">{card.label}</p>
            </Wrapper>
          );
        })}
      </div>

      {/* Quick Actions + Recent Users */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6">
          <h2 className="text-sm font-black uppercase tracking-wider text-zinc-400 mb-4 flex items-center gap-2">
            <Zap size={14} className="text-amber-400" /> Hızlı İşlemler
          </h2>
          <div className="grid grid-cols-2 gap-2">
            <Link href="/admin/system" className="px-4 py-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-xs font-bold text-blue-400 hover:bg-blue-500/20 transition-all text-center">
              Cron Tetikle
            </Link>
            <Link href="/admin/system" className="px-4 py-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs font-bold text-emerald-400 hover:bg-emerald-500/20 transition-all text-center">
              DB Migration
            </Link>
            <Link href="/admin/players" className="px-4 py-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs font-bold text-amber-400 hover:bg-amber-500/20 transition-all text-center">
              Oyuncu Yenile
            </Link>
            <Link href="/admin/system" className="px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs font-bold text-red-400 hover:bg-red-500/20 transition-all text-center">
              Hata Logları
            </Link>
          </div>
        </div>

        {/* Recent Users */}
        <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6">
          <h2 className="text-sm font-black uppercase tracking-wider text-zinc-400 mb-4 flex items-center gap-2">
            <Users size={14} className="text-blue-400" /> Son Kullanıcılar
          </h2>
          {stats?.recentUsers && stats.recentUsers.length > 0 ? (
            <div className="space-y-2">
              {stats.recentUsers.map(user => (
                <div key={user.id} className="flex items-center justify-between px-3 py-2 bg-zinc-800/50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black ${user.role === 'admin' ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'}`}>
                      {user.role === 'admin' ? 'A' : 'U'}
                    </div>
                    <div>
                      <p className="text-xs font-bold">{user.manager_name}</p>
                      <p className="text-[10px] text-zinc-500">{user.team_name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-mono text-emerald-400">{(user.money || 0).toLocaleString('tr-TR')} €</p>
                    <p className="text-[9px] text-zinc-600">{user.league_name}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-zinc-600 text-xs">Kullanıcı bulunamadı</p>
          )}
        </div>
      </div>
    </div>
  );
}
