/**
 * Realtime Manager — Singleton Channel Pattern
 *
 * Prevents multiple WebSocket connections by sharing a single Supabase
 * Realtime channel across all components. Components subscribe/unsubscribe
 * to specific events without creating new channels.
 *
 * Problem: Every `supabase.channel('x')` call opens a new WebSocket
 * connection. With multiple tabs/components, this can exhaust Supabase's
 * connection limits quickly.
 *
 * Solution: A single RealtimeManager instance that:
 *   - Deduplicates channels by name (one WS connection per channel name)
 *   - Tracks subscriptions per channel so the channel can be torn down
 *     when the last subscriber leaves
 *   - Provides a simple `subscribe()` → `unsubscribe()` API
 *   - Supports filtered subscriptions (e.g., only critical match events)
 *
 * Usage:
 *   const unsub = realtimeManager.subscribe(
 *     'match_chat',
 *     { event: 'INSERT', schema: 'public', table: 'match_chat', filter: 'fixture_id=eq.123' },
 *     (payload) => console.log('New chat:', payload)
 *   );
 *   // Later:
 *   unsub();
 */

import { createBrowserClient, isSupabaseConfigured } from '@/lib/supabase';
import {
  RealtimeChannel,
  RealtimePostgresChangesPayload,
} from '@supabase/supabase-js';

// ─── Types ──────────────────────────────────────────────────────────────

type ChangeCallback = (payload: RealtimePostgresChangesPayload<any>) => void;

interface PostgresChangesConfig {
  event: string;
  schema: string;
  table: string;
  filter?: string;
}

interface SubscriptionEntry {
  id: string;
  channelName: string;
  config: PostgresChangesConfig;
  callback: ChangeCallback;
  /** The specific listener handle returned by `channel.on()` so we can remove it. */
  unsubscribeListener: () => void;
}

// ─── Critical Event Types ──────────────────────────────────────────────
// Bu event'ler Supabase Realtime ile yayınlanır (gerçek zamanlı)
// Diğer event'ler sadece DB'ye yazılır, client polling ile çeker
export const CRITICAL_MATCH_EVENTS = [
  'goal',
  'red_card',
  'penalty',
  'injury',
  'substitution',
  'var_review',
  'goal_overturned',
  'halftime',
  'fulltime',
  'TACTICAL_CHANGE',
] as const;

export type CriticalMatchEvent = (typeof CRITICAL_MATCH_EVENTS)[number];

/**
 * Kritik maç event'leri için Supabase Realtime filter string oluşturur.
 * Sadece kritik event'ler gerçek zamanlı yayınlanır, diğer event'ler polling ile alınır.
 *
 * @param fixtureId — Maç ID'si
 * @returns Supabase Realtime filter string
 *
 * @example
 * const filter = createCriticalEventFilter('abc-123');
 * // Returns: "fixture_id=eq.abc-123"
 * // Client-side callback'ta event_type kontrolü yapılır
 */
export function createCriticalEventFilter(fixtureId: string): string {
  return `fixture_id=eq.${fixtureId}`;
}

/**
 * Bir event'in kritik olup olmadığını kontrol eder.
 * Client-side callback'te kullanılır: kritik olmayan event'ler yoksayılır.
 */
export function isCriticalMatchEvent(eventType: string): boolean {
  return (CRITICAL_MATCH_EVENTS as readonly string[]).includes(eventType);
}

// ─── RealtimeManager ────────────────────────────────────────────────────

class RealtimeManager {
  /** Channel name → RealtimeChannel instance */
  private channels: Map<string, RealtimeChannel> = new Map();

  /** Channel name → set of active subscriptions on that channel */
  private subscriptions: Map<string, Set<SubscriptionEntry>> = new Map();

  /** Monotonic counter for generating unique subscription IDs */
  private subIdCounter = 0;

  // ── Public API ──────────────────────────────────────────────────────

  /**
   * Subscribe to a `postgres_changes` event on a specific table.
   *
   * Reuses an existing channel if one is already open for the same
   * `channelName`. When the last subscriber unsubscribes the channel is
   * automatically torn down and removed from the Supabase client.
   *
   * @param channelName - A unique logical name for the channel. Two
   *   callers that pass the same `channelName` will share the same
   *   underlying WebSocket connection.
   * @param config - Postgres changes filter config.
   * @param callback - Function invoked when a matching change arrives.
   * @returns An `unsubscribe` function — call it to remove **this**
   *   subscription. If it was the last one the channel is closed.
   *
   * @example
   * const unsub = realtimeManager.subscribe(
   *   'match_events:42',
   *   { event: 'INSERT', schema: 'public', table: 'match_events', filter: 'fixture_id=eq.42' },
   *   (payload) => console.log(payload.new)
   * );
   * // Cleanup:
   * unsub();
   */
  subscribe(
    channelName: string,
    config: {
      event?: string;
      schema?: string;
      table: string;
      filter?: string;
    },
    callback: ChangeCallback
  ): () => void {
    // ── Guard: Supabase must be configured ──
    if (!isSupabaseConfigured()) {
      console.warn(
        `[RealtimeManager] Supabase is not configured — subscription to "${channelName}" ignored.`
      );
      return () => {};
    }

    const subId = `sub_${++this.subIdCounter}`;

    const fullConfig: PostgresChangesConfig = {
      event: config.event ?? '*',
      schema: config.schema ?? 'public',
      table: config.table,
      filter: config.filter,
    };

    // ── Get or create the channel ──
    let channel = this.channels.get(channelName);

    if (!channel) {
      try {
        const supabase = createBrowserClient();
        channel = supabase.channel(channelName);
        this.channels.set(channelName, channel);

        // Subscribe the channel to the WebSocket **once**.
        channel.subscribe((status, err) => {
          switch (status) {
            case 'SUBSCRIBED':
              console.log(
                `[RealtimeManager] Channel "${channelName}" subscribed`
              );
              break;
            case 'CHANNEL_ERROR':
              console.error(
                `[RealtimeManager] Channel "${channelName}" error:`,
                err
              );
              break;
            case 'TIMED_OUT':
              console.warn(
                `[RealtimeManager] Channel "${channelName}" timed out`
              );
              break;
            case 'CLOSED':
              console.log(
                `[RealtimeManager] Channel "${channelName}" closed`
              );
              break;
          }
        });
      } catch (err) {
        console.error(
          `[RealtimeManager] Failed to create channel "${channelName}":`,
          err
        );
        return () => {};
      }
    }

    // ── Attach the postgres_changes listener ──
    // Each subscription gets its own listener, but they share the channel
    // (and therefore share the underlying WebSocket connection).
    //
    // `channel.on()` returns the channel itself (for chaining), but we
    // need a way to remove just this listener later. Supabase-js does not
    // return a direct unsub function per `.on()` call, so we use a
    // wrapper: store the callback reference and call
    // `channel.off('postgres_changes', …)` if available, or fall back to
    // unsubscribing the whole channel when the last listener leaves.

    const channelRef = channel;

    // Attach the listener
    // Type assertion: supabase-js overloads for `on()` don't expose
    // 'postgres_changes' directly in their union, but it works at runtime.
    (channelRef as any).on(
      'postgres_changes',
      fullConfig,
      callback
    );

    // Track the subscription entry
    const entry: SubscriptionEntry = {
      id: subId,
      channelName,
      config: fullConfig,
      callback,
      // We don't have a per-listener unsub from supabase-js, so we store
      // a no-op placeholder. When a subscription is removed we fall back
      // to full channel teardown if it's the last one.
      unsubscribeListener: () => {},
    };

    if (!this.subscriptions.has(channelName)) {
      this.subscriptions.set(channelName, new Set());
    }
    this.subscriptions.get(channelName)!.add(entry);

    // ── Return unsubscribe function ──
    return () => {
      this.removeSubscription(entry, channelRef);
    };
  }

  /**
   * Number of active channels (one per unique `channelName`).
   * Useful for debugging / development dashboards.
   */
  get activeChannelCount(): number {
    return this.channels.size;
  }

  /**
   * Total number of individual subscriptions across all channels.
   * Useful for debugging / development dashboards.
   */
  get totalSubscriptions(): number {
    let count = 0;
    Array.from(this.subscriptions.values()).forEach((subs) => {
      count += subs.size;
    });
    return count;
  }

  /**
   * Get debug info about all active channels and their subscriptions.
   */
  getDebugInfo(): {
    channels: Array<{
      name: string;
      subscriptionCount: number;
      subscriptions: Array<{ id: string; config: PostgresChangesConfig }>;
    }>;
    totalChannels: number;
    totalSubscriptions: number;
  } {
    const channels = Array.from(this.channels.keys()).map((name) => {
      const subs = this.subscriptions.get(name) ?? new Set();
      return {
        name,
        subscriptionCount: subs.size,
        subscriptions: Array.from(subs).map((s) => ({
          id: s.id,
          config: s.config,
        })),
      };
    });

    return {
      channels,
      totalChannels: this.channels.size,
      totalSubscriptions: this.totalSubscriptions,
    };
  }

  /**
   * Unsubscribe all channels and clear all subscriptions.
   * Useful during logout or when the entire app is unmounting.
   */
  unsubscribeAll(): void {
    const supabase = isSupabaseConfigured() ? createBrowserClient() : null;

    Array.from(this.channels.entries()).forEach(([, channel]) => {
      channel.unsubscribe();
      if (supabase) supabase.removeChannel(channel);
    });

    this.channels.clear();
    this.subscriptions.clear();
    console.log('[RealtimeManager] All channels unsubscribed and removed');
  }

  // ── Private helpers ─────────────────────────────────────────────────

  /**
   * Remove a single subscription entry. If it was the last subscriber on
   * the channel, the channel is unsubscribed and removed from the
   * Supabase client entirely.
   */
  private removeSubscription(
    entry: SubscriptionEntry,
    channelRef: RealtimeChannel
  ): void {
    const { channelName } = entry;
    const subs = this.subscriptions.get(channelName);

    if (!subs) return;

    subs.delete(entry);

    if (subs.size === 0) {
      // No more subscribers — tear down the channel.
      this.subscriptions.delete(channelName);
      channelRef.unsubscribe();
      this.channels.delete(channelName);

      // Remove from Supabase client's internal channel registry so
      // it doesn't hold a stale reference.
      if (isSupabaseConfigured()) {
        try {
          const supabase = createBrowserClient();
          supabase.removeChannel(channelRef);
        } catch {
          // Client may already be disposed (e.g. during app teardown)
        }
      }

      console.log(
        `[RealtimeManager] Channel "${channelName}" removed (no subscribers left)`
      );
    }
  }
}

// ─── Singleton export ───────────────────────────────────────────────────

/**
 * Global singleton instance. Because this module is only imported on the
 * client side (`createBrowserClient` requires `window`), there is one
 * instance per browser tab — which is exactly what we want.
 */
export const realtimeManager = new RealtimeManager();
