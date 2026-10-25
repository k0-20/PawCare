import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { type PreventiveCareTask, type PreventiveCareTaskFormData } from '@/types';
import { generateUpcomingCareNotification, generateOverdueCareNotification } from '@/lib/notifications';

export function usePreventiveCareTasks() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<PreventiveCareTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchTasks = useCallback(async () => {
    if (!user) {
      setTasks([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    const { data, error: fetchError } = await supabase
      .from('preventive_care_tasks')
      .select('*')
      .order('due_date', { ascending: true });

    if (fetchError) {
      setError(fetchError.message);
    } else {
      const fetchedTasks = (data as PreventiveCareTask[]) ?? [];
      setTasks(fetchedTasks);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const addTask = useCallback(
    async (formData: PreventiveCareTaskFormData): Promise<{ error: string | null }> => {
      if (!user) return { error: 'You must be signed in.' };

      const { data, error: insertError } = await supabase
        .from('preventive_care_tasks')
        .insert({
          pet_id: formData.pet_id,
          task_type: formData.task_type,
          title: formData.title.trim(),
          due_date: formData.due_date,
          source: formData.source,
          notes: formData.notes.trim() || null,
        })
        .select()
        .maybeSingle();

      if (insertError) return { error: insertError.message };

      if (data) {
        const newTask = data as PreventiveCareTask;
        setTasks((prev) => [...prev, newTask]);

        const { data: petData } = await supabase
          .from('pets')
          .select('name')
          .eq('id', formData.pet_id)
          .maybeSingle();

        const petName = (petData as { name: string } | null)?.name ?? 'your pet';

        const taskInfo = {
          petName,
          taskTitle: newTask.title,
          taskType: newTask.task_type,
          dueDate: newTask.due_date,
          petId: newTask.pet_id,
          userId: user.id,
        };

        await generateUpcomingCareNotification(taskInfo);
        await generateOverdueCareNotification(taskInfo);
      }

      return { error: null };
    },
    [user]
  );

  const completeTask = useCallback(
    async (taskId: string): Promise<{ error: string | null }> => {
      const today = new Date().toISOString().split('T')[0];

      const { data, error: updateError } = await supabase
        .from('preventive_care_tasks')
        .update({
          status: 'completed',
          completed_date: today,
          updated_at: new Date().toISOString(),
        })
        .eq('id', taskId)
        .select()
        .maybeSingle();

      if (updateError) return { error: updateError.message };

      if (data) {
        setTasks((prev) =>
          prev.map((t) => (t.id === taskId ? (data as PreventiveCareTask) : t))
        );
      }

      return { error: null };
    },
    []
  );

  const deleteTask = useCallback(
    async (taskId: string): Promise<{ error: string | null }> => {
      const { error: deleteError } = await supabase
        .from('preventive_care_tasks')
        .delete()
        .eq('id', taskId);

      if (deleteError) return { error: deleteError.message };

      setTasks((prev) => prev.filter((t) => t.id !== taskId));
      return { error: null };
    },
    []
  );

  const checkAndGenerateNotifications = useCallback(async () => {
    if (!user) return;

    for (const task of tasks) {
      if (task.status === 'completed') continue;

      const { data: petData } = await supabase
        .from('pets')
        .select('name')
        .eq('id', task.pet_id)
        .maybeSingle();

      const petName = (petData as { name: string } | null)?.name ?? 'your pet';

      const taskInfo = {
        petName,
        taskTitle: task.title,
        taskType: task.task_type,
        dueDate: task.due_date,
        petId: task.pet_id,
        userId: user.id,
      };

      await generateUpcomingCareNotification(taskInfo);
      await generateOverdueCareNotification(taskInfo);
    }
  }, [user, tasks]);

  return {
    tasks,
    loading,
    error,
    fetchTasks,
    addTask,
    completeTask,
    deleteTask,
    checkAndGenerateNotifications,
  };
}
