'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Save, Palette, Type, Shield } from 'lucide-react';
import { useFM } from '@/lib/fm/GameContext';

const TEAM_COLORS = [
  '#000000', '#1a1a2e', '#16213e', '#0f3460', '#533483',
  '#e94560', '#ff6b35', '#fca311', '#e9c46a', '#2a9d8f',
  '#264653', '#287271', '#8ecae6', '#219ebc', '#023047',
  '#ffffff', '#ced4da', '#adb5bd', '#6c757d', '#495057',
];

const TEAM_EMBLEMS = [
  '🦁', '🐺', '🦅', '⚡', '🔥', '⭐', '👑', '🛡️',
  '⚽', '🎯', '💎', '🏆', '🌟', '🐉', '🦊', '🐂',
];

export default function TeamSettingsPage() {
  const { profile, setProfile } = useFM();

  const [teamName, setTeamName] = useState(profile?.team_name || '');
  const [primaryColor, setPrimaryColor] = useState(profile?.primary_color || '#000000');
  const [secondaryColor, setSecondaryColor] = useState(profile?.secondary_color || '#ffffff');
  const [emblem, setEmblem] = useState('🦁');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);

    try {
      setProfile({
        ...profile,
        team_name: teamName,
        primary_color: primaryColor,
        secondary_color: secondaryColor,
      });

      // Emblem'ı da Supabase'e kaydet (team_emblem alanı)
      try {
        const { getSupabase, isSupabaseConfigured } = await import('@/lib/supabase');
        if (isSupabaseConfigured()) {
          const supabase = getSupabase();
          if (supabase) {
            await supabase
              .from('profiles')
              .update({
                team_name: teamName,
                primary_color: primaryColor,
                secondary_color: secondaryColor,
                team_emblem: emblem,
              })
              .eq('id', profile.id);
          }
        }
      } catch (dbErr) {
        console.error('Supabase kayıt hatası:', dbErr);
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error('Ayarlar kaydedilemedi:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto space-y-8 p-6"
    >
      <div className="flex items-center gap-4 mb-8">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl border-2"
          style={{
            backgroundColor: primaryColor,
            borderColor: secondaryColor,
          }}
        >
          {emblem}
        </div>
        <div>
          <h1 className="text-2xl font-black text-white uppercase tracking-tighter">
            Takım Ayarları
          </h1>
          <p className="text-sm text-white/40">Takımını kişiselleştir</p>
        </div>
      </div>

      {/* Takım Adı */}
      <div className="bg-[#111820] border border-white/5 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <Type size={18} className="text-white/40" />
          <h3 className="text-sm font-black text-white uppercase tracking-tight">Takım Adı</h3>
        </div>
        <input
          type="text"
          value={teamName}
          onChange={(e) => setTeamName(e.target.value)}
          className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-white focus:outline-none focus:border-amber-500/50 transition-colors"
          maxLength={50}
        />
      </div>

      {/* Renkler */}
      <div className="bg-[#111820] border border-white/5 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <Palette size={18} className="text-white/40" />
          <h3 className="text-sm font-black text-white uppercase tracking-tight">Takım Renkleri</h3>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="text-[10px] font-bold text-white/40 uppercase block mb-2">
              Ana Renk
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="w-10 h-10 rounded-lg border border-white/10 cursor-pointer"
              />
              <input
                type="text"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="flex-1 bg-black border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white"
              />
            </div>
            <div className="flex flex-wrap gap-1.5 mt-3">
              {TEAM_COLORS.slice(0, 10).map((color) => (
                <button
                  key={color}
                  onClick={() => setPrimaryColor(color)}
                  className={`w-6 h-6 rounded-md border-2 transition-all ${
                    primaryColor === color ? 'border-amber-400 scale-110' : 'border-white/10'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-white/40 uppercase block mb-2">
              İkincil Renk
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={secondaryColor}
                onChange={(e) => setSecondaryColor(e.target.value)}
                className="w-10 h-10 rounded-lg border border-white/10 cursor-pointer"
              />
              <input
                type="text"
                value={secondaryColor}
                onChange={(e) => setSecondaryColor(e.target.value)}
                className="flex-1 bg-black border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white"
              />
            </div>
            <div className="flex flex-wrap gap-1.5 mt-3">
              {TEAM_COLORS.slice(10).map((color) => (
                <button
                  key={color}
                  onClick={() => setSecondaryColor(color)}
                  className={`w-6 h-6 rounded-md border-2 transition-all ${
                    secondaryColor === color ? 'border-amber-400 scale-110' : 'border-white/10'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="mt-6 p-4 bg-black/40 rounded-xl">
          <p className="text-[9px] text-white/30 uppercase font-bold mb-2">Önizleme</p>
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-xl"
              style={{
                backgroundColor: primaryColor,
                border: `2px solid ${secondaryColor}`,
              }}
            >
              {emblem}
            </div>
            <div>
              <p className="text-sm font-black text-white">{teamName || 'Takım Adı'}</p>
              <div className="flex gap-1 mt-1">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: primaryColor }} />
                <div className="w-4 h-4 rounded" style={{ backgroundColor: secondaryColor }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Amblem */}
      <div className="bg-[#111820] border border-white/5 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <Shield size={18} className="text-white/40" />
          <h3 className="text-sm font-black text-white uppercase tracking-tight">Takım Amblemi</h3>
        </div>
        <div className="grid grid-cols-8 gap-2">
          {TEAM_EMBLEMS.map((emoji) => (
            <button
              key={emoji}
              onClick={() => setEmblem(emoji)}
              className={`w-10 h-10 rounded-xl border flex items-center justify-center text-lg transition-all ${
                emblem === emoji
                  ? 'border-amber-400 bg-amber-500/10 scale-110'
                  : 'border-white/5 bg-black/40 hover:border-white/10'
              }`}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>

      {/* Save */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full py-4 bg-amber-500 text-black font-black uppercase tracking-widest rounded-2xl
          hover:bg-amber-400 active:scale-[0.98] transition-all flex items-center justify-center gap-3
          disabled:opacity-50"
      >
        <Save size={18} />
        {saving ? 'Kaydediliyor...' : saved ? '✓ Kaydedildi!' : 'Kaydet'}
      </button>
    </motion.div>
  );
}
