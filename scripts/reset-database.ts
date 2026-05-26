/**
 * SİYAH BEYAZ FC — Veritabanı Sıfırlama Script'i
 * Kullanım: npx tsx scripts/reset-database.ts
 *
 * Tüm tabloları temizler ve başlangıç verilerini oluşturur:
 * - 4 lig (1. Lig, 2. Lig, 3. Lig, 4. Lig)
 * - Her ligte 18 takım = 72 takım toplam (league_teams, profiles)
 * - Her takıma 18 oyuncu = 1296 oyuncu toplam (players)
 * - Her lig için 1 sezon (seasons)
 * - Her lig için 34 haftalık fikstür (fixtures)
 * - 18 hakem (her lige atanmış)
 * - Tüm takımlara 5.000 KR + 100.000.000 €
 */

import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Supabase URL veya Key bulunamadı. .env.local dosyasını kontrol edin.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false },
});

// ═══════════════════════════════════════════════════════════════
// LİG TANIMLARI
// ═══════════════════════════════════════════════════════════════

const LEAGUES = [
  { name: '1. Lig', tier: 1 },
  { name: '2. Lig', tier: 2 },
  { name: '3. Lig', tier: 3 },
  { name: '4. Lig', tier: 4 },        // 4. Lig 1. Bölüm (ilk grup)
  { name: '4. Lig 2. Bölüm', tier: 4 }, // 4. Lig 2. Bölüm
] as const;

// ═══════════════════════════════════════════════════════════════
// TAKIM İSİMLERİ (Tamamen Kurgusal — Gerçek takım ismi YOK)
// 18 takım × 5 lig (1. Lig, 2. Lig, 3. Lig, 4. Lig, 4. Lig 2. Bölüm) = 90 takım
// ═══════════════════════════════════════════════════════════════

const TEAM_NAMES_BY_LEAGUE: Record<string, string[]> = {
  '1. Lig': [
    'Anadolu Kartalı', 'Bozkır Gücü', 'Yıldız Spor', 'Karadeniz Fırtınası',
    'Altın Şahin', 'Çelik Kale', 'Akdeniz Yıldızı', 'Ateş Parıltısı',
    'Orta Anadolu FK', 'Yıldırım Spor', 'Erciyes Gücü', 'Akdeniz Kılıcı',
    'Başkent Birlik', 'Marmara Gücü', 'Güney Rüzgarı', 'Doğu Yıldızı',
    'Boğaz Kalesi', 'Ege Fırtınası',
  ],
  '2. Lig': [
    'Kızılçam FK', 'Sakarya Ateşi', 'Van Gölü SK', 'Trakya Birlik',
    'Fırat Gücü', 'Toros Kartalı', 'Konya Yıldızı', 'Sivas Cesareti',
    'Malatya Altını', 'Erzurum Fırtınası', 'Kayseri Erciyes', 'Gaziantep Çeliği',
    'Denizli Horozu', 'Bolu Dağı', 'Zonguldak Madeni', 'Kütahya Porseleni',
    'Isparta Gülü', 'Edirne Kapısı',
  ],
  '3. Lig': [
    'Kemer FK', 'Alanya Kılıcı', 'Bodrum Güneşi', 'Çeşme Rüzgarı',
    'Mersin Limanı', 'Adana Kebabı', 'Hatay Medeniyet', 'Şanlıurfa Harran',
    'Diyarbakır Suru', 'Batman Petrolü', 'Siirt Gücü', 'Hakkari Dağı',
    'Ağrı Dori', 'Kars Kalesi', 'Erzincan Bakırı', 'Gümüşhane Gümüşü',
    'Bayburt Demiri', 'Tunceli Munzuru',
  ],
  '4. Lig': [
    'Bilecik Osman', 'Bursa İpeği', 'Yalova Kaplıcası', 'Düzce Fırtınası',
    'Kocaeli Sanayi', 'Sakarya Nehri', 'Tekirdağ Bağı', 'Kırklareli Taşı',
    'Çanakkale Köprüsü', 'Balıkesir Yağı', 'Manisa Sporu', 'Aydın İncisi',
    'Muğla Cenneti', 'Uşak Halısı', 'Afyon Kaymağı', 'Burdur Gölü',
    'Iğdır Ağrı', 'Karaman Erkilet',
  ],
  '4. Lig 2. Bölüm': [
    'Savun Kalesi', 'Atak Birlik', 'Kontra FC', 'Pres Gücü',
    'Orta Saha HK', 'Kanat Açılımı', 'Derin Koşu SK', 'Baskı United',
    'Çevik FK', 'Dayanıklı Spor', 'Hızlı Counter', 'Sabit Pozisyon',
    'Geniş Alan', 'Dar Alan City', 'Serbest Vuruş FK', 'Penaltı Ustası',
    'Taç Atışı SK', 'Korner Birliği',
  ],
};

// ═══════════════════════════════════════════════════════════════
// STADYUM İSİMLERİ
// ═══════════════════════════════════════════════════════════════

const STADIUMS: Record<string, string> = {
  // 1. Lig
  'Anadolu Kartalı': 'Kartal Yuvası Stadyumu',
  'Bozkır Gücü': 'Bozkır Arenası',
  'Yıldız Spor': 'Yıldız Park Stadyumu',
  'Karadeniz Fırtınası': 'Fırtına Arenası',
  'Altın Şahin': 'Şahin Yuvası Stadyumu',
  'Çelik Kale': 'Çelik Stadyumu',
  'Akdeniz Yıldızı': 'Akdeniz Parkı',
  'Ateş Parıltısı': 'Ateş Arenası',
  'Orta Anadolu FK': 'Anadolu Stadyumu',
  'Yıldırım Spor': 'Yıldırım Parkı',
  'Erciyes Gücü': 'Erciyes Stadyumu',
  'Akdeniz Kılıcı': 'Kılıç Arenası',
  'Başkent Birlik': 'Başkent Stadyumu',
  'Marmara Gücü': 'Marmara Parkı',
  'Güney Rüzgarı': 'Rüzgar Stadyumu',
  'Doğu Yıldızı': 'Doğu Arenası',
  'Boğaz Kalesi': 'Kale Stadyumu',
  'Ege Fırtınası': 'Ege Parkı',
  // 2. Lig
  'Kızılçam FK': 'Kızılçam Stadyumu',
  'Sakarya Ateşi': 'Ateş Arenası Stadyumu',
  'Van Gölü SK': 'Van Gölü Stadyumu',
  'Trakya Birlik': 'Trakya Parkı',
  'Fırat Gücü': 'Fırat Stadyumu',
  'Toros Kartalı': 'Toros Arenası',
  'Konya Yıldızı': 'Konya Stadyumu',
  'Sivas Cesareti': 'Cesaret Parkı',
  'Malatya Altını': 'Altın Stadyumu',
  'Erzurum Fırtınası': 'Erzurum Arenası',
  'Kayseri Erciyes': 'Erciyes Parkı',
  'Gaziantep Çeliği': 'Çelik Stadyumu Gaziantep',
  'Denizli Horozu': 'Horoz Stadyumu',
  'Bolu Dağı': 'Dağ Arenası',
  'Zonguldak Madeni': 'Maden Stadyumu',
  'Kütahya Porseleni': 'Porselen Parkı',
  'Isparta Gülü': 'Gül Stadyumu',
  'Edirne Kapısı': 'Kapı Arenası',
  // 3. Lig
  'Kemer FK': 'Kemer Stadyumu',
  'Alanya Kılıcı': 'Alanya Arenası',
  'Bodrum Güneşi': 'Güneş Stadyumu',
  'Çeşme Rüzgarı': 'Rüzgar Parkı',
  'Mersin Limanı': 'Liman Stadyumu',
  'Adana Kebabı': 'Kebap Arenası',
  'Hatay Medeniyet': 'Medeniyet Stadyumu',
  'Şanlıurfa Harran': 'Harran Parkı',
  'Diyarbakır Suru': 'Sur Stadyumu',
  'Batman Petrolü': 'Petrol Arenası',
  'Siirt Gücü': 'Siirt Stadyumu',
  'Hakkari Dağı': 'Dağ Parkı',
  'Ağrı Dori': 'Dori Stadyumu',
  'Kars Kalesi': 'Kale Arenası Kars',
  'Erzincan Bakırı': 'Bakır Stadyumu',
  'Gümüşhane Gümüşü': 'Gümüş Parkı',
  'Bayburt Demiri': 'Demir Stadyumu',
  'Tunceli Munzuru': 'Munzur Arenası',
  // 4. Lig
  'Bilecik Osman': 'Osman Stadyumu',
  'Bursa İpeği': 'İpek Arenası',
  'Yalova Kaplıcası': 'Kaplıca Stadyumu',
  'Düzce Fırtınası': 'Düzce Arenası',
  'Kocaeli Sanayi': 'Sanayi Stadyumu',
  'Sakarya Nehri': 'Nehir Parkı',
  'Tekirdağ Bağı': 'Bağ Stadyumu',
  'Kırklareli Taşı': 'Taş Arenası',
  'Çanakkale Köprüsü': 'Köprü Stadyumu',
  'Balıkesir Yağı': 'Yağ Parkı',
  'Manisa Sporu': 'Spor Stadyumu',
  'Aydın İncisi': 'İnci Arenası',
  'Muğla Cenneti': 'Cennet Stadyumu',
  'Uşak Halısı': 'Halı Parkı',
  'Afyon Kaymağı': 'Kaymak Stadyumu',
  'Burdur Gölü': 'Göl Arenası',
  'Iğdır Ağrı': 'Ağrı Stadyumu',
  'Karaman Erkilet': 'Erkilet Parkı',
};

// ═══════════════════════════════════════════════════════════════
// TAKIM RENKLERİ (Birincil, İkincil)
// ═══════════════════════════════════════════════════════════════

const TEAM_COLORS: Record<string, [string, string]> = {
  // 1. Lig
  'Anadolu Kartalı': ['#C41E3A', '#FFD700'],
  'Bozkır Gücü': ['#1E3A5F', '#F5F5DC'],
  'Yıldız Spor': ['#FFD700', '#1A1A2E'],
  'Karadeniz Fırtınası': ['#2E8B57', '#FFFFFF'],
  'Altın Şahin': ['#B8860B', '#FAFAD2'],
  'Çelik Kale': ['#4A4A4A', '#C0C0C0'],
  'Akdeniz Yıldızı': ['#006994', '#F0E68C'],
  'Ateş Parıltısı': ['#FF4500', '#2F2F2F'],
  'Orta Anadolu FK': ['#800020', '#F5F5DC'],
  'Yıldırım Spor': ['#FFD700', '#2F2F2F'],
  'Erciyes Gücü': ['#003153', '#C0C0C0'],
  'Akdeniz Kılıcı': ['#1B4D3E', '#FFD700'],
  'Başkent Birlik': ['#8B0000', '#FFFFFF'],
  'Marmara Gücü': ['#4169E1', '#FFFFFF'],
  'Güney Rüzgarı': ['#FF8C00', '#2F2F2F'],
  'Doğu Yıldızı': ['#DC143C', '#FFD700'],
  'Boğaz Kalesi': ['#191970', '#C0C0C0'],
  'Ege Fırtınası': ['#00A86B', '#FFFFFF'],
  // 2. Lig
  'Kızılçam FK': ['#8B0000', '#FFD700'],
  'Sakarya Ateşi': ['#FF6347', '#2F2F2F'],
  'Van Gölü SK': ['#4682B4', '#FFFFFF'],
  'Trakya Birlik': ['#556B2F', '#FFD700'],
  'Fırat Gücü': ['#CD853F', '#2F2F2F'],
  'Toros Kartalı': ['#2F4F4F', '#FFD700'],
  'Konya Yıldızı': ['#7B68EE', '#FFFFFF'],
  'Sivas Cesareti': ['#B22222', '#FFD700'],
  'Malatya Altını': ['#DAA520', '#2F2F2F'],
  'Erzurum Fırtınası': ['#4682B4', '#FF6347'],
  'Kayseri Erciyes': ['#800020', '#C0C0C0'],
  'Gaziantep Çeliği': ['#708090', '#FFD700'],
  'Denizli Horozu': ['#8B0000', '#FFFFFF'],
  'Bolu Dağı': ['#2E8B57', '#C0C0C0'],
  'Zonguldak Madeni': ['#2F2F2F', '#FFD700'],
  'Kütahya Porseleni': ['#B0C4DE', '#2F2F2F'],
  'Isparta Gülü': ['#FF69B4', '#FFFFFF'],
  'Edirne Kapısı': ['#8B4513', '#FFD700'],
  // 3. Lig
  'Kemer FK': ['#20B2AA', '#FFFFFF'],
  'Alanya Kılıcı': ['#FF4500', '#2F2F2F'],
  'Bodrum Güneşi': ['#FFD700', '#1A1A2E'],
  'Çeşme Rüzgarı': ['#87CEEB', '#2F2F2F'],
  'Mersin Limanı': ['#4682B4', '#FFD700'],
  'Adana Kebabı': ['#FF6347', '#FFFFFF'],
  'Hatay Medeniyet': ['#556B2F', '#FFD700'],
  'Şanlıurfa Harran': ['#DAA520', '#2F2F2F'],
  'Diyarbakır Suru': ['#2F2F2F', '#FF6347'],
  'Batman Petrolü': ['#2F2F2F', '#FFD700'],
  'Siirt Gücü': ['#6B8E23', '#FFFFFF'],
  'Hakkari Dağı': ['#4682B4', '#FFFFFF'],
  'Ağrı Dori': ['#B22222', '#FFFFFF'],
  'Kars Kalesi': ['#708090', '#FFD700'],
  'Erzincan Bakırı': ['#B87333', '#2F2F2F'],
  'Gümüşhane Gümüşü': ['#C0C0C0', '#2F2F2F'],
  'Bayburt Demiri': ['#4A4A4A', '#FF6347'],
  'Tunceli Munzuru': ['#2E8B57', '#FFD700'],
  // 4. Lig
  'Bilecik Osman': ['#8B4513', '#FFD700'],
  'Bursa İpeği': ['#800080', '#FFD700'],
  'Yalova Kaplıcası': ['#00CED1', '#2F2F2F'],
  'Düzce Fırtınası': ['#2F4F4F', '#FF6347'],
  'Kocaeli Sanayi': ['#4A4A4A', '#FFD700'],
  'Sakarya Nehri': ['#4682B4', '#FFFFFF'],
  'Tekirdağ Bağı': ['#722F37', '#FFD700'],
  'Kırklareli Taşı': ['#556B2F', '#FFFFFF'],
  'Çanakkale Köprüsü': ['#C41E3A', '#FFD700'],
  'Balıkesir Yağı': ['#DAA520', '#2F2F2F'],
  'Manisa Sporu': ['#FF8C00', '#2F2F2F'],
  'Aydın İncisi': ['#B0C4DE', '#2F2F2F'],
  'Muğla Cenneti': ['#20B2AA', '#FFD700'],
  'Uşak Halısı': ['#8B0000', '#FFD700'],
  'Afyon Kaymağı': ['#F5F5DC', '#2F2F2F'],
  'Burdur Gölü': ['#4682B4', '#C0C0C0'],
  'Iğdır Ağrı': ['#FFFFFF', '#000000'],
  'Karaman Erkilet': ['#708090', '#FFD700'],
};

// ═══════════════════════════════════════════════════════════════
// POSİTİON ŞABLONU (18 oyuncu)
// ═══════════════════════════════════════════════════════════════

const SQUAD_TEMPLATE = [
  'GK', 'GK',
  'CB', 'CB', 'CB', 'CB', 'LB', 'RB',
  'CDM', 'CM', 'CM', 'CAM',
  'LW', 'RW',
  'ST', 'ST', 'CF', 'LW',
];

const COMPATIBLE_SECONDARY: Record<string, string[]> = {
  'GK': [],
  'CB': ['LB', 'RB', 'CDM'],
  'LB': ['CB', 'LWB', 'LM'],
  'RB': ['CB', 'RWB', 'RM'],
  'LWB': ['LB', 'LM'],
  'RWB': ['RB', 'RM'],
  'CDM': ['CM', 'CB'],
  'CM': ['CDM', 'CAM'],
  'CAM': ['CM', 'CF'],
  'LM': ['LW', 'LB', 'CM'],
  'RM': ['RW', 'RB', 'CM'],
  'LW': ['LM', 'ST', 'CF'],
  'RW': ['RM', 'ST', 'CF'],
  'CF': ['ST', 'CAM', 'LW'],
  'ST': ['CF', 'LW', 'RW'],
};

const POS_LABELS: Record<string, string> = {
  'GK': 'Kaleci', 'CB': 'Merkez Defans', 'LB': 'Sol Bek', 'RB': 'Sağ Bek',
  'LWB': 'Sol Kanat Bek', 'RWB': 'Sağ Kanat Bek', 'CDM': 'Defansif Orta Saha',
  'CM': 'Merkez Orta Saha', 'CAM': 'Ofansif Orta Saha', 'LM': 'Sol Açık',
  'RM': 'Sağ Açık', 'LW': 'Sol Kanat', 'RW': 'Sağ Kanat',
  'CF': 'İkinci Forvet', 'ST': 'Santrfor',
};

const POS_GROUP: Record<string, string> = {
  'GK': 'GK', 'CB': 'DEF', 'LB': 'DEF', 'RB': 'DEF', 'LWB': 'DEF', 'RWB': 'DEF',
  'CDM': 'MID', 'CM': 'MID', 'CAM': 'MID', 'LM': 'MID', 'RM': 'MID', 'LW': 'MID', 'RW': 'MID',
  'CF': 'FWD', 'ST': 'FWD',
};

// ═══════════════════════════════════════════════════════════════
// OYUNCU İSİMLERİ (Daha çeşitli ve profesyonel)
// ═══════════════════════════════════════════════════════════════

const FIRST_NAMES = [
  'Selçuk', 'Burak', 'Kaan', 'Tolga', 'Efe', 'Kerem', 'Baran', 'Alper',
  'Mert', 'Cenk', 'Ozan', 'Levent', 'Onur', 'Serkan', 'Emir', 'Çağatay',
  'Berkay', 'Şafak', 'Ufuk', 'Civan', 'Barış', 'Kivanç', 'Hazar', 'Tunga',
  'Alparslan', 'Batur', 'Buğra', 'Cemre', 'Denizhan', 'Doruk', 'Ekin',
  'Fikret', 'Gökhan', 'Haldun', 'İlyas', 'Jalâleddin', 'Koray', 'Lazzi',
  'Macit', 'Nadir', 'Oktay', 'Poyraz', 'Rıza', 'Serdar', 'Teoman', 'Uğur',
  'Volkan', 'Yavuz', 'Ziya',
];

const LAST_NAMES = [
  'Yılmaz', 'Kaya', 'Demir', 'Çelik', 'Şahin', 'Yıldız', 'Aydın', 'Özdemir',
  'Arslan', 'Koç', 'Öztürk', 'Kılıç', 'Doğan', 'Keskin', 'Akar', 'Çetin',
  'Korkmaz', 'Gündüz', 'Polat', 'Şen', 'Güven', 'Tan', 'Aktaş', 'Karadağ',
  'Uğur', 'Başaran', 'Söğüt', 'Tuncel', 'Balcı', 'Kıraç', 'Soysal', 'Yavuz',
  'Dinç', 'Köse', 'Erkan', 'Fırat', 'Gürkan', 'İnan', 'Korkut', 'Mutlu',
  'Özbek', 'Peker', 'Sezer', 'Tamer', 'Ural', 'Vural', 'Yıldırım', 'Zeybek',
];

// ═══════════════════════════════════════════════════════════════
// HAKEMLER (Tamamen kurgusal isimler)
// ═══════════════════════════════════════════════════════════════

const REFEREE_NAMES = [
  'Berkay Tunç', 'Emrullah Karakuş', 'Şafak Özbek', 'Tolga Batur',
  'Ufuk Akduman', 'Onur Kılınçer', 'Sadık Gültekin', 'Levent Bozkurt',
  'Civan Bilgin', 'Baran Ünal', 'Kivanç Eroğlu', 'Hazar Akın',
  'Tunga Baydar', 'Buğra Çevik', 'Poyraz Demirci', 'Doruk Ayhan',
  'Fikret Sandal', 'Macit Yörük',
];

// ═══════════════════════════════════════════════════════════════
// YARDIMCI FONKSİYONLAR
// ═══════════════════════════════════════════════════════════════

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ═══════════════════════════════════════════════════════════════
// ARKETİP TANIMLARI — Pozisyon bazlı nitelik üretimi
// Her arketip: güçlü özellikler (+bonus), zayıf özellikler (-ceza)
// 6 temel nitelik: shooting, passing, dribbling, defending, physical, speed (0-100)
// ═══════════════════════════════════════════════════════════════

interface ArchetypeDef {
  name: string;
  strong: string[];   // Stats that get +bonus
  weak: string[];     // Stats that get -penalty
}

const POSITION_ARCHETYPES: Record<string, ArchetypeDef[]> = {
  GK: [
    { name: 'Refleks canavarı', strong: ['physical', 'speed'], weak: ['shooting', 'dribbling'] },
    { name: 'Güvenli eller', strong: ['physical', 'passing'], weak: ['shooting', 'speed'] },
    { name: '1v1 ustası', strong: ['speed', 'physical'], weak: ['passing', 'shooting'] },
    { name: 'Hava hakimiyeti', strong: ['physical', 'defending'], weak: ['dribbling', 'speed'] },
  ],
  CB: [
    { name: 'Kale gibi', strong: ['defending', 'physical'], weak: ['shooting', 'dribbling'] },
    { name: 'Lider stoper', strong: ['defending', 'passing'], weak: ['speed', 'dribbling'] },
    { name: 'Topla çıkan stoper', strong: ['passing', 'dribbling'], weak: ['physical', 'shooting'] },
    { name: 'Hızlı stoper', strong: ['speed', 'defending'], weak: ['shooting', 'dribbling'] },
    { name: 'Markajcı', strong: ['defending', 'speed'], weak: ['shooting', 'passing'] },
  ],
  LB: [
    { name: 'Kanat bekçisi', strong: ['speed', 'defending'], weak: ['shooting', 'physical'] },
    { name: 'Uzun pas ustası', strong: ['passing', 'speed'], weak: ['shooting', 'physical'] },
    { name: 'Süpürücü (libero)', strong: ['defending', 'passing'], weak: ['shooting', 'dribbling'] },
  ],
  RB: [
    { name: 'Kanat bekçisi', strong: ['speed', 'defending'], weak: ['shooting', 'physical'] },
    { name: 'Uzun pas ustası', strong: ['passing', 'speed'], weak: ['shooting', 'physical'] },
  ],
  LWB: [
    { name: 'Uzun pas ustası', strong: ['passing', 'speed'], weak: ['shooting', 'physical'] },
    { name: 'Top saklayan', strong: ['dribbling', 'speed'], weak: ['shooting', 'defending'] },
  ],
  RWB: [
    { name: 'Uzun pas ustası', strong: ['passing', 'speed'], weak: ['shooting', 'physical'] },
    { name: 'Top saklayan', strong: ['dribbling', 'speed'], weak: ['shooting', 'defending'] },
  ],
  CDM: [
    { name: 'Pres ustası', strong: ['defending', 'physical'], weak: ['shooting', 'dribbling'] },
    { name: 'Tempo kontrolcüsü', strong: ['passing', 'defending'], weak: ['shooting', 'speed'] },
    { name: 'Regista', strong: ['passing', 'dribbling'], weak: ['shooting', 'physical'] },
    { name: 'Oyun Bozan', strong: ['defending', 'passing'], weak: ['shooting', 'dribbling'] },
  ],
  CM: [
    { name: 'Oyun kurucu', strong: ['passing', 'dribbling'], weak: ['defending', 'physical'] },
    { name: 'Box-to-box', strong: ['physical', 'passing'], weak: ['dribbling', 'shooting'] },
    { name: 'Top dağıtıcı', strong: ['passing', 'physical'], weak: ['shooting', 'speed'] },
    { name: 'Uzaktan şutçu', strong: ['shooting', 'passing'], weak: ['defending', 'speed'] },
    { name: 'Pas arası ustası', strong: ['defending', 'passing'], weak: ['shooting', 'dribbling'] },
  ],
  CAM: [
    { name: '10 numara', strong: ['passing', 'dribbling'], weak: ['defending', 'physical'] },
    { name: 'Boşluk bulucu', strong: ['dribbling', 'shooting'], weak: ['defending', 'physical'] },
    { name: 'Oyun görüşü yüksek', strong: ['passing', 'shooting'], weak: ['defending', 'speed'] },
  ],
  LM: [
    { name: 'Uzun pas ustası', strong: ['passing', 'speed'], weak: ['shooting', 'defending'] },
    { name: 'Koşu ustası', strong: ['speed', 'physical'], weak: ['shooting', 'defending'] },
    { name: 'Top saklayan', strong: ['dribbling', 'speed'], weak: ['defending', 'physical'] },
  ],
  RM: [
    { name: 'Uzun pas ustası', strong: ['passing', 'speed'], weak: ['shooting', 'defending'] },
    { name: 'Koşu ustası', strong: ['speed', 'physical'], weak: ['shooting', 'defending'] },
    { name: 'Top saklayan', strong: ['dribbling', 'speed'], weak: ['defending', 'physical'] },
  ],
  LW: [
    { name: 'Hızlı forvet', strong: ['speed', 'dribbling'], weak: ['defending', 'physical'] },
    { name: 'Boşluk avcısı', strong: ['dribbling', 'shooting'], weak: ['defending', 'physical'] },
    { name: 'Kontra canavarı', strong: ['speed', 'shooting'], weak: ['defending', 'physical'] },
  ],
  RW: [
    { name: 'Hızlı forvet', strong: ['speed', 'dribbling'], weak: ['defending', 'physical'] },
    { name: 'Boşluk avcısı', strong: ['dribbling', 'shooting'], weak: ['defending', 'physical'] },
    { name: 'Kontra canavarı', strong: ['speed', 'shooting'], weak: ['defending', 'physical'] },
  ],
  CF: [
    { name: 'Bitirici', strong: ['shooting', 'dribbling'], weak: ['defending', 'physical'] },
    { name: 'Sahte 9', strong: ['passing', 'dribbling'], weak: ['defending', 'physical'] },
    { name: 'Pozisyoncu', strong: ['shooting', 'speed'], weak: ['defending', 'physical'] },
    { name: 'Fırsatçı', strong: ['shooting', 'speed'], weak: ['defending', 'passing'] },
  ],
  ST: [
    { name: 'Gol makinesi', strong: ['shooting', 'speed'], weak: ['defending', 'passing'] },
    { name: 'Fiziksel santrafor', strong: ['physical', 'shooting'], weak: ['dribbling', 'speed'] },
    { name: 'Hızlı forvet', strong: ['speed', 'shooting'], weak: ['defending', 'passing'] },
    { name: 'Kafacı (forvet)', strong: ['physical', 'shooting'], weak: ['dribbling', 'speed'] },
    { name: 'Bitirici', strong: ['shooting', 'dribbling'], weak: ['defending', 'passing'] },
  ],
};

// Pozisyon bazlı temel nitelik ağırlıkları (0-100 ölçeğinde)
const POSITION_BASE_WEIGHTS: Record<string, Record<string, number>> = {
  GK:  { shooting: -25, passing: -5, dribbling: -20, defending: 5, physical: 10, speed: -10 },
  CB:  { shooting: -15, passing: -5, dribbling: -10, defending: 15, physical: 10, speed: -5 },
  LB:  { shooting: -10, passing: 0, dribbling: 0, defending: 5, physical: -5, speed: 10 },
  RB:  { shooting: -10, passing: 0, dribbling: 0, defending: 5, physical: -5, speed: 10 },
  LWB: { shooting: -10, passing: 5, dribbling: 0, defending: 0, physical: -5, speed: 10 },
  RWB: { shooting: -10, passing: 5, dribbling: 0, defending: 0, physical: -5, speed: 10 },
  CDM: { shooting: -10, passing: 5, dribbling: -5, defending: 10, physical: 5, speed: -5 },
  CM:  { shooting: -5, passing: 10, dribbling: 0, defending: 0, physical: 0, speed: 0 },
  CAM: { shooting: 5, passing: 10, dribbling: 5, defending: -10, physical: -10, speed: 0 },
  LM:  { shooting: -5, passing: 0, dribbling: 5, defending: -10, physical: -5, speed: 10 },
  RM:  { shooting: -5, passing: 0, dribbling: 5, defending: -10, physical: -5, speed: 10 },
  LW:  { shooting: 0, passing: 0, dribbling: 10, defending: -15, physical: -10, speed: 10 },
  RW:  { shooting: 0, passing: 0, dribbling: 10, defending: -15, physical: -10, speed: 10 },
  CF:  { shooting: 10, passing: 0, dribbling: 5, defending: -15, physical: -5, speed: 5 },
  ST:  { shooting: 15, passing: -10, dribbling: -5, defending: -20, physical: 5, speed: 5 },
};

function generatePlayerStats(position: string, baseRating: number) {
  const isGK = position === 'GK';

  // Pozisyon bazlı ağırlıkları al
  const weights = POSITION_BASE_WEIGHTS[position] || POSITION_BASE_WEIGHTS['CM'];

  // Arketip seç
  const archetypes = POSITION_ARCHETYPES[position] || POSITION_ARCHETYPES['CM'];
  const selectedArchetype = archetypes[Math.floor(Math.random() * archetypes.length)];

  // Temel nitelik üretimi (0-100)
  const genVal = (base: number, weight: number, isStrong: boolean, isWeak: boolean) => {
    let val = base + weight;
    if (isStrong) val += 5 + Math.floor(Math.random() * 6);  // +5 to +10 bonus
    if (isWeak) val -= 5 + Math.floor(Math.random() * 6);     // -5 to -10 penalty
    val += Math.floor(Math.random() * 12) - 6;  // ±6 variance
    return Math.max(1, Math.min(99, val));
  };

  const strongSet = new Set(selectedArchetype.strong);
  const weakSet = new Set(selectedArchetype.weak);

  const shooting = genVal(baseRating, weights.shooting, strongSet.has('shooting'), weakSet.has('shooting'));
  const passing = genVal(baseRating, weights.passing, strongSet.has('passing'), weakSet.has('passing'));
  const dribbling = genVal(baseRating, weights.dribbling, strongSet.has('dribbling'), weakSet.has('dribbling'));
  const defending = genVal(baseRating, weights.defending, strongSet.has('defending'), weakSet.has('defending'));
  const physical = genVal(baseRating, weights.physical, strongSet.has('physical'), weakSet.has('physical'));
  const speed = genVal(baseRating, weights.speed, strongSet.has('speed'), weakSet.has('speed'));

  return {
    shooting,
    passing,
    dribbling,
    defending,
    speed,
    power: physical,  // backward compat
    heading: isGK ? 5 : Math.max(1, Math.min(99, baseRating + (['CB', 'ST', 'CF'].includes(position) ? 5 : -5) + Math.floor(Math.random() * 10) - 5)),
    goalkeeping: isGK ? Math.max(1, Math.min(99, baseRating + 10 + Math.floor(Math.random() * 8))) : Math.max(1, Math.min(20, baseRating - 30 + Math.floor(Math.random() * 10))),
    control: dribbling,  // backward compat
    vision: passing,     // backward compat
    archetype: selectedArchetype.name,
  };
}

function assignSecondary(pos: string): string[] | null {
  const compat = COMPATIBLE_SECONDARY[pos];
  if (!compat || compat.length === 0) return null;
  const roll = Math.random();
  if (roll < 0.06 && compat.length >= 2) {
    // 2 yan mevki (%6)
    const picked = new Set<string>();
    while (picked.size < 2) picked.add(randomFrom(compat));
    return Array.from(picked);
  }
  if (roll < 0.24) {
    // 1 yan mevki (%18)
    return [randomFrom(compat)];
  }
  // Yan mevki yok (%76)
  return null;
}

// ═══════════════════════════════════════════════════════════════
// ANA SIFIRLAMA FONKSİYONU
// ═══════════════════════════════════════════════════════════════

async function resetDatabase() {
  console.log('🗑️  Veritabanı sıfırlanıyor...\n');

  // ── 1. Tüm tabloları temizle ──
  // Sıralama: bağımlılık sırası (önce child tablolar, sonra parent)
  const tablesToClean = [
    // Child tablolar (FK bağımlılıkları)
    'match_events',
    'match_reports',
    'match_history',
    'rental_agreements',
    'rental_listings',
    'loans',
    'player_positions',
    'transfer_market',
    'push_subscriptions',
    'notification_preferences',
    'watchlist',
    'active_tactics',
    'training_state',
    'youth_players',
    'youth_facilities',
    'fixtures',
    'league_standings',
    'referees',
    'players',
    // Parent tablolar
    'league_teams',
    'seasons',
    'leagues',
    'profiles',
  ];

  console.log('📋 Tablolar temizleniyor...');
  for (const table of tablesToClean) {
    try {
      const { error, count } = await supabase
        .from(table)
        .delete({ count: 'exact' })
        .neq('id', '00000000-0000-0000-0000-000000000000__NEVER_MATCH');

      if (error) {
        const { error: err2 } = await supabase
          .from(table)
          .delete()
          .lt('created_at', '2099-12-31');

        if (err2) {
          console.warn(`  ⚠️  ${table}: ${err2.message}`);
        } else {
          console.log(`  ✅ ${table} temizlendi (fallback)`);
        }
      } else {
        console.log(`  ✅ ${table} temizlendi (${count || 0} satır silindi)`);
      }
    } catch (e: any) {
      console.warn(`  ⚠️  ${table}: ${e.message || 'Tablo mevcut olmayabilir'}`);
    }
  }

  // ── 2. Ligler oluştur ──
  console.log('\n🏆 Ligler oluşturuluyor...');
  const leagueMap: Record<string, any> = {};

  for (const leagueDef of LEAGUES) {
    const { data: league, error: leagueError } = await supabase
      .from('leagues')
      .insert({ name: leagueDef.name, tier: leagueDef.tier })
      .select()
      .single();

    if (leagueError || !league) {
      console.error(`❌ ${leagueDef.name} oluşturulamadı:`, leagueError?.message);
      process.exit(1);
    }
    leagueMap[leagueDef.name] = league;
    console.log(`✅ Lig oluşturuldu: ${league.name} (Tier: ${leagueDef.tier}, ID: ${league.id})`);
  }

  // ── 3. Her lig için sezon, takımlar, oyuncular ve fikstür oluştur ──
  let totalFixtures = 0;
  let totalPlayers = 0;
  let totalTeams = 0;
  const usedPlayerNames = new Set<string>();

  function getUniquePlayerName(): string {
    let name = `${randomFrom(FIRST_NAMES)} ${randomFrom(LAST_NAMES)}`;
    let attempts = 0;
    while (usedPlayerNames.has(name) && attempts < 100) {
      name = `${randomFrom(FIRST_NAMES)} ${randomFrom(LAST_NAMES)}`;
      attempts++;
    }
    usedPlayerNames.add(name);
    return name;
  }

  for (const leagueDef of LEAGUES) {
    const league = leagueMap[leagueDef.name];
    const teamNames = TEAM_NAMES_BY_LEAGUE[leagueDef.name];
    const leagueTeamIds: string[] = [];

    console.log(`\n${'═'.repeat(50)}`);
    console.log(`⚽ ${leagueDef.name} — Takımlar ve oyuncular oluşturuluyor...`);
    console.log(`${'═'.repeat(50)}`);

    // ── 3a. Sezon oluştur ──
    const { data: season, error: seasonError } = await supabase
      .from('seasons')
      .insert({
        league_id: league.id,
        year: new Date().getFullYear(),
        start_date: new Date().toISOString().split('T')[0],
      })
      .select()
      .single();

    if (seasonError || !season) {
      console.error(`❌ ${leagueDef.name} sezonu oluşturulamadı:`, seasonError?.message);
      process.exit(1);
    }
    console.log(`📅 Sezon oluşturuldu (ID: ${season.id})`);

    // ── 3b. Takımlar ve oyuncular oluştur ──
    for (let t = 0; t < teamNames.length; t++) {
      const teamName = teamNames[t];

      // Profile oluştur
      const profileId = randomUUID();
      // Tüm takımlar bot olarak oluşturulur - gerçek kullanıcılar kaydoldukça botları devralır
      const isFirstTeamOfFirstLeague = false; // Artık tüm takımlar bot

      const colorPair = TEAM_COLORS[teamName] || ['#ffffff', '#000000'];

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: profileId,
          team_name: teamName,
          money: 100000000,     // 100.000.000 €
          credits: 5000,        // 5.000 KR
          is_bot: true,         // Tüm takımlar bot
          primary_color: colorPair[0],
          secondary_color: colorPair[1],
          level: 1,
          xp: 0,
        })
        .select()
        .single();

      if (profileError || !profile) {
        console.warn(`⚠️  ${teamName} profili oluşturulamadı: ${profileError?.message}`);
        continue;
      }

      // League team oluştur
      const { data: leagueTeam, error: ltError } = await supabase
        .from('league_teams')
        .insert({
          name: teamName,
          league_id: league.id,
          profile_id: profile.id,
          is_bot: true,   // Tüm takımlar bot
          is_npc: true,   // NPC olarak işaretle
          strength: 40 + Math.floor(Math.random() * 15),
        })
        .select()
        .single();

      if (ltError || !leagueTeam) {
        // Fallback: daha az kolonla tekrar dene
        const { data: fallbackTeam, error: fbError } = await supabase
          .from('league_teams')
          .insert({
            name: teamName,
            league_id: league.id,
            profile_id: profile.id,
          })
          .select()
          .single();

        if (fbError || !fallbackTeam) {
          console.warn(`⚠️  ${teamName} league_team oluşturulamadı: ${fbError?.message || ltError?.message}`);
          continue;
        }
        leagueTeamIds.push(fallbackTeam.id);
      } else {
        leagueTeamIds.push(leagueTeam.id);
      }

      // 18 oyuncu oluştur
      const tierRatingPenalty = (leagueDef.tier - 1) * 5; // Tier düştükçe rating düşer
      const players = SQUAD_TEMPLATE.map((pos, i) => {
        const baseRating = 72 - tierRatingPenalty;
        const rating = Math.max(50, Math.min(90, baseRating + Math.floor(Math.random() * 12) - 4));
        const secondaryPositions = assignSecondary(pos);
        const stats = generatePlayerStats(pos, rating);
        const fullName = getUniquePlayerName();
        const age = 18 + Math.floor(Math.random() * 16); // 18-33
        const marketValue = Math.round(rating * rating * 120 + age * 5000);
        const salary = Math.round(marketValue * 0.02);

        return {
          id: `p-${leagueDef.tier}-${teamName.replace(/\s+/g, '-').toLowerCase()}-${i}`,
          name: fullName,
          position: POS_GROUP[pos],
          specific_position: pos,
          secondary_positions: secondaryPositions,
          rating,
          potential: Math.min(99, rating + Math.floor(Math.random() * 15)),
          age,
          nation: 'Türkiye',
          team_name: teamName,
          profile_id: profile.id,
          market_value: marketValue,
          salary,
          ...stats,
          cond: 100,
          morale: 70 + Math.floor(Math.random() * 20),
          form: 50 + Math.floor(Math.random() * 30),
          is_injured: false,
          scouted: false,
          scouting_stars: 0,
          scouting_count: 0,
          is_legend: false,
        };
      });

      const { error: playersError } = await supabase.from('players').insert(players);
      if (playersError) {
        console.warn(`⚠️  ${teamName} oyuncuları oluşturulamadı: ${playersError.message}`);
      } else {
        const avgRating = Math.round(players.reduce((s, p) => s + p.rating, 0) / players.length);
        console.log(`  ✅ ${teamName}: ${players.length} oyuncu (ORT: ${avgRating})`);
        totalPlayers += players.length;
      }

      // League standings oluştur
      await supabase.from('league_standings').insert({
        team_id: leagueTeamIds[leagueTeamIds.length - 1],
        league_id: league.id,
        season: 1,
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        goals_for: 0,
        goals_against: 0,
        goal_diff: 0,
        points: 0,
      });

      totalTeams++;
    }

    // ── 3c. Fikstür oluştur (round-robin, 34 hafta, hafta içi lig + hafta sonu kupa) ──
    console.log(`\n📅 ${leagueDef.name} fikstür oluşturuluyor...`);

    if (leagueTeamIds.length < 2) {
      console.error(`❌ ${leagueDef.name} fikstür oluşturmak için en az 2 takım gerekli`);
      continue;
    }

    const n = leagueTeamIds.length;
    const totalRounds = (n - 1) * 2; // 34 hafta
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(12, 0, 0, 0);

    const WEEKDAY_TIMES = ['12:00', '18:00'];
    const WEEKEND_TIMES = ['15:00', '20:00'];

    const fixtures: any[] = [];
    const teamIds = [...leagueTeamIds];

    // Round-robin algoritması — lig maçları hafta içi
    for (let round = 0; round < n - 1; round++) {
      for (let match = 0; match < n / 2; match++) {
        const home = teamIds[match];
        const away = teamIds[n - 1 - match];
        if (home && away) {
          const matchDate = new Date(tomorrow);
          matchDate.setDate(matchDate.getDate() + round * 7);
          // Hafta içine ayarla (Pazartesi-Cuma)
          const dayOfWeek = matchDate.getDay();
          if (dayOfWeek === 0) matchDate.setDate(matchDate.getDate() + 1);
          else if (dayOfWeek === 6) matchDate.setDate(matchDate.getDate() + 2);

          // Son tur (round === n - 2) Salı gününe denk gelsin — sezon sonu ödüller Salı akşamı verilir
          if (round === n - 2) {
            const currentDay = matchDate.getDay();
            // Salı = 2
            const daysToTuesday = ((2 - currentDay + 7) % 7) || 7;
            matchDate.setDate(matchDate.getDate() + daysToTuesday);
          }

          const matchTime = WEEKDAY_TIMES[match % WEEKDAY_TIMES.length];

          // İlk yarış (ev-deplasman)
          fixtures.push({
            home_team_id: home,
            away_team_id: away,
            season_id: season.id,
            tur: round + 1,
            match_date: matchDate.toISOString().split('T')[0],
            match_time: matchTime,
            status: 'scheduled',
            competition_type: 'league',
          });

          // İkinci yarış (ters)
          const returnDate = new Date(matchDate);
          returnDate.setDate(returnDate.getDate() + (n - 1) * 7);
          const returnDayOfWeek = returnDate.getDay();
          if (returnDayOfWeek === 0) returnDate.setDate(returnDate.getDate() + 1);
          else if (returnDayOfWeek === 6) returnDate.setDate(returnDate.getDate() + 2);

          // Sezonun son turu (tur = 2*(n-1) = 34) Salı gününe denk gelsin
          if (round === n - 2) {
            const rDay = returnDate.getDay();
            const daysToTue = ((2 - rDay + 7) % 7) || 7;
            returnDate.setDate(returnDate.getDate() + daysToTue);
          }

          fixtures.push({
            home_team_id: away,
            away_team_id: home,
            season_id: season.id,
            tur: round + 1 + (n - 1),
            match_date: returnDate.toISOString().split('T')[0],
            match_time: matchTime,
            status: 'scheduled',
            competition_type: 'league',
          });
        }
      }

      // Takımları döndür (ilk sabit, geri kalan döner)
      const last = teamIds.pop();
      if (last) teamIds.splice(1, 0, last);
    }

    // Kupa maçları: hafta sonu (Cumartesi/Pazar)
    const cupRounds = Math.min(3, Math.floor(34 / 6));
    const shuffledTeamIds = [...leagueTeamIds].sort(() => Math.random() - 0.5);

    for (let cupRound = 0; cupRound < cupRounds; cupRound++) {
      const cupWeekBase = cupRound * 6 + 3;
      const cupDate = new Date(tomorrow);
      cupDate.setDate(cupDate.getDate() + cupWeekBase * 7);
      // Cumartesiye ayarla
      const cupDayOfWeek = cupDate.getDay();
      if (cupDayOfWeek === 0) cupDate.setDate(cupDate.getDate() - 1);
      else if (cupDayOfWeek < 6) cupDate.setDate(cupDate.getDate() + (6 - cupDayOfWeek));

      const cupTime = WEEKEND_TIMES[cupRound % WEEKEND_TIMES.length];

      for (let i = 0; i < shuffledTeamIds.length - 1; i += 2) {
        fixtures.push({
          home_team_id: shuffledTeamIds[i],
          away_team_id: shuffledTeamIds[i + 1],
          season_id: season.id,
          tur: cupWeekBase,
          match_date: cupDate.toISOString().split('T')[0],
          match_time: cupTime,
          status: 'scheduled',
          competition_type: 'cup',
        });
      }
    }

    // Batch insert (100'erli)
    for (let i = 0; i < fixtures.length; i += 100) {
      const batch = fixtures.slice(i, i + 100);
      const { error: fixError } = await supabase.from('fixtures').insert(batch);
      if (fixError) {
        console.warn(`⚠️  Fikstür batch ${Math.floor(i / 100) + 1} hatası: ${fixError.message}`);
      }
    }
    console.log(`✅ ${fixtures.length} fikstür oluşturuldu (${totalRounds} hafta lig + ${cupRounds} kupa turu)`);
    totalFixtures += fixtures.length;
  }

  // ── 4. Hakemler oluştur (tamamen kurgusal isimler, lirlere atanmış) ──
  console.log('\n👨‍⚖️ Hakemler oluşturuluyor...');

  // Hakemleri lirlere dağıt: 4-5 hakem her lige
  const leagueNames = LEAGUES.map(l => l.name);
  const refereeRows = REFEREE_NAMES.map((name, i) => {
    const assignedLeagueName = leagueNames[i % leagueNames.length];
    const assignedLeague = leagueMap[assignedLeagueName];
    return {
      id: randomUUID(),
      name,
      personality: 'dengeci',
      league_id: assignedLeague.id,
      strictness: 3 + Math.floor(Math.random() * 5),
    };
  });

  const { error: refError } = await supabase.from('referees').insert(refereeRows);
  if (refError) {
    console.warn(`⚠️  Hakemler oluşturulamadı: ${refError.message}`);
  } else {
    console.log(`✅ ${refereeRows.length} hakem oluşturuldu`);
  }

  // ── 5. İlk takımın profil ID'sini göster ──
  const { data: firstProfile } = await supabase
    .from('profiles')
    .select('id, team_name')
    .eq('is_bot', false)
    .maybeSingle();

  console.log('\n═══════════════════════════════════════════════════');
  console.log('🎉 SIFIRLAMA TAMAMLANDI!');
  console.log('═══════════════════════════════════════════════════');
  console.log(`🏆 ${LEAGUES.length} lig oluşturuldu (4. Lig'de 2 bölüm dahil)`);
  console.log(`⚽ ${totalTeams} takım oluşturuldu (her ligte 18, hepsi bot)`);
  console.log(`👥 ${totalPlayers} oyuncu oluşturuldu (her takımda 18)`);
  console.log(`📅 ${totalFixtures} fikstür oluşturuldu (her ligte 34 hafta)`);
  console.log(`👨‍⚖️ ${refereeRows.length} hakem oluşturuldu`);
  console.log(`💰 Her takım: 5.000 KR + 100.000.000 €`);
  console.log(`📝 Gerçek kullanıcılar kaydoldukça bot takımları devralacak`);
  console.log('═══════════════════════════════════════════════════\n');
}

resetDatabase().catch((err) => {
  console.error('❌ Sıfırlama hatası:', err);
  process.exit(1);
});
