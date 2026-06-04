/**
 * Profil Bağlamı — Profil + Finansal İşlemler
 *
 * Kullanıcı profili, admin durumu, kimlik bilgileri ve
 * yalnızca profil durumuna bağımlı finansal fonksiyonları yönetir.
 *
 * Sınır ötesi fonksiyonlar (processFinancials, sellPlayer) FMProviderInner'da tanımlanır
 * çünkü diğer alt-bağlamların durumunu okuması/yazması gerekir.
 */
'use client';
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Profile } from '../types';
import { useAuth } from '@/contexts/AuthContext';
import { isSupabaseConfigured, getSupabase } from '@/lib/supabase';
import { showToast } from '@/components/fm/ToastNotifications';
import { playSound } from '@/utils/sound';
import { saveProfile } from '../persistence';

// ── Profil bağlamı değer arayüzü ────────────────────────────────
interface ProfileContextValue {
  /** Kullanıcı profili */
  profile: Profile | null;
  /** Profil güncelleyici (fonksiyon ve doğrudan değer kabul eder) */
  setProfile: (data: Profile | null | ((prev: Profile | null) => Profile | null)) => void;
  /** Admin durumu */
  isAdmin: boolean;
  /** Admin durumu güncelleyici */
  setIsAdmin: React.Dispatch<React.SetStateAction<boolean>>;
  /** Supabase kullanıcı kimliği */
  userId: string | null;
  /** Supabase kullanıcı e-postası */
  authEmail: string | null;
  /** Maç geliri ekle (yerel — sadece profile yazar) */
  addMatchRevenue: (isHome: boolean, leaguePosition?: number, totalTeams?: number) => void;
  /** Sponsor ekle (yerel — sadece profile yazar) */
  addSponsor: (sponsor: any) => Promise<void>;
}

const ProfileContext = createContext<ProfileContextValue | null>(null);

// ── Profil Sağlayıcısı ──────────────────────────────────────────
export const ProfileProvider = ({ children }: { children: React.ReactNode }) => {
  // Kimlik doğrulama durumunu AuthContext'ten al
  const { user: authUser } = useAuth();
  const userId = authUser?.id ?? null;
  const authEmail = authUser?.email ?? null;

  const [profile, setProfileState] = useState<Profile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // PERF-8: Profil otomatik kayıt deduplication referansı
  const prevProfileRef = useRef<string>('');

  // setProfile: fonksiyon ve doğrudan değer kabul eden stabil sarmalayıcı
  const setProfile = useCallback((newProfileData: Profile | null | ((prev: Profile | null) => Profile | null)) => {
    setProfileState(prev => {
      const updated = typeof newProfileData === 'function' ? newProfileData(prev) : newProfileData;
      return updated;
    });
  }, []);

  // ── İnşaat tamamlama kontrolü ────────────────────────────────
  // Profil veya gün değiştiğinde tamamlanan yükseltmeleri işle
  useEffect(() => {
    if (!profile) return;
    if (!profile.active_upgrade_type) return; // Aktif yükseltme yoksa atla (PERF-8)
    if (profile.current_day < (profile.active_upgrade_finish_day || 0)) return; // Henüz tamamlanmadı (PERF-8)

    if (profile.active_upgrade_type && profile.current_day >= (profile.active_upgrade_finish_day || 0)) {
      setProfile((prev: Profile | null) => {
        if (!prev) return prev;
        const finalProfile = { ...prev };
        if (finalProfile.active_upgrade_type === 'academy') {
          finalProfile.academy_level = (finalProfile.academy_level || 0) + 1;
        } else if (finalProfile.active_upgrade_type === 'stadium' || finalProfile.active_upgrade_type === 'stadium_matrix') {
          const upId = finalProfile.active_upgrade_id;
          if (upId) {
            const currentUps = { ...(finalProfile.stadium_upgrades || {}) };
            currentUps[upId] = (currentUps[upId] || 1) + 1;
            finalProfile.stadium_upgrades = currentUps;
          }
          finalProfile.stadium_capacity = (finalProfile.stadium_capacity || 0) + 5000;
          finalProfile.reputation = (finalProfile.reputation || 0) + 2;
        }

        // Yükseltme durumunu temizle
        finalProfile.active_upgrade_type = null;
        finalProfile.active_upgrade_id = null;
        finalProfile.active_upgrade_finish_day = null;

        return finalProfile;
      });
      showToast('İnşaat projesi tamamlandı!', 'success');
      playSound('success');
    }
  }, [profile?.current_day, profile?.active_upgrade_type, profile?.active_upgrade_finish_day, setProfile]);

  // ── Veritabanı senkronizasyonu (PERF-8) ──────────────────────
  // Derin karşılaştırma ile gereksiz yazma işlemlerini önler

  // rpc_update_profile'ın izin verdiği alanlar — sadece bunları gönder
  const RPC_ALLOWED_FIELDS = [
    'money', 'credits', 'last_friendly_date', 'daily_friendly_count',
    'current_day', 'ticket_price', 'financial_health', 'team_logo',
    'stadium_upgrades', 'sponsors', 'reputation', 'fans', 'level',
    'xp', 'scout_slots', 'staff_coaches', 'staff_physios', 'staff_monthly_fees',
  ] as const;

  useEffect(() => {
    if (!profile?.id) return;

    // PERF-8: Profil gerçekten değişmişse senkronize et (derin karşılaştırma)
    const profileJson = JSON.stringify(profile);
    if (profileJson === prevProfileRef.current) return;
    prevProfileRef.current = profileJson;

    // Supabase'e kaydet — sadece RPC'nin izin verdiği alanları gönder
    if (isSupabaseConfigured()) {
      const supabase = getSupabase();
      if (supabase) {
        // Sadece izin verilen alanları filtrele (SQL syntax hatasını önler)
        const profileForDb: Record<string, unknown> = {};
        for (const key of RPC_ALLOWED_FIELDS) {
          if ((profile as any)[key] !== undefined) {
            profileForDb[key] = (profile as any)[key];
          }
        }

        // Boş update gönderme
        if (Object.keys(profileForDb).length === 0) return;

        supabase.rpc('rpc_update_profile', { p_profile_id: profile.id, p_updates: profileForDb })
          .then(({ error }) => {
            if (error) {
              if (!error.message?.includes('does not exist') && !error.message?.includes('schema cache')) {
                console.error('[ProfileContext] Profil senkronizasyon hatası:', error.message);
              }
            }
          });
      }
    }
  }, [profile]);

  // ── Admin kontrolü ───────────────────────────────────────────
  // refreshData ile birleştirildi (ayrı sorgu yok)
  // Sadece Supabase yapılandırılmamışsa false kalır
  useEffect(() => {
    if (!userId || !isSupabaseConfigured()) {
      setIsAdmin(false);
    }
    // Supabase yapılandırılmışsa, refreshData zaten rolü kontrol ediyor
  }, [userId]);

  // ── Profil otomatik kayıt (localStorage) ─────────────────────
  useEffect(() => {
    if (userId && profile) {
      saveProfile(profile as any);
    }
  }, [profile, userId]);

  // ── BUG-7: Finansal hesaplamaları memoize et ───────────────────
  const financialCacheRef = useRef<{ key: string; result: { capacity: number; positionFactor: number; baseAttendance: number; priceElasticity: number; attendance: number; ticketRevenue: number; fbRevenue: number; totalMatchRevenue: number } } | null>(null);

  const calculateMatchRevenue = useCallback((
    upgrades: Record<string, number>,
    ticketPrice: number,
    leaguePosition: number,
    totalTeams: number
  ) => {
    // Önbellek anahtarı oluştur
    const cacheKey = `${upgrades.capacity || 0}-${ticketPrice}-${leaguePosition}-${totalTeams}`;
    if (financialCacheRef.current && financialCacheRef.current.key === cacheKey) {
      return financialCacheRef.current.result;
    }

    const capacityLvl = upgrades['capacity'] || 0;
    const capacity = 10000 + (capacityLvl * 2000);
    const positionFactor = 0.5 + 0.5 * ((totalTeams - leaguePosition + 1) / totalTeams);
    const baseAttendance = capacity * positionFactor;
    const priceElasticity = Math.max(0.1, 1 - (ticketPrice - 50) / 100);
    const attendance = Math.floor(Math.min(capacity, baseAttendance * priceElasticity));
    const ticketRevenue = attendance * ticketPrice;
    const fbRevenue = attendance * 15;
    const totalMatchRevenue = ticketRevenue + fbRevenue;

    const result = { capacity, positionFactor, baseAttendance, priceElasticity, attendance, ticketRevenue, fbRevenue, totalMatchRevenue };
    financialCacheRef.current = { key: cacheKey, result };
    return result;
  }, []);

  // ── Maç geliri ekle ──────────────────────────────────────────
  // Yalnızca profile yazar — sınır ötesi bağımlılık yok
  const addMatchRevenue = useCallback((isHome: boolean, leaguePosition?: number, totalTeams?: number) => {
    setProfile((prev: Profile | null) => {
      if (!prev || !isHome) return prev;

      try {
        const upgrades = prev.stadium_upgrades || {};
        const ticketPrice = prev.ticket_price ?? 35;
        const pos = leaguePosition ?? 10;
        const teams = totalTeams ?? 18;

        const { totalMatchRevenue } = calculateMatchRevenue(upgrades, ticketPrice, pos, teams);

        return {
          ...prev,
          money: (prev.money || 0) + totalMatchRevenue
        };
      } catch {
        return prev;
      }
    });
  }, [setProfile, calculateMatchRevenue]);

  // ── Sponsor ekle ─────────────────────────────────────────────
  // Yalnızca profile ve supabase'e yazar — sınır ötesi bağımlılık yok
  const addSponsor = useCallback(async (sponsor: any) => {
    // Önce state'i güncelle (UI hemen yansısın)
    const updatedSponsors = [...(profile?.sponsors || []), sponsor];
    setProfile((prev: Profile | null) => prev ? {
      ...prev,
      sponsors: updatedSponsors
    } : prev);
    playSound('success');

    // Sonra team_sponsorships tablosuna kaydet (JSONB yerine ilişkisel tablo)
    if (isSupabaseConfigured() && userId) {
      const supabase = getSupabase();
      if (supabase) {
        try {
          const { error: sponsorError } = await supabase
            .from('team_sponsorships')
            .insert({
              profile_id: userId,
              sponsor_name: sponsor.name || sponsor.sponsorName || 'Bilinmeyen Sponsor',
              sponsor_type: sponsor.type || sponsor.sponsorType || 'standard',
              weekly_payment: sponsor.weeklyPayment || sponsor.payment || 0,
              total_value: sponsor.totalValue || sponsor.value || 0,
              remaining_weeks: sponsor.remainingWeeks || sponsor.duration || 12,
              start_date: new Date().toISOString().split('T')[0],
              is_active: true,
            });

          if (sponsorError) {
            // team_sponsorships tablosu yoksa JSONB fallback
            console.warn('[addSponsor] team_sponsorships kayıt başarısız, JSONB fallback:', sponsorError.message);
            const { error: jsonbError } = await supabase
              .from('profiles')
              .update({ sponsors: updatedSponsors })
              .eq('id', userId);
            if (jsonbError) {
              console.error('[addSponsor] JSONB fallback de başarısız:', jsonbError.message);
            }
          } else {
            console.log(`[addSponsor] Sponsor team_sponsorships tablosuna kaydedildi: ${sponsor.name || sponsor.sponsorName}`);
            // JSONB'yi de güncelle (UI uyumluluğu için)
            await supabase
              .from('profiles')
              .update({ sponsors: updatedSponsors })
              .eq('id', userId);
          }
        } catch (err) {
          console.error('[addSponsor] Sponsor kayıt hatası:', err);
        }
      }
    }
  }, [profile, userId, setProfile]);

  // ── Bağlam değerini memoize et ───────────────────────────────
  const value = useMemo<ProfileContextValue>(() => ({
    profile, setProfile, isAdmin, setIsAdmin, userId, authEmail,
    addMatchRevenue, addSponsor,
  }), [profile, setProfile, isAdmin, userId, authEmail, addMatchRevenue, addSponsor]);

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  );
};

// ── Profil bağlamı kanca (hook) ─────────────────────────────────
export const useProfileContext = () => {
  const context = useContext(ProfileContext);
  if (!context) throw new Error('useProfileContext bir ProfileProvider içinde kullanılmalıdır');
  return context;
};
