/**
 * Siyah Beyaz FC — Sakatlık Yöneticisi Testleri
 *
 * injuryManager.ts modülünün tüm fonksiyonlarını test eder:
 * - calculateInjuryRisk: Dayanıklılığa göre sakatlık riski
 * - generateInjury: Rastgele sakatlık üretimi
 * - calculatePhysioHealing: Fizyoterapist iyileştirme gücü
 * - applyHealingToDate: Sakatlık bitiş tarihine iyileştirme uygulama
 */

import {
  calculateInjuryRisk,
  generateInjury,
  calculatePhysioHealing,
  applyHealingToDate,
} from '@/lib/fm/injuryManager';

// ═══════════════════════════════════════════════════════════════
// SAKATLIK RİSKİ HESAPLAMA TESTLERİ
// ═══════════════════════════════════════════════════════════════

describe('calculateInjuryRisk', () => {
  describe('Yüksek dayanıklılık → sıfır risk', () => {
    test('stamina 60 → %0 risk', () => {
      expect(calculateInjuryRisk(60)).toBe(0);
    });

    test('stamina 80 → %0 risk', () => {
      expect(calculateInjuryRisk(80)).toBe(0);
    });

    test('stamina 100 → %0 risk', () => {
      expect(calculateInjuryRisk(100)).toBe(0);
    });
  });

  describe('Orta dayanıklılık → %10 risk', () => {
    test('stamina 50 → %10 risk', () => {
      expect(calculateInjuryRisk(50)).toBe(0.10);
    });

    test('stamina 55 → %10 risk', () => {
      expect(calculateInjuryRisk(55)).toBe(0.10);
    });

    test('stamina 59 → %10 risk', () => {
      expect(calculateInjuryRisk(59)).toBe(0.10);
    });
  });

  describe('Düşük dayanıklılık → %30 risk', () => {
    test('stamina 40 → %30 risk', () => {
      expect(calculateInjuryRisk(40)).toBe(0.30);
    });

    test('stamina 45 → %30 risk', () => {
      expect(calculateInjuryRisk(45)).toBe(0.30);
    });

    test('stamina 49 → %30 risk', () => {
      expect(calculateInjuryRisk(49)).toBe(0.30);
    });
  });

  describe('Çok düşük dayanıklılık → %60 risk', () => {
    test('stamina 39 → %60 risk', () => {
      expect(calculateInjuryRisk(39)).toBe(0.60);
    });

    test('stamina 20 → %60 risk', () => {
      expect(calculateInjuryRisk(20)).toBe(0.60);
    });

    test('stamina 0 → %60 risk', () => {
      expect(calculateInjuryRisk(0)).toBe(0.60);
    });
  });

  describe('Sınır değerleri ve hata toleransı', () => {
    test('Negatif stamina clamplenir (0 olarak kabul edilir)', () => {
      expect(calculateInjuryRisk(-10)).toBe(0.60);
    });

    test('100+ üstü stamina clamplenir', () => {
      expect(calculateInjuryRisk(150)).toBe(0);
    });

    test('Sınır noktası: stamina 59.9 → %10 risk (floor değil, >=50)', () => {
      expect(calculateInjuryRisk(59.9)).toBe(0.10);
    });

    test('Sınır noktası: stamina 39.9 → %60 risk', () => {
      expect(calculateInjuryRisk(39.9)).toBe(0.60);
    });
  });

  describe('Monotonluk kontrolü', () => {
    test('Dayanıklılık arttıkça risk azalır veya aynı kalır', () => {
      const risks = [0, 20, 40, 50, 60, 80, 100].map(s => calculateInjuryRisk(s));
      for (let i = 1; i < risks.length; i++) {
        expect(risks[i]).toBeLessThanOrEqual(risks[i - 1]);
      }
    });
  });
});

// ═══════════════════════════════════════════════════════════════
// SAKATLIK ÜRETİMİ TESTLERİ
// ═══════════════════════════════════════════════════════════════

describe('generateInjury', () => {
  test('Dönüş tipi doğru olmalı (severity + days)', () => {
    const injury = generateInjury();
    expect(injury).toHaveProperty('severity');
    expect(injury).toHaveProperty('days');
    expect(['light', 'medium', 'heavy']).toContain(injury.severity);
  });

  test('Hafif sakatlık 1-3 gün arası olmalı', () => {
    // 1000 deneme ile hafif sakatlık aralığını kontrol et
    const lightInjuries = [];
    for (let i = 0; i < 1000; i++) {
      const injury = generateInjury();
      if (injury.severity === 'light') {
        lightInjuries.push(injury.days);
      }
    }
    // En az birkaç hafif sakatlık üretilmiş olmalı
    expect(lightInjuries.length).toBeGreaterThan(100);
    for (const days of lightInjuries) {
      expect(days).toBeGreaterThanOrEqual(1);
      expect(days).toBeLessThanOrEqual(3);
    }
  });

  test('Orta sakatlık 4-10 gün arası olmalı', () => {
    const mediumInjuries = [];
    for (let i = 0; i < 1000; i++) {
      const injury = generateInjury();
      if (injury.severity === 'medium') {
        mediumInjuries.push(injury.days);
      }
    }
    expect(mediumInjuries.length).toBeGreaterThan(50);
    for (const days of mediumInjuries) {
      expect(days).toBeGreaterThanOrEqual(4);
      expect(days).toBeLessThanOrEqual(10);
    }
  });

  test('Ağır sakatlık 11-30 gün arası olmalı', () => {
    const heavyInjuries = [];
    for (let i = 0; i < 2000; i++) {
      const injury = generateInjury();
      if (injury.severity === 'heavy') {
        heavyInjuries.push(injury.days);
      }
    }
    expect(heavyInjuries.length).toBeGreaterThan(20);
    for (const days of heavyInjuries) {
      expect(days).toBeGreaterThanOrEqual(11);
      expect(days).toBeLessThanOrEqual(30);
    }
  });

  test('Dağılım oranları makul aralıkta olmalı', () => {
    const counts = { light: 0, medium: 0, heavy: 0 };
    const N = 3000;
    for (let i = 0; i < N; i++) {
      const injury = generateInjury();
      counts[injury.severity]++;
    }

    // Hafif: ~%50 (±%10)
    expect(counts.light / N).toBeGreaterThan(0.40);
    expect(counts.light / N).toBeLessThan(0.65);

    // Orta: ~%35 (±%10)
    expect(counts.medium / N).toBeGreaterThan(0.25);
    expect(counts.medium / N).toBeLessThan(0.50);

    // Ağır: ~%15 (±%8)
    expect(counts.heavy / N).toBeGreaterThan(0.07);
    expect(counts.heavy / N).toBeLessThan(0.25);
  });

  test('Gün değerleri her zaman pozitif tam sayı olmalı', () => {
    for (let i = 0; i < 500; i++) {
      const injury = generateInjury();
      expect(Number.isInteger(injury.days)).toBe(true);
      expect(injury.days).toBeGreaterThan(0);
    }
  });
});

// ═══════════════════════════════════════════════════════════════
// FİZYOTERAPEİST İYİLEŞTİRME TESTLERİ
// ═══════════════════════════════════════════════════════════════

describe('calculatePhysioHealing', () => {
  test('Boş dizi → 0 iyileştirme', () => {
    expect(calculatePhysioHealing([])).toBe(0);
  });

  test('null/undefined → 0 iyileştirme', () => {
    expect(calculatePhysioHealing(null as any)).toBe(0);
    expect(calculatePhysioHealing(undefined as any)).toBe(0);
  });

  test('1 yıldız fizyoterapist → 2 gün kısaltma', () => {
    expect(calculatePhysioHealing([1])).toBe(2);
  });

  test('2 yıldız fizyoterapist → 4 gün kısaltma', () => {
    expect(calculatePhysioHealing([2])).toBe(4);
  });

  test('3 yıldız fizyoterapist → 8 gün kısaltma', () => {
    expect(calculatePhysioHealing([3])).toBe(8);
  });

  test('4 yıldız fizyoterapist → 12 gün kısaltma', () => {
    expect(calculatePhysioHealing([4])).toBe(12);
  });

  test('5 yıldız fizyoterapist → 16 gün kısaltma', () => {
    expect(calculatePhysioHealing([5])).toBe(16);
  });

  test('Birden fazla fizyoterapist toplamı doğru olmalı', () => {
    // 2 yıldız (4) + 3 yıldız (8) + 5 yıldız (16) = 28
    expect(calculatePhysioHealing([2, 3, 5])).toBe(28);
  });

  test('0 yıldız → 1 yıldız olarak clamplenir (2 gün)', () => {
    expect(calculatePhysioHealing([0])).toBe(2);
  });

  test('6 yıldız → 5 yıldız olarak clamplenir (16 gün)', () => {
    expect(calculatePhysioHealing([6])).toBe(16);
  });

  test('Ondalık yıldızlar yuvarlanır', () => {
    // 2.4 → 2 yıldız = 4 gün, 2.5 → 3 yıldız = 8 gün (Math.round)
    expect(calculatePhysioHealing([2.4])).toBe(4);
    expect(calculatePhysioHealing([2.5])).toBe(8);
  });

  test('Negatif yıldız → 1 yıldız olarak clamplenir', () => {
    expect(calculatePhysioHealing([-1])).toBe(2);
  });

  test('Tam 5 yıldız kadrosu maksimum iyileştirme sağlar', () => {
    // 3 adet 5 yıldız = 3 × 16 = 48 gün
    expect(calculatePhysioHealing([5, 5, 5])).toBe(48);
  });
});

// ═══════════════════════════════════════════════════════════════
// İYİLEŞTİRME TARİHE UYGULAMA TESTLERİ
// ═══════════════════════════════════════════════════════════════

describe('applyHealingToDate', () => {
  test('İyileştirme günü sakatlık bitişinden düşülür', () => {
    // 10 gün sonrası bitiş, 3 gün iyileştirme → 7 gün sonrası
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 10);
    const result = applyHealingToDate(futureDate.toISOString(), 3);
    expect(result).not.toBeNull();

    const resultDate = new Date(result!);
    const expectedDate = new Date(futureDate.getTime() - 3 * 24 * 60 * 60 * 1000);
    expect(Math.abs(resultDate.getTime() - expectedDate.getTime())).toBeLessThan(1000);
  });

  test('İyileştirme sakatlık süresini aşarsa null döner (sakatlık bitti)', () => {
    // Yarın biten sakatlık, 5 gün iyileştirme → geçmiş tarih → null
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const result = applyHealingToDate(tomorrow.toISOString(), 5);
    expect(result).toBeNull();
  });

  test('Sıfır iyileştirme günü bitiş tarihini değiştirmez', () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 10);
    const result = applyHealingToDate(futureDate.toISOString(), 0);
    expect(result).not.toBeNull();
    expect(new Date(result!).getTime()).toBeCloseTo(futureDate.getTime(), -2);
  });

  test('Geçmiş bitiş tarihine iyileştirme uygulanırsa null döner', () => {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 5);
    const result = applyHealingToDate(pastDate.toISOString(), 1);
    expect(result).toBeNull();
  });

  test('Geçersiz tarih formatı → orijinal tarih döner (hata toleransı)', () => {
    const invalidDate = 'not-a-date';
    const result = applyHealingToDate(invalidDate, 3);
    // Hata durumunda orijinal tarih döner
    expect(result).toBe(invalidDate);
  });

  test('Büyük iyileştirme değeri doğru hesaplanır', () => {
    const farFuture = new Date();
    farFuture.setDate(farFuture.getDate() + 60);
    const result = applyHealingToDate(farFuture.toISOString(), 30);
    expect(result).not.toBeNull();

    const resultDate = new Date(result!);
    const expectedDate = new Date(farFuture.getTime() - 30 * 24 * 60 * 60 * 1000);
    expect(Math.abs(resultDate.getTime() - expectedDate.getTime())).toBeLessThan(1000);
  });
});
