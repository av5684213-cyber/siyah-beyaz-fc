
/**
 * Uluslararasılaştırma (i18n) Modülü — Sadece Türkçe desteklenmektedir.
 *
 * İleride çoklu dil desteği planlanıyorsa, bu dosya genişletilebilir.
 * Şimdilik yanıltıcı yarım İtalya/İngilizce çeviriler kaldırılmıştır.
 * Kullanıcıya "Sadece Türkçe desteklenmektedir" uyarısı gösterilir.
 */

export type Locale = 'tr';

export const CURRENT_LOCALE: Locale = 'tr';

export const translations = {
  tr: {
    scouting: "Gözlemcilik",
    watchlist: "İzleme Listesi",
    stadium: "Yerleşke",
    ticket_price: "Bilet Fiyatı",
    academy: "Altyapı",
    upgrade: "Geliştir",
    money: "Bütçe",
    search: "Arama",
    onlyTurkishWarning: "Sadece Türkçe desteklenmektedir",
    // ... daha fazla eklenebilir
  }
} as const;

export type TranslationKey = keyof typeof translations.tr;

/**
 * Tarayıcı yerel ayarını döndürür. Her zaman 'tr' döndürür.
 * İleride çoklu dil desteği eklendiğinde, tarayıcı dilini algılamak için
 * genişletilebilir.
 */
export function getBrowserLocale(): Locale {
  return 'tr';
}

/**
 * Çeviri anahtarına karşılık gelen metni döndürür.
 * Sadece Türkçe çeviriler mevcuttur.
 */
export function t(key: TranslationKey): string {
  return translations.tr[key] || key;
}
