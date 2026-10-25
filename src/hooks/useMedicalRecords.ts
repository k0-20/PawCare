import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { type MedicalRecord, type MedicalRecordFormData } from '@/types';

function isMedicalRecordsTableMissing(error: { code?: string; message?: string }): boolean {
  return (
    error.code === '42P01' ||
    error.code === 'PGRST205' ||
    error.message?.includes('relation "medical_records" does not exist') === true
  );
}

export function useMedicalRecords() {
  const { user } = useAuth();
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchRecords = useCallback(async () => {
    if (!user) {
      setRecords([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    const { data, error: fetchError } = await supabase
      .from('medical_records')
      .select('*')
      .order('visit_date', { ascending: false });

    if (fetchError) {
      // If table doesn't exist yet, treat as empty state instead of error
      if (isMedicalRecordsTableMissing(fetchError)) {
        setRecords([]);
        setError('');
      } else {
        setError(fetchError.message);
      }
    } else {
      setRecords((data as MedicalRecord[]) ?? []);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const addRecord = useCallback(
    async (formData: MedicalRecordFormData): Promise<{ error: string | null }> => {
      if (!user) return { error: 'You must be signed in.' };

      try {
        const { data, error: insertError } = await supabase
          .from('medical_records')
          .insert({
            pet_id: formData.pet_id,
            record_type: formData.record_type,
            title: formData.title.trim(),
            visit_date: formData.visit_date,
            veterinarian: formData.veterinarian.trim() || null,
            clinic_name: formData.clinic_name.trim() || null,
            diagnosis: formData.diagnosis.trim() || null,
            treatment: formData.treatment.trim() || null,
            prescription: formData.prescription.trim() || null,
            notes: formData.notes.trim() || null,
            attachments: [],
          })
          .select()
          .maybeSingle();

        if (insertError) {
          if (isMedicalRecordsTableMissing(insertError)) {
            return {
              error:
                'Medical records table is unavailable in the connected Supabase project. Apply supabase/migrations/20261023170000_create_medical_records_table.sql, then refresh the Supabase schema cache.',
            };
          }
          return { error: insertError.message };
        }

        if (data) {
          setRecords((prev) => [data as MedicalRecord, ...prev]);
        }

        return { error: null };
      } catch (err) {
        return { error: err instanceof Error ? err.message : 'Failed to add record' };
      }
    },
    [user]
  );

  const deleteRecord = useCallback(
    async (recordId: string): Promise<{ error: string | null }> => {
      const { error: deleteError } = await supabase
        .from('medical_records')
        .delete()
        .eq('id', recordId);

      if (deleteError) return { error: deleteError.message };

      setRecords((prev) => prev.filter((r) => r.id !== recordId));
      return { error: null };
    },
    []
  );

  return {
    records,
    loading,
    error,
    fetchRecords,
    addRecord,
    deleteRecord,
  };
}
