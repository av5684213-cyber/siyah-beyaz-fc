'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, BellOff, CheckCircle2, XCircle, Loader2, Shield, Swords, Dumbbell, MonitorSmartphone } from 'lucide-react';
import {
  subscribeToPush,
  unsubscribeFromPush,
  getNotificationPermissionStatus,
  hasPushSubscription,
  loadNotificationPreferences,
  saveNotificationPreferences,
  type NotificationPreferences,
  DEFAULT_NOTIFICATION_PREFERENCES,
} from '@/lib/push-notifications';

interface NotificationSettingsProps {
  profileId: string;
}

type PermissionState = 'granted' | 'denied' | 'default' | 'unsupported';

export default function NotificationSettings({ profileId }: NotificationSettingsProps) {
  const [permission, setPermission] = useState<PermissionState>('default');
  const [hasSubscription, setHasSubscription] = useState(false);
  const [prefs, setPrefs] = useState<NotificationPreferences>(DEFAULT_NOTIFICATION_PREFERENCES);
  const [loading, setLoading] = useState(true);
  const [activating, setActivating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // ── İzin durumunu ve tercihleri yükle ──────────────────────
  const loadState = useCallback(async () => {
    setLoading(true);
    try {
      // Tarayıcı izin durumu
      const perm = getNotificationPermissionStatus();
      setPermission(perm as PermissionState);

      // Supabase'de abonelik var mı?
      const subbed = await hasPushSubscription(profileId);
      setHasSubscription(subbed);

      // Tercihleri yükle
      const loadedPrefs = await loadNotificationPreferences(profileId);
      setPrefs(loadedPrefs);
    } catch (err) {
      console.error('[NotificationSettings] Yükleme hatası:', err);
    } finally {
      setLoading(false);
    }
  }, [profileId]);

  useEffect(() => {
    if (profileId) loadState();
  }, [profileId, loadState]);

  // ── Bildirimleri aktif et butonu ───────────────────────────
  const handleActivate = async () => {
    setActivating(true);
    setMessage(null);
    try {
      const result = await subscribeToPush(profileId);
      if (result.success) {
        setPermission('granted');
        setHasSubscription(true);
        // Tercihi de güncelle
        const newPrefs = { ...prefs, push_enabled: true };
        setPrefs(newPrefs);
        await saveNotificationPreferences(profileId, newPrefs);
        setMessage({ type: 'success', text: 'Bildirimler başarıyla aktif edildi!' });
      } else {
        setMessage({ type: 'error', text: result.error || 'Bildirimler aktif edilemedi.' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Beklenmedik bir hata oluştu.' });
    } finally {
      setActivating(false);
      setTimeout(() => setMessage(null), 4000);
    }
  };

  // ── Bildirimleri kapat ─────────────────────────────────────
  const handleDeactivate = async () => {
    setActivating(true);
    setMessage(null);
    try {
      const result = await unsubscribeFromPush(profileId);
      if (result.success) {
        setHasSubscription(false);
        const perm = getNotificationPermissionStatus();
        setPermission(perm as PermissionState);
        // Tercihi güncelle
        const newPrefs = { ...prefs, push_enabled: false };
        setPrefs(newPrefs);
        await saveNotificationPreferences(profileId, newPrefs);
        setMessage({ type: 'success', text: 'Bildirimler kapatıldı.' });
      } else {
        setMessage({ type: 'error', text: 'Bildirimler kapatılamadı.' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Beklenmedik bir hata oluştu.' });
    } finally {
      setActivating(false);
      setTimeout(() => setMessage(null), 4000);
    }
  };

  // ── Toggle değişimi ────────────────────────────────────────
  const handleToggle = async (key: keyof NotificationPreferences) => {
    const newPrefs = { ...prefs, [key]: !prefs[key] };
    setPrefs(newPrefs);
    setSaving(true);
    try {
      await saveNotificationPreferences(profileId, newPrefs);
    } catch (err) {
      console.error('[NotificationSettings] Tercih kaydetme hatası:', err);
      // Geri al
      setPrefs(prefs);
    } finally {
      setSaving(false);
    }
  };

  // ── Yükleme durumu ─────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 text-white/30 animate-spin" />
      </div>
    );
  }

  const isBrowserSupported = typeof window !== 'undefined' && 'Notification' in window && 'serviceWorker' in navigator;
  const isVapidConfigured = typeof window !== 'undefined' && process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const isActive = permission === 'granted' && hasSubscription;

  return (
    <div className="space-y-6">
      {/* ── Bildirim Durumu Banner ──────────────────────────── */}
      <div className={`rounded-2xl border p-5 ${
        isActive
          ? 'bg-emerald-500/10 border-emerald-500/30'
          : permission === 'denied'
            ? 'bg-red-500/10 border-red-500/30'
            : 'bg-amber-500/10 border-amber-500/30'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isActive ? (
              <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                <Bell size={20} className="text-emerald-400" />
              </div>
            ) : (
              <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center">
                <BellOff size={20} className="text-white/40" />
              </div>
            )}
            <div>
              <p className={`text-sm font-black uppercase tracking-tight ${
                isActive ? 'text-emerald-400' : permission === 'denied' ? 'text-red-400' : 'text-amber-400'
              }`}>
                {isActive ? 'Bildirimler Aktif' : permission === 'denied' ? 'Bildirimler Engellendi' : 'Bildirimler Pasif'}
              </p>
              <p className="text-[10px] text-white/40 mt-0.5">
                {isActive
                  ? 'Tarayıcı bildirimleri açık. Aşağıdan tercihlerini yönet.'
                  : permission === 'denied'
                    ? 'Tarayıcı bildirimleri engellenmiş. Tarayıcı ayarlarından izin vermeniz gerekiyor.'
                    : 'Bildirimleri aktif etmek için aşağıdaki butona tıklayın.'}
              </p>
            </div>
          </div>
          {isActive && (
            <CheckCircle2 size={20} className="text-emerald-400" />
          )}
          {permission === 'denied' && (
            <XCircle size={20} className="text-red-400" />
          )}
        </div>
      </div>

      {/* ── Tarayıcı Bildirimlerini Aktif Et / Kapat Butonu ── */}
      {!isVapidConfigured ? (
        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 text-center">
          <p className="text-[10px] text-white/30">
            Bu ortamda push bildirimleri yapılandırılmamış.
          </p>
        </div>
      ) : !isBrowserSupported ? (
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-5">
          <div className="flex items-center gap-3">
            <MonitorSmartphone size={18} className="text-red-400" />
            <div>
              <p className="text-sm font-bold text-red-400">Tarayıcınız Bildirimleri Desteklemiyor</p>
              <p className="text-[10px] text-white/40 mt-0.5">
                Web Push bildirimleri bu tarayıcıda desteklenmiyor. Lütfen Chrome, Firefox veya Edge kullanın.
              </p>
            </div>
          </div>
        </div>
      ) : !isActive ? (
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleActivate}
          disabled={activating || permission === 'denied'}
          className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest text-sm
            flex items-center justify-center gap-3 transition-all
            ${permission === 'denied'
              ? 'bg-white/5 text-white/20 cursor-not-allowed'
              : 'bg-amber-500 text-black hover:bg-amber-400 active:bg-amber-500'
            }`}
        >
          {activating ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <Bell size={18} />
          )}
          {activating ? 'Aktifleştiriliyor...' : permission === 'denied' ? 'Tarayıcıda Engellenmiş' : 'Tarayıcı Bildirimlerini Aktif Et'}
        </motion.button>
      ) : (
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleDeactivate}
          disabled={activating}
          className="w-full py-4 rounded-2xl font-black uppercase tracking-widest text-sm
            bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-all
            flex items-center justify-center gap-3"
        >
          {activating ? <Loader2 size={18} className="animate-spin" /> : <BellOff size={18} />}
          {activating ? 'Kapatılıyor...' : 'Bildirimleri Kapat'}
        </motion.button>
      )}

      {/* ── İzin reddedilmişse bilgi kutusu ─────────────────── */}
      {permission === 'denied' && (
        <div className="bg-zinc-800/60 border border-white/5 rounded-2xl p-4">
          <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-2">NASIL DÜZELTİLİR?</p>
          <ol className="text-[11px] text-white/50 space-y-1.5 list-decimal list-inside">
            <li>Tarayıcınızın adres çubuğundaki <span className="text-white/70">kilit/kılavuz</span> simgesine tıklayın</li>
            <li><span className="text-white/70">Bildirimler</span> iznini &quot;Sor&quot; veya &quot;İzin Ver&quot; olarak değiştirin</li>
            <li>Sayfayı yenileyip tekrar deneyin</li>
          </ol>
        </div>
      )}

      {/* ── Bildirim Tercihleri ─────────────────────────────── */}
      <div className="bg-[#111820] border border-white/5 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-5">
          <Shield size={18} className="text-white/40" />
          <h3 className="text-sm font-black text-white uppercase tracking-tight">Bildirim Tercihleri</h3>
          {saving && <Loader2 size={14} className="text-white/30 animate-spin ml-auto" />}
        </div>

        <div className="space-y-4">
          {/* Maç Hatırlatma */}
          <ToggleRow
            icon={<Swords size={16} className="text-emerald-400" />}
            label="Maç Hatırlatma"
            description="Maç başlamadan 10 dakika önce bildirim gönderilir"
            enabled={prefs.match_reminder}
            onToggle={() => handleToggle('match_reminder')}
            disabled={!isActive}
          />

          {/* Transfer Teklifi */}
          <ToggleRow
            icon={<MonitorSmartphone size={16} className="text-blue-400" />}
            label="Transfer Teklifi"
            description="Yeni transfer teklifi geldiğinde bildirim gönderilir"
            enabled={prefs.transfer_offer}
            onToggle={() => handleToggle('transfer_offer')}
            disabled={!isActive}
          />

          {/* Antrenman Raporu */}
          <ToggleRow
            icon={<Dumbbell size={16} className="text-amber-400" />}
            label="Antrenman Raporu"
            description="Antrenman tamamlandığında bildirim gönderilir"
            enabled={prefs.training_report}
            onToggle={() => handleToggle('training_report')}
            disabled={!isActive}
          />
        </div>

        {!isActive && (
          <p className="text-[10px] text-white/20 mt-4 italic">
            Tercihleri değiştirmek için önce bildirimleri aktif etmelisiniz.
          </p>
        )}
      </div>

      {/* ── Mesaj ───────────────────────────────────────────── */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`rounded-xl p-3 text-center text-sm font-bold ${
              message.type === 'success'
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : 'bg-red-500/10 text-red-400 border border-red-500/20'
            }`}
          >
            {message.text}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Toggle Row Alt Bileşeni
// ═══════════════════════════════════════════════════════════════

function ToggleRow({
  icon,
  label,
  description,
  enabled,
  onToggle,
  disabled,
}: {
  icon: React.ReactNode;
  label: string;
  description: string;
  enabled: boolean;
  onToggle: () => void;
  disabled?: boolean;
}) {
  return (
    <div className={`flex items-center justify-between gap-4 p-3 rounded-xl transition-colors ${
      disabled ? 'opacity-30' : 'hover:bg-white/5'
    }`}>
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center">
          {icon}
        </div>
        <div>
          <p className="text-xs font-bold text-white">{label}</p>
          <p className="text-[10px] text-white/30">{description}</p>
        </div>
      </div>
      <button
        onClick={onToggle}
        disabled={disabled}
        className={`relative w-11 h-6 rounded-full transition-all ${
          enabled ? 'bg-emerald-500' : 'bg-white/10'
        } ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <div
          className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${
            enabled ? 'left-[22px]' : 'left-0.5'
          }`}
        />
      </button>
    </div>
  );
}
