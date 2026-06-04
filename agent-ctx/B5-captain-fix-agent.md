# B5: Captain Has No Effect — Bug Fix

## Summary
Fixed Bug B5 where the captain had no meaningful effect in the match engine. The existing `applyCapitanBonus` function only gave a trivial +2 morale boost and didn't leverage personality traits or leadership attributes.

## Changes Made

### File: `src/lib/fm/enhancedMatchEngine.ts`

#### 1. SimulationOptions Interface (line ~170)
- Added `homeCaptainId?: string` and `awayCaptainId?: string` fields
- Allows explicit captain specification via options, falling back to `special_role` detection

#### 2. TeamState Interface (line ~232)
- Added `captain: MutablePlayerState | null` — reference to the detected captain
- Added `captainMoraleBoost: number` — 0.0–0.08 global morale modifier
- Added `captainPositionGroupBoost: number` — 0.0–0.03 position group boost

#### 3. Captain Detection System (line ~1353)
Replaced the old `applyCapitanBonus` function with a comprehensive `detectCaptain` function that:
- **Detection order**: 1) `captainId` from options → 2) `special_role` field → 3) Highest `leadership` attribute (70+)
- **Morale boosts**:
  - Base captain effect: +2% morale
  - "Lider" personality trait AND captain: +5% morale to all teammates
  - "Soyunma odası lideri" regular trait: +2% extra
  - "Sessiz lider" regular trait: +1% extra
  - Leadership attribute 70+: scaling bonus up to +2%
  - Cap: 8% max morale boost
- **Position group boost**: +3% to captain's position group (FWD→attack, MID→midfield, etc.)
- Applies morale boost to all teammates immediately

#### 4. Team Strength Application (line ~1552)
- Captain morale boost applied multiplicatively to all strength dimensions
- Position group boost applied to the relevant strength dimension

#### 5. Goal Event Captain Effects (line ~2148)
After a confirmed goal:
- **Scoring team**: Captain increases morale recovery (+3 base + scaling from captainMoraleBoost)
- **Conceding team with captain**: Reduces morale drop by `captainMoraleBoost × 5` factor
- **Conceding team without captain**: Full 5-point morale drop
- Captain stays composed (no morale drop when conceding)

#### 6. calculateTeamStrength weightedRating (line ~480)
- Captain base personal boost: +3% (organizing, responsibility)
- Captain with "Lider" personality: extra +5%
- Captain with "Soyunma odası lideri": extra +2%
- Captain with "Sessiz lider": extra +1%
- Captain with high leadership attribute: up to +3%

#### 7. Red Card Recalculation (line ~2383)
- Re-applies captain boost after team strength recalculation on red card

## No New Errors
All TypeScript errors in the file are pre-existing (unrelated to this change).
