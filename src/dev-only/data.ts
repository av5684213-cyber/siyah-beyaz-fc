/**
 * ⚠️ DEVELOPMENT-ONLY FILE
 *
 * Bu dosya gerçek Türk futbolcu isimleri ve istatistikleri içerir.
 * Production'da asla kullanılmamalıdır — hukuki risk ve stale data sorunu.
 *
 * Gerçek oyuncu üretimi için sadece procedural generator (playerGenerator.ts) kullanılır.
 * Bu dosya src/dev-only/ klasöründedir ve next.config.ts ile production build dışında bırakılmıştır.
 */

import { Player } from '@/lib/fm/types';

// Production guard: Bu modülün production'da asla yüklenmemesini garanti et
if (process.env.NODE_ENV === 'production') {
  throw new Error(
    '[DEV-ONLY] src/dev-only/data.ts production ortamında yüklenemez. ' +
    'Gerçek oyuncu verileri için playerGenerator.ts kullanın.'
  );
}

export const BASAKSEHIR_SQUAD_IDS = ['101', '102', '103', '104', '105', '106', '107', '108', '109', '110', '111'];
export const BESIKTAS_SQUAD_IDS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11'];

export const MOCK_PLAYERS_POOL: Player[] = [
  // Beşiktaş
  { id: '1', name: 'Al Musrati', rating: 80, position: 'MID', age: 27, cond: 100, teamId: 'siyahbeyazfc', market_value: 15000000, salary: 2500000, nation: 'Libya', defending: 75, passing: 82, shooting: 65, speed: 70, power: 85, stamina: 80, traits: ['DLP'], potential: 82, hidden_potential: 83, form: 75, morale: 80, confidence: 75 },
  { id: '2', name: 'Gedson Fernandes', rating: 82, position: 'MID', age: 25, cond: 100, teamId: 'siyahbeyazfc', market_value: 20000000, salary: 3000000, nation: 'Portugal', defending: 70, passing: 80, shooting: 72, speed: 85, power: 78, stamina: 95, traits: ['BTB'], potential: 86, hidden_potential: 88, form: 80, morale: 85, confidence: 80 },
  { id: '3', name: 'Mert Günok', rating: 79, position: 'GK', age: 34, cond: 100, teamId: 'siyahbeyazfc', market_value: 2000000, salary: 1500000, nation: 'Turkey', defending: 30, passing: 70, shooting: 20, speed: 60, power: 75, stamina: 70, traits: ['GK'], potential: 79, hidden_potential: 79, form: 75, morale: 80, confidence: 85, goalkeeping: 82 },
  { id: '4', name: 'Gabriel Paulista', rating: 81, position: 'DEF', age: 33, cond: 100, teamId: 'siyahbeyazfc', market_value: 5000000, salary: 2800000, nation: 'Brazil', defending: 83, passing: 68, shooting: 45, speed: 72, power: 82, stamina: 75, traits: ['Stopper'], potential: 81, hidden_potential: 81, form: 70, morale: 75, confidence: 80 },
  { id: '5', name: 'Arthur Masuaku', rating: 77, position: 'DEF', age: 30, cond: 100, teamId: 'siyahbeyazfc', market_value: 4000000, salary: 1800000, nation: 'DR Congo', defending: 72, passing: 75, shooting: 60, speed: 82, power: 70, stamina: 78, traits: ['Wingback'], potential: 77, hidden_potential: 77, form: 72, morale: 70, confidence: 70 },
  { id: '6', name: 'Rafa Silva', rating: 83, position: 'FWD', age: 31, cond: 100, teamId: 'siyahbeyazfc', market_value: 18000000, salary: 4000000, nation: 'Portugal', defending: 40, passing: 82, shooting: 78, speed: 88, power: 65, stamina: 82, traits: ['Inside Fwd'], potential: 83, hidden_potential: 83, form: 85, morale: 90, confidence: 90 },
  { id: '7', name: 'Ciro Immobile', rating: 84, position: 'FWD', age: 34, cond: 100, teamId: 'siyahbeyazfc', market_value: 12000000, salary: 5000000, nation: 'Italy', defending: 35, passing: 70, shooting: 88, speed: 78, power: 75, stamina: 75, traits: ['Poacher'], potential: 84, hidden_potential: 84, form: 80, morale: 85, confidence: 88 },
  { id: '8', name: 'Ernest Muçi', rating: 78, position: 'MID', age: 23, cond: 100, teamId: 'siyahbeyazfc', market_value: 11000000, salary: 1200000, nation: 'Albania', defending: 45, passing: 78, shooting: 75, speed: 80, power: 72, stamina: 75, traits: ['Mezzala'], potential: 85, hidden_potential: 87, form: 75, morale: 75, confidence: 70 },
  { id: '9', name: 'Milot Rashica', rating: 79, position: 'FWD', age: 27, cond: 100, teamId: 'siyahbeyazfc', market_value: 10000000, salary: 2000000, nation: 'Kosovo', defending: 50, passing: 76, shooting: 77, speed: 86, power: 74, stamina: 85, traits: ['Sprinter'], potential: 80, hidden_potential: 81, form: 78, morale: 80, confidence: 75 },
  { id: '10', name: 'Semih Kılıçsoy', rating: 76, position: 'FWD', age: 18, cond: 100, teamId: 'siyahbeyazfc', market_value: 12000000, salary: 500000, nation: 'Turkey', defending: 35, passing: 68, shooting: 78, speed: 82, power: 80, stamina: 75, traits: ['Advanced Fwd'], potential: 88, hidden_potential: 92, form: 82, morale: 85, confidence: 80 },
  { id: '11', name: 'Jonas Svensson', rating: 75, position: 'DEF', age: 31, cond: 100, teamId: 'siyahbeyazfc', market_value: 2500000, salary: 1400000, nation: 'Norway', defending: 74, passing: 72, shooting: 55, speed: 78, power: 72, stamina: 85, traits: ['Fullback'], potential: 75, hidden_potential: 75, form: 70, morale: 75, confidence: 70 },

  // Başakşehir (User's Team)
  { id: '101', name: 'Krzysztof Piątek', rating: 80, position: 'FWD', age: 28, cond: 100, teamId: 'basaksehir', market_value: 10000000, salary: 2500000, nation: 'Poland', defending: 35, passing: 65, shooting: 84, speed: 75, power: 82, stamina: 78, traits: ['Advanced Fwd'], potential: 80, hidden_potential: 81, form: 80, morale: 85, confidence: 80 },
  { id: '102', name: 'Deniz Türüç', rating: 77, position: 'MID', age: 31, cond: 100, teamId: 'basaksehir', market_value: 3500000, salary: 1800000, nation: 'Turkey', defending: 55, passing: 78, shooting: 76, speed: 74, power: 72, stamina: 82, traits: ['Inside Fwd'], potential: 77, hidden_potential: 77, form: 75, morale: 80, confidence: 80 },
  { id: '103', name: 'Berat Özdemir', rating: 76, position: 'MID', age: 25, cond: 100, teamId: 'basaksehir', market_value: 4500000, salary: 1200000, nation: 'Turkey', defending: 74, passing: 75, shooting: 60, speed: 70, power: 78, stamina: 85, traits: ['DLP'], potential: 80, hidden_potential: 82, form: 72, morale: 75, confidence: 70 },
  { id: '104', name: 'Hamza Güreler', rating: 68, position: 'DEF', age: 18, cond: 100, teamId: 'basaksehir', market_value: 1200000, salary: 100000, nation: 'Turkey', defending: 70, passing: 62, shooting: 35, speed: 72, power: 68, stamina: 70, traits: ['Stopper'], potential: 82, hidden_potential: 85, form: 70, morale: 80, confidence: 70 },
  { id: '105', name: 'Léo Duarte', rating: 78, position: 'DEF', age: 27, cond: 100, teamId: 'basaksehir', market_value: 5000000, salary: 2000000, nation: 'Brazil', defending: 80, passing: 70, shooting: 40, speed: 75, power: 78, stamina: 80, traits: ['Stopper'], potential: 79, hidden_potential: 80, form: 75, morale: 80, confidence: 75 },
  { id: '106', name: 'Lucas Lima', rating: 75, position: 'DEF', age: 32, cond: 100, teamId: 'basaksehir', market_value: 1500000, salary: 1200000, nation: 'Brazil', defending: 72, passing: 74, shooting: 60, speed: 74, power: 68, stamina: 75, traits: ['Wingback'], potential: 75, hidden_potential: 75, form: 70, morale: 72, confidence: 70 },
  { id: '107', name: 'Muhammed Şengezer', rating: 76, position: 'GK', age: 27, cond: 100, teamId: 'basaksehir', market_value: 2500000, salary: 1000000, nation: 'Turkey', defending: 30, passing: 68, shooting: 20, speed: 65, power: 74, stamina: 70, traits: ['GK'], potential: 78, hidden_potential: 79, form: 74, morale: 75, confidence: 75, goalkeeping: 77 },
  { id: '108', name: 'João Figueiredo', rating: 75, position: 'FWD', age: 28, cond: 100, teamId: 'basaksehir', market_value: 3000000, salary: 1400000, nation: 'Brazil', defending: 45, passing: 68, shooting: 74, speed: 80, power: 76, stamina: 82, traits: ['Inside Fwd'], potential: 75, hidden_potential: 76, form: 72, morale: 75, confidence: 72 },
  { id: '109', name: 'Berkay Özcan', rating: 78, position: 'MID', age: 26, cond: 100, teamId: 'basaksehir', market_value: 6000000, salary: 2000000, nation: 'Turkey', defending: 55, passing: 81, shooting: 72, speed: 75, power: 70, stamina: 84, traits: ['Mezzala'], potential: 80, hidden_potential: 82, form: 78, morale: 80, confidence: 80 },
  { id: '110', name: 'Dimitris Pelkas', rating: 77, position: 'MID', age: 30, cond: 100, teamId: 'basaksehir', market_value: 4000000, salary: 2200000, nation: 'Greece', defending: 45, passing: 78, shooting: 75, speed: 78, power: 68, stamina: 75, traits: ['Playmaker'], potential: 77, hidden_potential: 77, form: 75, morale: 75, confidence: 78 },
  { id: '111', name: 'Ousseynou Ba', rating: 76, position: 'DEF', age: 28, cond: 100, teamId: 'basaksehir', market_value: 3000000, salary: 1500000, nation: 'Senegal', defending: 78, passing: 65, shooting: 30, speed: 76, power: 84, stamina: 78, traits: ['Stopper'], potential: 76, hidden_potential: 77, form: 70, morale: 75, confidence: 70 },
];
