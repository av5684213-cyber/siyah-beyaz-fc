/**
 * matchConsequencesService.ts - Maç Sonrası Cezalar ve Sakatlık Servisi (ADIM 2B/2C)
 *
 * Maç simülasyonu sonrası:
 * - Sarı/kırmızı kart cezalarını uygular (suspended_until)
 * - Sakatlık durumlarını günceller (is_injured, injury_end_date, injury_history)
 * - Maç olaylarını kaydeder (match_history.events)
 */

import { Player, InjuryRecord } from './types';
import { getSupabase, isSupabaseConfigured } from '../supabase';
import { addInjuryRecord, generateInjuryRecord } from './formRatingService';

// ═══════════════════════════════════════════════════════════════
// SAKATLIK TİPLERİ VE SÜRELERİ
// ═══════════════════════════════════════════════════════════════

/** Sakatlık tipi → tahmini süre aralığı (gün) */
const INJURY_DURATION_MAP: Record<string, [number, number]> = {
  'hamstring': [7, 21],
  'ankle': [5, 14],
  'knee': [10, 21],
  'shoulder': [7, 14],
  'back': [5, 14],
  'groin': [7, 18],
  'calf': [5, 12],
  'thigh': [7, 14],
  'wrist': [3, 7],
  'rib': [3, 10],
  'concussion': [7, 14],
  'muscle_strain': [5, 14],
  'ligament': [10, 21],
  'tendinitis': [7, 14],
};

const INJURY_TYPES = Object.keys(INJURY_DURATION_MAP);

// ═══════════════════════════════════════════════════════════════
// KART CEZASI HESAPLAMA
// ═══════════════════════════════════════════════════════════════

/**
 * Maç sonrası kart cezalarını hesaplar ve uygular.
 *
 * Kurallar:
 * - 1 sarı kart: sezonluk kümülatif sayı artar
 * - 2 sarı kart (aynı maçta): 1 maç ceza → suspended_until = sonraki maç tarihi
 * - Kırmızı kart: 1 maç ceza → suspended_until = sonraki maç tarihi
 * - Kümülatif 5 sarı kart: 1 maç ceza (5, 10, 15... her 5'in katında)
 *
 * @param matchEvents - Maç olayları (yellow_card, red_card)
 * @param playerIds - Maçtaki oyuncu ID'leri
 * @returns Güncellenen oyuncu listesi
 */
export async function applyCardSuspensions(
  matchEvents: Array<{ type: string; playerId: string; team: string }>,
  nextMatchDate?: Date
): Promise<{ updated: string[]; errors: string[] }> {
  if (!isSupabaseConfigured()) {
    return { updated: [], errors: ['Supabase not configured'] };
  }

  const supabase = getSupabase();
  if (!supabase) {
    return { updated: [], errors: ['Supabase client is null'] };
  }

  const updated: string[] = [];
  const errors: string[] = [];

  // Her oyuncunun kart sayısını hesapla
  const cardCounts = new Map<string, { yellow: number; red: number }>();

  for (const event of matchEvents) {
    if (event.type === 'yellow_card' || event.type === 'YELLOW') {
      const existing = cardCounts.get(event.playerId) || { yellow: 0, red: 0 };
      existing.yellow++;
      cardCounts.set(event.playerId, existing);
    }
    if (event.type === 'red_card' || event.type === 'RED') {
      const existing = cardCounts.get(event.playerId) || { yellow: 0, red: 0 };
      existing.red++;
      cardCounts.set(event.playerId, existing);
    }
  }

  // Cezalı oyuncuları belirle
  // S3-2 FIX: Varsayılan 3 gün (yaklaşık 1 maç) — ideally callers should pass nextMatchDate
  const suspendedDate = nextMatchDate || new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);

  for (const [playerId, cards] of cardCounts) {
    let shouldSuspend = false;
    let reason = '';

    if (cards.red >= 1) {
      // Kırmızı kart: 1 maç ceza
      shouldSuspend = true;
      reason = `Kırmızı kart: ${cards.red} kırmızı kart`;
    } else if (cards.yellow >= 2) {
      // 2 sarı kart (aynı maçta): 1 maç ceza
      shouldSuspend = true;
      reason = `Çift sarı kart: ${cards.yellow} sarı kart`;
    }

    // ── Kümülatif sarı kart kontrolü ──
    // Bu maçtaki sarı kartları sezonluk sayıya ekle
    try {
      const { data: playerData } = await supabase
        .from('players')
        .select('season_yellow_cards')
        .eq('id', playerId)
        .maybeSingle();

      const currentSeasonYellows = (playerData?.season_yellow_cards || 0) + cards.yellow;
      
      // Sezonluk sarı kart sayısını güncelle
      await supabase
        .from('players')
        .update({ season_yellow_cards: currentSeasonYellows })
        .eq('id', playerId);

      // 5'in katlarıysa ceza ver (5, 10, 15...)
      if (cards.yellow > 0 && currentSeasonYellows >= 5 && currentSeasonYellows % 5 === 0) {
        shouldSuspend = true;
        reason = `Kümülatif ${currentSeasonYellows} sarı kart: 1 maç ceza`;
      }
    } catch (e) {
      console.warn(`[matchConsequences] season_yellow_cards update failed for ${playerId}:`, e);
    }

    if (shouldSuspend) {
      try {
        const { error } = await supabase
          .from('players')
          .update({ suspended_until: suspendedDate.toISOString().split('T')[0] })
          .eq('id', playerId);

        if (error) {
          errors.push(`Failed to suspend player ${playerId}: ${error.message}`);
          console.error(`[matchConsequences] Failed to suspend ${playerId}:`, error);
        } else {
          updated.push(playerId);
          console.log(`[matchConsequences] Player ${playerId} suspended until ${suspendedDate.toISOString().split('T')[0]}: ${reason}`);
        }
      } catch (err) {
        errors.push(`Exception suspending player ${playerId}: ${err}`);
      }
    }
  }

  return { updated, errors };
}

// ═══════════════════════════════════════════════════════════════
// SAKATLIK ŞİDDETİ EŞLEME FONKSİYONU
// ═══════════════════════════════════════════════════════════════

/**
 * Sakatlık tipine göre doğru severity (şiddet) seviyesini belirler.
 * 
 * Eski mantık: concussion → 'risky', ligament → 'chronic', diğer → 'light'
 * Bu yanlıştı: knee, ankle, hamstring gibi ciddi sakatlıklar 'light' olarak kaydediliyordu.
 * 
 * Yeni mantık: Sakatlık tipine göre 3 kategorili eşleme
 * - heavy: Bağ kopması, beyin sarsıntısı, kırık, ACL, menisküs
 * - medium: Diz, ayak bileği, hamstrings, omuz, kalça, sırt
 * - light: Diğer hafif sakatlıklar (kas gerilmesi, bilek, kaburga vb.)
 */
function getInjurySeverity(injuryType: string): 'light' | 'medium' | 'heavy' {
  const HEAVY_TYPES = ['ligament', 'concussion', 'fracture', 'acl', 'meniscus'];
  const MEDIUM_TYPES = ['knee', 'ankle', 'hamstring', 'shoulder', 'hip', 'back'];
  
  if (HEAVY_TYPES.includes(injuryType)) return 'heavy';
  if (MEDIUM_TYPES.includes(injuryType)) return 'medium';
  return 'light';
}

// ═══════════════════════════════════════════════════════════════
// SAKATLIK UYGULAMA
// ═══════════════════════════════════════════════════════════════

/**
 * Maç sırasında sakatlanan oyunculara sakatlık uygular.
 *
 * @param injuryEvents - Maçtaki sakatlık olayları
 * @returns Güncellenen oyuncu ID'leri ve hatalar
 */
export async function applyMatchInjuries(
  injuryEvents: Array<{ playerId: string; playerName?: string; injuryType?: string; injuryDays?: number; injurySeverity?: string }>
): Promise<{ updated: string[]; errors: string[] }> {
  if (!isSupabaseConfigured()) {
    return { updated: [], errors: ['Supabase not configured'] };
  }

  const supabase = getSupabase();
  if (!supabase) {
    return { updated: [], errors: ['Supabase client is null'] };
  }

  const updated: string[] = [];
  const errors: string[] = [];

  for (const event of injuryEvents) {
    try {
      // Maç motorundan gelen sakatlık bilgisini önceliklendir (tutarlılık)
      // Eğer motor bilgi verdiyse onu kullan, yoksa geriye dönük uyumlu şekilde üret
      let injuryType: string;
      let durationDays: number;

      if (event.injuryType && event.injuryDays && event.injuryDays > 0) {
        // Maç motorundan gelen veriyi doğrudan kullan (tutarsızlık önleme)
        injuryType = event.injuryType;
        durationDays = Math.max(1, Math.min(30, event.injuryDays));
      } else {
        // Geriye dönük uyum: rastgele sakatlık tipi ve süre üret
        injuryType = INJURY_TYPES[Math.floor(Math.random() * INJURY_TYPES.length)];
        const [minDays, maxDays] = INJURY_DURATION_MAP[injuryType] || [3, 21];
        durationDays = minDays + Math.floor(Math.random() * (maxDays - minDays + 1));
      }

      const injuryEndDate = new Date();
      injuryEndDate.setDate(injuryEndDate.getDate() + durationDays);

      // Sakatlık kaydı oluştur
      const injuryRecord: InjuryRecord = {
        date: new Date().toISOString().split('T')[0],
        duration_days: durationDays,
        type: injuryType,
      };

      // Mevcut injury_history'yi çek, yenisini ekle
      const { data: playerData } = await supabase
        .from('players')
        .select('injury_history, injury')
        .eq('id', event.playerId)
        .single();

      let currentHistory: InjuryRecord[] = [];
      if (playerData?.injury_history) {
        try {
          currentHistory = typeof playerData.injury_history === 'string'
            ? JSON.parse(playerData.injury_history)
            : playerData.injury_history;
        } catch { currentHistory = []; }
      }

      const updatedHistory = addInjuryRecord(currentHistory, injuryRecord);

      // injury alanını da güncelle (mevcut sakatlık)
      // Sakatlık tipine göre doğru severity ve type eşlemesi
      const injurySeverity = getInjurySeverity(injuryType);
      const injuryTypeLabel = injurySeverity === 'heavy' ? 'chronic' : injurySeverity === 'medium' ? 'moderate' : 'light';
      const injuryObj = {
        type: injuryTypeLabel,
        remaining_days: durationDays,
        severity: injurySeverity === 'heavy' ? 3 : injurySeverity === 'medium' ? 2 : 1,
      };

      const { error } = await supabase
        .from('players')
        .update({
          is_injured: true,
          injury_end_date: injuryEndDate.toISOString().split('T')[0],
          injury: JSON.stringify(injuryObj),
          injury_history: JSON.stringify(updatedHistory),
        })
        .eq('id', event.playerId);

      if (error) {
        errors.push(`Failed to injure player ${event.playerId}: ${error.message}`);
        console.error(`[matchConsequences] Failed to apply injury to ${event.playerId}:`, error);
      } else {
        updated.push(event.playerId);
        console.log(`[matchConsequences] Player ${event.playerId} injured: ${injuryType}, ${durationDays} days (until ${injuryEndDate.toISOString().split('T')[0]})`);
      }
    } catch (err) {
      errors.push(`Exception injuring player ${event.playerId}: ${err}`);
    }
  }

  return { updated, errors };
}

// ═══════════════════════════════════════════════════════════════
// CEZALI/SAKAT OYUNCULARI TEMİZLE (GÜNLÜK CRON İÇİN)
// ═══════════════════════════════════════════════════════════════

/**
 * Süresi dolan cezaları ve sakatlıkları temizler.
 * Günlük cron job tarafından çağrılır.
 */
export async function cleanupExpiredSuspensionsAndInjuries(): Promise<{
  unsuspended: number;
  healed: number;
  errors: string[];
}> {
  if (!isSupabaseConfigured()) {
    return { unsuspended: 0, healed: 0, errors: ['Supabase not configured'] };
  }

  const supabase = getSupabase();
  if (!supabase) {
    return { unsuspended: 0, healed: 0, errors: ['Supabase client is null'] };
  }

  const errors: string[] = [];
  let unsuspended = 0;
  let healed = 0;

  try {
    const today = new Date().toISOString().split('T')[0];

    // Süresi dolan cezaları kaldır
    const { data: suspendedPlayers, error: suspError } = await supabase
      .from('players')
      .select('id')
      .lt('suspended_until', today)
      .not('suspended_until', 'is', null);

    if (suspError) {
      errors.push(`Failed to fetch suspended players: ${suspError.message}`);
    } else if (suspendedPlayers && suspendedPlayers.length > 0) {
      const { error: updateError } = await supabase
        .from('players')
        .update({ suspended_until: null })
        .lt('suspended_until', today)
        .not('suspended_until', 'is', null);

      if (updateError) {
        errors.push(`Failed to clear suspensions: ${updateError.message}`);
      } else {
        unsuspended = suspendedPlayers.length;
        console.log(`[matchConsequences] Cleared ${unsuspended} expired suspensions`);
      }
    }

    // Süresi dolan sakatlıkları kaldır
    const { data: injuredPlayers, error: injError } = await supabase
      .from('players')
      .select('id, form_rating, injury_severity')
      .eq('is_injured', true)
      .lt('injury_end_date', today);

    if (injError) {
      errors.push(`Failed to fetch injured players: ${injError.message}`);
    } else if (injuredPlayers && injuredPlayers.length > 0) {
      // Her iyileşen oyuncunun form_rating'ini düşür (maç sharpness kaybı)
      for (const player of injuredPlayers) {
        const currentForm = player.form_rating || 50;
        // Sakatlık şiddetine göre form düşüşü: hafif -10, orta -15, ağır -25
        const severity = player.injury_severity || 'medium';
        const formDrop = severity === 'severe' ? 25 : severity === 'medium' ? 15 : 10;
        const newForm = Math.max(15, currentForm - formDrop);

        await supabase
          .from('players')
          .update({
            is_injured: false,
            injury_end_date: null,
            injury: null,
            injury_severity: null,
            form_rating: newForm,
          })
          .eq('id', player.id);
      }

      healed = injuredPlayers.length;
      console.log(`[matchConsequences] Healed ${healed} players from injury (with form drop)`);
    }
  } catch (err) {
    errors.push(`Fatal error in cleanup: ${err}`);
  }

  return { unsuspended, healed, errors };
}

// ═══════════════════════════════════════════════════════════════
// KADRO FİLTRELEME (CEZALI VE SAKAT OYUNCULARI ÇIKAR)
// ═══════════════════════════════════════════════════════════════

/**
 * Verilen kadrodan cezalı ve sakat oyuncuları filtreler.
 * Maç başlamadan önce çağrılmalıdır.
 *
 * @param squad - Takım kadrosu
 * @returns Filtrelenmiş kadro (cezalı ve sakat oyuncular çıkarılmış)
 */
export function filterAvailablePlayers(squad: Player[]): {
  available: Player[];
  suspended: Player[];
  injured: Player[];
} {
  const today = new Date().toISOString().split('T')[0];

  const suspended: Player[] = [];
  const injured: Player[] = [];
  const available: Player[] = [];

  for (const player of squad) {
    // Cezalı mı kontrol et
    if (player.suspended_until && player.suspended_until >= today) {
      suspended.push(player);
      continue;
    }

    // Sakat mı kontrol et (hem is_injured hem de injury alanı)
    if (player.is_injured || (player.injury && player.injury.remaining_days > 0)) {
      // injury_end_date kontrolü
      if (player.injury_end_date && player.injury_end_date > today) {
        injured.push(player);
        continue;
      }
    }

    available.push(player);
  }

  return { available, suspended, injured };
}

// ═══════════════════════════════════════════════════════════════
// MAÇ OLAYLARINI KAYDET
// ═══════════════════════════════════════════════════════════════

/**
 * Maç olaylarını match_history tablosuna kaydeder.
 *
 * @param matchId - Maç kaydı ID
 * @param events - Olay dizisi
 */
export async function saveMatchEvents(
  matchId: string,
  events: Array<Record<string, any>>
): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;

  const supabase = getSupabase();
  if (!supabase) return false;

  try {
    const { error } = await supabase
      .from('match_history')
      .update({ events: JSON.stringify(events) })
      .eq('id', matchId);

    if (error) {
      console.error('[matchConsequences] Failed to save match events:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('[matchConsequences] Exception saving match events:', err);
    return false;
  }
}
