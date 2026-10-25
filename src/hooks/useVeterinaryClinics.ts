import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { type VeterinaryClinic, type VeterinaryClinicFormData } from '@/types';

export function useVeterinaryClinics() {
  const { user } = useAuth();
  const [clinics, setClinics] = useState<VeterinaryClinic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchClinics = useCallback(async () => {
    if (!user) {
      setClinics([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    const { data, error: fetchError } = await supabase
      .from('veterinary_clinics')
      .select('*')
      .order('is_favorite', { ascending: false })
      .order('created_at', { ascending: false });

    if (fetchError) {
      if (fetchError.message?.includes('relation') || fetchError.message?.includes('does not exist') || fetchError.code === '42P01') {
        setClinics([]);
        setError('');
      } else {
        setError(fetchError.message);
      }
    } else {
      setClinics((data as VeterinaryClinic[]) ?? []);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchClinics();
  }, [fetchClinics]);

  const addClinic = useCallback(
    async (formData: VeterinaryClinicFormData): Promise<{ error: string | null }> => {
      if (!user) return { error: 'You must be signed in.' };

      try {
        const { data, error: insertError } = await supabase
          .from('veterinary_clinics')
          .insert({
            name: formData.name.trim(),
            address: formData.address.trim() || null,
            phone: formData.phone.trim() || null,
            email: formData.email.trim() || null,
            website: formData.website.trim() || null,
            hours: formData.hours.trim() || null,
            notes: formData.notes.trim() || null,
            is_favorite: formData.is_favorite,
          })
          .select()
          .maybeSingle();

        if (insertError) {
          if (insertError.message?.includes('relation') || insertError.message?.includes('does not exist')) {
            return { error: 'Veterinary clinics table not found. Please run the database migrations.' };
          }
          return { error: insertError.message };
        }

        if (data) {
          setClinics((prev) => [data as VeterinaryClinic, ...prev]);
        }

        return { error: null };
      } catch (err) {
        return { error: err instanceof Error ? err.message : 'Failed to add clinic' };
      }
    },
    [user]
  );

  const toggleFavorite = useCallback(
    async (clinicId: string, isFavorite: boolean): Promise<{ error: string | null }> => {
      const { error: updateError } = await supabase
        .from('veterinary_clinics')
        .update({ is_favorite: !isFavorite, updated_at: new Date().toISOString() })
        .eq('id', clinicId);

      if (updateError) return { error: updateError.message };

      setClinics((prev) =>
        prev.map((c) => (c.id === clinicId ? { ...c, is_favorite: !isFavorite } : c))
      );
      return { error: null };
    },
    []
  );

  const deleteClinic = useCallback(
    async (clinicId: string): Promise<{ error: string | null }> => {
      const { error: deleteError } = await supabase
        .from('veterinary_clinics')
        .delete()
        .eq('id', clinicId);

      if (deleteError) return { error: deleteError.message };

      setClinics((prev) => prev.filter((c) => c.id !== clinicId));
      return { error: null };
    },
    []
  );

  return {
    clinics,
    loading,
    error,
    fetchClinics,
    addClinic,
    toggleFavorite,
    deleteClinic,
  };
}
