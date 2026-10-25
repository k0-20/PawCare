CREATE TABLE IF NOT EXISTS medical_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id uuid NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  record_type text NOT NULL DEFAULT 'vet_visit' CHECK (record_type IN ('vet_visit','vaccination','prescription','lab_result','surgery','other')),
  title text NOT NULL,
  visit_date date NOT NULL,
  veterinarian text,
  clinic_name text,
  diagnosis text,
  treatment text,
  prescription text,
  notes text,
  attachments jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE medical_records ENABLE ROW LEVEL SECURITY;
GRANT SELECT,INSERT,UPDATE,DELETE ON medical_records TO authenticated;
DROP POLICY IF EXISTS select_own_medical_records ON medical_records;
DROP POLICY IF EXISTS insert_own_medical_records ON medical_records;
DROP POLICY IF EXISTS update_own_medical_records ON medical_records;
DROP POLICY IF EXISTS delete_own_medical_records ON medical_records;
CREATE POLICY select_own_medical_records ON medical_records FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY insert_own_medical_records ON medical_records FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY update_own_medical_records ON medical_records FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY delete_own_medical_records ON medical_records FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_medical_records_pet_id ON medical_records(pet_id);
CREATE INDEX IF NOT EXISTS idx_medical_records_user_id ON medical_records(user_id);
CREATE INDEX IF NOT EXISTS idx_medical_records_visit_date ON medical_records(visit_date);

NOTIFY pgrst, 'reload schema';
