import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { type UserPreferences } from '@/types';

const defaultPreferences: UserPreferences = {
  id: '',
  user_id: '',
  display_name: null,
  email_alerts: false,
  in_app_notifications: true,
  weekly_summary: false,
  created_at: '',
  updated_at: '',
};

export function useUserPreferences() {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const fetchPreferences = useCallback(async () => {
    if (!user) {
      setPreferences(defaultPreferences);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    const { data, error: fetchError } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (fetchError) {
      setError(fetchError.message);
    } else if (data) {
      setPreferences(data as UserPreferences);
    } else {
      const { data: created, error: createError } = await supabase
        .from('user_preferences')
        .insert({ user_id: user.id })
        .select()
        .maybeSingle();

      if (createError) {
        setError(createError.message);
      } else if (created) {
        setPreferences(created as UserPreferences);
      }
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchPreferences();
  }, [fetchPreferences]);

  const updatePreferences = useCallback(
    async (updates: Partial<UserPreferences>): Promise<boolean> => {
      if (!user) return false;

      setSaving(true);
      setSaveError('');
      setSaveSuccess(false);

      const { error: updateError } = await supabase
        .from('user_preferences')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      if (updateError) {
        setSaveError(updateError.message);
        setSaving(false);
        return false;
      }

      setPreferences((prev) => ({ ...prev, ...updates }));
      setSaveSuccess(true);
      setSaving(false);
      setTimeout(() => setSaveSuccess(false), 3000);
      return true;
    },
    [user]
  );

  return {
    preferences,
    loading,
    error,
    saving,
    saveError,
    saveSuccess,
    fetchPreferences,
    updatePreferences,
  };
}
