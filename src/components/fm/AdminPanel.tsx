'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Shield, Users, Trophy, Wallet, Zap, Trash2, Edit3, Save, Search } from 'lucide-react';
import { useFM } from '@/lib/fm/GameContext';
import { isSupabaseConfigured, getSupabase } from '@/lib/supabase';

export default function AdminPanel() {
  const { profile, setProfile, squad, setSquad, authEmail, isAdmin } = useFM();
  const [activeTab, setActiveTab] = useState<'overview' | 'squad' | 'league'>('overview');

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

  const handleUpdateBudget = (amount: number) => {
    setProfile((prev: any) => ({ ...prev, money: amount }));
    alert('Bütçe Güncellendi: ' + amount.toLocaleString() + ' TL');
  };

  const handleUpdateXp = (amount: number) => {
    setProfile((prev: any) => ({ ...prev, xp: amount, level: Math.floor(amount / 1000) + 1 }));
    alert('XP Güncellendi');
  };

  const handleNukeData = async () => {
    if (!confirm('TÜM VERİLERİNİZİ SİLMEK ÜZERESİNİZ. Emin misiniz?')) return;
    
    // Nuke from Supbase if possible
    if (isSupabaseConfigured()) {
      const supabase = getSupabase();
      await supabase?.from('players').delete().eq('profile_id', profile.id);
      await supabase?.from('match_history').delete().eq('user_id', profile.id);
      await supabase?.from('profiles').delete().eq('id', profile.id);
    }
    
    // Nuke local
    localStorage.clear();
    window.location.reload();
  };

  const handleSimulateWeek = async () => {
    setProfile((prev: any) => ({ ...prev, current_day: (prev.current_day || 0) + 7 }));
    alert('Zaman 7 gün ileri alındı. Ekonomik işlemler işlendi.');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-zinc-900/50 p-6 rounded-3xl border border-white/5">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center">
            <Shield size={24} className="text-black" />
          </div>
          <div>
            <h1 className="text-xl font-black italic uppercase tracking-tighter">Admin Kontrol Paneli</h1>
            <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest">Sistem üzerinde tam yetki.</p>
          </div>
        </div>

        <div className="flex gap-2">
          {['overview', 'squad', 'league'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${
                activeTab === tab ? 'bg-white text-black' : 'bg-white/5 text-white/40 hover:bg-white/10'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Statistics and Instant Edits */}
        <div className="col-span-1 space-y-6">
          <div className="bg-zinc-900/50 p-6 rounded-3xl border border-white/10">
            <h3 className="text-xs font-black uppercase tracking-widest text-white/40 mb-6 flex items-center gap-2">
              <Wallet size={14} className="text-emerald-400"/> Hızlı Düzenleme
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-white/20 uppercase block mb-2">Bütçe Ayarla (TL)</label>
                <div className="flex gap-2">
                  <input 
                    type="number"
                    defaultValue={profile?.money}
                    id="admin_budget"
                    className="flex-1 bg-black border border-white/10 rounded-xl px-4 py-2 text-xs font-black"
                  />
                  <button 
                    onClick={() => {
                      const val = (document.getElementById('admin_budget') as HTMLInputElement).value;
                      handleUpdateBudget(parseInt(val));
                    }}
                    className="p-2 bg-emerald-500 rounded-xl text-black hover:bg-emerald-400 transition-all"
                  >
                    <Save size={18} />
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-white/20 uppercase block mb-2">XP / Seviye</label>
                <div className="flex gap-2">
                  <input 
                    type="number"
                    defaultValue={profile?.xp}
                    id="admin_xp"
                    className="flex-1 bg-black border border-white/10 rounded-xl px-4 py-2 text-xs font-black"
                  />
                  <button 
                    onClick={() => {
                      const val = (document.getElementById('admin_xp') as HTMLInputElement).value;
                      handleUpdateXp(parseInt(val));
                    }}
                    className="p-2 bg-blue-500 rounded-xl text-white hover:bg-blue-400 transition-all"
                  >
                    <Save size={18} />
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-white/20 uppercase block mb-2">💰 Kredi</label>
                <div className="flex gap-2">
                  <input 
                    type="number"
                    defaultValue={profile?.credits}
                    id="admin_mg"
                    className="flex-1 bg-black border border-white/10 rounded-xl px-4 py-2 text-xs font-black"
                  />
                  <button 
                    onClick={() => {
                      const val = (document.getElementById('admin_mg') as HTMLInputElement).value;
                      setProfile((p: any) => ({ ...p, credits: parseInt(val) }));
                    }}
                    className="p-2 bg-amber-500 rounded-xl text-black"
                  >
                    <Save size={18} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="col-span-1 md:col-span-2">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-emerald-500/10 border border-emerald-500/20 p-8 rounded-3xl flex flex-col items-center text-center">
                <Users size={32} className="text-emerald-400 mb-4" />
                <h4 className="text-2xl font-black text-white">{squad.length}</h4>
                <p className="text-[10px] font-bold text-emerald-400/60 uppercase tracking-widest mt-2">Aktif Oyuncu</p>
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
                    <button 
                      onClick={handleSimulateWeek}
                      className="px-3 py-1 bg-blue-500/20 text-blue-400 text-[10px] font-black rounded-lg border border-blue-500/30 hover:bg-blue-500 hover:text-white transition-all"
                    >
                      + 7 GÜN SİMÜLE ET
                    </button>
                  </div>
                  <div className="flex justify-between items-center py-2 text-red-500">
                    <span className="text-[10px] font-bold uppercase">Kritik Reset</span>
                    <button 
                      onClick={handleNukeData}
                      className="px-3 py-1 bg-red-600 text-white text-[10px] font-black rounded-lg hover:bg-red-700 transition-all shadow-lg"
                    >
                      <Trash2 size={12} className="inline mr-1" /> TÜM HESABI SIFIRLA (NUKE)
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'squad' && (
            <div className="bg-zinc-900/50 rounded-3xl border border-white/10 overflow-hidden">
               <div className="p-4 bg-zinc-800/50 border-b border-white/5 flex justify-between items-center">
                 <h3 className="text-[10px] font-black uppercase text-white/40">Kadro Yönetimi</h3>
                 <button 
                  onClick={() => {
                    const confirmResp = confirm('Tüm kadroyu silmek istediğinizden emin misiniz?');
                    if (confirmResp) setSquad([]);
                  }}
                  className="flex items-center gap-2 text-[10px] font-black text-red-500 hover:text-red-400"
                 >
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
                         <p className="text-[8px] font-bold text-white/20 uppercase">{(p as any).specificPosition || (p as any).specific_position || p.position} • {p.rating} REY</p>
                       </div>
                     </div>
                     <div className="flex gap-2">
                        <button className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-white/40"><Edit3 size={14}/></button>
                        <button 
                          onClick={() => setSquad(prev => prev.filter(pl => pl.id !== p.id))}
                          className="p-2 bg-red-500/10 hover:bg-red-500/20 rounded-lg text-red-500"
                        ><Trash2 size={14}/></button>
                     </div>
                   </div>
                 ))}
               </div>
            </div>
          )}

          {activeTab === 'league' && (
            <div className="bg-zinc-900/50 rounded-3xl border border-white/10 overflow-hidden">
               <div className="p-4 bg-zinc-800/50 border-b border-white/5 flex justify-between items-center">
                 <h3 className="text-[10px] font-black uppercase text-white/40">Lig & Fikstür Yönetimi</h3>
                 <div className="flex gap-2">
                   <button className="px-3 py-1 bg-amber-500 text-black text-[9px] font-black uppercase rounded-lg">Fikstür Çek</button>
                   <button className="px-3 py-1 bg-blue-500 text-white text-[9px] font-black uppercase rounded-lg">Tümünü Simüle Et</button>
                 </div>
               </div>
               <div className="p-8 flex flex-col items-center justify-center text-center opacity-40">
                  <Trophy size={48} className="mb-4" />
                  <p className="text-[10px] font-bold uppercase tracking-widest">Lig verileri Supabase üzerinden yönetilmektedir.</p>
                  <p className="text-[8px] mt-2">Admin olarak tüm takımların puan durumlarını ve maç sonuçlarını buradan manuel olarak override edebilirsiniz (Yakında).</p>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
