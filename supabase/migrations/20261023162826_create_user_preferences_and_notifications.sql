/*
# Create user_preferences and in_app_notifications tables

## Summary
Adds two new tables for persisting per-user notification settings and in-app
notification records. Both are owner-scoped with RLS policies.

## New Tables
### 1. user_preferences
- id, user_id (DEFAULT auth.uid()), display_name, email_alerts, in_app_notifications, weekly_summary, timestamps

### 2. in_app_notifications
- id, user_id (DEFAULT auth.uid()), title, message, type, is_read, related_pet_id, created_at

## Security
- RLS enabled on both. Only authenticated role. Owner-scoped via auth.uid() = user_id.
- anon has no access.
*/

CREATE TABLE IF NOT EXISTS user_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text,
  email_alerts boolean NOT NULL DEFAULT false,
  in_app_notifications boolean NOT NULL DEFAULT true,
  weekly_summary boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON user_preferences TO authenticated;

DROP POLICY IF EXISTS "select_own_preferences" ON user_preferences;
CREATE POLICY "select_own_preferences" ON user_preferences FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_preferences" ON user_preferences;
CREATE POLICY "insert_own_preferences" ON user_preferences FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_preferences" ON user_preferences;
CREATE POLICY "update_own_preferences" ON user_preferences FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_preferences" ON user_preferences;
CREATE POLICY "delete_own_preferences" ON user_preferences FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS in_app_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL DEFAULT 'info' CHECK (type IN ('care_reminder', 'health_alert', 'system', 'info')),
  is_read boolean NOT NULL DEFAULT false,
  related_pet_id uuid REFERENCES pets(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE in_app_notifications ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON in_app_notifications TO authenticated;

DROP POLICY IF EXISTS "select_own_notifications" ON in_app_notifications;
CREATE POLICY "select_own_notifications" ON in_app_notifications FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_notifications" ON in_app_notifications;
CREATE POLICY "insert_own_notifications" ON in_app_notifications FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_notifications" ON in_app_notifications;
CREATE POLICY "update_own_notifications" ON in_app_notifications FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_notifications" ON in_app_notifications;
CREATE POLICY "delete_own_notifications" ON in_app_notifications FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_in_app_notifications_user_id ON in_app_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_in_app_notifications_is_read ON in_app_notifications(user_id, is_read);
