
export type Locale = 'tr' | 'it' | 'en';

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
    // ... daha fazla eklenebilir
  },
  it: {
    scouting: "Scouting",
    watchlist: "Lista di Osservazione",
    stadium: "Stadio",
    ticket_price: "Prezzo del Biglietto",
    academy: "Accademia",
    upgrade: "Migliora",
    money: "Budget",
    search: "Ricerca",
  },
  en: {
    scouting: "Scouting",
    watchlist: "Watchlist",
    stadium: "Stadium",
    ticket_price: "Ticket Price",
    academy: "Youth Academy",
    upgrade: "Upgrade",
    money: "Budget",
    search: "Search",
  }
};

export function getBrowserLocale(): Locale {
  const lang = typeof navigator !== 'undefined' ? navigator.language.split('-')[0] : 'tr';
  if (lang === 'it') return 'it';
  if (lang === 'en') return 'en';
  return 'tr'; // Default
}
