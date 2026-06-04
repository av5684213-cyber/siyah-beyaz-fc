# PERFORMANS-11 — Realtime Singleton Channel Pattern

## Task Summary
Created `/home/z/my-project/src/lib/realtime-manager.ts` — a singleton channel manager that deduplicates Supabase Realtime WebSocket connections.

## What Was Done

1. **Read existing supabase.ts** — Confirmed `createBrowserClient()` is already a singleton and `isSupabaseConfigured()` is available.

2. **Created `/home/z/my-project/src/lib/realtime-manager.ts`** with:
   - `RealtimeManager` class with channel deduplication by name
   - `subscribe()` method returning an unsubscribe function
   - `isSupabaseConfigured()` guard before creating channels
   - Proper error handling with try/catch around channel creation
   - `unsubscribeAll()` for logout scenarios
   - `getDebugInfo()` for development visibility
   - `activeChannelCount` and `totalSubscriptions` getters
   - Auto-teardown when last subscriber leaves a channel
   - Singleton export: `realtimeManager`

3. **Identified files using direct `supabase.channel()` calls** (8 channels across 5 files):

## Files Currently Using Direct Channel Subscriptions

| # | File | Channel Name(s) | Table(s) | Notes |
|---|------|-----------------|----------|-------|
| 1 | `src/app/match/[id]/page.tsx` | `match_events:{fixtureId}`, `fixture_status:{fixtureId}`, `live_match:{fixtureId}`, `match_session:{fixtureId}` | `match_events`, `fixtures`, `live_matches`, `match_sessions` | 4 separate channels, 5 `.on()` listeners (match_events has INSERT + UPDATE) |
| 2 | `src/lib/fm/unifiedMessagingService.ts` | Dynamic (via `channelName` param) | `match_chat`, etc. | Already has a local `getOrCreateChannel()` helper, but limited to this service |
| 3 | `src/components/fm/CommunicationPanel.tsx` | `public:messages` | `messages` | Single channel, single listener |
| 4 | `src/components/fm/LiveMatchAlert.tsx` | `live_match_alert` | `live_matches` | Single channel, event `*` |
| 5 | `src/components/fm/NotificationCenter.tsx` | `notifications` | `notifications` | Single channel with profile filter |

## Recommended Migration Order (Future Work)

1. **`NotificationCenter.tsx`** — Simplest, single channel, single listener
2. **`CommunicationPanel.tsx`** — Single channel, single listener
3. **`LiveMatchAlert.tsx`** — Single channel, single listener
4. **`unifiedMessagingService.ts`** — Already has partial dedup logic, can be replaced
5. **`match/[id]/page.tsx`** — Most complex: 4 channels, 5+ listeners. This is where the biggest win is (could potentially merge some into shared channels).
