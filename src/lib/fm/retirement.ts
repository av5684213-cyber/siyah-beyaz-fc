import { Player } from './types';
import { generateStarterPlayer } from './playerGenerator';

/**
 * Oyuncunun emekliliğe aday olup olmadığını hesaplar.
 * Sadece yaşa değil; morale, sakatlık geçmişi ve forma göre karar verir.
 *
 * Emeklilik kriterleri:
 * - 40+ yaş: kesin emeklilik
 * - 38-39 yaş: düşük morale veya kronik sakatlık varsa emekli
 * - 36-37 yaş: çok kötü form + ciddi sakatlık geçmişi + düşük morale
 * - 35- yaş: emeklilik yok
 */
export function shouldPlayerRetire(player: Player): boolean {
  const age = player.age || 0;
  const morale = player.morale ?? 60;
  const form = player.form ?? 50;
  const hasChronicInjury = (player as any).injury?.type === 'chronic';
  const injuryHistory = (player as any).injury_history || [];
  const severeInjuries = injuryHistory.filter((i: any) => (i.duration_days || 0) >= 10).length;

  // 40+ yaş: kesin emeklilik
  if (age >= 40) return true;

  // 38-39: düşük morale veya kronik sakatlık
  if (age >= 38) {
    if (hasChronicInjury) return true;
    if (morale < 30) return true;
    if (form < 30 && severeInjuries >= 2) return true;
    if (Math.random() < 0.4) return true; // %40 rastgele emeklilik
    return false;
  }

  // 36-37: çok kötü koşullarda erken emeklilik
  if (age >= 36) {
    if (hasChronicInjury && morale < 25 && form < 25) return true;
    if (severeInjuries >= 4 && morale < 20) return true;
    return false;
  }

  return false;
}

/**
 * Sezon sonu emeklilik işleme.
 * Emekli oyuncuların yerine genç yetenekler eklenir.
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
    if (shouldPlayerRetire(player)) {
      retiredPlayers.push(player);

      // Emekli oyuncunun yerine genç yetenek üret
      const pos = player.position || 'MID';
      const talent = generateStarterPlayer(pos as any);
      talent.id = `talent-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      newTalents.push(talent);

      // Duygusal emeklilik mesajı
      const age = player.age;
      if (age >= 40) {
        retirementMessages.push(
          `${player.name} (${age}) kariyerini noktalıyor. Sahada geçirdiği yıllar tarihe karıştı.`
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
          `${player.name} (${age}) sessizce futbola veda etti.`
        );
      }
    } else {
      updatedSquad.push(player);
    }
  }

  return { updatedSquad, retiredPlayers, newTalents, retirementMessages };
}
