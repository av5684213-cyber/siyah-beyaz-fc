'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Settings, Palette, Bell, Volume2, Globe, Save, Sun, Moon, Contrast } from 'lucide-react';
import Link from 'next/link';
import { useFM } from '@/lib/fm/GameContext';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import { showToast } from '@/components/fm/ToastNotifications';
import NotificationCategorySettings from '@/components/fm/NotificationCategorySettings';
import TeamColorPicker from '@/components/fm/TeamColorPicker';
import { applyTeamColors } from '@/lib/fm/themeSystem';

const LANGUAGES = [
  { code: 'tr', label: 'Türkçe', active: true },
  { code: 'en', label: 'English', active: false },
  { code: 'de', label: 'Deutsch', active: false },
  { code: 'es', label: 'Español', active: false },
  { code: 'fr', label: 'Français', active: false },
  { code: 'ar', label: 'العربية', active: false },
];

export default function SettingsPage() {
  const { profile, setProfile } = useFM();

  // Team Name
  const [teamName, setTeamName] = useState(profile?.team_name || '');

  // Team Colors
  const [primaryColor, setPrimaryColor] = useState(profile?.primary_color || '#000000');
  const [secondaryColor, setSecondaryColor] = useState(profile?.secondary_color || '#ffffff');

  // Notification Preferences
  const [pushEnabled, setPushEnabled] = useState(true);

  // Sound Effects
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Language
  const [language, setLanguage] = useState('tr');

  // Theme
  const [currentTheme, setCurrentTheme] = useState<string>('dark');

  // Saving states
  const [savingTeam, setSavingTeam] = useState(false);
  const [savingColors, setSavingColors] = useState(false);

  // Load localStorage values on mount
  useEffect(() => {
    const storedPush = localStorage.getItem('fm_push_enabled');
    const storedSound = localStorage.getItem('fm_sound_enabled');
    const storedTheme = localStorage.getItem('sb-fc-theme');
    if (storedPush !== null) setPushEnabled(storedPush === 'true');
    if (storedSound !== null) setSoundEnabled(storedSound === 'true');
    if (storedTheme) setCurrentTheme(storedTheme);
  }, []);

  // Sync profile values when profile loads
  useEffect(() => {
    if (profile) {
      setTeamName(profile.team_name || '');
      setPrimaryColor(profile.primary_color || '#000000');
      setSecondaryColor(profile.secondary_color || '#ffffff');
    }
  }, [profile]);

  // ── Save handlers ──

  const handleSaveTeamName = async () => {
    if (!profile) return;
    if (!teamName.trim()) {
      showToast('Takım adı boş olamaz.', 'error');
      return;
    }
    setSavingTeam(true);
    try {
      setProfile((prev: any) => ({ ...prev, team_name: teamName.trim() }));

      // Also update localStorage
      try {
        const stored = localStorage.getItem('fm_profile');
        if (stored) {
          const parsed = JSON.parse(stored);
          parsed.team_name = teamName.trim();
          localStorage.setItem('fm_profile', JSON.stringify(parsed));
        }
      } catch {}

      // Update Supabase
      if (isSupabaseConfigured()) {
        const supabase = getSupabase();
        if (supabase) {
          const { error } = await supabase
            .from('profiles')
            .update({ team_name: teamName.trim() })
            .eq('id', profile.id);
          if (error) throw error;
        }
      }

      showToast('Takım adı güncellendi!', 'success');
    } catch (err) {
      console.error('Takım adı kaydedilemedi:', err);
      showToast('Takım adı kaydedilemedi.', 'error');
    } finally {
      setSavingTeam(false);
    }
  };

  const handleSaveColors = async () => {
    if (!profile) return;
    setSavingColors(true);
    try {
      setProfile((prev: any) => ({
        ...prev,
        primary_color: primaryColor,
        secondary_color: secondaryColor,
      }));

      // Also update localStorage
      try {
        const stored = localStorage.getItem('fm_profile');
        if (stored) {
          const parsed = JSON.parse(stored);
          parsed.primary_color = primaryColor;
          parsed.secondary_color = secondaryColor;
          localStorage.setItem('fm_profile', JSON.stringify(parsed));
        }
      } catch {}

      // Update Supabase
      if (isSupabaseConfigured()) {
        const supabase = getSupabase();
        if (supabase) {
          const { error } = await supabase
            .from('profiles')
            .update({ primary_color: primaryColor, secondary_color: secondaryColor })
            .eq('id', profile.id);
          if (error) throw error;
        }
      }

      showToast('Takım renkleri güncellendi!', 'success');
      
      // Apply team colors to CSS variables immediately
      applyTeamColors({ primary: primaryColor, secondary: secondaryColor });
    } catch (err) {
      console.error('Renkler kaydedilemedi:', err);
      showToast('Renkler kaydedilemedi.', 'error');
    } finally {
      setSavingColors(false);
    }
  };

  const handleTogglePush = (enabled: boolean) => {
    setPushEnabled(enabled);
    localStorage.setItem('fm_push_enabled', String(enabled));
    showToast(enabled ? 'Bildirimler açıldı' : 'Bildirimler kapatıldı', 'info');
  };

  const handleToggleSound = (enabled: boolean) => {
    setSoundEnabled(enabled);
    localStorage.setItem('fm_sound_enabled', String(enabled));
    showToast(enabled ? 'Ses efektleri açıldı' : 'Ses efektleri kapatıldı', 'info');
  };

  // ── Toggle Switch Component ──
  const ToggleSwitch = ({
    enabled,
    onToggle,
  }: {
    enabled: boolean;
    onToggle: (val: boolean) => void;
  }) => (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      onClick={() => onToggle(!enabled)}
      className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 focus-visible:ring-offset-black ${
        enabled ? 'bg-amber-500' : 'bg-zinc-700'
      }`}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-200 ${
          enabled ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );

  // ── Card wrapper ──
  const SettingCard = ({
    icon,
    title,
    children,
  }: {
    icon: React.ReactNode;
    title: string;
    children: React.ReactNode;
  }) => (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 sm:p-6"
    >
      <div className="flex items-center gap-3 mb-5">
        <div className="text-amber-500">{icon}</div>
        <h3 className="text-sm font-black text-white uppercase tracking-tight">{title}</h3>
      </div>
      {children}
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-30 bg-black/80 backdrop-blur-xl border-b border-zinc-800"
      >
        <div className="max-w-2xl mx-auto flex items-center gap-4 px-4 py-4">
          <Link
            href="/"
            className="flex items-center justify-center w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 text-white/60 hover:text-white hover:border-zinc-600 transition-colors"
            aria-label="Geri dön"
          >
            <ArrowLeft size={20} />
          </Link>
          <div className="flex items-center gap-3">
            <Settings size={22} className="text-amber-500" />
            <h1 className="text-lg font-black uppercase tracking-tight">Ayarlar</h1>
          </div>
        </div>
      </motion.header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-5">
        {/* ── Team Name ── */}
        <SettingCard icon={<Palette size={18} />} title="Takım Adı">
          <div className="space-y-3">
            <input
              type="text"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              placeholder="Takım adını gir..."
              maxLength={50}
              className="w-full bg-black border border-zinc-700 rounded-xl px-4 py-3 text-sm font-bold text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-500/50 transition-colors"
            />
            <button
              onClick={handleSaveTeamName}
              disabled={savingTeam || teamName === profile?.team_name}
              className="w-full py-3 bg-amber-500 text-black font-black uppercase tracking-widest rounded-xl
                hover:bg-amber-400 active:scale-[0.98] transition-all flex items-center justify-center gap-2
                disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Save size={16} />
              {savingTeam ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
          </div>
        </SettingCard>

        {/* ── Team Colors ── */}
        <SettingCard icon={<Palette size={18} />} title="Takım Renkleri">
          <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Primary Color */}
              <div>
                <label className="text-[11px] font-bold text-zinc-400 uppercase block mb-2">
                  Ana Renk
                </label>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <input
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-11 h-11 rounded-xl border-2 border-zinc-700 cursor-pointer appearance-none bg-transparent [&::-webkit-color-swatch-wrapper]:p-0.5 [&::-webkit-color-swatch]:rounded-lg [&::-webkit-color-swatch]:border-none"
                    />
                  </div>
                  <input
                    type="text"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="flex-1 bg-black border border-zinc-700 rounded-xl px-3 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-amber-500/50 transition-colors"
                    maxLength={7}
                  />
                </div>
              </div>

              {/* Secondary Color */}
              <div>
                <label className="text-[11px] font-bold text-zinc-400 uppercase block mb-2">
                  İkincil Renk
                </label>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <input
                      type="color"
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      className="w-11 h-11 rounded-xl border-2 border-zinc-700 cursor-pointer appearance-none bg-transparent [&::-webkit-color-swatch-wrapper]:p-0.5 [&::-webkit-color-swatch]:rounded-lg [&::-webkit-color-swatch]:border-none"
                    />
                  </div>
                  <input
                    type="text"
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    className="flex-1 bg-black border border-zinc-700 rounded-xl px-3 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-amber-500/50 transition-colors"
                    maxLength={7}
                  />
                </div>
              </div>
            </div>

            {/* Preview */}
            <div className="p-4 bg-black/60 rounded-xl border border-zinc-800">
              <p className="text-[10px] text-zinc-500 uppercase font-bold mb-3">Önizleme</p>
              <div className="flex items-center gap-4">
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center shadow-lg"
                  style={{
                    backgroundColor: primaryColor,
                    border: `3px solid ${secondaryColor}`,
                  }}
                >
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: secondaryColor }} />
                </div>
                <div>
                  <p className="text-sm font-black text-white">{teamName || 'Takım Adı'}</p>
                  <div className="flex gap-1.5 mt-1.5">
                    <div className="w-5 h-5 rounded-md shadow-sm" style={{ backgroundColor: primaryColor }} />
                    <div className="w-5 h-5 rounded-md shadow-sm" style={{ backgroundColor: secondaryColor }} />
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={handleSaveColors}
              disabled={savingColors || (primaryColor === profile?.primary_color && secondaryColor === profile?.secondary_color)}
              className="w-full py-3 bg-amber-500 text-black font-black uppercase tracking-widest rounded-xl
                hover:bg-amber-400 active:scale-[0.98] transition-all flex items-center justify-center gap-2
                disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Save size={16} />
              {savingColors ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
          </div>
        </SettingCard>

        {/* ── Notification Preferences ── */}
        <SettingCard icon={<Bell size={18} />} title="Bildirim Tercihleri">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-white">Push Bildirimleri</p>
              <p className="text-xs text-zinc-500 mt-0.5">Maç hatırlatmaları ve önemli olaylar</p>
            </div>
            <ToggleSwitch enabled={pushEnabled} onToggle={handleTogglePush} />
          </div>
        </SettingCard>

        {/* ── Notification Category Settings ── */}
        {profile?.id && (
          <SettingCard icon={<Bell size={18} />} title="Bildirim Kategorileri">
            <NotificationCategorySettings userId={profile.id} />
          </SettingCard>
        )}

        {/* ── Team Color Picker (Theme System) ── */}
        {profile?.id && (
          <SettingCard icon={<Palette size={18} />} title="Tema Renkleri">
            <TeamColorPicker
              userId={profile.id}
              initialPrimary={primaryColor}
              initialSecondary={secondaryColor}
            />
          </SettingCard>
        )}

        {/* ── Sound Effects ── */}
        <SettingCard icon={<Volume2 size={18} />} title="Ses Efektleri">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-white">Ses Efektleri</p>
              <p className="text-xs text-zinc-500 mt-0.5">Gol, transfer ve bildirim sesleri</p>
            </div>
            <ToggleSwitch enabled={soundEnabled} onToggle={handleToggleSound} />
          </div>
        </SettingCard>

        {/* ── Dark/Light Mode ── */}
        <SettingCard icon={<Sun size={18} />} title="Görünüm">
          <div className="space-y-3">
            {[
              { id: 'dark', label: 'Karanlık', desc: 'Varsayılan koyu tema', icon: <Moon size={16} /> },
              { id: 'light', label: 'Aydınlık', desc: 'Açık arka planlı tema', icon: <Sun size={16} /> },
              { id: 'high-contrast', label: 'Yüksek Kontrast', desc: 'Parlak metin, koyu gri arka plan', icon: <Contrast size={16} /> },
            ].map((theme) => {
              const isActive = currentTheme === theme.id;
              return (
                <button
                  key={theme.id}
                  onClick={() => {
                    const html = document.documentElement;
                    html.classList.remove('dark', 'light', 'high-contrast');
                    html.classList.add(theme.id);
                    html.setAttribute('data-theme', theme.id);
                    try { localStorage.setItem('sb-fc-theme', theme.id); } catch {}
                    setCurrentTheme(theme.id);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-colors ${
                    isActive
                      ? 'border-amber-500/50 bg-amber-500/10 text-amber-400'
                      : 'border-zinc-700 bg-black text-white hover:border-zinc-600'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${
                    isActive
                      ? 'bg-amber-500/15 border-amber-500/25 text-amber-400'
                      : 'bg-white/5 border-white/10 text-white/40'
                  }`}>
                    {theme.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`text-sm font-bold ${isActive ? 'text-amber-300' : 'text-white/70'}`}>
                      {theme.label}
                    </div>
                    <div className="text-xs text-zinc-500">{theme.desc}</div>
                  </div>
                  {isActive && (
                    <div className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </SettingCard>

        {/* ── Language Selection ── */}
        <SettingCard icon={<Globe size={18} />} title="Dil Seçimi">
          <div className="space-y-2">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => lang.active && setLanguage(lang.code)}
                disabled={!lang.active}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-colors ${
                  lang.active
                    ? language === lang.code
                      ? 'border-amber-500/50 bg-amber-500/10 text-amber-400'
                      : 'border-zinc-700 bg-black text-white hover:border-zinc-600'
                    : 'border-zinc-800 bg-zinc-900/50 text-zinc-600 cursor-not-allowed'
                }`}
              >
                <span className="text-sm font-bold">{lang.label}</span>
                {!lang.active && (
                  <span className="text-[10px] font-black uppercase tracking-wider bg-zinc-800 text-zinc-500 px-2.5 py-1 rounded-lg">
                    Yakında
                  </span>
                )}
                {lang.active && language === lang.code && (
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-500">
                    ✓ Aktif
                  </span>
                )}
              </button>
            ))}
          </div>
        </SettingCard>

        {/* Bottom spacer for safe area */}
        <div className="h-8" />
      </main>
    </div>
  );
}
