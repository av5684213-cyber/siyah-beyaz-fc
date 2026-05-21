# Tasks 2, 6, 8 Implementation Summary

## TASK 2: Referee Profile Cards in Stadium Tab
- Created `src/components/fm/RefereeSection.tsx` with:
  - Fetches referees from Supabase `referees` table via `/api/referees?leagueId=xxx`
  - Shows referee cards in 3-column grid on desktop
  - Each card displays: name, personality type (with Turkish description), strictness bar, experience stars (1-10)
  - All 6 personality types with Turkish descriptions as specified
  - Cards are informational only (no interaction)
  - Empty state shows "Hakemler yuklenmedi" message
- Created `src/app/api/referees/route.ts` API endpoint
- Added import and `<RefereeSection />` after `<StaffSection />` in StadiumTab.tsx

## TASK 6: Training - "Mac Analisti Onerisi" Section
- Modified `src/components/fm/TrainingAcademy.tsx`:
  - Added imports: `useEffect`, `BarChart3`, `AlertCircle`, `Lock`, `useFM`
  - Added state: `hasAnalyst`, `analystStars`, `analystLoading`
  - Added `useEffect` to check if user has `analyst` type staff via `/api/staff?userId=xxx`
  - Added `analystRecommendation` memoized value based on squad data analysis
  - Added new "Mac Analisti Onerisi" section at bottom of training page
  - Shows warning message if no analyst: "Mac analistiniz yok. Yerleske sekmesinden satin alin."
  - Shows training recommendation if analyst exists
  - Higher-star analysts (3+) show additional detail stats

## TASK 8: Archive and Inventory "Yakinda" Warning
- Modified `src/components/fm/InventoryTab.tsx`:
  - Added `Construction` icon import
  - Added prominent amber warning banner at top: "Bu ozellik yakinda kullanima sunulacak."
  - Dimmed existing content (header: opacity-60, tabs/grid: opacity-50)
  - Banner has construction icon and decorative gradient stripe
- Checked for archive page - none exists at `src/app/archive/page.tsx`

## Additional Fix
- Fixed pre-existing TypeScript error in `NextMatchOpponentSquad.tsx` line 255 (missing closing parenthesis in template literal)
