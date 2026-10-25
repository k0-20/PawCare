/*
# Create preventive_care_tasks table

## Summary
Adds a table for tracking preventive care tasks (vaccinations, deworming,
checkups, dental cleanings) per pet with due dates and completion status.
This is the real data source that the notification system uses to generate
care-gap and overdue notifications.

## New Table
### preventive_care_tasks
- `id` (uuid, PK)
- `pet_id` (uuid, NOT NULL, FK to pets ON DELETE CASCADE)
- `user_id` (uuid, NOT NULL, DEFAULT auth.uid(), FK to auth.users ON DELETE CASCADE)
- `task_type` (text: 'vaccination' | 'deworming' | 'checkup' | 'dental' | 'other')
- `title` (text, NOT NULL) — e.g. "Rabies booster", "Annual wellness exam"
- `due_date` (date, NOT NULL) — when the task is due
- `completed_date` (date, nullable) — when it was completed
- `status` (text: 'pending' | 'completed' | 'overdue', default 'pending')
- `source` (text: 'vet_recommended' | 'owner_set', default 'owner_set')
- `notes` (text, nullable)
- `created_at`, `updated_at` (timestamptz)

## Security
- RLS enabled. Only `authenticated` role (no `anon`).
- Owner-scoped via `auth.uid() = user_id`.
- `user_id` defaults to `auth.uid()` so inserts from the client work without
  explicitly passing it.
- Four separate policies (SELECT/INSERT/UPDATE/DELETE).
*/

CREATE TABLE IF NOT EXISTS preventive_care_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id uuid NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  task_type text NOT NULL DEFAULT 'other' CHECK (task_type IN ('vaccination', 'deworming', 'checkup', 'dental', 'other')),
  title text NOT NULL,
  due_date date NOT NULL,
  completed_date date,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'overdue')),
  source text NOT NULL DEFAULT 'owner_set' CHECK (source IN ('vet_recommended', 'owner_set')),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE preventive_care_tasks ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON preventive_care_tasks TO authenticated;

DROP POLICY IF EXISTS "select_own_care_tasks" ON preventive_care_tasks;
CREATE POLICY "select_own_care_tasks" ON preventive_care_tasks FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_care_tasks" ON preventive_care_tasks;
CREATE POLICY "insert_own_care_tasks" ON preventive_care_tasks FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_care_tasks" ON preventive_care_tasks;
CREATE POLICY "update_own_care_tasks" ON preventive_care_tasks FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_care_tasks" ON preventive_care_tasks;
CREATE POLICY "delete_own_care_tasks" ON preventive_care_tasks FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_preventive_care_pet_id ON preventive_care_tasks(pet_id);
CREATE INDEX IF NOT EXISTS idx_preventive_care_user_id ON preventive_care_tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_preventive_care_due_date ON preventive_care_tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_preventive_care_status ON preventive_care_tasks(status);
