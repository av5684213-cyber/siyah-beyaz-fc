import { Player } from './types';
import { generateStarterPlayer } from './playerGenerator';

/**
 * Oyuncunun emekliliğe aday olup olmadığını hesaplar.
 * Sadece yaşa değil; morale, sakatlık geçmişi ve forma göre karar verir.
 *
 * Emeklilik kriterleri (dengelenmiş — v6.4 güncelleme):
 * - 41+ yaş: kesin emeklilik (eski 40)
 * - 39-40 yaş: %8 rastgele (eski 38-39: %12), kronik sakatlık veya düşük moral
 * - 38-39 yaş: sadece ciddi sakatlık + düşük moral kombinasyonu (rastgele yok)
 * - 36-37 yaş: çok kötü koşullar (değişmedi)
 * - 35- yaş: emeklilik yok
 *
 * NOT: Eski %40 → %20 → %12 → %8 kademeli yumuşatma.
 * Gerçek futbolda 38-39 yaş oyuncular hala oynayabilmektedir.
 */
export function shouldPlayerRetire(player: Player): boolean {
  const age = player.age || 0;
  const morale = player.morale ?? 60;
  const form = player.form ?? 50;
  const hasChronicInjury = (player as any).injury?.type === 'chronic';
  const injuryHistory = (player as any).injury_history || [];
  const severeInjuries = injuryHistory.filter((i: any) => (i.duration_days || 0) >= 10).length;

  // 41+ yaş: kesin emeklilik (eski 40 → 41'e yükseltildi)
  if (age >= 41) return true;

  // 39-40 yaş: düşük moral, kronik sakatlık veya rastgele %8
  if (age >= 39) {
    if (hasChronicInjury) return true;
    if (morale < 30) return true;
    if (form < 30 && severeInjuries >= 2) return true;
    if (Math.random() < 0.08) return true; // %8 rastgele emeklilik (eski %12 → yumuşatıldı)
    return false;
  }

  // 38-39 yaş: sadece ciddi koşullar — rastgele emeklilik YOK
  if (age >= 38) {
    if (hasChronicInjury && morale < 25 && form < 25) return true;
    if (severeInjuries >= 4 && morale < 20) return true;
    // Rastgele emeklilik kaldırıldı — 38-39 yaş oyuncular sadece kötü koşullarda emekli olur
    return false;
  }

  // 36-37: çok kötü koşullarda erken emeklilik (değişmedi)
  if (age >= 36) {
    if (hasChronicInjury && morale < 25 && form < 25) return true;
    if (severeInjuries >= 4 && morale < 20) return true;
    return false;
  }

  return false;
}

// ═══════════════════════════════════════════════════════════════════════
//  VETERAN STATÜSÜ SİSTEMİ
//  35+ yaş oyuncular için deneyim bonusu + fiziksel gerileme
// ═══════════════════════════════════════════════════════════════════════

export interface VeteranStatus {
  isVeteran: boolean;
  age: number;
  /** Deneyim bonusu: leadership, composure +5 */
  experienceBonus: { leadership: number; composure: number };
  /** Fiziksel gerileme: speed, stamina -3 per season */
  physicalDecline: { speed: number; stamina: number };
  /** Vetera seviyesi: 35-37 = 1, 38-40 = 2, 41+ = 3 */
  veteranLevel: number;
}

/**
 * Oyuncunun veteran statüsünü hesaplar.
 * 35+ yaş oyuncular deneyim bonusu alır ama fiziksel olarak geriler.
 *
 * @param player — Player objesi
 * @returns VeteranStatus bilgisi
 */
export function getVeteranStatus(player: Player): VeteranStatus {
  const age = player.age || 0;

  if (age < 35) {
    return {
      isVeteran: false,
      age,
      experienceBonus: { leadership: 0, composure: 0 },
      physicalDecline: { speed: 0, stamina: 0 },
      veteranLevel: 0,
    };
  }

  // Veteran seviyesi: yaşa göre kademeli
  const veteranLevel = age >= 41 ? 3 : age >= 38 ? 2 : 1;

  // Deneyim bonusu: leadership ve composure +5 (her seviye için)
  const experienceBonus = {
    leadership: veteranLevel * 5,
    composure: veteranLevel * 5,
  };

  // Fiziksel gerileme: speed ve stamina -3 her sezon (her seviye için)
  const physicalDecline = {
    speed: veteranLevel * 3,
    stamina: veteranLevel * 3,
  };

  return {
    isVeteran: true,
    age,
    experienceBonus,
    physicalDecline,
    veteranLevel,
  };
}

/**
 * Veteran statüsünü oyuncuya uygular.
 * Deneyim bonusu ekler ve fiziksel gerilemeyi yansıtır.
 * Sezon başında bir kez çağrılmalıdır.
 *
 * @param player — Player objesi
 * @returns Güncellenmiş player
 */
export function applyVeteranEffects(player: Player): Player {
  const veteran = getVeteranStatus(player);
  if (!veteran.isVeteran) return player;

  const updated = { ...player } as any;

  // Deneyim bonusu: leadership ve composure artar
  updated.leadership = Math.min(99, (updated.leadership ?? 50) + veteran.experienceBonus.leadership);
  updated.composure = Math.min(99, (updated.composure ?? 50) + veteran.experienceBonus.composure);

  // Fiziksel gerileme: speed ve stamina azalır
  updated.speed = Math.max(5, (updated.speed ?? 50) - veteran.physicalDecline.speed);
  updated.stamina = Math.max(5, (updated.stamina ?? 50) - veteran.physicalDecline.stamina);

  // Veteran oyuncular special_role olarak işaretlenir
  if (!updated.special_role || updated.special_role === '') {
    updated.special_role = 'veteran';
  }

  return updated as Player;
}

/**
 * Sezon sonu emeklilik işleme.
 * Emekli oyuncuların yerine genç yetenekler eklenir.
 * Kalite artırıldı: 52-68 OVR, 60-83 potansiyel (eski 48-63, 55-79)
 */
export function processSeasonEndRetirements(
  squad: Player[],
  teamId: string
): {
  updatedSquad: Player[];
  retiredPlayers: Player[];
  newTalents: Player[];
  retirementMessages: string[];
} {
  const retiredPlayers: Player[] = [];
  const retirementMessages: string[] = [];
  const updatedSquad: Player[] = [];
  const newTalents: Player[] = [];

  for (const player of squad) {
    // Önce veteran efektlerini uygula (emekli olmayanlara)
    const withVeteranEffects = applyVeteranEffects(player);

    if (shouldPlayerRetire(player)) {
      retiredPlayers.push(player);

      // Emekli oyuncunun yerine genç yetenek üret
      // NOT: Kalite artırıldı — emeklilik bir ceza olmalı ama çok sert olmamalı
      const pos = player.position || 'MID';
      const talent = generateStarterPlayer(pos as any);
      talent.id = `talent-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      // Yedek oyuncunun gücünü artır: 52-68 OVR (eski 48-63)
      talent.rating = Math.min(talent.rating, 52 + Math.floor(Math.random() * 17)); // 52-68 arası
      talent.hidden_potential = Math.min(talent.hidden_potential || 85, 60 + Math.floor(Math.random() * 24)); // 60-83 potansiyel
      newTalents.push(talent);

      // Duygusal emeklilik mesajı
      const age = player.age;
      if (age >= 41) {
        retirementMessages.push(
          `${player.name} (${age}) kariyerini noktalıyor. Sahada geçirdiği yıllar tarihe karıştı. Efsane vedası.`
        );
      } else if ((player as any).injury?.type === 'chronic') {
        retirementMessages.push(
          `${player.name} (${age}) kronik sakatlığı nedeniyle kariyerine son vermek zorunda kaldı. Acı bir veda.`
        );
      } else if ((player.morale ?? 60) < 30) {
        retirementMessages.push(
          `${player.name} (${age}) motivasyonunu yitirdi ve futbola veda etti. Kariyerinde önemli bir sayfa kapandı.`
        );
      } else {
        retirementMessages.push(
          `${player.name} (${age}) sessizce futbola veda etti. Deneyimi genç oyunculara ilham verecek.`
        );
      }
    } else {
      updatedSquad.push(withVeteranEffects);
    }
  }

  return { updatedSquad, retiredPlayers, newTalents, retirementMessages };
}
