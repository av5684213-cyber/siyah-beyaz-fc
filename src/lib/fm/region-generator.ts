
import { Player } from './types';
import { generatePlayer } from './playerGenerator';

const REGION_DATA = {
  it: {
    firstNames: ["Marco", "Giuseppe", "Luca", "Giovanni", "Roberto", "Andrea", "Stefano", "Angelo", "Francesco", "Mario"],
    lastNames: ["Rossi", "Russo", "Ferrari", "Esposito", "Bianchi", "Romano", "Colombo", "Ricci", "Marino", "Greco"],
    teams: [
      "Milano Blue", "Torino Bulls", "Roma Gladiators", "Napoli Azure", "Firenze Lilies", 
      "Genova Mariners", "Verona Scaligers", "Bologna Scholars", "Lazio Eagles", "Atalanta Goddess"
    ],
    leagueNames: ["Serie A", "Serie B", "Serie C1", "Serie C2"]
  },
  tr: {
    firstNames: ["Ahmet", "Mehmet", "Mustafa", "Can", "Burak", "Emre", "Arda", "Omer", "Yigit", "Mert"],
    lastNames: ["Yilmaz", "Kaya", "Demir", "Celik", "Sahin", "Yildiz", "Erdogan", "Aydin", "Ozdemir", "Arslan"],
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

export function generateLocalizedPlayer(region: 'tr' | 'it', club: string, tier: number, position?: 'GK' | 'DEF' | 'MID' | 'FWD'): Player {
  const data = REGION_DATA[region] || REGION_DATA.tr;
  const firstName = data.firstNames[Math.floor(Math.random() * data.firstNames.length)];
  const lastName = data.lastNames[Math.floor(Math.random() * data.lastNames.length)];
  
  // Rating based on tier: Tier 1 (70-85), Tier 2 (60-75), Tier 3 (50-65), Tier 4 (40-55)
  const baseRating = 80 - (tier * 10);
  const rating = baseRating + Math.floor(Math.random() * 15);
  
  const pos = position || (["GK", "DEF", "MID", "FWD"][Math.floor(Math.random() * 4)] as any);
  const p = generatePlayer(pos, rating);
  
  return {
    ...p,
    name: `${firstName} ${lastName}`,
    club: club,
    team_name: club,
    nation: region === 'tr' ? 'Türkiye' : 'İtalya'
  };
}

export function getRegionConfig(region: 'tr' | 'it') {
  return REGION_DATA[region] || REGION_DATA.tr;
}
