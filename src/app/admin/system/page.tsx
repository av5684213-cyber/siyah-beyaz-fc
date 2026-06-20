'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  Database, RefreshCw, Play, Trash2, AlertTriangle,
  Clock, ChevronLeft, ChevronRight, Lock, Unlock, Zap
} from 'lucide-react';

interface CronJob {
  name: string;
  description: string;
  endpoint: string;
}

interface ErrorLog {
  id: string;
  error_message: string;
  route: string;
  method: string;
  level: string;
  created_at: string;
  user_id: string;
}

interface CronLock {
  id: string;
  job_name: string;
  locked_at: string;
  locked_by: string;
  expires_at: string;
}

export default function AdminSystemPage() {
  const { user } = useAuth();
  const [cronJobs, setCronJobs] = useState<CronJob[]>([]);
  const [errorCount, setErrorCount] = useState(0);
  const [logs, setLogs] = useState<ErrorLog[]>([]);
  const [logTotal, setLogTotal] = useState(0);
  const [logPage, setLogPage] = useState(1);
  const [cronLocks, setCronLocks] = useState<CronLock[]>([]);
  const [activeTab, setActiveTab] = useState<'cron' | 'logs' | 'locks'>('cron');
  const [loading, setLoading] = useState(true);
  const [triggering, setTriggering] = useState<string | null>(null);
  const [triggerResult, setTriggerResult] = useState<string | null>(null);

  const headers = { 'x-admin-user-id': user?.id || '' };

  const fetchOverview = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/system?section=overview', { headers });
      if (!res.ok) throw new Error('Veri alınamadı');
      const data = await res.json();
      setCronJobs(data.cronJobs || []);
      setErrorCount(data.errorCount || 0);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [user?.id, user?.email]);

  const fetchLogs = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/system?section=logs&page=${logPage}&limit=30`, { headers });
      if (!res.ok) throw new Error('Loglar alınamadı');
      const data = await res.json();
      setLogs(data.logs || []);
      setLogTotal(data.total || 0);
    } catch (err) { console.error(err); }
  }, [logPage, user?.id, user?.email]);

  const fetchLocks = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/system?section=cron_locks', { headers });
      if (!res.ok) throw new Error('Kilitler alınamadı');
      const data = await res.json();
      setCronLocks(data.locks || []);
    } catch (err) { console.error(err); }
  }, [user?.id, user?.email]);

  useEffect(() => { fetchOverview(); }, [fetchOverview]);
  useEffect(() => { if (activeTab === 'logs') fetchLogs(); }, [activeTab, fetchLogs]);
  useEffect(() => { if (activeTab === 'locks') fetchLocks(); }, [activeTab, fetchLocks]);

  const triggerCron = async (job: CronJob) => {
    setTriggering(job.name);
    setTriggerResult(null);
    try {
      const res = await fetch('/api/admin/system', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...headers },
        body: JSON.stringify({ action: 'trigger_cron', endpoint: job.endpoint }),
      });
      const data = await res.json();
      setTriggerResult(`[${job.name}] ${data.success ? '✓ Başarılı' : '✗ Başarısız'}: ${data.response || data.error || ''}`);
    } catch (err: any) {
      setTriggerResult(`[${job.name}] ✗ Hata: ${err.message}`);
    } finally {
      setTriggering(null);
    }
  };

  const clearLogs = async () => {
    if (!confirm('Tüm hata loglarını silmek istediğinize emin misiniz?')) return;
    try {
      await fetch('/api/admin/system', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...headers },
        body: JSON.stringify({ action: 'clear_logs' }),
      });
      setLogs([]);
      setLogTotal(0);
      setErrorCount(0);
    } catch (err) { console.error(err); }
  };

  const clearLocks = async () => {
    if (!confirm('Tüm cron kilitlerini temizlemek istediğinize emin misiniz?')) return;
    try {
      await fetch('/api/admin/system', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...headers },
        body: JSON.stringify({ action: 'clear_cron_locks' }),
      });
      setCronLocks([]);
    } catch (err) { console.error(err); }
  };

  const tabs = [
    { key: 'cron' as const, label: 'Cron Jobs', icon: Clock },
    { key: 'logs' as const, label: `Hata Logları (${errorCount})`, icon: AlertTriangle },
    { key: 'locks' as const, label: 'Cron Kilitleri', icon: Lock },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tighter">Sistem Yönetimi</h1>
          <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mt-1">Cron jobs, veritabanı, loglar</p>
        </div>
        <button onClick={() => { fetchOverview(); if (activeTab === 'logs') fetchLogs(); if (activeTab === 'locks') fetchLocks(); }}
          className="p-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all">
          <RefreshCw size={14} />
        </button>
      </div>

      {/* Tab navigation */}
      <div className="flex gap-2">
        {tabs.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === tab.key ? 'bg-white text-black' : 'bg-white/5 text-white/40 hover:bg-white/10'
            }`}>
            <tab.icon size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Trigger result */}
      {triggerResult && (
        <div className="bg-zinc-900 border border-white/10 rounded-xl p-4 font-mono text-xs text-zinc-300">
          {triggerResult}
        </div>
      )}

      {/* Cron Jobs Tab */}
      {activeTab === 'cron' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {cronJobs.map(job => (
            <div key={job.name} className="bg-zinc-900/50 border border-white/5 rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-wider">{job.name}</p>
                <p className="text-[10px] text-zinc-500 mt-0.5">{job.description}</p>
                <p className="text-[9px] text-zinc-700 font-mono mt-1">{job.endpoint}</p>
              </div>
              <button
                onClick={() => triggerCron(job)}
                disabled={triggering === job.name}
                className="flex items-center gap-1 px-3 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-[10px] font-bold text-emerald-400 hover:bg-emerald-500/20 transition-all disabled:opacity-50"
              >
                <Play size={12} className={triggering === job.name ? 'animate-pulse' : ''} />
                Tetikle
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Error Logs Tab */}
      {activeTab === 'logs' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-zinc-400">{logTotal} kayıt</p>
            <button onClick={clearLogs} className="flex items-center gap-1 px-3 py-1.5 bg-red-500/10 border border-red-500/20 rounded-xl text-[10px] font-bold text-red-400 hover:bg-red-500/20 transition-all">
              <Trash2 size={12} /> Tümünü Sil
            </button>
          </div>
          <div className="space-y-2">
            {logs.map(log => (
              <div key={log.id} className="bg-zinc-900/50 border border-white/5 rounded-xl p-3">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase ${log.level === 'error' ? 'bg-red-500/10 text-red-400' : 'bg-amber-500/10 text-amber-400'}`}>{log.level}</span>
                    <span className="text-[10px] font-mono text-zinc-500">{log.method} {log.route}</span>
                  </div>
                  <span className="text-[9px] text-zinc-600 font-mono">{new Date(log.created_at).toLocaleString('tr-TR')}</span>
                </div>
                <p className="text-xs text-zinc-300 font-mono break-all">{log.error_message}</p>
                {log.user_id && <p className="text-[9px] text-zinc-600 mt-1">User: {log.user_id}</p>}
              </div>
            ))}
          </div>
          {Math.ceil(logTotal / 30) > 1 && (
            <div className="flex items-center justify-center gap-2">
              <button onClick={() => setLogPage(p => Math.max(1, p - 1))} disabled={logPage === 1} className="p-2 bg-white/5 rounded-xl disabled:opacity-30"><ChevronLeft size={16} /></button>
              <span className="text-xs font-bold text-zinc-400">{logPage} / {Math.ceil(logTotal / 30)}</span>
              <button onClick={() => setLogPage(p => p + 1)} disabled={logPage >= Math.ceil(logTotal / 30)} className="p-2 bg-white/5 rounded-xl disabled:opacity-30"><ChevronRight size={16} /></button>
            </div>
          )}
        </div>
      )}

      {/* Cron Locks Tab */}
      {activeTab === 'locks' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-zinc-400">{cronLocks.length} aktif kilit</p>
            <button onClick={clearLocks} className="flex items-center gap-1 px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-[10px] font-bold text-amber-400 hover:bg-amber-500/20 transition-all">
              <Unlock size={12} /> Tümünü Temizle
            </button>
          </div>
          {cronLocks.length === 0 ? (
            <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-8 text-center">
              <Unlock size={32} className="text-zinc-700 mx-auto mb-2" />
              <p className="text-zinc-500 text-xs">Aktif cron kilidi yok</p>
            </div>
          ) : (
            <div className="space-y-2">
              {cronLocks.map(lock => (
                <div key={lock.id} className="bg-zinc-900/50 border border-white/5 rounded-xl p-3 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold">{lock.job_name}</p>
                    <p className="text-[9px] text-zinc-500 font-mono">Kilit: {new Date(lock.locked_at).toLocaleString('tr-TR')}</p>
                    <p className="text-[9px] text-zinc-600 font-mono">Son: {new Date(lock.expires_at).toLocaleString('tr-TR')}</p>
                  </div>
                  <Lock size={16} className="text-amber-400" />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
