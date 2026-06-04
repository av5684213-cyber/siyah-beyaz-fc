-- ═══════════════════════════════════════════════════════════════════════════
-- BUG-14: Notification Categories — Add category columns to notification_preferences
-- Date: 2026-06-06
-- Description: Adds granular notification preference toggles so users can
--              control which types of notifications they receive.
-- ═══════════════════════════════════════════════════════════════════════════

-- Goal alert notifications (goals scored during matches)
ALTER TABLE notification_preferences ADD COLUMN IF NOT EXISTS goal_alert BOOLEAN DEFAULT TRUE;

-- Match result notifications (final score when match ends)
ALTER TABLE notification_preferences ADD COLUMN IF NOT EXISTS match_result BOOLEAN DEFAULT TRUE;

-- Transfer offer notifications (incoming transfer offers)
ALTER TABLE notification_preferences ADD COLUMN IF NOT EXISTS transfer_offer BOOLEAN DEFAULT TRUE;

-- Daily task reminder notifications
ALTER TABLE notification_preferences ADD COLUMN IF NOT EXISTS daily_task_reminder BOOLEAN DEFAULT TRUE;

-- Weekly report notifications (weekly summary)
ALTER TABLE notification_preferences ADD COLUMN IF NOT EXISTS weekly_report BOOLEAN DEFAULT TRUE;

-- Injury update notifications (player injuries and recoveries)
ALTER TABLE notification_preferences ADD COLUMN IF NOT EXISTS injury_update BOOLEAN DEFAULT TRUE;

-- Youth academy notifications (youth intake, graduations)
ALTER TABLE notification_preferences ADD COLUMN IF NOT EXISTS youth_academy BOOLEAN DEFAULT TRUE;

-- Add index for faster preference lookups
CREATE INDEX IF NOT EXISTS idx_notif_prefs_profile_id ON notification_preferences(profile_id);
