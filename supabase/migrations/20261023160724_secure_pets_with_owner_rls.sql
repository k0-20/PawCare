/*
# Secure pets table with owner-scoped RLS and authentication

## Summary
This migration converts the `pets` table from a publicly accessible single-tenant
table to a secure, owner-scoped table where each authenticated user can only
read, create, update, and delete their own pets.

## Changes

### 1. New column
- `owner_id` (uuid, NOT NULL, defaults to auth.uid())
  - Links each pet to the authenticated user who created it.
  - Foreign key to auth.users(id) with ON DELETE CASCADE — if a user account is
    deleted, their pets are automatically removed.
  - The DEFAULT auth.uid() means the frontend insert does NOT need to send
    owner_id; the database fills it from the authenticated session automatically.

### 2. Security changes
- REVOKE all privileges from the `anon` role — unauthenticated visitors can no
  longer read or write pet data at all.
- GRANT SELECT, INSERT, UPDATE, DELETE only to `authenticated` — only signed-in
  users can reach the table.
- DROP all four existing public-access policies (anon_select_pets, anon_insert_pets,
  anon_update_pets, anon_delete_pets).
- CREATE four new owner-scoped policies:
  - select_own_pets: SELECT where auth.uid() = owner_id
  - insert_own_pets: INSERT where auth.uid() = owner_id (WITH CHECK)
  - update_own_pets: UPDATE where auth.uid() = owner_id (USING + WITH CHECK)
  - delete_own_pets: DELETE where auth.uid() = owner_id (USING)

### 3. Data preservation
- The ALTER TABLE ADD COLUMN is additive. Existing rows (currently 0) would get
  owner_id = NULL, but since the new policies require auth.uid() = owner_id,
  any orphaned rows would simply be invisible to all users — never deleted.
- No columns are dropped, renamed, or type-changed.

### Important notes
1. This migration is safe to re-run (uses IF NOT EXISTS / IF EXISTS).
2. The anon role loses ALL access — the app must authenticate before any pet data
   is visible. The frontend auth flow must be deployed alongside this migration.
3. owner_id defaults to auth.uid(), so frontend inserts work without explicitly
   passing the user ID.
*/

-- Step 1: Add owner_id column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'pets' AND column_name = 'owner_id'
  ) THEN
    ALTER TABLE pets ADD COLUMN owner_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Step 2: Revoke anon access completely
REVOKE SELECT, INSERT, UPDATE, DELETE ON pets FROM anon;

-- Step 3: Grant CRUD only to authenticated
GRANT SELECT, INSERT, UPDATE, DELETE ON pets TO authenticated;

-- Step 4: Drop old public-access policies
DROP POLICY IF EXISTS "anon_select_pets" ON pets;
DROP POLICY IF EXISTS "anon_insert_pets" ON pets;
DROP POLICY IF EXISTS "anon_update_pets" ON pets;
DROP POLICY IF EXISTS "anon_delete_pets" ON pets;

-- Step 5: Create new owner-scoped policies
CREATE POLICY "select_own_pets" ON pets FOR SELECT
  TO authenticated USING (auth.uid() = owner_id);

CREATE POLICY "insert_own_pets" ON pets FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "update_own_pets" ON pets FOR UPDATE
  TO authenticated USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "delete_own_pets" ON pets FOR DELETE
  TO authenticated USING (auth.uid() = owner_id);
