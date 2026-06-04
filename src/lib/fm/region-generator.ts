
import { Player } from './types';
import { generatePlayer } from './playerGenerator';
import { calculatePlayerSalary } from './salaryUtils';

/**
 * Bölge Verileri — Sadece Türkçe desteklenmektedir.
 * İleride çoklu dil desteği eklenebilir, ancak şimdilik yanıltıcı
 * yarım İtalya desteği kaldırılmıştır.
 */
const REGION_DATA = {
  tr: {
    firstNames: [
      "Ahmet", "Mehmet", "Mustafa", "Can", "Burak", "Emre", "Arda", "Omer", "Yigit", "Mert",
      "Ali", "Hasan", "Huseyin", "Ibrahim", "Ismail", "Yusuf", "Osman", "Suleyman", "Fatih", "Selim",
      "Kemal", "Murat", "Serkan", "Cem", "Deniz", "Efe", "Egemen", "Emir", "Enes", "Eray",
      "Eren", "Erkan", "Furkan", "Gokhan", "Gorkem", "Hakan", "Hamza", "Harun", "Ilker", "Ilyas",
      "Kaan", "Kagan", "Kerem", "Koray", "Levent", "Mirac", "Oguz", "Onur", "Ozer", "Polat",
      "Rahmi", "Remzi", "Ridvan", "Salih", "Samet", "Serdar", "Serhat", "Sinan", "Taha", "Tarkan",
      "Tugay", "Umit", "Uras", "Volkan", "Yagiz", "Yakup", "Yalcin", "Yavuz", "Zafer", "Bulent",
      "Cengiz", "Engin", "Erhan", "Galip", "Haldun", "Kadir", "Mahmut", "Nail", "Oktay", "Orhan",
      "Refik", "Sadik", "Tarik", "Tevfik", "Vedat", "Cuneyt", "Baris", "Dogan", "Erdal", "Gurkan",
      "Kenan", "Mesut", "Nihat", "Olgun", "Resat", "Saffet", "Tolga", "Ugur", "Veli", "Yunus",
      "Abdullah", "Adem", "Bekir", "Cihad", "Davut", "Ebubekir", "Faruk", "Gaffar", "Hilmi", "Izzet"
    ],
    lastNames: [
      "Yilmaz", "Kaya", "Demir", "Celik", "Sahin", "Yildiz", "Erdogan", "Aydin", "Ozdemir", "Arslan",
      "Ozturk", "Kilic", "Aslan", "Cetin", "Kose", "Kurt", "Ozkan", "Simsek", "Polat", "Korkmaz",
      "Ekinci", "Acar", "Balci", "Cakir", "Colak", "Dogan", "Duman", "Efe", "Elci", "Ercan",
      "Ersoy", "Genc", "Guler", "Gunay", "Gundogdu", "Gunes", "Hancer", "Ileri", "Inan", "Isik",
      "Kaplan", "Karaca", "Karadag", "Karakas", "Karatas", "Keskin", "Koc", "Kocyigit", "Mert", "Oner",
      "Orhan", "Ozen", "Pala", "Sari", "Saygin", "Sen", "Sever", "Sonmez", "Tas", "Tekin",
      "Tunc", "Turgut", "Turk", "Ucar", "Ulusoy", "Unal", "Unver", "Varol", "Yalcin", "Yavuz",
      "Yesil", "Yetkin", "Yildirim", "Zengin", "Akbulut", "Akgun", "Akinci", "Akkaya", "Aksu", "Aktas",
      "Alemdar", "Altan", "Altintas", "Avci", "Baysal", "Cevik", "Dalkiran", "Duran", "Duygulu", "Erbay",
      "Erdinc", "Erol", "Eryilmaz", "Gonul", "Gurdal", "Ilhan", "Kalafat", "Karaman", "Kaya", "Keser",
      "Kizil", "Koç", "Ogut", "Oz", "Ozdamar", "Sahin", "Sasmaz", "Sezer", "Sahin", "Tasan",
      "Topal", "Tore", "Turan", "Uysal", "Yoruk", "Acar", "Basturk", "Coban", "Gozubuyuk", "Karahan"
    ],
    teams: [
      "Anadolu Kartalı", "Bozkır Gücü", "Yıldız Spor", "Karadeniz Fırtınası", "Altın Şahin",
      "Çelik Kale", "Akdeniz Yıldızı", "Ateş Parıltısı", "Orta Anadolu FK", "Başkent Birlik",
      "Yıldırım Spor", "Erciyes Gücü", "Akdeniz Kılıcı", "Marmara Gücü", "Güney Rüzgarı",
      "Doğu Yıldızı", "Boğaz Kalesi", "Ege Fırtınası", "Kızıl Kurt", "Gök Bozkurt",
      "Sönmez Spor", "Kartal Yuvası", "Boz Ayı FK", "Altın Boynuz", "Demirpençe"
    ],
    leagueNames: ["Super Lig", "1. Lig", "2. Lig", "3. Lig"]
  }
};

export type SupportedRegion = 'tr';

/**
 * Bölgesel oyuncu üretir. Şu an sadece 'tr' (Türkiye) bölgesi desteklenir.
 * İleride başka bölgeler eklenebilir.
 */
export function generateLocalizedPlayer(
  _region: string,
  club: string,
  tier: number,
  position?: 'GK' | 'DEF' | 'MID' | 'FWD',
  currentWeek?: number
): Player {
  // Her zaman Türkiye bölgesini kullan
  const data = REGION_DATA.tr;
  const firstName = data.firstNames[Math.floor(Math.random() * data.firstNames.length)];
  const lastName = data.lastNames[Math.floor(Math.random() * data.lastNames.length)];

  // Rating based on tier: Tier 1 (70-85), Tier 2 (60-75), Tier 3 (50-65), Tier 4 (40-55)
  const baseRating = 80 - (tier * 10);
  const rating = baseRating + Math.floor(Math.random() * 15);

  const pos = position || (["GK", "DEF", "MID", "FWD"][Math.floor(Math.random() * 4)] as Player['position']);
  const p = generatePlayer(pos, rating, Math.random, undefined, currentWeek, tier);

  return {
    ...p,
    name: `${firstName} ${lastName}`,
    club: club,
    team_name: club,
    nation: 'Türkiye',
    // Tier-based salary: lower leagues pay much less
    salary: calculatePlayerSalary(p.rating, false, tier),
  };
}

/**
 * Bölge yapılandırmasını döndürür. Sadece 'tr' desteklenir.
 */
export function getRegionConfig(_region?: string) {
  return REGION_DATA.tr;
}
