/**
 * Paylaşılan Maç Başlatıcı Yardımcıları
 *
 * match-scheduler, match-scheduler-cup, match-scheduler-playoff
 * arasında kopyalanan ortak fonksiyonların merkezi tanımı.
 *
 * DRY ilkesi: Tek dosyada tanımla, her yerden içe aktar.
 */

// ═══════════════════════════════════════════════════════════════
// Oyuncu filtreleme (cezalı/sakat/kondisyon)
// ═══════════════════════════════════════════════════════════════

/**
 * Oyuncu listesini filtrele — cezalı, sakat ve düşük kondisyonluları ele
 *
 * @param players - Tüm oyuncu listesi
 * @param strict - true: kondisyon < 15 olanları da ele, false: sadece sakat/cezalıları ele
 */
export function filterAvailable(players: any[], strict: boolean = true): any[] {
  const todayDate = new Date().toISOString().split('T')[0];
  return players.filter(p => {
    // Cezalı oyuncuları ele
    if (p.suspended_until && p.suspended_until >= todayDate) return false;
    // Sakat oyuncuları ele
    if (p.is_injured) return false;
    // Enjury detay kontrolü
    if (p.injury) {
      try {
        const inj = typeof p.injury === 'string' ? JSON.parse(p.injury) : p.injury;
        if (inj.remaining_days > 0) return false;
      } catch { /* ignore */ }
    }
    // Strict modda düşük kondisyonluları ele
    if (strict && (p.cond ?? 100) < 15) return false;
    return true;
  });
}

// ═══════════════════════════════════════════════════════════════
// Taktik → goalMod/conceedMod dönüşümü
// ═══════════════════════════════════════════════════════════════

/**
 * Taktik string'ini gol/conceed modifiyerlerine dönüştür
 *
 * Hücum: +0.10 gol, +0.05 yemek
 * Savunma: -0.05 gol, -0.10 yemek
 * Kontra: +0.05 gol, 0.00 yemek
 * Pres: +0.03 gol, +0.02 yemek
 * Normal/Dengeli: 0, 0
 */
export function tacticToModifiers(tacticStr: string): { goalMod: number; conceedMod: number } {
  switch (tacticStr) {
    case 'hucum':
    case 'attack':
      return { goalMod: 0.10, conceedMod: 0.05 };
    case 'savunma':
    case 'defense':
      return { goalMod: -0.05, conceedMod: -0.10 };
    case 'kontra':
    case 'counter':
      return { goalMod: 0.05, conceedMod: 0.0 };
    case 'pres':
    case 'press':
      return { goalMod: 0.03, conceedMod: 0.02 };
    case 'normal':
    case 'dengeli':
    default:
      return { goalMod: 0, conceedMod: 0 };
  }
}

// ═══════════════════════════════════════════════════════════════
// In-app bildirim yardımcısı (graceful — tablo yoksa atla)
// ═══════════════════════════════════════════════════════════════

/**
 * Kullanıcıya uygulama içi bildirim gönder
 * Hata olursa sessizce atla — bildirim kritik yol değil
 */
export async function insertInAppNotification(
  supabase: any,
  profileId: string,
  title: string,
  body: string,
  type: string,
  fixtureId?: string,
): Promise<void> {
  try {
    await supabase.from('notifications').insert({
      profile_id: profileId,
      title,
      body,
      type,
      url: fixtureId ? `/match/${fixtureId}` : null,
      is_read: false,
    });
  } catch (err) {
    console.warn('[matchSchedulerUtils] Bildirim atlandı:', err);
  }
}

// ═══════════════════════════════════════════════════════════════
// Hükmen mağlubiyet uygulama
// ═══════════════════════════════════════════════════════════════

/**
 * Yetersiz kadro durumunda hükmen mağlubiyet uygula
 *
 * Kurallar:
 * - Ev sahibi < 7 oyuncu → ev 0-3 deplasman
 * - Deplasman < 7 oyuncu → deplasman 0-3 ev sahibi
 * - İki taraf da < 7 → çift hükmen: 0-0 (her iki taraf kaybeder)
 */
export async function applyForfeitResult(
  supabase: any,
  fixtureId: string,
  homeAvailable: number,
  awayAvailable: number,
): Promise<{ homeScore: number; awayScore: number; note: string }> {
  const homeForfeit = homeAvailable < 7;
  const awayForfeit = awayAvailable < 7;

  let homeScore = 0;
  let awayScore = 0;
  let note = '';

  if (homeForfeit && awayForfeit) {
    // Çift hükmen mağlubiyet
    homeScore = 0;
    awayScore = 0;
    note = `Çift hükmen: Ev (${homeAvailable}) ve Dep (${awayAvailable}) yetersiz kadro`;
  } else if (homeForfeit) {
    homeScore = 0;
    awayScore = 3;
    note = `Hükmen: Ev sahibi yetersiz kadro (${homeAvailable} oyuncu)`;
  } else {
    homeScore = 3;
    awayScore = 0;
    note = `Hükmen: Deplasman yetersiz kadro (${awayAvailable} oyuncu)`;
  }

  await supabase.from('fixtures').update({
    status: 'completed',
    home_score: homeScore,
    away_score: awayScore,
  }).eq('id', fixtureId);

  return { homeScore, awayScore, note };
}
