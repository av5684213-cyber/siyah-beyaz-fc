import { 
  Landmark, 
  Zap, 
  Monitor, 
  Thermometer, 
  Store, 
  Utensils, 
  School, 
  Dumbbell, 
  Plane, 
  Activity,
  Wifi
} from 'lucide-react';

export interface StadiumMatrixItem {
  id: string;
  name: string;
  originalName: string;
  description: string;
  effect: string;
  maxLevel: number;
  icon: any;
  requiredManagerLevel?: number;
  requiredDivision?: number;
}

export const STADIUM_MATRIX: StadiumMatrixItem[] = [
  {
    id: 'capacity',
    name: 'Seyirci Hacmi (Kapasite)',
    originalName: 'Kolezyum Ölçeği',
    description: 'Mahalle tribünlerinden dikey mimarili arenalara uzanan yolculuk.',
    effect: 'Bilet geliri ve Atmosfer Baskısı artar. Lvl 10: Rakip Karar Verme -5.',
    maxLevel: 10,
    icon: Landmark
  },
  {
    id: 'lighting',
    name: 'Optik Aydınlatma (Işıklandırma)',
    originalName: 'Lümen Operasyonu',
    description: 'Eski projektörlerden gölge bırakmayan akıllı lazer sitemlere.',
    effect: 'Gece maçları performansı ve yayın geliri. Lvl 10: GK Refleks +%10.',
    maxLevel: 10,
    icon: Zap
  },
  {
    id: 'scoreboards',
    name: 'Veri Panoları (Skor Tabelası)',
    originalName: 'Analitik Ekranlar',
    description: 'Tribünü saran panoramik dijital paneller.',
    effect: 'Taraftar etkileşimi ve sponsorluk. Lvl 10: xG Verileriyle rakip moral bozma.',
    maxLevel: 10,
    icon: Monitor
  },
  {
    id: 'heating',
    name: 'İklim Kalkanı (Isıtma)',
    originalName: 'Termal Kubbe',
    description: 'Alttan ısıtma borularından akıllı sensörlü yüzey yönetimine.',
    effect: 'Kış şartlarında performans koruma. Lvl 10: Kar/Don etkileri sıfırlanır.',
    maxLevel: 10,
    icon: Thermometer
  },
  {
    id: 'vip',
    name: 'VIP Localar',
    originalName: 'Heli-Port',
    description: 'Standart locadan gökyüzü erişimli ultra-lüks alanlara.',
    effect: 'Devasa VIP geliri ve lobi gücü. Lvl 10: Her maç başı +500.000 € VIP fonu.',
    maxLevel: 10,
    icon: Plane
  },
  {
    id: 'store',
    name: 'Merchandising',
    originalName: 'Arma Pazarı',
    description: 'Konteyner satış noktalarından devasa deneyim mağazalarına.',
    effect: 'Maç günü dışı pasif gelir. Lvl 10: Global forma satış çarpanı.',
    maxLevel: 10,
    icon: Store
  },
  {
    id: 'pitch',
    name: 'Hibrit Çim',
    originalName: 'Nano-Çim',
    description: 'Doğal çimden aşınmayan nano-teknolojik yüzeye.',
    effect: 'Pas isabeti ve hız bonusu. Lvl 10: Takım Pas statı +%15 isabet.',
    maxLevel: 10,
    icon: Activity
  },
  {
    id: 'media',
    name: 'Basın ve Multimedya',
    originalName: 'Prestige Hub',
    description: 'Küçük basın odalarından global yayın üslerine.',
    effect: 'Kulüp itibarı ve sponsorluk. Lvl 10: Yayın geliri +%100 artış.',
    maxLevel: 10,
    icon: Wifi
  },
  {
    id: 'academy',
    name: 'Akademi Konutları',
    originalName: 'Gelecek Vizyonu',
    description: 'Beton sahalardan biyometrik tarama merkezlerine.',
    effect: 'Genç yetenek ihtimali. Lvl 10: Her sezon 1 Elit Wonderkid garantisi.',
    maxLevel: 10,
    icon: School
  },
  {
    id: 'medical',
    name: 'Sağlık ve Rejenerasyon',
    originalName: 'Gladyatör Kampı',
    description: 'Basit revirlerden DNA bazlı rejenerasyon merkezine.',
    effect: 'Sakatlık iyileşme hızı. Lvl 10: Sakatlık ihtimali -%50 azalır.',
    maxLevel: 10,
    icon: Dumbbell
  }
];

export const getStadiumCapacity = (level: number) => {
  return 5000 + (level * 10000);
};

export const calculateUpgradeCost = (baseCost: number, level: number) => {
  // Exponential scaling as requested
  return Math.floor(baseCost * Math.pow(2.2, level - 1));
};

export const getManagerLevelRequirement = (level: number) => {
  if (level <= 3) return 0;
  if (level <= 6) return level * 2;
  return level * 3;
};
