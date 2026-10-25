CREATE TABLE IF NOT EXISTS veterinary_clinics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  address text,
  phone text,
  email text,
  website text,
  hours text,
  notes text,
  is_favorite boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE veterinary_clinics ENABLE ROW LEVEL SECURITY;
GRANT SELECT,INSERT,UPDATE,DELETE ON veterinary_clinics TO authenticated;
CREATE POLICY select_own_clinics ON veterinary_clinics FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY insert_own_clinics ON veterinary_clinics FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY update_own_clinics ON veterinary_clinics FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY delete_own_clinics ON veterinary_clinics FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE INDEX idx_veterinary_clinics_user_id ON veterinary_clinics(user_id);
