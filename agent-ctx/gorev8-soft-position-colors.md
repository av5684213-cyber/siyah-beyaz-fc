# GÖREV 8: Mevki Renklerini Yumuşat

## Task ID: gorev8
## Agent: Z Code Agent

## Work Summary
Updated all position (mevki) color definitions across the entire project from hard/bright Tailwind defaults to soft custom hex colors.

## Color Mapping
| Position | Old Color | New Color |
|----------|-----------|-----------|
| GK (Kaleci) | emerald-400/500 | #4A90E2 (soft blue) |
| DEF (Defans) | blue-400/500 | #50E3C2 (soft green-turquoise) |
| MID (Orta Saha) | amber-400/500 | #F5A623 (soft orange) |
| FWD (Forvet) | red-400/500 | #D0021B (soft red) |
| SUB (Yedek) | white/60 | #9B9B9B (grey) |

## Modified Files

1. **src/lib/fm/ui-helpers.ts** - Central position color definitions
   - Updated `getPosColor()` to use soft hex colors
   - Added `getPosGroup()` helper for position grouping
   - Added `getPosRowStyle()` for row highlight (bg + border-l)
   - Added `getPosBadgeStyle()` for badge styling (bg + border + text)
   - Added `getPosDotColor()` for tactical board dots
   - Fixed `toTitleCase()` param type from `any` to `string | undefined | null`

2. **src/components/fm/PlayerRow.tsx** - Player list rows
   - Replaced inline posColor logic with `getPosRowStyle()`

3. **src/components/fm/PlayerDetailModal.tsx** - Player detail popup
   - Updated `colorClass` for position dot → `getPosDotColor()`
   - Updated `posColor`/`posBg` → `getPosBadgeStyle()` decomposition
   - Updated secondary position colors (2 places) → `getPosBadgeStyle()`

4. **src/components/fm/TeamProfileModal.tsx** - Team profile player list
   - Replaced `getPositionColor()` with `getPosRowStyle()` + text color

5. **src/components/fm/TacticsRolesPanel.tsx** - Tactics role panel
   - Updated `CATEGORY_COLORS` to use soft hex with opacity
   - Updated `CATEGORY_DOT_COLORS` to use soft hex
   - Updated `CATEGORY_GLOW` shadow colors to use soft hex

6. **src/components/fm/YouthAcademyTab.tsx** - Youth academy
   - Updated `POSITION_COLORS` record to use soft hex classes

7. **src/components/fm/TacticsCommandCenter.tsx** - Squad tactics
   - Replaced `getPositionColor()` with `getPosRowStyle()` + text color
   - Updated position legend squares with soft hex colors

8. **src/components/fm/TrainingAcademy.tsx** - Training panel
   - Replaced inline posColor logic with `getPosRowStyle()`

9. **src/components/fm/HallOfFameTab.tsx** - Hall of fame
   - Updated `POSITION_COLORS` record to use soft hex text classes

10. **src/components/fm/TacticLab.tsx** - Tactic lab visualization
    - Updated player circle background colors (2 places)

11. **src/components/fm/MatchReportPanel.tsx** - Match report
    - Updated `positionBadge()` function to use soft hex colors

## Implementation Approach
- Used Tailwind arbitrary values (`text-[#4A90E2]`, `bg-[#4A90E2]/10`, etc.)
- Centralized helpers in ui-helpers.ts for consistent color management
- Where possible, replaced component-local color definitions with shared helpers
- No `any` TypeScript types in modified code
- Turkish UI language preserved

## Verification
- Server returns HTTP 200
- No new TypeScript errors introduced (pre-existing errors unchanged)
