/*
# Create pets table (single-tenant, no auth)

1. New Tables
- `pets`
- `id` (uuid, primary key)
- `name` (text, not null) — pet's name
- `species` (text, not null) — 'dog' or 'cat'
- `breed` (text, nullable) — breed of the pet
- `gender` (text, nullable) — 'male', 'female', or 'unknown'
- `birth_date` (date, nullable) — date of birth
- `weight_kg` (numeric, nullable) — weight in kilograms
- `microchip_id` (text, nullable) — microchip identifier
- `is_neutered` (boolean, default false) — whether the pet is spayed/neutered
- `color` (text, nullable) — coat color
- `photo_url` (text, nullable) — optional photo URL
- `notes` (text, nullable) — free-form notes about the pet
- `created_at` (timestamptz, default now())
- `updated_at` (timestamptz, default now())

2. Security
- Enable RLS on `pets`.
- Grant CRUD to `anon` + `authenticated` so the Data API can reach the table.
- Allow anon + authenticated full CRUD because the data is intentionally shared/public (no auth in this phase).
- When authentication is added later, these policies will be replaced with owner-scoped ones.
*/

CREATE TABLE IF NOT EXISTS pets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  species text NOT NULL CHECK (species IN ('dog', 'cat')),
  breed text,
  gender text CHECK (gender IN ('male', 'female', 'unknown')),
  birth_date date,
  weight_kg numeric CHECK (weight_kg > 0),
  microchip_id text,
  is_neutered boolean NOT NULL DEFAULT false,
  color text,
  photo_url text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE pets ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON pets TO anon, authenticated;

DROP POLICY IF EXISTS "anon_select_pets" ON pets;
CREATE POLICY "anon_select_pets" ON pets FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_pets" ON pets;
CREATE POLICY "anon_insert_pets" ON pets FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_pets" ON pets;
CREATE POLICY "anon_update_pets" ON pets FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_pets" ON pets;
CREATE POLICY "anon_delete_pets" ON pets FOR DELETE
  TO anon, authenticated USING (true);
