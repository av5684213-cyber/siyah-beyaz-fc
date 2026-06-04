# Work Summary: PROMPTs 3, 4, 7, 8

## PROMPT 3: Yorum akışı siliniyor (visibleEvents)
**File:** `src/components/fm/MatchDay.tsx`
- Removed `visibleEvents: []` from the `setMatchState` call inside `runSimulation`
- Match commentary is now preserved when simulation re-runs (e.g., after tactic/substitution changes)

## PROMPT 4: Oyuncu değişikliği limiti (MAX_SUBS = 5)
**File:** `src/components/fm/MatchDay.tsx`
- Added `subsUsed` state and `MAX_SUBS = 5` constant
- Added limit check in `handleSubstitute` (shows message in commentary when limit reached)
- Added limit check in `handleTacticsChange` SUBSTITUTE path
- Added limit check when clicking a player for substitution (onClick on "SAHADAKİLER" buttons)
- Disabled player selection UI when limit reached (opacity + cursor-not-allowed)
- Added "Değişiklik: X/5" counter in both "YEDEK KULÜBESİ" and "SAHADAKİLER" headers
- Reset `subsUsed` when new match starts (`_simulationStarted` block)
- Substitution event text updated to "DEĞİŞİKLİK: ▲ PlayerIn ▼ PlayerOut"
- Substitution event now added AFTER simulation (not before), preserving existing commentary

## PROMPT 7: Kiralık oyuncu geri dönüşü bildirim
**Files modified:**
1. `src/app/api/cron/season-end/route.ts` - Loan return logic now:
   - Fetches `loaned_from_profile_id` from the player record
   - If original owner found: returns player to original owner's profile_id and team_name, sends notification
   - If no original owner: sets player as free agent
   - Clears `loaned_from_profile_id` after return
2. `src/app/api/loans/request/route.ts` - When a loan is created, `loaned_from_profile_id` is set to the player's current `profile_id` (the original owner)
3. `src/app/api/admin/schema-migration/route.ts` - Added `ALTER TABLE players ADD COLUMN IF NOT EXISTS loaned_from_profile_id TEXT`

## PROMPT 8: Sezon sonu istatistik çakışması
**File:** `src/app/api/cron/season-end/route.ts`
- Added helper functions `getGoals()` and `getAssists()` that use `player_career_stats` when available, falling back to direct `p.goals`/`p.assists`
- Updated award sorting logic:
  - Golden Boot: `getGoals(b) - getGoals(a)` instead of `(b.goals || 0) - (a.goals || 0)`
  - Top Assists: `getAssists(b) - getAssists(a)` instead of direct access
  - Unsung Hero filter: `getGoals(p) + getAssists(p) < 3`
  - Fan Favorite filter: `getGoals(p) + getAssists(p) >= 2`
  - Fan Favorite sort: uses `getGoals()` and `getAssists()`

## Files Modified
1. `src/components/fm/MatchDay.tsx` (PROMPT 3 + PROMPT 4)
2. `src/app/api/cron/season-end/route.ts` (PROMPT 7 + PROMPT 8)
3. `src/app/api/loans/request/route.ts` (PROMPT 7)
4. `src/app/api/admin/schema-migration/route.ts` (PROMPT 7)
