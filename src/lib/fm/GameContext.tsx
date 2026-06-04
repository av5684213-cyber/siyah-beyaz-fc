/**
 * PERF-8 + Facade Pattern: GameContext Re-Render Optimization
 *
 * Orijinal 1200 satırlık "God Context" 4 odaklı alt-bağlama bölündü:
 * 1. ProfileContext — Profil + finansal işlemler
 * 2. SquadContext   — Kadro + transfer işlemleri
 * 3. GameOpsContext — Antrenman + maç işlemleri
 * 4. UIContext      — Arayüz durumu
 *
 * Her alt-bağlam yalnızca kendi tüketicilerini yeniden render eder.
 * FMProvider tüm alt-sağlayıcıları iç içe sarar.
 * FMProviderInner tüm alt-bağlamları okuyup birleştirir ve
 * FMContext.Provider ile aynı arayüzü sağlar — tüketiciler değişmez.
 *
 * Sınır ötesi fonksiyonlar (birden fazla alt-bağlamın durumunu
 * okuyan/yazan) FMProviderInner'da tanımlanır.
 *
 * Tüketici bileşenler hala useFM() kullanır — sıfır değişiklik gerekmez.
 * İleride doğrudan useProfileContext() vb. kullanılabilir.
 */
'use client';
import React, { useContext, useCallback, useMemo, useRef, useEffect, useState } from 'react';
import { Player, Profile, ActiveTactic, TrainingState } from './types';
import {
  loadProfile, loadPlayers, loadActiveTactic, loadTrainingState, loadWatchlist,
  savePlayers, saveActiveTactic, saveTrainingState, saveWatchlist
} from './persistence';
import { isSupabaseConfigured, getSupabase } from '@/lib/supabase';
import { getBrowserLocale, Locale } from './i18n';
import { showToast } from '@/components/fm/ToastNotifications';
import { playSound } from '@/utils/sound';
import { generateLocalizedPlayer, getRegionConfig } from './region-generator';
import { formatCurrency } from './valuation';
import { isTransferWindowOpen, transferWindowStatus } from '@/lib/fm/transferWindow';
import { ProfileProvider, useProfileContext } from './contexts/ProfileContext';
import { SquadProvider, useSquadContext } from './contexts/SquadContext';
import { GameOpsProvider, useGameOpsContext } from './contexts/GameOpsContext';
import { UIProvider, useUIContext } from './contexts/UIContext';
import { FMContext } from './FMContext';

// ── FMContext arayüzü (geriye uyumlu — değişiklik yok) ──────────
interface FMContextValue {
  userId: string | null;
  authEmail: string | null;
  isAdmin: boolean;
  profile: Profile | null;
  setProfile: (data: Profile | null | ((prev: Profile | null) => Profile | null)) => void;
  squad: Player[];
  setSquad: React.Dispatch<React.SetStateAction<Player[]>>;
  activeTactic: ActiveTactic;
  setActiveTactic: React.Dispatch<React.SetStateAction<ActiveTactic>>;
  trainingState: TrainingState;
  setTrainingState: React.Dispatch<React.SetStateAction<TrainingState>>;
  league: Player[];
  setLeague: React.Dispatch<React.SetStateAction<Player[]>>;
  selectedTeamProfile: string | null;
  setSelectedTeamProfile: React.Dispatch<React.SetStateAction<string | null>>;
  directMessageRecipient: any | null;
  setDirectMessageRecipient: React.Dispatch<React.SetStateAction<any | null>>;
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  refreshData: (id?: string) => Promise<void>;
  locale: Locale;
  setLocale: React.Dispatch<React.SetStateAction<Locale>>;
  sellPlayer: (player: Player) => Promise<{ success: boolean; netRevenue: number; taxAmount: number } | void>;
  scoutPlayer: (playerId: string, playerObj?: Player) => Promise<{ success: boolean; reason?: string; player?: Player } | { success: boolean; player: Player }>;
  playFriendlyMatch: (isPaid?: boolean) => Promise<{ success: boolean; reason?: string; homeScore?: number; awayScore?: number; results?: Record<string, unknown> }>;
  watchlist: string[];
  toggleWatchlist: (player: Player) => Promise<void>;
  negotiatePurchase: (player: Player, offerPrice: number) => Promise<{ success: boolean; reason?: string; totalCost?: number; agentCommission?: number; signingBonus?: number; counterOffer?: number }>;
  addSponsor: (sponsor: any) => Promise<void>;
  initTeam: (teamNameInput: string, managerName: string, philosophy: string, color1: string, color2: string) => Promise<void>;
  activeTab: string;
  setActiveTab: React.Dispatch<React.SetStateAction<string>>;
  // BUG-7: useMemo ile hesaplanan türetilmiş değerler
  /** Kadro rating'e göre azalan sıralama */
  squadByRating: Player[];
  /** Finansal özet: günlük maaş, toplam piyasa değeri, kadro büyüklüğü, ortalama rating */
  financialSummary: { totalDailyWages: number; totalMarketValue: number; squadSize: number; avgRating: number };
}

// FMContext ayrı dosyada tanımlı — döngüsel bağımlılık çözümü
export { FMContext } from './FMContext';

// ── FMProviderInner: Tüm alt-bağlamları okur ve FMContext'i sağlar ──
// Bu bileşen 4 alt-bağlamın içinde yer aldığı için hepsine erişebilir.
// Sınır ötesi fonksiyonlar burada tanımlanır.
const FMProviderInner = ({ children }: { children: React.ReactNode }) => {
  // ── Alt-bağlamlardan durum ve güncelleyicileri al ────────────
  const { profile, setProfile, isAdmin, setIsAdmin, userId, authEmail, addMatchRevenue, addSponsor } = useProfileContext();
  const { squad, setSquad, watchlist, setWatchlist, league, setLeague } = useSquadContext();
  const { activeTactic, setActiveTactic, trainingState, setTrainingState, processScouting } = useGameOpsContext();
  const { activeTab, setActiveTab, locale, setLocale, loading, setLoading, selectedTeamProfile, setSelectedTeamProfile, directMessageRecipient, setDirectMessageRecipient } = useUIContext();

  // ── Sınır ötesi: Finansal işlemler (squad okur, profile yazar) ──
  // BUG-7: squadRef kullanarak squad dependency'sini kaldırdık — referans stabil kalır
  const processFinancials = useCallback((day: number) => {
    const currentSquad = squadRef.current;
    setProfile((prev: Profile | null) => {
      if (!prev) return prev;
      let newMoney = prev.money || 0;
      const sponsors = prev.sponsors || [];
      const upgrades = prev.stadium_upgrades || {};

      // 1. Sponsor ödemeleri /api/cron/weekly-income tarafından işlenir (istemci tarafı çift sayma yok)

      // 2. Pasif Stadyum Geliri (Günlük)
      // Mağaza (Store)
      const storeLvl = upgrades['store'] || 0;
      const storeIncome = storeLvl * 25000;

      // VIP Pasif (Seviye 10 bonusu)
      const vipLvl = upgrades['vip'] || 0;
      const vipIncome = vipLvl === 10 ? 500000 : (vipLvl * 15000);

      newMoney += (storeIncome + vipIncome);

      // 3. Oyuncu Maaşları (Günlük)
      const dailyWages = currentSquad.reduce((acc, p) => acc + (p.salary / 30), 0);
      newMoney -= dailyWages;

      // 4. Sponsor sürelerini güncelle (UI seviyesi geri sayım, finansal değil)
      const updatedSponsors = sponsors.map((s: any) => ({
        ...s,
        remainingDays: Math.max(0, s.remainingDays - 1)
      })).filter((s: any) => s.remainingDays > 0);

      return {
        ...prev,
        money: Math.max(0, newMoney), // Mümkünse negatifi önle
        sponsors: updatedSponsors
      };
    });
  }, [setProfile]);

  // ── Sınır ötesi: Gün sonu işleme ─────────────────────────────
  // DÜZELTME: profile tam objesini dependency'den kaldırdık — sadece current_day değişince tetiklenir
  // processFinancials/processScouting useCallback ile stabil referans olmalı
  // Rollback mekanizması için ref'ler (optimistic update sonrası DB hatası durumunda eski state'e dönmek için)
  const profileRef = useRef(profile);
  profileRef.current = profile;
  const squadRef = useRef(squad);
  squadRef.current = squad;

  useEffect(() => {
    if (!profileRef.current) return;

    // Oyun zamanında yeni bir gün başladı mı kontrol et (basitleştirilmiş)
    // Gerçek çok kullanıcılı uygulamada bu sunucu tarafında olur.
    const lastProcessedDay = parseInt(localStorage.getItem('fm_last_processed_day') || '0');
    if (profileRef.current.current_day > lastProcessedDay) {
      processFinancials(profileRef.current.current_day);
      processScouting(profileRef.current.current_day);
      localStorage.setItem('fm_last_processed_day', profileRef.current.current_day.toString());
    }
  }, [profile?.current_day, processFinancials, processScouting]);

  // ── Sınır ötesi: Takım kurma ─────────────────────────────────
  const initTeam = useCallback(async (teamNameInput: string, managerName: string, philosophy: string, color1: string, color2: string) => {
    if (!userId) {
      console.error('[initTeam] HATA: userId boş, takım kurulamiyor!');
      return;
    }
    console.log(`[initTeam] /api/auth/register çağrılıyor: teamName="${teamNameInput}", userId="${userId}"`);
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          teamName: teamNameInput.trim(),
          managerName: managerName.trim(),
          philosophy,
          color1,
          color2,
          region: locale || 'TR',
        }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        console.error('[initTeam] Register API hatası:', data.error || data.message);
        showToast(data.error || data.message || 'Takım kurulurken hata oluştu.', 'error');
        return;
      }

      // Lig ataması başarısız olduysa uyarı göster
      if (!data.tookOverBot && !data.leagueName) {
        showToast('Lig ataması yapılamadı. Lütfen sayfayı yenileyip tekrar deneyin.', 'error');
      }

      // Fikstür yoksa uyarı göster
      if (data.hasFixtures === false) {
        showToast('Fikstür oluşturulamadı. Sezon başlangıcında fikstürler oluşturulacak.', 'info');
      }

      // API'den dönen oyuncuları context'e yaz
      // NOT: Profil set etmeyi aşağıdaki loadProfile + freshProfile akışına bırak
      if (data.players && data.players.length > 0) {
        setSquad(data.players);
      }

      showToast(`${data.leagueName}'te "${teamNameInput}" kuruldu!`, 'success');

      // Verileri yeniden yükle (doğrudan persistence fonksiyonları ile)
      try {
        const freshProfile = await loadProfile(userId);
        if (freshProfile) setProfile(freshProfile);
        const freshPlayers = await loadPlayers(userId, teamNameInput.trim());
        if (freshPlayers && freshPlayers.length > 0) setSquad(freshPlayers);
      } catch (reloadErr) {
        console.warn('[initTeam] Veri yeniden yükleme hatası (veriler kaydedildi):', reloadErr);
      }
    } catch (err) {
      // API çağrısı başarısız (sunucu çökmüş, ağ hatası vb.)
      // İstemci tarafı fallback: doğrudan tarayıcıda profil ve oyuncu oluştur
      console.warn('[initTeam] API fetch başarısız, istemci tarafı fallback kullanılıyor:', err);
      try {
        const BASE_MONEY = 25_000_000;
        const BASE_CREDITS = 250;
        const BASE_REPUTATION = 30;
        const BASE_ACADEMY_LEVEL = 1;

        let startMoney = BASE_MONEY;
        let startCredits = BASE_CREDITS;
        let startReputation = BASE_REPUTATION;
        let startAcademyLevel = BASE_ACADEMY_LEVEL;
        let squadQualityMod = 1.0;

        switch (philosophy) {
          case 'financial': startMoney += 15_000_000; break;
          case 'legend': startCredits += 250; break;
          case 'youth': startAcademyLevel = 3; break;
          case 'squad': squadQualityMod = 1.1; break;
          case 'reputation': startReputation += 20; break;
          default: break;
        }

        const fallbackProfile = {
          id: userId,
          team_name: teamNameInput.trim(),
          league_name: '4. Lig',
          manager_name: managerName.trim(),
          money: startMoney,
          credits: startCredits,
          level: 1,
          xp: 0,
          fans: 1000,
          current_day: 1,
          ticket_price: 35,
          stadium_capacity: 10000,
          region: locale || 'TR',
          philosophy,
          primary_color: color1,
          secondary_color: color2,
          reputation: startReputation,
          academy_level: startAcademyLevel,
          is_bot: false,
          created_at: new Date().toISOString(),
        };

        const posCounts = { GK: 2, DEF: 8, MID: 7, FWD: 6 };
        const playersToInsert: any[] = [];
        Object.entries(posCounts).forEach(([pos, count]) => {
          for (let i = 0; i < count; i++) {
            const p = generateLocalizedPlayer(locale || 'TR', teamNameInput.trim(), 4, pos as any);
            playersToInsert.push({
              ...p,
              rating: Math.min(94, Math.floor(p.rating * squadQualityMod)),
              potential: Math.min(99, Math.floor((p.potential || p.rating + 10) * squadQualityMod)),
              position: pos,
              profile_id: userId,
              team_name: teamNameInput.trim(),
            });
          }
        });

        setProfile(fallbackProfile);
        setSquad(playersToInsert);

        // localStorage'a kaydet
        try {
          const { saveProfile: saveProfileLocal } = await import('./persistence');
          saveProfileLocal(fallbackProfile);
          savePlayers(playersToInsert, userId, teamNameInput.trim());
        } catch (saveErr) {
          console.warn('[initTeam] localStorage kayıt başarısız:', saveErr);
        }

        showToast(`4. Lig'de "${teamNameInput}" kuruldu! (Çevrimdışı mod)`, 'success');
      } catch (fallbackErr) {
        console.error('[initTeam] İstemci tarafı fallback de başarısız:', fallbackErr);
        showToast('Takım kurulurken bir hata oluştu. Lütfen sayfayı yenileyip tekrar deneyin.', 'error');
      }
    } finally {
      setLoading(false);
    }
  }, [userId, locale, setProfile, setSquad, setLoading]);

  // ── Sınır ötesi: Verileri yeniden yükle ──────────────────────
  const refreshData = useCallback(async (id?: string) => {
    const targetId = id || userId;
    if (!targetId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const isConfigured = isSupabaseConfigured();
      const supabase = isConfigured ? getSupabase() : null;

      let savedProfile: any = null;
      let pError: any = null;

      if (isConfigured && supabase) {
        const result = await supabase.from('profiles').select('id,manager_name,team_name,league_name,level,xp,money,fans,reputation,credits,current_day,team_id,defense_powers,ticket_price,academy_level,academy_extra_slots,stadium_capacity,region,active_upgrade_type,active_upgrade_id,active_upgrade_finish_day,active_upgrade_speedup,active_upgrade_started_at,active_upgrade_end_at,stadium_upgrades,sponsors,philosophy,primary_color,secondary_color,stadium_name,is_bot,bot_difficulty,academy_weekly_budget,last_youth_intake_season,total_trophies,total_awards,season_badges,hof_count,created_at,scout_slots,staff_coaches,staff_physios,staff_monthly_fees,role,league_tier,league_position,last_weekly_income,last_weekly_expense,last_weekly_net,financial_health,tv_revenue_weekly').eq('id', targetId).single();
        savedProfile = result.data;
        pError = result.error;
        // Admin rolünü aynı sorgudan kontrol et (ayrı sorguya gerek yok)
        setIsAdmin(result.data?.role === 'admin');

        // Akademi seviyesini user_academy tablosundan oku (tek kaynak: user_academy.current_level)
        if (savedProfile) {
          const { data: academyData } = await supabase
            .from('user_academy')
            .select('current_level')
            .eq('profile_id', targetId)
            .maybeSingle();

          if (academyData) {
            savedProfile.academy_level = academyData.current_level;
          }

          // ─── BÖLÜM 13: Sezon senkronizasyonu ─────────────
          try {
            const { data: userTeam } = await supabase
              .from('league_teams')
              .select('league_id')
              .eq('profile_id', targetId)
              .maybeSingle();

            if (userTeam?.league_id) {
              const { data: seasonData } = await supabase
                .from('seasons')
                .select('current_tur')
                .eq('league_id', userTeam.league_id)
                .eq('is_finished', false)
                .order('created_at', { ascending: false })
                .limit(1)
                .maybeSingle();

              if (seasonData?.current_tur && seasonData.current_tur > 1) {
                const syncedDay = (seasonData.current_tur - 1) * 7 + 1;
                if (savedProfile.current_day < syncedDay) {
                  savedProfile.current_day = syncedDay;
                }
              }
            }
          } catch (syncErr) {
            console.warn('[refreshData] Sezon senkronizasyonu hatası:', syncErr);
          }
        }
      }

      const savedTactic = await loadActiveTactic(targetId);
      const savedTraining = await loadTrainingState(targetId);

      // Lig Oyuncularını Yükle (Global Sıralama)
      if (isConfigured && supabase) {
        const { data: topPlayers } = await supabase
          .from('players')
          .select('id,name,position,specific_position,rating,potential,age,market_value,club,team_name,profile_id,is_for_sale,is_free_agent,scouted,scouting_stars,scouting_count,form_rating,morale,cond,is_injured,nation,salary,preferred_foot')
          .order('rating', { ascending: false })
          .limit(100);

        if (topPlayers) {
          const mapped = topPlayers.map((p: any) => ({
            ...p,
            rating: p.rating ?? p.klt ?? 60,
            passing: p.passing ?? p.pas ?? 50,
            shooting: p.shooting ?? p.sut ?? 50,
            defending: p.defending ?? p.tk ?? 50,
            speed: p.speed ?? p.hiz ?? 50,
            power: p.power ?? p.guc ?? 50,
            vision: p.vision ?? p.alg ?? 50,
            control: p.control ?? p.top ?? 50,
            heading: p.heading ?? p.kfa ?? 50,
            goalkeeping: p.goalkeeping ?? p.klc ?? 10,
          }));
          setLeague(mapped);
        }
      }

      if (pError || !savedProfile) {
        // YENİ KULLANICI AKIŞI: Otomatik seed'i burada durdur. ManagerRegistration initTeam'i halleder.
        // ÖNEMLİ: Bağlamda zaten bir profil varsa (örn. az önce kayıt olmuş), null'a sıfırlama
        // (kayıt → setProfile → refreshData → profile=null → ManagerRegistration tekrar döngüsü).
        setProfile((prev: Profile | null) => {
          if (prev) {
            console.warn('[refreshData] Supabase profil döndürmedi, ancak bağlamda zaten profil var. Mevcut profil korunuyor.');
            return prev;
          }
          return null;
        });
        setSquad(prev => prev.length > 0 ? prev : []);
        setLoading(false);
        return;
      } else {
        // Mevcut kullanıcılar için geri doldurma
        const backfilledProfile = {
          ...savedProfile,
          league_name: savedProfile.league_name || '4. Lig',
          primary_color: savedProfile.primary_color || '#ffffff',
          secondary_color: savedProfile.secondary_color || '#000000',
        };
        setProfile(backfilledProfile);
        const players = await loadPlayers(targetId, savedProfile.team_name);
        if (players && players.length > 0) {
          setSquad(players);
        } else {
          // Profil var ama oyuncu yok. Seed başarısız olmuş veya atlanmış olabilir.
          const userRegion = savedProfile.region || getBrowserLocale();
          const team = savedProfile.team_name || 'İsimsiz Kulüp';
          const tier = (savedProfile.league_name || '').includes('4') ? 4 : 1;

          const playersToInsert: any[] = [];
          const posCounts = { GK: 2, DEF: 8, MID: 7, FWD: 6 };

          Object.entries(posCounts).forEach(([pos, count]) => {
            for (let i = 0; i < count; i++) {
              const p = generateLocalizedPlayer(userRegion, team, tier, pos as any);
              playersToInsert.push({
                ...p,
                position: pos,
                profile_id: targetId,
                team_name: team
              });
            }
          });

          if (isConfigured && supabase) {
            const { data } = await supabase.from('players').insert(playersToInsert).select();
            if (data) setSquad(data);
            else setSquad(playersToInsert);
          } else {
            setSquad(playersToInsert);
          }
        }
      }

      if (savedTactic) setActiveTactic(savedTactic);
      if (savedTraining) setTrainingState(savedTraining);

      const savedWatchlist = await loadWatchlist(targetId);
      if (savedWatchlist && isConfigured && supabase) {
        // KALICI İZLEME LİSTESİ: Emekli oyuncuları kaldır
        const { data: activeWatchlistPlayers } = await supabase
          .from('players')
          .select('id, age')
          .in('id', savedWatchlist);

        if (activeWatchlistPlayers) {
          const retiredIds = activeWatchlistPlayers.filter(p => (p.age || 0) >= 38).map(p => p.id);
          const validIds = activeWatchlistPlayers.filter(p => (p.age || 0) < 38).map(p => p.id);

          if (retiredIds.length > 0) {
            await supabase.from('watchlist').delete().eq('user_id', targetId).in('player_id', retiredIds);
          }
          setWatchlist(validIds);
        } else {
          setWatchlist(savedWatchlist);
        }
      } else if (savedWatchlist) {
        setWatchlist(savedWatchlist);
      }
    } catch (err) {
      console.error('FM verileri yüklenemedi:', err);
      // Hata durumunda bile mümkünse rastgele takımla fallback
      const region = getBrowserLocale();
      const config = getRegionConfig(region);
      const randomT = config.teams[Math.floor(Math.random() * config.teams.length)];

      setProfile((current: any) => {
        if (!current) {
          return {
            id: targetId,
            team_name: randomT,
            manager_name: 'Misafir Menajer',
            money: 50000000,
            credits: 100,
            ticket_price: 20,
            academy_level: 1,
            reputation: 50,
            stadium_capacity: 5000,
            stadium_upgrades: {},
            current_day: 1,
            created_at: new Date().toISOString()
          };
        }
        return current;
      });
    } finally {
      setLoading(false);
    }
  }, [userId, setProfile, setSquad, setLeague, setActiveTactic, setTrainingState, setWatchlist, setIsAdmin, setLoading]);

  // ── Sınır ötesi: Oyuncu sat ──────────────────────────────────
  // BUG-7: profileRef kullanarak profile dependency'sini kaldırdık — referans stabil kalır
  const sellPlayer = useCallback(async (player: Player) => {
    const currentProfile = profileRef.current;
    if (!currentProfile) return;

    const taxRate = 0.025;
    const salePrice = player.market_value;
    const taxAmount = salePrice * taxRate;
    const netRevenue = salePrice - taxAmount;

    // Rollback için mevcut state'i yedekle
    const prevSquad = squadRef.current;
    const prevProfile = profileRef.current;

    // 1. Optimistic update: Kadrodan kaldır
    setSquad(prev => prev.filter(p => p.id !== player.id));

    // 2. Optimistic update: Profile para ekle
    setProfile(prev => prev ? {
      ...prev,
      money: (prev.money || 0) + netRevenue
    } : prev);

    // 3. Supabase'de güncelle (RPC ile — RLS uyumlu, atomik)
    try {
      if (isSupabaseConfigured()) {
        const supabase = getSupabase();
        if (supabase) {
          const { data: rpcResult, error: rpcError } = await supabase.rpc('rpc_sell_player', {
            p_profile_id: currentProfile.id,
            p_player_id: player.id,
          });
          if (rpcError) throw rpcError;
          if (!rpcResult?.success) throw new Error(rpcResult?.reason || 'Satış başarısız');
        }
      }
    } catch (err) {
      // Rollback: DB hatası durumunda state'i eski haline döndür
      console.error('[sellPlayer] DB hatası, rollback yapılıyor:', err);
      if (prevSquad) setSquad(prevSquad);
      if (prevProfile) setProfile(prevProfile);
      showToast('Oyuncu satışında hata oluştu, lütfen tekrar deneyin.', 'error');
      return;
    }

    return { success: true, netRevenue, taxAmount };
  }, [setProfile, setSquad]);

  // ── Sınır ötesi: Oyuncu keşfet ──────────────────────────────
  // BUG-7: refs kullanarak profile/squad dependency'lerini kaldırdık — referans stabil kalır
  const scoutPlayer = useCallback(async (playerId: string, playerObj?: Player) => {
    const currentProfile = profileRef.current;
    const currentSquad = squadRef.current;
    if (!currentProfile) return { success: false, reason: 'Profil bulunamadı' };

    // Kadroda veya sağlanan objede oyuncuyu bul
    const targetPlayer = currentSquad.find(p => p.id === playerId) || playerObj;

    if (!targetPlayer) return { success: false, reason: 'Oyuncu bulunamadı' };

    // ── Kendi kadrosundaki oyuncuyu scout etmek ücretsiz ──
    const isOwnPlayer = currentSquad.some(p => p.id === playerId) || playerObj?.profile_id === currentProfile?.id;

    // C4: Kendi takımındaki oyuncuyu scout etmek ücretsiz
    if (isOwnPlayer && playerObj?.profile_id === currentProfile?.id && !currentSquad.some(p => p.id === playerId)) {
      // Sadece scouting_stars kaydını güncelle, para kesme
      const supabase = getSupabase();
      if (supabase && playerObj) {
        await supabase.from('players')
          .update({ scouting_stars: (playerObj.scouting_stars || 0) + 1, scouted: true })
          .eq('id', playerId);
        return { success: true, player: { ...playerObj, scouting_stars: (playerObj.scouting_stars || 0) + 1, scouted: true } };
      }
    }

    // ── Scout maliyeti: seviyeye göre dinamik ──
    const scoutStars = trainingState?.scouting?.stars || 1;
    const scoutCostMap: Record<number, number> = { 1: 50000, 2: 50000, 3: 100000, 4: 200000, 5: 400000 };
    const scoutCost = isOwnPlayer ? 0 : (scoutCostMap[scoutStars] || 50000);

    if (scoutCost > 0 && (currentProfile.money || 0) < scoutCost) {
      return { success: false, reason: `Yetersiz bütçe (${formatCurrency(scoutCost)} gerekli)` };
    }

    const newMoney = (currentProfile.money || 0) - scoutCost;

    // Doğruluk hesapla — kendi oyuncusunda her zaman doğru
    const scoutCount = (targetPlayer.scouting_count || 0) + 1;
    const accuracy = isOwnPlayer ? 1.0 : Math.min(0.95, 0.2 + (scoutCount * 0.1) + (scoutStars * 0.05));

    const isCorrect = Math.random() < accuracy;

    let guessedStars = 3;
    const actualStars = Math.max(1, Math.min(5, Math.ceil((targetPlayer.potential || 70) / 20)));
    guessedStars = actualStars;
    if (!isCorrect) {
      // Yanlışsa 1-2 yıldız sapma
      const offset = Math.random() < 0.5 ? 1 : -1;
      guessedStars = Math.max(1, Math.min(5, actualStars + offset));
    }

    const updatedPlayer = {
      ...targetPlayer,
      scouted: true,
      scouting_stars: guessedStars,
      scouting_count: scoutCount
    };

    // Rollback için mevcut state'i yedekle
    const prevSquad = squadRef.current;
    const prevProfile = profileRef.current;

    // Optimistic update: Kadrodaki oyuncuyu güncelle
    if (currentSquad.find(p => p.id === playerId)) {
      setSquad(prev => prev.map(p => p.id === playerId ? updatedPlayer : p));
    }

    // Optimistic update: Profil parasını güncelle
    setProfile((prev: Profile | null) => prev ? { ...prev, money: newMoney } : prev);

    // Supabase'de güncelle (RPC ile — RLS uyumlu)
    try {
      if (isSupabaseConfigured()) {
        const supabase = getSupabase();
        if (supabase) {
          const { data: rpcResult, error: rpcError } = await supabase.rpc('rpc_scout_player', {
            p_profile_id: currentProfile.id,
            p_player_id: playerId,
            p_scout_cost: scoutCost,
            p_scouting_stars: guessedStars,
            p_scouting_count: scoutCount,
          });
          if (rpcError) throw rpcError;
          if (!rpcResult?.success) throw new Error(rpcResult?.reason || 'Scout başarısız');
        }
      }
    } catch (err) {
      // Rollback: DB hatası durumunda state'i eski haline döndür
      console.error('[scoutPlayer] DB hatası, rollback yapılıyor:', err);
      if (prevSquad) setSquad(prevSquad);
      if (prevProfile) setProfile(prevProfile);
      showToast('Oyuncu keşfinde hata oluştu, lütfen tekrar deneyin.', 'error');
      return { success: false, reason: 'Veritabanı hatası' };
    }

    return { success: true, player: updatedPlayer };
  }, [trainingState, setProfile, setSquad]);

  // ── Sınır ötesi: Hazırlık maçı oyna ─────────────────────────
  // BUG-7: refs kullanarak profile/squad dependency'lerini kaldırdık — referans stabil kalır
  const playFriendlyMatch = useCallback(async (isPaid: boolean = false) => {
    const currentProfile = profileRef.current;
    const currentSquad = squadRef.current;
    if (!currentProfile) return { success: false, reason: 'Profil bulunamadı' };

    // ── Günlük limit kontrolü ──
    const today = new Date().toISOString().split('T')[0];
    const lastFriendly = currentProfile.last_friendly_date;
    const friendlyCount = (lastFriendly === today) ? (currentProfile.daily_friendly_count || 0) : 0;
    if (friendlyCount >= 2) {
      return { success: false, reason: 'Günlük hazırlık maçı limitine ulaştınız (2/2).' };
    }

    if (isPaid && (currentProfile.credits || 0) < 1) {
      return { success: false, reason: 'Yetersiz Kredi (1 Kredi gerekli)' };
    }

    const newCredits = isPaid ? (currentProfile.credits || 0) - 1 : (currentProfile.credits || 0);

    // ── Poisson tabanlı skor hesaplama ──
    const homeAvgRating = currentSquad.slice(0, 11).reduce((s, p) => s + p.rating, 0) / Math.max(1, Math.min(11, currentSquad.length));
    const enemyRating = 60 + Math.random() * 15; // rastgele AI rakip
    const homeGoalLambda = Math.max(0.3, (homeAvgRating - enemyRating) * 0.05 + 1.2);
    const awayGoalLambda = Math.max(0.3, (enemyRating - homeAvgRating) * 0.05 + 1.2);
    const poissonSample = (lambda: number) => {
      let k = 0, p = Math.random();
      while (p > Math.exp(-lambda)) { p *= Math.random(); k++; }
      return Math.min(k, 6);
    };
    const homeScore = poissonSample(homeGoalLambda);
    const awayScore = poissonSample(awayGoalLambda);

    // ── Kondisyon maliyeti: her oyuncu 5-10 cond kaybeder ──
    const updatedSquad = currentSquad.map(p => ({
      ...p,
      cond: Math.max(0, (p.cond || 100) - (5 + Math.floor(Math.random() * 6)))
    }));
    setSquad(updatedSquad);

    const newCount = friendlyCount + 1;
    setProfile((prev: Profile | null) => prev ? {
      ...prev,
      credits: newCredits,
      last_friendly_date: today,
      daily_friendly_count: newCount,
    } : prev);

    if (isSupabaseConfigured()) {
      try {
        const supabase = getSupabase();
        if (!supabase) return { success: false, reason: 'Supabase bağlantı hatası' };

        // Profile credits güncelle (RPC ile — RLS uyumlu)
        await supabase.rpc('rpc_update_profile', {
          p_profile_id: currentProfile.id,
          p_updates: { credits: newCredits },
        });

        // Hazırlık maçı kaydı (RPC ile — RLS uyumlu)
        await supabase.rpc('rpc_insert_friendly_match', {
          p_profile_id: currentProfile.id,
          p_team_name: currentProfile.team_name || 'Bilinmeyen',
          p_home_score: homeScore,
          p_away_score: awayScore,
          p_match_data: { homeAvgRating, enemyRating, simulated: true },
        });

        // Oyuncu kondisyon toplu güncelle (RPC ile — RLS uyumlu)
        const condUpdates = updatedSquad.map(p => ({ id: p.id, cond: p.cond }));
        await supabase.rpc('rpc_update_player_cond', {
          p_profile_id: currentProfile.id,
          p_updates: condUpdates,
        });
      } catch (err) {
        console.error('[playFriendlyMatch] Supabase hatası:', err);
      }
    }

    return { success: true, homeScore, awayScore };
  }, [setProfile, setSquad]);

  // ── Sınır ötesi: İzleme listesine ekle/çıkar ────────────────
  // BUG-7: refs kullanarak profile/watchlist dependency'lerini kaldırdık — referans stabil kalır
  const watchlistRef = useRef(watchlist);
  watchlistRef.current = watchlist;

  const toggleWatchlist = useCallback(async (player: Player) => {
    const currentProfile = profileRef.current;
    const currentWatchlist = watchlistRef.current;
    if (!currentProfile || !player) return;

    // Emeklilik kontrolü
    if ((player.age || 0) >= 38) {
      showToast('Emekli olmuş oyuncular izleme listesine eklenemez.', 'info');
      return;
    }

    const playerId = player.id;
    const isWatched = currentWatchlist.includes(playerId);
    const newWatchlist = isWatched
      ? currentWatchlist.filter(id => id !== playerId)
      : [...currentWatchlist, playerId];

    setWatchlist(newWatchlist);
    saveWatchlist(currentProfile.id, newWatchlist);

    if (isSupabaseConfigured()) {
      const supabase = getSupabase();
      if (supabase) {
        try {
          if (isWatched) {
            await supabase.from('watchlist').delete().eq('user_id', currentProfile.id).eq('player_id', playerId);
          } else {
            // KRİTİK: FK kısıtlaması nedeniyle önce oyuncunun 'players' tablosunda olduğundan emin ol
            const { data: existingPlayer } = await supabase.from('players').select('id').eq('id', playerId).single();

            if (!existingPlayer) {
              await supabase.from('players').insert({
                ...player,
                profile_id: null,
                scouted: true
              });
            }

            await supabase.from('watchlist').insert({ user_id: currentProfile.id, player_id: playerId });
          }
        } catch (err) {
          console.error('İzleme listesi senkronizasyon hatası:', err);
        }
      }
    }
  }, [setWatchlist]);

  // ── Sınır ötesi: Transfer pazarlığı ──────────────────────────
  // BUG-7: profileRef kullanarak profile dependency'sini kaldırdık — referans stabil kalır
  const negotiatePurchase = useCallback(async (player: Player, offerPrice: number) => {
    const currentProfile = profileRef.current;
    if (!currentProfile) return { success: false, reason: 'Profil bulunamadı' };

    // Transfer penceresi kontrolü
    if (!isTransferWindowOpen(currentProfile?.current_day)) {
      const status = transferWindowStatus(currentProfile?.current_day);
      return {
        success: false,
        reason: `Transfer penceresi kapalı. ${status.nextOpenWeek ? `${status.nextOpenWeek}. haftada açılacak.` : ''}`,
      };
    }

    // FFP kısıtlama kontrolü
    if ((currentProfile as any)?.ffp_restricted) {
      return {
        success: false,
        reason: 'FFP kısıtlaması nedeniyle transfer yapılamıyor.',
      };
    }

    try {
      // market_value null/0 koruması
      const effectiveMarketValue = player.market_value && player.market_value > 0
        ? player.market_value
        : Math.round(Math.pow(player.rating || 60, 2.5) * 5000);

      const ratio = effectiveMarketValue > 0 ? offerPrice / effectiveMarketValue : 999;
      let accepted = false;
      let counterOffer = 0;

      if (ratio >= 1.2) {
        accepted = true; // %120+ her zaman kabul
      } else if (ratio < 0.5) {
        return { success: false, reason: 'Kulüp bu düşük teklifi hakaret olarak gördü ve masadan kalktı.' };
      } else if (ratio < 0.8) {
        // %50-80 arası: %20 kabul şansı, yoksa karşı teklif
        if (Math.random() < 0.2) {
          accepted = true;
        } else {
          counterOffer = Math.round(effectiveMarketValue * (1.0 + Math.random() * 0.2));
          return { success: false, reason: `Kulüp teklifi yetersiz buldu. Karşı teklif: ${formatCurrency(counterOffer)}`, counterOffer };
        }
      } else {
        // %80-120 arası: %85 kabul şansı
        const chance = (ratio - 0.8) / 0.4;
        if (Math.random() < 0.7 + chance * 0.15) {
          accepted = true;
        } else {
          counterOffer = Math.round(effectiveMarketValue * (1.05 + Math.random() * 0.1));
          return { success: false, reason: `Kulüp teklifi yetersiz buldu. Karşı teklif: ${formatCurrency(counterOffer)}`, counterOffer };
        }
      }

      if (accepted) {
        // Komisyon ve Bonus
        const agentCommission = Math.round(offerPrice * 0.05);
        const signingBonus = Math.round(offerPrice * 0.03);
        const totalCost = offerPrice + agentCommission + signingBonus;

        const currentMoney = currentProfile.money || 0;
        if (currentMoney < totalCost) {
          return { success: false, reason: `Yetersiz bütçe. Toplam maliyet (Komisyonlar dahil): ${formatCurrency(totalCost)}. Bütçen: ${formatCurrency(currentMoney)}` };
        }

        // Rollback için mevcut state'i yedekle (DB yazma öncesi)
        const prevSquad = squadRef.current;
        const prevProfile = profileRef.current;

        // ── Atomik transfer: RPC kullan (race condition önler) ──
        // ÖNEMLİ: RPC başarısız olursa hiçbir optimistic update yapmıyoruz —
        // bu yüzden rollback gerekmez. Optimistic update'ler RPC sonrasına kadar ertelenir.
        if (isSupabaseConfigured()) {
          const supabase = getSupabase();
          if (supabase) {
            const { data: rpcResult, error: rpcError } = await supabase.rpc('rpc_transfer_buy', {
              p_player_id: player.id,
              p_buyer_profile_id: currentProfile.id,
              p_buyer_team_name: currentProfile.team_name,
              p_offer_price: offerPrice,
              p_agent_commission: agentCommission,
              p_signing_bonus: signingBonus,
            });

            if (rpcError) {
              console.error('[TRANSFER] RPC hatası:', rpcError.message);
              return { success: false, reason: `Transfer sırasında hata: ${rpcError.message}` };
            }

            if (!rpcResult?.success) {
              return { success: false, reason: rpcResult?.reason || 'Transfer başarısız oldu.' };
            }
          }
        }

        // RPC başarılı — şimdi optimistic update uygula
        // Oyuncuyu kadroya ekle (UI state)
        // Transfer kondisyonu DB'ye yaz
        if (isSupabaseConfigured()) {
          const _sb = getSupabase();
          if (_sb) {
            const _newCond   = Math.max(30, (player.cond   ?? 100) - 10);
            const _newMorale = Math.max(20, (player.morale ?? 70)  -  5);
            _sb.rpc('rpc_save_training_result', {
              p_profile_id: currentProfile.id,
              p_player_id: player.id,
              p_updates: { cond: _newCond, morale: _newMorale },
            }).then(() => {});  // Fire-and-forget (RLS uyumlu)
          }
        }

        const transferredPlayer = {
          ...player,
          profile_id: currentProfile.id,
          team_name: currentProfile.team_name,
          club: currentProfile.team_name,
          market_value: effectiveMarketValue,
          cond:   Math.max(30, (player.cond   ?? 100) - 10),  // -3 → -10
          morale: Math.max(20, (player.morale ?? 70)  -  5),
        };
        setSquad(prev => [...prev, transferredPlayer]);

        // Bütçeyi güncelle (UI state)
        const newMoney = currentMoney - totalCost;
        setProfile((prev: Profile | null) => prev ? { ...prev, money: newMoney } : prev);

        // Oyuncuyu transfer listesinden (league state) kaldır
        setLeague((prev) => prev.filter((p) => p.id !== player.id));

        console.log(`[TRANSFER] ${player.name} → ${currentProfile.team_name}, Bedel: ${formatCurrency(offerPrice)}`);
        playSound('transfer');
        return { success: true, totalCost, agentCommission, signingBonus };
      }

      return { success: false, reason: 'Bilinmeyen bir hata oluştu.' };
    } catch (err: any) {
      console.error('[TRANSFER HATASI]', err);
      // negotiatePurchase'ta RPC öncesi optimistic update yok,
      // ama güvenli olmak için rollback mekanizmasını koruyoruz
      return { success: false, reason: `Transfer sırasında hata oluştu: ${err.message || 'Bilinmeyen hata'}` };
    }
  }, [setProfile, setSquad, setLeague]);

  // ── BUG-7: Türetilmiş değerler — useMemo ile hesaplanan ──────
  const squadByRating = useMemo(() => {
    return [...squad].sort((a, b) => (b.rating || 0) - (a.rating || 0));
  }, [squad]);

  const financialSummary = useMemo(() => {
    const totalDailyWages = squad.reduce((acc, p) => acc + (p.salary || 0) / 30, 0);
    const totalMarketValue = squad.reduce((acc, p) => acc + (p.market_value || 0), 0);
    const avgRating = squad.length > 0
      ? squad.reduce((acc, p) => acc + (p.rating || 0), 0) / squad.length
      : 0;
    return { totalDailyWages, totalMarketValue, squadSize: squad.length, avgRating };
  }, [squad]);

  // ── Sınır ötesi: userId değişince otomatik yenile ───────────
  useEffect(() => {
    if (userId) {
      refreshData(userId);
    } else {
      // Kullanıcı yok = tüm oyun durumunu temizle
      setProfile(null);
      setSquad([]);
      setWatchlist([]);
      setLoading(false);
    }
  }, [userId]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Sınır ötesi: Kadro otomatik kayıt ────────────────────────
  useEffect(() => {
    if (userId && squad.length > 0) {
      savePlayers(squad as any, userId, profile?.team_name || 'Başakşehir');
    }
  }, [squad, userId, profile?.team_name]);

  // ── Sınır ötesi: Taktik otomatik kayıt ───────────────────────
  useEffect(() => {
    if (userId && activeTactic) {
      saveActiveTactic(userId, activeTactic as any);
    }
  }, [activeTactic, userId]);

  // ── Sınır ötesi: Antrenman durumu otomatik kayıt ─────────────
  useEffect(() => {
    if (userId && trainingState) {
      saveTrainingState(userId, trainingState as any);
    }
  }, [trainingState, userId]);

  // ── PERF-8: Bağlam değerini memoize et ───────────────────────
  // Değer objesi yalnızca bağımlılıklardan biri gerçekten değiştiğinde yeniden oluşturulur.
  const contextValue = useMemo<FMContextValue>(() => ({
    userId, authEmail, isAdmin, profile, setProfile,
    squad, setSquad, activeTactic, setActiveTactic,
    trainingState, setTrainingState,
    league, setLeague,
    selectedTeamProfile, setSelectedTeamProfile,
    directMessageRecipient, setDirectMessageRecipient,
    loading, setLoading, refreshData,
    locale, setLocale,
    sellPlayer, scoutPlayer, playFriendlyMatch,
    watchlist, toggleWatchlist,
    negotiatePurchase, addSponsor, initTeam,
    activeTab, setActiveTab,
    squadByRating, financialSummary,
  }), [
    userId, authEmail, isAdmin, profile, setProfile,
    squad, setSquad, activeTactic, setActiveTactic,
    trainingState, setTrainingState,
    league, setLeague,
    selectedTeamProfile, setSelectedTeamProfile,
    directMessageRecipient, setDirectMessageRecipient,
    loading, setLoading, refreshData,
    locale, setLocale,
    sellPlayer, scoutPlayer, playFriendlyMatch,
    watchlist, toggleWatchlist,
    negotiatePurchase, addSponsor, initTeam,
    activeTab, setActiveTab,
    squadByRating, financialSummary,
  ]);

  return (
    <FMContext.Provider value={contextValue}>
      {children}
    </FMContext.Provider>
  );
};

// ── FMProvider: 4 alt-sağlayıcıyı iç içe sarar ─────────────────
export const FMProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <ProfileProvider>
      <SquadProvider>
        <GameOpsProvider>
          <UIProvider>
            <FMProviderInner>
              {children}
            </FMProviderInner>
          </UIProvider>
        </GameOpsProvider>
      </SquadProvider>
    </ProfileProvider>
  );
};

// ── useFM: Geriye uyumlu kanca (hook) — aynı arayüz ────────────
export const useFM = () => {
  const context = useContext(FMContext);
  if (!context) throw new Error('useFM bir FMProvider içinde kullanılmalıdır');
  return context;
};

// ── BUG-7: useShallowFM — ayrı dosyadan yeniden dışa aktar ────
export { useShallowFM } from './hooks/useShallowFM';
// FMContext zaten yukarıda re-export edildi
