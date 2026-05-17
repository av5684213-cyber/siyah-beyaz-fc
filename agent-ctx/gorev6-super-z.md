# GÖREV 6 - Yerleşke (Facilities) Seviye Geçiş Okları ve Gelir/Maç Motoru Entegrasyonu

## Agent: Super Z (main)
## Task ID: gorev6
## Status: COMPLETED

## Modified Files

1. **src/components/fm/StadiumTab.tsx** — UI değişiklikleri
   - `+` ve `−` butonları kaldırıldı, `ChevronLeft` ve `ChevronRight` ok butonları eklendi
   - Range slider kaldırıldı, seviye göstergesi merkezde büyük font ile gösteriliyor
   - `getLevelEffect` importu eklendi, önizlemede numeric değer gösterimi
   - `ChevronLeft` importu eklendi

2. **src/lib/fm/stadiumMatrix.ts** — Level effect fonksiyonları
   - `icon: any` → `icon: LucideIcon` (any tipi kaldırıldı)
   - `LevelEffectResult` interface eklendi
   - 10+ seviye etkisi fonksiyonu eklendi
   - `getLevelEffect()` genel fonksiyon eklendi

3. **src/lib/fm/trainingEngine.ts** — Antrenman çarpanı
   - `TRAINING_GROUND_XP_MULTIPLIER_BASE` ve `PER_LEVEL` sabitleri
   - `getTrainingGroundMultiplier()` fonksiyonu

4. **src/lib/fm/youthAcademy.ts** — Akademi çarpanı
   - `ACADEMY_QUALITY_MULTIPLIER_BASE` ve `PER_LEVEL` sabitleri
   - `getAcademyFacilityQualityMultiplier()` ve `getAcademyYouthCount()` fonksiyonları

5. **src/lib/fm/matchEngine.ts** — Sakatlık iyileşme
   - `INJURY_RECOVERY_SPEED_BASE` ve `PER_LEVEL` sabitleri
   - `getInjuryRecoveryMultiplier()` ve `applyInjuryRecovery()` fonksiyonları

6. **src/lib/fm/financialModel.ts** — Maç gelir formülleri
   - `calculateStadiumCapacity()` fonksiyonu
   - `calculateAttendance()` fonksiyonu
   - `calculateMatchRevenue()` fonksiyonu

7. **worklog.md** — İşlem kaydı eklendi

## Key Changes Summary

- UI: Slider +/− → ChevronLeft/ChevronRight ok navigasyonu
- 10 tesis için levelEffect fonksiyonu (sayısal çarpanlar)
- Maç gelir formülü: kapasite × pozisyon faktörü × fiyat faktörü
- Antrenman, akademi, sağlık çarpanları motor dosyalarına entegre edildi
- `any` tipi kaldırıldı (LucideIcon kullanıldı)
- try/catch tüm yeni fonksiyonlarda mevcut
