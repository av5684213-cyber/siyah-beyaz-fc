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
//  LİG TAKIM İSİMLERİ HAVUZU
//  Her lig seviyesi için yeterli isim ( departman başına 18 )
// ═══════════════════════════════════════════════════

export const TIER_TEAM_NAMES: Record<number, string[]> = {
  1: [
    'Kartal Gücü', 'Aslan United', 'Kanarya City', 'Fırtına FC',
    'Boğaz Spor', 'Yıldızlar Birliği', 'Anadolu Kartalı', 'Sahil Belediye',
    'İç Anadolu FC', 'Akdeniz Spor', 'Ege United', 'Marmara Gücü',
    'Zirve Spor', 'Güneşli City', 'Mavi Liman', 'Altınordu Yıldız',
    'Demir Spor', 'Kuzey Gücü',
  ],
  2: [
    'Körfez City', 'Yeşil Vadi', 'Çınar Spor', 'Gümüş Ok',
    'Yıldırım United', 'Fırtına 1923', 'Başkent Akademi', 'Ovada City',
    'Dağ United', 'Liman Spor', 'Sanayi Gücü', 'Demir Bilek',
    'Altın Patiler', 'Gölge Spor', 'Işık City', 'Gece United',
    'Toprak FC', 'Rüzgar Spor',
  ],
  3: [
    'Buzul United', 'Lav Spor', 'Kutup City', 'Kumral FC',
    'Çöl United', 'Vaha Spor', 'Derin Su City', 'Zeytin Spor',
    'Üzüm United', 'Pamuk FC', 'İpek City', 'Keten Spor',
    'Dantel United', 'Nakış Spor', 'Boya City', 'Fırça FC',
    'Tuval United', 'Sergi Spor',
  ],
  4: [
    // Departman 1 (maintenance API de bunları kullanır)
    'Yaz United', 'Kış Spor', 'Bahar City', 'Güz FC',
    'Mevsim United', 'Zaman Spor', 'Saat City', 'Dakika FC',
    'Saniye United', 'An Spor', 'Rüya City', 'Gerçek FC',
    'Hayal United', 'Umut Spor', 'Barış City', 'Sevgi FC',
    'Dost United', 'Kardeş Spor',
    // Departman 2
    'Karacaşehir SK', 'Egeli Gençlik', 'Yıldırım Kılıcı', 'Çınaraltı Spor',
    'Mavi Beyaz FK', 'Doğuş Belediye', 'Karaelmas SK', 'Alanya Yıldızı',
    'Sarı Kanarya', 'Trabzon Perisi', 'Gaziantep Gücü', 'Konya Şafak',
    'Bursa Yılanı', 'Antalya Akdeniz', 'Sivas Kartalı', 'Erzincan Spor',
    'Malatya Yıldız', 'Diyarbakır FK',
    // Departman 3
    'Balıkesir FK', 'Manisa Spor', 'Aydın Belediye', 'Muğla City',
    'Denizli Kireç', 'Uşak Gücü', 'Afyonkarahisar SK', 'Kütahya Spor',
    'Eskişehir Osmancık', 'Bilecik Yıldız', 'Bolu Abant', 'Düzce FK',
    'Zonguldak Ereğli', 'Bartın Spor', 'Karabük Güneş', 'Çankırı Belediye',
    'Kastamonu Spor', 'Sinop FK',
    // Departman 4
    'Samsun Canik', 'Tokat Belediye', 'Amasya Yıldız', 'Çorum FK',
    'Ordu Güreşi', 'Giresun Spor', 'Trabzon Akçaabat', 'Rize Spor',
    'Artvin Hopa', 'İstanbul Beyoğlu', 'Kadıköy Kartal', 'Üsküdar FK',
    'Bakırköy Spor', 'Fatih Karagümrük', 'Bayrampaşa SK', 'Sarıyer Güneş',
    'Beşiktaş Yeşil', 'Eyüp Spor',
    // Departman 5 (yedek)
    'Silivri FK', 'Büyükçekmece', 'Avcılar Spor', 'Küçükçekmece SK',
    'Başakşehir FK', 'Sultangazi Belediye', 'Esenler Gücü', 'Bağcılar Spor',
    'Güngören City', 'Zeytinburnu FK', 'Kağıthane SK', 'Şişli Belediye',
    'Beşiktaş Çarşı', 'İzmit Kardeş', 'Gebze Spor', 'Darıca FK',
    'Kocaeli City', 'Sakarya Yıldız',
  ],
};

// Verilen lig seviyesi ve departman indeksi için 18 takım ismi döndürür
export function getTeamNamesForDepartment(tier: number, departmentIndex: number): string[] {
  const pool = TIER_TEAM_NAMES[tier] || TIER_TEAM_NAMES[4] || [];
  const start = (departmentIndex - 1) * 18; // departmentIndex 1-based
  const names = pool.slice(start, start + 18);
  
  // Havuz yetersizse fallback: "Seviye X Departman Y Takım Z" formatı
  if (names.length < 18) {
    const tierNames = ['Süper Lig', '1. Lig', '2. Lig', '3. Lig', '4. Lig'];
    const tierLabel = tierNames[tier] || `${tier}. Lig`;
    const deptLabel = departmentIndex === 1 ? '' : ` ${departmentIndex}. Departman`;
    for (let i = names.length; i < 18; i++) {
      names.push(`${tierLabel}${deptLabel} Takım ${i + 1}`);
    }
  }
  
  return names;
}
