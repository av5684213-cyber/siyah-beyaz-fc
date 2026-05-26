// =============================================================================
// Position Effectiveness — Birim Testleri
// =============================================================================
// Farklı spesifik pozisyonlardaki oyuncuların aynı geniş grupta farklı
// katkı yaptığını doğrular. Örneğin: CDM vs CAM (ikisi MID ama farklı katkı)
// =============================================================================

import {
  getPositionEffectiveness,
  getEffectiveRating,
  getNativePositionEffectiveness,
  getSecondaryPositionEffectiveness,
  clearEffectivenessCache,
  calculatePositionalTeamStrength,
} from '@/lib/fm/positionEffectiveness';
import { POSITION_WEIGHTS, getPositionContributions } from '@/lib/fm/positionWeights';
import type { Player } from '@/lib/fm/types';

// ─── Test Yardımcıları ───────────────────────────────────────────────────────

function createPlayer(overrides: Partial<Player> & { id: string; name: string; position: string; rating: number }): Player {
  return {
    age: 25,
    cond: 90,
    form: 70,
    morale: 75,
    confidence: 70,
    potential: 80,
    hidden_potential: 85,
    market_value: 5000000,
    salary: 1000000,
    nation: 'Türkiye',
    defending: 50,
    passing: 50,
    shooting: 50,
    speed: 50,
    power: 50,
    goalkeeping: 1,
    traits: [],
    specificPosition: 'CM',
    ...overrides,
  } as Player;
}

// ─── Test: Pozisyon Ağırlıkları Tanımları ─────────────────────────────────────

describe('positionWeights', () => {
  it('15 spesifik pozisyon için ağırlık profili tanımlanmış olmalı', () => {
    const expectedPositions = ['GK', 'CB', 'LB', 'RB', 'LWB', 'RWB', 'CDM', 'CM', 'CAM', 'LM', 'RM', 'LW', 'RW', 'ST', 'CF'];
    for (const pos of expectedPositions) {
      expect(POSITION_WEIGHTS[pos]).toBeDefined();
      expect(POSITION_WEIGHTS[pos].weights).toBeDefined();
      expect(POSITION_WEIGHTS[pos].label).toBeTruthy();
    }
  });

  it('her pozisyonun en az 5 ağırlıklı yeteneği olmalı', () => {
    for (const [pos, profile] of Object.entries(POSITION_WEIGHTS)) {
      const weightedAttrs = Object.entries(profile.weights).filter(([, w]) => w > 0);
      expect(weightedAttrs.length).toBeGreaterThanOrEqual(5);
    }
  });

  it('tüm ağırlıklar 0.0-1.0 arası olmalı', () => {
    for (const [pos, profile] of Object.entries(POSITION_WEIGHTS)) {
      for (const [attr, weight] of Object.entries(profile.weights)) {
        expect(weight).toBeGreaterThanOrEqual(0);
        expect(weight).toBeLessThanOrEqual(1);
      }
    }
  });

  it('katkı oranları (defensive/attacking/midfield) 0-1 arası olmalı', () => {
    for (const [pos, profile] of Object.entries(POSITION_WEIGHTS)) {
      expect(profile.defensiveContribution).toBeGreaterThanOrEqual(0);
      expect(profile.defensiveContribution).toBeLessThanOrEqual(1);
      expect(profile.attackingContribution).toBeGreaterThanOrEqual(0);
      expect(profile.attackingContribution).toBeLessThanOrEqual(1);
      expect(profile.midfieldContribution).toBeGreaterThanOrEqual(0);
      expect(profile.midfieldContribution).toBeLessThanOrEqual(1);
    }
  });

  it('GK savunma katkisi 1.0, hücum katkisi 0.0 olmali', () => {
    expect(POSITION_WEIGHTS.GK.defensiveContribution).toBe(1.0);
    expect(POSITION_WEIGHTS.GK.attackingContribution).toBe(0.0);
  });

  it('ST hücum katkisi > 0.9, savunma katkisi 0.0 olmali', () => {
    expect(POSITION_WEIGHTS.ST.attackingContribution).toBeGreaterThanOrEqual(0.9);
    expect(POSITION_WEIGHTS.ST.defensiveContribution).toBe(0.0);
  });
});

// ─── Test: Pozisyon Etkinlik Puani Hesaplama ──────────────────────────────────

describe('getPositionEffectiveness', () => {
  beforeEach(() => {
    clearEffectivenessCache();
  });

  it('CDM ile CAM ayni MID grubunda ama farkli etkinlik puani vermeli', () => {
    const cdmPlayer = createPlayer({
      id: 'cdm-1',
      name: 'CDM Player',
      position: 'MID',
      specificPosition: 'CDM',
      rating: 80,
      tackling: 85,
      passing: 70,
      anticipation: 80,
      stamina: 85,
      positioning: 82,
      marking: 75,
      concentration: 78,
      workRate: 82,
    });

    const camPlayer = createPlayer({
      id: 'cam-1',
      name: 'CAM Player',
      position: 'MID',
      specificPosition: 'CAM',
      rating: 80,
      tackling: 40,
      passing: 88,
      vision: 85,
      shooting: 75,
      dribbling: 78,
      technique: 80,
      firstTouch: 76,
    });

    // CDM, CDM pozisyonunda CAMden daha etkili olmali
    const cdmInCdm = getPositionEffectiveness(cdmPlayer, 'CDM');
    const camInCdm = getPositionEffectiveness(camPlayer, 'CDM');
    expect(cdmInCdm).toBeGreaterThan(camInCdm);

    // CAM, CAM pozisyonunda CDMden daha etkili olmali
    const cdmInCam = getPositionEffectiveness(cdmPlayer, 'CAM');
    const camInCam = getPositionEffectiveness(camPlayer, 'CAM');
    expect(camInCam).toBeGreaterThan(cdmInCam);
  });

  it('CB ile LB ayni DEF grubunda ama farkli etkinlik profili vermeli', () => {
    const cbPlayer = createPlayer({
      id: 'cb-1',
      name: 'CB Player',
      position: 'DEF',
      specificPosition: 'CB',
      rating: 78,
      tackling: 82,
      marking: 80,
      heading: 78,
      positioning: 79,
      speed: 55,
      crossing: 30,
    });

    const lbPlayer = createPlayer({
      id: 'lb-1',
      name: 'LB Player',
      position: 'DEF',
      specificPosition: 'LB',
      rating: 76,
      tackling: 70,
      marking: 60,
      heading: 55,
      positioning: 68,
      speed: 82,
      crossing: 78,
      stamina: 80,
    });

    expect(getPositionEffectiveness(cbPlayer, 'CB')).toBeGreaterThan(
      getPositionEffectiveness(lbPlayer, 'CB')
    );

    expect(getPositionEffectiveness(lbPlayer, 'LB')).toBeGreaterThan(
      getPositionEffectiveness(cbPlayer, 'LB')
    );
  });

  it('bilinmeyen pozisyon icin rating/100 fallback vermeli', () => {
    const player = createPlayer({
      id: 'unknown-pos',
      name: 'Test',
      position: 'MID',
      specificPosition: 'CM',
      rating: 75,
    });

    const eff = getPositionEffectiveness(player, 'UNKNOWN_POS');
    expect(eff).toBeCloseTo(0.75, 1);
  });

  it('etkinlik puani 0.0-1.0 arasi olmali', () => {
    const player = createPlayer({
      id: 'range-test',
      name: 'Range Test',
      position: 'FWD',
      specificPosition: 'ST',
      rating: 90,
      finishing: 95,
      shooting: 90,
      heading: 80,
    });

    for (const pos of ['GK', 'CB', 'CDM', 'CM', 'CAM', 'ST', 'CF', 'LW']) {
      const eff = getPositionEffectiveness(player, pos);
      expect(eff).toBeGreaterThanOrEqual(0);
      expect(eff).toBeLessThanOrEqual(1);
    }
  });

  it('cache ayni sonucu dondurmeli', () => {
    const player = createPlayer({
      id: 'cache-test',
      name: 'Cache Test',
      position: 'MID',
      specificPosition: 'CDM',
      rating: 80,
      tackling: 85,
    });

    const first = getPositionEffectiveness(player, 'CDM');
    const second = getPositionEffectiveness(player, 'CDM');
    expect(first).toBe(second);
  });
});

// ─── Test: Effective Rating ───────────────────────────────────────────────────

describe('getEffectiveRating', () => {
  beforeEach(() => {
    clearEffectivenessCache();
  });

  it('effectiveRating = rating * (0.7 + 0.3 * effectiveness) formulune uymali', () => {
    const player = createPlayer({
      id: 'eff-rating-test',
      name: 'Eff Rating',
      position: 'MID',
      specificPosition: 'CDM',
      rating: 80,
      tackling: 85,
      passing: 70,
    });

    const effectiveness = getPositionEffectiveness(player, 'CDM');
    const effectiveRating = getEffectiveRating(player, 'CDM');
    const expected = 80 * (0.7 + 0.3 * effectiveness);

    expect(effectiveRating).toBeCloseTo(expected, 1);
  });

  it('yuksek etkinlik puani -> ratinge yakin effectiveRating', () => {
    const perfectCDM = createPlayer({
      id: 'perfect-cdm',
      name: 'Perfect CDM',
      position: 'MID',
      specificPosition: 'CDM',
      rating: 85,
      tackling: 90,
      positioning: 88,
      anticipation: 85,
      stamina: 87,
      passing: 82,
      workRate: 85,
      marking: 80,
    });

    const effectiveRating = getEffectiveRating(perfectCDM, 'CDM');
    expect(effectiveRating).toBeGreaterThan(85 * 0.88);
  });

  it('dusuk etkinlik puani -> ratingten dusuk effectiveRating', () => {
    const badCDM = createPlayer({
      id: 'bad-cdm',
      name: 'Bad CDM',
      position: 'MID',
      specificPosition: 'CDM',
      rating: 75,
      tackling: 30,
      positioning: 30,
      anticipation: 30,
      stamina: 30,
      passing: 30,
      workRate: 30,
      marking: 30,
    });

    const effectiveRating = getEffectiveRating(badCDM, 'CDM');
    expect(effectiveRating).toBeLessThan(75 * 0.9);
  });
});

// ─── Test: Yan Pozisyon Etkinligi ─────────────────────────────────────────────

describe('getSecondaryPositionEffectiveness', () => {
  beforeEach(() => {
    clearEffectivenessCache();
  });

  it('dogal pozisyonda penalty yok olmali', () => {
    const player = createPlayer({
      id: 'native-pos',
      name: 'Native',
      position: 'MID',
      specificPosition: 'CDM',
      rating: 80,
      tackling: 85,
    });

    const nativeEff = getPositionEffectiveness(player, 'CDM');
    const secondaryEff = getSecondaryPositionEffectiveness(player, 'CDM');
    expect(secondaryEff).toBeCloseTo(nativeEff, 5);
  });

  it('yan pozisyonda %15 penalty olmali', () => {
    const player = createPlayer({
      id: 'secondary-pos',
      name: 'Secondary',
      position: 'MID',
      specificPosition: 'CDM',
      rating: 80,
      tackling: 85,
      secondaryPositions: ['CM'],
    });

    const nativeEff = getPositionEffectiveness(player, 'CM');
    const secondaryEff = getSecondaryPositionEffectiveness(player, 'CM');
    expect(secondaryEff).toBeCloseTo(nativeEff * 0.85, 3);
  });

  it('uyumsuz pozisyonda %50 penalty olmali', () => {
    const player = createPlayer({
      id: 'incompatible-pos',
      name: 'Incompatible',
      position: 'MID',
      specificPosition: 'CDM',
      rating: 80,
      tackling: 85,
    });

    const nativeEff = getPositionEffectiveness(player, 'ST');
    const incompatibleEff = getSecondaryPositionEffectiveness(player, 'ST');
    expect(incompatibleEff).toBeCloseTo(nativeEff * 0.5, 3);
  });
});

// ─── Test: Takim Guc Hesaplama ────────────────────────────────────────────────

describe('calculatePositionalTeamStrength', () => {
  beforeEach(() => {
    clearEffectivenessCache();
  });

  it('CDM agirlikli takimin savunmasi, CAM agirlikli takimdan yuksek olmali', () => {
    // GK olmadan test: sadece MID oyuncularinin farkli katkilarini olc
    const cdmTeam = [
      createPlayer({ id: 'cdm-1', name: 'CDM 1', position: 'MID', specificPosition: 'CDM', rating: 80, tackling: 85, positioning: 82, anticipation: 80, stamina: 85, passing: 70, marking: 75, workRate: 82, concentration: 78 }),
      createPlayer({ id: 'cdm-2', name: 'CDM 2', position: 'MID', specificPosition: 'CDM', rating: 78, tackling: 80, positioning: 78, anticipation: 77, stamina: 82, passing: 68, marking: 72, workRate: 78, concentration: 74 }),
    ];

    const camTeam = [
      createPlayer({ id: 'cam-1', name: 'CAM 1', position: 'MID', specificPosition: 'CAM', rating: 80, passing: 88, vision: 85, dribbling: 78, shooting: 75, technique: 80, firstTouch: 76 }),
      createPlayer({ id: 'cam-2', name: 'CAM 2', position: 'MID', specificPosition: 'CAM', rating: 78, passing: 82, vision: 80, dribbling: 75, shooting: 72, technique: 76, firstTouch: 72 }),
    ];

    const cdmStrength = calculatePositionalTeamStrength(cdmTeam);
    const camStrength = calculatePositionalTeamStrength(camTeam);

    expect(cdmStrength.defense).toBeGreaterThan(camStrength.defense);
    expect(camStrength.attack).toBeGreaterThan(cdmStrength.attack);
  });
});

// ─── Test: Pozisyon Katki Oranlari ────────────────────────────────────────────

describe('getPositionContributions', () => {
  it('CDM: yuksek savunma, dusuk hucum', () => {
    const c = getPositionContributions('CDM');
    expect(c.defensive).toBeGreaterThan(0.5);
    expect(c.attacking).toBeLessThan(0.3);
  });

  it('CAM: yuksek hucum, dusuk savunma', () => {
    const c = getPositionContributions('CAM');
    expect(c.attacking).toBeGreaterThan(0.5);
    expect(c.defensive).toBeLessThan(0.2);
  });

  it('CM: dengeli katki', () => {
    const c = getPositionContributions('CM');
    expect(c.defensive).toBeGreaterThan(0.1);
    expect(c.attacking).toBeGreaterThan(0.1);
    expect(c.midfield).toBeGreaterThan(0.5);
  });

  it('bilinmeyen pozisyon -> esit dagilim fallback', () => {
    const c = getPositionContributions('UNKNOWN');
    expect(c.defensive).toBeCloseTo(0.33, 1);
    expect(c.attacking).toBeCloseTo(0.33, 1);
    expect(c.midfield).toBeCloseTo(0.33, 1);
  });
});
