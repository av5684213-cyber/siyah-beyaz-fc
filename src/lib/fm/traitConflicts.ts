
export const CONFLICTING_TRAITS: Record<string, string[]> = {
  // Positive vs Negative Skills
  "Ofsayt ustası": ["Ofsayta düşer"],
  "Ofsayta düşer": ["Ofsayt ustası"],
  
  "Soğukkanlı": ["Panik yapar", "Panikçi", "Panik yapar", "Kararsız"],
  "Panik yapar": ["Soğukkanlı", "Lider stoper", "Lider kaleci"],
  "Panikçi": ["Soğukkanlı", "Büyük maç oyuncusu", "Büyük maç kalecisi", "Lider stoper", "Lider kaleci"],
  
  "Profesyonel": ["Tembel", "Disiplinsiz", "Gece hayatı düşkünü", "Rahatına düşkün", "Problem çıkaran", "Tartışmacı", "Gece hayatı düşkünü"],
  "Tembel": ["Profesyonel", "Çalışkan", "İsteksiz", "Dayanıklı", "Pres ustası", "Box-to-box"],
  "Disiplinsiz": ["Profesyonel", "Disiplinli", "Lider stoper", "Lider kaleci", "Soyunma odası lideri"],
  "Disiplinli": ["Disiplinsiz", "Problem çıkaran", "Tartışmacı", "Kart manyağı"],
  
  "Hırslı": ["İsteksiz", "Rahatına düşkün", "Pısırık"],
  "Çalışkan": ["Tembel", "İsteksiz", "Yedek kalmayı sever"],
  "İsteksiz": ["Hırslı", "Çalışkan", "Kazanan karakter", "Taraftar baskısından etkilenir"],
  
  "Takım oyuncusu": ["Egoist", "Bencil", "Problem çıkaran"],
  "Egoist": ["Takım oyuncusu", "Sessiz lider", "Soyunma odası lideri", "Mentor"],
  "Bencil": ["Takım oyuncusu", "Ara pasçı", "Oyun kurucu"],

  "Pres ustası": ["Savunmaya yardım etmez", "Tembel", "Ağır kalır"],
  "Savunmaya yardım etmez": ["Pres ustası", "Dayanıklı", "Çalışkan", "Box-to-box", "Lider stoper"],
  
  "Bitirici": ["Beceriksiz bitirici"],
  "Gol makinesi": ["Beceriksiz bitirici"],
  "Beceriksiz bitirici": ["Bitirici", "Gol makinesi", "Fırsatçı", "Fırsatçı (forvet)", "Kontra bitiricisi"],
  
  "Oyun kurucu": ["Pas hatası yapar", "Top kaybı yapar", "Yavaş karar verir"],
  "Top dağıtıcı": ["Pas hatası yapar", "Top kaybı yapar", "Yavaş karar verir"],
  "Pas hatası yapar": ["Oyun kurucu", "Top dağıtıcı", "Uzun pas ustası", "Pas arası ustası", "Uzun pasçı", "Ara pasçı"],
  
  "Top saklayan": ["Top kaybı yapar"],
  "Top kaybı yapar": ["Top saklayan", "Oyun okuyan", "Risk hesaplayıcı", "Top dağıtıcı"],
  
  "Oyun görüşü yüksek": ["Yanlış karar verir", "Yavaş karar verir"],
  "Yanlış karar verir": ["Oyun görüşü yüksek", "Soğukkanlı", "Oyun okuyan", "Libero kaleci"],
  "Yavaş karar verir": ["Oyun görüşü yüksek", "Zamanlama hatası", "Refleks canavarı", "Regista", "Sweeper keeper"],
  
  "Güvenli eller": ["Sektirir"],
  "Sektirir": ["Güvenli eller"],
  
  "Refleks canavarı": ["Yavaş refleks"],
  "Yavaş refleks": ["Refleks canavarı"],
  
  "Hava hakimiyeti": ["Hava zaafı"],
  "Hava zaafı": ["Hava hakimiyeti", "Kafacı (defans)", "Kafacı (forvet)"],

  "Büyük maç oyuncusu": ["Panikçi", "Panik yapar"],
  "Büyük maç kalecisi": ["Panik yapar", "Panikçi"],

  // PlayStyles vs Negative Traits
  "Uzun pasçı": ["Pas hatası yapar"],
  "Ara pasçı": ["Pas hatası yapar", "Yanlış karar verir"],
  "Koşu ustası": ["Ağır kalır"],
  "Kontra bitiricisi": ["Beceriksiz bitirici", "Ofsayta düşer"],
  "Kafacı (defans)": ["Hava zaafı"],
  "Kafacı (forvet)": ["Hava zaafı"],
  "Penaltı kurtarıcı": ["Yavaş refleks"],
  "Libero kaleci": ["Yanlış karar verir", "Çıkış hatası"],

  "Ağır kalır": ["Hızlı forvet", "Hızlı stoper", "Koşu ustası", "Hızlı kanat", "Sprinter", "Advanced fwd", "Inside fwd"],
  "Konsantrasyon düşüklüğü": ["Lider stoper", "Lider kaleci", "Maestro", "Oyun okuyan", "Pozisyon ustası", "Pozisyoncu", "Sahte 9", "Regista"],
  
  "Oyun okuyan": ["Anticipation hatası", "Yanlış karar verir", "Panik yapar"],
  "Pozisyon ustası": ["Zayıf markaj", "Zamanlama hatası", "Hücum hattında yerini ayarlayamaz"],
  
  "Regista": ["Pas hatası yapar", "Yavaş karar verir", "Oyun kurucu"],
  "10 numara": ["Egoist", "Pas hatası yapar", "Sessiz lider"],
  "Sahte 9": ["Beceriksiz bitirici", "Top kaybı yapar"],
  "Sprinter": ["Ağır kalır", "Tembel"],
  
  "Lider stoper": ["Disiplinsiz", "Problem çıkaran", "Panik yapar", "Konsantrasyon düşüklüğü"],
  "Lider kaleci": ["Panik yapar", "Sektirir", "Yavaş refleks"],

  "Gölge Markajcı": ["Zayıf markaj", "Zamanlama hatası"],
  "Şut Engelleyici": ["Konsantrasyon düşüklüğü"],
  "Alan Kapatıcı": ["Yanlış karar verir", "Pozisyon hatası"],
  "Pas Duvarı": ["Pas hatası yapar", "Ağır kalır"],
  "Tazı Defans": ["Ağır kalır", "Tembel"],
  "Oyun Bozan": ["Savunmaya yardım etmez", "İsteksiz"],
  "Asla Pes Etmez": ["Konsantrasyon düşüklüğü", "İsteksiz"],
  "Pozisyon Bekçisi": ["Zamanlama hatası", "Yanlış karar verir"],
  "Top Hırsızı": ["Top kaybı yapar"],
  "Gölge Takipçi": ["Savunmaya yardım etmez"],
  "Mücadeleci Stoper": ["Panik yapar", "Pısırık"]
};

export function hasConflict(trait1: string, trait2: string): boolean {
  if (trait1 === trait2) return true;
  const conflicts = CONFLICTING_TRAITS[trait1];
  return conflicts ? conflicts.includes(trait2) : false;
}

export function findConflicts(traits: string[]): [string, string][] {
  const found: [string, string][] = [];
  for (let i = 0; i < traits.length; i++) {
    for (let j = i + 1; j < traits.length; j++) {
      if (hasConflict(traits[i], traits[j])) {
        found.push([traits[i], traits[j]]);
      }
    }
  }
  return found;
}
