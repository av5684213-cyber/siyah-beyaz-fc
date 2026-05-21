/**
 * Mevki Bazlı Ağırlıklı Rastgele Özellik Dağıtım Sistemi
 * Position-Based Weighted Random Attribute Distribution
 */

export type Priority = 'cok_dusuk' | 'dusuk' | 'orta' | 'yuksek' | 'cok_yuksek';

const priorityRanges: Record<Priority, [number, number]> = {
  cok_dusuk: [20, 50],
  dusuk: [30, 65],
  orta: [40, 80],
  yuksek: [55, 90],
  cok_yuksek: [70, 95],
};

export function generateAttributeValue(priority: Priority): number {
  const [min, max] = priorityRanges[priority];
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Mevki bazlı öncelik tabloları
 * Her mevki için teknik, mental ve fiziksel özelliklerin öncelik seviyeleri
 */
export const positionPriorities: Record<string, {
  teknik: Record<string, Priority>;
  mental: Record<string, Priority>;
  fiziksel: Record<string, Priority>;
}> = {
  GK: {
    teknik: {
      bitiricilik: 'cok_dusuk', dribbling: 'cok_dusuk', ilk_kontrol: 'dusuk',
      kafa_vurusu: 'dusuk', markaj: 'cok_dusuk', orta_yapma: 'cok_dusuk',
      pas: 'dusuk', teknik: 'dusuk', top_kapma: 'cok_dusuk', uzaktan_sut: 'cok_dusuk'
    },
    mental: {
      agresiflik: 'dusuk', cesaret: 'dusuk', caliskanlik: 'orta',
      karar_alma: 'yuksek', kararlilik: 'orta', konsantrasyon: 'cok_yuksek',
      liderlik: 'orta', onsezi: 'yuksek', ozel_yetenek: 'cok_dusuk',
      pozisyon_alma: 'cok_yuksek', sogukkanlilik: 'yuksek', takim_oyunu: 'dusuk',
      vizyon: 'cok_dusuk'
    },
    fiziksel: {
      ceviklik: 'yuksek', dayaniklilik: 'dusuk', denge: 'yuksek',
      guc: 'yuksek', hiz: 'dusuk', hizlanma: 'dusuk',
      ziplama: 'yuksek'
    }
  },
  DEF: {
    teknik: {
      bitiricilik: 'dusuk', dribbling: 'dusuk', ilk_kontrol: 'orta',
      kafa_vurusu: 'yuksek', markaj: 'yuksek', orta_yapma: 'yuksek',
      pas: 'orta', teknik: 'orta', top_kapma: 'yuksek', uzaktan_sut: 'dusuk'
    },
    mental: {
      agresiflik: 'yuksek', cesaret: 'yuksek', caliskanlik: 'yuksek',
      karar_alma: 'yuksek', kararlilik: 'yuksek', konsantrasyon: 'yuksek',
      liderlik: 'yuksek', onsezi: 'yuksek', ozel_yetenek: 'dusuk',
      pozisyon_alma: 'yuksek', sogukkanlilik: 'orta', takim_oyunu: 'yuksek',
      vizyon: 'dusuk'
    },
    fiziksel: {
      ceviklik: 'orta', dayaniklilik: 'yuksek', denge: 'yuksek',
      guc: 'yuksek', hiz: 'yuksek', hizlanma: 'orta',
      ziplama: 'yuksek'
    }
  },
  MID: {
    teknik: {
      bitiricilik: 'orta', dribbling: 'yuksek', ilk_kontrol: 'yuksek',
      kafa_vurusu: 'orta', markaj: 'orta', orta_yapma: 'yuksek',
      pas: 'cok_yuksek', teknik: 'yuksek', top_kapma: 'yuksek',
      uzaktan_sut: 'yuksek'
    },
    mental: {
      agresiflik: 'orta', cesaret: 'orta', caliskanlik: 'yuksek',
      karar_alma: 'yuksek', kararlilik: 'yuksek', konsantrasyon: 'orta',
      liderlik: 'orta', onsezi: 'orta', ozel_yetenek: 'yuksek',
      pozisyon_alma: 'orta', sogukkanlilik: 'orta', takim_oyunu: 'yuksek',
      vizyon: 'cok_yuksek'
    },
    fiziksel: {
      ceviklik: 'yuksek', dayaniklilik: 'cok_yuksek', denge: 'orta',
      guc: 'orta', hiz: 'yuksek', hizlanma: 'yuksek',
      ziplama: 'orta'
    }
  },
  FWD: {
    teknik: {
      bitiricilik: 'cok_yuksek', dribbling: 'yuksek', ilk_kontrol: 'yuksek',
      kafa_vurusu: 'yuksek', markaj: 'cok_dusuk', orta_yapma: 'orta',
      pas: 'orta', teknik: 'yuksek', top_kapma: 'dusuk', uzaktan_sut: 'yuksek'
    },
    mental: {
      agresiflik: 'orta', cesaret: 'yuksek', caliskanlik: 'orta',
      karar_alma: 'orta', kararlilik: 'yuksek', konsantrasyon: 'dusuk',
      liderlik: 'dusuk', onsezi: 'dusuk', ozel_yetenek: 'yuksek',
      pozisyon_alma: 'dusuk', sogukkanlilik: 'yuksek', takim_oyunu: 'orta',
      vizyon: 'orta'
    },
    fiziksel: {
      ceviklik: 'yuksek', dayaniklilik: 'orta', denge: 'orta',
      guc: 'yuksek', hiz: 'cok_yuksek', hizlanma: 'cok_yuksek',
      ziplama: 'yuksek'
    }
  }
};

/**
 * Spesifik mevkiyi mevki grubuna dönüştürür
 */
export function getPositionKey(position: string): 'GK' | 'DEF' | 'MID' | 'FWD' {
  if (position === 'GK') return 'GK';
  if (['CB', 'LB', 'RB', 'LWB', 'RWB'].includes(position)) return 'DEF';
  if (['CDM', 'CM', 'CAM', 'LM', 'RM'].includes(position)) return 'MID';
  return 'FWD';
}

/**
 * Türkçe özellik anahtarı → Player interface İngilizce anahtarı eşleştirmesi
 */
export const ATTRIBUTE_KEY_MAP: Record<string, string> = {
  // Teknik
  bitiricilik: 'finishing',
  dribbling: 'dribbling',
  ilk_kontrol: 'firstTouch',
  kafa_vurusu: 'heading',
  markaj: 'marking',
  orta_yapma: 'crossing',
  pas: 'passing',
  teknik: 'technique',
  top_kapma: 'tackling',
  uzaktan_sut: 'longShots',
  // Mental
  agresiflik: 'aggression',
  cesaret: 'bravery',
  caliskanlik: 'workRate',
  karar_alma: 'decisions',
  kararlilik: 'determination',
  konsantrasyon: 'concentration',
  liderlik: 'leadership',
  onsezi: 'anticipation',
  ozel_yetenek: 'flair',
  pozisyon_alma: 'positioning',
  sogukkanlilik: 'composure',
  takim_oyunu: 'teamwork',
  vizyon: 'vision',
  // Fiziksel
  ceviklik: 'agility',
  dayaniklilik: 'stamina',
  denge: 'balance',
  guc: 'strength',
  hiz: 'speed',
  hizlanma: 'acceleration',
  ziplama: 'jumping',
};

/**
 * Verilen mevki için tüm özellikleri rastgele oluşturur
 * Returns a flat Record<string, number> with English key names
 */
export function generateAllAttributes(position: string): Record<string, number> {
  const posKey = getPositionKey(position);
  const priorities = positionPriorities[posKey];
  if (!priorities) {
    // Fallback: orta öncelik ile tüm özellikleri üret
    const result: Record<string, number> = {};
    for (const [trKey, enKey] of Object.entries(ATTRIBUTE_KEY_MAP)) {
      result[enKey] = generateAttributeValue('orta');
    }
    return result;
  }

  const result: Record<string, number> = {};
  
  // Teknik özellikler
  for (const [trKey, priority] of Object.entries(priorities.teknik)) {
    const enKey = ATTRIBUTE_KEY_MAP[trKey];
    if (enKey) {
      result[enKey] = generateAttributeValue(priority);
    }
  }
  
  // Mental özellikler
  for (const [trKey, priority] of Object.entries(priorities.mental)) {
    const enKey = ATTRIBUTE_KEY_MAP[trKey];
    if (enKey) {
      result[enKey] = generateAttributeValue(priority);
    }
  }
  
  // Fiziksel özellikler
  for (const [trKey, priority] of Object.entries(priorities.fiziksel)) {
    const enKey = ATTRIBUTE_KEY_MAP[trKey];
    if (enKey) {
      result[enKey] = generateAttributeValue(priority);
    }
  }

  return result;
}
