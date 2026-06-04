
import { OPERATION_TREE, Operation } from './deepFootballConstants';
import { getSupabase } from './supabase';

export interface BorsaUpdate {
  opId: string;
  price: number;
  trend: 'up' | 'down';
}

export class DeepFootballService {
  /**
   * Generates dynamic prices for the borsa based on "Market Tension"
   * Price = BasePrice * (1 + DemandFactor - GlobalNewsFactor)
   */
  static calculateBorsaPrices(globalNewsFactor: number = 0): BorsaUpdate[] {
    return OPERATION_TREE.map(op => {
      const demandFactor = (Math.random() * 0.4) - 0.2; // -20% to +20% random demand
      const finalPrice = Math.floor(op.basePrice * (1 + demandFactor + globalNewsFactor));
      return {
        opId: op.id,
        price: finalPrice,
        trend: demandFactor > 0 ? 'up' : 'down'
      };
    });
  }

  /**
   * Generates newspaper headlines based on match events or market shifts
   */
  static generateHeadlines(events: any[]): any[] {
    const templates = [
      "Hakem kararları şehri karıştırdı!",
      "Lobi faaliyetleri borsayı vurdu.",
      "Köstebek skandalı: Taktikler sızdı mı?",
      "Taraftar gruplarından ortak deklarasyon.",
      "Federasyon'dan disiplin uyarısı!",
      "Siyahbeyazfc'de 06:00 antrenmanı fırtına gibi geçti! Yeni taktikler denendi.",
      "Operasyon Odası'ndan sızan bilgiler: Lobi 18:00 maçı için düğmeye bastı!",
      "Maç öncesi 'Yorgun' denen yıldız, 30 dakikalık (90 dk simüle) maçta döküldü.",
      "Spiker bile şaşırdı! Sahada görülen taktiksel diziliş rakibi felç etti."
    ];
    
    // Sort events by importance (e.g. Red cards, Penaltys)
    const hotEvents = events.filter(e => e.type === 'RED' || e.type === 'PENALTY' || e.type === 'CROWD');
    
    const baseNews = hotEvents.map(e => ({
      id: Math.random().toString(36).substr(2, 9),
      category: 'MANŞET',
      title: templates[Math.floor(Math.random() * 5)], // First 5 are general
      excerpt: `${e.minute}. dakikada yaşanan ${e.type} olayı sonrası ortalık gerildi.`,
      time: 'Az Önce',
      impactScore: Math.floor(Math.random() * 40) - 20
    }));

    // Add 2 special "Deep" news from the requested templates
    const deepNews = [5, 6, 7, 8].map(idx => ({
      id: Math.random().toString(36).substr(2, 9),
      category: 'DERİN' as any,
      title: 'Özel Haber: Derin Operasyon',
      excerpt: templates[idx],
      time: '1 Saat Önce',
      impactScore: 50
    }));

    return [...baseNews, ...deepNews];
  }

  /**
   * Performs the risk check after a match
   */
  static checkRiskImpact(activeOps: string[]): { caught: boolean; repLoss: number; fine: number } {
    let totalRisk = 0;
    let totalReputationLoss = 0;

    activeOps.forEach(id => {
      const op = OPERATION_TREE.find(o => o.id === id);
      if (op) {
        totalRisk += op.riskOfCatch;
        totalReputationLoss += op.reputationLoss;
      }
    });

    const caught = Math.random() < totalRisk;
    return {
      caught,
      repLoss: caught ? totalReputationLoss : 0,
      fine: caught ? Math.floor(totalReputationLoss * 100) : 0
    };
  }

  /**
   * NPC Strategy: Picks operations for AI managers based on match importance
   */
  static pickNpcOperations(tier: number, matchImportance: number): string[] {
    const available = OPERATION_TREE.filter(op => op.tier <= tier);
    const count = Math.min(3, Math.floor(matchImportance * 3));
    
    // Sort by impact and shuffle top picks
    const shuffled = available.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count).map(op => op.id);
  }
}
