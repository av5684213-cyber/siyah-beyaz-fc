export const TRAINING_PROGRAMS = [
  {
    id: 'fiziksel_yukleme',
    name: 'Fiziksel Yükleme',
    description: 'Dayanıklılık ve güç odaklı kondisyon kampı.',
    targetStats: ['stamina', 'power', 'speed'],
    color: 'red'
  },
  {
    id: 'teknik_driller',
    name: 'Teknik Driller',
    description: 'Pas kalitesi ve top kontrolü geliştirme.',
    targetStats: ['passing', 'control', 'vision'],
    color: 'blue'
  },
  {
    id: 'savunma_okulu',
    name: 'Savunma Okulu',
    description: 'Pozisyon alma ve markaj disiplini.',
    targetStats: ['defending', 'vision', 'power'],
    color: 'green'
  },
  {
    id: 'bitiricilik_kampi',
    name: 'Bitiricilik Kampı',
    description: 'Ceza sahası etkinliği ve şut kalitesi.',
    targetStats: ['shooting', 'control', 'speed'],
    color: 'amber'
  }
];

export const INITIAL_TEAM_NAME = 'Siyahbeyazfc';
export const STARTING_MONEY = 10_000_000;

// ═══════════════════════════════════════════════════
//  RASTGELE TAKIM İSİMLERİ BANKI (50+ isim)
//  Gerçek futbolcu isimleri YOK, tamamen kurgusal
// ═══════════════════════════════════════════════════

export const TEAM_NAME_BANK: string[] = [
  // ─── Şehir/Bölge Temalı ─────────────────────
  'Anadolu Gücü', 'Ege Fırtınası', 'Karadeniz Yıldızı', 'Akdeniz Dalga',
  'İç Anadolu Kartalı', 'Marmara Rüzgarı', 'Doğu Anadolu Ateşi',
  'Güneydoğu Güneşi', 'Trakya Birlik', 'Boğaz Korelasi',
  // ─── FC / United / City Format ───────────────
  'FC Random 42', 'Spor Kulübü 17', 'United Anka', 'City Perspektif',
  'FC Volkan', 'United Çelik', 'City Horizon', 'FC Dayanışma',
  // ─── Doğa/Unsur Temalı ──────────────────────
  'Demir Fırtına', 'Altın Ayak', 'Gümüş Kanat', 'Bakır Kale',
  'Volkan Spor', 'Buz Kılıcı', 'Ateş Çemberi', 'Rüzgar Süpürücü',
  'Fırtına Kuşu', 'Güneş Kulesi', 'Yıldırım Ordu', 'Şimşek Gücü',
  // ─── Hayvan Sembol ──────────────────────────
  'Kartal Yuvası', 'Aslan Yüreği', 'Bozkurt FK', 'Çita Hızı',
  'Panter Spor', 'Doğan Akademi', 'Atmaca Birlik', 'Karga Şaşkınlık',
  // ─── Soyut/Kavram ──────────────────────────
  'Zirve Peşinde', 'Ufuk Ötesi', 'Vadi Yıldızı', 'Ova Birliği',
  'Tepe Kuşatı', 'Sahil Güvenliği', 'Liman Feneri', 'Adalet FK',
  // ─── Renk Temalı ───────────────────────────
  'Siyah Şimşek', 'Beyaz Fırtına', 'Kırmızı Kale', 'Yeşilova SK',
  'Mavi Cephane', 'Turuncu Güç', 'Mor Yıldız', 'Gri Duvar',
  // ─── Rakamlı / Retro ───────────────────────
  'Spor 1923', 'FK 57', 'United 38', 'City 74',
  'FC 91', 'Birlik 1905', 'Güç 1961', 'Yıldız 2010',
  // ─── Yedek (genişletilebilir) ──────────────
  'Yeni Ufuklar', 'Işık Yolu', 'Gelecek FK', 'Kömür Madeni',
  'Çelik Fabrikası', 'İpek Yolu SK', 'Bahar Canlılığı', 'Son Kale',
];

// Bank'tan rastgele benzersiz isim seçer (tekrarsız)
export function getRandomTeamNames(count: number, excludeNames: string[] = []): string[] {
  const available = TEAM_NAME_BANK.filter(n => !excludeNames.includes(n));
  const selected: string[] = [];
  const used = new Set<string>(excludeNames);

  for (let i = 0; i < count && available.length > 0; i++) {
    const idx = Math.floor(Math.random() * available.length);
    const name = available[idx];
    if (!used.has(name)) {
      selected.push(name);
      used.add(name);
    }
    available.splice(idx, 1);
  }

  // Havuz yetersizse fallback: "FC Random XXX" formatı
  while (selected.length < count) {
    const fallback = `FC Random ${Math.floor(Math.random() * 900) + 100}`;
    if (!used.has(fallback)) {
      selected.push(fallback);
      used.add(fallback);
    }
  }

  return selected;
}

// ═══════════════════════════════════════════════════
//  LİG TAKIM İSİMLERİ HAVUZU
//  Her lig seviyesi için yeterli isim ( departman başına 18 )
// ═══════════════════════════════════════════════════

export const TIER_TEAM_NAMES: Record<number, string[]> = {
  1: [
    'Anadolu Gücü', 'Kartal Yuvası', 'Aslan Yüreği', 'Demir Fırtına',
    'Altın Ayak', 'Şimşek Gücü', 'Zirve Peşinde', 'Volkan Spor',
    'Bozkurt FK', 'Güneş Kulesi', 'Fırtına Kuşu', 'Siyah Şimşek',
    'Yıldırım Ordu', 'Spor 1923', 'Çelik Fabrikası', 'Mavi Cephane',
    'Sahil Güvenliği', 'Ateş Çemberi',
  ],
  2: [
    'Ege Fırtınası', 'Gümüş Kanat', 'Çita Hızı', 'Bakır Kale',
    'Buz Kılıcı', 'Doğan Akademi', 'Ufuk Ötesi', 'Yeşilova SK',
    'Liman Feneri', 'FK 57', 'İpek Yolu SK', 'Panter Spor',
    'Kırmızı Kale', 'Vadi Yıldızı', 'Atmaca Birlik', 'Rüzgar Süpürücü',
    'Adalet FK', 'Ova Birliği',
  ],
  3: [
    'Karadeniz Yıldızı', 'Akdeniz Dalga', 'İç Anadolu Kartalı', 'Marmara Rüzgarı',
    'Doğu Anadolu Ateşi', 'Güneydoğu Güneşi', 'Trakya Birlik', 'Boğaz Korelasi',
    'FC Random 42', 'Spor Kulübü 17', 'United Anka', 'City Perspektif',
    'Karga Şaşkınlık', 'Turuncu Güç', 'Mor Yıldız', 'Gri Duvar',
    'United 38', 'City 74',
  ],
  4: [
    // Departman 1
    'FC Volkan', 'United Çelik', 'City Horizon', 'FC Dayanışma',
    'Tepe Kuşatı', 'Son Kale', 'Yeni Ufuklar', 'Işık Yolu',
    'Gelecek FK', 'Kömür Madeni', 'Bahar Canlılık', 'FC 91',
    'Birlik 1905', 'Güç 1961', 'Yıldız 2010', 'Beyaz Fırtına',
    'Kale Duvarı', 'Savunma Hattı',
    // Departman 2
    'Savun Kalesi', 'Atak Birlik', 'Kontra FC', 'Pres Gücü',
    'Orta Saha HK', 'Kanat Açılımı', 'Derin Koşu SK', 'Baskı United',
    'Çevik FK', 'Dayanıklı Spor', 'Hızlı Counter', 'Sabit Pozisyon',
    'Geniş Alan', 'Dar Alan City', 'Serbest Vuruş FK', 'Penaltı Ustası',
    'Taç Atışı SK', 'Korner Birliği',
    // Departman 3
    'Akademi 1', 'Akademi 2', 'Akademi 3', 'Akademi 4',
    'Akademi 5', 'Akademi 6', 'Akademi 7', 'Akademi 8',
    'Akademi 9', 'Akademi 10', 'Akademi 11', 'Akademi 12',
    'Akademi 13', 'Akademi 14', 'Akademi 15', 'Akademi 16',
    'Akademi 17', 'Akademi 18',
    // Departman 4
    'Stadyum 1', 'Stadyum 2', 'Stadyum 3', 'Stadyum 4',
    'Stadyum 5', 'Stadyum 6', 'Stadyum 7', 'Stadyum 8',
    'Stadyum 9', 'Stadyum 10', 'Stadyum 11', 'Stadyum 12',
    'Stadyum 13', 'Stadyum 14', 'Stadyum 15', 'Stadyum 16',
    'Stadyum 17', 'Stadyum 18',
    // Departman 5
    'Yedek 1', 'Yedek 2', 'Yedek 3', 'Yedek 4',
    'Yedek 5', 'Yedek 6', 'Yedek 7', 'Yedek 8',
    'Yedek 9', 'Yedek 10', 'Yedek 11', 'Yedek 12',
    'Yedek 13', 'Yedek 14', 'Yedek 15', 'Yedek 16',
    'Yedek 17', 'Yedek 18',
  ],
};

// Verilen lig seviyesi ve departman indeksi için 18 takım ismi döndürür
// Eğer departman havuzu yetersizse TEAM_NAME_BANK'tan rastgele çeker
export function getTeamNamesForDepartment(tier: number, departmentIndex: number): string[] {
  const pool = TIER_TEAM_NAMES[tier] || TIER_TEAM_NAMES[4] || [];
  const start = (departmentIndex - 1) * 18; // departmentIndex 1-based
  let names = pool.slice(start, start + 18);
  
  // Havuz yetersizse TEAM_NAME_BANK'tan rastgele tamamla
  if (names.length < 18) {
    const existingNames = [...names];
    const randomExtra = getRandomTeamNames(18 - names.length, existingNames);
    names = [...names, ...randomExtra];
  }
  
  return names;
}
