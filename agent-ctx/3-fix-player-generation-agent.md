# Task 3 — Fix Player Generation & Create Regeneration Script

## Agent: Fix Agent (Task 3)

## Task: Fix mental attribute variance and create player regeneration API endpoint

### Work Log:

- Read worklog.md and analyzed existing codebase state (Task 1, 1-fix, 2-a, 2-b agents' work)
- Read attributeGenerator.ts — found 5 priority levels (cok_dusuk, dusuk, orta, yuksek, cok_yuksek) with too-broad group mappings (GK, DEF, MID, FWD only)
- Read playerGenerator.ts — found generatePositionBasedStats() only used broad position groups, losing specificity for CDM vs CAM, CB vs LB, etc.
- Read existing regenerate-players/route.ts — found it had its own duplicate attribute generation code instead of using the shared generator

### FIX 1: Expanded Priority System in attributeGenerator.ts

- Added 2 new priority levels: 'dusuk_orta' (30-60) and 'orta_ust' (55-75)
- Updated Priority type from 5 to 7 levels
- Adjusted all priority ranges:
  - cok_dusuk: [10, 40] (was [20, 50])
  - dusuk: [20, 50] (was [30, 65])
  - dusuk_orta: [30, 60] (NEW)
  - orta: [40, 70] (was [40, 80])
  - orta_ust: [55, 75] (NEW)
  - yuksek: [60, 85] (was [55, 90])
  - cok_yuksek: [70, 95] (unchanged)
- Added `specificPositionMentalPriorities` table with 15 specific positions:
  - GK: concentration=cok_yuksek, composure=cok_yuksek, positioning=cok_yuksek, anticipation=yuksek
  - CB: positioning=cok_yuksek, concentration=yuksek, aggression=orta_ust, composure=dusuk_orta, decisions=dusuk_orta
  - LB/RB: workRate=cok_yuksek, positioning=orta_ust, courage=orta_ust
  - LWB/RWB: workRate=cok_yuksek, positioning=orta_ust, flair=orta
  - CDM: anticipation=cok_yuksek, workRate=cok_yuksek, decisions=yuksek, concentration=orta_ust
  - CM: decisions=yuksek, teamwork=cok_yuksek, workRate=orta_ust, vision=yuksek
  - CAM: flair=cok_yuksek, vision=cok_yuksek, workRate=dusuk, aggression=dusuk
  - LM/RM: workRate=yuksek, flair=orta_ust, vision=orta_ust
  - LW/RW: flair=yuksek, concentration=dusuk, anticipation=dusuk
  - CF: composure=yuksek, determination=yuksek, positioning=yuksek, vision=yuksek
  - ST: composure=cok_yuksek, determination=yuksek, positioning=yuksek, vision=dusuk_orta
- Updated `generateAllAttributes()` to use specificPositionMentalPriorities when available, falling back to group-based priorities

### FIX 2: Updated playerGenerator.ts to Use Specific Position Priorities

- Added `specificPositionMentalPriorities` to imports from attributeGenerator
- Updated `generatePositionBasedStats()` to accept optional `specificPosition` parameter
- When specificPosition is provided and found in specificPositionMentalPriorities, uses those priorities for mental attributes instead of broad group priorities
- Updated offTheBall generation to be position-specific (ST/CF=yuksek, LW/RW/CAM=orta_ust, CM/CDM=orta, DEF=dusuk_orta)
- Updated the call site in generatePlayer() to pass `specificPosition` to `generatePositionBasedStats()`

### FIX 3: Rewrote regenerate-players API Endpoint

- Replaced self-contained duplicate player generation code with proper imports from shared modules
- Now uses `getServiceSupabase()` and `isSupabaseConfigured()` from `@/lib/supabase`
- Now uses `generateStableSquad()` from `@/lib/fm/playerGenerator`
- All mental attributes now get position-specific variance through the updated generator pipeline
- Includes all required fields: profile_id, team_name, height, weight, specific_position
- height and weight are ALWAYS populated (never null) — fallback formulas if missing from generator
- Batch insert with fallback to individual inserts on error
- Verification query returns sample players with mental stats for validation
- Authorization via CRON_SECRET or ADMIN_SECRET

### TypeScript Check:
- `npx tsc --noEmit` — no errors in modified files (attributeGenerator.ts, playerGenerator.ts, regenerate-players/route.ts)
- Pre-existing errors in test files, examples, and scripts are unrelated

### Key Files Modified:
- src/lib/fm/attributeGenerator.ts (Priority type expanded, new ranges, specificPositionMentalPriorities added)
- src/lib/fm/playerGenerator.ts (import update, generatePositionBasedStats specific position support, offTheBall position-specific)
- src/app/api/admin/regenerate-players/route.ts (complete rewrite using shared generators)

### Stage Summary:
- Mental attributes now have 7 priority levels instead of 5, with 15 specific position tables instead of 4 broad groups
- CDM players will have high anticipation/concentration but low flair; CAM players will have high flair/vision but low work rate/aggression; etc.
- The 'orta' range was narrowed from [40, 80] to [40, 70] to prevent too-wide variance at the middle level
- The regeneration API now uses the same shared generator pipeline as the rest of the application
