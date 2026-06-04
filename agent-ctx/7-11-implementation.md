# Task 7-11 Implementation Summary

## GÖREV 7: Fix form rating and player evaluation randomness

### 7a. careerStats.ts
- Added validation/clamping at the start of `updateMatchCareerStats` function
- Stats are now clamped: goals (0-10), assists (0-10), yellowCards (0-2), redCards (0-1), fouls (0-15), saves (0-20), rating (0-10)
- `validatedStats` used throughout instead of raw `stats`

### 7b. formRatingService.ts
- Added detailed documentation comment explaining match_rating calculation formula
- Documents that ratings should be performance-based (NOT random)
- Specifies base 5.0, bonuses for goals/assists/clean sheet/MOTM, penalties for cards

## GÖREV 8: Apply inflation to entire economy

### 8a. salaryUtils.ts
- Added `import { getInflationFactor } from './inflation'`
- `calculatePlayerSalary` now accepts optional `currentDay` parameter
- When currentDay > 1, applies inflation factor to base salary
- `calculateSalaryRange` updated to pass currentDay through

### 8b. valuation.ts
- Added `import { getInflationFactor } from './inflation'`
- `calculateMarketValue` now accepts optional `currentDay` parameter
- Before final min/round, applies inflation factor if currentDay > 1
- `getTransferCorridor` updated signature (currentDay optional, value already includes inflation)

### 8c. playerGenerator.ts
- `generatePlayer` now accepts optional 5th parameter `currentDay`
- `calculateMarketValue(partialPlayer, currentDay)` - passes currentDay
- `calculatePlayerSalary(baseRating, false, currentDay)` - passes currentDay

### 8d. stadiumMatrix.ts
- Added `import { getInflationFactor } from './inflation'`
- `calculateUpgradeCost` now accepts optional `currentDay` parameter
- When currentDay > 1, applies inflation factor to the exponentially-scaled cost

## GÖREV 9: Merge league maintenance and season-end

### 9a. season-end/route.ts
- Added comment: "NOTE: This route handles both season-end AND league maintenance. The /api/league/maintenance route is now a thin wrapper that calls the same logic."

### 9b. league/maintenance/route.ts
- Completely rewrote GET handler with the new implementation:
  1. Ensure default leagues exist (upsert)
  2. Ensure NPC teams exist for all leagues (create if count=0)
  3. Fix broken team names (sanitize + correct)
  4. Ensure active season + standings + fixtures exist
  5. Sync user team names from profiles
- Kept existing imports and `sanitizeTeamName` function
- Uses `assignRefereesToSeason` for new seasons

## GÖREV 10: LeagueStandings fallback warning

### LeagueStandings.tsx
- Replaced generic "Bağlantı sorunu" message with source-specific messages:
  - `mock`: "Örnek veriler gösteriliyor — canlı veriye bağlanılamadı"
  - `fallback_no_league`: "Lig verisi bulunamadı — geçici veriler gösteriliyor"
  - `error_fallback`: "Veritabanı bağlantı hatası — önbellek verileri gösteriliyor"
  - `fallback`: "Veriler güncel olmayabilir — bağlantı kontrol ediliyor"
- Added wrapper `<div>` for proper layout

## GÖREV 11: Bot profiles in weekly income/expenses

### weekly-income/route.ts
- Bot budget constraint: when budget < 0, ensures at least wages are covered
- Fixed pre-existing variable scoping issue (totalIncome, totalExpense, revenueBreakdown, profileSponsorIncome, profileSponsors were inside else block but used after it)
- Variables now declared at wider scope for proper access
- Added bot budget update loop after main processing:
  - Sets `transfer_budget_restricted: true` for bots with negative budget
  - Sets `transfer_budget_restricted: false` for bots with non-negative budget
  - Silently handles missing column (old schema compatibility)

### Migration file
- Created `20260607000001_add_transfer_budget_restricted.sql`
- Adds `transfer_budget_restricted BOOLEAN DEFAULT FALSE` to profiles table

## Pre-existing issues fixed
- weekly-income/route.ts: Variable scoping bug (variables used outside their block scope) - fixed by declaring at wider scope and using optional chaining for revenueBreakdown
