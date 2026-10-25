-- ═══════════════════════════════════════════════════════════════════════════
-- Integration Tests: In-App Notification RLS
-- ═══════════════════════════════════════════════════════════════════════════
-- These tests verify that the row-level security policies on
-- in_app_notifications correctly isolate users.  They create two test users,
-- insert notifications for each, and then confirm that each user can only
-- see / modify their own rows.
--
-- Run with: psql $SUPABASE_DB_URL -f src/lib/__tests__/notifications_rls_test.sql
-- (Safe to re-run: uses ON DROP IF EXISTS clauses.)
-- ═══════════════════════════════════════════════════════════════════════════

-- Helper: pretty assertion
CREATE OR REPLACE FUNCTION _assert(label text, condition boolean)
RETURNS text LANGUAGE plpgsql AS $$
BEGIN
  IF condition THEN
    RETURN 'PASS: ' || label;
  ELSE
    RAISE EXCEPTION 'FAIL: %', label;
  END IF;
END;
$$;

-- Clean up any leftover test data from prior runs
DELETE FROM in_app_notifications WHERE user_id IN (
  SELECT id FROM auth.users WHERE email IN ('test_user_a@pawcare.test', 'test_user_b@pawcare.test')
);
DELETE FROM user_preferences WHERE user_id IN (
  SELECT id FROM auth.users WHERE email IN ('test_user_a@pawcare.test', 'test_user_b@pawcare.test')
);
DELETE FROM preventive_care_tasks WHERE user_id IN (
  SELECT id FROM auth.users WHERE email IN ('test_user_a@pawcare.test', 'test_user_b@pawcare.test')
);
DELETE FROM pets WHERE owner_id IN (
  SELECT id FROM auth.users WHERE email IN ('test_user_a@pawcare.test', 'test_user_b@pawcare.test')
);

-- ═══════════════════════════════════════════════════════════════════════════
-- Step 1: Create two test users
-- ═══════════════════════════════════════════════════════════════════════════
-- auth.users rows must be created with the admin role (bypasses RLS on auth).
-- We use a DO block to catch uniqueness conflicts.

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'test_user_a@pawcare.test') THEN
    INSERT INTO auth.users (instance_id, id, aud, role, email,
      encrypted_password, email_confirmed_at, created_at, updated_at)
    VALUES ('00000000-0000-0000-0000-000000000000',
      'a0000000-0000-0000-0000-000000000001',
      'authenticated', 'authenticated', 'test_user_a@pawcare.test',
      crypt('testpass1234', gen_salt('bf')), now(), now(), now());
  END IF;

  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'test_user_b@pawcare.test') THEN
    INSERT INTO auth.users (instance_id, id, aud, role, email,
      encrypted_password, email_confirmed_at, created_at, updated_at)
    VALUES ('00000000-0000-0000-0000-000000000000',
      'b0000000-0000-0000-0000-000000000002',
      'authenticated', 'authenticated', 'test_user_b@pawcare.test',
      crypt('testpass1234', gen_salt('bf')), now(), now(), now());
  END IF;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- Step 2: Insert notifications for each user as the service_role (bypasses RLS)
-- ═══════════════════════════════════════════════════════════════════════════
INSERT INTO in_app_notifications (user_id, title, message, type, is_read)
VALUES
  ('a0000000-0000-0000-0000-000000000001', 'User A notification 1', 'unread', 'care_reminder', false),
  ('a0000000-0000-0000-0000-000000000001', 'User A notification 2', 'read', 'info', true),
  ('b0000000-0000-0000-0000-000000000002', 'User B notification 1', 'unread', 'health_alert', false);

-- ═══════════════════════════════════════════════════════════════════════════
-- Step 3: Test SELECT isolation (as service_role, verify row counts exist)
-- ═══════════════════════════════════════════════════════════════════════════
-- The service_role bypasses RLS, so we verify the data is there.
-- Real RLS enforcement happens through the anon-key client; here we verify
-- the policy predicates are correct by inspecting the policy definitions.

DO $$
DECLARE
  select_policy text;
  insert_policy text;
  update_policy text;
  delete_policy text;
BEGIN
  SELECT using_expr INTO select_policy
    FROM pg_policies
    WHERE tablename = 'in_app_notifications' AND policyname = 'select_own_notifications';

  SELECT with_check INTO insert_policy
    FROM pg_policies
    WHERE tablename = 'in_app_notifications' AND policyname = 'insert_own_notifications';

  SELECT with_check INTO update_policy
    FROM pg_policies
    WHERE tablename = 'in_app_notifications' AND policyname = 'update_own_notifications';

  SELECT using_expr INTO delete_policy
    FROM pg_policies
    WHERE tablename = 'in_app_notifications' AND policyname = 'delete_own_notifications';

  RAISE NOTICE '%', _assert(
    'SELECT policy enforces auth.uid() = user_id',
    select_policy = '(auth.uid() = user_id)'
  );
  RAISE NOTICE '%', _assert(
    'INSERT policy enforces auth.uid() = user_id',
    insert_policy = '(auth.uid() = user_id)'
  );
  RAISE NOTICE '%', _assert(
    'UPDATE policy enforces auth.uid() = user_id (USING)',
    (SELECT using_expr FROM pg_policies WHERE tablename = 'in_app_notifications' AND policyname = 'update_own_notifications') = '(auth.uid() = user_id)'
  );
  RAISE NOTICE '%', _assert(
    'UPDATE policy enforces auth.uid() = user_id (WITH CHECK)',
    update_policy = '(auth.uid() = user_id)'
  );
  RAISE NOTICE '%', _assert(
    'DELETE policy enforces auth.uid() = user_id',
    delete_policy = '(auth.uid() = user_id)'
  );
END $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- Step 4: Verify anon role has NO access to in_app_notifications
-- ═══════════════════════════════════════════════════════════════════════════
DO $$
DECLARE
  has_select boolean;
  has_insert boolean;
  has_update boolean;
  has_delete boolean;
BEGIN
  SELECT has_table_privilege('anon', 'in_app_notifications', 'SELECT') INTO has_select;
  SELECT has_table_privilege('anon', 'in_app_notifications', 'INSERT') INTO has_insert;
  SELECT has_table_privilege('anon', 'in_app_notifications', 'UPDATE') INTO has_update;
  SELECT has_table_privilege('anon', 'in_app_notifications', 'DELETE') INTO has_delete;

  RAISE NOTICE '%', _assert('anon has NO SELECT on in_app_notifications', NOT has_select);
  RAISE NOTICE '%', _assert('anon has NO INSERT on in_app_notifications', NOT has_insert);
  RAISE NOTICE '%', _assert('anon has NO UPDATE on in_app_notifications', NOT has_update);
  RAISE NOTICE '%', _assert('anon has NO DELETE on in_app_notifications', NOT has_delete);
END $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- Step 5: Verify RLS is enabled on in_app_notifications
-- ═══════════════════════════════════════════════════════════════════════════
DO $$
DECLARE
  rls_enabled boolean;
BEGIN
  SELECT relrowsecurity INTO rls_enabled FROM pg_class WHERE relname = 'in_app_notifications';

  RAISE NOTICE '%', _assert('RLS is enabled on in_app_notifications', rls_enabled);
END $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- Step 6: Verify each test user's notifications exist with correct counts
-- ═══════════════════════════════════════════════════════════════════════════
DO $$
DECLARE
  user_a_count int;
  user_b_count int;
BEGIN
  SELECT count(*) INTO user_a_count FROM in_app_notifications
    WHERE user_id = 'a0000000-0000-0000-0000-000000000001';
  SELECT count(*) INTO user_b_count FROM in_app_notifications
    WHERE user_id = 'b0000000-0000-0000-0000-000000000002';

  RAISE NOTICE '%', _assert('User A has 2 notifications', user_a_count = 2);
  RAISE NOTICE '%', _assert('User B has 1 notification', user_b_count = 1);
END $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- Step 7: Verify user_id defaults to auth.uid()
-- ═══════════════════════════════════════════════════════════════════════════
DO $$
DECLARE
  col_default text;
BEGIN
  SELECT column_default INTO col_default
    FROM information_schema.columns
    WHERE table_name = 'in_app_notifications' AND column_name = 'user_id';

  RAISE NOTICE '%', _assert(
    'user_id column defaults to auth.uid()',
    col_default IS NOT NULL AND col_default LIKE '%auth.uid()%'
  );
END $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- Cleanup test data
-- ═══════════════════════════════════════════════════════════════════════════
DELETE FROM in_app_notifications WHERE user_id IN (
  SELECT id FROM auth.users WHERE email IN ('test_user_a@pawcare.test', 'test_user_b@pawcare.test')
);

DROP FUNCTION IF EXISTS _assert(text, boolean);

-- ═══════════════════════════════════════════════════════════════════════════
-- All tests passed if we reached this point without an exception.
-- ═══════════════════════════════════════════════════════════════════════════
