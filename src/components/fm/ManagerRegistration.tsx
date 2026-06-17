'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
    Shield, 
    Users, 
    Trophy, 
    ArrowRight, 
    Zap, 
    Star, 
    TrendingUp, 
    Building2, 
    Target, 
    Palette,
    User,
    Activity
} from 'lucide-react';
import { useFM } from '@/lib/fm/GameContext';
import { useAuth } from '@/contexts/AuthContext';
import { showToast } from '@/components/fm/ToastNotifications';
import { generateLocalizedPlayer } from '@/lib/fm/region-generator';
import { saveProfile, savePlayers } from '@/lib/fm/persistence';

const PHILOSOPHIES = [
    { id: 'balanced', name: 'DENGELİ', icon: <Target className="text-blue-400" />, desc: 'Her alanda dengeli bir başlangıç. 50M € bütçe, 200 kredi.', bonus: 'Bonus yok' },
    { id: 'youth', name: 'ALTYAPI EKOLÜ', icon: <Building2 className="text-amber-400" />, desc: 'Gelişmiş altyapı tesisleri ile genç yetenek yetiştir.', bonus: 'Lv.3 Akademi' },
    { id: 'squad', name: 'YILDIZLAR KARMASI', icon: <Users className="text-purple-400" />, desc: 'Daha yetenekli başlangıç kadrosu. Tüm oyuncular +10% OVR ve potansiyel.', bonus: '+%10 Kadro Kalitesi' },
    { id: 'reputation', name: 'MARKA DEĞERİ', icon: <Trophy className="text-red-400" />, desc: 'Daha yüksek kulüp itibarı ile başla. Daha iyi sponsorlar ve gelir.', bonus: '+20 İtibar (Toplam 50)' },
];

const COLORS_LIST = [
    { name: 'Beyaz', value: '#ffffff' },
    { name: 'Siyah', value: '#000000' },
    { name: 'Kırmızı', value: '#ef4444' },
    { name: 'Sarı', value: '#facc15' },
    { name: 'Lacivert', value: '#1e3a8a' },
    { name: 'Yeşil', value: '#22c55e' },
    { name: 'Turuncu', value: '#f97316' },
    { name: 'Mor', value: '#a855f7' },
];

// ─── Client-side fallback fonksiyonlar ──────────────────────────────
// API çağrısı başarısız olduğunda (sunucu çökmüş, ağ hatası vb.)
// doğrudan tarayıcıda profil ve oyuncu oluşturur.

function createClientSideProfile(
  userId: string,
  teamName: string,
  managerName: string,
  philosophy: string,
  color1: string,
  color2: string,
) {
  const BASE_MONEY = 50_000_000;
  const BASE_CREDITS = 200;
  const BASE_REPUTATION = 30;
  const BASE_ACADEMY_LEVEL = 1;

  let startReputation = BASE_REPUTATION;
  let startAcademyLevel = BASE_ACADEMY_LEVEL;

  switch (philosophy) {
    case 'youth': startAcademyLevel = 3; break;
    case 'reputation': startReputation += 20; break;
    default: break;
  }

  return {
    id: userId,
    team_name: teamName,
    league_name: '4. Lig',
    manager_name: managerName,
    money: BASE_MONEY,
    credits: BASE_CREDITS,
    level: 1,
    xp: 0,
    fans: 1000,
    current_day: 1,
    ticket_price: 35,
    stadium_capacity: 10000,
    region: 'TR',
    philosophy,
    primary_color: color1,
    secondary_color: color2,
    reputation: startReputation,
    academy_level: startAcademyLevel,
    is_bot: false,
    created_at: new Date().toISOString(),
  };
}

function createClientSidePlayers(
  userId: string,
  teamName: string,
  philosophy: string,
) {
  const squadQualityMod = philosophy === 'squad' ? 1.1 : 1.0;
  const posCounts = { GK: 2, DEF: 8, MID: 7, FWD: 6 };
  const players: any[] = [];

  Object.entries(posCounts).forEach(([pos, count]) => {
    for (let i = 0; i < count; i++) {
      const p = generateLocalizedPlayer('TR', teamName, 4, pos as any);
      players.push({
        ...p,
        rating: Math.min(94, Math.floor(p.rating * squadQualityMod)),
        potential: Math.min(99, Math.floor((p.potential || p.rating + 10) * squadQualityMod)),
        position: pos,
        profile_id: userId,
        team_name: teamName,
      });
    }
  });

  return players;
}

export default function ManagerRegistration() {
  const { setProfile, setSquad, refreshData } = useFM();
  const { user } = useAuth();
  const [managerName, setManagerName] = useState('');
  const [philosophy, setPhilosophy] = useState('balanced');
  const [primaryColor, setPrimaryColor] = useState('#ffffff');
  const [secondaryColor, setSecondaryColor] = useState('#000000');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!managerName.trim()) return;
    if (!user?.id) {
      showToast('Kullanıcı kimliği bulunamadı.', 'error');
      return;
    }
    setLoading(true);
    try {
      // Takım adı artık backend'de rastgele üretiliyor — boş string gönder.
      // Tüm oyuncular SABİT 50M € ve 200 kredi ile başlar.
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          teamName: '', // Rastgele takım adı backend'de üretilir
          managerName: managerName.trim(),
          philosophy,
          color1: primaryColor,
          color2: secondaryColor,
          region: 'TR',
        }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        showToast(data.error || data.message || 'Kayıt sırasında hata oluştu.', 'error');
        setLoading(false);
        return;
      }

      // API'den dönen profil ve oyuncuları context'e yaz
      if (data.profile) {
        setProfile(data.profile);
      }
      if (data.players && data.players.length > 0) {
        setSquad(data.players);
      }

      showToast(`${data.leagueName}'te "${data.profile?.team_name || 'Takım'}" kuruldu!`, 'success');

      // Verileri yeniden yükle (profil + oyuncular Supabase'den)
      await refreshData(user.id);
    } catch (err: any) {
      // API çağrısı başarısız olduysa (sunucu çökmüş veya ağ hatası)
      // client-side fallback: doğrudan client'ta profil ve oyuncu oluştur
      console.warn('[ManagerRegistration] API fetch failed, using client-side fallback:', err?.message);
      try {
        const fallbackProfile = createClientSideProfile(user.id, 'Yeni Kulüp', managerName.trim(), philosophy, primaryColor, secondaryColor);
        const fallbackPlayers = createClientSidePlayers(user.id, 'Yeni Kulüp', philosophy);

        setProfile(fallbackProfile);
        setSquad(fallbackPlayers);

        // localStorage'a kaydet (kalıcılık için)
        saveProfile(fallbackProfile);
        savePlayers(fallbackPlayers, user.id, 'Yeni Kulüp');

        showToast(`4. Lig'de takımın kuruldu! (Çevrimdışı mod)`, 'success');
      } catch (fallbackErr) {
        console.error('[ManagerRegistration] Client-side fallback also failed:', fallbackErr);
        showToast('Kayıt sırasında bir hata oluştu. Lütfen sayfayı yenileyip tekrar deneyin.', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 overflow-hidden relative">
      {/* Layer 1: Vignette — kenarları karartır, kart'a odaklanmayı sağlar */}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          background:
            'radial-gradient(ellipse at center, transparent 0%, transparent 35%, rgba(0,0,0,0.65) 80%, rgba(0,0,0,0.95) 100%)',
        }}
      />

      {/* Layer 2: Saha çizgisi deseni — çok hafif, futbol temalı */}
      <div
        className="absolute inset-0 pointer-events-none z-0 opacity-[0.035]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
          maskImage: 'radial-gradient(ellipse at center, black 30%, transparent 75%)',
          WebkitMaskImage: 'radial-gradient(ellipse at center, black 30%, transparent 75%)',
        }}
      />

      {/* Layer 3: Stadyum ışığı glow'ları — daha dramatik */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-25%] left-[-15%] w-[55%] h-[55%] bg-emerald-600/15 blur-[160px] rounded-full" />
        <div className="absolute bottom-[-25%] right-[-15%] w-[55%] h-[55%] bg-blue-600/15 blur-[160px] rounded-full" />
        <div className="absolute top-[35%] right-[15%] w-[30%] h-[30%] bg-purple-700/10 blur-[140px] rounded-full" />
        <div className="absolute bottom-[35%] left-[10%] w-[28%] h-[28%] bg-cyan-600/10 blur-[140px] rounded-full" />
      </div>

      {/* Layer 4: Üst/alt ince aksan çizgileri — premium his */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent z-0" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent z-0" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 max-w-md w-full bg-zinc-900/95 backdrop-blur-xl border border-white/5 rounded-[3rem] shadow-[0_30px_80px_rgba(0,0,0,0.7),0_0_60px_rgba(16,185,129,0.05)] overflow-hidden"
      >
        {/* Header — logo + başlık */}
        <div className="bg-gradient-to-b from-white/5 to-transparent p-8 flex flex-col items-center border-b border-white/5">
          <img src="/touchline-manager-logo.png" alt="Touchline Manager" className="w-40 h-auto mb-3" />
          <h1 className="text-2xl font-black italic uppercase tracking-tighter text-white">
            Touchline Manager
          </h1>
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/30 mt-2">
            Menajerlik Simülasyonu
          </p>
        </div>

        <div className="p-8 space-y-6">
          <div className="space-y-2 text-center">
            <h2 className="text-xl font-black text-white">Hoş Geldin, Menajer!</h2>
            <p className="text-xs text-white/40 leading-relaxed">
              Sana rastgele bir kulüp, 50M € bütçe ve 200 kredi verilecek.
              Sadece adını gir, gerisini biz hallederiz.
            </p>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-white/30 ml-2">
                <User size={12} /> Adın Soyadın
              </label>
              <input
                type="text"
                value={managerName}
                onChange={(e) => setManagerName(e.target.value)}
                placeholder="örn: Selim Porsuk"
                className="w-full bg-black/50 border border-white/10 rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:border-white/30 transition-all placeholder:text-white/10"
              />
            </div>

            {user?.email && (
              <div className="flex items-center gap-2 px-4 py-3 bg-white/5 rounded-2xl border border-white/5">
                <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Hesap:</span>
                <span className="text-xs text-white/60">{user.email}</span>
              </div>
            )}

            {/* Renk seçimi — opsiyonel kişiselleştirme */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-white/30 ml-2">
                <Palette size={12} /> Birinci Renk
              </label>
              <div className="flex flex-wrap gap-2">
                {COLORS_LIST.map(c => (
                  <button
                    key={`p-${c.value}`}
                    onClick={() => setPrimaryColor(c.value)}
                    className={`group relative w-10 h-10 rounded-xl transition-all ${primaryColor === c.value ? 'scale-110 ring-2 ring-white ring-offset-4 ring-offset-zinc-900 shadow-xl' : 'opacity-40 hover:opacity-100 hover:scale-105'}`}
                    style={{ backgroundColor: c.value }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
                    {primaryColor === c.value && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-1.5 h-1.5 bg-black rounded-full" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Felsefe — sadece para/kredi DIŞI bonuslar uygulanır */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-white/30 ml-2">
                <Target size={12} /> Başlangıç Felsefesi (opsiyonel)
              </label>
              <div className="grid grid-cols-2 gap-2">
                {PHILOSOPHIES.map(p => (
                  <button
                    key={p.id}
                    onClick={() => setPhilosophy(p.id)}
                    className={`p-3 rounded-2xl border transition-all text-left flex flex-col gap-1 ${philosophy === p.id ? 'bg-white border-white' : 'bg-black/40 border-white/5 hover:border-white/20'}`}
                  >
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center mb-1 ${philosophy === p.id ? 'bg-black' : 'bg-white/5'}`}>
                      {React.cloneElement(p.icon as React.ReactElement, { size: 12, className: philosophy === p.id ? 'text-white' : (p.icon as React.ReactElement).props.className })}
                    </div>
                    <div className={`text-[9px] font-black uppercase tracking-widest ${philosophy === p.id ? 'text-black' : 'text-white'}`}>{p.name}</div>
                    <div className={`text-[7px] font-bold uppercase ${philosophy === p.id ? 'text-black/40' : 'text-emerald-400'}`}>{p.bonus}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            disabled={!managerName || loading}
            onClick={handleSubmit}
            className="w-full h-14 bg-white text-black rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:translate-y-[-2px] active:translate-y-0 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Activity className="animate-spin" size={16} />
            ) : (
              <>KULÜBÜ DEVRAL VE BAŞLA <Zap size={16} /></>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
