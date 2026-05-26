// =============================================================================
// Tactics Engine — Büyüme / Bozulma Sistemi
// =============================================================================
// Aktif taktik slotlarına göre teamStats değerlerinin gelişimi ve çürümesi.
// Kullanılmayan özellikler zamanla azalır, aktif olanlar hafif artar.

// ─── Slot → Stats Eşleşme Haritası ──────────────────────────────────────────
// Her taktik slot ID'si, teamStats üzerinde hangi key'leri etkilediğini belirtir.
// Prompt'ta tanımlanan eşleşmeler:
//   pressing    → stats.pressing veya stats.pressIntensity
//   offsideTrap → stats.defenseLine
//   crossGame   → stats.width
//   parkTheBus  → stats.defenseSolidity
// Ek olarak mevcut sistemle uyumlu eşleşmeler de eklenmiştir:
//   attacking        → stats.attack
//   defending        → stats.defense
//   passing          → stats.chemistry
//   fitness          → stats.stamina
//   goalkeeping      → stats.defense (kaleci de defans katkısı yapar)
//   setPieces        → stats.attack
//   mentality        → stats.chemistry
//   general_433      → stats.attack, stats.chemistry
//   loneStrikerCounter → stats.attack, stats.defense
//   screenKeeper     → stats.defense
//   wasteTime        → stats.chemistry

const SLOT_TO_STATS: Record<string, string[]> = {
  // Prompt'ta belirtilen eşleşmeler
  pressing:          ['pressing', 'pressIntensity'],
  offsideTrap:       ['defenseLine'],
  crossGame:         ['width'],
  parkTheBus:        ['defenseSolidity'],

  // Mevcut sistemle geriye uyumlu eşleşmeler
  attacking:         ['attack'],
  defending:         ['defense'],
  passing:           ['chemistry'],
  fitness:           ['stamina'],
  goalkeeping:       ['defense'],
  setPieces:         ['attack'],
  mentality:         ['chemistry'],
  general_433:       ['attack', 'chemistry'],
  loneStrikerCounter: ['attack', 'defense'],
  screenKeeper:      ['defense'],
  wasteTime:         ['chemistry'],
};

// ─── Büyüme Sabitleri ────────────────────────────────────────────────────────
const GROWTH_INCREMENT = 0.5;  // Aktif slot başına artış
const GROWTH_MAX = 100;        // Maksimum stat değeri

// ─── Bozulma Sabitleri ────────────────────────────────────────────────────────
const DECAY_DECREMENT = 0.2;   // Kullanılmayan stat başına azalış
const DECAY_MIN = 0;           // Minimum stat değeri

// =============================================================================
// processTacticalGrowth
// =============================================================================
// slots dizisindeki her slot için, stats nesnesinde SLOT_TO_STATS
// eşleşmesine göre karşılık gelen key varsa o değeri +0.5 artırır.
// Maksimum 100 ile sınırlıdır. Eşleşme bulunamayan slotlar atlanır.

export function processTacticalGrowth(
  stats: Record<string, number>,
  slots: string[],
): { newStats: Record<string, number> } {
  if (!stats || !slots || slots.length === 0) return { newStats: stats };

  const newStats: Record<string, number> = { ...stats };

  for (const slot of slots) {
    const affectedKeys = SLOT_TO_STATS[slot];
    if (!affectedKeys) continue; // Eşleşme yoksa atla

    for (const key of affectedKeys) {
      if (typeof newStats[key] === 'number') {
        // +0.5 artış, maksimum 100
        newStats[key] = Math.min(GROWTH_MAX, newStats[key] + GROWTH_INCREMENT);
      }
    }
  }

  return { newStats };
}

// =============================================================================
// processTacticalDecay
// =============================================================================
// slots dizisinde OLMAYAN her key için (yani aktif kullanılmayan taktik
// özellikler) stats değerini −0.2 düşürür. Minimum 0 ile sınırlıdır.
// Sadece SLOT_TO_STATS eşleşmesinde tanımlı olan key'ler çürüme adayıdır;
// tanımsız key'ler dokunulmaz.

export function processTacticalDecay(
  stats: Record<string, number>,
  slots: string[],
): { newStats: Record<string, number> } {
  if (!stats || !slots || slots.length === 0) return { newStats: stats };

  const newStats: Record<string, number> = { ...stats };

  // Aktif slotların etkilediği tüm stat key'lerini topla
  const activeStatKeys = new Set<string>();
  for (const slot of slots) {
    const affectedKeys = SLOT_TO_STATS[slot];
    if (affectedKeys) {
      for (const key of affectedKeys) {
        activeStatKeys.add(key);
      }
    }
  }

  // Tüm tanımlı stat key'lerini topla (sadece SLOT_TO_STATS'ta olanlar çürür)
  const allDefinedStatKeys = new Set<string>();
  for (const keys of Object.values(SLOT_TO_STATS)) {
    for (const key of keys) {
      allDefinedStatKeys.add(key);
    }
  }

  // Aktif olmayan ve tanımlı olan stat'lerde −0.2 düşüş
  for (const key of allDefinedStatKeys) {
    if (!activeStatKeys.has(key) && typeof newStats[key] === 'number') {
      newStats[key] = Math.max(DECAY_MIN, newStats[key] - DECAY_DECREMENT);
    }
  }

  return { newStats };
}
