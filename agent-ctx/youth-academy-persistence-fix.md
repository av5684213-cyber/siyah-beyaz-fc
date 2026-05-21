# Task: Fix Youth Academy Facility Upgrades Persistence

## Summary
Fixed three bugs that caused youth academy facility upgrades to not persist after page reload.

## Bugs Found and Fixed

### Bug 1: No auto-sync for `youthFacilities` state to Supabase
**Problem:** Unlike `profile` (which has auto-sync in GameContext), `youthFacilities` state was only persisted via an explicit `saveYouthFacilities()` call inside the `onUpgradeFacility` callback. If that save failed silently (e.g., network issue, RLS), the data was lost on reload.

**Fix:** Added a `useEffect` that auto-syncs `youthFacilities` to Supabase whenever the state changes (after initial load completes). Uses a `useRef` flag (`youthFacilitiesLoadedRef`) to avoid saving the initial empty state before data is loaded from the database.

```javascript
// Auto-sync youthFacilities to Supabase when state changes (after initial load)
useEffect(() => {
  if (!profile?.id) return;
  if (!youthFacilitiesLoadedRef.current) return;
  if (Object.keys(youthFacilities).length === 0) return;
  saveYouthFacilities(youthFacilities, profile.id);
}, [youthFacilities, profile?.id]);
```

### Bug 2: Stale closure in `onUpgradeFacility` callback
**Problem:** The `onUpgradeFacility` callback captured `youthFacilities` from the closure. If multiple rapid upgrades happened, the stale closure would calculate incorrect facility levels, potentially overwriting previous upgrades.

**Fix:** Changed `setYouthFacilities` to use functional state update pattern, ensuring the latest state is always used:

```javascript
// Before (buggy):
const newFacilities = { ...youthFacilities, [id]: (youthFacilities[id] || 1) + 1 };
setYouthFacilities(newFacilities);

// After (fixed):
setYouthFacilities(prev => {
  const newLevel = (prev[id] || 1) + 1;
  const newFacilities = { ...prev, [id]: newLevel };
  if (profile.id) {
    saveYouthFacilities(newFacilities, profile.id);
  }
  return newFacilities;
});
```

### Bug 3: Stale closure in `onDeductCredits` callback
**Problem:** The `onDeductCredits` callback calculated `newCredits` from `profile.credits` (captured in closure), then set it via `setProfile(p => ({ ...p, credits: newCredits }))`. The stale `newCredits` value would overwrite any intermediate credit changes from concurrent operations.

**Fix:** Moved credit calculation inside the functional update to use the latest state:

```javascript
// Before (buggy):
const newCredits = (profile.credits || 0) - amount;
setProfile(p => p ? { ...p, credits: newCredits } : p);

// After (fixed):
setProfile(p => {
  if (!p) return p;
  const newCredits = (p.credits || 0) - amount;
  if (p.id) { saveCredits(newCredits, p.id); }
  return { ...p, credits: newCredits };
});
```

### Bug 4: Loading condition prevented state sync
**Problem:** `if (Object.keys(loadedFacilities).length > 0)` prevented setting facilities when the loaded data was empty. While this didn't cause visible bugs (empty state is the default), it could mask issues where the DB had valid data that was incorrectly parsed as empty.

**Fix:** Always call `setYouthFacilities(loadedFacilities)` regardless of whether it's empty.

## Files Modified
- `src/app/page.tsx` - Added auto-sync useEffect, fixed stale closures, fixed loading condition

## Verification
- ESLint: No errors
- TypeScript: Path alias errors only (not real errors, Next.js handles them)
