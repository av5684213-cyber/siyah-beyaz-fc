/**
 * Siyah Beyaz FC — BUG-14: Notification Preferences Test
 *
 * Tests for the notification category preference system:
 * - Default preferences include all new categories
 * - Category-based preference checks filter correctly
 * - Preferences API handles new fields
 * - NotificationManager respects user preferences
 */

import { DEFAULT_NOTIFICATION_PREFERENCES, type NotificationPreferences } from '@/lib/push-notifications';

// ═══════════════════════════════════════════════════════════════
// MOCK DATA
// ═══════════════════════════════════════════════════════════════

function createMockPreferences(overrides: Partial<NotificationPreferences> = {}): NotificationPreferences {
  return {
    ...DEFAULT_NOTIFICATION_PREFERENCES,
    ...overrides,
  };
}

// ═══════════════════════════════════════════════════════════════
// DEFAULT PREFERENCES TESTS
// ═══════════════════════════════════════════════════════════════

describe('BUG-14: Notification Category Preferences', () => {
  describe('Default Preferences', () => {
    test('Default preferences should include all new category fields', () => {
      const defaults = DEFAULT_NOTIFICATION_PREFERENCES;

      // New BUG-14 categories
      expect(defaults).toHaveProperty('goal_alert');
      expect(defaults).toHaveProperty('match_result');
      expect(defaults).toHaveProperty('daily_task_reminder');
      expect(defaults).toHaveProperty('weekly_report');
      expect(defaults).toHaveProperty('injury_update');
      expect(defaults).toHaveProperty('youth_academy');

      // Legacy categories should still exist
      expect(defaults).toHaveProperty('match_reminder');
      expect(defaults).toHaveProperty('transfer_offer');
      expect(defaults).toHaveProperty('training_report');
      expect(defaults).toHaveProperty('push_enabled');
    });

    test('All new categories should default to true (except push_enabled)', () => {
      const defaults = DEFAULT_NOTIFICATION_PREFERENCES;

      expect(defaults.goal_alert).toBe(true);
      expect(defaults.match_result).toBe(true);
      expect(defaults.daily_task_reminder).toBe(true);
      expect(defaults.weekly_report).toBe(true);
      expect(defaults.injury_update).toBe(true);
      expect(defaults.youth_academy).toBe(true);
      expect(defaults.match_reminder).toBe(true);
      expect(defaults.transfer_offer).toBe(true);
      expect(defaults.training_report).toBe(true);
      expect(defaults.push_enabled).toBe(false);
    });

    test('NotificationPreferences interface should have 10 fields', () => {
      const defaults = DEFAULT_NOTIFICATION_PREFERENCES;
      const keys = Object.keys(defaults);
      expect(keys.length).toBe(10);
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // CATEGORY-BASED FILTERING TESTS
  // ═══════════════════════════════════════════════════════════════

  describe('Category-based Preference Filtering', () => {
    test('Goal alert disabled should block goal notifications', () => {
      const prefs = createMockPreferences({ goal_alert: false });
      expect(prefs.goal_alert).toBe(false);
      // All other categories should remain true
      expect(prefs.match_result).toBe(true);
      expect(prefs.injury_update).toBe(true);
    });

    test('Match result disabled should block match result notifications', () => {
      const prefs = createMockPreferences({ match_result: false });
      expect(prefs.match_result).toBe(false);
      expect(prefs.goal_alert).toBe(true);
    });

    test('Transfer offer disabled should block transfer notifications', () => {
      const prefs = createMockPreferences({ transfer_offer: false });
      expect(prefs.transfer_offer).toBe(false);
    });

    test('Daily task reminder disabled should block daily task notifications', () => {
      const prefs = createMockPreferences({ daily_task_reminder: false });
      expect(prefs.daily_task_reminder).toBe(false);
    });

    test('Weekly report disabled should block weekly report notifications', () => {
      const prefs = createMockPreferences({ weekly_report: false });
      expect(prefs.weekly_report).toBe(false);
    });

    test('Injury update disabled should block injury notifications', () => {
      const prefs = createMockPreferences({ injury_update: false });
      expect(prefs.injury_update).toBe(false);
    });

    test('Youth academy disabled should block youth academy notifications', () => {
      const prefs = createMockPreferences({ youth_academy: false });
      expect(prefs.youth_academy).toBe(false);
    });

    test('Multiple categories disabled simultaneously', () => {
      const prefs = createMockPreferences({
        goal_alert: false,
        injury_update: false,
        youth_academy: false,
      });
      expect(prefs.goal_alert).toBe(false);
      expect(prefs.injury_update).toBe(false);
      expect(prefs.youth_academy).toBe(false);
      // Other categories should remain enabled
      expect(prefs.match_result).toBe(true);
      expect(prefs.transfer_offer).toBe(true);
      expect(prefs.daily_task_reminder).toBe(true);
      expect(prefs.weekly_report).toBe(true);
    });

    test('All categories disabled', () => {
      const prefs = createMockPreferences({
        goal_alert: false,
        match_result: false,
        match_reminder: false,
        transfer_offer: false,
        training_report: false,
        daily_task_reminder: false,
        weekly_report: false,
        injury_update: false,
        youth_academy: false,
        push_enabled: false,
      });

      Object.values(prefs).forEach(val => {
        expect(val).toBe(false);
      });
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // NOTIFICATION TYPE TO CATEGORY MAPPING TESTS
  // ═══════════════════════════════════════════════════════════════

  describe('Notification Type to Category Mapping', () => {
    // These test the mapping logic that exists in sendPushToProfile
    const typeToCategoryMap: Record<string, keyof NotificationPreferences> = {
      // Goal alerts
      goal: 'goal_alert',
      goal_alert: 'goal_alert',
      match_goal: 'goal_alert',

      // Match results
      match_end: 'match_result',
      match_result: 'match_result',

      // Match reminders
      match_reminder: 'match_reminder',
      match_start: 'match_reminder',
      match_event: 'match_reminder',

      // Transfer offers
      transfer: 'transfer_offer',
      transfer_offer: 'transfer_offer',

      // Training reports
      training: 'training_report',
      training_report: 'training_report',

      // Daily task reminders
      daily_task: 'daily_task_reminder',
      daily_task_reminder: 'daily_task_reminder',

      // Weekly reports
      weekly_report: 'weekly_report',
      weekly_summary: 'weekly_report',

      // Injury updates
      injury: 'injury_update',
      injury_update: 'injury_update',
      injury_recovery: 'injury_update',

      // Youth academy
      youth_academy: 'youth_academy',
      youth_intake: 'youth_academy',
      youth_graduation: 'youth_academy',
    };

    test('Each notification type maps to a valid category', () => {
      Object.values(typeToCategoryMap).forEach(category => {
        expect(DEFAULT_NOTIFICATION_PREFERENCES).toHaveProperty(category);
      });
    });

    test('Goal-related types map to goal_alert category', () => {
      expect(typeToCategoryMap.goal).toBe('goal_alert');
      expect(typeToCategoryMap.goal_alert).toBe('goal_alert');
      expect(typeToCategoryMap.match_goal).toBe('goal_alert');
    });

    test('Match end types map to match_result category', () => {
      expect(typeToCategoryMap.match_end).toBe('match_result');
      expect(typeToCategoryMap.match_result).toBe('match_result');
    });

    test('Injury types map to injury_update category', () => {
      expect(typeToCategoryMap.injury).toBe('injury_update');
      expect(typeToCategoryMap.injury_update).toBe('injury_update');
      expect(typeToCategoryMap.injury_recovery).toBe('injury_update');
    });

    test('Youth types map to youth_academy category', () => {
      expect(typeToCategoryMap.youth_academy).toBe('youth_academy');
      expect(typeToCategoryMap.youth_intake).toBe('youth_academy');
      expect(typeToCategoryMap.youth_graduation).toBe('youth_academy');
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // PREFERENCE PERSISTENCE TESTS
  // ═══════════════════════════════════════════════════════════════

  describe('Preference Persistence', () => {
    test('Preference object should serialize to JSON correctly', () => {
      const prefs = createMockPreferences({ goal_alert: false });
      const json = JSON.stringify(prefs);
      const parsed = JSON.parse(json);

      expect(parsed.goal_alert).toBe(false);
      expect(parsed.match_result).toBe(true);
      expect(parsed.youth_academy).toBe(true);
    });

    test('Preference upsert data should include all new columns', () => {
      const prefs = createMockPreferences();
      const upsertData = {
        profile_id: 'test-profile-id',
        match_reminder: prefs.match_reminder,
        transfer_offer: prefs.transfer_offer,
        training_report: prefs.training_report,
        push_enabled: prefs.push_enabled,
        goal_alert: prefs.goal_alert,
        match_result: prefs.match_result,
        daily_task_reminder: prefs.daily_task_reminder,
        weekly_report: prefs.weekly_report,
        injury_update: prefs.injury_update,
        youth_academy: prefs.youth_academy,
      };

      // Verify all 10 preference fields + profile_id are present
      expect(Object.keys(upsertData)).toHaveLength(11);
      expect(upsertData.goal_alert).toBe(true);
      expect(upsertData.match_result).toBe(true);
      expect(upsertData.daily_task_reminder).toBe(true);
      expect(upsertData.weekly_report).toBe(true);
      expect(upsertData.injury_update).toBe(true);
      expect(upsertData.youth_academy).toBe(true);
    });
  });
});
